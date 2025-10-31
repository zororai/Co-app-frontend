'use client';

import * as React from 'react';
import type { Metadata } from 'next';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';

import { config } from '@/config';
import { ShaftInspectionTable } from '@/components/dashboard/shaftinspection/shaft-inspection-table';
import { ShaftInspectionDialog } from '@/components/dashboard/shaftinspection/shaft-inspection-dialog';

export default function Page(): React.JSX.Element {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Shaft Inspection</Typography>
          <Typography color="text.secondary" variant="body1">
            Comprehensive Shaft Assessment Form
          </Typography>
        </Stack>
        <div>
          <Button
            startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
            variant="contained"
            onClick={handleOpenDialog}
            sx={{
              bgcolor: 'rgb(5, 5, 68)',
              '&:hover': { bgcolor: 'rgba(5, 5, 68, 0.9)' },
            }}
          >
            Shaft Inspection
          </Button>
        </div>
      </Stack>
      
      <ShaftInspectionTable key={refreshTrigger} />
      
      <ShaftInspectionDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onRefresh={handleRefresh}
      />
    </Stack>
  );
}
