import express from 'express';
import { db } from '../db.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Create order
router.post('/', auth, async (req, res) => {
  try {
    const { items, address, paymentMethod, totalPrice } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cannot place order with empty cart' });
    }

    // Get restaurant ID from first item
    const firstFoodItem = await db.findOne('foods', { id: items[0].foodId });
    const restaurantId = firstFoodItem ? firstFoodItem.restaurantId : 'unknown';

    const newOrder = await db.insert('orders', {
      userId: req.user.id,
      restaurantId,
      items,
      address,
      paymentMethod,
      status: 'Placed', // Placed, Accepted, Cooking, Out for Delivery, Delivered, Rejected
      totalPrice: parseFloat(totalPrice),
      createdAt: new Date().toISOString()
    });

    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error placing order', error: error.message });
  }
});

// Get user orders or owner/admin orders
router.get('/', auth, async (req, res) => {
  try {
    const { role, id } = req.user;
    let orders = await db.get('orders');

    if (role === 'customer') {
      orders = orders.filter(o => o.userId === id);
    } else if (role === 'restaurant') {
      // Find restaurants owned by this user
      const ownedRestaurants = (await db.find('restaurants', { ownerId: id })).map(r => r.id);
      orders = orders.filter(o => ownedRestaurants.includes(o.restaurantId));
    }

    // Populate food details and user info
    const populated = await Promise.all(orders.map(async order => {
      const customer = await db.findOne('users', { id: order.userId });
      const restaurant = await db.findOne('restaurants', { id: order.restaurantId });
      const fullItems = await Promise.all(order.items.map(async item => {
        const food = await db.findOne('foods', { id: item.foodId });
        return { ...item, food };
      }));
      return {
        ...order,
        customerName: customer ? customer.name : 'Unknown User',
        customerPhone: customer ? customer.phone : '',
        restaurantName: restaurant ? restaurant.name : 'Unknown Restaurant',
        items: fullItems
      };
    }));

    // Sort by latest
    populated.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving orders', error: error.message });
  }
});

// Get single order details
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await db.findOne('orders', { id: req.params.id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check auth
    if (req.user.role === 'customer' && order.userId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const customer = await db.findOne('users', { id: order.userId });
    const restaurant = await db.findOne('restaurants', { id: order.restaurantId });
    const fullItems = await Promise.all(order.items.map(async item => {
      const food = await db.findOne('foods', { id: item.foodId });
      return { ...item, food };
    }));

    res.json({
      ...order,
      customerName: customer ? customer.name : 'Unknown User',
      customerPhone: customer ? customer.phone : '',
      restaurantName: restaurant ? restaurant.name : 'Unknown Restaurant',
      items: fullItems
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving order details', error: error.message });
  }
});

// Update order status (Accept, cooking, ready, etc.)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await db.findOne('orders', { id: req.params.id });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check authorization: Owner or admin
    if (req.user.role === 'customer') {
      return res.status(403).json({ message: 'Customers cannot modify order status' });
    }

    const updated = await db.update('orders', req.params.id, { status });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status', error: error.message });
  }
});

export default router;
