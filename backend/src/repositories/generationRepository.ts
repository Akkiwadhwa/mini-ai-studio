import db from '../db.js';
import type { GenerationPayload, GenerationRecord } from '../models/generation.js';

export function createGeneration(payload: GenerationPayload): GenerationRecord {
  const statement = db.prepare(
    'INSERT INTO generations (userId, imageUrl, prompt, style, status, createdAt) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const info = statement.run(
    payload.userId,
    payload.imageUrl,
    payload.prompt,
    payload.style,
    payload.status,
    payload.createdAt
  );

  return {
    id: Number(info.lastInsertRowid),
    ...payload
  };
}

export function getRecentGenerationsByUser(userId: number, limit: number): GenerationRecord[] {
  const statement = db.prepare(
    'SELECT id, userId, imageUrl, prompt, style, status, createdAt FROM generations WHERE userId = ? ORDER BY id DESC LIMIT ?'
  );
  return statement.all(userId, limit) as GenerationRecord[];
}
