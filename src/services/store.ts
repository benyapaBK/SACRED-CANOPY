import { Plant, Category, Article, FAQ, ContactMessage, UserProfile, AuditLog, FileImportResult } from '../types';
import { CATEGORIES_DATA } from '../data/categories';
import { INITIAL_PLANTS_DATA, SAMPLE_PLANTS_DATA } from '../data/plants';
import { CSV_PLANTS } from '../data/csvPlants';
import { INITIAL_ARTICLES_DATA } from '../data/articles';
import { INITIAL_FAQS_DATA } from '../data/faqs';
import { auth, db, googleProvider } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc, getDoc, setDoc, updateDoc, collection, getDocs, query, orderBy, where,
  serverTimestamp, deleteDoc, addDoc
} from 'firebase/firestore';
import { httpsCallable, getFunctions } from 'firebase/functions';

const STORAGE_KEYS = {
  PLANTS: 'sacred_canopy_plants',
  CATEGORIES: 'sacred_canopy_categories',
  ARTICLES: 'sacred_canopy_articles',
  FAQS: 'sacred_canopy_faqs',
  CONTACT_MESSAGES: 'sacred_canopy_contacts',
  USER: 'sacred_canopy_current_user',
  REGISTERED_USERS: 'sacred_canopy_registered_users',
  AUDIT_LOGS: 'sacred_canopy_audit_logs',
  DRAFTS: 'sacred_canopy_plant_drafts',
};

const INITIAL_USERS: UserProfile[] = []; // Real accounts are created only by Firebase Authentication.

