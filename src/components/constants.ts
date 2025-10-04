export interface Module {
  id: string;
  name: string;
  type: string;
  position: { x: number; y: number; z: number };
  size: { width: number; height: number; depth: number };
  color: string;
  isActive: boolean;
  description: string;
}

export interface Chip3DEnvironmentProps {
  mode: 'normal' | 'tampered';
  showInternals: boolean;
  animationSpeed: number;
  currentStage: number;
}

export const MODULES: Module[] = [
  {
    id: 'pmu',
    name: 'PMU',
    type: 'pmu',
    position: { x: -300, y: -150, z: 0 },
    size: { width: 140, height: 100, depth: 20 },
    color: 'from-red-800 to-red-600',
    isActive: false,
    description: 'Power Management Unit'
  },
  {
    id: 'bootrom',
    name: 'Boot ROM',
    type: 'rom',
    position: { x: -300, y: 0, z: 0 },
    size: { width: 140, height: 120, depth: 20 },
    color: 'from-blue-800 to-blue-600',
    isActive: false,
    description: 'Boot ROM with secure code'
  },
  {
    id: 'otp',
    name: 'OTP/eFuse',
    type: 'otp',
    position: { x: -300, y: 150, z: 0 },
    size: { width: 140, height: 100, depth: 20 },
    color: 'from-yellow-800 to-yellow-600',
    isActive: false,
    description: 'One-Time Programmable Memory'
  },
  {
    id: 'crypto',
    name: 'Crypto Engine',
    type: 'crypto',
    position: { x: -100, y: 0, z: 0 },
    size: { width: 160, height: 140, depth: 20 },
    color: 'from-purple-800 to-purple-600',
    isActive: false,
    description: 'Cryptographic accelerator'
  },
  {
    id: 'flash',
    name: 'Flash Memory',
    type: 'flash',
    position: { x: 100, y: -100, z: 0 },
    size: { width: 140, height: 120, depth: 20 },
    color: 'from-green-800 to-green-600',
    isActive: false,
    description: 'External Flash storage'
  },
  {
    id: 'cpu',
    name: 'CPU Core',
    type: 'cpu',
    position: { x: 100, y: 100, z: 0 },
    size: { width: 160, height: 140, depth: 20 },
    color: 'from-cyan-800 to-cyan-600',
    isActive: false,
    description: 'Main processor'
  }
];

export const getModuleById = (id: string, modules: Module[]): Module | undefined => {
  return modules.find(m => m.id === id);
};

export const getBootStatus = (
  flags: Record<string, boolean>,
  mode: 'normal' | 'tampered',
  currentStage: number
) => {
  if (mode === 'tampered' && currentStage >= 5) {
    return {
      text: 'BOOT FAILED - TAMPERING DETECTED',
      color: 'bg-red-600'
    };
  }

  if (currentStage === 0) {
    return {
      text: 'System Powered Down',
      color: 'bg-gray-600'
    };
  }

  if (currentStage === 7 && mode === 'normal') {
    return {
      text: 'BOOT COMPLETE - SECURE',
      color: 'bg-green-600'
    };
  }

  return {
    text: `Boot Stage ${currentStage} - In Progress`,
    color: 'bg-blue-600'
  };
};
