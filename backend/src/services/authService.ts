import bcrypt from 'bcryptjs';
import { createUser, findUserByEmail } from '../repositories/userRepository.js';
import type { UserRecord } from '../models/user.js';
import { signToken } from '../utils/token.js';

interface SignupInput {
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: Pick<UserRecord, 'id' | 'email' | 'createdAt'>;
}

export function signup({ email, password }: SignupInput): AuthResponse {
  const existing = findUserByEmail(email);
  if (existing) {
    throw Object.assign(new Error('Email already in use'), { status: 409 });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const createdAt = new Date().toISOString();
  const user = createUser({ email, passwordHash, createdAt });
  const token = signToken({ id: user.id, email: user.email });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt
    }
  };
}

export function login({ email, password }: LoginInput): AuthResponse {
  const user = findUserByEmail(email);
  if (!user) {
    throw Object.assign(new Error('Invalid credentials'), { status: 401 });
  }

  const isValid = bcrypt.compareSync(password, user.passwordHash);
  if (!isValid) {
    throw Object.assign(new Error('Invalid credentials'), { status: 401 });
  }

  const token = signToken({ id: user.id, email: user.email });
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt
    }
  };
}
