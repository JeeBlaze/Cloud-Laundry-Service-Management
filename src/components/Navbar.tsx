import React, { useState } from 'react';
import {
  Layers,
  Search,
  Bell,
  Database,
  Building2,
  User as UserIcon,
  ChevronDown,
  LogOut,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { User, UserRole, Branch } from '../types';
import { storageService } from '../services/storageService';
import { formatRoleLabel } from '../utils/formatters';

interface NavbarProps {
  currentUser: User;
  branches: Branch[];
  selectedBranchId: string;
  onSelectBranch: (branchId: string) => void;
  onOpenCloudDrawer: () => void;
  onSearchClick: () => void;
  unreadCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  branches,
  selectedBranchId,
  onSelectBranch,
  onOpenCloudDrawer,
  onSearchClick,
  unreadCount = 2,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showBranchMenu, setShowBranchMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const roles: { role: UserRole; name: string; email: string }[] = [
    { role: 'customer', name: 'Emily Watson (Customer)', email: 'emily.watson@example.com' },
    { role: 'laundry_staff', name: 'Elena Rostova (Laundry Staff)', email: 'elena.staff@purewash.com' },
    { role: 'delivery_partner', name: 'David Torres (Delivery Partner)', email: 'david.driver@purewash.com' },
    { role: 'branch_manager', name: 'Marcus Vance (Branch Manager)', email: 'marcus.manager@purewash.com' },
    { role: 'business_owner', name: 'Sarah Jenkins (Business Owner)', email: 'sarah.owner@purewash.com' },
    { role: 'super_admin', name: 'Alex Reynolds (Super Admin)', email: 'alex.platform@cloudlaundry.io' },
  ];

  const handleRoleSelect = (role: UserRole) => {
    storageService.switchRole(role);
    setShowRoleMenu(false);
  };

  const selectedBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Identity */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-black text-white flex items-center justify-center font-semibold text-lg shadow-sm">
                CL
              </div>
              <div>
                <span className="font-semibold text-base tracking-tight text-slate-900 block leading-tight">
                  Cloud Laundry
                </span>
                <span className="text-[11px] text-slate-500 font-medium tracking-wide uppercase">
                  Enterprise Platform
                </span>
              </div>
            </div>

            {/* Branch Selector (Visible to Staff, Managers, Owners) */}
            {currentUser.role !== 'customer' && currentUser.role !== 'super_admin' && (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setShowBranchMenu(!showBranchMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors"
                >
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span className="max-w-[160px] truncate">{selectedBranch?.name || 'All Branches'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showBranchMenu && (
                  <div className="absolute left-0 mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50">
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Select Active Hub
                    </div>
                    {branches.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => {
                          onSelectBranch(b.id);
                          setShowBranchMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                          selectedBranchId === b.id ? 'font-medium text-slate-900 bg-slate-50' : 'text-slate-600'
                        }`}
                      >
                        <div className="truncate">
                          <div>{b.name}</div>
                          <div className="text-[10px] text-slate-400">{b.code} · Capacity: {b.capacityPerDayKg}kg/day</div>
                        </div>
                        {selectedBranchId === b.id && <Check className="w-3.5 h-3.5 text-slate-900 shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Center Search Bar Trigger */}
          <div className="flex-1 max-w-md mx-4 hidden sm:block">
            <button
              onClick={onSearchClick}
              className="w-full flex items-center justify-between px-3.5 py-1.5 text-xs text-slate-400 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors"
            >
              <span className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span>Search orders, customers, items...</span>
              </span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right Controls: Cloud Status, Notifications, Role Switcher */}
          <div className="flex items-center gap-2.5">
            {/* Cloud Architecture status button */}
            <button
              onClick={onOpenCloudDrawer}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
              title="Cloud Architecture & Adapter Configuration"
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden lg:inline text-slate-600">Cloud Adapter</span>
            </button>

            {/* Notification button */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors relative"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-slate-900 rounded-full" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900">Notifications</span>
                    <span className="text-[11px] text-slate-400">2 unread</span>
                  </div>
                  <div className="divide-y divide-slate-100 text-xs">
                    <div className="p-3 hover:bg-slate-50 cursor-pointer">
                      <div className="font-medium text-slate-900">Quote Adjustment Required</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        Order #CL-2026-1049 weighed 6.2kg (+2.2kg). Waiting for customer approval.
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">15 mins ago</div>
                    </div>
                    <div className="p-3 hover:bg-slate-50 cursor-pointer">
                      <div className="font-medium text-slate-900">Low Stock Alert: Detergent</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        Ecolab Pro Liquid at Downtown Hub is down to 14L (threshold: 20L).
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">1 hour ago</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
              >
                <img
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={currentUser.fullName}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-medium text-slate-900 leading-none truncate max-w-[120px]">
                    {currentUser.fullName}
                  </div>
                  <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                    {formatRoleLabel(currentUser.role)}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-lg shadow-xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <div className="text-xs font-semibold text-slate-900">{currentUser.fullName}</div>
                    <div className="text-[11px] text-slate-500">{currentUser.email}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Role: {formatRoleLabel(currentUser.role)}
                    </div>
                  </div>

                  <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Switch Test Persona
                  </div>

                  {roles.map((item) => (
                    <button
                      key={item.role}
                      onClick={() => handleRoleSelect(item.role)}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                        currentUser.role === item.role ? 'bg-slate-50 font-medium text-slate-900' : 'text-slate-600'
                      }`}
                    >
                      <div>
                        <div>{item.name}</div>
                        <div className="text-[10px] text-slate-400">{item.email}</div>
                      </div>
                      {currentUser.role === item.role && (
                        <Check className="w-3.5 h-3.5 text-slate-900 shrink-0" />
                      )}
                    </button>
                  ))}

                  <div className="border-t border-slate-100 mt-2 pt-1 px-2">
                    <button
                      onClick={() => {
                        storageService.resetToDefaults();
                        setShowRoleMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Reset to Default Seed Data
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
