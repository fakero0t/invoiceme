# Invoice System MVP - Product Requirements Document

## 1. Executive Summary

This document outlines the requirements for building a production-quality, ERP-style invoicing system MVP. The system implements core business domains (Customers, Invoices, Payments) with enterprise-grade architecture following Domain-Driven Design (DDD), Command Query Responsibility Segregation (CQRS), and Vertical Slice Architecture (VSA) principles.

**Primary Goal:** Deliver a functional MVP where authenticated users can create, view, manage, and pay invoices through a clean, performant interface.

## 2. System Architecture

### 2.1 Architectural Principles

The system MUST adhere to the following architectural patterns:

1. **Domain-Driven Design (DDD)**
   - Model Customer, Invoice, and Payment as rich Domain Objects with encapsulated behavior
   - Implement domain logic within entities, not in services
   - Use Value Objects for monetary amounts, addresses, and other immutable concepts

2. **Command Query Responsibility Segregation (CQRS)**
   - Strict separation between write operations (Commands) and read operations (Queries)
   - Commands modify state and return success/failure
   - Queries return data without side effects

3. **Vertical Slice Architecture (VSA)**
   - Organize code by feature/use case, not technical layer
   - Each slice contains all layers needed for that feature
   - Example: `features/create-invoice/` contains command, handler, validator, and tests

4. **Clean Architecture**
   - Domain Layer: Core business logic, entities, value objects
   - Application Layer: Use cases, commands, queries, handlers
   - Infrastructure Layer: Database, external services, frameworks
   - Presentation Layer: API controllers, DTOs

### 2.2 Technology Stack

