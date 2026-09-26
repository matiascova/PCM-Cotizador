export type QuotationStatus = 'draft' | 'sent' | 'negotiation' | 'approved' | 'rejected';

export type SupportedCurrency = 'CLP' | 'UF' | 'MXN' | 'USD' | string;

export type StandardSapModuleCode = 
  | 'SAP_HCM'
  | 'SAP_MM'
  | 'SAP_LE'
  | 'SAP_PM'
  | 'SAP_QM'
  | 'DEV_ABAP'
  | 'SAP_BASIS'
  | 'SAP_SECURITY'
  | 'SAP_FICO'
  | 'SAP_PMO_LEAD';

export type SapModuleCode = StandardSapModuleCode | (string & {});

export type SeniorityLevel = 'Junior' | 'Semi-Senior' | 'Senior' | 'Lead / Arquitecto';

export interface Professional {
  id: string;
  code: string; // e.g. "CONS-HCM-01"
  name: string;
  email: string;
  phone?: string;
  roleTitle: string; // e.g. "Consultor Senior SAP HCM & Nómina"
  moduleCode: SapModuleCode;
  moduleName: string;
  seniority: SeniorityLevel;
  location: string; // e.g. "Santiago, Chile"
  modality: 'Remoto' | 'Híbrido' | 'Presencial';
  status: 'Disponible' | 'En Asignación' | 'Parcial';
  rates: {
    UF: number;
    CLP: number;
    USD: number;
    MXN: number;
  };
  costRates?: {
    UF?: number;
    CLP?: number;
    USD?: number;
    MXN?: number;
  };
  skills: string[];
  certifications?: string[];
  bio?: string;
  active: boolean;
}

export type ResourceStaffingType = 'internal' | 'external';

export interface SapResourceItem {
  id: string;
  moduleCode: SapModuleCode;
  moduleName: string;
  roleTitle: string;
  seniority: SeniorityLevel;
  hours: number;
  hourlyRate: number;
  subtotal: number;
  modality: 'Remoto' | 'Híbrido' | 'Presencial';
  responsibilities?: string;
  professionalId?: string; // Optional link to catalog professional
  professionalName?: string; // e.g. "Diego Rodrigues"
  staffingType?: ResourceStaffingType; // 'internal' (default) | 'external'
  supplierName?: string; // Proveedor / Subcontratista externo (ej. "Accenture", "NTT Data", "Consultor Freelance")
  supplierTaxId?: string; // RUT / Tax ID proveedor
  supplierContact?: string;
  externalCostRate?: number; // Tarifa costo / compra pactada con el proveedor
  solpedId?: string; // ID de la Solicitud de Pedido generada
  solpedNumber?: string; // Código SAP SOLPED (ej. "10000042")
  solpedPosition?: number; // Posición dentro de la SOLPED (ej. 10, 20)
  purchaseOrderId?: string; // ID de la Orden de Compra
  purchaseOrderNumber?: string; // Código SAP OC (ej. "45000012")
}

export interface MilestoneItem {
  id: string;
  title: string;
  description: string;
  deliverables: string;
  estimatedWeek: string;
  paymentPercentage: number;
}

export interface QuotationStatusLog {
  id: string;
  date: string;
  status: QuotationStatus;
  note: string;
  author: string;
}

export interface ClientInfo {
  companyName: string; // Razón Social registrada en SII
  fantasyName?: string; // Nombre de Fantasía / Comercial (ej. "Twin Ducks Capital")
  taxId: string; // RUT con formato oficial (ej. "76.452.890-3")
  businessActivity?: string; // Giro Comercial según SII
  siiActivityCode?: string; // Código de actividad SII (ej. "649900")
  taxAddress?: string; // Dirección Tributaria / Domicilio Legal
  comuna?: string; // Comuna (ej. "Las Condes", "Providencia")
  city?: string; // Ciudad / Región
  country: string;
  contactName: string;
  contactRole: string;
  contactEmail: string;
  contactPhone: string;
  billingEmail?: string; // Correo de facturación electrónica DTE
  industry: string;
  logoUrl?: string; // Logo del cliente (Base64 data URL o imagen)
  notes?: string;
}

export interface ClientMasterItem extends ClientInfo {
  id: string;
  createdAt: string;
  updatedAt: string;
  active: boolean;
}

