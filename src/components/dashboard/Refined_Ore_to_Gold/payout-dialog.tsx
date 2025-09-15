"use client";
import * as React from "react";
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
import dayjs from "dayjs";
import { error } from "console";
import { authClient } from "@/lib/auth/client";

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

export function PayoutDialog({ open, onClose, assignment, loanDetails, transportCosts, onSubmit }: PayoutDialogProps) {
  // Generate receipt number only on client after mount to avoid SSR/CSR mismatch
  const [generatedReceipt, setGeneratedReceipt] = React.useState<string>('');
  React.useEffect(() => {
    setGeneratedReceipt(`RCP-${dayjs().format('YYYYMMDD-HHmmss')}`);
  }, []);

  const [shaftOwner, setShaftOwner] = React.useState(assignment?.shaftOwner ?? "");
  const [shaftNumber, setShaftNumber] = React.useState(assignment?.shaftNumber ?? "");
  const [goldWeightGrams, setGoldWeightGrams] = React.useState<number>(0);
  const [pricePerGram, setPricePerGram] = React.useState<number>(assignment?.defaultPricePerGram ?? 0);
  const [loanType, setLoanType] = React.useState<string>("");
  const [transportCost, setTransportCost] = React.useState<number>(0);
  const [submitting, setSubmitting] = React.useState(false);
  // Local copy of loan details so we can refresh after payment
  const [loanDetailsState, setLoanDetailsState] = React.useState<LoanDetails | undefined>(loanDetails);
  React.useEffect(() => {
    setLoanDetailsState(loanDetails);
  }, [loanDetails]);
  // Pay loan amount
  const [payAmount, setPayAmount] = React.useState<number>(0);
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
      setGoldWeightGrams(0);
      setPricePerGram(assignment?.defaultPricePerGram ?? 0);
      setLoanType("");
      setTransportCost(0);
      setPayAmount(0);
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

  const computedGoldWeight = Math.max(0, (goldWeightGrams || 0) - appliedGoldDeductionGrams);
  const grossAmount = (computedGoldWeight || 0) * (pricePerGram || 0);
  // Net payout deducts any applied cash amounts; we do not subtract the old transportCost field to avoid double counting
  const netPayout = Math.max(0, grossAmount - appliedCashDeductionAmount);

  // For display purpose: show originals where deductions are applied
  const originalGoldWeight = goldWeightGrams || 0;
  const originalGrossAmount = (originalGoldWeight || 0) * (pricePerGram || 0);
  const grossAfterCashDeduction = Math.max(0, originalGrossAmount - appliedCashDeductionAmount);

  const anyApplied = React.useMemo(() => Object.values(appliedStatus).some((v) => v === 'applied'), [appliedStatus]);

  // Determine if the loan is already fully paid to hide pay controls
  const isLoanPaid = React.useMemo(() => {
    const status = (loanDetailsState?.paymentStatus || '').toString().trim().toUpperCase();
    return status === 'PAID';
  }, [loanDetailsState?.paymentStatus]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // If there is a payment amount and the loan isn't already PAID, process loan payment first
      if (!isLoanPaid && payAmount > 0) {
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
          setPayAmount(0);
        } else {
          console.error(res.error);
        }
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
        // Placeholder: integrate API call here
        // await authClient.createPayout( ...payload )
        console.log("Payout submitted:", payload);
      }
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Payout</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0 }}>
       
            <Box sx={{ bgcolor: 'error.main', color: 'common.white', border: 1, borderColor: 'error.dark', borderRadius: 1, p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Loan Details
                </Typography>

                <Typography variant="body2" sx={{ color: "common.white", mb: 2 }}>
                  Details of the Current Loan
                </Typography>
                
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
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <TextField
                        label="Amount to pay"
                        type="number"
                        size="small"
                        inputProps={{ min: 0, step: 0.01 }}
                        value={payAmount}
                        onChange={(e) => setPayAmount(Number(e.target.value))}
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
         

         
            <Box sx={{ bgcolor: 'error.main', color: 'common.white', border: 1, borderColor: 'error.dark', borderRadius: 1, p: 2 }}>
                <Typography variant="h6" gutterBottom>
                Transport Cost
                </Typography>

                <Typography variant="body2" sx={{ color: "common.white", mb: 2 }}>
                  Transport cost details
                </Typography>
                
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
         
          {/* Assignment Information */}
     
            <Box sx={{ bgcolor: 'success.light', border: 1, borderColor: 'success.main', borderRadius: 1, p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Assignment Information
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                  Details of the current assignment
                </Typography>
                <Box sx={{ display: "grid", rowGap: 1}}>
                  
                  <Box>
                    <Typography variant="caption" color="text.secondary">Shaft Number</Typography>
                    <Typography variant="body2">{assignment?.shaftNumber ?? "-"}</Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" color="text.secondary">Ore Weight</Typography>
                    <Typography variant="body2">{assignment?.oreWeightKg ?? 0} kg</Typography>
                  </Box>
                 
                </Box>
            </Box>
         
         
            <Box sx={{ bgcolor: 'success.dark', color: 'common.white', border: 1, borderColor: 'success.dark', borderRadius: 1, p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Payout Summary
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', mb: 2 }}>
                  Calculated payout breakdown
                </Typography>

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
                  {appliedCashDeductionAmount > 0 && (
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2">Original Gross Amount:</Typography>
                      <Typography variant="body2">${originalGrossAmount.toFixed(2)}</Typography>
                    </Box>
                  )}
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2">Gross Amount{appliedCashDeductionAmount > 0 ? ' (after cash deduction)' : ''}:</Typography>
                    <Typography variant="body2">${(appliedCashDeductionAmount > 0 ? grossAfterCashDeduction : grossAmount).toFixed(2)}</Typography>
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
                  <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                    <Typography variant="subtitle1" fontWeight={700}>Net Payout:</Typography>
                    <Typography variant="subtitle1" fontWeight={700}>${netPayout.toFixed(2)}</Typography>
                  </Box>
                  
                </Box>
            </Box>
    

        

          {/* Payout Details */}
          
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Payout Details
                </Typography>
                <Typography variant="body2" sx={{ color: "common.white", mb: 2 }}>
                  Enter payout information
                </Typography>

                <TextField
                  fullWidth
                  margin="dense"
                  label="Receipt Number"
                  value={generatedReceipt || 'Generating...'}
                  InputProps={{ readOnly: true }}
                />
              
                <TextField
                  fullWidth
                  margin="dense"
                  label="Free Gold Weight (grams)"
                  type="number"
                  inputProps={{ min: 0, step: 0.01 }}
                  value={goldWeightGrams}
                  onChange={(e) => setGoldWeightGrams(Number(e.target.value))}
                />
                <TextField
                  fullWidth
                  margin="dense"
                  label="Gold Selling Price (per gram)"
                  type="number"
                  inputProps={{ min: 0, step: 0.01 }}
                  value={pricePerGram}
                  onChange={(e) => setPricePerGram(Number(e.target.value))}
                />
             
                <TextField
                  fullWidth
                  margin="dense"
                  label="Buyer"
                  type="Text"
                  value={transportCost}
                  onChange={(e) => setTransportCost(Number(e.target.value))}
                />
              </CardContent>
            </Card>
        

          {/* Payout Summary */}
         
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        {!anyApplied ? (
          <Typography variant="caption" sx={{ color: 'text.secondary', mr: 2 }}>
            Apply at least one transport cost to proceed
          </Typography>
        ) : null}
        {anyApplied && (
          <Button onClick={handleSubmit}  
          
          variant="contained" disabled={submitting}>
            {submitting ? "Saving..." : "Save Payout"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default PayoutDialog;