**Backend:**
- Runtime: Node.js with TypeScript
- Framework: Express.js or Fastify
- Database: PostgreSQL with pg library (parameterized queries)
- PDF Generation: Invoice-Generator.com API (https://invoice-generator.com/developers)
- Authentication: AWS Cognito with JWT validation
- API Documentation: Swagger/OpenAPI
- Testing: Jest (unit), Cypress (integration)

**Implementation Defaults:**
- Use standard Node.js patterns and libraries
- Developers may make informed technical decisions for unspecified details
- Edge cases and error scenarios not explicitly covered should follow industry best practices

**Frontend:**
- Framework: Vue 3 with TypeScript
- Build Tool: Vite
- State Management: Pinia
- HTTP Client: Axios
- UI Components: Custom or lightweight library

**Infrastructure:**
- Hosting: AWS (EC2/ECS/Lambda)
- Database: AWS RDS PostgreSQL
- Authentication: AWS Cognito
- Storage: AWS S3 (for invoice PDFs)

**PDF Generation:**
- Service: Invoice-Generator.com API (https://invoice-generator.com/developers)
- Rationale: Rapid MVP development, professional templates out-of-the-box, handles complex layouts automatically

## 3. Domain Model

### 3.1 Core Entities

#### User
**Aggregate Root**

```typescript
interface User {
  id: UserId (UUID - from AWS Cognito sub)
  email: EmailAddress (Value Object)
  name: string
  createdAt: DateTime
  updatedAt: DateTime
}
```

**Invariants:**
- Email must be unique (enforced by AWS Cognito)
- User ID matches AWS Cognito sub claim

**Notes:**
- User authentication handled by AWS Cognito
- This table stores additional user data and links to Cognito identity
- All invoices and customers belong to a specific user

#### Customer
**Aggregate Root**

```typescript
interface Customer {
  id: CustomerId (UUID)
  userId: UserId (UUID - owner of customer)
  name: CustomerName (Value Object, required, max 255 chars)
  email: EmailAddress (Value Object, required, unique including deleted)
  address: Address (Value Object, all fields required)
  phoneNumber: PhoneNumber (Value Object, required)
  deletedAt: DateTime (nullable, for soft delete)
  createdAt: DateTime
  updatedAt: DateTime
}
```

**Invariants:**
- Email must be unique per user (including soft-deleted customers)
- All fields required (name, email, street, city, state, postalCode, country, phoneNumber)
- Name cannot be empty, max 255 characters
- Email must be valid format

#### Invoice
**Aggregate Root**

```typescript
interface Invoice {
  id: InvoiceId (UUID)
  invoiceNumber: InvoiceNumber (auto-generated, sequential, globally unique)
  userId: UserId (UUID - owner of invoice)
  customerId: CustomerId
  companyInfo: string (multi-line text, max 500 chars)
  status: InvoiceStatus (Draft | Sent | Paid)
  lineItems: LineItem[] (Entities)
  subtotal: Money (Value Object, stored)
  taxRate: number (user-entered percentage, e.g., 7 for 7%)
  taxAmount: Money (calculated: subtotal * taxRate / 100, stored)
  total: Money (Value Object, stored)
  balance: Money (computed from total - SUM(payments))
  notes: string (optional, max 1000 chars, displayed on PDF)
  terms: string (optional, max 500 chars, payment terms displayed on PDF)
  issueDate: DateTime (must be today or in past, not future)
  dueDate: DateTime (must be >= issueDate, no other restrictions)
  sentDate: DateTime (nullable)
  paidDate: DateTime (nullable)
  pdfS3Keys: string[] (versioned PDFs for audit trail)
  deletedAt: DateTime (nullable, for soft delete)
  createdAt: DateTime
  updatedAt: DateTime
}
```

**Invariants:**
- Must have at least one line item before marking as Sent
- Must have maximum 100 line items
- Cannot transition from Paid to Draft or Sent
- Balance must be >= 0
- IssueDate must be today or in the past (not future)
- DueDate must be >= IssueDate (can create overdue invoices)
- Total = Subtotal + TaxAmount
- TaxRate must be >= 0 and <= 100
- CompanyInfo max 500 characters
- Notes max 1000 characters
- Terms max 500 characters
- All monetary amounts in USD

**State Transitions:**
- Draft → Sent (requires validation of line items, generates PDF)
- Sent → Paid (when balance reaches zero through payment recording)
- Sent → Draft (allow editing before payment)

**Payment Rules:**
- Payments can ONLY be recorded on invoices in Sent or Paid status
- Draft invoices cannot accept payments (must be marked as Sent first)
- This enforces proper workflow: Draft → Sent (with PDF) → Record Payment → Paid

#### LineItem
**Entity (Part of Invoice Aggregate)**

```typescript
interface LineItem {
  id: LineItemId (UUID)
  description: string (required, max 500 chars)
  quantity: Quantity (Value Object, up to 4 decimal places)
  unitPrice: Money (Value Object, up to 4 decimal places)
  amount: Money (calculated: quantity * unitPrice)
}
```

**Invariants:**
- Description cannot be empty, max 500 characters
- Quantity must be > 0
- UnitPrice must be >= 0
- All decimal values support up to 4 decimal places
- Line items displayed in creation order (by created_at), no manual reordering in MVP

#### Payment
**Aggregate Root**

```typescript
interface Payment {
  id: PaymentId (UUID)
  invoiceId: InvoiceId
  amount: Money (Value Object)
  paymentMethod: PaymentMethod (Cash | Check | CreditCard | BankTransfer)
  paymentDate: DateTime
  reference: string (nullable)
  notes: string (nullable)
  createdAt: DateTime
}
```

**Invariants:**
- Amount must be > 0
- Cannot exceed invoice balance
- PaymentDate cannot be in the future

### 3.2 Value Objects

- **Money**: { amount: Decimal (4 decimal places), currency: 'USD' } - All amounts in USD for MVP
- **Quantity**: Decimal (4 decimal places) - Supports fractional quantities (e.g., 1.5, 2.7500)
- **EmailAddress**: Validated email format
- **PhoneNumber**: Validated phone format
- **Address**: { street, city, state, postalCode, country }
- **InvoiceNumber**: Auto-generated sequential number (format: INV-{sequence}, globally unique)
- **UserId, CustomerId, InvoiceId, PaymentId**: Type-safe UUID wrappers

## 4. Functional Requirements

### 4.1 Customer Management

#### Commands (Write Operations)

**CreateCustomer**
- Input: Name, Email, Address, PhoneNumber
- Output: CustomerId
- Validation: Email uniqueness (including soft-deleted customers), valid email format

**UpdateCustomer**
- Input: CustomerId, Name, Email, Address, PhoneNumber
- Output: Success/Failure
- Validation: Customer exists, email uniqueness (including soft-deleted customers)

**DeleteCustomer**
- Input: CustomerId
- Output: Success/Failure
- Implementation: Soft delete (sets deletedAt timestamp)
- Validation: Customer exists and not already deleted, user owns customer
- Business Rule: Can delete regardless of invoice associations (soft delete preserves data integrity)

#### Queries (Read Operations)

**GetCustomerById**
- Input: CustomerId
- Output: CustomerDTO
- Returns only non-deleted customers

**ListAllCustomers**
- Input: Page, PageSize (default: 25), SearchTerm (optional)
- Output: PagedResult<CustomerDTO>
- Returns only non-deleted customers belonging to authenticated user
- Search: Case-insensitive ILIKE '%term%' on name and email fields if SearchTerm provided

### 4.2 Invoice Management

#### Commands (Write Operations)

**CreateInvoice**
- Input: UserId (from auth context), CustomerId, CompanyInfo (text, max 500 chars), IssueDate, DueDate, TaxRate (number), Notes (optional, max 1000 chars), Terms (optional, max 500 chars)
- Output: InvoiceId
- Initial State: Draft
- Validation: 
  - UserId must match authenticated user
  - TaxRate between 0-100
  - Customer belongs to user and not deleted
  - IssueDate must be today or in past
  - DueDate must be >= IssueDate
  - Field length limits enforced
- Default Values:
  - IssueDate: Current date (today) if not provided
  - DueDate: Current date + 30 days if not provided
  - TaxRate: 0 if not provided
  - Notes: Empty string
  - Terms: Empty string

**AddLineItem**
- Input: InvoiceId, Description (max 500 chars), Quantity, UnitPrice
- Output: LineItemId
- Validation: 
  - Invoice exists, is in Draft status
  - Invoice has < 100 line items
  - User owns invoice
  - Description not empty and <= 500 chars
  - Quantity > 0
  - UnitPrice >= 0
- Side Effects: Recalculate invoice totals (subtotal, taxAmount = subtotal * taxRate / 100, total = subtotal + taxAmount)
- Rounding: All amounts rounded to 4 decimal places

**UpdateLineItem**
- Input: InvoiceId, LineItemId, Description, Quantity, UnitPrice
- Output: Success/Failure
- Validation: Invoice in Draft, line item exists
- Side Effects: Recalculate invoice totals
- Rounding: All amounts rounded to 4 decimal places

**RemoveLineItem**
- Input: InvoiceId, LineItemId
- Output: Success/Failure
- Validation: Invoice in Draft, line item exists
- Side Effects: Recalculate invoice totals

**MarkInvoiceAsSent**
- Input: InvoiceId
- Output: Success/Failure
- Validation: Invoice in Draft, has at least one line item, user owns invoice
- State Transition: Draft → Sent
- Side Effects: Set sentDate, generate PDF using Invoice-Generator.com API and store in AWS S3 with timestamp/version in key
- PDF Versioning: Each time invoice is marked as Sent, new PDF generated and added to pdfS3Keys array for audit trail
- Previous PDFs remain in S3 (not deleted or overwritten)
- API: POST to https://invoice-generator.com with invoice data (from, to, items, notes, terms, etc.)

**RecordPayment**
- Input: InvoiceId, Amount, PaymentMethod, PaymentDate, Reference, Notes
- Output: PaymentId
- Validation: 
  - Invoice status must be Sent or Paid (CANNOT record payment on Draft invoices)
  - Amount > 0
  - Amount <= current balance (overpayment not allowed)
  - User owns invoice
- Business Rule: Draft invoices must be marked as Sent (with PDF generation) before any payments can be recorded
- Side Effects: Recalculate and update invoice balance (total - SUM(payments)), if balance = 0 → mark as Paid and set paidDate
- Rounding: Balance rounded to 4 decimal places
- Error: Returns PAYMENT_EXCEEDS_BALANCE if amount > balance, INVALID_STATE_TRANSITION if invoice is Draft

**UpdateInvoice**
- Input: InvoiceId, DueDate, Notes, Terms
- Output: Success/Failure
- Validation: Invoice exists, can only update certain fields based on status
- Notes: Notes and Terms can be updated even after invoice is Sent

**DeleteInvoice**
- Input: InvoiceId
- Output: Success/Failure
- Implementation: Soft delete (sets deletedAt timestamp)
- Validation: Invoice in Draft status only, user owns invoice
- Business Rule: Only Draft invoices can be deleted (Sent/Paid invoices preserved for audit)
- Side Effects: Line items remain in database (cascade soft delete not required for MVP)

#### Queries (Read Operations)

**GetInvoiceById**
- Input: InvoiceId
- Output: InvoiceDTO (with embedded LineItems and Customer info)
- Returns only non-deleted invoices
- Balance computed as: total - SUM(payments.amount)

**ListInvoicesByStatus**
- Input: Status, Page, PageSize (default: 25), SearchTerm (optional)
- Output: PagedResult<InvoiceSummaryDTO>
- Returns only non-deleted invoices belonging to authenticated user
- Search: Case-insensitive ILIKE '%term%' on invoice_number or customer name if SearchTerm provided

**ListInvoicesByCustomer**
- Input: CustomerId, Page, PageSize (default: 25)
- Output: PagedResult<InvoiceSummaryDTO>
- Returns only non-deleted invoices

**GetInvoiceBalance**
- Input: InvoiceId
- Output: Money
- Computed as: total - SUM(payments.amount) for the invoice

### 4.3 Payment Management

#### Commands (Write Operations)

**RecordPayment** (Covered under Invoice Management)

#### Queries (Read Operations)

**GetPaymentById**
- Input: PaymentId
- Output: PaymentDTO

**ListPaymentsForInvoice**
- Input: InvoiceId
- Output: PaymentDTO[]

## 5. API Specifications

### 5.1 RESTful API Design

All endpoints follow REST conventions and return consistent response formats.

**Base URL:** `/api/v1`

**Response Format:**
```typescript
{
  success: boolean
  data?: any
  error?: {
    code: string
    message: string
    details?: any
  }
  meta?: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
  }
}
```

### 5.2 Endpoints

#### Authentication
- `POST /auth/login` - Login with AWS Cognito
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get current user

#### Customers
- `POST /customers` - CreateCustomer
- `GET /customers/:id` - GetCustomerById
- `PUT /customers/:id` - UpdateCustomer
- `DELETE /customers/:id` - DeleteCustomer
- `GET /customers` - ListAllCustomers (paginated)

#### Invoices
- `POST /invoices` - CreateInvoice
- `GET /invoices/:id` - GetInvoiceById
- `PUT /invoices/:id` - UpdateInvoice
- `DELETE /invoices/:id` - DeleteInvoice
- `GET /invoices` - ListInvoices (with filters: status, customerId)
- `POST /invoices/:id/line-items` - AddLineItem
- `PUT /invoices/:id/line-items/:lineItemId` - UpdateLineItem
- `DELETE /invoices/:id/line-items/:lineItemId` - RemoveLineItem
- `POST /invoices/:id/send` - MarkInvoiceAsSent
- `POST /invoices/:id/payments` - RecordPayment
- `GET /invoices/:id/balance` - GetInvoiceBalance
- `GET /invoices/:id/pdf` - Download invoice PDF

#### Payments
- `GET /payments/:id` - GetPaymentById
- `GET /invoices/:invoiceId/payments` - ListPaymentsForInvoice

### 5.3 DTOs (Data Transfer Objects)

**CustomerDTO**
```typescript
{
  id: string
  name: string
  email: string
  address: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  phoneNumber: string
  createdAt: string (ISO 8601)
  updatedAt: string (ISO 8601)
}
```

**InvoiceDTO**
```typescript
{
  id: string
  invoiceNumber: string (e.g., "INV-1000", globally unique)
  userId: string
  customer: CustomerSummaryDTO
  companyInfo: string
  status: 'Draft' | 'Sent' | 'Paid'
  lineItems: LineItemDTO[]
  subtotal: number (USD, 4 decimal places, rounded)
  taxRate: number (percentage, e.g., 7 for 7%)
  taxAmount: number (USD, 4 decimal places, rounded)
  total: number (USD, 4 decimal places, rounded)
  balance: number (USD, 4 decimal places, computed from total - SUM(payments), rounded)
  notes: string | null (optional, displayed on PDF)
  terms: string | null (optional, payment terms on PDF)
  issueDate: string (ISO 8601, UTC)
  dueDate: string (ISO 8601, UTC)
  sentDate: string | null (ISO 8601, UTC)
  paidDate: string | null (ISO 8601, UTC)
  pdfS3Keys: string[] (array of S3 keys for versioned PDFs)
  createdAt: string (ISO 8601, UTC)
  updatedAt: string (ISO 8601, UTC)
}
```

**LineItemDTO**
```typescript
{
  id: string
  description: string
  quantity: number (4 decimal places, e.g., 1.5000)
  unitPrice: number (USD, 4 decimal places)
  amount: number (USD, 4 decimal places, calculated: quantity * unitPrice)
}
```

**PaymentDTO**
```typescript
{
  id: string
  invoiceId: string
  amount: number (USD, 4 decimal places)
  paymentMethod: 'Cash' | 'Check' | 'CreditCard' | 'BankTransfer'
  paymentDate: string (ISO 8601, UTC)
  reference: string | null
  notes: string | null
  createdAt: string (ISO 8601, UTC)
}
```

### 5.4 Swagger Documentation

All API endpoints MUST be documented using OpenAPI 3.0 specification with:
- Request/response schemas
- Authentication requirements
- Validation rules
- Example requests and responses
- Error codes

Swagger UI accessible at `/api/docs`

## 6. Database Schema

### 6.1 PostgreSQL Schema

**users**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY, -- Matches AWS Cognito sub claim
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

**customers**
```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  street VARCHAR(255) NOT NULL, -- All address fields required
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL,
  phone_number VARCHAR(50) NOT NULL,
  deleted_at TIMESTAMP, -- Soft delete timestamp
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  -- Email uniqueness includes soft-deleted customers (enforced at application layer)
);

CREATE INDEX idx_customers_user ON customers(user_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_deleted_at ON customers(deleted_at); -- For filtering deleted customers
```

**invoices**
```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(50) NOT NULL UNIQUE, -- Globally unique, format: INV-{sequence}
  user_id UUID NOT NULL REFERENCES users(id),
  customer_id UUID NOT NULL REFERENCES customers(id),
  company_info TEXT, -- Multi-line text field for sender/company information
  status VARCHAR(20) NOT NULL CHECK (status IN ('Draft', 'Sent', 'Paid')),
  subtotal DECIMAL(12, 4) NOT NULL DEFAULT 0, -- 4 decimal places for precision
  tax_rate DECIMAL(5, 2) NOT NULL DEFAULT 0, -- Percentage (e.g., 7.00 for 7%)
  tax_amount DECIMAL(12, 4) NOT NULL DEFAULT 0, -- Calculated: subtotal * tax_rate / 100, rounded to 4 decimals
  total DECIMAL(12, 4) NOT NULL DEFAULT 0, -- 4 decimal places
  -- balance is computed at query time: total - SUM(payments.amount), rounded to 4 decimals
  notes TEXT, -- Optional notes displayed on PDF (e.g., "Thank you for your business")
  terms TEXT, -- Optional payment terms displayed on PDF (e.g., "Net 30", "Due upon receipt")
  issue_date DATE NOT NULL, -- UTC date
  due_date DATE NOT NULL, -- UTC date
  sent_date TIMESTAMP, -- UTC timestamp
  paid_date TIMESTAMP, -- UTC timestamp
  pdf_s3_keys TEXT[], -- Array of S3 keys for versioned PDFs (audit trail)
  deleted_at TIMESTAMP, -- Soft delete timestamp
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT check_due_date CHECK (due_date >= issue_date),
  CONSTRAINT check_tax_rate CHECK (tax_rate >= 0 AND tax_rate <= 100)
);

CREATE INDEX idx_invoices_user ON invoices(user_id);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_deleted_at ON invoices(deleted_at); -- For filtering deleted invoices
CREATE SEQUENCE invoice_number_seq START 1000; -- Global sequence for all users
```

**line_items**
```sql
CREATE TABLE line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(12, 4) NOT NULL, -- 4 decimal places (e.g., 1.5000, 2.7500)
  unit_price DECIMAL(12, 4) NOT NULL, -- 4 decimal places for USD amounts
  amount DECIMAL(12, 4) NOT NULL, -- Calculated: quantity * unit_price
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_line_items_invoice ON line_items(invoice_id);
```

**payments**
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id),
  amount DECIMAL(12, 4) NOT NULL, -- 4 decimal places for USD amounts
  payment_method VARCHAR(50) NOT NULL,
  payment_date DATE NOT NULL, -- UTC date
  reference VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_payments_date ON payments(payment_date);
```

### 6.2 Database Migrations

Use a migration tool (e.g., node-pg-migrate, TypeORM migrations, or Knex) to manage schema versions.

### 6.3 PDF Generation Implementation

**Service:** Invoice-Generator.com API (https://invoice-generator.com/developers)

**Why Invoice-Generator.com:**
- Rapid MVP development with minimal PDF generation code
- Professional invoice templates out-of-the-box
- Handles multi-page layouts automatically (important for 100 line item max)
- No complex PDF rendering logic to maintain
- JSON API - simple integration

**API Setup:**
1. Create Invoice-Generator.com account
2. Generate API key from Settings page
3. Store API key in environment variables (`INVOICE_GENERATOR_API_KEY`)
4. Free tier: 100 invoices/month (sufficient for MVP testing)
5. Production: Purchase API subscription for unlimited invoices

**Implementation Process:**
1. When invoice is marked as Sent, retrieve full invoice data including customer and line items
2. Make POST request to Invoice-Generator.com API:
   ```typescript
   import axios from 'axios';
   
   const invoiceData = {
     from: invoice.companyInfo, // Multi-line company info
     to: `${customer.name}\n${customer.address.street || 'N/A'}\n${customer.address.city || 'N/A'}, ${customer.address.state || 'N/A'} ${customer.address.postalCode || 'N/A'}\n${customer.address.country || 'N/A'}\n${customer.email}`,
     number: invoice.invoiceNumber, // e.g., "INV-1000"
     currency: 'usd',
     date: invoice.issueDate.toISOString(),
     due_date: invoice.dueDate.toISOString(),
     items: invoice.lineItems.map(item => ({
       name: item.description,
       quantity: item.quantity, // 4 decimal places
       unit_cost: item.unitPrice, // 4 decimal places, USD
     })),
     fields: {
       tax: '%', // Display as percentage
     },
     tax: invoice.taxRate, // Percentage (e.g., 7 for 7%)
     notes: invoice.notes || '', // Optional
     terms: invoice.terms || '', // Optional
   };
   
   const response = await axios.post('https://invoice-generator.com', invoiceData, {
     headers: {
       'Authorization': `Bearer ${process.env.INVOICE_GENERATOR_API_KEY}`,
       'Content-Type': 'application/json',
     },
     responseType: 'arraybuffer', // PDF binary data
   });
   
   const pdfBuffer = Buffer.from(response.data);
   ```
3. Upload generated PDF buffer to AWS S3 bucket
4. Store S3 key in invoice's `pdf_s3_keys` array for retrieval

**S3 Storage:**
- Bucket structure: `invoices/{year}/{month}/{invoiceId}_{timestamp}.pdf`
- Timestamp format: Unix epoch milliseconds for uniqueness (e.g., `abc123_1699459200000.pdf`)
- Use AWS SDK v3 (`@aws-sdk/client-s3`) to upload PDF buffer
- Each PDF generation creates new file (never overwrite existing PDFs)
- All PDF S3 keys stored in invoice's `pdf_s3_keys` array field
- Generate pre-signed URLs for secure PDF downloads (15-minute expiration)
- Set appropriate ACLs (private, authenticated access only)
- PDFs never deleted from S3 (preserved for audit trail and compliance)

**Error Handling:**
- If API call fails:
  - Keep invoice in previous status (Draft)
  - Log error to console with invoice ID and API response details
  - Return generic error to user: "PDF generation failed. Please try again."
  - Implement retry logic (up to 3 attempts with exponential backoff)
- If S3 upload fails:
  - Store PDF temporarily in memory
  - Retry upload (up to 3 attempts)
  - If all retries fail, keep invoice in Draft and show generic error
- Transaction boundary: Invoice status change and S3 key update must be atomic
- All user-facing errors are generic for MVP, detailed errors logged to console

**Performance Considerations:**
- API typically responds in 1-3 seconds
- No need to handle pagination - Invoice-Generator.com automatically creates multi-page PDFs
- Use async/await to avoid blocking
- Total time budget: < 5 seconds for MarkInvoiceAsSent command

## 7. Authentication & Authorization

### 7.1 AWS Cognito Integration

**User Pool Configuration:**
- User attributes: email (required), name
- Email verification required
- MFA: Optional for MVP
- Password policy: Minimum 8 characters, uppercase, lowercase, number

**User Registration Flow:**
1. Frontend calls `/api/v1/auth/register` endpoint
2. Backend creates AWS Cognito account
3. On Cognito success, backend creates record in `users` table with Cognito sub as ID
4. If database insert fails, rollback/delete Cognito account or mark for cleanup
5. Return success and JWT token
6. User record links Cognito identity to application data

**Authentication Flow:**
1. User submits credentials to `/api/v1/auth/login`
2. Backend validates with AWS Cognito
3. On success, return JWT tokens (access token + refresh token)
4. Access token valid for 1 hour, refresh token valid for 30 days
5. Frontend stores tokens in httpOnly cookies
6. Token included in Authorization header for subsequent requests
7. Backend middleware validates JWT on protected routes
8. On token expiration, use refresh token to get new access token

**Token Validation:**
- Verify JWT signature using Cognito public keys (JWKS endpoint)
- Check token expiration
- Extract user identity (sub/email) from token claims
- Cache public keys with TTL for performance

**Password Reset:**
- Handled entirely by AWS Cognito Hosted UI
- User redirected to Cognito reset password flow
- No custom password reset implementation in MVP

### 7.2 Authorization

For MVP, implement role-based access control (RBAC) with single role:
- **User**: Can perform all CRUD operations on Customers, Invoices, Payments

Future enhancement: Add Admin, Viewer roles with granular permissions.

## 8. Frontend Requirements

### 8.1 Application Structure

**Technology Stack:**
- Vue 3 Composition API with TypeScript
- Vite for build tooling
- Pinia for state management
- Vue Router for navigation
- Axios for API communication
- Tailwind CSS or custom styling

**Project Structure:**
```
src/
├── features/           # Feature-based organization
│   ├── auth/
│   ├── customers/
│   ├── invoices/
│   └── payments/
├── shared/             # Shared utilities, components
│   ├── components/
│   ├── composables/
│   ├── api/
│   └── types/
├── router/
├── stores/
└── App.vue
```

### 8.2 Key Views

#### Login Page
- Email and password inputs
- Submit button triggers AWS Cognito authentication
- Error handling for invalid credentials
- Redirect to dashboard on success

#### Dashboard
- Summary cards: Total Invoices, Outstanding Balance, Paid This Month
- Recent invoices list
- Quick actions: Create Invoice, Create Customer

#### Customers List
- Paginated table of all customers
- Search by name/email
- Actions: View, Edit, Delete
- Create Customer button

#### Customer Detail/Form
- Form for creating/editing customer
- Fields: Name, Email, Address (street, city, state, postal code, country), Phone
- Validation feedback
- Save/Cancel buttons

#### Invoices List
- Paginated table with filters (Status, Customer)
- Columns: Invoice #, Customer, Date, Due Date, Total, Balance, Status
- Actions: View, Edit (if Draft), Delete (if Draft), Mark as Sent
- Create Invoice button

#### Invoice Detail/Form
- **View Mode (Sent/Paid):**
  - Display invoice details, line items, payment history
  - Display notes and terms (if present)
  - Download PDF button
  - Record Payment button (if not fully paid)
  
- **Edit Mode (Draft):**
  - Company Info (multi-line text field for sender information)
  - Customer selection (dropdown - only user's customers)
  - Issue Date, Due Date
  - Tax Rate (number input, e.g., 7 for 7%)
  - Notes (optional multi-line text field)
  - Terms (optional text field, e.g., "Net 30", "Due upon receipt")
  - Line Items table with Add/Edit/Remove (max 100 items)
  - Auto-calculated Subtotal, Tax Amount (taxRate% of subtotal), Total
  - All amounts in USD with $ symbol, rounded to 4 decimal places
  - Save Draft / Mark as Sent buttons

#### Line Items Management
- Inline table in Invoice form
- Fields per item: Description, Quantity, Unit Price, Amount (calculated)
- Add row, Delete row actions
- Real-time total calculation

#### Record Payment Modal
- Invoice summary display
- Current balance
- Payment amount input (validated <= balance)
- Payment method dropdown
- Payment date picker
- Reference, Notes (optional)
- Submit button

### 8.3 UI/UX Requirements

**Responsiveness:**
- Mobile-first design
- Tablet and desktop layouts
- Touch-friendly controls

**Performance:**
- Lazy load routes
- Debounced search inputs
- Optimistic UI updates
- Loading states for async operations
- Error boundaries

**Accessibility:**
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation
- Color contrast compliance (WCAG AA)

**User Feedback:**
- Toast notifications for success/error
- Inline validation errors
- Confirmation dialogs for destructive actions
- Loading spinners for all async operations
- Spinner with "Generating PDF..." message for MarkInvoiceAsSent (3-5 second operation)

**Empty States:**
- Placeholder screens with call-to-action buttons when no data exists
- New user with no customers: "Get started by creating your first customer"
- No invoices: "Create your first invoice to get started"
- No payments on invoice: "No payments recorded yet"

### 8.4 Frontend Routing

**Protected Routes** (require authentication):
- `/dashboard` - Main dashboard with summary
- `/customers` - Customer list
- `/customers/new` - Create customer form
- `/customers/:id/edit` - Edit customer form
- `/invoices` - Invoice list
- `/invoices/new` - Create invoice form
- `/invoices/:id` - Invoice detail/view
- `/invoices/:id/edit` - Edit invoice (Draft only)

**Public Routes:**
- `/login` - Redirect to AWS Cognito Hosted UI
- `/signup` - Redirect to AWS Cognito Hosted UI

**Route Guards:**
- All protected routes check for valid JWT token
- Redirect to `/login` if not authenticated
- After login, redirect to `/dashboard`

## 9. Non-Functional Requirements

### 9.1 Performance

**API Latency:**
- Standard CRUD operations: < 200ms (local environment)
- Complex queries (filtered lists): < 500ms
- PDF generation with Invoice-Generator.com (MarkInvoiceAsSent): < 5 seconds total (< 3s API call + < 2s S3 upload)

**Database:**
- Connection pooling (min 5, max 20 connections)
- Query optimization with proper indexes
- Use prepared statements

**Frontend:**
- Initial load time: < 3 seconds
- Time to interactive: < 5 seconds
- Smooth scrolling and animations (60fps)
- No noticeable lag in UI interactions

### 9.2 Scalability

**MVP Target:**
- Support 100 concurrent users
- Handle 10,000 invoices per user
- 1,000 API requests per minute

**Database:**
- Properly indexed queries (including deleted_at for soft delete filtering)
- Pagination for large datasets (default page size: 25, max: 100)
- Soft delete queries use `WHERE deleted_at IS NULL` filter on indexed column

### 9.3 Security

**API Security:**
- JWT-based authentication on all protected endpoints
- Input validation and sanitization (max length, required fields)
- SQL injection prevention (parameterized queries with pg library)
- XSS protection (content security policy headers)
- CORS configuration (whitelist frontend origin: localhost:5173 dev, production domain)
- Rate limiting: 100 requests per minute per IP address globally
- Rate limit response: 429 Too Many Requests with standard Retry-After header
- Use standard Express rate limiting middleware (express-rate-limit)

**Data Protection:**
- HTTPS only (TLS 1.2+)
- Secure password storage (handled by AWS Cognito)
- No sensitive data in logs
- SQL injection protection via ORM/query builder

**Frontend Security:**
- Token stored securely (httpOnly cookie or in-memory)
- CSRF protection for state-changing operations
- Content Security Policy headers
- Input sanitization before rendering

### 9.4 Reliability

**Error Handling:**
- Global error handler middleware
- Consistent error response format
- Graceful degradation
- Error handling for PDF generation (with fallback to retry)

**Logging:**
- Structured logging (JSON format)
- Log levels: ERROR, WARN, INFO, DEBUG
- Include request ID for tracing
- Log rotation and retention

**Monitoring:**
- Health check endpoint: `GET /health`
- Database connectivity check
- AWS service status check

**Data Consistency:**
- Soft delete strategy: Records never physically deleted (deletedAt timestamp set)
- All queries filter `WHERE deleted_at IS NULL` by default
- Balance computed at query time to ensure consistency with payment records
- Rounding: All monetary calculations rounded to 4 decimal places (HALF_UP)
- Timezone: All dates/timestamps stored in UTC
- Display: Dates shown as-is for MVP (UTC interpretation on frontend)

**Audit & Logging:**
- Application logs (console.log for MVP) for all operations
- Error logs include request context (invoice ID, user ID, operation)
- PDF generation logs include API response status
- No separate audit table or domain event system for MVP

### 9.5 Maintainability

**Code Quality:**
- TypeScript strict mode enabled
- ESLint + Prettier configuration
- Consistent naming conventions (camelCase for variables, PascalCase for classes)
- JSDoc comments for public APIs
- Maximum function length: 50 lines
- Maximum file length: 300 lines

**Testing:**
- Unit test coverage: > 80%
- Integration tests for critical paths
- Test naming convention: `describe('feature', () => it('should behavior'))`

**Documentation:**
- README with setup instructions
- Architecture decision records (ADRs)
- API documentation via Swagger
- Inline code comments for complex logic

## 10. Testing Strategy

### 10.1 Unit Tests (Jest)

**Backend:**
- Domain entity behavior (state transitions, invariants)
- Command handlers
- Query handlers
- Value object validation
- Calculation logic (totals, tax amounts, balance)

**Frontend:**
- Vue component logic
- Composables
- Store actions/getters
- Utility functions

**Coverage Target:** 80% for domain and application layers

### 10.2 Integration Tests (Cypress)

**Critical User Flows:**

1. **Complete Invoice Payment Flow**
   - Login
   - Create customer
   - Create invoice (Draft)
   - Add multiple line items
   - Verify total calculation
   - Mark invoice as Sent
   - Record partial payment
   - Verify balance update
   - Record final payment
   - Verify status change to Paid

2. **Invoice Lifecycle**
   - Create Draft invoice
   - Edit line items
   - Delete line items
   - Mark as Sent
   - Verify cannot edit after sending
   - Download PDF

3. **Customer Management**
   - Create customer
   - Update customer details
   - List customers with pagination
   - Delete customer (verify no active invoices)

**API Integration Tests:**
- Test against real PostgreSQL test database
- Seed data before tests
- Clean up after tests
- Test database transactions and rollbacks

### 10.3 Test Data

**Seeding:**
- 10 sample customers
- 20 sample invoices (various statuses)
- 30 line items
- 10 payments

**Factories:**
- CustomerFactory
- InvoiceFactory
- LineItemFactory
- PaymentFactory

## 11. Development Workflow

### 11.1 Project Setup

**Backend:**
```bash
npm init
npm install express pg typescript @types/node axios
npm install @aws-sdk/client-s3 @aws-sdk/client-cognito-identity-provider
npm install --save-dev jest ts-jest @types/jest
npx tsc --init
```

**Frontend:**
```bash
npm create vite@latest invoice-frontend -- --template vue-ts
cd invoice-frontend
npm install vue-router pinia axios
```

### 11.2 Environment Configuration

**.env.example**
```
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/invoice_db

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=xxxxx
AWS_SECRET_ACCESS_KEY=xxxxx
AWS_COGNITO_USER_POOL_ID=us-east-1_xxxxx
AWS_COGNITO_CLIENT_ID=xxxxx
AWS_S3_BUCKET_NAME=invoice-pdfs-bucket

# Invoice Generator API
INVOICE_GENERATOR_API_KEY=xxxxx

# Server
PORT=3000
NODE_ENV=development
```

### 11.3 Git Workflow

**Branch Strategy:**
- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: Feature branches
- `bugfix/*`: Bug fix branches

**Commit Convention:**
- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code refactoring
- `test:` Adding tests
- `docs:` Documentation

### 11.4 Code Review Checklist

- [ ] Follows architectural principles (DDD, CQRS, VSA)
- [ ] Proper layer separation
- [ ] Unit tests included
- [ ] No direct database access from domain layer
- [ ] DTOs used at boundaries
- [ ] Error handling implemented
- [ ] TypeScript types properly defined
- [ ] No any types (except where necessary)
- [ ] API documented in Swagger
- [ ] Integration test for critical path (if applicable)

## 12. Deployment

### 12.1 AWS Infrastructure

**Components:**
- **Compute**: AWS ECS (Fargate) or EC2
- **Database**: AWS RDS PostgreSQL
- **Authentication**: AWS Cognito
- **Storage**: AWS S3 (invoice PDFs)
- **CDN**: CloudFront (frontend static assets)

**Environment:**
- Development
- Staging
- Production

### 12.2 CI/CD Pipeline

**GitHub Actions Workflow:**
1. Trigger on push to `develop` or `main`
2. Install dependencies
3. Run linter
4. Run unit tests
5. Run integration tests
6. Build application
7. Push Docker image to ECR
8. Deploy to ECS (staging/production)

### 12.3 Database Migrations

- Run migrations as part of deployment
- Use migration tool (node-pg-migrate)
- Rollback strategy for failed migrations

## 13. Post-MVP Enhancements

Future iterations may include:

- Multi-tenancy (organizations with multiple users)
- Recurring invoices (subscription billing)
- Email notifications (invoice sent, payment received) via SendGrid/Mailgun
- SMS notifications via Twilio
- Payment gateway integration (Stripe, PayPal, Square)
- Payment receipts PDF generation
- Custom invoice templates and branding
- Bulk operations (batch send, batch delete)
- Expense tracking
- Reporting and analytics dashboard
- Export to CSV/Excel
- Detailed audit logs with separate audit table
- Advanced search and filtering (full-text search)
- API response caching (Redis)
- Real-time updates (WebSockets)
- Mobile app (React Native or Flutter)
- E-invoicing (UBL format) for international compliance

## 14. Success Criteria

The MVP is considered successful when:

1. **Functional Completeness**
   - All core commands and queries implemented
   - User registration/authentication via AWS Cognito functional
   - Users can create customers and invoices (with user ownership enforced)
   - Invoice lifecycle (Draft → Sent → Paid) working correctly
   - Company info, tax rate, notes, and terms fields functioning as user input
   - Payment recording correctly updates computed balance (overpayment blocked)
   - Maximum 100 line items per invoice enforced
   - PDF generation via Invoice-Generator.com API working with all invoice data
   - All calculations rounded to 4 decimal places
   - Soft delete working for customers and Draft invoices
   - Customer email uniqueness enforced including soft-deleted records
   - PDF versioning with timestamped S3 keys maintaining audit trail
   - Global invoice numbering (INV-{sequence}) functioning
   - Pagination defaulting to 25 items per page

2. **Architectural Compliance**
   - Clear separation of Domain, Application, Infrastructure layers
   - CQRS pattern properly implemented
   - Vertical slice organization evident
   - Domain entities contain business logic

3. **Performance**
   - API response times < 200ms for CRUD operations
   - UI interactions smooth and responsive
   - No noticeable lag

4. **Code Quality**
   - Unit test coverage > 80%
   - Integration tests for complete payment flow pass
   - TypeScript strict mode with no errors
   - Swagger documentation complete

5. **User Experience**
   - Users can login, create customers, invoices, and record payments
   - UI is intuitive and responsive
   - Errors are handled gracefully with clear messaging

## 15. Appendices

### Appendix A: Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| CUSTOMER_NOT_FOUND | 404 | Customer with given ID does not exist |
| INVOICE_NOT_FOUND | 404 | Invoice with given ID does not exist |
| PAYMENT_NOT_FOUND | 404 | Payment with given ID does not exist |
| INVALID_STATE_TRANSITION | 400 | Cannot transition invoice to requested state or perform action in current state (e.g., record payment on Draft invoice) |
| PAYMENT_EXCEEDS_BALANCE | 400 | Payment amount exceeds invoice balance (overpayment not allowed) |
| TOO_MANY_LINE_ITEMS | 400 | Invoice cannot have more than 100 line items |
| EMAIL_ALREADY_EXISTS | 409 | Customer email already registered for this user |
| INVALID_TAX_RATE | 400 | Tax rate must be between 0 and 100 |
| UNAUTHORIZED | 401 | Invalid or missing authentication token |
| FORBIDDEN | 403 | User lacks permission for action (resource belongs to different user) |
| VALIDATION_ERROR | 400 | Input validation failed |
| INTERNAL_SERVER_ERROR | 500 | Unexpected server error |

### Appendix B: Glossary

- **Aggregate Root**: The main entity in a cluster of related objects
- **Command**: An instruction to perform a state-changing operation
- **Query**: A request to retrieve data without side effects
- **DTO**: Data Transfer Object, used to transfer data across boundaries
- **Value Object**: An immutable object defined by its attributes
- **Vertical Slice**: A feature that cuts through all architectural layers
- **Invariant**: A business rule that must always be true
- **Soft Delete**: Setting a `deleted_at` timestamp instead of physically removing records

### Appendix C: Out of Scope for MVP

The following features and implementation details are explicitly out of scope for the MVP:

**Features:**
- **Email/SMS Notifications**: No automated emails when invoices sent or payments received
- **Payment Receipts**: No separate receipt PDF generation for payments
- **CSV/Excel Export**: No data export functionality (only individual invoice PDFs)
- **Bulk Operations**: No batch delete, batch send, or batch export
- **API Response Caching**: All data queried fresh from database
- **Custom PDF Templates**: Using Invoice-Generator.com default template only
- **Payment Gateway Integration**: Manual payment recording only (no Stripe/PayPal)
- **Logo Upload**: No company logo upload feature (hardcode in env if needed)

**Implementation Details (Use Industry Best Practices):**
- **Database Transaction Boundaries**: Developers decide which operations need transactions
- **Error Code HTTP Status Mapping**: Use standard REST conventions (404 for not found, 400 for validation, 422 for business rules, 403 for authorization)
- **Middleware Order**: Standard Express order (CORS, auth, rate limit, body parser, routes, error handler)
- **Request ID Generation**: Optional, use middleware if needed
- **Pagination Response Format**: Standard format with page, pageSize, totalItems, totalPages
- **API Versioning**: v1 only, future versions out of scope
- **SQL Injection Prevention**: Use parameterized queries with pg library
- **Input Sanitization**: Basic validation, no complex HTML sanitization needed
- **JWT Public Key Caching**: Cache with reasonable TTL (1 hour)
- **Authorization Check Timing**: Check at controller/handler level before operations
- **State Management**: Use Pinia stores per domain (CustomerStore, InvoiceStore)
- **Form Validation**: Client-side validation with inline errors
- **Navigation After Actions**: Stay on page with success message or redirect to list
- **Test Data Isolation**: Use separate test database with seed data
- **Test Mocking**: Mock external services (Invoice-Generator, S3, Cognito) in tests
- **Environment Config**: Use .env files, separate configs for dev/staging/prod
- **Database Migrations**: Run manually or as deployment step, use node-pg-migrate or similar
- **Monitoring**: Console logging for MVP, structured logging optional
- **S3 Storage Costs**: Accept costs for MVP, optimize later
- **Invoice Number Gaps**: Accept sequence gaps on rollback (normal database behavior)
- **Partial Payment Allocation**: Track total payments only, no per-line-item allocation
- **Customer De-duplication**: Show error "Email already exists" (developers can enhance message)
- **Orphaned Data Cleanup**: Manual cleanup if needed, automated cleanup out of scope
- **Concurrent Edit Conflict Detection**: Last-write-wins, no conflict detection for MVP
- **Zero/Negative Amounts**: Basic validation only (quantity > 0, unitPrice >= 0)
- **Invoice Deletion with PDFs**: Soft delete keeps PDFs, orphaned PDFs acceptable

---

**Document Version:** 1.5  
**Last Updated:** November 8, 2025  
**Status:** Draft  

**Changes in v1.5:**
- **Added comprehensive user registration & authentication flow** (Option B: register endpoint creates both Cognito + DB)
- **Token management**: 1-hour access token, 30-day refresh token, httpOnly cookie storage
- **Password reset**: Handled entirely by AWS Cognito Hosted UI
- **Field validation & limits**: Max 500 chars for companyInfo/terms/description, max 1000 for notes, max 255 for customer name
- **Customer fields**: All address and phone fields now REQUIRED (NOT NULL in schema)
- **Date validation**: IssueDate must be today or past (not future), DueDate >= IssueDate, can create overdue invoices
- **Default values**: IssueDate=today, DueDate=today+30, TaxRate=0, Notes/Terms=empty
- **Payment workflow clarification**: Payments can ONLY be recorded on Sent or Paid invoices, NOT on Draft (enforces Draft → Sent → Payment flow)
- **Search functionality**: Case-insensitive ILIKE search for customers (name/email) and invoices (number/customer name)
- **Frontend routing**: Added complete protected/public route structure (/dashboard, /customers, /invoices, etc.)
- **UI specifications**: Placeholder empty states, spinner with "Generating PDF..." message
- **Rate limiting**: 100 req/min per IP globally, 429 response with Retry-After header
- **Error handling**: Generic "PDF generation failed" message, detailed logs to console
- **Customer address PDF**: Display "N/A" for NULL fields (though all now required)
- **Line item ordering**: Display by created_at, no manual reordering
- **Expanded "Out of Scope"**: Added 20+ implementation details developers can decide using best practices
- **Technology defaults**: Specified pg library for DB, express-rate-limit, standard patterns

**Changes in v1.4:**
- **MAJOR CHANGE**: Switched from pdf-lib to Invoice-Generator.com API for PDF generation
- Added `notes` and `terms` fields to Invoice entity and database schema (optional, TEXT type)
- Updated CreateInvoice and UpdateInvoice commands to include notes and terms
- Removed all domain events from PRD (out of scope for MVP)
- Added rounding specification: all calculations rounded to 4 decimal places
- Updated customer email uniqueness validation to include soft-deleted customers
- Added explicit "Out of Scope for MVP" appendix (email notifications, receipts, exports, bulk ops, caching)
- Updated error handling: console logging for MVP (no complex error message strategy)
- Clarified audit logging: application logs only (domain events removed)
- Added Invoice-Generator.com API setup instructions and TypeScript example
- Updated environment configuration with INVOICE_GENERATOR_API_KEY
- Updated npm dependencies: removed pdf-lib, added axios
- Updated InvoiceDTO to include notes and terms fields
- Performance target adjusted to < 5 seconds for MarkInvoiceAsSent (API call included)

**Changes in v1.3:**
- Confirmed invoice numbers are globally unique (not per-user) - serves as unique identifier
- Changed balance from stored field to computed property (total - SUM(payments.amount))
- Implemented soft delete for customers and invoices (deletedAt timestamp)
- Updated deletion rules: customers can be deleted regardless of invoice associations
- Updated deletion rules: only Draft invoices can be soft deleted
- Implemented PDF versioning with audit trail (pdf_s3_keys array, timestamped filenames)
- PDFs never overwritten or deleted from S3 (kept for compliance)
- Set pagination default to 25 items per page (max 100)
- Changed decimal precision to 4 decimal places (DECIMAL(12,4)) for amounts and quantities
- Clarified timezone handling: all dates/times stored in UTC, displayed as-is for MVP
- Added deleted_at indexes for efficient soft delete filtering
- Updated all queries to filter WHERE deleted_at IS NULL
- Updated S3 key structure to include timestamp for versioning
- Removed balance column from database schema (computed at query time)

**Changes in v1.2:**
- Added User entity and users table for multi-user support
- Clarified invoices and customers belong to specific users
- Changed company information to text field on invoices (not separate table)
- Changed tax from fixed amount to user-entered tax rate (percentage)
- Added tax_amount as calculated field (subtotal * taxRate / 100)
- Specified USD-only currency for MVP
- Added 100 line item maximum per invoice constraint
- Clarified payment cannot exceed invoice balance (overpayment not allowed)
- Updated database schema with user_id foreign keys and constraints
- Updated DTOs to include new fields (userId, companyInfo, taxRate, taxAmount)
- Added new error codes (TOO_MANY_LINE_ITEMS, INVALID_TAX_RATE)
- Updated validation rules and authorization checks for user ownership

**Changes in v1.1:**
- Confirmed pdf-lib as the definitive PDF generation library (removed alternatives)
- Added detailed pdf-lib implementation specifications
- Added TypeScript code example for PDF generation
- Specified template design requirements
- Enhanced error handling and performance considerations for PDF generation