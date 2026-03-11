from pydantic import BaseModel, ConfigDict, EmailStr, Field
from datetime import datetime
from typing import List, Optional

# --- About Shop ---
class AboutShopBase(BaseModel):
    shopDescription: str = ""
    ownerName: str = ""
    ownerPhoto: Optional[str] = None
    ownerBio: str = ""
    instagramLink: Optional[str] = None
    whatsappLink: Optional[str] = None
    yearsInBusiness: str = "0"
    customersServed: str = "0"
    showOwnerSection: bool = True
    promiseText: str = "Genuine product promise"
    shippingNote: str = "Fast response / fast shipping"
    proofImages: str = "[]"
    proofVideos: str = "[]"

class AboutShopCreate(AboutShopBase):
    pass

class AboutShop(AboutShopBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    createdAt: datetime
    updatedAt: datetime

# --- Categories ---
class CategoryBase(BaseModel):
    name: str
    slug: str
    image: Optional[str] = None

class Category(CategoryBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    createdAt: datetime

class CategoryCreate(BaseModel):
    name: str

class CategoryUpdate(BaseModel):
    name: str

# --- Products ---
class ProductBase(BaseModel):
    name: str
    slug: Optional[str] = None
    description: str = ""
    price: float
    discount: float = Field(0, ge=0, le=100)
    stock: int = 0
    categoryId: str
    images: str = "" # JSON string
    isHotDeal: bool = False
    isSoldOut: bool = False
    isReturnable: bool = False

class Product(ProductBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    createdAt: datetime
    updatedAt: datetime

class ProductDetail(Product):
    category: Optional[Category] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    discount: Optional[float] = Field(None, ge=0, le=100)
    stock: Optional[int] = None
    categoryId: Optional[str] = None
    images: Optional[str] = None
    isHotDeal: Optional[bool] = None
    isSoldOut: Optional[bool] = None
    isReturnable: Optional[bool] = None

class ProductAdmin(Product):
    category: Optional[Category] = None

# --- Auth ---
class UserBase(BaseModel):
    phone: str
    name: str
    email: Optional[str] = None
    isVerified: bool = False

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    phone: str
    password: str

class User(UserBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    createdAt: datetime

# --- Addresses ---
class AddressBase(BaseModel):
    name: str
    phone: str
    address: str
    city: str
    state: str
    pincode: str
    isDefault: bool = False

class AddressCreate(AddressBase):
    pass

class Address(AddressBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    userId: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    phone: Optional[str] = None

class LoginResponse(BaseModel):
    user: User
    token: str

# --- Admin Auth ---
class AdminBase(BaseModel):
    email: EmailStr
    name: str
    phone: Optional[str] = None

class AdminLogin(BaseModel):
    email: EmailStr
    password: str

class Admin(AdminBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    createdAt: datetime

class AdminLoginResponse(BaseModel):
    admin: Admin
    token: str

# --- Reviews ---
class ReviewBase(BaseModel):
    name: str
    image: str
    rating: int
    comment: Optional[str] = None
    isActive: bool = True

class ReviewCreate(ReviewBase):
    pass

class Review(ReviewBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    createdAt: datetime

# --- Orders ---
class ProductMini(BaseModel):
    name: str
    images: str # JSON string
    isReturnable: bool = False

class OrderItemBase(BaseModel):
    productId: str
    quantity: int
    price: float
    returnStatus: Optional[str] = None
    returnReason: Optional[str] = None
    replacementStatus: Optional[str] = None
    replacementReason: Optional[str] = None

class OrderItem(OrderItemBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    product: Optional[ProductMini] = None

class OrderItemAdmin(OrderItem):
    pass

class OrderBase(BaseModel):
    status: str = "placed"
    paymentStatus: str = "pending"
    subtotal: float
    discount: float = 0
    deliveryCharge: float = 0
    total: float
    address: str
    phone: str
    couponCode: Optional[str] = None
    trackingId: Optional[str] = None
    shippedAt: Optional[datetime] = None
    deliveredAt: Optional[datetime] = None

class OrderCreate(BaseModel):
    items: List[OrderItemBase]
    addressId: Optional[str] = None
    address: Optional[AddressBase] = None
    paymentMethod: str
    couponCode: Optional[str] = None

class Order(OrderBase):
    model_config = ConfigDict(from_attributes=True)
    total: float
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
    items: List[OrderItem]

class OrderResponse(BaseModel):
    order: Order
    paymentRequired: bool
    amount: float

# --- OTP ---
class OTPVerify(BaseModel):
    phone: str
    code: str

class OTPResend(BaseModel):
    phone: str

class OTPResponse(BaseModel):
    success: bool
    message: str

# --- Admin View Schemas ---
class OrderAdmin(OrderBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    orderId: str
    createdAt: datetime
    items: List[OrderItemAdmin]
    user: Optional[User] = None

# --- Coupons ---
class CouponBase(BaseModel):
    code: str
    discount: float
    minOrder: float = 0
    maxUses: Optional[int] = None
    isActive: bool = True
    expiresAt: Optional[datetime] = None

class CouponCreate(CouponBase):
    pass

class Coupon(CouponBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    usedCount: int
    createdAt: datetime

class CouponValidateRequest(BaseModel):
    code: str
    subtotal: float

class CouponValidateResponse(BaseModel):
    valid: bool
    discount: float
    code: str
    error: Optional[str] = None

# --- Dashboard ---
class UserMini(BaseModel):
    name: str

class OrderMini(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    orderId: str
    total: float
    status: str
    user: Optional[UserMini] = None

class DashboardResponse(BaseModel):
    totalSales: float
    ordersToday: int
    pendingOrders: int = 0
    replacementRequests: int = 0
    productsCount: int
    lowStock: int
    recentOrders: List[OrderMini]

# --- Password Reset ---
class ForgotPasswordRequest(BaseModel):
    phone: str

class ResetPasswordRequest(BaseModel):
    phone: str
    otp: str
    newPassword: str
