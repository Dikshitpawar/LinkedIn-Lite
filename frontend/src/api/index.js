import axios from 'axios'

// Single source of truth for the backend origin — SocketContext imports
// this instead of hardcoding its own port, so REST and WebSocket can
// never point at two different ports again.
export const API_ORIGIN = 'https://linkedin-lite-backend-uj8a.onrender.com'

const http = axios.create({
  baseURL: `${API_ORIGIN}/api`,
  withCredentials: true, // sends the httpOnly refreshToken cookie automatically
  timeout: 15000,
})

/**
 * No axios interceptor by design (per requirements).
 * The access token is short-lived (15m) and kept in memory only
 * (never localStorage) — AuthContext calls setAuthToken() right
 * after login / silent-refresh / logout so every subsequent request
 * automatically carries the right Authorization header.
 */
export function setAuthToken(token) {
  if (token) {
    http.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete http.defaults.headers.common['Authorization']
  }
}

/* ─── AUTH ─── */
export const authApi = {
  register: (name, email, password) =>
    http.post('/auth/register', { name, email, password }),

  login: (email, password) =>
    http.post('/auth/login', { email, password }),

  /** GET /api/auth/logout — requires auth header */
  logout: () =>
    http.get('/auth/logout'),

  /** GET /api/auth/me — returns { user } */
  getMe: () =>
    http.get('/auth/me'),

  /** POST /api/auth/refresh — uses httpOnly cookie, returns { accessToken: { token, expiresAt } } */
  refresh: () =>
    http.post('/auth/refresh'),
}

/* ─── PROFILE ─── */
export const profileApi = {
  /** GET /api/profile — returns { currentUser } */
  getMe: () =>
    http.get('/profile'),

  /** POST /api/profile/update — multipart: name, bio, skills, education, experience, file */
  updateMe: (formData) =>
    http.post('/profile/update', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  /** GET /api/profile/:id — returns { user } */
  getUser: (id) =>
    http.get(`/profile/${id}`),
}

/* ─── POSTS ─── */
export const postApi = {
  /** GET /api/post — returns { posts[] } sorted newest first */
  getAll: () =>
    http.get('/post'),

  /** GET /api/post/:id — returns { data: post } */
  getById: (id) =>
    http.get(`/post/${id}`),

  /** POST /api/post/create — multipart: title, content, file? (image optional) */
  create: (formData) =>
    http.post('/post/create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  /** PUT /api/post/update/:id — multipart: title?, content?, file? */
  update: (id, formData) =>
    http.put(`/post/update/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  /** DELETE /api/post/delete/:id */
  delete: (id) =>
    http.delete(`/post/delete/${id}`),

  /** POST /api/post/like/:id — toggles like, returns { post } where post.liked/likesCount */
  like: (id) =>
    http.post(`/post/like/${id}`),

  /** POST /api/post/comment/:id — body: { text }, returns { data: post } */
  comment: (id, text) =>
    http.post(`/post/comment/${id}`, { text }),
}

/* ─── CONNECTIONS ─── */
/* NOTE: all connection mutations are GET routes on the backend (not REST-ideal, but that's the contract) */
export const connectionApi = {
  /** GET /api/connection/suggestions?page=&limit= */
  getSuggestions: (page = 1, limit = 10) =>
    http.get('/connection/suggestions', { params: { page, limit } }),

  /** GET /api/connection?page=&limit=&status= — returns { data } (mongoose-paginate shape: {docs, totalDocs, ...}) */
  getConnections: (page = 1, limit = 10, status = 'accept') =>
    http.get('/connection', { params: { page, limit, status } }),

  /** GET /api/connection/send/:id */
  sendRequest: (id) =>
    http.get(`/connection/send/${id}`),

  /** GET /api/connection/accept/:id */
  acceptRequest: (id) =>
    http.get(`/connection/accept/${id}`),

  /** GET /api/connection/reject/:id */
  rejectRequest: (id) =>
    http.get(`/connection/reject/${id}`),

  /** GET /api/connection/remove/:id */
  removeConnection: (id) =>
    http.get(`/connection/remove/${id}`),
}

export default http
