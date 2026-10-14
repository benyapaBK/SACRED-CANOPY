import React, { useState } from 'react';
import { Plant, QuizResult, UserProfile } from '../types';
import { db } from '../services/firebase';
import { doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { 
  ChevronRight, 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  RotateCcw, 
  CheckCircle2, 
  ShieldAlert, 
  Heart, 
  Sun, 
  Home, 
  Clock, 
  HeartHandshake,
  TreePine,
  Flower2
} from 'lucide-react';

interface QuizPageProps {
  plants: Plant[];
  favorites: string[];
  onToggleFavorite: (plantId: string) => void;
  onSelectPlant: (plant: Plant) => void;
  currentUser: UserProfile;
  onOpenAuthModal: () => void;
}

interface Question {
  id: string;
  title: string;
  subtitle: string;
  options: {
    label: string;
    description: string;
    value: string;
    icon?: string;
  }[];
}

const QUIZ_QUESTIONS: Question[] = [
  {
    id: 'purpose',
    title: '1. คุณสนใจปลูกต้นไม้เพื่อวัตถุประสงค์หลักใด?',
    subtitle: 'เลือกสิริมงคลหรือเป้าหมายที่ตรงกับความต้องการในชีวิตช่วงนี้',
    options: [
      { label: 'โชคลาภ ค้าขาย ร่ำรวย', description: 'เสริมการเงิน ดึงดูดทรัพย์สิน และความเจริญรุ่งเรือง', value: 'wealth' },
      { label: 'การงาน บารมี ความสำเร็จ', description: 'เลื่อนขั้น ชนะอุปสรรค เพิ่มอำนาจวาสนา', value: 'career' },
      { label: 'บ้านร่มเย็น ปกป้องคุ้มครอง', description: 'ครอบครัวปรองดอง ขจัดภัยร้ายและพลังงานลบ', value: 'home' },
      { label: 'สุขภาพ ฟอกอากาศ ผ่อนคลาย', description: 'ฟอกอากาศ ลดฝุ่นพิษ เสริมสร้างพลังชีวิตและความสดชื่น', value: 'health' },
      { label: 'ความรัก เมตตามหานิยม', description: 'ผู้ใหญ่เอ็นดู มีเสน่ห์ มิตรภาพราบรื่น', value: 'love' },
    ],
  },
  {
    id: 'space',
    title: '2. สภาพพื้นที่สำหรับปลูกเป็นอย่างไร?',
    subtitle: 'ขนาดและลักษณะของสถานที่เพื่อความเหมาะสมกับทรงพุ่มและระบบราก',
    options: [
      { label: 'คอนโดมิเนียม / ระเบียง', description: 'พื้นที่กะทัดรัด แดดส่องบางช่วงเวลา', value: 'คอนโด/ระเบียง' },
      { label: 'ทาวน์โฮม / พื้นที่หน้าบ้านจำกัด', description: 'มีมุมหน้าบ้านหรือแนวรั้วขนาดกลาง', value: 'ทาวน์โฮม/พื้นที่จำกัด' },
      { label: 'บ้านเดี่ยว / สวนกว้าง', description: 'มีดินลึก มีพื้นที่สำหรับไม้ใหญ่แผ่ร่มเงา', value: 'บ้านเดี่ยว/สวนกว้าง' },
      { label: 'ในอาคาร / ห้องแอร์ / โต๊ะทำงาน', description: 'วางบนโต๊ะ ข้างหน้าต่าง หรือห้องปรับอากาศ', value: 'ในอาคาร/โต๊ะทำงาน' },
    ],
  },
  {
    id: 'sunlight',
    title: '3. ปริมาณแสงแดดในบริเวณนั้นเป็นอย่างไร?',
    subtitle: 'แสงสว่างคือหัวใจของการสังเคราะห์แสง',
    options: [
      { label: 'แดดจัดเต็มวัน (6+ ชม.)', description: 'กลางแจ้ง แดดส่องตรงตลอดทั้งวัน', value: 'แดดจัดเต็มวัน' },
      { label: 'แดดรำไร / แดดครึ่งวัน', description: 'ใต้ร่มไม้ มีสแลนกรองแสง หรือแดดเช้าช่วงสั้นๆ', value: 'แดดรำไร' },
      { label: 'ร่ม / ในร่มอาคาร', description: 'แสงสว่างสะท้อนผ่านหน้าต่าง ไม่มีแดดส่องตรง', value: 'ร่ม/ในอาคาร' },
    ],
  },
  {
    id: 'careTime',
    title: '4. คุณมีเวลาและประสบการณ์ในการดูแลต้นไม้ระดับใด?',
    subtitle: 'เลือกให้สอดคล้องกับกิจวัตรประจำวันของคุณ',
    options: [
      { label: 'เวลาน้อยมาก (1-2 ครั้ง/สัปดาห์)', description: 'ต้องการพืชทนทานสูง ลืมรดน้ำได้ ไม่ตายง่าย', value: 'minimal' },
      { label: 'ปานกลาง (รดน้ำ 2-3 วันครั้ง)', description: 'สามารถดูแลทั่วไป ตัดแต่งกิ่งและใส่ปุ๋ยได้ตามรอบ', value: 'moderate' },
      { label: 'เวลาเยอะ ชอบดูแลทุกวัน', description: 'มีความสุขกับการรดน้ำเช้าเย็นและใส่ใจรายละเอียด', value: 'dedicated' },
    ],
  },
  {
    id: 'pets',
    title: '5. ที่บ้านมีเด็กเล็ก หรือสัตว์เลี้ยง (สุนัข/แมว) หรือไม่?',
    subtitle: 'ความปลอดภัยด้านพิษวิทยาและการระคายเคือง',
    options: [
      { label: 'มีสัตว์เลี้ยง/เด็กเล็ก (ให้ความสำคัญกับความปลอดภัย)', description: 'เน้นพิจารณาข้อมูลความเป็นพิษของต้นไม้ต่อสัตว์เลี้ยงและเด็ก', value: 'petSafe' },
      { label: 'ไม่มีสัตว์เลี้ยง / สามารถวางในที่พ้นมือได้', description: 'สามารถเลือกปลูกได้ทุกพรรณไม้ตามความเหมาะสม', value: 'any' },
    ],
  },
  {
    id: 'style',
    title: '6. ลักษณะทรงพรรณไม้ที่คุณชื่นชอบเป็นพิเศษ?',
    subtitle: 'ความลงตัวทางสายตาและสุนทรียภาพ',
    options: [
      { label: 'ไม้ดอกหอม สีสันสดใส', description: 'เน้นดอกสวย มีกลิ่นหอมชื่นใจ ช่วยบำบัดอารมณ์', value: 'flower' },
      { label: 'ไม้ใบเขียวชอุ่ม ร่มรื่น', description: 'ใบหนาทึบ ลายด่างสวย สบายตา ให้ร่มเงา', value: 'foliage' },
      { label: 'ไม้อวบน้ำ เล็ก กะทัดรัด มินิมอล', description: 'รูปทรงน่ารัก จัดวางง่ายบนโต๊ะหรือชั้นวาง', value: 'compact' },
    ],
  },
];

export const QuizPage: React.FC<QuizPageProps> = ({
  plants,
  favorites,
  onToggleFavorite,
  onSelectPlant,
  currentUser,
  onOpenAuthModal,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<QuizResult[] | null>(null);
  const [saveStatus, setSaveStatus] = useState('');

  const currentQ = QUIZ_QUESTIONS[currentStep];
  const progressPercent = Math.round(((currentStep + 1) / QUIZ_QUESTIONS.length) * 100);

  const handleSelectOption = (value: string) => {
    const updatedAnswers = { ...answers, [currentQ.id]: value };
    setAnswers(updatedAnswers);

    if (currentStep < QUIZ_QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      const matched = calculateResults(updatedAnswers);
      void saveQuizResult(updatedAnswers, matched);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const calculateResults = (finalAnswers: Record<string, string>): QuizResult[] => {
    const scored: QuizResult[] = plants.map((plant) => {
      let score = 50; // base score
      const reasons: string[] = [];

      // Purpose match
      if (finalAnswers.purpose && plant.belief.types.includes(finalAnswers.purpose as any)) {
        score += 25;
        reasons.push(`สอดคล้องกับเป้าหมายด้าน ${plant.belief.culturalMeaning.slice(0, 35)}...`);
      }

      // Space match
      if (finalAnswers.space && plant.spaceType === finalAnswers.space) {
        score += 20;
        reasons.push(`เหมาะกับพื้นที่ประเภท ${plant.spaceType}`);
      }

      // Sunlight match
      if (finalAnswers.sunlight && plant.care.sunlight === finalAnswers.sunlight) {
        score += 15;
        reasons.push(`ต้องการแสง ${plant.care.sunlight} ตรงกับสภาพแวดล้อมของคุณ`);
      }

      // Pet safety check
      let safetyWarning: string | undefined = undefined;
      if (finalAnswers.pets === 'petSafe') {
        if (plant.safety.toxicityPets === 'ปลอดภัยต่อสุนัขและแมว') {
          score += 20;
          reasons.push('ข้อมูลในฐานระบุว่าปลอดภัยต่อสุนัขและแมว');
        } else {
          score -= 40;
          safetyWarning = `คำเตือน: พืชนี้${plant.safety.toxicityPets} (${plant.safety.caution})`;
        }
      }

      // Care level
      if (finalAnswers.careTime === 'minimal') {
        if (plant.careLevel === 'ดูแลง่ายมาก') score += 15;
        else if (plant.careLevel === 'ดูแลง่าย') score += 10;
        else score -= 10;
      }

      return {
        plant,
        score: Math.min(Math.max(score, 10), 99),
        reasons,
        safetyWarning,
      };
    });

    // Sort by highest score
    scored.sort((a, b) => b.score - a.score);
    const matched = scored.slice(0, 3);
    setResults(matched);
    return matched;
  };

  const saveQuizResult = async (finalAnswers: Record<string, string>, matched: QuizResult[]) => {
    if (currentUser.role === 'guest' || !currentUser.uid) return;
    setSaveStatus('กำลังบันทึกผลการประเมินลงบัญชีของคุณ…');
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnapshot = await getDoc(userRef);
      if (!userSnapshot.exists()) {
        setSaveStatus('แสดงผลการประเมินแล้ว แต่ไม่พบโปรไฟล์ใน Firestore จึงยังบันทึกประวัติไม่ได้');
        return;
      }
      const data = userSnapshot.data();
      const previousHistory = Array.isArray(data.quizHistory) ? data.quizHistory : [];
      const historyItem = {
        id: `quiz-${Date.now()}`,
        answers: finalAnswers,
        results: matched.map((item) => ({
          plantId: item.plant.plantId,
          score: item.score,
          reasons: item.reasons.slice(0, 6),
          safetyWarning: item.safetyWarning || '',
        })),
        createdAt: new Date().toISOString(),
      };
      await updateDoc(userRef, {
        quizHistory: [...previousHistory, historyItem].slice(-10),
        updatedAt: serverTimestamp(),
      });
      setSaveStatus('บันทึกผลการประเมินไว้ในบัญชีของคุณแล้ว สามารถกลับมาทำแบบประเมินใหม่ได้เสมอ 🌱');
    } catch (error) {
      console.error('Unable to save plant quiz result:', error);
      setSaveStatus('คำนวณผลสำเร็จแล้ว แต่บันทึกประวัติไม่สำเร็จ โปรดตรวจสอบ Firestore Rules ให้รองรับ quizHistory');
    }
  };

  const handleReset = () => {
    setAnswers({});
    setCurrentStep(0);
    setResults(null);
    setSaveStatus('');
  };

  if (currentUser.role === 'guest') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center space-y-4 font-body">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#183D2B] text-[#C6A96B]"><Flower2 className="h-8 w-8" /></div>
        <h1 className="text-2xl font-bold text-[#183D2B]">ค้นหาต้นไม้ที่เหมาะกับคุณ</h1>
        <p className="text-sm leading-relaxed text-[#7A746B]">สมัครสมาชิกหรือเข้าสู่ระบบก่อนทำแบบประเมิน เพื่อบันทึกผลต้นไม้ที่เหมาะกับคุณไว้ในบัญชี</p>
        <button onClick={onOpenAuthModal} className="rounded-xl bg-[#183D2B] px-5 py-3 text-sm font-semibold text-white hover:bg-[#25523B]">เข้าสู่ระบบ / สมัครสมาชิก</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-body">
      {/* Breadcrumb */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs text-[#7A746B]">
          <span>หน้าหลัก</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-[#183D2B]">Plant Quiz ค้นหาต้นไม้ที่เหมาะกับคุณ</span>
        </div>
        <h1 className="text-3xl font-display font-bold text-[#183D2B]">
          ค้นหาไม้มงคลที่ใช่ในแบบคุณ
        </h1>
        <p className="text-xs text-[#7A746B]">
          วิเคราะห์ความต้องการเชิงพฤกษศาสตร์ คติความเชื่อ และความปลอดภัยใน 6 ขั้นตอน
        </p>
      </div>

      {!results ? (
        /* Quiz Steps Interface */
        <div className="bg-white rounded-2xl border border-[#EEE7DA] p-6 sm:p-10 shadow-sm space-y-8">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[#7A746B]">
              <span>คำถามที่ {currentStep + 1} จาก {QUIZ_QUESTIONS.length}</span>
              <span className="font-mono font-bold text-[#183D2B]">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-[#EEE7DA] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#183D2B] transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Question Title */}
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-[#183D2B]">
              {currentQ.title}
            </h2>
            <p className="text-xs sm:text-sm text-[#7A746B]">
              {currentQ.subtitle}
            </p>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 gap-3">
            {currentQ.options.map((opt) => {
              const isSelected = answers[currentQ.id] === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => handleSelectOption(opt.value)}
                  className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between group ${
                    isSelected
                      ? 'bg-[#FAF7F0] border-[#183D2B] ring-1 ring-[#183D2B]'
                      : 'bg-white border-[#EEE7DA] hover:border-[#C6A96B] hover:bg-[#FAF7F0]/40'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="text-sm font-bold text-[#183D2B] group-hover:text-[#A48545] transition-colors">
                      {opt.label}
                    </div>
                    <div className="text-xs text-[#7A746B]">{opt.description}</div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ml-4 ${
                    isSelected ? 'border-[#183D2B] bg-[#183D2B] text-white' : 'border-[#B8BCC2]'
                  }`}>
                    {isSelected && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Back Step Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-[#EEE7DA]">
            <button
              onClick={handlePrevStep}
              disabled={currentStep === 0}
              className={`flex items-center gap-1 text-xs font-semibold px-4 py-2 rounded-lg transition-colors ${
                currentStep === 0
                  ? 'text-[#B8BCC2] cursor-not-allowed'
                  : 'text-[#183D2B] hover:bg-[#FAF7F0]'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>ย้อนกลับ</span>
            </button>
            <span className="text-[11px] text-[#7A746B]">
              แตะเลือกคำตอบเพื่อไปยังข้อถัดไปอัตโนมัติ
            </span>
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="space-y-8 animate-in fade-in duration-300">
          {saveStatus && <div aria-live="polite" className="rounded-xl border border-[#DCCB9F] bg-[#FFFCF5] px-4 py-3 text-xs leading-relaxed text-[#183D2B]">{saveStatus}</div>}
          <div className="bg-[#183D2B] text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-[#C6A96B]/30 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 text-xs text-[#C6A96B] font-semibold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>ผลการประมวลผลความสอดคล้อง</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold">
                พรรณไม้ที่เหมาะสมกับคุณที่สุด
              </h2>
              <p className="text-xs text-[#A8B89A] max-w-xl">
                คำนวณจากคุณสมบัติทางพฤกษศาสตร์ ระดับแสงแดด พื้นที่ปลูก และความปลอดภัย
              </p>
            </div>
            <button
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#FAF7F0] border border-white/20 text-xs font-semibold flex items-center gap-2 transition-colors shrink-0"
            >
              <RotateCcw className="w-4 h-4 text-[#C6A96B]" />
              <span>ทำแบบทดสอบใหม่</span>
            </button>
          </div>

          {/* 3 Matched Plant Result Cards */}
          <div className="space-y-6">
            {results.map((res, index) => {
              const plant = res.plant;
              const isFav = favorites.includes(plant.plantId);
              return (
                <div
                  key={plant.plantId}
                  className="bg-white rounded-2xl border border-[#EEE7DA] hover:border-[#C6A96B] shadow-sm p-6 sm:p-8 flex flex-col md:flex-row items-start gap-6 transition-all"
                >
                  <div className="w-full md:w-56 aspect-[4/3] rounded-xl overflow-hidden bg-stone-200 shrink-0 relative">
                    <img
                      src={plant.images[0]}
                      alt={plant.thaiName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-[#183D2B] text-[#C6A96B] text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                      อันดับ #{index + 1}
                    </div>
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#A48545] bg-[#FAF7F0] px-2 py-0.5 rounded border border-[#C6A96B]/30">
                            {plant.plantId}
                          </span>
                          <h3 className="text-xl font-bold text-[#183D2B]">
                            {plant.thaiName}
                          </h3>
                        </div>
                        <p className="text-xs italic text-[#7A746B] font-serif mt-0.5">
                          {plant.scientificName} · วงศ์ {plant.family}
                        </p>
                      </div>

                      {/* Compatibility Score */}
                      <div className="text-right">
                        <span className="text-2xl font-bold text-[#183D2B] font-mono">
                          {res.score}%
                        </span>
                        <span className="text-[10px] text-[#A48545] block font-medium">ความเข้ากันได้</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#49382C] leading-relaxed">
                      {plant.belief.culturalMeaning}
                    </p>

                    {/* Match Reasons */}
                    <div className="space-y-1.5 pt-2 border-t border-[#EEE7DA]">
                      <span className="text-[11px] font-bold text-[#183D2B] block">เหตุผลที่แนะนำ:</span>
                      <ul className="space-y-1 text-xs text-[#49382C]">
                        {res.reasons.map((r, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32] shrink-0" />
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Pet Safety Caution if any */}
                    {res.safetyWarning && (
                      <div className="p-2.5 rounded-lg bg-[#FFF3E0] border border-[#FFE0B2] flex items-center gap-2 text-xs text-[#E65100]">
                        <ShieldAlert className="w-4 h-4 shrink-0" />
                        <span>{res.safetyWarning}</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-3">
                      <button
                        onClick={() => onSelectPlant(plant)}
                        className="px-4 py-2 bg-[#183D2B] text-white rounded-lg text-xs font-semibold hover:bg-[#25523B] transition-colors"
                      >
                        ดูข้อมูลเชิงลึก & วิธีดูแล
                      </button>
                      <button
                        onClick={() => onToggleFavorite(plant.plantId)}
                        className={`p-2 rounded-lg border transition-colors flex items-center gap-1.5 text-xs font-medium ${
                          isFav
                            ? 'bg-[#FAF7F0] border-[#C6A96B] text-[#183D2B]'
                            : 'border-[#EEE7DA] text-[#7A746B] hover:text-[#183D2B]'
                        }`}
                      >
                        <Heart className="w-4 h-4" fill={isFav ? '#C6A96B' : 'none'} stroke={isFav ? '#C6A96B' : 'currentColor'} />
                        <span>{isFav ? 'บันทึกแล้ว' : 'บันทึกในรายการโปรด'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
