import React, { useState, useEffect } from 'react';
import { Plant, FAQ, UserProfile } from '../types';
import { NavigationPage } from './Header';
import { Sparkles, MessageCircle, X, ChevronUp, RefreshCw } from 'lucide-react';

const SPROUT_QUOTES = [
  'สวัสดีครับ! ผมชื่อ "น้องต้นกล้า" ยินดีต้อนรับสู่ ร่มโพธิ์ ร่มไทร ครับ 🌱',
  'รู้หรือไม่ครับ? ราชพฤกษ์นิยมปลูกทิศตะวันตกเฉียงใต้ในวันเสาร์เพื่อเสริมชัยชนะและเกียรติยศ!',
  'ต้นโพธิ์และต้นไทรเป็นร่มเงาที่มั่นคง สื่อถึงความสงบสุขและผู้ใหญ่ที่คอยเกื้อหนุนครับ 🌿',
  'มีเด็กหรือสัตว์เลี้ยงในบ้าน? ลองตรวจดูข้อมูลความปลอดภัยในหน้ารายละเอียดต้นไม้นะครับ 🐾',
  'หากยังไม่รู้จะปลูกต้นอะไรดี ลองเล่น "Plant Quiz" ค้นหาต้นไม้ที่เหมาะกับคุณได้เลยครับ ✨',
  'ดอกมะลิสีขาวบริสุทธิ์ ส่งกลิ่นหอมผ่อนคลายและสื่อถึงความกตัญญูกตเวทีครับ 🤍',
  'พลูด่างและลิ้นมังกรช่วยฟอกอากาศในบ้านได้อย่างยอดเยี่ยมเลยครับ 🍃',
];

