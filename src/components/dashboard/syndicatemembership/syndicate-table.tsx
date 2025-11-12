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
import TableSortLabel from '@mui/material/TableSortLabel';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Skeleton from '@mui/material/Skeleton';
import CircularProgress from '@mui/material/CircularProgress';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import dayjs from 'dayjs';
import { useTheme } from '@mui/material/styles';

import { useSelection } from '@/hooks/use-selection';
import { ReactNode } from 'react';
import { authClient } from '@/lib/auth/client';
import { CustomerDetailsDialog } from '@/components/dashboard/syndicatemembership/customer-details-dialog';
import { AddLasherDialog } from '@/components/dashboard/syndicatemembership/add-lasher-dialog';
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
  const theme = useTheme();
  
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
  
  // Sorting state
  const [sortField, setSortField] = React.useState<string>('registrationNumber');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');
  
  // Loading state
  const [loading, setLoading] = React.useState<boolean>(false);
  
  // Handle sorting
  const handleSort = (field: string) => {
    const isAsc = sortField === field && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  // Sort then filter the rows based on search and filters
  const sortedRows = React.useMemo(() => sortNewestFirst(rows), [rows]);
  const filteredRows = React.useMemo(() => {
    const filtered = sortedRows.filter(row => {
      const matchesSearch = filters.search === '' || 
        Object.values(row).some(value => 
          String(value).toLowerCase().includes(filters.search.toLowerCase())
        );
      const matchesStatus = filters.status === 'all' || row.status === filters.status;
      const matchesPosition = filters.position === 'all' || row.position === filters.position;
      return matchesSearch && matchesStatus && matchesPosition;
    });
    
    // Apply sorting
    return [...filtered].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      
      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [sortedRows, filters, sortField, sortDirection]);

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
  const [selectedCustomerId, setSelectedCustomerId] = React.useState<string | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false);
  const [loadingCustomerId, setLoadingCustomerId] = React.useState<string | null>(null);
  
  // Add Lasher Dialog state
  const [isAddLasherDialogOpen, setIsAddLasherDialogOpen] = React.useState(false);
  const [selectedMinerId, setSelectedMinerId] = React.useState<string | null>(null);

  const handleViewCustomer = async (customerId: string) => {
    setLoadingCustomerId(customerId);
    try {
      const customerDetails = await authClient.fetchCustomerDetails(customerId);
      if (customerDetails) {
        setSelectedCustomer(customerDetails);
        setSelectedCustomerId(customerId);
        setIsViewDialogOpen(true);
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
      alert('Failed to load customer details');
    } finally {
      setLoadingCustomerId(null);
    }
  };

  const handleAddLasher = (minerId: string) => {
    setSelectedMinerId(minerId);
    setIsAddLasherDialogOpen(true);
  };

  const handleLasherSuccess = () => {
    // Optionally refresh the table or show a success message
    console.log('Lasher added successfully');
  };

  return (
    <Card>
      {/* Action Buttons */}
     
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
              <TableCell sortDirection={sortField === 'registrationNumber' ? sortDirection : false}>
                <TableSortLabel
                  active={sortField === 'registrationNumber'}
                  direction={sortField === 'registrationNumber' ? sortDirection : 'asc'}
                  onClick={() => handleSort('registrationNumber')}
                >
                  Registration Number
                </TableSortLabel>
              </TableCell>



              <TableCell sortDirection={sortField === 'cooperativename' ? sortDirection : false}>
                <TableSortLabel
                  active={sortField === 'cooperativename'}
                  direction={sortField === 'cooperativename' ? sortDirection : 'asc'}
                  onClick={() => handleSort('cooperativename')}
                >
                  Cooperative Name
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={sortField === 'shaftnumber' ? sortDirection : false}>
                <TableSortLabel
                  active={sortField === 'shaftnumber'}
                  direction={sortField === 'shaftnumber' ? sortDirection : 'asc'}
                  onClick={() => handleSort('shaftnumber')}
                >
                  Shaft Number
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={sortField === 'status' ? sortDirection : false}>
                <TableSortLabel
                  active={sortField === 'status'}
                  direction={sortField === 'status' ? sortDirection : 'asc'}
                  onClick={() => handleSort('status')}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={`skeleton-${index}`}>
                <TableCell><Skeleton variant="text" width="80%" /></TableCell>
                <TableCell><Skeleton variant="text" width="75%" /></TableCell>
                <TableCell><Skeleton variant="text" width="75%" /></TableCell>
                <TableCell><Skeleton variant="text" width="85%" /></TableCell>
                <TableCell><Skeleton variant="text" width="60%" /></TableCell>
                <TableCell><Skeleton variant="rounded" width={80} height={24} /></TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Skeleton variant="circular" width={32} height={32} />
                    <Skeleton variant="circular" width={32} height={32} />
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            
            {!loading && paginatedRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No customers found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            
            {!loading && paginatedRows.map((row, index) => {
              const isSelected = selected?.has(row.id);
              const uniqueKey = row.id || `customer-${index}`;
              return (
                <TableRow hover key={uniqueKey} selected={isSelected}>

                   <TableCell>{row.registrationNumber}</TableCell>
                    {/* <TableCell>{row.cooperativename}</TableCell> */}
                  <TableCell>{row.cooperativename}</TableCell>
          
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
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="View Application Details">
                        <IconButton 
                          onClick={() => handleViewCustomer(row.id)}
                          disabled={loadingCustomerId === row.id}
                          size="small"
                          sx={{
                            color: theme.palette.secondary.main,
                            '&:hover': { bgcolor: 'rgba(50, 56, 62, 0.08)' },
                            '&.Mui-disabled': {
                              color: theme.palette.secondary.main,
                              opacity: 0.6
                            }
                          }}
                        >
                          {loadingCustomerId === row.id ? (
                            <CircularProgress size={20} sx={{ color: theme.palette.secondary.main }} />
                          ) : (
                            <VisibilityIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Add Lasher">
                        <IconButton 
                          onClick={() => handleAddLasher(row.id)}
                          size="small"
                              sx={{
                            color: theme.palette.secondary.main,
                            '&:hover': { bgcolor: 'rgba(50, 56, 62, 0.08)' },
                            '&.Mui-disabled': {
                              color: theme.palette.secondary.main,
                              opacity: 0.6
                            }
                          }}
                        >
                          <PersonAddIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
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
          setSelectedCustomerId(null);
        }}
        customer={selectedCustomer}
        customerId={selectedCustomerId}
      />
      
      {/* Add Lasher Dialog */}
      <AddLasherDialog
        open={isAddLasherDialogOpen}
        onClose={() => {
          setIsAddLasherDialogOpen(false);
          setSelectedMinerId(null);
        }}
        minerId={selectedMinerId}
        onSuccess={handleLasherSuccess}
      />
    </Card>
  );
}
