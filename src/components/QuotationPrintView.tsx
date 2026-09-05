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
  Check
} from 'lucide-react';
import { Quotation, CompanyProfile } from '../types';
import { calculateQuotationTotals, formatCurrency, getStatusBadge } from '../utils/calculations';
import { downloadQuotationPDF } from '../utils/pdfGenerator';
import { getCachedBancoCentralData, convertUfToClp } from '../services/bcentralService';
import { getStoredCompanyProfile } from '../data/companyProfile';
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

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    downloadQuotationPDF(quote);
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
      estimatedWeek: 'Semana 3',
      paymentPercentage: 30
    },
    {
      id: 'm3',
      title: 'Cierre, Pruebas de Aceptación & Entrega',
      description: 'Pruebas integrales, paso a producción y transferencia de conocimientos.',
      deliverables: 'Puesta en marcha, manual de usuario y acta de entrega formal.',
      estimatedWeek: 'Semana 4',
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
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar PDF</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODO 1: DOSSIER EDITORIAL COMPLETO (ESTILO BRIDEV)                       */}
      {/* ========================================================================= */}
      {viewMode === 'dossier' && (
        <div className="max-w-5xl mx-auto space-y-12 print:space-y-0 print:max-w-none">
          
          {/* ------------------------------------------------------------- */}
          {/* PÁGINA 1: PORTADA CINEMÁTICA FULL-BLEED                       */}
          {/* ------------------------------------------------------------- */}
          <div className="relative min-h-[1050px] w-full bg-slate-950 text-white rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col justify-between p-8 sm:p-14 print:rounded-none print:border-none print:shadow-none print:min-h-screen print:h-screen print:break-after-page">
            
            {/* Background Image with Dark Gradient Overlay */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-45 mix-blend-luminosity"
              style={{ 
                backgroundImage: `url('${selectedCoverImage}')` 
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/80" />

            {/* Top Brand Bar */}
            <div className="relative z-10 flex items-center justify-between gap-4">
              {/* Left: Consultant Brand & Logo */}
              <div className="flex items-center gap-3">
                {activeCompany.logoUrl ? (
                  <div className="h-12 w-auto max-w-[170px] p-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center overflow-hidden shadow-lg">
                    <img
                      src={activeCompany.logoUrl}
                      alt={activeCompany.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-lg text-white tracking-wider shadow-lg shadow-blue-500/20 shrink-0">
                    ⚡
                  </div>
                )}
                <div>
                  <span className="text-xl font-extrabold tracking-tight text-white block leading-tight">
                    {activeCompany.name || 'SAP & TECH CONSULTING'}
                  </span>
                  <span className="text-[10px] tracking-widest text-slate-400 uppercase font-mono block">
                    {activeCompany.subheading || 'Enterprise Solutions Group'}
                  </span>
                </div>
              </div>

              {/* Right: Client Logo / Badge */}
              <div className="text-right flex items-center gap-2.5">
                {quote.client.logoUrl ? (
                  <div className="h-11 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-2.5 shadow-xs">
                    <div className="h-7 w-auto max-w-[90px] flex items-center justify-center overflow-hidden">
                      <img
                        src={quote.client.logoUrl}
                        alt={quote.client.fantasyName || quote.client.companyName}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <span className="text-[11px] font-mono font-bold text-slate-200 border-l border-white/20 pl-2 hidden sm:inline">
                      {quote.client.fantasyName || quote.client.companyName}
                    </span>
                  </div>
                ) : (
                  <span className="px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] font-mono font-bold text-slate-300">
                    {quote.client.fantasyName || quote.client.companyName}
                  </span>
                )}
              </div>
            </div>

            {/* Middle: Title & Project Hook */}
            <div className="relative z-10 max-w-3xl space-y-5 my-auto py-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-500/20 border border-blue-400/30 text-blue-300 font-mono text-xs font-bold tracking-widest uppercase">
                <span>COTIZACIÓN COMERCIAL</span>
                <span>•</span>
                <span>V{quote.version}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                {quote.project.projectTitle}
              </h1>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-normal max-w-2xl">
                {quote.project.businessObjective || quote.project.scopeDescription || 'Propuesta técnico-comercial de consultoría experta, implementación de arquitectura de software e integración de sistemas.'}
              </p>

              {/* Floating Investment Card (Exact Bridev Style) */}
              <div className="mt-8 inline-block bg-blue-600 text-white rounded-2xl p-6 sm:p-7 shadow-2xl shadow-blue-600/30 border border-blue-400/40 max-w-md w-full">
                <span className="text-[11px] font-mono uppercase tracking-widest text-blue-200 font-extrabold block mb-1">
                  INVERSIÓN · PRECIO CERRADO
                </span>
                
                <div className="text-2xl sm:text-3xl font-black tracking-tight">
                  {formatUfNumber(totalInUf)} UF{' '}
                  <span className="text-blue-100 font-bold text-xl sm:text-2xl">
                    (${formatClpNumber(totalInClp)})
                  </span>
                </div>

                <div className="mt-2 text-xs text-blue-100 font-medium">
                  UF ${formatClpNumber(ufRate)} del {ufDate} · {quote.taxRatePercentage > 0 ? `Incluye ${quote.taxRatePercentage}% IVA` : 'No afecto a IVA'}
                </div>

                <div className="mt-3 pt-3 border-t border-blue-400/50 text-[11px] text-blue-200">
                  Hipercare y garantía incluidos por {quote.guaranteeHypercareDays} días corridos desde el aviso de entrega.
                </div>
              </div>
            </div>

            {/* Bottom: Proposal Metadata Footer */}
            <div className="relative z-10 pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-400 font-mono">
              <div className="space-y-1">
                <p className="text-white font-bold text-sm">Cotización N.º {quote.code} · v{quote.version}</p>
                <p>Emitida el {quote.createdAt}</p>
                <p>Vigencia: {activeValidityDays} días corridos · Plazo: {quote.project.durationMonths} meses ({quote.project.durationMonths * 4} semanas)</p>
              </div>

              <div className="space-y-1 sm:text-right">
                <p className="text-slate-300 font-bold">Preparada para:</p>
                <p className="text-white font-semibold">{quote.client.companyName}</p>
                <p className="text-[11px] text-slate-500">
                  Documento confidencial. Reserva: {activeConfidentialityMonths} meses desde entrega, rechazo o vencimiento.
                </p>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* PÁGINAS INTERIORES CON MARGEN LATERAL DE TRAZABILIDAD (BRIDEV) */}
          {/* ------------------------------------------------------------- */}

          {/* PÁGINA 2: INTRODUCCIÓN Y ENFOQUE "HOY VS QUEDA CONSTRUIDO" */}
          <div className="relative min-h-[1050px] w-full bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-200 p-8 sm:p-12 pl-12 sm:pl-20 print:rounded-none print:border-none print:shadow-none print:min-h-screen print:h-screen print:break-after-page flex flex-col justify-between">
            
            {/* Margen Lateral Izquierdo (Barcode + Vertical Text) */}
            <div className="absolute left-0 top-0 bottom-0 w-10 sm:w-12 border-r border-slate-200 bg-slate-50 flex flex-col items-center justify-between py-6">
              <div className="w-6 h-6 border border-slate-300 bg-white flex items-center justify-center rounded text-[9px] font-mono font-bold text-slate-700">
                QR
              </div>
              
              <div className="[writing-mode:vertical-rl] rotate-180 text-[9px] font-mono text-slate-400 tracking-wider whitespace-nowrap">
                Cotización {quote.code} v{quote.version} · Documento confidencial · Reserva {activeConfidentialityMonths} meses
              </div>

              <div className="flex flex-col gap-0.5 w-4 opacity-75">
                {[4, 2, 6, 1, 5, 3, 7, 2, 4, 6, 2, 5, 3].map((h, i) => (
                  <div key={i} className="bg-slate-800 w-full" style={{ height: `${h * 1.5}px` }} />
                ))}
              </div>
            </div>

            {/* Header de Página */}
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-6">
                <span className="text-xs font-bold uppercase tracking-widest text-blue-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  INTRODUCCIÓN & OBJETIVOS
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {quote.code}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 mb-3">
                Qué se va a construir
              </h2>

              <p className="text-sm text-slate-700 leading-relaxed mb-6 max-w-3xl">
                Se entrega la solución integral <strong className="text-slate-900">{quote.project.projectTitle}</strong> bajo estándar metodológico <strong className="text-slate-900">{quote.project.methodology}</strong> para el cliente <strong className="text-slate-900">{quote.client.companyName}</strong>. El proyecto asegura trazabilidad, gobernanza técnica y adopción operativa sin riesgos colaterales en la arquitectura de sistemas.
              </p>

              {/* Contraste Clave: "Hoy" vs "Queda Construido" */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                <div className="border border-red-200 bg-red-50/40 rounded-xl p-5">
                  <span className="text-xs font-bold uppercase tracking-wider text-red-900 block mb-2">
                    Situación Actual (Hoy)
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                    {currentHoy}
                  </p>
                </div>

                <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-5">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 block mb-2">
                    Queda Construido
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                    {currentQuedaConstruido}
                  </p>
                </div>
              </div>

              {/* Ficha Técnica Rápida */}
              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/70 mb-8">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-3">
                  Superficies que entrega esta propuesta
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-900 block">Arquitectura & Parametrización</span>
                    <p className="text-slate-600 mt-1">Ambiente {quote.project.sapSystemVersion} configurado bajo lineamientos de buenas prácticas.</p>
                  </div>

                  <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-900 block">Equipo de Especialistas</span>
                    <p className="text-slate-600 mt-1">{totals.totalHours} horas de consultoría funcional y técnica certificada.</p>
                  </div>

                  <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-900 block">Garantía & Hipercare</span>
                    <p className="text-slate-600 mt-1">{quote.guaranteeHypercareDays} días de soporte prioritario post puesta en marcha.</p>
                  </div>
                </div>
              </div>

              {/* Recuadro de Precio Cerrado y Plazo */}
              <div className="border-l-4 border-blue-600 bg-blue-50/70 p-4 rounded-r-xl text-xs text-slate-800 space-y-1">
                <p>
                  <strong className="text-blue-950">Entrega de alcance cerrado:</strong> Precio cerrado de <strong className="text-blue-900">{formatUfNumber(totalInUf)} UF (${formatClpNumber(totalInClp)} CLP)</strong>. Plazo estimado de ejecución: {quote.project.durationMonths} meses ({quote.project.durationMonths * 4} semanas hábiles) desde la condición "Listo para Iniciar".
                </p>
                <p className="text-slate-600 text-[11px]">
                  * No incluye licencias de software base, costos de nube de terceros ajenos a la oferta ni cambios de alcance fuera de los requisitos acordados.
                </p>
              </div>
            </div>

            {/* Número de página */}
            <div className="text-right text-xs font-mono text-slate-400 pt-4 border-t border-slate-100">
              Página 2
            </div>
          </div>

          {/* PÁGINA 3: DESGLOSE ECONÓMICO Y STAFFING */}
          <div className="relative min-h-[1050px] w-full bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-200 p-8 sm:p-12 pl-12 sm:pl-20 print:rounded-none print:border-none print:shadow-none print:min-h-screen print:h-screen print:break-after-page flex flex-col justify-between">
            
            {/* Margen Lateral Izquierdo */}
            <div className="absolute left-0 top-0 bottom-0 w-10 sm:w-12 border-r border-slate-200 bg-slate-50 flex flex-col items-center justify-between py-6">
              <div className="w-6 h-6 border border-slate-300 bg-white flex items-center justify-center rounded text-[9px] font-mono font-bold text-slate-700">QR</div>
              <div className="[writing-mode:vertical-rl] rotate-180 text-[9px] font-mono text-slate-400 tracking-wider whitespace-nowrap">
                Cotización {quote.code} v{quote.version} · Documento confidencial · Reserva {activeConfidentialityMonths} meses
              </div>
              <div className="flex flex-col gap-0.5 w-4 opacity-75">
                {[3, 5, 2, 7, 4, 1, 6, 3, 5, 2, 4].map((h, i) => (
                  <div key={i} className="bg-slate-800 w-full" style={{ height: `${h * 1.5}px` }} />
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-6">
                <span className="text-xs font-bold uppercase tracking-widest text-blue-700 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  DISTRIBUCIÓN ECONÓMICA & SERVICIOS
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {quote.code}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
                    Distribución de Inversión
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Precio cerrado {formatUfNumber(totalInUf)} UF (${formatClpNumber(totalInClp)} CLP).
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 px-4 py-2.5 rounded-xl text-right">
                  <span className="text-[10px] uppercase font-bold text-blue-800 block">Total Proyecto</span>
                  <span className="text-lg font-black text-blue-900 font-mono">
                    {formatUfNumber(totalInUf)} UF
                  </span>
                </div>
              </div>

              {/* Tabla de Recursos Consultores SAP */}
              {quote.resources && quote.resources.length > 0 && (
                <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
                  <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center text-xs font-bold text-slate-700">
                    <span>EQUIPO CONSULTOR SAP ASIGNADO</span>
                    <span>Total Horas: {totals.totalHours} hrs</span>
                  </div>
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="p-3">Módulo SAP</th>
                        <th className="p-3">Rol / Título</th>
                        <th className="p-3">Seniority</th>
                        <th className="p-3">Modalidad</th>
                        <th className="p-3 text-right">Horas</th>
                        <th className="p-3 text-right">Tarifa</th>
                        <th className="p-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {quote.resources.map((res, i) => (
                        <tr key={res.id || i} className="hover:bg-slate-50/60">
                          <td className="p-3 font-semibold text-slate-900">
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded text-[10px] font-bold">
                              {res.moduleCode}
                            </span>
                            <span className="ml-2">{res.moduleName}</span>
                          </td>
                          <td className="p-3 font-medium text-slate-800">{res.roleTitle}</td>
                          <td className="p-3 text-slate-600">{res.seniority}</td>
                          <td className="p-3 text-slate-600">{res.modality}</td>
                          <td className="p-3 text-right font-bold text-slate-900">{res.hours} hrs</td>
                          <td className="p-3 text-right font-mono text-slate-700">
                            {formatCurrency(res.hourlyRate, quote.currency, quote.currencySymbol)}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-blue-900">
                            {formatCurrency(res.subtotal || (res.hours * res.hourlyRate), quote.currency, quote.currencySymbol)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Servicios de Remuneraciones o Hunting si aplican */}
              {(quote.payrollService?.enabled || quote.recruitmentService?.enabled) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {quote.payrollService?.enabled && (
                    <div className="border border-blue-200 bg-blue-50/30 rounded-xl p-4 text-xs">
                      <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-blue-200">
                        <span className="font-bold text-blue-900 uppercase tracking-wide">Servicio Remuneraciones</span>
                        <span className="font-bold font-mono text-blue-900">{formatUfNumber(quote.payrollService.totalUF)} UF</span>
                      </div>
                      <p className="text-slate-600">
                        Procesamiento nómina: {quote.payrollService.payrollHeadcount} personas ({formatUfNumber(quote.payrollService.payrollSubtotalUF)} UF).
                      </p>
                      <p className="text-slate-600">
                        Control asistencia: {quote.payrollService.attendanceHeadcount} personas ({formatUfNumber(quote.payrollService.attendanceSubtotalUF)} UF).
                      </p>
                    </div>
                  )}

                  {quote.recruitmentService?.enabled && (
                    <div className="border border-indigo-200 bg-indigo-50/30 rounded-xl p-4 text-xs">
                      <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-indigo-200">
                        <span className="font-bold text-indigo-900 uppercase tracking-wide">Reclutamiento & Headhunting</span>
                        <span className="font-bold font-mono text-indigo-900">{formatUfNumber(quote.recruitmentService.totalUF)} UF</span>
                      </div>
                      <p className="text-slate-600">
                        Tipo: {quote.recruitmentService.processType}
                      </p>
                      {quote.recruitmentService.includeGrossSalaryFee && (
                        <p className="text-slate-600">
                          Tarifa Éxito: {quote.recruitmentService.grossSalaryFeePercentage}% Renta Bruta ({formatUfNumber(quote.recruitmentService.grossSalaryFeeTotalUF)} UF).
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Resumen Totalizador */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                <div className="space-y-1 text-slate-600">
                  <p><strong className="text-slate-900">Moneda de emisión:</strong> {quote.currency} ({quote.currencySymbol})</p>
                  <p><strong className="text-slate-900">Condición impositiva:</strong> {quote.taxRatePercentage > 0 ? `Afecto a ${quote.taxRatePercentage}% IVA` : 'Exento de IVA'}</p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Total con Impuestos:</span>
                  <span className="text-xl font-black text-slate-950 font-mono block">
                    {formatCurrency(totals.totalAmount, quote.currency, quote.currencySymbol)}
                  </span>
                  <span className="text-[11px] font-mono text-blue-800">
                    ≈ ${formatClpNumber(totalInClp)} CLP (Tipo de cambio BCCh)
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right text-xs font-mono text-slate-400 pt-4 border-t border-slate-100">
              Página 3
            </div>
          </div>

          {/* PÁGINA 4: METODOLOGÍA, PLAZOS Y CONDICIONES DE INICIO */}
          <div className="relative min-h-[1050px] w-full bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-200 p-8 sm:p-12 pl-12 sm:pl-20 print:rounded-none print:border-none print:shadow-none print:min-h-screen print:h-screen print:break-after-page flex flex-col justify-between">
            
            {/* Margen Lateral Izquierdo */}
            <div className="absolute left-0 top-0 bottom-0 w-10 sm:w-12 border-r border-slate-200 bg-slate-50 flex flex-col items-center justify-between py-6">
              <div className="w-6 h-6 border border-slate-300 bg-white flex items-center justify-center rounded text-[9px] font-mono font-bold text-slate-700">QR</div>
              <div className="[writing-mode:vertical-rl] rotate-180 text-[9px] font-mono text-slate-400 tracking-wider whitespace-nowrap">
                Cotización {quote.code} v{quote.version} · Documento confidencial · Reserva {activeConfidentialityMonths} meses
              </div>
              <div className="flex flex-col gap-0.5 w-4 opacity-75">
                {[6, 2, 4, 1, 5, 3, 2, 6, 4, 2].map((h, i) => (
                  <div key={i} className="bg-slate-800 w-full" style={{ height: `${h * 1.5}px` }} />
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-6">
                <span className="text-xs font-bold uppercase tracking-widest text-blue-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  METODOLOGÍA & CALENDARIO
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {quote.code}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 mb-2">
                Metodología y Plazos de Ejecución
              </h2>
              <p className="text-xs text-slate-600 mb-6">
                Enfoque de entrega estructurado para garantizar el cumplimiento del plazo de {quote.project.durationMonths} meses.
              </p>

              {/* 4 Steps timeline cards (Bridev style) */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6 text-xs">
                <div className="border border-blue-200 bg-blue-50/50 rounded-xl p-3.5">
                  <span className="text-xs font-mono font-bold text-blue-800 block mb-1">01 · Kickoff & Gate 1</span>
                  <p className="font-semibold text-slate-900">Día hábil 1</p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Firma de contrato, entrega de accesos y habilitación de usuarios de trabajo.
                  </p>
                </div>

                <div className="border border-slate-200 bg-slate-50 rounded-xl p-3.5">
                  <span className="text-xs font-mono font-bold text-slate-700 block mb-1">02 · Construcción</span>
                  <p className="font-semibold text-slate-900">Semanas 1–2</p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Parametrización de módulos, integraciones y flujos funcionales.
                  </p>
                </div>

                <div className="border border-slate-200 bg-slate-50 rounded-xl p-3.5">
                  <span className="text-xs font-mono font-bold text-slate-700 block mb-1">03 · Demo & Pruebas</span>
                  <p className="font-semibold text-slate-900">Semana 3</p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Ambiente QA navegable, validación con usuarios clave y demo de avance.
                  </p>
                </div>

                <div className="border border-slate-200 bg-slate-50 rounded-xl p-3.5">
                  <span className="text-xs font-mono font-bold text-slate-700 block mb-1">04 · Cierre & Go-Live</span>
                  <p className="font-semibold text-slate-900">Semana 4</p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Paso a productivo, inicio de hipercare ({quote.guaranteeHypercareDays} días) y acta de entrega.
                  </p>
                </div>
              </div>

              {/* Tabla de Hitos y Facturación */}
              <div className="border border-slate-200 rounded-xl overflow-hidden mb-6 text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Hito / Entregable</th>
                      <th className="p-3">Entregable Verificable</th>
                      <th className="p-3">Momento</th>
                      <th className="p-3 text-right">% Facturación</th>
                      <th className="p-3 text-right">Monto Estimado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {milestonesList.map((m, i) => (
                      <tr key={m.id || i} className="hover:bg-slate-50/50">
                        <td className="p-3 font-bold text-slate-900">{m.title}</td>
                        <td className="p-3 text-slate-600">{m.deliverables || m.description}</td>
                        <td className="p-3 text-slate-600 font-mono text-[11px]">{m.estimatedWeek}</td>
                        <td className="p-3 text-right font-bold text-slate-900">{m.paymentPercentage}%</td>
                        <td className="p-3 text-right font-mono font-bold text-blue-900">
                          {formatUfNumber(totalInUf * (m.paymentPercentage / 100))} UF
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Condición de Inicio Crucial ("Gatekeeper") */}
              <div className="border border-amber-300 bg-amber-50/70 rounded-xl p-5 text-xs text-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>Condición "Listo para Iniciar" (Gate de Inicio Día 1)</span>
                </div>
                <p className="leading-relaxed whitespace-pre-line">
                  {gatekeeperText}
                </p>
                <p className="text-[11px] text-amber-900 font-medium">
                  * Pruebas de aceptación (UAT): Tras la notificación de entrega en ambiente QA, el cliente dispone de 2 días hábiles de revisión formal; el silencio o uso productivo equivale a aceptación tácita.
                </p>
              </div>
            </div>

            <div className="text-right text-xs font-mono text-slate-400 pt-4 border-t border-slate-100">
              Página 4
            </div>
          </div>

          {/* PÁGINA 5: FUERA DE ALCANCE Y MATRIZ DE RIESGOS */}
          <div className="relative min-h-[1050px] w-full bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-200 p-8 sm:p-12 pl-12 sm:pl-20 print:rounded-none print:border-none print:shadow-none print:min-h-screen print:h-screen print:break-after-page flex flex-col justify-between">
            
            {/* Margen Lateral Izquierdo */}
            <div className="absolute left-0 top-0 bottom-0 w-10 sm:w-12 border-r border-slate-200 bg-slate-50 flex flex-col items-center justify-between py-6">
              <div className="w-6 h-6 border border-slate-300 bg-white flex items-center justify-center rounded text-[9px] font-mono font-bold text-slate-700">QR</div>
              <div className="[writing-mode:vertical-rl] rotate-180 text-[9px] font-mono text-slate-400 tracking-wider whitespace-nowrap">
                Cotización {quote.code} v{quote.version} · Documento confidencial · Reserva {activeConfidentialityMonths} meses
              </div>
              <div className="flex flex-col gap-0.5 w-4 opacity-75">
                {[5, 1, 4, 6, 2, 7, 3, 2, 4, 5].map((h, i) => (
                  <div key={i} className="bg-slate-800 w-full" style={{ height: `${h * 1.5}px` }} />
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-6">
                <span className="text-xs font-bold uppercase tracking-widest text-blue-700 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  LÍMITES & GESTIÓN DE RIESGOS
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {quote.code}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 mb-2">
                Fuera de Alcance Expreso
              </h2>
              <p className="text-xs text-slate-600 mb-6">
                Para evitar falsas expectativas o sobrecostos, lo listado a continuación se encuentra explícitamente excluido de la oferta y requerirá orden de cambio independiente:
              </p>

              {/* Categorías Fuera de Alcance Dinámicas (Estilo Bridev) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-xs">
                {activeOutOfScope.map((cat, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-xl p-4 bg-slate-50/70">
                    <span className="font-bold text-slate-900 block mb-1.5">{cat.category}</span>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-line">{cat.description}</p>
                  </div>
                ))}
              </div>

              {/* Matriz de Riesgos y Mitigación Dinámica */}
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">
                Matriz de Riesgos & Mitigación Operativa
              </h3>

              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs mb-6">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3 w-1/4">Riesgo Detectado</th>
                      <th className="p-3 w-1/3">Impacto Potencial</th>
                      <th className="p-3 w-1/3">Plan de Mitigación</th>
                      <th className="p-3 text-center">Responsable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {activeRisks.map((risk, idx) => (
                      <tr key={risk.id || idx} className="hover:bg-slate-50/50">
                        <td className="p-3 font-bold text-slate-900">{risk.risk}</td>
                        <td className="p-3 text-slate-600">{risk.impact}</td>
                        <td className="p-3 text-slate-600">{risk.mitigation}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            risk.owner === 'Cliente' ? 'bg-amber-100 text-amber-800' :
                            risk.owner === 'Consultora' ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {risk.owner}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="text-right text-xs font-mono text-slate-400 pt-4 border-t border-slate-100">
              Página 5
            </div>
          </div>

          {/* PÁGINA 6: PROPUESTA COMPLETA, RESUMEN LEGAL Y FIRMAS (HOJA EJECUTIVA) */}
          <div className="relative min-h-[1050px] w-full bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-200 p-8 sm:p-12 pl-12 sm:pl-20 print:rounded-none print:border-none print:shadow-none print:min-h-screen print:h-screen print:break-after-page flex flex-col justify-between">
            
            {/* Margen Lateral Izquierdo */}
            <div className="absolute left-0 top-0 bottom-0 w-10 sm:w-12 border-r border-slate-200 bg-slate-50 flex flex-col items-center justify-between py-6">
              <div className="w-6 h-6 border border-slate-300 bg-white flex items-center justify-center rounded text-[9px] font-mono font-bold text-slate-700">QR</div>
              <div className="[writing-mode:vertical-rl] rotate-180 text-[9px] font-mono text-slate-400 tracking-wider whitespace-nowrap">
                Cotización {quote.code} v{quote.version} · Documento confidencial · Reserva {activeConfidentialityMonths} meses
              </div>
              <div className="flex flex-col gap-0.5 w-4 opacity-75">
                {[7, 3, 5, 2, 6, 1, 4, 3, 6, 2].map((h, i) => (
                  <div key={i} className="bg-slate-800 w-full" style={{ height: `${h * 1.5}px` }} />
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-6">
                <span className="text-xs font-bold uppercase tracking-widest text-blue-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  ACUERDO FORMAL & FIRMAS
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {quote.code}
                </span>
              </div>

              <div className="flex items-start justify-between gap-6 mb-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
                    Propuesta Completa
                  </h2>
                  <p className="text-xs text-slate-600 mt-1 max-w-xl">
                    Al firmar, el cliente acepta esta cotización en todas sus partes. Quien suscribe declara tener facultades para obligar a la entidad y haber leído el alcance cerrado, calendario, garantías y reserva de confidencialidad.
                  </p>
                </div>

                <div className="bg-blue-600 text-white p-4 rounded-xl shadow-md text-right shrink-0">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-blue-200 block">INVERSIÓN FINAL</span>
                  <span className="text-xl font-black font-mono block">
                    {formatUfNumber(totalInUf)} UF
                  </span>
                  <span className="text-[11px] text-blue-100 font-mono">
                    (${formatClpNumber(totalInClp)} CLP)
                  </span>
                </div>
              </div>

              {/* Resumen de Aceptación (Exact 8 Points of Bridev) */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs mb-8">
                <div className="bg-slate-100 px-4 py-2 font-bold text-slate-800 uppercase tracking-wide border-b border-slate-200">
                  Resumen de Aceptación Contractual
                </div>
                <div className="divide-y divide-slate-200">
                  <div className="grid grid-cols-1 sm:grid-cols-4 p-2.5">
                    <span className="font-bold text-slate-900">01 Objeto</span>
                    <span className="col-span-3 text-slate-700">{quote.project.projectTitle} para {quote.client.companyName}.</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 p-2.5 bg-slate-50/50">
                    <span className="font-bold text-slate-900">02 Precio</span>
                    <span className="col-span-3 text-slate-700 font-mono font-semibold">
                      {formatUfNumber(totalInUf)} UF (${formatClpNumber(totalInClp)} CLP). UF oficial BCCh al día de emisión.
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 p-2.5">
                    <span className="font-bold text-slate-900">03 Plazo e inicio</span>
                    <span className="col-span-3 text-slate-700">{quote.project.durationMonths} meses ({quote.project.durationMonths * 4} semanas hábiles) desde entrega formal de requisitos y accesos.</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 p-2.5 bg-slate-50/50">
                    <span className="font-bold text-slate-900">04 Pagos</span>
                    <span className="col-span-3 text-slate-700 font-mono">
                      Anticipo 40% ({formatUfNumber(totalInUf * 0.4)} UF) · Avance 30% ({formatUfNumber(totalInUf * 0.3)} UF) · Cierre 30% ({formatUfNumber(totalInUf * 0.3)} UF).
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 p-2.5">
                    <span className="font-bold text-slate-900">05 Entrega</span>
                    <span className="col-span-3 text-slate-700">Puesta en marcha, entrega de código/parametrizaciones acordadas y manual de usuario.</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 p-2.5 bg-slate-50/50">
                    <span className="font-bold text-slate-900">06 Fuera de alcance</span>
                    <span className="col-span-3 text-slate-700">Licencias SAP/terceros, consumos cloud de terceros y desarrollos no inventariados.</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 p-2.5">
                    <span className="font-bold text-slate-900">07 Garantía y UAT</span>
                    <span className="col-span-3 text-slate-700">{quote.guaranteeHypercareDays} días corridos de soporte correctivo. UAT: 2 días hábiles; silencio = aceptación.</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 p-2.5 bg-slate-50/50">
                    <span className="font-bold text-slate-900">08 Confidencialidad</span>
                    <span className="col-span-3 text-slate-700">Reserva recíproca de información por {activeConfidentialityMonths} meses. Legislación aplicable: República de Chile.</span>
                  </div>
                </div>
              </div>

              {/* Doble Bloque de Firma Legal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                {/* Consultora */}
                <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/40 text-xs space-y-3">
                  <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
                    <span className="font-bold text-slate-900 uppercase tracking-wide">
                      Por la Consultora Emisora
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      RUT: {activeCompany.taxId}
                    </span>
                  </div>
                  <div className="h-14 flex items-end">
                    <div className="font-serif italic text-lg text-blue-900 font-bold border-b border-slate-400 w-full pb-1">
                      {activeCompany.legalRepresentative?.name || activeLead.name}
                    </div>
                  </div>
                  <div className="text-slate-700 space-y-0.5">
                    <p className="font-bold text-slate-900">{activeCompany.legalRepresentative?.name || activeLead.name}</p>
                    <p className="text-[11px] font-medium text-slate-600">
                      {activeCompany.legalRepresentative?.role || activeLead.role}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {activeCompany.legalName} · {activeCompany.city || 'Santiago, Chile'}
                    </p>
                  </div>
                </div>

                {/* Cliente */}
                <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/40 text-xs space-y-3">
                  <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
                    <span className="font-bold text-slate-900 uppercase tracking-wide">
                      Representante Autorizado Cliente
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      RUT: {quote.client.taxId || 'N/A'}
                    </span>
                  </div>
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 w-16">Nombre:</span>
                      <div className="border-b border-slate-300 flex-1 font-semibold text-slate-900">{activeClientSigner.name}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 w-16">RUT:</span>
                      <div className="border-b border-slate-300 flex-1 font-semibold text-slate-900">{activeClientSigner.taxId || quote.client.taxId || '____________________'}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 w-16">Cargo:</span>
                      <div className="border-b border-slate-300 flex-1 font-semibold text-slate-900">{activeClientSigner.role}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 w-16">Razón Social:</span>
                      <div className="border-b border-slate-300 flex-1 text-slate-700 truncate">{quote.client.companyName}</div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 pt-1 italic text-center">
                    Leído y aceptado por el cliente con plenas facultades legales y tributarias.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-right text-xs font-mono text-slate-400 pt-4 border-t border-slate-100">
              Página 6
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* PÁGINA 7: CONTRAPORTADA CINEMÁTICA DE CIERRE                  */}
          {/* ------------------------------------------------------------- */}
          <div className="relative min-h-[900px] w-full bg-slate-950 text-white rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col justify-between p-8 sm:p-14 print:rounded-none print:border-none print:shadow-none print:min-h-screen print:h-screen print:break-after-page">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity"
              style={{ 
                backgroundImage: `url('${selectedCoverImage}')` 
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950" />

            <div className="relative z-10">
              <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
                COTIZACIÓN COMERCIAL · CIERRE
              </span>
            </div>

            <div className="relative z-10 max-w-md mx-auto text-center space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center font-bold text-2xl text-white mx-auto shadow-xl shadow-blue-500/20">
                ⚡
              </div>

              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-slate-400 block mb-1">
                  PROPUESTA ELABORADA POR
                </span>
                <h3 className="text-2xl font-bold text-white">
                  {activeLead.name}
                </h3>
                <p className="text-sm text-blue-300 mt-0.5 font-medium">
                  {activeLead.role}
                </p>
                <p className="text-xs text-slate-300 mt-2 font-mono">
                  {activeLead.location} · {activeLead.email}
                </p>
                <p className="text-xs text-slate-400 font-mono">
                  {activeLead.phone}
                </p>
              </div>

              <div className="p-4 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 text-xs text-slate-300 leading-relaxed">
                Para aceptar esta propuesta, firmar la página 6. Esta oferta rige durante {activeValidityDays} días corridos y no constituye contrato hasta su aceptación escrita.
              </div>
            </div>

            <div className="relative z-10 pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-400 font-mono">
              <div>
                <p className="text-white font-bold">Cotización N.º {quote.code} · v{quote.version}</p>
                <p>Vigencia: {activeValidityDays} días corridos</p>
              </div>
              <div className="sm:text-center">
                <p className="text-white font-bold">Cliente: {quote.client.companyName}</p>
                <p>Documento confidencial</p>
              </div>
              <div className="sm:text-right">
                <p className="text-blue-400 font-bold">{formatUfNumber(totalInUf)} UF · Proyecto</p>
                <p>Reserva legal {activeConfidentialityMonths} meses</p>
              </div>
            </div>
          </div>
        </div>
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
                {quote.client.logoUrl && (
                  <div className="h-6 w-auto max-w-[80px] flex items-center justify-center overflow-hidden">
                    <img src={quote.client.logoUrl} alt="" className="max-h-full max-w-full object-contain" />
                  </div>
                )}
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

