# Code Walkthrough

How each part of the codebase works.

---

## Architecture

```
Browser (React + Three.js)  ←→  Vite Dev Server (proxy)  ←→  Express API  ←→  SQLite
         ↓
   OBJ/MTL 3D model
   loaded from /public
```

Two runtime processes via `concurrently`:
1. Vite — serves frontend, proxies `/api/*` to backend
2. Express — REST API on port 3001

---

## Files

### `src/shared/types.ts`

TypeScript interfaces shared between frontend and backend. The `mesh_name` field on `Component` is the bridge between 3D geometry and database records.

### `src/server/db.ts`

Creates SQLite tables and seeds sample data on first run. Uses `better-sqlite3` (synchronous API — no async needed). WAL mode for concurrent reads. `SELECT COUNT(*)` guard prevents re-seeding on restart.

### `src/server/routes.ts`

Three read-only endpoints. Parameterized queries prevent SQL injection. The shaft detail endpoint returns embedded components in a single response.

### `src/server/index.ts`

Express setup: CORS + routes mounted under `/api`.

### `src/client/App.tsx`

Holds `selected` state. Scene writes to it, panel reads from it. No state library needed for two consumers.

### `src/client/components/ShaftScene.tsx`

The complex one. Does four things:

1. **Loads OBJ model** — MTL must load first (materials), then OBJ uses `setMaterials()` before loading geometry.
2. **Fetches component data** — Calls `/api/shafts/1` for the mesh_name→component mapping.
3. **Handles clicks** — OBJ objects are `Group → Mesh`, so use `e.object.parent.name` to get the named object, then look up the component.
4. **Highlights selection** — Caches original materials in a `useRef` Map. Swaps selected mesh to a blue emissive material, restores others. New material instances (not mutations) because OBJ shares materials across objects with same `usemtl`.

### `src/client/components/InfoPanel.tsx`

Displays selected component info + fetches inspection history. Color-codes conditions (green/yellow/red). Re-fetches on selection change via `useEffect` dependency.

### `public/models/shaft.obj`

6 named objects (`o Door_L1`, `o Car`, etc.) — each name matches a `mesh_name` in the DB. This is the digital twin binding: geometry ↔ data through naming convention.

### `public/models/shaft.mtl`

4 materials with different metallic/roughness values. Referenced via `usemtl` in the OBJ.

### `vite.config.ts`

React plugin + dev server proxy (`/api` → `localhost:3001`).

---

## Notable Implementation Details

| Area | Detail |
|------|--------|
| OBJ hierarchy | `o ObjectName` creates a Group node; actual Mesh is a child. Click target is the Mesh, name is on the parent. |
| Material caching | `useRef<Map>` stores originals on first load. Highlight creates new `MeshStandardMaterial` instance — never mutate shared materials. |
| ES modules + `__dirname` | Reconstructed via `path.dirname(fileURLToPath(import.meta.url))` since ESM doesn't have it. |
| Async loader chain | MTLLoader.load() → materials.preload() → OBJLoader.setMaterials() → OBJLoader.load(). Wrong order = grey meshes. |
