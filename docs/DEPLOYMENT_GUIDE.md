# 🚀 Deployment Guide - MASKSERVICE C20 1001

Complete deployment guide for MASKSERVICE industrial control system across different environments.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Development Deployment](#development-deployment)
4. [Production Deployment](#production-deployment)
5. [Docker Deployment](#docker-deployment)
6. [System Configuration](#system-configuration)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

### Hardware Requirements

#### Development Environment
- **CPU**: 2+ cores, 2.4GHz
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 10GB free space
- **Display**: Any modern display for development

#### Production Environment (Industrial)
- **CPU**: 4+ cores, 2.4GHz (industrial grade)
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 32GB SSD (industrial grade)
- **Display**: 7.9" LCD 1280x400px (landscape)
- **Touch**: Capacitive touch interface
- **Operating Temp**: -10°C to +60°C
- **Humidity**: 10-90% non-condensing

### Software Requirements

```bash
# Required Software
Node.js >= 18.0.0
npm >= 9.0.0
Modern web browser (Chrome 90+, Firefox 88+, Edge 90+)

# Optional (for development)
Git >= 2.30
Docker >= 20.10 (for containerized deployment)
PM2 >= 5.0 (for process management)
```

### Network Requirements

```
Ports Required:
- 3000-3020: Development servers
- 4000: Screenshot generator
- 8080: Production HTTP server
- 8443: Production HTTPS server (if SSL enabled)
- 9000: WebSocket server (for real-time data)
```

---

## 🛠️ Environment Setup

### 1. System Preparation

```bash
# Update system (Ubuntu/Debian)
sudo apt update && sudo apt upgrade -y

# Install Node.js (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install build tools
sudo apt-get install -y build-essential git curl

# Verify installations
node --version  # Should be 18+
npm --version   # Should be 9+
```

### 2. User Setup

```bash
# Create dedicated user (production)
sudo useradd -r -s /bin/bash -d /opt/maskservice maskservice
sudo mkdir -p /opt/maskservice
sudo chown maskservice:maskservice /opt/maskservice

# Switch to maskservice user
sudo su - maskservice
```

### 3. Application Download

```bash
# Clone repository
git clone https://github.com/maskservice/1001.mask.services.git
cd 1001.mask.services

# Install dependencies
npm install

# Verify installation
npm run analyze
```

---

## 🔧 Development Deployment

### Quick Start

```bash
# Install and verify
npm install
npm run analyze

# Start development environment
npm run dev

# Or start individual components
npm run component:dev:jsonEditor    # Port 3009
npm run component:dev:appHeader     # Port 3002
npm run component:dev:mainMenu      # Port 3003
```

### Development Scripts

```bash
# Component development
npm run component:dev:[name]         # Individual component server
npm run playground                   # Component selector

# Analysis and testing
npm run analyze                      # Health check
npm run screenshots                  # Generate documentation
npm run config:validate              # Validate configurations

# Configuration management
npm run component:dev:jsonEditor     # Visual config editor
```

### Development Configuration

Create `config/development.json`:

```json
{
  "environment": "development",
  "debug": true,
  "cors": {
    "enabled": true,
    "origins": ["http://localhost:*"]
  },
  "logging": {
    "level": "debug",
    "console": true,
    "file": false
  },
  "features": {
    "hotReload": true,
    "mockData": true,
    "debugPanel": true
  }
}
```

---

## 🏭 Production Deployment

### 1. Production Build

```bash
# Prepare production build
npm run build:production

# Optimize assets
npm run optimize

# Validate production config
npm run config:validate:production
```

### 2. System Service Setup

Create systemd service `/etc/systemd/system/maskservice.service`:

```ini
[Unit]
Description=MASKSERVICE C20 1001 Industrial Control System
After=network.target

[Service]
Type=simple
User=maskservice
WorkingDirectory=/opt/maskservice/1001.mask.services
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=8080

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/maskservice

[Install]
WantedBy=multi-user.target
```

### 3. Service Management

```bash
# Enable and start service
sudo systemctl enable maskservice
sudo systemctl start maskservice

# Check status
sudo systemctl status maskservice

# View logs
sudo journalctl -u maskservice -f
```

### 4. Web Server Configuration

#### Nginx Configuration

Create `/etc/nginx/sites-available/maskservice`:

```nginx
server {
    listen 80;
    server_name maskservice.local;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    # Main application
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # WebSocket support
    location /ws {
        proxy_pass http://localhost:9000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
    
    # Static assets
    location /assets {
        alias /opt/maskservice/1001.mask.services/assets;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/maskservice /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. Production Configuration

Create `config/production.json`:

```json
{
  "environment": "production",
  "debug": false,
  "server": {
    "port": 8080,
    "host": "0.0.0.0"
  },
  "security": {
    "cors": {
      "enabled": true,
      "origins": ["http://maskservice.local"]
    },
    "rateLimit": {
      "windowMs": 900000,
      "max": 100
    },
    "helmet": true
  },
  "logging": {
    "level": "info",
    "console": false,
    "file": true,
    "path": "/var/log/maskservice/app.log"
  },
  "database": {
    "type": "sqlite",
    "path": "/opt/maskservice/data/maskservice.db"
  },
  "backup": {
    "enabled": true,
    "interval": "0 2 * * *",
    "retention": 30
  }
}
```

---

## 🐳 Docker Deployment

### 1. Dockerfile

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

# Install system dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Set Chrome path for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S maskservice && \
    adduser -S maskservice -u 1001

# Change ownership
RUN chown -R maskservice:maskservice /app
USER maskservice

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node healthcheck.js

# Start application
CMD ["node", "server.js"]
```

### 2. Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  maskservice:
    build: .
    container_name: maskservice-app
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - PORT=8080
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
      - ./config:/app/config
    networks:
      - maskservice-network
    depends_on:
      - redis
    healthcheck:
      test: ["CMD", "node", "healthcheck.js"]
      interval: 30s
      timeout: 3s
      retries: 3

  redis:
    image: redis:7-alpine
    container_name: maskservice-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - maskservice-network

  nginx:
    image: nginx:alpine
    container_name: maskservice-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - maskservice
    networks:
      - maskservice-network

volumes:
  redis-data:

networks:
  maskservice-network:
    driver: bridge
```

### 3. Deploy with Docker

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Scale application
docker-compose up -d --scale maskservice=3

# Update application
docker-compose pull
docker-compose up -d
```

---

## ⚙️ System Configuration

### 1. Component Configuration

Use JSON Editor for safe configuration:

```bash
# Start JSON Editor
npm run component:dev:jsonEditor
# Open: http://localhost:3009

# Configure each component:
# 1. Select component from dropdown
# 2. Select configuration file
# 3. Apply appropriate schema
# 4. Edit values visually
# 5. Validate and save
```

### 2. User Management

Initial user setup:

```javascript
// Create admin user (via JSON Editor or direct config)
{
  "users": [
    {
      "id": "admin",
      "username": "admin",
      "role": "ADMIN",
      "password": "$2b$10$encrypted_password_hash",
      "active": true,
      "created": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 3. Device Configuration

Configure connected devices:

```json
{
  "devices": {
    "pressure_sensors": {
      "enabled": true,
      "update_interval": 1000,
      "alarm_thresholds": {
        "high": 6.0,
        "low": 0.5
      }
    },
    "temperature_sensors": {
      "enabled": true,
      "update_interval": 5000
    }
  }
}
```

### 4. Display Configuration

7.9" display setup:

```json
{
  "display": {
    "width": 1280,
    "height": 400,
    "orientation": "landscape",
    "touch": {
      "enabled": true,
      "virtual_keyboard": true,
      "prevent_native_keyboard": true
    },
    "scaling": {
      "dpi": 96,
      "zoom": 1.0
    }
  }
}
```

---

## 📊 Monitoring & Maintenance

### 1. Health Monitoring

```bash
# System health check
npm run analyze

# Component health monitoring
curl http://localhost:8080/health

# Detailed component status
curl http://localhost:8080/api/components/health
```

### 2. Log Management

```bash
# Application logs
tail -f /var/log/maskservice/app.log

# System logs
sudo journalctl -u maskservice -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 3. Backup Strategy

```bash
# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups/maskservice"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup application
tar -czf "$BACKUP_DIR/app_$DATE.tar.gz" \
    /opt/maskservice/1001.mask.services \
    --exclude=node_modules \
    --exclude=logs

# Backup configuration
cp -r /opt/maskservice/1001.mask.services/config \
    "$BACKUP_DIR/config_$DATE"

# Backup database
cp /opt/maskservice/data/maskservice.db \
    "$BACKUP_DIR/database_$DATE.db"

# Clean old backups (keep 30 days)
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +30 -delete
```

### 4. Update Procedure

```bash
# 1. Stop service
sudo systemctl stop maskservice

# 2. Backup current version
sudo cp -r /opt/maskservice/1001.mask.services \
    /opt/backups/maskservice_$(date +%Y%m%d_%H%M%S)

# 3. Update application
cd /opt/maskservice/1001.mask.services
git pull origin main
npm install

# 4. Run health check
npm run analyze

# 5. Start service
sudo systemctl start maskservice

# 6. Verify deployment
curl http://localhost:8080/health
```

---

## 🚨 Troubleshooting

### Common Issues

#### 1. Service Won't Start

```bash
# Check service status
sudo systemctl status maskservice

# Check logs
sudo journalctl -u maskservice -n 50

# Common fixes:
# - Check port availability: sudo netstat -tlnp | grep :8080
# - Verify permissions: ls -la /opt/maskservice
# - Check Node.js version: node --version
```

#### 2. Components Not Loading

```bash
# Run component analysis
npm run analyze

# Check component structure
ls -la js/features/*/0.1.0/

# Verify configuration
npm run config:validate

# Fix common issues:
# - Regenerate missing files: npm run module:init-all
# - Update screenshots: npm run screenshots
# - Fix permissions: sudo chown -R maskservice:maskservice /opt/maskservice
```

#### 3. JSON Editor Issues

```bash
# Start JSON Editor individually
npm run component:dev:jsonEditor

# Check browser console for errors
# Common fixes:
# - Clear browser cache
# - Check file permissions
# - Verify component configuration files exist
```

#### 4. Display Issues (7.9" Screen)

```bash
# Check display configuration
xrandr  # On Linux systems

# Verify touch interface
xinput list  # Check touch devices

# Browser optimization
# - Force landscape mode in browser settings
# - Disable browser zoom
# - Enable kiosk mode: chromium --kiosk --disable-infobars
```

#### 5. Performance Issues

```bash
# Check system resources
htop
df -h
free -m

# Monitor application
npm run analyze
curl http://localhost:8080/metrics

# Optimization steps:
# - Restart service: sudo systemctl restart maskservice
# - Clear logs: sudo truncate -s 0 /var/log/maskservice/app.log
# - Update components: npm run screenshots
```

### Emergency Recovery

```bash
# 1. Stop all services
sudo systemctl stop maskservice nginx

# 2. Restore from backup
cd /opt/backups
tar -xzf maskservice_YYYYMMDD_HHMMSS.tar.gz -C /opt/

# 3. Restore configuration
cp -r config_YYYYMMDD_HHMMSS/* /opt/maskservice/1001.mask.services/config/

# 4. Restore database
cp database_YYYYMMDD_HHMMSS.db /opt/maskservice/data/maskservice.db

# 5. Restart services
sudo systemctl start maskservice nginx

# 6. Verify recovery
curl http://localhost:8080/health
npm run analyze
```

### Support Contacts

```
System Issues: Check logs and run npm run analyze
Component Issues: Use JSON Editor for configuration
Hardware Issues: Check device connections and drivers
Performance Issues: Monitor system resources
Security Issues: Review access logs and user permissions
```

---

## 🔒 Security Considerations

### Production Security Checklist

- [ ] Change default passwords
- [ ] Enable HTTPS with valid certificates
- [ ] Configure firewall rules
- [ ] Set up intrusion detection
- [ ] Enable audit logging
- [ ] Regular security updates
- [ ] Backup encryption
- [ ] Access control validation

### Maintenance Schedule

```
Daily:
- Check service status
- Review error logs
- Monitor disk space

Weekly:
- Run health analysis
- Update component screenshots
- Check backup integrity

Monthly:
- Security updates
- Performance optimization
- Configuration review
- User access audit

Quarterly:
- Full system backup
- Disaster recovery test
- Security assessment
- Documentation update
```

---

**MASKSERVICE C20 1001 Deployment Guide v3.0**  
*Reliable deployment for industrial control systems*
