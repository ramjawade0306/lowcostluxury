from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from uuid import uuid4
import models, schemas
from database import get_db

router = APIRouter(
    prefix="/admin",
    tags=["admin"]
)

@router.get("/users", response_model=List[schemas.User])
def get_all_users(db: Session = Depends(get_db)):
    return db.query(models.User).order_by(models.User.createdAt.desc()).all()

@router.get("/orders", response_model=List[schemas.OrderAdmin])
def get_all_orders(db: Session = Depends(get_db)):
    orders = db.query(models.Order).options(
        joinedload(models.Order.user),
        joinedload(models.Order.items).joinedload(models.OrderItem.product)
    ).order_by(models.Order.createdAt.desc()).all()
    return orders

@router.patch("/orders/{order_id}", response_model=schemas.Order)
def update_order_status(order_id: str, update: dict, db: Session = Depends(get_db)):
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if "status" in update:
        db_order.status = update["status"]
        from datetime import datetime
        if update["status"] == "shipped":
            db_order.shippedAt = datetime.now()
            if "trackingId" in update:
                db_order.trackingId = update["trackingId"]
        elif update["status"] == "delivered":
            db_order.deliveredAt = datetime.now()
            
    if "trackingId" in update and "status" not in update:
        db_order.trackingId = update["trackingId"]
    
    db.commit()
    db.refresh(db_order)
    return db_order

@router.get("/products", response_model=List[schemas.ProductAdmin])
def get_admin_products(db: Session = Depends(get_db)):
    return db.query(models.Product).options(joinedload(models.Product.category)).all()

@router.post("/products", response_model=schemas.Product)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    product_data = product.model_dump()
    db_product = models.Product(**product_data, id=str(uuid4()))
    db_product.slug = product.name.lower().replace(" ", "-") + "-" + str(uuid4())[:4]
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.patch("/products/{product_id}", response_model=schemas.Product)
def update_product(product_id: str, update: schemas.ProductUpdate, db: Session = Depends(get_db)):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_product, key, value)
    
    db.commit()
    db.refresh(db_product)
    return db_product

@router.delete("/products/{product_id}")
def delete_product(product_id: str, db: Session = Depends(get_db)):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(db_product)
    db.commit()
    return {"message": "Deleted"}

@router.get("/categories", response_model=List[schemas.Category])
def get_admin_categories(db: Session = Depends(get_db)):
    return db.query(models.Category).all()

@router.post("/categories", response_model=schemas.Category)
def create_category(cat: schemas.CategoryCreate, db: Session = Depends(get_db)):
    db_cat = models.Category(
        id=str(uuid4()),
        name=cat.name,
        slug=cat.name.lower().replace(" ", "-")
    )
    db.add(db_cat)
    db.commit()
    db.refresh(db_cat)
    return db_cat

@router.delete("/categories/{cat_id}")
def delete_category(cat_id: str, db: Session = Depends(get_db)):
    db_cat = db.query(models.Category).filter(models.Category.id == cat_id).first()
    if not db_cat:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(db_cat)
    db.commit()
    return {"message": "Deleted"}

@router.get("/about-shop", response_model=schemas.AboutShop)
def get_admin_about_shop(db: Session = Depends(get_db)):
    about = db.query(models.AboutShop).first()
    if not about:
        about = models.AboutShop(id="1")
        db.add(about)
        db.commit()
        db.refresh(about)
    return about

@router.post("/about-shop", response_model=schemas.AboutShop)
def update_about_shop(data: schemas.AboutShopCreate, db: Session = Depends(get_db)):
    about = db.query(models.AboutShop).first()
    if not about:
        about = models.AboutShop(id="1")
        db.add(about)
    
    for key, value in data.model_dump().items():
        setattr(about, key, value)
    
    db.commit()
    db.refresh(about)
    return about

@router.get("/settings")
def get_admin_settings(db: Session = Depends(get_db)):
    settings_list = db.query(models.Setting).all()
    return {s.key: s.value for s in settings_list}

@router.post("/settings")
def update_admin_settings(settings_dict: dict, db: Session = Depends(get_db)):
    for key, value in settings_dict.items():
        db_setting = db.query(models.Setting).filter(models.Setting.key == key).first()
        if db_setting:
            db_setting.value = str(value)
        else:
            db_setting = models.Setting(id=str(uuid4()), key=key, value=str(value))
            db.add(db_setting)
    
    db.commit()
    return {"message": "Saved"}

