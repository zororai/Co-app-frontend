'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export interface ReportCard {
  id: string;
  title: string;
  description: string;
  date?: string;
  status?: string;
}

interface ReportCardProps {
  report: ReportCard;
  loading?: boolean;
}

export function ReportCard({ report, loading = false }: ReportCardProps): React.JSX.Element {
  if (loading) {
    return (
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <CardContent>
          <Stack spacing={2}>
            <Skeleton variant="text" width="60%" height={32} />
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="40%" />
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
          cursor: 'pointer',
        },
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6" component="div">
            {report.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {report.description}
          </Typography>
          {report.date && (
            <Typography variant="caption" color="text.secondary">
              {report.date}
            </Typography>
          )}
          {report.status && (
            <Typography
              variant="caption"
              sx={{
                color: 'success.main',
                fontWeight: 'medium',
              }}
            >
              {report.status}
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
