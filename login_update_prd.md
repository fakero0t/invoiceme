# Login Update PRD - Simple Authentication System

**Version:** 1.0  
**Date:** November 9, 2025  
**Status:** Planning

---

## Executive Summary

Replace AWS Cognito authentication with a simple, local authentication system for the Invoice System MVP. The new system will use bcrypt for password hashing and JWT for token-based authentication, maintaining the existing API surface and user experience while removing AWS Cognito dependencies.

**Core Objectives:**
- Replace AWS Cognito with local password-based authentication
- Implement secure password hashing using bcrypt
- Generate and verify JWT tokens locally
- Maintain existing API contracts and frontend integration
- Enable login screen as the entry point to the application
- Zero impact on customer, invoice, and payment features

---

## 1. Current State Analysis

### 1.1 Authentication Flow (Current - AWS Cognito)

**Registration:**
1. User submits email, password, name via `/api/v1/auth/register`
2. Backend validates input and checks for duplicate email in database
3. Backend calls AWS Cognito `signUpUser()` to create user
4. User record created in PostgreSQL with Cognito-generated UUID
5. Auto-login via Cognito `loginUser()`
6. JWT tokens returned and stored in httpOnly cookies + localStorage

**Login:**
1. User submits email, password via `/api/v1/auth/login`
2. Backend calls AWS Cognito `loginUser()` for authentication
3. Cognito returns JWT access token, refresh token, and ID token
4. Backend fetches user record from database
5. Tokens stored in httpOnly cookies + localStorage

**Token Verification:**
1. `authMiddleware` extracts token from Authorization header or cookie
2. Token verified using AWS Cognito public keys via `CognitoJwtVerifier`
3. User ID and email extracted from token claims
4. **Currently disabled** - middleware mocks user for development

**Logout:**
1. Client calls `/api/v1/auth/logout`
2. Backend calls AWS Cognito `GlobalSignOut`
3. Tokens cleared from cookies

### 1.2 Current Dependencies

**Backend Files:**
- `src/infrastructure/aws/cognitoClient.ts` - AWS Cognito SDK wrapper
- `src/features/auth/register.ts` - Calls Cognito signup
- `src/features/auth/login.ts` - Calls Cognito login
- `src/features/auth/logout.ts` - Calls Cognito signout
- `src/features/auth/refresh.ts` - Token refresh via Cognito
- `src/shared/middleware/auth.ts` - JWT verification with Cognito
- `src/config/env.ts` - AWS Cognito environment variables

**Frontend Files:**
- `invoice-frontend/src/stores/auth.ts` - Auth state management
- `invoice-frontend/src/shared/api/auth.ts` - API client calls
- `invoice-frontend/src/features/auth/LoginPage.vue` - Login UI
- `invoice-frontend/src/features/auth/SignupPage.vue` - Signup UI (assumed to exist)
- `invoice-frontend/src/router/index.ts` - Auth guards (currently disabled)

**Database:**
- `users` table - No password field (handled by Cognito)
- User ID is Cognito sub (UUID format)

**Environment Variables:**
- `AWS_COGNITO_USER_POOL_ID`
- `AWS_COGNITO_CLIENT_ID`
- `AWS_COGNITO_CLIENT_SECRET` (optional)
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

---

## 2. Target Architecture

### 2.1 Simple Authentication Flow

**Registration:**
1. User submits email, password, name via `/api/v1/auth/register`
2. Backend validates input (email format, password requirements)
3. Backend hashes password using bcrypt (salt rounds: 10)
4. User record created in PostgreSQL with UUID (generated via `uuid.v4()`)
5. JWT access token and refresh token generated locally
6. Tokens returned and stored in httpOnly cookies + localStorage

**Login:**
1. User submits email, password via `/api/v1/auth/login`
2. Backend fetches user by email from database
3. Backend verifies password using `bcrypt.compare()`
4. JWT access token and refresh token generated
5. Tokens stored in httpOnly cookies + localStorage

**Token Verification:**
1. `authMiddleware` extracts token from Authorization header or cookie
2. Token verified using `jsonwebtoken.verify()` with secret key
3. User ID and email extracted from JWT payload
4. Auth middleware **re-enabled** for production use

**Logout:**
1. Client calls `/api/v1/auth/logout`
2. Backend clears httpOnly cookies
3. Client clears localStorage tokens
4. (Optional) Add token to blacklist/invalidation list

**Refresh Token:**
1. Client calls `/api/v1/auth/refresh` with refresh token
2. Backend verifies refresh token signature
3. New access token generated and returned
4. Refresh token optionally rotated

### 2.2 Password Requirements

**Validation Rules** (maintain existing):
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)

**Password Storage:**
- Hashed using bcrypt with salt rounds: 10
- Plain text passwords never stored
- Hash stored in `password_hash` column

### 2.3 JWT Token Structure

