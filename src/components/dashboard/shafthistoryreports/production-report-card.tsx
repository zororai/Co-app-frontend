'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';

interface ProductionReportData {
  shaftNumbers: string;
  period: string;
  year: number;
  month?: number;
  weekOfYear?: number;
  totalWeight: number;
  totalNewWeight: number;
  totalGoldSalesWeight: number;
  totalGoldSalesPrice: number;
  recordCount: number;
}

interface ProductionReportCardProps {
  data: ProductionReportData | null;
}

export function ProductionReportCard({ data }: ProductionReportCardProps): React.JSX.Element {
  if (!data) {
    return (
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography color="text.secondary">
            No production report data available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const InfoItem = ({ label, value, unit = '' }: { label: string; value: any; unit?: string }) => (
    <Stack spacing={0.5}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight="medium">
        {value !== undefined && value !== null ? `${value}${unit}` : 'N/A'}
      </Typography>
    </Stack>
  );

  const formatPeriodDisplay = () => {
    if (data.period === 'week') {
      return `Week ${data.weekOfYear}, ${data.year}`;
    } else if (data.period === 'month') {
      return `Month ${data.month}, ${data.year}`;
    } else {
      return `Year ${data.year}`;
    }
  };

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Stack spacing={3}>
          <div>
            <Typography variant="h6">Production Report</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {formatPeriodDisplay()}
            </Typography>
          </div>

          <Divider />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <InfoItem label="Period Type" value={data.period.toUpperCase()} />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <InfoItem label="Record Count" value={data.recordCount} />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <InfoItem label="Total Weight" value={data.totalWeight.toLocaleString()} unit=" kg" />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <InfoItem label="Total New Weight" value={data.totalNewWeight.toLocaleString()} unit=" kg" />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <InfoItem label="Gold Sales Weight" value={data.totalGoldSalesWeight.toLocaleString()} unit=" kg" />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <InfoItem 
                label="Gold Sales Price" 
                value={`R ${data.totalGoldSalesPrice.toLocaleString()}`} 
              />
            </Grid>
          </Grid>

          <Divider />

          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Summary
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Chip 
                label={`${data.recordCount} Records`} 
                size="small" 
                color="primary"
                variant="outlined"
              />
              <Chip 
                label={`${data.totalWeight.toLocaleString()} kg Total`} 
                size="small" 
                color="success"
                variant="outlined"
              />
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
