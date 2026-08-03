import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { ShoppingBag, User, LogOut, LayoutDashboard, UtensilsCrossed } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar-header glass-card">
      <Link to="/" className="brand-logo">
        🍔 HungryOrder
      </Link>
      
      <nav className="nav-menu">
        <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
          Home
        </Link>

        {user && user.role === 'customer' && (
          <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`}>
            My Profile
          </Link>
        )}

        {user && user.role === 'restaurant' && (
          <Link to="/restaurant-dashboard" className={`nav-link ${isActive('/restaurant-dashboard') ? 'active' : ''}`}>
            <LayoutDashboard size={18} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Dashboard
          </Link>
        )}

        {user && user.role === 'admin' && (
          <Link to="/admin-dashboard" className={`nav-link ${isActive('/admin-dashboard') ? 'active' : ''}`}>
            <UtensilsCrossed size={18} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Admin
          </Link>
        )}

        {(!user || user.role === 'customer') && (
          <Link to="/cart" className={`nav-link cart-icon-container ${isActive('/cart') ? 'active' : ''}`}>
            <ShoppingBag size={20} />
            {cartItems.length > 0 && (
              <span className="cart-badge">{cartItems.reduce((acc, i) => acc + i.quantity, 0)}</span>
            )}
          </Link>
        )}

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>
              Hi, {user.name.split(' ')[0]}
            </span>
            <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '8px 16px' }}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        ) : (
          <Link to="/auth" className="btn btn-primary" style={{ padding: '8px 20px', textDecoration: 'none' }}>
            <User size={16} />
            Login
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
