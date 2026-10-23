import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  Calendar,
  Clock,
  MapPin,
  Tag,
  CheckCircle,
  AlertCircle,
  Zap,
  Sparkles,
} from 'lucide-react';
import { ServiceItem, User, Address, OrderItem, Business, Branch } from '../../types';
import { storageService } from '../../services/storageService';
import { formatCurrency } from '../../utils/formatters';

interface BookLaundryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  services: ServiceItem[];
  business: Business;
  branches: Branch[];
  onOrderCreated: (orderId: string) => void;
}

export const BookLaundryModal: React.FC<BookLaundryModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  services,
  business,
  branches,
  onOrderCreated,
}) => {
  // Service selections: serviceId -> quantity
  const [selectedServices, setSelectedServices] = useState<Record<string, number>>({
    srv_wash_fold: 5.0, // default 5kg
  });

  const [selectedBranchId, setSelectedBranchId] = useState(branches[0]?.id || 'branch_downtown');
  const [pickupDate, setPickupDate] = useState('2026-10-23');
  const [pickupWindow, setPickupWindow] = useState('09:00 AM - 11:00 AM');
  const [deliveryDate, setDeliveryDate] = useState('2026-10-25');
  const [deliveryWindow, setDeliveryWindow] = useState('04:00 PM - 06:00 PM');

  const [pickupStreet, setPickupStreet] = useState('742 Evergreen Terrace, Apt 4B');
  const [pickupCity, setPickupCity] = useState('San Francisco');
  const [pickupZip, setPickupZip] = useState('94107');
  const [pickupNotes, setPickupNotes] = useState('');

  const [isExpress, setIsExpress] = useState(false);
  const [stainTreatment, setStainTreatment] = useState(false);
  const [fragranceFree, setFragranceFree] = useState(false);
  const [hangDryOnly, setHangDryOnly] = useState(false);

  const [couponInput, setCouponInput] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'cash_on_delivery'>('card');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleQuantityChange = (serviceId: string, delta: number) => {
    setSelectedServices((prev) => {
      const current = prev[serviceId] || 0;
      const srv = services.find((s) => s.id === serviceId);
      const step = srv?.pricingModel === 'per_kg' ? 1.0 : 1;
      const updated = Math.max(0, Number((current + delta * step).toFixed(1)));
      if (updated === 0) {
        const copy = { ...prev };
        delete copy[serviceId];
        return copy;
      }
      return { ...prev, [serviceId]: updated };
    });
  };

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;
    const res = storageService.validateCoupon(couponInput, calculateSubtotal());
    if (res.valid) {
      setCouponDiscount(res.discountAmount);
      setAppliedCoupon(couponInput.toUpperCase());
      setCouponMsg({ text: res.message, isError: false });
    } else {
      setCouponDiscount(0);
      setAppliedCoupon(null);
      setCouponMsg({ text: res.message, isError: true });
    }
  };

  // Calculations
  const calculateSubtotal = () => {
    return Object.entries(selectedServices).reduce((sum, [srvId, qty]) => {
      const srv = services.find((s) => s.id === srvId);
      if (!srv) return sum;
      return sum + srv.basePrice * qty;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const expressFee = isExpress ? 15.0 : 0.0;
  const deliveryFee = subtotal > 35 ? 0.0 : 3.5;
  const taxAmount = Number(((subtotal * business.taxRatePercent) / 100).toFixed(2));
  const total = Math.max(0, Number((subtotal + expressFee + deliveryFee + taxAmount - couponDiscount).toFixed(2)));

  const estimatedTotalWeightKg = Object.entries(selectedServices).reduce((weight, [srvId, qty]) => {
    const srv = services.find((s) => s.id === srvId);
    if (!srv) return weight;
    if (srv.pricingModel === 'per_kg') return weight + qty;
    return weight + qty * 0.4; // estimate 0.4kg per garment item
  }, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(selectedServices).length === 0) {
      alert('Please select at least one laundry service.');
      return;
    }

    setIsSubmitting(true);

    const branch = branches.find((b) => b.id === selectedBranchId) || branches[0];

    const orderItems: OrderItem[] = Object.entries(selectedServices).map(([srvId, qty]) => {
      const srv = services.find((s) => s.id === srvId)!;
      return {
        id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        serviceId: srv.id,
        serviceName: srv.name,
        itemName: `${srv.name} package`,
        quantity: qty,
        unit: srv.unitLabel,
        unitPrice: srv.basePrice,
        subtotal: Number((srv.basePrice * qty).toFixed(2)),
        specialInstructions: [
          fragranceFree ? 'Hypoallergenic fragrance-free wash' : null,
          hangDryOnly ? 'Hang dry delicate fabrics only' : null,
          stainTreatment ? 'Special stain pre-treatment requested' : null,
        ]
          .filter(Boolean)
          .join(', '),
      };
    });

    const pickupAddress: Address = {
      id: `addr_${Date.now()}`,
      label: 'Home',
      street: pickupStreet,
      city: pickupCity,
      postalCode: pickupZip,
      instructions: pickupNotes,
    };

    const newOrder = storageService.createOrder({
      businessId: business.id,
      branchId: branch.id,
      branchName: branch.name,
      customerId: currentUser.id,
      customerName: currentUser.fullName,
      customerEmail: currentUser.email,
      customerPhone: currentUser.phone,
      pickupAddress,
      deliveryAddress: pickupAddress,
      pickupSlot: {
        date: pickupDate,
        window: pickupWindow,
      },
      deliverySlot: {
        date: deliveryDate,
        window: deliveryWindow,
      },
      orderType: 'doorstep',
      isExpress,
      items: orderItems,
      estimatedWeightKg: Number(estimatedTotalWeightKg.toFixed(1)),
      subtotal,
      discount: couponDiscount,
      couponCode: appliedCoupon || undefined,
      taxAmount,
      expressFee,
      deliveryFee,
      totalAmount: total,
      paymentMethod,
      stainTreatmentRequested: stainTreatment,
      fragranceFree,
      hangDryOnly,
    });

    setIsSubmitting(false);
    onClose();
    onOrderCreated(newOrder.id);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Book Doorstep Laundry Service</h2>
            <p className="text-xs text-slate-500">
              Select garments, customize care preferences, and schedule doorstep pickup
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 max-h-[78vh] overflow-y-auto space-y-6 text-xs">
          {/* Section 1: Choose Services */}
          <div>
            <div className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
              1. Select Services & Estimated Garments
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {services.map((srv) => {
                const qty = selectedServices[srv.id] || 0;
                const isSelected = qty > 0;

                return (
                  <div
                    key={srv.id}
                    className={`p-3.5 border rounded-lg transition-colors flex flex-col justify-between ${
                      isSelected ? 'border-slate-900 bg-slate-50/70' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold text-slate-900">{srv.name}</div>
                          <div className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{srv.description}</div>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <div className="font-mono font-semibold text-slate-900">
                            {formatCurrency(srv.basePrice, business.currency)}
                          </div>
                          <div className="text-[10px] text-slate-400">/{srv.unitLabel}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100">
                      <span className="text-[11px] text-slate-500">
                        {srv.turnaroundHours}h turnaround
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(srv.id, -1)}
                          className="w-7 h-7 rounded border border-slate-300 flex items-center justify-center hover:bg-slate-100 text-slate-600 disabled:opacity-30"
                          disabled={qty === 0}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-10 text-center font-mono font-semibold text-xs text-slate-900">
                          {qty} {srv.unitLabel}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(srv.id, 1)}
                          className="w-7 h-7 rounded border border-slate-300 flex items-center justify-center hover:bg-slate-100 text-slate-900"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Care Preferences */}
          <div className="pt-2 border-t border-slate-100">
            <div className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
              2. Special Fabric & Washing Instructions
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <label className="flex items-start gap-2 p-2.5 border border-slate-200 rounded-md cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={stainTreatment}
                  onChange={(e) => setStainTreatment(e.target.checked)}
                  className="mt-0.5 rounded text-black focus:ring-0"
                />
                <div>
                  <div className="font-medium text-slate-900">Stain Spot Treatment</div>
                  <div className="text-[10px] text-slate-500">Pre-treatment on collar/cuff stains</div>
                </div>
              </label>

              <label className="flex items-start gap-2 p-2.5 border border-slate-200 rounded-md cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={fragranceFree}
                  onChange={(e) => setFragranceFree(e.target.checked)}
                  className="mt-0.5 rounded text-black focus:ring-0"
                />
                <div>
                  <div className="font-medium text-slate-900">Hypoallergenic / Fragrance-Free</div>
                  <div className="text-[10px] text-slate-500">Zero artificial scents or dyes</div>
                </div>
              </label>

              <label className="flex items-start gap-2 p-2.5 border border-slate-200 rounded-md cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={hangDryOnly}
                  onChange={(e) => setHangDryOnly(e.target.checked)}
                  className="mt-0.5 rounded text-black focus:ring-0"
                />
                <div>
                  <div className="font-medium text-slate-900">Delicate Flat / Hang Dry</div>
                  <div className="text-[10px] text-slate-500">Air-dried without tumble dryer</div>
                </div>
              </label>
            </div>
          </div>

          {/* Section 3: Schedule Pickup & Delivery */}
          <div className="pt-2 border-t border-slate-100">
            <div className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
              3. Pickup & Delivery Timing
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Pickup */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="font-medium text-slate-900 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-600" />
                  Doorstep Pickup Slot
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs"
                    required
                  />
                  <select
                    value={pickupWindow}
                    onChange={(e) => setPickupWindow(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs"
                  >
                    <option>09:00 AM - 11:00 AM</option>
                    <option>11:00 AM - 01:00 PM</option>
                    <option>02:00 PM - 04:00 PM</option>
                    <option>05:00 PM - 07:00 PM</option>
                  </select>
                </div>
              </div>

              {/* Delivery */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="font-medium text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-600" />
                  Return Delivery Slot
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs"
                    required
                  />
                  <select
                    value={deliveryWindow}
                    onChange={(e) => setDeliveryWindow(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs"
                  >
                    <option>10:00 AM - 12:00 PM</option>
                    <option>01:00 PM - 03:00 PM</option>
                    <option>04:00 PM - 06:00 PM</option>
                    <option>07:00 PM - 09:00 PM</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Express checkbox */}
            <div className="mt-3">
              <label className="flex items-center gap-2 p-2.5 bg-amber-50/60 border border-amber-200 rounded-md cursor-pointer">
                <input
                  type="checkbox"
                  checked={isExpress}
                  onChange={(e) => setIsExpress(e.target.checked)}
                  className="rounded text-black focus:ring-0"
                />
                <div className="flex-1 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-600" />
                    <span className="font-semibold text-slate-900">Priority Express Service (Same-Day / Under 8 Hours)</span>
                  </div>
                  <span className="font-mono font-medium text-slate-800">+$15.00 surcharge</span>
                </div>
              </label>
            </div>
          </div>

          {/* Section 4: Address */}
          <div className="pt-2 border-t border-slate-100">
            <div className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
              4. Doorstep Address Details
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="Street Address, Apt / Suite / Locker"
                  value={pickupStreet}
                  onChange={(e) => setPickupStreet(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="City"
                  value={pickupCity}
                  onChange={(e) => setPickupCity(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs"
                  required
                />
                <input
                  type="text"
                  placeholder="Postal Code"
                  value={pickupZip}
                  onChange={(e) => setPickupZip(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs"
                  required
                />
              </div>
              <div className="sm:col-span-3">
                <input
                  type="text"
                  placeholder="Access notes: Gate code, concierge drop-off, ring bell..."
                  value={pickupNotes}
                  onChange={(e) => setPickupNotes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Promotional Coupon & Payment */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
                5. Promo Code
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. FRESHSTART20"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded text-xs uppercase"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium rounded text-xs"
                >
                  Apply
                </button>
              </div>
              {couponMsg && (
                <div
                  className={`mt-1 text-[11px] font-medium ${
                    couponMsg.isError ? 'text-red-600' : 'text-emerald-700'
                  }`}
                >
                  {couponMsg.text}
                </div>
              )}
              <div className="text-[10px] text-slate-400 mt-1">Try codes: FRESHSTART20 or BULKWASH10</div>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
                Payment Option
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 p-2 border border-slate-200 rounded cursor-pointer hover:bg-slate-50">
                  <input
                    type="radio"
                    name="pay"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="text-black"
                  />
                  <span className="font-medium text-slate-800">Credit / Debit Card (Online)</span>
                </label>
                <label className="flex items-center gap-2 p-2 border border-slate-200 rounded cursor-pointer hover:bg-slate-50">
                  <input
                    type="radio"
                    name="pay"
                    checked={paymentMethod === 'upi'}
                    onChange={() => setPaymentMethod('upi')}
                    className="text-black"
                  />
                  <span className="font-medium text-slate-800">UPI / Digital Wallet</span>
                </label>
                <label className="flex items-center gap-2 p-2 border border-slate-200 rounded cursor-pointer hover:bg-slate-50">
                  <input
                    type="radio"
                    name="pay"
                    checked={paymentMethod === 'cash_on_delivery'}
                    onChange={() => setPaymentMethod('cash_on_delivery')}
                    className="text-black"
                  />
                  <span className="font-medium text-slate-800">Cash on Delivery / Card at Door</span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 6: Transparent Price Summary */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
            <div className="text-xs font-semibold text-slate-900 mb-2">Transparent Estimate Breakdown</div>
            <div className="flex justify-between text-slate-600">
              <span>Estimated Laundry Load</span>
              <span className="font-medium text-slate-800">~{estimatedTotalWeightKg.toFixed(1)} kg</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Services Subtotal</span>
              <span className="font-mono">{formatCurrency(subtotal, business.currency)}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Discount ({appliedCoupon})</span>
                <span className="font-mono">-{formatCurrency(couponDiscount, business.currency)}</span>
              </div>
            )}
            {isExpress && (
              <div className="flex justify-between text-slate-600">
                <span>Priority Turnaround</span>
                <span className="font-mono">{formatCurrency(expressFee, business.currency)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Doorstep Pickup & Delivery</span>
              <span className="font-mono">
                {deliveryFee === 0 ? 'FREE (Orders over $35)' : formatCurrency(deliveryFee, business.currency)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Estimated Tax ({business.taxRatePercent}%)</span>
              <span className="font-mono">{formatCurrency(taxAmount, business.currency)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-bold text-slate-900">
              <span>Estimated Total Due</span>
              <span className="font-mono">{formatCurrency(total, business.currency)}</span>
            </div>
            <div className="text-[10px] text-slate-500 pt-1 leading-normal">
              * Note: Weight will be verified on certified digital scales upon arrival at the facility. If the weight
              or garment count differs, an authorized quote adjustment will be presented for your approval prior to
              any extra payment.
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-700 font-medium rounded-md hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || Object.keys(selectedServices).length === 0}
              className="px-5 py-2 bg-black text-white font-medium rounded-md hover:bg-slate-800 shadow-xs transition-colors disabled:opacity-50"
            >
              Confirm & Schedule Pickup
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
