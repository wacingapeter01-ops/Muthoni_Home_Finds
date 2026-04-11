import { useState, useEffect } from 'react'
import { getMyOrders } from '../services/api'
import './OrdersPage.css'

const STATUS_BADGE = {
  processing: 'badge-gold',
  dispatched:  'badge-gray',
  delivered:   'badge-green',
}

export default function OrdersPage() {
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    getMyOrders()
      .then((res) => setOrders(res.data))
      .catch(() => setError('Could not load your orders. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page container">
      <h1 className="display-heading">My Orders</h1>
      <p style={{ color: 'var(--clr-text-secondary)', marginTop: 8 }}>
        Your complete purchase history
      </p>
      <hr className="divider" />

      {loading && <div className="loading-center"><div className="spinner" /></div>}
      {error   && <div className="alert alert-error">{error}</div>}

      {!loading && !error && orders.length === 0 && (
        <div className="orders-empty">
          <div className="orders-empty__icon">📦</div>
          <h2 className="display-heading">No orders yet</h2>
          <p>Once you place an order it will appear here.</p>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} id={`order-${order.id}`} className="order-card card">
              <div className="order-card__header">
                <div>
                  <span className="order-card__id">Order #{order.id}</span>
                  <p className="order-card__date">
                    {new Date(order.created_at).toLocaleDateString('en-KE', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </p>
                </div>
                <span className={`badge ${STATUS_BADGE[order.status] || 'badge-gray'}`}>
                  {order.status}
                </span>
              </div>

              {order.items && (
                <div className="order-card__items">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="order-item">
                      <span className="order-item__emoji">📦</span>
                      <span className="order-item__name">Product #{item.product_id}</span>
                      <span className="order-item__qty">× {item.quantity}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="order-card__footer">
                <span style={{ color: 'var(--clr-text-secondary)', fontSize: '0.88rem' }}>Total</span>
                <span className="order-card__total">
                  KES {Number(order.total_price ?? 0).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
