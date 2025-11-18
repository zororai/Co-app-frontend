'use client';

import * as React from 'react';

// Removed duplicate local Customer interface. Use the exported one below.
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
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
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Skeleton from '@mui/material/Skeleton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import dayjs from 'dayjs';

import { sortNewestFirst } from '@/utils/sort';

import { useSelection } from '@/hooks/use-selection';
import { ReactNode } from 'react';
import { authClient } from '@/lib/auth/client';
//import { OreDetailsDialog } from '@/components/dashboard/Sample_Ore_Approval/sampleapprove-details-dialog';
import { OreDetailsDialog  } from '@/components/dashboard/Sample_Ore_Approval/sampleapprove-details-dialog';

// ============================================================================
// STYLING CONSTANTS
// ============================================================================

const TABLE_STYLES = {
  headerCell: {
    fontWeight: 600,
    fontSize: '0.875rem',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    whiteSpace: 'nowrap' as const,
    backgroundColor: '#f5f5f5',
    borderBottom: '2px solid #e0e0e0',
  },
  bodyCell: {
    fontSize: '0.875rem',
    padding: '12px 16px',
    borderBottom: '1px solid #f0f0f0',
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'capitalize' as const,
    display: 'inline-block',
    whiteSpace: 'nowrap' as const,
    letterSpacing: 0.3,
  },
  avatarSize: {
    width: 40,
    height: 40,
    fontSize: '0.875rem',
    fontWeight: 600,
  },
  actionButton: {
    padding: '6px 12px',
    minWidth: 'auto',
    fontSize: '0.75rem',
    fontWeight: 500,
    textTransform: 'none' as const,
  },
};

const STATUS_COLORS = {
  approved: { bg: '#e8f5e9', text: '#2e7d32', border: '#c8e6c9' },
  pending: { bg: '#fff3e0', text: '#e65100', border: '#ffe0b2' },
  rejected: { bg: '#ffebee', text: '#c62828', border: '#ffcdd2' },
  pushed_back: { bg: '#f3e5f5', text: '#6a1b9a', border: '#e1bee7' },
  unknown: { bg: '#eeeeee', text: '#616161', border: '#e0e0e0' },
};

