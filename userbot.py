import os
import asyncio
import sqlite3
from dotenv import load_dotenv
from telethon import TelegramClient, events

load_dotenv()

# Telethon API credentials (from https://my.telegram.org)
API_ID = os.getenv("TELEGRAM_API_ID")
API_HASH = os.getenv("TELEGRAM_API_HASH")
SESSION_NAME = "wentric_userbot_session"

# We check if Telethon setup is possible
if not API_ID or not API_HASH:
    print("⚠️ DIQQAT: TELEGRAM_API_ID va TELEGRAM_API_HASH .env da aniqlanmadi.")
    print("Userbot faollashishi uchun bularni .env fayliga kiritish kerak.")

def check_resident(username: str) -> bool:
    """Check if the user is a registered resident in SQLite"""
    if not username:
        return False
    if not username.startswith("@"):
        username = f"@{username}"
        
    conn = sqlite3.connect("wentric_employees.db")
    cursor = conn.cursor()
    cursor.execute("SELECT is_profile_complete FROM employees WHERE username = ?", (username,))
    row = cursor.fetchone()
    conn.close()
    return row is not None and row[0] == 2

async def start_userbot():
    if not API_ID or not API_HASH:
        print("❌ Telethon API hisoblari kiritilmagan. Userbot ishga tushmadi.")
        return

    print("🤖 Telethon Userbot ulanmoqda...")
    client = TelegramClient(SESSION_NAME, int(API_ID), API_HASH)

    @client.on(events.NewMessage(incoming=True))
    async def handle_new_message(event):
        # Listen only to messages in group chats
        if event.is_group:
            sender = await event.get_sender()
            if not sender:
                return
                
            username = sender.username
            full_name = f"{sender.first_name or ''} {sender.last_name or ''}".strip()
            
            # If the user has a username, verify resident card
            if username:
                is_ok = check_resident(username)
                if not is_ok:
                    # Userbot detects an unverified user posting!
                    print(f"🚨 [Userbot Alert] Guruhda tasdiqlanmagan foydalanuvchi: @{username} ({full_name})")
                    # Optionally, the userbot can reply to warn or flag
                    # await event.reply("⚠️ [Tizim Xabarnomasi] Siz Wentric Corporation rezidentlar bazasida emassiz!")
            else:
                # No username, check if they are in base
                is_ok = check_resident(f"id_{sender.id}")
                if not is_ok:
                    print(f"🚨 [Userbot Alert] Guruhda rasmiy ID-si bo'lmagan foydalanuvchi: id_{sender.id} ({full_name})")

    await client.start()
    print("✅ Telethon Userbot muvaffaqiyatli ishga tushdi va guruhlarni kuzatmoqda!")
    await client.run_until_disconnected()

if __name__ == "__main__":
    try:
        asyncio.run(start_userbot())
    except Exception as e:
        print(f"❌ Userbot ishga tushirishda xatolik: {e}")
