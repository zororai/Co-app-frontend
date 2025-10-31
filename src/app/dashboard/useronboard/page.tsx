 

"use client";
import * as React from 'react';
import type { Metadata } from 'next';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import dayjs from 'dayjs';

import { config } from '@/config';
import { LazyWrapper } from '@/components/common/LazyWrapper';
import { LazyCustomersTable, LazyRegMinerDialog, LazyAddUserDialog } from '@/components/lazy/LazyComponents';
import type { Customer } from '@/components/dashboard/useronboard/miner-status-table';
import { authClient } from '@/lib/auth/client';


export default function Page(): React.JSX.Element {
  const page = 0;
  const rowsPerPage =   5;
  const [open, setOpen] = React.useState(false);
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [refreshKey, setRefreshKey] = React.useState(0);

  // Loading state for initial data fetch
  const [isInitialLoading, setIsInitialLoading] = React.useState(true);

  // Function to fetch and update customer data
  const fetchCustomers = React.useCallback(async () => {
    try {
      console.log('Starting to fetch customers...');
      const data = await authClient.fetchUsers();
      console.log('Raw API response:', data);
      console.log('Data type:', typeof data);
      console.log('Is array:', Array.isArray(data));
      console.log('Data length:', data?.length);
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        console.warn('No data received from API or data is empty');
        setCustomers([]);
        return;
      }
      
      // Normalize status values to match expected enum
      const normalizedData = data.map((customer: any) => ({
        ...customer,
        status: customer.status === "Approved" ? "APPROVED"
              : customer.status === "Rejected" ? "REJECTED"
              : customer.status === "Pending" ? "PENDING"
              : customer.status === "Pushed Back" ? "PUSHED_BACK"
              : customer.status // fallback to original if already correct
      }));
      console.log('Normalized data for table:', normalizedData);
      console.log('Setting customers with', normalizedData.length, 'records');
      setCustomers(normalizedData);
    } catch (error) {
      console.error('API call failed:', error);
      
      // Fallback: Add some mock data for testing
      console.log('Using mock data for testing...');
      const mockData = [
        {
          id: '1',
          name: 'John',
          surname: 'Doe',
          email: 'john.doe@example.com',
          cellNumber: '+263 77 123 4567',
          nationIdNumber: '67-123456-A78',
          nationId: '67-123456-A78',
          address: '123 Main St, Harare',
          phone: '+263 77 123 4567',
          position: 'Owner',
          cooperative: 'Gold Miners Coop',
          cooperativeName: 'Gold Miners Coop',
          numShafts: 2,
          status: 'PENDING' as const,
          reason: '',
          attachedShaft: false
        },
        {
          id: '2',
          name: 'Jane',
          surname: 'Smith',
          email: 'jane.smith@example.com',
          cellNumber: '+263 77 234 5678',
          nationIdNumber: '67-234567-B89',
          nationId: '67-234567-B89',
          address: '456 Oak Ave, Bulawayo',
          phone: '+263 77 234 5678',
          position: 'Representative',
          cooperative: 'Silver Miners Union',
          cooperativeName: 'Silver Miners Union',
          numShafts: 1,
          status: 'APPROVED' as const,
          reason: '',
          attachedShaft: true
        },
        {
          id: '3',
          name: 'Bob',
          surname: 'Johnson',
          email: 'bob.johnson@example.com',
          cellNumber: '+263 77 345 6789',
          nationIdNumber: '67-345678-C90',
          nationId: '67-345678-C90',
          address: '789 Pine Rd, Mutare',
          phone: '+263 77 345 6789',
          position: 'Member',
          cooperative: 'Diamond Diggers',
          cooperativeName: 'Diamond Diggers',
          numShafts: 3,
          status: 'REJECTED' as const,
          reason: 'Incomplete documentation',
          attachedShaft: false
        }
      ];
      setCustomers(mockData);
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  // Function to refresh the data
  const refreshData = React.useCallback(() => {
    setRefreshKey(prevKey => prevKey + 1);
    fetchCustomers();
  }, [fetchCustomers]);

  // Render UI first, then fetch data with a small delay
  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 100);
    return () => clearTimeout(timer);
  }, [fetchCustomers]);


  // Export table data as CSV
  const handleExport = () => {
    const headers = [
      'Name', 'Surname', 'Phone Number', 'Email', 'Position', 'Role', 'Status'
    ];

    // Export all customers
    const rows = customers.map((c: any) => [
      c.name || '',
      c.surname || '',
      c.cellNumber || '',
      c.email || '',
      c.position || '',
      c.role || '',
      c.status || ''
    ]);
    
    const csvContent = [headers, ...rows].map(r => r.map(String).map(x => `"${x.replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-onboard-all-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.append(a);

    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };


  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3} sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">User Onboarding </Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Button color="inherit" startIcon={<DownloadIcon fontSize="var(--icon-fontSize-md)" />} onClick={handleExport}>
              Export
            </Button>
          </Stack>
        </Stack>
        {/* Top-right action button with menu */}
        <TopRightActions onRefresh={refreshData} />
      </Stack>

      {isInitialLoading ? (
        <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 200 }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ mt: 2 }}>Loading users...</Typography>
        </Stack>
      ) : (
        <LazyWrapper>
          <LazyCustomersTable count={customers.length} page={page} rows={customers} rowsPerPage={rowsPerPage} onRefresh={refreshData} />
        </LazyWrapper>
      )}

      <LazyWrapper>
        <LazyRegMinerDialog open={open} onClose={() => setOpen(false)} />
      </LazyWrapper>
    </Stack>
  );
}

function applyPagination(rows: Customer[], page: number, rowsPerPage: number): Customer[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}

// Actions component placed at top-right
function TopRightActions({ onRefresh }: { onRefresh: () => void }): React.JSX.Element {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const open = Boolean(anchorEl);

  // Function to refresh the data
  const refreshData = React.useCallback(() => {
    setRefreshKey(prevKey => prevKey + 1);
    // Call the parent's refresh function
    onRefresh();
  }, [onRefresh]);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);
  const go = (path: string) => {
    globalThis.location.href = path;
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  return (
    <React.Fragment>
      <Button
        variant="contained"
        startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
        onClick={handleOpenDialog}
        sx={{
          bgcolor: 'secondary.main',
          color: '#fff',
          '&:hover': { bgcolor: 'secondary.dark' }
        }}
      >
        Add User
      </Button>
      
      {/* Add User Dialog */}
      <LazyWrapper>
        <LazyAddUserDialog 
          open={dialogOpen} 
          onClose={handleCloseDialog}
          onRefresh={refreshData}
        />
      </LazyWrapper>
    </React.Fragment>
  );
}
