# AI Resume Analyzer

AI Resume Analyzer is a production-grade, full-stack, ATS-friendly SaaS application designed to help users upload their resumes, parse their structured information (contacts, experience, education, projects, skills), evaluate ATS compliance scoring, compare against job descriptions, map skill gaps, and get actionable AI-powered suggestions.

---

## Features

1. **Multi-Format Resume Upload**: Supports PDF (`.pdf`) and Word (`.docx`) documents with size and MIME validation.
2. **Text & Information Extraction**: Extracts contact details, experience history, academic credentials, projects, and technical skills using Apache PDFBox and Apache POI.
3. **Deterministic & AI-Powered ATS Scoring**: Calculates section-by-section breakdown (Keyword Relevance, Skills Match, Experience Relevance, Layout & Formatting, Structure, Achievements, and Contact Information) yielding an ATS score out of 100.
4. **Target Job Description Matching**: Allows candidates to paste target job descriptions to calculate match percentages, detect missing skills, and prioritize learning goals.
5. **Skill Gap & Keyword Detection**: Highlights matched skills, partial semantic matches, and missing requirements with priority badges.
6. **Actionable Improvement Suggestions**: Provides bullet point refinement, action verb upgrades, and role alignment recommendations.
7. **Version Management & Comparison**: Allows duplicating resume versions, maintaining tailored variants for different job roles, and viewing side-by-side structural diffs.
8. **Real-time Analytics Dashboard**: Tracks total resumes, average ATS score, highest score, and visual historical scoring trends using Recharts.
9. **Exportable PDF Audit Reports**: Generates downloadable ATS audit summary reports in PDF format with Apache PDFBox.
10. **Stateless JWT Security & Admin Controls**: Role-based access control (`USER` and `ADMIN`) with BCrypt password hashing and system-wide analytics.

---

## Technical Stack & Architecture

### Backend
- **Framework**: Spring Boot 3.x (Java 21)
- **Security**: Spring Security 6.x (JWT stateless session, BCrypt password hashing)
- **Database**: MySQL 8.0
- **Database Migrations**: Flyway
- **Text Parsers**: Apache PDFBox 3.x (PDF text extraction), Apache POI 5.x (Word DOCX extraction)
- **AI Integrations**: Switchable connectors (Gemini 1.5 Flash, OpenAI GPT-4o-mini, offline Regex-based Mock AI engine)
- **Async Execution**: Asynchronous processing queue utilizing Spring `@Async` proxy threads.

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 (Vanilla PostCSS plugin + glassmorphism premium UI theme)
- **State Management**: TanStack React Query v5 + Axios
- **Routing**: React Router v7 (with Auth Session & Admin Route guards)
- **Charts**: Recharts (interactive performance Area trends)
- **Icons**: Lucide React

---

## Environment Variable Configuration

Create a `.env` file or export the following variables in your environment (see `.env.example`):

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `SPRING_DATASOURCE_URL` | MySQL JDBC connection string | `jdbc:mysql://localhost:3306/ai_resume_analyzer` |
| `SPRING_DATASOURCE_USERNAME` | MySQL database username | `root` |
| `SPRING_DATASOURCE_PASSWORD` | MySQL database password | `Mysql@123` |
| `AI_PROVIDER` | Active AI provider (`mock`, `gemini`, `openai`) | `mock` |
| `GEMINI_API_KEY` | Google Gemini API key (if using `gemini`) | *Optional* |
| `OPENAI_API_KEY` | OpenAI API key (if using `openai`) | *Optional* |
| `JWT_SECRET` | 256-bit secret key for JWT signing | `404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970` |
| `JWT_EXPIRATION_MS` | JWT token validity in milliseconds | `86400000` (24h) |
| `VITE_API_BASE_URL` | Frontend target API base URL | `http://localhost:8080` |

---

## Database Schema (Initial Migrations)
Flyway script `V1__Initial_Schema.sql` defines:
- `users`: Stores user emails, hashed passwords, and roles (`USER`, `ADMIN`).
- `resumes`: Tracks document meta-details.
- `resume_versions`: Holds duplicated or modified text and parsed JSON states.
- `job_descriptions`: Caches job requirements, skills, and titles.
- `resume_analyses`: Tracks historical and async parsing results (pending, completed, failed status, ATS score, job match %, and serialized sub-elements: formatting issues, grammar issues, skill gaps, improvements).

---

## REST API Endpoints

### 1. Authentication
- `POST /api/auth/register` - Register a user (supports `USER` and `ADMIN` roles).
- `POST /api/auth/login` - Authenticate user, returns stateless JWT bearer token.

### 2. Resumes
- `GET /api/resumes` - List all user resumes.
- `POST /api/resumes` - Upload a multipart PDF/DOCX resume file (initiates parsing).
- `GET /api/resumes/{id}` - Fetch resume details with versions history.
- `DELETE /api/resumes/{id}` - Delete a resume and all its versions/analyses.
- `PUT /api/resumes/{id}/rename` - Rename resume file metadata.
- `GET /api/resumes/versions/{versionId}` - Fetch specific version details.
- `POST /api/resumes/versions/{versionId}/duplicate` - Create a copy of a version.

### 3. Job Descriptions
- `POST /api/jobs` - Parse and save job description text requirements.
- `GET /api/jobs` - List all user job descriptions.
- `GET /api/jobs/{id}` - Fetch job description keywords and specifications.
- `DELETE /api/jobs/{id}` - Delete job description.

### 4. Resume Analyses
- `POST /api/analysis/resume/{versionId}` - Start background standalone ATS compliance analysis.
- `POST /api/analysis/resume/{versionId}/job/{jobId}` - Start background matched analysis against job requirements.
- `GET /api/analysis/{id}` - Fetch analysis status, scores, keywords, and recommendations.
- `GET /api/analysis/{id}/export` - Download full ATS audit analysis report as formatted PDF.
- `GET /api/analysis/history` - Fetch all past analysis scores list.
- `GET /api/analysis/resume-history/{resumeId}` - Fetch history logs for a specific resume.

### 5. Statistics
- `GET /api/dashboard` - Fetch aggregated user statistics (resumes counts, average scores, trends).
- `GET /api/admin/statistics` - Fetch system-wide statistics (admin privilege required).

---

## Local Run & Installation

### Prerequisites
- Java 21 JDK or higher
- Node.js 20 or higher
- MySQL Server 8.0 running on port 3306

### Backend Setup
1. Configure database credentials in `backend/src/main/resources/application.yml` or set environment variables.
2. Build dependencies:
   ```bash
   cd backend
   .\mvnw clean compile
   ```
3. Start Spring Boot:
   ```bash
   .\mvnw spring-boot:run
   ```
   *(Backend starts on `http://localhost:8080`)*

### Frontend Setup
1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Start local Vite development server:
   ```bash
   npm run dev
   ```
   *(Frontend starts on `http://localhost:5173`)*

---

## Docker Compose Quickstart
To run the full stack (frontend, backend, and MySQL database container) with Docker:
```bash
docker-compose up --build
```
- **Frontend**: `http://localhost` (Port 80)
- **Backend API**: `http://localhost:8080` (Port 8080)
- **MySQL Database**: Port 3306
