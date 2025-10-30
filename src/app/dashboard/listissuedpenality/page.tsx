"use client";

import * as React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { PenaltyTable } from '@/components/dashboard/penalty/penalty-table';

export default function Page(): React.JSX.Element {
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Stack spacing={3}>
      <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
        <Typography variant="h4">List of Issued Penalties</Typography>
        <Typography variant="body2" color="text.secondary">
          View and manage all issued penalties and violations
        </Typography>
      </Stack>

      <PenaltyTable 
        key={refreshTrigger}
        onRefresh={handleRefresh}
      />
    </Stack>
  );
}
