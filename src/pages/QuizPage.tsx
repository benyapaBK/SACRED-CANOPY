import React, { useEffect, useMemo, useState } from 'react';
import {
  BadgeCheck, BookOpen, Check, Cloud, Flower2, Heart,
  Home, Leaf, Lightbulb, RotateCcw, Save, Sparkles,
  Sprout, Sun, Trash2, Trophy, WandSparkles
} from 'lucide-react';
import { Plant, UserProfile } from '../types';
import { db } from '../services/firebase';
import { doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';

interface QuizPageProps {
  plants: Plant[];
  favorites: string[];
  onToggleFavorite: (plantId: string) => void;
  onSelectPlant: (plant: Plant) => void;
  currentUser: UserProfile;
}

type SceneId = 'balcony' | 'sunroom' | 'garden';
type AvatarId = 'gardener' | 'sunhat' | 'flower';

interface GardenSave {
  version: 1;
  gardenName: string;
  sceneId: SceneId;
  plantedPlantIds: string[];
  decorationIds: string[];
  avatarStyle: AvatarId;
  xp: number;
}

const SCENES: { id: SceneId; label: string; subtitle: string; emoji: string; advice: string }[] = [
  { id: 'balcony', label: 'ระเบียงแสงเช้า', subtitle: 'พื้นที่เล็ก · กระถางกะทัดรัด', emoji: '🏡', advice: 'เลือกไม้กระถางที่ใช้พื้นที่น้อย และสังเกตแดดก่อนวางต้นไม้' },
  { id: 'sunroom', label: 'มุมหน้าต่าง', subtitle: 'แสงรำไร · มุมสงบในบ้าน', emoji: '🪟', advice: 'ให้ต้นไม้ได้รับแสงเหมาะสมและอย่าวางชิดช่องแอร์เกินไป' },
  { id: 'garden', label: 'สวนหน้าบ้าน', subtitle: 'พื้นที่เปิด · จัดชั้นความสูงได้', emoji: '🌳', advice: 'วางไม้สูงไว้ด้านหลังและไม้พุ่มหรือไม้ดอกไว้ด้านหน้า' },
];

const AVATARS: { id: AvatarId; label: string; emoji: string; accessory: string }[] = [
  { id: 'gardener', label: 'นักปลูกต้นไม้', emoji: '🧑🏻‍🌾', accessory: 'ผ้ากันเปื้อนเขียว' },
  { id: 'sunhat', label: 'หมวกฟาง', emoji: '👩🏻‍🌾', accessory: 'หมวกฟางสีทอง' },
  { id: 'flower', label: 'สายดอกไม้', emoji: '🧑🏽‍🌾', accessory: 'เข็มกลัดดอกไม้' },
];

const DECORATIONS = [
  { id: 'bench', label: 'ม้านั่ง', emoji: '🪑' },
  { id: 'lantern', label: 'โคมไฟ', emoji: '🏮' },
  { id: 'pond', label: 'บ่อน้ำ', emoji: '🪷' },
  { id: 'butterfly', label: 'ผีเสื้อ', emoji: '🦋' },
  { id: 'stones', label: 'ทางเดินหิน', emoji: '🪨' },
  { id: 'bird', label: 'บ้านนก', emoji: '🐦' },
];

function plantEmoji(plant: Plant): string {
  const code = plant.categoryCode || plant.plantId?.charAt(0) || '';
  if (code === 'A') return '🌳';
  if (code === 'B') return '🌿';
  if (code === 'C') return '🌷';
  if (code === 'D') return '🍃';
  if (code === 'E') return '🌱';
  if (code === 'F') return '🌴';
  if (code === 'G') return '🪴';
  if (code === 'H') return '🎋';
  return '🌱';
}

function formatCare(plant: Plant): string {
  const light = plant.care?.sunlight || 'ตรวจสอบแสงที่เหมาะสม';
  const level = plant.careLevel || 'ดูแลตามคำแนะนำ';
  return `${light} · ${level}`;
}

export const QuizPage: React.FC<QuizPageProps> = ({ plants, favorites, onToggleFavorite, onSelectPlant, currentUser }) => {
  const [sceneId, setSceneId] = useState<SceneId>('balcony');
  const [gardenName, setGardenName] = useState(`สวนของ${(currentUser.displayName || 'ฉัน').split(' ')[0]}`);
  const [avatarStyle, setAvatarStyle] = useState<AvatarId>('gardener');
  const [plantedPlantIds, setPlantedPlantIds] = useState<string[]>([]);
  const [decorationIds, setDecorationIds] = useState<string[]>(['butterfly']);
  const [saveStatus, setSaveStatus] = useState('กำลังตรวจสอบสวนที่บันทึกไว้…');
  const [isSaving, setIsSaving] = useState(false);
  const [showPlantTips, setShowPlantTips] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const loadSave = async () => {
      try {
        const snapshot = await getDoc(doc(db, 'users', currentUser.uid));
        const saved = snapshot.exists() ? snapshot.data().gardenGameSave as GardenSave | undefined : undefined;
        if (cancelled) return;
        if (saved && saved.version === 1) {
          setGardenName(typeof saved.gardenName === 'string' ? saved.gardenName : `สวนของ${currentUser.displayName || 'ฉัน'}`);
          setSceneId(['balcony', 'sunroom', 'garden'].includes(saved.sceneId) ? saved.sceneId : 'balcony');
          setPlantedPlantIds(Array.isArray(saved.plantedPlantIds) ? saved.plantedPlantIds.filter((id) => plants.some((plant) => plant.plantId === id)).slice(0, 5) : []);
          setDecorationIds(Array.isArray(saved.decorationIds) ? saved.decorationIds.filter((id) => DECORATIONS.some((decoration) => decoration.id === id)).slice(0, 4) : []);
          setAvatarStyle(['gardener', 'sunhat', 'flower'].includes(saved.avatarStyle) ? saved.avatarStyle : 'gardener');
          setSaveStatus('โหลดสวนล่าสุดจากบัญชีของคุณแล้ว');
        } else {
          setSaveStatus('ยังไม่มีสวนที่บันทึกไว้ ลองออกแบบสวนแรกของคุณได้เลย');
        }
      } catch (error) {
        console.warn('Could not load garden save from Firestore', error);
        if (!cancelled) setSaveStatus('โหลดเซฟไม่ได้ในขณะนี้ ตรวจสอบ Firestore Rules แล้วลองใหม่');
      }
    };
    void loadSave();
    return () => { cancelled = true; };
  }, [currentUser.uid, currentUser.displayName, plants]);

  const currentScene = SCENES.find((scene) => scene.id === sceneId) || SCENES[0];
  const currentAvatar = AVATARS.find((avatar) => avatar.id === avatarStyle) || AVATARS[0];

  const suitablePlants = useMemo(() => {
    const filtered = plants.filter((plant) => {
      const suitability = plant.suitability || {};
      if (sceneId === 'balcony') return Boolean(suitability.balcony || suitability.condo || suitability.pot || suitability.limitedSpace) || /ระเบียง|คอนโด|กระถาง|โต๊ะ/i.test(plant.spaceType || '');
      if (sceneId === 'sunroom') return Boolean(suitability.pot || suitability.condo || suitability.beginner) || /ในอาคาร|โต๊ะทำงาน|คอนโด|ร่ม/i.test(plant.spaceType || '');
      return Boolean(suitability.garden || suitability.home || suitability.busyFriendly) || /สวน|บ้านเดี่ยว|กลางแจ้ง/i.test(plant.spaceType || '');
    });
    return (filtered.length >= 6 ? filtered : plants).filter((plant) => !plant.deletedAt && !plant.isDeleted).slice(0, 18);
  }, [plants, sceneId]);

  const plantedPlants = plantedPlantIds.map((id) => plants.find((plant) => plant.plantId === id)).filter((plant): plant is Plant => Boolean(plant));
  const xp = plantedPlantIds.length * 20 + decorationIds.length * 10 + (sceneId ? 10 : 0) + (avatarStyle !== 'gardener' ? 5 : 0);
  const level = Math.max(1, Math.floor(xp / 70) + 1);
  const missionPlantsComplete = plantedPlantIds.length >= 3;
  const missionDecorComplete = decorationIds.length >= 2;
  const gardenComplete = missionPlantsComplete && missionDecorComplete;

  const togglePlant = (plantId: string) => {
    if (plantedPlantIds.includes(plantId)) {
      setPlantedPlantIds((ids) => ids.filter((id) => id !== plantId));
      setSaveStatus('ถอนต้นไม้ออกจากสวนแล้ว อย่าลืมกดบันทึกสวน');
      return;
    }
    if (plantedPlantIds.length >= 5) {
      setSaveStatus('สวนนี้ปลูกได้สูงสุด 5 ต้น ลองถอนต้นหนึ่งก่อนเพิ่มต้นใหม่');
      return;
    }
    setPlantedPlantIds((ids) => [...ids, plantId]);
    setSaveStatus('ปลูกต้นไม้แล้ว! กดบันทึกสวนเพื่อเก็บความคืบหน้า');
  };

  const toggleDecoration = (id: string) => {
    if (decorationIds.includes(id)) {
      setDecorationIds((ids) => ids.filter((item) => item !== id));
      setSaveStatus('นำของตกแต่งออกแล้ว อย่าลืมบันทึกสวน');
      return;
    }
    if (decorationIds.length >= 4) {
      setSaveStatus('เลือกของตกแต่งได้สูงสุด 4 อย่าง');
      return;
    }
    setDecorationIds((ids) => [...ids, id]);
    setSaveStatus('เพิ่มของตกแต่งแล้ว!');
  };

  const saveGarden = async () => {
    setIsSaving(true);
    setSaveStatus('กำลังบันทึกสวนในบัญชี Firebase…');
    const payload: GardenSave = {
      version: 1,
      gardenName: gardenName.trim().slice(0, 48) || 'สวนจิ๋วของฉัน',
      sceneId,
      plantedPlantIds,
      decorationIds,
      avatarStyle,
      xp,
    };
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        gardenGameSave: payload,
        gardenGameSavedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setSaveStatus(`บันทึก “${payload.gardenName}” สำเร็จแล้ว 🌱`);
    } catch (error) {
      console.error('Unable to save garden game:', error);
      setSaveStatus('บันทึกไม่สำเร็จ โปรดตรวจสอบว่าบัญชีอ่าน/เขียนเอกสาร users ของตัวเองได้ใน Firestore Rules');
    } finally {
      setIsSaving(false);
    }
  };

  const resetGarden = () => {
    if (!window.confirm('เริ่มจัดสวนใหม่หรือไม่? การล้างหน้าจอนี้จะยังไม่ลบเซฟเดิมจนกว่าจะกดบันทึก')) return;
    setSceneId('balcony');
    setGardenName(`สวนของ${(currentUser.displayName || 'ฉัน').split(' ')[0]}`);
    setAvatarStyle('gardener');
    setPlantedPlantIds([]);
    setDecorationIds([]);
    setSaveStatus('เริ่มสวนใหม่แล้ว กดบันทึกเพื่อแทนที่เซฟเดิม');
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8 font-body">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D9C28F] bg-[#FFF8E7] px-3 py-1 text-[11px] font-bold tracking-wide text-[#8A6A23]">
            <Sparkles className="h-3.5 w-3.5" /> MINI GAME · GARDEN QUEST
          </div>
          <h1 className="text-3xl font-display font-bold text-[#183D2B] sm:text-4xl">สวนจิ๋วของฉัน</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-[#7A746B]">ลงมือจัดสวน เลือกต้นไม้ให้เข้ากับพื้นที่ แต่งตัวนักปลูกต้นไม้ และสะสมคะแนนความรู้ไปพร้อมกัน</p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-[#E7DAB9] bg-white px-4 py-3 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#183D2B] text-[#C6A96B]"><Trophy className="h-5 w-5" /></div>
          <div><div className="text-[10px] uppercase tracking-wider text-[#8A6A23]">Garden XP</div><div className="text-xl font-bold text-[#183D2B]">{xp} <span className="text-xs font-medium text-[#7A746B]">คะแนน · เลเวล {level}</span></div></div>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,0.8fr)]">
        <section className="overflow-hidden rounded-3xl border border-[#E7DAB9] bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-[#EEE7DA] bg-[#FFFCF5] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <label htmlFor="garden-name" className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#A48545]">ชื่อสวนของคุณ</label>
              <input id="garden-name" maxLength={48} value={gardenName} onChange={(event) => setGardenName(event.target.value)} className="w-full max-w-md border-0 border-b border-[#D7C79F] bg-transparent py-1 text-lg font-bold text-[#183D2B] outline-none focus:border-[#183D2B]" placeholder="ตั้งชื่อสวนจิ๋ว" />
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => void saveGarden()} disabled={isSaving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#183D2B] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#25523B] disabled:opacity-60"><Save className="h-4 w-4 text-[#C6A96B]" />{isSaving ? 'กำลังบันทึก…' : 'บันทึกสวน'}</button>
              <button onClick={resetGarden} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#EEE7DA] px-3 py-2.5 text-xs font-semibold text-[#7A746B] transition hover:bg-[#FAF7F0]"><RotateCcw className="h-4 w-4" />เริ่มใหม่</button>
            </div>
          </div>

          {/* Small cartoon garden scene: built with CSS and emoji so it stays responsive and requires no image hosting. */}
          <div className={`relative isolate min-h-[345px] overflow-hidden ${sceneId === 'sunroom' ? 'bg-gradient-to-b from-[#F7DFAF] via-[#F8EFD9] to-[#D3AA77]' : sceneId === 'garden' ? 'bg-gradient-to-b from-[#8BD2EC] via-[#D4F1E2] to-[#8BC985]' : 'bg-gradient-to-b from-[#97D9F0] via-[#DFF4EA] to-[#C6D8B4]'}`}>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-2 bg-white/20" />
            <div className="absolute right-[12%] top-8 text-4xl drop-shadow-sm">{sceneId === 'sunroom' ? '🌤️' : <Sun className="h-10 w-10 text-[#F5C85C] drop-shadow-sm" />}</div>
            <div className="absolute left-[10%] top-8 text-3xl opacity-80">☁️</div>
            <div className="absolute left-[52%] top-14 text-2xl opacity-70">☁️</div>
            {sceneId === 'sunroom' && <div className="absolute left-[8%] top-[18%] h-[38%] w-[30%] rounded-t-xl border-[7px] border-[#B7864B] bg-gradient-to-b from-[#A8DEF0] to-[#E4F4E8] shadow-inner"><div className="absolute inset-y-0 left-1/2 w-1.5 bg-[#B7864B]" /><div className="absolute inset-x-0 top-1/2 h-1.5 bg-[#B7864B]" /></div>}
            {sceneId === 'balcony' && <div className="absolute inset-x-0 bottom-[26%] h-[17%] border-y-4 border-[#B1B8A1]/80 bg-[#D5D8C7]/70" />}
            {sceneId === 'garden' && <><div className="absolute bottom-[28%] -left-10 h-36 w-64 rounded-[50%] bg-[#75B96C]"/><div className="absolute bottom-[26%] -right-16 h-44 w-80 rounded-[50%] bg-[#63AD65]"/><div className="absolute bottom-[26%] left-[28%] h-20 w-56 rounded-[50%] bg-[#A1D58B]"/></>}
            <div className={`absolute inset-x-0 bottom-0 h-[28%] border-t-[5px] ${sceneId === 'garden' ? 'border-[#71A65A] bg-[#8BC47D]' : sceneId === 'sunroom' ? 'border-[#AD8051] bg-[#C99760]' : 'border-[#B0B998] bg-[#B3C19D]'}`} />
            {sceneId === 'balcony' && <div className="absolute inset-x-0 bottom-[7%] h-5 opacity-40" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent 0 48px, #6F8E7B 49px 52px)' }} />}
            <div className="absolute bottom-[7%] left-1/2 h-14 w-[76%] -translate-x-1/2 rounded-[50%] border-2 border-[#94734A]/60 bg-[#E6C68C]/90 shadow-inner" />

            {decorationIds.map((id, index) => {
              const decoration = DECORATIONS.find((item) => item.id === id);
              if (!decoration) return null;
              const positions = [{ left: '8%', bottom: '29%' }, { left: '82%', bottom: '30%' }, { left: '68%', bottom: '7%' }, { left: '18%', bottom: '65%' }];
              const pos = positions[index % positions.length];
              return <div key={id} className="absolute z-10 flex flex-col items-center drop-shadow-sm" style={pos}><span className="text-3xl sm:text-4xl">{decoration.emoji}</span><span className="rounded-full bg-white/80 px-1.5 py-0.5 text-[9px] font-semibold text-[#5E5A49]">{decoration.label}</span></div>;
            })}

            {plantedPlants.map((plant, index) => {
              const positions = [
                { left: '28%', bottom: '12%' }, { left: '42%', bottom: '15%' }, { left: '56%', bottom: '12%' },
                { left: '35%', bottom: '36%' }, { left: '63%', bottom: '35%' },
              ];
              return <button key={plant.plantId} onClick={() => onSelectPlant(plant)} title={`ดูข้อมูล ${plant.thaiName}`} className="absolute z-20 flex -translate-x-1/2 flex-col items-center transition-transform hover:-translate-y-1" style={positions[index]}>
                <span className="text-4xl drop-shadow-md sm:text-5xl">{plantEmoji(plant)}</span>
                <span className="max-w-24 truncate rounded-full border border-white/70 bg-white/90 px-2 py-0.5 text-[9px] font-bold text-[#183D2B] shadow-sm">{plant.thaiName}</span>
                <span className="mt-0.5 rounded bg-[#183D2B]/85 px-1.5 py-0.5 font-mono text-[8px] text-white">{plant.plantId}</span>
              </button>;
            })}

            <div className="absolute bottom-[13%] right-[5%] z-30 flex flex-col items-center" title={currentAvatar.accessory}>
              <span className="text-5xl drop-shadow-md sm:text-6xl">{currentAvatar.emoji}</span>
              <span className="mt-1 rounded-full border border-white/70 bg-white/90 px-2 py-0.5 text-[9px] font-bold text-[#183D2B]">น้องนักปลูก</span>
            </div>

            <div className="absolute left-4 top-4 z-30 rounded-2xl border border-white/70 bg-white/85 px-3 py-2 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-[#8A6A23]"><Sparkles className="h-3.5 w-3.5" /> MY LITTLE GARDEN</div>
              <div className="mt-0.5 max-w-40 truncate text-sm font-bold text-[#183D2B]">{gardenName || 'สวนจิ๋วของฉัน'}</div>
            </div>

            {gardenComplete && <div className="absolute right-4 top-4 z-30 rounded-xl bg-[#183D2B] px-3 py-2 text-xs font-bold text-[#F7DA8B] shadow-lg"><Trophy className="mr-1 inline h-4 w-4" />ภารกิจสำเร็จ!</div>}
          </div>

          <div className="flex flex-col gap-2 border-t border-[#EEE7DA] bg-[#FFFCF5] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2 text-xs leading-relaxed text-[#6C725E]"><Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-[#A48545]" /><span>{currentScene.advice}</span></div>
            <div className="whitespace-nowrap text-xs font-semibold text-[#183D2B]">ปลูกแล้ว {plantedPlantIds.length}/5 · ตกแต่ง {decorationIds.length}/4</div>
          </div>
        </section>

        <div className="space-y-5">
          <section className="rounded-3xl border border-[#E7DAB9] bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2"><Home className="h-5 w-5 text-[#A48545]" /><h2 className="font-bold text-[#183D2B]">ด่าน 1 · เลือกพื้นที่</h2></div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 xl:grid-cols-1">
              {SCENES.map((scene) => <button key={scene.id} onClick={() => { setSceneId(scene.id); setSaveStatus(`เลือกฉาก ${scene.label} แล้ว`); }} className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition ${sceneId === scene.id ? 'border-[#183D2B] bg-[#F2F7EF] ring-1 ring-[#183D2B]/20' : 'border-[#EEE7DA] hover:border-[#C6A96B]'}`}>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FAF7F0] text-2xl">{scene.emoji}</span><span className="min-w-0 flex-1"><span className="block text-xs font-bold text-[#183D2B]">{scene.label}</span><span className="mt-0.5 block text-[10px] text-[#7A746B]">{scene.subtitle}</span></span>{sceneId === scene.id && <Check className="h-4 w-4 text-[#2E7D32]" />}
              </button>)}
            </div>
          </section>

          <section className="rounded-3xl border border-[#E7DAB9] bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2"><WandSparkles className="h-5 w-5 text-[#A48545]" /><h2 className="font-bold text-[#183D2B]">ด่าน 2 · แต่งตัวตัวละคร</h2></div>
            <div className="grid grid-cols-3 gap-2">
              {AVATARS.map((avatar) => <button key={avatar.id} onClick={() => { setAvatarStyle(avatar.id); setSaveStatus(`เปลี่ยนชุดเป็น${avatar.accessory}แล้ว`); }} className={`rounded-2xl border p-2 text-center transition ${avatarStyle === avatar.id ? 'border-[#183D2B] bg-[#F2F7EF] ring-1 ring-[#183D2B]/20' : 'border-[#EEE7DA] hover:border-[#C6A96B]'}`}><span className="block text-3xl">{avatar.emoji}</span><span className="mt-1 block text-[10px] font-semibold text-[#183D2B]">{avatar.label}</span></button>)}
            </div>
          </section>

          <section className="rounded-3xl border border-[#E7DAB9] bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2"><Flower2 className="h-5 w-5 text-[#A48545]" /><h2 className="font-bold text-[#183D2B]">ด่าน 3 · ของตกแต่ง</h2><span className="ml-auto text-[10px] text-[#7A746B]">เลือกได้ 4 อย่าง</span></div>
            <div className="grid grid-cols-3 gap-2">
              {DECORATIONS.map((decoration) => {
                const selected = decorationIds.includes(decoration.id);
                return <button key={decoration.id} onClick={() => toggleDecoration(decoration.id)} className={`rounded-xl border p-2 text-center transition ${selected ? 'border-[#C6A96B] bg-[#FFF8E7] ring-1 ring-[#C6A96B]/30' : 'border-[#EEE7DA] hover:bg-[#FAF7F0]'}`}><span className="block text-2xl">{decoration.emoji}</span><span className="mt-1 block text-[10px] font-semibold text-[#49382C]">{decoration.label}</span>{selected && <span className="mt-1 inline-flex items-center gap-0.5 text-[9px] text-[#2E7D32]"><Check className="h-3 w-3" />เลือกแล้ว</span>}</button>;
              })}
            </div>
          </section>
        </div>
      </div>

      <section className="space-y-4 rounded-3xl border border-[#E7DAB9] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div><div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#A48545]"><Sprout className="h-4 w-4" /> PLANT COLLECTION</div><h2 className="text-xl font-bold text-[#183D2B]">เลือกต้นไม้ไปปลูกในสวน</h2><p className="mt-1 text-xs text-[#7A746B]">รายการแนะนำสำหรับ “{currentScene.label}” · แตะปลูกเพื่อวางในฉาก แล้วแตะต้นไม้ในสวนเพื่อเปิดดูข้อมูลเชิงลึก</p></div>
          <button onClick={() => setShowPlantTips((visible) => !visible)} className="inline-flex items-center gap-2 self-start rounded-xl border border-[#EEE7DA] px-3 py-2 text-xs font-semibold text-[#183D2B] hover:bg-[#FAF7F0]"><BookOpen className="h-4 w-4" />{showPlantTips ? 'ซ่อนเกร็ดความรู้' : 'แสดงเกร็ดความรู้'}</button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {suitablePlants.map((plant) => {
            const isPlanted = plantedPlantIds.includes(plant.plantId);
            const isFavorite = favorites.includes(plant.plantId);
            return <article key={plant.plantId} className={`overflow-hidden rounded-2xl border transition ${isPlanted ? 'border-[#2E7D32] bg-[#F5FAF2]' : 'border-[#EEE7DA] bg-[#FFFEFB] hover:border-[#C6A96B]'}`}>
              <div className="relative flex h-28 items-center justify-center overflow-hidden bg-gradient-to-b from-[#E4F4EA] to-[#F6E8CD]">
                <span className="text-5xl drop-shadow-sm">{plantEmoji(plant)}</span>
                {plant.images?.[0] && <img src={plant.images[0]} alt={plant.thaiName} loading="lazy" className="absolute inset-0 h-full w-full object-cover" onError={(event) => { event.currentTarget.style.display = 'none'; }} />}
                <span className="absolute left-2 top-2 rounded-lg bg-white/90 px-2 py-1 font-mono text-[10px] font-bold text-[#183D2B]">{plant.plantId}</span>
                <button onClick={() => onToggleFavorite(plant.plantId)} title={isFavorite ? 'นำออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'} className="absolute right-2 top-2 rounded-full bg-white/90 p-2 text-[#A48545] hover:text-rose-600"><Heart className="h-4 w-4" fill={isFavorite ? '#C44F59' : 'none'} stroke={isFavorite ? '#C44F59' : 'currentColor'} /></button>
              </div>
              <div className="space-y-2 p-3.5">
                <div><h3 className="truncate text-sm font-bold text-[#183D2B]">{plant.thaiName}</h3><p className="truncate text-[10px] italic text-[#7A746B]">{plant.scientificName}</p></div>
                {showPlantTips && <p className="min-h-8 text-[10px] leading-relaxed text-[#6C725E]"><Leaf className="mr-1 inline h-3 w-3 text-[#2E7D32]" />{formatCare(plant)}</p>}
                <div className="flex gap-2 pt-1">
                  <button onClick={() => togglePlant(plant.plantId)} className={`flex-1 rounded-xl px-3 py-2 text-[11px] font-bold transition ${isPlanted ? 'border border-[#D1E5C9] bg-white text-[#2E7D32]' : 'bg-[#183D2B] text-white hover:bg-[#25523B]'}`}>{isPlanted ? <><Trash2 className="mr-1 inline h-3.5 w-3.5" />ถอนออก</> : <><Sprout className="mr-1 inline h-3.5 w-3.5" />ปลูกต้นนี้</>}</button>
                  <button onClick={() => onSelectPlant(plant)} className="rounded-xl border border-[#EEE7DA] px-3 py-2 text-[11px] font-semibold text-[#7A746B] hover:bg-[#FAF7F0]">ข้อมูล</button>
                </div>
              </div>
            </article>;
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1.4fr]">
        <div className="rounded-3xl border border-[#E7DAB9] bg-[#FFF8E7] p-5">
          <div className="mb-3 flex items-center gap-2"><Trophy className="h-5 w-5 text-[#A48545]" /><h2 className="font-bold text-[#183D2B]">ภารกิจสวนจิ๋ว</h2></div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs"><span className={`flex h-5 w-5 items-center justify-center rounded-full ${sceneId ? 'bg-[#2E7D32] text-white' : 'bg-white text-[#A48545]'}`}>{sceneId && <Check className="h-3 w-3" />}</span><span className="flex-1 text-[#49382C]">เลือกพื้นที่สวน</span><span className="text-[10px] font-semibold text-[#8A6A23]">+10 XP</span></div>
            <div className="flex items-center gap-2 text-xs"><span className={`flex h-5 w-5 items-center justify-center rounded-full ${missionPlantsComplete ? 'bg-[#2E7D32] text-white' : 'bg-white text-[#A48545]'}`}>{missionPlantsComplete && <Check className="h-3 w-3" />}</span><span className="flex-1 text-[#49382C]">ปลูกต้นไม้อย่างน้อย 3 ต้น ({plantedPlantIds.length}/3)</span><span className="text-[10px] font-semibold text-[#8A6A23]">+60 XP</span></div>
            <div className="flex items-center gap-2 text-xs"><span className={`flex h-5 w-5 items-center justify-center rounded-full ${missionDecorComplete ? 'bg-[#2E7D32] text-white' : 'bg-white text-[#A48545]'}`}>{missionDecorComplete && <Check className="h-3 w-3" />}</span><span className="flex-1 text-[#49382C]">ตกแต่งสถานที่อย่างน้อย 2 อย่าง ({decorationIds.length}/2)</span><span className="text-[10px] font-semibold text-[#8A6A23]">+20 XP</span></div>
          </div>
          {gardenComplete && <div className="mt-4 rounded-xl border border-[#C8DDBA] bg-white p-3 text-xs font-semibold text-[#27632A]"><BadgeCheck className="mr-1 inline h-4 w-4" />ปลดล็อกป้าย “นักจัดสวนมือใหม่” แล้ว!</div>}
        </div>
        <div className="rounded-3xl border border-[#E7DAB9] bg-white p-5">
          <div className="mb-2 flex items-center gap-2"><Cloud className="h-5 w-5 text-[#A48545]" /><h2 className="font-bold text-[#183D2B]">เซฟเกมตามบัญชีสมาชิก</h2></div>
          <p className="text-xs leading-relaxed text-[#7A746B]">สวน ชื่อตัวละคร พื้นที่ ต้นไม้ และของตกแต่งจะบันทึกไว้ในเอกสารผู้ใช้ของบัญชี Firebase ที่กำลังเข้าสู่ระบบ กด “บันทึกสวน” หลังเปลี่ยนแปลงเพื่อเปิดเล่นต่อได้ในครั้งถัดไป</p>
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-[#F7F5EF] p-3 text-[11px] leading-relaxed text-[#6C725E]" role="status"><span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[#2E7D32]" /><span>{saveStatus}</span></div>
          <button onClick={() => void saveGarden()} disabled={isSaving} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#C6A96B] px-4 py-2.5 text-xs font-bold text-[#183D2B] hover:bg-[#DFC488] disabled:opacity-60"><Save className="h-4 w-4" />{isSaving ? 'กำลังบันทึก…' : 'บันทึกความคืบหน้าเกม'}</button>
        </div>
      </section>
    </div>
  );
};
