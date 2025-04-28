// const express = require('express');
// const router = express.Router();
// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// const Child = mongoose.model('Child');

// // Child Login
// router.post('/login', async (req, res) => {
//   const { name, userId, password } = req.body;
//   console.log('📩 Received Login Data:', req.body);

//   if (!name || !userId || !password) {
//     console.log('⚠️ Missing fields');
//     return res.status(400).json({ message: 'All fields are required' });
//   }

//   try {
//     const child = await Child.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') }, userId });
//     if (!child) {
//       console.log('❌ No matching child found!');
//       return res.status(401).json({ message: 'Invalid name or user ID' });
//     }
//     if (!child.active) {
//       console.log('❌ Child account disabled');
//       return res.status(403).json({ message: 'Account is disabled' });
//     }

//     const isMatch = await bcrypt.compare(password, child.password);
//     if (!isMatch) {
//       console.log('❌ Invalid password');
//       return res.status(401).json({ message: 'Invalid password' });
//     }

//     const token = jwt.sign(
//       { userId: child.userId, name: child.name, role: 'child' },
//       process.env.JWT_SECRET,
//       { expiresIn: '2h' }
//     );
//     console.log('✅ Login successful');
//     res.json({ message: 'Login successful', token });
//   } catch (error) {
//     console.error('❌ Login error:', error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Child = require('../models/Child');

// Child Login
router.post('/login', async (req, res) => {
  const { childName, userId, password } = req.body;
  if (!childName || !userId || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const child = await Child.findOne({
      childName: { $regex: new RegExp(`^${childName}$`, 'i') },
      userId,
    });
    if (!child || !child.isActive) {
      return res.status(401).json({ message: 'Invalid credentials or account disabled' });
    }

    const isMatch = await bcrypt.compare(password, child.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

    const token = jwt.sign(
      { userId: child.userId, childName: child.childName },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({ message: 'Login successful', token, userId: child.userId });
  } catch (err) {
    console.error('❌ Child login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save Emotion Data
router.post('/save-emotion', async (req, res) => {
  const { userId, emotion, question } = req.body;
  if (!userId || !emotion || !question) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const child = await Child.findOne({ userId });
    if (!child || !child.isActive) {
      return res.status(404).json({ message: 'Child not found or disabled' });
    }

    child.emotionHistory.push({ emotion, question, timestamp: new Date() });
    await child.save();

    req.app.get('io').emit('emotionUpdate', {
      parentId: child.parentId,
      userId,
      emotion,
      question,
      timestamp: new Date(),
    });
    res.json({ message: 'Emotion saved successfully' });
  } catch (err) {
    console.error('❌ Error saving emotion:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Emotion Trends
router.get('/emotion-trends/:userId', async (req, res) => {
  try {
    const child = await Child.findOne({ userId: req.params.userId });
    if (!child) return res.status(404).json({ message: 'Child not found' });
    res.json(child.emotionHistory);
  } catch (err) {
    console.error('❌ Error fetching emotion trends:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save Game Report
router.post('/save-game', async (req, res) => {
  const { userId, score, emotions, question, isCorrect } = req.body;
  if (!userId || score === undefined || !question || isCorrect === undefined) {
    return res.status(400).json({ message: 'userId, score, question, and isCorrect are required' });
  }

  try {
    const child = await Child.findOne({ userId });
    if (!child || !child.isActive) {
      return res.status(404).json({ message: 'Child not found or disabled' });
    }

    child.gameReports.push({ score, emotions, question, isCorrect, completedAt: new Date() });
    await child.save();

    req.app.get('io').emit('gameReportUpdate', {
      parentId: child.parentId,
      userId,
      score,
      emotions,
      question,
      isCorrect,
      completedAt: new Date(),
    });
    res.json({ message: 'Game report saved successfully' });
  } catch (err) {
    console.error('❌ Error saving game report:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Game Reports
router.get('/game-reports/:userId', async (req, res) => {
  try {
    const child = await Child.findOne({ userId: req.params.userId });
    if (!child) return res.status(404).json({ message: 'Child not found' });
    res.json(child.gameReports);
  } catch (err) {
    console.error('❌ Error fetching game reports:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;