import React, { useState } from 'react';
import { Cpu, Shield, Lock, Key, Zap, HardDrive, Settings, Eye, EyeOff, ZoomIn } from 'lucide-react';

interface ChipComponentProps {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  status: 'idle' | 'verifying' | 'verified' | 'failed';
  type: 'bootrom' | 'flash' | 'processor';
  position: { x: number; y: number; z: number };
  isActive: boolean;
  onClick: () => void;
  rotation: { x: number; y: number; z: number };
  onZoomIn?: () => void;
  internalComponents: Array<{
    id: string;
    name: string;
    type: 'memory' | 'crypto' | 'keys' | 'verification' | 'hardware';
    status: 'idle' | 'active' | 'processing' | 'complete';
    position: { x: number; y: number };
  }>;
}

const ChipComponent: React.FC<ChipComponentProps> = ({
  id,
  title,
  subtitle,
  description,
  status,
  type,
  position,
  isActive,
  onClick,
  rotation,
  onZoomIn,
  internalComponents
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showInternals, setShowInternals] = useState(false);

  const getChipColor = () => {
    switch (type) {
      case 'bootrom':
        return 'from-blue-600 to-blue-800';
      case 'flash':
        return 'from-red-600 to-red-800';
      case 'processor':
        return 'from-gray-600 to-gray-800';
      default:
        return 'from-gray-600 to-gray-800';
    }
  };

  const getChipIcon = () => {
    switch (type) {
      case 'bootrom':
        return <Shield className="w-6 h-6" />;
      case 'flash':
        return <HardDrive className="w-6 h-6" />;
      case 'processor':
        return <Cpu className="w-6 h-6" />;
      default:
        return <Cpu className="w-6 h-6" />;
    }
  };

  const getInternalIcon = (componentType: string) => {
    switch (componentType) {
      case 'memory':
        return <HardDrive className="w-3 h-3" />;
      case 'crypto':
        return <Key className="w-3 h-3" />;
      case 'keys':
        return <Lock className="w-3 h-3" />;
      case 'verification':
        return <Shield className="w-3 h-3" />;
      case 'hardware':
        return <Settings className="w-3 h-3" />;
      default:
        return <Zap className="w-3 h-3" />;
    }
  };

  const getGlowIntensity = () => {
    if (status === 'verifying' || isActive) return 'shadow-2xl shadow-yellow-500/50';
    if (status === 'verified') return 'shadow-xl shadow-green-500/40';
    if (isHovered) return 'shadow-xl shadow-blue-500/30';
    return 'shadow-xl shadow-black/50';
  };

  return (
    <div
      className="absolute cursor-pointer transition-all duration-500 ease-out"
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, ${position.z}px)
                   rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)
                   ${isHovered ? 'scale(1.05)' : 'scale(1)'}`,
        transformStyle: 'preserve-3d',
        zIndex: isHovered ? 100 : 10
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Main Chip Body */}
      <div className={`
        relative w-80 h-56 rounded-2xl bg-gradient-to-br ${getChipColor()}
        border-4 ${status === 'verified' ? 'border-green-400' : 
                  status === 'verifying' ? 'border-yellow-400 animate-pulse' : 
                  'border-gray-600'}
        ${getGlowIntensity()}
        backdrop-blur-sm
        ${status === 'verifying' ? 'animate-pulse' : ''}
        overflow-hidden
      `}>
        {/* Chip Surface Pattern */}
        <div className="absolute inset-2 border border-gray-400/30 rounded-xl">
          {/* Circuit traces */}
          <div className="absolute inset-0">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent h-0.5"
                style={{
                  top: `${15 + i * 10}%`,
                  left: '10%',
                  right: '10%',
                  animationDelay: `${i * 0.2}s`
                }}
              />
            ))}
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent w-0.5"
                style={{
                  left: `${20 + i * 12}%`,
                  top: '15%',
                  bottom: '15%',
                  animationDelay: `${i * 0.3}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* Chip Header */}
        <div className="relative z-10 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-white">
              {getChipIcon()}
            </div>
            <div>
              <h3 className="text-white font-bold text-lg leading-tight drop-shadow-lg">{title}</h3>
              <p className="text-gray-200 text-sm font-semibold drop-shadow-md">{subtitle}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {type === 'bootrom' && (
              <Lock className="w-5 h-5 text-yellow-400" />
            )}
            {status === 'verified' && (
              <div className="w-3 h-3 bg-green-400 rounded-full animate-ping" />
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowInternals(!showInternals);
              }}
              className="p-1 rounded bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
            >
              {showInternals ? <EyeOff className="w-4 h-4 text-gray-300" /> : <Eye className="w-4 h-4 text-gray-300" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onZoomIn?.();
              }}
              className="p-1 rounded bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
              title="View detailed steps"
            >
              <ZoomIn className="w-4 h-4 text-gray-300" />
            </button>
          </div>
        </div>

        {/* Internal Components View */}
        {showInternals && (
          <div className="absolute inset-4 top-16 bg-black/80 backdrop-blur-sm rounded-lg border border-cyan-400/30 p-3">
            <h4 className="text-xs font-semibold text-cyan-400 mb-3">Internal Components</h4>
            <div className="grid grid-cols-3 gap-2">
              {internalComponents.map((component) => (
                <div
                  key={component.id}
                  className={`
                    relative p-2 rounded-lg border text-center transition-all duration-300
                    ${component.status === 'active' ? 'border-yellow-400 bg-yellow-900/20 animate-pulse' :
                      component.status === 'processing' ? 'border-cyan-400 bg-cyan-900/20' :
                      component.status === 'complete' ? 'border-green-400 bg-green-900/20' :
                      'border-gray-600 bg-gray-800/50'}
                  `}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <div className={`
                      ${component.status === 'active' ? 'text-yellow-400' :
                        component.status === 'processing' ? 'text-cyan-400' :
                        component.status === 'complete' ? 'text-green-400' :
                        'text-gray-400'}
                    `}>
                      {getInternalIcon(component.type)}
                    </div>
                    <span className="text-xs text-gray-300 leading-tight">{component.name}</span>
                  </div>
                  
                  {/* Processing animation */}
                  {component.status === 'processing' && (
                    <div className="absolute inset-0 rounded-lg overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent animate-pulse" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chip Pins */}
        <div className="absolute -left-2 top-8 bottom-8 flex flex-col justify-between">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="w-4 h-2 bg-gray-400 rounded-r" />
          ))}
        </div>
        <div className="absolute -right-2 top-8 bottom-8 flex flex-col justify-between">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="w-4 h-2 bg-gray-400 rounded-l" />
          ))}
        </div>

        {/* Status Indicators */}
        {status === 'verifying' && (
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-ping"
                style={{
                  left: `${10 + (i % 4) * 20}%`,
                  top: `${20 + Math.floor(i / 4) * 20}%`,
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
        )}

        {/* 3D depth effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-transparent to-black/20 pointer-events-none" />
      </div>

      {/* Chip Shadow/Base */}
      <div className="absolute inset-0 top-2 bg-black/30 rounded-2xl blur-sm -z-10" />

      {/* Info panel (appears on hover) */}
      {isHovered && !showInternals && (
        <div className="absolute top-full left-0 mt-4 w-80 p-4 bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-600 shadow-xl z-50">
          <h4 className="text-white font-semibold mb-2">{title}</h4>
          <p className="text-gray-300 text-sm leading-relaxed mb-3">{description}</p>
          <div className="text-xs text-cyan-400">
            Click the eye icon to view internal components
          </div>
        </div>
      )}
    </div>
  );
};

export default ChipComponent;