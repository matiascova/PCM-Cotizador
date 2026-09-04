import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit3, 
  Copy, 
  Trash2, 
  FileCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Building2, 
  Calendar, 
  Layers, 
  Users, 
  DollarSign, 
  Coins,
  LayoutGrid, 
  List, 
  ChevronRight,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Quotation, QuotationStatus, SapModuleCode } from '../types';
import { calculateQuotationTotals, formatCurrency, getStatusBadge } from '../utils/calculations';
import { downloadQuotationPDF } from '../utils/pdfGenerator';

interface QuotationListProps {
  quotations: Quotation[];
  onSelectQuote: (quote: Quotation) => void;
  onEditQuote: (quote: Quotation) => void;
  onDeleteQuote: (quoteId: string) => void;
  onDuplicateQuote: (quote: Quotation) => void;
  onOpenHandover: (quote: Quotation) => void;
  onUpdateQuoteStatus: (quoteId: string, newStatus: QuotationStatus) => void;
  onNewQuotation: () => void;
}

export const QuotationList: React.FC<QuotationListProps> = ({
  quotations,
  onSelectQuote,
  onEditQuote,
  onDeleteQuote,
  onDuplicateQuote,
  onOpenHandover,
  onUpdateQuoteStatus,
  onNewQuotation
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [currencyFilter, setCurrencyFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'pipeline'>('grid');

  // Filtering
  const filteredQuotes = quotations.filter(q => {
    const matchesSearch = 
      q.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.project.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.client.country && q.client.country.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;

    const matchesModule = 
      moduleFilter === 'all' || 
      q.resources.some(r => r.moduleCode === moduleFilter || r.moduleName.toLowerCase().includes(moduleFilter.toLowerCase()));

    const matchesCurrency = currencyFilter === 'all' || q.currency === currencyFilter;

    return matchesSearch && matchesStatus && matchesModule && matchesCurrency;
  });

  // Status Counts for Filters
  const counts = {
    all: quotations.length,
    draft: quotations.filter(q => q.status === 'draft').length,
    sent: quotations.filter(q => q.status === 'sent').length,
    negotiation: quotations.filter(q => q.status === 'negotiation').length,
    approved: quotations.filter(q => q.status === 'approved').length,
    rejected: quotations.filter(q => q.status === 'rejected').length
  };

  const handleQuickDownloadPDF = (e: React.MouseEvent, quote: Quotation) => {
    e.stopPropagation();
    downloadQuotationPDF(quote);
  };

  return (
    <div className="space-y-6">
      
      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por cliente, código de cotización o alcance SAP..."
              className="w-full text-xs sm:text-sm pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* Module, Currency Filter & View Toggle */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Currency Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
              <span>Moneda:</span>
              <select
                value={currencyFilter}
                onChange={e => setCurrencyFilter(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="all">Todas las Monedas</option>
                <option value="CLP">🇨🇱 CLP (Pesos Chilenos)</option>
                <option value="MXN">🇲🇽 MXN (Pesos Mexicanos)</option>
                <option value="USD">🇺🇸 USD (Dólares)</option>
              </select>
            </div>

            {/* Module Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Módulo:</span>
              <select
                value={moduleFilter}
                onChange={e => setModuleFilter(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="all">Todos los Módulos</option>
                <option value="SAP_MM">SAP MM (Compras/Stock)</option>
                <option value="SAP_LE">SAP LE (Logística/Envío)</option>
                <option value="SAP_PM">SAP PM (Mantenimiento)</option>
                <option value="SAP_QM">SAP QM (Calidad)</option>
                <option value="SAP_HCM">SAP HCM (Nómina/Personal)</option>
                <option value="DEV_ABAP">Desarrollador ABAP</option>
                <option value="SAP_BASIS">Consultor Basis</option>
                <option value="SAP_SECURITY">Seguridad & Roles</option>
              </select>
            </div>

            {/* Currency Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <Coins className="w-3.5 h-3.5 text-slate-400" />
              <span>Moneda:</span>
              <select
                value={currencyFilter}
                onChange={e => setCurrencyFilter(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="all">Todas las Monedas</option>
                <option value="UF">🇨🇱 UF (Unidad de Fomento)</option>
                <option value="CLP">🇨🇱 CLP (Pesos Chilenos)</option>
                <option value="USD">🇺🇸 USD (Dólares)</option>
                <option value="MXN">🇲🇽 MXN (Pesos Mexicanos)</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Vista Cuadrícula"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Tarjetas</span>
              </button>
              <button
                onClick={() => setViewMode('pipeline')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                  viewMode === 'pipeline' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Vista Pipeline de Seguimiento"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Pipeline</span>
              </button>
            </div>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-t border-slate-100 pt-3">
          {[
            { key: 'all', label: 'Todas', count: counts.all },
            { key: 'draft', label: 'Borradores', count: counts.draft },
            { key: 'sent', label: 'Enviadas', count: counts.sent },
            { key: 'negotiation', label: 'En Negociación', count: counts.negotiation },
            { key: 'approved', label: 'Aprobadas (A Ejecución)', count: counts.approved },
            { key: 'rejected', label: 'Rechazadas', count: counts.rejected }
          ].map(tab => {
            const isSelected = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100/70 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEW 1: GRID / CARD VIEW */}
      {viewMode === 'grid' && (
        <div>
          {filteredQuotes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No se encontraron cotizaciones</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No hay propuestas que coincidan con los criterios de búsqueda o filtros seleccionados.
              </p>
              <button
                onClick={onNewQuotation}
                className="mt-4 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm"
              >
                Crear Nueva Cotización SAP
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredQuotes.map(quote => {
                const totals = calculateQuotationTotals(quote);
                const statusBadge = getStatusBadge(quote.status);

                return (
                  <div
                    key={quote.id}
                    onClick={() => onSelectQuote(quote)}
                    className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between overflow-hidden group"
                  >
                    {/* Card Top */}
                    <div className="p-5">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                          {quote.code} • v{quote.version}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border flex items-center gap-1.5 ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dotColor}`} />
                          {statusBadge.label}
                        </span>
                      </div>

                      {/* Client Name & Currency Badge */}
                      <div className="flex items-center justify-between gap-1.5 text-xs font-bold text-slate-900">
                        <div className="flex items-center gap-1.5 line-clamp-1">
                          <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{quote.client.companyName}</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 shrink-0 flex items-center gap-1">
                          <span>{quote.currency === 'UF' ? '🇨🇱 UF' : quote.currency === 'CLP' ? '🇨🇱' : quote.currency === 'MXN' ? '🇲🇽' : '🇺🇸'}</span>
                          <span>{quote.currency}</span>
                        </span>
                      </div>

                      {quote.client.country && (
                        <span className="text-[11px] text-slate-500 block mt-0.5 font-normal">
                          📍 {quote.client.country}
                        </span>
                      )}

                      {/* Project Title */}
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors mt-2 line-clamp-2 leading-snug">
                        {quote.project.projectTitle}
                      </h3>

                      {/* Module Badges */}
                      <div className="flex flex-wrap gap-1 mt-3">
                        {quote.resources.slice(0, 4).map(res => (
                          <span
                            key={res.id}
                            className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 uppercase"
                          >
                            {res.moduleCode.replace('SAP_', '').replace('DEV_', '')}
                          </span>
                        ))}
                        {quote.resources.length > 4 && (
                          <span className="text-[10px] text-slate-500 font-bold px-1 py-0.5">
                            +{quote.resources.length - 4} más
                          </span>
                        )}
                      </div>

                      {/* Financial and Hours Metric */}
                      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 text-xs">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Esfuerzo SAP</span>
                          <span className="font-bold text-slate-800 text-sm">{totals.totalHours} hrs</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Cotizado</span>
                          <span className="font-black text-blue-600 text-base font-mono">
                            {formatCurrency(totals.totalAmount, quote.currency, quote.currencySymbol)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={e => handleQuickDownloadPDF(e, quote)}
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Descargar PDF Estándar"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onDuplicateQuote(quote);
                          }}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
                          title="Duplicar Cotización"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onEditQuote(quote);
                          }}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            if (confirm(`¿Eliminar la cotización ${quote.code}?`)) {
                              onDeleteQuote(quote.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Handover link if approved */}
                      {quote.status === 'approved' ? (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onOpenHandover(quote);
                          }}
                          className="font-bold text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200 px-2 py-1 rounded-md flex items-center gap-1 text-[11px] transition-colors"
                        >
                          <FileCheck className="w-3 h-3 text-emerald-700" />
                          <span>Ficha PMO</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 flex items-center gap-0.5 text-[11px] font-medium group-hover:text-blue-600 transition-colors">
                          <span>Gestionar</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: PIPELINE / TRACKING STAGES VIEW */}
      {viewMode === 'pipeline' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-auto pb-4">
          {[
            { id: 'draft', title: 'Borrador / Preparación', color: 'border-stone-400 bg-stone-50/50' },
            { id: 'sent', title: 'Enviada al Cliente', color: 'border-blue-400 bg-blue-50/40' },
            { id: 'negotiation', title: 'En Negociación / Ajustes', color: 'border-amber-400 bg-amber-50/40' },
            { id: 'approved', title: 'Aprobada (A Ejecución)', color: 'border-emerald-400 bg-emerald-50/40' }
          ].map(stage => {
            const stageQuotes = filteredQuotes.filter(q => q.status === stage.id);
            // Group stage totals by currency
            const stageCurrencies = stageQuotes.reduce((acc, q) => {
              const curr = q.currency || 'USD';
              acc[curr] = (acc[curr] || 0) + calculateQuotationTotals(q).totalAmount;
              return acc;
            }, {} as Record<string, number>);

            return (
              <div key={stage.id} className="bg-slate-100/80 rounded-2xl p-3 border border-slate-200 flex flex-col max-h-[75vh]">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/80">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      {stage.title}
                    </h4>
                    <div className="text-[10px] text-slate-600 font-mono space-y-0.5 mt-0.5">
                      {Object.keys(stageCurrencies).length > 0 ? (
                        Object.entries(stageCurrencies).map(([curr, amt]) => (
                          <div key={curr} className="font-semibold">
                            {formatCurrency(Number(amt) || 0, curr)}
                          </div>
                        ))
                      ) : (
                        <span className="text-slate-400">0 propuestas</span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white text-slate-700 shadow-xs">
                    {stageQuotes.length}
                  </span>
                </div>

                <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                  {stageQuotes.map(quote => {
                    const totals = calculateQuotationTotals(quote);
                    return (
                      <div
                        key={quote.id}
                        onClick={() => onSelectQuote(quote)}
                        className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs hover:border-blue-400 transition-all cursor-pointer space-y-2"
                      >
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-mono font-bold text-slate-600">{quote.code}</span>
                          <span className="text-slate-400">{quote.createdAt}</span>
                        </div>

                        <div className="flex items-center justify-between gap-1">
                          <h5 className="text-xs font-bold text-slate-900 line-clamp-1">
                            {quote.client.companyName}
                          </h5>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono shrink-0">
                            {quote.currency === 'UF' ? '🇨🇱 UF' : quote.currency === 'CLP' ? '🇨🇱' : quote.currency === 'MXN' ? '🇲🇽' : '🇺🇸'} {quote.currency}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-600 line-clamp-2">
                          {quote.project.projectTitle}
                        </p>

                        <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs">
                          <span className="text-slate-500 font-medium">{totals.totalHours} hrs</span>
                          <span className="font-bold text-blue-900">
                            {formatCurrency(totals.totalAmount, quote.currency, quote.currencySymbol)}
                          </span>
                        </div>

                        {stage.id === 'approved' && (
                          <div className="pt-1">
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                onOpenHandover(quote);
                              }}
                              className="w-full py-1 text-[11px] font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 rounded text-center block transition-colors"
                            >
                              Ver Ficha de Traspaso a PMO →
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
