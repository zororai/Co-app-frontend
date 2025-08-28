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
    <Card sx={{ display: 'flex',border: '1px solid #000080', flexDirection: 'column', height: '100%', p: 2 }}>
      <Stack spacing={2} alignItems="center">
        <Avatar src={integration.logo} alt={integration.title} sx={{ width: 56, height: 56, mb: 1 }} />
        <Typography variant="h6" align="center">{integration.title || integration.sectionName || 'No Title'}</Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          {integration.description || 'No description provided.'}
        </Typography>
        <Divider sx={{ width: '100%' ,border: '0.5px solid #5566aa'}} />
        <Box sx={{ width: '100%' }}>
          {integration.sectionName && (
            <Typography variant="subtitle2">Section: {integration.sectionName}</Typography>
          )}
          {integration.shaftNumbers && (
            <Typography variant="subtitle2">Shaft Numbers: {integration.shaftNumbers}</Typography>
          )}
          {integration.medicalFee && (
            <Typography variant="body2">Medical Fee: {integration.medicalFee}</Typography>
          )}
          {integration.regFee && (
            <Typography variant="body2">Registration Fee: {integration.regFee}</Typography>
          )}
          {integration.startContractDate && (
            <Typography variant="body2">Contract Start: {integration.startContractDate}</Typography>
          )}

          {integration.endContractDate && (
            <Typography variant="body2">Contract End: {integration.endContractDate}</Typography>
          )}
          {integration.status && (
            <Typography 
              variant="body2" 
              sx={{ 
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                bgcolor: 
                  integration.status === 'APPROVED' ? '#d0f5e8' : '#ffebee',
                color: integration.status === 'APPROVED' ? '#1b5e20' : 
                       integration.status === 'REJECTED' ? '#c62828' : 
                       integration.status === 'PENDING' ? 'red' : 
                       integration.status === 'PUSH BACK' ? '#0d47a1' : 
                       'text.primary' 
              }}
            >
              Status: {integration.status}
            </Typography>
          )}
          {integration.reason && (
            <Typography variant="body2">Reason: {integration.reason}</Typography>
          )}
          {integration.createdAt && (
            <Typography variant="body2">Created: {integration.createdAt}</Typography>
          )}
        </Box>
      </Stack>
    </Card>
  );
}
