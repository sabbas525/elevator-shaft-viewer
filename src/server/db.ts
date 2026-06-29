/**
 * db.ts - Database setup and seeding
 *
 * Initializes a SQLite database (via better-sqlite3) with WAL mode for performance.
 * Creates tables for shafts, components, and inspections if they don't exist.
 * Seeds sample data on first run (when tables are empty).
 *
 * Schema:
 * - shafts: Elevator shaft metadata (name, address, floor count)
 * - components: Individual parts of a shaft (door, rail, car, cable) with condition
 * - inspections: Historical inspection records with date, condition, and notes
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../../data.db');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL'); // Write-Ahead Logging for better concurrent read performance

// Create schema if tables don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS shafts (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    floors INTEGER
  );
  CREATE TABLE IF NOT EXISTS components (
    id INTEGER PRIMARY KEY,
    shaft_id INTEGER REFERENCES shafts(id),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    mesh_name TEXT,
    condition TEXT NOT NULL,
    next_inspection TEXT
  );
  CREATE TABLE IF NOT EXISTS inspections (
    id INTEGER PRIMARY KEY,
    component_id INTEGER REFERENCES components(id),
    date TEXT NOT NULL,
    condition TEXT NOT NULL,
    notes TEXT
  );
`);

// Migrate: add next_inspection column for existing databases that lack it
try {
  db.exec(`ALTER TABLE components ADD COLUMN next_inspection TEXT`);
} catch (_) {
  // Column already exists — safe to ignore
}

// Seed sample data if the database is empty
const count = db.prepare('SELECT COUNT(*) as c FROM shafts').get() as { c: number };
if (count.c === 0) {
  db.exec(`
    -- Shaft metadata
    INSERT INTO shafts VALUES (1, 'Shaft A - Office Tower', 'Keilasatama 5, Espoo', 12);

    -- Components with mesh_name matching OBJ object names
    INSERT INTO components VALUES (1, 1, 'Main Door L1', 'door', 'Door_L1', 'good', '2026-07-15');
    INSERT INTO components VALUES (2, 1, 'Main Door L6', 'door', 'Door_L6', 'fair', '2026-04-01');
    INSERT INTO components VALUES (3, 1, 'Left Guide Rail', 'guide_rail', 'GuideRail_Left', 'good', '2026-12-01');
    INSERT INTO components VALUES (4, 1, 'Right Guide Rail', 'guide_rail', 'GuideRail_Right', 'good', '2026-12-01');
    INSERT INTO components VALUES (5, 1, 'Car Assembly', 'car', 'Car', 'good', '2026-07-15');
    INSERT INTO components VALUES (6, 1, 'Main Cable', 'cable', 'Cable_Main', 'poor', '2026-02-01');

    -- Inspection history for Door L1
    INSERT INTO inspections VALUES (1, 1, '2026-01-15', 'good', 'No issues found. Door operation smooth.');
    INSERT INTO inspections VALUES (2, 1, '2025-06-12', 'good', 'Annual check passed.');
    INSERT INTO inspections VALUES (3, 1, '2024-12-03', 'good', 'Lubrication applied to hinges.');

    -- Inspection history for Door L6 (shows degradation over time)
    INSERT INTO inspections VALUES (4, 2, '2026-01-15', 'fair', 'Minor wear on door seals. Replacement recommended within 6 months.');
    INSERT INTO inspections VALUES (5, 2, '2025-06-10', 'good', 'All clear. Seals intact.');
    INSERT INTO inspections VALUES (6, 2, '2024-11-20', 'good', 'Routine maintenance completed.');
    INSERT INTO inspections VALUES (7, 2, '2024-06-05', 'good', 'No issues detected.');

    -- Inspection history for Left Guide Rail
    INSERT INTO inspections VALUES (8, 3, '2026-01-15', 'good', 'Alignment verified. Within tolerance.');
    INSERT INTO inspections VALUES (9, 3, '2025-06-10', 'good', 'No wear detected on guide surfaces.');
    INSERT INTO inspections VALUES (10, 3, '2024-12-01', 'good', 'Brackets secure.');

    -- Inspection history for Right Guide Rail
    INSERT INTO inspections VALUES (11, 4, '2026-01-15', 'good', 'Alignment verified. Within tolerance.');
    INSERT INTO inspections VALUES (12, 4, '2025-06-10', 'good', 'No wear detected.');

    -- Inspection history for Car Assembly
    INSERT INTO inspections VALUES (13, 5, '2026-01-15', 'good', 'Cabin in excellent condition. Interior panels intact.');
    INSERT INTO inspections VALUES (14, 5, '2025-06-10', 'good', 'Floor leveling accurate. Safety edges functional.');
    INSERT INTO inspections VALUES (15, 5, '2024-12-01', 'good', 'Emergency phone tested successfully.');
    INSERT INTO inspections VALUES (16, 5, '2024-06-15', 'good', 'Lighting and ventilation operational.');

    -- Inspection history for Main Cable (shows progressive degradation: good → fair → poor)
    INSERT INTO inspections VALUES (17, 6, '2026-01-15', 'poor', 'Visible fraying on 3 strands. Immediate replacement scheduled.');
    INSERT INTO inspections VALUES (18, 6, '2025-06-10', 'fair', 'Early signs of wear on outer strands. Monitor closely.');
    INSERT INTO inspections VALUES (19, 6, '2024-12-01', 'fair', 'Slight surface rust. Lubrication applied.');
    INSERT INTO inspections VALUES (20, 6, '2024-06-15', 'good', 'Cable tension within spec. No visible damage.');
    INSERT INTO inspections VALUES (21, 6, '2023-12-10', 'good', 'Annual inspection passed.');
  `);
}

export default db;
