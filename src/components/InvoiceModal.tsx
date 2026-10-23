import React from 'react';
import { X, Printer, CheckCircle, Clock } from 'lucide-react';
import { Order, Business, Branch } from '../types';
import { formatCurrency, formatDateTime } from '../utils/formatters';

interface InvoiceModalProps {
  order: Order | null;
  business: Business;
  branch?: Branch;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, business, branch, onClose }) => {
  if (!order) return null;

  const invoiceNumber = `INV-${order.orderNumber.replace('CL-', '')}`;
  const isPaid = order.paymentStatus === 'paid';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden text-slate-900 print:shadow-none print:border-none print:m-0">
        {/* Top Action Bar (hidden on print) */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 bg-slate-50 print:hidden">
          <div className="text-xs font-semibold text-slate-700">Official Tax Invoice</div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-8 space-y-6 text-xs">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-6">
            <div>
              <div className="text-xl font-bold tracking-tight text-slate-900">{business.name}</div>
              <div className="text-slate-500 mt-1 leading-relaxed">
                <div>{branch?.name || business.address}</div>
                <div>{branch?.address}</div>
                <div>Phone: {branch?.phone || business.phone}</div>
                <div>Email: {business.email}</div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Invoice</div>
              <div className="text-base font-mono font-bold text-slate-900 mt-0.5">{invoiceNumber}</div>
              <div className="text-slate-500 mt-1">
                <div>Date: {formatDateTime(order.createdAt)}</div>
                <div>Order Ref: {order.orderNumber}</div>
                <div className="mt-2 inline-block">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                      isPaid
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {isPaid ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {isPaid ? 'PAID IN FULL' : 'PAYMENT PENDING'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer & Delivery Details */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
            <div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Billed To</div>
              <div className="text-sm font-semibold text-slate-900 mt-1">{order.customerName}</div>
              <div className="text-slate-600 mt-0.5">{order.customerEmail}</div>
              <div className="text-slate-600">{order.customerPhone}</div>
            </div>

            <div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Pickup / Delivery Address</div>
              <div className="text-xs text-slate-800 font-medium mt-1">{order.deliveryAddress.label}</div>
              <div className="text-slate-600 mt-0.5 leading-tight">
                {order.deliveryAddress.street}, {order.deliveryAddress.city} {order.deliveryAddress.postalCode}
              </div>
              <div className="text-slate-400 text-[10px] mt-1">
                Scheduled Slot: {order.deliverySlot.date} ({order.deliverySlot.window})
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase tracking-wider">
                  <th className="py-2.5 font-semibold">Service & Garment Description</th>
                  <th className="py-2.5 font-semibold text-center">Qty / Weight</th>
                  <th className="py-2.5 font-semibold text-right">Unit Rate</th>
                  <th className="py-2.5 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3">
                      <div className="font-medium text-slate-900">{item.serviceName}</div>
                      <div className="text-[11px] text-slate-500">{item.itemName}</div>
                      {item.stainNotes && (
                        <div className="text-[10px] text-amber-700 font-medium mt-0.5">
                          Note: {item.stainNotes}
                        </div>
                      )}
                    </td>
                    <td className="py-3 text-center">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-3 text-right font-mono">{formatCurrency(item.unitPrice, business.currency)}</td>
                    <td className="py-3 text-right font-mono font-medium text-slate-900">
                      {formatCurrency(item.subtotal, business.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Subtotal & Totals Breakdown */}
          <div className="flex justify-end pt-2 border-t border-slate-200">
            <div className="w-64 space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono text-slate-900">{formatCurrency(order.subtotal, business.currency)}</span>
              </div>

              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
                  <span className="font-mono">-{formatCurrency(order.discount, business.currency)}</span>
                </div>
              )}

              {order.expressFee > 0 && (
                <div className="flex justify-between">
                  <span>Priority Express Turnaround</span>
                  <span className="font-mono text-slate-900">{formatCurrency(order.expressFee, business.currency)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Doorstep Pickup & Delivery</span>
                <span className="font-mono text-slate-900">{formatCurrency(order.deliveryFee, business.currency)}</span>
              </div>

              <div className="flex justify-between">
                <span>Tax ({business.taxRatePercent}%)</span>
                <span className="font-mono text-slate-900">{formatCurrency(order.taxAmount, business.currency)}</span>
              </div>

              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-bold text-slate-900">
                <span>Total Amount</span>
                <span className="font-mono">{formatCurrency(order.totalAmount, business.currency)}</span>
              </div>

              <div className="flex justify-between text-xs font-semibold text-slate-700 pt-1">
                <span>Payment Mode</span>
                <span className="uppercase text-[11px] font-mono">{order.paymentMethod.replace(/_/g, ' ')}</span>
              </div>
            </div>
          </div>

          {/* Quote Adjustment Note if applicable */}
          {order.quoteAdjustment && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-600">
              <span className="font-semibold text-slate-800">Inspection & Weighing Notice:</span> Original estimate of{' '}
              {formatCurrency(order.quoteAdjustment.originalTotal, business.currency)} was revised to{' '}
              {formatCurrency(order.quoteAdjustment.revisedTotal, business.currency)} following intake weighing (
              {order.quoteAdjustment.actualWeightKg}kg vs estimated {order.quoteAdjustment.originalWeightKg}kg). Customer approval status:{' '}
              <span className="font-medium text-slate-900">
                {order.quoteAdjustment.customerApproved ? 'Approved by Customer' : 'Pending Customer Confirmation'}
              </span>
              .
            </div>
          )}

          {/* Footer Note */}
          <div className="text-center text-[10px] text-slate-400 border-t border-slate-100 pt-4">
            Thank you for choosing {business.name}. For questions regarding this invoice or garment care, please visit
            our Customer Support Center or call {branch?.phone || business.phone}.
          </div>
        </div>
      </div>
    </div>
  );
};
