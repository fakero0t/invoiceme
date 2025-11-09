/* eslint-disable @typescript-eslint/no-var-requires */

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createTable('customers', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
    name: {
      type: 'varchar(255)',
      notNull: true,
    },
    email: {
      type: 'varchar(255)',
      notNull: true,
    },
    street: {
      type: 'varchar(255)',
      notNull: true,
    },
    city: {
      type: 'varchar(100)',
      notNull: true,
    },
    state: {
      type: 'varchar(100)',
      notNull: true,
    },
    postal_code: {
      type: 'varchar(20)',
      notNull: true,
    },
    country: {
      type: 'varchar(100)',
      notNull: true,
    },
    phone_number: {
      type: 'varchar(50)',
      notNull: true,
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

  // Create indexes for better query performance
  pgm.createIndex('customers', 'user_id');
  pgm.createIndex('customers', 'email');
  pgm.createIndex('customers', 'deleted_at');
  
  // Composite index for user's active customers
  pgm.createIndex('customers', ['user_id', 'deleted_at']);
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable('customers');
};
