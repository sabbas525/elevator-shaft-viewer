import { useState } from 'react';
import ShaftScene from './components/ShaftScene';
import InfoPanel from './components/InfoPanel';
import type { Component } from '../shared/types';

export default function App() {
  const [selected, setSelected] = useState<Component | null>(null);

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ flex: 1 }}>
        <ShaftScene onSelect={setSelected} selected={selected} />
      </div>
      <InfoPanel component={selected} />
    </div>
  );
}
