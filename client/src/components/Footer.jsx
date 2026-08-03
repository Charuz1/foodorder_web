import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="footer-content">
        <Link to="/" className="footer-logo">
          🍔 HungryOrder
        </Link>
        <div className="footer-links">
          <Link to="/" className="footer-link">Browse Foods</Link>
          <Link to="/profile" className="footer-link">My Account</Link>
          <Link to="/cart" className="footer-link">Cart</Link>
        </div>
      </div>
      <div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} HungryOrder Inc. Fast. Fresh. Delivered.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
