'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

interface MineLevelStatsProps {
  data: {
    activeShafts: number;
    deactivatedShafts: number;
    activeSections: number;
    deactivatedSections: number;
    totalMoneyPaidOut: number;
    totalDumpWeight: number;
  };
}

export function MineLevelStats({ data }: MineLevelStatsProps): React.JSX.Element {
  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color,
    subtitle 
  }: { 
    title: string; 
    value: number | string; 
    icon: React.ReactNode; 
    color: string;
    subtitle?: string;
  }) => (
    <Card 
      sx={{ 
        height: '100%',
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        border: `1px solid ${color}30`,
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Typography variant="body2" color="text.secondary" fontWeight="medium">
              {title}
            </Typography>
            <Box sx={{ color, opacity: 0.8 }}>
              {icon}
            </Box>
          </Stack>
          <Typography variant="h3" fontWeight="bold" sx={{ color }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );

  const totalShafts = data.activeShafts + data.deactivatedShafts;
  const totalSections = data.activeSections + data.deactivatedSections;

  return (
    <Grid container spacing={3}>
      {/* Shafts Statistics */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Active Shafts"
          value={data.activeShafts}
          icon={<CheckCircleIcon fontSize="large" />}
          color="#4caf50"
          subtitle={`${totalShafts} total shafts`}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Deactivated Shafts"
          value={data.deactivatedShafts}
          icon={<CancelIcon fontSize="large" />}
          color="#f44336"
          subtitle={`${totalShafts} total shafts`}
        />
      </Grid>

      {/* Sections Statistics */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Active Sections"
          value={data.activeSections}
          icon={<CheckCircleIcon fontSize="large" />}
          color="#2196f3"
          subtitle={`${totalSections} total sections`}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Deactivated Sections"
          value={data.deactivatedSections}
          icon={<CancelIcon fontSize="large" />}
          color="#ff9800"
          subtitle={`${totalSections} total sections`}
        />
      </Grid>

      {/* Financial & Weight Statistics */}
      <Grid size={{ xs: 12, sm: 6 }}>
        <StatCard
          title="Total Money Paid Out"
          value={`USD/ZWG ${data.totalMoneyPaidOut.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<MonetizationOnIcon fontSize="large" />}
          color="#9c27b0"
          subtitle="Total payments made"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <StatCard
          title="Total Dump Weight"
          value={`${data.totalDumpWeight.toLocaleString()} kg`}
          icon={<TrendingUpIcon fontSize="large" />}
          color="#00bcd4"
          subtitle="Total weight processed"
        />
      </Grid>
    </Grid>
  );
}
