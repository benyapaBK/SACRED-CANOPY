import React, { useState } from 'react';
import { Plant, Category } from '../types';
import { PlantCard } from '../components/PlantCard';
import { ChevronRight, Layers, Info, Search } from 'lucide-react';

interface CategoriesPageProps {
  categories: Category[];
  plants: Plant[];
  favorites: string[];
  onToggleFavorite: (plantId: string) => void;
  onSelectPlant: (plant: Plant) => void;
  initialCategoryId?: string;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({
  categories,
  plants,
  favorites,
  onToggleFavorite,
  onSelectPlant,
  initialCategoryId,
}) => {
  const [selectedCatId, setSelectedCatId] = useState<string>(
    initialCategoryId || categories[0]?.categoryId || 'cat-A'
  );
  const [catSearch, setCatSearch] = useState('');

  const activeCategory = categories.find((c) => c.categoryId === selectedCatId) || categories[0];

  const categoryPlants = plants.filter((p) => {
    if (p.categoryId !== activeCategory.categoryId) return false;
    if (catSearch.trim()) {
      const q = catSearch.toLowerCase();
      return (
        p.thaiName.toLowerCase().includes(q) ||
        p.scientificName.toLowerCase().includes(q) ||
        p.plantId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 font-body">
      {/* Breadcrumb & Heading */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-[#7A746B]">
          <span>หน้าหลัก</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-[#183D2B]">หมวดหมู่ไม้มงคล 8 สายพรรณ</span>
        </div>
        <h1 className="text-3xl font-display font-bold text-[#183D2B]">
          หมวดหมู่พฤกษศาสตร์และรหัสกำกับพรรณไม้
        </h1>
        <p className="text-xs text-[#7A746B] max-w-3xl leading-relaxed">
          จำแนกตามรูปทรงสัณฐานวิทยาและนิเวศวิทยาการเจริญเติบโต พร้อมระบบรหัสสารสนเทศมาตรฐาน
          (Prefix A ถึง H) เพื่อความเป็นระเบียบและสืบค้นได้อย่างแม่นยำ
        </p>
      </div>

      {/* 8 Category Selection Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {categories.map((cat) => {
          const isSelected = cat.categoryId === activeCategory.categoryId;
          return (
            <button
              key={cat.categoryId}
              onClick={() => {
                setSelectedCatId(cat.categoryId);
                setCatSearch('');
              }}
              className={`p-3 rounded-xl border text-center transition-all ${
                isSelected
                  ? 'bg-[#183D2B] text-white border-[#C6A96B] shadow-md'
                  : 'bg-white text-[#292B29] border-[#EEE7DA] hover:border-[#C6A96B]'
              }`}
            >
              <span className={`text-[11px] font-mono font-bold block ${isSelected ? 'text-[#C6A96B]' : 'text-[#A48545]'}`}>
                Prefix [{cat.prefix}]
              </span>
              <h3 className="text-xs font-bold mt-1 line-clamp-1">{cat.name}</h3>
              <span className={`text-[10px] mt-0.5 block ${isSelected ? 'text-[#A8B89A]' : 'text-[#7A746B]'}`}>
                {cat.plantCount ?? 0} ชนิด
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Category Marquee Spotlight Banner */}
      <div className="bg-white rounded-2xl border border-[#EEE7DA] p-6 sm:p-8 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#FAF7F0] border border-[#C6A96B]/30 text-xs font-mono text-[#A48545]">
            <span>มาตรฐานรหัสพรรณ: {activeCategory.prefix}01, {activeCategory.prefix}02, {activeCategory.prefix}03...</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#183D2B]">
            หมวด {activeCategory.prefix}: {activeCategory.name} ({activeCategory.englishName})
          </h2>
          <p className="text-xs sm:text-sm text-[#49382C] leading-relaxed">
            {activeCategory.description}
          </p>
        </div>

        <div className="md:col-span-4 aspect-[4/3] rounded-xl overflow-hidden bg-stone-200 shadow-md">
          <img
            src={activeCategory.image}
            alt={activeCategory.name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Search within Category & Results */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-sm font-bold text-[#183D2B]">
            พรรณไม้ในหมวด {activeCategory.name} ({categoryPlants.length} รายการ)
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#C6A96B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={catSearch}
              onChange={(e) => setCatSearch(e.target.value)}
              placeholder={`ค้นหาในหมวด ${activeCategory.name}...`}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white border border-[#EEE7DA] text-xs focus:outline-none focus:border-[#C6A96B]"
            />
          </div>
        </div>

        {categoryPlants.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-[#EEE7DA] text-center text-xs text-[#7A746B]">
            ยังไม่มีพรรณไม้ตรงกับการค้นหาในหมวดหมู่นี้
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoryPlants.map((plant) => (
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
