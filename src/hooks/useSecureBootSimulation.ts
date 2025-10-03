import { useState, useEffect, useCallback } from 'react';

interface BootStep {
  id: number;
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
  duration: number;
}

export const useSecureBootSimulation = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [bootStatus, setBootStatus] = useState<'idle' | 'booting' | 'success' | 'failed'>('idle');
  
  const initialSteps: BootStep[] = [
    {
      id: 1,
      title: "Root of Trust (RoT) Initialization",
      description: "Hardware anchor establishes the foundation of trust. Secure, immutable public keys or hashes are embedded in hardware (eFuses/OTP memory). Private keys are generated and stored in HSM.",
      detailedSteps: [
        "Hardware Security Module (HSM) generates cryptographic key pairs",
        "Public key hash is burned into eFuses or OTP memory (immutable)",
        "Private keys are securely stored in HSM for firmware signing",
        "Hardware anchor becomes the root of trust for entire boot chain"
      ],
      verifier: { type: 'hardware', name: 'Hardware Anchor', status: 'idle' },
      target: { type: 'publickey', name: 'Public Key', status: 'idle' },
      additionalComponents: [
        { type: 'hsm', name: 'HSM', status: 'idle' },
        { type: 'privatekey', name: 'Private Key', status: 'idle' },
        { type: 'hash', name: 'Key Hash', status: 'idle' }
      ],
      duration: 3000
    },
    {
      id: 2,
      title: "Boot ROM Execution & FSBL Verification",
      description: "Upon power-on, immutable Boot ROM code executes. It verifies the digital signature of the First-Stage Bootloader (FSBL) using the pre-programmed public key from hardware.",
      detailedSteps: [
        "System powers on and Boot ROM code begins execution",
        "Boot ROM retrieves public key hash from hardware anchor",
        "FSBL image is loaded and its digital signature is extracted",
        "Cryptographic verification using RSA/ECDSA algorithms",
        "Hash comparison ensures FSBL integrity and authenticity"
      ],
      verifier: { type: 'bootrom', name: 'Boot ROM', status: 'idle' },
      target: { type: 'bootloader1', name: '1st Stage Bootloader', status: 'idle' },
      signature: { status: 'idle' },
      additionalComponents: [
        { type: 'publickey', name: 'Public Key', status: 'idle' },
        { type: 'hash', name: 'Hash Verify', status: 'idle' }
      ],
      duration: 3500
    },
    {
      id: 3,
      title: "FSBL Hardware Initialization & Next-Stage Verification",
      description: "Once FSBL is authenticated, it initializes basic hardware components (clocks, memory controllers). Then loads and verifies the second-stage bootloader signature.",
      detailedSteps: [
        "FSBL initializes critical hardware: clocks, RAM, memory controllers",
        "Basic system peripherals are configured for operation",
        "Second-stage bootloader image is loaded from storage",
        "FSBL verifies second-stage bootloader using its embedded public key",
        "Chain of trust is extended to the next boot stage"
      ],
      verifier: { type: 'bootloader1', name: '1st Stage Bootloader', status: 'idle' },
      target: { type: 'bootloader2', name: '2nd Stage Bootloader', status: 'idle' },
      signature: { status: 'idle' },
      additionalComponents: [
        { type: 'hardware', name: 'Hardware Init', status: 'idle' },
        { type: 'publickey', name: 'FSBL Pub Key', status: 'idle' }
      ],
      duration: 3000
    },
    {
      id: 4,
      title: "Operating System / Application Verification",
      description: "Sequential validation continues as each boot stage verifies the next component. The OS kernel and application firmware are verified using the established chain of trust.",
      detailedSteps: [
        "Second-stage bootloader loads OS kernel or application firmware",
        "Digital signature verification using chain of trust",
        "Memory Management Unit (MMU) is configured for protection",
        "ARM TrustZone or similar security features are enabled",
        "Secure execution environment is established for runtime protection"
      ],
      verifier: { type: 'bootloader2', name: '2nd Stage Bootloader', status: 'idle' },
      target: { type: 'firmware', name: 'Application Firmware', status: 'idle' },
      signature: { status: 'idle' },
      additionalComponents: [
        { type: 'mmu', name: 'MMU', status: 'idle' },
        { type: 'trustzone', name: 'TrustZone', status: 'idle' }
      ],
      duration: 4000
    }
  ];

  const [steps, setSteps] = useState<BootStep[]>(initialSteps);

  const resetSimulation = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
    setBootStatus('idle');
    setSteps(initialSteps);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, steps.length]);

  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const play = useCallback(() => {
    setIsPlaying(true);
    if (currentStep === 0) {
      setBootStatus('booting');
    }
  }, [currentStep]);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const stop = useCallback(() => {
    setIsPlaying(false);
    setBootStatus('idle');
  }, []);

  // Animation logic
  useEffect(() => {
    if (!isPlaying) return;

    const currentStepData = steps[currentStep];
    if (!currentStepData) {
      setIsPlaying(false);
      setBootStatus('success');
      return;
    }

    const duration = currentStepData.duration / speed;

    // Start verification animation
    const startTimeout = setTimeout(() => {
      setSteps(prev => prev.map((step, index) => {
        if (index === currentStep) {
          return {
            ...step,
            verifier: { ...step.verifier, status: 'verifying' },
            target: { ...step.target, status: 'verifying' },
            signature: step.signature ? { status: 'verifying' } : undefined
          };
        }
        return step;
      }));
    }, 100);

    // Complete verification
    const completeTimeout = setTimeout(() => {
      setSteps(prev => prev.map((step, index) => {
        if (index === currentStep) {
          return {
            ...step,
            verifier: { ...step.verifier, status: 'verified' },
            target: { ...step.target, status: 'verified' },
            signature: step.signature ? { status: 'verified' } : undefined
          };
        }
        return step;
      }));

      // Move to next step
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        setIsPlaying(false);
        setBootStatus('success');
      }
    }, duration);

    return () => {
      clearTimeout(startTimeout);
      clearTimeout(completeTimeout);
    };
  }, [isPlaying, currentStep, speed, steps]);

  const getCurrentStage = () => {
    const currentStepData = steps[currentStep];
    return currentStepData ? currentStepData.title : 'Idle';
  };

  return {
    steps,
    currentStep,
    isPlaying,
    speed,
    bootStatus,
    currentStage: getCurrentStage(),
    totalSteps: steps.length,
    play,
    pause,
    stop,
    nextStep,
    previousStep,
    resetSimulation,
    setSpeed
  };
};