class StoreService {
  private plants: Plant[] = [];
  private categories: Category[] = [];
  private articles: Article[] = [];
  private faqs: FAQ[] = [];
  private contactMessages: ContactMessage[] = [];
  private registeredUsers: UserProfile[] = [];
  private auditLogs: AuditLog[] = [];
  private currentUser: UserProfile;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.currentUser = this.guestProfile();
    this.initData();
    // Firebase Authentication is the source of truth; never restore a signed-in identity from localStorage.
    onAuthStateChanged(auth, (firebaseUser) => {
      void this.applyFirebaseUser(firebaseUser);
      void this.loadCloudContent();
    });
  }

  private guestProfile(): UserProfile {
    return { uid: 'guest-visitor', displayName: 'ผู้เยี่ยมชม', email: '', role: 'guest', favorites: [], createdAt: new Date().toISOString() };
  }

  private async applyFirebaseUser(firebaseUser: FirebaseUser | null) {
    if (!firebaseUser) {
      this.currentUser = this.guestProfile();
      this.notify();
      return;
    }
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const snapshot = await getDoc(userRef);
      const claims = await firebaseUser.getIdTokenResult(true);
      const isAdmin = claims.claims.admin === true;
      const existing = snapshot.exists() ? snapshot.data() : {};
      const profile: UserProfile = {
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName || String(existing.displayName || firebaseUser.email?.split('@')[0] || 'สมาชิก'),
        email: firebaseUser.email || '',
        role: isAdmin ? 'admin' : 'member',
        favorites: Array.isArray(existing.favorites) ? existing.favorites : [],
        recentlyViewed: Array.isArray(existing.recentlyViewed) ? existing.recentlyViewed : [],
        avatarUrl: firebaseUser.photoURL || existing.avatarUrl || undefined,
        authProvider: firebaseUser.providerData.some(p => p.providerId === 'google.com') ? 'google' : 'email',
        status: existing.status === 'suspended' ? 'suspended' : 'active',
        lastLoginAt: new Date().toISOString(),
        createdAt: String(existing.createdAt || new Date().toISOString()),
      };
      if (!snapshot.exists()) {
        await setDoc(userRef, { ...profile, role: 'member', createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      } else {
        await updateDoc(userRef, { displayName: profile.displayName, email: profile.email, avatarUrl: profile.avatarUrl || null, lastLoginAt: serverTimestamp(), updatedAt: serverTimestamp() });
      }
      if (profile.status === 'suspended') {
        await signOut(auth);
        this.currentUser = this.guestProfile();
        this.notify();
        return;
      }
      this.currentUser = profile;
      if (isAdmin) await this.refreshRegisteredUsers();
      this.notify();
    } catch (error) {
      console.error('Firebase profile initialization failed:', error);
      this.currentUser = this.guestProfile();
      this.notify();
    }
  }

  private async refreshRegisteredUsers() {
    try {
      const snapshot = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
      this.registeredUsers = snapshot.docs.map((item) => {
        const data = item.data();
        return {
          uid: item.id,
          displayName: String(data.displayName || 'สมาชิก'),
          email: String(data.email || ''),
          role: data.role === 'admin' ? 'admin' : 'member',
          favorites: Array.isArray(data.favorites) ? data.favorites : [],
          avatarUrl: data.avatarUrl || undefined,
          authProvider: data.authProvider === 'google' ? 'google' : 'email',
          status: data.status === 'suspended' ? 'suspended' : 'active',
          lastLoginAt: data.lastLoginAt?.toDate?.()?.toISOString?.() || data.lastLoginAt || undefined,
          createdAt: data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt || new Date().toISOString(),
        } as UserProfile;
      });
      this.notify();
    } catch (error) {
      console.warn('Unable to load member directory (admin claim required).', error);
    }
  }

  private loadUser(): UserProfile { return this.guestProfile(); }

  private initData() {
    try {
      // The supplied CSV is the bundled baseline dataset. Firestore replaces it when cloud records exist.
      // Ignore stale local plant caches so IDs/categories/images always start from the provided CSV.
      this.plants = [...CSV_PLANTS];

      const savedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      this.categories = savedCategories ? JSON.parse(savedCategories) : CATEGORIES_DATA;

      const savedArticles = localStorage.getItem(STORAGE_KEYS.ARTICLES);
      this.articles = savedArticles ? JSON.parse(savedArticles) : INITIAL_ARTICLES_DATA;

      const savedFaqs = localStorage.getItem(STORAGE_KEYS.FAQS);
      this.faqs = savedFaqs ? JSON.parse(savedFaqs) : INITIAL_FAQS_DATA;

      const savedUsers = localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
      // Member accounts are no longer loaded from localStorage; Firebase Auth/Firestore is authoritative.
      localStorage.removeItem(STORAGE_KEYS.REGISTERED_USERS);
      localStorage.removeItem(STORAGE_KEYS.USER);
      this.registeredUsers = INITIAL_USERS;

      const savedContacts = localStorage.getItem(STORAGE_KEYS.CONTACT_MESSAGES);
      this.contactMessages = savedContacts ? JSON.parse(savedContacts) : [
        {
          messageId: 'msg-1',
          name: 'กมลทิพย์ วรศิลป์',
          email: 'kamoltip@example.com',
          subject: 'สอบถามเรื่องการปลูกราชพฤกษ์ในพื้นที่ดินเหนียว',
          category: 'สอบถามเกี่ยวกับฐานข้อมูล',
          message: 'สวัสดีค่ะ สนใจปลูกราชพฤกษ์ในสวนหลังบ้านแถบนนทบุรีซึ่งเป็นดินเหนียว ควรยกร่องและผสมวัสดุปลูกอย่างไรให้รากไม่เน่าคะ ขอบคุณค่ะ',
          status: 'new',
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        },
        {
          messageId: 'msg-2',
          name: 'ดร. สุรชัย พงศ์ไพศาล',
          email: 'surachai.p@botany.ac.th',
          subject: 'เสนอเพิ่มเติมข้อมูลงานวิจัยเรื่องสารสกัดจากดอกกรรณิการ์',
          category: 'เสนอเพิ่มข้อมูลต้นไม้',
          message: 'ขอชื่นชมโครงการฐานข้อมูลครับ มีเอกสารการทดสอบฤทธิ์ต้านอนุมูลอิสระของกรรณิการ์และกันเกราจากหอพรรณไม้ ยินดีแบ่งปันให้อ้างอิงเพิ่มเติมครับ',
          status: 'processing',
          createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
        }
      ];

      const savedLogs = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      this.auditLogs = savedLogs ? JSON.parse(savedLogs) : [
        {
          logId: 'log-1',
          actor: 'ระบบอัตโนมัติ',
          action: 'SEED_INITIAL_DATABASE',
          entityType: 'system',
          entityId: 'SYS-INIT',
          summary: 'สร้างโครงสร้างสารสนเทศและลงทะเบียนไม้มงคลเริ่มต้น 8 หมวดหมู่',
          timestamp: new Date().toISOString(),
        }
      ];
    } catch (err) {
      console.warn('Failed to parse stored data, falling back to defaults', err);
      this.plants = INITIAL_PLANTS_DATA;
      this.categories = CATEGORIES_DATA;
      this.articles = INITIAL_ARTICLES_DATA;
      this.faqs = INITIAL_FAQS_DATA;
      this.registeredUsers = INITIAL_USERS;
    }
  }

  private async persistCollection<T extends object>(name: string, rows: T[], idOf: (row: T) => string) {
    if (this.currentUser.role !== 'admin') return;
    try {
      await Promise.all(rows.map((row) => setDoc(doc(db, name, idOf(row)), JSON.parse(JSON.stringify(row)), { merge: true })));
    } catch (error) { console.warn(`Firestore write to ${name} failed. Check admin Custom Claim and Firestore Rules.`, error); }
  }

  private async loadCloudContent() {
    try {
      const token = auth.currentUser ? await auth.currentUser.getIdTokenResult(true) : null;
      const isAdmin = token?.claims.admin === true;
      const plantsQuery = isAdmin ? collection(db, 'plants') : query(collection(db, 'plants'), where('status', '==', 'published'));
      const articlesQuery = isAdmin ? collection(db, 'articles') : query(collection(db, 'articles'), where('status', '==', 'published'));
      const [plantsSnap, categoriesSnap, articlesSnap, faqsSnap] = await Promise.all([
        getDocs(plantsQuery), getDocs(collection(db, 'categories')), getDocs(articlesQuery), getDocs(collection(db, 'faqs')),
      ]);
      let importedCsvThisSession = false;
      if (isAdmin) {
        const seedJobs: Promise<unknown>[] = [];
        if (categoriesSnap.empty) seedJobs.push(...this.categories.map(row => setDoc(doc(db, 'categories', row.categoryId), JSON.parse(JSON.stringify(row)))));
        if (articlesSnap.empty) seedJobs.push(...this.articles.map(row => setDoc(doc(db, 'articles', row.articleId), JSON.parse(JSON.stringify(row)))));
        if (faqsSnap.empty) seedJobs.push(...this.faqs.map(row => setDoc(doc(db, 'faqs', row.faqId), JSON.parse(JSON.stringify(row)))));
        // Import the supplied CSV exactly once into the cloud. The marker prevents overwriting future admin edits.
        const importMarkerRef = doc(db, 'system', 'mongkol-mai-2026-10-14');
        const importMarker = await getDoc(importMarkerRef);
        if (!importMarker.exists()) {
          seedJobs.push(...CSV_PLANTS.map(row => setDoc(doc(db, 'plants', row.plantId), JSON.parse(JSON.stringify(row)))));
          seedJobs.push(setDoc(importMarkerRef, {
            importedAt: serverTimestamp(),
            importedBy: auth.currentUser?.uid || '',
            importedCount: CSV_PLANTS.length,
            source: 'mongkol-mai-2026-10-14.csv',
          }));
          importedCsvThisSession = true;
        }
        if (seedJobs.length) await Promise.all(seedJobs);
      }
      if (importedCsvThisSession) {
        this.plants = [...CSV_PLANTS];
        localStorage.setItem(STORAGE_KEYS.PLANTS, JSON.stringify(this.plants));
      } else if (!plantsSnap.empty) {
        this.plants = plantsSnap.docs.map(d => ({ ...d.data(), plantId: d.id } as Plant));
        localStorage.setItem(STORAGE_KEYS.PLANTS, JSON.stringify(this.plants));
      }
      if (!categoriesSnap.empty) {
        this.categories = categoriesSnap.docs.map(d => ({ ...d.data(), categoryId: d.id } as Category));
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(this.categories));
      }
      if (!articlesSnap.empty) {
        this.articles = articlesSnap.docs.map(d => ({ ...d.data(), articleId: d.id } as Article));
        localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(this.articles));
      }
      if (!faqsSnap.empty) {
        this.faqs = faqsSnap.docs.map(d => ({ ...d.data(), faqId: d.id } as FAQ));
        localStorage.setItem(STORAGE_KEYS.FAQS, JSON.stringify(this.faqs));
      }
      if (isAdmin) {
        const [contactsSnap, logsSnap] = await Promise.all([
          getDocs(collection(db, 'contactMessages')),
          getDocs(query(collection(db, 'auditLogs'), orderBy('createdAt', 'desc'))),
        ]);
        if (!contactsSnap.empty) {
          this.contactMessages = contactsSnap.docs.map(d => {
            const data = d.data();
            return { ...data, messageId: d.id, createdAt: data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt || new Date().toISOString() } as ContactMessage;
          });
          localStorage.setItem(STORAGE_KEYS.CONTACT_MESSAGES, JSON.stringify(this.contactMessages));
        }
        if (!logsSnap.empty) {
          this.auditLogs = logsSnap.docs.map(d => {
            const data = d.data();
            return { ...data, logId: d.id, timestamp: data.createdAt?.toDate?.()?.toISOString?.() || data.timestamp || new Date().toISOString() } as AuditLog;
          });
          localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(this.auditLogs));
        }
      }
      this.notify();
    } catch (error) { console.info('Using bundled/local public content until Firestore is configured.', error); }
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // --- Auth & Users ---
  public getUser(): UserProfile {
    return this.currentUser;
  }

  public setUser(user: UserProfile) {
    this.currentUser = user;
    this.notify();
  }

  public getRegisteredUsers(): UserProfile[] { return this.registeredUsers; }

  public saveRegisteredUsers() { /* Member records are persisted through Firestore callable functions. */ }

  public async registerUser(displayName: string, email: string, password: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(credential.user, { displayName: displayName.trim() });
      await setDoc(doc(db, 'users', credential.user.uid), {
        uid: credential.user.uid, displayName: displayName.trim(), email: credential.user.email,
        role: 'member', status: 'active', favorites: [], authProvider: 'email',
        createdAt: serverTimestamp(), updatedAt: serverTimestamp(), lastLoginAt: serverTimestamp(),
      });
      const profile: UserProfile = { uid: credential.user.uid, displayName: displayName.trim(), email: credential.user.email || email.trim(), role: 'member', favorites: [], authProvider: 'email', status: 'active', createdAt: new Date().toISOString(), lastLoginAt: new Date().toISOString() };
      this.currentUser = profile;
      this.logAction('USER_REGISTER', 'user', profile.uid, `สมาชิกใหม่ลงทะเบียน: ${profile.displayName}`);
      this.notify();
      return { success: true, user: profile };
    } catch (error: any) { return { success: false, error: this.authError(error) }; }
  }

  public async loginUser(email: string, password: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const snapshot = await getDoc(doc(db, 'users', credential.user.uid));
      const claims = await credential.user.getIdTokenResult(true);
      const data = snapshot.exists() ? snapshot.data() : {};
      if (data.status === 'suspended') { await signOut(auth); return { success: false, error: 'บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ' }; }
      const profile: UserProfile = { uid: credential.user.uid, displayName: credential.user.displayName || data.displayName || email.split('@')[0], email: credential.user.email || email, role: claims.claims.admin === true ? 'admin' : 'member', favorites: Array.isArray(data.favorites) ? data.favorites : [], recentlyViewed: Array.isArray(data.recentlyViewed) ? data.recentlyViewed : [], avatarUrl: credential.user.photoURL || data.avatarUrl, authProvider: 'email', status: 'active', createdAt: data.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(), lastLoginAt: new Date().toISOString() };
      this.currentUser = profile;
      if (!snapshot.exists()) await setDoc(doc(db, 'users', credential.user.uid), { ...profile, role: 'member', createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      if (profile.role === 'admin') await this.refreshRegisteredUsers();
      this.logAction('USER_LOGIN', 'user', profile.uid, `เข้าสู่ระบบ: ${profile.displayName}`);
      this.notify();
      return { success: true, user: profile };
    } catch (error: any) { return { success: false, error: this.authError(error) }; }
  }

  public async loginWithFirebaseGoogle(): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      const firebaseUser = credential.user;
      const userRef = doc(db, 'users', firebaseUser.uid);
      const snapshot = await getDoc(userRef);
      const data = snapshot.exists() ? snapshot.data() : {};
      const token = await firebaseUser.getIdTokenResult(true);
      const profile: UserProfile = {
        uid: firebaseUser.uid, displayName: firebaseUser.displayName || 'สมาชิก', email: firebaseUser.email || '',
        role: token.claims.admin === true ? 'admin' : 'member',
        favorites: Array.isArray(data.favorites) ? data.favorites : [], recentlyViewed: Array.isArray(data.recentlyViewed) ? data.recentlyViewed : [], avatarUrl: firebaseUser.photoURL || undefined,
        authProvider: 'google', status: data.status === 'suspended' ? 'suspended' : 'active',
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(), lastLoginAt: new Date().toISOString(),
      };
      if (profile.status === 'suspended') { await signOut(auth); return { success: false, error: 'บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ' }; }
      if (!snapshot.exists()) await setDoc(userRef, { uid: profile.uid, displayName: profile.displayName, email: profile.email, role: 'member', status: 'active', favorites: [], avatarUrl: profile.avatarUrl || null, authProvider: 'google', createdAt: serverTimestamp(), updatedAt: serverTimestamp(), lastLoginAt: serverTimestamp() });
      else await updateDoc(userRef, { lastLoginAt: serverTimestamp(), updatedAt: serverTimestamp() });
      this.currentUser = profile;
      if (profile.role === 'admin') await this.refreshRegisteredUsers();
      this.logAction('GOOGLE_LOGIN', 'user', profile.uid, `เข้าสู่ระบบด้วย Google: ${profile.displayName}`);
      this.notify();
      return { success: true, user: profile };
    } catch (error: any) { return { success: false, error: this.authError(error) }; }
  }

  public async sendPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
    try { await sendPasswordResetEmail(auth, email.trim()); return { success: true }; }
    catch (error: any) { return { success: false, error: this.authError(error) }; }
  }

  private authError(error: any): string {
    const code = String(error?.code || '');
    const messages: Record<string, string> = {
      'auth/email-already-in-use': 'อีเมลนี้มีบัญชีอยู่แล้ว', 'auth/invalid-email': 'รูปแบบอีเมลไม่ถูกต้อง',
      'auth/weak-password': 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร', 'auth/invalid-credential': 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
      'auth/user-not-found': 'ไม่พบบัญชีนี้', 'auth/wrong-password': 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
      'auth/popup-closed-by-user': 'คุณปิดหน้าต่าง Google ก่อนเข้าสู่ระบบเสร็จ',
      'auth/unauthorized-domain': 'โดเมนนี้ยังไม่ได้รับอนุญาตใน Firebase Authentication',
      'auth/operation-not-allowed': 'ยังไม่ได้เปิดวิธีเข้าสู่ระบบนี้ใน Firebase Console',
      'auth/too-many-requests': 'มีการลองเข้าสู่ระบบหลายครั้งเกินไป กรุณารอสักครู่',
    };
    return messages[code] || `ดำเนินการไม่สำเร็จ (${code || 'firebase-error'}): ${error?.message || 'กรุณาลองใหม่'}`;
  }

  public async logout() {
    try { await signOut(auth); } catch (error) { console.error('Firebase sign-out failed', error); }
    this.currentUser = this.guestProfile();
    this.notify();
  }

  public async updateUserRole(uid: string, role: 'member' | 'admin') {
    try {
      const call = httpsCallable(getFunctions(), 'setUserRole');
      await call({ uid, role });
      await this.refreshRegisteredUsers();
      this.logAction('UPDATE_USER_ROLE', 'user', uid, `เปลี่ยนสิทธิ์สมาชิกเป็น ${role}`);
    } catch (error) { console.error('เปลี่ยนบทบาทไม่สำเร็จ ต้อง deploy Cloud Functions และใช้บัญชี admin ที่มี Custom Claim', error); throw error; }
  }

  public async updateUserStatus(uid: string, status: 'active' | 'suspended') {
    try {
      const call = httpsCallable(getFunctions(), 'setUserStatus');
      await call({ uid, status });
      await this.refreshRegisteredUsers();
      this.logAction('UPDATE_USER_STATUS', 'user', uid, `เปลี่ยนสถานะสมาชิกเป็น ${status}`);
    } catch (error) { console.error('เปลี่ยนสถานะไม่สำเร็จ ต้อง deploy Cloud Functions และใช้บัญชี admin ที่มี Custom Claim', error); throw error; }
  }

  public async deleteUser(uid: string) {
    try {
      const call = httpsCallable(getFunctions(), 'deleteMemberProfile');
      await call({ uid });
      await this.refreshRegisteredUsers();
      this.logAction('DELETE_USER', 'user', uid, 'ลบโปรไฟล์สมาชิก');
    } catch (error) { console.error('ลบสมาชิกไม่สำเร็จ ต้อง deploy Cloud Functions และใช้บัญชี admin ที่มี Custom Claim', error); throw error; }
  }

  public recordPlantView(plantId: string): void {
    if (this.currentUser.role === 'guest') return;
    const recentlyViewed = [plantId, ...(this.currentUser.recentlyViewed || []).filter((id) => id !== plantId)].slice(0, 30);
    this.currentUser = { ...this.currentUser, recentlyViewed };
    void updateDoc(doc(db, 'users', this.currentUser.uid), { recentlyViewed, updatedAt: serverTimestamp() })
      .catch((error) => console.warn('Could not sync recent views to Firestore', error));
    this.notify();
  }

  // --- Favorites ---
  public getFavorites(): string[] {
    return this.currentUser.favorites || [];
  }

  public isFavorite(plantId: string): boolean {
    return this.currentUser.favorites.includes(plantId);
  }

  public toggleFavorite(plantId: string): boolean {
    if (this.currentUser.role === 'guest') return false;
    const exists = this.isFavorite(plantId);
    let updated: string[];
    if (exists) {
      updated = this.currentUser.favorites.filter((id) => id !== plantId);
    } else {
      updated = [...this.currentUser.favorites, plantId];
    }
    this.setUser({ ...this.currentUser, favorites: updated });
    // The guest guard above narrows the user to a real member/admin account.
    void updateDoc(doc(db, 'users', this.currentUser.uid), { favorites: updated, updatedAt: serverTimestamp() }).catch((error) => console.warn('Could not sync favorites to Firestore', error));
    // Also update the in-memory registered user directory.
    const reg = this.registeredUsers.find((u) => u.uid === this.currentUser.uid);
    if (reg) {
      reg.favorites = updated;
      this.saveRegisteredUsers();
    }
    return !exists;
  }

  // --- Plants ---
  public getPlants(includeDeleted = false): Plant[] {
    if (includeDeleted) return [...this.plants];
    return this.plants.filter((p) => !p.deletedAt);
  }

  public getPlantById(id: string): Plant | undefined {
    return this.plants.find((p) => p.plantId.toLowerCase() === id.toLowerCase());
  }

  public addPlant(plant: Omit<Plant, 'createdAt' | 'updatedAt'>): Plant {
    const now = new Date().toISOString();
    const newPlant: Plant = {
      ...plant,
      createdAt: now,
      updatedAt: now,
    };
    this.plants = [newPlant, ...this.plants];
    this.savePlants();
    this.logAction('CREATE_PLANT', 'plant', newPlant.plantId, `เพิ่มไม้มงคลใหม่: ${newPlant.thaiName} (${newPlant.plantId})`);
    this.notify();
    return newPlant;
  }

  public updatePlant(plantId: string, updates: Partial<Plant>): Plant | null {
    const idx = this.plants.findIndex((p) => p.plantId === plantId);
    if (idx === -1) return null;
    const updated: Plant = {
      ...this.plants[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.plants[idx] = updated;
    this.savePlants();
    this.logAction('UPDATE_PLANT', 'plant', plantId, `แก้ไขข้อมูล: ${updated.thaiName} (${plantId})`);
    this.notify();
    return updated;
  }

  public softDeletePlant(plantId: string): boolean {
    const idx = this.plants.findIndex((p) => p.plantId === plantId);
    if (idx === -1) return false;
    this.plants[idx] = {
      ...this.plants[idx],
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.savePlants();
    this.logAction('SOFT_DELETE_PLANT', 'plant', plantId, `ย้ายลงถังขยะ: ${this.plants[idx].thaiName}`);
    this.notify();
    return true;
  }

  public restorePlant(plantId: string): boolean {
    const idx = this.plants.findIndex((p) => p.plantId === plantId);
    if (idx === -1) return false;
    this.plants[idx] = {
      ...this.plants[idx],
      deletedAt: null,
      updatedAt: new Date().toISOString(),
    };
    this.savePlants();
    this.logAction('RESTORE_PLANT', 'plant', plantId, `กู้คืนไม้มงคล: ${this.plants[idx].thaiName}`);
    this.notify();
    return true;
  }

  public permanentDeletePlant(plantId: string): boolean {
    const p = this.plants.find((x) => x.plantId === plantId);
    this.plants = this.plants.filter((x) => x.plantId !== plantId);
    this.savePlants();
    this.logAction('HARD_DELETE_PLANT', 'plant', plantId, `ลบถาวร: ${p ? p.thaiName : plantId}`);
    this.notify();
    return true;
  }

  // --- Bulk Actions ---
  public bulkSoftDelete(plantIds: string[]) {
    const now = new Date().toISOString();
    this.plants = this.plants.map((p) => {
      if (plantIds.includes(p.plantId)) {
        return { ...p, deletedAt: now, updatedAt: now };
      }
      return p;
    });
    this.savePlants();
    this.logAction('BULK_DELETE', 'plant', 'BULK', `ย้ายลงถังขยะ ${plantIds.length} รายการ`);
    this.notify();
  }

  public bulkRestore(plantIds: string[]) {
    const now = new Date().toISOString();
    this.plants = this.plants.map((p) => {
      if (plantIds.includes(p.plantId)) {
        return { ...p, deletedAt: null, updatedAt: now };
      }
      return p;
    });
    this.savePlants();
    this.logAction('BULK_RESTORE', 'plant', 'BULK', `กู้คืน ${plantIds.length} รายการ`);
    this.notify();
  }

  public bulkUpdateStatus(plantIds: string[], status: 'published' | 'draft' | 'archived') {
    const now = new Date().toISOString();
    this.plants = this.plants.map((p) => {
      if (plantIds.includes(p.plantId)) {
        return { ...p, status, updatedAt: now };
      }
      return p;
    });
    this.savePlants();
    this.logAction('BULK_STATUS', 'plant', 'BULK', `เปลี่ยนสถานะเป็น ${status} จำนวน ${plantIds.length} รายการ`);
    this.notify();
  }

  public clearAllPlants() {
    this.plants = [];
    this.savePlants();
    this.logAction('CLEAR_ALL_PLANTS', 'plant', 'ALL', 'ล้างข้อมูลพรรณไม้ทั้งหมดในระบบเพื่อเตรียมนำเข้าใหม่');
    this.notify();
  }

  public loadSamplePlants() {
    this.plants = [...SAMPLE_PLANTS_DATA];
    this.savePlants();
    this.logAction('LOAD_SAMPLE_PLANTS', 'plant', 'SAMPLE', `โหลดชุดข้อมูลตัวอย่างเริ่มต้น ${SAMPLE_PLANTS_DATA.length} รายการ`);
    this.notify();
  }

  private savePlants() {
    localStorage.setItem(STORAGE_KEYS.PLANTS, JSON.stringify(this.plants));
    void this.persistCollection('plants', this.plants, (row) => row.plantId);
  }

  // --- Next Code Generator (e.g. A01, A02, A03) ---
  public getNextPlantCode(prefix: string): string {
    const cleanPrefix = prefix.toUpperCase();
    const existingCodes = this.plants
      .map((p) => p.plantId.toUpperCase())
      .filter((id) => id.startsWith(cleanPrefix));
    
    let maxNum = 0;
    for (const code of existingCodes) {
      const numPart = parseInt(code.substring(cleanPrefix.length), 10);
      if (!isNaN(numPart) && numPart > maxNum) {
        maxNum = numPart;
      }
    }
    const nextNum = maxNum + 1;
    return `${cleanPrefix}${nextNum < 10 ? '0' : ''}${nextNum}`;
  }

  // --- Categories Management ---
  public getCategories(): Category[] {
    return this.categories.map((cat) => {
      const count = this.plants.filter((p) => !p.deletedAt && p.categoryId === cat.categoryId).length;
      return { ...cat, plantCount: count };
    });
  }

  public addCategory(cat: Category): Category {
    this.categories.push(cat);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(this.categories));
    void this.persistCollection('categories', this.categories, (row) => row.categoryId);
    this.logAction('CREATE_CATEGORY', 'category', cat.categoryId, `เพิ่มหมวดหมู่: ${cat.name} (${cat.prefix})`);
    this.notify();
    return cat;
  }

  public updateCategory(categoryId: string, updates: Partial<Category>) {
    const idx = this.categories.findIndex((c) => c.categoryId === categoryId);
    if (idx !== -1) {
      this.categories[idx] = { ...this.categories[idx], ...updates };
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(this.categories));
    void this.persistCollection('categories', this.categories, (row) => row.categoryId);
      this.logAction('UPDATE_CATEGORY', 'category', categoryId, `แก้ไขหมวดหมู่: ${this.categories[idx].name}`);
      this.notify();
    }
  }

  public deleteCategory(categoryId: string) {
    this.categories = this.categories.filter((c) => c.categoryId !== categoryId);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(this.categories));
    void this.persistCollection('categories', this.categories, (row) => row.categoryId);
    this.logAction('DELETE_CATEGORY', 'category', categoryId, `ลบหมวดหมู่: ${categoryId}`);
    this.notify();
  }

  // --- Articles Management ---
  public getArticles(): Article[] {
    return this.articles;
  }

  public addArticle(art: Article): Article {
    this.articles = [art, ...this.articles];
    localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(this.articles));
    void this.persistCollection('articles', this.articles, (row) => row.articleId);
    this.logAction('CREATE_ARTICLE', 'article', art.articleId, `สร้างบทความ: ${art.title}`);
    this.notify();
    return art;
  }

  public updateArticle(articleId: string, updates: Partial<Article>) {
    const idx = this.articles.findIndex((a) => a.articleId === articleId);
    if (idx !== -1) {
      this.articles[idx] = { ...this.articles[idx], ...updates };
      localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(this.articles));
    void this.persistCollection('articles', this.articles, (row) => row.articleId);
      this.logAction('UPDATE_ARTICLE', 'article', articleId, `แก้ไขบทความ: ${this.articles[idx].title}`);
      this.notify();
    }
  }

  public deleteArticle(articleId: string) {
    const art = this.articles.find((a) => a.articleId === articleId);
    this.articles = this.articles.filter((a) => a.articleId !== articleId);
    localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(this.articles));
    void this.persistCollection('articles', this.articles, (row) => row.articleId);
    this.logAction('DELETE_ARTICLE', 'article', articleId, `ลบบทความ: ${art?.title || articleId}`);
    this.notify();
  }

  // --- FAQs Management ---
  public getFaqs(): FAQ[] {
    return this.faqs;
  }

  public addFaq(faq: FAQ): FAQ {
    this.faqs.push(faq);
    localStorage.setItem(STORAGE_KEYS.FAQS, JSON.stringify(this.faqs));
    void this.persistCollection('faqs', this.faqs, (row) => row.faqId);
    this.logAction('CREATE_FAQ', 'faq', faq.faqId, `เพิ่มคำถาม FAQ: ${faq.question.slice(0, 30)}...`);
    this.notify();
    return faq;
  }

  public updateFaq(faqId: string, updates: Partial<FAQ>) {
    const idx = this.faqs.findIndex((f) => f.faqId === faqId);
    if (idx !== -1) {
      this.faqs[idx] = { ...this.faqs[idx], ...updates };
      localStorage.setItem(STORAGE_KEYS.FAQS, JSON.stringify(this.faqs));
    void this.persistCollection('faqs', this.faqs, (row) => row.faqId);
      this.logAction('UPDATE_FAQ', 'faq', faqId, `แก้ไขคำถาม FAQ: ${faqId}`);
      this.notify();
    }
  }

  public deleteFaq(faqId: string) {
    this.faqs = this.faqs.filter((f) => f.faqId !== faqId);
    localStorage.setItem(STORAGE_KEYS.FAQS, JSON.stringify(this.faqs));
    void this.persistCollection('faqs', this.faqs, (row) => row.faqId);
    this.logAction('DELETE_FAQ', 'faq', faqId, `ลบคำถาม FAQ: ${faqId}`);
    this.notify();
  }

  // --- Contact Messages ---
  public getContactMessages(): ContactMessage[] {
    return this.contactMessages;
  }

  public submitContactMessage(msg: Omit<ContactMessage, 'messageId' | 'status' | 'createdAt'>): ContactMessage {
    const newMsg: ContactMessage = {
      ...msg,
      messageId: `msg-${Date.now()}`,
      status: 'new',
      createdAt: new Date().toISOString(),
    };
    this.contactMessages = [newMsg, ...this.contactMessages];
    localStorage.setItem(STORAGE_KEYS.CONTACT_MESSAGES, JSON.stringify(this.contactMessages));
    void addDoc(collection(db, 'contactMessages'), { ...newMsg, createdAt: serverTimestamp() }).catch((error) => console.warn('Contact message could not be saved to Firestore', error));
    this.notify();
    return newMsg;
  }

  public updateMessageStatus(id: string, status: ContactMessage['status']) {
    const idx = this.contactMessages.findIndex((m) => m.messageId === id);
    if (idx !== -1) {
      this.contactMessages[idx].status = status;
      localStorage.setItem(STORAGE_KEYS.CONTACT_MESSAGES, JSON.stringify(this.contactMessages));
      if (this.currentUser.role === 'admin') void updateDoc(doc(db, 'contactMessages', id), { status, updatedAt: serverTimestamp() }).catch(console.warn);
      this.notify();
    }
  }

  // --- Audit Logs ---
  public getAuditLogs(): AuditLog[] {
    return this.auditLogs;
  }

  public logAction(action: string, entityType: AuditLog['entityType'], entityId: string, summary: string) {
    const newLog: AuditLog = {
      logId: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      actor: this.currentUser.displayName,
      action,
      entityType,
      entityId,
      summary,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs = [newLog, ...this.auditLogs].slice(0, 100);
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(this.auditLogs));
    if (this.currentUser.role !== 'guest') void addDoc(collection(db, 'auditLogs'), { actorUid: this.currentUser.uid, actor: this.currentUser.displayName, action, entityType, entityId, summary, createdAt: serverTimestamp() }).catch((error) => console.warn('Audit log was not synced', error));
  }

  // --- File Import & Export System (JSON & CSV) ---
  public importJSON(jsonText: string, targetCategoryId?: string, forceCategory: boolean = false): FileImportResult {
    try {
      const parsed = JSON.parse(jsonText);
      const errors: string[] = [];
      let count = 0;

      // Check if it's full backup format or plants array
      let plantsToImport: any[] = [];
      if (Array.isArray(parsed)) {
        plantsToImport = parsed;
      } else if (parsed.plants && Array.isArray(parsed.plants)) {
        plantsToImport = parsed.plants;
        if (parsed.categories && Array.isArray(parsed.categories)) {
          this.categories = parsed.categories;
          localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(this.categories));
    void this.persistCollection('categories', this.categories, (row) => row.categoryId);
        }
        if (parsed.articles && Array.isArray(parsed.articles)) {
          this.articles = parsed.articles;
          localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(this.articles));
    void this.persistCollection('articles', this.articles, (row) => row.articleId);
        }
      } else {
        return { success: false, importedCount: 0, errors: ['โครงสร้างไฟล์ JSON ไม่ถูกต้อง ไม่พบชุดข้อมูลพรรณไม้'] };
      }

      for (const item of plantsToImport) {
        const sciName = item.scientificName || item.scientific_name || item.scientific || '';
        if (!item.thaiName && !sciName) {
          errors.push(`แถวที่ไม่มีชื่อไทยหรือชื่อวิทยาศาสตร์ถูกข้าม`);
          continue;
        }

        let catCode = item.categoryCode || (item.categoryId ? item.categoryId.replace('cat-', '') : 'A');
        let categoryId = item.categoryId || (catCode.startsWith('cat-') ? catCode : `cat-${catCode.toUpperCase()}`);

        // Apply user-selected category if provided
        if (targetCategoryId && targetCategoryId !== 'auto') {
          if (forceCategory || !item.categoryId) {
            categoryId = targetCategoryId.startsWith('cat-') ? targetCategoryId : `cat-${targetCategoryId.toUpperCase()}`;
            catCode = categoryId.replace('cat-', '');
          }
        }

        const suppliedPlantId = String(item.plantId || item.id || '').trim();
        const normalizedPrefix = catCode.replace('cat-', '').toUpperCase();
        // เมื่อบังคับหมวด รหัสต้นไม้ต้องตรงกับ Prefix ของหมวดที่เลือก
        const plantId = suppliedPlantId && suppliedPlantId.toUpperCase().startsWith(normalizedPrefix)
          ? suppliedPlantId
          : this.getNextPlantCode(normalizedPrefix);
        const thaiName = item.thaiName || 'ไม้มงคล';

        const newPlant: Plant = {
          plantId,
          thaiName,
          englishName: item.englishName || '',
          scientificName: sciName,
          family: item.family || 'ยังไม่ระบุวงศ์',
          otherNames: item.otherNames || (item.localName ? [item.localName] : []),
          localName: item.localName || '',
          categoryId,
          categoryCode: catCode.replace('cat-', ''),
          growthType: item.growthType || item.characteristics?.growthType || '',
          careLevel: item.careLevel || 'ง่าย',
          description: item.description || item.general || `พรรณไม้มงคล ${thaiName} ทรงคุณค่าทางวัฒนธรรมและพฤกษศาสตร์`,
          characteristics: {
            general: item.characteristics?.general || item.general || 'พรรณไม้สมบูรณ์',
            leaf: item.characteristics?.leaf || item.leaf || 'ตามลักษณะสายพันธุ์',
            stem: item.characteristics?.stem || item.stem || '',
            flower: item.characteristics?.flower || item.flower || '',
            fruit: item.characteristics?.fruit || item.fruit || item.fruitSeed || '',
            fruitSeed: item.characteristics?.fruitSeed || item.fruitSeed || '',
            highlight: item.characteristics?.highlight || item.highlight || '',
            height: item.characteristics?.height || item.height || '',
            growthType: item.characteristics?.growthType || item.growthType || '',
          },
          belief: {
            types: item.belief?.types || ['wealth', 'auspicious'],
            culturalMeaning: (typeof item.belief === 'string' ? item.belief : item.belief?.culturalMeaning) || 'เสริมความเป็นสิริมงคลและความร่มเย็น',
            benefits: item.belief?.benefits || item.benefits || 'ปลูกประดับตกแต่งเคหสถาน',
            auspiciousDirection: item.belief?.auspiciousDirection || item.auspiciousDirection || 'ทิศตะวันออก',
            beliefOrigin: item.belief?.beliefOrigin || item.beliefOrigin || '',
            meaning: item.belief?.meaning || item.meaning || '',
            auspicious: item.belief?.auspicious || item.auspicious || '',
          },
          care: {
            soil: item.care?.soil || item.soil || 'ดินร่วนซุยระบายน้ำดี',
            sunlight: item.care?.sunlight || item.light || 'แดดจัดเต็มวัน',
            water: item.care?.water || item.water || 'รดน้ำทุกวัน',
            waterLevel: item.care?.waterLevel || item.waterLevel || 'ปานกลาง',
            lightLevel: item.care?.lightLevel || item.lightLevel || 'ปานกลาง',
            humidity: item.care?.humidity || item.humidity || 'ความชื้นปานกลาง',
            temperature: item.care?.temperature || item.temperature || '20°C - 38°C',
            fertilizer: item.care?.fertilizer || item.fertilizer || 'ปุ๋ยละลายช้าหรือปุ๋ยคอก',
            propagation: item.care?.propagation || item.propagation || 'เพาะเมล็ด / ปักชำ',
            pruning: item.care?.pruning || item.pruning || 'ตัดแต่งทรงพุ่มอย่างสม่ำเสมอ',
            planting: item.care?.planting || item.planting || '',
            pests: item.care?.pests || item.pests || 'เพลี้ยและหนอนกินใบ',
            disease: item.care?.disease || item.disease || 'โรครากเน่าและโคนเน่า',
            prevention: item.care?.prevention || item.prevention || 'ระบายน้ำดีและใช้น้ำส้มควันไม้',
          },
          safety: {
            caution: item.safety?.caution || item.caution || (item.petSafe === 'ไม่ใช่' ? 'ระวังน้ำยางสัมผัสผิวและวางให้พ้นสัตว์เลี้ยง' : 'ปลอดภัย'),
            toxicityHuman: item.safety?.toxicityHuman || item.humanToxicity || 'ปลอดภัย',
            toxicityPets: item.safety?.toxicityPets || (item.petSafe === 'ไม่ใช่' ? 'เป็นพิษต่อสุนัขและแมว' : 'ปลอดภัยต่อสุนัขและแมว'),
            petSafe: item.petSafe || item.safety?.petSafe || (item.safety?.toxicityPets?.includes('ปลอดภัย') ? 'ใช่' : 'ไม่ใช่'),
            petToxicity: item.safety?.petToxicity || item.petToxicity || '',
            petDetail: item.safety?.petDetail || item.petDetail || '',
            toxicParts: item.safety?.toxicParts || item.toxicParts || '',
            symptoms: item.safety?.symptoms || item.symptoms || '',
            safetyReference: item.safety?.safetyReference || 'หอพรรณไม้และศูนย์ข้อมูลพิษวิทยา',
          },
          suitability: {
            condo: item.suitability?.condo ?? (item.condo === 'ใช่' || item.condo === true),
            balcony: item.suitability?.balcony ?? (item.balcony === 'ใช่' || item.balcony === true),
            home: item.suitability?.home ?? (item.home === 'ใช่' || item.home === true),
            garden: item.suitability?.garden ?? (item.garden === 'ใช่' || item.garden === true),
            pot: item.suitability?.pot ?? (item.pot === 'ใช่' || item.pot === true),
            limitedSpace: item.suitability?.limitedSpace ?? (item.limitedSpace === 'ใช่' || item.limitedSpace === true),
            busyFriendly: item.suitability?.busyFriendly ?? (item.busyFriendly === 'ใช่' || item.busyFriendly === true),
            beginner: item.suitability?.beginner ?? (item.beginner === 'ใช่' || item.beginner === true),
            suitableUser: item.suitability?.suitableUser || item.suitableUser || '',
            space: item.suitability?.space || item.space || '',
          },
          spaceType: item.spaceType || (item.condo === 'ใช่' ? 'ในอาคาร/คอนโด/ระเบียง' : 'บ้านเดี่ยว/สวนกว้าง'),
          keywords: item.keywords || [thaiName, item.growthType || 'ไม้มงคล', 'สิริมงคล'].filter(Boolean),
          images: item.images && item.images.length > 0 ? item.images : (item.image ? [item.image] : ['/images/botanical_ratchaphruek_1791992174219.jpg']),
          imageCredit: item.imageCredit || '',
          source: item.source || '',
          sourceUrl: item.sourceUrl || item.source || '',
          references: item.references || (item.source ? [{ title: `${sciName} ข้อมูลพรรณไม้`, author: 'หอพรรณไม้', url: item.source, verifiedDate: new Date().toISOString().slice(0, 10) }] : [{ title: 'ฐานข้อมูลพรรณไม้นำเข้า', author: 'ผู้ดูแลระบบ', verifiedDate: new Date().toISOString().slice(0, 10) }]),
          status: item.status || 'published',
          isFeatured: item.isFeatured ?? true,
          isNew: item.isNew ?? true,
          createdBy: item.createdBy || 'Ak0w1ZZhTThoBTe7EDyQoZSX3ls2',
          createdByName: item.createdByName || 'Anuntaya',
          createdByEmail: item.createdByEmail || 'aunnun0024@gmail.com',
          updatedBy: item.updatedBy || 'Ak0w1ZZhTThoBTe7EDyQoZSX3ls2',
          updatedByName: item.updatedByName || 'Anuntaya',
          updatedByEmail: item.updatedByEmail || 'aunnun0024@gmail.com',
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString(),
          isDeleted: item.isDeleted ?? false,
        };

        // Replace if exists or append
        const existingIdx = this.plants.findIndex((p) => p.plantId.toUpperCase() === plantId.toUpperCase());
        if (existingIdx !== -1) {
          this.plants[existingIdx] = newPlant;
        } else {
          this.plants.unshift(newPlant);
        }
        count++;
      }

      this.savePlants();
      this.logAction('IMPORT_JSON', 'plant', 'IMPORT', `นำเข้าข้อมูล JSON สำเร็จ ${count} รายการ`);
      this.notify();
      return { success: true, importedCount: count, errors };
    } catch (err: any) {
      return { success: false, importedCount: 0, errors: [`รูปแบบไฟล์ JSON ผิดพลาด: ${err.message}`] };
    }
  }

  public importCSV(csvText: string, targetCategoryId?: string, forceCategory: boolean = false): FileImportResult {
    try {
      const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        return { success: false, importedCount: 0, errors: ['ไฟล์ CSV ต้องมีหัวตารางและข้อมูลอย่างน้อย 1 แถว'] };
      }

      const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
      const errors: string[] = [];
      let count = 0;

      for (let i = 1; i < lines.length; i++) {
        // Simple CSV splitter that handles quoted commas
        const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
        const values = row.map((v) => v.trim().replace(/^"|"$/g, ''));

        // Map column names
        const getCol = (name: string): string => {
          const idx = headers.findIndex((h) => h.toLowerCase().includes(name.toLowerCase()));
          return idx !== -1 && values[idx] ? values[idx] : '';
        };

        const thaiName = getCol('ชื่อไทย') || getCol('thaiName') || values[0];
        const sciName = getCol('วิทยาศาสตร์') || getCol('scientificName') || values[1];
        if (!thaiName || !sciName) {
          errors.push(`แถวที่ ${i + 1}: ข้ามเนื่องจากไม่มีชื่อไทยหรือชื่อวิทยาศาสตร์`);
          continue;
        }

        const catCol = getCol('หมวด') || getCol('categoryId') || 'cat-A';
        let cleanCat = catCol.startsWith('cat-') ? catCol : `cat-${catCol.toUpperCase()}`;

        // Apply user-selected category if provided
        if (targetCategoryId && targetCategoryId !== 'auto') {
          if (forceCategory || !getCol('หมวด')) {
            cleanCat = targetCategoryId.startsWith('cat-') ? targetCategoryId : `cat-${targetCategoryId.toUpperCase()}`;
          }
        }

        const prefix = cleanCat.replace('cat-', '').toUpperCase();
        const suppliedPlantId = (getCol('รหัส') || getCol('plantId') || '').trim();
        const plantId = suppliedPlantId && suppliedPlantId.toUpperCase().startsWith(prefix)
          ? suppliedPlantId
          : this.getNextPlantCode(prefix);

        const newPlant: Plant = {
          plantId,
          thaiName,
          englishName: getCol('ชื่ออังกฤษ') || getCol('englishName') || '',
          scientificName: sciName,
          family: getCol('วงศ์') || getCol('family') || 'วงศ์พืชไทย',
          otherNames: (getCol('ชื่ออื่น') || '').split(';').map((s) => s.trim()).filter(Boolean),
          categoryId: cleanCat,
          description: getCol('คำอธิบาย') || getCol('description') || `พรรณไม้มงคล ${thaiName} นำเข้าสู่ระบบสารสนเทศ`,
          characteristics: {
            general: getCol('ลักษณะทั่วไป') || 'พรรณไม้สมบูรณ์',
            leaf: getCol('ใบ') || 'ตามลักษณะสายพันธุ์',
            stem: getCol('ลำต้น') || 'ตามลักษณะสายพันธุ์',
            flower: getCol('ดอก') || 'ตามลักษณะสายพันธุ์',
            fruit: 'ตามลักษณะสายพันธุ์',
            highlight: getCol('จุดเด่น') || 'ไม้มงคลนำเข้า',
          },
          belief: {
            types: ['auspicious'],
            culturalMeaning: getCol('ความเชื่อ') || getCol('belief') || 'เสริมสิริมงคลและความร่มเย็น',
            benefits: getCol('ประโยชน์') || 'ประดับตกแต่งเคหสถาน',
            auspiciousDirection: getCol('ทิศ') || 'ทิศตะวันออก',
          },
          care: {
            soil: getCol('ดิน') || 'ดินร่วนระบายน้ำดี',
            sunlight: (getCol('แสง') as any) || 'แดดจัดเต็มวัน',
            water: (getCol('น้ำ') as any) || 'รดน้ำวันเว้นวัน',
            humidity: 'ปานกลาง',
            temperature: '25°C - 35°C',
            fertilizer: 'ปุ๋ยคอกปีละ 2 ครั้ง',
            propagation: 'เพาะเมล็ด / ปักชำ',
            pruning: 'ตัดแต่งกิ่งแห้ง',
            pests: 'เพลี้ยและหนอนกินใบ',
            prevention: 'ฉีดพ่นน้ำสะเดาหมัก',
          },
          safety: {
            caution: getCol('ข้อควรระวัง') || 'ปลอดภัย',
            toxicityHuman: 'ปลอดภัย',
            toxicityPets: (getCol('สัตว์เลี้ยง') as any) || 'ปลอดภัยต่อสุนัขและแมว',
            safetyReference: 'หอพรรณไม้ กรมอุทยานแห่งชาติฯ',
          },
          spaceType: (getCol('พื้นที่') as any) || 'บ้านเดี่ยว/สวนกว้าง',
          careLevel: (getCol('การดูแล') as any) || 'ดูแลง่าย',
          keywords: [thaiName, 'ไม้มงคล'],
          images: [getCol('รูปภาพ') || '/images/botanical_ratchaphruek_1791992174219.jpg'],
          references: [{ title: 'เอกสารนำเข้า CSV', author: 'Admin Importer', verifiedDate: new Date().toISOString().slice(0, 10) }],
          status: 'published',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const existingIdx = this.plants.findIndex((p) => p.plantId.toUpperCase() === plantId.toUpperCase());
        if (existingIdx !== -1) {
          this.plants[existingIdx] = newPlant;
        } else {
          this.plants.unshift(newPlant);
        }
        count++;
      }

      this.savePlants();
      this.logAction('IMPORT_CSV', 'plant', 'IMPORT', `นำเข้าข้อมูล CSV สำเร็จ ${count} รายการ`);
      this.notify();
      return { success: true, importedCount: count, errors };
    } catch (err: any) {
      return { success: false, importedCount: 0, errors: [`การประมวลผลไฟล์ CSV ล้มเหลว: ${err.message}`] };
    }
  }

  public exportPlantsCSV(): string {
    // Preserve every imported CSV field when sourceData is available.
    const sourceRows = this.plants.filter((plant) => plant.sourceData && Object.keys(plant.sourceData).length > 0);
    if (sourceRows.length > 0) {
      const headers = Array.from(new Set(sourceRows.flatMap((plant) => Object.keys(plant.sourceData || {}))));
      const quote = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
      const rows = sourceRows.map((plant) => headers.map((header) => quote(plant.sourceData?.[header] ?? '')));
      return '\uFEFF' + [headers.map(quote).join(','), ...rows.map((row) => row.join(','))].join('\r\n');
    }
    const headers = [
      'รหัสพรรณไม้',
      'ชื่อไทย',
      'ชื่ออังกฤษ',
      'ชื่อวิทยาศาสตร์',
      'วงศ์พืช',
      'หมวดหมู่',
      'คำอธิบาย',
      'ความเชื่อและสิริมงคล',
      'ทิศมงคล',
      'แสงแดด',
      'การรดน้ำ',
      'ความปลอดภัยสัตว์เลี้ยง',
      'สภาพพื้นที่',
      'ระดับการดูแล',
      'รูปภาพ',
    ];

    const rows = this.plants.map((p) => [
      `"${p.plantId}"`,
      `"${p.thaiName.replace(/"/g, '""')}"`,
      `"${p.englishName.replace(/"/g, '""')}"`,
      `"${p.scientificName.replace(/"/g, '""')}"`,
      `"${p.family.replace(/"/g, '""')}"`,
      `"${p.categoryId}"`,
      `"${p.description.replace(/"/g, '""')}"`,
      `"${p.belief.culturalMeaning.replace(/"/g, '""')}"`,
      `"${(p.belief.auspiciousDirection || '').replace(/"/g, '""')}"`,
      `"${p.care.sunlight}"`,
      `"${p.care.water}"`,
      `"${p.safety.toxicityPets}"`,
      `"${p.spaceType}"`,
      `"${p.careLevel}"`,
      `"${p.images[0] || ''}"`,
    ]);

    // UTF-8 BOM for Microsoft Excel compatibility
    return '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  }

  public generateCSVTemplate(): string {
    const headers = [
      'รหัสพรรณไม้',
      'ชื่อไทย',
      'ชื่ออังกฤษ',
      'ชื่อวิทยาศาสตร์',
      'วงศ์พืช',
      'หมวดหมู่',
      'คำอธิบาย',
      'ความเชื่อและสิริมงคล',
      'ทิศมงคล',
      'แสงแดด',
      'การรดน้ำ',
      'ความปลอดภัยสัตว์เลี้ยง',
      'สภาพพื้นที่',
      'ระดับการดูแล',
      'รูปภาพ',
    ];

    const sampleRows = [
      [
        '"A05"',
        '"พิกุลทอง"',
        '"Bullet Wood"',
        '"Mimusops elengi L."',
        '"Sapotaceae"',
        '"cat-A"',
        '"ไม้ยืนต้นมงคล ดอกหอมชื่นใจ บูชาสิ่งศักดิ์สิทธิ์"',
        '"เสริมบารมี เกียรติยศ และความสงบร่มเย็น"',
        '"ทิศตะวันตกเฉียงใต้"',
        '"แดดจัดเต็มวัน"',
        '"รดน้ำวันเว้นวัน"',
        '"ปลอดภัยต่อสุนัขและแมว"',
        '"บ้านเดี่ยว/สวนกว้าง"',
        '"ดูแลง่าย"',
        '"/images/botanical_ratchaphruek_1791992174219.jpg"',
      ],
      [
        '"B05"',
        '"แก้วเจ้าจอม"',
        '"Lignum Vitae"',
        '"Guaiacum officinale L."',
        '"Zygophyllaceae"',
        '"cat-B"',
        '"ไม้พุ่มทรงพุ่มกลมสวย ดอกสีม่วงคราม"',
        '"เสริมปัญญา เกียรติยศ ความสง่างาม"',
        '"ทิศตะวันออก"',
        '"แดดจัดเต็มวัน"',
        '"รดน้ำทุกวัน"',
        '"ปลอดภัยต่อสุนัขและแมว"',
        '"ทาวน์โฮม/พื้นที่จำกัด"',
        '"ปานกลาง"',
        '"/images/botanical_thai_jasmine_1791992194924.jpg"',
      ],
    ];

    return '\uFEFF' + [headers.join(','), ...sampleRows.map((r) => r.join(','))].join('\r\n');
  }

  public exportBackup(): string {
    const data = {
      version: '2.0',
      system: 'SACRED CANOPY BOTANICAL ARCHIVE',
      exportedAt: new Date().toISOString(),
      plants: this.plants,
      categories: this.categories,
      articles: this.articles,
      faqs: this.faqs,
      registeredUsers: this.registeredUsers,
      contactMessages: this.contactMessages,
    };
    return JSON.stringify(data, null, 2);
  }

  public resetToDefault() {
    this.plants = INITIAL_PLANTS_DATA;
    this.categories = CATEGORIES_DATA;
    this.articles = INITIAL_ARTICLES_DATA;
    this.faqs = INITIAL_FAQS_DATA;
    this.registeredUsers = INITIAL_USERS;
    localStorage.removeItem(STORAGE_KEYS.PLANTS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.ARTICLES);
    localStorage.removeItem(STORAGE_KEYS.FAQS);
    localStorage.removeItem(STORAGE_KEYS.REGISTERED_USERS);
    this.notify();
  }
}

export const store = new StoreService();
