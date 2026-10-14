import rawRows from './mongkol-mai-data.json';
import { Plant, BeliefType } from '../types';

type CsvRow = Record<string, string>;
const rows = rawRows as unknown as CsvRow[];

const categoryMeta: Record<string, { prefix: string; id: string }> = {
  'ไม้ยืนต้น': { prefix: 'A', id: 'cat-A' },
  'ไม้พุ่ม': { prefix: 'B', id: 'cat-B' },
  'ไม้ล้มลุก': { prefix: 'C', id: 'cat-C' },
  'ไม้เลื้อย': { prefix: 'D', id: 'cat-D' },
  'ไม้คลุมดิน': { prefix: 'E', id: 'cat-E' },
  'ต้นปาล์ม': { prefix: 'F', id: 'cat-F' },
  'ปาล์ม': { prefix: 'F', id: 'cat-F' },
  'ไม้อวบน้ำ': { prefix: 'G', id: 'cat-G' },
  'ไม้ไผ่': { prefix: 'H', id: 'cat-H' },
};
const val = (r: CsvRow, key: string) => (r[key] || '').trim();
const yes = (v: string) => v.trim() === 'ใช่';
const asBeliefs = (r: CsvRow): BeliefType[] => {
  const text = `${val(r, 'ด้านมงคล')} ${val(r, 'ความเชื่อ')} ${val(r, 'ความหมายมงคล')}`;
  const types: BeliefType[] = [];
  if (/เงิน|ร่ำรวย|มั่งคั่ง|ทรัพย์|โชคลาภ/.test(text)) types.push('wealth');
  if (/การงาน|อาชีพ|ความสำเร็จ|ตำแหน่ง/.test(text)) types.push('career');
  if (/รัก|เมตตา|เสน่ห์/.test(text)) types.push('love');
  if (/บ้าน|ครอบครัว|ร่มเย็น/.test(text)) types.push('home');
  if (/สุขภาพ|อายุยืน/.test(text)) types.push('health');
  if (/ปัญญา|เรียนรู้|สติ/.test(text)) types.push('wisdom');
  if (/คุ้มครอง|ป้องกัน|ปลอดภัย/.test(text)) types.push('protection');
  if (!types.length) types.push('auspicious');
  return Array.from(new Set(types));
};

