/**
 * ComponentList.tsx - Sidebar component list with search and filter
 *
 * Displays all elevator shaft components in a scrollable list.
 * Features:
 * - Text search (filters by name or type)
 * - Condition filter pills (All / Good / Fair / Poor)
 * - Animated list items with selection highlighting
 * - Syncs with 3D viewport selection
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import type { Component } from '../../shared/types';

interface Props {
  components: Component[];
  selected: Component | null;
  onSelect: (c: Component) => void;
}

type ConditionFilter = 'all' | 'good' | 'fair' | 'poor';

export default function ComponentList({ components, selected, onSelect }: Props) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ConditionFilter>('all');

  // Filter components by search text and condition filter
  const filtered = useMemo(() => {
    return components.filter((c) => {
      const matchesSearch = search === '' ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.type.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'all' || c.condition === filter;
      return matchesSearch && matchesFilter;
    });
  }, [components, search, filter]);

  return (
    <aside className="sidebar">
      {/* Search input with icon */}
      <div className="sidebar__search">
        <Search size={14} className="sidebar__search-icon" />
        <input
          type="text"
          placeholder="Search components..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sidebar__search-input"
        />
      </div>

      {/* Condition filter pills */}
      <div className="sidebar__filters">
        {(['all', 'good', 'fair', 'poor'] as ConditionFilter[]).map((f) => (
          <button
            key={f}
            className={`filter-pill ${filter === f ? 'filter-pill--active' : ''} ${f !== 'all' ? `filter-pill--${f}` : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Component count header */}
      <div className="sidebar__title">
        Components ({filtered.length}{filtered.length !== components.length ? `/${components.length}` : ''})
      </div>

      {/* Scrollable component cards */}
      <div className="sidebar__list">
        {filtered.map((comp, i) => (
          <motion.div
            key={comp.id}
            className={`component-card ${selected?.id === comp.id ? 'component-card--selected' : ''}`}
            onClick={() => onSelect(comp)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Condition dot indicator */}
            <div className={`component-card__indicator component-card__indicator--${comp.condition}`} />
            <div className="component-card__info">
              <div className="component-card__name">{comp.name}</div>
              <div className="component-card__type">{comp.type.replace('_', ' ')}</div>
            </div>
            {/* Condition badge */}
            <span className={`component-card__badge component-card__badge--${comp.condition}`}>
              {comp.condition}
            </span>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <p className="sidebar__empty">No components match your search.</p>
        )}
      </div>
    </aside>
  );
}
