#!/bin/bash

# ==============================================================================
# Wentric Corporation - Employee Management System (WCEMS) Setup Script
# ==============================================================================

# Ranglar kodlari (Terminal dizayni uchun)
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "========================================================================"
echo "    __      __  ______   _   _   _______   _____    _____    _____      "
echo "    \ \    / / |  ____| | \ | | |__   __| |  __ \  |_   _|  / ____|     "
echo "     \ \  / /  | |__    |  \| |    | |    | |__) |   | |   | |          "
echo "      \ \/ /   |  __|   | . \` |    | |    |  _  /    | |   | |          "
echo "       \  /    | |____  | |\  |    | |    | | \ \   _| |_  | |____      "
echo "        \/     |______| |_| \_|    |_|    |_|  \_\ |_____|  \_____|     "
echo "                                                                        "
echo "         Wentric Employee Management System (WCEMS) v1.5 Setup          "
echo "========================================================================"
echo -e "${NC}"

# 1. Sudo huquqini tekshirish
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}❌ XATOLIK: Ushbu skriptni ishga tushirish uchun sudo/root huquqi talab qilinadi!${NC}"
  echo -e "${YELLOW}Iltimos, qaytadan sinab ko'ring: sudo bash setup.sh${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Root huquqi tasdiqlandi.${NC}"

# 2. Paketlar mavjudligini tekshirish va o'rnatish
echo -e "\n${BLUE}[1/5] Tizim paketlarini tekshirish va o'rnatish...${NC}"
apt-get update -y

PACKAGES=(python3 python3-pip python3-venv sqlite3 git curl)
for pkg in "${PACKAGES[@]}"; do
    if dpkg -l | grep -q " $pkg "; then
        echo -e "${GREEN}✓ $pkg allaqachon o'rnatilgan.${NC}"
    else
        echo -e "${YELLOW}⚙ $pkg o'rnatilmoqda...${NC}"
        apt-get install -y "$pkg"
    fi
done

# 3. Foydalanuvchidan kerakli ma'lumotlarni so'rash
echo -e "\n${BLUE}[2/5] WCEMS Sozlamalarini kiritish...${NC}"

# Telegram Bot Token
while true; do
    read -p "🔑 Telegram Bot Token-ni kiriting: " BOT_TOKEN
    if [ -n "$BOT_TOKEN" ]; then
        break
    else
        echo -e "${RED}Token bo'sh bo'lishi mumkin emas!${NC}"
    fi
done

# Owner Telegram ID
while true; do
    read -p "👤 Loyiha Egasi (Owner) Telegram ID-sini kiriting: " OWNER_ID
    if [[ "$OWNER_ID" =~ ^[0-9]+$ ]]; then
        break
    else
        echo -e "${RED}Telegram ID faqat raqamlardan iborat bo'lishi kerak!${NC}"
    fi
done

# Gemini API Key (Ixtiyoriy)
read -p "🤖 Gemini API Key-ni kiriting (Ixtiyoriy, bosish enter): " GEMINI_KEY

# Telegram API ID va HASH (Userbot uchun, ixtiyoriy)
echo -e "${YELLOW}Telethon Userbot sozlamalari (Ixtiyoriy, keyinroq .env orqali kiritsa ham bo'ladi):${NC}"
read -p "🔹 TELEGRAM_API_ID kiriting (Enter skipping): " API_ID
read -p "🔹 TELEGRAM_API_HASH kiriting (Enter skipping): " API_HASH

# 4. .env faylini yaratish
echo -e "\n${BLUE}[3/5] .env konfiguratsiya fayli shakllantirilmoqda...${NC}"
cat <<EOT > .env
# Port and App URLs
PORT=3000
APP_URL=http://localhost:3000

# Core Telegram Bot Configurations
TELEGRAM_BOT_TOKEN="${BOT_TOKEN}"
GROUP_ID=""
OWNER_ID="${OWNER_ID}"

# Gemini API Key for Chat Analytics
GEMINI_API_KEY="${GEMINI_KEY}"

# Telethon Userbot API Details
TELEGRAM_API_ID="${API_ID}"
TELEGRAM_API_HASH="${API_HASH}"
EOT

echo -e "${GREEN}✓ .env fayli muvaffaqiyatli yaratildi!${NC}"

# 5. Virtual Muhit (Venv) yaratish va paketlarni o'rnatish
echo -e "\n${BLUE}[4/5] Python virtual muhitini (venv) yaratish va o'rnatish...${NC}"
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}✓ venv virtual muhit yaratildi.${NC}"
fi

echo -e "${YELLOW}⚙ Virtual muhit faollashtirilmoqda va paketlar o'rnatilmoqda...${NC}"
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Ma'lumotlar bazasini dastlabki ishga tushirish va ownerni kiritish
echo -e "${YELLOW}⚙ SQLite3 ma'lumotlar bazasini ishga tushirish...${NC}"
python3 -c "import database; database.init_db('$OWNER_ID')"
echo -e "${GREEN}✓ Ma'lumotlar bazasi va owner roli sozlandi.${NC}"

# 6. Systemd servisini yaratish va yoqish
echo -e "\n${BLUE}[5/5] Systemctl tizim servisini sozlash...${NC}"
WORKING_DIR=$(pwd)

cat <<EOT > /etc/systemd/system/wentric-bot.service
[Unit]
Description=Wentric Corporation Employee Bot Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=${WORKING_DIR}
ExecStart=${WORKING_DIR}/venv/bin/python3 ${WORKING_DIR}/bot.py
Restart=always
RestartSec=5
EnvironmentFile=${WORKING_DIR}/.env

[Install]
WantedBy=multi-user.target
EOT

echo -e "${YELLOW}⚙ Systemd daemon yangilanmoqda...${NC}"
systemctl daemon-reload
systemctl enable wentric-bot
systemctl restart wentric-bot

echo -e "\n${GREEN}========================================================================${NC}"
echo -e "${GREEN}🎉 TABRIKLAYMIZ! WENTRIC BOT MUVAFFAQIYATLI SOZLANDI!${NC}"
echo -e "${GREEN}========================================================================${NC}"
echo -e "• Bot holati (systemctl status):"
systemctl status wentric-bot --no-pager

echo -e "\n• Loglarni real vaqtda kuzatish uchun:"
echo -e "${CYAN}journalctl -u wentric-bot -f${NC}"
echo -e "\n• Botni qayta ishga tushirish:"
echo -e "${CYAN}systemctl restart wentric-bot${NC}"
echo -e "========================================================================"
