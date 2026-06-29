/**
 * main.tsx - Application entry point
 *
 * Mounts the React app to the DOM and imports global styles.
 */

import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

createRoot(document.getElementById('root')!).render(<App />);
