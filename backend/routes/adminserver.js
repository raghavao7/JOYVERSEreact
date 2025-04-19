const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const router = express.Router();

// Admin Schema
const AdminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    profilePhoto: { type: String },
    registeredAt: { type: Date, default: Date.now }
});

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

// Child Schema
const ChildSchema = new mongoose.Schema({
    childName: { type: String, required: true },
    phone: { type: String, unique: true, required: true },
    userId: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    registeredAt: { type: Date, default: Date.now },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
    isActive: { type: Boolean, default: true }
});

const Child = mongoose.models.Child || mongoose.model('Child', ChildSchema);

// Middleware
const authenticateAdmin = async (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(403).json({ message: 'Access denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.adminId = decoded.adminId;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid token' });
    }
};

// Routes

// Admin Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and Password required' });

    try {
        const admin = await Admin.findOne({ email });
        if (!admin) return res.status(400).json({ message: 'Invalid email or password' });

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

        const token = jwt.sign(
            { adminId: admin._id, email: admin.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ message: 'Login successful', token });
    } catch (err) {
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Register Child
router.post('/register-child', authenticateAdmin, async (req, res) => {
    const { childName, phone, userId, password } = req.body;
    if (!childName || !phone || !userId || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const existingChild = await Child.findOne({ $or: [{ phone }, { userId }] });
        if (existingChild) {
            return res.status(400).json({ message: 'Child with this phone or user ID already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newChild = new Child({
            childName,
            phone,
            userId,
            password: hashedPassword,
            parentId: req.adminId
        });

        await newChild.save();
        res.json({ message: 'Child registered successfully', child: newChild });
    } catch (err) {
        res.status(500).json({ message: 'Server error registering child' });
    }
});

// Get all children for logged-in admin
router.get('/children', authenticateAdmin, async (req, res) => {
    try {
        const children = await Child.find({ parentId: req.adminId });
        res.json(children);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching children' });
    }
});

// Update child status
router.patch('/child/:id/status', authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body;

    try {
        const child = await Child.findOneAndUpdate(
            { _id: id, parentId: req.adminId },
            { isActive },
            { new: true }
        );
        if (!child) return res.status(404).json({ message: 'Child not found or unauthorized' });

        res.json({ message: `Child status updated to ${isActive ? 'Active' : 'Inactive'}`, child });
    } catch (err) {
        res.status(500).json({ message: 'Error updating child status' });
    }
});

// Delete child
router.delete('/child/:id', authenticateAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const child = await Child.findOneAndDelete({ _id: id, parentId: req.adminId });
        if (!child) return res.status(404).json({ message: 'Child not found or unauthorized' });

        res.json({ message: 'Child deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting child' });
    }
});

// Update admin profile
router.patch('/update-profile', authenticateAdmin, async (req, res) => {
    const { password, profilePhoto } = req.body;

    try {
        const updateData = {};
        if (password) updateData.password = await bcrypt.hash(password, 10);
        if (profilePhoto) updateData.profilePhoto = profilePhoto;

        const updatedAdmin = await Admin.findByIdAndUpdate(req.adminId, updateData, { new: true });
        if (!updatedAdmin) return res.status(404).json({ message: 'Admin not found' });

        res.json({ message: 'Profile updated successfully', admin: updatedAdmin });
    } catch (err) {
        res.status(500).json({ message: 'Error updating profile' });
    }
});

module.exports = router;
