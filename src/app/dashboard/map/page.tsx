'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';

// Dynamically import LeafletMap to avoid SSR issues
const DynamicLeafletMap = dynamic(
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
  const searchParams = useSearchParams();
  const sectionName = searchParams?.get('sectionName');
  

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Page Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Boundary Map{sectionName && ` - ${sectionName}`}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Draw shapes on the map to define boundaries and save their coordinates
          {sectionName && ` for ${sectionName}`}
        </Typography>
      </Box>
      
      {/* Map Container */}
      <Box sx={{ flex: 1, position: 'relative' }}>
        <DynamicLeafletMap sectionName={sectionName || undefined} />
      </Box>
    </Box>
  );
};

export default MapPage;