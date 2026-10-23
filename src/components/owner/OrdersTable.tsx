import React, { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  FileText,
  ChevronDown,
  ArrowUpDown,
  AlertCircle,
  Eye,
  CheckCircle,
} from 'lucide-react';
import { Order, OrderStatus, Business, Branch } from '../../types';
import { storageService } from '../../services/storageService';
import {
  ORDER_LIFECYCLE_STEPS,
  formatStatusLabel,
  formatCurrency,
  formatDateTime,
} from '../../utils/formatters';

interface OrdersTableProps {
  orders: Order[];
  business: Business;
  branches: Branch[];
  selectedBranchId: string;
  onViewInvoice: (order: Order) => void;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  business,
  branches,
  selectedBranchId,
  onViewInvoice,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (selectedBranchId !== 'all' && o.branchId !== selectedBranchId) {
      return false;
    }
    if (statusFilter !== 'all' && o.status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.toLowerCase().includes(q) ||
        o.items.some((i) => i.serviceName.toLowerCase().includes(q) || i.itemName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleDownloadCSV = () => {
    const csvContent = storageService.exportOrdersCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleQuickStatusChange = (orderId: string, newStatus: OrderStatus) => {
    storageService.updateOrderStatus(orderId, newStatus, `Manual status change via Orders Manager`);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Order Management & Processing Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor garment lifecycles, inspect weights, manage driver dispatches, and export receipts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filters row */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex-1 min-w-[240px] max-w-sm relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search order #, customer, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-700"
          >
            <option value="all">All Statuses ({orders.length})</option>
            <option value="order_created">Order Created</option>
            <option value="pickup_assigned">Pickup Assigned</option>
            <option value="picked_up">Picked Up</option>
            <option value="received_at_facility">Received at Facility</option>
            <option value="inspection_and_weighing">Inspection & Weighing</option>
            <option value="quote_confirmed">Quote Confirmed</option>
            <option value="washing">Washing</option>
            <option value="drying">Drying</option>
            <option value="ironing_finishing">Steam Pressing</option>
            <option value="quality_inspection">Quality Inspection</option>
            <option value="ready_for_delivery">Ready for Dispatch</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="completed">Completed</option>
            <option value="rewash_recovery">Rewash Recovery</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase tracking-wider bg-slate-50/70">
              <th className="p-4 font-semibold">Order Ref</th>
              <th className="p-4 font-semibold">Customer</th>
              <th className="p-4 font-semibold">Branch</th>
              <th className="p-4 font-semibold">Services / Items</th>
              <th className="p-4 font-semibold text-center">Weight</th>
              <th className="p-4 font-semibold">Lifecycle Status</th>
              <th className="p-4 font-semibold text-right">Total</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400">
                  No orders match your filter criteria.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const isQuotePending =
                  order.status === 'inspection_and_weighing' &&
                  order.quoteAdjustment &&
                  !order.quoteAdjustment.customerApproved;

                return (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Order Ref */}
                    <td className="p-4 font-mono font-semibold text-slate-900">
                      <div>{order.orderNumber}</div>
                      <div className="text-[10px] text-slate-400 font-sans">{formatDateTime(order.createdAt)}</div>
                    </td>

                    {/* Customer */}
                    <td className="p-4">
                      <div className="font-medium text-slate-900">{order.customerName}</div>
                      <div className="text-[11px] text-slate-500">{order.customerPhone}</div>
                    </td>

                    {/* Branch */}
                    <td className="p-4 text-slate-600 max-w-[140px] truncate">{order.branchName}</td>

                    {/* Services */}
                    <td className="p-4 max-w-[180px]">
                      <div className="font-medium text-slate-900 truncate">{order.items[0]?.serviceName}</div>
                      <div className="text-[11px] text-slate-500">
                        {order.items.length} item{order.items.length === 1 ? '' : 's'}{' '}
                        {order.isExpress ? '· Express' : ''}
                      </div>
                    </td>

                    {/* Weight */}
                    <td className="p-4 text-center font-mono">
                      {order.actualWeightKg ? (
                        <span className="font-bold text-slate-900">{order.actualWeightKg} kg</span>
                      ) : (
                        <span className="text-slate-400">~{order.estimatedWeightKg} kg</span>
                      )}
                    </td>

                    {/* Status with quick selector */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <select
                          value={order.status}
                          onChange={(e) => handleQuickStatusChange(order.id, e.target.value as OrderStatus)}
                          className="text-[11px] font-medium bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-800"
                        >
                          {ORDER_LIFECYCLE_STEPS.map((s) => (
                            <option key={s.status} value={s.status}>
                              {s.label}
                            </option>
                          ))}
                          <option value="rewash_recovery">Rewash Recovery</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>

                      {isQuotePending && (
                        <div className="text-[10px] text-amber-700 font-medium mt-1">
                          Awaiting Customer Quote Approval
                        </div>
                      )}
                    </td>

                    {/* Total */}
                    <td className="p-4 text-right font-mono font-bold text-slate-900">
                      <div>{formatCurrency(order.totalAmount, business.currency)}</div>
                      <div className="text-[10px] font-normal text-slate-400 capitalize">
                        {order.paymentStatus} · {order.paymentMethod.replace(/_/g, ' ')}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedOrderDetails(order)}
                          className="p-1.5 text-slate-500 hover:text-black rounded hover:bg-slate-100"
                          title="View Order Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onViewInvoice(order)}
                          className="p-1.5 text-slate-500 hover:text-black rounded hover:bg-slate-100"
                          title="Generate Tax Invoice"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Order Details Drawer / Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 text-slate-900 text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Order Manifest: #{selectedOrderDetails.orderNumber}
                </h3>
                <div className="text-slate-500 text-xs">
                  {selectedOrderDetails.customerName} · {selectedOrderDetails.customerPhone}
                </div>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div>
                <div className="text-[10px] uppercase font-semibold text-slate-400">Doorstep Pickup</div>
                <div className="text-slate-700 font-medium mt-0.5">
                  {selectedOrderDetails.pickupSlot.date} ({selectedOrderDetails.pickupSlot.window})
                </div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  {selectedOrderDetails.pickupAddress.street}, {selectedOrderDetails.pickupAddress.city}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-semibold text-slate-400">Scheduled Delivery</div>
                <div className="text-slate-700 font-medium mt-0.5">
                  {selectedOrderDetails.deliverySlot.date} ({selectedOrderDetails.deliverySlot.window})
                </div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  Assigned courier:{' '}
                  <strong>{selectedOrderDetails.deliveryDriverName || 'Pending driver assignment'}</strong>
                </div>
              </div>
            </div>

            {/* Items */}
            <div>
              <div className="font-semibold text-slate-900 mb-2">Itemized Laundry Manifest</div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase">
                    <th className="py-1.5 font-semibold">Description</th>
                    <th className="py-1.5 font-semibold text-center">Qty / Weight</th>
                    <th className="py-1.5 font-semibold text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedOrderDetails.items.map((it) => (
                    <tr key={it.id}>
                      <td className="py-2">
                        <div className="font-medium text-slate-900">{it.serviceName}</div>
                        <div className="text-[11px] text-slate-500">{it.itemName}</div>
                        {it.stainNotes && (
                          <div className="text-[10px] text-amber-700">{it.stainNotes}</div>
                        )}
                      </td>
                      <td className="py-2 text-center font-mono">
                        {it.quantity} {it.unit}
                      </td>
                      <td className="py-2 text-right font-mono font-medium text-slate-900">
                        {formatCurrency(it.subtotal, business.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Audit & Status trail */}
            <div>
              <div className="font-semibold text-slate-900 mb-2">Chain of Custody Activity Trail</div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {selectedOrderDetails.statusHistory.map((h, i) => (
                  <div key={i} className="text-[11px] flex justify-between p-1.5 bg-slate-50 rounded">
                    <div>
                      <span className="font-semibold text-slate-900">{formatStatusLabel(h.status)}</span>
                      {h.note && <span className="text-slate-600 ml-2">"{h.note}"</span>}
                    </div>
                    <div className="text-slate-400 font-mono text-[10px] shrink-0 ml-2">
                      {formatDateTime(h.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  onViewInvoice(selectedOrderDetails);
                  setSelectedOrderDetails(null);
                }}
                className="px-3 py-1.5 border border-slate-200 rounded text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Open Printable Invoice</span>
              </button>

              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="px-4 py-1.5 bg-black text-white rounded font-medium hover:bg-slate-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
