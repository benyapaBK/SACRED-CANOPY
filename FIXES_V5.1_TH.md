# SACRED CANOPY V.5.1 — แก้ประกาศ แบนเนอร์ กระดิ่ง และมาสคอต

## สิ่งที่แก้
- หน้า Home แสดงแบนเนอร์แบบสไลด์ เปลี่ยนอัตโนมัติทุก 6.5 วินาที และมีปุ่มก่อนหน้า/ถัดไป/จุดเลือกสไลด์
- หากมีประกาศหรือกิจกรรมที่เปิดใช้งาน จะนำมาแสดงในสไลด์ก่อน หากไม่มีจะใช้สไลด์ความรู้เกี่ยวกับเว็บไซต์ 3 รายการ
- ทำ normalization รองรับข้อมูลประกาศเก่าที่ใช้ฟิลด์ `description`, `content`, `body`, `active`, `isActive`, `published`, `isPublished`, `startDate` หรือ `endDate`
- แก้สถานะกระดิ่งให้รวมประกาศจาก maintenance และกิจกรรมโดยแยก state กัน ป้องกัน listener ตัวหนึ่งเขียนทับข้อมูลของอีกตัว
- หน้าช่วยเหลืออ่านประกาศผ่าน normalization แบบเดียวกับหน้า Home และกระดิ่ง
- ขยายมาสคอต และคงการกลับด้านด้วย `scaleX(-1)` เพื่อให้แสดงทิศทางตามที่ตั้งใจ
- ปรับขนาดหน้าต่างแชทให้ลากมุมเพื่อย่อ/ขยายได้ และจำกัดขนาดตาม viewport

## วิธีทดสอบใน Windows / VS Code
1. แตก ZIP
2. เปิด Terminal ที่โฟลเดอร์หลัก (ระดับเดียวกับ `package.json` และ `firebase.json`)
3. รัน:
   ```powershell
   npm install
   npm run build
   npm run dev
   ```
4. ทดสอบหน้า Home, กระดิ่ง และหน้าช่วยเหลือ
5. เมื่อ Build ผ่านและทดสอบแล้ว ค่อย Deploy:
   ```powershell
   firebase use sacred-canopy-168ef
   firebase deploy --only firestore:rules,hosting:sacred-canopy-99
   ```

## ถ้ายังไม่ขึ้น
- ตรวจ Firestore ว่ามีเอกสารใน `siteActivities` หรือ `siteSettings/maintenanceNotice`
- เอกสารประกาศต้องมีหัวข้อและข้อความ และต้องเปิดใช้งาน (`enabled: true` หรือฟิลด์สถานะที่ normalization รองรับ)
- ถ้ามี `startAt`/`endAt` หรือ `startDate`/`endDate` ให้ตรวจว่าครอบคลุมเวลาปัจจุบัน
- `siteActivities` ต้องอ่านได้สาธารณะ และ `siteSettings/maintenanceNotice` ต้องอ่านได้ตาม `firestore.rules` ที่แนบมา
- เปิด F12 > Console เพื่อตรวจ error; ถ้าเป็น permission error ต้องแก้ Rules/สิทธิ์ Admin ไม่ใช่ CSS
