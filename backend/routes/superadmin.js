// const express = require('express');
// const router = express.Router();
// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const multer = require('multer');
// const path = require('path');

// // 🧺 File uploads ki multer storage setup
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/'); // Uploads folder lo pettadam
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname)); // Filename ki timestamp add cheyyadam
//   },
// });

// const upload = multer({ storage: storage });

// // ✅ Schemas define cheddam

// // 🔐 SuperAdmin schema
// const superAdminSchema = new mongoose.Schema({
//   email: String,
//   password: String
// });
// const SuperAdmin = mongoose.model('SuperAdmin', superAdminSchema);

// // 👨‍💼 Admin schema
// const adminSchema = new mongoose.Schema({
//   name: String,
//   phone: { type: String, unique: true },
//   email: String,
//   profilePhoto: String, // Profile photo path
//   password: String,
//   active: { type: Boolean, default: true }, // Active or not
//   registeredAt: { type: Date, default: Date.now } // Register time
// });
// const Admin = mongoose.model('Admin', adminSchema);

// // ✅ All Admins fetch cheyyadam
// router.get('/admins', async (req, res) => {
//   try {
//     const admins = await Admin.find({}, { password: 0 }); // Password ni exclude cheyyadam
//     res.json(admins);
//   } catch (err) {
//     console.error("❌ Error fetching admins:", err);
//     res.status(500).json({ message: "Server error fetching admins" });
//   }
// });

// // ✅ SuperAdmin login logic
// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const superadmin = await SuperAdmin.findOne({ email });
//     if (!superadmin) return res.status(401).json({ message: "Invalid email" });

//     const isMatch = await bcrypt.compare(password, superadmin.password);
//     if (!isMatch) return res.status(401).json({ message: "Invalid password" });

//     // 🪙 JWT token generate cheyyadam
//     const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '2h' });
//     res.json({ message: "Login successful", token });
//   } catch (err) {
//     console.error("❌ SuperAdmin login error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // ✅ Admin ni enable cheyyadam (phone tho)
// router.put('/enable-admin', async (req, res) => {
//   try {
//     const { phone } = req.body;

//     const admin = await Admin.findOne({ phone });
//     if (!admin) return res.status(404).json({ message: "Admin not found" });

//     const updatedAdmin = await Admin.findOneAndUpdate(
//       { phone },
//       { active: true },
//       { new: true }
//     ).select('-password'); // Password remove cheyyadam response lo

//     res.json({
//       message: 'Admin enabled successfully',
//       admin: updatedAdmin
//     });
//   } catch (err) {
//     console.error("❌ Error enabling admin:", err);
//     res.status(500).json({ message: "Server error enabling admin" });
//   }
// });

// // ✅ Admin ni disable cheyyadam
// router.put('/disable-admin', async (req, res) => {
//   try {
//     const { phone } = req.body;

//     const admin = await Admin.findOne({ phone });
//     if (!admin) return res.status(404).json({ message: "Admin not found" });

//     const updatedAdmin = await Admin.findOneAndUpdate(
//       { phone },
//       { active: !admin.active }, // Toggle cheyyadam
//       { new: true }
//     ).select('-password');

//     res.json({
//       message: `Admin ${updatedAdmin.active ? 'enabled' : 'disabled'} successfully`,
//       admin: updatedAdmin
//     });
//   } catch (err) {
//     console.error("❌ Error updating admin status:", err);
//     res.status(500).json({ message: "Server error updating admin status" });
//   }
// });

// // ✅ Admin ni delete cheyyadam (phone tho)
// router.delete('/delete-admin/:phone', async (req, res) => {
//   try {
//     const { phone } = req.params;
//     const deletedAdmin = await Admin.findOneAndDelete({ phone });

//     if (!deletedAdmin) return res.status(404).json({ message: "Admin not found" });

//     res.json({ message: "Admin deleted successfully" });
//   } catch (err) {
//     console.error("❌ Error deleting admin:", err);
//     res.status(500).json({ message: "Server error deleting admin" });
//   }
// });

// // ✅ Admin register cheyyadam + photo upload
// router.post('/register-admin', upload.single('profilePhoto'), async (req, res) => {
//   const { name, phone, email, password } = req.body;
//   const profilePhoto = req.file ? req.file.path : null; // Photo path thisukovadam