@router.get("/dashboard", response_model=schemas.DashboardResponse)
def get_dashboard(db: Session = Depends(get_db)):
    from datetime import datetime, time, timedelta
    from sqlalchemy import func
    
    # Calculate "Today" strictly as 12:00 AM to 11:59 PM IST (UTC+5:30)
    current_utc = datetime.utcnow()
    current_ist = current_utc + timedelta(hours=5, minutes=30)
    
    # Start of today in IST
    ist_midnight = datetime.combine(current_ist.date(), time.min)
    # Convert IST midnight back to UTC for database querying
    utc_start_of_day = ist_midnight - timedelta(hours=5, minutes=30)
    
    # End of today in IST
    ist_end_of_day = datetime.combine(current_ist.date(), time.max)
    # Convert IST 11:59 PM back to UTC
    utc_end_of_day = ist_end_of_day - timedelta(hours=5, minutes=30)
    
    total_sales = db.query(func.sum(models.Order.total)).filter(
        models.Order.paymentStatus.in_(['paid', 'cod_pending'])
    ).scalar() or 0
    
    orders_today = db.query(models.Order).filter(
        models.Order.createdAt >= utc_start_of_day,
        models.Order.createdAt <= utc_end_of_day
    ).count()
    
    pending_orders = db.query(models.Order).filter(
        models.Order.status == 'placed'
    ).count()
    
    replacement_requests = db.query(models.OrderItem).filter(
        models.OrderItem.replacementStatus == 'requested'
    ).count()
    
    products_count = db.query(models.Product).count()
    
    low_stock = db.query(models.Product).filter(
        models.Product.stock < 10,
        models.Product.isSoldOut == False
    ).count()
    
    recent_orders = db.query(models.Order).options(
        joinedload(models.Order.user)
    ).order_by(models.Order.createdAt.desc()).limit(5).all()
    
    return {
        "totalSales": total_sales,
        "ordersToday": orders_today,
        "pendingOrders": pending_orders,
        "replacementRequests": replacement_requests,
        "productsCount": products_count,
        "lowStock": low_stock,
        "recentOrders": recent_orders
    }

# --- Coupons ---
@router.get("/coupons", response_model=List[schemas.Coupon])
def get_admin_coupons(db: Session = Depends(get_db)):
    return db.query(models.Coupon).all()

@router.post("/coupons", response_model=schemas.Coupon)
def create_coupon(coupon: schemas.CouponCreate, db: Session = Depends(get_db)):
    db_coupon = models.Coupon(**coupon.model_dump(), id=str(uuid4()))
    db.add(db_coupon)
    db.commit()
    db.refresh(db_coupon)
    return db_coupon

@router.delete("/coupons/{coupon_id}")
def delete_coupon(coupon_id: str, db: Session = Depends(get_db)):
    db_coupon = db.query(models.Coupon).filter(models.Coupon.id == coupon_id).first()
    if not db_coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    db.delete(db_coupon)
    db.commit()
    return {"message": "Deleted"}

# --- Reviews ---
@router.get("/reviews", response_model=List[schemas.Review])
def get_admin_reviews(db: Session = Depends(get_db)):
    return db.query(models.Review).order_by(models.Review.createdAt.desc()).all()

@router.post("/reviews", response_model=schemas.Review)
def create_admin_review(review: schemas.ReviewCreate, db: Session = Depends(get_db)):
    db_review = models.Review(**review.model_dump(), id=str(uuid4()))
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

@router.delete("/reviews/{review_id}")
def delete_admin_review(review_id: str, db: Session = Depends(get_db)):
    db_review = db.query(models.Review).filter(models.Review.id == review_id).first()
    if not db_review:
        raise HTTPException(status_code=404, detail="Review not found")
    db.delete(db_review)
    db.commit()
    return {"message": "Deleted"}

@router.patch("/order-items/{item_id}")
def update_order_item_return_status(item_id: str, update: dict, db: Session = Depends(get_db)):
    item = db.query(models.OrderItem).filter(models.OrderItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Order item not found")
    
    if "returnStatus" in update:
        item.returnStatus = update["returnStatus"]
    
    if "replacementStatus" in update:
        item.replacementStatus = update["replacementStatus"]
    
    db.commit()
    db.refresh(item)
    return item
