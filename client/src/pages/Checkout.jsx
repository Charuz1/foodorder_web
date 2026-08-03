import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { CreditCard, Wallet, MapPin, ShieldCheck } from 'lucide-react';

const Checkout = () => {
  const { cartItems, total, clearCart } = useContext(CartContext);
  const { user, showNotification } = useContext(AuthContext);
  const navigate = useNavigate();

  const [address, setAddress] = useState(user?.address || '');
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!address.trim()) {
      showNotification('Please enter a delivery address', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          items: cartItems.map(item => ({ foodId: item.foodId, quantity: item.quantity })),
          address,
          paymentMethod,
          totalPrice: total
        })
      });

      if (response.ok) {
        const data = await response.json();
        clearCart();
        showNotification('Order placed successfully!');
        navigate('/profile');
      } else {
        const errData = await response.json();
        showNotification(errData.message || 'Order failed', 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('Error connecting to server', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32 }}>
      {/* Checkout details Form */}
      <div className="glass-card" style={{ padding: 28 }}>
        <h2 style={{ marginBottom: 24, fontSize: 22, fontWeight: 700 }}>Checkout Details</h2>
        
        <form onSubmit={handlePlaceOrder}>
          {/* Delivery Address */}
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <MapPin size={18} color="var(--accent-color)" /> Delivery Address
            </h3>
            <textarea
              className="form-control"
              rows={3}
              required
              placeholder="Enter full address details (house number, street name, landmarks...)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          {/* Payment Method */}
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <ShieldCheck size={18} color="var(--accent-color)" /> Payment Method
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Card option */}
              <div 
                className={`glass-card ${paymentMethod === 'Card' ? 'active' : ''}`}
                style={{ 
                  padding: 20, 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 12,
                  border: paymentMethod === 'Card' ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                  background: paymentMethod === 'Card' ? 'rgba(255, 87, 34, 0.05)' : 'var(--bg-card)'
                }}
                onClick={() => setPaymentMethod('Card')}
              >
                <CreditCard size={20} color={paymentMethod === 'Card' ? 'var(--accent-color)' : 'var(--text-secondary)'} />
                <div>
                  <span style={{ fontWeight: 600, display: 'block', fontSize: 14 }}>Online Payment</span>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Credit/Debit Card</span>
                </div>
              </div>

              {/* COD option */}
              <div 
                className={`glass-card ${paymentMethod === 'COD' ? 'active' : ''}`}
                style={{ 
                  padding: 20, 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 12,
                  border: paymentMethod === 'COD' ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                  background: paymentMethod === 'COD' ? 'rgba(255, 87, 34, 0.05)' : 'var(--bg-card)'
                }}
                onClick={() => setPaymentMethod('COD')}
              >
                <Wallet size={20} color={paymentMethod === 'COD' ? 'var(--accent-color)' : 'var(--text-secondary)'} />
                <div>
                  <span style={{ fontWeight: 600, display: 'block', fontSize: 14 }}>Cash on Delivery</span>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Pay at your doorstep</span>
                </div>
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '14px' }}>
            {loading ? 'Processing...' : `Place Order • Rs. ${total.toFixed(2)}`}
          </button>
        </form>
      </div>

      {/* Cart Summary Panel */}
      <div className="glass-card" style={{ padding: 28, height: 'fit-content' }}>
        <h3 style={{ marginBottom: 20, fontSize: 18 }}>Order Summary</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {cartItems.map(item => (
            <div key={item.foodId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: 'var(--text-secondary)' }}>{item.title} (x{item.quantity})</span>
              <span style={{ fontWeight: 600 }}>Rs. {(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <hr style={{ borderColor: 'var(--border-color)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 16 }}>
            <span>Total to pay</span>
            <span style={{ color: 'var(--accent-color)' }}>Rs. {total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
