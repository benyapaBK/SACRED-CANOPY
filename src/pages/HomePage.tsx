import React, { useState } from 'react';
import { Plant, Category, Article } from '../types';
import { NavigationPage } from '../components/Header';
import { VideoHeroBackground } from '../components/VideoHeroBackground';
import { PlantCard } from '../components/PlantCard';
import { BELIEFS_DATA } from '../data/beliefs';
import { 
  Search, 
  ArrowRight, 
  Sparkles, 
  Compass, 
  ShieldCheck, 
  BookOpen, 
  HelpCircle, 
  TreePine, 
  Flame,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: NavigationPage) => void;
  featuredPlants: Plant[];
  recentPlants: Plant[];
  categories: Category[];
  articles: Article[];
  favorites: string[];
  onToggleFavorite: (plantId: string) => void;
  onSelectPlant: (plant: Plant) => void;
  onSearchQuery: (query: string) => void;
  onSelectCategory: (categoryId: string) => void;
  onSelectBelief: (beliefId: string) => void;
  isMember?: boolean;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  featuredPlants,
  recentPlants,
  categories,
  articles,
  favorites,
  onToggleFavorite,
  onSelectPlant,
  onSearchQuery,
  onSelectCategory,
  onSelectBelief,
  isMember = false,
}) => {
  const [heroSearchInput, setHeroSearchInput] = useState('');

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearchInput.trim()) {
      onSearchQuery(heroSearchInput.trim());
      onNavigate('database');
    }
  };

  return (
    <div className="space-y-20 pb-16 font-body">
      {/* 1. Hero Section with Moving Video/Ambient Botanical Canopy */}
      <section className="relative min-h-[640px] lg:min-h-[720px] flex items-center justify-center text-center text-[#FAF7F0] px-4 sm:px-6 lg:px-8 py-20 overflow-hidden">
        <VideoHeroBackground posterImage="/images/hero_sacred_banyan_canopy_1791992156867.jpg" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          {/* Subtle Royal Emblem Kicker */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-[#C6A96B]/40 text-[#C6A96B] text-xs font-medium tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>คลังสารสนเทศและพฤกษศาสตร์ไม้มงคลไทย</span>
          </div>

          {/* Hero Titles */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-white drop-shadow-md">
              SACRED CANOPY
            </h1>
            <p className="text-2xl sm:text-3xl font-display text-[#DFC488] font-medium tracking-normal drop-shadow">
              ร่มโพธิ์ ร่มไทร · ร่มเงาแห่งสิริมงคล
            </p>
          </div>

          {/* Hero Narrative Prose */}
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#FAF7F0]/90 leading-relaxed drop-shadow-sm font-body">
            ผสานองค์ความรู้ด้านพฤกษศาสตร์ การปลูกและดูแลรักษา คติความเชื่อ และวัฒนธรรมไทย
            เพื่อร่มเงาที่มั่นคง สุขภาวะที่ดี และความเจริญรุ่งเรืองอย่างยั่งยืน
          </p>

          {/* Quick Search Form */}
          <form
            onSubmit={handleHeroSearch}
            className="max-w-2xl mx-auto flex items-center bg-white/95 backdrop-blur-md rounded-xl p-1.5 shadow-2xl border border-[#C6A96B]/50 transition-all focus-within:ring-2 focus-within:ring-[#C6A96B]"
          >
            <div className="pl-3 text-[#183D2B]">
              <Search className="w-5 h-5 text-[#C6A96B]" />
            </div>
            <input
              type="text"
              value={heroSearchInput}
              onChange={(e) => setHeroSearchInput(e.target.value)}
              placeholder="ค้นหาชื่อไทย, ชื่อวิทยาศาสตร์, รหัสพรรณไม้ หรือคำมงคล..."
              className="w-full px-3 py-2.5 text-xs sm:text-sm text-[#292B29] placeholder-[#7A746B] focus:outline-none bg-transparent"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-[#183D2B] text-[#FAF7F0] hover:bg-[#25523B] font-semibold text-xs sm:text-sm whitespace-nowrap transition-colors flex items-center gap-1.5"
            >
              <span>ค้นหา</span>
              <ArrowRight className="w-4 h-4 text-[#C6A96B]" />
            </button>
          </form>

          {/* Primary Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm font-semibold">
            <button
              onClick={() => onNavigate('database')}
              className="px-6 py-3 rounded-xl bg-[#C6A96B] text-[#0F271B] hover:bg-[#DFC488] transition-all shadow-md flex items-center gap-2"
            >
              <TreePine className="w-4 h-4" />
              <span>สำรวจฐานข้อมูลไม้มงคล</span>
            </button>
            {isMember && <button
              onClick={() => onNavigate('quiz')}
              className="px-6 py-3 rounded-xl bg-white/15 backdrop-blur-md border border-white/30 text-white hover:bg-white/25 transition-all flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-[#C6A96B]" />
              <span>ค้นหาต้นไม้ที่เหมาะกับคุณ (Quiz)</span>
            </button>}
          </div>
        </div>
      </section>

      {/* 2. Popular 8 Categories Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-semibold text-[#A48545] uppercase tracking-wider">
              พฤกษศาสตร์จำแนกพรรณ
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#183D2B] mt-1">
              หมวดหมู่ไม้มงคล 8 สายพรรณ
            </h2>
          </div>
          <button
            onClick={() => onNavigate('categories')}
            className="text-xs font-semibold text-[#183D2B] hover:text-[#A48545] flex items-center gap-1 transition-colors self-start md:self-auto"
          >
            <span>ดูหมวดหมู่และรหัสพรรณทั้งหมด</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <button
              key={cat.categoryId}
              onClick={() => {
                onSelectCategory(cat.categoryId);
                onNavigate('categories');
              }}
              className="group relative flex flex-col items-center p-3 rounded-xl bg-white border border-[#EEE7DA] hover:border-[#C6A96B] hover:shadow-md transition-all text-center"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden bg-[#FAF7F0] mb-2 border border-[#C6A96B]/30 group-hover:scale-105 transition-transform">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[11px] font-mono text-[#A48545] font-bold">
                หมวด {cat.prefix}
              </span>
              <h3 className="text-xs font-bold text-[#183D2B] mt-0.5 line-clamp-1">
                {cat.name}
              </h3>
              <span className="text-[10px] text-[#7A746B] mt-0.5">
                {cat.plantCount ?? 0} ชนิด
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 3. Featured Auspicious Plants */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-semibold text-[#A48545] uppercase tracking-wider">
              พรรณไม้ยอดนิยม
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#183D2B] mt-1">
              ไม้มงคลแนะนำคู่เคหสถาน
            </h2>
            <p className="text-xs text-[#7A746B] mt-1 font-body">
              คัดสรรพรรณไม้ที่มีความหมายงดงาม ดูแลง่าย และส่งเสริมพลังชีวิต
            </p>
          </div>
          <button
            onClick={() => onNavigate('database')}
            className="text-xs font-semibold text-[#183D2B] hover:text-[#A48545] flex items-center gap-1 transition-colors self-start md:self-auto"
          >
            <span>สำรวจทั้งหมดในฐานข้อมูล</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredPlants.slice(0, 4).map((plant) => (
            <PlantCard
              key={plant.plantId}
              plant={plant}
              isFavorite={favorites.includes(plant.plantId)}
              onToggleFavorite={onToggleFavorite}
              onSelectPlant={onSelectPlant}
            />
          ))}
        </div>
      </section>

      {/* 4. Beliefs & Cultural Meanings Strip */}
      <section className="bg-[#183D2B] text-[#FAF7F0] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-semibold text-[#C6A96B] uppercase tracking-widest">
              มรดกทางวัฒนธรรมไทย
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
              คติความเชื่อและความหมายมงคล 8 ประการ
            </h2>
            <p className="text-xs text-[#A8B89A] leading-relaxed">
              การเลือกปลูกต้นไม้ตามความปรารถนาและทิศมงคลโบราณเพื่อความร่มเย็น
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BELIEFS_DATA.map((belief) => (
              <button
                key={belief.id}
                onClick={() => {
                  onSelectBelief(belief.id);
                  onNavigate('beliefs');
                }}
                className="group p-5 rounded-xl bg-[#0F271B] border border-[#C6A96B]/30 hover:border-[#C6A96B] hover:bg-[#25523B]/60 transition-all text-left space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#C6A96B]">
                    {belief.englishTitle}
                  </span>
                  <Compass className="w-4 h-4 text-[#A8B89A] group-hover:text-[#C6A96B] transition-colors" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-[#C6A96B] transition-colors">
                  {belief.title}
                </h3>
                <p className="text-xs text-[#FAF7F0]/80 leading-relaxed line-clamp-2">
                  {belief.description}
                </p>
                <div className="pt-2 text-[10px] text-[#A8B89A] flex items-center gap-1">
                  <span>ทิศมงคล: {belief.direction}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Plant Quiz Interactive Banner (members only) */}
      {isMember && <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#183D2B] to-[#25523B] text-white p-8 sm:p-12 shadow-xl border border-[#C6A96B]/40">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#C6A96B]">
                ระบบแนะนำอัจฉริยะ (Interactive Quiz)
              </span>
              <h2 className="text-2xl sm:text-4xl font-display font-bold">
                ค้นพบไม้มงคลที่ตรงกับสภาพพื้นที่และไลฟ์สไตล์ของคุณ
              </h2>
              <p className="text-xs sm:text-sm text-[#FAF7F0]/90 leading-relaxed max-w-xl font-body">
                เพียงตอบคำถาม 6 ข้อง่ายๆ ระบบจะประมวลผลความต้องการแสง แดด น้ำ พื้นที่ปลูก 
                และความปลอดภัยต่อเด็กหรือสัตว์เลี้ยง พร้อมจับคู่กับพรรณไม้จริงในฐานข้อมูล
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs">
                <button
                  onClick={() => onNavigate('quiz')}
                  className="px-6 py-3 rounded-xl bg-[#C6A96B] text-[#0F271B] font-bold hover:bg-[#DFC488] transition-colors shadow-md flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>เริ่มทำแบบทดสอบค้นหาต้นไม้</span>
                </button>
                <span className="text-[#A8B89A] flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-[#A7C957]" />
                  <span>ใช้เวลาไม่เกิน 2 นาที · ฟรีไม่มีค่าใช้จ่าย</span>
                </span>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center">
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full overflow-hidden border-4 border-[#C6A96B]/40 shadow-2xl">
                <img
                  src="/images/thai_botanical_courtyard_1791992219544.jpg"
                  alt="สวนไม้มงคลไทย"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>}

      {/* 6. Newly Added Accessions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-semibold text-[#A48545] uppercase tracking-wider">
              บันทึกพรรณไม้ล่าสุด
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#183D2B] mt-1">
              พรรณไม้ที่เพิ่มเข้าฐานข้อมูลล่าสุด
            </h2>
          </div>
          <button
            onClick={() => onNavigate('database')}
            className="text-xs font-semibold text-[#183D2B] hover:text-[#A48545] flex items-center gap-1 transition-colors"
          >
            <span>ดูทั้งหมด</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentPlants.slice(0, 4).map((plant) => (
            <PlantCard
              key={plant.plantId}
              plant={plant}
              isFavorite={favorites.includes(plant.plantId)}
              onToggleFavorite={onToggleFavorite}
              onSelectPlant={onSelectPlant}
            />
          ))}
        </div>
      </section>

      {/* 7. Latest Articles Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-semibold text-[#A48545] uppercase tracking-wider">
              คลังบทความและวิชาการ
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#183D2B] mt-1">
              เกร็ดความรู้และวัฒนธรรมพฤกษา
            </h2>
          </div>
          <button
            onClick={() => onNavigate('articles')}
            className="text-xs font-semibold text-[#183D2B] hover:text-[#A48545] flex items-center gap-1 transition-colors"
          >
            <span>อ่านบทความทั้งหมด</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.slice(0, 3).map((art) => (
            <div
              key={art.articleId}
              onClick={() => onNavigate('articles')}
              className="group cursor-pointer rounded-xl bg-white border border-[#EEE7DA] hover:border-[#C6A96B] shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
            >
              <div className="aspect-[16/9] w-full overflow-hidden bg-stone-200">
                <img
                  src={art.coverImage}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="text-xs text-[#7A746B] flex items-center gap-2">
                    <span className="font-semibold text-[#183D2B]">{art.category}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {art.publishedAt}
                    </span>
                    <span>·</span>
                    <span>{art.readTime}</span>
                  </div>
                  <h3 className="text-base font-bold text-[#183D2B] group-hover:text-[#A48545] transition-colors leading-snug line-clamp-2">
                    {art.title}
                  </h3>
                  <p className="text-xs text-[#49382C] line-clamp-2 leading-relaxed">
                    {art.excerpt}
                  </p>
                </div>
                <div className="pt-2 text-xs font-semibold text-[#183D2B] flex items-center gap-1">
                  <span>อ่านต่อ</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C6A96B]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Brand Introduction & Methodology */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-[#EEE7DA]/50 border border-[#C6A96B]/30 p-8 sm:p-10 space-y-4 text-center max-w-3xl mx-auto">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#183D2B] flex items-center justify-center text-[#C6A96B]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl sm:text-2xl font-display font-bold text-[#183D2B]">
            เจตนารมณ์และมาตรฐานฐานข้อมูล SACRED CANOPY
          </h3>
          <p className="text-xs sm:text-sm text-[#49382C] leading-relaxed font-body">
            เรามุ่งมั่นนำเสนอข้อมูลพฤกษศาสตร์ไม้มงคลบนพื้นฐานความถูกต้องทางวิชาการ โดยแยกแยะระหว่าง
            <strong> ข้อเท็จจริงทางพฤกษศาสตร์ การเพาะเลี้ยง และความปลอดภัย</strong> ออกจาก
            <strong> มรดกทางคติชนวิทยาและความเชื่อโบราณ</strong> อย่างชัดเจน 
            เพื่อส่งเสริมให้คนรุ่นใหม่เกิดความรักในธรรมชาติและดูแลต้นไม้อย่างถูกต้อง
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('about')}
              className="text-xs font-semibold text-[#183D2B] underline hover:text-[#A48545]"
            >
              อ่านเกี่ยวกับเราและที่มาของโครงการ
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
