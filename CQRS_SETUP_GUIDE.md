# CQRS Architecture Setup Guide

## Prerequisites

- Node.js v18+
- PostgreSQL database
- Existing invoice system database schema

## Installation

### 1. Install Dependencies

The required dependencies have been added to `package.json`:

```bash
npm install
```

New dependencies:
- `tsyringe` v4.8.0 - Dependency injection
- `reflect-metadata` v0.2.1 - Required for tsyringe

### 2. Environment Configuration

Add to your `.env` file:

```bash
# Feature flag to enable new CQRS architecture
USE_NEW_ARCHITECTURE=true

# Existing variables
DATABASE_URL=postgresql://user:password@localhost:5432/invoiceme
PORT=3000
NODE_ENV=development
```

## Development Workflow

### Testing New Architecture Locally

1. **Enable feature flag:**
   ```bash
   export USE_NEW_ARCHITECTURE=true
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **You should see:**
   ```
   🚀 Using new CQRS architecture
   🚀 Server running on http://localhost:3000
   ```

### Testing Legacy Architecture

1. **Disable feature flag:**
   ```bash
   export USE_NEW_ARCHITECTURE=false
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **You should see:**
   ```
   ⚙️  Using legacy architecture
   🚀 Server running on http://localhost:3000
   ```

## API Testing

All endpoints remain the same. Test with existing client applications or API tools:

### Example: Create Customer

```bash
curl -X POST http://localhost:3000/api/v1/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "postalCode": "10001",
      "country": "USA"
    },
    "phoneNumber": "+1-555-0100"
  }'
```

### Example: Create Invoice with Line Items

```bash
# 1. Create invoice
curl -X POST http://localhost:3000/api/v1/invoices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "customerId": "customer-id",
    "issueDate": "2024-01-01",
    "dueDate": "2024-02-01",
    "taxRate": 10
  }'

# 2. Add line item
curl -X POST http://localhost:3000/api/v1/invoices/{invoice-id}/line-items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "description": "Web Development Services",
    "quantity": 10,
    "unitPrice": 100
  }'

# 3. Mark as sent
curl -X POST http://localhost:3000/api/v1/invoices/{invoice-id}/mark-sent \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Example: Record Payment

```bash
curl -X POST http://localhost:3000/api/v1/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "invoiceId": "invoice-id",
    "amount": 500,
    "paymentMethod": "CreditCard",
    "paymentDate": "2024-01-15",
    "reference": "REF-001"
  }'
```

## Running Tests

### Setup Test Database

```bash
createdb invoiceme_test
```

### Run Integration Tests

```bash
# Run all tests
npm test

# Run specific test
npm test -- CreateCustomer.test.ts

# Run with coverage
npm run test:coverage
```

## Monitoring & Debugging

### Check Architecture Mode

Look for startup log:
- `🚀 Using new CQRS architecture` - New implementation active
- `⚙️  Using legacy architecture` - Old implementation active

### Error Format

All errors follow standardized format:

**Success Response:**
```json
{
  "success": true,
  "data": { "id": "customer-id" }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "CUSTOMER_NOT_FOUND",
    "message": "Customer not found"
  }
}
```

### Common Error Codes

**Customer Context:**
- `EMAIL_ALREADY_EXISTS` - Duplicate email
- `CUSTOMER_NOT_FOUND` - Customer doesn't exist

**Invoice Context:**
- `INVOICE_NOT_FOUND` - Invoice doesn't exist
- `CANNOT_MODIFY_NON_DRAFT_INVOICE` - State transition error
- `LINE_ITEM_NOT_FOUND` - Line item doesn't exist

**Payment Context:**
- `PAYMENT_EXCEEDS_BALANCE` - Payment amount too large
- `INVALID_STATE_TRANSITION` - Can't pay draft invoice

## Deployment

### Staging Deployment

1. **Deploy with feature flag disabled:**
   ```bash
   USE_NEW_ARCHITECTURE=false
   ```

2. **Run smoke tests**

3. **Enable feature flag:**
   ```bash
   USE_NEW_ARCHITECTURE=true
   ```

4. **Monitor logs and metrics**

5. **Run full test suite**

### Production Deployment

1. **Deploy with feature flag disabled**
2. **Monitor for 24 hours**
3. **Enable for 10% of traffic** (requires load balancer config)
4. **Gradually increase to 100%**
5. **Remove feature flag after stability period**

## Rollback Procedure

If issues are detected:

1. **Set environment variable:**
   ```bash
   USE_NEW_ARCHITECTURE=false
   ```

2. **Restart application:**
   ```bash
   pm2 restart invoice-api
   # or
   systemctl restart invoice-api
   ```

3. **Verify old implementation active:**
   - Check logs for "Using legacy architecture"
   - Test critical endpoints

4. **No database rollback needed** (same schema)

## Performance Considerations

### Transaction Overhead

New architecture uses transactions for all commands:
- Ensures data consistency
- Slight performance overhead (~5-10ms)
- Acceptable for invoice domain

### Event Processing

Events execute sequentially:
- Ensures consistent ordering
- May be slower than parallel execution
- Can be optimized later if needed

### Query Optimization

Queries load full aggregates:
- Simple for single entities
- May be slow for large lists
- Can be optimized with DTOs for list queries

## Troubleshooting

### Issue: tsyringe errors on startup

**Solution:** Ensure `reflect-metadata` is imported first in `src/index.ts`

```typescript
import 'reflect-metadata'; // Must be first!
import express from 'express';
```

### Issue: Database connection errors

**Solution:** Check pool configuration in `DependencyContainer.ts`

### Issue: Events not firing

**Solution:** Verify event bus is registered in DI container:
```typescript
container.registerSingleton<IEventBus>('IEventBus', InMemoryEventBus);
```

### Issue: Handlers not resolving

**Solution:** Check all dependencies are registered in `DependencyContainer.ts`

## Next Steps

1. **Complete test coverage** - Add tests for all 20 commands/queries
2. **Performance testing** - Load test with both architectures
3. **Monitoring** - Add metrics for command/query execution times
4. **Documentation** - Update API docs with new architecture details
5. **Cleanup** - Remove old code after stability period

## Support

For issues or questions:
1. Check logs for error details
2. Verify feature flag setting
3. Test with legacy architecture
4. Review `CQRS_IMPLEMENTATION.md` for architecture details

