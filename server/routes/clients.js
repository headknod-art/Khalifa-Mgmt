
import express from 'express';
import db from '../db.js';
const router = express.Router();

// Get all clients
router.get('/', (req, res) => {
  db.all('SELECT * FROM clients', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get client by ID
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM clients WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Client not found' });
    res.json(row);
  });
});

// Add new client
router.post('/', (req, res) => {
  const { name, email, phone } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });
  db.run(
    'INSERT INTO clients (name, email, phone) VALUES (?, ?, ?)',
    [name, email, phone],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, name, email, phone });
    }
  );
});

// Update client
router.put('/:id', (req, res) => {
  const { name, email, phone } = req.body;
  db.run(
    'UPDATE clients SET name = ?, email = ?, phone = ? WHERE id = ?',
    [name, email, phone, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Client not found' });
      res.json({ id: req.params.id, name, email, phone });
    }
  );
});

// Delete client
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM clients WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Client not found' });
    res.json({ success: true });
  });
});

export default router;
