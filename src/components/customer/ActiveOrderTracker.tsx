import React, { useState } from 'react';
import {
  CheckCircle,
  Clock,
  Truck,
  FileText,
  AlertTriangle,
  User,
  Phone,
  MapPin,
  Check,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Order, Business } from '../../types';
import { storageService } from '../../services/storageService';
import {
  ORDER_LIFECYCLE_STEPS,
  getStatusStepIndex,
  formatStatusLabel,
  formatCurrency,
  formatDateTime,
} from '../../utils/formatters';

interface ActiveOrderTrackerProps {
  order: Order;
  business: Business;
  onViewInvoice: (order: Order) => void;
  onOpenSupportTicket: (orderId: string, orderNumber: string) => void;
}

export const ActiveOrderTracker: React.FC<ActiveOrderTrackerProps> = ({
  order,
  business,
  onViewInvoice,
  onOpenSupportTicket,
}) => {
  const currentStepIndex = getStatusStepIndex(order.status);
  const [approving, setApproving] = useState(false);

  const handleApproveQuote = () => {
    setApproving(true);
    storageService.approveQuoteAdjustment(order.id);
    setTimeout(() => {
      setApproving(false);
    }, 400);
  };

  const isQuotePendingCustomer =
    order.status === 'inspection_and_weighing' &&
    order.quoteAdjustment &&
    !order.quoteAdjustment.customerApproved;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden mb-6">
      {/* Top Banner / Order Title */}
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-base text-slate-900">{order.orderNumber}</span>
            <span className="text-slate-400">·</span>
            <span className="text-xs font-medium text-slate-700">{order.branchName}</span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-500">{formatDateTime(order.createdAt)}</span>
          </div>
          <div className="text-xs text-slate-600 mt-1">
            Status:{' '}
            <span className="font-semibold text-slate-900">{formatStatusLabel(order.status)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewInvoice(order)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors shadow-xs"
          >
            <FileText className="w-3.5 h-3.5 text-slate-600" />
            <span>View Receipt & Invoice</span>
          </button>
        </div>
      </div>

      {/* Quote Adjustment Urgent Notice if applicable */}
      {isQuotePendingCustomer && (
        <div className="mx-6 mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-bold text-amber-950">Action Required: Intake Weighing & Quote Adjustment</div>
              <p className="mt-1 text-amber-800 leading-relaxed">
                Our Downtown Hub staff inspected your garments on intake.
                <br />
                <strong>Reason:</strong> {order.quoteAdjustment?.reason}
              </p>

              <div className="mt-3 p-3 bg-white/80 border border-amber-200 rounded-md flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="text-slate-500">
                    Original Estimate:{' '}
                    <span className="line-through font-mono">
                      {formatCurrency(order.quoteAdjustment?.originalTotal || 0, business.currency)}
                    </span>{' '}
                    ({order.quoteAdjustment?.originalWeightKg} kg)
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    Revised Total: {formatCurrency(order.quoteAdjustment?.revisedTotal || 0, business.currency)}{' '}
                    <span className="text-xs font-normal text-slate-600">
                      ({order.quoteAdjustment?.actualWeightKg} kg verified on digital scale)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenSupportTicket(order.id, order.orderNumber)}
                    className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded font-medium hover:bg-white"
                  >
                    Ask a Question
                  </button>
                  <button
                    onClick={handleApproveQuote}
                    disabled={approving}
                    className="px-4 py-1.5 bg-black text-white font-medium rounded hover:bg-slate-800 transition-colors shadow-xs flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve Revised Total</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 16-Step Horizontal / Responsive Lifecycle Bar */}
      <div className="p-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
          Garment Lifecycle Journey
        </div>

        {/* Progress Timeline */}
        <div className="relative">
          <div className="overflow-x-auto pb-4 scrollbar-thin">
            <div className="flex items-center min-w-[900px] justify-between relative">
              {/* Connecting Line */}
              <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0" />

              {ORDER_LIFECYCLE_STEPS.map((step, idx) => {
                const isPassed = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={step.status} className="flex flex-col items-center relative z-10 w-24 text-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                        isCurrent
                          ? 'bg-black text-white ring-4 ring-slate-100 shadow-sm scale-110'
                          : isPassed
                          ? 'bg-slate-900 text-white'
                          : 'bg-white border-2 border-slate-300 text-slate-400'
                      }`}
                    >
                      {isPassed ? <Check className="w-4 h-4" /> : step.stepNumber}
                    </div>

                    <div className="mt-2 text-[11px] leading-tight">
                      <div
                        className={`font-medium ${
                          isCurrent ? 'text-black font-semibold' : isPassed ? 'text-slate-800' : 'text-slate-400'
                        }`}
                      >
                        {step.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Operational Context & Assigned Courier Details */}
        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* Driver details */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-slate-700" />
              Assigned Fleet Partner
            </div>
            {order.deliveryDriverName || order.pickupDriverName ? (
              <div>
                <div className="font-medium text-slate-900">
                  {order.deliveryDriverName || order.pickupDriverName}
                </div>
                <div className="text-slate-500 text-[11px] mt-0.5">Downtown Logistics Team #3</div>
                <div className="flex items-center gap-2 mt-2">
                  <a
                    href="tel:+15553928835"
                    className="flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded hover:bg-slate-100 text-slate-700 font-medium text-[11px]"
                  >
                    <Phone className="w-3 h-3 text-slate-500" />
                    Call Driver
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-slate-500">Driver will be assigned 30 min before schedule.</div>
            )}
          </div>

          {/* Timings */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-700" />
              Scheduled Windows
            </div>
            <div className="space-y-1">
              <div>
                <span className="text-slate-500">Pickup:</span>{' '}
                <span className="font-medium text-slate-800">
                  {order.pickupSlot.date} ({order.pickupSlot.window})
                </span>
              </div>
              <div>
                <span className="text-slate-500">Delivery:</span>{' '}
                <span className="font-medium text-slate-800">
                  {order.deliverySlot.date} ({order.deliverySlot.window})
                </span>
              </div>
              {order.isExpress && (
                <div className="text-amber-700 font-medium mt-1">Priority Express Surcharge Applied</div>
              )}
            </div>
          </div>

          {/* Destination */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-700" />
              Delivery Address
            </div>
            <div className="text-slate-700">
              <div className="font-medium text-slate-900">{order.deliveryAddress.label}</div>
              <div className="text-slate-500 mt-0.5">
                {order.deliveryAddress.street}, {order.deliveryAddress.city} {order.deliveryAddress.postalCode}
              </div>
              {order.deliveryAddress.instructions && (
                <div className="text-slate-500 italic text-[11px] mt-1">
                  "{order.deliveryAddress.instructions}"
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status History Trail */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <div className="text-xs font-semibold text-slate-900 mb-3">Recent Status Activity Trail</div>
          <div className="space-y-2 text-xs">
            {order.statusHistory.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-2 rounded hover:bg-slate-50">
                <div className="w-2 h-2 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-baseline justify-between">
                    <span className="font-semibold text-slate-900">{formatStatusLabel(item.status)}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{formatDateTime(item.timestamp)}</span>
                  </div>
                  {item.note && <div className="text-slate-600 text-[11px] mt-0.5">{item.note}</div>}
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Updated by {item.actorName} ({item.actorRole.replace('_', ' ')})
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
