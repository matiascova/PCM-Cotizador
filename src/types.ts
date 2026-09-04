export type QuotationStatus = 'draft' | 'sent' | 'negotiation' | 'approved' | 'rejected';

export type SapModuleCode = 
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

export type SeniorityLevel = 'Junior' | 'Semi-Senior' | 'Senior' | 'Lead / Arquitecto';

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
  companyName: string;
  taxId: string; // RUT / RFC / NIF
  contactName: string;
  contactRole: string;
  contactEmail: string;
  contactPhone: string;
  industry: string;
  country: string;
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
}
