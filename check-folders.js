import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Folder from './models/Folder.js';

// Load environment variables
dotenv.config();

async function checkUserFolders() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find folders for the user
    const folders = await Folder.find({ owner: '6989ad5b56e3496aa27e0d29' }); // Using the user ID we know

    if (folders.length === 0) {
      console.log('No folders found for user skylabel@gmx.com');
    } else {
      console.log(`Found ${folders.length} folders for user skylabel@gmx.com:`);
      folders.forEach((folder, index) => {
        console.log(`${index + 1}. Name: ${folder.name} | ID: ${folder._id} | Parent: ${folder.parent || 'None'} | Created: ${folder.createdAt}`);
      });
    }
  } catch (error) {
    console.error('Error checking folders:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the function
checkUserFolders();