export interface CompanyProfile {
  name: string; // Marca / Nombre de Fantasía (ej. "SAP & TECH CONSULTING")
  subheading: string; // Subtítulo (ej. "ENTERPRISE SOLUTIONS GROUP")
  legalName: string; // Razón Social según SII (ej. "SAP & Tech Consulting SpA")
  taxId: string; // RUT de la consultora (ej. "77.654.321-8")
  businessActivity: string; // Giro Comercial SII
  siiActivityCode?: string; // ej. "620200"
  taxAddress: string; // Dirección Tributaria (ej. "Av. Apoquindo 4501, Piso 14, Of. 1402")
  comuna: string; // ej. "Las Condes"
  city: string; // ej. "Santiago"
  region: string; // ej. "Región Metropolitana"
  country: string; // ej. "Chile"
  phone: string; // ej. "+56 2 2987 6543"
  email: string; // ej. "contacto@techconsulting.cl"
  website: string; // ej. "www.techconsulting.cl"
  logoUrl?: string; // Logo de la empresa (Base64 data URL o URL de imagen)
  legalRepresentative?: {
    name: string;
    taxId: string;
    role: string;
    email?: string;
    phone?: string;
  };
}

export type ProjectType = 
  | 'Implementación Greenfield' 
  | 'Conversión S/4HANA' 
  | 'Roll-out de Módulos' 
  | 'Soporte AMS / Bolsa de Horas' 
  | 'Fábrica ABAP / Fiori' 
  | 'Auditoría & Optimización'
  | 'Proceso de Remuneraciones (Payroll)'
  | 'Reclutamiento, Selección & Headhunting';

export interface SapProjectScope {
  projectTitle: string;
  projectType: ProjectType;
  businessObjective: string;
  methodology: 'SAP Activate' | 'ASAP Clásica' | 'Ágil / Scrum Híbrido';
  durationMonths: number;
  estimatedStartDate: string;
  sapSystemVersion: string; // e.g. SAP S/4HANA 2023 On-Premise, SAP S/4HANA Cloud Private, SAP ECC 6.0 EHP8
  scopeDescription: string;
  assumptions: string[];
  outOfScope: string[];
}

// =======================================================
// Servicios de Proceso de Remuneraciones (Payroll Outsourcing)
// =======================================================
export interface PayrollCustomService {
  id: string;
  name: string; // e.g. "Contabilización de remuneraciones para SAP FI / otros ERPs", "Generación de archivo Previred y Bancos"
  description?: string;
  quantity: number;
  unitPriceUF: number; // Precio unitario en UF
  subtotalUF: number;
}

export interface PayrollServiceConfig {
  enabled: boolean;
  // 1. Procesar pago de remuneraciones
  payrollHeadcount: number; // Cantidad de personas a Procesar pago de remuneraciones
  payrollRatePerPersonUF: number; // UF / Persona
  payrollSubtotalUF: number;

  // 2. Control de asistencia
  attendanceHeadcount: number; // Cantidad de personas Control de asistencia
  attendanceRatePerPersonUF: number; // UF / Persona
  attendanceSubtotalUF: number;

  // 3. Otros servicios desarrollados a medida (e.g. contabilización para otros sistemas)
  customServices: PayrollCustomService[];
  customServicesTotalUF: number;

  // Total acumulado del servicio en UF
  totalUF: number;
}

// =======================================================
// Servicios de Reclutamiento, Selección / Headhunting
// =======================================================
export interface RecruitmentActivityItem {
  id: string;
  activityName: string; // "Entrevistas varias", "Descripción de Cargo / Levantamiento de Perfil", "Evaluación Psicolaboral & Informe", "Assessment Center"
  description?: string;
  quantity: number;
  ratePerActivityUF: number; // UF / Actividad
  subtotalUF: number;
}

export interface RecruitmentServiceConfig {
  enabled: boolean;
  processType: string; // e.g. "Proceso Hunting", "Búsqueda Ejecutiva C-Level", "Headhunting Consultor SAP Senior", "Selección Masiva"
  
  // Costo una renta Bruta ($ o CLP / UF)
  includeGrossSalaryFee: boolean; // Si se cobra 1 renta bruta como tarifa / fee de éxito
  grossSalaryAmount: number; // Monto de 1 renta bruta en pesos ($) o UF
  grossSalaryCurrency: 'CLP' | 'UF' | 'USD';
  grossSalaryFeePercentage: number; // Porcentaje aplicable de la renta bruta (ej: 100% = 1 renta bruta completa)
  grossSalaryFeeTotalUF: number; // Contravalor en UF del fee de renta bruta

