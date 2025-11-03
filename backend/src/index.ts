import 'dotenv/config';
import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import authRoutes from './routes/auth';
import generationRoutes from './routes/generations';

const app = express();
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.get('/', (_req, res) => res.json({ ok: true }));
app.use('/auth', authRoutes);
app.use('/', generationRoutes);
type AppError = Error & { status?: number };

const errorHandler = (err: AppError, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  const status = typeof err.status === 'number' ? err.status : 500;
  const message = status >= 500 ? 'Internal server error' : err.message ?? 'Request failed';
  res.status(status).json({ error: message });
};
app.use(errorHandler);
const port = process.env.PORT || 4000;
if (process.env.JEST_WORKER_ID === undefined) {
  app.listen(port, () => console.log(`API on http://localhost:${port}`));
}
export default app;
