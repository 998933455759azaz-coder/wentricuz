import os
import asyncio
import re
import datetime
import sqlite3
import json
from dotenv import load_dotenv
from aiogram import Bot, Dispatcher, F
from aiogram.filters import Command, CommandObject
from aiogram.types import Message, FSInputFile, ReplyKeyboardMarkup, KeyboardButton, ReplyKeyboardRemove

# Database and utilities
import database as db
from gemini_analyzer import analyze_chat_activity
from pdf_generator import generate_weekly_pdf

# Telethon for Userbot
from telethon import TelegramClient, events
from telethon.errors import SessionPasswordNeededError

load_dotenv()

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
GROUP_ID = os.getenv("GROUP_ID")
OWNER_ID = os.getenv("OWNER_ID") # Initial owner telegram ID

if not BOT_TOKEN:
    raise ValueError("TELEGRAM_BOT_TOKEN topilmadi! Iltimos, .env faylini tekshiring.")

# Initialize database
db.init_db(default_owner_id=OWNER_ID)

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

# Userbot session states
# tg_id -> {step, api_id, api_hash, phone, client, phone_code_hash}
userbot_states = {}
active_userbots = {} # tg_id -> TelegramClient

def is_valid_email(email: str) -> bool:
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return bool(re.match(pattern, email))

# Helper to format dates
def format_datetime(iso_str):
    if not iso_str:
        return "Nomalum"
    try:
        dt = datetime.datetime.fromisoformat(iso_str)
        return dt.strftime("%Y-%m-%d %H:%M")
    except Exception:
        return iso_str

# ==============================================================================
# 1. 1000-CHARACTER MAJESTIC WELCOME TEXT FOR GUESTS
# ==============================================================================
GUEST_WELCOME_TEXT = """🏢 <b>WENTRIC CORPORATION GLOBAL NETWORX (WCEMS)</b>

Siz hozirda <b>Wentric Corporation</b> korporativ va yopiq xavfsiz ma'lumotlar boshqaruv portaliga ulandingiz. Mazkur sun'iy intellekt monitoring tizimi korporatsiyamizning barcha faol rezidentlari, backend va frontend muhandislari, ijrochi direktorlari hamda loyiha menejerlarining kundalik ish unumdorligi, xavfsizlik protokollari, o'zaro hamkorlik darajasi, KPI natijalari va moliyaviy daromadlarini real vaqtda tahlil qilish hamda avtomatlashtirilgan tarzda rag'batlantirish maqsadida ishlab chiqilgan.

🚨 <b>MUHIM XAVFSIZLIK CHORALARI VA PROTOKOLLARI:</b>
Korporatsiya ichki tartib-qoidalariga asosan, faqatgina tasdiqlangan va o'zining rasmiy <b>"Wentric Resident Card"</b> (Rezidentlik Guvohnomasi)-ni faollashtirgan xodimlar korporativ guruhlarda muloqot qilish, loyihalarni boshqarish va topshiriqlarni qabul qilish huquqiga egadirlar. Tizimda ro'yxatdan o'tmagan har qanday foydalanuvchi "Guest" (Mehmon) deb hisoblanadi va guruhda ruxsatsiz yozishga urinishlar avtomatik ogohlantirish yoki tizimdan chiqarib yuborilish (Ban/Kick) bilan yakunlanadi.

🔑 <b>KEYINGI QADAM - RO'YXATDAN O'TISH:</b>
Tizimda profilingizni shakllantirish, o'z elektron pochtangizni bog'lash, haqiqiy portfolio va ma'lumotlaringizni kiritish uchun sizga rahbarlar yoki ma'murlar tomonidan taqdim etilgan <b>Maxsus Raqamli Taklif Kodini (Invite Code)</b> ushbu shaxsiy chatga yuborishingiz talab etiladi. Agar sizda taklif kodi mavjud bo'lmasa, iltimos, o'z bo'lim boshlig'ingiz (manager/admin) bilan bog'laning.

📋 <i>Wentric Corporation — Kelajak texnologiyalarini birlashtiruvchi ishonchli kiber-makon!</i>"""

# ==============================================================================
# 2. WELCOME / ONBOARDING STATE MACHINE
# ==============================================================================
@dp.message(Command("start"))
async def cmd_start(message: Message):
    tg_id = message.from_user.id
    username = f"@{message.from_user.username}" if message.from_user.username else f"id_{tg_id}"
    
    db.create_guest(tg_id, username)
    emp = db.get_employee(tg_id)
    
    # If already a fully registered resident
    if emp and emp["is_profile_complete"] == 2:
        await message.answer(
            f"👋 <b>Xush kelibsiz, {emp['name']}!</b>\n"
            f"Siz <b>Wentric Corporation</b> rasmiy va faol rezidentisiz.\n\n"
            f"💳 <b>ID:</b> {emp['id']}\n"
            f"🎭 <b>Lavozim:</b> {emp['position']}\n"
            f"⭐ <b>Reyting:</b> {emp['rating']} ball | {', '.join(emp['badges']) if emp['badges'] else 'Unvon yo\'q'}\n\n"
            f"📚 Barcha buyruqlarni ko'rish uchun /help bosing.",
            parse_mode="HTML"
        )
        return

    # If in the middle of onboarding draft
    step = emp["draft_step"] if emp else 0
    if step > 0:
        await message.answer(
            "⚠️ <b>Siz rezidentlik profilini to'ldirish jarayonidasiz!</b>\n"
            "Profilingizni yakunlamaguningizcha guruhlarda yozolmaysiz. Ma'lumotlarni qoralama qilib qo'yishingiz ham mumkin.\n"
            "🔄 Qaytadan boshlash uchun istalgan vaqtda: /cancel bosing."
        )
        await prompt_draft_step(message, tg_id, step)
        return

    # Guest - Show Majestic 1000-character message
    await message.answer(GUEST_WELCOME_TEXT, parse_mode="HTML")

