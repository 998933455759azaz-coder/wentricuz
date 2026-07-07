import sqlite3
import datetime
import json

DB_NAME = "wentric_employees.db"

def init_db(default_owner_id=None):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    # Xodimlar va Rezidentlar jadvali
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS employees (
        id TEXT PRIMARY KEY,
        name TEXT,
        username TEXT UNIQUE,
        telegram_id INTEGER UNIQUE,
        position TEXT DEFAULT 'Resident Intern',
        grade TEXT DEFAULT 'G7',
        department TEXT DEFAULT 'Engineering',
        manager TEXT DEFAULT 'CTO',
        status TEXT DEFAULT 'Active',
        kpi INTEGER DEFAULT 100,
        bonus REAL DEFAULT 0,
        warnings INTEGER DEFAULT 0,
        vacation_days INTEGER DEFAULT 12,
        email TEXT,
        bio_portfolio TEXT,
        photo_url TEXT,
        is_profile_complete INTEGER DEFAULT 0, -- 0: Guest, 1: Draft/Incomplete, 2: Fully Verified
        draft_step INTEGER DEFAULT 0, -- 0: Pending Code, 1: Full Name, 2: Email, 3: Photo, 4: Bio
        rating INTEGER DEFAULT 0,
        badges TEXT DEFAULT '[]', -- JSON string of stickers/badges
        visibility TEXT DEFAULT 'public', -- public, anonymous, owner_only
        role TEXT DEFAULT 'resident', -- owner, admin, resident
        income REAL DEFAULT 0.0, -- Daromad statistikasi
        work_quality INTEGER DEFAULT 100 -- Ish sifati % da
    )
    ''')
    
    # Maxsus taklif / Rezidentlik kodlari jadvali
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS invite_codes (
        code TEXT PRIMARY KEY,
        is_used INTEGER DEFAULT 0,
        assigned_to TEXT,
        created_by TEXT
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
    
    # Global sozlamalar jadvali (AI on/off va b.)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS config (
        key TEXT PRIMARY KEY,
        value TEXT
    )
    ''')
    
    # Vazifalar jadvali
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        assigned_to TEXT NOT NULL,
        assigned_by TEXT NOT NULL,
        created_at TEXT NOT NULL,
        deadline_hours INTEGER NOT NULL,
        status TEXT DEFAULT 'Pending',
        submitted_at TEXT,
        submission_notes TEXT
    )
    ''')
    
    # Boshlang'ich sozlamalar
    cursor.execute("INSERT OR IGNORE INTO config (key, value) VALUES ('ai_active', '1')")
    cursor.execute("INSERT OR IGNORE INTO config (key, value) VALUES ('ai_strict', '0')")
    
    # Boshlang'ich taklif kodlarini yaratish (agar yo'q bo'lsa)
    cursor.execute("SELECT COUNT(*) FROM invite_codes")
    if cursor.fetchone()[0] == 0:
        cursor.execute("INSERT OR IGNORE INTO invite_codes (code, is_used, created_by) VALUES ('WENTRIC-2026-XYZ', 0, 'SYSTEM')")
        cursor.execute("INSERT OR IGNORE INTO invite_codes (code, is_used, created_by) VALUES ('WENTRIC-DEV-999', 0, 'SYSTEM')")
        cursor.execute("INSERT OR IGNORE INTO invite_codes (code, is_used, created_by) VALUES ('WENTRIC-CEO-111', 0, 'SYSTEM')")
        cursor.execute("INSERT OR IGNORE INTO invite_codes (code, is_used, created_by) VALUES ('WENTRIC-RES-777', 0, 'SYSTEM')")
    
    # Boshlang'ich ma'lumotlarni qo'shish (agar bo'sh bo'lsa)
    cursor.execute("SELECT COUNT(*) FROM employees")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO employees (id, name, username, telegram_id, position, grade, department, manager, kpi, bonus, warnings, is_profile_complete, role, income, work_quality, badges, rating)
        VALUES ('DEV-004', 'Hasanov Ilyos', '@hasanov_ilyos', 12345678, 'Backend Developer', 'G10', 'Engineering', 'CTO', 95, 500, 0, 2, 'resident', 3200.0, 98, '["Zumrad"]', 15)
        """)
        cursor.execute("""
        INSERT INTO employees (id, name, username, telegram_id, position, grade, department, manager, kpi, bonus, warnings, is_profile_complete, role, income, work_quality, badges, rating)
        VALUES ('CEO-001', 'Sardorbek Rakhmonov', '@sardor_ceo', 11111111, 'CEO', 'G15', 'Executive', 'Kengash', 98, 2500, 0, 2, 'owner', 15000.0, 100, '["Oltin", "Zumrad"]', 50)
        """)
        cursor.execute("""
        INSERT INTO employees (id, name, username, telegram_id, position, grade, department, manager, kpi, bonus, warnings, is_profile_complete, role, income, work_quality, badges, rating)
        VALUES ('CTO-002', 'Javoxir To''rayev', '@javoxir_cto', 22222222, 'CTO', 'G14', 'Engineering', 'CEO', 96, 1500, 0, 2, 'owner', 12000.0, 99, '["Zumrad"]', 42)
        """)
        
    # Agar default owner telegram ID berilgan bo'lsa, uni owner qilib qo'yish yoki yangi qo'shish
    if default_owner_id:
        try:
            cursor.execute("SELECT * FROM employees WHERE telegram_id = ?", (int(default_owner_id),))
            existing = cursor.fetchone()
            if existing:
                cursor.execute("UPDATE employees SET role = 'owner' WHERE telegram_id = ?", (int(default_owner_id),))
            else:
                cursor.execute("""
                INSERT INTO employees (id, name, username, telegram_id, position, grade, department, manager, is_profile_complete, role)
                VALUES ('OWNER-001', 'Tizim Egasi', 'owner_account', ?, 'Owner', 'G15', 'Executive', 'SYSTEM', 2, 'owner')
                """, (int(default_owner_id),))
        except Exception as e:
            print(f"Owner setup error: {e}")
            
    conn.commit()
    conn.close()

def get_employee(username_or_id):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    # verify if username_or_id is int (telegram id) or str (username or ID)
    if isinstance(username_or_id, int):
        cursor.execute("SELECT * FROM employees WHERE telegram_id = ?", (username_or_id,))
    elif str(username_or_id).startswith("@"):
        cursor.execute("SELECT * FROM employees WHERE username = ?", (username_or_id,))
    elif str(username_or_id).startswith("id_"):
        cursor.execute("SELECT * FROM employees WHERE telegram_id = ?", (int(username_or_id[3:]),))
    else:
        cursor.execute("SELECT * FROM employees WHERE id = ? OR username = ?", (username_or_id, username_or_id))
    
    row = cursor.fetchone()
    conn.close()
    if row:
        return {
            "id": row[0], "name": row[1], "username": row[2], "telegram_id": row[3],
            "position": row[4], "grade": row[5], "department": row[6], "manager": row[7],
            "status": row[8], "kpi": row[9], "bonus": row[10], "warnings": row[11],
            "vacation_days": row[12], "email": row[13], "bio_portfolio": row[14], "photo_url": row[15],
            "is_profile_complete": row[16], "draft_step": row[17], "rating": row[18],
            "badges": json.loads(row[19]) if row[19] else [], "visibility": row[20], "role": row[21],
            "income": row[22], "work_quality": row[23]
        }
    return None

def create_guest(telegram_id, username):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    emp_id = f"GST-{telegram_id % 100000}"
    cursor.execute("""
    INSERT OR IGNORE INTO employees (id, username, telegram_id, is_profile_complete, draft_step)
    VALUES (?, ?, ?, 0, 0)
    """, (emp_id, username, telegram_id))
    conn.commit()
    conn.close()

def update_employee_draft(telegram_id, **kwargs):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    for key, value in kwargs.items():
        if key == "badges":
            value = json.dumps(value)
        cursor.execute(f"UPDATE employees SET {key} = ? WHERE telegram_id = ?", (value, telegram_id))
    conn.commit()
    conn.close()

def clear_draft(telegram_id):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    # Reset to baseline guest state
    cursor.execute("""
    UPDATE employees 
    SET name = NULL, email = NULL, photo_url = NULL, bio_portfolio = NULL, 
        is_profile_complete = 0, draft_step = 0
    WHERE telegram_id = ?
    """, (telegram_id,))
    conn.commit()
    conn.close()

def verify_invite_code(code: str, username: str):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM invite_codes WHERE code = ? AND is_used = 0", (code,))
    row = cursor.fetchone()
    if row:
        cursor.execute("UPDATE invite_codes SET is_used = 1, assigned_to = ? WHERE code = ?", (username, code))
        conn.commit()
        conn.close()
        return True
    conn.close()
    return False

def add_invite_code(code: str, created_by: str):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO invite_codes (code, is_used, created_by) VALUES (?, 0, ?)", (code, created_by))
        conn.commit()
        conn.close()
        return True
    except Exception:
        conn.close()
        return False

def get_config(key: str, default=""):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT value FROM config WHERE key = ?", (key,))
    row = cursor.fetchone()
    conn.close()
    return row[0] if row else default

def set_config(key: str, value: str):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)", (key, value))
    conn.commit()
    conn.close()

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

def adjust_rating_and_badges(username: str, rating_change: int):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT rating, badges FROM employees WHERE username = ?", (username,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return None
    
    curr_rating = row[0] or 0
    badges = json.loads(row[1]) if row[1] else []
    
    new_rating = max(0, curr_rating + rating_change)
    
    # Calculate badges based on rating milestones
    # Zumrad, Temir, Kumush, Oltin
    new_badges = []
    if new_rating >= 10:
        new_badges.append("Temir")
    if new_rating >= 25:
        new_badges.append("Kumush")
    if new_rating >= 50:
        new_badges.append("Oltin")
    if new_rating >= 80:
        new_badges.append("Zumrad")
        
    # Merge existing custom badges if any, making sure list is unique
    for b in badges:
        if b not in new_badges:
            new_badges.append(b)
            
    cursor.execute("UPDATE employees SET rating = ?, badges = ? WHERE username = ?", 
                   (new_rating, json.dumps(new_badges), username))
    conn.commit()
    conn.close()
    return {"rating": new_rating, "badges": new_badges}

def get_financial_stats():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*), SUM(income), AVG(work_quality) FROM employees WHERE is_profile_complete = 2")
    row = cursor.fetchone()
    conn.close()
    return {
        "total_residents": row[0] or 0,
        "total_income": row[1] or 0.0,
        "avg_quality": int(row[2]) if row[2] else 100
    }

def add_task(title: str, description: str, assigned_to: str, assigned_by: str, deadline_hours: int):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    now = datetime.datetime.now().isoformat()
    cursor.execute("""
    INSERT INTO tasks (title, description, assigned_to, assigned_by, created_at, deadline_hours, status)
    VALUES (?, ?, ?, ?, ?, ?, 'Pending')
    """, (title, description, assigned_to, assigned_by, now, deadline_hours))
    conn.commit()
    conn.close()

def get_tasks_for_user(username: str):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tasks WHERE assigned_to = ? OR assigned_to = 'all' ORDER BY id DESC", (username,))
    rows = cursor.fetchall()
    conn.close()
    return [{
        "id": r[0], "title": r[1], "description": r[2], "assigned_to": r[3],
        "assigned_by": r[4], "created_at": r[5], "deadline_hours": r[6],
        "status": r[7], "submitted_at": r[8], "submission_notes": r[9]
    } for r in rows]

def get_all_tasks():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tasks ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    return [{
        "id": r[0], "title": r[1], "description": r[2], "assigned_to": r[3],
        "assigned_by": r[4], "created_at": r[5], "deadline_hours": r[6],
        "status": r[7], "submitted_at": r[8], "submission_notes": r[9]
    } for r in rows]

def get_task(task_id: int):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
    r = cursor.fetchone()
    conn.close()
    if r:
        return {
            "id": r[0], "title": r[1], "description": r[2], "assigned_to": r[3],
            "assigned_by": r[4], "created_at": r[5], "deadline_hours": r[6],
            "status": r[7], "submitted_at": r[8], "submission_notes": r[9]
        }
    return None

def submit_task(task_id: int, notes: str):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    now = datetime.datetime.now().isoformat()
    cursor.execute("UPDATE tasks SET status = 'Submitted', submitted_at = ?, submission_notes = ? WHERE id = ?", (now, notes, task_id))
    conn.commit()
    conn.close()

def update_task_status(task_id: int, status: str):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("UPDATE tasks SET status = ? WHERE id = ?", (status, task_id))
    conn.commit()
    conn.close()
