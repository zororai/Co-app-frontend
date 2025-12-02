"use client";
import * as React from "react";
import { Fragment } from "react";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Alert from "@mui/material/Alert";
import dayjs from "dayjs";
import { authClient } from "@/lib/auth/client";
import { useTheme } from "@mui/material/styles";

export type PayoutAssignment = {
  assignmentId?: string | number;
  shaftNumber?: string;
  shaftOwner?: string;
  oreWeightKg?: number;
  mill?: string;
  defaultPricePerGram?: number;
};

export type LoanDetails = {
  loanName?: string;
  paymentMethod?: string;
  amountOrGrams?: number;
  purpose?: string;
  paymentStatus?: string;
  amountPaid?: number;
  balance?: number;
};

type TransportCostItem = {
  paymentMethod?: string;
  amountOrGrams?: number;
  status?: string;
};

export interface PayoutDialogProps {
  open: boolean;
  onClose: () => void;
  assignment?: PayoutAssignment;
  loanDetails?: LoanDetails;
  transportCosts?: TransportCostItem[];
  onSubmit?: (payload: {
    receiptNumber: string;
    shaftOwner: string;
    shaftNumber: string;
    goldWeightGrams: number;
    pricePerGram: number;
    loanType: string;
    transportCost: number;
    netPayout: number;
  }) => Promise<void> | void;
}

// Define steps for the stepper (combine Payout Details and Summary into one step)
const steps = [
  'Assignment Information',
  'Transport Cost',
  'Loan Details',
  'Payout Details & Summary'
];

