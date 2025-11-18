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
import { useTheme } from '@mui/material/styles';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MenuIcon from '@mui/icons-material/Menu';

import { usePopover } from '@/hooks/use-popover';
import { useUser } from '@/hooks/use-user';

import { MobileNav } from './mobile-nav';
import { UserPopover } from './user-popover';
import { NotificationsDialog } from './notifications-dialog';
import { authClient } from '@/lib/auth/client';

export function MainNav(): React.JSX.Element {
  const theme = useTheme();
  const { user } = useUser();
  const [openNav, setOpenNav] = React.useState<boolean>(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState<boolean>(false);
  const [notificationCount, setNotificationCount] = React.useState<number>(0);

  const userPopover = usePopover<HTMLDivElement>();

  // Function to get initial from user email
  const getInitials = (email?: string): string => {
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
  };

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
            {/* Collapse/expand side nav to icons-only for large screens */}
            <IconButton
              onClick={() => {
                try {
                  const currently = typeof window !== 'undefined' && window.localStorage.getItem('sideNavCollapsed') === 'true';
                  const next = !currently;
                  if (typeof window !== 'undefined') {
                    window.localStorage.setItem('sideNavCollapsed', String(next));
                    // set CSS variable for width so layout responds
                    window.document.documentElement.style.setProperty('--SideNav-width', next ? '72px' : '280px');
                    // add data attribute for other components to react to
                    window.document.body.setAttribute('data-nav-collapsed', String(next));
                    // fire event for listeners
                    window.dispatchEvent(new CustomEvent('nav-collapse', { detail: next }));
                  }
                } catch (e) {
                  // ignore
                }
              }}
              sx={{ display: { xs: 'none', lg: 'inline-flex' } }}
              aria-label="Toggle side navigation"
            >
              {typeof window !== 'undefined' && window.localStorage.getItem('sideNavCollapsed') === 'true' ? <MenuOpenIcon /> : <MenuIcon />}
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
              sx={{ 
                cursor: 'pointer',
                bgcolor: theme.palette.secondary.main,
                color: '#fff',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: theme.palette.secondary.dark,
                }
              }}
            >
              {getInitials(user?.email)}
            </Avatar>
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