interface ChatMessage { role: 'user' | 'sprout'; text: string; searchUrl?: string; }
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

  const answerQuestion = (question: string): ChatMessage => {
    const q = question.toLowerCase().trim();
    const faq = faqs.find((item) => q.includes(item.question.toLowerCase()) || item.question.toLowerCase().split(/\s+/).some((word) => word.length > 3 && q.includes(word)));
    if (faq) return { role: 'sprout', text: faq.answer };
    const plant = plants.find((item) => [item.thaiName, item.englishName, item.scientificName, item.plantId, ...(item.otherNames || [])].some((value) => value && q.includes(value.toLowerCase())));
    if (plant) {
      const answer = `${plant.thaiName} (${plant.scientificName}) รหัส ${plant.plantId}\n\n${plant.description}\n\nการดูแล: แสงแดด ${plant.care.sunlight}; น้ำ ${plant.care.water}; ดิน ${plant.care.soil}.\n\nข้อควรระวัง: ${plant.safety.caution || plant.safety.toxicityPets || 'โปรดตรวจสอบข้อมูลความปลอดภัยในรายละเอียดต้นไม้ด้วยนะครับ'}`;
      return { role: 'sprout', text: answer };
    }
    if (/สมาชิก|สมัคร|เข้าสู่ระบบ|ล็อกอิน|login|register/.test(q)) return { role: 'sprout', text: 'สมัครสมาชิกหรือเข้าสู่ระบบได้จากปุ่มด้านบนครับ สมาชิกจะบันทึกต้นไม้โปรดและเล่นมินิเกมได้ ส่วนผู้เยี่ยมชมยังอ่านข้อมูลต้นไม้และใช้หน้าช่วยเหลือได้ครับ' };
    if (/หัวใจ|รายการโปรด|favorite/.test(q)) return { role: 'sprout', text: 'กดหัวใจบนการ์ดต้นไม้เพื่อบันทึกไว้ในคลังส่วนตัวได้เมื่อเข้าสู่ระบบแล้วครับ หากยังไม่ได้เป็นสมาชิก ระบบจะแนะนำให้เข้าสู่ระบบก่อน' };
    if (/เกม|quiz|แบบทดสอบ|เหมาะกับฉัน/.test(q)) return { role: 'sprout', text: currentUser?.role === 'guest' ? 'เกมค้นหาต้นไม้เหมาะกับคุณสำหรับสมาชิกครับ กดเมนูเกมแล้วเข้าสู่ระบบหรือสมัครสมาชิกเพื่อเริ่มเล่นได้เลย' : 'ไปที่เมนู “ค้นหาต้นไม้ Quiz” เพื่อทำแบบสอบถามและดูพรรณไม้ที่เหมาะกับพื้นที่และเวลาที่คุณมีได้เลยครับ' };
    if (/ช่วยเหลือ|ติดต่อ|หน้าเว็บ|เว็บไซต์|ฐานข้อมูล|ค้นหา/.test(q)) return { role: 'sprout', text: 'คุณสามารถค้นหาต้นไม้จากชื่อไทย ชื่อวิทยาศาสตร์ หรือรหัสพรรณไม้ได้ครับ หน้า “ช่วยเหลือ” มีคำถามที่พบบ่อย และหน้า “ติดต่อเรา” ใช้ส่งข้อเสนอแนะให้ทีมงานได้ครับ' };
    return { role: 'sprout', text: 'ตอนนี้ผมตอบได้จากข้อมูลต้นไม้และคำถามที่เตรียมไว้ในเว็บไซต์ครับ สำหรับข้อมูลล่าสุดจากอินเทอร์เน็ต คุณสามารถเปิดผลการค้นหาเว็บด้านล่าง แล้วนำข้อมูลกลับมาถามผมต่อได้ครับ', searchUrl: `https://www.google.com/search?q=${encodeURIComponent(question + ' ต้นไม้ พฤกษศาสตร์')}` };
  };

  const submitChat = (event: React.FormEvent) => {
    event.preventDefault();
    const question = chatInput.trim();
    if (!question || isThinking) return;
    setChatMessages((previous) => [...previous, { role: 'user', text: question }]);
    setChatInput('');
    setIsThinking(true);
    window.setTimeout(() => {
      setChatMessages((previous) => [...previous, answerQuestion(question)]);
      setIsThinking(false);
    }, 250);
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
    setIsWaving(true);
    setTimeout(() => setIsWaving(false), 600);
  };

  const handleMascotClick = () => {
    setIsOpen(!isOpen);
    setIsWaving(true);
    setTimeout(() => setIsWaving(false), 600);
  };

  return (
    <aside aria-label="ผู้ช่วยนำทาง น้องต้นกล้า" className="fixed bottom-4 right-4 z-40 select-none">
      {/* Speech Bubble Dialog */}
      {isOpen && (
        <div className="mb-3 w-72 sm:w-80 rounded-2xl bg-white p-4 shadow-xl border border-[#C6A96B]/30 animate-in fade-in slide-in-from-bottom-2 duration-300">
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

          <div className="py-3 max-h-64 overflow-y-auto space-y-2 text-xs leading-relaxed text-[#49382C] font-body">
            {chatMessages.map((message, index) => (
              <div key={index} className={`rounded-xl p-2.5 whitespace-pre-line ${message.role === 'user' ? 'bg-[#183D2B] text-white ml-8' : 'bg-[#F3F5EC] text-[#49382C] mr-3'}`}>
                {message.text}
                {message.searchUrl && <a href={message.searchUrl} target="_blank" rel="noreferrer" className="block mt-2 font-semibold underline text-[#A48545]">ค้นหาข้อมูลบนเว็บ ↗</a>}
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
          {/* Triangle Pointer */}
          <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white border-r border-b border-[#C6A96B]/30 transform rotate-45" />
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
          className={`relative p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-lg border border-[#C6A96B]/40 hover:scale-105 active:scale-95 transition-all duration-300 ${
            isWaving ? 'animate-bounce' : ''
          }`}
          aria-label="คลิกเพื่อสนทนากับน้องต้นกล้า ผู้ช่วยนำทางไม้มงคล"
        >
          {/* Custom SVG Sprout Mascot */}
          <svg
            className="w-14 h-14 sm:w-16 sm:h-16 filter drop-shadow-sm transition-transform duration-300"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Soft Shadow */}
            <ellipse cx="50" cy="92" rx="30" ry="5" fill="#183D2B" fillOpacity="0.15" />

            {/* Clay Pot Base / Seed Shell */}
            <path
              d="M30 65 L34 88 C34 91 38 93 50 93 C62 93 66 91 66 88 L70 65 Z"
              fill="#D4A373"
              stroke="#A47148"
              strokeWidth="2"
            />
            <ellipse cx="50" cy="65" rx="20" ry="4" fill="#E29578" />

            {/* Round Sprout Body */}
            <circle
              cx="50"
              cy="52"
              r="24"
              fill="#A7C957"
              stroke="#6A994E"
              strokeWidth="2.5"
            />

            {/* Rosy Cheeks */}
            <circle cx="37" cy="56" r="4" fill="#F4A261" fillOpacity="0.6" />
            <circle cx="63" cy="56" r="4" fill="#F4A261" fillOpacity="0.6" />

            {/* Cute Cartoon Eyes with blink animation */}
            {isBlinking ? (
              <>
                <path d="M40 50 Q43 53 46 50" stroke="#386641" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M54 50 Q57 53 60 50" stroke="#386641" strokeWidth="2.5" strokeLinecap="round" />
              </>
            ) : (
              <>
                {/* Left Eye */}
                <ellipse cx="43" cy="49" rx="3.5" ry="4.5" fill="#292B29" />
                <circle cx="44.5" cy="47.5" r="1.5" fill="#FFFFFF" />
                {/* Right Eye */}
                <ellipse cx="57" cy="49" rx="3.5" ry="4.5" fill="#292B29" />
                <circle cx="58.5" cy="47.5" r="1.5" fill="#FFFFFF" />
              </>
            )}

            {/* Happy Smile Mouth */}
            <path
              d="M46 56 Q50 61 54 56"
              stroke="#386641"
              strokeWidth="2"
              strokeLinecap="round"
              fill="#BC4749"
            />

            {/* Sprout Shoot & Two Leaves on Head */}
            <path
              d="M50 28 L50 20"
              stroke="#386641"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Left Leaf (fluttering) */}
            <path
              d="M50 22 C42 16 32 20 34 28 C42 30 48 25 50 22 Z"
              fill="#6A994E"
              stroke="#386641"
              strokeWidth="2"
            />
            <path d="M42 22 C46 24 49 23 50 22" stroke="#A7C957" strokeWidth="1.2" />

            {/* Right Leaf */}
            <path
              d="M50 20 C58 12 70 16 67 25 C58 27 52 23 50 20 Z"
              fill="#558B2F"
              stroke="#386641"
              strokeWidth="2"
            />
            <path d="M57 19 C54 21 51 21 50 20" stroke="#A7C957" strokeWidth="1.2" />

            {/* Little Waving Hand */}
            {isWaving ? (
              <path
                d="M72 52 C78 48 83 44 80 40 C76 40 73 46 71 50"
                stroke="#6A994E"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="#A7C957"
              />
            ) : null}
          </svg>

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
