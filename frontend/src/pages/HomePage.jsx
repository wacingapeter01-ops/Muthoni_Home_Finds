import { useState, useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getProducts } from '../services/api'
import ProductCard from '../components/ProductCard'
import { findClosestMatch, personalizedShuffle, boostAffinity } from '../utils/fuzzySearch'
import './HomePage.css'

export default function HomePage() {
  const [products, setProducts]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [search, setSearch]       = useState('')
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryParam = searchParams.get('category')
  const inputRef = useRef(null)

  // Fetch products once
  useEffect(() => {
    getProducts()
      .then(res => setProducts(res.data))
      .catch(() => setError('Could not load products. Please check if the backend is running.'))
      .finally(() => setLoading(false))
  }, [])

  // Personalised shuffle — re-runs each fresh page load, giving different visitors a different order
  const shuffledProducts = useMemo(() => personalizedShuffle(products), [products])

  // Filter by search text + active category
  const filtered = useMemo(() => {
    return shuffledProducts.filter(p => {
      const matchesSearch =
        !search ||
        (p.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(search.toLowerCase())

      const matchesCategory =
        !categoryParam ||
        (p.category || '').toLowerCase().replace(/ & /g, '-').replace(/ /g, '-') === categoryParam

      return matchesSearch && matchesCategory
    })
  }, [shuffledProducts, search, categoryParam])

  // Boost category affinity when user clicks into a category
  useEffect(() => {
    if (categoryParam) boostAffinity(categoryParam)
  }, [categoryParam])

  // Also boost when user searches (after a small delay so it's intentional)
  useEffect(() => {
    if (!search || search.length < 3) return
    const timer = setTimeout(() => {
      // Find which category most results belong to and boost it
      const catCount = {}
      filtered.forEach(p => {
        if (p.category) {
          const key = p.category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')
          catCount[key] = (catCount[key] || 0) + 1
        }
      })
      const topCat = Object.keys(catCount).sort((a, b) => catCount[b] - catCount[a])[0]
      if (topCat) boostAffinity(topCat)
    }, 1200)
    return () => clearTimeout(timer)
  }, [search, filtered])

  // Fuzzy suggestion — only when we have a search but zero results
  const suggestion = useMemo(() => {
    if (!search || filtered.length > 0) return null
    return findClosestMatch(search, products)
  }, [search, filtered.length, products])

  const clearCategory = () => setSearchParams({})

  return (
    <div className="homepage">

      {/* ── Slim tagline banner ── */}
      <div className="shop-banner">
        <div className="container shop-banner__inner">
          <div className="shop-banner__text">
            <h1 className="shop-banner__title">Muthoni Home Finds</h1>
            <p className="shop-banner__sub">Your endless home & lifestyle shop — everything from a TV to a teaspoon.</p>
          </div>

          {/* Search bar right in the banner */}
          <div className="search-bar">
            <input
              ref={inputRef}
              id="home-search-input"
              type="search"
              className="search-bar__input"
              placeholder="Search — blender, curtain, sofa…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoComplete="off"
            />
            <button className="search-bar__btn" aria-label="Search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Fuzzy spelling suggestion */}
        {suggestion && (
          <div className="container">
            <div className="search-suggestion">
              <span>🔍 Did you mean </span>
              <button
                className="search-suggestion__link"
                onClick={() => { setSearch(suggestion); inputRef.current?.focus() }}
              >
                &ldquo;{suggestion}&rdquo;
              </button>
              <span>?</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Product Feed ── */}
      <main className="container collection">

        {/* Active category pill */}
        {categoryParam && (
          <div className="active-filter">
            <span className="active-filter__label">
              Browsing: <strong>{categoryParam.replace(/-/g, ' & ').replace(/\b\w/g, c => c.toUpperCase())}</strong>
            </span>
            <button className="active-filter__clear" onClick={clearCategory} aria-label="Clear filter">
              &times; Show All
            </button>
          </div>
        )}

        {/* Product count badge */}
        {!loading && !error && filtered.length > 0 && (
          <p className="collection__count">{filtered.length} item{filtered.length !== 1 ? 's' : ''}</p>
        )}

        {loading && (
          <div className="loading-center">
            <div className="spinner" />
            <p className="loading-text">Loading your shop…</p>
          </div>
        )}

        {error && (
          <div className="alert alert-error">{error}</div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="collection__empty">
            <div className="empty-icon">{search ? '😕' : '📦'}</div>
            <p>
              {search
                ? <>No products found for <strong>&ldquo;{search}&rdquo;</strong>.</>
                : 'Products are being added. Check back soon!'}
            </p>
            {(search || categoryParam) && (
              <button className="btn btn-outline btn-sm" onClick={() => { setSearch(''); clearCategory() }}>
                View all products
              </button>
            )}
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="product-grid">
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </main>
    </div>
  )
}
