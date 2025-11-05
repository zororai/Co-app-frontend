'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { Icon } from '@phosphor-icons/react/dist/lib/types';
import { CheckCircleIcon } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import { PauseCircleIcon } from '@phosphor-icons/react/dist/ssr/PauseCircle';
import { ArrowClockwiseIcon } from '@phosphor-icons/react/dist/ssr/ArrowClockwise';
import type { ApexOptions } from 'apexcharts';

import { Chart } from '@/components/core/chart';
import { authClient } from '@/lib/auth/client';

const iconMapping = { Active: CheckCircleIcon, Suspended: PauseCircleIcon } as Record<string, Icon>;

interface ShaftStatusData {
  suspendedCount: number;
  approvedCount: number;
}

export interface TrafficProps {
  sx?: SxProps;
}

export function Traffic({ sx }: TrafficProps): React.JSX.Element {
  const theme = useTheme();
  const [chartSeries, setChartSeries] = React.useState<number[]>([]);
  const [labels, setLabels] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
  const chartOptions = useChartOptions(labels);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await authClient.fetchShaftStatusCounts();
      
      if (result.success && result.data) {
        const data: ShaftStatusData = result.data;
        
        // Calculate percentages
        const total = data.approvedCount + data.suspendedCount;
        if (total > 0) {
          const activePercentage = Math.round((data.approvedCount / total) * 100);
          const suspendedPercentage = Math.round((data.suspendedCount / total) * 100);
          
          setChartSeries([activePercentage, suspendedPercentage]);
          setLabels(['Active', 'Suspended']);
        } else {
          setChartSeries([0, 0]);
          setLabels(['Active', 'Suspended']);
        }
      } else {
        setError(result.error || 'Failed to fetch shaft status data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    fetchData();
  };

  return (
    <Card sx={sx}>
      <CardHeader 
        title="Shaft Status Overview"
        action={
          <Button
            color="inherit"
            onClick={handleRefresh}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} sx={{ color: 'inherit' }} /> : <ArrowClockwiseIcon fontSize="var(--icon-fontSize-md)" />}
            size="small"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        }
      />
      <CardContent>
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <CircularProgress sx={{ color: theme.palette.secondary.main }} />
          </Box>
        ) : (
          <Stack spacing={2}>
            <Chart height={300} options={chartOptions} series={chartSeries} type="donut" width="100%" />
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'center' }}>
              {chartSeries.map((item, index) => {
                const label = labels[index];
                const Icon = iconMapping[label];

                return (
                  <Stack key={label} spacing={1} sx={{ alignItems: 'center' }}>
                    {Icon ? <Icon fontSize="var(--icon-fontSize-lg)" /> : null}
                    <Typography variant="h6">{label}</Typography>
                    <Typography color="text.secondary" variant="subtitle2">
                      {item}%
                    </Typography>
                  </Stack>
                );
              })}
            </Stack>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

function useChartOptions(labels: string[]): ApexOptions {
  const theme = useTheme();

  return {
    chart: { background: 'transparent' },
    colors: [theme.palette.secondary.main, theme.palette.secondary.dark], // Dark navy theme colors
    dataLabels: { enabled: false },
    labels,
    legend: { show: false },
    plotOptions: { pie: { expandOnClick: false } },
    states: { active: { filter: { type: 'none' } }, hover: { filter: { type: 'none' } } },
    stroke: { width: 0 },
    theme: { mode: theme.palette.mode },
    tooltip: { fillSeriesColor: false },
  };
}
