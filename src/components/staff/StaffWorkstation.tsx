import React, { useState } from 'react';
import {
  Scale,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Plus,
  Trash2,
  FileText,
  Layers,
  Check,
} from 'lucide-react';
import { Order, OrderStatus, OrderItem, Business, Branch, User } from '../../types';
import { storageService } from '../../services/storageService';
import { formatCurrency, formatDateTime, formatStatusLabel } from '../../utils/formatters';

interface StaffWorkstationProps {
  currentUser: User;
  business: Business;
  branch?: Branch;
  orders: Order[];
  onViewInvoice: (order: Order) => void;
}

export const StaffWorkstation: React.FC<StaffWorkstationProps> = ({
  currentUser,
  business,
  branch,
  orders,
  onViewInvoice,
}) => {
  const [stationTab, setStationTab] = useState<'intake' | 'washing' | 'drying' | 'finishing' | 'qa'>('intake');

  // Intake station inspection modal / form state
  const [inspectingOrder, setInspectingOrder] = useState<Order | null>(null);
  const [actualWeightInput, setActualWeightInput] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState<string>('');
  const [stainNoteInput, setStainNoteInput] = useState<string>('');
  const [additionalItemName, setAdditionalItemName] = useState<string>('');
  const [additionalItemQty, setAdditionalItemQty] = useState<number>(1);
  const [additionalItemPrice, setAdditionalItemPrice] = useState<number>(4.8);

  // Filter orders by active branch and station
  const branchOrders = orders.filter((o) => !branch || o.branchId === branch.id);

  const intakeQueue = branchOrders.filter(
    (o) =>
      o.status === 'received_at_facility' ||
      o.status === 'picked_up' ||
      (o.status === 'inspection_and_weighing' && o.quoteAdjustment && !o.quoteAdjustment.customerApproved)
  );

  const washingQueue = branchOrders.filter((o) => o.status === 'quote_confirmed' || o.status === 'washing' || o.status === 'rewash_recovery');
  const dryingQueue = branchOrders.filter((o) => o.status === 'drying');
  const finishingQueue = branchOrders.filter((o) => o.status === 'ironing_finishing');
  const qaQueue = branchOrders.filter((o) => o.status === 'quality_inspection');

  const startInspection = (order: Order) => {
    setInspectingOrder(order);
    setActualWeightInput(order.actualWeightKg || order.estimatedWeightKg);
    setAdjustmentReason(
      `Actual weight measured on intake is ${order.actualWeightKg || order.estimatedWeightKg} kg.`
    );
    setStainNoteInput('');
  };

  const handleConfirmIntakeAdjustment = () => {
    if (!inspectingOrder) return;

    let updatedItems: OrderItem[] = [...inspectingOrder.items];

    // If an additional garment item was noted
    if (additionalItemName.trim()) {
      updatedItems.push({
        id: `item_extra_${Date.now()}`,
        serviceId: 'srv_wash_iron',
        serviceName: 'Wash & Steam Iron',
        itemName: additionalItemName.trim(),
        quantity: additionalItemQty,
        unit: 'piece',
        unitPrice: additionalItemPrice,
        subtotal: Number((additionalItemQty * additionalItemPrice).toFixed(2)),
        stainNotes: stainNoteInput || undefined,
      });
    }

    // Update first wash item weight if per_kg
    updatedItems = updatedItems.map((item) => {
      if (item.unit === 'kg') {
        const subtotal = Number((item.unitPrice * actualWeightInput).toFixed(2));
        return {
          ...item,
          quantity: actualWeightInput,
          subtotal,
          stainNotes: stainNoteInput || item.stainNotes,
        };
      }
      return item;
    });

    storageService.applyQuoteAdjustment(inspectingOrder.id, {
      actualWeightKg: actualWeightInput,
      revisedItems: updatedItems,
      reason:
        adjustmentReason.trim() ||
        `Digital scale recorded ${actualWeightInput}kg. Intake inspection completed.`,
    });

    setInspectingOrder(null);
    setAdditionalItemName('');
    setStainNoteInput('');
  };

  const advanceStatus = (orderId: string, nextStatus: OrderStatus, note: string) => {
    storageService.updateOrderStatus(orderId, nextStatus, note);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Plant Floor Operations</span>
            <span>·</span>
            <span>{branch?.name || 'Processing Facility'}</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
            Laundry Staff Workstation
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Calibrated digital scale weighing, quality triage, and production batch management
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-700 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-md font-mono">
            Inspector: {currentUser.fullName}
          </div>
        </div>
      </div>

      {/* Station Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-px">
        <button
          onClick={() => setStationTab('intake')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
            stationTab === 'intake'
              ? 'border-black text-black font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Intake & Scale Inspection ({intakeQueue.length})</span>
        </button>

        <button
          onClick={() => setStationTab('washing')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
            stationTab === 'washing'
              ? 'border-black text-black font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Washing Drums ({washingQueue.length})</span>
        </button>

        <button
          onClick={() => setStationTab('drying')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
            stationTab === 'drying'
              ? 'border-black text-black font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Drying Tumblers ({dryingQueue.length})</span>
        </button>

        <button
          onClick={() => setStationTab('finishing')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
            stationTab === 'finishing'
              ? 'border-black text-black font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Pressing & Folding ({finishingQueue.length})</span>
        </button>

        <button
          onClick={() => setStationTab('qa')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
            stationTab === 'qa'
              ? 'border-black text-black font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Quality Check & Dispatch ({qaQueue.length})</span>
        </button>
      </div>

      {/* Station Tab 1: Intake & Inspection */}
      {stationTab === 'intake' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-slate-900">Garment Intake & Scale Weighing Station</h2>
              <p className="text-xs text-slate-500">
                Verify incoming laundry totes, calibrate digital scale weight, and record special care tags
              </p>
            </div>
          </div>

          {intakeQueue.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No orders waiting in intake queue.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {intakeQueue.map((order) => {
                const isAwaitingCustomerApproval =
                  order.quoteAdjustment && !order.quoteAdjustment.customerApproved;

                return (
                  <div key={order.id} className="p-6 hover:bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 text-sm">{order.orderNumber}</span>
                        <span className="text-slate-400">·</span>
                        <span className="font-medium text-slate-800">{order.customerName}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-500">{order.customerPhone}</span>
                      </div>

                      <div className="text-xs text-slate-600">
                        Estimated Weight: <strong className="font-mono">{order.estimatedWeightKg} kg</strong> · Current Status:{' '}
                        <span className="font-semibold text-slate-900">{formatStatusLabel(order.status)}</span>
                      </div>

                      {order.stainTreatmentRequested && (
                        <div className="text-[11px] text-amber-800 font-medium">
                          ⚠ Customer requested stain treatment
                        </div>
                      )}

                      {isAwaitingCustomerApproval && (
                        <div className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block font-medium">
                          Awaiting customer confirmation for revised quote ({order.quoteAdjustment?.actualWeightKg}kg /{' '}
                          {formatCurrency(order.quoteAdjustment?.revisedTotal || 0, business.currency)})
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onViewInvoice(order)}
                        className="px-3 py-1.5 border border-slate-200 text-slate-700 rounded text-xs hover:bg-slate-50"
                      >
                        Receipt
                      </button>

                      {order.status === 'picked_up' && (
                        <button
                          onClick={() =>
                            advanceStatus(
                              order.id,
                              'received_at_facility',
                              'Scanned barcode at Intake Bay #1.'
                            )
                          }
                          className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-medium hover:bg-black"
                        >
                          Check In At Facility
                        </button>
                      )}

                      {(order.status === 'received_at_facility' || order.status === 'inspection_and_weighing') && (
                        <button
                          onClick={() => startInspection(order)}
                          className="px-4 py-1.5 bg-black text-white rounded text-xs font-medium hover:bg-slate-800 flex items-center gap-1.5"
                        >
                          <Scale className="w-3.5 h-3.5" />
                          <span>Weigh & Inspect Items</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Station Tab 2: Washing */}
      {stationTab === 'washing' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Commercial Washing Drums</h2>
            <p className="text-xs text-slate-500">Orders ready for washing drum cycles</p>
          </div>

          <div className="divide-y divide-slate-100">
            {washingQueue.map((order) => (
              <div key={order.id} className="p-6 hover:bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{order.orderNumber}</span>
                    <span className="text-slate-400">·</span>
                    <span className="font-medium text-slate-800">{order.customerName}</span>
                    <span className="text-slate-400">·</span>
                    <span className="font-mono text-slate-600">{order.actualWeightKg || order.estimatedWeightKg} kg</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Services: {order.items.map((i) => i.serviceName).join(', ')}
                  </div>
                  {order.fragranceFree && (
                    <div className="text-[11px] text-emerald-700 font-medium">Use hypoallergenic fragrance-free formula</div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {order.status === 'quote_confirmed' && (
                    <button
                      onClick={() =>
                        advanceStatus(order.id, 'washing', 'Loaded into Commercial Drum #3 with eco-detergent.')
                      }
                      className="px-4 py-1.5 bg-black text-white rounded text-xs font-medium hover:bg-slate-800 flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Start Washing Cycle</span>
                    </button>
                  )}

                  {order.status === 'washing' && (
                    <button
                      onClick={() =>
                        advanceStatus(order.id, 'drying', 'Wash completed. Transferred to warm drying tumbler.')
                      }
                      className="px-4 py-1.5 bg-emerald-700 text-white rounded text-xs font-medium hover:bg-emerald-800 flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Complete Wash → Move to Dryer</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Station Tab 3: Drying */}
      {stationTab === 'drying' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Drying Tumblers</h2>
            <p className="text-xs text-slate-500">Tumble drying and temperature-controlled air drying</p>
          </div>

          <div className="divide-y divide-slate-100">
            {dryingQueue.map((order) => (
              <div key={order.id} className="p-6 hover:bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{order.orderNumber}</span>
                    <span className="text-slate-400">·</span>
                    <span className="font-medium text-slate-800">{order.customerName}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Weight: {order.actualWeightKg || order.estimatedWeightKg} kg · Items: {order.items.length}
                  </div>
                  {order.hangDryOnly && (
                    <div className="text-[11px] text-amber-800 font-medium">Delicate: Hang dry on rack without heat</div>
                  )}
                </div>

                <button
                  onClick={() =>
                    advanceStatus(
                      order.id,
                      'ironing_finishing',
                      'Drying complete. Transferred to steam press & finishing table.'
                    )
                  }
                  className="px-4 py-1.5 bg-black text-white rounded text-xs font-medium hover:bg-slate-800 flex items-center gap-1.5"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Drying Done → Steam Finishing</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Station Tab 4: Finishing */}
      {stationTab === 'finishing' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Pressing, Folding & Packaging</h2>
            <p className="text-xs text-slate-500">Steam pressing, precise folding, and garment cover bagging</p>
          </div>

          <div className="divide-y divide-slate-100">
            {finishingQueue.map((order) => (
              <div key={order.id} className="p-6 hover:bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{order.orderNumber}</span>
                    <span className="text-slate-400">·</span>
                    <span className="font-medium text-slate-800">{order.customerName}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {order.items.map((i) => `${i.itemName} (${i.quantity} ${i.unit})`).join(', ')}
                  </div>
                </div>

                <button
                  onClick={() =>
                    advanceStatus(
                      order.id,
                      'quality_inspection',
                      'Folded and packaged. Moved to Quality Assurance station.'
                    )
                  }
                  className="px-4 py-1.5 bg-black text-white rounded text-xs font-medium hover:bg-slate-800 flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Finished → Quality Inspection</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Station Tab 5: QA & Dispatch */}
      {stationTab === 'qa' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Final Quality Assurance & Dispatch</h2>
            <p className="text-xs text-slate-500">Inspect cleanliness, count matching garments, and stage for delivery driver</p>
          </div>

          <div className="divide-y divide-slate-100">
            {qaQueue.map((order) => (
              <div key={order.id} className="p-6 hover:bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{order.orderNumber}</span>
                    <span className="text-slate-400">·</span>
                    <span className="font-medium text-slate-800">{order.customerName}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Address: {order.deliveryAddress.street}, {order.deliveryAddress.city}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      advanceStatus(
                        order.id,
                        'rewash_recovery',
                        'Quality check noticed persistent spot. Sent for ultrasonic rewash.'
                      )
                    }
                    className="px-3 py-1.5 border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 rounded text-xs font-medium"
                  >
                    Flag for Rewash Recovery
                  </button>

                  <button
                    onClick={() =>
                      advanceStatus(
                        order.id,
                        'ready_for_delivery',
                        'Passed 100% quality inspection. Staged on Rack A-4 for dispatch.'
                      )
                    }
                    className="px-4 py-1.5 bg-emerald-700 text-white rounded text-xs font-medium hover:bg-emerald-800 flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Pass Inspection → Ready for Dispatch</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Digital Scale Intake Modal */}
      {inspectingOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 text-slate-900 text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Calibrated Scale Intake: Order #{inspectingOrder.orderNumber}
                </h3>
                <div className="text-slate-500 text-xs">Customer: {inspectingOrder.customerName}</div>
              </div>
              <button
                onClick={() => setInspectingOrder(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Verified Weight on Certified Digital Scale (kg)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  value={actualWeightInput}
                  onChange={(e) => setActualWeightInput(parseFloat(e.target.value) || 0)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded font-mono text-sm w-36 font-bold"
                />
                <span className="text-slate-500">
                  Estimated when booked: <strong>{inspectingOrder.estimatedWeightKg} kg</strong>
                </span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Discovered Extra Items or Add-ons in Laundry Tote (Optional)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="e.g. Formal Dress Shirts"
                  value={additionalItemName}
                  onChange={(e) => setAdditionalItemName(e.target.value)}
                  className="col-span-2 px-3 py-1.5 bg-white border border-slate-200 rounded"
                />
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="1"
                    value={additionalItemQty}
                    onChange={(e) => setAdditionalItemQty(parseInt(e.target.value) || 1)}
                    className="w-16 px-2 py-1.5 bg-white border border-slate-200 rounded"
                  />
                  <span className="text-slate-500">pcs</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Stain / Fabric Condition Inspection Notes</label>
              <input
                type="text"
                placeholder="e.g. Ink spot on left cuff; small tear on rear seam"
                value={stainNoteInput}
                onChange={(e) => setStainNoteInput(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Reason for Quote Adjustment</label>
              <textarea
                rows={2}
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded"
              />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-600">
              * Submitting this adjustment updates the order to <strong>Inspection & Weighing</strong> status and sends
              a prompt to the customer to authorize the revised total before washing commences.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setInspectingOrder(null)}
                className="px-4 py-2 border border-slate-200 rounded text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmIntakeAdjustment}
                className="px-4 py-2 bg-black text-white rounded font-medium hover:bg-slate-800"
              >
                Confirm Weighing & Submit Adjustment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
