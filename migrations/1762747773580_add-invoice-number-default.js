/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  // First, sync the sequence with any existing invoice numbers
  pgm.sql(`
    SELECT setval('invoice_number_seq', 
      COALESCE(
        (SELECT MAX(CAST(SUBSTRING(invoice_number FROM 5) AS INTEGER)) 
         FROM invoices 
         WHERE invoice_number ~ '^INV-[0-9]+$'), 
        1000
      ),
      true
    );
  `);

  // Add DEFAULT value to invoice_number column
  pgm.sql(`
    ALTER TABLE invoices 
      ALTER COLUMN invoice_number 
      SET DEFAULT ('INV-' || nextval('invoice_number_seq')::text);
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  // Remove the DEFAULT value
  pgm.sql(`
    ALTER TABLE invoices 
      ALTER COLUMN invoice_number 
      DROP DEFAULT;
  `);
};
