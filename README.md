# Money Health Score

Money Health Score is a full-stack financial wellness app for Indian professionals. It turns a short assessment into a weighted score, dimension-level insights, a practical action plan, and an AI follow-up experience that helps users decide what to do next.

## What It Does

- Guides users through a 20-question quiz across emergency fund, insurance, investments, debt, tax planning, and retirement
- Calculates a weighted Money Health Score with dimension-specific insights
- Generates a concise coaching summary and a 12-month action plan
- Lets users continue the conversation with an AI assistant using their saved score context
- Includes PDF export, shareable score visuals, demo data, and a clean dashboard experience

## Why It Stands Out

- Built around Indian financial best practices and rupee-based guidance
- Uses Anthropic-backed AI for scoring, coaching, planning, and chat
- Keeps the experience lightweight with JWT auth, Supabase Postgres, and a simple Vite frontend
- Supports both local development and Docker Compose startup

## Tech Stack

- Frontend: React, Vite, TypeScript, Tailwind CSS
- Backend: Node.js, Express, TypeScript
- Database: Supabase Postgres with Prisma
- AI: Anthropic, plus Serper for live web search support

## Quick Start

1. Clone the repository and open the project folder.
2. Copy `backend/.env.example` to `backend/.env`.
3. Add your Supabase database URLs, JWT secret, `ANTHROPIC_API_KEY`, and `SERPER_API_KEY`.
4. Run `npm install` in `backend` and `frontend`.
5. In `backend`, run `npm run generate` and `npm run db:push`.
6. Start the backend with `npm run dev`.
7. Start the frontend with `npm run dev`.

The frontend runs on `http://localhost:5173` and the backend API runs on `http://localhost:3001`.

## Environment Variables

Backend `backend/.env`:

```env
DATABASE_URL="your-supabase-session-pooler-url"
DIRECT_URL="your-supabase-session-pooler-url"
JWT_SECRET="your-random-secret"
JWT_EXPIRES_IN="7d"
PORT=3001
FRONTEND_URL="http://localhost:5173"
ANTHROPIC_API_KEY="your-anthropic-key"
ANTHROPIC_MODEL="claude-haiku-4-5"
SERPER_API_KEY="your-serper-key"
NODE_ENV="development"
```

Notes:

- Use the Supabase Session pooler URL on port `5432` for both `DATABASE_URL` and `DIRECT_URL` if needed.
- URL-encode special characters in database passwords.
- Keep the real `backend/.env` out of version control.

## Common Scripts

Backend:

```bash
npm run dev
npm run build
npm run generate
npm run db:push
```

Frontend:

```bash
npm run dev
npm run build
npm run preview
```

## Docker

Run the full stack with:

```bash
docker-compose up --build
```

Make sure `backend/.env` is filled in before starting Docker.

## Demo Flow

1. Open the app in the browser.
2. Create a quick account or use the demo flow.
3. Submit the quiz and review the score reveal.
4. Open the AI chat and ask what to do first.
5. Review the 12-month action plan and export the report if needed.

## More Detail

For a full first-run walkthrough, see [STARTUP_GUIDE.md](STARTUP_GUIDE.md).
