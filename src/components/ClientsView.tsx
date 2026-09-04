import React, { useState } from 'react';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  DollarSign, 
  CheckCircle2, 
  Search, 
  Plus, 
  ArrowUpRight 
} from 'lucide-react';
import { Quotation } from '../types';
import { calculateQuotationTotals, formatCurrency } from '../utils/calculations';

interface ClientsViewProps {
  quotations: Quotation[];
  onSelectQuote: (quote: Quotation) => void;
  onNewQuotation: () => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  quotations,
  onSelectQuote,
  onNewQuotation
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Group quotations by client
  const clientMap = new Map<string, Quotation[]>();
  quotations.forEach(q => {
    const key = q.client.companyName;
    if (!clientMap.has(key)) {
      clientMap.set(key, []);
    }
    clientMap.get(key)!.push(q);
  });

  const clients = Array.from(clientMap.entries()).map(([name, quotes]) => {
    const sample = quotes[0];
    const totalQuoted = quotes.reduce((acc, q) => acc + calculateQuotationTotals(q).totalAmount, 0);
    const approvedCount = quotes.filter(q => q.status === 'approved').length;
    return {
      name,
      taxId: sample.client.taxId,
      contactName: sample.client.contactName,
      contactRole: sample.client.contactRole,
      contactEmail: sample.client.contactEmail,
      contactPhone: sample.client.contactPhone,
      industry: sample.client.industry,
      country: sample.client.country,
      quotes,
      totalQuoted,
      approvedCount
    };
  }).filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Client Directory & Corporate Accounts
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Empresas & Clientes Corporativos SAP
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Historial consolidado de cotizaciones, contactos clave y volumen presupuestado por cliente.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por razón social o contacto..."
            className="w-full text-xs pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Grid of Client Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {clients.map(client => (
          <div
            key={client.name}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {client.industry}
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {client.country}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {client.name}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                RUT/ID: {client.taxId}
              </p>

              {/* Contact Info */}
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="font-semibold text-slate-800">
                  {client.contactName}
                  <span className="block text-[11px] font-normal text-slate-500">{client.contactRole}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{client.contactEmail}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{client.contactPhone}</span>
                </div>
              </div>

              {/* Proposals History List */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                  Cotizaciones Asociadas ({client.quotes.length})
                </span>
                <div className="space-y-1.5">
                  {client.quotes.map(q => {
                    const qTotals = calculateQuotationTotals(q);
                    return (
                      <div
                        key={q.id}
                        onClick={() => onSelectQuote(q)}
                        className="p-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 transition-colors cursor-pointer flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-mono font-bold text-blue-700">{q.code}</span>
                          <span className="text-[11px] text-slate-500 truncate max-w-[130px]">{q.project.projectTitle}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-mono font-bold text-slate-700">
                            {formatCurrency(qTotals.totalAmount, q.currency, q.currencySymbol)}
                          </span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Metrics Footer */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Presupuestado</span>
                <span className="text-base font-black text-blue-600 font-mono">
                  {formatCurrency(client.totalQuoted, client.quotes[0]?.currency, client.quotes[0]?.currencySymbol)}
                </span>
              </div>
              <button
                onClick={onNewQuotation}
                className="bg-white px-3 py-1.5 text-xs font-bold text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg border border-slate-200 hover:border-blue-600 shadow-xs transition-all cursor-pointer"
              >
                + Nueva Propuesta
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