export function PayoutDialog({ open, onClose, assignment, loanDetails, transportCosts, onSubmit }: PayoutDialogProps) {
  const theme = useTheme();
  const [activeStep, setActiveStep] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  // Generate receipt number only on client after mount to avoid SSR/CSR mismatch
  const [generatedReceipt, setGeneratedReceipt] = React.useState<string>('');
  React.useEffect(() => {
    setGeneratedReceipt(`RCP-${dayjs().format('YYYYMMDD-HHmmss')}`);
  }, []);

  const [shaftOwner, setShaftOwner] = React.useState(assignment?.shaftOwner ?? "");
  const [shaftNumber, setShaftNumber] = React.useState(assignment?.shaftNumber ?? "");
  // Allow empty string so the input can be blank instead of showing a default 0
  const [goldWeightGrams, setGoldWeightGrams] = React.useState<number | ''>('');
  // If assignment provides a positive default price, use it; otherwise keep the field blank instead of showing 0
  const initialPrice = (assignment && typeof assignment.defaultPricePerGram === 'number' && assignment.defaultPricePerGram > 0)
    ? assignment.defaultPricePerGram
    : '';
  const [pricePerGram, setPricePerGram] = React.useState<number | ''>(initialPrice);
  const [loanType, setLoanType] = React.useState<string>("");
  const [transportCost, setTransportCost] = React.useState<number>(0);
  const [buyer, setBuyer] = React.useState<string>("");
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  // Local copy of loan details so we can refresh after payment
  const [loanDetailsState, setLoanDetailsState] = React.useState<LoanDetails | undefined>(loanDetails);
  React.useEffect(() => {
    setLoanDetailsState(loanDetails);
  }, [loanDetails]);
  // Pay loan amount (allow blank so field doesn't show 0 by default)
  const [payAmount, setPayAmount] = React.useState<number | ''>('');
  const [paying, setPaying] = React.useState<boolean>(false);
  // Track Apply/Pause per transport cost item
  const [appliedStatus, setAppliedStatus] = React.useState<Record<number, 'none' | 'applied' | 'paused'>>({});

  // Initialize applied status whenever dialog opens or transportCosts change
  React.useEffect(() => {
    const initial: Record<number, 'none' | 'applied' | 'paused'> = {};
    if (Array.isArray(transportCosts)) {
      transportCosts.forEach((_, idx) => {
        initial[idx] = 'none';
      });
    }
    setAppliedStatus(initial);
  }, [open, transportCosts]);

  React.useEffect(() => {
    if (open) {
      setShaftOwner(assignment?.shaftOwner ?? "");
      setShaftNumber(assignment?.shaftNumber ?? "");
  setGoldWeightGrams('');
      setLoanType("");
      setTransportCost(0);
      setBuyer("");
      setPayAmount('');
      setError(null); // Reset error when dialog opens
      setSubmitted(false); // Reset submit state when dialog opens
    }
  }, [open, assignment]);

  // Compute deductions based on applied transport costs
  const appliedGoldDeductionGrams = React.useMemo(() => {
    if (!Array.isArray(transportCosts)) return 0;
    return transportCosts.reduce((sum, tc, idx) => {
      if (appliedStatus[idx] === 'applied' && String(tc.paymentMethod).toLowerCase() === 'gold') {
        return sum + (Number(tc.amountOrGrams) || 0);
      }
      return sum;
    }, 0);
  }, [transportCosts, appliedStatus]);

  const appliedCashDeductionAmount = React.useMemo(() => {
    if (!Array.isArray(transportCosts)) return 0;
    return transportCosts.reduce((sum, tc, idx) => {
      if (appliedStatus[idx] === 'applied' && String(tc.paymentMethod).toLowerCase() === 'cash') {
        return sum + (Number(tc.amountOrGrams) || 0);
      }
      return sum;
    }, 0);
  }, [transportCosts, appliedStatus]);

  // Determine loan payment deduction based on loan payment method
  const loanPaymentMethod = (loanDetailsState?.paymentMethod || '').toString().trim().toLowerCase();
  const payAmountNum = Number(payAmount) || 0;
  const loanGoldDeductionGrams = payAmountNum > 0 && loanPaymentMethod === 'gold' ? payAmountNum : 0;
  const loanCashDeductionAmount = payAmountNum > 0 && loanPaymentMethod === 'cash' ? payAmountNum : 0;

  // Totals for deductions combining transport and loan payment
  const totalGoldDeductionGrams = (appliedGoldDeductionGrams || 0) + (loanGoldDeductionGrams || 0);
  const totalCashDeductionAmount = (appliedCashDeductionAmount || 0) + (loanCashDeductionAmount || 0);

  const computedGoldWeight = Math.max(0, (goldWeightGrams || 0) - totalGoldDeductionGrams);
  const grossAmount = (computedGoldWeight || 0) * (pricePerGram || 0);
  // Net payout deducts any applied cash amounts and loan cash payment; we do not subtract the old transportCost field to avoid double counting
  const netPayout = Math.max(0, grossAmount - totalCashDeductionAmount);

  // For display purpose: show originals where deductions are applied
  const originalGoldWeight = goldWeightGrams || 0;
  const originalGrossAmount = (originalGoldWeight || 0) * (pricePerGram || 0);
  const grossAfterCashDeduction = Math.max(0, originalGrossAmount - totalCashDeductionAmount);

  const anyApplied = React.useMemo(() => Object.values(appliedStatus).some((v) => v === 'applied'), [appliedStatus]);

  // Consistent TextField styling using theme colors
  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: theme.palette.secondary.main },
      '&:hover fieldset': { borderColor: theme.palette.secondary.main },
      '&.Mui-focused fieldset': { borderColor: theme.palette.secondary.main },
    },
    '& .MuiInputLabel-root': {
      '&.Mui-focused': { color: theme.palette.secondary.main },
    },
  } as const;

  // Determine if the loan is already fully paid to hide pay controls
  const isLoanPaid = React.useMemo(() => {
    const status = (loanDetailsState?.paymentStatus || '').toString().trim().toUpperCase();
    return status === 'PAID';
  }, [loanDetailsState?.paymentStatus]);

  // Require key inputs before allowing transport cost Apply/Pause actions
  const inputsReady = React.useMemo(() => {
    const gw = Number(goldWeightGrams) || 0;
    const ppg = Number(pricePerGram) || 0;
    const buyerOk = (buyer || "").toString().trim().length > 0;
    return gw > 0 && ppg > 0 && buyerOk;
  }, [goldWeightGrams, pricePerGram, buyer]);

  // Determine whether we can skip applying transport costs:
  // - If there are no transport cost items at all
  // - Or if the transportCost value is explicitly zero
  const canSkipApply = React.useMemo(() => {
    const hasTransportCosts = Array.isArray(transportCosts) && transportCosts.length > 0;
    return !hasTransportCosts || Number(transportCost) === 0;
  }, [transportCosts, transportCost]);

  // Handle stepper navigation
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null); // Clear any previous errors
    try {
      // If there is a payment amount and the loan isn't already PAID, process loan payment first
  if (!isLoanPaid && payAmountNum > 0) {
        const shaft = assignment?.shaftNumber; 
        if (!shaft) {
          throw new Error('Missing shaft number for loan payment.');
        }
        const res = await authClient.payShaftLoan(shaft, Number(payAmount));
        if (res.success) {
          // Refresh loan details by shaft number
          if (shaftNumber) {
            const data = await authClient.fetchLoansByShaftNumber(String(shaftNumber));
            const item = Array.isArray(data) ? data[0] : data;
            const refreshed: LoanDetails | undefined = item
              ? {
                  loanName: item.loanName || item.name || item.type || '-',
                  paymentMethod: item.paymentMethod || item.method || '-',
                  amountOrGrams: Number(item.amountOrGrams ?? item.amount ?? item.grams ?? 0) || 0,
                  purpose: item.purpose || '-',
                  paymentStatus: item.paymentStatus || item.status || '-',
                  amountPaid: Number(item.amountPaid ?? item.paid ?? 0) || 0,
                  balance: Number(item.balance ?? item.remaining ?? 0) || 0,
                }
              : undefined;
            setLoanDetailsState(refreshed);
          }
          setPayAmount('');
        } else {
          const errorMsg = res.error || 'Failed to process loan payment';
          setError(errorMsg);
          return; // Don't proceed with payout if loan payment fails
        }
      }

      // Create gold sale record
      const oreTransportId = assignment?.assignmentId;
      if (!oreTransportId) {
        throw new Error('Missing ore transport ID for gold sale.');
      }

      const goldSaleResult = await authClient.createGoldSale(
        oreTransportId,
        Number(goldWeightGrams) || 0,
        Number(pricePerGram) || 0,
        buyer
      );

      if (!goldSaleResult.success) {
        let errorMsg = goldSaleResult.error || 'Failed to create gold sale';
        
        // Provide helpful message if backend endpoint doesn't exist (404)
        if (errorMsg.includes('404') || errorMsg.toLowerCase().includes('not found')) {
          errorMsg = 'Backend API endpoint not yet implemented. The gold sale record could not be saved. Please contact your system administrator. (Error: PUT /api/ore-transports/{id}/gold-sale endpoint returns 404)';
        }
        
        setError(errorMsg);
        return;
      }

      const payload = {
        receiptNumber: generatedReceipt,
        shaftOwner,
        shaftNumber,
        goldWeightGrams: Number(goldWeightGrams) || 0,
        pricePerGram: Number(pricePerGram) || 0,
        loanType,
        transportCost: Number(transportCost) || 0,
        netPayout,
      };
      if (onSubmit) {
        await onSubmit(payload);
      } else {
        console.log("Payout submitted:", payload);
      }
      // Mark as submitted (show complete state)
      setSubmitted(true);
      // Ensure the stepper indicator is on the last step
      setActiveStep(steps.length - 1);
    } catch (error) {
      console.error('Payout submission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      // Check for authentication errors
      if (errorMessage.toLowerCase().includes('authentication') || errorMessage.toLowerCase().includes('unauthorized')) {
        setError('Authentication required. Please log in again and try again.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset to first step
    setActiveStep(0);
    setError(null); // Clear errors on close
    setSubmitted(false);
    onClose();
  };

  // Render step content based on active step
  const renderStepContent = (): React.ReactNode => {
    switch (activeStep) {
      case 0: { // Assignment Information
        return (
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Assignment Information
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
              Details of the current assignment
            </Typography>
            
            <Box sx={{ bgcolor: 'success.light', border: 1, borderColor: 'success.main', borderRadius: 1, p: 2 }}>
              <Box sx={{ display: "grid", rowGap: 1 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Shaft Number</Typography>
                  <Typography variant="body2">{assignment?.shaftNumber ?? "-"}</Typography>
                </Box>
                
                <Box>
                  <Typography variant="caption" color="text.secondary">Shaft Owner</Typography>
                  <Typography variant="body2">{assignment?.shaftOwner ?? "-"}</Typography>
                </Box>
                
                <Box>
                  <Typography variant="caption" color="text.secondary">Ore Weight</Typography>
                  <Typography variant="body2">{assignment?.oreWeightKg ?? 0} kg</Typography>
                </Box>
                
                <Box>
                  <Typography variant="caption" color="text.secondary">Mill</Typography>
                  <Typography variant="body2">{assignment?.mill ?? "-"}</Typography>
                </Box>
                
                {/* Removed Default Price per Gram display as requested */}
              </Box>
            </Box>
          </Box>
        );
      }
      
      case 1: { // Transport Cost
        return (
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Transport Cost
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
              Manage transport cost deductions
            </Typography>
            
            {!inputsReady && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Please complete Payout Details (Gold Weight, Price per gram, and Buyer) before applying transport costs.
              </Alert>
            )}
            
            <Box sx={{ bgcolor: 'error.main', color: 'common.white', border: 1, borderColor: 'error.dark', borderRadius: 1, p: 2 }}>
              <Box sx={{ display: "grid", rowGap: 1 }}>
                {Array.isArray(transportCosts) && transportCosts.length > 0 ? (
                  transportCosts.map((tc, idx) => (
                    <Box key={idx} sx={{
                      border: 1,
                      borderColor: appliedStatus[idx] === 'applied' ? 'success.light' : 'error.dark',
                      borderRadius: 1,
                      p: 1.5,
                      mb: 1,
                      bgcolor: appliedStatus[idx] === 'applied' ? 'rgba(76, 175, 80, 0.1)' : 'transparent'
                    }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2">Payment Method:</Typography>
                        <Typography variant="body2">{tc.paymentMethod ?? '-'}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2">Amount/Grams:</Typography>
                        <Typography variant="body2">{tc.amountOrGrams ?? 0}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2">Status:</Typography>
                        <Typography variant="body2">{tc.status ?? '-'}</Typography>
                      </Box>
                      {inputsReady && (
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Button
                            size="small"
                            variant={appliedStatus[idx] === 'applied' ? 'contained' : 'outlined'}
                            color="success"
                            onClick={() => {
                              setAppliedStatus((prev) => ({ ...prev, [idx]: prev[idx] === 'applied' ? 'none' : 'applied' }));
                            }}
                          >
                            Apply
                          </Button>
                          <Button
                            size="small"
                            variant={appliedStatus[idx] === 'paused' ? 'contained' : 'outlined'}
                            color="warning"
                            onClick={() => {
                              setAppliedStatus((prev) => ({ ...prev, [idx]: prev[idx] === 'paused' ? 'none' : 'paused' }));
                            }}
                          >
                            Pause
                          </Button>
                        </Box>
                      )}
                      {appliedStatus[idx] === 'applied' ? (
                        <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                          {String(tc.paymentMethod).toLowerCase() === 'gold'
                            ? `This will deduct ${Number(tc.amountOrGrams) || 0} grams from Gold Weight`
                            : `This will deduct $${Number(tc.amountOrGrams) || 0} from Gross Amount`}
                        </Typography>
                      ) : null}
                    </Box>
                  ))
                ) : (
                  <>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2">Payment Method:</Typography>
                      <Typography variant="body2">{loanDetails?.paymentMethod ?? '-'}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2">Amount/Grams:</Typography>
                      <Typography variant="body2">{loanDetails?.amountOrGrams ?? 0}</Typography>
                    </Box>
                  </>
                )}
              </Box>
            </Box>
          </Box>
        );
      }
      
      case 2: { // Loan Details
        return (
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Loan Details
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
              Details of the Current Loan
            </Typography>
            
            <Box sx={{ bgcolor: 'error.main', color: 'common.white', border: 1, borderColor: 'error.dark', borderRadius: 1, p: 2 }}>
              <Box sx={{ display: "grid", rowGap: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2">Loan Name:</Typography>
                  <Typography variant="body2">{loanDetailsState?.loanName ?? '-'}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2">Payment Method:</Typography>
                  <Typography variant="body2">{loanDetailsState?.paymentMethod ?? '-'}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2">Amount/Grams:</Typography>
                  <Typography variant="body2">{loanDetailsState?.amountOrGrams ?? 0}</Typography>
                </Box>
                {/* Pay Loan controls */}
                {!isLoanPaid && (
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
                    <TextField
                      label="Amount to be Paid"
                      type="number"
                      size="small"
                      inputProps={{ min: 0, step: 0.01 }}
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value === '' ? '' : Number(e.target.value))}
                      sx={{
                        ...textFieldStyle,
                        '& .MuiOutlinedInput-root': {
                          ...textFieldStyle['& .MuiOutlinedInput-root'],
                          backgroundColor: 'white',
                        }
                      }}
                    />
                  </Box>
                )}
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2">Payment Status:</Typography>
                  <Typography variant="body2">{loanDetailsState?.paymentStatus ?? '-'}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2">Amount Paid:</Typography>
                  <Typography variant="body2">{loanDetailsState?.amountPaid ?? 0}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2">Balance:</Typography>
                  <Typography variant="body2">{loanDetailsState?.balance ?? 0}</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        );
      }
      
      case 3: { // Combined Payout Details & Summary
        return (
          <Box sx={{ p: 1 }}>
            {/* Payout Details */}
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Payout Details
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
              Enter payout information and review the summary below
            </Typography>

            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <TextField
                  fullWidth
                  margin="dense"
                  label="Receipt Number"
                  value={generatedReceipt || 'Generating...'}
                  InputProps={{ readOnly: true }}
                  size="small"
                  sx={textFieldStyle}
                />
              
                <TextField
                  fullWidth
                  margin="dense"
                  label="Free Gold Weight (grams)"
                  type="number"
                  inputProps={{ min: 0, step: 0.01 }}
                  value={goldWeightGrams}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGoldWeightGrams(e.target.value === '' ? '' : Number(e.target.value))}
                  size="small"
                  sx={textFieldStyle}
                />
                <TextField
                  fullWidth
                  margin="dense"
                  label="Gold Selling Price (per gram)"
                  type="number"
                  inputProps={{ min: 0, step: 0.01 }}
                  value={pricePerGram}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPricePerGram(e.target.value === '' ? '' : Number(e.target.value))}
                  size="small"
                  sx={textFieldStyle}
                />
             
                <TextField
                  fullWidth
                  margin="dense"
                  label="Buyer"
                  type="text"
                  value={buyer}
                  onChange={(e) => setBuyer(e.target.value)}
                  size="small"
                  sx={textFieldStyle}
                />
              </CardContent>
            </Card>

            {/* Payout Summary (same step) */}
            <Box sx={{ bgcolor: 'success.dark', color: 'common.white', border: 1, borderColor: 'success.dark', borderRadius: 1, p: 2 }}>
              <Box sx={{ display: "grid", rowGap: 1 }}>
                {appliedGoldDeductionGrams > 0 && (
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2">Original Gold Weight:</Typography>
                    <Typography variant="body2">{originalGoldWeight} g</Typography>
                  </Box>
                )}
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2">Gold Weight{appliedGoldDeductionGrams > 0 ? ' (after deduction)' : ''}:</Typography>
                  <Typography variant="body2">{computedGoldWeight} g</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2">Price per gram:</Typography>
                  <Typography variant="body2">${pricePerGram || 0}</Typography>
                </Box>
                {totalCashDeductionAmount > 0 && (
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2">Original Gross Amount:</Typography>
                    <Typography variant="body2">${originalGrossAmount.toFixed(2)}</Typography>
                  </Box>
                )}
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2">Gross Amount{appliedCashDeductionAmount > 0 || loanCashDeductionAmount > 0 ? ' (after cash deduction)' : ''}:</Typography>
                  <Typography variant="body2">${(appliedCashDeductionAmount > 0 || loanCashDeductionAmount > 0 ? grossAfterCashDeduction : grossAmount).toFixed(2)}</Typography>
                </Box>
                {appliedGoldDeductionGrams > 0 && (
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2">Transport Deduction (Gold):</Typography>
                    <Typography variant="body2">-{appliedGoldDeductionGrams} g</Typography>
                  </Box>
                )}
                {appliedCashDeductionAmount > 0 && (
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2">Transport Deduction (Cash):</Typography>
                    <Typography variant="body2">-${appliedCashDeductionAmount.toFixed(2)}</Typography>
                  </Box>
                )}
                {payAmountNum > 0 && (
                  <>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2">Loan Payment Entered:</Typography>
                      <Typography variant="body2">
                        {loanPaymentMethod === 'gold' ? `${loanGoldDeductionGrams} g` : `$${loanCashDeductionAmount.toFixed(2)}`}
                      </Typography>
                    </Box>
                    {loanGoldDeductionGrams > 0 && (
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2">Loan Payment Deduction (Gold):</Typography>
                        <Typography variant="body2">-{loanGoldDeductionGrams} g</Typography>
                      </Box>
                    )}
                    {loanCashDeductionAmount > 0 && (
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2">Loan Payment Deduction (Cash):</Typography>
                        <Typography variant="body2">-${loanCashDeductionAmount.toFixed(2)}</Typography>
                      </Box>
                    )}
                  </>
                )}
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                  <Typography variant="subtitle1" fontWeight={700}>Net Payout:</Typography>
                  <Typography variant="subtitle1" fontWeight={700}>${netPayout.toFixed(2)}</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        );
      }
      
      default: {
        return null;
      }
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={submitting ? undefined : handleClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        bgcolor: theme.palette.secondary.main,
        color: 'white',
        py: 2.5,
        px: 3,
        m: 0
      }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600, color: 'white' }}>
          {submitted ? 'Payout Complete' : 'Payout'}
        </Typography>
  
        <IconButton
          aria-label="close"
          onClick={handleClose}
          disabled={submitting}
          sx={{
            color: 'white',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Typography variant="body2" color="text.secondary" sx={{ padding: 2, mt: 0.5 }}>
        Process payout for refined ore with automated deductions
      </Typography>
      
      <Box sx={{ width: '100%', px: 3, py: 2 }}>
        <Stepper 
          activeStep={activeStep} 
          alternativeLabel
          sx={{
            '& .MuiStepIcon-root': {
              color: '#d1d5db',
              '&.Mui-active': { color: theme.palette.secondary.main },
              '&.Mui-completed': { color: theme.palette.secondary.main },
            },
            '& .MuiStepLabel-label': {
              '&.Mui-active': { color: theme.palette.secondary.main, fontWeight: 600 },
              '&.Mui-completed': { color: theme.palette.secondary.main, fontWeight: 500 },
            },
            '& .MuiStepConnector-line': { borderColor: '#d1d5db' },
            '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line': { borderColor: theme.palette.secondary.main },
            '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': { borderColor: theme.palette.secondary.main },
          }}
        >
          {steps.map((label, index) => (
            <Step key={label} completed={activeStep > index}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <DialogContent
        dividers
        sx={{
          px: 3,
          py: 2,
          maxHeight: '60vh',
          overflow: 'auto',
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-track': { backgroundColor: '#f1f1f1' },
          '&::-webkit-scrollbar-thumb': { backgroundColor: theme.palette.secondary.main, borderRadius: '3px' },
        }}
      >
        {/* Error message */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Step content */}
        {renderStepContent()}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        {submitted ? (
          <Button
            variant="contained"
            onClick={handleClose}
            sx={{ ml: 'auto' }}
          >
            Close
          </Button>
        ) : (
          <Fragment>
            <Button
              color="inherit"
              disabled={activeStep === 0 || submitting}
              onClick={handleBack}
            >
              Previous
            </Button>
            <Box sx={{ flex: '1 1 auto' }} />
            {!anyApplied && activeStep === steps.length - 1 && !canSkipApply && (
              <Typography variant="caption" sx={{ color: 'text.secondary', mr: 2 }}>
                Apply at least one transport cost to proceed
              </Typography>
            )}
            <Button
              variant="contained"
              onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
              disabled={submitting || (activeStep === steps.length - 1 && !anyApplied && !canSkipApply)}
              sx={{
                bgcolor: theme.palette.secondary.main,
                '&:hover': {
                  bgcolor: theme.palette.secondary.dark
                }
              }}
            >
              {activeStep === steps.length - 1 ? (submitting ? 'Saving...' : 'Submit') : 'Next'}
            </Button>
          </Fragment>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default PayoutDialog;
