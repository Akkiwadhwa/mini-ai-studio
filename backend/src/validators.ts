import { z } from 'zod';
export const signupSchema = z.object({ email: z.string().email(), password: z.string().min(6) });
export const loginSchema = signupSchema;
export const createGenerationSchema = z.object({
  prompt: z.string().min(1).max(500),
  style: z.enum(['Streetwear','Minimal','Avant-garde','Vintage'])
});
