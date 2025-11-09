/* eslint-disable @typescript-eslint/no-var-requires */

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  // Create sequence for invoice numbers starting at 1000
  pgm.createSequence('invoice_number_seq', {
    start: 1000,
    increment: 1,
  });

  // Create invoices table
  pgm.createTable('invoices', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    invoice_number: {
      type: 'varchar(50)',
      notNull: true,
      unique: true,
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
    customer_id: {
      type: 'uuid',
      notNull: true,
      references: 'customers(id)',
      onDelete: 'RESTRICT', // Cannot delete customer if they have invoices
    },
    company_info: {
      type: 'text',
      notNull: false,
    },
    status: {
      type: 'varchar(20)',
      notNull: true,
      default: "'Draft'",
      check: "status IN ('Draft', 'Sent', 'Paid')",
    },
    subtotal: {
      type: 'decimal(12,4)',
      notNull: true,
      default: 0,
    },
    tax_rate: {
      type: 'decimal(5,2)',
      notNull: true,
      default: 0,
      check: 'tax_rate >= 0 AND tax_rate <= 100',
    },
    tax_amount: {
      type: 'decimal(12,4)',
      notNull: true,
      default: 0,
    },
    total: {
      type: 'decimal(12,4)',
      notNull: true,
      default: 0,
    },
    notes: {
      type: 'text',
      notNull: false,
    },
    terms: {
      type: 'text',
      notNull: false,
    },
    issue_date: {
      type: 'date',
      notNull: true,
    },
    due_date: {
      type: 'date',
      notNull: true,
    },
    sent_date: {
      type: 'timestamp',
      notNull: false,
    },
    paid_date: {
      type: 'timestamp',
      notNull: false,
    },
    pdf_s3_keys: {
      type: 'text[]',
      notNull: false,
    },
    deleted_at: {
      type: 'timestamp',
      notNull: false,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('NOW()'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('NOW()'),
    },
  });

  // Add constraint: due_date >= issue_date
  pgm.addConstraint('invoices', 'invoices_due_date_check', {
    check: 'due_date >= issue_date',
  });

  // Create indexes for invoices
  pgm.createIndex('invoices', 'user_id');
  pgm.createIndex('invoices', 'customer_id');
  pgm.createIndex('invoices', 'status');
  pgm.createIndex('invoices', 'invoice_number');
  pgm.createIndex('invoices', 'deleted_at');
  pgm.createIndex('invoices', ['user_id', 'status', 'deleted_at']); // Composite for filtering

  // Create line_items table
  pgm.createTable('line_items', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    invoice_id: {
      type: 'uuid',
      notNull: true,
      references: 'invoices(id)',
      onDelete: 'CASCADE',
    },
    description: {
      type: 'text',
      notNull: true,
    },
    quantity: {
      type: 'decimal(12,4)',
      notNull: true,
      check: 'quantity > 0',
    },
    unit_price: {
      type: 'decimal(12,4)',
      notNull: true,
      check: 'unit_price >= 0',
    },
    amount: {
      type: 'decimal(12,4)',
      notNull: true,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('NOW()'),
    },
  });

  // Create index for line_items
  pgm.createIndex('line_items', 'invoice_id');
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable('line_items');
  pgm.dropTable('invoices');
  pgm.dropSequence('invoice_number_seq');
};
