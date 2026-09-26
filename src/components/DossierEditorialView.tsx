import React from 'react';
import { 
  FileText, 
  Layers, 
  Calendar, 
  ShieldCheck, 
  AlertTriangle, 
  Building2, 
  CheckCircle2, 
  Handshake, 
  Clock, 
  Globe2 
} from 'lucide-react';
import { Quotation, CompanyProfile, DocumentLanguage } from '../types';
import { calculateQuotationTotals, formatCurrency } from '../utils/calculations';
import { getCachedBancoCentralData, convertUfToClp } from '../services/bcentralService';
import { getStoredCompanyProfile } from '../data/companyProfile';
import { getClientLogo } from '../data/defaultClientLogos';
import { 
  DEFAULT_RISK_ITEMS, 
  DEFAULT_OUT_OF_SCOPE_CATEGORIES, 
  DEFAULT_GATEKEEPER_CONDITION, 
  getDossierPresetsByProjectType 
} from '../data/dossierPresets';
import { GanttTimelineView } from './gantt/GanttTimelineView';
import { createDefaultGanttPlanForQuotation } from '../data/ganttTemplates';
import { computeGanttStages, parseDate } from '../utils/ganttDateUtils';
import { COUNTRIES } from '../utils/ganttHolidayUtils';
import { getDossierPalette } from '../utils/dossierPalettes';
import { 
  getDossierTranslation, 
  localizeGanttPlan, 
  getLocalizedDossierPresets, 
  getLocalizedGatekeeper, 
  getLocalizedRisks, 
  getLocalizedOutOfScope 
} from '../utils/dossierTranslations';
import { 
  translateProjectTitle, 
  translateEnterpriseText, 
  getLocalizedProjectType 
} from '../services/translationService';

export interface DossierEditorialViewProps {
  quote: Quotation;
  companyProfile?: CompanyProfile;
  isPrintStaging?: boolean;
  language?: DocumentLanguage;
}

