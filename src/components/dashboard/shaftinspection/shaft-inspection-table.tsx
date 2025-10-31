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
import { authClient } from '@/lib/auth/client';

export interface ShaftInspection {
  id: string;
  inspectorName: string;
  location: string;
  inspectionDate: string;
  inspectionTime: {
    hour: number;
    minute: number;
    second: number;
    nano: number;
  };
  status: string;
  inspectionType: string;
  hazardControlProgram: string;
  observations: string;
  pollutionStatus: string;
  correctiveActions: string;
  esapMaterials: string;
  complianceStatus: string;
  shaftNumbers: string[] | string;
  attachments: string[];
}

function noop(): void {
  // This is intentional
}

interface ShaftInspectionTableProps {
  count?: number;
  page?: number;
  rows?: ShaftInspection[];
  rowsPerPage?: number;
  onRefresh?: () => void;
}

export function ShaftInspectionTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 10,
  onRefresh
}: ShaftInspectionTableProps): React.JSX.Element {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');
  const [filters, setFilters] = React.useState({
    search: '',
    complianceStatus: 'all',
    pollutionStatus: 'all',
    inspectionType: 'all'
  });
  
  // Sorting state
  const [sortField, setSortField] = React.useState<string>('inspectionDate');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('desc');
  
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set());
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedInspection, setSelectedInspection] = React.useState<string | null>(null);
  
  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [selectedInspectionId, setSelectedInspectionId] = React.useState<string | null>(null);
  
  // Delete dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [inspectionToDelete, setInspectionToDelete] = React.useState<{ id: string; name: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  
  // Success/Error states
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<'success' | 'error'>('success');

  // API data state
  const [apiData, setApiData] = React.useState<ShaftInspection[]>([]);

  // Fetch data from API
  const fetchInspections = React.useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await authClient.fetchShaftInspections();
      
      if (result.success && result.data) {
        setApiData(result.data);
      } else {
        setError(result.error || 'Failed to fetch inspections');
        setApiData([]);
      }
    } catch (err) {
      setError('An error occurred while fetching inspections');
      setApiData([]);
      console.error('Error fetching inspections:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data on component mount
  React.useEffect(() => {
    fetchInspections();
  }, [fetchInspections]);

  // Refresh data when onRefresh is called
  React.useEffect(() => {
    if (onRefresh) {
      // Override the parent's onRefresh to use our fetch function
      const originalRefresh = onRefresh;
      onRefresh = fetchInspections;
    }
  }, [onRefresh, fetchInspections]);


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
    // Use API data if available, otherwise use props rows
    const sourceData = apiData.length > 0 ? apiData : rows;
    
    let filtered = sourceData.filter(row => {
      const matchesSearch = !filters.search || 
        row.inspectorName.toLowerCase().includes(filters.search.toLowerCase()) ||
        row.location.toLowerCase().includes(filters.search.toLowerCase()) ||
        row.inspectionType.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesCompliance = filters.complianceStatus === 'all' || row.complianceStatus === filters.complianceStatus;
      const matchesPollution = filters.pollutionStatus === 'all' || row.pollutionStatus === filters.pollutionStatus;
      const matchesType = filters.inspectionType === 'all' || row.inspectionType.includes(filters.inspectionType);
      
      return matchesSearch && matchesCompliance && matchesPollution && matchesType;
    });

    // Sort the filtered data
    filtered.sort((a, b) => {
      let aValue = a[sortField as keyof ShaftInspection];
      let bValue = b[sortField as keyof ShaftInspection];
      
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [apiData, rows, filters, sortField, sortDirection]);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, inspectionId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedInspection(inspectionId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedInspection(null);
  };

  const handleViewInspection = (inspectionId: string) => {
    setSelectedInspectionId(inspectionId);
    setViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedInspectionId(null);
  };

  const handleEditInspection = (inspectionId: string) => {
    setSelectedInspectionId(inspectionId);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedInspectionId(null);
  };

  const handleEditSuccess = () => {
    setSnackbarMessage('Inspection updated successfully');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    
    // Refresh the table
    fetchInspections();
  };

  const handleDeleteInspection = (inspectionId: string, inspectionName: string) => {
    setInspectionToDelete({ id: inspectionId, name: inspectionName });
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setInspectionToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!inspectionToDelete) return;

    setDeleteLoading(true);
    try {
      // TODO: Replace with actual API call when available
      // const result = await authClient.deleteInspection(inspectionToDelete.id);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSnackbarMessage('Inspection deleted successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // Refresh the table
      fetchInspections();
    } catch (error) {
      setSnackbarMessage('An error occurred while deleting the inspection');
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

  // Helper function to format time object to string (robust against missing fields)
  const formatTime = (
    timeObj?: { hour?: number; minute?: number; second?: number; nano?: number } | string | null
  ): string => {
    if (!timeObj) return '';
    if (typeof timeObj === 'string') return timeObj;
    const hourNum = Number(timeObj.hour ?? 0);
    const minuteNum = Number(timeObj.minute ?? 0);
    const period = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
    return `${displayHour}:${minuteNum.toString().padStart(2, '0')} ${period}`;
  };

  const dataToDisplay = filteredRows;

  const getComplianceColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'compliant':
        return 'success';
      case 'non compliant':
        return 'error';
      case 'partially compliant':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getPollutionColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'no pollution':
        return 'success';
      case 'minor leak':
        return 'warning';
      case 'major spill':
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
          <Typography>Loading inspections...</Typography>
        </Box>
      )}
      
      {!loading && error && (
        <Box sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
          <Typography>{error}</Typography>
          <Button 
            variant="outlined" 
            sx={{ mt: 2 }} 
            onClick={fetchInspections}
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
              placeholder="Search inspections..."
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
              value={filters.complianceStatus}
              displayEmpty
              size="small"
              sx={{ 
                '& .MuiSelect-select': { 
                  py: 1,
                  fontSize: '14px'
                }
              }}
              onChange={(e) => setFilters(prev => ({ ...prev, complianceStatus: e.target.value }))}
            >
              <MenuItem value="all">All Compliance</MenuItem>
              <MenuItem value="Compliant">Compliant</MenuItem>
              <MenuItem value="Non Compliant">Non Compliant</MenuItem>
              <MenuItem value="Partially Compliant">Partially Compliant</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <Select
              value={filters.pollutionStatus}
              displayEmpty
              size="small"
              sx={{ 
                '& .MuiSelect-select': { 
                  py: 1,
                  fontSize: '14px'
                }
              }}
              onChange={(e) => setFilters(prev => ({ ...prev, pollutionStatus: e.target.value }))}
            >
              <MenuItem value="all">All Pollution</MenuItem>
              <MenuItem value="No Pollution">No Pollution</MenuItem>
              <MenuItem value="Minor Leak">Minor Leak</MenuItem>
              <MenuItem value="Major Spill">Major Spill</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <Select
              value={filters.inspectionType}
              displayEmpty
              size="small"
              sx={{ 
                '& .MuiSelect-select': { 
                  py: 1,
                  fontSize: '14px'
                }
              }}
              onChange={(e) => setFilters(prev => ({ ...prev, inspectionType: e.target.value }))}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="Air Quality">Air Quality</MenuItem>
              <MenuItem value="Waste Disposal">Waste Disposal</MenuItem>
              <MenuItem value="Safety Check">Safety Check</MenuItem>
              <MenuItem value="Environmental">Environmental</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow>
              <TableCell sortDirection={sortField === 'inspectorName' ? sortDirection : false}>
                <TableSortLabel
                  active={sortField === 'inspectorName'}
                  direction={sortField === 'inspectorName' ? sortDirection : 'asc'}
                  onClick={() => handleSort('inspectorName')}
                >
                  Inspector
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
              <TableCell sortDirection={sortField === 'inspectionDate' ? sortDirection : false}>
                <TableSortLabel
                  active={sortField === 'inspectionDate'}
                  direction={sortField === 'inspectionDate' ? sortDirection : 'asc'}
                  onClick={() => handleSort('inspectionDate')}
                >
                  Date & Time
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={sortField === 'inspectionType' ? sortDirection : false}>
                <TableSortLabel
                  active={sortField === 'inspectionType'}
                  direction={sortField === 'inspectionType' ? sortDirection : 'asc'}
                  onClick={() => handleSort('inspectionType')}
                >
                  Type
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={sortField === 'pollutionStatus' ? sortDirection : false}>
                <TableSortLabel
                  active={sortField === 'pollutionStatus'}
                  direction={sortField === 'pollutionStatus' ? sortDirection : 'asc'}
                  onClick={() => handleSort('pollutionStatus')}
                >
                  Pollution Status
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={sortField === 'complianceStatus' ? sortDirection : false}>
                <TableSortLabel
                  active={sortField === 'complianceStatus'}
                  direction={sortField === 'complianceStatus' ? sortDirection : 'asc'}
                  onClick={() => handleSort('complianceStatus')}
                >
                  Compliance
                </TableSortLabel>
              </TableCell>
              <TableCell>Shaft Numbers</TableCell>
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
                  <TableCell><Skeleton variant="rounded" width={80} height={24} /></TableCell>
                  <TableCell><Skeleton variant="rounded" width={80} height={24} /></TableCell>
                  <TableCell><Skeleton variant="text" width="70%" /></TableCell>
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
            {!loading && dataToDisplay.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No shaft inspections found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {!loading && dataToDisplay.map((row) => {
              const isSelected = selectedRows.has(row.id);
              const shaftList: string[] = Array.isArray(row.shaftNumbers)
                ? row.shaftNumbers
                : row.shaftNumbers
                  ? [String(row.shaftNumbers)]
                  : [];
              return (
                <TableRow hover key={row.id} selected={isSelected}>
                  <TableCell>
                    <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                     
                      <Typography variant="subtitle2">{row.inspectorName}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{row.location || ''}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{new Date(row.inspectionDate).toLocaleDateString()}</Typography>
                      <Typography variant="caption" color="text.secondary">{formatTime(row.inspectionTime)}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 150 }}>
                      {row.inspectionType}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{
                      display: 'inline-block',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: 
                        row.pollutionStatus === 'No Pollution' ? '#C8E6C9' : 
                        row.pollutionStatus === 'Minor Leak' ? '#FFE0B2' : 
                        row.pollutionStatus === 'Major Spill' ? '#FFCDD2' : 
                        '#F5F5F5',
                      color: 
                        row.pollutionStatus === 'No Pollution' ? '#1B5E20' : 
                        row.pollutionStatus === 'Minor Leak' ? '#E65100' : 
                        row.pollutionStatus === 'Major Spill' ? '#B71C1C' : 
                        '#424242',
                      fontWeight: 'medium',
                      fontSize: '0.875rem'
                    }}>
                      {row.pollutionStatus}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{
                      display: 'inline-block',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: 
                        row.complianceStatus === 'Compliant' ? '#C8E6C9' : 
                        row.complianceStatus === 'Non Compliant' ? '#FFCDD2' : 
                        row.complianceStatus === 'Partially Compliant' ? '#FFE0B2' : 
                        '#F5F5F5',
                      color: 
                        row.complianceStatus === 'Compliant' ? '#1B5E20' : 
                        row.complianceStatus === 'Non Compliant' ? '#B71C1C' : 
                        row.complianceStatus === 'Partially Compliant' ? '#E65100' : 
                        '#424242',
                      fontWeight: 'medium',
                      fontSize: '0.875rem'
                    }}>
                      {row.complianceStatus}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {shaftList.slice(0, 2).map((shaft, index) => (
                        <Chip
                          key={index}
                          label={shaft}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                      {shaftList.length > 2 && (
                        <Chip
                          label={`+${shaftList.length - 2}`}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Tooltip title="View Details">
                        <IconButton 
                          onClick={() => handleViewInspection(row.id)}
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
                      <Tooltip title="Edit Inspection">
                        <IconButton 
                          onClick={() => handleEditInspection(row.id)}
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
                      <Tooltip title="Delete Inspection">
                        <IconButton 
                          onClick={() => handleDeleteInspection(row.id, row.inspectorName)}
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
        count={dataToDisplay.length}
        onPageChange={noop}
        onRowsPerPageChange={noop}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
      />

      {/* TODO: Add Inspection Details Dialog */}
      {/* TODO: Add Edit Inspection Dialog */}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Inspection
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete the inspection by "{inspectionToDelete?.name}"? This action cannot be undone.
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
