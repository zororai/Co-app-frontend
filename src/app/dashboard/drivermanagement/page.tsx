"use client";

import * as React from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import { DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';

import { LazyWrapper } from '@/components/common/LazyWrapper';
import { CustomersTable } from '@/components/dashboard/drivermanagement/driver-mana-table';
import { AddDriverDialog } from '@/components/dashboard/drivermanagement/add-driver-dialog-box';
import type { Customer } from '@/components/dashboard/drivermanagement/driver-mana-table';
import { authClient } from '@/lib/auth/client';

// Tab content components with loading states
interface TabProps {
  customers: Customer[];
  page: number;
  rowsPerPage: number;
  onRefresh: () => void;
  isLoading?: boolean;
}

const PendingTab = React.memo(({ customers, page, rowsPerPage, onRefresh, isLoading }: TabProps) => {
  if (isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 200 }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>Loading pending drivers...</Typography>
      </Stack>
    );
  }
  return (
    <LazyWrapper>
      <CustomersTable 
        count={customers.length} 
        page={page} 
        rows={customers} 
        rowsPerPage={rowsPerPage} 
        onRefresh={onRefresh} 
        statusFilter="PENDING" 
      />
    </LazyWrapper>
  );
});
PendingTab.displayName = 'PendingTab';

const PushedBackTab = React.memo(({ customers, page, rowsPerPage, onRefresh, isLoading }: TabProps) => {
  if (isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 200 }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>Loading pushed back drivers...</Typography>
      </Stack>
    );
  }
  return (
    <LazyWrapper>
      <CustomersTable 
        count={customers.length} 
        page={page} 
        rows={customers} 
        rowsPerPage={rowsPerPage} 
        onRefresh={onRefresh} 
        statusFilter="PUSHED_BACK" 
      />
    </LazyWrapper>
  );
});
PushedBackTab.displayName = 'PushedBackTab';

const RejectedTab = React.memo(({ customers, page, rowsPerPage, onRefresh, isLoading }: TabProps) => {
  if (isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 200 }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>Loading rejected drivers...</Typography>
      </Stack>
    );
  }
  return (
    <LazyWrapper>
      <CustomersTable 
        count={customers.length} 
        page={page} 
        rows={customers} 
        rowsPerPage={rowsPerPage} 
        onRefresh={onRefresh} 
        statusFilter="REJECTED" 
      />
    </LazyWrapper>
  );
});
RejectedTab.displayName = 'RejectedTab';

const ApprovedTab = React.memo(({ customers, page, rowsPerPage, onRefresh, isLoading }: TabProps) => {
  if (isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 200 }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>Loading approved drivers...</Typography>
      </Stack>
    );
  }
  return (
    <LazyWrapper>
      <CustomersTable 
        count={customers.length} 
        page={page} 
        rows={customers} 
        rowsPerPage={rowsPerPage} 
        onRefresh={onRefresh} 
        statusFilter="APPROVED" 
      />
    </LazyWrapper>
  );
});
ApprovedTab.displayName = 'ApprovedTab';

