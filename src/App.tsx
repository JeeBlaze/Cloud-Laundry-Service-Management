import React, { useState, useEffect } from 'react';
import {
  Layers,
  LayoutDashboard,
  Package,
  Users,
  Tag,
  Box,
  LifeBuoy,
  Database,
  Building2,
  Sparkles,
  ArrowRight,
  Shield,
  Truck,
  Scale,
  UserCheck,
} from 'lucide-react';
import { storageService } from './services/storageService';
import {
  User,
  UserRole,
  Business,
  Branch,
  Order,
  ServiceItem,
  StaffMember,
  DeliveryJob,
  InventoryItem,
  Coupon,
  SubscriptionPlan,
  SupportTicket,
  AuditLog,
} from './types';
import { Navbar } from './components/Navbar';
import { CloudAdapterModal } from './components/CloudAdapterModal';
import { InvoiceModal } from './components/InvoiceModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';

// Role-specific screens
import { CustomerPortal } from './components/customer/CustomerPortal';
import { StaffWorkstation } from './components/staff/StaffWorkstation';
import { DriverPortal } from './components/driver/DriverPortal';
import { OwnerDashboard } from './components/owner/OwnerDashboard';
import { OrdersTable } from './components/owner/OrdersTable';
import { PricingConfigurator } from './components/owner/PricingConfigurator';
import { StaffManager } from './components/owner/StaffManager';
import { InventoryView } from './components/owner/InventoryView';
import { CustomerSupportView } from './components/customer/CustomerSupportView';
import { SuperAdminDashboard } from './components/superadmin/SuperAdminDashboard';
import { formatRoleLabel } from './utils/formatters';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(storageService.getCurrentUser());
  const [businesses, setBusinesses] = useState<Business[]>(storageService.getBusinesses());
  const [branches, setBranches] = useState<Branch[]>(storageService.getBranches());
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [services, setServices] = useState<ServiceItem[]>(storageService.getServices());
  const [orders, setOrders] = useState<Order[]>(storageService.getOrders());
  const [staff, setStaff] = useState<StaffMember[]>(storageService.getStaff());
  const [deliveryJobs, setDeliveryJobs] = useState<DeliveryJob[]>(storageService.getDeliveryJobs());
  const [inventory, setInventory] = useState<InventoryItem[]>(storageService.getInventory());
  const [coupons, setCoupons] = useState<Coupon[]>(storageService.getCoupons());
  const [plans, setPlans] = useState<SubscriptionPlan[]>(storageService.getPlans());
  const [tickets, setTickets] = useState<SupportTicket[]>(storageService.getTickets());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(storageService.getAuditLogs());

  // UI state
  const [ownerActiveTab, setOwnerActiveTab] = useState<'dashboard' | 'orders' | 'inventory' | 'pricing' | 'staff' | 'tickets'>('dashboard');
  const [activeInvoiceOrder, setActiveInvoiceOrder] = useState<Order | null>(null);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Subscribe to storage changes
  useEffect(() => {
    const unsubscribe = storageService.subscribe(() => {
      setCurrentUser(storageService.getCurrentUser());
      setBusinesses(storageService.getBusinesses());
      setBranches(storageService.getBranches());
      setServices(storageService.getServices());
      setOrders(storageService.getOrders());
      setStaff(storageService.getStaff());
      setDeliveryJobs(storageService.getDeliveryJobs());
      setInventory(storageService.getInventory());
      setCoupons(storageService.getCoupons());
      setPlans(storageService.getPlans());
      setTickets(storageService.getTickets());
      setAuditLogs(storageService.getAuditLogs());
    });
    return unsubscribe;
  }, []);

  const currentBusiness = businesses.find((b) => b.id === currentUser.businessId) || businesses[0];
  const activeBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];

  const handleRoleQuickSwitch = (role: UserRole) => {
    storageService.switchRole(role);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 font-sans flex flex-col selection:bg-slate-900 selection:text-white pb-24">
      {/* Global Navbar */}
      <Navbar
        currentUser={currentUser}
        branches={branches}
        selectedBranchId={selectedBranchId}
        onSelectBranch={(id) => setSelectedBranchId(id)}
        onOpenCloudDrawer={() => setIsCloudModalOpen(true)}
        onSearchClick={() => setIsSearchOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Role: Customer */}
        {currentUser.role === 'customer' && (
          <CustomerPortal
            currentUser={currentUser}
            business={currentBusiness}
            branches={branches}
            services={services}
            orders={orders}
            plans={plans}
            tickets={tickets}
            onViewInvoice={(o) => setActiveInvoiceOrder(o)}
          />
        )}

        {/* Role: Laundry Staff */}
        {currentUser.role === 'laundry_staff' && (
          <StaffWorkstation
            currentUser={currentUser}
            business={currentBusiness}
            branch={activeBranch}
            orders={orders}
            onViewInvoice={(o) => setActiveInvoiceOrder(o)}
          />
        )}

        {/* Role: Delivery Partner */}
        {currentUser.role === 'delivery_partner' && (
          <DriverPortal
            currentUser={currentUser}
            business={currentBusiness}
            deliveryJobs={deliveryJobs}
            orders={orders}
            onViewInvoice={(o) => setActiveInvoiceOrder(o)}
          />
        )}

        {/* Role: Business Owner or Branch Manager */}
        {(currentUser.role === 'business_owner' || currentUser.role === 'branch_manager') && (
          <div className="space-y-6">
            {/* Owner Navigation Tabs */}
            <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-px">
              <button
                onClick={() => setOwnerActiveTab('dashboard')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                  ownerActiveTab === 'dashboard'
                    ? 'border-black text-black font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Executive Analytics</span>
              </button>

              <button
                onClick={() => setOwnerActiveTab('orders')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                  ownerActiveTab === 'orders'
                    ? 'border-black text-black font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Orders & Processing ({orders.length})</span>
              </button>

              <button
                onClick={() => setOwnerActiveTab('pricing')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                  ownerActiveTab === 'pricing'
                    ? 'border-black text-black font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Pricing & Catalog</span>
              </button>

              <button
                onClick={() => setOwnerActiveTab('inventory')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                  ownerActiveTab === 'inventory'
                    ? 'border-black text-black font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>Inventory & Supplies</span>
              </button>

              <button
                onClick={() => setOwnerActiveTab('staff')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                  ownerActiveTab === 'staff'
                    ? 'border-black text-black font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Staff & Shift Rosters</span>
              </button>

              <button
                onClick={() => setOwnerActiveTab('tickets')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                  ownerActiveTab === 'tickets'
                    ? 'border-black text-black font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <LifeBuoy className="w-3.5 h-3.5" />
                <span>Support Tickets ({tickets.length})</span>
              </button>
            </div>

            {/* Active Owner View Content */}
            {ownerActiveTab === 'dashboard' && (
              <OwnerDashboard
                business={currentBusiness}
                branches={branches}
                selectedBranchId={selectedBranchId}
                orders={orders}
                services={services}
                inventory={inventory}
                onSelectTab={(tab) => setOwnerActiveTab(tab as any)}
                onViewInvoice={(o) => setActiveInvoiceOrder(o)}
              />
            )}

            {ownerActiveTab === 'orders' && (
              <OrdersTable
                orders={orders}
                business={currentBusiness}
                branches={branches}
                selectedBranchId={selectedBranchId}
                onViewInvoice={(o) => setActiveInvoiceOrder(o)}
              />
            )}

            {ownerActiveTab === 'pricing' && (
              <PricingConfigurator
                business={currentBusiness}
                services={services}
                coupons={coupons}
                currentUser={currentUser}
              />
            )}

            {ownerActiveTab === 'inventory' && (
              <InventoryView
                business={currentBusiness}
                branch={activeBranch}
                inventory={inventory}
                currentUser={currentUser}
              />
            )}

            {ownerActiveTab === 'staff' && (
              <StaffManager
                business={currentBusiness}
                branches={branches}
                staff={staff}
                currentUser={currentUser}
              />
            )}

            {ownerActiveTab === 'tickets' && (
              <CustomerSupportView
                currentUser={currentUser}
                business={currentBusiness}
                tickets={tickets}
                orders={orders}
              />
            )}
          </div>
        )}

        {/* Role: Super Administrator */}
        {currentUser.role === 'super_admin' && (
          <SuperAdminDashboard
            businesses={businesses}
            branches={branches}
            auditLogs={auditLogs}
            currentUser={currentUser}
          />
        )}
      </main>

      {/* Floating Role Quick Switcher Dock (Apple-style discrete switcher) */}
      <footer className="fixed bottom-3 left-1/2 -translate-x-1/2 z-30 bg-slate-900/95 text-white backdrop-blur-md px-3 py-2 rounded-full shadow-2xl border border-slate-700/60 flex items-center gap-1.5 text-xs">
        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider px-2 border-r border-slate-700 hidden sm:inline">
          Test Role
        </span>

        <button
          onClick={() => handleRoleQuickSwitch('customer')}
          className={`px-3 py-1 rounded-full font-medium transition-colors ${
            currentUser.role === 'customer'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          Customer
        </button>

        <button
          onClick={() => handleRoleQuickSwitch('laundry_staff')}
          className={`px-3 py-1 rounded-full font-medium transition-colors ${
            currentUser.role === 'laundry_staff'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          Laundry Staff
        </button>

        <button
          onClick={() => handleRoleQuickSwitch('delivery_partner')}
          className={`px-3 py-1 rounded-full font-medium transition-colors ${
            currentUser.role === 'delivery_partner'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          Delivery Courier
        </button>

        <button
          onClick={() => handleRoleQuickSwitch('branch_manager')}
          className={`px-3 py-1 rounded-full font-medium transition-colors ${
            currentUser.role === 'branch_manager'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          Branch Manager
        </button>

        <button
          onClick={() => handleRoleQuickSwitch('business_owner')}
          className={`px-3 py-1 rounded-full font-medium transition-colors ${
            currentUser.role === 'business_owner'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          Business Owner
        </button>

        <button
          onClick={() => handleRoleQuickSwitch('super_admin')}
          className={`px-3 py-1 rounded-full font-medium transition-colors ${
            currentUser.role === 'super_admin'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          Super Admin
        </button>
      </footer>

      {/* Global Invoice / Printable Receipt Modal */}
      <InvoiceModal
        order={activeInvoiceOrder}
        business={currentBusiness}
        branch={activeBranch}
        onClose={() => setActiveInvoiceOrder(null)}
      />

      {/* Cloud Adapter Modal */}
      <CloudAdapterModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
      />

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        orders={orders}
        services={services}
        inventory={inventory}
        onSelectOrder={(o) => {
          setActiveInvoiceOrder(o);
        }}
      />
    </div>
  );
}
