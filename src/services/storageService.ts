import {
  Business,
  Branch,
  User,
  ServiceItem,
  Order,
  OrderStatus,
  OrderItem,
  QuoteAdjustment,
  ProofOfDelivery,
  StaffMember,
  DeliveryJob,
  InventoryItem,
  InventoryMovement,
  Coupon,
  SubscriptionPlan,
  SupportTicket,
  AuditLog,
  Invoice,
  UserRole,
} from '../types';
import {
  INITIAL_BUSINESSES,
  INITIAL_BRANCHES,
  INITIAL_USERS,
  INITIAL_SERVICES,
  INITIAL_ORDERS,
  INITIAL_STAFF,
  INITIAL_DELIVERY_JOBS,
  INITIAL_INVENTORY,
  INITIAL_COUPONS,
  INITIAL_PLANS,
  INITIAL_TICKETS,
  INITIAL_AUDIT_LOGS,
} from './seedData';

const STORAGE_KEYS = {
  BUSINESSES: 'cloud_laundry_businesses_v1',
  BRANCHES: 'cloud_laundry_branches_v1',
  USERS: 'cloud_laundry_users_v1',
  CURRENT_USER_ID: 'cloud_laundry_current_user_id_v1',
  SERVICES: 'cloud_laundry_services_v1',
  ORDERS: 'cloud_laundry_orders_v1',
  STAFF: 'cloud_laundry_staff_v1',
  DELIVERY_JOBS: 'cloud_laundry_delivery_jobs_v1',
  INVENTORY: 'cloud_laundry_inventory_v1',
  INVENTORY_MOVEMENTS: 'cloud_laundry_inventory_movements_v1',
  COUPONS: 'cloud_laundry_coupons_v1',
  PLANS: 'cloud_laundry_plans_v1',
  TICKETS: 'cloud_laundry_tickets_v1',
  AUDIT_LOGS: 'cloud_laundry_audit_logs_v1',
  CONFIG: 'cloud_laundry_config_v1',
};

export interface AppConfig {
  adapterMode: 'development_adapter' | 'live_firebase';
  firebaseConfigured: boolean;
  apiKey?: string;
  projectId?: string;
  enableSoundEffects: boolean;
}