export default function Page(): React.JSX.Element {
  const page = 0;
  const rowsPerPage = 5;
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [tab, setTab] = React.useState<'PENDING' | 'PUSHED_BACK' | 'REJECTED' | 'APPROVED'>('PENDING');
  
  // Loading state for initial data fetch
  const [isInitialLoading, setIsInitialLoading] = React.useState(true);

  // Function to fetch and update driver data
  const fetchDrivers = React.useCallback(async () => {
    try {
      const data = await authClient.fetchDrivers(); // Assuming this method exists
      console.log('Fetched driver data from API:', data);
      // Normalize status values to match expected enum
      const normalizedData = data.map((driver: any) => ({
        ...driver,
        status: driver.status === "Approved" ? "APPROVED"
              : driver.status === "Rejected" ? "REJECTED"
              : driver.status === "Pending" ? "PENDING"
              : driver.status === "Pushed Back" ? "PUSHED_BACK"
              : driver.status // fallback to original if already correct
      }));
      console.log('Normalized driver data for table:', normalizedData);
      setCustomers(normalizedData);
    } catch (error) {
      console.error('API call failed:', error);
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  // Function to refresh the data
  const refreshData = React.useCallback(() => {
    setRefreshKey(prev => prev + 1);
    fetchDrivers();
  }, [fetchDrivers]);

  // Render UI first, then fetch data with a small delay
  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchDrivers();
    }, 100);
    return () => clearTimeout(timer);
  }, [fetchDrivers]);

  // Filter customers by selected tab/status
  const pendingCustomers = customers.filter(c => c.status === 'PENDING');
  const pushedBackCustomers = customers.filter(c => c.status === 'PUSHED_BACK');
  const rejectedCustomers = customers.filter(c => c.status === 'REJECTED');
  const approvedCustomers = customers.filter(c => c.status === 'APPROVED');

  // Export table data as CSV
  const handleExport = () => {
    const headers = [
      'ID', 'Name', 'Surname', 'Nation ID', 'Address', 'Phone', 'Position', 
      'Cooperative', 'Num Shafts', 'Status', 'Reason', 'Attached Shaft'
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

    // Export all filtered customers
    const rows = filteredCustomers.map((c: any) => [
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
    const csvContent = [headers, ...rows]
      .map(r => r.map(String).map(x => `"${x.replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `driver-management-${tab.toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.append(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3} sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Driver Management</Typography>
          <Tabs
            value={tab}
            onChange={(_e, newValue) => setTab(newValue)}
            sx={{ 
              mb: 2,
              '& .MuiTab-root': {
                color: 'text.secondary',
              },
              '& .MuiTab-root.Mui-selected': {
                color: 'secondary.main',
              },
              '& .MuiTabs-indicator': {
                backgroundColor: 'secondary.main',
              }
            }}
          >
            <Tab label="Pending" value="PENDING" />
            <Tab label="Pushed Back" value="PUSHED_BACK" />
            <Tab label="Rejected" value="REJECTED" />
            <Tab label="Approved" value="APPROVED" />
          </Tabs>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Button 
              color="inherit" 
              startIcon={<DownloadIcon fontSize="var(--icon-fontSize-md)" />} 
              onClick={handleExport}
            >
              Export
            </Button>
          </Stack>
        </Stack>
        {/* Top-right action button */}
        <TopRightActions onRefresh={refreshData} />
      </Stack>

      {tab === 'PENDING' && (
        <PendingTab 
          customers={pendingCustomers} 
          page={page} 
          rowsPerPage={rowsPerPage} 
          onRefresh={refreshData} 
          isLoading={isInitialLoading} 
        />
      )}
      {tab === 'PUSHED_BACK' && (
        <PushedBackTab 
          customers={pushedBackCustomers} 
          page={page} 
          rowsPerPage={rowsPerPage} 
          onRefresh={refreshData} 
          isLoading={isInitialLoading} 
        />
      )}
      {tab === 'REJECTED' && (
        <RejectedTab 
          customers={rejectedCustomers} 
          page={page} 
          rowsPerPage={rowsPerPage} 
          onRefresh={refreshData} 
          isLoading={isInitialLoading} 
        />
      )}
      {tab === 'APPROVED' && (
        <ApprovedTab 
          customers={approvedCustomers} 
          page={page} 
          rowsPerPage={rowsPerPage} 
          onRefresh={refreshData} 
          isLoading={isInitialLoading} 
        />
      )}
    </Stack>
  );
}

// Actions component placed at top-right
function TopRightActions({ onRefresh }: { onRefresh: () => void }): React.JSX.Element {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

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
     
      
      {/* Add Driver Dialog */}
      <LazyWrapper>
        <AddDriverDialog 
          open={dialogOpen} 
          onClose={handleCloseDialog} 
          onRefresh={onRefresh}
        />
      </LazyWrapper>
    </React.Fragment>
  );
}
