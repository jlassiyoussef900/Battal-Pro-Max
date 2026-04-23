# Running the Application

## Prerequisites
- PHP 8.0+ with PostgreSQL extension
- Node.js 18+
- PostgreSQL database running

## Database Setup
1. Ensure PostgreSQL is running
2. Database `battal_db` should exist (already created)
3. Update `backend/.env` if needed with your database credentials

## Start Backend (Terminal 1)
```bash
cd backend/public
php -S 127.0.0.1:8000
```

Or use the batch file:
```bash
start-backend.bat
```

## Start Frontend (Terminal 2)
```bash
npm run dev
```

## Access
- Frontend: http://localhost:5173
- Backend API: http://127.0.0.1:8000

## Test Backend
```bash
curl http://127.0.0.1:8000/jobs
```

## Demo Accounts
- Job Seeker: alex@example.com / demo
- Company Admin: sarah@example.com / demo
- Recruiter: mike@example.com / demo
