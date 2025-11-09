import { inject, injectable } from 'tsyringe';
import { DownloadInvoicePDFQuery } from './DownloadInvoicePDFQuery';
import { IInvoiceRepository } from '../../../../domain/invoice/IInvoiceRepository';
import { NotFoundException } from '../../../../domain/shared/DomainException';

@injectable()
export class DownloadInvoicePDFQueryHandler {
  constructor(@inject('IInvoiceRepository') private invoiceRepo: IInvoiceRepository) {}
  
  async handle(query: DownloadInvoicePDFQuery): Promise<string> {
    const invoice = await this.invoiceRepo.findById(query.invoiceId, query.userId);
    
    if (!invoice) {
      throw new NotFoundException('INVOICE_NOT_FOUND', 'Invoice not found');
    }
    
    if (invoice.pdfS3Keys.length === 0) {
      throw new NotFoundException('PDF_NOT_FOUND', 'No PDF has been generated for this invoice');
    }
    
    // Return the most recent PDF key
    const latestPdfKey = invoice.pdfS3Keys[invoice.pdfS3Keys.length - 1];
    
    // TODO: Generate S3 signed URL
    // const s3Service = new S3Service();
    // const signedUrl = await s3Service.getSignedUrl(latestPdfKey);
    
    // For now, return the S3 key
    return latestPdfKey;
  }
}

