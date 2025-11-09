import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../../config/env';

/**
 * Service for uploading and managing PDFs in AWS S3
 */
export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.s3Client = new S3Client({
      region: config.AWS_REGION,
      credentials: {
        accessKeyId: config.AWS_ACCESS_KEY_ID,
        secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
      },
    });
    this.bucketName = config.AWS_S3_BUCKET_NAME;
  }

  /**
   * Upload PDF buffer to S3
   */
  async uploadPDF(pdfBuffer: Buffer, invoiceId: string): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const timestamp = Date.now();
    const key = `invoices/${year}/${month}/${invoiceId}_${timestamp}.pdf`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: pdfBuffer,
      ContentType: 'application/pdf',
    });

    await this.s3Client.send(command);
    console.info(`PDF uploaded to S3: ${key}`);

    return key;
  }

  /**
   * Upload PDF with retry logic (3 attempts with exponential backoff)
   */
  async uploadPDFWithRetry(
    pdfBuffer: Buffer,
    invoiceId: string
  ): Promise<string> {
    const maxAttempts = 3;
    const backoffMs = [1000, 2000, 4000];

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await this.uploadPDF(pdfBuffer, invoiceId);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        console.error(
          `S3 upload failed (attempt ${attempt}/${maxAttempts})`,
          {
            invoiceId,
            error: errorMessage,
          }
        );

        if (attempt < maxAttempts) {
          await this.delay(backoffMs[attempt - 1]);
        } else {
          throw new Error('S3_UPLOAD_FAILED');
        }
      }
    }

    // TypeScript needs this, but it will never reach here
    throw new Error('S3_UPLOAD_FAILED');
  }

  /**
   * Generate pre-signed download URL (15 minute expiration)
   */
  async getDownloadUrl(s3Key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
    });

    const signedUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 900, // 15 minutes
    });

    return signedUrl;
  }

  /**
   * Delay helper for retry backoff
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

