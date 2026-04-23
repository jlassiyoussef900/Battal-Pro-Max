# Backend API Documentation

## Overview

The Tinder-style Job Match platform backend is built with PHP and PostgreSQL. It provides RESTful API endpoints for user management, job posting, company management, and job matching features.

## Base URL

```
http://localhost/backend/public
```

## Architecture

### Core Components

1. **Database.php** - PostgreSQL connection manager
2. **Schema.php** - Database table definitions and migrations
3. **ApiRouter.php** - Request routing and API endpoint handler
4. **Models/** - Data access layer with CRUD operations
   - `BaseModel.php` - Abstract base class with common CRUD methods
   - `User.php` - User authentication and management
   - `Profile.php` - Job seeker profiles
   - `Job.php` - Job postings
   - `Company.php` - Company information
   - `Skill.php` - User skills management
   - `WorkExperience.php` - Work history
   - `Education.php` - Education records
   - `Badge.php` - Achievement badges
   - `JobMatch.php` - Tinder-style matches

## Database Schema

### Tables

#### users
- `id` (UUID, PK)
- `email` (VARCHAR, UNIQUE)
- `password_hash` (VARCHAR)
- `first_name` (VARCHAR)
- `last_name` (VARCHAR)
- `role` (VARCHAR) - jobseeker, company_admin, recruiter, hiring_manager
- `avatar_url` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### profiles
- `id` (UUID, PK)
- `user_id` (UUID, FK → users)
- `headline` (VARCHAR)
- `summary` (TEXT)
- `phone` (VARCHAR)
- `linkedin` (VARCHAR)
- `portfolio` (VARCHAR)
- `city`, `region`, `country` (VARCHAR)
- `remote` (BOOLEAN)
- `salary_min`, `salary_max` (INTEGER)
- `salary_currency` (VARCHAR)
- `job_types`, `industries`, `company_sizes` (TEXT[])
- `created_at`, `updated_at` (TIMESTAMP)

#### companies
- `id` (UUID, PK)
- `name` (VARCHAR)
- `description` (TEXT)
- `industry` (VARCHAR)
- `size` (VARCHAR) - startup, sme, enterprise
- `city`, `country` (VARCHAR)
- `website`, `logo_url` (VARCHAR/TEXT)
- `founded` (INTEGER)
- `benefits` (TEXT[])
- `created_at`, `updated_at` (TIMESTAMP)

#### jobs
- `id` (UUID, PK)
- `company_id` (UUID, FK → companies)
- `title` (VARCHAR)
- `description` (TEXT)
- `location` (VARCHAR)
- `job_type` (VARCHAR) - full-time, part-time, contract, internship
- `salary_min`, `salary_max` (INTEGER)
- `salary_currency` (VARCHAR)
- `experience_level` (VARCHAR)
- `remote` (BOOLEAN)
- `required_skills` (TEXT[])
- `benefits` (TEXT[])
- `status` (VARCHAR) - active, closed
- `created_at`, `updated_at` (TIMESTAMP)

#### skills
- `id` (UUID, PK)
- `user_id` (UUID, FK → users)
- `name` (VARCHAR)
- `category` (VARCHAR) - technical, soft, language, industry
- `proficiency` (INTEGER) - 1-100
- `created_at` (TIMESTAMP)

#### work_experience
- `id` (UUID, PK)
- `user_id` (UUID, FK → users)
- `company` (VARCHAR)
- `position` (VARCHAR)
- `location` (VARCHAR)
- `start_date`, `end_date` (DATE)
- `current` (BOOLEAN)
- `description` (TEXT)
- `achievements` (TEXT[])
- `created_at` (TIMESTAMP)

#### education
- `id` (UUID, PK)
- `user_id` (UUID, FK → users)
- `institution` (VARCHAR)
- `degree` (VARCHAR)
- `field_of_study` (VARCHAR)
- `start_date`, `end_date` (DATE)
- `current` (BOOLEAN)
- `gpa` (NUMERIC)
- `created_at` (TIMESTAMP)

#### badges
- `id` (UUID, PK)
- `user_id` (UUID, FK → users)
- `name` (VARCHAR)
- `category` (VARCHAR)
- `level` (VARCHAR) - bronze, silver, gold, platinum
- `score` (INTEGER)
- `earned_at` (TIMESTAMP)
- `icon` (TEXT)
- `created_at` (TIMESTAMP)

#### matches
- `id` (UUID, PK)
- `jobseeker_id` (UUID, FK → users)
- `job_id` (UUID, FK → jobs)
- `action` (VARCHAR) - like, pass, maybe
- `score` (INTEGER)
- `created_at` (TIMESTAMP)

## API Endpoints

### Authentication

#### Register
```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "jobseeker"
}

Response: 201 Created
{
  "id": "uuid",
  "message": "User registered successfully"
}
```

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "jobseeker",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Users

#### Get User
```
GET /users/{id}

Response: 200 OK
{
  "user": { user object }
}
```

#### Update User
```
PUT /users/{id}
Content-Type: application/json

{
  "firstName": "Jane",
  "avatar_url": "https://..."
}

Response: 200 OK
{
  "message": "User updated successfully"
}
```

#### Delete User
```
DELETE /users/{id}

Response: 200 OK
{
  "message": "User deleted"
}
```

#### Get User Public Info
```
GET /users/{id}/public

Response: 200 OK
{
  "user": { user object without password_hash }
}
```

### Profiles

#### Get Profile
```
GET /profiles/{userId}

Response: 200 OK
{
  "profile": { profile object }
}
```

#### Create Profile
```
POST /profiles
Content-Type: application/json

{
  "user_id": "uuid",
  "headline": "Senior Developer",
  "summary": "...",
  "city": "San Francisco",
  "country": "USA",
  "salary_min": 100000,
  "salary_max": 150000,
  "job_types": ["full-time", "contract"],
  "industries": ["Technology"],
  "company_sizes": ["startup", "sme"]
}

Response: 201 Created
{
  "id": "uuid",
  "message": "Profile created"
}
```

#### Update Profile
```
PUT /profiles/{id}
Content-Type: application/json

{
  "headline": "Senior Full Stack Developer",
  "salary_min": 120000
}

Response: 200 OK
{
  "message": "Profile updated"
}
```

#### Get Full Profile (with all related data)
```
GET /profiles/{userId}/full

Response: 200 OK
{
  "profile": {
    ...profile data,
    "skills": [...],
    "experience": [...],
    "education": [...],
    "badges": [...]
  }
}
```

### Jobs

#### Get All Jobs
```
GET /jobs

Response: 200 OK
{
  "jobs": [{ job object }, ...]
}
```

#### Get Job
```
GET /jobs/{id}

Response: 200 OK
{
  "job": { job object with company info }
}
```

#### Create Job
```
POST /jobs
Content-Type: application/json

{
  "company_id": "uuid",
  "title": "Senior Developer",
  "description": "...",
  "job_type": "full-time",
  "location": "San Francisco, CA",
  "salary_min": 100000,
  "salary_max": 150000,
  "experience_level": "senior",
  "remote": true,
  "required_skills": ["React", "Node.js", "PostgreSQL"],
  "benefits": ["Health Insurance", "Remote Work"]
}

Response: 201 Created
{
  "id": "uuid",
  "message": "Job created"
}
```

#### Update Job
```
PUT /jobs/{id}
Content-Type: application/json

{
  "title": "Principal Engineer",
  "salary_max": 200000
}

Response: 200 OK
{
  "message": "Job updated"
}
```

#### Delete Job
```
DELETE /jobs/{id}

Response: 200 OK
{
  "message": "Job deleted"
}
```

#### Search Jobs
```
GET /jobs/search/{query}

Example: GET /jobs/search/developer

Response: 200 OK
{
  "jobs": [{ matching jobs }]
}
```

#### Close Job
```
POST /jobs/{id}/close

Response: 200 OK
{
  "message": "Job closed"
}
```

### Companies

#### Get All Companies
```
GET /companies

Response: 200 OK
{
  "companies": [{ company object with job_count }, ...]
}
```

#### Get Company
```
GET /companies/{id}

Response: 200 OK
{
  "company": { company object with job_count }
}
```

#### Create Company
```
POST /companies
Content-Type: application/json

{
  "name": "Tech Corp",
  "description": "...",
  "industry": "Technology",
  "size": "enterprise",
  "city": "San Francisco",
  "country": "USA",
  "website": "techcorp.com",
  "logo_url": "https://...",
  "founded": 2010,
  "benefits": ["Health Insurance", "Remote Work"]
}

Response: 201 Created
{
  "id": "uuid",
  "message": "Company created"
}
```

#### Update Company
```
PUT /companies/{id}
Content-Type: application/json

{
  "description": "Updated description",
  "benefits": ["Health Insurance", "Stock Options"]
}

Response: 200 OK
{
  "message": "Company updated"
}
```

#### Delete Company
```
DELETE /companies/{id}

Response: 200 OK
{
  "message": "Company deleted"
}
```

#### Search Companies
```
GET /companies/search/{query}

Response: 200 OK
{
  "companies": [{ matching companies }]
}
```

### Skills

#### Add Skill
```
POST /skills
Content-Type: application/json

{
  "userId": "uuid",
  "name": "React",
  "category": "technical",
  "proficiency": 90
}

Response: 201 Created
{
  "id": "uuid",
  "message": "Skill added"
}
```

#### Get User Skills
```
GET /users/{userId}/skills

Response: 200 OK
{
  "skills": [{ skill object }, ...]
}
```

#### Update Skill
```
PUT /skills/{id}
Content-Type: application/json

{
  "proficiency": 95
}

Response: 200 OK
{
  "message": "Skill updated"
}
```

#### Delete Skill
```
DELETE /skills/{id}

Response: 200 OK
{
  "message": "Skill deleted"
}
```

### Work Experience

#### Add Experience
```
POST /experience
Content-Type: application/json

{
  "userId": "uuid",
  "company": "Tech Corp",
  "position": "Senior Developer",
  "location": "San Francisco, CA",
  "start_date": "2022-03-01",
  "current": true,
  "description": "...",
  "achievements": ["Achievement 1", "Achievement 2"]
}

Response: 201 Created
{
  "id": "uuid",
  "message": "Experience added"
}
```

#### Get User Experience
```
GET /users/{userId}/experience

Response: 200 OK
{
  "experience": [{ experience object }, ...]
}
```

#### Update Experience
```
PUT /experience/{id}
Content-Type: application/json

{
  "position": "Principal Engineer",
  "achievements": ["Updated achievement"]
}

Response: 200 OK
{
  "message": "Experience updated"
}
```

#### Delete Experience
```
DELETE /experience/{id}

Response: 200 OK
{
  "message": "Experience deleted"
}
```

### Education

#### Add Education
```
POST /education
Content-Type: application/json

{
  "userId": "uuid",
  "institution": "Stanford University",
  "degree": "Bachelor of Science",
  "field_of_study": "Computer Science",
  "start_date": "2014-09-01",
  "end_date": "2018-06-01",
  "gpa": 3.8
}

Response: 201 Created
{
  "id": "uuid",
  "message": "Education added"
}
```

#### Get User Education
```
GET /users/{userId}/education

Response: 200 OK
{
  "education": [{ education object }, ...]
}
```

#### Update Education
```
PUT /education/{id}
Content-Type: application/json

{
  "gpa": 3.9
}

Response: 200 OK
{
  "message": "Education updated"
}
```

#### Delete Education
```
DELETE /education/{id}

Response: 200 OK
{
  "message": "Education deleted"
}
```

### Badges

#### Get User Badges
```
GET /users/{userId}/badges

Response: 200 OK
{
  "badges": [{ badge object }, ...]
}
```

#### Award Badge
```
POST /badges
Content-Type: application/json

{
  "userId": "uuid",
  "name": "React Master",
  "category": "Technical Skills",
  "level": "gold",
  "score": 95,
  "icon": "code"
}

Response: 201 Created
{
  "id": "uuid",
  "message": "Badge awarded"
}
```

#### Get Badge Statistics
```
GET /users/{userId}/badges/stats

Response: 200 OK
{
  "stats": {
    "total": 5,
    "by_level": {
      "bronze": 0,
      "silver": 1,
      "gold": 3,
      "platinum": 1
    },
    "average_score": 88.5
  }
}
```

### Job Matching (Tinder-style)

#### Create Match
```
POST /matches
Content-Type: application/json

{
  "jobSeekerId": "uuid",
  "jobId": "uuid",
  "action": "like|pass|maybe",
  "score": 85
}

Response: 201 Created
{
  "id": "uuid",
  "message": "Match recorded"
}
```

#### Get User Matches
```
GET /users/{userId}/matches

Response: 200 OK
{
  "matches": [{ match object }, ...]
}
```

#### Get Liked Jobs
```
GET /users/{userId}/matches/liked

Response: 200 OK
{
  "jobs": [{ match object }, ...]
}
```

#### Get Mutual Matches
```
GET /users/{userId}/matches/mutual

Response: 200 OK
{
  "matches": [{ match with job and company info }, ...]
}
```

### Recommendations

#### Get Job Recommendations
```
GET /users/{userId}/recommendations

Based on user profile preferences (job types, industries, salary)

Response: 200 OK
{
  "recommendations": [{ job object }, ...]
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Description of what went wrong"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid credentials"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error: description"
}
```

## CORS Headers

All responses include:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## User Roles

1. **jobseeker** - Job seeker looking for opportunities
2. **company_admin** - Company administrator managing company profile
3. **recruiter** - Recruiter managing job postings
4. **hiring_manager** - Hiring manager reviewing candidates

## Installation & Setup

### Requirements
- PHP 8.1+
- PostgreSQL
- PDO PostgreSQL extension

### Configuration

Update database credentials in `Database.php`:
```php
$host = $_ENV['DB_HOST'] ?? 'localhost';
$dbname = $_ENV['DB_NAME'] ?? 'battal_db';
$user = $_ENV['DB_USER'] ?? 'azer';
$password = $_ENV['DB_PASSWORD'] ?? '';
$port = $_ENV['DB_PORT'] ?? 5432;
```

### Initialize Database

Run the test file to create tables:
```bash
php tests/standalone_unit_test.php
```

## Testing

Run the test suite to verify all functionality:
```bash
php tests/standalone_unit_test.php
```

## Class Structure

### BaseModel
Provides common CRUD methods:
- `create(array $data)` - Create a record
- `getById(string $id)` - Get by ID
- `getAll(array $conditions = [], array $orderBy = [], int $limit = null)` - Get multiple
- `update(string $id, array $data)` - Update a record
- `delete(string $id)` - Delete a record
- `count(array $conditions = [])` - Count records
- `exists(string $id)` - Check existence
- `findBy(array $conditions)` - Find by conditions
- `findOneBy(array $conditions)` - Find one by conditions

### Model-Specific Methods

Each model extends BaseModel and provides specialized methods:

**User** - Authentication, password hashing, role management
**Profile** - Profile creation, preferences, salary expectations
**Job** - Job creation, search, matching algorithms
**Company** - Company profile, job counts
**Skill** - Skill management, proficiency tracking
**WorkExperience** - Experience history
**Education** - Educational background
**Badge** - Achievement system, statistics
**JobMatch** - Tinder-style matching, recommendations

## Next Steps

1. Frontend integration with React
2. Authentication token implementation (JWT)
3. Advanced matching algorithm
4. Email notifications
5. Real-time notifications with WebSocket
6. File upload for CV/documents
7. Advanced search and filtering
8. Analytics dashboard
