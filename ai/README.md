# CV Generator AI Service

AI-powered CV and cover letter generator using Google Gemini Flash.

## Features

- 🤖 Generate professional CVs using AI
- 📝 Create tailored cover letters
- 🎯 Optimize CVs for specific job descriptions
- 🎨 Multiple CV templates (professional, modern, minimal)
- ⚡ Fast generation with Gemini Flash
- 🔄 RESTful API

## Setup

### 1. Install Dependencies

```bash
cd ai
npm install
```

### 2. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the API key

### 3. Configure Environment

```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your API key
GEMINI_API_KEY=your_actual_api_key_here
PORT=3001
```

### 4. Start the Service

```bash
# Development mode (auto-restart on changes)
npm run dev

# Production mode
npm start
```

The service will run on `http://localhost:3001`

## API Endpoints

### 1. Generate CV

**POST** `/api/generate-cv`

Generate a complete CV in HTML format.

**Request Body:**
```json
{
  "profile": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "city": "San Francisco",
    "region": "CA",
    "country": "USA",
    "linkedin": "linkedin.com/in/johndoe",
    "portfolio": "johndoe.com",
    "headline": "Senior Full Stack Developer",
    "summary": "Experienced developer with 5+ years..."
  },
  "skills": [
    {
      "name": "React",
      "category": "technical",
      "proficiency": 90
    }
  ],
  "experience": [
    {
      "company": "Tech Corp",
      "position": "Senior Developer",
      "location": "San Francisco, CA",
      "start_date": "2020-01-01",
      "end_date": "2023-12-31",
      "current": false,
      "description": "Led development team..."
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
  "jobTitle": "Senior Full Stack Developer",
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
    "jobTitle": "Senior Full Stack Developer"
  }
}
```

**Templates:**
- `professional` - Traditional, ATS-friendly format
- `modern` - Creative, visually appealing design
- `minimal` - Clean, simple layout

### 2. Generate Cover Letter

**POST** `/api/generate-cover-letter`

Generate a tailored cover letter for a job application.

**Request Body:**
```json
{
  "profile": {
    "first_name": "John",
    "last_name": "Doe",
    "headline": "Senior Full Stack Developer",
    "summary": "Experienced developer..."
  },
  "jobTitle": "Senior Software Engineer",
  "companyName": "Google",
  "jobDescription": "We are looking for a senior engineer..."
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

Get AI suggestions to optimize a CV for a specific job.

**Request Body:**
```json
{
  "cvContent": "Current CV content...",
  "jobDescription": "Job description text..."
}
```

**Response:**
```json
{
  "success": true,
  "suggestions": "JSON with keywords, skills, recommendations...",
  "metadata": {
    "generatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 4. Health Check

**GET** `/health`

Check if the service is running.

**Response:**
```json
{
  "status": "ok",
  "service": "CV Generator AI"
}
```

## Testing with curl

### Generate CV
```bash
curl -X POST http://localhost:3001/api/generate-cv \
  -H "Content-Type: application/json" \
  -d '{
    "profile": {
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "headline": "Full Stack Developer"
    },
    "template": "professional"
  }'
```

### Generate Cover Letter
```bash
curl -X POST http://localhost:3001/api/generate-cover-letter \
  -H "Content-Type: application/json" \
  -d '{
    "profile": {
      "first_name": "John",
      "last_name": "Doe",
      "headline": "Full Stack Developer"
    },
    "jobTitle": "Senior Developer",
    "companyName": "Tech Corp"
  }'
```

## Integration with Frontend

Update your frontend `.env` file:

```env
VITE_AI_SERVICE_URL=http://localhost:3001
```

Example frontend code:

```javascript
// Generate CV
const response = await fetch('http://localhost:3001/api/generate-cv', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    profile: userProfile,
    skills: userSkills,
    experience: userExperience,
    education: userEducation,
    template: 'professional'
  })
});

const data = await response.json();
console.log(data.cv); // HTML content
```

## Error Handling

All endpoints return errors in this format:

```json
{
  "error": "Error message",
  "message": "Detailed error description"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad request (missing required fields)
- `500` - Server error (AI generation failed)

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `GEMINI_API_KEY` | Google Gemini API key | Yes | - |
| `PORT` | Server port | No | 3001 |

## Notes

- The service uses Gemini 1.5 Flash for fast generation
- Generated CVs are in HTML format with inline CSS
- Cover letters are in plain text format
- All responses include metadata with timestamps
- The service is stateless (no data storage)

## Troubleshooting

### "API key not valid"
- Check your `.env` file has the correct API key
- Verify the key is active in Google AI Studio

### "Failed to generate CV"
- Check your internet connection
- Verify Gemini API is accessible
- Check API quota limits

### Port already in use
- Change the PORT in `.env` file
- Or stop the process using port 3001

## License

MIT
