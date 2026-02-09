import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

// Load environment variables
dotenv.config();

async function updateUserPasswordDirectly() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the user by email
    const user = await User.findOne({ email: 'skylabel@gmx.com' });

    if (!user) {
      console.log('User skylabel@gmx.com not found in database');
      return;
    }

    // Hash the new password 'h0ngk0ng'
    const salt = await bcrypt.genSalt(10);
    const newPassword = 'h0ngk0ng';
    console.log(`Setting password to: ${newPassword}`);
    
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    console.log(`Generated hash: ${hashedPassword}`);

    // Update the user's password directly using findOneAndUpdate to bypass pre-save hooks
    const result = await User.findOneAndUpdate(
      { email: 'skylabel@gmx.com' },
      { $set: { password: hashedPassword } },
      { new: true, runValidators: false } // runValidators: false to bypass the pre-save hook
    );

    if (result) {
      console.log(`Password updated for user: ${result.email} (${result.username})`);
      
      // Verify the new password works by creating a fresh instance
      const updatedUser = await User.findById(result._id);
      const isValid = await bcrypt.compare('h0ngk0ng', updatedUser.password);
      console.log(`Verification - Password 'h0ngk0ng' matches hash: ${isValid}`);
    } else {
      console.log('Failed to update user password');
    }
  } catch (error) {
    console.error('Error updating password:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the function
updateUserPasswordDirectly();