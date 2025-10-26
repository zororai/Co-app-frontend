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
import Papa from 'papaparse';



import { config } from '@/config';
import { CustomersTable, type Customer } from '@/components/dashboard/penality/penality-table';
import { SectionDialog } from '@/components/dashboard/penality/penality-dialog';
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

  const fetchPenalties = React.useCallback(async () => {
    try {
      const data = await authClient.fetchPenalties();
      console.log('Fetched penalty data from API:', data);
      // Map penalty data to match the Customer interface structure
      const mappedData = data.map((penalty: any) => ({
        ...penalty,
        id: penalty.id || `penalty-${Math.random()}`,
        name: penalty.section || '',
        numShafts: penalty.shaftNumber || '',
        fee: penalty.penilatyFee || 0,
        status: penalty.status || 'PENDING',
        reason: penalty.issue || '',
        cooperativeName: penalty.reportedBy || '',
        cooperative: penalty.reportedBy || '',
        surname: '',
        nationId: '',
        nationIdNumber: '',
        address: '',
        phone: '',
        cellNumber: '',
        position: '',
        attachedShaft: false
      }));
      setCustomers(mappedData);
    } catch (error) {
      console.error('Error fetching penalties:', error);
      setCustomers([]);
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchPenalties();
  }, [fetchPenalties]);

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
      'Shaft Number', 'Section', 'Fee', 'Status'
    ];
    
    // Export all customers, not just paginated ones
    const rows = customers.map((c: any) => [
      c.numShafts || '',
      c.name || '',
      c.fee || '',
      c.status || ''
    ]);
    
    const timestamp = new Date().toISOString().split('T')[0];
    
    if (format === 'csv') {
      const csvContent = [headers, ...rows].map(r => r.map(String).map(x => `"${x.replaceAll('"', '""')}"`).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `penalties-${timestamp}.csv`;
      document.body.append(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text('Issued Penalties', 14, 22);
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
      
      doc.save(`penalties-${timestamp}.pdf`);
    }
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
          <Typography variant="h4">Issued Penality</Typography>
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
        <div>
          <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained" onClick={() => setOpen(true)}>
            issue Penality
          </Button>
        </div>
      </Stack>

      <CustomersTable
        count={paginatedCustomers.length}
        page={page}
        rows={paginatedCustomers}
        rowsPerPage={rowsPerPage}
      />

      <SectionDialog 
        open={open} 
        onClose={() => setOpen(false)} 
        onSuccess={() => {
          fetchPenalties(); // Refresh the data after successful creation
        }}
      />
    </Stack>
  );
}

function applyPagination(rows: Customer[], page: number, rowsPerPage: number): Customer[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}
