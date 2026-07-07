import { Employee, EmployeeStatus, Project } from "./types";

export const COMPANY_CONSTITUTION = {
  mission: "Kompaniyamizning missiyasi - innovatsion texnologiyalar, sun'iy intellekt va mukammal muhandislik yechimlari orqali biznes jarayonlarini avtomatlashtirish, inson resurslaridan unumli foydalanish va korporativ boshqaruvni yangi darajaga olib chiqish.",
  vision: "WCEMS tizimi orqali dunyo miqyosidagi texnologik yetakchilikni ta'minlash, har bir xodimning salohiyatini to'liq ochish va ochiq-oshkora, adolatli hamda yuqori samarali mehnat madaniyatini shakllantirish.",
  values: [
    { title: "Intizom va Sifat", desc: "Har bir topshiriq va kod qatori mukammal darajaga yetkaziladi va kompaniya qoidalariga qat'iy rioya etiladi." },
    { title: "Shaffoflik", desc: "Xodimlar faoliyati, KPI, bonus va ogohlantirishlar shaffof tizim orqali barcha uchun ochiq ko'rinadi." },
    { title: "Doimiy Rivojlanish", desc: "Yangi g'oyalar, doimiy o'qish, sertifikatlar va mahorat darajalarini oshirish (Grade tizimi) qo'llab-quvvatlanadi." },
    { title: "Jamoaviy birdamlik", desc: "Xodimlararo hurmat, bir-biriga ko'mak va ochiq muloqot muvaffaqiyatimiz garovidir." }
  ],
  ethics: [
    "Kompaniya sirlari va intellektual mulkini qat'iy sir saqlash.",
    "Hamkasblarga nisbatan professional va hurmat bilan munosabatda bo'lish.",
    "Korporativ Discord va guruhlarda yozishganda etika va tozalik qoidalariga rioya qilish.",
    "Ish vaqtidan samarali foydalanish va kunlik hisobotlarni o'z vaqtida topshirish."
  ],
  discipline: [
    "Kunlik hisobot topshirilmasa yoki kechiktirilsa intizomiy chora qo'llanishi mumkin.",
    "Guruhda resident ID kartasi bo'lmagan shaxs yozsa, guruh xavfsizligi va maxfiyligi uchun u ogohlantiriladi va chiqarib yuboriladi.",
    "Ogohlantirishlar (Warning) soni 5 taga yetsa, ish shartnomasi bekor qilinishi ko'rib chiqiladi."
  ]
};

