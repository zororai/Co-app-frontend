"use client";
import * as React from 'react';
import type { Metadata } from 'next';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';

import { config } from '@/config';
import { Budget } from '@/components/dashboard/overview/budget';
import { GoldSalesLineChart } from '@/components/dashboard/overview/gold-sales-line-chart';
import { LatestProducts } from '@/components/dashboard/overview/latest-products';
import { Sales } from '@/components/dashboard/overview/sales';
import { TasksProgress } from '@/components/dashboard/overview/tasks-progress';
import { TotalCustomers } from '@/components/dashboard/overview/total-customers';
import { TotalProfit } from '@/components/dashboard/overview/total-profit';
import { Traffic } from '@/components/dashboard/overview/traffic';

export const metadata = { title: `Overview | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  const [isInitialLoading, setIsInitialLoading] = React.useState(true);

  // Render UI first, then allow components to load their data
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (isInitialLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 400 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading Dashboard...</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Preparing your overview
        </Typography>
      </Stack>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid
        size={{
          lg: 3,
          sm: 6,
          xs: 12,
        }}
      >
        <Budget sx={{ height: '100%' }} />
      </Grid>
      <Grid
        size={{
          lg: 3,
          sm: 6,
          xs: 12,
        }}
      >
        <TotalCustomers sx={{ height: '100%' }} />
      </Grid>
      <Grid
        size={{
          lg: 3,
          sm: 6,
          xs: 12,
        }}
      >
        <TasksProgress sx={{ height: '100%' }} value={75.5} />
      </Grid>
      <Grid
        size={{
          lg: 3,
          sm: 6,
          xs: 12,
        }}
      >
        <TotalProfit sx={{ height: '100%' }} />
      </Grid>
      <Grid
        size={{
          lg: 8,
          xs: 12,
        }}
      >
        <Sales sx={{ height: '100%' }} />
      </Grid>
      <Grid
        size={{
          lg: 4,
          md: 6,
          xs: 12,
        }}
      >
        <Traffic sx={{ height: '100%' }} />
      </Grid>
      <Grid
        size={{
          lg: 4,
          md: 6,
          xs: 12,
        }}
      >
      
      </Grid>
      <Grid
        size={{
          lg: 8,
          md: 12,
          xs: 12,
        }}
      >
        <GoldSalesLineChart sx={{ height: '100%' }} />
      </Grid>
    </Grid>
  );
}