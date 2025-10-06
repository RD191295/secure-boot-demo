import React, { useState, useEffect } from 'react';
import { Shield, Key, Database, Zap, Lock } from 'lucide-react';

interface DataFlowProps {
  from: { x: number; y: number; z: number };
  to: { x: number; y: number; z: number };
  isActive: boolean;
  status: 'idle' | 'verifying' | 'verified' | 'failed';
  flowType: 'data' | 'signature' | 'verification';
}

interface DataPacket {
  id: number;
  progress: number;
}

const DataFlow: React.FC<DataFlowProps> = ({ from, to, isActive, status, flowType }) => {
  const [dataPackets, setDataPackets] = useState<DataPacket[]>([]);

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setDataPackets(prev => {
          const updated = prev
            .map(p => ({ ...p, progress: p.progress + 0.02 }))
            .filter(p => p.progress <= 1.1);

          if (Math.random() > 0.7) {
            updated.push({ id: Date.now(), progress: 0 });
          }

          return updated;
        });
      }, 50);
      return () => clearInterval(interval);
    } else {
      setDataPackets([]);
    }
  }, [isActive]);

  const startX = from.x + 320;
  const startY = from.y + 128;
  const endX = to.x + 80;
  const endY = to.y + 128;

  const controlX1 = startX + (endX - startX) * 0.3;
  const controlY1 = startY - 80;
  const controlX2 = startX + (endX - startX) * 0.7;
  const controlY2 = endY - 80;

  const connectionPath = `M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`;

  const getStatusColor = () => {
    switch (status) {
      case 'verified':
        return '#10b981';
      case 'verifying':
        return '#f59e0b';
      case 'failed':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getPacketPosition = (progress: number) => {
    const t = Math.min(Math.max(progress, 0), 1);
    const x = Math.pow(1 - t, 3) * startX +
              3 * Math.pow(1 - t, 2) * t * controlX1 +
              3 * (1 - t) * Math.pow(t, 2) * controlX2 +
              Math.pow(t, 3) * endX;
    const y = Math.pow(1 - t, 3) * startY +
              3 * Math.pow(1 - t, 2) * t * controlY1 +
              3 * (1 - t) * Math.pow(t, 2) * controlY2 +
              Math.pow(t, 3) * endY;
    return { x, y };
  };

  const getPacketIcon = () => {
    switch (flowType) {
      case 'signature':
        return Key;
      case 'verification':
        return Shield;
      default:
        return Database;
    }
  };

  const Icon = getPacketIcon();

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ transform: 'translateZ(0)' }}>
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id={`gradient-${from.x}-${to.x}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={getStatusColor()} stopOpacity="0.3" />
            <stop offset="50%" stopColor={getStatusColor()} stopOpacity="0.8" />
            <stop offset="100%" stopColor={getStatusColor()} stopOpacity="0.3" />
          </linearGradient>
          <filter id={`glow-${from.x}-${to.x}`}>
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <path
          d={connectionPath}
          fill="none"
          stroke={isActive ? getStatusColor() : '#4b5563'}
          strokeWidth={isActive ? "10" : "4"}
          strokeOpacity={isActive ? 0.6 : 0.3}
          filter={isActive ? `url(#glow-${from.x}-${to.x})` : 'none'}
          style={{
            transition: 'all 0.5s ease',
            strokeDasharray: status === 'verifying' ? '20 10' : 'none',
            animation: status === 'verifying' ? 'dash 1s linear infinite' : 'none'
          }}
        />

        {isActive && (
          <path
            d={connectionPath}
            fill="none"
            stroke={`url(#gradient-${from.x}-${to.x})`}
            strokeWidth="14"
            strokeOpacity="0.4"
            style={{
              animation: 'pulse 2s ease-in-out infinite'
            }}
          />
        )}
      </svg>

      {isActive && dataPackets.map(packet => {
        const pos = getPacketPosition(packet.progress);
        return (
          <div
            key={packet.id}
            className="absolute"
            style={{
              left: pos.x,
              top: pos.y,
              transform: 'translate(-50%, -50%) translateZ(20px)',
              transformStyle: 'preserve-3d'
            }}
          >
            <div
              className="relative flex items-center justify-center w-12 h-12 rounded-lg shadow-2xl"
              style={{
                backgroundColor: getStatusColor(),
                boxShadow: `0 0 25px ${getStatusColor()}, 0 0 50px ${getStatusColor()}40`,
                animation: 'float 1s ease-in-out infinite'
              }}
            >
              <Icon className="w-6 h-6 text-white" />
              <div className="absolute inset-0 rounded-lg" style={{
                background: `radial-gradient(circle, ${getStatusColor()}60, transparent)`,
                animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite'
              }} />
            </div>
          </div>
        );
      })}

      {isActive && (
        <div
          className="absolute flex items-center gap-2 px-3 py-2 bg-gray-900/90 backdrop-blur-sm rounded-lg border shadow-xl"
          style={{
            left: (startX + endX) / 2,
            top: Math.min(controlY1, controlY2) - 40,
            transform: 'translate(-50%, -50%)',
            borderColor: getStatusColor()
          }}
        >
          <Zap className="w-4 h-4" style={{ color: getStatusColor() }} />
          <span className="text-sm font-semibold text-white">
            {flowType === 'signature' ? 'Signature Verification' :
             flowType === 'verification' ? 'Trust Chain' :
             'Data Transfer'}
          </span>
        </div>
      )}

      {status === 'verifying' && isActive && (
        <div
          className="absolute animate-spin"
          style={{
            left: (startX + endX) / 2,
            top: (startY + endY) / 2 - 60,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <Lock className="w-6 h-6 text-yellow-400" />
        </div>
      )}

      <style>{`
        @keyframes dash {
          to { stroke-dashoffset: -30; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-5px) scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default DataFlow;
