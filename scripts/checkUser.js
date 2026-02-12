import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const checkUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if the user exists
    const userEmail = 'skylabel@gmx.com';
    const user = await User.findOne({ email: userEmail });
    
    if (user) {
      console.log('User found:');
      console.log('- ID:', user._id);
      console.log('- Username:', user.username);
      console.log('- Email:', user.email);
      console.log('- Created at:', user.createdAt);
      console.log('- Updated at:', user.updatedAt);
      
      // Note: We can't see the actual password due to hashing
      console.log('- Password is hashed (length):', user.password.length);
    } else {
      console.log('User with email', userEmail, 'not found in the database');
    }

  } catch (error) {
    console.error('Error checking user:', error);
  } finally {
    await mongoose.disconnect();
  }
};

checkUser();