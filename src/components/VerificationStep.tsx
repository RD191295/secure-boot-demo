import React from 'react';
import FileIcon from './FileIcon';
import { ArrowRight, CheckCircle, XCircle, Clock } from 'lucide-react';

interface VerificationStepProps {
  stepNumber: number;
  title: string;
  description: string;
  detailedSteps?: string[];
  verifier: {
    type: 'bootrom' | 'bootloader1' | 'bootloader2' | 'firmware' | 'certificate' | 'signature' | 'hardware' | 'hsm' | 'publickey' | 'privatekey' | 'hash' | 'mmu' | 'trustzone';
    name: string;
    status: 'idle' | 'verifying' | 'verified' | 'failed';
  };
  target: {
    type: 'bootrom' | 'bootloader1' | 'bootloader2' | 'firmware' | 'certificate' | 'signature' | 'hardware' | 'hsm' | 'publickey' | 'privatekey' | 'hash' | 'mmu' | 'trustzone';
    name: string;
    status: 'idle' | 'verifying' | 'verified' | 'failed';
  };
  additionalComponents?: Array<{
    type: 'bootrom' | 'bootloader1' | 'bootloader2' | 'firmware' | 'certificate' | 'signature' | 'hardware' | 'hsm' | 'publickey' | 'privatekey' | 'hash' | 'mmu' | 'trustzone';
    name: string;
    status: 'idle' | 'verifying' | 'verified' | 'failed';
  }>;
  signature?: {
    status: 'idle' | 'verifying' | 'verified' | 'failed';
  };
  isActive: boolean;
  isCompleted: boolean;
}

const VerificationStep: React.FC<VerificationStepProps> = ({
  stepNumber,
  title,
  description,
  detailedSteps,
  verifier,
  target,
  additionalComponents,
  signature,
  isActive,
  isCompleted
}) => {
  const getStepStatusIcon = () => {
    if (isCompleted) {
      return <CheckCircle className="w-6 h-6 text-green-400" />;
    }
    if (isActive) {
      return <Clock className="w-6 h-6 text-yellow-400 animate-spin" />;
    }
    return <div className="w-6 h-6 rounded-full border-2 border-gray-600" />;
  };

  return (
    <div className={`
      relative p-6 rounded-xl border transition-all duration-500 ease-in-out
      ${isActive ? 'border-yellow-500 bg-yellow-900/10 shadow-lg shadow-yellow-500/20' : ''}
      ${isCompleted ? 'border-green-500 bg-green-900/10' : ''}
      ${!isActive && !isCompleted ? 'border-gray-700 bg-gray-900/30' : ''}
    `}>
      <div className="flex items-center mb-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-800 border border-gray-600 mr-3">
          <span className="text-sm font-bold text-gray-300">{stepNumber}</span>
        </div>
        {getStepStatusIcon()}
        <h3 className="ml-3 text-lg font-semibold text-white">{title}</h3>
      </div>
      
      <p className="text-gray-300 mb-6 text-sm leading-relaxed">{description}</p>
      
      {detailedSteps && (
        <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-600">
          <h4 className="text-sm font-semibold text-white mb-3">Process Details:</h4>
          <ul className="space-y-2">
            {detailedSteps.map((step, index) => (
              <li key={index} className="flex items-start text-xs text-gray-300">
                <span className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 mr-3 flex-shrink-0" />
                {step}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="flex items-center justify-center flex-wrap gap-6">
        <div className="flex flex-col items-center">
          <FileIcon type={verifier.type} status={verifier.status} />
          <span className="mt-2 text-xs text-gray-400 text-center">{verifier.name}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <ArrowRight className={`
            w-6 h-6 transition-colors duration-300
            ${isActive ? 'text-yellow-400 animate-pulse' : 'text-gray-600'}
          `} />
        </div>
        
        <div className="flex flex-col items-center">
          <FileIcon type={target.type} status={target.status} />
          <span className="mt-2 text-xs text-gray-400 text-center">{target.name}</span>
        </div>
        
        {signature && (
          <>
            <div className="flex items-center space-x-2">
              <ArrowRight className={`
                w-4 h-4 transition-colors duration-300
                ${signature.status === 'verifying' ? 'text-yellow-400 animate-pulse' : 'text-gray-600'}
              `} />
            </div>
            
            <div className="flex flex-col items-center">
              <FileIcon type="signature" status={signature.status} size="small" />
              <span className="mt-1 text-xs text-gray-400 text-center">Signature</span>
            </div>
          </>
        )}
      </div>
      
      {additionalComponents && additionalComponents.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-700">
          <h4 className="text-sm font-semibold text-white mb-3">Additional Components:</h4>
          <div className="flex items-center justify-center flex-wrap gap-4">
            {additionalComponents.map((component, index) => (
              <div key={index} className="flex flex-col items-center">
                <FileIcon type={component.type} status={component.status} size="small" />
                <span className="mt-1 text-xs text-gray-400 text-center">{component.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationStep;