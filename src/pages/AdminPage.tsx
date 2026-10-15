import React, { useState, useRef, useEffect } from 'react';
import { store } from '../services/store';
import { db } from '../services/firebase';
import { collection, doc, getDoc, setDoc, serverTimestamp, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Plant, Category, Article, FAQ, ContactMessage, AuditLog, UserProfile, FileImportResult } from '../types';
import { SAMPLE_PLANTS_DATA } from '../data/plants';
import { toDateTimeLocalInput, toAnnouncementStorageValue } from '../utils/announcements';
import { 
  ShieldCheck, 
  TreePine, 
  BookOpen, 
  HelpCircle, 
  Mail, 
  Users, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Edit3, 
  Download, 
  Upload, 
  Search, 
  Check, 
  AlertCircle, 
  Layers, 
  FileText, 
  Clock, 
  Sparkles, 
  X, 
  Eye, 
  FileSpreadsheet, 
  CheckSquare, 
  Square, 
  Lock, 
  ShieldAlert, 
  UserCheck, 
  UserX,
  FileDown,
  RefreshCw
} from 'lucide-react';

interface AdminPageProps {
  plants: Plant[];
  categories: Category[];
  articles: Article[];
  faqs: FAQ[];
  contactMessages: ContactMessage[];
  auditLogs: AuditLog[];
  currentUser: UserProfile;
  onSelectPlant: (plant: Plant) => void;
  onOpenAuthModal: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  plants,
  categories,
  articles,
  faqs,
  contactMessages,
  auditLogs,
  currentUser,
  onSelectPlant,
  onOpenAuthModal,
}) => {
  // If user is not an admin, show Access Denied Gate
  if (currentUser.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6 font-body">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-[#0F271B] border border-[#C6A96B]/50 flex items-center justify-center text-[#C6A96B] shadow-xl">
          <Lock className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-semibold text-[#A48545] uppercase tracking-wider">
            RESTRICTED ACCESS AREA
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#183D2B]">
            สงวนสิทธิ์เฉพาะผู้ดูแลระบบ (Admin)
          </h1>
          <p className="text-xs text-[#7A746B] max-w-md mx-auto leading-relaxed">
            ระบบแอดมินใช้สำหรับจัดการสารสนเทศพฤกษศาสตร์ นำเข้าไฟล์ข้อมูล และตรวจสอบข้อความ 
            โปรดเข้าสู่ระบบด้วยบัญชีผู้ดูแลระบบเพื่อดำเนินการต่อ
          </p>
        </div>

        <button
          onClick={onOpenAuthModal}
          className="px-6 py-2.5 bg-[#183D2B] hover:bg-[#25523B] text-white rounded-xl text-xs font-bold transition-all shadow-md inline-flex items-center gap-2"
        >
          <ShieldCheck className="w-4 h-4 text-[#C6A96B]" />
          <span>เข้าสู่ระบบด้วยบัญชี Admin</span>
        </button>
      </div>
    );
  }

  // --- Main Admin States ---
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showKnowledgeGraph, setShowKnowledgeGraph] = useState(false);
  const [selectedGraphTypes, setSelectedGraphTypes] = useState<string[]>(['plants', 'categories', 'articles', 'users', 'contributors', 'messages']);
  const [selectedGraphNodeId, setSelectedGraphNodeId] = useState<string | null>(null);
  const [graphZoom, setGraphZoom] = useState(1);
  const [graphNodeOffsets, setGraphNodeOffsets] = useState<Record<string, {x:number;y:number}>>({});
  const [graphDragId, setGraphDragId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'plants' | 'import' | 'categories' | 'articles' | 'faqs' | 'activities' | 'users' | 'messages' | 'logs'>('overview');
  
  // Plants Table States
  const [plantSearch, setPlantSearch] = useState('');
  const [showTrash, setShowTrash] = useState(false);
  const [selectedPlantIds, setSelectedPlantIds] = useState<string[]>([]);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [formTab, setFormTab] = useState<'general' | 'botany' | 'belief' | 'care' | 'safety' | 'suitability' | 'refs'>('general');
  const [saveStatus, setSaveStatus] = useState<string>('');

  // Import Center States
  const [importType, setImportType] = useState<'csv' | 'json'>('csv');
  const [importStatus, setImportStatus] = useState<FileImportResult | null>(null);
  // หมวดหมู่ปลายทางสำหรับไฟล์ที่นำเข้า (ใช้กับทุกแถวเมื่อเปิดบังคับหมวด)
  const [selectedImportCategoryId, setSelectedImportCategoryId] = useState<string>('cat-A');
  const [forceImportCategory, setForceImportCategory] = useState<boolean>(true);
  const [selectedImportFileName, setSelectedImportFileName] = useState<string>('');
  const [previewData, setPreviewData] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // New Category / Article / FAQ Modals
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [articleImportFeedback, setArticleImportFeedback] = useState('');
  const [maintenanceNotice, setMaintenanceNotice] = useState({
    enabled: false, title: '', message: '', startAt: '', endAt: '', imageUrl: '', status: 'normal' as 'normal' | 'maintenance', showInBell: true, showInHelp: true, showInBanner: true
  });
  const [maintenanceFeedback, setMaintenanceFeedback] = useState('');
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [siteActivities, setSiteActivities] = useState<Array<any>>([]);
  const [editingActivity, setEditingActivity] = useState<any>(null);
  const [activityFeedback, setActivityFeedback] = useState('');

  useEffect(() => {
    getDocs(collection(db, 'siteActivities')).then((snapshot) => {
      setSiteActivities(snapshot.docs.map((item) => {
        const data = item.data();
        return { id: item.id, ...data, startAt: toDateTimeLocalInput(data.startAt), endAt: toDateTimeLocalInput(data.endAt) };
      }));
    }).catch((error) => {
      console.error('Could not load site activities from Firestore:', error);
      setActivityFeedback('โหลดรายการประกาศไม่สำเร็จ โปรดตรวจสอบ Firestore Rules และการเชื่อมต่อ');
    });
  }, []);

  const saveActivity = async () => {
    if (!editingActivity?.title?.trim() || !editingActivity?.message?.trim()) {
      setActivityFeedback('กรุณากรอกชื่อกิจกรรมและรายละเอียด'); return;
    }
    try {
      const payload = {
        title: String(editingActivity.title).trim(),
        message: String(editingActivity.message).trim(),
        startAt: toAnnouncementStorageValue(editingActivity.startAt),
        endAt: toAnnouncementStorageValue(editingActivity.endAt),
        imageUrl: editingActivity.imageUrl || '',
        enabled: Boolean(editingActivity.enabled),
        showInBell: editingActivity.showInBell !== false,
        showInHelp: editingActivity.showInHelp !== false,
        showInBanner: editingActivity.showInBanner !== false,
        kind: editingActivity.kind || 'activity',
        updatedAt: serverTimestamp(),
        updatedBy: currentUser.uid,
      };
      if (editingActivity.id) {
        await updateDoc(doc(db, 'siteActivities', editingActivity.id), payload);
        setSiteActivities((items) => items.map((item) => item.id === editingActivity.id ? { ...item, ...payload } : item));
      } else {
        const created = await addDoc(collection(db, 'siteActivities'), { ...payload, createdAt: serverTimestamp(), createdBy: currentUser.uid });
        setSiteActivities((items) => [{ id: created.id, ...payload }, ...items]);
      }
      setEditingActivity(null);
      setActivityFeedback('บันทึกกิจกรรมแล้ว ระบบจะแสดงกิจกรรมที่เปิดใช้งานตามช่วงเวลา');
    } catch (error) {
      console.error(error);
      setActivityFeedback('บันทึกกิจกรรมไม่สำเร็จ โปรดตรวจสอบสิทธิ์แอดมินและ Firestore Rules');
    }
  };
  const removeActivity = async (activity: any) => {
    if (!window.confirm(`ลบกิจกรรม "${activity.title}" ใช่หรือไม่?`)) return;
    try {
      await deleteDoc(doc(db, 'siteActivities', activity.id));
      setSiteActivities((items) => items.filter((item) => item.id !== activity.id));
      setActivityFeedback('ลบกิจกรรมแล้ว');
    } catch (error) { setActivityFeedback('ลบไม่สำเร็จ โปรดตรวจสอบสิทธิ์แอดมิน'); }
  };

  useEffect(() => {
    getDoc(doc(db, 'siteSettings', 'maintenanceNotice')).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setMaintenanceNotice({
          enabled: Boolean(data.enabled),
          title: String(data.title || ''),
          message: String(data.message || ''),
          imageUrl: String(data.imageUrl || ''),
          startAt: toDateTimeLocalInput(data.startAt),
          endAt: toDateTimeLocalInput(data.endAt),
          status: data.status === 'maintenance' ? 'maintenance' : 'normal',
          showInBell: data.showInBell !== false, showInHelp: data.showInHelp !== false, showInBanner: data.showInBanner !== false,
        });
      }
    }).catch((error) => console.warn('Could not load maintenance notice', error));
  }, []);

  const saveMaintenanceNotice = async () => {
    setMaintenanceFeedback('');
    try {
      await setDoc(doc(db, 'siteSettings', 'maintenanceNotice'), {
        ...maintenanceNotice,
        startAt: toAnnouncementStorageValue(maintenanceNotice.startAt),
        endAt: toAnnouncementStorageValue(maintenanceNotice.endAt),
        enabled: Boolean(maintenanceNotice.enabled),
        showInBell: maintenanceNotice.showInBell !== false, showInHelp: maintenanceNotice.showInHelp !== false, showInBanner: maintenanceNotice.showInBanner !== false,
        title: maintenanceNotice.title.trim(),
        message: maintenanceNotice.message.trim(),
        updatedAt: serverTimestamp(), updatedBy: currentUser.uid
      });
      setMaintenanceFeedback('บันทึกประกาศเรียบร้อยแล้ว');
      setShowAnnouncementForm(false);
    } catch (error) {
      setMaintenanceFeedback('บันทึกไม่สำเร็จ โปรดตรวจสอบสิทธิ์ Admin และ Firestore Rules');
    }
  };

  const handleSaveArticle = (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingArticle || !editingArticle.title.trim() || !editingArticle.content.trim()) {
      alert('กรุณากรอกชื่อบทความและเนื้อหา'); return;
    }
    const article = {
      ...editingArticle,
      slug: editingArticle.slug || editingArticle.title.trim().toLowerCase().replace(/\\s+/g, '-'),
      publishedAt: editingDate(editingArticle.publishedAt),
    };
    if (articles.some((item) => item.articleId === article.articleId)) store.updateArticle(article.articleId, article);
    else store.addArticle(article);
    setEditingArticle(null);
  };

  const editingDate = (value: string) => value || new Date().toISOString().slice(0, 10);

  const handleImportArticles = async (file?: File) => {
    if (!file) return;
    try {
      const text = await file.text();
      let rows: any[] = [];
      if (file.name.toLowerCase().endsWith('.json')) {
        const parsed = JSON.parse(text);
        rows = Array.isArray(parsed) ? parsed : Array.isArray(parsed.articles) ? parsed.articles : [];
      } else {
        const lines = text.split(/\\r?\\n/).filter((line) => line.trim());
        const parseLine = (line: string) => {
          const values: string[] = []; let value = ''; let quoted = false;
          for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"' && line[i + 1] === '"' && quoted) { value += '"'; i++; }
            else if (ch === '"') quoted = !quoted;
            else if (ch === ',' && !quoted) { values.push(value); value = ''; }
            else value += ch;
          }
          values.push(value); return values;
        };
        const headers = parseLine(lines.shift() || '').map((header) => header.trim());
        rows = lines.map((line) => Object.fromEntries(parseLine(line).map((value, index) => [headers[index], value])));
      }
      if (!rows.length) throw new Error('ไม่พบรายการบทความในไฟล์');
      let imported = 0;
      rows.forEach((row, index) => {
        if (!row.title || !row.content) return;
        const item: Article = {
          articleId: String(row.articleId || `article-${Date.now()}-${index}`),
          title: String(row.title), slug: String(row.slug || ''),
          excerpt: String(row.excerpt || ''), content: String(row.content),
          coverImage: String(row.coverImage || ''),
          category: (row.category || 'เกร็ดความรู้') as Article['category'],
          author: String(row.author || currentUser.displayName || 'SACRED CANOPY'),
          readTime: String(row.readTime || '5 นาที'),
          publishedAt: String(row.publishedAt || new Date().toISOString().slice(0, 10)),
          status: row.status === 'draft' ? 'draft' : 'published',
          referenceUrl: String(row.referenceUrl || row.sourceUrl || ''),
        };
        if (articles.some((existing) => existing.articleId === item.articleId)) store.updateArticle(item.articleId, item);
        else store.addArticle(item);
        imported++;
      });
      setArticleImportFeedback(`นำเข้าบทความสำเร็จ ${imported} รายการ`);
    } catch (error) {
      setArticleImportFeedback(`นำเข้าไม่สำเร็จ: ${error instanceof Error ? error.message : 'ไฟล์ไม่ถูกต้อง'}`);
    }
  };


  // Registered Users table filters and feedback
  const [userNameFilter, setUserNameFilter] = useState('');
  const [userEmailFilter, setUserEmailFilter] = useState('');
  const [userRoleFeedback, setUserRoleFeedback] = useState('');
  const [savingUserRoleId, setSavingUserRoleId] = useState<string | null>(null);

  // Registered Users list
  const registeredUsers = store.getRegisteredUsers();
  const filteredRegisteredUsers = registeredUsers.filter((user) => {
    const nameMatches = user.displayName.toLowerCase().includes(userNameFilter.trim().toLowerCase());
    const emailMatches = user.email.toLowerCase().includes(userEmailFilter.trim().toLowerCase());
    return nameMatches && emailMatches;
  });

  const formatMemberCreatedAt = (value?: string) => {
    if (!value) return 'ไม่พบวันที่สมัคร';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return 'ไม่พบวันที่สมัคร';
    return parsed.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleMemberRoleChange = async (uid: string, role: 'member' | 'admin') => {
    if (uid === currentUser.uid && role !== 'admin') {
      setUserRoleFeedback('ไม่สามารถลดสิทธิ์บัญชีแอดมินที่กำลังใช้งานอยู่ได้');
      return;
    }
    const target = registeredUsers.find((user) => user.uid === uid);
    if (!target || target.role === role) return;
    const confirmed = window.confirm(`ยืนยันเปลี่ยนบทบาท ${target.displayName} (${target.email}) เป็น ${role === 'admin' ? 'Admin' : 'Member'} หรือไม่?`);
    if (!confirmed) return;
    setSavingUserRoleId(uid);
    setUserRoleFeedback('กำลังบันทึกบทบาท...');
    try {
      await store.updateUserRole(uid, role);
      setUserRoleFeedback(`บันทึกบทบาทของ ${target.displayName} สำเร็จ`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'ไม่สามารถเปลี่ยนบทบาทได้';
      setUserRoleFeedback(`เปลี่ยนบทบาทไม่สำเร็จ: ${message}`);
    } finally {
      setSavingUserRoleId(null);
    }
  };

  const allPlantsWithDeleted = store.getPlants(true);
  const activePlants = allPlantsWithDeleted.filter((p) => !p.deletedAt);
  const deletedPlants = allPlantsWithDeleted.filter((p) => p.deletedAt);
  const pendingMessages = contactMessages.filter((m) => m.status === 'new' || m.status === 'processing');

  const displayedPlants = (showTrash ? deletedPlants : activePlants).filter((p) => {
    if (!plantSearch.trim()) return true;
    const q = plantSearch.toLowerCase();
    return (
      p.thaiName.toLowerCase().includes(q) ||
      p.scientificName.toLowerCase().includes(q) ||
      p.plantId.toLowerCase().includes(q)
    );
  });

  // Select all toggle
  const handleSelectAllPlants = () => {
    if (selectedPlantIds.length === displayedPlants.length) {
      setSelectedPlantIds([]);
    } else {
      setSelectedPlantIds(displayedPlants.map((p) => p.plantId));
    }
  };

  const handleToggleSelectPlant = (id: string) => {
    setSelectedPlantIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Bulk Actions
  const handleBulkSoftDelete = () => {
    if (confirm(`คุณต้องการย้ายพรรณไม้ที่เลือกจำนวน ${selectedPlantIds.length} รายการลงถังขยะใช่หรือไม่?`)) {
      store.bulkSoftDelete(selectedPlantIds);
      setSelectedPlantIds([]);
    }
  };

  const handleBulkRestore = () => {
    store.bulkRestore(selectedPlantIds);
    setSelectedPlantIds([]);
  };

  // Plant Add/Edit
  const handleOpenAddForm = () => {
    const nextCode = store.getNextPlantCode('A');
    const newTemplate: Plant = {
      plantId: nextCode,
      thaiName: '',
      englishName: '',
      scientificName: '',
      family: '',
      otherNames: [],
      categoryId: 'cat-A',
      description: '',
      characteristics: {
        general: '',
        leaf: '',
        stem: '',
        flower: '',
        fruit: '',
        highlight: '',
      },
      belief: {
        types: ['auspicious'],
        culturalMeaning: '',
        benefits: '',
        auspiciousDirection: 'ทิศตะวันออก',
      },
      care: {
        soil: 'ดินร่วนระบายน้ำดี',
        sunlight: 'แดดจัดเต็มวัน',
        water: 'รดน้ำทุกวัน',
        humidity: 'ปานกลาง',
        temperature: '25°C - 35°C',
        fertilizer: 'ปุ๋ยคอกปีละ 2 ครั้ง',
        propagation: 'เพาะเมล็ด / ปักชำ',
        pruning: 'ตัดแต่งกิ่งแห้ง',
        pests: 'เพลี้ยและหนอนกินใบ',
        prevention: 'ฉีดพ่นน้ำสะเดาหมัก',
      },
      safety: {
        caution: 'ปลอดภัย',
        toxicityHuman: 'ปลอดภัย',
        toxicityPets: 'ปลอดภัยต่อสุนัขและแมว',
        safetyReference: 'หอพรรณไม้ กรมอุทยานแห่งชาติฯ',
      },
      spaceType: 'บ้านเดี่ยว/สวนกว้าง',
      careLevel: 'ดูแลง่าย',
      keywords: ['ไม้มงคล'],
      images: ['/images/botanical_ratchaphruek_1791992174219.jpg'],
      references: [
        {
          title: 'สารานุกรมพรรณไม้ในประเทศไทย',
          author: 'กรมอุทยานแห่งชาติ สัตว์ป่า และพันธุ์พืช',
          verifiedDate: '2026-03-01',
        },
      ],
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEditingPlant(newTemplate);
    setIsCreatingNew(true);
    setFormTab('general');
  };

  const handleSavePlantForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlant) return;

    if (!editingPlant.thaiName.trim() || !editingPlant.scientificName.trim()) {
      alert('กรุณากรอกชื่อไทยและชื่อวิทยาศาสตร์');
      return;
    }

    if (isCreatingNew) {
      store.addPlant(editingPlant);
      setSaveStatus('สร้างพรรณไม้ใหม่สำเร็จ!');
    } else {
      store.updatePlant(editingPlant.plantId, editingPlant);
      setSaveStatus('บันทึกการแก้ไขสำเร็จ!');
    }

    setTimeout(() => {
      setEditingPlant(null);
      setIsCreatingNew(false);
      setSaveStatus('');
    }, 800);
  };

  // File Upload Handlers (CSV / JSON)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setPreviewData(content);
      setSelectedImportFileName(file.name);

      const isJson = file.name.toLowerCase().endsWith('.json');
      if (isJson) {
        setImportType('json');
        const res = store.importJSON(
          content,
          selectedImportCategoryId,
          forceImportCategory
        );
        setImportStatus(res);
      } else {
        setImportType('csv');
        const res = store.importCSV(
          content,
          selectedImportCategoryId,
          forceImportCategory
        );
        setImportStatus(res);
      }
    };
    reader.readAsText(file);
  };

  const handleSyncSystemDataset = () => {
    try {
      const res = store.importJSON(JSON.stringify(SAMPLE_PLANTS_DATA));
      setImportType('json');
      setImportStatus({
        ...res,
        errors: res.errors.length > 0 ? res.errors : [`นำเข้าชุดข้อมูลตัวอย่างจาก src/data/plants.ts แล้ว`]
      });
    } catch (err: any) {
      setImportStatus({ success: false, importedCount: 0, errors: [err.message] });
    }
  };

  const handleDownloadTemplate = () => {
    const csvTemplate = store.generateCSVTemplate();
    const blob = new Blob([csvTemplate], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sacred_canopy_plant_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const csvContent = store.exportPlantsCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sacred_canopy_plants_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportBackup = () => {
    const jsonStr = store.exportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sacred_canopy_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-body">
      {/* Admin Header with Actions */}
      <div className="bg-[#183D2B] text-white p-6 sm:p-8 rounded-2xl border border-[#C6A96B]/30 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#C6A96B] font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>SACRED CANOPY • ADMINISTRATOR CONSOLE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold mt-1">
            แผงควบคุมระบบและจัดการสารสนเทศ
          </h1>
          <p className="text-xs text-[#A8B89A] mt-0.5">
            จัดการฐานข้อมูลพรรณไม้ ระบบนำเข้าไฟล์ (CSV/JSON) จัดการบทความ สมาชิก และข้อความติดต่อ
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setActiveTab('import')}
            className="px-4 py-2 bg-[#C6A96B] hover:bg-[#DFC488] text-[#0F271B] font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Upload className="w-4 h-4" />
            <span>นำเข้าไฟล์ข้อมูล (Import)</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="ส่งออกไฟล์ CSV พร้อมเปิดใน Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#A7C957]" />
            <span>ส่งออก CSV</span>
          </button>
          <button
            onClick={handleExportBackup}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-[#C6A96B]" />
            <span>JSON Backup</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs — compact botanical command cards */}
      <nav aria-label="เมนูควบคุมระบบแอดมิน" className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2 rounded-2xl border border-[#E9E0CF] bg-[#F4F0E7] p-2.5 shadow-inner">
        {[
          { id: 'overview', label: 'ภาพรวมระบบ', sub: 'Overview', count: null, icon: '✦' },
          { id: 'plants', label: 'จัดการพรรณไม้', sub: 'Plant library', count: activePlants.length, icon: '❧' },
          { id: 'import', label: 'ศูนย์นำเข้าไฟล์', sub: 'Import center', count: null, icon: '⇧' },
          { id: 'categories', label: 'หมวดหมู่', sub: 'Categories', count: categories.length, icon: '◈' },
          { id: 'articles', label: 'บทความ', sub: 'Articles', count: articles.length, icon: '▤' },
          { id: 'faqs', label: 'คำถามที่พบบ่อย', sub: 'FAQ & notices', count: faqs.length, icon: '?' },
          { id: 'activities', label: 'ประกาศและกิจกรรม', sub: 'Events & alerts', count: siteActivities.length, icon: '♢' },
          { id: 'users', label: 'สมาชิกและสิทธิ์', sub: 'Members', count: registeredUsers.length, icon: '♙' },
          { id: 'messages', label: 'ข้อความติดต่อ', sub: 'Inbox', count: pendingMessages.length, icon: '✉' },
          { id: 'logs', label: 'Audit Logs', sub: 'Activity trail', count: null, icon: '⌁' },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} aria-current={activeTab === tab.id ? 'page' : undefined}
            className={`group min-h-[72px] rounded-xl border px-3 py-2.5 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#C6A96B]/60 ${activeTab === tab.id ? 'border-[#183D2B] bg-[#183D2B] text-[#FAF7F0] shadow-md -translate-y-0.5' : 'border-white/80 bg-white/80 text-[#49382C] hover:-translate-y-0.5 hover:border-[#C6A96B]/60 hover:bg-white hover:shadow-sm'}`}>
            <span className="flex items-center justify-between gap-2"><span className={`flex h-7 w-7 items-center justify-center rounded-lg text-base ${activeTab === tab.id ? 'bg-white/10 text-[#DFC488]' : 'bg-[#F3EFE5] text-[#9A7B3F]'}`}>{tab.icon}</span>{tab.count !== null && <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums ${activeTab === tab.id ? 'bg-white/10 text-[#DFC488]' : 'bg-[#F3EFE5] text-[#7A746B]'}`}>{tab.count}</span>}</span>
            <span className="mt-2 block text-xs font-bold leading-tight">{tab.label}</span><span className={`mt-0.5 block text-[9px] tracking-wide ${activeTab === tab.id ? 'text-white/60' : 'text-[#9A9184]'}`}>{tab.sub}</span>
          </button>
        ))}
      </nav>

      {/* 1. Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in">
          {/* Primary KPI Counters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-[#EEE7DA] shadow-sm space-y-2">
              <span className="text-xs text-[#7A746B]">พรรณไม้ในระบบ</span>
              <div className="text-3xl font-bold font-mono text-[#183D2B]">{activePlants.length}</div>
              <span className="text-[11px] text-[#2E7D32] block">สถานะเผยแพร่สาธารณะ</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#EEE7DA] shadow-sm space-y-2">
              <span className="text-xs text-[#7A746B]">สมาชิกที่ลงทะเบียน</span>
              <div className="text-3xl font-bold font-mono text-[#183D2B]">{registeredUsers.length}</div>
              <span className="text-[11px] text-[#A48545] block">ทั้ง Google และ Email</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#EEE7DA] shadow-sm space-y-2">
              <span className="text-xs text-[#7A746B]">บทความวิชาการ</span>
              <div className="text-3xl font-bold font-mono text-[#183D2B]">{articles.length}</div>
              <span className="text-[11px] text-[#7A746B] block">พฤกษศาสตร์และวัฒนธรรม</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#EEE7DA] shadow-sm space-y-2">
              <span className="text-xs text-[#7A746B]">ข้อความติดต่อรอดำเนินการ</span>
              <div className="text-3xl font-bold font-mono text-[#C62828]">{pendingMessages.length}</div>
              <span className="text-[11px] text-[#7A746B] block">ข้อเสนอแนะและแจ้งข้อมูล</span>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <section className="xl:col-span-2 rounded-2xl border border-[#EEE7DA] bg-white p-5 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div><h3 className="text-sm font-bold text-[#183D2B]">สถิติและการเปลี่ยนแปลง</h3><p className="text-[11px] text-[#7A746B] mt-1">สรุปจากข้อมูลที่หน้าแอดมินโหลดได้ในขณะนี้</p></div>
                <span className="text-[10px] text-[#7A746B]">อัปเดต {new Date().toLocaleString('th-TH')}</span>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'พรรณไม้เผยแพร่', count: activePlants.filter((plant) => plant.status === 'published').length, total: Math.max(activePlants.length, 1), color: 'bg-[#2E7D32]' },
                  { label: 'บทความเผยแพร่', count: articles.filter((article) => article.status === 'published').length, total: Math.max(articles.length, 1), color: 'bg-[#C6A96B]' },
                  { label: 'ข้อความรอดำเนินการ', count: pendingMessages.length, total: Math.max(contactMessages.length, 1), color: 'bg-[#C62828]' },
                  { label: 'สมาชิก', count: registeredUsers.length, total: Math.max(registeredUsers.length, 1), color: 'bg-[#497A9C]' },
                ].map((stat) => <div key={stat.label} className="space-y-1"><div className="flex justify-between text-xs"><span className="text-[#49382C]">{stat.label}</span><strong className="text-[#183D2B]">{stat.count}</strong></div><div className="h-2.5 rounded-full bg-[#F3EFE5] overflow-hidden"><div className={`h-full rounded-full ${stat.color}`} style={{ width: `${Math.min(100, (stat.count / stat.total) * 100)}%` }} /></div></div>)}
              </div>
            </section>
            <section className="rounded-2xl border border-[#EEE7DA] bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between gap-2"><h3 className="text-sm font-bold text-[#183D2B]">Knowledge Graph · ความสัมพันธ์ข้อมูล</h3><button onClick={() => setShowKnowledgeGraph(true)} className="rounded-lg bg-[#183D2B] px-3 py-2 text-[11px] font-bold text-white">เปิดกราฟเต็ม</button></div>
              <p className="text-[11px] text-[#7A746B]">คลิกเปิดกราฟเพื่อสำรวจความเชื่อมโยงจากข้อมูลพรรณไม้ หมวดหมู่ บทความ สมาชิก และผู้ลงข้อมูลจริง</p>
              <svg viewBox="0 0 300 190" className="w-full max-h-48" role="img" aria-label="แผนภาพความสัมพันธ์พรรณไม้ หมวดหมู่ บทความ สมาชิก และรายการโปรด">
                <g stroke="#C6A96B" strokeWidth="2" opacity=".8"><line x1="150" y1="92" x2="68" y2="38"/><line x1="150" y1="92" x2="232" y2="38"/><line x1="150" y1="92" x2="62" y2="145"/><line x1="150" y1="92" x2="238" y2="145"/><line x1="68" y1="38" x2="232" y2="38"/></g>
                {[{x:150,y:92,w:90,h:38,label:'พรรณไม้',fill:'#183D2B'},{x:68,y:38,w:76,h:32,label:'หมวดหมู่',fill:'#497A5B'},{x:232,y:38,w:76,h:32,label:'บทความ',fill:'#497A5B'},{x:62,y:145,w:82,h:32,label:'สมาชิก',fill:'#9A7B3F'},{x:238,y:145,w:82,h:32,label:'รายการโปรด',fill:'#9A7B3F'}].map((n) => <g key={n.label}><rect x={n.x-n.w/2} y={n.y-n.h/2} width={n.w} height={n.h} rx="10" fill={n.fill}/><text x={n.x} y={n.y+4} fill="white" fontSize="10" textAnchor="middle">{n.label}</text></g>)}
              </svg>
              <div className="text-[10px] text-[#7A746B]">เป็นภาพสรุปความสัมพันธ์ของโมดูล ไม่ใช่การ query กราฟข้อมูลสด</div>
            </section>
          </div>
          <section className="rounded-2xl border border-[#EEE7DA] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-3"><h3 className="text-sm font-bold text-[#183D2B]">สมาชิกที่เข้าสู่ระบบล่าสุด</h3><span className="text-[10px] text-[#7A746B]">ประมาณการจากเวลาเข้าสู่ระบบล่าสุด ไม่ใช่สถานะออนไลน์เรียลไทม์</span></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {registeredUsers.filter((user) => user.role !== 'guest').sort((a,b) => new Date(b.lastLoginAt || b.createdAt || 0).getTime() - new Date(a.lastLoginAt || a.createdAt || 0).getTime()).slice(0,6).map((user) => {
                const recent = Boolean(user.lastLoginAt && Date.now() - new Date(user.lastLoginAt).getTime() < 15 * 60 * 1000);
                return <div key={user.uid} className="flex items-center gap-3 rounded-xl bg-[#FAF7F0] p-3 border border-[#EEE7DA]">{user.avatarUrl ? <img src={user.avatarUrl} className="w-10 h-10 rounded-full object-cover" alt="" /> : <div className="w-10 h-10 rounded-full bg-[#183D2B] text-[#C6A96B] flex items-center justify-center font-bold">{(user.displayName || '?').slice(0,1)}</div>}<div className="min-w-0 flex-1"><div className="text-xs font-bold text-[#183D2B] truncate">{user.displayName || user.email}</div><div className="text-[10px] text-[#7A746B] truncate">{user.email}</div><div className={`text-[10px] mt-1 ${recent ? 'text-green-700' : 'text-stone-500'}`}>{recent ? 'เข้าสู่ระบบภายใน 15 นาที' : `ล่าสุด ${formatMemberCreatedAt(user.lastLoginAt || user.createdAt)}`}</div></div></div>;
              })}
              {registeredUsers.length === 0 && <p className="text-xs text-[#7A746B]">ยังไม่มีบัญชีสมาชิกให้แสดง</p>}
            </div>
          </section>

          <section className="rounded-2xl border border-[#EEE7DA] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-bold text-[#183D2B]">กิจกรรมล่าสุดของเว็บไซต์</h3><button onClick={() => setActiveTab('logs')} className="text-xs text-[#A48545] underline">ดู Audit Logs ทั้งหมด</button></div>
            <div className="space-y-2">
              {auditLogs.slice(0,5).map((log) => <div key={log.logId} className="flex items-start gap-3 rounded-lg bg-[#FAF7F0] p-3"><span className="mt-1 w-2 h-2 rounded-full bg-[#C6A96B] shrink-0" /><div className="min-w-0 flex-1"><p className="text-xs font-semibold text-[#183D2B]">{log.summary}</p><p className="text-[10px] text-[#7A746B] mt-1">{log.actor} · {new Date(log.timestamp).toLocaleString('th-TH')}</p></div></div>)}
              {auditLogs.length === 0 && <p className="text-xs text-[#7A746B]">ยังไม่มีบันทึกกิจกรรมที่โหลดมาแสดง</p>}
            </div>
          </section>

          {showKnowledgeGraph && (() => {
            type GraphType = 'plants' | 'categories' | 'articles' | 'users' | 'contributors' | 'messages';
            type GraphNode = { id: string; type: GraphType; label: string; detail: string; color: string; meta?: string };
            type GraphEdge = { from: string; to: string; label: string };
            const nodes: GraphNode[] = [];
            const edges: GraphEdge[] = [];
            const plantLimit = activePlants.slice(0, 80);
            const articleLimit = articles.slice(0, 35);
            const userLimit = registeredUsers.filter((u) => u.role !== 'guest').slice(0, 35);
            const messageLimit = contactMessages.slice(0, 20);
            const creatorIds = new Map<string, string>();
            const addCreator = (name?: string, email?: string, uid?: string) => {
              const matchedUser = userLimit.find(u => (uid && u.uid === uid) || (email && u.email.toLowerCase() === email.toLowerCase()) || (name && u.displayName.toLowerCase() === name.toLowerCase()));
              if (matchedUser) return `user:${matchedUser.uid}`;
              const cleanName = (name || email || 'ไม่ระบุผู้ลงข้อมูล').trim();
              const key = (email || cleanName).toLowerCase();
              const id = creatorIds.get(key) || `creator:${key}`;
              if (!creatorIds.has(key)) {
                creatorIds.set(key, id);
                nodes.push({ id, type: 'contributors', label: cleanName.slice(0, 30), detail: `ผู้ลงข้อมูล: ${cleanName}${email ? `\nอีเมล: ${email}` : ''}${uid ? `\nUID: ${uid}` : ''}`, color: '#98783D', meta: email || 'Contributor' });
              }
              return id;
            };
            categories.forEach(c => nodes.push({ id: `category:${c.categoryId}`, type: 'categories', label: c.name, detail: `${c.name} (${c.prefix})\n${c.description || ''}`, color: '#477A59', meta: c.prefix }));
            plantLimit.forEach(p => {
              nodes.push({ id: `plant:${p.plantId}`, type: 'plants', label: p.thaiName, detail: `${p.thaiName} (${p.scientificName})\nรหัส: ${p.plantId}\nหมวด: ${p.categoryId}\nผู้ลงข้อมูล: ${p.createdByName || p.createdByEmail || 'ไม่ระบุ'}\nอีเมลผู้ลงข้อมูล: ${p.createdByEmail || 'ไม่ระบุ'}\nสถานะ: ${p.status}`, color: '#183D2B', meta: p.plantId });
              if (categories.some(c => c.categoryId === p.categoryId)) edges.push({ from: `plant:${p.plantId}`, to: `category:${p.categoryId}`, label: 'อยู่ในหมวด' });
              if (p.createdBy || p.createdByEmail || p.createdByName) edges.push({ from: `plant:${p.plantId}`, to: addCreator(p.createdByName, p.createdByEmail, p.createdBy), label: 'เพิ่มโดย' });
            });
            articleLimit.forEach(a => {
              nodes.push({ id: `article:${a.articleId}`, type: 'articles', label: a.title, detail: `${a.title}\nหมวดบทความ: ${a.category}\nผู้เขียน: ${a.author}\nสถานะ: ${a.status}${a.referenceUrl ? `\nอ้างอิง: ${a.referenceUrl}` : ''}`, color: '#A48545', meta: a.category });
              const authorId = addCreator(a.author);
              if (authorId) edges.push({ from: `article:${a.articleId}`, to: authorId, label: 'เขียนโดย' });
              const content = `${a.title} ${a.excerpt} ${a.content}`.toLowerCase();
              plantLimit.filter(p => content.includes(p.thaiName.toLowerCase()) || (p.scientificName && content.includes(p.scientificName.toLowerCase()))).slice(0, 4).forEach(p => edges.push({ from: `article:${a.articleId}`, to: `plant:${p.plantId}`, label: 'กล่าวถึง' }));
            });
            userLimit.forEach(u => nodes.push({ id: `user:${u.uid}`, type: 'users', label: u.displayName || u.email, detail: `${u.displayName || 'ไม่ระบุชื่อ'}\nอีเมล: ${u.email}\nบทบาท: ${u.role === 'admin' ? 'Admin' : 'Member'}\nสมัครเมื่อ: ${u.createdAt || 'ไม่ระบุ'}\nรายการโปรด: ${(u.favorites || []).length}`, color: u.role === 'admin' ? '#B68B37' : '#5797B9', meta: u.role }));
            userLimit.forEach(u => (u.favorites || []).forEach(pid => { if (plantLimit.some(p => p.plantId === pid)) edges.push({ from: `user:${u.uid}`, to: `plant:${pid}`, label: 'บันทึกโปรด' }); }));
            messageLimit.forEach(m => {
              nodes.push({ id: `message:${m.messageId}`, type: 'messages', label: (m.subject || m.name || 'ข้อความ').slice(0, 26), detail: `หัวข้อ: ${m.subject}\nผู้ส่ง: ${m.name}\nอีเมล: ${m.email}\nสถานะ: ${m.status}\nส่งเมื่อ: ${m.createdAt}`, color: '#8D6C83', meta: m.status });
              const sender = userLimit.find(u => u.email.toLowerCase() === m.email.toLowerCase());
              if (sender) edges.push({ from: `message:${m.messageId}`, to: `user:${sender.uid}`, label: 'ส่งโดยสมาชิก' });
            });
            const visibleNodes = nodes.filter(n => selectedGraphTypes.includes(n.type));
            const visibleIds = new Set(visibleNodes.map(n => n.id));
            const visibleEdges = edges.filter(e => visibleIds.has(e.from) && visibleIds.has(e.to));
            const clusterCenters: Record<GraphType, {x:number;y:number}> = { plants:{x:260,y:180}, categories:{x:500,y:150}, articles:{x:740,y:190}, users:{x:270,y:470}, contributors:{x:520,y:430}, messages:{x:770,y:470} };
            const typeIndexes: Record<string, number> = {};
            const basePositions = new Map(visibleNodes.map((n) => {
              const index = typeIndexes[n.type] || 0; typeIndexes[n.type] = index + 1;
              const center = clusterCenters[n.type]; const angle = index * 2.399963229728653;
              const radius = index === 0 ? 0 : 22 + Math.sqrt(index) * 19;
              return [n.id, { x: Math.max(45, Math.min(955, center.x + Math.cos(angle) * radius)), y: Math.max(45, Math.min(605, center.y + Math.sin(angle) * radius)) }];
            }));
            const positions = new Map(visibleNodes.map(n => { const base = basePositions.get(n.id)!; const offset = graphNodeOffsets[n.id] || {x:0,y:0}; return [n.id, {x:base.x+offset.x,y:base.y+offset.y}]; }));
            const selectedNode = visibleNodes.find(n => n.id === selectedGraphNodeId);
            const filterOptions: { id: GraphType; label: string }[] = [
              { id: 'plants', label: 'พรรณไม้' }, { id: 'categories', label: 'หมวดหมู่' }, { id: 'articles', label: 'บทความ' },
              { id: 'users', label: 'สมาชิก' }, { id: 'contributors', label: 'ผู้ลงข้อมูล/ผู้เขียน' }, { id: 'messages', label: 'ข้อความติดต่อ' },
            ];
            return <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#07170F]/70 backdrop-blur-sm p-2 sm:p-5" role="dialog" aria-modal="true" aria-label="Knowledge Graph">
              <div className="flex max-h-[96vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-[#C6A96B]/45 bg-[#FAF7F0] shadow-2xl">
                <div className="flex items-start justify-between gap-3 border-b border-[#E8DECA] bg-white/80 px-4 py-3 sm:px-6">
                  <div className="flex items-center gap-3"><img src="/mascot/04_tonkla_present_knowledge.png" alt="น้องต้นกล้านำเสนอความรู้" className="hidden sm:block h-14 w-14 object-contain"/><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#A48545]">SACRED CANOPY · BLOOM / KNOWLEDGE GRAPH</p><h3 className="mt-1 text-lg sm:text-xl font-bold text-[#183D2B]">กราฟความสัมพันธ์จากข้อมูลจริงในคลังเว็บไซต์</h3><p className="mt-1 text-[11px] text-[#7A746B]">เลือกชนิดข้อมูล แล้วคลิกโหนดเพื่อดูรายละเอียดและความสัมพันธ์ สำรวจโหนดและความสัมพันธ์แบบกราฟความรู้</p></div></div>
                  <button onClick={() => { setShowKnowledgeGraph(false); setSelectedGraphNodeId(null); }} aria-label="ปิดกราฟ" title="ปิดหน้าต่างกราฟ" className="shrink-0 rounded-full border border-[#E8DECA] bg-white p-2 text-[#183D2B] transition hover:bg-[#F3EFE5]"><X className="h-5 w-5"/></button>
                </div>
                <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)_260px]">
                  <aside className="border-b lg:border-b-0 lg:border-r border-[#E8DECA] p-3 sm:p-4">
                    <div className="text-xs font-bold text-[#183D2B]">เลือกข้อมูลที่ต้องการดู</div><div className="mt-3 space-y-2">{filterOptions.map(option => <label key={option.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#E8DECA] bg-white/70 px-2.5 py-2 text-[11px] text-[#49382C] hover:bg-white"><input type="checkbox" checked={selectedGraphTypes.includes(option.id)} onChange={e => { setSelectedGraphTypes(old => e.target.checked ? [...old, option.id] : old.filter(t => t !== option.id)); setSelectedGraphNodeId(null); }} className="accent-[#183D2B]"/><span>{option.label}</span></label>)}</div>
                    <div className="mt-4 rounded-xl bg-[#183D2B] p-3 text-[#FAF7F0]"><div className="text-[10px] text-[#DFC488]">โหนดที่แสดง</div><div className="mt-1 text-2xl font-bold tabular-nums">{visibleNodes.length}</div><div className="mt-1 text-[10px] text-white/65">เส้นความสัมพันธ์ {visibleEdges.length} เส้น</div></div>
                    <p className="mt-3 text-[10px] leading-relaxed text-[#7A746B]">หมายเหตุ: จำกัดการแสดงผลไว้ไม่เกิน 80 พรรณไม้, 35 บทความ, 35 สมาชิก และ 20 ข้อความ เพื่อให้กราฟอ่านง่าย</p>
                  </aside>
                  <div className="min-h-[300px] min-w-0 overflow-auto bg-[radial-gradient(circle_at_center,#FFFFFF_0%,#F5F1E8_100%)] p-2 sm:p-3"><div className="mb-2 flex items-center justify-end gap-2 text-xs"><button onClick={() => setGraphZoom(z => Math.max(.6, +(z-.15).toFixed(2)))} className="rounded-lg border bg-white px-2 py-1" aria-label="ซูมออก">−</button><input aria-label="ระดับซูมกราฟ" type="range" min="0.6" max="1.8" step="0.05" value={graphZoom} onChange={e => setGraphZoom(Number(e.target.value))}/><button onClick={() => setGraphZoom(z => Math.min(1.8, +(z+.15).toFixed(2)))} className="rounded-lg border bg-white px-2 py-1" aria-label="ซูมเข้า">+</button><button onClick={() => setGraphZoom(1)} className="rounded-lg border bg-white px-2 py-1">รีเซ็ต</button></div>
                    <svg viewBox="0 0 1000 650" className="h-full min-h-[380px] w-full rounded-xl touch-none" role="img" aria-label="กราฟโหนดและเส้นความสัมพันธ์ข้อมูลจริง" onPointerMove={e => { if (!graphDragId) return; const rect = e.currentTarget.getBoundingClientRect(); const screenX = ((e.clientX - rect.left) / rect.width) * 1000; const screenY = ((e.clientY - rect.top) / rect.height) * 650; const x = (screenX - (500 - 500 * graphZoom)) / graphZoom; const y = (screenY - (325 - 325 * graphZoom)) / graphZoom; const base = basePositions.get(graphDragId); if (base) setGraphNodeOffsets(old => ({...old, [graphDragId]: {x: x - base.x, y: y - base.y}})); }} onPointerUp={() => setGraphDragId(null)} onPointerCancel={() => setGraphDragId(null)} onPointerLeave={() => setGraphDragId(null)}>
                      <g transform={`translate(${500 - 500*graphZoom} ${325 - 325*graphZoom}) scale(${graphZoom})`}><defs><pattern id="kg-dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#D8D0BF" opacity=".55"/></pattern></defs><rect width="1000" height="650" fill="url(#kg-dots)"/>
                      {visibleEdges.map((edge, i) => { const a = positions.get(edge.from); const b = positions.get(edge.to); if (!a || !b) return null; return <g key={`${edge.from}-${edge.to}-${i}`}><line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#BBA36F" strokeWidth="1.5" opacity=".55"><title>{edge.label}</title></line></g>; })}
                      {visibleNodes.map(node => { const pos = positions.get(node.id)!; const isSelected = selectedGraphNodeId === node.id; const label = node.label.length > 19 ? `${node.label.slice(0, 18)}…` : node.label; return <g key={node.id} role="button" tabIndex={0} aria-label={`เลือก ${node.label}`} onClick={() => setSelectedGraphNodeId(node.id)} onPointerDown={e => { if (e.button !== 0) return; e.stopPropagation(); setSelectedGraphNodeId(node.id); setGraphDragId(node.id); (e.currentTarget as SVGGElement).setPointerCapture?.(e.pointerId); }} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setSelectedGraphNodeId(node.id); }} className="cursor-pointer"><circle cx={pos.x} cy={pos.y} r={isSelected ? 35 : 29} fill={node.color} opacity={isSelected ? 1 : .92} stroke={isSelected ? '#183D2B' : '#FFFFFF'} strokeWidth={isSelected ? 4 : 2}><title>{node.label} — {node.type}</title></circle><text x={pos.x} y={pos.y + 4} fill="white" fontSize="10" fontWeight="700" textAnchor="middle">{node.type === 'plants' ? '🌿' : node.type === 'categories' ? 'หมวด' : node.type === 'articles' ? 'บทความ' : node.type === 'users' ? 'สมาชิก' : node.type === 'contributors' ? 'ผู้เขียน' : 'ข้อความ'}</text><text x={pos.x} y={pos.y + 46} fill="#49382C" fontSize="11" fontWeight={isSelected ? '700' : '500'} textAnchor="middle">{label}</text></g>; })}
                      {visibleNodes.length === 0 && <text x="500" y="320" fill="#7A746B" fontSize="18" textAnchor="middle">เลือกชนิดข้อมูลอย่างน้อยหนึ่งรายการ</text>}</g>
                    </svg>
                  </div>
                  <aside className="overflow-y-auto border-t lg:border-t-0 lg:border-l border-[#E8DECA] bg-white/60 p-3 sm:p-4">
                    <div className="text-xs font-bold text-[#183D2B]">รายละเอียดโหนด</div>
                    {selectedNode ? <><div className="mt-3 rounded-xl border border-[#E8DECA] bg-white p-3"><span className="rounded-full px-2 py-1 text-[9px] font-bold uppercase" style={{ backgroundColor: `${selectedNode.color}18`, color: selectedNode.color }}>{filterOptions.find(o => o.id === selectedNode.type)?.label || selectedNode.type}</span><h4 className="mt-3 break-words text-sm font-bold text-[#183D2B]">{selectedNode.label}</h4><p className="mt-2 whitespace-pre-line break-words text-[11px] leading-relaxed text-[#5E594F]">{selectedNode.detail}</p></div><div className="mt-3 text-[11px] font-bold text-[#183D2B]">ความสัมพันธ์ที่พบ</div><div className="mt-2 space-y-2">{visibleEdges.filter(e => e.from === selectedNode.id || e.to === selectedNode.id).map((edge, i) => { const otherId = edge.from === selectedNode.id ? edge.to : edge.from; const other = visibleNodes.find(n => n.id === otherId); return <button key={`${edge.from}-${edge.to}-${i}`} onClick={() => other && setSelectedGraphNodeId(other.id)} className="w-full rounded-lg border border-[#E8DECA] bg-white px-2.5 py-2 text-left hover:border-[#C6A96B]"><span className="block text-[10px] text-[#A48545]">{edge.label}</span><span className="mt-0.5 block text-[11px] font-semibold text-[#183D2B]">{other?.label || otherId}</span></button>; })}{visibleEdges.filter(e => e.from === selectedNode.id || e.to === selectedNode.id).length === 0 && <p className="text-[10px] text-[#7A746B]">ยังไม่มีความสัมพันธ์ที่เชื่อมกับโหนดนี้ในข้อมูลที่เลือก</p>}</div></> : <div className="mt-3 rounded-xl border border-dashed border-[#D8CBAF] p-4 text-[11px] leading-relaxed text-[#7A746B]">คลิกโหนดในกราฟเพื่อดูข้อมูล เช่น รหัสพรรณไม้ หมวดหมู่ ผู้ลงข้อมูล อีเมลผู้เขียน และรายการที่เชื่อมโยง</div>}
                    <button onClick={() => { setShowKnowledgeGraph(false); setSelectedGraphNodeId(null); }} className="mt-4 w-full rounded-xl bg-[#183D2B] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#25523B]">ปิดหน้าต่างกราฟ</button>
                  </aside>
                </div>
              </div>
            </div>;
          })()}

          {/* Quick Import Action Banner */}
          <div className="p-6 rounded-2xl bg-[#FAF7F0] border border-[#C6A96B]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#183D2B] text-[#C6A96B] flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#183D2B]">
                  ต้องการนำเข้าพรรณไม้ชุดใหญ่ผ่านไฟล์ Excel / CSV หรือ JSON?
                </h3>
                <p className="text-xs text-[#7A746B] mt-0.5">
                  ระบบรองรับการนำเข้าไฟล์ตารางพร้อมการจับคู่คอลัมน์อัตโนมัติและตรวจสอบความถูกต้องก่อนบันทึก
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('import')}
              className="px-5 py-2.5 bg-[#183D2B] text-white rounded-xl text-xs font-bold hover:bg-[#25523B] transition-colors shrink-0"
            >
              เปิดศูนย์นำเข้าไฟล์
            </button>
          </div>
        </div>
      )}

      {/* 2. Plant Management Tab (with Bulk Actions & Trash) */}
      {activeTab === 'plants' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#C6A96B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={plantSearch}
                onChange={(e) => setPlantSearch(e.target.value)}
                placeholder="ค้นหาชื่อ หรือรหัสพรรณไม้..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#EEE7DA] text-xs focus:outline-none focus:border-[#C6A96B]"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Bulk Action Buttons if items selected */}
              {selectedPlantIds.length > 0 && (
                <div className="flex items-center gap-2 bg-[#FAF7F0] p-1.5 rounded-xl border border-[#C6A96B]/40 text-xs">
                  <span className="font-bold text-[#183D2B] px-1">เลือก {selectedPlantIds.length} รายการ:</span>
                  {showTrash ? (
                    <button
                      onClick={handleBulkRestore}
                      className="px-2.5 py-1 bg-[#2E7D32] text-white rounded-lg font-semibold hover:bg-[#1B5E20]"
                    >
                      กู้คืนที่เลือก
                    </button>
                  ) : (
                    <button
                      onClick={handleBulkSoftDelete}
                      className="px-2.5 py-1 bg-[#C62828] text-white rounded-lg font-semibold hover:bg-[#B71C1C]"
                    >
                      ลบที่เลือก
                    </button>
                  )}
                </div>
              )}

              <button
                onClick={handleOpenAddForm}
                className="px-4 py-2 bg-[#183D2B] hover:bg-[#25523B] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4 text-[#C6A96B]" />
                <span>เพิ่มพรรณไม้</span>
              </button>

              <button
                onClick={() => {
                  setShowTrash(!showTrash);
                  setSelectedPlantIds([]);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 border ${
                  showTrash
                    ? 'bg-[#C62828] text-white border-[#C62828]'
                    : 'bg-white text-[#7A746B] border-[#EEE7DA] hover:text-[#183D2B]'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ถังขยะ ({deletedPlants.length})</span>
              </button>
            </div>
          </div>

          {/* Plant Admin Table */}
          <div className="bg-white rounded-2xl border border-[#EEE7DA] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F0] text-[#7A746B] border-b border-[#EEE7DA]">
                  <tr>
                    <th className="p-3.5 w-10">
                      <button onClick={handleSelectAllPlants} className="text-[#183D2B]">
                        {selectedPlantIds.length > 0 && selectedPlantIds.length === displayedPlants.length ? (
                          <CheckSquare className="w-4 h-4 text-[#183D2B]" />
                        ) : (
                          <Square className="w-4 h-4 text-[#7A746B]" />
                        )}
                      </button>
                    </th>
                    <th className="p-3.5 font-bold">รหัส</th>
                    <th className="p-3.5 font-bold">รูปภาพ</th>
                    <th className="p-3.5 font-bold">ชื่อไทย</th>
                    <th className="p-3.5 font-bold">ชื่อวิทยาศาสตร์</th>
                    <th className="p-3.5 font-bold">หมวด</th>
                    <th className="p-3.5 font-bold">ความปลอดภัยสัตว์</th>
                    <th className="p-3.5 font-bold text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEE7DA]">
                  {displayedPlants.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-[#7A746B]">
                        ไม่พบพรรณไม้ในรายการนี้
                      </td>
                    </tr>
                  ) : (
                    displayedPlants.map((plant) => {
                      const isChecked = selectedPlantIds.includes(plant.plantId);
                      return (
                        <tr key={plant.plantId} className={`hover:bg-[#FAF7F0]/50 transition-colors ${isChecked ? 'bg-[#FAF7F0]/80' : ''}`}>
                          <td className="p-3.5">
                            <button onClick={() => handleToggleSelectPlant(plant.plantId)}>
                              {isChecked ? (
                                <CheckSquare className="w-4 h-4 text-[#183D2B]" />
                              ) : (
                                <Square className="w-4 h-4 text-[#7A746B]" />
                              )}
                            </button>
                          </td>
                          <td className="p-3.5 font-mono font-bold text-[#A48545]">{plant.plantId}</td>
                          <td className="p-3.5">
                            <img
                              src={plant.images[0]}
                              alt={plant.thaiName}
                              className="w-10 h-10 rounded object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/botanical_ratchaphruek_1791992174219.jpg';
                              }}
                            />
                          </td>
                          <td className="p-3.5 font-bold text-[#183D2B]">{plant.thaiName}</td>
                          <td className="p-3.5 italic text-[#7A746B]">{plant.scientificName}</td>
                          <td className="p-3.5 text-[#49382C]">
                            {categories.find((c) => c.categoryId === plant.categoryId)?.name || plant.categoryId}
                          </td>
                          <td className="p-3.5">
                            <span className={`text-[11px] font-medium ${
                              plant.safety.toxicityPets === 'ปลอดภัยต่อสุนัขและแมว' ? 'text-[#2E7D32]' : 'text-[#E65100]'
                            }`}>
                              {plant.safety.toxicityPets}
                            </span>
                          </td>
                          <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                            {showTrash ? (
                              <>
                                <button
                                  onClick={() => store.restorePlant(plant.plantId)}
                                  className="px-2.5 py-1 bg-[#2E7D32] text-white rounded text-[11px] hover:bg-[#1B5E20]"
                                >
                                  กู้คืน
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`คุณต้องการลบ ${plant.thaiName} ถาวรใช่หรือไม่?`)) {
                                      store.permanentDeletePlant(plant.plantId);
                                    }
                                  }}
                                  className="px-2.5 py-1 bg-[#C62828] text-white rounded text-[11px] hover:bg-[#B71C1C]"
                                >
                                  ลบถาวร
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => onSelectPlant(plant)}
                                  className="p-1.5 text-[#7A746B] hover:text-[#183D2B]"
                                  title="ดูตัวอย่าง"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingPlant({ ...plant });
                                    setIsCreatingNew(false);
                                    setFormTab('general');
                                  }}
                                  className="p-1.5 text-[#A48545] hover:text-[#183D2B]"
                                  title="แก้ไขข้อมูล"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => store.softDeletePlant(plant.plantId)}
                                  className="p-1.5 text-[#C62828] hover:text-[#B71C1C]"
                                  title="ย้ายลงถังขยะ"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. Dedicated File Import Center (CSV / JSON) */}
      {activeTab === 'import' && (
        <div className="bg-white rounded-2xl border border-[#EEE7DA] p-6 sm:p-8 space-y-6 shadow-sm animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EEE7DA] pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#183D2B] flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#C6A96B]" />
                <span>ศูนย์นำเข้าไฟล์ข้อมูลเข้าสู่เว็บไซต์ (File Import Center)</span>
              </h2>
              <p className="text-xs text-[#7A746B] mt-0.5">
                รองรับการนำเข้าไฟล์ตาราง CSV (Excel) และ JSON สำหรับการอัปเดตหรือเพิ่มข้อมูลไม้มงคลจำนวนมาก
              </p>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="px-4 py-2 bg-[#FAF7F0] border border-[#C6A96B] hover:bg-[#EEE7DA] text-[#183D2B] rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shrink-0"
            >
              <FileDown className="w-4 h-4 text-[#A48545]" />
              <span>ดาวน์โหลดเทมเพลต CSV</span>
            </button>
          </div>

          {/* Import Category Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 rounded-2xl border border-[#D8C7A1] bg-[#FAF7F0] p-5">
            <div className="space-y-2">
              <label htmlFor="import-category" className="block text-sm font-bold text-[#183D2B]">
                หมวดหมู่ต้นไม้สำหรับไฟล์นี้
              </label>
              <select
                id="import-category"
                value={selectedImportCategoryId}
                onChange={(e) => setSelectedImportCategoryId(e.target.value)}
                className="w-full rounded-xl border border-[#D8C7A1] bg-white px-4 py-3 text-sm text-[#183D2B] outline-none focus:ring-2 focus:ring-[#C6A96B]"
              >
                <option value="cat-A">A — ไม้ยืนต้น</option>
                <option value="cat-B">B — ไม้พุ่ม</option>
                <option value="cat-C">C — ไม้ล้มลุก</option>
                <option value="cat-D">D — ไม้เลื้อย</option>
                <option value="cat-E">E — ไม้คลุมดิน</option>
                <option value="cat-F">F — ปาล์ม</option>
                <option value="cat-G">G — ไม้อวบน้ำ</option>
                <option value="cat-H">H — ไม้ไผ่</option>
              </select>
              <p className="text-xs leading-relaxed text-[#7A746B]">
                เลือกหมวดก่อนนำเข้า ระบบจะกำหนดหมวดให้ข้อมูลทุกแถวในไฟล์ตามตัวเลือกนี้
              </p>
            </div>
            <div className="flex flex-col justify-center gap-2">
              <label className="flex items-start gap-3 rounded-xl border border-[#EEE7DA] bg-white p-4 text-sm text-[#49382C]">
                <input
                  type="checkbox"
                  checked={forceImportCategory}
                  onChange={(e) => setForceImportCategory(e.target.checked)}
                  className="mt-1 accent-[#183D2B]"
                />
                <span>
                  <span className="block font-bold text-[#183D2B]">บังคับใช้หมวดที่เลือกกับทุกแถว</span>
                  <span className="mt-1 block text-xs leading-relaxed text-[#7A746B]">
                    เปิดไว้: ใช้หมวดที่เลือกและสร้างรหัสตาม Prefix ของหมวดนั้น หากปิด ระบบจะใช้หมวดที่ระบุในไฟล์เป็นหลัก
                  </span>
                </span>
              </label>
              {selectedImportFileName && (
                <p className="text-xs text-[#49382C]">
                  ไฟล์ล่าสุด: <strong>{selectedImportFileName}</strong>
                </p>
              )}
            </div>
          </div>

          {/* Import Dropzone Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-2 border-dashed border-[#C6A96B]/50 rounded-2xl p-8 text-center space-y-4 hover:border-[#183D2B] transition-colors bg-[#FAF7F0]/30">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#183D2B]/10 flex items-center justify-center text-[#183D2B]">
                <FileSpreadsheet className="w-8 h-8 text-[#C6A96B]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#183D2B]">
                  เลือกไฟล์ CSV หรือ JSON จากเครื่องของคุณ
                </h3>
                <p className="text-xs text-[#7A746B]">
                  รองรับไฟล์ .csv (ตารางพรรณไม้) และ .json (โครงสร้างข้อมูลมาตรฐาน)
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2.5 bg-[#183D2B] text-white rounded-xl text-xs font-bold hover:bg-[#25523B] transition-colors shadow-sm"
              >
                เลือกไฟล์เพื่อนำเข้า
              </button>
            </div>

            {/* Instruction Guidelines */}
            <div className="bg-[#FAF7F0] p-6 rounded-2xl border border-[#EEE7DA] space-y-3 text-xs text-[#49382C]">
              <h4 className="font-bold text-[#183D2B]">ข้อกำหนดและโครงสร้างคอลัมน์ของไฟล์ CSV:</h4>
              <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
                <li><strong>ชื่อไทย</strong> และ <strong>ชื่อวิทยาศาสตร์</strong>: จำเป็นต้องมีข้อมูล</li>
                <li><strong>หมวดหมู่</strong>: เลือกหมวดของไฟล์ได้จากช่อง “หมวดหมู่ต้นไม้สำหรับไฟล์นี้” ก่อนนำเข้า หรือใช้หมวดที่ระบุในไฟล์เมื่อปิดตัวเลือกบังคับหมวด</li>
                <li><strong>รหัสพรรณไม้</strong>: หากเว้นว่าง ระบบจะสร้างรหัสถัดไปให้อัตโนมัติ (เช่น A05, B04)</li>
                <li><strong>ความปลอดภัยสัตว์เลี้ยง</strong>: ระบุ "ปลอดภัยต่อสุนัขและแมว" หรือ "เป็นพิษต่อสุนัขและแมว"</li>
                <li>ไฟล์ CSV ควรบันทึกด้วยการเข้ารหัส <strong>UTF-8</strong> เพื่อให้อ่านภาษาไทยได้อย่างถูกต้อง</li>
              </ul>
            </div>
          </div>

          {/* Import Result Feedback */}
          {importStatus && (
            <div className={`p-4 rounded-xl border text-xs space-y-2 ${
              importStatus.success ? 'bg-[#E8F5E9] border-[#C8E6C9] text-[#2E7D32]' : 'bg-[#FFEBEE] border-[#FFCDD2] text-[#C62828]'
            }`}>
              <div className="flex items-center gap-2 font-bold text-sm">
                {importStatus.success ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <span>
                  {importStatus.success
                    ? `นำเข้าข้อมูลสำเร็จจำนวน ${importStatus.importedCount} รายการ!`
                    : 'การนำเข้าข้อมูลล้มเหลว'}
                </span>
              </div>
              {importStatus.errors.length > 0 && (
                <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                  {importStatus.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. Categories Management */}
      {activeTab === 'categories' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-[#183D2B] to-[#28543D] p-5 text-white shadow-md">
            <div><h3 className="text-base font-bold">หมวดหมู่พรรณไม้มาตรฐาน 8 หมวด</h3><p className="mt-1 text-xs text-[#D5E2D2]">แก้ชื่อ คำอธิบาย และภาพได้ โดยคงรหัสหมวดเดิมไว้</p></div>
            <button onClick={() => setEditingCategory({ categoryId: `cat-${Date.now()}`, prefix: 'A', name: '', englishName: '', description: '', image: '', sortOrder: categories.length + 1 })} className="rounded-xl bg-[#C6A96B] px-3 py-2 text-xs font-bold text-[#183D2B]">+ เพิ่มหมวดหมู่</button>
          </div>
          {editingCategory && <form onSubmit={(e) => { e.preventDefault(); if (!editingCategory.name.trim()) return; const exists = categories.some((c) => c.categoryId === editingCategory.categoryId); if (exists) store.updateCategory(editingCategory.categoryId, editingCategory); else store.addCategory(editingCategory); setEditingCategory(null); }} className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-2xl border border-[#C6A96B]/40 bg-white p-5 shadow-sm">
            <label className="text-xs font-semibold">ชื่อหมวดหมู่<input required value={editingCategory.name} onChange={(e) => setEditingCategory({...editingCategory, name:e.target.value})} className="mt-1 w-full rounded-lg border p-2.5"/></label>
            <label className="text-xs font-semibold">ชื่อภาษาอังกฤษ<input value={editingCategory.englishName} onChange={(e) => setEditingCategory({...editingCategory, englishName:e.target.value})} className="mt-1 w-full rounded-lg border p-2.5"/></label>
            <label className="text-xs font-semibold">รหัสนำหน้า (A-H)<select disabled={categories.some(c=>c.categoryId===editingCategory.categoryId)} value={editingCategory.prefix} onChange={(e) => setEditingCategory({...editingCategory, prefix:e.target.value as Category['prefix'], categoryId:`cat-${e.target.value}`})} className="mt-1 w-full rounded-lg border p-2.5">{'ABCDEFGH'.split('').map(x=><option key={x}>{x}</option>)}</select></label>
            <label className="text-xs font-semibold">URL ภาพหมวดหมู่<input value={editingCategory.image} onChange={(e) => setEditingCategory({...editingCategory, image:e.target.value})} placeholder="https://... หรือ /images/..." className="mt-1 w-full rounded-lg border p-2.5"/></label>
            <label className="text-xs font-semibold md:col-span-2">หรืออัปโหลดภาพ<input type="file" accept="image/*" onChange={(e) => { const file=e.target.files?.[0]; if(!file)return; if(file.size>400*1024){alert('ภาพต้องไม่เกิน 400 KB');return;} const reader=new FileReader(); reader.onload=()=>setEditingCategory({...editingCategory,image:String(reader.result||'')}); reader.readAsDataURL(file); }} className="mt-1 block w-full text-xs"/></label>
            <label className="text-xs font-semibold md:col-span-2">คำอธิบาย<textarea value={editingCategory.description} onChange={(e) => setEditingCategory({...editingCategory, description:e.target.value})} className="mt-1 w-full rounded-lg border p-2.5" rows={3}/></label>
            {editingCategory.image && <img src={editingCategory.image} alt="ตัวอย่างภาพหมวดหมู่" className="h-28 w-40 rounded-xl border object-cover"/>}
            <div className="md:col-span-2 flex gap-2"><button className="rounded-lg bg-[#183D2B] px-4 py-2 text-xs font-bold text-white">บันทึกหมวดหมู่</button><button type="button" onClick={()=>setEditingCategory(null)} className="rounded-lg border px-4 py-2 text-xs">ยกเลิก</button></div>
          </form>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((c) => (
              <div key={c.categoryId} className="bg-white p-5 rounded-xl border border-[#EEE7DA] shadow-sm flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#FAF7F0] border border-[#C6A96B]/30 flex items-center justify-center font-mono font-bold text-base text-[#A48545] shrink-0">
                  {c.prefix}
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#183D2B]">{c.name} ({c.englishName})</h4>
                    <span className="text-[10px] bg-[#FAF7F0] px-2 py-0.5 rounded font-mono text-[#7A746B]">
                      {c.plantCount ?? 0} พรรณไม้
                    </span>
                  </div>
                  <p className="text-xs text-[#7A746B] line-clamp-2">{c.description}</p>
                  <div className="mt-3 flex items-center gap-2">{c.image && <img src={c.image} alt={c.name} className="h-14 w-20 rounded-lg object-cover border" onError={(e)=>(e.currentTarget.style.display='none')}/>}<button onClick={() => setEditingCategory({...c})} className="rounded-lg border border-[#C6A96B]/50 px-3 py-1.5 text-[11px] font-semibold text-[#183D2B]">แก้ไขหมวดหมู่ / ภาพ</button><button onClick={() => { if (window.confirm(`ลบหมวด ${c.name} หรือไม่? แนะนำให้แก้ไขแทนเพื่อคงหมวดมาตรฐาน 8 หมวด`)) store.deleteCategory(c.categoryId); }} className="rounded-lg border border-red-200 px-2 py-1.5 text-[11px] text-red-600">ลบ</button></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Articles Management */}
      {activeTab === 'articles' && (
        <div className="space-y-5 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#183D2B]">คลังบทความและวิชาการ ({articles.length} เรื่อง)</h3>
              <p className="text-xs text-[#7A746B] mt-1">เพิ่ม แก้ไข ดู ลบ และนำเข้าบทความ JSON/CSV พร้อม URL อ้างอิงจากเว็บไซต์ภายนอก</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <label className="px-3 py-2 rounded-lg border border-[#EEE7DA] bg-white text-xs font-semibold cursor-pointer hover:bg-[#FAF7F0]">
                <Upload className="w-4 h-4 inline mr-1" />นำเข้า JSON/CSV
                <input type="file" accept=".json,.csv,application/json,text/csv" className="hidden" onChange={(e) => { void handleImportArticles(e.target.files?.[0]); e.currentTarget.value = ''; }} />
              </label>
              <button onClick={() => setEditingArticle({ articleId: `article-${Date.now()}`, title: '', slug: '', excerpt: '', content: '', coverImage: '', category: 'เกร็ดความรู้', author: currentUser.displayName, readTime: '5 นาที', publishedAt: new Date().toISOString().slice(0,10), status: 'draft', referenceUrl: '' })} className="px-4 py-2 bg-[#183D2B] text-white rounded-lg text-xs font-bold"><Plus className="w-4 h-4 inline mr-1" />เพิ่มบทความ</button>
            </div>
          </div>
          {articleImportFeedback && <p className="text-xs rounded-lg bg-[#F1F8EE] text-[#27632A] border border-[#D7E8D2] p-3">{articleImportFeedback}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {articles.map((art) => (
              <div key={art.articleId} className="bg-white p-4 rounded-xl border border-[#EEE7DA] shadow-sm space-y-2 flex flex-col">
                <div className="aspect-[16/9] rounded-lg overflow-hidden bg-[#F3EFE5]">
                  {art.coverImage ? <img src={art.coverImage} alt={art.title} className="w-full h-full object-cover" /> : <div className="h-full flex items-center justify-center text-4xl">🌿</div>}
                </div>
                <span className="text-[11px] text-[#A48545] font-semibold">{art.category} · {art.status === 'published' ? 'เผยแพร่' : 'ฉบับร่าง'}</span>
                <h4 className="text-sm font-bold text-[#183D2B]">{art.title}</h4>
                <p className="text-xs text-[#7A746B] line-clamp-3">{art.excerpt}</p>
                <div className="text-[10px] text-[#7A746B]">{art.author} · {art.publishedAt}</div>
                {art.referenceUrl && <a className="text-xs text-blue-700 underline break-all" href={art.referenceUrl} target="_blank" rel="noreferrer">เปิดแหล่งอ้างอิง ↗</a>}
                <div className="flex gap-2 mt-auto pt-2">
                  <button onClick={() => setEditingArticle({ ...art })} className="px-3 py-1.5 rounded-lg border border-[#EEE7DA] text-xs font-semibold"><Edit3 className="w-3.5 h-3.5 inline mr-1" />แก้ไข/ดู</button>
                  <button onClick={() => { if (window.confirm(`ลบบทความ “${art.title}” หรือไม่?`)) store.deleteArticle(art.articleId); }} className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-semibold"><Trash2 className="w-3.5 h-3.5 inline mr-1" />ลบ</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. FAQ + maintenance announcements */}
      {activeTab === 'faqs' && (
        <div className="space-y-8 animate-in fade-in">
          <section className="rounded-2xl border border-[#C6A96B]/40 bg-white p-5 sm:p-6 space-y-3"><h3 className="text-sm font-bold text-[#183D2B]">ประกาศเว็บไซต์และแจ้งปรับปรุงระบบ</h3><p className="text-xs leading-relaxed text-[#7A746B]">ย้ายการจัดการประกาศไปไว้ในเมนู <strong>ประกาศและกิจกรรม</strong> แล้ว เพื่อให้จัดการประกาศได้จากที่เดียว และเลือกช่องทางแสดงผลได้เป็นรายรายการ โดยข้อมูลประกาศเดิมยังเก็บไว้ในระบบ</p><button onClick={() => setActiveTab('activities')} className="rounded-lg bg-[#183D2B] px-4 py-2 text-xs font-bold text-white">ไปที่ประกาศและกิจกรรม</button></section>
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-bold text-[#183D2B]">คำถามและคำตอบที่พบบ่อย ({faqs.length} ข้อ)</div>
              <button onClick={() => setEditingFaq({ faqId: `faq-${Date.now()}`, question: '', answer: '', category: 'ทั่วไป', sortOrder: faqs.length + 1 })} className="px-3 py-2 rounded-lg bg-[#183D2B] text-white text-xs font-bold"><Plus className="w-4 h-4 inline mr-1" />เพิ่ม FAQ</button>
            </div>
            <div className="space-y-3">
              {faqs.map((faq) => (
                <div key={faq.faqId} className="bg-white p-4 rounded-xl border border-[#EEE7DA] shadow-sm space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#183D2B]">{faq.question}</span>
                    <span className="text-[10px] text-[#A48545] bg-[#FAF7F0] px-2 py-0.5 rounded">{faq.category}</span>
                  </div>
                  <p className="text-xs text-[#7A746B] leading-relaxed whitespace-pre-wrap">{faq.answer}</p>
                  <div className="flex gap-2"><button onClick={() => setEditingFaq({ ...faq })} className="px-3 py-1.5 rounded-lg border border-[#EEE7DA] text-xs font-semibold"><Edit3 className="w-3.5 h-3.5 inline mr-1" />แก้ไข</button><button onClick={() => { if (window.confirm('ลบ FAQ นี้หรือไม่?')) store.deleteFaq(faq.faqId); }} className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-semibold"><Trash2 className="w-3.5 h-3.5 inline mr-1" />ลบ</button></div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* 7. Site activities and event banners */}
      {activeTab === 'activities' && (
        <div className="space-y-5 animate-in fade-in">
          <section className="rounded-2xl border border-[#C6A96B]/40 bg-white p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-sm font-bold text-[#183D2B]">ประกาศเว็บไซต์ / แจ้งปรับปรุงระบบ</h3><p className="mt-1 text-xs text-[#7A746B]">ประกาศระบบเดิมยังใช้งานต่อได้ และกำหนดช่องทางแสดงผลได้จากที่นี่</p></div><button onClick={() => { if (!showAnnouncementForm && !maintenanceNotice.title && !maintenanceNotice.message) setMaintenanceNotice(v => ({ ...v, enabled: true })); setShowAnnouncementForm(v => !v); }} className="rounded-lg bg-[#183D2B] px-3 py-2 text-xs font-bold text-white">{showAnnouncementForm ? 'ปิดฟอร์ม' : 'แก้ไขประกาศระบบ'}</button></div>
            {maintenanceNotice.enabled && <div className="text-xs text-[#A48545]">ประกาศเปิดใช้งาน: {maintenanceNotice.title || 'ยังไม่มีหัวข้อ'}</div>}
            {showAnnouncementForm && <div className="grid grid-cols-1 gap-3 md:grid-cols-2"><label className="text-xs font-semibold">หัวข้อ<input value={maintenanceNotice.title} onChange={e => setMaintenanceNotice({ ...maintenanceNotice, title: e.target.value })} className="mt-1 w-full rounded-lg border border-[#EEE7DA] p-2 font-normal"/></label><label className="text-xs font-semibold">ประเภท<select value={maintenanceNotice.status} onChange={e => setMaintenanceNotice({ ...maintenanceNotice, status: e.target.value as 'normal'|'maintenance' })} className="mt-1 w-full rounded-lg border border-[#EEE7DA] p-2 font-normal"><option value="normal">ประกาศทั่วไป</option><option value="maintenance">แจ้งปรับปรุงระบบ</option></select></label><label className="text-xs font-semibold">เริ่มแสดง<input type="datetime-local" value={maintenanceNotice.startAt} onChange={e => setMaintenanceNotice({ ...maintenanceNotice, startAt: e.target.value })} className="mt-1 w-full rounded-lg border border-[#EEE7DA] p-2 font-normal"/></label><label className="text-xs font-semibold">สิ้นสุด<input type="datetime-local" value={maintenanceNotice.endAt} onChange={e => setMaintenanceNotice({ ...maintenanceNotice, endAt: e.target.value })} className="mt-1 w-full rounded-lg border border-[#EEE7DA] p-2 font-normal"/></label><label className="md:col-span-2 text-xs font-semibold">รายละเอียด<textarea rows={3} value={maintenanceNotice.message} onChange={e => setMaintenanceNotice({ ...maintenanceNotice, message: e.target.value })} className="mt-1 w-full rounded-lg border border-[#EEE7DA] p-2 font-normal"/></label><label className="md:col-span-2 text-xs font-semibold">ลิงก์ภาพประกอบ / แบนเนอร์ (ไม่บังคับ)<input type="url" value={maintenanceNotice.imageUrl || ''} onChange={e => setMaintenanceNotice({ ...maintenanceNotice, imageUrl: e.target.value })} placeholder="https://..." className="mt-1 w-full rounded-lg border border-[#EEE7DA] p-2 font-normal"/></label><div className="md:col-span-2 flex flex-wrap gap-4 text-xs"><label className="flex items-center gap-2"><input type="checkbox" checked={maintenanceNotice.enabled} onChange={e => setMaintenanceNotice({ ...maintenanceNotice, enabled: e.target.checked })}/>เปิดใช้งาน</label><label className="flex items-center gap-2"><input type="checkbox" checked={maintenanceNotice.showInBell !== false} onChange={e => setMaintenanceNotice({ ...maintenanceNotice, showInBell: e.target.checked })}/>กระดิ่ง</label><label className="flex items-center gap-2"><input type="checkbox" checked={maintenanceNotice.showInHelp !== false} onChange={e => setMaintenanceNotice({ ...maintenanceNotice, showInHelp: e.target.checked })}/>หน้าช่วยเหลือ</label><label className="flex items-center gap-2"><input type="checkbox" checked={maintenanceNotice.showInBanner !== false} onChange={e => setMaintenanceNotice({ ...maintenanceNotice, showInBanner: e.target.checked })}/>แบนเนอร์โฮม</label></div><div className="md:col-span-2 flex gap-2"><button onClick={() => void saveMaintenanceNotice()} className="rounded-lg bg-[#183D2B] px-4 py-2 text-xs font-bold text-white">บันทึกประกาศระบบ</button><button onClick={() => { const cleared = { enabled: false, title: '', message: '', startAt: '', endAt: '', imageUrl: '', status: 'normal' as const, showInBell: true, showInHelp: true, showInBanner: true }; setMaintenanceNotice(cleared); void setDoc(doc(db, 'siteSettings', 'maintenanceNotice'), { ...cleared, updatedAt: serverTimestamp(), updatedBy: currentUser.uid }).then(() => setMaintenanceFeedback('ปิดประกาศแล้ว')).catch(() => setMaintenanceFeedback('ปิดประกาศไม่สำเร็จ โปรดตรวจสอบสิทธิ์')); }} className="rounded-lg border border-red-200 px-4 py-2 text-xs text-red-700">ปิดประกาศ</button></div></div>}{maintenanceFeedback && <p role="status" className="text-xs text-[#A48545]">{maintenanceFeedback}</p>}
          </section>
          <section className="rounded-2xl border border-[#E9E0CF] bg-white p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h3 className="text-base font-bold text-[#183D2B]">ประกาศกิจกรรมและแบนเนอร์หน้าแรก</h3><p className="mt-1 text-xs text-[#7A746B]">กิจกรรมที่เปิดใช้งานและอยู่ในช่วงเวลาจะแสดงบนหน้า Home พร้อมแจ้งเตือนผ่านกระดิ่ง</p></div>
              <button onClick={() => { setEditingActivity({ title: '', message: '', startAt: '', endAt: '', imageUrl: '', enabled: true, showInBell: true, showInHelp: true, showInBanner: true, kind: 'activity' }); setActivityFeedback(''); }} className="rounded-xl bg-[#183D2B] px-4 py-2 text-xs font-bold text-white"><Plus className="mr-1 inline h-4 w-4"/> เพิ่มกิจกรรม</button>
            </div>
            {editingActivity && <div className="grid grid-cols-1 gap-3 rounded-xl border border-[#E9E0CF] bg-[#FAF7F0] p-4 md:grid-cols-2">
              <label className="text-xs font-semibold">ชื่อกิจกรรม *<input value={editingActivity.title || ''} onChange={(e) => setEditingActivity({ ...editingActivity, title: e.target.value })} className="mt-1 w-full rounded-lg border border-[#E5DCCB] bg-white p-2.5 text-sm"/></label>
              <label className="text-xs font-semibold">ประเภท<select value={editingActivity.kind || 'activity'} onChange={(e) => setEditingActivity({ ...editingActivity, kind: e.target.value })} className="mt-1 w-full rounded-lg border border-[#E5DCCB] bg-white p-2.5 text-sm"><option value="activity">กิจกรรม</option><option value="maintenance">แจ้งปรับปรุงระบบ</option><option value="new-plants">พรรณไม้ใหม่</option><option value="news">ข่าวเว็บไซต์</option></select></label>
              <label className="text-xs font-semibold">เริ่มแสดง<input type="datetime-local" value={editingActivity.startAt || ''} onChange={(e) => setEditingActivity({ ...editingActivity, startAt: e.target.value })} className="mt-1 w-full rounded-lg border border-[#E5DCCB] bg-white p-2.5 text-sm"/></label>
              <label className="text-xs font-semibold">สิ้นสุด<input type="datetime-local" value={editingActivity.endAt || ''} onChange={(e) => setEditingActivity({ ...editingActivity, endAt: e.target.value })} className="mt-1 w-full rounded-lg border border-[#E5DCCB] bg-white p-2.5 text-sm"/></label>
              <label className="md:col-span-2 text-xs font-semibold">ลิงก์ภาพแบนเนอร์ (ไม่บังคับ)<input value={editingActivity.imageUrl || ''} onChange={(e) => setEditingActivity({ ...editingActivity, imageUrl: e.target.value })} placeholder="https://..." className="mt-1 w-full rounded-lg border border-[#E5DCCB] bg-white p-2.5 text-sm"/></label>
              <label className="md:col-span-2 text-xs font-semibold">หรืออัปโหลดภาพแบนเนอร์ (ไม่เกิน 250 KB)<input type="file" accept="image/*" className="mt-1 block w-full text-xs" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; if (file.size > 250 * 1024) { setActivityFeedback('ภาพต้องมีขนาดไม่เกิน 250 KB หรือใช้ลิงก์ภาพแทน'); e.currentTarget.value = ''; return; } const reader = new FileReader(); reader.onload = () => setEditingActivity((prev: any) => ({ ...prev, imageUrl: String(reader.result || '') })); reader.readAsDataURL(file); }}/></label>
              <label className="md:col-span-2 text-xs font-semibold">รายละเอียดกิจกรรม *<textarea rows={3} value={editingActivity.message || ''} onChange={(e) => setEditingActivity({ ...editingActivity, message: e.target.value })} className="mt-1 w-full rounded-lg border border-[#E5DCCB] bg-white p-2.5 text-sm"/></label>
              <div className="md:col-span-2 rounded-xl border border-[#E5DCCB] bg-white p-3 space-y-3"><label className="flex items-center gap-2 text-xs font-semibold"><input type="checkbox" checked={Boolean(editingActivity.enabled)} onChange={(e) => setEditingActivity({ ...editingActivity, enabled: e.target.checked })}/>เปิดใช้งานประกาศ</label><p className="text-[11px] text-[#7A746B]">เลือกช่องทางที่ต้องการแสดงได้อิสระ</p><div className="flex flex-wrap gap-x-5 gap-y-2"><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={editingActivity.showInBell !== false} onChange={(e) => setEditingActivity({ ...editingActivity, showInBell: e.target.checked })}/>แจ้งเตือนในกระดิ่ง</label><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={editingActivity.showInHelp !== false} onChange={(e) => setEditingActivity({ ...editingActivity, showInHelp: e.target.checked })}/>แสดงในหน้าช่วยเหลือ</label><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={editingActivity.showInBanner !== false} onChange={(e) => setEditingActivity({ ...editingActivity, showInBanner: e.target.checked })}/>แสดงเป็นแบนเนอร์หน้าโฮม</label></div></div>
              <div className="md:col-span-2 flex flex-wrap gap-2"><button onClick={() => void saveActivity()} className="rounded-lg bg-[#183D2B] px-4 py-2 text-xs font-bold text-white">บันทึกกิจกรรม</button><button onClick={() => setEditingActivity(null)} className="rounded-lg border border-[#D9D0C0] px-4 py-2 text-xs">ยกเลิก</button></div>
            </div>}
            {activityFeedback && <p role="status" className="text-xs text-[#A48545]">{activityFeedback}</p>}
            <div className="space-y-3">{siteActivities.length === 0 ? <p className="rounded-xl bg-[#FAF7F0] p-5 text-center text-xs text-[#7A746B]">ยังไม่มีกิจกรรม เพิ่มรายการแรกได้จากปุ่มด้านบน</p> : siteActivities.map((activity) => <article key={activity.id} className="flex flex-col gap-3 rounded-xl border border-[#E9E0CF] p-4 sm:flex-row sm:items-center">
              {activity.imageUrl && <img src={activity.imageUrl} alt="" className="h-16 w-24 rounded-lg object-cover"/>}
              <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><strong className="text-sm text-[#183D2B]">{activity.title}</strong><span className={`rounded-full px-2 py-0.5 text-[10px] ${activity.enabled ? 'bg-green-100 text-green-800' : 'bg-stone-100 text-stone-600'}`}>{activity.enabled ? 'เปิดแสดง' : 'ปิดแสดง'}</span></div><p className="mt-1 whitespace-pre-wrap text-xs text-[#7A746B]">{activity.message}</p></div>
              <div className="flex shrink-0 gap-2"><button onClick={() => setEditingActivity({ ...activity, startAt: toDateTimeLocalInput(activity.startAt), endAt: toDateTimeLocalInput(activity.endAt) })} className="rounded-lg border border-[#E9E0CF] px-3 py-2 text-xs"><Edit3 className="mr-1 inline h-3.5 w-3.5"/>แก้ไข</button><button onClick={() => void removeActivity(activity)} className="rounded-lg border border-red-200 px-3 py-2 text-xs text-red-700"><Trash2 className="mr-1 inline h-3.5 w-3.5"/>ลบ</button></div>
            </article>)}</div>
          </section>
        </div>
      )}

      {/* 8. Registered Users Management */}
      {activeTab === 'users' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#183D2B]">
                ตารางสมาชิกและบทบาท ({registeredUsers.length} บัญชี)
              </h3>
              <p className="mt-1 text-xs text-[#7A746B]">
                ตรวจสอบชื่อ อีเมล วิธีสมัคร วันที่สมัครครั้งแรก และบทบาทที่กำหนดไว้โดยระบบความปลอดภัย
              </p>
            </div>
            <div className="text-xs text-[#7A746B]">แสดง {filteredRegisteredUsers.length} จาก {registeredUsers.length} บัญชี</div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-[#49382C]">ค้นหาจากชื่อสมาชิก</span>
              <div className="flex items-center gap-2 rounded-xl border border-[#EEE7DA] bg-white px-3 py-2.5 focus-within:border-[#C6A96B]">
                <Search className="h-4 w-4 text-[#A48545]" />
                <input value={userNameFilter} onChange={(event) => setUserNameFilter(event.target.value)} placeholder="กรอกชื่อสมาชิก" className="w-full bg-transparent text-sm outline-none placeholder:text-[#B8B0A4]" />
              </div>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-[#49382C]">ค้นหาจากอีเมล</span>
              <div className="flex items-center gap-2 rounded-xl border border-[#EEE7DA] bg-white px-3 py-2.5 focus-within:border-[#C6A96B]">
                <Mail className="h-4 w-4 text-[#A48545]" />
                <input value={userEmailFilter} onChange={(event) => setUserEmailFilter(event.target.value)} placeholder="กรอกอีเมล" className="w-full bg-transparent text-sm outline-none placeholder:text-[#B8B0A4]" />
              </div>
            </label>
          </div>

          {userRoleFeedback && (
            <div className={`rounded-xl border px-4 py-3 text-xs ${userRoleFeedback.includes('ไม่สำเร็จ') ? 'border-red-200 bg-red-50 text-red-700' : 'border-[#D7E8D2] bg-[#F1F8EE] text-[#27632A]'}`} role="status">
              {userRoleFeedback}
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-[#EEE7DA] bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-xs">
                <thead className="border-b border-[#EEE7DA] bg-[#FAF7F0] text-[#7A746B]">
                  <tr>
                    <th className="p-3.5 font-bold">ชื่อสมาชิก</th>
                    <th className="p-3.5 font-bold">อีเมล</th>
                    <th className="p-3.5 font-bold">วิธีสมัครเว็บไซต์</th>
                    <th className="p-3.5 font-bold">วันที่สมัครครั้งแรก</th>
                    <th className="p-3.5 font-bold">บทบาท</th>
                    <th className="p-3.5 font-bold">สถานะบัญชี</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEE7DA]">
                  {filteredRegisteredUsers.map((user) => (
                    <tr key={user.uid} className="transition-colors hover:bg-[#FAF7F0]/60">
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="" className="h-8 w-8 rounded-full border border-[#EEE7DA] object-cover" />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#183D2B] text-xs font-bold text-[#C6A96B]">
                              {(user.displayName || '?').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-[#183D2B]">{user.displayName || 'ไม่ระบุชื่อ'}</div>
                            {user.uid === currentUser.uid && <div className="mt-0.5 text-[10px] text-[#A48545]">บัญชีที่กำลังใช้งาน</div>}
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-[#49382C]">{user.email || 'ไม่ระบุอีเมล'}</td>
                      <td className="p-3.5">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${user.authProvider === 'google' ? 'bg-[#E8F0FE] text-[#1967D2]' : 'bg-[#FAF7F0] text-[#7A746B]'}`}>
                          {user.authProvider === 'google' ? 'Google Sign-in' : 'อีเมลและรหัสผ่าน'}
                        </span>
                      </td>
                      <td className="p-3.5 whitespace-nowrap text-[#49382C]">{formatMemberCreatedAt(user.createdAt)}</td>
                      <td className="p-3.5">
                        <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold ${user.role === 'admin' ? 'bg-[#FFF3CD] text-[#805B00] border border-[#E5C46B]' : 'bg-[#EEF5EE] text-[#245A36] border border-[#D5E5D5]'}`}>
                          {user.role === 'admin' ? 'Admin · ผู้ดูแลระบบ' : 'Member · สมาชิก'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold ${user.status === 'suspended' ? 'text-[#C62828]' : 'text-[#2E7D32]'}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${user.status === 'suspended' ? 'bg-[#C62828]' : 'bg-[#2E7D32]'}`} />
                          {user.status === 'suspended' ? 'ระงับการใช้งาน' : 'ใช้งานปกติ'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredRegisteredUsers.length === 0 && (
                    <tr><td colSpan={6} className="p-8 text-center text-sm text-[#7A746B]">ไม่พบสมาชิกที่ตรงกับคำค้น</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-[11px] leading-relaxed text-[#7A746B]">
            บทบาทแสดงตามสิทธิ์ที่ได้รับการกำหนดผ่าน Firebase Custom Claims โดยผู้ดูแลที่ได้รับอนุญาต
          </p>
        </div>
      )}

      {/* 8. Contact Messages */}
      {activeTab === 'messages' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="text-sm font-bold text-[#183D2B]">
            กล่องข้อความติดต่อ ({contactMessages.length} ข้อความ)
          </div>

          <div className="space-y-3">
            {contactMessages.length === 0 && <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#C6A96B]/60 bg-gradient-to-b from-white to-[#F3F5EC] px-5 py-10 text-center"><img src="/mascot/10_tonkla_sleeping.png" alt="น้องต้นกล้าพักผ่อน" className="h-36 w-36 object-contain"/><h4 className="mt-2 text-base font-bold text-[#183D2B]">กล่องข้อความยังว่างอยู่ครับ 🌱</h4><p className="mt-1 max-w-sm text-xs leading-relaxed text-[#7A746B]">ต้นกล้าขอพักรอข้อความใหม่ก่อนนะครับ เมื่อมีผู้ติดต่อเข้ามา ข้อความจะแสดงตรงนี้</p></div>}
            {contactMessages.map((msg) => (
              <div key={msg.messageId} className="bg-white p-5 rounded-xl border border-[#EEE7DA] shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EEE7DA] pb-2">
                  <div>
                    <span className="text-xs font-bold text-[#183D2B]">{msg.name}</span>
                    <span className="text-xs text-[#7A746B] ml-2 font-mono">({msg.email})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#A48545] bg-[#FAF7F0] px-2 py-0.5 rounded border border-[#EEE7DA]">
                      {msg.category}
                    </span>
                    <select
                      value={msg.status}
                      onChange={(e) => store.updateMessageStatus(msg.messageId, e.target.value as any)}
                      className="text-xs p-1 rounded border border-[#EEE7DA] bg-white font-medium cursor-pointer"
                    >
                      <option value="new">ใหม่ (New)</option>
                      <option value="processing">กำลังดำเนินการ (Processing)</option>
                      <option value="replied">ตอบกลับแล้ว (Replied)</option>
                      <option value="closed">ปิดเรื่อง (Closed)</option>
                    </select>
                    {(msg.status === 'replied' || msg.status === 'closed') && (
                      <button onClick={() => { if (window.confirm('ลบข้อความที่ดำเนินการเสร็จแล้วนี้หรือไม่?')) void store.deleteContactMessage(msg.messageId); }} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-[10px] font-semibold text-red-600 hover:bg-red-50">
                        <Trash2 className="h-3.5 w-3.5" /> ลบข้อความ
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-xs font-bold text-[#183D2B]">{msg.subject}</div>
                <p className="text-xs text-[#49382C] leading-relaxed bg-[#FAF7F0] p-3 rounded-lg border border-[#EEE7DA]/50">
                  {msg.message}
                </p>
                <div className="text-[10px] text-[#7A746B]">
                  ส่งเมื่อ: {new Date(msg.createdAt).toLocaleString('th-TH')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. Audit Logs Tab */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-[#EEE7DA] shadow-sm p-6 space-y-4 animate-in fade-in">
          <h3 className="text-sm font-bold text-[#183D2B]">บันทึกประวัติกิจกรรมระบบ (Audit Trail: {auditLogs.length} รายการล่าสุด)</h3>
          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div key={log.logId} className="p-3 bg-[#FAF7F0] rounded-lg border border-[#EEE7DA] text-xs flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="font-semibold text-[#183D2B]">{log.summary}</div>
                  <div className="text-[11px] text-[#7A746B]">
                    ผู้ดำเนินการ: {log.actor} · การกระทำ: {log.action} · ชนิด: {log.entityType}
                  </div>
                </div>
                <div className="text-[10px] font-mono text-[#A48545] shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString('th-TH')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {editingArticle && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleSaveArticle} className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl p-5 sm:p-7 space-y-4 my-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between"><h3 className="text-lg font-bold text-[#183D2B]">{articles.some((item) => item.articleId === editingArticle.articleId) ? 'แก้ไขบทความ' : 'เพิ่มบทความใหม่'}</h3><button type="button" onClick={() => setEditingArticle(null)} className="p-2 rounded-lg hover:bg-[#FAF7F0]"><X className="w-5 h-5" /></button></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="text-xs font-semibold">ชื่อบทความ *<input required value={editingArticle.title} onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })} className="mt-1 w-full rounded-lg border border-[#EEE7DA] p-2 font-normal" /></label>
              <label className="text-xs font-semibold">Slug<input value={editingArticle.slug} onChange={(e) => setEditingArticle({ ...editingArticle, slug: e.target.value })} className="mt-1 w-full rounded-lg border border-[#EEE7DA] p-2 font-normal" /></label>
              <label className="text-xs font-semibold">หมวดหมู่<select value={editingArticle.category} onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value as Article['category'] })} className="mt-1 w-full rounded-lg border border-[#EEE7DA] p-2 font-normal">{['เกร็ดความรู้','ประวัติและวัฒนธรรม','การดูแลรักษา','การจัดสวน','พฤกษศาสตร์'].map((cat) => <option key={cat} value={cat}>{cat}</option>)}</select></label>
              <label className="text-xs font-semibold">ผู้เขียน<input value={editingArticle.author} onChange={(e) => setEditingArticle({ ...editingArticle, author: e.target.value })} className="mt-1 w-full rounded-lg border border-[#EEE7DA] p-2 font-normal" /></label>
              <label className="text-xs font-semibold">URL ภาพหน้าปก<input value={editingArticle.coverImage} onChange={(e) => setEditingArticle({ ...editingArticle, coverImage: e.target.value })} placeholder="https://..." className="mt-1 w-full rounded-lg border border-[#EEE7DA] p-2 font-normal" /></label>
              <label className="text-xs font-semibold">URL แหล่งอ้างอิงภายนอก<input type="url" value={editingArticle.referenceUrl || ''} onChange={(e) => setEditingArticle({ ...editingArticle, referenceUrl: e.target.value })} placeholder="https://..." className="mt-1 w-full rounded-lg border border-[#EEE7DA] p-2 font-normal" /></label>
              <label className="text-xs font-semibold">เวลาอ่าน<input value={editingArticle.readTime} onChange={(e) => setEditingArticle({ ...editingArticle, readTime: e.target.value })} className="mt-1 w-full rounded-lg border border-[#EEE7DA] p-2 font-normal" /></label>
              <label className="text-xs font-semibold">วันที่เผยแพร่<input type="date" value={editingArticle.publishedAt?.slice(0,10) || ''} onChange={(e) => setEditingArticle({ ...editingArticle, publishedAt: e.target.value })} className="mt-1 w-full rounded-lg border border-[#EEE7DA] p-2 font-normal" /></label>
              <label className="text-xs font-semibold">สถานะ<select value={editingArticle.status} onChange={(e) => setEditingArticle({ ...editingArticle, status: e.target.value as Article['status'] })} className="mt-1 w-full rounded-lg border border-[#EEE7DA] p-2 font-normal"><option value="draft">ฉบับร่าง</option><option value="published">เผยแพร่</option></select></label>
              <label className="sm:col-span-2 text-xs font-semibold">คำโปรย<textarea rows={2} value={editingArticle.excerpt} onChange={(e) => setEditingArticle({ ...editingArticle, excerpt: e.target.value })} className="mt-1 w-full rounded-lg border border-[#EEE7DA] p-2 font-normal" /></label>
              <label className="sm:col-span-2 text-xs font-semibold">เนื้อหาบทความ *<textarea required rows={8} value={editingArticle.content} onChange={(e) => setEditingArticle({ ...editingArticle, content: e.target.value })} className="mt-1 w-full rounded-lg border border-[#EEE7DA] p-2 font-normal" /></label>
            </div>
            <div className="flex justify-end gap-2"><button type="button" onClick={() => setEditingArticle(null)} className="px-4 py-2 rounded-lg border border-[#EEE7DA] text-xs">ยกเลิก</button><button type="submit" className="px-5 py-2 rounded-lg bg-[#183D2B] text-white text-xs font-bold">บันทึกบทความ</button></div>
          </form>
        </div>
      )}

      {editingFaq && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={(event) => { event.preventDefault(); if (!editingFaq.question.trim() || !editingFaq.answer.trim()) return; if (faqs.some((item) => item.faqId === editingFaq.faqId)) store.updateFaq(editingFaq.faqId, editingFaq); else store.addFaq(editingFaq); setEditingFaq(null); }} className="bg-white w-full max-w-xl rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between"><h3 className="text-lg font-bold text-[#183D2B]">{faqs.some((item) => item.faqId === editingFaq.faqId) ? 'แก้ไข FAQ' : 'เพิ่ม FAQ'}</h3><button type="button" onClick={() => setEditingFaq(null)}><X className="w-5 h-5" /></button></div>
            <label className="block text-xs font-semibold">คำถาม *<input required value={editingFaq.question} onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })} className="mt-1 w-full rounded-lg border border-[#EEE7DA] p-2 font-normal" /></label>
            <label className="block text-xs font-semibold">คำตอบ *<textarea required rows={5} value={editingFaq.answer} onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })} className="mt-1 w-full rounded-lg border border-[#EEE7DA] p-2 font-normal" /></label>
            <label className="block text-xs font-semibold">หมวดหมู่<select value={editingFaq.category} onChange={(e) => setEditingFaq({ ...editingFaq, category: e.target.value as FAQ['category'] })} className="mt-1 w-full rounded-lg border border-[#EEE7DA] p-2 font-normal">{['ทั่วไป','การค้นหาต้นไม้','ความเชื่อและพฤกษศาสตร์','ระบบสมาชิก','การแจ้งข้อมูล'].map((cat) => <option key={cat} value={cat}>{cat}</option>)}</select></label>
            <div className="flex justify-end gap-2"><button type="button" onClick={() => setEditingFaq(null)} className="px-4 py-2 rounded-lg border border-[#EEE7DA] text-xs">ยกเลิก</button><button type="submit" className="px-5 py-2 rounded-lg bg-[#183D2B] text-white text-xs font-bold">บันทึก FAQ</button></div>
          </form>
        </div>
      )}

      {/* Plant Add / Edit Modal (6 Tabs) */}
      {editingPlant && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-[#C6A96B]/40 overflow-hidden my-6 max-h-[90vh] flex flex-col font-body">
            <div className="p-4 bg-[#183D2B] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#C6A96B]" />
                <span className="text-sm font-bold">
                  {isCreatingNew ? 'เพิ่มพรรณไม้ใหม่' : `แก้ไข: ${editingPlant.thaiName} (${editingPlant.plantId})`}
                </span>
              </div>
              <button onClick={() => setEditingPlant(null)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 6 Tabs for Form */}
            <div className="flex border-b border-[#EEE7DA] bg-[#FAF7F0] px-4 gap-2 overflow-x-auto">
              {[
                { id: 'general', label: '1. ข้อมูลทั่วไป' },
                { id: 'botany', label: '2. พฤกษศาสตร์' },
                { id: 'belief', label: '3. ความเชื่อ' },
                { id: 'care', label: '4. การดูแล' },
                { id: 'safety', label: '5. ความปลอดภัย' },
                { id: 'refs', label: '6. รูปภาพ & อ้างอิง' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setFormTab(t.id as any)}
                  className={`py-2 px-3 text-xs font-semibold whitespace-nowrap border-b-2 ${
                    formTab === t.id ? 'border-[#183D2B] text-[#183D2B]' : 'border-transparent text-[#7A746B]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSavePlantForm} className="p-6 overflow-y-auto flex-1 space-y-4">
              {/* Tab 1: General */}
              {formTab === 'general' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold block mb-1">รหัสพรรณไม้ (Plant ID)</label>
                      <input
                        type="text"
                        value={editingPlant.plantId}
                        onChange={(e) => setEditingPlant({ ...editingPlant, plantId: e.target.value })}
                        className="w-full p-2 border rounded font-mono font-bold bg-stone-50"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-bold block mb-1">หมวดหมู่</label>
                      <select
                        value={editingPlant.categoryId}
                        onChange={(e) => setEditingPlant({ ...editingPlant, categoryId: e.target.value })}
                        className="w-full p-2 border rounded"
                      >
                        {categories.map((c) => (
                          <option key={c.categoryId} value={c.categoryId}>{c.prefix}: {c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold block mb-1">ชื่อภาษาไทย</label>
                      <input
                        type="text"
                        value={editingPlant.thaiName}
                        onChange={(e) => setEditingPlant({ ...editingPlant, thaiName: e.target.value })}
                        className="w-full p-2 border rounded"
                        placeholder="เช่น ราชพฤกษ์"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-bold block mb-1">ชื่อสามัญภาษาอังกฤษ</label>
                      <input
                        type="text"
                        value={editingPlant.englishName}
                        onChange={(e) => setEditingPlant({ ...editingPlant, englishName: e.target.value })}
                        className="w-full p-2 border rounded"
                        placeholder="เช่น Golden Shower Tree"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold block mb-1">ชื่อวิทยาศาสตร์ (Scientific Name)</label>
                      <input
                        type="text"
                        value={editingPlant.scientificName}
                        onChange={(e) => setEditingPlant({ ...editingPlant, scientificName: e.target.value })}
                        className="w-full p-2 border rounded italic"
                        placeholder="เช่น Cassia fistula L."
                        required
                      />
                    </div>
                    <div>
                      <label className="font-bold block mb-1">วงศ์พืช (Family)</label>
                      <input
                        type="text"
                        value={editingPlant.family}
                        onChange={(e) => setEditingPlant({ ...editingPlant, family: e.target.value })}
                        className="w-full p-2 border rounded"
                        placeholder="เช่น Fabaceae"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold block mb-1">คำอธิบายภาพรวม (Description)</label>
                    <textarea
                      value={editingPlant.description}
                      onChange={(e) => setEditingPlant({ ...editingPlant, description: e.target.value })}
                      rows={3}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
              )}

              {/* Tab 2: Botany */}
              {formTab === 'botany' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold block mb-1">ลักษณะทั่วไป</label>
                    <textarea
                      value={editingPlant.characteristics.general}
                      onChange={(e) => setEditingPlant({
                        ...editingPlant,
                        characteristics: { ...editingPlant.characteristics, general: e.target.value }
                      })}
                      rows={2}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">ลักษณะใบ</label>
                    <textarea
                      value={editingPlant.characteristics.leaf}
                      onChange={(e) => setEditingPlant({
                        ...editingPlant,
                        characteristics: { ...editingPlant.characteristics, leaf: e.target.value }
                      })}
                      rows={2}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">ลักษณะดอก</label>
                    <textarea
                      value={editingPlant.characteristics.flower}
                      onChange={(e) => setEditingPlant({
                        ...editingPlant,
                        characteristics: { ...editingPlant.characteristics, flower: e.target.value }
                      })}
                      rows={2}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
              )}

              {/* Tab 3: Belief */}
              {formTab === 'belief' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold block mb-1">คติความเชื่อและสัญลักษณ์ทางวัฒนธรรม</label>
                    <textarea
                      value={editingPlant.belief.culturalMeaning}
                      onChange={(e) => setEditingPlant({
                        ...editingPlant,
                        belief: { ...editingPlant.belief, culturalMeaning: e.target.value }
                      })}
                      rows={3}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">ทิศปลูกมงคลตามตำราโบราณ</label>
                    <input
                      type="text"
                      value={editingPlant.belief.auspiciousDirection || ''}
                      onChange={(e) => setEditingPlant({
                        ...editingPlant,
                        belief: { ...editingPlant.belief, auspiciousDirection: e.target.value }
                      })}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
              )}

              {/* Tab 4: Care */}
              {formTab === 'care' && (
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-bold block mb-1">แสงแดด</label>
                    <select
                      value={editingPlant.care.sunlight}
                      onChange={(e) => setEditingPlant({
                        ...editingPlant,
                        care: { ...editingPlant.care, sunlight: e.target.value as any }
                      })}
                      className="w-full p-2 border rounded"
                    >
                      <option value="แดดจัดเต็มวัน">แดดจัดเต็มวัน</option>
                      <option value="แดดรำไร">แดดรำไร</option>
                      <option value="ร่ม/ในอาคาร">ร่ม/ในอาคาร</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold block mb-1">การรดน้ำ</label>
                    <select
                      value={editingPlant.care.water}
                      onChange={(e) => setEditingPlant({
                        ...editingPlant,
                        care: { ...editingPlant.care, water: e.target.value as any }
                      })}
                      className="w-full p-2 border rounded"
                    >
                      <option value="รดน้ำทุกวัน">รดน้ำทุกวัน</option>
                      <option value="รดน้ำวันเว้นวัน">รดน้ำวันเว้นวัน</option>
                      <option value="รดน้ำ 2-3 วันครั้ง">รดน้ำ 2-3 วันครั้ง</option>
                      <option value="รดน้ำสัปดาห์ละ 1-2 ครั้ง">รดน้ำสัปดาห์ละ 1-2 ครั้ง</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Tab 5: Safety */}
              {formTab === 'safety' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold block mb-1">ความปลอดภัยต่อสุนัขและแมว</label>
                    <select
                      value={editingPlant.safety.toxicityPets}
                      onChange={(e) => setEditingPlant({
                        ...editingPlant,
                        safety: { ...editingPlant.safety, toxicityPets: e.target.value as any }
                      })}
                      className="w-full p-2 border rounded"
                    >
                      <option value="ปลอดภัยต่อสุนัขและแมว">ปลอดภัยต่อสุนัขและแมว</option>
                      <option value="เป็นพิษต่อสุนัขและแมว">เป็นพิษต่อสุนัขและแมว</option>
                      <option value="ระคายเคืองเล็กน้อย">ระคายเคืองเล็กน้อย</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold block mb-1">ข้อควรระวัง</label>
                    <textarea
                      value={editingPlant.safety.caution}
                      onChange={(e) => setEditingPlant({
                        ...editingPlant,
                        safety: { ...editingPlant.safety, caution: e.target.value }
                      })}
                      rows={2}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
              )}

              {/* Tab 6: Images & Refs */}
              {formTab === 'refs' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold block mb-1">URL รูปภาพหลัก</label>
                    <input
                      type="text"
                      value={editingPlant.images[0] || ''}
                      onChange={(e) => setEditingPlant({
                        ...editingPlant,
                        images: [e.target.value]
                      })}
                      className="w-full p-2 border rounded font-mono"
                    />
                  </div>
                </div>
              )}

              {saveStatus && (
                <div className="p-2 text-xs bg-[#E8F5E9] text-[#2E7D32] rounded flex items-center gap-1 font-bold">
                  <Check className="w-4 h-4" />
                  <span>{saveStatus}</span>
                </div>
              )}

              <div className="pt-4 border-t border-[#EEE7DA] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingPlant(null)}
                  className="px-4 py-2 border rounded-lg text-xs font-semibold text-[#7A746B]"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#183D2B] text-white rounded-lg text-xs font-bold hover:bg-[#25523B]"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
