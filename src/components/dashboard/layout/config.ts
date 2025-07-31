import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';
import { iconMap } from './icon-map';

export const navItems = [
  { key: 'dashboard', title: 'Dashboard', href: paths.dashboard.overview, icon: iconMap['chart-pie'] },
  { key: 'admin', title: 'Admin', href: '/admin', icon: iconMap['shield'] },
  { key: 'user-admin-onboarding', title: 'User Onboarding', href: '/onboarding', icon: iconMap['users'] },
  { key: 'miner-registration', title: 'Miner Registration', href: paths.dashboard.customers, icon: iconMap['id-card'] },
  {
    key: 'site-management',
    title: 'Site Management',
    icon: iconMap['buildings'],
    items: [
      { key: 'site-list', title: 'Site List', href: '/site-management/list' },
      { key: 'site-add', title: 'Add Site', href: '/site-management/add' },
    ],
  },
  {
    key: 'ore-management',
    title: 'Ore Management',
    icon: iconMap['mountain'],
    items: [
      { key: 'ore-list', title: 'Ore List', href: '/ore-management/list' },
      { key: 'ore-add', title: 'Add Ore', href: '/ore-management/add' },
    ],
  },
  {
    key: 'shaft-management',
    title: 'Shaft Management',
    icon: iconMap['tools'],
    items: [
      { key: 'shaft-list', title: 'Shaft List', href: '/shaft-management/list' },
      { key: 'shaft-add', title: 'Add Shaft', href: '/shaft-management/add' },
    ],
  },
  {
    key: 'transport-management',
    title: 'Transport Management',
    icon: iconMap['truck'],
    items: [
      { key: 'transport-list', title: 'Transport List', href: '/transport-management/list' },
      { key: 'transport-add', title: 'Add Transport', href: '/transport-management/add' },
    ],
  },
  {
    key: 'security',
    title: 'Security',
    icon: iconMap['lock'],
    items: [
      { key: 'security-users', title: 'Users', href: '/security/users' },
      { key: 'security-roles', title: 'Roles', href: '/security/roles' },
    ],
  },
  {
    key: 'permission',
    title: 'Permission',
    icon: iconMap['key'],
    items: [
      { key: 'permission-list', title: 'Permission List', href: '/permission/list' },
      { key: 'permission-add', title: 'Add Permission', href: '/permission/add' },
    ],
  },
] satisfies NavItemConfig[];
