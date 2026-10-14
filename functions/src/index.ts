import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

initializeApp();
const db = getFirestore();

function requireAdmin(request: { auth?: { uid: string; token: Record<string, unknown> } | null }): string {
  if (!request.auth || request.auth.token.admin !== true) {
    throw new HttpsError('permission-denied', 'ต้องใช้บัญชีผู้ดูแลระบบที่ได้รับสิทธิ์จาก Custom Claims');
  }
  return request.auth.uid;
}

export const setUserRole = onCall(async (request) => {
  const actorUid = requireAdmin(request);
  const uid = String(request.data?.uid || '');
  const role = request.data?.role;
  if (!uid || !['admin', 'member'].includes(role)) throw new HttpsError('invalid-argument', 'ข้อมูล uid หรือ role ไม่ถูกต้อง');
  if (uid === actorUid && role !== 'admin') throw new HttpsError('failed-precondition', 'ไม่อนุญาตให้ลดสิทธิ์บัญชีตัวเอง');
  const target = await getAuth().getUser(uid);
  await getAuth().setCustomUserClaims(uid, { ...target.customClaims, admin: role === 'admin' });
  await db.doc(`users/${uid}`).set({ role, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  await db.collection('auditLogs').add({ actorUid, action: 'SET_USER_ROLE', entityType: 'user', entityId: uid, summary: `Changed role to ${role}`, createdAt: FieldValue.serverTimestamp() });
  return { success: true };
});

export const setUserStatus = onCall(async (request) => {
  const actorUid = requireAdmin(request);
  const uid = String(request.data?.uid || '');
  const status = request.data?.status;
  if (!uid || !['active', 'suspended'].includes(status)) throw new HttpsError('invalid-argument', 'ข้อมูล uid หรือ status ไม่ถูกต้อง');
  await db.doc(`users/${uid}`).set({ status, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  if (status === 'suspended') await getAuth().updateUser(uid, { disabled: true });
  else await getAuth().updateUser(uid, { disabled: false });
  await db.collection('auditLogs').add({ actorUid, action: 'SET_USER_STATUS', entityType: 'user', entityId: uid, summary: `Changed status to ${status}`, createdAt: FieldValue.serverTimestamp() });
  return { success: true };
});

export const deleteMemberProfile = onCall(async (request) => {
  const actorUid = requireAdmin(request);
  const uid = String(request.data?.uid || '');
  if (!uid || uid === actorUid) throw new HttpsError('invalid-argument', 'ไม่สามารถลบบัญชีนี้ได้');
  await db.doc(`users/${uid}`).delete();
  await getAuth().deleteUser(uid);
  await db.collection('auditLogs').add({ actorUid, action: 'DELETE_MEMBER', entityType: 'user', entityId: uid, summary: 'Deleted member account', createdAt: FieldValue.serverTimestamp() });
  return { success: true };
});
