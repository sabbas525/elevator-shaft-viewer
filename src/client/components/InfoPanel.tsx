/**
 * InfoPanel.tsx - Component detail panel with inspection timeline
 *
 * Displays detailed information about the selected component:
 * - Component name, type, and ID
 * - Condition status with severity icon
 * - Next scheduled inspection date
 * - Full inspection history as an animated vertical timeline
 *
 * Shows an empty state prompt when no component is selected.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, Calendar, FileText, X, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import type { Component, Inspection } from '../../shared/types';

// Condition display configuration - label and icon for each severity
const conditionConfig: Record<string, { label: string; icon: typeof Shield }> = {
  good: { label: 'Good Condition', icon: ShieldCheck },
  fair: { label: 'Fair — Needs Monitoring', icon: Shield },
  poor: { label: 'Poor — Action Required', icon: ShieldAlert },
};

interface Props {
  component: Component | null;
  onClose: () => void;
}

export default function InfoPanel({ component, onClose }: Props) {
  const [inspections, setInspections] = useState<Inspection[]>([]);

  // Fetch inspection history when a component is selected
  useEffect(() => {
    if (!component) {
      setInspections([]);
      return;
    }
    fetch(`/api/components/${component.id}/inspections`)
      .then((r) => r.json())
      .then(setInspections);
  }, [component]);

  // Empty state — no component selected
  if (!component) {
    return (
      <aside className="detail-panel">
        <div className="detail-panel__empty">
          <div className="detail-panel__empty-icon">
            <Info size={28} />
          </div>
          <p className="detail-panel__empty-text">
            Select a component from the 3D model or the sidebar to view inspection details.
          </p>
        </div>
      </aside>
    );
  }

  const config = conditionConfig[component.condition] ?? conditionConfig.good;
  const ConditionIcon = config.icon;

  return (
    <aside className="detail-panel">
      <AnimatePresence mode="wait">
        <motion.div
          key={component.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          {/* Close button to deselect */}
          <button className="detail-panel__close" onClick={onClose} aria-label="Close panel">
            <X size={16} />
          </button>

          {/* Component header — name, type, condition badge */}
          <div className="detail-panel__header">
            <h2 className="detail-panel__name">{component.name}</h2>
            <p className="detail-panel__type">
              {component.type.replace('_', ' ')} • ID #{component.id}
            </p>
            <div className={`detail-panel__condition detail-panel__condition--${component.condition}`}>
              <ConditionIcon size={16} />
              <span>{config.label}</span>
            </div>
            {/* Next scheduled inspection date */}
            {component.next_inspection && (
              <div className="detail-panel__next-inspection">
                <Calendar size={12} />
                <span>Next inspection: <strong>{formatDate(component.next_inspection)}</strong></span>
              </div>
            )}
          </div>

          {/* Inspection history timeline */}
          <div className="timeline">
            <h3 className="timeline__title">
              <Calendar size={12} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              Inspection History ({inspections.length})
            </h3>
            <div className="timeline__list">
              {inspections.map((insp, i) => (
                <motion.div
                  key={insp.id}
                  className="timeline__item"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  {/* Colored dot indicating condition at time of inspection */}
                  <div className={`timeline__dot timeline__dot--${insp.condition}`} />
                  <div className="timeline__date">{formatDate(insp.date)}</div>
                  <div className={`timeline__condition timeline__condition--${insp.condition}`}>
                    {insp.condition}
                  </div>
                  {insp.notes && (
                    <div className="timeline__notes">
                      <FileText size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                      {insp.notes}
                    </div>
                  )}
                </motion.div>
              ))}
              {inspections.length === 0 && (
                <p className="timeline__empty">No inspection records found.</p>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </aside>
  );
}

/** Format ISO date string to readable format (e.g., "Jan 15, 2026") */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
