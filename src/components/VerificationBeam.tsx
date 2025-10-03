import React from 'react';

interface VerificationBeamProps {
  from: { x: number; y: number; z: number };
  to: { x: number; y: number; z: number };
  isActive: boolean;
  status: 'idle' | 'verifying' | 'verified' | 'failed';
}

const VerificationBeam: React.FC<VerificationBeamProps> = ({ from, to, isActive, status }) => {
  const distance = Math.sqrt(
    Math.pow(to.x - from.x, 2) + 
    Math.pow(to.y - from.y, 2) + 
    Math.pow(to.z - from.z, 2)
  );
  
  const angle = Math.atan2(to.y - from.y, to.x - from.x) * (180 / Math.PI);

  const getBeamColor = () => {
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

  if (!isActive && status === 'idle') return null;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: from.x + 96, // Center of block (192/2)
        top: from.y + 64,  // Center of block (128/2)
        transform: `rotate(${angle}deg)`,
        transformOrigin: '0 50%',
        zIndex: 5
      }}
    >
      {/* Main beam */}
      <div
        className={`
          h-2 ${getBeamColor()} rounded-full
          ${status === 'verifying' ? 'animate-pulse' : ''}
          shadow-lg shadow-cyan-500/50
        `}
        style={{ width: distance }}
      >
        {/* Flowing particles */}
        {status === 'verifying' && (
          <>
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute top-0 w-4 h-2 bg-white rounded-full opacity-80 animate-pulse"
                style={{
                  left: `${i * 33}%`,
                  animationDelay: `${i * 0.3}s`,
                  animation: `flowParticle 1.5s infinite linear ${i * 0.3}s`
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* Cryptographic key symbol */}
      {status === 'verifying' && (
        <div
          className="absolute top-1/2 transform -translate-y-1/2 w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center animate-bounce"
          style={{ left: '50%', marginLeft: '-12px' }}
        >
          <div className="w-3 h-3 border-2 border-white rounded-sm" />
        </div>
      )}
    </div>
  );
};

export default VerificationBeam;