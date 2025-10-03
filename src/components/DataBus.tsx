import React from 'react';
import { ArrowRight, Zap, Database, Shield, Power } from 'lucide-react';

interface DataBusProps {
  id: string;
  from: { x: number; y: number; z: number };
  to: { x: number; y: number; z: number };
  type: 'power' | 'data' | 'control' | 'address';
  isActive: boolean;
  isVisible?: boolean;
  data: string;
  animationSpeed: number;
}

const DataBus: React.FC<DataBusProps> = ({
  id,
  from,
  to,
  type,
  isActive,
  isVisible = true,
  data,
  animationSpeed
}) => {

  if (!isVisible) return null;
  const distance = Math.sqrt(
    Math.pow(to.x - from.x, 2) + 
    Math.pow(to.y - from.y, 2)
  );
  
  const angle = Math.atan2(to.y - from.y, to.x - from.x) * (180 / Math.PI);

  const getBusConfig = () => {
    switch (type) {
      case 'power':
        return {
          color: 'from-red-500 via-red-400 to-red-500',
          icon: <Power className="w-3 h-3" />,
          thickness: 'h-4',
          particles: 3
        };
      case 'data':
        return {
          color: 'from-blue-500 via-cyan-400 to-blue-500',
          icon: <Database className="w-3 h-3" />,
          thickness: 'h-4',
          particles: 5
        };
      case 'control':
        return {
          color: 'from-green-500 via-emerald-400 to-green-500',
          icon: <Shield className="w-3 h-3" />,
          thickness: 'h-4',
          particles: 4
        };
      case 'address':
        return {
          color: 'from-purple-500 via-violet-400 to-purple-500',
          icon: <Zap className="w-3 h-3" />,
          thickness: 'h-4',
          particles: 3
        };
      default:
        return {
          color: 'from-gray-500 via-gray-400 to-gray-500',
          icon: <ArrowRight className="w-3 h-3" />,
          thickness: 'h-4',
          particles: 3
        };
    }
  };

  const config = getBusConfig();

  const opacity = isActive ? 'opacity-100' : 'opacity-60';

  return (
    <div
      className={`absolute pointer-events-none z-10 ${opacity}`}
      style={{
        left: `calc(50% + ${from.x + 80}px)`, // Offset to connect to module edge
        top: `calc(50% + ${from.y + 50}px)`,
        transform: `rotate(${angle}deg)`,
        transformOrigin: '0 50%'
      }}
    >
      {/* Main Bus Line */}
      <div
        className={`
          ${config.thickness} bg-gradient-to-r ${config.color} rounded-full relative
          shadow-lg ${isActive ? 'animate-pulse shadow-2xl' : ''}
        `}
        style={{ 
          width: Math.max(distance - 160, 50), // Account for module sizes
          filter: isActive ? 'drop-shadow(0 0 12px currentColor)' : 'drop-shadow(0 0 4px currentColor)'
        }}
      >
        {/* Data Flow Particles */}
        {isActive && [...Array(config.particles)].map((_, i) => (
          <div
            key={i}
            className="absolute top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-lg border-2 border-gray-800"
            style={{
              left: `${(i + 1) * (100 / (config.particles + 1))}%`,
              animation: `flowData ${2 / animationSpeed}s infinite linear ${i * (0.3 / animationSpeed)}s`
            }}
          >
            <div className="text-gray-800 scale-75">
              {config.icon}
            </div>
          </div>
        ))}

        {/* Data Pulses */}
        {isActive && (
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full"
            style={{
              animation: `dataPulse ${1.5 / animationSpeed}s infinite ease-in-out`
            }}
          />
        )}
      </div>

      {/* Bus Label */}
      <div
        className="absolute whitespace-nowrap transform -translate-x-1/2 -translate-y-8"
        style={{ left: '50%' }}
      >
        <div className={`bg-gray-900/95 backdrop-blur-sm px-3 py-2 rounded-lg text-xs text-white border border-gray-600 shadow-lg ${isActive ? 'border-cyan-400 text-cyan-200' : ''}`}>
          <div className="font-semibold">{data}</div>
          <div className="text-gray-400 text-xs">{type.toUpperCase()}</div>
        </div>
      </div>

      {/* Direction Arrow */}
      <div
        className={`absolute top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg border-2 ${isActive ? 'border-cyan-400 animate-pulse' : 'border-gray-600'}`}
        style={{ right: '-8px' }}
      >
        <ArrowRight className={`w-4 h-4 ${isActive ? 'text-cyan-600' : 'text-gray-800'}`} />
      </div>
    </div>
  );
};

export default DataBus;