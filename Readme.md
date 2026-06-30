# 🎓 SCA Event Management System (SCA EMS)

<p align="center">
A modern role-based Event Management System for the **School of Computer Applications (SCA),
Lovely Professional University (LPU)**.
</p>

---

## 📌 Overview

SCA EMS is a full-stack web application designed to simplify planning, approval, execution, and management of university events. The platform provides dedicated dashboards for Students, Faculty, Admins, and Super Admins with secure authentication and document verification.

---

## ✨ Features

- 🔐 Firebase Authentication
- 👥 Role-based Access Control
- 📄 Student & Faculty Registration
- ✅ Admin Verification Workflow
- 📅 Event Creation & Approval
- 📝 Task & Todo Management
- 📩 Contact Query Management
- ☁️ Cloudinary File Uploads
- 📧 Email Notifications (Brevo SMTP)
- 🛡️ hCaptcha Protection
- 🚀 REST API Architecture

---

# 🏗 Tech Stack

## Frontend
- React 18
- Vite
- Tailwind CSS
- React Router
- Axios
- Firebase Authentication
- Zustand
- React Hook Form + Zod

## Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- Firebase Admin SDK
- Cloudinary
- Nodemailer
- JWT
- Joi

---

# 📁 Project Structure

```text
sca-ems/
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── src/
│   ├── package.json
│   └── .env
│
└── README.md
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone <repository-url>
cd sca-ems
```

## Install Frontend

```bash
cd frontend
npm install
```

## Install Backend

```bash
cd ../backend
npm install
```

---

# ▶ Running Project

Backend

```bash
cd backend
npm run dev
```

Frontend

```bash
cd frontend
npm run dev
```

---

# 🔑 Environment Variables

## Frontend

```env
VITE_API_URL=
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_HCAPTCHA_SITE_KEY=
```

## Backend

```env
PORT=
MONGODB_URI=
JWT_SECRET=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

BREVO_SMTP_HOST=
BREVO_SMTP_PORT=
BREVO_SMTP_USER=
BREVO_SMTP_PASS=

HCAPTCHA_SECRET_KEY=
```

---

# 👥 User Roles

| Role | Permissions |
|------|-------------|
| Student | View events, manage tasks |
| Faculty | Create & manage events |
| Admin | Verify users, approve events |
| Super Admin | Full system access |

---

# 📡 API Modules

- Authentication
- Users
- Verification
- Events
- Tasks
- Todos
- Contact

---

# 🔒 Security

- Helmet
- Express Rate Limit
- Mongo Sanitize
- HPP
- JWT
- Firebase Authentication
- Joi Validation
- hCaptcha

---

# ☁ Services

- Firebase Authentication
- MongoDB Atlas
- Cloudinary
- Brevo SMTP
- hCaptcha

---

# 📌 Future Improvements

- Event Analytics
- Attendance via QR Code
- Notifications
- Calendar Integration
- AI-powered Scheduling
- Reports & Dashboard Analytics

---

# 🤝 Contributing

1. Fork the repository.
2. Create a new branch.
3. Commit your changes.
4. Push the branch.
5. Open a Pull Request.

---

# 📄 License

This project is developed for academic purposes at **Lovely Professional University**.

---

# 👨‍💻 Author

**Saksham**

Developed as part of the SCA Event Management System project.
