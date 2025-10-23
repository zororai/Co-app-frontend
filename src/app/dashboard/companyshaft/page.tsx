 

"use client";
import * as React from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
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
import { Company, CompanyTable } from '@/components/dashboard/companyshaft/company-table';


export default function Page(): React.JSX.Element {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [open, setOpen] = React.useState(false);
  const [companies, setCompanies] = React.useState<Company[]>([]);

  React.useEffect(() => {
    const fetchCompanies = async () => {
      try {
        // Use the correct endpoint method
        const data = await authClient.fetchCompaniesApproved();
        setCompanies(data);
      } catch (error) {
        console.error('Error fetching companies:', error);
      }
    };
    fetchCompanies();
  }, []);

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
      'Company Name',
      'Address',
      'Contact Number',
      'Email',
      'Owner Name',
      'Owner Surname',
      'Owner ID',
      'Status',
      'Reason'
    ];
    const rows = companies.map(company => [
      company.companyName,
      company.address,
      company.cellNumber,
      company.email,
      company.ownerName,
      company.cellNumber,
      company.ownerSurname,
      company.shaftnumber,
      company.ownerIdNumber,
      company.status,
      company.reason || ''
    ]);

    // Format CSV content with proper escaping
    const csvContent = [headers, ...rows]
      .map(r => r.map(String)
      .map(x => `"${x.replaceAll('"', '""')}"`).join(','))
      .join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = globalThis.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'companies.csv');
    document.body.append(a);
    a.click();
    a.remove();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: async (results: { data: any[]; }) => {
        // Map CSV rows to company structure
        const importedData: Company[] = results.data.map((row: any) => ({
          id: row.id || `imported-${Math.random().toString(36).slice(2, 11)}`,
          companyName: row['Company Name'] || '',
          address: row['Address'] || '',
          cellNumber: row['Contact Number'] || '',
          email: row['Email'] || '',
          ownerName: row['Owner Name'] || '',
          ownerSurname: row['Owner Surname'] || '',
          ownerIdNumber: row['Owner ID'] || '',
          status: row['Status'] || 'Pending',
          reason: row['Reason'] || '',
          companyLogo: row['Company Logo'] || '',
          certificateOfCooperation: row['Certificate Of Cooperation'] || '',
          cr14Copy: row['CR14 Copy'] || '',
          miningCertificate: row['Mining Certificate'] || '',
          taxClearance: row['Tax Clearance'] || '',
          passportPhoto: row['Passport Photo'] || '',
          ownerAddress: row['Owner Address'] || '',
          ownerCellNumber: row['Owner Cell Number'] || ''
        }));

        setCompanies(importedData);
        
        try {
          // You can add API endpoint to handle bulk import
          const response = await fetch('/api/companies/import', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(importedData),
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
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Company Miners Shaft Assignment </Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            
            <Button color="inherit" startIcon={<DownloadIcon fontSize="var(--icon-fontSize-md)" />} onClick={handleExport}>
              Export
            </Button>
          </Stack>
        </Stack>
        
      </Stack>

      <CompanyTable
        count={companies.length}
        page={page}
        rows={paginatedCompanies}
        rowsPerPage={rowsPerPage}
      />

      <RegMinerDialog open={open} onClose={() => setOpen(false)} />
    </Stack>
  );
}
