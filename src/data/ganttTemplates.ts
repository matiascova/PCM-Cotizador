import { ColorTheme, ProjectPlan } from '../types';

export const GANTT_COLOR_THEMES: ColorTheme[] = [
  {
    id: 'sap-fiori-horizon',
    name: 'SAP S/4HANA Fiori Horizon (Morning)',
    sapFamily: 'SAP Horizon Morning',
    barColor: 'bg-[#C7E0F8] border border-[#85B8E8] text-[#00386B]',
    barHover: 'hover:bg-[#B2D5F5]',
    barText: 'text-[#00386B]',
    accentColor: '#0070F2',
    milestoneColor: 'bg-[#FEE6C0] border-2 border-[#E9730C] text-[#C05600]',
    headerBg: 'bg-white',
    gridColor: 'border-slate-200/70',
    previewBg: 'bg-[#F5F7FA]',
    badgeBg: 'bg-[#EBF3FC] text-[#0070F2]',
  },
  {
    id: 'sap-quartz-light',
    name: 'SAP S/4HANA Quartz Light (Fiori 3)',
    sapFamily: 'SAP Fiori Quartz',
    barColor: 'bg-[#D4E5F7] border border-[#91BBDF] text-[#0A2942]',
    barHover: 'hover:bg-[#C2DAF3]',
    barText: 'text-[#0A2942]',
    accentColor: '#0A6ED1',
    milestoneColor: 'bg-[#FFE082] border-2 border-[#F57C00] text-[#E65100]',
    headerBg: 'bg-white',
    gridColor: 'border-slate-200/80',
    previewBg: 'bg-white',
    badgeBg: 'bg-[#EBF3FC] text-[#0A6ED1]',
  },
  {
    id: 'sap-activate-classic',
    name: 'SAP Activate Metodología (Azul Corporativo)',
    sapFamily: 'SAP Activate',
    barColor: 'bg-[#D0E2FF] border border-[#6EA8FE] text-[#002B49]',
    barHover: 'hover:bg-[#BAC8FF]',
    barText: 'text-[#002B49]',
    accentColor: '#005FB8',
    milestoneColor: 'bg-[#FFECB3] border-2 border-[#FFA000] text-[#FF6F00]',
    headerBg: 'bg-white',
    gridColor: 'border-slate-200/70',
    previewBg: 'bg-white',
    badgeBg: 'bg-[#E8F0FE] text-[#005FB8]',
  },
  {
    id: 'sap-horizon-dark',
    name: 'SAP S/4HANA Evening Horizon (Dark)',
    sapFamily: 'SAP Horizon Dark',
    barColor: 'bg-[#183659] border border-[#37699E] text-[#F3F7FA]',
    barHover: 'hover:bg-[#204774]',
    barText: 'text-[#F3F7FA]',
    accentColor: '#4DB1FF',
    milestoneColor: 'bg-[#803E00]/60 border-2 border-[#FFA726] text-[#FFE082]',
    headerBg: 'bg-[#0F1E2E]',
    gridColor: 'border-[#1E3347]',
    previewBg: 'bg-[#0B1521]',
    badgeBg: 'bg-[#162D44] text-[#4DB1FF]',
  },
  {
    id: 'sap-sustainability-green',
    name: 'SAP Green Ledger & Sostenibilidad',
    sapFamily: 'SAP Sustainability',
    barColor: 'bg-[#D1F0DE] border border-[#86D9A5] text-[#0B4622]',
    barHover: 'hover:bg-[#BBEACF]',
    barText: 'text-[#0B4622]',
    accentColor: '#107E3E',
    milestoneColor: 'bg-[#FFE6B3] border-2 border-[#E69A00] text-[#B87000]',
    headerBg: 'bg-white',
    gridColor: 'border-slate-200/70',
    previewBg: 'bg-white',
    badgeBg: 'bg-[#EAF6EF] text-[#107E3E]',
  },
];

export interface GanttTemplatePreset {
  id: string;
  name: string;
  category: string;
  description: string;
  plan: ProjectPlan;
}

