 

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
import { LazyWrapper } from '@/components/common/LazyWrapper';
import { LazyVehicleOnboardingTable } from '@/components/lazy/LazyComponents';
import type { Customer } from '@/components/dashboard/vehicleonboarding/vehicle-onboarding-table';

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
        <Typography variant="body2" sx={{ mt: 2 }}>Loading pending vehicles...</Typography>
      </Stack>
    );
  }
  return (
    <LazyWrapper>
      <LazyVehicleOnboardingTable count={customers.length} page={page} rows={customers} rowsPerPage={rowsPerPage} onRefresh={onRefresh} statusFilter="PENDING" />
    </LazyWrapper>
  );
}

function PushedBackTab({ customers, page, rowsPerPage, onRefresh, isLoading }: TabProps) {
  if (isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 200 }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>Loading pushed back vehicles...</Typography>
      </Stack>
    );
  }
  return (
    <LazyWrapper>
      <LazyVehicleOnboardingTable count={customers.length} page={page} rows={customers} rowsPerPage={rowsPerPage} onRefresh={onRefresh} statusFilter="PUSHED_BACK" />
    </LazyWrapper>
  );
}

function RejectedTab({ customers, page, rowsPerPage, onRefresh, isLoading }: TabProps) {
  if (isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 200 }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>Loading rejected vehicles...</Typography>
      </Stack>
    );
  }
  return (
    <LazyWrapper>
      <LazyVehicleOnboardingTable count={customers.length} page={page} rows={customers} rowsPerPage={rowsPerPage} onRefresh={onRefresh} statusFilter="REJECTED" />
    </LazyWrapper>
  );
}

function ApprovedTab({ customers, page, rowsPerPage, onRefresh, isLoading }: TabProps) {
  if (isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 200 }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>Loading approved vehicles...</Typography>
      </Stack>
    );
  }
  return (
    <LazyWrapper>
      <LazyVehicleOnboardingTable count={customers.length} page={page} rows={customers} rowsPerPage={rowsPerPage} onRefresh={onRefresh} statusFilter="APPROVED" />
    </LazyWrapper>
  );
}
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { LazyRegMinerDialog, LazyAddVehicleDialog } from '@/components/lazy/LazyComponents';
import { authClient } from '@/lib/auth/client';


export default function Page(): React.JSX.Element {
  const page = 0;
  const rowsPerPage = 5;
  const [open, setOpen] = React.useState(false);
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [tab, setTab] = React.useState<'PENDING' | 'PUSHED_BACK' | 'REJECTED' | 'APPROVED'>('PENDING');
  
  // Loading state for initial data fetch
  const [isInitialLoading, setIsInitialLoading] = React.useState(true);

  // Function to fetch and update vehicle data
  const fetchVehicles = React.useCallback(async () => {
    try {
      const data = await authClient.fetchVehicles(); // Updated to use vehicle-specific method
      console.log('Fetched vehicle data from API:', data);
      // Normalize status values to match expected enum
      const normalizedData = data.map((vehicle: any) => ({
        ...vehicle,
        status: vehicle.status === "Approved" ? "APPROVED"
              : vehicle.status === "Rejected" ? "REJECTED"
              : vehicle.status === "Pending" ? "PENDING"
              : vehicle.status === "Pushed Back" ? "PUSHED_BACK"
              : vehicle.status // fallback to original if already correct
      }));
      console.log('Normalized vehicle data for table:', normalizedData);
      setCustomers(normalizedData);
    } catch (error) {
      console.error('API call failed:', error);
      // Fallback to pending customers if vehicle API doesn't exist yet
      try {
        const fallbackData = await authClient.fetchPendingCustomers();
        // Type assertion for fallback data - this is temporary until proper vehicle API exists
        setCustomers(fallbackData as unknown as Customer[]);
      } catch (fallbackError) {
        console.error('Fallback API also failed:', fallbackError);
      }
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  // Function to refresh the vehicle data
  const refreshData = React.useCallback(() => {
    setRefreshKey(prevKey => prevKey + 1);
    fetchVehicles();
  }, [fetchVehicles]);

  // Render UI first, then fetch data with a small delay
  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchVehicles();
    }, 100);
    return () => clearTimeout(timer);
  }, [fetchVehicles]);

  // Filter customers by selected tab/status
  const pendingCustomers = customers.filter(c => c.status === 'PENDING');
  const pushedBackCustomers = customers.filter(c => c.status === 'PUSHED_BACK');
  const rejectedCustomers = customers.filter(c => c.status === 'REJECTED');
  const approvedCustomers = customers.filter(c => c.status === 'APPROVED');

  // Export table data as CSV
  const handleExport = () => {
    const headers = [
      'ID', 'Name', 'Surname', 'Nation ID', 'Address', 'Phone', 'Position', 'Cooperative', 'Num Shafts', 'Status', 'Reason', 'Attached Shaft'
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
    case 'APPROVED': { {
    filteredCustomers = approvedCustomers;
    // No default
    }
    break;
    }
    }

    const paginatedCustomers = applyPagination(filteredCustomers, page, rowsPerPage);

    const rows = paginatedCustomers.map(c => [
      c.id,
      c.name,
      c.surname,
      c.nationIdNumber,
      c.address,
      c.cellNumber,
      c.position,
      c.cooperativeName,
      c.numShafts,
      c.status,
      c.reason,
      c.attachedShaft ? 'Yes' : 'No'
    ]);
    const csvContent = [headers, ...rows].map(r => r.map(String).map(x => `"${x.replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customers.csv';
    document.body.append(a);

    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3} sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Vehicle Registration </Typography>
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
        <TopRightActions onRefresh={refreshData} />
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
  const [isLoading, setIsLoading] = React.useState(false);
  const open = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);
  const go = (path: string) => {
    globalThis.location.href = path;
  };

  const handleOpenDialog = async () => {
    setIsLoading(true);
    // Add a small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 500));
    setDialogOpen(true);
    setIsLoading(false);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  return (
    <React.Fragment>
      <Button
        variant="contained"
        startIcon={isLoading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <PlusIcon fontSize="var(--icon-fontSize-md)" />}
        onClick={handleOpenDialog}
        disabled={isLoading}
        sx={{
          bgcolor: '#5f4bfa',
          color: '#fff',
          '&:hover': { bgcolor: '#4aa856' },
          '&:disabled': { bgcolor: '#9e9e9e', opacity: 0.7 }
        }}
      >
        {isLoading ? 'Loading...' : 'Add New Vehicle'}
      </Button>
      
      {/* Add Vehicle Dialog */}
      <LazyWrapper>
        <LazyAddVehicleDialog 
          open={dialogOpen} 
          onClose={handleCloseDialog} 
          onRefresh={onRefresh}
        />
      </LazyWrapper>
    </React.Fragment>
  );
}
