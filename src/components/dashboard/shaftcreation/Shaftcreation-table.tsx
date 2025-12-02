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
import TableSortLabel from '@mui/material/TableSortLabel';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Skeleton from '@mui/material/Skeleton';
import dayjs from 'dayjs';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { useSelection } from '@/hooks/use-selection';
import { ReactNode } from 'react';
import { authClient } from '@/lib/auth/client';

function noop(): void {
  // do nothing
}

export interface Customer {
  id: string;
  sectionName: string;
  shaftNumbers: string;
  operationStatus: boolean;
  status: 'APPROVED' | 'REJECTED';
  assignStatus: string;
  // Optionally, add index signature if you need dynamic keys:
  [key: string]: any;
}

export interface CustomersTableProps {
  count?: number;
  rows?: Customer[];
  page?: number;
  rowsPerPage?: number;
  onPageChange?: (event: unknown, newPage: number) => void;
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function CustomersTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 25,
  onPageChange,
  onRowsPerPageChange
}: CustomersTableProps): React.JSX.Element {
  // Local state for pagination if not controlled by parent
  const [internalPage, setInternalPage] = React.useState(page);
  const [internalRowsPerPage, setInternalRowsPerPage] = React.useState(rowsPerPage);
  const [sortField, setSortField] = React.useState<string>('sectionName');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

  // Use controlled or internal state
  const currentPage = onPageChange ? page : internalPage;
  const currentRowsPerPage = onRowsPerPageChange ? rowsPerPage : internalRowsPerPage;
  const [filters, setFilters] = React.useState({
    search: '',
    status: 'all',
    position: 'all'
  });

  const handleSort = (field: string) => {
    const isAsc = sortField === field && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  // Filter the rows based on search and filters
  const filteredRows = React.useMemo(() => {
    return rows.filter(row => {
      const matchesSearch = filters.search === '' || 
        Object.values(row).some(value => 
          String(value).toLowerCase().includes(filters.search.toLowerCase())
        );
      const matchesStatus = filters.status === 'all' || row.status === filters.status;
      return matchesSearch && matchesStatus;
    });
  }, [rows, filters]);

  // Sort filtered rows
  const sortedRows = React.useMemo(() => {
    return [...filteredRows].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      
      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [filteredRows, sortField, sortDirection]);

  // Paginate sorted rows
  const paginatedRows = React.useMemo(() => {
    return sortedRows.slice(currentPage * currentRowsPerPage, currentPage * currentRowsPerPage + currentRowsPerPage);
  }, [sortedRows, currentPage, currentRowsPerPage]);

  const rowIds = React.useMemo(() => {
    return filteredRows.map((customer) => customer.id);
  }, [filteredRows]);

  // Initialize selection handling
  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < rows.length;
  const selectedAll = rows.length > 0 && selected?.size === rows.length;


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
          {/* Search input */}
          <TextField
            size="small"
            label="Search"
            variant="outlined"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            sx={{ minWidth: 220 }}
            placeholder="Search shafts..."
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              label="Status"
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="APPROVED">Approved</MenuItem>
              <MenuItem value="REJECTED">Rejected</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Divider />
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow>
              <TableCell sortDirection={sortField === 'shaftNumbers' ? sortDirection : false}>
                <TableSortLabel
                  active={sortField === 'shaftNumbers'}
                  direction={sortField === 'shaftNumbers' ? sortDirection : 'asc'}
                  onClick={() => handleSort('shaftNumbers')}
                >
                  Shaft Number
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={sortField === 'sectionName' ? sortDirection : false}>
                <TableSortLabel
                  active={sortField === 'sectionName'}
                  direction={sortField === 'sectionName' ? sortDirection : 'asc'}
                  onClick={() => handleSort('sectionName')}
                >
                  Section
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={sortField === 'status' ? sortDirection : false}>
                <TableSortLabel
                  active={sortField === 'status'}
                  direction={sortField === 'status' ? sortDirection : 'asc'}
                  onClick={() => handleSort('status')}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell>Assignment Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((row) => {
              const isSelected = selected?.has(row.id);
              return (
                <TableRow hover key={row.id} selected={isSelected}>
                  <TableCell>{row.shaftNumbers}</TableCell>
                  <TableCell>{row.sectionName}</TableCell>
                  <TableCell>
                    <Box sx={{
                      display: 'inline-block',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: row.status === 'APPROVED' ? '#C8E6C9' : 
                               row.status === 'REJECTED' ? '#FFCDD2' : 
                               row.status === 'PENDING' ? '#FFF9C4' : '#E0E0E0',
                      color: row.status === 'APPROVED' ? '#1B5E20' : 
                             row.status === 'REJECTED' ? '#B71C1C' : 
                             row.status === 'PENDING' ? '#F57F17' : '#616161',
                      fontWeight: 'medium',
                      fontSize: '0.875rem'
                    }}>
                      {row.status}
                    </Box>
                  </TableCell>
                  <TableCell>{row.assignStatus}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small"
                          sx={{
                            color: 'secondary.main',
                            '&:hover': { bgcolor: 'rgba(50, 56, 62, 0.08)' }
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton 
                          size="small"
                          sx={{
                            color: 'secondary.main',
                            '&:hover': { bgcolor: 'rgba(50, 56, 62, 0.08)' }
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          size="small"
                          sx={{
                            color: 'error.main',
                            '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.08)' }
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
        count={sortedRows.length}
        page={currentPage}
        rowsPerPage={currentRowsPerPage}
        onPageChange={onPageChange || ((_e, newPage) => setInternalPage(newPage))}
        onRowsPerPageChange={onRowsPerPageChange || ((e) => {
          setInternalRowsPerPage(Number.parseInt(e.target.value, 10));
          setInternalPage(0);
        })}
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
      />
    </Card>
  );
}
