'use client';

import * as React from 'react';

// Removed duplicate local Customer interface. Use the exported one below.
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import dayjs from 'dayjs';
import { sortNewestFirst } from '@/utils/sort';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Grid from '@mui/material/Grid';
import Badge from '@mui/material/Badge';
import { green, orange, red, grey } from '@mui/material/colors';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AddIcon from '@mui/icons-material/Add';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';

import { useSelection } from '@/hooks/use-selection';
import { ReactNode } from 'react';
// import { MinerDetailsDialog } from '@/components/dashboard/useronboard/useronboard-details';
// import { OreDetailsDialog } from '@/components/dashboard/oremanagement/ore-details-dialog';


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
    console.log('Current users array:', users); // Debug: Log the users array
    
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
      
      // Apply dropdown filters for incident status and type (lenient if missing)
      const matchesDropdownStatus = filters.status === 'all' || !user.status || user.status === filters.status;
      const matchesType = filters.position === 'all' || !user.type || user.type === filters.position;
      
      // Apply tab filter if provided - make it more lenient if status is missing
      const matchesTabStatus = statusFilter === null || !user.status || user.status === statusFilter;

      return matchesSearch && matchesDropdownStatus && matchesType && matchesTabStatus;
    });
    
    console.log('Filtered rows:', filtered); // Debug: Log the filtered results
    const sorted = sortNewestFirst(filtered);
    return sorted;
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

  const [refreshTrigger, setRefreshTrigger] = React.useState(0); // State to trigger refreshes

  // Load mock incident data on mount or when refresh is triggered
  React.useEffect(() => {
    setLoading(true);
    setError('');
    // Mock incidents to match the desired UI
    const mockIncidents = [
      {
        id: 'INC-001',
        title: 'Slip hazard near processing plant',
        type: 'HAZARD',
        severity: 'MEDIUM',
        location: 'Processing Plant - Area B',
        reportedBy: 'John Worker',
        date: '2024-06-25',
        status: 'INVESTIGATING'
      },
      {
        id: 'INC-002',
        title: 'Minor cut injury',
        type: 'INJURY',
        severity: 'LOW',
        location: 'Workshop',
        reportedBy: 'Mike Mechanic',
        date: '2024-06-24',
        status: 'RESOLVED'
      }
    ];
    // Simulate async
    const t = setTimeout(() => {
      setUsers(mockIncidents);
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [refreshTrigger]);

  // Note: view/edit handlers can be wired to dialogs or routes later

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
      {/* Header and Actions */}
     

      {/* Summary Cards */}
    
      
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
      {/* Incident Reports + Filters */}
      <Box sx={{ 
        p: 2,
        mb: 0,
        borderRadius: 1,
        bgcolor: '#fff',
        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Incident Reports</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          All reported incidents and their current status
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
              placeholder="Search incidents..."
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
              <MenuItem value="INVESTIGATING">Investigating</MenuItem>
              <MenuItem value="OPEN">Open</MenuItem>
              <MenuItem value="RESOLVED">Resolved</MenuItem>
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
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="HAZARD">Hazard</MenuItem>
              <MenuItem value="INJURY">Injury</MenuItem>
              <MenuItem value="NEAR_MISS">Near Miss</MenuItem>
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
        <Table sx={{ minWidth: '1000px' }}>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Reported By</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading && filteredRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">No incidents found.</Typography>
                </TableCell>
              </TableRow>
            )}
            {filteredRows.map((row) => {
              const isSelected = selected?.has(row.id);
              return (
                <TableRow hover key={row.id} selected={isSelected}>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{row.title}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={row.type} size="small" color="warning" sx={{ fontWeight: 600 }} />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={row.severity}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        bgcolor: row.severity === 'HIGH' ? red[100] : row.severity === 'MEDIUM' ? orange[100] : green[100],
                        color: row.severity === 'HIGH' ? red[800] : row.severity === 'MEDIUM' ? orange[800] : green[800]
                      }}
                    />
                  </TableCell>
                  <TableCell>{row.location || ''}</TableCell>
                  <TableCell>{row.reportedBy || ''}</TableCell>
                  <TableCell>{row.date ? dayjs(row.date).format('YYYY-MM-DD') : ''}</TableCell>
                  <TableCell>
                    <Chip 
                      label={row.status}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        bgcolor: row.status === 'RESOLVED' ? green[100] : row.status === 'INVESTIGATING' ? orange[100] : grey[200],
                        color: row.status === 'RESOLVED' ? green[800] : row.status === 'INVESTIGATING' ? orange[800] : grey[800]
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="View">
                        <IconButton size="small" onClick={() => console.log('view', row.id)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => console.log('edit', row.id)}>
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
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
    </Card>
  );
}
