import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authMiddleware } from '../middleware/auth.js';
import { createGenerationController, listGenerationsController } from '../controllers/generationController.js';
const router = Router();

const uploadDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(file.originalname)}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const isAllowed = ['image/jpeg', 'image/png'].includes(file.mimetype);
    if (!isAllowed) {
      cb(new Error('Only JPEG/PNG allowed'));
      return;
    }
    cb(null, true);
  }
});

router.post('/generations', authMiddleware, upload.single('image'), createGenerationController);

router.get('/generations', authMiddleware, listGenerationsController);
export default router;
