import React, { useState } from 'react';
import {
  Package,
  AlertTriangle,
  Plus,
  Minus,
  RefreshCw,
  Clock,
  CheckCircle,
  Truck,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { InventoryItem, InventoryMovement, Business, Branch, User } from '../../types';
import { storageService } from '../../services/storageService';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

interface InventoryViewProps {
  business: Business;
  branch?: Branch;
  inventory: InventoryItem[];
  currentUser: User;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  business,
  branch,
  inventory,
  currentUser,
}) => {
  const [selectedItemForAction, setSelectedItemForAction] = useState<InventoryItem | null>(null);
  const [actionType, setActionType] = useState<'consumption' | 'restock'>('consumption');
  const [actionQty, setActionQty] = useState<number>(5);
  const [actionNotes, setActionNotes] = useState<string>('');

  const [isAddingNewItem, setIsAddingNewItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<InventoryItem['category']>('detergent');
  const [newItemQty, setNewItemQty] = useState(25);
  const [newItemUnit, setNewItemUnit] = useState<InventoryItem['unit']>('liters');
  const [newItemThreshold, setNewItemThreshold] = useState(10);
  const [newItemCost, setNewItemCost] = useState(4.5);
  const [newItemSupplier, setNewItemSupplier] = useState('');

  const lowStockItems = inventory.filter((item) => item.quantity <= item.minAlertThreshold);

  const handleExecuteAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForAction || actionQty <= 0) return;

    storageService.logInventoryMovement({
      itemId: selectedItemForAction.id,
      itemName: selectedItemForAction.name,
      businessId: business.id,
      branchId: selectedItemForAction.branchId,
      type: actionType,
      quantity: actionQty,
      notes: actionNotes.trim() || `${actionType === 'consumption' ? 'Used in wash cycle' : 'Delivery arrival received'}`,
    });

    setSelectedItemForAction(null);
    setActionNotes('');
  };

  const handleCreateNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    storageService.addInventoryItem({
      businessId: business.id,
      branchId: branch?.id || 'branch_downtown',
      name: newItemName.trim(),
      category: newItemCategory,
      quantity: newItemQty,
      unit: newItemUnit,
      minAlertThreshold: newItemThreshold,
      costPerUnit: newItemCost,
      supplierName: newItemSupplier.trim() || 'General Supply Co.',
    });

    setIsAddingNewItem(false);
    setNewItemName('');
    setNewItemSupplier('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Inventory & Consumables Warehouse</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Detergents, enzyme softeners, packaging rolls, hangers, and automated reorder alerts
          </p>
        </div>

        <button
          onClick={() => setIsAddingNewItem(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-black hover:bg-slate-800 rounded-md transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Stock Item</span>
        </button>
      </div>

      {/* Low stock warning banner if any item below threshold */}
      {lowStockItems.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-amber-950">
              Low Stock Alert ({lowStockItems.length} items below minimum safety buffer)
            </div>
            <div className="mt-1 text-amber-800 leading-relaxed">
              The following supplies have dipped below branch reorder thresholds:
              <ul className="list-disc list-inside mt-1 font-medium">
                {lowStockItems.map((item) => (
                  <li key={item.id}>
                    <strong>{item.name}</strong>: Current stock is {item.quantity} {item.unit} (Min safety threshold: {item.minAlertThreshold} {item.unit}) · Supplier: {item.supplierName}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {inventory.map((item) => {
          const isLow = item.quantity <= item.minAlertThreshold;

          return (
            <div
              key={item.id}
              className={`bg-white border rounded-xl p-5 shadow-xs flex flex-col justify-between transition-colors ${
                isLow ? 'border-amber-300 ring-1 ring-amber-100' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    {item.category}
                  </span>
                  {isLow ? (
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Low Stock
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      In Stock
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 text-sm mt-2">{item.name}</h3>

                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="text-2xl font-mono font-bold text-slate-900">{item.quantity}</span>
                  <span className="text-xs text-slate-500">{item.unit}</span>
                </div>

                <div className="mt-3 text-xs text-slate-500 space-y-1">
                  <div>Min Safety Threshold: {item.minAlertThreshold} {item.unit}</div>
                  <div>Supplier: {item.supplierName}</div>
                  <div>Last Restocked: {item.lastRestockedDate}</div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedItemForAction(item);
                    setActionType('consumption');
                    setActionQty(2);
                  }}
                  className="flex-1 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-medium text-xs rounded transition-colors"
                >
                  Log Usage
                </button>
                <button
                  onClick={() => {
                    setSelectedItemForAction(item);
                    setActionType('restock');
                    setActionQty(10);
                  }}
                  className="flex-1 py-1.5 bg-black hover:bg-slate-800 text-white font-medium text-xs rounded transition-colors"
                >
                  Restock
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Log Action Modal */}
      {selectedItemForAction && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleExecuteAction}
            className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-slate-900 text-xs space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {actionType === 'consumption' ? 'Record Usage / Consumption' : 'Restock Supply Inflow'}
                </h3>
                <div className="text-slate-500 text-xs">{selectedItemForAction.name}</div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItemForAction(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Quantity ({selectedItemForAction.unit})
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={actionQty}
                onChange={(e) => setActionQty(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded font-mono"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Audit Notes / Reason</label>
              <input
                type="text"
                placeholder={
                  actionType === 'consumption'
                    ? 'e.g. Morning wash cycle for Downtown Hub'
                    : 'e.g. Received shipment invoice #PO-9402'
                }
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedItemForAction(null)}
                className="px-4 py-2 border border-slate-200 rounded text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white rounded font-medium hover:bg-slate-800"
              >
                Confirm Update
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add New Stock Item Modal */}
      {isAddingNewItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateNewItem}
            className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 text-slate-900 text-xs space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Add New Inventory Supply</h3>
              <button
                type="button"
                onClick={() => setIsAddingNewItem(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Item Name</label>
              <input
                type="text"
                placeholder="e.g. Wool & Cashmere Lanolin Softener"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Category</label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded"
                >
                  <option value="detergent">Detergent</option>
                  <option value="softener">Fabric Softener</option>
                  <option value="bleach">Enzyme / Spot Remover</option>
                  <option value="packaging">Packaging Rolls / Poly Bags</option>
                  <option value="hangers">Hangers & Tags</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Unit of Measurement</label>
                <select
                  value={newItemUnit}
                  onChange={(e) => setNewItemUnit(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded"
                >
                  <option value="liters">Liters</option>
                  <option value="kg">Kilograms</option>
                  <option value="units">Units / Pieces</option>
                  <option value="rolls">Rolls</option>
                  <option value="boxes">Boxes</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Initial Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={newItemQty}
                  onChange={(e) => setNewItemQty(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Min Alert Buffer</label>
                <input
                  type="number"
                  min="1"
                  value={newItemThreshold}
                  onChange={(e) => setNewItemThreshold(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Cost Per Unit ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newItemCost}
                  onChange={(e) => setNewItemCost(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Supplier Name</label>
              <input
                type="text"
                placeholder="e.g. EcoSolv Laboratory"
                value={newItemSupplier}
                onChange={(e) => setNewItemSupplier(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddingNewItem(false)}
                className="px-4 py-2 border border-slate-200 rounded text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white rounded font-medium hover:bg-slate-800"
              >
                Create Stock Item
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
