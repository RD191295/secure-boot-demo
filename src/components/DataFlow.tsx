import React from 'react';
import { ArrowRight, Key, Shield, Lock, Zap } from 'lucide-react';

interface DataFlowProps {
  from: { x: number; y: number; z: number };
  to: { x: number; y: number; z: number };
  isActive: boolean;
  status: 'idle' | 'verifying' | 'verified' | 'failed';
  flowType: 'signature' | 'key' | 'hash' | 'data';
}

const DataFlow: React.FC<DataFlowProps> = ({ from, to, isActive, status, flowType }) => {
  const distance = Math.sqrt(
    Math.pow(to.x - from.x, 2) + 
    Math.pow(to.y - from.y, 2)
  );
  
  const angle = Math.atan2(to.y - from.y, to.x - from.x) * (180 / Math.PI);

  const getFlowColor = () => {
    switch (status) {
      case 'verifying':
        return 'bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400';
      case 'verified':
        return 'bg-gradient-to-r from-green-400 via-emerald-500 to-green-400';
      case 'failed':
        return 'bg-gradient-to-r from-red-400 via-red-500 to-red-400';
      default:
        return 'bg-gradient-to-r from-gray-400 via-gray-500 to-gray-400';
    }
  };

  const getFlowIcon = () => {
    switch (flowType) {
      case 'signature':
        return <Shield className="w-4 h-4" />;
      case 'key':
        return <Key className="w-4 h-4" />;
      case 'hash':
        return <Zap className="w-4 h-4" />;
      case 'data':
        return <ArrowRight className="w-4 h-4" />;
      default:
        return <ArrowRight className="w-4 h-4" />;
    }
  };

  if (!isActive && status === 'idle') return null;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: from.x + 132, // Center of chip (264/2)
        top: from.y + 96,   // Center of chip (192/2)
        transform: `rotate(${angle}deg)`,
        transformOrigin: '0 50%',
        zIndex: 5
      }}
    >
      {/* Main data flow line */}
      <div
        className={`
          h-3 ${getFlowColor()} rounded-full relative
          ${status === 'verifying' ? 'animate-pulse' : ''}
          shadow-lg shadow-cyan-500/50
        `}
        style={{ width: distance }}
      >
        {/* Data packets flowing */}
        {status === 'verifying' && (
          <>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="absolute top-0 w-6 h-3 bg-white/80 rounded-full flex items-center justify-center"
                style={{
                  left: `${i * 25}%`,
                  animation: `flowData 2s infinite linear ${i * 0.5}s`
                }}
              >
                <div className="text-cyan-600 scale-75">
                  {getFlowIcon()}
                </div>
              </div>
            ))}
          </>
        )}

        {/* Cryptographic process indicator */}
        {status === 'verifying' && (
          <div
            className="absolute top-1/2 transform -translate-y-1/2 w-8 h-8 bg-cyan-400 rounded-full flex items-center justify-center animate-spin"
            style={{ left: '50%', marginLeft: '-16px' }}
          >
            <Lock className="w-4 h-4 text-white" />
          </div>
        )}

        {/* Success indicator */}
        {status === 'verified' && (
          <div
            className="absolute top-1/2 transform -translate-y-1/2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center"
            style={{ left: '50%', marginLeft: '-12px' }}
          >
            <Shield className="w-3 h-3 text-white" />
          </div>
        )}
      </div>

      {/* Data flow label */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
        <div className="bg-gray-900/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-gray-300 border border-gray-600">
          {flowType === 'signature' && 'Digital Signature Verification'}
          {flowType === 'key' && 'Public Key Exchange'}
          {flowType === 'hash' && 'Hash Verification'}
          {flowType === 'data' && 'Data Transfer'}
        </div>
      </div>
    </div>
  );
};

export default DataFlow;