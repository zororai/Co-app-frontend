 

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
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import dayjs from 'dayjs';

import { useSelection } from '@/hooks/use-selection';
import { ReactNode } from 'react';
import { authClient } from '@/lib/auth/client';
import { OreDetailsDialog } from '@/components/dashboard/oreTransport/ore-details-dialog';
import { AssignOreDetailsDialog } from '@/components/dashboard/oreTransport/assign-details-dialog';
import { sortNewestFirst } from '@/utils/sort';

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
  // State to store users fetched from API
  const [users, setUsers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string>('');
  const [filters, setFilters] = React.useState({
    search: '',
    status: 'all',
    position: 'all'
  });

  // Filter the users based on search, filters, and tab status
  const filteredRows = React.useMemo(() => {
 
    
    if (!users || users.length === 0) {
      console.log('No users to filter');
      return [];
    }
    
    const filtered = users.filter(user => {
      // Skip null or undefined users
      if (!user) return false;
      
      const matchesSearch = filters.search === '' || 
        Object.values(user).some(value => 
          value && String(value).toLowerCase().includes(filters.search.toLowerCase())
        );
      
      // Apply dropdown filter - make it more lenient if status is missing
      const matchesDropdownStatus = filters.status === 'all' || !user.status || user.status === filters.status;
      const matchesPosition = filters.position === 'all' || !user.position || user.position === filters.position;
      
      // Apply tab filter if provided - make it more lenient if status is missing
      const matchesTabStatus = statusFilter === null || !user.status || user.status === statusFilter;

      return matchesSearch && matchesDropdownStatus && matchesPosition && matchesTabStatus;
    });
    
    console.log('Filtered rows:', filtered); // Debug: Log the filtered results
    return sortNewestFirst(filtered);
  }, [users, filters, statusFilter]);

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
  const [isAssignDetailsDialogOpen, setIsAssignDetailsDialogOpen] = React.useState(false);
  const [refreshTrigger, setRefreshTrigger] = React.useState(0); // State to trigger refreshes
  
  // States for feedback dialog
  const [feedbackDialogOpen, setFeedbackDialogOpen] = React.useState(false);
  const [feedbackMessage, setFeedbackMessage] = React.useState('');
  const [feedbackSuccess, setFeedbackSuccess] = React.useState(true);

  // Fetch ore data from API when component mounts or refreshTrigger changes
  React.useEffect(() => {
    const fetchOreRecievedData = async () => {
      setLoading(true);
      setError('');
      try {
        const fetchedOres = await authClient.fetchOreRecieved();
        console.log('API Response:', fetchedOres); // Debug: Log the API response
        
    
          setUsers(fetchedOres);
        
      } catch (error_) {
        console.error('Error fetching ore data:', error_);
        setError('Failed to load ore data. Please try again.');
        
        // Use mock data on error
      
      } finally {
        setLoading(false);
      }
    };
    fetchOreRecievedData();
  }, [refreshTrigger]);

  const handleViewCustomer = async (customerId: string) => {
    try {
      const customerDetails = await authClient.fetchOreDetails(customerId);
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
  const handleCostDeduction = async (oreId: string) => {
    try {
      // Show loading state or disable button if needed
      const result = await authClient.applyTax(oreId);
      
      if (result.success) {
        // Show success message in dialog
        setFeedbackSuccess(true);
        setFeedbackMessage('Tax deduction applied successfully');
        setFeedbackDialogOpen(true);
        // Refresh the table data to show updated values
        refreshTableData();
      } else {
        // Show error message in dialog
        setFeedbackSuccess(false);
        setFeedbackMessage(`Failed to apply tax deduction: ${result.error || 'Unknown error'}`);
        setFeedbackDialogOpen(true);
      }
    } catch (error) {
      console.error('Error applying tax deduction:', error);
      setFeedbackSuccess(false);
      setFeedbackMessage('An error occurred while applying tax deduction');
      setFeedbackDialogOpen(true);
    }
  };

  // Function to handle security dispatch approval
  const handleSecurityDispatchApprove = async (oreId: string) => {
    try {
      // Show loading state or disable button if needed
      const result = await authClient.securityRecievedApprove(oreId);
      
      if (result.success) {
        // Show success message in dialog
        setFeedbackSuccess(true);
        setFeedbackMessage('Security Received approved successfully');
        setFeedbackDialogOpen(true);
        // Refresh the table data to show updated values
        refreshTableData();
      } else {
        // Show error message in dialog
        setFeedbackSuccess(false);
        setFeedbackMessage(`Failed to approve Received: ${result.error || 'Unknown error'}`);
        setFeedbackDialogOpen(true);
      }
    } catch (error) {
      console.error('Error approving security dispatch:', error);
      setFeedbackSuccess(false);
      setFeedbackMessage('An error occurred while approving security dispatch');
      setFeedbackDialogOpen(true);
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
        
              <TableCell>Ore ID</TableCell>
              <TableCell>Shaft Numbers</TableCell>
              <TableCell sx={{ backgroundColor: '#ccffcc' }}>New Weight (After Tax Deduction)</TableCell>
              <TableCell sx={{ backgroundColor: '#ccffcc' }}>New Number of Bags (After Tax Deduction)</TableCell>
              <TableCell>Transport Status</TableCell>
              <TableCell>Driver</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Security Status</TableCell>  
              <TableCell>View Details</TableCell>
              <TableCell>Receival</TableCell>
     
              
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading && filteredRows.length === 0 && (
              <TableRow>
              
              </TableRow>
            )}
            {filteredRows.map((row) => {
              const isSelected = selected?.has(row.id);
              return (
                <TableRow hover key={row.id} selected={isSelected}>
                
                  <TableCell>{row.oreUniqueId }</TableCell>
                  <TableCell>{row.shaftNumbers}</TableCell>
                  <TableCell sx={{ backgroundColor: '#ccffcc' }}>{row.newWeight || 0} kg</TableCell>
                  <TableCell sx={{ backgroundColor: '#ccffcc' }}>{row.newnumberOfBags || 0}</TableCell>
                  <TableCell>{row.transportStatus || ''}</TableCell>
                  <TableCell>{row.selectedTransportdriver || ''}</TableCell>
                  <TableCell>{row.location || ''}</TableCell>
                  <TableCell>{row.securityDispatcherStatus || ''}</TableCell>
                  
                  
                 
              
                   <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <button 
                        onClick={() => handleViewUserDetails(row.id)}
                        style={{
                          background: 'none',
                          border: '1px solid #06131fff',
                          color: '#081b2fff',
                          borderRadius: '6px',
                          padding: '2px 12px',
                          cursor: 'pointer',
                          fontWeight: 500,
                      }}>View Ore Details</button>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {/* Conditionally render the button based on security status */}
                        {row.securityDispatcherStatus !== 'APPROVED' && (
                          <button 
                            onClick={() => handleSecurityDispatchApprove(row.id)}
                            style={{
                              background: 'none',
                              border: '1px solid #06131fff',
                              color: '#081b2fff',
                              borderRadius: '6px',
                              padding: '2px 12px',
                              cursor: 'pointer',
                              fontWeight: 500,
                          }}>Approve for Recieved</button>
                        )}
                        {row.securityDispatcherStatus === 'APPROVED' && (
                          <span style={{ color: 'green', fontWeight: 500 }}>Approved</span>
                        )}
                      </Box>
                    }
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
      
      {/* Assign Ore Details dialog */}
      <AssignOreDetailsDialog
        open={isAssignDetailsDialogOpen}
        onClose={() => setIsAssignDetailsDialogOpen(false)}
        userId={selectedUserId}
      />
      {/* Ore Details dialog */}
      <OreDetailsDialog
        open={isUserDetailsDialogOpen}
        onClose={() => setIsUserDetailsDialogOpen(false)}
        userId={selectedUserId}
      />
      
      {/* Feedback Dialog */}
      <Dialog
        open={feedbackDialogOpen}
        onClose={() => {
          setFeedbackDialogOpen(false);
          // Refresh data when dialog is closed if it was a successful operation
          if (feedbackSuccess) {
            refreshTableData();
          }
        }}
        aria-labelledby="feedback-dialog-title"
        aria-describedby="feedback-dialog-description"
      >
        <DialogTitle id="feedback-dialog-title">
          {feedbackSuccess ? 'Success' : 'Error'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="feedback-dialog-description">
            {feedbackMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setFeedbackDialogOpen(false);
              // Refresh data when dialog is closed if it was a successful operation
              if (feedbackSuccess) {
                refreshTableData();
              }
            }} 
            color="primary" 
            variant="contained"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
