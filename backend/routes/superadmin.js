// const express = require('express');
// const router = express.Router();
// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const multer = require('multer');
// const path = require('path');

// // Setup multer storage for file upload
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/'); // Uploads folder
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname)); // Add timestamp to filename
//   },
// });

// const upload = multer({ storage: storage });

// // ✅ Schemas
// const superAdminSchema = new mongoose.Schema({
//   email: String,
//   password: String
// });
// const SuperAdmin = mongoose.model('SuperAdmin', superAdminSchema);

// const adminSchema = new mongoose.Schema({
//   name: String,
//   phone: { type: String, unique: true },
//   email: String,
//   profilePhoto: String,  // Path to profile photo
//   password: String,
//   active: { type: Boolean, default: true },
//   registeredAt: { type: Date, default: Date.now }
// });
// const Admin = mongoose.model('Admin', adminSchema);
// // ✅ Get All Admins
// router.get('/admins', async (req, res) => {
//     try {
//       const admins = await Admin.find({}, { password: 0 }); // Exclude password from response
//       res.json(admins);
//     } catch (err) {
//       console.error("❌ Error fetching admins:", err);
//       res.status(500).json({ message: "Server error fetching admins" });
//     }
//   });

// // ✅ Super Admin Login
// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const superadmin = await SuperAdmin.findOne({ email });
//     if (!superadmin) return res.status(401).json({ message: "Invalid email" });

//     const isMatch = await bcrypt.compare(password, superadmin.password);
//     if (!isMatch) return res.status(401).json({ message: "Invalid password" });

//     const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '2h' });
//     res.json({ message: "Login successful", token });
//   } catch (err) {
//     console.error("❌ SuperAdmin login error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // ✅ Disable/Enable Admin by phone
// // ✅ Enable Admin by phone
// router.put('/enable-admin', async (req, res) => {
//     try {
//       const { phone } = req.body;
      
//       const admin = await Admin.findOne({ phone });
//       if (!admin) {
//         return res.status(404).json({ message: "Admin not found" });
//       }
  
//       const updatedAdmin = await Admin.findOneAndUpdate(
//         { phone },
//         { active: true },
//         { new: true }
//       ).select('-password');
  
//       res.json({
//         message: 'Admin enabled successfully',
//         admin: updatedAdmin
//       });
//     } catch (err) {
//       console.error("❌ Error enabling admin:", err);
//       res.status(500).json({ message: "Server error enabling admin" });
//     }
//   });
// router.put('/disable-admin', async (req, res) => {
//     try {
//       const { phone } = req.body;
      
//       const admin = await Admin.findOne({ phone });
//       if (!admin) {
//         return res.status(404).json({ message: "Admin not found" });
//       }
  
//       const updatedAdmin = await Admin.findOneAndUpdate(
//         { phone },
//         { active: !admin.active },
//         { new: true }
//       ).select('-password');
  
//       res.json({
//         message: `Admin ${updatedAdmin.active ? 'enabled' : 'disabled'} successfully`,
//         admin: updatedAdmin
//       });
//     } catch (err) {
//       console.error("❌ Error updating admin status:", err);
//       res.status(500).json({ message: "Server error updating admin status" });
//     }
//   });
  
//   // ✅ Delete Admin by phone
//   router.delete('/delete-admin/:phone', async (req, res) => {
//     try {
//       const { phone } = req.params;
//       const deletedAdmin = await Admin.findOneAndDelete({ phone });
  
//       if (!deletedAdmin) {
//         return res.status(404).json({ message: "Admin not found" });
//       }
  
//       res.json({ message: "Admin deleted successfully" });
//     } catch (err) {
//       console.error("❌ Error deleting admin:", err);
//       res.status(500).json({ message: "Server error deleting admin" });
//     }
//   });
// // ✅ Register New Admin with Profile Photo Upload
// router.post('/register-admin', upload.single('profilePhoto'), async (req, res) => {
//   const { name, phone, email, password } = req.body;
//   const profilePhoto = req.file ? req.file.path : null; // Get the uploaded file's path

//   try {
//     const existing = await Admin.findOne({ phone });
//     if (existing) return res.status(400).json({ message: "Phone already in use" });

//     const hashedPassword = await bcrypt.hash(password, 10);
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

// module.exports = router;





const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/joyverse', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Multer Setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    },
});
const upload = multer({ storage });

// Super Admin Schema
const superAdminSchema = new mongoose.Schema({
    username: String,
    password: String,
});
const SuperAdmin = mongoose.models.SuperAdmin || mongoose.model('SuperAdmin', superAdminSchema);


// Admin Schema
const adminSchema = new mongoose.Schema({
    name: String,
    phone: String,
    email: String,
    password: String,
    profilePic: String,
    adminId: String,
    isDisabled: { type: Boolean, default: false },
});
const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);


// Create a default superadmin if not exists
const initSuperAdmin = async () => {
    const existing = await SuperAdmin.findOne({ username: 'superadmin' });
    if (!existing) {
        const hashed = await bcrypt.hash('superadmin', 10);
        await SuperAdmin.create({ username: 'superadmin', password: hashed });
        console.log('Default SuperAdmin created.');
    }
};
initSuperAdmin();

// Super Admin Login
app.post('/superadmin/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await SuperAdmin.findOne({ username });
    if (!user) return res.status(401).json({ msg: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ msg: 'Invalid credentials' });

    res.status(200).json({ msg: 'Login successful' });
});

// Register Admin
app.post('/superadmin/registerAdmin', upload.single('profilePic'), async (req, res) => {
    const { name, phone, email, password, adminId } = req.body;
    const profilePic = req.file ? req.file.filename : '';

    const existing = await Admin.findOne({ phone });
    if (existing) return res.status(400).json({ msg: 'Admin already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({
        name,
        phone,
        email,
        password: hashed,
        profilePic,
        adminId,
    });

    await newAdmin.save();
    res.status(201).json({ msg: 'Admin registered' });
});

// Get All Admins
app.get('/superadmin/getAdmins', async (req, res) => {
    const admins = await Admin.find();
    res.json(admins);
});

// Disable Admin
app.post('/superadmin/disableAdmin', async (req, res) => {
    const { phone } = req.body;
    await Admin.updateOne({ phone }, { $set: { isDisabled: true } });
    res.json({ msg: 'Admin disabled' });
});

// Enable Admin
app.post('/superadmin/enableAdmin', async (req, res) => {
    const { phone } = req.body;
    await Admin.updateOne({ phone }, { $set: { isDisabled: false } });
    res.json({ msg: 'Admin enabled' });
});

// Delete Admin
app.delete('/superadmin/deleteAdmin', async (req, res) => {
    const { phone } = req.body;
    const admin = await Admin.findOne({ phone });
    if (admin && admin.profilePic) {
        const filePath = path.join(__dirname, '../uploads', admin.profilePic);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await Admin.deleteOne({ phone });
    res.json({ msg: 'Admin deleted' });
});

app.listen(PORT, () => console.log(`SuperAdmin Server running on http://localhost:${PORT}`));
