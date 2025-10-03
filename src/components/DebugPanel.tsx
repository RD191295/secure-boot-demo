import React from 'react';
import { X, Cpu, Database, Flag, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface DebugPanelProps {
  registers: Record<string, any>;
  memory: Record<string, any>;
  flags: Record<string, boolean>;
  currentStage: number;
  stageData: any;
  mode: 'normal' | 'tampered';
  onClose: () => void;
}

const DebugPanel: React.FC<DebugPanelProps> = ({
  registers,
  memory,
  flags,
  currentStage,
  stageData,
  mode,
  onClose
}) => {
  const formatHex = (value: number) => `0x${value.toString(16).toUpperCase().padStart(8, '0')}`;

  return (
    <div className="absolute top-4 right-4 w-80 max-h-[80vh] bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-600 overflow-hidden z-40">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-cyan-400" />
          <h3 className="text-white font-semibold">Debug Panel</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-800 rounded transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
        {/* Current Stage */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-white">Current Stage</span>
          </div>
          <div className="bg-gray-800/50 rounded p-3">
            <div className="text-cyan-400 font-mono text-sm">Stage {currentStage}</div>
            <div className="text-gray-300 text-sm">{stageData.name}</div>
            <div className="text-gray-400 text-xs mt-1">{stageData.description}</div>
          </div>
        </div>

        {/* Registers */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2 mb-3">
            <Cpu className="w-4 h-4 text-green-400" />
            <span className="text-sm font-semibold text-white">Registers</span>
          </div>
          <div className="space-y-2">
            {Object.entries(registers).map(([name, value]) => (
              <div key={name} className="flex justify-between items-center bg-gray-800/30 rounded p-2">
                <span className="text-gray-300 text-sm font-mono">{name}</span>
                <span className="text-cyan-400 text-sm font-mono">
                  {typeof value === 'number' ? formatHex(value) : String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Memory */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2 mb-3">
            <Database className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold text-white">Memory</span>
          </div>
          <div className="space-y-2">
            {Object.entries(memory).map(([address, data]) => (
              <div key={address} className="bg-gray-800/30 rounded p-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-300 text-xs font-mono">{address}</span>
                  <span className="text-purple-400 text-xs">
                    {Array.isArray(data) ? `${data.length} bytes` : typeof data}
                  </span>
                </div>
                <div className="text-gray-400 text-xs font-mono break-all">
                  {Array.isArray(data) 
                    ? data.slice(0, 16).map(b => b.toString(16).padStart(2, '0')).join(' ') + (data.length > 16 ? '...' : '')
                    : String(data).substring(0, 40) + (String(data).length > 40 ? '...' : '')
                  }
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Flags */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2 mb-3">
            <Flag className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-semibold text-white">Status Flags</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(flags).map(([name, value]) => (
              <div key={name} className="flex items-center space-x-2 bg-gray-800/30 rounded p-2">
                {value ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-gray-600" />
                )}
                <span className="text-gray-300 text-xs">{name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Boot Status */}
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-3">
            {mode === 'tampered' && currentStage >= 6 ? (
              <AlertTriangle className="w-4 h-4 text-red-400" />
            ) : currentStage >= 7 ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <Clock className="w-4 h-4 text-blue-400" />
            )}
            <span className="text-sm font-semibold text-white">Boot Status</span>
          </div>
          <div className={`
            p-3 rounded border
            ${mode === 'tampered' && currentStage >= 6 
              ? 'bg-red-900/30 border-red-500 text-red-200' 
              : currentStage >= 7 
                ? 'bg-green-900/30 border-green-500 text-green-200'
                : 'bg-blue-900/30 border-blue-500 text-blue-200'
            }
          `}>
            <div className="font-semibold text-sm">
              {mode === 'tampered' && currentStage >= 6 
                ? 'SAFE MODE ACTIVE' 
                : currentStage >= 7 
                  ? 'BOOT SUCCESS' 
                  : 'BOOTING...'
              }
            </div>
            <div className="text-xs mt-1 opacity-80">
              {mode === 'tampered' && currentStage >= 6 
                ? 'Tampered image detected - running in safe mode with limited functionality' 
                : currentStage >= 7 
                  ? 'All verification stages completed successfully'
                  : 'Secure boot process in progress'
              }
            </div>
          </div>
        </div>

        {/* Safe Mode Indicator */}
        {mode === 'tampered' && currentStage >= 6 && (
          <div className="p-4 border-t border-gray-700">
            <div className="bg-orange-900/30 border border-orange-500 rounded p-3">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                <span className="text-orange-200 font-semibold text-sm">Safe Mode Features</span>
              </div>
              <div className="text-xs text-orange-300 space-y-1">
                <div>• Bootloader execution blocked</div>
                <div>• Limited system functionality</div>
                <div>• Recovery mode available</div>
                <div>• Secure diagnostics enabled</div>
              </div>
            </div>
          </div>
        )}

        {/* Instruction Pointer */}
        {currentStage >= 1 && (
          <div className="p-4 border-t border-gray-700">
            <div className="text-sm font-semibold text-white mb-2">Instruction Pointer</div>
            <div className="bg-gray-800/50 rounded p-3 font-mono text-sm">
              <div className="text-cyan-400">PC: {formatHex(registers.PC || 0)}</div>
              <div className="text-gray-400 text-xs mt-1">
                Current instruction: {stageData.instruction || 'N/A'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugPanel;