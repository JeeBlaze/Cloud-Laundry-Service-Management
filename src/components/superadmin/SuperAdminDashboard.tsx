import React, { useState } from 'react';
import {
  Building2,
  ShieldCheck,
  Activity,
  Plus,
  Users,
  Layers,
  CheckCircle2,
  AlertOctagon,
  FileText,
  Search,
} from 'lucide-react';
import { Business, Branch, AuditLog, User } from '../../types';
import { storageService } from '../../services/storageService';
import { formatDateTime } from '../../utils/formatters';

interface SuperAdminDashboardProps {
  businesses: Business[];
  branches: Branch[];
  auditLogs: AuditLog[];
  currentUser: User;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  businesses,
  branches,
  auditLogs,
  currentUser,
}) => {
  const [isAddingBiz, setIsAddingBiz] = useState(false);
  const [bizName, setBizName] = useState('');
  const [bizEmail, setBizEmail] = useState('');
  const [bizPhone, setBizPhone] = useState('');
  const [bizAddress, setBizAddress] = useState('');
  const [bizPlan, setBizPlan] = useState<Business['plan']>('pro');
  const [bizTaxRate, setBizTaxRate] = useState(8.0);

  const handleCreateBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bizName.trim()) return;

    const newBiz: Business = {
      id: `biz_${Date.now()}`,
      name: bizName.trim(),
      slug: bizName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      phone: bizPhone.trim() || '+1 (555) 000-0000',
      email: bizEmail.trim() || 'info@laundry.com',
      address: bizAddress.trim() || 'Main St.',
      currency: '$',
      taxRatePercent: bizTaxRate,
      plan: bizPlan,
      status: 'active',
      openingHours: '08:00 AM - 08:00 PM (Mon - Sat)',
      createdAt: new Date().toISOString(),
    };

    storageService.updateBusiness(newBiz);
    setIsAddingBiz(false);
    setBizName('');
  };

  const handleToggleStatus = (biz: Business) => {
    const nextStatus = biz.status === 'active' ? 'suspended' : 'active';
    storageService.updateBusiness({
      ...biz,
      status: nextStatus,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-slate-700" />
            <span>Platform Governance</span>
            <span>·</span>
            <span>Super Administrator Mode</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
            Cloud Laundry Multi-Tenant Platform Controller
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Global business provisioning, subscription enforcement, and immutable audit logs
          </p>
        </div>

        <button
          onClick={() => setIsAddingBiz(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-black hover:bg-slate-800 rounded-md transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Provision New Laundry Tenant</span>
        </button>
      </div>

      {/* Platform Level Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Laundry Tenants
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900">{businesses.length}</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">100% Operational Health</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Active Processing Hubs
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900">{branches.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Across 2 metropolitan zones</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Platform SaaS Subscriptions
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900">$2,450 /mo</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">ARR Run-rate: $29.4K</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Security & Audit Events
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900">{auditLogs.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Chain of custody intact</div>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Provisioned Laundry Businesses</h2>
          <p className="text-xs text-slate-500">Multi-tenant client accounts and enterprise subscription tiers</p>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase bg-slate-50">
                <th className="p-4 font-semibold">Business Name</th>
                <th className="p-4 font-semibold">Contact & Address</th>
                <th className="p-4 font-semibold">SaaS Plan</th>
                <th className="p-4 font-semibold">Tax Setup</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {businesses.map((biz) => (
                <tr key={biz.id} className="hover:bg-slate-50/60">
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{biz.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">ID: {biz.id}</div>
                  </td>
                  <td className="p-4 text-slate-600">
                    <div>{biz.email}</div>
                    <div className="text-[11px] text-slate-400">{biz.address}</div>
                  </td>
                  <td className="p-4">
                    <span className="font-mono uppercase font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {biz.plan}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-medium">{biz.taxRatePercent}% regional</td>
                  <td className="p-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        biz.status === 'active'
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'bg-red-50 text-red-800'
                      }`}
                    >
                      {biz.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(biz)}
                      className={`px-3 py-1 rounded text-[11px] font-medium transition-colors ${
                        biz.status === 'active'
                          ? 'border border-red-200 text-red-700 hover:bg-red-50'
                          : 'border border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      {biz.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Platform Audit Trail */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Immutable Platform Audit Trail</h2>
          <p className="text-xs text-slate-500">
            Real-time ledger of quote adjustments, weight changes, order creations, and payments
          </p>
        </div>

        <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto text-xs">
          {auditLogs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-slate-50 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900 text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">
                    {log.action}
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="font-medium text-slate-800">{log.actorName}</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500 capitalize">{log.actorRole.replace('_', ' ')}</span>
                </div>
                <div className="text-slate-600 mt-1">{log.details}</div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] text-slate-400 font-mono">
                  {formatDateTime(log.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Tenant Modal */}
      {isAddingBiz && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateBusiness}
            className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 text-slate-900 text-xs space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Provision New Laundry Tenant</h3>
              <button
                type="button"
                onClick={() => setIsAddingBiz(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Business Name</label>
              <input
                type="text"
                placeholder="e.g. Apex Linen & Uniform Services"
                value={bizName}
                onChange={(e) => setBizName(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Official Email</label>
                <input
                  type="email"
                  placeholder="admin@apexlinen.com"
                  value={bizEmail}
                  onChange={(e) => setBizEmail(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Phone</label>
                <input
                  type="text"
                  placeholder="+1 (555) 390-1284"
                  value={bizPhone}
                  onChange={(e) => setBizPhone(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Platform SaaS Plan</label>
                <select
                  value={bizPlan}
                  onChange={(e) => setBizPlan(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded"
                >
                  <option value="starter">Starter ($49/mo)</option>
                  <option value="pro">Pro ($149/mo)</option>
                  <option value="enterprise">Enterprise ($399/mo)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Regional Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={bizTaxRate}
                  onChange={(e) => setBizTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Headquarters Address</label>
              <input
                type="text"
                placeholder="e.g. 500 Industrial Pkwy, Chicago, IL"
                value={bizAddress}
                onChange={(e) => setBizAddress(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddingBiz(false)}
                className="px-4 py-2 border border-slate-200 rounded text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white rounded font-medium hover:bg-slate-800"
              >
                Provision Business
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
