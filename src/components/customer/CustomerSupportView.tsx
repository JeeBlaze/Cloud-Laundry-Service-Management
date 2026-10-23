import React, { useState } from 'react';
import { MessageSquare, AlertCircle, Plus, Send, CheckCircle, Clock } from 'lucide-react';
import { SupportTicket, User, Business, Order } from '../../types';
import { storageService } from '../../services/storageService';
import { formatDateTime } from '../../utils/formatters';

interface CustomerSupportViewProps {
  currentUser: User;
  business: Business;
  tickets: SupportTicket[];
  orders: Order[];
  prefilledOrderId?: string;
  prefilledOrderNumber?: string;
}

export const CustomerSupportView: React.FC<CustomerSupportViewProps> = ({
  currentUser,
  business,
  tickets,
  orders,
  prefilledOrderId,
  prefilledOrderNumber,
}) => {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(tickets[0]?.id || null);
  const [isCreatingTicket, setIsCreatingTicket] = useState(Boolean(prefilledOrderId));

  // New ticket state
  const [subject, setSubject] = useState(prefilledOrderNumber ? `Inquiry on Order #${prefilledOrderNumber}` : '');
  const [category, setCategory] = useState<SupportTicket['category']>('quality_issue');
  const [priority, setPriority] = useState<SupportTicket['priority']>('medium');
  const [orderRef, setOrderRef] = useState(prefilledOrderId || '');
  const [initialMsg, setInitialMsg] = useState('');
  const [refundClaim, setRefundClaim] = useState<number | undefined>(undefined);

  // Reply state
  const [replyText, setReplyText] = useState('');

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0];

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !initialMsg.trim()) return;

    const matchedOrder = orders.find((o) => o.id === orderRef);

    const newTkt = storageService.createTicket({
      businessId: business.id,
      customerId: currentUser.id,
      customerName: currentUser.fullName,
      customerEmail: currentUser.email,
      orderId: orderRef || undefined,
      orderNumber: matchedOrder?.orderNumber,
      subject: subject.trim(),
      category,
      priority,
      refundClaimedAmount: refundClaim && refundClaim > 0 ? refundClaim : undefined,
      initialMessage: initialMsg.trim(),
    });

    setIsCreatingTicket(false);
    setSelectedTicketId(newTkt.id);
    setSubject('');
    setInitialMsg('');
    setRefundClaim(undefined);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    storageService.replyTicket(selectedTicket.id, replyText.trim());
    setReplyText('');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">Customer Care & Dispute Resolution</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Report fabric issues, missing garment claims, delivery changes, or billing requests
          </p>
        </div>

        <button
          onClick={() => setIsCreatingTicket(!isCreatingTicket)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-black hover:bg-slate-800 rounded-md transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isCreatingTicket ? 'View Active Tickets' : 'Open New Ticket / Claim'}</span>
        </button>
      </div>

      {isCreatingTicket ? (
        <form onSubmit={handleCreateTicket} className="p-6 max-w-xl mx-auto space-y-4 text-xs">
          <div className="font-semibold text-sm text-slate-900">Submit a New Support Ticket or Quality Claim</div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Subject</label>
            <input
              type="text"
              placeholder="e.g. Persistent coffee stain on formal shirt"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs"
              >
                <option value="quality_issue">Quality / Rewash Request</option>
                <option value="damaged_item">Damaged Garment Claim</option>
                <option value="missing_item">Missing Item</option>
                <option value="delivery_delay">Pickup / Delivery Delay</option>
                <option value="billing">Billing / Invoice Question</option>
                <option value="general">General Inquiry</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Linked Order (Optional)</label>
            <select
              value={orderRef}
              onChange={(e) => setOrderRef(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs"
            >
              <option value="">No linked order</option>
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.orderNumber} ({o.createdAt.split('T')[0]} - {o.items[0]?.serviceName || 'Wash'})
                </option>
              ))}
            </select>
          </div>

          {(category === 'damaged_item' || category === 'missing_item') && (
            <div>
              <label className="block text-slate-700 font-medium mb-1">Claimed Compensation Amount ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 45.00"
                value={refundClaim || ''}
                onChange={(e) => setRefundClaim(parseFloat(e.target.value) || undefined)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Claims are reviewed by the branch manager against intake condition photos and weight records.
              </span>
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-medium mb-1">Detailed Description</label>
            <textarea
              rows={4}
              placeholder="Please describe the issue, specific garment description, and your preferred resolution..."
              value={initialMsg}
              onChange={(e) => setInitialMsg(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreatingTicket(false)}
              className="px-4 py-1.5 border border-slate-200 text-slate-600 rounded hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-black text-white font-medium rounded hover:bg-slate-800 transition-colors"
            >
              Submit Ticket
            </button>
          </div>
        </form>
      ) : tickets.length === 0 ? (
        <div className="p-12 text-center text-slate-500 text-xs">
          <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <div className="font-semibold text-slate-700">No support tickets found</div>
          <div className="mt-1">Everything looks smooth! Click above if you need assistance with an order.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 min-h-[420px]">
          {/* Ticket list */}
          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {tickets.map((tkt) => {
              const isSelected = selectedTicket?.id === tkt.id;
              return (
                <button
                  key={tkt.id}
                  onClick={() => setSelectedTicketId(tkt.id)}
                  className={`w-full text-left p-4 hover:bg-slate-50 transition-colors ${
                    isSelected ? 'bg-slate-50/80 border-l-2 border-black' : ''
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-semibold text-slate-900">
                      {tkt.orderNumber || 'General'}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      {formatDateTime(tkt.createdAt)}
                    </span>
                  </div>
                  <div className="font-medium text-slate-800 text-xs line-clamp-1">{tkt.subject}</div>
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500">
                    <span className="capitalize">{tkt.category.replace('_', ' ')}</span>
                    <span>·</span>
                    <span className={`font-semibold ${tkt.status === 'resolved' ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {tkt.status.toUpperCase()}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Conversation view */}
          <div className="md:col-span-2 flex flex-col justify-between p-6">
            {selectedTicket ? (
              <>
                <div className="space-y-4">
                  {/* Top info */}
                  <div className="border-b border-slate-100 pb-3 flex justify-between items-start">
                    <div>
                      <div className="font-bold text-sm text-slate-900">{selectedTicket.subject}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Ticket Ref: {selectedTicket.id} · Priority: {selectedTicket.priority} · Status:{' '}
                        <span className="font-semibold text-slate-900 uppercase">{selectedTicket.status}</span>
                      </div>
                    </div>
                    {selectedTicket.orderNumber && (
                      <div className="text-right">
                        <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          Order #{selectedTicket.orderNumber}
                        </span>
                      </div>
                    )}
                  </div>

                  {selectedTicket.resolutionNotes && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-900">
                      <strong>Resolution Note:</strong> {selectedTicket.resolutionNotes}
                      {selectedTicket.refundApprovedAmount && (
                        <div className="mt-1 font-semibold">
                          Refund credited to payment source: ${selectedTicket.refundApprovedAmount.toFixed(2)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Messages list */}
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {selectedTicket.messages.map((m) => {
                      const isCustomer = m.senderRole === 'customer';
                      return (
                        <div
                          key={m.id}
                          className={`p-3 rounded-lg text-xs leading-relaxed ${
                            isCustomer
                              ? 'bg-slate-100 text-slate-900 ml-4'
                              : 'bg-black text-white mr-4'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] mb-1 opacity-70">
                            <span className="font-semibold">
                              {m.senderName} ({m.senderRole.replace('_', ' ')})
                            </span>
                            <span>{formatDateTime(m.timestamp)}</span>
                          </div>
                          <div>{m.text}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Reply bar */}
                {selectedTicket.status !== 'resolved' && (
                  <form onSubmit={handleSendReply} className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                    <input
                      type="text"
                      placeholder="Type your message to customer support..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-md text-xs focus:outline-hidden"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-black text-white rounded-md text-xs font-medium hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Reply</span>
                    </button>
                  </form>
                )}
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
