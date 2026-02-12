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
      
      // Update the user's password using findByIdAndUpdate to ensure it's saved properly
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { password: hashedPassword },
        { new: true, runValidators: true }
      );
      
      console.log('Password successfully reset for user:', userEmail);
      console.log('Updated user ID:', updatedUser._id);
      
      // Verify the update worked
      const isMatch = await bcrypt.compare(newPassword, updatedUser.password);
      console.log('Verification - Password matches after update:', isMatch);
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