/**
 * Approval Dialog Components
 * Reusable styled components for record approval workflows
 * Based on styling-guide.md standards
 */

'use client';

import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  IconButton,
  Typography,
  Chip,
  Divider,
  Alert,
  Stack,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
  CheckCircle as CheckCircleOutlineIcon,
  XCircle,
  ArrowClockwise,
} from '@phosphor-icons/react/dist/ssr';

// ============================================================================
// HEADER STYLES
// ============================================================================

interface ApprovalDialogHeaderProps {
  title: string;
  onClose: () => void;
  subtitle?: string;
}

export function ApprovalDialogHeader({
  title,
  onClose,
  subtitle,
}: ApprovalDialogHeaderProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <DialogTitle
      sx={{
        backgroundColor: theme.palette.secondary.main,
        color: 'white',
        fontWeight: 600,
        fontSize: '1.25rem',
        py: 2.5,
        px: 3,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Typography
          sx={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: 'white',
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              display: 'block',
              mt: 0.5,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
      <IconButton
        edge="end"
        color="inherit"
        onClick={onClose}
        size="small"
        sx={{
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <CloseIcon />
      </IconButton>
    </DialogTitle>
  );
}

// ============================================================================
// CONTENT WRAPPER
// ============================================================================

interface ApprovalDialogContentProps {
  children: React.ReactNode;
}

export function ApprovalDialogContent({
  children,
}: ApprovalDialogContentProps): React.JSX.Element {
  return (
    <DialogContent
      sx={{
        py: 3,
        px: 3,
      }}
    >
      {children}
    </DialogContent>
  );
}

// ============================================================================
// SECTION COMPONENT
// ============================================================================

interface SectionProps {
  title?: string;
  children: React.ReactNode;
  sx?: any;
}

export function Section({ title, children, sx }: SectionProps): React.JSX.Element {
  return (
    <Box
      sx={{
        mb: 2,
        ...sx,
      }}
    >
      {title && (
        <>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              color: 'text.secondary',
              mb: 1.5,
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              letterSpacing: '0.5px',
            }}
          >
            {title}
          </Typography>
        </>
      )}
      <Box sx={{ pl: title ? 0 : 0 }}>{children}</Box>
      {title && (
        <Divider sx={{ mt: 2, mb: 0, borderColor: '#e0e0e0' }} />
      )}
    </Box>
  );
}

// ============================================================================
// DETAIL ITEM COMPONENT
// ============================================================================

interface DetailItemProps {
  label: string;
  value: React.ReactNode;
  sx?: any;
}

export function DetailItem({
  label,
  value,
  sx,
}: DetailItemProps): React.JSX.Element {
  return (
    <Box sx={{ mb: 1.5, ...sx }}>
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 600,
          color: '#666',
          mb: 0.5,
          fontSize: '0.875rem',
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: 'text.primary',
          fontSize: '0.95rem',
        }}
      >
        {value || '—'}
      </Typography>
    </Box>
  );
}

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================

interface StatusBadgeProps {
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PUSHED_BACK';
  sx?: any;
}

export function StatusBadge({ status, sx }: StatusBadgeProps): React.JSX.Element {
  const statusConfig = {
    PENDING: {
      backgroundColor: '#fff3e0',
      color: '#e65100',
      label: 'Pending',
      icon: ArrowClockwise,
    },
    APPROVED: {
      backgroundColor: '#e8f5e9',
      color: '#2e7d32',
      label: 'Approved',
      icon: CheckCircleOutlineIcon,
    },
    REJECTED: {
      backgroundColor: '#ffebee',
      color: '#c62828',
      label: 'Rejected',
      icon: XCircle,
    },
    PUSHED_BACK: {
      backgroundColor: '#f3e5f5',
      color: '#6a1b9a',
      label: 'Pushed Back',
      icon: ArrowClockwise,
    },
  };

  const config = statusConfig[status];

  return (
    <Chip
      icon={<config.icon weight="fill" />}
      label={config.label}
      sx={{
        backgroundColor: config.backgroundColor,
        color: config.color,
        fontWeight: 600,
        fontSize: '0.875rem',
        border: `1px solid ${config.color}`,
        ...sx,
      }}
    />
  );
}

// ============================================================================
// ACTION BUTTONS COMPONENT
// ============================================================================

interface ApprovalActionButtonsProps {
  onApprove?: () => void;
  onReject?: () => void;
  onPushBack?: () => void;
  onClose: () => void;
  loading?: boolean;
  disabled?: boolean;
  showAll?: boolean; // If false, only shows Close button
}

