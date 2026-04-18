import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

dotenv.config();

async function resetPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email: 'admin@example.com' });
    if (!user) {
      console.log('User admin@example.com not found');
      await mongoose.connection.close();
      return;
    }

    const newPassword = 'h0ngk0ng';
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('Generated new hash');

    // Update password directly without triggering pre-save hooks
    await User.findByIdAndUpdate(user._id, { 
      $set: { password: hashedPassword } 
    }, { bypassDocumentValidation: true });
    
    console.log(`Password updated for: ${user.email}`);

    // Verify by fetching fresh from DB
    const freshUser = await User.findById(user._id);
    const match = await bcrypt.compare(newPassword, freshUser.password);
    console.log(`Password verification: ${match ? 'SUCCESS' : 'FAILED'}`);

    if (match) {
      console.log('\nYou can now login with:');
      console.log(`  Email: admin@example.com`);
      console.log(`  Password: ${newPassword}`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

resetPassword();
