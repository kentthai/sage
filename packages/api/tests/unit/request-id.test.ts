import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { requestIdMiddleware } from '../../src/middleware/request-id.js';

describe('Request ID Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockRes = {
      setHeader: vi.fn(),
    };
    mockNext = vi.fn();
  });

  it('generates a UUID request ID when none provided', () => {
    requestIdMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockReq.requestId).toBeDefined();
    expect(mockReq.requestId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
    expect(mockRes.setHeader).toHaveBeenCalledWith('X-Request-ID', mockReq.requestId);
    expect(mockNext).toHaveBeenCalled();
  });

  it('uses existing X-Request-ID header if provided', () => {
    const existingId = 'client-provided-id-123';
    mockReq.headers = { 'x-request-id': existingId };

    requestIdMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockReq.requestId).toBe(existingId);
    expect(mockRes.setHeader).toHaveBeenCalledWith('X-Request-ID', existingId);
    expect(mockNext).toHaveBeenCalled();
  });

  it('sets the X-Request-ID response header', () => {
    requestIdMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.setHeader).toHaveBeenCalledWith('X-Request-ID', expect.any(String));
  });

  it('calls next() to continue the middleware chain', () => {
    requestIdMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
  });
});
