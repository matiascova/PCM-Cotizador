import React, { useState } from 'react';
import { 
  Download, 
  Printer, 
  ArrowLeft, 
  CheckCircle2, 
  Building2, 
  Calendar, 
  FileText, 
  Layers, 
  Clock, 
  ShieldCheck,
  AlertTriangle,
  QrCode,
  CheckSquare,
  FileCode,
  Users,
  Briefcase,
  Sliders,
  DollarSign,
  ChevronRight,
  Eye,
  Check,
  Loader2
} from 'lucide-react';
import { Quotation, CompanyProfile } from '../types';
import { calculateQuotationTotals, formatCurrency, getStatusBadge } from '../utils/calculations';
import { downloadDossierPDF, downloadQuotationPDF } from '../utils/pdfGenerator';
import { getCachedBancoCentralData, convertUfToClp } from '../services/bcentralService';
import { getStoredCompanyProfile } from '../data/companyProfile';
import { DossierEditorialView } from './DossierEditorialView';
import { getClientLogo } from '../data/defaultClientLogos';
import { 
  DEFAULT_RISK_ITEMS, 
  DEFAULT_OUT_OF_SCOPE_CATEGORIES, 
  DEFAULT_GATEKEEPER_CONDITION, 
  getDossierPresetsByProjectType 
} from '../data/dossierPresets';

interface QuotationPrintViewProps {
  quote: Quotation;
  onBack: () => void;
  companyProfile?: CompanyProfile;
}

