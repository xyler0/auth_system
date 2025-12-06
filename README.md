# Auth API System - Documentation

##  Quick Start

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

### Installation

```bash
# Clone the repository
git clone
cd auth-api-system

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations (auto with synchronize in dev)
npm run start:dev
```

## API Endpoints

### Authentication Endpoints

#### 1. Signup (Create User)
```http
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe" // optional
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### 2. Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:** Same as signup

---

### API Key Management

#### 3. Create API Key
```http
POST /keys/create
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "Production Service",
  "description": "API key for production microservice",
  "expiresAt": "2025-12-31T23:59:59Z"
}
```

**Response:**
```json
{
  "id": "key-uuid",
  "key": "ak_abc123def456...",  
  "name": "Production Service",
  "description": "API key for production microservice",
  "expiresAt": "2025-12-31T23:59:59.000Z",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

#### 4. List API Keys
```http
GET /keys
Authorization: Bearer <jwt-token>
```

**Response:**
```json
[
  {
    "id": "key-uuid-1",
    "name": "Production Service",
    "description": "API key for production microservice",
    "expiresAt": "2025-12-31T23:59:59.000Z",
    "lastUsedAt": "2024-01-15T14:20:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```
*Note: Actual key value is NOT returned for security*

#### 5. Revoke API Key
```http
POST /keys/{keyId}/revoke
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "message": "API key revoked successfully"
}
```

#### 6. Delete API Key
```http
DELETE /keys/{keyId}
Authorization: Bearer <jwt-token>
```

---

### Protected Endpoints (Examples)

#### 7. User Only (JWT Required)
```http
GET /protected/user-only
Authorization: Bearer <jwt-token>
```

#### 8. Service Only (API Key Required)
```http
GET /protected/service-only
X-API-Key: ak_abc123def456...
```

#### 9. Flexible (Both JWT and API Key)
```http
GET /protected/flexible
# Either:
Authorization: Bearer <jwt-token>
# Or:
X-API-Key: ak_abc123def456...
```

#### 10. Get Profile
```http
GET /protected/profile
# JWT or API Key
```

---

## 🔐 Authentication Methods

### Method 1: JWT (User Authentication)

**Usage:** End-user authentication, web/mobile apps

**Flow:**
1. User signs up or logs in → receives JWT token
2. Include token in requests: `Authorization: Bearer <token>`
3. Token expires after configured time (default: 1 hour)

**Example:**
```javascript
// Login
const response = await fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const { access_token } = await response.json();

// Use token
const data = await fetch('http://localhost:3000/protected/flexible', {
  headers: { 'Authorization': `Bearer ${access_token}` }
});
```

---

### Method 2: API Key (Service-to-Service)

**Usage:** Backend services, microservices, integrations

**Flow:**
1. User creates API key via JWT-authenticated endpoint
2. Service includes key in requests: `X-API-Key: <key>`
3. Key can have optional expiration date

**Example:**
```javascript
// Create API key (requires JWT first)
const keyResponse = await fetch('http://localhost:3000/keys/create', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${jwt_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'My Service',
    expiresAt: '2025-12-31T23:59:59Z'
  })
});

const { key } = await keyResponse.json();

// Use API key
const data = await fetch('http://localhost:3000/protected/service-only', {
  headers: { 'X-API-Key': key }
});
```

---

## 🔒 Security Features

### Password Security
- Passwords hashed with bcrypt (10 rounds)
- Minimum 6 characters required
- Passwords never returned in responses

### JWT Security
- Signed with secret key
- Configurable expiration
- Includes user ID and email
- Validated on each request

### API Key Security
- Generated with UUID v4 (cryptographically secure)
- Prefix: `ak_` for easy identification
- Stored in database for validation
- Can be revoked instantly
- Optional expiration dates
- Last used timestamp tracking

### Validation
- All inputs validated with class-validator
- Strict whitelist mode (rejects unknown properties)
- Email format validation
- Strong error messages

---

## 🛡️ Guard Usage

### Available Guards

1. **JwtAuthGuard** - JWT only
```typescript
@UseGuards(JwtAuthGuard)
@Get('endpoint')
```

2. **ApiKeyAuthGuard** - API Key only
```typescript
@UseGuards(ApiKeyAuthGuard)
@Get('endpoint')
```

3. **CombinedAuthGuard** - Both JWT and API Key
```typescript
@UseGuards(CombinedAuthGuard)
@Get('endpoint')
```

### Custom Decorators

#### @CurrentUser()
Access authenticated user data:
```typescript
@Get('profile')
@UseGuards(CombinedAuthGuard)
getProfile(@CurrentUser() user: any) {
  // user.userId
  // user.email (for JWT)
  // user.keyId (for API key)
  // user.authType ('jwt' or 'api-key')
}
```

---

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  name VARCHAR,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### API Keys Table
```sql
CREATE TABLE api_keys (
  id UUID PRIMARY KEY,
  key VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  description VARCHAR,
  is_revoked BOOLEAN DEFAULT false,
  expires_at TIMESTAMP,
  last_used_at TIMESTAMP,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🧪 Testing

### Manual Testing with cURL

**1. Signup:**
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'
```

**2. Login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

**3. Create API Key:**
```bash
curl -X POST http://localhost:3000/keys/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Key","description":"For testing"}'
```

**4. Access with JWT:**
```bash
curl http://localhost:3000/protected/flexible \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**5. Access with API Key:**
```bash
curl http://localhost:3000/protected/flexible \
  -H "X-API-Key: YOUR_API_KEY"
```

---

## 🚦 Error Responses

All errors follow consistent format:

```json
{
  "statusCode": 401,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/protected/user-only",
  "method": "GET",
  "message": "Unauthorized",
  "error": "UnauthorizedException"
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid auth)
- `404` - Not Found
- `409` - Conflict (e.g., email already exists)
- `500` - Internal Server Error

---

## ⚙️ Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=auth_system

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRATION=1h

# Application
PORT=3000
NODE_ENV=development
```

---

## 📝 Best Practices

### For JWT
- ✅ Use for user-facing applications
- ✅ Set appropriate expiration times
- ✅ Store securely on client (httpOnly cookies or secure storage)
- ✅ Refresh tokens for long sessions
- ❌ Don't store sensitive data in JWT payload

### For API Keys
- ✅ Use for service-to-service communication
- ✅ Set expiration dates for security
- ✅ Rotate keys periodically
- ✅ Revoke compromised keys immediately
- ✅ Monitor last used timestamps
- ❌ Don't share keys in public repositories
- ❌ Don't hardcode keys in application code

---

## 🔄 Development Workflow

```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Run tests
npm run test

# Run tests with coverage
npm run test:cov
```

---

## Project Structure

```
src/
├── auth/                    # Authentication module
│   ├── decorators/         # Custom decorators
│   ├── dto/                # Data transfer objects
│   ├── guards/             # Route guards
│   ├── strategies/         # Passport strategies
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── users/                   # User management
│   ├── dto/
│   ├── entities/
│   ├── users.service.ts
│   └── users.module.ts
├── api-keys/               # API key management
│   ├── dto/
│   ├── entities/
│   ├── api-keys.service.ts
│   └── api-keys.module.ts
├── protected/              # Example protected routes
│   ├── protected.controller.ts
│   └── protected.module.ts
├── common/                 # Shared utilities
│   ├── filters/           # Exception filters
│   └── interceptors/      # Interceptors
├── config/                # Configuration files
│   └── database.config.ts
├── app.module.ts
└── main.ts
```

---

## 🤝 Contributing

1. Create feature branch
2. Make changes with descriptive commits
3. Add tests for new features
4. Update documentation
5. Submit pull request

---

## 🆘 Support

For issues and questions:
- Check documentation above
- Review example endpoints in `/protected`
- Check error messages (they're descriptive!)
- Enable logging in development mode

---
