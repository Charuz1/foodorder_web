import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import restaurantRoutes from './routes/restaurants.js';
import foodRoutes from './routes/foods.js';
import orderRoutes from './routes/orders.js';
import reviewRoutes from './routes/reviews.js';
import adminRoutes from './routes/admin.js';
import { connectDB } from './db.js';

const app = express();

// Connect to MongoDB
connectDB();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*', // For development, allow any client
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Main entry verification
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'HungryOrder API is running' });
});

// Load routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Start server
if (process.env.NODE_ENV !== 'production' && process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

export default app;
