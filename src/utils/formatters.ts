import { InvoiceStatus } from '../types';

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const getDueDateStatus = (dueDateStr: string, status: InvoiceStatus) => {
  if (status === 'paid') return { label: 'Settled', tone: 'text-emerald-600 dark:text-emerald-400' };
  if (status === 'draft') return { label: 'Draft', tone: 'text-slate-500 dark:text-slate-400' };

  const due = new Date(dueDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      label: `${Math.abs(diffDays)}d overdue`,
      tone: 'text-rose-600 dark:text-rose-400 font-semibold',
    };
  } else if (diffDays === 0) {
    return { label: 'Due today', tone: 'text-amber-600 dark:text-amber-400 font-semibold' };
  } else {
    return { label: `Due in ${diffDays}d`, tone: 'text-slate-600 dark:text-slate-400' };
  }
};

export const getStatusBadgeStyle = (status: InvoiceStatus) => {
  switch (status) {
    case 'paid':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/80';
    case 'pending':
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/80';
    case 'overdue':
      return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/80';
    case 'draft':
      return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700';
    case 'cancelled':
      return 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

export const exportInvoicesToCSV = (invoices: any[]) => {
  const headers = ['Invoice Number', 'Client', 'Issue Date', 'Due Date', 'Total', 'Amount Paid', 'Balance Due', 'Status'];
  const rows = invoices.map((i) => [
    i.invoiceNumber,
    `"${i.clientName.replace(/"/g, '""')}"`,
    i.issueDate,
    i.dueDate,
    i.total,
    i.amountPaid,
    i.balanceDue,
    i.status.toUpperCase(),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Invoices_Export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
