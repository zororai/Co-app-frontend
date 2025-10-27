'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import { DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import type { Integration } from './integrations-card';

interface ExportButtonProps {
  integrations: Integration[];
}

export function ExportButton({ integrations }: ExportButtonProps): React.JSX.Element {
  const handleExport = () => {
    const tab = 'APPROVED';
    const a = document.createElement('a');
    a.href = `data:text/csv;charset=utf-8,${encodeURIComponent(
      integrations
        .filter((c) => c.title === tab)
        .map((c) => Object.values(c).join(','))
        .join('\n')
    )}`;
    a.download = `integrations-${tab.toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <Button
      color="inherit"
      startIcon={<DownloadIcon fontSize="var(--icon-fontSize-md)" />}
      onClick={handleExport}
    >
      Export
    </Button>
  );
}
