import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { TreeState } from '../types';
import Foliage from './Foliage';
import InstancedOrnaments from './InstancedOrnaments';
import { SETTINGS, PALETTES } from '../constants';
import * as THREE from 'three';

interface SceneProps {
  treeState: TreeState;
}

const RotatingCamera = ({ active }: { active: boolean }) => {
    useFrame((state) => {
        if(active) {
            const t = state.clock.getElapsedTime();
            // Slow luxury rotation
            state.camera.position.x = Math.sin(t * 0.1) * 30;
            state.camera.position.z = Math.cos(t * 0.1) * 30;
            state.camera.lookAt(0, 0, 0);
        }
    });
    return null;
}

const Lights = () => {
    return (
        <group>
            <ambientLight intensity={0.3} color="#001005" />
            {/* Main Warm Gold Light */}
            <spotLight 
                position={[10, 20, 10]} 
                angle={0.5} 
                penumbra={1} 
                intensity={500} 
                color="#ffecb3" 
                castShadow 
                shadow-bias={-0.0001}
            />
             {/* Festive Red Fill Light */}
             <spotLight 
                position={[-15, 10, -10]} 
                angle={0.6} 
                penumbra={1} 
                intensity={400} 
                color="#d90429" 
            />
            {/* Snowy Blue/White Rim Light */}
            <pointLight position={[0, -5, 15]} intensity={150} color="#e0f7fa" distance={25} />
        </group>
    );
};

const Scene: React.FC<SceneProps> = ({ treeState }) => {
  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: false, toneMapping: THREE.ReinhardToneMapping, toneMappingExposure: 1.5 }}>
      <PerspectiveCamera makeDefault position={[0, 5, 35]} fov={50} />
      <RotatingCamera active={treeState === 'FORMED'} />
      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 2.5} 
        maxPolarAngle={Math.PI / 1.8} 
        minDistance={10}
        maxDistance={50}
        autoRotate={false}
      />
      
      <Lights />
      
      {/* Magical Christmas Night Environment */}
      <Environment preset="night" blur={0.6} />

      <Suspense fallback={null}>
        <group position={[0, 0, 0]}>
          {/* 1. The Needles/Leaves (Fast Shader Morphing) */}
          <Foliage count={SETTINGS.PARTICLE_COUNT} treeState={treeState} />

          {/* 2. Ornaments: Large Balls (Heavier Physics) */}
          <InstancedOrnaments 
            count={SETTINGS.ORNAMENT_BALL_COUNT}
            type="sphere"
            treeState={treeState}
            colorPalette={PALETTES.ORNAMENTS_BALLS}
            scaleRange={[0.3, 0.6]}
            speedFactor={2.0} // Medium weight
          />

          {/* 3. Ornaments: Gifts (Heaviest) */}
          <InstancedOrnaments 
            count={SETTINGS.ORNAMENT_GIFT_COUNT}
            type="box"
            treeState={treeState}
            colorPalette={PALETTES.ORNAMENTS_GIFTS}
            scaleRange={[0.4, 0.7]}
            speedFactor={1.5} // Slowest/Heaviest
          />
          
          {/* 4. Ornaments: Lights (Lightest, floaty) */}
          <InstancedOrnaments 
             count={SETTINGS.LIGHTS_COUNT}
             type="light"
             treeState={treeState}
             colorPalette={PALETTES.LIGHTS}
             scaleRange={[0.05, 0.1]}
             speedFactor={4.0} // Fastest
          />
        </group>

        <ContactShadows resolution={1024} scale={50} blur={2} opacity={0.5} far={10} color="#000000" />
      </Suspense>

      <EffectComposer enableNormalPass={false}>
        {/* Cinematic Christmas Glow */}
        <Bloom 
            luminanceThreshold={1.1} 
            mipmapBlur 
            intensity={1.5} 
            radius={0.5}
            color="#fff0f5" // Slight pinkish/warm glow
        />
        <Vignette eskil={false} offset={0.1} darkness={1.2} />
      </EffectComposer>
    </Canvas>
  );
};

export default Scene;