'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import { alpha, useTheme } from '@mui/material/styles';
import type { SxProps } from '@mui/material/styles';
import { ArrowClockwiseIcon } from '@phosphor-icons/react/dist/ssr/ArrowClockwise';
import { ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import type { ApexOptions } from 'apexcharts';

import { Chart } from '@/components/core/chart';
import { authClient } from '@/lib/auth/client';

interface MonthlyTotal {
  year: number;
  month: number;
  totalWeight: number;
  totalNewWeight: number;
}

export interface SalesProps {
  sx?: SxProps;
}

export function Sales({ sx }: SalesProps): React.JSX.Element {
  const [chartSeries, setChartSeries] = React.useState<{ name: string; data: number[] }[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [currentYear] = React.useState(new Date().getFullYear());
  
  const chartOptions = useChartOptions();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await authClient.fetchMonthlyOreTotals(currentYear);
      
      if (result.success && result.data) {
        const monthlyData: MonthlyTotal[] = result.data;
        
        // Convert weights from grams/kg to tonnes (divide by 1000000 for grams or 1000 for kg)
        // Assuming the API returns weights in kg, so divide by 1000 to get tonnes
        const totalWeightData = monthlyData.map(item => Math.round(item.totalWeight / 1000 * 100) / 100);
        const totalNewWeightData = monthlyData.map(item => Math.round(item.totalNewWeight / 1000 * 100) / 100);
        
        setChartSeries([
          { name: 'Total Weight (tonnes)', data: totalWeightData },
          { name: 'Total New Weight (tonnes)', data: totalNewWeightData }
        ]);
      } else {
        setError(result.error || 'Failed to fetch ore transport data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [currentYear]);

  const handleRefresh = () => {
    fetchData();
  };

  return (
    <Card sx={sx}>
      <CardHeader
        action={
          <Button
            color="inherit"
            onClick={handleRefresh}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <ArrowClockwiseIcon fontSize="var(--icon-fontSize-md)" />}
            size="small"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        }
        title={`Ore Transport Monthly Totals - ${currentYear}`}
      />
      <CardContent>
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 350 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Chart height={350} options={chartOptions} series={chartSeries} type="bar" width="100%" />
        )}
      </CardContent>
      <Divider />
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button color="inherit" endIcon={<ArrowRightIcon fontSize="var(--icon-fontSize-md)" />} size="small">
          Overview
        </Button>
      </CardActions>
    </Card>
  );
}

function useChartOptions(): ApexOptions {
  const theme = useTheme();

  return {
    chart: { background: 'transparent', stacked: false, toolbar: { show: false } },
    colors: [theme.palette.primary.main, alpha(theme.palette.primary.main, 0.25)],
    dataLabels: { enabled: false },
    fill: { opacity: 1, type: 'solid' },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 2,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    plotOptions: { bar: { columnWidth: '40px' } },
    stroke: { colors: ['transparent'], show: true, width: 2 },
    theme: { mode: theme.palette.mode },
    xaxis: {
      axisBorder: { color: theme.palette.divider, show: true },
      axisTicks: { color: theme.palette.divider, show: true },
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      labels: { offsetY: 5, style: { colors: theme.palette.text.secondary } },
    },
    yaxis: {
      title: {
        text: 'Weight (tonnes)',
        style: { color: theme.palette.text.secondary },
      },
      labels: {
        formatter: (value) => `${value}t`,
        offsetX: -10,
        style: { colors: theme.palette.text.secondary },
      },
    },
    legend: { 
      show: true,
      position: 'top',
      horizontalAlign: 'right',
      labels: {
        colors: theme.palette.text.primary,
      },
    },
    tooltip: {
      y: {
        formatter: (value) => `${value} tonnes`,
      },
    },
  };
}
