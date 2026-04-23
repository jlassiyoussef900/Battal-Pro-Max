# CV Generator with AI - Complete Setup Guide

## Overview

The CV Generator uses Google Gemini Flash AI to create professional, ATS-optimized resumes from user profile data.

## Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Frontend  │─────▶│  AI Service  │─────▶│   Gemini    │
│  (React)    │      │  (Node.js)   │      │   Flash     │
│  Port 5173  │      │  Port 3001   │      │     API     │
└─────────────┘      └──────────────┘      └─────────────┘
       │
       │
       ▼
┌─────────────┐
│   Backend   │
│    (PHP)    │
│  Port 8000  │
└─────────────┘
       │
       ▼
┌─────────────┐
│  PostgreSQL │
│   Database  │
└─────────────┘
```

## Setup Instructions

### 1. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 2. Setup AI Service

```bash
# Navigate to AI folder
cd ai

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and add your API key
# GEMINI_API_KEY=your_actual_api_key_here
# PORT=3001
```

### 3. Setup Frontend Environment

```bash
# Navigate to app root
cd ..

# Create/update .env file
echo "VITE_API_BASE=http://127.0.0.1:8000" > .env
echo "VITE_AI_SERVICE_URL=http://localhost:3001" >> .env
```

### 4. Start All Services

Open 3 terminal windows:

**Terminal 1 - Backend (PHP):**
```bash
cd backend/public
php -S 127.0.0.1:8000
```

**Terminal 2 - AI Service:**
```bash
cd ai
npm start
```

**Terminal 3 - Frontend:**
```bash
npm run dev
```

## Testing the CV Generator

### 1. Via Frontend UI

1. Open browser: `http://localhost:5173`
2. Login to the application
3. Go to "CV Generator" section
4. Fill out your profile in Settings (if not done)
5. Select a template (Professional, Modern, or Minimal)
6. Click "Generate with AI"
7. Wait for generation (5-10 seconds)
8. Click "Preview" to see the generated CV
9. Click "Export PDF" to download

### 2. Via API (curl)

```bash
# Test health check
curl http://localhost:3001/health

# Generate CV
curl -X POST http://localhost:3001/api/generate-cv \
  -H "Content-Type: application/json" \
  -d '{
    "profile": {
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "city": "San Francisco",
      "region": "CA",
      "country": "USA",
      "headline": "Senior Full Stack Developer",
      "summary": "Experienced developer with 5+ years in web development"
    },
    "skills": [
      {"name": "React", "category": "technical", "proficiency": 90},
      {"name": "Node.js", "category": "technical", "proficiency": 85},
      {"name": "TypeScript", "category": "technical", "proficiency": 88}
    ],
    "experience": [
      {
        "company": "Tech Corp",
        "position": "Senior Developer",
        "location": "San Francisco, CA",
        "start_date": "2020-01-01",
        "end_date": "2023-12-31",
        "current": false,
        "description": "Led development of microservices architecture"
      }
    ],
    "education": [
      {
        "institution": "Stanford University",
        "degree": "Bachelor of Science",
        "field_of_study": "Computer Science",
        "start_date": "2015-09-01",
        "end_date": "2019-06-01",
        "gpa": "3.8"
      }
    ],
    "template": "professional"
  }'
```

## Features

### CV Generation
- ✅ Professional HTML CV with inline CSS
- ✅ Three templates: Professional, Modern, Minimal
- ✅ ATS-optimized format
- ✅ Print-friendly design
- ✅ Includes all profile sections
- ✅ AI-enhanced content

### Cover Letter Generation
- ✅ Tailored to specific job
- ✅ Company-specific content
- ✅ Professional tone
- ✅ Highlights relevant experience

### CV Optimization
- ✅ Keyword suggestions
- ✅ Skills to emphasize
- ✅ Match score calculation
- ✅ Specific recommendations

## API Endpoints

### 1. Generate CV
**POST** `/api/generate-cv`

Generates a complete CV in HTML format.

**Request:**
```json
{
  "profile": { /* user profile */ },
  "skills": [ /* skills array */ ],
  "experience": [ /* experience array */ ],
  "education": [ /* education array */ ],
  "jobTitle": "Senior Developer",
  "template": "professional"
}
```

**Response:**
```json
{
  "success": true,
  "cv": "<html>...</html>",
  "metadata": {
    "generatedAt": "2024-01-15T10:30:00.000Z",
    "template": "professional",
    "jobTitle": "Senior Developer"
  }
}
```

