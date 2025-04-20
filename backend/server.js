
// require('dotenv').config();
// const express = require('express');
// const mongoose = require('mongoose');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const { Server } = require('socket.io');
// const http = require('http');
// const crypto = require('crypto'); // For generating unique codes

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, { cors: { origin: "*" } });

// app.use(cors());
// app.use(bodyParser.json());

// // Connect to MongoDB
// mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => console.log('✅ MongoDB connected'))
//     .catch(err => console.log('❌ MongoDB connection error:', err));

// // Define Schema & Model
// const ChildSchema = new mongoose.Schema({
//     name: String,
//     phone: { type: String, unique: true, required: true }, // Added unique and required for phone
//     userId: { type: String, unique: true, required: true }, // Added unique and required for userId
//     password: { type: String, required: true },
//     code: { type: String, unique: true }, // Added unique code field
//     registeredAt: { type: Date, default: Date.now }
// });

// // Middleware to generate unique code before saving if it doesn't exist
// ChildSchema.pre('save', async function(next) {
//     if (!this.code) {
//         this.code = generateUniqueCode();
//     }
//     next();
// });

// const Child = mongoose.model('Child', ChildSchema);

// // Function to generate a unique code (you might want a more robust implementation)
// function generateUniqueCode() {
//     return crypto.randomBytes(8).toString('hex'); // Example: generates a 16-character hex string
// }

// // 📌 **Register Child (Admin Panel)**
// app.post('/register', async (req, res) => {
//     try {
//         console.log("📩 Received Registration Data:", req.body);

//         const { name, phone, userId, password } = req.body;
//         if (!name || !phone || !userId || !password) {
//             console.log("⚠️ Missing fields");
//             return res.status(400).json({ message: 'All fields are required' });
//         }

//         // Check if the phone number or userId is already registered (using the unique index)
//         const existingChild = await Child.findOne({ $or: [{ phone }, { userId }] });
//         if (existingChild) {
//             return res.status(400).json({ message: '❌ Child with this phone or user ID already registered' });
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);
//         const newChild = new Child({ name, phone, userId, password: hashedPassword });

//         await newChild.save();

//         console.log("✅ Child registered successfully:", newChild);

//         // Emit event for real-time update
//         io.emit("newChild", newChild);

//         res.json({ message: '✅ Child registered successfully', child: newChild });

//     } catch (error) {
//         console.error("❌ Error in /register:", error);
//         if (error.code === 11000) {
//             // Handle duplicate key error specifically (e.g., for the newly added 'code' field)
//             return res.status(400).json({ message: '❌ Registration failed: Duplicate entry for phone, user ID, or code.' });
//         }
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });

// // 📌 **Authenticate Child (Login)**
// app.post('/login', async (req, res) => {
//     const { name, userId, password } = req.body;
//     console.log("📩 Received Login Data:", req.body); // 🔥 Log input

//     if (!name || !userId || !password) {
//         console.log("⚠️ Missing fields");
//         return res.status(400).json({ message: '⚠️ All fields are required' });
//     }

//     try {
//         console.log(`🔍 Searching for: Name = ${name}, User ID = ${userId}`);

//         // Find child in database (case-insensitive name and exact userId)
//         const child = await Child.findOne({
//             name: { $regex: new RegExp(`^${name}$`, "i") },
//             userId: userId.toString()
//         });

//         if (!child) {
//             console.log("❌ No matching child found!");
//             return res.status(401).json({ message: 'Invalid name or user ID' });
//         }

//         console.log("✅ Found Child:", child);

//         // Compare password
//         const isMatch = await bcrypt.compare(password, child.password);
//         console.log("🔑 Password Match:", isMatch);

//         if (!isMatch) {
//             return res.status(401).json({ message: 'Invalid password' });
//         }

//         // Generate JWT token
//         const token = jwt.sign(
//             { userId: child.userId, name: child.name },
//             process.env.JWT_SECRET,
//             { expiresIn: '1h' }
//         );

//         console.log("✅ Login successful!");
//         res.json({ message: '✅ Login successful', token });

//     } catch (error) {
//         console.error('❌ Login error:', error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });


// // 📌 **Get Recently Registered Children**
// app.get('/children', async (req, res) => {
//     try {
//         const children = await Child.find().sort({ registeredAt: -1 }).limit(10);
//         res.json(children);
//     } catch (error) {
//         console.error("❌ Error fetching children:", error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });

// // 📌 **Real-Time Socket.io Connection**
// io.on("connection", (socket) => {
//     console.log("🟢 Client connected");

//     socket.on("fetchChildren", async () => {
//         const children = await Child.find().sort({ registeredAt: -1 }).limit(10);
//         io.emit("updateChildren", children);
//     });

//     socket.on("disconnect", () => console.log("🔴 Client disconnected"));
// });
// const path = require('path');

// // Serve Static Files
// app.use(express.static('public'));

// // Global Error Handler - Redirect to Error Page
// app.use((err, req, res, next) => {
//     console.error('Server Error:', err);
//     res.status(500).sendFile(path.join(__dirname, 'public', 'error.html'));
// });


// // 📌 **Start Server**
// const PORT = process.env.PORT || 3000;
// server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

























    // const express = require('express');
    // const mongoose = require('mongoose');
    // const cors = require('cors');
    // require('dotenv').config();

    // const superadminRoutes = require('./routes/superadmin');

    // const app = express();
    // app.use(cors());
    // app.use(express.json());

    // mongoose.connect(process.env.MONGO_URI)
    //     .then(() => console.log("✅ MongoDB connected"))
    //     .catch((err) => console.error("❌ MongoDB error:", err));

    // app.use('/superadmin', superadminRoutes); // ✅ works now

    // const PORT = process.env.PORT || 3000;
    // app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));





























    const express = require('express');
    const mongoose = require('mongoose');
    const dotenv = require('dotenv');
    const helmet = require('helmet');
    const rateLimit = require('express-rate-limit');
    const adminRoutes = require('./routes/adminserver');
    const childRoutes = require('./routes/childserver');
    const superadminRoutes = require('./routes/superadmin');
    
    // Load environment variables
    dotenv.config();
    
    const app = express();
    
    // Middleware
    app.use(helmet());
    app.use(express.json());
    app.use(
      rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests per windowMs
      })
    );
    
    // MongoDB Connection
    mongoose
      .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => console.log('✅ Connected to MongoDB'))
      .catch((err) => console.error('❌ MongoDB connection error:', err));
    
    // Routes
    app.use('/api/admin', adminRoutes);
    app.use('/api/child', childRoutes);
    app.use('/api/superadmin', superadminRoutes);
    
    // Error Handling Middleware
    app.use((err, req, res, next) => {
      console.error('❌ Server Error:', err);
      res.status(500).json({ message: 'Internal Server Error' });
    });
    
    // Start Server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));