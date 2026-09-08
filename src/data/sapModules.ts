import { SapModuleCode, SeniorityLevel } from '../types';
import { getBenchmarkRate, SupportedCurrency } from '../utils/currencies';

export interface SapCatalogModule {
  id?: string;
  code: SapModuleCode;
  name: string;
  shortName: string;
  category: 'Funcional' | 'Técnico' | 'Gestión' | 'Marketing / Digital' | 'Consultoría' | string;
  description: string;
  defaultResponsibilities: string;
  typicalDeliverables: string[];
  benchmarkRatesUSD: Record<SeniorityLevel, number>;
  customRates?: {
    CLP?: Record<SeniorityLevel, number>;
    UF?: Record<SeniorityLevel, number>;
    MXN?: Record<SeniorityLevel, number>;
    USD?: Record<SeniorityLevel, number>;
  };
}

const MODULES_STORAGE_KEY = 'sap_catalog_modules_v2';

/**
 * Obtiene el catálogo de módulos y perfiles desde LocalStorage (con fallback al catálogo inicial)
 */
export function getStoredModules(): SapCatalogModule[] {
  try {
    const data = localStorage.getItem(MODULES_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure standard modules like APP_AI are incorporated if not present in existing stored array
        const existingCodes = new Set(parsed.map((m: SapCatalogModule) => m.code));
        let changed = false;
        SAP_CATALOG_MODULES.forEach(catMod => {
          if (!existingCodes.has(catMod.code)) {
            parsed.push(catMod);
            changed = true;
          }
        });
        if (changed) {
          localStorage.setItem(MODULES_STORAGE_KEY, JSON.stringify(parsed));
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading sap modules from localStorage', e);
  }
  return SAP_CATALOG_MODULES;
}

/**
 * Guarda el catálogo de módulos y perfiles en LocalStorage
 */
export function saveStoredModules(modules: SapCatalogModule[]): void {
  try {
    localStorage.setItem(MODULES_STORAGE_KEY, JSON.stringify(modules));
  } catch (e) {
    console.error('Error saving sap modules to localStorage', e);
  }
}

/**
 * Restaura el catálogo de módulos a los valores originales predeterminados
 */
export function resetStoredModules(): SapCatalogModule[] {
  try {
    localStorage.removeItem(MODULES_STORAGE_KEY);
  } catch (e) {
    console.error('Error resetting sap modules in localStorage', e);
  }
  return SAP_CATALOG_MODULES;
}

export function getModuleBenchmarkRate(
  moduleOrCode: SapCatalogModule | SapModuleCode,
  seniority: SeniorityLevel,
  currency: string = 'USD'
): number {
  if (typeof moduleOrCode === 'string') {
    return getBenchmarkRate(moduleOrCode, seniority, currency);
  }

  const moduleObj = moduleOrCode;
  const curr = currency.toUpperCase() as SupportedCurrency;
  if (moduleObj.customRates && moduleObj.customRates[curr]?.[seniority] !== undefined) {
    return moduleObj.customRates[curr]![seniority]!;
  }
  if (moduleObj.benchmarkRatesUSD?.[seniority] !== undefined) {
    const usdRate = moduleObj.benchmarkRatesUSD[seniority];
    if (curr === 'USD') return usdRate;
    if (curr === 'UF') return Math.round((usdRate / 42.5) * 100) / 100;
    if (curr === 'CLP') return Math.round((usdRate * 980) / 1000) * 1000;
    if (curr === 'MXN') return Math.round((usdRate * 18.5) / 50) * 50;
  }
  return getBenchmarkRate(moduleObj.code, seniority, currency);
}

export const SAP_CATALOG_MODULES: SapCatalogModule[] = [
  {
    code: 'SAP_MM',
    name: 'SAP MM (Materials Management)',
    shortName: 'MM',
    category: 'Funcional',
    description: 'Gestión de compras, aprovisionamiento, inventarios, valoración de existencias y verificación de facturas.',
    defaultResponsibilities: 'Diseño BBP, configuración de estructura organizativa MM, tipos de material, contratos marco, MRP, determinación de cuentas y pruebas integrales.',
    typicalDeliverables: ['Documento BBP MM', 'Matriz de Parametrización SPRO', 'Guías de Pruebas UAT', 'Manuales de Usuario'],
    benchmarkRatesUSD: {
      'Junior': 45,
      'Semi-Senior': 65,
      'Senior': 90,
      'Lead / Arquitecto': 120
    }
  },
  {
    code: 'SAP_LE',
    name: 'SAP LE (Logistics Execution)',
    shortName: 'LE',
    category: 'Funcional',
    description: 'Expedición, entregas entrantes/salientes, gestión de transporte (LE-TRA) y gestión de almacenes (LE-WM/EWM).',
    defaultResponsibilities: 'Parametrización de puestos de expedición, rutas, clases de entrega, picking, packing, contabilización de salida de mercancías e interfases.',
    typicalDeliverables: ['Diseño Logístico BBP LE', 'Configuración de Rutas y Puestos', 'Escenarios de Expedición E2E'],
    benchmarkRatesUSD: {
      'Junior': 45,
      'Semi-Senior': 65,
      'Senior': 95,
      'Lead / Arquitecto': 125
    }
  },
  {
    code: 'SAP_PM',
    name: 'SAP PM (Plant Maintenance)',
    shortName: 'PM',
    category: 'Funcional',
    description: 'Gestión de mantenimiento de plantas, equipos técnicos, avisos de avería, órdenes de trabajo y planes preventivos.',
    defaultResponsibilities: 'Definición de ubicaciones técnicas, equipos, listas de materiales PM, órdenes de mantenimiento, integración con compras de repuestos MM y control de costes.',
    typicalDeliverables: ['Estructura Jerárquica de Activos', 'Catálogo de Planes Preventivos', 'Manual Operativo PM'],
    benchmarkRatesUSD: {
      'Junior': 45,
      'Semi-Senior': 65,
      'Senior': 90,
      'Lead / Arquitecto': 120
    }
  },
  {
    code: 'SAP_QM',
    name: 'SAP QM (Quality Management)',
    shortName: 'QM',
    category: 'Funcional',
    description: 'Planificación de inspecciones de calidad, lotes de inspección en compras y producción, gestión de no conformidades y certificados.',
    defaultResponsibilities: 'Configuración de características maestras de inspección, planes de muestreo, avisos de calidad Q1/Q2/Q3 y decisiones de empleo.',
    typicalDeliverables: ['Protocolo de Inspecciones QM', 'Plan de Muestreo Parametrizado', 'Formatos de Certificados'],
    benchmarkRatesUSD: {
      'Junior': 45,
      'Semi-Senior': 65,
      'Senior': 90,
      'Lead / Arquitecto': 120
    }
  },
  {
    code: 'SAP_HCM',
    name: 'SAP HCM (Human Capital Management)',
    shortName: 'HCM',
    category: 'Funcional',
    description: 'Gestión de personal (PA), estructura organizativa (OM), nómina / planilla (PY), gestión de tiempos (PT) y autoservicio.',
    defaultResponsibilities: 'Parametrización de esquemas de nómina, conceptos salariales, convenios colectivos, contingentes de tiempos y reportes laborales.',
    typicalDeliverables: ['Blueprint de Estructura Organizativa', 'Documento de Reglas de Nómina', 'Matriz de Conceptos de Pago'],
    benchmarkRatesUSD: {
      'Junior': 50,
      'Semi-Senior': 70,
      'Senior': 100,
      'Lead / Arquitecto': 130
    }
  },
  {
    code: 'DEV_ABAP',
    name: 'Desarrollador ABAP / Fiori',
    shortName: 'ABAP',
    category: 'Técnico',
    description: 'Desarrollo de mejoras RICEFW, ABAP RESTful Application Programming (RAP), CDS Views, APIs OData, aplicaciones SAPUI5/Fiori e integraciones.',
    defaultResponsibilities: 'Desarrollo de programas de carga, reportes analíticos, ampliaciones BAdI/User Exits, formularios Adobe Forms / SmartForms y servicios OData.',
    typicalDeliverables: ['Especificaciones Técnicas (TS)', 'Programas y BAdIs en DEV/QAS', 'Apps Fiori Desplegadas'],
    benchmarkRatesUSD: {
      'Junior': 40,
      'Semi-Senior': 60,
      'Senior': 85,
      'Lead / Arquitecto': 115
    }
  },
  {
    code: 'SAP_BASIS',
    name: 'Consultor SAP Basis / NetWeaver',
    shortName: 'Basis',
    category: 'Técnico',
    description: 'Administración de arquitectura de sistemas SAP, base de datos HANA, transporte STMS, upgrades, notas SAP, tuning y copias de mandante.',
    defaultResponsibilities: 'Monitoreo de rendimiento, sizing, instalación de componentes, configuración del Landscape DEV-QAS-PRD, backups y soporte a Go-Live cutover.',
    typicalDeliverables: ['Arquitectura de Landscape SAP', 'Checklist Técnico de Cutover', 'Procedimiento de Backups y Tuning'],
    benchmarkRatesUSD: {
      'Junior': 45,
      'Semi-Senior': 70,
      'Senior': 95,
      'Lead / Arquitecto': 130
    }
  },
  {
    code: 'SAP_SECURITY',
    name: 'Consultor de Seguridad y Autorizaciones SAP',
    shortName: 'Seguridad',
    category: 'Técnico',
    description: 'Diseño de matrices de roles y perfiles (PFCG), segregación de funciones (SoD), auditoría de accesos, catálogos Fiori y GRC.',
    defaultResponsibilities: 'Diseño de matriz de permisos por puesto, depuración de perfiles SAP_ALL, configuración de catálogos y grupos Fiori Launchpad, remediación de riesgos SoD.',
    typicalDeliverables: ['Matriz de Roles y Autorizaciones', 'Reporte de Análisis de Riesgos SoD', 'Roles PFCG Transportados'],
    benchmarkRatesUSD: {
      'Junior': 45,
      'Semi-Senior': 65,
      'Senior': 90,
      'Lead / Arquitecto': 125
    }
  },
  {
    code: 'SAP_FICO',
    name: 'SAP FICO (Financial & Controlling)',
    shortName: 'FICO',
    category: 'Funcional',
    description: 'Contabilidad general, cuentas por pagar/cobrar, activos fijos, centros de coste, centros de beneficio y órdenes internas.',
    defaultResponsibilities: 'Plan de cuentas, integración con MM/SD, determinación de cuentas contables, asientos automáticos y balance general.',
    typicalDeliverables: ['Plan Contable Parametrizado', 'Matriz de Integración FI-MM', 'Libros Legales'],
    benchmarkRatesUSD: {
      'Junior': 45,
      'Semi-Senior': 65,
      'Senior': 95,
      'Lead / Arquitecto': 125
    }
  },
  {
    code: 'SAP_PMO_LEAD',
    name: 'Project Manager SAP / Scrum Master',
    shortName: 'PMO',
    category: 'Gestión',
    description: 'Gestión integral del proyecto bajo metodología SAP Activate, control de hitos, gestión de riesgos, comités de dirección y control presupuestario.',
    defaultResponsibilities: 'Plan maestro de proyecto en MS Project/Smartsheet, gestión del comité de control de cambios, seguimiento diario a consultores y actas de aceptación.',
    typicalDeliverables: ['Plan Maestro de Proyecto', 'Matriz de Riesgos y Mitigación', 'Actas de Hitos y Cierre'],
    benchmarkRatesUSD: {
      'Junior': 45,
      'Semi-Senior': 70,
      'Senior': 95,
      'Lead / Arquitecto': 135
    }
  },
  {
    code: 'APP_AI',
    name: 'Arquitecto AI',
    shortName: 'AI',
    category: 'Consultoría',
    description: 'Perfil especializado en Arquitecto AI, soluciones de inteligencia artificial aplicada, LLMs e integración empresarial.',
    defaultResponsibilities: 'Diseño de arquitectura de IA, integración de modelos generativos, gobierno de datos, orquestación de prompts y agentes.',
    typicalDeliverables: ['Arquitectura de Solución IA', 'Diseño de Pipelines y Modelos', 'Guía de Pruebas y Evaluación'],
    benchmarkRatesUSD: {
      'Junior': 42,
      'Semi-Senior': 55,
      'Senior': 80,
      'Lead / Arquitecto': 110
    },
    customRates: {
      CLP: {
        'Junior': 40000,
        'Semi-Senior': 54000,
        'Senior': 78000,
        'Lead / Arquitecto': 108000
      }
    }
  }
];

export const SAP_DEFAULT_MILESTONES = [
  {
    title: 'Fase 1: Preparación y Kick-Off (Prepare)',
    description: 'Instalación de gobernanza, alineación metodológica SAP Activate, entrega de requerimientos técnicos y lanzamiento formal.',
    deliverables: 'Acta de Kick-Off, Cronograma Detallado, Validación de Accesos a Sistemas SAP DEV.',
    estimatedWeek: 'Sem. 1 - 2',
    paymentPercentage: 20
  },
  {
    title: 'Fase 2: Diseño y Business Blueprint (Explore)',
    description: 'Talleres de diseño funcional por módulo (MM, LE, PM, QM, HCM), definición de requerimientos y especificaciones RICEFW.',
    deliverables: 'Documentos BBP aprobados por Key Users, Catálogo de Gaps y Especificaciones Funcionales (FDD).',
    estimatedWeek: 'Sem. 3 - 6',
    paymentPercentage: 25
  },
  {
    title: 'Fase 3: Realización, Configuración y Desarrollos (Realize)',
    description: 'Parametrización SPRO de módulos, desarrollos ABAP, CDS Views, pruebas unitarias y pruebas integrales de sistema (SIT).',
    deliverables: 'Ambiente QAS configurado, transportes liberados, desarrollos probados y reporte de pruebas SIT.',
    estimatedWeek: 'Sem. 7 - 12',
    paymentPercentage: 25
  },
  {
    title: 'Fase 4: Preparación Final y Pruebas UAT (Deploy)',
    description: 'Pruebas de Aceptación de Usuario (UAT), capacitación a usuarios clave, plan de cutover y migración de datos maestros.',
    deliverables: 'Acta de Aceptación UAT firmada, Materiales de Capacitación y Plan de Puesta en Producción (Cutover).',
    estimatedWeek: 'Sem. 13 - 15',
    paymentPercentage: 15
  },
  {
    title: 'Fase 5: Go-Live y Soporte Hipercare (Run)',
    description: 'Pase a producción oficial, acompañamiento in situ/remoto a la operación real, resolución de incidencias prioritarias y cierre.',
    deliverables: 'Acta de Salida en Vivo (Go-Live), Informe de Cierre de Hipercare y Traspaso formal a Soporte AMS.',
    estimatedWeek: 'Sem. 16 - 18',
    paymentPercentage: 15
  }
];

export const STANDARD_ASSUMPTIONS = [
  'El cliente suministrará los accesos remotos VPN, credenciales y licencias SAP pertinentes en tiempo y forma.',
  'Los Key Users y usuarios líderes de proceso dispondrán de una dedicación mínima del 50% de su jornada laboral durante las fases de diseño y UAT.',
  'La extracción, limpieza y homologación de datos maestros de origen es responsabilidad exclusiva del equipo del cliente.',
  'El soporte Hipercare comprende una duración estándar de 30 días calendario post Go-Live para incidentes derivados de la implementación.'
];

export const STANDARD_OUT_OF_SCOPE = [
  'Adquisición de licencias de software SAP o bases de datos.',
  'Aprovisionamiento de infraestructura física o cloud no contemplada en el sizing.',
  'Desarrollos o requerimientos adicionales no aprobados en el documento BBP firmado (requerirán Change Request / Addendum).'
];