async def prompt_draft_step(message: Message, tg_id: int, step: int):
    if step == 1:
        await message.answer("✍️ Iltimos, o'z <b>To'liq ism-sharifingizni (F.I.Sh)</b> kiriting (Masalan: Hasanov Ilyos):", parse_mode="HTML")
    elif step == 2:
        await message.answer("📧 Iltimos, <b>Elektron pochtangizni (Email)</b> bog'lang:", parse_mode="HTML")
    elif step == 3:
        await message.answer("📸 Profilingiz uchun <b>Rasm URL manzili</b> kiriting (Yoki istalgan rasm yuboring, biz avtomatik bog'laymiz):", parse_mode="HTML")
    elif step == 4:
        await message.answer("📝 Portfoliongiz, ko'nikmalaringiz va tajribangiz haqida batafsil <b>qisqacha bio/portfolio</b> kiriting:", parse_mode="HTML")

# Onboarding Cancel/Clear
@dp.message(Command(commands=["cancel", "clear"]))
async def cmd_cancel(message: Message):
    tg_id = message.from_user.id
    db.clear_draft(tg_id)
    # Also clean userbot connection state if any
    if tg_id in userbot_states:
        userbot_states.pop(tg_id)
    await message.answer(
        "🧹 <b>Sizning profilingiz va barcha qoralamalaringiz butunlay o'chirildi!</b>\n"
        "Boshidan boshlash uchun istalgan vaqtda /start bosing.",
        parse_mode="HTML",
        reply_markup=ReplyKeyboardRemove()
    )

# ==============================================================================
# 3. INTERACTIVE USERBOT CONNECTION FLOW (WITH TELETHON)
# ==============================================================================
@dp.message(Command("connect_userbot"))
async def cmd_connect_userbot(message: Message):
    tg_id = message.from_user.id
    requester = db.get_employee(tg_id)
    
    if not requester or requester["role"] != "owner":
        await message.reply("❌ Xatolik: Ushbu juda maxfiy buyruq faqat Loyiha Egasi (Owner) uchun ruxsat etilgan!")
        return
        
    userbot_states[tg_id] = {"step": "api_id"}
    await message.reply(
        "🤖 <b>WENTRIC USERBOT DYNAMICAL ENGINE</b>\n\n"
        "Ushbu modul orqali siz o'z shaxsiy profilingizni Telethon userbot sifatida guruh chatlariga bog'laysiz. "
        "Userbot orqali guruhda yozgan har bir odamning shaxsini avtomatik monitoring qilish va buyruqlarga tezkor javob berish yo'lga qo'yiladi.\n\n"
        "🔑 1-qadam: Iltimos, <b>TELEGRAM_API_ID</b> ni kiriting (buni https://my.telegram.org saytidan olasiz):",
        parse_mode="HTML"
    )

async def handle_userbot_setup(message: Message, tg_id: int, state_info: dict, text: str):
    step = state_info["step"]
    
    if step == "api_id":
        if not text.isdigit():
            await message.reply("⚠️ API_ID faqat raqamlardan iborat bo'lishi kerak. Qayta kiriting:")
            return
        state_info["api_id"] = int(text)
        state_info["step"] = "api_hash"
        await message.reply("✅ API_ID qabul qilindi.\n\n🔑 2-qadam: Endi <b>TELEGRAM_API_HASH</b> qiymatini kiriting:")
        
    elif step == "api_hash":
        if len(text) < 10:
            await message.reply("⚠️ API_HASH juda qisqa. Qayta kiriting:")
            return
        state_info["api_hash"] = text
        state_info["step"] = "phone"
        await message.reply("✅ API_HASH qabul qilindi.\n\n📞 3-qadam: Telegramga ulangan <b>Telefon raqamingizni</b> xalqaro formatda kiriting (Masalan: +998931234567):")
        
    elif step == "phone":
        if not text.startswith("+") or len(text) < 9:
            await message.reply("⚠️ Telefon raqami '+' bilan boshlanishi va xalqaro formatda bo'lishi kerak. Qayta kiriting:")
            return
        state_info["phone"] = text
        
        # We start the Telethon connection
        api_id = state_info["api_id"]
        api_hash = state_info["api_hash"]
        session_path = f"userbot_session_{tg_id}"
        
        await message.reply("⏳ Telegram serverlari bilan xavfsiz ulanish o'rnatilmoqda va tasdiqlash kodi yuborilmoqda...")
        
        try:
            client = TelegramClient(session_path, api_id, api_hash)
            await client.connect()
            
            # Send code request
            sent_code = await client.send_code_request(text)
            
            state_info["client"] = client
            state_info["phone_code_hash"] = sent_code.phone_code_hash
            state_info["step"] = "code"
            
            await message.reply(
                "📩 <b>KOD YUBORILDI!</b>\n\n"
                "Telegram ilovangizga (yoki SMS orqali) kelgan faollashtirish kodini kiriting.\n"
                "<i>Format: 12345 (faqat raqamlar)</i>",
                parse_mode="HTML"
            )
        except Exception as e:
            await message.reply(f"❌ Ulanishda xatolik yuz berdi: {str(e)}\n\n/connect_userbot orqali qaytadan urinib ko'ring.")
            userbot_states.pop(tg_id, None)
            
    elif step == "code":
        client = state_info["client"]
        phone = state_info["phone"]
        phone_code_hash = state_info["phone_code_hash"]
        api_id = state_info["api_id"]
        api_hash = state_info["api_hash"]
        
        # Clean the code input (sometimes spaces are included)
        code = text.replace(" ", "").strip()
        
        try:
            # Attempt to sign in
            await client.sign_in(phone, code, phone_code_hash=phone_code_hash)
            
            # Successful sign in
            await complete_userbot_setup(message, tg_id, client, api_id, api_hash)
            
        except SessionPasswordNeededError:
            # 2FA Password is required
            state_info["step"] = "password"
            await message.reply(
                "🔐 <b>2FA (Ikki bosqichli parol) aniqlandi!</b>\n\n"
                "Iltimos, o'zingizning xavfsizlik parolingizni (Two-Step Verification Password) chatga kiriting:",
                parse_mode="HTML"
            )
        except Exception as e:
            await message.reply(f"❌ Noto'g'ri kod yoki tizim xatosi: {str(e)}\nIltimos, kodingizni tekshirib qayta kiriting:")
            
    elif step == "password":
        client = state_info["client"]
        api_id = state_info["api_id"]
        api_hash = state_info["api_hash"]
        try:
            await client.sign_in(password=text)
            await complete_userbot_setup(message, tg_id, client, api_id, api_hash)
        except Exception as e:
            await message.reply(f"❌ Parol noto'g'ri: {str(e)}\nIltimos, parolingizni qaytadan tekshirib kiriting:")

