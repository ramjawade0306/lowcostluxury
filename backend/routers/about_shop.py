from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models, schemas
from database import get_db

router = APIRouter(
    prefix="/about-shop",
    tags=["about-shop"]
)

@router.get("/", response_model=schemas.AboutShop)
def get_about_shop(db: Session = Depends(get_db)):
    about_shop = db.query(models.AboutShop).filter(models.AboutShop.id == "1").first()
    if not about_shop:
        # Create a default one if it doesn't exist
        about_shop = models.AboutShop(id="1")
        db.add(about_shop)
        db.commit()
        db.refresh(about_shop)
    return about_shop

@router.post("/", response_model=schemas.AboutShop)
def update_about_shop(about_data: schemas.AboutShopCreate, db: Session = Depends(get_db)):
    # Note: Authorization should be added here later (admin check)
    about_shop = db.query(models.AboutShop).filter(models.AboutShop.id == "1").first()
    
    update_data = about_data.model_dump(exclude_unset=True)
    
    if not about_shop:
        about_shop = models.AboutShop(id="1", **update_data)
        db.add(about_shop)
    else:
        for key, value in update_data.items():
            setattr(about_shop, key, value)
    
    db.commit()
    db.refresh(about_shop)
    return about_shop
