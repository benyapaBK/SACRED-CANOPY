import React from 'react';
import { NavigationPage } from '../components/Header';
import { 
  ChevronRight, 
  ShieldCheck, 
  BookOpen, 
  TreePine, 
  Sparkles, 
  Award, 
  HelpCircle, 
  Mail,
  GraduationCap
} from 'lucide-react';

interface AboutPageProps {
  onNavigate: (page: NavigationPage) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 font-body">
      {/* Breadcrumb & Title */}
      <div className="space-y-2 text-center max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-2 text-xs text-[#7A746B]">
          <span>หน้าหลัก</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-[#183D2B]">เกี่ยวกับเรา</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-[#183D2B]">
          เกี่ยวกับ SACRED CANOPY
        </h1>
        <p className="text-xs sm:text-sm text-[#A48545] font-semibold tracking-wider uppercase">
          ร่มโพธิ์ ร่มไทร · ร่มเงาแห่งสิริมงคล
        </p>
      </div>

      {/* Hero Narrative Canvas */}
      <div className="bg-white rounded-2xl border border-[#EEE7DA] p-6 sm:p-10 shadow-sm space-y-6">
        <div className="aspect-[21/9] rounded-xl overflow-hidden bg-stone-200">
          <img
            src="/images/thai_botanical_courtyard_1791992219544.jpg"
            alt="แนวคิดร่มโพธิ์ร่มไทร"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-display font-bold text-[#183D2B]">
            1. ปรัชญาและแนวคิดการจัดทำ
          </h2>
          <p className="text-xs sm:text-sm text-[#49382C] leading-relaxed">
            คำว่า <strong>“ร่มโพธิ์ ร่มไทร”</strong> ในวัฒนธรรมไทย เป็นสัญลักษณ์แห่งร่มเงาของต้นไม้ใหญ่ 
            ที่แผ่กิ่งก้านสาขาให้ความร่มเย็น ปลอดภัย และความมั่นคง ดุจดั่งผู้ใหญ่และบรรพบุรุษที่คอยปกป้องคุ้มครองบริวาร 
            ในทางนิเวศวิทยา พืชสกุลโพและไทร (Ficus) คือชนิดพันธุ์หลัก (Keystone species) ที่ค้ำจุนความหลากหลายทางชีวภาพ
          </p>
          <p className="text-xs sm:text-sm text-[#49382C] leading-relaxed">
            โครงการ <strong>SACRED CANOPY</strong> จึงถือกำเนิดขึ้นเพื่อเป็นฐานข้อมูลสารสนเทศพฤกษศาสตร์ไม้มงคลไทย
            ที่ก้าวข้ามเพียงความเชื่อเรื่องโชคลาภ แต่เชื่อมโยงองค์ความรู้ด้านสรีรวิทยาของพืช การจัดสวนตามทิศทางลมแดด 
            และการดูแลรักษาที่ถูกต้องตามหลักวิชาการ
          </p>
        </div>
      </div>

      {/* 2. Core Pillars (3 Pillars) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-[#EEE7DA] space-y-2 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] flex items-center justify-center text-[#183D2B]">
            <BookOpen className="w-5 h-5 text-[#C6A96B]" />
          </div>
          <h3 className="text-sm font-bold text-[#183D2B]">BOTANICAL KNOWLEDGE</h3>
          <p className="text-xs text-[#7A746B] leading-relaxed">
            ระบุชื่อวิทยาศาสตร์ วงศ์พืช ลักษณะสัณฐานวิทยา ดิน แสง น้ำ และความปลอดภัยอย่างเป็นระบบ
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#EEE7DA] space-y-2 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] flex items-center justify-center text-[#183D2B]">
            <Sparkles className="w-5 h-5 text-[#C6A96B]" />
          </div>
          <h3 className="text-sm font-bold text-[#183D2B]">THAI CULTURE</h3>
          <p className="text-xs text-[#7A746B] leading-relaxed">
            สืบสานมรดกทางวัฒนธรรม คติความเชื่อ และภูมิปัญญาโบราณในฐานะวรรณศิลป์และสัญลักษณ์นำใจ
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#EEE7DA] space-y-2 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] flex items-center justify-center text-[#183D2B]">
            <ShieldCheck className="w-5 h-5 text-[#C6A96B]" />
          </div>
          <h3 className="text-sm font-bold text-[#183D2B]">WELL-BEING & SAFETY</h3>
          <p className="text-xs text-[#7A746B] leading-relaxed">
            ส่งเสริมคุณภาพชีวิต สุขภาพจิตที่ดี และความปลอดภัยสูงสุดต่อเด็กและสัตว์เลี้ยงในบ้าน
          </p>
        </div>
      </div>

      {/* 3. Methodology & Separation of Folklore from Science */}
      <div className="bg-[#183D2B] text-white rounded-2xl p-6 sm:p-8 space-y-4 shadow-lg border border-[#C6A96B]/30">
        <h2 className="text-xl sm:text-2xl font-display font-bold text-[#C6A96B]">
          มาตรฐานการคัดกรองและการจำแนกข้อมูล
        </h2>
        <div className="space-y-3 text-xs sm:text-sm text-[#FAF7F0]/90 leading-relaxed font-body">
          <p>
            ทางเว็บไซต์ยึดมั่นใน <strong>หลักความโปร่งใสทางวิชาการ (Intellectual Rigor)</strong> โดยแบ่งแยกเนื้อหาชัดเจน:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#A8B89A]">
            <li>
              <strong>ข้อมูลทางพฤกษศาสตร์และการดูแล</strong>: ทวนสอบจากหอพรรณไม้ กรมอุทยานแห่งชาติฯ และสมาคมพฤกษศาสตร์
            </li>
            <li>
              <strong>ข้อมูลความปลอดภัยและพิษวิทยา</strong>: อ้างอิงฐานข้อมูลสากล ASPCA Animal Poison Control, NASA Clean Air Study และกระทรวงสาธารณสุข
            </li>
            <li>
              <strong>ข้อมูลความเชื่อและสิริมงคล</strong>: นำเสนอในฐานะมรดกทางคติชนวิทยา โดยไม่มีการอ้างว่าสามารถพิสูจน์ผลลัพธ์ทางโชคลาภหรือการเงินได้ด้วยตนเอง
            </li>
          </ul>
        </div>
      </div>

      {/* 4. Curators & Editorial Placeholders */}
      <div className="space-y-6">
        <h2 className="text-xl font-display font-bold text-[#183D2B]">
          คณะผู้พัฒนาและที่ปรึกษาด้านสารสนเทศ
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-xl border border-[#EEE7DA] space-y-2">
            <span className="text-[11px] font-semibold text-[#A48545] uppercase tracking-wider">
              งานสารสนเทศและสถาปัตยกรรมระบบ
            </span>
            <h3 className="text-sm font-bold text-[#183D2B]">ฝ่ายสารสนเทศและฐานข้อมูลพฤกษศาสตร์</h3>
            <p className="text-xs text-[#7A746B] leading-relaxed">
              ดูแลโครงสร้างข้อมูล การเชื่อมโยงระบบค้นหา การออกแบบประสบการณ์ผู้ใช้ (UI/UX) และระบบความปลอดภัย
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-[#EEE7DA] space-y-2">
            <span className="text-[11px] font-semibold text-[#A48545] uppercase tracking-wider">
              งานทวนสอบพรรณไม้และคติชนวิทยา
            </span>
            <h3 className="text-sm font-bold text-[#183D2B]">กองบรรณาธิการพฤกษศาสตร์และวัฒนธรรม</h3>
            <p className="text-xs text-[#7A746B] leading-relaxed">
              รวบรวมเอกสารทางประวัติศาสตร์ วรรณคดีไทย และตรวจสอบความถูกต้องของชื่อวิทยาศาสตร์
            </p>
          </div>
        </div>
      </div>

      {/* Footer Navigation CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-[#FAF7F0] rounded-2xl border border-[#EEE7DA]">
        <div className="text-xs text-[#7A746B]">
          มีข้อเสนอแนะเพิ่มเติม หรือต้องการข้อมูลการร่วมมือทางวิชาการ?
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('help')}
            className="px-4 py-2 bg-white border border-[#EEE7DA] rounded-lg text-xs font-semibold text-[#183D2B] hover:border-[#C6A96B]"
          >
            ศูนย์ช่วยเหลือ Q&A
          </button>
          <button
            onClick={() => onNavigate('contact')}
            className="px-4 py-2 bg-[#183D2B] text-white rounded-lg text-xs font-semibold hover:bg-[#25523B]"
          >
            ติดต่อเรา
          </button>
        </div>
      </div>
    </div>
  );
};