  // Actividades de entrevistas varias o descripción de cargo
  activities: RecruitmentActivityItem[];
  activitiesTotalUF: number;

  // Total acumulado del servicio en UF
  totalUF: number;
}

export type DocumentLanguage = 'es' | 'en' | 'pt';

export interface LanguageOption {
  code: DocumentLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'es', name: 'Español', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'Inglés', nativeName: 'English', flag: '🇺🇸' },
  { code: 'pt', name: 'Portugués', nativeName: 'Português', flag: '🇧🇷' }
];

export interface Quotation {
  id: string;
  code: string; // e.g. "COT-SAP-2026-004"
  version: string; // e.g. "1.0"
  createdAt: string;
  validUntil: string;
  currency: 'USD' | 'EUR' | 'CLP' | 'MXN' | 'COP' | 'UF';
  currencySymbol: string;
  status: QuotationStatus;
  rejectionReason?: string;
  
  client: ClientInfo;
  project: SapProjectScope;
  resources: SapResourceItem[];
  milestones: MilestoneItem[];

  // Servicios Especializados Adicionales
  payrollService?: PayrollServiceConfig;
  recruitmentService?: RecruitmentServiceConfig;
  
  // Financials
  discountPercentage: number;
  taxRatePercentage: number; // e.g. 19% IVA, 16%, 0%
  expensesAmount: number; // Viáticos / viajes estimados si aplican
  paymentTerms: string; // e.g. "30 días fecha factura según hitos de aceptación"
  guaranteeHypercareDays: number; // e.g. 30 días de hipercare post Go-Live
  
  // Tracking & Execution Handover
  statusHistory: QuotationStatusLog[];
  handoverNotes?: string;
  executionAssignedPM?: string;
  actualProjectCode?: string;
  updatedAt: string;

  // Planificación Ejecutiva Gantt SAP
  ganttPlan?: ProjectPlan;

  // Dossier Editorial (Estilo Bridev) Inputs
  currentSituationHoy?: string;
  builtSolutionQuedaConstruido?: string;
  gatekeeperCondition?: string;
  riskItems?: RiskMitigationItem[];
  outOfScopeCategories?: OutOfScopeCategoryItem[];
  commercialLead?: CommercialLeadInfo;
  clientSigner?: ClientSignerInfo;
  confidentialityMonths?: number;
  validityDays?: number;
  coverTheme?: 'alpine' | 'corporate' | 'datacenter';
  colorPalette?: DossierColorPaletteId;
  documentLanguage?: DocumentLanguage;
}

export type DossierColorPaletteId = 
  | 'enterprise-logistics' 
  | 'eco-cool-chain' 
  | 'minimal-industrial' 
  | 'deep-ocean-neon';

export interface RiskMitigationItem {
  id: string;
  risk: string;
  impact: string;
  mitigation: string;
  owner: 'Cliente' | 'Consultora' | 'Ambos' | 'Client' | 'Consulting Firm' | 'Both Parties' | 'Consultoria' | 'Ambas as Partes' | string;
}

export interface OutOfScopeCategoryItem {
  id: string;
  title: string;
  description: string;
}

export interface CommercialLeadInfo {
  name: string;
  role: string;
  email: string;
  phone: string;
  location: string;
}

export interface ClientSignerInfo {
  name: string;
  taxId: string;
  role: string;
  email?: string;
}

// ==========================================
// SAP MM PROCUREMENT & SERVICES SUBCONTRACTING
// ==========================================

export type SolpedStatus = 
  | 'draft'               // Borrador inicial
  | 'pending_approval'   // Pendiente de Estrategia de Liberación (ME54N)
  | 'approved'           // Liberada / Aprobada para compras
  | 'converted_to_po'    // Convertida en Orden de Compra (ME21N)
  | 'rejected';          // Rechazada

export type PurchaseOrderStatus = 
  | 'draft'              // Borrador de pedido
  | 'pending_approval'   // Pendiente de Autorización / Liberación
  | 'authorized'         // Autorizada / Aprobada (ME28 / ME29N)
  | 'issued'             // Emitida formalmente
  | 'sent_to_vendor'     // Enviada al Proveedor
  | 'in_execution'       // En ejecución de servicios (con HES)
  | 'completed'          // Completada / Concluida
  | 'rejected'           // Rechazada
  | 'cancelled';         // Cancelada

export type SapAccountAssignmentType = 'P' | 'K'; // 'P' = Elemento PEP (Proyecto), 'K' = Centro de Coste (CeCo)
export type SapItemCategory = 'D' | 'F';          // 'D' = Servicio SAP, 'F' = Servicio Externo S/4

