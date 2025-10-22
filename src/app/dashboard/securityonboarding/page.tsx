 

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
import { DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import dayjs from 'dayjs';
import Papa from 'papaparse';


import { config } from '@/config';
import { CustomersTable } from '@/components/dashboard/securityonboarding/security-status-table';
import type { Customer } from '@/components/dashboard/securityonboarding/security-status-table';

// Tab content components
function PendingTab({ customers, page, rowsPerPage, onRefresh }: { customers: Customer[], page: number, rowsPerPage: number, onRefresh: () => void }) {
  return <CustomersTable count={customers.length} page={page} rows={customers} rowsPerPage={rowsPerPage} onRefresh={onRefresh} statusFilter="PENDING" />;
}
function PushedBackTab({ customers, page, rowsPerPage, onRefresh }: { customers: Customer[], page: number, rowsPerPage: number, onRefresh: () => void }) {
  return <CustomersTable count={customers.length} page={page} rows={customers} rowsPerPage={rowsPerPage} onRefresh={onRefresh} statusFilter="PUSHED_BACK" />;
}
function RejectedTab({ customers, page, rowsPerPage, onRefresh }: { customers: Customer[], page: number, rowsPerPage: number, onRefresh: () => void }) {
  return <CustomersTable count={customers.length} page={page} rows={customers} rowsPerPage={rowsPerPage} onRefresh={onRefresh} statusFilter="REJECTED" />;
}
function ApprovedTab({ customers, page, rowsPerPage, onRefresh }: { customers: Customer[], page: number, rowsPerPage: number, onRefresh: () => void }) {
  return <CustomersTable count={customers.length} page={page} rows={customers} rowsPerPage={rowsPerPage} onRefresh={onRefresh} statusFilter="APPROVED" />;
}
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { RegMinerDialog } from '@/components/dashboard/customer/reg_miner';
import { authClient } from '@/lib/auth/client';
import { AddSecurityCompanyDialog } from '@/components/dashboard/securityonboarding/add-security-company-dialog';


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

  // Export table data as CSV (based on current tab filter)
  const handleExport = React.useCallback(() => {
    const headers = [
      'ID', 'Name', 'Surname', 'Nation ID', 'Address', 'Phone', 'Position', 'Cooperative', 'Num Shafts', 'Status', 'Reason', 'Attached Shaft'
    ];

    let filteredCustomers: Customer[] = [];
    switch (tab) {
      case 'PENDING':
        filteredCustomers = customers.filter(c => c.status === 'PENDING');
        break;
      case 'PUSHED_BACK':
        filteredCustomers = customers.filter(c => c.status === 'PUSHED_BACK');
        break;
      case 'REJECTED':
        filteredCustomers = customers.filter(c => c.status === 'REJECTED');
        break;
      case 'APPROVED':
        filteredCustomers = customers.filter(c => c.status === 'APPROVED');
        break;
    }

    const paginated = applyPagination(filteredCustomers, page, rowsPerPage);
    const rows = paginated.map(c => [
      (c as any).id,
      (c as any).name,
      (c as any).surname,
      (c as any).nationIdNumber,
      (c as any).address,
      (c as any).cellNumber,
      (c as any).position,
      (c as any).cooperativeName,
      (c as any).numShafts,
      (c as any).status,
      (c as any).reason,
      (c as any).attachedShaft ? 'Yes' : 'No'
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
  }, [customers, tab]);

  // Import CSV to preview into table state (and POST to backend)
  function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: async (results: { data: any[]; }) => {
        const importedData: Customer[] = results.data.map((row: any, idx: number) => ({
          id: row.id ?? `imported-${idx}`,
          name: row.name ?? '',
          surname: row.surname ?? '',
          nationIdNumber: row.nationIdNumber ?? '',
          nationId: row.nationId ?? '',
          address: row.address ?? '',
          cellNumber: row.cellNumber ?? '',
          phone: row.phone ?? row.cellNumber ?? '',
          email: row.email ?? '',
          status: row.status ?? '',
          reason: row.reason ?? '',
          registrationNumber: row.registrationNumber ?? '',
          registrationDate: row.registrationDate ?? '',
          position: row.position ?? '',
          teamMembers: row.teamMembers ? JSON.parse(row.teamMembers) : [],
          cooperativeDetails: row.cooperativeDetails ? JSON.parse(row.cooperativeDetails) : [],
          cooperativeName: row.cooperativeName ?? '',
          cooperative: row.cooperative ?? '',
          numShafts: row.numShafts ?? 0,
          attachedShaft: row.attachedShaft === 'Yes' || row.attachedShaft === true,
        }) as unknown as Customer);

        setCustomers(importedData);
        try {
          const response = await fetch('/api/miners/import', {
            method: 'POST',
            body: JSON.stringify(importedData),
            headers: { 'Content-Type': 'application/json' },
          });
          if (!response.ok) {
            // best-effort; log only
            console.error('Failed to import data:', await response.text());
          }
        } catch (err) {
          console.error('Error sending imported data:', err);
        }
      }
    });
  }

  React.useEffect(() => {
    (async () => {
      try {
        const data = await authClient.fetchPendingCustomers();
        console.log('Fetched data from API:', data);
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
        setCustomers(normalizedData);
      } catch (error) {
        console.error('API call failed, using mock data:', error);
        // Use mock data when API fails
      }
    })();
  }, []);

  // Filter customers by selected tab/status
  const pendingCustomers = customers.filter(c => c.status === 'PENDING');
  const pushedBackCustomers = customers.filter(c => c.status === 'PUSHED_BACK');
  const rejectedCustomers = customers.filter(c => c.status === 'REJECTED');
  const approvedCustomers = customers.filter(c => c.status === 'APPROVED');

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3} sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Security Company Onboarding </Typography>
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
              startIcon={<UploadIcon fontSize="var(--icon-fontSize-md)" />}
              component="label"
            >
              Import
              <input
                type="file"
                accept=".csv"
                hidden
                onChange={handleImport}
              />
            </Button>
            <Button color="inherit" startIcon={<DownloadIcon fontSize="var(--icon-fontSize-md)" />} onClick={handleExport}>
              Export
            </Button>
          </Stack>
        </Stack>
        {/* Top-right action button with menu */}
        <TopRightActions onRefresh={refreshData} />
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
        Add New Security Company
      </Button>
      
      {/* Add Security Company Dialog */}
      <AddSecurityCompanyDialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        onRefresh={onRefresh}
      />
    </React.Fragment>
  );
}
