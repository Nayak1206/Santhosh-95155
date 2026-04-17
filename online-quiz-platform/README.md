# Online Quiz & Exam Platform

A fully functional, production-ready platform for conducting quizzes and exams.

## 🚀 Features
- **Admin**: Create exams, manage questions, import via Excel, view student results, grant retakes.
- **Student**: Attempt exams, real-time timer, auto-save answers, instant results, attempt history.
- **Core**: JWT Authentication, Role-based Access, Coding Question Sandbox, Turso (SQLite) integration.

## 🛠️ Tech Stack
- **Frontend**: Vite + React, Tailwind CSS, Monaco Editor, Lucide Icons, Framer Motion.
- **Backend**: Node.js + Express, Turso (libSQL), JWT, bcrypt, xlsx, pdfkit.

## 📦 Installation & Setup

### 1. Backend
1. Go to the `server` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file (already provided in the root of server directory):
   ```env
   TURSO_DATABASE_URL=your_url
   TURSO_AUTH_TOKEN=your_token
   JWT_SECRET=your_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   PORT=5000
   CLIENT_URL=http://localhost:5173
   ```
4. Start the server:
   ```bash
   npm run start
   ```
   *(The server will automatically run migrations and seed sample data on the first run.)*

### 2. Frontend
1. Go to the `client` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 🔐 Credentials
- **Admin**: `admin@quizplatform.com` / `Admin@123`
- **Student**: `alice@example.com` / `Student@123`

## 📁 Folder Structure
- `server/src/controllers`: Business logic.
- `server/src/routes`: API endpoints.
- `server/src/db`: Migrations and seed data.
- `client/src/pages`: UI pages for Admin and Student.
- `client/src/api`: Axios service calls.
