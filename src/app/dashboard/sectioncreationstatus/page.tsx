  

import * as React from 'react';
import type { Metadata } from 'next';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CircularProgress from '@mui/material/CircularProgress';
import { DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';

import dayjs from 'dayjs';



import { config } from '@/config';
import { CustomersTable } from '@/components/dashboard/sectioncreationstatus/section-status-table';
import type { Customer } from '@/components/dashboard/sectioncreationstatus/section-status-table';

// Tab content components with loading states
interface TabProps {
  customers: Customer[];
  page: number;
  rowsPerPage: number;
  onRefresh: () => void;
  isLoading?: boolean;
}

function PendingTab({ customers, page, rowsPerPage, onRefresh, isLoading }: TabProps) {
  if (isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 200 }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>Loading pending section creation...</Typography>
      </Stack>
    );
  }
  const paginated = applyPagination(customers, page, rowsPerPage);
  return <CustomersTable count={paginated.length} page={page} rows={paginated} rowsPerPage={rowsPerPage} onRefresh={onRefresh} />;
}

function PushedBackTab({ customers, page, rowsPerPage, onRefresh, isLoading }: TabProps) {
  if (isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 200 }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>Loading pushed back section creation...</Typography>
      </Stack>
    );
  }
  const paginated = applyPagination(customers, page, rowsPerPage);
  return <CustomersTable count={paginated.length} page={page} rows={paginated} rowsPerPage={rowsPerPage} onRefresh={onRefresh} />;
}
function RejectedTab({ customers, page, rowsPerPage, onRefresh }: { customers: Customer[], page: number, rowsPerPage: number, onRefresh: () => void }) {
  const paginated = applyPagination(customers, page, rowsPerPage);
  return <CustomersTable count={paginated.length} page={page} rows={paginated} rowsPerPage={rowsPerPage} onRefresh={onRefresh} />;
}
function ApprovedTab({ customers, page, rowsPerPage, onRefresh }: { customers: Customer[], page: number, rowsPerPage: number, onRefresh: () => void }) {
  const paginated = applyPagination(customers, page, rowsPerPage);
  return <CustomersTable count={paginated.length} page={page} rows={paginated} rowsPerPage={rowsPerPage} onRefresh={onRefresh} />;
}
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { RegMinerDialog } from '@/components/dashboard/customer/reg_miner';
import { authClient } from '@/lib/auth/client';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


export default function Page(): React.JSX.Element {
  const page = 0;
  const rowsPerPage = 5;
  const [open, setOpen] = React.useState(false);
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [tab, setTab] = React.useState<'PENDING' | 'PUSHED_BACK' | 'REJECTED' | 'APPROVED'>('PENDING');
  
  // Export menu state
  const [exportAnchorEl, setExportAnchorEl] = React.useState<null | HTMLElement>(null);
  const exportMenuOpen = Boolean(exportAnchorEl);

  // Function to refresh the miner data
  const refreshData = React.useCallback(() => {
    setRefreshKey(prevKey => prevKey + 1);
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        const data = await authClient.fetchSectionstatus();
        console.log('Fetched data from API:', data);
        // Normalize status values to match expected enum
        const normalizedData = data.map((customer: any) => ({
          ...customer,
          status: customer.status === "Approved" ? "APPROVED"
                : customer.status === "Rejected" ? "REJECTED"
                : customer.status === "Pending" ? "PENDING"
                : customer.status === "Pushed Back" ? "PUSHED_BACK"
                : customer.status // fallback to original if already correct
        }));
        console.log('Normalized data for table:', normalizedData);
        setCustomers(normalizedData);
      } catch (error) {
        console.error('API call failed, using mock data:', error);
        // Use mock data when API fails
      
      }
    })();
  }, [refreshKey]);

  // Filter customers by selected tab/status
  const pendingCustomers = customers.filter(c => c.status === 'PENDING');
  const pushedBackCustomers = customers.filter(c => c.status === 'PUSHED_BACK');
  const rejectedCustomers = customers.filter(c => c.status === 'REJECTED');
  const approvedCustomers = customers.filter(c => c.status === 'APPROVED');

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
      'ID', 'Name', 'Surname', 'Nation ID', 'Address', 'Phone', 'Position', 'Cooperative', 'Num Shafts', 'Status', 'Reason', 'Attached Shaft'
    ];

    // Determine which customers to export based on the current tab
    let filteredCustomers: Customer[] = [];
    switch (tab) {
    case 'PENDING': {
    filteredCustomers = pendingCustomers;
    break;
    }
    case 'PUSHED_BACK': {
    filteredCustomers = pushedBackCustomers;
    break;
    }
    case 'REJECTED': {
    filteredCustomers = rejectedCustomers;
    break;
    }
    case 'APPROVED': {
    filteredCustomers = approvedCustomers;
    break;
    }
    }

    // Export all filtered customers, not just paginated ones
    const rows = filteredCustomers.map((c: any) => [
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
    
    const timestamp = new Date().toISOString().split('T')[0];
    
    if (format === 'csv') {
      const csvContent = [headers, ...rows].map(r => r.map(String).map(x => `"${x.replaceAll('"', '""')}"`).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `section-creation-status-${tab.toLowerCase()}-${timestamp}.csv`;
      document.body.append(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text(`Section Creation Status - ${tab}`, 14, 22);
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
      
      doc.save(`section-creation-status-${tab.toLowerCase()}-${timestamp}.pdf`);
    }
  };

  

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Section Creation Status</Typography>
          <Tabs
            value={tab}
            onChange={(_e, newValue) => setTab(newValue)}
            sx={{ mb: 2 }}
          >
            <Tab label="Pending" value="PENDING" />
            <Tab label="Pushed Back" value="PUSHED_BACK" />
            <Tab label="Rejected" value="REJECTED" />
            <Tab label="Approved" value="APPROVED" />
          </Tabs>
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

      {tab === 'PENDING' && (
        <PendingTab customers={pendingCustomers} page={page} rowsPerPage={rowsPerPage} onRefresh={refreshData} />
      )}
      {tab === 'PUSHED_BACK' && (
        <PushedBackTab customers={pushedBackCustomers} page={page} rowsPerPage={rowsPerPage} onRefresh={refreshData} />
      )}
      {tab === 'REJECTED' && (
        <RejectedTab customers={rejectedCustomers} page={page} rowsPerPage={rowsPerPage} onRefresh={refreshData} />
      )}
      {tab === 'APPROVED' && (
        <ApprovedTab customers={approvedCustomers} page={page} rowsPerPage={rowsPerPage} onRefresh={refreshData} />
      )}

      <RegMinerDialog open={open} onClose={() => setOpen(false)} />
    </Stack>
  );
}

function applyPagination(rows: Customer[], page: number, rowsPerPage: number): Customer[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}
