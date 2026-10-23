import React, { useState } from 'react';
import { Users, Plus, Star, Phone, Mail, Building, Clock, Check } from 'lucide-react';
import { StaffMember, Branch, Business, User } from '../../types';
import { storageService } from '../../services/storageService';
import { formatRoleLabel } from '../../utils/formatters';

interface StaffManagerProps {
  business: Business;
  branches: Branch[];
  staff: StaffMember[];
  currentUser: User;
}

export const StaffManager: React.FC<StaffManagerProps> = ({
  business,
  branches,
  staff,
  currentUser,
}) => {
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<StaffMember['role']>('laundry_staff');
  const [branchId, setBranchId] = useState(branches[0]?.id || 'branch_downtown');
  const [shift, setShift] = useState<StaffMember['shift']>('morning');

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const targetBranch = branches.find((b) => b.id === branchId) || branches[0];

    storageService.addStaff({
      businessId: business.id,
      branchId: targetBranch.id,
      branchName: targetBranch.name,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || '+1 (555) 000-1122',
      role,
      shift,
      status: 'active',
    });

    setIsAddingStaff(false);
    setName('');
    setEmail('');
    setPhone('');
  };

  const handleShiftChange = (staffMember: StaffMember, nextShift: StaffMember['shift']) => {
    storageService.updateStaff({
      ...staffMember,
      shift: nextShift,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Staff Rosters & Team Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Branch managers, wash plant operators, fleet delivery couriers, and shift allocation
          </p>
        </div>

        <button
          onClick={() => setIsAddingStaff(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-black hover:bg-slate-800 rounded-md transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Onboard New Team Member</span>
        </button>
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map((member) => (
          <div
            key={member.id}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{member.name}</h3>
                  <div className="text-[11px] font-medium text-slate-500 mt-0.5">
                    {formatRoleLabel(member.role)}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-slate-800">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  <span>{member.performanceScore.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-4 text-xs text-slate-600 space-y-1.5">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{member.branchName}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{member.email}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{member.phone}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="text-slate-500">
                Active Queue: <strong className="text-slate-900 font-mono">{member.activeOrdersAssigned}</strong>
              </div>

              <select
                value={member.shift}
                onChange={(e) => handleShiftChange(member, e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 capitalize font-medium"
              >
                <option value="morning">Morning Shift</option>
                <option value="evening">Evening Shift</option>
                <option value="night">Night Shift</option>
                <option value="full_day">Full Day</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* Onboard Staff Modal */}
      {isAddingStaff && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateStaff}
            className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-slate-900 text-xs space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Onboard New Staff Member</h3>
              <button
                type="button"
                onClick={() => setIsAddingStaff(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Liam Gallagher"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="liam@purewash.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Phone</label>
                <input
                  type="text"
                  placeholder="+1 (555) 392-8840"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded"
                >
                  <option value="laundry_staff">Laundry Plant Staff</option>
                  <option value="delivery_partner">Fleet Delivery Partner</option>
                  <option value="branch_manager">Branch Manager</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Assigned Hub / Branch</label>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Shift Schedule</label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value as any)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded"
              >
                <option value="morning">Morning Shift (07:00 AM - 03:00 PM)</option>
                <option value="evening">Evening Shift (02:00 PM - 10:00 PM)</option>
                <option value="night">Night Batch (10:00 PM - 06:00 AM)</option>
                <option value="full_day">Full Day Flex</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddingStaff(false)}
                className="px-4 py-2 border border-slate-200 rounded text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white rounded font-medium hover:bg-slate-800"
              >
                Send Invite & Onboard
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
