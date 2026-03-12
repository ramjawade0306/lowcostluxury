from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
import models, schemas
from database import get_db

router = APIRouter(
    prefix="/categories",
    tags=["categories"]
)

@router.get("/", response_model=List[schemas.Category])
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(models.Category).order_by(models.Category.name).all()
    for cat in categories:
        cat.count = {"products": db.query(models.Product).filter(models.Product.categoryId == cat.id).count()}
    return categories
