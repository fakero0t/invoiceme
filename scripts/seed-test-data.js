const { Pool } = require('pg');
const { randomUUID } = require('crypto');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const TEST_USER_EMAIL = 'test@test.com';
const TEST_USER_NAME = 'Test User';

// Test customers data
const customers = [
  {
    name: 'Acme Corporation',
    email: 'contact@acme.com',
    street: '123 Business Ave',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94102',
    country: 'United States',
    phoneNumber: '+1-415-555-0101',
  },
  {
    name: 'Tech Solutions Inc',
    email: 'info@techsolutions.com',
    street: '456 Tech Boulevard',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'United States',
    phoneNumber: '+1-212-555-0202',
  },
  {
    name: 'Design Studio',
    email: 'hello@designstudio.com',
    street: '789 Creative Street',
    city: 'Los Angeles',
    state: 'CA',
    postalCode: '90001',
    country: 'United States',
    phoneNumber: '+1-310-555-0303',
  },
  {
    name: 'Marketing Agency',
    email: 'team@marketingagency.com',
    street: '321 Marketing Way',
    city: 'Chicago',
    state: 'IL',
    postalCode: '60601',
    country: 'United States',
    phoneNumber: '+1-312-555-0404',
  },
  {
    name: 'Global Industries',
    email: 'contact@globalindustries.com',
    street: '654 Industry Drive',
    city: 'Houston',
    state: 'TX',
    postalCode: '77001',
    country: 'United States',
    phoneNumber: '+1-713-555-0505',
  },
  {
    name: 'Creative Works',
    email: 'info@creativeworks.com',
    street: '987 Innovation Lane',
    city: 'Seattle',
    state: 'WA',
    postalCode: '98101',
    country: 'United States',
    phoneNumber: '+1-206-555-0606',
  },
];

// Helper function to get date N days ago
function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

