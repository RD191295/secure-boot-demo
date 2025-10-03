import React, { useState, useRef, useEffect } from 'react';
import Block3D from './Block3D';
import VerificationBeam from './VerificationBeam';
import { RotateCcw, ZoomIn, ZoomOut, Info } from 'lucide-react';

interface Scene3DProps {
  currentStep: number;
  isPlaying: boolean;
  onBlockClick: (blockId: string) => void;
}

const Scene3D: React.FC<Scene3DProps> = ({ currentStep, isPlaying, onBlockClick }) => {
  const [rotation, setRotation] = useState({ x: -10, y: 15, z: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const sceneRef = useRef<HTMLDivElement>(null);

  const blocks = [
    {
      id: 'bootrom',
      title: 'Boot ROM',
      subtitle: 'Immutable Root of Trust',
      description: 'Hardware-based root of trust that cannot be modified. Contains the initial verification code and public key hash burned into silicon.',
      type: 'bootrom' as const,
      position: { x: 200, y: 400, z: 0 },
      status: currentStep >= 0 ? 'verified' : 'idle'
    },
    {
      id: 'bootloader',
      title: 'First-Stage Bootloader',
      subtitle: 'Untrusted Software (Flash)',
      description: 'Initially untrusted bootloader stored in flash memory. Must be cryptographically verified by Boot ROM before execution.',
      type: 'bootloader' as const,
      position: { x: 200, y: 200, z: 0 },
      status: currentStep >= 2 ? 'verified' : currentStep === 1 ? 'verifying' : 'idle'
    },
    {
      id: 'os',
      title: 'Operating System',
      subtitle: 'Application Firmware',
      description: 'Final stage containing the main application or operating system. Verified by the bootloader using the established chain of trust.',
      type: 'os' as const,
      position: { x: 200, y: 50, z: 0 },
      status: currentStep >= 4 ? 'verified' : currentStep === 3 ? 'verifying' : 'idle'
    }
  ];

  const beams = [
    {
      from: blocks[0].position,
      to: blocks[1].position,
      isActive: currentStep >= 1,
      status: currentStep >= 2 ? 'verified' : currentStep === 1 ? 'verifying' : 'idle'
    },
    {
      from: blocks[1].position,
      to: blocks[2].position,
      isActive: currentStep >= 3,
      status: currentStep >= 4 ? 'verified' : currentStep === 3 ? 'verifying' : 'idle'
    }
  ];

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
    setRotation({ x: -10, y: 15, z: 0 });
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
    <div className="relative w-full h-[600px] bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-xl overflow-hidden border border-gray-700">
      {/* Grid background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Controls */}
      <div className="absolute top-4 right-4 flex space-x-2 z-20">
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
      <div className="absolute top-4 left-4 p-3 bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-600 text-white z-20">
        <div className="flex items-center space-x-2 mb-2">
          <Info className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-semibold">3D Controls</span>
        </div>
        <div className="text-xs text-gray-300 space-y-1">
          <div>• Drag to rotate view</div>
          <div>• Click blocks for details</div>
          <div>• Use zoom controls</div>
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
          {/* Verification beams */}
          {beams.map((beam, index) => (
            <VerificationBeam
              key={index}
              from={beam.from}
              to={beam.to}
              isActive={beam.isActive}
              status={beam.status as any}
            />
          ))}

          {/* 3D Blocks */}
          {blocks.map((block) => (
            <Block3D
              key={block.id}
              id={block.id}
              title={block.title}
              subtitle={block.subtitle}
              description={block.description}
              status={block.status as any}
              type={block.type}
              position={block.position}
              isActive={
                (block.id === 'bootloader' && currentStep === 1) ||
                (block.id === 'os' && currentStep === 3)
              }
              onClick={() => onBlockClick(block.id)}
              rotation={{ x: 0, y: 0, z: 0 }}
            />
          ))}

          {/* Chain of trust visualization */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 text-white text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span>Root of Trust</span>
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
      <div className="absolute inset-0 pointer-events-none">
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
  );
};

export default Scene3D;