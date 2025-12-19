# CodeVerse Campus - Backend API

Complete backend for the CodeVerse Campus hackathon management system. This backend handles user authentication, hackathon management, team collaboration, results processing, notifications, and analytics across multiple colleges.

## Features

- **User Authentication**: Secure signup/login with JWT, email verification, and password reset
- **Hackathon Management**: Create, publish, and manage both online and offline hackathons
- **Location-Based Discovery**: Find nearby offline hackathons using geospatial queries
- **Team Management**: Create teams, invite members, and manage team submissions
- **Anti-Cheating System**: Configurable rules for online contests (tab-switch limits, copy-paste restrictions, etc.)
- **Results & Rankings**: Declare results, generate leaderboards, and award coins
- **Certificate Generation**: Auto-generate certificates for winners
- **Notifications**: Real-time notifications via Socket.io and email reminders
- **Analytics Dashboard**: Comprehensive analytics for admins, organizers, and users
- **Global Leaderboard**: Track user achievements across all hackathons

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Real-time**: Socket.io
- **Authentication**: JWT (JSON Web Tokens)
- **Email**: Nodemailer
- **File Storage**: Cloudinary
- **Geolocation**: Geolib

## Project Structure

```
src/
├── index.js                 # Main server file
├── config/
│   ├── database.js         # MongoDB connection
│   └── cloudinary.js       # Cloudinary config
├── models/
│   ├── User.js             # User schema
│   ├── Hackathon.js        # Hackathon schema
│   ├── Registration.js     # Registration schema
│   ├── Team.js             # Team schema
│   ├── Result.js           # Result schema
│   ├── Certificate.js      # Certificate schema
│   ├── Notification.js     # Notification schema
│   └── ActivityLog.js      # Activity tracking schema
├── controllers/
│   ├── authController.js           # Auth logic
│   ├── hackathonController.js      # Hackathon CRUD
│   ├── registrationController.js   # Registration logic
│   ├── teamController.js           # Team management
│   ├── resultController.js         # Results & leaderboards
│   ├── notificationController.js   # Notifications
│   └── analyticsController.js      # Analytics
├── routes/
│   ├── authRoutes.js
│   ├── hackathonRoutes.js
│   ├── registrationRoutes.js
│   ├── teamRoutes.js
│   ├── resultRoutes.js
│   ├── notificationRoutes.js
│   └── analyticsRoutes.js
├── middleware/
│   ├── auth.js             # JWT authentication & authorization
│   └── errorHandler.js     # Error handling
└── utils/
    ├── emailService.js     # Email templates and sending
    ├── tokenService.js     # Token generation
    └── locationService.js  # Geolocation utilities
```

## Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example file
   cp .env.example .env.local
   
   # Edit .env.local with your configuration
   ```

4. **Environment variables needed**
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/codeverse-campus
   JWT_SECRET=your_secret_key_here
   JWT_EXPIRE=7d
   NODE_ENV=development
   
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   SOCKET_IO_CORS_ORIGIN=http://localhost:5173
   ```

5. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

Server will start on `http://localhost:5000`

## API Documentation

### Authentication Endpoints

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify-email/:token` - Verify email
- `POST /api/auth/forgot-password` - Request password reset
- `PUT /api/auth/reset-password/:token` - Reset password
- `GET /api/auth/me` - Get current user (Protected)
- `PUT /api/auth/update-profile` - Update profile (Protected)

### Hackathon Endpoints

- `GET /api/hackathons` - Get all hackathons
- `GET /api/hackathons/nearby` - Get nearby offline hackathons
- `GET /api/hackathons/search` - Search hackathons
- `GET /api/hackathons/:id` - Get hackathon details
- `POST /api/hackathons` - Create hackathon (Protected - Organizer)
- `PUT /api/hackathons/:id` - Update hackathon (Protected - Organizer)
- `PUT /api/hackathons/:id/publish` - Publish hackathon (Protected - Organizer)
- `DELETE /api/hackathons/:id` - Delete hackathon (Protected - Organizer)

### Registration Endpoints

- `POST /api/registrations` - Register for hackathon (Protected)
- `GET /api/registrations/my-registrations` - Get user's registrations (Protected)
- `DELETE /api/registrations/:id` - Withdraw registration (Protected)
- `GET /api/registrations/hackathon/:id` - Get hackathon registrations (Protected - Organizer)
- `PUT /api/registrations/:id/mark-attended` - Mark attendance (Protected - Organizer)

### Team Endpoints

- `POST /api/teams` - Create team (Protected)
- `GET /api/teams/:id` - Get team details (Protected)
- `PUT /api/teams/:id` - Update team (Protected)
- `POST /api/teams/:id/invite` - Invite member (Protected)
- `PUT /api/teams/:id/respond-invitation` - Respond to invitation (Protected)
- `PUT /api/teams/:id/submit` - Submit project (Protected)
- `GET /api/teams/my/teams` - Get user's teams (Protected)

### Results & Leaderboard Endpoints

- `POST /api/results/hackathon/:id/declare` - Declare results (Protected - Organizer)
- `POST /api/results/hackathon/:id/generate-certificates` - Generate certificates (Protected - Organizer)
- `GET /api/results/hackathon/:id/leaderboard` - Get hackathon leaderboard
- `GET /api/results/global-leaderboard` - Get global leaderboard
- `GET /api/results/my/certificates` - Get user certificates (Protected)

### Notification Endpoints

- `GET /api/notifications` - Get notifications (Protected)
- `GET /api/notifications/unread/count` - Get unread count (Protected)
- `PUT /api/notifications/:id/read` - Mark as read (Protected)
- `POST /api/notifications/hackathon/:id/send-reminders` - Send reminders (Protected - Organizer)

### Analytics Endpoints

- `GET /api/analytics/hackathon/:id` - Hackathon analytics (Protected - Organizer)
- `GET /api/analytics/admin/dashboard` - Admin dashboard (Protected - Admin)
- `GET /api/analytics/user/my-analytics` - User analytics (Protected)
- `GET /api/analytics/college` - College analytics (Protected)

## Database Models

### User
- Basic info (name, email, phone)
- College and academic details
- Authentication fields
- Coins and achievements
- Profile information

### Hackathon
- Event details and schedule
- Location info with geospatial indexing
- Eligibility criteria
- Anti-cheating rules
- Guided participation content
- Status tracking

### Registration
- Links users to hackathons
- Payment status
- Attendance tracking
- Team assignments

### Team
- Team composition and leadership
- Project submission data
- Scoring and ranking
- Join requests management

### Result
- Team rankings and scores
- Judge feedback
- Coin rewards
- Certificate tracking

## Real-time Features (Socket.io)

- User notifications
- Live contest updates
- Activity logging
- Leaderboard updates

## Error Handling

The API uses consistent error responses:

```json
{
  "success": false,
  "message": "Error message here"
}
```

## Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Email verification
- Role-based authorization (student, organizer, admin)
- Protected routes
- CORS enabled
- Input validation

## Development

```bash
# Start in development mode with auto-reload
npm run dev

# Lint code (if eslint configured)
npm run lint

# Run tests
npm test
```

## Deployment

1. Set `NODE_ENV=production`
2. Configure all environment variables for production
3. Use a process manager like PM2
   ```bash
   pm2 start src/index.js --name "codeverse-backend"
   ```

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## Future Enhancements

- Video proctoring integration
- Plagiarism detection
- Advanced anti-cheating measures
- Payment gateway integration
- Mobile app support
- Advanced analytics and reporting
- Machine learning for team matching
- Automated certificate generation with watermarking

## Support

For issues and questions, please open an issue on the repository.

## License

ISC
