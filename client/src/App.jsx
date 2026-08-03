import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import RestaurantDetail from './pages/RestaurantDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import RestaurantDashboard from './pages/RestaurantDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const AppContent = () => {
  const { notification, user } = useContext(AuthContext);

  // Role protected routing helpers
  const CustomerRoute = ({ children }) => {
    return user ? children : <Navigate to="/auth" />;
  };

  const RestaurantRoute = ({ children }) => {
    return user && user.role === 'restaurant' ? children : <Navigate to="/" />;
  };

  const AdminRoute = ({ children }) => {
    return user && user.role === 'admin' ? children : <Navigate to="/" />;
  };

  return (
    <Router>
      <div className="app-container">
        <Navbar />
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/restaurant/:id" element={<RestaurantDetail />} />
            <Route path="/cart" element={<Cart />} />
            
            {/* Protected Routes */}
            <Route path="/checkout" element={
              <CustomerRoute>
                <Checkout />
              </CustomerRoute>
            } />
            <Route path="/profile" element={
              <CustomerRoute>
                <Profile />
              </CustomerRoute>
            } />
            <Route path="/restaurant-dashboard" element={
              <RestaurantRoute>
                <RestaurantDashboard />
              </RestaurantRoute>
            } />
            <Route path="/admin-dashboard" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />

            <Route path="/auth" element={<Auth />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        <Footer />

        {/* Global Floating Toast Notifications */}
        {notification && (
          <div className={`toast-notification ${notification.type === 'error' ? 'toast-error' : 'toast-success'}`}>
            {notification.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <span>{notification.message}</span>
          </div>
        )}
      </div>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
