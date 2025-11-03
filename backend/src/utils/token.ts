import jwt from 'jsonwebtoken';

interface TokenPayload {
  id: number;
  email: string;
}

export function signToken(payload: TokenPayload): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}
