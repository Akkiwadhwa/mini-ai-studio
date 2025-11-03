import type { Request, Response, NextFunction } from 'express';
import { loginSchema, signupSchema } from '../validators.js';
import { login, signup } from '../services/authService.js';

export function signupController(req: Request, res: Response, next: NextFunction): void {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    const message = parsed.error.issues.map(issue => issue.message).join(', ') || 'Invalid signup data';
    res.status(400).json({ error: message });
    return;
  }
  try {
    const auth = signup(parsed.data);
    res.status(201).json(auth);
  } catch (error) {
    next(error);
  }
}

export function loginController(req: Request, res: Response, next: NextFunction): void {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    const message = parsed.error.issues.map(issue => issue.message).join(', ') || 'Invalid login data';
    res.status(400).json({ error: message });
    return;
  }
  try {
    const auth = login(parsed.data);
    res.json(auth);
  } catch (error) {
    next(error);
  }
}
