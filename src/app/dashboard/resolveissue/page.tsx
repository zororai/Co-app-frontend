"use client";
import * as React from 'react';
import type { Metadata } from 'next';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';

import { config } from '@/config';
import { CustomersTable } from '@/components/dashboard/resolveissue/resolve-table';
import type { Customer } from '@/components/dashboard/resolveissue/resolve-table';
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
  const [refreshKey, setRefreshKey] = React.useState(0);



  // Function to refresh the miner data
  const refreshData = React.useCallback(() => {
    setRefreshKey(prevKey => prevKey + 1);
  }, []);

  // Filter customers (only Pending tab remains)
  const pendingCustomers = customers.filter(c => c.status === 'PENDING');

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
    
    const timestamp = new Date().toISOString().split('T')[0];
    
    if (format === 'csv') {
      const csvContent = [headers, ...rows].map(r => r.map(String).map(x => `"${x.replaceAll('"', '""')}"`).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `incident-resolution-${timestamp}.csv`;
      document.body.append(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text('Incident Resolution', 14, 22);
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
      
      doc.save(`incident-resolution-${timestamp}.pdf`);
    }
  };

  

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3} sx={{ alignItems: 'flex-start' }}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: 'center' }}>
            <Typography variant="h4" sx={{ flexGrow: 1 }}>Incident Resolution</Typography>
          </Stack>
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

