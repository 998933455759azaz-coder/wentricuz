import os
import asyncio
import re
from dotenv import load_dotenv
from aiogram import Bot, Dispatcher, F
from aiogram.filters import Command, CommandObject
from aiogram.types import Message, FSInputFile, ReplyKeyboardMarkup, KeyboardButton, ReplyKeyboardRemove

import database as db
from gemini_analyzer import analyze_chat_activity
from pdf_generator import generate_weekly_pdf

load_dotenv()

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
GROUP_ID = os.getenv("GROUP_ID")
OWNER_ID = os.getenv("OWNER_ID") # Initial owner telegram ID

if not BOT_TOKEN:
    raise ValueError("TELEGRAM_BOT_TOKEN topilmadi! Iltimos, .env faylini tekshiring.")

# Initialize SQLite database and pass the default owner ID
db.init_db(default_owner_id=OWNER_ID)

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

def is_valid_email(email: str) -> bool:
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return bool(re.match(pattern, email))

# Handle /start command
@dp.message(Command("start"))
async def cmd_start(message: Message):
    tg_id = message.from_user.id
    username = f"@{message.from_user.username}" if message.from_user.username else f"id_{tg_id}"
    
    # Create guest row if they don't exist
    db.create_guest(tg_id, username)
    emp = db.get_employee(tg_id)
    
    if emp and emp["is_profile_complete"] == 2:
        await message.answer(
            f"👋 <b>Assalomu alaykum, {emp['name']}!</b>\n"
            f"Siz <b>Wentric Corporation</b> rasmiy rezidentisiz. Bot barcha imkoniyatlari siz uchun ochiq.\n\n"
            f"<b>Mavjud buyruqlar:</b>\n"
            f"• /about - O'zingiz haqida ma'lumot\n"
            f"• /anon - Profilingiz ko'rinishini sozlash\n"
            f"• /stats - Ish va daromad statistikasi\n"
            f"• /pdf - Haftalik PDF hisobotni olish\n"
            f"• /help - Yordam menyusi",
            parse_mode="HTML"
        )
        return

    # User is not a verified resident
    # If they are currently in draft step, remind them
    step = emp["draft_step"] if emp else 0
    if step > 0:
        await message.answer(
            "⚠️ <b>Siz profil yaratish jarayonidasiz!</b>\n"
            "Profilni oxiriga yetkazishingiz yoki bekor qilishingiz kerak.\n"
            "• Arizani bekor qilish va qaytadan boshlash uchun: /cancel yuboring.",
            parse_mode="HTML"
        )
        await prompt_draft_step(message, tg_id, step)
        return

    await message.answer(
        "🔒 <b>Wentric Corporation Resident Portaliga xush kelibsiz!</b>\n\n"
        "Guruhda va tizimda yozish hamda rasmiy rezident kartochkasiga ega bo'lish uchun "
        "sizga maxsus <b>taklif kodi (Resident Code)</b> kerak bo'ladi.\n\n"
        "🔑 Iltimos, taklif kodingizni kiriting:",
        parse_mode="HTML"
    )

async def prompt_draft_step(message: Message, tg_id: int, step: int):
    if step == 1:
        await message.answer("✍️ Iltimos, o'z <b>To'liq ism-sharifingizni (F.I.Sh)</b> kiriting:")
    elif step == 2:
        await message.answer("📧 Iltimos, <b>Elektron pochta (Email)</b> manzilingizni kiriting:")
    elif step == 3:
        await message.answer("📸 Iltimos, o'zingizning haqiqiy profilingiz uchun <b>Rasm URL manzili</b> kiriting (yoki profil rasmini yuboring):")
    elif step == 4:
        await message.answer("📝 Portfoliongiz yoki qiladigan ishlaringiz haqida batafsil <b>qisqacha bio/portfolio</b> yozing:")

# Handle /cancel or /clear
@dp.message(Command(commands=["cancel", "clear"]))
async def cmd_cancel(message: Message):
    tg_id = message.from_user.id
    db.clear_draft(tg_id)
    await message.answer(
        "🧹 <b>Sizning profilingiz loyihasi butunlay tozalandi va bekor qilindi.</b>\n"
        "Qaytadan boshlash uchun istalgan vaqtda /start buyrug'ini bosing.",
        parse_mode="HTML",
        reply_markup=ReplyKeyboardRemove()
    )

