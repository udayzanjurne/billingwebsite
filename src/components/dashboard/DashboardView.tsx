import React, { useState } from 'react';
import { useBilling } from '../../context/BillingContext';
import { Invoice } from '../../types';
import { formatDate, getDueDateStatus, getStatusBadgeStyle, exportInvoicesToCSV } from '../../utils/formatters';
import {
  TrendingUp,
  DollarSign,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  CreditCard,
  UserPlus,
  Download,
  Eye,
  Edit3,
  CheckCircle2,
  FileText,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface DashboardViewProps {
  onOpenNewInvoice: () => void;
  onOpenRecordPayment: (invoiceId?: string) => void;
  onOpenNewClient: () => void;
  onViewInvoice: (invoice: Invoice) => void;
  onEditInvoice: (invoice: Invoice) => void;
  onNavigateToTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenNewInvoice,
  onOpenRecordPayment,
  onOpenNewClient,
  onViewInvoice,
  onEditInvoice,
  onNavigateToTab,
}) => {
  const { invoices, clients, payments, formatCurrency, markInvoiceAsPaid } = useBilling();

  // Financial Computations
  const totalInvoiced = invoices.reduce((sum, i) => sum + i.total, 0);
  const totalCollected = invoices.reduce((sum, i) => sum + i.amountPaid, 0);
  const totalOutstanding = invoices
    .filter((i) => i.status !== 'paid' && i.status !== 'cancelled')
    .reduce((sum, i) => sum + i.balanceDue, 0);

  const overdueInvoices = invoices.filter((i) => i.status === 'overdue');
  const overdueAmount = overdueInvoices.reduce((sum, i) => sum + i.balanceDue, 0);

  const collectionRate = totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0;

  // Recent Invoices (Sorted newest first)
  const recentInvoices = [...invoices].slice(0, 5);

  // Top Clients by Billed Amount
  const clientSpendingMap = invoices.reduce((acc, inv) => {
    acc[inv.clientId] = (acc[inv.clientId] || 0) + inv.total;
    return acc;
  }, {} as Record<string, number>);

  const topClients = clients
    .map((c) => ({
      ...c,
      totalBilled: clientSpendingMap[c.id] || 0,
    }))
    .sort((a, b) => b.totalBilled - a.totalBilled)
    .slice(0, 4);

  // Monthly Revenue Data (Mock 6-month historical series for dynamic chart)
  const monthlyData = [
    { month: 'Apr', revenue: 24500, collected: 24500, height: 45 },
    { month: 'May', revenue: 31200, collected: 30000, height: 58 },
    { month: 'Jun', revenue: 28900, collected: 27500, height: 52 },
    { month: 'Jul', revenue: 42000, collected: 39000, height: 78 },
    { month: 'Aug', revenue: 48650, collected: 43200, height: 90 },
    { month: 'Sep', revenue: 54140, collected: 38200, height: 100 },
  ];

  const [activeChartMonth, setActiveChartMonth] = useState<number | null>(5);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Executive Financial Overview
            </h1>
            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-300 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor real-time cash flow, receivable aging, customer settlements, and revenue velocity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportInvoicesToCSV(invoices)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => onOpenRecordPayment()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition shadow-sm"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Record Payment</span>
          </button>

          <button
            onClick={onOpenNewInvoice}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/25 transition active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Invoice</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Revenue */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Invoiced
            </span>
            <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              {formatCurrency(totalInvoiced)}
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-xs">
              <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-bold">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +18.4%
              </span>
              <span className="text-slate-400">vs previous period</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex justify-between">
            <span>{invoices.length} Total Invoices</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {invoices.filter((i) => i.status === 'paid').length} Settled
            </span>
          </div>
        </div>

        {/* Card 2: Collected Cash */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Cash Collected
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
              {formatCurrency(totalCollected)}
            </p>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${collectionRate}%` }}
                ></div>
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {collectionRate}%
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex justify-between">
            <span>{payments.length} Payments Received</span>
            <span className="text-emerald-600 font-semibold">Healthy Flow</span>
          </div>
        </div>

        {/* Card 3: Outstanding Receivables */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Outstanding Balance
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono tracking-tight">
              {formatCurrency(totalOutstanding)}
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-xs">
              <span className="text-slate-500">
                {invoices.filter((i) => i.status === 'pending').length} Invoices Pending Due
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex justify-between">
            <span>Avg collection: 21 days</span>
            <span className="font-semibold text-amber-600">Actionable</span>
          </div>
        </div>

        {/* Card 4: Overdue Alert */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Overdue Receivables
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono tracking-tight">
              {formatCurrency(overdueAmount)}
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-xs">
              <span className="text-rose-600 font-bold">
                {overdueInvoices.length} {overdueInvoices.length === 1 ? 'account' : 'accounts'} past due
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex justify-between">
            <span>Follow-up reminders</span>
            <button
              onClick={() => onNavigateToTab('invoices')}
              className="text-brand-600 dark:text-brand-400 font-semibold hover:underline"
            >
              View Invoices →
            </button>
          </div>
        </div>
      </div>

      {/* Middle Grid: Revenue Trend Visual & Cash Flow Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Monthly Revenue Performance Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Revenue & Collection Trajectory
              </h3>
              <p className="text-xs text-slate-500">
                Monthly billed volume compared with actual liquid collections (2026)
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-500"></span>
                <span className="text-slate-600 dark:text-slate-400">Billed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span className="text-slate-600 dark:text-slate-400">Collected</span>
              </div>
            </div>
          </div>

          {/* Interactive Chart Graphic */}
          <div className="h-56 flex items-end justify-between gap-2 sm:gap-6 pt-4 border-b border-slate-100 dark:border-slate-800 px-2">
            {monthlyData.map((item, idx) => {
              const isSelected = activeChartMonth === idx;
              return (
                <div
                  key={item.month}
                  onClick={() => setActiveChartMonth(idx)}
                  className="flex-1 flex flex-col items-center gap-2 group cursor-pointer h-full justify-end"
                >
                  {/* Tooltip on active/hover */}
                  <div
                    className={`text-[10px] sm:text-xs font-bold font-mono transition-all duration-200 ${
                      isSelected
                        ? 'text-brand-600 dark:text-brand-400 opacity-100 scale-105'
                        : 'text-slate-400 opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    {formatCurrency(item.revenue)}
                  </div>

                  {/* Dual Bar (Revenue & Collected) */}
                  <div className="w-full max-w-[48px] flex items-end gap-1 sm:gap-1.5 h-40">
                    <div
                      style={{ height: `${item.height}%` }}
                      className={`flex-1 rounded-t-lg transition-all duration-300 ${
                        isSelected
                          ? 'bg-brand-600 shadow-md shadow-brand-500/30'
                          : 'bg-brand-400/80 dark:bg-brand-500/60 group-hover:bg-brand-500'
                      }`}
                    ></div>
                    <div
                      style={{ height: `${(item.collected / item.revenue) * item.height}%` }}
                      className={`flex-1 rounded-t-lg transition-all duration-300 ${
                        isSelected
                          ? 'bg-emerald-500 shadow-md shadow-emerald-500/30'
                          : 'bg-emerald-300/80 dark:bg-emerald-500/50 group-hover:bg-emerald-400'
                      }`}
                    ></div>
                  </div>

                  {/* Month Label */}
                  <span
                    className={`text-xs font-semibold transition ${
                      isSelected
                        ? 'text-brand-600 dark:text-brand-400'
                        : 'text-slate-500 group-hover:text-slate-800 dark:group-hover:text-slate-200'
                    }`}
                  >
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Monthly Details Pill */}
          {activeChartMonth !== null && (
            <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex flex-wrap items-center justify-between text-xs gap-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {monthlyData[activeChartMonth].month} 2026 Summary:
                </span>
                <span className="text-slate-500">
                  Billed: {formatCurrency(monthlyData[activeChartMonth].revenue)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  Collected: {formatCurrency(monthlyData[activeChartMonth].collected)}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                  {Math.round(
                    (monthlyData[activeChartMonth].collected /
                      monthlyData[activeChartMonth].revenue) *
                      100
                  )}
                  % Paid
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Top Corporate Accounts */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Top Accounts by Volume
              </h3>
              <button
                onClick={() => onNavigateToTab('clients')}
                className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-semibold"
              >
                Directory →
              </button>
            </div>

            <div className="space-y-3.5">
              {topClients.map((client, idx) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                        {client.company || client.name}
                      </h4>
                      <p className="text-[11px] text-slate-500">{client.country}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                      {formatCurrency(client.totalBilled)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">Total Lifetime</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={onOpenNewClient}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40 rounded-xl transition border border-dashed border-brand-300 dark:border-brand-800"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add New Enterprise Client</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Invoices Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Billing Transactions
            </h3>
            <p className="text-xs text-slate-500">
              Real-time invoice records and settlement actions
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('invoices')}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            <span>View All Invoices ({invoices.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-3">Issue Date</th>
                <th className="py-3 px-3">Due Date</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
              {recentInvoices.map((inv) => {
                const dueStatus = getDueDateStatus(inv.dueDate, inv.status);
                return (
                  <tr
                    key={inv.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition cursor-pointer"
                    onClick={() => onViewInvoice(inv)}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {inv.clientName}
                      </p>
                      <p className="text-[11px] text-slate-400">{inv.clientEmail}</p>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                      {formatDate(inv.issueDate)}
                    </td>
                    <td className="py-3 px-3">
                      <p className="text-slate-600 dark:text-slate-400">{formatDate(inv.dueDate)}</p>
                      <span className={`text-[10px] ${dueStatus.tone}`}>{dueStatus.label}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border capitalize ${getStatusBadgeStyle(
                          inv.status
                        )}`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-slate-800 dark:text-slate-200">
                      {formatCurrency(inv.total)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {inv.balanceDue > 0 ? (
                        <span className={inv.status === 'overdue' ? 'text-rose-600' : ''}>
                          {formatCurrency(inv.balanceDue)}
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          Paid
                        </span>
                      )}
                    </td>
                    <td
                      className="py-3 px-4 text-center"
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
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
