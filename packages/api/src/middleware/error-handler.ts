import { Request, Response, NextFunction } from 'express';
import { AppError, NotFoundError } from './errors.js';

/**
 * Standardized API error response format.
 */
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    requestId?: string;
    stack?: string;
  };
}

const isDevelopment = process.env.NODE_ENV !== 'production';

/**
 * Global error handling middleware.
 * Catches all errors and returns a standardized JSON response.
 *
 * Must be registered LAST in the middleware chain (after all routes).
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log the error (in production, this would go to a logging service)
  const requestId = req.requestId || 'unknown';
  console.error(`[${requestId}] Error:`, err.message);
  if (isDevelopment) {
    console.error(err.stack);
  }

  // Handle known operational errors
  if (err instanceof AppError) {
    const response: ErrorResponse = {
      error: {
        code: err.code,
        message: err.message,
        requestId,
      },
    };

    if (err.details) {
      response.error.details = err.details;
    }

    if (isDevelopment && err.stack) {
      response.error.stack = err.stack;
    }

    res.status(err.statusCode).json(response);
    return;
  }

  // Handle JSON parsing errors
  if (err instanceof SyntaxError && 'body' in err) {
    const response: ErrorResponse = {
      error: {
        code: 'BAD_REQUEST',
        message: 'Invalid JSON in request body',
        requestId,
      },
    };
    res.status(400).json(response);
    return;
  }

  // Handle unknown errors (programming errors, unexpected issues)
  const response: ErrorResponse = {
    error: {
      code: 'INTERNAL_ERROR',
      message: isDevelopment ? err.message : 'An unexpected error occurred',
      requestId,
    },
  };

  if (isDevelopment && err.stack) {
    response.error.stack = err.stack;
  }

  res.status(500).json(response);
}

/**
 * Middleware to handle 404 Not Found for unmatched routes.
 * Should be registered after all routes but before the error handler.
 */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new NotFoundError(`Route ${req.method} ${req.path} not found`));
}
