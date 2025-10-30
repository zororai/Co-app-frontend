'use client';

import * as React from 'react';
import {
  Avatar,
  Box,
  Card,
  Checkbox,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  Chip,
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
import { TrainingDetailsDialog } from './training-details-dialog';
import { authClient } from '@/lib/auth/client';

export interface Training {
  id: string;
  trainingType: string;
  trainerName: string;
  scheduleDate: string;
  location: string;
  materials: string[];
  safetyProtocols: string[];
  trainees: string[];
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  createdAt: string;
}

interface TrainingTableProps {
  count?: number;
  page?: number;
  rows?: Training[];
  rowsPerPage?: number;
  onRefresh?: () => void;
}

function noop(): void {
  // do nothing
}

export function TrainingTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 10,
  onRefresh
}: TrainingTableProps): React.JSX.Element {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');
  const [filters, setFilters] = React.useState({
    search: '',
    status: 'all',
    trainingType: 'all'
  });
  
  // Sorting state
  const [sortField, setSortField] = React.useState<string>('scheduleDate');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('desc');
  
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set());
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedTraining, setSelectedTraining] = React.useState<string | null>(null);
  
  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false);
  const [selectedTrainingId, setSelectedTrainingId] = React.useState<string | null>(null);
  
  // Delete dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [trainingToDelete, setTrainingToDelete] = React.useState<{ id: string; name: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  
  // Success/Error states
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<'success' | 'error'>('success');

  // Sorting function
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and sort data
  const filteredRows = React.useMemo(() => {
    let filtered = rows.filter(row => {
      const matchesSearch = !filters.search || 
        row.trainingType.toLowerCase().includes(filters.search.toLowerCase()) ||
        row.trainerName.toLowerCase().includes(filters.search.toLowerCase()) ||
        row.location.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesStatus = filters.status === 'all' || row.status === filters.status;
      const matchesType = filters.trainingType === 'all' || row.trainingType === filters.trainingType;
      
      return matchesSearch && matchesStatus && matchesType;
    });

    // Sort the filtered data
    filtered.sort((a, b) => {
      let aValue = a[sortField as keyof Training];
      let bValue = b[sortField as keyof Training];
      
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [rows, filters, sortField, sortDirection]);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, trainingId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedTraining(trainingId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTraining(null);
  };

  const handleViewTraining = (trainingId: string) => {
    setSelectedTrainingId(trainingId);
    setViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedTrainingId(null);
  };

  const handleDeleteTraining = (trainingId: string, trainingName: string) => {
    setTrainingToDelete({ id: trainingId, name: trainingName });
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setTrainingToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!trainingToDelete) return;

    setDeleteLoading(true);
    try {
      const result = await authClient.deleteTraining(trainingToDelete.id);
      
      if (result.success) {
        setSnackbarMessage('Training deleted successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
        // Refresh the table
        if (onRefresh) {
          onRefresh();
        }
      } else {
        setSnackbarMessage(result.error || 'Failed to delete training');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (error) {
      setSnackbarMessage('An error occurred while deleting the training');
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

  const getStatusColor = (status: Training['status']) => {
    switch (status) {
      case 'Scheduled':
        return 'info';
      case 'In Progress':
        return 'warning';
      case 'Completed':
        return 'success';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const selectedSome = selectedRows.size > 0 && selectedRows.size < rows.length;
  const selectedAll = rows.length > 0 && selectedRows.size === rows.length;

  return (
    <Card>      
      {/* Loading and Error States */}
      {loading && (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography>Loading trainings...</Typography>
        </Box>
      )}
      
      {!loading && error && (
        <Box sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
          <Typography>{error}</Typography>
          <Button 
            variant="outlined" 
            sx={{ mt: 2 }} 
            onClick={onRefresh}
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
              placeholder="Search trainings..."
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
              <MenuItem value="Scheduled">Scheduled</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <Select
              value={filters.trainingType}
              displayEmpty
              size="small"
              sx={{ 
                '& .MuiSelect-select': { 
                  py: 1,
                  fontSize: '14px'
                }
              }}
              onChange={(e) => setFilters(prev => ({ ...prev, trainingType: e.target.value }))}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="Hazard Handling">Hazard Handling</MenuItem>
              <MenuItem value="Equipment Safety">Equipment Safety</MenuItem>
              <MenuItem value="Fire Safety">Fire Safety</MenuItem>
              <MenuItem value="Chemical Safety">Chemical Safety</MenuItem>
              <MenuItem value="Emergency Response">Emergency Response</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow>
              <TableCell sortDirection={sortField === 'trainingType' ? sortDirection : false}>
                <TableSortLabel
                  active={sortField === 'trainingType'}
                  direction={sortField === 'trainingType' ? sortDirection : 'asc'}
                  onClick={() => handleSort('trainingType')}
                >
                  Training Type
                </TableSortLabel>
              </TableCell>
              <TableCell>Trainer</TableCell>
              <TableCell sortDirection={sortField === 'scheduleDate' ? sortDirection : false}>
                <TableSortLabel
                  active={sortField === 'scheduleDate'}
                  direction={sortField === 'scheduleDate' ? sortDirection : 'asc'}
                  onClick={() => handleSort('scheduleDate')}
                >
                  Schedule Date
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={sortField === 'location' ? sortDirection : false}>
                <TableSortLabel
                  active={sortField === 'location'}
                  direction={sortField === 'location' ? sortDirection : 'asc'}
                  onClick={() => handleSort('location')}
                >
                  Location
                </TableSortLabel>
              </TableCell>
              <TableCell>Trainees</TableCell>
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
            {loading && (
              // Show skeleton rows while loading
              Array.from({ length: 5 }).map((_, index) => (
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
                      <Skeleton variant="circular" width={32} height={32} />
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
            {!loading && filteredRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No trainings found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {!loading && filteredRows.map((row) => {
              const isSelected = selectedRows.has(row.id);
              return (
                <TableRow hover key={row.id} selected={isSelected}>
                  <TableCell>{row.trainingType || ''}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {row.trainerName.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <Typography variant="subtitle2">{row.trainerName}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{new Date(row.scheduleDate).toLocaleDateString()}</TableCell>
                  <TableCell>{row.location || ''}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {row.trainees.length} trainee{row.trainees.length !== 1 ? 's' : ''}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{
                      display: 'inline-block',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: 
                        row.status === 'Scheduled' ? '#FFF9C4' : 
                        row.status === 'Cancelled' ? '#FFCDD2' : 
                        row.status === 'In Progress' ? '#FFE0B2' : 
                        '#C8E6C9',
                      color: 
                        row.status === 'Scheduled' ? '#F57F17' : 
                        row.status === 'Cancelled' ? '#B71C1C' : 
                        row.status === 'In Progress' ? '#E65100' : 
                        '#1B5E20',
                      fontWeight: 'medium',
                      fontSize: '0.875rem'
                    }}>
                      {row.status}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Tooltip title="View Details">
                        <IconButton 
                          onClick={() => handleViewTraining(row.id)}
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
                      <Tooltip title="Edit Training">
                        <IconButton 
                          onClick={() => {}}
                          size="small"
                          sx={{
                            color: 'secondary.main',
                            '&:hover': {
                              bgcolor: 'rgba(50, 56, 62, 0.08)'
                            }
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Training">
                        <IconButton 
                          onClick={() => handleDeleteTraining(row.id, row.trainingType)}
                          size="small"
                          sx={{
                            color: 'error.main',
                            '&:hover': {
                              bgcolor: 'rgba(211, 47, 47, 0.08)'
                            }
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

      {/* Training Details Dialog */}
      <TrainingDetailsDialog
        open={viewDialogOpen}
        onClose={handleCloseViewDialog}
        trainingId={selectedTrainingId}
        onRefresh={onRefresh}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Training
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete the training "{trainingToDelete?.name}"? This action cannot be undone.
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
    </Card>
  );
}
