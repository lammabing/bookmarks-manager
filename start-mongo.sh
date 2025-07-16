#!/bin/bash

# MongoDB Docker Container Starter Script
# For WSL/WSL2 environments

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed and running
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    print_status "Docker is available and running."
}

# Check if MongoDB container exists
check_container() {
    if docker ps -a --format '{{.Names}}' | grep -q "^mongodb-container$"; then
        return 0
    else
        return 1
    fi
}

# Start existing container or create new one
start_mongodb() {
    if check_container; then
        print_status "MongoDB container exists. Starting..."
        if docker start mongodb-container; then
            print_status "MongoDB container started successfully."
        else
            print_error "Failed to start existing MongoDB container."
            exit 1
        fi
    else
        print_status "Creating new MongoDB container..."
        
        # Create data directory if it doesn't exist
        mkdir -p ~/mongodb
        
        if docker run -d \
            --hostname=mongodb-container \
            --name=mongodb-container \
            --network=bridge \
            -p 27017:27017 \
            -v ~/mongodb:/data/db \
            -v /data/configdb \
            --restart=unless-stopped \
            mongo:latest; then
            print_status "MongoDB container created and started successfully."
        else
            print_error "Failed to create MongoDB container."
            exit 1
        fi
    fi
}

# Wait for MongoDB to be ready
wait_for_mongodb() {
    print_status "Waiting for MongoDB to be ready..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker exec mongodb-container mongosh --eval "db.runCommand({ping:1})" &> /dev/null; then
            print_status "MongoDB is ready!"
            return 0
        fi
        
        print_status "Attempt $attempt/$max_attempts - MongoDB not ready yet..."
        sleep 2
        ((attempt++))
    done
    
    print_error "MongoDB failed to start within expected time."
    exit 1
}

# Main execution
main() {
    print_status "Starting MongoDB Docker container..."
    
    check_docker
    start_mongodb
    wait_for_mongodb
    
    print_status "MongoDB is running on port 27017"
    print_status "Connection string: mongodb://localhost:27017"
}

# Run main function
main