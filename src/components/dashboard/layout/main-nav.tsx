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
  const [navCollapsed, setNavCollapsed] = React.useState<boolean>(() => {
    try {
      if (typeof window === 'undefined') return false;
      return window.localStorage.getItem('sideNavCollapsed') === 'true';
    } catch (e) {
      return false;
    }
  });
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

  // Listen for nav-collapse events to keep toggle icon in sync
  React.useEffect(() => {
    const handler = (e: Event) => {
      try {
        const d = (e as CustomEvent).detail;
        setNavCollapsed(Boolean(d));
      } catch (err) {}
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('nav-collapse', handler as EventListener);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('nav-collapse', handler as EventListener);
      }
    };
  }, []);

  // Ensure document CSS var and body attribute are synced to the current state on mount/update
  React.useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.document.documentElement.style.setProperty('--SideNav-width', navCollapsed ? '72px' : '280px');
        window.document.body.setAttribute('data-nav-collapsed', String(navCollapsed));
        // Broadcast initial state so SideNav picks it up
        window.dispatchEvent(new CustomEvent('nav-collapse', { detail: navCollapsed }));
      }
    } catch (e) {
      // ignore
    }
  }, [navCollapsed]);

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
                  const currently = navCollapsed;
                  const next = !currently;
                  setNavCollapsed(next);
                  if (typeof window !== 'undefined') {
                    window.localStorage.setItem('sideNavCollapsed', String(next));
                    window.document.documentElement.style.setProperty('--SideNav-width', next ? '72px' : '280px');
                    window.document.body.setAttribute('data-nav-collapsed', String(next));
                    window.dispatchEvent(new CustomEvent('nav-collapse', { detail: next }));
                  }
                } catch (e) {
                  // ignore
                }
              }}
              sx={{ display: { xs: 'none', lg: 'inline-flex' } }}
              aria-label="Toggle side navigation"
            >
              {navCollapsed ? <MenuOpenIcon /> : <MenuIcon />}
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
