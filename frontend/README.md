# Pulse — Professional Social Network (Frontend)

A modern, production-ready React + Vite frontend for the **Pulse** social networking platform.
Built with plain CSS (no frameworks), React Router, Axios, and a fully custom design system.

---

## ✨ Features

- **Authentication** — Register / Login with JWT cookie-based sessions
- **Feed** — Create posts (with image upload), like, comment, edit, delete
- **Profile** — View & edit your profile (bio, skills, experience, education, avatar)
- **Connections** — View connections, accept/decline/cancel requests
- **Discover (Suggestions)** — Find and connect with new people
- **Post Details** — Dedicated page for a single post with full comments
- Fully responsive (mobile, tablet, desktop)
- Skeleton loaders, empty states, toasts, smooth animations
- Protected routes via Auth Context

---

## 🚀 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure the backend URL
This frontend expects the backend (from your provided ZIP) to run at:
```
http://localhost:3000/api
```
This is configured in `src/api/index.js`. Change the `baseURL` there if your backend runs elsewhere.

### 3. Run the backend
In a separate terminal, navigate to your backend project folder and run:
```bash
npm install
npm start
```
Make sure the backend's CORS config allows `http://localhost:5173` with `credentials: true`
(this is already set up in the provided backend's `app.js`).

### 4. Run the frontend
```bash
npm run dev
```
Visit **http://localhost:5173**

---

## 📁 Project Structure

```
src/
├── api/                  # Centralized Axios API calls
│   └── index.js
├── components/
│   ├── ui/               # Reusable primitives (Button, Input, Avatar, Modal, Skeleton, EmptyState)
│   ├── layout/            # Navbar, AppLayout (sidebar + content + right panel)
│   ├── feed/               # CreatePost, PostCard
│   ├── network/           # PersonCard
│   ├── ProtectedRoute.jsx
│   └── PublicRoute.jsx
├── context/
│   ├── AuthContext.jsx    # Auth state, login/register/logout
│   └── ToastContext.jsx   # Global toast notifications
├── pages/
│   ├── AuthPage.jsx        # Login & Register (shared)
│   ├── FeedPage.jsx
│   ├── ProfilePage.jsx     # /profile/me and /profile/:id
│   ├── ConnectionsPage.jsx
│   ├── SuggestionsPage.jsx
│   ├── PostDetailsPage.jsx
│   └── NotFoundPage.jsx
├── styles/
│   ├── tokens.css         # Design tokens (colors, spacing, typography)
│   ├── reset.css
│   └── animations.css
├── utils/
│   └── helpers.js
├── App.jsx
└── main.jsx
```

---

## 🔌 Backend API Reference

| Feature | Method | Endpoint |
|---|---|---|
| Register | POST | `/api/auth/register` |
| Login | POST | `/api/auth/login` |
| Logout | POST | `/api/auth/logout` |
| Get my profile | GET | `/api/profile/me` |
| Update my profile | POST | `/api/profile/update` (multipart) |
| Get user profile | GET | `/api/profile/user/:id` |
| Get all posts | GET | `/api/post/get` |
| Get post by id | GET | `/api/post/get/:id` |
| Create post | POST | `/api/post/create` (multipart, image required) |
| Update post | PUT | `/api/post/update/:id` (multipart) |
| Delete post | DELETE | `/api/post/delete/:id` |
| Like/unlike post | POST | `/api/post/like/:id` |
| Comment on post | POST | `/api/post/comment/:id` |
| Send connection request | POST | `/api/connection/send-request/:id` |
| Accept request | POST | `/api/connection/accept-request/:id` |
| Reject request | POST | `/api/connection/reject-request/:id` |
| Remove connection | POST | `/api/connection/remove-connection/:id` |
| Get all connections | GET | `/api/connection/get-all` |
| Get suggestions | GET | `/api/connection/suggestions` |

---

## 🎨 Design System

All design tokens live in `src/styles/tokens.css` — colors, spacing, typography,
radii, shadows, and transitions are defined as CSS variables for easy theming.

Brand color: `#5c6ef8` (indigo/violet) with mint (`#00e5c3`) and rose (`#ff5f7e`) accents
on a deep dark surface palette.

---

## 🛠 Tech Stack

- React 18
- React Router 6
- Axios
- Vite
- Plain CSS (CSS Custom Properties / design tokens)
