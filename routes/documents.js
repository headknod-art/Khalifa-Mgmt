import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = express.Router();

// Use repo-relative uploads directory so server finds files regardless of cwd
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = process.env.UPLOADS_DIR || path.resolve(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const upload = multer({ storage });

let documents = [];

router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const doc = {
    id: req.file.filename,
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    uploadDate: new Date(),
  };
  documents.push(doc);
  res.json(doc);
});

router.get('/', (req, res) => {
  res.json(documents);
});

router.get('/:id', (req, res) => {
  const doc = documents.find(d => d.id === req.params.id);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  const filePath = path.join(uploadDir, doc.id);
  res.download(filePath, doc.originalName);
});

export default router;
