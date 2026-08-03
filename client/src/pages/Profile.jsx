import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import OrderTracker from '../components/OrderTracker';
import { User, MapPin, Phone, Mail, ShoppingBag, Eye, Calendar } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile, showNotification } = useContext(AuthContext);

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [loading, setLoading] = useState(false);

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  const fetchOrderHistory = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await updateProfile(name, phone, address);
    setLoading(false);
  };

  const handleViewOrder = async (orderId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedOrder(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 32, alignItems: 'start' }}>
      {/* Profile Details Card */}
      <div className="glass-card" style={{ padding: 28 }}>
        <h2 style={{ marginBottom: 24, fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <User size={20} color="var(--accent-color)" /> My Profile
        </h2>

        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label>Name</label>
            <input 
              type="text" 
              className="form-control" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Email (cannot be changed)</label>
            <input 
              type="email" 
              className="form-control" 
              value={user?.email || ''} 
              disabled 
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input 
              type="tel" 
              className="form-control" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label>Delivery Address</label>
            <textarea 
              className="form-control" 
              value={address} 
              onChange={(e) => setAddress(e.target.value)} 
              rows={3}
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%' }}>
            {loading ? 'Updating...' : 'Save Profile'}
          </button>
        </form>
      </div>

      {/* Orders List & Tracking */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        <div className="glass-card" style={{ padding: 28 }}>
          <h2 style={{ marginBottom: 24, fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShoppingBag size={20} color="var(--accent-color)" /> Order History
          </h2>

          {orders.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>You haven't placed any orders yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {orders.map(order => (
                <div 
                  key={order.id} 
                  style={{ 
                    padding: 16, 
                    borderRadius: 12, 
                    border: '1px solid var(--border-color)', 
                    background: 'rgba(255, 255, 255, 0.02)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 16
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
                      Order #{order.id.slice(-6).toUpperCase()}
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-secondary)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={13} /> {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        Rs. {order.totalPrice.toFixed(2)}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                      Restaurant: <strong>{order.restaurantName}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span 
                      style={{ 
                        fontSize: 12, 
                        fontWeight: 700, 
                        padding: '4px 10px', 
                        borderRadius: 20,
                        background: order.status === 'Delivered' 
                          ? 'rgba(16, 185, 129, 0.15)' 
                          : order.status === 'Rejected' 
                            ? 'rgba(239, 68, 68, 0.15)' 
                            : 'rgba(245, 158, 11, 0.15)',
                        color: order.status === 'Delivered' 
                          ? 'var(--success)' 
                          : order.status === 'Rejected' 
                            ? 'var(--danger)' 
                            : 'var(--warning)'
                      }}
                    >
                      {order.status}
                    </span>

                    <button 
                      onClick={() => handleViewOrder(order.id)}
                      className="btn btn-secondary" 
                      style={{ padding: '8px 12px', fontSize: 12 }}
                    >
                      <Eye size={14} />
                      Track / View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Order Tracking Detail */}
        {selectedOrder && (
          <div className="glass-card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3>Order Tracking Details</h3>
              <button 
                onClick={() => setSelectedOrder(null)} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}
              >
                Close Tracking
              </button>
            </div>

            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Deliver to: <strong>{selectedOrder.address}</strong>
            </p>

            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 14, marginBottom: 10 }}>Items Ordered:</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)' }}>
                    <span>{item.food ? item.food.title : 'Food Item'} x{item.quantity}</span>
                    <span>Rs. {((item.food ? item.food.price : 0) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <OrderTracker status={selectedOrder.status} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
