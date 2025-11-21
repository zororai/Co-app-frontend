'use client';

import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import { authClient } from '@/lib/auth/client';

export interface RegPaymentDialogProps {
  open: boolean;
  onClose: () => void;
  minerId: string | null;
  onSuccess?: () => void;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export default function RegPaymentDialog({ open, onClose, minerId, onSuccess }: RegPaymentDialogProps) {
  const theme = useTheme();
  const [regfeePaid, setRegfeePaid] = React.useState<string>('Yes');
  const [attachFile, setAttachFile] = React.useState<File | null>(null);
  const [reciptnumber, setReciptnumber] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      // reset when closed
      setRegfeePaid('Yes');
      setAttachFile(null);
      setReciptnumber('');
      setError(null);
      setLoading(false);
    }
  }, [open]);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    setAttachFile(f ?? null);
  };

  const handleSubmit = async () => {
    if (!minerId) {
      setError('Missing miner id');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let attachDocuments = '';
      if (attachFile) {
        attachDocuments = await fileToBase64(attachFile);
      }

      const payload = {
        regfeePaid,
        attachDocuments,
        reciptnumber
      };

      const res = await authClient.putMinerPayment(minerId, payload);
      if (!res.success) {
        setError(res.error || 'Failed to submit payment');
      } else {
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err) {
      console.error('Payment submit error', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2.5,
          bgcolor: theme.palette.secondary.main,
          color: 'white'
        }}
      >
        <Typography variant="h6" component="span" sx={{ color: 'white', fontWeight: 600 }}>
          Record Registration Payment
        </Typography>
        <Box>
          <Button onClick={onClose} size="small" sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}>
            <CloseIcon sx={{ color: 'white' }} />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 4 }}>
        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl size="small">
            <InputLabel id="regfee-paid-label">Registration Fee Paid</InputLabel>
            <Select
              labelId="regfee-paid-label"
              value={regfeePaid}
              label="Registration Fee Paid"
              onChange={(e) => setRegfeePaid(String(e.target.value))}
            >
              <MenuItem value="Yes">Yes</MenuItem>
            </Select>
          </FormControl>

          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1 }}>ID Picture</Typography>
            <input
              ref={fileInputRef}
              id="attach-docs"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <Button
              variant="outlined"
              fullWidth
              onClick={() => fileInputRef.current?.click()}
              sx={{
                borderRadius: '12px',
                borderColor: theme.palette.secondary.main,
                color: theme.palette.secondary.main,
                textTransform: 'none',
                py: 1.25,
                '&:hover': {
                  bgcolor: `${theme.palette.secondary.main}10`
                }
              }}
            >
              Choose Image
            </Button>
            {attachFile && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {attachFile.name}
              </Typography>
            )}
          </Box>

          <TextField
            size="small"
            label="Receipt Number"
            value={reciptnumber}
            onChange={(e) => setReciptnumber(e.target.value)}
            fullWidth
          />

          {error && <Typography color="error">{error}</Typography>}
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2.5, bgcolor: 'background.default' }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            bgcolor: theme.palette.secondary.main,
            color: '#fff',
            '&:hover': { bgcolor: theme.palette.secondary.dark },
            px: 4
          }}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            bgcolor: theme.palette.secondary.main,
            color: '#fff',
            '&:hover': { bgcolor: theme.palette.secondary.dark },
            px: 4
          }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : 'Submit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
