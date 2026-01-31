import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../firebase.js';
import { ref, set, get, query, orderByChild, equalTo } from 'firebase/database';
import type { User, AuthResponse } from '../types/user.js';
import type { SignupInput, LoginInput } from '../validators/authValidator.js';
import { ConflictError, UnauthorizedError } from '../utils/appError.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = '7d';

export class UserService {
  async signup(data: SignupInput): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await this.getUserByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('Email already in use');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user in Firebase
    const newUserRef = ref(db, `users/${data.email.replace(/\./g, '_')}`);
    const user: User = {
      email: data.email,
      password: hashedPassword,
      createdAt: Date.now(),
    };

    await set(newUserRef, user);

    // Generate token
    const token = this.generateToken(data.email);

    return {
      id: data.email,
      email: data.email,
      token,
      createdAt: user.createdAt!,
    };
  }

  async login(data: LoginInput): Promise<AuthResponse> {
    // Get user from Firebase
    const user = await this.getUserByEmail(data.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check password
    const passwordMatch = await bcrypt.compare(data.password, user.password || '');
    if (!passwordMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate token
    const token = this.generateToken(data.email);

    return {
      id: user.email,
      email: user.email,
      token,
      createdAt: user.createdAt || Date.now(),
    };
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const userId = email.replace(/\./g, '_');
    const snapshot = await get(ref(db, `users/${userId}`));
    if (!snapshot.exists()) {
      return null;
    }
    return { email, ...snapshot.val() } as User;
  }

  private generateToken(email: string): string {
    return jwt.sign({ email }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
  }

  verifyToken(token: string): { email: string } | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { email: string };
      return decoded;
    } catch {
      return null;
    }
  }
}
