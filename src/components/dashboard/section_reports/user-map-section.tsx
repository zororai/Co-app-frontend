'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme, alpha } from '@mui/material/styles';

export function UserMapSection(): React.JSX.Element {
  const theme = useTheme();

  // Sample data for active users locations
  const activeUserLocations = [
    { x: 25, y: 45, count: 150 },
    { x: 40, y: 35, count: 450 },
    { x: 50, y: 50, count: 300 },
    { x: 60, y: 40, count: 200},
    { x: 35, y: 60, count: 250 },
    { x: 70, y: 55, count: 180 },
    { x: 45, y: 70, count: 220 },
  ];

  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: 300,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          {/* Simplified map background */}
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{ position: 'absolute', top: 0, left: 0 }}
          >
            {/* Simple map outlines */}
            <path
              d="M 10 20 L 20 15 L 35 18 L 45 12 L 60 15 L 75 20 L 85 25 L 90 35 L 88 50 L 85 65 L 80 75 L 70 82 L 55 85 L 40 83 L 25 78 L 15 70 L 10 55 Z"
              fill={theme.palette.mode === 'dark' ? '#1a2942' : '#e3f2fd'}
              stroke={theme.palette.divider}
              strokeWidth="0.5"
            />
            <path
              d="M 20 30 Q 30 28 40 32 T 60 35 L 65 45 Q 60 50 50 48 T 30 45 Z"
              fill={theme.palette.mode === 'dark' ? '#0d1b2a' : '#bbdefb'}
              stroke={theme.palette.divider}
              strokeWidth="0.3"
            />
          </svg>

          {/* Active user markers */}
          {activeUserLocations.map((location, index) => (
            <Box
              key={index}
              sx={{
                position: 'absolute',
                left: `${location.x}%`,
                top: `${location.y}%`,
                width: location.count > 300 ? 24 : location.count > 200 ? 18 : 14,
                height: location.count > 300 ? 24 : location.count > 200 ? 18 : 14,
                borderRadius: '50%',
                bgcolor: theme.palette.success.main,
                opacity: 0.7,
                transform: 'translate(-50%, -50%)',
                boxShadow: `0 0 0 ${location.count > 300 ? 8 : location.count > 200 ? 6 : 4}px ${theme.palette.success.main}33`,
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%, 100%': {
                    opacity: 0.7,
                  },
                  '50%': {
                    opacity: 1,
                  },
                },
                '&:hover': {
                  zIndex: 10,
                  '&::after': {
                    content: `"Active Users: ${location.count}"`,
                    position: 'absolute',
                    top: '-30px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    padding: '4px 8px',
                    borderRadius: 1,
                    fontSize: '12px',
                    whiteSpace: 'nowrap',
                    boxShadow: theme.shadows[4],
                  },
                },
              }}
            />
          ))}

          {/* Legend */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              bgcolor: 'background.paper',
              padding: 1.5,
              borderRadius: 1,
              boxShadow: theme.shadows[2],
            }}
          >
            <Typography variant="caption" fontWeight="medium">
              Active Users: 450
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
