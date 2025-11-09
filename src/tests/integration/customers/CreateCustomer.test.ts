import 'reflect-metadata';
import { Pool } from 'pg';
import { container } from 'tsyringe';
import { CreateCustomerCommandHandler } from '../../../application/commands/customers/CreateCustomer/CreateCustomerCommandHandler';
import { ICustomerRepository } from '../../../domain/customer/ICustomerRepository';
import { PostgreSQLCustomerRepository } from '../../../infrastructure/database/PostgreSQLCustomerRepository';
import { IEventBus } from '../../../domain/shared/IEventBus';
import { InMemoryEventBus } from '../../../infrastructure/messaging/InMemoryEventBus';
import { ValidationException } from '../../../domain/shared/DomainException';

describe('CreateCustomerCommandHandler', () => {
  let pool: Pool;
  let handler: CreateCustomerCommandHandler;
  let eventBus: InMemoryEventBus;
  
  beforeAll(() => {
    // Setup test database pool
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/invoiceme_test',
    });
    
    // Register dependencies
    container.register<Pool>('DatabasePool', { useValue: pool });
    eventBus = new InMemoryEventBus();
    container.register<IEventBus>('IEventBus', { useValue: eventBus });
    container.registerSingleton<ICustomerRepository>('ICustomerRepository', PostgreSQLCustomerRepository);
    
    handler = container.resolve(CreateCustomerCommandHandler);
  });
  
  afterAll(async () => {
    await pool.end();
  });
  
  beforeEach(async () => {
    // Clean up test data
    await pool.query('DELETE FROM customers WHERE user_id = $1', ['test-user-id']);
  });
  
  it('should create customer with valid data', async () => {
    const command = {
      userId: 'test-user-id',
      name: 'John Doe',
      email: 'john@example.com',
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'USA',
      },
      phoneNumber: '+1-555-0100',
    };
    
    const customerId = await handler.handle(command);
    
    expect(customerId).toBeDefined();
    expect(typeof customerId).toBe('string');
    
    // Verify customer was created in database
    const result = await pool.query(
      'SELECT * FROM customers WHERE id = $1',
      [customerId]
    );
    
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].name).toBe('John Doe');
    expect(result.rows[0].email).toBe('john@example.com');
  });
  
  it('should reject duplicate email', async () => {
    const command = {
      userId: 'test-user-id',
      name: 'John Doe',
      email: 'john@example.com',
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'USA',
      },
      phoneNumber: '+1-555-0100',
    };
    
    // Create first customer
    await handler.handle(command);
    
    // Try to create duplicate
    await expect(handler.handle(command)).rejects.toThrow(ValidationException);
    await expect(handler.handle(command)).rejects.toThrow('EMAIL_ALREADY_EXISTS');
  });
  
  it('should publish CustomerCreatedEvent', async () => {
    let eventPublished = false;
    let eventData: any = null;
    
    eventBus.subscribe('customer.created', async (event: any) => {
      eventPublished = true;
      eventData = event;
    });
    
    const command = {
      userId: 'test-user-id',
      name: 'John Doe',
      email: 'john@example.com',
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'USA',
      },
      phoneNumber: '+1-555-0100',
    };
    
    const customerId = await handler.handle(command);
    
    expect(eventPublished).toBe(true);
    expect(eventData).toBeDefined();
    expect(eventData.customerId).toBe(customerId);
    expect(eventData.userId).toBe('test-user-id');
  });
  
  it('should reject invalid email format', async () => {
    const command = {
      userId: 'test-user-id',
      name: 'John Doe',
      email: 'invalid-email',
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'USA',
      },
      phoneNumber: '+1-555-0100',
    };
    
    await expect(handler.handle(command)).rejects.toThrow();
  });
});

