import React, { useRef } from 'react';
import { useBilling } from '../../context/BillingContext';
import { Invoice } from '../../types';
import { formatDate, getStatusBadgeStyle } from '../../utils/formatters';
import {
  Printer,
  X,
  CheckCircle2,
  Share2,
  Download,
  Building,
  QrCode,
  Edit3,
} from 'lucide-react';

interface InvoiceViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onEdit: (invoice: Invoice) => void;
}

export const InvoiceViewerModal: React.FC<InvoiceViewerModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onEdit,
}) => {
  const { companySettings, formatCurrency, markInvoiceAsPaid, showToast } = useBilling();
  const printContentRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyShareLink = () => {
    const url = `${window.location.origin}/#invoice-${invoice.invoiceNumber}`;
    navigator.clipboard.writeText(url);
    showToast('Direct payment and view link copied to clipboard!', 'success');
  };

  const isPaid = invoice.status === 'paid' || invoice.balanceDue <= 0.01;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Action Toolbar (Hidden during Print) */}
        <div className="no-print px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800 dark:text-white">
              Invoice #{invoice.invoiceNumber}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase ${getStatusBadgeStyle(
                invoice.status
              )}`}
            >
              {invoice.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isPaid && (
              <button
                onClick={() => markInvoiceAsPaid(invoice.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Paid</span>
              </button>
            )}

            <button
              onClick={handleCopyShareLink}
              title="Share Link"
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                onClose();
                onEdit(invoice);
              }}
              title="Edit Invoice"
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Body (Target for Print) */}
        <div className="p-6 sm:p-10 overflow-y-auto flex-1 bg-white text-slate-900 invoice-printable">
          <div ref={printContentRef} className="max-w-3xl mx-auto space-y-8">
            {/* Header: Company Profile & Invoice Title */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-8">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-base">
                    ⚡
                  </div>
                  <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                    {companySettings.companyName}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">{companySettings.tagline}</p>
                <div className="text-xs text-slate-500 space-y-0.5 pt-1">
                  <p>{companySettings.address}</p>
                  <p>
                    {companySettings.city}, {companySettings.state} {companySettings.zip},{' '}
                    {companySettings.country}
                  </p>
                  <p>{companySettings.email} | {companySettings.phone}</p>
                  <p className="font-mono text-slate-600">{companySettings.taxId}</p>
                </div>
              </div>

              <div className="text-right sm:self-auto space-y-1">
                <div className="inline-block">
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
                    INVOICE
                  </h1>
                  <span
                    className={`inline-block px-3 py-0.5 mt-1 rounded-full text-xs font-bold border uppercase ${
                      isPaid
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : invoice.status === 'overdue'
                        ? 'bg-rose-50 text-rose-700 border-rose-300'
                        : 'bg-amber-50 text-amber-700 border-amber-300'
                    }`}
                  >
                    {isPaid ? '✓ PAID IN FULL' : invoice.status}
                  </span>
                </div>
                <div className="text-xs space-y-1 text-slate-600 pt-3">
                  <p>
                    <span className="font-semibold text-slate-800">Invoice No: </span>
                    <span className="font-mono font-bold text-slate-900">{invoice.invoiceNumber}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-slate-800">Issue Date: </span>
                    {formatDate(invoice.issueDate)}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-800">Due Date: </span>
                    <span className={invoice.status === 'overdue' ? 'text-rose-600 font-bold' : ''}>
                      {formatDate(invoice.dueDate)}
                    </span>
                  </p>
                  {invoice.poNumber && (
                    <p>
                      <span className="font-semibold text-slate-800">PO Ref: </span>
                      <span className="font-mono">{invoice.poNumber}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Bill To & Balance Due Summary Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Billed To
                </span>
                <h3 className="text-sm font-bold text-slate-900">{invoice.clientName}</h3>
                <p className="text-xs text-slate-600">{invoice.clientEmail}</p>
                <p className="text-xs text-slate-500 whitespace-pre-line">{invoice.clientAddress}</p>
                {invoice.clientTaxId && (
                  <p className="text-xs font-mono text-slate-600 pt-0.5">Tax ID: {invoice.clientTaxId}</p>
                )}
              </div>

              <div className="sm:text-right space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Balance Due
                </span>
                <p className="text-2xl font-black text-slate-900 font-mono">
                  {formatCurrency(invoice.balanceDue)}
                </p>
                {invoice.amountPaid > 0 && (
                  <p className="text-xs text-emerald-600 font-medium">
                    ({formatCurrency(invoice.amountPaid)} paid of {formatCurrency(invoice.total)})
                  </p>
                )}
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 uppercase text-[11px] tracking-wide">
                  <tr>
                    <th className="py-3 px-4">Item & Description</th>
                    <th className="py-3 px-3 text-center">Qty</th>
                    <th className="py-3 px-3 text-right">Unit Rate</th>
                    <th className="py-3 px-3 text-center">Tax</th>
                    <th className="py-3 px-3 text-center">Disc</th>
                    <th className="py-3 px-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {invoice.items.map((item, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900">{item.description}</p>
                        {item.category && (
                          <span className="text-[10px] text-slate-400 font-medium uppercase">
                            {item.category}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-mono">{item.quantity}</td>
                      <td className="py-3 px-3 text-right font-mono">{formatCurrency(item.rate)}</td>
                      <td className="py-3 px-3 text-center font-mono text-slate-500">
                        {item.taxRate > 0 ? `${item.taxRate}%` : '—'}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-slate-500">
                        {item.discount > 0 ? `${item.discount}%` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Section: Payment Methods, QR Code & Totals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start pt-2">
              {/* Payment Details & Bank Wire */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Payment Instructions
                  </span>
                  <QrCode className="w-5 h-5 text-slate-500" />
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <p>
                    <span className="font-semibold">Bank: </span>
                    {companySettings.bankName}
                  </p>
                  <p>
                    <span className="font-semibold">Account #: </span>
                    <span className="font-mono">{companySettings.bankAccount}</span>
                  </p>
                  <p>
                    <span className="font-semibold">Routing / ABA: </span>
                    <span className="font-mono">{companySettings.bankRouting}</span>
                  </p>
                  <p>
                    <span className="font-semibold">SWIFT / BIC: </span>
                    <span className="font-mono">{companySettings.swiftBic}</span>
                  </p>
                  {companySettings.upiId && (
                    <p>
                      <span className="font-semibold">UPI ID: </span>
                      <span className="font-mono text-brand-600">{companySettings.upiId}</span>
                    </p>
                  )}
                </div>

                {invoice.notes && (
                  <div className="pt-2 border-t border-slate-200 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Notes: </span>
                    {invoice.notes}
                  </div>
                )}
              </div>

              {/* Totals Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 py-1">
                  <span>Subtotal</span>
                  <span className="font-mono font-medium">{formatCurrency(invoice.subtotal)}</span>
                </div>

                {invoice.discountTotal > 0 && (
                  <div className="flex justify-between text-emerald-600 py-1">
                    <span>Discount</span>
                    <span className="font-mono font-medium">-{formatCurrency(invoice.discountTotal)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600 py-1">
                  <span>Taxes (VAT / GST)</span>
                  <span className="font-mono font-medium">+{formatCurrency(invoice.taxTotal)}</span>
                </div>

                {invoice.shipping > 0 && (
                  <div className="flex justify-between text-slate-600 py-1">
                    <span>Shipping & Handling</span>
                    <span className="font-mono font-medium">+{formatCurrency(invoice.shipping)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Due</span>
                  <span className="font-mono text-base">{formatCurrency(invoice.total)}</span>
                </div>

                {invoice.amountPaid > 0 && (
                  <div className="flex justify-between text-xs text-emerald-700 py-1">
                    <span>Paid to Date</span>
                    <span className="font-mono font-semibold">-{formatCurrency(invoice.amountPaid)}</span>
                  </div>
                )}

                <div className="flex justify-between text-base font-black text-slate-950 pt-2 border-t-2 border-slate-900">
                  <span>Balance Due ({invoice.currency})</span>
                  <span className="font-mono text-indigo-700">
                    {formatCurrency(invoice.balanceDue)}
                  </span>
                </div>
              </div>
            </div>

            {/* Terms & Signature */}
            <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-end gap-6 text-xs text-slate-500">
              <div className="space-y-1 max-w-sm">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Terms & Conditions
                </span>
                <p>{invoice.terms || companySettings.defaultTerms}</p>
              </div>

              <div className="text-right space-y-2">
                <div className="w-48 border-b border-slate-400 pb-1">
                  <span className="font-serif italic text-base text-slate-800">
                    ApexFlow Financial Controller
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-400">Authorized Signature</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
