  

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
import Papa from 'papaparse';



import { config } from '@/config';
import { CustomersTable } from '@/components/dashboard/shaftassing/Shaftassigncustomers-table';
import type { Customer } from '@/components/dashboard/shaftassing/Shaftassigncustomers-table';
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
  
  // Loading state for initial data fetch
  const [isInitialLoading, setIsInitialLoading] = React.useState(true);

  // Function to fetch and update shaft assignment data
  const fetchShaftAssignments = React.useCallback(async () => {
    try {
      const data = await authClient.fetchApprovedminer();
      console.log('Fetched shaft assignment data from API:', data);
      // Ensure each customer has cooperativeName and cooperative properties
      const normalizedData = data.map((customer: any) => ({
        ...customer,
        cooperativeName: customer.cooperativeName ?? '',
        cooperative: customer.cooperative ?? ''
      }));
      console.log('Normalized shaft assignment data for table:', normalizedData);
      setCustomers(normalizedData);
    } catch (error) {
      console.error('Error fetching shaft assignments:', error);
      setCustomers([]);
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  // Render UI first, then fetch data with a small delay
  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchShaftAssignments();
    }, 100);
    return () => clearTimeout(timer);
  }, [fetchShaftAssignments]);

  const paginatedCustomers = applyPagination(customers, page, rowsPerPage);

  // Export table data as CSV
  const handleExport = () => {
    const headers = [
      'Registration Number', 'Name', 'Surname', 'Name Of Cooperative', 'No.Of.Shafts', 'Status'
    ];
    
    // Export all customers, not just paginated ones
    const rows = customers.map((c: any) => [
      c.registrationNumber || '',
      c.name || '',
      c.surname || '',
      c.cooperativename || '',
      c.shaftnumber || '',
      c.status || ''
    ]);
    
    const csvContent = [headers, ...rows].map(r => r.map(String).map(x => `"${x.replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shaft-assignments-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.append(a);

    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
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
          <Typography variant="h4">Assign Miners To Shaft</Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            
            <Button color="inherit" startIcon={<DownloadIcon fontSize="var(--icon-fontSize-md)" />} onClick={handleExport}>
              Export
            </Button>
          </Stack>
        </Stack>
      
      </Stack>

      {isInitialLoading ? (
        <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 300 }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ mt: 2 }}>Loading shaft assignments...</Typography>
        </Stack>
      ) : (
        <CustomersTable
          count={paginatedCustomers.length}
          page={page}
          rows={paginatedCustomers}
          rowsPerPage={rowsPerPage}
        />
      )}

      <RegMinerDialog open={open} onClose={() => setOpen(false)} />
    </Stack>
  );
}

function applyPagination(rows: Customer[], page: number, rowsPerPage: number): Customer[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}
