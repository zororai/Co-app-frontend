import type { Icon } from '@phosphor-icons/react/dist/lib/types';
import { ChartPieIcon } from '@phosphor-icons/react/dist/ssr/ChartPie';
import { GearSixIcon } from '@phosphor-icons/react/dist/ssr/GearSix';
import { PlugsConnectedIcon } from '@phosphor-icons/react/dist/ssr/PlugsConnected';
import { UserIcon } from '@phosphor-icons/react/dist/ssr/User';
import { UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import { XSquare } from '@phosphor-icons/react/dist/ssr/XSquare';
import { ShieldCheckIcon } from '@phosphor-icons/react/dist/ssr/ShieldCheck';
import { IdentificationCardIcon } from '@phosphor-icons/react/dist/ssr/IdentificationCard';
import { BuildingsIcon } from '@phosphor-icons/react/dist/ssr/Buildings';
import { MountainsIcon } from '@phosphor-icons/react/dist/ssr/Mountains';
import { WrenchIcon } from '@phosphor-icons/react/dist/ssr/Wrench';
import { TruckIcon } from '@phosphor-icons/react/dist/ssr/Truck';
import { LockKeyIcon } from '@phosphor-icons/react/dist/ssr/LockKey';
import { KeyIcon } from '@phosphor-icons/react/dist/ssr/Key';


export const navIcons = {
  'chart-pie': ChartPieIcon,
  'gear-six': GearSixIcon,
  'plugs-connected': PlugsConnectedIcon,
  'x-square': XSquare,
    'shield': ShieldCheckIcon,
  'id-card': IdentificationCardIcon,
  'buildings': BuildingsIcon,
  'mountain': MountainsIcon,
  'tools': WrenchIcon,
  'truck': TruckIcon,
  'lock': LockKeyIcon,
  'key': KeyIcon,
  'user': UserIcon,
  'users': UsersIcon
} as Record<string, Icon>;
