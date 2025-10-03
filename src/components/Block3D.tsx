import React, { useState } from 'react';
import { Lock, Shield, Cpu, FileCheck, Key, Zap } from 'lucide-react';

interface Block3DProps {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  status: 'idle' | 'verifying' | 'verified' | 'failed';
  type: 'bootrom' | 'bootloader' | 'os' | 'verification';
  position: { x: number; y: number; z: number };
  isActive: boolean;
  onClick: () => void;
  rotation: { x: number; y: number; z: number };
}

const Block3D: React.FC<Block3DProps> = ({
  id,
  title,
  subtitle,
  description,
  status,
  type,
  position,
  isActive,
  onClick,
  rotation
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getBlockColor = () => {
    switch (type) {
      case 'bootrom':
        return status === 'verified' ? 'from-blue-500 to-cyan-400' : 'from-blue-600 to-blue-800';
      case 'bootloader':
        return status === 'verified' ? 'from-green-500 to-emerald-400' : 
               status === 'verifying' ? 'from-yellow-500 to-orange-400' : 'from-red-500 to-red-700';
      case 'os':
        return status === 'verified' ? 'from-purple-500 to-pink-400' : 
               status === 'verifying' ? 'from-yellow-500 to-orange-400' : 'from-gray-500 to-gray-700';
      case 'verification':
        return 'from-cyan-400 to-blue-500';
      default:
        return 'from-gray-600 to-gray-800';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'bootrom':
        return <Shield className="w-8 h-8" />;
      case 'bootloader':
        return <Cpu className="w-8 h-8" />;
      case 'os':
        return <FileCheck className="w-8 h-8" />;
      case 'verification':
        return <Key className="w-8 h-8" />;
      default:
        return <Shield className="w-8 h-8" />;
    }
  };

  const getGlowIntensity = () => {
    if (status === 'verifying' || isActive) return 'shadow-2xl shadow-cyan-500/50';
    if (status === 'verified') return 'shadow-xl shadow-green-500/30';
    if (isHovered) return 'shadow-xl shadow-blue-500/30';
    return 'shadow-lg shadow-black/50';
  };

  return (
    <div
      className="absolute cursor-pointer transition-all duration-500 ease-out"
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, ${position.z}px) 
                   rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)
                   ${isHovered ? 'scale(1.05)' : 'scale(1)'}`,
        transformStyle: 'preserve-3d'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Main Block */}
      <div className={`
        relative w-48 h-32 rounded-xl bg-gradient-to-br ${getBlockColor()}
        border-2 ${status === 'verified' ? 'border-green-400' : 
                  status === 'verifying' ? 'border-yellow-400 animate-pulse' : 
                  'border-gray-600'}
        ${getGlowIntensity()}
        backdrop-blur-sm
        ${status === 'verifying' ? 'animate-pulse' : ''}
      `}>
        {/* Glowing edges */}
        <div className={`
          absolute inset-0 rounded-xl border-2 
          ${status === 'verifying' ? 'border-cyan-400 animate-pulse' : 'border-transparent'}
          ${status === 'verified' ? 'border-green-400' : ''}
        `} />
        
        {/* Content */}
        <div className="relative z-10 p-4 h-full flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="text-white">
              {getIcon()}
            </div>
            {type === 'bootrom' && (
              <Lock className="w-6 h-6 text-yellow-400" />
            )}
            {status === 'verified' && (
              <div className="w-4 h-4 bg-green-400 rounded-full animate-ping" />
            )}
          </div>
          
          <div>
            <h3 className="text-white font-bold text-sm leading-tight">{title}</h3>
            <p className="text-gray-200 text-xs mt-1">{subtitle}</p>
          </div>
        </div>

        {/* 3D depth effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-transparent to-black/20 pointer-events-none" />
        
        {/* Verification particles */}
        {status === 'verifying' && (
          <div className="absolute inset-0 overflow-hidden rounded-xl">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-ping"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${30 + (i % 2) * 40}%`,
                  animationDelay: `${i * 0.2}s`
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info panel (appears on hover) */}
      {isHovered && (
        <div className="absolute top-full left-0 mt-4 w-64 p-4 bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-600 shadow-xl z-50">
          <h4 className="text-white font-semibold mb-2">{title}</h4>
          <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
        </div>
      )}
    </div>
  );
};

export default Block3D;