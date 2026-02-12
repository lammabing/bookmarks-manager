#!/bin/bash
# start-mongo-persistent.sh
# Script to start MongoDB with persistent storage on D: drive

# Create persistent directory on D: drive
MONGODB_DIR="/mnt/d/backups/mongodb-data"
mkdir -p "$MONGODB_DIR"

# Stop existing container if running
echo "Stopping existing MongoDB container..."
docker stop mongodb-container 2>/dev/null || true
docker rm mongodb-container 2>/dev/null || true

# Check if there's existing data in the old location
OLD_MONGODB_DIR="/home/ceo/mongodb"
if [ -d "$OLD_MONGODB_DIR" ] && [ -n "$(ls -A $OLD_MONGODB_DIR 2>/dev/null)" ]; then
    echo "Found existing data in old location. Copying to persistent location..."
    # Copy existing data to D: drive
    cp -r "$OLD_MONGODB_DIR"/* "$MONGODB_DIR/" 2>/dev/null || true
    echo "Data copied to: $MONGODB_DIR"
fi

# Run MongoDB with bind mount to D: drive
echo "Starting MongoDB with persistent storage..."
docker run -d \
  --name mongodb-container \
  -v "$MONGODB_DIR:/data/db" \
  -p 27017:27017 \
  --restart unless-stopped \
  mongo:latest

echo "MongoDB started with persistent storage on D: drive"
echo "Data location: $MONGODB_DIR"
echo "This data will survive WSL reinstallation!"