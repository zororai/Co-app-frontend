import * as React from 'react';
import type { Metadata } from 'next';
import { config } from '@/config';
import { SectionReportsView } from '@/components/dashboard/section_reports/section-reports-view';

export const metadata: Metadata = {
  title: `Section Reports | Dashboard | ${config.site.name}`,
};

export default function Page(): React.JSX.Element {
  return <SectionReportsView />;
}
