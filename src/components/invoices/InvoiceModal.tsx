import React, { useState, useEffect } from 'react';
import { useBilling } from '../../context/BillingContext';
import { Invoice, InvoiceItem } from '../../types';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  Building,
  DollarSign,
  Package,
  FileText,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceToEdit?: Invoice | null;
  onOpenNewClientModal?: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  invoiceToEdit,
  onOpenNewClientModal,
}) => {
  const {
    clients,
    catalog,
    companySettings,
    addInvoice,
    updateInvoice,
    formatCurrency,
    showToast,
  } = useBilling();

  const [clientId, setClientId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [shipping, setShipping] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');
  const [status, setStatus] = useState<Invoice['status']>('pending');

  useEffect(() => {
    if (invoiceToEdit) {
      setClientId(invoiceToEdit.clientId);
      setInvoiceNumber(invoiceToEdit.invoiceNumber);
      setIssueDate(invoiceToEdit.issueDate);
      setDueDate(invoiceToEdit.dueDate);
      setPoNumber(invoiceToEdit.poNumber || '');
      setItems(invoiceToEdit.items);
      setShipping(invoiceToEdit.shipping || 0);
      setNotes(invoiceToEdit.notes || '');
      setTerms(invoiceToEdit.terms || '');
      setStatus(invoiceToEdit.status);
    } else {
      // Default new invoice
      const today = new Date();
      const issueStr = today.toISOString().split('T')[0];
      const due = new Date();
      due.setDate(due.getDate() + (companySettings.defaultPaymentTerms || 30));
      const dueStr = due.toISOString().split('T')[0];

      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      setInvoiceNumber(`${companySettings.invoicePrefix}${randomSuffix}`);
      setClientId(clients[0]?.id || '');
      setIssueDate(issueStr);
      setDueDate(dueStr);
      setPoNumber('');
      setShipping(0);
      setNotes(companySettings.defaultNotes);
      setTerms(companySettings.defaultTerms);
      setStatus('pending');

      // Initialize with one default line item
      if (catalog.length > 0) {
        const firstCat = catalog[0];
        setItems([
          {
            id: `item-${Date.now()}`,
            description: firstCat.name,
            category: firstCat.category,
            quantity: 1,
            rate: firstCat.defaultRate,
            taxRate: firstCat.taxRate,
            discount: 0,
            amount: firstCat.defaultRate,
          },
        ]);
      } else {
        setItems([
          {
            id: `item-${Date.now()}`,
            description: 'Custom Professional Services',
            category: 'Consulting',
            quantity: 1,
            rate: 100,
            taxRate: 10,
            discount: 0,
            amount: 100,
          },
        ]);
      }
    }
  }, [invoiceToEdit, isOpen, companySettings, clients, catalog]);

  if (!isOpen) return null;

  // Real-time calculations
  const calculateItemAmount = (quantity: number, rate: number, discount: number) => {
    const raw = quantity * rate;
    const discounted = raw - (raw * (discount || 0)) / 100;
    return Math.max(0, discounted);
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...items];
    const current = { ...updated[index], [field]: value };

    if (field === 'quantity' || field === 'rate' || field === 'discount') {
      const q = field === 'quantity' ? Number(value) : current.quantity;
      const r = field === 'rate' ? Number(value) : current.rate;
      const d = field === 'discount' ? Number(value) : current.discount;
      current.amount = calculateItemAmount(q, r, d);
    }

    updated[index] = current;
    setItems(updated);
  };

  const handleSelectCatalogItem = (index: number, catalogId: string) => {
    const found = catalog.find((c) => c.id === catalogId);
    if (!found) return;

    const updated = [...items];
    updated[index] = {
      ...updated[index],
      description: `${found.name} - ${found.description}`,
      category: found.category,
      rate: found.defaultRate,
      taxRate: found.taxRate,
      amount: calculateItemAmount(updated[index].quantity, found.defaultRate, updated[index].discount),
    };
    setItems(updated);
  };

  const addItemRow = () => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      description: '',
      quantity: 1,
      rate: 100,
      taxRate: 10,
      discount: 0,
      amount: 100,
    };
    setItems([...items, newItem]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) {
      showToast('Invoice must have at least one line item', 'error');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const discountTotal = items.reduce(
    (sum, item) => sum + (item.quantity * item.rate * (item.discount || 0)) / 100,
    0
  );
  const taxTotal = items.reduce((sum, item) => {
    const lineAfterDiscount = item.quantity * item.rate * (1 - (item.discount || 0) / 100);
    return sum + (lineAfterDiscount * (item.taxRate || 0)) / 100;
  }, 0);
  const grandTotal = Math.max(0, subtotal - discountTotal + taxTotal + Number(shipping || 0));

  const handleSave = (finalStatus?: Invoice['status']) => {
    const selectedClient = clients.find((c) => c.id === clientId);
    if (!selectedClient) {
      showToast('Please select a customer for this invoice', 'error');
      return;
    }

    if (items.some((it) => !it.description.trim() || it.quantity <= 0)) {
      showToast('Please provide valid descriptions and quantities for all items', 'error');
      return;
    }

    const assignedStatus = finalStatus || status;

    const invoicePayload = {
      invoiceNumber,
      clientId: selectedClient.id,
      clientName: selectedClient.company || selectedClient.name,
      clientEmail: selectedClient.email,
      clientAddress: `${selectedClient.address}, ${selectedClient.city} ${selectedClient.zip}, ${selectedClient.country}`,
      clientTaxId: selectedClient.taxId,
      issueDate,
      dueDate,
      poNumber,
      items,
      subtotal,
      discountTotal,
      taxTotal,
      shipping: Number(shipping || 0),
      total: grandTotal,
      amountPaid: invoiceToEdit ? invoiceToEdit.amountPaid : 0,
      balanceDue: invoiceToEdit
        ? Math.max(0, grandTotal - invoiceToEdit.amountPaid)
        : grandTotal,
      status: assignedStatus,
      currency: companySettings.defaultCurrency,
      notes,
      terms,
    };

    if (invoiceToEdit) {
      updateInvoice(invoiceToEdit.id, invoicePayload);
    } else {
      addInvoice(invoicePayload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-100 dark:bg-brand-950/80 text-brand-600 dark:text-brand-300 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {invoiceToEdit ? `Edit Invoice ${invoiceToEdit.invoiceNumber}` : 'Create New Invoice'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate professional enterprise billing with automated taxes and line calculations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-700 dark:text-slate-300">
          {/* Row 1: Invoice Number, Client, Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Invoice Number
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Customer / Client
                </label>
                {onOpenNewClientModal && (
                  <button
                    type="button"
                    onClick={onOpenNewClientModal}
                    className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium"
                  >
                    + Add Client
                  </button>
                )}
              </div>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company ? `${c.company} (${c.name})` : c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Issue Date
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Payment Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
              />
            </div>
          </div>

          {/* Row 2: PO Reference and Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Purchase Order / Reference (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. PO-849102"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Invoice Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none capitalize"
              >
                <option value="pending">Pending (Sent)</option>
                <option value="draft">Draft</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Line Items
              </label>
              <span className="text-xs text-slate-400">
                Insert catalog services or type custom billable descriptions
              </span>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3 w-5/12">Item / Description</th>
                    <th className="py-2.5 px-3 w-16 text-center">Qty</th>
                    <th className="py-2.5 px-3 w-28">Rate ({companySettings.defaultCurrency})</th>
                    <th className="py-2.5 px-3 w-20">Tax %</th>
                    <th className="py-2.5 px-3 w-20">Disc %</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                    <th className="py-2.5 px-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
                  {items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                      <td className="p-2 space-y-1.5">
                        {/* Quick catalog select if available */}
                        {catalog.length > 0 && (
                          <select
                            onChange={(e) => handleSelectCatalogItem(idx, e.target.value)}
                            defaultValue=""
                            className="w-full text-xs py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300"
                          >
                            <option value="" disabled>
                              ⚡ Choose from Product Catalog...
                            </option>
                            {catalog.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name} (${cat.defaultRate}/{cat.unit})
                              </option>
                            ))}
                          </select>
                        )}
                        <textarea
                          rows={2}
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          placeholder="Detailed item or service description..."
                          className="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500/20"
                        />
                      </td>
                      <td className="p-2 align-top">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          className="w-full text-center py-1.5 px-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                        />
                      </td>
                      <td className="p-2 align-top">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) => handleItemChange(idx, 'rate', e.target.value)}
                          className="w-full py-1.5 px-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                        />
                      </td>
                      <td className="p-2 align-top">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          value={item.taxRate}
                          onChange={(e) => handleItemChange(idx, 'taxRate', e.target.value)}
                          className="w-full py-1.5 px-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                        />
                      </td>
                      <td className="p-2 align-top">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          value={item.discount}
                          onChange={(e) => handleItemChange(idx, 'discount', e.target.value)}
                          className="w-full py-1.5 px-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                        />
                      </td>
                      <td className="p-2 align-top text-right font-semibold font-mono text-slate-900 dark:text-white pt-3">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="p-2 align-top text-center pt-2.5">
                        <button
                          type="button"
                          onClick={() => removeItemRow(idx)}
                          className="text-slate-400 hover:text-rose-500 transition p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={addItemRow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/50 border border-dashed border-brand-300 dark:border-brand-800 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Another Line Item
            </button>
          </div>

          {/* Financial Breakdown & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Notes & Terms */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Customer Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes to appear on customer invoice..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Payment Terms & Instructions
                </label>
                <textarea
                  rows={2}
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  placeholder="Terms, bank transfer info, late fee policy..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none"
                />
              </div>
            </div>

            {/* Calculations Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>Subtotal</span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                  {formatCurrency(subtotal)}
                </span>
              </div>

              {discountTotal > 0 && (
                <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400">
                  <span>Discounts Applied</span>
                  <span className="font-mono font-medium">-{formatCurrency(discountTotal)}</span>
                </div>
              )}

              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>Total Tax (VAT / GST)</span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                  +{formatCurrency(taxTotal)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-1">
                <span>Shipping / Additional Fee</span>
                <div className="w-24">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={shipping}
                    onChange={(e) => setShipping(Number(e.target.value))}
                    className="w-full text-right py-1 px-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    Grand Total
                  </span>
                  <span className="text-xs text-slate-400 block">
                    {companySettings.defaultCurrency}
                  </span>
                </div>
                <span className="text-xl font-extrabold text-brand-600 dark:text-brand-400 font-mono">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave('draft')}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-200/80 dark:bg-slate-700/70 hover:bg-slate-300/80 rounded-xl transition"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handleSave('pending')}
              className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-600/30 rounded-xl transition active:scale-[0.98]"
            >
              {invoiceToEdit ? 'Update & Save' : 'Create & Issue Invoice'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