export const DossierEditorialView: React.FC<DossierEditorialViewProps> = ({
  quote,
  companyProfile,
  isPrintStaging = false,
  language
}) => {
  const currentLang: DocumentLanguage = language || quote.documentLanguage || 'es';
  const t = getDossierTranslation(currentLang);

  const activeCompany = companyProfile || getStoredCompanyProfile();
  const activePalette = getDossierPalette(quote.colorPalette);
  const totals = calculateQuotationTotals(quote);
  const bcentral = getCachedBancoCentralData();
  const ufRate = bcentral.indicators.uf.value || 40879.04;
  const ufDate = bcentral.indicators.uf.date || '2026-09-04';

  const clientLogoUrl = getClientLogo(quote.client);
  const clientDisplayName = quote.client.fantasyName || quote.client.companyName;

  // Language-aware dynamic texts for project title, objective, scope, and project type
  const effectiveProjectTitle = translateProjectTitle(
    quote.project.projectTitle,
    currentLang,
    clientDisplayName
  );
  const effectiveBusinessObjective = translateEnterpriseText(
    quote.project.businessObjective,
    currentLang
  );
  const effectiveScopeDescription = translateEnterpriseText(
    quote.project.scopeDescription,
    currentLang
  );
  const effectiveProjectType = getLocalizedProjectType(
    quote.project.projectType,
    currentLang
  );

  // Effective localized Gantt Plan for presentation
  const baseGantt = quote.ganttPlan || createDefaultGanttPlanForQuotation(
    effectiveProjectTitle,
    quote.project.estimatedStartDate,
    quote.client.country
  );
  const effectiveGanttPlan = localizeGanttPlan(baseGantt, currentLang);

  const ganttComputed = computeGanttStages(
    effectiveGanttPlan.stages,
    effectiveGanttPlan.settings.startDate,
    effectiveGanttPlan.settings.calendar,
    effectiveGanttPlan.settings.presentationWindow
  );
  const ganttCountry = COUNTRIES.find((c) => c.code === effectiveGanttPlan.settings.calendar?.country) || COUNTRIES[0];
  const ganttFinalStage = ganttComputed.computedStages[ganttComputed.computedStages.length - 1];

  // Dynamic Dossier Values (with language-aware presets fallback)
  const localizedPresets = getLocalizedDossierPresets(quote.project.projectType || 'Roll-out de Módulos', currentLang);

  const isDefaultHoy = !quote.currentSituationHoy || 
    quote.currentSituationHoy.includes('Procesos operativos') || 
    quote.currentSituationHoy.includes('Procesamiento de nómina') ||
    quote.currentSituationHoy.includes('Posiciones clave') ||
    quote.currentSituationHoy.includes('Entorno SAP ERP') ||
    quote.currentSituationHoy.includes('Acumulación de requerimientos');

  const currentHoy = (isDefaultHoy && currentLang !== 'es')
    ? localizedPresets.hoy 
    : (quote.currentSituationHoy || localizedPresets.hoy);

  const isDefaultQueda = !quote.builtSolutionQuedaConstruido || 
    quote.builtSolutionQuedaConstruido.includes('Solución empresarial') || 
    quote.builtSolutionQuedaConstruido.includes('Servicio externalizado') ||
    quote.builtSolutionQuedaConstruido.includes('Proceso estructurado') ||
    quote.builtSolutionQuedaConstruido.includes('Migración técnica') ||
    quote.builtSolutionQuedaConstruido.includes('Fábrica de software');

  const currentQuedaConstruido = (isDefaultQueda && currentLang !== 'es')
    ? localizedPresets.quedaConstruido 
    : (quote.builtSolutionQuedaConstruido || localizedPresets.quedaConstruido);

  const isDefaultGatekeeper = !quote.gatekeeperCondition || quote.gatekeeperCondition.includes('El cómputo del plazo');
  const gatekeeperText = (isDefaultGatekeeper && currentLang !== 'es')
    ? getLocalizedGatekeeper(currentLang)
    : (quote.gatekeeperCondition || getLocalizedGatekeeper(currentLang));

  const isDefaultRisks = !quote.riskItems || quote.riskItems.length === 0 || quote.riskItems[0]?.risk?.includes('Demora en provisión');
  const activeRisks = (isDefaultRisks && currentLang !== 'es')
    ? getLocalizedRisks(currentLang)
    : (quote.riskItems && quote.riskItems.length > 0 ? quote.riskItems : getLocalizedRisks(currentLang));

  const isDefaultOutOfScope = !quote.outOfScopeCategories || quote.outOfScopeCategories.length === 0 || quote.outOfScopeCategories[0]?.title?.includes('Infraestructura');
  const activeOutOfScope = (isDefaultOutOfScope && currentLang !== 'es')
    ? getLocalizedOutOfScope(currentLang)
    : (quote.outOfScopeCategories && quote.outOfScopeCategories.length > 0 ? quote.outOfScopeCategories : getLocalizedOutOfScope(currentLang));

  const activeValidityDays = quote.validityDays || 30;
  const activeConfidentialityMonths = quote.confidentialityMonths || 6;
  const activeLead = quote.commercialLead || {
    name: 'Diego Rodrigues',
    role: currentLang === 'en' ? 'Practice Lead & Senior SAP Architect' : currentLang === 'pt' ? 'Líder de Prática & Consultor Sênior' : 'Líder de Práctica & Consultor Senior',
    email: 'drodrigues@consultora-tech.cl',
    phone: '+56 9 4924 9816',
    location: activeCompany.city || 'Santiago de Chile'
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
    return new Intl.NumberFormat(currentLang === 'en' ? 'en-US' : currentLang === 'pt' ? 'pt-BR' : 'es-CL', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  };

  const formatClpNumber = (val: number) => {
    return new Intl.NumberFormat(currentLang === 'en' ? 'en-US' : currentLang === 'pt' ? 'pt-BR' : 'es-CL', {
      maximumFractionDigits: 0
    }).format(val);
  };

  const formatPresentationDateLocale = (dateInput: string | Date, includeYear: boolean = true) => {
    try {
      const d = typeof dateInput === 'string' ? parseDate(dateInput) : dateInput;
      const monthsEs = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthsPt = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const months = currentLang === 'en' ? monthsEn : currentLang === 'pt' ? monthsPt : monthsEs;
      
      if (currentLang === 'en') {
        return `${months[d.getMonth()]} ${d.getDate()}${includeYear ? `, ${d.getFullYear()}` : ''}`;
      }
      return `${d.getDate()} ${months[d.getMonth()]}${includeYear ? ` ${d.getFullYear()}` : ''}`;
    } catch {
      return String(dateInput);
    }
  };

  const formatEstimatedWeek = (week: string) => {
    if (!week) return '';
    if (currentLang === 'en') {
      return week.replace(/Día hábil/i, 'Working Day').replace(/Sem\./i, 'Wk.');
    }
    if (currentLang === 'pt') {
      return week.replace(/Día hábil/i, 'Dia útil').replace(/Sem\./i, 'Sem.');
    }
    return week;
  };

  const pageBaseClass = isPrintStaging
    ? 'dossier-page w-[1060px] h-[1499px] p-12 relative flex flex-col justify-between overflow-hidden shrink-0'
    : 'dossier-page w-full max-w-5xl aspect-[1/1.414] mx-auto p-6 sm:p-10 md:p-12 relative flex flex-col justify-between overflow-hidden shadow-2xl rounded-2xl print:rounded-none print:shadow-none print:m-0 print:p-8';

  const interiorPageClass = `${pageBaseClass} bg-white text-slate-900 border border-slate-200 pl-16 sm:pl-20`;
  const coverPageClass = `${pageBaseClass} dossier-page-cover bg-slate-950 text-white`;
  const backCoverPageClass = `${pageBaseClass} dossier-page-backcover bg-slate-950 text-white`;

  // Localized Modality String
  const getLocalizedModality = (modality: string) => {
    if (modality === 'Remoto') return t.page5.modalityRemote;
    if (modality === 'Híbrido') return t.page5.modalityHybrid;
    if (modality === 'Presencial') return t.page5.modalityOnsite;
    return modality;
  };

  // Localized Risk Owner
  const getLocalizedOwner = (owner: string) => {
    if (owner === 'Cliente') return t.page4.ownerClient;
    if (owner === 'Consultora') return t.page4.ownerConsultant;
    if (owner === 'Ambos') return t.page4.ownerBoth;
    return owner;
  };

  // Milestones List (localized fallback if standard)
  const milestonesList = quote.milestones && quote.milestones.length > 0 ? quote.milestones : [
    {
      id: 'm1',
      title: t.page6.milestone1Title,
      description: t.page6.milestone1Desc,
      deliverables: currentLang === 'en' ? 'Workspace active, repository & signed kickoff record.' : currentLang === 'pt' ? 'Ambiente ativo, repositório e termo de início assinado.' : 'Entorno de trabajo levantado, repositorio y acta de inicio firmada.',
      estimatedWeek: currentLang === 'en' ? 'Day 1' : currentLang === 'pt' ? 'Dia útil 1' : 'Día hábil 1',
      paymentPercentage: 40
    },
    {
      id: 'm2',
      title: t.page6.milestone2Title,
      description: t.page6.milestone2Desc,
      deliverables: currentLang === 'en' ? 'QA environment ready for preliminary testing.' : currentLang === 'pt' ? 'Ambiente de QA disponível para homologação.' : 'Ambiente QA disponible para pruebas preliminares.',
      estimatedWeek: currentLang === 'en' ? 'Wk. 3' : currentLang === 'pt' ? 'Sem. 3' : 'Sem. 3',
      paymentPercentage: 30
    },
    {
      id: 'm3',
      title: t.page6.milestone4Title,
      description: t.page6.milestone4Desc.replace('{days}', String(quote.guaranteeHypercareDays)),
      deliverables: currentLang === 'en' ? 'Go-live release, user handbook and formal acceptance certificate.' : currentLang === 'pt' ? 'Entrada em produção, manual de usuário e termo formal de entrega.' : 'Puesta en marcha, manual de usuario y acta de entrega formal.',
      estimatedWeek: currentLang === 'en' ? 'Wk. 4' : currentLang === 'pt' ? 'Sem. 4' : 'Sem. 4',
      paymentPercentage: 30
    }
  ];

  const pageLabel = currentLang === 'en' ? 'Page' : 'Página';

  return (
    <div className="space-y-8 print:space-y-0 select-text">
      
      {/* ------------------------------------------------------------- */}
      {/* PÁGINA 1: PORTADA CINEMÁTICA CON ENCABEZADO SIMÉTRICO         */}
      {/* ------------------------------------------------------------- */}
      <div 
        id="dossier-page-1"
        data-theme="dark"
        className={coverPageClass}
      >
        <div 
          className="absolute inset-0 bg-cover bg-center pointer-events-none transition-all duration-300"
          style={{ 
            backgroundImage: `url('${selectedCoverImage}')`,
            filter: activePalette.imageFilter,
            opacity: activePalette.isDark ? 0.35 : 0.42
          }}
        />
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-300" 
          style={{ background: activePalette.imageOverlay }} 
        />

        {/* Top Brand Bar - Symmetrical Executive Alliance Header */}
        <div className="relative z-10 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-slate-950/80 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
          {/* Left: Consultant Brand & Logo */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {activeCompany.logoUrl ? (
              <div className="h-12 sm:h-13 w-24 sm:w-28 p-1.5 rounded-xl bg-white shadow-sm border border-white/20 flex items-center justify-center overflow-hidden shrink-0">
                <img
                  src={activeCompany.logoUrl}
                  alt={activeCompany.name}
                  className="max-h-full max-w-full object-contain"
                  crossOrigin="anonymous"
                />
              </div>
            ) : (
              <div 
                className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-lg text-white tracking-wider shadow-lg shrink-0"
                style={{ backgroundColor: activePalette.colors.primary }}
              >
                ⚡
              </div>
            )}
            <div className="space-y-0.5 text-left min-w-0 overflow-hidden">
              <span className="text-[9px] font-mono font-bold tracking-widest uppercase inline-flex items-center gap-1.5 truncate max-w-full" style={{ color: activePalette.colors.accent }}>
                <span className="w-1.5 h-1.5 rounded-full shrink-0 inline-block" style={{ backgroundColor: activePalette.colors.accent }} />
                {t.topBar.issuerTag}
              </span>
              <span className="text-base sm:text-lg font-black tracking-tight text-white block leading-tight truncate">
                {activeCompany.name || 'SAP & TECH CONSULTING'}
              </span>
              <span className="text-[10px] tracking-wider text-slate-300 uppercase font-mono block truncate">
                {activeCompany.subheading || 'Enterprise Solutions Group'}
              </span>
              <span className="text-[9px] text-slate-400 font-mono block truncate">
                {activeCompany.legalName} · {currentLang === 'en' ? 'Tax ID' : currentLang === 'pt' ? 'CNPJ' : 'RUT'}: {activeCompany.taxId}
              </span>
            </div>
          </div>

          {/* Center Bridge: Strategic Alliance */}
          <div className="flex flex-col items-center justify-center px-2 sm:px-4 border-x border-white/10 shrink-0 self-stretch my-1">
            <div className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5 text-[9px] sm:text-[10px] font-mono text-slate-300 font-semibold uppercase tracking-wider whitespace-nowrap">
              <Handshake className="w-3.5 h-3.5 shrink-0" style={{ color: activePalette.colors.accent }} />
              <span>{t.topBar.strategicAlliance}</span>
            </div>
            <span className="text-[9px] font-mono text-slate-400 mt-1 whitespace-nowrap">
              {t.topBar.technicalProposal} v{quote.version}
            </span>
          </div>

          {/* Right: Client Brand & Logo */}
          <div className="flex items-center justify-end gap-2.5 sm:gap-3 min-w-0 text-right">
            <div className="space-y-0.5 text-right min-w-0 overflow-hidden">
              <span className="text-[9px] font-mono font-bold tracking-widest uppercase inline-flex items-center justify-end gap-1.5 truncate max-w-full" style={{ color: activePalette.colors.success }}>
                <span className="w-1.5 h-1.5 rounded-full shrink-0 inline-block" style={{ backgroundColor: activePalette.colors.success }} />
                {t.topBar.preparedFor}
              </span>
              <span className="text-base sm:text-lg font-black tracking-tight text-white block leading-tight truncate">
                {clientDisplayName}
              </span>
              {quote.client.companyName && quote.client.companyName !== clientDisplayName ? (
                <span className="text-[10px] text-slate-300 font-medium block truncate">
                  {quote.client.companyName}
                </span>
              ) : null}
              <span className="text-[9px] text-slate-400 font-mono block truncate">
                {currentLang === 'en' ? 'Tax ID' : currentLang === 'pt' ? 'CNPJ' : 'RUT'}: {quote.client.taxId} · {quote.client.industry || t.topBar.corporateClient}
              </span>
            </div>

            <div className="h-12 sm:h-13 w-24 sm:w-28 p-1.5 rounded-xl bg-white shadow-sm border border-white/20 flex items-center justify-center overflow-hidden shrink-0">
              <img
                src={clientLogoUrl}
                alt={clientDisplayName}
                className="max-h-full max-w-full object-contain"
                crossOrigin="anonymous"
              />
            </div>
          </div>
        </div>

        {/* Middle: Title & Project Hook */}
        <div className="relative z-10 max-w-3xl space-y-5 my-auto py-10">
          <div 
            className="inline-flex items-center gap-2 px-3 py-1 rounded-md border font-mono text-xs font-bold tracking-widest uppercase"
            style={{
              backgroundColor: activePalette.colors.badgeBg,
              borderColor: activePalette.colors.badgeBorder,
              color: activePalette.colors.badgeText
            }}
          >
            <span>{t.cover.commercialQuotation}</span>
            <span>•</span>
            <span>v{quote.version}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            {quote.project.projectTitle}
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-normal max-w-2xl">
            {quote.project.businessObjective || quote.project.scopeDescription || (
              currentLang === 'en'
                ? 'Technical and commercial proposal for expert consulting, software architecture implementation, and systems integration.'
                : currentLang === 'pt'
                ? 'Proposta técnico-comercial de consultoria especializada, implementação de arquitetura de software e integração de sistemas.'
                : 'Propuesta técnico-comercial de consultoría experta, implementación de arquitectura de software e integración de sistemas.'
            )}
          </p>

          {/* Floating Investment Card (Styled with active palette) */}
          <div 
            className="mt-8 inline-block text-white rounded-2xl p-6 sm:p-7 shadow-2xl max-w-md w-full border"
            style={{
              backgroundColor: activePalette.colors.primary,
              borderColor: activePalette.colors.border,
              boxShadow: `0 20px 30px -10px ${activePalette.colors.primary}50`
            }}
          >
            <span className="text-[11px] font-mono uppercase tracking-widest font-extrabold block mb-1" style={{ color: activePalette.colors.accent }}>
              {t.cover.investmentFixedPrice}
            </span>
            
            <div className="text-2xl sm:text-3xl font-black tracking-tight">
              {formatUfNumber(totalInUf)} UF{' '}
              <span className="font-bold text-xl sm:text-2xl opacity-90">
                (${formatClpNumber(totalInClp)})
              </span>
            </div>

            <div className="mt-2 text-xs opacity-90 font-medium">
              UF ${formatClpNumber(ufRate)} · {quote.taxRatePercentage > 0 ? `${t.cover.includesVat} (${quote.taxRatePercentage}%)` : t.cover.netVatExcluded}
            </div>

            <div className="mt-3 pt-3 border-t border-white/20 text-[11px] opacity-80">
              {t.cover.hypercareIncluded.replace('{days}', String(quote.guaranteeHypercareDays))}
            </div>
          </div>
        </div>

        {/* Bottom: Proposal Metadata Footer */}
        <div className="relative z-10 pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-400 font-mono">
          <div className="space-y-1">
            <p className="text-white font-bold text-sm">{t.cover.quoteNum} {quote.code} · v{quote.version}</p>
            <p>{t.cover.issuedOn} {quote.createdAt}</p>
            <p>{t.cover.validity.replace('{days}', String(activeValidityDays)).replace('{months}', String(quote.project.durationMonths)).replace('{weeks}', String(quote.project.durationMonths * 4))}</p>
          </div>

          <div className="space-y-1 sm:text-right">
            <p className="text-slate-300 font-bold">{t.cover.preparedForLabel}</p>
            <p className="text-white font-semibold">{quote.client.companyName}</p>
            <p className="text-[11px] text-slate-500">
              {t.cover.confidentialityNotice.replace('{months}', String(activeConfidentialityMonths))}
            </p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* PÁGINA 2: INTRODUCCIÓN Y ENFOQUE "HOY VS QUEDA CONSTRUIDO" */}
      {/* ------------------------------------------------------------- */}
      <div 
        id="dossier-page-2"
        data-theme="light"
        className={interiorPageClass}
      >
        {/* Margen Lateral Izquierdo (Barcode + Vertical Text) */}
        <div className="absolute left-0 top-0 bottom-0 w-10 sm:w-12 border-r border-slate-200 bg-slate-50 flex flex-col items-center justify-between py-6">
          <div className="w-6 h-6 border border-slate-300 bg-white flex items-center justify-center rounded text-[9px] font-mono font-bold text-slate-700">
            QR
          </div>
          
          <div className="[writing-mode:vertical-rl] rotate-180 text-[9px] font-mono text-slate-400 tracking-wider whitespace-nowrap">
            {t.cover.commercialQuotation} {quote.code} v{quote.version} · {t.cover.confidentialityNotice.replace('{months}', String(activeConfidentialityMonths))}
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
              {t.page2.tag}
            </span>
            <span className="text-xs font-mono font-bold text-slate-400">
              {quote.code}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 mb-3">
            {t.page2.title}
          </h2>

          <p className="text-sm text-slate-700 leading-relaxed mb-6 max-w-3xl">
            {t.page2.clientQuoteContext.replace('{client}', quote.client.companyName).replace('{methodology}', quote.project.methodology)}. {t.page2.subtitle}
          </p>

          {/* Contraste Clave: "Hoy" vs "Queda Construido" */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            <div className="border border-red-200 bg-red-50/50 rounded-xl p-5">
              <span className="text-xs font-bold uppercase tracking-wider text-red-900 block mb-2 font-mono">
                {t.page2.currentSituation}
              </span>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {currentHoy}
              </p>
            </div>

            <div 
              className="rounded-xl p-5 border"
              style={{
                borderColor: activePalette.colors.success,
                backgroundColor: activePalette.colors.highlightBoxBg
              }}
            >
              <span className="text-xs font-bold uppercase tracking-wider block mb-2 font-mono" style={{ color: activePalette.colors.success }}>
                {t.page2.targetSolution}
              </span>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {currentQuedaConstruido}
              </p>
            </div>
          </div>

          {/* Ficha Técnica Rápida */}
          <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/70 mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-3 font-mono">
              {t.page3.committedScope}
            </span>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
                <span className="font-bold text-slate-900 block">{t.page3.environmentAndVersion}</span>
                <p className="text-slate-600 mt-1">{quote.project.sapSystemVersion} · {quote.project.methodology}</p>
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
                <span className="font-bold text-slate-900 block">{t.page5.title}</span>
                <p className="text-slate-600 mt-1">{totals.totalHours} {t.page5.totalEffort.replace('{totalHours}', String(totals.totalHours))}</p>
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
                <span className="font-bold text-slate-900 block">{t.page6.termGuarantee}</span>
                <p className="text-slate-600 mt-1">{t.cover.hypercareIncluded.replace('{days}', String(quote.guaranteeHypercareDays))}</p>
              </div>
            </div>
          </div>

          {/* Recuadro de Precio Cerrado y Plazo */}
          <div 
            className="border-l-4 p-4 rounded-r-xl text-xs text-slate-800 space-y-1"
            style={{
              borderLeftColor: activePalette.colors.primary,
              backgroundColor: activePalette.colors.highlightBoxBg
            }}
          >
            <p>
              <strong className="text-slate-950">{t.cover.investmentFixedPrice}:</strong> {formatUfNumber(totalInUf)} UF (${formatClpNumber(totalInClp)} CLP). {t.page3.durationLabel} {quote.project.durationMonths} {t.page3.months} ({quote.project.durationMonths * 4} {t.page7.weeks}).
            </p>
            <p className="text-slate-600 text-[11px]">
              * {t.page6.termExpensesIncluded}
            </p>
          </div>
        </div>

        {/* Número de página */}
        <div className="text-right text-xs font-mono text-slate-400 pt-4 border-t border-slate-100">
          {pageLabel} 2
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* PÁGINA 3: DESGLOSE ECONÓMICO Y STAFFING                       */}
      {/* ------------------------------------------------------------- */}
      <div 
        id="dossier-page-3"
        data-theme="light"
        className={interiorPageClass}
      >
        {/* Margen Lateral Izquierdo */}
        <div className="absolute left-0 top-0 bottom-0 w-10 sm:w-12 border-r border-slate-200 bg-slate-50 flex flex-col items-center justify-between py-6">
          <div className="w-6 h-6 border border-slate-300 bg-white flex items-center justify-center rounded text-[9px] font-mono font-bold text-slate-700">QR</div>
          <div className="[writing-mode:vertical-rl] rotate-180 text-[9px] font-mono text-slate-400 tracking-wider whitespace-nowrap">
            {t.cover.commercialQuotation} {quote.code} v{quote.version} · {t.cover.confidentialityNotice.replace('{months}', String(activeConfidentialityMonths))}
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
              {t.page5.tag}
            </span>
            <span className="text-xs font-mono font-bold text-slate-400">
              {quote.code}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 leading-tight">
                {t.page5.title}
              </h2>
              <p className="text-xs text-slate-600 mt-1 font-medium leading-normal">
                {t.cover.investmentFixedPrice}: {formatUfNumber(totalInUf)} UF (${formatClpNumber(totalInClp)} CLP).
              </p>
            </div>

            <div 
              className="border px-4 py-2.5 rounded-xl text-right shadow-xs shrink-0"
              style={{
                backgroundColor: activePalette.colors.highlightBoxBg,
                borderColor: activePalette.colors.highlightBoxBorder
              }}
            >
              <span className="text-[10px] uppercase font-bold block" style={{ color: activePalette.colors.textSecondary }}>{t.page6.totalAmount}</span>
              <span className="text-lg font-black font-mono" style={{ color: activePalette.colors.primary }}>
                {formatUfNumber(totalInUf)} UF
              </span>
            </div>
          </div>

          {/* Tabla de Recursos Consultores */}
          {quote.resources && quote.resources.length > 0 && (
            <div className="border border-slate-200 rounded-xl overflow-hidden mb-6 shadow-xs">
              <div 
                className="px-4 py-2.5 border-b flex justify-between items-center text-xs font-bold"
                style={{
                  backgroundColor: activePalette.colors.tableHeaderBg,
                  borderColor: activePalette.colors.border,
                  color: activePalette.colors.textPrimary
                }}
              >
                <span>{t.page5.title.toUpperCase()}</span>
                <span>{t.page5.totalDedicatedHours} {totals.totalHours} hrs</span>
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="p-3">{t.page5.tableColModule}</th>
                    <th className="p-3">{t.page5.tableColRole}</th>
                    <th className="p-3">{t.page5.tableColSeniority}</th>
                    <th className="p-3">{t.page5.tableColModality}</th>
                    <th className="p-3 text-right">{t.page5.tableColHours}</th>
                    <th className="p-3 text-right">{t.page5.tableColRate}</th>
                    <th className="p-3 text-right">{t.page5.tableColSubtotal}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {quote.resources.map((res, i) => (
                    <tr key={res.id || i} className="hover:bg-slate-50/60">
                      <td className="p-3 font-semibold text-slate-900">
                        <span>{res.moduleName}</span>
                      </td>
                      <td className="p-3 font-medium text-slate-800">{res.roleTitle}</td>
                      <td className="p-3 text-slate-600">{res.seniority}</td>
                      <td className="p-3 text-slate-600">{getLocalizedModality(res.modality)}</td>
                      <td className="p-3 text-right font-bold text-slate-900">{res.hours} hrs</td>
                      <td className="p-3 text-right font-mono text-slate-700">
                        {formatCurrency(res.hourlyRate, quote.currency, quote.currencySymbol)}
                      </td>
                      <td className="p-3 text-right font-mono font-bold" style={{ color: activePalette.colors.primary }}>
                        {formatCurrency(res.subtotal || (res.hours * res.hourlyRate), quote.currency, quote.currencySymbol)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Resumen Totalizador */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs shadow-xs">
            <div className="space-y-1 text-slate-600">
              <p><strong className="text-slate-900">{t.page6.termCurrency}</strong> {quote.currency} ({quote.currencySymbol})</p>
              <p><strong className="text-slate-900">{currentLang === 'en' ? 'Tax Status:' : currentLang === 'pt' ? 'Tributação:' : 'Condición impositiva:'}</strong> {quote.taxRatePercentage > 0 ? `${t.cover.includesVat} (${quote.taxRatePercentage}%)` : t.cover.netVatExcluded}</p>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500 block">{t.page6.totalAmount}:</span>
              <span className="text-xl font-black text-slate-950 font-mono block">
                {formatCurrency(totals.totalAmount, quote.currency, quote.currencySymbol)}
              </span>
              <span className="text-[11px] font-mono text-blue-800">
                ≈ ${formatClpNumber(totalInClp)} CLP
              </span>
            </div>
          </div>
        </div>

        <div className="text-right text-xs font-mono text-slate-400 pt-4 border-t border-slate-100">
          {pageLabel} 3
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* PÁGINA 4: METODOLOGÍA, PLAZOS Y CONDICIONES DE INICIO          */}
      {/* ------------------------------------------------------------- */}
      <div 
        id="dossier-page-4"
        data-theme="light"
        className={interiorPageClass}
      >
        {/* Margen Lateral Izquierdo */}
        <div className="absolute left-0 top-0 bottom-0 w-10 sm:w-12 border-r border-slate-200 bg-slate-50 flex flex-col items-center justify-between py-6">
          <div className="w-6 h-6 border border-slate-300 bg-white flex items-center justify-center rounded text-[9px] font-mono font-bold text-slate-700">QR</div>
          <div className="[writing-mode:vertical-rl] rotate-180 text-[9px] font-mono text-slate-400 tracking-wider whitespace-nowrap">
            {t.cover.commercialQuotation} {quote.code} v{quote.version} · {t.cover.confidentialityNotice.replace('{months}', String(activeConfidentialityMonths))}
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
              {t.page6.tag}
            </span>
            <span className="text-xs font-mono font-bold text-slate-400">
              {quote.code}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 mb-2">
            {t.page6.title}
          </h2>
          <p className="text-xs text-slate-600 mb-6">
            {t.page6.subtitle}
          </p>

          {/* 4 Steps timeline cards (Bridev style) */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6 text-xs">
            <div className="border border-blue-200 bg-blue-50/50 rounded-xl p-3.5 shadow-xs">
              <span className="text-xs font-mono font-bold text-blue-800 block mb-1">{t.page6.milestone1Title}</span>
              <p className="font-semibold text-slate-900">{t.page6.milestone1Timing}</p>
              <p className="text-[11px] text-slate-600 mt-1">
                {t.page6.milestone1Desc}
              </p>
            </div>

            <div className="border border-slate-200 bg-slate-50 rounded-xl p-3.5 shadow-xs">
              <span className="text-xs font-mono font-bold text-slate-700 block mb-1">{t.page6.milestone2Title}</span>
              <p className="font-semibold text-slate-900">{t.page6.milestone2Timing}</p>
              <p className="text-[11px] text-slate-600 mt-1">
                {t.page6.milestone2Desc}
              </p>
            </div>

            <div className="border border-slate-200 bg-slate-50 rounded-xl p-3.5 shadow-xs">
              <span className="text-xs font-mono font-bold text-slate-700 block mb-1">{t.page6.milestone3Title}</span>
              <p className="font-semibold text-slate-900">{t.page6.milestone3Timing}</p>
              <p className="text-[11px] text-slate-600 mt-1">
                {t.page6.milestone3Desc}
              </p>
            </div>

            <div className="border border-slate-200 bg-slate-50 rounded-xl p-3.5 shadow-xs">
              <span className="text-xs font-mono font-bold text-slate-700 block mb-1">{t.page6.milestone4Title}</span>
              <p className="font-semibold text-slate-900">{t.page6.milestone4Timing}</p>
              <p className="text-[11px] text-slate-600 mt-1">
                {t.page6.milestone4Desc.replace('{days}', String(quote.guaranteeHypercareDays))}
              </p>
            </div>
          </div>

          {/* Tabla de Hitos y Facturación */}
          <div className="border border-slate-200 rounded-xl overflow-hidden mb-6 text-xs shadow-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">{t.page6.tableColMilestone}</th>
                  <th className="p-3">{currentLang === 'en' ? 'Tangible Deliverable' : currentLang === 'pt' ? 'Entregável Verificável' : 'Entregable Verificable'}</th>
                  <th className="p-3 whitespace-nowrap">{t.page6.tableColTiming}</th>
                  <th className="p-3 text-right whitespace-nowrap">{t.page6.tableColPercentage}</th>
                  <th className="p-3 text-right whitespace-nowrap">{t.page6.tableColAmount}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {milestonesList.map((m, i) => (
                  <tr key={m.id || i} className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-900">{m.title}</td>
                    <td className="p-3 text-slate-600">{m.deliverables || m.description}</td>
                    <td className="p-3 text-slate-600 font-mono text-[11px] whitespace-nowrap font-medium">
                      {formatEstimatedWeek(m.estimatedWeek)}
                    </td>
                    <td className="p-3 text-right font-bold text-slate-900 whitespace-nowrap">{m.paymentPercentage}%</td>
                    <td className="p-3 text-right font-mono font-bold text-blue-900 whitespace-nowrap">
                      {formatUfNumber(totalInUf * (m.paymentPercentage / 100))} UF
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Condición de Inicio Crucial ("Gatekeeper") */}
          <div className="border border-amber-300 bg-amber-50/70 rounded-xl p-5 text-xs text-slate-800 space-y-2 shadow-xs">
            <div className="flex items-center gap-2 text-amber-900 font-bold uppercase tracking-wider font-mono">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>{t.page4.gatekeeperTitle} ({t.page4.gatekeeperBadge})</span>
            </div>
            <p className="leading-relaxed whitespace-pre-line">
              {gatekeeperText}
            </p>
          </div>
        </div>

        <div className="text-right text-xs font-mono text-slate-400 pt-4 border-t border-slate-100">
          {pageLabel} 4
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* PÁGINA 5: PLANIFICACIÓN Y CRONOGRAMA EJECUTIVO (CARTA GANTT)  */}
      {/* ------------------------------------------------------------- */}
      <div 
        id="dossier-page-5"
        data-theme="light"
        className={interiorPageClass}
      >
        {/* Margen Lateral Izquierdo */}
        <div className="absolute left-0 top-0 bottom-0 w-10 sm:w-12 border-r border-slate-200 bg-slate-50 flex flex-col items-center justify-between py-6">
          <div className="w-6 h-6 border border-slate-300 bg-white flex items-center justify-center rounded text-[9px] font-mono font-bold text-slate-700">GANTT</div>
          <div className="[writing-mode:vertical-rl] rotate-180 text-[9px] font-mono text-slate-400 tracking-wider whitespace-nowrap">
            {t.page7.title} · {quote.code} v{quote.version}
          </div>
          <div className="flex flex-col gap-0.5 w-4 opacity-75">
            {[4, 2, 6, 3, 5, 2, 7, 4, 1, 5].map((h, i) => (
              <div key={i} className="bg-blue-800 w-full" style={{ height: `${h * 1.5}px` }} />
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {t.page7.tag}
            </span>
            <span className="text-xs font-mono font-bold text-slate-400">
              {quote.code}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 mb-2">
            {t.page7.title}
          </h2>
          <p className="text-xs text-slate-600 mb-6">
            {t.page7.subtitle}
          </p>

          {/* Render the Executive Gantt Chart */}
          <div className="mb-6 rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <GanttTimelineView
              plan={effectiveGanttPlan}
              isCompactForPdf={true}
            />
          </div>

          {/* Desglose de Fases y Parámetros del Cronograma */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 space-y-2">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                {t.page7.ganttSummaryTitle}
              </h4>
              <ul className="space-y-1.5 text-[11px] text-slate-700">
                <li className="flex justify-between border-b border-slate-200/60 pb-1">
                  <span className="text-slate-500">{currentLang === 'en' ? 'Estimated Kickoff:' : currentLang === 'pt' ? 'Início Estimado:' : 'Fecha de Inicio Estimada:'}</span>
                  <span className="font-bold text-slate-900 font-mono">{effectiveGanttPlan.settings.startDate}</span>
                </li>
                <li className="flex justify-between border-b border-slate-200/60 pb-1">
                  <span className="text-slate-500">{t.page7.ganttSummaryDuration}</span>
                  <span className="font-bold text-slate-900">
                    ~{quote.project.durationMonths} {t.page3.months} ({ganttComputed.computedStages.reduce((a, s) => a + (s.durationUnit === 'weeks' ? s.duration : s.duration / 5), 0).toFixed(1)} {t.page7.weeks})
                  </span>
                </li>
                <li className="flex justify-between border-b border-slate-200/60 pb-1">
                  <span className="text-slate-500">{t.page7.ganttSummaryPhases}</span>
                  <span className="font-bold text-slate-900">{effectiveGanttPlan.stages.length} {t.page7.stagesCount}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-500">{t.page7.ganttSummaryGoLive}</span>
                  <span className="font-bold text-blue-700">
                    {formatPresentationDateLocale(ganttFinalStage?.computedEndDate || effectiveGanttPlan.settings.startDate, true)}
                  </span>
                </li>
              </ul>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 space-y-2">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {t.page7.ganttSummaryCalendar}
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {t.page7.ganttSummaryCalendarDesc.replace('{days}', String(effectiveGanttPlan.settings.calendar.workingDaysPerWeek)).replace('{country}', ganttCountry?.name || 'Chile')}
              </p>
              <div className="pt-1 text-[10px] text-slate-500 italic">
                * {gatekeeperText}
              </div>
            </div>
          </div>
        </div>

        <div className="text-right text-xs font-mono text-slate-400 pt-4 border-t border-slate-100">
          {pageLabel} 5
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* PÁGINA 6: FUERA DE ALCANCE Y MATRIZ DE RIESGOS                */}
      {/* ------------------------------------------------------------- */}
      <div 
        id="dossier-page-6"
        data-theme="light"
        className={interiorPageClass}
      >
        {/* Margen Lateral Izquierdo */}
        <div className="absolute left-0 top-0 bottom-0 w-10 sm:w-12 border-r border-slate-200 bg-slate-50 flex flex-col items-center justify-between py-6">
          <div className="w-6 h-6 border border-slate-300 bg-white flex items-center justify-center rounded text-[9px] font-mono font-bold text-slate-700">QR</div>
          <div className="[writing-mode:vertical-rl] rotate-180 text-[9px] font-mono text-slate-400 tracking-wider whitespace-nowrap">
            {t.cover.commercialQuotation} {quote.code} v{quote.version} · {t.cover.confidentialityNotice.replace('{months}', String(activeConfidentialityMonths))}
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
              {t.page4.tag}
            </span>
            <span className="text-xs font-mono font-bold text-slate-400">
              {quote.code}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 mb-2">
            {t.page6.termOutOfScope}
          </h2>
          <p className="text-xs text-slate-600 mb-6">
            {currentLang === 'en'
              ? 'To maintain transparency and prevent scope creep, the following elements are explicitly excluded and require a separate change request:'
              : currentLang === 'pt'
              ? 'Para manter a transparência e prevenir desvios, os itens abaixo estão expressamente excluídos desta proposta e demandam ordem de mudança:'
              : 'Para evitar falsas expectativas o sobrecostos, lo listado a continuación se encuentra explícitamente excluido de la oferta:'}
          </p>

          {/* Categorías Fuera de Alcance Dinámicas (Estilo Bridev) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-xs">
            {activeOutOfScope.map((cat, idx) => (
              <div key={idx} className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 shadow-xs">
                <span className="font-bold text-slate-900 block mb-1.5">{cat.category}</span>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">{cat.description}</p>
              </div>
            ))}
          </div>

          {/* Matriz de Riesgos y Mitigación Dinámica */}
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 font-mono">
            {t.page4.riskMatrixTitle}
          </h3>

          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs mb-6 shadow-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3 w-1/4">{t.page4.tableRisk}</th>
                  <th className="p-3 w-1/3">{t.page4.tableImpact}</th>
                  <th className="p-3 w-1/3">{t.page4.tableMitigation}</th>
                  <th className="p-3 text-center">{t.page4.tableOwner}</th>
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
                        {getLocalizedOwner(risk.owner)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-right text-xs font-mono text-slate-400 pt-4 border-t border-slate-100">
          {pageLabel} 6
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* PÁGINA 7: PROPUESTA COMPLETA, RESUMEN LEGAL Y FIRMAS          */}
      {/* ------------------------------------------------------------- */}
      <div 
        id="dossier-page-7"
        data-theme="light"
        className={interiorPageClass}
      >
        {/* Margen Lateral Izquierdo */}
        <div className="absolute left-0 top-0 bottom-0 w-10 sm:w-12 border-r border-slate-200 bg-slate-50 flex flex-col items-center justify-between py-6">
          <div className="w-6 h-6 border border-slate-300 bg-white flex items-center justify-center rounded text-[9px] font-mono font-bold text-slate-700">QR</div>
          <div className="[writing-mode:vertical-rl] rotate-180 text-[9px] font-mono text-slate-400 tracking-wider whitespace-nowrap">
            {t.cover.commercialQuotation} {quote.code} v{quote.version} · {t.cover.confidentialityNotice.replace('{months}', String(activeConfidentialityMonths))}
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
              {t.page8.tag}
            </span>
            <span className="text-xs font-mono font-bold text-slate-400">
              {quote.code}
            </span>
          </div>

          <div className="flex items-start justify-between gap-6 mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
                {t.page8.title}
              </h2>
              <p className="text-xs text-slate-600 mt-1 max-w-xl">
                {t.page8.acceptDeclaration.replace('{client}', quote.client.companyName).replace('{code}', quote.code)}
              </p>
            </div>

            <div 
              className="text-white p-4 rounded-xl shadow-md text-right shrink-0"
              style={{ backgroundColor: activePalette.colors.primary }}
            >
              <span className="text-[10px] uppercase font-bold tracking-widest block opacity-85">{t.page6.totalAmount}</span>
              <span className="text-xl font-black font-mono block">
                {formatUfNumber(totalInUf)} UF
              </span>
              <span className="text-[11px] font-mono opacity-90">
                (${formatClpNumber(totalInClp)} CLP)
              </span>
            </div>
          </div>

          {/* Resumen de Aceptación */}
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs mb-8 shadow-xs">
            <div className="bg-slate-100 px-4 py-2 font-bold text-slate-800 uppercase tracking-wide border-b border-slate-200">
              {t.page8.clientAcceptance}
            </div>
            <div className="divide-y divide-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-4 p-2.5">
                <span className="font-bold text-slate-900 font-mono">{currentLang === 'en' ? '01 Scope' : currentLang === 'pt' ? '01 Objeto' : '01 Objeto'}</span>
                <span className="col-span-3 text-slate-700">{quote.project.projectTitle} · {quote.client.companyName}.</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 p-2.5 bg-slate-50/50">
                <span className="font-bold text-slate-900 font-mono">{currentLang === 'en' ? '02 Price' : currentLang === 'pt' ? '02 Preço' : '02 Precio'}</span>
                <span className="col-span-3 text-slate-700 font-mono font-semibold">
                  {formatUfNumber(totalInUf)} UF (${formatClpNumber(totalInClp)} CLP).
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 p-2.5">
                <span className="font-bold text-slate-900 font-mono">{currentLang === 'en' ? '03 Timeline' : currentLang === 'pt' ? '03 Prazo' : '03 Plazo'}</span>
                <span className="col-span-3 text-slate-700">{quote.project.durationMonths} {t.page3.months} ({quote.project.durationMonths * 4} {t.page7.weeks}).</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 p-2.5 bg-slate-50/50">
                <span className="font-bold text-slate-900 font-mono">{currentLang === 'en' ? '04 Payment' : currentLang === 'pt' ? '04 Pagamento' : '04 Pagos'}</span>
                <span className="col-span-3 text-slate-700 font-mono">
                  40% / 30% / 30%.
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 p-2.5">
                <span className="font-bold text-slate-900 font-mono">{currentLang === 'en' ? '05 Warranty' : currentLang === 'pt' ? '05 Garantia' : '05 Garantía'}</span>
                <span className="col-span-3 text-slate-700">{quote.guaranteeHypercareDays} {currentLang === 'en' ? 'days hypercare' : currentLang === 'pt' ? 'dias de hipercare' : 'días corridos de soporte'}.</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 p-2.5 bg-slate-50/50">
                <span className="font-bold text-slate-900 font-mono">{currentLang === 'en' ? '06 Non-Disclosure' : currentLang === 'pt' ? '06 Sigilo' : '06 Confidencialidad'}</span>
                <span className="col-span-3 text-slate-700">{activeConfidentialityMonths} {t.page3.months}.</span>
              </div>
            </div>
          </div>

          {/* Doble Bloque de Firma Legal con Logotipos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
            {/* Consultora */}
            <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/40 text-xs space-y-3 shadow-xs">
              <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {activeCompany.logoUrl ? (
                    <div className="h-6 w-auto max-w-[80px] flex items-center">
                      <img src={activeCompany.logoUrl} alt={activeCompany.name} className="max-h-full max-w-full object-contain" />
                    </div>
                  ) : (
                    <span className="w-5 h-5 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">⚡</span>
                  )}
                  <span className="font-bold text-slate-900 uppercase tracking-wide">
                    {currentLang === 'en' ? 'Issuing Firm' : currentLang === 'pt' ? 'Consultoria Emissora' : 'Consultora Emisora'}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  {currentLang === 'en' ? 'Tax ID' : currentLang === 'pt' ? 'CNPJ' : 'RUT'}: {activeCompany.taxId}
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
            <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/40 text-xs space-y-3 shadow-xs">
              <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-auto max-w-[80px] flex items-center">
                    <img src={clientLogoUrl} alt={clientDisplayName} className="max-h-full max-w-full object-contain" />
                  </div>
                  <span className="font-bold text-slate-900 uppercase tracking-wide">
                    {t.page8.legalRepSignature}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  {currentLang === 'en' ? 'Tax ID' : currentLang === 'pt' ? 'CNPJ' : 'RUT'}: {quote.client.taxId || 'N/A'}
                </span>
              </div>
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 w-24">{t.page8.fullName}</span>
                  <div className="border-b border-slate-300 flex-1 font-semibold text-slate-900">{activeClientSigner.name}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 w-24">{t.page8.idNumber}</span>
                  <div className="border-b border-slate-300 flex-1 font-semibold text-slate-900">{activeClientSigner.taxId || quote.client.taxId || '____________________'}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 w-24">{t.page8.roleTitle}</span>
                  <div className="border-b border-slate-300 flex-1 font-semibold text-slate-900">{activeClientSigner.role}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 w-24">{currentLang === 'en' ? 'Legal Entity:' : currentLang === 'pt' ? 'Razão Social:' : 'Razón Social:'}</span>
                  <div className="border-b border-slate-300 flex-1 text-slate-700 truncate">{quote.client.companyName}</div>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 pt-1 italic text-center">
                {currentLang === 'en' ? 'Accepted with full corporate authority.' : currentLang === 'pt' ? 'Aceito com plenos poderes corporativos.' : 'Leído y aceptado por el cliente con plenas facultades legales y tributarias.'}
              </p>
            </div>
          </div>
        </div>

        <div className="text-right text-xs font-mono text-slate-400 pt-4 border-t border-slate-100">
          {pageLabel} 7
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* PÁGINA 8: CONTRAPORTADA CINEMÁTICA DE CIERRE                  */}
      {/* ------------------------------------------------------------- */}
      <div 
        id="dossier-page-8"
        data-theme="dark"
        className={backCoverPageClass}
      >
        <div 
          className="absolute inset-0 bg-cover bg-center pointer-events-none transition-all duration-300"
          style={{ 
            backgroundImage: `url('${selectedCoverImage}')`,
            filter: activePalette.imageFilter,
            opacity: activePalette.isDark ? 0.28 : 0.35
          }}
        />
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-300" 
          style={{ background: activePalette.imageOverlay }}
        />

        <div className="relative z-10">
          <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
            {t.cover.commercialQuotation} · {currentLang === 'en' ? 'CLOSING' : currentLang === 'pt' ? 'ENCERRAMENTO' : 'CIERRE'}
          </span>
        </div>

        <div className="relative z-10 max-w-md mx-auto text-center space-y-6">
          {/* Corporate Alliance Logos on Backcover */}
          <div className="flex items-center justify-center gap-3">
            <div className="h-12 w-28 sm:w-32 p-1.5 rounded-xl bg-white shadow-sm border border-white/20 flex items-center justify-center overflow-hidden shrink-0">
              {activeCompany.logoUrl ? (
                <img src={activeCompany.logoUrl} alt={activeCompany.name} className="max-h-full max-w-full object-contain" crossOrigin="anonymous" />
              ) : (
                <span className="font-bold text-slate-800 text-lg">⚡</span>
              )}
            </div>
            <Handshake className="w-5 h-5 shrink-0" style={{ color: activePalette.colors.accent }} />
            <div className="h-12 w-28 sm:w-32 p-1.5 rounded-xl bg-white shadow-sm border border-white/20 flex items-center justify-center overflow-hidden shrink-0">
              <img src={clientLogoUrl} alt={clientDisplayName} className="max-h-full max-w-full object-contain" crossOrigin="anonymous" />
            </div>
          </div>

          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-slate-400 block mb-1">
              {t.page8.preparedBy}
            </span>
            <h3 className="text-2xl font-bold text-white">
              {activeLead.name}
            </h3>
            <p className="text-sm mt-0.5 font-medium" style={{ color: activePalette.colors.accent }}>
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
            {currentLang === 'en'
              ? `To accept this proposal, execute page 7. This offer remains valid for ${activeValidityDays} calendar days.`
              : currentLang === 'pt'
              ? `Para aceitar esta proposta, favor assinar a página 7. Esta oferta é válida por ${activeValidityDays} dias corridos.`
              : `Para aceptar esta propuesta, firmar la página 7. Esta oferta rige durante ${activeValidityDays} días corridos y no constituye contrato hasta su aceptación escrita.`}
          </div>
        </div>

        <div className="relative z-10 pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-400 font-mono">
          <div>
            <p className="text-white font-bold">{t.cover.quoteNum} {quote.code} · v{quote.version}</p>
            <p>{t.cover.validity.replace('{days}', String(activeValidityDays)).replace('{months}', String(quote.project.durationMonths)).replace('{weeks}', String(quote.project.durationMonths * 4))}</p>
          </div>
          <div className="sm:text-center">
            <p className="text-white font-bold">{t.topBar.corporateClient}: {quote.client.companyName}</p>
            <p>{currentLang === 'en' ? 'Confidential Document' : currentLang === 'pt' ? 'Documento Confidencial' : 'Documento confidencial'}</p>
          </div>
          <div className="sm:text-right">
            <p className="font-bold" style={{ color: activePalette.colors.accent }}>{formatUfNumber(totalInUf)} UF · {quote.project.projectType}</p>
            <p>{t.cover.confidentialityNotice.replace('{months}', String(activeConfidentialityMonths))}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
