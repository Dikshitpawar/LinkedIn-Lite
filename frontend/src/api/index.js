import axios from 'axios'
export const API_ORIGIN = 'https://linkedin-lite-backend-uj8a.onrender.com'


const http = axios.create({
  baseURL: `${API_ORIGIN}/api`,
  withCredentials: true, 
  timeout: 15000,
})
export function setAuthToken(token) {
  if (token) {
    http.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete http.defaults.headers.common['Authorization']
  }
}

export const authApi = {
  register: (name, email, password) =>
    http.post('/auth/register', { name, email, password }),

  login: (email, password) =>
    http.post('/auth/login', { email, password }),

  logout: () =>
    http.get('/auth/logout'),

  getMe: () =>
    http.get('/auth/me'),

  refresh: () =>
    http.post('/auth/refresh'),
}

export const profileApi = {
  getMe: () =>
    http.get('/profile'),

  updateMe: (formData) =>
    http.post('/profile/update', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getUser: (id) =>
    http.get(`/profile/${id}`),
}

export const postApi = {
  getAll: () =>
    http.get('/post'),

  getById: (id) =>
    http.get(`/post/${id}`),

  create: (formData) =>
    http.post('/post/create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (id, formData) =>
    http.put(`/post/update/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  delete: (id) =>
    http.delete(`/post/delete/${id}`),

  like: (id) =>
    http.post(`/post/like/${id}`),

  comment: (id, text) =>
    http.post(`/post/comment/${id}`, { text }),
}

export const connectionApi = {
  getSuggestions: (page = 1, limit = 10) =>
    http.get('/connection/suggestions', { params: { page, limit } }),

  getConnections: (page = 1, limit = 10, status = 'accept') =>
    http.get('/connection', { params: { page, limit, status } }),

  sendRequest: (id) =>
    http.get(`/connection/send/${id}`),

  acceptRequest: (id) =>
    http.get(`/connection/accept/${id}`),

  rejectRequest: (id) =>
    http.get(`/connection/reject/${id}`),

  removeConnection: (id) =>
    http.get(`/connection/remove/${id}`),
}

export default http
