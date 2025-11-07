'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

interface DetailedMetricsProps {
  oreCollected: Record<string, number>;
  oreProcessed: Record<string, number>;
  goldProduced: Record<string, number>;
  reprocessedOre: Record<string, number>;
  moneyPaidOut: Record<string, number>;
}

export function DetailedMetrics({ 
  oreCollected, 
  oreProcessed, 
  goldProduced, 
  reprocessedOre, 
  moneyPaidOut 
}: DetailedMetricsProps): React.JSX.Element {
  
  const MetricCard = ({ 
    title, 
    data, 
    unit, 
    color,
    isCurrency = false 
  }: { 
    title: string; 
    data: Record<string, number>; 
    unit: string; 
    color: string;
    isCurrency?: boolean;
  }) => {
    // Handle null, undefined, or non-object data
    const safeData = data && typeof data === 'object' ? data : {};
    const entries = Object.entries(safeData);
    const total = entries.reduce((sum, [_, value]) => sum + (typeof value === 'number' ? value : 0), 0);

    return (
      <Card 
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          '&:hover': {
            boxShadow: 2,
            borderColor: `${color}40`,
          },
          transition: 'all 0.3s ease',
        }}
      >
        <CardContent>
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight="medium">
                {title}
              </Typography>
              <Box 
                sx={{ 
                  bgcolor: color,
                  color: '#fff',
                  px: 2, 
                  py: 0.5, 
                  borderRadius: 1,
                  fontWeight: 'bold'
                }}
              >
                {isCurrency 
                  ? `USD/ZWG ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : `${total.toLocaleString()} ${unit}`
                }
              </Box>
            </Stack>

            <Divider />

            {entries.length > 0 ? (
              <Stack spacing={2}>
                {entries.map(([key, value]) => {
                  const percentage = total > 0 ? (value / total) * 100 : 0;
                  return (
                    <Box key={key}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          {key.replace(/([A-Z])/g, ' $1').trim() || 'Value'}
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {isCurrency 
                            ? `USD/ZWG ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                            : `${value.toLocaleString()} ${unit}`
                          }
                        </Typography>
                      </Stack>
                      <LinearProgress 
                        variant="determinate" 
                        value={percentage} 
                        sx={{ 
                          height: 6, 
                          borderRadius: 1,
                          bgcolor: `${color}15`,
                          '& .MuiLinearProgress-bar': {
                            bgcolor: color,
                            borderRadius: 1,
                          }
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                        {percentage.toFixed(1)}% of total
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
            ) : (
              <Typography color="text.secondary" variant="body2">
                No data available
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>
    );
  };

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <MetricCard
          title="Ore Collected"
          data={oreCollected}
          unit="kg"
          color="#2e7d32"
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <MetricCard
          title="Ore Processed"
          data={oreProcessed}
          unit="kg"
          color="#1565c0"
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <MetricCard
          title="Gold Produced"
          data={goldProduced}
          unit="kg"
          color="#f57c00"
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <MetricCard
          title="Reprocessed Ore"
          data={reprocessedOre}
          unit="kg"
          color="#6d4c41"
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <MetricCard
          title="Money Paid Out"
          data={moneyPaidOut}
          unit=""
          color="#6a1b9a"
          isCurrency={true}
        />
      </Grid>
    </Grid>
  );
}
