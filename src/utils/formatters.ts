import { OrderStatus, PaymentStatus, ServiceCategory, UserRole } from '../types';

export const ORDER_LIFECYCLE_STEPS: { status: OrderStatus; label: string; stepNumber: number }[] = [
  { status: 'order_created', label: 'Order Created', stepNumber: 1 },
  { status: 'pickup_scheduled', label: 'Pickup Scheduled', stepNumber: 2 },
  { status: 'pickup_assigned', label: 'Pickup Assigned', stepNumber: 3 },
  { status: 'picked_up', label: 'Picked Up', stepNumber: 4 },
  { status: 'received_at_facility', label: 'Received at Facility', stepNumber: 5 },
  { status: 'inspection_and_weighing', label: 'Inspection & Weighing', stepNumber: 6 },
  { status: 'quote_confirmed', label: 'Quote Confirmed', stepNumber: 7 },
  { status: 'payment_pending', label: 'Payment Pending', stepNumber: 8 },
  { status: 'washing', label: 'Washing Cycle', stepNumber: 9 },
  { status: 'drying', label: 'Drying Cycle', stepNumber: 10 },
  { status: 'ironing_finishing', label: 'Ironing & Finishing', stepNumber: 11 },
  { status: 'quality_inspection', label: 'Quality Inspection', stepNumber: 12 },
  { status: 'ready_for_delivery', label: 'Ready for Dispatch', stepNumber: 13 },
  { status: 'out_for_delivery', label: 'Out for Delivery', stepNumber: 14 },
  { status: 'delivered', label: 'Delivered', stepNumber: 15 },
  { status: 'completed', label: 'Order Completed', stepNumber: 16 },
];

export function getStatusStepIndex(status: OrderStatus): number {
  const found = ORDER_LIFECYCLE_STEPS.findIndex((s) => s.status === status);
  if (found !== -1) return found;
  if (status === 'rewash_recovery') return 8; // near washing
  return 0;
}

export function formatStatusLabel(status: OrderStatus): string {
  switch (status) {
    case 'order_created':
      return 'Order Placed';
    case 'pickup_scheduled':
      return 'Pickup Scheduled';
    case 'pickup_assigned':
      return 'Driver Assigned';
    case 'picked_up':
      return 'Picked Up';
    case 'received_at_facility':
      return 'Received at Facility';
    case 'inspection_and_weighing':
      return 'Inspection & Weighing';
    case 'quote_confirmed':
      return 'Quote Confirmed';
    case 'payment_pending':
      return 'Payment Pending';
    case 'washing':
      return 'Washing';
    case 'drying':
      return 'Drying';
    case 'ironing_finishing':
      return 'Steam Press & Finish';
    case 'quality_inspection':
      return 'Quality Check';
    case 'ready_for_delivery':
      return 'Ready for Delivery';
    case 'out_for_delivery':
      return 'Out for Delivery';
    case 'delivered':
      return 'Delivered';
    case 'completed':
      return 'Completed';
    case 'rewash_recovery':
      return 'Service Recovery (Rewash)';
    case 'cancelled':
      return 'Cancelled';
    case 'disputed':
      return 'Disputed';
    default:
      return status.replace(/_/g, ' ');
  }
}

export function formatCurrency(amount: number, currency: string = '$'): string {
  return `${currency}${amount.toFixed(2)}`;
}

export function formatRoleLabel(role: UserRole): string {
  switch (role) {
    case 'super_admin':
      return 'Super Admin';
    case 'business_owner':
      return 'Business Owner';
    case 'branch_manager':
      return 'Branch Manager';
    case 'laundry_staff':
      return 'Laundry Staff';
    case 'delivery_partner':
      return 'Delivery Partner';
    case 'customer':
      return 'Customer';
  }
}

export function formatCategoryLabel(category: ServiceCategory): string {
  switch (category) {
    case 'wash_fold':
      return 'Wash & Fold';
    case 'wash_iron':
      return 'Wash & Iron';
    case 'iron_only':
      return 'Ironing Only';
    case 'dry_clean':
      return 'Eco Dry Clean';
    case 'premium_care':
      return 'Couture & Woollens';
    case 'bedding_curtains':
      return 'Bedding & Curtains';
    case 'shoe_cleaning':
      return 'Sneakers & Shoes';
    case 'express':
      return 'Express Service';
  }
}

export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function formatDateOnly(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}
