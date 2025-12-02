'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import { ArrowSquareUpRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowSquareUpRight';
import { CaretUpDownIcon } from '@phosphor-icons/react/dist/ssr/CaretUpDown';
import { MagnifyingGlass as SearchIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { useTheme } from '@mui/material/styles';

import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';
import { isNavItemActive } from '@/lib/is-nav-item-active';
import { Logo } from '@/components/core/logo';
import { authClient } from '@/lib/auth/client';

import { navItems, allNavItems, getNavItemsForUser } from './config';
import { navIcons } from './nav-icons';

export interface MobileNavProps {
  onClose?: () => void;
  open?: boolean;
  items?: NavItemConfig[];
}

export function MobileNav({ open, onClose }: MobileNavProps): React.JSX.Element {
  const pathname = usePathname();
  const theme = useTheme();
  const [loading, setLoading] = React.useState(false);
  const [permissionsLoading, setPermissionsLoading] = React.useState(true);
  const [filteredNavItems, setFilteredNavItems] = React.useState<NavItemConfig[]>([]);
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const prevPathRef = React.useRef<string | null>(null);

  // Fetch user permissions and filter navigation items using render-ui-first pattern
  const fetchPermissions = React.useCallback(async () => {
    try {
      const { data: userData } = await authClient.getUser();
      if (!userData || !userData.email) {
        console.log('⚠️ No user email found, hiding all nav items');
        setFilteredNavItems([]);
        return;
      }

      console.log('🔍 Fetching permissions for:', userData.email);
      const response = await authClient.fetchUserPermissions(userData.email);
      
      console.log('📦 API Response:', { 
        success: response.success, 
        hasData: !!response.data,
        error: response.error,
        rawData: response.data 
      });
      
      if (response.success && response.data?.permissions) {
        const permissionKeys = response.data.permissions.map((p) => p.permission);
        console.log('✅ User permissions:', permissionKeys);
        
        const filtered = getNavItemsForUser(permissionKeys);
        console.log('📋 Filtered nav items:', filtered.map(item => ({ key: item.key, title: item.title, hasSubItems: !!item.items })));
        setFilteredNavItems(filtered);
      } else {
        // User not found or no permissions - hide all nav items
        console.log('⚠️ User not found or no permissions - hiding all nav items');
        setFilteredNavItems([]);
      }
    } catch (error) {
      // Log errors and hide nav items for security
      console.warn('Error fetching permissions:', error);
      setFilteredNavItems([]);
    } finally {
      setPermissionsLoading(false);
    }
  }, []);

  // Render UI first, then fetch permissions with a small delay
  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchPermissions();
    }, 100);
    return () => clearTimeout(timer);
  }, [fetchPermissions]);

  // Hide loader once the route actually changes
  React.useEffect(() => {
    if (prevPathRef.current === null) {
      prevPathRef.current = pathname;
      return;
    }
    if (loading && prevPathRef.current !== pathname) {
      setLoading(false);
      // Also close the drawer on navigation
      onClose?.();
    }
    prevPathRef.current = pathname;
  }, [pathname, loading, onClose]);

  // Filter nav items based on search query
  const searchFilteredNavItems = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return filteredNavItems;
    }

    const query = searchQuery.toLowerCase();
    
    const filterItems = (items: NavItemConfig[]): NavItemConfig[] => {
      return items.reduce((acc: NavItemConfig[], item) => {
        const titleMatch = item.title?.toLowerCase().includes(query) || false;
        
        // If item has children, filter them recursively
        if (item.items && item.items.length > 0) {
          const filteredChildren = filterItems(item.items);
          
          // Include parent if title matches or if any children match
          if (titleMatch || filteredChildren.length > 0) {
            acc.push({
              ...item,
              items: filteredChildren.length > 0 ? filteredChildren : item.items
            });
          }
        } else if (titleMatch) {
          // Include item if title matches
          acc.push(item);
        }
        
        return acc;
      }, []);
    };

    return filterItems(filteredNavItems);
  }, [filteredNavItems, searchQuery]);

  return (
    <Drawer
      PaperProps={{
        sx: {
          '--MobileNav-background': theme.palette.secondary.main,
          '--MobileNav-color': 'var(--mui-palette-common-white)',
          '--NavItem-color': 'rgba(255, 255, 255, 0.9)',
          '--NavItem-hover-background': 'rgba(255, 255, 255, 0.1)',
          '--NavItem-active-background': theme.palette.secondary.dark,
          '--NavItem-active-color': 'var(--mui-palette-common-white)',
          '--NavItem-disabled-color': 'rgba(255, 255, 255, 0.5)',
          '--NavItem-icon-color': 'rgba(255, 255, 255, 0.7)',
          '--NavItem-icon-active-color': 'var(--mui-palette-common-white)',
          '--NavItem-icon-disabled-color': 'rgba(255, 255, 255, 0.4)',
          bgcolor: 'var(--MobileNav-background)',
          color: 'var(--MobileNav-color)',
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '100%',
          scrollbarWidth: 'none',
          width: 'var(--MobileNav-width)',
          zIndex: 'var(--MobileNav-zIndex)',
          '&::-webkit-scrollbar': { display: 'none' },
        },
      }}
      onClose={onClose}
      open={open}
    >
      <Stack spacing={2} sx={{ p: 3 }}>
        <Box
          component={RouterLink}
          href={paths.home}
          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, textDecoration: 'none', color: 'inherit' }}
        >
          <Box
            component="img"
            src="/assets/Logo.png"
            alt="Logo"
            sx={{
              height: 50,
              width: 50,
              flexShrink: 0
            }}
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontSize: '1.125rem',
                lineHeight: 1.2,
                fontWeight: 600,
                color: 'white'
              }}
            >
              Commstack
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                fontSize: '0.75rem',
                lineHeight: 1,
                color: 'rgba(255, 255, 255, 0.8)',
                fontWeight: 400
              }}
            >
              Co-App
            </Typography>
          </Box>
        </Box>
        
        {/* Search box for filtering menu items */}
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 1,
          px: 1.5,
          py: 1,
          bgcolor: 'rgba(255, 255, 255, 0.05)',
          '&:focus-within': {
            borderColor: 'rgba(255, 255, 255, 0.4)',
            bgcolor: 'rgba(255, 255, 255, 0.08)'
          }
        }}>
          <SearchIcon 
            fontSize={18}
            style={{ color: 'rgba(255, 255, 255, 0.7)', marginRight: '8px', flexShrink: 0 }}
          />
          <input
            type="text"
            placeholder="Search menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              width: '100%',
              background: 'transparent',
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.9)',
              fontFamily: 'inherit'
            }}
          />
        </Box>
        
        {/* Loading indicator below logo */}
        {(permissionsLoading || loading) && (
          <LinearProgress 
            sx={{ 
              width: '100%',
              mx: -3,
              mt: -1,
              '& .MuiLinearProgress-bar': {
                bgcolor: 'rgba(255, 255, 255, 0.9)'
              },
              bgcolor: 'rgba(255, 255, 255, 0.2)'
            }} 
          />
        )}
      </Stack>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />
      <Box 
        component="nav" 
        sx={{ 
          flexGrow: 1, 
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'background.paper',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'divider',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'text.disabled',
          },
        }}
      >
        <Stack component="ul" spacing={1} sx={{ listStyle: 'none', m: 0, p: 0 }}>
          {renderNavItems({ pathname, items: searchFilteredNavItems, onNavigateStart: () => setLoading(true) })}
        </Stack>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />
    
    </Drawer>
  );
}