export const GRADES_LIST = [
  { grade: "G15", title: "CEO", minSalary: "10,000$", maxSalary: "25,000$", desc: "Bosh ijrochi direktor. Strategik boshqaruv." },
  { grade: "G14", title: "C-Level (CTO, COO, CFO, CMO, CISO)", minSalary: "6,000$", maxSalary: "12,000$", desc: "Bo'limlar bo'yicha bosh direktorlar." },
  { grade: "G13", title: "Director", minSalary: "4,500$", maxSalary: "8,000$", desc: "Katta yo'nalishlar bo'yicha rahbarlar." },
  { grade: "G12", title: "Department Manager", minSalary: "3,500$", maxSalary: "6,000$", desc: "Departament boshliqlari." },
  { grade: "G11", title: "Team Lead", minSalary: "2,500$", maxSalary: "4,500$", desc: "Jamoa yetakchilari, texnik va etika nazoratchilari." },
  { grade: "G10", title: "Senior Professional", minSalary: "1,800$", maxSalary: "3,500$", desc: "Mustaqil va murakkab yechimlar yaratuvchi mutaxassis." },
  { grade: "G9", title: "Middle Professional", minSalary: "1,100$", maxSalary: "2,000$", desc: "Asosiy ishlab chiqaruvchi kuch, topshiriqlarni sifatli bajaradi." },
  { grade: "G8", title: "Junior Professional", minSalary: "600$", maxSalary: "1,200$", desc: "Amaliyot va qo'llab-quvvatlash ostida ishlovchi xodim." },
  { grade: "G7", title: "Intern (Stajyor)", minSalary: "200$", maxSalary: "500$", desc: "O'rganish va sinov davridagi nomzod." },
  { grade: "G6", title: "Assistant", minSalary: "400$", maxSalary: "800$", desc: "Ma'muriy va texnik yordamchilar." },
  { grade: "G5", title: "Support Staff", minSalary: "300$", maxSalary: "600$", desc: "Mijozlar bilan aloqa va texnik yordam ko'rsatuvchilar." },
  { grade: "G1", title: "Guest / Visitor", minSalary: "0$", maxSalary: "0$", desc: "Tizimga vaqtincha ruxsat olgan mehmon." }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: "CEO-001",
    name: "Sardorbek Rakhmonov",
    username: "@sardor_ceo",
    position: "CEO",
    grade: "G15",
    department: "Executive",
    team: "Administration",
    manager: "Kompaniya Kengashi",
    startDate: "2024-01-01",
    status: EmployeeStatus.ONLINE,
    kpi: 98,
    okr: "Kompaniyani global bozorga olib chiqish, daromadni 2 barobar oshirish va tizimni 100% avtomatlashtirish.",
    bonus: 2500,
    warningCount: 0,
    vacationDays: 20,
    certificates: ["Harvard Business Analytics", "PMP"],
    completedProjects: ["Wentric Enterprise Platform v1", "WCEMS Ecosystem"],
    skills: ["Strategic Management", "Finances", "Public Relations", "Leadership"],
    permissions: ["Full Access", "Add Employee", "Fire Employee", "Salary Control", "Audit Logs", "System Admin"]
  },
  {
    id: "DEV-004",
    name: "Hasanov Ilyos",
    username: "@hasanov_ilyos",
    position: "Backend Developer",
    grade: "G10",
    department: "Engineering",
    team: "Backend Team",
    manager: "CTO",
    startDate: "2025-05-10",
    status: EmployeeStatus.ONLINE,
    kpi: 95,
    okr: "Yuqori yuklamalarga chidamli API server ishlab chiqish, ma'lumotlar bazasini optimallashtirish.",
    bonus: 500,
    warningCount: 0,
    vacationDays: 12,
    certificates: ["AWS Certified Solutions Architect", "MongoDB Professional"],
    completedProjects: ["Core Payment API", "Discord Bot Integrator"],
    skills: ["Python", "Asyncio", "PostgreSQL", "Docker", "Redis", "FastAPI"],
    permissions: ["Git Push", "Deploy Staging", "View Database", "Jira Write"]
  },
  {
    id: "CTO-002",
    name: "Javoxirjon To'rayev",
    username: "@javoxir_cto",
    position: "CTO",
    grade: "G14",
    department: "Engineering",
    team: "Technology Leadership",
    manager: "CEO",
    startDate: "2024-02-15",
    status: EmployeeStatus.ONLINE,
    kpi: 96,
    okr: "Texnologik infratuzilmani 99.9% uptime darajasida saqlash, AI laboratoriyasini to'liq yo'lga qo'yish.",
    bonus: 1500,
    warningCount: 0,
    vacationDays: 18,
    certificates: ["Google Cloud Professional Architect", "Certified Kubernetes Administrator"],
    completedProjects: ["Cloud Migration 2025", "AI Chat Integration Core"],
    skills: ["System Architecture", "AI Labs", "Infrastructure Engineering", "DevOps"],
    permissions: ["Server Root", "Git Admin", "Deploy Production", "Database Admin", "Manage Developers"]
  },
  {
    id: "COO-003",
    name: "Malika Solihova",
    username: "@malika_coo",
    position: "COO",
    grade: "G14",
    department: "Operations",
    team: "Project Management Office",
    manager: "CEO",
    startDate: "2024-03-20",
    status: EmployeeStatus.ONLINE,
    kpi: 91,
    okr: "Operatsion samaradorlikni 30% ga oshirish va HR jarayonlarini to'liq tizimlashtirish.",
    bonus: 1000,
    warningCount: 1,
    vacationDays: 14,
    certificates: ["Lean Six Sigma Green Belt", "Agile Coach Cert"],
    completedProjects: ["Sprint Optimization v3", "Onboarding Refactoring"],
    skills: ["Operations Management", "Agile Methodologies", "HR Strategy", "Conflict Resolution"],
    permissions: ["View Attendance", "Manage Tasks", "Approve Leave", "HR Platform Edit"]
  },
  {
    id: "CISO-005",
    name: "Alisher Ubaydullayev",
    username: "@alisher_sec",
    position: "CISO",
    grade: "G14",
    department: "Security",
    team: "Red Team",
    manager: "CEO",
    startDate: "2025-01-10",
    status: EmployeeStatus.ONLINE,
    kpi: 94,
    okr: "Kompaniya serverlarini kiber-hujumlardan 100% himoya qilish, xodimlarni phishing testlaridan o'tkazish.",
    bonus: 800,
    warningCount: 0,
    vacationDays: 15,
    certificates: ["CISSP", "OSCP (Offensive Security)"],
    completedProjects: ["SecOps Pipeline v1", "Internal Pentest Report"],
    skills: ["Ethical Hacking", "Intrusion Detection", "Threat Hunting", "Compliance Audit"],
    permissions: ["Security Root", "Audit System Logs", "Block Access", "Access Logs"]
  },
  {
    id: "MKT-006",
    name: "Laylo Karimova",
    username: "@laylo_brand",
    position: "CMO",
    grade: "G14",
    department: "Marketing",
    team: "Branding",
    manager: "CEO",
    startDate: "2024-09-01",
    status: EmployeeStatus.VACATION,
    kpi: 88,
    okr: "Wentric brendini ijtimoiy tarmoqlarda tanilishini 500,000 foydalanuvchiga yetkazish.",
    bonus: 400,
    warningCount: 0,
    vacationDays: 8,
    certificates: ["Digital Marketing Academy", "SEO Master Cert"],
    completedProjects: ["Summer Marketing Drive", "Logo Redesign 2025"],
    skills: ["SMM", "Branding", "Content Writing", "Video Marketing"],
    permissions: ["Social Accounts Admin", "Marketing Budget Control", "Brand Guidelines Edit"]
  },
  {
    id: "SUP-012",
    name: "Bekzod Shukurov",
    username: "@bekzod_support",
    position: "Support Lead",
    grade: "G11",
    department: "Operations",
    team: "Support",
    manager: "COO",
    startDate: "2025-02-18",
    status: EmployeeStatus.ONLINE,
    kpi: 97,
    okr: "Mijozlar so'rovlarini qayta ishlash tezligini 3 daqiqadan pastga tushirish.",
    bonus: 600,
    warningCount: 0,
    vacationDays: 10,
    certificates: ["ITIL Foundation", "Customer Success Professional"],
    completedProjects: ["Support Ticket Portal v2", "FAQ Bot Engine"],
    skills: ["Conflict Resolution", "Technical Writing", "Customer Care", "Jira Service Desk"],
    permissions: ["Manage Tickets", "Customer Database View", "Support Logs Write"]
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: "PRJ-01",
    title: "Wentric Employee Bot (aiogram)",
    description: "SQLite bazali, xodim ID kartalarini tekshiruvchi, AI guruh chat tahlilchisi va PDF hisobot jo'natuvchi Telegram Bot.",
    department: "Engineering",
    status: "In Progress",
    assignees: ["DEV-004", "CTO-002"],
    progress: 75
  },
  {
    id: "PRJ-02",
    title: "AI Security Pentest Core",
    description: "Tizim ma'lumotlar xavfsizligini tekshiruvchi avtomatlashtirilgan sun'iy intellekt moduli.",
    department: "Security",
    status: "Backlog",
    assignees: ["CISO-005"],
    progress: 20
  },
  {
    id: "PRJ-03",
    title: "Corporate Brand Book v2",
    description: "Kompaniya logotipi, ranglar uyg'unligi va rasmiy slaydlar to'plamini qaytadan yangilash loyihasi.",
    department: "Marketing",
    status: "Production",
    assignees: ["MKT-006"],
    progress: 100
  },
  {
    id: "PRJ-04",
    title: "WCEMS Web Dashboard",
    description: "Xodimlar faoliyatini boshqarish va simulyatorlar bilan ishlash uchun React asosidagi platforma.",
    department: "Executive",
    status: "Code Review",
    assignees: ["CTO-002", "CEO-001"],
    progress: 90
  }
];

