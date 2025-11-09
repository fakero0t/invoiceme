# Quick Setup Guide - PR1 Complete

## ✅ What's Been Set Up

### Backend Infrastructure
- ✅ Node.js + TypeScript project initialized
- ✅ Express server with CORS and rate limiting
- ✅ PostgreSQL database migrations configured
- ✅ AWS SDK for Cognito and S3
- ✅ Environment variable validation with Zod
- ✅ ESLint + Prettier configured
- ✅ Jest testing framework

### Frontend Infrastructure
- ✅ Vue 3 + TypeScript + Vite
- ✅ Vue Router configured
- ✅ Pinia state management
- ✅ Axios HTTP client with interceptors
- ✅ Folder structure (features, shared, router, stores)

### Development Tools
- ✅ TypeScript strict mode
- ✅ Hot reload (nodemon for backend, Vite for frontend)
- ✅ Database migration system (node-pg-migrate)
- ✅ API proxy configuration (frontend → backend)

## 🚀 Next Steps

### 1. Set Up PostgreSQL Database

**Option A: Local (Recommended for Development)**
```bash
# macOS
brew install postgresql@14
brew services start postgresql@14

# Create database
psql postgres -c "CREATE DATABASE invoice_db;"
psql postgres -c "CREATE USER invoice_user WITH ENCRYPTED PASSWORD 'dev_password';"
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE invoice_db TO invoice_user;"
```

**Option B: Docker**
```bash
docker run --name invoice-postgres \
  -e POSTGRES_DB=invoice_db \
  -e POSTGRES_USER=invoice_user \
  -e POSTGRES_PASSWORD=dev_password \
  -p 5432:5432 \
  -d postgres:14
```

### 2. Configure Environment Variables

```bash
# Copy example file
cp .env.example .env

# Edit with your credentials
nano .env
```

**Minimum Required for Local Development:**
```env
DATABASE_URL=postgresql://invoice_user:dev_password@localhost:5432/invoice_db
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

**For Full Functionality (AWS Setup Required):**
- AWS Cognito User Pool ID & Client ID
- AWS S3 Bucket Name
- AWS Access Keys
- Invoice-Generator.com API Key

See `README.md` for detailed AWS setup instructions.

### 3. Run Database Migrations

```bash
npm run migrate:up
```

### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
npm run dev
# Runs on http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
cd invoice-frontend
npm run dev
# Runs on http://localhost:5173
```

### 5. Verify Setup

**Check Backend:**
```bash
curl http://localhost:3000/health
# Should return: {"status":"ok","timestamp":"..."}
```

**Check Frontend:**
- Open browser to http://localhost:5173
- Should see "Invoice MVP" welcome page

## 📁 Project Structure

```
invoiceme/
├── src/                    # Backend source code
│   ├── features/          # Feature modules (vertical slices)
│   ├── domain/            # Domain models and business logic
│   ├── infrastructure/    # Database, AWS, external services
│   ├── shared/            # Shared utilities and middleware
│   ├── config/            # Configuration and env validation
│   └── index.ts           # Application entry point
├── migrations/            # Database migrations
├── invoice-frontend/      # Frontend application
│   └── src/
│       ├── features/      # Feature modules
│       ├── shared/        # Shared components and utilities
│       ├── router/        # Vue Router
│       ├── stores/        # Pinia stores
│       └── views/         # Page components
└── dist/                  # Build output (backend)
```

## 🔧 Common Commands

```bash
# Backend
npm run dev          # Start dev server
npm run build        # Compile TypeScript
npm start            # Run production build
npm test             # Run tests
npm run lint         # Lint code
npm run format       # Format code

# Frontend
cd invoice-frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run type-check   # Check TypeScript

# Database
npm run migrate:up           # Run migrations
npm run migrate:down         # Rollback migration
npm run migrate:create name  # Create new migration
```

## ⚠️ Important Notes

1. **Environment Variables**: The `.env` file is gitignored. Never commit credentials.

2. **Database Migrations**: Always create migrations for schema changes. Never modify existing migrations after they've been run in production.

3. **AWS Services**: Some features require AWS setup (authentication, file storage). You can develop locally without AWS by skipping auth-related features initially.

4. **Invoice Generator**: Free tier provides 100 invoices/month. Good for MVP testing.

## 🐛 Troubleshooting

**"Environment validation failed"**
- Ensure `.env` file exists and has all required variables
- Check variable formats (URLs, IDs) match expected patterns

**"Cannot connect to database"**
- Verify PostgreSQL is running: `brew services list` (macOS)
- Check DATABASE_URL in `.env` matches your database credentials
- Test connection: `psql -h localhost -U invoice_user -d invoice_db`

**"Port already in use"**
- Backend (3000): `lsof -i :3000` then `kill -9 <PID>`
- Frontend (5173): `lsof -i :5173` then `kill -9 <PID>`

**TypeScript errors in IDE**
- Run: `npm run build` to verify compilation
- Restart TypeScript server in your IDE

## 📚 Next PRs

- **PR2**: Authentication (AWS Cognito integration)
- **PR3**: Customer Management
- **PR4**: Invoice CRUD Operations
- **PR5**: Payment Tracking
- **PR6**: PDF Generation & S3 Storage
- **PR7**: Invoice Email Delivery
- **PR8**: Business Intelligence & Dashboard

## 🎯 Acceptance Criteria - PR1

- ✅ Backend server runs on `localhost:3000`
- ✅ Frontend dev server runs on `localhost:5173`
- ✅ Database connection configured (migrations ready)
- ✅ AWS SDK configured (requires AWS account setup)
- ✅ All configuration documented
- ✅ TypeScript compilation succeeds
- ✅ Linting passes

**Status: PR1 Complete! Ready for PR2.**

