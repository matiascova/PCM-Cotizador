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
  Loader2,
  Palette,
  Globe2,
  Sparkles
} from 'lucide-react';
import { Quotation, CompanyProfile, DossierColorPaletteId, DocumentLanguage } from '../types';
import { calculateQuotationTotals, formatCurrency, getStatusBadge } from '../utils/calculations';
import { downloadDossierPDF, downloadQuotationPDF } from '../utils/pdfGenerator';
import { getCachedBancoCentralData, convertUfToClp } from '../services/bcentralService';
import { getStoredCompanyProfile } from '../data/companyProfile';
import { DossierEditorialView } from './DossierEditorialView';
import { DOSSIER_COLOR_PALETTES, getDossierPalette } from '../utils/dossierPalettes';
import { getClientLogo } from '../data/defaultClientLogos';
import { 
  DEFAULT_RISK_ITEMS, 
  DEFAULT_OUT_OF_SCOPE_CATEGORIES, 
  DEFAULT_GATEKEEPER_CONDITION, 
  getDossierPresetsByProjectType 
} from '../data/dossierPresets';
import { getDossierTranslation } from '../utils/dossierTranslations';
import { localizeQuotation, translateQuotationDeep } from '../services/translationService';

interface QuotationPrintViewProps {
  quote: Quotation;
  onBack: () => void;
  companyProfile?: CompanyProfile;
}

