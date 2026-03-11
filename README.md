# Low price luxury - E-commerce Platform

A full-stack, mobile-first e-commerce web application for a discount deal store with customer app, admin panel, payment integration, and database storage.

## Tech Stack

* **Frontend:** Next.js 14 (App Router), React, Tailwind CSS
* **Backend:** Next.js API Routes
* **Database:** SQLite with Prisma ORM
* **Auth:** JWT (jose)
* **Payment:** PhonePe
* **Storage:** Local storage for cart, database for orders

## Quick Start

### 1. Install dependencies

npm install

### 2. Environment

Copy `.env.example` to `.env` and fill in:

* `DATABASE_URL` – SQLite path (default: file:./dev.db)
* `JWT_SECRET` – Minimum 32 characters
* `PHONEPE_CLIENT_ID` – From PhonePe Business Dashboard
* `PHONEPE_CLIENT_SECRET` – From PhonePe Business Dashboard
* `PHONEPE_SANDBOX` – true for sandbox/testing

### 3. Database setup

npx prisma generate
npx prisma db push
npm run db:seed

### 4. Run development server

npm run dev

Store: http://localhost:3000
Admin: http://localhost:3000/admin

Admin login:
[admin@dealstore.com](mailto:admin@dealstore.com) / admin123

## Features

### Customer

* Home page with categories, deals, and reviews
* Shop with search, filters, and sorting
* Product page with gallery, add to cart, buy now
* Persistent cart using local storage
* Checkout with address and payment (PhonePe / COD)
* User authentication, orders, and addresses

### Admin

* Dashboard with sales stats and orders
* Product management (CRUD)
* Category management
* Order status updates
* User management
* Reviews and coupons
* Settings (COD, delivery charges, WhatsApp)

### Security

* Server-side payment verification (PhonePe)
* JWT authentication for users and admins
* Backend price validation
* Protected admin routes

## Database Schema

* Users, Admins, Addresses
* Categories, Products
* Orders, OrderItems
* Payments, Reviews, Coupons, Settings

## Deployment

1. Use PostgreSQL for production by updating `DATABASE_URL`
2. Change `provider` in `prisma/schema.prisma` to `postgresql`
3. Run `npx prisma db push`
4. Deploy using hosting platforms
5. Add environment variables in hosting dashboard

## License

MIT