async def complete_userbot_setup(message: Message, tg_id: int, client: TelegramClient, api_id: int, api_hash: str):
    # Store globally
    active_userbots[tg_id] = client
    userbot_states.pop(tg_id, None)
    
    # Store credentials in DB config for startup auto-restoration
    db.set_config(f"userbot_api_id_{tg_id}", str(api_id))
    db.set_config(f"userbot_api_hash_{tg_id}", api_hash)
    
    await message.reply(
        "🎉 <b>TABRIKLAYMIZ! USERBOT MUVAFFAQIYATLI ULANDI!</b>\n\n"
        "Sizning shaxsiy Telegram profilingiz endi Wentric tizimiga xizmat qiladi. "
        "Userbot fonda guruhlarni va kanallarni monitoring qila boshladi.\n"
        "Guruhda kimdir <code>/about @username</code> deb yozsa, sizning nomingizdan srazi professional javob beriladi!",
        parse_mode="HTML"
    )
    
    # Start listening to events on this newly connected client
    await launch_userbot_listeners(tg_id, client)

async def launch_userbot_listeners(tg_id: int, client: TelegramClient):
    print(f"Userbot listener launched for owner {tg_id}")
    
    @client.on(events.NewMessage)
    async def userbot_on_message(event):
        text = event.raw_text.strip() if event.raw_text else ""
        
        # Support /about command in ANY chat the userbot is in!
        if text.startswith("/about"):
            parts = text.split()
            target_username = None
            if len(parts) > 1:
                target_username = parts[1].strip()
            else:
                # If they replied to someone, get that user's info
                if event.is_reply:
                    reply_msg = await event.get_reply_message()
                    sender = await reply_msg.get_sender()
                    if sender and sender.username:
                        target_username = f"@{sender.username}"
                    elif sender:
                        target_username = f"id_{sender.id}"
                else:
                    # Get the userbot sender itself
                    sender = await event.get_sender()
                    if sender and sender.username:
                        target_username = f"@{sender.username}"
            
            if target_username:
                # Query sqlite database
                target = db.get_employee(target_username)
                if target:
                    badges_str = " ".join([f"💎 {b}" for b in target["badges"]]) if target["badges"] else "Nishonlar yo'q"
                    info = (
                        f"💳 <b>WENTRIC RESIDENT PROFILE</b>\n"
                        f"━━━━━━━━━━━━━━━━━━━\n"
                        f"👤 <b>F.I.Sh:</b> {target['name']}\n"
                        f"🆔 <b>Rezident ID:</b> {target['id']}\n"
                        f"🌐 <b>Username:</b> {target['username']}\n"
                        f"🎭 <b>Lavozim:</b> {target['position']}\n"
                        f"🛡️ <b>KPI:</b> {target['kpi']}% | <b>Obro' Reytingi:</b> {target['rating']} ball\n"
                        f"🏅 <b>Unvonlari:</b> {badges_str}\n"
                        f"━━━━━━━━━━━━━━━━━━━\n"
                        f"📝 <b>Bio:</b> <i>{target['bio_portfolio']}</i>"
                    )
                    await event.reply(info, parse_mode="html")
                else:
                    # Not a resident, alert them
                    await event.reply("⚠️ Ushbu foydalanuvchi Wentric Corporation ma'lumotlar bazasidan topilmadi!")

# ==============================================================================
# 4. TASKS ENGINE (VAZIFA ASSIGNMENTS & REWARDS)
# ==============================================================================
@dp.message(Command("add_task"))
async def cmd_add_task(message: Message, command: CommandObject):
    tg_id = message.from_user.id
    requester = db.get_employee(tg_id)
    
    if not requester or requester["role"] not in ["owner", "admin"]:
        await message.reply("❌ Ushbu buyruq faqat Adminlar va Ownerlar uchun ruxsat etilgan!")
        return
        
    if not command.args:
        await message.reply(
            "📋 <b>Yangi vazifa biriktirish:</b>\n\n"
            "Format: <code>/add_task @username | Sarlavha | Tavsif | Muddat (soatda)</code>\n\n"
            "Misol: <code>/add_task @hasanov_ilyos | API Integratsiya | Gemini modelini ula | 24</code>",
            parse_mode="HTML"
        )
        return
        
    try:
        parts = [p.strip() for p in command.args.split("|")]
        if len(parts) < 4:
            await message.reply("⚠️ Format xato! To'rtta ustun bo'lishi shart (username, sarlavha, tavsif, soat).")
            return
            
        target_username = parts[0]
        title = parts[1]
        description = parts[2]
        deadline_hours = int(parts[3])
        
        target = db.get_employee(target_username)
        if not target:
            await message.reply(f"❌ Bunday foydalanuvchi ({target_username}) rezidentlar bazasidan topilmadi!")
            return
            
        db.add_task(title, description, target_username, requester["username"] or "Admin", deadline_hours)
        
        await message.answer(
            f"🚀 <b>YANGI VAZIFA BIRIKTIRILDI!</b>\n\n"
            f"👤 <b>Ijrochi:</b> {target['name']} ({target_username})\n"
            f"📌 <b>Vazifa:</b> {title}\n"
            f"📝 <b>Tavsif:</b> {description}\n"
            f"⏳ <b>Muddat:</b> {deadline_hours} soat\n\n"
            f"<i>Xodim vazifani qancha erta topshirsa, shuncha ko'p rating va zumrad toshlarini qo'lga kiritadi!</i>",
            parse_mode="HTML"
        )
        
        # Notify the resident in private if possible
        try:
            await bot.send_message(
                target["telegram_id"],
                f"📥 <b>Sizga yangi vazifa yuklatildi!</b>\n\n"
                f"📌 <b>Vazifa:</b> {title}\n"
                f"⏳ <b>Muddat:</b> {deadline_hours} soat\n"
                f"Vazifani ko'rish uchun /tasks buyrug'ini yuboring. Topshirish uchun /submit_task dan foydalaning.",
                parse_mode="HTML"
            )
        except Exception:
            pass # Resident might not have started bot privately
            
    except Exception as e:
        await message.reply(f"⚠️ Xatolik yuz berdi: {str(e)}")

