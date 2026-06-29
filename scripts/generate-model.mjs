// Generates a proper-looking elevator shaft OBJ + MTL
// Run with: node scripts/generate-model.mjs

import { writeFileSync } from 'fs';

// ==========================================
// Configuration
// ==========================================
const SHAFT_WIDTH = 2.4;    // meters
const SHAFT_DEPTH = 2.0;    // meters  
const SHAFT_HEIGHT = 18.0;  // meters (total height)
const FLOOR_HEIGHT = 3.0;   // meters per floor
const WALL_THICKNESS = 0.12;

let vertices = [];
let normals = [];
let faces = [];
let currentMaterial = '';
let currentObject = '';
let vOffset = 0;

function addVertex(x, y, z) {
  vertices.push(`v ${x.toFixed(4)} ${y.toFixed(4)} ${z.toFixed(4)}`);
}

function addNormal(nx, ny, nz) {
  normals.push(`vn ${nx.toFixed(4)} ${ny.toFixed(4)} ${nz.toFixed(4)}`);
}

function setObject(name) {
  currentObject = name;
  faces.push(`\no ${name}`);
}

function setMaterial(name) {
  if (currentMaterial !== name) {
    currentMaterial = name;
    faces.push(`usemtl ${name}`);
  }
}

// Add a box and return the starting vertex index
function addBox(x1, y1, z1, x2, y2, z2) {
  const base = vertices.length + 1;
  
  // 8 vertices of the box
  addVertex(x1, y1, z1); // 0: left-bottom-back
  addVertex(x2, y1, z1); // 1: right-bottom-back
  addVertex(x2, y2, z1); // 2: right-top-back
  addVertex(x1, y2, z1); // 3: left-top-back
  addVertex(x1, y1, z2); // 4: left-bottom-front
  addVertex(x2, y1, z2); // 5: right-bottom-front
  addVertex(x2, y2, z2); // 6: right-top-front
  addVertex(x1, y2, z2); // 7: left-top-front
  
  // 6 faces (quads)
  const b = base;
  faces.push(`f ${b} ${b+3} ${b+2} ${b+1}`);   // back
  faces.push(`f ${b+4} ${b+5} ${b+6} ${b+7}`); // front
  faces.push(`f ${b} ${b+1} ${b+5} ${b+4}`);   // bottom
  faces.push(`f ${b+2} ${b+3} ${b+7} ${b+6}`); // top
  faces.push(`f ${b} ${b+4} ${b+7} ${b+3}`);   // left
  faces.push(`f ${b+1} ${b+2} ${b+6} ${b+5}`); // right
}

// ==========================================
// Build the shaft structure (not clickable, just context)
// ==========================================

// Shaft walls - back wall
setObject('Shaft_Structure');
setMaterial('ShaftWall');
addBox(-SHAFT_WIDTH/2 - WALL_THICKNESS, 0, -SHAFT_DEPTH/2 - WALL_THICKNESS, 
       SHAFT_WIDTH/2 + WALL_THICKNESS, SHAFT_HEIGHT, -SHAFT_DEPTH/2);

// Left wall
addBox(-SHAFT_WIDTH/2 - WALL_THICKNESS, 0, -SHAFT_DEPTH/2,
       -SHAFT_WIDTH/2, SHAFT_HEIGHT, SHAFT_DEPTH/2);

// Right wall
addBox(SHAFT_WIDTH/2, 0, -SHAFT_DEPTH/2,
       SHAFT_WIDTH/2 + WALL_THICKNESS, SHAFT_HEIGHT, SHAFT_DEPTH/2);

// Floor slab
addBox(-SHAFT_WIDTH/2 - WALL_THICKNESS, -0.2, -SHAFT_DEPTH/2 - WALL_THICKNESS,
       SHAFT_WIDTH/2 + WALL_THICKNESS, 0, SHAFT_DEPTH/2 + 0.1);

// Top slab (machine room floor)
addBox(-SHAFT_WIDTH/2 - WALL_THICKNESS, SHAFT_HEIGHT, -SHAFT_DEPTH/2 - WALL_THICKNESS,
       SHAFT_WIDTH/2 + WALL_THICKNESS, SHAFT_HEIGHT + 0.2, SHAFT_DEPTH/2 + 0.1);

// ==========================================
// Door_L1 - Ground floor landing door
// ==========================================
setObject('Door_L1');
setMaterial('Door');

