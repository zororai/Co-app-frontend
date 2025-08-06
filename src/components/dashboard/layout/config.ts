import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';
import { iconMap } from './icon-map';

export const navItems = [
  { key: 'dashboard', title: 'Dashboard', href: paths.dashboard.overview, icon: 'chart-pie' },
  { key: 'admin', title: 'Admin', href: '/admin', icon: 'shield' },
  { key: 'user-admin-onboarding', title: 'User Onboarding', href: '/onboarding', icon: 'users' },
  { key: 'miner-registration', title: 'Miner Registration', href: paths.dashboard.customers, icon: 'id-card' },
  {
    key: 'site-management',
    title: 'Shaft Management',
    icon: 'buildings',
    items: [
      { key: 'site-list', title: 'Shaft Assignment', href:  paths.dashboard.shaftreg, icon: 'id-card'},
      { key: 'site-add', title: 'Create Section', href:  paths.dashboard.sectioncreation, icon: 'id-card'},
    ],
  },
  {
    key: 'ore-management',
    title: 'Ore Management',
    icon: 'mountain',
    items: [
      { key: 'ore-list', title: 'Ore List', href: '/ore-management/list' },
      { key: 'ore-add', title: 'Add Ore', href: '/ore-management/add' },
    ],
  },
  {
    key: 'shaft-management',
    title: 'Shaft Management',
    icon: 'tools',
    items: [
      { key: 'shaft-list', title: 'Shaft List', href: '/shaft-management/list' },
      { key: 'shaft-add', title: 'Add Shaft', href: '/shaft-management/add' },
    ],
  },
  {
    key: 'transport-management',
    title: 'Transport Management',
    icon: 'truck',
    items: [
      { key: 'transport-list', title: 'Transport List', href: '/transport-management/list' },
      { key: 'transport-add', title: 'Add Transport', href: '/transport-management/add' },
    ],
  },
  {
    key: 'security',
    title: 'Security',
    icon: 'lock',
    items: [
      { key: 'security-users', title: 'Users', href: '/security/users' },
      { key: 'security-roles', title: 'Roles', href: '/security/roles' },
    ],
  },
  {
    key: 'permission',
    title: 'Permission Management',
    icon: 'key',
    items: [
      { key: 'permission-list', title: 'Miner Registration status', href: paths.dashboard.Syndicate, icon: 'id-card' },
    {
      key: 'role-group',
      title: 'Roles',
      icon: 'id-card',
      items: [
          { key: 'role-list', title: 'Role List', href: '/permission/roles/list' },
          { key: 'role-add', title: 'Add Role', href: '/permission/roles/add' },
        ]
      }
    ],
  },
] satisfies NavItemConfig[];
