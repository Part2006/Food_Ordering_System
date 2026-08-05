# 🍔 QuickBite — Full-Stack Food Ordering Platform

QuickBite is a full-featured, premium food ordering web application (similar to Swiggy/Zomato) built using the MERN stack. It supports customer ordering, live tracking, multi-restaurant cart checkouts, restaurant dashboard management, and a centralized Super Admin control center. All restaurants in the system are situated across different locations in **Pune, India**.

---

## 🚀 Key Features

*   **🛒 Multi-Restaurant Cart Checkouts**: Add dishes from multiple restaurants to your cart simultaneously. The backend splits the cart into independent orders, calculates proportional delivery fees, tax (GST), and discounts, and initiates a unified payment.
*   **🎠 Auto-Sliding Trending Carousel**: A premium, auto-sliding banner on the homepage showcasing popular menu items across all active kitchens with direct "ADD TO CART" buttons.
*   **🔍 Direct Cuisine Grid**: Selecting any cuisine category on the homepage dynamically displays a grid of matches (dishes) from all kitchens instead of just filtering restaurant names, allowing quick food additions.
*   **🛡️ Super Admin Approval System**: New kitchens register in a pending approval state. The Super Admin has a dashboard alert and approval screen to review, approve, or block kitchen signups.
*   **🌟 Rating & Review Infrastructure**: Verified customers can rate and review dishes directly from their profile history, dynamically updating the restaurant's average rating.
*   **📡 Real-time Updates (Socket.io)**: Live status changes propagate instantly from the kitchens to the customer's tracking screen.
*   **💳 Dual Payment Gateway**: Supports live Razorpay integration or a built-in payment simulator for testing.
*   **✨ Premium Aesthetics**: High-end styling powered by Tailwind CSS, featuringOutfit typography, smooth micro-animations, glassmorphic layout overlays, and a custom scroll system.

---

## 🛠️ Technology Stack

*   **Frontend**: React (Vite), React Router DOM, Context API, Tailwind CSS, Lucide Icons, Axios, Recharts, Socket.io-client.
*   **Backend**: Node.js, Express.js, MongoDB (Mongoose), Socket.io, Razorpay SDK, JSON Web Token (JWT) auth, BcryptJS.

---

## 📂 Project Structure

```text
food-ordering-system/
├── backend/                  # Express REST API & Socket.io server
│   ├── controllers/          # Business logic handlers
│   ├── middleware/           # JWT Auth & role authorization middlewares
│   ├── models/               # MongoDB Mongoose schemas
│   ├── routes/               # API endpoints
│   ├── seed.js               # Database reset & seeding script
│   ├── seedHelper.js         # Auto-seeder utility for empty databases
│   └── server.js             # Main server gateway
├── frontend/                 # React client SPA (Vite)
│   ├── public/               # Static assets & icons
│   └── src/
│       ├── components/       # Reusable components (Navbar, ScrollToTop)
│       ├── context/          # Contexts (AuthContext, CartContext)
│       ├── pages/            # View pages (Customer, Restaurant, SuperAdmin)
│       └── main.jsx          # Entry mount
└── package.json              # Root script scripts
```

---

## 🔧 Installation & Setup

### 1. Prerequisites
Ensure you have **Node.js** (v16 or higher) and **MongoDB** installed locally (or access to a MongoDB Atlas connection string).

### 2. Configure Environment Variables
Create a `.env` file inside the `backend/` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/food_ordering
JWT_SECRET=super_secret_jwt_key_change_me
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID         # Optional: Leave blank to run in simulated mode
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET         # Optional: Leave blank to run in simulated mode
```

### 3. Install Dependencies
Run the installation script at the root directory:
```bash
npm run install:all
```

### 4. Seed the Database
Seed the database with default restaurants, customer profiles, menu items, previous orders, and reviews:
```bash
npm run seed --prefix backend
```
*(Note: If you connect to a new empty MongoDB Atlas cluster, the server will auto-seed the database on startup!)*

### 5. Launch the Platform
Start both the backend server and Vite frontend concurrently:
```bash
npm run dev
```

---

## 🔑 Login Credentials

You can log into the platform using the following accounts:

### 👤 Customers
*   **Email**: `customer@gmail.com`
*   **Password**: `customer123`
*   *(Includes pre-seeded default addresses and previous orders history)*

### 🛡️ Super Admin
*   **Email**: `admin@gmail.com`
*   **Password**: `admin123`
*   *(Manage registrations, user controls, and oversee platform analytics)*

### 🍳 Active Restaurants
*   **Password**: `restaurant123` (for all kitchens)
*   **Emails**:
    *   Pizza Paradise: `pizzaparadise@gmail.com` (Koregaon Park, Pune)
    *   Burger Bistro: `burgerbistro@gmail.com` (Kothrud, Pune)
    *   Sahyadri Maratha Delights: `sahyadri@gmail.com` (Deccan Gymkhana, Pune)
    *   Sher-E-Punjab Rasoi: `sherepunjab@gmail.com` (FC Road, Shivaji Nagar, Pune)
    *   Dakshin Kitchen: `dakshin@gmail.com` (Viman Nagar, Pune)
    *   Gujarati Rasoi: `gujaratirasoi@gmail.com` (Baner, Pune)
    *   KFC: `kfc@gmail.com` (Camp, Pune)

### ⏳ Pending Approval Restaurants
*   Hotel Kshatriya Garden: `kshatriya@gmail.com` (Chandani Chowk, Kothrud, Pune)
*   Tandoori Nights: `tandoori@gmail.com` (Kalyani Nagar, Pune)
