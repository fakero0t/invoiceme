# AI-Accelerated Development: Building an Enterprise Invoicing System

## Strategic Use of AI in System Design

I spent a few hours upfront picking the right tech stack (AWS, Node.js, Vite/Vue, TypeScript, Postgres) and planning the implementation order. Once I had that locked down, I fed AI a detailed prompt with all the architectural requirements – Domain-Driven Design, CQRS, Vertical Slice Architecture, etc. The AI generated a massive PRD (few thousand lines) that became my blueprint, then broke it down into 6 actionable pull requests. This upfront investment meant the AI actually understood what good architecture looked like instead of just spitting out generic code.

### Tech Stack Selection

After some consideration I decided on this tech stack:

- **AWS** - great for handling hosting, scaling, auth
- **Invoice-generator API** - not use generic pdf generator but already made for invoices
- **Swagger** - for api documentation - easy way to test & document api
- **Node app** - easy to start dev with vite/vue and I knew I could move faster because familiar
- **Typescript server side code** - typing for domain objects
- **Vite/vue with typescript** - typescript for same typing on front and back end
- **Cypress integration tests**
- **Postgres database**

### Initial Planning Prompt

I used these decisions along with the requirements document to develop the following initial prompt to start planning and communicating what I needed to get done to the LLM:

> Let's develop a plan to build a small, production-quality ERP-style invoicing system. This assessment mirrors real-world Software-as-a-Service (SaaS) ERP development, concentrating on core business domains: Customers, Invoices, and Payments. Success requires architectural clarity, separation of concerns, and code quality that aligns with enterprise-level, scalable systems. The system must implement the following core operations, ensuring a clean separation between Commands (mutations) and Queries (reads) as per the CQRS principle:

| Domain Entity | Commands (Write Operations) | Queries (Read Operations) |
|---------------|----------------------------|---------------------------|
| Customer | Create, Update, Delete Customer | Retrieve Customer by ID, List all Customers |
| Invoice | Create (Draft), Update, Mark as Sent, Record Payment | Retrieve Invoice by ID, List Invoices by Status/Customer |
| Payment | Record Payment (Applies to Invoice) | Retrieve Payment by ID, List Payments for an Invoice |

**Core Requirements:**

- **Line Items**: Each Invoice MUST support the association of multiple Line Items (describing services/products, quantity, and unit price)
- **Lifecycle**: Implement the following state transitions: Draft → Sent → Paid
- **Balance Calculation**: Implement robust logic for calculating the running Invoice balance and correctly applying Payments against that balance
- **Authentication**: Basic authentication functionality (e.g., a simple Login screen) is required to secure access to the application data. Authentication should utilize AWS

**Architectural Principles:**

The application architecture is the core of the assessment and MUST adhere to the following principles:

- **Domain-Driven Design (DDD)**: Model the core entities (Customer, Invoice, Payment) as true Domain Objects with rich behavior
- **Command Query Responsibility Segregation (CQRS)**: Implement a clean separation between write operations (Commands) and read operations (Queries)
- **Vertical Slice Architecture (VSA)**: Organize the code around features or use cases (vertical slices) rather than technical layers (horizontal slicing)
- **Layer Separation**: Maintain clear boundaries between the Domain, Application, and Infrastructure layers (Clean Architecture)

**Performance Benchmarks:**

- **API Latency**: API response times for standard CRUD operations MUST be under 200ms in a local testing environment
- **UI Experience**: Smooth and responsive UI interactions without noticeable lag

**Code Quality Standards (Mandatory):**

- **Structure**: Code must be modular, readable, and well-documented
- **Data Transfer**: Use explicit DTOs (Data Transfer Objects) and mappers for boundary crossing (API to Application Layer)
- **Domain Events**: The use of Domain Events is encouraged
- **Consistency**: Consistent naming conventions and clean code organization are required throughout the repository
- **Integration Tests**: MUST implement integration tests to verify end-to-end functionality across key modules (e.g., the complete Customer Payment flow)

**Implementation Stack:**

The stack used is AWS for authentication, deployment, server side services. Use an in-memory event bus and a postgres database for invoice data. DDD will use typescript. Integration tests can be implemented with Cypress. The frontend app will be a typescript Node.js app using Vite with Vue and typescript. Use swagger to develop testable documentation for the API. Make use of the invoice-generator API.

**Initial Task:**

Your job is to develop a PRD and save it in the root of the project. This file can be called `invoice_mvp_prd.md`. This PRD will outline and include only details related to core MVP with basic invoicing. Do not include time constraints or risks sections in this plan.

**Goal**: Get a working app where users can create, view, and pay invoices. Minimal real-time or event-driven complexity.

**Features in this MVP**:
- User authentication
- CRUD for invoices
- Payment status tracking
- Basic API for frontend
- Frontend that displays invoices and allows marking as paid
- Postgres database schema

After implementation we will have a functional MVP where users can manage invoices.

## Iterative Development and Bug Fixing

I worked through each PR with AI as my coding partner. It handled the tedious stuff – boilerplate code, TypeScript typing across frontend and backend, Swagger docs, Cypress tests. When bugs popped up, I'd reference the original PRD to make sure fixes stayed aligned with the architecture. The key was moving sequentially through planned PRs instead of asking AI to build everything at once. Validate, move forward, introduce enhancements, fix issues, repeat.

### AI Accelerated:

- Domain model implementation (Customer, Invoice, Payment entities with proper state transitions)
- CRUD operations with clean command/query separation
- Integration test coverage for end-to-end flows
- Bug resolution while maintaining architectural integrity

## Why It Worked

The combo of upfront planning plus iterative AI execution was the multiplier. AI worked well as my assistant since I gave it guardrails – clear architecture, specific patterns, quality standards – then used it to execute rather than design. The result: production-quality MVP with enterprise architecture in 24hrs, hitting all benchmarks and maintaining code quality because those requirements were in every single AI interaction.

