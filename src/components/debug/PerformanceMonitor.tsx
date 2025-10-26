'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

interface PerformanceMetrics {
  renderTime: number;
  authTime: number;
  dataFetchTime: number;
  totalTime: number;
}

export function PerformanceMonitor({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics | null>(null);
  const [showMetrics, setShowMetrics] = React.useState(false);
  const startTime = React.useRef<number>(Date.now());
  const renderTime = React.useRef<number>(0);

  React.useEffect(() => {
    renderTime.current = Date.now();
    
    // Monitor performance
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        console.log(`[Performance] ${entry.name}: ${entry.duration}ms`);
      });
    });
    
    observer.observe({ entryTypes: ['navigation', 'resource', 'measure'] });
    
    // Measure total time after component mounts
    const timer = setTimeout(() => {
      const totalTime = Date.now() - startTime.current;
      const authTime = renderTime.current - startTime.current;
      const dataFetchTime = totalTime - authTime;
      
      setMetrics({
        renderTime: authTime,
        authTime,
        dataFetchTime,
        totalTime
      });
    }, 2000);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  // Show metrics in development
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.key === 'p') {
          setShowMetrics(prev => !prev);
        }
      };
      
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, []);

  return (
    <>
      {children}
      
      {/* Performance Metrics Overlay (Ctrl+P to toggle) */}
      {showMetrics && metrics && process.env.NODE_ENV === 'development' && (
        <Box
          sx={{
            position: 'fixed',
            top: 16,
            right: 16,
            p: 2,
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            zIndex: 9999,
            minWidth: 250
          }}
        >
          <Typography variant="h6" gutterBottom>Performance Metrics</Typography>
          <Stack spacing={1}>
            <Chip 
              label={`Render: ${metrics.renderTime}ms`} 
              color={metrics.renderTime < 100 ? 'success' : 'warning'} 
              size="small" 
            />
            <Chip 
              label={`Auth: ${metrics.authTime}ms`} 
              color={metrics.authTime < 200 ? 'success' : 'error'} 
              size="small" 
            />
            <Chip 
              label={`Data Fetch: ${metrics.dataFetchTime}ms`} 
              color={metrics.dataFetchTime < 500 ? 'success' : 'warning'} 
              size="small" 
            />
            <Chip 
              label={`Total: ${metrics.totalTime}ms`} 
              color={metrics.totalTime < 1000 ? 'success' : 'error'} 
              size="small" 
            />
          </Stack>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Press Ctrl+P to toggle
          </Typography>
        </Box>
      )}
    </>
  );
}
