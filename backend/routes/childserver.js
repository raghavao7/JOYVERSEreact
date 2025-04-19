require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.CHILD_PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('✅ MongoDB connected for Child Server'))
    .catch(err => console.log('❌ MongoDB connection error (Child Server):', err));

// Define Schema & Model (Keep the same schema)
const ChildSchema = new mongoose.Schema({
    name: String,
    phone: { type: String, unique: true, required: true },
    userId: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    code: { type: String, unique: true },
    registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }, // Reference to the Admin who registered
    registeredAt: { type: Date, default: Date.now }
});

const Child = mongoose.model('Child', ChildSchema);

// 📌 **Authenticate Child (Login)**
app.post('/login', async (req, res) => {
    const { userId, password } = req.body; // Only userId and password for login
    console.log("📩 [Child Server] Received Login Data:", req.body);

    if (!userId || !password) {
        console.log("⚠️ [Child Server] Missing fields for login");
        return res.status(400).json({ message: '⚠️ User ID and password are required' });
    }

    try {
        console.log(`🔍 [Child Server] Searching for User ID: ${userId}`);

        const child = await Child.findOne({ userId: userId.toString() });

        if (!child) {
            console.log("❌ [Child Server] No matching child found with this User ID!");
            return res.status(401).json({ message: 'Invalid User ID or password' });
        }

        console.log("✅ [Child Server] Found Child:", child);

        const isMatch = await bcrypt.compare(password, child.password);
        console.log("🔑 [Child Server] Password Match:", isMatch);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid User ID or password' });
        }

        const token = jwt.sign(
            { userId: child.userId, name: child.name },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log("✅ [Child Server] Login successful for User ID:", userId);
        res.json({ message: '✅ Login successful', token });

    } catch (error) {
        console.error('❌ [Child Server] Login error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.listen(PORT, () => console.log(`🚀 Child Server running on port ${PORT}`));