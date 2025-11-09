/**
 * Migration: Add Performance Indexes
 * 
 * This migration adds indexes to improve query performance
 * based on common access patterns.
 */

exports.up = async (pgm) => {
  // Customers table indexes
  pgm.createIndex('customers', 'user_id', {
    name: 'idx_customers_user_id',
  });
  
  pgm.createIndex('customers', ['user_id', 'email'], {
    name: 'idx_customers_user_id_email',
  });
  
  pgm.createIndex('customers', ['user_id', 'deleted_at'], {
    name: 'idx_customers_user_id_deleted_at',
    where: 'deleted_at IS NULL', // Partial index for non-deleted customers
  });

  // Invoices table indexes
  pgm.createIndex('invoices', 'user_id', {
    name: 'idx_invoices_user_id',
  });
  
  pgm.createIndex('invoices', ['user_id', 'status'], {
    name: 'idx_invoices_user_id_status',
  });
  
  pgm.createIndex('invoices', ['user_id', 'created_at'], {
    name: 'idx_invoices_user_id_created_at',
  });
  
  pgm.createIndex('invoices', 'customer_id', {
    name: 'idx_invoices_customer_id',
  });
  
  pgm.createIndex('invoices', 'invoice_number', {
    name: 'idx_invoices_invoice_number',
    unique: true,
  });
  
  pgm.createIndex('invoices', ['user_id', 'deleted_at'], {
    name: 'idx_invoices_user_id_deleted_at',
    where: 'deleted_at IS NULL',
  });

  // Line items table indexes
  pgm.createIndex('line_items', 'invoice_id', {
    name: 'idx_line_items_invoice_id',
  });
  
  pgm.createIndex('line_items', ['invoice_id', 'created_at'], {
    name: 'idx_line_items_invoice_id_created_at',
  });

  // Payments table indexes
  pgm.createIndex('payments', 'invoice_id', {
    name: 'idx_payments_invoice_id',
  });
  
  pgm.createIndex('payments', ['invoice_id', 'payment_date'], {
    name: 'idx_payments_invoice_id_payment_date',
  });
  
  pgm.createIndex('payments', 'payment_date', {
    name: 'idx_payments_payment_date',
  });

  // Add comment explaining the indexes
  pgm.sql(`
    COMMENT ON INDEX idx_customers_user_id IS 'Optimize customer lookups by user';
    COMMENT ON INDEX idx_invoices_user_id_status IS 'Optimize invoice filtering by user and status';
    COMMENT ON INDEX idx_invoices_user_id_created_at IS 'Optimize invoice sorting by creation date';
    COMMENT ON INDEX idx_payments_invoice_id IS 'Optimize payment lookups by invoice';
  `);
};

exports.down = async (pgm) => {
  // Drop all indexes in reverse order
  pgm.dropIndex('payments', 'payment_date', { name: 'idx_payments_payment_date', ifExists: true });
  pgm.dropIndex('payments', ['invoice_id', 'payment_date'], { name: 'idx_payments_invoice_id_payment_date', ifExists: true });
  pgm.dropIndex('payments', 'invoice_id', { name: 'idx_payments_invoice_id', ifExists: true });
  
  pgm.dropIndex('line_items', ['invoice_id', 'created_at'], { name: 'idx_line_items_invoice_id_created_at', ifExists: true });
  pgm.dropIndex('line_items', 'invoice_id', { name: 'idx_line_items_invoice_id', ifExists: true });
  
  pgm.dropIndex('invoices', ['user_id', 'deleted_at'], { name: 'idx_invoices_user_id_deleted_at', ifExists: true });
  pgm.dropIndex('invoices', 'invoice_number', { name: 'idx_invoices_invoice_number', ifExists: true });
  pgm.dropIndex('invoices', 'customer_id', { name: 'idx_invoices_customer_id', ifExists: true });
  pgm.dropIndex('invoices', ['user_id', 'created_at'], { name: 'idx_invoices_user_id_created_at', ifExists: true });
  pgm.dropIndex('invoices', ['user_id', 'status'], { name: 'idx_invoices_user_id_status', ifExists: true });
  pgm.dropIndex('invoices', 'user_id', { name: 'idx_invoices_user_id', ifExists: true });
  
  pgm.dropIndex('customers', ['user_id', 'deleted_at'], { name: 'idx_customers_user_id_deleted_at', ifExists: true });
  pgm.dropIndex('customers', ['user_id', 'email'], { name: 'idx_customers_user_id_email', ifExists: true });
  pgm.dropIndex('customers', 'user_id', { name: 'idx_customers_user_id', ifExists: true });
};

