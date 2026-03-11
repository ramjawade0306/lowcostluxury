from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import models, schemas
from database import get_db

router = APIRouter(
    prefix="/coupon",
    tags=["coupon"]
)

@router.post("/validate", response_model=schemas.CouponValidateResponse)
def validate_coupon(req: schemas.CouponValidateRequest, db: Session = Depends(get_db)):
    from sqlalchemy import func
    coupon = db.query(models.Coupon).filter(
        func.lower(models.Coupon.code) == req.code.strip().lower(),
        models.Coupon.isActive == True
    ).first()
    
    if not coupon:
        return {"valid": False, "discount": 0, "code": req.code, "error": "Invalid coupon"}
    
    if coupon.expiresAt and datetime.now() > coupon.expiresAt:
        return {"valid": False, "discount": 0, "code": coupon.code, "error": "Coupon expired"}
    
    if req.subtotal < coupon.minOrder:
        needed = coupon.minOrder - req.subtotal
        return {
            "valid": False, 
            "discount": 0, 
            "code": coupon.code, 
            "error": f"Add products worth ₹{needed:.0f} more to avail this coupon"
        }
    
    if coupon.maxUses and coupon.usedCount >= coupon.maxUses:
        return {"valid": False, "discount": 0, "code": coupon.code, "error": "Coupon limit reached"}
    
    discount = min(coupon.discount, req.subtotal)
    return {"valid": True, "discount": discount, "code": coupon.code}
