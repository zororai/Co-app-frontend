import * as React from 'react';
import type { Metadata } from 'next';

import { ShaftTransferPage } from '@/components/dashboard/shafttransfare/shaft-transfer-page';

export const metadata: Metadata = {
  title: 'Shaft Transfer | Dashboard',
};

export default function Page(): React.JSX.Element {
  return <ShaftTransferPage />;
}