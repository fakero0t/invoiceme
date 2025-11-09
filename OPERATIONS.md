# Operations Guide

Day-to-day operations guide for Invoice MVP application.

## Table of Contents
- [Monitoring](#monitoring)
- [Logging](#logging)
- [Performance](#performance)
- [Security](#security)
- [Maintenance](#maintenance)
- [Common Issues](#common-issues)

## Monitoring

### Application Health

**Health Check Endpoint**:
```bash
curl https://api.yourdomain.com/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

### AWS CloudWatch Alarms

**Key Alarms**:
- **High Error Rate**: Error rate > 1% (5-minute window)
- **Slow Response Times**: P99 latency > 5 seconds
- **Database Connections**: Connection pool > 90% utilized
- **Failed Health Checks**: > 2 consecutive failures

**View Alarms**:
```bash
aws cloudwatch describe-alarms --state-value ALARM
```

### Database Monitoring

**Active Connections**:
```sql
SELECT count(*) FROM pg_stat_activity WHERE state = 'active';
```

**Long-Running Queries**:
```sql
SELECT pid, now() - query_start AS duration, query
FROM pg_stat_activity
WHERE state = 'active'
  AND now() - query_start > interval '5 seconds'
ORDER BY duration DESC;
```

**Database Size**:
```sql
SELECT pg_size_pretty(pg_database_size('invoice_db'));
```

## Logging

### Access Logs

**Application Logs** (JSON format):
```json
{
  "level": "info",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "method": "POST",
  "path": "/api/v1/invoices",
  "statusCode": 201,
  "responseTime": 145,
  "userId": "uuid",
  "requestId": "uuid"
}
```

**View Recent Logs**:
```bash
# Local
pm2 logs invoice-backend --lines 100

# AWS CloudWatch
aws logs tail /ecs/invoice-backend --follow --format short
```

### Error Logs

**Filter Errors**:
```bash
# Local
pm2 logs invoice-backend --err

# CloudWatch
aws logs filter-log-events \
  --log-group-name /ecs/invoice-backend \
  --filter-pattern "{ $.level = \"error\" }"
```

### Log Retention

- **Development**: 7 days
- **Staging**: 30 days
- **Production**: 90 days

## Performance

### Key Metrics

**Target Performance**:
- API response time (CRUD): < 200ms (P95)
- Complex queries: < 500ms (P95)
- PDF generation: < 5 seconds (P99)
- Database query time: < 100ms (P95)

**Monitor Performance**:
```bash
# Response time distribution
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name TargetResponseTime \
  --start-time 2024-01-15T00:00:00Z \
  --end-time 2024-01-15T23:59:59Z \
  --period 3600 \
  --statistics Average,Maximum
```

### Database Performance

**Slow Query Log**:
```sql
-- Enable slow query logging (> 1 second)
ALTER DATABASE invoice_db SET log_min_duration_statement = 1000;

-- View slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
```

**Index Usage**:
```sql
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;
```

### Connection Pooling

**Current Settings**:
- Min connections: 5
- Max connections: 20
- Idle timeout: 30 seconds

**Monitor Pool**:
```bash
# Check pool metrics in application logs
grep "connection pool" logs/app.log
```

## Security

### Rate Limiting

**Current Limits**:
- 100 requests per minute per IP
- Applies to all API endpoints

**Check Rate Limit Status**:
```bash
# View recent rate limit blocks
grep "RATE_LIMIT_EXCEEDED" logs/app.log
```

### SSL/TLS Configuration

**Current Settings**:
- TLS 1.2+ only
- HSTS enabled (max-age: 1 year)
- HTTP → HTTPS redirect

**Verify SSL**:
```bash
# Check SSL certificate
openssl s_client -connect api.yourdomain.com:443 -servername api.yourdomain.com

# Check security headers
curl -I https://api.yourdomain.com
```

### Security Scanning

**Weekly Scans**:
```bash
# NPM audit
npm audit --production

# OWASP dependency check
npm install -g audit-ci
audit-ci --moderate
```

## Maintenance

### Database Backups

**Automated Backups**:
- Frequency: Daily at 2:00 AM UTC
- Retention: 7 days
- Location: AWS RDS automated backups

**Manual Backup**:
```bash
# Create backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Compress backup
gzip backup_*.sql

# Upload to S3
aws s3 cp backup_*.sql.gz s3://invoice-backups/$(date +%Y%m%d)/
```

**Restore Backup**:
```bash
# Download backup
aws s3 cp s3://invoice-backups/YYYYMMDD/backup.sql.gz .

# Decompress
gunzip backup.sql.gz

# Restore
psql $DATABASE_URL < backup.sql
```

### Database Maintenance

**Weekly Maintenance** (Sunday 2:00 AM UTC):
```sql
-- Vacuum analyze
VACUUM ANALYZE;

-- Reindex
REINDEX DATABASE invoice_db;

-- Update statistics
ANALYZE;
```

**Monitor Table Bloat**:
```sql
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Log Rotation

**Logrotate Configuration** (`/etc/logrotate.d/invoice-mvp`):
```
/var/log/invoice-mvp/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 nodejs nodejs
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

## Common Issues

### Issue: High Database Connection Count

**Symptoms**: "too many connections" errors

**Solution**:
```bash
# 1. Check current connections
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"

# 2. Kill idle connections
psql $DATABASE_URL -c "
  SELECT pg_terminate_backend(pid)
  FROM pg_stat_activity
  WHERE state = 'idle'
    AND state_change < now() - interval '30 minutes';
"

# 3. Restart application
pm2 restart invoice-backend
```

### Issue: PDF Generation Timeout

**Symptoms**: 500 errors on mark as sent, timeout errors

**Solution**:
```bash
# 1. Check invoice-generator.com connectivity
curl -I https://invoice-generator.com

# 2. Check S3 permissions
aws s3 ls s3://<bucket>/invoices/

# 3. Review logs for specific error
grep "PDF_GENERATION_FAILED" logs/app.log | tail -20

# 4. Retry failed invoice
curl -X POST https://api.yourdomain.com/api/v1/invoices/<id>/mark-as-sent \
  -H "Authorization: Bearer <token>"
```

### Issue: Authentication Failures

**Symptoms**: 401 Unauthorized errors

**Solution**:
```bash
# 1. Verify Cognito status
aws cognito-idp describe-user-pool --user-pool-id <pool-id>

# 2. Check JWT token
# Decode token at jwt.io

# 3. Verify CORS configuration
curl -H "Origin: https://yourdomain.com" -I https://api.yourdomain.com

# 4. Check environment variables
echo $AWS_COGNITO_USER_POOL_ID
echo $AWS_COGNITO_CLIENT_ID
```

### Issue: Slow Query Performance

**Symptoms**: API response times > 1 second

**Solution**:
```sql
-- 1. Identify slow queries
SELECT query, calls, mean_time, max_time
FROM pg_stat_statements
WHERE mean_time > 1000
ORDER BY mean_time DESC
LIMIT 10;

-- 2. Check missing indexes
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan < 50
ORDER BY idx_scan ASC;

-- 3. Analyze table
ANALYZE <table_name>;

-- 4. Vacuum table
VACUUM ANALYZE <table_name>;
```

### Issue: High Memory Usage

**Symptoms**: Application crashes, OOM errors

**Solution**:
```bash
# 1. Check current memory usage
pm2 show invoice-backend

# 2. Enable heap snapshot
node --heapsnapshot-signal=SIGUSR2 dist/index.js

# 3. Analyze heap
node --inspect dist/index.js

# 4. Restart application
pm2 restart invoice-backend --max-memory-restart 500M
```

## Scaling Guidelines

### Horizontal Scaling

**When to scale**:
- CPU usage > 70% for > 5 minutes
- Response times consistently > 500ms
- Request rate > 1000 req/min

**Scale backend**:
```bash
# Increase ECS task count
aws ecs update-service \
  --cluster invoice-mvp-cluster \
  --service invoice-backend-service \
  --desired-count 3
```

### Database Scaling

**When to scale**:
- Connection pool > 90% utilized
- Storage > 80% used
- IOPS consistently maxed out

**Vertical scaling**:
```bash
# Upgrade RDS instance class
aws rds modify-db-instance \
  --db-instance-identifier invoice-mvp-prod \
  --db-instance-class db.t3.medium \
  --apply-immediately
```

## Contact & Support

**On-call Engineer**: +1-XXX-XXX-XXXX  
**Email**: ops@yourdomain.com  
**Slack**: #invoice-mvp-ops  
**Documentation**: https://docs.yourdomain.com

