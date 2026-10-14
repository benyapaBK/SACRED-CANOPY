import React from 'react';
import { NavigationPage } from './Header';
import { Heart, ShieldCheck, Mail, HelpCircle, ExternalLink } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: NavigationPage) => void;
  onOpenDisclaimer: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenDisclaimer }) => {
  return (
    <footer className="bg-[#0F271B] text-[#FAF7F0] border-t border-[#C6A96B]/30 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main 4-Column Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Col 1 & 2: Brand Lockup & Philosophy */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#183D2B] border border-[#C6A96B]/50 flex items-center justify-center p-2">
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-[#C6A96B]">
                  <path
                    d="M12 2C8 2 4 6 4 11c0 5.25 5 10.5 8 11 3-.5 8-5.75 8-11 0-5-4-9-8-9zm0 17.5c-2.5-.7-6-5-6-8.5 0-3.5 2.5-6.5 6-6.5s6 3 6 6.5c0 3.5-3.5 7.8-6 8.5z"
                    fill="#C6A96B"
                  />
                  <path d="M12 5v14" stroke="#FAF7F0" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <h3 className="font-brand font-bold text-xl tracking-wider text-[#FAF7F0]">
                  SACRED CANOPY
                </h3>
                <p className="text-xs text-[#C6A96B] font-medium">
                  ร่มโพธิ์ ร่มไทร · ร่มเงาแห่งสิริมงคล
                </p>
              </div>
            </div>

            <p className="text-xs text-[#A8B89A] leading-relaxed max-w-md font-body">
              ศูนย์รวบรวมสารสนเทศไม้มงคลไทยระดับพรีเมียม 
              ผสานความรู้ทางพฤกษศาสตร์ การปลูกดูแล คติความเชื่อ และวัฒนธรรมธรรมชาติ
              เพื่อส่งเสริมความร่มเย็น ความเข้าใจที่ถูกต้อง และสุขภาวะที่ดีในสังคม
            </p>

            <div className="text-[11px] text-[#C6A96B] tracking-wider uppercase">
              BOTANICAL KNOWLEDGE • THAI CULTURE • WELL-BEING
            </div>
          </div>

          {/* Col 3: ฐานข้อมูลและการค้นหา */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#C6A96B]">
              ฐานข้อมูลไม้มงคล
            </h4>
            <ul className="space-y-2 text-xs text-[#FAF7F0]/80">
              <li>
                <button
                  onClick={() => onNavigate('database')}
                  className="hover:text-[#C6A96B] transition-colors"
                >
                  ค้นหาพรรณไม้ทั้งหมด
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('categories')}
                  className="hover:text-[#C6A96B] transition-colors"
                >
                  หมวดหมู่หลัก 8 พรรณ
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('beliefs')}
                  className="hover:text-[#C6A96B] transition-colors"
                >
                  คติความเชื่อและทิศมงคล
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('quiz')}
                  className="hover:text-[#C6A96B] transition-colors text-[#DFC488] font-medium"
                >
                  เกมค้นหาต้นไม้ Plant Quiz
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('favorites')}
                  className="hover:text-[#C6A96B] transition-colors"
                >
                  ไม้มงคลของฉัน (รายการโปรด)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: ความรู้และการติดต่อ */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#C6A96B]">
              องค์ความรู้และการบริการ
            </h4>
            <ul className="space-y-2 text-xs text-[#FAF7F0]/80">
              <li>
                <button
                  onClick={() => onNavigate('articles')}
                  className="hover:text-[#C6A96B] transition-colors"
                >
                  บทความและเกร็ดพฤกษศาสตร์
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('help')}
                  className="hover:text-[#C6A96B] transition-colors"
                >
                  ช่วยเหลือและ Q&A (FAQ)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-[#C6A96B] transition-colors"
                >
                  ติดต่อ SACRED CANOPY
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-[#C6A96B] transition-colors"
                >
                  เกี่ยวกับเราและแนวคิด
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('admin')}
                  className="hover:text-[#C6A96B] transition-colors text-[#A8B89A]"
                >
                  แผงควบคุมระบบ (Admin)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: นโยบายและข้อจำกัดความเชื่อ */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#C6A96B]">
              นโยบายและความปลอดภัย
            </h4>
            <p className="text-[11px] text-[#A8B89A] leading-relaxed">
              ข้อมูลความเชื่อนำเสนอในฐานะมรดกทางวัฒนธรรม มิได้รับประกันผลลัพธ์ในชีวิต
              พืชบางชนิดอาจมีสารระคายเคือง โปรดตรวจสอบข้อควรระวังก่อนปลูก
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenDisclaimer}
                className="text-xs text-[#DFC488] underline hover:text-white transition-colors"
              >
                อ่านข้อจำกัดความรับผิดชอบ
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Standards */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#A8B89A]">
          <div>
            © {new Date().getFullYear()} SACRED CANOPY (ร่มโพธิ์ ร่มไทร). สงวนลิขสิทธิ์ตามกฎหมาย.
          </div>
          <div className="flex items-center gap-4">
            <button onClick={onOpenDisclaimer} className="hover:text-white transition-colors">
              นโยบายความเป็นส่วนตัว
            </button>
            <span>·</span>
            <button onClick={onOpenDisclaimer} className="hover:text-white transition-colors">
              ข้อกำหนดการใช้งาน
            </button>
            <span>·</span>
            <button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors">
              แจ้งข้อมูลคลาดเคลื่อน
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
