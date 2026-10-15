import React, { useEffect, useState } from 'react';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { isAnnouncementActive, announcementKindLabel, normalizeAnnouncement, announcementTime } from '../utils/announcements';
import { 
  Menu, 
  X, 
  Heart, 
  ShieldCheck, 
  User, 
  LogOut, 
  Mail, 
  ChevronDown,
  Sparkles,
  LogIn,
  BellRing
} from 'lucide-react';
import { UserProfile } from '../types';

export type NavigationPage = 
  | 'home' 
  | 'database' 
  | 'categories' 
  | 'beliefs' 
  | 'quiz' 
  | 'favorites' 
  | 'history' 
  | 'articles' 
  | 'help' 
  | 'about' 
  | 'contact' 
  | 'admin' 
  | 'profile' 
  | 'detail';

interface HeaderProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  currentUser: UserProfile;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  favoritesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  currentUser,
  onOpenAuthModal,
  onLogout,
  favoritesCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [maintenanceNoticeItem, setMaintenanceNoticeItem] = useState<{ id: string; title: string; message: string; kind?: string } | null>(null);
  const [activityNoticeItems, setActivityNoticeItems] = useState<Array<{ id: string; title: string; message: string; kind?: string; createdAt?: unknown; updatedAt?: unknown }>>([]);
  const noticeItems = [...(maintenanceNoticeItem ? [maintenanceNoticeItem] : []), ...activityNoticeItems];
  useEffect(() => {
    const unsubNotice = onSnapshot(doc(db, 'siteSettings', 'maintenanceNotice'), (snapshot) => {
      const data = snapshot.exists() ? snapshot.data() : null;
      const normalized = normalizeAnnouncement(data ? { id: 'maintenanceNotice', ...data, kind: data.status === 'maintenance' ? 'maintenance' : 'news' } as any : null);
      setMaintenanceNoticeItem(normalized && isAnnouncementActive(normalized) && normalized.showInBell !== false
        ? { id: 'maintenanceNotice', title: normalized.title || 'ประกาศจากเว็บไซต์', message: normalized.message || '', kind: normalized.kind }
        : null);
    }, (error) => console.warn('Announcement listener failed', error));
    const unsubActivities = onSnapshot(collection(db, 'siteActivities'), (snapshot) => {
      const activities = snapshot.docs.map((entry) => normalizeAnnouncement({ id: entry.id, ...entry.data() } as any))
        .filter((item): item is NonNullable<typeof item> => Boolean(item) && isAnnouncementActive(item) && item.showInBell !== false)
        .map((item) => ({ id: String(item.id), title: item.title || 'ประกาศจากเว็บไซต์', message: item.message || '', kind: item.kind || 'activity', createdAt: item.createdAt, updatedAt: item.updatedAt }));
      activities.sort((a, b) => (announcementTime(b.createdAt) ?? announcementTime(b.updatedAt) ?? 0) - (announcementTime(a.createdAt) ?? announcementTime(a.updatedAt) ?? 0));
      setActivityNoticeItems(activities);
    }, (error) => console.warn('Activity notification listener failed', error));
    return () => { unsubNotice(); unsubActivities(); };
  }, []);

  const navLinks = [
    { id: 'database' as NavigationPage, label: 'ฐานข้อมูลไม้มงคล' },
    { id: 'categories' as NavigationPage, label: 'หมวดหมู่ 8 พรรณ' },
    { id: 'beliefs' as NavigationPage, label: 'คติความเชื่อ' },
    { id: 'quiz' as NavigationPage, label: 'ค้นหาต้นไม้ Quiz' },
    { id: 'articles' as NavigationPage, label: 'เกร็ดความรู้' },
    { id: 'help' as NavigationPage, label: 'ช่วยเหลือ Q&A' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#183D2B] text-[#FAF7F0] border-b border-[#C6A96B]/25 shadow-md">
      {/* Main Navigation Bar (Universal Top Bar Contract: Zone 1 - Zone 2 - Zone 3) */}
      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 xl:px-6 h-18 min-h-[76px] flex items-center justify-between gap-2 xl:gap-4">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 text-left group shrink-0 focus:outline-none"
        >
          {/* Logo Bodhi Icon */}
          <div className="w-10 h-10 rounded-lg bg-[#0F271B] border border-[#C6A96B]/50 flex items-center justify-center p-2 group-hover:border-[#C6A96B] transition-colors shadow-sm">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-[#C6A96B]">
              <path
                d="M12 2C8 2 4 6 4 11c0 5.25 5 10.5 8 11 3-.5 8-5.75 8-11 0-5-4-9-8-9zm0 17.5c-2.5-.7-6-5-6-8.5 0-3.5 2.5-6.5 6-6.5s6 3 6 6.5c0 3.5-3.5 7.8-6 8.5z"
                fill="#C6A96B"
              />
              <path d="M12 5v14" stroke="#FAF7F0" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M12 10l3-3M12 14l-3-3" stroke="#FAF7F0" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex min-w-0 flex-col justify-center leading-none">
            <div className="font-brand font-bold text-lg sm:text-xl tracking-wider text-[#FAF7F0] group-hover:text-[#C6A96B] transition-colors whitespace-nowrap">
              SACRED CANOPY
            </div>
            <div className="mt-1 text-[11px] leading-tight text-[#A8B89A] tracking-normal font-normal">
              ร่มโพธิ์ ร่มไทร · ร่มเงาแห่งสิริมงคล
            </div>
            <span className={`mt-1 text-[9px] leading-none tracking-[0.16em] uppercase ${currentPage === 'home' ? 'text-[#C6A96B] font-bold' : 'text-[#A8B89A]/80'}`}>
              Home
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden xl:flex items-center justify-center gap-1.5 2xl:gap-2.5 text-[13px] font-semibold min-w-0 flex-1 px-2">
          {navLinks.filter((item) => item.id !== 'history' || currentUser.role !== 'guest').map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`group/navlink relative whitespace-nowrap rounded-xl px-2.5 2xl:px-3 py-2 transition-all duration-200 ${
                  isActive
                    ? 'bg-[#C6A96B]/15 text-[#E4C77F] font-bold shadow-[inset_0_0_0_1px_rgba(198,169,107,0.28)]'
                    : 'text-[#FAF7F0]/90 hover:bg-white/[0.08] hover:text-[#E4C77F]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0.5 left-3 right-3 h-[2px] bg-[#C6A96B] rounded-full shadow-[0_0_8px_rgba(198,169,107,0.35)]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action & Utilities */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Favorites entry is visible to everyone; guests are prompted to sign in */}
          <button
            onClick={() => onNavigate('favorites')}
            className={`relative p-2 rounded-lg transition-colors ${
              currentPage === 'favorites'
                ? 'bg-[#0F271B] text-[#C6A96B]'
                : 'text-[#FAF7F0]/80 hover:text-white hover:bg-[#0F271B]/50'
            }`}
            title="ไม้มงคลของฉัน (รายการโปรด)"
          >
            <Heart className="w-5 h-5" fill={favoritesCount > 0 ? '#C6A96B' : 'none'} stroke={favoritesCount > 0 ? '#C6A96B' : 'currentColor'} />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C6A96B] text-[#0F271B] text-[10px] font-bold flex items-center justify-center">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Live announcements bell */}
          <div className="relative">
            <button onClick={() => setNotificationOpen((value) => !value)} aria-label="การแจ้งเตือนจากเว็บไซต์" aria-expanded={notificationOpen}
              className="relative rounded-lg p-2 text-[#FAF7F0]/85 hover:bg-[#0F271B] transition-colors">
              <BellRing className="h-5 w-5" />
              {noticeItems.length > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C6A96B] px-1 text-[9px] font-bold text-[#0F271B]">{noticeItems.length}</span>}
            </button>
            {notificationOpen && <div className="absolute right-0 top-full z-[70] mt-2 w-[min(340px,calc(100vw-24px))] rounded-2xl border border-[#C6A96B]/35 bg-[#FAF7F0] p-3 text-[#183D2B] shadow-2xl">
              <div className="mb-2 flex items-center justify-between border-b border-[#E8E0D2] pb-2"><strong className="text-sm">ประกาศและกิจกรรม</strong><button onClick={() => setNotificationOpen(false)} aria-label="ปิดการแจ้งเตือน"><X className="h-4 w-4" /></button></div>
              {noticeItems.length === 0 ? <p className="py-4 text-center text-xs text-[#7A746B]">ยังไม่มีประกาศใหม่ครับ 🌱</p> : <div className="max-h-72 space-y-2 overflow-y-auto">{noticeItems.map((item) => <div key={item.id} className="rounded-xl border border-[#E8E0D2] bg-white p-3"><div className="text-xs font-bold">{item.title}</div><span className="mt-1 inline-block text-[9px] font-bold text-[#A48545]">{announcementKindLabel(item.kind)}</span><p className="mt-1 whitespace-pre-wrap text-[11px] leading-relaxed text-[#5E5A51]">{item.message}</p></div>)}</div>}
              <button onClick={() => { setNotificationOpen(false); onNavigate('help'); }} className="mt-2 w-full rounded-lg bg-[#183D2B] px-3 py-2 text-xs font-semibold text-white">อ่านประกาศทั้งหมด</button>
            </div>}
          </div>

          {/* Contact Us Direct Link */}
          <button
            onClick={() => onNavigate('contact')}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#C6A96B]/40 hover:border-[#C6A96B] transition-colors ${
              currentPage === 'contact' ? 'bg-[#C6A96B] text-[#0F271B]' : 'text-[#FAF7F0]'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>ติดต่อเรา</span>
          </button>

          {/* Admin Dashboard Direct Entry (Visible only when user is logged in as Admin) */}
          {currentUser.role === 'admin' && (
            <button
              onClick={() => onNavigate('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                currentPage === 'admin'
                  ? 'bg-[#C6A96B] text-[#0F271B] font-bold shadow-sm'
                  : 'bg-[#0F271B] text-[#C6A96B] hover:bg-[#25523B]'
              }`}
              title="แผงควบคุมผู้ดูแลระบบ"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden md:inline">ระบบแอดมิน</span>
            </button>
          )}

          {/* User Account / Profile Button */}
          <div className="relative">
            {currentUser.role === 'guest' ? (
              <button
                onClick={onOpenAuthModal}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#C6A96B] text-[#0F271B] hover:bg-[#DFC488] transition-all whitespace-nowrap shadow-sm flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>เข้าสู่ระบบ</span>
              </button>
            ) : (
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[#0F271B] text-[#FAF7F0] transition-colors border border-white/10"
              >
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.displayName}
                    className="w-7 h-7 rounded-full object-cover border border-[#C6A96B]"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#C6A96B] text-[#0F271B] font-bold flex items-center justify-center text-xs">
                    {currentUser.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="text-left hidden md:block">
                  <div className="text-xs font-semibold leading-tight max-w-[110px] truncate">
                    {currentUser.displayName}
                  </div>
                  <div className="text-[10px] text-[#C6A96B] font-mono leading-tight flex items-center gap-1">
                    {currentUser.role === 'admin' ? (
                      <span className="text-[#FFD54F] font-bold">Admin</span>
                    ) : (
                      <span>สมาชิก</span>
                    )}
                    {currentUser.authProvider === 'google' && (
                      <span className="text-[9px] bg-white/20 px-1 rounded">Google</span>
                    )}
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-[#A8B89A]" />
              </button>
            )}

            {/* Profile Dropdown */}
            {userDropdownOpen && currentUser.role !== 'guest' && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#0F271B] border border-[#C6A96B]/30 shadow-2xl py-2 z-50 animate-in fade-in">
                <div className="px-4 py-2.5 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-white truncate">{currentUser.displayName}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                      currentUser.role === 'admin' ? 'bg-[#C6A96B] text-[#0F271B]' : 'bg-[#183D2B] text-[#A8B89A]'
                    }`}>
                      {currentUser.role === 'admin' ? 'ผู้ดูแลระบบ' : 'สมาชิก'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A8B89A] truncate mt-0.5">{currentUser.email}</p>
                  {currentUser.authProvider === 'google' && (
                    <div className="mt-1 text-[10px] text-[#DFC488] flex items-center gap-1">
                      <span>✓ เชื่อมต่อบัญชี Google</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    onNavigate('profile');
                  }}
                  className="w-full px-4 py-2.5 text-left text-xs text-[#FAF7F0] hover:bg-[#183D2B] flex items-center gap-2.5 transition-colors"
                >
                  <User className="w-4 h-4 text-[#C6A96B]" />
                  <span>โปรไฟล์และความปลอดภัย</span>
                </button>

                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    onNavigate('favorites');
                  }}
                  className="w-full px-4 py-2.5 text-left text-xs text-[#FAF7F0] hover:bg-[#183D2B] flex items-center gap-2.5 transition-colors"
                >
                  <Heart className="w-4 h-4 text-[#C6A96B]" />
                  <span>ไม้มงคลของฉัน ({favoritesCount} รายการ)</span>
                </button>

                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    onNavigate('history');
                  }}
                  className="w-full px-4 py-2.5 text-left text-xs text-[#FAF7F0] hover:bg-[#183D2B] flex items-center gap-2.5 transition-colors"
                >
                  <User className="w-4 h-4 text-[#C6A96B]" />
                  <span>ประวัติพรรณไม้ที่เข้าชม</span>
                </button>

                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onNavigate('admin');
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs text-[#C6A96B] hover:bg-[#183D2B] flex items-center gap-2.5 transition-colors font-medium"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>แผงควบคุมระบบ (Admin Console)</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    onLogout();
                  }}
                  className="w-full px-4 py-2.5 text-left text-xs text-[#E57373] hover:bg-[#183D2B] flex items-center gap-2.5 border-t border-white/10 mt-1 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>ออกจากระบบ</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-lg text-[#FAF7F0] hover:bg-[#0F271B]"
            aria-label="เมนูนำทาง"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="2xl:hidden bg-[#0F271B] border-t border-[#C6A96B]/20 px-4 py-4 space-y-2 animate-in fade-in">
          {navLinks.filter((item) => item.id !== 'history' || currentUser.role !== 'guest').map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                currentPage === item.id
                  ? 'bg-[#183D2B] text-[#C6A96B] font-semibold'
                  : 'text-[#FAF7F0] hover:bg-[#183D2B]'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
            {currentUser.role !== 'guest' && <button
              onClick={() => {
                onNavigate('about');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm text-[#FAF7F0] hover:bg-[#183D2B] rounded-md"
            >
              เกี่ยวกับเรา
            </button>}
            {currentUser.role !== 'guest' && <button
              onClick={() => {
                onNavigate('contact');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm text-[#C6A96B] hover:bg-[#183D2B] rounded-md font-medium"
            >
              ติดต่อเรา (Contact Us)
            </button>}
            {currentUser.role === 'admin' && (
              <button
                onClick={() => {
                  onNavigate('admin');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-[#DFC488] font-bold hover:bg-[#183D2B] rounded-md"
              >
                ระบบแอดมิน (Admin)
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
