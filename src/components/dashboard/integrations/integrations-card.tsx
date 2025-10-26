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
    <Card sx={{ display: 'flex',border: '1px solidrgba(3, 3, 95, 0.4)', flexDirection: 'column', height: '100%', p: 2 }}>
      <Stack spacing={2} alignItems="center">
        <Box 
          sx={{ 
            width: 56, 
            height: 56, 
            mb: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            bgcolor: 'rgba(3, 3, 95, 0.4)',
            borderRadius: '50%',
            color: 'white'
          }}
        >
          <svg width="32" height="32" viewBox="0 0 100 100" fill="currentColor">
            {/* Roof structure */}
            <polygon points="10,25 90,25 85,15 15,15" />
            
            {/* Support pillars */}
            <rect x="20" y="25" width="4" height="20" />
            <rect x="76" y="25" width="4" height="20" />
            
            {/* Horizontal beam */}
            <rect x="20" y="30" width="60" height="3" />
            
            {/* Drilling equipment */}
            <rect x="35" y="28" width="30" height="4" rx="2" />
            <rect x="40" y="25" width="20" height="2" />
            
            {/* Drill bit/funnel */}
            <polygon points="45,35 55,35 52,45 48,45" />
            
            {/* Vertical shaft */}
            <rect x="48" y="32" width="4" height="25" />
            
            {/* Well structure - cylindrical */}
            <ellipse cx="50" cy="60" rx="25" ry="4" />
            <rect x="25" y="60" width="50" height="25" />
            <ellipse cx="50" cy="85" rx="25" ry="4" />
            
            {/* Brick pattern on well */}
            <rect x="30" y="65" width="8" height="3" />
            <rect x="42" y="65" width="8" height="3" />
            <rect x="54" y="65" width="8" height="3" />
            <rect x="66" y="65" width="8" height="3" />
            
            <rect x="26" y="70" width="8" height="3" />
            <rect x="38" y="70" width="8" height="3" />
            <rect x="50" y="70" width="8" height="3" />
            <rect x="62" y="70" width="8" height="3" />
            
            <rect x="30" y="75" width="8" height="3" />
            <rect x="42" y="75" width="8" height="3" />
            <rect x="54" y="75" width="8" height="3" />
            <rect x="66" y="75" width="8" height="3" />
            
            <rect x="26" y="80" width="8" height="3" />
            <rect x="38" y="80" width="8" height="3" />
            <rect x="50" y="80" width="8" height="3" />
            <rect x="62" y="80" width="8" height="3" />
            
            {/* Side pipe */}
            <rect x="80" y="35" width="3" height="8" />
            <rect x="83" y="35" width="8" height="3" />
            <rect x="83" y="40" width="8" height="3" />
          </svg>
        </Box>
            <Typography variant="h6">Shaft Numbers: {integration.shaftNumbers}</Typography>
            <Typography variant="subtitle2" align="center">{integration.title || integration.sectionName || 'No Title'}</Typography>
  
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
            Shaft Operational Status: {integration.status}
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
