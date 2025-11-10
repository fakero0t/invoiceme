import { Request, Response, NextFunction } from 'express';
import { 
  DomainException, 
  NotFoundException, 
  ValidationException, 
  AuthorizationException 
} from '../../domain/shared/DomainException';

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error for debugging
  console.error('Error:', error);
  
  if (error instanceof NotFoundException) {
    res.status(404).json({
      success: false,
      error: {
        code: error.code,
        message: error.message
      }
    });
    return;
  }
  
  if (error instanceof ValidationException) {
    res.status(400).json({
      success: false,
      error: {
        code: error.code,
        message: error.message
      }
    });
    return;
  }
  
  if (error instanceof AuthorizationException) {
    res.status(403).json({
      success: false,
      error: {
        code: error.code,
        message: 'Access denied'
      }
    });
    return;
  }
  
  if (error instanceof DomainException) {
    res.status(400).json({
      success: false,
      error: {
        code: error.code,
        message: error.message
      }
    });
    return;
  }
  
  // Unexpected error
  console.error('Unexpected error details:');
  console.error('Error name:', error.name);
  console.error('Error message:', error.message);
  console.error('Error stack:', error.stack);
  if ((error as any).cause) {
    console.error('Error cause:', (error as any).cause);
  }
  
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }
  });
};

