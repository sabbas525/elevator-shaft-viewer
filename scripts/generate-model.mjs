// Generates a minimal GLB with named meshes matching our DB seed data
// Run with: node scripts/generate-model.mjs

import { writeFileSync } from 'fs';

// Minimal GLTF JSON with named nodes/meshes
const gltf = {
  asset: { version: '2.0', generator: 'elevator-shaft-viewer-gen' },
  scene: 0,
  scenes: [{ nodes: [0, 1, 2, 3, 4, 5] }],
  nodes: [
    { name: 'Door_L1', mesh: 0, translation: [-1.5, 0.5, 0] },
    { name: 'Door_L6', mesh: 1, translation: [-1.5, 5.5, 0] },
    { name: 'GuideRail_Left', mesh: 2, translation: [-1.2, 4, 0] },
    { name: 'GuideRail_Right', mesh: 3, translation: [1.2, 4, 0] },
    { name: 'Car', mesh: 4, translation: [0, 3, 0] },
    { name: 'Cable_Main', mesh: 5, translation: [0, 6.5, 0] },
  ],
  meshes: [
    { name: 'Door_L1', primitives: [{ attributes: { POSITION: 0 }, indices: 1, material: 0 }] },
    { name: 'Door_L6', primitives: [{ attributes: { POSITION: 2 }, indices: 3, material: 0 }] },
    { name: 'GuideRail_Left', primitives: [{ attributes: { POSITION: 4 }, indices: 5, material: 1 }] },
    { name: 'GuideRail_Right', primitives: [{ attributes: { POSITION: 6 }, indices: 7, material: 1 }] },
    { name: 'Car', primitives: [{ attributes: { POSITION: 8 }, indices: 9, material: 2 }] },
    { name: 'Cable_Main', primitives: [{ attributes: { POSITION: 10 }, indices: 11, material: 3 }] },
  ],
  materials: [
    { name: 'DoorMat', pbrMetallicRoughness: { baseColorFactor: [0.6, 0.6, 0.7, 1], metallicFactor: 0.8, roughnessFactor: 0.3 } },
    { name: 'RailMat', pbrMetallicRoughness: { baseColorFactor: [0.4, 0.4, 0.4, 1], metallicFactor: 0.9, roughnessFactor: 0.2 } },
    { name: 'CarMat', pbrMetallicRoughness: { baseColorFactor: [0.8, 0.8, 0.85, 1], metallicFactor: 0.5, roughnessFactor: 0.4 } },
    { name: 'CableMat', pbrMetallicRoughness: { baseColorFactor: [0.2, 0.2, 0.2, 1], metallicFactor: 0.7, roughnessFactor: 0.5 } },
  ],
  accessors: [],
  bufferViews: [],
  buffers: [],
};

// Helper: create a box mesh (positions + indices)
function createBox(sx, sy, sz) {
  const x = sx / 2, y = sy / 2, z = sz / 2;
  // 8 vertices of a box
  const positions = new Float32Array([
    -x, -y, -z,  x, -y, -z,  x,  y, -z, -x,  y, -z,
    -x, -y,  z,  x, -y,  z,  x,  y,  z, -x,  y,  z,
  ]);
  const indices = new Uint16Array([
    0,1,2, 0,2,3, 4,6,5, 4,7,6,
    0,4,5, 0,5,1, 2,6,7, 2,7,3,
    0,3,7, 0,7,4, 1,5,6, 1,6,2,
  ]);
  return { positions, indices };
}

// Component shapes: [width, height, depth]
const shapes = [
  [1.0, 1.0, 0.1],  // Door_L1
  [1.0, 1.0, 0.1],  // Door_L6
  [0.1, 8.0, 0.1],  // GuideRail_Left
  [0.1, 8.0, 0.1],  // GuideRail_Right
  [1.5, 2.0, 1.2],  // Car
  [0.05, 5.0, 0.05], // Cable_Main
];

// Build binary buffer
let bufferData = [];
let byteOffset = 0;

for (let i = 0; i < shapes.length; i++) {
  const { positions, indices } = createBox(...shapes[i]);

  // Positions accessor
  const posBytes = new Uint8Array(positions.buffer);
  gltf.bufferViews.push({ buffer: 0, byteOffset, byteLength: posBytes.byteLength, target: 34962 });
  const mins = [Infinity, Infinity, Infinity], maxs = [-Infinity, -Infinity, -Infinity];
  for (let v = 0; v < positions.length; v += 3) {
    for (let a = 0; a < 3; a++) { mins[a] = Math.min(mins[a], positions[v+a]); maxs[a] = Math.max(maxs[a], positions[v+a]); }
  }
  gltf.accessors.push({ bufferView: i * 2, componentType: 5126, count: 8, type: 'VEC3', min: mins, max: maxs });
  bufferData.push(posBytes);
  byteOffset += posBytes.byteLength;

  // Indices accessor
  const idxBytes = new Uint8Array(indices.buffer);
  gltf.bufferViews.push({ buffer: 0, byteOffset, byteLength: idxBytes.byteLength, target: 34963 });
  gltf.accessors.push({ bufferView: i * 2 + 1, componentType: 5123, count: indices.length, type: 'SCALAR' });
  bufferData.push(idxBytes);
  byteOffset += idxBytes.byteLength;
}

// Combine buffer
const totalBuffer = Buffer.concat(bufferData);
gltf.buffers.push({ byteLength: totalBuffer.byteLength });

// Pack as GLB
const jsonStr = JSON.stringify(gltf);
const jsonPad = jsonStr.length % 4 === 0 ? jsonStr : jsonStr + ' '.repeat(4 - (jsonStr.length % 4));
const jsonBuf = Buffer.from(jsonPad, 'utf8');
const binPad = totalBuffer.length % 4 === 0 ? totalBuffer : Buffer.concat([totalBuffer, Buffer.alloc(4 - (totalBuffer.length % 4))]);

const header = Buffer.alloc(12);
header.writeUInt32LE(0x46546C67, 0); // magic: glTF
header.writeUInt32LE(2, 4); // version
header.writeUInt32LE(12 + 8 + jsonBuf.length + 8 + binPad.length, 8); // total length

const jsonChunkHeader = Buffer.alloc(8);
jsonChunkHeader.writeUInt32LE(jsonBuf.length, 0);
jsonChunkHeader.writeUInt32LE(0x4E4F534A, 4); // JSON

const binChunkHeader = Buffer.alloc(8);
binChunkHeader.writeUInt32LE(binPad.length, 0);
binChunkHeader.writeUInt32LE(0x004E4942, 4); // BIN

const glb = Buffer.concat([header, jsonChunkHeader, jsonBuf, binChunkHeader, binPad]);
writeFileSync('public/models/shaft.glb', glb);
console.log(`Generated shaft.glb (${glb.byteLength} bytes)`);
