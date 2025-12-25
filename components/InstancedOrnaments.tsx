import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { OrnamentProps } from '../types';
import { SETTINGS, getRandomSpherePoint, getTreePoint } from '../constants';

const InstancedOrnaments: React.FC<OrnamentProps> = ({ 
  count, 
  type, 
  treeState, 
  colorPalette, 
  scaleRange,
  speedFactor 
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Initialize data for physics simulation
  const data = useMemo(() => {
    const items = [];
    const colorArray = new Float32Array(count * 3);
    const _color = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const chaos = getRandomSpherePoint(SETTINGS.CHAOS_RADIUS);
      // Ensure ornaments are slightly outside the foliage volume
      const yRatio = Math.random();
      
      // Tree shape logic specifically for ornaments (surface only)
      const height = SETTINGS.TREE_HEIGHT;
      const y = yRatio * height - (height / 2);
      const r = SETTINGS.TREE_RADIUS * (1 - yRatio) + 0.5; // +0.5 to sit on outside
      const angle = Math.random() * Math.PI * 2;
      const x = r * Math.cos(angle);
      const z = r * Math.sin(angle);
      
      const target = new THREE.Vector3(x, y, z);

      // Random color assignment
      _color.set(colorPalette[Math.floor(Math.random() * colorPalette.length)]);
      _color.toArray(colorArray, i * 3);

      const scale = scaleRange[0] + Math.random() * (scaleRange[1] - scaleRange[0]);

      items.push({
        current: chaos.clone(), // Start at chaos
        chaos: chaos,
        target: target,
        scale: new THREE.Vector3(scale, scale, scale),
        rotationAxis: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize(),
        rotationSpeed: (Math.random() - 0.5) * 2
      });
    }
    return { items, colorArray };
  }, [count, colorPalette, scaleRange]);

  useLayoutEffect(() => {
    // Set initial colors
    if (meshRef.current) {
        for (let i = 0; i < count; i++) {
            const r = data.colorArray[i * 3];
            const g = data.colorArray[i * 3 + 1];
            const b = data.colorArray[i * 3 + 2];
            meshRef.current.setColorAt(i, new THREE.Color(r, g, b));
        }
        meshRef.current.instanceColor!.needsUpdate = true;
    }
  }, [data]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const targetActive = treeState === 'FORMED';
    const dummy = new THREE.Object3D();

    data.items.forEach((item, i) => {
      const dest = targetActive ? item.target : item.chaos;
      
      // Lerp position based on weight (speedFactor)
      // Heavier items (lower speedFactor) move slower
      item.current.lerp(dest, delta * speedFactor);

      // Add rotation
      dummy.position.copy(item.current);
      dummy.scale.copy(item.scale);
      
      // Rotate objects in chaos, stabilize in tree
      if (!targetActive) {
          dummy.rotateOnAxis(item.rotationAxis, item.rotationSpeed * delta);
      } else {
          // Slowly align to upright or keep slight spin
          dummy.rotation.x = THREE.MathUtils.lerp(dummy.rotation.x, 0, delta);
          dummy.rotation.z = THREE.MathUtils.lerp(dummy.rotation.z, 0, delta);
      }
      
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  // Material selection based on type
  const geometry = useMemo(() => {
    if (type === 'box') return new THREE.BoxGeometry(1, 1, 1);
    return new THREE.SphereGeometry(1, 16, 16);
  }, [type]);

  const material = useMemo(() => {
     // High gloss material for luxury look
     return new THREE.MeshStandardMaterial({
         metalness: 0.9,
         roughness: 0.1,
         envMapIntensity: 1.5,
     });
  }, []);
  
  const lightMaterial = useMemo(() => {
      return new THREE.MeshStandardMaterial({
          emissive: new THREE.Color(2, 2, 2), // Boost brightness for bloom
          emissiveIntensity: 2,
          toneMapped: false,
          color: new THREE.Color(1,1,1)
      })
  }, []);

  return (
    <instancedMesh 
      ref={meshRef} 
      args={[geometry, type === 'light' ? lightMaterial : material, count]} 
      castShadow 
      receiveShadow
    />
  );
};

export default InstancedOrnaments;
