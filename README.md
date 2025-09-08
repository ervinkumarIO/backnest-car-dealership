<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

# Car Dealership Backend - NestJS

A comprehensive car dealership management system converted from Laravel to NestJS with TypeScript, featuring multi-role authentication, car management, image uploads, and public APIs.

## 🚀 Features

### Authentication & Authorization
- **Multi-role system**: Master, Admin, Staff with proper access control
- **JWT + Session authentication** for flexible API access
- **Branch-based filtering** for staff management
- **Role-based guards and decorators**

### Car Management
- **Complete CRUD operations** for car inventory
- **Bulk operations**: Price updates, status changes, delete multiple cars
- **Advanced search & filtering** with faceted search
- **Car statistics and analytics**
- **Public car viewing** for customers

### Image Management
- **AWS S3 integration** with presigned URLs
- **Multiple image upload** per car
- **Image deletion and management**
- **Automatic image linking** by chassis number

### Staff & Admin Management  
- **Admin management** (Master-only access)
- **Staff management** with branch filtering
- **User activation/deactivation**
- **Role-based permissions**

## 🛠️ Tech Stack

- **Framework**: NestJS with TypeScript
- **Database**: MySQL with TypeORM
- **Authentication**: Passport.js (JWT + Local)
- **File Storage**: AWS S3
- **Validation**: class-validator
- **Security**: Helmet, CORS, Rate limiting

## 📋 Prerequisites

- Node.js (v16 or higher)
- MySQL database
- AWS S3 bucket (for image storage)

## 🔧 Installation

1. **Clone and install dependencies**
```bash
npm install
```

2. **Environment setup**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Database setup**
```bash
# Create database 'car_dealership'
# Update .env with your MySQL credentials
```

4. **Run the application**
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## 🌐 API Endpoints

### Authentication
```
POST /api/v1/auth/admin/login     # Admin/Master login
POST /api/v1/auth/staff/login     # Staff login
GET  /api/v1/auth/profile         # Get current user
```

### Admin Management (Master only)
```
GET    /api/v1/admin/admins       # List all admins
POST   /api/v1/admin/admins       # Create admin
GET    /api/v1/admin/admins/:id   # Get admin
PATCH  /api/v1/admin/admins/:id   # Update admin
DELETE /api/v1/admin/admins/:id   # Delete admin
```

### Staff Management (Admin+ access)
```
GET    /api/v1/admin/staff                # List staff (filtered by branch)
POST   /api/v1/admin/staff                # Create staff
GET    /api/v1/admin/staff/sold-by-selector # Get staff IDs for dropdowns
GET    /api/v1/admin/staff/:id            # Get staff
PATCH  /api/v1/admin/staff/:id            # Update staff
DELETE /api/v1/admin/staff/:id            # Delete staff
```

### Car Management (Admin+ access)
```
GET    /api/v1/cars                    # List all cars
GET    /api/v1/cars/listing            # Car listing view
GET    /api/v1/cars/stats              # Car statistics
GET    /api/v1/cars/search?q=term     # Search cars
GET    /api/v1/cars/facets            # Get filter facets
POST   /api/v1/cars/store-new         # Create new car
POST   /api/v1/cars/bulk              # Bulk create cars
PATCH  /api/v1/cars/bulk/price        # Bulk update prices
PATCH  /api/v1/cars/bulk/status       # Bulk update status
PATCH  /api/v1/cars/bulk/public       # Bulk update public visibility
DELETE /api/v1/cars/bulk              # Bulk delete cars
GET    /api/v1/cars/:chassisNo        # Get car by chassis number
PATCH  /api/v1/cars/:chassisNo        # Update car
DELETE /api/v1/cars/:chassisNo        # Delete car
```

### Car Images (Admin+ access)
```
POST   /api/v1/cars/images/upload                    # Upload images
POST   /api/v1/cars/images/presigned-urls            # Generate presigned URLs
POST   /api/v1/cars/images/car-presigned-urls        # Generate car-specific presigned URLs
POST   /api/v1/cars/images/update-car-images         # Update car image URLs
DELETE /api/v1/cars/images/:chassisNo/images         # Delete car images
POST   /api/v1/cars/images/:chassisNo/add            # Add images to car
```

### Public API (No authentication)
```
GET /api/v1/public/cars              # Browse public cars
GET /api/v1/public/cars/best         # Get best cars (top 4)
GET /api/v1/public/cars/search       # Search public cars
GET /api/v1/public/cars/facets       # Get public filter facets
GET /api/v1/public/cars/:chassisNo   # Get public car details
```

## 🔑 Environment Variables

```env
# Database Configuration
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=car_dealership

# Application Configuration
NODE_ENV=development
PORT=3000

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
SESSION_SECRET=your-session-secret-change-this-in-production

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# File Upload Configuration
UPLOAD_DEST=./uploads
MAX_FILE_SIZE=5242880

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-west-2
AWS_S3_BUCKET=car-dealership-images
```

## 🏗️ Project Structure

```
src/
├── auth/              # Authentication module
├── admin/             # Admin management
├── staff/             # Staff management  
├── cars/              # Car management system
├── entities/          # Database entities
├── common/            # Shared utilities (guards, decorators, filters)
└── main.ts            # Application entry point
```

## 🔐 Role-Based Access Control

- **Master**: Full system access, can manage admins and staff
- **Admin**: Can manage staff (same branch only) and cars
- **Staff**: Basic access (can be extended as needed)

## 🚦 Getting Started

1. **Create a Master user** (run once in database):
```sql
INSERT INTO admins (email, password, name, role, branch, is_active) 
VALUES ('master@cardealer.com', '$2b$12$hashedpassword', 'Master Admin', 'master', 'HQ', true);
```

2. **Test the API** with your favorite HTTP client
3. **Login as Master** to create admins and staff
4. **Start managing your car inventory**

## 📈 Production Deployment

1. **Update environment variables** for production
2. **Set up MySQL database** with proper user permissions
3. **Configure AWS S3 bucket** with appropriate CORS settings
4. **Deploy with PM2** or your preferred process manager
5. **Set up NGINX** reverse proxy for production

---

🎉 **Your Laravel car dealership system has been successfully converted to NestJS!**

For support or questions, please refer to the NestJS documentation or create an issue.
