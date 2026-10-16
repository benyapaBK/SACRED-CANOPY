import React from 'react';
import { Plant, UserProfile } from '../types';
import { PlantCard } from '../components/PlantCard';
import { Clock3, TreePine } from 'lucide-react';

interface HistoryPageProps {
  plants: Plant[];
  currentUser: UserProfile;
  onToggleFavorite: (plantId: string) => void;
  onSelectPlant: (plant: Plant) => void;
  onOpenAuthModal: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ plants, currentUser, onToggleFavorite, onSelectPlant, onOpenAuthModal }) => {
  if (currentUser.role === 'guest') {
    return <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
      <Clock3 className="w-12 h-12 mx-auto text-[#C6A96B]" />
      <h1 className="text-2xl font-bold text-[#183D2B]">ประวัติพันธุ์ไม้ที่เข้าชม</h1>
      <p className="text-sm text-[#7A746B]">เข้าสู่ระบบเพื่อบันทึกและดูประวัติพันธุ์ไม้ที่คุณเคยเปิดอ่าน</p>
      <button onClick={onOpenAuthModal} className="px-5 py-2.5 rounded-xl bg-[#183D2B] text-white text-sm font-semibold">เข้าสู่ระบบ / สมัครสมาชิก</button>
    </div>;
  }
  const ids = currentUser.recentlyViewed || [];
  const viewed = ids.map((id) => plants.find((plant) => plant.plantId === id)).filter((plant): plant is Plant => Boolean(plant));
  return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
    <div className="flex items-center gap-3">
      <Clock3 className="w-7 h-7 text-[#C6A96B]" />
      <div><h1 className="text-3xl font-bold text-[#183D2B]">ประวัติพันธุ์ไม้ที่เข้าชม</h1><p className="text-xs text-[#7A746B] mt-1">บันทึก 30 รายการล่าสุดในบัญชีของคุณ</p></div>
    </div>
    {viewed.length ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">{viewed.map((plant) => <PlantCard key={plant.plantId} plant={plant} isFavorite={(currentUser.favorites || []).includes(plant.plantId)} onToggleFavorite={onToggleFavorite} onSelectPlant={onSelectPlant} />)}</div> : <div className="bg-white rounded-2xl border border-[#EEE7DA] p-10 text-center space-y-3"><TreePine className="w-10 h-10 mx-auto text-[#C6A96B]" /><p className="font-semibold text-[#183D2B]">ยังไม่มีประวัติการเข้าชม</p><p className="text-xs text-[#7A746B]">เปิดรายละเอียดต้นไม้เพื่อบันทึกลงประวัติอัตโนมัติ</p></div>}
  </div>;
};
