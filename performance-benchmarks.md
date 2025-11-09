# Performance Benchmarks

## Target Metrics

### API Response Times (p95)
- Create customer: < 100ms
- Create invoice: < 150ms
- Add line item: < 100ms
- List invoices (25 items): < 150ms
- Get invoice: < 100ms
- Record payment: < 100ms
- Generate PDF: < 5000ms (5s)

### Database Query Performance
- Single customer lookup: < 10ms
- Invoice list query (25 items): < 50ms
- Payment history query: < 30ms
- Line items query per invoice: < 20ms

### Load Testing Targets
- Concurrent users: 100
- Requests per second: 50
- Error rate: < 1%
- Average response time: < 200ms
- p95 response time: < 500ms
- p99 response time: < 1000ms

## Running Performance Tests

### Artillery Load Testing
```bash
# Basic load test
npm run test:perf

# Generate detailed report
npm run test:perf:report

# View report
artillery report perf-report.json
```

### Database Query Analysis
```sql
-- Enable query timing
\timing on

-- Analyze common queries
EXPLAIN ANALYZE 
SELECT * FROM invoices 
WHERE user_id = 'test-user' 
  AND status = 'Sent' 
  AND deleted_at IS NULL
ORDER BY created_at DESC 
LIMIT 25;

-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Find slow queries (requires pg_stat_statements extension)
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
WHERE query LIKE '%invoices%'
ORDER BY mean_time DESC
LIMIT 10;
```

### Application Profiling
```bash
# Run with Node.js profiler
node --prof src/index.js

# Generate profiling report
node --prof-process isolate-*.log > profile.txt

# Analyze heap usage
node --inspect src/index.js
# Open chrome://inspect in Chrome DevTools
```

## Performance Optimization Checklist

### Database Layer
- [x] Indexes on user_id for all user-scoped queries
- [x] Composite index on (user_id, status) for invoice filtering
- [x] Composite index on (user_id, created_at) for sorted lists
- [x] Index on invoice_id for line items and payments
- [x] Unique index on invoice_number
- [x] Partial indexes for non-deleted records
- [ ] Query result caching for frequently accessed data
- [ ] Connection pooling configuration (pg)
- [ ] Prepared statements for common queries

### Application Layer
- [x] CQRS pattern for read/write separation
- [ ] Response caching (Redis) for read queries
- [ ] Async event publishing (don't block commands)
- [ ] Request rate limiting
- [ ] Response compression (gzip)
- [ ] Static asset CDN
- [ ] Database connection pool tuning

### API Layer
- [x] Pagination for list endpoints
- [ ] ETags for conditional requests
- [ ] Batch endpoints for bulk operations
- [ ] GraphQL for complex queries (future)
- [ ] API response caching headers

## Monitoring

### Key Metrics to Track
1. **Request Metrics**
   - Requests per second
   - Response time (p50, p95, p99)
   - Error rate

2. **Database Metrics**
   - Active connections
   - Query execution time
   - Slow query count
   - Cache hit ratio
   - Index usage statistics

3. **System Metrics**
   - CPU usage
   - Memory usage
   - Network I/O
   - Disk I/O

4. **Business Metrics**
   - Invoices created per minute
   - Payments processed per minute
   - Average invoice value
   - Payment success rate

## Performance Testing Schedule

### Pre-Deployment
- Run full artillery test suite
- Verify all endpoints meet p95 targets
- Check database query performance
- Review error rates

### Post-Deployment
- Monitor for 1 hour after deployment
- Compare metrics to baseline
- Check for memory leaks
- Verify database performance

### Regular Testing
- Weekly: Quick smoke test
- Monthly: Full load test
- Quarterly: Stress test with 200+ concurrent users

## Results Tracking

### Baseline (Date: YYYY-MM-DD)
- Average response time: XXms
- p95 response time: XXms
- p99 response time: XXms
- Error rate: X.XX%
- Throughput: XX req/s

### Latest (Date: YYYY-MM-DD)
- Average response time: XXms
- p95 response time: XXms
- p99 response time: XXms
- Error rate: X.XX%
- Throughput: XX req/s

## Troubleshooting Slow Performance

### Database
1. Check for missing indexes: `SELECT * FROM pg_stat_user_tables WHERE seq_scan > 0;`
2. Analyze table statistics: `ANALYZE customers, invoices, payments, line_items;`
3. Check for table bloat: `SELECT * FROM pgstattuple('invoices');`
4. Review connection pool settings

### Application
1. Enable debug logging for slow requests
2. Profile with Node.js inspector
3. Check event loop lag
4. Review memory usage patterns
5. Check for N+1 query problems

### Network
1. Check API gateway/load balancer settings
2. Review DNS resolution times
3. Check for network latency issues
4. Verify CDN configuration

