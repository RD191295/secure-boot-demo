import React from 'react';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, Gauge } from 'lucide-react';

interface TimelineControlProps {
  currentStage: number;
  totalStages: number;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onReset: () => void;
  onGoToStage: (stage: number) => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  stageNames: string[];
}

const TimelineControl: React.FC<TimelineControlProps> = ({
  currentStage,
  totalStages,
  isPlaying,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  onReset,
  onGoToStage,
  speed,
  onSpeedChange,
  stageNames
}) => {
  return (
    <div className="bg-gray-900/95 backdrop-blur-sm rounded-xl border border-gray-600 p-4 min-w-[600px]">
      {/* Stage Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Boot Progress</span>
          <span>{currentStage} / {totalStages}</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2 mb-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min((currentStage / totalStages) * 100, 100)}%` }}
          />
        </div>
        
        {/* Stage Markers */}
        <div className="flex justify-between">
          {stageNames.map((name, index) => (
            <button
              key={index}
              onClick={() => onGoToStage(index)}
              className={`
                text-xs px-2 py-1 rounded transition-colors cursor-pointer
                ${index <= currentStage 
                  ? 'text-cyan-400 bg-cyan-900/30 border border-cyan-500/50' 
                  : 'text-gray-500 hover:text-gray-300'
                }
              `}
              title={name}
            >
              {index}
            </button>
          ))}
        </div>
      </div>

      {/* Current Stage Info */}
      <div className="mb-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
        <div className="text-white font-semibold text-sm">
          {stageNames[currentStage] || 'Complete'}
        </div>
        <div className="text-gray-400 text-xs mt-1">
          Stage {currentStage} of {totalStages}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-3 mb-4">
        <button
          onClick={onPrevious}
          disabled={currentStage === 0}
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
          onClick={onNext}
          disabled={currentStage >= totalStages}
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

      {/* Speed Control */}
      <div className="flex items-center space-x-3">
        <Gauge className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-400 min-w-[60px]">Speed:</span>
        <input
          type="range"
          min={0.25}
          max={3}
          step={0.25}
          value={speed}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
          className="flex-1 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer slider"
        />
        <span className="text-sm text-gray-400 min-w-[40px]">{speed}x</span>
      </div>
    </div>
  );
};

export default TimelineControl;