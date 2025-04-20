const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Child = mongoose.model('Child');

// Child Login
router.post('/login', async (req, res) => {
  const { name, userId, password } = req.body;
  console.log('📩 Received Login Data:', req.body);

  if (!name || !userId || !password) {
    console.log('⚠️ Missing fields');
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const child = await Child.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') }, userId });
    if (!child) {
      console.log('❌ No matching child found!');
      return res.status(401).json({ message: 'Invalid name or user ID' });
    }
    if (!child.active) {
      console.log('❌ Child account disabled');
      return res.status(403).json({ message: 'Account is disabled' });
    }

    const isMatch = await bcrypt.compare(password, child.password);
    if (!isMatch) {
      console.log('❌ Invalid password');
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      { userId: child.userId, name: child.name, role: 'child' },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );
    console.log('✅ Login successful');
    res.json({ message: 'Login successful', token });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;