# Changelog

All notable changes to the Elevator Shaft Viewer project.

## [2.0.0] - 2026-06-29

### Complete UI/UX Redesign

**Theme System**
- Added dark/light theme toggle with smooth transitions
- Theme persists to localStorage across sessions
- Respects system preference (prefers-color-scheme) on first visit
- 3D scene adapts lighting, fog, ground, and environment per theme

**Layout & Design**
- Three-panel dashboard layout: sidebar, 3D viewport, detail panel
- Modern dark theme with CSS custom properties for full theming
- Header with shaft metadata, live condition stats, and action buttons
- Inter font with polished typography throughout
- Loading screen with spinner on initial data fetch
- Custom scrollbar styling

**3D Viewport Improvements**
- Rebuilt elevator shaft OBJ model with realistic geometry:
  - Semi-transparent shaft enclosure walls
  - Sliding doors with frames at floors 1 and 6
  - T-profile guide rails with mounting brackets
  - Detailed car cabin (floor, ceiling, walls, door opening, top frame)
  - Multi-strand cables with attachment plates
- HDRI environment map for realistic reflections (night/city per theme)
- Contact shadows and ground plane for visual grounding
- Depth fog for atmospheric perspective
- Three-point lighting setup with shadows
- Hover highlight (blue glow) with cursor change
- Selection highlight with condition-colored glow (green/amber/red)
- Smooth camera animation that focuses on the selected component
- OrbitControls with damping, zoom limits, and angle constraints

**3D Labels & Tooltip**
- Floating HTML labels on each component in the 3D viewport
- Labels show component name with condition-colored left border
- Selected label highlighted in blue
- Hover tooltip showing component name and condition above the hovered mesh

**Component Sidebar**
- Search bar to filter components by name or type
- Condition filter pills (All / Good / Fair / Poor)
- Animated component cards with condition dot, name, type, and badge
- Selection syncs with 3D viewport and detail panel

**Detail Panel**
- Animated slide-in when component is selected
- Condition status badge with severity icon (ShieldCheck/Shield/ShieldAlert)
- Next scheduled inspection date display
- Visual inspection timeline with:
  - Vertical connecting line
  - Condition-colored dots
  - Formatted dates
  - Inspector notes
- Close button to deselect

**Keyboard Navigation**
- Arrow Up/Left: select previous component
- Arrow Down/Right: select next component
- Escape: deselect current component

**Fullscreen Mode**
- Toggle button in header to expand 3D viewport full-width
- Hides sidebar and detail panel for focused viewing
- Toggle back to restore three-panel layout

**Export Report**
- "Report" button generates a formatted .txt inspection report
- Report includes: shaft info, condition summary, component details, recommendations
- Auto-downloads with a timestamped filename

### Data Enhancements

- Added `next_inspection` field to components table
- Expanded inspection history from 6 to 21 records
- Inspection notes are more detailed with actionable observations
- Cable component shows progressive degradation (good → fair → poor)

### Code Quality

- JSDoc comments on all source files explaining purpose and behavior
- Inline comments on key logic (keyboard handler, material management, camera animation)
- Type-safe component props throughout

### Dependencies Added

- `framer-motion` — animations and transitions
- `lucide-react` — consistent iconography
- `@react-three/postprocessing` — available for future visual effects

---

## [1.0.0] - 2026-06-08

### Initial Release

- Basic React + Three.js app with OBJ model loading
- Express API with SQLite database
- Click-to-select component interaction
- Simple side panel showing condition and inspection history
- Placeholder box-geometry 3D model
