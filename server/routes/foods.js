import express from 'express';
import { db } from '../db.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all foods (with optional search and category filters)
router.get('/', async (req, res) => {
  try {
    let foods = await db.get('foods');
    const { category, search, restaurantId } = req.query;

    if (restaurantId) {
      foods = foods.filter(f => f.restaurantId === restaurantId);
    }
    if (category) {
      foods = foods.filter(f => f.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      foods = foods.filter(f => f.title.toLowerCase().includes(q) || f.description.toLowerCase().includes(q));
    }

    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving food items', error: error.message });
  }
});

// Get single food item
router.get('/:id', async (req, res) => {
  try {
    const food = await db.findOne('foods', { id: req.params.id });
    if (!food) {
      return res.status(404).json({ message: 'Food item not found' });
    }
    res.json(food);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving food item', error: error.message });
  }
});

// Create new food item
router.post('/', auth, authorize(['admin', 'restaurant']), async (req, res) => {
  try {
    const { restaurantId, title, image, price, description, ingredients, category } = req.body;

    const restaurant = await db.findOne('restaurants', { id: restaurantId });
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    if (req.user.role !== 'admin' && restaurant.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You do not own this restaurant' });
    }

    const newFood = await db.insert('foods', {
      restaurantId,
      title,
      image: image || 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80',
      price: parseFloat(price),
      description,
      ingredients: Array.isArray(ingredients) ? ingredients : ingredients.split(',').map(i => i.trim()),
      category
    });

    res.status(201).json(newFood);
  } catch (error) {
    res.status(500).json({ message: 'Error creating food item', error: error.message });
  }
});

// Update food item
router.put('/:id', auth, authorize(['admin', 'restaurant']), async (req, res) => {
  try {
    const { title, image, price, description, ingredients, category } = req.body;
    const food = await db.findOne('foods', { id: req.params.id });

    if (!food) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    const restaurant = await db.findOne('restaurants', { id: food.restaurantId });
    if (req.user.role !== 'admin' && restaurant.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updated = await db.update('foods', req.params.id, {
      title,
      image,
      price: parseFloat(price),
      description,
      ingredients: Array.isArray(ingredients) ? ingredients : ingredients.split(',').map(i => i.trim()),
      category
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating food item', error: error.message });
  }
});

// Delete food item
router.delete('/:id', auth, authorize(['admin', 'restaurant']), async (req, res) => {
  try {
    const food = await db.findOne('foods', { id: req.params.id });
    if (!food) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    const restaurant = await db.findOne('restaurants', { id: food.restaurantId });
    if (req.user.role !== 'admin' && restaurant.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await db.delete('foods', req.params.id);
    res.json({ message: 'Food item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting food item', error: error.message });
  }
});

export default router;
