# Deployment Guide

Production build, deployment procedures, and infrastructure setup.

## Overview

```
Development                    Production
┌──────────────┐              ┌──────────────┐
│ Vite Dev     │              │ Nginx        │
│ Server       │              │ (Static)     │
│ (5170)       │              └──────┬───────┘
│              │                     │
│ Express      │              ┌──────┴───────┐
│ Server       │              │ Node.js      │
│ (5015)       │              │ Server       │
│              │              │ (5015)       │
│ MongoDB      │              └──────┬───────┘
│ (Docker)     │                     │
└──────────────┘              ┌──────┴───────┐
                              │ MongoDB      │
                              │ (Docker)     │
                              └──────────────┘
```

---

## Frontend Deployment

### Build Production Bundle

```bash
npm run build
```

**Output**: `dist/` directory

```
dist/
├── index.html
├── assets/
│   ├── index-abc123.js      # Bundled JS (minified)
│   ├── index-def456.css     # Bundled CSS (minified)
│   └── logo-ghi789.png      # Optimized assets
├── favicon.png
├── icon-192x192.png          # PWA icon
├── icon-512x512.png          # PWA icon
├── manifest.json             # PWA manifest with Web Share Target
└── sw.js                     # Service worker (asset caching)
```

**Build Optimizations**:
- Tree shaking (remove unused code)
- Minification (Terser)
- Code splitting (vendor chunks)
- Asset optimization (images, fonts)
- Gzip/Brotli compression (via server)

### Preview Production Build

```bash
npm run serve
```

Opens preview at http://localhost:4173

---

## Backend Deployment

### Prepare Environment

```bash
# Production environment variables
cat > .env << EOF
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/bookmarks
JWT_SECRET=$(openssl rand -hex 64)
PORT=5015
NODE_ENV=production
EOF
```

### Start Production Server

```bash
npm run start
```

Or directly:
```bash
node server.js
```

### Process Management

**Using PM2** (Recommended):

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server.js --name bookmarks-api

# View status
pm2 status

# View logs
pm2 logs bookmarks-api

# Restart
pm2 restart bookmarks-api

# Stop
pm2 stop bookmarks-api

