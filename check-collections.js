import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function checkAllCollections() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all collections in the database
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`Found ${collections.length} collections:`);
    
    for (const collection of collections) {
      console.log(`- Collection: ${collection.name}`);
      
      // Count documents in each collection
      const count = await mongoose.connection.collection(collection.name).countDocuments();
      console.log(`  Documents: ${count}`);
      
      // If there are documents, show a sample
      if (count > 0) {
        const sample = await mongoose.connection.collection(collection.name).findOne();
        console.log(`  Sample document:`, JSON.stringify(sample, null, 2));
      }
      console.log('');
    }
  } catch (error) {
    console.error('Error checking collections:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the function
checkAllCollections();