# Backend Setup & Configuration Guide

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn
- Git

### Installation Steps

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   # Copy the example file
   cp .env.example .env.local
   ```

4. **Configure environment variables**
   Edit `.env.local` with your settings:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/codeverse-campus
   JWT_SECRET=your_secure_secret_key
   JWT_EXPIRE=7d
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   
   # Email configuration (Gmail)
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   
   # Cloudinary configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # Socket.IO CORS
   SOCKET_IO_CORS_ORIGIN=http://localhost:5173
   ```

5. **Start the server**
   ```bash
   # Development mode (with auto-reload)
   npm run dev
   
   # Production mode
   npm start
   ```

   Server will start at `http://localhost:5000`

## Environment Variables Explained

### Database
- `MONGODB_URI` - MongoDB connection string
  - Local: `mongodb://localhost:27017/codeverse-campus`
  - Cloud (Atlas): `mongodb+srv://user:pass@cluster.mongodb.net/codeverse-campus`

### Authentication
- `JWT_SECRET` - Secret key for JWT token signing (change in production)
- `JWT_EXPIRE` - Token expiration time (e.g., "7d", "24h")

### Email Configuration (Gmail)
1. Go to Google Account settings
2. Enable 2-Step Verification
3. Generate App Password
4. Use this password in `EMAIL_PASSWORD`

### Cloudinary Setup
1. Sign up at https://cloudinary.com
2. Copy Cloud Name, API Key, and API Secret
3. Add to environment variables

### Frontend URL
- For local development: `http://localhost:5173`
- For production: Update with your frontend domain

## Project Structure

```
backend/
├── .env.example              # Example environment file
├── .env.local                # Your environment variables (don't commit)
├── package.json              # Dependencies and scripts
├── README.md                 # Backend README
├── API_DOCUMENTATION.md      # Complete API docs
├── src/
│   ├── index.js              # Main server entry point
│   ├── config/
│   │   ├── database.js       # MongoDB connection
│   │   └── cloudinary.js     # Cloudinary configuration
│   ├── models/               # Database schemas
│   │   ├── User.js
│   │   ├── Hackathon.js
│   │   ├── Registration.js
│   │   ├── Team.js
│   │   ├── Result.js
│   │   ├── Certificate.js
│   │   ├── Notification.js
│   │   └── ActivityLog.js
│   ├── controllers/          # Business logic
│   │   ├── authController.js
│   │   ├── hackathonController.js
│   │   ├── registrationController.js
│   │   ├── teamController.js
│   │   ├── resultController.js
│   │   ├── notificationController.js
│   │   ├── analyticsController.js
│   │   └── antiCheatController.js
│   ├── routes/               # API routes
│   │   ├── authRoutes.js
│   │   ├── hackathonRoutes.js
│   │   ├── registrationRoutes.js
│   │   ├── teamRoutes.js
│   │   ├── resultRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── analyticsRoutes.js
│   ├── middleware/           # Express middleware
│   │   ├── auth.js          # JWT authentication
│   │   └── errorHandler.js  # Error handling
│   └── utils/                # Utility functions
│       ├── constants.js      # App constants
│       ├── emailService.js   # Email templates
│       ├── tokenService.js   # Token generation
│       ├── locationService.js # Geolocation utilities
│       └── errorUtils.js     # Error utilities
```

## Available Scripts

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Run tests (when configured)
npm test
```

## API Endpoints Overview

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify-email/:token` - Verify email
- `GET /api/auth/me` - Get current user (Protected)

### Hackathons
- `GET /api/hackathons` - Get all hackathons
- `POST /api/hackathons` - Create hackathon (Protected - Organizer)
- `PUT /api/hackathons/:id` - Update hackathon (Protected)
- `GET /api/hackathons/nearby` - Get nearby offline hackathons
- `GET /api/hackathons/search` - Search hackathons

### Registrations
- `POST /api/registrations` - Register for hackathon (Protected)
- `GET /api/registrations/my-registrations` - Get my registrations (Protected)
- `DELETE /api/registrations/:id` - Withdraw registration (Protected)

### Teams
- `POST /api/teams` - Create team (Protected)
- `GET /api/teams/:id` - Get team details (Protected)
- `PUT /api/teams/:id/submit` - Submit project (Protected)
- `GET /api/teams/my/teams` - Get my teams (Protected)

