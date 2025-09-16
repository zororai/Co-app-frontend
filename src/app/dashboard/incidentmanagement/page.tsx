 

"use client";
import * as React from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import Papa from 'papaparse';


import { config } from '@/config';
import { CustomersTable } from '@/components/dashboard/incidentmanagement/incidentmanagement';
import type { Customer } from '@/components/dashboard/incidentmanagement/incidentmanagement';

// Tab content components
function PendingTab({ customers, page, rowsPerPage, onRefresh, refreshKey }: { customers: Customer[], page: number, rowsPerPage: number, onRefresh: () => void, refreshKey: number }) {
  return <CustomersTable key={refreshKey} count={customers.length} page={page} rows={customers} rowsPerPage={rowsPerPage} onRefresh={onRefresh} statusFilter="PENDING" />;
}
function PushedBackTab({ customers, page, rowsPerPage, onRefresh, refreshKey }: { customers: Customer[], page: number, rowsPerPage: number, onRefresh: () => void, refreshKey: number }) {
  return <CustomersTable key={refreshKey} count={customers.length} page={page} rows={customers} rowsPerPage={rowsPerPage} onRefresh={onRefresh} statusFilter="PUSHED_BACK" />;
}
function RejectedTab({ customers, page, rowsPerPage, onRefresh, refreshKey }: { customers: Customer[], page: number, rowsPerPage: number, onRefresh: () => void, refreshKey: number }) {
  return <CustomersTable key={refreshKey} count={customers.length} page={page} rows={customers} rowsPerPage={rowsPerPage} onRefresh={onRefresh} statusFilter="REJECTED" />;
}
function ApprovedTab({ customers, page, rowsPerPage, onRefresh, refreshKey }: { customers: Customer[], page: number, rowsPerPage: number, onRefresh: () => void, refreshKey: number }) {
  return <CustomersTable key={refreshKey} count={customers.length} page={page} rows={customers} rowsPerPage={rowsPerPage} onRefresh={onRefresh} statusFilter="APPROVED" />;
}

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { RegMinerDialog } from '@/components/dashboard/customer/reg_miner';
import { authClient } from '@/lib/auth/client';
import { AddOreDialog } from '@/components/dashboard/incidentmanagement/add-incident-dialog';


export default function Page(): React.JSX.Element {
  const page = 0;
  const rowsPerPage = 5;
  const [open, setOpen] = React.useState(false);
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [tab, setTab] = React.useState<'PENDING' | 'PUSHED_BACK' | 'REJECTED' | 'APPROVED'>('PENDING');
  const [incidents, setIncidents] = React.useState<any[]>([]);

  // Mock incidents for summary cards (aligned with table mock data)
  React.useEffect(() => {
    const mockIncidents = [
      {
        id: 'INC-001',
        title: 'Slip hazard near processing plant',
        type: 'HAZARD',
        severity: 'MEDIUM',
        location: 'Processing Plant - Area B',
        reportedBy: 'John Worker',
        date: '2024-06-25',
        status: 'INVESTIGATING'
      },
      {
        id: 'INC-002',
        title: 'Minor cut injury',
        type: 'INJURY',
        severity: 'LOW',
        location: 'Workshop',
        reportedBy: 'Mike Mechanic',
        date: '2024-06-24',
        status: 'RESOLVED'
      }
    ];
    setIncidents(mockIncidents);
  }, []);

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
          if (response.ok) {
            console.log('Successfully imported data to backend');
          } else {
            console.error('Failed to import data:', await response.text());
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
          <Typography variant="h4">Incident Management</Typography>

          <Typography variant="body2" color="text.secondary">
            Record and track safety incidents, hazards, and environmental risks
          </Typography>
          <Box sx={{ px: 2, pb: 2 }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(4, 1fr)'
                },
                gap: 2
              }}
            >
              <Card sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">Total Incidents</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>{incidents.length}</Typography>
                <Typography variant="caption" color="text.secondary">This month</Typography>
              </Card>
              <Card sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">Open Cases</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>{incidents.filter(u => u.status !== 'RESOLVED').length}</Typography>
                <Typography variant="caption" color="text.secondary">Require attention</Typography>
              </Card>
              <Card sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">High Severity</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>{incidents.filter(u => u.severity === 'HIGH').length}</Typography>
                <Typography variant="caption" color="text.secondary">Critical incidents</Typography>
              </Card>
              <Card sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">Resolved</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>{incidents.filter(u => u.status === 'RESOLVED').length}</Typography>
                <Typography variant="caption" color="text.secondary">Completed cases</Typography>
              </Card>
            </Box>
          </Box>
        </Stack>
        {/* Top-right action button with menu */}
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
          bgcolor: '#5f4bfa',
          color: '#fff',
          '&:hover': { bgcolor: '#4aa856' }
        }}
      >
        Record Incident 
      </Button>
      
      {/* Add Ore Dialog */}
      <AddOreDialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        onRefresh={onRefresh}
      />
    </React.Fragment>
  );
}
