'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { BellIcon } from '@phosphor-icons/react/dist/ssr/Bell';
import { ListIcon } from '@phosphor-icons/react/dist/ssr/List';
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';

import { usePopover } from '@/hooks/use-popover';

import { MobileNav } from './mobile-nav';
import { UserPopover } from './user-popover';
import { NotificationsDialog } from './notifications-dialog';
import { authClient } from '@/lib/auth/client';

export function MainNav(): React.JSX.Element {
  const [openNav, setOpenNav] = React.useState<boolean>(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState<boolean>(false);
  const [notificationCount, setNotificationCount] = React.useState<number>(0);

  const userPopover = usePopover<HTMLDivElement>();

  // Fetch notification count
  const fetchNotificationCount = React.useCallback(async () => {
    const response = await authClient.fetchNotifications();
    if (response.success && response.data) {
      setNotificationCount(response.data.length);
    }
  }, []);

  // Fetch notification count with delay to avoid blocking RSC
  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchNotificationCount();
    }, 200); // Delay to allow layout to render first
    return () => clearTimeout(timer);
  }, [fetchNotificationCount]);

  // Handle closing notifications dialog and refresh count
  const handleCloseNotifications = React.useCallback(() => {
    setNotificationsOpen(false);
    fetchNotificationCount(); // Refresh count when dialog closes
  }, [fetchNotificationCount]);

  return (
    <React.Fragment>
      <Box
        component="header"
        sx={{
          borderBottom: '1px solid var(--mui-palette-divider)',
          backgroundColor: 'var(--mui-palette-background-paper)',
          position: 'sticky',
          top: 0,
          zIndex: 'var(--mui-zIndex-appBar)',
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: 'center', justifyContent: 'space-between', minHeight: '64px', px: 2 }}
        >
          <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
            <IconButton
              onClick={(): void => {
                setOpenNav(true);
              }}
              sx={{ display: { lg: 'none' } }}
            >
              <ListIcon />
            </IconButton>
            
          </Stack>
          <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
         
            <Tooltip title="Notifications">
              <Badge badgeContent={notificationCount} color="error" max={99}>
                <IconButton onClick={() => setNotificationsOpen(true)}>
                  <BellIcon />
                </IconButton>
              </Badge>
            </Tooltip>
            <Avatar
              onClick={userPopover.handleOpen}
              ref={userPopover.anchorRef}
              src="/assets/avatar.png"
              sx={{ cursor: 'pointer' }}
            />
          </Stack>
        </Stack>
      </Box>
      <UserPopover anchorEl={userPopover.anchorRef.current} onClose={userPopover.handleClose} open={userPopover.open} />
      <NotificationsDialog open={notificationsOpen} onClose={handleCloseNotifications} />
      <MobileNav
        onClose={() => {
          setOpenNav(false);
        }}
        open={openNav}
      />
    </React.Fragment>
  );
}
