import React, { useState, useEffect } from 'react';
import { Search, X, Package, User, ShoppingBag, Box, ArrowRight } from 'lucide-react';
import { Order, ServiceItem, InventoryItem } from '../types';
import { formatCurrency } from '../utils/formatters';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  services: ServiceItem[];
  inventory: InventoryItem[];
  onSelectOrder: (order: Order) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  orders,
  services,
  inventory,
  onSelectOrder,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // toggle handled by parent
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const matchedOrders = q
    ? orders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.toLowerCase().includes(q)
      )
    : [];

  const matchedServices = q
    ? services.filter(
        (s) => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
      )
    : [];

  const matchedInventory = q
    ? inventory.filter((i) => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q))
    : [];

  const totalResults = matchedOrders.length + matchedServices.length + matchedInventory.length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden text-slate-900 text-xs">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-100">
          <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type order number (e.g. CL-1049), customer, service or supply..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600 mr-1">
              ✕
            </button>
          )}
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 border border-slate-200 rounded">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {!q ? (
            <div className="text-center py-8 text-slate-400">
              <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <div>Search for anything in Cloud Laundry</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Try searching "1049", "Suit", or "Detergent"</div>
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No results found for "<span className="font-semibold">{query}</span>"
            </div>
          ) : (
            <>
              {/* Orders */}
              {matchedOrders.length > 0 && (
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Orders ({matchedOrders.length})
                  </div>
                  <div className="space-y-1">
                    {matchedOrders.map((o) => (
                      <button
                        key={o.id}
                        onClick={() => {
                          onSelectOrder(o);
                          onClose();
                        }}
                        className="w-full text-left p-2.5 rounded-lg hover:bg-slate-50 flex items-center justify-between transition-colors border border-transparent hover:border-slate-200"
                      >
                        <div className="flex items-center gap-2.5">
                          <Package className="w-4 h-4 text-slate-500" />
                          <div>
                            <span className="font-mono font-bold text-slate-900">{o.orderNumber}</span>
                            <span className="text-slate-400 mx-1.5">·</span>
                            <span className="text-slate-700">{o.customerName}</span>
                          </div>
                        </div>
                        <div className="text-slate-500 text-[11px] font-mono">
                          {formatCurrency(o.totalAmount)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Services */}
              {matchedServices.length > 0 && (
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Services ({matchedServices.length})
                  </div>
                  <div className="space-y-1">
                    {matchedServices.map((s) => (
                      <div
                        key={s.id}
                        className="p-2.5 rounded-lg bg-slate-50 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <ShoppingBag className="w-4 h-4 text-slate-500" />
                          <div>
                            <div className="font-semibold text-slate-900">{s.name}</div>
                            <div className="text-[10px] text-slate-500">{s.category.replace('_', ' ')}</div>
                          </div>
                        </div>
                        <div className="font-mono font-semibold text-slate-900">
                          {formatCurrency(s.basePrice)}/{s.unitLabel}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Inventory */}
              {matchedInventory.length > 0 && (
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Supplies & Consumables ({matchedInventory.length})
                  </div>
                  <div className="space-y-1">
                    {matchedInventory.map((i) => (
                      <div
                        key={i.id}
                        className="p-2.5 rounded-lg bg-slate-50 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <Box className="w-4 h-4 text-slate-500" />
                          <div>
                            <div className="font-semibold text-slate-900">{i.name}</div>
                            <div className="text-[10px] text-slate-500">{i.supplierName}</div>
                          </div>
                        </div>
                        <div className="font-mono font-semibold text-slate-900">
                          {i.quantity} {i.unit} in stock
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
