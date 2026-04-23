# Battal Pro Max - Complete Setup Guide

## Project Overview

Battal Pro Max is a Tinder-style Job Matching Platform with:
- **3 User Roles**: Job Seeker, Company Admin, Recruiter
- **Modern Frontend**: React + TypeScript + Vite
- **RESTful Backend**: PHP 8.2 + PostgreSQL
- **Advanced Matching**: AI-powered job recommendations
- **Badge System**: Achievement and skill verification

---

## 🎯 Features

### For Job Seekers
- Build comprehensive profiles
- Browse and match with jobs (Tinder-style)
- Track work experience and education
- Earn achievement badges
- Get personalized job recommendations
- View matched opportunities

### For Company Admins
- Post and manage job listings
- Track candidate applications
- View analytics and hiring funnel
- Manage company profile
- Monitor job performance

### For Recruiters
- Post job opportunities
- Review and filter candidates
- Track application pipeline
- Manage multiple job listings
- View candidate matches

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** (for frontend)
- **PHP 8.1+** (for backend)
- **PostgreSQL 12+** (database)
- **npm** or **yarn** (package manager)

### Installation Steps

#### 1. Clone/Set Up Frontend
```bash
cd app
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`

#### 2. Set Up Database
```bash
# Create PostgreSQL database
createdb battal_db

# OR use psql
psql -U postgres
CREATE DATABASE battal_db;
CREATE USER azer WITH PASSWORD 'your_password';
ALTER ROLE azer WITH SUPERUSER;
```

#### 3. Initialize Backend
```bash
cd backend
php tests/standalone_unit_test.php
```

This creates all database tables and verifies the connection.

#### 4. Start Backend Server
```bash
# Using PHP's built-in server
php -S localhost:8000 -t public/

# OR using XAMPP Apache
# Access at http://localhost/battal_pro_max/backend/public/
```

---

## 🔐 Authentication

### Sign In
1. Go to Login tab
2. Enter email and password
3. Or click a demo account button to test

### Sign Up
1. Go to Create Account tab
2. Select your role:
   - **Job Seeker** 👤
   - **Company Admin** 🏢
   - **Recruiter** 👥
3. Enter details
4. Create account

### Demo Accounts (for testing)

**Job Seeker**
- Email: `alex@example.com`
- Password: `demo`

**Company Admin**
- Email: `sarah@example.com`
- Password: `demo`

**Recruiter**
- Email: `mike@example.com`
- Password: `demo`

---

## 📁 Project Structure

```
app/
├── frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── sections/        # Page sections
│   │   ├── hooks/           # Custom hooks (auth, data)
│   │   ├── types/           # TypeScript types
│   │   └── App.tsx          # Main app
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
└── backend (PHP + PostgreSQL)
    ├── src/
    │   ├── Database.php      # DB connection
    │   ├── Schema.php        # DB migrations
    │   ├── ApiRouter.php     # API routes
    │   └── Models/           # Data models
    │       ├── User.php
    │       ├── Job.php
    │       ├── Company.php
    │       ├── Profile.php
    │       ├── Skill.php
    │       ├── Badge.php
    │       └── ...
    ├── public/index.php      # API entry point
    ├── tests/
    └── API_DOCUMENTATION.md
```

---

## 🔌 API Endpoints

Base URL: `http://localhost:8000`

### Authentication
- `POST /auth/register` - Create new account
- `POST /auth/login` - Sign in

### Users
- `GET /users/{id}` - Get user
- `PUT /users/{id}` - Update user
- `DELETE /users/{id}` - Delete user

### Profiles
- `GET /profiles/{userId}` - Get profile
- `POST /profiles` - Create profile
- `PUT /profiles/{id}` - Update profile

### Jobs
- `GET /jobs` - List all jobs
- `GET /jobs/{id}` - Get job details
- `POST /jobs` - Create job
- `GET /jobs/search/{query}` - Search jobs

### Companies
- `GET /companies` - List companies
- `POST /companies` - Create company
- `PUT /companies/{id}` - Update company

### Matching (Tinder-style)
- `POST /matches` - Create match (like/pass/maybe)
- `GET /users/{userId}/matches` - Get all matches
- `GET /users/{userId}/matches/liked` - Get liked jobs
- `GET /users/{userId}/recommendations` - Get recommendations

### Skills, Experience, Education, Badges
- `POST /skills` - Add skill
- `GET /users/{userId}/skills` - Get user skills
- `POST /experience` - Add work experience
- `GET /users/{userId}/experience` - Get experience
- `POST /education` - Add education
- `GET /users/{userId}/badges` - Get badges

