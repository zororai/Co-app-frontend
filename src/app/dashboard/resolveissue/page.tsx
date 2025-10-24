 

"use client";
import * as React from 'react';
import type { Metadata } from 'next';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';




import { config } from '@/config';
import { CustomersTable } from '@/components/dashboard/resolveissue/resolve-table';
import type { Customer } from '@/components/dashboard/resolveissue/resolve-table';
import { authClient } from '@/lib/auth/client';


export default function Page(): React.JSX.Element {
  const page = 0;
  const rowsPerPage = 5;
  const [open, setOpen] = React.useState(false);
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [refreshKey, setRefreshKey] = React.useState(0);



  // Function to refresh the miner data
  const refreshData = React.useCallback(() => {
    setRefreshKey(prevKey => prevKey + 1);
  }, []);

  // Filter customers (only Pending tab remains)
  const pendingCustomers = customers.filter(c => c.status === 'PENDING');

  // Export table data as CSV
  const handleExport = () => {
    const headers = [
      'Title', 'Type', 'Severity', 'Location', 'Reported By', 'Status'
    ];

    // Export all customers, not just paginated ones
    const rows = customers.map((c: any) => [
      c.incidentTitle || c.title || '',
      c.type || c.incidentType || '',
      c.severityLevel || c.severity || '',
      c.location || c.address || '',
      c.reportedBy || `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.emailAddress || '',
      c.status || ''
    ]);
    
    const csvContent = [headers, ...rows].map(r => r.map(String).map(x => `"${x.replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incident-resolution-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.append(a);

    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3} sx={{ alignItems: 'flex-start' }}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: 'center' }}>
            <Typography variant="h4" sx={{ flexGrow: 1 }}>Incident Resolution</Typography>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            
            <Button color="inherit" startIcon={<DownloadIcon fontSize="var(--icon-fontSize-md)" />} onClick={handleExport}>
              Export
            </Button>
          </Stack>
        </Stack>
      </Stack>

      {/* Incidents table */}
      <Box sx={{ mt: 2 }}>
        <CustomersTable key={refreshKey} rowsPerPage={5} onRefresh={refreshData} />
      </Box>

    </Stack>
  );
}

function applyPagination(rows: Customer[], page: number, rowsPerPage: number): Customer[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}

