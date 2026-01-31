/**
 * Standardized error classes for the Sage API.
 * These errors are caught by the error handling middleware and converted to consistent responses.
 */

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'BAD_REQUEST'
  | 'SERVICE_UNAVAILABLE';

export interface ErrorDetails {
  field?: string;
  reason?: string;
  [key: string]: unknown;
}

/**
 * Base application error class.
 * All custom errors should extend this class.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details?: ErrorDetails;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number,
    code: ErrorCode,
    details?: ErrorDetails
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true; // Distinguishes operational errors from programming errors

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request - Invalid request syntax or parameters
 */
export class BadRequestError extends AppError {
  constructor(message = 'Bad request', details?: ErrorDetails) {
    super(message, 400, 'BAD_REQUEST', details);
  }
}

/**
 * 400 Validation Error - Request validation failed
 */
export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details?: ErrorDetails) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

/**
 * 401 Unauthorized - Authentication required or failed
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required', details?: ErrorDetails) {
    super(message, 401, 'UNAUTHORIZED', details);
  }
}

/**
 * 403 Forbidden - Authenticated but not authorized
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden', details?: ErrorDetails) {
    super(message, 403, 'FORBIDDEN', details);
  }
}

/**
 * 404 Not Found - Resource does not exist
 */
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', details?: ErrorDetails) {
    super(message, 404, 'NOT_FOUND', details);
  }
}

/**
 * 409 Conflict - Resource already exists or state conflict
 */
export class ConflictError extends AppError {
  constructor(message = 'Resource conflict', details?: ErrorDetails) {
    super(message, 409, 'CONFLICT', details);
  }
}

/**
 * 429 Rate Limited - Too many requests
 */
export class RateLimitedError extends AppError {
  constructor(message = 'Too many requests', details?: ErrorDetails) {
    super(message, 429, 'RATE_LIMITED', details);
  }
}

/**
 * 503 Service Unavailable - Temporary service issue
 */
export class ServiceUnavailableError extends AppError {
  constructor(message = 'Service temporarily unavailable', details?: ErrorDetails) {
    super(message, 503, 'SERVICE_UNAVAILABLE', details);
  }
}
