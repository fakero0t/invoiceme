import { LineItem } from './LineItem';
import { Money } from '../shared/Money';

describe('LineItem Entity', () => {
  const validLineItemProps = {
    invoiceId: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Consulting Services',
    quantity: 2,
    unitPrice: 150.50,
  };

  describe('create', () => {
    it('should create line item with valid data', () => {
      const lineItem = LineItem.create(validLineItemProps);

      expect(lineItem.id).toBeDefined();
      expect(lineItem.description).toBe('Consulting Services');
      expect(lineItem.quantity).toBe(2);
      expect(lineItem.unitPrice.value).toBe(150.50);
      expect(lineItem.amount.value).toBe(301); // 2 * 150.50
    });

    it('should generate UUID if not provided', () => {
      const lineItem = LineItem.create(validLineItemProps);
      expect(lineItem.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('should use provided id', () => {
      const customId = '123e4567-e89b-12d3-a456-426614174000';
      const lineItem = LineItem.create({ ...validLineItemProps, id: customId });
      expect(lineItem.id).toBe(customId);
    });

    it('should calculate amount correctly', () => {
      const lineItem = LineItem.create({
        invoiceId: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Product',
        quantity: 3,
        unitPrice: 25.99,
      });
      expect(lineItem.amount.value).toBe(77.97); // 3 * 25.99
    });
  });

  describe('validation - description', () => {
    it('should throw error for empty description', () => {
      expect(() => {
        LineItem.create({ ...validLineItemProps, description: '' });
      }).toThrow('DESCRIPTION_REQUIRED');
    });

    it('should throw error for description longer than 500 characters', () => {
      const longDescription = 'A'.repeat(501);
      expect(() => {
        LineItem.create({ ...validLineItemProps, description: longDescription });
      }).toThrow('DESCRIPTION_TOO_LONG');
    });

    it('should accept description with exactly 500 characters', () => {
      const maxDescription = 'A'.repeat(500);
      const lineItem = LineItem.create({ ...validLineItemProps, description: maxDescription });
      expect(lineItem.description.length).toBe(500);
    });
  });

  describe('validation - quantity', () => {
    it('should throw error for zero quantity', () => {
      expect(() => {
        LineItem.create({ ...validLineItemProps, quantity: 0 });
      }).toThrow('INVALID_QUANTITY');
    });

    it('should throw error for negative quantity', () => {
      expect(() => {
        LineItem.create({ ...validLineItemProps, quantity: -1 });
      }).toThrow('INVALID_QUANTITY');
    });

    it('should accept decimal quantities', () => {
      const lineItem = LineItem.create({ ...validLineItemProps, quantity: 1.5 });
      expect(lineItem.quantity).toBe(1.5);
      expect(lineItem.amount.value).toBeCloseTo(225.75, 2); // 1.5 * 150.50
    });

    it('should accept quantity of 1', () => {
      const lineItem = LineItem.create({ ...validLineItemProps, quantity: 1 });
      expect(lineItem.quantity).toBe(1);
    });

    it('should accept large quantities', () => {
      const lineItem = LineItem.create({ ...validLineItemProps, quantity: 1000 });
      expect(lineItem.quantity).toBe(1000);
      expect(lineItem.amount.value).toBe(150500); // 1000 * 150.50
    });
  });

  describe('validation - unitPrice', () => {
    it('should accept zero unit price', () => {
      const lineItem = LineItem.create({ ...validLineItemProps, unitPrice: 0 });
      expect(lineItem.unitPrice.value).toBe(0);
      expect(lineItem.amount.value).toBe(0);
    });

    it('should throw error for negative unit price', () => {
      expect(() => {
        LineItem.create({ ...validLineItemProps, unitPrice: -10 });
      }).toThrow('INVALID_UNIT_PRICE');
    });

    it('should accept very small prices', () => {
      const lineItem = LineItem.create({ ...validLineItemProps, unitPrice: 0.01 });
      expect(lineItem.unitPrice.value).toBe(0.01);
    });

    it('should accept large prices', () => {
      const lineItem = LineItem.create({ ...validLineItemProps, unitPrice: 99999.99 });
      expect(lineItem.unitPrice.value).toBe(99999.99);
    });
  });

  describe('update', () => {
    it('should update all fields', () => {
      const lineItem = LineItem.create(validLineItemProps);

      lineItem.update({
        description: 'Updated Service',
        quantity: 5,
        unitPrice: 200,
      });

      expect(lineItem.description).toBe('Updated Service');
      expect(lineItem.quantity).toBe(5);
      expect(lineItem.unitPrice.value).toBe(200);
      expect(lineItem.amount.value).toBe(1000); // 5 * 200
    });

    it('should recalculate amount after update', () => {
      const lineItem = LineItem.create({
        invoiceId: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Service',
        quantity: 2,
        unitPrice: 100,
      });
      expect(lineItem.amount.value).toBe(200);

      lineItem.update({
        description: 'Service',
        quantity: 3,
        unitPrice: 150,
      });
      expect(lineItem.amount.value).toBe(450); // 3 * 150
    });

    it('should validate description on update', () => {
      const lineItem = LineItem.create(validLineItemProps);
      expect(() => {
        lineItem.update({
          description: '',
          quantity: 1,
          unitPrice: 100,
        });
      }).toThrow('DESCRIPTION_REQUIRED');
    });

    it('should validate quantity on update', () => {
      const lineItem = LineItem.create(validLineItemProps);
      expect(() => {
        lineItem.update({
          description: 'Service',
          quantity: 0,
          unitPrice: 100,
        });
      }).toThrow('INVALID_QUANTITY');
    });

    it('should validate unit price on update', () => {
      const lineItem = LineItem.create(validLineItemProps);
      expect(() => {
        lineItem.update({
          description: 'Service',
          quantity: 1,
          unitPrice: -10,
        });
      }).toThrow('INVALID_UNIT_PRICE');
    });
  });

  describe('toJSON', () => {
    it('should serialize to plain object', () => {
      const lineItem = LineItem.create(validLineItemProps);
      const json = lineItem.toJSON();

      expect(json.id).toBe(lineItem.id);
      expect(json.description).toBe('Consulting Services');
      expect(json.quantity).toBe(2);
      expect(json.unitPrice).toBe(150.50);
      expect(json.amount).toBe(301);
    });

    it('should preserve Money precision in JSON', () => {
      const lineItem = LineItem.create({
        invoiceId: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Service',
        quantity: 3,
        unitPrice: 33.333,
      });
      const json = lineItem.toJSON();

      expect(json.amount).toBeCloseTo(99.999, 4);
    });
  });

  describe('amount calculation', () => {
    it('should maintain precision in amount calculation', () => {
      const lineItem = LineItem.create({
        invoiceId: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Service',
        quantity: 7,
        unitPrice: 12.34,
      });
      expect(lineItem.amount.value).toBeCloseTo(86.38, 4);
    });

    it('should handle large amounts', () => {
      const lineItem = LineItem.create({
        invoiceId: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Service',
        quantity: 100,
        unitPrice: 9999.99,
      });
      expect(lineItem.amount.value).toBe(999999);
    });
  });
});

