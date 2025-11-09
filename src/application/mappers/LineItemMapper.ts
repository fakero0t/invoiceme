import { LineItem } from '../../domain/invoice/LineItem';
import { LineItemDTO } from '../dtos/LineItemDTO';

export class LineItemMapper {
  static toDTO(lineItem: LineItem): LineItemDTO {
    return {
      id: lineItem.id,
      invoiceId: lineItem.invoiceId,
      description: lineItem.description,
      quantity: lineItem.quantity,
      unitPrice: lineItem.unitPrice.value,
      amount: lineItem.amount.value,
      createdAt: lineItem.createdAt.toISOString(),
    };
  }
  
  static toDTOList(lineItems: LineItem[]): LineItemDTO[] {
    return lineItems.map(li => this.toDTO(li));
  }
}

