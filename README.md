# Salon Appointment Booking System

A comprehensive full-stack appointment booking system built with Next.js, TypeScript, PostgreSQL, and Node.js. This system provides a modern, scalable solution for managing salon appointments with advanced features including automated notifications, caching, and comprehensive monitoring.

## Features

### Core Functionality
- **Client Management**: Secure client registration and profile management
- **Appointment Scheduling**: Real-time appointment booking with conflict detection
- **Admin Dashboard**: Comprehensive admin interface for managing appointments and clients
- **Status Management**: Full appointment lifecycle with status transitions

### Advanced Features
- **Automated Notifications**: Email and WhatsApp notifications for booking confirmations, reminders, and updates
- **Smart Reminders**: Automatic reminder scheduling 24 hours before appointments
- **Redis Caching**: High-performance caching for admin dashboard and client lookups
- **Job Queue**: Background job processing with Bull Queue for notifications and reminders
- **Comprehensive Monitoring**: Health checks, metrics collection, and structured logging

### Security & Performance
- **JWT Authentication**: Secure authentication with refresh tokens
- **Input Validation**: Comprehensive validation with Zod schemas
- **Rate Limiting**: Protection against abuse with configurable rate limits
- **Security Headers**: Helmet.js for security best practices
- **CORS Configuration**: Proper cross-origin resource sharing setup

### DevOps & Deployment
- **Docker Support**: Complete containerization with multi-stage builds
- **CI/CD Pipeline**: GitHub Actions for automated testing and deployment
- **PM2 Process Management**: Production-ready process management
- **Health Checks**: Kubernetes-ready health checks and readiness/liveness probes
- **Environment Configuration**: Secure environment variable management

## Tech Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React Hook Form** for form management
- **Zod** for client-side validation
- **Axios** for API communication

### Backend
- **Node.js** with TypeScript
- **Express.js** web framework
- **PostgreSQL** with Prisma ORM
- **Redis** for caching and job queues
- **Bull Queue** for background job processing
- **JWT** for authentication
- **Winston** for structured logging

### Infrastructure
- **Docker** for containerization
- **GitHub Actions** for CI/CD
- **PM2** for process management
- **Redis** for caching and job queues

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │    │   Express API   │    │   PostgreSQL    │
│                 │◄──►│                 │◄──►│                 │
│ • Client Portal │    │ • RESTful API   │    │ • Client Data   │
│ • Admin Panel   │    │ • Authentication│    │ • Appointments  │
│ • Booking UI    │    │ • Validation    │    │ • Admin Data    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                │
                                ▼
                       ┌─────────────────┐
                       │      Redis      │
                       │                 │
                       │ • Caching       │
                       │ • Job Queue     │
                       │ • Rate Limiting │
                       └─────────────────┘
                                │
                                │
                                ▼
                       ┌─────────────────┐
                       │  Notifications  │
                       │                 │
                       │ • Email (SMTP)  │
                       │ • WhatsApp      │
                       │ • Job Workers   │
                       └─────────────────┘
```

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker (optional)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/salon-appointment-system.git
cd salon-appointment-system
```

2. **Install dependencies**
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. **Environment Setup**
```bash
# Copy environment files
cp server/.env.example server/.env
cp client/.env.example client/.env.local

# Configure your environment variables
# See .env.example files for required variables
```

4. **Database Setup**
```bash
# Run database migrations
cd server
npx prisma migrate dev

# Seed initial data (optional)
npx prisma db seed
```

5. **Start Development Servers**
```bash
# Start server
cd server
npm run dev

# Start client (in another terminal)
cd client
npm run dev
```

### Docker Setup

1. **Build and run with Docker Compose**
```bash
docker-compose up -d
```

2. **Access the application**
- Frontend: http://localhost:3000
- API: http://localhost:3001
- Health Check: http://localhost:3001/api/health

## API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new client
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "securepassword123"
}
```

#### POST /api/auth/login
Authenticate a client
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

#### POST /api/auth/refresh
Refresh JWT token
```json
{
  "refreshToken": "your-refresh-token"
}
```

### Appointment Endpoints

#### POST /api/appointments
Create a new appointment
```json
{
  "clientId": "client-id",
  "service": "Haircut",
  "date": "2024-01-15T10:00:00.000Z",
  "duration": 60,
  "notes": "Special request"
}
```

#### GET /api/appointments/:id
Get appointment by ID
```json
{
  "id": "appointment-id",
  "clientId": "client-id",
  "service": "Haircut",
  "date": "2024-01-15T10:00:00.000Z",
  "duration": 60,
  "status": "confirmed",
  "createdAt": "2024-01-10T08:00:00.000Z",
  "updatedAt": "2024-01-10T08:00:00.000Z"
}
```

### Admin Endpoints

#### POST /api/admin/login
Admin authentication
```json
{
  "username": "admin",
  "password": "admin-password"
}
```

#### GET /api/admin/dashboard
Get admin dashboard data
```json
{
  "totalAppointments": 150,
  "pendingAppointments": 25,
  "confirmedAppointments": 120,
  "cancelledAppointments": 5,
  "totalClients": 89,
  "recentAppointments": [...],
  "appointmentsByStatus": {
    "pending": 25,
    "confirmed": 120,
    "cancelled": 5
  }
}
```

## Configuration

### Environment Variables

#### Server (.env)
```bash
# Application
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/salon_appointment_db"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="24h"

