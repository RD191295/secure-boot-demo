import React, { useState, useRef, useCallback, useMemo } from 'react';
import { RotateCcw, ZoomIn, ZoomOut, Move3d as Move3D } from 'lucide-react';
import ChipModule from './ChipModule';
import PowerRail from './PowerRail';
import ModulePopup from './ModulePopup';
import { useSecureBootState } from '../hooks/useSecureBootState';
import DataBus3D from "./DataBus3D";

// ------------------- Types -------------------
export interface Chip3DEnvironmentProps {
  mode: 'normal' | 'tampered';
  showInternals: boolean;
  animationSpeed: number;
  currentStage: number;
  onModeChange: (mode: 'normal' | 'tampered') => void;
  onInternalsToggle: () => void;
  onSpeedChange: (speed: number) => void;
}

export interface ModuleType {
  id: string;
  name: string;
  type: string;
  description: string;
  position: { x: number; y: number; z: number };
  size: { width: number; height: number; depth: number };
  color: string;
  isActive: boolean;
}

export interface BusType {
  from: string;
  to: string;
  active: boolean;
  visible: boolean;
  type: 'data' | 'control';
  data: string;
}

// ------------------- Constants -------------------
export const MODULES: ModuleType[] = [
  {
    id: 'pmu',
    name: 'Power Management Unit',
    type: 'pmu',
    description: 'Manages power distribution and voltage regulation across the chip',
    position: { x: -350, y: -250, z: 0 },
    size: { width: 200, height: 200, depth: 10 },
    color: 'from-red-500 to-red-700',
    isActive: false
  },
  {
    id: 'bootrom',
    name: 'Boot ROM',
    type: 'bootrom',
    description: 'Contains the initial boot code and secure boot verification logic',
    position: { x: -50, y: -250, z: 0 },
    size: { width: 150, height: 90, depth: 10 },
    color: 'from-blue-500 to-blue-700',
    isActive: false
  },
  {
    id: 'otp',
    name: 'OTP/eFuses',
    type: 'otp',
    description: 'One-time programmable memory storing cryptographic keys and configuration',
    position: { x: 170, y: -200, z: 0 },
    size: { width: 200, height: 150, depth: 10 },
    color: 'from-yellow-500 to-yellow-700',
    isActive: false
  },
  {
    id: 'crypto',
    name: 'Crypto Engine',
    type: 'crypto',
    description: 'Hardware cryptographic processor for signature verification and encryption',
    position: { x: -350, y: 80, z: 0 },
    size: { width: 200, height: 150, depth: 10 },
    color: 'from-purple-500 to-purple-700',
    isActive: false
  },
  {
    id: 'flash',
    name: 'Flash Memory',
    type: 'flash',
    description: 'Non-volatile storage containing firmware and application code',
    position: { x: 160, y: 150, z: 0 },
    size: { width: 140, height: 220, depth: 10 },
    color: 'from-green-500 to-green-700',
    isActive: false
  },
  {
    id: 'cpu',
    name: 'CPU Core',
    type: 'cpu',
    description: 'Main processing unit that executes the verified firmware',
    position: { x: -80, y: 0, z: 0 },
    size: { width: 160, height: 180, depth: 10 },
    color: 'from-cyan-500 to-cyan-700',
    isActive: false
  }
];

// ------------------- Helper Functions -------------------
export const getModuleById = (id: string, modules: ModuleType[]) =>
  modules.find(m => m.id === id);

export const getBootStatus = (flags: any, mode: 'normal' | 'tampered', currentStage: number) => {
  if (flags.safeMode || (mode === 'tampered' && currentStage >= 6)) return { text: 'SAFE MODE', color: 'bg-orange-600' };
  if (flags.bootComplete) return { text: 'BOOT SUCCESS', color: 'bg-green-600' };
  if (flags.tamperDetected) return { text: 'BOOT FAILED', color: 'bg-red-600' };
  return { text: 'BOOTING...', color: 'bg-blue-600' };
};