function renderNavItems({ items = [], pathname, onNavigateStart }: { items?: NavItemConfig[]; pathname: string | null; onNavigateStart?: () => void }): React.JSX.Element {
  const children = items.reduce((acc: React.ReactNode[], curr: NavItemConfig): React.ReactNode[] => {
    const { key, ...item } = curr;

    acc.push(<NavItem key={key} pathname={pathname ?? ''} onNavigateStart={onNavigateStart} {...item} />);

    return acc;
  }, []);

  return (
    <Stack component="ul" spacing={1} sx={{ listStyle: 'none', m: 0, p: 0 }}>
      {children}
    </Stack>
  );
}

interface NavItemProps extends Omit<NavItemConfig, 'items'> {
  pathname: string | null;
  items?: NavItemConfig[];
  onNavigateStart?: () => void;
}

function NavItem({ disabled, external, href, icon, matcher, pathname, title, items, onNavigateStart }: NavItemProps): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
  const active = isNavItemActive({ disabled, external, href, matcher, pathname });
  const hasChildren = Array.isArray(items) && items.length > 0;
  
  // Handle click for items with children
  const handleClick = React.useCallback(
    (e: React.MouseEvent) => {
      if (hasChildren) {
        e.preventDefault();
        setOpen((prevOpen) => !prevOpen);
      }
    },
    [hasChildren]
  );
  
  const Icon = typeof icon === 'string' && navIcons[icon] ? navIcons[icon] : null;

  return (
    <li>
      <Box
        {...(href && !hasChildren
          ? {
              component: external ? 'a' : RouterLink,
              href,
              target: external ? '_blank' : undefined,
              rel: external ? 'noreferrer' : undefined,
            }
          : { role: 'button' })}
        onClick={(e: React.MouseEvent) => {
          if (hasChildren) {
            handleClick(e);
            return;
          }
          if (disabled) {
            e.preventDefault();
            return;
          }
          onNavigateStart?.();
        }}
        sx={{
          alignItems: 'center',
          borderRadius: 1,
          color: 'var(--NavItem-color)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          flex: '0 0 auto',
          gap: 1,
          p: '6px 16px',
          position: 'relative',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          transition: 'background-color 0.2s ease',
          // When the global side-nav is collapsed, center icons for a compact look (matches side-nav behavior)
          'body[data-nav-collapsed="true"] &': {
            gap: 0,
            p: '6px',
            justifyContent: 'center',
          },
          ...(disabled && {
            bgcolor: 'var(--NavItem-disabled-background)',
            color: 'var(--NavItem-disabled-color)',
            cursor: 'not-allowed',
          }),
          ...(!disabled && !active && {
            '&:hover': {
              bgcolor: 'var(--NavItem-hover-background)',
            },
          }),
          ...(active && { 
            bgcolor: 'var(--NavItem-active-background)', 
            color: 'var(--NavItem-active-color)',
            fontWeight: 600
          }),
        }}
      >
        <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'center', flex: '0 0 auto' }}>
          {Icon ? (
            <Icon
              fill={active ? 'var(--NavItem-icon-active-color)' : 'var(--NavItem-icon-color)'}
              fontSize="var(--icon-fontSize-md)"
              weight={active ? 'fill' : undefined}
            />
          ) : null}
        </Box>
        <Box sx={{ flex: '1 1 auto' }}>
          <Typography
            component="span"
            sx={{ color: 'inherit', fontSize: '0.875rem', fontWeight: 500, lineHeight: '28px' }}
          >
            {title}
          </Typography>
        </Box>
        {hasChildren ? (
          <Box sx={{ ml: 1, display: 'flex', alignItems: 'center' }}>
            <CaretUpDownIcon style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </Box>
        ) : null}
      </Box>
      {hasChildren && open && (
        <Stack component="ul" spacing={1} sx={{ listStyle: 'none', m: 0, p: 0, pl: 3 }}>
          {items!.map((child, idx) => {
            // Destructure key and pass it directly, spread the rest
            const { key, ...childProps } = child;
            const navKey = key ? String(key) : String(idx);
            return <NavItem key={navKey} pathname={pathname} onNavigateStart={onNavigateStart} {...childProps} />;
          })}
        </Stack>
      )}
    </li>
  );
}