# Email
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# WhatsApp (Twilio)
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"

# Frontend
FRONTEND_URL="http://localhost:3000"
```

#### Client (.env.local)
```bash
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_APP_NAME="Salon Booking System"
```

### Production Configuration

For production deployment, use the provided configuration files:

- `docker-compose.yml` - Local development setup
- `ecosystem.config.js` - PM2 process management
- `.github/workflows/ci-cd.yml` - CI/CD pipeline
- `.env.production.example` - Production environment template

## Monitoring & Observability

### Health Checks
- **Health**: `/api/health` - Comprehensive system health check
- **Readiness**: `/api/health/ready` - Kubernetes readiness probe
- **Liveness**: `/api/health/live` - Kubernetes liveness probe

### Metrics
- **Prometheus**: `/api/health/metrics` - Prometheus-compatible metrics
- **Custom Metrics**: Response times, error rates, cache hit rates

### Logging
- **Structured Logging**: JSON format with request IDs
- **Log Levels**: Error, Warn, Info, HTTP, Debug
- **Log Rotation**: Daily rotation with compression
- **Log Aggregation**: Ready for ELK stack or Datadog

## Development

### Project Structure
```
salon-appointment-system/
├── client/                 # Next.js frontend
│   ├── app/               # App Router pages
│   ├── components/        # React components
│   ├── lib/              # Utilities and API clients
│   └── styles/           # Global styles
├── server/               # Node.js backend
│   ├── src/
│   │   ├── controllers/  # Route handlers
│   │   ├── models/       # Data models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── middleware/   # Express middleware
│   │   ├── config/       # Configuration
│   │   └── jobs/         # Background jobs
│   └── migrations/       # Database migrations
├── .github/workflows/    # CI/CD pipeline
├── docker/              # Docker configuration
└── logs/               # Application logs
```

### Running Tests
```bash
# Run server tests
cd server
npm test

# Run client tests
cd client
npm test
```

### Code Quality
```bash
# Linting
npm run lint

# Type checking
npm run typecheck

# Formatting
npm run format
```

## Deployment

### Production Deployment

1. **Build the application**
```bash
# Build client
cd client
npm run build

# Build server
cd server
npm run build
```

2. **Deploy with Docker**
```bash
# Build production image
docker build -t salon-app .

# Run with production compose
docker-compose -f docker-compose.prod.yml up -d
```

3. **Deploy with PM2**
```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save
```

### Kubernetes Deployment
The application is Kubernetes-ready with:
- Health checks and readiness/liveness probes
- Resource limits and requests
- ConfigMaps and Secrets for configuration
- Persistent volumes for logs

## Security

### Security Features
- **Input Validation**: All inputs validated with Zod schemas
- **SQL Injection Protection**: Prisma ORM prevents SQL injection
- **XSS Protection**: Helmet.js security headers
- **Rate Limiting**: Protection against brute force attacks
- **JWT Security**: Secure token generation and validation
- **Password Hashing**: bcrypt for secure password storage

### Security Best Practices
- Use HTTPS in production
- Rotate JWT secrets regularly
- Monitor for suspicious activity
- Keep dependencies updated
- Use strong, unique passwords

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check PostgreSQL is running
   - Verify DATABASE_URL in .env
   - Ensure database exists and migrations are applied

2. **Redis Connection Errors**
   - Check Redis is running
   - Verify REDIS_URL in .env
   - Check Redis authentication

3. **Email/WhatsApp Not Working**
   - Verify SMTP/Twilio credentials
   - Check firewall settings
   - Test with development mode

4. **CORS Errors**
   - Verify FRONTEND_URL in .env
   - Check CORS configuration in middleware

### Logs and Debugging
- Application logs: `logs/combined.log`
- Error logs: `logs/error.log`
- Request logs: Structured JSON format
- Debug mode: Set LOG_LEVEL=debug

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run linting and type checking
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the code examples

## Changelog

### v1.0.0
- Initial release with core appointment booking functionality
- Admin dashboard and client management
- Email and WhatsApp notifications
- Redis caching and job queue system
- Comprehensive monitoring and logging
- Docker and Kubernetes support