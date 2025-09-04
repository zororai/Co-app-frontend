# Docker Setup for Co-app Frontend

This document provides instructions for running the Co-app frontend application using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose installed

## Quick Start

### Production Build

```bash
# Build the production image and run it directly (host 3000 -> container 3000)
npm run docker:build
npm run docker:run

# Or use Compose with the prod profile (detached)
npm run docker:prod

# Using pnpm (equivalent)
pnpm run docker:build
pnpm run docker:run
pnpm run docker:prod
```

### Development with Hot Reload

```bash
# Run development environment with hot reload
npm run docker:dev

# Using pnpm (equivalent)
pnpm run docker:dev
```

- Production available at: http://localhost:3000
- Development available at: http://localhost:3000

### Stop Containers

```bash
npm run docker:stop

# Using pnpm (equivalent)
pnpm run docker:stop
```

## Manual Docker Commands

### Production

```bash
# Build the image
docker build -t co-app-frontend .

# Run the container (host 3000 -> container 3000)
docker run -p 3000:3000 co-app-frontend
```

### Using Docker Compose (v2)

Both syntaxes generally work; prefer the space form if you have Docker Compose v2:

```bash
# v2 recommended
docker compose --profile prod up -d

# legacy hyphen form
docker-compose --profile prod up -d

# stop
docker compose down
```

### Development

```bash
# Run development environment
docker-compose --profile dev up

# Run in detached mode
docker-compose --profile dev up -d
```

Ports and profiles:
- Prod profile maps host 3000 -> container 3000 (`services.app`)
- Dev profile maps host 3000 -> container 3000 (`services.dev`)

## Configuration

### Environment Variables

You can pass environment variables to the container:

```bash
docker run -p 3000:3000 -e NODE_ENV=production co-app-frontend
```

With Compose, add environment variables under the corresponding service in `docker-compose.yml` (use `NEXT_PUBLIC_*` for variables needed in the browser):

```yaml
services:
  app:
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_BASE_URL=https://api.example.com
  dev:
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

### Port Configuration

The application listens on port 3000 in the container. By default we map host 3000 -> container 3000. To use a different host port:

```bash
docker run -p 3000:3000 co-app-frontend
```

In Compose, change the `ports` mapping per service (e.g., "3000:3000" for dev).

## Troubleshooting

### Container won't start
- Ensure Docker is running
- Check if port 3000 is already in use
- Verify all dependencies are properly installed

### Build issues
- Clear Docker cache: `docker system prune`
- Rebuild without cache: `docker build --no-cache -t co-app-frontend .`

With Compose:

```bash
# Rebuild images when sources/Dockerfile change
docker compose build --no-cache
docker compose up -d --force-recreate
```

### Development hot reload not working
- Ensure you're using the development profile: `docker-compose --profile dev up`
- Check that volumes are properly mounted in docker-compose.yml

Additional notes for Windows/WSL2/macOS:
- File watching can require polling in containers. The `dev` service sets:
  - `CHOKIDAR_USEPOLLING=true`
  - `WATCHPACK_POLLING=true`
  - `POLLING_INTERVAL=1000`
- If changes still don’t reflect, try restarting the dev service: `docker compose restart dev`
- Ensure your editor saves to disk (not using remote FS) and that bind mounts are active: `.:/app`