const doorWidth = 0.85;
const doorHeight = 2.1;
const doorThickness = 0.05;
const doorY = 0.0;
const doorZ = SHAFT_DEPTH/2;

// Left panel
addBox(-doorWidth, doorY, doorZ, 
       -0.02, doorY + doorHeight, doorZ + doorThickness);
// Right panel  
addBox(0.02, doorY, doorZ,
       doorWidth, doorY + doorHeight, doorZ + doorThickness);
// Door frame - top
setMaterial('DoorFrame');
addBox(-doorWidth - 0.08, doorY + doorHeight, doorZ - 0.02,
       doorWidth + 0.08, doorY + doorHeight + 0.12, doorZ + doorThickness + 0.02);
// Door frame - left
addBox(-doorWidth - 0.08, doorY, doorZ - 0.02,
       -doorWidth, doorY + doorHeight + 0.12, doorZ + doorThickness + 0.02);
// Door frame - right
addBox(doorWidth, doorY, doorZ - 0.02,
       doorWidth + 0.08, doorY + doorHeight + 0.12, doorZ + doorThickness + 0.02);

// ==========================================
// Door_L6 - 6th floor landing door
// ==========================================
setObject('Door_L6');
setMaterial('Door');

const door6Y = 5 * FLOOR_HEIGHT; // Floor 6 = index 5

// Left panel
addBox(-doorWidth, door6Y, doorZ,
       -0.02, door6Y + doorHeight, doorZ + doorThickness);
// Right panel
addBox(0.02, door6Y, doorZ,
       doorWidth, door6Y + doorHeight, doorZ + doorThickness);
// Door frame
setMaterial('DoorFrame');
addBox(-doorWidth - 0.08, door6Y + doorHeight, doorZ - 0.02,
       doorWidth + 0.08, door6Y + doorHeight + 0.12, doorZ + doorThickness + 0.02);
addBox(-doorWidth - 0.08, door6Y, doorZ - 0.02,
       -doorWidth, door6Y + doorHeight + 0.12, doorZ + doorThickness + 0.02);
addBox(doorWidth, door6Y, doorZ - 0.02,
       doorWidth + 0.08, door6Y + doorHeight + 0.12, doorZ + doorThickness + 0.02);

// ==========================================
// GuideRail_Left - T-profile rail
// ==========================================
setObject('GuideRail_Left');
setMaterial('Rail');

const railX = -SHAFT_WIDTH/2 + 0.15;
const railWeb = 0.016;
const railFlange = 0.08;
const railFlangeThick = 0.012;

// Web (vertical thin part)
addBox(railX - railWeb/2, 0, -railWeb/2,
       railX + railWeb/2, SHAFT_HEIGHT, railWeb/2);
// Flange (horizontal T-top)
addBox(railX - railFlange/2, 0, -railFlangeThick/2,
       railX + railFlange/2, SHAFT_HEIGHT, railFlangeThick/2);
// Mounting bracket every 3m
for (let y = 1; y < SHAFT_HEIGHT; y += 3) {
  addBox(railX - railFlange/2 - 0.02, y, -0.04,
         -SHAFT_WIDTH/2, y + 0.06, 0.04);
}

// ==========================================
// GuideRail_Right - T-profile rail
// ==========================================
setObject('GuideRail_Right');
setMaterial('Rail');

const railRX = SHAFT_WIDTH/2 - 0.15;
// Web
addBox(railRX - railWeb/2, 0, -railWeb/2,
       railRX + railWeb/2, SHAFT_HEIGHT, railWeb/2);
// Flange
addBox(railRX - railFlange/2, 0, -railFlangeThick/2,
       railRX + railFlange/2, SHAFT_HEIGHT, railFlangeThick/2);
// Mounting brackets
for (let y = 1; y < SHAFT_HEIGHT; y += 3) {
  addBox(SHAFT_WIDTH/2, y, -0.04,
         railRX + railFlange/2 + 0.02, y + 0.06, 0.04);
}

// ==========================================
// Car - Elevator cabin
// ==========================================
setObject('Car');
setMaterial('CarBody');

const carW = 1.6;
const carH = 2.4;
const carD = 1.4;
const carY = 2 * FLOOR_HEIGHT; // Sitting at floor 3
const carX = 0;
const carZ = 0;

// Car floor
addBox(carX - carW/2, carY, carZ - carD/2,
       carX + carW/2, carY + 0.06, carZ + carD/2);

