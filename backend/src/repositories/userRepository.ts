import db from '../db.js';
import type { UserPayload, UserRecord } from '../models/user.js';

export function findUserByEmail(email: string): UserRecord | undefined {
  const statement = db.prepare('SELECT id, email, passwordHash, createdAt FROM users WHERE email = ?');
  return statement.get(email) as UserRecord | undefined;
}

export function createUser(payload: UserPayload): UserRecord {
  const statement = db.prepare('INSERT INTO users (email, passwordHash, createdAt) VALUES (?, ?, ?)');
  const info = statement.run(payload.email, payload.passwordHash, payload.createdAt);
  return {
    id: Number(info.lastInsertRowid),
    ...payload
  };
}

export function findUserById(id: number): UserRecord | undefined {
  const statement = db.prepare('SELECT id, email, passwordHash, createdAt FROM users WHERE id = ?');
  return statement.get(id) as UserRecord | undefined;
}
