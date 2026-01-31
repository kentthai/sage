// Error classes
export {
  AppError,
  BadRequestError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  RateLimitedError,
  ServiceUnavailableError,
  type ErrorCode,
  type ErrorDetails,
} from './errors.js';

// Error handling middleware
export { errorHandler, notFoundHandler, type ErrorResponse } from './error-handler.js';

// Request ID middleware
export { requestIdMiddleware } from './request-id.js';
