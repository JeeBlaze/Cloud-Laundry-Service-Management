import React, { useState } from 'react';
import { Check, Sparkles, Shield, Zap } from 'lucide-react';
import { SubscriptionPlan, Business, User } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface CustomerSubscriptionsProps {
  plans: SubscriptionPlan[];
  business: Business;
  currentUser: User;
}

export const CustomerSubscriptions: React.FC<CustomerSubscriptionsProps> = ({
  plans,
  business,
  currentUser,
}) => {
  const [activePlanId, setActivePlanId] = useState<string | null>('plan_solo');
  const [subscribedNotice, setSubscribedNotice] = useState<string | null>(null);

  const handleSubscribe = (plan: SubscriptionPlan) => {
    setActivePlanId(plan.id);
    setSubscribedNotice(`Subscribed to "${plan.name}"! Recurring monthly billing active.`);
    setTimeout(() => setSubscribedNotice(null), 3500);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden p-6">
      <div className="max-w-2xl mx-auto text-center mb-8">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 bg-slate-100 px-3 py-1 rounded-full mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          Recurring Laundry Memberships
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Never Worry About Laundry Day Again</h2>
        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
          Predictable monthly plans with dedicated door-to-door courier pickups, guaranteed slot reservations, and
          up to 20% off dry cleaning. Cancel anytime.
        </p>
      </div>

      {subscribedNotice && (
        <div className="max-w-md mx-auto mb-6 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-medium text-emerald-800 text-center">
          ✓ {subscribedNotice}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan) => {
          const isCurrent = activePlanId === plan.id;

          return (
            <div
              key={plan.id}
              className={`p-6 rounded-xl border flex flex-col justify-between transition-all ${
                plan.isPopular
                  ? 'border-slate-900 bg-slate-50/50 shadow-md relative'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-semibold px-3 py-0.5 rounded-full uppercase tracking-wider">
                  Most Popular
                </div>
              )}

              <div>
                <h3 className="text-base font-bold text-slate-900">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold tracking-tight text-slate-900 font-mono">
                    {formatCurrency(plan.pricePerMonth, business.currency)}
                  </span>
                  <span className="text-xs text-slate-500">/month</span>
                </div>

                <div className="mt-2 text-xs text-slate-600">
                  Includes <strong>{plan.includedKgPerMonth} kg</strong> wash allowance &{' '}
                  <strong>{plan.freePickupsCount} free pickups</strong> monthly.
                </div>

                <div className="mt-6 pt-6 border-t border-slate-200/80 space-y-2.5 text-xs text-slate-700">
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-slate-900 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4">
                <button
                  onClick={() => handleSubscribe(plan)}
                  className={`w-full py-2 px-4 rounded-md text-xs font-semibold transition-colors shadow-xs ${
                    isCurrent
                      ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                      : plan.isPopular
                      ? 'bg-black text-white hover:bg-slate-800'
                      : 'bg-white border border-slate-300 text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  {isCurrent ? 'Current Active Plan' : 'Select Plan'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
