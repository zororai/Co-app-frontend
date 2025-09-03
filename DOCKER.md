# Docker Setup for Co-app Frontend

This document provides instructions for running the Co-app frontend application using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose installed

## Quick Start

### Production Build

```bash
# Build and run production container
npm run docker:build
npm run docker:run

# Or using docker-compose
npm run docker:prod
```

### Development with Hot Reload

```bash
# Run development environment with hot reload
npm run docker:dev
```

### Stop Containers

```bash
npm run docker:stop
```

## Manual Docker Commands

### Production

```bash
# Build the image
docker build -t co-app-frontend .

# Run the container
docker run -p 3000:3000 co-app-frontend
```

### Development

```bash
# Run development environment
docker-compose --profile dev up

# Run in detached mode
docker-compose --profile dev up -d
```

## Configuration

### Environment Variables

You can pass environment variables to the container:

```bash
docker run -p 3000:3000 -e NODE_ENV=production co-app-frontend
```

### Port Configuration

The application runs on port 3000 by default. To use a different port:

```bash
docker run -p 8080:3000 co-app-frontend
```

## Troubleshooting

### Container won't start
- Ensure Docker is running
- Check if port 3000 is already in use
- Verify all dependencies are properly installed

### Build issues
- Clear Docker cache: `docker system prune`
- Rebuild without cache: `docker build --no-cache -t co-app-frontend .`

### Development hot reload not working
- Ensure you're using the development profile: `docker-compose --profile dev up`
- Check that volumes are properly mounted in docker-compose.yml
