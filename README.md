# CSV Reviewer

A focused, beautiful tool for reviewing CSV entries one at a time — marking each as **Done**, **Maybe**, or **No**, with optional comments and exportable results.

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Set your password
cp .env.example .env.local
# Edit .env.local and set APP_PASSWORD=yourpassword

# 3. Run in development
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How it works

1. **Login** with the password from `.env.local`
2. **Upload** any CSV — first row must be column headers
3. **Pick** which column is your primary key (the entry title)
4. **Review** each entry one at a time:
   - Mark as **Done / Maybe / No**
   - Add a comment before marking (optional)
   - Navigate with arrow keys or buttons
   - Use **1 / 2 / 3** keyboard shortcuts to mark quickly

## Exporting

Click **Export** in the top bar to download:
- All entries (with status + comments appended as columns)
- Done-only CSV
- Maybe-only CSV
- No-only CSV

## Data storage

All decisions are saved to **localStorage** in your browser automatically.  
Your CSV data is kept in **sessionStorage** for the current tab session.  
Nothing is sent to any server.

## Environment variables

| Variable       | Description              | Default       |
|----------------|--------------------------|---------------|
| `APP_PASSWORD` | Password to access the app | *(required)* |

## Upgrading to a database

The app is structured as a Next.js app. When you're ready to add a backend:

- The `lib/csv.js` file handles all storage — swap `localStorage` calls for API calls
- Add API routes in `app/api/` for persisting decisions server-side
- Add a proper auth system (NextAuth, Clerk, etc.) replacing the simple password check in `app/api/auth/route.js`

## Tech stack

- **Next.js 14** (App Router, client-side only currently)
- **Tailwind CSS**
- **No database** — localStorage only
- **No TypeScript** — plain JS throughout
# reviewer