export const QuotationPrintView: React.FC<QuotationPrintViewProps> = ({
  quote: initialQuote,
  onBack,
  companyProfile
}) => {
  const [viewMode, setViewMode] = useState<'dossier' | 'compact'>('dossier');
  const [selectedPalette, setSelectedPalette] = useState<DossierColorPaletteId>(
    initialQuote.colorPalette || 'enterprise-logistics'
  );
  const [selectedLanguage, setSelectedLanguage] = useState<DocumentLanguage>(
    initialQuote.documentLanguage || 'es'
  );
  const [currentQuote, setCurrentQuote] = useState<Quotation>(initialQuote);
  const [isTranslating, setIsTranslating] = useState(false);

  const activeCompany = companyProfile || getStoredCompanyProfile();
  const totals = calculateQuotationTotals(currentQuote);
  const statusBadge = getStatusBadge(currentQuote.status);
  const bcentral = getCachedBancoCentralData();
  const ufRate = bcentral.indicators.uf.value || 40879.04;
  const ufDate = bcentral.indicators.uf.date || '2026-09-04';

  const t = getDossierTranslation(selectedLanguage);

  // Dynamic Dossier Values (with presets fallback)
  const defaultPresets = getDossierPresetsByProjectType(currentQuote.project.projectType || 'Roll-out de Módulos');
  const currentHoy = currentQuote.currentSituationHoy || defaultPresets.hoy;
  const currentQuedaConstruido = currentQuote.builtSolutionQuedaConstruido || defaultPresets.quedaConstruido;
  const gatekeeperText = currentQuote.gatekeeperCondition || DEFAULT_GATEKEEPER_CONDITION;
  const activeRisks = currentQuote.riskItems && currentQuote.riskItems.length > 0 ? currentQuote.riskItems : DEFAULT_RISK_ITEMS;
  const activeOutOfScope = currentQuote.outOfScopeCategories && currentQuote.outOfScopeCategories.length > 0 ? currentQuote.outOfScopeCategories : DEFAULT_OUT_OF_SCOPE_CATEGORIES;
  const activeValidityDays = currentQuote.validityDays || 30;
  const activeConfidentialityMonths = currentQuote.confidentialityMonths || 6;
  const activeLead = currentQuote.commercialLead || {
    name: 'Diego Rodrigues',
    role: selectedLanguage === 'en' ? 'Practice Lead & Senior SAP Consultant' : selectedLanguage === 'pt' ? 'Líder de Prática & Consultor Sênior' : 'Líder de Práctica & Consultor Senior',
    email: 'drodrigues@consultora-tech.cl',
    phone: '+56 9 4924 9816',
    location: activeCompany.city || 'Santiago de Chile'
  };
  const activeClientSigner = currentQuote.clientSigner || {
    name: currentQuote.client.contactName,
    taxId: currentQuote.client.taxId || '____________________',
    role: currentQuote.client.contactRole,
    email: currentQuote.client.contactEmail
  };

  const coverImages: Record<string, string> = {
    alpine: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop',
    corporate: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop',
    datacenter: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2070&auto=format&fit=crop'
  };
  const selectedCoverImage = coverImages[currentQuote.coverTheme || 'alpine'] || coverImages.alpine;

  // Format currency helpers
  const totalInUf = currentQuote.currency === 'UF' 
    ? totals.totalAmount 
    : (currentQuote.currency === 'CLP' ? (totals.totalAmount / ufRate) : totals.totalAmount);

  const totalInClp = currentQuote.currency === 'CLP' 
    ? totals.totalAmount 
    : (currentQuote.currency === 'UF' ? convertUfToClp(totals.totalAmount) : (totals.totalAmount * 930));

  const formatUfNumber = (val: number) => {
    return new Intl.NumberFormat(selectedLanguage === 'en' ? 'en-US' : selectedLanguage === 'pt' ? 'pt-BR' : 'es-CL', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  };

  const formatClpNumber = (val: number) => {
    return new Intl.NumberFormat(selectedLanguage === 'en' ? 'en-US' : selectedLanguage === 'pt' ? 'pt-BR' : 'es-CL', {
      maximumFractionDigits: 0
    }).format(val);
  };

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<string>('');

  const handleLanguageChange = async (newLang: DocumentLanguage) => {
    if (newLang === selectedLanguage) return;
    setSelectedLanguage(newLang);

    // Instant local transformation (synchronous)
    const localized = localizeQuotation(currentQuote, newLang);
    setCurrentQuote(localized);
  };

  const handleDeepAiTranslate = async () => {
    try {
      setIsTranslating(true);
      const deepTranslated = await translateQuotationDeep(currentQuote, selectedLanguage);
      setCurrentQuote(deepTranslated);
    } catch (err) {
      console.warn('Deep translation notice:', err);
    } finally {
      setIsTranslating(false);
    }
  };

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
      setDownloadProgress(selectedLanguage === 'en' ? 'Preparing pages...' : selectedLanguage === 'pt' ? 'Preparando páginas...' : 'Preparando páginas...');
      
      // Ensure dossier view is active for capture
      if (viewMode !== 'dossier') {
        setViewMode('dossier');
        await new Promise((r) => setTimeout(r, 200));
      }

      const quoteWithPaletteAndLang: Quotation = {
        ...currentQuote,
        colorPalette: selectedPalette,
        documentLanguage: selectedLanguage
      };

      await downloadDossierPDF(
        quoteWithPaletteAndLang, 
        activeCompany, 
        (statusText) => setDownloadProgress(statusText),
        selectedLanguage
      );
    } catch (err) {
      console.error('Error generating Dossier PDF:', err);
    } finally {
      setIsDownloading(false);
      setDownloadProgress('');
    }
  };

  const quoteForView: Quotation = {
    ...currentQuote,
    colorPalette: selectedPalette,
    documentLanguage: selectedLanguage
  };

  return (
    <div className="bg-slate-900/95 min-h-screen py-6 px-2 sm:px-4 md:px-6 print:bg-white print:p-0">
      
      {/* Top Action Bar (hidden in print mode) */}
      <div className="max-w-5xl mx-auto mb-6 flex flex-col gap-3 print:hidden bg-slate-800/90 backdrop-blur-md p-4 rounded-xl border border-slate-700 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
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
                  <span>Descargar PDF ({selectedLanguage.toUpperCase()})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Row 2: Multi-Language Selector Bar (Español / English / Português) */}
        <div className="pt-3 border-t border-slate-700/70 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <Globe2 className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-200">Idioma del Documento / Translation:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'es', label: 'Español', flag: '🇪🇸', note: 'Propuesta original' },
              { id: 'en', label: 'English', flag: '🇺🇸', note: 'Global & USA' },
              { id: 'pt', label: 'Português', flag: '🇧🇷', note: 'Brasil & LATAM' }
            ].map((lang) => {
              const isSelected = selectedLanguage === lang.id;
              return (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => handleLanguageChange(lang.id as DocumentLanguage)}
                  className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600/30 border-emerald-400 text-white shadow-xs ring-1 ring-emerald-400/50'
                      : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-sm leading-none">{lang.flag}</span>
                  <span className="font-bold text-[12px] whitespace-nowrap">{lang.label}</span>
                  {isSelected && <Check className="w-3 h-3 text-emerald-400" />}
                </button>
              );
            })}

            {/* Optional AI Deep Translate Button for custom texts */}
            {selectedLanguage !== 'es' && (
              <button
                type="button"
                onClick={handleDeepAiTranslate}
                disabled={isTranslating}
                title="Traduce automáticamente los textos personalizados del cliente con la IA de Gemini"
                className="px-2.5 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-400/60 text-indigo-200 hover:text-white font-medium text-[11px] flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                {isTranslating ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
                    <span>Traduciendo con IA...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    <span>Traducir textos con IA</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Row 3: Quick Palette Selector for Dossier Preview & PDF */}
        {viewMode === 'dossier' && (
          <div className="pt-3 border-t border-slate-700/70 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300 font-medium">
              <Palette className="w-4 h-4 text-blue-400" />
              <span>Paleta de Color & Filtro de Imagen para el Dossier:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {Object.values(DOSSIER_COLOR_PALETTES).map((pal) => {
                const isSelected = selectedPalette === pal.id;
                return (
                  <button
                    key={pal.id}
                    type="button"
                    onClick={() => setSelectedPalette(pal.id)}
                    className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-700 border-blue-400 text-white shadow-xs ring-1 ring-blue-400/50'
                        : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <span 
                      className="w-3.5 h-3.5 rounded-full border border-white/30 shrink-0" 
                      style={{ background: pal.previewGradient }} 
                    />
                    <span className="font-semibold text-[11px] whitespace-nowrap">{pal.name}</span>
                    {isSelected && <Check className="w-3 h-3 text-blue-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODO 1: DOSSIER EDITORIAL COMPLETO (ESTILO BRIDEV)                       */}
      {/* ========================================================================= */}
      {viewMode === 'dossier' && (
        <DossierEditorialView
          quote={quoteForView}
          companyProfile={activeCompany}
          language={selectedLanguage}
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
                  {activeCompany.legalName} · {selectedLanguage === 'en' ? 'Tax ID' : selectedLanguage === 'pt' ? 'CNPJ' : 'RUT'}: {activeCompany.taxId} · {activeCompany.city || 'Chile'}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="inline-block text-xs font-bold px-2.5 py-1 rounded-full border mb-1 bg-blue-50 text-blue-800 border-blue-200 font-mono">
                  {currentQuote.code} (v{currentQuote.version})
                </span>
                <div className="text-xs text-slate-600 space-y-0.5">
                  <p>{selectedLanguage === 'en' ? 'Issue Date:' : selectedLanguage === 'pt' ? 'Data de Emissão:' : 'Fecha Emisión:'} <span className="font-semibold text-slate-800">{currentQuote.createdAt}</span></p>
                  <p>{selectedLanguage === 'en' ? 'Valid Until:' : selectedLanguage === 'pt' ? 'Validade:' : 'Válido hasta:'} <span className="font-semibold text-slate-800">{currentQuote.validUntil}</span></p>
                  <p>{selectedLanguage === 'en' ? 'Currency:' : selectedLanguage === 'pt' ? 'Moeda:' : 'Moneda:'} <span className="font-semibold text-slate-800">{currentQuote.currency}</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Client & Offer Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-7 text-xs">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                <h3 className="font-bold text-slate-900 uppercase tracking-wider">
                  {selectedLanguage === 'en' ? 'Client Information' : selectedLanguage === 'pt' ? 'Informações do Cliente' : 'Información del Cliente'}
                </h3>
                <div className="h-6 w-auto max-w-[80px] flex items-center justify-center overflow-hidden">
                  <img 
                    src={getClientLogo(currentQuote.client)} 
                    alt={currentQuote.client.fantasyName || currentQuote.client.companyName} 
                    className="max-h-full max-w-full object-contain" 
                  />
                </div>
              </div>
              <p className="font-bold text-slate-900 text-sm">
                {currentQuote.client.fantasyName || currentQuote.client.companyName}
              </p>
              {currentQuote.client.fantasyName && currentQuote.client.companyName !== currentQuote.client.fantasyName && (
                <p className="text-[11px] text-slate-500 font-medium">{selectedLanguage === 'en' ? 'Corporate Name:' : selectedLanguage === 'pt' ? 'Razão Social:' : 'Razón Social:'} {currentQuote.client.companyName}</p>
              )}
              <p className="text-slate-600">{selectedLanguage === 'en' ? 'Tax ID:' : selectedLanguage === 'pt' ? 'CNPJ:' : 'RUT / Tax ID:'} <span className="font-mono font-bold text-slate-800">{currentQuote.client.taxId || 'N/A'}</span></p>
              {currentQuote.client.businessActivity && (
                <p className="text-slate-600 text-[11px] line-clamp-1">{selectedLanguage === 'en' ? 'Industry Activity:' : selectedLanguage === 'pt' ? 'Atividade:' : 'Giro:'} {currentQuote.client.businessActivity}</p>
              )}
              {currentQuote.client.comuna && (
                <p className="text-slate-600 text-[11px]">{selectedLanguage === 'en' ? 'Location:' : selectedLanguage === 'pt' ? 'Localização:' : 'Comuna / Ciudad:'} {currentQuote.client.comuna}, {currentQuote.client.city || currentQuote.client.country}</p>
              )}
              <p className="text-slate-600">{selectedLanguage === 'en' ? 'Contact:' : selectedLanguage === 'pt' ? 'Contato:' : 'Contacto:'} {currentQuote.client.contactName} ({currentQuote.client.contactRole})</p>
              <p className="text-slate-600">Email: {currentQuote.client.contactEmail}</p>
              <p className="text-slate-600">{selectedLanguage === 'en' ? 'Sector:' : selectedLanguage === 'pt' ? 'Setor:' : 'Sector:'} {currentQuote.client.industry} | {currentQuote.client.country}</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
                {selectedLanguage === 'en' ? 'Service Technical Sheet' : selectedLanguage === 'pt' ? 'Ficha Técnica do Serviço' : 'Ficha Técnica del Servicio'}
              </h3>
              <p className="font-semibold text-slate-900">{currentQuote.project.projectType}</p>
              <p className="text-slate-600 mt-0.5">{selectedLanguage === 'en' ? 'SAP Environment:' : selectedLanguage === 'pt' ? 'Ambiente SAP:' : 'Ambiente SAP:'} <span className="font-medium text-slate-800">{currentQuote.project.sapSystemVersion}</span></p>
              <p className="text-slate-600">{selectedLanguage === 'en' ? 'Methodology:' : selectedLanguage === 'pt' ? 'Metodologia:' : 'Metodología:'} <span className="font-medium text-slate-800">{currentQuote.project.methodology}</span></p>
              <p className="text-slate-600">{selectedLanguage === 'en' ? 'Duration:' : selectedLanguage === 'pt' ? 'Duração:' : 'Duración:'} <span className="font-medium text-slate-800">{currentQuote.project.durationMonths} {t.page3.months}</span></p>
              <p className="text-slate-600">{t.cover.hypercareIncluded.replace('{days}', String(currentQuote.guaranteeHypercareDays))}</p>
            </div>
          </div>

          {/* Section 1: Project Scope */}
          <div className="mb-7">
            <h2 className="text-sm font-bold text-blue-900 uppercase tracking-wide border-b border-slate-200 pb-1.5 mb-2.5">
              1. {selectedLanguage === 'en' ? 'Scope & Solution Objectives' : selectedLanguage === 'pt' ? 'Escopo & Objetivos da Solução' : 'Alcance y Objetivos de la Solución'}
            </h2>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {currentQuote.project.projectTitle}
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed mb-3">
              {currentQuote.project.scopeDescription || currentQuote.project.businessObjective}
            </p>
          </div>

          {/* Section 2: Financial Summary */}
          <div className="mb-8">
            <h2 className="text-sm font-bold text-blue-900 uppercase tracking-wide border-b border-slate-200 pb-1.5 mb-2.5">
              2. {selectedLanguage === 'en' ? 'Commercial & Economic Summary' : selectedLanguage === 'pt' ? 'Resumo Econômico da Proposta' : 'Resumen Económico de la Oferta'}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
              <div className="text-xs text-slate-600 space-y-1.5">
                <p className="font-semibold text-slate-800">{selectedLanguage === 'en' ? 'Commercial Terms & Payment:' : selectedLanguage === 'pt' ? 'Condições Comerciais e Pagamento:' : 'Condiciones Comerciales y de Pago:'}</p>
                <p>{currentQuote.paymentTerms || (selectedLanguage === 'en' ? '30 days invoice upon milestone acceptance.' : selectedLanguage === 'pt' ? '30 dias data fatura após homologação.' : '30 días fecha factura tras aceptación de hito.')}</p>
                <p className="text-slate-500 mt-2">
                  * {selectedLanguage === 'en' ? `Dedicated consulting effort: ${totals.totalHours} hrs assigned.` : selectedLanguage === 'pt' ? `Horas dedicadas de consultoria: ${totals.totalHours} hrs alocadas.` : `Horas de consultoría: ${totals.totalHours} hrs asignadas.`}
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>{selectedLanguage === 'en' ? 'Services Subtotal:' : selectedLanguage === 'pt' ? 'Subtotal Serviços:' : 'Subtotal Servicios:'}</span>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(totals.subtotalConsulting, currentQuote.currency, currentQuote.currencySymbol)}
                  </span>
                </div>
                {totals.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>{selectedLanguage === 'en' ? 'Commercial Discount' : selectedLanguage === 'pt' ? 'Desconto Comercial' : 'Descuento Comercial'} ({currentQuote.discountPercentage}%):</span>
                    <span>- {formatCurrency(totals.discountAmount, currentQuote.currency, currentQuote.currencySymbol)}</span>
                  </div>
                )}
                {totals.taxAmount > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>{selectedLanguage === 'en' ? 'Taxes / VAT' : selectedLanguage === 'pt' ? 'Impostos / Tributos' : 'Impuestos / IVA'} ({currentQuote.taxRatePercentage}%):</span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(totals.taxAmount, currentQuote.currency, currentQuote.currencySymbol)}
                    </span>
                  </div>
                )}
                <div className="border-t border-slate-300 pt-2 flex justify-between text-sm font-bold text-blue-900">
                  <span>{selectedLanguage === 'en' ? 'Total Investment:' : selectedLanguage === 'pt' ? 'Total da Proposta:' : 'Total de la Oferta:'}</span>
                  <span>{formatCurrency(totals.totalAmount, currentQuote.currency, currentQuote.currencySymbol)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-6 border-t border-slate-200">
            <div className="grid grid-cols-2 gap-12 text-center text-xs">
              <div>
                <div className="border-t border-slate-400 pt-2 mt-12">
                  <p className="font-bold text-slate-900">{selectedLanguage === 'en' ? 'FOR THE CONSULTING FIRM' : selectedLanguage === 'pt' ? 'PELA CONSULTORIA' : 'POR LA CONSULTORA'}</p>
                  <p className="text-slate-500">{activeCompany.legalRepresentative?.role || activeLead.role}</p>
                </div>
              </div>

              <div>
                <div className="border-t border-slate-400 pt-2 mt-12">
                  <p className="font-bold text-slate-900">{selectedLanguage === 'en' ? 'CLIENT ACCEPTANCE' : selectedLanguage === 'pt' ? 'ACEITE DO CLIENTE' : 'ACEPTACIÓN CLIENTE'}</p>
                  <p className="text-slate-500">{currentQuote.client.companyName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
