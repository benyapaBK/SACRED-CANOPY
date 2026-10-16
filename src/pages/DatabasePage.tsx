import React, { useState, useMemo } from 'react';
import { Plant, Category } from '../types';
import { store } from '../services/store';
import { PlantCard } from '../components/PlantCard';
import { BELIEFS_DATA } from '../data/beliefs';
import { 
  Search, 
  Filter, 
  X, 
  SlidersHorizontal, 
  LayoutGrid, 
  List, 
  ArrowUpDown, 
  ShieldCheck, 
  Sparkles,
  RotateCcw,
  ChevronRight,
  Sun,
  Droplets,
  Heart
} from 'lucide-react';

interface DatabasePageProps {
  plants: Plant[];
  categories: Category[];
  favorites: string[];
  onToggleFavorite: (plantId: string) => void;
  onSelectPlant: (plant: Plant) => void;
  initialSearchQuery?: string;
  initialCategory?: string;
  initialBelief?: string;
  canExport?: boolean;
}

export const DatabasePage: React.FC<DatabasePageProps> = ({
  plants,
  categories,
  favorites,
  onToggleFavorite,
  onSelectPlant,
  initialSearchQuery = '',
  initialCategory = '',
  initialBelief = '',
  canExport = false,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBelief, setSelectedBelief] = useState(initialBelief);
  const [selectedSunlight, setSelectedSunlight] = useState('');
  const [selectedWater, setSelectedWater] = useState('');
  const [selectedSpace, setSelectedSpace] = useState('');
  const [selectedCareLevel, setSelectedCareLevel] = useState('');
  const [onlyPetSafe, setOnlyPetSafe] = useState(false);
  const [sortBy, setSortBy] = useState<'nameAsc' | 'nameDesc' | 'code' | 'recent'>('code');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);

  const handleExport = () => {
    if (!canExport) return;
    const csv = store.exportPlantsCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sacred-canopy-plants.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filter & Search Logic
  const filteredPlants = useMemo(() => {
    return plants.filter((plant) => {
      // Search matching Thai name, English, scientific, family, otherNames, keywords, code
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchThai = plant.thaiName.toLowerCase().includes(q);
        const matchEng = plant.englishName.toLowerCase().includes(q);
        const matchSci = plant.scientificName.toLowerCase().includes(q);
        const matchFamily = plant.family.toLowerCase().includes(q);
        const matchCode = plant.plantId.toLowerCase().includes(q);
        const matchOther = plant.otherNames?.some((n) => n.toLowerCase().includes(q));
        const matchKeywords = plant.keywords?.some((k) => k.toLowerCase().includes(q));
        if (!matchThai && !matchEng && !matchSci && !matchFamily && !matchCode && !matchOther && !matchKeywords) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory && plant.categoryId !== selectedCategory) {
        return false;
      }

      // Belief filter
      if (selectedBelief && !plant.belief.types.includes(selectedBelief as any)) {
        return false;
      }

      // Sunlight
      if (selectedSunlight && plant.care.sunlight !== selectedSunlight) {
        return false;
      }

      // Water
      if (selectedWater && plant.care.water !== selectedWater) {
        return false;
      }

      // Space
      if (selectedSpace && plant.spaceType !== selectedSpace) {
        return false;
      }

      // Care level
      if (selectedCareLevel && plant.careLevel !== selectedCareLevel) {
        return false;
      }

      // Pet safe
      if (onlyPetSafe && plant.safety.toxicityPets !== 'ปลอดภัยต่อสุนัขและแมว') {
        return false;
      }

      return true;
    });
  }, [
    plants,
    searchQuery,
    selectedCategory,
    selectedBelief,
    selectedSunlight,
    selectedWater,
    selectedSpace,
    selectedCareLevel,
    onlyPetSafe,
  ]);

  // Sorting
  const sortedPlants = useMemo(() => {
    const list = [...filteredPlants];
    if (sortBy === 'nameAsc') {
      return list.sort((a, b) => a.thaiName.localeCompare(b.thaiName, 'th'));
    }
    if (sortBy === 'nameDesc') {
      return list.sort((a, b) => b.thaiName.localeCompare(a.thaiName, 'th'));
    }
    if (sortBy === 'recent') {
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    // Default 'code'
    return list.sort((a, b) => a.plantId.localeCompare(b.plantId));
  }, [filteredPlants, sortBy]);

  const displayedPlants = sortedPlants.slice(0, visibleCount);

  const activeFilterCount = [
    selectedCategory,
    selectedBelief,
    selectedSunlight,
    selectedWater,
    selectedSpace,
    selectedCareLevel,
    onlyPetSafe ? 'petSafe' : '',
  ].filter(Boolean).length;

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedBelief('');
    setSelectedSunlight('');
    setSelectedWater('');
    setSelectedSpace('');
    setSelectedCareLevel('');
    setOnlyPetSafe(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-body">
      {/* Breadcrumb & Title */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-[#7A746B]">
          <span>หน้าหลัก</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-[#183D2B]">ฐานข้อมูลไม้มงคล</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-[#183D2B]">
              ฐานข้อมูลไม้มงคลไทย
            </h1>
            <p className="text-xs text-[#7A746B] mt-1">
              สำรวจ ค้นหา และเปรียบเทียบข้อมูลพฤกษศาสตร์ คติความเชื่อ และการดูแลรักษา
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#7A746B]">
            <span>แสดง <span className="font-bold text-[#183D2B]">{sortedPlants.length}</span> จากทั้งหมด {plants.length} พันธุ์ไม้</span>
            {canExport && <button onClick={handleExport} className="px-3 py-2 rounded-lg border border-[#C6A96B]/60 text-[#183D2B] font-semibold hover:bg-white">ส่งออก CSV</button>}
          </div>
        </div>
      </div>

      {/* Search Bar & Primary Utility Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#C6A96B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อไทย, ชื่อวิทยาศาสตร์, ชื่อวงศ์, คำค้น หรือรหัส (เช่น A01)..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-[#EEE7DA] focus:border-[#C6A96B] text-xs sm:text-sm text-[#292B29] placeholder-[#7A746B] shadow-sm focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7A746B] hover:text-[#183D2B]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Drawer Toggle (Mobile) */}
        <button
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          className="lg:hidden flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-[#EEE7DA] rounded-xl text-xs font-semibold text-[#183D2B]"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#C6A96B]" />
          <span>ตัวกรองละเอียด {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}</span>
        </button>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none bg-white border border-[#EEE7DA] rounded-xl px-4 py-2.5 pr-8 text-xs font-medium text-[#183D2B] shadow-sm focus:outline-none cursor-pointer"
            >
              <option value="code">เรียงตามรหัสพันธุ์ไม้ (A01...)</option>
              <option value="nameAsc">ชื่อพันธุ์ไม้ (ก - ฮ)</option>
              <option value="nameDesc">ชื่อพันธุ์ไม้ (ฮ - ก)</option>
              <option value="recent">บันทึกล่าสุด</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-[#7A746B] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Grid / List Layout Toggle */}
          <div className="flex items-center bg-white border border-[#EEE7DA] rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-[#183D2B] text-white' : 'text-[#7A746B] hover:text-[#183D2B]'
              }`}
              title="มุมมองแบบตาราง (Grid)"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-[#183D2B] text-white' : 'text-[#7A746B] hover:text-[#183D2B]'
              }`}
              title="มุมมองแบบรายการ (List)"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Chips / Clear All Row */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-[#7A746B]">ตัวกรองที่เลือก:</span>
          {selectedCategory && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#183D2B] text-white rounded-md">
              หมวด: {categories.find((c) => c.categoryId === selectedCategory)?.name}
              <button onClick={() => setSelectedCategory('')}><X className="w-3 h-3" /></button>
            </span>
          )}
          {selectedBelief && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#183D2B] text-white rounded-md">
              ความเชื่อ: {BELIEFS_DATA.find((b) => b.id === selectedBelief)?.title}
              <button onClick={() => setSelectedBelief('')}><X className="w-3 h-3" /></button>
            </span>
          )}
          {selectedSunlight && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#183D2B] text-white rounded-md">
              แสง: {selectedSunlight}
              <button onClick={() => setSelectedSunlight('')}><X className="w-3 h-3" /></button>
            </span>
          )}
          {selectedSpace && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#183D2B] text-white rounded-md">
              พื้นที่: {selectedSpace}
              <button onClick={() => setSelectedSpace('')}><X className="w-3 h-3" /></button>
            </span>
          )}
          {onlyPetSafe && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#2E7D32] text-white rounded-md">
              ปลอดภัยต่อสัตว์เลี้ยง
              <button onClick={() => setOnlyPetSafe(false)}><X className="w-3 h-3" /></button>
            </span>
          )}
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1 text-[#A48545] hover:text-[#183D2B] font-semibold ml-2"
          >
            <RotateCcw className="w-3 h-3" />
            <span>ล้างตัวกรองทั้งหมด</span>
          </button>
        </div>
      )}

      {/* Main Content Layout: Sidebar Filters + Plant Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Filter Sidebar (or Mobile Drawer) */}
        <aside
          className={`${
            mobileFilterOpen ? 'block fixed inset-0 z-50 p-4 bg-black/50 overflow-y-auto' : 'hidden'
          } lg:block lg:static lg:p-0`}
        >
          <div className="bg-white p-5 rounded-2xl border border-[#EEE7DA] shadow-sm space-y-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#EEE7DA]">
              <div className="flex items-center gap-2 text-xs font-bold text-[#183D2B] uppercase tracking-wider">
                <Filter className="w-4 h-4 text-[#C6A96B]" />
                <span>จำแนกตามคุณสมบัติ</span>
              </div>
              {mobileFilterOpen && (
                <button onClick={() => setMobileFilterOpen(false)} className="lg:hidden text-[#7A746B]">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Filter 1: Category */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#183D2B] block">หมวดหมู่ 8 พันธุ์ไม้</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full text-xs p-2 rounded-lg bg-[#FAF7F0] border border-[#EEE7DA] focus:outline-none"
              >
                <option value="">ทุกหมวดหมู่ (A - H)</option>
                {categories.map((c) => (
                  <option key={c.categoryId} value={c.categoryId}>
                    {c.prefix}: {c.name} ({c.plantCount})
                  </option>
                ))}
              </select>
            </div>

            {/* Filter 2: Belief & Meaning */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#183D2B] block">คติความเชื่อและสิริมงคล</label>
              <select
                value={selectedBelief}
                onChange={(e) => setSelectedBelief(e.target.value)}
                className="w-full text-xs p-2 rounded-lg bg-[#FAF7F0] border border-[#EEE7DA] focus:outline-none"
              >
                <option value="">ทุกด้านสิริมงคล</option>
                {BELIEFS_DATA.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter 3: Sunlight */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#183D2B] block">ความต้องการแสงแดด</label>
              <select
                value={selectedSunlight}
                onChange={(e) => setSelectedSunlight(e.target.value)}
                className="w-full text-xs p-2 rounded-lg bg-[#FAF7F0] border border-[#EEE7DA] focus:outline-none"
              >
                <option value="">ทุกระดับแสง</option>
                <option value="แดดจัดเต็มวัน">แดดจัดเต็มวัน</option>
                <option value="แดดรำไร">แดดรำไร</option>
                <option value="ร่ม/ในอาคาร">ร่ม / ในอาคาร</option>
              </select>
            </div>

            {/* Filter 4: Space Type */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#183D2B] block">สภาพพื้นที่ปลูก</label>
              <select
                value={selectedSpace}
                onChange={(e) => setSelectedSpace(e.target.value)}
                className="w-full text-xs p-2 rounded-lg bg-[#FAF7F0] border border-[#EEE7DA] focus:outline-none"
              >
                <option value="">ทุกขนาดพื้นที่</option>
                <option value="คอนโด/ระเบียง">คอนโด / ระเบียง</option>
                <option value="ทาวน์โฮม/พื้นที่จำกัด">ทาวน์โฮม / พื้นที่จำกัด</option>
                <option value="บ้านเดี่ยว/สวนกว้าง">บ้านเดี่ยว / สวนกว้าง</option>
                <option value="ในอาคาร/โต๊ะทำงาน">ในอาคาร / โต๊ะทำงาน</option>
              </select>
            </div>

            {/* Filter 5: Water requirement */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#183D2B] block">ความถี่ในการรดน้ำ</label>
              <select
                value={selectedWater}
                onChange={(e) => setSelectedWater(e.target.value)}
                className="w-full text-xs p-2 rounded-lg bg-[#FAF7F0] border border-[#EEE7DA] focus:outline-none"
              >
                <option value="">ทุกรอบการรดน้ำ</option>
                <option value="รดน้ำทุกวัน">รดน้ำทุกวัน</option>
                <option value="รดน้ำวันเว้นวัน">รดน้ำวันเว้นวัน</option>
                <option value="รดน้ำ 2-3 วันครั้ง">รดน้ำ 2-3 วันครั้ง</option>
                <option value="รดน้ำสัปดาห์ละ 1-2 ครั้ง">รดน้ำสัปดาห์ละ 1-2 ครั้ง</option>
              </select>
            </div>

            {/* Filter 6: Safety for Pets Toggle */}
            <div className="pt-2 border-t border-[#EEE7DA]">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyPetSafe}
                  onChange={(e) => setOnlyPetSafe(e.target.checked)}
                  className="rounded text-[#183D2B] focus:ring-[#C6A96B]"
                />
                <span className="text-xs font-medium text-[#183D2B]">
                  เฉพาะพันธุ์ไม้ที่ปลอดภัยต่อสัตว์เลี้ยง 🐾
                </span>
              </label>
            </div>

            {/* Clear Filters Button inside Sidebar */}
            <button
              onClick={handleClearFilters}
              className="w-full py-2 rounded-lg border border-[#EEE7DA] hover:border-[#C6A96B] text-xs font-medium text-[#7A746B] hover:text-[#183D2B] transition-colors"
            >
              ล้างค่าตัวกรอง
            </button>
          </div>
        </aside>

        {/* Results Grid / List */}
        <main className="lg:col-span-3 space-y-6">
          {displayedPlants.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-2xl border border-[#EEE7DA] p-12 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#FAF7F0] flex items-center justify-center text-[#A48545]">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-[#183D2B]">
                ไม่พบพันธุ์ไม้ที่ตรงกับเงื่อนไขการค้นหา
              </h3>
              <p className="text-xs text-[#7A746B] max-w-md mx-auto">
                ลองลดหรือปรับเปลี่ยนคำค้นหา ปลดตัวกรองบางรายการ หรือค้นหาด้วยชื่ออื่น
              </p>
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-[#183D2B] text-[#FAF7F0] rounded-xl text-xs font-semibold hover:bg-[#25523B] transition-colors"
              >
                ล้างตัวกรองทั้งหมด
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {displayedPlants.map((plant) => (
                <PlantCard
                  key={plant.plantId}
                  plant={plant}
                  isFavorite={favorites.includes(plant.plantId)}
                  onToggleFavorite={onToggleFavorite}
                  onSelectPlant={onSelectPlant}
                />
              ))}
            </div>
          ) : (
            /* List View */
            <div className="space-y-3">
              {displayedPlants.map((plant) => (
                <div
                  key={plant.plantId}
                  onClick={() => onSelectPlant(plant)}
                  className="group bg-white p-4 rounded-xl border border-[#EEE7DA] hover:border-[#C6A96B] shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={plant.images[0]}
                      alt={plant.thaiName}
                      className="w-16 h-16 rounded-lg object-cover shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/botanical_ratchaphruek_1791992174219.jpg';
                      }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#A48545] bg-[#FAF7F0] px-1.5 py-0.5 rounded border border-[#C6A96B]/30">
                          {plant.plantId}
                        </span>
                        <h3 className="text-sm font-bold text-[#183D2B] group-hover:text-[#A48545] transition-colors">
                          {plant.thaiName}
                        </h3>
                      </div>
                      <p className="text-xs italic text-[#7A746B] font-serif">
                        {plant.scientificName} · วงศ์ {plant.family}
                      </p>
                      <p className="text-xs text-[#49382C] line-clamp-1 mt-0.5 max-w-xl">
                        {plant.belief.culturalMeaning}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    <span className="text-xs text-[#7A746B] hidden md:inline">
                      {plant.care.sunlight}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(plant.plantId);
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        favorites.includes(plant.plantId)
                          ? 'text-[#C6A96B] bg-[#183D2B]'
                          : 'text-[#7A746B] hover:text-[#183D2B] bg-[#FAF7F0]'
                      }`}
                      title="รายการโปรด"
                    >
                      <Heart
                        className="w-4 h-4"
                        fill={favorites.includes(plant.plantId) ? 'currentColor' : 'none'}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More Pagination */}
          {visibleCount < sortedPlants.length && (
            <div className="text-center pt-6">
              <button
                onClick={() => setVisibleCount((prev) => prev + 12)}
                className="px-6 py-2.5 rounded-xl bg-white border border-[#C6A96B] text-[#183D2B] hover:bg-[#FAF7F0] font-semibold text-xs transition-colors shadow-sm"
              >
                โหลดแสดงเพิ่มเติม ({sortedPlants.length - visibleCount} รายการที่เหลือ)
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
