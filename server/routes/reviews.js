import express from 'express';
import { db } from '../db.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get restaurant reviews
router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const reviews = await db.find('reviews', { restaurantId: req.params.restaurantId });
    // Populate user name
    const populated = await Promise.all(reviews.map(async rev => {
      const user = await db.findOne('users', { id: rev.userId });
      return {
        ...rev,
        userName: user ? user.name : 'Anonymous'
      };
    }));
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving reviews', error: error.message });
  }
});

// Submit review
router.post('/', auth, async (req, res) => {
  try {
    const { restaurantId, rating, comment } = req.body;

    const newReview = await db.insert('reviews', {
      userId: req.user.id,
      restaurantId,
      rating: parseFloat(rating),
      comment,
      createdAt: new Date().toISOString()
    });

    // Recalculate average rating of the restaurant
    const allReviews = await db.find('reviews', { restaurantId });
    const avgRating = allReviews.length > 0 
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length 
      : parseFloat(rating);

    await db.update('restaurants', restaurantId, {
      rating: parseFloat(avgRating.toFixed(1))
    });

    res.status(201).json(newReview);
  } catch (error) {
    res.status(500).json({ message: 'Error submitting review', error: error.message });
  }
});

export default router;
