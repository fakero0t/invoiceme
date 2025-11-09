# Invoice System MVP - Task List & Implementation Plan

**Based on:** Invoice MVP PRD v1.5  
**Created:** November 8, 2025  
**Total PRs:** 8

This document organizes the PRD requirements into logical pull requests for systematic implementation. Each PR includes detailed implementation specifications to ensure clarity on what will be built and how it will be implemented.

---

## PR 1: Project Setup & Infrastructure Foundation

**Objective:** Set up development environment, project structure, and core infrastructure

### Backend Setup
- [ ] Initialize Node.js project with TypeScript:
  - Run `npm init -y` to create package.json
  - Set `"type": "module"` for ES modules support (optional) or use CommonJS
  - Configure scripts: `"start"`, `"dev"` (with nodemon), `"build"`, `"test"`
- [ ] Install core dependencies:
  - `npm install express pg axios`
  - `npm install @aws-sdk/client-s3 @aws-sdk/client-cognito-identity-provider`
  - `npm install dotenv cors body-parser express-rate-limit`
- [ ] Install TypeScript and dev dependencies:
  - `npm install --save-dev typescript @types/node @types/express`
  - `npm install --save-dev jest ts-jest @types/jest`
  - `npm install --save-dev nodemon ts-node`
  - `npm install --save-dev eslint prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin`
- [ ] Configure TypeScript (`tsconfig.json`) with strict mode:
  - `"strict": true`
  - `"esModuleInterop": true`
  - `"skipLibCheck": true`
  - `"target": "ES2020"`
  - `"module": "commonjs"`
  - `"outDir": "./dist"`
  - `"rootDir": "./src"`
  - Include/exclude patterns for src and tests
- [ ] Set up ESLint configuration (`.eslintrc.json`):
  - Extend `@typescript-eslint/recommended`
  - Configure rules: no-any, no-explicit-any warnings
  - Set up Prettier integration
- [ ] Set up Prettier configuration (`.prettierrc`):
  - `"semi": true`
  - `"singleQuote": true`
  - `"tabWidth": 2`
  - `"trailingComma": "es5"`
- [ ] Create folder structure following Vertical Slice Architecture:
  ```
  src/
  ├── features/           # Feature-based organization
  ├── domain/            # Domain entities, value objects
  ├── infrastructure/    # Database, external services
  └── shared/            # Shared utilities
  ```

### Frontend Setup
- [ ] Create Vue 3 + TypeScript project using Vite:
  - Run: `npm create vite@latest invoice-frontend -- --template vue-ts`
  - Navigate to project: `cd invoice-frontend`
  - Install initial dependencies: `npm install`
- [ ] Install required dependencies:
  - Router: `npm install vue-router@4`
  - State management: `npm install pinia`
  - HTTP client: `npm install axios`
  - Optional UI: `npm install -D tailwindcss postcss autoprefixer` (if using Tailwind)
- [ ] Configure Vite (`vite.config.ts`):
  - Set up proxy for API calls: `proxy: { '/api': { target: 'http://localhost:3000' } }`
  - Configure build output directory
  - Set up path aliases: `resolve: { alias: { '@': '/src' } }`
- [ ] Create folder structure:
  ```
  src/
  ├── features/          # Feature modules (auth, customers, invoices, payments)
  ├── shared/            # Shared components, composables, api, types
  ├── router/
  ├── stores/
  └── App.vue
  ```
- [ ] Configure Tailwind CSS or chosen UI framework

### Database Setup
- [ ] Set up PostgreSQL instance:
  - **Local development:** Install PostgreSQL 14+ via Homebrew (Mac), apt (Linux), or installer (Windows)
  - **Cloud:** Create AWS RDS PostgreSQL instance (db.t3.micro for development)
  - Verify connection: `psql -h localhost -U postgres`
- [ ] Create database and user:
  ```sql
  CREATE DATABASE invoice_db;
  CREATE USER invoice_user WITH ENCRYPTED PASSWORD 'your_password';
  GRANT ALL PRIVILEGES ON DATABASE invoice_db TO invoice_user;
  ```
- [ ] Install migration tool:
  - Run: `npm install --save-dev node-pg-migrate`
  - Add migration scripts to package.json:
    ```json
    "migrate:up": "node-pg-migrate up",
    "migrate:down": "node-pg-migrate down",
    "migrate:create": "node-pg-migrate create"
    ```
  - Create `.migrate.json` config file with database connection details
- [ ] Create initial migration file:
  - Run: `npm run migrate:create create-users-table`
  - Creates file in `migrations/` directory with timestamp
- [ ] Write `users` table migration (§6.1):
  ```sql
  exports.up = (pgm) => {
    pgm.createTable('users', {
      id: { type: 'uuid', primaryKey: true },
      email: { type: 'varchar(255)', notNull: true, unique: true },
      name: { type: 'varchar(255)', notNull: true },
      created_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') },
      updated_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') }
    });
    pgm.createIndex('users', 'email');
  };
  exports.down = (pgm) => {
    pgm.dropTable('users');
  };
  ```
- [ ] Run migration: `npm run migrate:up`
- [ ] Verify table created: `psql -d invoice_db -c "\dt"`

### AWS Infrastructure Setup
- [ ] Create AWS Cognito User Pool via AWS Console or CLI:
  - **User Pool name:** `invoice-mvp-users-{environment}`
  - **User attributes:**
    - Email (required, used for sign-in)
    - Name (required)
    - Email verification: Required
  - **Password policy:**
    - Minimum length: 8 characters
    - Require uppercase: Yes
    - Require lowercase: Yes
    - Require numbers: Yes
    - Require special characters: No (for MVP simplicity)
  - **MFA:** Optional (disabled for MVP)
  - **Token expiration:**
    - Access token: 1 hour (3600 seconds)
    - Refresh token: 30 days
    - ID token: 1 hour
  - **App client settings:**
    - Create app client: `invoice-mvp-client`
    - Generate client secret: No (for SPA compatibility)
    - Auth flows: ALLOW_USER_PASSWORD_AUTH, ALLOW_REFRESH_TOKEN_AUTH
  - **Note User Pool ID and App Client ID** for environment variables
  
- [ ] Create S3 bucket for invoice PDFs via AWS Console or CLI:
  - **Bucket name:** `invoice-pdfs-{environment}` (e.g., `invoice-pdfs-dev`, `invoice-pdfs-prod`)
  - **Region:** Same as your application (e.g., us-east-1)
  - **Configuration:**
    - Block all public access: Enabled
    - Versioning: Enabled (for audit trail)
    - Server-side encryption: AES-256 or AWS-KMS
  - **Lifecycle policy (optional):**
    - Transition to Glacier after 1 year
    - Never delete (per PRD requirement)
  - **CORS configuration:** Not required (using pre-signed URLs)
  - **IAM Policy:** Create policy allowing PutObject, GetObject for application IAM user/role
  - **Note Bucket Name** for environment variables

- [ ] Create Invoice-Generator.com account:
  - Sign up at https://invoice-generator.com
  - Navigate to Settings → API Keys
  - Click "New API Key"
  - **Note API Key** for environment variables
  - Free tier: 100 invoices/month (sufficient for MVP testing)
  - Production: Upgrade to paid plan for unlimited invoices

### Environment Configuration
- [ ] Create `.env.example` with all required variables (§11.2):
  ```env
  # Database
  DATABASE_URL=postgresql://invoice_user:password@localhost:5432/invoice_db
  
  # AWS General
  AWS_REGION=us-east-1
  AWS_ACCESS_KEY_ID=your_access_key_here
  AWS_SECRET_ACCESS_KEY=your_secret_key_here
  
  # AWS Cognito
  AWS_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
  AWS_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
  
  # AWS S3
  AWS_S3_BUCKET_NAME=invoice-pdfs-dev
  
  # Invoice Generator
  INVOICE_GENERATOR_API_KEY=your_api_key_here
  INVOICE_GENERATOR_API_URL=https://invoice-generator.com
  
  # Application
  NODE_ENV=development
  PORT=3000
  CORS_ORIGIN=http://localhost:5173
  
  # Rate Limiting
  RATE_LIMIT_MAX=100
  RATE_LIMIT_WINDOW_MS=60000
  
  # Logging
  LOG_LEVEL=info
  ```
  
- [ ] Create `.env` file (gitignored) from `.env.example`:
  - Copy `.env.example` to `.env`
  - Replace placeholder values with actual credentials from AWS setup
  - Never commit `.env` to version control
  
- [ ] Add `.env` to `.gitignore`:
  ```
  .env
  .env.local
  .env.*.local
  node_modules/
  dist/
  ```
  
- [ ] Implement environment variable validation on startup:
  - Create `src/config/env.ts`:
    - Use Zod or Joi for schema validation
    - Validate all required environment variables exist
    - Validate format (e.g., DATABASE_URL is valid PostgreSQL URL)
    - Throw error on startup if validation fails
    - Export typed configuration object
  - Import and run validation in `src/index.ts` before starting server
  
- [ ] Example validation (using Zod):
  ```typescript
  import { z } from 'zod';
  
  const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    AWS_REGION: z.string().min(1),
    AWS_COGNITO_USER_POOL_ID: z.string().regex(/^[a-z]+-[a-z]+-\d+_[a-zA-Z0-9]+$/),
    INVOICE_GENERATOR_API_KEY: z.string().min(1),
    PORT: z.string().regex(/^\d+$/).transform(Number),
  });
  
  export const config = envSchema.parse(process.env);
  ```

### Documentation
- [ ] Create README.md with setup instructions
- [ ] Document architecture decisions (DDD, CQRS, VSA)
- [ ] Add contribution guidelines

**Acceptance Criteria:**
- Backend server runs successfully on `localhost:3000`
- Frontend dev server runs on `localhost:5173`
- Database connection successful
- AWS services accessible
- All configuration documented

---

## PR 2: Authentication & User Management

**Objective:** Implement complete authentication flow with AWS Cognito

### Backend - Authentication Infrastructure
- [ ] Create authentication middleware for JWT validation (`src/middleware/auth.ts`):
  - Install AWS JWT verification library: `npm install aws-jwt-verify`
  - Verify JWT signature using Cognito public keys (JWKS endpoint):
    ```typescript
    import { CognitoJwtVerifier } from 'aws-jwt-verify';
    
    const verifier = CognitoJwtVerifier.create({
      userPoolId: config.AWS_COGNITO_USER_POOL_ID,
      tokenUse: 'access',
      clientId: config.AWS_COGNITO_CLIENT_ID,
    });
    
    export const authMiddleware = async (req, res, next) => {
      try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
          return res.status(401).json({ error: 'AUTH_REQUIRED' });
        }
        
        const payload = await verifier.verify(token);
        req.user = {
          id: payload.sub, // Cognito user ID
          email: payload.email,
        };
        next();
      } catch (error) {
        return res.status(401).json({ error: 'INVALID_TOKEN' });
      }
    };
    ```
  - Token verification includes:
    - Signature validation using Cognito public keys (fetched from JWKS endpoint)
    - Token expiration check (exp claim)
    - Issuer validation (iss claim must match Cognito User Pool)
    - Audience validation (aud claim must match Client ID)
  - Cache public keys with 1-hour TTL (handled automatically by aws-jwt-verify)
  - Extract user identity (sub, email) from token claims and attach to `req.user`
  
