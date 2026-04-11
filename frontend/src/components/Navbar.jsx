import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import './Navbar.css'

const categories = [
  "Electronics",
  "Kitchenware",
  "Furniture",
  "Beddings",
  "Curtains & Carpets"
]

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth()
  const { totalItems } = useCart()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <header className="navbar">
      {/* Top Banner with Socials */}
      <div className="navbar__topbar">
        <div className="container navbar__topbar-inner">
          <span className="navbar__top-text">Your one-stop shop for all household essentials.</span>
            <a href="tel:+254746650320" className="navbar__call-btn" title="Call Us">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              <span>Call: 0746 650 320</span>
            </a>
          </div>
      </div>

      {/* Main Nav */}
      <div className="container navbar__inner">
        <div className="navbar__left">
          <button 
            className={`navbar__menu-toggle ${isMenuOpen ? 'active' : ''}`} 
            onClick={toggleMenu}
            aria-label="Toggle Categories Menu"
          >
            <div className="hamburger">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span className="menu-text">Categories</span>
          </button>

          <Link to="/" className="navbar__brand">
            <span className="navbar__brand-name">MUTHONI</span>
            <span className="navbar__brand-sub">HOME FINDS</span>
          </Link>
        </div>

        {/* Categories Sidebar/Overlay */}
        <div className={`navbar__sidebar ${isMenuOpen ? 'open' : ''}`}>
          <div className="navbar__sidebar-header">
            <h3>Categories</h3>
            <button className="close-btn" onClick={() => setIsMenuOpen(false)}>&times;</button>
          </div>
          <ul className="navbar__sidebar-links">
            {categories.map((cat) => (
              <li key={cat}>
                <Link to={`/?category=${cat.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`} onClick={() => setIsMenuOpen(false)}>
                  {cat}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {isMenuOpen && <div className="navbar__overlay" onClick={() => setIsMenuOpen(false)}></div>}

        {/* Action Links */}
        <div className="navbar__actions">
          {isAuthenticated && (
            <NavLink to="/orders" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>My Orders</NavLink>
          )}
          
          {isAuthenticated ? (
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
          ) : (
            <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
          )}

          <Link to="/cart" id="nav-cart-btn" className="navbar__cart-btn" title="View Cart">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {totalItems > 0 && <span className="navbar__cart-badge">{totalItems}</span>}
          </Link>
        </div>
      </div>
    </header>
  )
}
