import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'
import WhatsAppIcon from './components/WhatsAppIcon'

import HomePage     from './pages/HomePage'
import LoginPage    from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CartPage     from './pages/CartPage'
import OrdersPage   from './pages/OrdersPage'

// Guard: redirect to login if not authenticated
function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function AppLayout() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"         element={<HomePage />} />
        <Route path="/shop"     element={<Navigate to="/" replace />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/cart"     element={<CartPage />} />
        <Route path="/orders"   element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
        <Route path="*"         element={<Navigate to="/" replace />} />
      </Routes>
      <WhatsAppIcon />
    </>
  )
}


export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppLayout />
      </CartProvider>
    </AuthProvider>
  )
}
