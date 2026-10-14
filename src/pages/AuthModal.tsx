import React, { useState } from 'react';
import { store } from '../services/store';
import { UserProfile } from '../types';
import { X, Lock, Mail, User, ShieldCheck, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [adminEntryOpen, setAdminEntryOpen] = useState(false);
  const [adminGatePassed, setAdminGatePassed] = useState(false);
  const [adminCode, setAdminCode] = useState('');

  if (!isOpen) return null;

  const closeModal = () => {
    setAdminEntryOpen(false);
    setAdminGatePassed(false);
    setAdminCode('');
    setMessage('');
    setErrorMessage('');
    onClose();
  };

  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setMessage('');
    if (!email.trim() || !email.includes('@')) { setErrorMessage('กรุณาระบุอีเมลที่ถูกต้อง'); return; }

    if (mode === 'register') {
      if (!displayName.trim()) { setErrorMessage('กรุณาระบุชื่อ-นามสกุลของคุณ'); return; }
      if (password.length < 6) { setErrorMessage('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร'); return; }
      if (password !== confirmPassword) { setErrorMessage('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน'); return; }
      if (!agreeTerms) { setErrorMessage('กรุณายอมรับข้อกำหนดการใช้งานและนโยบายความเป็นส่วนตัว'); return; }
      setIsLoading(true);
      const res = await store.registerUser(displayName, email, password);
      setIsLoading(false);
      if (res.success && res.user) { onSuccess(res.user); closeModal(); }
      else setErrorMessage(res.error || 'สมัครสมาชิกไม่สำเร็จ');
      return;
    }

    if (mode === 'login') {
      if (!password.trim()) { setErrorMessage('กรุณาระบุรหัสผ่าน'); return; }
      setIsLoading(true);
      const res = await store.loginUser(email, password);
      setIsLoading(false);
      if (res.success && res.user) {
        if (adminGatePassed && res.user.role !== 'admin') {
          await store.logout();
          setErrorMessage('บัญชีนี้ไม่มีสิทธิ์แอดมิน กรุณาใช้บัญชี Firebase ที่ได้รับสิทธิ์ผู้ดูแลระบบ');
          return;
        }
        onSuccess(res.user);
        closeModal();
      } else setErrorMessage(res.error || 'เข้าสู่ระบบไม่สำเร็จ');
      return;
    }

    setIsLoading(true);
    const res = await store.sendPasswordReset(email);
    setIsLoading(false);
    if (res.success) setMessage('ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว โปรดตรวจสอบอีเมลของคุณ');
    else setErrorMessage(res.error || 'ส่งลิงก์รีเซ็ตรหัสผ่านไม่สำเร็จ');
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage('');
    const res = await store.loginWithFirebaseGoogle();
    setIsLoading(false);
    if (res.success && res.user) {
      if (adminGatePassed && res.user.role !== 'admin') {
        await store.logout();
        setErrorMessage('บัญชีนี้ไม่มีสิทธิ์แอดมิน กรุณาใช้บัญชี Firebase ที่ได้รับสิทธิ์ผู้ดูแลระบบ');
        return;
      }
      onSuccess(res.user);
      closeModal();
    } else setErrorMessage(res.error || 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#C6A96B]/40 overflow-hidden font-body animate-in fade-in duration-200">
        {/* Header */}
        <div className="bg-[#183D2B] text-white p-6 border-b border-[#C6A96B]/30 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-[#C6A96B] font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SACRED CANOPY ACCOUNT</span>
            </div>
            <h3 className="text-lg font-display font-bold text-white mt-1">
              {mode === 'login' && 'เข้าสู่ระบบ'}
              {mode === 'register' && 'สมัครสมาชิกใหม่'}
              {mode === 'forgot' && 'รีเซ็ตรหัสผ่าน'}
            </h3>
            <p className="text-xs text-[#A8B89A] mt-0.5">
              {mode === 'login' && 'เข้าถึงไม้มงคลของฉันและรับคำแนะนำเฉพาะคุณ'}
              {mode === 'register' && 'สร้างบัญชีเพื่อบันทึกและจัดการพรรณไม้มงคล'}
              {mode === 'forgot' && 'กรอกอีเมลเพื่อรับลิงก์รีเซ็ตรหัสผ่าน'}
            </p>
          </div>
          <button
            onClick={closeModal}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {/* Notification Messages */}
          {errorMessage && (
            <div className="p-3 bg-[#FFEBEE] border border-[#FFCDD2] text-[#C62828] rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {message && (
            <div className="p-3 bg-[#E8F5E9] border border-[#C8E6C9] text-[#2E7D32] rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {/* Google Sign-in Option (Only on login or register) */}
          {mode !== 'forgot' && !adminEntryOpen && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full py-2.5 px-4 bg-white border border-[#B8BCC2] hover:border-[#183D2B] text-[#292B29] rounded-xl text-xs font-semibold flex items-center justify-center gap-3 transition-all shadow-sm hover:bg-[#FAF7F0]"
              >
                {/* Official Google G Logo */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>เข้าสู่ระบบด้วย Google</span>
              </button>


            </div>
          )}

          {/* Email / Password Form */}
          {(!adminEntryOpen || adminGatePassed) && <form onSubmit={handleEmailAuthSubmit} className="space-y-3 text-xs">
            {mode === 'register' && (
              <div className="space-y-1">
                <label className="font-semibold text-[#183D2B] block">
                  ชื่อ - นามสกุล <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#7A746B] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="เช่น ศิริลักษณ์ บุญมงคล"
                    className="w-full pl-9 pr-3 py-2 border border-[#EEE7DA] rounded-lg focus:border-[#C6A96B] focus:outline-none"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="font-semibold text-[#183D2B] block">
                อีเมล <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#7A746B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 border border-[#EEE7DA] rounded-lg focus:border-[#C6A96B] focus:outline-none"
                  required
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div className="space-y-1">
                <label className="font-semibold text-[#183D2B] block">
                  รหัสผ่าน <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#7A746B] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="รหัสผ่านอย่างน้อย 6 ตัวอักษร"
                    className="w-full pl-9 pr-3 py-2 border border-[#EEE7DA] rounded-lg focus:border-[#C6A96B] focus:outline-none"
                    required
                  />
                </div>
              </div>
            )}

            {mode === 'register' && (
              <>
                <div className="space-y-1">
                  <label className="font-semibold text-[#183D2B] block">
                    ยืนยันรหัสผ่าน <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#7A746B] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="พิมพ์รหัสผ่านอีกครั้ง"
                      className="w-full pl-9 pr-3 py-2 border border-[#EEE7DA] rounded-lg focus:border-[#C6A96B] focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <label className="flex items-start gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 rounded text-[#183D2B] focus:ring-[#C6A96B]"
                    />
                    <span className="text-[11px] text-[#49382C] leading-snug">
                      ข้าพเจ้ายอมรับข้อกำหนดการใช้งานและนโยบายความเป็นส่วนตัวของ SACRED CANOPY
                    </span>
                  </label>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-[#183D2B] hover:bg-[#25523B] text-white rounded-xl font-bold transition-all shadow-sm disabled:opacity-50 mt-2 text-xs"
            >
              {isLoading ? (
                'กำลังดำเนินการ...'
              ) : mode === 'login' ? (
                'เข้าสู่ระบบ'
              ) : mode === 'register' ? (
                'สมัครสมาชิก'
              ) : (
                'ส่งคำขอรีเซ็ตรหัสผ่าน'
              )}
            </button>
          </form>}

          {adminEntryOpen && !adminGatePassed && (
            <form onSubmit={(e) => {
              e.preventDefault();
              setErrorMessage('');
              if (adminCode === 'admin123456') {
                setAdminGatePassed(true);
                setEmail('admin@gmail.com');
                setMessage('กรุณาเข้าสู่ระบบด้วยบัญชี Firebase admin@gmail.com ที่ได้รับ Custom Claim admin แล้ว');
              } else {
                setErrorMessage('รหัสเข้าโหมดแอดมินไม่ถูกต้อง');
              }
            }} className="space-y-3">
              <label className="block text-xs font-semibold text-[#183D2B]">รหัสเข้าโหมดแอดมิน</label>
              <input type="password" value={adminCode} onChange={(e) => setAdminCode(e.target.value)} placeholder="กรอกรหัสผู้ดูแลระบบ" className="w-full px-3 py-2.5 border border-[#EEE7DA] rounded-lg focus:border-[#C6A96B] focus:outline-none" autoComplete="off" required />
              <button type="submit" className="w-full py-2.5 bg-[#183D2B] text-white rounded-xl font-bold text-xs">ดำเนินการต่อ</button>
              <p className="text-[10px] leading-relaxed text-[#7A746B]">รหัสนี้เป็นเพียงขั้นตอนเปิดหน้าล็อกอิน ไม่ได้ให้สิทธิ์แอดมินด้วยตัวเอง สิทธิ์จริงตรวจสอบจาก Firebase Custom Claims</p>
            </form>
          )}

          {/* Mode Switchers */}
          {!adminEntryOpen && <div className="pt-3 border-t border-[#EEE7DA] flex items-center justify-between text-[11px] text-[#7A746B]">
            {mode === 'login' ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setErrorMessage('');
                  }}
                  className="hover:text-[#183D2B] hover:underline"
                >
                  ลืมรหัสผ่าน?
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage('');
                  }}
                  className="text-[#A48545] font-bold hover:underline"
                >
                  ยังไม่มีบัญชี? สมัครสมาชิก
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage('');
                }}
                className="text-[#A48545] font-bold hover:underline w-full text-center"
              >
                มีบัญชีอยู่แล้ว? เข้าสู่ระบบที่นี่
              </button>
            )}
          </div>}
          {adminEntryOpen && adminGatePassed && (
            <button type="button" onClick={() => { setAdminEntryOpen(false); setAdminGatePassed(false); setAdminCode(''); setMessage(''); setErrorMessage(''); }} className="w-full text-[10px] text-[#7A746B] hover:text-[#183D2B]">กลับไปหน้าเข้าสู่ระบบสมาชิก</button>
          )}
          {!adminEntryOpen && (
            <div className="pt-1 text-center">
              <button type="button" onClick={() => { setAdminEntryOpen(true); setAdminGatePassed(false); setAdminCode(''); setMode('login'); setMessage(''); setErrorMessage(''); }} className="text-[10px] text-[#A8A092] hover:text-[#A48545] transition-colors">สำหรับผู้ดูแลระบบ</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
