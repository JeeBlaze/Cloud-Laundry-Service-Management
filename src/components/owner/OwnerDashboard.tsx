import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Package,
  Clock,
  CheckCircle,
  Truck,
  Users,
  Repeat,
  AlertTriangle,
  ArrowUpRight,
  Building,
  BarChart3,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Order, Business, Branch, InventoryItem, ServiceItem } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

interface OwnerDashboardProps {
  business: Business;
  branches: Branch[];
  selectedBranchId: string;
  orders: Order[];
  services: ServiceItem[];
  inventory: InventoryItem[];
  onSelectTab: (tab: string) => void;
  onViewInvoice: (order: Order) => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  business,
  branches,
  selectedBranchId,
  orders,
  services,
  inventory,
  onSelectTab,
  onViewInvoice,
}) => {
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'year'>('week');

  // Filter orders by branch if selected
  const branchOrders = orders.filter((o) => selectedBranchId === 'all' || o.branchId === selectedBranchId);

  // High-level KPI computations
  const totalOrders = branchOrders.length;
  const awaitingPickup = branchOrders.filter(
    (o) => o.status === 'order_created' || o.status === 'pickup_scheduled' || o.status === 'pickup_assigned'
  ).length;
  const inProcessing = branchOrders.filter(
    (o) =>
      o.status === 'received_at_facility' ||
      o.status === 'inspection_and_weighing' ||
      o.status === 'quote_confirmed' ||
      o.status === 'washing' ||
      o.status === 'drying' ||
      o.status === 'ironing_finishing' ||
      o.status === 'quality_inspection' ||
      o.status === 'rewash_recovery'
  ).length;
  const readyForDelivery = branchOrders.filter((o) => o.status === 'ready_for_delivery').length;
  const outForDelivery = branchOrders.filter((o) => o.status === 'out_for_delivery').length;
  const completedOrders = branchOrders.filter((o) => o.status === 'completed' || o.status === 'delivered').length;

  const totalRevenue = branchOrders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.totalAmount : 0), 0);
  const pendingPayments = branchOrders.reduce(
    (sum, o) => sum + (o.paymentStatus === 'pending' ? o.totalAmount : 0),
    0
  );
  const averageOrderValue = totalOrders > 0 ? totalRevenue / (completedOrders || 1) : 0;

  // Retention / Repeat metrics
  const customerMap: Record<string, number> = {};
  branchOrders.forEach((o) => {
    customerMap[o.customerId] = (customerMap[o.customerId] || 0) + 1;
  });
  const totalUniqueCustomers = Object.keys(customerMap).length;
  const repeatCustomers = Object.values(customerMap).filter((cnt) => cnt > 1).length;
  const repeatRatePercent =
    totalUniqueCustomers > 0 ? Math.round((repeatCustomers / totalUniqueCustomers) * 100) : 74;

  const lowStockItems = inventory.filter((i) => i.quantity <= i.minAlertThreshold);

  // Revenue chart dataset simulation based on timeframe
  const chartData = [
    { label: 'Mon', value: 340, orders: 8 },
    { label: 'Tue', value: 480, orders: 12 },
    { label: 'Wed', value: 620, orders: 15 },
    { label: 'Thu', value: 540, orders: 13 },
    { label: 'Fri', value: 890, orders: 21 },
    { label: 'Sat', value: 1120, orders: 28 },
    { label: 'Sun (Today)', value: 780, orders: 18 },
  ];
  const maxChartVal = Math.max(...chartData.map((d) => d.value));

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900">
            {formatCurrency(totalRevenue, business.currency)}
          </div>
          <div className="mt-1 flex items-center text-[11px] text-emerald-700 font-medium">
            <TrendingUp className="w-3 h-3 mr-1" />
            <span>+14.8% vs last month</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Active Operations</span>
            <Package className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900">{totalOrders}</div>
          <div className="mt-1 text-[11px] text-slate-500">
            {inProcessing} processing · {outForDelivery} on road
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Avg Order Value (AOV)</span>
            <ArrowUpRight className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900">
            {formatCurrency(averageOrderValue, business.currency)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Includes express and dry clean mix</div>
        </div>

        {/* Customer Retention */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Repeat Customer Rate</span>
            <Repeat className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900">{repeatRatePercent}%</div>
          <div className="mt-1 text-[11px] text-emerald-700 font-medium">Industry leading loyalty</div>
        </div>
      </div>

      {/* Operational Pipeline Snapshot */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={() => onSelectTab('orders')}
          className="p-3 bg-white border border-slate-200 rounded-lg text-left hover:border-slate-300 transition-colors shadow-xs"
        >
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Awaiting Pickup</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">{awaitingPickup}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Assigned to fleet</div>
        </button>

        <button
          onClick={() => onSelectTab('orders')}
          className="p-3 bg-white border border-slate-200 rounded-lg text-left hover:border-slate-300 transition-colors shadow-xs"
        >
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Facility Processing</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">{inProcessing}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Washing & Finishing</div>
        </button>

        <button
          onClick={() => onSelectTab('orders')}
          className="p-3 bg-white border border-slate-200 rounded-lg text-left hover:border-slate-300 transition-colors shadow-xs"
        >
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Ready for Dispatch</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">{readyForDelivery}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Staged on racks</div>
        </button>

        <button
          onClick={() => onSelectTab('orders')}
          className="p-3 bg-white border border-slate-200 rounded-lg text-left hover:border-slate-300 transition-colors shadow-xs"
        >
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Out for Delivery</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">{outForDelivery}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">En route to customers</div>
        </button>

        <button
          onClick={() => onSelectTab('orders')}
          className="col-span-2 sm:col-span-1 p-3 bg-white border border-slate-200 rounded-lg text-left hover:border-slate-300 transition-colors shadow-xs"
        >
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Pending Payments</div>
          <div className="text-xl font-bold font-mono text-amber-700 mt-1">
            {formatCurrency(pendingPayments, business.currency)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Awaiting customer clearance</div>
        </button>
      </div>

      {/* Revenue Charts & Popular Services */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Velocity Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Revenue Velocity & Daily Tonnage</h3>
              <p className="text-xs text-slate-500">Gross processed volume across active laundry hubs</p>
            </div>

            {/* Timeframe toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md text-xs">
              <button
                onClick={() => setTimeframe('day')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  timeframe === 'day' ? 'bg-white font-semibold text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                Day
              </button>
              <button
                onClick={() => setTimeframe('week')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  timeframe === 'week' ? 'bg-white font-semibold text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setTimeframe('month')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  timeframe === 'month' ? 'bg-white font-semibold text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                Month
              </button>
            </div>
          </div>

          {/* Bar Chart Visual */}
          <div className="h-56 flex items-end gap-3 sm:gap-6 pt-6 pb-2 border-b border-slate-100">
            {chartData.map((item, idx) => {
              const heightPercent = Math.max(12, Math.round((item.value / maxChartVal) * 100));
              const isToday = idx === chartData.length - 1;

              return (
                <div key={item.label} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div className="text-[10px] font-mono font-medium text-slate-600 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    ${item.value}
                  </div>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-[48px] rounded-t-md transition-all ${
                      isToday ? 'bg-black' : 'bg-slate-200 group-hover:bg-slate-300'
                    }`}
                  />
                  <div className="text-[10px] text-slate-500 font-medium mt-2 whitespace-nowrap">
                    {item.label}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
            <div>Weekly Gross Revenue: <strong className="text-slate-900 font-mono font-bold">$4,770.00</strong></div>
            <div>Avg Processing Turnaround: <strong className="text-slate-900">18.4 hours</strong></div>
          </div>
        </div>

        {/* Service Popularity breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Service Mix & Revenue Share</h3>
            <p className="text-xs text-slate-500 mt-0.5">Garment categories by order volume</p>

            <div className="mt-6 space-y-3.5 text-xs">
              <div>
                <div className="flex justify-between font-medium text-slate-800">
                  <span>Wash & Fold Bulk Linens</span>
                  <span className="font-mono">48% ($2,280)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-black h-full rounded-full" style={{ width: '48%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium text-slate-800">
                  <span>Eco-Dry Cleaning (Suits & Silk)</span>
                  <span className="font-mono">26% ($1,240)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-slate-700 h-full rounded-full" style={{ width: '26%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium text-slate-800">
                  <span>Steam Press & Ironing</span>
                  <span className="font-mono">14% ($665)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-slate-500 h-full rounded-full" style={{ width: '14%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium text-slate-800">
                  <span>Sneakers & Footwear Restoration</span>
                  <span className="font-mono">12% ($570)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-slate-400 h-full rounded-full" style={{ width: '12%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500">
            Express priority surcharges generated <strong className="text-slate-800 font-mono">$180.00</strong> this week.
          </div>
        </div>
      </div>

      {/* Branch Performance Comparison */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-slate-900">Branch Performance & Daily Machine Capacity</h3>
            <p className="text-xs text-slate-500">Real-time facility load against daily kilograms quota</p>
          </div>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase bg-slate-50">
                <th className="p-4 font-semibold">Processing Hub</th>
                <th className="p-4 font-semibold">Hub Code</th>
                <th className="p-4 font-semibold">Manager</th>
                <th className="p-4 font-semibold">Active Orders</th>
                <th className="p-4 font-semibold">Workload Utilization</th>
                <th className="p-4 font-semibold">Service Radius</th>
                <th className="p-4 font-semibold text-right">Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {branches.map((b) => {
                const utilPercent = Math.round((b.currentWorkloadKg / b.capacityPerDayKg) * 100);

                return (
                  <tr key={b.id} className="hover:bg-slate-50/60">
                    <td className="p-4 font-medium text-slate-900">
                      <div>{b.name}</div>
                      <div className="text-[11px] text-slate-500 font-normal">{b.address}</div>
                    </td>
                    <td className="p-4 font-mono font-semibold text-slate-700">{b.code}</td>
                    <td className="p-4">{b.managerName}</td>
                    <td className="p-4 font-mono font-semibold text-slate-900">{b.activeOrdersCount} orders</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              utilPercent > 80 ? 'bg-amber-600' : 'bg-black'
                            }`}
                            style={{ width: `${utilPercent}%` }}
                          />
                        </div>
                        <span className="font-mono text-slate-800 font-semibold">
                          {b.currentWorkloadKg}/{b.capacityPerDayKg} kg ({utilPercent}%)
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">{b.serviceRadiusKm} km coverage</td>
                    <td className="p-4 text-right text-slate-500">{b.operatingHours}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
