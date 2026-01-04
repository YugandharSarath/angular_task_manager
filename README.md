# 🚀 Angular Task Manager

A modern, feature-rich Task Management application built with **Angular 21+** and **Signals**. This project demonstrates the power of modern Angular architecture, featuring a beautiful UI, smooth animations, and advanced productivity features.

![Angular Version](https://img.shields.io/badge/Angular-21%2B-dd0031.svg)
![State Management](https://img.shields.io/badge/State-Signals-blue.svg)
![Styling](https://img.shields.io/badge/Styling-TailwindCSS-38bdf8.svg)

---

## ✨ Key Features

### 🎨 **UI & UX**
- **Dark Mode Support**: Seamless toggle between light and dark themes with system preference detection.
- **Modern Design**: Glassmorphism effects, gradient backgrounds, and responsive layouts using TailwindCSS.
- **Smooth Animations**: 60 FPS animations for adding, deleting, and reordering tasks.
- **Mobile-First**: Fully responsive design that works perfectly on desktop, tablet, and mobile.

### ⚡ **Productivity Tools**
- **Drag & Drop Reordering**: Intuitively organize tasks by dragging them into your preferred order (powered by Angular CDK).
- **Advanced Filtering**:
  - Search by task title, description, or tags.
  - Filter by Priority (High, Medium, Low).
  - Filter by Status (Pending, Completed).
  - "Show Overdue" toggle.
- **Smart Due Dates**: Visual indicators for deadlines (Red for overdue, Orange for approaching).
- **Tags System**: Organize tasks with custom tags (e.g., #work, #urgent).

### 📝 **Task Management**
- **Subtasks**: Break down complex tasks into smaller steps with visual progress tracking.
- **Rich Task Details**: Add priorities, due dates, descriptions, and tags.
- **Real-time Analytics**: Instant stats on productivity (Tasks done today, this week, overdue count, etc.).
- **Data Persistence**: All data is automatically saved to your browser's local storage.

---

## 🛠️ Tech Stack

- **Framework**: Angular 21 (Latest)
- **Language**: TypeScript
- **State Management**: Angular Signals (No RxJS complexity for local state)
- **Styling**: TailwindCSS (v4)
- **Animations**: Angular Animations
- **Drag & Drop**: Angular CDK
- **Architecture**: Service-based with `inject()` pattern

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v10 or higher)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd angular-task-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open in browser**
   Navigate to `http://localhost:4200` to see the app.

---

## 📖 Feature Guide

### 🌙 Dark Mode
Toggle the **Moon/Sun icon** in the top-right header to switch themes. The app remembers your preference.

### ➕ Adding Tasks
1. Click **"+ Add New Task"**.
2. Enter a title (required).
3. (Optional) Set **Priority**, **Due Date**, and **Tags** (comma-separated).
4. Click **Add Task**.

### ✋ Drag & Drop
Hover over any task to see the **drag handle (⋮⋮)** on the left. Click and drag to reorder tasks instantly.

### 🔍 Filtering
Click **"Show Filters"** to access search and sorting options. You can combine multiple filters (e.g., "High Priority" + "Pending" + Search "Report").

### ✅ Subtasks
Tasks break down into subtasks. The progress bar automatically updates as you check them off (e.g., "2/5 completed").

---

## 📂 Project Structure

```bash
src/app/
├── auth/                 # Authentication (Login/Register)
├── dashboard/            # Main Dashboard Component (The core UI)
│   ├── dashboard.html    # Template with filters & list
│   ├── dashboard.ts      # Logic with Signals & DragDrop
│   └── dashboard.css     # Component-specific styles
├── models/               # TypeScript Interfaces (Task, User)
├── services/             # Application Logic
│   ├── task.service.ts   # Task CRUD & business logic
│   ├── theme.service.ts  # Dark mode state
│   └── auth.service.ts   # User session management
├── app.config.ts         # Global config providers
└── styles.css            # Global Tailwind & Dark Mode styles
```

---

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
