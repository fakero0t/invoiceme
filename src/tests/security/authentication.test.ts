import request from 'supertest';
import app from '../../index';

describe('Authentication Security Tests', () => {
  describe('JWT Token Validation', () => {
    it('should reject requests without Authorization header', async () => {
      const response = await request(app)
        .get('/api/v1/customers')
        .expect(401);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe('UNAUTHORIZED');
      expect(response.body.error.message).toContain('token');
    });

    it('should reject requests with malformed Authorization header', async () => {
      const response = await request(app)
        .get('/api/v1/customers')
        .set('Authorization', 'InvalidFormat')
        .expect(401);

      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject requests with invalid JWT token', async () => {
      const response = await request(app)
        .get('/api/v1/customers')
        .set('Authorization', 'Bearer invalid.jwt.token')
        .expect(401);

      expect(response.body.error.code).toBe('INVALID_TOKEN');
    });

    it('should reject expired JWT tokens', async () => {
      // Generate an expired token (you'll need a helper function)
      const expiredToken = generateExpiredToken();

      const response = await request(app)
        .get('/api/v1/customers')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.error.code).toBe('TOKEN_EXPIRED');
    });

    it('should reject tokens with invalid signature', async () => {
      const tamperedToken = generateTamperedToken();

      const response = await request(app)
        .get('/api/v1/customers')
        .set('Authorization', `Bearer ${tamperedToken}`)
        .expect(401);

      expect(response.body.error.code).toBe('INVALID_TOKEN');
    });

    it('should accept valid JWT tokens', async () => {
      const validToken = await getValidTestToken();

      const response = await request(app)
        .get('/api/v1/customers')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
    });
  });

  describe('Protected Endpoints', () => {
    const protectedEndpoints = [
      { method: 'get', path: '/api/v1/customers' },
      { method: 'post', path: '/api/v1/customers' },
      { method: 'get', path: '/api/v1/customers/123e4567-e89b-12d3-a456-426614174000' },
      { method: 'put', path: '/api/v1/customers/123e4567-e89b-12d3-a456-426614174000' },
      { method: 'delete', path: '/api/v1/customers/123e4567-e89b-12d3-a456-426614174000' },
      { method: 'get', path: '/api/v1/invoices' },
      { method: 'post', path: '/api/v1/invoices' },
      { method: 'get', path: '/api/v1/invoices/123e4567-e89b-12d3-a456-426614174000' },
      { method: 'post', path: '/api/v1/payments' },
      { method: 'get', path: '/api/v1/payments' },
    ];

    protectedEndpoints.forEach(({ method, path }) => {
      it(`should protect ${method.toUpperCase()} ${path}`, async () => {
        const response = await request(app)[method](path).expect(401);
        expect(response.body.error.code).toBe('UNAUTHORIZED');
      });
    });
  });

  describe('Token Refresh', () => {
    it('should allow token refresh with valid refresh token', async () => {
      const { accessToken, refreshToken } = await getValidTokenPair();

      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
      expect(response.body.accessToken).not.toBe(accessToken);
    });

    it('should reject invalid refresh tokens', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid-refresh-token' })
        .expect(401);

      expect(response.body.error.code).toBe('INVALID_REFRESH_TOKEN');
    });

    it('should reject expired refresh tokens', async () => {
      const expiredRefreshToken = generateExpiredRefreshToken();

      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: expiredRefreshToken })
        .expect(401);

      expect(response.body.error.code).toBe('REFRESH_TOKEN_EXPIRED');
    });
  });

  describe('Rate Limiting', () => {
    it('should rate limit authentication attempts', async () => {
      const loginAttempts = [];

      // Make 10 rapid login attempts
      for (let i = 0; i < 10; i++) {
        loginAttempts.push(
          request(app)
            .post('/api/v1/auth/login')
            .send({
              email: 'test@example.com',
              password: 'wrongpassword',
            })
        );
      }

      const responses = await Promise.all(loginAttempts);

      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter((r) => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    }, 10000);
  });
});

// Helper functions
function generateExpiredToken(): string {
  // Implementation: Generate a JWT with exp claim in the past
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidXNlcklkIjoidGVzdC11c2VyIiwiZXhwIjoxNTE2MjM5MDIyfQ.invalid';
}

function generateTamperedToken(): string {
  // Implementation: Generate a JWT with modified payload but original signature
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tampered_payload.original_signature';
}

function generateExpiredRefreshToken(): string {
  return 'expired_refresh_token';
}

async function getValidTestToken(): Promise<string> {
  // Implementation: Return a valid test token
  // This would typically involve calling your auth service
  return 'valid_test_token';
}

async function getValidTokenPair(): Promise<{ accessToken: string; refreshToken: string }> {
  return {
    accessToken: 'valid_access_token',
    refreshToken: 'valid_refresh_token',
  };
}

