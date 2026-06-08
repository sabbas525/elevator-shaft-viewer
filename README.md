# Elevator Shaft Viewer

A web app that renders a 3D elevator shaft model and displays inspection data for each component. Click a component to see its condition and history.

Built as a prototype for exploring digital twin concepts in the elevator industry.

## Run It

```bash
npm install
npm run dev
```

Opens at http://localhost:5173

## Tech Stack

- **Frontend**: React + TypeScript + React Three Fiber
- **Backend**: Node.js + Express
- **Database**: SQLite (via better-sqlite3)
- **3D Format**: GLTF/GLB

## Project Structure

```
├── src/
│   ├── client/
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── ShaftScene.tsx
│   │   │   └── InfoPanel.tsx
│   │   └── main.tsx
│   ├── server/
│   │   ├── index.ts
│   │   ├── routes.ts
│   │   └── db.ts
│   └── shared/
│       └── types.ts
├── public/
│   └── models/
│       └── shaft.glb
├── scripts/
│   └── generate-model.mjs
└── package.json
```

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/shafts | List all shafts |
| GET | /api/shafts/:id | Shaft details + components |
| GET | /api/components/:id/inspections | Inspection history |

## Regenerating the 3D Model

The included `shaft.glb` is a placeholder with basic box geometry. To regenerate:

```bash
node scripts/generate-model.mjs
```

Replace with a proper Blender export for production use. Ensure mesh names match the `mesh_name` column in the database.
