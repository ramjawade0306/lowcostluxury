from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
import models, schemas
from database import get_db

router = APIRouter(
    prefix="/products",
    tags=["products"]
)

@router.get("/", response_model=List[schemas.ProductAdmin])
def get_products(
    category: Optional[str] = None, 
    hotDeals: Optional[bool] = None, 
    db: Session = Depends(get_db)
):
    query = db.query(models.Product).options(joinedload(models.Product.category))
    if category:
        query = query.filter(models.Product.categoryId == category)
    if hotDeals is not None:
        query = query.filter(models.Product.isHotDeal == hotDeals)
    
    products = query.order_by(models.Product.createdAt.desc()).all()
    return products

@router.get("/{identifier}", response_model=schemas.ProductDetail)
def get_product(identifier: str, db: Session = Depends(get_db)):
    # Try by ID first, then by slug
    product = db.query(models.Product).options(joinedload(models.Product.category)).filter(
        (models.Product.id == identifier) | (models.Product.slug == identifier)
    ).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
