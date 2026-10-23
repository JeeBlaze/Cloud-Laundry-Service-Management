import React, { useState } from 'react';
import {
  Truck,
  MapPin,
  Phone,
  CheckCircle2,
  AlertCircle,
  FileText,
  Camera,
  PenTool,
  Check,
  Clock,
  Navigation,
} from 'lucide-react';
import { DeliveryJob, Order, User, Business } from '../../types';
import { storageService } from '../../services/storageService';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

interface DriverPortalProps {
  currentUser: User;
  business: Business;
  deliveryJobs: DeliveryJob[];
  orders: Order[];
  onViewInvoice: (order: Order) => void;
}

export const DriverPortal: React.FC<DriverPortalProps> = ({
  currentUser,
  business,
  deliveryJobs,
  orders,
  onViewInvoice,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'pickup' | 'delivery'>('all');
  const [activeProofJob, setActiveProofJob] = useState<DeliveryJob | null>(null);

  // Proof form state
  const [recipientName, setRecipientName] = useState('');
  const [proofNotes, setProofNotes] = useState('Doorstep contactless delivery verified by customer.');
  const [hasSignature, setHasSignature] = useState(false);

  const myJobs = deliveryJobs.filter((j) => {
    if (filterType === 'all') return true;
    return j.type === filterType;
  });

  const handleToggleChecklist = (jobId: string, checklistId: string) => {
    storageService.toggleJobChecklist(jobId, checklistId);
  };

  const handleUpdateStatus = (job: DeliveryJob, newStatus: DeliveryJob['status']) => {
    storageService.updateJobStatus(job.id, newStatus);

    // Also update main order status accordingly
    if (job.type === 'pickup') {
      if (newStatus === 'completed') {
        storageService.updateOrderStatus(
          job.orderId,
          'picked_up',
          `Courier ${currentUser.fullName} collected laundry tote from customer.`
        );
      }
    } else if (job.type === 'delivery') {
      if (newStatus === 'in_transit') {
        storageService.updateOrderStatus(
          job.orderId,
          'out_for_delivery',
          `Out for delivery with driver ${currentUser.fullName}.`
        );
      }
    }
  };

  const handleOpenProofModal = (job: DeliveryJob) => {
    setActiveProofJob(job);
    setRecipientName(job.customerName);
    setHasSignature(false);
  };

  const handleCompleteDeliveryWithProof = () => {
    if (!activeProofJob) return;

    storageService.completeDeliveryWithProof(activeProofJob.orderId, {
      recipientName: recipientName.trim() || activeProofJob.customerName,
      signatureUrl: hasSignature
        ? 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40"><path d="M10 25 Q 30 10, 50 25 T 90 20" stroke="black" fill="none" stroke-width="2"/></svg>'
        : undefined,
      notes: proofNotes.trim(),
    });

    storageService.updateJobStatus(activeProofJob.id, 'completed');
    setActiveProofJob(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Fleet Courier Operations</span>
            <span>·</span>
            <span>Mobile Route Runner</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
            Delivery Partner Route Manifest
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Active driver: <strong>{currentUser.fullName}</strong> · Assigned Runs: {myJobs.length}
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Stops ({deliveryJobs.length})
          </button>
          <button
            onClick={() => setFilterType('pickup')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterType === 'pickup' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pickups
          </button>
          <button
            onClick={() => setFilterType('delivery')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterType === 'delivery' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Deliveries
          </button>
        </div>
      </div>

      {/* Route Stops List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {myJobs.map((job) => {
          const matchedOrder = orders.find((o) => o.id === job.orderId);
          const isCompleted = job.status === 'completed';

          return (
            <div
              key={job.id}
              className={`bg-white border rounded-xl p-6 shadow-xs flex flex-col justify-between transition-colors ${
                isCompleted ? 'border-slate-200 opacity-75' : 'border-slate-300'
              }`}
            >
              <div>
                {/* Badge & Timing */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      job.type === 'pickup' ? 'bg-blue-50 text-blue-800' : 'bg-emerald-50 text-emerald-800'
                    }`}
                  >
                    {job.type === 'pickup' ? 'Doorstep Collection' : 'Return Delivery'}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{job.scheduledTime}</span>
                </div>

                {/* Customer & Address */}
                <div className="mt-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm">{job.customerName}</h3>
                    <span className="font-mono text-xs text-slate-500">{job.orderNumber}</span>
                  </div>

                  <div className="flex items-start gap-1.5 text-xs text-slate-600 mt-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <span>{job.address}</span>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <a
                      href={`tel:${job.customerPhone}`}
                      className="flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded hover:bg-slate-100"
                    >
                      <Phone className="w-3 h-3 text-slate-500" />
                      {job.customerPhone}
                    </a>
                    {matchedOrder && (
                      <button
                        onClick={() => onViewInvoice(matchedOrder)}
                        className="text-[11px] font-medium text-slate-700 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded hover:bg-slate-100"
                      >
                        Receipt
                      </button>
                    )}
                  </div>
                </div>

                {/* Job Checklist */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Stop Checklist
                  </div>
                  <div className="space-y-1.5">
                    {job.checklist.map((item) => (
                      <label
                        key={item.id}
                        className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer hover:text-slate-900"
                      >
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => handleToggleChecklist(job.id, item.id)}
                          className="mt-0.5 rounded text-black focus:ring-0"
                          disabled={isCompleted}
                        />
                        <span className={item.completed ? 'line-through text-slate-400' : ''}>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs">
                  <span className="text-slate-400">Status: </span>
                  <span className="font-semibold text-slate-800 capitalize">
                    {job.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {!isCompleted && job.status === 'assigned' && (
                    <button
                      onClick={() => handleUpdateStatus(job, 'in_transit')}
                      className="px-3 py-1.5 bg-black text-white text-xs font-medium rounded hover:bg-slate-800 flex items-center gap-1"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Start Route</span>
                    </button>
                  )}

                  {!isCompleted && job.status === 'in_transit' && (
                    <button
                      onClick={() => handleUpdateStatus(job, 'arrived')}
                      className="px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded hover:bg-slate-900"
                    >
                      Arrived at Door
                    </button>
                  )}

                  {!isCompleted && (job.status === 'arrived' || job.status === 'in_transit') && (
                    <>
                      {job.type === 'pickup' ? (
                        <button
                          onClick={() => handleUpdateStatus(job, 'completed')}
                          className="px-3 py-1.5 bg-emerald-700 text-white text-xs font-medium rounded hover:bg-emerald-800 flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Complete Pickup</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenProofModal(job)}
                          className="px-3 py-1.5 bg-emerald-700 text-white text-xs font-medium rounded hover:bg-emerald-800 flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Proof of Delivery</span>
                        </button>
                      )}
                    </>
                  )}

                  {isCompleted && (
                    <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Stop Done
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Proof of Delivery Modal */}
      {activeProofJob && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 text-slate-900 text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Proof of Delivery Confirmation</h3>
                <div className="text-slate-500">Order #{activeProofJob.orderNumber}</div>
              </div>
              <button
                onClick={() => setActiveProofJob(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Recipient Name at Door</label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Delivery Hand-off Notes</label>
              <textarea
                rows={2}
                value={proofNotes}
                onChange={(e) => setProofNotes(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Customer Digital Signature</label>
              <div
                onClick={() => setHasSignature(true)}
                className="h-24 bg-slate-50 border border-dashed border-slate-300 rounded flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100/70"
              >
                {hasSignature ? (
                  <div className="text-center font-serif italic text-lg text-slate-900">
                    ✍ {recipientName || 'Verified Recipient'}
                  </div>
                ) : (
                  <div className="text-center text-slate-400">
                    <PenTool className="w-5 h-5 mx-auto mb-1 text-slate-400" />
                    <span>Click or tap to capture recipient doorstep signature</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveProofJob(null)}
                className="px-4 py-2 border border-slate-200 rounded text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCompleteDeliveryWithProof}
                className="px-4 py-2 bg-black text-white rounded font-medium hover:bg-slate-800"
              >
                Submit Proof & Complete Delivery
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
