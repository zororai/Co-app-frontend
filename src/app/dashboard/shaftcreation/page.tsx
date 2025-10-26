"use client";
import * as React from 'react';
import type { Metadata } from 'next';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


export default function Page(): React.JSX.Element {
  const page = 0;
  const rowsPerPage = 5;
  const [open, setOpen] = React.useState(false);
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  
  // Export menu state
  const [exportAnchorEl, setExportAnchorEl] = React.useState<null | HTMLElement>(null);
  const exportMenuOpen = Boolean(exportAnchorEl);
  
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

  const paginatedCustomers = applyPagination(customers, page, rowsPerPage);

  const handleExportMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportMenuClose = () => {
    setExportAnchorEl(null);
  };

  // Export table data
  const handleExport = (format: 'csv' | 'pdf') => {
    handleExportMenuClose();
    const headers = [
      'ID', 'Section Name', 'Shaft Numbers', 'Operation Status', 'Status', 'Assignment Status'
    ];
    const rows = paginatedCustomers.map(c => [
      c.id,
      c.sectionName,
      c.shaftNumbers,
      c.operationStatus ? 'Active' : 'Inactive',
      c.status,
      c.assignStatus
    ]);
    
    const timestamp = new Date().toISOString().split('T')[0];
    
    if (format === 'csv') {
      const csvContent = [headers, ...rows].map(r => r.map(String).map(x => `"${x.replaceAll('"', '""')}"`).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shaft-creation-${timestamp}.csv`;
      document.body.append(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text('Shaft Creation', 14, 22);
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);
      
      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 40,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });
      
      doc.save(`shaft-creation-${timestamp}.pdf`);
    }
  };


  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Shaft Creation</Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Button 
              color="inherit" 
              startIcon={<DownloadIcon fontSize="var(--icon-fontSize-md)" />}
              endIcon={<ArrowDropDownIcon />}
              onClick={handleExportMenuClick}
            >
              Export
            </Button>
            <Menu
              anchorEl={exportAnchorEl}
              open={exportMenuOpen}
              onClose={handleExportMenuClose}
            >
              <MenuItem onClick={() => handleExport('csv')}>Export as CSV</MenuItem>
              <MenuItem onClick={() => handleExport('pdf')}>Export as PDF</MenuItem>
            </Menu>
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

      <LazyWrapper>
        <LazyShaftCreationTable
          count={paginatedCustomers.length}
          page={page}
          rows={paginatedCustomers}
          rowsPerPage={rowsPerPage}
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

function applyPagination(rows: Customer[], page: number, rowsPerPage: number): Customer[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}
