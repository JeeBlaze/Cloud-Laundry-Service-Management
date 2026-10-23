import React, { useState } from 'react';
import {
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Plus,
  RefreshCw,
  ShoppingBag,
  CreditCard,
  History,
  LifeBuoy,
  Tag,
  CheckCircle,
} from 'lucide-react';
import { Order, ServiceItem, Business, Branch, User, SubscriptionPlan, SupportTicket } from '../../types';
import { ActiveOrderTracker } from './ActiveOrderTracker';
import { BookLaundryModal } from './BookLaundryModal';
import { CustomerSubscriptions } from './CustomerSubscriptions';
import { CustomerSupportView } from './CustomerSupportView';
import { formatCurrency, formatDateTime, formatStatusLabel } from '../../utils/formatters';

interface CustomerPortalProps {
  currentUser: User;
  business: Business;
  branches: Branch[];
  services: ServiceItem[];
  orders: Order[];
  plans: SubscriptionPlan[];
  tickets: SupportTicket[];
  onViewInvoice: (order: Order) => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  currentUser,
  business,
  branches,
  services,
  orders,
  plans,
  tickets,
  onViewInvoice,
}) => {
  const [activeTab, setActiveTab] = useState<'tracker' | 'services' | 'history' | 'subscriptions' | 'support'>(
    'tracker'
  );
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [supportPrefilledOrder, setSupportPrefilledOrder] = useState<{ id: string; number: string } | null>(null);

  // Filter orders for this customer
  const customerOrders = orders.filter((o) => o.customerId === currentUser.id);
  const activeOrders = customerOrders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled');
  const pastOrders = customerOrders.filter((o) => o.status === 'completed' || o.status === 'cancelled');

  const handleOpenSupportForOrder = (orderId: string, orderNumber: string) => {
    setSupportPrefilledOrder({ id: orderId, number: orderNumber });
    setActiveTab('support');
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Welcome back</span>
            <span>·</span>
            <span>{business.name}</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
            Hello, {currentUser.fullName}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            You have {activeOrders.length} active laundry order{activeOrders.length === 1 ? '' : 's'} in progress.
          </p>
        </div>

        <button
          onClick={() => setIsBookModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Book Doorstep Laundry</span>
        </button>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('tracker')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'tracker'
              ? 'border-black text-black font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Active Orders ({activeOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('services')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'services'
              ? 'border-black text-black font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Services & Price Catalog</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'history'
              ? 'border-black text-black font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Order History ({pastOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'subscriptions'
              ? 'border-black text-black font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Subscriptions & Plans</span>
        </button>

        <button
          onClick={() => setActiveTab('support')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'support'
              ? 'border-black text-black font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <LifeBuoy className="w-3.5 h-3.5" />
          <span>Support & Claims ({tickets.length})</span>
        </button>
      </div>

      {/* Tab 1: Active Order Trackers */}
      {activeTab === 'tracker' && (
        <div>
          {activeOrders.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 text-xs">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <div className="text-base font-bold text-slate-900">No active laundry orders right now</div>
              <p className="text-slate-500 mt-1 max-w-sm mx-auto">
                Schedule a doorstep collection for wash & fold, dry cleaning, or shoe restoration.
              </p>
              <button
                onClick={() => setIsBookModalOpen(true)}
                className="mt-4 px-4 py-2 bg-black text-white text-xs font-semibold rounded-md hover:bg-slate-800 shadow-xs"
              >
                Schedule Pickup Now
              </button>
            </div>
          ) : (
            <div>
              {activeOrders.map((order) => (
                <ActiveOrderTracker
                  key={order.id}
                  order={order}
                  business={business}
                  onViewInvoice={onViewInvoice}
                  onOpenSupportTicket={handleOpenSupportForOrder}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Services & Price Catalog */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Our Signature Laundry & Fabric Care</h2>
              <p className="text-xs text-slate-500">
                Transparent pricing by weight or piece with certified eco-detergents and temperature controls
              </p>
            </div>
            <button
              onClick={() => setIsBookModalOpen(true)}
              className="px-4 py-2 bg-black text-white rounded text-xs font-medium hover:bg-slate-800"
            >
              Start Order
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map((srv) => (
              <div
                key={srv.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {srv.category.replace('_', ' ')}
                    </span>
                    {srv.isPopular && (
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        Popular
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mt-2">{srv.name}</h3>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">{srv.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-lg font-mono font-bold text-slate-900">
                      {formatCurrency(srv.basePrice, business.currency)}
                    </span>
                    <span className="text-xs text-slate-500">/{srv.unitLabel}</span>
                  </div>
                  <button
                    onClick={() => setIsBookModalOpen(true)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Order History */}
      {activeTab === 'history' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-slate-900">Past Orders & Invoices</h2>
              <p className="text-xs text-slate-500">Download receipts and view order completion records</p>
            </div>
          </div>

          {pastOrders.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No completed orders yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase tracking-wider bg-slate-50">
                    <th className="p-4 font-semibold">Order Number</th>
                    <th className="p-4 font-semibold">Date</th>
                    <th className="p-4 font-semibold">Services & Items</th>
                    <th className="p-4 font-semibold">Branch</th>
                    <th className="p-4 font-semibold text-right">Total</th>
                    <th className="p-4 font-semibold">Payment</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {pastOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/60">
                      <td className="p-4 font-mono font-semibold text-slate-900">{o.orderNumber}</td>
                      <td className="p-4">{formatDateTime(o.createdAt)}</td>
                      <td className="p-4">
                        <div className="font-medium text-slate-900">{o.items[0]?.serviceName}</div>
                        <div className="text-[11px] text-slate-500">{o.items.length} item categories</div>
                      </td>
                      <td className="p-4 text-slate-600">{o.branchName}</td>
                      <td className="p-4 text-right font-mono font-semibold text-slate-900">
                        {formatCurrency(o.totalAmount, business.currency)}
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                          PAID ({o.paymentMethod.replace(/_/g, ' ')})
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => onViewInvoice(o)}
                          className="px-2.5 py-1 text-slate-700 hover:text-black border border-slate-200 rounded font-medium text-[11px] hover:bg-slate-50"
                        >
                          Invoice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Subscriptions */}
      {activeTab === 'subscriptions' && (
        <CustomerSubscriptions plans={plans} business={business} currentUser={currentUser} />
      )}

      {/* Tab 5: Support & Claims */}
      {activeTab === 'support' && (
        <CustomerSupportView
          currentUser={currentUser}
          business={business}
          tickets={tickets}
          orders={customerOrders}
          prefilledOrderId={supportPrefilledOrder?.id}
          prefilledOrderNumber={supportPrefilledOrder?.number}
        />
      )}

      {/* Booking Modal */}
      <BookLaundryModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        currentUser={currentUser}
        services={services}
        business={business}
        branches={branches}
        onOrderCreated={(newOrderId) => {
          setActiveTab('tracker');
        }}
      />
    </div>
  );
};
