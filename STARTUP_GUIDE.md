# Project Startup Guide

This guide walks through the first local startup of the Money Health Score project using Supabase as the database.

## 1. Prerequisites

- Node.js 20+
- npm
- A Supabase project
- Gemini API key
- Serper API key

## 2. Collect the Required Database URLs

From your Supabase project database settings, collect:

- `DATABASE_URL`: the Supabase Session pooler connection string on port `5432`
- `DIRECT_URL`: use the same Session pooler URL if the direct `db.<project-ref>.supabase.co` host is unreachable from your network

If your database password contains special characters such as `@`, `:`, `/`, `?`, or `#`, URL-encode them inside the connection string.

Example:

- Password: `Yashvant@3005`
- Encoded password: `Yashvant%403005`

## 3. Configure the Backend Environment

Create a local backend env file from the template:

```powershell
Copy-Item backend/.env.example backend/.env
```

Update `backend/.env` with your real values:

```env
DATABASE_URL="your-supabase-session-pooler-url"
DIRECT_URL="your-supabase-session-pooler-url"
JWT_SECRET="your-random-secret"
JWT_EXPIRES_IN="7d"
PORT=3001
FRONTEND_URL="http://localhost:5173"
GEMINI_API_KEY="your-gemini-key"
SERPER_API_KEY="your-serper-key"
NODE_ENV="development"
```

Notes:

- `JWT_SECRET` should be a long random string.
- Do not commit your real `backend/.env`.
- For local Prisma work, using the Session pooler URL for both `DATABASE_URL` and `DIRECT_URL` is the safest default.
- If your password contains `@`, encode it as `%40` inside the URL.
- `SERPER_API_KEY` powers the separate AI Copilot live-web mode and Opportunity Radar.

## 4. Configure the Frontend Environment

Create a frontend env file:

```powershell
Copy-Item frontend/.env.example frontend/.env
```

Update `frontend/.env`:

```env
VITE_API_BASE_URL=/api
```

For local development this project proxies `/api` to `http://localhost:3001` through Vite.
Use a full URL only if you are intentionally bypassing the dev proxy.

## 5. Install Dependencies

Install backend packages:

```powershell
cd backend
npm install
```

Install frontend packages:

```powershell
cd ../frontend
npm install
```

## 6. Generate Prisma Client and Push the Schema

From the `backend` folder:

```powershell
npm run generate
npm run db:push
```

What this does:

- `npm run generate` builds the Prisma client
- `npm run db:push` creates or updates the tables in your Supabase database

## 7. Start the Backend

From the `backend` folder:

```powershell
npm run dev
```

Expected backend URL:

- `http://localhost:3001`

Health check:

- `http://localhost:3001/api/health`

## 8. Start the Frontend

From the `frontend` folder in another terminal:

```powershell
npm run dev
```

Expected frontend URL:

- `http://localhost:5173`

## 9. First Verification Checklist

- Backend starts without Prisma connection errors
- Frontend opens on `http://localhost:5173`
- `http://localhost:3001/api/health` returns an OK response
- You can register a new user
- Submitting the quiz creates rows in Supabase
- The new `/assistant` page opens after login
- Live web mode and Opportunity Radar work when both Gemini and Serper keys are present

## 10. Optional Docker Startup

If you prefer Docker:

```powershell
docker-compose up --build
```

Make sure `backend/.env` is already filled in before starting Docker.

## 11. Common Issues

- `Invalid URI` or connection string parse errors:
  Your password likely contains special characters and must be URL-encoded.
- Prisma cannot connect:
  Use the Session pooler URL on port `5432`, and only use the direct `db.<project-ref>.supabase.co` host if your environment can reach it.
- Prisma generate fails with `EPERM` on Windows:
  Stop the running backend, run `npm run generate`, then start the backend again.
- Frontend redirects to login unexpectedly:
  Confirm backend is running on port `3001` and `FRONTEND_URL` is `http://localhost:5173`.
- Frontend cannot reach the API:
  Confirm `frontend/.env` points `VITE_API_BASE_URL` to `/api`, then restart the Vite dev server.
- Quiz submission fails:
  Confirm `GEMINI_API_KEY` is present in `backend/.env`.
- Live web features fail:
  Confirm `SERPER_API_KEY` is present in `backend/.env` and restart the backend after adding it.
