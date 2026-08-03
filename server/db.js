import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hungryorder';

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('💚 Connected to MongoDB database successfully!');
    await seedDatabase();
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// 1. Schemas
const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  role: { type: String, default: 'customer' }
});

const restaurantSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  description: { type: String, required: true },
  rating: { type: Number, default: 5.0 },
  category: { type: String, required: true },
  ownerId: { type: String, required: true }
});

const foodSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  restaurantId: { type: String, required: true },
  title: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  ingredients: { type: [String], default: [] },
  category: { type: String, required: true }
});

const orderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  restaurantId: { type: String, required: true },
  items: [
    {
      foodId: { type: String, required: true },
      quantity: { type: Number, required: true }
    }
  ],
  address: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  status: { type: String, default: 'Placed' },
  totalPrice: { type: Number, required: true },
  createdAt: { type: String, required: true }
});

const reviewSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  restaurantId: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  createdAt: { type: String, required: true }
});

// 2. Models
const User = mongoose.model('User', userSchema);
const Restaurant = mongoose.model('Restaurant', restaurantSchema);
const Food = mongoose.model('Food', foodSchema);
const Order = mongoose.model('Order', orderSchema);
const Review = mongoose.model('Review', reviewSchema);

const models = {
  users: User,
  restaurants: Restaurant,
  foods: Food,
  orders: Order,
  reviews: Review
};

