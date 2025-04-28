// // models/Admin.js
// const mongoose = require('mongoose');

// // Define the Admin schema
// const adminSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   phone: { type: String, required: true },
//   password: { type: String, required: true },
//   active: { type: Boolean, default: true }, // Optional field for account status
//   profilePhoto: { type: String, required: true }, // Optional field for profile photo
//   adminId: { type: String, unique: true, required: true },
//   // Add any other fields you need
// });

// // Register the Admin schema as a model
// const Admin = mongoose.model('Admin', adminSchema);

// module.exports = Admin;



const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    name: String,
    phone: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    profilePhoto: String,
    password: { type: String, required: true },
    active: { type: Boolean, default: true },
    registeredAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Admin', adminSchema);