import React, { useState } from 'react';
import { 
  X, 
  Save, 
  Plus, 
  Trash2, 
  Users, 
  Building2, 
  FileText, 
  Calendar, 
  DollarSign, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Globe2,
  Briefcase,
  UserCheck,
  UserPlus,
  CheckSquare,
  Clock,
  Calculator,
  Percent,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Check,
  Copy,
  Wand2,
  User,
  ShoppingBag
} from 'lucide-react';
import { 
  Quotation, 
  SapResourceItem, 
  MilestoneItem, 
  SapModuleCode, 
  SeniorityLevel,
  ProjectType,
  PayrollCustomService,
  PayrollServiceConfig,
  RecruitmentActivityItem,
  RecruitmentServiceConfig,
  RiskMitigationItem,
  OutOfScopeCategoryItem,
  CommercialLeadInfo,
  ClientSignerInfo,
  Professional,
  ClientMasterItem,
  ResourceStaffingType,
  ProjectPlan
} from '../types';
import { GanttModule } from './gantt/GanttModule';
import { createDefaultGanttPlanForQuotation } from '../data/ganttTemplates';
import { syncSolpedsForQuotation, alignQuotationResourceSolpeds } from '../services/procurementService';
import { 
  SAP_CATALOG_MODULES, 
  SapCatalogModule,
  getStoredModules,
  getModuleBenchmarkRate,
  SAP_DEFAULT_MILESTONES, 
  STANDARD_ASSUMPTIONS, 
  STANDARD_OUT_OF_SCOPE 
} from '../data/sapModules';
import { 
  DEFAULT_RISK_ITEMS, 
  DEFAULT_OUT_OF_SCOPE_CATEGORIES, 
  DEFAULT_GATEKEEPER_CONDITION, 
  getDossierPresetsByProjectType 
} from '../data/dossierPresets';
import { calculateQuotationTotals, formatCurrency } from '../utils/calculations';
import { 
  CURRENCIES, 
  SupportedCurrency, 
  getBenchmarkRate, 
  convertCurrency, 
  isResourceRateMismatched, 
  rescueResourceRatesForCurrency 
} from '../utils/currencies';
import { getCachedBancoCentralData, convertUfToClp, convertClpToUf, formatUfValue } from '../services/bcentralService';
import { getStoredProfessionals, getProfessionalRate } from '../data/professionals';
import { getStoredClients } from '../data/clientsMaster';
import { getClientLogo } from '../data/defaultClientLogos';
import { ProfessionalPickerModal } from './ProfessionalPickerModal';
import { LogoUploader } from './LogoUploader';
import { formatRut, validateRut, CHILE_COMUNAS, COMMON_GIROS_SII } from '../utils/siiUtils';

interface QuotationFormProps {
  initialQuote?: Quotation | null;
  onSave: (quote: Quotation) => void;
  onCancel: () => void;
  professionals?: Professional[];
  clients?: ClientMasterItem[];
  onSaveClientToMaster?: (client: ClientMasterItem) => void;
  initialClient?: ClientMasterItem | null;
  modules?: SapCatalogModule[];
}

