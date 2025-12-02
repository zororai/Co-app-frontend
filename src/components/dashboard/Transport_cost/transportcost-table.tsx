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
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from 'dayjs';
import { sortNewestFirst } from '@/utils/sort';
import { useTheme } from '@mui/material/styles';

import { useSelection } from '@/hooks/use-selection';
import { ReactNode } from 'react';
import { authClient } from '@/lib/auth/client';
import { MinerDetailsDialog } from '@/components/dashboard/useronboard/useronboard-details';
import { UserDetailsDialog } from '@/components/dashboard/Transport_cost/transportcost-details-dialog';


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
  externalRefreshKey?: number; // Optional external refresh trigger from parent
  statusFilter?: 'PENDING' | 'PUSHED_BACK' | 'REJECTED' | 'APPROVED' | null; // Optional status filter
}

export function CustomersTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
  onRefresh,
  externalRefreshKey,
  statusFilter = null,
}: CustomersTableProps): React.JSX.Element {
  const theme = useTheme();
  
  // State to store users fetched from API
  const [users, setUsers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string>('');
  const [filters, setFilters] = React.useState({
    search: '',
    status: 'all',
    position: 'all'
  });
  
  // Sorting state (empty = use LIFO/newest-first by default)
  const [sortField, setSortField] = React.useState<string>('');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');
  
  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [deleteTransportCostId, setDeleteTransportCostId] = React.useState<string | null>(null);
  const [deleteTransportCostName, setDeleteTransportCostName] = React.useState<string>('');
  const [isDeleting, setIsDeleting] = React.useState(false);
  
  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<'success' | 'error'>('success');
  
  // Handle sorting
  const handleSort = (field: string) => {
    const isAsc = sortField === field && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  // Filter and sort the users
  const filteredRows = React.useMemo(() => {
    const filtered = users.filter(user => {
      const matchesSearch = filters.search === '' || 
        Object.values(user).some(value => 
          String(value).toLowerCase().includes(filters.search.toLowerCase())
        );
      
      // Apply dropdown filter
      const matchesDropdownStatus = filters.status === 'all' || user.status === filters.status;
      const matchesPosition = filters.position === 'all' || user.position === filters.position;
      
      // Apply tab filter if provided
      const matchesTabStatus = statusFilter === null || user.status === statusFilter;

      return matchesSearch && matchesDropdownStatus && matchesPosition && matchesTabStatus;
    });
    
    // If no manual sort is active, preserve the LIFO order (users already sorted newest-first)
    if (!sortField || sortField === '') {
      return filtered;
    }

    // Apply manual sorting when user clicks column headers
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
  }, [users, filters, statusFilter, sortField, sortDirection]);

  const rowIds = React.useMemo(() => {
    return filteredRows.map((customer) => customer.id);
  }, [filteredRows]);

  // Initialize selection handling
  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < filteredRows.length;
  const selectedAll = filteredRows.length > 0 && selected?.size === filteredRows.length;

  const handleRedirect = (path: string) => {
    globalThis.location.href = path;
  };

  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false);
  const [selectedUserId, setSelectedUserId] = React.useState<string | null>(null);
  const [isUserDetailsDialogOpen, setIsUserDetailsDialogOpen] = React.useState(false);
  const [refreshTrigger, setRefreshTrigger] = React.useState(0); // State to trigger refreshes

  // Fetch users from API when component mounts or refreshTrigger/externalRefreshKey changes
  React.useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError('');
      try {
        const fetchedUsers = await authClient.fetchTransportCost();

        // Preserve timestamps in a consistent field and apply LIFO (newest-first)
        const transformed = (fetchedUsers || []).map((item: any) => ({
          ...item,
          createdAt: item.createdAt || item.date || item.timestamp || item.transactionDate || item.created_at,
          updatedAt: item.updatedAt || item.updated_at,
        }));

        const sorted = sortNewestFirst(transformed);
        // Optional debug:
        // console.log('LIFO applied - first items:', sorted.slice(0,3).map((r:any)=>({ id: r.id, createdAt: r.createdAt })));

        setUsers(sorted);
      } catch (error_) {
        console.error('Error fetching users:', error_);
        setError('Failed to load users. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [refreshTrigger, externalRefreshKey]);

  const handleViewCustomer = async (customerId: string) => {
    try {
      const customerDetails = await authClient.fetchTaxDetails(customerId);
      if (customerDetails) {
        setSelectedCustomer(customerDetails);
        setIsViewDialogOpen(true);
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
      alert('Failed to load customer details');
    }
  };
  
  // Function to handle viewing user details
  const handleViewUserDetails = (userId: string) => {
    setSelectedUserId(userId);
    setIsUserDetailsDialogOpen(true);
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
  
  // Handle delete click
  const handleDeleteClick = (transportCostId: string, paymentMethod: string) => {
    setDeleteTransportCostId(transportCostId);
    setDeleteTransportCostName(paymentMethod);
    setIsDeleteDialogOpen(true);
  };
  
  // Confirm delete
  const confirmDeleteTransportCost = async () => {
    if (!deleteTransportCostId) return;
    
    setIsDeleting(true);
    try {
      const result = await authClient.rejectTransportCost(deleteTransportCostId, 'Deleted by administrator');
      if (result.success) {
        setSnackbarMessage('Transport cost deleted successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        setIsDeleteDialogOpen(false);
        refreshTableData();
      } else {
        setSnackbarMessage(result.error || 'Failed to delete transport cost');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error deleting transport cost:', error);
      setSnackbarMessage('Failed to delete transport cost');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>      
      {/* Loading and Error States */}
      {loading && (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography>Loading users...</Typography>
        </Box>
      )}
      
      {!loading && error && (
        <Box sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
          <Typography>{error}</Typography>
          <Button 
            variant="outlined" 
            sx={{ mt: 2 }} 
            onClick={refreshTableData}
          >
            Retry
          </Button>
        </Box>
      )}
      {/* Filters Section */}
      <Box sx={{ 
        p: 2, 
        mb: 2,
        borderRadius: 1,
        bgcolor: '#fff',
        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            fontWeight: 500, 
            mb: 2 
          }}
        >
          Filters
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            border: '1px solid #e0e0e0',
            borderRadius: 1,
            px: 1,
            py: 0.5,
            minWidth: 220
          }}>
            <Box component="span" sx={{ color: '#9e9e9e', mr: 1 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
              </svg>
            </Box>
            <input
              type="text"
              placeholder="Search users..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              style={{
                border: 'none',
                outline: 'none',
                width: '100%',
                background: 'transparent',
                fontSize: '14px'
              }}
            />
          </Box>
          <FormControl sx={{ minWidth: 150 }}>
            <Select
              value={filters.status}
              displayEmpty
              size="small"
              sx={{ 
                '& .MuiSelect-select': { 
                  py: 1,
                  fontSize: '14px'
                }
              }}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="REJECTED">Rejected</MenuItem>
              <MenuItem value="PUSHED_BACK">Pushed Back</MenuItem>
              <MenuItem value="APPROVED">Approved</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <Select
              value={filters.position}
              displayEmpty
              size="small"
              sx={{ 
                '& .MuiSelect-select': { 
                  py: 1,
                  fontSize: '14px'
                }
              }}
              onChange={(e) => setFilters(prev => ({ ...prev, position: e.target.value }))}
            >
              <MenuItem value="all">All Roles</MenuItem>
              <MenuItem value="Representatives">Representatives</MenuItem>
              <MenuItem value="Owner">Owner</MenuItem>
              <MenuItem value="Member">Member</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <Select
              value="all"
              displayEmpty
              size="small"
              sx={{ 
                '& .MuiSelect-select': { 
                  py: 1,
                  fontSize: '14px'
                }
              }}
            >
              <MenuItem value="all">All Locations</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
    <Box sx={{ overflowX: 'auto' }}>
      <Table sx={{ minWidth: '800px' }}>
        <TableHead>
          <TableRow>
            <TableCell sortDirection={sortField === 'paymentMethod' ? sortDirection : false}>
              <TableSortLabel
                active={sortField === 'paymentMethod'}
                direction={sortField === 'paymentMethod' ? sortDirection : 'asc'}
                onClick={() => handleSort('paymentMethod')}
              >
                Payment Method
              </TableSortLabel>
            </TableCell>
            <TableCell sortDirection={sortField === 'amountOrGrams' ? sortDirection : false}>
              <TableSortLabel
                active={sortField === 'amountOrGrams'}
                direction={sortField === 'amountOrGrams' ? sortDirection : 'asc'}
                onClick={() => handleSort('amountOrGrams')}
              >
                Amount/Grams
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
            <TableCell sortDirection={sortField === 'reason' ? sortDirection : false}>
              <TableSortLabel
                active={sortField === 'reason'}
                direction={sortField === 'reason' ? sortDirection : 'asc'}
                onClick={() => handleSort('reason')}
              >
                Reason
              </TableSortLabel>
            </TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading && Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={`skeleton-${index}`}>
              <TableCell><Skeleton variant="text" width="80%" /></TableCell>
              <TableCell><Skeleton variant="text" width="80%" /></TableCell>
              <TableCell><Skeleton variant="rounded" width={80} height={24} /></TableCell>
              <TableCell><Skeleton variant="text" width="85%" /></TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Skeleton variant="circular" width={32} height={32} />
                  <Skeleton variant="circular" width={32} height={32} />
                </Box>
              </TableCell>
            </TableRow>
          ))}
          
          {!loading && filteredRows.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                <Typography variant="body1" color="text.secondary">
                  No transport cost entries found
                </Typography>
              </TableCell>
            </TableRow>
          )}
          
          {!loading && filteredRows.map((row) => {
            return (
              <TableRow hover key={row.id}>
                <TableCell>{row.paymentMethod || ''}</TableCell>
                <TableCell>{row.amountOrGrams ?? ''}</TableCell>
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
                <TableCell>{row.reason || ''}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="View Details">
                      <IconButton 
                        onClick={() => handleViewUserDetails(row.id)}
                        size="small"
                        sx={{
                          color: theme.palette.secondary.main,
                          '&:hover': { bgcolor: 'rgba(50, 56, 62, 0.08)' }
                        }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton 
                        onClick={() => handleDeleteClick(row.id, row.paymentMethod || 'transport cost')}
                        size="small"
                        sx={{
                          color: theme.palette.secondary.main,
                          '&:hover': { bgcolor: 'rgba(50, 56, 62, 0.08)' }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
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
      onPageChange={noop}
      onRowsPerPageChange={noop}
      page={page}
      rowsPerPage={rowsPerPage}
      rowsPerPageOptions={[5, 10, 25, 50, 100]}
    />
    
    {/* Customer Details Dialog */}
    {selectedCustomer && (
      <MinerDetailsDialog
        open={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        customer={selectedCustomer}
      />
    )}
    
    {/* User details dialog */}
    <UserDetailsDialog
      open={isUserDetailsDialogOpen}
      onClose={() => setIsUserDetailsDialogOpen(false)}
      userId={selectedUserId}
      onRefresh={refreshTableData}
    />
    
    {/* Delete confirmation dialog */}
    <Dialog
      open={isDeleteDialogOpen}
      onClose={() => !isDeleting && setIsDeleteDialogOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ bgcolor: theme.palette.secondary.main, color: 'white' }}>
        Confirm Delete
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <DialogContentText>
          Are you sure you want to delete transport cost entry <strong>{deleteTransportCostName}</strong>?
          <br />
          This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={() => setIsDeleteDialogOpen(false)} 
          disabled={isDeleting}
          variant="outlined"
          sx={{
            borderColor: 'secondary.main',
            color: 'secondary.main',
            '&:hover': {
              borderColor: 'secondary.dark',
              bgcolor: 'rgba(50, 56, 62, 0.04)'
            }
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={confirmDeleteTransportCost} 
          variant="contained"
          disabled={isDeleting}
          sx={{
            bgcolor: theme.palette.secondary.main,
            color: 'white',
            '&:hover': { bgcolor: theme.palette.secondary.dark },
            '&.MuiButton-contained': {
              bgcolor: theme.palette.secondary.main,
              color: 'white'
            }
          }}
        >
          {isDeleting ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
    
    {/* Snackbar for notifications */}
    <Snackbar
      open={snackbarOpen}
      autoHideDuration={6000}
      onClose={() => setSnackbarOpen(false)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert 
        onClose={() => setSnackbarOpen(false)} 
        severity={snackbarSeverity}
        sx={{ width: '100%' }}
      >
        {snackbarMessage}
      </Alert>
    </Snackbar>
  </Card>
  );
}
