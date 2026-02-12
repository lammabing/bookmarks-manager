import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

// Load environment variables
dotenv.config();

async function updateUserPassword() {
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
    console.log(`Original password: ${newPassword}`);
    
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    console.log(`Generated hash: ${hashedPassword}`);

    // Test the hash before saving
    const isValidBeforeSave = await bcrypt.compare('h0ngk0ng', hashedPassword);
    console.log(`Hash verification before save: ${isValidBeforeSave}`);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    console.log(`Password updated for user: ${user.email} (${user.username})`);
    console.log(`New password hash in DB: ${user.password}`);
    
    // Verify the new password works after saving
    const isValidAfterSave = await bcrypt.compare('h0ngk0ng', user.password);
    console.log(`Verification after save - Password 'h0ngk0ng' matches hash: ${isValidAfterSave}`);
  } catch (error) {
    console.error('Error updating password:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the function
updateUserPassword();