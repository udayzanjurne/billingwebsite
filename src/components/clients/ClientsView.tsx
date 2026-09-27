import React, { useState, useMemo } from 'react';
import { useBilling } from '../../context/BillingContext';
import { Client } from '../../types';
import {
  Users,
  UserPlus,
  Search,
  Building,
  Mail,
  Phone,
  MapPin,
  FileText,
  DollarSign,
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
} from 'lucide-react';

interface ClientsViewProps {
  onOpenNewClient: () => void;
  onEditClient: (client: Client) => void;
  onOpenNewInvoiceForClient: (clientId: string) => void;
  onViewClientInvoices: (clientId: string) => void;
  searchQuery: string;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  onOpenNewClient,
  onEditClient,
  onOpenNewInvoiceForClient,
  onViewClientInvoices,
  searchQuery,
}) => {
  const { clients, invoices, deleteClient, formatCurrency } = useBilling();

  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    const q = searchQuery.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.taxId?.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q)
    );
  }, [clients, searchQuery]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Client Directory & Accounts CRM
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage enterprise accounts, contacts, tax compliance IDs, and billing ledgers
          </p>
        </div>

        <button
          onClick={onOpenNewClient}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/25 transition active:scale-[0.98] self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Account</span>
        </button>
      </div>

      {/* Grid of Client Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredClients.map((client) => {
          const clientInvoices = invoices.filter((i) => i.clientId === client.id);
          const totalBilled = clientInvoices.reduce((sum, i) => sum + i.total, 0);
          const totalOutstanding = clientInvoices
            .filter((i) => i.status !== 'paid' && i.status !== 'cancelled')
            .reduce((sum, i) => sum + i.balanceDue, 0);

          return (
            <div
              key={client.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Card Top: Avatar & Company */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center font-bold text-base shadow-sm shadow-brand-500/20">
                      {client.company.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                        {client.company}
                      </h3>
                      <p className="text-xs text-slate-500">{client.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditClient(client)}
                      title="Edit Client"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            `Remove client ${client.company}? Their existing invoices will be preserved.`
                          )
                        ) {
                          deleteClient(client.id);
                        }
                      }}
                      title="Delete Client"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Contact Info List */}
                <div className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      {client.city}, {client.country}
                    </span>
                  </div>
                  {client.taxId && (
                    <div className="pt-1 font-mono text-[11px] text-slate-500">
                      ID: {client.taxId}
                    </div>
                  )}
                </div>

                {/* Financial Summary Pill */}
                <div className="mt-4 grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Lifetime Billed
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                      {formatCurrency(totalBilled)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Outstanding
                    </span>
                    <span
                      className={`text-xs font-mono font-bold ${
                        totalOutstanding > 0
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {totalOutstanding > 0 ? formatCurrency(totalOutstanding) : 'Settled'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <button
                  onClick={() => onViewClientInvoices(client.id)}
                  className="font-medium text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{clientInvoices.length} Invoices</span>
                </button>

                <button
                  onClick={() => onOpenNewInvoiceForClient(client.id)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Bill Client</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredClients.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <Users className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No clients found matching your search
          </h3>
        </div>
      )}
    </div>
  );
};
