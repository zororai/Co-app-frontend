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
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Skeleton from '@mui/material/Skeleton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useTheme } from '@mui/material/styles';
import dayjs from 'dayjs';
import { sortNewestFirst } from '@/utils/sort';

import { useSelection } from '@/hooks/use-selection';
import { ReactNode } from 'react';
import { authClient } from '@/lib/auth/client';
import { MinerDetailsDialog } from '@/components/dashboard/useronboard/useronboard-details';
import { OreDetailsDialog } from '@/components/dashboard/oremanagement/ore-details-dialog';


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
      
      // Apply dropdown filter - make it more lenient if status is missing
      const matchesDropdownStatus = filters.status === 'all' || !user.status || user.status === filters.status;
      const matchesPosition = filters.position === 'all' || !user.position || user.position === filters.position;
      
      // Apply tab filter if provided - make it more lenient if status is missing
      const matchesTabStatus = statusFilter === null || !user.status || user.status === statusFilter;

      return matchesSearch && matchesDropdownStatus && matchesPosition && matchesTabStatus;
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

  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false);
  const [selectedUserId, setSelectedUserId] = React.useState<string | null>(null);
  const [isUserDetailsDialogOpen, setIsUserDetailsDialogOpen] = React.useState(false);
  const [refreshTrigger, setRefreshTrigger] = React.useState(0); // State to trigger refreshes

  // Fetch ore data from API when component mounts or refreshTrigger changes
  React.useEffect(() => {
    const fetchOreTransportData = async () => {
      setLoading(true);
      setError('');
      try {
        const fetchedOres = await authClient.fetchOreTransportData();
        console.log('API Response:', fetchedOres); // Debug: Log the API response
        
        // If the API returns an empty array or undefined, use mock data
        if (!fetchedOres || fetchedOres.length === 0) {
          console.log('No data returned from API, using mock data');
          const mockOreData = [
            {
              id: '1',
              oreUniqueId: 'ORE-001',
              shaftNumbers: ['S-123', 'S-124'],
              weight: 500,
              numberOfBags: 10,
              transportStatus: 'In Transit',
              selectedTransportdriver: 'John Doe',
              selectedTransport: 'Truck A',
              location: 'Mine Site A',
              processStatus: 'Processing',
              date: '2025-08-10',
              status: 'APPROVED'
            },
            {
              id: '2',
              oreUniqueId: 'ORE-002',
              shaftNumbers: ['S-125'],
              weight: 350,
              numberOfBags: 7,
              transportStatus: 'Delivered',
              selectedTransportdriver: 'Jane Smith',
              selectedTransport: 'Truck B',
              location: 'Processing Center',
              processStatus: 'Completed',
              date: '2025-08-09',
              status: 'PENDING'
            }
          ];
          setUsers(mockOreData);
        } else {
          setUsers(fetchedOres);
        }
      } catch (error_) {
        console.error('Error fetching ore data:', error_);
        setError('Failed to load ore data. Please try again.');
        
        // Use mock data on error
        const mockOreData = [
          {
            id: '1',
            oreUniqueId: 'ORE-001',
            shaftNumbers: ['S-123', 'S-124'],
            weight: 500,
            numberOfBags: 10,
            transportStatus: 'In Transit',
            selectedTransportdriver: 'John Doe',
            selectedTransport: 'Truck A',
            location: 'Mine Site A',
            processStatus: 'Processing',
            date: '2025-08-10',
            status: 'APPROVED'
          }
        ];
        setUsers(mockOreData);
      } finally {
        setLoading(false);
      }
    };
    fetchOreTransportData();
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
            mb: 2,
            color: theme.palette.secondary.main
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
            minWidth: 220,
            '&:focus-within': {
              borderColor: theme.palette.secondary.main,
            }
          }}>
            <Box component="span" sx={{ color: '#9e9e9e', mr: 1 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
              </svg>
            </Box>
            <input
              type="text"
              placeholder="Search ore..."
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
        </Box>
      </Box>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow>
   
              <TableCell>Ore ID</TableCell>
              <TableCell>Shaft Number</TableCell>
              <TableCell>Weight</TableCell>
              <TableCell>Number of Bags</TableCell>
             
              <TableCell>Transport</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Process Status</TableCell>
            
              <TableCell>View Details</TableCell>
              
     
              
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
                <TableCell><Skeleton variant="text" width="75%" /></TableCell>
                <TableCell><Skeleton variant="rounded" width={80} height={24} /></TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Skeleton variant="circular" width={32} height={32} />
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            
            {!loading && filteredRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No ore found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            
            {!loading && filteredRows.map((row) => {
              const isSelected = selected?.has(row.id);
              return (
                <TableRow hover key={row.id} selected={isSelected}>
                  <TableCell>{row.oreUniqueId || 'N/A'}</TableCell>
                  <TableCell>{Array.isArray(row.shaftNumbers) ? row.shaftNumbers.join(', ') : row.shaftNumbers || 'N/A'}</TableCell>
                  <TableCell>{row.weight ? `${row.weight} kg` : '0 kg'}</TableCell>
                  <TableCell>{row.numberOfBags || 0}</TableCell>
                  <TableCell>{row.selectedTransport || 'N/A'}</TableCell>
                  <TableCell>{row.location || 'N/A'}</TableCell>
                  <TableCell>
                    <Box sx={{
                      display: 'inline-block',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: row.processStatus === 'Completed' ? '#C8E6C9' : 
                               row.processStatus === 'Processing' ? '#FFF9C4' : 
                               row.processStatus === 'Pending' ? '#FFE0B2' : '#FFCDD2',
                      color: row.processStatus === 'Completed' ? '#1B5E20' : 
                             row.processStatus === 'Processing' ? '#F57F17' : 
                             row.processStatus === 'Pending' ? '#E65100' : '#B71C1C',
                      fontWeight: 'medium',
                      fontSize: '0.875rem'
                    }}>
                      {row.processStatus || 'N/A'}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Ore Details">
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
      <OreDetailsDialog
        open={isUserDetailsDialogOpen}
        onClose={() => setIsUserDetailsDialogOpen(false)}
        userId={selectedUserId}
      />
    </Card>
  );
}
