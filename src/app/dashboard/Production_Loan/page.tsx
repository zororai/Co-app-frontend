 

"use client";
import * as React from 'react';
import type { Metadata } from 'next';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CircularProgress from '@mui/material/CircularProgress';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';

import dayjs from 'dayjs';



import { config } from '@/config';
import { LazyWrapper } from '@/components/common/LazyWrapper';
import { LazyProductionLoanTable } from '@/components/lazy/LazyComponents';
import type { Customer } from '@/components/dashboard/Production_Loan/productionloan-table';

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
        <Typography variant="body2" sx={{ mt: 2 }}>Loading pending production loans...</Typography>
      </Stack>
    );
  }
  return (
    <LazyWrapper>
      <LazyProductionLoanTable count={customers.length} page={page} rows={customers} rowsPerPage={rowsPerPage} onRefresh={onRefresh} statusFilter="PENDING" />
    </LazyWrapper>
  );
}
function PushedBackTab({ customers, page, rowsPerPage, onRefresh }: { customers: Customer[], page: number, rowsPerPage: number, onRefresh: () => void }) {
  return (
    <LazyWrapper>
      <LazyProductionLoanTable count={customers.length} page={page} rows={customers} rowsPerPage={rowsPerPage} onRefresh={onRefresh} statusFilter="PUSHED_BACK" />
    </LazyWrapper>
  );
}
function RejectedTab({ customers, page, rowsPerPage, onRefresh }: { customers: Customer[], page: number, rowsPerPage: number, onRefresh: () => void }) {
  return (
    <LazyWrapper>
      <LazyProductionLoanTable count={customers.length} page={page} rows={customers} rowsPerPage={rowsPerPage} onRefresh={onRefresh} statusFilter="REJECTED" />
    </LazyWrapper>
  );
}
function ApprovedTab({ customers, page, rowsPerPage, onRefresh }: { customers: Customer[], page: number, rowsPerPage: number, onRefresh: () => void }) {
  return (
    <LazyWrapper>
      <LazyProductionLoanTable count={customers.length} page={page} rows={customers} rowsPerPage={rowsPerPage} onRefresh={onRefresh} statusFilter="APPROVED" />
    </LazyWrapper>
  );
}
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { LazyRegMinerDialog, LazyAddProductionLoanDialog } from '@/components/lazy/LazyComponents';
import { authClient } from '@/lib/auth/client';


export default function Page(): React.JSX.Element {
  const page = 0;
  const rowsPerPage = 5;
  const [open, setOpen] = React.useState(false);
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [tab, setTab] = React.useState<'PENDING' | 'PUSHED_BACK' | 'REJECTED' | 'APPROVED'>('PENDING');

  // Function to refresh the miner data
  const refreshData = React.useCallback(() => {
    setRefreshKey(prevKey => prevKey + 1);
  }, []);



  // Filter customers by selected tab/status
  const pendingCustomers = customers.filter(c => c.status === 'PENDING');
  const pushedBackCustomers = customers.filter(c => c.status === 'PUSHED_BACK');
  const rejectedCustomers = customers.filter(c => c.status === 'REJECTED');
  const approvedCustomers = customers.filter(c => c.status === 'APPROVED');

  // Export table data as CSV
  const handleExport = () => {
    const headers = [
      'Loan Name', 'Payment Method', 'Amount/Grams', 'Purpose', 'Status', 'Reason'
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
      c.loanName || '',
      c.paymentMethod || '',
      c.amountOrGrams || 0,
      c.purpose || '',
      c.status || '',
      c.reason || ''
    ]);
    
    const csvContent = [headers, ...rows].map(r => r.map(String).map(x => `"${x.replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `production-loan-${tab.toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.append(a);

    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3} sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Production Loan </Typography>
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
        <TopRightActions refreshData={refreshData} />
      </Stack>

      {tab === 'PENDING' && (
        <div key={`pending-${refreshKey}`}>
          <PendingTab customers={pendingCustomers} page={page} rowsPerPage={rowsPerPage} onRefresh={refreshData} />
        </div>
      )}
      {tab === 'PUSHED_BACK' && (
        <div key={`pushed-${refreshKey}`}>
          <PushedBackTab customers={pushedBackCustomers} page={page} rowsPerPage={rowsPerPage} onRefresh={refreshData} />
        </div>
      )}
      {tab === 'REJECTED' && (
        <div key={`rejected-${refreshKey}`}>
          <RejectedTab customers={rejectedCustomers} page={page} rowsPerPage={rowsPerPage} onRefresh={refreshData} />
        </div>
      )}
      {tab === 'APPROVED' && (
        <div key={`approved-${refreshKey}`}>
          <ApprovedTab customers={approvedCustomers} page={page} rowsPerPage={rowsPerPage} onRefresh={refreshData} />
        </div>
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
function TopRightActions({ refreshData }: { refreshData: () => void }): React.JSX.Element {
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
            <Button
        variant="contained"
        startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
        onClick={handleOpenDialog}
        sx={{
          bgcolor: '#5f4bfa',
          color: '#fff',
          '&:hover': { bgcolor: '#4aa856' }
        }}
      >
        Add New Production Loan
      </Button>
      {/* Add Production Loan Dialog */}
      <LazyWrapper>
        <LazyAddProductionLoanDialog 
          open={dialogOpen} 
          onClose={handleCloseDialog} 
          onRefresh={refreshData}
        />
      </LazyWrapper>
    </React.Fragment>
  );
}
