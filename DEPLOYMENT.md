# Deployment Guide

Complete deployment guide for Invoice MVP application.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Deployment Methods](#deployment-methods)
- [Health Checks](#health-checks)
- [Rollback Procedures](#rollback-procedures)

## Prerequisites

### Required Services
- **AWS Account** with configured services:
  - RDS PostgreSQL 14+
  - S3 bucket for invoice PDFs
  - Cognito User Pool
  - (Optional) ECS/ECR for container deployment
- **Domain** with SSL certificate (AWS ACM)
- **Docker** installed locally (for local testing)
- **Node.js 20+** (for local development)

### Required Environment Variables
See `.env.example` for complete list. Key variables:
```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/database
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket-name
AWS_COGNITO_USER_POOL_ID=us-east-1_xxxxx
AWS_COGNITO_CLIENT_ID=xxxxx
CORS_ORIGIN=https://yourdomain.com
```

## Environment Configuration

### 1. Create Environment Files

**Production (.env.production)**:
```bash
cp .env.example .env.production
# Edit .env.production with production values
```

**Staging (.env.staging)**:
```bash
cp .env.example .env.staging
# Edit .env.staging with staging values
```

### 2. AWS Configuration

**RDS Database**:
```bash
# Create PostgreSQL database
aws rds create-db-instance \
  --db-instance-identifier invoice-mvp-prod \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 14.7 \
  --master-username invoice_admin \
  --master-user-password <strong-password> \
  --allocated-storage 20 \
  --backup-retention-period 7 \
  --publicly-accessible false
```

**S3 Bucket**:
```bash
# Create S3 bucket for PDFs
aws s3 mb s3://invoice-mvp-pdfs-prod
aws s3api put-bucket-versioning \
  --bucket invoice-mvp-pdfs-prod \
  --versioning-configuration Status=Enabled
```

## Database Setup

### 1. Run Migrations

**Local/Staging**:
```bash
npm run migrate:up
```

**Production** (with backup):
```bash
# 1. Backup database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Run migrations
npm run migrate:up

# 3. Verify tables
psql $DATABASE_URL -c "\\dt"
```

### 2. Seed Data (Optional)
```bash
# Staging only - add test data
npm run seed:staging
```

## Deployment Methods

### Method 1: Docker Compose (Local/Development)

```bash
# 1. Build images
docker-compose build

# 2. Start services
docker-compose up -d

# 3. Check health
curl http://localhost:3000/health
curl http://localhost/health.html

# 4. View logs
docker-compose logs -f backend
```

### Method 2: AWS ECS (Production)

```bash
# 1. Build and push Docker images
docker build -t invoice-backend:latest .
docker tag invoice-backend:latest <ECR_URI>:latest
docker push <ECR_URI>:latest

# 2. Update ECS task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# 3. Update ECS service
aws ecs update-service \
  --cluster invoice-mvp-cluster \
  --service invoice-backend-service \
  --task-definition invoice-backend:latest \
  --force-new-deployment

# 4. Monitor deployment
aws ecs wait services-stable \
  --cluster invoice-mvp-cluster \
  --services invoice-backend-service
```

### Method 3: Direct Deployment (EC2/VPS)

```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
npm ci --production

# 3. Build TypeScript
npm run build

# 4. Run migrations
npm run migrate:up

# 5. Restart service
pm2 restart invoice-backend

# 6. Check status
pm2 status
pm2 logs invoice-backend --lines 50
```

## Health Checks

### Backend Health Check
```bash
curl https://api.yourdomain.com/health
# Expected: {"status":"ok","timestamp":"2024-01-15T12:00:00.000Z"}
```

### Frontend Health Check
```bash
curl https://yourdomain.com/health.html
# Expected: OK
```

### Database Connectivity
```bash
psql $DATABASE_URL -c "SELECT 1"
# Expected: 1 row returned
```

### Smoke Tests
Run complete smoke test checklist:
1. ✅ User registration
2. ✅ User login
3. ✅ Create customer
4. ✅ Create invoice
5. ✅ Add line items
6. ✅ Mark as sent (PDF generation)
7. ✅ Record payment
8. ✅ Download PDF
9. ✅ User logout

## Rollback Procedures

### Application Rollback

**ECS**:
```bash
# 1. Get previous task definition
aws ecs describe-task-definition \
  --task-definition invoice-backend \
  --query 'taskDefinition.revision' \
  --output text

# 2. Rollback to previous revision
aws ecs update-service \
  --cluster invoice-mvp-cluster \
  --service invoice-backend-service \
  --task-definition invoice-backend:<previous-revision>
```

**Docker Compose**:
```bash
# 1. Stop current version
docker-compose down

# 2. Checkout previous version
git checkout <previous-commit>

# 3. Rebuild and restart
docker-compose up -d --build
```

### Database Rollback

```bash
# 1. Stop application
pm2 stop invoice-backend

# 2. Rollback migration
npm run migrate:down

# 3. Verify database state
psql $DATABASE_URL -c "\\dt"

# 4. Restart application
pm2 restart invoice-backend
```

### Emergency Rollback (Complete)

```bash
# 1. Restore database from backup
psql $DATABASE_URL < backup_YYYYMMDD_HHMMSS.sql

# 2. Rollback application code
git checkout <stable-commit>

# 3. Rebuild and restart
npm ci --production
npm run build
pm2 restart invoice-backend
```

## Post-Deployment Verification

### 1. Check Logs
```bash
# Application logs
pm2 logs invoice-backend --lines 100

# AWS CloudWatch (if using ECS)
aws logs tail /ecs/invoice-backend --follow
```

### 2. Monitor Metrics
- Response times < 200ms (CRUD operations)
- Error rate < 1%
- CPU usage < 70%
- Memory usage < 80%

### 3. Verify Endpoints
```bash
# Health check
curl https://api.yourdomain.com/health

# API documentation
open https://api.yourdomain.com/api/docs

# Frontend
open https://yourdomain.com
```

## Troubleshooting

### Database Connection Issues
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check security group rules
aws ec2 describe-security-groups --group-ids <sg-id>
```

### PDF Generation Failures
```bash
# Check S3 permissions
aws s3 ls s3://<bucket-name>/invoices/

# Test invoice-generator.com connectivity
curl -I https://invoice-generator.com
```

### Authentication Errors
```bash
# Verify Cognito configuration
aws cognito-idp describe-user-pool --user-pool-id <pool-id>

# Test JWT token
curl -H "Authorization: Bearer <token>" \
  https://api.yourdomain.com/api/v1/customers
```

## Support

For issues or questions:
- Check logs: `pm2 logs` or CloudWatch
- Review documentation: README.md, OPERATIONS.md
- Contact: support@yourdomain.com

