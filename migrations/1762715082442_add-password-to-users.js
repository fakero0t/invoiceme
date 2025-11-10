/* eslint-disable @typescript-eslint/no-var-requires */

/**
 * Add password_hash column to users table for local authentication
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  // Add password_hash column
  pgm.addColumn('users', {
    password_hash: {
      type: 'varchar(255)',
      notNull: false, // Allow null initially for migration
    },
  });

  // After deployment, we'll set notNull: true once all users have passwords
  // For MVP, we can truncate existing users and require re-registration
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropColumn('users', 'password_hash');
};