@dp.message(Command("tasks", "vazifalar"))
async def cmd_tasks(message: Message):
    tg_id = message.from_user.id
    emp = db.get_employee(tg_id)
    
    if not emp or emp["is_profile_complete"] != 2:
        await message.reply("❌ Siz hali tasdiqlangan rezident emassiz.")
        return
        
    username = emp["username"]
    tasks = db.get_tasks_for_user(username)
    
    if not tasks:
        await message.reply("🎉 <b>Sizga biriktirilgan faol vazifalar yo'q.</b>", parse_mode="HTML")
        return
        
    report = "📋 <b>Sizning Vazifalaringiz Ro'yxati:</b>\n\n"
    for t in tasks:
        report += (
            f"🔹 <b>ID:</b> {t['id']} | <b>Sarlavha:</b> {t['title']}\n"
            f"📝 <b>Tavsif:</b> {t['description']}\n"
            f"⏳ <b>Muddat:</b> {t['deadline_hours']} soat\n"
            f"⚡ <b>Holati:</b> <code>{t['status'].upper()}</code>\n"
            f"━━━━━━━━━━━━━━━━━━━\n"
        )
    await message.reply(report, parse_mode="HTML")

@dp.message(Command("submit_task"))
async def cmd_submit_task(message: Message, command: CommandObject):
    tg_id = message.from_user.id
    emp = db.get_employee(tg_id)
    
    if not emp or emp["is_profile_complete"] != 2:
        await message.reply("❌ Siz hali tasdiqlangan rezident emassiz.")
        return
        
    if not command.args:
        await message.reply(
            "📥 <b>Vazifani topshirish:</b>\n\n"
            "Format: <code>/submit_task vazifa_id | Topsherish eslatmalari (Masalan GitHub linki)</code>",
            parse_mode="HTML"
        )
        return
        
    try:
        parts = [p.strip() for p in command.args.split("|", 1)]
        task_id = int(parts[0])
        notes = parts[1] if len(parts) > 1 else "Vazifa muvaffaqiyatli yakunlandi."
        
        task = db.get_task(task_id)
        if not task:
            await message.reply("❌ Bunday ID ga ega vazifa topilmadi!")
            return
            
        if task["assigned_to"] != emp["username"] and task["assigned_to"] != "all":
            await message.reply("❌ Bu vazifa sizga tegishli emas!")
            return
            
        db.submit_task(task_id, notes)
        await message.reply(
            f"✅ <b>Vazifa topshirildi!</b>\n\n"
            f"Sizning topshirig'ingiz administratorlar tomonidan ko'rib chiqiladi. "
            f"Muvaffaqiyatli tasdiqlansa, sizga obro' ballari va unvonlar beriladi.",
            parse_mode="HTML"
        )
    except Exception as e:
        await message.reply(f"⚠️ Xatolik yuz berdi: {str(e)}")

@dp.message(Command("approve_task"))
async def cmd_approve_task(message: Message, command: CommandObject):
    tg_id = message.from_user.id
    requester = db.get_employee(tg_id)
    
    if not requester or requester["role"] not in ["owner", "admin"]:
        await message.reply("❌ Faqat Admin yoki Owner vazifalarni tasdiqlay oladi!")
        return
        
    if not command.args:
        await message.reply("Foydalanish: <code>/approve_task vazifa_id</code>", parse_mode="HTML")
        return
        
    try:
        task_id = int(command.args.strip())
        task = db.get_task(task_id)
        if not task:
            await message.reply("❌ Bunday ID ga ega vazifa topilmadi!")
            return
            
        db.update_task_status(task_id, "Approved")
        
        # Calculate early submission bonus
        created_time = datetime.datetime.fromisoformat(task["created_at"])
        submitted_time = datetime.datetime.fromisoformat(task["submitted_at"]) if task["submitted_at"] else datetime.datetime.now()
        
        elapsed_hours = (submitted_time - created_time).total_seconds() / 3600.0
        deadline = task["deadline_hours"]
        
        # Determine reward magnitude based on speed
        # If completed in less than 50% of the allocated time: Dual Rating, Bonus Star, Zumrad Badge
        if elapsed_hours < (deadline * 0.5):
            rating_reward = 25
            kpi_reward = 10
            badge_granted = "Zumrad"
            speed_msg = "🔥 MUDDATIDAN JADA TEZKOR (50% dan tezroq)!"
        else:
            rating_reward = 10
            kpi_reward = 5
            badge_granted = "Temir"
            speed_msg = "✅ Belgilangan muddat ichida."
            
        target_username = task["assigned_to"]
        db.adjust_rating_and_badges(target_username, rating_reward)
        db.update_kpi(target_username, kpi_reward)
        
        # Add badge to employees
        emp = db.get_employee(target_username)
        if emp:
            current_badges = emp["badges"]
            if badge_granted not in current_badges:
                current_badges.append(badge_granted)
                db.update_employee_draft(emp["telegram_id"], badges=current_badges)
                
        await message.answer(
            f"🎉 <b>VAZIFA TASDIQLANDI!</b>\n\n"
            f"👤 <b>Ijrochi:</b> {target_username}\n"
            f"📌 <b>Vazifa:</b> {task['title']}\n"
            f"⚡ <b>Tezlik:</b> {speed_msg}\n"
            f"📈 <b>Rag'batlantirish:</b> +{rating_reward} Obro' Balli, +{kpi_reward}% KPI!\n"
            f"🏅 <b>Unvon berildi:</b> {badge_granted} nishoni",
            parse_mode="HTML"
        )
    except Exception as e:
        await message.reply(f"⚠️ Xatolik yuz berdi: {str(e)}")

@dp.message(Command("reject_task"))
async def cmd_reject_task(message: Message, command: CommandObject):
    tg_id = message.from_user.id
    requester = db.get_employee(tg_id)
    
    if not requester or requester["role"] not in ["owner", "admin"]:
        await message.reply("❌ Faqat Admin yoki Owner topshiriqlarni rad eta oladi!")
        return
        
    if not command.args:
        await message.reply("Foydalanish: <code>/reject_task vazifa_id</code>", parse_mode="HTML")
        return
        
    try:
        task_id = int(command.args.strip())
        task = db.get_task(task_id)
        if not task:
            await message.reply("❌ Bunday ID ga ega vazifa topilmadi!")
            return
            
        db.update_task_status(task_id, "Rejected")
        db.update_kpi(task["assigned_to"], -5) # Small penalty
        
        await message.answer(
            f"❌ <b>VAZIFA RAD ETILDI!</b>\n\n"
            f"👤 <b>Ijrochi:</b> {task['assigned_to']}\n"
            f"📌 <b>Vazifa:</b> {task['title']}\n"
            f"📉 <i>Xodim KPI ko'rsatkichi 5 ballga kamaytirildi. Qayta urinib ko'rishi so'raladi.</i>",
            parse_mode="HTML"
        )
    except Exception as e:
        await message.reply(f"⚠️ Xatolik yuz berdi: {str(e)}")

# ==============================================================================
# 5. OTHER 15+ CORPORATE AND MODERATION COMMANDS
# ==============================================================================

# Command /about
@dp.message(Command("about"))
async def cmd_about(message: Message, command: CommandObject):
    tg_id = message.from_user.id
    requester = db.get_employee(tg_id)
    
    target_username = command.args.strip() if command.args else None
    if target_username:
        target = db.get_employee(target_username)
    else:
        target = requester

    if not target:
        await message.reply("❌ Foydalanuvchi topilmadi yoki hali rezidentlik kartasiga ega emas.")
        return

    is_owner_or_admin = requester and requester["role"] in ["owner", "admin"]
    is_self = requester and target and (requester["telegram_id"] == target["telegram_id"])
    
    if target["visibility"] == "owner_only" and not is_owner_or_admin and not is_self:
        await message.reply("🔒 Ushbu foydalanuvchi o'z profilini faqat tizim egalari (owner) ko'ra oladigan qilib sozlagan.")
        return
        
    if target["visibility"] == "anonymous" and not is_owner_or_admin and not is_self:
        await message.reply(
            f"👥 <b>Maxfiy Rezident Profili:</b>\n"
            f"🆔 ID: <code>{target['id']}</code>\n"
            f"⭐ Reyting: {target['rating']} ball\n"
            f"💎 Zumrad/Temir nishonlari: {', '.join(target['badges']) if target['badges'] else 'Yo\'q'}\n"
            f"💼 Lavozimi: {target['position']}\n"
            f"<i>Foydalanuvchi o'z shaxsini yashirgan.</i>",
            parse_mode="HTML"
        )
        return

    badges_str = " ".join([f"💎 {b}" for b in target["badges"]]) if target["badges"] else "Nishonlar yo'q"
    income_info = f"💰 <b>Oylik Daromad:</b> ${target['income']}\n" if (is_owner_or_admin or is_self) else ""
    quality_info = f"📈 <b>Ish Sifati:</b> {target['work_quality']}%\n" if (is_owner_or_admin or is_self) else ""
    
    report_text = (
        f"💳 <b>WENTRIC RESIDENT CARD</b> 💳\n"
        f"━━━━━━━━━━━━━━━━━━━\n"
        f"👤 <b>F.I.Sh:</b> {target['name']}\n"
        f"🆔 <b>Rezident ID:</b> <code>{target['id']}</code>\n"
        f"🌐 <b>Username:</b> {target['username']}\n"
        f"✉️ <b>Elektron pochta:</b> {target['email'] or 'Kiritilmagan'}\n"
        f"🎭 <b>Rol / Lavozim:</b> {target['position']} ({target['role'].upper()})\n"
        f"🛡️ <b>KPI:</b> {target['kpi']}% | <b>Ogohlantirishlar:</b> {target['warnings']}/5\n"
        f"⭐ <b>Obro' Reytingi:</b> {target['rating']} ball\n"
        f"🏅 <b>Nishonlari:</b> {badges_str}\n"
        f"{income_info}"
        f"{quality_info}"
        f"━━━━━━━━━━━━━━━━━━━\n"
        f"📝 <b>Tajriba / Portfolio:</b>\n"
        f"<i>{target['bio_portfolio'] or 'Bio kiritilmagan.'}</i>\n"
        f"━━━━━━━━━━━━━━━━━━━\n"
        f"🖼️ <b>Rasm URL:</b> {target['photo_url'] or 'Yo\'q'}"
    )
    
    await message.reply(report_text, parse_mode="HTML")

# Command /anon
@dp.message(Command("anon"))
async def cmd_anon(message: Message, command: CommandObject):
    tg_id = message.from_user.id
    emp = db.get_employee(tg_id)
    if not emp or emp["is_profile_complete"] != 2:
        await message.reply("❌ Siz hali tasdiqlangan rezident emassiz.")
        return
        
    if not command.args:
        await message.reply(
            "🔒 <b>Profilingiz maxfiyligini sozlang:</b>\n\n"
            "• <code>/anon public</code> - Barcha profilingizni ko'ra oladi (Default)\n"
            "• <code>/anon anonymous</code> - Ismingiz yashiriladi, faqat ID va reyting ko'rinadi\n"
            "• <code>/anon owner_only</code> - Faqat Owner va Adminlar ko'ra oladi",
            parse_mode="HTML"
        )
        return
        
    option = command.args.strip().lower()
    if option in ["public", "anonymous", "owner_only"]:
        db.update_employee_draft(tg_id, visibility=option)
        await message.reply(f"✅ Profil ko'rinishi muvaffaqiyatli o'zgartirildi: <b>{option.upper()}</b>", parse_mode="HTML")
    else:
        await message.reply("⚠️ Noto'g'ri tanlov. public, anonymous yoki owner_only yozing.")

# Command /stats
@dp.message(Command("stats"))
async def cmd_stats(message: Message):
    stats = db.get_financial_stats()
    ai_status = db.get_config("ai_active", "1")
    
    await message.reply(
        f"📊 <b>Wentric Corporation Biznes & Ish Statistikasi:</b>\n"
        f"━━━━━━━━━━━━━━━━━━━\n"
        f"👥 <b>Faol Rezidentlar:</b> {stats['total_residents']} ta\n"
        f"📈 <b>O'rtacha Ish Sifati:</b> {stats['avg_quality']}%\n"
        f"💰 <b>Jami Davriy Daromad (Revenue):</b> ${stats['total_income']:.2f}\n"
        f"🤖 <b>Sun'iy Intellekt Monitoring:</b> {'🟢 FAOL' if ai_status == '1' else '🔴 O\'CHIRILGAN'}\n"
        f"🛡️ <b>Infrastruktura holati:</b> 🟢 ONLINE (Secure SSL)",
        parse_mode="HTML"
    )

# Command /reward
@dp.message(Command("reward"))
async def cmd_reward(message: Message, command: CommandObject):
    tg_id = message.from_user.id
    requester = db.get_employee(tg_id)
    
    if not requester or requester["role"] not in ["owner", "admin"]:
        await message.reply("❌ Ushbu buyruq faqat Adminlar va Ownerlar uchun!")
        return
        
    if not command.args:
        await message.reply("Foydalanish: <code>/reward @username [rating_o'zgarishi]</code> (Masalan: /reward @hasanov_ilyos 10)", parse_mode="HTML")
        return
        
    parts = command.args.split()
    if len(parts) < 2:
        await message.reply("Iltimos, o'zgarish ballini kiriting. Masalan: 10 yoki -5")
        return
        
    target_username = parts[0]
    try:
        change = int(parts[1])
    except ValueError:
        await message.reply("⚠️ Ball son bo'lishi kerak!")
        return
        
    res = db.adjust_rating_and_badges(target_username, change)
    if not res:
        await message.reply("❌ Bunday foydalanuvchi topilmadi.")
        return
        
    await message.reply(
        f"💎 <b>REYTING YANGILANDI!</b>\n"
        f"Foydalanuvchi: {target_username}\n"
        f"O'zgarish: {change} ball\n"
        f"Yangi reyting: {res['rating']} ball\n"
        f"Egalik nishonlari: {', '.join(res['badges']) if res['badges'] else 'Yo\'q'}",
        parse_mode="HTML"
    )

# AI Toggles: /ai_on and /ai_off
@dp.message(Command("ai_on"))
async def cmd_ai_on(message: Message):
    tg_id = message.from_user.id
    requester = db.get_employee(tg_id)
    if not requester or requester["role"] != "owner":
        await message.reply("❌ Faqat Loyiha Egasi (Owner) AI monitoringini boshqara oladi!")
        return
        
    db.set_config("ai_active", "1")
    await message.reply("🟢 <b>Sun'iy Intellekt monitoringi muvaffaqiyatli yoqildi.</b> Chat loglari tahlil qilinadi.")

@dp.message(Command("ai_off"))
async def cmd_ai_off(message: Message):
    tg_id = message.from_user.id
    requester = db.get_employee(tg_id)
    if not requester or requester["role"] != "owner":
        await message.reply("❌ Faqat Loyiha Egasi (Owner) AI monitoringini boshqara oladi!")
        return
        
    db.set_config("ai_active", "0")
    await message.reply("🔴 <b>Sun'iy Intellekt monitoringi o'chirildi.</b>")

# Promoters: /owner and /admin
@dp.message(Command("owner"))
async def cmd_owner(message: Message, command: CommandObject):
    tg_id = message.from_user.id
    requester = db.get_employee(tg_id)
    if not requester or requester["role"] != "owner":
        await message.reply("❌ Faqat Asosiy Loyiha Egasi (Owner) boshqalarni Owner qila oladi!")
        return
        
    if not command.args:
        await message.reply("Foydalanish: <code>/owner @username</code>", parse_mode="HTML")
        return
        
    target_username = command.args.strip()
    target = db.get_employee(target_username)
    if not target:
        await message.reply("❌ Bunday foydalanuvchi topilmadi.")
        return
        
    db.update_employee_draft(target["telegram_id"], role="owner")
    await message.reply(f"👑 {target_username} muvaffaqiyatli **OWNER** lavozimiga ko'tarildi! Huquqlari cheksiz.")

@dp.message(Command("admin"))
async def cmd_admin(message: Message, command: CommandObject):
    tg_id = message.from_user.id
    requester = db.get_employee(tg_id)
    if not requester or requester["role"] != "owner":
        await message.reply("❌ Faqat Loyiha Egasi (Owner) boshqalarni Admin qila oladi!")
        return
        
    if not command.args:
        await message.reply("Foydalanish: <code>/admin @username</code>", parse_mode="HTML")
        return
        
    target_username = command.args.strip()
    target = db.get_employee(target_username)
    if not target:
        await message.reply("❌ Bunday foydalanuvchi topilmadi.")
        return
        
    db.update_employee_draft(target["telegram_id"], role="admin")
    await message.reply(f"🛡️ {target_username} muvaffaqiyatli **ADMIN** lavozimiga ko'tarildi! Moderatsiya huquqlari berildi.")

# Unwarn Command
@dp.message(Command("unwarn"))
async def cmd_unwarn(message: Message, command: CommandObject):
    tg_id = message.from_user.id
    requester = db.get_employee(tg_id)
    if not requester or requester["role"] not in ["owner", "admin"]:
        await message.reply("❌ Faqat Admin yoki Owner ogohlantirishlarni olib tashlay oladi!")
        return
        
    if not command.args:
        await message.reply("Foydalanish: <code>/unwarn @username</code>", parse_mode="HTML")
        return
        
    target_username = command.args.strip()
    target = db.get_employee(target_username)
    if not target:
        await message.reply("❌ Foydalanuvchi topilmadi.")
        return
        
    if target["warnings"] > 0:
        db.update_employee_draft(target["telegram_id"], warnings=target["warnings"] - 1)
        db.update_kpi(target_username, 5) # KPI restore
        await message.reply(f"🛡️ {target_username} dan bitta ogohlantirish olib tashlandi. Hozirgi warn darajasi: {target['warnings'] - 1}/5. KPI +5 ballga oshirildi!")
    else:
        await message.reply("❌ Ushbu xodimda hech qanday faol ogohlantirishlar yo'q.")

# Demote Command
@dp.message(Command("demote"))
async def cmd_demote(message: Message, command: CommandObject):
    tg_id = message.from_user.id
    requester = db.get_employee(tg_id)
    if not requester or requester["role"] != "owner":
        await message.reply("❌ Faqat Owner adminlarni lavozimidan tushira oladi!")
        return
        
    if not command.args:
        await message.reply("Foydalanish: <code>/demote @username</code>", parse_mode="HTML")
        return
        
    target_username = command.args.strip()
    target = db.get_employee(target_username)
    if not target:
        await message.reply("❌ Foydalanuvchi topilmadi.")
        return
        
    db.update_employee_draft(target["telegram_id"], role="resident")
    await message.reply(f"⚠️ {target_username} barcha ma'muriy huquqlardan mahrum qilindi va Resident darajasiga tushirildi.")

# Admin command: /code
@dp.message(Command("code"))
async def cmd_code(message: Message, command: CommandObject):
    tg_id = message.from_user.id
    requester = db.get_employee(tg_id)
    if not requester or requester["role"] not in ["owner", "admin"]:
        await message.reply("❌ Faqat Admin yoki Owner taklif kodi yarata oladi!")
        return
        
    if not command.args:
        await message.reply("Foydalanish: <code>/code YANGI-KOD-SHU-YERDA</code>", parse_mode="HTML")
        return
        
    new_code = command.args.strip()
    if db.add_invite_code(new_code, requester["username"]):
        await message.reply(f"✅ Yangi taklif kodi yaratildi va bazaga qo'shildi: <code>{new_code}</code>", parse_mode="HTML")
    else:
        await message.reply("❌ Tizimda xatolik: Ushbu kod allaqachon mavjud bo'lishi mumkin.")

# Admin command: /warn
@dp.message(Command("warn"))
async def cmd_warn(message: Message, command: CommandObject):
    tg_id = message.from_user.id
    requester = db.get_employee(tg_id)
    if not requester or requester["role"] not in ["owner", "admin"]:
        await message.reply("❌ Faqat Admin yoki Owner ogohlantirish bera oladi!")
        return
        
    if not command.args:
        await message.reply("Foydalanish: <code>/warn @username [sababi]</code>", parse_mode="HTML")
        return
        
    parts = command.args.split(maxsplit=1)
    target_username = parts[0]
    reason = parts[1] if len(parts) > 1 else "Guruh qoidalari va etika buzilishi"
    
    emp = db.get_employee(target_username)
    if not emp:
        await message.reply(f"❌ Xatolik: Foydalanuvchi {target_username} topilmadi!")
        return
        
    level = db.add_warning(target_username, reason, requester["name"] or "Admin")
    db.update_kpi(target_username, -5)
    
    await message.answer(
        f"🚨 <b>OGOHLANTIRISH (Warn) yuborildi!</b>\n\n"
        f"<b>Target:</b> {emp['name']} ({target_username})\n"
        f"<b>Daraja:</b> {level}/5\n"
        f"<b>Sababi:</b> {reason}\n"
        f"<b>Beruvchi:</b> {requester['name']}\n\n"
        f"📉 <i>KPI 5 ballga kamaydi.</i>",
        parse_mode="HTML"
    )
    
    if level >= 5:
        await message.answer(f"❌ <b>XODIM BAN QILINDI!</b>\n{emp['name']} ogohlantirish limiti (5/5) sababli guruhdan chetlatildi!")

# Gemini AI chat analyzer: /analyze
@dp.message(Command("analyze"))
async def cmd_analyze(message: Message, command: CommandObject):
    tg_id = message.from_user.id
    requester = db.get_employee(tg_id)
    if not requester or requester["role"] not in ["owner", "admin"]:
        await message.reply("❌ Faqat Adminlar /analyze qila oladi!")
        return
        
    hours = 24
    if command.args and command.args.isdigit():
        hours = int(command.args)
        
    loading = await message.reply("⏳ Chat loglari yig'ilmoqda va Gemini AI orqali tahlil qilinmoqda...")
    report = await asyncio.to_thread(analyze_chat_activity, hours)
    
    await bot.delete_message(message.chat.id, loading.message_id)
    await message.reply(f"📊 <b>Gemini AI Chat Tahlili (Oxirgi {hours} soat):</b>\n\n{report}", parse_mode="Markdown")

# Weekly report PDF command: /pdf
@dp.message(Command("pdf"))
async def cmd_pdf(message: Message):
    filename = "weekly_report.pdf"
    await asyncio.to_thread(generate_weekly_pdf, filename)
    
    if os.path.exists(filename):
        pdf_file = FSInputFile(filename)
        await message.reply_document(pdf_file, caption="📄 Wentric Haftalik KPI, Davomat va Reyting hisoboti PDF formatida.")
    else:
        await message.reply("❌ PDF yaratishda xatolik yuz berdi.")