# Handle /help
@dp.message(Command("help"))
async def cmd_help(message: Message):
    await message.answer(
        "🧠 <b>Wentric Bot Buyruqlar Qo'llanmasi:</b>\n\n"
        "<b>Asosiy buyruqlar:</b>\n"
        "• /start - Profilingizni boshlash/yangilash\n"
        "• /about - Profil kartochkangizni ko'rish\n"
        "• /about @username - Boshqalarni ko'rish\n"
        "• /anon - Profilingizni maxfiy/ochiq qilish\n"
        "• /stats - Ish va daromad statistikasi\n"
        "• /cancel - Arizani tozalab bekor qilish\n\n"
        "<b>Ma'muriy buyruqlar (Adminlar uchun):</b>\n"
        "• /warn @username [sabab] - Ogohlantirish berish\n"
        "• /reward @username [+/- ball] - Zumrad/Temir rating berish\n"
        "• /code [yangi_kod] - Yangi taklif kodi yaratish\n"
        "• /ai_on - AI monitoringni yoqish\n"
        "• /ai_off - AI monitoringni o'chirish\n"
        "• /owner @username - Egadorlik (Owner) huquqini berish\n"
        "• /admin @username - Adminlik (Admin) huquqini berish\n"
        "• /pdf - Haftalik PDF generatsiya qilish",
        parse_mode="HTML"
    )

# Handle onboarding state machine in chat
@dp.message(F.chat.type == "private")
async def handle_private_message(message: Message):
    if not message.text:
        return
        
    text = message.text.strip()
    tg_id = message.from_user.id
    username = f"@{message.from_user.username}" if message.from_user.username else f"id_{tg_id}"
    
    emp = db.get_employee(tg_id)
    if not emp:
        db.create_guest(tg_id, username)
        emp = db.get_employee(tg_id)
        
    if not emp or emp["is_profile_complete"] == 2:
        # Standard verified user, ignore plain messages unless commands
        if not text.startswith("/"):
            await message.answer("🤖 Iltimos, buyruqlardan foydalaning. Qo'llanma uchun /help bosing.")
        return

    step = emp["draft_step"]

    # Step 0: Check Invite Code
    if step == 0:
        if db.verify_invite_code(text, username):
            db.update_employee_draft(tg_id, draft_step=1, is_profile_complete=1)
            await message.answer(
                "✅ <b>Taklif kodi muvaffaqiyatli tasdiqlandi!</b>\n\n"
                "Endi Wentric Resident profilingizni shakllantirishimiz kerak.\n"
                "<i>Chala qolsa istalgan vaqtda /cancel orqali tozalashingiz mumkin.</i>",
                parse_mode="HTML"
            )
            await prompt_draft_step(message, tg_id, 1)
        else:
            await message.answer("❌ <b>Noto'g'ri yoki ishlatilgan taklif kodi!</b>\nIltimos, haqiqiy taklif kodini kiriting yoki admin bilan bog'laning.")
        return

    # Step 1: Input Full Name
    elif step == 1:
        if len(text) < 3:
            await message.answer("⚠️ Ism juda qisqa. Iltimos haqiqiy ism-sharifingizni kiriting:")
            return
        db.update_employee_draft(tg_id, name=text, draft_step=2)
        await message.answer(f"👍 Ismingiz <b>'{text}'</b> deb saqlandi.")
        await prompt_draft_step(message, tg_id, 2)
        return

    # Step 2: Input Email
    elif step == 2:
        if not is_valid_email(text):
            await message.answer("⚠️ Noto'g'ri email formati! Iltimos, haqiqiy elektron pochtangizni yuboring (Masalan: resident@wentric.com):")
            return
        db.update_employee_draft(tg_id, email=text, draft_step=3)
        await message.answer(f"👍 Elektron pochtangiz <b>'{text}'</b> deb saqlandi.")
        await prompt_draft_step(message, tg_id, 3)
        return

    # Step 3: Input Photo URL
    elif step == 3:
        # Accept text link or photo
        photo_url = text
        if not (text.startswith("http://") or text.startswith("https://")):
            # Simple fallback / mock avatar
            photo_url = f"https://api.dicebear.com/7.x/bottts/svg?seed={tg_id}"
            await message.answer("🤖 Profil rasmingiz uchun chiroyli avtomatik avatar generatsiya qilindi.")
            
        db.update_employee_draft(tg_id, photo_url=photo_url, draft_step=4)
        await message.answer("👍 Profil rasmi muvaffaqiyatli biriktirildi.")
        await prompt_draft_step(message, tg_id, 4)
        return

    # Step 4: Input Portfolio / Bio and Finalize
    elif step == 4:
        if len(text) < 10:
            await message.answer("⚠️ Bio juda qisqa. Portfoliongiz, ko'nikmalaringiz va tajribangiz haqida batafsilroq yozing:")
            return
            
        random_id = f"RES-{tg_id % 10000}"
        db.update_employee_draft(
            tg_id, 
            id=random_id,
            bio_portfolio=text, 
            draft_step=5, 
            is_profile_complete=2,
            income=2500.0, # Initial base simulated income
            work_quality=95 # Initial base simulated work quality
        )
        
        await message.answer(
            f"🎉 <b>TABRIKLAYMIZ! PROFIL TAYYOR!</b>\n\n"
            f"Sizning <b>Wentric Resident Card</b> profilingiz faollashtirildi!\n"
            f"🆔 <b>Sizning Rezident ID:</b> <code>{random_id}</code>\n"
            f"📧 <b>Email:</b> {emp['email'] if 'email' in emp else text}\n"
            f"🏆 <b>Boshlang'ich reytingingiz:</b> 0 ball\n\n"
            f"Endi siz guruh chatlarida to'liq huquqli rezident sifatida qatnasha olasiz va o'z faoliyatingizni yuritasiz!\n"
            f"Profilingizni tekshirish uchun istalgan joyda /about buyrug'ini bosing.",
            parse_mode="HTML"
        )

