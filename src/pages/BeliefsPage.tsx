import React, { useState } from 'react';
import { Plant, BeliefCategory } from '../types';
import { BELIEFS_DATA } from '../data/beliefs';
import { PlantCard } from '../components/PlantCard';
import { ChevronRight, Compass, Sparkles, Shield, HeartHandshake, Award, Coins, Home, ShieldPlus, BookOpen } from 'lucide-react';

interface BeliefsPageProps {
  plants: Plant[];
  favorites: string[];
  onToggleFavorite: (plantId: string) => void;
  onSelectPlant: (plant: Plant) => void;
  initialBeliefId?: string;
}

export const BeliefsPage: React.FC<BeliefsPageProps> = ({
  plants,
  favorites,
  onToggleFavorite,
  onSelectPlant,
  initialBeliefId,
}) => {
  const [selectedBeliefId, setSelectedBeliefId] = useState<string>(
    initialBeliefId || BELIEFS_DATA[0].id
  );

  const activeBelief = BELIEFS_DATA.find((b) => b.id === selectedBeliefId) || BELIEFS_DATA[0];

  const beliefPlants = plants.filter((p) => p.belief.types.includes(activeBelief.id as any));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 font-body">
      {/* Breadcrumb & Title */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-[#7A746B]">
          <span>หน้าหลัก</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-[#183D2B]">ความหมายและคติความเชื่อ</span>
        </div>
        <h1 className="text-3xl font-display font-bold text-[#183D2B]">
          คติความเชื่อและสิริมงคล 8 ประการ
        </h1>
        <p className="text-xs text-[#7A746B] max-w-3xl leading-relaxed">
          นำเสนอองค์ความรู้ในฐานะมรดกทางวัฒนธรรม วิถีชน และสัญลักษณ์เชิงจิตวิญญาณของบรรพบุรุษไทย
          ผสานภูมิปัญญาการจัดวางตำแหน่งพฤกษาตามทิศมงคลโบราณ
        </p>
      </div>

      {/* 8 Belief Cards Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {BELIEFS_DATA.map((belief) => {
          const isSelected = belief.id === activeBelief.id;
          return (
            <button
              key={belief.id}
              onClick={() => setSelectedBeliefId(belief.id)}
              className={`p-3 rounded-xl border text-center transition-all ${
                isSelected
                  ? 'bg-[#183D2B] text-white border-[#C6A96B] shadow-md'
                  : 'bg-white text-[#292B29] border-[#EEE7DA] hover:border-[#C6A96B]'
              }`}
            >
              <h3 className="text-xs font-bold line-clamp-1">{belief.title}</h3>
              <span className={`text-[10px] mt-0.5 block ${isSelected ? 'text-[#C6A96B]' : 'text-[#7A746B]'}`}>
                {belief.englishTitle}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Belief Feature Banner */}
      <div className="bg-[#183D2B] text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-[#C6A96B]/30 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-semibold text-[#C6A96B] tracking-wider uppercase">
            {activeBelief.englishTitle}
          </span>
          {activeBelief.direction && (
            <div className="flex items-center gap-1.5 text-xs text-[#DFC488] bg-black/20 px-3 py-1 rounded-full border border-[#C6A96B]/30">
              <Compass className="w-3.5 h-3.5" />
              <span>ทิศมงคลตามตำรา: {activeBelief.direction}</span>
            </div>
          )}
        </div>

        <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
          {activeBelief.title}
        </h2>

        <p className="text-xs sm:text-sm text-[#FAF7F0]/90 leading-relaxed max-w-3xl">
          {activeBelief.description}
        </p>

        {/* Academic Cultural Clarification */}
        <div className="pt-2 border-t border-white/10 text-[11px] text-[#A8B89A] leading-relaxed">
          * ข้อสงวนสิทธิ์: คติความเชื่อเป็นมรดกทางภูมิปัญญาไทยที่ช่วยสร้างกำลังใจและระเบียบวินัยในการดูแลธรรมชาติ มิได้เป็นการการันตีผลลัพธ์ทางโชคลาภ
        </div>
      </div>

      {/* Plants matching this belief */}
      <div className="space-y-6">
        <div className="text-sm font-bold text-[#183D2B]">
          ไม้มงคลที่เสริมด้าน{activeBelief.title} ({beliefPlants.length} พันธุ์ไม้)
        </div>

        {beliefPlants.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-[#EEE7DA] text-center text-xs text-[#7A746B]">
            ยังไม่มีพันธุ์ไม้ที่จัดอยู่ในกลุ่มความเชื่อนี้
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {beliefPlants.map((plant) => (
              <PlantCard
                key={plant.plantId}
                plant={plant}
                isFavorite={favorites.includes(plant.plantId)}
                onToggleFavorite={onToggleFavorite}
                onSelectPlant={onSelectPlant}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
