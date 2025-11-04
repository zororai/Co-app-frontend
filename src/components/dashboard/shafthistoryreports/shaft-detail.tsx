'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';

interface ShaftDetailProps {
  data: any;
}

export function ShaftDetail({ data }: ShaftDetailProps): React.JSX.Element {
  if (!data) {
    return (
      <Card>
        <CardContent>
          <Typography color="text.secondary">
            No shaft data found
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const InfoItem = ({ label, value }: { label: string; value: any }) => (
    <Stack spacing={0.5}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2">
        {value || 'N/A'}
      </Typography>
    </Stack>
  );

  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          <div>
            <Typography variant="h5">Shaft Details</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Shaft Number: {data.shaftNumbers}
            </Typography>
          </div>

          <Divider />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <InfoItem label="Section Name" value={data.sectionName} />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <InfoItem label="Status" value={data.status} />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Operation Status
                </Typography>
                <Chip
                  label={data.operationStatus ? 'Active' : 'Inactive'}
                  color={data.operationStatus ? 'success' : 'default'}
                  size="small"
                />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <InfoItem label="Start Contract Date" value={data.startContractDate} />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <InfoItem label="End Contract Date" value={data.endContractDate} />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <InfoItem label="Registration Fee" value={`R ${data.regFee?.toLocaleString() || 0}`} />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <InfoItem label="Medical Fee" value={`R ${data.medicalFee?.toLocaleString() || 0}`} />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <InfoItem label="Latitude" value={data.latitude} />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <InfoItem label="Longitude" value={data.longitude} />
            </Grid>
          </Grid>
        </Stack>
      </CardContent>
    </Card>
  );
}