**Access Token Payload:**
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "type": "access",
  "iat": 1699564800,
  "exp": 1699568400
}
```

**Access Token Settings:**
- Algorithm: HS256
- Expiration: 1 hour (3600 seconds)
- Secret: Environment variable `JWT_SECRET`

**Refresh Token Payload:**
```json
{
  "sub": "user-uuid",
  "type": "refresh",
  "iat": 1699564800,
  "exp": 1702156800
}
```

**Refresh Token Settings:**
- Algorithm: HS256
- Expiration: 30 days (2592000 seconds)
- Secret: Environment variable `JWT_REFRESH_SECRET`

### 2.4 Security Considerations

**Password Security:**
- Bcrypt hashing with salt rounds 10
- No password reset functionality (MVP scope)
- Password validation enforced on both client and server

**Token Security:**
- HttpOnly cookies (prevent XSS attacks)
- Secure flag enabled in production
- SameSite=Strict (prevent CSRF)
- Tokens also stored in localStorage (for client-side checks)

**Additional Measures:**
- Rate limiting on login endpoint (existing)
- Email uniqueness enforced at database level
- Input validation and sanitization

---

## 3. Implementation Plan

### 3.1 Database Migration

**File:** `migrations/[timestamp]_add-password-to-users.js`

**Changes:**
- Add `password_hash` column to `users` table (varchar 255, not null)
- Set default value for existing users (for testing) or require manual update

**SQL:**
```sql
ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);
```

**Notes:**
- Existing user records will need password hashes added
- Consider seeding test user with known credentials

### 3.2 Backend Changes

#### 3.2.1 New Dependencies

**Add to `package.json`:**
```json
{
  "bcrypt": "^5.1.1",
  "jsonwebtoken": "^9.0.2",
  "uuid": "^9.0.1"
}
```

**Remove dependencies:**
- `@aws-sdk/client-cognito-identity-provider`
- `aws-jwt-verify`

#### 3.2.2 Environment Configuration

**File:** `src/config/env.ts`

**Changes:**
- Remove AWS Cognito variables
- Add JWT secret variables

**New Environment Variables:**
```typescript
JWT_SECRET: z.string().min(32),
JWT_REFRESH_SECRET: z.string().min(32),
JWT_ACCESS_EXPIRATION: z.string().default('3600'), // 1 hour
JWT_REFRESH_EXPIRATION: z.string().default('2592000'), // 30 days
```

**Remove:**
- `AWS_COGNITO_USER_POOL_ID`
- `AWS_COGNITO_CLIENT_ID`
- `AWS_COGNITO_CLIENT_SECRET`

#### 3.2.3 New Authentication Service

**File:** `src/infrastructure/auth/jwtService.ts` (NEW)

**Responsibilities:**
- Generate access tokens
- Generate refresh tokens
- Verify access tokens
- Verify refresh tokens

**Key Functions:**
```typescript
generateAccessToken(userId: string, email: string): string
generateRefreshToken(userId: string): string
verifyAccessToken(token: string): { sub: string; email: string }
verifyRefreshToken(token: string): { sub: string }
```

#### 3.2.4 New Password Service

**File:** `src/infrastructure/auth/passwordService.ts` (NEW)

**Responsibilities:**
- Hash passwords
- Compare passwords
- Validate password requirements

**Key Functions:**
```typescript
hashPassword(plainPassword: string): Promise<string>
comparePassword(plainPassword: string, hash: string): Promise<boolean>
validatePasswordRequirements(password: string): void
```

#### 3.2.5 Update User Domain Entity

**File:** `src/domain/user/User.ts`

**Changes:**
- Add optional `passwordHash` property (not exposed in `toJSON()`)
- Add method `setPassword()` to update password hash
- Add factory method `createWithPassword()`

**Example:**
```typescript
class User {
  private passwordHash?: string;
  
  static createWithPassword(props: {
    email: string;
    name: string;
    passwordHash: string;
  }): User { /* ... */ }
  
