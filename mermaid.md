# InvoiceMe - System Architecture Diagrams

## 1. High-Level System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        FE[Vue.js Frontend<br/>Port: 5173<br/>Vite + TypeScript + Pinia]
    end
    
    subgraph "API Gateway"
        API[Express REST API<br/>Port: 3000<br/>Node.js + TypeScript]
        AUTH[JWT Auth Middleware]
        ROUTES[Route Handlers]
    end
    
    subgraph "Application Layer - CQRS"
        CMD[Command Handlers<br/>Write Operations<br/>Create/Update/Delete]
        QRY[Query Handlers<br/>Read Operations<br/>List/Get]
        DTO[DTOs & Mappers]
    end
    
    subgraph "Domain Layer - DDD"
        CUST[Customer Aggregate<br/>Name, Email, Address]
        INV[Invoice Aggregate<br/>LineItems, Totals]
        PAY[Payment Entity<br/>Amount, Method]
        EVENTS[Domain Events<br/>Event Bus]
    end
    
    subgraph "Infrastructure Layer"
        REPO[Repositories<br/>PostgreSQL]
        EXTERNAL[External Services]
    end
    
    subgraph "AWS Services"
        COGNITO[AWS Cognito<br/>User Authentication]
        S3[AWS S3<br/>PDF Storage]
    end
    
    subgraph "Third Party"
        PDFAPI[Invoice Generator API<br/>PDF Creation]
    end
    
    subgraph "Data Store"
        DB[(PostgreSQL 14+<br/>Migrations + Indexes)]
    end
    
    FE -->|HTTP/REST + JWT| API
    API --> AUTH
    AUTH -->|userId| ROUTES
    ROUTES -->|Write| CMD
    ROUTES -->|Read| QRY
    
    CMD --> CUST
    CMD --> INV
    CMD --> PAY
    QRY --> DTO
    
    CUST --> EVENTS
    INV --> EVENTS
    PAY --> EVENTS
    
    CMD --> REPO
    QRY --> REPO
    REPO --> DB
    
    AUTH -->|Validate Token| COGNITO
    CMD -->|Generate| PDFAPI
    CMD -->|Upload PDF| S3
    EXTERNAL --> COGNITO
    EXTERNAL --> S3
    EXTERNAL --> PDFAPI
    
    style FE fill:#e1f5ff
    style API fill:#fff4e1
    style CMD fill:#ffe1f5
    style QRY fill:#ffe1f5
    style CUST fill:#e1ffe1
    style INV fill:#e1ffe1
    style PAY fill:#e1ffe1
    style DB fill:#f0f0f0
    style COGNITO fill:#ff9900
    style S3 fill:#ff9900
```

## 2. Bounded Contexts & Domain Model

```mermaid
graph TB
    subgraph "Customer Context"
        C1[Customer Aggregate Root]
        C2[CustomerName VO]
        C3[EmailAddress VO]
        C4[Address VO]
        C5[PhoneNumber VO]
        C1 --> C2
        C1 --> C3
        C1 --> C4
        C1 --> C5
    end
    
    subgraph "Invoice Context"
        I1[Invoice Aggregate Root]
        I2[LineItem Entity]
        I3[InvoiceNumber VO]
        I4[Money VO]
        I5[InvoiceStatus VO<br/>Draft/Sent/Paid]
        I1 --> I2
        I1 --> I3
        I1 --> I4
        I1 --> I5
    end
    
    subgraph "Payment Context"
        P1[Payment Entity]
        P2[Money VO]
        P3[PaymentMethod VO<br/>Cash/Check/CC/Bank]
        P1 --> P2
        P1 --> P3
    end
    
    subgraph "User Context"
        U1[AWS Cognito]
        U2[User Profile<br/>JWT Token]
        U1 --> U2
    end
    
    I1 -.->|References| C1
    P1 -.->|References| I1
    C1 -.->|Owned by| U2
    I1 -.->|Owned by| U2
    
    style C1 fill:#e1f5ff
    style I1 fill:#ffe1f5
    style P1 fill:#fff4e1
    style U1 fill:#e1ffe1
