from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL and DATABASE_URL.startswith("file:"):
    db_path = DATABASE_URL.replace("file:", "", 1)
    if ":" not in db_path:
        # Handle relative path correctly for this script
        db_path = os.path.join(os.getcwd(), db_path)
    DATABASE_URL = f"sqlite:///{db_path}"

print(f"Connecting to: {DATABASE_URL}")
engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    print("\nTable counts:")
    for table in ["Product", "Admin", "AboutShop", "Category", "User", "Order", "OrderItem"]:
        try:
            res = conn.execute(text(f"SELECT COUNT(*) FROM \"{table}\""))
            count = res.scalar()
            print(f" - {table}: {count}")
        except Exception as e:
            print(f" - {table}: Error {e}")

    print("\nAdmins:")
    res = conn.execute(text("SELECT email FROM \"Admin\""))
    for row in res:
        print(f" - {row[0]}")

    print("\nProducts:")
    res = conn.execute(text("SELECT name, slug FROM \"Product\" LIMIT 5"))
    for row in res:
        print(f" - {row[0]} ({row[1]})")