export const GANTT_TEMPLATES: GanttTemplatePreset[] = [
  {
    id: 'sap-activate-standard',
    name: 'Metodología Oficial SAP Activate (Prepare, Explore, Realize, Deploy, Run)',
    category: 'SAP Activate',
    description: 'Estándar global SAP Activate para implementaciones y migraciones en la nube u on-premise.',
    plan: {
      settings: {
        id: 'plan-activate-standard',
        title: 'Planificación Ejecutiva SAP Activate',
        subtitle: 'Cronograma Ejecutivo de Fases SAP',
        companyOrArea: 'Transformación Digital SAP',
        startDate: new Date().toISOString().slice(0, 10),
        themeId: 'sap-fiori-horizon',
        calendar: {
          country: 'CL',
          includeHolidays: true,
          workingDaysPerWeek: 5,
        },
        showWeekNumbers: true,
        showDateBadges: true,
        showDurationOnBars: true,
        showProgress: false,
        showResponsible: true,
        showGridLines: true,
        showHolidaysNotice: true,
        aspectRatio: '16:9',
        barStyle: 'rounded',
        labelPosition: 'beside',
        backgroundStyle: 'white',
      },
      stages: [
        {
          id: 'act-1',
          name: '1. Preparación y Arranque Inicial',
          duration: 1.5,
          durationUnit: 'weeks',
          startType: 'sequential',
          isMilestone: false,
          progress: 0,
          responsible: 'Project Manager SAP',
          notes: 'Alineación de gobernanza, accesos a sistemas y reunión de arranque.',
        },
        {
          id: 'act-2',
          name: '2. Exploración y Ajuste al Estándar (BBP)',
          duration: 3,
          durationUnit: 'weeks',
          startType: 'sequential',
          isMilestone: false,
          progress: 0,
          responsible: 'Líderes Funcionales SAP',
          notes: 'Talleres de mejores prácticas, procesos y especificaciones funcionales.',
        },
        {
          id: 'act-3',
          name: '3. Realización (Parametrización y Desarrollo ABAP)',
          duration: 5,
          durationUnit: 'weeks',
          startType: 'sequential',
          isMilestone: false,
          progress: 0,
          responsible: 'Consultores Funcionales y ABAP',
          notes: 'Parametrización customizing, desarrollos, interfaces y pruebas unitarias.',
        },
        {
          id: 'act-4',
          name: '4. Pruebas Integrales y Aceptación (UAT)',
          duration: 2.5,
          durationUnit: 'weeks',
          startType: 'sequential',
          isMilestone: false,
          progress: 0,
          responsible: 'Usuarios Clave y QA',
          notes: 'Pruebas extremo a extremo con validación y aceptación de usuarios clave.',
        },
        {
          id: 'act-5',
          name: '5. Despliegue y Transición Final (Cutover)',
          duration: 1.5,
          durationUnit: 'weeks',
          startType: 'sequential',
          isMilestone: false,
          progress: 0,
          responsible: 'Líder Basis y Migración',
          notes: 'Carga final de datos maestros, saldos contables y preparativos de salida.',
        },
        {
          id: 'act-6',
          name: '6. Salida en Vivo (Puesta en Marcha)',
          duration: 1,
          durationUnit: 'weeks',
          startType: 'sequential',
          isMilestone: true,
          milestoneIcon: 'star',
          progress: 0,
          responsible: 'Comité Directivo y Soporte',
          notes: 'Inicio formal de operación en productivo y soporte prioritario Hipercare.',
        },
      ],
    },
  },
  {
    id: 'sap-s4hana-implementation',
    name: 'Implementación SAP S/4HANA (Flujo Clásico Consecutivo)',
    category: 'SAP ERP',
    description: 'Cronograma consecutivo ejecutivo con las etapas estándar de un proyecto SAP S/4HANA.',
    plan: {
      settings: {
        id: 'plan-s4hana-classic',
        title: 'Implementación SAP S/4HANA',
        subtitle: 'Cronograma Ejecutivo de Fases',
        companyOrArea: 'Cadena de Suministro & ERP',
        startDate: new Date().toISOString().slice(0, 10),
        themeId: 'sap-fiori-horizon',
        calendar: {
          country: 'CL',
          includeHolidays: true,
          workingDaysPerWeek: 5,
        },
        showWeekNumbers: true,
        showDateBadges: true,
        showDurationOnBars: true,
        showProgress: false,
        showResponsible: true,
        showGridLines: true,
        showHolidaysNotice: true,
        aspectRatio: '16:9',
        barStyle: 'rounded',
        labelPosition: 'beside',
        backgroundStyle: 'white',
      },
      stages: [
        {
          id: 's1',
          name: 'Inicio de Proyecto y Lanzamiento',
          duration: 1,
          durationUnit: 'weeks',
          startType: 'sequential',
          isMilestone: false,
          progress: 0,
          responsible: 'Project Manager SAP',
          notes: 'Alineación de objetivos y kickoff con stakeholders.',
        },
        {
          id: 's2',
          name: 'Diseño y Definición de Procesos (BBP)',
          duration: 2.5,
          durationUnit: 'weeks',
          startType: 'sequential',
          isMilestone: false,
          progress: 0,
          responsible: 'Líder Funcional SAP',
          notes: 'Diseño detallado de procesos TO-BE y firma de alcance.',
        },
        {
          id: 's3',
          name: 'Realización y Configuración',
          duration: 4,
          durationUnit: 'weeks',
          startType: 'sequential',
          isMilestone: false,
          progress: 0,
          responsible: 'Consultores SAP y ABAP',
          notes: 'Parametrización del sistema y desarrollos a la medida.',
        },
        {
          id: 's4',
          name: 'Pruebas Integrales y Aceptación (UAT)',
          duration: 2,
          durationUnit: 'weeks',
          startType: 'sequential',
          isMilestone: false,
          progress: 0,
          responsible: 'Usuarios Clave y QA',
          notes: 'Validación de flujos end-to-end y aceptación formal.',
        },
        {
          id: 's5',
          name: 'Capacitación a Usuarios Finales',
          duration: 1.5,
          durationUnit: 'weeks',
          startType: 'sequential',
          isMilestone: false,
          progress: 0,
          responsible: 'Consultores y Gestión del Cambio',
          notes: 'Entrenamiento de operadores y entrega de manuales.',
        },
        {
          id: 's6',
          name: 'Transición y Carga de Datos (Cutover)',
          duration: 1,
          durationUnit: 'weeks',
          startType: 'sequential',
          isMilestone: false,
          progress: 0,
          responsible: 'Equipo Basis y Datos',
          notes: 'Congelamiento de datos, cargas finales y checklist de salida.',
        },
        {
          id: 's7',
          name: 'Salida en Vivo y Soporte Hipercare',
          duration: 1,
          durationUnit: 'weeks',
          startType: 'sequential',
          isMilestone: true,
          milestoneIcon: 'star',
          progress: 0,
          responsible: 'Comité Directivo y Soporte',
          notes: 'Go-Live oficial e inicio de soporte prioritario post puesta en marcha.',
        },
      ],
    },
  },
  {
    id: 'sap-rollout-enhancement',
    name: 'Roll-out de Módulos & Mejoras de Procesos SAP',
    category: 'Roll-out & AMS',
    description: 'Planificación ágil para incorporación de nuevos módulos (MM, SD, FICO, HCM) o mejoras.',
    plan: {
      settings: {
        id: 'plan-rollout',
        title: 'Roll-out Funcional SAP',
        subtitle: 'Cronograma Ejecutivo de Implementación',
        companyOrArea: 'Operaciones & Sistemas SAP',
        startDate: new Date().toISOString().slice(0, 10),
        themeId: 'sap-fiori-horizon',
        calendar: {
          country: 'CL',
          includeHolidays: true,
          workingDaysPerWeek: 5,
        },
        showWeekNumbers: true,
        showDateBadges: true,
        showDurationOnBars: true,
        showProgress: false,
        showResponsible: true,
        showGridLines: true,
        showHolidaysNotice: true,
        aspectRatio: '16:9',
        barStyle: 'rounded',
        labelPosition: 'beside',
        backgroundStyle: 'white',
      },
      stages: [
        {
          id: 'ro-1',
          name: 'Levantamiento y Definición',
          duration: 1,
          durationUnit: 'weeks',
          startType: 'sequential',
          isMilestone: false,
          responsible: 'Consultor Líder',
        },
        {
          id: 'ro-2',
          name: 'Configuración y Pruebas Unitarias',
          duration: 3,
          durationUnit: 'weeks',
          startType: 'sequential',
          isMilestone: false,
          responsible: 'Consultores Funcionales',
        },
        {
          id: 'ro-3',
          name: 'Pruebas Integradas con Usuarios',
          duration: 1.5,
          durationUnit: 'weeks',
          startType: 'sequential',
          isMilestone: false,
          responsible: 'Usuarios Clave',
        },
        {
          id: 'ro-4',
          name: 'Puesta en Productivo (Salida en Vivo)',
          duration: 1,
          durationUnit: 'weeks',
          startType: 'sequential',
          isMilestone: true,
          milestoneIcon: 'star',
          responsible: 'Líder de Proyecto',
        },
      ],
    },
  },
];

