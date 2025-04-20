const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

// Import the Admin model
const Admin = require('../models/Admin'); // Import the model here

// Setup multer storage for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Uploads folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Add timestamp to filename
  },
});

const upload = multer({ storage: storage });

// Schemas
const superAdminSchema = new mongoose.Schema({
  email: String,
  password: String,
});
const SuperAdmin = mongoose.model('SuperAdmin', superAdminSchema);

// Authentication middleware
const authenticate = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Get All Admins
router.get('/admins', authenticate, async (req, res) => {
  try {
    const admins = await Admin.find({}, { password: 0 }); // Exclude password from response
    res.json(admins);
  } catch (err) {
    console.error('❌ Error fetching admins:', err);
    res.status(500).json({ message: 'Server error fetching admins' });
  }
});

// Super Admin Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const superadmin = await SuperAdmin.findOne({ email });
    if (!superadmin) return res.status(401).json({ message: 'Invalid email' });

    const isMatch = await bcrypt.compare(password, superadmin.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.json({ message: 'Login successful', token });
  } catch (err) {
    console.error('❌ SuperAdmin login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Enable Admin by phone
router.put('/enable-admin', authenticate, async (req, res) => {
  try {
    const { phone } = req.body;

    const admin = await Admin.findOne({ phone });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const updatedAdmin = await Admin.findOneAndUpdate(
      { phone },
      { active: true },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Admin enabled successfully',
      admin: updatedAdmin,
    });
  } catch (err) {
    console.error('❌ Error enabling admin:', err);
    res.status(500).json({ message: 'Server error enabling admin' });
  }
});

// Disable Admin by phone
router.put('/disable-admin', authenticate, async (req, res) => {
  try {
    const { phone } = req.body;

    const admin = await Admin.findOne({ phone });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const updatedAdmin = await Admin.findOneAndUpdate(
      { phone },
      { active: !admin.active },
      { new: true }
    ).select('-password');

    res.json({
      message: `Admin ${updatedAdmin.active ? 'enabled' : 'disabled'} successfully`,
      admin: updatedAdmin,
    });
  } catch (err) {
    console.error('❌ Error updating admin status:', err);
    res.status(500).json({ message: 'Server error updating admin status' });
  }
});

// Delete Admin by phone
router.delete('/delete-admin/:phone', authenticate, async (req, res) => {
  try {
    const { phone } = req.params;
    const deletedAdmin = await Admin.findOneAndDelete({ phone });

    if (!deletedAdmin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json({ message: 'Admin deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting admin:', err);
    res.status(500).json({ message: 'Server error deleting admin' });
  }
});

// Register New Admin with Profile Photo Upload
router.post('/register-admin', authenticate, upload.single('profilePhoto'), async (req, res) => {
  const { name, phone, email, password } = req.body;
  const profilePhoto = req.file ? req.file.path : null; // Get the uploaded file's path

  try {
    const existing = await Admin.findOne({ phone });
    if (existing) return res.status(400).json({ message: 'Phone already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({
      name,
      phone,
      email,
      profilePhoto,
      password: hashedPassword,
    });

    await newAdmin.save();
    res.json({ message: '✅ Admin registered successfully', phone });
  } catch (err) {
    console.error('❌ Register Admin Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
