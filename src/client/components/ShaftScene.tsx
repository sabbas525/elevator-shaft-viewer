import { Canvas, ThreeEvent } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import type { Component } from '../../shared/types';

interface Props {
  onSelect: (c: Component) => void;
  selected: Component | null;
}

function ShaftModel({ onSelect, selected }: Props) {
  const [scene, setScene] = useState<THREE.Group | null>(null);
  const [components, setComponents] = useState<Component[]>([]);
  const originalMaterials = useRef<Map<string, THREE.Material | THREE.Material[]>>(new Map());

  useEffect(() => {
    fetch('/api/shafts/1')
      .then((r) => r.json())
      .then((data) => setComponents(data.components));
  }, []);

  useEffect(() => {
    const mtlLoader = new MTLLoader();
    mtlLoader.setPath('/models/');
    mtlLoader.load('shaft.mtl', (materials) => {
      materials.preload();
      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.setPath('/models/');
      objLoader.load('shaft.obj', (obj) => {
        // Store original materials
        obj.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            originalMaterials.current.set(child.parent?.name || child.name, child.material);
          }
        });
        setScene(obj);
      });
    });
  }, []);

  // Highlight selected
  useEffect(() => {
    if (!scene) return;
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const objName = child.parent?.name || child.name;
        if (selected?.mesh_name === objName) {
          child.material = new THREE.MeshStandardMaterial({
            color: 0x4488ff,
            emissive: 0x2244aa,
            emissiveIntensity: 0.5,
          });
        } else {
          const orig = originalMaterials.current.get(objName);
          if (orig) child.material = orig as THREE.Material;
        }
      }
    });
  }, [selected, scene]);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    // OBJ groups objects as parent Group with name, mesh is child
    const objName = e.object.parent?.name || e.object.name;
    const comp = components.find((c) => c.mesh_name === objName);
    if (comp) onSelect(comp);
  };

  if (!scene) return null;
  return <primitive object={scene} onClick={handleClick} />;
}

export default function ShaftScene({ onSelect, selected }: Props) {
  return (
    <Canvas camera={{ position: [3, 12, 6], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 15, 5]} intensity={1} />
      <ShaftModel onSelect={onSelect} selected={selected} />
      <OrbitControls target={[0, 10, 0]} />
    </Canvas>
  );
}