export const CSV_PLANTS: Plant[] = rows.map((r, index) => {
  const cat = categoryMeta[val(r, 'หมวดหมู่')] || categoryMeta['ไม้ยืนต้น'];
  const givenId = val(r, 'ID').toUpperCase();
  // Keep IDs from the source CSV only when their prefix matches the source category.
  const plantId = /^[A-H]\d+$/i.test(givenId) && givenId.startsWith(cat.prefix)
    ? givenId
    : `${cat.prefix}${String(index + 1).padStart(2, '0')}`;
  const imageUrl = val(r, 'ลิงก์รูปภาพ (URL)');
  const referenceUrls = val(r, 'แหล่งอ้างอิง').split(/\s+/).filter((u) => /^https?:\/\//i.test(u));
  const sourceData = Object.fromEntries(Object.entries(r).map(([k, v]) => [k, String(v ?? '').trim()]));
  const petText = val(r, 'ความเป็นพิษต่อสัตว์เลี้ยง');
  const petSuitable = val(r, 'เหมาะกับสัตว์เลี้ยง');
  return {
    plantId,
    thaiName: val(r, 'ชื่อไทย') || 'ไม่ระบุชื่อ',
    englishName: val(r, 'ชื่ออังกฤษ'),
    scientificName: val(r, 'ชื่อวิทยาศาสตร์'),
    family: val(r, 'วงศ์พืช'),
    otherNames: val(r, 'ชื่อท้องถิ่น').split(/[;,،]/).map(s => s.trim()).filter(Boolean),
    localName: val(r, 'ชื่อท้องถิ่น'),
    categoryId: cat.id,
    categoryCode: cat.prefix,
    description: val(r, 'ลักษณะทั่วไป'),
    growthType: val(r, 'ประเภทการเจริญเติบโต'),
    characteristics: {
      general: val(r, 'ลักษณะทั่วไป'),
      leaf: val(r, 'ลักษณะใบ'),
      stem: '',
      flower: val(r, 'ลักษณะดอก'),
      fruit: val(r, 'ลักษณะผลและเมล็ด'),
      fruitSeed: val(r, 'ลักษณะผลและเมล็ด'),
      highlight: val(r, 'จุดเด่น'),
      height: val(r, 'ความสูง'),
      growthType: val(r, 'ประเภทการเจริญเติบโต'),
    },
    belief: {
      types: asBeliefs(r),
      culturalMeaning: val(r, 'ความเชื่อ'),
      benefits: val(r, 'ความหมายมงคล'),
      meaning: val(r, 'ความหมายมงคล'),
      auspicious: val(r, 'ด้านมงคล'),
      beliefOrigin: val(r, 'ที่มาของความเชื่อ'),
    },
    care: {
      soil: val(r, 'ดิน'),
      sunlight: val(r, 'แสง'),
      water: val(r, 'น้ำ'),
      humidity: val(r, 'ความชื้น'),
      temperature: val(r, 'อุณหภูมิ'),
      fertilizer: val(r, 'ปุ๋ย'),
      propagation: val(r, 'การขยายพันธุ์'),
      pruning: val(r, 'การตัดแต่ง'),
      planting: val(r, 'วิธีปลูก'),
      pests: val(r, 'ศัตรูพืช'),
      disease: val(r, 'โรค'),
      prevention: val(r, 'วิธีป้องกัน'),
      lightLevel: val(r, 'ระดับแสง'),
      waterLevel: val(r, 'ระดับน้ำ'),
    },
    safety: {
      caution: val(r, 'ข้อควรระวัง'),
      toxicityHuman: val(r, 'ความเป็นพิษต่อคน'),
      toxicityPets: petText,
      petSafe: petSuitable ? (yes(petSuitable) ? 'ใช่' : 'ไม่ใช่') : undefined,
      petToxicity: petText,
      petDetail: val(r, 'สัตว์เลี้ยงที่เหมาะ / ข้อมูลเพิ่มเติม'),
      toxicParts: val(r, 'ส่วนที่เป็นพิษ'),
      symptoms: val(r, 'อาการที่อาจเกิดขึ้น'),
      safetyReference: '',
    },
    suitability: {
      home: yes(val(r, 'เหมาะกับบ้าน')),
      condo: yes(val(r, 'เหมาะกับคอนโด')),
      balcony: yes(val(r, 'เหมาะกับระเบียง')),
      garden: yes(val(r, 'เหมาะกับสวน')),
      pot: yes(val(r, 'เหมาะกับกระถาง')),
      limitedSpace: yes(val(r, 'เหมาะกับพื้นที่จำกัด')),
      busyFriendly: yes(val(r, 'เหมาะกับผู้มีเวลาน้อย')),
      beginner: yes(val(r, 'เหมาะกับมือใหม่')),
      suitableUser: val(r, 'เหมาะกับผู้ใช้ลักษณะใด'),
      space: val(r, 'ขนาดพื้นที่'),
    },
    spaceType: val(r, 'ขนาดพื้นที่'),
    careLevel: val(r, 'ระดับการดูแล'),
    keywords: [val(r, 'ชื่อไทย'), val(r, 'ชื่ออังกฤษ'), val(r, 'ชื่อวิทยาศาสตร์'), val(r, 'หมวดหมู่'), val(r, 'ด้านมงคล')].filter(Boolean),
    images: imageUrl ? [imageUrl] : [],
    imageCredit: val(r, 'เครดิตภาพ'),
    source: referenceUrls[0] || '',
    sourceUrl: referenceUrls[0] || '',
    references: referenceUrls.map((url, i) => ({ title: `แหล่งอ้างอิง ${i + 1}`, author: val(r, 'เครดิตภาพ'), url, verifiedDate: '' })),
    status: 'published',
    isFeatured: index < 8,
    isNew: false,
    createdByName: val(r, 'ผู้ลงข้อมูล'),
    updatedByName: val(r, 'ผู้แก้ไขล่าสุด'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sourceData,
  };
});
