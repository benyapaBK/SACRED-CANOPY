# SACRED CANOPY — ตั้งค่า Firebase แบบไม่ใช้ Firebase Storage

## สิ่งที่โปรเจกต์ใช้
- Firebase Authentication: สมัคร/เข้าสู่ระบบด้วย Email/Password และ Google
- Cloud Firestore: โปรไฟล์สมาชิก, ข้อมูลพันธุ์ไม้/หมวดหมู่/บทความ/FAQ และข้อความติดต่อ
- Firebase Hosting: เผยแพร่เว็บ
- ไม่มีการใช้ Firebase Storage; ภาพหลักเก็บใน `public/images/` และภาพภายนอกใช้ HTTPS URL
- สิทธิ์แอดมินตรวจจาก Firebase Authentication Custom Claim `admin: true` เท่านั้น ไม่เชื่อ `role` จาก localStorage หรือจากการสมัครสมาชิก

## 1. ตั้งค่า Firebase Console
1. เปิดโปรเจกต์ `sacred-canopy-168ef` ที่ https://console.firebase.google.com/.
2. Authentication → Get started → Sign-in method: เปิด Email/Password และ Google.
3. Authentication → Settings → Authorized domains: เพิ่ม `localhost` และโดเมน Hosting ที่ใช้จริง (เช่น `sacred-canopy-99.web.app` หากตรงกับโปรเจกต์ของคุณ).
4. Firestore Database → Create database. เลือก production mode และตำแหน่งที่เหมาะกับผู้ใช้.
5. ยังไม่ต้องเปิด Storage.

## 2. ติดตั้งและทดสอบเว็บ
จากโฟลเดอร์โปรเจกต์:
```bash
npm install
npm run build
npm run dev
```

ค่า Firebase Web config อยู่ใน `src/services/firebase.ts` และเป็น config ฝั่ง client; ความปลอดภัยต้องอาศัย Firestore Rules และ Authentication ไม่ใช่การซ่อน apiKey.

## 3. Deploy Firestore Rules และเว็บ
ติดตั้ง Firebase CLI หากยังไม่มี แล้วเข้าสู่ระบบ:
```bash
npm install -g firebase-tools
firebase login
firebase use sacred-canopy-168ef
firebase deploy --only firestore:rules
npm run build
firebase deploy --only hosting
```

หากคำสั่ง `firebase use` แสดงว่าไม่มี project ให้เลือก ตรวจว่าบัญชี Google มีสิทธิ์เข้าถึง `sacred-canopy-168ef`.

## 4. เปิด Cloud Functions สำหรับจัดการสมาชิกโดยแอดมิน
Functions ใช้ Admin SDK เพื่อเปลี่ยน role/status/ลบบัญชี และไม่เปิดให้ client แก้ Custom Claims เอง:
```bash
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions
```
การ deploy Functions อาจต้องเปิดใช้ Billing/Blaze plan ตามข้อกำหนดปัจจุบันของ Firebase และ Google Cloud.

## 5. กำหนดบัญชีแอดมินคนแรกอย่างปลอดภัย
บัญชีแอดมินที่กำหนดไว้สำหรับโปรเจกต์นี้คือ `admin@gmail.com` แต่ระบบจะไม่ให้สิทธิ์แอดมินเพียงเพราะใช้อีเมลนี้ ต้องมีบัญชีใน Firebase Authentication และกำหนด Custom Claim `admin: true` ให้ด้วย

