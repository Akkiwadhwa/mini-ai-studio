import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import { createGenerationSchema } from '../validators.js';
import {
  listGenerations,
  persistGeneration,
  removeFile,
  shouldSimulateOverload,
  simulateGenerationDelay
} from '../services/generationService.js';

export async function createGenerationController(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const parsed = createGenerationSchema.safeParse(req.body);
  if (!parsed.success) {
    removeFile(req.file?.path);
    const message = parsed.error.issues.map(issue => issue.message).join(', ') || 'Invalid generation data';
    res.status(400).json({ error: message });
    return;
  }
  if (!req.file) {
    res.status(400).json({ error: 'Image upload is required' });
    return;
  }

  try {
    await simulateGenerationDelay();
    if (shouldSimulateOverload()) {
      removeFile(req.file.path);
      res.status(503).json({ message: 'Model overloaded' });
      return;
    }

    const generation = persistGeneration({
      userId: req.user!.id,
      prompt: parsed.data.prompt,
      style: parsed.data.style,
      filePath: req.file.path
    });

    res.status(201).json(generation);
  } catch (error) {
    removeFile(req.file?.path);
    next(error);
  }
}

export function listGenerationsController(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const limit = Math.min(parseInt((req.query.limit as string) || '5', 10), 5);
    const generations = listGenerations(req.user!.id, limit);
    res.json(generations);
  } catch (error) {
    next(error);
  }
}
