import React, { useState, useMemo } from 'react';
import ChipModule from './ChipModule';
import PowerRail from './PowerRail';
import ModulePopup from './ModulePopup';
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

  const bootStatus = getBootStatus(flags, mode, currentStage);

  return (
    <div className="w-full h-screen bg-gray-900 relative overflow-hidden">
      {/* 3D Scene Container */}
      <div
        className="w-full h-full relative"
        style={{
          perspective: '1200px',
          perspectiveOrigin: '50% 50%'
        }}
      >
        {/* Chip Modules */}
        <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
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
        </div>
      </div>

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