// Car ceiling
addBox(carX - carW/2, carY + carH, carZ - carD/2,
       carX + carW/2, carY + carH + 0.05, carZ + carD/2);

// Car back wall
setMaterial('CarInterior');
addBox(carX - carW/2, carY, carZ - carD/2,
       carX + carW/2, carY + carH, carZ - carD/2 + 0.04);

// Car left wall
addBox(carX - carW/2, carY, carZ - carD/2,
       carX - carW/2 + 0.04, carY + carH, carZ + carD/2);

// Car right wall
addBox(carX + carW/2 - 0.04, carY, carZ - carD/2,
       carX + carW/2, carY + carH, carZ + carD/2);

// Car front (with door opening gap)
setMaterial('CarBody');
addBox(carX - carW/2, carY, carZ + carD/2 - 0.04,
       carX - carW/2 + 0.25, carY + carH, carZ + carD/2);
addBox(carX + carW/2 - 0.25, carY, carZ + carD/2 - 0.04,
       carX + carW/2, carY + carH, carZ + carD/2);
// Top beam over door
addBox(carX - carW/2 + 0.25, carY + doorHeight + 0.05, carZ + carD/2 - 0.04,
       carX + carW/2 - 0.25, carY + carH, carZ + carD/2);

// Car top frame (crossbeam)
setMaterial('CarFrame');
addBox(carX - carW/2 - 0.05, carY + carH + 0.05, carZ - 0.05,
       carX + carW/2 + 0.05, carY + carH + 0.12, carZ + 0.05);

// ==========================================
// Cable_Main - Wire ropes
// ==========================================
setObject('Cable_Main');
setMaterial('Cable');

const cableTop = SHAFT_HEIGHT - 0.5;
const cableBottom = carY + carH + 0.12;
const cableRadius = 0.012;
const cableSpacing = 0.06;

// 4 rope strands
for (let i = -1.5; i <= 1.5; i++) {
  const cx = carX + i * cableSpacing;
  addBox(cx - cableRadius, cableBottom, -cableRadius,
         cx + cableRadius, cableTop, cableRadius);
}

// Rope attachment plate (top)
addBox(carX - 0.15, cableTop, -0.03,
       carX + 0.15, cableTop + 0.05, 0.03);

// Rope attachment plate (car top)
addBox(carX - 0.15, cableBottom - 0.05, -0.03,
       carX + 0.15, cableBottom, 0.03);

// ==========================================
// Write OBJ file
// ==========================================
const objContent = [
  '# Elevator Shaft Model',
  '# Generated for elevator-shaft-viewer',
  '# Realistic proportions with proper component geometry',
  '',
  'mtllib shaft.mtl',
  '',
  ...vertices,
  '',
  ...faces,
  ''
].join('\n');

writeFileSync('public/models/shaft.obj', objContent);
console.log(`Generated shaft.obj (${vertices.length} vertices, ${faces.filter(f => f.startsWith('f ')).length} faces)`);

// ==========================================
// Write MTL file
// ==========================================
const mtlContent = `# Elevator Shaft Materials

newmtl ShaftWall
Ka 0.02 0.02 0.03
Kd 0.18 0.20 0.24
Ks 0.1 0.1 0.1
Ns 10
d 0.85

newmtl Door
Ka 0.05 0.05 0.06
Kd 0.55 0.58 0.65
Ks 0.7 0.7 0.7
Ns 90

newmtl DoorFrame
Ka 0.03 0.03 0.03
Kd 0.35 0.35 0.38
Ks 0.5 0.5 0.5
Ns 60

newmtl Rail
Ka 0.03 0.03 0.03
Kd 0.40 0.42 0.45
Ks 0.9 0.9 0.9
Ns 120

newmtl CarBody
Ka 0.05 0.05 0.06
Kd 0.70 0.72 0.78
Ks 0.6 0.6 0.6
Ns 80

newmtl CarInterior
Ka 0.08 0.08 0.07
Kd 0.85 0.83 0.78
Ks 0.2 0.2 0.2
Ns 20

newmtl CarFrame
Ka 0.02 0.02 0.02
Kd 0.25 0.27 0.30
Ks 0.8 0.8 0.8
Ns 100

newmtl Cable
Ka 0.01 0.01 0.01
Kd 0.10 0.10 0.12
Ks 0.4 0.4 0.4
Ns 50
`;

writeFileSync('public/models/shaft.mtl', mtlContent);
console.log('Generated shaft.mtl');
