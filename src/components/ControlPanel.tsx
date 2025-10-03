import React from 'react';
import { Play, Pause, Square, SkipForward, SkipBack, RotateCcw } from 'lucide-react';

interface ControlPanelProps {
  isPlaying: boolean;
  currentStep: number;
  totalSteps: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onReset: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  isPlaying,
  currentStep,
  totalSteps,
  onPlay,
  onPause,
  onStop,
  onNext,
  onPrevious,
  onReset,
  speed,
  onSpeedChange
}) => {
  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Control Panel</h3>
      
      <div className="flex items-center justify-center space-x-3 mb-6">
        <button
          onClick={onPrevious}
          disabled={currentStep === 0}
          className="p-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <SkipBack className="w-5 h-5" />
        </button>
        
        <button
          onClick={isPlaying ? onPause : onPlay}
          className="p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors"
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </button>
        
        <button
          onClick={onStop}
          className="p-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors"
        >
          <Square className="w-5 h-5" />
        </button>
        
        <button
          onClick={onNext}
          disabled={currentStep >= totalSteps}
          className="p-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <SkipForward className="w-5 h-5" />
        </button>
        
        <button
          onClick={onReset}
          className="p-2 rounded-lg bg-orange-600 text-white hover:bg-orange-500 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Progress</span>
          <span>{currentStep} / {totalSteps}</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm text-gray-400 mb-2">Animation Speed</label>
        <div className="flex items-center space-x-3">
          <span className="text-xs text-gray-500">Slow</span>
          <input
            type="range"
            min={0.5}
            max={3}
            step={0.5}
            value={speed}
            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer slider"
          />
          <span className="text-xs text-gray-500">Fast</span>
        </div>
        <div className="text-center text-xs text-gray-400 mt-1">{speed}x speed</div>
      </div>
    </div>
  );
};

export default ControlPanel;