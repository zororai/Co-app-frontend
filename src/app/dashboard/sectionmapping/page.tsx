 

"use client";
import * as React from 'react';
import type { Metadata } from 'next';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';

import dayjs from 'dayjs';
import Papa from 'papaparse';



import { config } from '@/config';
import { CustomersTable } from '@/components/dashboard/sectionmapping/selectsection-table';
import type { Customer } from '@/components/dashboard/sectionmapping/selectsection-table';
import { SectionDialog } from '@/components/dashboard/sectionmapping/selectsection-dialog';
import { authClient } from '@/lib/auth/client';


export default function Page(): React.JSX.Element {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [open, setOpen] = React.useState(false);
  const [customers, setCustomers] = React.useState<Customer[]>([]);

  const fetchSection = React.useCallback(async () => {
    const data = await authClient.fetchSectionDeactivatedPending();
    // Ensure each customer has all required properties
    const mappedData = data.map((c: any, idx: number) => ({
      ...c,
      cooperativeName: c.cooperativeName ?? '',
      cooperative: c.cooperative ?? '',
      sectionName: c.sectionName ?? c.name ?? `Section ${idx + 1}`,
      numberOfShaft: c.numberOfShaft ?? c.numShafts ?? 0
    }));
    setCustomers(mappedData);
  }, []);

  React.useEffect(() => {
    fetchSection();
  }, [fetchSection]);

  // Export table data as CSV
  const handleExport = () => {
    const headers = [
      'ID', 'Name', 'Surname', 'Nation ID', 'Address', 'Phone', 'Position', 'Cooperative', 'Num Shafts', 'Status', 'Reason', 'Attached Shaft'
    ];
    const rows = customers.map((c: Customer) => [
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
    const csvContent = [headers, ...rows].map(r => r.map(String).map((x: string) => `"${x.replaceAll('"', '""')}"`).join(',')).join('\n');
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
          sectionName: row.sectionName ?? `Section ${idx + 1}`, // Added missing property
          numberOfShaft: row.numberOfShaft ?? row.numShafts ?? 0, // Added missing property
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
          <Typography variant="h4">Section Site Mapping</Typography>
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
      </Stack>

      <CustomersTable
        count={customers.length}
        page={page}
        rows={customers}
        rowsPerPage={rowsPerPage}
        onPageChange={(newPage) => setPage(newPage)}
        onRowsPerPageChange={(newRowsPerPage) => {
          setRowsPerPage(newRowsPerPage);
          setPage(0);
        }}
      />

      <SectionDialog 
        open={open} 
        onClose={() => setOpen(false)} 
        onSuccess={() => {
          fetchSection(); // Refresh the data after successful creation
        }}
      />
    </Stack>
  );
}
