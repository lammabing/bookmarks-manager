import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Find the user with email 'skylabel@gmx.com'
      const user = await User.findOne({ email: 'skylabel@gmx.com' });
      
      if (!user) {
        console.log('User with email skylabel@gmx.com not found');
        // Let's check all users to see what's available
        const allUsers = await User.find({});
        console.log('All users in database:');
        allUsers.forEach(u => {
          console.log(`- Username: ${u.username}, Email: ${u.email}, ID: ${u._id}`);
        });
      } else {
        console.log('User found:');
        console.log(`- Username: ${user.username}`);
        console.log(`- Email: ${user.email}`);
        console.log(`- ID: ${user._id}`);
        console.log(`- Has password hash: ${!!user.password}`);
        
        // Test password validation (we can't test without knowing the actual password)
        console.log('\nThe user exists in the database.');
        console.log('If you are unable to login, it might be due to:');
        console.log('1. Incorrect password');
        console.log('2. Account may be disabled');
        console.log('3. Possible issue with JWT secret in .env file');
      }
      
      mongoose.disconnect();
    } catch (error) {
      console.error('Error during user lookup:', error);
      mongoose.disconnect();
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });