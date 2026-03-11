
import sys
import os
sys.path.append(os.getcwd())

from database import SessionLocal, DATABASE_URL
import models
import traceback
from uuid import uuid4

def test_full_registration():
    db = SessionLocal()
    with open("debug_output.log", "w") as f:
        try:
            f.write(f"Using DATABASE_URL: {DATABASE_URL}\n")
            f.write("Testing User creation...\n")
            new_user = models.User(
                id=str(uuid4()),
                email=None,
                password="testpassword",
                name="Test Full",
                phone="1230000000",
                isVerified=False
            )
            db.add(new_user)
            f.write("Adding to session...\n")
            db.flush()
            f.write("Flush successful!\n")
            
            db.commit()
            f.write("Commit successful!\n")
            
            db.refresh(new_user)
            f.write(f"Refreshed user, createdAt: {new_user.createdAt}\n")
            print("SUCCESS")
            
        except Exception:
            f.write("\n--- TRACEBACK START ---\n")
            traceback.print_exc(file=f)
            f.write("--- TRACEBACK END ---\n")
            db.rollback()
            print("FAILURE")
        finally:
            db.close()

if __name__ == "__main__":
    test_full_registration()
