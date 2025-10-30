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
} from '@mui/material';
import { DotsThreeVertical as DotsThreeVerticalIcon } from '@phosphor-icons/react/dist/ssr/DotsThreeVertical';
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { PencilSimple as PencilSimpleIcon } from '@phosphor-icons/react/dist/ssr/PencilSimple';
import { Trash as TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

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
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow>
             
              <TableCell>Training Type</TableCell>
              <TableCell>Trainer</TableCell>
              <TableCell>Schedule Date</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Trainees</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const isSelected = selectedRows.has(row.id);

              return (
                <TableRow hover key={row.id} selected={isSelected}>
                  
                  <TableCell>
                    <Stack sx={{ alignItems: 'flex-start' }}>
                      <Typography variant="subtitle2">{row.trainingType}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {row.trainerName.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <Typography variant="subtitle2">{row.trainerName}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(row.scheduleDate).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{row.location}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {row.trainees.length} trainee{row.trainees.length !== 1 ? 's' : ''}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={getStatusColor(row.status)}
                      label={row.status}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={(event) => handleMenuClick(event, row.id)}
                      size="small"
                    >
                      <DotsThreeVerticalIcon fontSize="var(--icon-fontSize-sm)" />
                    </IconButton>
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
        count={count}
        onPageChange={() => {}}
        onRowsPerPageChange={() => {}}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleMenuClose}>
          <EyeIcon fontSize="var(--icon-fontSize-sm)" style={{ marginRight: 8 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <PencilSimpleIcon fontSize="var(--icon-fontSize-sm)" style={{ marginRight: 8 }} />
          Edit Training
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <TrashIcon fontSize="var(--icon-fontSize-sm)" style={{ marginRight: 8 }} />
          Delete Training
        </MenuItem>
      </Menu>
    </Card>
  );
}
