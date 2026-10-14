import React, { useState } from 'react';
import { store } from '../services/store';
import { ContactMessage } from '../types';
import { 
  ChevronRight, 
  Mail, 
  Send, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  Clock, 
  PhoneCall, 
  MessageSquare,
  ShieldCheck
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<ContactMessage['category']>('สอบถามทั่วไป');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validation
    if (!name.trim()) {
      setErrorMessage('กรุณาระบุชื่อ-นามสกุลของคุณ');
      return;
    }
    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setErrorMessage('กรุณาระบุอีเมลที่ถูกต้องสำหรับการติดต่อกลับ');
      return;
    }
    if (!subject.trim()) {
      setErrorMessage('กรุณาระบุหัวข้อเรื่องที่ต้องการติดต่อ');
      return;
    }
    if (!message.trim() || message.trim().length < 10) {
      setErrorMessage('กรุณาระบุรายละเอียดข้อความอย่างน้อย 10 ตัวอักษร');
      return;
    }
    if (!agreePrivacy) {
      setErrorMessage('กรุณากดยอมรับนโยบายความเป็นส่วนตัวเพื่อดำเนินการต่อ');
      return;
    }

    setIsLoading(true);

    // Simulate async submission to Firestore collection `contactMessages`
    setTimeout(() => {
      try {
        store.submitContactMessage({
          name: name.trim(),
          email: email.trim(),
          category,
          subject: subject.trim(),
          message: message.trim(),
        });
        setIsLoading(false);
        setIsSuccess(true);
      } catch (err) {
        setIsLoading(false);
        setErrorMessage('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
      }
    }, 600);
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setCategory('สอบถามทั่วไป');
    setSubject('');
    setMessage('');
    setAgreePrivacy(false);
    setErrorMessage('');
    setIsSuccess(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 font-body">
      {/* Breadcrumb & Title */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-[#7A746B]">
          <span>หน้าหลัก</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-[#183D2B]">ติดต่อเรา</span>
        </div>
        <h1 className="text-3xl font-display font-bold text-[#183D2B]">
          ติดต่อ SACRED CANOPY (ร่มโพธิ์ ร่มไทร)
        </h1>
        <p className="text-xs text-[#7A746B]">
          ร่วมแบ่งปันองค์ความรู้ เสนอแนะไม้มงคลเพิ่มเติม หรือแจ้งข้อผิดพลาดของข้อมูล
        </p>
      </div>

      {/* 2-Column Desktop Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Welcome message & Channel Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#183D2B] text-white p-6 sm:p-8 rounded-2xl border border-[#C6A96B]/30 space-y-6 shadow-md">
            <div className="space-y-2">
              <span className="text-xs text-[#C6A96B] font-semibold uppercase tracking-wider">
                ช่องทางการสื่อสารอย่างเป็นทางการ
              </span>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
                ยินดีรับฟังทุกข้อเสนอแนะ
              </h2>
              <p className="text-xs text-[#A8B89A] leading-relaxed">
                เราให้ความสำคัญกับความถูกต้องของสารสนเทศพฤกษศาสตร์ หากท่านเป็นนักพฤกษศาสตร์ ผู้ทรงคุณวุฒิ หรือผู้รักต้นไม้ ยินดีต้อนรับการมีส่วนร่วมในทุกมิติ
              </p>
            </div>

            <div className="space-y-4 text-xs pt-2 border-t border-white/10">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#C6A96B] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">อีเมลติดต่อฝ่ายบรรณาธิการ:</span>
                  <span className="text-[#FAF7F0]/80">contact@sacredcanopy.org</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#C6A96B] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">เวลาทำการตอบกลับข้อมูล:</span>
                  <span className="text-[#FAF7F0]/80">วันจันทร์ – ศุกร์ (09:00 – 17:00 น.)</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-[#C6A96B] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">การคุ้มครองข้อมูลส่วนบุคคล:</span>
                  <span className="text-[#FAF7F0]/80">ข้อมูลของท่านจะถูกจัดเก็บเป็นความลับและเข้าถึงได้เฉพาะผู้ดูแลระบบที่ได้รับอนุญาต</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#EEE7DA] p-6 sm:p-8 shadow-sm">
          {isSuccess ? (
            /* Success State */
            <div className="py-10 text-center space-y-4 animate-in fade-in">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-[#183D2B]">
                บันทึกข้อความของท่านเรียบร้อยแล้ว
              </h2>
              <p className="text-xs text-[#7A746B] max-w-md mx-auto leading-relaxed">
                ขอขอบพระคุณสำหรับข้อมูลและการติดต่อ ข้อความของท่านถูกบันทึกลงสู่ระบบเรียบร้อยแล้ว ทีมงานผู้ดูแลจะตรวจสอบและตอบกลับทางอีเมลโดยเร็วที่สุด
              </p>
              <button
                onClick={handleReset}
                className="px-5 py-2.5 bg-[#183D2B] text-white rounded-xl text-xs font-semibold hover:bg-[#25523B] transition-colors"
              >
                ส่งข้อความเพิ่มเติม
              </button>
            </div>
          ) : (
            /* Contact Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="border-b border-[#EEE7DA] pb-3">
                <h3 className="text-base font-bold text-[#183D2B]">
                  แบบฟอร์มส่งข้อความติดต่อ
                </h3>
                <p className="text-xs text-[#7A746B] mt-0.5">
                  กรอกข้อมูลให้ครบถ้วนเพื่อความรวดเร็วในการประสานงาน
                </p>
              </div>

              {/* Error Message banner */}
              {errorMessage && (
                <div className="p-3 rounded-lg bg-[#FFEBEE] border border-[#FFCDD2] text-xs text-[#C62828] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Name & Email Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#183D2B] block">
                    ชื่อ - นามสกุล <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="เช่น ศิริพร พฤกษาเกษตร"
                    className="w-full text-xs p-2.5 rounded-lg border border-[#EEE7DA] focus:border-[#C6A96B] focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#183D2B] block">
                    อีเมลสำหรับติดต่อกลับ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full text-xs p-2.5 rounded-lg border border-[#EEE7DA] focus:border-[#C6A96B] focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Category Select */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#183D2B] block">
                  ประเภทเรื่องที่ติดต่อ <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#EEE7DA] focus:border-[#C6A96B] focus:outline-none bg-white"
                >
                  <option value="แจ้งข้อมูลต้นไม้ผิดพลาด">แจ้งข้อมูลต้นไม้ผิดพลาด / คลาดเคลื่อน</option>
                  <option value="เสนอเพิ่มข้อมูลต้นไม้">เสนอเพิ่มข้อมูลไม้มงคลใหม่</option>
                  <option value="สอบถามเกี่ยวกับฐานข้อมูล">สอบถามเกี่ยวกับฐานข้อมูล / พฤกษศาสตร์</option>
                  <option value="แจ้งปัญหาการใช้งาน">แจ้งปัญหาการใช้งานเว็บไซต์</option>
                  <option value="เสนอแนะการพัฒนา">เสนอแนะแนวทางพัฒนาเว็บไซต์</option>
                  <option value="สอบถามทั่วไป">สอบถามทั่วไป</option>
                </select>
              </div>

              {/* Subject Field */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#183D2B] block">
                  หัวข้อเรื่อง <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="ระบุใจความสำคัญสั้นๆ"
                  className="w-full text-xs p-2.5 rounded-lg border border-[#EEE7DA] focus:border-[#C6A96B] focus:outline-none"
                  required
                />
              </div>

              {/* Message Details */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#183D2B] block">
                  รายละเอียดข้อความ <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  placeholder="พิมพ์ข้อความ รายละเอียดพรรณไม้ หรือข้อเสนอแนะที่ต้องการแจ้ง..."
                  className="w-full text-xs p-2.5 rounded-lg border border-[#EEE7DA] focus:border-[#C6A96B] focus:outline-none"
                  required
                />
              </div>

              {/* Privacy Policy Agreement Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreePrivacy}
                    onChange={(e) => setAgreePrivacy(e.target.checked)}
                    className="mt-0.5 rounded text-[#183D2B] focus:ring-[#C6A96B]"
                  />
                  <span className="text-[11px] text-[#49382C] leading-snug">
                    ข้าพเจ้ายินยอมให้ SACRED CANOPY จัดเก็บและประมวลผลข้อมูลส่วนบุคคลข้างต้นเพื่อวัตถุประสงค์ในการติดต่อกลับและปรับปรุงฐานข้อมูลตามนโยบายความเป็นส่วนตัว
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-between border-t border-[#EEE7DA]">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 text-xs font-semibold text-[#7A746B] hover:text-[#183D2B] flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>ล้างข้อมูลฟอร์ม</span>
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 rounded-xl bg-[#183D2B] hover:bg-[#25523B] text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>กำลังบันทึกข้อมูล...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 text-[#C6A96B]" />
                      <span>ส่งข้อความ</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