/**
 * Creates a default ProjectPlan adapted to the quotation's project metadata
 */
export function createDefaultGanttPlanForQuotation(
  projectTitle: string,
  startDate?: string,
  clientCountry?: string
): ProjectPlan {
  const base = GANTT_TEMPLATES[0].plan;
  const countryCode = (clientCountry?.toUpperCase() === 'CHILE' || clientCountry?.toUpperCase() === 'CL')
    ? 'CL'
    : (clientCountry?.toUpperCase() === 'MÉXICO' || clientCountry?.toUpperCase() === 'MEXICO' || clientCountry?.toUpperCase() === 'MX')
    ? 'MX'
    : (clientCountry?.toUpperCase() === 'ESPAÑA' || clientCountry?.toUpperCase() === 'ESPANA' || clientCountry?.toUpperCase() === 'ES')
    ? 'ES'
    : 'CL';

  return {
    settings: {
      ...base.settings,
      id: `plan-${Date.now()}`,
      title: projectTitle || 'Planificación Ejecutiva SAP',
      startDate: startDate || new Date().toISOString().slice(0, 10),
      calendar: {
        country: countryCode as any,
        includeHolidays: true,
        workingDaysPerWeek: 5,
      },
    },
    stages: JSON.parse(JSON.stringify(base.stages)),
  };
}

