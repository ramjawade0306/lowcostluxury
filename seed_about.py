from sqlalchemy.orm import Session
import os
import sys

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

import models
from database import SessionLocal

db = SessionLocal()

print("Seeding AboutShop...")
about = db.query(models.AboutShop).first()
if not about:
    about = models.AboutShop(
        shopName="Low price luxury",
        description="Premium products at best discounts",
        whatsappLink="https://wa.me/919876543210"
    )
    db.add(about)
else:
    about.whatsappLink = "https://wa.me/919876543210"

db.commit()
print("AboutShop seeded/updated!")
db.close()
