# 🚀 Quick Start Guide

Get ReviewFlow up and running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Setup Environment

```bash
cp .env.example .env
```

**Important**: Open `.env` and change `JWT_SECRET` to a random secure string!

## Step 3: Initialize Database

```bash
npm run init-db
```

You should see:
```
✅ Database tables created successfully!
✅ Demo user created: demo@reviewflow.com / demo123
✅ Sample data inserted successfully!
✅ Database initialization complete!
```

## Step 4: Start the Server

```bash
npm start
```

You should see:
```
  ╔════════════════════════════════════════╗
  ║                                        ║
  ║   🚀 ReviewFlow Server Running!       ║
  ║                                        ║
  ║   Server: http://localhost:3000       ║
  ║   Environment: development            ║
  ║                                        ║
  ╚════════════════════════════════════════╝
```

## Step 5: Open in Browser

Visit: **http://localhost:3000**

## 🎉 You're Ready!

### Login with Demo Account:
- Email: `demo@reviewflow.com`
- Password: `demo123`

### Or Create Your Own Account:

Use any API client (Postman, curl, or browser console):

```javascript
// In browser console on http://localhost:3000
await fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'your@email.com',
    password: 'yourpassword',
    name: 'Your Name',
    companyName: 'Your Company'
  })
}).then(r => r.json()).then(console.log);
```

## 📱 What's Next?

1. **Explore the Dashboard** - View sample reviews and statistics
2. **Create a Campaign** - Click "New Campaign" button
3. **Test Auto-Response** - Click "Auto Respond" on any review
4. **Customize Settings** - Toggle automation features
5. **Add Your Data** - Start adding real reviews and campaigns

## 🔧 Development Mode

For auto-reload during development:

```bash
npm run dev
```

Requires nodemon (will be installed with dev dependencies).

## 📖 Need Help?

Check the full README.md for:
- Complete API documentation
- Deployment guides
- Troubleshooting tips
- Production setup

## 🐛 Common Issues

**Port 3000 already in use?**
```bash
# Change PORT in .env file
PORT=3001
```

**Database errors?**
```bash
# Delete and recreate database
rm database.sqlite
npm run init-db
```

**Can't login?**
```bash
# Make sure you initialized the database
npm run init-db
```
