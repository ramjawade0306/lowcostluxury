from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, BigInteger, TypeDecorator, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from database import Base


class User(Base):
    __tablename__ = "User"
    id = Column(String, primary_key=True, index=True)
    email = Column(String, nullable=True)
    password = Column(String)
    name = Column(String)
    phone = Column(String, unique=True, index=True, nullable=False)
    isVerified = Column(Boolean, default=False)
    createdAt = Column(DateTime, default=func.now())
    updatedAt = Column(DateTime, default=func.now(), onupdate=func.now())
    
    addresses = relationship("Address", back_populates="user")
    orders = relationship("Order", back_populates="user")

class Admin(Base):
    __tablename__ = "Admin"
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    phone = Column(String, unique=True, index=True, nullable=True)
    password = Column(String)
    name = Column(String)
    createdAt = Column(DateTime, default=func.now())

class Address(Base):
    __tablename__ = "Address"
    id = Column(String, primary_key=True, index=True)
    userId = Column(String, ForeignKey("User.id"))
    name = Column(String)
    phone = Column(String)
    address = Column(String)
    city = Column(String)
    state = Column(String)
    pincode = Column(String)
    isDefault = Column(Boolean, default=False)
    
    user = relationship("User", back_populates="addresses")

class Category(Base):
    __tablename__ = "Category"
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    slug = Column(String, unique=True, index=True)
    image = Column(String, nullable=True)
    createdAt = Column(DateTime, default=func.now())
    
    products = relationship("Product", back_populates="category")

class Product(Base):
    __tablename__ = "Product"
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    slug = Column(String, unique=True, index=True)
    description = Column(String)
    price = Column(Float)
    discount = Column(Float, default=0)
    stock = Column(Integer, default=0)
    categoryId = Column(String, ForeignKey("Category.id"))
    images = Column(String) # JSON string
    isHotDeal = Column(Boolean, default=False)
    isSoldOut = Column(Boolean, default=False)
    isReturnable = Column(Boolean, default=False)
    createdAt = Column(DateTime, default=func.now())
    updatedAt = Column(DateTime, default=func.now(), onupdate=func.now())
    
    category = relationship("Category", back_populates="products")
    orderItems = relationship("OrderItem", back_populates="product")

class Order(Base):
    __tablename__ = "Order"
    id = Column(String, primary_key=True, index=True)
    orderId = Column(String, unique=True, index=True)
    userId = Column(String, ForeignKey("User.id"))
    status = Column(String, default="placed")
    paymentStatus = Column(String, default="pending")
    subtotal = Column(Float)
    discount = Column(Float, default=0)
    deliveryCharge = Column(Float, default=0)
    total = Column(Float)
    address = Column(String)
    phone = Column(String)
    couponCode = Column(String, nullable=True)
    phonepeTransactionId = Column(String, nullable=True)
    phonepePaymentId = Column(String, nullable=True)
    trackingId = Column(String, nullable=True)
    shippedAt = Column(DateTime, nullable=True)
    deliveredAt = Column(DateTime, nullable=True)
    createdAt = Column(DateTime, default=func.now())
    updatedAt = Column(DateTime, default=func.now(), onupdate=func.now())
    
    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = "OrderItem"
    id = Column(String, primary_key=True, index=True)
    orderId = Column(String, ForeignKey("Order.id"))
    productId = Column(String, ForeignKey("Product.id"))
    quantity = Column(Integer)
    price = Column(Float)
    returnStatus = Column(String, nullable=True) # requested, approved, rejected, refunded
    returnReason = Column(String, nullable=True)
    replacementStatus = Column(String, nullable=True) # requested, approved, rejected, replaced
    replacementReason = Column(String, nullable=True)
    
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="orderItems")

class Payment(Base):
    __tablename__ = "Payment"
    id = Column(String, primary_key=True, index=True)
    orderId = Column(String)
    phonepeTransactionId = Column(String)
    phonepePaymentId = Column(String, nullable=True)
    amount = Column(Float)
    status = Column(String)
    createdAt = Column(DateTime, default=func.now())

class Review(Base):
    __tablename__ = "Review"
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    image = Column(String)
    rating = Column(Integer)
    comment = Column(String, nullable=True)
    isActive = Column(Boolean, default=True)
    createdAt = Column(DateTime, default=func.now())

class Coupon(Base):
    __tablename__ = "Coupon"
    id = Column(String, primary_key=True, index=True)
    code = Column(String, unique=True, index=True)
    discount = Column(Float)
    minOrder = Column(Float, default=0)
    maxUses = Column(Integer, nullable=True)
    usedCount = Column(Integer, default=0)
    isActive = Column(Boolean, default=True)
    expiresAt = Column(DateTime, nullable=True)
    createdAt = Column(DateTime, default=func.now())

class Setting(Base):
    __tablename__ = "Setting"
    id = Column(String, primary_key=True, index=True)
    key = Column(String, unique=True, index=True)
    value = Column(String)

class AboutShop(Base):
    __tablename__ = "AboutShop"
    id = Column(String, primary_key=True, index=True, default="1")
    shopDescription = Column(String, default="")
    ownerName = Column(String, default="")
    ownerPhoto = Column(String, nullable=True)
    ownerBio = Column(String, default="")
    instagramLink = Column(String, nullable=True)
    whatsappLink = Column(String, nullable=True)
    yearsInBusiness = Column(String, default="0")
    customersServed = Column(String, default="0")
    showOwnerSection = Column(Boolean, default=True)
    promiseText = Column(String, default="Genuine product promise")
    shippingNote = Column(String, default="Fast response / fast shipping")
    proofImages = Column(String, default="[]") 
    proofVideos = Column(String, default="[]") 
    createdAt = Column(DateTime, default=func.now())
    updatedAt = Column(DateTime, default=func.now(), onupdate=func.now())

class OTP(Base):
    __tablename__ = "OTP"
    id = Column(String, primary_key=True, index=True)
    phone = Column(String, index=True)
    code = Column(String)
    purpose = Column(String) # register, reset_password
    expiresAt = Column(DateTime)
    createdAt = Column(DateTime, default=func.now())
