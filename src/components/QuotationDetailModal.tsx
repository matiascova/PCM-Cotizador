import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  Edit3, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Send, 
  Building2, 
  Calendar, 
  FileText, 
  Users, 
  Layers, 
  DollarSign, 
  Briefcase, 
  MessageSquare, 
  Plus, 
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import { Quotation, QuotationStatus, QuotationStatusLog } from '../types';
import { calculateQuotationTotals, formatCurrency, getStatusBadge } from '../utils/calculations';
import { downloadQuotationPDF } from '../utils/pdfGenerator';

interface QuotationDetailModalProps {
  quote: Quotation;
  onClose: () => void;
  onEdit: (quote: Quotation) => void;
  onUpdateQuote: (updated: Quotation) => void;
  onOpenHandover: (quote: Quotation) => void;
  onOpenPrintView: (quote: Quotation) => void;
}

export const QuotationDetailModal: React.FC<QuotationDetailModalProps> = ({
  quote,
  onClose,
  onEdit,
  onUpdateQuote,
  onOpenHandover,
  onOpenPrintView
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'milestones' | 'history'>('overview');
  const [showStatusChanger, setShowStatusChanger] = useState(false);
  const [newStatus, setNewStatus] = useState<QuotationStatus>(quote.status);
  const [statusNote, setStatusNote] = useState('');
  const [newTrackingNote, setNewTrackingNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState(quote.rejectionReason || '');

  const totals = calculateQuotationTotals(quote);
  const statusBadge = getStatusBadge(quote.status);

  const handleApplyStatusChange = () => {
    if (newStatus === quote.status && !statusNote) {
      setShowStatusChanger(false);
      return;
    }

    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newLog: QuotationStatusLog = {
      id: `log-${Date.now()}`,
      date: now,
      status: newStatus,
      note: statusNote || (newStatus === 'approved' ? 'Cotización aprobada por el cliente.' : newStatus === 'rejected' ? `Rechazada: ${rejectionReason}` : `Estado actualizado a ${newStatus}`),
      author: 'Líder Comercial SAP'
    };

    const updated: Quotation = {
      ...quote,
      status: newStatus,
      rejectionReason: newStatus === 'rejected' ? rejectionReason : undefined,
      statusHistory: [newLog, ...(quote.statusHistory || [])],
      updatedAt: now
    };

    onUpdateQuote(updated);
    setShowStatusChanger(false);
    setStatusNote('');
  };

  const handleAddTrackingNote = () => {
    if (!newTrackingNote.trim()) return;

    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newLog: QuotationStatusLog = {
      id: `log-${Date.now()}`,
      date: now,
      status: quote.status,
      note: newTrackingNote.trim(),
      author: 'Consultor Preventa SAP'
    };

    const updated: Quotation = {
      ...quote,
      statusHistory: [newLog, ...(quote.statusHistory || [])],
      updatedAt: now
    };

    onUpdateQuote(updated);
    setNewTrackingNote('');
  };

  const handleDownloadPDF = () => {
    downloadQuotationPDF(quote);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex justify-center p-2 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-5xl w-full flex flex-col max-h-[94vh] overflow-hidden">
        
        {/* Top Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-900/70 text-blue-300 border border-blue-700/60">
                {quote.code} (v{quote.version})
              </span>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dotColor}`} />
                {statusBadge.label}
              </span>
              <span className="text-xs text-slate-400">
                Creada: {quote.createdAt}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mt-1.5 line-clamp-1">
              {quote.project.projectTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{quote.client.companyName}</span>
              <span className="text-slate-600">•</span>
              <span>{quote.client.contactName}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {quote.status === 'approved' && (
              <button
                onClick={() => onOpenHandover(quote)}
                className="px-3 py-2 text-xs font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                title="Ver Ficha Operativa de Traspaso a PMO"
              >
                <FileCheck className="w-4 h-4" />
                <span>Traspaso a Ejecución</span>
              </button>
            )}

            <button
              onClick={() => setShowStatusChanger(true)}
              className="px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Cambiar Estado</span>
            </button>

            <button
              onClick={() => onEdit(quote)}
              className="px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-blue-400" />
              <span>Editar</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="px-3 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar PDF</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Changer Modal Overlay */}
        {showStatusChanger && (
          <div className="bg-blue-50 border-b border-blue-200 p-4 animate-in fade-in duration-150">
            <div className="max-w-3xl mx-auto space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-700" />
                  Actualizar Estado de la Cotización
                </span>
                <button
                  onClick={() => setShowStatusChanger(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {(['draft', 'sent', 'negotiation', 'approved', 'rejected'] as QuotationStatus[]).map(st => {
                  const b = getStatusBadge(st);
                  const isSelected = newStatus === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setNewStatus(st)}
                      className={`px-3 py-2 text-xs font-semibold rounded-lg border text-left flex items-center justify-between transition-all ${
                        isSelected 
                          ? 'ring-2 ring-blue-600 bg-white border-blue-500 shadow-xs' 
                          : 'bg-white/80 hover:bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <span>{b.label}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  );
                })}
              </div>

              {newStatus === 'rejected' && (
                <div>
                  <label className="block text-xs font-semibold text-rose-900 mb-1">
                    Motivo de Rechazo (Opcional)
                  </label>
                  <input
                    type="text"
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                    placeholder="ej. Presupuesto insuficiente, cliente pospuso proyecto para 2027, etc."
                    className="w-full text-xs px-3 py-1.5 bg-white border border-rose-300 rounded-lg text-slate-800"
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={statusNote}
                  onChange={e => setStatusNote(e.target.value)}
                  placeholder="Nota de seguimiento para la bitácora (ej. Cliente solicitó descuento, enviada por correo)"
                  className="flex-1 text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800"
                />
                <button
                  onClick={handleApplyStatusChange}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                >
                  Guardar Cambio
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 flex items-center gap-6 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Resumen y Alcance</span>
          </button>

          <button
            onClick={() => setActiveTab('resources')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'resources'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Staffing SAP ({quote.resources.length} perfiles)</span>
          </button>

          <button
            onClick={() => setActiveTab('milestones')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'milestones'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Hitos & Facturación ({quote.milestones.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Bitácora de Seguimiento ({quote.statusHistory?.length || 0})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-slate-800">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Financial Quick Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                  <span className="text-xs text-slate-500">Horas Totales SAP</span>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">{totals.totalHours} hrs</p>
                  <span className="text-[11px] text-slate-400">Consultores asignados</span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                  <span className="text-xs text-slate-500">Subtotal Consultoría</span>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">
                    {formatCurrency(totals.subtotalConsulting, quote.currency, quote.currencySymbol)}
                  </p>
                  <span className="text-[11px] text-slate-400">Tarifa prom: {formatCurrency(totals.averageHourlyRate, quote.currency, quote.currencySymbol)}/h</span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                  <span className="text-xs text-slate-500">Descuento Aplicado</span>
                  <p className="text-lg font-bold text-emerald-700 mt-0.5">
                    {quote.discountPercentage}% ({formatCurrency(totals.discountAmount, quote.currency, quote.currencySymbol)})
                  </p>
                  <span className="text-[11px] text-slate-400">Aprobación comercial</span>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5">
                  <span className="text-xs font-semibold text-blue-900">Total con Impuestos</span>
                  <p className="text-lg font-bold text-blue-900 mt-0.5">
                    {formatCurrency(totals.totalAmount, quote.currency, quote.currencySymbol)}
                  </p>
                  <span className="text-[11px] text-blue-700">Incluye {quote.taxRatePercentage}% IVA</span>
                </div>
              </div>

              {/* Client and Project Technical Data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Client Info */}
                <div className="border border-slate-200 rounded-xl p-4 bg-white">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    Cliente & Contacto
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-500 block">Razón Social:</span>
                      <span className="font-bold text-slate-900 text-sm">{quote.client.companyName}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-500 block">RUT / Tax ID:</span>
                        <span className="font-medium text-slate-800">{quote.client.taxId || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Industria:</span>
                        <span className="font-medium text-slate-800">{quote.client.industry}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Contacto Comercial:</span>
                      <span className="font-semibold text-slate-800">{quote.client.contactName}</span>
                      <span className="text-slate-500 text-[11px]"> ({quote.client.contactRole})</span>
                    </div>
                    <div className="text-slate-600">
                      <span>{quote.client.contactEmail}</span>
                      {quote.client.contactPhone && <span> • {quote.client.contactPhone}</span>}
                    </div>
                  </div>
                </div>

                {/* Service Specs */}
                <div className="border border-slate-200 rounded-xl p-4 bg-white">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-600" />
                    Especificación de Consultoría SAP
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-500 block">Tipo de Proyecto:</span>
                      <span className="font-bold text-slate-900">{quote.project.projectType}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-500 block">Versión de Sistema SAP:</span>
                        <span className="font-medium text-slate-800">{quote.project.sapSystemVersion}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Metodología:</span>
                        <span className="font-medium text-slate-800">{quote.project.methodology}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-500 block">Duración Estimada:</span>
                        <span className="font-medium text-slate-800">{quote.project.durationMonths} meses</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Soporte Hipercare:</span>
                        <span className="font-medium text-slate-800">{quote.guaranteeHypercareDays} días</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scope & Business Objectives */}
              <div className="border border-slate-200 rounded-xl p-5 bg-white">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Alcance Detallado del Proyecto
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {quote.project.scopeDescription || quote.project.businessObjective}
                </p>

                {quote.project.assumptions && quote.project.assumptions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-800 block mb-1.5">
                      Supuestos Clave y Responsabilidades del Cliente:
                    </span>
                    <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                      {quote.project.assumptions.map((ass, i) => (
                        <li key={i}>{ass}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: STAFFING & RESOURCES */}
          {activeTab === 'resources' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Equipo Consultor y Recursos SAP Asignados
                  </h3>
                  <p className="text-xs text-slate-500">
                    Perfiles de consultoría técnica y funcional especificados para la cotización
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900">
                    Total: {totals.totalHours} hrs | {formatCurrency(totals.subtotalConsulting, quote.currency, quote.currencySymbol)}
                  </span>
                </div>
              </div>

              {/* Hours Breakdown by Module */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2.5">
                  Distribución de Horas por Módulo SAP
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(totals.hoursByModule).map(([modName, hrs]) => {
                    const percentage = Math.round((hrs / totals.totalHours) * 100);
                    return (
                      <div key={modName} className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-semibold text-slate-800 truncate" title={modName}>{modName}</span>
                          <span className="font-bold text-blue-700">{hrs}h</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-full" style={{ width: `${percentage}%` }} />
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 block">{percentage}% del esfuerzo</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Resources Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Módulo SAP</th>
                      <th className="py-2.5 px-3">Rol / Título</th>
                      <th className="py-2.5 px-3">Seniority</th>
                      <th className="py-2.5 px-3">Modalidad</th>
                      <th className="py-2.5 px-3 text-right">Horas</th>
                      <th className="py-2.5 px-3 text-right">Tarifa Horaria</th>
                      <th className="py-2.5 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {quote.resources.map(res => (
                      <tr key={res.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {res.moduleName}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">
                          <div>
                            <span className="font-medium text-slate-900">{res.roleTitle}</span>
                            {res.responsibilities && (
                              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{res.responsibilities}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                            {res.seniority}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{res.modality}</td>
                        <td className="py-2.5 px-3 text-right font-semibold text-slate-900">{res.hours} hrs</td>
                        <td className="py-2.5 px-3 text-right text-slate-700">
                          {formatCurrency(res.hourlyRate, quote.currency, quote.currencySymbol)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          {formatCurrency(res.hours * res.hourlyRate, quote.currency, quote.currencySymbol)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: MILESTONES */}
          {activeTab === 'milestones' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Hitos de Proyecto y Esquema de Facturación
                  </h3>
                  <p className="text-xs text-slate-500">
                    Basados en fases de la metodología {quote.project.methodology}
                  </p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Fase / Hito</th>
                      <th className="py-2.5 px-3">Entregables Clave</th>
                      <th className="py-2.5 px-3">Plazo Estimado</th>
                      <th className="py-2.5 px-3 text-right">% Facturación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {quote.milestones.map((m, idx) => (
                      <tr key={m.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {m.title}
                          {m.description && <p className="text-[11px] text-slate-500 font-normal mt-0.5">{m.description}</p>}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">{m.deliverables}</td>
                        <td className="py-2.5 px-3 text-slate-600">{m.estimatedWeek}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">{m.paymentPercentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: TRACKING & HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-5">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Agregar Nota de Seguimiento Comercial
                </h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTrackingNote}
                    onChange={e => setNewTrackingNote(e.target.value)}
                    placeholder="Registrar llamada, comentarios de cliente, solicitudes de ajuste o feedback..."
                    className="flex-1 text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleAddTrackingNote();
                    }}
                  />
                  <button
                    onClick={handleAddTrackingNote}
                    className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Nota</span>
                  </button>
                </div>
              </div>

              {/* Timeline list */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Historial de Cambios y Bitácora
                </h4>
                {(quote.statusHistory || []).map((log, index) => {
                  const b = getStatusBadge(log.status);
                  return (
                    <div key={log.id || index} className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-start gap-3">
                      <div className={`p-1.5 rounded-lg ${b.bg} ${b.text} mt-0.5`}>
                        <span className={`w-2 h-2 rounded-full ${b.dotColor} block`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900">{log.note}</span>
                          <span className="text-[11px] text-slate-400 font-mono">{log.date}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                          <span className="font-medium text-slate-600">{log.author}</span>
                          <span>•</span>
                          <span className={`px-1.5 py-0.2 rounded font-semibold ${b.bg} ${b.text}`}>
                            Estado: {b.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => onOpenPrintView(quote)}
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Vista Previa de Impresión</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