  setPassword(passwordHash: string): void { /* ... */ }
}
```

#### 3.2.6 Update User Repository

**File:** `src/infrastructure/database/UserRepository.ts`

**Changes:**
- Add password_hash to INSERT and SELECT queries
- Add `findByEmailWithPassword()` method for login
- Update `save()` to include password_hash

#### 3.2.7 Update Auth Handlers

**File:** `src/features/auth/register.ts`

**Changes:**
1. Remove Cognito imports and calls
2. Import `passwordService` and `jwtService`
3. Validate password requirements using `passwordService.validatePasswordRequirements()`
4. Hash password using `passwordService.hashPassword()`
5. Generate UUID using `uuid.v4()`
6. Create user with password hash
7. Generate JWT tokens using `jwtService`
8. Return tokens in same format

**File:** `src/features/auth/login.ts`

**Changes:**
1. Remove Cognito imports and calls
2. Import `passwordService` and `jwtService`
3. Fetch user with password hash using `userRepository.findByEmailWithPassword()`
4. Verify password using `passwordService.comparePassword()`
5. Generate JWT tokens using `jwtService`
6. Return tokens in same format

**File:** `src/features/auth/logout.ts`

**Changes:**
1. Remove Cognito signout call
2. Clear httpOnly cookies
3. Return success response
4. (Optional) Add token to blacklist

**File:** `src/features/auth/refresh.ts`

**Changes:**
1. Remove Cognito token refresh
2. Verify refresh token using `jwtService.verifyRefreshToken()`
3. Generate new access token
4. (Optional) Rotate refresh token
5. Return new tokens

**File:** `src/features/auth/me.ts`

**Changes:**
- Minimal or no changes (uses req.user from middleware)

#### 3.2.8 Update Auth Middleware

**File:** `src/shared/middleware/auth.ts`

**Changes:**
1. Remove AWS Cognito JWT verifier imports
2. Import `jwtService`
3. Remove mock user code (re-enable auth)
4. Verify token using `jwtService.verifyAccessToken()`
5. Extract user info from JWT payload
6. Set `req.user` from token claims

#### 3.2.9 Remove Cognito Client

**File:** `src/infrastructure/aws/cognitoClient.ts`

**Action:** DELETE (no longer needed)

### 3.3 Frontend Changes

**No Changes Required** - The frontend already has:
- Login page (`LoginPage.vue`)
- Signup page (assumed `SignupPage.vue`)
- Auth store with login/register/logout methods
- Router guards (currently disabled)

**Actions:**
1. **Re-enable router guards** in `invoice-frontend/src/router/index.ts`
   - Uncomment the original auth check logic
   - Remove dev bypass code

2. **Test existing UI** - Ensure login/signup forms work with backend

**Optional Enhancements:**
- Add "Remember Me" checkbox
- Add "Forgot Password" link (future feature)
- Improve error messaging for password requirements

### 3.4 Configuration & Environment

**Backend `.env` file:**

**Add:**
```env
JWT_SECRET=your-secret-key-min-32-chars-long-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars-long
JWT_ACCESS_EXPIRATION=3600
JWT_REFRESH_EXPIRATION=2592000
```

**Remove:**
```env
AWS_COGNITO_USER_POOL_ID
AWS_COGNITO_CLIENT_ID
AWS_COGNITO_CLIENT_SECRET
```

**Frontend `.env` file:**
- No changes required

### 3.5 Testing Strategy

#### 3.5.1 Unit Tests

**New Test Files:**
- `src/infrastructure/auth/jwtService.test.ts`
  - Test token generation
  - Test token verification
  - Test expired token handling
  - Test invalid token handling

- `src/infrastructure/auth/passwordService.test.ts`
  - Test password hashing
  - Test password comparison
  - Test password validation rules

**Update Test Files:**
- `src/tests/security/authentication.test.ts`
  - Update to test local authentication
  - Test login with correct credentials
  - Test login with incorrect credentials
  - Test registration flow
  - Test token refresh flow

#### 3.5.2 Integration Tests

**Update:**
- `src/tests/integration/*.test.ts`
  - Update auth setup to use local tokens
  - Remove Cognito test setup

**Test Cases:**
1. Register new user → verify user created in DB
2. Login with valid credentials → verify tokens returned
3. Login with invalid credentials → verify 401 error
4. Access protected endpoint with valid token → verify success
5. Access protected endpoint without token → verify 401 error
6. Access protected endpoint with expired token → verify 401 error
7. Refresh token → verify new access token generated
8. Logout → verify cookies cleared

#### 3.5.3 End-to-End Tests (Frontend)

**Files:** `invoice-frontend/e2e/auth/*.ts`

**Test Scenarios:**
1. User registers new account
2. User logs in with valid credentials
3. User logs in with invalid credentials (error shown)
4. User navigates to protected route without login (redirected to login)
5. User logs in and navigates to dashboard (success)
6. User logs out (redirected to login)
7. User refreshes page while logged in (stays logged in)

### 3.6 Data Migration

**For Existing Users:**

Since the current system uses Cognito, there are two approaches:

**Option A: Reset All Users (MVP - Recommended)**
- Drop existing users table data
- Require all users to re-register
- Simplest approach for MVP

**Option B: Manual Password Setup**
- Send email to existing users with password setup link
- Users set new password
- Requires password reset functionality (out of MVP scope)

**Recommendation:** Use Option A for MVP. The system likely has minimal production users.

---

## 4. Security Checklist

### 4.1 Password Security
- ✅ Passwords hashed with bcrypt (salt rounds 10)
- ✅ Plain text passwords never stored
- ✅ Password requirements enforced (8+ chars, upper, lower, number)
- ✅ Password validation on both client and server

### 4.2 Token Security
- ✅ HttpOnly cookies for token storage
- ✅ Secure flag in production
- ✅ SameSite=Strict for CSRF protection
- ✅ Access token short expiration (1 hour)
- ✅ Refresh token rotation (optional but recommended)

### 4.3 API Security
- ✅ Rate limiting on auth endpoints
- ✅ Input validation and sanitization
- ✅ Email uniqueness enforced
- ✅ Auth middleware re-enabled
- ✅ Protected routes require valid token

### 4.4 Development vs Production
- ✅ Different JWT secrets per environment
- ✅ Secure flag enabled in production only
- ✅ CORS origin configured correctly
- ✅ Debug logging disabled in production

---

## 5. Implementation Sequence

### Phase 1: Backend Infrastructure (2-4 hours)
1. Run database migration to add password_hash column
2. Install new dependencies (bcrypt, jsonwebtoken, uuid)
3. Create `jwtService.ts` with token generation/verification
4. Create `passwordService.ts` with hashing/validation
5. Update environment configuration
6. Write unit tests for new services

### Phase 2: Backend Auth Endpoints (2-3 hours)
1. Update User domain entity to support password hash
2. Update UserRepository to handle password_hash
3. Rewrite `register.ts` handler (remove Cognito, add local auth)
4. Rewrite `login.ts` handler (remove Cognito, add local auth)
5. Rewrite `logout.ts` handler (remove Cognito)
6. Rewrite `refresh.ts` handler (remove Cognito)
7. Update `authMiddleware.ts` (remove Cognito JWT verifier, add local JWT verify)
8. Delete `cognitoClient.ts`

### Phase 3: Testing (2-3 hours)
1. Write integration tests for auth endpoints
2. Update existing tests to remove Cognito dependencies
3. Test registration flow manually
4. Test login flow manually
5. Test token refresh manually
6. Test protected endpoints with valid/invalid tokens

### Phase 4: Frontend Integration (1-2 hours)
1. Re-enable router auth guards
2. Test login page → dashboard flow
3. Test signup page → dashboard flow
4. Test logout → login redirect
5. Test protected route access without auth
6. Run E2E tests

### Phase 5: Cleanup & Documentation (1 hour)
1. Remove AWS Cognito environment variables from `.env.example`
2. Add JWT secret variables to `.env.example`
3. Update README with new auth setup instructions
4. Update API documentation (Swagger) if needed
5. Clean up unused Cognito dependencies from package.json

---

## 6. Rollback Plan

If issues arise during implementation:

1. **Revert database migration:**
   ```bash
   npm run migrate down
   ```

2. **Restore Cognito code from git:**
   ```bash
   git checkout HEAD -- src/infrastructure/aws/cognitoClient.ts
   git checkout HEAD -- src/features/auth/
   git checkout HEAD -- src/shared/middleware/auth.ts
   ```

3. **Restore environment variables**

4. **Reinstall Cognito dependencies:**
   ```bash
   npm install @aws-sdk/client-cognito-identity-provider aws-jwt-verify
   ```

---

## 7. Success Criteria

### 7.1 Functional Requirements
- ✅ Users can register with email, password, and name
- ✅ Users can login with email and password
- ✅ Users can logout
- ✅ Logged-in users can access protected routes
- ✅ Non-logged-in users are redirected to login
- ✅ Tokens refresh automatically before expiration
- ✅ All existing features (customers, invoices, payments) work unchanged

### 7.2 Technical Requirements
- ✅ No AWS Cognito dependencies in code
- ✅ Passwords stored as bcrypt hashes
- ✅ JWT tokens generated and verified locally
- ✅ Auth middleware enabled and functioning
- ✅ All tests passing
- ✅ No breaking changes to frontend API surface

### 7.3 Security Requirements
- ✅ Password requirements enforced
- ✅ HttpOnly cookies configured correctly
- ✅ Rate limiting active on auth endpoints
- ✅ No plain text passwords in logs or database

---

## 8. Out of Scope (Future Enhancements)

The following features are NOT included in this MVP update:

- ❌ Password reset functionality
- ❌ Email verification
- ❌ Two-factor authentication (2FA)
- ❌ Social login (Google, GitHub, etc.)
- ❌ Account lockout after failed attempts
- ❌ Password strength meter in UI
- ❌ Token blacklist/revocation system
- ❌ Remember me functionality
- ❌ Session management/concurrent sessions
- ❌ Password history (prevent reuse)

---

## 9. Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **JWT secret leaked** | High | Low | Use strong secrets, rotate regularly, store in env vars |
| **Bcrypt performance issues** | Medium | Low | Salt rounds = 10 is standard, add rate limiting |
| **Token replay attacks** | Medium | Low | Short expiration, HttpOnly cookies, HTTPS only |
| **Existing users locked out** | High | Medium | Provide clear migration instructions, reset data for MVP |
| **Password validation bypassed** | High | Low | Validate on both client and server |
| **Frontend auth state out of sync** | Medium | Medium | Refresh user on app init, handle 401 globally |

---

## 10. Appendix

### 10.1 File Changes Summary

**New Files:**
- `migrations/[timestamp]_add-password-to-users.js`
- `src/infrastructure/auth/jwtService.ts`
- `src/infrastructure/auth/passwordService.ts`

**Modified Files:**
- `src/config/env.ts`
- `src/domain/user/User.ts`
- `src/infrastructure/database/UserRepository.ts`
- `src/features/auth/register.ts`
- `src/features/auth/login.ts`
- `src/features/auth/logout.ts`
- `src/features/auth/refresh.ts`
- `src/shared/middleware/auth.ts`
- `invoice-frontend/src/router/index.ts`
- `package.json`
- `.env`
- `.env.example`

**Deleted Files:**
- `src/infrastructure/aws/cognitoClient.ts`

**Frontend:** No new files, minimal changes to router

### 10.2 API Contract (Unchanged)

**POST /api/v1/auth/register**
```json
Request:
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}

Response:
{
  "user": { "id": "uuid", "email": "...", "name": "..." },
  "accessToken": "jwt-token",
  "refreshToken": "jwt-refresh-token"
}
```

**POST /api/v1/auth/login**
```json
Request:
{
  "email": "user@example.com",
  "password": "SecurePass123"
}

Response:
{
  "user": { "id": "uuid", "email": "...", "name": "..." },
  "accessToken": "jwt-token",
  "refreshToken": "jwt-refresh-token",
  "expiresIn": 3600
}
```

**POST /api/v1/auth/logout**
```json
Response:
{
  "message": "Logged out successfully"
}
```

**POST /api/v1/auth/refresh**
```json
Response:
{
  "accessToken": "new-jwt-token"
}
```

**GET /api/v1/auth/me**
```json
Response:
{
  "user": { "id": "uuid", "email": "...", "name": "..." }
}
```

### 10.3 JWT Token Example

**Generated Access Token (decoded):**
```json
{
  "sub": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "type": "access",
  "iat": 1699564800,
  "exp": 1699568400
}
```

**Token Usage:**
- Stored in httpOnly cookie: `accessToken`
- Also in localStorage: `accessToken`
- Sent in Authorization header: `Bearer <token>`
- Verified by `authMiddleware` on every protected request

---

## 11. Complete Implementation Details

This section provides complete, copy-paste ready code for all changes.

### 11.1 Database Migration

**File:** `migrations/[timestamp]_add-password-to-users.js`

```javascript
/* eslint-disable @typescript-eslint/no-var-requires */

