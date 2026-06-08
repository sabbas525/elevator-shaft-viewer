import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../../data.db');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

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
    condition TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS inspections (
    id INTEGER PRIMARY KEY,
    component_id INTEGER REFERENCES components(id),
    date TEXT NOT NULL,
    condition TEXT NOT NULL,
    notes TEXT
  );
`);

// Seed if empty
const count = db.prepare('SELECT COUNT(*) as c FROM shafts').get() as { c: number };
if (count.c === 0) {
  db.exec(`
    INSERT INTO shafts VALUES (1, 'Shaft A - Office Tower', 'Keilasatama 5, Espoo', 12);

    INSERT INTO components VALUES (1, 1, 'Main Door L1', 'door', 'Door_L1', 'good');
    INSERT INTO components VALUES (2, 1, 'Main Door L6', 'door', 'Door_L6', 'fair');
    INSERT INTO components VALUES (3, 1, 'Left Guide Rail', 'guide_rail', 'GuideRail_Left', 'good');
    INSERT INTO components VALUES (4, 1, 'Right Guide Rail', 'guide_rail', 'GuideRail_Right', 'good');
    INSERT INTO components VALUES (5, 1, 'Car Assembly', 'car', 'Car', 'good');
    INSERT INTO components VALUES (6, 1, 'Main Cable', 'cable', 'Cable_Main', 'poor');

    INSERT INTO inspections VALUES (1, 1, '2026-01-15', 'good', 'No issues found');
    INSERT INTO inspections VALUES (2, 2, '2026-01-15', 'fair', 'Minor wear on seals');
    INSERT INTO inspections VALUES (3, 2, '2025-06-10', 'good', 'All clear');
    INSERT INTO inspections VALUES (4, 6, '2026-01-15', 'poor', 'Visible fraying on 3 strands');
    INSERT INTO inspections VALUES (5, 6, '2025-06-10', 'fair', 'Early signs of wear');
    INSERT INTO inspections VALUES (6, 5, '2026-01-15', 'good', 'Cabin in excellent condition');
  `);
}

export default db;
