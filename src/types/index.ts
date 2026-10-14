export type CategoryPrefix = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';

export interface Category {
  categoryId: string;
  prefix: CategoryPrefix;
  name: string;
  englishName: string;
  description: string;
  image: string;
  sortOrder: number;
  plantCount?: number;
}

export type BeliefType = 
  | 'wealth'        // โชคลาภและความมั่งคั่ง
  | 'career'        // การงานและความสำเร็จ
  | 'love'          // ความรักและความเมตตา
  | 'home'          // บ้านและครอบครัว
  | 'health'        // สุขภาพและอายุยืน
  | 'wisdom'        // การเรียนรู้และปัญญา
  | 'protection'    // การปกป้องคุ้มครอง
  | 'auspicious';   // เสริมสิริมงคลทั่วไป

export interface BeliefCategory {
  id: BeliefType;
  title: string;
  englishTitle: string;
  description: string;
  iconName: string;
  color: string;
  direction?: string; // ทิศมงคลตามตำราไทย
}

export interface PlantCharacteristics {
  general: string;
  leaf: string;
  stem?: string;
  flower: string;
  fruit?: string;
  fruitSeed?: string;
  highlight: string;
  height?: string;
  growthType?: string;
}

export interface PlantCare {
  soil: string;
  sunlight: string;
  water: string;
  humidity: string;
  temperature: string;
  fertilizer: string;
  propagation: string;
  pruning: string;
  planting?: string; // Step-by-step planting guide
  pests: string;
  disease?: string;  // Plant diseases
  prevention: string;
  waterLevel?: string;
  lightLevel?: string;
}

export interface PlantSafety {
  caution: string;
  toxicityHuman: string;
  toxicityPets: string;
  petSafe?: 'ใช่' | 'ไม่ใช่' | boolean;
  petToxicity?: string;
  petDetail?: string;
  toxicParts?: string;
  symptoms?: string;
  safetyReference: string;
}

export interface PlantSuitability {
  condo?: boolean;
  balcony?: boolean;
  home?: boolean;
  garden?: boolean;
  pot?: boolean;
  limitedSpace?: boolean;
  busyFriendly?: boolean;
  beginner?: boolean;
  suitableUser?: string;
  space?: string;
}

export interface PlantReference {
  title: string;
  author: string;
  url?: string;
  verifiedDate: string;
}

export interface Plant {
  plantId: string; // e.g. "G07", "A01"
  thaiName: string;
  englishName: string;
  scientificName: string;
  family: string;
  otherNames: string[];
  localName?: string;
  categoryId: string; // "cat-A" through "cat-H"
  categoryCode?: string; // "A" - "H"
  description: string;
  growthType?: string;
  characteristics: PlantCharacteristics;
  belief: {
    types: BeliefType[];
    culturalMeaning: string;
    benefits: string;
    auspiciousDirection?: string;
    beliefOrigin?: string;
    meaning?: string;
    auspicious?: string;
  };
  care: PlantCare;
  safety: PlantSafety;
  suitability?: PlantSuitability;
  spaceType: string;
  careLevel: string;
  keywords: string[];
  images: string[];
  imageCredit?: string;
  sourceUrl?: string;
  source?: string;
  references: PlantReference[];
  status: 'published' | 'draft' | 'archived';
  isFeatured?: boolean;
  isNew?: boolean;
  createdBy?: string;
  createdByName?: string;
  createdByEmail?: string;
  updatedBy?: string;
  updatedByName?: string;
  updatedByEmail?: string;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
  deletedAt?: string | null;
  /** Complete original row from the imported CSV, preserved for full-detail viewing/export. */
  sourceData?: Record<string, string>;
}

export interface Article {
  articleId: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: 'เกร็ดความรู้' | 'ประวัติและวัฒนธรรม' | 'การดูแลรักษา' | 'การจัดสวน' | 'พฤกษศาสตร์';
  author: string;
  readTime: string;
  publishedAt: string;
  status: 'published' | 'draft';
}

export interface FAQ {
  faqId: string;
  question: string;
  answer: string;
  category: 'ทั่วไป' | 'การค้นหาต้นไม้' | 'ความเชื่อและพฤกษศาสตร์' | 'ระบบสมาชิก' | 'การแจ้งข้อมูล';
  sortOrder: number;
}

export interface ContactMessage {
  messageId: string;
  name: string;
  email: string;
  subject: string;
  category: 'แจ้งข้อมูลต้นไม้ผิดพลาด' | 'เสนอเพิ่มข้อมูลต้นไม้' | 'สอบถามเกี่ยวกับฐานข้อมูล' | 'แจ้งปัญหาการใช้งาน' | 'เสนอแนะการพัฒนา' | 'สอบถามทั่วไป';
  message: string;
  status: 'new' | 'processing' | 'replied' | 'closed';
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  role: 'guest' | 'member' | 'admin';
  favorites: string[]; // array of plantId
  avatarUrl?: string;
  authProvider?: 'google' | 'email';
  status?: 'active' | 'suspended';
  lastLoginAt?: string;
  createdAt: string;
}

export interface QuizState {
  step: number;
  purpose: string;
  space: string;
  sunlight: string;
  careTime: string;
  hasPetsOrKids: boolean;
  plantStyle: string;
}

export interface QuizResult {
  plant: Plant;
  score: number;
  reasons: string[];
  safetyWarning?: string;
}

export interface AuditLog {
  logId: string;
  actor: string;
  action: string;
  entityType: 'plant' | 'category' | 'article' | 'faq' | 'user' | 'system';
  entityId: string;
  summary: string;
  timestamp: string;
}

export interface FileImportResult {
  success: boolean;
  importedCount: number;
  errors: string[];
  sampleData?: any[];
}
