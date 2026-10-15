import React, { useState, useEffect } from 'react';
import { Plant, FAQ, UserProfile } from '../types';
import { NavigationPage } from './Header';
import { Sparkles, MessageCircle, X, ChevronUp, RefreshCw, Minus, Plus, ExternalLink, Compass } from 'lucide-react';

const SPROUT_QUOTES = [
  'สวัสดีครับ! ผมชื่อ "น้องต้นกล้า" ยินดีต้อนรับสู่ ร่มโพธิ์ ร่มไทร ครับ 🌱',
  'รู้หรือไม่ครับ? ราชพฤกษ์นิยมปลูกทิศตะวันตกเฉียงใต้ในวันเสาร์เพื่อเสริมชัยชนะและเกียรติยศ!',
  'ต้นโพธิ์และต้นไทรเป็นร่มเงาที่มั่นคง สื่อถึงความสงบสุขและผู้ใหญ่ที่คอยเกื้อหนุนครับ 🌿',
  'มีเด็กหรือสัตว์เลี้ยงในบ้าน? ลองตรวจดูข้อมูลความปลอดภัยในหน้ารายละเอียดต้นไม้นะครับ 🐾',
  'หากยังไม่รู้จะปลูกต้นอะไรดี ลองเล่น "Plant Quiz" ค้นหาต้นไม้ที่เหมาะกับคุณได้เลยครับ ✨',
  'ดอกมะลิสีขาวบริสุทธิ์ ส่งกลิ่นหอมผ่อนคลายและสื่อถึงความกตัญญูกตเวทีครับ 🤍',
  'พลูด่างและลิ้นมังกรช่วยฟอกอากาศในบ้านได้อย่างยอดเยี่ยมเลยครับ 🍃',
];

interface ChatMessage { role: 'user' | 'sprout'; text: string; searchUrl?: string; navigateTo?: NavigationPage; }
interface SproutMascotProps {
  onNavigateToQuiz?: () => void;
  plants?: Plant[];
  faqs?: FAQ[];
  currentUser?: UserProfile;
  onNavigate?: (page: NavigationPage) => void;
}

