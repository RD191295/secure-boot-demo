import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useSecureBootState } from '../hooks/useSecureBootState';
import { MODULES, getBootStatus, Chip3DEnvironmentProps } from './constants';
import ChipModule3D from './ChipModule3D';
import DataTrace3D from './DataTrace3D';

export const Chip3DEnvironmentWebGL: React.FC<Chip3DEnvironmentProps> = ({
  mode,
  showInternals,
  animationSpeed,
  currentStage,
}) => {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const { state, registers, memory, flags } = useSecureBootState(mode, animationSpeed);

  const modules = MODULES.map(m => {
    switch (m.id) {
      case 'pmu': return { ...m, isActive: flags.powerGood };
      case 'bootrom': return { ...m, isActive: flags.romActive };
      case 'otp': return { ...m, isActive: flags.keyLoaded };
      case 'crypto': return { ...m, isActive: currentStage >= 4 && currentStage <= 5 };
      case 'flash': return { ...m, isActive: currentStage >= 3 };
      case 'cpu': return { ...m, isActive: currentStage >= 6 };
      default: return m;
    }
  });

  const traces = [
    { from: 'pmu', to: 'bootrom', active: currentStage >= 1, type: 'power' as const },
    { from: 'pmu', to: 'otp', active: currentStage >= 1, type: 'power' as const },
    { from: 'pmu', to: 'crypto', active: currentStage >= 1, type: 'power' as const },
    { from: 'pmu', to: 'flash', active: currentStage >= 1, type: 'power' as const },
    { from: 'pmu', to: 'cpu', active: currentStage >= 1, type: 'power' as const },
    { from: 'bootrom', to: 'otp', active: currentStage === 2, type: 'control' as const },
    { from: 'otp', to: 'crypto', active: currentStage === 4, type: 'data' as const },
    { from: 'flash', to: 'bootrom', active: currentStage === 3, type: 'data' as const },
    { from: 'bootrom', to: 'crypto', active: currentStage === 4, type: 'data' as const },
    { from: 'crypto', to: 'bootrom', active: currentStage === 5, type: 'control' as const },
    { from: 'bootrom', to: 'cpu', active: currentStage >= 6 && mode === 'normal', type: 'control' as const },
  ];

  const bootStatus = getBootStatus(flags, mode, currentStage);

  return (
    <div className="w-full h-full relative">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 8, 12]} fov={50} />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={8}
          maxDistance={25}
          maxPolarAngle={Math.PI / 2}
        />

        <ambientLight intensity={0.3} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <directionalLight position={[-10, 5, -5]} intensity={0.3} />
        <pointLight position={[0, 5, 0]} intensity={0.5} color="#60a5fa" />

        <PCBBoard />

        {modules.map((module) => (
          <ChipModule3D
            key={module.id}
            module={module}
            mode={mode}
            showInternals={showInternals}
            currentStage={currentStage}
            isSelected={selectedModule === module.id}
            onClick={() => setSelectedModule(module.id)}
          />
        ))}

        {traces.map((trace, idx) => {
          const fromModule = modules.find(m => m.id === trace.from);
          const toModule = modules.find(m => m.id === trace.to);
          if (!fromModule || !toModule) return null;

          return (
            <DataTrace3D
              key={idx}
              from={fromModule.position}
              to={toModule.position}
              isActive={trace.active}
              type={trace.type}
            />
          );
        })}
      </Canvas>

      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
        <div className={`px-6 py-3 rounded-lg text-white font-semibold shadow-lg ${bootStatus.color}`}>
          {bootStatus.text}
        </div>
      </div>

      {selectedModule && (
        <div className="absolute bottom-4 left-4 right-4 bg-gray-900/95 backdrop-blur-sm p-4 rounded-lg border border-gray-600 z-20">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-white font-bold text-lg mb-1">
                {modules.find(m => m.id === selectedModule)?.name}
              </h3>
              <p className="text-gray-300 text-sm">
                {modules.find(m => m.id === selectedModule)?.description}
              </p>
            </div>
            <button
              onClick={() => setSelectedModule(null)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

function PCBBoard() {
  return (
    <mesh receiveShadow position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <boxGeometry args={[16, 12, 0.2]} />
      <meshStandardMaterial color="#1a4d2e" roughness={0.8} metalness={0.2} />
    </mesh>
  );
}
