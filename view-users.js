const path = require('path');
require(path.join(__dirname, 'backend/node_modules/mongoose'));
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./backend/src/config/db');

require('./backend/src/models/Permission');
require('./backend/src/models/Role');
const User = require('./backend/src/models/User');

const showUsers = async () => {
  try {
    await connectDB();
    const users = await User.find()
      .populate({
        path: 'role',
        populate: { path: 'permissions' },
      })
      .sort({ createdAt: -1 });

    console.log('\n=== User Database ===\n');
    console.log(`Total users: ${users.length}\n`);

    users.forEach((u) => {
      const roleName = u.role ? u.role.name : 'N/A';
      const permissions = u.role && u.role.permissions
        ? u.role.permissions.map((p) => p.name).join(', ')
        : 'N/A';
      console.log(`ID: ${u._id}`);
      console.log(`Username: ${u.username}`);
      console.log(`Email: ${u.email}`);
      console.log(`Role: ${roleName}`);
      console.log(`Active: ${u.isActive}`);
      console.log(`Permissions: ${permissions}`);
      console.log(`Created: ${u.createdAt}`);
      console.log('----------------------------');
    });

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

showUsers();
