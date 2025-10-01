# Project Lighthouse

An early-warning system designed to identify students at risk by analyzing academic data and self-reported well-being. This system provides alerts to counselors and administrators, enabling proactive support.

## ✨ Features

*   **User Authentication:** Secure login for staff (counselors, admins).
*   **Student & Course Management:** CRUD operations for students and courses.
*   **Risk Analysis:** A backend service to analyze student data and generate alerts.
*   **Alerts Dashboard:** View and manage system-generated alerts for at-risk students.
*   **Student Details Page:** In-depth view of a student's data, including submissions, mood reports, and alerts.

## 🛠️ Tech Stack

*   **Frontend:** React, Vite, Axios
*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB with Prisma ORM
*   **Deployment:** Frontend on Vercel, Backend on Render.

## 🚀 Getting Started

### Prerequisites

*   Node.js (v18 or later)
*   npm
*   A MongoDB database (you can get a free one from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Create an environment file:**
    Create a file named `.env` in the `backend` directory and add your MongoDB connection string:
    ```
    DATABASE_URL="your_mongodb_connection_string"
    JWT_SECRET="your_jwt_secret"
    ```
4.  **Start the server:**
    ```bash
    npm start
    ```
    The backend will be running at `http://localhost:5001`.

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Create an environment file (optional for local dev):**
    Create a file named `.env.local` in the `frontend` directory to point to your local backend:
    ```
    VITE_API_BASE_URL="http://localhost:5001/api"
    ```
4.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The frontend will be accessible at `http://localhost:5173` (or another port if 5173 is busy).

## ☁️ Deployment

The application is designed for a split deployment:

*   **Backend:** Deployed as a Node.js Web Service on **Render**.
    *   **Build Command:** `npm install`
    *   **Start Command:** `npm start`
    *   **Environment Variables:** `DATABASE_URL`, `JWT_SECRET`
*   **Frontend:** Deployed as a Vite project on **Vercel**.
    *   **Root Directory:** `frontend`
    *   **Environment Variables:** `VITE_API_BASE_URL` (pointing to the live Render backend URL).
