import express from 'express';
import { db } from '../db.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all restaurants
router.get('/', async (req, res) => {
  try {
    const list = await db.get('restaurants');
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving restaurants', error: error.message });
  }
});

// Get single restaurant detail
router.get('/:id', async (req, res) => {
  try {
    const restaurant = await db.findOne('restaurants', { id: req.params.id });
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    const foods = await db.find('foods', { restaurantId: req.params.id });
    res.json({ ...restaurant, foods });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving restaurant details', error: error.message });
  }
});

// Create new restaurant (Admin only or Owner setup)
router.post('/', auth, authorize(['admin', 'restaurant']), async (req, res) => {
  try {
    const { name, image, description, category } = req.body;
    const newRestaurant = await db.insert('restaurants', {
      name,
      image: image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      description,
      category,
      rating: 5.0,
      ownerId: req.user.id
    });
    res.status(201).json(newRestaurant);
  } catch (error) {
    res.status(500).json({ message: 'Error creating restaurant', error: error.message });
  }
});

// Update restaurant details
router.put('/:id', auth, authorize(['admin', 'restaurant']), async (req, res) => {
  try {
    const { name, image, description, category } = req.body;
    const restaurant = await db.findOne('restaurants', { id: req.params.id });

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Authorization check
    if (req.user.role !== 'admin' && restaurant.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You do not own this restaurant' });
    }

    const updated = await db.update('restaurants', req.params.id, { name, image, description, category });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating restaurant', error: error.message });
  }
});

// Delete restaurant
router.delete('/:id', auth, authorize(['admin', 'restaurant']), async (req, res) => {
  try {
    const restaurant = await db.findOne('restaurants', { id: req.params.id });

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    if (req.user.role !== 'admin' && restaurant.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await db.delete('restaurants', req.params.id);
    res.json({ message: 'Restaurant deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting restaurant', error: error.message });
  }
});

export default router;
