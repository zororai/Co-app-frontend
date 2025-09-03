 

"use client";
import * as React from 'react';
import type { Metadata } from 'next';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import dayjs from 'dayjs';
import Papa from 'papaparse';


import { config } from '@/config';
import { CustomersTable } from '@/components/dashboard/companyhealth/companyreg-status-table';
import type { Customer } from '@/components/dashboard/companyhealth/companyreg-status-table';

// Tab content components
function PendingTab({ customers, page, rowsPerPage, onRefresh }: { customers: Customer[], page: number, rowsPerPage: number, onRefresh: () => void }) {
  const paginated = applyPagination(customers, page, rowsPerPage);
  return <CustomersTable count={paginated.length} page={page} rows={paginated} rowsPerPage={rowsPerPage} onRefresh={onRefresh} />;
}
function PushedBackTab({ customers, page, rowsPerPage, onRefresh }: { customers: Customer[], page: number, rowsPerPage: number, onRefresh: () => void }) {
  const paginated = applyPagination(customers, page, rowsPerPage);
  return <CustomersTable count={paginated.length} page={page} rows={paginated} rowsPerPage={rowsPerPage} onRefresh={onRefresh} />;
}
function RejectedTab({ customers, page, rowsPerPage, onRefresh }: { customers: Customer[], page: number, rowsPerPage: number, onRefresh: () => void }) {
  const paginated = applyPagination(customers, page, rowsPerPage);
  return <CustomersTable count={paginated.length} page={page} rows={paginated} rowsPerPage={rowsPerPage} onRefresh={onRefresh} />;
}
function ApprovedTab({ customers, page, rowsPerPage, onRefresh }: { customers: Customer[], page: number, rowsPerPage: number, onRefresh: () => void }) {
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

  // Function to refresh the miner data
  const refreshData = React.useCallback(() => {
    setRefreshKey(prevKey => prevKey + 1);
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        const data = await authClient.fetchAllCompany();
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
        const mockData = [
          {
            id: 'mock-1',
            name: 'John',
            surname: 'Doe',
            nationIdNumber: '1234567890123',
            nationId: '1234567890123',
            address: '123 Main St, City',
            cellNumber: '+27123456789',
            phone: '+27123456789',
            email: 'john.doe@example.com',
            status: 'PENDING',
            reason: 'Under review',
            registrationNumber: 'REG001',
            registrationDate: '2024-01-15',
            position: 'Miner',
            teamMembers: [],
            cooperativeDetails: [],
            cooperativeName: 'Sample Cooperative',
            cooperative: 'Sample Cooperative',
            numShafts: 2,
            attachedShaft: true
          },
          {
            id: 'mock-2',
            name: 'Jane',
            surname: 'Smith',
            nationIdNumber: '9876543210987',
            nationId: '9876543210987',
            address: '456 Oak Ave, Town',
            cellNumber: '+27987654321',
            phone: '+27987654321',
            email: 'jane.smith@example.com',
            status: 'APPROVED',
            reason: 'All requirements met',
            registrationNumber: 'REG002',
            registrationDate: '2024-01-20',
            position: 'Team Leader',
            teamMembers: [],
            cooperativeDetails: [],
            cooperativeName: 'Another Cooperative',
            cooperative: 'Another Cooperative',
            numShafts: 1,
            attachedShaft: false
          },
          {
            id: 'mock-3',
            name: 'Push',
            surname: 'Back',
            nationIdNumber: '1111111111111',
            nationId: '1111111111111',
            address: '789 Pine Rd, Village',
            cellNumber: '+27111111111',
            phone: '+27111111111',
            email: 'push.back@example.com',
            status: 'PUSHED_BACK',
            reason: 'Need more info',
            registrationNumber: 'REG003',
            registrationDate: '2024-01-25',
            position: 'Miner',
            teamMembers: [],
            cooperativeDetails: [],
            cooperativeName: 'PushBack Cooperative',
            cooperative: 'PushBack Cooperative',
            numShafts: 1,
            attachedShaft: false
          },
          {
            id: 'mock-4',
            name: 'Rick',
            surname: 'Rejected',
            nationIdNumber: '2222222222222',
            nationId: '2222222222222',
            address: '101 Maple St, Hamlet',
            cellNumber: '+27222222222',
            phone: '+27222222222',
            email: 'rick.rejected@example.com',
            status: 'REJECTED',
            reason: 'Incomplete docs',
            registrationNumber: 'REG004',
            registrationDate: '2024-01-30',
            position: 'Miner',
            teamMembers: [],
            cooperativeDetails: [],
            cooperativeName: 'Rejected Cooperative',
            cooperative: 'Rejected Cooperative',
            numShafts: 1,
            attachedShaft: false
          }
        ];
        setCustomers(mockData as Customer[]);
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
      </Stack>

      {tab === 'PENDING' && (
        <PendingTab customers={pendingCustomers} page={page} rowsPerPage={rowsPerPage} onRefresh={refreshData} />
      )}
      {tab === 'PUSHED_BACK' && (
        <PushedBackTab customers={pushedBackCustomers} page={page} rowsPerPage={rowsPerPage} onRefresh={refreshData} />
      )}
      {tab === 'REJECTED' && (
        <RejectedTab customers={rejectedCustomers} page={page} rowsPerPage={rowsPerPage} onRefresh={refreshData} />
      )}
      {tab === 'APPROVED' && (
        <ApprovedTab customers={approvedCustomers} page={page} rowsPerPage={rowsPerPage} onRefresh={refreshData} />
      )}

      <RegMinerDialog open={open} onClose={() => setOpen(false)} />
    </Stack>
  );
}

function applyPagination(rows: Customer[], page: number, rowsPerPage: number): Customer[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}
