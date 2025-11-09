import swaggerJsdoc from 'swagger-jsdoc';

const getOptions = (): swaggerJsdoc.Options => {
  // Import config lazily to avoid circular dependency
  const { config } = require('./env');
  
  return {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Invoice MVP API',
        version: '1.0.0',
        description:
          'Invoice management system API with authentication, customers, invoices, and payments',
        contact: {
          name: 'API Support',
        },
      },
      servers: [
        {
          url: `http://localhost:${config.PORT}/api/v1`,
          description: 'Development server',
        },
      ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token from login/signup response',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'INVALID_INPUT',
            },
          },
        },
        Customer: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            userId: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
              example: 'John Doe',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com',
            },
            address: {
              type: 'object',
              properties: {
                street: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                postalCode: { type: 'string' },
                country: { type: 'string' },
              },
            },
            phoneNumber: {
              type: 'string',
              example: '+1234567890',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Invoice: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            invoiceNumber: {
              type: 'string',
              example: 'INV-1000',
            },
            userId: {
              type: 'string',
              format: 'uuid',
            },
            customerId: {
              type: 'string',
              format: 'uuid',
            },
            companyInfo: {
              type: 'string',
            },
            status: {
              type: 'string',
              enum: ['Draft', 'Sent', 'Paid'],
            },
            lineItems: {
              type: 'array',
              items: { $ref: '#/components/schemas/LineItem' },
            },
            subtotal: {
              type: 'number',
              format: 'decimal',
              example: 100.0,
            },
            taxRate: {
              type: 'number',
              example: 7,
            },
            taxAmount: {
              type: 'number',
              format: 'decimal',
              example: 7.0,
            },
            total: {
              type: 'number',
              format: 'decimal',
              example: 107.0,
            },
            notes: {
              type: 'string',
            },
            terms: {
              type: 'string',
            },
            issueDate: {
              type: 'string',
              format: 'date',
            },
            dueDate: {
              type: 'string',
              format: 'date',
            },
            sentDate: {
              type: 'string',
              format: 'date-time',
              nullable: true,
            },
            paidDate: {
              type: 'string',
              format: 'date-time',
              nullable: true,
            },
            pdfS3Keys: {
              type: 'array',
              items: { type: 'string' },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        LineItem: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            invoiceId: {
              type: 'string',
              format: 'uuid',
            },
            description: {
              type: 'string',
              example: 'Web Development Services',
            },
            quantity: {
              type: 'number',
              example: 10,
            },
            unitPrice: {
              type: 'number',
              example: 100.0,
            },
            amount: {
              type: 'number',
              example: 1000.0,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Payment: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            invoiceId: {
              type: 'string',
              format: 'uuid',
            },
            amount: {
              type: 'number',
              example: 50.0,
            },
            paymentMethod: {
              type: 'string',
              enum: ['Cash', 'Check', 'CreditCard', 'BankTransfer'],
            },
            paymentDate: {
              type: 'string',
              format: 'date',
            },
            reference: {
              type: 'string',
              example: 'CHK-12345',
            },
            notes: {
              type: 'string',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {},
            },
            totalCount: {
              type: 'integer',
            },
            page: {
              type: 'integer',
            },
            pageSize: {
              type: 'integer',
            },
            totalPages: {
              type: 'integer',
            },
          },
        },
      },
    },
      security: [
        {
          BearerAuth: [],
        },
      ],
    },
    apis: ['./src/features/**/*.ts', './src/shared/**/*.ts'],
  };
};

export const getSwaggerSpec = () => swaggerJsdoc(getOptions());

