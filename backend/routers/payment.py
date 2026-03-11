from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import Optional
from uuid import uuid4
import os
import models, schemas, payment_utils
from database import get_db
from auth_utils import create_access_token # Using for verification if needed

router = APIRouter(
    prefix="/payment",
    tags=["payment"]
)

@router.post("/create")
async def create_payment_route(
    data: dict, 
    db: Session = Depends(get_db)
):
    # Note: Authentication should be added here
    order_id = data.get("orderId")
    amount = data.get("amount")
    
    if not order_id or not amount:
        raise HTTPException(status_code=400, detail="Order ID and amount required")

    order = db.query(models.Order).filter(models.Order.orderId == order_id, models.Order.paymentStatus == "pending").first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if abs(order.total - amount) > 1:
        raise HTTPException(status_code=400, detail="Amount mismatch")

    site_url = os.getenv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000")
    redirect_url = f"{site_url}/payment/callback?orderId={order_id}"

    try:
        pay_data = await payment_utils.create_phonepe_payment(order_id, amount, redirect_url)
        
        if "redirectUrl" not in pay_data:
            raise HTTPException(status_code=500, detail=pay_data.get("message", "Payment creation failed"))

        # Update order with payment provider's order ID
        order.razorpayOrderId = pay_data.get("orderId") # Reusing existing column name from prisma schema
        db.commit()

        return {
            "redirectUrl": pay_data["redirectUrl"],
            "orderId": order_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def check_payment_status(
    orderId: str, 
    db: Session = Depends(get_db)
):
    try:
        order = db.query(models.Order).filter(models.Order.orderId == orderId).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        pay_status = await payment_utils.get_phonepe_status(orderId)
        
        state = pay_status.get("state")
        if state == "COMPLETED":
            # Update order status
            order.paymentStatus = "paid"
            order.razorpayPaymentId = pay_status.get("orderId") # or from paymentDetails
            
            # Decrement stock for items
            for item in order.items:
                product = db.query(models.Product).filter(models.Product.id == item.productId).first()
                if product:
                    product.stock -= item.quantity
            
            # Record payment
            new_payment = models.Payment(
                id=str(uuid4()), # Need to import uuid4
                orderId=order.id,
                razorpayOrderId=pay_status.get("orderId", ""),
                razorpayPaymentId=pay_status.get("orderId", ""),
                amount=order.total,
                status="paid"
            )
            db.add(new_payment)
            db.commit()

        return {
            "state": state,
            "orderId": orderId,
            "paymentStatus": "paid" if state == "COMPLETED" else order.paymentStatus
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Status check failed: {str(e)}")
