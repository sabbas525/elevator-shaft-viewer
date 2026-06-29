/**
 * report.ts - Inspection report generator
 *
 * Generates a formatted text report summarizing the shaft's condition,
 * component details, and maintenance recommendations.
 * Triggers a browser download of the .txt file.
 */

import type { Component, ShaftDetail } from '../shared/types';

/**
 * Generate and download an inspection report for the given shaft.
 * The report includes:
 * - Shaft metadata (name, address, floors)
 * - Overall condition summary with counts
 * - Per-component condition and next inspection date
 * - Recommendations based on condition severity
 */
export function generateReport(shaft: ShaftDetail, components: Component[]) {
  const now = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const goodCount = components.filter((c) => c.condition === 'good').length;
  const fairCount = components.filter((c) => c.condition === 'fair').length;
  const poorCount = components.filter((c) => c.condition === 'poor').length;

  // Determine overall status based on worst condition present
  const overallStatus = poorCount > 0 ? 'ACTION REQUIRED' : fairCount > 0 ? 'MONITOR' : 'ALL CLEAR';

  let report = `
════════════════════════════════════════════════════════════
  ELEVATOR SHAFT INSPECTION REPORT
════════════════════════════════════════════════════════════

Generated: ${now}

SHAFT INFORMATION
─────────────────
  Name:     ${shaft.name}
  Address:  ${shaft.address ?? 'N/A'}
  Floors:   ${shaft.floors}

OVERALL STATUS: ${overallStatus}
─────────────────
  Good:  ${goodCount} component(s)
  Fair:  ${fairCount} component(s)
  Poor:  ${poorCount} component(s)
  Total: ${components.length} component(s)

COMPONENT DETAILS
─────────────────
`;

  // List each component with its current condition and next inspection
  for (const comp of components) {
    const status = comp.condition === 'poor' ? '⚠️  POOR' : comp.condition === 'fair' ? '⚡ FAIR' : '✓  GOOD';
    report += `
  ${comp.name}
    Type:             ${comp.type.replace('_', ' ')}
    Condition:        ${status}
    Next Inspection:  ${comp.next_inspection ?? 'Not scheduled'}
`;
  }

  // Recommendations section based on condition severity
  report += `
════════════════════════════════════════════════════════════
  RECOMMENDATIONS
════════════════════════════════════════════════════════════
`;

  const poorComponents = components.filter((c) => c.condition === 'poor');
  const fairComponents = components.filter((c) => c.condition === 'fair');

  if (poorComponents.length > 0) {
    report += `\n  IMMEDIATE ACTION REQUIRED:\n`;
    for (const c of poorComponents) {
      report += `    • ${c.name} — Schedule repair/replacement immediately\n`;
    }
  }

  if (fairComponents.length > 0) {
    report += `\n  MONITORING REQUIRED:\n`;
    for (const c of fairComponents) {
      report += `    • ${c.name} — Increase inspection frequency\n`;
    }
  }

  if (poorComponents.length === 0 && fairComponents.length === 0) {
    report += `\n  All components are in good condition. Maintain regular inspection schedule.\n`;
  }

  report += `
════════════════════════════════════════════════════════════
  End of Report
════════════════════════════════════════════════════════════
`;

  // Trigger browser download
  const blob = new Blob([report], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `shaft-report-${shaft.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
