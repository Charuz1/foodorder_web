import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { auth, JWT_SECRET } from '../middleware/auth.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, address, role } = req.body;

    const existingUser = await db.findOne('users', { email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await db.insert('users', {
      name,
      email,
      password: hashedPassword,
      phone: phone || '',
      address: address || '',
      role: role || 'customer'
    });

    const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        address: newUser.address,
        role: newUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await db.findOne('users', { email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

// Get Profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await db.findOne('users', { id: req.user.id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching profile', error: error.message });
  }
});

// Update Profile
router.put('/me', auth, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const updatedUser = await db.update('users', req.user.id, { name, phone, address });
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address,
      role: updatedUser.role
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating profile', error: error.message });
  }
});

// Simulate OTP Verification
router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (otp === '123456' || otp === '1234') {
    res.json({ success: true, message: 'OTP verified successfully' });
  } else {
    res.status(400).json({ success: false, message: 'Invalid OTP code. Try 1234' });
  }
});

export default router;
