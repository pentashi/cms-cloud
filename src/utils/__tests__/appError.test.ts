import { AppError, ValidationError, NotFoundError, UnauthorizedError, ConflictError } from '../appError';

describe('AppError', () => {
  describe('AppError', () => {
    it('should create an AppError with message and default statusCode', () => {
      const error = new AppError('Something went wrong');
      expect(error.message).toBe('Something went wrong');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
    });

    it('should create an AppError with custom statusCode', () => {
      const error = new AppError('Forbidden', 403);
      expect(error.statusCode).toBe(403);
    });

    it('should be instanceof Error', () => {
      const error = new AppError('Test');
      expect(error instanceof Error).toBe(true);
    });
  });

  describe('ValidationError', () => {
    it('should create a ValidationError with 400 status code', () => {
      const error = new ValidationError('Invalid input');
      expect(error.message).toBe('Invalid input');
      expect(error.statusCode).toBe(400);
    });

    it('should include details property', () => {
      const details = { field: 'email', message: 'Invalid email' };
      const error = new ValidationError('Validation failed', details);
      expect(error.details).toEqual(details);
    });
  });

  describe('NotFoundError', () => {
    it('should create a NotFoundError with 404 status code', () => {
      const error = new NotFoundError('Post');
      expect(error.message).toBe('Post not found');
      expect(error.statusCode).toBe(404);
    });

    it('should use default resource name', () => {
      const error = new NotFoundError();
      expect(error.message).toBe('Resource not found');
    });
  });

  describe('UnauthorizedError', () => {
    it('should create an UnauthorizedError with 401 status code', () => {
      const error = new UnauthorizedError('Invalid credentials');
      expect(error.message).toBe('Invalid credentials');
      expect(error.statusCode).toBe(401);
    });

    it('should use default message', () => {
      const error = new UnauthorizedError();
      expect(error.message).toBe('Unauthorized');
    });
  });

  describe('ConflictError', () => {
    it('should create a ConflictError with 409 status code', () => {
      const error = new ConflictError('Email already exists');
      expect(error.message).toBe('Email already exists');
      expect(error.statusCode).toBe(409);
    });
  });
});