/**
 * Solicitud de Pedido de Servicio SAP (SOLPED - Transacción ME51N / ME52N / ME53N)
 */
export interface ServicePurchaseRequisition {
  id: string;
  solpedNumber: string;                 // e.g. "10000042" (rango numérico SAP de 10 dígitos)
  documentType: 'NB' | 'ZSRV';          // NB = Estándar, ZSRV = Servicios Externos
  itemCategory: SapItemCategory;        // 'D' = Posición de Servicio
  accountAssignmentCategory: SapAccountAssignmentType; // 'P' (PEP) o 'K' (CeCo)
  pepElement: string;                   // e.g. "PEP-PRJ-2026-002.1"
  costCenter?: string;                  // e.g. "CC-10200"
  
  // Vínculo con la Cotización Comercial
  quotationId: string;
  quotationCode: string;                // e.g. "COT-SAP-2026-002"
  clientCompanyName: string;            // e.g. "Inversiones Twin Ducks Capital SpA"
  projectTitle: string;
  
  // Detalle del Servicio Subcontratado
  resourceId: string;
  positionNumber: number;               // 10, 20, 30...
  roleTitle: string;                    // e.g. "Consultor Líder de Nómina SAP HCM México"
  moduleCode: SapModuleCode;
  moduleName: string;
  seniority: SeniorityLevel;
  supplierName: string;                 // Proveedor sugerido / Subcontratista
  supplierTaxId?: string;
  
  // Magnitudes y Costeo
  hours: number;                        // Horas requeridas
  unit: 'HUR';                          // Unidad de medida estándar SAP
  hourlyRate: number;                   // Tarifa compra/costo pactada
  currency: SupportedCurrency;
  currencySymbol: string;
  totalAmount: number;                  // Importe estimado de la SOLPED
  
  // Ciclo de Vida & Liberación (ME54N)
  status: SolpedStatus;
  releaseStrategy?: {
    group: string;                      // e.g. "SR" (Servicios)
    code: string;                       // e.g. "L1", "L2"
    releasedBy?: string;
    releasedAt?: string;
  };
  requisitioner: string;                // e.g. "PMO Lead / Jefe de Proyecto SAP"
  professionalId?: string;              // ID del profesional del catálogo
  professionalName?: string;            // Nombre del profesional del catálogo
  createdAt: string;
  convertedPoId?: string;
  convertedPoNumber?: string;
  notes?: string;
}

/**
 * Hoja de Entrada de Servicios SAP (HES / Service Entry Sheet - Transacción ML81N)
 */
export interface ServiceEntrySheet {
  id: string;
  hesNumber: string;                    // e.g. "100021"
  date: string;
  hoursDelivered: number;
  unit: 'HUR';
  hourlyRate: number;
  totalAmount: number;
  description: string;                  // e.g. "Horas ejecutadas Sprint 1 - Parametrización Nómina"
  consultantName: string;
  acceptedBy: string;                   // e.g. "Gerente de Proyecto / Roberto Valenzuela"
  accepted: boolean;
  status: 'draft' | 'approved' | 'invoiced';
}

/**
 * Pedido / Orden de Compra de Servicio SAP (OC - Transacción ME21N / ME22N / ME23N)
 */
export interface ServicePurchaseOrder {
  id: string;
  poNumber: string;                     // e.g. "4500000101" (rango numérico 45xxxxxx en SAP MM)
  solpedId: string;
  solpedNumber: string;
  documentType: 'NB' | 'ZSRV';
  
  // Trazabilidad comercial
  quotationId: string;
  quotationCode: string;
  clientCompanyName: string;
  projectTitle: string;
  
  // Proveedor Adjudicado (Acreedor / Vendor)
  supplierName: string;
  supplierTaxId: string;
  supplierEmail?: string;
  supplierContact?: string;
  paymentTerms: string;                 // e.g. "30 días contra HES aprobada y Factura Electrónica"
  
  // Servicio Contratado
  roleTitle: string;
  moduleCode: SapModuleCode;
  hoursContracted: number;
  hourlyRate: number;
  currency: SupportedCurrency;
  currencySymbol: string;
  netAmount: number;
  taxRatePercentage: number;
  taxAmount: number;
  totalAmount: number;
  
  // Imputación Contable
  pepElement: string;
  costCenter?: string;
  
