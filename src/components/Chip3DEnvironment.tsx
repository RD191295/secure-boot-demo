import React, { useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import ChipModule from './ChipModule';
import PowerRail from './PowerRail';
import ModulePopup from './ModulePopup';
import DataBus3D from './DataBus3D';
import { useSecureBootState } from '../hooks/useSecureBootState';
import { MODULES, getModuleById, getBootStatus, Chip3DEnvironmentProps } from './constants';

export const Chip3DEnvironment: React.FC<Chip3DEnvironmentProps> = ({
  mode,
  showInternals,
  animationSpeed,
  currentStage,
}) => {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const { state, registers, memory, flags } = useSecureBootState(mode, animationSpeed);

  const modules = useMemo(() => MODULES.map(m => {
    switch (m.id) {
      case 'pmu': return { ...m, isActive: flags.powerGood };
      case 'bootrom': return { ...m, isActive: flags.romActive };
      case 'otp': return { ...m, isActive: flags.keyLoaded };
      case 'crypto': return { ...m, isActive: currentStage >= 4 && currentStage <= 5 };
      case 'flash': return { ...m, isActive: currentStage >= 3 };
      case 'cpu': return { ...m, isActive: currentStage >= 6 };
      default: return m;
    }
  }), [flags, currentStage]);

  const buses = useMemo(() => [
    { from: 'bootrom', to: 'bootrom', active: currentStage === 1, visible: currentStage === 1, type: 'control', data: 'ROM Initialization' },
    { from: 'bootrom', to: 'otp', active: currentStage === 2, visible: currentStage === 2, type: 'control', data: 'Key Request' },
    { from: 'otp', to: 'bootrom', active: currentStage === 2, visible: currentStage === 2, type: 'data', data: 'Public Key Hash' },
    { from: 'flash', to: 'bootrom', active: currentStage === 3, visible: currentStage === 3, type: 'data', data: 'Bootloader Binary' },
    { from: 'bootrom', to: 'crypto', active: currentStage === 4, visible: currentStage === 4, type: 'data', data: 'Hash + Signature' },
    { from: 'otp', to: 'crypto', active: currentStage === 4, visible: currentStage === 4, type: 'data', data: 'Public Key' },
    { from: 'crypto', to: 'bootrom', active: currentStage === 5, visible: currentStage === 5, type: 'control', data: mode === 'tampered' ? 'VERIFICATION FAILED' : 'VERIFICATION PASSED' },
    { from: 'bootrom', to: 'cpu', active: currentStage === 6 && mode === 'normal', visible: currentStage === 6, type: 'control', data: mode === 'tampered' ? 'SAFE MODE' : 'Boot Control' },
    { from: 'cpu', to: 'cpu', active: currentStage === 7 && mode === 'normal', visible: currentStage === 7, type: 'control', data: mode === 'tampered' ? 'SAFE MODE ACTIVE' : 'OS EXECUTION' }
  ], [currentStage, mode]);

  const bootStatus = getBootStatus(flags, mode, currentStage);

  return (
    <div className="w-full h-screen bg-gray-900">
      <Canvas camera={{ position: [0, 0, 800], fov: 45 }}>
        {/* Lights */}
        <ambientLight intensity={0.5} />
        <pointLight position={[500, 500, 500]} />

        {/* Orbit Controls */}
        <OrbitControls enablePan enableRotate enableZoom zoomSpeed={1.2} panSpeed={0.5} />

        {/* Modules */}
        {modules.map(module => (
          <ChipModule
            key={module.id}
            {...module}
            mode={mode}
            showInternals={showInternals}
            onClick={() => setSelectedModule(module.id)}
            currentStage={currentStage}
            registers={registers}
            memory={memory}
            flags={flags}
          />
        ))}

        {/* Power Rails */}
        {currentStage > 0 && (
          <PowerRail
            id="power-5v"
            name="5V Main Power"
            voltage={5.0}
            position={{ x: -400, y: -100, z: 10 }}
            isActive={flags.powerGood}
            onClick={() => {}}
          />
        )}

        {/* Data Buses */}
        {buses.map((bus, idx) => {
          const fromModule = getModuleById(bus.from, modules);
          const toModule = getModuleById(bus.to, modules);
          if (!fromModule || !toModule || !bus.visible) return null;

          return (
            <DataBus3D
              key={idx}
              from={fromModule.position}
              to={toModule.position}
              type={bus.type}
              isActive={bus.active}
              animationSpeed={animationSpeed}
            />
          );
        })}
      </Canvas>

      {/* Module Popup */}
      {selectedModule && (
        <ModulePopup
          moduleId={selectedModule}
          modules={modules}
          registers={registers}
          memory={memory}
          flags={flags}
          currentStage={currentStage}
          mode={mode}
          onClose={() => setSelectedModule(null)}
        />
      )}

      {/* Boot Status */}
      <div className="fixed top-4 left-4 z-20">
        <div className={`px-4 py-2 rounded-lg text-white font-semibold ${bootStatus.color}`}>
          {bootStatus.text}
        </div>
      </div>
    </div>
  );
};
