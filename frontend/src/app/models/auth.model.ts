import { Role } from './user.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: Role;
  profilePicture?: string;
}

export interface AuthResponse {
  token?: string;
  tokenType?: string;
  userId: number;
  email: string;
  fullName: string;
  role: Role;
  profilePicture?: string;
}
