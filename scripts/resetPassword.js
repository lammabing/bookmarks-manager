import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const resetPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the user
    const userEmail = 'skylabel@gmx.com';
    const user = await User.findOne({ email: userEmail });
    
    if (user) {
      console.log('User found, resetting password...');
      
      // Hash the new password
      const newPassword = 'h0ngk0ng';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      // Update the user's password
      user.password = hashedPassword;
      await user.save();
      
      console.log('Password successfully reset for user:', userEmail);
      console.log('New password set to:', newPassword);
    } else {
      console.log('User with email', userEmail, 'not found in the database');
    }

  } catch (error) {
    console.error('Error resetting password:', error);
  } finally {
    await mongoose.disconnect();
  }
};

resetPassword();