# 🎓 Online Quiz & Exam Platform Walkthrough

Welcome to your production-ready Online Quiz & Exam Platform! This platform is designed to handle everything from user authentication to complex exam attempts with real-time syncing.

## 🌟 Key Functional Features

### 🔐 1. Authentication & Role Management
- **Universal Login**: Access both Admin and Student portals with role-based JWT authentication.
- **Secure Sessions**: Integrated refresh tokens ensure students don't get logged out mid-exam.

### 🧑💼 2. Admin Capabilities
- **Dashboard**: Track platform activity with live stats and submission charts.
- **Exam Management**: Full CRUD for exams. Set duration, passing scores, and schedule.
- **Question Bank**: 
    - Support for **MCQ**, **Short Answer**, and **Coding** questions.
    - **Excel Import**: Bulk upload hundreds of questions in seconds using the `.xlsx` template.
- **Real-time Results**: View student scoreboards immediately after submission.

### 👨🎓 3. Student Experience
- **Interactive Timer**: Server-synced countdown timer that enforces deadlines.
- **Auto-Save**: Every answer is saved to the cloud within 3 seconds of selection.
- **Coding Sandbox**: Write and run JavaScript/Python code directly in the browser using the integrated Monaco Editor.
- **Instant Feedback**: View detailed results, grades, and question-by-question explanations after submitting.

## 🛠️ How to Run the Project

### Phase 1: Start the Backend
1. Open a terminal in `server/`.
2. Run `npm run start`.
3. The server will start on `http://localhost:5000`. It will automatically:
    - Connect to Turso DB.
    - Create all 7 required tables.
    - Seed the database with an Admin account and sample exams.

### Phase 2: Start the Frontend
1. Open another terminal in `client/`.
2. Run `npm run dev`.
3. Open `http://localhost:5173` in your browser.

## 🧪 Testing Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@quizplatform.com` | `Admin@123` |
| **Student** | `alice@example.com` | `Student@123` |

## 📁 System Architecture
- **DB**: Turso (SQLite Edge) for low-latency data access.
- **API**: Clean RESTful endpoints for modularity.
- **UI**: Modern, responsive Tailwind design with a professional green/blue palette.
