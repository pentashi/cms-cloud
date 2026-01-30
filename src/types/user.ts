export interface User {
  id?: string;
  email: string;
  password?: string; // Only populated during signup/login, not stored in responses
  createdAt?: number;
}

export interface AuthResponse {
  id: string;
  email: string;
  token: string;
  createdAt: number;
}
