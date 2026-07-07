import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Analyze chat messages using Gemini AI
  app.post("/api/analyze", async (req, res) => {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Tahlil qilish uchun xabar loglari yuborilmadi." });
    }

    const logText = messages
      .map((m: any) => `${m.senderUsername || "NoUsername"} (${m.senderName}): ${m.text}`)
      .join("\n");

    const prompt = `Siz Wentric Corporation korporativ tahlilchi sun'iy intellektisiz.
Quyida guruh chatidan olingan oxirgi xabarlar keltirilgan:

${logText}

Iltimos, ushbu chat loglarini chuqur tahlil qiling va o'zbek tilida professional, chiroyli va tushunarli formatlangan hisobot bering. Hisobot quyidagi bo'limlardan iborat bo'lsin:
1. **Suhbat faolligi xulosasi**: Asosiy muhokama qilingan mavzular nima bo'ldi va umumiy muhit qanday?
2. **Kompaniya xavfsizligi va Resident Card nazorati**: Tizimda ro'yxatdan o'tmagan (isUnregistered: true) bo'lgan shaxslar yozdimi? Guruh xavfsizligi buzildimi?
3. **KPI va intizom tavsiyalari**: Chatdagi xabarlar mazmunidan kelib chiqib, qaysi xodimlarning KPI ko'rsatkichini oshirish kerak yoki kimga ogohlantirish (Warning) berish lozim? Aniq sabablar keltiring.
4. **Kelgusi rejalar va xulosa**: Ish jarayonini yaxshilash bo'yicha amaliy tavsiyalar.`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      // Return beautiful mock simulation report when API key is missing
      return res.json({
        report: `### 📊 Wentric AI - Chat Tahlili Hisoboti (Simulyatsiya Rejimi)

> ⚠️ *Eslatma: Tizimda \`GEMINI_API_KEY\` o'rnatilmagan. Quyida siz uchun tayyorlangan aqlli simulyatsiya hisoboti keltirilgan:*

#### 1. 💬 Suhbat faolligi xulosasi
- Bugun guruhda backend texnologiyalari, botni SQLite ma'lumotlar bazasi bilan ulash hamda xavfsizlik protokollari qizg'in muhokama qilindi.
- Xodimlar o'rtasida muloqot juda professional va maqsadga yo'naltirilgan.

#### 2. 🛡 Kompaniya xavfsizligi va Resident Card nazorati
- **Xavf darajasi: YUQORI.** Chatda tizimda ro'yxatdan o'tmagan shaxslar (masalan, ID kartasi yo'q foydalanuvchilar) xabar yozishga harakat qildi.
- **Bot javobi**: Wentric Employee Bot ushbu shaxsni darhol aniqladi, guruhda maxfiy ID kartasi yo'qligini ko'rsatib, ogohlantirish e'lon qildi.

#### 3. 📈 KPI va intizom tavsiyalari
- **Hasanov Ilyos (@hasanov_ilyos)**: Backend dasturchi sifatida guruh xavfsizlik botining Python kodini professional darajada tushuntirib berdi va faol takliflar kiritdi. KPI ko'rsatkichini **+5% ga oshirish** va **$500 bonus** berish tavsiya etiladi.
- **Unregistered Foydalanuvchilar**: Guruhga ID kartasiz kirgan foydalanuvchini guruhdan chiqarish yoki **mute** qilish tavsiya qilinadi.

#### 4. 🚀 Kelgusi rejalar va xulosa
- Har bir guruh a'zosining \`wentric_employees.db\` bazasida ro'yxatdan o'tganligini tekshirish jarayonini 100% avtomatlashtirish kerak.
- Har haftalik hisobotlarni avtomatik ravishda PDF ko'rinishida admin elektron pochtasiga yuborish jadvalini qat'iy saqlang.`
      });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      res.json({ report: response.text });
    } catch (err: any) {
      res.status(500).json({ error: `AI tahlili xatosi: ${err.message}` });
    }
  });

  // API Route: Simulated database backup / JSON download of report
  app.get("/api/db-backup", (req, res) => {
    res.setHeader("Content-Disposition", "attachment; filename=wentric_employees_backup.sql");
    res.setHeader("Content-Type", "text/plain");
    
    const sqlBackup = `-- Wentric Corporation SQLite3 Database Backup Dump
-- Created at: ${new Date().toISOString()}

PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;

CREATE TABLE employees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    position TEXT NOT NULL,
    grade TEXT NOT NULL,
    department TEXT NOT NULL,
    manager TEXT NOT NULL,
    status TEXT DEFAULT 'Active',
    kpi INTEGER DEFAULT 100,
    bonus REAL DEFAULT 0,
    warnings INTEGER DEFAULT 0,
    vacation_days INTEGER DEFAULT 12
);

INSERT INTO employees VALUES('CEO-001','Sardorbek Rakhmonov','@sardor_ceo','CEO','G15','Executive','Kengash','Online',98,2500,0,20);
INSERT INTO employees VALUES('DEV-004','Hasanov Ilyos','@hasanov_ilyos','Backend Developer','G10','Engineering','CTO','Online',95,500,0,12);
INSERT INTO employees VALUES('CTO-002','Javoxirjon To\\'rayev','@javoxir_cto','CTO','G14','Engineering','CEO','Online',96,1500,0,18);
INSERT INTO employees VALUES('COO-003','Malika Solihova','@malika_coo','COO','G14','Operations','CEO','Online',91,1000,1,14);
INSERT INTO employees VALUES('CISO-005','Alisher Ubaydullayev','@alisher_sec','CISO','G14','Security','CEO','Online',94,800,0,15);

CREATE TABLE warning_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    username TEXT NOT NULL,
    reason TEXT NOT NULL,
    level INTEGER NOT NULL,
    issuer TEXT NOT NULL
);

INSERT INTO warning_logs VALUES(1,'2026-07-07T10:00:00','@malika_coo','Kunlik hisobot topshirilmagan',1,'System Admin');

COMMIT;
`;
    res.send(sqlBackup);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode.`);
  });
}

startServer();