```

## 3. CQRS Command Flow (Write Operations)

```mermaid
sequenceDiagram
    participant Client as Vue.js Client
    participant Route as Route Handler
    participant Auth as Auth Middleware
    participant CMD as Command Handler
    participant Domain as Domain Entity
    participant Repo as Repository
    participant DB as PostgreSQL
    participant EventBus as Event Bus
    participant Handler as Event Handler
    
    Client->>+Route: POST/PUT/DELETE Request<br/>(Create/Update/Delete)
    Route->>+Auth: Validate JWT Token
    Auth->>Auth: Verify with Cognito
    Auth->>-Route: userId extracted
    
    Route->>+CMD: Execute Command<br/>(CreateInvoice, AddLineItem)
    CMD->>+Domain: Create/Update Entity
    Domain->>Domain: Validate Business Rules<br/>(Invariants, Constraints)
    Domain-->>CMD: Domain Entity/Aggregate
    
    CMD->>+Repo: Save/Update/Delete
    Repo->>+DB: SQL Transaction BEGIN
    DB->>DB: INSERT/UPDATE/DELETE
    DB-->>-Repo: Success
    Repo-->>-CMD: void
    
    CMD->>+EventBus: Publish Domain Event<br/>(InvoiceCreated, etc)
    EventBus-->>-CMD: Event Queued
    CMD-->>-Route: Result (UUID/void)
    
    EventBus->>Handler: Async Processing<br/>(Logging, Notifications)
    Handler->>Handler: Side Effects
    
    Route-->>-Client: HTTP Response<br/>(201/200/204 + JSON)
```

## 4. CQRS Query Flow (Read Operations)

```mermaid
sequenceDiagram
    participant Client as Vue.js Client
    participant Route as Route Handler
    participant Auth as Auth Middleware
    participant QRY as Query Handler
    participant Repo as Repository
    participant DB as PostgreSQL
    participant Mapper as DTO Mapper
    
    Client->>+Route: GET Request<br/>(List/Get)
    Route->>+Auth: Validate JWT Token
    Auth->>-Route: userId extracted
    
    Route->>+QRY: Execute Query<br/>(ListInvoices, GetCustomer)
    QRY->>+Repo: Find/List with Filters
    Repo->>+DB: SELECT Query<br/>(with userId filter)
    DB-->>-Repo: Raw Database Rows
    
    Repo->>+Mapper: Map to DTO
    Mapper->>Mapper: Transform Data<br/>(Domain → DTO)
    Mapper-->>-Repo: DTO Object(s)
    Repo-->>-QRY: DTO/DTO[]
    
    QRY-->>-Route: Query Result
    Route-->>-Client: HTTP Response<br/>(200 + JSON)
```

## 5. Layered Architecture

```mermaid
graph TB
    subgraph "Presentation Layer"
        P1[Express Routes<br/>/api/customers, /api/invoices, /api/payments]
        P2[Middleware<br/>Auth, Validation, Error]
        P3[Request Validation<br/>Schema Validation]
        P4[Response Formatting<br/>JSON Serialization]
    end
    
    subgraph "Application Layer - CQRS"
        A1[Command Handlers<br/>CreateCustomer, CreateInvoice]
        A2[Query Handlers<br/>ListCustomers, GetInvoice]
        A3[DTOs<br/>CustomerDTO, InvoiceDTO]
        A4[Mappers<br/>Domain → DTO]
    end
    
    subgraph "Domain Layer - DDD"
        D1[Aggregates<br/>Customer, Invoice]
        D2[Entities<br/>LineItem, Payment]
        D3[Value Objects<br/>Money, Email, Address]
        D4[Domain Events<br/>InvoiceCreated, etc]
        D5[Business Rules<br/>Invariants & Validation]
    end
    
    subgraph "Infrastructure Layer"
        I1[Repositories<br/>CustomerRepo, InvoiceRepo]
        I2[Database<br/>PostgreSQL Queries]
        I3[Event Bus<br/>In-Memory Pub/Sub]
        I4[External APIs<br/>Invoice Generator]
        I5[AWS Services<br/>Cognito, S3]
    end
    
    P1 --> P2
    P2 --> P3
    P3 --> A1
    P3 --> A2
    A1 --> D1
    A1 --> D2
    A2 --> I1
    D1 --> D3
    D1 --> D4
    D1 --> D5
    A1 --> I1
    A4 --> A3
    I1 --> I2
    D4 --> I3
    A1 --> I4
    A1 --> I5
    P1 --> P4
    
    style P1 fill:#e1f5ff
    style A1 fill:#ffe1f5
    style A2 fill:#ffe1f5
    style D1 fill:#e1ffe1
    style I1 fill:#fff4e1
