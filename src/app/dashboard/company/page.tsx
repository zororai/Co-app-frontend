 

"use client";
import * as React from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';




import { config } from '@/config';
// Update the import paths below to the correct relative or alias path where CustomersTable and Customer are defined.
// For example, if the file is actually named 'customersCompanyTable.tsx' in the same folder, use:
// Update the path below to the correct relative path if needed, e.g.:
// import { CustomersTable1 } from '../../components/dashboard/Companyreg/customersCompanyTable';
// or use the correct alias if configured:
// Update the path below to the correct location of customersCompanyTable.tsx
// Example: If the file is in 'src/components/dashboard/Companyreg/customersCompanyTable.tsx', use the following:

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { RegMinerDialog } from '@/components/dashboard/customer/regcompany_miner';
import { authClient } from '@/lib/auth/client';
import { Company, CompanyTable } from '@/components/dashboard/customer/company-table';
import Papa from 'papaparse';


export default function Page(): React.JSX.Element {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [open, setOpen] = React.useState(false);
  const [companies, setCompanies] = React.useState<Company[]>([]);
  
  // Loading state for initial data fetch
  const [isInitialLoading, setIsInitialLoading] = React.useState(true);

  // Function to fetch and update company data
  const fetchCompanies = React.useCallback(async () => {
    try {
      const data = await authClient.fetchCompaniesFromEndpoint();
      console.log('Fetched company data from API:', data);
      setCompanies(data);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setCompanies([]);
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  // Render UI first, then fetch data with a small delay
  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchCompanies();
    }, 100);
    return () => clearTimeout(timer);
  }, [fetchCompanies]);

  const handlePageChange = (_: any, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedCompanies = React.useMemo(() => {
    return companies.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  }, [companies, page, rowsPerPage]);

  const handleExport = () => {
    const headers = [
      'Company Name', 'Address', 'Cell Number', 'Email', 'Owner Name', 'Owner Surname', 'Owner ID Number', 'Status', 'Reason'
    ];
    
    const rows = companies.map((c: any) => [
      c.companyName || '',
      c.address || '',
      c.cellNumber || '',
      c.email || '',
      c.ownerName || '',
      c.ownerSurname || '',
      c.ownerIdNumber || '',
      c.status || '',
      c.reason || ''
    ]);
    
    const csvContent = [headers, ...rows].map(r => r.map(String).map(x => `"${x.replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `companies-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.append(a);

    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Registered Company Miners</Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            
            <Button color="inherit" startIcon={<DownloadIcon fontSize="var(--icon-fontSize-md)" />} onClick={handleExport}>
              Export
            </Button>
          </Stack>
        </Stack>
        <div>
          <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained" onClick={() => setOpen(true)}>
            Reg Company Miner
          </Button>
        </div>
      </Stack>

      {isInitialLoading ? (
        <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 300 }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ mt: 2 }}>Loading companies...</Typography>
        </Stack>
      ) : (
        <CompanyTable
          count={companies.length}
          page={page}
          rows={paginatedCompanies}
          rowsPerPage={rowsPerPage}
        />
      )}

      <RegMinerDialog open={open} onClose={() => setOpen(false)} />
    </Stack>
  );
}
