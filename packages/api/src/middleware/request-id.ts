import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

// Extend Express Request type to include requestId
declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

/**
 * Middleware that assigns a unique request ID to each incoming request.
 * The ID is used for request tracing and included in error responses.
 *
 * If the client sends an X-Request-ID header, it will be used instead
 * of generating a new one.
 */
export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const requestId = (req.headers['x-request-id'] as string) || randomUUID();
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
}
