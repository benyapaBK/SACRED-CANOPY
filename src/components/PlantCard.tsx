import React from 'react';
import { Plant } from '../types';
import { Heart, ArrowUpRight, ShieldAlert, Sparkles, Sun, Droplets } from 'lucide-react';

interface PlantCardProps {
  plant: Plant;
  isFavorite: boolean;
  onToggleFavorite: (plantId: string) => void;
  onSelectPlant: (plant: Plant) => void;
}

export const PlantCard: React.FC<PlantCardProps> = ({
  plant,
  isFavorite,
  onToggleFavorite,
  onSelectPlant,
}) => {
  const isToxicToPets = plant.safety.toxicityPets === 'เป็นพิษต่อสุนัขและแมว';

  return (
    <div className="group relative flex flex-col bg-white rounded-xl border border-[#EEE7DA] hover:border-[#C6A96B]/60 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden text-left">
      {/* Top Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#EEE7DA]/50">
        <img
          src={plant.images[0] || '/images/botanical_ratchaphruek_1791992174219.jpg'}
          alt={plant.thaiName}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            // Resilient fallback image
            (e.target as HTMLImageElement).style.visibility = 'hidden';
          }}
        />

        {/* Auspicious Code Badge (Top Left) */}
        <div className="absolute top-3 left-3 bg-[#183D2B]/90 backdrop-blur-sm text-[#FAF7F0] text-xs font-mono px-2 py-0.5 rounded tracking-wide border border-[#C6A96B]/40">
          {plant.plantId}
        </div>

        {/* Favorite Heart Button (Top Right) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(plant.plantId);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-transform active:scale-90 ${
            isFavorite
              ? 'bg-[#183D2B] text-[#C6A96B] shadow-sm'
              : 'bg-white/80 hover:bg-white text-[#49382C] hover:text-[#183D2B]'
          }`}
          title={isFavorite ? 'นำออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'}
          aria-label={`บันทึก ${plant.thaiName} ในรายการโปรด`}
        >
          <Heart
            className="w-4 h-4"
            fill={isFavorite ? '#C6A96B' : 'none'}
            stroke={isFavorite ? '#C6A96B' : 'currentColor'}
          />
        </button>

        {/* Pet toxicity subtle caution flag if toxic */}
        {isToxicToPets && (
          <div className="absolute bottom-2 left-2 bg-[#292B29]/80 backdrop-blur-sm text-[#FFB74D] text-[10px] px-2 py-0.5 rounded flex items-center gap-1 font-body">
            <ShieldAlert className="w-3 h-3" />
            <span>ระวังสำหรับสัตว์เลี้ยง</span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Unboxed Metadata (Frontend Design Skill: No Pill Enclosure) */}
          <div className="text-xs text-[#7A746B] flex items-center gap-1.5 flex-wrap">
            <span className="font-medium text-[#183D2B]">{plant.family}</span>
            <span aria-hidden="true">·</span>
            <span>{plant.care.sunlight}</span>
            <span aria-hidden="true">·</span>
            <span>{plant.spaceType}</span>
          </div>

          {/* Plant Thai Name */}
          <h3 className="mt-1 text-base font-bold text-[#183D2B] group-hover:text-[#A48545] transition-colors line-clamp-1">
            {plant.thaiName}
          </h3>

          {/* Scientific Name */}
          <p className="text-xs italic text-[#7A746B] font-serif line-clamp-1">
            {plant.scientificName}
          </p>

          {/* Short Cultural Meaning */}
          <p className="mt-2 text-xs text-[#49382C] line-clamp-2 leading-relaxed font-body">
            {plant.belief.culturalMeaning}
          </p>
        </div>

        {/* Bottom Action Strip */}
        <div className="pt-2 border-t border-[#EEE7DA] flex items-center justify-between">
          <div className="text-[11px] text-[#A48545] font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>{plant.careLevel}</span>
          </div>

          <button
            onClick={() => onSelectPlant(plant)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#183D2B] group-hover:text-[#A48545] transition-colors"
          >
            <span>ดูข้อมูลเชิงลึก</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
