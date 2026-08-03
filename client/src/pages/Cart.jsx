import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { Trash2, ShoppingCart, Plus, Minus, ArrowRight } from 'lucide-react';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, subtotal, deliveryFee, tax, total } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleCheckoutRedirect = () => {
    if (!user) {
      navigate('/auth?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="glass-card" style={{ padding: 48, textAlign: 'center', maxWidth: 600, margin: '40px auto' }}>
        <ShoppingCart size={48} color="var(--text-secondary)" style={{ marginBottom: 16 }} />
        <h2 style={{ marginBottom: 8 }}>Your Cart is Empty</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Browse restaurants and add some mouth-watering food to your cart!</p>
        <Link to="/" className="btn btn-primary">
          Go To Restaurants
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32, alignItems: 'start' }}>
      {/* Items list */}
      <div className="glass-card" style={{ padding: 28 }}>
        <h2 style={{ marginBottom: 24, fontSize: 22, fontWeight: 700 }}>Your Selected Items</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {cartItems.map(item => (
            <div 
              key={item.foodId} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 16, 
                paddingBottom: 20, 
                borderBottom: '1px solid var(--border-color)' 
              }}
            >
              <img 
                src={item.image} 
                alt={item.title} 
                style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 12 }} 
              />
              
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{item.title}</h4>
                <p style={{ color: 'var(--accent-color)', fontWeight: 700, fontSize: 15 }}>
                  Rs. {item.price.toFixed(2)}
                </p>
              </div>

              {/* Quantity Changer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid var(--border-color)', borderRadius: 8, padding: 3 }}>
                <button 
                  onClick={() => updateQuantity(item.foodId, item.quantity - 1)}
                  style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', padding: 4 }}
                >
                  <Minus size={14} />
                </button>
                <span style={{ fontSize: 14, fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.foodId, item.quantity + 1)}
                  style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', padding: 4 }}
                >
                  <Plus size={14} />
                </button>
              </div>

              <div style={{ minWidth: 70, textAlign: 'right', fontWeight: 700 }}>
                Rs. {(item.price * item.quantity).toFixed(2)}
              </div>

              <button 
                onClick={() => removeFromCart(item.foodId)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 6 }}
                className="btn-danger"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Summary card */}
      <div className="glass-card" style={{ padding: 28 }}>
        <h3 style={{ marginBottom: 20, fontSize: 18 }}>Order Summary</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span>Subtotal</span>
            <span>Rs. {subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span>Delivery Fee</span>
            <span>Rs. {deliveryFee.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span>Tax (8%)</span>
            <span>Rs. {tax.toFixed(2)}</span>
          </div>
          <hr style={{ borderColor: 'var(--border-color)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 18 }}>
            <span>Total Price</span>
            <span style={{ color: 'var(--accent-color)' }}>Rs. {total.toFixed(2)}</span>
          </div>
        </div>

        <button onClick={handleCheckoutRedirect} className="btn btn-primary" style={{ width: '100%', gap: 6 }}>
          Proceed to Checkout
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Cart;
