import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { doc, onSnapshot, collection } from 'firebase/firestore';
import { FAQ } from '../types';
import { NavigationPage } from '../components/Header';
import { 
  ChevronRight, 
  HelpCircle, 
  Search, 
  ChevronDown, 
  Mail, 
  BookOpen, 
  CheckCircle2, 
  ShieldCheck,
  Compass,
  Heart,
  Wrench,
  BellRing
} from 'lucide-react';

interface HelpPageProps {
  faqs: FAQ[];
  onNavigate: (page: NavigationPage) => void;
}

export const HelpPage: React.FC<HelpPageProps> = ({ faqs, onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('ทั้งหมด');
  const [openFaqId, setOpenFaqId] = useState<string | null>(faqs[0]?.faqId || null);
  const [announcement, setAnnouncement] = useState<{enabled?: boolean; title?: string; message?: string; startAt?: string; endAt?: string; status?: string} | null>(null);
  const [activityNotices, setActivityNotices] = useState<Array<{id:string;title:string;message:string;type:string;published:boolean;startAt?:string;endAt?:string}>>([]);
  useEffect(() => {
    const unsubNotice = onSnapshot(doc(db, 'siteSettings', 'maintenanceNotice'), (snapshot) => {
      if (snapshot.exists()) setAnnouncement(snapshot.data() as any); else setAnnouncement(null);
    }, (error) => console.warn('Could not load website announcement', error));
    const unsubActivities = onSnapshot(collection(db, 'siteAnnouncements'), (snapshot) => {
      setActivityNotices(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as any)));
    }, (error) => console.warn('Could not load activities', error));
    return () => { unsubNotice(); unsubActivities(); };
  }, []);
  const now = Date.now();
  const visibleActivities = activityNotices.filter((item) => item.published !== false && (!item.startAt || new Date(item.startAt).getTime() <= now) && (!item.endAt || new Date(item.endAt).getTime() >= now)).sort((a,b)=> (b.startAt ? new Date(b.startAt).getTime() : 0) - (a.startAt ? new Date(a.startAt).getTime() : 0));
  const announcementVisible = Boolean(announcement?.enabled)
    && (!announcement?.startAt || new Date(announcement.startAt).getTime() <= now)
    && (!announcement?.endAt || new Date(announcement.endAt).getTime() >= now);


  const categories = ['ทั้งหมด', 'ทั่วไป', 'การค้นหาต้นไม้', 'ความเชื่อและพฤกษศาสตร์', 'ระบบสมาชิก', 'การแจ้งข้อมูล'];

  const filteredFaqs = faqs.filter((faq) => {
    if (selectedCat !== 'ทั้งหมด' && faq.category !== selectedCat) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q) ||
        faq.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 font-body">
      {/* Breadcrumb & Title */}
      <div className="space-y-2 text-center max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-2 text-xs text-[#7A746B]">
          <span>หน้าหลัก</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-[#183D2B]">ศูนย์ช่วยเหลือและคำถามที่พบบ่อย</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-[#183D2B]">
          ช่วยเหลือและคำถามที่พบบ่อย (Q&A)
        </h1>
        <p className="text-xs sm:text-sm text-[#7A746B] leading-relaxed">
          ค้นหาคำตอบเกี่ยวกับการใช้งานฐานข้อมูล รหัสพรรณไม้ คติความเชื่อ และการจัดเก็บข้อมูล
        </p>
      </div>

      {visibleActivities.length > 0 && <section aria-label="ประกาศและกิจกรรมจากเว็บไซต์" className="space-y-3">
        {visibleActivities.map((item) => <article key={item.id} className={`rounded-2xl border p-5 sm:p-6 shadow-sm ${item.type === 'maintenance' ? 'bg-amber-50 border-amber-300' : 'bg-[#EAF3E8] border-[#BCD5B8]'}`}>
          <div className="flex items-start gap-3"><div className="rounded-xl bg-white p-3 text-[#183D2B]">{item.type === 'maintenance' ? <Wrench className="w-5 h-5"/> : <BellRing className="w-5 h-5"/>}</div><div className="min-w-0 flex-1"><div className="text-[10px] font-bold tracking-widest uppercase text-[#A48545]">{item.type === 'maintenance' ? 'ประกาศปรับปรุงระบบ' : item.type === 'new-plants' ? 'พรรณไม้ใหม่' : item.type === 'activity' ? 'กิจกรรมเว็บไซต์' : 'ประกาศจาก SACRED CANOPY'}</div><h2 className="text-lg font-bold text-[#183D2B] mt-1">{item.title}</h2><p className="text-sm leading-relaxed text-[#49382C] whitespace-pre-wrap mt-1">{item.message}</p>{(item.startAt || item.endAt) && <p className="text-[11px] text-[#7A746B] mt-2">{item.startAt ? new Date(item.startAt).toLocaleString('th-TH') : 'เริ่มทันที'}{item.endAt ? ` – ${new Date(item.endAt).toLocaleString('th-TH')}` : ''}</p>}</div></div>
        </article>)}
      </section>}

      {announcementVisible && (
        <section className={`rounded-2xl border p-5 sm:p-6 shadow-sm ${announcement?.status === 'maintenance' ? 'bg-amber-50 border-amber-300' : 'bg-[#EAF3E8] border-[#BCD5B8]'}`}>
          <div className="flex items-start gap-3">
            <div className={`rounded-xl p-3 ${announcement?.status === 'maintenance' ? 'bg-amber-100 text-amber-800' : 'bg-white text-[#183D2B]'}`}>{announcement?.status === 'maintenance' ? <Wrench className="w-5 h-5" /> : <BellRing className="w-5 h-5" />}</div>
            <div className="flex-1 space-y-1">
              <div className="text-[10px] font-bold tracking-widest uppercase">{announcement?.status === 'maintenance' ? 'ประกาศปรับปรุงระบบ' : 'ประกาศจาก SACRED CANOPY'}</div>
              <h2 className="text-lg font-bold text-[#183D2B]">{announcement?.title || (announcement?.status === 'maintenance' ? 'แจ้งปรับปรุงระบบ' : 'ประกาศจากเว็บไซต์')}</h2>
              <p className="text-sm leading-relaxed text-[#49382C] whitespace-pre-wrap">{announcement?.message}</p>
              {(announcement?.startAt || announcement?.endAt) && <p className="text-[11px] text-[#7A746B] mt-2">ช่วงเวลา: {announcement.startAt ? new Date(announcement.startAt).toLocaleString('th-TH') : 'ไม่ระบุเวลาเริ่ม'} – {announcement.endAt ? new Date(announcement.endAt).toLocaleString('th-TH') : 'ไม่ระบุเวลาสิ้นสุด'}</p>}
            </div>
          </div>
        </section>
      )}

      {/* Quick Search Bar */}
      <div className="max-w-2xl mx-auto relative">
        <Search className="w-5 h-5 text-[#C6A96B] absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="พิมพ์คำถาม หรือคำสำคัญ เช่น ชื่อวิทยาศาสตร์, รหัส A01, การสมัครสมาชิก..."
          className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-[#EEE7DA] focus:border-[#C6A96B] shadow-sm text-xs sm:text-sm text-[#292B29] focus:outline-none"
        />
      </div>

      {/* Quick Visual User Guides Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#EEE7DA] space-y-2 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] flex items-center justify-center text-[#183D2B] font-bold text-xs">
            1
          </div>
          <h3 className="text-xs font-bold text-[#183D2B]">วิธีค้นหาและกรองข้อมูล</h3>
          <p className="text-[11px] text-[#7A746B] leading-relaxed">
            สามารถสืบค้นด้วยชื่อไทย ชื่อวิทยาศาสตร์ หรือเลือกตัวกรองแสงแดด น้ำ และความปลอดภัยสำหรับสัตว์เลี้ยง
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EEE7DA] space-y-2 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] flex items-center justify-center text-[#183D2B] font-bold text-xs">
            2
          </div>
          <h3 className="text-xs font-bold text-[#183D2B]">วิธีใช้ Plant Quiz</h3>
          <p className="text-[11px] text-[#7A746B] leading-relaxed">
            ตอบคำถาม 6 ข้อเพื่อวิเคราะห์เงื่อนไขที่อยู่อาศัยและเวลาในการดูแล ระบบจะคำนวณคะแนนความเข้ากันได้ทันที
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EEE7DA] space-y-2 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] flex items-center justify-center text-[#183D2B] font-bold text-xs">
            3
          </div>
          <h3 className="text-xs font-bold text-[#183D2B]">บันทึกรายการโปรด</h3>
          <p className="text-[11px] text-[#7A746B] leading-relaxed">
            กดไอคอนรูปหัวใจเพื่อจัดเก็บต้นไม้ที่คุณสนใจไว้ใน "ไม้มงคลของฉัน" เพื่อเรียกดูได้สะดวกรวดเร็ว
          </p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              selectedCat === cat
                ? 'bg-[#183D2B] text-white'
                : 'bg-white text-[#7A746B] hover:text-[#183D2B] border border-[#EEE7DA]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-[#EEE7DA] text-center text-xs text-[#7A746B]">
            ไม่พบคำถามที่ตรงกับคำค้นหาของคุณ
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isOpen = openFaqId === faq.faqId;
            return (
              <div
                key={faq.faqId}
                className="bg-white rounded-xl border border-[#EEE7DA] overflow-hidden transition-all shadow-sm"
              >
                <button
                  onClick={() => toggleFaq(faq.faqId)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-[#FAF7F0]/40 transition-colors"
                >
                  <span className="text-xs sm:text-sm font-bold text-[#183D2B]">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#A48545] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-[#49382C] leading-relaxed border-t border-[#EEE7DA]/60 bg-[#FAF7F0]/20 font-body">
                    <p>{faq.answer}</p>
                    <div className="pt-2 text-[10px] text-[#A48545] font-medium">
                      หมวด: {faq.category}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Contact Admin CTA Banner */}
      <div className="rounded-2xl bg-[#183D2B] text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-base sm:text-lg font-bold text-white">
            ยังมีคำถามอื่น หรือต้องการแจ้งข้อมูลพฤกษศาสตร์คลาดเคลื่อน?
          </h3>
          <p className="text-xs text-[#A8B89A]">
            ทีมงานและนักพฤกษศาสตร์ประจำ SACRED CANOPY ยินดีให้คำแนะนำและตรวจสอบข้อมูล
          </p>
        </div>
        <button
          onClick={() => onNavigate('contact')}
          className="px-5 py-2.5 bg-[#C6A96B] text-[#0F271B] hover:bg-[#DFC488] font-bold text-xs rounded-xl transition-colors whitespace-nowrap flex items-center gap-2 shrink-0 shadow-md"
        >
          <Mail className="w-4 h-4" />
          <span>ไปยังหน้าติดต่อเรา</span>
        </button>
      </div>
    </div>
  );
};
