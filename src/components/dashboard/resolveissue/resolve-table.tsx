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
import dayjs from 'dayjs';

import { useSelection } from '@/hooks/use-selection';
import { ReactNode } from 'react';
import { authClient } from '@/lib/auth/client';
import { DriverDetailsDialog } from '@/components/dashboard/incidentmanagement/incident-details-dialog';
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
  page = 0,
  rowsPerPage = 0,
  onRefresh,
  statusFilter = null,
}: CustomersTableProps): React.JSX.Element {
  // State to store incidents fetched from API
  const [incidents, setIncidents] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string>('');
  const [filters, setFilters] = React.useState({
    search: '',
    status: 'all',
    position: 'all'
  });

  // Filter the incidents based on search and optional filters
  const filteredRows = React.useMemo(() => {
    const filtered = incidents.filter((it) => {
      const matchesSearch =
        filters.search === '' ||
        Object.values(it).some((value) =>
          String(value).toLowerCase().includes(filters.search.toLowerCase())
        );

      const matchesStatus = filters.status === 'all' || it.status === filters.status;
      // Position filter is not applicable to incidents; keep for UI consistency
      const matchesPosition = filters.position === 'all';

      // If a parent tab statusFilter is provided, respect it when incidents carry a status
      const matchesTabStatus = statusFilter === null || it.status === statusFilter;

      return matchesSearch && matchesStatus && matchesPosition && matchesTabStatus;
    });
    return sortNewestFirst(filtered);
  }, [incidents, filters, statusFilter]);

  // Selection helpers
  const rowIds = React.useMemo(() => filteredRows.map((row) => row.id), [filteredRows]);
  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);
  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < filteredRows.length;
  const selectedAll = filteredRows.length > 0 && selected?.size === filteredRows.length;

  const [selectedDriverId, setSelectedDriverId] = React.useState<string | null>(null);
  const [isDriverDetailsDialogOpen, setIsDriverDetailsDialogOpen] = React.useState(false);
  const [refreshTrigger, setRefreshTrigger] = React.useState(0); // State to trigger refreshes

  // Fetch incidents from API when component mounts or refreshTrigger changes
  React.useEffect(() => {
    const fetchIncidentsData = async () => {
      console.log('Fetching incidents data... (refreshTrigger:', refreshTrigger, ')');
      setLoading(true);
      setError('');
      try {
        const fetched = await authClient.fetchIncidents();
        const normalized = Array.isArray(fetched)
          ? fetched.map((it: any, idx: number) => ({
              id: String(it.id ?? it.incidentId ?? idx),
              title: it.title,
              type: it.type,
              severity: it.severity,
              location: it.location,
              reportedBy: it.reportedBy,
              ...it,
            }))
          : [];
        setIncidents(normalized);
      } catch (error_) {
        console.error('Error fetching incidents:', error_);
        setError('Failed to load incidents. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchIncidentsData();
  }, [refreshTrigger]);

 
  const handleViewUserDetails = (driverId: string) => {
    console.log('View driver details clicked for ID:', driverId);
    setSelectedDriverId(driverId);
    setTimeout(() => {
      setIsDriverDetailsDialogOpen(true);
    }, 0);
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
          <Typography>Loading incidents...</Typography>
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
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedAll}
                  indeterminate={selectedSome}
                  onChange={(event) => {
                    if (event.target.checked) {
                      selectAll();
                    } else {
                      deselectAll();
                    }
                  }}
                />
              </TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Reported By</TableCell>
              <TableCell>Satatus</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading && filteredRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No incidents found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {filteredRows.map((row) => {
              const isSelected = selected?.has(row.id);
              return (
                <TableRow hover key={row.id} selected={isSelected}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={(event) => {
                        if (event.target.checked) {
                          selectOne(row.id);
                        } else {
                          deselectOne(row.id);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>{row.incidentTitle || row.title || 'N/A'}</TableCell>
                  <TableCell>{row.type || row.incidentType || 'N/A'}</TableCell>
                  <TableCell>{row.severityLevel || row.severity || 'N/A'}</TableCell>
                  <TableCell>{row.location || row.address || 'N/A'}</TableCell>
                  <TableCell>{row.reportedBy || `${row.firstName || ''} ${row.lastName || ''}`.trim() || row.emailAddress || 'N/A'}</TableCell>
                  <TableCell>{row.status} </TableCell>
                 
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Button 
                        onClick={() => {
                          console.log('Button clicked for driver ID:', row.id);
                          setSelectedDriverId(row.id);
                          setIsDriverDetailsDialogOpen(true);
                        }}
                        variant="outlined"
                        size="small"
                        sx={{
                          borderColor: '#06131fff',
                          color: '#081b2fff',
                          '&:hover': {
                            borderColor: '#06131fff',
                            backgroundColor: 'rgba(6, 19, 31, 0.04)',
                          }
                        }}
                      >
                        View details
                      </Button>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Button 
                        onClick={() => {
                          console.log('Button clicked for driver ID:', row.id);
                          setSelectedDriverId(row.id);
                          setIsDriverDetailsDialogOpen(true);
                        }}
                        variant="outlined"
                        size="small"
                        sx={{
                          borderColor: '#06131fff',
                          color: '#081b2fff',
                          '&:hover': {
                            borderColor: '#06131fff',
                            backgroundColor: 'rgba(6, 19, 31, 0.04)',
                          }
                        }}
                      >
                        View details
                      </Button>
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
      
      {/* Driver Details Dialog */}
      {isDriverDetailsDialogOpen && (
        <DriverDetailsDialog
          open={isDriverDetailsDialogOpen}
          onClose={() => setIsDriverDetailsDialogOpen(false)}
          driverId={selectedDriverId}
          onRefresh={refreshTableData}
        />
      )}

    </Card>
  );
}
