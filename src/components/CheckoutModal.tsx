import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, Truck, Lock, AlertTriangle, Loader2 } from 'lucide-react';
import { CartItem, PaymentMethod, User } from '../types';

interface CheckoutDraft {
  paymentMethod: PaymentMethod;
  address: string;
  city: string;
  transactionRef?: string;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  user: User | null;
  /** Creates the order(s) in Supabase. payment_status is always 'pending'. */
  onPlaceOrder: (draft: CheckoutDraft) => Promise<{ success: boolean; error?: string }>;
  onRequireAuth: () => void;
  isDarkMode?: boolean;
}

/**
 * Secure checkout.
 * - Cash on Delivery is the only ENABLED payment method (all other gateways
 *   are honestly marked "Coming Soon" because no real payment gateway is
 *   integrated yet).
 * - payment_status is ALWAYS 'pending' — an order is never marked paid just
 *   because a user clicked a button.
 * - No hardcoded merchant account numbers / IBANs exist in this file.
 */
export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  user,
  onPlaceOrder,
  onRequireAuth,
  isDarkMode = true
}) => {
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('cod');

  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [city, setCity] = useState(user?.city || '');
  const [address, setAddress] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Keep the modal visible on the success screen even after the cart empties.
  if (!isOpen) return null;
  if (items.length === 0 && step !== 'success') return null;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal > 10000 ? 0 : 250;
  const grandTotal = subtotal + deliveryFee;

  const paymentOptions: { id: PaymentMethod; name: string; tag: string; icon: string; enabled: boolean }[] = [
    { id: 'cod', name: 'Cash on Delivery', tag: 'Pay at Doorstep', icon: '🚚', enabled: true },
    { id: 'easypaisa', name: 'Easypaisa', tag: 'Coming Soon', icon: '📲', enabled: false },
    { id: 'jazzcash', name: 'JazzCash', tag: 'Coming Soon', icon: '📱', enabled: false },
    { id: 'bank_transfer', name: 'Bank Transfer', tag: 'Coming Soon', icon: '🏛️', enabled: false },
    { id: 'raast', name: 'Raast Pay', tag: 'Coming Soon', icon: '⚡', enabled: false },
    { id: 'sadapay', name: 'SadaPay', tag: 'Coming Soon', icon: '💳', enabled: false },
    { id: 'nayapay', name: 'NayaPay', tag: 'Coming Soon', icon: '🌐', enabled: false },
    { id: 'binance_pay', name: 'Binance Pay', tag: 'Coming Soon', icon: '🟡', enabled: false },
  ];

  const validateDetails = (): boolean => {
    if (!fullName.trim()) {
      setFormError('Please enter the recipient full name.');
      return false;
    }
    if (!phone.trim()) {
      setFormError('Please enter a phone number for courier contact.');
      return false;
    }
    if (!city.trim()) {
      setFormError('Please enter your city.');
      return false;
    }
    if (!address.trim() || address.trim().length < 10) {
      setFormError('Please enter a complete street address (minimum 10 characters).');
      return false;
    }
    setFormError(null);
    return true;
  };

  const handleConfirmOrder = async () => {
    setSubmitting(true);
    setOrderError(null);

    const result = await onPlaceOrder({
      paymentMethod: 'cod',
      address: `${address.trim()} (Recipient: ${fullName.trim()}, Phone: ${phone.trim()}${email.trim() ? `, Email: ${email.trim()}` : ''})`,
      city: city.trim(),
    });

    setSubmitting(false);

    if (!result.success) {
      setOrderError(result.error || 'Order could not be placed. Please try again.');
      return;
    }

    setStep('success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className={`w-full max-w-2xl rounded-3xl border overflow-hidden shadow-2xl relative transition-all max-h-[90vh] flex flex-col ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg">Secure Checkout</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Step {step === 'details' ? '1 of 2: Shipping' : step === 'payment' ? '2 of 2: Payment' : 'Complete'}
              </p>
            </div>
          </div>

          {step !== 'success' && (
            <button
              onClick={onClose}
              className={`p-2 rounded-full transition ${
                isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          {/* Guest checkout is not supported — orders belong to real buyers */}
          {!user && step !== 'success' && (
            <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-3">
              <Lock className="w-8 h-8 mx-auto text-amber-400" />
              <p className="text-sm font-bold text-amber-400">Login required to place an order</p>
              <p className="text-xs text-slate-400">
                Orders are saved to your account so you can track them later. Please log in or create a free account first.
              </p>
              <button
                onClick={onRequireAuth}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs"
              >
                Login / Create Account
              </button>
            </div>
          )}

          {user && step === 'details' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <Truck className="w-4 h-4 text-emerald-500" />
                <span>Delivery Address & Recipient Details</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1 block">Full Name *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-emerald-500 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1 block">Phone Number (For Courier SMS) *</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="03XXXXXXXXX"
                    className={`w-full px-3 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-emerald-500 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1 block">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-emerald-500 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1 block">City *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Lahore"
                    className={`w-full px-3 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-emerald-500 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1 block">Complete Street Address / House / Area *</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House #, Street, Area/Sector, City"
                  className={`w-full px-3 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-emerald-500 ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {formError}
                </div>
              )}

              {/* Order Summary Box */}
              <div className={`p-4 rounded-2xl border ${
                isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="text-[11px] font-bold uppercase text-slate-500 mb-2">Order Summary</div>
                <div className="space-y-1.5 text-xs max-h-32 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span className="truncate pr-2">{item.productName} × {item.quantity}</span>
                      <span className="font-bold shrink-0">PKR {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs pt-2 mt-2 border-t border-slate-200 dark:border-slate-800 text-slate-500">
                  <span>Delivery Fee:</span>
                  <span className="font-bold">{deliveryFee === 0 ? 'FREE' : `PKR ${deliveryFee}`}</span>
                </div>
                <div className="flex justify-between text-sm font-black pt-1">
                  <span>Total:</span>
                  <span className="text-emerald-500">PKR {grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => validateDetails() && setStep('payment')}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg transition cursor-pointer"
              >
                Continue to Payment Method →
              </button>
            </div>
          )}

          {user && step === 'payment' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Select Payment Method</h3>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Online payment gateways are being integrated. Currently only
                <strong className="text-emerald-500"> Cash on Delivery </strong>
                is available — you pay the courier when your order arrives.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {paymentOptions.map((option) => {
                  const isSelected = selectedPayment === option.id;
                  return (
                    <button
                      key={option.id}
                      disabled={!option.enabled}
                      onClick={() => option.enabled && setSelectedPayment(option.id)}
                      className={`p-4 rounded-2xl border text-left transition relative ${
                        !option.enabled
                          ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
                          : isSelected
                          ? 'bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500/40'
                          : isDarkMode
                          ? 'bg-slate-950 border-slate-800 hover:border-emerald-500/40'
                          : 'bg-slate-50 border-slate-200 hover:border-emerald-400'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{option.icon}</span>
                        <div>
                          <div className="font-bold text-xs flex items-center gap-2">
                            {option.name}
                            {!option.enabled && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500 text-[9px] font-black uppercase">
                                Coming Soon
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500">{option.tag}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {orderError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {orderError}
                </div>
              )}

              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-[11px] text-emerald-300 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Your order will be recorded with payment status <strong>pending</strong>.
                  You pay in cash only when the parcel reaches your doorstep.
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setStep('details')}
                  disabled={submitting}
                  className="px-5 py-3.5 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  ← Back
                </button>
                <button
                  onClick={handleConfirmOrder}
                  disabled={submitting}
                  className="flex-1 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg transition cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? 'Placing Order…' : `Confirm Order — PKR ${grandTotal.toLocaleString()}`}
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-4 py-8">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9 text-emerald-500" />
              </div>
              <h3 className="text-xl font-black">Order Placed Successfully!</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                Your order has been saved with payment status <strong>pending</strong> (Cash on Delivery).
                The merchant will confirm and dispatch it soon. You can track it anytime in Account Settings → My Orders.
              </p>
              <button
                onClick={() => {
                  setStep('details');
                  onClose();
                }}
                className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
