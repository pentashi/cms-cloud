import { UserService } from '../userService';
import { ConflictError, UnauthorizedError } from '../../utils/appError';
import bcrypt from 'bcryptjs';

// Mock Firebase
jest.mock('../../firebase', () => ({
  db: {},
}));

jest.mock('firebase/database', () => ({
  ref: jest.fn((db, path) => ({ path })),
  get: jest.fn(),
  set: jest.fn(),
}));

// Mock bcrypt
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const { get, set } = require('firebase/database');
const jwt = require('jsonwebtoken');

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
    jest.clearAllMocks();
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue('token_123');
  });

  describe('signup', () => {
    it('should create a new user', async () => {
      get.mockResolvedValue({
        exists: () => false,
        val: () => null,
      });
      set.mockResolvedValue(undefined);

      const result = await userService.signup({
        email: 'test@example.com',
        password: 'Password123',
      });

      expect(result.email).toBe('test@example.com');
      expect(result.token).toBe('token_123');
      expect(result.id).toBe('test@example.com');
      expect(set).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith('Password123', 10);
    });

    it('should throw ConflictError if email already exists', async () => {
      get.mockResolvedValue({
        exists: () => true,
        val: () => ({ email: 'test@example.com' }),
      });

      await expect(
        userService.signup({
          email: 'test@example.com',
          password: 'Password123',
        })
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('login', () => {
    it('should return user with token if credentials are valid', async () => {
      get.mockResolvedValue({
        exists: () => true,
        val: () => ({ password: 'hashed_password', createdAt: 1234567890 }),
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await userService.login({
        email: 'test@example.com',
        password: 'Password123',
      });

      expect(result.email).toBe('test@example.com');
      expect(result.token).toBe('token_123');
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'Password123',
        'hashed_password'
      );
    });

    it('should throw UnauthorizedError if email does not exist', async () => {
      get.mockResolvedValue({
        exists: () => false,
      });

      await expect(
        userService.login({
          email: 'nonexistent@example.com',
          password: 'Password123',
        })
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError if password is incorrect', async () => {
      get.mockResolvedValue({
        exists: () => true,
        val: () => ({ password: 'hashed_password' }),
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        userService.login({
          email: 'test@example.com',
          password: 'WrongPassword',
        })
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      (jwt.verify as jest.Mock).mockReturnValue({ email: 'test@example.com' });

      const result = userService.verifyToken('token_123');

      expect(result).toEqual({ email: 'test@example.com' });
      expect(jwt.verify).toHaveBeenCalledWith('token_123', expect.any(String));
    });

    it('should return null for invalid token', () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = userService.verifyToken('invalid_token');

      expect(result).toBeNull();
    });
  });

  describe('getUserByEmail', () => {
    it('should return user by email', async () => {
      get.mockResolvedValue({
        exists: () => true,
        val: () => ({ password: 'hashed' }),
      });

      const result = await userService.getUserByEmail('test@example.com');

      expect(result?.email).toBe('test@example.com');
    });

    it('should return null if user does not exist', async () => {
      get.mockResolvedValue({
        exists: () => false,
      });

      const result = await userService.getUserByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });
});
