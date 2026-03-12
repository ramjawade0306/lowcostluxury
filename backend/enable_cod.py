import models
from database import SessionLocal
from uuid import uuid4

def enable_cod():
    db = SessionLocal()
    try:
        setting = db.query(models.Setting).filter(models.Setting.key == 'cod_enabled').first()
        if setting:
            setting.value = 'true'
            print("Updated cod_enabled to true")
        else:
            db.add(models.Setting(id=str(uuid4()), key='cod_enabled', value='true'))
            print("Created cod_enabled as true")
        db.commit()
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    enable_cod()
