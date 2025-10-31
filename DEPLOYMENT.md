# SmartPDFx Deployment Guide

## VPS Deployment with Coolify

This guide explains how to deploy SmartPDFx on a VPS using Coolify.

### Prerequisites

1. **VPS Server** with Docker and Docker Compose installed
2. **Coolify** installed on your VPS
3. **Domain name** (optional but recommended)
4. **SSL certificate** (Coolify can handle this automatically)

### Deployment Steps

#### 1. Prepare Your VPS

Make sure your VPS has:
- Docker Engine installed
- Docker Compose installed
- Coolify installed and running
- Sufficient resources (minimum 2GB RAM, 2 CPU cores recommended)

#### 2. Connect Repository to Coolify

1. Log into your Coolify dashboard
2. Create a new application
3. Connect your GitHub repository: `https://github.com/manishants/smartpdfx`
4. Select the main branch

#### 3. Configure Application Settings

In Coolify dashboard:

**Build Settings:**
- Build Pack: Docker
- Dockerfile: `Dockerfile` (in root directory)
- Build Context: `.`

**Environment Variables:**
```
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
PORT=3000
```

**Health Check:**
- Path: `/api/health`
- Port: 3000
- Interval: 30s

#### 4. Domain Configuration

1. Point your domain to your VPS IP address
2. In Coolify, add your domain to the application
3. Enable SSL (Coolify will handle Let's Encrypt automatically)

#### 5. Deploy

1. Click "Deploy" in Coolify dashboard
2. Monitor the build logs
3. Once deployed, access your application at your domain

### Local Development with Docker

For testing the Docker setup locally:

```bash
# Build the Docker image
npm run docker:build

# Run with Docker Compose
npm run docker:compose

# Stop the containers
npm run docker:compose:down
```

### Production Considerations

#### Performance Optimization

1. **Resource Allocation:**
   - Minimum: 1GB RAM, 1 CPU core
   - Recommended: 2GB RAM, 2 CPU cores
   - For high traffic: 4GB+ RAM, 4+ CPU cores

2. **Caching:**
   - Enable CDN for static assets
   - Configure proper cache headers
   - Consider Redis for session storage

3. **Monitoring:**
   - Set up application monitoring
   - Monitor server resources
   - Set up log aggregation

#### Security

1. **Environment Variables:**
   - Never commit sensitive data to repository
   - Use Coolify's environment variable management
   - Rotate secrets regularly

2. **Network Security:**
   - Configure firewall rules
   - Use HTTPS only
   - Implement rate limiting

3. **Updates:**
   - Keep Docker images updated
   - Monitor for security vulnerabilities
   - Implement automated backups

### Troubleshooting

#### Common Issues

1. **Build Failures:**
   - Check Docker logs in Coolify
   - Verify all dependencies are properly installed
   - Ensure sufficient disk space

2. **Runtime Errors:**
   - Check application logs
   - Verify environment variables
   - Test health check endpoint

3. **Performance Issues:**
   - Monitor resource usage
   - Check for memory leaks
   - Optimize Docker image size

#### Health Check

The application includes a health check endpoint at `/api/health` that returns:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "production"
}
```

### Support

For deployment issues:
1. Check Coolify documentation
2. Review application logs
3. Monitor server resources
4. Contact support if needed

### Files Created for Deployment

- `Dockerfile` - Container configuration
- `docker-compose.yml` - Multi-container setup
- `.dockerignore` - Files to exclude from build
- `coolify.yml` - Coolify configuration
- `src/app/api/health/route.ts` - Health check endpoint
- Updated `next.config.ts` - Standalone output configuration
- Updated `package.json` - Docker scripts