export const SproutMascot: React.FC<SproutMascotProps> = ({ onNavigateToQuiz, plants = [], faqs = [], currentUser, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);
  const [isWaving, setIsWaving] = useState(false);
  const [isPeeking, setIsPeeking] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'sprout', text: 'สวัสดีครับ 🌱 ผมต้นกล้า ผู้ช่วยตัวน้อยของ SACRED CANOPY ถามเรื่องต้นไม้ การดูแล หรือวิธีใช้เว็บไซต์ได้เลยนะครับ' }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [chatSize, setChatSize] = useState<'compact' | 'normal' | 'wide'>('normal');
  const [mascotAction, setMascotAction] = useState('01_tonkla_wave.png');
  const [showKnowledge, setShowKnowledge] = useState(false);

  const answerQuestion = (question: string): ChatMessage => {
    const q = question.toLowerCase().trim();
    const faq = faqs.find((item) => q.includes(item.question.toLowerCase()) || item.question.toLowerCase().split(/\s+/).some((word) => word.length > 3 && q.includes(word)));
    if (faq) return { role: 'sprout', text: faq.answer, navigateTo: /ช่วยเหลือ|faq/i.test(q) ? 'help' : undefined };
    const plant = plants.find((item) => [item.thaiName, item.englishName, item.scientificName, item.plantId, ...(item.otherNames || [])].some((value) => value && q.includes(value.toLowerCase())));
    if (plant) {
      const answer = `${plant.thaiName} (${plant.scientificName}) รหัส ${plant.plantId}\n\n${plant.description}\n\nการดูแล: แสงแดด ${plant.care.sunlight}; น้ำ ${plant.care.water}; ดิน ${plant.care.soil}.\n\nข้อควรระวัง: ${plant.safety.caution || plant.safety.toxicityPets || 'โปรดตรวจสอบข้อมูลความปลอดภัยในรายละเอียดต้นไม้ด้วยนะครับ'}`;
      return { role: 'sprout', text: answer };
    }
    if (/สมาชิก|สมัคร|เข้าสู่ระบบ|ล็อกอิน|login|register/.test(q)) return { role: 'sprout', text: 'สมัครสมาชิกหรือเข้าสู่ระบบได้จากปุ่มด้านบนครับ สมาชิกจะบันทึกต้นไม้โปรดและเล่นแบบประเมินต้นไม้ที่เหมาะกับคุณได้ ส่วนผู้เยี่ยมชมอ่านข้อมูลได้ตามปกติครับ' };
    if (/หัวใจ|รายการโปรด|favorite/.test(q)) return { role: 'sprout', text: 'กดหัวใจบนการ์ดต้นไม้เพื่อบันทึกไว้ในคลังส่วนตัวได้เมื่อเข้าสู่ระบบแล้วครับ หากยังไม่ได้เป็นสมาชิก ระบบจะแนะนำให้เข้าสู่ระบบก่อน' };
    if (/เกม|quiz|แบบทดสอบ|เหมาะกับฉัน/.test(q)) return { role: 'sprout', text: currentUser?.role === 'guest' ? 'เกมค้นหาต้นไม้เหมาะกับคุณสำหรับสมาชิกครับ กดเมนูเกมแล้วเข้าสู่ระบบหรือสมัครสมาชิกเพื่อเริ่มเล่นได้เลย' : 'ไปที่เมนู “ค้นหาต้นไม้ Quiz” เพื่อทำแบบสอบถามและดูพรรณไม้ที่เหมาะกับพื้นที่และเวลาที่คุณมีได้เลยครับ' };
    if (/ช่วยเหลือ|faq|คำถามที่พบบ่อย/.test(q)) return { role: 'sprout', text: 'ผมพาไปหน้าช่วยเหลือให้ได้เลยครับ ที่นั่นมี FAQ และประกาศจากเว็บไซต์', navigateTo: 'help' };
    if (/ติดต่อ|อีเมลทีมงาน|ติดต่อเรา/.test(q)) return { role: 'sprout', text: 'ผมพาไปหน้าติดต่อเราเพื่อส่งข้อความถึงทีมงานได้เลยครับ', navigateTo: 'contact' };
    if (/เกี่ยวกับเรา|ทีมงาน/.test(q)) return { role: 'sprout', text: 'มาทำความรู้จักทีมงานและเว็บไซต์กันครับ', navigateTo: 'about' };
    if (/บทความ|เกร็ดความรู้/.test(q)) return { role: 'sprout', text: 'ผมพาไปคลังบทความและเกร็ดความรู้ได้เลยครับ', navigateTo: 'articles' };
    if (/ประวัติ|ที่เคยดู/.test(q)) return { role: 'sprout', text: 'ดูประวัติพรรณไม้ที่เคยเข้าชมได้จากเมนูประวัติที่เข้าชมครับ', navigateTo: 'history' };
    if (/ฐานข้อมูล|ค้นหา|หมวดหมู่/.test(q)) return { role: 'sprout', text: 'ผมพาไปฐานข้อมูลพรรณไม้ได้เลยครับ ลองค้นหาด้วยชื่อไทย ชื่อวิทยาศาสตร์ หรือรหัสพรรณไม้', navigateTo: 'database' };
    return { role: 'sprout', text: 'ตอนนี้ผมตอบได้จากข้อมูลต้นไม้และคำถามที่เตรียมไว้ในเว็บไซต์ครับ สำหรับข้อมูลล่าสุดจากอินเทอร์เน็ต คุณสามารถเปิดผลการค้นหาเว็บด้านล่าง แล้วนำข้อมูลกลับมาถามผมต่อได้ครับ', searchUrl: `https://www.google.com/search?q=${encodeURIComponent(question + ' ต้นไม้ พฤกษศาสตร์')}` };
  };

  const submitChat = (event: React.FormEvent) => {
    event.preventDefault();
    const question = chatInput.trim();
    if (!question || isThinking) return;
    setChatMessages((previous) => [...previous, { role: 'user', text: question }]);
    setChatInput('');
    setIsThinking(true); setMascotAction('05_tonkla_chat_typing.png');
    window.setTimeout(() => {
      const answer = answerQuestion(question);
      setChatMessages((previous) => [...previous, answer]);
      setMascotAction(/ปลอดภัย|อันตราย|พิษ|สัตว์เลี้ยง|เด็ก/.test(question) ? '09_tonkla_warning.png' : /รดน้ำ|ดูแล|ปลูก|ดิน|แดด/.test(question) ? '07_tonkla_watering_plant.png' : /บทความ|อ่าน|อ้างอิง|ข้อมูล/.test(question) ? '11_tonkla_reading.png' : answer.navigateTo ? '08_tonkla_celebrate.png' : answer.searchUrl ? '06_tonkla_surprised.png' : '04_tonkla_present_knowledge.png');
      setIsThinking(false);
    }, 350);
  };

  // Random eye blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    }, 3500);
    return () => clearInterval(blinkInterval);
  }, []);

  const handleNextQuote = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuoteIndex((prev) => (prev + 1) % SPROUT_QUOTES.length);
    setShowKnowledge(true); setMascotAction('04_tonkla_present_knowledge.png');
    setChatMessages((previous) => [...previous, { role: 'sprout', text: SPROUT_QUOTES[(quoteIndex + 1) % SPROUT_QUOTES.length] }]);
    setIsWaving(true);
    setTimeout(() => setIsWaving(false), 600);
  };

  const handleMascotClick = () => {
    setIsOpen(!isOpen);
    setMascotAction(isOpen ? '12_tonkla_wink.png' : '02_tonkla_happy_jump.png');
    setIsWaving(true);
    setTimeout(() => setIsWaving(false), 600);
  };

  return (
    <aside aria-label="ผู้ช่วยนำทาง น้องต้นกล้า" className="fixed z-40 select-none bottom-3 right-3 sm:bottom-5 sm:right-5 flex flex-col items-end">
      {/* Speech Bubble Dialog */}
      {isOpen && (
        <div style={{ resize: 'both', width: chatSize === 'compact' ? 300 : chatSize === 'wide' ? 'min(88vw, 620px)' : 360, height: 'min(62vh, 560px)', minWidth: 280, minHeight: 300, maxWidth: 'min(94vw, 720px)', maxHeight: '78vh' }} className="mb-3 flex flex-col overflow-auto rounded-2xl bg-white/95 backdrop-blur-md p-3 sm:p-4 shadow-[0_14px_42px_rgba(15,39,27,0.18)] border border-[#C6A96B]/35 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between mb-2 rounded-xl bg-[#F3F5EC] p-2"><img src={`/mascot/${mascotAction}`} alt="น้องต้นกล้า" className="h-14 w-14 object-contain"/><div className="text-[11px] text-[#183D2B] flex-1 ml-2"><strong>ต้นกล้าพร้อมช่วยครับ</strong><p>ถามเรื่องต้นไม้หรือให้ช่วยพาไปยังหน้าเว็บได้เลย</p></div><div className="flex gap-1"><button onClick={() => setChatSize('compact')} title="ย่อหน้าต่าง" className="p-1 rounded hover:bg-white"><Minus className="w-3 h-3"/></button><button onClick={() => setChatSize(chatSize === 'wide' ? 'normal' : 'wide')} title="ขยายหน้าต่าง" className="p-1 rounded hover:bg-white"><Plus className="w-3 h-3"/></button></div></div>
          <div className="flex items-center justify-between pb-2 border-b border-[#EEE7DA]">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#183D2B]">
              <Sparkles className="w-3.5 h-3.5 text-[#C6A96B]" />
              <span>น้องต้นกล้า ชวนรู้ไม้มงคล</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#B8BCC2] hover:text-[#183D2B] transition-colors p-0.5 rounded-full"
              title="ปิดข้อความ"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-3 min-h-0 flex-1 overflow-y-auto space-y-2 text-xs leading-relaxed text-[#49382C] font-body">
            {chatMessages.map((message, index) => (
              <div key={index} className={`rounded-xl p-2.5 whitespace-pre-line ${message.role === 'user' ? 'bg-[#183D2B] text-white ml-8' : 'bg-[#F3F5EC] text-[#49382C] mr-3'}`}>
                {message.text}
                {message.searchUrl && <a href={message.searchUrl} target="_blank" rel="noreferrer" className="block mt-2 font-semibold underline text-[#A48545]">ค้นหาข้อมูลบนเว็บ ↗</a>}
                {message.navigateTo && onNavigate && <button onClick={() => { setIsOpen(false); onNavigate(message.navigateTo!); }} className="mt-2 inline-flex items-center gap-1 rounded-lg bg-[#183D2B] px-3 py-1.5 text-white font-semibold"><Compass className="w-3 h-3"/> ไปยังหน้านี้ <ExternalLink className="w-3 h-3"/></button>}
              </div>
            ))}
            {isThinking && <p className="text-[#7A746B] italic">ต้นกล้ากำลังคิดคำตอบ…</p>}
          </div>
          <form onSubmit={submitChat} className="flex gap-2 border-t border-[#EEE7DA] pt-2">
            <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="ถามต้นกล้าได้เลย..." className="min-w-0 flex-1 rounded-lg border border-[#EEE7DA] px-3 py-2 text-xs outline-none focus:border-[#C6A96B]" aria-label="ข้อความถามน้องต้นกล้า" />
            <button type="submit" disabled={!chatInput.trim() || isThinking} className="rounded-lg bg-[#183D2B] px-3 py-2 text-xs font-bold text-white disabled:opacity-50">ส่ง</button>
          </form>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleNextQuote}
              className="flex items-center gap-1 text-[11px] text-[#A48545] hover:text-[#183D2B] font-medium transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>เกร็ดความรู้อื่น</span>
            </button>
            {onNavigateToQuiz && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onNavigateToQuiz();
                }}
                className="text-[11px] font-medium bg-[#183D2B] text-white px-2.5 py-1 rounded-md hover:bg-[#25523B] transition-colors"
              >
                ทำแบบทดสอบ 🌱
              </button>
            )}
          </div>
          {showKnowledge && <div className="mt-2 rounded-xl border border-[#C6A96B]/40 bg-[#FFF9E9] p-3 text-xs leading-relaxed text-[#49382C]"><strong className="text-[#183D2B]">เกร็ดความรู้จากต้นกล้า</strong><p className="mt-1">{SPROUT_QUOTES[quoteIndex]}</p></div>}
          {/* Triangle Pointer */}
          
        </div>
      )}

      {/* Mascot Cartoon Sprout Character */}
      <div className="relative flex items-end justify-end group">
        {/* Floating Tooltip hint when bubble is closed */}
        {!isOpen && (
          <div className="hidden sm:block absolute -top-8 right-0 bg-[#183D2B] text-[#FAF7F0] text-[11px] px-2.5 py-1 rounded-full shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            ทักทายผมสิครับ! 🌱
          </div>
        )}

        <button
          onClick={handleMascotClick}
          className={`relative block border-0 bg-transparent p-0 shadow-none hover:scale-105 active:scale-95 transition-transform duration-300 ${
            isWaving ? 'animate-bounce' : ''
          }`}
          aria-label="คลิกเพื่อสนทนากับน้องต้นกล้า ผู้ช่วยนำทางไม้มงคล"
        >
          <img src={`/mascot/${mascotAction}`} alt="น้องต้นกล้า มาสคอตผู้ช่วย SACRED CANOPY" className="h-32 w-32 sm:h-40 sm:w-40 object-contain drop-shadow-[0_8px_12px_rgba(15,39,27,0.24)]" />

          {/* Golden Badge Notification Ring */}
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C6A96B] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-[#C6A96B] text-[9px] font-bold text-white items-center justify-center">
              !
            </span>
          </span>
        </button>

      </div>
    </aside>
  );
};
