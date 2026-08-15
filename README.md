# cracKd - AI Resume Analyst and Interview Prep Platform

<p align="center">
  <strong>Crack Interviews. Build Confidence. Get Hired.</strong>
</p>

<p align="center">
  An AI-powered full-stack application built to analyze resumes, calculate real-time ATS scores, generate tailored cover letters, predict interview questions, and give actionable feedback to help job seekers land more offers.
</p>

---

## Key Features

- **Smart Resume Parsing and Upload**: Upload PDF resumes with fast local parsing via `pdf-parse` and Multer.
- **ATS Score and Section Breakdown**: Instant ATS readiness scoring with in-depth evaluation of Keywords, Formatting, Grammar, Skills, and Quantifiable Impact.
- **AI Suggestions and Quick Wins**: Context-aware recommendations and prioritized action items to improve resume ranking.
- **Cover Letter Generator**: Generate personalized, job-tailored cover letters based on your resume and target job descriptions.
- **Mock Interview Question Generator**: Generates behavioral and technical interview questions tailored specifically to your resume's claimed experience.
- **Career Analytics and Progress Tracking**: Historical tracking of uploaded resumes, score improvements, and application readiness metrics.
- **Export and Download**: One-click download of analyzed reports and generated assets.
- **Secure Authentication**: JWT-based authentication with Bcrypt password hashing and Google OAuth 2.0 support.
- **Resilient AI Pipeline**: Dual AI provider support (Google Gemini and Groq) with an automatic offline heuristic fallback analyzer.

---

## Tech Stack

### Frontend
- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS and Modern Glassmorphism Design System
- **Icons**: Lucide React and SVG Icons
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios (with 60s timeout resilience for server cold starts)
- **Auth and OAuth**: `@react-oauth/google` and Local Token Storage
- **Notifications**: `react-hot-toast`

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js 5
- **Database**: MongoDB with Mongoose ODM
- **File Handling**: Multer and `pdf-parse`
- **Security**: JWT (`jsonwebtoken`), `bcryptjs`, CORS, Cookie-Parser
- **External Services**: Google Gemini API, Groq SDK, Cloudinary, Nodemailer (SMTP)

---

## Project Structure

```text
crackd-1/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Auth and Resume request handlers
│   │   ├── lib/              # DB connection, Cloudinary, Mailer, JWT utilities
│   │   ├── middlewares/      # Auth guard (protectRoute), Error handling
│   │   ├── models/           # Mongoose schemas (User, ResumeReport)
│   │   ├── routes/           # Express route definitions (/api/auth, /api/resumes)
│   │   ├── services/         # Gemini/Groq AI integration and Fallback logic
│   │   ├── utils/            # Multer storage configuration
│   │   └── index.js          # Express app entry point
│   ├── uploads/              # Temporary file storage
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   └── my-react-app/
│       ├── src/
│       │   ├── components/   # Sidebar, Navbar, LogoBadge, Dropdowns, Cards
│       │   ├── layouts/      # DashboardLayout
│       │   ├── pages/        # Dashboard, ResumeAnalysis, AISuggestions,
│       │   │                 # CoverLetter, InterviewQuestions, Analytics,
│       │   │                 # Profile, Settings, Login, Signup, ForgotPassword
│       │   ├── services/     # Axios client instances (authService, resumeService)
│       │   ├── App.jsx       # App routing and protected routes
│       │   └── main.jsx      # React DOM root and Google OAuth provider
│       ├── public/           # Static assets and favicons
│       ├── package.json
│       ├── vite.config.js
│       └── .env.example
│
├── .gitignore                # Production-grade gitignore
└── README.md
```

---

## Quick Start (Local Setup)

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB instance running on port `27017` (or MongoDB Atlas connection string)
- **Git**

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/crackd.git
cd crackd
```

---

### Step 2: Configure Backend

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   npm install
   ```

2. Create a `.env` file (or copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

3. Configure your environment variables in `backend/.env`:
   ```env
   PORT=5001
   FRONTEND_URL=http://localhost:5173
   MONGODB_URI=mongodb://localhost:27017/crackd
   JWT_SECRET=your_super_secret_jwt_key_here

   # Optional: Add your API keys for live AI processing (uses built-in fallback if omitted)
   GEMINI_API_KEY=
   GROQ_API_KEY=

   # Optional: Cloudinary for profile pictures
   CLOUDINARY_CLOUD_NAME=
   CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=

   # Optional: Google OAuth
   GOOGLE_CLIENT_ID=

   # Optional: SMTP for password reset emails
   SMTP_HOST=
   SMTP_PORT=587
   SMTP_USER=
   SMTP_PASS=
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```
   *Server will run at `http://localhost:5001`.*

---

### Step 3: Configure Frontend

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend/my-react-app
   npm install
   ```

2. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```

3. Configure `frontend/my-react-app/.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:5001/api
   VITE_GOOGLE_CLIENT_ID=
   ```

4. Start the Vite dev server:
   ```bash
   npm run dev
   ```
   *Frontend will run at `http://localhost:5173`.*

---

## API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Register a new user | No |
| `POST` | `/api/auth/login` | Login user and issue JWT | No |
| `POST` | `/api/auth/google` | Sign in or sign up with Google | No |
| `GET` | `/api/auth/check` | Validate session and get current user | Yes (Bearer Token) |
| `PUT` | `/api/auth/update-profile` | Update profile details (bio, name, avatar) | Yes (Bearer Token) |
| `POST` | `/api/auth/forgot-password` | Send password reset token email | No |
| `POST` | `/api/auth/reset-password/:token` | Reset password using email token | No |

### Resumes and AI Analysis (`/api/resumes`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/resumes/upload` | Upload and queue PDF resume for analysis | Yes |
| `GET` | `/api/resumes/history` | List all analyzed resumes for current user | Yes |
| `GET` | `/api/resumes/:id` | Get specific report details and score breakdown | Yes |
| `GET` | `/api/resumes/:id/download` | Download original uploaded resume file | Yes |
| `DELETE` | `/api/resumes/:id` | Delete resume report and associated file | Yes |
| `POST` | `/api/resumes/:id/ai-suggestions` | Generate personalized improvement points | Yes |
| `POST` | `/api/resumes/:id/cover-letter` | Generate targeted cover letter | Yes |
| `POST` | `/api/resumes/:id/interview-questions` | Generate tailored interview questions | Yes |

---

## Deployment Guide

### Deploying Backend (Render or Railway)
1. **Root Directory**: `backend`
2. **Build Command**: `npm install`
3. **Start Command**: `npm start`
4. **Environment Variables**:
   - `MONGODB_URI`: Your MongoDB Atlas URI
   - `JWT_SECRET`: Random secure string
   - `FRONTEND_URL`: `https://your-frontend.vercel.app` (your deployed frontend URL)
   - `PORT`: `5001` (or provided by host)

### Deploying Frontend (Vercel or Netlify)
1. **Root Directory**: `frontend/my-react-app`
2. **Build Command**: `npm run build`
3. **Output Directory**: `dist`
4. **Environment Variables**:
   - `VITE_API_BASE_URL`: `https://your-backend.onrender.com/api` (your deployed backend API URL)

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.
