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

def update_db(path):
    if not os.path.exists(path):
        print(f"Skipping {path} (not found)")
        return
    
    print(f"Updating {path}...")
    try:
        conn = sqlite3.connect(path)
        cursor = conn.cursor()
        
        # Check if Setting table exists (to avoid errors if schema is different)
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='Setting'")
        if not cursor.fetchone():
            print(f"  Setting table does not exist in {path}")
            conn.close()
            return

        # Check if setting exists
        cursor.execute("SELECT id FROM Setting WHERE key = ?", ('cod_enabled',))
        row = cursor.fetchone()
        
        if row:
            cursor.execute("UPDATE Setting SET value = ? WHERE key = ?", ('true', 'cod_enabled'))
            print(f"  Updated cod_enabled to true in {path}")
        else:
            cursor.execute("INSERT INTO Setting (id, key, value) VALUES (?, ?, ?)", 
                           (str(uuid4()), 'cod_enabled', 'true'))
            print(f"  Inserted cod_enabled as true in {path}")
        
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"  Error updating {path}: {e}")

if __name__ == "__main__":
    for p in db_paths:
        update_db(p)
