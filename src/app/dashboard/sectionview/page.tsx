import type { Metadata } from 'next';
import SectionViewComponent from '@/components/dashboard/sectionview/section-view-component';

export const metadata = {
  title: 'Section View | Dashboard',
  description: 'View section boundaries and shaft locations on an interactive map'
} satisfies Metadata;

export default function SectionViewPage() {
  return <SectionViewComponent />;
}