/**
 * Add password_hash column to users table for local authentication
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  // Add password_hash column
  pgm.addColumn('users', {
    password_hash: {
      type: 'varchar(255)',
      notNull: false, // Allow null initially for migration
    },
  });

  // After deployment, we'll set notNull: true once all users have passwords
  // For MVP, we can truncate existing users and require re-registration
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropColumn('users', 'password_hash');
};
```

**Generate timestamp for migration:**
```bash
# Run this command to create the migration file with current timestamp
node -e "console.log(Date.now())"
# Use output as: migrations/[OUTPUT]_add-password-to-users.js
```

### 11.2 New File: JWT Service

**File:** `src/infrastructure/auth/jwtService.ts`

```typescript
import jwt from 'jsonwebtoken';
import { config } from '../../config/env';

interface AccessTokenPayload {
  sub: string;
  email: string;
  type: 'access';
}

interface RefreshTokenPayload {
  sub: string;
  type: 'refresh';
}

/**
 * JWT Service
 * Handles generation and verification of JWT tokens
 */
export class JwtService {
  /**
   * Generate access token
   * @param userId - User UUID
   * @param email - User email
   * @returns JWT access token string
   */
  generateAccessToken(userId: string, email: string): string {
    const payload: AccessTokenPayload = {
      sub: userId,
      email,
      type: 'access',
    };

    return jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: parseInt(config.JWT_ACCESS_EXPIRATION, 10),
      algorithm: 'HS256',
    });
  }

  /**
   * Generate refresh token
   * @param userId - User UUID
   * @returns JWT refresh token string
   */
  generateRefreshToken(userId: string): string {
    const payload: RefreshTokenPayload = {
      sub: userId,
      type: 'refresh',
    };

    return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
      expiresIn: parseInt(config.JWT_REFRESH_EXPIRATION, 10),
      algorithm: 'HS256',
    });
  }

  /**
   * Verify access token
   * @param token - JWT token string
   * @returns Decoded token payload
   * @throws Error if token is invalid or expired
   */
  verifyAccessToken(token: string): AccessTokenPayload {
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET, {
        algorithms: ['HS256'],
      }) as AccessTokenPayload;

      // Verify token type
      if (decoded.type !== 'access') {
        throw new Error('INVALID_TOKEN_TYPE');
      }

      return decoded;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('TOKEN_EXPIRED');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new Error('INVALID_TOKEN');
      }
      throw error;
    }
  }

  /**
   * Verify refresh token
   * @param token - JWT refresh token string
   * @returns Decoded token payload
   * @throws Error if token is invalid or expired
   */
  verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      const decoded = jwt.verify(token, config.JWT_REFRESH_SECRET, {
        algorithms: ['HS256'],
      }) as RefreshTokenPayload;

      // Verify token type
      if (decoded.type !== 'refresh') {
        throw new Error('INVALID_TOKEN_TYPE');
      }

      return decoded;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('TOKEN_EXPIRED');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new Error('INVALID_TOKEN');
      }
      throw error;
    }
  }
}

