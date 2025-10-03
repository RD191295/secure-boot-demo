import React from 'react';
import { X, Shield, Lock, Key, CheckCircle, AlertCircle, Clock, Cpu, HardDrive, Zap, Settings } from 'lucide-react';

interface ChipDetailPanelProps {
  chipId: string | null;
  onClose: () => void;
}

const ChipDetailPanel: React.FC<ChipDetailPanelProps> = ({ chipId, onClose }) => {
  if (!chipId) return null;

  const getChipDetails = () => {
    switch (chipId) {
      case 'bootrom-chip':
        return {
          title: 'Boot ROM Chip - Hardware Root of Trust',
          icon: <Shield className="w-8 h-8 text-blue-400" />,
          status: 'Immutable Silicon-Based Security',
          statusColor: 'text-blue-400',
          description: 'The Boot ROM chip contains immutable code and cryptographic keys burned into silicon during manufacturing. It serves as the hardware anchor for the entire secure boot chain.',
          internalComponents: [
            {
              name: 'eFuses/OTP Memory',
              icon: <HardDrive className="w-5 h-5 text-yellow-400" />,
              description: 'One-time programmable memory storing public key hashes and configuration',
              process: 'Burned during manufacturing, cannot be modified'
            },
            {
              name: 'Cryptographic Engine',
              icon: <Key className="w-5 h-5 text-cyan-400" />,
              description: 'Hardware accelerated RSA/ECDSA verification engine',
              process: 'Performs signature verification using stored public keys'
            },
            {
              name: 'Boot Code',
              icon: <Cpu className="w-5 h-5 text-green-400" />,
              description: 'Immutable first-stage boot code',
              process: 'Executes on power-on, initiates secure boot sequence'
            },
            {
              name: 'Hardware Anchor',
              icon: <Lock className="w-5 h-5 text-red-400" />,
              description: 'Physical security features and tamper detection',
              process: 'Provides hardware-based root of trust foundation'
            }
          ],
          technicalSpecs: [
            'Architecture: ARM Cortex-M0+ or similar',
            'Memory: 32KB ROM, 8KB SRAM',
            'Crypto: RSA-2048/ECDSA P-256',
            'Hash: SHA-256',
            'Security: Hardware tamper detection'
          ],
          bootProcess: [
            'Power-on reset triggers Boot ROM execution',
            'Initialize minimal hardware (clocks, basic I/O)',
            'Read public key hash from eFuses',
            'Load first-stage bootloader from flash',
            'Verify bootloader signature using stored public key',
            'Transfer control to verified bootloader'
          ]
        };
      case 'flash-chip':
        return {
          title: 'Flash Memory Chip - Bootloader Storage',
          icon: <HardDrive className="w-8 h-8 text-yellow-400" />,
          status: 'External Non-Volatile Storage',
          statusColor: 'text-yellow-400',
          description: 'External flash memory chip containing the first-stage bootloader and its digital signature. Initially untrusted until verified by the Boot ROM.',
          internalComponents: [
            {
              name: 'FSBL Code',
              icon: <Cpu className="w-5 h-5 text-blue-400" />,
              description: 'First-stage bootloader executable code',
              process: 'Loaded and verified by Boot ROM before execution'
            },
            {
              name: 'Digital Signature',
              icon: <Key className="w-5 h-5 text-purple-400" />,
              description: 'Cryptographic signature appended to bootloader',
              process: 'Generated using manufacturer private key, verified using public key'
            },
            {
              name: 'Hardware Init Code',
              icon: <Settings className="w-5 h-5 text-green-400" />,
              description: 'Code for initializing system hardware components',
              process: 'Executed after FSBL verification to setup system'
            },
            {
              name: 'Chain Extension',
              icon: <Shield className="w-5 h-5 text-cyan-400" />,
              description: 'Code to verify and load next boot stage',
              process: 'Extends chain of trust to operating system or application'
            }
          ],
          technicalSpecs: [
            'Type: SPI/QSPI NOR Flash',
            'Capacity: 16MB - 128MB',
            'Interface: Quad SPI (up to 133MHz)',
            'Sectors: 4KB erase blocks',
            'Endurance: 100K program/erase cycles'
          ],
          bootProcess: [
            'Boot ROM reads bootloader from flash memory',
            'Signature verification performed by Boot ROM',
            'If verified, bootloader gains execution control',
            'Initialize DDR memory, clocks, and peripherals',
            'Load and verify next-stage (OS/application)',
            'Establish secure execution environment'
          ]
        };
      case 'processor-chip':
        return {
          title: 'Application Processor - OS/Firmware Execution',
          icon: <Cpu className="w-8 h-8 text-purple-400" />,
          status: 'Verified Execution Environment',
          statusColor: 'text-purple-400',
          description: 'Main application processor running the operating system or firmware. Verified through the established chain of trust and protected by hardware security features.',
          internalComponents: [
            {
              name: 'OS Kernel',
              icon: <Cpu className="w-5 h-5 text-blue-400" />,
              description: 'Operating system kernel or main application',
              process: 'Verified by bootloader before execution'
            },
            {
              name: 'Memory Management Unit',
              icon: <Settings className="w-5 h-5 text-green-400" />,
              description: 'Hardware memory protection and virtual addressing',
              process: 'Isolates secure and non-secure memory regions'
            },
            {
              name: 'TrustZone',
              icon: <Shield className="w-5 h-5 text-red-400" />,
              description: 'ARM TrustZone security extension',
              process: 'Creates secure and non-secure worlds for execution'
            },
            {
              name: 'Secure Execution',
              icon: <Lock className="w-5 h-5 text-cyan-400" />,
              description: 'Protected execution environment',
              process: 'Runtime integrity checks and secure key storage'
            }
          ],
          technicalSpecs: [
            'Architecture: ARM Cortex-A series',
            'Cores: Quad-core 1.5GHz',
            'Cache: L1 32KB I/D, L2 1MB',
            'Security: TrustZone, Crypto accelerator',
            'Memory: DDR4 support up to 8GB'
          ],
          bootProcess: [
            'Bootloader verifies OS/application signature',
            'Enable Memory Management Unit (MMU)',
            'Configure TrustZone secure/non-secure worlds',
            'Load OS kernel into secure memory region',
            'Initialize runtime security protections',
            'Transfer control to verified operating system'
          ]
        };
      default:
        return null;
    }
  };

  const details = getChipDetails();
  if (!details) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-600 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            {details.icon}
            <div>
              <h2 className="text-xl font-bold text-white">{details.title}</h2>
              <p className={`text-sm ${details.statusColor}`}>{details.status}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Overview</h3>
            <p className="text-gray-300 leading-relaxed">{details.description}</p>
          </div>

          {/* Internal Components */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Internal Components</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {details.internalComponents.map((component, index) => (
                <div key={index} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="flex items-start space-x-3 mb-3">
                    {component.icon}
                    <div>
                      <h4 className="font-semibold text-white text-sm">{component.name}</h4>
                      <p className="text-gray-400 text-xs mt-1">{component.description}</p>
                    </div>
                  </div>
                  <div className="pl-8">
                    <div className="text-xs text-cyan-400 bg-cyan-900/20 px-2 py-1 rounded border border-cyan-500/30">
                      Process: {component.process}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Specifications */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Technical Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {details.technicalSpecs.map((spec, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0" />
                  <span className="text-gray-300 text-sm font-mono">{spec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Boot Process Flow */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Boot Process Flow</h3>
            <div className="space-y-3">
              {details.bootProcess.map((step, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-900/10 to-cyan-900/10 rounded-lg border border-blue-500/20">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full text-white text-sm font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-300 text-sm leading-relaxed">{step}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {index < details.bootProcess.length - 1 ? (
                      <Clock className="w-5 h-5 text-blue-400" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security Features */}
          <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-lg border border-green-500/30 p-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-green-400" />
              Security Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <Lock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-white font-medium">Cryptographic Verification</div>
                <div className="text-gray-400">RSA/ECDSA signature validation</div>
              </div>
              <div className="text-center">
                <Key className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <div className="text-white font-medium">Hardware Key Storage</div>
                <div className="text-gray-400">Immutable eFuse/OTP keys</div>
              </div>
              <div className="text-center">
                <Shield className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-white font-medium">Chain of Trust</div>
                <div className="text-gray-400">Sequential verification chain</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChipDetailPanel;