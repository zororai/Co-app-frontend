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
  rowsPerPage = 5,
  onPageChange,
  onRowsPerPageChange
}: CustomersTableProps): React.JSX.Element {
  // Local state for pagination if not controlled by parent
  const [internalPage, setInternalPage] = React.useState(page);
  const [internalRowsPerPage, setInternalRowsPerPage] = React.useState(rowsPerPage);

  // Use controlled or internal state
  const currentPage = onPageChange ? page : internalPage;
  const currentRowsPerPage = onRowsPerPageChange ? rowsPerPage : internalRowsPerPage;
  const [filters, setFilters] = React.useState({
    search: '',
    status: 'all',
    position: 'all'
  });

  // Filter the rows based on search and filters
  const filteredRows = React.useMemo(() => {
    return rows.filter(row => {
      const matchesSearch = filters.search === '' || 
        Object.values(row).some(value => 
          String(value).toLowerCase().includes(filters.search.toLowerCase())
        );
      const matchesStatus = filters.status === 'all' || row.status === filters.status;
      const matchesPosition = filters.position === 'all' || row.position === filters.position;
      return matchesSearch && matchesStatus && matchesPosition;
    });
  }, [rows, filters]);

  // Paginate filtered rows
  const paginatedRows = React.useMemo(() => {
    return filteredRows.slice(currentPage * currentRowsPerPage, currentPage * currentRowsPerPage + currentRowsPerPage);
  }, [filteredRows, currentPage, currentRowsPerPage]);

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
              
              <TableCell>Shaft Number</TableCell>
              <TableCell>Section</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Assignment Status</TableCell>
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
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 2,
                          bgcolor: row.status === 'APPROVED' ? '#d0f5e8' : '#ffebee', // vivid green or light red
                          color: row.status === 'APPROVED' ? '#1b5e20' : '#c62828',   // deep green or deep red
                          fontWeight: 500,
                          fontSize: 13,
                        }}
                      >
                        {row.status}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{row.assignStatus}</TableCell>
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
