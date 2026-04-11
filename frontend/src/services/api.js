import axios from 'axios'

const api = axios.create({
  baseURL: '/',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mhf_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// If 401 is returned, clear token and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('mhf_token')
      localStorage.removeItem('mhf_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

/* ─── Auth ─────────────────────────────────────── */
export const register = (email, password) =>
  api.post('/registration', { email, password })

export const login = (email, password) => {
  const form = new URLSearchParams()
  form.append('username', email)   // FastAPI OAuth2 expects 'username'
  form.append('password', password)
  return axios.post('/login', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}

/* ─── Catalog ───────────────────────────────────── */
export const getCategories = () => api.get('/api/v1/catalog/categories')
export const getProducts   = (skip = 0, limit = 100) =>
  api.get(`/api/v1/catalog/products?skip=${skip}&limit=${limit}`)

export const createCategory = (data) => api.post('/api/v1/catalog/categories', data)
export const createProduct  = (data) => api.post('/api/v1/catalog/products', data)

/* ─── Orders ────────────────────────────────────── */
export const checkout      = (orderData) => api.post('/api/v1/orders/checkout', orderData)
export const getMyOrders   = ()           => api.get('/api/v1/orders/history')
export const updateOrderStatus = (orderId, status) =>
  api.patch(`/api/v1/orders/${orderId}/status`, { status })

export const triggerMpesaPayment = (orderId, phoneNumber) =>
  api.post(`/api/v1/payment/stkpush/${orderId}?phone_number=${phoneNumber}`)

export default api
