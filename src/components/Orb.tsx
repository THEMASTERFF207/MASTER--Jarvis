import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';

const OrbVisual = ({ active }: { active: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Dynamic color based on activity
  const orbColor = active ? '#22d3ee' : '#0891b2';
  const distortAmount = active ? 0.6 : 0.4;
  const speed = active ? 4 : 2;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={meshRef} args={[1, 100, 100]} scale={2.2}>
        <MeshDistortMaterial
          color={orbColor}
          attach="material"
          distort={distortAmount}
          speed={speed}
          roughness={0}
          metalness={0.8}
          emissive={orbColor}
          emissiveIntensity={0.5}
        />
      </Sphere>
    </Float>
  );
};

export default function Orb({ active = false }: { active?: boolean }) {
  return (
    <div className="w-full h-[550px] relative pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} color="#22d3ee" intensity={0.5} />
        <OrbVisual active={active} />
      </Canvas>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.1)_0%,transparent_70%)]" />
    </div>
  );
}