export const QuotationPrintView: React.FC<QuotationPrintViewProps> = ({
  quote,
  onBack,
  companyProfile
}) => {
  const [viewMode, setViewMode] = useState<'dossier' | 'compact'>('dossier');
  const activeCompany = companyProfile || getStoredCompanyProfile();
  const totals = calculateQuotationTotals(quote);
  const statusBadge = getStatusBadge(quote.status);
  const bcentral = getCachedBancoCentralData();
  const ufRate = bcentral.indicators.uf.value || 40879.04;
  const ufDate = bcentral.indicators.uf.date || '2026-09-04';

  // Dynamic Dossier Values (with presets fallback)
  const defaultPresets = getDossierPresetsByProjectType(quote.project.projectType || 'Roll-out de Módulos');
  const currentHoy = quote.currentSituationHoy || defaultPresets.hoy;
  const currentQuedaConstruido = quote.builtSolutionQuedaConstruido || defaultPresets.quedaConstruido;
  const gatekeeperText = quote.gatekeeperCondition || DEFAULT_GATEKEEPER_CONDITION;
  const activeRisks = quote.riskItems && quote.riskItems.length > 0 ? quote.riskItems : DEFAULT_RISK_ITEMS;
  const activeOutOfScope = quote.outOfScopeCategories && quote.outOfScopeCategories.length > 0 ? quote.outOfScopeCategories : DEFAULT_OUT_OF_SCOPE_CATEGORIES;
  const activeValidityDays = quote.validityDays || 30;
  const activeConfidentialityMonths = quote.confidentialityMonths || 6;
  const activeLead = quote.commercialLead || {
    name: 'Diego Rodrigues',
    role: 'Líder de Práctica & Consultor Senior',
    email: 'drodrigues@consultora-tech.cl',
    phone: '+56 9 4924 9816',
    location: 'Santiago de Chile'
  };
  const activeClientSigner = quote.clientSigner || {
    name: quote.client.contactName,
    taxId: quote.client.taxId || '____________________',
    role: quote.client.contactRole,
    email: quote.client.contactEmail
  };

  const coverImages: Record<string, string> = {
    alpine: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop',
    corporate: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop',
    datacenter: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2070&auto=format&fit=crop'
  };
  const selectedCoverImage = coverImages[quote.coverTheme || 'alpine'] || coverImages.alpine;

  // Format currency helpers
  const totalInUf = quote.currency === 'UF' 
    ? totals.totalAmount 
    : (quote.currency === 'CLP' ? (totals.totalAmount / ufRate) : totals.totalAmount);

  const totalInClp = quote.currency === 'CLP' 
    ? totals.totalAmount 
    : (quote.currency === 'UF' ? convertUfToClp(totals.totalAmount) : (totals.totalAmount * 930));

  const formatUfNumber = (val: number) => {
    return new Intl.NumberFormat('es-CL', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  };

  const formatClpNumber = (val: number) => {
    return new Intl.NumberFormat('es-CL', {
      maximumFractionDigits: 0
    }).format(val);
  };

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<string>('');

  const handlePrint = () => {
    if (viewMode !== 'dossier') {
      setViewMode('dossier');
      setTimeout(() => {
        window.print();
      }, 200);
    } else {
      window.print();
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      setDownloadProgress('Preparando páginas...');
      
      // Ensure dossier view is active for capture
      if (viewMode !== 'dossier') {
        setViewMode('dossier');
        await new Promise((r) => setTimeout(r, 200));
      }

      await downloadDossierPDF(quote, activeCompany, (statusText) => {
        setDownloadProgress(statusText);
      });
    } catch (err) {
      console.error('Error generating Dossier PDF:', err);
    } finally {
      setIsDownloading(false);
      setDownloadProgress('');
    }
  };

  // Automated milestones if none exist
  const milestonesList = quote.milestones && quote.milestones.length > 0 ? quote.milestones : [
    {
      id: 'm1',
      title: 'Anticipo & Inicio de Proyecto',
      description: 'Kickoff, firma de contrato, entrega de accesos y habilitación de entornos.',
      deliverables: 'Entorno de trabajo levantado, repositorio y acta de inicio firmada.',
      estimatedWeek: 'Día hábil 1',
      paymentPercentage: 40
    },
    {
      id: 'm2',
      title: 'Avance de Desarrollo & Navegabilidad',
      description: 'Configuración de módulos principales, maestros y flujos navegables.',
      deliverables: 'Ambiente QA disponible para pruebas preliminares.',
      estimatedWeek: 'Sem. 3',
      paymentPercentage: 30
    },
    {
      id: 'm3',
      title: 'Cierre, Pruebas de Aceptación & Entrega',
      description: 'Pruebas integrales, paso a producción y transferencia de conocimientos.',
      deliverables: 'Puesta en marcha, manual de usuario y acta de entrega formal.',
      estimatedWeek: 'Sem. 4',
      paymentPercentage: 30
    }
  ];

  // Calculated payments
  const paymentSchedule = [
    {
      phase: 'Anticipo 40%',
      timing: 'Día hábil 1',
      ufAmount: totalInUf * 0.40,
      clpAmount: totalInClp * 0.40,
      condition: 'Al aceptar e iniciar. Kickoff formal, entrega de credenciales/accesos y confirmación de contraparte técnica.'
    },
    {
      phase: 'Avance 30%',
      timing: 'Hito intermedio',
      ufAmount: totalInUf * 0.30,
      clpAmount: totalInClp * 0.30,
      condition: 'Módulos operativos y ambiente de prueba validado para revisión funcional.'
    },
    {
      phase: 'Cierre 30%',
      timing: 'Contra aviso de entrega',
      ufAmount: totalInUf * 0.30,
      clpAmount: totalInClp * 0.30,
      condition: 'Puesta en marcha final y pruebas de aceptación (UAT 2 días hábiles; silencio positivo).'
    }
  ];

  return (
    <div className="bg-slate-900/95 min-h-screen py-6 px-2 sm:px-4 md:px-6 print:bg-white print:p-0">
      
      {/* Top Action Bar (hidden in print mode) */}
      <div className="max-w-5xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden bg-slate-800/90 backdrop-blur-md p-4 rounded-xl border border-slate-700 shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al Tablero</span>
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-900/80 p-1 rounded-lg border border-slate-700 text-xs">
            <button
              onClick={() => setViewMode('dossier')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                viewMode === 'dossier'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dossier Editorial (Estilo Bridev)
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                viewMode === 'compact'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Ficha Resumen (1 Página)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <span>Imprimir / Guardar PDF</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-80 rounded-lg flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
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
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODO 1: DOSSIER EDITORIAL COMPLETO (ESTILO BRIDEV)                       */}
      {/* ========================================================================= */}
      {viewMode === 'dossier' && (
        <DossierEditorialView
          quote={quote}
          companyProfile={activeCompany}
        />
      )}

      {/* ========================================================================= */}
      {/* MODO 2: FICHA RESUMEN COMPACTA (1 PÁGINA TRADICIONAL)                     */}
      {/* ========================================================================= */}
      {viewMode === 'compact' && (
        <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl border border-slate-200 p-8 sm:p-12 print:shadow-none print:border-none print:p-0 text-slate-800">
          {/* Document Header */}
          <div className="border-b-2 border-blue-900 pb-5 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  {activeCompany.logoUrl ? (
                    <div className="h-10 w-auto max-w-[140px] flex items-center justify-center overflow-hidden">
                      <img
                        src={activeCompany.logoUrl}
                        alt={activeCompany.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  ) : (
                    <span className="w-8 h-8 rounded-lg bg-blue-800 text-white font-bold text-sm flex items-center justify-center shrink-0">
                      ⚡
                    </span>
                  )}
                  <div>
                    <span className="text-xl font-extrabold tracking-tight text-slate-900 block leading-tight">
                      {activeCompany.name || 'SAP & TECH CONSULTING'}
                    </span>
                    <span className="text-[10px] tracking-widest text-slate-500 uppercase font-mono block">
                      {activeCompany.subheading || 'Enterprise Solutions Group'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {activeCompany.legalName} · RUT: {activeCompany.taxId} · {activeCompany.city || 'Chile'}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="inline-block text-xs font-bold px-2.5 py-1 rounded-full border mb-1 bg-blue-50 text-blue-800 border-blue-200 font-mono">
                  {quote.code} (v{quote.version})
                </span>
                <div className="text-xs text-slate-600 space-y-0.5">
                  <p>Fecha Emisión: <span className="font-semibold text-slate-800">{quote.createdAt}</span></p>
                  <p>Válido hasta: <span className="font-semibold text-slate-800">{quote.validUntil}</span></p>
                  <p>Moneda: <span className="font-semibold text-slate-800">{quote.currency}</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Client & Offer Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-7 text-xs">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                <h3 className="font-bold text-slate-900 uppercase tracking-wider">
                  Información del Cliente (SII)
                </h3>
                <div className="h-6 w-auto max-w-[80px] flex items-center justify-center overflow-hidden">
                  <img 
                    src={getClientLogo(quote.client)} 
                    alt={quote.client.fantasyName || quote.client.companyName} 
                    className="max-h-full max-w-full object-contain" 
                  />
                </div>
              </div>
              <p className="font-bold text-slate-900 text-sm">
                {quote.client.fantasyName || quote.client.companyName}
              </p>
              {quote.client.fantasyName && quote.client.companyName !== quote.client.fantasyName && (
                <p className="text-[11px] text-slate-500 font-medium">Razón Social: {quote.client.companyName}</p>
              )}
              <p className="text-slate-600">RUT / Tax ID: <span className="font-mono font-bold text-slate-800">{quote.client.taxId || 'N/A'}</span></p>
              {quote.client.businessActivity && (
                <p className="text-slate-600 text-[11px] line-clamp-1">Giro: {quote.client.businessActivity}</p>
              )}
              {quote.client.comuna && (
                <p className="text-slate-600 text-[11px]">Comuna / Ciudad: {quote.client.comuna}, {quote.client.city || quote.client.country}</p>
              )}
              <p className="text-slate-600">Contacto: {quote.client.contactName} ({quote.client.contactRole})</p>
              <p className="text-slate-600">Email: {quote.client.contactEmail}</p>
              <p className="text-slate-600">Sector: {quote.client.industry} | {quote.client.country}</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
                Ficha Técnica del Servicio
              </h3>
              <p className="font-semibold text-slate-900">{quote.project.projectType}</p>
              <p className="text-slate-600 mt-0.5">Ambiente SAP: <span className="font-medium text-slate-800">{quote.project.sapSystemVersion}</span></p>
              <p className="text-slate-600">Metodología: <span className="font-medium text-slate-800">{quote.project.methodology}</span></p>
              <p className="text-slate-600">Duración: <span className="font-medium text-slate-800">{quote.project.durationMonths} meses</span></p>
              <p className="text-slate-600">Hipercare post Go-Live: <span className="font-medium text-slate-800">{quote.guaranteeHypercareDays} días</span></p>
            </div>
          </div>

          {/* Section 1: Project Scope */}
          <div className="mb-7">
            <h2 className="text-sm font-bold text-blue-900 uppercase tracking-wide border-b border-slate-200 pb-1.5 mb-2.5">
              1. Alcance y Objetivos de la Solución
            </h2>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {quote.project.projectTitle}
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed mb-3">
              {quote.project.scopeDescription || quote.project.businessObjective}
            </p>
          </div>

          {/* Section 2: Financial Summary */}
          <div className="mb-8">
            <h2 className="text-sm font-bold text-blue-900 uppercase tracking-wide border-b border-slate-200 pb-1.5 mb-2.5">
              2. Resumen Económico de la Oferta
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
              <div className="text-xs text-slate-600 space-y-1.5">
                <p className="font-semibold text-slate-800">Condiciones Comerciales y de Pago:</p>
                <p>{quote.paymentTerms || '30 días fecha factura tras aceptación de hito.'}</p>
                <p className="text-slate-500 mt-2">
                  * Horas de consultoría: {totals.totalHours} hrs asignadas.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Servicios:</span>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(totals.subtotalConsulting, quote.currency, quote.currencySymbol)}
                  </span>
                </div>
                {totals.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Descuento Comercial ({quote.discountPercentage}%):</span>
                    <span>- {formatCurrency(totals.discountAmount, quote.currency, quote.currencySymbol)}</span>
                  </div>
                )}
                {totals.taxAmount > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Impuestos / IVA ({quote.taxRatePercentage}%):</span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(totals.taxAmount, quote.currency, quote.currencySymbol)}
                    </span>
                  </div>
                )}
                <div className="border-t border-slate-300 pt-2 flex justify-between text-sm font-bold text-blue-900">
                  <span>Total de la Oferta:</span>
                  <span>{formatCurrency(totals.totalAmount, quote.currency, quote.currencySymbol)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-6 border-t border-slate-200">
            <div className="grid grid-cols-2 gap-12 text-center text-xs">
              <div>
                <div className="border-t border-slate-400 pt-2 mt-12">
                  <p className="font-bold text-slate-900">POR LA CONSULTORA</p>
                  <p className="text-slate-500">Líder de Práctica / Representante Comercial</p>
                </div>
              </div>

              <div>
                <div className="border-t border-slate-400 pt-2 mt-12">
                  <p className="font-bold text-slate-900">ACEPTACIÓN CLIENTE</p>
                  <p className="text-slate-500">{quote.client.companyName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

