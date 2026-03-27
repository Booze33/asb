# Redis Configuration for External Redis

This project has been configured to use an external Redis server instead of a Docker Redis image.

## Configuration

### Environment Variables

The following environment variables need to be set in your `.env` file:

```env
# Redis Configuration - External Redis Server
REDIS_HOST=your-external-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-external-redis-password
REDIS_CACHE_DB=1

# Redis URL for Bull queues (external Redis)
REDIS_URL="redis://default:your-external-redis-password@your-external-redis-host:6379"
```

### Components Using Redis

1. **Cache Service** (`server/src/config/cache.ts`)
   - Uses: `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_CACHE_DB`
   - Purpose: Caching dashboard data, client information, and appointment details

2. **Job Queues** (`server/src/jobs/queue.ts`)
   - Uses: `REDIS_URL`
   - Purpose: Bull queues for email, WhatsApp, and notification processing

## Setup Instructions

### 1. Choose an External Redis Provider

You can use any of the following:
- **Redis Cloud** (https://redis.com)
- **AWS ElastiCache**
- **Azure Cache for Redis**
- **Google Cloud Memorystore**
- **Self-hosted Redis server**

### 2. Get Connection Details

From your chosen provider, obtain:
- Host/endpoint
- Port (default: 6379)
- Password (if authentication is enabled)
- Database number (default: 0 for queues, 1 for cache)

### 3. Update Environment Variables

Update your `server/.env` file with the actual values:

```env
REDIS_HOST=redis-12345.c1.us-east-1-1.ec2.cloud.redislabs.com
REDIS_PORT=12345
REDIS_PASSWORD=your-strong-password
REDIS_CACHE_DB=1
REDIS_URL="redis://default:your-strong-password@redis-12345.c1.us-east-1-1.ec2.cloud.redislabs.com:12345"
```

### 4. Test Connection

You can test the Redis connection by running:

```bash
cd server
npm run dev
```

#### How to Verify Redis Connection

**1. Check Server Startup Logs**

When the server starts successfully, you should see these log messages:

```
[INFO] Database connected successfully
[INFO] Connecting to Redis...
[INFO] Redis connected successfully { host: 'your-redis-host', port: 6379, keyCount: 0 }
[INFO] Background job processors started successfully
[INFO] Server running on port 3008
```

If Redis connection fails, you'll see:
```
[ERROR] Redis connection failed
[ERROR] Failed to start server: Error: Redis connection failed
```

**2. Use the Health Check Endpoint**

Once the server is running, you can check Redis status via the health endpoint:

```bash
curl http://localhost:3008/api/health
```

Expected response when Redis is connected:
```json
{
  "status": "ok",
  "timestamp": "2026-03-27T09:00:00.000Z",
  "uptime": 10.5,
  "responseTime": 45,
  "checks": {
    "database": {
      "status": "ok",
      "responseTime": 5
    },
    "redis": {
      "status": "ok",
      "responseTime": 12
    },
    "queue": {
      "status": "ok",
      "responseTime": 3
    }
  }
}
```

**3. Check Readiness Endpoint**

For Kubernetes or load balancer health checks:

```bash
curl http://localhost:3008/api/health/ready
```

Returns `200 OK` when both database and Redis are connected.

**4. Monitor Real-time Logs**

The server logs Redis connection events in real-time:
- `Cache Redis client connected successfully` - Initial connection
- `Cache Redis client reconnecting...` - Reconnection attempts
- `Cache Redis client error:` - Connection errors
- `Cache Redis client connection closed` - Disconnections

**5. Check Bull Queue Dashboard**

Access the queue monitoring dashboard at:
```
http://localhost:3008/bull-board
```

This shows active jobs and confirms Redis queues are working.

## Docker Configuration

The Docker Compose configuration has been updated to remove the Redis service since external Redis is now being used.

**Previous Configuration (Removed)**:
- Redis container using `redis:7-alpine` image
- Redis data volume
- Redis health checks and dependencies

**Current Configuration**:
- Only the application container remains in `docker-compose.yml`
- Application connects directly to external Redis via environment variables
- No local Redis container or volume

## CI/CD Considerations

The CI/CD pipeline uses a Docker Redis image for testing purposes only. This is intentional and does not affect production deployments.

- **Test Job**: Uses `redis:7` Docker image for running tests
- **Production/Staging**: Uses external Redis configured via environment variables

## Troubleshooting

### Connection Issues

1. **Check firewall rules**: Ensure your Redis server allows connections from your application servers
2. **Verify credentials**: Double-check the password and username
3. **Test connectivity**: Use `redis-cli` to test direct connection

### Performance Issues

1. **Choose appropriate region**: Select a Redis provider in the same region as your application
2. **Monitor memory usage**: Set up alerts for memory consumption
3. **Configure maxmemory policy**: Set appropriate eviction policies

## Security Best Practices

1. **Use strong passwords**: Generate a strong, unique password
2. **Enable TLS/SSL**: Use encrypted connections when possible
3. **Restrict IP access**: Whitelist only necessary IP addresses
4. **Regular updates**: Keep your Redis server updated
5. **Monitor access logs**: Review connection logs regularly