  // Fechas de validez
  issueDate: string;
  estimatedDeliveryDate: string;
  
  // Estado y Hojas de Entrada de Servicios
  status: PurchaseOrderStatus;
  serviceEntrySheets: ServiceEntrySheet[];
  buyerNotes?: string;
  companySigner?: string;

  // Posiciones de la Orden de Compra (si consolida múltiples especialistas de la misma SOLPED)
  items?: ServicePoItem[];
}

/**
 * Posición individual de una Orden de Compra de Servicio
 */
export interface ServicePoItem {
  positionNumber: number;
  roleTitle: string;
  moduleCode?: SapModuleCode;
  seniority?: string;
  hours: number;
  hourlyRate: number;
  totalAmount: number;
  pepElement?: string;
  costCenter?: string;
  resourceId?: string;
}

// ==========================================
// SAP EXECUTIVE GANTT CHART PLANNING MODULE
// ==========================================
export type DurationUnit = 'weeks' | 'days';
export type StartType = 'sequential' | 'custom_date' | 'offset';
export type MilestoneIconType = 'star' | 'flag' | 'rocket' | 'check' | 'target' | 'diamond';
export type CountryCode = 'CL' | 'MX' | 'ES' | 'CO' | 'AR' | 'PE' | 'US' | 'NONE';

export interface CalendarConfig {
  country: CountryCode;
  includeHolidays: boolean;
  workingDaysPerWeek: 5 | 6 | 7;
  customHolidays?: string[];
}

export interface Stage {
  id: string;
  name: string;
  duration: number;
  durationUnit: DurationUnit;
  startType: StartType;
  customStartDate?: string;
  customEndDate?: string;
  offsetFromPrevious?: number;
  isMilestone?: boolean;
  milestoneIcon?: MilestoneIconType;
  customColor?: string;
  progress?: number;
  notes?: string;
  responsible?: string;
}

export interface ColorTheme {
  id: string;
  name: string;
  sapFamily: string;
  barColor: string;
  barHover: string;
  barText: string;
  accentColor: string;
  milestoneColor: string;
  headerBg: string;
  gridColor: string;
  previewBg: string;
  badgeBg: string;
}

export interface ProjectSettings {
  id: string;
  title: string;
  subtitle?: string;
  companyOrArea?: string;
  startDate: string;
  themeId: string;
  calendar: CalendarConfig;
  showWeekNumbers: boolean;
  showDateBadges: boolean;
  showDurationOnBars: boolean;
  showProgress: boolean;
  showResponsible: boolean;
  showGridLines: boolean;
  showHolidaysNotice: boolean;
  aspectRatio: '16:9' | '4:3' | 'auto';
  presentationWindow?: 'auto' | '1_month' | '2_months' | '3_months' | '4_months' | '6_months' | '12_months';
  barStyle: 'rounded' | 'pills' | 'minimal';
  labelPosition: 'beside' | 'inside' | 'auto';
  backgroundStyle: 'white' | 'subtle-slate' | 'navy-dark' | 'sap-fiori';
}

export interface ProjectPlan {
  settings: ProjectSettings;
  stages: Stage[];
}

export interface ComputedStage extends Stage {
  computedStartDate: Date;
  computedEndDate: Date;
  startDayOffset: number;
  durationDays: number;
  workingDaysCount: number;
  holidaysEncountered: { date: string; name: string }[];
  leftPercent: number;
  widthPercent: number;
}

export interface TimelineBounds {
  startDate: Date;
  endDate: Date;
  totalDays: number;
  months: {
    name: string;
    year: number;
    startDate: Date;
    endDate: Date;
    widthPercent: number;
    leftPercent: number;
    weeks: {
      weekNum: number;
      label: string;
      startDate: Date;
      widthPercent: number;
      leftPercent: number;
    }[];
  }[];
}

// ==========================================
// MAESTRO DE PROVEEDORES (SAP MM VENDOR MASTER - SII CHILE & INTERNACIONAL)
// ==========================================

export type SupplierStatus = 'active' | 'blocked' | 'under_review' | 'inactive';

export type SupplierTaxCategory = 
  | 'Primera Categoría'        // Empresas SpA, S.A., Ltda., EIRL (Afectas a Impuesto de Primera Categoría)
  | 'Segunda Categoría'        // Personas Naturales / Profesionales (Boletas de Honorarios)
  | 'No Domiciliado';          // Proveedor Extranjero (Invoice Internacional, sujeto o exento de Impuesto Adicional Art. 59 LIR)

