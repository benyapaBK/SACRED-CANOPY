import React, { useState } from 'react';
import { Plant } from '../types';
import { 
  X, 
  Heart, 
  Share2, 
  Check, 
  Sparkles, 
  ShieldAlert, 
  BookOpen, 
  Compass, 
  Droplets, 
  Sun, 
  Thermometer, 
  Info,
  ExternalLink,
  ChevronRight,
  User,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Image as ImageIcon
} from 'lucide-react';

interface PlantDetailModalProps {
  plant: Plant | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (plantId: string) => void;
  onSelectPlant: (plant: Plant) => void;
  allPlants: Plant[];
  canFavorite?: boolean;
}

export const PlantDetailModal: React.FC<PlantDetailModalProps> = ({
  plant,
  onClose,
  isFavorite,
  onToggleFavorite,
  onSelectPlant,
  allPlants,
  canFavorite = true,
}) => {
  const [activeTab, setActiveTab] = useState<'botany' | 'belief' | 'care' | 'safety' | 'reference'>('botany');
  const [copied, setCopied] = useState(false);

  if (!plant) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + '?plant=' + plant.plantId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${plant.thaiName} (${plant.scientificName}) — SACRED CANOPY`,
          text: `ทำความรู้จักไม้มงคล ${plant.thaiName}: ${plant.belief.culturalMeaning}`,
          url: window.location.origin + '?plant=' + plant.plantId,
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  // Find related plants from same category or same belief
  const relatedPlants = allPlants
    .filter((p) => p.plantId !== plant.plantId && (p.categoryId === plant.categoryId || p.belief.types.some(t => plant.belief.types.includes(t))))
    .slice(0, 3);

  const isPetSafe = plant.safety.petSafe === 'ใช่' || plant.safety.toxicityPets === 'ปลอดภัยต่อสุนัขและแมว';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#FAF7F0] rounded-2xl shadow-2xl border border-[#C6A96B]/40 overflow-hidden my-6 max-h-[92vh] flex flex-col font-body">
        {/* Header Bar */}
        <div className="px-6 py-4 bg-[#183D2B] text-[#FAF7F0] flex items-center justify-between border-b border-[#C6A96B]/30 shrink-0">
          <div className="flex items-center gap-2 text-xs text-[#A8B89A] truncate">
            <span>ฐานข้อมูล</span>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            <span className="font-mono text-[#C6A96B] font-semibold">{plant.plantId}</span>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            <span className="text-white font-medium truncate">{plant.thaiName}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {canFavorite && <button
              onClick={() => onToggleFavorite(plant.plantId)}
              className={`p-2 rounded-lg transition-colors ${
                isFavorite
                  ? 'bg-[#C6A96B] text-[#0F271B]'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              title={isFavorite ? 'นำออกจากรายการโปรด' : 'บันทึกในรายการโปรด'}
            >
              <Heart className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} />
            </button>}
            <button
              onClick={handleShare}
              className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              title="แชร์ข้อมูล"
            >
              {copied ? <Check className="w-4 h-4 text-[#A7C957]" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors ml-2"
              title="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Top Hero Section: Photo + Essential Taxonomy */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-5 relative aspect-[4/3] rounded-xl overflow-hidden shadow-md bg-stone-200">
              <img
                src={plant.images[0] || '/images/botanical_ratchaphruek_1791992174219.jpg'}
                alt={plant.thaiName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.visibility = 'hidden';
                }}
              />
              <div className="absolute bottom-2 left-2 bg-[#183D2B]/90 text-white text-[11px] px-2 py-0.5 rounded font-mono">
                รหัสพรรณไม้: {plant.plantId}
              </div>
              {plant.imageCredit && (
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white/90 text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
                  <ImageIcon className="w-3 h-3 text-[#C6A96B]" />
                  <span>ภาพประกอบจริง</span>
                </div>
              )}
            </div>

            <div className="md:col-span-7 space-y-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="font-semibold text-[#A48545] uppercase tracking-wider">
                    {plant.family}
                  </span>
                  {plant.growthType && (
                    <>
                      <span className="text-[#A8B89A]">·</span>
                      <span className="text-[#183D2B] font-medium">{plant.growthType}</span>
                    </>
                  )}
                  {plant.characteristics.height && (
                    <>
                      <span className="text-[#A8B89A]">·</span>
                      <span className="text-[#7A746B]">สูง {plant.characteristics.height}</span>
                    </>
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#183D2B] mt-0.5">
                  {plant.thaiName}
                </h2>
                <p className="text-sm italic font-serif text-[#7A746B]">
                  {plant.scientificName} {plant.englishName ? `(${plant.englishName})` : ''}
                </p>
                {plant.localName && (
                  <p className="text-xs text-[#7A746B] mt-0.5">
                    ชื่อพื้นเมือง/ท้องถิ่น: <span className="text-[#49382C]">{plant.localName}</span>
                  </p>
                )}
                {plant.otherNames && plant.otherNames.length > 0 && (
                  <p className="text-xs text-[#7A746B] mt-0.5">
                    ชื่อเรียกอื่น: <span className="text-[#49382C]">{plant.otherNames.join(', ')}</span>
                  </p>
                )}
              </div>

              <p className="text-xs sm:text-sm text-[#49382C] leading-relaxed border-l-2 border-[#C6A96B] pl-3 py-1 bg-[#EEE7DA]/40 rounded-r">
                {plant.description}
              </p>

              {/* Suitability Badges */}
              {plant.suitability && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {plant.suitability.condo && (
                    <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                      ✓ ปลูกคอนโดได้
                    </span>
                  )}
                  {plant.suitability.balcony && (
                    <span className="text-[11px] px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                      ✓ ระเบียง
                    </span>
                  )}
                  {plant.suitability.pot && (
                    <span className="text-[11px] px-2 py-0.5 rounded bg-stone-100 text-stone-800 border border-stone-200 font-medium">
                      ✓ ไม้กระถาง
                    </span>
                  )}
                  {plant.suitability.limitedSpace && (
                    <span className="text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-medium">
                      ✓ พื้นที่จำกัด
                    </span>
                  )}
                  {plant.suitability.busyFriendly && (
                    <span className="text-[11px] px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 font-medium">
                      ✓ คนไม่มีเวลา
                    </span>
                  )}
                  {plant.suitability.beginner && (
                    <span className="text-[11px] px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 font-medium">
                      ✓ มือใหม่หัดปลูก
                    </span>
                  )}
                </div>
              )}

              {/* Quick Spec Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-[#EEE7DA]">
                  <span className="text-[10px] text-[#7A746B] block">ระดับแสงแดด</span>
                  <span className="font-medium text-[#183D2B]">{plant.care.sunlight}</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-[#EEE7DA]">
                  <span className="text-[10px] text-[#7A746B] block">การให้น้ำ</span>
                  <span className="font-medium text-[#183D2B]">{plant.care.water}</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-[#EEE7DA]">
                  <span className="text-[10px] text-[#7A746B] block">ระดับการดูแล</span>
                  <span className="font-medium text-[#183D2B]">{plant.careLevel}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 5 Tab Navigation Segmented Control */}
          <div className="flex border-b border-[#EEE7DA] overflow-x-auto gap-2 pt-2">
            {[
              { id: 'botany', label: '1. พฤกษศาสตร์' },
              { id: 'belief', label: '2. ความหมาย & คติความเชื่อ' },
              { id: 'care', label: '3. การปลูกและดูแล' },
              { id: 'safety', label: '4. ข้อควรระวัง & ความปลอดภัย' },
              { id: 'reference', label: '5. แหล่งอ้างอิง & ที่มา' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-[#183D2B] text-[#183D2B]'
                    : 'border-transparent text-[#7A746B] hover:text-[#183D2B]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: ลักษณะทางพฤกษศาสตร์ */}
          {activeTab === 'botany' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-[#EEE7DA] space-y-1">
                  <h4 className="text-xs font-bold text-[#183D2B] uppercase tracking-wider">ลักษณะทั่วไป</h4>
                  <p className="text-xs text-[#49382C] leading-relaxed">{plant.characteristics.general}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-[#EEE7DA] space-y-1">
                  <h4 className="text-xs font-bold text-[#183D2B] uppercase tracking-wider">ลักษณะลำต้น & กิ่งก้าน</h4>
                  <p className="text-xs text-[#49382C] leading-relaxed">
                    {plant.characteristics.stem || plant.growthType || 'ตามลักษณะสายพันธุ์'}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-[#EEE7DA] space-y-1">
                  <h4 className="text-xs font-bold text-[#183D2B] uppercase tracking-wider">ลักษณะใบ</h4>
                  <p className="text-xs text-[#49382C] leading-relaxed">{plant.characteristics.leaf || 'ตามลักษณะสายพันธุ์'}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-[#EEE7DA] space-y-1">
                  <h4 className="text-xs font-bold text-[#183D2B] uppercase tracking-wider">ลักษณะดอก</h4>
                  <p className="text-xs text-[#49382C] leading-relaxed">
                    {plant.characteristics.flower || 'ไม่มีดอก หรือออกดอกยากในการปลูกประดับ'}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-[#EEE7DA] space-y-1">
                  <h4 className="text-xs font-bold text-[#183D2B] uppercase tracking-wider">ผลและเมล็ด</h4>
                  <p className="text-xs text-[#49382C] leading-relaxed">
                    {plant.characteristics.fruitSeed || plant.characteristics.fruit || 'ตามลักษณะสายพันธุ์'}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-[#EEE7DA] space-y-1">
                  <h4 className="text-xs font-bold text-[#183D2B] uppercase tracking-wider">จุดเด่นทางสายพันธุ์ (Botanical Highlight)</h4>
                  <p className="text-xs text-[#49382C] leading-relaxed">{plant.characteristics.highlight || 'พรรณไม้มงคลทรงคุณค่า'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: ความหมายและความเชื่อ */}
          {activeTab === 'belief' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-white p-5 rounded-xl border border-[#EEE7DA] space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#183D2B]">
                  <Sparkles className="w-4 h-4 text-[#C6A96B]" />
                  <span>คติความเชื่อและมรดกทางวัฒนธรรมไทย</span>
                </div>
                <p className="text-xs sm:text-sm text-[#49382C] leading-relaxed">
                  {plant.belief.culturalMeaning}
                </p>
                {plant.belief.auspiciousDirection && (
                  <div className="pt-2 border-t border-[#EEE7DA] flex items-center gap-2 text-xs text-[#A48545] font-medium">
                    <Compass className="w-4 h-4" />
                    <span>ทิศปลูกมงคล: {plant.belief.auspiciousDirection}</span>
                  </div>
                )}
              </div>

              {plant.belief.auspicious && (
                <div className="bg-[#FAF7F0] p-4 rounded-xl border border-[#C6A96B]/50 space-y-1">
                  <h4 className="text-xs font-bold text-[#183D2B] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#C6A96B]" />
                    <span>ด้านสิริมงคลที่เด่นที่สุด</span>
                  </h4>
                  <p className="text-xs text-[#49382C] leading-relaxed">{plant.belief.auspicious}</p>
                </div>
              )}

              {plant.belief.beliefOrigin && (
                <div className="bg-white p-4 rounded-xl border border-[#EEE7DA] space-y-1">
                  <h4 className="text-xs font-bold text-[#183D2B]">ที่มาของความเชื่อ / คติสัญลักษณ์โบราณ</h4>
                  <p className="text-xs text-[#49382C] leading-relaxed">{plant.belief.beliefOrigin}</p>
                </div>
              )}

              {plant.belief.meaning && (
                <div className="bg-white p-4 rounded-xl border border-[#EEE7DA] space-y-1">
                  <h4 className="text-xs font-bold text-[#183D2B]">ความหมายของชื่อตามสำนวนไทย</h4>
                  <p className="text-xs text-[#49382C] leading-relaxed">{plant.belief.meaning}</p>
                </div>
              )}

              <div className="bg-white p-4 rounded-xl border border-[#EEE7DA] space-y-1">
                <h4 className="text-xs font-bold text-[#183D2B]">การใช้ประโยชน์ทางภูมิปัญญาและสรรพคุณ</h4>
                <p className="text-xs text-[#49382C] leading-relaxed">{plant.belief.benefits}</p>
              </div>

              {/* Cultural Disclaimer Notice */}
              <div className="bg-[#EEE7DA]/50 p-3 rounded-lg text-[11px] text-[#7A746B] leading-relaxed">
                *หมายเหตุทางวิชาการ: ข้อมูลความเชื่อเป็นการรวบรวมคติชนวิทยาและภูมิปัญญาโบราณ มิได้รับประกันผลลัพธ์ที่เป็นรูปธรรมทางวิทยาศาสตร์
              </div>
            </div>
          )}

          {/* Tab 3: การปลูกและการดูแล */}
          {activeTab === 'care' && (
            <div className="space-y-4 animate-in fade-in">
              {/* Detailed Multi-Step Planting Guide */}
              {plant.care.planting && (
                <div className="bg-white p-5 rounded-xl border border-[#C6A96B]/40 space-y-3">
                  <h4 className="text-xs font-bold text-[#183D2B] uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                    <span>ขั้นตอนและวิธีการปลูกอย่างละเอียด (Step-by-Step Planting Guide)</span>
                  </h4>
                  <div className="space-y-2 text-xs text-[#49382C] leading-relaxed whitespace-pre-line bg-[#FAF7F0] p-4 rounded-lg border border-[#EEE7DA]">
                    {plant.care.planting}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-white p-4 rounded-xl border border-[#EEE7DA]">
                  <span className="font-bold text-[#183D2B] block mb-1">ดินและวัสดุปลูก:</span>
                  <p className="text-[#49382C] leading-relaxed">{plant.care.soil}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-[#EEE7DA]">
                  <span className="font-bold text-[#183D2B] block mb-1">การให้ปุ๋ยบำรุง:</span>
                  <p className="text-[#49382C] leading-relaxed">{plant.care.fertilizer}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-[#EEE7DA]">
                  <span className="font-bold text-[#183D2B] block mb-1">การขยายพันธุ์:</span>
                  <p className="text-[#49382C] leading-relaxed">{plant.care.propagation}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-[#EEE7DA]">
                  <span className="font-bold text-[#183D2B] block mb-1">การตัดแต่งทรงพุ่ม:</span>
                  <p className="text-[#49382C] leading-relaxed">{plant.care.pruning}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-[#EEE7DA]">
                  <span className="font-bold text-[#183D2B] block mb-1">แมลงศัตรูพืชที่พบบ่อย:</span>
                  <p className="text-[#49382C] leading-relaxed">{plant.care.pests}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-[#EEE7DA]">
                  <span className="font-bold text-[#183D2B] block mb-1">โรคพืชที่ต้องระวัง:</span>
                  <p className="text-[#49382C] leading-relaxed">{plant.care.disease || 'โรครากเน่าและโคนเน่าจากการรดน้ำขังแฉะ'}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-[#EEE7DA] sm:col-span-2">
                  <span className="font-bold text-[#183D2B] block mb-1">วิธีป้องกันและดูแลรักษา:</span>
                  <p className="text-[#49382C] leading-relaxed">{plant.care.prevention}</p>
                </div>
              </div>

              {plant.suitability?.suitableUser && (
                <div className="bg-white p-4 rounded-xl border border-[#EEE7DA] space-y-1.5 text-xs">
                  <h4 className="font-bold text-[#183D2B]">กลุ่มผู้ปลูกที่เหมาะสม (Suitable Grower Profile):</h4>
                  <p className="text-[#49382C] leading-relaxed whitespace-pre-line">{plant.suitability.suitableUser}</p>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: ความปลอดภัย */}
          {activeTab === 'safety' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-white p-5 rounded-xl border border-[#EEE7DA] space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#D32F2F]">
                  <ShieldAlert className="w-4 h-4" />
                  <span>ข้อควรระวังและความปลอดภัย</span>
                </div>
                <p className="text-xs text-[#49382C] leading-relaxed">
                  {plant.safety.caution || 'ปลอดภัยต่อการปลูกประดับทั่วไป'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="bg-[#FAF7F0] p-3 rounded-lg border border-[#EEE7DA]">
                    <span className="text-[10px] text-[#7A746B] block">ระดับความปลอดภัยต่อมนุษย์</span>
                    <span className="font-bold text-[#183D2B]">{plant.safety.toxicityHuman}</span>
                  </div>
                  <div className="bg-[#FAF7F0] p-3 rounded-lg border border-[#EEE7DA]">
                    <span className="text-[10px] text-[#7A746B] block">ความปลอดภัยต่อสุนัขและแมว</span>
                    <span className={`font-bold ${isPetSafe ? 'text-[#2E7D32]' : 'text-[#E65100]'}`}>
                      {plant.safety.toxicityPets}
                    </span>
                  </div>
                </div>

                {plant.safety.petToxicity && (
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 text-xs text-amber-900 space-y-1">
                    <span className="font-bold block">อาการเมื่อสัตว์เลี้ยงสัมผัสหรือกัดแทะ:</span>
                    <p className="whitespace-pre-line leading-relaxed">{plant.safety.petToxicity}</p>
                  </div>
                )}

                {plant.safety.toxicParts && (
                  <div className="bg-[#FAF7F0] p-3 rounded-lg border border-[#EEE7DA] text-xs text-[#49382C] space-y-0.5">
                    <span className="font-bold text-[#183D2B]">ส่วนที่เป็นพิษ:</span>
                    <p>{plant.safety.toxicParts}</p>
                  </div>
                )}

                <div className="pt-2 text-[11px] text-[#7A746B]">
                  สถาบัน/แหล่งข้อมูลตรวจสอบ: {plant.safety.safetyReference}
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: แหล่งข้อมูลอ้างอิง & ที่มา */}
          {activeTab === 'reference' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-white p-5 rounded-xl border border-[#EEE7DA] space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[#183D2B]">
                  <BookOpen className="w-4 h-4 text-[#C6A96B]" />
                  <span>เอกสารและงานวิจัยพฤกษศาสตร์อ้างอิง</span>
                </div>

                {/* Primary Source URL */}
                {(plant.source || plant.sourceUrl) && (
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-emerald-900 block">ลิงก์แหล่งข้อมูลต้นฉบับ (Primary Botanical Archive):</span>
                      <span className="text-[11px] text-emerald-700 font-mono truncate max-w-md block">
                        {plant.source || plant.sourceUrl}
                      </span>
                    </div>
                    <a
                      href={plant.source || plant.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-[#183D2B] text-white rounded-lg text-xs font-medium hover:bg-[#25523B] transition-colors flex items-center gap-1 shrink-0"
                    >
                      <span>เปิดลิงก์</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                {/* Image Credit */}
                {plant.imageCredit && (
                  <div className="p-3 bg-[#FAF7F0] rounded-lg border border-[#EEE7DA] text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[#183D2B] block">ที่มารูปภาพ (Image Credit & Archives):</span>
                      <span className="text-[11px] text-[#7A746B] font-mono truncate max-w-md block">
                        {plant.imageCredit}
                      </span>
                    </div>
                    <a
                      href={plant.images[0] || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-[#C6A96B] text-[#0F271B] rounded-lg text-xs font-medium hover:bg-[#DFC488] transition-colors flex items-center gap-1 shrink-0"
                    >
                      <span>ดูภาพต้นฉบับ</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {/* Curators & Update History */}
                <div className="p-3.5 bg-[#FAF7F0] rounded-lg border border-[#EEE7DA] text-xs space-y-1">
                  <div className="font-bold text-[#183D2B] flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#C6A96B]" />
                    <span>ข้อมูลผู้บันทึกและประวัติสารสนเทศ:</span>
                  </div>
                  <div className="text-[11px] text-[#7A746B] space-y-0.5">
                    {plant.createdByName && (
                      <p>ผู้บันทึกข้อมูล: <span className="text-[#183D2B] font-medium">{plant.createdByName}</span> {plant.createdByEmail ? `(${plant.createdByEmail})` : ''}</p>
                    )}
                    {plant.updatedByName && (
                      <p>ปรับปรุงล่าสุดโดย: <span className="text-[#183D2B] font-medium">{plant.updatedByName}</span></p>
                    )}
                    <p>วันที่ลงทะเบียน: {new Date(plant.createdAt).toLocaleDateString('th-TH')}</p>
                  </div>
                </div>

                <ul className="space-y-2 text-xs">
                  {plant.references.map((ref, idx) => (
                    <li key={`ref-${ref.title}-${idx}`} className="p-3 bg-[#FAF7F0] rounded-lg border border-[#EEE7DA]">
                      <div className="font-semibold text-[#183D2B]">{ref.title}</div>
                      <div className="text-[11px] text-[#7A746B] mt-0.5">
                        ผู้จัดทำ: {ref.author} · วันที่ตรวจสอบ: {ref.verifiedDate}
                      </div>
                      {ref.url && (
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-[#A48545] hover:underline mt-1"
                        >
                          <span>ตรวจสอบแหล่งข้อมูลต้นฉบับ</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Complete imported CSV record: show every populated source field */}
          {plant.sourceData && Object.values(plant.sourceData).some((value) => String(value || '').trim()) && (
            <section className="border border-[#E7DECD] bg-white rounded-xl p-5 space-y-4">
              <div>
                <h3 className="text-base font-bold text-[#183D2B]">ข้อมูลทั้งหมดจากฐานข้อมูล CSV</h3>
                <p className="text-xs text-[#7A746B] mt-1">แสดงข้อมูลทุกช่องที่มีข้อมูลอยู่ในไฟล์ต้นฉบับ พร้อมลิงก์และเครดิตที่แนบมา</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {Object.entries(plant.sourceData).filter(([key, value]) => key !== 'ลิงก์รูปภาพ (URL)' && String(value || '').trim()).map(([key, value]) => (
                  <div key={key} className="min-w-0">
                    <div className="text-[11px] font-bold text-[#A48545] mb-1">{key}</div>
                    <div className="text-sm text-[#49382C] whitespace-pre-wrap break-words leading-relaxed">{value}</div>
                  </div>
                ))}
                {plant.sourceData['ลิงก์รูปภาพ (URL)'] && (
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-[#A48545] mb-1">ลิงก์รูปภาพ (URL)</div>
                    <a href={plant.sourceData['ลิงก์รูปภาพ (URL)']} target="_blank" rel="noreferrer" className="text-sm text-blue-700 underline break-all">เปิดภาพต้นฉบับ</a>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Related Plants Recommendation */}
          {relatedPlants.length > 0 && (
            <div className="pt-4 border-t border-[#EEE7DA]">
              <h4 className="text-xs font-bold text-[#183D2B] uppercase tracking-wider mb-3">
                พรรณไม้ที่เกี่ยวข้องกันในหมวดหมู่นี้
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {relatedPlants.map((rel) => (
                  <button
                    key={`rel-${rel.plantId}`}
                    onClick={() => onSelectPlant(rel)}
                    className="flex items-center gap-3 p-2 bg-white rounded-lg border border-[#EEE7DA] hover:border-[#C6A96B] text-left transition-colors"
                  >
                    <img
                      src={rel.images[0]}
                      alt={rel.thaiName}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/botanical_ratchaphruek_1791992174219.jpg';
                      }}
                    />
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-[#183D2B] truncate">{rel.thaiName}</div>
                      <div className="text-[10px] text-[#7A746B] italic truncate">{rel.scientificName}</div>
                      <div className="text-[10px] text-[#A48545] font-mono">{rel.plantId}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
