from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import models
from database import get_db

router = APIRouter(
    prefix="/settings",
    tags=["settings"]
)

@router.get("/")
def get_public_settings(db: Session = Depends(get_db)):
    settings_list = db.query(models.Setting).all()
    return {s.key: s.value for s in settings_list}
