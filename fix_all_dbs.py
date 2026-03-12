import sqlite3
import os
from uuid import uuid4

# Root directory of the project
ROOT_DIR = r"c:\Users\jawad\OneDrive\Desktop\Low cost"

db_paths = [
    os.path.join(ROOT_DIR, 'backend', 'dev.db'),
    os.path.join(ROOT_DIR, 'prisma', 'dev.db'),
    os.path.join(ROOT_DIR, 'dev.db')
]

def check_and_fix_all():
    print("--- Settings Scan ---")
    for path in db_paths:
        if not os.path.exists(path):
            print(f"Path not found: {path}")
            continue
            
        print(f"Scanning: {path}")
        try:
            conn = sqlite3.connect(path)
            cursor = conn.cursor()
            
            # Check if table exists
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='Setting'")
            if not cursor.fetchone():
                print(f"  Table 'Setting' missing in {path}")
                conn.close()
                continue
            
            # Read all settings
            cursor.execute("SELECT key, value FROM Setting")
            rows = cursor.fetchall()
            print(f"  Current: {dict(rows)}")
            
            # Ensure cod_enabled is true
            keys = [r[0] for r in rows]
            if 'cod_enabled' in keys:
                cursor.execute("UPDATE Setting SET value = ? WHERE key = ?", ('true', 'cod_enabled'))
                print("  Updated cod_enabled")
            else:
                cursor.execute("INSERT INTO Setting (id, key, value) VALUES (?, ?, ?)", 
                               (str(uuid4()), 'cod_enabled', 'true'))
                print("  Inserted cod_enabled")
            
            # Double check
            cursor.execute("SELECT key, value FROM Setting")
            print(f"  Final: {dict(cursor.fetchall())}")
            
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"  Error: {e}")
    print("--- Scan Done ---")

if __name__ == "__main__":
    check_and_fix_all()
