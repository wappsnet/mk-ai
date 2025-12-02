# Deployment Guide - AI Verifier

This guide covers various options for deploying the AI Verifier application to the cloud.

## Option 1: Railway (Recommended - Easiest)

Railway is the easiest option for deploying both backend and database.

### Backend + Database on Railway

1. **Sign up**: Go to [railway.app](https://railway.app) and sign up
2. **Create New Project**: Click "New Project"
3. **Deploy MySQL**:
   - Click "Add Service" → "Database" → "MySQL"
   - Railway will provision a MySQL database
4. **Deploy Backend**:
   - Click "Add Service" → "GitHub Repo"
   - Connect your repository
   - Set root directory to `backend`
   - Add environment variables:
     - Copy all variables from Railway MySQL service
     - They auto-populate `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`
   - Add custom variables:
     - `PORT=3001`
     - `NODE_ENV=production`
5. **Initialize Database**:
   - In Railway backend service, go to "Settings" → "Deploy"
   - Add custom start command: `npm run init-db && npm start`
6. **Get Backend URL**: Railway provides a public URL like `https://your-app.railway.app`

### Frontend on Vercel

1. **Sign up**: Go to [vercel.com](https://vercel.com)
2. **Import Project**: Click "Add New" → "Project"
3. **Configure**:
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Environment Variables**:
   - `VITE_API_URL`: Your Railway backend URL + `/api`
5. **Deploy**: Click Deploy

**Total Cost**: Free tier available for both!

## Option 2: Heroku

### Backend on Heroku

```bash
# Install Heroku CLI
brew install heroku/brew/heroku  # macOS
# or download from heroku.com

# Login
heroku login

# Create app
cd backend
heroku create ai-verifier-backend

# Add MySQL addon
heroku addons:create jawsdb:kitefin

# Get database credentials
heroku config:get JAWSDB_URL

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set PORT=3001

# Create Procfile
echo "web: npm start" > Procfile

# Deploy
git init
git add .
git commit -m "Deploy backend"
git push heroku main

# Initialize database
heroku run npm run init-db
```

### Frontend on Netlify

1. Go to [netlify.com](https://netlify.com)
2. "Add new site" → "Import an existing project"
3. Connect to your Git repository
4. Configure:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Environment variables:
   - `VITE_API_URL`: Your Heroku backend URL + `/api`

## Option 3: DigitalOcean Droplet (Full Control)

### Setup Droplet

1. Create Ubuntu 22.04 droplet on [DigitalOcean](https://www.digitalocean.com/)
2. SSH into droplet: `ssh root@your-droplet-ip`

### Install Dependencies

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install MySQL
apt install -y mysql-server
mysql_secure_installation

# Install Nginx
apt install -y nginx

# Install PM2 (process manager)
npm install -g pm2
```

### Setup MySQL

```bash
mysql -u root -p

CREATE DATABASE ai_verifier;
CREATE USER 'aiverifier'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON ai_verifier.* TO 'aiverifier'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Deploy Backend

```bash
# Create app directory
mkdir -p /var/www/ai-verifier
cd /var/www/ai-verifier

# Clone your repository
git clone your-repo-url .

# Setup backend
cd backend
npm install

# Create .env file
cat > .env << EOF
PORT=3001
NODE_ENV=production
DB_HOST=localhost
DB_USER=aiverifier
DB_PASSWORD=strong_password
DB_NAME=ai_verifier
DB_PORT=3306
EOF

# Initialize database
npm run init-db

# Start with PM2
pm2 start src/index.js --name ai-verifier-backend
pm2 save
pm2 startup
```

### Deploy Frontend

```bash
cd /var/www/ai-verifier/frontend

# Create .env
echo "VITE_API_URL=http://your-droplet-ip:3001/api" > .env

# Build
npm install
npm run build

# Copy to Nginx
cp -r dist/* /var/www/html/
```

### Configure Nginx

```bash
cat > /etc/nginx/sites-available/ai-verifier << EOF
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/html;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API proxy
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

ln -s /etc/nginx/sites-available/ai-verifier /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Setup SSL (Optional but recommended)

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d your-domain.com
```

## Option 4: Docker Deployment

### Create Docker Files

**Backend Dockerfile** (`backend/Dockerfile`):

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
```

**Frontend Dockerfile** (`frontend/Dockerfile`):

```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**docker-compose.yml** (root directory):

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: ai_verifier
      MYSQL_USER: aiuser
      MYSQL_PASSWORD: aipassword
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      DB_HOST: mysql
      DB_USER: aiuser
      DB_PASSWORD: aipassword
      DB_NAME: ai_verifier
      DB_PORT: 3306
      NODE_ENV: production
    depends_on:
      - mysql
    command: sh -c "npm run init-db && npm start"

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  mysql-data:
```

**Deploy with Docker Compose**:

```bash
docker-compose up -d
```

## Option 5: AWS (EC2 + RDS)

### Create RDS MySQL Instance

1. Go to AWS RDS Console
2. Create database:
   - Engine: MySQL 8.0
   - Template: Free tier
   - Set master password
   - Note the endpoint URL

### Create EC2 Instance

1. Launch Ubuntu 22.04 instance
2. Configure security groups:
   - Allow port 80 (HTTP)
   - Allow port 443 (HTTPS)
   - Allow port 3001 (Backend)
3. SSH into instance

### Deploy Application

Follow the DigitalOcean steps above, but use RDS endpoint for database connection:

```env
DB_HOST=your-rds-endpoint.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=your-rds-password
DB_NAME=ai_verifier
DB_PORT=3306
```

## Environment Variables Summary

### Backend Required Variables

```env
PORT=3001
NODE_ENV=production

# Database
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=ai_verifier
DB_PORT=3306

# Optional
VERIFIER_AI_PROVIDER=openai
VERIFIER_AI_MODEL=gpt-4
```

### Frontend Required Variables

```env
VITE_API_URL=https://your-backend-url.com/api
```

## Post-Deployment Checklist

- [ ] Database initialized successfully
- [ ] Backend health check returns OK: `curl your-backend-url/api/health`
- [ ] Frontend loads in browser
- [ ] Can navigate to Settings page
- [ ] Can add AI providers
- [ ] Can create new chat
- [ ] Can send messages and receive responses
- [ ] HTTPS enabled (production)
- [ ] Database backups configured
- [ ] Monitoring setup (optional)

## Monitoring & Maintenance

### Log Monitoring

**PM2 logs**:
```bash
pm2 logs ai-verifier-backend
```

**Docker logs**:
```bash
docker-compose logs -f backend
```

### Database Backups

**Manual backup**:
```bash
mysqldump -u root -p ai_verifier > backup_$(date +%Y%m%d).sql
```

**Automated backups**: Set up cron job or use cloud provider's backup service

## Scaling Considerations

- Use a CDN (CloudFlare) for frontend assets
- Enable database connection pooling (already configured)
- Use Redis for session management (future enhancement)
- Consider serverless functions for AI requests (AWS Lambda)
- Use load balancer for multiple backend instances

## Cost Estimates

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| Railway | Yes (limited) | $5-20/mo |
| Vercel | Yes | $20/mo |
| Heroku | No | $7-25/mo |
| DigitalOcean | No | $6-12/mo |
| AWS | 12 months | Varies |

## Support

For deployment issues:
1. Check application logs
2. Verify all environment variables
3. Test database connectivity
4. Check firewall/security group settings
5. Review the troubleshooting section in QUICKSTART.md
