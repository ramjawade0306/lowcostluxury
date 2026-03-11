
import sys
import os
import bcrypt
from sqlalchemy import text
sys.path.append(os.getcwd())
try:
    from backend.database import engine
except ImportError:
    # If run from root, backend should be in path
    from database import engine

def get_hash(pw):
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pw.encode('utf-8'), salt).decode('utf-8')

def seed():
    print("Starting manual seed...")
    with engine.begin() as conn:
        # 1. Seed Admin
        print("Seeding Admin...")
        conn.execute(text("DELETE FROM \"Admin\""))
        conn.execute(text("INSERT INTO \"Admin\" (id, email, phone, password, name, createdAt) VALUES ('1', 'admin@dealstore.com', '9876543210', :pw, 'Admin', CURRENT_TIMESTAMP)"), 
                     {"pw": get_hash("admin123")})
        
        # 2. Seed Category
        print("Seeding Category...")
        conn.execute(text("DELETE FROM \"Category\""))
        cat_id = "cat-1"
        conn.execute(text("INSERT INTO \"Category\" (id, name, slug, createdAt) VALUES (:id, 'Car Accessories', 'car-accessories', CURRENT_TIMESTAMP)"), 
                     {"id": cat_id})

        # 3. Seed Product
        print("Seeding Product...")
        conn.execute(text("DELETE FROM \"Product\""))
        conn.execute(text("""
            INSERT INTO "Product" (id, name, slug, description, price, discount, stock, categoryId, isHotDeal, isReturnable, images, isSoldOut, createdAt, updatedAt) 
            VALUES ('p-1', 'Car Phone Holder', 'car-phone-holder', 'Universal car phone holder', 299, 40, 50, :catId, 1, 1, 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=400', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        """), {"catId": cat_id})

        # 4. Seed AboutShop
        print("Seeding AboutShop...")
        conn.execute(text("DELETE FROM \"AboutShop\""))
        conn.execute(text("""
            INSERT INTO "AboutShop" (id, shopDescription, whatsappLink, ownerName, promiseText, shippingNote, proofImages, createdAt, updatedAt)
            VALUES ('1', 'Best deals in town', 'https://wa.me/919876543210', 'Shop Owner', 'Genuine promise', 'Fast shipping', '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        """))

        print("Manual seed completed successfully!")

if __name__ == "__main__":
    seed()