1. Firebase Console → Authentication → Users → Add user แล้วสร้างผู้ใช้ `admin@gmail.com` พร้อมรหัสผ่านที่คุณควบคุม (หากใช้รหัส `123456` ตามที่ร้องขอ โปรดทราบว่าเป็นรหัสที่เดาง่ายมากและควรเปลี่ยนเป็นรหัสผ่านที่ยาวและไม่ซ้ำกับบริการอื่นก่อนเปิดเว็บสู่สาธารณะ).
2. เข้าสู่ระบบเว็บไซต์ด้วยบัญชีดังกล่าวอย่างน้อยหนึ่งครั้ง.
2. ใน Firebase Console → Project settings → Service accounts สร้าง/ดาวน์โหลด private key สำหรับบัญชีบริการที่มีสิทธิ์เหมาะสม เก็บไว้นอกโฟลเดอร์โปรเจกต์และห้าม commit.
3. จากโฟลเดอร์โปรเจกต์ หลังติดตั้ง dependencies ใน `functions/` แล้ว รัน:
```bash
node scripts/set-admin.mjs "C:/secure/path/service-account.json" "admin@example.com"
```
แทน path และอีเมลด้วยค่าจริง อย่าแชร์ไฟล์ JSON ของ service account.
4. ออกจากระบบและเข้าสู่ระบบใหม่เพื่อให้ token รับ Custom Claim ล่าสุด.
5. แอดมินที่มี claim แล้วเท่านั้นจึงใช้ callable functions เปลี่ยนสิทธิ์สมาชิกได้. ปุ่ม “สำหรับผู้ดูแลระบบ” และรหัสทางเข้าหน้าผู้ดูแลเป็นเพียงขั้นตอน UI ไม่ใช่ตัวแทนของ Firebase Authentication/Custom Claims.

## 6. ภาพโดยไม่ใช้ Storage
- ไฟล์ภาพที่มากับเว็บ: วางใน `public/images/plants/` แล้วอ้างด้วย `/images/plants/ชื่อไฟล์.jpg`.
- ภาพภายนอก: ใช้ `https://...` URL ในฟิลด์ภาพของข้อมูลพันธุ์ไม้.
- ใช้เฉพาะภาพที่คุณมีสิทธิ์เผยแพร่. URL ภายนอกอาจหมดอายุหรือปิด hotlink ได้.

## ข้อควรทราบ
- บัญชีตัวอย่าง/บทบาทจำลองจาก localStorage รุ่นก่อนถูกเลิกใช้; สมาชิกต้องสมัครผ่าน Firebase Authentication ใหม่.
- ข้อมูลเดิมใน localStorage ไม่ได้ย้ายเข้า Firestore อัตโนมัติ.
- โปรเจกต์มี fallback ข้อมูลเว็บไซต์จากไฟล์/localStorage จนกว่าจะมีข้อมูลใน Firestore. การเขียนข้อมูลส่วนกลางไป Firestore ต้องเข้าสู่ระบบด้วยบัญชีที่มี Custom Claim แอดมิน.
- ห้ามใช้กฎ Firestore แบบ `allow read, write: if true` ในระบบจริง.


## ชุดข้อมูลพันธุ์ไม้ CSV ที่แนบมา

โครงการรวมข้อมูลจาก `mongkol-mai-2026-10-14.csv` จำนวน 70 รายการ 57 คอลัมน์ไว้ใน `src/data/mongkol-mai-data.json` และแปลงเป็นข้อมูลที่ใช้แสดงผลผ่าน `src/data/csvPlants.ts` โดยเก็บคอลัมน์ต้นฉบับทั้งหมดใน `sourceData` เพื่อให้หน้าแสดงรายละเอียดสามารถเปิดอ่านข้อมูลทุกช่องที่มีค่าได้ ภาพใช้ URL จากคอลัมน์ `ลิงก์รูปภาพ (URL)` โดยตรง ไม่มีการอัปโหลดไป Firebase Storage

รหัสต้นไม้ในชุดข้อมูลตรวจสอบตาม prefix ของหมวดหมู่: A=ไม้ยืนต้น, B=ไม้พุ่ม, C=ไม้ล้มลุก, D=ไม้เลื้อย, E=ไม้คลุมดิน, F=ต้นปาล์ม, G=ไม้อวบน้ำ, H=ไม้ไผ่ ทั้ง 70 รายการใน CSV ที่แนบมามีรหัสไม่ซ้ำและ prefix ตรงกับหมวดหมู่

## สิทธิ์แอดมิน

ลิงก์ “สำหรับผู้ดูแลระบบ” ที่หน้าเข้าสู่ระบบเป็นเพียงตัวเปิดหน้าล็อกอินและไม่ใช่ขอบเขตความปลอดภัยจริง หลังกรอกรหัสเปิดหน้าที่กำหนด ต้องเข้าสู่ระบบด้วยบัญชี Firebase ที่ได้รับ Custom Claim `admin: true` เท่านั้น การเข้าถึงข้อมูลแก้ไขยังถูกบังคับด้วย Firestore Security Rules และ Cloud Functions