### 2. Generate Cover Letter
**POST** `/api/generate-cover-letter`

Generates a tailored cover letter.

**Request:**
```json
{
  "profile": { /* user profile */ },
  "jobTitle": "Senior Software Engineer",
  "companyName": "Google",
  "jobDescription": "Optional job description..."
}
```

**Response:**
```json
{
  "success": true,
  "coverLetter": "Dear Hiring Manager,\n\n...",
  "metadata": {
    "generatedAt": "2024-01-15T10:30:00.000Z",
    "jobTitle": "Senior Software Engineer",
    "companyName": "Google"
  }
}
```

### 3. Optimize CV
**POST** `/api/optimize-cv`

Provides suggestions to optimize CV for a job.

**Request:**
```json
{
  "cvContent": "Current CV content...",
  "jobDescription": "Job description..."
}
```

**Response:**
```json
{
  "success": true,
  "suggestions": "{ keywords: [...], skillsToEmphasize: [...], ... }",
  "metadata": {
    "generatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

## Templates

### Professional
- Traditional layout
- Black and white color scheme
- ATS-friendly format
- Best for: Corporate, Finance, Legal

### Modern
- Contemporary design
- Blue accent colors
- Clean typography
- Best for: Tech, Startups, Creative

### Minimal
- Simple, clean layout
- Green accent colors
- Lots of white space
- Best for: Design, Marketing, Consulting

## Troubleshooting

### AI Service Not Starting

**Error:** "API key not valid"
- Check `.env` file in `ai/` folder
- Verify API key is correct
- Ensure no extra spaces in `.env`

**Error:** "Port 3001 already in use"
- Change PORT in `ai/.env`
- Update VITE_AI_SERVICE_URL in app `.env`

### CV Generation Fails

**Error:** "Failed to generate CV"
- Check AI service is running: `curl http://localhost:3001/health`
- Check browser console for errors
- Verify profile data is complete

**Error:** "Make sure the AI service is running"
- Start AI service: `cd ai && npm start`
- Check service logs for errors

### Empty or Incomplete CV

- Ensure profile data is saved in Settings
- Add skills, experience, and education
- Check database has the data: `SELECT * FROM profiles WHERE user_id = 'your-id'`

## File Structure

```
app/
├── ai/                          # AI Service
│   ├── server.js               # Express server with Gemini
│   ├── package.json            # Dependencies
│   ├── .env                    # API key (create this)
│   ├── .env.example            # Example env file
│   └── README.md               # AI service docs
├── src/
│   ├── sections/
│   │   └── CVGenerator.tsx     # CV Generator UI
│   └── lib/
│       └── auth.ts             # API functions
├── .env                        # Frontend env (create this)
└── .env.example                # Example env file
```

## Environment Variables

### AI Service (`ai/.env`)
```env
GEMINI_API_KEY=your_gemini_api_key
PORT=3001
```

### Frontend (`.env`)
```env
VITE_API_BASE=http://127.0.0.1:8000
VITE_AI_SERVICE_URL=http://localhost:3001
```

## Cost Considerations

### Gemini Flash API
- **Free Tier:** 15 requests per minute
- **Cost:** Free for most use cases
- **Rate Limits:** 1,500 requests per day (free tier)

### Recommendations
- Cache generated CVs to reduce API calls
- Implement rate limiting on frontend
- Consider upgrading for production use

## Next Steps

### Enhancements
1. **Add more templates** - Create additional CV designs
2. **Save generated CVs** - Store in database for later access
3. **Version history** - Track CV changes over time
4. **A/B testing** - Compare different CV versions
5. **Analytics** - Track which CVs get more responses
6. **Batch generation** - Generate multiple CVs at once
7. **Custom branding** - Add company logos, colors
8. **Multi-language** - Generate CVs in different languages

### Production Deployment
1. **Environment variables** - Use production API keys
2. **Rate limiting** - Implement request throttling
3. **Caching** - Cache generated CVs
4. **Error handling** - Better error messages
5. **Monitoring** - Track API usage and errors
6. **Security** - Add authentication to AI service

## Support

For issues or questions:
1. Check the logs in AI service terminal
2. Verify all services are running
3. Check API key is valid
4. Review browser console for errors

## Resources

- [Google AI Studio](https://makersuite.google.com/)
- [Gemini API Docs](https://ai.google.dev/docs)
- [Express.js Docs](https://expressjs.com/)
- [React Docs](https://react.dev/)
