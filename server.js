import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/users.js';
import bookmarkRoutes from './routes/bookmarks.js';
import tagRoutes from './routes/tags.js'; // Import the new tags router
import bookmarkExtensionRoutes from './routes/bookmarkExtensions.js';
import folderRoutes from './routes/folders.js';

// Load environment variables
dotenv.config();

// Validate required environment variables
if (!process.env.MONGODB_URI) {
  console.error('Error: MONGODB_URI environment variable is required');
  console.error('Please create a .env file with MONGODB_URI set');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('Error: JWT_SECRET environment variable is required');
  process.exit(1);
}

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5015;

// Middleware
app.use(cors({
  origin: 'http://localhost:5170',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/tags', tagRoutes); // Add the tags routes
app.use('/api', bookmarkExtensionRoutes);
app.use('/api/folders', folderRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      // Add explicit garbage collection hint
      if (global.gc) {
        setInterval(() => global.gc(), 30000); // Run GC every 30 seconds
      }
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});
