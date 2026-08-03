import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Plus, Utensils, ClipboardList, TrendingUp, X } from 'lucide-react';

const RestaurantDashboard = () => {
  const { user, showNotification } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('orders'); // orders, menu, stats
  
  // Dashboard Data
  const [restaurant, setRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);
  const [foods, setFoods] = useState([]);

  // Add food modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [foodTitle, setFoodTitle] = useState('');
  const [foodPrice, setFoodPrice] = useState('');
  const [foodCategory, setFoodCategory] = useState('Pizza');
  const [foodDesc, setFoodDesc] = useState('');
  const [foodIngreds, setFoodIngreds] = useState('');
  const [foodImage, setFoodImage] = useState('');

  useEffect(() => {
    fetchRestaurantAndData();
  }, []);

  const fetchRestaurantAndData = async () => {
    try {
      // 1. Fetch restaurants list to find the one owned by this owner
      const resList = await fetch('http://localhost:5000/api/restaurants');
      if (resList.ok) {
        const list = await resList.json();
        const owned = list.find(r => r.ownerId === user.id);
        if (owned) {
          setRestaurant(owned);
          // Fetch food items for this restaurant
          const resFoods = await fetch(`http://localhost:5000/api/foods?restaurantId=${owned.id}`);
          if (resFoods.ok) {
            setFoods(await resFoods.json());
          }
        }
      }

      // 2. Fetch all orders
      const resOrders = await fetch('http://localhost:5000/api/orders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (resOrders.ok) {
        setOrders(await resOrders.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        showNotification(`Order status updated to ${newStatus}`);
        fetchRestaurantAndData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddFoodItem = async (e) => {
    e.preventDefault();
    if (!restaurant) {
      showNotification('No restaurant profile setup yet', 'error');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/foods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          restaurantId: restaurant.id,
          title: foodTitle,
          price: foodPrice,
          category: foodCategory,
          description: foodDesc,
          ingredients: foodIngreds,
          image: foodImage || undefined
        })
      });

      if (response.ok) {
        showNotification('Food item added to menu successfully!');
        setShowAddModal(false);
        // Reset inputs
        setFoodTitle('');
        setFoodPrice('');
        setFoodDesc('');
        setFoodIngreds('');
        setFoodImage('');
        fetchRestaurantAndData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFood = async (foodId) => {
    if (!window.confirm('Are you sure you want to delete this food item?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/foods/${foodId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        showNotification('Food item deleted successfully');
        fetchRestaurantAndData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Stats calculation
  const totalSalesRevenue = orders.reduce((sum, order) => {
    if (order.status !== 'Rejected') {
      return sum + order.totalPrice;
    }
    return sum;
  }, 0);

  return (
    <div className="dashboard-container">
      {/* Sidebar navigation */}
      <aside className="dashboard-sidebar glass-card" style={{ padding: 20, height: 'fit-content' }}>
        <h3 style={{ fontSize: 16, marginBottom: 20 }}>Manager Panel</h3>
        <button 
          onClick={() => setActiveTab('orders')} 
          className={`sidebar-link ${activeTab === 'orders' ? 'active' : ''}`}
          style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left' }}
        >
          <ClipboardList size={18} /> Orders ({orders.length})
        </button>
        <button 
          onClick={() => setActiveTab('menu')} 
          className={`sidebar-link ${activeTab === 'menu' ? 'active' : ''}`}
          style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left' }}
        >
          <Utensils size={18} /> Menu Items ({foods.length})
        </button>
        <button 
          onClick={() => setActiveTab('stats')} 
          className={`sidebar-link ${activeTab === 'stats' ? 'active' : ''}`}
          style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left' }}
        >
          <TrendingUp size={18} /> Sales Stats
        </button>
      </aside>

      {/* Main Content Area */}
      <main>
        {restaurant ? (
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700 }}>{restaurant.name} Portal</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Manage orders, menus, and view sales details.</p>
          </div>
        ) : (
          <div style={{ marginBottom: 24 }}>
            <h2>Restaurant Dashboard</h2>
            <p style={{ color: 'var(--text-secondary)' }}>You don't have an active restaurant profile setup yet. Contact Admin.</p>
          </div>
        )}

        {/* Tab 1: Orders List */}
        {activeTab === 'orders' && (
          <div className="glass-card" style={{ padding: 28 }}>
            <h3 style={{ marginBottom: 20 }}>Live Customer Orders</h3>
            
            {orders.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No orders received yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {orders.map(order => (
                  <div 
                    key={order.id} 
                    style={{ 
                      padding: 20, 
                      borderRadius: 16, 
                      border: '1px solid var(--border-color)', 
                      background: 'rgba(255, 255, 255, 0.01)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 20
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontWeight: 700 }}>Order #{order.id.slice(-6).toUpperCase()}</span>
                        <span 
                          style={{ 
                            fontSize: 11, 
                            fontWeight: 700, 
                            padding: '3px 8px', 
                            borderRadius: 12,
                            background: 'rgba(255, 87, 34, 0.15)',
                            color: 'var(--accent-color)'
                          }}
                        >
                          {order.status}
                        </span>
                      </div>
                      
                      <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12 }}>
                        Customer: <strong>{order.customerName}</strong> ({order.customerPhone})<br />
                        Deliver to: <strong>{order.address}</strong>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {order.items.map((item, idx) => (
                          <span key={idx} style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                            - {item.food ? item.food.title : 'Food Item'} x{item.quantity}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', minWidth: 160 }}>
                      <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--accent-color)' }}>
                        Rs. {order.totalPrice.toFixed(2)}
                      </div>

                      {/* Status Update Quick Select */}
                      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                        {order.status === 'Placed' && (
                          <>
                            <button 
                              onClick={() => handleUpdateOrderStatus(order.id, 'Accepted')}
                              className="btn btn-primary" 
                              style={{ padding: '6px 12px', fontSize: 12 }}
                            >
                              Accept
                            </button>
                            <button 
                              onClick={() => handleUpdateOrderStatus(order.id, 'Rejected')}
                              className="btn btn-danger" 
                              style={{ padding: '6px 12px', fontSize: 12 }}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {order.status === 'Accepted' && (
                          <button 
                            onClick={() => handleUpdateOrderStatus(order.id, 'Cooking')}
                            className="btn btn-primary" 
                            style={{ padding: '6px 12px', fontSize: 12 }}
                          >
                            Start Cooking
                          </button>
                        )}
                        {order.status === 'Cooking' && (
                          <button 
                            onClick={() => handleUpdateOrderStatus(order.id, 'Out for Delivery')}
                            className="btn btn-primary" 
                            style={{ padding: '6px 12px', fontSize: 12 }}
                          >
                            Dispatch Order
                          </button>
                        )}
                        {order.status === 'Out for Delivery' && (
                          <button 
                            onClick={() => handleUpdateOrderStatus(order.id, 'Delivered')}
                            className="btn btn-primary" 
                            style={{ padding: '6px 12px', fontSize: 12, background: 'var(--success)' }}
                          >
                            Mark Delivered
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Menu Items Management */}
        {activeTab === 'menu' && (
          <div className="glass-card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3>Manage Restaurant Menu</h3>
              <button onClick={() => setShowAddModal(true)} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
                <Plus size={16} /> Add Food Item
              </button>
            </div>

            {foods.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No items in the menu. Add items to start selling!</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
                {foods.map(food => (
                  <div key={food.id} className="glass-card" style={{ overflow: 'hidden', padding: 12, display: 'flex', flexDirection: 'column' }}>
                    <img src={food.image} alt={food.title} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 10 }} />
                    <h4 style={{ fontSize: 15, fontWeight: 700 }}>{food.title}</h4>
                    <p style={{ color: 'var(--accent-color)', fontWeight: 800, fontSize: 14, margin: '4px 0' }}>
                      Rs. {food.price.toFixed(2)}
                    </p>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
                      Category: {food.category}
                    </span>
                    <button 
                      onClick={() => handleDeleteFood(food.id)}
                      className="btn btn-danger" 
                      style={{ padding: '6px 12px', fontSize: 11, width: '100%', marginTop: 'auto' }}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Sales Statistics */}
        {activeTab === 'stats' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {/* Stat Counters */}
            <div className="stats-grid">
              <div className="glass-card stat-card">
                <span className="stat-label">Total Completed Sales</span>
                <div className="stat-value" style={{ color: 'var(--success)' }}>
                  Rs. {totalSalesRevenue.toFixed(2)}
                </div>
              </div>
              
              <div className="glass-card stat-card">
                <span className="stat-label">Total Orders Received</span>
                <div className="stat-value">{orders.length}</div>
              </div>

              <div className="glass-card stat-card">
                <span className="stat-label">Active Orders</span>
                <div className="stat-value" style={{ color: 'var(--warning)' }}>
                  {orders.filter(o => !['Delivered', 'Rejected'].includes(o.status)).length}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Food Modal Overlay */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
              <X size={18} />
            </button>
            <div className="modal-body" style={{ padding: 24 }}>
              <h3 style={{ marginBottom: 20 }}>Add Food Item to Menu</h3>
              
              <form onSubmit={handleAddFoodItem}>
                <div className="form-group">
                  <label>Title</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    placeholder="e.g. Cheese Pizza"
                    value={foodTitle}
                    onChange={(e) => setFoodTitle(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label>Price (Rs.)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      className="form-control" 
                      required 
                      placeholder="499"
                      value={foodPrice}
                      onChange={(e) => setFoodPrice(e.target.value)}
                    />
                  </div>
                  <div>
                    <label>Category</label>
                    <select 
                      className="form-control" 
                      value={foodCategory}
                      onChange={(e) => setFoodCategory(e.target.value)}
                    >
                      <option value="Pizza">Pizza</option>
                      <option value="Pasta">Pasta</option>
                      <option value="Burger">Burger</option>
                      <option value="Sushi">Sushi</option>
                      <option value="Curry">Curry</option>
                      <option value="Noodles">Noodles</option>
                      <option value="Sides">Sides</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea 
                    className="form-control" 
                    required 
                    rows={2} 
                    placeholder="Brief description..."
                    value={foodDesc}
                    onChange={(e) => setFoodDesc(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Ingredients (comma separated)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Tomato, Cheese, Basil"
                    value={foodIngreds}
                    onChange={(e) => setFoodIngreds(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Image URL (Optional)</label>
                  <input 
                    type="url" 
                    className="form-control" 
                    placeholder="https://images.unsplash.com/..."
                    value={foodImage}
                    onChange={(e) => setFoodImage(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 10 }}>
                  Add Item
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantDashboard;