export const QuotationForm: React.FC<QuotationFormProps> = ({
  initialQuote,
  onSave,
  onCancel,
  professionals: propProfessionals,
  clients: propClients,
  onSaveClientToMaster,
  initialClient,
  modules: propModules
}) => {
  const isEditing = !!initialQuote;
  const availableClients = propClients || getStoredClients();
  const catalogModules = propModules || getStoredModules();

  // Active step in the structured wizard/tabs (now includes Step 6 for Bridev Dossier & Legal)
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);

  // Form State
  const [code, setCode] = useState(initialQuote?.code || `COT-SAP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`);
  const [version, setVersion] = useState(initialQuote?.version || '1.0');
  const [createdAt, setCreatedAt] = useState(initialQuote?.createdAt || new Date().toISOString().slice(0, 10));
  const [validUntil, setValidUntil] = useState(initialQuote?.validUntil || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'CLP' | 'MXN' | 'COP' | 'UF'>(initialQuote?.currency || 'USD');
  const [currencySymbol, setCurrencySymbol] = useState(initialQuote?.currencySymbol || '$');

  // Client info (SII & Branding)
  const [companyName, setCompanyName] = useState(initialQuote?.client.companyName || initialClient?.companyName || '');
  const [fantasyName, setFantasyName] = useState(initialQuote?.client.fantasyName || initialClient?.fantasyName || '');
  const [taxId, setTaxId] = useState(initialQuote?.client.taxId || initialClient?.taxId || '');
  const [businessActivity, setBusinessActivity] = useState(initialQuote?.client.businessActivity || initialClient?.businessActivity || '');
  const [siiActivityCode, setSiiActivityCode] = useState(initialQuote?.client.siiActivityCode || initialClient?.siiActivityCode || '');
  const [taxAddress, setTaxAddress] = useState(initialQuote?.client.taxAddress || initialClient?.taxAddress || '');
  const [comuna, setComuna] = useState(initialQuote?.client.comuna || initialClient?.comuna || 'Las Condes');
  const [city, setCity] = useState(initialQuote?.client.city || initialClient?.city || 'Santiago');
  const [country, setCountry] = useState(initialQuote?.client.country || initialClient?.country || 'Chile');
  const [contactName, setContactName] = useState(initialQuote?.client.contactName || initialClient?.contactName || '');
  const [contactRole, setContactRole] = useState(initialQuote?.client.contactRole || initialClient?.contactRole || 'Gerente de TI / Transformación Digital');
  const [contactEmail, setContactEmail] = useState(initialQuote?.client.contactEmail || initialClient?.contactEmail || '');
  const [contactPhone, setContactPhone] = useState(initialQuote?.client.contactPhone || initialClient?.contactPhone || '');
  const [billingEmail, setBillingEmail] = useState(initialQuote?.client.billingEmail || initialClient?.billingEmail || '');
  const [industry, setIndustry] = useState(initialQuote?.client.industry || initialClient?.industry || 'Manufactura & Operaciones');
  const [clientLogoUrl, setClientLogoUrl] = useState(
    initialQuote?.client.logoUrl || initialClient?.logoUrl || (initialQuote?.client ? getClientLogo(initialQuote.client) : initialClient ? getClientLogo(initialClient) : '')
  );
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [clientSavedNotice, setClientSavedNotice] = useState(false);

  // Project scope
  const [projectTitle, setProjectTitle] = useState(initialQuote?.project.projectTitle || '');
  const [projectType, setProjectType] = useState<ProjectType>(initialQuote?.project.projectType || 'Roll-out de Módulos');
  const [sapSystemVersion, setSapSystemVersion] = useState(initialQuote?.project.sapSystemVersion || 'SAP S/4HANA 2023');
  const [methodology, setMethodology] = useState<Quotation['project']['methodology']>(initialQuote?.project.methodology || 'SAP Activate');
  const [durationMonths, setDurationMonths] = useState(initialQuote?.project.durationMonths || 4);
  const [estimatedStartDate, setEstimatedStartDate] = useState(initialQuote?.project.estimatedStartDate || new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10));
  const [businessObjective, setBusinessObjective] = useState(initialQuote?.project.businessObjective || '');
  const [scopeDescription, setScopeDescription] = useState(initialQuote?.project.scopeDescription || '');
  const [assumptions, setAssumptions] = useState<string[]>(initialQuote?.project.assumptions || STANDARD_ASSUMPTIONS);
  const [outOfScope, setOutOfScope] = useState<string[]>(initialQuote?.project.outOfScope || STANDARD_OUT_OF_SCOPE);

  // =======================================================
  // DOSSIER EDITORIAL (ESTILO BRIDEV) INPUTS
  // =======================================================
  const initialDossierPresets = getDossierPresetsByProjectType(initialQuote?.project.projectType || 'Roll-out de Módulos');
  const [currentSituationHoy, setCurrentSituationHoy] = useState<string>(
    initialQuote?.currentSituationHoy || initialDossierPresets.hoy
  );
  const [builtSolutionQuedaConstruido, setBuiltSolutionQuedaConstruido] = useState<string>(
    initialQuote?.builtSolutionQuedaConstruido || initialDossierPresets.quedaConstruido
  );
  const [gatekeeperCondition, setGatekeeperCondition] = useState<string>(
    initialQuote?.gatekeeperCondition || DEFAULT_GATEKEEPER_CONDITION
  );
  const [riskItems, setRiskItems] = useState<RiskMitigationItem[]>(
    initialQuote?.riskItems && initialQuote.riskItems.length > 0
      ? initialQuote.riskItems
      : DEFAULT_RISK_ITEMS
  );
  const [outOfScopeCategories, setOutOfScopeCategories] = useState<OutOfScopeCategoryItem[]>(
    initialQuote?.outOfScopeCategories && initialQuote.outOfScopeCategories.length > 0
      ? initialQuote.outOfScopeCategories
      : DEFAULT_OUT_OF_SCOPE_CATEGORIES
  );
  const [commercialLead, setCommercialLead] = useState<CommercialLeadInfo>(
    initialQuote?.commercialLead || {
      name: 'Diego Rodrigues',
      role: 'Líder de Práctica & Consultor Senior',
      email: 'drodrigues@consultora-tech.cl',
      phone: '+56 9 4924 9816',
      location: 'Santiago de Chile'
    }
  );
  const [clientSigner, setClientSigner] = useState<ClientSignerInfo>(
    initialQuote?.clientSigner || {
      name: initialQuote?.client.contactName || '',
      taxId: initialQuote?.client.taxId || '',
      role: initialQuote?.client.contactRole || 'Representante Legal / Gerente de Área',
      email: initialQuote?.client.contactEmail || ''
    }
  );
  const [confidentialityMonths, setConfidentialityMonths] = useState<number>(
    initialQuote?.confidentialityMonths || 6
  );
  const [validityDays, setValidityDays] = useState<number>(
    initialQuote?.validityDays || 30
  );
  const [coverTheme, setCoverTheme] = useState<'alpine' | 'corporate' | 'datacenter'>(
    initialQuote?.coverTheme || 'alpine'
  );


  // =======================================================
  // SERVICIOS ESPECIALIZADOS: 1. PROCESO DE REMUNERACIONES
  // =======================================================
  const [payrollEnabled, setPayrollEnabled] = useState<boolean>(
    initialQuote?.payrollService?.enabled ?? (initialQuote?.project?.projectType === 'Proceso de Remuneraciones (Payroll)')
  );
  // • Cantidad de personas a Procesar pago de remuneraciones
  const [payrollHeadcount, setPayrollHeadcount] = useState<number>(
    initialQuote?.payrollService?.payrollHeadcount ?? 150
  );
  // • UF / Persona
  const [payrollRatePerPersonUF, setPayrollRatePerPersonUF] = useState<number>(
    initialQuote?.payrollService?.payrollRatePerPersonUF ?? 0.12
  );
  // • Cantidad de personas Control de asistencia
  const [attendanceHeadcount, setAttendanceHeadcount] = useState<number>(
    initialQuote?.payrollService?.attendanceHeadcount ?? 150
  );
  // • UF / Persona
  const [attendanceRatePerPersonUF, setAttendanceRatePerPersonUF] = useState<number>(
    initialQuote?.payrollService?.attendanceRatePerPersonUF ?? 0.05
  );
  // • Otros servicios desarrollados a medida (ej. contabilización de remuneraciones para otros sistemas)
  const [customPayrollServices, setCustomPayrollServices] = useState<PayrollCustomService[]>(
    initialQuote?.payrollService?.customServices ?? [
      {
        id: 'cs-init-1',
        name: 'Contabilización de remuneraciones para SAP FI y otros sistemas ERP',
        description: 'Generación automática de asientos contables de sueldos, provisiones y leyes sociales.',
        quantity: 1,
        unitPriceUF: 28,
        subtotalUF: 28
      }
    ]
  );

  // =======================================================
  // SERVICIOS ESPECIALIZADOS: 2. RECLUTAMIENTO & HEADHUNTING
  // =======================================================
  const [recruitmentEnabled, setRecruitmentEnabled] = useState<boolean>(
    initialQuote?.recruitmentService?.enabled ?? (initialQuote?.project?.projectType === 'Reclutamiento, Selección & Headhunting')
  );
  // • Proceso, por ejemplo, Proceso Hunting
  const [recruitmentProcessType, setRecruitmentProcessType] = useState<string>(
    initialQuote?.recruitmentService?.processType ?? 'Proceso Hunting'
  );
  // • Costo una renta Bruta ($)
  const [includeGrossSalaryFee, setIncludeGrossSalaryFee] = useState<boolean>(
    initialQuote?.recruitmentService?.includeGrossSalaryFee ?? true
  );
  const [grossSalaryAmount, setGrossSalaryAmount] = useState<number>(
    initialQuote?.recruitmentService?.grossSalaryAmount ?? 3500000
  );
  const [grossSalaryCurrency, setGrossSalaryCurrency] = useState<'CLP' | 'UF' | 'USD'>(
    initialQuote?.recruitmentService?.grossSalaryCurrency ?? 'CLP'
  );
  const [grossSalaryFeePercentage, setGrossSalaryFeePercentage] = useState<number>(
    initialQuote?.recruitmentService?.grossSalaryFeePercentage ?? 100
  );
  // • Actividad de Entrevistas varias o Descripción de Cargo (UF / Actividad)
  const [recruitmentActivities, setRecruitmentActivities] = useState<RecruitmentActivityItem[]>(
    initialQuote?.recruitmentService?.activities ?? [
      {
        id: 'act-init-1',
        activityName: 'Descripción de Cargo / Levantamiento de Perfil y Competencias',
        description: 'Taller de levantamiento de perfil técnico y competencias clave del rol.',
        quantity: 1,
        ratePerActivityUF: 4.5,
        subtotalUF: 4.5
      },
      {
        id: 'act-init-2',
        activityName: 'Actividad de Entrevistas varias (Entrevistas psicolaborales por competencias)',
        description: 'Batería de entrevistas por competencias STAR y aplicación de pruebas laborales.',
        quantity: 3,
        ratePerActivityUF: 2.5,
        subtotalUF: 7.5
      }
    ]
  );

  // Resources (The core SAP modules: HCM, MM, LE, PM, QM, ABAP, Basis, Security)
  const [resources, setResources] = useState<SapResourceItem[]>(() => {
    const raw = initialQuote?.resources || [
      {
        id: 'res-init-1',
        moduleCode: 'SAP_MM',
        moduleName: 'SAP MM (Materials Management)',
        roleTitle: 'Consultor Funcional Senior SAP MM',
        seniority: 'Senior',
        hours: 160,
        hourlyRate: 90,
        subtotal: 14400,
        modality: 'Híbrido',
        responsibilities: 'Configuración de compras, gestión de almacenes e inventarios.'
      },
      {
        id: 'res-init-2',
        moduleCode: 'DEV_ABAP',
        moduleName: 'Desarrollador ABAP / Fiori',
        roleTitle: 'Desarrollador Senior ABAP Cloud',
        seniority: 'Senior',
        hours: 120,
        hourlyRate: 85,
        subtotal: 10200,
        modality: 'Remoto',
        responsibilities: 'Desarrollo de CDS views, reportes y formularios.'
      }
    ];

    const currentCurr = initialQuote?.currency || 'USD';
    const hasMismatched = raw.some(r => isResourceRateMismatched(r.hourlyRate, currentCurr));
    if (hasMismatched) {
      return alignQuotationResourceSolpeds(rescueResourceRatesForCurrency(raw, currentCurr, undefined, propProfessionals || getStoredProfessionals()));
    }
    return alignQuotationResourceSolpeds(raw);
  });

  // Milestones
  const [milestones, setMilestones] = useState<MilestoneItem[]>(
    initialQuote?.milestones || SAP_DEFAULT_MILESTONES.map((m, idx) => ({
      id: `m-init-${idx}`,
      ...m
    }))
  );

  // Gantt Plan & Step 4 View Mode
  const [ganttPlan, setGanttPlan] = useState<ProjectPlan>(
    initialQuote?.ganttPlan || createDefaultGanttPlanForQuotation(
      initialQuote?.project?.projectTitle || 'Implementación SAP S/4HANA',
      initialQuote?.project?.estimatedStartDate || new Date().toISOString().slice(0, 10),
      initialQuote?.client?.country || 'Chile'
    )
  );
  const [milestoneSubTab, setMilestoneSubTab] = useState<'milestones' | 'gantt'>('milestones');

  // Financials
  const [discountPercentage, setDiscountPercentage] = useState(initialQuote?.discountPercentage || 0);
  const [taxRatePercentage, setTaxRatePercentage] = useState(initialQuote?.taxRatePercentage || 19);
  const [expensesAmount, setExpensesAmount] = useState(initialQuote?.expensesAmount || 0);
  const [paymentTerms, setPaymentTerms] = useState(initialQuote?.paymentTerms || 'Facturación contra hito formalmente aceptado (30 días fecha factura).');
  const [guaranteeHypercareDays, setGuaranteeHypercareDays] = useState(initialQuote?.guaranteeHypercareDays || 30);
  const [currencyChangePrompt, setCurrencyChangePrompt] = useState<{ prev: string; next: string } | null>(null);
  const [currencyFeedbackNotice, setCurrencyFeedbackNotice] = useState<string | null>(null);

  // Dynamic calculations for specialized services
  const payrollSubtotalUF = (Number(payrollHeadcount) || 0) * (Number(payrollRatePerPersonUF) || 0);
  const attendanceSubtotalUF = (Number(attendanceHeadcount) || 0) * (Number(attendanceRatePerPersonUF) || 0);
  const customServicesTotalUF = customPayrollServices.reduce((sum, cs) => sum + (Number(cs.quantity || 0) * Number(cs.unitPriceUF || 0)), 0);
  const calculatedPayrollTotalUF = payrollSubtotalUF + attendanceSubtotalUF + customServicesTotalUF;

  const calculatedRecruitmentGrossFeeUF = includeGrossSalaryFee ? (
    grossSalaryCurrency === 'UF' 
      ? ((Number(grossSalaryAmount) || 0) * ((Number(grossSalaryFeePercentage) || 100) / 100))
      : convertClpToUf((Number(grossSalaryAmount) || 0) * ((Number(grossSalaryFeePercentage) || 100) / 100))
  ) : 0;
  const calculatedRecruitmentActivitiesTotalUF = recruitmentActivities.reduce((sum, a) => sum + (Number(a.quantity || 0) * Number(a.ratePerActivityUF || 0)), 0);
  const calculatedRecruitmentTotalUF = calculatedRecruitmentGrossFeeUF + calculatedRecruitmentActivitiesTotalUF;

  // Live Calculations
  const previewTotals = calculateQuotationTotals({
    currency,
    resources,
    discountPercentage,
    taxRatePercentage,
    expensesAmount,
    payrollService: {
      enabled: payrollEnabled,
      payrollHeadcount: Number(payrollHeadcount) || 0,
      payrollRatePerPersonUF: Number(payrollRatePerPersonUF) || 0,
      payrollSubtotalUF,
      attendanceHeadcount: Number(attendanceHeadcount) || 0,
      attendanceRatePerPersonUF: Number(attendanceRatePerPersonUF) || 0,
      attendanceSubtotalUF,
      customServices: customPayrollServices,
      customServicesTotalUF,
      totalUF: calculatedPayrollTotalUF
    },
    recruitmentService: {
      enabled: recruitmentEnabled,
      processType: recruitmentProcessType,
      includeGrossSalaryFee,
      grossSalaryAmount: Number(grossSalaryAmount) || 0,
      grossSalaryCurrency,
      grossSalaryFeePercentage: Number(grossSalaryFeePercentage) || 100,
      grossSalaryFeeTotalUF: calculatedRecruitmentGrossFeeUF,
      activities: recruitmentActivities,
      activitiesTotalUF: calculatedRecruitmentActivitiesTotalUF,
      totalUF: calculatedRecruitmentTotalUF
    }
  });

  const totalMilestonePercentage = milestones.reduce((sum, m) => sum + (Number(m.paymentPercentage) || 0), 0);

  // Handler for custom payroll services
  const handleAddCustomPayrollService = (name = 'Nuevo Servicio a Medida', defaultPriceUF = 20) => {
    const newItem: PayrollCustomService = {
      id: `cs-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      description: 'Servicio y parametrizaición complementaria según requerimiento del cliente.',
      quantity: 1,
      unitPriceUF: defaultPriceUF,
      subtotalUF: defaultPriceUF
    };
    setCustomPayrollServices(prev => [...prev, newItem]);
  };

  const handleUpdateCustomPayrollService = (id: string, updates: Partial<PayrollCustomService>) => {
    setCustomPayrollServices(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, ...updates };
      const qty = Number(updated.quantity) || 0;
      const price = Number(updated.unitPriceUF) || 0;
      updated.subtotalUF = qty * price;
      return updated;
    }));
  };

  const handleDeleteCustomPayrollService = (id: string) => {
    setCustomPayrollServices(prev => prev.filter(item => item.id !== id));
  };

  // Handler for recruitment activities
  const handleAddRecruitmentActivity = (activityName = 'Nueva Actividad de Selección', defaultRateUF = 2.5) => {
    const newAct: RecruitmentActivityItem = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      activityName,
      description: 'Actividad especializada del proceso de reclutamiento y selección.',
      quantity: 1,
      ratePerActivityUF: defaultRateUF,
      subtotalUF: defaultRateUF
    };
    setRecruitmentActivities(prev => [...prev, newAct]);
  };

  const handleUpdateRecruitmentActivity = (id: string, updates: Partial<RecruitmentActivityItem>) => {
    setRecruitmentActivities(prev => prev.map(act => {
      if (act.id !== id) return act;
      const updated = { ...act, ...updates };
      const qty = Number(updated.quantity) || 0;
      const rate = Number(updated.ratePerActivityUF) || 0;
      updated.subtotalUF = qty * rate;
      return updated;
    }));
  };

  const handleDeleteRecruitmentActivity = (id: string) => {
    setRecruitmentActivities(prev => prev.filter(act => act.id !== id));
  };

  // Currency handler
  const handleCurrencyChange = (newCurr: 'USD' | 'EUR' | 'CLP' | 'MXN' | 'COP' | 'UF') => {
    const prevCurr = currency;
    setCurrency(newCurr);
    const symbols: Record<string, string> = { USD: '$', EUR: '€', CLP: '$', MXN: '$', COP: '$', UF: 'UF' };
    setCurrencySymbol(symbols[newCurr] || '$');

    // Automatically set typical default tax rate based on country/jurisdiction
    if (newCurr === 'UF') {
      setTaxRatePercentage(19); // 19% IVA Chile
      if (!country || country === 'Estados Unidos') setCountry('Chile');
      setPaymentTerms('Valores en Unidades de Fomento (UF). Facturación mensual en Pesos Chilenos (CLP) al valor oficial de la UF publicado por el Banco Central de Chile a la fecha de emisión (30 días).');
    } else if (newCurr === 'CLP') {
      setTaxRatePercentage(19); // 19% IVA Chile
      if (!country || country === 'Estados Unidos') setCountry('Chile');
    } else if (newCurr === 'MXN') {
      setTaxRatePercentage(16); // 16% IVA México
      if (!country || country === 'Chile') setCountry('México');
    } else if (newCurr === 'USD') {
      setTaxRatePercentage(0); // 0% Exportación desde Chile exenta a Uruguay, Brasil, Colombia o regional
      if (!country || country === 'Chile') setCountry('Uruguay / Brasil');
    }

    // SIEMPRE RESCATAR Y ACTUALIZAR AUTOMÁTICAMENTE LAS TARIFAS HORARIAS A LA NUEVA MONEDA
    if (resources.length > 0 && prevCurr !== newCurr) {
      setResources(prev => rescueResourceRatesForCurrency(prev, newCurr, prevCurr, catalogProfessionals));
      setCurrencyFeedbackNotice(`Tarifas horarias convertidas y rescatadas automáticamente a ${newCurr} según el tarifario oficial SAP.`);
    }

    if (expensesAmount > 0 && prevCurr !== newCurr) {
      setExpensesAmount(convertCurrency(expensesAmount, prevCurr, newCurr));
    }
  };

  // Professionals Catalog State
  const catalogProfessionals: Professional[] = propProfessionals || getStoredProfessionals();
  const [isPickerModalOpen, setIsPickerModalOpen] = useState(false);

  const handleApplyBenchmarkRatesForCurrency = () => {
    setResources(prev => rescueResourceRatesForCurrency(prev, currency, undefined, catalogProfessionals));
    if (expensesAmount > 0 && currencyChangePrompt) {
      setExpensesAmount(convertCurrency(expensesAmount, currencyChangePrompt.prev, currencyChangePrompt.next));
    }
    setCurrencyChangePrompt(null);
    setCurrencyFeedbackNotice(`Tarifas sincronizadas exitosamente con el tarifario oficial en ${currency}.`);
  };

  // Add Resource from Professionals Catalog (with exact official rate preloaded)
  const handleAddProfessionalFromCatalog = (prof: Professional) => {
    const rate = getProfessionalRate(prof, currency);
    const hours = 120;

    const newRes: SapResourceItem = {
      id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      moduleCode: prof.moduleCode,
      moduleName: prof.moduleName,
      roleTitle: `${prof.name} (${prof.roleTitle})`,
      seniority: prof.seniority,
      hours,
      hourlyRate: rate,
      subtotal: hours * rate,
      modality: prof.modality,
      responsibilities: prof.skills?.join(', ') || prof.bio || 'Consultoría especializada SAP.',
      professionalId: prof.id,
      professionalName: prof.name
    };

    setResources(prev => alignQuotationResourceSolpeds([...prev, newRes]));
  };

  // Assign or reassign a catalog professional to an existing resource row
  const handleAssignProfessionalToResource = (resourceId: string, profId: string) => {
    if (!profId) {
      const target = resources.find(r => r.id === resourceId);
      const benchmarkRate = target ? getBenchmarkRate(target.moduleCode, target.seniority, currency) : 0;
      handleUpdateResource(resourceId, {
        professionalId: undefined,
        professionalName: undefined,
        ...(benchmarkRate > 0 ? { hourlyRate: benchmarkRate, subtotal: (Number(target?.hours) || 120) * benchmarkRate } : {})
      });
      return;
    }
    const prof = catalogProfessionals.find(p => p.id === profId);
    if (!prof) return;

    const rate = getProfessionalRate(prof, currency);
    const target = resources.find(r => r.id === resourceId);
    const hours = target ? Number(target.hours) || 120 : 120;

    handleUpdateResource(resourceId, {
      professionalId: prof.id,
      professionalName: prof.name,
      roleTitle: `${prof.name} (${prof.roleTitle})`,
      moduleCode: prof.moduleCode,
      moduleName: prof.moduleName,
      seniority: prof.seniority,
      modality: prof.modality,
      hourlyRate: rate,
      subtotal: hours * rate,
      responsibilities: prof.skills?.join(', ') || target?.responsibilities
    });
  };

  // Add Resource from standard SAP modules catalog
  const handleAddModuleFromCatalog = (catalogMod: SapCatalogModule) => {
    const defaultSeniority: SeniorityLevel = 'Senior';
    const rate = getModuleBenchmarkRate(catalogMod, defaultSeniority, currency);
    const hours = 120;

    const newRes: SapResourceItem = {
      id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      moduleCode: catalogMod.code,
      moduleName: catalogMod.name,
      roleTitle: `Consultor ${catalogMod.shortName} (${defaultSeniority})`,
      seniority: defaultSeniority,
      hours,
      hourlyRate: rate,
      subtotal: hours * rate,
      modality: 'Híbrido',
      responsibilities: catalogMod.defaultResponsibilities || 'Consultoría y ejecución especializada.'
    };

    setResources(prev => alignQuotationResourceSolpeds([...prev, newRes]));
  };

  const handleUpdateResource = (id: string, updates: Partial<SapResourceItem>) => {
    setResources(prev => {
      const updatedList = prev.map(r => {
        if (r.id !== id) return r;
        const updated = { ...r, ...updates };
        const hours = Number(updated.hours) || 0;
        const rate = Number(updated.hourlyRate) || 0;
        updated.subtotal = hours * rate;
        return updated;
      });
      return alignQuotationResourceSolpeds(updatedList);
    });
  };

  const handleDeleteResource = (id: string) => {
    setResources(prev => alignQuotationResourceSolpeds(prev.filter(r => r.id !== id)));
  };

  // Milestones handlers
  const handleAddMilestone = () => {
    const newM: MilestoneItem = {
      id: `m-${Date.now()}`,
      title: `Fase ${milestones.length + 1}: Nueva Entrega`,
      description: 'Definición de alcance de la fase y entregables.',
      deliverables: 'Documento técnico de entrega y pruebas.',
      estimatedWeek: `Semana ${milestones.length * 3 + 1} - ${milestones.length * 3 + 3}`,
      paymentPercentage: 15
    };
    setMilestones([...milestones, newM]);
  };

  const handleUpdateMilestone = (id: string, updates: Partial<MilestoneItem>) => {
    setMilestones(prev => prev.map(m => (m.id === id ? { ...m, ...updates } : m)));
  };

  const handleDeleteMilestone = (id: string) => {
    setMilestones(prev => prev.filter(m => m.id !== id));
  };

  const handleResetToStandardMilestones = () => {
    setMilestones(SAP_DEFAULT_MILESTONES.map((m, idx) => ({
      id: `m-std-${Date.now()}-${idx}`,
      ...m
    })));
  };

  // =======================================================
  // HANDLERS PARA DOSSIER EDITORIAL (ESTILO BRIDEV)
  // =======================================================
  const handleReloadPresetsForProjectType = (typeToUse = projectType) => {
    const presets = getDossierPresetsByProjectType(typeToUse);
    setCurrentSituationHoy(presets.hoy);
    setBuiltSolutionQuedaConstruido(presets.quedaConstruido);
  };

  const handleAddRiskItem = () => {
    const newRisk: RiskMitigationItem = {
      id: `r-${Date.now()}`,
      risk: 'Nuevo riesgo detectado en la operación',
      impact: 'Impacto potencial en el cronograma o pruebas.',
      mitigation: 'Plan de acción preventivo acordado con el cliente.',
      owner: 'Ambos'
    };
    setRiskItems(prev => [...prev, newRisk]);
  };

  const handleUpdateRiskItem = (id: string, updates: Partial<RiskMitigationItem>) => {
    setRiskItems(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const handleDeleteRiskItem = (id: string) => {
    setRiskItems(prev => prev.filter(r => r.id !== id));
  };

  const handleResetRiskItems = () => {
    setRiskItems(DEFAULT_RISK_ITEMS);
  };

  const handleAddOutOfScopeCategory = () => {
    const newCat: OutOfScopeCategoryItem = {
      id: `oosc-${Date.now()}`,
      title: 'Nueva Categoría Excluida',
      description: 'Detalle de los servicios o componentes no cubiertos en esta propuesta comercial.'
    };
    setOutOfScopeCategories(prev => [...prev, newCat]);
  };

  const handleUpdateOutOfScopeCategory = (id: string, updates: Partial<OutOfScopeCategoryItem>) => {
    setOutOfScopeCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const handleDeleteOutOfScopeCategory = (id: string) => {
    setOutOfScopeCategories(prev => prev.filter(c => c.id !== id));
  };

  const handleResetOutOfScopeCategories = () => {
    setOutOfScopeCategories(DEFAULT_OUT_OF_SCOPE_CATEGORIES);
  };

  const handleCopyContactToSigner = () => {
    setClientSigner({
      name: contactName,
      taxId: taxId,
      role: contactRole || 'Representante Legal / Gerente de Área',
      email: contactEmail
    });
  };

  const handleSelectClientFromMaster = (c: ClientMasterItem) => {
    setCompanyName(c.companyName);
    setFantasyName(c.fantasyName || c.companyName);
    setTaxId(c.taxId);
    setBusinessActivity(c.businessActivity || '');
    setSiiActivityCode(c.siiActivityCode || '');
    setTaxAddress(c.taxAddress || '');
    setComuna(c.comuna || 'Las Condes');
    setCity(c.city || 'Santiago');
    setCountry(c.country || 'Chile');
    setContactName(c.contactName || '');
    setContactRole(c.contactRole || 'Gerente de TI');
    setContactEmail(c.contactEmail || '');
    setContactPhone(c.contactPhone || '');
    setBillingEmail(c.billingEmail || c.contactEmail || '');
    setIndustry(c.industry || 'Manufactura & Operaciones');
    setClientLogoUrl(c.logoUrl || getClientLogo(c));
    setShowClientPicker(false);
  };

  const handleSaveCurrentClientToMaster = () => {
    if (!companyName.trim()) {
      alert('Por favor ingrese al menos la Razón Social o Empresa para registrarla en el Maestro de Clientes.');
      return;
    }

    const newMasterClient: ClientMasterItem = {
      id: `client-${Date.now()}`,
      companyName: companyName.trim(),
      fantasyName: fantasyName.trim() || companyName.trim(),
      taxId: taxId.trim(),
      businessActivity: businessActivity.trim(),
      siiActivityCode: siiActivityCode.trim(),
      taxAddress: taxAddress.trim(),
      comuna: comuna.trim(),
      city: city.trim(),
      country: country.trim() || 'Chile',
      contactName: contactName.trim(),
      contactRole: contactRole.trim(),
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim(),
      billingEmail: billingEmail.trim(),
      industry: industry.trim(),
      logoUrl: clientLogoUrl.trim(),
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
      active: true
    };

    if (onSaveClientToMaster) {
      onSaveClientToMaster(newMasterClient);
    } else {
      const stored = getStoredClients();
      const existingIdx = stored.findIndex(c => c.taxId && c.taxId === newMasterClient.taxId);
      let updatedList: ClientMasterItem[];
      if (existingIdx >= 0) {
        updatedList = stored.map((item, idx) => idx === existingIdx ? { ...item, ...newMasterClient, id: item.id } : item);
      } else {
        updatedList = [newMasterClient, ...stored];
      }
      try {
        localStorage.setItem('sap_clients_master', JSON.stringify(updatedList));
      } catch (e) {
        console.error('Error saving client master:', e);
      }
    }

    setClientSavedNotice(true);
    setTimeout(() => setClientSavedNotice(false), 3500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName.trim()) {
      alert('Por favor ingrese el nombre de la empresa cliente.');
      setActiveStep(1);
      return;
    }

    if (!projectTitle.trim()) {
      alert('Por favor ingrese el título del proyecto SAP.');
      setActiveStep(2);
      return;
    }

    // A valid quotation must have at least consulting resources OR an active payroll/recruitment service
    if (resources.length === 0 && !payrollEnabled && !recruitmentEnabled) {
      alert('Debe agregar al menos un recurso de consultoría SAP o configurar servicios de remuneraciones / selección.');
      setActiveStep(3);
      return;
    }

    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const initialHistory = initialQuote?.statusHistory || [
      {
        id: `log-created-${Date.now()}`,
        date: now,
        status: 'draft',
        note: isEditing ? 'Cotización modificada y actualizada.' : 'Cotización creada en estado Borrador.',
        author: 'Consultor Preventa SAP'
      }
    ];

    const payrollConfig: PayrollServiceConfig | undefined = payrollEnabled ? {
      enabled: true,
      payrollHeadcount: Number(payrollHeadcount) || 0,
      payrollRatePerPersonUF: Number(payrollRatePerPersonUF) || 0,
      payrollSubtotalUF,
      attendanceHeadcount: Number(attendanceHeadcount) || 0,
      attendanceRatePerPersonUF: Number(attendanceRatePerPersonUF) || 0,
      attendanceSubtotalUF,
      customServices: customPayrollServices,
      customServicesTotalUF,
      totalUF: calculatedPayrollTotalUF
    } : undefined;

    const recruitmentConfig: RecruitmentServiceConfig | undefined = recruitmentEnabled ? {
      enabled: true,
      processType: recruitmentProcessType,
      includeGrossSalaryFee,
      grossSalaryAmount: Number(grossSalaryAmount) || 0,
      grossSalaryCurrency,
      grossSalaryFeePercentage: Number(grossSalaryFeePercentage) || 100,
      grossSalaryFeeTotalUF: calculatedRecruitmentGrossFeeUF,
      activities: recruitmentActivities,
      activitiesTotalUF: calculatedRecruitmentActivitiesTotalUF,
      totalUF: calculatedRecruitmentTotalUF
    } : undefined;

    const savedQuotation: Quotation = {
      id: initialQuote?.id || `quote-${Date.now()}`,
      code,
      version,
      createdAt,
      validUntil,
      currency,
      currencySymbol,
      status: initialQuote?.status || 'draft',
      rejectionReason: initialQuote?.rejectionReason,
      client: {
        companyName,
        fantasyName,
        taxId,
        businessActivity,
        siiActivityCode,
        taxAddress,
        comuna,
        city,
        country,
        contactName,
        contactRole,
        contactEmail,
        contactPhone,
        billingEmail,
        industry,
        logoUrl: clientLogoUrl
      },
      project: {
        projectTitle,
        projectType,
        businessObjective,
        methodology,
        durationMonths: Number(durationMonths) || 1,
        estimatedStartDate,
        sapSystemVersion,
        scopeDescription,
        assumptions,
        outOfScope
      },
      resources,
      milestones,
      payrollService: payrollConfig,
      recruitmentService: recruitmentConfig,
      discountPercentage: Number(discountPercentage) || 0,
      taxRatePercentage: Number(taxRatePercentage) || 0,
      expensesAmount: Number(expensesAmount) || 0,
      paymentTerms,
      guaranteeHypercareDays: Number(guaranteeHypercareDays) || 0,
      statusHistory: initialHistory,
      updatedAt: now,
      handoverNotes: initialQuote?.handoverNotes,
      executionAssignedPM: initialQuote?.executionAssignedPM,
      actualProjectCode: initialQuote?.actualProjectCode,

      // Planificación Ejecutiva Gantt SAP
      ganttPlan,

      // Dossier Editorial (Estilo Bridev) Inputs
      currentSituationHoy,
      builtSolutionQuedaConstruido,
      gatekeeperCondition,
      riskItems,
      outOfScopeCategories,
      commercialLead,
      clientSigner,
      confidentialityMonths: Number(confidentialityMonths) || 6,
      validityDays: Number(validityDays) || 30,
      coverTheme
    };

    // Sincronizar SOLPEDs de Servicio para recursos externos (ME51N)
    const { updatedResources } = syncSolpedsForQuotation(savedQuotation);
    const finalQuotationToSave: Quotation = {
      ...savedQuotation,
      resources: updatedResources
    };

    onSave(finalQuotationToSave);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-[92vw] max-w-[94vw] h-[90vh] max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-sm">
              SAP
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {isEditing ? `Editar Cotización: ${initialQuote.code}` : 'Nueva Cotización de Consultoría SAP'}
              </h2>
              <p className="text-xs text-slate-400">
                Estructuración de alcance, recursos por módulo SAP, hitos y condiciones comerciales
              </p>
            </div>
          </div>

          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator / Wizard Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-1 sm:gap-4 overflow-x-auto text-xs font-semibold">
          {[
            { step: 1, label: '1. Cliente & Oferta', icon: Building2 },
            { step: 2, label: '2. Alcance & Metodología', icon: Layers },
            { step: 3, label: `3. Recursos SAP (${resources.length})`, icon: Users },
            { step: 4, label: `4. Hitos & Carta Gantt (${milestones.length})`, icon: Calendar },
            { step: 5, label: '5. Precios & Cierre', icon: DollarSign },
            { step: 6, label: '6. Dossier Bridev & Legal ✨', icon: Sparkles }
          ].map(s => {
            const Icon = s.icon;
            const isCurr = activeStep === s.step;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => setActiveStep(s.step as any)}
                className={`py-2 px-3 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  isCurr
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-slate-800">
          
          {/* STEP 1: GENERAL DATA & CLIENT */}
          {activeStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Proposal Header Meta */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Identificación de la Cotización
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Código Cotización</label>
                    <input
                      type="text"
                      value={code}
                      onChange={e => setCode(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Versión</label>
                    <input
                      type="text"
                      value={version}
                      onChange={e => setVersion(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Fecha Emisión</label>
                    <input
                      type="date"
                      value={createdAt}
                      onChange={e => setCreatedAt(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Validez Oferta</label>
                    <input
                      type="date"
                      value={validUntil}
                      onChange={e => setValidUntil(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Moneda de Cotización</label>
                    <select
                      value={currency}
                      onChange={e => handleCurrencyChange(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="CLP">🇨🇱 CLP ($ - Pesos Chilenos) [Chile]</option>
                      <option value="UF">🇨🇱 UF (Unidad de Fomento - Banco Central de Chile) [Chile]</option>
                      <option value="MXN">🇲🇽 MXN ($ - Pesos Mexicanos) [México]</option>
                      <option value="USD">🇺🇸 USD ($ - Dólares) [Uruguay, Brasil, Colombia]</option>
                      <option value="EUR">🇪🇺 EUR (€ - Euros)</option>
                      <option value="COP">🇨🇴 COP ($ - Pesos Colombianos)</option>
                    </select>
                  </div>
                </div>

                {/* Banner Oficial Banco Central de Chile cuando se selecciona UF */}
                {currency === 'UF' && (
                  <div className="mt-3 p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
                    <Building2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap font-bold">
                        <span>Banco Central de Chile:</span>
                        <span className="font-mono text-blue-800 bg-white px-2 py-0.5 rounded border border-blue-200">
                          1 UF = ${formatUfValue(getCachedBancoCentralData().indicators.uf.value)} CLP
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold">
                          Indicador Oficial BCCh
                        </span>
                      </div>
                      <p className="text-[11px] text-blue-800/90 leading-relaxed">
                        Tarifas estándar SAP configuradas en UF (ej. Senior: ~2,20 UF/hr). La facturación se liquida en Pesos Chilenos (CLP) según el valor oficial de la UF a la fecha de emisión de cada factura.
                      </p>
                    </div>
                  </div>
                )}

                {/* Currency Feedback Notification */}
                {currencyFeedbackNotice && (
                  <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 text-xs text-emerald-900 animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{currencyFeedbackNotice}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrencyFeedbackNotice(null)}
                      className="text-emerald-700 hover:text-emerald-900 font-bold text-xs cursor-pointer p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Currency Change Alert Banner */}
                {currencyChangePrompt && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-in fade-in">
                    <div className="flex items-center gap-2 text-blue-900">
                      <RefreshCw className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>
                        Has cambiado la moneda a <strong>{currencyChangePrompt.next}</strong>. ¿Deseas adaptar automáticamente las tarifas horarias de los {resources.length} recursos según los benchmarks de mercado?
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleApplyBenchmarkRatesForCurrency}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                      >
                        Actualizar Tarifas ({currencyChangePrompt.next})
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrencyChangePrompt(null)}
                        className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors cursor-pointer"
                      >
                        Mantener valores
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Client Info (Maestro de Clientes & SII) */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-3.5">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      Empresa Cliente & Ficha Tributaria (SII)
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Vincule con el Maestro de Clientes o ingrese los datos tributarios y logo para la propuesta.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowClientPicker(!showClientPicker)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Cargar del Maestro ({availableClients.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveCurrentClientToMaster}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer"
                      title="Guarda o actualiza este cliente en el catálogo permanente"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Guardar en Maestro</span>
                    </button>
                  </div>
                </div>

                {/* Toast alert when client is saved */}
                {clientSavedNotice && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-medium text-emerald-800 flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>¡Cliente guardado exitosamente en el Maestro de Clientes!</span>
                  </div>
                )}

                {/* Quick Client Picker Drawer / Popover */}
                {showClientPicker && (
                  <div className="p-3.5 bg-slate-50 border border-blue-200 rounded-xl space-y-2.5 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        Seleccionar Cliente desde el Catálogo Permanente:
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowClientPicker(false)}
                        className="text-xs text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
                      >
                        ✕ Cerrar
                      </button>
                    </div>

                    {availableClients.length === 0 ? (
                      <p className="text-xs text-slate-500 italic py-2">
                        No hay clientes registrados en el Maestro. Puede registrarlos aquí o en el módulo "Clientes".
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                        {availableClients.map(c => (
                          <div
                            key={c.id}
                            onClick={() => handleSelectClientFromMaster(c)}
                            className="p-2.5 bg-white border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 rounded-lg cursor-pointer transition-all flex items-start gap-2.5 shadow-xs"
                          >
                            <div className="w-8 h-8 rounded border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden">
                              {c.logoUrl ? (
                                <img src={c.logoUrl} alt="" className="w-full h-full object-contain" />
                              ) : (
                                <Building2 className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1 text-xs">
                              <p className="font-bold text-slate-900 truncate">
                                {c.fantasyName || c.companyName}
                              </p>
                              <p className="text-[11px] text-slate-500 font-mono">
                                RUT: {c.taxId || 'S/RUT'}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">
                                {c.industry} · {c.city || c.country}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Main Client Data & Logo Form */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  {/* Left Column: Logo & Branding */}
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-slate-700">
                      Logo del Cliente (para la propuesta)
                    </label>
                    <LogoUploader
                      value={clientLogoUrl}
                      onChange={setClientLogoUrl}
                      placeholderText="Subir logo corporativo del cliente"
                      helperText="Aparecerá en portada y pie de propuesta. PNG o SVG con fondo transparente recomendado."
                    />
                  </div>

                  {/* Right 2 Columns: Identification & SII */}
                  <div className="lg:col-span-2 space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Razón Social del Cliente (SII) *
                        </label>
                        <input
                          type="text"
                          value={companyName}
                          onChange={e => setCompanyName(e.target.value)}
                          placeholder="ej. Distribuidora y Logística Nacional S.A."
                          required
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Nombre de Fantasía (Comercial)
                        </label>
                        <input
                          type="text"
                          value={fantasyName}
                          onChange={e => setFantasyName(e.target.value)}
                          placeholder="ej. LogiTech Express"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          RUT / Tax ID (SII)
                        </label>
                        <input
                          type="text"
                          value={taxId}
                          onChange={e => setTaxId(formatRut(e.target.value))}
                          placeholder="76.123.456-7"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block font-semibold text-slate-700 mb-1">
                          Giro Comercial (SII)
                        </label>
                        <input
                          type="text"
                          value={businessActivity}
                          onChange={e => setBusinessActivity(e.target.value)}
                          placeholder="ej. Servicios de consultoría y soluciones informáticas"
                          list="common-giros-list"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        <datalist id="common-giros-list">
                          {COMMON_GIROS_SII.map(g => (
                            <option key={g} value={g} />
                          ))}
                        </datalist>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Dirección Tributaria
                        </label>
                        <input
                          type="text"
                          value={taxAddress}
                          onChange={e => setTaxAddress(e.target.value)}
                          placeholder="Av. Apoquindo 4500, Of. 1201"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Comuna
                        </label>
                        <input
                          type="text"
                          value={comuna}
                          onChange={e => setComuna(e.target.value)}
                          placeholder="Las Condes"
                          list="comunas-list"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        <datalist id="comunas-list">
                          {CHILE_COMUNAS.map(c => (
                            <option key={c} value={c} />
                          ))}
                        </datalist>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Ciudad / País
                        </label>
                        <input
                          type="text"
                          value={`${city}${country ? `, ${country}` : ''}`}
                          onChange={e => {
                            const val = e.target.value;
                            if (val.includes(',')) {
                              const [ci, co] = val.split(',');
                              setCity(ci.trim());
                              setCountry(co.trim());
                            } else {
                              setCity(val);
                            }
                          }}
                          placeholder="Santiago, Chile"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Contacts & Billing */}
                    <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Contacto Principal
                        </label>
                        <input
                          type="text"
                          value={contactName}
                          onChange={e => setContactName(e.target.value)}
                          placeholder="ej. Ing. Roberto Valenzuela"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Cargo del Contacto
                        </label>
                        <input
                          type="text"
                          value={contactRole}
                          onChange={e => setContactRole(e.target.value)}
                          placeholder="ej. Gerente de TI & Sistemas"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Correo Electrónico
                        </label>
                        <input
                          type="email"
                          value={contactEmail}
                          onChange={e => setContactEmail(e.target.value)}
                          placeholder="contacto@empresa.com"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Teléfono Contacto
                        </label>
                        <input
                          type="text"
                          value={contactPhone}
                          onChange={e => setContactPhone(e.target.value)}
                          placeholder="+56 9 8452 1190"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Email Facturación DTE
                        </label>
                        <input
                          type="email"
                          value={billingEmail}
                          onChange={e => setBillingEmail(e.target.value)}
                          placeholder="dte@empresa.com"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Industria / Sector
                        </label>
                        <input
                          type="text"
                          value={industry}
                          onChange={e => setIndustry(e.target.value)}
                          placeholder="Minería, Retail, Manufactura, etc."
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PROJECT SCOPE & METHODOLOGY */}
          {activeStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600" />
                  Definición Técnica del Proyecto SAP
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Título Descriptivo del Proyecto SAP *
                    </label>
                    <input
                      type="text"
                      value={projectTitle}
                      onChange={e => setProjectTitle(e.target.value)}
                      placeholder="ej. Rollout Logístico e Industrial SAP MM, LE y PM en S/4HANA"
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Tipo de Servicio SAP
                    </label>
                    <select
                      value={projectType}
                      onChange={e => {
                        const val = e.target.value as ProjectType;
                        setProjectType(val);
                        if (val === 'Proceso de Remuneraciones (Payroll)') {
                          setPayrollEnabled(true);
                          if (currency !== 'UF') handleCurrencyChange('UF');
                          if (!projectTitle || projectTitle.startsWith('Rollout') || projectTitle === '') {
                            setProjectTitle('Servicio de Proceso de Remuneraciones, Asistencia e Integración Contable');
                          }
                        } else if (val === 'Reclutamiento, Selección & Headhunting') {
                          setRecruitmentEnabled(true);
                          if (currency !== 'UF') handleCurrencyChange('UF');
                          if (!projectTitle || projectTitle.startsWith('Rollout') || projectTitle === '') {
                            setProjectTitle('Servicio de Reclutamiento, Selección y Headhunting Especializado SAP');
                          }
                        }
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="Roll-out de Módulos">Roll-out de Módulos (MM, LE, PM, QM, HCM)</option>
                      <option value="Implementación Greenfield">Implementación Nueva (Greenfield)</option>
                      <option value="Conversión S/4HANA">Migración / Conversión S/4HANA (Brownfield)</option>
                      <option value="Soporte AMS / Bolsa de Horas">Soporte AMS / Bolsa de Horas Recurrente</option>
                      <option value="Fábrica ABAP / Fiori">Fábrica de Software ABAP & Fiori</option>
                      <option value="Auditoría & Optimización">Consultoría Especializada / Auditoría Basis & Seguridad</option>
                      <option value="Proceso de Remuneraciones (Payroll)">💼 Proceso de Remuneraciones (Payroll Outsourcing)</option>
                      <option value="Reclutamiento, Selección & Headhunting">🎯 Reclutamiento, Selección & Headhunting</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Versión de Sistema SAP
                    </label>
                    <input
                      type="text"
                      value={sapSystemVersion}
                      onChange={e => setSapSystemVersion(e.target.value)}
                      placeholder="ej. SAP S/4HANA 2023, SAP ECC 6.0 EHP8, Cloud Private"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Metodología de Proyecto
                    </label>
                    <select
                      value={methodology}
                      onChange={e => setMethodology(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="SAP Activate">SAP Activate (Discover, Prepare, Explore, Realize, Deploy, Run)</option>
                      <option value="ASAP Clásica">Metodología ASAP Clásica</option>
                      <option value="Ágil / Scrum Híbrido">Ágil / Scrum Híbrido (Sprints de Desarrollo)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Duración (Meses)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="36"
                        value={durationMonths}
                        onChange={e => setDurationMonths(Number(e.target.value) || 1)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Inicio Tentativo
                      </label>
                      <input
                        type="date"
                        value={estimatedStartDate}
                        onChange={e => setEstimatedStartDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Objetivo de Negocio
                    </label>
                    <textarea
                      rows={2}
                      value={businessObjective}
                      onChange={e => setBusinessObjective(e.target.value)}
                      placeholder="Describa el objetivo principal que busca la organización con este servicio SAP..."
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Descripción Detallada del Alcance
                    </label>
                    <textarea
                      rows={3}
                      value={scopeDescription}
                      onChange={e => setScopeDescription(e.target.value)}
                      placeholder="Detalle de procesos a parametrizar, módulos cubiertos, talleres de diseño BBP, desarrollos y acompañamiento..."
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* SERVICIOS ESPECIALIZADOS: PROCESO DE REMUNERACIONES & HEADHUNTING */}
              {/* ========================================================================= */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                      Servicios Especializados de Gestión de Personas / HR
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Cotización parametrizada en UF para Outsourcing de Remuneraciones y Procesos de Headhunting
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPayrollEnabled(!payrollEnabled)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                        payrollEnabled
                          ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-xs'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      <CheckSquare className={`w-3.5 h-3.5 ${payrollEnabled ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span>{payrollEnabled ? 'Remuneraciones Activo' : '+ Activar Remuneraciones'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRecruitmentEnabled(!recruitmentEnabled)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                        recruitmentEnabled
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-300 shadow-xs'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      <CheckSquare className={`w-3.5 h-3.5 ${recruitmentEnabled ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span>{recruitmentEnabled ? 'Headhunting Activo' : '+ Activar Headhunting'}</span>
                    </button>
                  </div>
                </div>

                {/* 1. COTIZACIONES PARA SERVICIOS DE PROCESO DE REMUNERACIONES */}
                {payrollEnabled && (
                  <div className="bg-slate-50/70 border border-blue-200 rounded-xl p-4 space-y-4">
                    <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                          1
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            Cotización para Servicios de Proceso de Remuneraciones
                          </h4>
                          <span className="text-[10px] text-slate-500">
                            Parámetros por dotación, control horario y desarrollos a medida
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">Subtotal Remuneraciones:</span>
                        <span className="text-xs font-extrabold text-blue-900 font-mono">
                          {formatUfValue(calculatedPayrollTotalUF)} UF
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          ≈ $ {new Intl.NumberFormat('es-CL').format(convertUfToClp(calculatedPayrollTotalUF))} CLP
                        </span>
                      </div>
                    </div>

                    {/* Parametros principales: Remuneraciones y Asistencia */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Sub-block A: Pago de Remuneraciones */}
                      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-blue-600" />
                            Pago de Remuneraciones
                          </span>
                          <span className="text-[11px] font-bold text-blue-700 font-mono">
                            {formatUfValue(payrollSubtotalUF)} UF
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <label className="block text-[11px] font-medium text-slate-600 mb-1">
                              Personas a Procesar *
                            </label>
                            <input
                              type="number"
                              min="1"
                              step="1"
                              value={payrollHeadcount}
                              onChange={e => setPayrollHeadcount(Math.max(1, Number(e.target.value) || 0))}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              placeholder="ej. 200"
                            />
                            <span className="text-[10px] text-slate-400 mt-0.5 block">Colaboradores</span>
                          </div>

                          <div>
                            <label className="block text-[11px] font-medium text-slate-600 mb-1">
                              UF / Persona *
                            </label>
                            <input
                              type="number"
                              min="0.001"
                              step="0.01"
                              value={payrollRatePerPersonUF}
                              onChange={e => setPayrollRatePerPersonUF(Math.max(0, Number(e.target.value) || 0))}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              placeholder="0.12"
                            />
                            <span className="text-[10px] text-slate-400 mt-0.5 block">
                              ≈ $ {new Intl.NumberFormat('es-CL').format(convertUfToClp(payrollRatePerPersonUF))} CLP
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Sub-block B: Control de Asistencia */}
                      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-blue-600" />
                            Control de Asistencia
                          </span>
                          <span className="text-[11px] font-bold text-blue-700 font-mono">
                            {formatUfValue(attendanceSubtotalUF)} UF
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <label className="block text-[11px] font-medium text-slate-600 mb-1">
                              Personas Control Asistencia *
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={attendanceHeadcount}
                              onChange={e => setAttendanceHeadcount(Math.max(0, Number(e.target.value) || 0))}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              placeholder="ej. 200"
                            />
                            <span className="text-[10px] text-slate-400 mt-0.5 block">Colaboradores</span>
                          </div>

                          <div>
                            <label className="block text-[11px] font-medium text-slate-600 mb-1">
                              UF / Persona *
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={attendanceRatePerPersonUF}
                              onChange={e => setAttendanceRatePerPersonUF(Math.max(0, Number(e.target.value) || 0))}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              placeholder="0.05"
                            />
                            <span className="text-[10px] text-slate-400 mt-0.5 block">
                              ≈ $ {new Intl.NumberFormat('es-CL').format(convertUfToClp(attendanceRatePerPersonUF))} CLP
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sub-block C: Otros servicios desarrollados a medida */}
                    <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-blue-600" />
                            Otros Servicios Desarrollados a Medida
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Por ejemplo: contabilización de remuneraciones para otros sistemas ERP, interfaces bancarias o reportes DT
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddCustomPayrollService('Nuevo Desarrollo / Interfaz a Medida', 25)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors flex items-center gap-1 cursor-pointer border border-blue-200"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Agregar Servicio</span>
                        </button>
                      </div>

                      {/* Presets rápidos */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {[
                          { name: 'Contabilización de remuneraciones para otros sistemas (SAP FI / ERP)', uf: 32 },
                          { name: 'Generación automática archivo Previred y dispersión masiva de bancos', uf: 18 },
                          { name: 'Portal de autoservicio de liquidaciones y certificados de antigüedad', uf: 24 },
                          { name: 'Declaración Jurada Anual DJ 1887 y Libro de Remuneraciones DT (LRE)', uf: 20 }
                        ].map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleAddCustomPayrollService(preset.name, preset.uf)}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
                          >
                            + {preset.name.split('(')[0].trim()} ({preset.uf} UF)
                          </button>
                        ))}
                      </div>

                      {/* Lista de servicios a medida */}
                      {customPayrollServices.length === 0 ? (
                        <p className="text-[11px] text-slate-400 italic py-2 text-center">
                          No hay servicios adicionales configurados. Utilice los botones superiores para agregar desarrollos a medida.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {customPayrollServices.map((cs) => (
                            <div
                              key={cs.id}
                              className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs"
                            >
                              <div className="sm:col-span-6">
                                <label className="text-[10px] text-slate-500 block">Nombre / Descripción del Servicio a Medida</label>
                                <input
                                  type="text"
                                  value={cs.name}
                                  onChange={e => handleUpdateCustomPayrollService(cs.id, { name: e.target.value })}
                                  placeholder="ej. Contabilización de remuneraciones para otros sistemas"
                                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-medium text-slate-800 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                />
                              </div>

                              <div className="sm:col-span-2">
                                <label className="text-[10px] text-slate-500 block">Cantidad</label>
                                <input
                                  type="number"
                                  min="1"
                                  value={cs.quantity}
                                  onChange={e => handleUpdateCustomPayrollService(cs.id, { quantity: Number(e.target.value) || 0 })}
                                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-medium text-right text-slate-800 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                />
                              </div>

                              <div className="sm:col-span-2">
                                <label className="text-[10px] text-slate-500 block">UF / Unidad</label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.5"
                                  value={cs.unitPriceUF}
                                  onChange={e => handleUpdateCustomPayrollService(cs.id, { unitPriceUF: Number(e.target.value) || 0 })}
                                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-mono font-medium text-right text-slate-800 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                />
                              </div>

                              <div className="sm:col-span-2 flex items-center justify-between pl-1">
                                <div className="text-right">
                                  <span className="text-[9px] text-slate-400 block">Subtotal</span>
                                  <span className="font-mono font-bold text-blue-900 text-xs">
                                    {formatUfValue(cs.subtotalUF)} UF
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteCustomPayrollService(cs.id)}
                                  className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 transition-colors ml-1 cursor-pointer"
                                  title="Eliminar servicio a medida"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. COTIZACIONES PARA SERVICIOS DE RECLUTAMIENTO, SELECCIÓN / HEADHUNTING */}
                {recruitmentEnabled && (
                  <div className="bg-slate-50/70 border border-indigo-200 rounded-xl p-4 space-y-4">
                    <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                          2
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            Cotización para Servicios de Reclutamiento, Selección / Headhunting
                          </h4>
                          <span className="text-[10px] text-slate-500">
                            Procesos de hunting, fee sobre renta bruta y actividades por UF
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">Subtotal Headhunting:</span>
                        <span className="text-xs font-extrabold text-indigo-900 font-mono">
                          {formatUfValue(calculatedRecruitmentTotalUF)} UF
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          ≈ $ {new Intl.NumberFormat('es-CL').format(convertUfToClp(calculatedRecruitmentTotalUF))} CLP
                        </span>
                      </div>
                    </div>

                    {/* Proceso y Costo una renta Bruta */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Proceso */}
                      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs space-y-2">
                        <label className="block text-xs font-bold text-slate-800">
                          Definición del Proceso *
                        </label>
                        <input
                          type="text"
                          value={recruitmentProcessType}
                          onChange={e => setRecruitmentProcessType(e.target.value)}
                          placeholder="ej. Proceso Hunting"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />

                        {/* Presets rápidos */}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {[
                            'Proceso Hunting',
                            'Búsqueda Ejecutiva C-Level',
                            'Headhunting Consultor SAP Senior',
                            'Selección Masiva Especializada'
                          ].map(preset => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setRecruitmentProcessType(preset)}
                              className={`text-[10px] px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                                recruitmentProcessType === preset
                                  ? 'bg-indigo-100 text-indigo-800 border-indigo-300 font-bold'
                                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                              }`}
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Costo una Renta Bruta ($) */}
                      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={includeGrossSalaryFee}
                              onChange={e => setIncludeGrossSalaryFee(e.target.checked)}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>Costo una Renta Bruta ($ / Success Fee)</span>
                          </label>

                          {includeGrossSalaryFee && (
                            <span className="text-[11px] font-bold text-indigo-700 font-mono">
                              {formatUfValue(calculatedRecruitmentGrossFeeUF)} UF
                            </span>
                          )}
                        </div>

                        {includeGrossSalaryFee ? (
                          <div className="grid grid-cols-12 gap-2 text-xs">
                            <div className="col-span-6">
                              <label className="text-[10px] text-slate-500 block mb-0.5">Renta Bruta ($)</label>
                              <div className="flex rounded-md shadow-xs">
                                <span className="inline-flex items-center px-2 rounded-l-md border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-[11px]">
                                  $
                                </span>
                                <input
                                  type="number"
                                  min="0"
                                  step="50000"
                                  value={grossSalaryAmount}
                                  onChange={e => setGrossSalaryAmount(Math.max(0, Number(e.target.value) || 0))}
                                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded-r-md font-mono text-slate-900 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                                  placeholder="3500000"
                                />
                              </div>
                            </div>

                            <div className="col-span-3">
                              <label className="text-[10px] text-slate-500 block mb-0.5">Moneda</label>
                              <select
                                value={grossSalaryCurrency}
                                onChange={e => setGrossSalaryCurrency(e.target.value as any)}
                                className="w-full px-1.5 py-1 bg-white border border-slate-300 rounded font-medium text-slate-800 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                              >
                                <option value="CLP">CLP ($)</option>
                                <option value="UF">UF</option>
                                <option value="USD">USD ($)</option>
                              </select>
                            </div>

                            <div className="col-span-3">
                              <label className="text-[10px] text-slate-500 block mb-0.5">% Fee</label>
                              <input
                                type="number"
                                min="1"
                                max="200"
                                value={grossSalaryFeePercentage}
                                onChange={e => setGrossSalaryFeePercentage(Number(e.target.value) || 100)}
                                className="w-full px-1.5 py-1 bg-white border border-slate-300 rounded text-right font-medium text-slate-800 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                              />
                            </div>

                            <div className="col-span-12 text-[10px] text-slate-500 flex justify-between pt-0.5">
                              <span>Fee de éxito: {grossSalaryFeePercentage}% de 1 renta bruta mensual</span>
                              <span className="font-mono text-indigo-800 font-semibold">
                                ≈ {formatUfValue(calculatedRecruitmentGrossFeeUF)} UF (BCCh: ${formatUfValue(getCachedBancoCentralData().indicators.uf.value)})
                              </span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-400 italic">
                            No se cobra fee porcentual de renta bruta. La cotización se calculará exclusivamente por actividades específicas en UF.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actividad de Entrevistas varias o Descripción de Cargo (UF / Actividad) */}
                    <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                            Actividad de Entrevistas varias o Descripción de Cargo
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Tarifas cotizadas por UF / Actividad (evaluaciones, levantamiento de perfil y entrevistas)
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddRecruitmentActivity('Nueva Actividad de Selección', 2.5)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors flex items-center gap-1 cursor-pointer border border-indigo-200"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Agregar Actividad</span>
                        </button>
                      </div>

                      {/* Presets de actividades */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {[
                          { name: 'Descripción de Cargo / Levantamiento de Perfil y Competencias', uf: 4.5 },
                          { name: 'Actividad de Entrevistas varias (Entrevistas psicolaborales por competencias)', uf: 2.5 },
                          { name: 'Evaluación Técnica SAP / Pruebas de Habilidades Específicas', uf: 3.5 },
                          { name: 'Informe Psicolaboral Integral & Validación de Referencias Laborales', uf: 3.0 },
                          { name: 'Batería de Tests Psicométricos / Assessment Center', uf: 5.0 }
                        ].map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleAddRecruitmentActivity(preset.name, preset.uf)}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
                          >
                            + {preset.name.split('/')[0].split('(')[0].trim()} ({preset.uf} UF/act)
                          </button>
                        ))}
                      </div>

                      {/* Tabla de actividades */}
                      {recruitmentActivities.length === 0 ? (
                        <p className="text-[11px] text-slate-400 italic py-2 text-center">
                          No hay actividades configuradas. Utilice los botones superiores para agregar actividades en UF.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {recruitmentActivities.map((act) => (
                            <div
                              key={act.id}
                              className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs"
                            >
                              <div className="sm:col-span-6">
                                <label className="text-[10px] text-slate-500 block">Actividad de Entrevistas / Levantamiento</label>
                                <input
                                  type="text"
                                  value={act.activityName}
                                  onChange={e => handleUpdateRecruitmentActivity(act.id, { activityName: e.target.value })}
                                  placeholder="ej. Entrevistas varias o Descripción de Cargo"
                                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-medium text-slate-800 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                                />
                              </div>

                              <div className="sm:col-span-2">
                                <label className="text-[10px] text-slate-500 block">Cantidad</label>
                                <input
                                  type="number"
                                  min="1"
                                  value={act.quantity}
                                  onChange={e => handleUpdateRecruitmentActivity(act.id, { quantity: Number(e.target.value) || 0 })}
                                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-medium text-right text-slate-800 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                                />
                              </div>

                              <div className="sm:col-span-2">
                                <label className="text-[10px] text-slate-500 block">UF / Actividad</label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.1"
                                  value={act.ratePerActivityUF}
                                  onChange={e => handleUpdateRecruitmentActivity(act.id, { ratePerActivityUF: Number(e.target.value) || 0 })}
                                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-mono font-medium text-right text-slate-800 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                                />
                              </div>

                              <div className="sm:col-span-2 flex items-center justify-between pl-1">
                                <div className="text-right">
                                  <span className="text-[9px] text-slate-400 block">Subtotal</span>
                                  <span className="font-mono font-bold text-indigo-900 text-xs">
                                    {formatUfValue(act.subtotalUF)} UF
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteRecruitmentActivity(act.id)}
                                  className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 transition-colors ml-1 cursor-pointer"
                                  title="Eliminar actividad"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: RESOURCES & SAP STAFFING PLAN (KEY USER REQUIREMENT) */}
          {activeStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* ========================================================================= */}
              {/* CATÁLOGO DE PROFESIONALES Y TARIFAS OFICIALES PRECARGADAS */}
              {/* ========================================================================= */}
              <div className="bg-gradient-to-r from-slate-900 to-blue-950 p-5 rounded-2xl text-white shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                        Nómina Oficial & Tarifario Preestablecido
                      </span>
                      <span className="text-[10px] font-mono text-slate-300">
                        Tarifas en <strong>{currency}</strong>
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-1 flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-400" />
                      Catálogo de Consultores y Especialistas SAP
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Incorpore directamente a los profesionales con su tarifa horaria precalculada en {currency}, sin necesidad de estimar o calcular valores manualmente.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsPickerModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto"
                  >
                    <Users className="w-4 h-4" />
                    <span>Ver Catálogo Completo ({catalogProfessionals.length})</span>
                  </button>
                </div>

                {/* Quick Roster Carousel / Grid */}
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Incorporación Rápida con 1 Clic (Tarifa Oficial {currency}):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                    {catalogProfessionals.slice(0, 8).map(prof => {
                      const rate = getProfessionalRate(prof, currency);
                      const isAdded = resources.some(r => r.professionalId === prof.id);

                      return (
                        <div
                          key={prof.id}
                          className={`p-2.5 rounded-xl border transition-all flex flex-col justify-between ${
                            isAdded
                              ? 'bg-blue-900/40 border-blue-500/50'
                              : 'bg-slate-800/80 border-slate-700/80 hover:bg-slate-800 hover:border-blue-400'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1 text-[9px] mb-1">
                              <span className="font-mono font-bold text-blue-300">{prof.code}</span>
                              <span className="text-slate-400 truncate">{prof.seniority}</span>
                            </div>
                            <div className="font-bold text-xs text-white truncate">{prof.name}</div>
                            <div className="text-[10px] text-slate-300 truncate">{prof.roleTitle.split('&')[0]}</div>
                          </div>

                          <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between">
                            <span className="font-mono font-bold text-xs text-emerald-400">
                              {formatCurrency(rate, currency, currencySymbol)}/hr
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAddProfessionalFromCatalog(prof)}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                isAdded
                                  ? 'bg-blue-500/30 text-blue-200 hover:bg-blue-500/50'
                                  : 'bg-blue-600 hover:bg-blue-500 text-white'
                              }`}
                            >
                              <Plus className="w-3 h-3" />
                              <span>{isAdded ? 'Agregar +' : 'Añadir'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Quick Catalog Adder: Standard SAP Modules */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-blue-600" />
                    Catálogo de Módulos SAP Genéricos (Benchmark)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Haga clic para añadir el perfil con horas y tarifas sugeridas de mercado
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {catalogModules.map(mod => (
                    <button
                      key={mod.code}
                      type="button"
                      onClick={() => handleAddModuleFromCatalog(mod)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-blue-50 hover:border-blue-300 text-slate-800 text-xs font-medium flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                      title={mod.description}
                    >
                      <Plus className="w-3 h-3 text-blue-600" />
                      <span>{mod.shortName}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Resources Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <div className="bg-slate-100 p-3 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-bold text-slate-800">
                      Staffing Plan de la Cotización ({resources.length} perfiles agregados)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setResources(prev => rescueResourceRatesForCurrency(prev, currency, undefined, catalogProfessionals));
                        setCurrencyFeedbackNotice(`Todas las tarifas han sido recalculadas y sincronizadas con el tarifario oficial en ${currency}.`);
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-blue-300 hover:bg-blue-50 text-blue-700 text-[11px] font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                      title={`Rescatar tarifas oficiales de mercado para ${currency}`}
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                      <span>Rescatar Tarifas ({currency})</span>
                    </button>
                  </div>
                  <span className="font-bold text-blue-700 shrink-0">
                    Total Horas: {previewTotals.totalHours} hrs | Subtotal: {formatCurrency(previewTotals.subtotalConsulting, currency, currencySymbol)}
                  </span>
                </div>

                {/* Mismatched rates alert banner if any rate is out of bounds for the current currency */}
                {resources.some(r => isResourceRateMismatched(r.hourlyRate, currency)) && (
                  <div className="p-3 bg-amber-50 border-b border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-amber-900 font-medium">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        Se detectaron tarifas que no corresponden a la escala de <strong>{currency}</strong> (por ejemplo valores en otra moneda previa).
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setResources(prev => rescueResourceRatesForCurrency(prev, currency, undefined, catalogProfessionals));
                        setCurrencyFeedbackNotice(`Tarifas rescatadas y sincronizadas exitosamente en ${currency}.`);
                      }}
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-xs transition-colors cursor-pointer text-xs shrink-0"
                    >
                      Rescatar Tarifas Oficiales ({currency})
                    </button>
                  </div>
                )}

                <div className="divide-y divide-slate-200">
                  {resources.map((res, index) => (
                    <div key={res.id} className="p-3.5 hover:bg-slate-50/60 transition-colors">
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-xs">
                        
                        {/* Module & Role Name */}
                        <div className="sm:col-span-4">
                          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                            {res.moduleName}
                          </span>
                          <input
                            type="text"
                            value={res.roleTitle}
                            onChange={e => handleUpdateResource(res.id, { roleTitle: e.target.value })}
                            placeholder="Título del Perfil"
                            className="w-full mt-1 px-2 py-1.5 bg-white border border-slate-300 rounded font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        {/* Seniority */}
                        <div className="sm:col-span-2">
                          <label className="text-[10px] text-slate-500 block">Seniority</label>
                          <select
                            value={res.seniority}
                            onChange={e => {
                              const newSeniority = e.target.value as SeniorityLevel;
                              let newRate = 0;
                              if (res.professionalId) {
                                const prof = catalogProfessionals.find(p => p.id === res.professionalId);
                                if (prof) {
                                  newRate = getProfessionalRate(prof, currency);
                                }
                              }
                              if (!newRate) {
                                newRate = getBenchmarkRate(res.moduleCode, newSeniority, currency);
                              }
                              handleUpdateResource(res.id, { 
                                seniority: newSeniority,
                                hourlyRate: newRate
                              });
                            }}
                            className="w-full mt-0.5 px-2 py-1.5 bg-white border border-slate-300 rounded text-slate-800 focus:outline-none"
                          >
                            <option value="Junior">Junior (1-2 a)</option>
                            <option value="Semi-Senior">Semi-Senior (3-5 a)</option>
                            <option value="Senior">Senior (6-9 a)</option>
                            <option value="Lead / Arquitecto">Lead / Arquitecto (+10 a)</option>
                          </select>
                        </div>

                        {/* Modality */}
                        <div className="sm:col-span-2">
                          <label className="text-[10px] text-slate-500 block">Modalidad</label>
                          <select
                            value={res.modality}
                            onChange={e => handleUpdateResource(res.id, { modality: e.target.value as any })}
                            className="w-full mt-0.5 px-2 py-1.5 bg-white border border-slate-300 rounded text-slate-800 focus:outline-none"
                          >
                            <option value="Remoto">Remoto</option>
                            <option value="Híbrido">Híbrido</option>
                            <option value="Presencial">Presencial</option>
                          </select>
                        </div>

                        {/* Hours */}
                        <div className="sm:col-span-1">
                          <label className="text-[10px] text-slate-500 block">Horas</label>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={res.hours}
                            onChange={e => handleUpdateResource(res.id, { hours: Number(e.target.value) || 0 })}
                            className="w-full mt-0.5 px-2 py-1.5 bg-white border border-slate-300 rounded text-right font-medium text-slate-800 focus:outline-none"
                          />
                        </div>

                        {/* Rate */}
                        <div className="sm:col-span-1">
                          <label className="text-[10px] text-slate-500 block truncate" title={`Tarifa por hora en ${currency}`}>
                            Tarifa/Hr ({currency})
                          </label>
                          <input
                            type="number"
                            min={currency === 'UF' ? '0.1' : '1'}
                            step={currency === 'UF' ? '0.01' : '1'}
                            value={res.hourlyRate}
                            onChange={e => handleUpdateResource(res.id, { hourlyRate: Number(e.target.value) || 0 })}
                            className={`w-full mt-0.5 px-2 py-1.5 bg-white border rounded text-right font-medium focus:outline-none ${
                              isResourceRateMismatched(res.hourlyRate, currency)
                                ? 'border-amber-400 bg-amber-50 text-amber-900 ring-1 ring-amber-300'
                                : 'border-slate-300 text-slate-800 focus:border-blue-500'
                            }`}
                          />
                          {currency === 'UF' && res.hourlyRate > 0 && res.hourlyRate <= 20 && (
                            <span className="text-[9px] text-slate-400 block text-right mt-0.5 truncate" title="Equivalente en CLP">
                              ~${Math.round(res.hourlyRate * 40879).toLocaleString('es-CL')}
                            </span>
                          )}
                        </div>

                        {/* Subtotal & Delete */}
                        <div className="sm:col-span-2 flex items-center justify-between pl-2">
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block">Subtotal</span>
                            <span className="font-bold text-slate-900 text-xs">
                              {formatCurrency(res.hours * res.hourlyRate, currency, currencySymbol)}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteResource(res.id)}
                            className="text-rose-500 hover:text-rose-700 p-1.5 rounded hover:bg-rose-50 transition-colors ml-2 cursor-pointer"
                            title="Eliminar recurso"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Consultant Catalog Assignment Selector & Internal/External Staffing Type */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-2 text-xs">
                        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 shrink-0">
                            <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span className="text-[11px] font-semibold text-slate-600 shrink-0">Consultor Asignado:</span>
                          </div>
                          
                          <select
                            value={res.professionalId || ''}
                            onChange={e => handleAssignProfessionalToResource(res.id, e.target.value)}
                            className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:bg-white focus:ring-1 focus:ring-blue-500 max-w-sm truncate"
                          >
                            <option value="">-- Perfil Genérico / Asignar Consultor del Catálogo --</option>
                            {catalogProfessionals.map(prof => {
                              const profRate = getProfessionalRate(prof, currency);
                              return (
                                <option key={prof.id} value={prof.id}>
                                  {prof.name} - {prof.roleTitle} ({prof.seniority}) • {formatCurrency(profRate, currency, currencySymbol)}/hr
                                </option>
                              );
                            })}
                          </select>

                          {/* Selector Interno vs Externo (Red box in user prompt) */}
                          <div className="flex items-center gap-0.5 shrink-0 bg-slate-100 p-0.5 rounded-lg border border-slate-200 ml-1">
                            <button
                              type="button"
                              onClick={() => handleUpdateResource(res.id, { staffingType: 'internal' })}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                (res.staffingType || 'internal') === 'internal'
                                  ? 'bg-white text-blue-700 shadow-xs border border-blue-200'
                                  : 'text-slate-500 hover:text-slate-800'
                              }`}
                              title="Recurso interno propio / Nómina (por defecto)"
                            >
                              <UserCheck className="w-3 h-3" />
                              <span>Interno</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateResource(res.id, { 
                                staffingType: 'external',
                                supplierName: res.supplierName || 'Partner Subcontratista SAP'
                              })}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                res.staffingType === 'external'
                                  ? 'bg-purple-600 text-white shadow-xs'
                                  : 'text-slate-500 hover:text-slate-800'
                              }`}
                              title="Subcontratación externa: generará Solicitud de Pedido SOLPED (ME51N) y posterior Orden de Compra (ME21N)"
                            >
                              <Briefcase className="w-3 h-3" />
                              <span>Externo (SOLPED)</span>
                            </button>
                          </div>
                        </div>

                        {res.professionalId ? (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                              <Check className="w-3 h-3 text-emerald-600" />
                              Tarifa del Catálogo Aplicada
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAssignProfessionalToResource(res.id, res.professionalId!)}
                              className="text-[10px] text-blue-600 hover:text-blue-800 underline font-medium cursor-pointer"
                              title="Recalcular tarifa oficial del catálogo para la moneda actual"
                            >
                              Re-sincronizar
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">
                            Tarifa calculada por benchmark o personalizada
                          </span>
                        )}
                      </div>

                      {/* Subcontratación Externa: Panel de SOLPED SAP MM */}
                      {res.staffingType === 'external' && (
                        <div className="mt-2.5 p-3 rounded-xl bg-purple-50/70 border border-purple-200 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3 animate-in fade-in">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
                            <div className="flex items-center gap-1.5 text-purple-900 font-bold shrink-0">
                              <ShoppingBag className="w-4 h-4 text-purple-700" />
                              <span>Subcontratación Externa:</span>
                            </div>
                            
                            <div className="flex-1 min-w-[220px]">
                              <input
                                type="text"
                                placeholder="Proveedor / Contratista (ej. NTT Data, Consultor Freelance, etc.)"
                                value={res.supplierName || ''}
                                onChange={e => handleUpdateResource(res.id, { supplierName: e.target.value })}
                                className="w-full px-2.5 py-1 bg-white border border-purple-300 rounded-lg text-slate-800 placeholder-purple-400/80 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                              />
                            </div>

                            <div className="w-40 shrink-0">
                              <input
                                type="number"
                                placeholder={`Tarifa Costo (${currencySymbol}/hr)`}
                                value={res.externalCostRate || ''}
                                onChange={e => handleUpdateResource(res.id, { externalCostRate: Number(e.target.value) || 0 })}
                                className="w-full px-2.5 py-1 bg-white border border-purple-300 rounded-lg text-slate-800 placeholder-purple-400/80 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                                title="Tarifa costo / compra pactada con el contratista"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {res.solpedNumber ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-300 text-[11px] font-bold font-mono">
                                <Check className="w-3.5 h-3.5 text-purple-700" />
                                <span>SOLPED #{res.solpedNumber} (Pos. {res.solpedPosition || 10})</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-purple-700 border border-purple-300 text-[11px] font-bold shadow-2xs">
                                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                                <span>Creará SOLPED SAP (Pos. {res.solpedPosition || 10})</span>
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: MILESTONES & DELIVERABLES + GANTT TIMELINE */}
          {activeStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Subtabs for Step 4 */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                <button
                  type="button"
                  onClick={() => setMilestoneSubTab('milestones')}
                  className={`px-3.5 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
                    milestoneSubTab === 'milestones'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Hitos de Pago & Facturación ({milestones.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMilestoneSubTab('gantt')}
                  className={`px-3.5 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
                    milestoneSubTab === 'gantt'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Carta Gantt Ejecutiva SAP 📊 ({ganttPlan.stages.length} fases)</span>
                </button>
              </div>

              {milestoneSubTab === 'milestones' ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Plan de Hitos, Entregables y Esquema de Pagos
                      </h3>
                      <p className="text-xs text-slate-500">
                        Estructura de avance conforme a las fases metodológicas de consultoría SAP
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleResetToStandardMilestones}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                      >
                        Cargar 5 Fases SAP Activate Estándar
                      </button>
                      <button
                        type="button"
                        onClick={handleAddMilestone}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Agregar Hito</span>
                      </button>
                    </div>
                  </div>

                  {/* Total percentage alert */}
                  <div className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                    totalMilestonePercentage === 100 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    <span>Suma de porcentajes de pago por hito: <strong>{totalMilestonePercentage}%</strong></span>
                    {totalMilestonePercentage === 100 ? (
                      <span className="flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Cuadre perfecto (100%)
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 font-semibold">
                        <AlertCircle className="w-4 h-4 text-amber-600" /> Debe sumar exactamente 100%
                      </span>
                    )}
                  </div>

                  {/* Milestones list */}
                  <div className="space-y-3">
                    {milestones.map((m, idx) => (
                      <div key={m.id} className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-500">Hito #{idx + 1}</span>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <label className="text-[11px] font-semibold text-slate-600">% Facturación:</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={m.paymentPercentage}
                                onChange={e => handleUpdateMilestone(m.id, { paymentPercentage: Number(e.target.value) || 0 })}
                                className="w-16 px-2 py-1 bg-white border border-slate-300 rounded text-right font-bold text-slate-900"
                              />
                              <span className="font-bold text-slate-700">%</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteMilestone(m.id)}
                              className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div className="sm:col-span-2">
                            <input
                              type="text"
                              value={m.title}
                              onChange={e => handleUpdateMilestone(m.id, { title: e.target.value })}
                              placeholder="Nombre del Hito / Fase"
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-semibold text-slate-800"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              value={m.estimatedWeek}
                              onChange={e => handleUpdateMilestone(m.id, { estimatedWeek: e.target.value })}
                              placeholder="ej. Semana 3 - 6"
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-700"
                            />
                          </div>
                        </div>

                        <textarea
                          rows={2}
                          value={m.deliverables}
                          onChange={e => handleUpdateMilestone(m.id, { deliverables: e.target.value })}
                          placeholder="Entregables contractuales: ej. Documento BBP firmado, especificaciones funcionales FDD, acta SIT..."
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-700"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>
                        <strong>Cronograma Ejecutivo de Fases SAP:</strong> Define las fases, dependencias y días hábiles. Puedes usar el botón <em>"Sincronizar con Hitos de Pago"</em> en el editor para generar automáticamente los hitos contractuales basados en este cronograma.
                      </span>
                    </div>
                  </div>

                  <GanttModule
                    plan={ganttPlan}
                    onChangePlan={setGanttPlan}
                    onSyncMilestones={(newMilestones) => {
                      setMilestones(newMilestones);
                      setMilestoneSubTab('milestones');
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* STEP 5: COMMERCIAL TERMS & CLOSING */}
          {activeStep === 5 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Commercial Conditions */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4 text-xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    Condiciones Comerciales y Tributarias
                  </h3>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Descuento Comercial (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={discountPercentage}
                      onChange={e => setDiscountPercentage(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-semibold text-slate-700">
                        Impuestos / Tasa de IVA (%)
                      </label>
                      <span className="text-[11px] text-slate-500">
                        {taxRatePercentage === 19 ? 'Chile: 19% IVA' : taxRatePercentage === 16 ? 'México: 16% IVA' : taxRatePercentage === 0 ? 'Exportación Exenta (0%)' : `${taxRatePercentage}%`}
                      </span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={taxRatePercentage}
                      onChange={e => setTaxRatePercentage(Number(e.target.value) || 0)}
                      placeholder="19 (Chile), 16 (México), 0 (Exento)"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                    />
                    <div className="flex gap-1.5 mt-1.5">
                      <button
                        type="button"
                        onClick={() => setTaxRatePercentage(19)}
                        className={`text-[10px] px-2 py-0.5 rounded border ${
                          taxRatePercentage === 19 ? 'bg-blue-100 text-blue-800 border-blue-300 font-bold' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        19% (Chile)
                      </button>
                      <button
                        type="button"
                        onClick={() => setTaxRatePercentage(16)}
                        className={`text-[10px] px-2 py-0.5 rounded border ${
                          taxRatePercentage === 16 ? 'bg-blue-100 text-blue-800 border-blue-300 font-bold' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        16% (México)
                      </button>
                      <button
                        type="button"
                        onClick={() => setTaxRatePercentage(0)}
                        className={`text-[10px] px-2 py-0.5 rounded border ${
                          taxRatePercentage === 0 ? 'bg-blue-100 text-blue-800 border-blue-300 font-bold' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        0% (Exportación)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Viáticos / Gastos de Desplazamiento Estimados ({currency})
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={expensesAmount}
                      onChange={e => setExpensesAmount(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Garantía Hipercare Post Go-Live (Días)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={guaranteeHypercareDays}
                      onChange={e => setGuaranteeHypercareDays(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Términos de Facturación y Pago
                    </label>
                    <textarea
                      rows={2}
                      value={paymentTerms}
                      onChange={e => setPaymentTerms(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                </div>

                {/* Real-time Summary Card */}
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-4">
                      Resumen Financiero Consolidado
                    </h3>

                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Horas Totales Estimadas:</span>
                        <span className="font-bold text-slate-900">{previewTotals.totalHours} hrs</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Tarifa Promedio Ponderada:</span>
                        <span className="font-bold text-slate-900">
                          {formatCurrency(previewTotals.averageHourlyRate, currency, currencySymbol)}/hr
                        </span>
                      </div>
                      {previewTotals.subtotalConsulting > 0 && (
                        <div className="flex justify-between text-slate-600">
                          <span>Subtotal Horas Consultoría:</span>
                          <span className="font-bold text-slate-900">
                            {formatCurrency(previewTotals.subtotalConsulting, currency, currencySymbol)}
                          </span>
                        </div>
                      )}

                      {previewTotals.subtotalPayroll > 0 && (
                        <div className="flex justify-between text-blue-800 bg-blue-50/70 px-2.5 py-1.5 rounded-lg border border-blue-100">
                          <span className="flex items-center gap-1.5 font-semibold">
                            <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                            Servicio Remuneraciones (Payroll):
                          </span>
                          <span className="font-bold font-mono">
                            {formatCurrency(previewTotals.subtotalPayroll, currency, currencySymbol)}
                          </span>
                        </div>
                      )}

                      {previewTotals.subtotalRecruitment > 0 && (
                        <div className="flex justify-between text-indigo-800 bg-indigo-50/70 px-2.5 py-1.5 rounded-lg border border-indigo-100">
                          <span className="flex items-center gap-1.5 font-semibold">
                            <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                            Servicio Reclutamiento / Headhunting:
                          </span>
                          <span className="font-bold font-mono">
                            {formatCurrency(previewTotals.subtotalRecruitment, currency, currencySymbol)}
                          </span>
                        </div>
                      )}

                      {previewTotals.discountAmount > 0 && (
                        <div className="flex justify-between text-emerald-700 font-semibold">
                          <span>Descuento Comercial ({discountPercentage}%):</span>
                          <span>- {formatCurrency(previewTotals.discountAmount, currency, currencySymbol)}</span>
                        </div>
                      )}

                      {expensesAmount > 0 && (
                        <div className="flex justify-between text-slate-600">
                          <span>Viáticos y Logística:</span>
                          <span className="font-medium text-slate-900">
                            {formatCurrency(expensesAmount, currency, currencySymbol)}
                          </span>
                        </div>
                      )}

                      {previewTotals.taxAmount > 0 && (
                        <div className="flex justify-between text-slate-600">
                          <span>Impuestos / IVA ({taxRatePercentage}%):</span>
                          <span className="font-medium text-slate-900">
                            {formatCurrency(previewTotals.taxAmount, currency, currencySymbol)}
                          </span>
                        </div>
                      )}

                      <div className="border-t border-slate-300 pt-3 flex justify-between text-base font-bold text-blue-900">
                        <span>Total de la Oferta:</span>
                        <span>{formatCurrency(previewTotals.totalAmount, currency, currencySymbol)}</span>
                      </div>

                      {/* Conversión cruzada de referencia Banco Central */}
                      {currency === 'UF' && (
                        <div className="bg-blue-50/70 p-2.5 rounded-lg border border-blue-100 flex items-center justify-between text-[11px]">
                          <span className="text-blue-800 font-medium">Equivalente estimado en CLP:</span>
                          <span className="font-mono font-bold text-blue-900">
                            ≈ $ {new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 }).format(convertUfToClp(previewTotals.totalAmount))} CLP
                          </span>
                        </div>
                      )}
                      {currency === 'CLP' && (
                        <div className="bg-slate-100/70 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-[11px]">
                          <span className="text-slate-600 font-medium">Equivalente estimado en UF:</span>
                          <span className="font-mono font-bold text-slate-800">
                            ≈ UF {formatUfValue(convertClpToUf(previewTotals.totalAmount))}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200 text-xs text-slate-500">
                    <p>
                      Al guardar, la cotización quedará lista para seguimiento comercial, descarga en PDF estándar y posterior traspaso a ejecución de proyecto.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: DOSSIER EDITORIAL (ESTILO BRIDEV) & LEGAL PARAMETERS */}
          {activeStep === 6 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Banner Explicativo con botón de autocompletado inteligente */}
              <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-5 rounded-2xl shadow-md border border-blue-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/30 text-blue-200 border border-blue-400/30">
                      Formato Multipágina Editorial Bridev
                    </span>
                    <span className="text-xs text-blue-300 font-mono">
                      v{version} · {code}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    Parámetros Narrativos, Matriz de Riesgos y Hoja Legal
                  </h3>
                  <p className="text-xs text-blue-100/90 leading-relaxed">
                    Estos campos alimentan la propuesta ejecutiva estilo Bridev (portada cinemática, "Hoy vs. Queda Construido", gatekeeper día 1, exclusiones por categoría y hoja de firmas). Todo viene precargado con redacción profesional de la industria.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleReloadPresetsForProjectType(projectType)}
                  className="shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold text-blue-900 bg-white hover:bg-blue-50 shadow-md flex items-center gap-2 transition-all cursor-pointer border border-blue-200"
                  title="Carga la redacción típica sugerida para este tipo de proyecto"
                >
                  <Wand2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>⚡ Cargar Textos para {projectType}</span>
                </button>
              </div>

              {/* 1. Selector Visual de Portada */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    1. Fotografía y Tema Visual de Portada & Contraportada
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Define la estética cinemática del documento
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'alpine',
                      title: 'Lago Alpino & Naturaleza',
                      desc: 'Estilo clásico Bridev (sereno, elegante y reflexivo).',
                      img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80'
                    },
                    {
                      id: 'corporate',
                      title: 'Arquitectura Corporativa',
                      desc: 'Edificios modernos y rascacielos de alta gama.',
                      img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80'
                    },
                    {
                      id: 'datacenter',
                      title: 'Data Center & Alta Tecnología',
                      desc: 'Infraestructura de servidores, redes y cloud computing.',
                      img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80'
                    }
                  ].map(t => {
                    const isSelected = coverTheme === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => setCoverTheme(t.id as any)}
                        className={`relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer group ${
                          isSelected
                            ? 'border-blue-600 shadow-md ring-2 ring-blue-500/20'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div
                          className="h-24 bg-cover bg-center"
                          style={{ backgroundImage: `url("${t.img}")` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent" />
                          <div className="absolute top-2 right-2">
                            {isSelected ? (
                              <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                                <Check className="w-3.5 h-3.5" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-slate-900/60 border border-white/40" />
                            )}
                          </div>
                        </div>
                        <div className="p-3 bg-white">
                          <p className="text-xs font-bold text-slate-900">{t.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{t.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Contraste Clave: "Hoy" vs "Queda Construido" */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-blue-600" />
                      2. Contraste de Valor: Situación Actual ("Hoy") vs. "Qué Queda Construido"
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Aparece en la Página 2 del dossier para evidenciar el dolor del cliente y el retorno de la inversión
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleReloadPresetsForProjectType(projectType)}
                    className="text-xs font-semibold text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Restablecer textos sugeridos
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Situación Actual (Hoy) */}
                  <div className="border border-red-200 bg-red-50/30 rounded-xl p-4 space-y-2">
                    <label className="block text-xs font-bold text-red-900 uppercase tracking-wide">
                      Situación Actual (Hoy) · Dolor & Riesgo Operativo
                    </label>
                    <textarea
                      rows={4}
                      value={currentSituationHoy}
                      onChange={e => setCurrentSituationHoy(e.target.value)}
                      placeholder="Describa los problemas actuales del cliente, reprocesos, falta de control..."
                      className="w-full px-3 py-2 bg-white border border-red-200 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-red-400 focus:outline-none leading-relaxed"
                    />
                    <p className="text-[10px] text-red-700/80">
                      Consejo: Explicar por qué mantener el estado actual es costoso o riesgoso.
                    </p>
                  </div>

                  {/* Qué Queda Construido */}
                  <div className="border border-blue-200 bg-blue-50/30 rounded-xl p-4 space-y-2">
                    <label className="block text-xs font-bold text-blue-950 uppercase tracking-wide">
                      Qué Queda Construido · Solución & Beneficio Final
                    </label>
                    <textarea
                      rows={4}
                      value={builtSolutionQuedaConstruido}
                      onChange={e => setBuiltSolutionQuedaConstruido(e.target.value)}
                      placeholder="Describa la solución integral entregada, automatizaciones, gobernanza..."
                      className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
                    />
                    <p className="text-[10px] text-blue-700/80">
                      Consejo: Centrarse en el resultado final concreto y la tranquilidad operativa entregada.
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Condición "Listo para Iniciar" (Gatekeeper Día 1) */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    3. Condición "Listo para Iniciar" (Gate de Inicio Día 1)
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500">
                  Cláusula contractual clave que estipula que los días no comienzan a correr sin contrato y accesos
                </p>

                <textarea
                  rows={3}
                  value={gatekeeperCondition}
                  onChange={e => setGatekeeperCondition(e.target.value)}
                  className="w-full px-3 py-2 bg-amber-50/40 border border-amber-200 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none leading-relaxed"
                />
              </div>

              {/* 4. Matriz de Riesgos & Mitigación */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      4. Matriz de Riesgos y Mitigación Operativa ({riskItems.length} riesgos)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Demuestra madurez de gestión y delimita responsabilidades con el cliente (Página 5)
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetRiskItems}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Restablecer Estándar
                    </button>
                    <button
                      type="button"
                      onClick={handleAddRiskItem}
                      className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Agregar Riesgo
                    </button>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-3 w-1/4">Riesgo Detectado</th>
                          <th className="p-3 w-1/4">Impacto Potencial</th>
                          <th className="p-3 w-1/3">Plan de Mitigación</th>
                          <th className="p-3 w-28 text-center">Responsable</th>
                          <th className="p-3 w-12 text-center"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {riskItems.map(r => (
                          <tr key={r.id} className="hover:bg-slate-50/50">
                            <td className="p-2.5">
                              <input
                                type="text"
                                value={r.risk}
                                onChange={e => handleUpdateRiskItem(r.id, { risk: e.target.value })}
                                className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-medium focus:ring-1 focus:ring-blue-500"
                              />
                            </td>
                            <td className="p-2.5">
                              <input
                                type="text"
                                value={r.impact}
                                onChange={e => handleUpdateRiskItem(r.id, { impact: e.target.value })}
                                className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:ring-1 focus:ring-blue-500"
                              />
                            </td>
                            <td className="p-2.5">
                              <input
                                type="text"
                                value={r.mitigation}
                                onChange={e => handleUpdateRiskItem(r.id, { mitigation: e.target.value })}
                                className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:ring-1 focus:ring-blue-500"
                              />
                            </td>
                            <td className="p-2.5 text-center">
                              <select
                                value={r.owner}
                                onChange={e => handleUpdateRiskItem(r.id, { owner: e.target.value as any })}
                                className={`px-2 py-1 rounded text-xs font-bold border ${
                                  r.owner === 'Cliente'
                                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                                    : r.owner === 'Consultora'
                                    ? 'bg-blue-50 text-blue-800 border-blue-300'
                                    : 'bg-purple-50 text-purple-800 border-purple-300'
                                }`}
                              >
                                <option value="Cliente">Cliente</option>
                                <option value="Consultora">Consultora</option>
                                <option value="Ambos">Ambos</option>
                              </select>
                            </td>
                            <td className="p-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleDeleteRiskItem(r.id)}
                                className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Eliminar riesgo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* 5. Fuera de Alcance Estructurado (4 Categorías Temáticas) */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-600" />
                      5. Fuera de Alcance Expreso ({outOfScopeCategories.length} categorías)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Evita expectativas falsas y desviaciones de presupuesto (Página 5)
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetOutOfScopeCategories}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Restablecer Estándar
                    </button>
                    <button
                      type="button"
                      onClick={handleAddOutOfScopeCategory}
                      className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Agregar Categoría
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {outOfScopeCategories.map((cat, idx) => (
                    <div key={cat.id} className="border border-slate-200 bg-slate-50/60 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-400 font-bold">0{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteOutOfScopeCategory(cat.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={cat.title}
                        onChange={e => handleUpdateOutOfScopeCategory(cat.id, { title: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-1 focus:ring-blue-500"
                      />
                      <textarea
                        rows={3}
                        value={cat.description}
                        onChange={e => handleUpdateOutOfScopeCategory(cat.id, { description: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 focus:ring-1 focus:ring-blue-500 leading-relaxed"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 6. Bloque Legal de Firmas, Contactos y Confidencialidad */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-5">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    6. Hoja Legal de Firmas y Términos Contractuales
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Aparece en la Página 6 para formalizar la aceptación y en la contraportada
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Consultora Emisora */}
                  <div className="border border-slate-200 bg-slate-50/50 rounded-xl p-4 space-y-3">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wide block pb-1 border-b border-slate-200">
                      Líder Comercial Consultora (Quien Firma)
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="col-span-2">
                        <label className="text-[10px] text-slate-500 block mb-0.5">Nombre Completo</label>
                        <input
                          type="text"
                          value={commercialLead.name}
                          onChange={e => setCommercialLead({ ...commercialLead, name: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-medium text-slate-900"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] text-slate-500 block mb-0.5">Cargo / Título</label>
                        <input
                          type="text"
                          value={commercialLead.role}
                          onChange={e => setCommercialLead({ ...commercialLead, role: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block mb-0.5">Correo Electrónico</label>
                        <input
                          type="email"
                          value={commercialLead.email}
                          onChange={e => setCommercialLead({ ...commercialLead, email: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block mb-0.5">Teléfono Directo</label>
                        <input
                          type="text"
                          value={commercialLead.phone}
                          onChange={e => setCommercialLead({ ...commercialLead, phone: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Representante Legal Cliente */}
                  <div className="border border-slate-200 bg-slate-50/50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                        Representante Autorizado Cliente
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyContactToSigner}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        Copiar del Contacto Principal
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="col-span-2">
                        <label className="text-[10px] text-slate-500 block mb-0.5">Nombre Completo del Firmante</label>
                        <input
                          type="text"
                          value={clientSigner.name}
                          onChange={e => setClientSigner({ ...clientSigner, name: e.target.value })}
                          placeholder="ej. Roberto Valenzuela Muñoz"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-medium text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block mb-0.5">RUT / Tax ID del Firmante</label>
                        <input
                          type="text"
                          value={clientSigner.taxId}
                          onChange={e => setClientSigner({ ...clientSigner, taxId: e.target.value })}
                          placeholder="12.345.678-9"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block mb-0.5">Cargo Institucional</label>
                        <input
                          type="text"
                          value={clientSigner.role}
                          onChange={e => setClientSigner({ ...clientSigner, role: e.target.value })}
                          placeholder="Representante Legal / Gerente General"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Parámetros Legales: Días de Validez y Meses de Reserva */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Validez de la Oferta (Días Corridos)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="180"
                      value={validityDays}
                      onChange={e => setValidityDays(Number(e.target.value) || 30)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Se muestra en portada y resumen contractual (típico: 30 días)
                    </span>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Reserva y Confidencialidad Recíproca (Meses)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={confidentialityMonths}
                      onChange={e => setConfidentialityMonths(Number(e.target.value) || 6)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Se imprime en el lateral vertical de todas las páginas (típico: 6 meses)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls inside Form */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div>
              {activeStep > 1 && (
                <button
                  type="button"
                  onClick={() => setActiveStep((activeStep - 1) as any)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  ← Paso Anterior
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {activeStep < 6 && (
                <button
                  type="button"
                  onClick={() => setActiveStep((activeStep + 1) as any)}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                >
                  {activeStep === 5 ? 'Siguiente: Personalizar Dossier Bridev (Paso 6) ✨ →' : 'Siguiente Paso →'}
                </button>
              )}

              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isEditing ? 'Guardar Cambios' : 'Crear Cotización SAP'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Professional Picker Modal */}
      <ProfessionalPickerModal
        isOpen={isPickerModalOpen}
        onClose={() => setIsPickerModalOpen(false)}
        professionals={catalogProfessionals}
        activeCurrency={currency}
        currencySymbol={currencySymbol}
        onSelectProfessional={handleAddProfessionalFromCatalog}
        alreadyAssignedIds={resources.map(r => r.professionalId).filter(Boolean) as string[]}
        modules={catalogModules}
      />
    </div>
  );
};
