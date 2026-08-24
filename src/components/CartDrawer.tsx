import React from 'react';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck } from 'lucide-react';
import { CartItem } from '../types';
import { computeCartTotals } from '../lib/supabaseDB';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
  onBrowse?: () => void;
  isDarkMode?: boolean;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
  onBrowse,
  isDarkMode = true
}) => {
  if (!isOpen) return null;

  const { subtotal, deliveryFee, grandTotal } = computeCartTotals(items);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-md h-full shadow-2xl flex flex-col justify-between transition-all ${
        isDarkMode ? 'bg-slate-900 text-white border-l border-slate-800' : 'bg-white text-slate-900 border-l border-slate-200'
      }`}>
        {/* Cart Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Shopping Cart</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{items.length} {items.length === 1 ? 'item' : 'items'} selected</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-full transition ${
              isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-3">
              <ShoppingBag className="w-12 h-12 mx-auto opacity-30" />
              <p className="font-bold text-sm">Your cart is empty.</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">Browse products and services from Pakistani businesses and add items to your cart!</p>
              {onBrowse && (
                <button
                  onClick={onBrowse}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs inline-flex items-center gap-2"
                >
                  Browse Products
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border flex items-center gap-3 transition ${
                  isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                {item.image ? (
                  <img src={item.image} alt={item.productName} className="w-16 h-16 rounded-xl object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-emerald-500 text-xs">
                    PKR
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-emerald-500 font-bold truncate">{item.businessName}</div>
                  <h4 className="font-bold text-xs truncate leading-snug">{item.productName}</h4>
                  <div className="text-xs font-black text-slate-900 dark:text-white mt-1">
                    PKR {(item.price * item.quantity).toLocaleString()}
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      className="p-1 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold px-2">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, 1)}
                      className="p-1 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="p-2 text-slate-400 hover:text-red-500 transition"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer & Summary */}
        {items.length > 0 && (
          <div className="p-6 border-t border-slate-200 dark:border-slate-800 space-y-4 bg-slate-50/50 dark:bg-slate-950/50">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Subtotal:</span>
                <span className="font-bold text-slate-900 dark:text-white">PKR {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Delivery / Courier Fee:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {deliveryFee === 0 ? <span className="text-emerald-500 uppercase font-black">FREE</span> : `PKR ${deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black pt-2 border-t border-slate-200 dark:border-slate-800">
                <span>Grand Total:</span>
                <span className="text-emerald-500 text-base">PKR {grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Protected by BizNest Guarantee & Direct Merchant Dispatch.</span>
            </div>

            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onClearCart}
              className="w-full text-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
