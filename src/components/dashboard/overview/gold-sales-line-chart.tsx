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

interface MonthlyGoldSales {
  year: number;
  month: number;
  totalWeight: number;
  totalPrice: number;
}

export interface GoldSalesLineChartProps {
  sx?: SxProps;
}

export function GoldSalesLineChart({ sx }: GoldSalesLineChartProps): React.JSX.Element {
  const [chartSeries, setChartSeries] = React.useState<{ name: string; data: number[] }[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [currentYear] = React.useState(new Date().getFullYear());
  
  const chartOptions = useChartOptions();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await authClient.fetchMonthlyGoldSales(currentYear);
      
      if (result.success && result.data) {
        const monthlyData: MonthlyGoldSales[] = result.data;
        
        // Convert weight from grams to kg (assuming API returns in grams)
        // If API already returns in kg, remove the division by 1000
        const goldWeightData = monthlyData.map(item => Math.round(item.totalWeight * 100) / 100);
        const goldPriceData = monthlyData.map(item => Math.round(item.totalPrice * 100) / 100);
        
        setChartSeries([
          { name: 'Gold Weight (kg)', data: goldWeightData },
          { name: 'Gold Price ($)', data: goldPriceData }
        ]);
      } else {
        setError(result.error || 'Failed to fetch gold sales data');
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
        title={`Monthly Gold Sales - ${currentYear}`}
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
          <Chart height={350} options={chartOptions} series={chartSeries} type="line" width="100%" />
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
    chart: { 
      background: 'transparent', 
      toolbar: { show: false },
      zoom: { enabled: false },
      width: '100%'
    },
    colors: ['#FFD700', '#4CAF50'], // Gold color for weight, Green for price
    dataLabels: { enabled: false },
    fill: { 
      type: 'gradient',
      gradient: {
        shade: 'dark',
        gradientToColors: ['rgba(255, 215, 0, 0.4)', 'rgba(76, 175, 80, 0.4)'], // Gold and Green with transparency
        shadeIntensity: 1,
        type: 'vertical',
        opacityFrom: 0.8,
        opacityTo: 0.1,
        stops: [0, 100, 100, 100]
      }
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 2,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    stroke: { 
      curve: 'smooth',
      width: 3
    },
    theme: { mode: theme.palette.mode },
    xaxis: {
      axisBorder: { color: theme.palette.divider, show: true },
      axisTicks: { color: theme.palette.divider, show: true },
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      labels: { 
        offsetY: 5, 
        style: { colors: theme.palette.text.secondary } 
      },
    },
    yaxis: [
      {
        title: {
          text: 'Gold Weight (kg)',
          style: { color: theme.palette.text.secondary },
        },
        labels: {
          formatter: (value) => `${value} kg`,
          offsetX: -10,
          style: { colors: theme.palette.text.secondary },
        },
      },
      {
        opposite: true,
        title: {
          text: 'Gold Price ($)',
          style: { color: theme.palette.text.secondary },
        },
        labels: {
          formatter: (value) => `$${value}`,
          offsetX: 10,
          style: { colors: theme.palette.text.secondary },
        },
      }
    ],
    legend: { 
      show: true,
      position: 'top',
      horizontalAlign: 'right',
      labels: {
        colors: theme.palette.text.primary,
      },
    },
    tooltip: {
      y: [
        {
          formatter: (value) => `${value} kg`,
        },
        {
          formatter: (value) => `$${value}`,
        }
      ],
    },
    markers: {
      size: 6,
      colors: ['#FFD700', '#4CAF50'], // Gold and Green markers
      strokeColors: theme.palette.background.paper,
      strokeWidth: 2,
      hover: {
        size: 8,
      }
    }
  };
}
