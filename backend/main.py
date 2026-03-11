from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import models
from database import engine
from routers import about_shop, products, categories, auth, orders, reviews, payment, admin, user, coupons, uploads

# Create tables if they don't exist
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Low price luxury API")

# Ensure uploads directory exists
if not os.path.exists("uploads"):
    os.makedirs("uploads")

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Low price luxury API"}

@app.get("/api/health")
def health_check():
    return {"status": "ok", "version": "1.0.1"}

# Register all routers with /api prefix
app.include_router(auth.router, prefix="/api")
app.include_router(about_shop.router, prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(categories.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(reviews.router, prefix="/api")
app.include_router(payment.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(user.router, prefix="/api")
app.include_router(coupons.router, prefix="/api")
app.include_router(uploads.router, prefix="/api")
