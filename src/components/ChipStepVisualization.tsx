import React, { useState, useEffect } from 'react';
import { X, Play, Pause, SkipForward, SkipBack, Zap, Shield, Key, Lock, Cpu, HardDrive, Settings, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface ChipStep {
  id: string;
  title: string;
  description: string;
  component: string;
  status: 'idle' | 'active' | 'processing' | 'complete' | 'error';
  duration: number;
  details: string[];
}

interface ChipStepVisualizationProps {
  chipId: string | null;
  currentGlobalStep: number;
  isAutoMode?: boolean;
  onClose: () => void;
}

const ChipStepVisualization: React.FC<ChipStepVisualizationProps> = ({ chipId, currentGlobalStep, isAutoMode = false, onClose }) => {
  // Early return before any hooks to comply with Rules of Hooks
  if (!chipId) return null;

  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  // Auto-start when chip becomes active in auto mode
  useEffect(() => {
    if (isAutoMode && chipId) {
      setCurrentStep(0);
      setIsPlaying(true);
    }
  }, [chipId, isAutoMode]);

  const getChipSteps = () => {
    switch (chipId) {
      case 'bootrom-chip':
        return {
          title: 'Boot ROM Chip Internal Process',
          icon: <Shield className="w-8 h-8 text-blue-400" />,
          steps: [
            {
              id: 'power-on',
              title: 'Power-On Reset',
              description: 'System receives power and Boot ROM begins execution',
              component: 'Reset Controller',
              status: 'idle' as const,
              duration: 1000,
              details: [
                'Power rails stabilize and reach operating voltage',
                'Reset controller releases system reset',
                'Boot ROM execution begins at reset vector',
                'Initial hardware state is established'
              ]
            },
            {
              id: 'efuse-read',
              title: 'eFuse Key Retrieval',
              description: 'Read immutable public key hash from eFuses',
              component: 'eFuse Controller',
              status: 'idle' as const,
              duration: 1500,
              details: [
                'Access eFuse memory banks',
                'Read public key hash values',
                'Verify eFuse integrity',
                'Load key material into secure registers'
              ]
            },
            {
              id: 'bootloader-load',
              title: 'Bootloader Loading',
              description: 'Load first-stage bootloader from flash memory',
              component: 'Flash Interface',
              status: 'idle' as const,
              duration: 2000,
              details: [
                'Initialize SPI/QSPI flash interface',
                'Read bootloader binary from flash',
                'Load bootloader into internal SRAM',
                'Extract digital signature from bootloader'
              ]
            },
            {
              id: 'crypto-init',
              title: 'Crypto Engine Initialization',
              description: 'Initialize hardware cryptographic accelerator',
              component: 'Crypto Engine',
              status: 'idle' as const,
              duration: 1000,
              details: [
                'Enable cryptographic hardware accelerator',
                'Configure RSA/ECDSA verification engine',
                'Load public key into crypto registers',
                'Initialize hash computation unit'
              ]
            },
            {
              id: 'signature-verify',
              title: 'Digital Signature Verification',
              description: 'Verify bootloader signature using public key',
              component: 'Signature Verifier',
              status: 'idle' as const,
              duration: 3000,
              details: [
                'Compute SHA-256 hash of bootloader binary',
                'Decrypt signature using public key',
                'Compare computed hash with decrypted signature',
                'Validate signature authenticity and integrity'
              ]
            },
            {
              id: 'trust-transfer',
              title: 'Trust Transfer',
              description: 'Transfer execution control to verified bootloader',
              component: 'Execution Controller',
              status: 'idle' as const,
              duration: 500,
              details: [
                'Mark bootloader as trusted and verified',
                'Set up execution environment',
                'Transfer CPU control to bootloader entry point',
                'Boot ROM execution completes'
              ]
            }
          ]
        };
      case 'flash-chip':
        return {
          title: 'Flash Memory Chip Internal Process',
          icon: <HardDrive className="w-8 h-8 text-yellow-400" />,
          steps: [
            {
              id: 'flash-init',
              title: 'Flash Interface Initialization',
              description: 'Initialize flash memory interface and controllers',
              component: 'Flash Controller',
              status: 'idle' as const,
              duration: 1000,
              details: [
                'Configure SPI/QSPI interface timing',
                'Initialize flash memory controller',
                'Set up memory mapping and addressing',
                'Enable flash memory access'
              ]
            },
            {
              id: 'bootloader-read',
              title: 'Bootloader Binary Read',
              description: 'Read first-stage bootloader from flash sectors',
              component: 'Memory Array',
              status: 'idle' as const,
              duration: 2000,
              details: [
                'Access bootloader flash sectors',
                'Read binary data sequentially',
                'Transfer data via SPI interface',
                'Maintain data integrity during transfer'
              ]
            },
            {
              id: 'signature-extract',
              title: 'Signature Extraction',
              description: 'Extract digital signature appended to bootloader',
              component: 'Signature Parser',
              status: 'idle' as const,
              duration: 1000,
              details: [
                'Locate signature section in flash',
                'Extract RSA/ECDSA signature data',
                'Parse signature metadata',
                'Prepare signature for verification'
              ]
            },
            {
              id: 'metadata-read',
              title: 'Metadata Processing',
              description: 'Read bootloader metadata and configuration',
              component: 'Metadata Parser',
              status: 'idle' as const,
              duration: 800,
              details: [
                'Read bootloader version information',
                'Extract configuration parameters',
                'Parse security policy settings',
                'Validate metadata integrity'
              ]
            },
            {
              id: 'next-stage-prep',
              title: 'Next Stage Preparation',
              description: 'Prepare for next boot stage verification',
              component: 'Boot Manager',
              status: 'idle' as const,
              duration: 1200,
              details: [
                'Initialize hardware components',
                'Set up memory controllers',
                'Configure system clocks',
                'Prepare for OS/application loading'
              ]
            }
          ]
        };
      case 'processor-chip':
        return {
          title: 'Application Processor Internal Process',
          icon: <Cpu className="w-8 h-8 text-purple-400" />,
          steps: [
            {
              id: 'hw-init',
              title: 'Hardware Initialization',
              description: 'Initialize processor cores and system hardware',
              component: 'System Controller',
              status: 'idle' as const,
              duration: 1500,
              details: [
                'Initialize CPU cores and caches',
                'Configure system bus and interconnects',
                'Set up interrupt controllers',
                'Initialize basic peripherals'
              ]
            },
            {
              id: 'mmu-setup',
              title: 'Memory Management Setup',
              description: 'Configure Memory Management Unit for protection',
              component: 'MMU',
              status: 'idle' as const,
              duration: 1200,
              details: [
                'Configure virtual memory mapping',
                'Set up memory protection regions',
                'Enable address translation',
                'Configure cache policies'
              ]
            },
            {
              id: 'trustzone-init',
              title: 'TrustZone Initialization',
              description: 'Set up ARM TrustZone secure and non-secure worlds',
              component: 'TrustZone Controller',
              status: 'idle' as const,
              duration: 1000,
              details: [
                'Configure secure and non-secure memory regions',
                'Set up secure interrupt handling',
                'Initialize secure monitor',
                'Configure peripheral security attributes'
              ]
            },
            {
              id: 'os-verify',
              title: 'OS Signature Verification',
              description: 'Verify operating system or application signature',
              component: 'Crypto Verifier',
              status: 'idle' as const,
              duration: 2500,
              details: [
                'Load OS/application binary',
                'Extract and validate digital signature',
                'Compute cryptographic hash',
                'Verify signature using chain of trust'
              ]
            },
            {
              id: 'secure-boot',
              title: 'Secure Boot Completion',
              description: 'Complete secure boot and start OS execution',
              component: 'Boot Manager',
              status: 'idle' as const,
              duration: 1000,
              details: [
                'Mark OS as trusted and verified',
                'Set up secure execution environment',
                'Enable runtime security features',
                'Transfer control to OS kernel'
              ]
            }
          ]
        };
      default:
        return null;
    }
  };

  const chipData = getChipSteps();
  if (!chipData) return null;

  const getComponentIcon = (component: string) => {
    switch (component.toLowerCase()) {
      case 'reset controller':
        return <Zap className="w-5 h-5" />;
      case 'efuse controller':
        return <Lock className="w-5 h-5" />;
      case 'flash interface':
      case 'flash controller':
        return <HardDrive className="w-5 h-5" />;
      case 'crypto engine':
      case 'crypto verifier':
        return <Key className="w-5 h-5" />;
      case 'signature verifier':
      case 'signature parser':
        return <Shield className="w-5 h-5" />;
      case 'execution controller':
      case 'system controller':
      case 'boot manager':
        return <Cpu className="w-5 h-5" />;
      case 'mmu':
      case 'trustzone controller':
        return <Settings className="w-5 h-5" />;
      default:
        return <Cpu className="w-5 h-5" />;
    }
  };

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep) return 'complete';
    if (stepIndex === currentStep && isPlaying) return 'processing';
    if (stepIndex === currentStep) return 'active';
    return 'idle';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'text-green-400 bg-green-900/20 border-green-500';
      case 'processing':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-500 animate-pulse';
      case 'active':
        return 'text-cyan-400 bg-cyan-900/20 border-cyan-500';
      default:
        return 'text-gray-400 bg-gray-800/50 border-gray-600';
    }
  };

  const nextStep = () => {
    if (currentStep < chipData.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const play = () => setIsPlaying(true);
  const pause = () => setIsPlaying(false);

  // Auto-advance steps when playing
  useEffect(() => {
    if (!isPlaying) return;

    const currentStepData = chipData.steps[currentStep];
    if (!currentStepData) {
      setIsPlaying(false);
      return;
    }

    const timeout = setTimeout(() => {
      if (currentStep < chipData.steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        setIsPlaying(false);
      }
    }, currentStepData.duration / speed);

    return () => clearTimeout(timeout);
  }, [isPlaying, currentStep, speed, chipData.steps]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-600 max-w-6xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            {chipData.icon}
            <div>
              <h2 className="text-xl font-bold text-white">{chipData.title}</h2>
              <p className="text-sm text-gray-400">Step {currentStep + 1} of {chipData.steps.length}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex h-[calc(95vh-120px)]">
          {/* Step List */}
          <div className="w-1/3 border-r border-gray-700 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Process Steps</h3>
              <div className="space-y-3">
                {chipData.steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${getStatusColor(getStepStatus(index))}`}
                    onClick={() => setCurrentStep(index)}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex-shrink-0">
                        {getComponentIcon(step.component)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{step.title}</h4>
                        <p className="text-xs opacity-75">{step.component}</p>
                      </div>
                      <div className="flex-shrink-0">
                        {getStepStatus(index) === 'complete' && <CheckCircle className="w-4 h-4" />}
                        {getStepStatus(index) === 'processing' && <Clock className="w-4 h-4 animate-spin" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Current Step Details */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="max-w-4xl">
                <div className="mb-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`p-4 rounded-xl ${getStatusColor(getStepStatus(currentStep)).split(' ')[1]} ${getStatusColor(getStepStatus(currentStep)).split(' ')[2]}`}>
                      {getComponentIcon(chipData.steps[currentStep].component)}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{chipData.steps[currentStep].title}</h3>
                      <p className="text-gray-400">{chipData.steps[currentStep].component}</p>
                    </div>
                  </div>
                  <p className="text-gray-300 text-lg leading-relaxed mb-6">
                    {chipData.steps[currentStep].description}
                  </p>
                </div>

                {/* Detailed Process */}
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                  <h4 className="text-lg font-semibold text-white mb-4">Detailed Process</h4>
                  <div className="space-y-3">
                    {chipData.steps[currentStep].details.map((detail, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">{detail}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visual Representation */}
                <div className="mt-6 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl p-6 border border-gray-700">
                  <h4 className="text-lg font-semibold text-white mb-4">Component Visualization</h4>
                  <div className="flex items-center justify-center h-32">
                    <div className={`relative p-8 rounded-xl border-2 ${getStatusColor(getStepStatus(currentStep)).split(' ')[2]} ${getStatusColor(getStepStatus(currentStep)).split(' ')[1]}`}>
                      <div className="text-4xl mb-2 flex justify-center">
                        {getComponentIcon(chipData.steps[currentStep].component)}
                      </div>
                      <div className="text-center text-white font-medium">
                        {chipData.steps[currentStep].component}
                      </div>
                      
                      {/* Processing animation */}
                      {getStepStatus(currentStep) === 'processing' && (
                        <div className="absolute inset-0 rounded-xl overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent animate-pulse" />
                          {[...Array(6)].map((_, i) => (
                            <div
                              key={i}
                              className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-ping"
                              style={{
                                left: `${20 + i * 15}%`,
                                top: `${30 + (i % 2) * 40}%`,
                                animationDelay: `${i * 0.2}s`
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="border-t border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={previousStep}
                    disabled={currentStep === 0}
                    className="p-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={isPlaying ? pause : play}
                    className="p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors"
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  </button>
                  
                  <button
                    onClick={nextStep}
                    disabled={currentStep >= chipData.steps.length - 1}
                    className="p-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-400">
                    Speed: {speed}x
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={3}
                    step={0.5}
                    value={speed}
                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                    className="w-20 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChipStepVisualization;