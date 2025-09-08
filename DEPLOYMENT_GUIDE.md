# DigitalOcean App Platform Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Prerequisites
- ✅ GitHub repository: `https://github.com/ervinkumarIO/backnest-car-dealership.git`
- ✅ Supabase PostgreSQL database
- ✅ AWS S3 bucket (for image storage)
- ✅ DigitalOcean account

### 2. Deploy to DigitalOcean App Platform

#### Option A: Using the DigitalOcean Dashboard

1. **Login to DigitalOcean**
   - Go to [DigitalOcean Apps](https://cloud.digitalocean.com/apps)
   - Click "Create App"

2. **Connect GitHub Repository**
   - Choose "GitHub" as source
   - Select repository: `ervinkumarIO/backnest-car-dealership`
   - Branch: `main`
   - Autodeploy: ✅ Enable

3. **Configure App Settings**
   - **App Name**: `car-dealership-backend`
   - **Region**: Choose closest to your users
   - **Plan**: Basic ($5/month) or Pro ($12/month)

4. **Environment Variables** (Add these in the App Platform dashboard):

```env
NODE_ENV=production
PORT=8080
DB_HOST=db.your-project-ref.supabase.co
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your-supabase-password
DB_DATABASE=postgres
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CORS_ORIGIN=https://your-frontend-domain.com
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket-name
```

5. **Review and Deploy**
   - Review settings
   - Click "Create Resources"
   - Wait for deployment (5-10 minutes)

#### Option B: Using doctl CLI

```bash
# Install doctl
# Windows: Download from https://github.com/digitalocean/doctl/releases
# macOS: brew install doctl
# Linux: snap install doctl

# Authenticate
doctl auth init

# Deploy using app spec
doctl apps create --spec .do/app.yaml
```

### 3. Configure Environment Variables

In your DigitalOcean App Platform dashboard:

1. Go to your app → **Settings** → **App-Level Environment Variables**
2. Add each variable as **Encrypted**:

| Variable | Value | Type |
|----------|-------|------|
| `NODE_ENV` | `production` | Plain Text |
| `PORT` | `8080` | Plain Text |
| `DB_HOST` | `db.xxxxx.supabase.co` | Encrypted |
| `DB_PASSWORD` | `your-supabase-password` | Encrypted |
| `JWT_SECRET` | `your-jwt-secret` | Encrypted |
| `CORS_ORIGIN` | `https://your-frontend.com` | Encrypted |
| `AWS_ACCESS_KEY_ID` | `your-aws-key` | Encrypted |
| `AWS_SECRET_ACCESS_KEY` | `your-aws-secret` | Encrypted |
| `AWS_S3_BUCKET` | `your-bucket-name` | Encrypted |

### 4. Database Setup

After deployment, initialize your database:

```bash
# Your app will be available at: https://your-app-name.ondigitalocean.app

# Run database setup
curl -X POST https://your-app-name.ondigitalocean.app/api/v1/public/database/setup
```

### 5. Test Your Deployment

```bash
# Check API status
curl https://your-app-name.ondigitalocean.app/api/v1

# Check database status
curl https://your-app-name.ondigitalocean.app/api/v1/public/database/status

# Test login
curl -X POST https://your-app-name.ondigitalocean.app/api/v1/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"master@dealership.com","password":"password123"}'
```

## 🔧 Configuration Notes

### CORS Configuration
Update `CORS_ORIGIN` to include your frontend domain:
```
https://your-frontend.vercel.app,https://www.your-domain.com
```

### Database Connection
- Uses Supabase PostgreSQL (already configured)
- SSL enabled automatically for production
- Connection pooling handled by Supabase

### File Storage
- AWS S3 for image uploads
- Make sure your S3 bucket allows public read access for car images

### Security
- JWT tokens for authentication
- Rate limiting enabled
- Helmet security headers
- CORS properly configured

## 📊 Monitoring

### DigitalOcean App Platform provides:
- **Logs**: Real-time application logs
- **Metrics**: CPU, Memory, HTTP requests
- **Alerts**: Set up alerts for downtime
- **Deployments**: Automatic deployments on git push

### Health Checks
- Health check endpoint: `/api/v1`
- Database status: `/api/v1/public/database/status`

## 🚀 Scaling

### Vertical Scaling
- Basic: $5/month (512MB RAM, 1 vCPU)
- Professional: $12/month (1GB RAM, 1 vCPU)
- Pro: $24/month (2GB RAM, 2 vCPU)

### Horizontal Scaling
- Increase instance count in app settings
- Load balancing handled automatically

## 🔄 CI/CD

Auto-deployment is enabled:
1. Push to `main` branch
2. DigitalOcean automatically builds and deploys
3. Zero-downtime deployments
4. Rollback available if needed

## 🛠️ Troubleshooting

### Common Issues:

1. **Build Failures**
   - Check build logs in DigitalOcean dashboard
   - Ensure all dependencies in package.json
   - Verify Node.js version compatibility

2. **Database Connection Issues**
   - Verify Supabase credentials
   - Check if IP is whitelisted in Supabase
   - Ensure SSL is enabled

3. **Environment Variables**
   - All secrets should be marked as "Encrypted"
   - Restart app after changing env vars
   - Check for typos in variable names

4. **CORS Issues**
   - Update CORS_ORIGIN with your frontend domain
   - Include both www and non-www versions
   - Use HTTPS in production

### Getting Help:
- DigitalOcean Community: https://www.digitalocean.com/community
- App Platform Docs: https://docs.digitalocean.com/products/app-platform/
- Support tickets: Available with paid plans