// Export singleton instance
export const jwtService = new JwtService();
```

### 11.3 New File: Password Service

**File:** `src/infrastructure/auth/passwordService.ts`

```typescript
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * Password Service
 * Handles password hashing, comparison, and validation
 */
export class PasswordService {
  /**
   * Hash a plain text password
   * @param plainPassword - Plain text password
   * @returns Hashed password
   */
  async hashPassword(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, SALT_ROUNDS);
  }

  /**
   * Compare plain text password with hash
   * @param plainPassword - Plain text password
   * @param hash - Bcrypt hash
   * @returns True if passwords match, false otherwise
   */
  async comparePassword(plainPassword: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hash);
  }

  /**
   * Validate password meets requirements
   * @param password - Password to validate
   * @throws Error if password doesn't meet requirements
   */
  validatePasswordRequirements(password: string): void {
    if (!password || password.length < 8) {
      throw new Error('PASSWORD_TOO_SHORT');
    }

    if (!/[A-Z]/.test(password)) {
      throw new Error('PASSWORD_MISSING_UPPERCASE');
    }

    if (!/[a-z]/.test(password)) {
      throw new Error('PASSWORD_MISSING_LOWERCASE');
    }

    if (!/[0-9]/.test(password)) {
      throw new Error('PASSWORD_MISSING_NUMBER');
    }
  }

  /**
   * Get user-friendly error message for password validation errors
   * @param error - Error code
   * @returns User-friendly message
   */
  getPasswordErrorMessage(error: string): string {
    const messages: Record<string, string> = {
      PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
      PASSWORD_MISSING_UPPERCASE: 'Password must contain at least one uppercase letter',
      PASSWORD_MISSING_LOWERCASE: 'Password must contain at least one lowercase letter',
      PASSWORD_MISSING_NUMBER: 'Password must contain at least one number',
    };

    return messages[error] || 'Invalid password';
  }
}

// Export singleton instance
export const passwordService = new PasswordService();
```

### 11.4 Update Environment Configuration

**File:** `src/config/env.ts`

Replace the entire schema with:

```typescript
import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // AWS General (keep for S3)
  AWS_REGION: z.string().min(1),
  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),

  // AWS S3
  AWS_S3_BUCKET_NAME: z.string().min(1),

  // JWT Authentication (NEW)
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRATION: z.string().regex(/^\d+$/).default('3600'),
  JWT_REFRESH_EXPIRATION: z.string().regex(/^\d+$/).default('2592000'),

  // Invoice Generator
  INVOICE_GENERATOR_API_KEY: z.string().min(1),
  INVOICE_GENERATOR_API_URL: z.string().url(),

  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z
    .string()
    .regex(/^\d+$/)
    .default('3000')
    .transform(Number),
  CORS_ORIGIN: z.string().url(),

  // Rate Limiting
  RATE_LIMIT_MAX: z
    .string()
    .regex(/^\d+$/)
    .default('100')
    .transform(Number),
  RATE_LIMIT_WINDOW_MS: z
    .string()
    .regex(/^\d+$/)
    .default('60000')
    .transform(Number),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

export type Config = z.infer<typeof envSchema>;

let parsedConfig: Config;

