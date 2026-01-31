import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { errorHandler, notFoundHandler } from '../../src/middleware/error-handler.js';
import { AppError, NotFoundError, ValidationError } from '../../src/middleware/errors.js';

describe('Error Handler Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      requestId: 'test-request-id',
      method: 'GET',
      path: '/test',
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();
    // Suppress console.error during tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('errorHandler', () => {
    it('handles AppError with correct status and format', () => {
      const error = new ValidationError('Invalid email', { field: 'email' });

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      const jsonCall = (mockRes.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(jsonCall.error.code).toBe('VALIDATION_ERROR');
      expect(jsonCall.error.message).toBe('Invalid email');
      expect(jsonCall.error.details).toEqual({ field: 'email' });
      expect(jsonCall.error.requestId).toBe('test-request-id');
    });

    it('handles NotFoundError', () => {
      const error = new NotFoundError('User not found');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      const jsonCall = (mockRes.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(jsonCall.error.code).toBe('NOT_FOUND');
      expect(jsonCall.error.message).toBe('User not found');
      expect(jsonCall.error.requestId).toBe('test-request-id');
    });

    it('handles unknown errors as 500 Internal Error', () => {
      const error = new Error('Something went wrong');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      const jsonCall = (mockRes.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(jsonCall.error.code).toBe('INTERNAL_ERROR');
      expect(jsonCall.error.requestId).toBe('test-request-id');
    });

    it('handles JSON syntax errors as 400 Bad Request', () => {
      const error = new SyntaxError('Unexpected token');
      (error as SyntaxError & { body: string }).body = '{ invalid json }';

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: {
          code: 'BAD_REQUEST',
          message: 'Invalid JSON in request body',
          requestId: 'test-request-id',
        },
      });
    });

    it('uses "unknown" when requestId is not set', () => {
      mockReq.requestId = undefined;
      const error = new NotFoundError('Not found');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      const jsonCall = (mockRes.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(jsonCall.error.requestId).toBe('unknown');
    });

    it('logs errors to console', () => {
      const error = new AppError('Test error', 500, 'INTERNAL_ERROR');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('notFoundHandler', () => {
    it('calls next with NotFoundError for unmatched routes', () => {
      notFoundHandler(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = (mockNext as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.message).toBe('Route GET /test not found');
    });
  });
});
