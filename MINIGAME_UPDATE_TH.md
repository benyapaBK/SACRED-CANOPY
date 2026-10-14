# SACRED CANOPY — อัปเดตหน้าเกมและสมาชิก

## สิ่งที่ปรับ

- เพิ่มคำว่า **Home** ใต้ชื่อแบรนด์/คำโปรยในแถบส่วนหัว โดยจำกัดขนาดให้ยังอยู่ในความสูงของแถบนำทาง
- เพิ่มตัวกรองค้นหาสมาชิกตามชื่อและอีเมลใน Admin Dashboard
- ตารางสมาชิกแสดงชื่อ อีเมล วิธีสมัคร (Google หรืออีเมล/รหัสผ่าน) วันที่สมัครครั้งแรก บทบาท และสถานะบัญชี
- เปลี่ยนการจัดการบทบาทให้ใช้ dropdown เลือก Member/Admin และเรียก Cloud Function `setUserRole` จริง
- เปลี่ยนหน้า Quiz เดิมให้เป็นมินิเกม **สวนจิ๋วของฉัน**: เลือกฉากระเบียง/หน้าต่าง/สวนหน้าบ้าน เลือกชุดตัวละคร ปลูกต้นไม้ในฉาก เลือกของตกแต่ง ทำภารกิจและสะสม XP
- เซฟชื่อสวน ฉาก รายการต้นไม้ ของตกแต่ง และตัวละครไว้ในเอกสาร `users/{uid}` ฟิลด์ `gardenGameSave` ของบัญชีสมาชิกที่เข้าสู่ระบบ
- ปรับ Firestore Rules ให้เจ้าของบัญชีเขียนได้เฉพาะฟิลด์เซฟเกมของตนเอง พร้อมตรวจสอบขนาดและค่าที่อนุญาต โดยยังป้องกันไม่ให้สมาชิกแก้ `role`, `status`, `uid` หรือ `email`

## นำไฟล์ไปใช้กับโฟลเดอร์ที่เชื่อม GitHub อยู่แล้ว

ไฟล์ ZIP นี้ตั้งใจไม่รวม `.git`, `node_modules` และ `dist` เพื่อไม่ทับประวัติ Git หรือไฟล์ติดตั้งในเครื่อง ให้แตก ZIP แล้วคัดลอกไฟล์ทับโฟลเดอร์โปรเจกต์เดิม (เก็บโฟลเดอร์ `.git` ของเดิมไว้)

## ทดสอบและเผยแพร่จาก VS Code (Windows PowerShell)

จากโฟลเดอร์หลักที่มี `package.json` ให้รัน:

```powershell
npm install
npm run build
git status
```

ถ้า build ผ่าน ตรวจสอบ `git status` และยืนยันว่าไม่มีไฟล์ข้อมูลรับรอง/Secret ก่อน แล้วจึงบันทึกและส่งขึ้น GitHub:

```powershell
git add src/App.tsx src/components/Header.tsx src/pages/AdminPage.tsx src/pages/QuizPage.tsx src/services/store.ts firestore.rules MINIGAME_UPDATE_TH.md
git commit -m "Add garden mini game and user role table"
git push origin main
```

Deploy หน้าเว็บไซต์:

```powershell
firebase use sacred-canopy-168ef
firebase deploy --only hosting
```

เพื่อให้บันทึกเกมได้ ต้อง Deploy Firestore Rules ฉบับที่มากับ ZIP ด้วย:

```powershell
firebase deploy --only firestore:rules
```

## หมายเหตุสำคัญ

- เกมนี้ใช้ภาพประกอบแบบ CSS และ emoji ที่ฝังใน UI จึงไม่ต้องใช้ Firebase Storage
- การบันทึกเกมใช้ Firestore ต้องมีเอกสาร `users/{uid}` ของสมาชิกและต้องใช้ Rules ฉบับนี้หรือ Rules ที่อนุญาตฟิลด์ `gardenGameSave` อย่างเทียบเท่า
- การกำหนดบทบาท Admin ยังต้องใช้ Custom Claims และ Cloud Function `setUserRole` ที่ Deploy แล้ว
- ในสภาพแวดล้อมที่สร้าง ZIP นี้ ตรวจ TypeScript ของแอปที่ import ผ่าน `src/App.tsx` แล้วผ่าน แต่ Vite production build ในเครื่องสร้างไฟล์นี้รันไม่ได้ เนื่องจาก dependencies ที่แนบมามี Rollup native binary สำหรับ Windows ขณะที่สภาพแวดล้อมตรวจสอบเป็น Linux ให้รัน `npm install` และ `npm run build` บน Windows ของคุณก่อน Deploy
