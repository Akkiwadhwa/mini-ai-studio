import fs from 'fs';
import type { GenerationRecord } from '../models/generation.js';
import { createGeneration, getRecentGenerationsByUser } from '../repositories/generationRepository.js';

interface CreateGenerationInput {
  userId: number;
  prompt: string;
  style: string;
  filePath: string;
}

export async function simulateGenerationDelay(): Promise<void> {
  const delay = 1000 + Math.floor(Math.random() * 1000);
  await new Promise(resolve => setTimeout(resolve, delay));
}

export function shouldSimulateOverload(): boolean {
  return Math.random() < 0.2;
}

export function buildImageUrl(filePath: string): string {
  const baseUrl = process.env.BASE_URL || '';
  const relativePath = filePath.replace(/\\/g, '/');
  return baseUrl ? `${baseUrl}/${relativePath}` : `/${relativePath}`;
}

function normalizeImageUrl(url: string): string {
  return url.replace(/\\/g, '/');
}

export function persistGeneration({ userId, prompt, style, filePath }: CreateGenerationInput): GenerationRecord {
  const createdAt = new Date().toISOString();
  const imageUrl = buildImageUrl(filePath);
  const status = 'succeeded';
  const record = createGeneration({ userId, prompt, style, imageUrl, status, createdAt });
  return { ...record, imageUrl: normalizeImageUrl(record.imageUrl) };
}

export function removeFile(filePath?: string | null): void {
  if (!filePath) return;
  fs.promises
    .unlink(filePath)
    .catch(() => undefined);
}

export function listGenerations(userId: number, limit: number): GenerationRecord[] {
  return getRecentGenerationsByUser(userId, limit).map(item => ({
    ...item,
    imageUrl: normalizeImageUrl(item.imageUrl)
  }));
}
