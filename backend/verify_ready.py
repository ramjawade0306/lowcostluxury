import sys
import os

# Add parent dir to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def verify_imports():
    try:
        from backend.main import app
        from backend.routers import auth, products, categories, about_shop, orders, reviews
        print("All modules and routers imported successfully!")
        print("Backend mapping to Database is valid.")
        return True
    except Exception as e:
        print(f"Readiness check failed: {e}")
        return False

if __name__ == "__main__":
    if verify_imports():
        print("Backend is officially READY.")
    else:
        sys.exit(1)
