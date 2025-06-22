import mongoose from 'mongoose';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const connectionString = 'mongodb://localhost:27017/bookmarking-app';

async function resetPassword(username, newPassword) {
  try {
    await mongoose.connect(connectionString);
    console.log('Connected to MongoDB');

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password for the specified user
    const result = await User.updateOne(
      { username },
      { $set: { password: hashedPassword } }
    );

    if (result.matchedCount === 0) {
      throw new Error(`User "${username}" not found`);
    }

    console.log(`Successfully updated password for user '${username}'`);
    mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

// Check if both arguments are provided
if (process.argv.length < 4) {
  console.error('Error: Username and password arguments are required');
  console.log('Usage: node reset-password-of-user.js <username> <newPassword>');
  process.exit(1);
}

const username = process.argv[2];
const newPassword = process.argv[3];
resetPassword(username, newPassword);