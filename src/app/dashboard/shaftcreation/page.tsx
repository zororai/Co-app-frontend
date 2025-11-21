  

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


import { config } from '@/config';
import { LazyWrapper } from '@/components/common/LazyWrapper';
import { LazyShaftCreationTable, LazyRegMinerDialog, LazyShaftAttachmentDialog } from '@/components/lazy/LazyComponents';
import type { Customer } from '@/components/dashboard/shaftcreation/Shaftcreation-table';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { authClient } from '@/lib/auth/client';


export default function Page(): React.JSX.Element {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const [open, setOpen] = React.useState(false);
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  
  // Loading state for initial data fetch
  const [isInitialLoading, setIsInitialLoading] = React.useState(true);
  const [isShaftDialogOpen, setIsShaftDialogOpen] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const data = await authClient.fetchAllShaftAssignments();
      // Normalize the shaft assignment data
      const normalizedData = data.map((shaft: any) => ({
        ...shaft,
        id: shaft.id || shaft.assignmentId || Math.random().toString(),
        sectionName: shaft.sectionName || '',
        shaftNumbers: shaft.shaftNumbers || '',
        operationStatus: shaft.operationStatus || false,
        status: shaft.status || 'PENDING',
        assignStatus: shaft.assignStatus || 'UNASSIGNED'
      }));
      setCustomers(normalizedData);
    })();
  }, []);

  // Export table data as CSV
  const handleExport = () => {
    const headers = [
      'ID', 'Section Name', 'Shaft Numbers', 'Operation Status', 'Status', 'Assignment Status'
    ];
    const rows = customers.map(c => [
      c.id,
      c.sectionName,
      c.shaftNumbers,
      c.operationStatus ? 'Active' : 'Inactive',
      c.status,
      c.assignStatus
    ]);
    const csvContent = [headers, ...rows].map(r => r.map(String).map(x => `"${x.replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shaft-assignments.csv';
    document.body.append(a);

    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };


  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3} sx={{ 
        alignItems: 'flex-start', 
        justifyContent: 'space-between' 
      }}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Shaft Creation</Typography>
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
        <Button 
          variant="contained"
          startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} 
          onClick={() => setIsShaftDialogOpen(true)}
          sx={{
            bgcolor: 'secondary.main',
            color: '#fff',
            '&:hover': { bgcolor: 'secondary.dark' }
          }}
        >
          Create Shaft
        </Button>
      </Stack>

      <LazyWrapper>
        <LazyShaftCreationTable
          count={customers.length}
          page={page}
          rows={customers}
          rowsPerPage={rowsPerPage}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </LazyWrapper>

      <LazyWrapper>
        <LazyRegMinerDialog open={open} onClose={() => setOpen(false)} />
      </LazyWrapper>
      <LazyWrapper>
        <LazyShaftAttachmentDialog 
          open={isShaftDialogOpen} 
          onClose={() => setIsShaftDialogOpen(false)} 
        />
      </LazyWrapper>
    </Stack>
  );
}
