import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, CreditCard, Wallet, QrCode, Truck, ArrowRight, AlertTriangle, Building, Copy, Check } from 'lucide-react';
import { CartItem, PaymentMethod, Order, User } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  user: User | null;
  onOrderPlaced: (order: Order) => void;
  isDarkMode?: boolean;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  user,
  onOrderPlaced,
  isDarkMode = true
}) => {
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('easypaisa');
  
  // Shipping form
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '+92 300 1234567');
  const [email, setEmail] = useState(user?.email || 'customer@example.pk');
  const [city, setCity] = useState(user?.city || 'Lahore');
  const [address, setAddress] = useState('House # 45, Street 12, Phase 5 DHA, Lahore');
  const [transactionRef, setTransactionRef] = useState('');
  const [copied, setCopied] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  if (!isOpen || items.length === 0) return null;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal > 10000 ? 0 : 250;
  const grandTotal = subtotal + deliveryFee;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmOrder = () => {
    const newOrder: Order = {
      id: `BN-${Math.floor(100000 + Math.random() * 900000)}`,
      userId: user?.id || 'guest-1',
      userName: fullName || 'Customer',
      userEmail: email,
      userPhone: phone,
      address,
      city,
      items: [...items],
      subtotal,
      deliveryFee,
      totalAmount: grandTotal,
      paymentMethod: selectedPayment,
      paymentStatus: selectedPayment === 'cod' ? 'pending' : 'paid',
      orderStatus: 'confirmed',
      transactionRef: transactionRef || `TXN-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setPlacedOrder(newOrder);
    onOrderPlaced(newOrder);
    setStep('success');
  };

  const paymentOptions: { id: PaymentMethod; name: string; tag: string; icon: string; detail: string; accountNo: string; title: string }[] = [
    { id: 'easypaisa', name: 'Easypaisa', tag: 'Mobile Wallet', icon: '📲', detail: 'Till ID / Mobile Wallet', accountNo: '0300 8459123', title: 'BizNest Pakistan Pvt Ltd' },
    { id: 'jazzcash', name: 'JazzCash', tag: 'Mobile Wallet', icon: '📱', detail: 'Mobile Account', accountNo: '0321 9876543', title: 'BizNest Pakistan Pvt Ltd' },
    { id: 'sadapay', name: 'SadaPay', tag: 'Digital Banking', icon: '💳', detail: 'SadaTag Username', accountNo: '@biznest', title: 'BizNest Merchant Hub' },
    { id: 'nayapay', name: 'NayaPay', tag: 'Digital Wallet', icon: '🌐', detail: 'NayaID', accountNo: 'biznest@nayapay', title: 'BizNest Pakistan' },
    { id: 'raast', name: 'Raast Pay', tag: 'SBP Instant Pay', icon: '⚡', detail: 'State Bank Raast ID', accountNo: 'RAAST-923008459123', title: 'BizNest SBP Account' },
    { id: 'bank_transfer', name: 'Bank Transfer', tag: '1LINK / IBAN', icon: '🏛️', detail: 'Meezan / HBL IBAN', accountNo: 'PK36MEZN0001020304050607', title: 'BizNest Corporate Account' },
    { id: 'binance_pay', name: 'Binance Pay', tag: 'Crypto / USDT', icon: '🟡', detail: 'Binance Pay ID (USDT / BUSD)', accountNo: '84920194', title: 'BizNest Binance Official' },
    { id: 'cod', name: 'Cash on Delivery', tag: 'Pay at Doorstep', icon: '🚚', detail: 'Cash to Courier Rider', accountNo: 'N/A', title: 'Pay Cash Upon Receipt' },
  ];

  const currentPaymentInfo = paymentOptions.find(p => p.id === selectedPayment);

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
              <p className="text-xs text-slate-500 dark:text-slate-400">Step {step === 'details' ? '1 of 2: Shipping' : step === 'payment' ? '2 of 2: Payment' : 'Complete'}</p>
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
          {step === 'details' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <Truck className="w-4 h-4 text-emerald-500" />
                <span>Delivery Address & Recipient Details</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1 block">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-emerald-500 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1 block">Phone Number (For Courier SMS)</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
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
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-emerald-500 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1 block">City</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-emerald-500 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="Lahore">Lahore</option>
                    <option value="Karachi">Karachi</option>
                    <option value="Islamabad">Islamabad</option>
                    <option value="Rawalpindi">Rawalpindi</option>
                    <option value="Multan">Multan</option>
                    <option value="Peshawar">Peshawar</option>
                    <option value="Faisalabad">Faisalabad</option>
                    <option value="Sialkot">Sialkot</option>
                    <option value="Quetta">Quetta</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1 block">Complete Street Address / House / Area</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-emerald-500 ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              {/* Order Summary Box */}
              <div className={`p-4 rounded-2xl border ${
                isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="text-xs font-bold mb-2">Order Items ({items.length}):</div>
                <div className="space-y-1 mb-3">
                  {items.map((it) => (
                    <div key={it.id} className="flex justify-between text-xs text-slate-500 dark:text-slate-300">
                      <span>{it.productName} × {it.quantity}</span>
                      <span className="font-semibold">PKR {(it.price * it.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-xs font-bold">
                  <span>Grand Total:</span>
                  <span className="text-emerald-500 text-sm">PKR {grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => setStep('payment')}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg transition"
              >
                <span>Continue to Payment Method</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 'payment' && (
            <div className="space-y-5">
              {/* Buyer Protection Warning Banner */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11px]">
                  <strong>Buyer Protection Guaranteed:</strong> Keeping payments on-platform protects your money. Transactions done outside BizNest (e.g. direct private accounts or unverified transfers) carry risk and are strictly at your own responsibility.
                </p>
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Select Payment Method:</h3>

              {/* Payment Methods Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {paymentOptions.map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setSelectedPayment(pm.id)}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                      selectedPayment === pm.id
                        ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500'
                        : isDarkMode ? 'bg-slate-950 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xl mb-1">{pm.icon}</div>
                    <div>
                      <div className="font-bold text-xs truncate">{pm.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{pm.tag}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Selected Payment Instructions Card */}
              {currentPaymentInfo && selectedPayment !== 'cod' && (
                <div className={`p-4 rounded-2xl border ${
                  isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
                }`}>
                  <div className="text-xs font-bold mb-2 flex items-center justify-between">
                    <span>Payment Account Details ({currentPaymentInfo.name}):</span>
                    <span className="text-[10px] font-mono text-emerald-500 uppercase">{currentPaymentInfo.detail}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 dark:bg-slate-900/90 text-white space-y-1 text-xs mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Account / ID / IBAN:</span>
                      <button
                        onClick={() => handleCopy(currentPaymentInfo.accountNo)}
                        className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px] font-bold"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{currentPaymentInfo.accountNo}</span>
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Account Title:</span>
                      <span className="font-bold text-[11px]">{currentPaymentInfo.title}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                      <span className="text-slate-400 text-[11px]">Amount to Send:</span>
                      <span className="font-black text-emerald-400 text-xs">PKR {grandTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1 block">
                      Transaction Reference / TID (Optional / For Instant Auto-Verification)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 02938102938"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-emerald-500 ${
                        isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>
              )}

              {selectedPayment === 'cod' && (
                <div className={`p-4 rounded-2xl border text-xs space-y-1 ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <p className="font-bold text-slate-900 dark:text-white">Cash on Delivery Selected</p>
                  <p className="text-[11px]">You will pay PKR {grandTotal.toLocaleString()} in cash to the Leopard/TCS courier rider upon delivery to your address in {city}.</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className={`px-4 py-3 rounded-2xl border font-bold text-xs ${
                    isDarkMode ? 'border-slate-800 text-slate-400 hover:text-white' : 'border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleConfirmOrder}
                  className="flex-1 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Place Order (PKR {grandTotal.toLocaleString()})</span>
                </button>
              </div>
            </div>
          )}

          {step === 'success' && placedOrder && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 flex items-center justify-center mx-auto text-2xl">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
                  Order ID: {placedOrder.id}
                </span>
                <h3 className="text-2xl font-black mt-2">Order Confirmed!</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                  Thank you, {placedOrder.userName}! Your order has been transmitted directly to the merchant. You will receive an SMS confirmation on {placedOrder.userPhone}.
                </p>
              </div>

              <div className={`p-4 rounded-2xl border text-left text-xs max-w-md mx-auto space-y-2 ${
                isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex justify-between font-bold border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span>Shipping Address:</span>
                  <span className="text-slate-400 font-normal">{placedOrder.city}</span>
                </div>
                <p className="text-slate-500 dark:text-slate-300 text-[11px]">{placedOrder.address}</p>

                <div className="flex justify-between font-bold pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span>Payment Method:</span>
                  <span className="text-emerald-500 uppercase font-extrabold">{placedOrder.paymentMethod}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer shadow transition"
              >
                Close & Return to BizNest
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
