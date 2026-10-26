# iMovies — Full-Stack Movie Ticket Booking Platform

A modern, production-oriented movie ticket booking web application built with **React + Vite + Tailwind CSS** on the frontend, and **Node.js + Express + MongoDB + Socket.io** on the backend.

---

## 🌐 Live Production Deployment

* 🚀 **Web Application (Vercel)**: **[https://imovies-frontend-xi.vercel.app](https://imovies-frontend-xi.vercel.app)**
* ⚙️ **Backend API (Render)**: **[https://imovies-backend-c2bf.onrender.com](https://imovies-backend-c2bf.onrender.com)**
* 📡 **API Health Status**: **[https://imovies-backend-c2bf.onrender.com/api/health](https://imovies-backend-c2bf.onrender.com/api/health)**
* 🗄️ **Database**: **MongoDB Atlas Cloud Cluster**

---

## 🎬 Architecture Overview

```
                      +---------------------------------------+
                      |       iMovies Frontend (React + Vite)  |
                      |  - Tailwind CSS (Cinema Dark Theme)   |
                      |  - React Router, React Context API    |
                      |  - Socket.io-client for Live Seats    |
                      |  - Axios API Client                   |
                      +-------------------+-------------------+
                                          |
                                HTTP / REST + WebSockets
                                          |
                      +-------------------v-------------------+
                      |      iMovies Backend (Express + Node) |
                      |  - RESTful API Routes                 |
                      |  - Helmet, Rate Limiter, CORS         |
                      |  - JWT HttpOnly Cookie Auth           |
                      |  - Socket.io Real-Time Seat Engine    |
                      |  - Razorpay Payment Verification      |
                      +---------+-------------------+---------+
                                |                   |
                 Mongoose ODM   |                   | External Services
                                v                   v
                     +----------+----+     +--------+--------+
                     | MongoDB Atlas |     | Razorpay / Mail |
                     | & Aggregation |     | & Cloudinary    |
                     +---------------+     +-----------------+
```

---

## 🚀 Project Roadmap

- [x] **Phase 1: Project Setup & Architecture Foundation**
  - Clean modular structure (`frontend/` & `backend/`)
  - Express server with security middlewares (Helmet, CORS, Rate Limiting, Cookie Parser)
  - Environment variable configuration & validation
  - MongoDB connection handler with graceful reconnects
  - `/api/health` health check endpoint
  - Vite + React + Tailwind CSS client setup
- [x] **Phase 2: Frontend Foundation & Home Page**
  - Cinema dark theme, navigation bar, hero banner carousel, movie cards, footer
  - Filters by genre, language, format, and search bar
- [x] **Phase 3: Database Models & Movie Catalog APIs**
  - Mongoose schemas (Movie, Theater, Screen, Show, Seat, Booking, Payment) & seed script
  - In-memory fallback dataset for smooth zero-config development
- [x] **Phase 4: Authentication & User Profiles**
  - JWT in HttpOnly cookies, bcryptjs, role-based access (User/Admin)
  - AuthContext, Login, Register, Profile pages & Protected/Admin routes
- [x] **Phase 5: Real-Time Seat Selection & Atomic Locking**
  - Socket.io live seat room synchronization (`join_show`, `seats_locked`, `seats_released`)
  - Atomic seat locking with 8-minute countdown timer & auto-release
  - Curved glowing cinema screen & Silver, Gold, Premium tier layout (`SeatGrid.jsx`)
- [x] **Phase 6: Payment Gateway Integration & Digital Tickets**
  - `/api/bookings` creation, tax calculation (18% GST + convenience fee)
  - Instant digital QR entry passes & receipt viewer (`Bookings.jsx`)
  - Full self-service cancellation with automatic refund and seat release
- [x] **Phase 7: Admin Dashboard & Management Console**
  - Shows scheduler table, movies catalog manager, multiplex auditorium metrics
  - Live revenue analytics & platform occupancy tracker (`AdminDashboard.jsx`)
- [x] **Phase 8: Automated Testing, Security Hardening & Deployment**
  - Node.js test runner unit & concurrency suite (`tests/seatLock.test.js` & `tests/booking.test.js`)
  - Multi-tier containerization ([`docker-compose.yml`](file:///e:/mo/docker-compose.yml), [`backend/Dockerfile`](file:///e:/mo/backend/Dockerfile), [`frontend/Dockerfile`](file:///e:/mo/frontend/Dockerfile), [`nginx.conf`](file:///e:/mo/frontend/nginx.conf))
  - Full cloud deployment guide for Render, Vercel, and MongoDB Atlas ([`DEPLOYMENT.md`](file:///e:/mo/DEPLOYMENT.md))

