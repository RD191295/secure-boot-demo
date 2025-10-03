import React from 'react';
import { X, Shield, Lock, Key, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface DetailPanelProps {
  blockId: string | null;
  onClose: () => void;
}

const DetailPanel: React.FC<DetailPanelProps> = ({ blockId, onClose }) => {
  if (!blockId) return null;

  const getBlockDetails = () => {
    switch (blockId) {
      case 'bootrom':
        return {
          title: 'Boot ROM - Root of Trust',
          icon: <Shield className="w-8 h-8 text-blue-400" />,
          status: 'Immutable & Secure',
          statusColor: 'text-blue-400',
          description: 'The Boot ROM is the hardware-based root of trust that forms the foundation of the secure boot process.',
          features: [
            'Burned into silicon during manufacturing',
            'Cannot be modified or updated',
            'Contains initial verification code',
            'Stores public key hash in eFuses/OTP',
            'First code to execute on power-on'
          ],
          technicalDetails: [
            'Cryptographic Algorithm: RSA-2048 or ECDSA P-256',
            'Hash Function: SHA-256',
            'Storage: One-Time Programmable (OTP) memory',
            'Verification: Digital signature validation',
            'Security Level: Hardware-anchored trust'
          ]
        };
      case 'bootloader':
        return {
          title: 'First-Stage Bootloader (FSBL)',
          icon: <Key className="w-8 h-8 text-yellow-400" />,
          status: 'Initially Untrusted',
          statusColor: 'text-yellow-400',
          description: 'The bootloader is stored in flash memory and must be cryptographically verified before execution.',
          features: [
            'Stored in external flash memory',
            'Digitally signed by manufacturer',
            'Verified by Boot ROM',
            'Initializes basic hardware',
            'Loads next boot stage'
          ],
          technicalDetails: [
            'Location: External SPI/QSPI Flash',
            'Size: Typically 32KB - 256KB',
            'Signature: Appended to binary',
            'Verification: Public key cryptography',
            'Chain: Extends trust to next stage'
          ]
        };
      case 'os':
        return {
          title: 'Operating System / Application',
          icon: <CheckCircle className="w-8 h-8 text-purple-400" />,
          status: 'Verified by Chain',
          statusColor: 'text-purple-400',
          description: 'The final application or operating system, verified through the established chain of trust.',
          features: [
            'Main application code',
            'Verified by bootloader',
            'Runtime protections enabled',
            'Memory management active',
            'Secure execution environment'
          ],
          technicalDetails: [
            'Protection: MMU + TrustZone',
            'Memory: Isolated secure regions',
            'Runtime: Continuous integrity checks',
            'Updates: Signed firmware updates',
            'Security: Hardware-backed attestation'
          ]
        };
      default:
        return null;
    }
  };

  const details = getBlockDetails();
  if (!details) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-600 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
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
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Overview</h3>
            <p className="text-gray-300 leading-relaxed">{details.description}</p>
          </div>

          {/* Key Features */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Key Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {details.features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-800/50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Details */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Technical Specifications</h3>
            <div className="space-y-2">
              {details.technicalDetails.map((detail, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0" />
                  <span className="text-gray-300 text-sm font-mono">{detail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Security Flow */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Security Verification Process</h3>
            <div className="space-y-3">
              {blockId === 'bootrom' && (
                <>
                  <div className="flex items-center space-x-3 p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
                    <Clock className="w-5 h-5 text-blue-400" />
                    <span className="text-gray-300 text-sm">1. Power-on reset triggers Boot ROM execution</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
                    <Key className="w-5 h-5 text-blue-400" />
                    <span className="text-gray-300 text-sm">2. Retrieve public key hash from hardware</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
                    <Shield className="w-5 h-5 text-blue-400" />
                    <span className="text-gray-300 text-sm">3. Load and verify next-stage bootloader</span>
                  </div>
                </>
              )}
              {blockId === 'bootloader' && (
                <>
                  <div className="flex items-center space-x-3 p-3 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                    <span className="text-gray-300 text-sm">1. Initially untrusted - requires verification</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
                    <Key className="w-5 h-5 text-yellow-400" />
                    <span className="text-gray-300 text-sm">2. Boot ROM verifies digital signature</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-green-900/20 rounded-lg border border-green-500/30">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300 text-sm">3. Once verified, becomes trusted and executes</span>
                  </div>
                </>
              )}
              {blockId === 'os' && (
                <>
                  <div className="flex items-center space-x-3 p-3 bg-purple-900/20 rounded-lg border border-purple-500/30">
                    <Shield className="w-5 h-5 text-purple-400" />
                    <span className="text-gray-300 text-sm">1. Verified by trusted bootloader</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-purple-900/20 rounded-lg border border-purple-500/30">
                    <Lock className="w-5 h-5 text-purple-400" />
                    <span className="text-gray-300 text-sm">2. Runtime protections activated</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-purple-900/20 rounded-lg border border-purple-500/30">
                    <CheckCircle className="w-5 h-5 text-purple-400" />
                    <span className="text-gray-300 text-sm">3. Secure execution environment established</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailPanel;