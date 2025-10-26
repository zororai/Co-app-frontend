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
import { sortNewestFirst } from '@/utils/sort';

import { useSelection } from '@/hooks/use-selection';
import { ReactNode } from 'react';
import { authClient } from '@/lib/auth/client';
import { DriverDetailsDialog } from '@/components/dashboard/borrowing/shaftloan-details-dialog';
import { ShaftBorrowingDialog } from '@/components/dashboard/borrowing/shaftloan-borrowing-dialog';


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
}

export function CustomersTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
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

  // Filter the users based on search and dropdown filters, then sort newest first
  const filteredRows = React.useMemo(() => {
    const filtered = users.filter(user => {
      const matchesSearch = filters.search === '' || 
        Object.values(user).some(value => 
          String(value).toLowerCase().includes(filters.search.toLowerCase())
        );
      
      // Apply dropdown filter
      const matchesDropdownStatus = filters.status === 'all' || user.status === filters.status;
      const matchesPosition = filters.position === 'all' || user.position === filters.position;

      return matchesSearch && matchesDropdownStatus && matchesPosition;
    });
    return sortNewestFirst(filtered);
  }, [users, filters]);

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

  const [selectedDriverId, setSelectedDriverId] = React.useState<string | null>(null);
  const [isDriverDetailsDialogOpen, setIsDriverDetailsDialogOpen] = React.useState(false);
  const [refreshTrigger, setRefreshTrigger] = React.useState(0); // State to trigger refreshes
  const [isBorrowDialogOpen, setIsBorrowDialogOpen] = React.useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = React.useState<string | null>(null);
  const [selectedAssignmentRow, setSelectedAssignmentRow] = React.useState<any | null>(null);

  // Fetch drivers from API when component mounts or refreshTrigger changes
  React.useEffect(() => {

    const fetchAllShaftAssignments = async () => {
      setLoading(true);
      setError('');
      try {
        const allAssignments = await authClient.fetchShaftapproved();
        setUsers(allAssignments);
      } catch (error_) {
        console.error('Error fetching drivers:', error_);
        setError('Failed to load drivers. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllShaftAssignments();
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
  }, []);

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
              <TableCell>Shaft Numbers</TableCell>
              <TableCell>Section Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Operational Status</TableCell>
              <TableCell>Loan Status</TableCell>
              <TableCell>View Details</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading && filteredRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No users found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {filteredRows.map((row) => {
              const isSelected = selected?.has(row.id);
              return (
                <TableRow hover key={row.id} selected={isSelected}>
                  <TableCell>{row.shaftNumbers || 'N/A'}</TableCell>
                  <TableCell>{row.sectionName || 'N/A'}</TableCell>
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
                  <TableCell>{row.operationalStatus || 'N/A'}</TableCell>
                  <TableCell>{row.operationalStatus || 'N/A'}</TableCell>
                  
            
              
                   <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Button 
                        onClick={() => {
                          const minerId = (row as any).minerId || row.id;
                          setSelectedAssignmentRow(row);
                          setSelectedDriverId(minerId);
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
                        View Details
                      </Button>
                    </Box>
                  </TableCell>

                  <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Button 
                          onClick={() => {
                            const assignmentId = (row as any).assignmentId || row.id;
                            setSelectedAssignmentId(assignmentId);
                            setIsBorrowDialogOpen(true);
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
                          Borrowe
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
          minerId={selectedDriverId}
          assignment={selectedAssignmentRow}
        />
      )}

      {/* Shaft Borrowing Dialog */}
      {isBorrowDialogOpen && (
        <ShaftBorrowingDialog
          open={isBorrowDialogOpen}
          onClose={() => setIsBorrowDialogOpen(false)}
          assignmentId={selectedAssignmentId}
          onSuccess={refreshTableData}
        />
      )}

    </Card>
  );
}