const FILTER_STYLES = {
  container: {
    p: 2.5,
    mb: 2,
    borderRadius: '8px',
    bgcolor: '#fafafa',
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e0e0e0',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    px: 1.5,
    py: 0.75,
    minWidth: 240,
    backgroundColor: '#fff',
    transition: 'all 0.2s ease',
    '&:focus-within': {
      borderColor: '#06131f',
      boxShadow: '0px 0px 0px 3px rgba(6, 19, 31, 0.1)',
    },
  },
};

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
  const [isMillAssignDialogOpen, setIsMillAssignDialogOpen] = React.useState(false);
  const [isSampleUpdateDialogOpen, setIsSampleUpdateDialogOpen] = React.useState(false);
  const [isSampleResultsDialogOpen, setIsSampleResultsDialogOpen] = React.useState(false);
  
  // Sample update form state
  const [sampleType, setSampleType] = React.useState('');
  const [sampleWeight, setSampleWeight] = React.useState('');
  const [sampleSize, setSampleSize] = React.useState('');
  const [sampleStatus, setSampleStatus] = React.useState('pending for results');
  
  // Sample results form state
  const [sampleReason, setSampleReason] = React.useState('');
  const [sampleResult, setSampleResult] = React.useState('0.0');
  const [sampleResultStatus, setSampleResultStatus] = React.useState('');
  const [selectedMill, setSelectedMill] = React.useState<string>('');
  const [mills, setMills] = React.useState<any[]>([]);
  const [millsLoading, setMillsLoading] = React.useState<boolean>(false);
  const [millsError, setMillsError] = React.useState<string>('');
  const [selectedMillDetails, setSelectedMillDetails] = React.useState<{millName: string, millLocation: string, millType: string} | null>(null);
  const [notes, setNotes] = React.useState<string>('');
  const [refreshTrigger, setRefreshTrigger] = React.useState(0); // State to trigger refreshes
  
  // States for feedback dialog
  const [feedbackDialogOpen, setFeedbackDialogOpen] = React.useState(false);
  const [feedbackMessage, setFeedbackMessage] = React.useState('');
  const [feedbackSuccess, setFeedbackSuccess] = React.useState(true);
  
  // Loading state for form submissions
  const [isLoading, setIsLoading] = React.useState(false);

  // Fetch ore data from API when component mounts or refreshTrigger changes
  React.useEffect(() => {
    const fetchOreRecievedData = async () => {
      setLoading(true);
      setError('');
      try {
        const fetchedOres = await authClient.fetchOreRecieve();
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
  
  // Fetch activated mills when component mounts
 

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
  
  // Function to handle opening the sample update dialog
  const handleOpenSampleUpdateDialog = (userId: string) => {
    setSelectedUserId(userId);
    // Reset form fields
    setSampleType('');
    setSampleWeight('');
    setSampleSize('');
    setSampleStatus('pending for results');
    setIsSampleUpdateDialogOpen(true);
  };
  
  // Function to handle opening the sample results dialog
  const handleOpenSampleResultsDialog = (userId: string) => {
    setSelectedUserId(userId);
    // Reset form fields with appropriate default values
    setSampleReason('Sample analysis complete');
    setSampleResult('0.0'); // Default numeric value as string
    setSampleResultStatus('APPROVED'); // Default status (normalized for backend)
    setIsSampleResultsDialogOpen(true);
  };
  
  // Function to handle assigning mill to ore
  const handleAssignMill = (oreId: string) => {
    setSelectedUserId(oreId);
    setSelectedMill('');
    setSelectedMillDetails(null);
    setNotes('');
    setIsMillAssignDialogOpen(true);
  };
  
  // Function to handle mill selection change
  const handleMillChange = (event: SelectChangeEvent) => {
    const millId = event.target.value;
    setSelectedMill(millId);
    
    // Find the selected mill details
    const selectedMill = mills.find(mill => mill.id === millId);
    if (selectedMill) {
      setSelectedMillDetails({
        millName: selectedMill.name,
        millLocation: selectedMill.location || '',
        millType: selectedMill.type || ''
      });
    } else {
      setSelectedMillDetails(null);
    }
  };
  
  // Function to handle sample update form submission
  const handleSubmitSampleUpdate = async () => {
    if (!selectedUserId) {
      setFeedbackSuccess(false);
      setFeedbackMessage('No ore transport selected');
      setFeedbackDialogOpen(true);
      return;
    }
    
    // Validate form fields
    if (!sampleType || !sampleWeight || !sampleStatus) {
      setFeedbackSuccess(false);
      setFeedbackMessage('Please fill in all sample fields');
      setFeedbackDialogOpen(true);
      return;
    }
    
    try {
      // Call the API to update the sample data
      const result = await authClient.collectSample(
        selectedUserId,
        sampleType,
        sampleWeight,
        sampleStatus
      );
      
      if (result.success) {
        // Close the dialog and show success message
        setIsSampleUpdateDialogOpen(false);
        setFeedbackSuccess(true);
        setFeedbackMessage('Sample data updated successfully');
        setFeedbackDialogOpen(true);
        // Refresh the table data
        refreshTableData();
      } else {
        throw new Error(result.error || 'Failed to update sample data');
      }
    } catch (error) {
      console.error('Error updating sample data:', error);
      setFeedbackSuccess(false);
      setFeedbackMessage(`Failed to update sample data: ${error instanceof Error ? error.message : 'Please try again.'}`);
      setFeedbackDialogOpen(true);
    }
  };
  
  // Function to handle sample results form submission
  const handleSubmitSampleResults = async () => {
    if (!selectedUserId) {
      setFeedbackSuccess(false);
      setFeedbackMessage('No ore transport selected');
      setFeedbackDialogOpen(true);
      return;
    }
    
    // Validate form fields
    if (!sampleReason || !sampleResult || !sampleResultStatus) {
      setFeedbackSuccess(false);
      setFeedbackMessage('Please fill in all sample result fields');
      setFeedbackDialogOpen(true);
      return;
    }
    
    // Show loading state
    setIsLoading(true);
    
    try {
      // Convert sampleResult to a number if it's a numeric string
      const numericResult = Number.parseFloat(sampleResult) || 0;
      console.log('Submitting sample results:', {
        oreId: selectedUserId,
        reason: sampleReason,
        result: numericResult,
        status: sampleResultStatus
      });
      
      // Call the API to update the sample results
      const result = await authClient.updateSampleResults(
        selectedUserId,
        sampleReason,
        numericResult.toString(), // Convert back to string for API parameter
        (sampleResultStatus || '').toUpperCase()
      );
      
      // Hide loading state
      setIsLoading(false);
      
      if (result.success) {
        // Close the dialog and show success message
        setIsSampleResultsDialogOpen(false);
        setFeedbackSuccess(true);
        setFeedbackMessage('Sample results updated successfully');
        setFeedbackDialogOpen(true);
        // Refresh the table data
        refreshTableData();
      } else {
        throw new Error(result.error || 'Failed to update sample results');
      }
    } catch (error) {
      // Hide loading state
      setIsLoading(false);
      
      console.error('Error updating sample results:', error);
      setFeedbackSuccess(false);
      
      // Provide more specific error messages based on common issues
      let errorMessage = 'Failed to update sample results';
      
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('unauthorized')) {
          errorMessage = 'Authentication error. Please log in again.';
        } else if (error.message.includes('404')) {
          errorMessage = 'Ore transport record not found. It may have been deleted.';
        } else if (error.message.includes('network') || error.message.includes('failed to fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else {
          errorMessage = `${error.message}`;
        }
      }
      
      setFeedbackMessage(errorMessage);
      setFeedbackDialogOpen(true);
    }
  };
  
  // Function to handle mill assignment submission
  const handleMillAssignment = async () => {
    if (!selectedUserId || !selectedMill) {
      setFeedbackSuccess(false);
      setFeedbackMessage('Please select a mill');
      setFeedbackDialogOpen(true);
      return;
    }
    
    try {
      // Get the selected mill details
      const millDetails = selectedMillDetails || {
        millName: '',
        millLocation: '',
        millType: ''
      };
      
      // Call the API to assign the mill to the ore
      const result = await authClient.assignMillToOre(
        selectedUserId,
        selectedMill,
        millDetails.millName,
        millDetails.millType,
        millDetails.millLocation
      );
      
      if (result.success) {
        setIsMillAssignDialogOpen(false);
        setFeedbackSuccess(true);
        setFeedbackMessage('Mill assigned successfully');
        setFeedbackDialogOpen(true);
        refreshTableData();
      } else {
        throw new Error(result.error || 'Failed to assign mill');
      }
    } catch (error) {
      console.error('Error assigning mill:', error);
      setFeedbackSuccess(false);
      setFeedbackMessage(`Failed to assign mill: ${error instanceof Error ? error.message : 'Please try again.'}`);
      setFeedbackDialogOpen(true);
    }
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
      <Box sx={FILTER_STYLES.container}>
        <Typography 
          variant="subtitle2" 
          sx={{ 
            fontWeight: 600, 
            mb: 2,
            color: '#333',
            fontSize: '0.95rem',
            letterSpacing: 0.3,
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
          <Box sx={FILTER_STYLES.searchBox}>
            <Box component="span" sx={{ color: '#9e9e9e', mr: 1, display: 'flex', alignItems: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
              </svg>
            </Box>
            <input
              type="text"
              placeholder="Search by ore ID, shaft number..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              style={{
                border: 'none',
                outline: 'none',
                width: '100%',
                background: 'transparent',
                fontSize: '0.875rem',
                color: '#333',
              }}
            />
          </Box>
          <FormControl sx={{ minWidth: 160 }}>
            <Select
              value={filters.status}
              displayEmpty
              size="small"
              sx={{ 
                '& .MuiSelect-select': { 
                  py: 1,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                },
                '& .MuiOutlinedInput-root': {
                  borderRadius: '6px',
                  backgroundColor: '#fff',
                },
              }}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <MenuItem value="all" sx={{ fontSize: '0.875rem' }}>All Status</MenuItem>
              <MenuItem value="PENDING" sx={{ fontSize: '0.875rem' }}>Pending</MenuItem>
              <MenuItem value="REJECTED" sx={{ fontSize: '0.875rem' }}>Rejected</MenuItem>
              <MenuItem value="PUSHED_BACK" sx={{ fontSize: '0.875rem' }}>Pushed Back</MenuItem>
              <MenuItem value="APPROVED" sx={{ fontSize: '0.875rem' }}>Approved</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 160 }}>
            <Select
              value={filters.position}
              displayEmpty
              size="small"
              sx={{ 
                '& .MuiSelect-select': { 
                  py: 1,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                },
                '& .MuiOutlinedInput-root': {
                  borderRadius: '6px',
                  backgroundColor: '#fff',
                },
              }}
              onChange={(e) => setFilters(prev => ({ ...prev, position: e.target.value }))}
            >
              <MenuItem value="all" sx={{ fontSize: '0.875rem' }}>All Roles</MenuItem>
              <MenuItem value="Representatives" sx={{ fontSize: '0.875rem' }}>Representatives</MenuItem>
              <MenuItem value="Owner" sx={{ fontSize: '0.875rem' }}>Owner</MenuItem>
              <MenuItem value="Member" sx={{ fontSize: '0.875rem' }}>Member</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
          

              <TableCell sx={TABLE_STYLES.headerCell}>Shaft Numbers</TableCell>
              
              <TableCell sx={TABLE_STYLES.headerCell}>Sample Type</TableCell>
              <TableCell sx={TABLE_STYLES.headerCell}>Sample Weight</TableCell>
              <TableCell sx={TABLE_STYLES.headerCell}>Sample Status</TableCell>
              <TableCell sx={TABLE_STYLES.headerCell}>Sample Results</TableCell>
              <TableCell sx={TABLE_STYLES.headerCell}>View Details</TableCell>
              <TableCell sx={TABLE_STYLES.headerCell}>Collect Sample</TableCell>
              <TableCell sx={TABLE_STYLES.headerCell}>Sample Results</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading && filteredRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} sx={{ textAlign: 'center', py: 3 }}>
                  <Typography color="textSecondary">No ore data found</Typography>
                </TableCell>
              </TableRow>
            )}
            {filteredRows.map((row) => {
              const isSelected = selected?.has(row.id);
              const statusKey = ((row.oreSample && row.oreSample[0] && row.oreSample[0].status?.toLowerCase().replace('_', '_')) || 'unknown') as keyof typeof STATUS_COLORS;
              const statusColor = STATUS_COLORS[statusKey] || STATUS_COLORS.unknown;
              
              return (
                <TableRow 
                  hover 
                  key={row.id} 
                  selected={isSelected}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(6, 19, 31, 0.03)',
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(6, 19, 31, 0.08)',
                    },
                  }}
                >
                

                  <TableCell sx={TABLE_STYLES.bodyCell}>{row.shaftNumbers || 'N/A'}</TableCell>
                  <TableCell sx={TABLE_STYLES.bodyCell}>
                    {row.oreSample && row.oreSample[0] ? row.oreSample[0].sampleType : 'N/A'}
                  </TableCell>
                  <TableCell sx={TABLE_STYLES.bodyCell}>
                    {row.oreSample && row.oreSample[0] ? row.oreSample[0].sampleWeight : 'N/A'}
                  </TableCell>
                  <TableCell sx={TABLE_STYLES.bodyCell}>
                    <Box
                      component="span"
                      sx={{
                        ...TABLE_STYLES.statusBadge,
                        backgroundColor: statusColor.bg,
                        color: statusColor.text,
                        border: `1px solid ${statusColor.border}`,
                      }}
                    >
                      {row.oreSample && row.oreSample[0] 
                        ? (row.oreSample[0].status === 'Unknown' ? 'PENDING' : row.oreSample[0].status)
                        : 'PENDING'
                      }
                    </Box>
                  </TableCell>
                  <TableCell sx={TABLE_STYLES.bodyCell}>
                    {row.oreSample && row.oreSample[0] && row.oreSample[0].result 
                      ? `${row.oreSample[0].result}g`
                      : 'Pending'
                    }
                  </TableCell>
                  <TableCell sx={TABLE_STYLES.bodyCell}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Button 
                        onClick={() => handleViewUserDetails(row.id)}
                        variant="outlined"
                        size="small"
                        startIcon={<VisibilityIcon sx={{ fontSize: '0.875rem' }} />}
                        sx={{
                          /* remove border while keeping visual text/icon */
                          border: 'none',
                          boxShadow: 'none',
                          color: '#081b2f',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          textTransform: 'none',
                          padding: '6px 10px',
                        }}
                      >
                      </Button>
                    </Box>
                  </TableCell>
                  <TableCell sx={TABLE_STYLES.bodyCell}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {(row.oreSample && row.oreSample[0] && 
                         row.oreSample[0].sampleType === 'Unknown') && (
                        <Button 
                          onClick={() => handleOpenSampleUpdateDialog(row.id)}
                          variant="contained"
                          size="small"
                          sx={{
                            backgroundColor: '#06131f',
                            color: '#fff',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            textTransform: 'none',
                            padding: '6px 10px',
                            '&:hover': {
                              backgroundColor: '#000814',
                            }
                          }}
                        >
                          Collect
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell sx={TABLE_STYLES.bodyCell}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {!(row.oreSample && row.oreSample[0] && 
                          (row.oreSample[0].status === 'APPROVED' || row.oreSample[0].sampleType === 'Unknown')) && (
                        <Button 
                          onClick={() => handleOpenSampleResultsDialog(row.id)}
                          variant="outlined"
                          size="small"
                         sx={{
                            backgroundColor: '#06131f',
                            color: '#fff',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            textTransform: 'none',
                            padding: '6px 10px',
                            '&:hover': {
                              backgroundColor: '#000814',
                            }
                          }}
                        >
                          Add Results
                        </Button>
                      )}
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
      
      {/* Assign Ore Details dialog */}
   
      {/* Ore Details dialog */}
      <OreDetailsDialog
        open={isUserDetailsDialogOpen}
        onClose={() => setIsUserDetailsDialogOpen(false)}
        userId={selectedUserId}
      />
      {/* Mill Assignment dialog */}
      <Dialog
        open={isMillAssignDialogOpen}
        onClose={() => setIsMillAssignDialogOpen(false)}
        aria-labelledby="mill-assignment-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="mill-assignment-dialog-title">Assign Mill</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel id="mill-select-label">Select Mill</InputLabel>
            {millsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : millsError ? (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {millsError}
              </Typography>
            ) : (
              <Select
                labelId="mill-select-label"
                id="mill-select"
                value={selectedMill}
                onChange={handleMillChange}
                label="Select Mill"
              >
                <MenuItem value=""><em>Select a mill</em></MenuItem>
                {mills.map((mill) => (
                  <MenuItem key={mill.id} value={mill.id}>
                    {mill.millName}
                  </MenuItem>
                ))}
              </Select>
            )}
          </FormControl>
          
          {selectedMillDetails && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Mill Details
              </Typography>
              <Typography variant="body2">
                <strong>Mill Model :</strong> {selectedMillDetails.millName}
              </Typography>
              <Typography variant="body2">
                <strong>Mill Location:</strong> {selectedMillDetails.millLocation}
              </Typography>
              <Typography variant="body2">
                <strong>Mill Type:</strong> {selectedMillDetails.millType}
              </Typography>
            </Box>
          )}
          

        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsMillAssignDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleMillAssignment} 
            color="primary" 
            variant="contained"
            disabled={!selectedMill}
          >
            Assign Mill
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Sample Update Dialog */}
      <Dialog
        open={isSampleUpdateDialogOpen}
        onClose={() => setIsSampleUpdateDialogOpen(false)}
        PaperProps={{
          sx: {
            width: '100%',
            maxWidth: '600px',
            borderRadius: '12px',
          }
        }}
      >
          <DialogTitle sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: theme.palette.secondary.main,
            color: 'white',
            py: 2.5,
            px: 3,
            m: 0,
            fontWeight: 600,
            fontSize: '1.1rem'
          }}>
            <Box component="div" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>Update Sample Information</Box>
            <IconButton
              edge="end"
              onClick={() => setIsSampleUpdateDialogOpen(false)}
              aria-label="close"
              sx={{
                color: 'white',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' }
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              label="Sample Type"
              name="sampleType"
              value={sampleType}
              onChange={(e) => setSampleType(e.target.value)}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                },
              }}
            />
            <TextField
              fullWidth
              label="Sample Weight"
              name="sampleWeight"
              value={sampleWeight}
              onChange={(e) => setSampleWeight(e.target.value)}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                },
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={sampleStatus}
                label="Status"
                onChange={(e) => setSampleStatus(e.target.value)}
                sx={{
                  borderRadius: '8px',
                }}
              >
                <MenuItem value="Unknown">Pending for Results</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
          <Button 
            onClick={() => setIsSampleUpdateDialogOpen(false)}
            sx={{ 
              color: 'text.secondary',
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitSampleUpdate}
            variant="contained"
            sx={{
              backgroundColor: '#06131f',
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: '#000814',
              }
            }}
          >
            Update Sample
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Sample Results Dialog */}
      <Dialog
        open={isSampleResultsDialogOpen}
        onClose={() => setIsSampleResultsDialogOpen(false)}
        PaperProps={{
          sx: {
            width: '100%',
            maxWidth: '600px',
            borderRadius: '12px',
          }
        }}
      >
          <DialogTitle sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: theme.palette.secondary.main,
            color: 'white',
            py: 2.5,
            px: 3,
            m: 0,
            fontWeight: 600,
            fontSize: '1.1rem'
          }}>
            <Box component="div" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>Add Sample Results</Box>
            <IconButton
              edge="end"
              onClick={() => setIsSampleResultsDialogOpen(false)}
              aria-label="close"
              sx={{
                color: 'white',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' }
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              label="Result In Grams Per Load"
              name="sampleResult"
              type="number"
              inputProps={{ step: '0.01', min: '0' }}
              value={sampleResult}
              onChange={(e) => setSampleResult(e.target.value)}
              placeholder="Enter sample result value in grams"
              helperText="Enter a numeric value (e.g., 12.5)"
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                },
              }}
            />
            <TextField
              fullWidth
              label="Reason"
              name="sampleReason"
              value={sampleReason}
              onChange={(e) => setSampleReason(e.target.value)}
              placeholder="Enter reason for the sample result"
              variant="outlined"
              multiline
              rows={3}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                },
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={sampleResultStatus}
                label="Status"
                onChange={(e) => setSampleResultStatus((e.target.value || '').toString().toUpperCase())}
                sx={{
                  borderRadius: '8px',
                }}
              >
                <MenuItem value="APPROVED">Approved</MenuItem>
                <MenuItem value="REJECTED">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
          <Button 
            onClick={() => setIsSampleResultsDialogOpen(false)}
            sx={{ 
              color: 'text.secondary',
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitSampleResults}
            variant="contained"
            disabled={isLoading}
            sx={{
              backgroundColor: '#06131f',
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: '#000814',
              },
              '&:disabled': {
                backgroundColor: '#ccc',
              }
            }}
          >
            {isLoading ? 'Submitting...' : 'Submit Results'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Feedback Dialog */}
      <Dialog
        open={feedbackDialogOpen}
        onClose={() => {
          setFeedbackDialogOpen(false);
          if (feedbackSuccess) {
            refreshTableData();
          }
        }}
        aria-labelledby="feedback-dialog-title"
        aria-describedby="feedback-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: '12px',
          }
        }}
      >
        <DialogTitle 
          id="feedback-dialog-title"
          sx={{ 
            fontWeight: 600, 
            fontSize: '1.1rem',
            color: feedbackSuccess ? '#2e7d32' : '#c62828',
            backgroundColor: feedbackSuccess ? '#e8f5e9' : '#ffebee',
            borderBottom: feedbackSuccess 
              ? '2px solid #2e7d32' 
              : '2px solid #c62828',
          }}
        >
          {feedbackSuccess ? '✓ Success' : '✕ Error'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <DialogContentText id="feedback-dialog-description" sx={{ color: '#333' }}>
            {feedbackMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
          <Button 
            onClick={() => {
              setFeedbackDialogOpen(false);
              if (feedbackSuccess) {
                refreshTableData();
              }
            }} 
            variant="contained"
            sx={{
              backgroundColor: feedbackSuccess ? '#2e7d32' : '#c62828',
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: feedbackSuccess ? '#1b5e20' : '#b71c1c',
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
