# ReviewFlow - Full-Stack Google Review SaaS Platform

A comprehensive, production-ready Google Review management platform with automated review collection, AI-powered responses, and campaign management.

## 🚀 Features

- **User Authentication** - Secure JWT-based login and registration
- **Review Management** - Collect, view, and respond to customer reviews
- **Auto-Response System** - AI-powered automated review responses
- **Campaign Management** - Create and manage review collection campaigns
- **Analytics Dashboard** - Real-time stats and performance metrics
- **Automation Settings** - Customizable automation rules
- **Response Templates** - Pre-built response templates for different scenarios
- **SQLite Database** - Lightweight, file-based database (easily upgradable to PostgreSQL)

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## 🛠️ Installation

### 1. Clone or Download

```bash
cd review-saas-fullstack
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and configure your settings:

```env
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d
```

### 4. Initialize Database

```bash
npm run init-db
```

This will:
- Create all necessary database tables
- Create a demo user account (email: `demo@reviewflow.com`, password: `demo123`)
- Insert sample data for testing

### 5. Start the Server

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

The server will start at `http://localhost:3000`

## 📁 Project Structure

```
review-saas-fullstack/
├── server.js              # Main Express server
├── initDb.js             # Database initialization script
├── package.json          # Dependencies and scripts
├── .env                  # Environment variables (create from .env.example)
│
├── middleware/
│   └── auth.js           # JWT authentication middleware
│
├── models/
│   └── db.js             # Database helper functions
│
├── routes/
│   ├── auth.js           # Authentication routes (login, register)
│   ├── reviews.js        # Review management routes
│   ├── campaigns.js      # Campaign management routes
│   ├── automation.js     # Automation settings routes
│   ├── analytics.js      # Analytics and statistics routes
│   └── user.js           # User profile routes
│
└── public/
    ├── index.html        # Frontend application
    └── app.js            # Frontend JavaScript (API integration)
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Reviews
- `GET /api/reviews` - Get all reviews
- `GET /api/reviews/:id` - Get single review
- `POST /api/reviews` - Create review
- `POST /api/reviews/:id/respond` - Respond to review
- `POST /api/reviews/:id/auto-respond` - Auto-respond to review
- `PATCH /api/reviews/:id/status` - Update review status
- `DELETE /api/reviews/:id` - Delete review

### Campaigns
- `GET /api/campaigns` - Get all campaigns
- `GET /api/campaigns/:id` - Get single campaign
- `POST /api/campaigns` - Create campaign
- `PUT /api/campaigns/:id` - Update campaign
- `PATCH /api/campaigns/:id/status` - Update campaign status
- `POST /api/campaigns/:id/recipients` - Add recipients
- `POST /api/campaigns/:id/send` - Send campaign
- `DELETE /api/campaigns/:id` - Delete campaign

### Automation
- `GET /api/automation/settings` - Get automation settings
- `PUT /api/automation/settings` - Update automation settings
- `GET /api/automation/templates` - Get response templates
- `POST /api/automation/templates` - Create response template
- `PUT /api/automation/templates/:id` - Update template
- `DELETE /api/automation/templates/:id` - Delete template

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard statistics
- `GET /api/analytics/trends` - Get review trends
- `GET /api/analytics/rating-distribution` - Get rating distribution
- `GET /api/analytics/campaign-performance` - Get campaign performance
- `GET /api/analytics/monthly-report` - Get monthly report

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `PUT /api/user/change-password` - Change password
- `PUT /api/user/subscription` - Update subscription

## 🔐 Demo Account

After initializing the database, you can login with:
- **Email**: demo@reviewflow.com
- **Password**: demo123

## 🚀 Deployment Options

### Option 1: Heroku

1. Install Heroku CLI
2. Create new app: `heroku create your-app-name`
3. Add buildpack: `heroku buildpacks:set heroku/nodejs`
4. Set environment variables:
   ```bash
   heroku config:set JWT_SECRET=your-secret-key
   heroku config:set NODE_ENV=production
   ```
5. Deploy: `git push heroku main`

### Option 2: DigitalOcean App Platform

1. Connect your GitHub repository
2. Select Node.js environment
3. Set build command: `npm install`
4. Set run command: `npm start`
5. Add environment variables in the dashboard

### Option 3: AWS EC2

1. Launch Ubuntu EC2 instance
2. SSH into instance
3. Install Node.js and npm
4. Clone repository
5. Install dependencies: `npm install`
6. Set up PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start server.js
   pm2 startup
   pm2 save
   ```
7. Configure Nginx as reverse proxy

### Option 4: Vercel

1. Install Vercel CLI: `npm install -g vercel`
2. Run: `vercel`
3. Follow prompts to deploy

### Option 5: Railway

1. Visit railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select repository
4. Add environment variables
5. Deploy automatically

## 🔧 Production Considerations

### 1. Database Migration

For production, migrate from SQLite to PostgreSQL:

```bash
npm install pg
```

Update `models/db.js` to use PostgreSQL connection.

### 2. Security

- Change `JWT_SECRET` to a strong random string
- Enable HTTPS
- Set up CORS properly
- Implement rate limiting
- Add input validation

### 3. Email/SMS Integration

Add email service (e.g., SendGrid, AWS SES):

```bash
npm install nodemailer
```

Add SMS service (e.g., Twilio):

```bash
npm install twilio
```

### 4. Google API Integration

1. Create project in Google Cloud Console
2. Enable Google My Business API
3. Set up OAuth 2.0 credentials
4. Add credentials to `.env`
5. Implement OAuth flow in `/routes/auth.js`

### 5. Monitoring & Logging

```bash
npm install winston morgan
```

Add logging to all routes and error handling.

## 🧪 Testing

Create test user:

```javascript
// Test in your browser console or API client
await fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'test123',
    name: 'Test User',
    companyName: 'Test Company'
  })
});
```

## 📝 Environment Variables

Required variables:

```env
# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRE=7d

# Database
DATABASE_PATH=./database.sqlite

# Google API (optional for full functionality)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Email (optional for campaigns)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SMS (optional for campaigns)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

## 📄 License

MIT License - feel free to use this for your own projects!

## 🐛 Troubleshooting

### Database locked error
- Close all connections to the database
- Delete `database.sqlite` and run `npm run init-db` again

### Port already in use
- Change PORT in `.env` file
- Kill process using port 3000: `lsof -ti:3000 | xargs kill`

### Authentication errors
- Check that JWT_SECRET is set in `.env`
- Verify token is being sent in Authorization header

## 📧 Support

For issues and questions, please open an issue on GitHub.

## 🎯 Roadmap

- [ ] Google My Business API integration
- [ ] Advanced analytics and reporting
- [ ] Multi-location support
- [ ] White-label options
- [ ] Mobile app
- [ ] Webhook integrations
- [ ] AI-powered sentiment analysis
- [ ] Competitor review monitoring
