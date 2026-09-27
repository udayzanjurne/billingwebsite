import React, { useState } from 'react';
import { useBilling } from '../../context/BillingContext';
import { RecurringSubscription } from '../../types';
import { formatDate } from '../../utils/formatters';
import {
  Repeat,
  Plus,
  Play,
  Pause,
  Trash2,
  Calendar,
  CheckCircle,
  FilePlus,
  Sparkles,
  X,
} from 'lucide-react';

export const SubscriptionsView: React.FC = () => {
  const {
    subscriptions,
    clients,
    companySettings,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    addInvoice,
    formatCurrency,
    showToast,
  } = useBilling();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [planName, setPlanName] = useState('Enterprise Cloud Retainer');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [amount, setAmount] = useState<number>(2750);
  const [autoCharge, setAutoCharge] = useState(true);

  const handleCreateSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    const selClient = clients.find((c) => c.id === clientId);
    if (!selClient) {
      showToast('Please select a client', 'error');
      return;
    }

    const nextBilling = new Date();
    nextBilling.setMonth(nextBilling.getMonth() + (billingCycle === 'monthly' ? 1 : billingCycle === 'quarterly' ? 3 : 12));

    addSubscription({
      clientId: selClient.id,
      clientName: selClient.company || selClient.name,
      planName,
      billingCycle,
      amount: Number(amount),
      currency: companySettings.defaultCurrency,
      status: 'Active',
      startDate: new Date().toISOString().split('T')[0],
      nextBillingDate: nextBilling.toISOString().split('T')[0],
      autoCharge,
    });

    setIsModalOpen(false);
  };

  const handleGenerateInvoiceNow = (sub: RecurringSubscription) => {
    const selClient = clients.find((c) => c.id === sub.clientId) || {
      id: sub.clientId,
      name: sub.clientName,
      company: sub.clientName,
      email: 'billing@client.com',
      address: 'Corporate Headquarters',
      taxId: 'US-9812903',
      city: 'San Francisco',
      country: 'USA',
    };

    const todayStr = new Date().toISOString().split('T')[0];
    const dueStr = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const newInv = addInvoice({
      invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      clientId: sub.clientId,
      clientName: sub.clientName,
      clientEmail: selClient.email || 'billing@client.com',
      clientAddress: selClient.address || 'Corporate Headquarters',
      clientTaxId: selClient.taxId,
      issueDate: todayStr,
      dueDate: dueStr,
      poNumber: `REC-${sub.subscriptionNumber}`,
      items: [
        {
          id: `it-${Date.now()}`,
          description: `${sub.planName} (${sub.billingCycle.toUpperCase()} Billing Cycle)`,
          category: 'Subscription',
          quantity: 1,
          rate: sub.amount,
          taxRate: 10,
          discount: 0,
          amount: sub.amount,
        },
      ],
      subtotal: sub.amount,
      discountTotal: 0,
      taxTotal: (sub.amount * 10) / 100,
      shipping: 0,
      total: sub.amount + (sub.amount * 10) / 100,
      amountPaid: 0,
      balanceDue: sub.amount + (sub.amount * 10) / 100,
      status: 'pending',
      currency: sub.currency,
      notes: `Recurring cycle generated automatically for ${sub.planName}.`,
      terms: 'Net 30 days.',
    });

    showToast(`Invoice ${newInv.invoiceNumber} generated from subscription!`, 'success');
  };

  const toggleStatus = (sub: RecurringSubscription) => {
    const nextStatus = sub.status === 'Active' ? 'Paused' : 'Active';
    updateSubscription(sub.id, { status: nextStatus });
    showToast(`Subscription marked as ${nextStatus}`, 'info');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Recurring Subscriptions & Retainers
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Automate monthly SaaS contracts, maintenance retainers, and subscription invoicing
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/25 transition active:scale-[0.98] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Subscription</span>
        </button>
      </div>

      {/* Subscriptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {subscriptions.map((sub) => (
          <div
            key={sub.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-xs font-bold text-slate-500">
                  {sub.subscriptionNumber}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    sub.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300'
                  }`}
                >
                  {sub.status}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2">
                {sub.planName}
              </h3>
              <p className="text-xs text-brand-600 dark:text-brand-400 font-medium">
                {sub.clientName}
              </p>

              <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 space-y-1 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Cycle:</span>
                  <span className="font-semibold capitalize text-slate-700 dark:text-slate-300">
                    {sub.billingCycle}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Next Invoice Date:</span>
                  <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                    {formatDate(sub.nextBillingDate)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Auto-Charge:</span>
                  <span className="font-medium text-emerald-600">
                    {sub.autoCharge ? 'Enabled' : 'Manual Approval'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                  {formatCurrency(sub.amount)}
                </span>
                <span className="text-xs text-slate-400 font-medium"> / {sub.billingCycle}</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleGenerateInvoiceNow(sub)}
                  title="Generate Invoice Now"
                  className="p-1.5 rounded-lg text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/60 transition"
                >
                  <FilePlus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleStatus(sub)}
                  title={sub.status === 'Active' ? 'Pause' : 'Activate'}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  {sub.status === 'Active' ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Delete subscription profile ${sub.subscriptionNumber}?`)) {
                      deleteSubscription(sub.id);
                    }
                  }}
                  title="Delete"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Subscription Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Create Recurring Subscription
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubscription} className="p-6 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Customer
                </label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company || c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Plan / Retainer Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. 24/7 Dedicated Cloud SLA"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Billing Cycle
                  </label>
                  <select
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Amount ({companySettings.defaultCurrency})
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs outline-none"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autocharge"
                  checked={autoCharge}
                  onChange={(e) => setAutoCharge(e.target.checked)}
                  className="rounded text-brand-600"
                />
                <label
                  htmlFor="autocharge"
                  className="text-xs text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  Enable automated recurring renewal invoices
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-600/30 transition"
                >
                  Activate Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
