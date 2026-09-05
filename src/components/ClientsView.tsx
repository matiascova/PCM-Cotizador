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
  ArrowUpRight,
  Edit3,
  Trash2,
  ShieldCheck,
  Briefcase,
  Sparkles,
  LayoutGrid,
  List,
  Filter
} from 'lucide-react';
import { Quotation, ClientMasterItem, CompanyProfile } from '../types';
import { calculateQuotationTotals, formatCurrency } from '../utils/calculations';
import { getStoredClients, saveStoredClients } from '../data/clientsMaster';
import { getStoredCompanyProfile, saveStoredCompanyProfile } from '../data/companyProfile';
import { ClientModal } from './ClientModal';
import { CompanySettingsView } from './CompanySettingsView';

interface ClientsViewProps {
  quotations: Quotation[];
  onSelectQuote: (quote: Quotation) => void;
  onNewQuotation: () => void;
  onNewQuotationWithClient?: (client: ClientMasterItem) => void;
  clients?: ClientMasterItem[];
  onUpdateClients?: (clients: ClientMasterItem[]) => void;
  companyProfile?: CompanyProfile;
  onUpdateCompanyProfile?: (profile: CompanyProfile) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  quotations,
  onSelectQuote,
  onNewQuotation,
  onNewQuotationWithClient,
  clients: propClients,
  onUpdateClients: propOnUpdateClients,
  companyProfile: propCompanyProfile,
  onUpdateCompanyProfile: propOnUpdateCompanyProfile
}) => {
  const [internalClients, setInternalClients] = useState<ClientMasterItem[]>(getStoredClients);
  const [internalCompany, setInternalCompany] = useState<CompanyProfile>(getStoredCompanyProfile);

  const clients = propClients || internalClients;
  const setClients = (newClients: ClientMasterItem[]) => {
    if (propOnUpdateClients) {
      propOnUpdateClients(newClients);
    } else {
      setInternalClients(newClients);
      saveStoredClients(newClients);
    }
  };

  const companyProfile = propCompanyProfile || internalCompany;
  const setCompany = (newCompany: CompanyProfile) => {
    if (propOnUpdateCompanyProfile) {
      propOnUpdateCompanyProfile(newCompany);
    } else {
      setInternalCompany(newCompany);
      saveStoredCompanyProfile(newCompany);
    }
  };

  const handleCreateQuoteForClient = (client: ClientMasterItem) => {
    if (onNewQuotationWithClient) {
      onNewQuotationWithClient(client);
    } else {
      onNewQuotation();
    }
  };

  const [activeSubTab, setActiveSubTab] = useState<'clients' | 'company'>('clients');
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientMasterItem | null>(null);

  // Group quotations by client name or taxId for telemetry
  const getClientQuotes = (c: ClientMasterItem) => {
    return quotations.filter(
      q => q.client.taxId === c.taxId || 
           q.client.companyName.toLowerCase() === c.companyName.toLowerCase() ||
           (c.fantasyName && q.client.companyName.toLowerCase() === c.fantasyName.toLowerCase())
    );
  };

  const filteredClients = clients.filter(c => {
    const matchesSearch = 
      c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.fantasyName && c.fantasyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.taxId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.businessActivity && c.businessActivity.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.comuna && c.comuna.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.contactName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesIndustry = industryFilter === 'all' || c.industry === industryFilter;

    return matchesSearch && matchesIndustry;
  });

  const industries = Array.from(new Set(clients.map(c => c.industry).filter(Boolean)));

  const handleOpenNewClient = () => {
    setEditingClient(null);
    setIsClientModalOpen(true);
  };

  const handleEditClient = (c: ClientMasterItem) => {
    setEditingClient(c);
    setIsClientModalOpen(true);
  };

  const handleDeleteClient = (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de eliminar al cliente "${name}" del Maestro de Clientes?`)) {
      const updated = clients.filter(c => c.id !== id);
      setClients(updated);
    }
  };

  const handleSaveClient = (saved: ClientMasterItem) => {
    const exists = clients.some(c => c.id === saved.id);
    let updated: ClientMasterItem[];
    if (exists) {
      updated = clients.map(c => c.id === saved.id ? saved : c);
    } else {
      updated = [saved, ...clients];
    }
    setClients(updated);
    setIsClientModalOpen(false);
    setEditingClient(null);
  };

  return (
    <div className="space-y-6">
      {/* Primary Sub-Navigation Bar: Maestro de Clientes vs. Nuestra Empresa & Logo */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveSubTab('clients')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'clients'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Maestro de Clientes SII ({clients.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('company')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'company'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Nuestra Empresa & Logotipo Emisor</span>
          </button>
        </div>

        {activeSubTab === 'clients' && (
          <button
            type="button"
            onClick={handleOpenNewClient}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Nuevo Cliente</span>
          </button>
        )}
      </div>

      {/* RENDER TAB 1: CLIENTS MASTER */}
      {activeSubTab === 'clients' ? (
        <div className="space-y-6">
          {/* Top Banner & Search Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Chilean SII Tax Registry & Enterprise Directory
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  Maestro de Clientes Corporativos & Datos SII
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Catálogo centralizado de razones sociales, RUTs, giros comerciales, domicilios legales y logotipos de clientes.
                </p>
              </div>

              {/* View Switcher */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                      viewMode === 'cards' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title="Vista de Tarjetas"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                      viewMode === 'table' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title="Vista de Tabla Detallada"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Buscar por Razón Social, Nombre de Fantasía, RUT, Giro, Comuna o Contacto..."
                  className="w-full text-xs pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="w-full sm:w-64">
                <select
                  value={industryFilter}
                  onChange={e => setIndustryFilter(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white cursor-pointer"
                >
                  <option value="all">Todas las industrias ({clients.length})</option>
                  {industries.map(ind => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Cards View */}
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredClients.map(client => {
                const quotes = getClientQuotes(client);
                const totalQuoted = quotes.reduce((acc, q) => acc + calculateQuotationTotals(q).totalAmount, 0);
                const approvedCount = quotes.filter(q => q.status === 'approved').length;

                return (
                  <div
                    key={client.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all p-5 flex flex-col justify-between group"
                  >
                    <div className="space-y-4">
                      {/* Card Header: Client Logo & Tags */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {client.logoUrl ? (
                            <div className="w-14 h-12 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                              <img
                                src={client.logoUrl}
                                alt={client.companyName}
                                className="max-h-full max-w-full object-contain"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                              {client.fantasyName 
                                ? client.fantasyName.slice(0, 2).toUpperCase() 
                                : client.companyName.slice(0, 2).toUpperCase()}
                            </div>
                          )}

                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block truncate">
                              {client.industry}
                            </span>
                            <h3 className="text-base font-bold text-slate-900 leading-snug truncate" title={client.fantasyName || client.companyName}>
                              {client.fantasyName || client.companyName}
                            </h3>
                          </div>
                        </div>

                        {/* Actions Menu */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleEditClient(client)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Editar ficha del cliente"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClient(client.id, client.companyName)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar cliente"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Tax Details SII */}
                      <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 text-[11px]">RUT / ID:</span>
                          <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {client.taxId}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-500 text-[11px] block">Razón Social:</span>
                          <span className="font-semibold text-slate-800 truncate block">
                            {client.companyName}
                          </span>
                        </div>

                        {client.businessActivity && (
                          <div>
                            <span className="text-slate-500 text-[11px] block">Giro SII:</span>
                            <span className="text-slate-700 line-clamp-2 text-[11px] leading-relaxed">
                              {client.businessActivity}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-1 text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">
                            {client.comuna ? `${client.comuna}, ${client.city || 'Chile'}` : client.city || 'Chile'}
                          </span>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                        <div className="font-semibold text-slate-800">
                          {client.contactName}
                          <span className="block text-[11px] font-normal text-slate-500">{client.contactRole}</span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate">{client.contactEmail}</span>
                        </div>

                        {client.contactPhone && (
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{client.contactPhone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Metrics & Create Quote Action */}
                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                          Cotizaciones
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {quotes.length} ({approvedCount} aprobadas)
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCreateQuoteForClient(client)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Nueva Cotización</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Empresa / Logo</th>
                      <th className="py-3 px-4">RUT & Giro SII</th>
                      <th className="py-3 px-4">Ubicación</th>
                      <th className="py-3 px-4">Contacto Principal</th>
                      <th className="py-3 px-4">Cotizaciones</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredClients.map(client => {
                      const quotes = getClientQuotes(client);
                      return (
                        <tr key={client.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              {client.logoUrl ? (
                                <div className="w-10 h-8 rounded-lg bg-slate-50 border border-slate-200 p-0.5 flex items-center justify-center overflow-hidden shrink-0">
                                  <img src={client.logoUrl} alt="" className="max-h-full max-w-full object-contain" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">
                                  {client.fantasyName ? client.fantasyName.slice(0, 2).toUpperCase() : client.companyName.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <span className="font-bold text-slate-900 block text-xs">
                                  {client.fantasyName || client.companyName}
                                </span>
                                <span className="text-[11px] text-slate-500 truncate block max-w-xs">
                                  {client.companyName}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-slate-800 block">{client.taxId}</span>
                            <span className="text-[11px] text-slate-500 line-clamp-1 max-w-xs" title={client.businessActivity}>
                              {client.businessActivity || 'Consultoría & Servicios'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="text-slate-800 font-medium block">{client.comuna || client.city}</span>
                            <span className="text-[11px] text-slate-400">{client.country}</span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-800 block">{client.contactName}</span>
                            <span className="text-[11px] text-slate-500 block">{client.contactEmail}</span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-800">{quotes.length} cotizaciones</span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleCreateQuoteForClient(client)}
                                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-semibold rounded-lg text-[11px] transition-colors cursor-pointer"
                              >
                                Cotizar
                              </button>
                              <button
                                onClick={() => handleEditClient(client)}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* RENDER TAB 2: COMPANY PROFILE & LOGO */
        <CompanySettingsView
          companyProfile={companyProfile}
          onUpdateCompanyProfile={setCompany}
        />
      )}

      {/* Client Edit/New Modal */}
      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => {
          setIsClientModalOpen(false);
          setEditingClient(null);
        }}
        client={editingClient}
        onSave={handleSaveClient}
      />
    </div>
  );
};