export const validateEnv = (): void => {
  try {
    parsedConfig = envSchema.parse(process.env);
    console.log('✅ Environment variables validated successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.issues.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
};

export const config: Config = new Proxy({} as Config, {
  get(_target, prop: string) {
    if (!parsedConfig) {
      throw new Error('Config not initialized. Call validateEnv() first.');
    }
    return parsedConfig[prop as keyof Config];
  },
});
```

### 11.5 Update User Domain Entity

**File:** `src/domain/user/User.ts`

Replace entire file with:

```typescript
/**
 * User Domain Entity
 * Represents a user in the invoice system
 */
export class User {
  private passwordHash?: string;

  private constructor(
    public readonly id: string,
    public email: string,
    public name: string,
    public readonly createdAt: Date,
    public updatedAt: Date,
    passwordHash?: string
  ) {
    this.passwordHash = passwordHash;
  }

  /**
   * Factory method to create a new User with validation
   */
  static create(props: {
    id: string;
    email: string;
    name: string;
    createdAt?: Date;
    updatedAt?: Date;
    passwordHash?: string;
  }): User {
    // Validate email format
    if (!props.email || !User.isValidEmail(props.email)) {
      throw new Error('INVALID_EMAIL_FORMAT');
    }

    // Validate name
    if (!props.name || props.name.trim().length === 0) {
      throw new Error('NAME_REQUIRED');
    }

    if (props.name.length > 255) {
      throw new Error('NAME_TOO_LONG');
    }

    // Validate UUID format for id
    if (!User.isValidUUID(props.id)) {
      throw new Error('INVALID_USER_ID');
    }

    const now = new Date();
    return new User(
      props.id,
      props.email,
      props.name.trim(),
      props.createdAt || now,
      props.updatedAt || now,
      props.passwordHash
    );
  }

  /**
   * Factory method to create a new User with password
   */
  static createWithPassword(props: {
    id: string;
    email: string;
    name: string;
    passwordHash: string;
  }): User {
    if (!props.passwordHash) {
      throw new Error('PASSWORD_HASH_REQUIRED');
    }

    return User.create({
      ...props,
      passwordHash: props.passwordHash,
    });
  }

  /**
   * Update user's name with validation
   */
  updateName(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new Error('NAME_REQUIRED');
    }

    if (newName.length > 255) {
      throw new Error('NAME_TOO_LONG');
    }

    this.name = newName.trim();
    this.updatedAt = new Date();
  }

  /**
   * Update user's email with validation
   */
  updateEmail(newEmail: string): void {
    if (!User.isValidEmail(newEmail)) {
      throw new Error('INVALID_EMAIL_FORMAT');
    }

    this.email = newEmail;
    this.updatedAt = new Date();
  }

  /**
   * Set password hash
   */
  setPasswordHash(hash: string): void {
    if (!hash) {
      throw new Error('PASSWORD_HASH_REQUIRED');
    }
    this.passwordHash = hash;
    this.updatedAt = new Date();
  }

  /**
   * Get password hash (for authentication)
   */
  getPasswordHash(): string | undefined {
    return this.passwordHash;
  }

  /**
   * Convert to plain object for serialization
   * Note: passwordHash is NOT included in JSON output for security
   */
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Validate email format
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate UUID format
   */
  private static isValidUUID(id: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }
}
```

### 11.6 Update User Repository

**File:** `src/infrastructure/database/UserRepository.ts`

Replace entire file with:

```typescript
import { Pool } from 'pg';
import { User } from '../../domain/user/User';
import { pool } from '../database';

/**
 * User Repository
 * Handles persistence operations for User domain entities
 */
export class UserRepository {
  constructor(private db: Pool) {}

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    try {
      const result = await this.db.query(
        'SELECT id, email, name, created_at, updated_at FROM users WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return this.toDomain(result.rows[0]);
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw new Error('DATABASE_ERROR');
    }
  }

  /**
   * Find user by email (without password)
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      const result = await this.db.query(
        'SELECT id, email, name, created_at, updated_at FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return this.toDomain(result.rows[0]);
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw new Error('DATABASE_ERROR');
    }
  }

  /**
   * Find user by email with password hash (for authentication)
   */
  async findByEmailWithPassword(email: string): Promise<User | null> {
    try {
      const result = await this.db.query(
        'SELECT id, email, name, password_hash, created_at, updated_at FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return this.toDomainWithPassword(result.rows[0]);
    } catch (error) {
      console.error('Error finding user by email with password:', error);
      throw new Error('DATABASE_ERROR');
    }
  }

  /**
   * Save user (insert or update)
   */
  async save(user: User): Promise<User> {
    try {
      const passwordHash = user.getPasswordHash();
      
      const result = await this.db.query(
        `INSERT INTO users (id, email, name, password_hash, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE
         SET email = $2, name = $3, password_hash = $4, updated_at = $6
         RETURNING id, email, name, created_at, updated_at`,
        [user.id, user.email, user.name, passwordHash, user.createdAt, user.updatedAt]
      );

      return this.toDomain(result.rows[0]);
    } catch (error: any) {
      console.error('Error saving user:', error);
      
      // Handle duplicate email constraint
      if (error.code === '23505' && error.constraint === 'users_email_key') {
        throw new Error('DUPLICATE_EMAIL');
      }
      
      throw new Error('DATABASE_ERROR');
    }
  }

  /**
   * Delete user by ID (hard delete)
   */
  async delete(id: string): Promise<void> {
    try {
      await this.db.query('DELETE FROM users WHERE id = $1', [id]);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('DATABASE_ERROR');
    }
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    try {
      const result = await this.db.query(
        'SELECT 1 FROM users WHERE email = $1',
        [email]
      );
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error checking email existence:', error);
      throw new Error('DATABASE_ERROR');
    }
  }

  /**
   * Convert database row to User domain entity (without password)
   */
  private toDomain(row: any): User {
    return User.create({
      id: row.id,
      email: row.email,
      name: row.name,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  /**
   * Convert database row to User domain entity (with password)
   */
  private toDomainWithPassword(row: any): User {
    return User.create({
      id: row.id,
      email: row.email,
      name: row.name,
      passwordHash: row.password_hash,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }
}

// Export lazy singleton instance
let userRepositoryInstance: UserRepository | null = null;
export const userRepository = (): UserRepository => {
  if (!userRepositoryInstance) {
    userRepositoryInstance = new UserRepository(pool());
  }
  return userRepositoryInstance;
};
```

### 11.7 Update Register Handler

**File:** `src/features/auth/register.ts`

Replace entire file with:

```typescript
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../domain/user/User';
import { userRepository } from '../../infrastructure/database/UserRepository';
import { passwordService } from '../../infrastructure/auth/passwordService';
import { jwtService } from '../../infrastructure/auth/jwtService';

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: SecurePass123
 *                 description: Must contain at least 8 characters with uppercase, lowercase, and number
 *               name:
 *                 type: string
 *                 example: John Doe
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       400:
 *         description: Invalid input
 *       409:
 *         description: User already exists
 *       500:
 *         description: Server error
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name }: RegisterRequest = req.body;

    // Validate input
    if (!email || !password || !name) {
      res.status(400).json({
        error: 'INVALID_INPUT',
        message: 'Email, password, and name are required',
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        error: 'INVALID_EMAIL',
        message: 'Invalid email format',
      });
      return;
    }

    // Validate password requirements
    try {
      passwordService.validatePasswordRequirements(password);
    } catch (error: any) {
      res.status(400).json({
        error: error.message,
        message: passwordService.getPasswordErrorMessage(error.message),
      });
      return;
    }

    // Check if user already exists
    const existingUser = await userRepository().findByEmail(email);
    if (existingUser) {
      res.status(409).json({
        error: 'DUPLICATE_EMAIL',
        message: 'User with this email already exists',
      });
      return;
    }

    // Hash password
    const passwordHash = await passwordService.hashPassword(password);

    // Generate UUID for new user
    const userId = uuidv4();

    // Create user domain entity
    const user = User.createWithPassword({
      id: userId,
      email,
      name,
      passwordHash,
    });

    // Save to database
    try {
      await userRepository().save(user);
    } catch (error: any) {
      console.error('Database save error:', error);

      if (error.message === 'DUPLICATE_EMAIL') {
        res.status(409).json({
          error: 'DUPLICATE_EMAIL',
          message: 'User with this email already exists',
        });
        return;
      }

      res.status(500).json({
        error: 'DATABASE_ERROR',
        message: 'Failed to create user record',
      });
      return;
    }

    // Generate JWT tokens
    const accessToken = jwtService.generateAccessToken(userId, email);
    const refreshToken = jwtService.generateRefreshToken(userId);

    // Set httpOnly cookies
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

    res.status(201).json({
      user: user.toJSON(),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    });
  }
};
```

### 11.8 Update Login Handler

**File:** `src/features/auth/login.ts`

Replace entire file with:

```typescript
import { Request, Response } from 'express';
import { userRepository } from '../../infrastructure/database/UserRepository';
import { passwordService } from '../../infrastructure/auth/passwordService';
import { jwtService } from '../../infrastructure/auth/jwtService';

interface LoginRequest {
  email: string;
  password: string;
}

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePass123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 expiresIn:
 *                   type: number
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginRequest = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({
        error: 'INVALID_INPUT',
        message: 'Email and password are required',
      });
      return;
    }

    // Fetch user with password hash
    const user = await userRepository().findByEmailWithPassword(email);
    
    if (!user) {
      res.status(401).json({
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
      return;
    }

    // Get password hash
    const passwordHash = user.getPasswordHash();
    if (!passwordHash) {
      console.error('User found but no password hash:', email);
      res.status(500).json({
        error: 'AUTHENTICATION_ERROR',
        message: 'Failed to authenticate',
      });
      return;
    }

    // Verify password
    const isPasswordValid = await passwordService.comparePassword(password, passwordHash);
    
    if (!isPasswordValid) {
      res.status(401).json({
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
      return;
    }

    // Generate JWT tokens
    const accessToken = jwtService.generateAccessToken(user.id, user.email);
    const refreshToken = jwtService.generateRefreshToken(user.id);

    // Set httpOnly cookies for token storage
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

    res.json({
      user: user.toJSON(),
      accessToken,
      refreshToken,
      expiresIn: 3600,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    });
  }
};
```

### 11.9 Update Logout Handler

**File:** `src/features/auth/logout.ts`

Replace entire file with:

```typescript
import { Request, Response } from 'express';

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       500:
 *         description: Server error
 */
export const logout = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Clear httpOnly cookies
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.json({
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    });
  }
};
```

### 11.10 Update Refresh Token Handler

**File:** `src/features/auth/refresh.ts`

Replace entire file with:

```typescript
import { Request, Response } from 'express';
import { userRepository } from '../../infrastructure/database/UserRepository';
import { jwtService } from '../../infrastructure/auth/jwtService';

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     security: []
 *     description: Uses refresh token from cookie to generate new access token
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *       401:
 *         description: Invalid or expired refresh token
 *       500:
 *         description: Server error
 */
export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract refresh token from cookie
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      res.status(401).json({
        error: 'REFRESH_TOKEN_REQUIRED',
        message: 'Refresh token is required',
      });
      return;
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwtService.verifyRefreshToken(refreshToken);
    } catch (error: any) {
      console.error('Refresh token verification error:', error);
      
      // Clear invalid token
      res.clearCookie('refreshToken');
      
      res.status(401).json({
        error: error.message || 'INVALID_REFRESH_TOKEN',
        message: 'Invalid or expired refresh token',
      });
      return;
    }

    // Fetch user to ensure they still exist
    const user = await userRepository().findById(decoded.sub);
    
    if (!user) {
      res.clearCookie('refreshToken');
      res.status(401).json({
        error: 'USER_NOT_FOUND',
        message: 'User not found',
      });
      return;
    }

    // Generate new access token
    const newAccessToken = jwtService.generateAccessToken(user.id, user.email);

    // Optional: Rotate refresh token for better security
    const newRefreshToken = jwtService.generateRefreshToken(user.id);

    // Set new tokens in cookies
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000, // 1 hour
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 2592000000, // 30 days
    });

    res.json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    });
  }
};
```

### 11.11 Update Auth Middleware

**File:** `src/shared/middleware/auth.ts`

Replace entire file with:

```typescript
import { Request, Response, NextFunction } from 'express';
import { jwtService } from '../../infrastructure/auth/jwtService';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header or cookie
    let token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      res.status(401).json({ 
        error: 'AUTH_REQUIRED', 
        message: 'Authentication required' 
      });
      return;
    }

    // Verify JWT token
    try {
      const payload = jwtService.verifyAccessToken(token);

      // Extract user information from token claims
      req.user = {
        id: payload.sub,
        email: payload.email,
      };

      next();
    } catch (error: any) {
      console.error('Token verification error:', error.message);
      
      res.status(401).json({ 
        error: error.message || 'INVALID_TOKEN', 
        message: 'Invalid or expired token' 
      });
      return;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      error: 'INTERNAL_ERROR', 
      message: 'Authentication error' 
    });
  }
};