- [ ] Create authorization middleware (`src/middleware/ownership.ts`):
  - Verify user owns requested resources (userId matching)
  - Implementation:
    ```typescript
    export const requireOwnership = async (req, res, next) => {
      const requestedUserId = req.params.userId || req.body.userId;
      if (requestedUserId && requestedUserId !== req.user.id) {
        return res.status(403).json({ error: 'FORBIDDEN' });
      }
      next();
    };
    ```
  - Applied at route level for customer, invoice, payment endpoints
  - Prevents users from accessing other users' data

### Backend - Auth Endpoints (§5.2)
- [ ] `POST /api/v1/auth/register` (`src/features/auth/register.ts`):
  - **Input validation:**
    - Email: Valid format, required
    - Password: Min 8 chars, uppercase, lowercase, number (per PRD §7.1)
    - Name: Required, max 255 chars
  - **Flow:**
    1. Validate input data
    2. Create AWS Cognito account using `@aws-sdk/client-cognito-identity-provider`:
       ```typescript
       import { CognitoIdentityProviderClient, SignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
       
       const cognitoClient = new CognitoIdentityProviderClient({ region: config.AWS_REGION });
       const signUpResponse = await cognitoClient.send(new SignUpCommand({
         ClientId: config.AWS_COGNITO_CLIENT_ID,
         Username: email,
         Password: password,
         UserAttributes: [
           { Name: 'email', Value: email },
           { Name: 'name', Value: name },
         ],
       }));
       ```
    3. On Cognito success, extract `sub` from response
    4. Create user record in `users` table with `id = sub`
    5. If database insert fails, attempt to delete Cognito user (cleanup)
    6. Authenticate user and return JWT tokens
  - **Response:** `{ accessToken, refreshToken, user: { id, email, name } }`
  - **Error handling:** DUPLICATE_EMAIL (409), INVALID_PASSWORD (400), COGNITO_ERROR (500)
  
- [ ] `POST /api/v1/auth/login` (`src/features/auth/login.ts`):
  - **Input:** `{ email, password }`
  - **Flow:**
    1. Validate credentials with AWS Cognito using `InitiateAuth` command:
       ```typescript
       import { InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';
       
       const authResponse = await cognitoClient.send(new InitiateAuthCommand({
         AuthFlow: 'USER_PASSWORD_AUTH',
         ClientId: config.AWS_COGNITO_CLIENT_ID,
         AuthParameters: {
           USERNAME: email,
           PASSWORD: password,
         },
       }));
       ```
    2. Extract tokens from `authResponse.AuthenticationResult`:
       - AccessToken (1 hour expiry)
       - RefreshToken (30 days expiry)
       - IdToken
    3. Fetch user data from database using Cognito sub
    4. Set httpOnly cookies for token storage:
       ```typescript
       res.cookie('accessToken', accessToken, {
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production',
         sameSite: 'strict',
         maxAge: 3600000, // 1 hour
       });
       res.cookie('refreshToken', refreshToken, {
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production',
         sameSite: 'strict',
         maxAge: 2592000000, // 30 days
       });
       ```
  - **Response:** `{ user: { id, email, name }, accessToken, refreshToken }`
  - **Error handling:** INVALID_CREDENTIALS (401), USER_NOT_FOUND (404)
  
- [ ] `POST /api/v1/auth/logout` (`src/features/auth/logout.ts`):
  - **Input:** None (uses httpOnly cookie tokens)
  - **Flow:**
    1. Extract refresh token from cookie
    2. Invalidate refresh token in Cognito using `GlobalSignOut` command
    3. Clear both accessToken and refreshToken cookies:
       ```typescript
       res.clearCookie('accessToken');
       res.clearCookie('refreshToken');
       ```
  - **Response:** `{ message: 'Logged out successfully' }`
  
- [ ] `GET /api/v1/auth/me` (`src/features/auth/me.ts`):
  - **Middleware:** Requires `authMiddleware`
  - **Flow:**
    1. Extract user ID from `req.user` (populated by authMiddleware)
    2. Fetch full user data from database
  - **Response:** `{ id, email, name, createdAt, updatedAt }`
  - **Error handling:** USER_NOT_FOUND (404)
  
- [ ] `POST /api/v1/auth/refresh` (`src/features/auth/refresh.ts`):
  - **Input:** Refresh token from httpOnly cookie
  - **Flow:**
    1. Extract refresh token from cookie
    2. Request new access token from Cognito using `InitiateAuth` with `REFRESH_TOKEN_AUTH`:
       ```typescript
       const refreshResponse = await cognitoClient.send(new InitiateAuthCommand({
         AuthFlow: 'REFRESH_TOKEN_AUTH',
         ClientId: config.AWS_COGNITO_CLIENT_ID,
         AuthParameters: {
           REFRESH_TOKEN: refreshToken,
         },
       }));
       ```
    3. Set new access token in httpOnly cookie
  - **Response:** `{ accessToken }`
  - **Error handling:** INVALID_REFRESH_TOKEN (401), TOKEN_EXPIRED (401)

### Backend - User Domain (§3.1)
- [ ] Create User entity (`src/domain/user/User.ts`):
  - **Properties:**
    - `id`: UUID (from Cognito sub)
    - `email`: string (unique, validated format)
    - `name`: string (max 255 chars)
    - `createdAt`: Date
    - `updatedAt`: Date
  - **Invariants/Validation:**
    - Email must be valid format (regex validation)
    - Email must be unique (enforced by Cognito and database constraint)
    - Name cannot be empty
    - User ID must be valid UUID format
  - **Methods:**
    - `static create(props)`: Factory method with validation
    - `updateName(newName)`: Update user name with validation
  - **Example:**
    ```typescript
    export class User {
      private constructor(
        public readonly id: string,
        public email: string,
        public name: string,
        public readonly createdAt: Date,
        public updatedAt: Date
      ) {}
      
      static create(props: { id: string; email: string; name: string }): User {
        if (!props.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          throw new Error('INVALID_EMAIL_FORMAT');
        }
        if (!props.name || props.name.length > 255) {
          throw new Error('INVALID_NAME');
        }
        return new User(props.id, props.email, props.name, new Date(), new Date());
      }
    }
    ```
  
