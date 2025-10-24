 

"use client";
import * as React from 'react';
import type { Metadata } from 'next';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import { DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';

import { WarningCircle, Bell } from '@phosphor-icons/react/dist/ssr';



import { config } from '@/config';
import { LazyWrapper } from '@/components/common/LazyWrapper';
import { LazyIncidentManagementTable, LazyAddIncidentDialog } from '@/components/lazy/LazyComponents';
import type { Customer } from '@/components/dashboard/incidentmanagement/incidentmanagement';
import { authClient } from '@/lib/auth/client';


export default function Page(): React.JSX.Element {
  const page = 0;
  const rowsPerPage = 5;
  const [open, setOpen] = React.useState(false);
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  
  // Loading state for initial data fetch
  const [isInitialLoading, setIsInitialLoading] = React.useState(true);

  // Function to fetch and update incident data
  const fetchIncidents = React.useCallback(async () => {
    try {
      const fetched = await authClient.fetchIncidents();
      console.log('Fetched incident data from API:', fetched);
      const normalized = Array.isArray(fetched)
        ? fetched.map((it: any, idx: number) => ({
            id: String(it.id ?? it.incidentId ?? idx),
            title: it.title,
            severity: it.severity,
            location: it.location,
            reportedBy: it.reportedBy,
            status: it.status || 'PENDING',
            ...it,
          }))        : [];
      console.log('Normalized incident data for table:', normalized);
      setCustomers(normalized);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      setCustomers([]);
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  // Function to refresh the incident data
  const refreshData = React.useCallback(() => {
    setRefreshKey(prev => prev + 1);
    fetchIncidents();
  }, [fetchIncidents]);

  // Render UI first, then fetch data with a small delay
  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchIncidents();
    }, 100);
    return () => clearTimeout(timer);
  }, [fetchIncidents]);

  // Quick action dialog state
  const [qaOpen, setQaOpen] = React.useState(false);
  const [qaType, setQaType] = React.useState<'emergency' | 'safety' | 'notice'>('notice');
  const [qaTitle, setQaTitle] = React.useState('');
  const [qaMessage, setQaMessage] = React.useState('');

  // Memoized quick action handler
  const openQuickAction = React.useCallback((type: 'emergency' | 'safety' | 'notice') => {
    setQaType(type);
    if (type === 'emergency') {
      setQaTitle('Emergency Alert');
      setQaMessage('');
    } else if (type === 'safety') {
      setQaTitle('Safety Reminder');
      setQaMessage('');
    } else {
      setQaTitle('General Notice');
      setQaMessage('');
    }
    setQaOpen(true);
  }, []);

  const closeQuickAction = () => setQaOpen(false);
  const sendQuickAction = async () => {
    console.log('sendQuickAction called');
    console.log('Current qaType:', qaType);
    // Map qaType to the required type string for backend
    const typeString = qaType === 'emergency' ? 'Emergency Alert' : qaType === 'safety' ? 'Safety Reminder' : 'General Notice';
    console.log('Mapped typeString:', typeString);
    const notificationPayload = {
      title: qaTitle || typeString,
      type: typeString,
      message: qaMessage,
    };
    console.log('Full notification payload:', notificationPayload);
    try {
      const res = await authClient.sendNotification(notificationPayload);
      console.log('Notification response:', res);
      if (!res.success) {
        console.error('Failed to send notification', res.error);
      } else {
        console.log('Notification sent successfully!');
        setQaOpen(false);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  // Note: refreshData already defined above, removing duplicate

  // Memoized filtered customers
  const pendingCustomers = React.useMemo(() => customers.filter(c => c.status === 'PENDING'), [customers]);

  // Memoized pagination
  const paginatedCustomers = React.useMemo(() => 
    applyPagination(customers, page, rowsPerPage), [customers, page, rowsPerPage]);

  // Memoized export function
  const handleExport = React.useCallback(() => {
    const headers = [
      'ID', 'Name', 'Surname', 'Nation ID', 'Address', 'Phone', 'Position', 'Cooperative', 'Num Shafts', 'Status', 'Reason', 'Attached Shaft'
    ];

    const rows = paginatedCustomers.map(c => [
      c.id,
      c.name,
      c.surname,
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
  }, [paginatedCustomers]);

  

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3} sx={{ alignItems: 'flex-start' }}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: 'center' }}>
            <Typography variant="h4" sx={{ flexGrow: 1 }}>Incident Report Register</Typography>
            
            <Button color="inherit" startIcon={<DownloadIcon fontSize="var(--icon-fontSize-md)" />} onClick={handleExport}>
              Export
            </Button>
          </Stack>
        </Stack>
      </Stack>

      {/* Incidents table */}
      <Box sx={{ mt: 2 }}>
        {isInitialLoading ? (
          <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 300 }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 2 }}>Loading incident reports...</Typography>
          </Stack>
        ) : (
          <LazyWrapper>
            <LazyIncidentManagementTable 
              key={refreshKey} 
              count={customers.length}
              page={page}
              rows={customers}
              rowsPerPage={rowsPerPage} 
              onRefresh={refreshData} 
            />
          </LazyWrapper>
        )}
      </Box>

    </Stack>
  );
}

function applyPagination(rows: Customer[], page: number, rowsPerPage: number): Customer[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}

