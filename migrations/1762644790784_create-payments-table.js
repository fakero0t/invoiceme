/* eslint-disable @typescript-eslint/no-var-requires */

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  // Create payments table
  pgm.createTable('payments', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    invoice_id: {
      type: 'uuid',
      notNull: true,
      references: 'invoices(id)',
      onDelete: 'RESTRICT', // Cannot delete invoice if it has payments
    },
    amount: {
      type: 'decimal(12,4)',
      notNull: true,
      check: 'amount > 0',
    },
    payment_method: {
      type: 'varchar(50)',
      notNull: true,
      check: "payment_method IN ('Cash', 'Check', 'CreditCard', 'BankTransfer')",
    },
    payment_date: {
      type: 'date',
      notNull: true,
    },
    reference: {
      type: 'varchar(255)',
      notNull: false,
    },
    notes: {
      type: 'text',
      notNull: false,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('NOW()'),
    },
  });

  // Create indexes
  pgm.createIndex('payments', 'invoice_id');
  pgm.createIndex('payments', 'payment_date');
  pgm.createIndex('payments', ['invoice_id', 'payment_date']); // Composite for sorting payments by invoice
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable('payments');
};
