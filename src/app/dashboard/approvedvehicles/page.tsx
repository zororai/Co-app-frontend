 

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
import { CustomersTable } from '@/components/dashboard/approvedvehicles/vehicle-operation-table';
import type { Customer } from '@/components/dashboard/approvedvehicles/vehicle-operation-table';

// Tab content components

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { RegMinerDialog } from '@/components/dashboard/customer/reg_miner';
import { authClient } from '@/lib/auth/client';
import { AddVehicleDialog } from '@/components/dashboard/vehicleonboarding/add-vehicle-dialog-box';

// Tab content components with loading states
interface TabProps {
  customers: Customer[];
  page: number;
  rowsPerPage: number;
  onRefresh: () => void;
  isLoading?: boolean;
}

function IdleTab({ customers, page, rowsPerPage, onRefresh, isLoading }: TabProps) {
  if (isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 200 }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>Loading idle vehicles...</Typography>
      </Stack>
    );
  }
  return <CustomersTable count={customers.length} page={page} rows={customers} rowsPerPage={rowsPerPage} onRefresh={onRefresh} operationalStatusFilter="idle" />;
}

function LoadingTab({ customers, page, rowsPerPage, onRefresh, isLoading }: TabProps) {
  if (isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 200 }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>Loading vehicles in loading status...</Typography>
      </Stack>
    );
  }
  return <CustomersTable count={customers.length} page={page} rows={customers} rowsPerPage={rowsPerPage} onRefresh={onRefresh} operationalStatusFilter="loading" />;
}

function LoadedTab({ customers, page, rowsPerPage, onRefresh, isLoading }: TabProps) {
  if (isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 200 }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>Loading loaded vehicles...</Typography>
      </Stack>
    );
  }
  return <CustomersTable count={customers.length} page={page} rows={customers} rowsPerPage={rowsPerPage} onRefresh={onRefresh} operationalStatusFilter="loaded" />;
}

function MaintainanceTab({ customers, page, rowsPerPage, onRefresh, isLoading }: TabProps) {
  if (isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 200 }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>Loading vehicles in maintenance...</Typography>
      </Stack>
    );
  }
  return <CustomersTable count={customers.length} page={page} rows={customers} rowsPerPage={rowsPerPage} onRefresh={onRefresh} operationalStatusFilter="Maintainance" />;
}

export default function Page(): React.JSX.Element {
  const page = 0;
  const rowsPerPage = 5;
  const [open, setOpen] = React.useState(false);
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [tab, setTab] = React.useState<'Idle' | 'Loading' | 'Loaded' | 'Maintainance'>('Idle');
  
  // Loading state for initial data fetch
  const [isInitialLoading, setIsInitialLoading] = React.useState(true);

  // Function to fetch and update approved vehicles data
  const fetchApprovedVehicles = React.useCallback(async () => {
    try {
      const data = await authClient.fetchApprovedVehicles(); // Use vehicle-specific API
      console.log('Fetched approved vehicles data from API:', data);
      // Normalize operational status values
      const normalizedData = data.map((vehicle: any) => ({
        ...vehicle,
        operationalStatus: vehicle.operationalStatus || vehicle.status || 'idle'
      }));
      console.log('Normalized approved vehicles data for table:', normalizedData);
      setCustomers(normalizedData);
    } catch (error) {
      console.error('API call failed:', error);
      // Fallback to pending customers if approved vehicles API doesn't exist
      try {
        const fallbackData = await authClient.fetchPendingCustomers();
        setCustomers(fallbackData as unknown as Customer[]);
      } catch (fallbackError) {
        console.error('Fallback API also failed:', fallbackError);
      }
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  // Function to refresh the approved vehicles data
  const refreshData = React.useCallback(() => {
    setRefreshKey(prevKey => prevKey + 1);
    fetchApprovedVehicles();
  }, [fetchApprovedVehicles]);

  // Render UI first, then fetch data with a small delay
  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchApprovedVehicles();
    }, 100);
    return () => clearTimeout(timer);
  }, [fetchApprovedVehicles]);

  // Filter customers by selected tab/status
  const idleCustomers = customers.filter(c => c.status === 'idle');
  const loadingCustomers = customers.filter(c => c.status === 'loading');
  const loadedCustomers = customers.filter(c => c.status === 'loaded');
  const maintainanceCustomers = customers.filter(c => c.status === 'maintainance');

  // Export table data as CSV
  const handleExport = () => {
    const headers = [
      'ID', 'Name', 'Surname', 'Nation ID', 'Address', 'Phone', 'Position', 'Cooperative', 'Num Shafts', 'Status', 'Reason', 'Attached Shaft'
    ];

    // Determine which customers to export based on the current tab
    let filteredCustomers: Customer[] = [];
    switch (tab) {
    case 'Idle': {
    filteredCustomers = idleCustomers;
    break;
    }
    case 'Loading': {
    filteredCustomers = loadingCustomers;
    break;
    }
    case 'Loaded': {
    filteredCustomers = loadedCustomers;
    break;
    }
    case 'Maintainance': { {
    filteredCustomers = maintainanceCustomers;
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
          <Typography variant="h4"> Approved Registered Vehicle </Typography>
          <Tabs
            value={tab}
            onChange={(_e, newValue) => setTab(newValue)}
            sx={{ mb: 2 }}
          >
            <Tab label="Idle" value="Idle" />
            <Tab label="Loading" value="Loading" />
            <Tab label="Loaded" value="Loaded" />
            <Tab label="Maintainance" value="Maintainance" />
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

      {tab === 'Idle' && (
        <IdleTab customers={idleCustomers} page={page} rowsPerPage={rowsPerPage} onRefresh={refreshData} isLoading={isInitialLoading} />
      )}
      {tab === 'Loading' && (
        <LoadingTab customers={loadingCustomers} page={page} rowsPerPage={rowsPerPage} onRefresh={refreshData} isLoading={isInitialLoading} />
      )}
      {tab === 'Loaded' && (
        <LoadedTab customers={loadedCustomers} page={page} rowsPerPage={rowsPerPage} onRefresh={refreshData} isLoading={isInitialLoading} />
      )}
      {tab === 'Maintainance' && (
        <MaintainanceTab customers={maintainanceCustomers} page={page} rowsPerPage={rowsPerPage} onRefresh={refreshData} isLoading={isInitialLoading} />
      )}

      <RegMinerDialog open={open} onClose={() => setOpen(false)} />
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
  const open = Boolean(anchorEl);

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
  
      
      {/* Add Vehicle Dialog */}
      <AddVehicleDialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        onRefresh={onRefresh}
      />
    </React.Fragment>
  );
}
