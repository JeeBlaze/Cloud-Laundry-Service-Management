import React, { useState } from 'react';
import { Tag, Plus, Edit2, Percent, Check, Sparkles } from 'lucide-react';
import { ServiceItem, Business, Coupon, User } from '../../types';
import { storageService } from '../../services/storageService';
import { formatCurrency } from '../../utils/formatters';

interface PricingConfiguratorProps {
  business: Business;
  services: ServiceItem[];
  coupons: Coupon[];
  currentUser: User;
}

export const PricingConfigurator: React.FC<PricingConfiguratorProps> = ({
  business,
  services,
  coupons,
  currentUser,
}) => {
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [taxRateInput, setTaxRateInput] = useState(business.taxRatePercent);
  const [taxUpdated, setTaxUpdated] = useState(false);

  // New service modal
  const [isAddingService, setIsAddingService] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newCategory, setNewCategory] = useState<ServiceItem['category']>('wash_fold');
  const [newPricingModel, setNewPricingModel] = useState<ServiceItem['pricingModel']>('per_kg');
  const [newBasePrice, setNewBasePrice] = useState(3.5);
  const [newTurnaround, setNewTurnaround] = useState(24);
  const [newDesc, setNewDesc] = useState('');
  const [newUnitLabel, setNewUnitLabel] = useState('kg');

  const handleSaveTaxRate = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.updateBusiness({
      ...business,
      taxRatePercent: taxRateInput,
    });
    setTaxUpdated(true);
    setTimeout(() => setTaxUpdated(false), 2000);
  };

  const handleSaveServiceEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    storageService.updateService(editingService);
    setEditingService(null);
  };

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;

    storageService.createService({
      businessId: business.id,
      name: newServiceName.trim(),
      category: newCategory,
      pricingModel: newPricingModel,
      basePrice: newBasePrice,
      turnaroundHours: newTurnaround,
      description: newDesc.trim() || 'Professional laundry and fabric care service.',
      minQuantity: newPricingModel === 'per_kg' ? 3 : 1,
      unitLabel: newUnitLabel,
    });

    setIsAddingService(false);
    setNewServiceName('');
    setNewDesc('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Pricing Engine & Service Catalog Rules</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure rates per kilogram, garment pricing, regional tax rules, and promotional coupons
          </p>
        </div>

        <button
          onClick={() => setIsAddingService(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-black hover:bg-slate-800 rounded-md transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Service Offering</span>
        </button>
      </div>

      {/* Regional Tax & Express Configuration */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-4">
          Regional Taxes & Fee Structures
        </h3>

        <form onSubmit={handleSaveTaxRate} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-700 font-medium mb-1">State / Regional Tax Rate (%)</label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.1"
                min="0"
                max="30"
                value={taxRateInput}
                onChange={(e) => setTaxRateInput(parseFloat(e.target.value) || 0)}
                className="w-28 px-3 py-1.5 bg-white border border-slate-200 rounded font-mono"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-black text-white rounded font-medium hover:bg-slate-800"
              >
                {taxUpdated ? 'Saved ✓' : 'Update Tax'}
              </button>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Applied automatically on final invoices</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="font-semibold text-slate-800">Priority Express Turnaround Surcharge</div>
            <div className="text-slate-500 mt-0.5">Fixed rate: $15.00 for under 8-hour return</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="font-semibold text-slate-800">Doorstep Delivery Policy</div>
            <div className="text-slate-500 mt-0.5">Standard fee: $3.50 · Waived on orders over $35.00</div>
          </div>
        </form>
      </div>

      {/* Service Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((srv) => (
          <div
            key={srv.id}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
          >
            <div>
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {srv.category.replace('_', ' ')} · {srv.pricingModel.replace('_', ' ')}
                </span>
                <button
                  onClick={() => setEditingService(srv)}
                  className="p-1 text-slate-400 hover:text-black rounded"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h4 className="font-bold text-slate-900 text-sm mt-2">{srv.name}</h4>
              <p className="text-slate-500 text-xs mt-1 line-clamp-2">{srv.description}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-lg font-mono font-bold text-slate-900">
                  {formatCurrency(srv.basePrice, business.currency)}
                </span>
                <span className="text-slate-500">/{srv.unitLabel}</span>
              </div>
              <div className="text-slate-500 font-medium">{srv.turnaroundHours}h cycle</div>
            </div>
          </div>
        ))}
      </div>

      {/* Active Coupons Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Promotional Discounts & Coupons</h3>
          <p className="text-xs text-slate-500">Customer loyalty vouchers and minimum order requirements</p>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase bg-slate-50">
                <th className="p-4 font-semibold">Code</th>
                <th className="p-4 font-semibold">Discount</th>
                <th className="p-4 font-semibold">Min Order</th>
                <th className="p-4 font-semibold">Usage</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {coupons.map((c) => (
                <tr key={c.id}>
                  <td className="p-4 font-mono font-bold text-slate-900">{c.code}</td>
                  <td className="p-4">
                    {c.discountType === 'percentage' ? `${c.discountValue}% Off` : `$${c.discountValue}.00 Off`}
                  </td>
                  <td className="p-4 font-mono">${c.minOrderAmount.toFixed(2)}</td>
                  <td className="p-4 text-slate-500">
                    {c.usageCount} / {c.maxUsage} used
                  </td>
                  <td className="p-4">
                    <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-medium">
                      ACTIVE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Service Modal */}
      {editingService && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveServiceEdit}
            className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-slate-900 text-xs space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Edit Service: {editingService.name}</h3>
              <button
                type="button"
                onClick={() => setEditingService(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Service Display Name</label>
              <input
                type="text"
                value={editingService.name}
                onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Base Price ($)</label>
                <input
                  type="number"
                  step="0.05"
                  value={editingService.basePrice}
                  onChange={(e) =>
                    setEditingService({ ...editingService, basePrice: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Turnaround (Hours)</label>
                <input
                  type="number"
                  value={editingService.turnaroundHours}
                  onChange={(e) =>
                    setEditingService({ ...editingService, turnaroundHours: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Description</label>
              <textarea
                rows={3}
                value={editingService.description}
                onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingService(null)}
                className="px-4 py-2 border border-slate-200 rounded text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white rounded font-medium hover:bg-slate-800"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add New Service Modal */}
      {isAddingService && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateService}
            className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 text-slate-900 text-xs space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Add New Laundry Service</h3>
              <button
                type="button"
                onClick={() => setIsAddingService(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Service Name</label>
              <input
                type="text"
                placeholder="e.g. Leather Jacket Conditioning & Color Revive"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded"
                >
                  <option value="wash_fold">Wash & Fold</option>
                  <option value="wash_iron">Wash & Iron</option>
                  <option value="iron_only">Ironing Only</option>
                  <option value="dry_clean">Eco Dry Clean</option>
                  <option value="premium_care">Couture & Woollens</option>
                  <option value="bedding_curtains">Bedding & Curtains</option>
                  <option value="shoe_cleaning">Sneaker & Footwear</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Pricing Model</label>
                <select
                  value={newPricingModel}
                  onChange={(e) => {
                    const model = e.target.value as any;
                    setNewPricingModel(model);
                    setNewUnitLabel(model === 'per_kg' ? 'kg' : model === 'per_item' ? 'piece' : 'package');
                  }}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded"
                >
                  <option value="per_kg">Price per Kilogram</option>
                  <option value="per_item">Price per Garment Item</option>
                  <option value="package">Package / Fixed Quotation</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Base Price ($)</label>
                <input
                  type="number"
                  step="0.05"
                  value={newBasePrice}
                  onChange={(e) => setNewBasePrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Turnaround Time (Hours)</label>
                <input
                  type="number"
                  value={newTurnaround}
                  onChange={(e) => setNewTurnaround(parseInt(e.target.value) || 24)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Description</label>
              <textarea
                rows={2}
                placeholder="Care details, washing temperature, detergent formula..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddingService(false)}
                className="px-4 py-2 border border-slate-200 rounded text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white rounded font-medium hover:bg-slate-800"
              >
                Create Service
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
