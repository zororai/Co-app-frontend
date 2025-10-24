 

"use client";
import * as React from 'react';
import type { Metadata } from 'next';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CircularProgress from '@mui/material/CircularProgress';
import { DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';

import dayjs from 'dayjs';



import { config } from '@/config';
import { CustomersTable } from '@/components/dashboard/companyhealth/companyreg-status-table';
import type { Customer } from '@/components/dashboard/companyhealth/companyreg-status-table';

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
        <Typography variant="body2" sx={{ mt: 2 }}>Loading pending company health data...</Typography>
      </Stack>
    );
  }
  const paginated = applyPagination(customers, page, rowsPerPage);
  return <CustomersTable count={paginated.length} page={page} rows={paginated} rowsPerPage={rowsPerPage} onRefresh={onRefresh} />;
}

function PushedBackTab({ customers, page, rowsPerPage, onRefresh, isLoading }: TabProps) {
  if (isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 200 }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>Loading pushed back company health data...</Typography>
      </Stack>
    );
  }
  const paginated = applyPagination(customers, page, rowsPerPage);
  return <CustomersTable count={paginated.length} page={page} rows={paginated} rowsPerPage={rowsPerPage} onRefresh={onRefresh} />;
}

function RejectedTab({ customers, page, rowsPerPage, onRefresh, isLoading }: TabProps) {
  if (isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 200 }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>Loading rejected company health data...</Typography>
      </Stack>
    );
  }
  const paginated = applyPagination(customers, page, rowsPerPage);
  return <CustomersTable count={paginated.length} page={page} rows={paginated} rowsPerPage={rowsPerPage} onRefresh={onRefresh} />;
}

function ApprovedTab({ customers, page, rowsPerPage, onRefresh, isLoading }: TabProps) {
  if (isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 200 }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>Loading approved company health data...</Typography>
      </Stack>
    );
  }
  const paginated = applyPagination(customers, page, rowsPerPage);
  return <CustomersTable count={paginated.length} page={page} rows={paginated} rowsPerPage={rowsPerPage} onRefresh={onRefresh} />;
}
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { RegMinerDialog } from '@/components/dashboard/customer/reg_miner';
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
  // Function to fetch and update company health data
  const fetchCompanyHealth = React.useCallback(async () => {
    try {
      const data = await authClient.fetchAllCompany();
      console.log('Fetched company health data from API:', data);
      // Normalize status values to match expected enum
      const normalizedData = data.map((customer: any) => ({
        ...customer,
        status: customer.status === "Approved" ? "APPROVED"
              : customer.status === "Pending" ? "PENDING"
              : customer.status === "Pushed Back" ? "PUSHED_BACK"
              : customer.status === "Rejected" ? "REJECTED"
              : customer.status // fallback to original if already correct
      }));
      console.log('Normalized data for table:', normalizedData);
      setCustomers(normalizedData);
    } catch (error) {
      console.error('API call failed:', error);
      setCustomers([]);
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  // Refresh function for child components
  const refreshData = React.useCallback(() => {
    fetchCompanyHealth();
  }, [fetchCompanyHealth]);

  // Fetch data on component mount
  React.useEffect(() => {
    fetchCompanyHealth();
  }, [fetchCompanyHealth]);

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

    // Filter customers based on current tab
    const currentPendingCustomers = customers.filter(c => c.status === 'PENDING');
    const currentPushedBackCustomers = customers.filter(c => c.status === 'PUSHED_BACK');
    const currentRejectedCustomers = customers.filter(c => c.status === 'REJECTED');
    const currentApprovedCustomers = customers.filter(c => c.status === 'APPROVED');

    // Determine which customers to export based on the current tab
    let filteredCustomers: Customer[] = [];
    switch (tab) {
    case 'PENDING': {
    filteredCustomers = currentPendingCustomers;
    break;
    }
    case 'PUSHED_BACK': {
    filteredCustomers = currentPushedBackCustomers;
    break;
    }
    case 'REJECTED': {
    filteredCustomers = currentRejectedCustomers;
    break;
    }
    case 'APPROVED': {
    filteredCustomers = approvedCustomers;
    break;
    }
    default:
    filteredCustomers = customers;
    break;
    }

    // Export all filtered customers, not just paginated ones
    const rows = filteredCustomers.map((c: any) => [
      c.id,
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
    a.download = `company-health-${tab.toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.append(a);

    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Company Registration Miner Status Health</Typography>
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
