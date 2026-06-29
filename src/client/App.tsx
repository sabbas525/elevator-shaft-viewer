/**
 * App.tsx - Root application component
 *
 * Manages global state (selected component, shaft data, theme, fullscreen)
 * and orchestrates the three-panel layout: sidebar, 3D viewport, and detail panel.
 * Also handles keyboard navigation and report export.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertTriangle, CheckCircle, Building2, Sun, Moon, Maximize2, Minimize2, Download } from 'lucide-react';
import ShaftScene from './components/ShaftScene';
import InfoPanel from './components/InfoPanel';
import ComponentList from './components/ComponentList';
import { useTheme } from './useTheme';
import { generateReport } from './report';
import './styles.css';
import type { Component, ShaftDetail } from '../shared/types';

export default function App() {
  const [selected, setSelected] = useState<Component | null>(null);
  const [shaft, setShaft] = useState<ShaftDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const { theme, toggle } = useTheme();
  const viewportRef = useRef<HTMLDivElement>(null);

  // Fetch shaft data (components + metadata) on mount
  useEffect(() => {
    fetch('/api/shafts/1')
      .then((r) => r.json())
      .then((data: ShaftDetail) => {
        setShaft(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Derive condition counts for the header stats
  const components = shaft?.components ?? [];
  const goodCount = components.filter((c) => c.condition === 'good').length;
  const fairCount = components.filter((c) => c.condition === 'fair').length;
  const poorCount = components.filter((c) => c.condition === 'poor').length;

  /**
   * Keyboard navigation handler:
   * - Arrow Down/Right: select next component (wraps around)
   * - Arrow Up/Left: select previous component (wraps around)
   * - Escape: deselect current component
   */
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (components.length === 0) return;

    if (e.key === 'Escape') {
      setSelected(null);
      return;
    }

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      setSelected((prev) => {
        if (!prev) return components[0];
        const idx = components.findIndex((c) => c.id === prev.id);
        return components[(idx + 1) % components.length];
      });
    }

    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      setSelected((prev) => {
        if (!prev) return components[components.length - 1];
        const idx = components.findIndex((c) => c.id === prev.id);
        return components[(idx - 1 + components.length) % components.length];
      });
    }
  }, [components]);

  // Register/unregister keyboard listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Toggle fullscreen mode (hides sidebar + detail panel)
  const toggleFullscreen = () => setFullscreen((f) => !f);

  // Export inspection report as downloadable .txt file
  const handleExport = () => {
    if (!shaft) return;
    generateReport(shaft, components);
  };

  // Loading state while fetching shaft data
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-screen__spinner" />
        <p>Loading shaft data...</p>
      </div>
    );
  }

  return (
    <div className={`app-layout ${fullscreen ? 'app-layout--fullscreen' : ''}`}>
      {/* Header — shaft info, condition stats, action buttons */}
      <header className="app-header">
        <div className="app-header__brand">
          <div className="app-header__logo">
            <Building2 size={18} color="white" />
          </div>
          <div>
            <div className="app-header__title">
              {shaft?.name ?? 'Elevator Shaft'}
            </div>
            <div className="app-header__subtitle">
              {shaft?.address ?? ''} {shaft ? `• ${shaft.floors} floors` : ''}
            </div>
          </div>
        </div>

        {/* Live condition breakdown stats */}
        <div className="app-header__stats">
          <motion.div
            className="stat-item stat-item--good"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="stat-item__value">{goodCount}</span>
            <span className="stat-item__label">
              <CheckCircle size={10} style={{ marginRight: 3, verticalAlign: 'middle' }} />
              Good
            </span>
          </motion.div>
          <motion.div
            className="stat-item stat-item--fair"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="stat-item__value">{fairCount}</span>
            <span className="stat-item__label">
              <AlertTriangle size={10} style={{ marginRight: 3, verticalAlign: 'middle' }} />
              Fair
            </span>
          </motion.div>
          <motion.div
            className="stat-item stat-item--poor"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <span className="stat-item__value">{poorCount}</span>
            <span className="stat-item__label">
              <Activity size={10} style={{ marginRight: 3, verticalAlign: 'middle' }} />
              Poor
            </span>
          </motion.div>
        </div>

        {/* Action buttons: export, fullscreen, theme toggle */}
        <div className="app-header__actions">
          <button className="header-btn" onClick={handleExport} title="Export Report">
            <Download size={14} />
            <span>Report</span>
          </button>
          <button className="header-btn" onClick={toggleFullscreen} title="Toggle Fullscreen">
            {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button className="theme-toggle" onClick={toggle} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
      </header>

      {/* Sidebar — search, filter, component list (hidden in fullscreen) */}
      {!fullscreen && (
        <ComponentList
          components={components}
          selected={selected}
          onSelect={setSelected}
        />
      )}

      {/* 3D Viewport — interactive Three.js scene */}
      <div className="viewport" ref={viewportRef}>
        <ShaftScene onSelect={setSelected} selected={selected} theme={theme} components={components} />
        <AnimatePresence>
          {!selected && (
            <motion.div
              className="viewport__hint"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.8, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              Click to inspect • Scroll to zoom • Drag to rotate • ↑↓ to cycle
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Detail Panel — inspection data for selected component (hidden in fullscreen) */}
      {!fullscreen && (
        <InfoPanel component={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
