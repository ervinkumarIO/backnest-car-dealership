# Supabase Setup Guide for Car Dealership Backend

## 🚀 Step-by-Step Supabase Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `car-dealership-backend`
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users
6. Click "Create new project"
7. Wait for project to be ready (2-3 minutes)

### 2. Get Connection Details

Once your project is ready:

1. Go to **Settings** → **Database**
2. Copy the following details:
   - **Host**: `db.your-project-ref.supabase.co`
   - **Database name**: `postgres`
   - **Port**: `5432`
   - **User**: `postgres`
   - **Password**: (the one you created)

3. Go to **Settings** → **API**
4. Copy:
   - **Project URL**: `https://your-project-ref.supabase.co`
   - **anon public key**: `eyJ...`
   - **service_role secret key**: `eyJ...`

### 3. Update Environment Variables

Create a `.env` file in your project root with:

```env
# Database Configuration (Supabase PostgreSQL)
DB_HOST=db.your-project-ref.supabase.co
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your-supabase-db-password
DB_DATABASE=postgres

# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Application Configuration
NODE_ENV=development
PORT=3000

# Security Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# AWS S3 Configuration (for image storage)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket-name

# Session Configuration (if using session auth)
SESSION_SECRET=your-session-secret

# File Upload Configuration
UPLOAD_DEST=./uploads
MAX_FILE_SIZE=5242880

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=1000
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Database Migrations

You have two options:

#### Option A: Use the API endpoint (Recommended)
```bash
# Start your application
npm run start:dev

# In another terminal, run the setup
curl -X POST http://localhost:3000/api/v1/public/database/setup
```

#### Option B: Manual SQL execution
1. Go to Supabase Dashboard → **SQL Editor**
2. Copy and paste the contents of `src/database/migrations/001-create-tables.sql`
3. Click "Run"
4. Copy and paste the contents of `src/database/seeders/001-seed-data.sql`
5. Click "Run"

### 6. Verify Setup

Test the connection:
```bash
curl -X GET http://localhost:3000/api/v1/public/database/status
```

You should see:
```json
{
  "status": "connected",
  "admins": 4,
  "staff": 4,
  "cars": 8,
  "database": "postgres",
  "type": "postgres"
}
```

## 🔧 Supabase Features You Can Use

### 1. Real-time Subscriptions
Supabase provides real-time capabilities. You can enable real-time for your tables:

```sql
-- Enable real-time for cars table
ALTER PUBLICATION supabase_realtime ADD TABLE cars;

-- Enable real-time for admins table
ALTER PUBLICATION supabase_realtime ADD TABLE admins;

-- Enable real-time for staff table
ALTER PUBLICATION supabase_realtime ADD TABLE staff;
```

### 2. Row Level Security (RLS)
Enable RLS for better security:

```sql
-- Enable RLS on all tables
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
```

### 3. Database Backups
Supabase automatically handles:
- Daily backups
- Point-in-time recovery
- Database branching for development

## 🚨 Important Notes

1. **SSL Connection**: Supabase requires SSL connections in production
2. **Connection Pooling**: Supabase provides connection pooling automatically
3. **Rate Limiting**: Be aware of Supabase's rate limits
4. **Backup Strategy**: Supabase handles backups, but consider additional strategies for critical data

## 🔍 Troubleshooting

### Connection Issues
- Verify your environment variables are correct
- Check if your IP is whitelisted (if using IP restrictions)
- Ensure SSL is enabled for production

### Migration Issues
- Check the SQL syntax is PostgreSQL compatible
- Verify table names don't conflict with existing tables
- Check for foreign key constraints

### Performance Issues
- Monitor your connection pool usage
- Check Supabase dashboard for query performance
- Consider indexing frequently queried columns

## 📊 Monitoring

Use Supabase Dashboard to monitor:
- Database performance
- API usage
- Real-time connections
- Storage usage
- Authentication metrics