**หมายเหตุ:** รหัสที่อยู่ในโค้ดหน้าเว็บสามารถถูกอ่านได้จากไฟล์ JavaScript ที่ดาวน์โหลดไปยังเบราว์เซอร์ จึงห้ามใช้รหัสดังกล่าวเป็นตัวป้องกันข้อมูลเพียงอย่างเดียว อย่าเปิดสิทธิ์ Firestore แบบ public write


## การแสดงผลตามบทบาท

- ผู้เยี่ยมชมที่ยังไม่เข้าสู่ระบบ: เปิดดูหน้าแรก ฐานข้อมูล หมวดหมู่ คติความเชื่อ บทความ ช่วยเหลือ เกี่ยวกับเรา และติดต่อเราได้ รวมถึงค้นหาต้นไม้และเปิดรายละเอียดได้; ไม่สามารถบันทึกรายการโปรด เล่น Quiz หรือส่งออก CSV; การกดหัวใจ/เมนูรายการโปรด/เมนู Quiz จะเปิดหน้าต่างแนะนำให้เข้าสู่ระบบหรือสมัครสมาชิก และปิดหน้าต่างเพื่อกลับไปดูข้อมูลต่อได้
- สมาชิก Firebase: ใช้เมนูฐานข้อมูล รายการโปรด และแบบทดสอบได้ และส่งออกข้อมูล CSV จากหน้าฐานข้อมูลได้

- ผู้ดูแลระบบ: ใช้บัญชี Firebase บัญชีเดียวที่ได้รับ Custom Claim `admin: true` เพื่อจัดการข้อมูล
- รหัส `admin123456` ใช้เปิดหน้าล็อกอินแอดมินเท่านั้น ไม่ใช่รหัสผ่านของบัญชี Firebase และไม่สามารถยกระดับสิทธิ์ด้วยตัวเอง

## นำเข้า CSV ครั้งแรก

เมื่อแอดมินที่มี Custom Claim เข้าระบบครั้งแรก ระบบจะนำข้อมูล CSV ทั้ง 70 รายการเข้า Firestore ที่ `plants/{ID}` พร้อมบันทึกเครื่องหมายใน `system/mongkol-mai-2026-10-14` เพื่อไม่ให้เขียนทับการแก้ไขในอนาคตซ้ำอีกครั้ง หากเคยสร้างข้อมูลใน Firestore ไว้แล้วและต้องการนำเข้าชุด CSV ใหม่อีกครั้ง ให้สำรองข้อมูลก่อน แล้วดำเนินการนำเข้าโดยผู้ดูแลระบบอย่างตั้งใจ ไม่ควรลบเครื่องหมาย import โดยไม่สำรองข้อมูล


## หน้าติดต่อเราและผู้สร้างเว็บไซต์
- แอดมินที่มี Custom Claim สามารถแก้ไขข้อมูลผู้สร้าง 3 คนได้ในหน้าติดต่อเรา โดยกำหนดชื่อ หน้าที่ อีเมล โทรศัพท์ ประวัติย่อ และรูปภาพ
- เนื่องจากไม่ได้ใช้ Firebase Storage สามารถใช้ URL ภาพภายนอก หรือเลือกไฟล์ภาพขนาดไม่เกิน 100 KB เพื่อฝังใน Firestore ได้
- เอกสาร `siteSettings/contactCreators` อ่านได้จากสาธารณะ แต่เขียนได้เฉพาะแอดมินตาม `firestore.rules`.

## ผู้ช่วยน้องต้นกล้า
- ตอบคำถามจากข้อมูลพันธุ์ไม้และ FAQ ที่โหลดอยู่ในเว็บไซต์ และแนะนำวิธีใช้งานให้ผู้เยี่ยมชม สมาชิก และแอดมินได้
- หากคำถามต้องใช้ข้อมูลล่าสุดจากอินเทอร์เน็ต จะแสดงลิงก์ค้นหาเว็บให้เปิดดู ไม่ได้เรียก AI หรือดึงเว็บแบบสดโดยตรง เพราะโปรเจกต์นี้ยังไม่ได้ตั้งค่า backend/API key สำหรับบริการค้นหา/AI ภายนอก