- [ ] Create User repository (`src/infrastructure/database/UserRepository.ts`):
  - **Interface:** Implements `BaseRepository<User>`
  - **Methods:**
    - `findById(id: string): Promise<User | null>` - Query by primary key
    - `findByEmail(email: string): Promise<User | null>` - Query by unique email
    - `save(user: User): Promise<User>` - Insert or update user record
    - `delete(id: string): Promise<void>` - Hard delete (not used in MVP)
  - **SQL Queries:**
    - All queries use parameterized statements (prevent SQL injection)
    - Use PostgreSQL `$1, $2...` placeholders
  - **Example:**
    ```typescript
    export class UserRepository {
      async findById(id: string): Promise<User | null> {
        const result = await pool.query(
          'SELECT * FROM users WHERE id = $1',
          [id]
        );
        return result.rows[0] ? this.toDomain(result.rows[0]) : null;
      }
      
      async save(user: User): Promise<User> {
        await pool.query(
          `INSERT INTO users (id, email, name, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (id) DO UPDATE
           SET email = $2, name = $3, updated_at = $5`,
          [user.id, user.email, user.name, user.createdAt, user.updatedAt]
        );
        return user;
      }
    }
    ```
  
- [ ] Implement user creation command handler (`src/features/auth/CreateUserHandler.ts`):
  - **Command:** `CreateUserCommand { cognitoSub, email, name }`
  - **Handler Logic:**
    1. Validate command data
    2. Create User domain entity using `User.create()`
    3. Call `userRepository.save(user)`
    4. Return created user
  - **Error handling:**
    - DUPLICATE_EMAIL (database constraint violation)
    - INVALID_INPUT (validation errors)

### Frontend - Auth Pages (§8.4)
- [ ] `/login` page:
  - Email and password inputs
  - Submit triggers login API
  - Error handling for invalid credentials
  - Redirect to `/dashboard` on success
- [ ] `/signup` page:
  - Registration form (email, name, password)
  - Password confirmation
  - Validation feedback
  - Redirect to `/dashboard` on success

### Frontend - Auth State Management
- [ ] Create AuthStore (Pinia):
  - Store user state
  - Login/logout actions
  - Token management
  - Auth status getters
- [ ] Implement axios interceptor:
  - Add Authorization header with JWT token
  - Handle 401 responses (token expired)
  - Auto-refresh token flow

### Frontend - Route Guards (§8.4)
- [ ] Implement route guard middleware:
  - Check for valid JWT token on protected routes
  - Redirect to `/login` if not authenticated
  - After login, redirect to `/dashboard`
- [ ] Set up protected routes:
  - `/dashboard`, `/customers/*`, `/invoices/*`
- [ ] Set up public routes:
  - `/login`, `/signup`

### Testing
- [ ] Unit tests for JWT validation middleware
- [ ] Unit tests for auth endpoints
- [ ] Integration test: Complete registration flow
- [ ] Integration test: Complete login flow
- [ ] Frontend tests: Login/signup forms

**Acceptance Criteria:**
- User can register new account
- User can login with credentials
- JWT tokens stored in httpOnly cookies
- Protected routes require authentication
- Token refresh works automatically
- Logout clears session

---

## PR 3: Customer Management (CRUD)

**Objective:** Implement complete customer management functionality

### Database Migration
- [ ] Create `customers` table migration (§6.1):
  - id (UUID, PK)
  - user_id (UUID, FK to users, NOT NULL)
  - name (VARCHAR 255, NOT NULL)
  - email (VARCHAR 255, NOT NULL)
  - street (VARCHAR 255, NOT NULL)
  - city (VARCHAR 100, NOT NULL)
  - state (VARCHAR 100, NOT NULL)
  - postal_code (VARCHAR 20, NOT NULL)
  - country (VARCHAR 100, NOT NULL)
  - phone_number (VARCHAR 50, NOT NULL)
  - deleted_at (TIMESTAMP, nullable)
  - created_at, updated_at (TIMESTAMP, NOT NULL)
  - Indexes: user_id, email, deleted_at
- [ ] Run migration

### Backend - Customer Domain (§3.1)
- [ ] Create Customer entity (`src/domain/customer/Customer.ts`):
  - **Properties:**
    - `id`: UUID
    - `userId`: UUID (foreign key to users table)
    - `name`: CustomerName value object
    - `email`: EmailAddress value object
    - `address`: Address value object
    - `phoneNumber`: PhoneNumber value object
    - `deletedAt`: Date | null (for soft delete)
    - `createdAt`, `updatedAt`: Date
  - **Invariants:**
    - Email must be unique per user (including soft-deleted customers)
    - All fields required (name, email, address, phone)
    - Name max 255 characters
    - Email valid format
    - User ID must reference existing user
  - **Methods:**
    - `static create(props)`: Factory method with validation
    - `update(props)`: Update customer data with validation
    - `softDelete()`: Mark as deleted
    - `isDeleted()`: Check if soft-deleted
  - **Example:**
    ```typescript
    export class Customer {
      private constructor(
        public readonly id: string,
        public readonly userId: string,
        public name: CustomerName,
        public email: EmailAddress,
        public address: Address,
        public phoneNumber: PhoneNumber,
        public deletedAt: Date | null,
        public readonly createdAt: Date,
        public updatedAt: Date
      ) {}
      
      static create(props: CustomerProps): Customer {
        // Validation in value objects
        return new Customer(
          props.id || uuid(),
          props.userId,
          new CustomerName(props.name),
          new EmailAddress(props.email),
          new Address(props.address),
          new PhoneNumber(props.phoneNumber),
          null,
          new Date(),
          new Date()
        );
      }
      
      softDelete(): void {
        if (this.deletedAt) {
          throw new Error('ALREADY_DELETED');
        }
        this.deletedAt = new Date();
        this.updatedAt = new Date();
      }
    }
    ```

- [ ] Create Address value object (`src/domain/customer/valueObjects/Address.ts`):
  - **Properties:** `street`, `city`, `state`, `postalCode`, `country`
  - **Validation:**
    - All fields required (max 255 chars for street, 100 for city/state/country, 20 for postalCode)
    - Cannot be empty strings
  - **Example:**
    ```typescript
    export class Address {
      constructor(
        public readonly street: string,
        public readonly city: string,
        public readonly state: string,
        public readonly postalCode: string,
        public readonly country: string
      ) {
        if (!street || !city || !state || !postalCode || !country) {
          throw new Error('INVALID_ADDRESS_MISSING_FIELDS');
        }
        if (street.length > 255 || city.length > 100 || state.length > 100 || country.length > 100 || postalCode.length > 20) {
          throw new Error('INVALID_ADDRESS_LENGTH');
        }
      }
    }
    ```

- [ ] Create EmailAddress value object (`src/domain/customer/valueObjects/EmailAddress.ts`):
  - **Validation:** Valid email format (regex)
  - **Example:**
    ```typescript
    export class EmailAddress {
      constructor(public readonly value: string) {
        if (!value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          throw new Error('INVALID_EMAIL_FORMAT');
        }
      }
      toString(): string { return this.value; }
    }
    ```

- [ ] Create PhoneNumber value object (`src/domain/customer/valueObjects/PhoneNumber.ts`):
  - **Validation:** Max 50 characters, not empty
  - **Example:**
    ```typescript
    export class PhoneNumber {
      constructor(public readonly value: string) {
        if (!value || value.length > 50) {
          throw new Error('INVALID_PHONE_NUMBER');
        }
      }
      toString(): string { return this.value; }
    }
    ```

- [ ] Create CustomerName value object (`src/domain/customer/valueObjects/CustomerName.ts`):
  - **Validation:** Max 255 characters, not empty
  - **Example:**
    ```typescript
    export class CustomerName {
      constructor(public readonly value: string) {
        if (!value || value.length > 255) {
          throw new Error('INVALID_CUSTOMER_NAME');
        }
      }
      toString(): string { return this.value; }
    }
    ```

### Backend - Customer Commands (§4.1)
- [ ] **CreateCustomer** command + handler (`src/features/customers/CreateCustomerHandler.ts`):
  - **Input:** `CreateCustomerCommand { userId, name, email, address, phoneNumber }`
  - **Validation Flow:**
    1. Validate input format using value objects
    2. Check email uniqueness (including soft-deleted):
       ```sql
       SELECT id FROM customers 
       WHERE user_id = $1 AND email = $2
       ```
    3. If email exists, return `DUPLICATE_EMAIL` error
  - **Handler Logic:**
    1. Create Customer entity: `Customer.create({ userId, name, email, address, phoneNumber })`
    2. Save via repository: `customerRepository.save(customer)`
    3. Return created customer ID
  - **Error Codes:** DUPLICATE_EMAIL (409), INVALID_INPUT (400), USER_NOT_FOUND (404)
  - **Authorization:** Verify `userId` matches authenticated user from JWT

- [ ] **UpdateCustomer** command + handler (`src/features/customers/UpdateCustomerHandler.ts`):
  - **Input:** `UpdateCustomerCommand { id, userId, name, email, address, phoneNumber }`
  - **Validation Flow:**
    1. Fetch existing customer: `customerRepository.findById(id)`
    2. If not found or soft-deleted, return `CUSTOMER_NOT_FOUND`
    3. Verify customer.userId === authenticated user ID (403 if mismatch)
    4. If email changed, check uniqueness (including soft-deleted):
       ```sql
       SELECT id FROM customers 
       WHERE user_id = $1 AND email = $2 AND id != $3
       ```
  - **Handler Logic:**
    1. Load customer entity from repository
    2. Call `customer.update({ name, email, address, phoneNumber })`
    3. Save via repository
  - **Error Codes:** CUSTOMER_NOT_FOUND (404), DUPLICATE_EMAIL (409), FORBIDDEN (403)

- [ ] **DeleteCustomer** command + handler (`src/features/customers/DeleteCustomerHandler.ts`):
  - **Implementation:** Soft delete (set `deleted_at` timestamp)
  - **Input:** `DeleteCustomerCommand { id, userId }`
  - **Validation Flow:**
    1. Fetch customer: `customerRepository.findById(id)`
    2. Check customer exists and not already soft-deleted
    3. Verify customer.userId === authenticated user ID
  - **Handler Logic:**
    1. Load customer entity
    2. Call `customer.softDelete()`
    3. Update via repository: `customerRepository.save(customer)`
  - **SQL Update:**
    ```sql
    UPDATE customers 
    SET deleted_at = NOW(), updated_at = NOW() 
    WHERE id = $1 AND deleted_at IS NULL
    ```
  - **Error Codes:** CUSTOMER_NOT_FOUND (404), ALREADY_DELETED (400), FORBIDDEN (403)

### Backend - Customer Queries (§4.1)
- [ ] **GetCustomerById** query + handler (`src/features/customers/GetCustomerByIdHandler.ts`):
  - **Input:** `GetCustomerByIdQuery { id, userId }`
  - **Query Logic:**
    1. Execute SQL with deleted_at filter:
       ```sql
       SELECT * FROM customers 
       WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
       ```
    2. Map result to Customer entity, then to CustomerDTO
  - **Return:** `CustomerDTO` or null if not found
  - **Authorization:** Filter by user_id to ensure user can only see their own customers

- [ ] **ListAllCustomers** query + handler (`src/features/customers/ListAllCustomersHandler.ts`):
  - **Input:** `ListAllCustomersQuery { userId, page?, pageSize?, searchTerm? }`
    - `page`: Default 1, min 1
    - `pageSize`: Default 25, max 100
    - `searchTerm`: Optional string for filtering
  - **Query Logic:**
    1. Build dynamic SQL with filters:
       ```sql
       SELECT * FROM customers 
       WHERE user_id = $1 
         AND deleted_at IS NULL
         AND ($2 IS NULL OR name ILIKE $2 OR email ILIKE $2)
       ORDER BY created_at DESC
       LIMIT $3 OFFSET $4
       ```
    2. For search, wrap term: `%${searchTerm}%`
    3. Calculate offset: `(page - 1) * pageSize`
    4. Count total records for pagination:
       ```sql
       SELECT COUNT(*) FROM customers 
       WHERE user_id = $1 
         AND deleted_at IS NULL
         AND ($2 IS NULL OR name ILIKE $2 OR email ILIKE $2)
       ```
  - **Return:** `PagedResult<CustomerDTO>`
    ```typescript
    {
      items: CustomerDTO[],
      totalCount: number,
      page: number,
      pageSize: number,
      totalPages: Math.ceil(totalCount / pageSize)
    }
    ```
  - **Search:** Case-insensitive ILIKE on both `name` and `email` fields

### Backend - API Endpoints (§5.2)
- [ ] `POST /api/v1/customers` - CreateCustomer:
  - **Route:** `router.post('/api/v1/customers', authMiddleware, createCustomerHandler)`
  - **Middleware:** `authMiddleware` (JWT validation)
  - **Request Body:**
    ```json
    {
      "name": "Acme Corp",
      "email": "contact@acme.com",
      "address": {
        "street": "123 Main St",
        "city": "San Francisco",
        "state": "CA",
        "postalCode": "94102",
        "country": "USA"
      },
      "phoneNumber": "+1-555-0100"
    }
    ```
  - **Response:** `201 Created` with `CustomerDTO`
  - **Errors:** 400 (validation), 409 (duplicate email), 401 (not authenticated)

- [ ] `GET /api/v1/customers/:id` - GetCustomerById:
  - **Route:** `router.get('/api/v1/customers/:id', authMiddleware, getCustomerByIdHandler)`
  - **Response:** `200 OK` with `CustomerDTO`
  - **Errors:** 404 (not found), 401 (not authenticated), 403 (not owner)

- [ ] `PUT /api/v1/customers/:id` - UpdateCustomer:
  - **Route:** `router.put('/api/v1/customers/:id', authMiddleware, updateCustomerHandler)`
  - **Request Body:** Same as POST (all fields required)
  - **Response:** `200 OK` with updated `CustomerDTO`
  - **Errors:** 400 (validation), 404 (not found), 409 (duplicate email), 403 (not owner)

- [ ] `DELETE /api/v1/customers/:id` - DeleteCustomer (soft):
  - **Route:** `router.delete('/api/v1/customers/:id', authMiddleware, deleteCustomerHandler)`
  - **Response:** `204 No Content`
  - **Errors:** 404 (not found), 400 (already deleted), 403 (not owner)

- [ ] `GET /api/v1/customers` - ListAllCustomers:
  - **Route:** `router.get('/api/v1/customers', authMiddleware, listAllCustomersHandler)`
  - **Query Params:**
    - `page`: number (default 1)
    - `pageSize`: number (default 25, max 100)
    - `search`: string (optional)
  - **Example:** `GET /api/v1/customers?page=1&pageSize=25&search=acme`
  - **Response:** `200 OK` with `PagedResult<CustomerDTO>`
  - **Errors:** 400 (invalid params), 401 (not authenticated)

- [ ] Add authentication middleware to all endpoints:
  - All routes require `authMiddleware` which validates JWT token
  - Middleware extracts user ID from token and attaches to `req.user`

- [ ] Add authorization checks (user owns resource):
  - At handler level, compare `req.user.id` with `customer.userId`
  - Return 403 FORBIDDEN if mismatch
  - For list operations, filter by user_id automatically in query

### Backend - DTOs (§5.3)
- [ ] Create CustomerDTO:
  - id, name, email, address (object), phoneNumber
  - createdAt, updatedAt
- [ ] Create CustomerSummaryDTO (for invoice references)

### Frontend - Customer Store (Pinia)
- [ ] CustomerStore with actions:
  - fetchCustomers (with pagination & search)
  - fetchCustomerById
  - createCustomer
  - updateCustomer
  - deleteCustomer
- [ ] State: customers list, currentCustomer, loading, error
- [ ] Getters: filtered customers, customer by id

### Frontend - Customer Pages (§8.2)
- [ ] `/customers` - Customer List:
  - Paginated table with columns: Name, Email, Phone, City, Actions
  - Search bar (debounced, searches name/email)
  - "Create Customer" button
  - Actions per row: View, Edit, Delete
  - Empty state: "Get started by creating your first customer"
  - Delete confirmation dialog
- [ ] `/customers/new` - Create Customer Form:
  - Fields: Name, Email, Street, City, State, Postal Code, Country, Phone
  - Client-side validation with inline errors
  - Max length validation (name: 255 chars)
  - Required field indicators
  - Save/Cancel buttons
  - Success toast on save
- [ ] `/customers/:id/edit` - Edit Customer Form:
  - Same as create form, pre-filled with data
  - Update on save

### Testing
- [ ] Unit tests: Customer entity invariants
- [ ] Unit tests: Command handlers validation
- [ ] Unit tests: Query handlers with soft delete filtering
- [ ] Integration test: Create → Read → Update → Delete customer flow
- [ ] Integration test: Soft delete (verify customer not in list)
- [ ] Integration test: Email uniqueness (including deleted)
- [ ] Integration test: Search functionality
- [ ] Frontend tests: Customer form validation
- [ ] Frontend tests: Customer list pagination

**Acceptance Criteria:**
- User can create customer with all required fields
- Email uniqueness enforced (including soft-deleted)
- User can view paginated list of their customers
- Search works on name and email
- User can update customer details
- Soft delete removes customer from list but preserves in database
- All fields validated (max lengths, required, formats)
- Only customer owner can view/edit/delete

---

## PR 4: Invoice Management - Core Operations

**Objective:** Implement invoice creation, line items, and draft management

### Database Migrations
- [ ] Create `invoices` table migration (§6.1):
  - id (UUID, PK)
  - invoice_number (VARCHAR 50, NOT NULL, UNIQUE)
  - user_id (UUID, FK to users, NOT NULL)
  - customer_id (UUID, FK to customers, NOT NULL)
  - company_info (TEXT)
  - status (VARCHAR 20, CHECK IN ('Draft', 'Sent', 'Paid'))
  - subtotal (DECIMAL 12,4, default 0)
  - tax_rate (DECIMAL 5,2, default 0)
  - tax_amount (DECIMAL 12,4, default 0)
  - total (DECIMAL 12,4, default 0)
  - notes (TEXT)
  - terms (TEXT)
  - issue_date (DATE, NOT NULL)
  - due_date (DATE, NOT NULL)
  - sent_date (TIMESTAMP)
  - paid_date (TIMESTAMP)
  - pdf_s3_keys (TEXT[])
  - deleted_at (TIMESTAMP)
  - created_at, updated_at (TIMESTAMP, NOT NULL)
  - Constraints: due_date >= issue_date, tax_rate 0-100
  - Indexes: user_id, customer_id, status, invoice_number, deleted_at
- [ ] Create invoice_number_seq: START 1000
- [ ] Create `line_items` table migration (§6.1):
  - id (UUID, PK)
  - invoice_id (UUID, FK to invoices ON DELETE CASCADE, NOT NULL)
  - description (TEXT, NOT NULL)
  - quantity (DECIMAL 12,4, NOT NULL)
  - unit_price (DECIMAL 12,4, NOT NULL)
  - amount (DECIMAL 12,4, NOT NULL)
  - created_at (TIMESTAMP, NOT NULL)
  - Index: invoice_id
- [ ] Run migrations

### Backend - Invoice Domain (§3.1)
- [ ] Create Invoice entity (`src/domain/invoice/Invoice.ts`):
  - **Properties:**
    - `id`: UUID
    - `invoiceNumber`: InvoiceNumber value object
    - `userId`: UUID
    - `customerId`: UUID
    - `companyInfo`: string (max 500 chars)
    - `status`: 'Draft' | 'Sent' | 'Paid'
    - `lineItems`: LineItem[] (max 100)
    - `subtotal`: Money
    - `taxRate`: number (0-100, stored as percentage)
    - `taxAmount`: Money
    - `total`: Money
    - `notes`: string (max 1000 chars)
    - `terms`: string (max 500 chars)
    - `issueDate`: Date
    - `dueDate`: Date
    - `sentDate`: Date | null
    - `paidDate`: Date | null
    - `pdfS3Keys`: string[] (for versioning)
    - `deletedAt`: Date | null
    - `createdAt`, `updatedAt`: Date
  - **Invariants/Validation:**
    - At least 1 line item before marking as Sent
    - Maximum 100 line items
    - Cannot transition from Paid to Draft/Sent
    - IssueDate must be today or in past: `issueDate <= new Date()`
    - DueDate >= IssueDate
    - Total = Subtotal + TaxAmount (always enforced)
    - TaxRate must be 0-100
    - CompanyInfo max 500 chars
    - Notes max 1000 chars
    - Terms max 500 chars
  - **Methods:**
    - `static create(props)`: Factory method
    - `addLineItem(lineItem)`: Add item and recalculate totals
    - `removeLineItem(lineItemId)`: Remove item and recalculate
    - `updateLineItem(id, props)`: Update item and recalculate
    - `markAsSent()`: Transition Draft → Sent (validates has line items)
    - `markAsPaid()`: Transition Sent → Paid
    - `calculateTotals()`: Recalculate subtotal, taxAmount, total
    - `getBalance(totalPayments)`: Compute balance (total - payments)
  - **Example calculation:**
    ```typescript
    calculateTotals(): void {
      // Subtotal = sum of all line item amounts
      this.subtotal = this.lineItems.reduce(
        (sum, item) => sum.add(item.amount),
        Money.zero()
      );
      
      // Tax amount = subtotal * taxRate / 100, rounded to 4 decimals
      const taxDecimal = this.taxRate / 100;
      this.taxAmount = this.subtotal.multiply(taxDecimal).round(4);
      
      // Total = subtotal + taxAmount
      this.total = this.subtotal.add(this.taxAmount).round(4);
      
      this.updatedAt = new Date();
    }
    ```
  - **State transitions:**
    ```typescript
    markAsSent(): void {
      if (this.status !== 'Draft') {
        throw new Error('INVALID_STATE_TRANSITION');
      }
      if (this.lineItems.length === 0) {
        throw new Error('INVOICE_MUST_HAVE_LINE_ITEMS');
      }
      this.status = 'Sent';
      this.sentDate = new Date();
      this.updatedAt = new Date();
    }
    
    markAsPaid(): void {
      if (this.status !== 'Sent') {
        throw new Error('INVALID_STATE_TRANSITION');
      }
      this.status = 'Paid';
      this.paidDate = new Date();
      this.updatedAt = new Date();
    }
    ```

- [ ] Create LineItem entity (`src/domain/invoice/LineItem.ts`):
  - **Properties:**
    - `id`: UUID
    - `invoiceId`: UUID
    - `description`: string (required, max 500 chars)
    - `quantity`: number (DECIMAL 12,4, must be > 0)
    - `unitPrice`: Money (DECIMAL 12,4, must be >= 0)
    - `amount`: Money (computed: quantity * unitPrice, DECIMAL 12,4)
    - `createdAt`: Date
  - **Invariants:**
    - Description required, max 500 chars
    - Quantity > 0
    - UnitPrice >= 0
    - All decimals stored/displayed with 4 places
  - **Methods:**
    - `static create(props)`: Factory method with validation
    - `calculateAmount()`: quantity * unitPrice, rounded to 4 decimals
  - **Example:**
    ```typescript
    export class LineItem {
      private constructor(
        public readonly id: string,
        public readonly invoiceId: string,
        public description: string,
        public quantity: number,
        public unitPrice: Money,
        public amount: Money,
        public readonly createdAt: Date
      ) {}
      
      static create(props: LineItemProps): LineItem {
        if (!props.description || props.description.length > 500) {
          throw new Error('INVALID_DESCRIPTION');
        }
        if (props.quantity <= 0) {
          throw new Error('INVALID_QUANTITY');
        }
        if (props.unitPrice < 0) {
          throw new Error('INVALID_UNIT_PRICE');
        }
        
        const unitPrice = new Money(props.unitPrice);
        const amount = unitPrice.multiply(props.quantity).round(4);
        
        return new LineItem(
          props.id || uuid(),
          props.invoiceId,
          props.description,
          props.quantity,
          unitPrice,
          amount,
          new Date()
        );
      }
    }
    ```
  - **Display order:** By `createdAt` ASC (insertion order)

- [ ] Create Money value object (`src/domain/shared/Money.ts`):
  - **Implementation:** Store as number with 4 decimal precision
  - **Methods:**
    - `add(other)`: Addition with rounding
    - `subtract(other)`: Subtraction with rounding
    - `multiply(factor)`: Multiplication with rounding
    - `divide(divisor)`: Division with rounding
    - `round(decimals)`: Round to specified decimal places
    - `toString()`: Format as string with 4 decimals
  - **Currency:** All amounts in USD (no currency conversion in MVP)
  - **Example:**
    ```typescript
    export class Money {
      constructor(public readonly value: number) {}
      
      add(other: Money): Money {
        return new Money(this.value + other.value);
      }
      
      multiply(factor: number): Money {
        return new Money(this.value * factor);
      }
      
      round(decimals: number): Money {
        const factor = Math.pow(10, decimals);
        return new Money(Math.round(this.value * factor) / factor);
      }
      
      static zero(): Money {
        return new Money(0);
      }
    }
    ```

- [ ] Create InvoiceNumber value object (`src/domain/invoice/InvoiceNumber.ts`):
  - **Format:** `INV-{sequence}` where sequence is from `invoice_number_seq`
  - **Generation:** Use PostgreSQL sequence starting at 1000
  - **Validation:** Must match format, globally unique
  - **Example:**
    ```typescript
    export class InvoiceNumber {
      constructor(public readonly value: string) {
        if (!value.match(/^INV-\d+$/)) {
          throw new Error('INVALID_INVOICE_NUMBER_FORMAT');
        }
      }
      
      static async generate(pool): Promise<InvoiceNumber> {
        const result = await pool.query("SELECT nextval('invoice_number_seq')");
        const sequence = result.rows[0].nextval;
        return new InvoiceNumber(`INV-${sequence}`);
      }
      
      toString(): string {
        return this.value;
      }
    }
    ```

### Backend - Invoice Commands (§4.2)
- [ ] **CreateInvoice** command + handler:
  - Input: UserId, CustomerId, CompanyInfo, IssueDate, DueDate, TaxRate, Notes, Terms
  - Validation: User ownership, tax rate 0-100, customer exists, date rules, field lengths
  - Default values: IssueDate=today, DueDate=today+30, TaxRate=0, Notes='', Terms=''
  - Generate invoice number: INV-{nextval(invoice_number_seq)}
  - Initial status: Draft
  - Return: InvoiceId
- [ ] **AddLineItem** command + handler:
  - Input: InvoiceId, Description, Quantity, UnitPrice
  - Validation: Invoice in Draft, < 100 items, user owns invoice, description max 500, quantity > 0
  - Calculate amount (rounded to 4 decimals)
  - Recalculate invoice totals
  - Return: LineItemId
- [ ] **UpdateLineItem** command + handler:
  - Input: InvoiceId, LineItemId, Description, Quantity, UnitPrice
  - Validation: Invoice in Draft, line item exists, user owns invoice
  - Recalculate invoice totals
  - Return: Success/Failure
- [ ] **RemoveLineItem** command + handler:
  - Input: InvoiceId, LineItemId
  - Validation: Invoice in Draft, line item exists, user owns invoice
  - Recalculate invoice totals
  - Return: Success/Failure
- [ ] **UpdateInvoice** command + handler:
  - Input: InvoiceId, DueDate, Notes, Terms
  - Validation: Invoice exists, user owns invoice, field lengths
  - Can update notes/terms even after Sent
  - Return: Success/Failure
- [ ] **DeleteInvoice** command + handler:
  - Implementation: Soft delete (set deleted_at)
  - Validation: Invoice in Draft only, user owns invoice
  - Line items remain (cascade not required per PRD)
  - Return: Success/Failure

### Backend - Invoice Queries (§4.2)
- [ ] **GetInvoiceById** query + handler:
  - Filter: deleted_at IS NULL
  - Return: InvoiceDTO with embedded line items and customer
  - Compute balance: total - SUM(payments.amount)
- [ ] **ListInvoicesByStatus** query + handler:
  - Input: Status, Page, PageSize, SearchTerm (optional)
  - Filter: deleted_at IS NULL, user_id = auth user
  - Search: ILIKE on invoice_number or customer name
  - Return: PagedResult<InvoiceSummaryDTO>
- [ ] **ListInvoicesByCustomer** query + handler:
  - Input: CustomerId, Page, PageSize
  - Filter: deleted_at IS NULL
  - Return: PagedResult<InvoiceSummaryDTO>
- [ ] **GetInvoiceBalance** query + handler:
  - Compute: total - SUM(payments.amount)
  - Return: Money

### Backend - API Endpoints (§5.2)
- [ ] `POST /api/v1/invoices` - CreateInvoice
- [ ] `GET /api/v1/invoices/:id` - GetInvoiceById
- [ ] `PUT /api/v1/invoices/:id` - UpdateInvoice
- [ ] `DELETE /api/v1/invoices/:id` - DeleteInvoice (soft, Draft only)
- [ ] `GET /api/v1/invoices` - ListInvoices (with status, search filters)
- [ ] `POST /api/v1/invoices/:id/line-items` - AddLineItem
- [ ] `PUT /api/v1/invoices/:id/line-items/:lineItemId` - UpdateLineItem
- [ ] `DELETE /api/v1/invoices/:id/line-items/:lineItemId` - RemoveLineItem
- [ ] `GET /api/v1/invoices/:id/balance` - GetInvoiceBalance
- [ ] Add authentication + authorization to all endpoints

### Backend - DTOs (§5.3)
- [ ] InvoiceDTO (full details with line items and customer)
- [ ] InvoiceSummaryDTO (for lists)
- [ ] LineItemDTO

### Frontend - Invoice Store (Pinia)
- [ ] InvoiceStore with actions:
  - fetchInvoices (with filters, pagination, search)
  - fetchInvoiceById
  - createInvoice
  - updateInvoice
  - deleteInvoice
  - addLineItem
  - updateLineItem
  - removeLineItem
- [ ] State: invoices list, currentInvoice, loading, error
- [ ] Getters: invoices by status, computed totals

### Frontend - Invoice Pages (§8.2)
- [ ] `/invoices` - Invoice List:
  - Paginated table: Invoice #, Customer, Date, Due Date, Total, Balance, Status
  - Filter by status (Draft, Sent, Paid)
  - Search bar (invoice number, customer name)
  - "Create Invoice" button
  - Actions: View, Edit (Draft only), Delete (Draft only), Mark as Sent
  - Empty state: "Create your first invoice to get started"
  - Delete confirmation dialog
- [ ] `/invoices/new` - Create Invoice Form (§8.2):
  - Company Info (textarea, max 500 chars)
  - Customer selection (dropdown, only user's customers)
  - Issue Date (default: today, date picker)
  - Due Date (default: today+30, date picker)
  - Tax Rate (number input, 0-100, default: 0)
  - Notes (textarea, optional, max 1000 chars)
  - Terms (text input, optional, max 500 chars)
  - Line Items section (inline table):
    - Headers: Description, Quantity, Unit Price, Amount, Actions
    - Add Row button
    - Delete row button per item
    - Auto-calculate amount per row
  - Auto-calculated display:
    - Subtotal (sum of line item amounts)
    - Tax (taxRate% = taxAmount)
    - Total
  - All amounts show $ symbol with 4 decimal places
  - Validation: All required fields, max lengths, date rules
  - Save Draft button
  - Cancel button
- [ ] `/invoices/:id` - Invoice Detail (View Mode for Sent/Paid):
  - Display all invoice fields (read-only)
  - Display line items table
  - Display notes and terms (if present)
  - Show payment history (if any)
  - Download PDF button (will implement in PR5)
  - Record Payment button (if not fully paid, will implement in PR6)
  - Back to list button
- [ ] `/invoices/:id/edit` - Edit Invoice Form (Draft only):
  - Same as create form, pre-filled with data
  - Can edit all fields and line items
  - Save/Cancel buttons

### Testing
- [ ] Unit tests: Invoice entity invariants
- [ ] Unit tests: LineItem entity invariants
- [ ] Unit tests: Calculation logic (totals, rounding to 4 decimals)
- [ ] Unit tests: State transitions
- [ ] Unit tests: Command handlers validation
- [ ] Unit tests: Invoice number generation
- [ ] Integration test: Create invoice → Add line items → Totals calculated correctly
- [ ] Integration test: Update line item → Totals recalculated
- [ ] Integration test: Remove line item → Totals recalculated
- [ ] Integration test: Soft delete invoice (Draft only)
- [ ] Integration test: Cannot delete Sent/Paid invoice
- [ ] Integration test: Max 100 line items enforced
- [ ] Integration test: Search and filter invoices
- [ ] Frontend tests: Invoice form validation
- [ ] Frontend tests: Line item table calculations

**Acceptance Criteria:**
- User can create Draft invoice with all fields
- Invoice number auto-generated (INV-1000, INV-1001, etc.)
- Default values applied (dates, tax rate)
- User can add up to 100 line items
- Calculations accurate to 4 decimal places
- Subtotal, tax amount, total auto-calculated on changes
- User can edit/delete line items
- User can update invoice fields (notes, terms, due date)
- Only Draft invoices can be edited/deleted
- Soft delete works (invoice hidden but in database)
- Field length limits enforced
- Date validation works (issue date not future, due >= issue)
- Search and filter work correctly

---

## PR 5: Invoice Management - PDF Generation & Status

**Objective:** Implement Mark as Sent, PDF generation, and PDF download

### Backend - Invoice-Generator.com Integration (§6.3)
- [ ] Create PDF generation service (`src/infrastructure/pdf/InvoiceGeneratorService.ts`):
  - **Dependencies:** `axios` for HTTP requests
  - **Make POST request to https://invoice-generator.com:**
    ```typescript
    import axios from 'axios';
    
    export class InvoiceGeneratorService {
      async generatePDF(invoice: Invoice, customer: Customer): Promise<Buffer> {
        const invoiceData = {
          from: invoice.companyInfo, // Multi-line text (max 500 chars)
          to: this.formatCustomerAddress(customer),
          number: invoice.invoiceNumber.toString(), // "INV-1000"
          currency: 'usd',
          date: invoice.issueDate.toISOString(),
          due_date: invoice.dueDate.toISOString(),
          items: invoice.lineItems.map(item => ({
            name: item.description, // Description field
            quantity: item.quantity, // 4 decimal places
            unit_cost: item.unitPrice.value, // 4 decimal places, USD
          })),
          fields: {
            tax: '%', // Display tax as percentage
          },
          tax: invoice.taxRate, // Percentage value (e.g., 7 for 7%)
          notes: invoice.notes || '', // Optional, max 1000 chars
          terms: invoice.terms || '', // Optional, max 500 chars
        };
        
        const response = await axios.post(
          'https://invoice-generator.com',
          invoiceData,
          {
            headers: {
              'Authorization': `Bearer ${process.env.INVOICE_GENERATOR_API_KEY}`,
              'Content-Type': 'application/json',
            },
            responseType: 'arraybuffer', // Important: PDF binary data
            timeout: 30000, // 30 second timeout
          }
        );
        
        return Buffer.from(response.data);
      }
      
      private formatCustomerAddress(customer: Customer): string {
        // Format: Name\nStreet\nCity, State PostalCode\nCountry\nEmail
        const street = customer.address.street || 'N/A';
        const city = customer.address.city || 'N/A';
        const state = customer.address.state || 'N/A';
        const postalCode = customer.address.postalCode || 'N/A';
        const country = customer.address.country || 'N/A';
        
        return `${customer.name}\n${street}\n${city}, ${state} ${postalCode}\n${country}\n${customer.email}`;
      }
    }
    ```
  
- [ ] Implement error handling with retry logic:
  - **Retry strategy:** 3 attempts with exponential backoff
  - **Backoff:** 1s, 2s, 4s between retries
  - **Implementation:**
    ```typescript
    async generatePDFWithRetry(invoice: Invoice, customer: Customer): Promise<Buffer> {
      const maxAttempts = 3;
      const backoffMs = [1000, 2000, 4000];
      
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          return await this.generatePDF(invoice, customer);
        } catch (error) {
          logger.error(`PDF generation failed (attempt ${attempt}/${maxAttempts})`, {
            invoiceId: invoice.id,
            error: error.message,
          });
          
          if (attempt < maxAttempts) {
            await this.delay(backoffMs[attempt - 1]);
          } else {
            throw new Error('PDF_GENERATION_FAILED');
          }
        }
      }
    }
    
    private delay(ms: number): Promise<void> {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
    ```
  - **Error logging:** Log to console with invoice ID, attempt number, API response/error
  - **User-facing error:** Return generic message "PDF generation failed. Please try again."
  - **State on failure:** Keep invoice in Draft status (do not transition to Sent)

### Backend - S3 Integration (§6.3)
- [ ] Create S3 service (`src/infrastructure/storage/S3Service.ts`):
  - **Dependencies:** `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`
  - **Upload PDF buffer to S3:**
    ```typescript
    import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
    import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
    
    export class S3Service {
      private s3Client: S3Client;
      private bucketName: string;
      
      constructor() {
        this.s3Client = new S3Client({
          region: process.env.AWS_REGION,
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
          },
        });
        this.bucketName = process.env.AWS_S3_BUCKET_NAME!;
      }
      
      async uploadPDF(pdfBuffer: Buffer, invoiceId: string): Promise<string> {
        // Key format: invoices/2025/11/uuid_1699473600000.pdf
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const timestamp = Date.now(); // Unix epoch milliseconds
        const key = `invoices/${year}/${month}/${invoiceId}_${timestamp}.pdf`;
        
        const command = new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: pdfBuffer,
          ContentType: 'application/pdf',
          // ACL: private (default, no public access)
        });
        
        await this.s3Client.send(command);
        logger.info(`PDF uploaded to S3: ${key}`);
        
        return key; // Return S3 key for database storage
      }
    }
    ```
  - **Key format details:**
    - Pattern: `invoices/{YYYY}/{MM}/{invoiceId}_{timestamp}.pdf`
    - `invoiceId`: Invoice UUID
    - `timestamp`: Unix epoch milliseconds (for versioning/uniqueness)
    - Bucket: From `AWS_S3_BUCKET_NAME` environment variable
    - ACL: private (no public access, pre-signed URLs for download)
    - ContentType: `application/pdf`
  
- [ ] Implement S3 pre-signed URL generation:
  - **Purpose:** Generate temporary download URLs with 15-minute expiration
  - **Implementation:**
    ```typescript
    async getDownloadUrl(s3Key: string): Promise<string> {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
      });
      
      // Generate pre-signed URL with 15-minute expiration
      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 900, // 15 minutes in seconds
      });
      
      return signedUrl;
    }
    ```
  - **Expiration:** 15 minutes (900 seconds)
  - **Usage:** Frontend requests download URL from backend, backend returns pre-signed URL
  
- [ ] Implement error handling with retry logic:
  - **Retry strategy:** 3 attempts with exponential backoff (1s, 2s, 4s)
  - **Implementation:**
    ```typescript
    async uploadPDFWithRetry(pdfBuffer: Buffer, invoiceId: string): Promise<string> {
      const maxAttempts = 3;
      const backoffMs = [1000, 2000, 4000];
      
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          return await this.uploadPDF(pdfBuffer, invoiceId);
        } catch (error) {
          logger.error(`S3 upload failed (attempt ${attempt}/${maxAttempts})`, {
            invoiceId,
            error: error.message,
          });
          
          if (attempt < maxAttempts) {
            await this.delay(backoffMs[attempt - 1]);
          } else {
            throw new Error('S3_UPLOAD_FAILED');
          }
        }
      }
    }
    ```
  - **Error logging:** Log to console with invoice ID, attempt number, S3 error
  - **State on failure:** Keep invoice in Draft status (rollback transaction)

### Backend - MarkInvoiceAsSent Command (§4.2)
- [ ] **MarkInvoiceAsSent** command + handler (`src/features/invoices/MarkInvoiceAsSentHandler.ts`):
  - **Input:** `MarkInvoiceAsSentCommand { invoiceId, userId }`
  - **Validation:**
    - Invoice exists and not soft-deleted
    - Invoice status is 'Draft'
    - Invoice has at least 1 line item
    - User owns invoice (userId matches)
  - **Process (within transaction):**
    1. Retrieve full invoice with customer and line items
    2. Call PDF generation service: `const pdfBuffer = await pdfService.generatePDFWithRetry(invoice, customer);`
    3. Upload PDF to S3: `const s3Key = await s3Service.uploadPDFWithRetry(pdfBuffer, invoice.id);`
    4. Append S3 key to invoice.pdf_s3_keys array
    5. Update invoice: status='Sent', sent_date=NOW()
    6. Commit transaction
  - **State transition:** Draft → Sent
  - **Performance target:** < 5 seconds total (3s invoice-generator.com API + 2s S3 upload)
  - **Rollback on any failure:** Transaction ensures atomicity
  - **Return:** `{ success: true, invoiceId, s3Key }` or throw error with code
  - **Error codes:** INVOICE_NOT_FOUND (404), INVALID_STATE_TRANSITION (400), INVOICE_MUST_HAVE_LINE_ITEMS (400), PDF_GENERATION_FAILED (500), S3_UPLOAD_FAILED (500), FORBIDDEN (403)
  
- [ ] Implement transaction boundary:
  - **Requirement:** PDF generation + S3 upload + DB update must be atomic
  - **Implementation:** Use PostgreSQL transactions with explicit BEGIN/COMMIT/ROLLBACK
  - **Row-level locking:** Use `FOR UPDATE` to prevent concurrent modifications
  - **On failure:** Rollback status change, keep invoice in Draft

### Backend - PDF Download Endpoint (§5.2)
- [ ] `GET /api/v1/invoices/:id/pdf`:
  - Validation: Invoice exists, user owns invoice, invoice has PDFs
  - Retrieve latest pdf_s3_key from invoice.pdf_s3_keys array
  - Generate pre-signed S3 URL (15 min expiration)
  - Return: 302 redirect to signed URL or JSON with { url: signedUrl }
  - Add authentication + authorization

### Frontend - Invoice Actions
- [ ] Add "Mark as Sent" button to invoice detail/edit page (Draft only):
  - Show confirmation dialog: "Generate PDF and mark invoice as sent?"
  - On confirm, call MarkInvoiceAsSent API
  - Show loading spinner with message: "Generating PDF..."
  - Handle 3-5 second delay gracefully
  - On success: Show success toast, navigate to invoice detail (now Sent)
  - On error: Show generic error message
- [ ] Add "Download PDF" button to invoice detail page (Sent/Paid only):
  - Click triggers API call to get PDF URL
  - Open PDF in new tab or download
  - Show loading state while fetching

### Frontend - Invoice List Updates
- [ ] Update invoice list actions:
  - "Mark as Sent" button for Draft invoices
  - "Download PDF" button for Sent/Paid invoices
- [ ] Add status badges with colors:
  - Draft: gray
  - Sent: blue
  - Paid: green

### Testing
- [ ] Unit tests: PDF generation service (mock axios)
- [ ] Unit tests: S3 service (mock AWS SDK)
- [ ] Unit tests: MarkInvoiceAsSent command (mock services)
- [ ] Integration test: Complete flow (Draft → Mark as Sent → PDF generated → Sent status)
- [ ] Integration test: PDF versioning (mark as Sent, edit, mark as Sent again → 2 PDFs)
- [ ] Integration test: Download PDF (verify pre-signed URL)
- [ ] Integration test: Error handling (API failure, S3 failure, rollback)
- [ ] Integration test: Cannot mark as Sent without line items
- [ ] Integration test: Performance < 5 seconds
- [ ] Frontend tests: Mark as Sent button interaction
- [ ] Frontend tests: Download PDF button

**Acceptance Criteria:**
- Draft invoice can be marked as Sent
- PDF generated via Invoice-Generator.com API
- PDF uploaded to S3 with versioned key
- Invoice status changes to Sent
- sent_date set to current timestamp
- S3 key stored in pdf_s3_keys array
- User can download PDF from Sent/Paid invoices
- Pre-signed URL expires in 15 minutes
- Multiple PDFs supported (edit Sent → Draft → Sent again)
- All PDFs preserved in S3 (never deleted)
- Generic error shown to user on failure
- Detailed errors logged to console
- Transaction rollback on failure (stays Draft)
- Performance: < 5 seconds
- Loading spinner shows during generation

---

## PR 6: Payment Management

**Objective:** Implement payment recording and invoice completion

### Database Migration
- [ ] Create `payments` table migration (§6.1):
  - id (UUID, PK)
  - invoice_id (UUID, FK to invoices, NOT NULL)
  - amount (DECIMAL 12,4, NOT NULL)
  - payment_method (VARCHAR 50, NOT NULL)
  - payment_date (DATE, NOT NULL)
  - reference (VARCHAR 255)
  - notes (TEXT)
  - created_at (TIMESTAMP, NOT NULL)
  - Indexes: invoice_id, payment_date
- [ ] Run migration

### Backend - Payment Domain (§3.1)
- [ ] Create Payment entity with invariants:
  - Amount > 0
  - Cannot exceed invoice balance
  - PaymentDate cannot be in future
  - PaymentMethod: Cash | Check | CreditCard | BankTransfer

### Backend - RecordPayment Command (§4.2)
- [ ] **RecordPayment** command + handler:
  - Input: InvoiceId, Amount, PaymentMethod, PaymentDate, Reference, Notes
  - Validation (§4.2 clarified in v1.5):
    - Invoice status must be Sent or Paid (NOT Draft)
    - Amount > 0
    - Amount <= current balance (total - SUM(existing payments))
    - User owns invoice
    - PaymentDate not in future
  - Process:
    1. Create payment record
    2. Compute new balance: total - SUM(all payments including new)
    3. Round balance to 4 decimal places
    4. If balance = 0: Update invoice status='Paid', paid_date=NOW()
  - Return: PaymentId
  - Error codes:
    - PAYMENT_EXCEEDS_BALANCE if amount > balance
    - INVALID_STATE_TRANSITION if invoice is Draft
- [ ] Enforce workflow: Draft → Sent → Payment → Paid
- [ ] Implement balance computation logic (not stored, computed at query time)

### Backend - Payment Queries (§4.3)
- [ ] **GetPaymentById** query + handler:
  - Return: PaymentDTO
- [ ] **ListPaymentsForInvoice** query + handler:
  - Input: InvoiceId
  - Return: PaymentDTO[] (all payments for invoice)
  - Order by payment_date DESC

### Backend - API Endpoints (§5.2)
- [ ] `POST /api/v1/invoices/:id/payments` - RecordPayment
- [ ] `GET /api/v1/payments/:id` - GetPaymentById
- [ ] `GET /api/v1/invoices/:invoiceId/payments` - ListPaymentsForInvoice
- [ ] Add authentication + authorization to all endpoints

### Backend - DTOs (§5.3)
- [ ] Create PaymentDTO:
  - id, invoiceId, amount (USD, 4 decimals)
  - paymentMethod, paymentDate
  - reference, notes
  - createdAt

### Frontend - Payment Store (Pinia)
- [ ] Create PaymentStore with actions:
  - recordPayment
  - fetchPaymentsByInvoice
  - fetchPaymentById
- [ ] State: payments list, loading, error

### Frontend - Record Payment Modal (§8.2)
- [ ] Create RecordPaymentModal component:
  - Trigger: "Record Payment" button on invoice detail (Sent/Paid only)
  - Modal content:
    - Invoice summary (number, customer, total)
    - Current balance (prominent display)
    - Amount input (validated <= balance, > 0)
    - Payment method dropdown (Cash, Check, CreditCard, BankTransfer)
    - Payment date picker (default: today, cannot be future)
    - Reference input (optional)
    - Notes textarea (optional)
    - Submit button
    - Cancel button
  - Validation:
    - Amount required, > 0, <= balance
    - Cannot record payment on Draft (button hidden)
    - Payment method required
    - Payment date cannot be future
  - On success:
    - Close modal
    - Refresh invoice (show updated balance)
    - Show success toast
    - If balance = 0, show "Invoice fully paid!" message
  - On error:
    - Show error message (generic or specific)
    - Don't close modal

### Frontend - Invoice Detail Updates
- [ ] Update invoice detail page:
  - Show current balance prominently
  - Show "Record Payment" button (only if Sent/Paid and balance > 0)
  - Add "Payment History" section:
    - Table: Date, Amount, Method, Reference, Notes
    - Show all payments with total sum
    - Display running balance after each payment
  - Show "Fully Paid" badge if balance = 0
  - If status = Paid, show paid_date

### Frontend - Invoice List Updates
- [ ] Update invoice list to show balance column
- [ ] Color-code balance:
  - Red if overdue (due_date < today and balance > 0)
  - Green if paid (balance = 0)
  - Yellow if due soon (due_date within 7 days)

### Testing
- [ ] Unit tests: Payment entity invariants
- [ ] Unit tests: RecordPayment validation
- [ ] Unit tests: Balance computation (4 decimal rounding)
- [ ] Unit tests: Status transition to Paid when balance = 0
- [ ] Integration test: Record payment → Balance updated
- [ ] Integration test: Partial payment → Invoice stays Sent, balance > 0
- [ ] Integration test: Full payment → Invoice marked Paid, balance = 0
- [ ] Integration test: Multiple payments → Total balance correct
- [ ] Integration test: Cannot record payment on Draft (INVALID_STATE_TRANSITION)
- [ ] Integration test: Cannot overpay (PAYMENT_EXCEEDS_BALANCE)
- [ ] Integration test: Cannot pay in future
- [ ] Frontend tests: Record payment modal validation
- [ ] Frontend tests: Payment history display

**Acceptance Criteria:**
- User can record payment on Sent or Paid invoice
- Cannot record payment on Draft invoice (workflow enforced)
- Payment amount validated (> 0, <= balance)
- Balance computed accurately (4 decimal places)
- Invoice automatically marked as Paid when balance = 0
- Multiple payments supported (partial payments)
- Payment history displayed on invoice detail
- Current balance always visible
- Overpayment blocked (error message shown)
- Future payment dates blocked
- Payment method dropdown works
- All fields validated properly
- Success feedback on payment recording

---

## PR 7: API Documentation & Comprehensive Testing

**Objective:** Complete Swagger documentation and achieve test coverage targets

### API Documentation (§5.4)
- [ ] Set up Swagger/OpenAPI 3.0:
  - Install: `swagger-ui-express`, `swagger-jsdoc`
  - Configure Swagger middleware
  - Serve at `/api/docs`
- [ ] Document all endpoints with OpenAPI spec:
  - Authentication endpoints (`/auth/*`)
  - Customer endpoints (`/customers/*`)
  - Invoice endpoints (`/invoices/*`)
  - Payment endpoints (`/payments/*`)
- [ ] For each endpoint document:
  - HTTP method and path
  - Authentication requirements (Bearer token)
  - Request parameters (path, query, body)
  - Request body schema (with examples)
  - Response schemas (success + error cases)
  - Validation rules
  - Error codes and descriptions
- [ ] Add schema definitions:
  - CustomerDTO, InvoiceDTO, InvoiceSummaryDTO, LineItemDTO, PaymentDTO
  - Error response format
  - Pagination response format
- [ ] Add example requests and responses for each endpoint
- [ ] Document rate limiting (100 req/min per IP)
- [ ] Add authentication section (JWT Bearer token)

### Backend Unit Tests (§10.1)
- [ ] Domain entity tests (>80% coverage target):
  - User entity invariants
  - Customer entity invariants (email uniqueness, required fields)
  - Invoice entity invariants (100 item limit, state transitions, date rules)
  - LineItem entity invariants (quantity > 0, description required)
  - Payment entity invariants (amount > 0, cannot exceed balance)
- [ ] Value object tests:
  - Money (4 decimal places, USD)
  - EmailAddress validation
  - PhoneNumber validation
  - Address validation
  - InvoiceNumber format
- [ ] Command handler tests:
  - CreateCustomer validation
  - CreateInvoice with default values
  - AddLineItem with total recalculation
  - MarkInvoiceAsSent (mock PDF service and S3)
  - RecordPayment with balance calculation
  - All validation rules
- [ ] Query handler tests:
  - Soft delete filtering (deleted_at IS NULL)
  - Pagination logic
  - Search functionality (ILIKE)
  - Balance computation
- [ ] Calculation logic tests:
  - Line item amount = quantity * unitPrice (4 decimals)
  - Subtotal = SUM(line items)
  - TaxAmount = subtotal * taxRate / 100 (4 decimals)
  - Total = subtotal + taxAmount
  - Balance = total - SUM(payments) (4 decimals)
  - Rounding to 4 decimal places (HALF_UP)

### Backend Integration Tests (§10.2)
- [ ] Complete invoice payment flow (§10.2 critical path):
  1. Register user
  2. Create customer
  3. Create invoice (Draft)
  4. Add multiple line items
  5. Verify total calculation
  6. Mark invoice as Sent (PDF generated)
  7. Verify cannot edit after sending
  8. Record partial payment
  9. Verify balance update
  10. Record final payment
  11. Verify status change to Paid
- [ ] Invoice lifecycle test:
  - Create Draft invoice
  - Edit line items
  - Delete line items
  - Mark as Sent
  - Verify cannot edit after sending
  - Download PDF (verify pre-signed URL)
- [ ] Customer management test:
  - Create customer
  - Update customer details
  - List customers with pagination
  - Delete customer (soft delete verification)
  - Verify cannot create customer with existing email (including deleted)
- [ ] Authentication flow test:
  - Register → Login → Access protected route → Logout
  - Token refresh flow
  - Invalid token rejection
- [ ] Authorization test:
  - User A cannot access User B's resources
  - 403 FORBIDDEN returned
- [ ] Search and filter tests:
  - Customer search (name, email)
  - Invoice search (number, customer name)
  - Filter invoices by status
- [ ] Error handling tests:
  - Validation errors return 400
  - Not found returns 404
  - Unauthorized returns 401
  - Forbidden returns 403
  - Business rule violations return 422
- [ ] Rate limiting test:
  - Exceed 100 requests/min
  - Verify 429 response with Retry-After header

### Frontend Tests (§10.1)
- [ ] Component logic tests:
  - CustomerForm validation
  - InvoiceForm validation
  - LineItemTable calculations
  - RecordPaymentModal validation
- [ ] Pinia store tests:
  - AuthStore actions (login, logout, token refresh)
  - CustomerStore actions (CRUD)
  - InvoiceStore actions (CRUD, line items)
  - PaymentStore actions
  - Store getters (computed properties)
- [ ] Composables tests:
  - useAuth
  - usePagination
  - useSearch
- [ ] Utility function tests:
  - Date formatting
  - Currency formatting (4 decimals)
  - Validation helpers

### End-to-End Tests (Cypress)
- [ ] Complete user journey test:
  1. Sign up new user
  2. Login
  3. Create first customer
  4. Create first invoice with line items
  5. Mark invoice as sent
  6. Download PDF
  7. Record payment
  8. Verify invoice marked as paid
  9. Logout
- [ ] Navigation tests:
  - Protected routes redirect to login when not authenticated
  - Successful navigation after login
  - Route guards work correctly
- [ ] Error scenarios:
  - Form validation errors displayed
  - API errors handled gracefully
  - Network errors handled

### Test Infrastructure
- [ ] Set up test database (separate from dev):
  - Create test database
  - Run migrations
  - Seed test data
- [ ] Create test factories (§10.3):
  - UserFactory
  - CustomerFactory
  - InvoiceFactory
  - LineItemFactory
  - PaymentFactory
- [ ] Create seed data (§10.3):
  - 10 sample customers
  - 20 sample invoices (various statuses)
  - 30 line items
  - 10 payments
- [ ] Mock external services:
  - Mock Invoice-Generator.com API
  - Mock AWS S3
  - Mock AWS Cognito

### Test Coverage Report
- [ ] Configure Jest coverage:
  - Coverage threshold: 80% for domain and application layers
  - Generate HTML report
  - Exclude infrastructure and tests from coverage
- [ ] Add coverage scripts to package.json:
  - `npm run test:coverage`
  - `npm run test:unit`
  - `npm run test:integration`
- [ ] Set up CI to enforce coverage threshold

**Acceptance Criteria:**
- Swagger documentation accessible at `/api/docs`
- All endpoints documented with examples
- Unit test coverage > 80% for domain and application layers
- All critical user flows have integration tests
- All test suites pass (unit, integration, E2E)
- Test database setup and seed data working
- Mock services configured properly
- Coverage reports generated
- Documentation is clear and accurate

---

## PR 8: Deployment, Monitoring & Production Readiness

**Objective:** Deploy to AWS and ensure production readiness

### CI/CD Pipeline (§12.2)
- [ ] Set up GitHub Actions workflow:
  - Trigger on push to `develop` and `main` branches
  - Steps:
    1. Checkout code
    2. Install dependencies (backend + frontend)
    3. Run linter (ESLint, Prettier check)
    4. Run unit tests
    5. Run integration tests
    6. Build backend (TypeScript compilation)
    7. Build frontend (Vite production build)
    8. Run security audit (npm audit)
- [ ] Add deployment steps (staging):
  - Push Docker image to AWS ECR (or build on EC2)
  - Deploy to staging environment
  - Run smoke tests
- [ ] Add deployment steps (production):
  - Require manual approval
  - Deploy to production environment
  - Run health checks

### Docker Configuration
- [ ] Create Dockerfile for backend:
  - Node.js base image
  - Copy package files, install dependencies
  - Copy source code
  - Build TypeScript
  - Expose port 3000
  - Start command: `node dist/server.js`
- [ ] Create Dockerfile for frontend:
  - Node.js base image for build
  - Build Vue app
  - Nginx base image for serving
  - Copy dist files to nginx
  - Expose port 80
- [ ] Create docker-compose.yml for local development:
  - Backend service
  - Frontend service
  - PostgreSQL service
  - Volume mounts for development

### AWS Infrastructure Setup (§12.1)
- [ ] Set up AWS RDS PostgreSQL:
  - Instance class: db.t3.micro (or appropriate for load)
  - Multi-AZ: No (for MVP)
  - Storage: 20GB SSD
  - Backup: 7-day retention
  - Security group: Allow connections from backend
- [ ] Set up AWS ECS or EC2:
  - Backend deployment (container or instance)
  - Environment variables configured
  - Security group: Allow HTTPS (443), HTTP redirect
  - Auto-scaling: Optional for MVP
- [ ] Set up CloudFront (§12.1):
  - Origin: S3 bucket for frontend static assets
  - Cache behavior: Cache static assets
  - SSL certificate: ACM certificate
- [ ] Set up AWS S3 for frontend:
  - Create bucket for frontend build
  - Enable static website hosting
  - Configure bucket policy for CloudFront
- [ ] Verify AWS services already set up in PR1:
  - Cognito User Pool (production instance)
  - S3 bucket for invoice PDFs (production bucket)

### Database Migrations (§12.3)
- [ ] Add migration scripts to package.json:
  - `npm run migrate:up` - Run pending migrations
  - `npm run migrate:down` - Rollback last migration
  - `npm run migrate:create` - Create new migration
- [ ] Configure migrations for production:
  - Connection string from environment variable
  - SSL mode required for RDS
- [ ] Document rollback strategy:
  - Rollback procedure if migration fails
  - Backup before migration
- [ ] Add pre-deployment migration check:
  - Verify all migrations run successfully in staging
  - Require manual approval for production migrations

### Environment Configuration
- [ ] Create production .env configuration:
  - Production database URL (RDS)
  - Production AWS credentials (IAM role preferred)
  - Production Cognito User Pool
  - Production S3 bucket
  - Production Invoice-Generator.com API key
  - NODE_ENV=production
- [ ] Create staging .env configuration
- [ ] Document environment setup in README

### Monitoring & Logging (§9.4)
- [ ] Implement structured logging:
  - JSON format logs
  - Log levels: ERROR, WARN, INFO, DEBUG
  - Include request ID for tracing
  - Log to stdout (captured by AWS CloudWatch)
- [ ] Add health check endpoint (§9.4):
  - `GET /health`
  - Check database connectivity
  - Check AWS services (S3, Cognito accessible)
  - Return: { status: 'healthy', database: 'ok', aws: 'ok' }
- [ ] Set up AWS CloudWatch:
  - Log groups for backend application
  - Log retention: 30 days
  - Create alarms:
    - Error rate > threshold
    - Response time > 5 seconds
    - Health check failures
- [ ] Optional: Set up APM (Application Performance Monitoring):
  - New Relic, Datadog, or similar
  - Track API response times
  - Track error rates
  - Track database query performance

### Security Hardening (§9.3)
- [ ] Enable HTTPS only (TLS 1.2+):
  - Configure SSL certificate (AWS ACM)
  - Redirect HTTP to HTTPS
- [ ] Configure CORS properly:
  - Whitelist production frontend domain
  - Remove localhost from production CORS whitelist
- [ ] Set security headers:
  - Content-Security-Policy
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - Strict-Transport-Security (HSTS)
- [ ] Configure rate limiting for production:
  - 100 requests per minute per IP (as specified)
  - Use Redis for distributed rate limiting (optional)
- [ ] Enable AWS WAF (Web Application Firewall) - optional:
  - Rate limiting rules
  - SQL injection protection
  - XSS protection

### Performance Optimization
- [ ] Backend optimizations:
  - Enable compression (gzip)
  - Database connection pooling (min 5, max 20)
  - Add database indexes (verify all indexes from schema)
  - Implement request timeout (30 seconds)
- [ ] Frontend optimizations:
  - Enable code splitting (Vite automatic)
  - Lazy load routes
  - Optimize assets (images, fonts)
  - Enable browser caching for static assets
  - Minify production build

### Error Handling & Resilience
- [ ] Implement global error handler:
  - Catch all unhandled errors
  - Log with context (request ID, user ID, stack trace)
  - Return consistent error response format
  - Don't expose sensitive data in production errors
- [ ] Implement graceful shutdown:
  - Handle SIGTERM signal
  - Close database connections
  - Finish in-flight requests
  - Exit cleanly
- [ ] Add retry logic for external services:
  - Invoice-Generator.com API: 3 retries with exponential backoff
  - S3 operations: 3 retries
  - Database queries: Automatic retry on connection loss

### Documentation Updates
- [ ] Update README.md:
  - Production deployment instructions
  - Environment variable reference
  - Migration instructions
  - Troubleshooting guide
- [ ] Create DEPLOYMENT.md:
  - Step-by-step deployment guide
  - Rollback procedures
  - Health check verification
  - Smoke test checklist
- [ ] Create OPERATIONS.md:
  - Monitoring setup
  - Log access instructions
  - Common issues and solutions
  - Scaling guidelines

### Final Verification
- [ ] Run smoke tests in production:
  - Register new user
  - Create customer
  - Create invoice
  - Mark as sent (verify PDF generation)
  - Record payment
  - Download PDF
  - Logout
- [ ] Verify all success criteria from PRD (§14):
  - All core commands and queries working
  - User registration/authentication functional
  - Invoice lifecycle (Draft → Sent → Paid) working
  - PDF generation working with all fields
  - All calculations accurate (4 decimal places)
  - Soft delete working
  - Email uniqueness enforced
  - PDF versioning working
  - Global invoice numbering working
  - Pagination defaulting to 25
- [ ] Performance verification:
  - API response times < 200ms for CRUD
  - Complex queries < 500ms
  - PDF generation < 5 seconds
  - No noticeable UI lag
- [ ] Security verification:
  - JWT authentication working
  - Authorization checks enforced
  - Rate limiting active
  - HTTPS enabled
  - CORS configured correctly

**Acceptance Criteria:**
- Application deployed to AWS production
- CI/CD pipeline running successfully
- Database migrations automated
- Monitoring and logging configured
- Health checks passing
- Performance targets met
- Security measures in place
- All smoke tests passing
- Documentation complete and accurate
- Production environment stable
- Rollback procedures tested

---

## Implementation Notes

### General Guidelines
- Follow DDD, CQRS, and Vertical Slice Architecture principles throughout
- Use TypeScript strict mode (no `any` types except where necessary)
- Write tests alongside implementation (not as afterthought)
- Keep functions under 50 lines, files under 300 lines
- Use descriptive variable names (camelCase for variables, PascalCase for classes)
- Add JSDoc comments for public APIs
- Commit with conventional commit messages (feat:, fix:, refactor:, test:, docs:)

### Code Review Checklist (§11.4)
Before merging each PR, verify:
- [ ] Follows architectural principles (DDD, CQRS, VSA)
- [ ] Proper layer separation (no domain logic in controllers)
- [ ] Unit tests included with >80% coverage
- [ ] No direct database access from domain layer
- [ ] DTOs used at API boundaries
- [ ] Error handling implemented
- [ ] TypeScript types properly defined (no `any`)
- [ ] API documented in Swagger
- [ ] Integration tests for critical paths
- [ ] Linter passes (no warnings)
- [ ] All tests passing

### Order of Implementation
PRs must be completed in sequential order (1 → 8) due to dependencies:

**Sequential Dependencies:**
1. **PR 1** - Foundation (required for everything else)
   - Must complete before any other PR
   - Establishes project structure, database, AWS services
   
2. **PR 2** - Authentication (required for all feature PRs)
   - Depends on: PR 1 (database, AWS Cognito setup)
   - All subsequent features require authentication
   
3. **PR 3** - Customers (required for PR 4)
   - Depends on: PR 1, PR 2
   - Invoices require customer records
   
4. **PR 4** - Invoice core (required for PR 5)
   - Depends on: PR 1, PR 2, PR 3
   - Must have invoice CRUD before PDF generation
   
5. **PR 5** - PDF generation (required for PR 6)
   - Depends on: PR 1, PR 2, PR 3, PR 4
   - Payments require invoices to be in "Sent" status (which requires PDF generation)
   
6. **PR 6** - Payments (completes core features)
   - Depends on: PR 1, PR 2, PR 3, PR 4, PR 5
   - Final piece of core invoice lifecycle
   
7. **PR 7** - Documentation & testing
   - Depends on: PR 1-6 complete (tests all features)
   - Can partially overlap with PR 6 (unit tests can be written alongside)
   
8. **PR 8** - Deployment
   - Depends on: PR 1-7 complete
   - Requires all features and tests passing

**Note:** While PRs must be completed sequentially, unit tests should be written alongside implementation in each PR, not deferred to PR 7.

### Success Metrics
Upon completion of all PRs, verify against PRD §14 Success Criteria:
- ✅ Functional completeness (all commands/queries working)
- ✅ Architectural compliance (DDD, CQRS, VSA)
- ✅ Performance targets met
- ✅ Code quality standards met (>80% coverage, TypeScript strict)
- ✅ User experience smooth (intuitive UI, responsive, error handling)

---

**End of Task List**

