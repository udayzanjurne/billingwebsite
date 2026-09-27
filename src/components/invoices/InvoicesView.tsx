import React, { useState, useMemo } from 'react';
import { useBilling } from '../../context/BillingContext';
import { Invoice, InvoiceStatus } from '../../types';
import {
  formatDate,
  getDueDateStatus,
  getStatusBadgeStyle,
  exportInvoicesToCSV,
} from '../../utils/formatters';
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit3,
  Copy,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  Calendar,
} from 'lucide-react';

interface InvoicesViewProps {
  onOpenNewInvoice: () => void;
  onViewInvoice: (invoice: Invoice) => void;
  onEditInvoice: (invoice: Invoice) => void;
  searchQuery: string;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  onOpenNewInvoice,
  onViewInvoice,
  onEditInvoice,
  searchQuery,
}) => {
  const {
    invoices,
    clients,
    deleteInvoice,
    markInvoiceAsPaid,
    addInvoice,
    formatCurrency,
    showToast,
  } = useBilling();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date-desc');

  const filteredInvoices = useMemo(() => {
    return invoices
      .filter((inv) => {
        // Status filter
        if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
        // Client filter
        if (clientFilter !== 'all' && inv.clientId !== clientFilter) return false;
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesNum = inv.invoiceNumber.toLowerCase().includes(q);
          const matchesClient = inv.clientName.toLowerCase().includes(q);
          const matchesPo = inv.poNumber?.toLowerCase().includes(q) || false;
          if (!matchesNum && !matchesClient && !matchesPo) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime();
        }
        if (sortBy === 'date-asc') {
          return new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime();
        }
        if (sortBy === 'amount-desc') {
          return b.total - a.total;
        }
        if (sortBy === 'amount-asc') {
          return a.total - b.total;
        }
        return 0;
      });
  }, [invoices, statusFilter, clientFilter, searchQuery, sortBy]);

  const handleDuplicate = (inv: Invoice) => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const duplicatedPayload = {
      invoiceNumber: `INV-2026-${randomSuffix}`,
      clientId: inv.clientId,
      clientName: inv.clientName,
      clientEmail: inv.clientEmail,
      clientAddress: inv.clientAddress,
      clientTaxId: inv.clientTaxId,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      poNumber: inv.poNumber ? `${inv.poNumber}-COPY` : '',
      items: inv.items.map((it) => ({ ...it, id: `it-${Date.now()}-${Math.random()}` })),
      subtotal: inv.subtotal,
      discountTotal: inv.discountTotal,
      taxTotal: inv.taxTotal,
      shipping: inv.shipping,
      total: inv.total,
      amountPaid: 0,
      balanceDue: inv.total,
      status: 'draft' as InvoiceStatus,
      currency: inv.currency,
      notes: inv.notes,
      terms: inv.terms,
    };

    addInvoice(duplicatedPayload);
    showToast(`Invoice duplicated as draft INV-2026-${randomSuffix}`, 'success');
  };

  const statusTabs = [
    { id: 'all', label: 'All Invoices', count: invoices.length },
    {
      id: 'pending',
      label: 'Pending',
      count: invoices.filter((i) => i.status === 'pending').length,
    },
    {
      id: 'paid',
      label: 'Paid',
      count: invoices.filter((i) => i.status === 'paid').length,
    },
    {
      id: 'overdue',
      label: 'Overdue',
      count: invoices.filter((i) => i.status === 'overdue').length,
    },
    {
      id: 'draft',
      label: 'Draft',
      count: invoices.filter((i) => i.status === 'draft').length,
    },
  ];

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Invoices Management Hub
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage billing lifecycle, draft quotes, issue demands, and track settlements
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportInvoicesToCSV(filteredInvoices)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export Table (CSV)</span>
          </button>

          <button
            onClick={onOpenNewInvoice}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/25 transition active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {statusTabs.map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Client filter & Sort */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 font-medium">Customer:</span>
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium outline-none"
            >
              <option value="all">All Clients</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company || c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium outline-none"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No invoices match your filters
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try changing the search query or status filter, or create a brand new invoice now.
            </p>
            <button
              onClick={onOpenNewInvoice}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md shadow-brand-600/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Invoice</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Invoice #</th>
                  <th className="py-3.5 px-4">Customer & Contact</th>
                  <th className="py-3.5 px-3">Issue Date</th>
                  <th className="py-3.5 px-3">Payment Due</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-4 text-right">Invoice Total</th>
                  <th className="py-3.5 px-4 text-right">Balance Due</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
                {filteredInvoices.map((inv) => {
                  const dueStatus = getDueDateStatus(inv.dueDate, inv.status);
                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition cursor-pointer"
                      onClick={() => onViewInvoice(inv)}
                    >
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-900 dark:text-white block">
                          {inv.invoiceNumber}
                        </span>
                        {inv.poNumber && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {inv.poNumber}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {inv.clientName}
                        </p>
                        <p className="text-[11px] text-slate-400">{inv.clientEmail}</p>
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400">
                        {formatDate(inv.issueDate)}
                      </td>
                      <td className="py-3.5 px-3">
                        <p className="text-slate-600 dark:text-slate-400">{formatDate(inv.dueDate)}</p>
                        <span className={`text-[10px] ${dueStatus.tone}`}>{dueStatus.label}</span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border capitalize ${getStatusBadgeStyle(
                            inv.status
                          )}`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-800 dark:text-slate-200">
                        {formatCurrency(inv.total)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {inv.balanceDue > 0 ? (
                          <span className={inv.status === 'overdue' ? 'text-rose-600 font-bold' : ''}>
                            {formatCurrency(inv.balanceDue)}
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            ✓ Paid
                          </span>
                        )}
                      </td>
                      <td
                        className="py-3.5 px-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onViewInvoice(inv)}
                            title="View / Print"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onEditInvoice(inv)}
                            title="Edit Invoice"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {inv.status !== 'paid' && (
                            <button
                              onClick={() => markInvoiceAsPaid(inv.id)}
                              title="Mark as Paid"
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => handleDuplicate(inv)}
                            title="Duplicate as New Invoice"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm(`Delete invoice ${inv.invoiceNumber}?`)) {
                                deleteInvoice(inv.id);
                              }
                            }}
                            title="Delete Invoice"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
