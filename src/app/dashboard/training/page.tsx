"use client";

import * as React from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';

import { TrainingTable, type Training } from '@/components/dashboard/training/training-table';
import { TrainingDialog } from '@/components/dashboard/training/training-dialog';
import { authClient } from '@/lib/auth/client';

export default function Page(): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
  const [trainings, setTrainings] = React.useState<Training[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Helper function to convert API date array to string
  const convertDateArray = (dateArray: number[]): string => {
    if (!Array.isArray(dateArray) || dateArray.length < 3) {
      return new Date().toISOString().split('T')[0];
    }
    // dateArray format: [year, month, day, hour?, minute?, second?, nanosecond?]
    const [year, month, day] = dateArray;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const fetchTrainings = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await authClient.fetchTrainings();
      
      if (result.success && result.data) {
        // Transform API data to match table structure
        const transformedTrainings: Training[] = result.data
          .filter((item: any) => !item.deleted) // Filter out deleted items
          .map((item: any) => ({
            id: item.id || '',
            trainingType: item.trainingType || '',
            trainerName: item.trainerName || '',
            scheduleDate: convertDateArray(item.scheduleDate),
            location: item.location || '',
            materials: Array.isArray(item.materials) ? item.materials : [],
            safetyProtocols: Array.isArray(item.safetyProtocols) ? item.safetyProtocols : [],
            trainees: Array.isArray(item.trainees) ? item.trainees.map((t: any) => t.name || '') : [],
            status: item.status || 'Scheduled',
            createdAt: convertDateArray(item.createdAt)
          }));
        
        setTrainings(transformedTrainings);
      } else {
        console.error('Failed to fetch trainings:', result.error);
        setTrainings([]);
      }
    } catch (error) {
      console.error('Error fetching trainings:', error);
      setTrainings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchTrainings();
  }, [fetchTrainings]);

  const handleExport = () => {
    const headers = [
      'Training Type', 'Trainer Name', 'Schedule Date', 'Location', 'Status'
    ];
    
    const rows = trainings.map((training) => [
      training.trainingType || '',
      training.trainerName || '',
      training.scheduleDate || '',
      training.location || '',
      training.status || ''
    ]);
    
    const csvContent = [headers, ...rows]
      .map(r => r.map(String).map(x => `"${x.replaceAll('"', '""')}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trainings-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.append(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleTrainingCreated = (newTraining: Omit<Training, 'id' | 'createdAt'>) => {
    // Refresh the data from API after successful creation
    fetchTrainings();
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Safety Training</Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Button 
              color="inherit" 
              startIcon={<DownloadIcon fontSize="var(--icon-fontSize-md)" />} 
              onClick={handleExport}
            >
              Export
            </Button>
          </Stack>
        </Stack>
        <div>
          <Button 
            startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} 
            variant="contained" 
            onClick={() => setOpen(true)}
            sx={{ 
              bgcolor: 'rgb(5, 5, 68)',
              '&:hover': { bgcolor: 'rgba(5, 5, 68, 0.9)' }
            }}
          >
            Create Training
          </Button>
        </div>
      </Stack>

      <TrainingTable
        count={trainings.length}
        rows={loading ? [] : trainings}
        onRefresh={fetchTrainings}
      />
      
      {loading && trainings.length === 0 && (
        <Stack alignItems="center" sx={{ py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Loading trainings...
          </Typography>
        </Stack>
      )}

      <TrainingDialog 
        open={open} 
        onClose={() => setOpen(false)} 
        onSuccess={handleTrainingCreated}
      />
    </Stack>
  );
}
