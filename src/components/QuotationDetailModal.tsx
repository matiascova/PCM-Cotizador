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
  FileCheck,
  UserCheck,
  CheckSquare,
  Loader2
} from 'lucide-react';
import { Quotation, QuotationStatus, QuotationStatusLog } from '../types';
import { calculateQuotationTotals, formatCurrency, getStatusBadge } from '../utils/calculations';
import { downloadDossierPDF, downloadQuotationPDF } from '../utils/pdfGenerator';
import { convertUfToClp, convertClpToUf, formatUfValue } from '../services/bcentralService';
import { GanttModule } from './gantt/GanttModule';
import { createDefaultGanttPlanForQuotation } from '../data/ganttTemplates';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'milestones' | 'gantt' | 'history'>('overview');
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

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState('');

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      setDownloadProgress('Preparando...');
      await downloadDossierPDF(quote, undefined, (status) => {
        setDownloadProgress(status);
      });
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsDownloading(false);
      setDownloadProgress('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      {/* Container occupies 90-92% of the screen width and 90% of height to minimize vertical scrolling */}
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-[92vw] max-w-[94vw] h-[90vh] max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-900/70 text-blue-300 border border-blue-700/60">
                {quote.code} (v{quote.version})
              </span>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dotColor}`} />
                {statusBadge.label}
              </span>
              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1">
                <span>{quote.currency === 'UF' ? '🇨🇱 UF' : quote.currency === 'CLP' ? '🇨🇱 CLP' : quote.currency === 'MXN' ? '🇲🇽 MXN' : '🇺🇸 USD'}</span>
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
              onClick={() => onOpenPrintView(quote)}
              className="px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Abrir vista Dossier Editorial para lectura o impresión directa"
            >
              <Printer className="w-3.5 h-3.5 text-blue-400" />
              <span>Dossier / Imprimir</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="px-3 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-80 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{downloadProgress || 'Generando Dossier PDF...'}</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar PDF</span>
                </>
              )}
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
          <div className="bg-blue-50 border-b border-blue-200 p-4 shrink-0 animate-in fade-in duration-150">
            <div className="max-w-4xl mx-auto space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-700" />
                  Actualizar Estado de la Cotización
                </span>
                <button
                  onClick={() => setShowStatusChanger(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
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
                      className={`px-3 py-2 text-xs font-semibold rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
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
        <div className="bg-slate-50 border-b border-slate-200 px-6 flex items-center gap-6 text-xs font-semibold text-slate-600 shrink-0">
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
            onClick={() => setActiveTab('gantt')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'gantt'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Carta Gantt SAP 📊</span>
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
        <div className="p-4 sm:p-6 md:p-7 overflow-y-auto flex-1 space-y-6 text-slate-800">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Financial Quick Cards - Expanded for wide 90% screen */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-xs">
                  <span className="text-xs text-slate-500 font-medium">Horas Totales SAP</span>
                  <p className="text-xl font-extrabold text-slate-900 mt-1">{totals.totalHours} hrs</p>
                  <span className="text-[11px] text-slate-400">
                    {quote.resources.length > 0 ? `${quote.resources.length} consultores asignados` : 'Servicios parametrizados'}
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-xs">
                  <span className="text-xs text-slate-500 font-medium">Subtotal Consultoría & Servicios</span>
                  <p className="text-xl font-extrabold text-slate-900 mt-1">
                    {formatCurrency(totals.subtotalConsulting, quote.currency, quote.currencySymbol)}
                  </p>
                  <span className="text-[11px] text-slate-400">
                    {totals.totalHours > 0 ? `Tarifa prom: ${formatCurrency(totals.averageHourlyRate, quote.currency, quote.currencySymbol)}/h` : 'Tarificación en base UF'}
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-xs">
                  <span className="text-xs text-slate-500 font-medium">Descuento Comercial</span>
                  <p className="text-xl font-extrabold text-emerald-700 mt-1">
                    {quote.discountPercentage}% ({formatCurrency(totals.discountAmount, quote.currency, quote.currencySymbol)})
                  </p>
                  <span className="text-[11px] text-slate-400">Aprobación comercial</span>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-xs">
                  <span className="text-xs font-semibold text-blue-900">Total con Impuestos</span>
                  <p className="text-xl font-extrabold text-blue-900 mt-1">
                    {formatCurrency(totals.totalAmount, quote.currency, quote.currencySymbol)}
                  </p>
                  <span className="text-[11px] text-blue-700">Incluye {quote.taxRatePercentage}% IVA</span>
                  {quote.currency === 'UF' && (
                    <div className="mt-1.5 pt-1.5 border-t border-blue-200/60 text-[11px] font-mono text-blue-900 font-bold">
                      ≈ $ {new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 }).format(convertUfToClp(totals.totalAmount))} CLP (BCCh)
                    </div>
                  )}
                  {quote.currency === 'CLP' && (
                    <div className="mt-1.5 pt-1.5 border-t border-blue-200/60 text-[11px] font-mono text-slate-700 font-bold">
                      ≈ UF {formatUfValue(convertClpToUf(totals.totalAmount))}
                    </div>
                  )}
                </div>
              </div>

              {/* Client and Project Technical Data - 2 Large Columns side by side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Client Info */}
                <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-xs">
                  <div className="flex items-center justify-between mb-3.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      Cliente & Ficha Tributaria SII
                    </h3>
                    {quote.client.logoUrl && (
                      <div className="h-7 w-auto max-w-[90px] flex items-center justify-center p-0.5 border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
                        <img src={quote.client.logoUrl} alt="" className="max-h-full max-w-full object-contain" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2.5 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Razón Social / Empresa:</span>
                      <span className="font-bold text-slate-900 text-sm">{quote.client.fantasyName || quote.client.companyName}</span>
                      {quote.client.fantasyName && quote.client.fantasyName !== quote.client.companyName && (
                        <span className="text-slate-500 text-[11px] block">{quote.client.companyName}</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-slate-500 block text-[11px]">RUT / Tax ID:</span>
                        <span className="font-semibold text-slate-800 font-mono">{quote.client.taxId || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Industria:</span>
                        <span className="font-semibold text-slate-800">{quote.client.industry}</span>
                      </div>
                    </div>
                    {quote.client.businessActivity && (
                      <div>
                        <span className="text-slate-500 block text-[11px]">Giro Comercial SII:</span>
                        <span className="text-slate-700 text-[11px]">{quote.client.businessActivity}</span>
                      </div>
                    )}
                    {quote.client.comuna && (
                      <div>
                        <span className="text-slate-500 block text-[11px]">Dirección & Comuna:</span>
                        <span className="text-slate-700 text-[11px]">
                          {quote.client.taxAddress ? `${quote.client.taxAddress}, ` : ''}{quote.client.comuna}, {quote.client.city || quote.client.country}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-slate-500 block text-[11px]">Contacto Comercial:</span>
                      <span className="font-semibold text-slate-800">{quote.client.contactName}</span>
                      <span className="text-slate-500 text-[11px]"> ({quote.client.contactRole})</span>
                    </div>
                    <div className="text-slate-600 flex items-center gap-2 text-[11px]">
                      <span>{quote.client.contactEmail}</span>
                      {quote.client.contactPhone && <span>• {quote.client.contactPhone}</span>}
                    </div>
                    {quote.client.billingEmail && (
                      <div className="text-[11px] text-blue-700 pt-1 border-t border-slate-100">
                        <span>Email DTE: </span>
                        <span className="font-medium">{quote.client.billingEmail}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Service Specs */}
                <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3.5 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-600" />
                    Especificación de Consultoría SAP
                  </h3>
                  <div className="space-y-2.5 text-xs">
                    <div>
                      <span className="text-slate-500 block">Tipo de Proyecto:</span>
                      <span className="font-bold text-slate-900 text-sm">{quote.project.projectType}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-slate-500 block">Versión de Sistema SAP:</span>
                        <span className="font-semibold text-slate-800">{quote.project.sapSystemVersion}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Metodología:</span>
                        <span className="font-semibold text-slate-800">{quote.project.methodology}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-slate-500 block">Duración Estimada:</span>
                        <span className="font-semibold text-slate-800">{quote.project.durationMonths} meses</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Soporte Hipercare:</span>
                        <span className="font-semibold text-slate-800">{quote.guaranteeHypercareDays} días</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SERVICIOS ESPECIALIZADOS (Si aplican para Remuneraciones o Headhunting) */}
              {(quote.payrollService?.enabled || quote.recruitmentService?.enabled) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* 1. Remuneraciones */}
                  {quote.payrollService?.enabled && (
                    <div className="border border-blue-200 bg-blue-50/40 rounded-xl p-5 space-y-4 shadow-xs">
                      <div className="flex items-center justify-between border-b border-blue-200 pb-2.5">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-blue-700" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                            Servicios de Proceso de Remuneraciones
                          </h4>
                        </div>
                        <span className="text-xs font-mono font-extrabold text-blue-900">
                          {formatUfValue(quote.payrollService.totalUF)} UF
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-white p-3 rounded-lg border border-blue-100">
                          <span className="text-[11px] text-slate-500 block">Proceso Pago Remuneraciones</span>
                          <span className="font-bold text-slate-900 block mt-0.5">
                            {quote.payrollService.payrollHeadcount} personas @ {quote.payrollService.payrollRatePerPersonUF} UF/p
                          </span>
                          <span className="text-[11px] font-mono text-blue-700 font-semibold mt-1 block">
                            Subtotal: {formatUfValue(quote.payrollService.payrollSubtotalUF)} UF
                          </span>
                        </div>

                        <div className="bg-white p-3 rounded-lg border border-blue-100">
                          <span className="text-[11px] text-slate-500 block">Control de Asistencia</span>
                          <span className="font-bold text-slate-900 block mt-0.5">
                            {quote.payrollService.attendanceHeadcount} personas @ {quote.payrollService.attendanceRatePerPersonUF} UF/p
                          </span>
                          <span className="text-[11px] font-mono text-blue-700 font-semibold mt-1 block">
                            Subtotal: {formatUfValue(quote.payrollService.attendanceSubtotalUF)} UF
                          </span>
                        </div>
                      </div>

                      {quote.payrollService.customServices && quote.payrollService.customServices.length > 0 && (
                        <div className="bg-white p-3 rounded-lg border border-blue-100 text-xs">
                          <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
                            Otros servicios desarrollados a medida ({formatUfValue(quote.payrollService.customServicesTotalUF)} UF):
                          </span>
                          <div className="space-y-1.5">
                            {quote.payrollService.customServices.map((cs, i) => (
                              <div key={cs.id || i} className="flex justify-between items-center text-[11px] border-b border-slate-100 pb-1 last:border-0 last:pb-0">
                                <span className="text-slate-700 font-medium">{cs.name} ({cs.quantity} un)</span>
                                <span className="font-mono text-blue-800 font-bold">{formatUfValue(cs.subtotalUF)} UF</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 2. Reclutamiento & Headhunting */}
                  {quote.recruitmentService?.enabled && (
                    <div className="border border-indigo-200 bg-indigo-50/40 rounded-xl p-5 space-y-4 shadow-xs">
                      <div className="flex items-center justify-between border-b border-indigo-200 pb-2.5">
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-indigo-700" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                            Servicios de Reclutamiento, Selección / Headhunting
                          </h4>
                        </div>
                        <span className="text-xs font-mono font-extrabold text-indigo-900">
                          {formatUfValue(quote.recruitmentService.totalUF)} UF
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-white p-3 rounded-lg border border-indigo-100">
                          <span className="text-[11px] text-slate-500 block">Tipo de Proceso</span>
                          <span className="font-bold text-slate-900 block mt-0.5">
                            {quote.recruitmentService.processType}
                          </span>
                          <span className="text-[10px] text-slate-400 mt-1 block">Búsqueda directa especializada</span>
                        </div>

                        <div className="bg-white p-3 rounded-lg border border-indigo-100">
                          <span className="text-[11px] text-slate-500 block">Costo una Renta Bruta (Success Fee)</span>
                          {quote.recruitmentService.includeGrossSalaryFee ? (
                            <>
                              <span className="font-bold text-slate-900 block mt-0.5">
                                {quote.recruitmentService.grossSalaryFeePercentage}% de ${new Intl.NumberFormat('es-CL').format(quote.recruitmentService.grossSalaryAmount)} {quote.recruitmentService.grossSalaryCurrency}
                              </span>
                              <span className="text-[11px] font-mono text-indigo-700 font-semibold mt-1 block">
                                Subtotal: {formatUfValue(quote.recruitmentService.grossSalaryFeeTotalUF)} UF
                              </span>
                            </>
                          ) : (
                            <span className="text-[11px] text-slate-500 italic block mt-0.5">No aplica tarifa porcentual</span>
                          )}
                        </div>
                      </div>

                      {quote.recruitmentService.activities && quote.recruitmentService.activities.length > 0 && (
                        <div className="bg-white p-3 rounded-lg border border-indigo-100 text-xs">
                          <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
                            Actividades de Entrevistas varias o Descripción de Cargo ({formatUfValue(quote.recruitmentService.activitiesTotalUF)} UF):
                          </span>
                          <div className="space-y-1.5">
                            {quote.recruitmentService.activities.map((act, i) => (
                              <div key={act.id || i} className="flex justify-between items-center text-[11px] border-b border-slate-100 pb-1 last:border-0 last:pb-0">
                                <span className="text-slate-700 font-medium">{act.activityName} ({act.quantity} act @ {act.ratePerActivityUF} UF)</span>
                                <span className="font-mono text-indigo-800 font-bold">{formatUfValue(act.subtotalUF)} UF</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Scope & Business Objectives */}
              <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-xs">
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
                    <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4 grid grid-cols-1 md:grid-cols-2 gap-x-6">
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
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2.5">
                  Distribución de Horas por Módulo SAP
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                  {Object.entries(totals.hoursByModule).map(([modCode, hrs]) => (
                    <div key={modCode} className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                      <span className="text-[11px] font-bold text-slate-500 block">SAP {modCode}</span>
                      <span className="text-base font-extrabold text-slate-900 block">{hrs} hrs</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resources Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Módulo SAP</th>
                        <th className="p-3">Perfil / Rol</th>
                        <th className="p-3">Seniority</th>
                        <th className="p-3">Origen / Staffing</th>
                        <th className="p-3 text-right">Horas</th>
                        <th className="p-3 text-right">Tarifa/Hora</th>
                        <th className="p-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {quote.resources.map((res, i) => (
                        <tr key={res.id || i} className="hover:bg-slate-50/80">
                          <td className="p-3 font-semibold text-slate-900">
                            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold">
                              {res.moduleCode}
                            </span>
                            <span className="ml-2 text-slate-600">{res.moduleName}</span>
                          </td>
                          <td className="p-3 font-medium text-slate-800">
                            <div>{res.roleTitle || (res as any).role}</div>
                            {res.professionalName && (
                              <span className="text-[11px] text-blue-700 block mt-0.5">
                                Asignado: {res.professionalName}
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-slate-600">{res.seniority}</td>
                          <td className="p-3">
                            {res.staffingType === 'external' ? (
                              <div>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">
                                  Externo (SOLPED)
                                </span>
                                {res.solpedNumber && (
                                  <span className="text-[10px] font-mono text-purple-900 font-bold block mt-0.5">
                                    SOLPED #{res.solpedNumber}
                                  </span>
                                )}
                                {res.supplierName && (
                                  <span className="text-[10px] text-slate-500 block truncate max-w-[140px]" title={res.supplierName}>
                                    {res.supplierName}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold">
                                Interno (Nómina)
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right font-bold text-slate-900">{res.hours} hrs</td>
                          <td className="p-3 text-right text-slate-700 font-mono">
                            {formatCurrency(res.hourlyRate, quote.currency, quote.currencySymbol)}
                          </td>
                          <td className="p-3 text-right font-bold text-blue-900 font-mono">
                            {formatCurrency(res.subtotal, quote.currency, quote.currencySymbol)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MILESTONES & BILLING */}
          {activeTab === 'milestones' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Hitos de Pago y Plan de Facturación
                  </h3>
                  <p className="text-xs text-slate-500">
                    Cronograma de entregables asociados a facturación comercial
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900">
                    Términos: {quote.paymentTerms}
                  </span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-3 w-12 text-center">#</th>
                        <th className="p-3">Hito / Entregable</th>
                        <th className="p-3">Mes Estimado</th>
                        <th className="p-3 text-right">% Facturación</th>
                        <th className="p-3 text-right">Monto Estimado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {quote.milestones.map((m, i) => {
                        const milestoneAmount = (totals.totalAmount * (m.paymentPercentage / 100));
                        return (
                          <tr key={m.id || i} className="hover:bg-slate-50/80">
                            <td className="p-3 text-center font-bold text-slate-400">{i + 1}</td>
                            <td className="p-3">
                              <span className="font-bold text-slate-900 block">{m.title}</span>
                              <span className="text-slate-500 text-[11px]">{m.deliverable}</span>
                            </td>
                            <td className="p-3 text-slate-600">{m.targetMonth}</td>
                            <td className="p-3 text-right font-bold text-slate-900 font-mono">
                              {m.paymentPercentage}%
                            </td>
                            <td className="p-3 text-right font-bold text-blue-900 font-mono">
                              {formatCurrency(milestoneAmount, quote.currency, quote.currencySymbol)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: EXECUTIVE GANTT TIMELINE */}
          {activeTab === 'gantt' && (
            <div className="space-y-4">
              <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    <strong>Carta Gantt Ejecutiva:</strong> Planifica fases, dependencias y cálculo dinámico de días hábiles. Los cambios se guardan en la cotización y se integran automáticamente en el Dossier PDF.
                  </span>
                </div>
              </div>

              <GanttModule
                plan={quote.ganttPlan || createDefaultGanttPlanForQuotation(
                  quote.project.projectTitle,
                  quote.project.estimatedStartDate,
                  quote.client.country
                )}
                onChangePlan={(updatedPlan) => {
                  onUpdateQuote({
                    ...quote,
                    ganttPlan: updatedPlan,
                    updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
                  });
                }}
              />
            </div>
          )}

          {/* TAB 4: STATUS HISTORY & TRACKING LOG */}
          {activeTab === 'history' && (
            <div className="space-y-5">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  Agregar Nota a la Bitácora de Seguimiento Preventa
                </label>
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
                    className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
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
                    <div key={log.id || index} className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-start gap-3 shadow-xs">
                      <div className={`p-1.5 rounded-lg ${b.bg} ${b.text} mt-0.5 shrink-0`}>
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
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            onClick={() => onOpenPrintView(quote)}
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Vista Previa de Impresión</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

