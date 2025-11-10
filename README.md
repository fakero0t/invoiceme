# InvoiceMe

Invoice management system for creating, tracking, and managing invoices with customer management, line items, payments, and PDF generation.

**Technical Writeup**: See [writeup.txt](./writeup.txt) for architecture details.

## Stack

- **Backend**: Node.js + TypeScript + Express
- **Frontend**: Vue 3 + TypeScript + Vite
- **Database**: PostgreSQL 14+
- **Auth**: AWS Cognito (basic auth in dev)
- **Storage**: AWS S3
- **PDF**: Invoice-Generator.com API

## Architecture

- **DDD**: Bounded contexts (Customer, Invoice, Payment, User)
- **CQRS**: Separate command/query handlers
- **VSA**: Feature-based organization

### Folder Structure

#### Backend (`/`)
```
src/
├── features/           # Feature-based organization (vertical slices)
├── domain/            # Domain entities, value objects
├── infrastructure/    # Database, external services
├── shared/            # Shared utilities, middleware, types
└── config/            # Configuration and environment validation
```

#### Frontend (`/invoice-frontend`)
```
src/
├── features/          # Feature modules (auth, customers, invoices, payments)
├── shared/            # Shared components, composables, api, types
├── router/            # Vue Router configuration
├── stores/            # Pinia state management
└── assets/            # Static assets
```

## Prerequisites

- **Node.js**: v18+ (LTS recommended)
- **PostgreSQL**: v14+
- **npm**: v9+
- **AWS Account** (for Cognito and S3)
- **Invoice-Generator.com Account** (free tier available)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd invoice-frontend
npm install
cd ..
```

### 2. Database Setup

#### Option A: Local PostgreSQL

```bash
# Install PostgreSQL (macOS with Homebrew)
brew install postgresql@14
brew services start postgresql@14

# Create database and user
psql postgres
```

```sql
CREATE DATABASE invoice_db;
CREATE USER invoice_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE invoice_db TO invoice_user;
\q
```

#### Option B: AWS RDS PostgreSQL

1. Create an RDS PostgreSQL instance (db.t3.micro for development)
2. Configure security group to allow your IP
3. Note the connection string

### 3. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your actual credentials
nano .env
```

**Required Configuration:**

1. **Database**: Update `DATABASE_URL` with your PostgreSQL credentials
2. **AWS Cognito**: 
   - Create a User Pool in AWS Cognito console
   - Note the `User Pool ID` and `App Client ID`
   - Update `AWS_COGNITO_USER_POOL_ID` and `AWS_COGNITO_CLIENT_ID`
3. **AWS S3**:
   - Create an S3 bucket for invoice PDFs
   - Update `AWS_S3_BUCKET_NAME`
4. **AWS Credentials**: Update `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
5. **Invoice Generator**: 
   - Sign up at https://invoice-generator.com
   - Get API key from Settings → API Keys
   - Update `INVOICE_GENERATOR_API_KEY`

### 4. Run Database Migrations

```bash
# Run migrations to create tables
npm run migrate:up

# Verify tables were created
psql -d invoice_db -c "\dt"
```

### 5. Start the Application

#### Development Mode

```bash
# Terminal 1: Start backend server
npm run dev
# Backend runs on http://localhost:3000

# Terminal 2: Start frontend dev server
cd invoice-frontend
npm run dev
# Frontend runs on http://localhost:5173
```

#### Production Build

```bash
# Build backend
npm run build
npm start

# Build frontend
cd invoice-frontend
npm run build
npm run preview
```

## Available Scripts

### Backend

- `npm run dev` - Start development server with hot reload (nodemon)
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests with Jest
- `npm run lint` - Lint code with ESLint
- `npm run format` - Format code with Prettier
- `npm run migrate:up` - Run database migrations
- `npm run migrate:down` - Rollback last migration
- `npm run migrate:create <name>` - Create new migration file

### Frontend

- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - Run TypeScript type checking

## AWS Infrastructure Setup

### AWS Cognito User Pool

1. Go to AWS Console → Cognito → User Pools
2. Click "Create user pool"
3. Configure:
   - **User attributes**: Email (required, sign-in), Name (required)
   - **Password policy**: Min 8 chars, uppercase, lowercase, numbers
   - **MFA**: Optional (disabled for MVP)
   - **Token expiration**: Access token 1 hour, Refresh token 30 days
4. Create app client:
   - Name: `invoice-mvp-client`
   - No client secret (for SPA)
   - Auth flows: ALLOW_USER_PASSWORD_AUTH, ALLOW_REFRESH_TOKEN_AUTH
5. Note User Pool ID and App Client ID

### AWS S3 Bucket

1. Go to AWS Console → S3
2. Create bucket:
   - Name: `invoice-pdfs-dev` (or your environment)
   - Region: Same as your application
   - Block all public access: Enabled
   - Versioning: Enabled
   - Encryption: AES-256 or AWS-KMS
3. Configure IAM policy for your application user/role:
   - Allow `s3:PutObject`, `s3:GetObject` on your bucket

### Invoice-Generator.com

1. Sign up at https://invoice-generator.com
2. Navigate to Settings → API Keys
3. Create new API key
4. Note the API key (free tier: 100 invoices/month)

## Testing

### Backend Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run with coverage
npm run test:coverage

# Run performance tests
npm run test:perf

# Watch mode
npm run test:watch
```

### Test Coverage Targets
- **Domain Layer**: >90% coverage
- **Application Layer**: >85% coverage
- **Integration Tests**: 20+ tests
- **Unit Tests**: 100+ tests
- **Overall Coverage**: >80%

### Frontend Tests

```bash
cd invoice-frontend

# Run E2E tests
npm run test:e2e

# Run E2E tests in headless mode
npm run test:e2e:ci
```

## API Health Check

Once the backend is running, test the health endpoint:

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-11-08T12:00:00.000Z"
}
```

## Additional Documentation

- [writeup.txt](./writeup.txt) - Architecture overview
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed architecture documentation
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [OPERATIONS.md](./OPERATIONS.md) - Operations guide

## Troubleshooting

### Database Connection Issues

```bash
# Test PostgreSQL connection
psql -h localhost -U invoice_user -d invoice_db

# Check if PostgreSQL is running
brew services list  # macOS
```

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### TypeScript Compilation Errors

```bash
# Clean build directory
rm -rf dist/

# Rebuild
npm run build
```