export function ApprovalActionButtons({
  onApprove,
  onReject,
  onPushBack,
  onClose,
  loading = false,
  disabled = false,
  showAll = true,
}: ApprovalActionButtonsProps): React.JSX.Element {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 1,
        p: 2,
        borderTop: '1px solid #e0e0e0',
        backgroundColor: '#f5f5f5',
      }}
    >
      {showAll && (
        <>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              minWidth: 120,
              textTransform: 'capitalize',
            }}
            disabled={loading || disabled}
          >
            Close
          </Button>
          {onReject && (
            <Button
              variant="contained"
              color="error"
              onClick={onReject}
              sx={{
                minWidth: 120,
                textTransform: 'capitalize',
              }}
              disabled={loading || disabled}
            >
              Reject
            </Button>
          )}
          {onPushBack && (
            <Button
              variant="contained"
              color="warning"
              onClick={onPushBack}
              sx={{
                minWidth: 120,
                textTransform: 'capitalize',
              }}
              disabled={loading || disabled}
            >
              Push Back
            </Button>
          )}
          {onApprove && (
            <Button
              variant="contained"
              color="success"
              onClick={onApprove}
              sx={{
                minWidth: 120,
                textTransform: 'capitalize',
              }}
              disabled={loading || disabled}
            >
              Approve
            </Button>
          )}
        </>
      )}
      {!showAll && (
        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            minWidth: 120,
            textTransform: 'capitalize',
          }}
          disabled={loading || disabled}
        >
          Close
        </Button>
      )}
    </Box>
  );
}

// ============================================================================
// SUCCESS STATE COMPONENT
// ============================================================================

interface SuccessStateProps {
  title: string;
  message: string;
  details?: Record<string, string>;
}

export function SuccessState({
  title,
  message,
  details,
}: SuccessStateProps): React.JSX.Element {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 4,
        px: 3,
      }}
    >
      <CheckCircleIcon
        sx={{
          fontSize: 60,
          color: 'success.main',
          mb: 2,
        }}
      />
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          mb: 1,
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          mb: 2,
        }}
      >
        {message}
      </Typography>
      {details && (
        <Box
          sx={{
            mt: 3,
            p: 2,
            backgroundColor: '#f5f5f5',
            borderRadius: 1,
            textAlign: 'left',
          }}
        >
          {Object.entries(details).map(([key, value]) => (
            <Box key={key} sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {key}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {value}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

// ============================================================================
// COMPLETE APPROVAL DIALOG COMPONENT
// ============================================================================

interface CompleteApprovalDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onApprove?: () => Promise<void>;
  onReject?: () => Promise<void>;
  onPushBack?: () => Promise<void>;
  showActions?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function CompleteApprovalDialog({
  open,
  onClose,
  title,
  children,
  onApprove,
  onReject,
  onPushBack,
  showActions = true,
  maxWidth = 'md',
}: CompleteApprovalDialogProps): React.JSX.Element {
  const [loading, setLoading] = React.useState(false);
  const theme = useTheme();

  const handleApprove = React.useCallback(async () => {
    if (!onApprove) return;
    setLoading(true);
    try {
      await onApprove();
    } finally {
      setLoading(false);
    }
  }, [onApprove]);

  const handleReject = React.useCallback(async () => {
    if (!onReject) return;
    setLoading(true);
    try {
      await onReject();
    } finally {
      setLoading(false);
    }
  }, [onReject]);

  const handlePushBack = React.useCallback(async () => {
    if (!onPushBack) return;
    setLoading(true);
    try {
      await onPushBack();
    } finally {
      setLoading(false);
    }
  }, [onPushBack]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0px 12px 24px rgba(0, 0, 0, 0.15)',
        },
      }}
    >
      <ApprovalDialogHeader title={title} onClose={onClose} />
      <ApprovalDialogContent>{children}</ApprovalDialogContent>
      {showActions && (
        <ApprovalActionButtons
          onApprove={onApprove ? handleApprove : undefined}
          onReject={onReject ? handleReject : undefined}
          onPushBack={onPushBack ? handlePushBack : undefined}
          onClose={onClose}
          loading={loading}
          showAll={true}
        />
      )}
    </Dialog>
  );
}

// ============================================================================
// EXPORT ALL COMPONENTS
// ============================================================================

export type {
  ApprovalDialogHeaderProps,
  ApprovalDialogContentProps,
  SectionProps,
  DetailItemProps,
  StatusBadgeProps,
  ApprovalActionButtonsProps,
  SuccessStateProps,
  CompleteApprovalDialogProps,
};
