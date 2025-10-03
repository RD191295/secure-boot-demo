import React from 'react';
import { FileCheck, Shield, Key, Cpu, Lock, HardDrive, Zap, Settings } from 'lucide-react';

interface FileIconProps {
  type: 'bootrom' | 'bootloader1' | 'bootloader2' | 'firmware' | 'certificate' | 'signature' | 'hardware' | 'hsm' | 'publickey' | 'privatekey' | 'hash' | 'mmu' | 'trustzone';
  status: 'idle' | 'verifying' | 'verified' | 'failed';
  size?: 'small' | 'medium' | 'large';
}

const FileIcon: React.FC<FileIconProps> = ({ type, status, size = 'medium' }) => {
  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16',
    large: 'w-20 h-20'
  };

  const getIcon = () => {
    switch (type) {
      case 'bootrom':
        return <Cpu className="w-full h-full" />;
      case 'bootloader1':
      case 'bootloader2':
        return <Shield className="w-full h-full" />;
      case 'firmware':
        return <FileCheck className="w-full h-full" />;
      case 'certificate':
        return <Key className="w-full h-full" />;
      case 'signature':
        return <Lock className="w-full h-full" />;
      case 'hardware':
        return <HardDrive className="w-full h-full" />;
      case 'hsm':
        return <Shield className="w-full h-full" />;
      case 'publickey':
        return <Key className="w-full h-full" />;
      case 'privatekey':
        return <Lock className="w-full h-full" />;
      case 'hash':
        return <Zap className="w-full h-full" />;
      case 'mmu':
        return <Settings className="w-full h-full" />;
      case 'trustzone':
        return <Shield className="w-full h-full" />;
      default:
        return <FileCheck className="w-full h-full" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'idle':
        return 'text-gray-400 bg-gray-800';
      case 'verifying':
        return 'text-yellow-400 bg-yellow-900/30 animate-pulse';
      case 'verified':
        return 'text-green-400 bg-green-900/30';
      case 'failed':
        return 'text-red-400 bg-red-900/30';
      default:
        return 'text-gray-400 bg-gray-800';
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'bootrom':
        return 'border-purple-500';
      case 'bootloader1':
        return 'border-blue-500';
      case 'bootloader2':
        return 'border-cyan-500';
      case 'firmware':
        return 'border-green-500';
      case 'certificate':
        return 'border-yellow-500';
      case 'signature':
        return 'border-orange-500';
      case 'hardware':
        return 'border-gray-500';
      case 'hsm':
        return 'border-red-500';
      case 'publickey':
        return 'border-yellow-500';
      case 'privatekey':
        return 'border-red-600';
      case 'hash':
        return 'border-purple-500';
      case 'mmu':
        return 'border-indigo-500';
      case 'trustzone':
        return 'border-teal-500';
      default:
        return 'border-gray-500';
    }
  };

  return (
    <div className={`
      ${sizeClasses[size]}
      ${getStatusColor()}
      ${getTypeColor()}
      relative rounded-lg border-2 p-3
      flex items-center justify-center
      transition-all duration-300 ease-in-out
      shadow-lg hover:shadow-xl
      ${status === 'verifying' ? 'scale-105' : ''}
    `}>
      {getIcon()}
      {status === 'verified' && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
          <FileCheck className="w-2 h-2 text-white" />
        </div>
      )}
      {status === 'failed' && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">×</span>
        </div>
      )}
    </div>
  );
};

export default FileIcon;