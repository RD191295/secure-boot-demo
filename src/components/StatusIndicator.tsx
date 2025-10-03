import React from 'react';
import { Shield, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface StatusIndicatorProps {
  status: 'idle' | 'booting' | 'success' | 'failed';
  currentStage: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, currentStage }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'idle':
        return {
          icon: <Shield className="w-8 h-8" />,
          color: 'text-gray-400',
          bgColor: 'bg-gray-800',
          borderColor: 'border-gray-600',
          message: 'Ready to start secure boot process'
        };
      case 'booting':
        return {
          icon: <Clock className="w-8 h-8 animate-spin" />,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-900/20',
          borderColor: 'border-yellow-500',
          message: `Currently: ${currentStage}`
        };
      case 'success':
        return {
          icon: <CheckCircle className="w-8 h-8" />,
          color: 'text-green-400',
          bgColor: 'bg-green-900/20',
          borderColor: 'border-green-500',
          message: 'Secure boot completed successfully'
        };
      case 'failed':
        return {
          icon: <AlertCircle className="w-8 h-8" />,
          color: 'text-red-400',
          bgColor: 'bg-red-900/20',
          borderColor: 'border-red-500',
          message: 'Secure boot failed - Verification error'
        };
      default:
        return {
          icon: <Shield className="w-8 h-8" />,
          color: 'text-gray-400',
          bgColor: 'bg-gray-800',
          borderColor: 'border-gray-600',
          message: 'Ready to start secure boot process'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`
      ${config.bgColor} ${config.borderColor} ${config.color}
      p-6 rounded-xl border-2 transition-all duration-300 ease-in-out
    `}>
      <div className="flex items-center space-x-4">
        {config.icon}
        <div>
          <h3 className="text-lg font-semibold mb-1">Boot Status</h3>
          <p className="text-sm opacity-90">{config.message}</p>
        </div>
      </div>
    </div>
  );
};

export default StatusIndicator;