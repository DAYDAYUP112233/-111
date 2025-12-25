import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ParticleProps } from '../types';
import { SETTINGS, PALETTES, getRandomSpherePoint, getTreePoint } from '../constants';

const Foliage: React.FC<ParticleProps> = ({ count, treeState }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Generate attributes once
  const { positions, targets, colors, randoms } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const tar = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const rnd = new Float32Array(count);
    const colorObj = new THREE.Color();

    for (let i = 0; i < count; i++) {
      // Chaos Position
      const chaosPt = getRandomSpherePoint(SETTINGS.CHAOS_RADIUS);
      pos[i * 3] = chaosPt.x;
      pos[i * 3 + 1] = chaosPt.y;
      pos[i * 3 + 2] = chaosPt.z;

      // Target Position (Tree)
      const yRatio = Math.random(); // 0 to 1
      const treePt = getTreePoint(SETTINGS.TREE_HEIGHT, SETTINGS.TREE_RADIUS, yRatio);
      tar[i * 3] = treePt.x;
      tar[i * 3 + 1] = treePt.y;
      tar[i * 3 + 2] = treePt.z;

      // Color (Pick random from palette)
      const paletteHex = PALETTES.FOLIAGE[Math.floor(Math.random() * PALETTES.FOLIAGE.length)];
      colorObj.set(paletteHex);
      
      // Add slight variation to color for realism
      colorObj.r += (Math.random() - 0.5) * 0.1;
      colorObj.g += (Math.random() - 0.5) * 0.1;
      colorObj.b += (Math.random() - 0.5) * 0.1;

      col[i * 3] = colorObj.r;
      col[i * 3 + 1] = colorObj.g;
      col[i * 3 + 2] = colorObj.b;
      
      // Random scale/twinkle factor
      rnd[i] = Math.random();
    }

    return {
      positions: pos,
      targets: tar,
      colors: col,
      randoms: rnd
    };
  }, [count]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uProgress: { value: 0 }, // 0 = Chaos, 1 = Tree
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    uSize: { value: 12.0 }
  }), []);

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      
      // Lerp logic for the entire system state
      const targetProgress = treeState === 'FORMED' ? 1 : 0;
      // Smooth interpolation for the global uniform
      materialRef.current.uniforms.uProgress.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uProgress.value,
        targetProgress,
        delta * 2.5 // Transition speed
      );
    }
  });

  const vertexShader = `
    uniform float uTime;
    uniform float uProgress;
    uniform float uPixelRatio;
    uniform float uSize;

    attribute vec3 aTarget;
    attribute float aRandom;
    
    varying vec3 vColor;
    varying float vAlpha;

    void main() {
      vColor = color;
      
      // Morph between chaos (position) and tree (aTarget)
      vec3 finalPos = mix(position, aTarget, uProgress);
      
      // Add some "breathing" wind effect when formed
      if (uProgress > 0.8) {
        float wind = sin(uTime * 2.0 + finalPos.y * 0.5) * 0.1 * uProgress;
        finalPos.x += wind;
        finalPos.z += wind * 0.5;
      }
      
      // Add subtle noise movement in chaos mode
      if (uProgress < 0.2) {
         finalPos.y += sin(uTime + aRandom * 10.0) * 0.05;
      }

      vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      
      // Size attenuation
      gl_PointSize = uSize * uPixelRatio * (1.0 + aRandom) * (1.0 / -mvPosition.z);
      
      // Fade out slightly during transition to look like magic dust
      vAlpha = 0.6 + 0.4 * sin(uTime * 3.0 + aRandom * 10.0); 
    }
  `;

  const fragmentShader = `
    varying vec3 vColor;
    varying float vAlpha;

    void main() {
      // Circular particle
      vec2 xy = gl_PointCoord.xy - vec2(0.5);
      float ll = length(xy);
      if (ll > 0.5) discard;
      
      // Soft edge
      float strength = 1.0 - smoothstep(0.3, 0.5, ll);
      
      gl_FragColor = vec4(vColor, vAlpha * strength);
    }
  `;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aTarget" count={count} array={targets} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-aRandom" count={count} array={randoms} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexColors
      />
    </points>
  );
};

export default Foliage;
