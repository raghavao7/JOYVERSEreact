// require('dotenv').config(); // .env lo unna environment variables ni load chesthundi
// const express = require('express'); // Express framework ni import chesthunnam
// const mongoose = require('mongoose'); // MongoDB connect cheyyadaniki
// const jwt = require('jsonwebtoken'); // JWT tokens generate cheyyadaniki (login security)
// const bcrypt = require('bcryptjs'); // Password hash cheyyadaniki
// const cors = require('cors'); // Cross-origin requests allow cheyyadaniki
// const bodyParser = require('body-parser'); // Request body parse cheyyadaniki
// const { Server } = require('socket.io'); // Real-time communication ki
// const http = require('http'); // HTTP server create cheyyadaniki
// const crypto = require('crypto'); // Random unique codes generate cheyyadaniki

// const app = express();
// const server = http.createServer(app); // HTTP server create chesthunnam
// const io = new Server(server, { cors: { origin: "*" } }); // Socket.io setup chesthunnam with CORS

// // Middlewares
// app.use(cors()); // Any frontend nunchi access cheyyadaniki allow
// app.use(bodyParser.json()); // JSON body ni parse chesthundi

// // MongoDB connection
// mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => console.log('✅ MongoDB connected')) // Success message
//     .catch(err => console.log('❌ MongoDB connection error:', err)); // Error ayithe

// // Schema define chesthunnam for Child registration
// const ChildSchema = new mongoose.Schema({
//     name: String, // Peruvu
//     phone: { type: String, unique: true, required: true }, // Phone unique & required
//     userId: { type: String, unique: true, required: true }, // userId unique & required
//     password: { type: String, required: true }, // Password
//     code: { type: String, unique: true }, // Unique code for child
//     registeredAt: { type: Date, default: Date.now } // Register time
// });

// // Save chese mundu code lekapothe generate cheyyadam
// ChildSchema.pre('save', async function(next) {
//     if (!this.code) {
//         this.code = generateUniqueCode(); // Code generate cheyyadam
//     }
//     next();
// });

// const Child = mongoose.model('Child', ChildSchema); // Model create cheyyadam

// // Unique code generate cheyyadam ki function
// function generateUniqueCode() {
//     return crypto.randomBytes(8).toString('hex'); // 16-char random hex string
// }

// // Admin panel nunchi child register cheyyadam
// app.post('/register', async (req, res) => {
//     try {
//         console.log("📩 Received Registration Data:", req.body);

//         const { name, phone, userId, password } = req.body;

//         // Check cheyyadam - empty fields unnaya
//         if (!name || !phone || !userId || !password) {
//             console.log("⚠️ Missing fields");
//             return res.status(400).json({ message: 'All fields are required' });
//         }

//         // Check for existing phone/userId
//         const existingChild = await Child.findOne({ $or: [{ phone }, { userId }] });
//         if (existingChild) {
//             return res.status(400).json({ message: '❌ Child with this phone or user ID already registered' });
//         }

//         const hashedPassword = await bcrypt.hash(password, 10); // Password ni hash cheyyadam
//         const newChild = new Child({ name, phone, userId, password: hashedPassword });

//         await newChild.save(); // MongoDB lo save cheyyadam

//         console.log("✅ Child registered successfully:", newChild);

//         io.emit("newChild", newChild); // Realtime update ki socket emit

//         res.json({ message: '✅ Child registered successfully', child: newChild });

//     } catch (error) {
//         console.error("❌ Error in /register:", error);
//         if (error.code === 11000) {
//             // Duplicate error (phone/userId/code)
//             return res.status(400).json({ message: '❌ Registration failed: Duplicate entry for phone, user ID, or code.' });
//         }
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });

// // Login API
// app.post('/login', async (req, res) => {
//     const { name, userId, password } = req.body;
//     console.log("📩 Received Login Data:", req.body);

//     if (!name || !userId || !password) {
//         console.log("⚠️ Missing fields");
//         return res.status(400).json({ message: '⚠️ All fields are required' });
//     }

//     try {
//         // Find cheyyadam case-insensitive name tho
//         const child = await Child.findOne({
//             name: { $regex: new RegExp(`^${name}$`, "i") },
//             userId: userId.toString()
//         });

//         if (!child) {
//             console.log("❌ No matching child found!");
//             return res.status(401).json({ message: 'Invalid name or user ID' });
//         }

//         console.log("✅ Found Child:", child);

//         const isMatch = await bcrypt.compare(password, child.password); // Password match cheyyadam
//         console.log("🔑 Password Match:", isMatch);

//         if (!isMatch) {
//             return res.status(401).json({ message: 'Invalid password' });
//         }

//         // JWT token create cheyyadam
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

// // Last 10 registered children ni fetch cheyyadam
// app.get('/children', async (req, res) => {
//     try {
//         const children = await Child.find().sort({ registeredAt: -1 }).limit(10);
//         res.json(children);
//     } catch (error) {
//         console.error("❌ Error fetching children:", error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });

// // Socket.io connection
// io.on("connection", (socket) => {
//     console.log("🟢 Client connected");

//     // Frontend nunchi "fetchChildren" anaga, latest list ni pumpinchadam
//     socket.on("fetchChildren", async () => {
//         const children = await Child.find().sort({ registeredAt: -1 }).limit(10);
//         io.emit("updateChildren", children); // Emit to all
//     });

