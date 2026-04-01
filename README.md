# CraftMyFolio

🚀 **CraftMyFolio** is a full-stack, dynamic web application that enables developers and creators to easily build, customize, and host their own stunning, responsive portfolios.

With built-in secure authentication, performance-optimized data caching, and user-friendly dashboards, users can define their custom portfolio slug and showcase their projects, skills, and resume with just a few clicks.

---

## 🌟 Key Features

- **Custom Public Portfolios**: Generate a unique public link (`/folio/:slug`) to present your work.
- **Dynamic Content Management**: An intuitive dashboard to add, edit, or delete portfolio details, including projects, experience, and custom links.
- **Media Uploads**: Seamlessly upload and manage avatar images utilizing Cloudinary integrations.
- **Secure Authentication**: Robust JWT-based authentication system with secure payload encryption (Bcrypt).
- **Slug Availability Checking**: Real-time validation for choosing your personalized URL.
- **High Performance**: Optimized data fetching and caching capabilities powered by TanStack React Query on the frontend and Redis on the backend.
- **Responsive & Modern UI**: A rich setup consisting of Tailwind CSS v4, Lucide React, and modern micro-animations.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4
- **Routing**: React Router DOM v7
- **State Management / Data Fetching**: TanStack React Query v5
- **Icons**: Lucide React & Simple Icons
- **Linting & Formatting**: ESLint, Prettier

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Caching**: Redis
- **Authentication**: JSON Web Tokens (JWT) & Bcrypt (Password Hashing)
- **File Management**: Multer & Cloudinary (Image handling)

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
Make sure you have the following installed on your machine:
- **Node.js** (v18+)
- **MongoDB** (Local or Atlas URI)
- **Redis Server** (Local or Hosted)
- **Cloudinary Account** (for handling image uploads)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   cd CraftMyFolio
   ```

2. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

### Environment Variables

You need to add `.env` files in both the `backend` and `frontend` directories.

**Backend (`backend/.env`)**
Create a `.env` file in the `backend/` directory referencing `.env.example`:
```env
PORT=4040
MongoDB_URI=<Your_MongoDB_Connection_String>
JWT_SECRET=<Your_Secret_Key>
CORS_ORIGIN=http://localhost:5173
CLOUD_NAME=<Your_Cloudinary_Cloud_Name>
CLOUD_API_KEY=<Your_Cloudinary_API_Key>
CLOUD_API_SECRET=<Your_Cloudinary_API_Secret>
REDIS_URL=<Your_Redis_Connection_String>
```

**Frontend (`frontend/.env`)**
```env
VITE_API_URL=http://localhost:4040
```

### Running the App Locally

**Start the Backend (Development Mode):**
```bash
cd backend
npm run dev
# Server will start running at http://localhost:4040
```

**Start the Frontend (Development Mode):**
```bash
cd frontend
npm run dev
# Client will be available at http://localhost:5173
```

---

## 📁 Project Architecture

### `frontend/src/`
- `components/` - Reusable UI components.
- `pages/` - Core pages (e.g., Home, Dashboard, Auth pages).
- `context/` - React Context providers (e.g., AuthContext).
- `hooks/` - Custom React hooks.
- `folioTemplate/` - Template components for generating the public portfolios.

### `backend/src/`
- `controllers/` - Route logic and request handling.
- `models/` - Mongoose database schemas (User, Folio).
- `routes/` - Express route definitions (Auth, Folio).
- `middlewares/` - Auth verification and Multer upload configurations.
- `utils/` - Global helper functions.
- `config/` - Database connection and related configurations.

---

## 🌐 API Reference

### Authentication Routes (`/api/auth`)
- `POST /signup` - Register a new user (accepts multipart/form-data for avatars)
- `POST /signin` - Authenticate an existing user
- `GET /me` - Retrieve current logged-in user details
- `PATCH /me` - Update user details
- `PATCH /me/avatar` - Update user avatar

### Portfolio / Folio Routes (`/api/folio`)
- `POST /` - Create a new portfolio (Protected)
- `GET /me` - Fetch own portfolio details (Protected)
- `PATCH /me` - Update personal portfolio details (Protected)
- `DELETE /me` - Remove personal portfolio (Protected)
- `GET /check-slug/:slug` - Verify if a custom slug is available for use (Public)
- `GET /:slug` - Retrieve user's actual portfolio data by its slug (Public)

---

> **Note:** This project is set up using ES Modules (`"type": "module"`) on the backend.