---

## 🎨 User Roles & Features

### Job Seeker
**Dashboard Sections:**
- Overview (applied jobs, recommendations)
- Job Matcher (Tinder-style swiping)
- Profile (CV, skills, education)
- Applications (track status)
- Quiz System (skill verification)
- Badge Achievements
- Statistics

**Actions:**
- ✅ Like/Pass jobs
- ✅ Build profile
- ✅ Add skills & experience
- ✅ Generate CV
- ✅ Take skill tests
- ✅ View recommendations

### Company Admin
**Dashboard Sections:**
- Overview (active jobs, new applications)
- Job Management (CRUD operations)
- Candidate Tracking (pipeline)
- Analytics (hiring funnel)
- Team Settings
- Company Profile

**Actions:**
- ✅ Post jobs
- ✅ Manage job listings
- ✅ Review candidates
- ✅ Track applications
- ✅ View analytics
- ✅ Update company info

### Recruiter
**Inherits Company Admin features plus:**
- Multi-job management
- Advanced filtering
- Bulk operations
- Candidate recommendations
- Skill matching

---

## 🗄️ Database Schema

### Core Tables
- **users** - User accounts
- **profiles** - Job seeker profiles
- **companies** - Company information
- **jobs** - Job postings
- **skills** - User skills
- **work_experience** - Work history
- **education** - Educational background
- **badges** - Achievement badges
- **matches** - Tinder-style interactions

All tables use UUID primary keys and include `created_at`/`updated_at` timestamps.

---

## 🔄 Authentication Flow

```
User → Frontend → Login/Register → Backend
                                  ↓
                            Validate credentials
                                  ↓
                            Create session
                                  ↓
                            Return user info
                                  ↓
Frontend → Store auth context → Load dashboard
```

---

## 🧪 Testing

### Frontend Tests
```bash
npm test
```

### Backend Tests
```bash
php tests/standalone_unit_test.php
```

### API Testing
Use tools like Postman or cURL to test endpoints:

```bash
# Register
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"pass123","firstName":"John","lastName":"Doe","role":"jobseeker"}'

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"pass123"}'

# Get jobs
curl http://localhost:8000/jobs

# Create match
curl -X POST http://localhost:8000/matches \
  -H "Content-Type: application/json" \
  -d '{"jobSeekerId":"uuid","jobId":"uuid","action":"like","score":85}'
```

---

## 📊 Key Models

### User Model
- Register with email/password
- Authenticate users
- Password hashing (bcrypt)
- Public info (no password)

### Job Model
- Create/search jobs
- Filter by type, location, salary
- Close job postings
- Get with company info

### Profile Model
- Complete profile management
- Salary expectations
- Job preferences
- Location & remote preference

### JobMatch Model
- Tinder-style interactions (like/pass/maybe)
- Calculate match scores
- Get recommendations
- Track mutual matches

---

## 🎯 Next Steps

1. **Frontend Setup**
   - Install Node.js and npm
   - Run `npm install && npm run dev`

2. **Backend Setup**
   - Install PHP and PostgreSQL
   - Create database
   - Run initialization test

3. **Environment Variables**
   - Create `.env` file
   - Configure DB credentials
   - Set API endpoints

4. **Testing**
   - Sign up with different roles
   - Test all dashboard sections
   - Verify job matching

5. **Deployment**
   - Build frontend: `npm run build`
   - Deploy to hosting
   - Configure backend server

---

## 🐛 Troubleshooting

### Database Connection Error
```
Solution: Check PostgreSQL is running
psql -U azer -d battal_db
```

### PHP Module Not Found
```
Solution: Check PHP extensions are loaded
php -m | grep pdo_pgsql
```

### Frontend Port Already in Use
```
Solution: Kill existing process or use different port
npm run dev -- --port 3000
```

### CORS Errors
```
Solution: Check backend CORS headers are enabled
Check public/index.php has CORS headers
```

---

## 📝 Environment Configuration

Create `.env` in backend:
```
DB_HOST=localhost
DB_NAME=battal_db
DB_USER=azer
DB_PASSWORD=your_password
DB_PORT=5432
```

---

## 📚 Additional Resources

- [API Documentation](backend/API_DOCUMENTATION.md)
- [React Documentation](https://react.dev)
- [PHP Documentation](https://www.php.net/docs.php)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## 👥 Support

For issues or questions:
1. Check the API documentation
2. Review the test files
3. Check terminal error messages
4. Verify database connection

---

## 📄 License

This project is part of the Battal Pro Max job matching platform.

---

**Happy coding! 🚀**
