'use client';

import * as React from 'react';
import {
  Avatar,
  Box,
  Card,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  TableSortLabel,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Button,
  Skeleton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { DotsThreeVertical as DotsThreeVerticalIcon } from '@phosphor-icons/react/dist/ssr/DotsThreeVertical';
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { PencilSimple as PencilSimpleIcon } from '@phosphor-icons/react/dist/ssr/PencilSimple';
import { Trash as TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { authClient } from '@/lib/auth/client';
import { ContraventionDetailsDialog } from './contravention-details-dialog';

export interface Penalty {
  id: string;
  shaftnumber: string;
  issuedAt: string;
  fineAmount: number;
  shaftStatus: string;
  status: string;
  // Legacy fields for backward compatibility
  employeeName?: string;
  employeeId?: string;
  violationType?: string;
  description?: string;
  penaltyAmount?: number;
  issueDate?: string;
  dueDate?: string;
  issuedBy?: string;
  department?: string;
  location?: string;
}

function noop(): void {
  // This is intentional
}

interface PenaltyTableProps {
  count?: number;
  page?: number;
  rows?: Penalty[];
  rowsPerPage?: number;
  loading?: boolean;
  error?: string;
  onRefresh?: () => void;
}

export function PenaltyTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 10,
  loading = false,
  error = '',
  onRefresh
}: PenaltyTableProps): React.JSX.Element {
  
  // Contraventions data state
  const [contraventions, setContraventions] = React.useState<Penalty[]>([]);
  const [contraventionsLoading, setContraventionsLoading] = React.useState(false);
  const [contraventionsError, setContraventionsError] = React.useState('');
  
  // Filter state
  const [filters, setFilters] = React.useState({
    search: '',
    status: 'all',
    violationType: 'all'
  });
  
  // Sorting state - default to newest first by issuedAt/issueDate
  const [sortField, setSortField] = React.useState<string>('issuedAt');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('desc');
  
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set());
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedPenalty, setSelectedPenalty] = React.useState<string | null>(null);
  
  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [selectedPenaltyId, setSelectedPenaltyId] = React.useState<string | null>(null);
  
  // Delete dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [penaltyToDelete, setPenaltyToDelete] = React.useState<{ id: string; name: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  
  // Success/Error states
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<'success' | 'error'>('success');

  // Fetch contraventions data
  const fetchContraventions = React.useCallback(async () => {
    setContraventionsLoading(true);
    setContraventionsError('');
    
    try {
      const result = await authClient.fetchContraventions();
      
      if (result.success && result.data) {
        // Transform API data to match our interface
        const transformedData: Penalty[] = result.data.map((item: any) => ({
          id: item.id || Math.random().toString(36).substr(2, 9),
          shaftnumber: item.shaftnumber || '',
          shaftStatus: item.shaftStatus || '',
          issuedAt: item.issuedAt || '',
          fineAmount: item.fineAmount || 0,
          status: item.status || 'Pending',
          // Map to legacy fields for display compatibility
          employeeName: item.shaftnumber || 'Unknown',
          employeeId: item.mineNumber || '',
          violationType: 'Contravention',
          description: item.descriptionOfOffence || '',
          penaltyAmount: item.fineAmount || 0,
          issueDate: item.issuedAt || '',
          dueDate: item.issuedAt || '',
          issuedBy: item.raisedby || '',
          department: 'Mining',
          location: item.place || ''
        }));
        
        setContraventions(transformedData);
      } else {
        setContraventionsError(result.error || 'Failed to fetch contraventions');
      }
    } catch (error) {
      setContraventionsError('An error occurred while fetching contraventions');
      console.error('Error fetching contraventions:', error);
    } finally {
      setContraventionsLoading(false);
    }
  }, []);

  // Load contraventions on component mount
  React.useEffect(() => {
    fetchContraventions();
  }, [fetchContraventions]);

  // Sorting function
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filtering and sorting logic
  const filteredRows = React.useMemo(() => {
    // Use contraventions data if available, otherwise fall back to props rows
    const dataToFilter = contraventions.length > 0 ? contraventions : rows;
    let filtered = dataToFilter.filter(row => {
      const matchesSearch = filters.search === '' || 
        (row.employeeName || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (row.employeeId || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (row.violationType || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (row.description || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        row.shaftnumber.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesStatus = filters.status === 'all' || row.status === filters.status;
      const matchesViolationType = filters.violationType === 'all' || (row.violationType || '') === filters.violationType;
      
      return matchesSearch && matchesStatus && matchesViolationType;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortField as keyof Penalty];
      let bValue: any = b[sortField as keyof Penalty];
      
      if (sortField === 'issueDate' || sortField === 'dueDate') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (sortField === 'penaltyAmount') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [contraventions, rows, filters, sortField, sortDirection]);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, penaltyId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedPenalty(penaltyId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPenalty(null);
  };

  const [contraventionDetails, setContraventionDetails] = React.useState<any>(null);

  const handleViewPenalty = async (penaltyId: string) => {
    try {
      const result = await authClient.fetchContraventionById(penaltyId);
      if (result.success && result.data) {
        setContraventionDetails(result.data);
        setViewDialogOpen(true);
      } else {
        setSnackbarMessage('Failed to fetch contravention details');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error fetching contravention details:', error);
      setSnackbarMessage('Error fetching contravention details');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setContraventionDetails(null);
  };

  const handleEditPenalty = (penaltyId: string) => {
    setSelectedPenaltyId(penaltyId);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedPenaltyId(null);
  };

  const handleEditSuccess = () => {
    setSnackbarMessage('Penalty updated successfully');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    
    // Refresh the table
    fetchContraventions();
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleDeletePenalty = (penaltyId: string, employeeName: string) => {
    setPenaltyToDelete({ id: penaltyId, name: employeeName });
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setPenaltyToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!penaltyToDelete) return;

    setDeleteLoading(true);
    try {
      // TODO: Replace with actual delete penalty API call
      // const result = await authClient.deletePenalty(penaltyToDelete.id);
      
      // Mock success for now
      const result = { success: true };
      
      if (result.success) {
        setSnackbarMessage('Penalty deleted successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
        // Refresh the table
        fetchContraventions();
        if (onRefresh) {
          onRefresh();
        }
      } else {
        setSnackbarMessage('Failed to delete penalty');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (error) {
      setSnackbarMessage('An error occurred while deleting the penalty');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setDeleteLoading(false);
      handleCloseDeleteDialog();
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const getStatusColor = (status: Penalty['status']) => {
    switch (status) {
      case 'Pending':
        return 'info';
      case 'Paid':
        return 'success';
      case 'Overdue':
        return 'error';
      case 'Cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  // Use contraventions data for selection logic
  const dataForSelection = contraventions.length > 0 ? contraventions : rows;
  const selectedSome = selectedRows.size > 0 && selectedRows.size < dataForSelection.length;
  const selectedAll = dataForSelection.length > 0 && selectedRows.size === dataForSelection.length;
  
  // Determine current loading and error states
  const currentLoading = contraventionsLoading || loading;
  const currentError = contraventionsError || error;

  return (
    <Card>      
      {/* Loading and Error States */}
      {currentLoading && (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography>Loading contraventions...</Typography>
        </Box>
      )}
      
      {!currentLoading && currentError && (
        <Box sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
          <Typography>{currentError}</Typography>
          <Button 
            variant="outlined" 
            sx={{ mt: 2 }} 
            onClick={() => {
              fetchContraventions();
              if (onRefresh) onRefresh();
            }}
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
              placeholder="Search penalties..."
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
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Paid">Paid</MenuItem>
              <MenuItem value="Overdue">Overdue</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <Select
              value={filters.violationType}
              displayEmpty
              size="small"
              sx={{ 
                '& .MuiSelect-select': { 
                  py: 1,
                  fontSize: '14px'
                }
              }}
              onChange={(e) => setFilters(prev => ({ ...prev, violationType: e.target.value }))}
            >
              <MenuItem value="all">All Violations</MenuItem>
              <MenuItem value="Safety Violation">Safety Violation</MenuItem>
              <MenuItem value="Equipment Misuse">Equipment Misuse</MenuItem>
              <MenuItem value="Procedure Violation">Procedure Violation</MenuItem>
              <MenuItem value="Environmental Violation">Environmental Violation</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow>
              <TableCell sortDirection={sortField === 'employeeName' ? sortDirection : false}>
                <TableSortLabel
                  active={sortField === 'employeeName'}
                  direction={sortField === 'employeeName' ? sortDirection : 'asc'}
                  onClick={() => handleSort('employeeName')}
                >
                     Shaft Number
                </TableSortLabel>
              </TableCell>
            
              <TableCell sortDirection={sortField === 'penaltyAmount' ? sortDirection : false}>
                <TableSortLabel
                  active={sortField === 'penaltyAmount'}
                  direction={sortField === 'penaltyAmount' ? sortDirection : 'asc'}
                  onClick={() => handleSort('penaltyAmount')}
                >
                  Amount
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={sortField === 'issueDate' ? sortDirection : false}>
                <TableSortLabel
                  active={sortField === 'issueDate'}
                  direction={sortField === 'issueDate' ? sortDirection : 'asc'}
                  onClick={() => handleSort('issueDate')}
                >
                  Issue Date
                </TableSortLabel>
              </TableCell>
           
              <TableCell sortDirection={sortField === 'status' ? sortDirection : false}>
                <TableSortLabel
                  active={sortField === 'status'}
                  direction={sortField === 'status' ? sortDirection : 'asc'}
                  onClick={() => handleSort('status')}
                >
                 Payment Status
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={sortField === 'status' ? sortDirection : false}>
                <TableSortLabel
                  active={sortField === 'status'}
                  direction={sortField === 'status' ? sortDirection : 'asc'}
                  onClick={() => handleSort('status')}
                >
                 Shaft Status
                </TableSortLabel>
              </TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentLoading && (
              // Show skeleton rows while loading
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell><Skeleton variant="text" width="80%" /></TableCell>
                  <TableCell><Skeleton variant="text" width="80%" /></TableCell>
                  <TableCell><Skeleton variant="text" width="90%" /></TableCell>
                  <TableCell><Skeleton variant="text" width="85%" /></TableCell>
                  <TableCell><Skeleton variant="text" width="85%" /></TableCell>
                  <TableCell><Skeleton variant="rounded" width={80} height={24} /></TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Skeleton variant="circular" width={32} height={32} />
                      <Skeleton variant="circular" width={32} height={32} />
                      <Skeleton variant="circular" width={32} height={32} />
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
            {!currentLoading && filteredRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No penalties found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {!currentLoading && filteredRows.map((row) => {
              const isSelected = selectedRows.has(row.id);
              return (
                <TableRow hover key={row.id} selected={isSelected}>
                  <TableCell>
                    <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>

                      <Box>
                       <Typography variant="body2" color="text.secondary">
                         {row.shaftnumber}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      ${(row.fineAmount || row.penaltyAmount || 0).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>{new Date(row.issuedAt || row.issueDate || '').toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Box sx={{
                      display: 'inline-block',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: 
                        row.status === 'Pending' ? '#FFF9C4' : 
                        row.status === 'Overdue' ? '#FFCDD2' : 
                        row.status === 'Cancelled' ? '#F3E5F5' : 
                        '#C8E6C9',
                      color: 
                        row.status === 'Pending' ? '#F57F17' : 
                        row.status === 'Overdue' ? '#B71C1C' : 
                        row.status === 'Cancelled' ? '#4A148C' : 
                        '#1B5E20',
                      fontWeight: 'medium',
                      fontSize: '0.875rem'
                    }}>
                      {row.status}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{
                      display: 'inline-block',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: 
                        row.shaftStatus === 'SUSPENDED' ? '#FFE0B2' :  // Orange background for SUSPENDED
                        row.shaftStatus === 'CLOSED' ? '#FFCDD2' :  // Red background for Shaft closed
                        row.status === 'Pending' ? '#FFF9C4' : 
                        row.status === 'Overdue' ? '#FFCDD2' : 
                        row.status === 'Cancelled' ? '#F3E5F5' : 
                        '#C8E6C9',
                      color: 
                        row.shaftStatus === 'SUSPENDED' ? '#E65100' :  // Dark orange text for SUSPENDED
                        row.shaftStatus === 'Shaft closed' ? '#B71C1C' :  // Dark red text for Shaft closed
                        row.status === 'Pending' ? '#F57F17' : 
                        row.status === 'Overdue' ? '#B71C1C' : 
                        row.status === 'Cancelled' ? '#4A148C' : 
                        '#1B5E20',
                      fontWeight: 'medium',
                      fontSize: '0.875rem'
                    }}>
                      {row.shaftStatus}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Tooltip title="View Details">
                        <IconButton 
                          onClick={() => handleViewPenalty(row.id)}
                          size="small"
                          sx={{
                            color: 'secondary.main',
                            '&:hover': {
                              bgcolor: 'rgba(50, 56, 62, 0.08)'
                            }
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Penalty
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete the penalty for "{penaltyToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDeleteDialog}
            disabled={deleteLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Contravention Details Dialog */}
      <ContraventionDetailsDialog
        open={viewDialogOpen}
        onClose={handleCloseViewDialog}
        contraventionData={contraventionDetails}
      />
    </Card>
  );
}
