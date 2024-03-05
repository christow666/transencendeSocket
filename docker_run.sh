#!/bin/bash

# Define variables
containerName="websocket_game_service"
containerImage="websocket_game_service-websocket_game:latest"

# Function to check if the container exists and is running
check_container_running() {
    docker ps -f name=^/${containerName}$ --format '{{.Names}}' | grep -w ${containerName} > /dev/null
    return $?
}

# Function to check if the container exists (either stopped or running)
check_container_exists() {
    docker ps -a -f name=^/${containerName}$ --format '{{.Names}}' | grep -w ${containerName} > /dev/null
    return $?
}

# Function to check if the image exists
check_image_exists() {
    docker image inspect ${containerImage} > /dev/null 2>&1
    return $?
}

# 1. Check if container exists and is running, if so, do nothing
if check_container_running; then
    echo "Container '${containerName}' is already running."
else
    # 2. If container exists but is not running, start it
    if check_container_exists; then
        echo "Container '${containerName}' exists but is not running. Starting it now..."
        docker start ${containerName}
    else
        # 3. If container does not exist, check if the image exists
        if check_image_exists; then
            echo "Image '${containerImage}' exists. Creating and starting container '${containerName}'..."
            # Create and start the container from the image
            docker run -d --name ${containerName} ${containerImage}
        else
            # If both container and image do not exist, use docker-compose to create and start the container
            echo "Neither container '${containerName}' nor image '${containerImage}' exists. Attempting to create and start the container using docker-compose..."
            # Assuming docker-compose.yml is in the current directory or specify the path
            docker-compose up -d --build
        fi
    fi
fi
