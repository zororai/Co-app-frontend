 

"use client";
import * as React from 'react';
import type { Metadata } from 'next';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';

import dayjs from 'dayjs';



import { config } from '@/config';
import { LazyWrapper } from '@/components/common/LazyWrapper';
import { LazyCustomersMainTable, LazyRegMinerDialog } from '@/components/lazy/LazyComponents';
import type { Customer } from '@/components/dashboard/customer/customers-table';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { authClient } from '@/lib/auth/client';


export default function Page(): React.JSX.Element {
  const page = 0;
  const rowsPerPage = 5;
  const [open, setOpen] = React.useState(false);
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  
  // Loading state for initial data fetch
  const [isInitialLoading, setIsInitialLoading] = React.useState(true);

  // Function to fetch and update customer data
  const fetchCustomers = React.useCallback(async () => {
    try {
      const data = await authClient.fetchCustomers();
      console.log('Fetched customer data from API:', data);
      setCustomers(data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      setCustomers([]);
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  // Function to refresh the customer data
  const refreshCustomers = React.useCallback(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Render UI first, then fetch data with a small delay
  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 100);
    return () => clearTimeout(timer);
  }, [fetchCustomers]);

  // Memoized pagination to prevent unnecessary recalculation
  const paginatedCustomers = React.useMemo(() => 
    applyPagination(customers, page, rowsPerPage), [customers, page, rowsPerPage]);
  // Memoized export function
  const handleExport = React.useCallback(() => {
    const headers = [
      'ID', 'Name', 'Surname', 'Nation ID', 'Address', 'Phone', 'Position', 'Cooperative', 'Num Shafts', 'Status', 'Reason', 'Attached Shaft'
    ];
    const rows = customers.map((c: any) => [
      c.id || '',
      c.name || '',
      c.surname || '',
      c.nationIdNumber || '',
      c.address || '',
      c.cellNumber || '',
      c.position || '',
      c.cooperativeName || '',
      c.numShafts || '',
      c.status || '',
      c.reason || '',
      c.attachedShaft ? 'Yes' : 'No'
    ]);
    const csvContent = [headers, ...rows].map(r => r.map(String).map(x => `"${x.replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.append(a);

    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [customers]);


  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Syndicate Lasher Management</Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            
            <Button color="inherit" startIcon={<DownloadIcon fontSize="var(--icon-fontSize-md)" />} onClick={handleExport}>
              Export
            </Button>
          </Stack>
        </Stack>
        <div>
     
        </div>
      </Stack>

      {isInitialLoading ? (
        <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 300 }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ mt: 2 }}>Loading customers...</Typography>
        </Stack>
      ) : (
        <LazyWrapper>
          <LazyCustomersMainTable
            count={customers.length}
            page={page}
            rows={customers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
            rowsPerPage={rowsPerPage}
          />
        </LazyWrapper>
      )}

      <LazyRegMinerDialog open={open} onClose={() => setOpen(false)} onRefresh={refreshCustomers} />
    </Stack>
  );
}

function applyPagination(rows: Customer[], page: number, rowsPerPage: number): Customer[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}
