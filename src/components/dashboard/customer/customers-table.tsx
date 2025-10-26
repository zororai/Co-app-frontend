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

import { useSelection } from '@/hooks/use-selection';
import { ReactNode } from 'react';
import { authClient } from '@/lib/auth/client';
import { CustomerDetailsDialog } from '@/components/dashboard/customer/customer-details-dialog';
import { IntegrationCard } from '@/components/dashboard/integrations/integrations-card';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';
import { sortNewestFirst } from '@/utils/sort';

function noop(): void {
  // do nothing
}

export interface Customer {
  cellNumber: ReactNode;
  nationIdNumber: any;
  id: string;
  name: string;
  surname: string;
  nationId: string;
  address: string;
  phone: string;
  position: string;
  cooperativename: string;
  numShafts: number;
  status: 'APPROVED' | 'REJECTED';
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
  onPageChange?: (event: unknown, newPage: number) => void;
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function CustomersTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 5,
  onPageChange,
  onRowsPerPageChange
}: CustomersTableProps): React.JSX.Element {
  
  // Local state for pagination if not controlled by parent
  const [internalPage, setInternalPage] = React.useState(page);
  const [internalRowsPerPage, setInternalRowsPerPage] = React.useState(rowsPerPage);
// import { useRouter } from 'next/navigation';

  // Use controlled or internal state
  const currentPage = onPageChange ? page : internalPage;
  const currentRowsPerPage = onRowsPerPageChange ? rowsPerPage : internalRowsPerPage;
  const [filters, setFilters] = React.useState({
    search: '',
    status: 'all',
    position: 'all'
  });


  // State for attached shaft dialog
  const [shaftDialogOpen, setShaftDialogOpen] = React.useState(false);
  const [shaftAssignments, setShaftAssignments] = React.useState<any[]>([]);
  const [shaftLoading, setShaftLoading] = React.useState(false);
  const [shaftError, setShaftError] = React.useState<string | null>(null);
  const [shaftCustomerId, setShaftCustomerId] = React.useState<string | null>(null);

  // Handler to open dialog and fetch shaft assignments
  const handleViewAttachedShaft = async (customerId: string) => {
    setShaftDialogOpen(true);
    setShaftLoading(true);
    setShaftError(null);
    setShaftAssignments([]);
    setShaftCustomerId(customerId);
    try {
      const data = await authClient.fetchShaftAssignmentsByMiner(customerId);
      setShaftAssignments(Array.isArray(data) ? data : [data]);
    } catch (error: any) {
      setShaftError(error.message || 'Failed to fetch shaft assignments');
    } finally {
      setShaftLoading(false);
    }
  };

  // Sort then filter the rows based on search and filters
  const sortedRows = React.useMemo(() => sortNewestFirst(rows), [rows]);
  const filteredRows = React.useMemo(() => {
    return sortedRows.filter(row => {
      const matchesSearch = filters.search === '' || 
        Object.values(row).some(value => 
          String(value).toLowerCase().includes(filters.search.toLowerCase())
        );
      const matchesStatus = filters.status === 'all' || row.status === filters.status;
      const matchesPosition = filters.position === 'all' || row.position === filters.position;
      return matchesSearch && matchesStatus && matchesPosition;
    });
  }, [sortedRows, filters]);

  // Paginate filtered rows
  const paginatedRows = React.useMemo(() => {
    return filteredRows.slice(currentPage * currentRowsPerPage, currentPage * currentRowsPerPage + currentRowsPerPage);
  }, [filteredRows, currentPage, currentRowsPerPage]);

  const rowIds = React.useMemo(() => {
    return filteredRows.map((customer) => customer.id);
  }, [filteredRows]);

  // Initialize selection handling - rowIds is properly memoized to prevent infinite loops
  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < rows.length;
  const selectedAll = rows.length > 0 && selected?.size === rows.length;

  const handleRedirect = (path: string) => {
    globalThis.location.href = path;
  };

  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false);

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
          onClick={() => handleRedirect('/dashboard/customers')}
        >
          View Syndicate
        </Button>
        <Button
          variant="contained"
          sx={{
            bgcolor: '#5f4bfa',
            color: '#fff',
            '&:hover': { bgcolor: '#4d3fd6' }
          }}
          onClick={() => handleRedirect('/dashboard/company')}
        >
         View Company
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
            <MenuItem value="Approved">Approved</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
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
         
              <TableCell>RegistrationNumber</TableCell>
              {/* Action Buttons 
                       <TableCell>Name Of Cooperative</TableCell>
                       */}
              <TableCell>Name</TableCell>
              <TableCell>Surname</TableCell>
              <TableCell>Nationality ID Number</TableCell>
              <TableCell>No.Of.Shafts</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>View Syndicate Details</TableCell>
              <TableCell>View Attached Shafts</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((row) => {
              const isSelected = selected?.has(row.id);
              return (
                <TableRow hover key={row.id} selected={isSelected}>

                   <TableCell>{row.registrationNumber}</TableCell>
                    {/* <TableCell>{row.cooperativename}</TableCell> */}
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.surname}</TableCell>
                  <TableCell>{row.nationIdNumber}</TableCell>
                  
                
                  <TableCell>{row.shaftnumber}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 2,
                         bgcolor: 
                            row.status === 'APPROVED' ?  '#d0f5e8' : '#ffebee',
                          color: 
                            row.status === 'APPROVED' ? '#1b5e20' : '#c62828',
                          fontWeight: 500,
                          fontSize: 13,
                        }}
                      >
                        {row.status}
                      </Box>
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
                      <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <button 
                        onClick={() => handleViewAttachedShaft(row.id)}
                        style={{
                          background: 'none',
                          border: '1px solid #06131fff',
                          color: '#081b2fff',
                          borderRadius: '6px',
                          padding: '2px 12px',
                          cursor: 'pointer',
                          fontWeight: 500,
                      }}>View Attached Shaft</button>
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
        page={currentPage}
        rowsPerPage={currentRowsPerPage}
        onPageChange={onPageChange || ((_e, newPage) => setInternalPage(newPage))}
        onRowsPerPageChange={onRowsPerPageChange || ((e) => {
          setInternalRowsPerPage(Number.parseInt(e.target.value, 10));
          setInternalPage(0);
        })}
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
      />
      {/* Customer Details Dialog */}
      <CustomerDetailsDialog
        open={isViewDialogOpen}
        onClose={() => {
          setIsViewDialogOpen(false);
          setSelectedCustomer(null);
        }}
        customer={selectedCustomer}
      />

      {/* Shaft Assignments Dialog */}
      <Dialog open={shaftDialogOpen} onClose={() => setShaftDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Attached Shaft Assignments</DialogTitle>
        <DialogContent>
          {shaftLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
              <CircularProgress />
            </Box>
          ) : shaftError ? (
            <Typography color="error">{shaftError}</Typography>
          ) : shaftAssignments.length === 0 ? (
            <Typography>No shaft assignments found for this customer.</Typography>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              {shaftAssignments.map((assignment, idx) => (
                <IntegrationCard key={assignment.id || idx} integration={assignment} />
              ))}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
