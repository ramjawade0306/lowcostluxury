import os
from dotenv import load_dotenv
load_dotenv()

import models
from database import SessionLocal, DATABASE_URL
from uuid import uuid4

def debug_settings():
    print(f"Using DATABASE_URL: {DATABASE_URL}")
    db = SessionLocal()
    try:
        # Check current
        settings = db.query(models.Setting).all()
        print(f"Current settings count: {len(settings)}")
        for s in settings:
            print(f"  {s.key}: {s.value}")
            
        print("Ensuring cod_enabled is true...")
        setting = db.query(models.Setting).filter(models.Setting.key == 'cod_enabled').first()
        if setting:
            setting.value = 'true'
            print("Updated existing cod_enabled")
        else:
            db.add(models.Setting(id=str(uuid4()), key='cod_enabled', value='true'))
            print("Created new cod_enabled")
        db.commit()
        
        # Verify
        settings = db.query(models.Setting).all()
        print(f"New settings count: {len(settings)}")
        for s in settings:
            print(f"  {s.key}: {s.value}")
    finally:
        db.close()

if __name__ == "__main__":
    debug_settings()
