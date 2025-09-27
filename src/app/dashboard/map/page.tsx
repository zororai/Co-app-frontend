'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import dynamic from 'next/dynamic';

// Dynamically import LeafletMap to avoid SSR issues
const LeafletMap = dynamic(
  () => import('@/components/dashboard/boundarymap/LeafletMap'),
  { 
    ssr: false,
    loading: () => (
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%' 
        }}
      >
        <Typography>Loading map...</Typography>
      </Box>
    )
  }
);

const MapPage: React.FC = () => {
  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Page Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Boundary Map
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Draw shapes on the map to define boundaries and save their coordinates
        </Typography>
      </Box>
      
      {/* Map Container */}
      <Box sx={{ flex: 1, position: 'relative' }}>
        <LeafletMap />
      </Box>
    </Box>
  );
};

export default MapPage;