# Auto-start on boot
pm2 startup
pm2 save
```

**PM2 Configuration File** (`ecosystem.config.js`):

```javascript
module.exports = {
  apps: [{
    name: 'bookmarks-api',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 5015
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};
```

Start with:
```bash
pm2 start ecosystem.config.js
```

---

## Full Stack Deployment

### Option 1: Single Server

**Architecture**:
```
Internet
  ↓
Nginx (Reverse Proxy)
  ↓
├─ / → Static files (dist/)
└─ /api → Node.js (server.js)
```

**Nginx Configuration** (`/etc/nginx/sites-available/bookmarks-manager`):

```nginx
server {
    listen 80;
    server_name bookmarks.example.com;

    # Frontend static files
    location / {
        root /var/www/bookmarks-manager/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api {
        proxy_pass http://localhost:5015;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Enable site**:
```bash
sudo ln -s /etc/nginx/sites-available/bookmarks-manager /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Option 2: Docker Compose

**File**: `docker-compose.prod.yml`

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "5015:5015"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/bookmarking-app
      - JWT_SECRET=${JWT_SECRET}
      - NODE_ENV=production
    depends_on:
      - mongodb
    restart: unless-stopped

  mongodb:
    image: mongo:8.0
    volumes:
      - mongodb_data:/data/db
    ports:
      - "27017:27017"
    restart: unless-stopped

volumes:
  mongodb_data:
```

**Build and run**:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Option 3: Separate Services

**Frontend**: Deploy to CDN (Netlify, Vercel, Cloudflare Pages)
**Backend**: Deploy to VPS (DigitalOcean, AWS EC2, Linode)
**Database**: Managed MongoDB (MongoDB Atlas)

---

## Docker Deployment

### Frontend Dockerfile

**File**: `Dockerfile.frontend`

```dockerfile
# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Backend Dockerfile

**File**: `Dockerfile.backend`

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 5015
CMD ["node", "server.js"]
```

### Build Images

```bash
# Frontend
docker build -t bookmarks-frontend -f Dockerfile.frontend .

# Backend
docker build -t bookmarks-backend -f Dockerfile.backend .
```

### Run Containers

```bash
# MongoDB
docker run -d \
  --name mongodb \
  -v mongodb_data:/data/db \
  -p 27017:27017 \
  mongo:8.0

# Backend
docker run -d \
  --name bookmarks-api \
  --link mongodb:mongodb \
  -e MONGODB_URI=mongodb://mongodb:27017/bookmarking-app \
  -e JWT_SECRET=your-secret \
  -p 5015:5015 \
  bookmarks-backend

# Frontend
docker run -d \
  --name bookmarks-web \
  --link bookmarks-api:api \
  -p 80:80 \
  bookmarks-frontend
```

---

## Database Deployment

### Local MongoDB (Docker)

```bash
./start-mongo-reliable.sh
```

### MongoDB Atlas (Cloud)

1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create cluster (free tier available)
3. Create database user
4. Whitelist IP addresses (0.0.0.0/0 for all)
5. Get connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/bookmarking-app
   ```
6. Update `.env`:
   ```env
   MONGODB_URI=mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/bookmarking-app
   ```

### MongoDB Backup (Production)

```bash
# Using mongodump
mongodump --uri="mongodb+srv://..." --out=/backups/mongodb

# Using npm script
npm run backup
```

---

## SSL/HTTPS

### Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d bookmarks.example.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Cloudflare (Free CDN + SSL)

1. Add domain to Cloudflare
2. Update nameservers
3. Enable "Always Use HTTPS"
4. Enable "Automatic HTTPS Rewrites"
5. SSL mode: Full (strict)

---

## Environment Variables (Production)

### Required

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/bookmarks
JWT_SECRET=<random-64-char-string>
PORT=5015
NODE_ENV=production
```

### Optional

```env
# CORS
ALLOWED_ORIGINS=https://bookmarks.example.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/bookmarks-api.log
```

### Generate Secure JWT Secret

```bash
# Linux/Mac
openssl rand -hex 64

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] Run tests: `npm test` (if available)
- [ ] Build frontend: `npm run build`
- [ ] Test production build: `npm run serve`
- [ ] Update `.env` with production values
- [ ] Generate secure JWT secret
- [ ] Configure MongoDB connection string
- [ ] Set CORS alloweded origins
- [ ] Review error handling
- [ ] Check environment variable validation

### Deployment

- [ ] Pull latest code: `git pull`
- [ ] Install dependencies: `npm install --production`
- [ ] Build frontend: `npm run build`
- [ ] Start backend: `pm2 start server.js`
- [ ] Verify backend: `curl http://localhost:5015`
- [ ] Configure Nginx (if applicable)
- [ ] Enable SSL (if applicable)
- [ ] Test application in browser
- [ ] Test API endpoints
- [ ] Test authentication flow

### Post-Deployment

- [ ] Monitor logs: `pm2 logs` or `tail -f /var/log/bookmarks-api.log`
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Configure automated backups
- [ ] Set up uptime monitoring
- [ ] Test backup restore procedure
- [ ] Document deployment process
- [ ] Create rollback plan

---

## Monitoring

### Application Monitoring

**PM2 Monitoring**:
```bash
pm2 monit
```

**Resource Usage**:
```bash
# CPU and Memory
pm2 list

# Detailed metrics
pm2 show bookmarks-api
```

### Log Management

```bash
# View logs
pm2 logs bookmarks-api

# Log rotation
pm2 install pm2-logrotate

# Configure rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Uptime Monitoring

**Services**:
- UptimeRobot (free, 50 monitors)
- Pingdom (paid)
- StatusCake (free tier)

**Setup**:
```
Monitor URL: https://bookmarks.example.com
Check Interval: 5 minutes
Alert on: HTTP status != 200
```

---

## Scaling

### Horizontal Scaling

**Backend**:
```bash
# PM2 cluster mode
pm2 start server.js -i max  # One instance per CPU core
```

**Database**:
- MongoDB replica sets
- Read replicas for queries
- Primary for writes

### Vertical Scaling

**Increase Resources**:
- More CPU cores
- More RAM (512MB+ for Node.js)
- Faster storage (SSD/NVMe)

### CDN (Static Assets)

**Cloudflare**:
```
Frontend → Cloudflare CDN → Users
Backend → Origin server
```

**Benefits**:
- Faster global load times
- DDoS protection
- Automatic SSL
- Bandwidth savings

---

## Security Hardening

### Server Security

```bash
# Firewall
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Disable root SSH
sudo nano /etc/ssh/sshd_config
# PermitRootLogin no

# Automatic updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure unattended-upgrades
```

### Application Security

**Helmet.js** (HTTP headers):
```javascript
import helmet from 'helmet';
app.use(helmet());
```

**Rate Limiting**:
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use('/api/', limiter);
```

**Input Validation**:
- Mongoose schema validation
- Request body validation
- Sanitize user input

**CORS**:
```javascript
import cors from 'cors';

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5170']
}));
```

---

## Rollback Procedure

### Quick Rollback

```bash
# Stop current version
pm2 stop bookmarks-api

# Checkout previous version
git checkout <previous-commit>

# Install dependencies
npm install

# Rebuild frontend
npm run build

# Start application
pm2 start bookmarks-api
```

### Database Rollback

```bash
# Restore from backup
node scripts/restore-all-from-backup.js
```

---

## Deployment Automation

### GitHub Actions (CI/CD)

**File**: `.github/workflows/deploy.yml`

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build frontend
        run: npm run build
      
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd /var/www/bookmarks-manager
            git pull
            npm install --production
            npm run build
            pm2 restart bookmarks-api
```

---

## Performance Optimization

### Frontend

```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['lucide-react', '@heroicons/react']
        }
      }
    }
  }
});
```

### Backend

- Enable gzip compression
- Database query optimization
- Response caching
- Connection pooling

### Nginx

```nginx
# Gzip compression
gzip on;
gzip_types text/css application/javascript application/json;
gzip_min_length 1000;

# Caching
location /assets/ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}
```

---

*Last Updated: April 9, 2026*
