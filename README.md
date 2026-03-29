# Money Health Score

Money Health Score is a full-stack AI-powered financial wellness application for Indian professionals that turns a fast 20-question assessment into a weighted money health score, detailed dimension insights, a motivational coaching note, a 12-month action plan, and an interactive follow-up chat experience.

## Features

- Secure authentication with JWT cookies, bcrypt password hashing, and protected routes
- 20-question guided quiz across emergency fund, insurance, investments, debt, tax planning, and retirement
- Gemini-powered financial scoring using weighted dimension logic tailored to Indian best practices
- Gemini-generated motivational coaching insight based on score and top weakness
- Gemini-generated 12-month action plan with realistic rupee targets and Indian financial products
- Results dashboard with animated SVG score gauge, dimension cards, benchmark messaging, and a saved history timeline
- Action plan tracking with localStorage persistence per score report
- AI chat panel that answers questions using the user's saved score report as context
- PDF export for full report and PNG share download for the score hero section
- Demo-fill flow for fast walkthroughs and judging
- Docker Compose setup for running both frontend and backend together

## Prerequisites

- Node.js 20
- npm
- Supabase Postgres database
- Gemini API key

## Setup

1. Clone the repository and open the `money-health-score` folder.
2. Copy `backend/.env.example` to `backend/.env`.
3. Add your Supabase `DATABASE_URL` and `DIRECT_URL` plus your Gemini API key inside `backend/.env`.
4. Run `npm install` inside `backend`.
5. Run `npm install` inside `frontend`.
6. In `backend`, run `npm run generate`.
7. In `backend`, run `npm run db:push` to create the schema in Supabase.
8. In `backend`, run `npm run dev`.
9. In `frontend`, run `npm run dev`.

The frontend runs on `http://localhost:5173` and the backend API runs on `http://localhost:3001`.

For a more detailed first-run walkthrough, see `STARTUP_GUIDE.md`.

## Supabase Connection Strings

Use these values from your Supabase project:

- `DATABASE_URL`: use your Supabase Session pooler connection string on port `5432` for this backend
- `DIRECT_URL`: if the direct `db.<project-ref>.supabase.co` host is unreachable, use the same Session pooler URL here too

Both should point to the same Supabase Postgres database, and any special characters in the password must be URL-encoded.

## Getting API Keys

- Gemini: create an API key from `https://aistudio.google.com`

## Docker

Run the full stack with:

```bash
docker-compose up --build
```

For Docker, create `backend/.env` first so the backend service can read your secrets.

## Demo Walkthrough For Judges

1. Open `http://localhost:5173`.
2. Click `See Sample Score`, create a quick account, and use the auto-filled demo profile.
3. Click `Submit for Analysis` and watch the AI thinking animation.
4. View the score reveal, headline, benchmark message, and the 6-dimension breakdown.
5. Click the chat bubble and ask a question like `What should I do first?`.
6. Scroll through the 12-month action plan and check off month 1.
7. Click `Share` to download the score image.
