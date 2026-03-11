
import os
import sys
sys.path.append(os.getcwd())
from backend.database import DATABASE_URL
print(f"DEBUG: database.py DATABASE_URL = {DATABASE_URL}")
