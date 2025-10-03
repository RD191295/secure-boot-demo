import React from 'react';
import { Zap, Power } from 'lucide-react';

interface PowerRailProps {
  id: string;
  name: string;
  position: { x: number; y: number; z: number };
  voltage: number;
  isActive: boolean;
  onClick: () => void;
}

const PowerRail: React.FC<PowerRailProps> = ({
  id,
  name,
  position,
  voltage,
  isActive,
  onClick
}) => {
  const getVoltageColor = () => {
    if (voltage === 0) return 'from-gray-600 to-gray-800';
    if (voltage <= 1.2) return 'from-blue-500 to-blue-700';
    if (voltage <= 1.8) return 'from-green-500 to-green-700';
    return 'from-red-500 to-red-700';
  };

  return (
    <div
      className="absolute cursor-pointer transition-all duration-500"
      style={{
        left: `calc(50% + ${position.x}px)`,
        top: `calc(50% + ${position.y}px)`,
        transform: `translateZ(${position.z}px)`
      }}
      onClick={onClick}
    >
      {/* Power Rail Body */}
      <div className={`
        w-32 h-8 bg-gradient-to-r ${getVoltageColor()} rounded-lg border-2
        ${isActive ? 'border-yellow-400 shadow-lg shadow-yellow-500/50' : 'border-gray-600'}
        flex items-center justify-between px-3
        ${voltage > 0 ? 'animate-pulse' : ''}
      `}>
        <Power className="w-4 h-4 text-white" />
        <div className="text-white text-xs font-bold">
          {voltage.toFixed(1)}V
        </div>
        {voltage > 0 && (
          <Zap className="w-4 h-4 text-yellow-300 animate-bounce" />
        )}
      </div>

      {/* Voltage Label */}
      <div className="absolute -bottom-6 left-0 right-0 text-center">
        <div className="text-xs text-gray-400 font-mono">
          {name}
        </div>
      </div>

      {/* Power Flow Animation */}
      {voltage > 0 && (
        <div className="absolute inset-0 overflow-hidden rounded-lg">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-300 rounded-full opacity-70"
              style={{
                left: `${20 + i * 25}%`,
                top: '50%',
                transform: 'translateY(-50%)',
                animation: `powerFlow 1.5s infinite linear ${i * 0.5}s`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PowerRail;