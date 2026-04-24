import { useEffect, useState } from "react";

const playbackSpeeds = {
  slow: 1500,
  normal: 1000,
  fast: 500
};

function useTracePlayer() {
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState("normal");

  useEffect(() => {
    if (!isPlaying || steps.length === 0 || currentStep >= steps.length - 1) {
      if (currentStep >= steps.length - 1) {
        setIsPlaying(false);
      }

      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setCurrentStep((previousStep) =>
        Math.min(previousStep + 1, Math.max(steps.length - 1, 0))
      );
    }, playbackSpeeds[playbackSpeed]);

    return () => window.clearInterval(intervalId);
  }, [currentStep, isPlaying, playbackSpeed, steps.length]);

  function setTrace(traceSteps) {
    setSteps(traceSteps || []);
    setCurrentStep(0);
    setIsPlaying(false);
  }

  function goToPreviousStep() {
    setCurrentStep((previousStep) => Math.max(previousStep - 1, 0));
  }

  function goToNextStep() {
    setCurrentStep((previousStep) =>
      Math.min(previousStep + 1, Math.max(steps.length - 1, 0))
    );
  }

  function togglePlayback() {
    if (steps.length === 0) {
      return;
    }

    if (currentStep >= steps.length - 1) {
      setCurrentStep(0);
    }

    setIsPlaying((previousValue) => !previousValue);
  }

  function resetPlayback() {
    setIsPlaying(false);
    setCurrentStep(0);
  }

  function jumpToStep(stepIndex) {
    const safeIndex = Math.min(Math.max(stepIndex, 0), Math.max(steps.length - 1, 0));
    setCurrentStep(safeIndex);
  }

  return {
    steps,
    currentStep,
    activeStep: steps[currentStep],
    isPlaying,
    playbackSpeed,
    setPlaybackSpeed,
    setTrace,
    goToPreviousStep,
    goToNextStep,
    togglePlayback,
    resetPlayback,
    jumpToStep
  };
}

export default useTracePlayer;
