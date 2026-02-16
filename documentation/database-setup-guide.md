# Database Setup Guide

## Overview
This guide explains how the database setup works in the Bookmark Manager application and what you need to know as a new user.

## Automatic Database Setup

### What Happens During Setup
When you first run the application, several automatic processes occur:

1. **MongoDB Container Creation**: The `start-mongo.sh` script automatically creates a Docker container running MongoDB
2. **Schema Generation**: Mongoose ODM automatically creates the database schema based on the model definitions in the `models/` directory
3. **Collection Creation**: Collections (users, bookmarks, folders, tags) are created automatically when first accessed
4. **Index Setup**: Database indexes are created for optimal performance

### No Manual Database Work Required
Unlike traditional applications that require manual database setup, this application handles everything automatically:
- No need to install MongoDB separately (Docker handles this)
- No need to create databases or collections manually
- No need to define schemas or run migration scripts
- No need to worry about initial data population

## MongoDB Container Details

### Persistent Storage
- Data is stored in `~/mongodb` on your host machine
- This ensures your bookmarks and user data persist even if the Docker container is stopped or removed
- The data remains accessible across application restarts

### Configuration
The MongoDB container is configured with:
- Port mapping: 27017 (accessible at `mongodb://localhost:27017`)
- Volume mounting for persistent storage
- Automatic restart policy to ensure availability
- Adequate resources for typical usage

## Step-by-Step Setup Process

### 1. Prerequisites
Make sure you have:
- Node.js v20+ installed
- Docker installed and running
- Sufficient disk space for Docker containers

### 2. Clone and Prepare
```bash
git clone https://github.com/lammabing/bookmarking-app.git
cd bookmarking-app
npm install
cp .env\ copy .env
```

### 3. Configure Environment
Edit the `.env` file with your settings:
- Set `MONGODB_URI` (default: `mongodb://localhost:27017/bookmarking-app`)
- Generate and set `JWT_SECRET` (use `openssl rand -base64 32`)
- Set `VITE_API_BASE_URL` for production deployments

### 4. Start MongoDB
```bash
./start-mongo.sh
```
This script will:
- Verify Docker is running
- Create a MongoDB container if one doesn't exist
- Mount persistent storage at `~/mongodb`
- Wait for MongoDB to be ready before completing

### 5. Start the Application
```bash
npm run dev
```

## Troubleshooting Common Issues

### Docker Not Found
If you get "Docker is not installed" error:
1. Install Docker from https://docs.docker.com/get-docker/
2. Start the Docker service
3. Verify Docker is working: `docker --version`

### Port Already in Use
If MongoDB port (27017) is already in use:
1. Stop other MongoDB instances
2. Or change the port mapping in `start-mongo.sh` (not recommended)

### Permission Issues
If you encounter permission issues with the data directory:
1. Ensure your user has write access to `~/mongodb`
2. Or modify the volume path in `start-mongo.sh`

## Understanding the Database Schema

### Collections Created Automatically
The application automatically creates these collections when first accessed:

1. **users**: Stores user accounts (username, email, hashed password, timestamps)
2. **bookmarks**: Stores bookmark data (URL, title, description, tags, visibility, etc.)
3. **folders**: Stores folder hierarchy for organizing bookmarks
4. **tags**: Stores tag information for categorizing bookmarks

### Relationship Model
- One user can have many bookmarks, folders, and tags
- Bookmarks can belong to one folder (hierarchical structure)
- Bookmarks can have many tags, and tags can be applied to many bookmarks
- Folders can have parent-child relationships for nested organization

## Security Considerations

### Environment Variables
- Never commit your `.env` file to version control
- Store sensitive information like `JWT_SECRET` securely
- Use different secrets for development and production

### Database Access
- The MongoDB instance is only accessible locally (localhost)
- Authentication is handled through the application layer
- Data is encrypted at rest in the Docker volume

## Migration and Updates

### Schema Evolution
When the application updates and introduces schema changes:
1. Mongoose will automatically apply structural changes
2. Migration scripts (if needed) are included in the repository
3. Backups are recommended before major updates

### Backup Strategy
Regular backups are important for data protection:
- Use the included backup script: `npm run backup`
- Store backups in secure locations
- Test restoration procedures periodically

## Performance Notes

### Connection Pooling
The application uses MongoDB connection pooling for optimal performance:
- Multiple connections are managed efficiently
- Resource usage is optimized for concurrent users
- Connection timeouts are handled gracefully

### Index Optimization
Database indexes are automatically created for frequently queried fields:
- User-specific queries are optimized
- Search operations are accelerated
- Sorting operations perform efficiently

## Support and Resources

If you encounter issues with the database setup:
1. Check the troubleshooting section above
2. Review the main README.md for installation instructions
3. Examine the `start-mongo.sh` script for detailed configuration
4. Consult the techStack.md documentation for technical details

For additional help, you can:
- Check the GitHub repository for known issues
- Create an issue if you encounter a bug
- Review the project's documentation in the `/documentation` directory