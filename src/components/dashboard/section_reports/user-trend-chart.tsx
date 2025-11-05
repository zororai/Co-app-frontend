'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import { useTheme } from '@mui/material/styles';
import type { ApexOptions } from 'apexcharts';
import { Chart } from '@/components/core/chart';

export function UserTrendChart(): React.JSX.Element {
  const theme = useTheme();

  const chartOptions: ApexOptions = {
    chart: {
      background: 'transparent',
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: [theme.palette.primary.main],
    dataLabels: { enabled: false },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100],
      },
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 3,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    theme: { mode: theme.palette.mode },
    xaxis: {
      axisBorder: { show: false },
      axisTicks: { show: false },
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      labels: {
        style: { colors: theme.palette.text.secondary },
      },
    },
    yaxis: {
      labels: {
        style: { colors: theme.palette.text.secondary },
      },
    },
    tooltip: {
      theme: theme.palette.mode,
    },
  };

  const chartSeries = [
    {
      name: 'User Trend',
      data: [1200, 1350, 1280, 1480, 1620, 1750, 1850, 1920, 2050, 2180, 2320, 2450],
    },
  ];

  return (
    <Card>
      <CardHeader title="User Trend" />
      <CardContent>
        <Chart
          height={250}
          options={chartOptions}
          series={chartSeries}
          type="area"
          width="100%"
        />
      </CardContent>
    </Card>
  );
}
