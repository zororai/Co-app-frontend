'use client';

import * as React from 'react';
import {
  Avatar,
  Box,
  Card,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  Skeleton,
} from '@mui/material';
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { PencilSimple as PencilSimpleIcon } from '@phosphor-icons/react/dist/ssr/PencilSimple';
import { Trash as TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export interface ShaftInspection {
  id: string;
  inspectorName: string;
  location: string;
  inspectionDate: string;
  inspectionTime: string;
  inspectionType: string;
  hazardControlProgram: string;
  observations: string;
  pollutionStatus: string;
  correctiveActions: string;
  complianceStatus: string;
  shaftNumbers: string[];
  attachments: string[];
  createdAt: string;
}

function noop(): void {
  // This is intentional
}

interface ShaftInspectionTableProps {
  count?: number;
  page?: number;
  rows?: ShaftInspection[];
  rowsPerPage?: number;
  loading?: boolean;
  error?: string;
  onRefresh?: () => void;
}

export function ShaftInspectionTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 10,
  loading = false,
  error = '',
  onRefresh
}: ShaftInspectionTableProps): React.JSX.Element {

  // Mock data for demonstration
  const mockData: ShaftInspection[] = [
    {
      id: '1',
      inspectorName: 'John Smith',
      location: 'Mine Site A',
      inspectionDate: '2024-10-30',
      inspectionTime: '10:30 AM',
      inspectionType: 'Air Quality, Waste Disposal',
      hazardControlProgram: 'Program being evaluated',
      observations: 'Observed minor leak in waste water treatment pipe near Shaft 5. Ventilation system is functioning below optimal capacity.',
      pollutionStatus: 'Minor Leak',
      correctiveActions: 'Repair waste water pipe, recalibrate ventilation system M1, and implement daily review for leaks.',
      complianceStatus: 'Compliant',
      shaftNumbers: ['SHAFT-001', 'SHAFT-002'],
      attachments: ['inspection_photo_1.jpg', 'water_sample_report.pdf'],
      createdAt: '2024-10-30T10:30:00Z'
    },
    {
      id: '2',
      inspectorName: 'Sarah Johnson',
      location: 'Mine Site B',
      inspectionDate: '2024-10-29',
      inspectionTime: '02:15 PM',
      inspectionType: 'Safety Check',
      hazardControlProgram: 'Safety protocols reviewed',
      observations: 'All safety equipment in good condition. Emergency exits clearly marked.',
      pollutionStatus: 'No Pollution',
      correctiveActions: 'Continue regular maintenance schedule.',
      complianceStatus: 'Compliant',
      shaftNumbers: ['SHAFT-003'],
      attachments: ['safety_checklist.pdf'],
      createdAt: '2024-10-29T14:15:00Z'
    }
  ];

  const dataToDisplay = rows.length > 0 ? rows : mockData;

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

  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow>
              <TableCell>Inspector</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Date & Time</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Pollution Status</TableCell>
              <TableCell>Compliance</TableCell>
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
            {!loading && dataToDisplay.map((row) => (
              <TableRow hover key={row.id}>
                <TableCell>
                  <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    <Avatar sx={{ width: 32, height: 32 }}>
                      {row.inspectorName.split(' ').map(n => n[0]).join('')}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2">{row.inspectorName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Inspector
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{row.location}</Typography>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">{new Date(row.inspectionDate).toLocaleDateString()}</Typography>
                    <Typography variant="caption" color="text.secondary">{row.inspectionTime}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 150 }}>
                    {row.inspectionType}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={row.pollutionStatus}
                    color={getPollutionColor(row.pollutionStatus)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={row.complianceStatus}
                    color={getComplianceColor(row.complianceStatus)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {row.shaftNumbers.slice(0, 2).map((shaft, index) => (
                      <Chip
                        key={index}
                        label={shaft}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                    {row.shaftNumbers.length > 2 && (
                      <Chip
                        label={`+${row.shaftNumbers.length - 2}`}
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
            ))}
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
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </Card>
  );
}
