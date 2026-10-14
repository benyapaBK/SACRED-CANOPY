import React, { useState } from 'react';
import { Plant, UserProfile } from '../types';
import { PlantCard } from '../components/PlantCard';
import { ChevronRight, Heart, Search, TreePine, Sparkles, LogIn } from 'lucide-react';

interface FavoritesPageProps {
  plants: Plant[];
  favorites: string[];
  currentUser: UserProfile;
  onToggleFavorite: (plantId: string) => void;
  onSelectPlant: (plant: Plant) => void;
  onNavigateToDatabase: () => void;
  onOpenAuthModal: () => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({
  plants,
  favorites,
  currentUser,
  onToggleFavorite,
  onSelectPlant,
  onNavigateToDatabase,
  onOpenAuthModal,
}) => {
  const [searchFav, setSearchFav] = useState('');

  const favoritePlants = plants.filter((p) => favorites.includes(p.plantId));

  const filtered = favoritePlants.filter((p) => {
    if (!searchFav.trim()) return true;
    const q = searchFav.toLowerCase();
    return (
      p.thaiName.toLowerCase().includes(q) ||
      p.scientificName.toLowerCase().includes(q) ||
      p.plantId.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-body">
      {/* Breadcrumb & Heading */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-[#7A746B]">
          <span>หน้าหลัก</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-[#183D2B]">ไม้มงคลของฉัน</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-[#183D2B] flex items-center gap-2">
              <span>ไม้มงคลของฉัน</span>
              <Heart className="w-6 h-6 text-[#C6A96B] fill-[#C6A96B]" />
            </h1>
            <p className="text-xs text-[#7A746B] mt-1">
              คอลเลกชันพรรณไม้มงคลที่คุณบันทึกไว้เพื่อศึกษา วางแผนจัดสวน หรือบูชา
            </p>
          </div>
          <div className="text-xs text-[#7A746B]">
            บันทึกไว้ <span className="font-bold text-[#183D2B]">{favoritePlants.length}</span> รายการ
          </div>
        </div>
      </div>

      {/* Guest Notice if not logged in */}
      {currentUser.role === 'guest' && (
        <div className="bg-[#FAF7F0] border border-[#C6A96B]/40 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#183D2B]">กำลังใช้งานในโหมดผู้เยี่ยมชม</span>
            <p className="text-xs text-[#7A746B]">
              รายการโปรดของคุณจะถูกบันทึกไว้ในเบราว์เซอร์นี้ชั่วคราว เข้าสู่ระบบเพื่อซิงค์ข้อมูลกับบัญชีคลาวด์ของคุณ
            </p>
          </div>
          <button
            onClick={onOpenAuthModal}
            className="px-4 py-2 bg-[#183D2B] text-white rounded-lg text-xs font-semibold hover:bg-[#25523B] transition-colors shrink-0 flex items-center gap-1.5"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>เข้าสู่ระบบเพื่อซิงค์</span>
          </button>
        </div>
      )}

      {/* Search within Favorites */}
      {favoritePlants.length > 0 && (
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-[#C6A96B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchFav}
            onChange={(e) => setSearchFav(e.target.value)}
            placeholder="ค้นหาในรายการโปรดของคุณ..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-[#EEE7DA] text-xs focus:outline-none focus:border-[#C6A96B]"
          />
        </div>
      )}

      {/* Favorites List or Empty State */}
      {favoritePlants.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EEE7DA] p-12 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#FAF7F0] flex items-center justify-center text-[#C6A96B]">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-[#183D2B]">
            ยังไม่มีไม้มงคลในรายการโปรด
          </h2>
          <p className="text-xs text-[#7A746B] max-w-sm mx-auto">
            คุณสามารถกดไอคอนหัวใจบนการ์ดพรรณไม้ใดก็ได้ในฐานข้อมูล เพื่อบันทึกพรรณไม้ที่คุณสนใจไว้ที่นี่
          </p>
          <button
            onClick={onNavigateToDatabase}
            className="px-5 py-2.5 bg-[#183D2B] text-white rounded-xl text-xs font-semibold hover:bg-[#25523B] transition-colors inline-flex items-center gap-2"
          >
            <TreePine className="w-4 h-4" />
            <span>สำรวจฐานข้อมูลไม้มงคล</span>
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-[#EEE7DA] text-center text-xs text-[#7A746B]">
          ไม่พบรายการโปรดที่ตรงกับคำค้นหา
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((plant) => (
            <PlantCard
              key={plant.plantId}
              plant={plant}
              isFavorite={true}
              onToggleFavorite={onToggleFavorite}
              onSelectPlant={onSelectPlant}
            />
          ))}
        </div>
      )}
    </div>
  );
};