# Group message monitor
@dp.message(F.chat.type.in_({"group", "supergroup"}))
async def handle_group_message(message: Message):
    if not message.from_user or message.from_user.is_bot:
        return
        
    tg_id = message.from_user.id
    username = f"@{message.from_user.username}" if message.from_user.username else f"id_{tg_id}"
    
    # Check if AI monitoring is globally on
    ai_status = db.get_config("ai_active", "1")
    if ai_status == "1":
        db.log_message(username, message.from_user.full_name, message.text or "[Media]")
        
    # Check if this user is a completed resident
    emp = db.get_employee(tg_id)
    if not emp or emp["is_profile_complete"] != 2:
        # Check if they are trying to write in the group without completing resident card
        # Exclude commands so they can run /about etc.
        if message.text and message.text.startswith("/"):
            return
            
        warning_msg = await message.reply(
            f"⚠️ <b>GURUHDA YOZISH TAQIQLANGAN!</b>\n\n"
            f"Foydalanuvchi {message.from_user.full_name} ({username}) hali rezidentlik kartasini yakunlamagan!\n"
            f"🔑 Guruhda yozish uchun shaxsiy chatda @WentricEmployeeBot-ga o'tib, taklif kodingizni kiriting va ro'yxatdan o'ting.\n"
            f"<i>Aks holda guruhdan chiqarib yuborilasiz.</i>",
            parse_mode="HTML"
        )
        # Optionally mute or kick them

# Command /about
@dp.message(Command("about"))
async def cmd_about(message: Message, command: CommandObject):
    tg_id = message.from_user.id
    requester = db.get_employee(tg_id)
    
    # Check if they target another user
    target_username = command.args.strip() if command.args else None
    
    if target_username:
        target = db.get_employee(target_username)
    else:
        target = requester

    if not target:
        await message.reply("❌ Foydalanuvchi topilmadi yoki hali rezidentlik kartasiga ega emas.")
        return

    # Check visibility rules
    is_owner_or_admin = requester and requester["role"] in ["owner", "admin"]
    is_self = requester and target and (requester["telegram_id"] == target["telegram_id"])
    
    if target["visibility"] == "owner_only" and not is_owner_or_admin and not is_self:
        await message.reply("🔒 Ushbu foydalanuvchi o'z profilini faqat tizim egalari (owner) ko'ra oladigan qilib sozlagan.")
        return
        
    if target["visibility"] == "anonymous" and not is_owner_or_admin and not is_self:
        # Show anonymous card
        await message.reply(
            f"👥 <b>Maxfiy Rezident Profiliningiz:</b>\n"
            f"🆔 ID: <code>{target['id']}</code>\n"
            f"⭐ Reyting: {target['rating']} ball\n"
            f"💎 Zumrad/Temir nishonlari: {', '.join(target['badges']) if target['badges'] else 'Yo\'q'}\n"
            f"💼 Lavozimi: {target['position']}\n"
            f"<i>Foydalanuvchi o'z shaxsini yashirgan.</i>",
            parse_mode="HTML"
        )
        return

    # Standard Profile Output (Aesthetic, fully loaded portfolio)
    badges_str = " ".join([f"💎 {b}" for b in target["badges"]]) if target["badges"] else "Nishonlar yo'q"
    
    # Professional portfolio layout
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
        f"🏅 <b>Zumrad/Temir unvonlari:</b> {badges_str}\n"
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

# Admin reward command /reward
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
        await message.reply("❌ Ushbu kod allaqachon mavjud yoki xatolik yuz berdi.")

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

async def main():
    print("Wentric Advanced Employee Bot muvaffaqiyatli ishga tushdi...")
    await dp.start_polling(bot)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        print("Bot to'xtatildi.")
