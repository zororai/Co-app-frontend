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
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from 'dayjs';
import { sortNewestFirst } from '@/utils/sort';
import { useTheme } from '@mui/material/styles';

import { useSelection } from '@/hooks/use-selection';
import { ReactNode } from 'react';
import { authClient } from '@/lib/auth/client';
import { MinerDetailsDialog } from '@/components/dashboard/useronboard/useronboard-details';
import { UserDetailsDialog } from '@/components/dashboard/useronboard/user-details-dialog';
import { VehicleDetailsDialog } from '@/components/dashboard/vehicleonboarding/vehicle-details-dialog';


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
  statusFilter?: 'PENDING' | 'PUSHED_BACK' | 'REJECTED' | 'APPROVED' | null; // Optional status filter
}

export function CustomersTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
  onRefresh,
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
  
  // Sorting state
  const [sortField, setSortField] = React.useState<string>('regNumber');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');
  
  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [deleteVehicleId, setDeleteVehicleId] = React.useState<string | null>(null);
  const [deleteVehicleReg, setDeleteVehicleReg] = React.useState<string>('');
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
  
  // Filter the users based on search, filters, and tab status, then apply sorting
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
  const [selectedVehicleId, setSelectedVehicleId] = React.useState<string | null>(null);
  const [isVehicleDetailsDialogOpen, setIsVehicleDetailsDialogOpen] = React.useState(false);
  const [refreshTrigger, setRefreshTrigger] = React.useState(0); // State to trigger refreshes

  // Fetch vehicles from API when component mounts or refreshTrigger changes
  React.useEffect(() => {
    const fetchVehicleData = async () => {
      setLoading(true);
      setError('');
      try {
        const fetchedVehicles = await authClient.fetchVehicles();
        console.log('Fetched vehicles:', fetchedVehicles);
        
        // Transform the vehicle data to match the expected format
        const transformedVehicles = fetchedVehicles.map((vehicle: any) => ({
          id: vehicle.id || '',
          name: vehicle.make || '',
          surname: vehicle.model || '',
          regNumber: vehicle.regNumber || '',
          vehicleType: vehicle.vehicleType || '',
          make: vehicle.make || '',
          model: vehicle.model || '',
          year: vehicle.year || '',
          assignedDriver: vehicle.assignedDriver || '',
          lastServiceDate: vehicle.lastServiceDate || '',
          ownerName: vehicle.ownerName || '',
          ownerAddress: vehicle.ownerAddress || '',
          ownerCellNumber: vehicle.ownerCellNumber || '',
          ownerIdNumber: vehicle.ownerIdNumber || '',
          status: vehicle.status || 'PENDING',
          reason: vehicle.reason || '',
          // Add any other fields needed for the table
        }));
        
        setUsers(transformedVehicles);
      } catch (error_) {
        console.error('Error fetching vehicles:', error_);
        setError('Failed to load vehicles. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleData();
  }, [refreshTrigger]);

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
  
  // Function to handle viewing vehicle details
  const handleViewUserDetails = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    setIsVehicleDetailsDialogOpen(true);
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
  
  // Handle delete vehicle
  const handleDeleteClick = (vehicleId: string, regNumber: string) => {
    setDeleteVehicleId(vehicleId);
    setDeleteVehicleReg(regNumber);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteVehicle = async () => {
    if (!deleteVehicleId) return;
    
    setIsDeleting(true);
    try {
      // TODO: Implement deleteVehicle API method in authClient
      // await authClient.deleteVehicle(deleteVehicleId);
      
      setSnackbarMessage('Vehicle deleted successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      setIsDeleteDialogOpen(false);
      refreshTableData();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      setSnackbarMessage('Failed to delete vehicle');
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
              <TableCell sortDirection={sortField === 'regNumber' ? sortDirection : false}>
                <TableSortLabel
                  active={sortField === 'regNumber'}
                  direction={sortField === 'regNumber' ? sortDirection : 'asc'}
                  onClick={() => handleSort('regNumber')}
                >
                  Registration Number
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={sortField === 'ownerName' ? sortDirection : false}>
                <TableSortLabel
                  active={sortField === 'ownerName'}
                  direction={sortField === 'ownerName' ? sortDirection : 'asc'}
                  onClick={() => handleSort('ownerName')}
                >
                  Owner Name
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={sortField === 'ownerCellNumber' ? sortDirection : false}>
                <TableSortLabel
                  active={sortField === 'ownerCellNumber'}
                  direction={sortField === 'ownerCellNumber' ? sortDirection : 'asc'}
                  onClick={() => handleSort('ownerCellNumber')}
                >
                  Owner Contact
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={sortField === 'ownerIdNumber' ? sortDirection : false}>
                <TableSortLabel
                  active={sortField === 'ownerIdNumber'}
                  direction={sortField === 'ownerIdNumber' ? sortDirection : 'asc'}
                  onClick={() => handleSort('ownerIdNumber')}
                >
                  Owner ID
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={sortField === 'vehicleType' ? sortDirection : false}>
                <TableSortLabel
                  active={sortField === 'vehicleType'}
                  direction={sortField === 'vehicleType' ? sortDirection : 'asc'}
                  onClick={() => handleSort('vehicleType')}
                >
                  Vehicle Type
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
                <TableCell><Skeleton variant="text" width="80%" /></TableCell>
                <TableCell><Skeleton variant="text" width="90%" /></TableCell>
                <TableCell><Skeleton variant="text" width="85%" /></TableCell>
                <TableCell><Skeleton variant="text" width="70%" /></TableCell>
                <TableCell><Skeleton variant="rounded" width={80} height={24} /></TableCell>
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
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No vehicles found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {!loading && filteredRows.map((row) => {
              const isSelected = selected?.has(row.id);
              return (
                <TableRow hover key={row.id} selected={isSelected}>
                  
                  <TableCell>{row.regNumber || 'N/A'}</TableCell>
                  <TableCell>{row.ownerName || 'N/A'}</TableCell>
                  <TableCell>{row.ownerCellNumber || 'N/A'}</TableCell>
                  <TableCell>{row.ownerIdNumber || 'N/A'}</TableCell>
                  <TableCell>{row.vehicleType || 'N/A'}</TableCell>
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
                      {row.status || 'PENDING'}
                    </Box>
                  </TableCell>
                  
            
              
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewUserDetails(row.id)}
                          sx={{
                            color: theme.palette.secondary.main,
                            '&:hover': { bgcolor: 'rgba(50, 56, 62, 0.08)' }
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Vehicle">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(row.id, row.regNumber)}
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
        rowsPerPageOptions={[5, 10, 25]}
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
      />
      
      {/* Vehicle details dialog */}
      <VehicleDetailsDialog
        open={isVehicleDetailsDialogOpen}
        onClose={() => setIsVehicleDetailsDialogOpen(false)}
        vehicleId={selectedVehicleId}
        onRefresh={refreshTableData}
      />
      
      {/* Delete Confirmation Dialog */}
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
            Are you sure you want to delete vehicle <strong>{deleteVehicleReg}</strong>?
            <br />
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setIsDeleteDialogOpen(false)} 
            disabled={isDeleting}
            sx={{ color: 'text.secondary' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDeleteVehicle} 
            variant="contained"
            disabled={isDeleting}
            sx={{
              bgcolor: theme.palette.secondary.main,
              '&:hover': { bgcolor: theme.palette.secondary.dark }
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
