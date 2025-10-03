import { useState, useEffect, useCallback } from 'react';

export const use3DSecureBootSimulation = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [bootStatus, setBootStatus] = useState<'idle' | 'booting' | 'success' | 'failed'>('idle');

  const steps = [
    { name: 'Boot ROM Power-On & Initialization', duration: 2000 },
    { name: 'Bootloader Signature Verification', duration: 3000 },
    { name: 'Bootloader Hardware Initialization', duration: 2000 },
    { name: 'OS/Application Verification', duration: 3000 },
    { name: 'Secure OS Execution', duration: 2000 }
  ];

  const resetSimulation = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
    setBootStatus('idle');
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

    const timeout = setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        setIsPlaying(false);
        setBootStatus('success');
      }
    }, duration);

    return () => clearTimeout(timeout);
  }, [isPlaying, currentStep, speed, steps]);

  const getCurrentStage = () => {
    const currentStepData = steps[currentStep];
    return currentStepData ? currentStepData.name : 'Idle';
  };

  return {
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