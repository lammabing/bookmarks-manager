import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

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

    console.log(`Found user: ${user.email} (${user.username})`);
    console.log(`User ID: ${user._id}`);
    console.log(`Current password hash: ${user.password}`);

    // Hash the new password
    const newPassword = 'h0ngk0ng';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    console.log(`New hash for 'h0ngk0ng': ${hashedPassword}`);

    // Test if the new hash would validate the password
    const isValid = await bcrypt.compare('h0ngk0ng', hashedPassword);
    console.log(`New hash validates 'h0ngk0ng': ${isValid}`);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    // Verify the update worked by checking again
    const updatedUser = await User.findById(user._id);
    const verification = await bcrypt.compare('h0ngk0ng', updatedUser.password);
    console.log(`Verification after update: ${verification}`);
    
    if (verification) {
      console.log('✅ Password successfully updated for user:', user.email);
      console.log('✅ New password set to: h0ngk0ng');
    } else {
      console.log('❌ Password update failed');
    }
  } catch (error) {
    console.error('Error updating password:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the function
updateUserPassword();