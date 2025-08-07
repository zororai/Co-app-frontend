import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ClockIcon } from '@phosphor-icons/react/dist/ssr/Clock';
import { DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import dayjs from 'dayjs';

export interface Integration {
  id: string;
  title: string;
  description: string;
  logo: string;
  installs: number;
  updatedAt: Date;
  // Shaft assignment data fields
  sectionName?: string;
  shaftNumbers?: string;
  medicalFee?: string;
  regFee?: string;
  startContractDate?: string;
  endContractDate?: string;
  status?: string;
  reason?: string | null;
  createdAt?: string;
}

export interface IntegrationCardProps {
  integration: Integration;
}

export function IntegrationCard({ integration }: IntegrationCardProps): React.JSX.Element {
  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Divider />
      <Stack spacing={1}>
            <Typography align="center" variant="h5">
              {integration.sectionName}
            </Typography>
            <Typography align="center" variant="body1">
              {integration.shaftNumbers}
            </Typography>
            {integration.sectionName && (
              <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Shaft Assignment Details</Typography>
                  <Typography variant="body2">Section: {integration.sectionName}</Typography>
                <Typography variant="body2">Shaft Numbers: {integration.shaftNumbers}</Typography>
                <Typography variant="body2">Medical Fee: {integration.medicalFee}</Typography>
                <Typography variant="body2">Registration Fee: {integration.regFee}</Typography>
                <Typography variant="body2">Contract Start: {integration.startContractDate}</Typography>
                <Typography variant="body2">Contract End: {integration.endContractDate}</Typography>
                <Typography variant="body2">Status: {integration.status}</Typography>
                <Typography variant="body2">Reason: {integration.reason || 'N/A'}</Typography>
                <Typography variant="body2">Created: {integration.createdAt}</Typography>
              </Box>
            )}
          </Stack>
    </Card>
  );
}
