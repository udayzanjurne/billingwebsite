import React, { useState } from 'react';
import { useBilling } from '../../context/BillingContext';
import { SUPPORTED_CURRENCIES } from '../../data/initialData';
import {
  Settings,
  Building,
  CreditCard,
  FileText,
  DollarSign,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  Globe,
  Save,
  Palette,
  CircleDot,
  Sun,
  Moon,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    companySettings,
    updateCompanySettings,
    resetToDemoData,
    currentCurrency,
    setCurrency,
    showToast,
    theme,
    setTheme,
  } = useBilling();

  const [form, setForm] = useState(companySettings);

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanySettings(form);
  };

  const handleExportBackup = () => {
    const backupData = {
      invoices: JSON.parse(localStorage.getItem('apexflow_invoices_v1') || '[]'),
      clients: JSON.parse(localStorage.getItem('apexflow_clients_v1') || '[]'),
      catalog: JSON.parse(localStorage.getItem('apexflow_catalog_v1') || '[]'),
      payments: JSON.parse(localStorage.getItem('apexflow_payments_v1') || '[]'),
      subscriptions: JSON.parse(localStorage.getItem('apexflow_subscriptions_v1') || '[]'),
      settings: form,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ApexFlow_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Full system backup exported as JSON', 'success');
  };

  return (
    <div className="space-y-6 pb-16 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Settings & Business Profile
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure legal entity details, banking payout rails, default tax terms, and data backup
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/25 transition active:scale-[0.98] self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Company Profile */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Building className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Legal Entity Profile
              </h2>
              <p className="text-[11px] text-slate-400">
                Printed as the billing issuer on customer invoices and official statements
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Company Legal Name
              </label>
              <input
                type="text"
                value={form.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Tagline / Industry Subtitle
              </label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Billing Support Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Business Phone
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Street Address
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-3 sm:col-span-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  State / ZIP
                </label>
                <input
                  type="text"
                  value={`${form.state} ${form.zip}`}
                  onChange={(e) => {
                    const parts = e.target.value.split(' ');
                    handleChange('state', parts[0] || '');
                    handleChange('zip', parts[1] || '');
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Tax Identifier (EIN / VAT / GSTIN)
              </label>
              <input
                type="text"
                value={form.taxId}
                onChange={(e) => handleChange('taxId', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Bank & Electronic Settlement Details */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Bank Wire & Payout Instructions
              </h2>
              <p className="text-[11px] text-slate-400">
                Direct wire coordinates rendered on invoices for B2B settlements
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                value={form.bankName}
                onChange={(e) => handleChange('bankName', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Account Number / IBAN
              </label>
              <input
                type="text"
                value={form.bankAccount}
                onChange={(e) => handleChange('bankAccount', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Routing / Sort Code
              </label>
              <input
                type="text"
                value={form.bankRouting}
                onChange={(e) => handleChange('bankRouting', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                SWIFT / BIC Code
              </label>
              <input
                type="text"
                value={form.swiftBic}
                onChange={(e) => handleChange('swiftBic', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                UPI ID (Instant Pay)
              </label>
              <input
                type="text"
                value={form.upiId || ''}
                onChange={(e) => handleChange('upiId', e.target.value)}
                placeholder="apexflow@okaxis"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Invoicing Defaults & Terms */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Invoice Defaults & Terms
              </h2>
              <p className="text-[11px] text-slate-400">
                Preset parameters for newly created customer bills
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Invoice Number Prefix
              </label>
              <input
                type="text"
                value={form.invoicePrefix}
                onChange={(e) => handleChange('invoicePrefix', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Default Payment Window
              </label>
              <select
                value={form.defaultPaymentTerms}
                onChange={(e) => handleChange('defaultPaymentTerms', Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none"
              >
                <option value="0">Due Immediately on Receipt</option>
                <option value="15">Net 15 Days</option>
                <option value="30">Net 30 Days</option>
                <option value="60">Net 60 Days</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Default Customer Note
              </label>
              <textarea
                rows={2}
                value={form.defaultNotes}
                onChange={(e) => handleChange('defaultNotes', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Default Terms & Conditions
              </label>
              <textarea
                rows={3}
                value={form.defaultTerms}
                onChange={(e) => handleChange('defaultTerms', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Appearance & Interface Theme */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Palette className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Appearance & Workspace Theme
              </h2>
              <p className="text-[11px] text-slate-400">
                Choose between crisp pure white, soft daylight slate, or deep night mode
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* White Option */}
            <button
              type="button"
              onClick={() => setTheme('white')}
              className={`p-4 rounded-xl border text-left transition relative flex flex-col justify-between ${
                theme === 'white'
                  ? 'border-brand-600 bg-brand-50/20 ring-2 ring-brand-500/20 dark:ring-brand-500/40'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg border border-slate-300 bg-white flex items-center justify-center text-slate-700 shadow-xs">
                    <CircleDot className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">White Theme</h3>
                    <p className="text-[10px] text-slate-400">Pure Canvas</p>
                  </div>
                </div>
                {theme === 'white' && (
                  <span className="w-2 h-2 rounded-full bg-brand-600"></span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Brilliant #ffffff paper-white background with crisp borders and minimal contrast.
              </p>
            </button>

            {/* Light Option */}
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-4 rounded-xl border text-left transition relative flex flex-col justify-between ${
                theme === 'light'
                  ? 'border-brand-600 bg-brand-50/20 ring-2 ring-brand-500/20 dark:ring-brand-500/40'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 shadow-xs">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">Light Theme</h3>
                    <p className="text-[10px] text-slate-400">Soft Slate</p>
                  </div>
                </div>
                {theme === 'light' && (
                  <span className="w-2 h-2 rounded-full bg-brand-600"></span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Balanced cool gray/slate-50 backdrop with floating white panels for smooth depth.
              </p>
            </button>

            {/* Dark Option */}
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border text-left transition relative flex flex-col justify-between ${
                theme === 'dark'
                  ? 'border-brand-600 bg-brand-50/20 ring-2 ring-brand-500/20 dark:ring-brand-500/40'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-indigo-400 shadow-xs">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">Dark Theme</h3>
                    <p className="text-[10px] text-slate-400">Deep Slate</p>
                  </div>
                </div>
                {theme === 'dark' && (
                  <span className="w-2 h-2 rounded-full bg-brand-600"></span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Deep slate-950 night palette optimized for reduced eye strain and OLED displays.
              </p>
            </button>
          </div>
        </div>

        {/* Section 5: Data Management & Reset */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Download className="w-5 h-5 text-slate-500" />
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Data Backup & System Reset
              </h2>
              <p className="text-[11px] text-slate-400">
                Safeguard billing records or restore original demonstration dataset
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleExportBackup}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export Full JSON Ledger</span>
            </button>

            <button
              type="button"
              onClick={resetToDemoData}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 text-xs font-semibold transition"
            >
              <RotateCcw className="w-4 h-4 text-rose-500" />
              <span>Reset to Sample Enterprise Data</span>
            </button>
          </div>
        </div>

        {/* Bottom Save bar */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/30 transition"
          >
            <Save className="w-4 h-4" />
            <span>Save All Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
