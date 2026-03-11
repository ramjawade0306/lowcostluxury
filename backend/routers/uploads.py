from fastapi import APIRouter, File, UploadFile, HTTPException
import os
from uuid import uuid4
from datetime import datetime
import shutil
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

load_dotenv()

# Configure Cloudinary if credentials exist
CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")

HAS_CLOUDINARY = all([CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET])

if HAS_CLOUDINARY:
    cloudinary.config(
        cloud_name=CLOUDINARY_CLOUD_NAME,
        api_key=CLOUDINARY_API_KEY,
        api_secret=CLOUDINARY_API_SECRET,
        secure=True
    )

router = APIRouter(
    prefix="/upload",
    tags=["upload"]
)

# Supported file types (Images & Videos)
ALLOWED_EXTENSIONS = {
    ".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif", # Images
    ".mp4", ".mov", ".avi", ".webm" # Videos
}

@router.post("")
async def upload_image(file: UploadFile = File(...)):
    filename = file.filename
    extension = os.path.splitext(filename)[1].lower()
    
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Invalid file type.")
    
    if HAS_CLOUDINARY:
        try:
            # Determine resource type based on extension
            resource_type = "image" if extension in {".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif"} else "video"
            
            upload_result = cloudinary.uploader.upload(
                file.file,
                folder="dealstore",
                resource_type=resource_type
            )
            return {"url": upload_result.get("secure_url")}
        except Exception as e:
            print(f"Cloudinary error: {e}")
            # Fallback to local if Cloudinary fails
    
    # --- Local Fallback ---
    unique_name = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid4().hex}{extension}"
    upload_dir = "uploads"
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)
        
    file_path = os.path.join(upload_dir, unique_name)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        return {"url": f"/uploads/{unique_name}"}
    except Exception as e:
        print(f"Local storage error: {e}")
        raise HTTPException(status_code=500, detail="Could not save file")
    finally:
        file.file.close()