// ------------------- Component -------------------
export const Chip3DEnvironment: React.FC<Chip3DEnvironmentProps> = ({
  mode,
  showInternals,
  animationSpeed,
  currentStage,
}) => {
  const [rotation, setRotation] = useState({ x: -15, y: 25 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { state, registers, memory, flags } = useSecureBootState(mode, animationSpeed);

  // ------------------- Mouse / Wheel Handlers -------------------
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.shiftKey) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    if (e.shiftKey) {
      setPan(prev => ({ x: prev.x + deltaX * 0.5, y: prev.y + deltaY * 0.5 }));
    } else {
      setRotation(prev => ({ x: Math.max(-90, Math.min(90, prev.x - deltaY * 0.5)), y: prev.y + deltaX * 0.5 }));
    }

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

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

  // ------------------- Modules & Buses -------------------
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

  const buses: BusType[] = useMemo(() => [
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

  // ------------------- JSX -------------------
  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden">
      {/* 3D Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button onClick={() => setZoom(prev => Math.min(3, prev * 1.2))} className="p-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors" title="Zoom In"><ZoomIn size={16} /></button>
        <button onClick={() => setZoom(prev => Math.max(0.3, prev * 0.8))} className="p-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors" title="Zoom Out"><ZoomOut size={16} /></button>
        <button onClick={resetView} className="p-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors" title="Reset View"><RotateCcw size={16} /></button>
        <div className="p-2 bg-gray-800 text-white rounded text-xs">
          <Move3D size={10} className="mx-auto mb-1" />
          <div>Drag: Rotate</div>
          <div>Shift+Drag: Pan</div>
          <div>Wheel: Zoom</div>
        </div>
      </div>

      {/* 3D Scene */}
      <div ref={containerRef} className="w-full h-screen cursor-grab active:cursor-grabbing" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onWheel={handleWheel} style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}>
        {/* PCB Base */}
        <div className="absolute bg-green-800 opacity-20 rounded-lg" style={{
          transform: `translate3d(${pan.x}px, ${pan.y}px, -50px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${zoom})`,
          transformOrigin: 'center center',
          width: '800px',
          height: '600px',
          left: '50%',
          top: '50%',
          marginLeft: '-400px',
          marginTop: '-300px'
        }} />

        {/* Scene Content */}
        <div className="absolute w-full h-full" style={{ transform: `translate3d(${pan.x}px, ${pan.y}px, 0px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${zoom})`, transformOrigin: 'center center', transformStyle: 'preserve-3d' }}>
          <div className="absolute" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)', transformStyle: 'preserve-3d' }}>
            {currentStage > 0 && <PowerRail id="power-5v" name="5V Main Power" voltage={5.0} position={{ x: -400, y: -100, z: 10 }} isActive={flags.powerGood} onClick={() => {}} />}
            
            {modules.map(module => (
              <ChipModule key={module.id} {...module} mode={mode} showInternals={showInternals} onClick={() => setSelectedModule(module.id)} currentStage={currentStage} registers={registers} memory={memory} flags={flags} />
            ))}

            {buses.map((bus, idx) => {
              const fromModule = getModuleById(bus.from, modules);
              const toModule = getModuleById(bus.to, modules);
              if (!fromModule || !toModule || !bus.visible) return null;

              return <DataBus3D key={idx} id={`bus-${idx}`} from={fromModule.position} to={toModule.position} isActive={bus.active} isVisible={bus.visible} type={bus.type} data={bus.data} animationSpeed={animationSpeed} />;
            })}
          </div>
        </div>
      </div>

      {/* Module Popup */}
      {selectedModule && <ModulePopup moduleId={selectedModule} modules={modules} registers={registers} memory={memory} flags={flags} currentStage={currentStage} mode={mode} onClose={() => setSelectedModule(null)} />}

      {/* Boot Status */}
      <div className="fixed top-24 left-4 z-20">
        <div className={`px-4 py-2 rounded-lg text-white font-semibold ${bootStatus.color}`}>{bootStatus.text}</div>
      </div>
    </div>
  );
};
