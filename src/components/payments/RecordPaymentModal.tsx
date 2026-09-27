import React, { useState, useEffect } from 'react';
import { useBilling } from '../../context/BillingContext';
import { Invoice } from '../../types';
import { X, CreditCard, DollarSign, CheckCircle, Building } from 'lucide-react';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultInvoiceId?: string;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  defaultInvoiceId,
}) => {
  const { invoices, recordPayment, formatCurrency, showToast } = useBilling();

  const unpaidInvoices = invoices.filter(
    (i) => i.status !== 'paid' && i.status !== 'cancelled' && i.balanceDue > 0
  );

  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<any>('Bank Transfer');
  const [paymentDate, setPaymentDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (defaultInvoiceId) {
      setSelectedInvoiceId(defaultInvoiceId);
    } else if (unpaidInvoices.length > 0) {
      setSelectedInvoiceId(unpaidInvoices[0].id);
    }
    setPaymentDate(new Date().toISOString().split('T')[0]);
  }, [isOpen, defaultInvoiceId]);

  const activeInvoice = invoices.find((i) => i.id === selectedInvoiceId);

  useEffect(() => {
    if (activeInvoice) {
      setAmount(activeInvoice.balanceDue);
    }
  }, [selectedInvoiceId, activeInvoice]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeInvoice) {
      showToast('Please select a valid invoice', 'error');
      return;
    }

    if (amount <= 0 || isNaN(amount)) {
      showToast('Payment amount must be greater than zero', 'error');
      return;
    }

    if (amount > activeInvoice.balanceDue) {
      showToast(
        `Amount cannot exceed outstanding balance of ${formatCurrency(activeInvoice.balanceDue)}`,
        'error'
      );
      return;
    }

    recordPayment({
      invoiceId: activeInvoice.id,
      invoiceNumber: activeInvoice.invoiceNumber,
      clientId: activeInvoice.clientId,
      clientName: activeInvoice.clientName,
      amount,
      currency: activeInvoice.currency,
      paymentMethod,
      status: 'Completed',
      paymentDate,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Record Invoice Payment
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Settle outstanding receivables and issue payment receipt
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          {/* Select Invoice */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Select Outstanding Invoice
            </label>
            {unpaidInvoices.length === 0 ? (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 py-2 font-medium">
                ✓ All invoices are completely paid! No outstanding receivables.
              </p>
            ) : (
              <select
                value={selectedInvoiceId}
                onChange={(e) => setSelectedInvoiceId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none"
              >
                {unpaidInvoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoiceNumber} - {inv.clientName} (Balance: {formatCurrency(inv.balanceDue)})
                  </option>
                ))}
              </select>
            )}
          </div>

          {activeInvoice && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
              <div>
                <span className="text-slate-500 block">Total Invoiced:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatCurrency(activeInvoice.total)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">Current Balance Due:</span>
                <span className="font-bold text-base text-rose-600 dark:text-rose-400 font-mono">
                  {formatCurrency(activeInvoice.balanceDue)}
                </span>
              </div>
            </div>
          )}

          {/* Payment Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Payment Amount
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Payment Date
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none"
                required
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none"
            >
              <option value="Bank Transfer">Bank Wire / ACH Transfer</option>
              <option value="Credit Card">Credit / Debit Card</option>
              <option value="Stripe">Stripe Direct Checkout</option>
              <option value="PayPal">PayPal Business</option>
              <option value="UPI / Instant Pay">UPI / Instant Pay</option>
              <option value="Cash">Cash / Cheque</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Transaction Notes / Check Ref (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Wire reference #820194, cleared via SVB"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!activeInvoice}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/30 transition disabled:opacity-50"
            >
              Confirm & Record Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
