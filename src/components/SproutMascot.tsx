import React, { useState, useEffect } from 'react';
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

interface SproutMascotProps {
  onNavigateToQuiz?: () => void;
}

export const SproutMascot: React.FC<SproutMascotProps> = ({ onNavigateToQuiz }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);
  const [isWaving, setIsWaving] = useState(false);
  const [isPeeking, setIsPeeking] = useState(true);

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

          <p className="py-3 text-xs leading-relaxed text-[#49382C] font-body">
            {SPROUT_QUOTES[quoteIndex]}
          </p>

          <div className="flex items-center justify-between pt-1">
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
