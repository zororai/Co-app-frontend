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
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import CircularProgress from '@mui/material/CircularProgress';
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
  onPageChange?: (newPage: number) => void;
  onRowsPerPageChange?: (newRowsPerPage: number) => void;
}

export function CustomersTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
  onRefresh,
  onPageChange,
  onRowsPerPageChange,
}: CustomersTableProps): React.JSX.Element {
  const [filters, setFilters] = React.useState({
    search: '',
    status: 'all',
    position: 'all',
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

  // Apply pagination after filtering
  const paginatedRows = React.useMemo(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredRows.slice(startIndex, endIndex);
  }, [filteredRows, page, rowsPerPage]);

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
  
  // Discussion dialog state
  const [isDiscussionDialogOpen, setIsDiscussionDialogOpen] = React.useState(false);
  const [discussionCustomer, setDiscussionCustomer] = React.useState<Customer | null>(null);
  const [discussionStatus, setDiscussionStatus] = React.useState<string>('');
  const [discussionReason, setDiscussionReason] = React.useState<string>('');
  const [showReasonField, setShowReasonField] = React.useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  const handleViewCustomer = async (customerId: string) => {
    // Open discussion dialog instead of view dialog
    const customer = rows.find(row => row.id === customerId);
    if (customer) {
      setDiscussionCustomer(customer);
      setIsDiscussionDialogOpen(true);
      setDiscussionStatus('');
      setDiscussionReason('');
      setShowReasonField(false);
    }
  };

  const handleDiscussionStatusChange = (newStatus: string) => {
    setDiscussionStatus(newStatus);
    setShowReasonField(newStatus === 'REJECTED' || newStatus === 'PUSHED_BACK');
    
    // If APPROVED, submit immediately
    if (newStatus === 'APPROVED') {
      handleDiscussionSubmit(newStatus);
    }
  };

  const handleDiscussionSubmit = async (submitStatus?: string) => {
    const actionStatus = submitStatus || discussionStatus;
    if (!actionStatus || !discussionCustomer) return;
    
    if ((actionStatus === 'REJECTED' || actionStatus === 'PUSHED_BACK') && !discussionReason) {
      alert('Please provide a reason.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Call the appropriate API method based on the status
      switch (actionStatus) {
        case 'APPROVED': {
          await authClient.setSectionForApproval(discussionCustomer.id);
          break;
        }
        case 'REJECTED': {
          await authClient.setSectionForRejection(discussionCustomer.id, discussionReason);
          break;
        }
        case 'PUSHED_BACK': {
          await authClient.setSectionForPushBack(discussionCustomer.id, discussionReason);
          break;
        }
        default: {
          throw new Error(`Unsupported status: ${actionStatus}`);
        }
      }

      // Close the dialog after successful update
      setIsDiscussionDialogOpen(false);
      setDiscussionCustomer(null);
      setDiscussionStatus('');
      setDiscussionReason('');
      setShowReasonField(false);

      // Always refresh the table data
      refreshTableData();

    } catch (error) {
      console.error('Error updating section status:', error);
      alert('Failed to update section status. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseDiscussionDialog = () => {
    setIsDiscussionDialogOpen(false);
    setDiscussionCustomer(null);
    setDiscussionStatus('');
    setDiscussionReason('');
    setShowReasonField(false);
    setIsSubmitting(false);
  };

  // Function to refresh the table data
  const refreshTableData = React.useCallback(() => {
    // Increment refresh trigger to force a re-render/refresh
    setRefreshTrigger(prev => prev + 1);
    
    // Call parent's refresh function if provided
    if (onRefresh) {
      onRefresh();
    } else {
      // Fallback: force a full reload to ensure latest data is shown
      try {
        if (typeof window !== 'undefined') {
          globalThis.location.reload();
        }
      } catch (e) {
        // swallow
      }
    }
  }, [onRefresh]);

  return (
    <Card>
      {/* Filters Section */}
      <Box sx={{ 
        p: 2, 
        mb: 2,
        borderRadius: 1,
        bgcolor: '#fff',
        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          {/* Search input with custom styling */}
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
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </Box>
            <input
              type="text"
              placeholder="Search sections..."
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
          
          {/* Dropdown filters */}
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
              <MenuItem value="all">All Positions</MenuItem>
              <MenuItem value="Representatives">Representatives</MenuItem>
              <MenuItem value="Owner">Owner</MenuItem>
              <MenuItem value="Member">Member</MenuItem>
            </Select>
          </FormControl>
          
          <Typography variant="body2" sx={{ ml: 'auto', color: 'text.secondary', fontWeight: 500 }}>
            Showing {filteredRows.length} record{filteredRows.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
      </Box>
      <Divider />
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow>
              <TableCell>Section</TableCell>
              <TableCell>Shaft Numbers</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Decision Panel</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Empty state */}
            {filteredRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No sections found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            
            {/* Data rows */}
            {paginatedRows.map((row) => {
              const isSelected = selected?.has(row.id);
              return (
                <TableRow hover key={row.id} selected={isSelected}>
                  <TableCell>{row.sectionName}</TableCell>
                  <TableCell>{row.numberOfShaft}</TableCell>
                  <TableCell>
                    <Box sx={{
                      display: 'inline-block',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: row.status === 'PENDING' ? '#FFF9C4' : 
                               row.status === 'REJECTED' ? '#FFCDD2' : 
                               row.status === 'PUSHED_BACK' ? '#FFE0B2' : '#C8E6C9',
                      color: row.status === 'PENDING' ? '#F57F17' : 
                             row.status === 'REJECTED' ? '#B71C1C' : 
                             row.status === 'PUSHED_BACK' ? '#E65100' : '#1B5E20',
                      fontWeight: 'medium',
                      fontSize: '0.875rem'
                    }}>
                      {row.status}
                    </Box>
                  </TableCell>
                  <TableCell>{row.reason}</TableCell>
                  <TableCell>
                    <Button 
                      onClick={() => handleViewCustomer(row.id)}
                      variant="contained"
                      size="small"
                      sx={{
                        bgcolor: 'secondary.main',
                        color: '#fff',
                        '&:hover': { bgcolor: 'secondary.dark' },
                        textTransform: 'none'
                      }}
                    >
                      Make A Decision
                    </Button>
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
        onPageChange={(event, newPage) => onPageChange?.(newPage)}
        onRowsPerPageChange={(event) => onRowsPerPageChange?.(parseInt(event.target.value, 10))}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
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
      
      {/* Discussion Dialog */}
      <Dialog open={isDiscussionDialogOpen} onClose={handleCloseDiscussionDialog} maxWidth="sm" fullWidth>
        <DialogTitle 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            p: 2.5,
            bgcolor: 'secondary.main',
            color: 'white'
          }}
        >
          <Typography variant="h6" component="span" sx={{ color: 'white', fontWeight: 600 }}>
            Section Discussion
          </Typography>
          <IconButton 
            onClick={handleCloseDiscussionDialog} 
            size="small"
            sx={{ 
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ p: 2 }}>
            {discussionCustomer && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'secondary.main' }}>
                  Section: {discussionCustomer.sectionName || discussionCustomer.name}
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                  <Typography><strong>Number of Shafts:</strong> {discussionCustomer.shaftNumbers || discussionCustomer.shaftNumbers || 'N/A'}</Typography>
                  <Typography><strong>Current Status: </strong> 
                    <Box 
                      component="span" 
                      sx={{
                        display: 'inline-block',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        ml: 1,
                        bgcolor: discussionCustomer.status === 'PENDING' ? '#FFF9C4' : 
                                 discussionCustomer.status === 'REJECTED' ? '#FFCDD2' : 
                                 discussionCustomer.status === 'PUSHED_BACK' ? '#FFE0B2' : '#C8E6C9',
                        color: discussionCustomer.status === 'PENDING' ? '#F57F17' : 
                               discussionCustomer.status === 'REJECTED' ? '#B71C1C' : 
                               discussionCustomer.status === 'PUSHED_BACK' ? '#E65100' : '#1B5E20',
                        fontWeight: 'medium',
                        fontSize: '0.875rem'
                      }}
                    >
                      {discussionCustomer.status || 'PENDING'}
                    </Box>
                  </Typography>
                </Box>
                {discussionCustomer.reason && (
                  <Typography sx={{ mb: 2 }}><strong>Previous Reason:</strong> {discussionCustomer.reason}</Typography>
                )}
              </Box>
            )}
            
            {showReasonField && (
              <TextField
                label="Reason"
                value={discussionReason}
                onChange={(e) => setDiscussionReason(e.target.value)}
                fullWidth
                margin="normal"
                multiline
                rows={3}
                sx={{ mb: 2 }}
                required
                error={showReasonField && !discussionReason}
                helperText={showReasonField && !discussionReason ? 'Reason is required' : ''}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, flexDirection: 'column', alignItems: 'stretch', gap: 1 }}>
          {/* Action Buttons - Only show if section is not already approved */}
          {discussionCustomer && discussionCustomer.status !== 'APPROVED' && (!discussionStatus || (discussionStatus !== 'REJECTED' && discussionStatus !== 'PUSHED_BACK')) && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 2 }}>
              <Button 
                onClick={() => handleDiscussionStatusChange('APPROVED')}
                variant="contained"
                color="success"
                disabled={isSubmitting}
                sx={{ flex: 1, minHeight: '48px' }}
              >
                Approve
              </Button>
              <Button 
                onClick={() => handleDiscussionStatusChange('PUSHED_BACK')}
                variant="contained"
                color="warning"
                disabled={isSubmitting}
                sx={{ flex: 1, minHeight: '48px' }}
              >
                Push Back
              </Button>
              <Button 
                onClick={() => handleDiscussionStatusChange('REJECTED')}
                variant="contained"
                color="error"
                disabled={isSubmitting}
                sx={{ flex: 1, minHeight: '48px' }}
              >
                Reject
              </Button>
            </Box>
          )}
          
          {/* Message for already approved sections */}
          {discussionCustomer && discussionCustomer.status === 'APPROVED' && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="body1" sx={{ color: 'success.main', fontWeight: 500 }}>
                This section has already been approved.
              </Typography>
            </Box>
          )}
          
          {/* Submit Button for REJECTED or PUSHED_BACK */}
          {(discussionStatus === 'REJECTED' || discussionStatus === 'PUSHED_BACK') && (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button 
                onClick={() => handleDiscussionSubmit()}
                variant="contained"
                disabled={isSubmitting || !discussionReason}
                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                sx={{ 
                  minWidth: '200px',
                  minHeight: '48px',
                  bgcolor: 'secondary.main',
                  color: '#fff',
                  '&:hover': { bgcolor: 'secondary.dark' }
                }}
              >
                {isSubmitting ? 'Submitting...' : `Submit ${discussionStatus.toLowerCase().replace('_', ' ')} status`}
              </Button>
            </Box>
          )}
        </DialogActions>
      </Dialog>
    </Card>
  );
}
