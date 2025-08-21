# Running HRConnect Locally

This guide explains how to run the HRConnect HRMS application on your local machine.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

## Setup Instructions

1. **Clone the repository** (if you haven't already)
   ```bash
   git clone <your-repo-url>
   cd HRNavigator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (optional for local development)
   Create a `.env` file in the root directory:
   ```bash
   # Optional - the app will work without these in local mode
   DATABASE_URL=your_local_postgres_url  # Optional
   SESSION_SECRET=your-session-secret    # Optional - will use default
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   Open your browser and go to: `http://localhost:5000`

## Local Development Features

When running locally (without REPLIT_DOMAINS environment variable), the application automatically:

- ✅ **Bypasses Replit OAuth** - Uses simple local authentication
- ✅ **Auto-login** - Automatically logs you in as "Local Developer"
- ✅ **Memory sessions** - Uses memory-based session storage (no database required)
- ✅ **Full HRMS features** - All HR functionality works normally

## Authentication in Local Mode

- **Login**: Visit `/api/login` or click "Sign In" - you'll be automatically logged in
- **Logout**: Visit `/api/logout` or click "Logout" in the app
- **User**: You'll be logged in as "Local Developer" (dev@local.com)

## Database Options

The app can run with or without a database locally:

- **Without Database**: Uses in-memory storage (data resets on restart)
- **With Database**: Set DATABASE_URL in .env for persistent data

## Troubleshooting

- **Port already in use**: Change the port in the app or kill the process using port 5000
- **Module not found**: Run `npm install` to ensure all dependencies are installed
- **Authentication issues**: Clear your browser cookies and try again

## Production vs Local Differences

| Feature | Local Mode | Production (Replit) |
|---------|------------|-------------------|
| Authentication | Simple auto-login | Replit OAuth |
| Sessions | Memory store | PostgreSQL store |
| Database | Optional | Required |
| SSL | Not required | Required |

The application will automatically detect if it's running locally and switch to local development mode.