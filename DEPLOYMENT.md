# 🚀 iMovies — Deployment & Operations Guide

This guide covers running iMovies locally, containerized via Docker Compose, and deploying to cloud platforms (Render + Vercel + MongoDB Atlas).

---

## 🛠 Local Development Setup

### Prerequisites
- Node.js 18+ installed
- MongoDB (optional, built-in in-memory fallback enabled if offline)

### 1. Install Dependencies
```bash
# From repository root
npm run install:all
```

### 2. Configure Environment Variables
- In `backend/.env`:
  ```env
  PORT=5000
  NODE_ENV=development
  MONGODB_URI=mongodb://localhost:27017/imovies
  JWT_SECRET=imovies_dev_secret_key_jwt_2026
  CLIENT_URL=http://localhost:5173
  ```

### 3. Run Development Servers
```bash
# Terminal 1 - Backend (Node/Nodemon + Socket.io)
npm run dev:backend

# Terminal 2 - Frontend (Vite + React)
npm run dev:frontend
```
- Open browser at: `http://localhost:5173`
- Backend API at: `http://localhost:5000/api`

### 4. Run Automated Tests
```bash
cd backend
npm test
```

---

## 🐳 Running with Docker Compose

Run the complete multi-tier stack (MongoDB + Backend + Frontend + Reverse Proxy) with a single command:

```bash
docker compose up --build
```

- Web Application: `http://localhost`
- Backend API: `http://localhost:5000/api`
- MongoDB: `mongodb://localhost:27017`

To shut down:
```bash
docker compose down -v
```

---

## ☁️ Cloud Production Deployment

### 1. Database (MongoDB Atlas)
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Obtain connection string: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/imovies?retryWrites=true&w=majority`
3. Whitelist all IPs (`0.0.0.0/0`) or specific cloud providers.

### 2. Backend (Render.com)
1. Create a new **Web Service** pointing to this GitHub repository.
2. Root Directory: `backend`
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `MONGODB_URI`: `<Atlas Connection String>`
   - `JWT_SECRET`: `<Secure Random 64-character secret>`
   - `CLIENT_URL`: `https://your-frontend.vercel.app`

### 3. Frontend (Vercel)
1. Import repository on [Vercel](https://vercel.com).
2. Root Directory: `frontend`
3. Framework Preset: `Vite`
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Environment Variables:
   - `VITE_API_BASE_URL`: `https://your-backend.onrender.com/api`
7. SPA routing is automatically supported via [`frontend/vercel.json`](file:///e:/mo/frontend/vercel.json).

---

## 🔒 Security Hardening Implemented
- **Helmet**: Secures HTTP response headers with `crossOriginResourcePolicy`.
- **CORS**: Explicit origin whitelisting with credentials support.
- **JWT in HttpOnly Cookies**: Protection against Cross-Site Scripting (XSS) token theft.
- **Global Rate Limiter**: Express-rate-limit protecting against brute force and DDoS.
- **Atomic Seat Locks**: Concurrency protection against race conditions during simultaneous booking attempts.
