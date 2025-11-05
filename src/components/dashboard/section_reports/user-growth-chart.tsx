'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import { useTheme } from '@mui/material/styles';
import type { ApexOptions } from 'apexcharts';
import { Chart } from '@/components/core/chart';

export function UserGrowthChart(): React.JSX.Element {
  const theme = useTheme();

  const chartOptions: ApexOptions = {
    chart: {
      background: 'transparent',
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: [theme.palette.info.main],
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
      name: 'User Growth',
      data: [50, 80, 95, 130, 160, 185, 210, 240, 280, 320, 365, 420],
    },
  ];

  return (
    <Card>
      <CardHeader title="User Growth" />
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
