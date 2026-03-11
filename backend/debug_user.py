
import sys
import os
sys.path.append(os.getcwd())

from database import SessionLocal
import models
import schemas
from uuid import uuid4

def test_registration():
    db = SessionLocal()
    try:
        print("Testing User creation...")
        new_user = models.User(
            id=str(uuid4()),
            email=None,
            password="testpassword",
            name="Test User",
            phone="1234567890",
            isVerified=False
        )
        db.add(new_user)
        db.commit()
        print("User created successfully!")
        
        # Cleanup
        db.delete(new_user)
        db.commit()
        print("Cleanup successful!")
    except Exception:
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    test_registration()
