# FurniShopsy - Luxury Furniture eCommerce Platform

## Installation & Local Development Guide

This guide provides step-by-step instructions on how to run your premium MERN stack application.

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB** (Local instance or MongoDB Atlas cluster)

### 1. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   Create a `.env` file in the `backend/` directory with the following variables:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/furnishopsy
   JWT_SECRET=your_super_secret_jwt_key_123
   RAZORPAY_KEY_ID=rzp_test_yourkeyhere
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   NODE_ENV=development
   ```
   *(Note: If MongoDB fails to connect, the system will automatically fallback to the local `db_json/` flat-file database).*
4. Start the backend server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Open a new terminal and navigate to the project root directory (where `vite.config.js` is located).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the application at `http://localhost:5173`.

---

## Production Deployment Guide

### Frontend Deployment (Vercel / Netlify)
1. Run the build command in the root directory:
   ```bash
   npm run build
   ```
2. The production-ready files will be generated in the `dist/` folder.
3. You can connect your GitHub repository directly to **Vercel** or **Netlify**, set the framework preset to "Vite", and deploy.

### Backend Deployment (Render / Heroku)
1. Push your backend code to GitHub.
2. Create a new Web Service on **Render** (or Heroku).
3. Set the Root Directory to `backend/`.
4. Build Command: `npm install`
5. Start Command: `node server.js`
6. Add your Environment Variables (`MONGO_URI`, `JWT_SECRET`, etc.) in the dashboard settings.

---

## Default Testing Accounts

**Admin Account:**
- **Email**: admin@furnishopsy.com
- **Password**: vijay123
- **OTP Bypass Code**: 123456 (used if OTP verification triggers)

**Guest User Account:**
- **Email**: guest@furnishopsy.com
- **Password**: guest123
- **OTP Bypass Code**: 123456

*To reset the database to default premium furniture items and coupons, send a POST request to `http://localhost:5000/api/seed`.*
