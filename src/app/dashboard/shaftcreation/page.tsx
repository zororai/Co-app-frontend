  

"use client";
import * as React from 'react';
import type { Metadata } from 'next';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import dayjs from 'dayjs';


import { config } from '@/config';
import { CustomersTable } from '@/components/dashboard/shaftcreation/Shaftcreation-table';
import type { Customer } from '@/components/dashboard/shaftcreation/Shaftcreation-table';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { RegMinerDialog } from '@/components/dashboard/customer/reg_miner';
import { ShaftAttachmentDialog } from '@/components/dashboard/shaftcreation/shaft-attachment-dialog';
import { authClient } from '@/lib/auth/client';


export default function Page(): React.JSX.Element {
  const page = 0;
  const rowsPerPage = 5;
  const [open, setOpen] = React.useState(false);
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [isShaftDialogOpen, setIsShaftDialogOpen] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const data = await authClient.fetchApprovedminer();
      // Ensure each customer has cooperativeName and cooperative properties
      const normalizedData = data.map((customer: any) => ({
        ...customer,
        cooperativeName: customer.cooperativeName ?? '',
        cooperative: customer.cooperative ?? ''
      }));
      setCustomers(normalizedData);
    })();
  }, []);

  const paginatedCustomers = applyPagination(customers, page, rowsPerPage);

  // Export table data as CSV
  const handleExport = () => {
    const headers = [
      'ID', 'Name', 'Surname', 'Nation ID', 'Address', 'Phone', 'Position', 'Cooperative', 'Num Shafts', 'Status', 'Reason', 'Reason', 'Attached Shaft'
    ];
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


  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Shaft Creation</Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Button color="inherit" startIcon={<DownloadIcon fontSize="var(--icon-fontSize-md)" />} onClick={handleExport}>
              Export
            </Button>
          </Stack>
        </Stack>
        <Stack sx={{ alignItems: 'flex-end' }}>
          <Button 
            variant="contained"
            startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} 
            onClick={() => setIsShaftDialogOpen(true)}
            sx={{
              bgcolor: '#5f4bfa',
              color: '#fff',
              '&:hover': { bgcolor: '#4d3fd6' }
            }}
          >
            Create Shaft
          </Button>
        </Stack>
      </Stack>

      <CustomersTable
        count={paginatedCustomers.length}
        page={page}
        rows={paginatedCustomers}
        rowsPerPage={rowsPerPage}
      />

      <RegMinerDialog open={open} onClose={() => setOpen(false)} />
      <ShaftAttachmentDialog 
        open={isShaftDialogOpen} 
        onClose={() => setIsShaftDialogOpen(false)} 
      />
    </Stack>
  );
}

function applyPagination(rows: Customer[], page: number, rowsPerPage: number): Customer[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}
