import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
const router = express.Router();
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadDir = path.resolve(__dirname, '../uploads');
// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    },
});
const upload = multer({ storage });
// In-memory metadata store (replace with DB for persistence)
let documents = [];
// Upload endpoint
router.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file)
        return res.status(400).json({ error: 'No file uploaded' });
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
// List documents
router.get('/', (req, res) => {
    res.json(documents);
});
// Download document
router.get('/:id', (req, res) => {
    const doc = documents.find(d => d.id === req.params.id);
    if (!doc)
        return res.status(404).json({ error: 'Not found' });
    const filePath = path.join(uploadDir, doc.id);
    res.download(filePath, doc.originalName);
});
export default router;