### Results & Leaderboards
- `POST /api/results/hackathon/:id/declare` - Declare results (Protected - Organizer)
- `GET /api/results/hackathon/:id/leaderboard` - Get leaderboard
- `GET /api/results/global-leaderboard` - Get global leaderboard

### Notifications
- `GET /api/notifications` - Get notifications (Protected)
- `PUT /api/notifications/:id/read` - Mark as read (Protected)

### Analytics
- `GET /api/analytics/hackathon/:id` - Hackathon analytics (Protected - Organizer)
- `GET /api/analytics/admin/dashboard` - Admin dashboard (Protected - Admin)
- `GET /api/analytics/user/my-analytics` - User analytics (Protected)

## Database Connection

### Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS (with Homebrew)
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```
3. Use `mongodb://localhost:27017/codeverse-campus` in `.env.local`

### MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create cluster
3. Get connection string from Atlas console
4. Use format: `mongodb+srv://username:password@cluster.mongodb.net/codeverse-campus`

## Testing Endpoints

### Using cURL
```bash
# Sign up
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "1234567890",
    "college": "XYZ College"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'

# Get all hackathons
curl http://localhost:5000/api/hackathons
```

### Using Postman
1. Import the API endpoints from API_DOCUMENTATION.md
2. Set up Environment variables:
   - `base_url` = `http://localhost:5000/api`
   - `token` = JWT token from login response
3. Add `Authorization: Bearer {{token}}` to protected endpoints

## Troubleshooting

### Server won't start
- Check if port 5000 is in use: `netstat -ano | findstr :5000`
- Verify MongoDB is running
- Check `.env.local` is correctly configured

### MongoDB Connection Error
- Verify MongoDB service is running
- Check connection string in `.env.local`
- For Atlas, whitelist your IP address

### Email not sending
- Verify Gmail App Password is correct
- Check if 2-Step Verification is enabled
- Ensure EMAIL_USER matches the Gmail account

### CORS Error
- Ensure `SOCKET_IO_CORS_ORIGIN` matches frontend URL
- Check frontend URL in `.env.local`

### JWT Token Expired
- Get a new token by logging in again
- Adjust `JWT_EXPIRE` if needed

## Performance Optimization

### Database Indexing
Indexes are automatically created on:
- User email (unique)
- Hackathon location (geospatial)
- Timestamps

### Caching (Future Enhancement)
Consider implementing Redis for:
- Session storage
- Leaderboard caching
- Notification queuing

## Security Best Practices

1. **Never commit `.env.local`** - Add to `.gitignore`
2. **Use strong JWT_SECRET** - Generate with: `crypto.randomBytes(32).toString('hex')`
3. **Keep dependencies updated** - Run `npm audit` regularly
4. **Use HTTPS in production** - Set up SSL/TLS
5. **Rate limiting** - Implement to prevent abuse
6. **Input validation** - All endpoints validate inputs
7. **Password hashing** - Bcryptjs with salt rounds of 10

## Deployment

### Using PM2
```bash
npm install -g pm2

# Start server
pm2 start src/index.js --name "codeverse-backend"

# View logs
pm2 logs codeverse-backend

# Restart
pm2 restart codeverse-backend
```

### Using Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY src ./src
EXPOSE 5000
CMD ["node", "src/index.js"]
```

```bash
# Build and run
docker build -t codeverse-backend .
docker run -p 5000:5000 --env-file .env.local codeverse-backend
```

## Monitoring

### Logging
- All errors are logged to console in development
- Implement persistent logging in production (Winston, Morgan)

### Health Check
```bash
curl http://localhost:5000/api/health
```

## Next Steps

1. Set up frontend to consume these APIs
2. Configure email templates
3. Set up Cloudinary for file uploads
4. Implement payment gateway for registration fees
5. Add video proctoring for online hackathons
6. Implement plagiarism detection
7. Set up monitoring and alerting
8. Deploy to production

## Getting Help

- Check API_DOCUMENTATION.md for endpoint details
- Review individual controller files for business logic
- Check middleware for authentication/authorization
- Review models for database schema

## Additional Resources

- [Express.js Documentation](https://expressjs.com)
- [MongoDB Documentation](https://docs.mongodb.com)
- [JWT Documentation](https://jwt.io)
- [Socket.io Documentation](https://socket.io/docs)
