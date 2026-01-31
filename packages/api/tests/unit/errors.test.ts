import { describe, it, expect } from 'vitest';
import {
  AppError,
  BadRequestError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  RateLimitedError,
  ServiceUnavailableError,
} from '../../src/middleware/errors.js';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('creates an error with all properties', () => {
      const error = new AppError('Test error', 500, 'INTERNAL_ERROR', { field: 'test' });

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('INTERNAL_ERROR');
      expect(error.details).toEqual({ field: 'test' });
      expect(error.isOperational).toBe(true);
      expect(error.name).toBe('AppError');
      expect(error.stack).toBeDefined();
    });

    it('creates an error without details', () => {
      const error = new AppError('No details', 400, 'BAD_REQUEST');

      expect(error.details).toBeUndefined();
    });
  });

  describe('BadRequestError', () => {
    it('has correct defaults', () => {
      const error = new BadRequestError();

      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('BAD_REQUEST');
      expect(error.message).toBe('Bad request');
    });

    it('accepts custom message and details', () => {
      const error = new BadRequestError('Invalid input', { field: 'email' });

      expect(error.message).toBe('Invalid input');
      expect(error.details).toEqual({ field: 'email' });
    });
  });

  describe('ValidationError', () => {
    it('has correct defaults', () => {
      const error = new ValidationError();

      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Validation failed');
    });

    it('accepts custom message and details', () => {
      const error = new ValidationError('Email is invalid', { field: 'email', reason: 'format' });

      expect(error.message).toBe('Email is invalid');
      expect(error.details).toEqual({ field: 'email', reason: 'format' });
    });
  });

  describe('UnauthorizedError', () => {
    it('has correct defaults', () => {
      const error = new UnauthorizedError();

      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('UNAUTHORIZED');
      expect(error.message).toBe('Authentication required');
    });
  });

  describe('ForbiddenError', () => {
    it('has correct defaults', () => {
      const error = new ForbiddenError();

      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('FORBIDDEN');
      expect(error.message).toBe('Access forbidden');
    });
  });

  describe('NotFoundError', () => {
    it('has correct defaults', () => {
      const error = new NotFoundError();

      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
      expect(error.message).toBe('Resource not found');
    });

    it('accepts custom message', () => {
      const error = new NotFoundError('User not found');

      expect(error.message).toBe('User not found');
    });
  });

  describe('ConflictError', () => {
    it('has correct defaults', () => {
      const error = new ConflictError();

      expect(error.statusCode).toBe(409);
      expect(error.code).toBe('CONFLICT');
      expect(error.message).toBe('Resource conflict');
    });
  });

  describe('RateLimitedError', () => {
    it('has correct defaults', () => {
      const error = new RateLimitedError();

      expect(error.statusCode).toBe(429);
      expect(error.code).toBe('RATE_LIMITED');
      expect(error.message).toBe('Too many requests');
    });
  });

  describe('ServiceUnavailableError', () => {
    it('has correct defaults', () => {
      const error = new ServiceUnavailableError();

      expect(error.statusCode).toBe(503);
      expect(error.code).toBe('SERVICE_UNAVAILABLE');
      expect(error.message).toBe('Service temporarily unavailable');
    });
  });
});
