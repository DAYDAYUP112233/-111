import * as THREE from 'three';

export type TreeState = 'CHAOS' | 'FORMED';

export interface ParticleProps {
  count: number;
  treeState: TreeState;
}

export interface OrnamentProps {
  count: number;
  type: 'sphere' | 'box' | 'light';
  treeState: TreeState;
  colorPalette: string[];
  scaleRange: [number, number];
  speedFactor: number; // Represents weight (heavier = slower)
}

export interface DualPosition {
  chaos: THREE.Vector3;
  target: THREE.Vector3;
}
