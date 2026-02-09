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
      // Check if user already exists
      let user = await User.findOne({ email: 'skylabel@gmx.com' });

      if (!user) {
        // Create a new user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('defaultPassword123', salt); // You should change this password later
        
        user = new User({
          username: 'skylabel',
          email: 'skylabel@gmx.com',
          password: hashedPassword
        });

        await user.save();
        console.log('New user created successfully!');
        console.log(`Username: ${user.username}`);
        console.log(`Email: ${user.email}`);
        console.log(`ID: ${user._id}`);
        console.log('\nIMPORTANT: Please change the default password after logging in.');
      } else {
        console.log('User already exists in the database.');
        console.log(`Username: ${user.username}`);
        console.log(`Email: ${user.email}`);
        console.log(`ID: ${user._id}`);
      }

      mongoose.disconnect();
    } catch (error) {
      console.error('Error during user creation:', error);
      mongoose.disconnect();
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });