import { Router } from 'express';
import db from './db.js';

const router = Router();

router.get('/shafts', (_req, res) => {
  const shafts = db.prepare('SELECT * FROM shafts').all();
  res.json(shafts);
});

router.get('/shafts/:id', (req, res) => {
  const shaft = db.prepare('SELECT * FROM shafts WHERE id = ?').get(req.params.id);
  if (!shaft) return res.status(404).json({ error: 'Not found' });
  const components = db.prepare('SELECT * FROM components WHERE shaft_id = ?').all(req.params.id);
  res.json({ ...shaft, components });
});

router.get('/components/:id/inspections', (req, res) => {
  const inspections = db.prepare('SELECT * FROM inspections WHERE component_id = ? ORDER BY date DESC').all(req.params.id);
  res.json(inspections);
});

export default router;