export type SupplierDteType = 
  | 'Factura Electrónica Afecta (19%)'
  | 'Factura Electrónica Exenta de IVA'
  | 'Boleta de Honorarios Electrónica'
  | 'Invoice Internacional / Factura Extranjera';

export interface SupplierBankAccount {
  bankName: string;
  accountType: 'Cuenta Corriente' | 'Cuenta Vista / RUT' | 'Checking' | 'Savings' | 'Wire Internacional';
  accountNumber: string;
  swiftCode?: string;
  iban?: string;
  routingNumber?: string;
  holderName?: string;
  holderTaxId?: string;
}

export interface SupplierSpecialistRate {
  id: string;
  specialty: string;              // ej. "DEV_ABAP", "SAP_FICO", "SAP_MM"
  roleTitle?: string;             // ej. "Consultor Senior ABAP", "Arquitecto FICO"
  seniority?: SeniorityLevel;     // 'Junior' | 'Semi-Senior' | 'Senior' | 'Lead / Arquitecto'
  hourlyRate: number;             // Tarifa horaria en la moneda del proveedor (ej. 2.20 UF o 75000 CLP)
  dailyRate?: number;             // Tarifa diaria referencial (8 horas)
  notes?: string;
}

export interface SupplierMasterItem {
  id: string;
  vendorCode: string;              // Código SAP Acreedor / Proveedor (ej. "LIFNR-10020" o "PRV-001")
  
  // Identificación Legal & Tributaria (SII Chile / Extranjero)
  taxId: string;                   // RUT chileno (ej. "76.432.190-8") o Tax ID extranjero (RFC, EIN, CIF, etc.)
  legalName: string;               // Razón Social registrada ante el SII u organismo fiscal
  fantasyName?: string;            // Nombre de Fantasía o Comercial
  siiActivityCode?: string;        // Código Actividad Económica SII (ej. "620100", "620200")
  businessActivity?: string;       // Giro comercial oficial ante el SII
  taxCategory: SupplierTaxCategory;
  dteType: SupplierDteType;
  dteBillingEmail?: string;        // Casilla oficial de intercambio DTE del SII
  siiStatusValid?: boolean;        // Verificación tributaria SII (Sin inconcurrencias, iniciación de actividades vigente)
  
  // Domicilio Fiscal
  address: string;                 // Calle y número
  officeOrSuite?: string;          // Oficina / Depto / Piso
  comuna: string;                  // Comuna (Chile) o Municipio / Condado
  city: string;                    // Ciudad
  regionOrState?: string;          // Región (ej. "Región Metropolitana", "Valparaíso", "CDMX", "California")
  country: string;                 // País (Chile, México, España, Estados Unidos, Colombia, Argentina, etc.)
  isForeign: boolean;              // true si no es domiciliado en Chile
  
  // Atributos de Moneda de Cobro & Tarifas por Especialista
  billingCurrency: SupportedCurrency;   // Moneda principal en la que cobra (UF, CLP, USD, EUR, MXN, etc.)
  acceptedCurrencies: SupportedCurrency[]; // Monedas que acepta para órdenes y facturación
  defaultHourlyRate?: number;           // Tarifa por hora referencial (o promedio de especialistas)
  hourlyRateCurrency?: SupportedCurrency;
  specialistRates?: SupplierSpecialistRate[]; // Tarifas individualizadas por especialista / módulo SAP
  paymentTerms: string;                 // ej. "30 días fecha factura", "Contado contra HES aprobada", "60 días"
  bankAccount?: SupplierBankAccount;
  
  // Capacidades Técnicas & Servicios
  specialties: string[];           // ej. ["SAP ABAP", "SAP FICO", "SAP MM", "S/4HANA Migration", "SAP BTP"]
  seniorityLevels: SeniorityLevel[]; // ej. ["Senior", "Lead / Arquitecto"]
  website?: string;
  
  // Datos de Contacto Comercial y Operativo
  contactName: string;
  contactRole: string;
  contactEmail: string;
  contactPhone: string;
  
  // Estado & Bloqueo (Transacción SAP XK05 - Bloqueo de Compras)
  status: SupplierStatus;
  isBlocked: boolean;
  blockingReason?: string;         // Motivo del bloqueo registrado
  blockedAt?: string;              // Fecha y hora del bloqueo
  blockedBy?: string;              // Usuario o rol que ejecutó el bloqueo
  
  // Evaluación y Auditoría
  rating?: number;                 // 1 a 5 estrellas
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

