import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook to manage camera lifecycle for proctoring.
 * Ensures camera starts on demand and stops on unmount or manual trigger.
 */
export const useCamera = () => {
  const streamRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState(null);

  const startCamera = useCallback(async () => {
    try {
      // Check if already active
      if (streamRef.current) return streamRef.current;

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setCameraActive(true);
      setError(null);
      return stream;
    } catch (err) {
      console.error("Camera access error:", err);
      setError(err);
      setCameraActive(false);
      throw err;
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
      setCameraActive(false);
    }
  }, []);

  useEffect(() => {
    // Cleanup on unmount (essential for navigating away)
    return () => stopCamera();
  }, [stopCamera]);

  return { 
    streamRef, 
    cameraActive, 
    error, 
    startCamera, 
    stopCamera 
  };
};
