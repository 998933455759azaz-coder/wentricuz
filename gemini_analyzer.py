import sqlite3
from google import genai
import os
from dotenv import load_dotenv

load_dotenv()

# Setup Gemini API Client (Official google-genai SDK)
api_key = os.getenv("GEMINI_API_KEY")
client = None
if api_key:
    client = genai.Client(api_key=api_key)

def fetch_recent_logs(hours=24):
    conn = sqlite3.connect("wentric_employees.db")
    cursor = conn.cursor()
    cursor.execute("""
        SELECT username, name, message 
        FROM chat_logs 
        WHERE datetime(timestamp) >= datetime('now', f'-{hours} hour')
        ORDER BY id ASC
    """)
    rows = cursor.fetchall()
    conn.close()
    
    log_text = ""
    for r in rows:
        log_text += f"{r[0]} ({r[1]}): {r[2]}\n"
    return log_text

def analyze_chat_activity(hours=24):
    if not client:
        return "TIZIM XATOLIGI: Gemini API key o'rnatilmagan. Iltimos .env faylini sozlang!"
        
    logs = fetch_recent_logs(hours)
    if not logs:
        return "Tahlil qilish uchun oxirgi 24 soat ichida hech qanday chat yozishmalari mavjud emas."
        
    prompt = f"""
Siz Wentric Corporation korporativ tahlilchi sun'iy intellektisiz.
Quyida oxirgi {hours} soatlik chat loglari keltirilgan:

{logs}

Iltimos, ushbu chat loglarini tahlil qiling va quyidagi formatda o'zbek tilida professional hisobot bering:
1. **Chat faolligi xulosasi**: Suhbat mavzusi, qisqacha ma'lumot.
2. **Eng faol xodimlar**: Qaysi xodimlar foydali fikr bildirdi.
3. **Ehtimoliy muammolar**: Mojarolar, tushunmovchiliklar yoki resident bo'lmagan foydalanuvchilar harakati.
4. **KPI bo'yicha tavsiyalar**: KPI oshirish yoki tushirishga loyiq xodimlar (sabablari bilan).
"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return response.text
    except Exception as e:
        return f"AI Tahlil xatoligi: {str(e)}"
