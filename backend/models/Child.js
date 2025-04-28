// const mongoose = require('mongoose');

// const ChildSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, unique: true, required: true },
//   userId: { type: String, unique: true, required: true, match: /^\d{6}$/ },
//   password: { type: String, required: true },
//   active: { type: Boolean, default: true },
//   registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
//   registeredAt: { type: Date, default: Date.now },
//   reports: [
//     {
//       emotion: { type: String, required: true },
//       score: { type: Number, required: true },
//       date: { type: Date, default: Date.now },
//     },
//   ],
// });

// // Generate unique 6-digit ID
// ChildSchema.pre('save', async function (next) {
//   if (!this.userId) {
//     let isUnique = false;
//     let attempts = 0;
//     const maxAttempts = 10;

//     while (!isUnique && attempts < maxAttempts) {
//       const id = Math.floor(100000 + Math.random() * 900000).toString();
//       const existing = await mongoose.model('Child').findOne({ userId: id });
//       if (!existing) {
//         this.userId = id;
//         isUnique = true;
//       }
//       attempts++;
//     }

//     if (!isUnique) {
//       return next(new Error('Failed to generate unique user ID after multiple attempts'));
//     }
//   }
//   next();
// });

// module.exports = mongoose.model('Child', ChildSchema);


const mongoose = require('mongoose');
const crypto = require('crypto');

const childSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, unique: true, required: true },
    userId: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    code: { type: String, unique: true },
    registeredAt: { type: Date, default: Date.now },
});

childSchema.pre('save', async function(next) {
    if (!this.code) {
        this.code = crypto.randomBytes(8).toString('hex');
    }
    next();
});

module.exports = mongoose.model('Child', childSchema);