```

## 6. Frontend Architecture

```mermaid
graph TB
    subgraph "Vue.js Frontend"
        subgraph "Views"
            V1[Dashboard View<br/>Statistics]
            V2[Customer List/Form]
            V3[Invoice List/Form]
            V4[Payment Form]
            V5[Login Page]
        end
        
        subgraph "Pinia Stores - State Management"
            S1[Auth Store<br/>JWT, User]
            S2[Customer Store<br/>CQRS Commands/Queries]
            S3[Invoice Store<br/>CQRS Commands/Queries]
            S4[Payment Store<br/>CQRS Commands/Queries]
        end
        
        subgraph "Shared Components"
            C1[VButton, VCard, VTable]
            C2[VInput, VSelect, VTextarea]
            C3[VModal, VAlert, VToast]
            C4[VNavbar, VMenu, VDropdown]
        end
        
        subgraph "Application Layer"
            APP1[Command Bus<br/>Execute Write Operations]
            APP2[Query Bus<br/>Execute Read Operations]
        end
        
        subgraph "Infrastructure"
            API[API Client<br/>Axios HTTP]
            AUTH_INT[Auth Interceptor<br/>JWT Injection]
        end
        
        V1 --> S1
        V1 --> S3
        V2 --> S2
        V3 --> S3
        V4 --> S4
        V5 --> S1
        
        V1 --> C1
        V2 --> C2
        V3 --> C3
        V4 --> C4
        
        S2 --> APP1
        S2 --> APP2
        S3 --> APP1
        S3 --> APP2
        S4 --> APP1
        S4 --> APP2
        
        APP1 --> API
        APP2 --> API
        API --> AUTH_INT
    end
    
    AUTH_INT -->|HTTP + JWT| BACKEND[Backend API<br/>Express]
    
    style V1 fill:#e1f5ff
    style S1 fill:#ffe1f5
    style APP1 fill:#e1ffe1
    style API fill:#fff4e1
