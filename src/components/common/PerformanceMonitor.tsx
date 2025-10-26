'use client';

import React from 'react';

interface PerformanceMonitorProps {
  children: React.ReactNode;
  name: string;
}

export function PerformanceMonitor({ children, name }: PerformanceMonitorProps): React.JSX.Element {
  const startTime = React.useRef<number>(Date.now());
  
  React.useEffect(() => {
    const renderTime = Date.now() - startTime.current;
    if (renderTime > 100) { // Only log slow renders
      console.warn(`Slow render detected in ${name}: ${renderTime}ms`);
    }
  });

  return <>{children}</>;
}

// Hook for measuring component performance
export function usePerformanceTimer(name: string) {
  const startTime = React.useRef<number>(Date.now());
  
  React.useEffect(() => {
    return () => {
      const totalTime = Date.now() - startTime.current;
      if (totalTime > 50) {
        console.log(`${name} total time: ${totalTime}ms`);
      }
    };
  }, [name]);
}
