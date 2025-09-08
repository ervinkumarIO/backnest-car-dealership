# 🔐 Authentication System Documentation

## Overview

The authentication system implements a **multi-strategy approach** combining JWT tokens and session-based authentication with role-based access control (RBAC). It supports three user types: Master, Admin, and Staff with hierarchical permissions.

## 🏗️ Authentication Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Authentication Flow                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  1. Login Request                           │
│         POST /auth/admin/login or /auth/staff/login         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              2. Credential Validation                       │
│        AuthService.validateUser(email, password)           │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│               3. Password Verification                       │
│           bcrypt.compare(password, hashedPassword)          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│               4. JWT Token Generation                        │
│              JwtService.sign(payload)                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                5. Response with Token                        │
│          { user, access_token, type }                       │
└─────────────────────────────────────────────────────────────┘
```

## 📁 File Structure

```
src/auth/
├── auth.module.ts              # Authentication module configuration
├── auth.service.ts             # Core authentication business logic
├── auth.controller.ts          # Authentication endpoints
├── session.serializer.ts      # Session persistence logic
├── strategies/
│   ├── jwt.strategy.ts         # JWT validation strategy
│   └── local.strategy.ts       # Username/password validation
└── dto/
    └── login.dto.ts            # Login request validation
```

## 🔧 Core Components

### 1. **AuthModule** (`src/auth/auth.module.ts`)

**Purpose**: Configures authentication providers and strategies.

```typescript
@Module({
  imports: [
    ConfigModule,                    // Environment configuration
    PassportModule.register({        // Passport configuration
      defaultStrategy: 'jwt',        // Default to JWT strategy
      session: true                  // Enable session support
    }),
    JwtModule.registerAsync({        // JWT configuration
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET', 'fallback-secret'),
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Admin, Staff]),  // Database entities
  ],
  providers: [
    AuthService,        // Core authentication service
    JwtStrategy,        // JWT token validation
    LocalStrategy,      // Username/password validation
    SessionSerializer,  // Session persistence
  ],
  controllers: [AuthController],
  exports: [AuthService],  // Make AuthService available to other modules
})
```

**Key Features**:
- **Dual Strategy Support**: JWT and Session authentication
- **Environment Configuration**: JWT secret from environment variables
- **Database Integration**: Access to Admin and Staff entities
- **Module Exports**: AuthService available for dependency injection

### 2. **AuthService** (`src/auth/auth.service.ts`)

**Purpose**: Core business logic for authentication operations.

#### Key Methods:

##### `validateUser(email, password, userType)`
```typescript
async validateUser(email: string, password: string, userType: 'admin' | 'staff' = 'admin'): Promise<Admin | Staff | null> {
  let user: Admin | Staff | null = null;
  
  // Find user by type and active status
  if (userType === 'admin') {
    user = await this.adminRepository.findOne({ where: { email, is_active: true } });
  } else {
    user = await this.staffRepository.findOne({ where: { email, is_active: true } });
  }

  // Verify password using bcrypt
  if (user && await bcrypt.compare(password, user.password)) {
    return user;
  }
  return null;
}
```

**Security Features**:
- **Active User Check**: Only active users can authenticate
- **Password Hashing**: bcrypt comparison with 12 salt rounds
- **Type Safety**: Separate admin/staff authentication paths

##### `login(loginDto, userType)`
```typescript
async login(loginDto: LoginDto, userType: 'admin' | 'staff' = 'admin'): Promise<AuthResult> {
  const user = await this.validateUser(loginDto.email, loginDto.password, userType);
  if (!user) {
    throw new UnauthorizedException('Invalid credentials');
  }

  const payload: JwtPayload = {
    sub: user.id,           // Subject (user ID)
    email: user.email,      // User email
    role: user.role,        // User role for authorization
    type: userType,         // User type (admin/staff)
    name: user.name,        // Display name
  };

  return {
    user,
    access_token: this.jwtService.sign(payload),
    type: userType,
  };
}
```

**JWT Payload Structure**:
- `sub`: User ID (standard JWT claim)
- `email`: User's email address
- `role`: User's role for RBAC
- `type`: Distinguishes admin from staff
- `name`: User's display name

##### `hashPassword(password)`
```typescript
async hashPassword(password: string): Promise<string> {
  const saltRounds = 12;  // High security salt rounds
  return bcrypt.hash(password, saltRounds);
}
```

### 3. **JWT Strategy** (`src/auth/strategies/jwt.strategy.ts`)

**Purpose**: Validates JWT tokens on protected routes.

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),  // Extract from Authorization header
      ignoreExpiration: false,                                   // Enforce token expiration
      secretOrKey: configService.get('JWT_SECRET', 'fallback-secret'),
    });
  }

  async validate(payload: JwtPayload) {
    // Verify user still exists and is active
    const user = await this.authService.findUserById(payload.sub, payload.type);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    
    // Return user object for request context
    return {
      ...user,
      userType: payload.type,  // Add type for role-based access
    };
  }
}
```

**Security Features**:
- **Token Extraction**: Standard Bearer token format
- **Expiration Enforcement**: Tokens expire after 24 hours
- **User Verification**: Confirms user still exists and is active
- **Type Preservation**: Maintains admin/staff distinction

### 4. **Local Strategy** (`src/auth/strategies/local.strategy.ts`)

**Purpose**: Handles username/password authentication for session-based login.

