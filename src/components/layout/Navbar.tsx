import React from 'react';
import { useBilling } from '../../context/BillingContext';
import { SUPPORTED_CURRENCIES } from '../../data/initialData';
import {
  Sun,
  Moon,
  Plus,
  Search,
  Building2,
  ChevronDown,
  Sparkles,
  CircleDot,
} from 'lucide-react';

interface NavbarProps {
  onOpenNewInvoice: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeTab: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewInvoice,
  searchQuery,
  onSearchChange,
  activeTab,
}) => {
  const {
    companySettings,
    currentCurrency,
    setCurrency,
    theme,
    setTheme,
  } = useBilling();

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Organization Title & Current View indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white leading-tight">
                <span>{companySettings.companyName}</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-brand-100 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 font-semibold border border-brand-200 dark:border-brand-800">
                  PRO
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                {activeTab} Overview
              </p>
            </div>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-md mx-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search invoices, clients, PO numbers..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-brand-500 dark:focus:border-brand-500 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Right: Currency selector, Theme toggle, New Invoice Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Currency Switcher */}
          <div className="relative group">
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
              <span className="font-semibold text-brand-600 dark:text-brand-400">{currentCurrency.symbol}</span>
              <span>{currentCurrency.code}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <select
              value={currentCurrency.code}
              onChange={(e) => setCurrency(e.target.value)}
              aria-label="Select currency"
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.symbol} - {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* 3-Way Theme Toggle: White, Light, Dark */}
          <div
            className="flex items-center p-0.5 sm:p-1 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-inner"
            role="group"
            aria-label="Theme options: White, Light, Dark"
          >
            {/* White Theme */}
            <button
              type="button"
              onClick={() => setTheme('white')}
              title="White theme (Pure crisp white canvas)"
              aria-pressed={theme === 'white'}
              className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                theme === 'white'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <CircleDot className={`w-3.5 h-3.5 ${theme === 'white' ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">White</span>
            </button>

            {/* Light Theme */}
            <button
              type="button"
              onClick={() => setTheme('light')}
              title="Light theme (Soft slate daytime mode)"
              aria-pressed={theme === 'light'}
              className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                theme === 'light'
                  ? 'bg-white text-amber-700 shadow-sm border border-slate-200'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Sun className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-amber-500' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">Light</span>
            </button>

            {/* Dark Theme */}
            <button
              type="button"
              onClick={() => setTheme('dark')}
              title="Dark theme (Deep dark night mode)"
              aria-pressed={theme === 'dark'}
              className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                theme === 'dark'
                  ? 'bg-slate-900 text-indigo-300 shadow-sm border border-slate-750'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Moon className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-indigo-400' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">Dark</span>
            </button>
          </div>

          {/* Quick Create Invoice CTA */}
          <button
            onClick={onOpenNewInvoice}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm shadow-md shadow-brand-600/25 transition active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">New Invoice</span>
          </button>
        </div>
      </div>
    </header>
  );
};
