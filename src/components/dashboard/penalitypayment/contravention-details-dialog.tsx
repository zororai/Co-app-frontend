'use client';

import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  IconButton,
  Button,
  useTheme,
} from '@mui/material';
import { XCircle as CloseIcon, Printer } from '@phosphor-icons/react';

interface ContraventionDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  contraventionData: {
    contraventionOf: string[];
    raisedby: string;
    idOrNrNumber: string;
    address: string;
    occupation: string;
    holderOf: string;
    number: string;
    admitof: string;
    descriptionOfOffence: string;
    shaftnumber: string;
    offenceDate: number[];
    signatureOfOffender: string;
    dateCharged: number[];
    shaftStatus: string;
    inspectorOfMines: string;
    acceptedDate: number[];
    status: string;
    remarks: string;
    fineAmount: number;
    finePaid: boolean;
    signed: string;
    sheManager: string;
    inspectorOfMiners: string;
  } | null;
}

const formatDate = (dateArray: number[]) => {
  if (!dateArray || dateArray.length < 3) return 'N/A';
  const [year, month, day] = dateArray;
  return new Date(year, month - 1, day).toLocaleDateString();
};

const InfoItem = ({ label, value }: { label: string; value: string | number }) => (
  <Typography sx={{ mb: 1.5, fontSize: '0.95rem' }}>
    <strong>{label}:</strong> {value}
  </Typography>
);

export function ContraventionDetailsDialog({ open, onClose, contraventionData }: ContraventionDetailsDialogProps): React.JSX.Element {
  const theme = useTheme();

  if (!contraventionData) return <></>;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 3,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
        color: 'white',
        py: 2.5,
        px: 3,
        m: 0,
        fontWeight: 600
      }}>
        Contravention Details
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            onClick={handlePrint}
            size="small"
            sx={{ color: 'white' }}
          >
            <Printer />
          </IconButton>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
          gap: 3,
          mb: 3
        }}>
          {/* Basic Information */}
          <Box sx={{ 
            border: `2px solid ${theme.palette.secondary.main}`, 
            borderRadius: '12px', 
            p: 2.5,
            bgcolor: '#ffffff'
          }}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                color: theme.palette.secondary.main, 
                fontWeight: 700, 
                mb: 2,
                fontSize: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              Basic Information
            </Typography>
            <Box sx={{ mt: 2 }}>
              <InfoItem label="Shaft Number" value={contraventionData.shaftnumber} />
              <InfoItem label="Fine Amount" value={`$${contraventionData.fineAmount.toLocaleString()}`} />
            </Box>
          </Box>

          {/* Status Information */}
          <Box sx={{ 
            border: `2px solid ${theme.palette.secondary.main}`, 
            borderRadius: '12px', 
            p: 2.5,
            bgcolor: '#ffffff'
          }}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                color: theme.palette.secondary.main, 
                fontWeight: 700, 
                mb: 2,
                fontSize: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              Status Information
            </Typography>
            <Box sx={{ mt: 2 }}>
              <InfoItem label="Shaft Status" value={contraventionData.shaftStatus} />
              <InfoItem label="Payment Status" value={contraventionData.finePaid ? 'Paid' : 'Not Paid'} />
            </Box>
          </Box>
        </Box>

        {/* Offence Details */}
        <Box sx={{ 
          border: `2px solid ${theme.palette.secondary.main}`, 
          borderRadius: '12px', 
          p: 2.5,
          mb: 3,
          bgcolor: '#ffffff'
        }}>
          <Typography variant="subtitle1" sx={{ 
            color: theme.palette.secondary.main, 
            fontWeight: 700, 
            mb: 2,
            fontSize: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Offence Details
          </Typography>
          <Box sx={{ mt: 2 }}>
            <InfoItem label="Description of Offence" value={contraventionData.descriptionOfOffence} />
            <Box sx={{ display: 'flex', gap: 4 }}>
              <Box sx={{ flex: 1 }}>
                <InfoItem label="Offence Date" value={formatDate(contraventionData.offenceDate)} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <InfoItem label="Date Charged" value={formatDate(contraventionData.dateCharged)} />
              </Box>
            </Box>
            <InfoItem label="Remarks" value={contraventionData.remarks || 'No remarks'} />
          </Box>
        </Box>

        {/* Offender & Officials Information */}
        <Box sx={{ 
          border: `2px solid ${theme.palette.secondary.main}`, 
          borderRadius: '12px', 
          p: 2.5,
          bgcolor: '#ffffff'
        }}>
          <Typography variant="subtitle1" sx={{ 
            color: theme.palette.secondary.main, 
            fontWeight: 700, 
            mb: 2,
            fontSize: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            People Involved
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ color: theme.palette.secondary.main, mb: 1 }}>
                Offender Information
              </Typography>
              <InfoItem label="ID/NR Number" value={contraventionData.idOrNrNumber} />
              <InfoItem label="Occupation" value={contraventionData.occupation} />
              <InfoItem label="Address" value={contraventionData.address} />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ color: theme.palette.secondary.main, mb: 1 }}>
                Officials
              </Typography>
              <InfoItem label="Raised By" value={contraventionData.raisedby} />
              <InfoItem label="Inspector of Mines" value={contraventionData.inspectorOfMines} />
              <InfoItem label="SHE Manager" value={contraventionData.sheManager} />
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        px: 3, 
        py: 2, 
        background: '#fafafa', 
        borderTop: '1px solid #eaeaea' 
      }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{ 
            borderColor: theme.palette.secondary.main,
            color: theme.palette.secondary.main,
            '&:hover': {
              borderColor: theme.palette.secondary.dark,
              bgcolor: 'rgba(50, 56, 62, 0.04)'
            }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}