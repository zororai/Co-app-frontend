 

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
import { DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';

import dayjs from 'dayjs';



import { config } from '@/config';
import { CustomersTable } from '@/components/dashboard/useronboardstatus/user-status-table';
import type { Customer } from '@/components/dashboard/useronboardstatus/user-status-table';

// Tab content components with loading states
interface TabProps {
  customers: Customer[];
  page: number;
  rowsPerPage: number;
  onRefresh: () => void;
  isLoading?: boolean;
}

function PendingTab({ customers, page, rowsPerPage, onRefresh, isLoading }: TabProps) {
  if (isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 200 }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>Loading pending users...</Typography>
      </Stack>
    );
  }
  return <CustomersTable count={customers.length} page={page} rows={customers} rowsPerPage={rowsPerPage} onRefresh={onRefresh} statusFilter="PENDING" />;
}

function PushedBackTab({ customers, page, rowsPerPage, onRefresh, isLoading }: TabProps) {
  if (isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 200 }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>Loading pushed back users...</Typography>
      </Stack>
    );
  }
  return <CustomersTable count={customers.length} page={page} rows={customers} rowsPerPage={rowsPerPage} onRefresh={onRefresh} statusFilter="PUSHED_BACK" />;
}

function RejectedTab({ customers, page, rowsPerPage, onRefresh, isLoading }: TabProps) {
  if (isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 200 }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>Loading rejected users...</Typography>
      </Stack>
    );
  }
  return <CustomersTable count={customers.length} page={page} rows={customers} rowsPerPage={rowsPerPage} onRefresh={onRefresh} statusFilter="REJECTED" />;
}

function ApprovedTab({ customers, page, rowsPerPage, onRefresh, isLoading }: TabProps) {
  if (isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 200 }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>Loading approved users...</Typography>
      </Stack>
    );
  }
  return <CustomersTable count={customers.length} page={page} rows={customers} rowsPerPage={rowsPerPage} onRefresh={onRefresh} statusFilter="APPROVED" />;
}
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { RegMinerDialog } from '@/components/dashboard/customer/reg_miner';
import { authClient } from '@/lib/auth/client';
import { AddUserDialog } from '@/components/dashboard/useronboard/add-user-dialog';


export default function Page(): React.JSX.Element {
  const page = 0;
  const rowsPerPage = 5;
  const [open, setOpen] = React.useState(false);
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [tab, setTab] = React.useState<'PENDING' | 'PUSHED_BACK' | 'REJECTED' | 'APPROVED'>('PENDING');
  
  // Loading state for initial data fetch
  const [isInitialLoading, setIsInitialLoading] = React.useState(true);

  // Function to fetch and update user status data
  const fetchUserStatus = React.useCallback(async () => {
    try {
      const data = await authClient.fetchPendingCustomers();
      console.log('Fetched user status data from API:', data);
      // Normalize status values to match expected enum
      const normalizedData = data.map((customer: any) => ({
        ...customer,
        status: customer.status === "Approved" ? "APPROVED"
              : customer.status === "Rejected" ? "REJECTED"
              : customer.status === "Pending" ? "PENDING"
              : customer.status === "Pushed Back" ? "PUSHED_BACK"
              : customer.status // fallback to original if already correct
      }));
      console.log('Normalized user status data for table:', normalizedData);
      setCustomers(normalizedData);
    } catch (error) {
      console.error('API call failed:', error);
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  // Function to refresh the user status data
  const refreshData = React.useCallback(() => {
    setRefreshKey(prevKey => prevKey + 1);
    fetchUserStatus();
  }, [fetchUserStatus]);

  // Render UI first, then fetch data with a small delay
  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchUserStatus();
    }, 100);
    return () => clearTimeout(timer);
  }, [fetchUserStatus]);

  // Filter customers by selected tab/status
  const pendingCustomers = customers.filter(c => c.status === 'PENDING');
  const pushedBackCustomers = customers.filter(c => c.status === 'PUSHED_BACK');
  const rejectedCustomers = customers.filter(c => c.status === 'REJECTED');
  const approvedCustomers = customers.filter(c => c.status === 'APPROVED');

  // Export table data as CSV
  const handleExport = () => {
    const headers = [
      'Name', 'Surname', 'Phone Number', 'Email', 'Position', 'Role', 'Status'
    ];

    // Determine which customers to export based on the current tab
    let filteredCustomers: Customer[] = [];
    switch (tab) {
    case 'PENDING': {
    filteredCustomers = pendingCustomers;
    break;
    }
    case 'PUSHED_BACK': {
    filteredCustomers = pushedBackCustomers;
    break;
    }
    case 'REJECTED': {
    filteredCustomers = rejectedCustomers;
    break;
    }
    case 'APPROVED': {
    filteredCustomers = approvedCustomers;
    break;
    }
    }

    // Export all filtered customers, not just paginated ones
    const rows = filteredCustomers.map((c: any) => [
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
    a.download = `user-onboard-status-${tab.toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.append(a);

    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3} sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">User Onboarding Status Table </Typography>
          <Tabs
            value={tab}
            onChange={(_e, newValue) => setTab(newValue)}
            sx={{ mb: 2 }}
          >
            <Tab label="Pending" value="PENDING" />
            <Tab label="Pushed Back" value="PUSHED_BACK" />
            <Tab label="Rejected" value="REJECTED" />
            <Tab label="Approved" value="APPROVED" />
          </Tabs>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            
            <Button color="inherit" startIcon={<DownloadIcon fontSize="var(--icon-fontSize-md)" />} onClick={handleExport}>
              Export
            </Button>
          </Stack>
        </Stack>
        {/* Top-right action button with menu */}
        <TopRightActions />
      </Stack>

      {tab === 'PENDING' && (
        <PendingTab customers={pendingCustomers} page={page} rowsPerPage={rowsPerPage} onRefresh={refreshData} isLoading={isInitialLoading} />
      )}
      {tab === 'PUSHED_BACK' && (
        <PushedBackTab customers={pushedBackCustomers} page={page} rowsPerPage={rowsPerPage} onRefresh={refreshData} isLoading={isInitialLoading} />
      )}
      {tab === 'REJECTED' && (
        <RejectedTab customers={rejectedCustomers} page={page} rowsPerPage={rowsPerPage} onRefresh={refreshData} isLoading={isInitialLoading} />
      )}
      {tab === 'APPROVED' && (
        <ApprovedTab customers={approvedCustomers} page={page} rowsPerPage={rowsPerPage} onRefresh={refreshData} isLoading={isInitialLoading} />
      )}

      <RegMinerDialog open={open} onClose={() => setOpen(false)} />
    </Stack>
  );
}

function applyPagination(rows: Customer[], page: number, rowsPerPage: number): Customer[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}

// Actions component placed at top-right
function TopRightActions(): React.JSX.Element {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const open = Boolean(anchorEl);

  // Function to refresh the data
  const refreshData = React.useCallback(() => {
    setRefreshKey(prevKey => prevKey + 1);
    // This will trigger a re-render of the parent component
    window.location.reload();
  }, []);

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
     
      
      {/* Add User Dialog */}
      <AddUserDialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        onRefresh={refreshData}
      />
    </React.Fragment>
  );
}
