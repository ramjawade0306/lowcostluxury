from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from uuid import uuid4
from datetime import datetime
import models, schemas
from database import get_db
from .auth import get_current_user

router = APIRouter(
    prefix="/orders",
    tags=["orders"]
)

@router.post("/", response_model=schemas.OrderResponse)
def create_order(order: schemas.OrderCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        # 1. Calculate subtotal
        subtotal = sum(item.price * item.quantity for item in order.items)
        
        # 2. Handle Discount (Coupon)
        discount = 0
        if order.couponCode:
            from sqlalchemy import func
            coupon = db.query(models.Coupon).filter(
                func.lower(models.Coupon.code) == order.couponCode.strip().lower(),
                models.Coupon.isActive == True
            ).first()
            if coupon:
                # Robust validation during order creation
                is_expired = coupon.expiresAt and datetime.now() > coupon.expiresAt
                limit_reached = coupon.maxUses and coupon.usedCount >= coupon.maxUses
                
                if not is_expired and not limit_reached and subtotal >= coupon.minOrder:
                    discount = min(coupon.discount, subtotal)
                    coupon.usedCount += 1
        
        # 3. Delivery Charge
        delivery_charge = 49
        setting = db.query(models.Setting).filter(models.Setting.key == "delivery_charge").first()
        if setting:
            try:
                delivery_charge = float(setting.value)
            except:
                pass
                
        # 4. Total
        total = max(0, subtotal - discount + delivery_charge)
        
        # 5. Address Handling
        order_address = ""
        order_phone = current_user.phone or ""
        
        if order.addressId:
            db_address = db.query(models.Address).filter(
                models.Address.id == order.addressId,
                models.Address.userId == current_user.id
            ).first()
            if db_address:
                order_address = f"{db_address.address}, {db_address.city}, {db_address.state} - {db_address.pincode}"
                order_phone = db_address.phone
        elif order.address:
            order_address = f"{order.address.address}, {order.address.city}, {order.address.state} - {order.address.pincode}"
            order_phone = order.address.phone
        
        if not order_address:
            raise HTTPException(status_code=400, detail="Delivery address is required")

        # Generate order ID
        short_uuid = str(uuid4())[:8].upper()
        readable_order_id = f"DS-{short_uuid}"
        
        db_order = models.Order(
            id=str(uuid4()),
            orderId=readable_order_id,
            userId=current_user.id,
            status="placed",
            paymentStatus="pending",
            subtotal=subtotal,
            discount=discount,
            deliveryCharge=delivery_charge,
            total=total,
            address=order_address,
            phone=order_phone,
            couponCode=order.couponCode
        )
        db.add(db_order)
        
        # 6. Create Order Items and Update Stock
        for item in order.items:
            # Fetch product to check stock
            product = db.query(models.Product).filter(models.Product.id == item.productId).first()
            if not product:
                raise HTTPException(status_code=404, detail=f"Product {item.productId} not found")
            
            if product.stock < item.quantity:
                raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.name}. Available: {product.stock}")
            
            # Deduct stock
            product.stock -= item.quantity
            if product.stock <= 0:
                product.stock = 0
                product.isSoldOut = True
            
            db_item = models.OrderItem(
                id=str(uuid4()),
                orderId=db_order.id,
                productId=item.productId,
                quantity=item.quantity,
                price=item.price
            )
            db.add(db_item)
        
        db.commit()
        db.refresh(db_order)
        
        # 7. Prepare response
        payment_required = order.paymentMethod == "phonepe"
        if order.paymentMethod == "cod":
            db_order.paymentStatus = "cod_pending"
            db.commit()
            db.refresh(db_order)

        return {
            "order": db_order,
            "paymentRequired": payment_required,
            "amount": total
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Order error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{user_id}", response_model=List[schemas.Order])
def get_user_orders(user_id: str, db: Session = Depends(get_db)):
    return db.query(models.Order).filter(models.Order.userId == user_id).order_by(models.Order.createdAt.desc()).all()


@router.post("/replacement/{item_id}")
def request_replacement(item_id: str, reason: str, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    # 1. Find the order item
    item = db.query(models.OrderItem).filter(models.OrderItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Order item not found")
        
    # 2. Verify order belongs to user
    order = db.query(models.Order).filter(models.Order.id == item.orderId, models.Order.userId == current_user.id).first()
    if not order:
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    # 3. Verify order status (should be delivered for replacement)
    if order.status != "delivered":
        raise HTTPException(status_code=400, detail="Order must be delivered to request a replacement")
        
    # 4. Update item replacement status
    item.replacementStatus = "requested"
    item.replacementReason = reason
    db.commit()
    
    return {"message": "Replacement request submitted successfully"}