// Helper function to get date N days from now
function daysFromNow(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

// Helper function to get current month start
function currentMonthStart() {
  const date = new Date();
  date.setDate(1);
  return date.toISOString().split('T')[0];
}

async function seedTestData() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    console.log('🌱 Starting test data seed...');

    // 1. Find or create test user
    let userResult = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [TEST_USER_EMAIL]
    );

    let userId;
    if (userResult.rows.length === 0) {
      // Use fixed UUID to match auth middleware mock user
      userId = '00000000-0000-0000-0000-000000000001';
      await client.query(
        'INSERT INTO users (id, email, name, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())',
        [userId, TEST_USER_EMAIL, TEST_USER_NAME]
      );
      console.log(`✅ Created test user: ${TEST_USER_EMAIL} (${userId})`);
    } else {
      userId = userResult.rows[0].id;
      console.log(`✅ Found existing test user: ${TEST_USER_EMAIL} (${userId})`);
    }

    // Check if data already exists
    const existingInvoices = await client.query(
      'SELECT COUNT(*) FROM invoices WHERE user_id = $1',
      [userId]
    );
    
    if (parseInt(existingInvoices.rows[0].count) > 0) {
      console.log('⚠️  Test data already exists. Deleting existing data...');
      // Delete in reverse order of dependencies
      await client.query('DELETE FROM payments WHERE invoice_id IN (SELECT id FROM invoices WHERE user_id = $1)', [userId]);
      await client.query('DELETE FROM line_items WHERE invoice_id IN (SELECT id FROM invoices WHERE user_id = $1)', [userId]);
      await client.query('DELETE FROM invoices WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM customers WHERE user_id = $1', [userId]);
    }

    // 2. Create customers
    const customerIds = [];
    for (const customer of customers) {
      const customerId = randomUUID();
      await client.query(
        `INSERT INTO customers (id, user_id, name, email, street, city, state, postal_code, country, phone_number, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
        [
          customerId,
          userId,
          customer.name,
          customer.email,
          customer.street,
          customer.city,
          customer.state,
          customer.postalCode,
          customer.country,
          customer.phoneNumber,
        ]
      );
      customerIds.push(customerId);
    }
    console.log(`✅ Created ${customerIds.length} customers`);

    // 3. Create invoices
    const invoiceIds = [];
    const now = new Date();
    const currentMonth = currentMonthStart();

    // Get next invoice number
    const invoiceNumberResult = await client.query(
      "SELECT nextval('invoice_number_seq') as next_num"
    );
    let invoiceNumber = parseInt(invoiceNumberResult.rows[0].next_num);

    // 2 Draft invoices
    for (let i = 0; i < 2; i++) {
      const invoiceId = randomUUID();
      const issueDate = daysAgo(5 - i);
      const dueDate = daysFromNow(30);
      const subtotal = 1500 + (i * 500);
      const taxRate = 8.5;
      const taxAmount = subtotal * (taxRate / 100);
      const total = subtotal + taxAmount;

      await client.query(
        `INSERT INTO invoices (id, invoice_number, user_id, customer_id, status, subtotal, tax_rate, tax_amount, total, issue_date, due_date, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`,
        [
          invoiceId,
          `INV-${invoiceNumber++}`,
          userId,
          customerIds[i % customerIds.length],
          'Draft',
          subtotal,
          taxRate,
          taxAmount,
          total,
          issueDate,
          dueDate,
        ]
      );

      // Add line items
      const lineItem1Id = randomUUID();
      const lineItem2Id = randomUUID();
      // Note: PostgreSQLInvoiceRepository uses invoice_line_items, but migration creates line_items
      // Using line_items to match the actual table created by migration
      await client.query(
        'INSERT INTO line_items (id, invoice_id, description, quantity, unit_price, amount, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())',
        [lineItem1Id, invoiceId, 'Service Item 1', 10, subtotal * 0.6 / 10, subtotal * 0.6]
      );
      await client.query(
        'INSERT INTO line_items (id, invoice_id, description, quantity, unit_price, amount, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())',
        [lineItem2Id, invoiceId, 'Service Item 2', 5, subtotal * 0.4 / 5, subtotal * 0.4]
      );

      invoiceIds.push({ id: invoiceId, status: 'Draft', total, customerId: customerIds[i % customerIds.length] });
    }

    // 8 Sent invoices
    for (let i = 0; i < 8; i++) {
      const invoiceId = randomUUID();
      const issueDate = daysAgo(30 - (i * 3));
      const dueDate = daysAgo(15 - (i * 3));
      const sentDate = new Date(issueDate);
      sentDate.setHours(10, 0, 0, 0);
      const subtotal = 2000 + (i * 300);
      const taxRate = 9.0;
      const taxAmount = subtotal * (taxRate / 100);
      const total = subtotal + taxAmount;

      await client.query(
        `INSERT INTO invoices (id, invoice_number, user_id, customer_id, status, subtotal, tax_rate, tax_amount, total, issue_date, due_date, sent_date, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())`,
        [
          invoiceId,
          `INV-${invoiceNumber++}`,
          userId,
          customerIds[i % customerIds.length],
          'Sent',
          subtotal,
          taxRate,
          taxAmount,
          total,
          issueDate,
          dueDate,
          sentDate,
        ]
      );

      // Add line items
      const lineItem1Id = randomUUID();
      const lineItem2Id = randomUUID();
      await client.query(
        'INSERT INTO line_items (id, invoice_id, description, quantity, unit_price, amount, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())',
        [lineItem1Id, invoiceId, 'Professional Services', 15, subtotal * 0.7 / 15, subtotal * 0.7]
      );
      await client.query(
        'INSERT INTO line_items (id, invoice_id, description, quantity, unit_price, amount, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())',
        [lineItem2Id, invoiceId, 'Consulting Hours', 8, subtotal * 0.3 / 8, subtotal * 0.3]
      );

      invoiceIds.push({ id: invoiceId, status: 'Sent', total, customerId: customerIds[i % customerIds.length], dueDate });
    }

    // 5 Paid invoices
    for (let i = 0; i < 5; i++) {
      const invoiceId = randomUUID();
      const issueDate = daysAgo(60 - (i * 10));
      const dueDate = daysAgo(30 - (i * 10));
      const sentDate = new Date(issueDate);
      sentDate.setHours(10, 0, 0, 0);
      const paidDate = new Date(dueDate);
      paidDate.setDate(paidDate.getDate() + 2);
      const subtotal = 3000 + (i * 400);
      const taxRate = 9.5;
      const taxAmount = subtotal * (taxRate / 100);
      const total = subtotal + taxAmount;

      await client.query(
        `INSERT INTO invoices (id, invoice_number, user_id, customer_id, status, subtotal, tax_rate, tax_amount, total, issue_date, due_date, sent_date, paid_date, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())`,
        [
          invoiceId,
          `INV-${invoiceNumber++}`,
          userId,
          customerIds[i % customerIds.length],
          'Paid',
          subtotal,
          taxRate,
          taxAmount,
          total,
          issueDate,
          dueDate,
          sentDate,
          paidDate,
        ]
      );

      // Add line items
      const lineItem1Id = randomUUID();
      const lineItem2Id = randomUUID();
      const lineItem3Id = randomUUID();
      await client.query(
        'INSERT INTO line_items (id, invoice_id, description, quantity, unit_price, amount, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())',
        [lineItem1Id, invoiceId, 'Project Deliverable 1', 20, subtotal * 0.5 / 20, subtotal * 0.5]
      );
      await client.query(
        'INSERT INTO line_items (id, invoice_id, description, quantity, unit_price, amount, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())',
        [lineItem2Id, invoiceId, 'Project Deliverable 2', 12, subtotal * 0.3 / 12, subtotal * 0.3]
      );
      await client.query(
        'INSERT INTO line_items (id, invoice_id, description, quantity, unit_price, amount, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())',
        [lineItem3Id, invoiceId, 'Support Services', 10, subtotal * 0.2 / 10, subtotal * 0.2]
      );

      invoiceIds.push({ id: invoiceId, status: 'Paid', total, customerId: customerIds[i % customerIds.length] });
    }

    // 3 Overdue invoices
    for (let i = 0; i < 3; i++) {
      const invoiceId = randomUUID();
      const issueDate = daysAgo(90 - (i * 15));
      const dueDate = daysAgo(45 - (i * 15)); // Past due
      const sentDate = new Date(issueDate);
      sentDate.setHours(10, 0, 0, 0);
      const subtotal = 2500 + (i * 500);
      const taxRate = 8.75;
      const taxAmount = subtotal * (taxRate / 100);
      const total = subtotal + taxAmount;

      await client.query(
        `INSERT INTO invoices (id, invoice_number, user_id, customer_id, status, subtotal, tax_rate, tax_amount, total, issue_date, due_date, sent_date, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())`,
        [
          invoiceId,
          `INV-${invoiceNumber++}`,
          userId,
          customerIds[i % customerIds.length],
          'Sent',
          subtotal,
          taxRate,
          taxAmount,
          total,
          issueDate,
          dueDate,
          sentDate,
        ]
      );

      // Add line items
      const lineItem1Id = randomUUID();
      const lineItem2Id = randomUUID();
      await client.query(
        'INSERT INTO line_items (id, invoice_id, description, quantity, unit_price, amount, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())',
        [lineItem1Id, invoiceId, 'Overdue Service 1', 18, subtotal * 0.6 / 18, subtotal * 0.6]
      );
      await client.query(
        'INSERT INTO line_items (id, invoice_id, description, quantity, unit_price, amount, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())',
        [lineItem2Id, invoiceId, 'Overdue Service 2', 7, subtotal * 0.4 / 7, subtotal * 0.4]
      );

      invoiceIds.push({ id: invoiceId, status: 'Sent', total, customerId: customerIds[i % customerIds.length], dueDate });
    }

    console.log(`✅ Created ${invoiceIds.length} invoices`);

    // 4. Create payments
    const paymentMethods = ['Cash', 'Check', 'CreditCard', 'BankTransfer'];
    let paymentCount = 0;

    // 4 payments in current month (for paidThisMonth stat)
    const sentInvoices = invoiceIds.filter(inv => inv.status === 'Sent' && !inv.dueDate || new Date(inv.dueDate) > new Date());
    for (let i = 0; i < 4 && i < sentInvoices.length; i++) {
      const invoice = sentInvoices[i];
      const paymentId = randomUUID();
      const paymentAmount = invoice.total * 0.6; // Partial payment
      const paymentDate = daysAgo(15 - i * 3); // Within current month

      await client.query(
        `INSERT INTO payments (id, invoice_id, amount, payment_method, payment_date, reference, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [
          paymentId,
          invoice.id,
          paymentAmount,
          paymentMethods[i % paymentMethods.length],
          paymentDate,
          `REF-${1000 + paymentCount++}`,
        ]
      );
    }

    // 4 payments for paid invoices (full payments)
    const paidInvoices = invoiceIds.filter(inv => inv.status === 'Paid');
    for (let i = 0; i < 4 && i < paidInvoices.length; i++) {
      const invoice = paidInvoices[i];
      const paymentId = randomUUID();
      const paymentDate = daysAgo(25 - i * 5); // Various dates

      await client.query(
        `INSERT INTO payments (id, invoice_id, amount, payment_method, payment_date, reference, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [
          paymentId,
          invoice.id,
          invoice.total, // Full payment
          paymentMethods[(i + 1) % paymentMethods.length],
          paymentDate,
          `REF-${2000 + paymentCount++}`,
        ]
      );
    }

    // 2 more payments for sent invoices (partial)
    for (let i = 4; i < 6 && i < sentInvoices.length; i++) {
      const invoice = sentInvoices[i];
      const paymentId = randomUUID();
      const paymentAmount = invoice.total * 0.5; // Partial payment
      const paymentDate = daysAgo(60 - i * 10); // Older dates

      await client.query(
        `INSERT INTO payments (id, invoice_id, amount, payment_method, payment_date, reference, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [
          paymentId,
          invoice.id,
          paymentAmount,
          paymentMethods[i % paymentMethods.length],
          paymentDate,
          `REF-${3000 + paymentCount++}`,
        ]
      );
    }

    console.log(`✅ Created ${paymentCount} payments`);

    await client.query('COMMIT');
    console.log('✅ Test data seeded successfully!');
    console.log(`   User: ${TEST_USER_EMAIL}`);
    console.log(`   Customers: ${customerIds.length}`);
    console.log(`   Invoices: ${invoiceIds.length}`);
    console.log(`   Payments: ${paymentCount}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding test data:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run if executed directly
if (require.main === module) {
  seedTestData()
    .then(() => {
      console.log('✅ Seed script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seed script failed:', error);
      process.exit(1);
    });
}

module.exports = { seedTestData };

