import React, { useState, useRef, useEffect } from 'react';
import ChipComponent from './ChipComponent';
import DataFlow from './DataFlow';
import ChipStepVisualization from './ChipStepVisualization';
import { RotateCcw, ZoomIn, ZoomOut, Info, Eye, EyeOff } from 'lucide-react';
import { Z_INDEX } from './zIndex';

interface ChipScene3DProps {
  currentStep: number;
  isPlaying: boolean;
  onChipClick: (chipId: string) => void;
}

const ChipScene3D: React.FC<ChipScene3DProps> = ({ currentStep, isPlaying, onChipClick }) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [selectedChipForSteps, setSelectedChipForSteps] = useState<string | null>(null);
  const [autoZoomEnabled, setAutoZoomEnabled] = useState(true);
  const sceneRef = useRef<HTMLDivElement>(null);

  const chips = [
    {
      id: 'bootrom-chip',
      title: 'Boot ROM Chip',
      subtitle: 'Hardware Root of Trust',
      description: 'Immutable silicon-based security anchor containing cryptographic keys and boot code burned into the chip during manufacturing.',
      type: 'bootrom' as const,
      position: { x: 50, y: 300, z: 100 },
      status: currentStep >= 0 ? 'verified' : 'idle',
      internalComponents: [
        { id: 'efuse', name: 'eFuses', type: 'keys' as const, status: currentStep >= 0 ? 'complete' : 'idle', position: { x: 0, y: 0 } },
        { id: 'crypto', name: 'Crypto Engine', type: 'crypto' as const, status: currentStep >= 1 ? 'complete' : currentStep === 0 ? 'active' : 'idle', position: { x: 1, y: 0 } },
        { id: 'bootcode', name: 'Boot Code', type: 'verification' as const, status: currentStep >= 1 ? 'complete' : 'idle', position: { x: 0, y: 1 } },
        { id: 'hardware', name: 'Hardware Anchor', type: 'hardware' as const, status: currentStep >= 0 ? 'complete' : 'idle', position: { x: 1, y: 1 } }
      ]
    },
    {
      id: 'flash-chip',
      title: 'Flash Memory Chip',
      subtitle: 'Bootloader Storage',
      description: 'External non-volatile memory containing the first-stage bootloader and digital signatures. Initially untrusted until verified.',
      type: 'flash' as const,
      position: { x: 450, y: 300, z: 100 },
      status: currentStep >= 2 ? 'verified' : currentStep === 1 ? 'verifying' : 'idle',
      internalComponents: [
        { id: 'fsbl', name: 'FSBL Code', type: 'memory' as const, status: currentStep >= 2 ? 'complete' : currentStep === 1 ? 'processing' : 'idle', position: { x: 0, y: 0 } },
        { id: 'signature', name: 'Digital Signature', type: 'verification' as const, status: currentStep >= 2 ? 'complete' : currentStep === 1 ? 'active' : 'idle', position: { x: 1, y: 0 } },
        { id: 'metadata', name: 'Metadata', type: 'memory' as const, status: currentStep >= 2 ? 'complete' : 'idle', position: { x: 0, y: 1 } },
        { id: 'interface', name: 'SPI Interface', type: 'hardware' as const, status: currentStep >= 1 ? 'complete' : 'idle', position: { x: 1, y: 1 } }
      ]
    },
    {
      id: 'processor-chip',
      title: 'Application Processor',
      subtitle: 'OS/Firmware Execution',
      description: 'Main processing unit running the operating system with hardware security features like MMU and TrustZone.',
      type: 'processor' as const,
      position: { x: 850, y: 300, z: 100 },
      status: currentStep >= 4 ? 'verified' : currentStep === 3 ? 'verifying' : 'idle',
      internalComponents: [
        { id: 'kernel', name: 'OS Kernel', type: 'memory' as const, status: currentStep >= 4 ? 'complete' : currentStep === 3 ? 'processing' : 'idle', position: { x: 0, y: 0 } },
        { id: 'mmu', name: 'MMU', type: 'hardware' as const, status: currentStep >= 4 ? 'complete' : currentStep >= 3 ? 'active' : 'idle', position: { x: 1, y: 0 } },
        { id: 'trustzone', name: 'TrustZone', type: 'verification' as const, status: currentStep >= 4 ? 'complete' : currentStep >= 3 ? 'active' : 'idle', position: { x: 0, y: 1 } },
        { id: 'secure', name: 'Secure Exec', type: 'crypto' as const, status: currentStep >= 4 ? 'complete' : 'idle', position: { x: 1, y: 1 } }
      ]
    }
  ];

  const dataFlows = [
    {
      from: chips[0].position,
      to: chips[1].position,
      isActive: currentStep >= 1,
      status: currentStep >= 2 ? 'verified' : currentStep === 1 ? 'verifying' : 'idle',
      flowType: 'signature' as const
    },
    {
      from: chips[1].position,
      to: chips[2].position,
      isActive: currentStep >= 3,
      status: currentStep >= 4 ? 'verified' : currentStep === 3 ? 'verifying' : 'idle',
      flowType: 'signature' as const
    }
  ];

  // Auto-zoom functionality
  useEffect(() => {
    if (!autoZoomEnabled) return;

    let chipToShow: string | null = null;
    
    if (currentStep >= 0 && currentStep <= 1) {
      chipToShow = 'bootrom-chip';
    } else if (currentStep === 2) {
      chipToShow = 'flash-chip';
    } else if (currentStep >= 3 && currentStep <= 4) {
      chipToShow = 'processor-chip';
    }

    if (chipToShow && chipToShow !== selectedChipForSteps) {
      setSelectedChipForSteps(chipToShow);
    }
  }, [currentStep, autoZoomEnabled, selectedChipForSteps]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - lastMouse.x;
    const deltaY = e.clientY - lastMouse.y;
    
    setRotation(prev => ({
      x: Math.max(-45, Math.min(45, prev.x - deltaY * 0.5)),
      y: prev.y + deltaX * 0.5,
      z: prev.z
    }));
    
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setRotation({ x: 0, y: 0, z: 0 });
    setZoom(1);
  };

  const zoomIn = () => setZoom(prev => Math.min(2, prev + 0.2));
  const zoomOut = () => setZoom(prev => Math.max(0.5, prev - 0.2));

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - lastMouse.x;
      const deltaY = e.clientY - lastMouse.y;
      
      setRotation(prev => ({
        x: Math.max(-45, Math.min(45, prev.x - deltaY * 0.5)),
        y: prev.y + deltaX * 0.5,
        z: prev.z
      }));
      
      setLastMouse({ x: e.clientX, y: e.clientY });
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, lastMouse]);

  return (
    <>
      <div className="relative w-full h-[600px] bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-xl overflow-hidden border border-gray-700">
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            zIndex: Z_INDEX.BACKGROUND
          }}
        />

        {/* Controls */}
        <div className="absolute top-4 right-4 flex space-x-2" style={{ zIndex: Z_INDEX.OVERLAYS }}>
          <button
            onClick={() => setAutoZoomEnabled(!autoZoomEnabled)}
            className={`p-2 rounded-lg border border-gray-600 text-white transition-colors ${
              autoZoomEnabled 
                ? 'bg-green-600/80 hover:bg-green-500/80' 
                : 'bg-gray-800/80 hover:bg-gray-700/80'
            }`}
            title={autoZoomEnabled ? 'Auto-zoom enabled' : 'Auto-zoom disabled'}
          >
            {autoZoomEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button
            onClick={zoomOut}
            className="p-2 bg-gray-800/80 hover:bg-gray-700/80 rounded-lg border border-gray-600 text-white transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={zoomIn}
            className="p-2 bg-gray-800/80 hover:bg-gray-700/80 rounded-lg border border-gray-600 text-white transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            className="p-2 bg-gray-800/80 hover:bg-gray-700/80 rounded-lg border border-gray-600 text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Instructions */}
        <div className="absolute top-4 left-4 p-3 bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-600 text-white" style={{ zIndex: Z_INDEX.OVERLAYS }}>
          <div className="flex items-center space-x-2 mb-2">
            <Info className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold">Chip Interaction Guide</span>
          </div>
          <div className="text-xs text-gray-300 space-y-1">
            <div>• Drag to rotate the circuit board</div>
            <div>• {autoZoomEnabled ? 'Auto-zoom shows active chip internals' : 'Click chips for details'}</div>
            <div>• Watch step-by-step chip processes</div>
          </div>
        </div>

        {/* 3D Scene */}
        <div
          ref={sceneRef}
          className="relative w-full h-full cursor-grab active:cursor-grabbing"
          style={{
            perspective: '1000px',
            transform: `scale(${zoom})`
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <div
            className="relative w-full h-full"
            style={{
              transformStyle: 'preserve-3d',
              transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`
            }}
          >
            {/* Data flows */}
            {dataFlows.map((flow, index) => (
              <DataFlow
                key={index}
                from={flow.from}
                to={flow.to}
                isActive={flow.isActive}
                status={flow.status as any}
                flowType={flow.flowType}
              />
            ))}

            {/* 3D Chips */}
            {chips.map((chip) => (
              <ChipComponent
                key={chip.id}
                id={chip.id}
                title={chip.title}
                subtitle={chip.subtitle}
                description={chip.description}
                status={chip.status as any}
                type={chip.type}
                position={chip.position}
                isActive={
                  (chip.id === 'bootrom-chip' && currentStep <= 1) ||
                  (chip.id === 'flash-chip' && currentStep === 2) ||
                  (chip.id === 'processor-chip' && currentStep >= 3)
                }
                onClick={() => onChipClick(chip.id)}
                rotation={{ x: 0, y: 0, z: 0 }}
                onZoomIn={() => setSelectedChipForSteps(chip.id)}
                internalComponents={chip.internalComponents}
              />
            ))}

            {/* Circuit board base */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-96 h-2 bg-gradient-to-r from-green-800 via-green-600 to-green-800 rounded-lg shadow-lg" 
                 style={{ transform: 'translateZ(-50px)' }}>
              {/* PCB traces */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent h-0.5 top-1/2" />
            </div>

            {/* Chain of trust visualization */}
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 text-white text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span>Hardware RoT</span>
              </div>
              <div className="w-8 h-0.5 bg-gradient-to-r from-blue-500 to-green-500" />
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span>Verified Chain</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating particles for ambiance */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: Z_INDEX.BACKGROUND }}>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-30 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Chip Step Visualization Modal */}
      <ChipStepVisualization
        chipId={selectedChipForSteps}
        currentGlobalStep={currentStep}
        isAutoMode={autoZoomEnabled}
        onClose={() => setSelectedChipForSteps(null)}
      />
    </>
  );
};

export default ChipScene3D;