// 3. Database Seeding
const seedDatabase = async () => {
  try {
    // A. Users
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const salt = await bcrypt.genSalt(10);
      const adminPassword = await bcrypt.hash('admin123', salt);
      const restPassword = await bcrypt.hash('rest123', salt);
      const userPassword = await bcrypt.hash('user123', salt);

      const initialUsers = [
        {
          id: 'user_admin',
          name: 'Platform Admin',
          email: 'admin@hungryorder.com',
          password: adminPassword,
          phone: '1234567890',
          address: 'Admin Headquarters, Metro City',
          role: 'admin'
        },
        {
          id: 'user_rest',
          name: 'Gourmet Owner',
          email: 'restaurant@hungryorder.com',
          password: restPassword,
          phone: '0987654321',
          address: 'Food Street, Sector 5',
          role: 'restaurant'
        },
        {
          id: 'user_cust',
          name: 'John Doe',
          email: 'user@hungryorder.com',
          password: userPassword,
          phone: '5551234567',
          address: '123 Maple Street, Apt 4B',
          role: 'customer'
        }
      ];
      await User.insertMany(initialUsers);
      console.log('Seeded users in MongoDB.');
    }

    // B. Restaurants
    const restCount = await Restaurant.countDocuments();
    if (restCount === 0) {
      const initialRestaurants = [
        {
          id: 'rest_1',
          name: 'Gourmet Garden',
          image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
          description: 'Authentic Italian pasta, wood-fired pizzas, and rich desserts.',
          rating: 4.8,
          category: 'Italian',
          ownerId: 'user_rest'
        },
        {
          id: 'rest_2',
          name: 'Spicy Street',
          image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
          description: 'Flavorful Asian bowls, traditional curry, and hot street bites.',
          rating: 4.6,
          category: 'Asian',
          ownerId: 'user_rest'
        },
        {
          id: 'rest_3',
          name: 'Burger Hub',
          image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
          description: 'Juicy smashed burgers, loaded fries, and premium craft milkshakes.',
          rating: 4.7,
          category: 'American',
          ownerId: 'user_rest'
        },
        {
          id: 'rest_4',
          name: 'Sushi Wave',
          image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80',
          description: 'Fresh sashimi, traditional maki rolls, and premium seafood delights.',
          rating: 4.9,
          category: 'Japanese',
          ownerId: 'user_rest'
        }
      ];
      await Restaurant.insertMany(initialRestaurants);
      console.log('Seeded restaurants in MongoDB.');
    }

    // C. Foods
    const foodCount = await Food.countDocuments();
    if (foodCount === 0) {
      const initialFoods = [
        // Gourmet Garden (rest_1)
        {
          id: 'food_1',
          restaurantId: 'rest_1',
          title: 'Margherita Wood-Fired Pizza',
          image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80',
          price: 14.99,
          description: 'Fresh mozzarella, tomato sauce, basil leaves, and a drizzle of olive oil.',
          ingredients: ['Mozzarella', 'Basil', 'Tomato Sauce', 'Olive Oil'],
          category: 'Pizza'
        },
        {
          id: 'food_2',
          restaurantId: 'rest_1',
          title: 'Creamy Truffle Fettuccine',
          image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=600&q=80',
          price: 18.50,
          description: 'Fettuccine pasta tossed in wild mushroom truffle cream sauce.',
          ingredients: ['Fettuccine', 'Mushrooms', 'Truffle Oil', 'Cream'],
          category: 'Pasta'
        },
        // Spicy Street (rest_2)
        {
          id: 'food_3',
          restaurantId: 'rest_2',
          title: 'Thai Red Curry Chicken',
          image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=600&q=80',
          price: 15.99,
          description: 'Rich, spicy coconut milk curry served with tender chicken and jasmine rice.',
          ingredients: ['Chicken', 'Red Curry Paste', 'Coconut Milk', 'Jasmine Rice'],
          category: 'Curry'
        },
        {
          id: 'food_4',
          restaurantId: 'rest_2',
          title: 'Chicken Pad Thai',
          image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=600&q=80',
          price: 13.99,
          description: 'Stir-fried rice noodles with tofu, egg, bean sprouts, and crushed peanuts.',
          ingredients: ['Noodles', 'Peanuts', 'Bean Sprouts', 'Egg', 'Tofu'],
          category: 'Noodles'
        },
        // Burger Hub (rest_3)
        {
          id: 'food_5',
          restaurantId: 'rest_3',
          title: 'The Ultimate Double Smashed Burger',
          image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
          price: 12.99,
          description: 'Two angus beef patties, cheddar cheese, secret burger sauce, and pickle slices.',
          ingredients: ['Angus Beef', 'Cheddar', 'Secret Sauce', 'Pickles', 'Brioche Bun'],
          category: 'Burger'
        },
        {
          id: 'food_6',
          restaurantId: 'rest_3',
          title: 'Truffle Parmesan Loaded Fries',
          image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
          price: 8.99,
          description: 'Crisp french fries coated in truffle oil, topped with aged parmesan and parsley.',
          ingredients: ['Fries', 'Truffle Oil', 'Parmesan', 'Parsley'],
          category: 'Sides'
        },
        // Sushi Wave (rest_4)
        {
          id: 'food_7',
          restaurantId: 'rest_4',
          title: 'Signature Dragon Roll',
          image: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=600&q=80',
          price: 16.99,
          description: 'Eel and cucumber topped with avocado slices, tobiko, and unagi glaze.',
          ingredients: ['Eel', 'Avocado', 'Cucumber', 'Tobiko', 'Rice'],
          category: 'Sushi'
        },
        {
          id: 'food_8',
          restaurantId: 'rest_4',
          title: 'Premium Sashimi Platter',
          image: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=600&q=80',
          price: 24.99,
          description: 'Assortment of fresh salmon, tuna, and red snapper slices served with wasabi.',
          ingredients: ['Salmon', 'Tuna', 'Red Snapper', 'Wasabi'],
          category: 'Sushi'
        }
      ];
      await Food.insertMany(initialFoods);
      console.log('Seeded foods in MongoDB.');
    }
  } catch (err) {
    console.error('Error seeding database:', err);
  }
};

// 4. Asynchronous DB Helper Methods
export const db = {
  get: async (collection) => {
    const Model = models[collection];
    if (!Model) return [];
    return await Model.find({}).lean();
  },
  find: async (collection, query = {}) => {
    const Model = models[collection];
    if (!Model) return [];
    return await Model.find(query).lean();
  },
  findOne: async (collection, query = {}) => {
    const Model = models[collection];
    if (!Model) return null;
    return await Model.findOne(query).lean();
  },
  insert: async (collection, item) => {
    const Model = models[collection];
    if (!Model) return null;
    const generatedId = `${collection.slice(0, 3)}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newItem = new Model({ id: generatedId, ...item });
    await newItem.save();
    return newItem.toObject();
  },
  update: async (collection, id, updates) => {
    const Model = models[collection];
    if (!Model) return null;
    return await Model.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
  },
  delete: async (collection, id) => {
    const Model = models[collection];
    if (!Model) return false;
    await Model.deleteOne({ id });
    return true;
  }
};
