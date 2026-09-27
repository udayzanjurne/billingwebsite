import React, { useState } from 'react';
import { BillingProvider, useBilling } from './context/BillingContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { ToastContainer } from './components/common/ToastContainer';
import { DashboardView } from './components/dashboard/DashboardView';
import { InvoicesView } from './components/invoices/InvoicesView';
import { ClientsView } from './components/clients/ClientsView';
import { CatalogView } from './components/catalog/CatalogView';
import { PaymentsView } from './components/payments/PaymentsView';
import { SubscriptionsView } from './components/subscriptions/SubscriptionsView';
import { SettingsView } from './components/settings/SettingsView';
import { InvoiceModal } from './components/invoices/InvoiceModal';
import { InvoiceViewerModal } from './components/invoices/InvoiceViewerModal';
import { RecordPaymentModal } from './components/payments/RecordPaymentModal';
import { ClientModal } from './components/clients/ClientModal';
import { Invoice, Client } from './types';

const MainApplication: React.FC = () => {
  const { theme } = useBilling();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  const [isInvoiceViewerOpen, setIsInvoiceViewerOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentInvoiceId, setPaymentInvoiceId] = useState<string | undefined>(undefined);

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Handlers
  const handleOpenNewInvoice = () => {
    setEditingInvoice(null);
    setIsInvoiceModalOpen(true);
  };

  const handleEditInvoice = (inv: Invoice) => {
    setEditingInvoice(inv);
    setIsInvoiceModalOpen(true);
  };

  const handleViewInvoice = (inv: Invoice) => {
    setViewingInvoice(inv);
    setIsInvoiceViewerOpen(true);
  };

  const handleOpenRecordPayment = (invoiceId?: string) => {
    setPaymentInvoiceId(invoiceId);
    setIsPaymentModalOpen(true);
  };

  const handleOpenNewClient = () => {
    setEditingClient(null);
    setIsClientModalOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setIsClientModalOpen(true);
  };

  const handleOpenNewInvoiceForClient = (clientId: string) => {
    setEditingInvoice(null);
    setIsInvoiceModalOpen(true);
  };

  const handleViewClientInvoices = (clientId: string) => {
    setActiveTab('invoices');
  };

  return (
    <div
      className={`min-h-screen theme-page-bg flex flex-col font-sans transition-colors duration-200 ${
        theme === 'dark'
          ? 'bg-slate-950 text-slate-100'
          : theme === 'white'
          ? 'bg-white text-slate-900'
          : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Top Navbar */}
      <Navbar
        onOpenNewInvoice={handleOpenNewInvoice}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={activeTab}
      />

      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Desktop Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
          {activeTab === 'dashboard' && (
            <DashboardView
              onOpenNewInvoice={handleOpenNewInvoice}
              onOpenRecordPayment={handleOpenRecordPayment}
              onOpenNewClient={handleOpenNewClient}
              onViewInvoice={handleViewInvoice}
              onEditInvoice={handleEditInvoice}
              onNavigateToTab={setActiveTab}
            />
          )}

          {activeTab === 'invoices' && (
            <InvoicesView
              onOpenNewInvoice={handleOpenNewInvoice}
              onViewInvoice={handleViewInvoice}
              onEditInvoice={handleEditInvoice}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'clients' && (
            <ClientsView
              onOpenNewClient={handleOpenNewClient}
              onEditClient={handleEditClient}
              onOpenNewInvoiceForClient={handleOpenNewInvoiceForClient}
              onViewClientInvoices={handleViewClientInvoices}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'catalog' && <CatalogView />}

          {activeTab === 'payments' && (
            <PaymentsView
              onOpenRecordPayment={() => handleOpenRecordPayment()}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'subscriptions' && <SubscriptionsView />}

          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Shared Modals */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        invoiceToEdit={editingInvoice}
        onOpenNewClientModal={handleOpenNewClient}
      />

      <InvoiceViewerModal
        isOpen={isInvoiceViewerOpen}
        onClose={() => setIsInvoiceViewerOpen(false)}
        invoice={viewingInvoice}
        onEdit={handleEditInvoice}
      />

      <RecordPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        defaultInvoiceId={paymentInvoiceId}
      />

      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        clientToEdit={editingClient}
      />

      {/* Real-time feedback toast notifications */}
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <BillingProvider>
      <MainApplication />
    </BillingProvider>
  );
}

export default App;
