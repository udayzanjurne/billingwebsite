import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Invoice,
  Client,
  CatalogItem,
  PaymentRecord,
  RecurringSubscription,
  CompanySettings,
  CurrencyConfig,
  ThemeMode,
} from '../types';
import {
  INITIAL_COMPANY_SETTINGS,
  INITIAL_CLIENTS,
  INITIAL_CATALOG,
  INITIAL_INVOICES,
  INITIAL_PAYMENTS,
  INITIAL_SUBSCRIPTIONS,
  SUPPORTED_CURRENCIES,
} from '../data/initialData';

interface ToastState {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface BillingContextType {
  invoices: Invoice[];
  clients: Client[];
  catalog: CatalogItem[];
  payments: PaymentRecord[];
  subscriptions: RecurringSubscription[];
  companySettings: CompanySettings;
  currentCurrency: CurrencyConfig;
  theme: ThemeMode;
  darkMode: boolean;
  toasts: ToastState[];
  setTheme: (theme: ThemeMode) => void;
  setDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  setCurrency: (code: string) => void;
  formatCurrency: (amount: number) => string;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => Invoice;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  markInvoiceAsPaid: (id: string, paymentMethod?: string, notes?: string) => void;
  recordPayment: (payment: Omit<PaymentRecord, 'id' | 'transactionRef'>) => void;
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Client;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  addCatalogItem: (item: Omit<CatalogItem, 'id'>) => CatalogItem;
  updateCatalogItem: (id: string, item: Partial<CatalogItem>) => void;
  deleteCatalogItem: (id: string) => void;
  addSubscription: (sub: Omit<RecurringSubscription, 'id' | 'subscriptionNumber'>) => RecurringSubscription;
  updateSubscription: (id: string, sub: Partial<RecurringSubscription>) => void;
  deleteSubscription: (id: string) => void;
  updateCompanySettings: (settings: Partial<CompanySettings>) => void;
  resetToDemoData: () => void;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
}

const BillingContext = createContext<BillingContextType | undefined>(undefined);

const STORAGE_KEYS = {
  INVOICES: 'apexflow_invoices_v1',
  CLIENTS: 'apexflow_clients_v1',
  CATALOG: 'apexflow_catalog_v1',
  PAYMENTS: 'apexflow_payments_v1',
  SUBSCRIPTIONS: 'apexflow_subscriptions_v1',
  SETTINGS: 'apexflow_settings_v1',
  CURRENCY: 'apexflow_currency_v1',
  DARK_MODE: 'apexflow_darkmode_v1',
  THEME: 'apexflow_theme_v1',
};

export const BillingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INVOICES);
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [catalog, setCatalog] = useState<CatalogItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATALOG);
    return saved ? JSON.parse(saved) : INITIAL_CATALOG;
  });

  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
  });

  const [subscriptions, setSubscriptions] = useState<RecurringSubscription[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
    return saved ? JSON.parse(saved) : INITIAL_SUBSCRIPTIONS;
  });

  const [companySettings, setCompanySettings] = useState<CompanySettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : INITIAL_COMPANY_SETTINGS;
  });

  const [currencyCode, setCurrencyCode] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENCY);
    return saved || 'USD';
  });

  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) as ThemeMode | null;
    if (savedTheme && (savedTheme === 'white' || savedTheme === 'light' || savedTheme === 'dark')) {
      return savedTheme;
    }
    const savedDark = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
    if (savedDark !== null) {
      return savedDark === 'true' ? 'dark' : 'light';
    }
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  const [toasts, setToasts] = useState<ToastState[]>([]);

  // Apply theme classes and attributes to root HTML element
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'theme-white');
    root.removeAttribute('data-theme');

    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      localStorage.setItem(STORAGE_KEYS.DARK_MODE, 'true');
    } else if (theme === 'white') {
      root.classList.add('theme-white');
      root.setAttribute('data-theme', 'white');
      localStorage.setItem(STORAGE_KEYS.DARK_MODE, 'false');
    } else {
      root.setAttribute('data-theme', 'light');
      localStorage.setItem(STORAGE_KEYS.DARK_MODE, 'false');
    }
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATALOG, JSON.stringify(catalog));
  }, [catalog]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(companySettings));
  }, [companySettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENCY, currencyCode);
  }, [currencyCode]);

  const currentCurrency = SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode) || SUPPORTED_CURRENCIES[0];

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const formatCurrency = (amount: number): string => {
    const converted = amount * currentCurrency.rateAgainstUSD;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currentCurrency.code,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(converted);
  };

  const darkMode = theme === 'dark';

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    const label = mode === 'white' ? 'Pure White' : mode === 'light' ? 'Light' : 'Dark';
    showToast(`Switched to ${label} theme`, 'info');
  };

  const setDarkMode = (val: boolean | ((prev: boolean) => boolean)) => {
    setThemeState((prev) => {
      const nextBool = typeof val === 'function' ? val(prev === 'dark') : val;
      return nextBool ? 'dark' : 'light';
    });
  };

  const setCurrency = (code: string) => {
    const found = SUPPORTED_CURRENCIES.find((c) => c.code === code);
    if (found) {
      setCurrencyCode(code);
      showToast(`Base currency switched to ${found.name}`, 'info');
    }
  };

  const addInvoice = (newInv: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Invoice => {
    const now = new Date().toISOString().split('T')[0];
    const created: Invoice = {
      ...newInv,
      id: `inv-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    setInvoices((prev) => [created, ...prev]);
    showToast(`Invoice ${created.invoiceNumber} successfully created!`, 'success');
    return created;
  };

  const updateInvoice = (id: string, updated: Partial<Invoice>) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, ...updated, updatedAt: new Date().toISOString().split('T')[0] } : inv))
    );
    showToast('Invoice details updated', 'info');
  };

  const deleteInvoice = (id: string) => {
    const inv = invoices.find((i) => i.id === id);
    setInvoices((prev) => prev.filter((i) => i.id !== id));
    showToast(`Invoice ${inv?.invoiceNumber || ''} deleted`, 'info');
  };

  const markInvoiceAsPaid = (id: string, paymentMethod = 'Bank Transfer', notes = 'Marked paid from dashboard') => {
    const inv = invoices.find((i) => i.id === id);
    if (!inv) return;

    const now = new Date().toISOString().split('T')[0];
    const balanceToPay = inv.balanceDue > 0 ? inv.balanceDue : inv.total;

    // Record payment
    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      transactionRef: `TXN-${Math.floor(1000000 + Math.random() * 9000000)}`,
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      clientId: inv.clientId,
      clientName: inv.clientName,
      amount: balanceToPay,
      currency: inv.currency,
      paymentMethod: paymentMethod as any,
      status: 'Completed',
      paymentDate: now,
      notes,
    };

    setPayments((prev) => [newPayment, ...prev]);

    setInvoices((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              status: 'paid',
              amountPaid: i.total,
              balanceDue: 0,
              paidAt: now,
              updatedAt: now,
            }
          : i
      )
    );

    // Fire celebratory confetti!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    showToast(`Payment of ${formatCurrency(balanceToPay)} recorded for ${inv.invoiceNumber}!`, 'success');
  };

  const recordPayment = (p: Omit<PaymentRecord, 'id' | 'transactionRef'>) => {
    const newPayment: PaymentRecord = {
      ...p,
      id: `pay-${Date.now()}`,
      transactionRef: `TXN-${Math.floor(1000000 + Math.random() * 9000000)}`,
    };

    setPayments((prev) => [newPayment, ...prev]);

    // Update invoice paid balance
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === p.invoiceId) {
          const newPaid = inv.amountPaid + p.amount;
          const newBalance = Math.max(0, inv.total - newPaid);
          const newStatus = newBalance <= 0.01 ? 'paid' : inv.status;
          return {
            ...inv,
            amountPaid: newPaid,
            balanceDue: newBalance,
            status: newStatus,
            paidAt: newStatus === 'paid' ? p.paymentDate : inv.paidAt,
            updatedAt: new Date().toISOString().split('T')[0],
          };
        }
        return inv;
      })
    );

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
    });

    showToast(`Payment recorded successfully! Ref: ${newPayment.transactionRef}`, 'success');
  };

  const addClient = (c: Omit<Client, 'id' | 'createdAt'>): Client => {
    const newClient: Client = {
      ...c,
      id: `cli-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setClients((prev) => [newClient, ...prev]);
    showToast(`Client "${newClient.company || newClient.name}" added`, 'success');
    return newClient;
  };

  const updateClient = (id: string, updated: Partial<Client>) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    showToast('Client details updated', 'info');
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
    showToast('Client removed from directory', 'info');
  };

  const addCatalogItem = (item: Omit<CatalogItem, 'id'>): CatalogItem => {
    const newItem: CatalogItem = {
      ...item,
      id: `cat-${Date.now()}`,
    };
    setCatalog((prev) => [newItem, ...prev]);
    showToast(`Item "${newItem.name}" added to catalog`, 'success');
    return newItem;
  };

  const updateCatalogItem = (id: string, updated: Partial<CatalogItem>) => {
    setCatalog((prev) => prev.map((item) => (item.id === id ? { ...item, ...updated } : item)));
    showToast('Catalog item updated', 'info');
  };

  const deleteCatalogItem = (id: string) => {
    setCatalog((prev) => prev.filter((item) => item.id !== id));
    showToast('Item deleted from catalog', 'info');
  };

  const addSubscription = (sub: Omit<RecurringSubscription, 'id' | 'subscriptionNumber'>): RecurringSubscription => {
    const newSub: RecurringSubscription = {
      ...sub,
      id: `sub-${Date.now()}`,
      subscriptionNumber: `SUB-2026-0${subscriptions.length + 1}`,
    };
    setSubscriptions((prev) => [newSub, ...prev]);
    showToast(`Recurring profile ${newSub.subscriptionNumber} started`, 'success');
    return newSub;
  };

  const updateSubscription = (id: string, updated: Partial<RecurringSubscription>) => {
    setSubscriptions((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
    showToast('Subscription updated', 'info');
  };

  const deleteSubscription = (id: string) => {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
    showToast('Subscription cancelled & removed', 'info');
  };

  const updateCompanySettings = (updated: Partial<CompanySettings>) => {
    setCompanySettings((prev) => ({ ...prev, ...updated }));
    showToast('Company profile & billing settings saved', 'success');
  };

  const resetToDemoData = () => {
    setInvoices(INITIAL_INVOICES);
    setClients(INITIAL_CLIENTS);
    setCatalog(INITIAL_CATALOG);
    setPayments(INITIAL_PAYMENTS);
    setSubscriptions(INITIAL_SUBSCRIPTIONS);
    setCompanySettings(INITIAL_COMPANY_SETTINGS);
    setCurrencyCode('USD');
    showToast('Reset to original enterprise demo data', 'info');
  };

  return (
    <BillingContext.Provider
      value={{
        invoices,
        clients,
        catalog,
        payments,
        subscriptions,
        companySettings,
        currentCurrency,
        theme,
        darkMode,
        toasts,
        setTheme,
        setDarkMode,
        setCurrency,
        formatCurrency,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        markInvoiceAsPaid,
        recordPayment,
        addClient,
        updateClient,
        deleteClient,
        addCatalogItem,
        updateCatalogItem,
        deleteCatalogItem,
        addSubscription,
        updateSubscription,
        deleteSubscription,
        updateCompanySettings,
        resetToDemoData,
        showToast,
        removeToast,
      }}
    >
      {children}
    </BillingContext.Provider>
  );
};

export const useBilling = () => {
  const context = useContext(BillingContext);
  if (!context) {
    throw new Error('useBilling must be used within a BillingProvider');
  }
  return context;
};
