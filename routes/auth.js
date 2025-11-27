import express from 'express';
const router = express.Router();

// Placeholder route
router.get('/', (req, res) => {
  res.json({ message: 'Auth route placeholder' });
});

export default router;