//   try {
//     const existing = await Admin.findOne({ phone });
//     if (existing) return res.status(400).json({ message: "Phone already in use" });

//     const hashedPassword = await bcrypt.hash(password, 10); // Password hash cheyyadam
//     const newAdmin = new Admin({
//       name,
//       phone,
//       email,
//       profilePhoto,
//       password: hashedPassword
//     });

//     await newAdmin.save();
//     res.json({ message: "✅ Admin registered successfully", phone });
//   } catch (err) {
//     console.error("❌ Register Admin Error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// /*
//   🔐 Future lo token based auth kavali ante i below code ni activate cheyyachu:
//   const authenticate = (req, res, next) => {
//     const token = req.headers['authorization']?.split(' ')[1];
//     if (!token) return res.status(401).json({ message: 'No token provided' });
//     jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//       if (err) return res.status(403).json({ message: 'Invalid token' });
//       req.user = user;
//       next();
//     });
//   };
// */

// module.exports = router;



const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const SuperAdmin = require('../models/SuperAdmin');
const Admin = require('../models/Admin');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'Uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalName)),
});
const upload = multer({ storage });

// SuperAdmin authentication middleware
const authenticateSuperAdmin = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(403).json({ message: 'Access denied' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const superadmin = await SuperAdmin.findOne({ email: decoded.email });
        if (!superadmin) return res.status(401).json({ message: 'Unauthorized' });
        req.superadmin = superadmin;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid token' });
    }
};

// Fetch all admins
router.get('/admins', authenticateSuperAdmin, async (req, res) => {
    try {
        const admins = await Admin.find({}, { password: 0 });
        res.json(admins);
    } catch (err) {
        console.error('❌ Error fetching admins:', err);
        res.status(500).json({ message: 'Server error fetching admins' });
    }
});

// SuperAdmin login
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

// Register admin with photo upload
router.post('/register-admin', authenticateSuperAdmin, upload.single('profilePhoto'), async (req, res) => {
    const { name, phone, email, password } = req.body;
    const profilePhoto = req.file ? req.file.path : null;
    try {
        const existing = await Admin.findOne({ phone });
        if (existing) return res.status(400).json({ message: 'Phone already in use' });
        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = new Admin({ name, phone, email, profilePhoto, password: hashedPassword });
        await newAdmin.save();
        res.json({ message: '✅ Admin registered successfully', admin: { name, phone, email, active: true } });
    } catch (err) {
        console.error('❌ Register Admin Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Enable admin
router.put('/enable-admin', authenticateSuperAdmin, async (req, res) => {
    try {
        const { phone } = req.body;
        const admin = await Admin.findOne({ phone });
        if (!admin) return res.status(404).json({ message: 'Admin not found' });
        const updatedAdmin = await Admin.findOneAndUpdate(
            { phone },
            { active: true },
            { new: true }
        ).select('-password');
        res.json({ message: 'Admin enabled successfully', admin: updatedAdmin });
    } catch (err) {
        console.error('❌ Error enabling admin:', err);
        res.status(500).json({ message: 'Server error enabling admin' });
    }
});

// Disable admin
router.put('/disable-admin', authenticateSuperAdmin, async (req, res) => {
    try {
        const { phone } = req.body;
        const admin = await Admin.findOne({ phone });
        if (!admin) return res.status(404).json({ message: 'Admin not found' });
        const updatedAdmin = await Admin.findOneAndUpdate(
            { phone },
            { active: false },
            { new: true }
        ).select('-password');
        res.json({ message: 'Admin disabled successfully', admin: updatedAdmin });
    } catch (err) {
        console.error('❌ Error disabling admin:', err);
        res.status(500).json({ message: 'Server error disabling admin' });
    }
});

// Delete admin
router.delete('/delete-admin/:phone', authenticateSuperAdmin, async (req, res) => {
    try {
        const { phone } = req.params;
        const deletedAdmin = await Admin.findOneAndDelete({ phone });
        if (!deletedAdmin) return res.status(404).json({ message: 'Admin not found' });
        res.json({ message: 'Admin deleted successfully' });
    } catch (err) {
        console.error('❌ Error deleting admin:', err);
        res.status(500).json({ message: 'Server error deleting admin' });
    }
});

module.exports = router;