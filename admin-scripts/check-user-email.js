import mongoose from 'mongoose';
import User from '../models/User.js';

const connectionString = 'mongodb://localhost:27017/bookmarking-app';

async function checkUserEmail() {
  try {
    await mongoose.connect(connectionString);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ username: 'skylabel' });
    if (!user) {
      console.log('User skylabel not found');
      return;
    }

    console.log(`Username: ${user.username}`);
    console.log(`Email: ${user.email}`);
    console.log(`User ID: ${user._id}`);

    mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkUserEmail();