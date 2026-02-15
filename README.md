# 🏫 School Management System - Frontend

<div align="center">

![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-4.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-State_Management-FFD11B?style=for-the-badge&logo=pinia&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

</div>

<p align="center">
  A modern, responsive, and robust <strong>Single Page Application (SPA)</strong> built with <strong>Vue.js 3</strong> and <strong>Vite</strong>. This frontend communicates with the Laravel API to provide a seamless experience for Admins, Teachers, and Students.
  <br><br>
  It features a dynamic <strong>Role-Based Access Control (RBAC)</strong> system, ensuring secure and personalized dashboards for each user type.
</p>

---

## 🚀 Features

### 🔐 Authentication & Security
- **Secure Login:** Role-based redirection (Admin/Teacher/Student) upon login.
- **Route Guards:** Prevents unauthorized access to protected pages.
- **Session Management:** Persists user sessions securely using Tokens.

### 👑 Admin Portal
- **Dashboard:** Overview of total students, teachers, and activities.
- **Teacher Management:** Add, edit, and view teacher profiles.
- **Class Management:** Assign specific "Class Teachers" to sections.
- **Student Management:** Manage admissions and student records.

### 👨‍🏫 Teacher Portal
- **Take Attendance:** Interactive interface to take daily class attendance.
- **Marks Entry:** Input exam marks for students subject-wise.
- **My Routine:** View personal class schedules dynamically.
- **My Students:** View list of students in assigned sections.

### 🎓 Student Portal
- **Dashboard:** Personalized view for students.
- **Result View:** Check exam results and grade sheets.
- **Attendance Report:** View monthly attendance status.

### 🎨 UI/UX
- **Responsive Design:** Works on Desktop, Tablet, and Mobile.
- **Interactive Alerts:** Uses **SweetAlert2** for beautiful success/error notifications.
- **Glassmorphism UI:** Modern login and dashboard designs.

---

## 🛠 Tech Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | Vue.js 3 (Composition API) |
| **Build Tool** | Vite |
| **State Management** | Pinia |
| **Routing** | Vue Router 4 |
| **HTTP Client** | Axios |
| **Notifications** | SweetAlert2 |
| **Styling** | CSS3 (Scoped Styles) |

---

## ⚙️ Installation Guide

Follow these steps to set up the project locally:

### 1. Prerequisites
Ensure you have **Node.js** (v16+) and **npm** installed on your machine.

### 2. Clone the Repository
```bash
git clone [https://github.com/FakrulHasanSajib/school-management-frontend.git](https://github.com/FakrulHasanSajib/school-management-frontend.git)
cd school-management-frontend


3. Install Dependencies
npm install
4. Configure API Endpoint
The frontend needs to connect to your Laravel Backend.
Open src/main.js or your Axios configuration file (e.g., src/stores/auth.js or src/utils/axios.js) and ensure the Base URL matches your running Laravel server:
import axios from 'axios'

// Set the base URL for the API
axios.defaults.baseURL = '[http://127.0.0.1:8000/api](http://127.0.0.1:8000/api)';
5. Run Development Server
npm run dev
The app will be available at: http://localhost:5173

📂 Project Structure
A quick look at the top-level files and directories you'll see in this project.

src/
├── assets/          # Static assets (images, css, icons)
├── components/      # Reusable UI components (Buttons, Cards, Modals)
├── layouts/         # Layout wrappers (AdminLayout, TeacherLayout)
├── router/          # Vue Router configuration & Navigation Guards
├── stores/          # Pinia stores for State Management (Auth, etc.)
├── views/           # Page views
│   ├── admin/       # Admin specific pages
│   ├── teacher/     # Teacher specific pages
│   ├── student/     # Student specific pages
│   └── auth/        # Login page
└── App.vue          # Root Vue component


🤝 Contribution
Contributions are welcome!

Fork the repository.

Create a new feature branch (git checkout -b feature-name).

Commit your changes (git commit -m 'Add some feature').

Push to the branch (git push origin feature-name).

Open a Pull Request.

📝 License
This project is open-sourced software licensed under the MIT license.

Developed with ❤️ by Fakrul Hasan Sajib