class StorageService {
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.initializeIfEmpty();
  }

  private initializeIfEmpty() {
    const rawUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!localStorage.getItem(STORAGE_KEYS.BUSINESSES) || (rawUsers && rawUsers.includes('jeevavilva'))) {
      this.resetToDefaults();
    }
  }

  public resetToDefaults() {
    localStorage.setItem(STORAGE_KEYS.BUSINESSES, JSON.stringify(INITIAL_BUSINESSES));
    localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(INITIAL_BRANCHES));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, 'usr_customer'); // default to Emily Watson
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(INITIAL_SERVICES));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(INITIAL_STAFF));
    localStorage.setItem(STORAGE_KEYS.DELIVERY_JOBS, JSON.stringify(INITIAL_DELIVERY_JOBS));
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(INITIAL_INVENTORY));
    localStorage.setItem(STORAGE_KEYS.INVENTORY_MOVEMENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(INITIAL_COUPONS));
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(INITIAL_PLANS));
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(INITIAL_TICKETS));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    localStorage.setItem(
      STORAGE_KEYS.CONFIG,
      JSON.stringify({
        adapterMode: 'development_adapter',
        firebaseConfigured: false,
        enableSoundEffects: true,
      } as AppConfig)
    );
    this.notify();
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error('Storage subscriber error:', err);
      }
    });
  }

  // Generic helpers
  private getItem<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private setItem<T>(key: string, value: T) {
    localStorage.setItem(key, JSON.stringify(value));
    this.notify();
  }

  // Users & Auth
  public getUsers(): User[] {
    return this.getItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  public getCurrentUser(): User {
    const users = this.getUsers();
    const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || 'usr_customer';
    return users.find((u) => u.id === currentId) || users[0];
  }

  public setCurrentUser(userId: string): User | undefined {
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, user.id);
      this.notify();
      return user;
    }
    return undefined;
  }

  public switchRole(role: UserRole): User {
    const users = this.getUsers();
    let target = users.find((u) => u.role === role);
    if (!target) {
      // create a mock persona for this role
      target = {
        id: `usr_${role}_${Date.now()}`,
        fullName: `${role.replace('_', ' ').toUpperCase()} Persona`,
        email: `${role}@cloudlaundry.io`,
        role,
        businessId: 'biz_purewash',
        branchId: 'branch_downtown',
        phone: '+1 (555) 999-0000',
        createdAt: new Date().toISOString(),
      };
      users.push(target);
      this.setItem(STORAGE_KEYS.USERS, users);
    }
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, target.id);
    this.notify();
    return target;
  }

  public createUser(userData: Omit<User, 'id' | 'createdAt'>): User {
    const users = this.getUsers();
    const newUser: User = {
      ...userData,
      id: `usr_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    this.setItem(STORAGE_KEYS.USERS, users);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, newUser.id);
    return newUser;
  }

  // Businesses & Branches
  public getBusinesses(): Business[] {
    return this.getItem<Business[]>(STORAGE_KEYS.BUSINESSES, INITIAL_BUSINESSES);
  }

  public getBusiness(id: string): Business | undefined {
    return this.getBusinesses().find((b) => b.id === id);
  }

  public updateBusiness(business: Business) {
    const list = this.getBusinesses().map((b) => (b.id === business.id ? business : b));
    this.setItem(STORAGE_KEYS.BUSINESSES, list);
    this.logAudit({
      businessId: business.id,
      actorRole: this.getCurrentUser().role,
      action: 'UPDATE_BUSINESS_PROFILE',
      targetType: 'business',
      targetId: business.id,
      details: `Updated details for ${business.name}`,
    });
  }

  public getBranches(businessId?: string): Branch[] {
    const branches = this.getItem<Branch[]>(STORAGE_KEYS.BRANCHES, INITIAL_BRANCHES);
    if (businessId) {
      return branches.filter((b) => b.businessId === businessId);
    }
    return branches;
  }

  public updateBranch(branch: Branch) {
    const list = this.getBranches().map((b) => (b.id === branch.id ? branch : b));
    this.setItem(STORAGE_KEYS.BRANCHES, list);
  }

  public createBranch(branch: Omit<Branch, 'id' | 'activeOrdersCount' | 'currentWorkloadKg'>): Branch {
    const branches = this.getBranches();
    const newBranch: Branch = {
      ...branch,
      id: `branch_${Date.now()}`,
      activeOrdersCount: 0,
      currentWorkloadKg: 0,
    };
    branches.push(newBranch);
    this.setItem(STORAGE_KEYS.BRANCHES, branches);
    return newBranch;
  }

  // Services
  public getServices(businessId?: string): ServiceItem[] {
    const list = this.getItem<ServiceItem[]>(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
    if (businessId) {
      return list.filter((s) => s.businessId === businessId);
    }
    return list;
  }

  public updateService(service: ServiceItem) {
    const list = this.getServices().map((s) => (s.id === service.id ? service : s));
    this.setItem(STORAGE_KEYS.SERVICES, list);
  }

  public createService(serviceData: Omit<ServiceItem, 'id'>): ServiceItem {
    const list = this.getServices();
    const newSrv: ServiceItem = {
      ...serviceData,
      id: `srv_${Date.now()}`,
    };
    list.push(newSrv);
    this.setItem(STORAGE_KEYS.SERVICES, list);
    return newSrv;
  }

  // Orders
  public getOrders(filters?: {
    businessId?: string;
    branchId?: string;
    customerId?: string;
    status?: OrderStatus;
    search?: string;
  }): Order[] {
    let orders = this.getItem<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);

    if (filters?.businessId) {
      orders = orders.filter((o) => o.businessId === filters.businessId);
    }
    if (filters?.branchId && filters.branchId !== 'all') {
      orders = orders.filter((o) => o.branchId === filters.branchId);
    }
    if (filters?.customerId) {
      orders = orders.filter((o) => o.customerId === filters.customerId);
    }
    if (filters?.status) {
      orders = orders.filter((o) => o.status === filters.status);
    }
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      orders = orders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.toLowerCase().includes(q) ||
          o.items.some((i) => i.serviceName.toLowerCase().includes(q) || i.itemName.toLowerCase().includes(q))
      );
    }

    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getOrder(orderId: string): Order | undefined {
    return this.getItem<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS).find((o) => o.id === orderId);
  }

  public createOrder(
    orderInput: Omit<
      Order,
      'id' | 'orderNumber' | 'status' | 'statusHistory' | 'createdAt' | 'updatedAt' | 'paymentStatus'
    >
  ): Order {
    const orders = this.getItem<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const orderNumber = `CL-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();
    const user = this.getCurrentUser();

    const newOrder: Order = {
      ...orderInput,
      id: `ord_${Date.now()}`,
      orderNumber,
      status: 'order_created',
      paymentStatus: 'pending',
      createdAt: now,
      updatedAt: now,
      statusHistory: [
        {
          status: 'order_created',
          timestamp: now,
          actorId: user.id,
          actorName: user.fullName,
          actorRole: user.role,
          note: 'Order successfully created with initial estimate.',
        },
      ],
    };

    orders.unshift(newOrder);
    this.setItem(STORAGE_KEYS.ORDERS, orders);

    this.logAudit({
      businessId: newOrder.businessId,
      actorRole: user.role,
      action: 'ORDER_CREATED',
      targetType: 'order',
      targetId: newOrder.id,
      details: `Created new order #${orderNumber} for ${newOrder.customerName}. Total: $${newOrder.totalAmount.toFixed(2)}`,
    });

    return newOrder;
  }

  public updateOrderStatus(orderId: string, nextStatus: OrderStatus, note?: string): Order | undefined {
    const orders = this.getItem<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const order = orders.find((o) => o.id === orderId);
    if (!order) return undefined;

    const user = this.getCurrentUser();
    const now = new Date().toISOString();

    order.status = nextStatus;
    order.updatedAt = now;
    order.statusHistory.push({
      status: nextStatus,
      timestamp: now,
      actorId: user.id,
      actorName: user.fullName,
      actorRole: user.role,
      note: note || `Transitioned order status to ${nextStatus.replace(/_/g, ' ')}`,
    });

    if (nextStatus === 'completed' && order.paymentStatus !== 'paid') {
      order.paymentStatus = 'paid';
    }

    this.setItem(STORAGE_KEYS.ORDERS, orders);

    this.logAudit({
      businessId: order.businessId,
      actorRole: user.role,
      action: `ORDER_STATUS_${nextStatus.toUpperCase()}`,
      targetType: 'order',
      targetId: order.id,
      details: note || `Updated order #${order.orderNumber} status to ${nextStatus}`,
    });

    return order;
  }

  public applyQuoteAdjustment(
    orderId: string,
    adjustment: {
      actualWeightKg: number;
      revisedItems: OrderItem[];
      reason: string;
    }
  ): Order | undefined {
    const orders = this.getItem<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const order = orders.find((o) => o.id === orderId);
    if (!order) return undefined;

    const user = this.getCurrentUser();
    const now = new Date().toISOString();

    const originalTotal = order.totalAmount;
    const newSubtotal = adjustment.revisedItems.reduce((acc, item) => acc + item.subtotal, 0);
    const business = this.getBusiness(order.businessId) || INITIAL_BUSINESSES[0];
    const taxRate = business.taxRatePercent / 100;
    const newTax = Number((newSubtotal * taxRate).toFixed(2));
    const newTotal = Number((newSubtotal + newTax + order.expressFee + order.deliveryFee - order.discount).toFixed(2));

    order.actualWeightKg = adjustment.actualWeightKg;
    order.items = adjustment.revisedItems;
    order.subtotal = newSubtotal;
    order.taxAmount = newTax;
    order.totalAmount = newTotal;
    order.status = 'inspection_and_weighing';
    order.updatedAt = now;

    order.quoteAdjustment = {
      originalTotal,
      revisedTotal: newTotal,
      originalWeightKg: order.estimatedWeightKg,
      actualWeightKg: adjustment.actualWeightKg,
      itemCountOriginal: order.items.length,
      itemCountActual: adjustment.revisedItems.length,
      reason: adjustment.reason,
      adjustedAt: now,
      adjustedBy: user.fullName,
      customerApproved: false,
    };

    order.statusHistory.push({
      status: 'inspection_and_weighing',
      timestamp: now,
      actorId: user.id,
      actorName: user.fullName,
      actorRole: user.role,
      note: `Facility inspection completed. Weight: ${adjustment.actualWeightKg}kg. Quote adjusted to $${newTotal.toFixed(2)}. Awaiting customer confirmation.`,
    });

    this.setItem(STORAGE_KEYS.ORDERS, orders);

    this.logAudit({
      businessId: order.businessId,
      actorRole: user.role,
      action: 'QUOTE_ADJUSTMENT_POSTED',
      targetType: 'quote',
      targetId: order.id,
      details: `Quote revised for #${order.orderNumber} from $${originalTotal.toFixed(2)} to $${newTotal.toFixed(2)}. Reason: ${adjustment.reason}`,
    });

    return order;
  }

  public approveQuoteAdjustment(orderId: string): Order | undefined {
    const orders = this.getItem<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const order = orders.find((o) => o.id === orderId);
    if (!order || !order.quoteAdjustment) return undefined;

    const user = this.getCurrentUser();
    const now = new Date().toISOString();

    order.quoteAdjustment.customerApproved = true;
    order.quoteAdjustment.approvalTimestamp = now;
    order.status = 'quote_confirmed';
    order.updatedAt = now;

    order.statusHistory.push({
      status: 'quote_confirmed',
      timestamp: now,
      actorId: user.id,
      actorName: user.fullName,
      actorRole: user.role,
      note: `Customer approved revised quotation of $${order.totalAmount.toFixed(2)}. Garments queued for washing.`,
    });

    this.setItem(STORAGE_KEYS.ORDERS, orders);

    this.logAudit({
      businessId: order.businessId,
      actorRole: user.role,
      action: 'QUOTE_APPROVED_BY_CUSTOMER',
      targetType: 'quote',
      targetId: order.id,
      details: `Customer approved quote adjustment of $${order.totalAmount.toFixed(2)} for #${order.orderNumber}`,
    });

    return order;
  }

  public recordPayment(orderId: string, paymentMethod: Order['paymentMethod']): Order | undefined {
    const orders = this.getItem<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const order = orders.find((o) => o.id === orderId);
    if (!order) return undefined;

    order.paymentStatus = 'paid';
    order.paymentMethod = paymentMethod;
    order.updatedAt = new Date().toISOString();

    this.setItem(STORAGE_KEYS.ORDERS, orders);

    this.logAudit({
      businessId: order.businessId,
      actorRole: this.getCurrentUser().role,
      action: 'PAYMENT_RECEIVED',
      targetType: 'payment',
      targetId: order.id,
      details: `Payment of $${order.totalAmount.toFixed(2)} recorded via ${paymentMethod} for #${order.orderNumber}`,
    });

    return order;
  }

  public completeDeliveryWithProof(
    orderId: string,
    proof: {
      recipientName: string;
      signatureUrl?: string;
      notes?: string;
    }
  ): Order | undefined {
    const orders = this.getItem<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const order = orders.find((o) => o.id === orderId);
    if (!order) return undefined;

    const user = this.getCurrentUser();
    const now = new Date().toISOString();

    order.proofOfDelivery = {
      timestamp: now,
      recipientName: proof.recipientName,
      signatureUrl: proof.signatureUrl,
      notes: proof.notes,
    };
    order.status = 'delivered';
    order.updatedAt = now;

    order.statusHistory.push({
      status: 'delivered',
      timestamp: now,
      actorId: user.id,
      actorName: user.fullName,
      actorRole: user.role,
      note: `Delivered to ${proof.recipientName}. ${proof.notes || ''}`,
    });

    this.setItem(STORAGE_KEYS.ORDERS, orders);

    // mark corresponding delivery job as completed
    const jobs = this.getDeliveryJobs().map((j) => {
      if (j.orderId === orderId && j.type === 'delivery') {
        return { ...j, status: 'completed' as const };
      }
      return j;
    });
    this.setItem(STORAGE_KEYS.DELIVERY_JOBS, jobs);

    return order;
  }

  // Delivery Jobs
  public getDeliveryJobs(driverId?: string): DeliveryJob[] {
    const list = this.getItem<DeliveryJob[]>(STORAGE_KEYS.DELIVERY_JOBS, INITIAL_DELIVERY_JOBS);
    if (driverId) {
      return list.filter((j) => j.driverId === driverId);
    }
    return list;
  }

  public updateJobStatus(jobId: string, status: DeliveryJob['status']) {
    const list = this.getDeliveryJobs().map((j) => (j.id === jobId ? { ...j, status } : j));
    this.setItem(STORAGE_KEYS.DELIVERY_JOBS, list);
  }

  public toggleJobChecklist(jobId: string, checklistId: string) {
    const list = this.getDeliveryJobs().map((j) => {
      if (j.id === jobId) {
        return {
          ...j,
          checklist: j.checklist.map((c) => (c.id === checklistId ? { ...c, completed: !c.completed } : c)),
        };
      }
      return j;
    });
    this.setItem(STORAGE_KEYS.DELIVERY_JOBS, list);
  }

  // Staff
  public getStaff(businessId?: string): StaffMember[] {
    const list = this.getItem<StaffMember[]>(STORAGE_KEYS.STAFF, INITIAL_STAFF);
    if (businessId) {
      return list.filter((s) => s.businessId === businessId);
    }
    return list;
  }

  public addStaff(staffData: Omit<StaffMember, 'id' | 'activeOrdersAssigned' | 'performanceScore'>): StaffMember {
    const list = this.getStaff();
    const newStaff: StaffMember = {
      ...staffData,
      id: `staff_${Date.now()}`,
      activeOrdersAssigned: 0,
      performanceScore: 5.0,
    };
    list.push(newStaff);
    this.setItem(STORAGE_KEYS.STAFF, list);
    return newStaff;
  }

  public updateStaff(staff: StaffMember) {
    const list = this.getStaff().map((s) => (s.id === staff.id ? staff : s));
    this.setItem(STORAGE_KEYS.STAFF, list);
  }

  // Inventory
  public getInventory(businessId?: string): InventoryItem[] {
    const list = this.getItem<InventoryItem[]>(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
    if (businessId) {
      return list.filter((i) => i.businessId === businessId);
    }
    return list;
  }

  public logInventoryMovement(movement: Omit<InventoryMovement, 'id' | 'timestamp' | 'recordedBy'>): InventoryMovement {
    const movements = this.getItem<InventoryMovement[]>(STORAGE_KEYS.INVENTORY_MOVEMENTS, []);
    const user = this.getCurrentUser();
    const now = new Date().toISOString();

    const newMov: InventoryMovement = {
      ...movement,
      id: `mov_${Date.now()}`,
      timestamp: now,
      recordedBy: user.fullName,
    };
    movements.unshift(newMov);
    this.setItem(STORAGE_KEYS.INVENTORY_MOVEMENTS, movements);

    // update item stock
    const items = this.getInventory();
    const item = items.find((i) => i.id === movement.itemId);
    if (item) {
      if (movement.type === 'consumption' || movement.type === 'waste') {
        item.quantity = Math.max(0, item.quantity - movement.quantity);
      } else if (movement.type === 'restock') {
        item.quantity += movement.quantity;
        item.lastRestockedDate = now.split('T')[0];
      } else if (movement.type === 'adjustment') {
        item.quantity = movement.quantity;
      }
      this.setItem(STORAGE_KEYS.INVENTORY, items);
    }

    return newMov;
  }

  public addInventoryItem(itemData: Omit<InventoryItem, 'id' | 'lastRestockedDate'>): InventoryItem {
    const items = this.getInventory();
    const newItem: InventoryItem = {
      ...itemData,
      id: `inv_${Date.now()}`,
      lastRestockedDate: new Date().toISOString().split('T')[0],
    };
    items.push(newItem);
    this.setItem(STORAGE_KEYS.INVENTORY, items);
    return newItem;
  }

  // Support Tickets
  public getTickets(customerId?: string): SupportTicket[] {
    let tickets = this.getItem<SupportTicket[]>(STORAGE_KEYS.TICKETS, INITIAL_TICKETS);
    if (customerId) {
      tickets = tickets.filter((t) => t.customerId === customerId);
    }
    return tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createTicket(
    ticketData: Omit<SupportTicket, 'id' | 'messages' | 'createdAt' | 'updatedAt' | 'status'> & {
      initialMessage: string;
    }
  ): SupportTicket {
    const tickets = this.getItem<SupportTicket[]>(STORAGE_KEYS.TICKETS, INITIAL_TICKETS);
    const user = this.getCurrentUser();
    const now = new Date().toISOString();

    const newTicket: SupportTicket = {
      id: `tkt_${Date.now()}`,
      businessId: ticketData.businessId,
      customerId: ticketData.customerId,
      customerName: ticketData.customerName,
      customerEmail: ticketData.customerEmail,
      orderId: ticketData.orderId,
      orderNumber: ticketData.orderNumber,
      subject: ticketData.subject,
      category: ticketData.category,
      priority: ticketData.priority,
      status: 'open',
      refundClaimedAmount: ticketData.refundClaimedAmount,
      messages: [
        {
          id: `msg_${Date.now()}`,
          senderId: user.id,
          senderName: user.fullName,
          senderRole: user.role,
          text: ticketData.initialMessage,
          timestamp: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    tickets.unshift(newTicket);
    this.setItem(STORAGE_KEYS.TICKETS, tickets);
    return newTicket;
  }

  public replyTicket(ticketId: string, text: string) {
    const tickets = this.getItem<SupportTicket[]>(STORAGE_KEYS.TICKETS, INITIAL_TICKETS);
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    const user = this.getCurrentUser();
    const now = new Date().toISOString();

    ticket.messages.push({
      id: `msg_${Date.now()}`,
      senderId: user.id,
      senderName: user.fullName,
      senderRole: user.role,
      text,
      timestamp: now,
    });
    ticket.updatedAt = now;

    if (ticket.status === 'open' && user.role !== 'customer') {
      ticket.status = 'in_progress';
      ticket.assignedTo = user.fullName;
    }

    this.setItem(STORAGE_KEYS.TICKETS, tickets);
  }

  public resolveTicket(ticketId: string, resolutionNotes: string, approvedRefund?: number) {
    const tickets = this.getItem<SupportTicket[]>(STORAGE_KEYS.TICKETS, INITIAL_TICKETS);
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    ticket.status = 'resolved';
    ticket.resolutionNotes = resolutionNotes;
    if (approvedRefund !== undefined) {
      ticket.refundApprovedAmount = approvedRefund;
    }
    ticket.updatedAt = new Date().toISOString();

    this.setItem(STORAGE_KEYS.TICKETS, tickets);
  }

  // Coupons
  public getCoupons(businessId?: string): Coupon[] {
    const list = this.getItem<Coupon[]>(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
    if (businessId) {
      return list.filter((c) => c.businessId === businessId);
    }
    return list;
  }

  public validateCoupon(code: string, subtotal: number): { valid: boolean; discountAmount: number; message: string } {
    const coupons = this.getCoupons();
    const match = coupons.find((c) => c.code.toUpperCase() === code.toUpperCase().trim() && c.isActive);

    if (!match) {
      return { valid: false, discountAmount: 0, message: 'Invalid or inactive promotional code.' };
    }
    if (subtotal < match.minOrderAmount) {
      return {
        valid: false,
        discountAmount: 0,
        message: `Requires minimum order amount of $${match.minOrderAmount.toFixed(2)}.`,
      };
    }

    let discountAmount = 0;
    if (match.discountType === 'percentage') {
      discountAmount = Number(((subtotal * match.discountValue) / 100).toFixed(2));
    } else {
      discountAmount = Math.min(match.discountValue, subtotal);
    }

    return { valid: true, discountAmount, message: `Coupon ${match.code} applied successfully!` };
  }

  // Subscription Plans
  public getPlans(businessId?: string): SubscriptionPlan[] {
    const list = this.getItem<SubscriptionPlan[]>(STORAGE_KEYS.PLANS, INITIAL_PLANS);
    if (businessId) {
      return list.filter((p) => p.businessId === businessId);
    }
    return list;
  }

  // Audit Logs
  public getAuditLogs(businessId?: string): AuditLog[] {
    let logs = this.getItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    if (businessId) {
      logs = logs.filter((l) => l.businessId === businessId);
    }
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public logAudit(logData: Omit<AuditLog, 'id' | 'timestamp' | 'actorId' | 'actorName'>) {
    const logs = this.getItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    const user = this.getCurrentUser();
    const newLog: AuditLog = {
      ...logData,
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      actorId: user.id,
      actorName: user.fullName,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    // keep max 200 logs
    if (logs.length > 200) logs.pop();
    this.setItem(STORAGE_KEYS.AUDIT_LOGS, logs);
  }

  // Invoices
  public generateInvoice(order: Order): Invoice {
    const business = this.getBusiness(order.businessId) || INITIAL_BUSINESSES[0];
    const invoiceNumber = `INV-${order.orderNumber.replace('CL-', '')}`;

    return {
      id: `inv_${order.id}`,
      invoiceNumber,
      orderId: order.id,
      orderNumber: order.orderNumber,
      businessId: order.businessId,
      branchId: order.branchId,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      customerAddress: `${order.deliveryAddress.street}, ${order.deliveryAddress.city}`,
      issuedDate: order.createdAt.split('T')[0],
      dueDate: order.deliverySlot.date,
      items: order.items.map((i) => ({
        name: `${i.serviceName} - ${i.itemName}`,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        amount: i.subtotal,
      })),
      subtotal: order.subtotal,
      discount: order.discount,
      taxRatePercent: business.taxRatePercent,
      taxAmount: order.taxAmount,
      expressFee: order.expressFee,
      deliveryFee: order.deliveryFee,
      total: order.totalAmount,
      amountPaid: order.paymentStatus === 'paid' ? order.totalAmount : 0,
      balanceDue: order.paymentStatus === 'paid' ? 0 : order.totalAmount,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
    };
  }

  // App Configuration
  public getConfig(): AppConfig {
    return this.getItem<AppConfig>(STORAGE_KEYS.CONFIG, {
      adapterMode: 'development_adapter',
      firebaseConfigured: false,
      enableSoundEffects: true,
    });
  }

  public updateConfig(config: Partial<AppConfig>) {
    const current = this.getConfig();
    const updated = { ...current, ...config };
    this.setItem(STORAGE_KEYS.CONFIG, updated);
  }

  // Export & Import
  public exportDataJSON(): string {
    const payload = {
      businesses: this.getBusinesses(),
      branches: this.getBranches(),
      users: this.getUsers(),
      services: this.getServices(),
      orders: this.getOrders(),
      staff: this.getStaff(),
      deliveryJobs: this.getDeliveryJobs(),
      inventory: this.getInventory(),
      tickets: this.getTickets(),
      auditLogs: this.getAuditLogs(),
      timestamp: new Date().toISOString(),
    };
    return JSON.stringify(payload, null, 2);
  }

  public exportOrdersCSV(): string {
    const orders = this.getOrders();
    const headers = [
      'Order Number',
      'Date',
      'Customer',
      'Phone',
      'Branch',
      'Status',
      'Total ($)',
      'Payment Status',
      'Payment Method',
    ];
    const rows = orders.map((o) => [
      o.orderNumber,
      o.createdAt.split('T')[0],
      `"${o.customerName}"`,
      `"${o.customerPhone}"`,
      `"${o.branchName}"`,
      o.status,
      o.totalAmount.toFixed(2),
      o.paymentStatus,
      o.paymentMethod,
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
}

export const storageService = new StorageService();
