# Wentric Employee Telegram Bot (v1.0)

Ushbu bot Wentric Corporation xodimlari nazorati va guruh chat tahlili uchun maxsus ishlab chiqilgan professional Python botdir.

## 🚀 Asosiy imkoniyatlar:
1. **Resident Card Nazorati**: Guruhda yozgan har bir shaxsning SQLite bazasida 'ID' (masalan: DEV-004) borligi tekshiriladi. Agar xodim bo'lmasa, ogohlantiriladi va 30 soniya ichida o'zini tasdiqlamasa guruhdan chiqariladi (yoki mute beriladi).
2. **Warn Tizimi**: Adminlar foydalanuvchilarga ogohlantirish bera oladi (`/warn @username`). Warn 5 taga yetsa, avtomatik ravishda guruhdan chiqariladi va KPI 5 ballga kamayadi.
3. **AI Chat Analyzer (Gemini 2.5 Flash)**: Har kunlik chat yozishmalarini SQLite3 bazasida saqlab, Gemini AI orqali tahlil qilib, o'zbek tilida kunlik/haftalik hisobotlar yaratadi.
4. **Kunlik SQLite Zaxiralash**: Har kuni ma'lumotlar bazasi zaxira nusxasi yaratiladi.
5. **Haftalik PDF Hisobot**: Xodimlar reytingi va kpi natijalari PDF formatida generatsiya qilinib, guruhga yuboriladi (`/pdf` buyrug'i orqali).

---

## 🛠 O'rnatish va Ishga tushirish:

### 1. Fayllarni yuklab oling va virtual muhit yarating:
```bash
# Virtual muhitni yaratish va faollashtirish
python3 -m venv venv
source venv/bin/activate  # Windows uchun: venv\Scripts\activate

# Dependency-larni o'rnatish
pip install -r requirements.txt
```

### 2. `.env` faylini sozlash:
Workspace root-dagi `.env` fayliga o'z bot tokeningiz hamda Gemini API kalitingizni kiriting:
```env
TELEGRAM_BOT_TOKEN="BOT_TOKEN_SHU_YERDA"
GEMINI_API_KEY="GEMINI_API_KEY_SHU_YERDA"
GROUP_ID="-100xxxxxxxxxx" # Monitoring qilinadigan guruh IDsi (Majburiy emas, lekin guruhda ishlash uchun kerak)
```

### 3. Botni ishga tushirish:
```bash
python3 bot.py
```

### 4. Ma'lumotlar bazasi:
Bot ishga tushishi bilan avtomatik ravishda `wentric_employees.db` nomli SQLite3 faylini yaratadi va dastlabki xodimlarni (Ilyos, Sardorbek, Javoxir) bazaga kiritadi.