//     socket.on("disconnect", () => console.log("🔴 Client disconnected"));
// });

// const path = require('path');

// // Static files serve cheyyadam (like public/error.html)
// app.use(express.static('public'));

// // Global error handler - server crash ayithe error page chupinchadam
// app.use((err, req, res, next) => {
//     console.error('Server Error:', err);
//     res.status(500).sendFile(path.join(__dirname, 'public', 'error.html'));
// });

// // Server start cheyyadam
// const PORT = process.env.PORT || 3000;
// server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


























    const express = require('express');
    const mongoose = require('mongoose');
    const cors = require('cors');
    require('dotenv').config();

    const superadminRoutes = require('./routes/superadmin');

    const app = express();
    app.use(cors());
    app.use(express.json());

    mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log("✅ MongoDB connected"))
        .catch((err) => console.error("❌ MongoDB error:", err));

    app.use('/superadmin', superadminRoutes); // ✅ works now

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));





























    // require('dotenv').config();
    // const express = require('express');
    // const mongoose = require('mongoose');
    // const jwt = require('jsonwebtoken');
    // const bcrypt = require('bcryptjs');
    // const cors = require('cors');
    // const bodyParser = require('body-parser');
    // const { Server } = require('socket.io');
    // const http = require('http');
    // const crypto = require('crypto');
    // const path = require('path');
    // const superadminRoutes = require('./routes/superadmin');
    // const Child = require('./models/Child');
    
    // const app = express();
    // const server = http.createServer(app);
    // const io = new Server(server, { cors: { origin: "*" } });
    
    // app.use(cors());
    // app.use(bodyParser.json());
    // app.use(express.static(path.join(__dirname, 'public')));
    // app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));
    
    // mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    //     .then(() => console.log('✅ MongoDB connected'))
    //     .catch(err => console.log('❌ MongoDB connection error:', err));
    
    // // Make io available to routes
    // app.use((req, res, next) => {
    //     req.app.set('io', io);
    //     next();
    // });
    
    // // SuperAdmin routes
    // app.use('/superadmin', superadminRoutes);
    
    // // Child registration
    // app.post('/register', async (req, res) => {
    //     try {
    //         console.log("📩 Received Registration Data:", req.body);
    //         const { name, phone, userId, password } = req.body;
    
    //         if (!name || !phone || !userId || !password) {
    //             console.log("⚠️ Missing fields");
    //             return res.status(400).json({ message: 'All fields are required' });
    //         }
    
    //         const existingChild = await Child.findOne({ $or: [{ phone }, { userId }] });
    //         if (existingChild) {
    //             return res.status(400).json({ message: '❌ Child with this phone or user ID already registered' });
    //         }
    
    //         const hashedPassword = await bcrypt.hash(password, 10);
    //         const newChild = new Child({ name, phone, userId, password: hashedPassword });
    
    //         await newChild.save();
    //         console.log("✅ Child registered successfully:", newChild);
    
    //         io.emit("newChild", newChild);
    //         res.json({ message: '✅ Child registered successfully', child: newChild });
    //     } catch (error) {
    //         console.error("❌ Error in /register:", error);
    //         if (error.code === 11000) {
    //             return res.status(400).json({ message: '❌ Registration failed: Duplicate entry for phone, user ID, or code.' });
    //         }
    //         res.status(500).json({ message: 'Internal Server Error' });
    //     }
    // });
    
    // // Child login
    // app.post('/login', async (req, res) => {
    //     const { name, userId, password } = req.body;
    //     console.log("📩 Received Login Data:", req.body);
    
    //     if (!name || !userId || !password) {
    //         console.log("⚠️ Missing fields");
    //         return res.status(400).json({ message: '⚠️ All fields are required' });
    //     }
    
    //     try {
    //         const child = await Child.findOne({
    //             name: { $regex: new RegExp(`^${name}$`, "i") },
    //             userId: userId.toString()
    //         });
    
    //         if (!child) {
    //             console.log("❌ No matching child found!");
    //             return res.status(401).json({ message: 'Invalid name or user ID' });
    //         }
    
    //         console.log("✅ Found Child:", child);
    
    //         const isMatch = await bcrypt.compare(password, child.password);
    //         console.log("🔑 Password Match:", isMatch);
    
    //         if (!isMatch) {
    //             return res.status(401).json({ message: 'Invalid password' });
    //         }
    
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
    
    // // Fetch last 10 registered children
    // app.get('/children', async (req, res) => {
    //     try {
    //         const children = await Child.find().sort({ registeredAt: -1 }).limit(10);
    //         res.json(children);
    //     } catch (error) {
    //         console.error("❌ Error fetching children:", error);
    //         res.status(500).json({ message: 'Internal Server Error' });
    //     }
    // });
    
    // // Socket.io connection
    // io.on("connection", (socket) => {
    //     console.log("🟢 Client connected");
    
    //     socket.on("fetchChildren", async () => {
    //         const children = await Child.find().sort({ registeredAt: -1 }).limit(10);
    //         io.emit("updateChildren", children);
    //     });
    
    //     socket.on("disconnect", () => console.log("🔴 Client disconnected"));
    // });
    
    // // Global error handler
    // app.use((err, req, res, next) => {
    //     console.error('Server Error:', err);
    //     res.status(500).sendFile(path.join(__dirname, 'public', 'error.html'));
    // });
    
    // const PORT = process.env.PORT || 3000;
    // server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));