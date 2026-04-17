# QuizFlow - Modern Online Quiz & Exam Platform

QuizFlow is a high-performance, full-stack examination system designed for seamless quiz administration and secure proctoring. Built with a focus on speed, reliability, and user experience.

![Dashboard Preview](https://github.com/Nayak1206/Santhosh-95155/raw/main/online-quiz-platform/preview.png)

## 🌟 Key Highlights
- **🎥 Live Proctoring**: Integrated webcam preview during exam attempts to ensure academic integrity.
- **💻 Coding Sandbox**: Execute and auto-evaluate code in Python, Java, and JavaScript using a secure environment.
- **⏱️ Smart Sync**: Real-time timer synchronization with automated server-side submission.
- **📊 Performance Analytics**: Instant rank processing, percentile calculation, and detailed student reporting.

## 🚀 Main Features

### 👨‍🎓 Student Portal
- **Secure Exam Environment**: Floating live camera widget with proctoring status indicators.
- **Dynamic Question Palette**: Color-coded navigation for Answered/Not Visited/Current questions.
- **Auto-Save Engine**: Never lose progress with real-time answer persistence.
- **Detailed History**: Review attempts with correct answers, explanations, and marks analysis.

### 👩‍💼 Admin Portal
- **Exam Architect**: Create complex exams with multi-language coding questions and MCQs.
- **Excel Batch Import**: Import questions in bulk using standard Excel templates.
- **Result Management**: Grant retakes, view detailed student analysis, and manage permissions.
- **Real-time Stats**: Admin dashboard with user growth and participation metrics.

## 🛠️ Technology Stack
- **Frontend**: React (Vite), Tailwind CSS v4, Monaco Editor, Lucide Icons, Framer Motion.
- **Backend**: Node.js, Express, JWT (Access & Refresh tokens).
- **Database**: Turso (Edge-native SQLite) for low-latency global performance.
- **Automation**: Nginx-ready, automated migrations, and demo data seeding.

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+)
- Turso Database API key

### Quick Start
1. **Clone the repository**:
   ```bash
   git clone https://github.com/Nayak1206/Santhosh-95155.git
   ```

2. **Configure Server**:
   ```bash
   cd online-quiz-platform/server
   npm install
   # Configure your .env (see below)
   npm run dev
   ```

3. **Configure Client**:
   ```bash
   cd ../client
   npm install
   npm run dev
   ```

### Environment Configuration (`server/.env`)
```env
TURSO_DATABASE_URL=your_libsql_url
TURSO_AUTH_TOKEN=your_libsql_token
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_key
PORT=5000
CLIENT_URL=http://localhost:5173
```

## 🔐 Default Credentials
- **Admin**: `admin@quizplatform.com` / `Admin@123`
- **Student**: `alice@example.com` / `Student@123`

## 🛡️ License
Distributed under the MIT License. See `LICENSE` for more information.
