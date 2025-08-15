'use client';

import * as React from 'react';
import { AddTaxDialog } from './add-tax-dialog';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { authClient } from '@/lib/auth/client';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

export default function TaxTestPage() {
  const [open, setOpen] = React.useState(false);
  const [taxes, setTaxes] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const fetchTaxes = async () => {
    setLoading(true);
    setError(null);
    try {
      const taxData = await authClient.fetchtax();
      setTaxes(taxData);
    } catch (err) {
      console.error('Error fetching taxes:', err);
      setError('Failed to fetch tax data');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchTaxes();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Tax Management
        </Typography>
        <Button 
          variant="contained" 
          onClick={handleOpen}
          sx={{ 
            bgcolor: '#121212', 
            color: 'white',
            '&:hover': { bgcolor: '#333' } 
          }}
        >
          Add New Tax
        </Button>
      </Box>

      {error && (
        <Box sx={{ 
          bgcolor: '#fdeded', 
          color: '#5f2120', 
          p: 2, 
          borderRadius: 1, 
          mb: 3 
        }}>
          <Typography variant="body2">{error}</Typography>
        </Box>
      )}

      {loading ? (
        <Typography>Loading tax data...</Typography>
      ) : taxes.length > 0 ? (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="tax table">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell><strong>Tax Type</strong></TableCell>
                <TableCell><strong>Rate (%)</strong></TableCell>
                <TableCell><strong>Location</strong></TableCell>
                <TableCell><strong>Description</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {taxes.map((tax, index) => (
                <TableRow key={index} sx={{ '&:nth-of-type(odd)': { bgcolor: '#fafafa' } }}>
                  <TableCell>{tax.taxType}</TableCell>
                  <TableCell>{tax.taxRate}</TableCell>
                  <TableCell>{tax.location}</TableCell>
                  <TableCell>{tax.description || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4, bgcolor: '#f9f9f9', borderRadius: 1 }}>
          <Typography variant="body1" color="text.secondary">
            No tax entries found. Click "Add New Tax" to create one.
          </Typography>
        </Box>
      )}

      <AddTaxDialog 
        open={open} 
        onClose={handleClose} 
        onRefresh={fetchTaxes}
      />
    </Box>
  );
}
