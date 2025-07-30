import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';
import DashboardIcon from '@mui/icons-material/PieChart';
import AdminPanelSettingsIcon from '@mui/icons-material/Security';
import GroupIcon from '@mui/icons-material/Group';
import IdCardIcon from '@mui/icons-material/ContactPage';
import BuildingsIcon from '@mui/icons-material/Business';
import MountainIcon from '@mui/icons-material/Landscape';
import ToolsIcon from '@mui/icons-material/Build';
import TruckIcon from '@mui/icons-material/LocalShipping';
import LockIcon from '@mui/icons-material/Lock';
import KeyIcon from '@mui/icons-material/VpnKey';

export const navItems = [
  { key: 'dashboard', title: 'Dashboard', href: paths.dashboard.overview, icon: DashboardIcon },
  { key: 'admin', title: 'Admin', href: '/admin', icon: AdminPanelSettingsIcon },
  { key: 'user-admin-onboarding', title: 'User Onboarding', href: '/onboarding', icon: GroupIcon },
  { key: 'miner-registration', title: 'Miner Registration', href: paths.dashboard.customers, icon: IdCardIcon },
  {
    key: 'site-management',
    title: 'Site Management',
    icon: BuildingsIcon,
    items: [
      { key: 'site-list', title: 'Site List', href: '/site-management/list' },
      { key: 'site-add', title: 'Add Site', href: '/site-management/add' },
    ],
  },
  {
    key: 'ore-management',
    title: 'Ore Management',
    icon: MountainIcon,
    items: [
      { key: 'ore-list', title: 'Ore List', href: '/ore-management/list' },
      { key: 'ore-add', title: 'Add Ore', href: '/ore-management/add' },
    ],
  },
  {
    key: 'shaft-management',
    title: 'Shaft Management',
    icon: ToolsIcon,
    items: [
      { key: 'shaft-list', title: 'Shaft List', href: '/shaft-management/list' },
      { key: 'shaft-add', title: 'Add Shaft', href: '/shaft-management/add' },
    ],
  },
  {
    key: 'transport-management',
    title: 'Transport Management',
    icon: TruckIcon,
    items: [
      { key: 'transport-list', title: 'Transport List', href: '/transport-management/list' },
      { key: 'transport-add', title: 'Add Transport', href: '/transport-management/add' },
    ],
  },
  {
    key: 'security',
    title: 'Security',
    icon: LockIcon,
    items: [
      { key: 'security-users', title: 'Users', href: '/security/users' },
      { key: 'security-roles', title: 'Roles', href: '/security/roles' },
    ],
  },
  {
    key: 'permission',
    title: 'Permission',
    icon: KeyIcon,
    items: [
      { key: 'permission-list', title: 'Permission List', href: '/permission/list' },
      { key: 'permission-add', title: 'Add Permission', href: '/permission/add' },
    ],
  },
] satisfies NavItemConfig[];
