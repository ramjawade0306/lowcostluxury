import os
from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

# Database Configuration
DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL and DATABASE_URL.startswith("file:"):
    # Convert Prisma-style 'file:./dev.db' to SQLAlchemy-style 'sqlite:///./dev.db'
    # Handle both relative (file:./) and absolute (file:/) paths
    db_path = DATABASE_URL.replace("file:", "", 1)
    if not db_path.startswith("/") and not db_path.startswith("\\") and ":" not in db_path:
        # It's a relative path, use 3 slashes for sqlite
        DATABASE_URL = f"sqlite:///{db_path}"
    else:
        # It's an absolute path (or has a drive letter), use 4 slashes (or let sqlalchemy handle)
        DATABASE_URL = f"sqlite:///{db_path}"

if not DATABASE_URL:
    # Default to local prisma sqlite database
    # Assuming the project root is parent of backend
    BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
    ROOT_DIR = os.path.dirname(BACKEND_DIR)
    DB_PATH = os.path.join(ROOT_DIR, "prisma", "dev.db")
    DATABASE_URL = f"sqlite:///{DB_PATH}"

# For SQLite, we need connect_args={"check_same_thread": False}
engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)

# Enable WAL (Write-Ahead Logging) mode for SQLite to handle highly concurrent read/writes
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.execute("PRAGMA synchronous=NORMAL")
    cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
