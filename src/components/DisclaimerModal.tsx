import React from 'react';
import { X, ShieldCheck, Scale, BookOpen } from 'lucide-react';

interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-[#C6A96B]/40 overflow-hidden font-body max-h-[85vh] flex flex-col animate-in fade-in">
        <div className="bg-[#183D2B] text-white p-5 flex items-center justify-between border-b border-[#C6A96B]/30">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#C6A96B]" />
            <h3 className="text-base font-bold">นโยบายความเป็นส่วนตัวและข้อสงวนสิทธิ์</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-xs text-[#49382C] leading-relaxed">
          <section className="space-y-1.5">
            <h4 className="font-bold text-sm text-[#183D2B]">1. การแยกแยะข้อมูลความเชื่อและพฤกษศาสตร์</h4>
            <p>
              เว็บไซต์ <strong>SACRED CANOPY (ร่มโพธิ์ ร่มไทร)</strong> มุ่งเน้นการเผยแพร่สารสนเทศไม้มงคลไทย
              ข้อมูลด้านคติความเชื่อ โชคลาภ และทิศมงคลโบราณ ถูกนำเสนอในฐานะ "มรดกทางวัฒนธรรม คติชนวิทยา และภูมิปัญญาพื้นบ้าน" 
              มิได้รับการยืนยันหรือรับรองผลลัพธ์ที่เป็นรูปธรรมทางวิทยาศาสตร์ ผู้ใช้งานควรใช้วิจารณญาณส่วนบุคคล
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="font-bold text-sm text-[#183D2B]">2. ความปลอดภัยด้านพิษวิทยา (Pet & Child Safety)</h4>
            <p>
              ข้อมูลความเป็นพิษต่อมนุษย์และสัตว์เลี้ยง อ้างอิงจากฐานข้อมูล ASPCA, สถาบันวิจัยสมุนไพร และหอพรรณไม้ 
              อย่างไรก็ดี ปฏิกิริยาการแพ้หรือระคายเคืองอาจแตกต่างกันไปในแต่ละบุคคลหรือสัตว์เลี้ยงแต่ละตัว 
              ควรศึกษาข้อควรระวังก่อนจัดวางในบ้านที่มีเด็กหรือสัตว์เลี้ยงเสมอ
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="font-bold text-sm text-[#183D2B]">3. นโยบายการคุ้มครองข้อมูลส่วนบุคคล (Privacy Policy)</h4>
            <p>
              SACRED CANOPY ยึดมั่นในการเคารพสิทธิความเป็นส่วนตัว ข้อมูลการติดต่อและรายการโปรดของคุณจะถูกจัดเก็บอย่างปลอดภัย 
              และไม่มีการนำไปจำหน่ายหรือส่งต่อแก่บุคคลภายนอกโดยไม่ได้รับความยินยอม
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="font-bold text-sm text-[#183D2B]">4. ลิขสิทธิ์และทรัพย์สินทางปัญญา</h4>
            <p>
              บทความ ภาพถ่ายทางพฤกษศาสตร์ และการจัดหมวดหมู่สารสนเทศ เป็นลิขสิทธิ์ของโครงการ SACRED CANOPY 
              อนุญาตให้นำไปใช้เพื่อประโยชน์ทางการศึกษาและเผยแพร่ความรู้โดยระบุแหล่งที่มาอย่างถูกต้อง
            </p>
          </section>
        </div>

        <div className="p-4 bg-[#FAF7F0] border-t border-[#EEE7DA] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#183D2B] text-white rounded-xl text-xs font-bold hover:bg-[#25523B]"
          >
            รับทราบและปิด
          </button>
        </div>
      </div>
    </div>
  );
};
