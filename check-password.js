import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

// Load environment variables
dotenv.config();

async function checkUserPassword() {
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
    
    // Test if the password 'h0ngk0ng' matches the hash
    const bcrypt = await import('bcryptjs');
    const isValid = await bcrypt.default.compare('h0ngk0ng', user.password);
    console.log(`Password 'h0ngk0ng' matches hash: ${isValid}`);
    
    // Test a few variations to troubleshoot
    const variations = [
      'h0ngk0ng',
      'h0ngk0ng\n',
      ' h0ngk0ng',
      'h0ngk0ng ',
      'H0ngk0ng',
      'hongkong'
    ];
    
    console.log('\nTesting variations:');
    for (const variation of variations) {
      const isValid = await bcrypt.default.compare(variation, user.password);
      console.log(`Password '${variation}' matches hash: ${isValid}`);
    }
  } catch (error) {
    console.error('Error checking password:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the function
checkUserPassword();