```typescript
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });  // Use email instead of username
  }

  async validate(email: string, password: string, userType: 'admin' | 'staff' = 'admin'): Promise<any> {
    const user = await this.authService.validateUser(email, password, userType);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }
}
```

### 5. **Session Serializer** (`src/auth/session.serializer.ts`)

**Purpose**: Manages user session persistence and deserialization.

```typescript
@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private authService: AuthService) {
    super();
  }

  // Store minimal user info in session
  serializeUser(user: Admin | Staff, done: (err: any, user: { id: number; type: 'admin' | 'staff' }) => void): void {
    const userType = 'role' in user && ['master', 'admin'].includes(user.role) ? 'admin' : 'staff';
    done(null, { id: user.id, type: userType });
  }

  // Retrieve full user object from session data
  async deserializeUser(
    payload: { id: number; type: 'admin' | 'staff' },
    done: (err: any, user: Admin | Staff | null) => void,
  ): Promise<void> {
    try {
      const user = await this.authService.findUserById(payload.id, payload.type);
      if (!user) {
        return done(new Error('User not found'), null);
      }
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  }
}
```

## 🛡️ Role-Based Access Control (RBAC)

### Role Hierarchy
```
Master (role: 'master')
├── Full system access
├── Can manage all Admins
├── Can manage all Staff (any branch)
├── Can perform all car operations
└── System configuration access

Admin (role: 'admin')  
├── Limited system access
├── Cannot manage other Admins
├── Can manage Staff (same branch only)
├── Can perform car operations
└── Branch-restricted access

Staff (role: 'manager'|'sales'|'support')
├── Basic system access
├── Cannot manage users
├── Limited car access (implementation dependent)
└── Own profile management only
```

### Guards Implementation

#### **RolesGuard** (`src/common/guards/roles.guard.ts`)
```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required roles from decorator
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;  // No role requirement
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      return false;  // No authenticated user
    }

    // Check if user has required role
    return requiredRoles.some((role) => user.role === role);
  }
}
```

#### **Role Decorators** (`src/common/decorators/roles.decorator.ts`)
```typescript
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

// Convenience decorators
export const MasterOnly = () => Roles(AdminRole.MASTER);
export const AdminOnly = () => Roles(AdminRole.ADMIN, AdminRole.MASTER);
export const StaffOnly = () => Roles(StaffRole.MANAGER, StaffRole.SALES, StaffRole.SUPPORT);
```

**Usage Examples**:
```typescript
@Get('admin-only-endpoint')
@AdminOnly()
async adminFunction() { ... }

@Delete('master-only-endpoint')
@MasterOnly() 
async masterFunction() { ... }
```

## 🔄 Authentication Flows

### 1. **JWT Authentication Flow** (Stateless)
```
1. Client sends credentials → POST /auth/admin/login
2. Server validates credentials → AuthService.validateUser()
3. Server generates JWT token → JwtService.sign()
4. Client receives token → { access_token: "eyJ..." }
5. Client includes token in requests → Authorization: Bearer <token>
6. Server validates token → JwtStrategy.validate()
7. Request processed with user context
```

### 2. **Session Authentication Flow** (Stateful)
```
1. Client sends credentials → POST /auth/session/login
2. Server validates credentials → LocalStrategy.validate()
3. Server creates session → SessionSerializer.serializeUser()
4. Client receives session cookie → Set-Cookie: connect.sid=...
5. Client includes cookie in requests → Cookie: connect.sid=...
6. Server deserializes session → SessionSerializer.deserializeUser()
7. Request processed with user context
```

## 🔒 Security Features

### Password Security
- **bcrypt Hashing**: 12 salt rounds (high security)
- **No Plain Text**: Passwords never stored in readable format
- **Password Validation**: Minimum 6 characters required

### Token Security  
- **JWT Expiration**: 24-hour token lifetime
- **Secret Management**: Environment-based JWT secret
- **Token Validation**: Every request validates token freshness
- **User Verification**: Confirms user still exists and is active

### Session Security
- **Secure Cookies**: HttpOnly and Secure flags (production)
- **Session Expiration**: Configurable session timeout
- **Cross-Site Protection**: CSRF token integration ready

### Authorization Security
- **Role-Based Access**: Hierarchical permission system
- **Branch Isolation**: Admins restricted to their branch
- **Active User Check**: Deactivated users cannot authenticate
- **Granular Permissions**: Method-level access control

## 🛠️ Configuration

### Environment Variables
```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Session Configuration  
SESSION_SECRET=your-session-secret-change-this-in-production

# Database Configuration
DB_HOST=localhost
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=car_dealership
```

### Module Configuration
```typescript
// JWT Configuration
JwtModule.registerAsync({
  useFactory: (configService: ConfigService) => ({
    secret: configService.get('JWT_SECRET', 'fallback-secret'),
    signOptions: { expiresIn: '24h' },
  }),
}),

// Passport Configuration
PassportModule.register({
  defaultStrategy: 'jwt',  // Primary authentication method
  session: true           // Enable session support
}),
```

## 🧪 Testing Authentication

### Login Test
```bash
# Admin Login
curl -X POST http://localhost:3000/api/v1/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# Staff Login  
curl -X POST http://localhost:3000/api/v1/auth/staff/login \
  -H "Content-Type: application/json" \
  -d '{"email":"staff@example.com","password":"password123"}'
```

### Protected Route Test
```bash
# Using JWT Token
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

This authentication system provides enterprise-level security with flexibility for both API and web application usage patterns. 