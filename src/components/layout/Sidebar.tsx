import React from 'react';
import { useBilling } from '../../context/BillingContext';
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  CreditCard,
  Repeat,
  Settings,
  RotateCcw,
  Zap,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { invoices, clients, resetToDemoData, formatCurrency } = useBilling();

  const pendingOrOverdueCount = invoices.filter(
    (i) => i.status === 'pending' || i.status === 'overdue'
  ).length;

  const totalOutstanding = invoices
    .filter((i) => i.status !== 'paid' && i.status !== 'cancelled')
    .reduce((acc, curr) => acc + curr.balanceDue, 0);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'invoices',
      label: 'Invoices',
      icon: FileText,
      badge: pendingOrOverdueCount > 0 ? pendingOrOverdueCount : null,
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300',
    },
    {
      id: 'clients',
      label: 'Clients',
      icon: Users,
      badge: clients.length,
      badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    },
    { id: 'catalog', label: 'Products & Items', icon: Package },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'subscriptions', label: 'Subscriptions', icon: Repeat },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 min-h-[calc(100vh-4rem)] p-4 select-none justify-between transition-colors">
      <div>
        {/* Quick Nav Links */}
        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            Main Menu
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition ${
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-semibold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4.5 h-4.5 ${
                      isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && item.badge !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Summary Card & Reset Demo Action */}
      <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-brand-900 to-indigo-950 text-white relative overflow-hidden shadow-lg shadow-brand-950/20">
          <div className="absolute top-0 right-0 p-3 opacity-15">
            <Zap className="w-16 h-16" />
          </div>
          <p className="text-xs text-brand-200 font-medium">Uncollected Receivables</p>
          <p className="text-xl font-extrabold tracking-tight mt-0.5 text-white">
            {formatCurrency(totalOutstanding)}
          </p>
          <div className="mt-2 text-xs flex items-center justify-between text-brand-200/90 pt-2 border-t border-brand-800/60">
            <span>{pendingOrOverdueCount} Unpaid Invoices</span>
            <span className="text-emerald-300 font-medium">Real-time</span>
          </div>
        </div>

        <button
          onClick={resetToDemoData}
          title="Reset database to demo invoices and clients"
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Sample Demo Data</span>
        </button>
      </div>
    </aside>
  );
};
