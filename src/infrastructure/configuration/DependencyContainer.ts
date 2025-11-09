import 'reflect-metadata';
import { container } from 'tsyringe';
import { Pool } from 'pg';
import { IEventBus } from '../../domain/shared/IEventBus';
import { InMemoryEventBus } from '../messaging/InMemoryEventBus';
import { ICustomerRepository } from '../../domain/customer/ICustomerRepository';
import { PostgreSQLCustomerRepository } from '../database/PostgreSQLCustomerRepository';
import { IInvoiceRepository } from '../../domain/invoice/IInvoiceRepository';
import { PostgreSQLInvoiceRepository } from '../database/PostgreSQLInvoiceRepository';
import { IPaymentRepository } from '../../domain/payment/IPaymentRepository';
import { PostgreSQLPaymentRepository } from '../database/PostgreSQLPaymentRepository';

export function configureDependencies(databasePool: Pool): void {
  // Register database pool
  container.register<Pool>('DatabasePool', { useValue: databasePool });
  
  // Register event bus as singleton
  container.registerSingleton<IEventBus>('IEventBus', InMemoryEventBus);
  
  // Register repositories
  container.registerSingleton<ICustomerRepository>('ICustomerRepository', PostgreSQLCustomerRepository);
  container.registerSingleton<IInvoiceRepository>('IInvoiceRepository', PostgreSQLInvoiceRepository);
  container.registerSingleton<IPaymentRepository>('IPaymentRepository', PostgreSQLPaymentRepository);
  
  // Note: Command and query handlers with @injectable() decorator
  // are automatically resolved by tsyringe - no explicit registration needed
  // thanks to experimentalDecorators and emitDecoratorMetadata in tsconfig.json
}

export { container };

