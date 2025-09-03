import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { authClient } from '@/lib/auth/client';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

interface ShaftBorrowingDialogProps {
  open: boolean;
  onClose: () => void;
  assignmentId: string | null; // shaft assignment ID
  onSuccess?: () => void; // optional callback to refresh table
}

export function ShaftBorrowingDialog({ open, onClose, assignmentId, onSuccess }: ShaftBorrowingDialogProps): React.JSX.Element {
  const [form, setForm] = React.useState({
    loanName: '',
    paymentMethod: '',
    amountOrGrams: '' as unknown as number | '',
    purpose: '',
    status: '',
    reason: '',
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [loanOptions, setLoanOptions] = React.useState<any[]>([]);
  const [loadingLoans, setLoadingLoans] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      // reset on close
      setForm({ loanName: '', paymentMethod: '', amountOrGrams: '' as unknown as number | '', purpose: '', status: '', reason: '' });
      setError(null);
      setSuccess(null);
      setSubmitting(false);
    }
  }, [open]);

  // Load approved production loans when dialog opens
  React.useEffect(() => {
    const loadLoans = async () => {
      if (!open) return;
      setLoadingLoans(true);
      try {
        const items = await authClient.fetchApprovedProductionLoans();
        setLoanOptions(items || []);
      } catch (error_) {
        console.error('Failed to load loans', error_);
      } finally {
        setLoadingLoans(false);
      }
    };
    loadLoans();
  }, [open]);

  const handleChange = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = key === 'amountOrGrams' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value;
    setForm(prev => ({ ...prev, [key]: value }));
  };

  // When user selects a loan, auto-fill fields from selected option if present
  const handleLoanSelectChange = (value: string) => {
    const selected = loanOptions.find((opt: any) => opt.loanName === value);
    if (!selected) {
      setForm(prev => ({ ...prev, loanName: value }));
      setError('Selected loan was not found. Please choose another or fill fields manually.');
      return;
    }

    // Coerce amountOrGrams to a valid non-negative number if present
    const rawAmount = (selected as any).amountOrGrams;
    const coercedAmount = typeof rawAmount === 'number' ? rawAmount : Number(rawAmount);
    const validAmount = Number.isFinite(coercedAmount) && coercedAmount >= 0 ? coercedAmount : '';

    // Build new form values
    const nextForm = {
      loanName: value,
      paymentMethod: selected?.paymentMethod ?? '',
      amountOrGrams: validAmount as any,
      purpose: selected?.purpose ?? '',
      status: selected?.status ?? '',
      reason: selected?.reason ?? '',
    };

    // Determine missing fields to guide the user
    const missing: string[] = [];
    if (!nextForm.paymentMethod) missing.push('Payment Method');
    if (nextForm.amountOrGrams === '') missing.push('Amount or Grams');
    if (!nextForm.purpose) missing.push('Purpose');
    if (!nextForm.status) missing.push('Status');
    if (!nextForm.reason) missing.push('Reason');

    setForm(prev => ({ ...prev, ...nextForm }));
    if (missing.length > 0) {
      setError(`Some details are missing from this loan: ${missing.join(', ')}. Please fill them before submitting.`);
    } else {
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!assignmentId) {
      setError('Missing assignment ID');
      return;
    }
    // basic required validation
    if (!form.loanName || !form.paymentMethod || form.amountOrGrams === '' || !form.purpose || !form.status || !form.reason) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await authClient.updateShaftLoanDetails(assignmentId, {
        loanName: form.loanName,
        paymentMethod: form.paymentMethod,
        amountOrGrams: Number(form.amountOrGrams),
        purpose: form.purpose,
        status: form.status,
        reason: form.reason,
      });
      if (res.success) {
        setSuccess('Loan details updated successfully');
        if (onSuccess) onSuccess();
        // Close after short delay to show success
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        setError(res.message || 'Failed to update loan details');
      }
    } catch {
      setError('Unexpected error while updating loan details');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Shaft Borrowing</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 2 }}>
          <FormControl fullWidth required>
            <InputLabel id="loan-name-label">Loan Name</InputLabel>
            <Select
              labelId="loan-name-label"
              label="Loan Name"
              value={form.loanName}
              onChange={(e) => handleLoanSelectChange(e.target.value as string)}
              disabled={loadingLoans}
            >
              {loanOptions.map((opt, idx) => (
                <MenuItem key={opt.id ?? idx} value={opt.loanName}>{opt.loanName}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            required
            label="Payment Method"
            value={form.paymentMethod}
            onChange={handleChange('paymentMethod')}
            fullWidth
            disabled={!!form.loanName}
          />
          <TextField
            required
            type="number"
            label="Amount or Grams"
            value={form.amountOrGrams as any}
            onChange={handleChange('amountOrGrams')}
            fullWidth
            inputProps={{ min: 0, step: 'any' }}
            disabled={!!form.loanName}
          />
          <TextField
            required
            label="Purpose"
            value={form.purpose}
            onChange={handleChange('purpose')}
            fullWidth
            disabled={!!form.loanName}
          />
          <TextField
            required
            label="Status"
            value="Pending"

            fullWidth
          />
          <TextField
            required
            label="Reason"
            value={form.reason}
            onChange={handleChange('reason')}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
          {submitting ? <CircularProgress size={22} /> : 'Submit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
