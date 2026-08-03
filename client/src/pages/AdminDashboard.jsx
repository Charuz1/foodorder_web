import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Users, Store, ShieldAlert, Award } from 'lucide-react';

const AdminDashboard = () => {
  const { user, showNotification } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        setStats(await response.json());
      }

      const resUsers = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (resUsers.ok) {
        setUsersList(await resUsers.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ role: newRole })
      });
      if (response.ok) {
        showNotification('User role updated successfully');
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-secondary)' }}>Loading platform analytics...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700 }}>Platform Administrator Dashboard</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Real-time statistics and user settings monitoring.</p>
      </div>

      {stats && (
        <div className="stats-grid" style={{ marginBottom: 40 }}>
          <div className="glass-card stat-card">
            <span className="stat-label">Total Revenue</span>
            <div className="stat-value" style={{ color: 'var(--accent-color)' }}>
              Rs. {stats.totalRevenue.toFixed(2)}
            </div>
          </div>
          
          <div className="glass-card stat-card">
            <span className="stat-label">Registered Accounts</span>
            <div className="stat-value">{stats.totalUsers}</div>
          </div>

          <div className="glass-card stat-card">
            <span className="stat-label">Active Restaurants</span>
            <div className="stat-value">{stats.totalRestaurants}</div>
          </div>

          <div className="glass-card stat-card">
            <span className="stat-label">Orders Placed</span>
            <div className="stat-value">{stats.totalOrders}</div>
          </div>
        </div>
      )}

      {/* Users management list */}
      <div className="glass-card" style={{ padding: 28 }}>
        <h3 style={{ marginBottom: 20 }}>System Users</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 600 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: 14 }}>
                <th style={{ padding: '12px 16px' }}>Name</th>
                <th style={{ padding: '12px 16px' }}>Email</th>
                <th style={{ padding: '12px 16px' }}>Phone</th>
                <th style={{ padding: '12px 16px' }}>Current Role</th>
                <th style={{ padding: '12px 16px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: 14 }}>
                  <td style={{ padding: '16px', fontWeight: 600 }}>{u.name}</td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{u.phone || 'N/A'}</td>
                  <td style={{ padding: '16px' }}>
                    <span 
                      style={{ 
                        fontSize: 11, 
                        fontWeight: 700, 
                        padding: '4px 8px', 
                        borderRadius: 12,
                        background: u.role === 'admin' 
                          ? 'rgba(239, 68, 68, 0.15)' 
                          : u.role === 'restaurant' 
                            ? 'rgba(245, 158, 11, 0.15)' 
                            : 'rgba(255, 255, 255, 0.05)',
                        color: u.role === 'admin' 
                          ? 'var(--danger)' 
                          : u.role === 'restaurant' 
                            ? 'var(--warning)' 
                            : 'var(--text-primary)'
                      }}
                    >
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    {u.id !== user.id && (
                      <select 
                        className="form-control" 
                        style={{ padding: '6px 12px', fontSize: 12, width: 'fit-content' }}
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      >
                        <option value="customer">Customer</option>
                        <option value="restaurant">Restaurant Owner</option>
                        <option value="admin">Platform Admin</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
