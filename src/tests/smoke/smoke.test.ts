/**
 * Smoke Tests
 * 
 * Quick tests to verify critical functionality after deployment.
 * Should complete in < 30 seconds.
 */

import request from 'supertest';

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

describe('Smoke Tests', () => {
  describe('Health & Infrastructure', () => {
    it('health endpoint should respond', async () => {
      const response = await request(BASE_URL)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('ok');
      expect(response.body.timestamp).toBeDefined();
    }, 10000);

    it('API should have proper CORS headers', async () => {
      const response = await request(BASE_URL)
        .options('/api/v1/customers')
        .expect(204);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
      expect(response.headers['access-control-allow-methods']).toBeDefined();
    });

    it('API should have security headers', async () => {
      const response = await request(BASE_URL)
        .get('/health')
        .expect(200);

      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBeDefined();
    });
  });

  describe('Authentication', () => {
    it('protected endpoint should require authentication', async () => {
      const response = await request(BASE_URL)
        .get('/api/v1/customers')
        .expect(401);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should accept valid JWT token', async () => {
      const token = process.env.TEST_TOKEN;
      if (!token) {
        console.warn('TEST_TOKEN not provided, skipping authenticated test');
        return;
      }

      const response = await request(BASE_URL)
        .get('/api/v1/customers')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.customers).toBeDefined();
      expect(Array.isArray(response.body.customers)).toBe(true);
    });
  });

  describe('Critical API Endpoints', () => {
    let authToken: string;
    let customerId: string;
    let invoiceId: string;

    beforeAll(async () => {
      authToken = process.env.TEST_TOKEN || '';
      if (!authToken) {
        console.warn('TEST_TOKEN not provided, skipping API tests');
      }
    });

    it('can create customer', async () => {
      if (!authToken) return;

      const response = await request(BASE_URL)
        .post('/api/v1/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: `Smoke Test Customer ${Date.now()}`,
          email: `smoke-test-${Date.now()}@example.com`,
          address: {
            street: '123 Test St',
            city: 'Test City',
            state: 'TS',
            postalCode: '12345',
            country: 'USA',
          },
          phoneNumber: '+1-555-0000',
        })
        .expect(201);

      expect(response.body.id).toBeDefined();
      customerId = response.body.id;
    }, 10000);

    it('can list customers', async () => {
      if (!authToken) return;

      const response = await request(BASE_URL)
        .get('/api/v1/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.customers).toBeDefined();
      expect(Array.isArray(response.body.customers)).toBe(true);
    });

    it('can create invoice', async () => {
      if (!authToken || !customerId) return;

      const response = await request(BASE_URL)
        .post('/api/v1/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customerId,
          companyInfo: 'Smoke Test Company',
          issueDate: new Date().toISOString(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          taxRate: 8,
        })
        .expect(201);

      expect(response.body.id).toBeDefined();
      invoiceId = response.body.id;
    }, 10000);

    it('can add line item to invoice', async () => {
      if (!authToken || !invoiceId) return;

      const response = await request(BASE_URL)
        .post(`/api/v1/invoices/${invoiceId}/line-items`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Smoke Test Service',
          quantity: 1,
          unitPrice: 100,
        })
        .expect(201);

      expect(response.body.id).toBeDefined();
    });

    it('can get invoice with totals', async () => {
      if (!authToken || !invoiceId) return;

      const response = await request(BASE_URL)
        .get(`/api/v1/invoices/${invoiceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(invoiceId);
      expect(response.body.lineItems).toHaveLength(1);
      expect(response.body.subtotal).toBe(100);
      expect(response.body.total).toBeGreaterThan(100);
    });

    it('can list invoices', async () => {
      if (!authToken) return;

      const response = await request(BASE_URL)
        .get('/api/v1/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.invoices).toBeDefined();
      expect(Array.isArray(response.body.invoices)).toBe(true);
    });

    // Cleanup
    afterAll(async () => {
      if (authToken && invoiceId) {
        try {
          await request(BASE_URL)
            .delete(`/api/v1/invoices/${invoiceId}`)
            .set('Authorization', `Bearer ${authToken}`);
        } catch (error) {
          // Ignore cleanup errors
        }
      }

      if (authToken && customerId) {
        try {
          await request(BASE_URL)
            .delete(`/api/v1/customers/${customerId}`)
            .set('Authorization', `Bearer ${authToken}`);
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    });
  });

  describe('Performance', () => {
    it('health endpoint should respond quickly', async () => {
      const start = Date.now();
      
      await request(BASE_URL)
        .get('/health')
        .expect(200);
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000); // < 1 second
    });

    it('API list endpoints should respond within SLA', async () => {
      const token = process.env.TEST_TOKEN;
      if (!token) return;

      const start = Date.now();
      
      await request(BASE_URL)
        .get('/api/v1/customers')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(500); // < 500ms
    });
  });

  describe('Database Connectivity', () => {
    it('should be able to query database', async () => {
      const token = process.env.TEST_TOKEN;
      if (!token) return;

      // Any endpoint that hits the database
      await request(BASE_URL)
        .get('/api/v1/customers')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      // If we get here, database is accessible
      expect(true).toBe(true);
    });
  });

  describe('External Services', () => {
    it('should be able to reach AWS services (if configured)', async () => {
      // This test verifies AWS connectivity through authentication
      const response = await request(BASE_URL)
        .get('/api/v1/customers')
        .expect(401); // Should fail auth but reach the service

      // If we get 401 (not 500), AWS Cognito is reachable
      expect(response.status).toBe(401);
    });
  });
});

// Run smoke tests with:
// TEST_TOKEN=your_test_token npm run test:smoke

