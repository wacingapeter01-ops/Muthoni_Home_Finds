import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { checkout, triggerMpesaPayment } from '../services/api'
import { useState } from 'react'
import './CartPage.css'

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [success, setSuccess] = useState(null)

  const [location, setLocation] = useState('')
  const [phone, setPhone]       = useState('')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [pendingOrderId, setPendingOrderId] = useState(null)

  // Step 2: Trigger M-Pesa STK Push
  const handleMpesaPayment = async (orderId) => {
    if (!phone.match(/^(07|01|254)\d{8}$/)) {
      alert('Please enter a valid Safaricom number (e.g. 0712345678).')
      return
    }
    
    setLoading(true); setError(null)
    try {
      console.log(`Triggering M-Pesa for Order ${orderId} to ${phone}`)
      const res = await triggerMpesaPayment(orderId, phone)
      console.log("M-Pesa API Response:", res.data)
      
      setSuccess(`M-Pesa Prompt Sent! 🚀 Check your phone now. Once paid, we will process your order for ${location}.`)
      setShowPaymentModal(false)
      clearCart()
      
      // Notify admin via WhatsApp
      const waMessage = `New Order %23${orderId}!%0A` +
        `Customer Phone: ${phone}%0A` +
        `Deliver to: ${location}%0A` +
        `Total: KES ${totalPrice}`;
      window.open(`https://wa.me/254746650320?text=${waMessage}`, '_blank')
    } catch (err) {
      console.error("M-Pesa Error:", err.response?.data || err.message)
      const detail = err.response?.data?.detail || "Could not trigger M-Pesa. Use Option 2 below."
      alert(`M-Pesa Error: ${detail}`)
    } finally {
      setLoading(false)
    }
  }

  // Step 1: Create Order Simple
  const handleInitialCheckout = async () => {
    if (!isAuthenticated) { navigate('/login'); return }
    if (!location.trim()) { setError('Please enter your delivery address/pickup point.'); return }
    
    setLoading(true); setError(null)
    try {
      const orderPayload = {
        items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
        delivery_address: location
      }
      const orderRes = await checkout(orderPayload)
      setPendingOrderId(orderRes.data.id)
      setShowPaymentModal(true)
    } catch (err) {
      setError('Could not create order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0 && !success) {
    return (
      <div className="page container">
        <div className="cart-empty">
          <div className="cart-empty__icon">🛒</div>
          <h2 className="display-heading">Your cart is empty</h2>
          <p>Add some items to get started.</p>
          <Link to="/" className="btn btn-primary">Browse the Shop</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page container">
      <h1 className="display-heading">Checkout</h1>
      <hr className="divider" />

      {success && <div className="alert alert-success" style={{ marginBottom: 24 }}>{success} <Link to="/orders">View Orders →</Link></div>}
      {error   && <div className="alert alert-error"   style={{ marginBottom: 24 }}>{error}</div>}

      {items.length > 0 && (
        <div className="cart-layout">
          <div className="cart-items">
            <h2 className="section-title">Your Items</h2>
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="cart-item card">
                <div className="cart-item__img">📦</div>
                <div className="cart-item__info">
                  <h3>{product.title}</h3>
                  <span className="cart-item__price">KES {Number(product.price).toLocaleString()}</span>
                </div>
                <div className="cart-item__qty">
                  <button className="qty-btn" onClick={() => updateQuantity(product.id, quantity - 1)}>−</button>
                  <span>{quantity}</span>
                  <button className="qty-btn" onClick={() => updateQuantity(product.id, quantity + 1)}>+</button>
                </div>
                <span className="cart-item__subtotal">KES {(product.price * quantity).toLocaleString()}</span>
                <button className="btn btn-ghost btn-sm cart-item__remove" onClick={() => removeFromCart(product.id)}>✕</button>
              </div>
            ))}
          </div>

          <div className="cart-summary card">
            <h2 className="display-heading">Order Summary</h2>
            <hr className="divider" />
            
            <div className="cart-input-group">
              <label className="form-label">Delivery Address / Pickup Point</label>
              <textarea 
                className="form-input" 
                rows="3"
                placeholder="e.g. Westlands, Nairobi or Eldoret Town, G4S Office" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="cart-summary__row cart-summary__total" style={{ marginTop: 20 }}>
              <span>Total Amount</span>
              <span>KES {totalPrice.toLocaleString()}</span>
            </div>

            <button
              id="checkout-btn"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: 20 }}
              onClick={handleInitialCheckout}
              disabled={loading}
            >
              {loading ? 'Processing…' : 'Proceed to Payment'}
            </button>
          </div>
        </div>
      )}

      {/* Simplified Payment Modal */}
      {showPaymentModal && (
        <div className="payment-modal-overlay">
          <div className="payment-modal card">
            <button className="modal-close" onClick={() => setShowPaymentModal(false)}>✕</button>
            <h2 className="display-heading">Complete Payment</h2>
            
            <div className="payment-options">
              <div className="payment-option-box">
                <h3>Option 1: Lipa na M-Pesa Prompt</h3>
                <p>Enter your Safaricom number for an automatic PIN prompt.</p>
                <div className="cart-input-group">
                  <input 
                    type="tel" 
                    className="form-input" 
                    placeholder="07xxxxxxxx" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)} 
                  />
                  <button 
                    className="btn btn-primary btn-sm" 
                    onClick={() => handleMpesaPayment(pendingOrderId)}
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Send M-Pesa Prompt'}
                  </button>
                </div>
              </div>

              <div className="divider-text"><span>OR</span></div>

              <div className="payment-option-box">
                <h3>Option 2: Pochi la Biashara</h3>
                <div className="instructions">
                  <p>1. Go to Lipa na M-Pesa</p>
                  <p>2. Select <strong>Pochi la Biashara</strong></p>
                  <p>3. Use Number: <strong>0746 650 320</strong></p>
                  <p>4. Amount: <strong>KES {totalPrice.toLocaleString()}</strong></p>
                </div>
                <div className="screenshot-note">
                  Once paid, share screenshot to <strong>0746 650 320</strong>.
                </div>
                <a 
                  href={`https://wa.me/254746650320?text=Hello! I paid via Pochi for Order %23${pendingOrderId}. Delivery to: ${location}.`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-sm"
                  style={{ width: '100%', marginTop: 12 }}
                >
                  Confirm on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
