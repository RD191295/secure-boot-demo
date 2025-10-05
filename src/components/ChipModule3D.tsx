import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Module } from './constants';

interface ChipModule3DProps {
  module: Module;
  mode: 'normal' | 'tampered';
  showInternals: boolean;
  currentStage: number;
  isSelected: boolean;
  onClick: () => void;
}

const ChipModule3D: React.FC<ChipModule3DProps> = ({
  module,
  mode,
  showInternals,
  currentStage,
  isSelected,
  onClick,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const scaleX = module.size.width / 100;
  const scaleY = module.size.depth / 20;
  const scaleZ = module.size.height / 100;

  const x = (module.position.x - 350) / 100;
  const z = -(module.position.y - 250) / 100;
  const y = module.position.z / 100;

  const getColor = () => {
    if (mode === 'tampered' && module.type === 'crypto' && currentStage >= 5) {
      return '#ef4444';
    }
    if (module.isActive) {
      return '#06b6d4';
    }
    const colorMap: Record<string, string> = {
      'from-red-800 to-red-600': '#991b1b',
      'from-blue-800 to-blue-600': '#1e40af',
      'from-orange-800 to-orange-600': '#9a3412',
      'from-emerald-800 to-emerald-600': '#065f46',
      'from-teal-800 to-teal-600': '#115e59',
    };
    return colorMap[module.color] || '#374151';
  };

  const getEmissiveColor = () => {
    if (mode === 'tampered' && module.type === 'crypto' && currentStage >= 5) {
      return '#dc2626';
    }
    if (module.isActive) {
      return '#0891b2';
    }
    return '#000000';
  };

  useFrame((state) => {
    if (meshRef.current && module.isActive) {
      const time = state.clock.getElapsedTime();
      meshRef.current.position.y = y + Math.sin(time * 2) * 0.05;
    }
  });

  return (
    <group position={[x, y + 0.5, z]}>
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={[scaleX, scaleY, scaleZ]}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={getColor()}
          emissive={getEmissiveColor()}
          emissiveIntensity={module.isActive ? 0.5 : 0}
          roughness={0.4}
          metalness={0.6}
        />
      </mesh>

      {showInternals && module.isActive && (
        <>
          {getInternalComponents(module.type, currentStage).map((comp, idx) => (
            <mesh
              key={idx}
              position={[
                (comp.position.x - 0.5) * scaleX * 0.4,
                scaleY * 0.7,
                (comp.position.y - 0.5) * scaleZ * 0.4,
              ]}
              castShadow
            >
              <boxGeometry args={[scaleX * 0.3, scaleY * 0.3, scaleZ * 0.3]} />
              <meshStandardMaterial
                color={comp.status === 'active' ? '#22d3ee' : '#4b5563'}
                emissive={comp.status === 'active' ? '#0891b2' : '#000000'}
                emissiveIntensity={comp.status === 'active' ? 0.7 : 0}
                roughness={0.3}
                metalness={0.7}
              />
            </mesh>
          ))}
        </>
      )}

      {(hovered || isSelected) && (
        <Html center position={[0, scaleY + 0.5, 0]}>
          <div className="bg-gray-900/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-600 text-white text-sm whitespace-nowrap pointer-events-none">
            <div className="font-bold">{module.name}</div>
            <div className="text-gray-300 text-xs">{module.type.toUpperCase()}</div>
          </div>
        </Html>
      )}

      {module.isActive && (
        <>
          <pointLight
            position={[0, scaleY * 0.8, 0]}
            intensity={0.5}
            distance={3}
            color={mode === 'tampered' && module.type === 'crypto' && currentStage >= 5 ? '#dc2626' : '#06b6d4'}
          />
        </>
      )}

      {[...Array(4)].map((_, i) => (
        <mesh
          key={`pin-${i}`}
          position={[
            i < 2 ? -scaleX * 0.55 : scaleX * 0.55,
            scaleY * 0.3,
            i % 2 === 0 ? -scaleZ * 0.3 : scaleZ * 0.3,
          ]}
          castShadow
        >
          <cylinderGeometry args={[0.03, 0.03, scaleY * 0.5, 8]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
};

function getInternalComponents(type: string, currentStage: number) {
  switch (type) {
    case 'pmu':
      return [
        { name: 'Voltage Regulator', status: currentStage >= 0 ? 'active' : 'idle', position: { x: 0, y: 0 } },
        { name: 'Power Sequencer', status: currentStage >= 0 ? 'active' : 'idle', position: { x: 1, y: 0 } },
        { name: 'Reset Controller', status: currentStage >= 0 ? 'active' : 'idle', position: { x: 0, y: 1 } },
      ];
    case 'rom':
      return [
        { name: 'Instruction Fetch', status: currentStage >= 1 ? 'active' : 'idle', position: { x: 0, y: 0 } },
        { name: 'Address Decoder', status: currentStage >= 1 ? 'active' : 'idle', position: { x: 1, y: 0 } },
        { name: 'Boot Code', status: currentStage >= 1 ? 'active' : 'idle', position: { x: 0, y: 1 } },
        { name: 'Key Storage', status: currentStage >= 2 ? 'active' : 'idle', position: { x: 1, y: 1 } },
      ];
    case 'otp':
      return [
        { name: 'eFuse Array', status: currentStage >= 2 ? 'active' : 'idle', position: { x: 0, y: 0 } },
        { name: 'Key Hash', status: currentStage >= 2 ? 'active' : 'idle', position: { x: 1, y: 0 } },
      ];
    case 'crypto':
      return [
        { name: 'Hash Engine', status: currentStage >= 4 ? 'active' : 'idle', position: { x: 0, y: 0 } },
        { name: 'RSA Verifier', status: currentStage >= 4 ? 'active' : 'idle', position: { x: 1, y: 0 } },
        { name: 'Key Loader', status: currentStage >= 4 ? 'active' : 'idle', position: { x: 0, y: 1 } },
        { name: 'Result Register', status: currentStage >= 5 ? 'active' : 'idle', position: { x: 1, y: 1 } },
      ];
    case 'flash':
      return [
        { name: 'SPI Controller', status: currentStage >= 3 ? 'active' : 'idle', position: { x: 0, y: 0 } },
        { name: 'Memory Array', status: currentStage >= 3 ? 'active' : 'idle', position: { x: 1, y: 0 } },
      ];
    case 'cpu':
      return [
        { name: 'Instruction Cache', status: currentStage >= 6 ? 'active' : 'idle', position: { x: 0, y: 0 } },
        { name: 'ALU', status: currentStage >= 6 ? 'active' : 'idle', position: { x: 1, y: 0 } },
        { name: 'Register File', status: currentStage >= 6 ? 'active' : 'idle', position: { x: 0, y: 1 } },
        { name: 'MMU', status: currentStage >= 6 ? 'active' : 'idle', position: { x: 1, y: 1 } },
      ];
    default:
      return [];
  }
}

export default ChipModule3D;