export const DISCORD_STRUCTURE = [
  {
    category: "📢 INFORMATION",
    channels: ["announcements", "rules", "constitution", "hr-news"]
  },
  {
    category: "👑 EXECUTIVE",
    channels: ["ceo-office", "board-meeting", "executive-chat"]
  },
  {
    category: "💻 ENGINEERING",
    channels: ["backend-devs", "frontend-devs", "mobile-devs", "devops-server", "qa-testing", "ai-lab", "research-notes"]
  },
  {
    category: "🎨 MARKETING",
    channels: ["design-branding", "digital-marketing", "smm-content", "video-production"]
  },
  {
    category: "🛡 SECURITY",
    channels: ["red-team-intel", "blue-team-defense", "soc-alerts", "audit-logs"]
  },
  {
    category: "🎧 SUPPORT",
    channels: ["tickets-queue", "customer-support-chat"]
  },
  {
    category: "📊 REPORTS",
    channels: ["daily-reports", "weekly-reports", "monthly-reports"]
  },
  {
    category: "🎉 COMMUNITY",
    channels: ["general-talk", "gaming-voice", "weekly-events"]
  }
];

export const PYTHON_BOT_CODEBASE = {
  requirements: `aiogram==3.4.1
google-genai==2.4.0
reportlab==4.1.0
python-dotenv==1.0.1
pydantic==2.6.1
`,
  env_example: `# Wentric Employee Telegram Bot Sozlamalari
TELEGRAM_BOT_TOKEN="TELEGRAM_BOT_TOKEN_SHUYERGA_YOZILADI"
GEMINI_API_KEY="GEMINI_API_KEY_SHUYERGA_YOZILADI"
ADMIN_EMAILS="admin1@wentric.com,admin2@wentric.com"
GROUP_ID="-100xxxxxxxxxx" # Monitoring qilinadigan guruh IDsi
`,
  readme: `# Wentric Employee Telegram Bot (v1.0)
Ushbu bot Wentric Corporation xodimlari nazorati va guruh chat tahlili uchun maxsus ishlab chiqilgan.

## Asosiy imkoniyatlar:
1. **Resident Card Nazorati**: Guruhda yozgan har bir shaxsning SQLite bazasida 'ID' (masalan: DEV-004) borligi tekshiriladi. Agar xodim bo'lmasa, ogohlantiriladi va 30 soniya ichida o'zini tasdiqlamasa guruhdan chiqariladi (yoki mute beriladi).
2. **Warn Tizimi**: Adminlar foydalanuvchilarga ogohlantirish bera oladi (\`/warn @username\`). Warn 5 taga yetsa, avtomatik ravishda guruhdan chiqariladi.
3. **AI Chat Analyzer (Gemini)**: Har kunlik chat yozishmalarini Gemini AI orqali tahlil qilib, kunlik, haftalik va oylik hisobotlar yaratadi.
4. **Kunlik SQLite Zaxiralash**: Har kuni ma'lumotlar bazasi zaxira nusxasi yaratiladi.
5. **Haftalik PDF Hisobot**: Xodimlar reytingi va kpi natijalari PDF formatida generatsiya qilinib, adminlarga elektron pochta orqali yuboriladi.

## O'rnatish tartibi:
1. Virtual muhit yarating va dependency-larni o'rnating:
   \`\`\`bash
   python -m venv venv
   source venv/bin/activate  # Windows uchun: venv\\Scripts\\activate
   pip install -r requirements.txt
   \`\`\`
2. \`.env.example\` faylini \`.env\` ga o'zgartiring va o'z tokenlaringizni yozing.
3. Botni ishga tushiring:
   \`\`\`bash
   python bot.py
   \`\`\`
`,
  database: `import sqlite3
import datetime

DB_NAME = "wentric_employees.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    # Xodimlar jadvali
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS employees (
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
    )
    ''')
    
    # Chat loglari jadvali (AI tahlili uchun)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS chat_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        username TEXT NOT NULL,
        name TEXT NOT NULL,
        message TEXT NOT NULL
    )
    ''')
    
    # Ogohlantirishlar tarixi jadvali
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS warning_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        username TEXT NOT NULL,
        reason TEXT NOT NULL,
        level INTEGER NOT NULL,
        issuer TEXT NOT NULL
    )
    ''')
    
    # Boshlang'ich ma'lumotlarni qo'shish (agar bo'sh bo'lsa)
    cursor.execute("SELECT COUNT(*) FROM employees")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO employees (id, name, username, position, grade, department, manager, kpi, bonus, warnings)
        VALUES ('DEV-004', 'Hasanov Ilyos', '@hasanov_ilyos', 'Backend Developer', 'G10', 'Engineering', 'CTO', 95, 500, 0)
        """)
        cursor.execute("""
        INSERT INTO employees (id, name, username, position, grade, department, manager, kpi, bonus, warnings)
        VALUES ('CEO-001', 'Sardorbek Rakhmonov', '@sardor_ceo', 'CEO', 'G15', 'Executive', 'Kengash', 98, 2500, 0)
        """)
        cursor.execute("""
        INSERT INTO employees (id, name, username, position, grade, department, manager, kpi, bonus, warnings)
        VALUES ('CTO-002', 'Javoxir To\\'rayev', '@javoxir_cto', 'CTO', 'G14', 'Engineering', 'CEO', 96, 1500, 0)
        """)
        conn.commit()
        
    conn.close()

def get_employee(username: str):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM employees WHERE username = ?", (username,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {
            "id": row[0], "name": row[1], "username": row[2], "position": row[3],
            "grade": row[4], "department": row[5], "manager": row[6],
            "status": row[7], "kpi": row[8], "bonus": row[9], "warnings": row[10]
        }
    return None

def log_message(username: str, name: str, message: str):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    now = datetime.datetime.now().isoformat()
    cursor.execute("INSERT INTO chat_logs (timestamp, username, name, message) VALUES (?, ?, ?, ?)",
                   (now, username, name, message))
    conn.commit()
    conn.close()

def add_warning(username: str, reason: str, issuer: str):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("UPDATE employees SET warnings = warnings + 1 WHERE username = ?", (username,))
    cursor.execute("SELECT warnings FROM employees WHERE username = ?", (username,))
    row = cursor.fetchone()
    warnings = row[0] if row else 0
    
    now = datetime.datetime.now().isoformat()
    cursor.execute("INSERT INTO warning_logs (timestamp, username, reason, level, issuer) VALUES (?, ?, ?, ?, ?)",
                   (now, username, reason, warnings, issuer))
    conn.commit()
    conn.close()
    return warnings

def update_kpi(username: str, change: int):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("UPDATE employees SET kpi = MAX(0, MIN(100, kpi + ?)) WHERE username = ?", (change, username))
    conn.commit()
    conn.close()
`,
  analyzer: `import sqlite3
from google import genai
import os
from dotenv import load_dotenv

load_dotenv()

# Gemini API Clientni sozlash
api_key = os.getenv("GEMINI_API_KEY")
ai = None
if api_key:
    ai = genai.GoogleGenAI(apiKey=api_key)

def fetch_recent_logs(hours=24):
    conn = sqlite3.connect("wentric_employees.db")
    cursor = conn.cursor()
    cursor.execute(\"\"\"
        SELECT username, name, message 
        FROM chat_logs 
        WHERE datetime(timestamp) >= datetime('now', '-? hour')
        ORDER BY id ASC
    \"\"\", (hours,))
    rows = cursor.fetchall()
    conn.close()
    
    log_text = ""
    for r in rows:
        log_text += f"{r[0]} ({r[1]}): {r[2]}\\n"
    return log_text

async def analyze_chat_activity(hours=24):
    if not ai:
        return "TIZIM XATOLIGI: Gemini API key o'rnatilmagan. Iltimos .env faylini sozlang!"
        
    logs = fetch_recent_logs(hours)
    if not logs:
        return "Tahlil qilish uchun oxirgi 24 soat ichida hech qanday chat yozishmalari mavjud emas."
        
    prompt = f\"\"\"
Siz Wentric Corporation korporativ tahlilchi sun'iy intellektisiz.
Quyida oxirgi {hours} soatlik chat loglari keltirilgan:

{logs}

Iltimos, ushbu chat loglarini tahlil qiling va quyidagi formatda professional hisobot bering:
1. **Chat faolligi xulosasi**: Suhbat mavzusi, qisqacha ma'lumot.
2. **Eng faol xodimlar**: Qaysi xodimlar foydali fikr bildirdi.
3. **Ehtimoliy muammolar**: Mojarolar, tushunmovchiliklar yoki resident bo'lmagan foydalanuvchilar harakati.
4. **KPI bo'yicha tavsiyalar**: KPI oshirish yoki tushirishga loyiq xodimlar (sabablari bilan).
\"\"\"

    try:
        response = await ai.models.generateContent(
            model="gemini-3.5-flash",
            contents=prompt
        )
        return response.text
    except Exception as e:
        return f"AI Tahlil xatoligi: {str(e)}"
`,
  pdf: `import os
import sqlite3
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def generate_weekly_pdf(output_path="weekly_report.pdf"):
    doc = SimpleDocTemplate(output_path, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    story = []
    styles = getSampleStyleSheet()
    
    # Maxsus dizayn stillari
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=22,
        leading=26,
        textColor=colors.HexColor('#0F172A'), # Charcoal Slate
        spaceAfter=15
    )
    
    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['BodyText'],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#334155')
    )
    
    # Sarlavha
    story.append(Paragraph("WENTRIC CORPORATION - HAFTALIK HISOBOT", title_style))
    story.append(Paragraph("Hujjat turi: KPI va Aktivlik monitoringi", body_style))
    story.append(Paragraph("Yaratilgan sana: Haftalik avtomatik hisobot", body_style))
    story.append(Spacer(1, 15))
    
    # SQLite dan ma'lumot olish
    conn = sqlite3.connect("wentric_employees.db")
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, position, department, kpi, warnings, status FROM employees")
    rows = cursor.fetchall()
    conn.close()
    
    # Jadval tuzish
    table_data = [["Xodim ID", "F.I.Sh", "Lavozimi", "Bo'limi", "KPI", "Warns", "Holati"]]
    for r in rows:
        table_data.append([r[0], r[1], r[2], r[3], f"{r[4]}%", str(r[5]), r[6]])
        
    t = Table(table_data, colWidths=[60, 110, 110, 90, 45, 45, 60])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E293B')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,0), 8),
        ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#F8FAFC')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('TEXTCOLOR', (0,1), (-1,-1), colors.HexColor('#334155')),
        ('FONTSIZE', (0,0), (-1,-1), 9),
    ]))
    
    story.append(t)
    story.append(Spacer(1, 25))
    story.append(Paragraph("Ushbu hisobot avtomatik ravishda Wentric Employee Management System (WCEMS) tizimi orqali yaratildi.", body_style))
    
    doc.build(story)
    print(f"PDF muvaffaqiyatli yaratildi: {output_path}")
`,
  bot: `import os
import asyncio
from dotenv import load_dotenv
from aiogram import Bot, Dispatcher, F, types
from aiogram.filters import Command, CommandObject
from aiogram.types import Message

from database import init_db, get_employee, log_message, add_warning, update_kpi
from gemini_analyzer import analyze_chat_activity
from pdf_generator import generate_weekly_pdf

load_dotenv()

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
GROUP_ID = os.getenv("GROUP_ID")

if not BOT_TOKEN:
    raise ValueError("TELEGRAM_BOT_TOKEN topilmadi! Iltimos, .env faylini tekshiring.")

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

# Boshlang'ich ruxsatlar
@dp.message(Command("start"))
async def cmd_start(message: Message):
    await message.answer(
        "👋 **Wentric Corporation Employee Management System (WCEMS) v1.0 Botiga xush kelibsiz!**\\n\\n"
        "Ushbu bot guruh xavfsizligi, resident ID-kartalari monitoringi va kpi boshqaruvini avtomatlashtiradi."
    )

# Yangi xodim qo'shilgandagi xabar va ID kartasi bormi yo'qligini tekshirish
@dp.message(F.chat.type.in_({"group", "supergroup"}))
async def handle_group_message(message: Message):
    if not message.from_user or message.from_user.is_bot:
        return
        
    username = f"@{message.from_user.username}" if message.from_user.username else None
    
    # 1. Habarni bazaga log qilish (AI tahlili uchun)
    log_message(
        username=username or f"id_{message.from_user.id}",
        name=message.from_user.full_name,
        message=message.text or "[Media/Sticker]"
    )
    
    # 2. Agar guruh monitoring qilinadigan guruh bo'lsa, status tekshirish
    if username:
        emp = get_employee(username)
        if not emp:
            # ID kartasi yo'q!
            warning_msg = await message.reply(
                f"⚠️ **DIQQAT!** {message.from_user.full_name} ({username}) tizimda ro'yxatdan o'tmagan!\\n"
                "Sizda faol **Wentric Resident ID Card** mavjud emas. Xavfsizlik qoidalariga ko'ra guruhda faqat resident xodimlar yozishi mumkin.\\n\\n"
                "🚨 _Adminlar roziligi yoki tasdig'i kutilmoqda. Aks holda 30 soniyada guruhdan chiqarilasiz!_"
            )
            # 30 soniyadan so'ng chiqarish simulyatsiyasi uchun scheduler yozish mumkin:
            # asyncio.create_task(kick_unregistered_delayed(message.chat.id, message.from_user.id, warning_msg.message_id))

# Adminlar uchun /warn buyrug'i
@dp.message(Command("warn"))
async def cmd_warn(message: Message, command: CommandObject):
    # Admin tekshiruvi simulyatsiyasi (haqiqiy botda bot adminlar ro'yxati tekshiriladi)
    if not command.args:
        await message.reply("Foydalanish: /warn @username [sabab]")
        return
        
    parts = command.args.split(maxsplit=1)
    target_username = parts[0]
    reason = parts[1] if len(parts) > 1 else "Intizom qoidalari buzilishi"
    
    emp = get_employee(target_username)
    if not emp:
        await message.reply(f"Foydalanuvchi {target_username} Wentric xodimlari bazasidan topilmadi!")
        return
        
    level = add_warning(target_username, reason, message.from_user.full_name)
    await message.answer(
        f"🚨 **OGOHLANTIRISH berildi!**\\n"
        f"Xodim: {emp['name']} ({target_username})\\n"
        f"Daraja: {level}/5\\n"
        f"Sababi: {reason}\\n"
        f"Beruvchi: {message.from_user.full_name}\\n\\n"
        f"⚠️ _Eslatib o'tamiz: Warn darajasi 5 taga yetsa, ishdan bo'shatish bo'yicha ko'rib chiqiladi!_"
    )
    
    if level >= 5:
        await message.answer(f"❌ Xodim {emp['name']} ogohlantirish limitiga yetdi. Guruhdan va tizimdan chiqarilishi talab etiladi!")

# AI chat tahlili /analyze
@dp.message(Command("analyze"))
async def cmd_analyze(message: Message, command: CommandObject):
    hours = 24
    if command.args and command.args.isdigit():
        hours = int(command.args)
        
    loading = await message.reply("⏳ Chat loglari yig'ilmoqda va Gemini AI orqali tahlil qilinmoqda...")
    report = await analyze_chat_activity(hours)
    await bot.delete_message(message.chat.id, loading.message_id)
    await message.reply(f"📊 **Sun'iy Intellekt Chat Tahlili Hisoboti (Oxirgi {hours} soat):**\\n\\n{report}")

# PDF hisobot yaratish
@dp.message(Command("pdf"))
async def cmd_pdf(message: Message):
    filename = "weekly_report.pdf"
    generate_weekly_pdf(filename)
    if os.path.exists(filename):
        # Yuborish
        from aiogram.types import FSInputFile
        pdf_file = FSInputFile(filename)
        await message.reply_document(pdf_file, caption="Wentric Haftalik KPI va Davomat hisoboti PDF formatida.")
    else:
        await message.reply("PDF yaratishda xatolik yuz berdi.")

async def main():
    init_db()
    print("Bot muvaffaqiyatli ishga tushdi...")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
`
};
