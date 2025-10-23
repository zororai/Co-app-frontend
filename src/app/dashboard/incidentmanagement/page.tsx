 

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
import { DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import { WarningCircle, Bell } from '@phosphor-icons/react/dist/ssr';
import Papa from 'papaparse';


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

  // Fetch incidents data
  React.useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const fetched = await authClient.fetchIncidents();
        const normalized = Array.isArray(fetched)
          ? fetched.map((it: any, idx: number) => ({
              id: String(it.id ?? it.incidentId ?? idx),
              title: it.title,
              type: it.type,
              severity: it.severity,
              location: it.location,
              reportedBy: it.reportedBy,
              status: it.status || 'PENDING',
              ...it,
            }))
          : [];
        setCustomers(normalized);
      } catch (error) {
        console.error('Error fetching incidents:', error);
      }
    };

    fetchIncidents();
  }, [refreshKey]);


  // Quick action dialog state
  const [qaOpen, setQaOpen] = React.useState(false);
  const [qaType, setQaType] = React.useState<'emergency' | 'safety' | 'notice'>('notice');
  const [qaTitle, setQaTitle] = React.useState('');
  const [qaMessage, setQaMessage] = React.useState('');

  const openQuickAction = (type: 'emergency' | 'safety' | 'notice') => {
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
  };

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
    } catch (err) {
      console.error('Error sending notification:', err);
    }
  };

  // Function to refresh the miner data
  const refreshData = React.useCallback(() => {
    setRefreshKey(prevKey => prevKey + 1);
  }, []);

  // Filter customers (only Pending tab remains)
  const pendingCustomers = customers.filter(c => c.status === 'PENDING');

  // Export table data as CSV
  const handleExport = () => {
    const headers = [
      'ID', 'Name', 'Surname', 'Nation ID', 'Address', 'Phone', 'Position', 'Cooperative', 'Num Shafts', 'Status', 'Reason', 'Attached Shaft'
    ];

    // Only Pending is supported
    const filteredCustomers: Customer[] = pendingCustomers;

    const paginatedCustomers = applyPagination(filteredCustomers, page, rowsPerPage);

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

  function handleImport(event: React.ChangeEvent<HTMLInputElement>): void {
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
      <Stack direction="row" spacing={3} sx={{ alignItems: 'flex-start' }}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: 'center' }}>
            <Typography variant="h4" sx={{ flexGrow: 1 }}>Incident Report Register</Typography>
            <Button
              variant="contained"
              startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
              onClick={() => setDialogOpen(true)}
              sx={{
                bgcolor: '#5f4bfa',
                color: '#fff',
                '&:hover': { bgcolor: '#4aa856' }
              }}
            >
              Record Incident
            </Button>
          </Stack>
          {/* Incident dialog */}
          <LazyWrapper>
            <LazyAddIncidentDialog 
              open={dialogOpen}
              onClose={() => setDialogOpen(false)}
              onRefresh={refreshData}
            />
          </LazyWrapper>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
            <Card sx={{ flex: 1, bgcolor: 'rgba(30,41,59,1)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2 }}>
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center">
                  <WarningCircle size={22} color="#ef4444" />
                  <Typography variant="h6" sx={{ color: '#ffffff' }}>Emergency Alert</Typography>
                </Stack>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
                  Send immediate emergency notification
                </Typography>
              </CardContent>
              <CardActions sx={{ pt: 0, pb: 2, px: 2 }}>
                <Button fullWidth variant="contained" startIcon={<Bell size={18} />} sx={{
                  bgcolor: '#d32f2f',
                  '&:hover': { bgcolor: '#b71c1c' },
                  color: '#fff',
                  textTransform: 'none',
                  fontWeight: 600
                }} onClick={() => openQuickAction('emergency')}>
                  Emergency Alert
                </Button>
              </CardActions>
            </Card>

            <Card sx={{ flex: 1, bgcolor: 'rgba(30,41,59,1)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2 }}>
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center">
                  <WarningCircle size={22} color="#f59e0b" />
                  <Typography variant="h6" sx={{ color: '#ffffff' }}>Safety Reminder</Typography>
                </Stack>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
                  Send safety protocol reminder
                </Typography>
              </CardContent>
              <CardActions sx={{ pt: 0, pb: 2, px: 2 }}>
                <Button fullWidth variant="contained" startIcon={<Bell size={18} />} sx={{
                  bgcolor: '#b77906',
                  '&:hover': { bgcolor: '#975a04' },
                  color: '#fff',
                  textTransform: 'none',
                  fontWeight: 600
                }} onClick={() => openQuickAction('safety')}>
                  Safety Reminder
                </Button>
              </CardActions>
            </Card>

            <Card sx={{ flex: 1, bgcolor: 'rgba(30,41,59,1)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2 }}>
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Bell size={22} color="#3b82f6" />
                  <Typography variant="h6" sx={{ color: '#ffffff' }}>General Notice</Typography>
                </Stack>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
                  Send general information notice
                </Typography>
              </CardContent>
              <CardActions sx={{ pt: 0, pb: 2, px: 2 }}>
                <Button fullWidth variant="contained" startIcon={<Bell size={18} />} sx={{
                  bgcolor: '#2563eb',
                  '&:hover': { bgcolor: '#1d4ed8' },
                  color: '#fff',
                  textTransform: 'none',
                  fontWeight: 600
                }} onClick={() => openQuickAction('notice')}>
                  General Notice
                </Button>
              </CardActions>
            </Card>
          </Stack>
          {/* Quick Action Dialog */}
          <Dialog open={qaOpen} onClose={closeQuickAction} maxWidth="sm" fullWidth>
            <DialogTitle>{qaTitle}</DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ mt: 1 }}>
                <TextField
                  fullWidth
                  label="Title"
                  value={qaTitle}
                  onChange={(e) => setQaTitle(e.target.value)}
                />
                <TextField
                  fullWidth
                  label={qaType === 'safety' ? 'Reminder' : qaType === 'emergency' ? 'Alert' : 'Notice'}
                  value={qaMessage}
                  onChange={(e) => setQaMessage(e.target.value)}
                  multiline
                  rows={4}
                  placeholder={qaType === 'safety' ? 'Enter safety reminder...' : qaType === 'emergency' ? 'Enter emergency details...' : 'Enter general notice...'}
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeQuickAction} color="inherit">Cancel</Button>
              <Button
                variant="contained"
                onClick={sendQuickAction}
                sx={{
                  bgcolor: qaType === 'emergency' ? '#d32f2f' : qaType === 'safety' ? '#b77906' : '#2563eb',
                  '&:hover': { bgcolor: qaType === 'emergency' ? '#b71c1c' : qaType === 'safety' ? '#975a04' : '#1d4ed8' }
                }}
              >
                Send {qaType === 'safety' ? 'Reminder' : qaType === 'emergency' ? 'Alert' : 'Notice'}
              </Button>
            </DialogActions>
          </Dialog>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Button
              color="inherit"
              startIcon={<UploadIcon fontSize="var(--icon-fontSize-md)" />}
              component="label"
            >
              Import
              <input
                type="file"
                accept=".csv"
                hidden
                onChange={handleImport}
              />
            </Button>
            <Button color="inherit" startIcon={<DownloadIcon fontSize="var(--icon-fontSize-md)" />} onClick={handleExport}>
              Export
            </Button>
          </Stack>
        </Stack>
      </Stack>

      {/* Incidents table */}
      <Box sx={{ mt: 2 }}>
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
      </Box>

    </Stack>
  );
}

function applyPagination(rows: Customer[], page: number, rowsPerPage: number): Customer[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}