/**
 * Optional auth middleware - does not fail if no token provided
 * Used for endpoints that can work with or without auth
 */
export const optionalAuthMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      try {
        const payload = jwtService.verifyAccessToken(token);
        req.user = {
          id: payload.sub,
          email: payload.email,
        };
      } catch (error) {
        // Token invalid but don't fail - just continue without user
        console.log('Optional auth: invalid token, continuing without user');
      }
    }

    next();
  } catch (error) {
    // Don't fail, just continue without user
    next();
  }
};
```

### 11.12 Update Frontend Router

**File:** `invoice-frontend/src/router/index.ts`

Replace lines 72-108 with:

```typescript
// Navigation guards
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();

  // Initialize auth state if not already done
  if (!authStore.user && localStorage.getItem('accessToken')) {
    try {
      await authStore.fetchUser();
    } catch (error) {
      // Failed to fetch user, continue to route
      console.error('Failed to initialize auth:', error);
    }
  }

  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Redirect to login if not authenticated
    next({ name: 'Login', query: { redirect: to.fullPath } });
    return;
  }

  // Check if route requires guest (only for non-authenticated users)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    // Redirect to dashboard if already authenticated
    next({ name: 'Dashboard' });
    return;
  }

  next();
});
```

### 11.13 Environment Variables

**Create/Update `.env` file:**

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/invoicedb

# AWS (for S3 only)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET_NAME=your-invoice-bucket

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-characters-long-change-in-prod
JWT_ACCESS_EXPIRATION=3600
JWT_REFRESH_EXPIRATION=2592000

# Invoice Generator
INVOICE_GENERATOR_API_KEY=your-api-key
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

**Generate secure secrets:**

```bash
# Generate JWT secrets (run in terminal)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Run twice, use first output for JWT_SECRET, second for JWT_REFRESH_SECRET
```

### 11.14 Package.json Changes

**Add dependencies:**

```bash
npm install bcrypt@^5.1.1 jsonwebtoken@^9.0.2 uuid@^9.0.1
npm install --save-dev @types/bcrypt @types/jsonwebtoken @types/uuid
```

**Remove dependencies:**

```bash
npm uninstall @aws-sdk/client-cognito-identity-provider aws-jwt-verify
```

### 11.15 Implementation Commands

**Step-by-step execution:**

```bash
# 1. Create timestamp for migration
TIMESTAMP=$(node -e "console.log(Date.now())")
echo "Migration file: migrations/${TIMESTAMP}_add-password-to-users.js"

