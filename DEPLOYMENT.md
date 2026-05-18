# Deployment Guide

This guide explains how to deploy CivicEngage to production environments.

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Reverse proxy (Nginx, Apache) or hosting platform
- Domain name
- SSL certificate

## Deployment Options

### Option 1: Docker (Recommended)

#### Build Docker Image

```bash
docker build -t civicengage:latest .
```

#### Run Container

```bash
docker run -d \
  --name civicengage \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@db:5432/civicengage" \
  -e SESSION_SECRET="your-secret-key" \
  -e NODE_ENV="production" \
  -v civicengage-uploads:/app/uploads \
  civicengage:latest
```

#### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://civicengage:password@db:5432/civicengage
      SESSION_SECRET: ${SESSION_SECRET}
    depends_on:
      - db
    volumes:
      - uploads:/app/uploads

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: civicengage
      POSTGRES_PASSWORD: password
      POSTGRES_DB: civicengage
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  uploads:
  db_data:
```

Run with: `docker-compose up -d`

### Option 2: Traditional Server

#### 1. Install Dependencies

```bash
npm install
npm run build
```

#### 2. Set Environment Variables

Create `.env` file on server:

```
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@localhost:5432/civicengage
SESSION_SECRET=your-secret-key-min-32-chars
PORT=3000
```

#### 3. Run with Process Manager

Use PM2 or similar:

```bash
npm install -g pm2
pm2 start "npm start" --name civicengage --env production
pm2 startup
pm2 save
```

#### 4. Configure Reverse Proxy

**Nginx example:**

```nginx
upstream civicengage {
  server localhost:3000;
}

server {
  listen 80;
  server_name yourdomain.com;

  # Redirect HTTP to HTTPS
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name yourdomain.com;

  ssl_certificate /etc/ssl/certs/cert.pem;
  ssl_certificate_key /etc/ssl/private/key.pem;

  # Security headers
  add_header Strict-Transport-Security "max-age=31536000" always;
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;

  location / {
    proxy_pass http://civicengage;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  # WebSocket support
  location /ws {
    proxy_pass http://civicengage;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
    proxy_set_header Host $host;
  }
}
```

### Option 3: Platform-as-a-Service

#### Vercel

1. Push to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy

Note: WebSocket requires Vercel Pro for long-lived connections.

#### Railway

1. Create Railway account
2. Connect GitHub repository
3. Add PostgreSQL plugin
4. Set environment variables
5. Deploy

#### Heroku

```bash
heroku create civicengage
heroku addons:create heroku-postgresql:standard-0
heroku config:set SESSION_SECRET="your-secret"
git push heroku main
```

## Database Migration

### First Deployment

Initialize database schema:

```bash
npm run db:push
```

### Subsequent Deployments

Database schema changes are handled automatically by Drizzle migrations.

## SSL/TLS Certificate

### Let's Encrypt (Free)

Using Certbot:

```bash
sudo certbot certonly --standalone -d yourdomain.com
sudo certbot renew --dry-run  # Test renewal
```

### Commercial Certificate

1. Purchase from certificate authority
2. Install on server or reverse proxy
3. Configure renewal process

## Monitoring and Logging

### Application Logs

```bash
pm2 logs civicengage
# or
docker logs civicengage
```

### Performance Monitoring

Consider:
- New Relic
- DataDog
- Prometheus + Grafana
- CloudWatch (AWS)

### Uptime Monitoring

- UptimeRobot
- Pingdom
- StatusCake

## Backup Strategy

### Database Backups

```bash
# PostgreSQL backup
pg_dump DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore
psql DATABASE_URL < backup-20250518.sql
```

### File Backups

```bash
# Backup uploads directory
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz uploads/
```

## Environment Variables

Required for production:

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `DATABASE_URL` | Database connection | `postgresql://...` |
| `SESSION_SECRET` | Session encryption key | Min 32 characters |
| `PORT` | Server port | `3000` |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API | Optional |
| `UPLOADTHING_SECRET` | File upload service | Optional |

## Security Checklist

- [ ] Database credentials in `.env`, not in code
- [ ] Session secret is strong and unique
- [ ] HTTPS/TLS enabled
- [ ] Security headers configured
- [ ] Regular backups scheduled
- [ ] Log monitoring enabled
- [ ] Rate limiting configured
- [ ] File upload validation enabled
- [ ] CORS properly configured
- [ ] Dependencies kept up to date

## Scaling Considerations

For high traffic:

1. **Database**: Use connection pooling (PgBouncer)
2. **WebSocket**: Use Redis adapter for multiple instances
3. **Static Files**: Use CDN for client assets
4. **Load Balancing**: Run multiple server instances
5. **Caching**: Implement Redis caching layer

## Troubleshooting

### Application won't start

```bash
npm run check  # Check for type errors
npm run build  # Verify build succeeds
```

### Database connection failed

- Verify DATABASE_URL is correct
- Check database is running
- Verify network connectivity
- Check firewall rules

### WebSocket connections failing

- Verify reverse proxy supports WebSocket upgrades
- Check Upgrade and Connection headers
- Verify firewall allows WebSocket ports

## Rollback Procedure

```bash
# If using git-based deployment
git revert <commit-hash>
npm install
npm run build
npm restart  # or pm2 restart / docker restart
```

## Maintenance

### Regular Updates

```bash
npm update
npm audit fix
```

### Database Maintenance

```bash
# PostgreSQL maintenance
VACUUM ANALYZE;
REINDEX DATABASE civicengage;
```

## Support and Questions

For deployment issues:
- Check logs first
- Verify environment variables
- Review ARCHITECTURE.md
- Open GitHub issue for bugs
