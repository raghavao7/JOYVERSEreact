// createSuperAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const superAdminSchema = new mongoose.Schema({
  email: String,
  password: String
});
const SuperAdmin = mongoose.model('SuperAdmin', superAdminSchema);

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const hashedPassword = await bcrypt.hash('Project_360', 10);

    // Create the super admin with this email & password
    await SuperAdmin.create({
      email: 'raghavakoppuravuri007@gmail.com',
      password: hashedPassword
    });

    console.log("✅ Super admin created");
    mongoose.disconnect();
  })
  .catch(err => console.error(err));
