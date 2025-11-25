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
import { FactoryIcon } from '@phosphor-icons/react/dist/ssr/Factory';
import { LockKeyIcon } from '@phosphor-icons/react/dist/ssr/LockKey';
import { KeyIcon } from '@phosphor-icons/react/dist/ssr/Key';
import { UserPlusIcon } from '@phosphor-icons/react/dist/ssr/UserPlus';
import { ChartBarIcon } from '@phosphor-icons/react/dist/ssr/ChartBar';
import { WalletIcon } from '@phosphor-icons/react/dist/ssr/Wallet';
import { MapTrifoldIcon } from '@phosphor-icons/react/dist/ssr/MapTrifold';
import { HandCoinsIcon } from '@phosphor-icons/react/dist/ssr/HandCoins';
import { RoadHorizonIcon } from '@phosphor-icons/react/dist/ssr/RoadHorizon';
import { HandshakeIcon } from '@phosphor-icons/react/dist/ssr/Handshake';
import { BriefcaseIcon } from '@phosphor-icons/react/dist/ssr/Briefcase';
import { ArrowsLeftRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowsLeftRight';
import { UserSwitchIcon } from '@phosphor-icons/react/dist/ssr/UserSwitch';
import { PlusCircleIcon } from '@phosphor-icons/react/dist/ssr/PlusCircle';

import { PercentIcon } from '@phosphor-icons/react/dist/ssr/Percent';
import { CurrencyDollarIcon } from '@phosphor-icons/react/dist/ssr/CurrencyDollar';
import { SealWarningIcon } from '@phosphor-icons/react/dist/ssr/SealWarning';
import { CreditCardIcon } from '@phosphor-icons/react/dist/ssr/CreditCard';
import { PackageIcon } from '@phosphor-icons/react/dist/ssr/Package';

import { ChartLineIcon } from '@phosphor-icons/react/dist/ssr/ChartLine';
import { FileTextIcon } from '@phosphor-icons/react/dist/ssr/FileText';

import { ClipboardTextIcon } from '@phosphor-icons/react/dist/ssr/ClipboardText';
import { GraduationCapIcon } from '@phosphor-icons/react/dist/ssr/GraduationCap';


export const navIcons = {
  'percent': PercentIcon,
  'currency-dollar': CurrencyDollarIcon,
  'seal-warning': SealWarningIcon,
  'credit-card': CreditCardIcon,
  'package': PackageIcon,

'chart-line': ChartLineIcon,
'file-text': FileTextIcon,
'map-trifold': MapTrifoldIcon,


  'clipboard-text': ClipboardTextIcon,
  'graduation-cap': GraduationCapIcon,
  'mountains': MountainsIcon,
  'shield-check': ShieldCheckIcon,

  'chart-pie': ChartPieIcon,
  'gear-six': GearSixIcon,
  'plus-circle': PlusCircleIcon,
  'user-plus': UserPlusIcon,
  'user-switch': UserSwitchIcon,
  'arrows-left-right': ArrowsLeftRightIcon,
  'handshake': HandshakeIcon,
  'briefcase': BriefcaseIcon,
  'road-horizon': RoadHorizonIcon,
  'plugs-connected': PlugsConnectedIcon,
  'chart-bar': ChartBarIcon,

  
  'x-square': XSquare,
  'shield': ShieldCheckIcon,
  'factory': FactoryIcon,
  'hand-coins': HandCoinsIcon,
   'wallet': WalletIcon,
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
