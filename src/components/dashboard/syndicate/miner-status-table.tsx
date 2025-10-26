'use client';

import * as React from 'react';

// Removed duplicate local Customer interface. Use the exported one below.
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import dayjs from 'dayjs';
import { sortNewestFirst } from '@/utils/sort';

import { useSelection } from '@/hooks/use-selection';
import { ReactNode } from 'react';
import { authClient } from '@/lib/auth/client';
import { MinerDetailsDialog } from '@/components/dashboard/syndicate/miner-details';

function noop(): void {
  // do nothing
}

export interface Customer {
  cooperativeName: ReactNode;
  cellNumber: ReactNode;
  nationIdNumber: any;
  id: string;
  name: string;
  surname: string;
  nationId: string;
  address: string;
  phone: string;
  position: string;
  cooperative: string;
  numShafts: number;
  status: 'PENDING' | 'REJECTED' | 'PUSHED_BACK' | 'APPROVED';
  reason: string;
  attachedShaft: boolean;
  // Optionally, add index signature if you need dynamic keys:
  [key: string]: any;
}

export interface CustomersTableProps {
  count?: number;
  rows?: Customer[];
  page?: number;
  rowsPerPage?: number;
  onRefresh?: () => void; // Optional callback to refresh data from parent
}

export function CustomersTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
  onRefresh,
}: CustomersTableProps): React.JSX.Element {
  const [filters, setFilters] = React.useState({
    search: '',
    status: 'all',
    position: 'all'
  });

  // Filter the rows based on search and filters, then sort newest first
  const filteredRows = React.useMemo(() => {
    const filtered = rows.filter(row => {
      const matchesSearch = filters.search === '' || 
        Object.values(row).some(value => 
          String(value).toLowerCase().includes(filters.search.toLowerCase())
        );
      
      const matchesStatus = filters.status === 'all' || row.status === filters.status;
      const matchesPosition = filters.position === 'all' || row.position === filters.position;

      return matchesSearch && matchesStatus && matchesPosition;
    });
    return sortNewestFirst(filtered);
  }, [rows, filters]);

  const rowIds = React.useMemo(() => {
    return filteredRows.map((customer) => customer.id);
  }, [filteredRows]);

  // Initialize selection handling
  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < rows.length;
  const selectedAll = rows.length > 0 && selected?.size === rows.length;

  const handleRedirect = (path: string) => {
    globalThis.location.href = path;
  };

  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false);
  const [refreshTrigger, setRefreshTrigger] = React.useState(0); // State to trigger refreshes

  const handleViewCustomer = async (customerId: string) => {
    try {
      const customerDetails = await authClient.fetchCustomerDetails(customerId);
      if (customerDetails) {
        setSelectedCustomer(customerDetails);
        setIsViewDialogOpen(true);
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
      alert('Failed to load customer details');
    }
  };

  // Function to refresh the table data
  const refreshTableData = React.useCallback(() => {
    // Increment refresh trigger to force a re-render/refresh
    setRefreshTrigger(prev => prev + 1);
    
    // Call parent's refresh function if provided
    if (onRefresh) {
      onRefresh();
    }
  }, [onRefresh]);

  return (
    <Card>
      {/* Action Buttons */}
      <Box sx={{ p: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          sx={{
            bgcolor: '#5f4bfa',
            color: '#fff',
            '&:hover': { bgcolor: '#4d3fd6' }
          }}
          onClick={() => handleRedirect('/dashboard/syndicate')}
        >
          View Syndicate Miner Reg Status Health 
        </Button>
        <Button
          variant="contained"
          sx={{
            bgcolor: '#5f4bfa',
            color: '#fff',
            '&:hover': { bgcolor: '#4d3fd6' }
          }}
          onClick={() => handleRedirect('/dashboard/companyhealth')}
        >
View Company Miner Reg Status Health
        </Button>
      </Box>
      <Divider />
      {/* Filters Section */}
      <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          label="Search"
          variant="outlined"
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          sx={{ minWidth: 200 }}
          placeholder="Search by any field..."
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status}
            label="Status"
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="PENDING">Pending</MenuItem>
            <MenuItem value="REJECTED">Rejected</MenuItem>
            <MenuItem value="PUSHED_BACK">Pushed Back</MenuItem>
            <MenuItem value="APPROVED">Approved</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Position</InputLabel>
          <Select
            value={filters.position}
            label="Position"
            onChange={(e) => setFilters(prev => ({ ...prev, position: e.target.value }))}
          >
            <MenuItem value="all">All Positions</MenuItem>
            <MenuItem value="Representatives">Representatives</MenuItem>
            <MenuItem value="Owner">Owner</MenuItem>
            <MenuItem value="Member">Member</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Divider />
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow>
              <TableCell>Registration Number</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Surname</TableCell>
              <TableCell>Id Number</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Phone number</TableCell>
              
              <TableCell>Name Of Cooperative</TableCell>
              <TableCell>Current Status</TableCell>
              
              <TableCell>View Application Details</TableCell>
              
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.map((row) => {
              const isSelected = selected?.has(row.id);
              return (
                <TableRow hover key={row.id} selected={isSelected}>
                  <TableCell>{row.registrationNumber}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.surname}</TableCell>
                  <TableCell>{row.nationIdNumber}</TableCell>
                  <TableCell>{row.address}</TableCell>
                  <TableCell>{row.cellNumber}</TableCell>
                
                  <TableCell>{row.cooperativeName}</TableCell>
                  
                  <TableCell>
                    <Box sx={{
                      display: 'inline-block',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: 
                        row.status === 'PENDING' ? '#FFF9C4' : 
                        row.status === 'REJECTED' ? '#FFCDD2' : 
                        row.status === 'PUSHED_BACK' ? '#FFE0B2' : 
                        '#C8E6C9',
                      color: 
                        row.status === 'PENDING' ? '#F57F17' : 
                        row.status === 'REJECTED' ? '#B71C1C' : 
                        row.status === 'PUSHED_BACK' ? '#E65100' : 
                        '#1B5E20',
                      fontWeight: 'medium',
                      fontSize: '0.875rem'
                    }}>
                      {row.status}
                    </Box>
                  </TableCell>
              
                   <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <button 
                        onClick={() => handleViewCustomer(row.id)}
                        style={{
                          background: 'none',
                          border: '1px solid #06131fff',
                          color: '#081b2fff',
                          borderRadius: '6px',
                          padding: '2px 12px',
                          cursor: 'pointer',
                          fontWeight: 500,
                      }}>View Application Details</button>
                    </Box>
                  </TableCell>
               
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
      <Divider />
      <TablePagination
        component="div"
        count={filteredRows.length}
        onPageChange={noop}
        onRowsPerPageChange={noop}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
      
      {/* Customer Details Dialog */}
      <MinerDetailsDialog
        open={isViewDialogOpen}
        onClose={() => {
          setIsViewDialogOpen(false);
          setSelectedCustomer(null);
        }}
        customer={selectedCustomer}
        onRefresh={refreshTableData}
      />
    </Card>
  );
}
