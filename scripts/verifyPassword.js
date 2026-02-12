import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const verifyPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the user
    const userEmail = 'skylabel@gmx.com';
    const user = await User.findOne({ email: userEmail });
    
    if (user) {
      console.log('User found, verifying password...');
      
      // Test the provided password
      const providedPassword = 'h0ngk0ng';
      const isMatch = await bcrypt.compare(providedPassword, user.password);
      
      console.log('Provided password:', providedPassword);
      console.log('Password matches:', isMatch);
      
      if (!isMatch) {
        console.log('The password in the database does not match the provided password.');
        console.log('Possible reasons:');
        console.log('1. The password was entered incorrectly during registration');
        console.log('2. The password was changed later');
        console.log('3. There was an issue during the initial registration process');
      } else {
        console.log('Password matches correctly!');
      }
    } else {
      console.log('User with email', userEmail, 'not found in the database');
    }

  } catch (error) {
    console.error('Error verifying password:', error);
  } finally {
    await mongoose.disconnect();
  }
};

verifyPassword();