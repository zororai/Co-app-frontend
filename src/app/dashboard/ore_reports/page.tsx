"use client";
import * as React from 'react';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import dayjs from 'dayjs';
import { Printer as PrinterIcon } from '@phosphor-icons/react/dist/ssr/Printer';

import { GoldSalesLineChart } from '@/components/dashboard/ore_reports/gold-sales-line-chart';
import { Sales } from '@/components/dashboard/ore_reports/sales';

interface DashboardData {
  budget: { value: number; trend: string };
  customers: { total: number; trend: string };
  tasks: { progress: number };
  profit: { value: number; trend: string };
}

export default function Page(): React.JSX.Element {
  const theme = useTheme();
  const [isInitialLoading, setIsInitialLoading] = React.useState(true);
  const [dashboardData, setDashboardData] = React.useState<DashboardData | null>(null);

  // Function to fetch dashboard data
  const fetchDashboardData = React.useCallback(async () => {
    try {
      // Simulate dashboard data fetching - replace with actual API calls
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
      const mockData = {
        budget: { value: 24000, trend: 'up' },
        customers: { total: 1600, trend: 'up' },
        tasks: { progress: 75.5 },
        profit: { value: 15000, trend: 'down' }
      };
      setDashboardData(mockData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  // Render UI first, then fetch data with a small delay
  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchDashboardData();
    }, 100);
    return () => clearTimeout(timer);
  }, [fetchDashboardData]);

  if (isInitialLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 400 }}>
        <CircularProgress size={60} sx={{ color: theme.palette.secondary.main }} />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading Dashboard...</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Fetching latest data and metrics
        </Typography>
      </Stack>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Ore Reports</Typography>
        <Button
          variant="contained"
          startIcon={<PrinterIcon fontSize="var(--icon-fontSize-md)" />}
          onClick={handlePrint}
        >
          Print
        </Button>
      </Stack>
      
      <Grid container spacing={3}>
        <Grid
          size={{
            lg: 12,
            xs: 12,
          }}
        >
          <Sales sx={{ height: '100%' }} />
        </Grid>
      <Grid
        size={{
          lg: 12,
          md: 12,
          xs: 12,
        }}
      >
        <GoldSalesLineChart sx={{ height: '100%' }} />
      </Grid>
    </Grid>
    </Stack>
  );
}