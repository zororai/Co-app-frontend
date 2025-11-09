"use client";

import * as React from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';

import { LazyWrapper } from '@/components/common/LazyWrapper';
import { CustomersTable } from '@/components/dashboard/drivermanagement/driver-mana-table';
import { AddDriverDialog } from '@/components/dashboard/drivermanagement/add-driver-dialog-box';
import type { Customer } from '@/components/dashboard/drivermanagement/driver-mana-table';
import { authClient } from '@/lib/auth/client';

export default function Page(): React.JSX.Element {
  const page = 0;
  const rowsPerPage = 5;
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [refreshKey, setRefreshKey] = React.useState(0);
  
  // Loading state for initial data fetch
  const [isInitialLoading, setIsInitialLoading] = React.useState(true);

  // Function to fetch and update driver data
  const fetchDrivers = React.useCallback(async () => {
    try {
      const data = await authClient.fetchDrivers();
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

  // Export table data as CSV
  const handleExport = () => {
    const headers = [
      'ID', 'Name', 'Surname', 'Nation ID', 'Address', 'Phone', 'Position', 
      'Cooperative', 'Num Shafts', 'Status', 'Reason', 'Attached Shaft'
    ];

    // Export all customers
    const rows = customers.map((c: any) => [
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
    a.download = `driver-management-${new Date().toISOString().split('T')[0]}.csv`;
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

      {isInitialLoading ? (
        <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 200 }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ mt: 2 }}>Loading drivers...</Typography>
        </Stack>
      ) : (
        <LazyWrapper>
          <CustomersTable 
            count={customers.length} 
            page={page} 
            rows={customers} 
            rowsPerPage={rowsPerPage} 
            onRefresh={refreshData} 
            statusFilter={null}
          />
        </LazyWrapper>
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
