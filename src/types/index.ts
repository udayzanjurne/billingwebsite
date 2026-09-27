export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';

export type ThemeMode = 'white' | 'light' | 'dark';

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  rateAgainstUSD: number;
}

export interface InvoiceItem {
  id: string;
  description: string;
  category?: string;
  quantity: number;
  rate: number;
  taxRate: number; // percentage, e.g., 18 for 18%
  discount: number; // percentage, e.g., 5 for 5%
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  clientTaxId?: string;
  issueDate: string;
  dueDate: string;
  poNumber?: string;
  items: InvoiceItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  shipping: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  status: InvoiceStatus;
  currency: string;
  notes?: string;
  terms?: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  taxId: string;
  website?: string;
  notes?: string;
  currency: string;
  createdAt: string;
}

export interface CatalogItem {
  id: string;
  name: string;
  sku: string;
  description: string;
  defaultRate: number;
  unit: string; // e.g. 'hr', 'unit', 'mo', 'project'
  category: string;
  taxRate: number;
}

export interface PaymentRecord {
  id: string;
  transactionRef: string;
  invoiceId: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  amount: number;
  currency: string;
  paymentMethod: 'Bank Transfer' | 'Credit Card' | 'Stripe' | 'PayPal' | 'UPI / Instant Pay' | 'Cash';
  status: 'Completed' | 'Pending' | 'Refunded';
  paymentDate: string;
  notes?: string;
}

export interface RecurringSubscription {
  id: string;
  subscriptionNumber: string;
  clientId: string;
  clientName: string;
  planName: string;
  billingCycle: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  amount: number;
  currency: string;
  status: 'Active' | 'Paused' | 'Cancelled';
  startDate: string;
  nextBillingDate: string;
  autoCharge: boolean;
}

export interface CompanySettings {
  companyName: string;
  tagline: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  taxId: string;
  bankName: string;
  bankAccount: string;
  bankRouting: string;
  swiftBic: string;
  upiId?: string;
  defaultCurrency: string;
  defaultPaymentTerms: number;
  invoicePrefix: string;
  defaultNotes: string;
  defaultTerms: string;
  logoUrl?: string;
}
