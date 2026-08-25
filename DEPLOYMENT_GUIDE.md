# 🚀 Production Deployment Guide: Vercel (Frontend) & Render (Backend)

This guide walks you through deploying the **Sierra Leone Immigration & Border Management System (SLID)** to production using **Render** for the Express Node.js backend and **Vercel** for the React PWA frontend.

---

## 🏗️ Architecture Overview

```
 ┌────────────────────────────────────────┐
 │           FRONTEND (Vercel)            │
 │     https://slid-portal.vercel.app     │
 │  - React 18 + Vite + Tailwind CSS      │
 │  - Progressive Web App (PWA)           │
 │  - Public / Applicant / Officer Portals│
 └──────────────────┬─────────────────────┘
                    │
                    │ /api/* proxy or direct CORS requests
                    ▼
 ┌────────────────────────────────────────┐
 │            BACKEND (Render)            │
 │ https://sl-immigration-backend.onrender.com │
 │  - Node.js Express + TypeScript        │
 │  - JWT Auth + Role RBAC Middleware     │
 │  - Gemini AI Assistant + Resend Email  │
 └──────────────────┬─────────────────────┘
                    │
                    │ Encrypted DB & Storage Calls
                    ▼
 ┌────────────────────────────────────────┐
 │         DATABASE & AUTH (Supabase)     │
 │  - PostgreSQL 15 + Row Level Security  │
 │  - Biometric & Document Storage        │
 └────────────────────────────────────────┘
```

---

## Part 1: Deploy Backend to Render (5 Minutes)

### Step 1: Push Code to GitHub
Ensure all your latest changes are pushed to your GitHub repository:
```bash
git add .
git commit -m "feat: configure PWA and production deployment files"
git push origin main
```

### Step 2: Create a Web Service on Render
1. Go to [Render Dashboard](https://dashboard.render.com/) and sign in.
2. Click **New +** &rarr; **Web Service**.
3. Select your GitHub repository (`sl-immigration-system`).
4. Configure the service settings:
   - **Name:** `sl-immigration-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Region:** Any (e.g. *Oregon* or *Frankfurt*)
   - **Branch:** `main`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`

### Step 3: Add Environment Variables in Render
In the **Environment Variables** section of your Render service, add the following:

| Key | Value (From your `backend/.env`) |
| :--- | :--- |
| `PORT` | `5000` |
| `NODE_ENV` | `production` |
| `SUPABASE_URL` | `https://giocnunuffvlrclsxmax.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | *(Your Supabase Service Role Secret Key)* |
| `GEMINI_API_KEY` | *(Your Google Gemini API Key)* |
| `RESEND_API_KEY` | *(Your Resend Email API Key)* |
| `EMAIL_FROM` | `Sierra Leone Immigration Department <onboarding@resend.dev>` |
| `FRONTEND_URL` | `https://your-frontend-project.vercel.app` *(update after creating Vercel app)* |

5. Click **Create Web Service**.
6. Wait 1–2 minutes until the deployment completes. Render will provide a live URL like:
   `https://sl-immigration-backend.onrender.com`
7. Test the health endpoint in your browser:  
   `https://sl-immigration-backend.onrender.com/health` &rarr; Should return `{"status":"ok", ...}`

---

## Part 2: Deploy Frontend to Vercel (3 Minutes)

### Step 1: Import Project on Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and sign in.
2. Click **Add New...** &rarr; **Project**.
3. Select your GitHub repository (`sl-immigration-system`).

### Step 2: Configure Build & Root Directory
- **Framework Preset:** `Vite`
- **Root Directory:** Click **Edit** and select `frontend` (or leave default if using root `vercel.json`).
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

### Step 3: Add Environment Variables on Vercel
Expand the **Environment Variables** section and add:

| Key | Value |
| :--- | :--- |
| `VITE_SUPABASE_URL` | `https://giocnunuffvlrclsxmax.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` *(Your anon key)* |
| `VITE_GEMINI_API_KEY` | *(Your Google Gemini API Key)* |
| `VITE_API_URL` | `https://sl-immigration-backend.onrender.com/api` *(Your Render backend URL)* |

### Step 4: Deploy
1. Click **Deploy**.
2. Vercel will build your application, generate the PWA service worker, and deploy within 30 seconds!
3. Your app is now live at: `https://your-project.vercel.app`!

---

## Part 3: Link Both Services Together

1. **In Render Backend Settings:**
   - Update `FRONTEND_URL` to your production Vercel URL (e.g. `https://your-project.vercel.app`).
   - Save changes (Render will automatically re-deploy with updated CORS whitelist).

2. **In `frontend/vercel.json` (Optional proxy rewrite):**
   - If you want `/api/*` requests routed automatically through Vercel's edge network without CORS, update the `destination` URL in `frontend/vercel.json` to your exact Render URL:
     ```json
     {
       "source": "/api/(.*)",
       "destination": "https://sl-immigration-backend.onrender.com/api/$1"
     }
     ```

---

## ✅ Production Checklist & Verification

- [x] **PWA Standalone & Install:** Open the Vercel link on mobile or desktop &rarr; Verify the "Install SLID App" prompt appears.
- [x] **Offline Mode:** Turn on Airplane mode &rarr; Verify cached pages and the offline status banner function properly.
- [x] **e-Visa Submission:** Submit a mock application &rarr; Verify record is saved in Supabase database.
- [x] **Adjudication & Email:** Approve application in Visa Officer console &rarr; Verify email notification and QR certificate generation.
- [x] **Border Check-In:** Scan or enter passport in Border Officer portal &rarr; Verify risk score calculation and entry clearance logging.
