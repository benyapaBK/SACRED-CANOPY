/** Normalize announcement records from current and legacy admin forms. */
export type AnnouncementLike = {
  enabled?: boolean | string | number;
  active?: boolean | string | number;
  isActive?: boolean | string | number;
  published?: boolean | string | number;
  isPublished?: boolean | string | number;
  title?: string;
  name?: string;
  headline?: string;
  message?: string;
  description?: string;
  content?: string;
  body?: string;
  details?: string;
  text?: string;
  startAt?: unknown;
  endAt?: unknown;
  startDate?: unknown;
  endDate?: unknown;
  startsAt?: unknown;
  endsAt?: unknown;
  status?: string;
  kind?: string;
  type?: string;
  [key: string]: unknown;
};

function asEnabled(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (value === true || value === 1) return true;
  if (value === false || value === 0) return false;
  const normalized = String(value).trim().toLowerCase();
  if (['true', '1', 'yes', 'y', 'on', 'active', 'enabled', 'published'].includes(normalized)) return true;
  if (['false', '0', 'no', 'n', 'off', 'inactive', 'disabled', 'draft', 'unpublished'].includes(normalized)) return false;
  return undefined;
}

export function normalizeAnnouncement<T extends AnnouncementLike | null | undefined>(raw: T): (NonNullable<T> & AnnouncementLike) | null {
  if (!raw) return null;
  const item = raw as NonNullable<T> & AnnouncementLike;
  const title = String(item.title ?? item.name ?? item.headline ?? '').trim();
  const message = String(item.message ?? item.description ?? item.content ?? item.body ?? item.details ?? item.text ?? '').trim();
  const startAt = item.startAt ?? item.startDate ?? item.startsAt ?? null;
  const endAt = item.endAt ?? item.endDate ?? item.endsAt ?? null;
  const explicitEnabled = asEnabled(item.enabled) ?? asEnabled(item.isActive) ?? asEnabled(item.active) ?? asEnabled(item.isPublished) ?? asEnabled(item.published);
  const status = String(item.status ?? '').trim().toLowerCase();
  const enabled = explicitEnabled ?? ['published', 'active', 'maintenance', 'normal', 'announcement', 'event', 'enabled', 'scheduled'].includes(status);
  const rawKind = String(item.kind ?? item.type ?? '').trim().toLowerCase();
  const kind = rawKind || (status === 'maintenance' ? 'maintenance' : 'news');
  return { ...item, title, message, startAt, endAt, enabled, kind, showInBell: asEnabled(item.showInBell) ?? true, showInHelp: asEnabled(item.showInHelp) ?? true, showInBanner: asEnabled(item.showInBanner) ?? true };
}

/** Convert Firestore Timestamp, Date, epoch, or date string into milliseconds. */
export function announcementTime(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as { toDate?: unknown }).toDate === 'function') {
    const time = (value as { toDate: () => Date }).toDate().getTime();
    return Number.isFinite(time) ? time : null;
  }
  if (typeof value === 'object' && value !== null && 'seconds' in value) {
    const seconds = Number((value as { seconds: unknown }).seconds);
    return Number.isFinite(seconds) ? seconds * 1000 : null;
  }
  if (typeof value === 'number') {
    const milliseconds = value < 1_000_000_000_000 ? value * 1000 : value;
    return Number.isFinite(milliseconds) ? milliseconds : null;
  }
  const input = value instanceof Date ? value : new Date(String(value).trim());
  const time = input.getTime();
  return Number.isFinite(time) ? time : null;
}

/** Format a stored date/time for a datetime-local input without ever producing "[object Object]". */
export function toDateTimeLocalInput(value: unknown): string {
  const time = announcementTime(value);
  if (time === null) return '';
  const date = new Date(time);
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Store datetime-local values as ISO timestamps; blank dates remain unbounded. */
export function toAnnouncementStorageValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '';
  const time = announcementTime(value);
  return time === null ? '' : new Date(time).toISOString();
}

export function isAnnouncementActive(raw: AnnouncementLike | null | undefined, now = Date.now()): boolean {
  const item = normalizeAnnouncement(raw);
  if (!item || item.enabled !== true || !String(item.title || '').trim() || !String(item.message || '').trim()) return false;
  const start = announcementTime(item.startAt);
  const end = announcementTime(item.endAt);
  // A malformed legacy date should not silently hide a valid enabled announcement.
  return (start === null || start <= now) && (end === null || end >= now);
}

export function announcementKindLabel(kind?: string): string {
  switch (String(kind || '').toLowerCase()) {
    case 'maintenance': return 'แจ้งปรับปรุงระบบ';
    case 'new-plants':
    case 'new_plants':
    case 'newplants': return 'พรรณไม้ใหม่';
    case 'news': return 'ข่าวเว็บไซต์';
    default: return 'กิจกรรม';
  }
}
