# 🚀 iMovies — Production Deployment Guide (Vercel & Render)

This guide walks you through deploying **iMovies** to production.

---

## 🏛️ Recommended Architecture

| Component | Platform | Why this platform? |
| :--- | :--- | :--- |
| **Backend API + Real-time WebSockets** | **[Render](https://render.com)** | Runs persistent Node.js processes with native Socket.io WebSocket support, health checks, and background tasks. |
| **Frontend UI (React + Vite)** | **[Vercel](https://vercel.com)** | Global Edge CDN, sub-second Vite builds, automatic SSL, SPA routing, and GitHub preview deployments. |
| **Database** | **[MongoDB Atlas](https://www.mongodb.com/atlas)** | Managed cloud MongoDB cluster with replica sets, automated backups, and 512MB free tier. |

> 💡 **Prefer an all-in-one platform?** You can also deploy **both** Backend and Frontend on Render using the included [`render.yaml`](file:///e:/mo/render.yaml) Blueprint! See [Option B](#-option-b-deploy-both-on-render-via-renderyaml) below.

---

## 🗄️ Step 1: Set Up MongoDB Atlas (Database)

1. Sign up / Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Click **Build a Database** and select the **M0 Free Tier**.
3. Create a Database User:
   - Go to **Security > Database Access** > **Add New Database User**.
   - Username: `imovies_admin`
   - Password: Choose a strong password (save this!).
   - Role: `Read and write to any database`.
4. Whitelist Network Access:
   - Go to **Security > Network Access** > **Add IP Address**.
   - Select **Allow Access From Anywhere** (`0.0.0.0/0`) so Render and Vercel can reach it.
5. Get your connection string:
   - Go to **Database > Clusters > Connect > Drivers (Node.js)**.
   - Copy connection URI:
     ```text
     mongodb+srv://imovies_admin:<password>@cluster0.xxxx.mongodb.net/imovies?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual password and ensure the DB name is `/imovies`.

---

## 🖥️ Step 2: Deploy Backend to Render

1. Log in to your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** > **Web Service**.
3. Connect your GitHub repository (`Adityachouk21/IMovies`).
4. Configure the service:
   - **Name**: `imovies-backend`
   - **Region**: Select closest to your users (e.g. *Oregon, US* or *Frankfurt, EU*)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free`
5. Expand **Advanced** and set:
   - **Health Check Path**: `/api/health`
6. Add the following **Environment Variables**:

| Variable | Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production optimizations & secure cookies |
| `PORT` | `5000` | Port for Express server |
| `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection URI |
| `JWT_SECRET` | *(64-character random string)* | E.g., `openssl rand -hex 32` |
| `JWT_EXPIRES_IN` | `1d` | Token expiry duration |
| `COOKIE_NAME` | `imovies_token` | HttpOnly cookie identifier |
| `CLIENT_URL` | `https://your-frontend.vercel.app` | Your Vercel frontend URL *(see Step 3, can update after Vercel deploys)* |

7. Click **Create Web Service**.
8. Once deployed, copy your backend URL (e.g., `https://imovies-backend.onrender.com`).
   - Test it in your browser: `https://imovies-backend.onrender.com/api/health`
   - Should return `{ "success": true, "data": { "status": "healthy" } }`.

---

## ⚡ Step 3: Deploy Frontend to Vercel

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** > **Project**.
3. Import your GitHub repository (`Adityachouk21/IMovies`).
4. Configure the Project:
   - **Project Name**: `imovies-frontend`
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **Edit** and choose `frontend`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `dist` (default)
5. Under **Environment Variables**, add:

| Key | Value | Notes |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `https://imovies-backend.onrender.com/api` | Your Render backend URL with `/api` suffix |
| `VITE_SOCKET_URL` | `https://imovies-backend.onrender.com` | Your Render backend URL without `/api` |

6. Click **Deploy**.
7. Once deployed, copy your production Vercel URL (e.g. `https://imovies-frontend.vercel.app`).
8. **Crucial Final Step**: Go back to your [Render Dashboard](https://dashboard.render.com) > `imovies-backend` > **Environment** > update `CLIENT_URL` with your actual Vercel domain (`https://imovies-frontend.vercel.app`), then click **Save Changes**.

---

## 📦 Option B: Deploy Both on Render via `render.yaml`

If you prefer to host both Backend and Frontend together on Render:

1. In Render Dashboard, click **New +** > **Blueprint**.
2. Connect your repository (`Adityachouk21/IMovies`).
3. Render automatically detects the [`render.yaml`](file:///e:/mo/render.yaml) file in your root folder.
4. Render will prompt you for:
   - `MONGODB_URI`: Paste your MongoDB Atlas URI.
   - `CLIENT_URL`: Enter your frontend Render URL.
5. Render deploys both the Node.js backend Web Service and the Vite Frontend Static Site automatically with built-in SPA rewrite rules!

---

## 🔒 Security & Production Checklist

- [x] **HttpOnly Cross-Site Cookies**: Configured with `sameSite: 'none'` and `secure: true` in production.
- [x] **Express Trust Proxy**: `app.set('trust proxy', 1)` enabled for secure HTTPS cookies behind Render/Cloudflare reverse proxies.
- [x] **CORS Origin Whitelisting**: Dynamic validation supporting your custom domain, Vercel preview domains (`*.vercel.app`), and Render (`*.onrender.com`).
- [x] **Real-time WebSockets**: Socket.io configured with credentials and CORS support for live seat locks.
- [x] **SPA Routing**: [`frontend/vercel.json`](file:///e:/mo/frontend/vercel.json) rewrites all incoming routes to `/index.html` preventing 404s on page refresh.
- [x] **Automated Database Seeder**: On first connect, MongoDB Atlas automatically initializes default theaters, movies, and sample shows if empty.

---

## ❓ Troubleshooting

### 1. CORS error / Network Error on Login or API calls
- Ensure `CLIENT_URL` in Render matches your exact frontend URL without trailing slashes.
- Ensure `VITE_API_BASE_URL` in Vercel includes `/api` (e.g. `https://imovies-backend.onrender.com/api`).
- Render free tier instances "spin down" after 15 minutes of inactivity. First request can take ~30-50 seconds to wake up.

### 2. Live Seat Synchronization / WebSocket not connecting
- Make sure `VITE_SOCKET_URL` is set to `https://imovies-backend.onrender.com` (do not add `/api` to the socket URL).

### 3. MongoDB connection error (MongooseServerSelectionError)
- In MongoDB Atlas, go to **Network Access** and verify `0.0.0.0/0` is active.
- Verify your database password in `MONGODB_URI` doesn't have unencoded special characters (e.g., replace `@` with `%40`).
