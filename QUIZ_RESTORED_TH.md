# SACRED CANOPY — คืนหน้า Quiz แบบประเมินต้นไม้ที่เหมาะกับคุณ

## สิ่งที่เปลี่ยน
- เปลี่ยนหน้า `src/pages/QuizPage.tsx` จากมินิเกมจัดสวนกลับเป็นแบบประเมิน 6 คำถาม
- ประเมินจากวัตถุประสงค์ ความเหมาะสมของพื้นที่ แสงแดด เวลาในการดูแล ความปลอดภัยต่อสัตว์เลี้ยง/เด็ก และสไตล์ต้นไม้ที่ชอบ
- แสดงต้นไม้แนะนำ 3 อันดับ คะแนนความเข้ากันได้ เหตุผล และคำเตือนตามข้อมูลในฐาน
- ผู้เยี่ยมชมทั่วไปจะถูกขอให้เข้าสู่ระบบหรือสมัครสมาชิกก่อนทำแบบประเมิน
- บันทึกประวัติผลประเมิน 10 ครั้งล่าสุดไว้ใน `users/{uid}.quizHistory` ของบัญชีสมาชิก
- ปรับ `firestore.rules` ให้สมาชิกแก้ `quizHistory` ของตนได้ แต่ยังห้ามแก้ `role`, `status`, `email` หรือ `uid` ผ่านหน้าเว็บ

## ติดตั้ง/ทดสอบบน Windows ใน VS Code
จากโฟลเดอร์หลักของโปรเจกต์:

```powershell
npm install
npm run build
```

หาก Build ผ่าน ให้ Deploy Firestore Rules ก่อน เพราะการบันทึกประวัติใช้ฟิลด์ `quizHistory`:

```powershell
firebase use sacred-canopy-168ef
firebase deploy --only firestore:rules
```

จากนั้นบันทึกโค้ดขึ้น GitHub และ Deploy Hosting:

```powershell
git status
git add src/App.tsx src/pages/QuizPage.tsx firestore.rules QUIZ_RESTORED_TH.md
git commit -m "Restore plant suitability questionnaire"
git push origin main
firebase deploy --only hosting
```

> หมายเหตุ: ก่อน `git add` ให้ตรวจ `git status` และอย่า commit ไฟล์ Service Account JSON, Application Default Credentials หรือสคริปต์ตั้งสิทธิ์แอดมินชั่วคราว

## ข้อมูลที่บันทึก
เก็บสูงสุด 10 ประวัติล่าสุดต่อบัญชี โดยบันทึกคำตอบ รหัสต้นไม้ที่แนะนำ คะแนน เหตุผล และวันที่ประเมินในโปรไฟล์ Firestore ของสมาชิกคนนั้น ไม่บันทึกรหัสผ่านหรือข้อมูลลับ
