'use client';

import * as React from 'react';

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
import TableSortLabel from '@mui/material/TableSortLabel';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Skeleton from '@mui/material/Skeleton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useTheme } from '@mui/material/styles';

import { useSelection } from '@/hooks/use-selection';
import { ReactNode, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { sortNewestFirst } from '@/utils/sort';
import { authClient } from '@/lib/auth/client';

import { CompanyDetailsDialog } from './company-details-dialog';
import { AddCompanyEmployeeDialog } from './add-company-employee-dialog';

function noop(): void {
  // do nothing
}
export interface Company {
    id: string;
    companyName: string;
    address: string;
    cellNumber: string;
  email: string;
  companyLogo: string;
  certificateOfCooperation: string;
  cr14Copy: string;
  miningCertificate: string;
  taxClearance: string;
  passportPhoto: string;
  ownerName: string;
  ownerSurname: string;
  ownerAddress: string;
  
  ownerCellNumber: string;
  ownerIdNumber: string;
  status: 'APPROVED' | 'REJECTED' | 'PENDING  ';
  reason: string;
  [key: string]: any;
}

export interface CompanyTableProps {
  count?: number;
  rows?: Company[];
  page?: number;
  rowsPerPage?: number;
}

export function CompanyTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
}: CompanyTableProps): React.JSX.Element {
  const theme = useTheme();
  
  // Sorting state
  const [sortField, setSortField] = React.useState<string>('companyName');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = React.useState<boolean>(false);
  
  // Dialog state for company details
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [companyDialogLoading, setCompanyDialogLoading] = useState(false);
  const [companyDialogError, setCompanyDialogError] = useState<string | null>(null);
  const [loadingCompanyId, setLoadingCompanyId] = useState<string | null>(null);

  // Dialog state for adding employee
  const [isAddEmployeeDialogOpen, setIsAddEmployeeDialogOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  const handleViewCompany = async (companyId: string) => {
    setLoadingCompanyId(companyId);
    setCompanyDialogLoading(true);
    setCompanyDialogError(null);
    try {
      const companyDetails = await authClient.fetchCompanyDetails(companyId);
      if (companyDetails) {
        setSelectedCompany(companyDetails);
        setIsViewDialogOpen(true);
      }
    } catch (error: any) {
      console.error('Error fetching company details:', error);
      setCompanyDialogError(error.message || 'Failed to load company details');
    } finally {
      setCompanyDialogLoading(false);
      setLoadingCompanyId(null);
    }
  };

  const handleAddEmployee = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setIsAddEmployeeDialogOpen(true);
  };

  const handleCloseAddEmployeeDialog = () => {
    setIsAddEmployeeDialogOpen(false);
    setSelectedCompanyId(null);
  };

  const [filters, setFilters] = React.useState({
    search: '',
    status: 'all',
    position: 'all'
  });

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter the rows based on search and filters, then sort
  const filteredRows = React.useMemo(() => {
    let filtered = rows.filter(row => {
      const matchesSearch = filters.search === '' || 
        Object.values(row).some(value => 
          String(value).toLowerCase().includes(filters.search.toLowerCase())
        );
      
      const matchesStatus = filters.status === 'all' || row.status === filters.status;
      const matchesPosition = filters.position === 'all' || row.position === filters.position;

      return matchesSearch && matchesStatus && matchesPosition;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue === bValue) return 0;
      
      const comparison = aValue < bValue ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    // Apply LIFO sorting (newest first) after filtering
    return sortNewestFirst(filtered);
  }, [rows, filters, sortField, sortDirection]);

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

  function onRowsPerPageChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void {
    throw new Error('Function not implemented.');
  }

  return (
    <Card>
      {/* Action Buttons */}
   
      <Divider />
      {/* Filters Section */}
      <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          label="Search"
          variant="outlined"
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          sx={{ minWidth: 200 }}
          placeholder="Search by any field..."
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status}
            label="Status"
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="Approved">Approved</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Position</InputLabel>
          <Select
            value={filters.position}
            label="Position"
            onChange={(e) => setFilters(prev => ({ ...prev, position: e.target.value }))}
          >
            <MenuItem value="all">All Positions</MenuItem>
            <MenuItem value="Representatives">Representatives</MenuItem>
            <MenuItem value="Owner">Owner</MenuItem>
            <MenuItem value="Member">Member</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Divider />
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'registrationNumber'}
                  direction={sortField === 'registrationNumber' ? sortDirection : 'asc'}
                  onClick={() => handleSort('registrationNumber')}
                >
                  Registration Number
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'companyName'}
                  direction={sortField === 'companyName' ? sortDirection : 'asc'}
                  onClick={() => handleSort('companyName')}
                >
                  Company Name
                </TableSortLabel>
              </TableCell>
              <TableCell>
           
                  Number of Lashers
       
              </TableCell>
              <TableCell>No of Shaft Assignments</TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'status'}
                  direction={sortField === 'status' ? sortDirection : 'asc'}
                  onClick={() => handleSort('status')}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell> Action </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              // Skeleton loading rows
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell><Skeleton variant="text" /></TableCell>
                  <TableCell><Skeleton variant="text" /></TableCell>
                  <TableCell><Skeleton variant="text" /></TableCell>
                  <TableCell><Skeleton variant="text" /></TableCell>
                  <TableCell><Skeleton variant="text" /></TableCell>
                  <TableCell><Skeleton variant="text" /></TableCell>
                  <TableCell><Skeleton variant="rectangular" width={80} height={24} /></TableCell>
                  <TableCell><Skeleton variant="circular" width={32} height={32} /></TableCell>
                </TableRow>
              ))
            ) : filteredRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    No companies found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredRows.map((row) => {
                const isSelected = selected?.has(row.id);
                return (
                  <TableRow hover key={row.id} selected={isSelected}>
                    <TableCell>{row.registrationNumber}</TableCell>
                    <TableCell>{row.companyName}</TableCell>
                   <TableCell>{row.employeecount}</TableCell>
                    <TableCell>{row.shaftnumber}</TableCell>  
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                          sx={{
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 2,
                            bgcolor: 
                              row.status === 'APPROVED' ?  '#d0f5e8' : '#ffebee',
                            color: 
                              row.status === 'APPROVED' ? '#1b5e20' : '#c62828',
                            fontWeight: 500,
                            fontSize: 13,
                          }}
                        >
                          {row.status}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View Company Details">
                          <IconButton
                            onClick={() => handleViewCompany(row.id)}
                            disabled={loadingCompanyId === row.id}
                            size="small"
                            sx={{
                              color: theme.palette.secondary.main,
                              '&:hover': {
                                bgcolor: 'rgba(50, 56, 62, 0.08)'
                              },
                              '&.Mui-disabled': {
                                color: theme.palette.secondary.main,
                                opacity: 0.6
                              }
                            }}
                          >
                            {loadingCompanyId === row.id ? (
                              <CircularProgress size={20} sx={{ color: theme.palette.secondary.main }} />
                            ) : (
                              <VisibilityIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Add Employee">
                          <IconButton
                            onClick={() => handleAddEmployee(row.id)}
                            size="small"
                                sx={{
                              color: theme.palette.secondary.main,
                              '&:hover': {
                                bgcolor: 'rgba(50, 56, 62, 0.08)'
                              },
                              '&.Mui-disabled': {
                                color: theme.palette.secondary.main,
                                opacity: 0.6
                              }
                            }}
                          >
                            <PersonAddIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Box>
      
      <Divider />
      <TablePagination
        component="div"
        count={count}
        onPageChange={(event, newPage) => {
          noop();
        }}
        onRowsPerPageChange={(event) => onRowsPerPageChange(event)}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
      />
      
      {/* Company Details Dialog */}
      <CompanyDetailsDialog
        open={isViewDialogOpen}
        onClose={() => {
          setIsViewDialogOpen(false);
          setSelectedCompany(null);
          setCompanyDialogError(null);
        }}
        company={selectedCompany}
        loading={companyDialogLoading}
        error={companyDialogError}
      />

      {/* Add Employee Dialog */}
      <AddCompanyEmployeeDialog
        open={isAddEmployeeDialogOpen}
        onClose={handleCloseAddEmployeeDialog}
        companyId={selectedCompanyId}
        onSuccess={() => {
          // Optionally refresh the table or show a success message
          console.log('Employee added successfully');
        }}
      />
    </Card>
  );
}
