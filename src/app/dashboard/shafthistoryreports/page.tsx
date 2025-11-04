import * as React from 'react';
import type { Metadata } from 'next';
import { config } from '@/config';
import { ShaftHistoryReportsView } from '@/components/dashboard/shafthistoryreports/shaft-history-reports-view';

export const metadata = { title: `Shaft History Reports | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return <ShaftHistoryReportsView />;
}
