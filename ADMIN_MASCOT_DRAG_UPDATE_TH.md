# อัปเดต: ผู้ดูแลลากตำแหน่งน้องต้นกล้าได้

- ผู้ใช้ role `admin` สามารถกดเมาส์ค้างบนรูปน้องต้นกล้าแล้วลากไปตำแหน่งใหม่ได้
- ตำแหน่งบันทึกไว้ที่ Firestore `siteSettings/mascotPosition` และส่งต่อแบบ real-time ให้ผู้เข้าชมทุกคน
- ผู้ใช้ role อื่นลากไม่ได้
- Firestore Rules อนุญาตให้ทุกคนอ่านเฉพาะเอกสารตำแหน่งมาสคอต แต่การเขียนยังจำกัดด้วย `isAdmin()` ตามระบบสิทธิเดิม (Firebase Admin custom claim)
- ต้อง Deploy ทั้ง Firestore Rules และ Hosting เพื่อให้สิทธิการอ่านตำแหน่งทำงาน: `firebase deploy --only firestore:rules,hosting`

ตรวจสอบให้แน่ใจว่าบัญชีผู้ดูแลได้รับ custom claim `admin: true` อยู่แล้ว เพราะ Rules เดิมของโปรเจกต์ใช้ custom claim เป็นตัวตัดสินสิทธิจริง
