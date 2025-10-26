'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

interface PageSkeletonProps {
  title?: string;
  showTabs?: boolean;
  showTable?: boolean;
}

export function PageSkeleton({ 
  title = "Loading...", 
  showTabs = true, 
  showTable = true 
}: PageSkeletonProps): React.JSX.Element {
  return (
    <Stack spacing={3}>
      {/* Header Section */}
      <Stack direction="row" spacing={3} sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">{title}</Typography>
          
          {showTabs && (
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <Skeleton variant="rectangular" width={80} height={36} />
              <Skeleton variant="rectangular" width={100} height={36} />
              <Skeleton variant="rectangular" width={80} height={36} />
              <Skeleton variant="rectangular" width={90} height={36} />
            </Stack>
          )}
          
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Skeleton variant="rectangular" width={100} height={36} />
            <Skeleton variant="rectangular" width={80} height={36} />
          </Stack>
        </Stack>
        
        {/* Top-right actions */}
        <Skeleton variant="rectangular" width={120} height={36} />
      </Stack>

      {/* Table Section */}
      {showTable && (
        <Box>
          {/* Table Header */}
          <Stack direction="row" spacing={2} sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Skeleton variant="text" width="15%" />
            <Skeleton variant="text" width="20%" />
            <Skeleton variant="text" width="15%" />
            <Skeleton variant="text" width="20%" />
            <Skeleton variant="text" width="15%" />
            <Skeleton variant="text" width="15%" />
          </Stack>
          
          {/* Table Rows */}
          {Array.from({ length: 5 }).map((_, index) => (
            <Stack 
              key={index} 
              direction="row" 
              spacing={2} 
              sx={{ mb: 1, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}
            >
              <Skeleton variant="text" width="15%" />
              <Skeleton variant="text" width="20%" />
              <Skeleton variant="text" width="15%" />
              <Skeleton variant="text" width="20%" />
              <Skeleton variant="text" width="15%" />
              <Skeleton variant="rectangular" width="15%" height={32} />
            </Stack>
          ))}
          
          {/* Pagination */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
            <Skeleton variant="text" width={150} />
            <Stack direction="row" spacing={1}>
              <Skeleton variant="rectangular" width={32} height={32} />
              <Skeleton variant="rectangular" width={32} height={32} />
              <Skeleton variant="rectangular" width={32} height={32} />
            </Stack>
          </Stack>
        </Box>
      )}
    </Stack>
  );
}
