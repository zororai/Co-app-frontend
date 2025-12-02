 

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
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import { DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';

import dayjs from 'dayjs';



import { config } from '@/config';
import { LazyWrapper } from '@/components/common/LazyWrapper';
import { LazyOreManagementTable } from '@/components/lazy/LazyComponents';
import type { Customer } from '@/components/dashboard/oremanagement/oremanage-table';

// Tab content components
function PendingTab({ customers, page, rowsPerPage, onRefresh, refreshKey }: { customers: Customer[], page: number, rowsPerPage: number, onRefresh: () => void, refreshKey: number }) {
  return (
    <LazyWrapper>
      <LazyOreManagementTable key={refreshKey} count={customers.length} page={page} rows={customers} rowsPerPage={rowsPerPage} onRefresh={onRefresh} statusFilter="PENDING" />
    </LazyWrapper>
  );
}
function PushedBackTab({ customers, page, rowsPerPage, onRefresh, refreshKey }: { customers: Customer[], page: number, rowsPerPage: number, onRefresh: () => void, refreshKey: number }) {
  return (
    <LazyWrapper>
      <LazyOreManagementTable key={refreshKey} count={customers.length} page={page} rows={customers} rowsPerPage={rowsPerPage} onRefresh={onRefresh} statusFilter="PUSHED_BACK" />
    </LazyWrapper>
  );
}
function RejectedTab({ customers, page, rowsPerPage, onRefresh, refreshKey }: { customers: Customer[], page: number, rowsPerPage: number, onRefresh: () => void, refreshKey: number }) {
  return (
    <LazyWrapper>
      <LazyOreManagementTable key={refreshKey} count={customers.length} page={page} rows={customers} rowsPerPage={rowsPerPage} onRefresh={onRefresh} statusFilter="REJECTED" />
    </LazyWrapper>
  );
}
function ApprovedTab({ customers, page, rowsPerPage, onRefresh, refreshKey }: { customers: Customer[], page: number, rowsPerPage: number, onRefresh: () => void, refreshKey: number }) {
  return (
    <LazyWrapper>
      <LazyOreManagementTable key={refreshKey} count={customers.length} page={page} rows={customers} rowsPerPage={rowsPerPage} onRefresh={onRefresh} statusFilter="APPROVED" />
    </LazyWrapper>
  );
}

import { useSearchParams } from 'next/navigation';
import { LazyRegMinerDialog, LazyAddOreManagementDialog } from '@/components/lazy/LazyComponents';
import { authClient } from '@/lib/auth/client';
import { generateSampleOreData } from '@/utils/generateSampleOreData';


export default function Page(): React.JSX.Element {
  const searchParams = useSearchParams();
  const page = 0;
  const rowsPerPage = 5;
  const [open, setOpen] = React.useState(false);
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [tab, setTab] = React.useState<'PENDING' | 'PUSHED_BACK' | 'REJECTED' | 'APPROVED'>('PENDING');
  const [sampleOreDialogOpen, setSampleOreDialogOpen] = React.useState(searchParams?.get('generateSample') === 'true');

  // Function to refresh the miner data
  const refreshData = React.useCallback(() => {
    setRefreshKey(prevKey => prevKey + 1);
  }, []);

  // Listen for sample ore generation event
  React.useEffect(() => {
    const handleOpenSampleOreDialog = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.action === 'generate-sample-ore') {
        setSampleOreDialogOpen(true);
      }
    };

    window.addEventListener('openOreGeneratorDialog', handleOpenSampleOreDialog);
    return () => window.removeEventListener('openOreGeneratorDialog', handleOpenSampleOreDialog);
  }, []);

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
    case 'APPROVED': {
    filteredCustomers = approvedCustomers;
    break;
    }
    }

    // Export all filtered customers, not just paginated ones
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
    const csvContent = [headers, ...rows].map(r => r.map(String).map(x => `"${x.replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ore-management-${tab.toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.append(a);

    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3} sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Ore Registration</Typography>
          
          {/* Tabs with styling guide compliance */}
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
          
          {/* Export button */}
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Button 
              color="inherit" 
              startIcon={<DownloadIcon fontSize="var(--icon-fontSize-md)" />} 
              onClick={handleExport}
              sx={{
                color: 'secondary.main',
                '&:hover': { bgcolor: 'rgba(50, 56, 62, 0.08)' }
              }}
            >
              Export
            </Button>
          </Stack>
        </Stack>
        
        {/* Top-right action button */}
        <TopRightActions onRefresh={refreshData} />
      </Stack>

      {tab === 'PENDING' && (
        <PendingTab customers={pendingCustomers} page={page} rowsPerPage={rowsPerPage} onRefresh={refreshData} refreshKey={refreshKey} />
      )}
      {tab === 'PUSHED_BACK' && (
        <PushedBackTab customers={pushedBackCustomers} page={page} rowsPerPage={rowsPerPage} onRefresh={refreshData} refreshKey={refreshKey} />
      )}
      {tab === 'REJECTED' && (
        <RejectedTab customers={rejectedCustomers} page={page} rowsPerPage={rowsPerPage} onRefresh={refreshData} refreshKey={refreshKey} />
      )}
      {tab === 'APPROVED' && (
        <ApprovedTab customers={approvedCustomers} page={page} rowsPerPage={rowsPerPage} onRefresh={refreshData} refreshKey={refreshKey} />
      )}

      <LazyWrapper>
        <LazyRegMinerDialog open={open} onClose={() => setOpen(false)} />
      </LazyWrapper>
      
      {/* Sample Ore Dialog - displays sample data info */}
      <Dialog 
        open={sampleOreDialogOpen} 
        onClose={() => setSampleOreDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          bgcolor: 'secondary.main',
          color: 'white'
        }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600, color: 'white' }}>
            Generate Sample Ore Data
          </Typography>
          <IconButton 
            edge="end" 
            color="inherit" 
            onClick={() => setSampleOreDialogOpen(false)}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body1" paragraph>
            This will create 120 sample ore records with the following specifications:
          </Typography>
          <Box component="ul" sx={{ pl: 3, mb: 2 }}>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              10 records per month for all 12 months of 2025
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              Weights ranging from 35,000 to 45,000 kg
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              Random dates distributed throughout each month
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              Default status: Pending
            </Typography>
            <Typography component="li" variant="body2">
              Processing tax: 5%
            </Typography>
          </Box>
          <Alert severity="info" sx={{ mb: 2 }}>
            The records will be created in batches and this may take a minute or two depending on your connection.
          </Alert>
        </DialogContent>
        <Box sx={{ px: 3, pb: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button 
            variant="outlined"
            onClick={() => setSampleOreDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={() => {
              setSampleOreDialogOpen(false);
              setOpen(true);
            }}
            sx={{
              bgcolor: 'secondary.main',
              color: 'white',
              '&:hover': { bgcolor: 'secondary.dark' }
            }}
          >
            Open Add Ore Dialog
          </Button>
        </Box>
      </Dialog>
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
        Add Ore for Processing 
      </Button>
      
      {/* Add Ore Dialog */}
      <LazyWrapper>
        <LazyAddOreManagementDialog 
          open={dialogOpen} 
          onClose={handleCloseDialog} 
          onRefresh={onRefresh}
        />
      </LazyWrapper>
    </React.Fragment>
  );
}
