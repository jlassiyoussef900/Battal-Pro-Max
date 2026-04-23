# Job Seeker Profile Implementation

## Overview
Implemented full job seeker profile management that saves data to the PostgreSQL database via PHP backend API.

## Frontend Changes

### 1. Updated `src/lib/auth.ts`
Added new API functions:
- `saveProfile(userId, profileData)` - Saves/updates profile information
- `addSkill(userId, skillData)` - Adds a new skill
- `addExperience(userId, experienceData)` - Adds work experience
- `addEducation(userId, educationData)` - Adds education

### 2. Updated `src/sections/Settings.tsx`
- Imported new API functions
- Modified `handleSave()` to call backend API
- Sends profile data including:
  - Personal info (headline, summary, phone, linkedin, portfolio)
  - Location (city, region, country, remote preference)
  - Salary expectations (min, max, currency)
  - Job preferences (job types, industries, company sizes)
- Shows success/error alerts after save

## Backend Changes

### 1. Updated `backend/src/ApiRouter.php`
Modified `updateProfile()` endpoint to:
- Check if profile exists for user
- Update existing profile OR create new one
- Handle both scenarios seamlessly

### 2. Existing Backend Support
Already has endpoints for:
- `PUT /profiles/{userId}` - Update/create profile
- `POST /skills` - Add skill
- `POST /experience` - Add work experience
- `POST /education` - Add education
- `GET /profiles/{userId}` - Get profile
- `GET /profiles/{userId}/full` - Get full profile with skills, experience, education

## Database Schema

### Profiles Table
```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    headline VARCHAR(255),
    summary TEXT,
    phone VARCHAR(20),
    linkedin VARCHAR(255),
    portfolio VARCHAR(255),
    city VARCHAR(100),
    region VARCHAR(100),
    country VARCHAR(100),
    remote BOOLEAN DEFAULT false,
    salary_min INTEGER,
    salary_max INTEGER,
    salary_currency VARCHAR(10) DEFAULT 'USD',
    job_types TEXT[],
    industries TEXT[],
    company_sizes TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Skills Table
```sql
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    proficiency INTEGER CHECK (proficiency >= 0 AND proficiency <= 100),
    years_experience INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Work Experience Table
```sql
CREATE TABLE work_experience (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    start_date DATE NOT NULL,
    end_date DATE,
    current BOOLEAN DEFAULT false,
    description TEXT,
    achievements TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Education Table
```sql
CREATE TABLE education (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    institution VARCHAR(255) NOT NULL,
    degree VARCHAR(255) NOT NULL,
    field_of_study VARCHAR(255),
    start_date DATE NOT NULL,
    end_date DATE,
    current BOOLEAN DEFAULT false,
    gpa DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## How It Works

### Saving Profile
1. User fills out profile form in Settings page
2. Clicks "Save Changes" button
3. Frontend calls `saveProfile(userId, profileData)`
4. API sends PUT request to `/profiles/{userId}`
5. Backend checks if profile exists
6. If exists: updates profile
7. If not: creates new profile
8. Returns success/error response
9. Frontend shows alert to user

### Adding Skills/Experience/Education
1. User clicks "Add" button in respective section
2. Fills out dialog form
3. Frontend calls appropriate API function
4. Backend inserts new record
5. Returns success with new ID
6. Frontend refreshes the list

## Testing

### Test Profile Save
```bash
# Start backend server
cd backend/public
php -S 127.0.0.1:8000

# Test profile update
curl -X PUT http://127.0.0.1:8000/profiles/11111111-1111-1111-1111-111111111111 \
  -H "Content-Type: application/json" \
  -d '{
    "headline": "Senior Full Stack Developer",
    "summary": "Experienced developer with 5+ years",
    "phone": "+1234567890",
    "city": "San Francisco",
    "region": "CA",
    "country": "USA",
    "remote": true,
    "salary_min": 80000,
    "salary_max": 120000,
    "currency": "USD",
    "job_types": ["full-time", "remote"],
    "industries": ["Technology"],
    "company_sizes": ["startup"]
  }'
```

### Test Add Skill
```bash
curl -X POST http://127.0.0.1:8000/skills \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "11111111-1111-1111-1111-111111111111",
    "name": "React",
    "category": "technical",
    "proficiency": 90,
    "years_experience": 5
  }'
```

### Test Add Experience
```bash
curl -X POST http://127.0.0.1:8000/experience \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "11111111-1111-1111-1111-111111111111",
    "company": "Tech Corp",
    "position": "Senior Developer",
    "location": "San Francisco, CA",
    "start_date": "2020-01-01",
    "current": true,
    "description": "Leading development team"
  }'
```

## Next Steps

To fully implement the UI functionality:

1. **Add Experience Dialog**: Wire up the "Add Experience" dialog to call `addExperience()`
2. **Add Education Dialog**: Wire up the "Add Education" dialog to call `addEducation()`
3. **Add Skills**: Wire up skill input fields to call `addSkill()`
4. **Delete Functions**: Implement delete functionality for skills/experience/education
5. **Edit Functions**: Implement edit functionality for existing items
6. **Load Profile**: Load existing profile data when Settings page opens
7. **Real-time Updates**: Refresh lists after adding/editing/deleting items

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profiles/{userId}` | Get user profile |
| PUT | `/profiles/{userId}` | Update/create profile |
| GET | `/profiles/{userId}/full` | Get full profile with all data |
| POST | `/skills` | Add skill |
| GET | `/users/{userId}/skills` | Get user skills |
| PUT | `/skills/{id}` | Update skill |
| DELETE | `/skills/{id}` | Delete skill |
| POST | `/experience` | Add work experience |
| GET | `/users/{userId}/experience` | Get user experience |
| PUT | `/experience/{id}` | Update experience |
| DELETE | `/experience/{id}` | Delete experience |
| POST | `/education` | Add education |
| GET | `/users/{userId}/education` | Get user education |
| PUT | `/education/{id}` | Update education |
| DELETE | `/education/{id}` | Delete education |
