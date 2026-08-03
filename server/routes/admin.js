import express from 'express';
import { db } from '../db.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(auth, authorize('admin'));

// Get admin stats
router.get('/stats', async (req, res) => {
  try {
    const users = await db.get('users');
    const restaurants = await db.get('restaurants');
    const orders = await db.get('orders');

    const totalRevenue = orders.reduce((sum, order) => {
      if (order.status !== 'Rejected') {
        return sum + (order.totalPrice || 0);
      }
      return sum;
    }, 0);

    res.json({
      totalUsers: users.length,
      totalRestaurants: restaurants.length,
      totalOrders: orders.length,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      recentOrders: orders.slice(-5).reverse()
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving platform statistics', error: error.message });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await db.get('users');
    res.json(users.map(u => {
      const { password, ...rest } = u;
      return rest;
    }));
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving platform users', error: error.message });
  }
});

// Update user role
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    const updated = await db.update('users', req.params.id, { role });
    if (!updated) return res.status(404).json({ message: 'User not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user role', error: error.message });
  }
});

export default router;
