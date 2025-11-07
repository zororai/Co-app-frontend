'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

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
    color,
    subtitle 
  }: { 
    title: string; 
    value: number | string; 
    color: string;
    subtitle?: string;
  }) => (
    <Card 
      sx={{ 
        height: '100%',
        background: '#fff',
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
          <Typography variant="body2" color="text.secondary" fontWeight="medium">
            {title}
          </Typography>
          <Typography variant="h3" fontWeight="bold" sx={{ color: 'text.primary' }}>
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
          color="#2e7d32"
          subtitle={`${totalShafts} total shafts`}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Deactivated Shafts"
          value={data.deactivatedShafts}
          color="#c62828"
          subtitle={`${totalShafts} total shafts`}
        />
      </Grid>

      {/* Sections Statistics */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Active Sections"
          value={data.activeSections}
          color="#1565c0"
          subtitle={`${totalSections} total sections`}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Deactivated Sections"
          value={data.deactivatedSections}
          color="#e65100"
          subtitle={`${totalSections} total sections`}
        />
      </Grid>

      {/* Financial & Weight Statistics */}
      <Grid size={{ xs: 12, sm: 6 }}>
        <StatCard
          title="Total Money Paid Out"
          value={`USD/ZWG ${data.totalMoneyPaidOut.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          color="#6a1b9a"
          subtitle="Total payments made"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <StatCard
          title="Total Dump Weight"
          value={`${data.totalDumpWeight.toLocaleString()} kg`}
          color="#00838f"
          subtitle="Total weight processed"
        />
      </Grid>
    </Grid>
  );
}
