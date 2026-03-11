from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import uuid4
import models, schemas
from database import get_db
from .auth import get_current_user

router = APIRouter(
    prefix="/user",
    tags=["user"]
)

@router.get("/addresses", response_model=List[schemas.Address])
def get_user_addresses(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(models.Address).filter(models.Address.userId == current_user.id).all()

@router.post("/addresses", response_model=schemas.Address)
def add_user_address(address: schemas.AddressCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_address = models.Address(
        **address.model_dump(),
        id=str(uuid4()),
        userId=current_user.id
    )
    db.add(db_address)
    db.commit()
    db.refresh(db_address)
    return db_address

@router.get("/orders", response_model=List[schemas.OrderAdmin])
def get_user_orders(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    from sqlalchemy.orm import joinedload
    return db.query(models.Order).options(
        joinedload(models.Order.items).joinedload(models.OrderItem.product)
    ).filter(models.Order.userId == current_user.id).order_by(models.Order.createdAt.desc()).all()
