from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
import models, schemas
from database import get_db

router = APIRouter(
    prefix="/reviews",
    tags=["reviews"]
)

@router.get("/", response_model=List[schemas.Review])
def get_active_reviews(db: Session = Depends(get_db)):
    return db.query(models.Review).filter(models.Review.isActive == True).all()