# ==============================================================================
# 6. GROUP AND ONBOARDING INPUT HANDLER
# ==============================================================================
@dp.message(F.chat.type == "private")
async def handle_private_message(message: Message):
    if not message.text:
        # Handle photo submissions in step 3
        if message.photo:
            tg_id = message.from_user.id
            emp = db.get_employee(tg_id)
            if emp and emp["draft_step"] == 3:
                # We can save a simulated photo URL
                file_id = message.photo[-1].file_id
                photo_url = f"https://api.telegram.org/file/bot{BOT_TOKEN}/{file_id}"
                db.update_employee_draft(tg_id, photo_url=photo_url, draft_step=4)
                await message.reply("📸 Rasm muvaffaqiyatli qabul qilindi!")
                await prompt_draft_step(message, tg_id, 4)
            return
        return
        
    text = message.text.strip()
    tg_id = message.from_user.id
    username = f"@{message.from_user.username}" if message.from_user.username else f"id_{tg_id}"
    
    # Handle Userbot dynamic login connection state
    if tg_id in userbot_states:
        await handle_userbot_setup(message, tg_id, userbot_states[tg_id], text)
        return
        
    emp = db.get_employee(tg_id)
    if not emp:
        db.create_guest(tg_id, username)
        emp = db.get_employee(tg_id)
        
    # If the user is fully completed, ignore non-command messages
    if not emp or emp["is_profile_complete"] == 2:
        if not text.startswith("/"):
            await message.answer("🤖 Iltimos, buyruqlardan foydalaning. Hamma buyruqlar uchun /help bosing.")
        return

    step = emp["draft_step"]

    # Step 0: Check Invite Code
    if step == 0:
        if db.verify_invite_code(text, username):
            db.update_employee_draft(tg_id, draft_step=1, is_profile_complete=1)
            await message.answer(
                "✅ <b>Taklif kodi muvaffaqiyatli tasdiqlandi!</b>\n\n"
                "Endi Wentric Resident profilingizni shakllantirishimiz kerak.\n"
                "<i>Xohlagan vaqtda /cancel orqali hamma ma'lumotni tozalashingiz mumkin.</i>",
                parse_mode="HTML"
            )
            await prompt_draft_step(message, tg_id, 1)
        else:
            await message.answer("❌ <b>Noto'g'ri yoki ishlatilgan taklif kodi!</b>\nIltimos, haqiqiy taklif kodini kiriting yoki administratorlar bilan bog'laning.")
        return

    # Step 1: Input Full Name
    elif step == 1:
        if len(text) < 3:
            await message.answer("⚠️ F.I.Sh juda qisqa. Qayta kiriting:")
            return
        db.update_employee_draft(tg_id, name=text, draft_step=2)
        await message.answer(f"👍 Ismingiz <b>'{text}'</b> deb qabul qilindi.")
        await prompt_draft_step(message, tg_id, 2)
        return

    # Step 2: Input Email
    elif step == 2:
        if not is_valid_email(text):
            await message.answer("⚠️ Elektron pochta manzili noto'g'ri formatda. Qayta kiriting (Masalan: resident@wentric.com):")
            return
        db.update_employee_draft(tg_id, email=text, draft_step=3)
        await message.answer(f"👍 Elektron pochtangiz <b>'{text}'</b> deb bog'landi.")
        await prompt_draft_step(message, tg_id, 3)
        return

    # Step 3: Input Photo URL
    elif step == 3:
        photo_url = text
        if not (text.startswith("http://") or text.startswith("https://")):
            photo_url = f"https://api.dicebear.com/7.x/bottts/svg?seed={tg_id}"
            await message.answer("🤖 Havola noto'g'ri bo'lganligi sababli, sizga robot avatarlardan biri generatsiya qilindi.")
            
        db.update_employee_draft(tg_id, photo_url=photo_url, draft_step=4)
        await message.answer("👍 Profil rasmi bog'landi.")
        await prompt_draft_step(message, tg_id, 4)
        return

    # Step 4: Input Portfolio / Bio and Finalize
    elif step == 4:
        if len(text) < 10:
            await message.answer("⚠️ Portfoliongiz juda qisqa. Kamida 10 ta belgida batafsil ma'lumot yozing:")
            return
            
        random_id = f"RES-{tg_id % 10000}"
        db.update_employee_draft(
            tg_id, 
            id=random_id,
            bio_portfolio=text, 
            draft_step=5, 
            is_profile_complete=2,
            income=3000.0,
            work_quality=95
        )
        
        await message.answer(
            f"🎉 <b>MUVAFFAQIYATLI RO'YXATDAN O'TDINGIZ!</b>\n\n"
            f"Wentric Corporation jamoasiga xush kelibsiz. Sizning shaxsiy <b>Resident Card</b>-ingiz faollashtirildi!\n\n"
            f"🆔 <b>Rezident ID:</b> <code>{random_id}</code>\n"
            f"📧 <b>Elektron pochta:</b> {emp['email'] if 'email' in emp else text}\n"
            f"⭐ <b>Reyting:</b> 0 ball (Boshlang'ich)\n\n"
            f"Siz endi barcha rasmiy guruhlarimizda yozishingiz, vazifalarni qabul qilishingiz hamda o'z portfoliosingizni boshqarishingiz mumkin!\n"
            f"Profilingizni ko'rish uchun: /about buyrug'ini yuboring.",
            parse_mode="HTML"
        )

# Group security monitoring
@dp.message(F.chat.type.in_({"group", "supergroup"}))
async def handle_group_message(message: Message):
    if not message.from_user or message.from_user.is_bot:
        return
        
    tg_id = message.from_user.id
    username = f"@{message.from_user.username}" if message.from_user.username else f"id_{tg_id}"
    
    # Check if AI monitoring is globally active
    ai_status = db.get_config("ai_active", "1")
    if ai_status == "1":
        db.log_message(username, message.from_user.full_name, message.text or "[Media/File]")
        
    # Check if the user is verified
    emp = db.get_employee(tg_id)
    if not emp or emp["is_profile_complete"] != 2:
        # Avoid blocking bot commands in groups so guests can use commands
        if message.text and message.text.startswith("/"):
            return
            
        # Delete and warn
        try:
            await message.delete()
        except Exception:
            pass
            
        warning_msg = await message.answer(
            f"⚠️ <b>KIBER XAVFSIZLIK CHEKLOVI!</b>\n\n"
            f"Foydalanuvchi {message.from_user.full_name} ({username}) Wentric rezidentlaridan emas yoki profilingizni yakunlamagansiz!\n"
            f"🔑 Guruhda yozish uchun @WentricEmployeeBot shaxsiy chatiga o'tib, ro'yxatdan o'ting.",
            parse_mode="HTML"
        )
        
        # Auto-delete warning after 15 seconds to keep chat clean
        await asyncio.sleep(15)
        try:
            await warning_msg.delete()
        except Exception:
            pass

async def main():
    print("Wentric Advanced Corporate Bot is launching...")
    
    # Restore saved userbot sessions
    try:
        userbots_to_restore = db.get_userbot_configs()
        if userbots_to_restore:
            print(f"Restoring {len(userbots_to_restore)} saved userbot sessions...")
            for config in userbots_to_restore:
                tg_id = config["tg_id"]
                api_id = config["api_id"]
                api_hash = config["api_hash"]
                session_path = f"userbot_session_{tg_id}"
                
                try:
                    print(f"Connecting userbot for {tg_id}...")
                    client = TelegramClient(session_path, api_id, api_hash)
                    await client.connect()
                    
                    if await client.is_user_authorized():
                        active_userbots[tg_id] = client
                        await launch_userbot_listeners(tg_id, client)
                        print(f"✓ Userbot {tg_id} successfully reconnected and listening!")
                    else:
                        print(f"⚠ Userbot {tg_id} session is not authorized. Skipping.")
                except Exception as inner_e:
                    print(f"Error restoring userbot {tg_id}: {inner_e}")
    except Exception as e:
        print(f"Error reading userbot configs: {e}")
        
    await dp.start_polling(bot)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        print("Bot to'xtatildi.")
