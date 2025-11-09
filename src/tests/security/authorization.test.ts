import request from 'supertest';
import app from '../../index';
import { container } from 'tsyringe';
import { CreateCustomerCommandHandler } from '../../application/commands/customers/CreateCustomer/CreateCustomerCommandHandler';
import { CreateInvoiceCommandHandler } from '../../application/commands/invoices/CreateInvoice/CreateInvoiceCommandHandler';

describe('Authorization Security Tests', () => {
  describe('Cross-User Access Prevention', () => {
    let user1Token: string;
    let user2Token: string;
    let user1CustomerId: string;
    let user1InvoiceId: string;

    beforeAll(async () => {
      // Get tokens for two different users
      user1Token = await getTokenForUser('user1');
      user2Token = await getTokenForUser('user2');

      // Create resources for user1
      const createCustomerHandler = container.resolve(CreateCustomerCommandHandler);
      user1CustomerId = await createCustomerHandler.handle({
        userId: 'user1',
        name: 'User1 Customer',
        email: 'user1customer@example.com',
        address: {
          street: '123 Main St',
          city: 'Springfield',
          state: 'IL',
          postalCode: '62701',
          country: 'USA',
        },
        phoneNumber: '+1-555-1111',
      });

      const createInvoiceHandler = container.resolve(CreateInvoiceCommandHandler);
      user1InvoiceId = await createInvoiceHandler.handle({
        userId: 'user1',
        customerId: user1CustomerId,
        companyInfo: 'User1 Company',
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        taxRate: 8,
      });
    });

    describe('Customer Access Control', () => {
      it('should prevent user2 from accessing user1 customer', async () => {
        const response = await request(app)
          .get(`/api/v1/customers/${user1CustomerId}`)
          .set('Authorization', `Bearer ${user2Token}`)
          .expect(404); // Or 403 depending on your implementation

        expect(response.body.error).toBeDefined();
      });

      it('should prevent user2 from updating user1 customer', async () => {
        const response = await request(app)
          .put(`/api/v1/customers/${user1CustomerId}`)
          .set('Authorization', `Bearer ${user2Token}`)
          .send({
            name: 'Updated Name',
            email: 'updated@example.com',
            address: {
              street: '456 Oak Ave',
              city: 'Chicago',
              state: 'IL',
              postalCode: '60601',
              country: 'USA',
            },
            phoneNumber: '+1-555-2222',
          })
          .expect(404);

        expect(response.body.error).toBeDefined();
      });

      it('should prevent user2 from deleting user1 customer', async () => {
        const response = await request(app)
          .delete(`/api/v1/customers/${user1CustomerId}`)
          .set('Authorization', `Bearer ${user2Token}`)
          .expect(404);

        expect(response.body.error).toBeDefined();
      });

      it('should allow user1 to access their own customer', async () => {
        const response = await request(app)
          .get(`/api/v1/customers/${user1CustomerId}`)
          .set('Authorization', `Bearer ${user1Token}`)
          .expect(200);

        expect(response.body.id).toBe(user1CustomerId);
      });

      it('should not include user1 customers in user2 list', async () => {
        const response = await request(app)
          .get('/api/v1/customers')
          .set('Authorization', `Bearer ${user2Token}`)
          .expect(200);

        const customerIds = response.body.customers.map((c: any) => c.id);
        expect(customerIds).not.toContain(user1CustomerId);
      });
    });

    describe('Invoice Access Control', () => {
      it('should prevent user2 from accessing user1 invoice', async () => {
        const response = await request(app)
          .get(`/api/v1/invoices/${user1InvoiceId}`)
          .set('Authorization', `Bearer ${user2Token}`)
          .expect(404);

        expect(response.body.error).toBeDefined();
      });

      it('should prevent user2 from updating user1 invoice', async () => {
        const response = await request(app)
          .put(`/api/v1/invoices/${user1InvoiceId}`)
          .set('Authorization', `Bearer ${user2Token}`)
          .send({
            notes: 'Updated notes',
          })
          .expect(404);

        expect(response.body.error).toBeDefined();
      });

      it('should prevent user2 from adding line items to user1 invoice', async () => {
        const response = await request(app)
          .post(`/api/v1/invoices/${user1InvoiceId}/line-items`)
          .set('Authorization', `Bearer ${user2Token}`)
          .send({
            description: 'Unauthorized line item',
            quantity: 1,
            unitPrice: 100,
          })
          .expect(404);

        expect(response.body.error).toBeDefined();
      });

      it('should prevent user2 from marking user1 invoice as sent', async () => {
        const response = await request(app)
          .post(`/api/v1/invoices/${user1InvoiceId}/mark-sent`)
          .set('Authorization', `Bearer ${user2Token}`)
          .expect(404);

        expect(response.body.error).toBeDefined();
      });

      it('should allow user1 to access their own invoice', async () => {
        const response = await request(app)
          .get(`/api/v1/invoices/${user1InvoiceId}`)
          .set('Authorization', `Bearer ${user1Token}`)
          .expect(200);

        expect(response.body.id).toBe(user1InvoiceId);
      });

      it('should not include user1 invoices in user2 list', async () => {
        const response = await request(app)
          .get('/api/v1/invoices')
          .set('Authorization', `Bearer ${user2Token}`)
          .expect(200);

        const invoiceIds = response.body.invoices.map((i: any) => i.id);
        expect(invoiceIds).not.toContain(user1InvoiceId);
      });
    });

    describe('Payment Access Control', () => {
      let user1PaymentId: string;

      beforeAll(async () => {
        // Create a payment for user1 invoice
        const response = await request(app)
          .post('/api/v1/payments')
          .set('Authorization', `Bearer ${user1Token}`)
          .send({
            invoiceId: user1InvoiceId,
            amount: 100,
            paymentMethod: 'CreditCard',
            paymentDate: new Date().toISOString(),
          })
          .expect(201);

        user1PaymentId = response.body.id;
      });

      it('should prevent user2 from viewing user1 payments', async () => {
        const response = await request(app)
          .get(`/api/v1/payments?invoiceId=${user1InvoiceId}`)
          .set('Authorization', `Bearer ${user2Token}`)
          .expect(200);

        // Should return empty array, not user1's payments
        expect(response.body.payments).toEqual([]);
      });

      it('should prevent user2 from creating payments on user1 invoice', async () => {
        const response = await request(app)
          .post('/api/v1/payments')
          .set('Authorization', `Bearer ${user2Token}`)
          .send({
            invoiceId: user1InvoiceId,
            amount: 50,
            paymentMethod: 'Check',
            paymentDate: new Date().toISOString(),
          })
          .expect(404);

        expect(response.body.error).toBeDefined();
      });

      it('should allow user1 to view their own payments', async () => {
        const response = await request(app)
          .get(`/api/v1/payments?invoiceId=${user1InvoiceId}`)
          .set('Authorization', `Bearer ${user1Token}`)
          .expect(200);

        expect(response.body.payments).toHaveLength(1);
        expect(response.body.payments[0].id).toBe(user1PaymentId);
      });
    });
  });

  describe('SQL Injection Prevention', () => {
    it('should safely handle SQL injection in customer email', async () => {
      const token = await getTokenForUser('test-user');

      const response = await request(app)
        .post('/api/v1/customers')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Customer',
          email: "'; DROP TABLE customers; --",
          address: {
            street: '123 Main St',
            city: 'Springfield',
            state: 'IL',
            postalCode: '62701',
            country: 'USA',
          },
          phoneNumber: '+1-555-1234',
        });

      // Should either reject or safely handle the malicious input
      // Not return 500 or cause database corruption
      expect([400, 422]).toContain(response.status);
    });

    it('should safely handle SQL injection in search queries', async () => {
      const token = await getTokenForUser('test-user');

      const response = await request(app)
        .get("/api/v1/customers?search=' OR '1'='1")
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Should return normal results, not all customers
      expect(response.body.customers).toBeDefined();
    });
  });

  describe('Input Validation', () => {
    it('should validate UUID formats', async () => {
      const token = await getTokenForUser('test-user');

      const response = await request(app)
        .get('/api/v1/customers/not-a-uuid')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(response.body.error.code).toBe('INVALID_UUID');
    });

    it('should validate required fields', async () => {
      const token = await getTokenForUser('test-user');

      const response = await request(app)
        .post('/api/v1/customers')
        .set('Authorization', `Bearer ${token}`)
        .send({
          // Missing required fields
          email: 'test@example.com',
        })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should validate field lengths', async () => {
      const token = await getTokenForUser('test-user');

      const response = await request(app)
        .post('/api/v1/customers')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'A'.repeat(300), // Too long
          email: 'test@example.com',
          address: {
            street: '123 Main St',
            city: 'Springfield',
            state: 'IL',
            postalCode: '62701',
            country: 'USA',
          },
          phoneNumber: '+1-555-1234',
        })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('XSS Prevention', () => {
    it('should sanitize customer name with script tags', async () => {
      const token = await getTokenForUser('test-user');

      const response = await request(app)
        .post('/api/v1/customers')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: '<script>alert("XSS")</script>',
          email: 'xss@example.com',
          address: {
            street: '123 Main St',
            city: 'Springfield',
            state: 'IL',
            postalCode: '62701',
            country: 'USA',
          },
          phoneNumber: '+1-555-1234',
        });

      if (response.status === 201) {
        // If accepted, verify it's stored safely (escaped or sanitized)
        const getResponse = await request(app)
          .get(`/api/v1/customers/${response.body.id}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(200);

        // Script tags should be escaped or removed
        expect(getResponse.body.name).not.toContain('<script>');
      } else {
        // Or it should be rejected
        expect(response.status).toBe(400);
      }
    });
  });
});

// Helper function
async function getTokenForUser(userId: string): Promise<string> {
  // Implementation: Return a valid test token for the specified user
  // This would typically involve your test auth setup
  return `test_token_for_${userId}`;
}

