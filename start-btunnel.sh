#!/bin/bash

# Check if port argument is provided
if [ -z "$1" ]; then
    echo "Error: Please provide a port number"
    echo "Usage: $0 <port>"
    exit 1
fi

# Check if BTUNNEL_API_KEY environment variable is set
if [ -z "$BTUNNEL_API_KEY" ]; then
    echo "Error: BTUNNEL_API_KEY environment variable is not set"
    exit 1
fi

# Store the port argument
PORT=$1

# Validate port is a number and within valid range (1-65535)
if ! [[ "$PORT" =~ ^[0-9]+$ ]] || [ "$PORT" -lt 1 ] || [ "$PORT" -gt 65535 ]; then
    echo "Error: Port must be a number between 1 and 65535"
    exit 1
fi

# Run btunnel command with the provided port and API key from environment variable
btunnel http --port "$PORT" --key "$BTUNNEL_API_KEY"