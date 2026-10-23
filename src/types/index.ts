export type UserRole =
  | 'super_admin'
  | 'business_owner'
  | 'branch_manager'
  | 'laundry_staff'
  | 'delivery_partner'
  | 'customer';

export type PricingModel = 'per_kg' | 'per_item' | 'package' | 'custom_quote';

export type ServiceCategory =
  | 'wash_fold'
  | 'wash_iron'
  | 'iron_only'
  | 'dry_clean'
  | 'premium_care'
  | 'bedding_curtains'
  | 'shoe_cleaning'
  | 'express';

export type OrderStatus =
  | 'order_created'
  | 'pickup_scheduled'
  | 'pickup_assigned'
  | 'picked_up'
  | 'received_at_facility'
  | 'inspection_and_weighing'
  | 'quote_confirmed'
  | 'payment_pending'
  | 'washing'
  | 'drying'
  | 'ironing_finishing'
  | 'quality_inspection'
  | 'ready_for_delivery'
  | 'out_for_delivery'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'failed_pickup'
  | 'rescheduled'
  | 'disputed'
  | 'rewash_recovery';

export type PaymentStatus = 'pending' | 'authorized' | 'paid' | 'refunded' | 'partially_refunded';

export type PaymentMethod = 'cash_on_delivery' | 'upi' | 'card' | 'wallet';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone: string;
  businessId?: string;
  branchId?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  phone: string;
  email: string;
  address: string;
  currency: string;
  taxRatePercent: number;
  plan: 'starter' | 'pro' | 'enterprise';
  status: 'active' | 'suspended';
  openingHours: string;
  createdAt: string;
}

export interface Branch {
  id: string;
  businessId: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  managerName: string;
  capacityPerDayKg: number;
  currentWorkloadKg: number;
  serviceRadiusKm: number;
  operatingHours: string;
  activeOrdersCount: number;
}

export interface ServiceItem {
  id: string;
  businessId: string;
  name: string;
  category: ServiceCategory;
  pricingModel: PricingModel;
  basePrice: number;
  turnaroundHours: number;
  description: string;
  minQuantity: number;
  unitLabel: string;
  isPopular?: boolean;
}

export interface OrderItem {
  id: string;
  serviceId: string;
  serviceName: string;
  itemName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  subtotal: number;
  specialInstructions?: string;
  stainNotes?: string;
  garmentCondition?: 'good' | 'stained' | 'torn' | 'missing_button';
}

export interface StatusHistoryEntry {
  status: OrderStatus;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  note?: string;
}

export interface QuoteAdjustment {
  originalTotal: number;
  revisedTotal: number;
  originalWeightKg: number;
  actualWeightKg: number;
  itemCountOriginal: number;
  itemCountActual: number;
  reason: string;
  adjustedAt: string;
  adjustedBy: string;
  customerApproved?: boolean;
  approvalTimestamp?: string;
}

export interface ProofOfDelivery {
  timestamp: string;
  recipientName: string;
  signatureUrl?: string;
  photoUrl?: string;
  notes?: string;
}

export interface Address {
  id: string;
  label: string; // e.g. "Home", "Office"
  street: string;
  city: string;
  postalCode: string;
  instructions?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. CL-2026-1049
  businessId: string;
  branchId: string;
  branchName: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  pickupAddress: Address;
  deliveryAddress: Address;
  pickupSlot: {
    date: string;
    window: string;
  };
  deliverySlot: {
    date: string;
    window: string;
  };
  orderType: 'doorstep' | 'walk_in';
  isExpress: boolean;
  items: OrderItem[];
  estimatedWeightKg: number;
  actualWeightKg?: number;
  status: OrderStatus;
  statusHistory: StatusHistoryEntry[];
  pickupDriverId?: string;
  pickupDriverName?: string;
  deliveryDriverId?: string;
  deliveryDriverName?: string;
  subtotal: number;
  discount: number;
  couponCode?: string;
  taxAmount: number;
  expressFee: number;
  deliveryFee: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  quoteAdjustment?: QuoteAdjustment;
  proofOfDelivery?: ProofOfDelivery;
  stainTreatmentRequested?: boolean;
  fragranceFree?: boolean;
  hangDryOnly?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  orderNumber: string;
  businessId: string;
  branchId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  issuedDate: string;
  dueDate: string;
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }[];
  subtotal: number;
  discount: number;
  taxRatePercent: number;
  taxAmount: number;
  expressFee: number;
  deliveryFee: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
}

export interface StaffMember {
  id: string;
  businessId: string;
  branchId: string;
  branchName: string;
  name: string;
  email: string;
  phone: string;
  role: 'branch_manager' | 'laundry_staff' | 'delivery_partner';
  shift: 'morning' | 'evening' | 'night' | 'full_day';
  activeOrdersAssigned: number;
  performanceScore: number; // e.g. 4.9
  status: 'active' | 'on_leave' | 'inactive';
}

export interface DeliveryJob {
  id: string;
  orderId: string;
  orderNumber: string;
  businessId: string;
  branchId: string;
  type: 'pickup' | 'delivery';
  driverId: string;
  driverName: string;
  customerName: string;
  customerPhone: string;
  address: string;
  scheduledTime: string;
  status: 'assigned' | 'in_transit' | 'arrived' | 'completed' | 'failed';
  checklist: {
    id: string;
    label: string;
    completed: boolean;
  }[];
  notes?: string;
  proofNotes?: string;
  proofPhoto?: string;
  proofSignature?: string;
}

export interface InventoryItem {
  id: string;
  businessId: string;
  branchId: string;
  name: string;
  category: 'detergent' | 'softener' | 'bleach' | 'packaging' | 'hangers' | 'tags';
  quantity: number;
  unit: 'liters' | 'kg' | 'units' | 'rolls' | 'boxes';
  minAlertThreshold: number;
  costPerUnit: number;
  supplierName: string;
  lastRestockedDate: string;
}

export interface InventoryMovement {
  id: string;
  itemId: string;
  itemName: string;
  businessId: string;
  branchId: string;
  type: 'consumption' | 'restock' | 'adjustment' | 'waste';
  quantity: number;
  recordedBy: string;
  timestamp: string;
  notes: string;
}

export interface Coupon {
  id: string;
  businessId: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  expiresAt: string;
  usageCount: number;
  maxUsage: number;
  isActive: boolean;
}

export interface SubscriptionPlan {
  id: string;
  businessId: string;
  name: string;
  pricePerMonth: number;
  includedKgPerMonth: number;
  freePickupsCount: number;
  discountPercent: number;
  features: string[];
  isPopular?: boolean;
}

export interface SupportTicket {
  id: string;
  businessId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  orderId?: string;
  orderNumber?: string;
  subject: string;
  category: 'damaged_item' | 'missing_item' | 'delivery_delay' | 'quality_issue' | 'billing' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: string;
  messages: {
    id: string;
    senderId: string;
    senderName: string;
    senderRole: UserRole;
    text: string;
    timestamp: string;
  }[];
  resolutionNotes?: string;
  refundClaimedAmount?: number;
  refundApprovedAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  businessId: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  targetType: 'order' | 'quote' | 'inventory' | 'payment' | 'staff' | 'business';
  targetId: string;
  timestamp: string;
  details: string;
}
