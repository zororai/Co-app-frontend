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
import { CustomersTable } from '@/components/dashboard/ShaftLoanStatus/shaftloan-table';
import type { Customer } from '@/components/dashboard/ShaftLoanStatus/shaftloan-table';

// 
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { RegMinerDialog } from '@/components/dashboard/customer/reg_miner';
import { authClient } from '@/lib/auth/client';
import { AddDriverDialog } from '@/components/dashboard/driveronboarding/add-driver-dialog-box';


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

  // Export table data as CSV
  const handleExport = () => {
    const headers = [
      'ID', 'Name', 'Surname', 'Nation ID', 'Address', 'Phone', 'Position', 'Cooperative', 'Num Shafts', 'Status', 'Reason', 'Attached Shaft'
    ];

    // Determine which customers to export based on the current tab
    let filteredCustomers: Customer[] = [];
    if (tab === 'PENDING') filteredCustomers = pendingCustomers;
    else if (tab === 'PUSHED_BACK') filteredCustomers = pushedBackCustomers;
    else if (tab === 'REJECTED') filteredCustomers = rejectedCustomers;
    else if (tab === 'APPROVED') filteredCustomers = approvedCustomers;

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
    const csvContent = [headers, ...rows].map(r => r.map(String).map(x => `"${x.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customers.csv';
    document.body.appendChild(a);

    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  function handleImport(event: React.ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: async (results: { data: any[]; }) => {
        // Map CSV rows to your structure
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
          cooperative: row.cooperative ?? '', // Added missing property
          numShafts: row.numShafts ?? 0,
          attachedShaft: row.attachedShaft === 'Yes' || row.attachedShaft === true,
        }));
        console.log('Imported CSV data:', importedData);
        setCustomers(importedData); // Update table state
        // Send importedData to backend
        try {
          const response = await fetch('/api/miners/import', {
            method: 'POST',
            body: JSON.stringify(importedData),
            headers: {
              'Content-Type': 'application/json',
            },
          });
          if (!response.ok) {
            console.error('Failed to import data:', await response.text());
          } else {
            console.log('Successfully imported data to backend');
          }
        } catch (error) {
          console.error('Error sending imported data:', error);
        }
      }
    });
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3} sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Shaft Loan Status </Typography>
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

      {/* Render a single CustomersTable; it manages its own data and filters */}
      <CustomersTable page={page} rowsPerPage={rowsPerPage} />

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
    window.location.href = path;
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  return (
    <React.Fragment>
    
      
      {/* Add Security Company Dialog */}
      <AddDriverDialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        onRefresh={onRefresh}
      />
    </React.Fragment>
  );
}
