import React, { useState } from 'react';
import { EmailAuthProvider, reauthenticateWithCredential, reauthenticateWithPopup, updateEmail, updatePassword, updateProfile } from 'firebase/auth';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../services/firebase';
import { store } from '../services/store';
import { UserProfile } from '../types';
import { Camera, LockKeyhole, Mail, Save, ShieldCheck, UserRound } from 'lucide-react';

export const ProfilePage: React.FC<{ currentUser: UserProfile }> = ({ currentUser }) => {
  const [displayName, setDisplayName] = useState(currentUser.displayName || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [feedback, setFeedback] = useState('');
  const [busy, setBusy] = useState(false);

  const reauthenticate = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('กรุณาเข้าสู่ระบบใหม่');
    if (user.providerData.some((provider) => provider.providerId === 'google.com')) {
      await reauthenticateWithPopup(user, googleProvider);
    } else {
      if (!currentPassword) throw new Error('กรุณากรอกรหัสผ่านปัจจุบันเพื่อยืนยันตัวตน');
      if (!user.email) throw new Error('ไม่พบอีเมลบัญชี');
      await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, currentPassword));
    }
  };

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    const user = auth.currentUser;
    if (!user) { setFeedback('กรุณาเข้าสู่ระบบใหม่'); return; }
    setBusy(true); setFeedback('');
    try {
      if (displayName.trim().length < 2) throw new Error('ชื่อที่แสดงต้องมีอย่างน้อย 2 ตัวอักษร');
      if (email.trim().toLowerCase() !== (user.email || '').toLowerCase()) {
        await reauthenticate();
        await updateEmail(user, email.trim());
        await user.getIdToken(true);
      }
      await updateProfile(user, { displayName: displayName.trim(), photoURL: avatarUrl.trim().startsWith('data:') ? (user.photoURL || null) : (avatarUrl.trim() || null) });
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: displayName.trim(),
        email: user.email || email.trim(),
        avatarUrl: avatarUrl.trim(),
        updatedAt: serverTimestamp(),
      });
      store.setUser({ ...currentUser, displayName: displayName.trim(), email: user.email || email.trim(), avatarUrl: avatarUrl.trim() });
      setFeedback('บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'บันทึกโปรไฟล์ไม่สำเร็จ');
    } finally { setBusy(false); }
  };

  const changePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    const user = auth.currentUser;
    if (!user) { setFeedback('กรุณาเข้าสู่ระบบใหม่'); return; }
    if (newPassword.length < 6) { setFeedback('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร'); return; }
    setBusy(true); setFeedback('');
    try {
      await reauthenticate();
      await updatePassword(user, newPassword);
      setCurrentPassword(''); setNewPassword('');
      setFeedback('เปลี่ยนรหัสผ่านเรียบร้อยแล้ว');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'เปลี่ยนรหัสผ่านไม่สำเร็จ');
    } finally { setBusy(false); }
  };

  const handleAvatarFile = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setFeedback('กรุณาเลือกไฟล์รูปภาพ'); return; }
    if (file.size > 100 * 1024) { setFeedback('ไฟล์ภาพต้องไม่เกิน 100 KB เมื่อไม่ได้ใช้ Firebase Storage หรือให้ใส่ URL ภาพแทน'); return; }
    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  return <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 font-body">
    <header className="rounded-2xl bg-[#183D2B] text-white p-6 sm:p-8">
      <div className="flex items-center gap-4">
        {avatarUrl ? <img src={avatarUrl} alt="รูปโปรไฟล์" className="w-20 h-20 rounded-full object-cover border-2 border-[#C6A96B]" /> : <div className="w-20 h-20 rounded-full bg-[#C6A96B] text-[#183D2B] flex items-center justify-center text-3xl font-bold">{(displayName || '?').slice(0,1)}</div>}
        <div><p className="text-xs text-[#C6A96B] uppercase tracking-widest">SACRED CANOPY ACCOUNT</p><h1 className="text-2xl font-bold mt-1">โปรไฟล์ของฉัน</h1><p className="text-xs text-[#A8B89A] mt-1">{currentUser.role === 'admin' ? 'ผู้ดูแลระบบ' : 'สมาชิก'} · {currentUser.email}</p></div>
      </div>
    </header>
    {feedback && <div role="status" className="rounded-xl border border-[#C6A96B]/40 bg-white p-3 text-sm text-[#183D2B]">{feedback}</div>}
    <form onSubmit={saveProfile} className="rounded-2xl bg-white border border-[#EEE7DA] p-5 sm:p-7 space-y-4 shadow-sm">
      <h2 className="font-bold text-[#183D2B] flex items-center gap-2"><UserRound className="w-5 h-5" />ข้อมูลส่วนตัว</h2>
      <label className="block text-xs font-semibold text-[#49382C]">ชื่อที่แสดง<input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="mt-1 w-full rounded-lg border border-[#EEE7DA] p-3 font-normal" required /></label>
      <label className="block text-xs font-semibold text-[#49382C]">อีเมลบัญชี<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-[#EEE7DA] p-3 font-normal" required /></label>
      <label className="block text-xs font-semibold text-[#49382C]">URL รูปโปรไฟล์<input value={avatarUrl.startsWith('data:') ? '' : avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://example.com/avatar.jpg" className="mt-1 w-full rounded-lg border border-[#EEE7DA] p-3 font-normal" /></label>
      <label className="block text-xs font-semibold text-[#49382C]"><Camera className="w-4 h-4 inline mr-1" />หรืออัปโหลดรูปขนาดไม่เกิน 100 KB<input type="file" accept="image/*" onChange={(e) => handleAvatarFile(e.target.files?.[0])} className="mt-1 block w-full text-xs" /></label>
      <p className="text-[11px] text-[#7A746B]">การเปลี่ยนอีเมลต้องยืนยันตัวตนใหม่ หากใช้บัญชีอีเมล/รหัสผ่านให้กรอกรหัสผ่านปัจจุบันในช่องด้านล่าง หากใช้ Google จะมีหน้าต่างให้ยืนยันบัญชี Google</p>
      <label className="block text-xs font-semibold text-[#49382C]">รหัสผ่านปัจจุบัน (ใช้ยืนยันเมื่อเปลี่ยนอีเมล)<input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-[#EEE7DA] p-3 font-normal" autoComplete="current-password" /></label>
      <button disabled={busy} className="px-5 py-2.5 rounded-lg bg-[#183D2B] text-white text-xs font-bold disabled:opacity-50"><Save className="w-4 h-4 inline mr-1" />{busy ? 'กำลังบันทึก…' : 'บันทึกโปรไฟล์'}</button>
    </form>
    <form onSubmit={changePassword} className="rounded-2xl bg-white border border-[#EEE7DA] p-5 sm:p-7 space-y-4 shadow-sm">
      <h2 className="font-bold text-[#183D2B] flex items-center gap-2"><LockKeyhole className="w-5 h-5" />เปลี่ยนรหัสผ่าน</h2>
      {currentUser.authProvider === 'google' && <p className="text-xs text-[#7A746B]">บัญชีนี้เข้าสู่ระบบผ่าน Google หากต้องการรหัสผ่านสำหรับเว็บ ให้เพิ่มวิธีเข้าสู่ระบบด้วยอีเมลและรหัสผ่านก่อน</p>}
      <label className="block text-xs font-semibold text-[#49382C]">รหัสผ่านใหม่<input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6} className="mt-1 w-full rounded-lg border border-[#EEE7DA] p-3 font-normal" autoComplete="new-password" required /></label>
      <button disabled={busy || currentUser.authProvider === 'google'} className="px-5 py-2.5 rounded-lg border border-[#C6A96B] text-[#183D2B] text-xs font-bold disabled:opacity-50"><ShieldCheck className="w-4 h-4 inline mr-1" />เปลี่ยนรหัสผ่าน</button>
    </form>
    <p className="text-[11px] text-[#7A746B]"><Mail className="w-3.5 h-3.5 inline mr-1" />ข้อมูลอีเมลและโปรไฟล์จะบันทึกลง Firebase Authentication และ Firestore โดยไม่ใช้ Firebase Storage</p>
  </div>;
};
