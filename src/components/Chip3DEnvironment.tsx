import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, ZoomIn, ZoomOut, Move3d as Move3D } from 'lucide-react';
import ChipModule from './ChipModule';
import DataBus from './DataBus';
import PowerRail from './PowerRail';
import ModulePopup from './ModulePopup';
import { useSecureBootState } from '../hooks/useSecureBootState';
import { getConnectionPoints } from '../utils/getConnectionPoints';

interface Chip3DEnvironmentProps {
  mode: 'normal' | 'tampered';
  showInternals: boolean;
  animationSpeed: number;
  currentStage: number;
  onModeChange: (mode: 'normal' | 'tampered') => void;
  onInternalsToggle: () => void;
  onSpeedChange: (speed: number) => void;
}

export const Chip3DEnvironment: React.FC<Chip3DEnvironmentProps> = ({
  mode,
  showInternals,
  animationSpeed,
  currentStage,
  onModeChange,
  onInternalsToggle,
  onSpeedChange
}) => {
  const [rotation, setRotation] = useState({ x: -15, y: 25 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { 
    state,
    registers,
    memory,
    flags
  } = useSecureBootState(mode, animationSpeed);

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.shiftKey) return; // Skip if shift is held for panning
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    if (e.shiftKey) {
      // Pan mode
      setPan(prev => ({
        x: prev.x + deltaX * 0.5,
        y: prev.y + deltaY * 0.5
      }));
    } else {
      // Rotate mode
      setRotation(prev => ({
        x: Math.max(-90, Math.min(90, prev.x - deltaY * 0.5)),
        y: prev.y + deltaX * 0.5
      }));
    }

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.3, Math.min(3, prev * delta)));
  };

  const resetView = () => {
    setRotation({ x: -15, y: 25 });
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Module definitions with positions
  const modules = [
    {
      id: 'pmu',
      name: 'Power Management Unit',
      type: 'pmu',
      description: 'Manages power distribution and voltage regulation across the chip',
      position: { x: -350, y: -250, z: 0 },
      size: { width: 200, height: 200, depth: 10 },
      color: 'from-red-500 to-red-700',
      isActive: flags.powerGood
    },
    {
      id: 'bootrom',
      name: 'Boot ROM',
      type: 'bootrom',
      description: 'Contains the initial boot code and secure boot verification logic',
      position: { x: -50, y: -250, z: 0 },
      size: { width: 150, height: 90, depth: 10 },
      color: 'from-blue-500 to-blue-700',
      isActive: flags.romActive
    },
    {
      id: 'otp',
      name: 'OTP/eFuses',
      type: 'otp',
      description: 'One-time programmable memory storing cryptographic keys and configuration',
      position: { x: 170, y: -200, z: 0 },
      size: { width: 200, height: 150, depth: 10 },
      color: 'from-yellow-500 to-yellow-700',
      isActive: flags.keyLoaded
    },
    {
      id: 'crypto',
      name: 'Crypto Engine',
      type: 'crypto',
      description: 'Hardware cryptographic processor for signature verification and encryption',
      position: { x: -350, y: 80, z: 0 },
      size: { width: 200, height: 150, depth: 10 },
      color: 'from-purple-500 to-purple-700',
      isActive: currentStage >= 4 && currentStage <= 5
    },
    {
      id: 'flash',
      name: 'Flash Memory',
      type: 'flash',
      description: 'Non-volatile storage containing firmware and application code',
      position: { x: 160, y: 100, z: 0 },
      size: { width: 140, height: 170, depth: 10 },
      color: 'from-green-500 to-green-700',
      isActive: currentStage >= 3
    },
    {
      id: 'cpu',
      name: 'CPU Core',
      type: 'cpu',
      description: 'Main processing unit that executes the verified firmware',
      position: { x: -80, y: 0, z: 0 },
      size: { width: 160, height: 180, depth: 10 },
      color: 'from-cyan-500 to-cyan-700',
      isActive: currentStage >= 6
    }
  ];

  // Data bus connections
  const buses = [    
    // Step 1: ROM Initialization - Boot ROM internal activity
    { from: 'bootrom', to: 'bootrom', active: currentStage === 1, visible: currentStage === 1, type: 'control' as const, data: 'ROM Initialization' },
    
    // Step 2: Key Retrieval - Boot ROM requests key from OTP
    { from: 'bootrom', to: 'otp', active: currentStage === 2, visible: currentStage === 2, type: 'control' as const, data: 'Key Request' },
    { from: 'otp', to: 'bootrom', active: currentStage === 2, visible: currentStage === 2, type: 'data' as const, data: 'Public Key Hash' },
    
    // Step 3: Bootloader Load - Flash to Boot ROM
    { from: 'flash', to: 'bootrom', active: currentStage === 3, visible: currentStage === 3, type: 'data' as const, data: 'Bootloader Binary' },
    
    // Step 4: Signature Verification - Boot ROM to Crypto Engine
    { from: 'bootrom', to: 'crypto', active: currentStage === 4, visible: currentStage === 4, type: 'data' as const, data: 'Hash + Signature' },
    { from: 'otp', to: 'crypto', active: currentStage === 4, visible: currentStage === 4, type: 'data' as const, data: 'Public Key' },
    
    // Step 5: Verification Complete - Crypto Engine result
    { from: 'crypto', to: 'bootrom', active: currentStage === 5, visible: currentStage === 5, type: 'control' as const, data: mode === 'tampered' ? 'VERIFICATION FAILED' : 'VERIFICATION PASSED' },
    
    // Step 6: Execution Transfer - Boot ROM to CPU (normal mode only)
    { from: 'bootrom', to: 'cpu', active: currentStage === 6 && mode === 'normal', visible: currentStage === 6, type: 'control' as const, data: mode === 'tampered' ? 'SAFE MODE' : 'Boot Control' },
    
    // Step 7: Boot Complete - CPU active (normal mode only)
    { from: 'cpu', to: 'cpu', active: currentStage === 7 && mode === 'normal', visible: currentStage === 7, type: 'control' as const, data: mode === 'tampered' ? 'SAFE MODE ACTIVE' : 'OS EXECUTION' }
  ];

  const getModuleById = (id: string) => modules.find(m => m.id === id);

  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden">
      {/* 3D Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={() => setZoom(prev => Math.min(3, prev * 1.2))}
          className="p-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
          title="Zoom In"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={() => setZoom(prev => Math.max(0.3, prev * 0.8))}
          className="p-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut size={16} />
        </button>
        <button
          onClick={resetView}
          className="p-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
          title="Reset View"
        >
          <RotateCcw size={16} />
        </button>
     
      </div>
     
      {/* 3D Scene Container */}
      <div
        ref={containerRef}
        className="w-full h-screen cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{
          perspective: '1000px',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* PCB Base */}
        <div
          className="absolute bg-green-800 opacity-20 rounded-lg"
          style={{
            transform: `
              translate3d(${pan.x}px, ${pan.y}px, -50px)
              rotateX(${rotation.x}deg)
              rotateY(${rotation.y}deg)
              scale(${zoom})
            `,
            transformOrigin: 'center center',
            width: '800px',
            height: '600px',
            left: '50%',
            top: '50%',
            marginLeft: '-400px',
            marginTop: '-300px'
          }}
        />

        {/* 3D Scene */}
        <div
          className="absolute w-full h-full"
          style={{
            transform: `
              translate3d(${pan.x}px, ${pan.y}px, 0px)
              rotateX(${rotation.x}deg)
              rotateY(${rotation.y}deg)
              scale(${zoom})
            `,
            transformOrigin: 'center center',
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Center the scene */}
          <div
            className="absolute"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              transformStyle: 'preserve-3d'
            }}
          >
          {/* Power Rails - Only visible when simulation has started */}
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

          {/* Chip Modules */}
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

          {/* Data Buses */}
          {buses.map((bus, index) => {
            const fromModule = getModuleById(bus.from);
            const toModule = getModuleById(bus.to);
            if (!fromModule || !toModule || !bus.visible) return null;

            return (
              <DataBus
                key={index}
                id={`bus-${index}`}
                from={fromModule.position}
                to={toModule.position}
                isActive={bus.active}
                isVisible={bus.visible}
                type={bus.type}
                data={bus.data}
                animationSpeed={animationSpeed}
              />
            );
          })}
          </div>
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

      {/* Boot Status Indicator */}
      <div className="fixed top-24 left-4 z-20">
        <div className={`px-4 py-2 rounded-lg text-white font-semibold ${
          flags.safeMode || (mode === 'tampered' && currentStage >= 6)
            ? 'bg-orange-600' 
            : flags.bootComplete 
              ? 'bg-green-600' 
              : flags.tamperDetected 
                ? 'bg-red-600' 
                : 'bg-blue-600'
        }`}>
          {flags.safeMode || (mode === 'tampered' && currentStage >= 6)
            ? 'SAFE MODE' 
            : flags.bootComplete 
              ? 'BOOT SUCCESS' 
              : flags.tamperDetected 
                ? 'BOOT FAILED' 
                : 'BOOTING...'}
        </div>
      </div>
    </div>
  );
};