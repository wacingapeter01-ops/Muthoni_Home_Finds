import { useState, useEffect } from 'react'
import { getProducts } from '../services/api'
import ProductCard from '../components/ProductCard'
import './ShopPage.css'

export default function ShopPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [search, setSearch]     = useState('')

  useEffect(() => {
    getProducts()
      .then((res) => setProducts(res.data))
      .catch(() => setError('Failed to load products. Make sure the backend is running.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page container">
      {/* Header */}
      <div className="shop-header">
        <div>
          <h1 className="display-heading">The Collection</h1>
          <p className="shop-header__sub">
            {products.length} products · Authentic furniture & home décor
          </p>
        </div>
        <input
          id="shop-search-input"
          type="search"
          className="form-input shop-header__search"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <hr className="divider" />

      {/* States */}
      {loading && (
        <div className="loading-center"><div className="spinner" /></div>
      )}
      {error && (
        <div className="alert alert-error">{error}</div>
      )}
      {!loading && !error && filtered.length === 0 && (
        <div className="shop-empty">
          <p>🔍 No products found{search ? ` for "${search}"` : ''}.</p>
          {search && (
            <button className="btn btn-ghost btn-sm" onClick={() => setSearch('')}>Clear search</button>
          )}
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="product-grid">
          {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
