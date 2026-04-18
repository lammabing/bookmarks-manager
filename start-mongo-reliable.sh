#!/bin/bash

# Reliable MongoDB Starter for WSL2 + Docker Desktop
# Ensures Docker is available before starting MongoDB

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() { echo -e "${GREEN}[INFO]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if Docker is available
check_docker() {
    local max_wait=60
    local waited=0
    
    print_status "Checking Docker availability..."
    
    while [ $waited -lt $max_wait ]; do
        if docker info &> /dev/null; then
            print_status "Docker is available!"
            return 0
        fi
        
        # Check if Docker Desktop is running in Windows
        if [ -S /mnt/wsl/docker-desktop/docker-cli ]; then
            print_status "Docker Desktop socket detected, waiting..."
        else
            print_warning "Docker Desktop not detected. Please start Docker Desktop on Windows."
        fi
        
        sleep 2
        waited=$((waited + 2))
    done
    
    print_error "Docker not available after ${max_wait} seconds."
    print_status "Please ensure Docker Desktop is running on Windows."
    return 1
}

# Check if MongoDB container exists
container_exists() {
    docker ps -a --format '{{.Names}}' 2>/dev/null | grep -q "^mongodb-container$"
}

container_running() {
    docker ps --format '{{.Names}}' 2>/dev/null | grep -q "^mongodb-container$"
}

# Create data directory
DATA_DIR="$HOME/mongodb-data"
mkdir -p "$DATA_DIR"

# Fix permissions
if [ -d "$DATA_DIR" ]; then
    chmod 755 "$DATA_DIR"
fi

main() {
    print_status "Starting MongoDB with reliable persistence..."
    
    # Wait for Docker
    check_docker
    
    # Check if container exists
    if container_exists; then
        print_status "MongoDB container exists."
        
        if container_running; then
            print_status "MongoDB container is already running!"
        else
            print_status "Starting existing container..."
            docker start mongodb-container
        fi
    else
        print_status "Creating new MongoDB container with proper volume mounts..."
        
        docker run -d \
            --hostname=mongodb-container \
            --name=mongodb-container \
            --network=bridge \
            -p 27017:27017 \
            -v mongodb-data:/data/db \
            --restart=unless-stopped \
            mongo:latest
        
        print_status "MongoDB container created with Docker named volume: mongodb-data"
        print_status "This volume persists data reliably in WSL2 environments"
    fi
    
    # Wait for MongoDB to be ready
    print_status "Waiting for MongoDB to be ready..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker exec mongodb-container mongosh --eval "db.runCommand({ping:1})" &> /dev/null; then
            print_status "MongoDB is ready!"
            print_status "Data directory: ${DATA_DIR}"
            
            # Show data directory status
            if [ -d "$DATA_DIR" ]; then
                local file_count=$(find "$DATA_DIR" -name "*.wt" 2>/dev/null | wc -l)
                print_status "Data files in volume: $file_count"
            fi
            
            return 0
        fi
        
        sleep 2
        ((attempt++))
    done
    
    print_error "MongoDB failed to start within expected time."
    return 1
}

main "$@"