# 2. Install new dependencies
npm install bcrypt@^5.1.1 jsonwebtoken@^9.0.2 uuid@^9.0.1
npm install --save-dev @types/bcrypt @types/jsonwebtoken @types/uuid

# 3. Remove old dependencies
npm uninstall @aws-sdk/client-cognito-identity-provider aws-jwt-verify

# 4. Create new auth directory
mkdir -p src/infrastructure/auth

# 5. Run migration
npm run migrate up

# 6. Generate JWT secrets
echo "JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"
echo "JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"

# 7. Update .env with new values (manually)

# 8. Run tests
npm test

# 9. Start backend
npm run dev

# 10. Start frontend (in separate terminal)
cd invoice-frontend && npm run dev
```

### 11.16 Testing Checklist

After implementation, test the following:

**Manual Testing:**
```bash
# 1. Register new user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123","name":"Test User"}'

# 2. Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}' \
  -c cookies.txt

# 3. Access protected route
curl -X GET http://localhost:3000/api/v1/auth/me \
  -b cookies.txt

# 4. Refresh token
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -b cookies.txt

# 5. Logout
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -b cookies.txt
```

**Frontend Testing:**
1. Navigate to http://localhost:5173
2. Should redirect to /login
3. Try registering new account
4. Verify redirect to dashboard after registration
5. Logout
6. Login with same credentials
7. Verify redirect to dashboard
8. Refresh page - should stay logged in
9. Open browser DevTools, check cookies for accessToken
10. Navigate to /customers - should work
11. Logout - should redirect to login

---

## End of PRD

