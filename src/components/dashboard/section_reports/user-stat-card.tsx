'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Users as UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import { UserPlus as UserPlusIcon } from '@phosphor-icons/react/dist/ssr/UserPlus';
import { UserCheck as UserCheckIcon } from '@phosphor-icons/react/dist/ssr/UserCheck';
import { Repeat as RepeatIcon } from '@phosphor-icons/react/dist/ssr/Repeat';

interface UserStatCardProps {
  title: string;
  value: string | React.ReactNode;
  icon: 'users' | 'userPlus' | 'userCheck' | 'repeat';
}

export function UserStatCard({ title, value, icon }: UserStatCardProps): React.JSX.Element {
  const icons = {
    users: UsersIcon,
    userPlus: UserPlusIcon,
    userCheck: UserCheckIcon,
    repeat: RepeatIcon,
  };

  const Icon = icons[icon];

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Icon fontSize="var(--icon-fontSize-lg)" style={{ color: 'var(--mui-palette-text-secondary)' }} />
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Stack>
          <Typography variant="h3">{value}</Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
