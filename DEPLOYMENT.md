# 🚀 Deployment Guide

Complete guide to deploying ReviewFlow to production.

## Table of Contents
1. [Heroku](#heroku)
2. [DigitalOcean](#digitalocean)
3. [AWS EC2](#aws-ec2)
4. [Vercel](#vercel)
5. [Railway](#railway)
6. [Render](#render)

---

## 1. Heroku

### Prerequisites
- Heroku account
- Heroku CLI installed

### Steps

1. **Login to Heroku**
```bash
heroku login
```

2. **Create New App**
```bash
heroku create your-reviewflow-app
```

3. **Add PostgreSQL Add-on** (recommended for production)
```bash
heroku addons:create heroku-postgresql:mini
```

4. **Set Environment Variables**
```bash
heroku config:set JWT_SECRET=$(openssl rand -hex 32)
heroku config:set NODE_ENV=production
heroku config:set JWT_EXPIRE=7d
```

5. **Deploy**
```bash
git push heroku main
```

6. **Initialize Database**
```bash
heroku run npm run init-db
```

7. **Open App**
```bash
heroku open
```

### Custom Domain

```bash
heroku domains:add www.yourdomain.com
```

---

## 2. DigitalOcean App Platform

### Via Web Interface

1. **Connect GitHub**
   - Go to DigitalOcean App Platform
   - Click "Create App"
   - Connect your GitHub repository

2. **Configure Build**
   - **Build Command:** `npm install`
   - **Run Command:** `npm start`
   - **Environment:** Node.js

3. **Set Environment Variables**
   - Add `JWT_SECRET` (random secure string)
   - Add `NODE_ENV=production`
   - Add `JWT_EXPIRE=7d`

4. **Add Database**
   - Click "Add Database"
   - Select PostgreSQL
   - Note the connection details

5. **Deploy**
   - Click "Deploy"
   - App will be available at `https://your-app.ondigitalocean.app`

### Via CLI

```bash
doctl apps create --spec .do/app.yaml
```

Create `.do/app.yaml`:
```yaml
name: reviewflow
services:
- name: web
  github:
    repo: your-username/review-saas-fullstack
    branch: main
  build_command: npm install
  run_command: npm start
  environment_slug: node-js
  envs:
  - key: JWT_SECRET
    value: your-secure-secret
  - key: NODE_ENV
    value: production
databases:
- name: reviewflow-db
  engine: PG
```

---

## 3. AWS EC2

### Launch Instance

1. **Create EC2 Instance**
   - AMI: Ubuntu Server 22.04 LTS
   - Instance Type: t2.micro (or larger)
   - Configure Security Group (ports 22, 80, 443)

2. **Connect via SSH**
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

3. **Install Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

4. **Install PM2**
```bash
sudo npm install -g pm2
```

5. **Clone Repository**
```bash
git clone https://github.com/your-username/review-saas-fullstack.git
cd review-saas-fullstack
```

6. **Install Dependencies**
```bash
npm install
```

7. **Configure Environment**
```bash
cp .env.example .env
nano .env  # Edit with your values
```

8. **Initialize Database**
```bash
npm run init-db
```

9. **Start with PM2**
```bash
pm2 start server.js --name reviewflow
pm2 startup
pm2 save
```

### Setup Nginx (Optional)

1. **Install Nginx**
```bash
sudo apt-get install nginx
```

2. **Configure**
```bash
sudo nano /etc/nginx/sites-available/reviewflow
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. **Enable Site**
```bash
sudo ln -s /etc/nginx/sites-available/reviewflow /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Setup SSL with Certbot

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 4. Vercel

### Via CLI

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login**
```bash
vercel login
```

3. **Deploy**
```bash
vercel
```

4. **Set Environment Variables**
```bash
vercel env add JWT_SECRET
vercel env add NODE_ENV production
```

### Via Web Interface

1. Go to vercel.com
2. Click "Import Project"
3. Connect GitHub repository
4. Add environment variables
5. Deploy

**Note:** Vercel is optimized for serverless. For a traditional server, consider other options.

---

## 5. Railway

### Via Web Interface

1. **Visit railway.app**
2. **New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"

3. **Configure**
   - Select repository
   - Railway auto-detects Node.js

4. **Add Variables**
   - Click "Variables"
   - Add:
     - `JWT_SECRET`: (generate random)
     - `NODE_ENV`: production
     - `JWT_EXPIRE`: 7d

5. **Add Database** (Optional)
   - Click "New"
   - Select PostgreSQL
   - Railway provides `DATABASE_URL`

6. **Deploy**
   - Automatic on push to main branch

### Via CLI

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

---

## 6. Render

### Via Web Interface

1. **Go to render.com**
2. **New Web Service**
   - Connect GitHub
   - Select repository

3. **Configure**
   - **Name:** reviewflow
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

4. **Environment Variables**
   - `JWT_SECRET`: (random secure string)
   - `NODE_ENV`: production

5. **Add Database** (Optional)
   - Create PostgreSQL database
   - Use connection string in app

6. **Deploy**
   - Click "Create Web Service"

### Free Tier Notes

Render free tier:
- App spins down after inactivity
- First request may be slow (cold start)

---

## Production Checklist

Before deploying to production:

### Security
- [ ] Change `JWT_SECRET` to strong random string
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Implement rate limiting
- [ ] Add helmet.js for security headers

### Database
- [ ] Migrate to PostgreSQL (from SQLite)
- [ ] Enable database backups
- [ ] Set up connection pooling

### Monitoring
- [ ] Add logging (Winston)
- [ ] Set up error tracking (Sentry)
- [ ] Configure uptime monitoring

### Performance
- [ ] Enable gzip compression
- [ ] Add caching layer (Redis)
- [ ] Optimize database queries
- [ ] Set up CDN for static files

### Code
```bash
# Add security packages
npm install helmet express-rate-limit cors

# Add monitoring
npm install winston sentry

# Add database
npm install pg pg-hstore
```

Example production server.js additions:

```javascript
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Security
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

---

## Environment Variables Reference

Required for all deployments:

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secure-random-string
JWT_EXPIRE=7d
DATABASE_URL=postgres://... (for PostgreSQL)
```

Optional:

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
SMTP_HOST=...
SMTP_USER=...
SMTP_PASS=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
```

---

## Database Migration (SQLite to PostgreSQL)

1. **Install PostgreSQL driver**
```bash
npm install pg
```

2. **Update models/db.js**
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

class Database {
  async run(sql, params = []) {
    const client = await pool.connect();
    try {
      const result = await client.query(sql, params);
      return { id: result.rows[0]?.id, changes: result.rowCount };
    } finally {
      client.release();
    }
  }

  async get(sql, params = []) {
    const client = await pool.connect();
    try {
      const result = await client.query(sql, params);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async all(sql, params = []) {
    const client = await pool.connect();
    try {
      const result = await client.query(sql, params);
      return result.rows;
    } finally {
      client.release();
    }
  }
}
```

3. **Update SQL syntax** (PostgreSQL uses $1, $2 instead of ?)

---

## Post-Deployment

1. **Test all endpoints**
2. **Create admin account**
3. **Configure domain & SSL**
4. **Set up monitoring**
5. **Enable automated backups**
6. **Document API for team**

---

## Support

For deployment issues:
- Check platform-specific documentation
- Review application logs
- Verify environment variables
- Test database connection

Happy deploying! 🚀