/**
 * Diccionario de equivalencias para migrar nombres de fases históricas o en inglés a español
 */
export const SPANISH_PHASE_NAMES_MAP: Record<string, string> = {
  // Plantilla SAP Activate estándar
  '1. Prepare & Kickoff Inicial': '1. Preparación y Arranque Inicial',
  '2. Explore & Fit-to-Standard (BBP)': '2. Exploración y Ajuste al Estándar (BBP)',
  '3. Realize (Parametrización & ABAP)': '3. Realización (Parametrización y Desarrollo ABAP)',
  '4. Pruebas Integrales & UAT': '4. Pruebas Integrales y Aceptación (UAT)',
  '5. Deploy & Cutover Final': '5. Despliegue y Transición Final (Cutover)',
  '6. Salida en Vivo (Go-Live)': '6. Salida en Vivo (Puesta en Marcha)',

  // Variantes sin numeración o variaciones comunes
  'Prepare & Kickoff Inicial': 'Preparación y Arranque Inicial',
  'Explore & Fit-to-Standard (BBP)': 'Exploración y Ajuste al Estándar (BBP)',
  'Realize (Parametrización & ABAP)': 'Realización (Parametrización y Desarrollo ABAP)',
  'Pruebas Integrales & UAT': 'Pruebas Integrales y Aceptación (UAT)',
  'Deploy & Cutover Final': 'Despliegue y Transición Final (Cutover)',
  'Salida en Vivo (Go-Live)': 'Salida en Vivo (Puesta en Marcha)',

  // Plantilla Implementación S/4HANA
  'Inicio de Proyecto & Gate 1': 'Inicio de Proyecto y Lanzamiento',
  'Business Blueprint (BBP)': 'Diseño y Definición de Procesos (BBP)',
  'Realización & Configuración': 'Realización y Configuración',
  'Capacitación Usuarios Finales': 'Capacitación a Usuarios Finales',
  'Cutover & Carga de Datos': 'Transición y Carga de Datos (Cutover)',
  'Salida en Vivo & Hipercare': 'Salida en Vivo y Soporte Hipercare',

  // Plantilla Roll-out
  'Levantamiento & Definición': 'Levantamiento y Definición',
  'Configuración & Pruebas Unitarias': 'Configuración y Pruebas Unitarias',
  'Puesta en Productivo (Go-Live)': 'Puesta en Productivo (Salida en Vivo)',
};

/**
 * Traduce y normaliza los nombres de las etapas de una Carta Gantt a español
 */
export function translateGanttPlanToSpanish(plan: ProjectPlan): ProjectPlan {
  if (!plan || !plan.stages) return plan;
  return {
    ...plan,
    stages: plan.stages.map((stage) => {
      const trimmedName = stage.name?.trim();
      const spanishName = SPANISH_PHASE_NAMES_MAP[trimmedName];
      if (spanishName) {
        return {
          ...stage,
          name: spanishName,
        };
      }
      return stage;
    }),
  };
}

