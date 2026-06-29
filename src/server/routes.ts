/**
 * routes.ts - API route handlers
 *
 * Defines the REST API endpoints for the elevator shaft viewer:
 * - GET /shafts — List all shafts
 * - GET /shafts/:id — Get shaft details with all components
 * - GET /components/:id/inspections — Get inspection history for a component
 */

import { Router } from 'express';
import db from './db.js';

const router = Router();

/** List all elevator shafts */
router.get('/shafts', (_req, res) => {
  const shafts = db.prepare('SELECT * FROM shafts').all();
  res.json(shafts);
});

/** Get a single shaft by ID, including all its components */
router.get('/shafts/:id', (req, res) => {
  const shaft = db.prepare('SELECT * FROM shafts WHERE id = ?').get(req.params.id);
  if (!shaft) return res.status(404).json({ error: 'Not found' });
  const components = db.prepare('SELECT * FROM components WHERE shaft_id = ?').all(req.params.id);
  res.json({ ...shaft, components });
});

/** Get all inspections for a component, ordered by date (newest first) */
router.get('/components/:id/inspections', (req, res) => {
  const inspections = db.prepare(
    'SELECT * FROM inspections WHERE component_id = ? ORDER BY date DESC'
  ).all(req.params.id);
  res.json(inspections);
});

export default router;
