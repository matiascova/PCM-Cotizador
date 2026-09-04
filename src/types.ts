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

export interface SapProjectScope {
  projectTitle: string;
  projectType: 'Implementación Greenfield' | 'Conversión S/4HANA' | 'Roll-out de Módulos' | 'Soporte AMS / Bolsa de Horas' | 'Fábrica ABAP / Fiori' | 'Auditoría & Optimización';
  businessObjective: string;
  methodology: 'SAP Activate' | 'ASAP Clásica' | 'Ágil / Scrum Híbrido';
  durationMonths: number;
  estimatedStartDate: string;
  sapSystemVersion: string; // e.g. SAP S/4HANA 2023 On-Premise, SAP S/4HANA Cloud Private, SAP ECC 6.0 EHP8
  scopeDescription: string;
  assumptions: string[];
  outOfScope: string[];
}

export interface Quotation {
  id: string;
  code: string; // e.g. "COT-SAP-2026-004"
  version: string; // e.g. "1.0"
  createdAt: string;
  validUntil: string;
  currency: 'USD' | 'EUR' | 'CLP' | 'MXN' | 'COP';
  currencySymbol: string;
  status: QuotationStatus;
  rejectionReason?: string;
  
  client: ClientInfo;
  project: SapProjectScope;
  resources: SapResourceItem[];
  milestones: MilestoneItem[];
  
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
