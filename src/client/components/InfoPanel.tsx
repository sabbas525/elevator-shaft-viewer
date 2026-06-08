import { useEffect, useState } from 'react';
import type { Component, Inspection } from '../../shared/types';

const conditionColor = { good: '#22c55e', fair: '#eab308', poor: '#ef4444' };

export default function InfoPanel({ component }: { component: Component | null }) {
  const [inspections, setInspections] = useState<Inspection[]>([]);

  useEffect(() => {
    if (!component) return;
    fetch(`/api/components/${component.id}/inspections`)
      .then((r) => r.json())
      .then(setInspections);
  }, [component]);

  if (!component) {
    return (
      <aside style={panelStyle}>
        <h2>Elevator Shaft Viewer</h2>
        <p style={{ color: '#888' }}>Click a component in the 3D view to inspect it.</p>
      </aside>
    );
  }

  return (
    <aside style={panelStyle}>
      <h2>{component.name}</h2>
      <p>Type: {component.type}</p>
      <p>
        Condition:{' '}
        <span style={{ color: conditionColor[component.condition], fontWeight: 'bold' }}>
          {component.condition}
        </span>
      </p>
      <h3>Inspection History</h3>
      {inspections.map((i) => (
        <div key={i.id} style={{ borderLeft: '3px solid ' + conditionColor[i.condition as keyof typeof conditionColor], paddingLeft: 8, marginBottom: 8 }}>
          <strong>{i.date}</strong> — {i.condition}
          {i.notes && <p style={{ margin: '2px 0', color: '#666' }}>{i.notes}</p>}
        </div>
      ))}
    </aside>
  );
}

const panelStyle: React.CSSProperties = {
  width: 320,
  padding: 20,
  borderLeft: '1px solid #eee',
  overflowY: 'auto',
};