```

## 7. Database Schema

```mermaid
erDiagram
    USERS ||--o{ CUSTOMERS : owns
    USERS ||--o{ INVOICES : creates
    CUSTOMERS ||--o{ INVOICES : "billed to"
    INVOICES ||--|{ LINE_ITEMS : contains
    INVOICES ||--o{ PAYMENTS : "paid by"
    
    USERS {
        uuid id PK
        string cognito_id UK
        string email UK
        string name
        string password_hash
        timestamp created_at
        timestamp updated_at
    }
    
    CUSTOMERS {
        uuid id PK
        uuid user_id FK
        string name
        string email
        string street
        string city
        string state
        string postal_code
        string country
        string phone_number
        timestamp deleted_at
        timestamp created_at
        timestamp updated_at
    }
    
    INVOICES {
        uuid id PK
        string invoice_number UK
        uuid user_id FK
        uuid customer_id FK
        string company_info
        enum status
        decimal subtotal
        decimal tax_rate
        decimal tax_amount
        decimal total
        text notes
        text terms
        date issue_date
        date due_date
        timestamp sent_date
        timestamp paid_date
        json pdf_s3_keys
        timestamp deleted_at
        timestamp created_at
        timestamp updated_at
    }
    
    LINE_ITEMS {
        uuid id PK
        uuid invoice_id FK
        string description
        decimal quantity
        decimal unit_price
        decimal amount
        timestamp created_at
    }
    
    PAYMENTS {
        uuid id PK
        uuid invoice_id FK
        decimal amount
        enum payment_method
        date payment_date
        string reference
        text notes
        timestamp created_at
    }
```

## 8. Event System

```mermaid
graph LR
    subgraph "Domain Events"
        E1[Customer Events<br/>Created/Updated/Deleted]
        E2[Invoice Events<br/>Created/Sent/Paid]
        E3[LineItem Events<br/>Added/Updated/Removed]
        E4[Payment Events<br/>Recorded]
    end
    
    subgraph "Event Bus"
        EB[In-Memory Event Bus<br/>Async Processing]
    end
    
    subgraph "Event Handlers"
        H1[Logging Handler<br/>Audit Trail]
        H2[Notification Handler<br/>Future: Emails]
        H3[Analytics Handler<br/>Future: Metrics]
    end
    
    E1 --> EB
    E2 --> EB
    E3 --> EB
    E4 --> EB
    
    EB --> H1
    EB --> H2
    EB --> H3
    
    style EB fill:#ffe1f5
    style H1 fill:#e1f5ff
    style H2 fill:#e1f5ff
    style H3 fill:#e1f5ff
```

## 9. Invoice Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Draft: Create Invoice
    Draft --> Draft: Add/Update/Remove Line Items
    Draft --> Sent: Mark as Sent<br/>(must have line items)
    Draft --> [*]: Delete (Soft Delete)
    
    Sent --> Paid: Mark as Paid<br/>(full payment)
    Sent --> Sent: Record Partial Payment
    
    Paid --> [*]: Archive
    
    note right of Draft
        Can modify:
        - Line items
        - Notes, terms
        - Due date
    end note
    
    note right of Sent
        Cannot modify:
        - Line items (frozen)
        Can:
        - Record payments
        - Generate PDF
    end note
    
    note right of Paid
        Read-only
        All payments recorded
    end note
```

## 10. API Endpoints

```mermaid
graph LR
    subgraph "Authentication"
        A1[POST /api/auth/register]
        A2[POST /api/auth/login]
        A3[POST /api/auth/refresh]
        A4[POST /api/auth/logout]
    end
    
    subgraph "Customers"
        C1[GET /api/customers]
        C2[GET /api/customers/:id]
        C3[POST /api/customers]
        C4[PUT /api/customers/:id]
        C5[DELETE /api/customers/:id]
    end
    
    subgraph "Invoices"
        I1[GET /api/invoices]
        I2[GET /api/invoices/:id]
        I3[POST /api/invoices]
        I4[PUT /api/invoices/:id]
        I5[DELETE /api/invoices/:id]
        I6[POST /api/invoices/:id/line-items]
        I7[PUT /api/invoices/:id/line-items/:itemId]
        I8[DELETE /api/invoices/:id/line-items/:itemId]
        I9[POST /api/invoices/:id/send]
        I10[POST /api/invoices/:id/mark-paid]
        I11[POST /api/invoices/:id/generate-pdf]
    end
    
    subgraph "Payments"
        P1[GET /api/payments]
        P2[GET /api/payments/:id]
        P3[POST /api/payments]
        P4[GET /api/invoices/:id/payments]
    end
    
    subgraph "Dashboard"
        D1[GET /api/dashboard/statistics]
    end
    
    style A1 fill:#e1f5ff
    style C1 fill:#ffe1f5
    style I1 fill:#e1ffe1
    style P1 fill:#fff4e1
    style D1 fill:#f0f0f0
```

## 11. Deployment Architecture (Production)

```mermaid
graph TB
    subgraph "Client"
        USER[Web Browser]
    end
    
    subgraph "AWS Infrastructure"
        subgraph "Frontend Hosting"
            CF[CloudFront CDN]
            S3FE[S3 Bucket<br/>Static Vue.js Build]
        end
        
        subgraph "Backend Hosting"
            ALB[Application Load Balancer]
            ECS1[ECS Fargate<br/>API Container 1]
            ECS2[ECS Fargate<br/>API Container 2]
        end
        
        subgraph "Data & Auth"
            RDS[(RDS PostgreSQL<br/>Multi-AZ)]
            COGNITO_PROD[Cognito User Pool]
            S3PDF[S3 Bucket<br/>Invoice PDFs]
        end
        
        subgraph "Monitoring"
            CW[CloudWatch<br/>Logs & Metrics]
        end
    end
    
    subgraph "External"
        PDF_EXT[Invoice Generator API]
    end
    
    USER -->|HTTPS| CF
    CF --> S3FE
    USER -->|API Calls| ALB
    ALB --> ECS1
    ALB --> ECS2
    
    ECS1 --> RDS
    ECS2 --> RDS
    ECS1 --> COGNITO_PROD
    ECS2 --> COGNITO_PROD
    ECS1 --> S3PDF
    ECS2 --> S3PDF
    ECS1 --> PDF_EXT
    ECS2 --> PDF_EXT
    
    ECS1 --> CW
    ECS2 --> CW
    
    style USER fill:#e1f5ff
    style CF fill:#ff9900
    style ALB fill:#ff9900
    style RDS fill:#3b48cc
    style CW fill:#ff9900
```

## 12. Security Architecture

```mermaid
graph TB
    subgraph "Client Security"
        CS1[HTTPS/TLS 1.3]
        CS2[JWT in Memory<br/>No LocalStorage]
        CS3[CSRF Protection]
    end
    
    subgraph "API Security"
        AS1[JWT Validation<br/>Cognito]
        AS2[Rate Limiting]
        AS3[Input Validation<br/>Schema Validation]
        AS4[SQL Injection Prevention<br/>Parameterized Queries]
    end
    
    subgraph "Data Security"
        DS1[Encryption at Rest<br/>RDS/S3]
        DS2[Encryption in Transit<br/>TLS]
        DS3[User Data Isolation<br/>userId Filter]
        DS4[Soft Deletes<br/>Data Retention]
    end
    
    subgraph "AWS Security"
        AWS1[IAM Roles<br/>Least Privilege]
        AWS2[VPC<br/>Private Subnets]
        AWS3[Security Groups<br/>Firewall Rules]
    end
    
    CS1 --> AS1
    CS2 --> AS1
    CS3 --> AS2
    AS1 --> AS3
    AS3 --> AS4
    AS4 --> DS1
    DS1 --> DS2
    DS2 --> DS3
    DS3 --> DS4
    
    AS1 --> AWS1
    DS1 --> AWS2
    AS2 --> AWS3
    
    style AS1 fill:#ff6b6b
    style DS3 fill:#ff6b6b
    style AWS1 fill:#ff9900
```

## Architecture Summary

### Key Architectural Patterns
1. **Domain-Driven Design (DDD)**: Bounded contexts with rich domain models
2. **CQRS**: Separate command/query handlers for read/write optimization
3. **Vertical Slice Architecture**: Feature-based organization
4. **Repository Pattern**: Abstract data access
5. **Event-Driven Architecture**: Domain events for side effects

### Technology Stack
- **Frontend**: Vue.js 3 + TypeScript + Vite + Pinia
- **Backend**: Node.js + TypeScript + Express
- **Database**: PostgreSQL 14+ with migrations
- **Auth**: AWS Cognito (JWT)
- **Storage**: AWS S3
- **PDF**: Invoice Generator API
- **Deployment**: AWS (ECS Fargate, RDS, CloudFront)

### Bounded Contexts
1. **Customer Context**: Customer management
2. **Invoice Context**: Invoice lifecycle + line items
3. **Payment Context**: Payment tracking
4. **User Context**: Authentication (AWS Cognito)

### Performance Features
- Database indexes on frequently queried columns
- Pagination for list operations
- Connection pooling
- CQRS enables read/write scaling
- CDN for static assets

### Security Features
- JWT authentication with AWS Cognito
- User data isolation (userId filtering)
- Parameterized queries (SQL injection prevention)
- TLS/HTTPS encryption
- Input validation
- Rate limiting

