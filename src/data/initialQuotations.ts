import { Quotation } from '../types';

export const INITIAL_QUOTATIONS: Quotation[] = [
  {
    id: 'quote-sap-001',
    code: 'COT-SAP-2026-001',
    version: '1.0',
    createdAt: '2026-08-15',
    validUntil: '2026-09-15',
    currency: 'USD',
    currencySymbol: '$',
    status: 'approved',
    client: {
      companyName: 'Minera Andina del Cobre S.A.',
      taxId: 'CL-76.452.890-3',
      contactName: 'Ing. Roberto Valenzuela',
      contactRole: 'Gerente de Transformación Digital y TI',
      contactEmail: 'rvalenzuela@mineraandina.com',
      contactPhone: '+56 9 8452 1190',
      industry: 'Minería & Recursos Naturales',
      country: 'Chile'
    },
    project: {
      projectTitle: 'Rollout Logístico, Mantenimiento y Calidad SAP MM, LE, PM y QM',
      projectType: 'Roll-out de Módulos',
      businessObjective: 'Digitalizar y estandarizar la cadena de abastecimiento, expediciones terrestres y planes de mantenimiento preventivo de plantas concentradoras bajo entorno SAP S/4HANA.',
      methodology: 'SAP Activate',
      durationMonths: 5,
      estimatedStartDate: '2026-10-01',
      sapSystemVersion: 'SAP S/4HANA 2023 On-Premise',
      scopeDescription: 'Implementación integral de procesos de aprovisionamiento estratégico y stock en consignación (MM), logística de despacho y transporte a puerto (LE), gestión de mantenimiento preventivo y correctivo de maquinaria pesada (PM) y control de calidad en recepción y despachos (QM). Incluye desarrollos ABAP RICEFW y configuración de roles de seguridad segregados.',
      assumptions: [
        'Disponibilidad del ambiente SAP S/4HANA DEV y Sandbox a partir de la semana 1.',
        'Dedicación del 50% de los Key Users de Abastecimiento, Mantenimiento y Calidad durante la fase Explore y UAT.',
        'La homologación y carga inicial de datos maestros de equipos y materiales es provista por el cliente.'
      ],
      outOfScope: [
        'Licencias de software SAP o add-ons de terceros.',
        'Módulos de SAP EWM descentralizado o SAP Ariba.'
      ]
    },
    resources: [
      {
        id: 'res-01',
        moduleCode: 'SAP_MM',
        moduleName: 'SAP MM (Materials Management)',
        roleTitle: 'Consultor Funcional Senior SAP MM',
        seniority: 'Senior',
        hours: 320,
        hourlyRate: 90,
        subtotal: 28800,
        modality: 'Híbrido',
        responsibilities: 'Parametrización SPRO compras, MRP, valoración de inventarios y pruebas UAT.'
      },
      {
        id: 'res-02',
        moduleCode: 'SAP_LE',
        moduleName: 'SAP LE (Logistics Execution)',
        roleTitle: 'Consultor Funcional Senior SAP LE',
        seniority: 'Senior',
        hours: 240,
        hourlyRate: 95,
        subtotal: 22800,
        modality: 'Híbrido',
        responsibilities: 'Configuración de rutas de expedición, despachos y picking con terminales.'
      },
      {
        id: 'res-03',
        moduleCode: 'SAP_PM',
        moduleName: 'SAP PM (Plant Maintenance)',
        roleTitle: 'Consultor Líder Especialista SAP PM',
        seniority: 'Lead / Arquitecto',
        hours: 320,
        hourlyRate: 120,
        subtotal: 38400,
        modality: 'Híbrido',
        responsibilities: 'Estructuración de ubicaciones técnicas, catálogo de averías y planes preventivos.'
      },
      {
        id: 'res-04',
        moduleCode: 'SAP_QM',
        moduleName: 'SAP QM (Quality Management)',
        roleTitle: 'Consultor Funcional Semi-Senior SAP QM',
        seniority: 'Semi-Senior',
        hours: 180,
        hourlyRate: 65,
        subtotal: 11700,
        modality: 'Remoto',
        responsibilities: 'Configuración de lotes de inspección y planes de muestreo de concentrado.'
      },
      {
        id: 'res-05',
        moduleCode: 'DEV_ABAP',
        moduleName: 'Desarrollador ABAP / Fiori',
        roleTitle: 'Desarrollador Senior ABAP Cloud & Fiori',
        seniority: 'Senior',
        hours: 280,
        hourlyRate: 85,
        subtotal: 23800,
        modality: 'Remoto',
        responsibilities: 'Desarrollo de 8 reportes ALV/CDS, 4 formularios Adobe Forms y 2 apps Fiori.'
      },
      {
        id: 'res-06',
        moduleCode: 'SAP_SECURITY',
        moduleName: 'Consultor de Seguridad y Autorizaciones SAP',
        roleTitle: 'Consultor de Seguridad & Roles PFCG',
        seniority: 'Senior',
        hours: 120,
        hourlyRate: 90,
        subtotal: 10800,
        modality: 'Remoto',
        responsibilities: 'Creación de matriz SoD, diseño y transporte de roles y catálogos Fiori.'
      },
      {
        id: 'res-07',
        moduleCode: 'SAP_BASIS',
        moduleName: 'Consultor SAP Basis / NetWeaver',
        roleTitle: 'Consultor Basis & Transporte',
        seniority: 'Semi-Senior',
        hours: 80,
        hourlyRate: 70,
        subtotal: 5600,
        modality: 'Remoto',
        responsibilities: 'Alineación de transportes STMS, notas SAP y soporte técnico a cutover.'
      },
      {
        id: 'res-08',
        moduleCode: 'SAP_PMO_LEAD',
        moduleName: 'Project Manager SAP / Scrum Master',
        roleTitle: 'Project Manager SAP Activate',
        seniority: 'Lead / Arquitecto',
        hours: 160,
        hourlyRate: 110,
        subtotal: 17600,
        modality: 'Híbrido',
        responsibilities: 'Gobernanza del proyecto, control de hitos, comités semanales y gestión de riesgos.'
      }
    ],
    milestones: [
      {
        id: 'm-1',
        title: 'Kick-off & Gobernanza de Proyecto',
        description: 'Lanzamiento formal, plan maestro y validación de ambientes.',
        deliverables: 'Acta de Kick-Off, Cronograma SAP Activate aprobado.',
        estimatedWeek: 'Semana 1 - 2',
        paymentPercentage: 20
      },
      {
        id: 'm-2',
        title: 'Business Blueprint (BBP) Logístico & Mantenimiento',
        description: 'Talleres de diseño funcional de MM, LE, PM, QM y especificaciones técnicas.',
        deliverables: 'Documentos BBP aprobados por Key Users y Comité de Proyecto.',
        estimatedWeek: 'Semana 3 - 7',
        paymentPercentage: 25
      },
      {
        id: 'm-3',
        title: 'Configuración SPRO & Desarrollos ABAP Finalizados',
        description: 'Parametrización en DEV, pruebas unitarias y pruebas integradas SIT en QAS.',
        deliverables: 'Ambiente QAS verificado con transportes y reporte SIT firmado.',
        estimatedWeek: 'Semana 8 - 14',
        paymentPercentage: 25
      },
      {
        id: 'm-4',
        title: 'Pruebas de Aceptación UAT & Capacitación',
        description: 'Ejecución de escenarios E2E por usuarios clave y plan de cutover.',
        deliverables: 'Acta de Aceptación UAT firmada y manuales operativos.',
        estimatedWeek: 'Semana 15 - 17',
        paymentPercentage: 15
      },
      {
        id: 'm-5',
        title: 'Puesta en Producción (Go-Live) & Hipercare',
        description: 'Salida en vivo y acompañamiento de 30 días post-productivo.',
        deliverables: 'Acta formal de Go-Live y reporte de cierre de Hipercare.',
        estimatedWeek: 'Semana 18 - 22',
        paymentPercentage: 15
      }
    ],
    discountPercentage: 5,
    taxRatePercentage: 19,
    expensesAmount: 3500,
    paymentTerms: 'Facturación según cumplimiento y firma de hitos (30 días fecha factura).',
    guaranteeHypercareDays: 30,
    statusHistory: [
      {
        id: 'log-1',
        date: '2026-08-15 10:30',
        status: 'draft',
        note: 'Cotización creada y estructurada con el equipo comercial y líderes de práctica.',
        author: 'Consultor Comercial SAP'
      },
      {
        id: 'log-2',
        date: '2026-08-18 16:00',
        status: 'sent',
        note: 'Propuesta formal y PDF enviados a Roberto Valenzuela por correo electrónico.',
        author: 'Consultor Comercial SAP'
      },
      {
        id: 'log-3',
        date: '2026-08-25 11:15',
        status: 'negotiation',
        note: 'Reunión de revisión técnica. Se acordó 5% de descuento por volumen de horas.',
        author: 'Director de Práctica SAP'
      },
      {
        id: 'log-4',
        date: '2026-09-02 14:20',
        status: 'approved',
        note: 'Propuesta aprobada por el Comité de Inversiones de Minera Andina. Lista para traspaso a ejecución.',
        author: 'Director de Práctica SAP'
      }
    ],
    handoverNotes: 'Proyecto adjudicado formalmente. El cliente solicita iniciar el Kick-off el 1 de Octubre. Se requiere reservar con anticipación los consultores Senior de PM y MM.',
    executionAssignedPM: 'Carlos Mendoza (PMP / SAP Activate Lead)',
    actualProjectCode: 'PRJ-SAP-2026-MIN01',
    updatedAt: '2026-09-02 14:20'
  },
  {
    id: 'quote-sap-002',
    code: 'COT-SAP-2026-002',
    version: '1.1',
    createdAt: '2026-08-28',
    validUntil: '2026-09-28',
    currency: 'USD',
    currencySymbol: '$',
    status: 'sent',
    client: {
      companyName: 'Alimentos del Pacífico S.A.',
      taxId: 'MX-ALM880922-K89',
      contactName: 'Lic. Claudia Morales',
      contactRole: 'Directora de Recursos Humanos & Talento',
      contactEmail: 'cmorales@alimentospacifico.mx',
      contactPhone: '+52 55 4912 8840',
      industry: 'Consumo Masivo / Alimentos',
      country: 'México'
    },
    project: {
      projectTitle: 'Implementación y Localización SAP HCM (Nómina, PA y OM)',
      projectType: 'Implementación Greenfield',
      businessObjective: 'Automatizar el cálculo de nómina para 2,800 colaboradores en 3 plantas industriales, integrando legislación laboral mexicana (SAT, IMSS, INFONAVIT) y autoservicio.',
      methodology: 'SAP Activate',
      durationMonths: 4,
      estimatedStartDate: '2026-10-15',
      sapSystemVersion: 'SAP S/4HANA Private Cloud',
      scopeDescription: 'Configuración completa de SAP HCM: Administración de Personal (PA), Gestión de la Estructura Organizativa (OM), Motor de Cálculo de Nómina (PY) con esquemas legales, cálculo de finiquitos, provisiones e interfaces de timbrado CFDI.',
      assumptions: [
        'El catálogo de conceptos salariales y fórmulas de cálculo actuales será entregado en la semana 2.',
        'Se realizarán dos pruebas de nómina en paralelo con el sistema anterior antes del Go-Live definitivo.'
      ],
      outOfScope: [
        'Módulo de Gestión de Desempeño SuccessFactors (fase futura).',
        'Relojes biométricos de marcación física.'
      ]
    },
    resources: [
      {
        id: 'res-hcm-01',
        moduleCode: 'SAP_HCM',
        moduleName: 'SAP HCM (Human Capital Management)',
        roleTitle: 'Consultor Líder de Nómina SAP HCM',
        seniority: 'Lead / Arquitecto',
        hours: 280,
        hourlyRate: 130,
        subtotal: 36400,
        modality: 'Híbrido',
        responsibilities: 'Diseño de esquemas y reglas de nómina mexicanas (MX), esquemas PCR y parametrización avanzada.'
      },
      {
        id: 'res-hcm-02',
        moduleCode: 'SAP_HCM',
        moduleName: 'SAP HCM (Human Capital Management)',
        roleTitle: 'Consultor Funcional Senior SAP HCM (PA/OM)',
        seniority: 'Senior',
        hours: 220,
        hourlyRate: 100,
        subtotal: 22000,
        modality: 'Remoto',
        responsibilities: 'Parametrización de estructura organizativa, infotipos de personal y medidas de contratación.'
      },
      {
        id: 'res-hcm-03',
        moduleCode: 'DEV_ABAP',
        moduleName: 'Desarrollador ABAP / Fiori',
        roleTitle: 'Desarrollador ABAP Especialista en Interfaces HCM',
        seniority: 'Senior',
        hours: 180,
        hourlyRate: 85,
        subtotal: 15300,
        modality: 'Remoto',
        responsibilities: 'Desarrollo de interfase de timbrado CFDI, póliza contable HCM-FI y reportes de liquidación.'
      },
      {
        id: 'res-hcm-04',
        moduleCode: 'SAP_SECURITY',
        moduleName: 'Consultor de Seguridad y Autorizaciones SAP',
        roleTitle: 'Consultor de Seguridad HCM',
        seniority: 'Semi-Senior',
        hours: 80,
        hourlyRate: 65,
        subtotal: 5200,
        modality: 'Remoto',
        responsibilities: 'Autorizaciones estructurales HCM y protección de datos sensibles de nómina.'
      },
      {
        id: 'res-hcm-05',
        moduleCode: 'SAP_PMO_LEAD',
        moduleName: 'Project Manager SAP / Scrum Master',
        roleTitle: 'Coordinador de Proyecto SAP HCM',
        seniority: 'Senior',
        hours: 120,
        hourlyRate: 95,
        subtotal: 11400,
        modality: 'Remoto',
        responsibilities: 'Control de cronograma, seguimiento de pruebas paralelas y actas de avance.'
      }
    ],
    milestones: [
      {
        id: 'mh-1',
        title: 'Alineación Inicial & Blueprint de Nómina',
        description: 'Definición de conceptos de pago, convenios y catálogo organizativo.',
        deliverables: 'Documento BBP de Nómina y Estructura Organizativa firmado.',
        estimatedWeek: 'Semana 1 - 4',
        paymentPercentage: 30
      },
      {
        id: 'mh-2',
        title: 'Parametrización del Motor de Cálculo & ABAP',
        description: 'Configuración en DEV y pruebas unitarias de cálculo neto.',
        deliverables: 'Motor de cálculo probado con 50 casos testigo de prueba.',
        estimatedWeek: 'Semana 5 - 10',
        paymentPercentage: 30
      },
      {
        id: 'mh-3',
        title: 'Pruebas en Paralelo (2 Meses) & UAT',
        description: 'Comparativo peso a peso entre sistema actual y SAP HCM.',
        deliverables: 'Reporte de cuadratura 100% de nóminas paralelas y acta UAT.',
        estimatedWeek: 'Semana 11 - 14',
        paymentPercentage: 25
      },
      {
        id: 'mh-4',
        title: 'Primera Nómina Productiva & Hipercare',
        description: 'Procesamiento de primera nómina oficial en SAP y soporte.',
        deliverables: 'Acta de Go-Live y soporte mensual garantizado.',
        estimatedWeek: 'Semana 15 - 16',
        paymentPercentage: 15
      }
    ],
    discountPercentage: 0,
    taxRatePercentage: 16,
    expensesAmount: 2000,
    paymentTerms: '30 días fecha factura por hito de aceptación.',
    guaranteeHypercareDays: 45,
    statusHistory: [
      {
        id: 'log-hcm-1',
        date: '2026-08-28 15:40',
        status: 'draft',
        note: 'Elaboración de propuesta basada en levantamiento preliminar de requerimientos con RRHH.',
        author: 'Consultor Preventa SAP'
      },
      {
        id: 'log-hcm-2',
        date: '2026-08-30 09:15',
        status: 'sent',
        note: 'Enviada formalmente por correo a Claudia Morales. En espera de fecha para presentación ejecutiva.',
        author: 'Consultor Preventa SAP'
      }
    ],
    updatedAt: '2026-08-30 09:15'
  },
  {
    id: 'quote-sap-003',
    code: 'COT-SAP-2026-003',
    version: '1.0',
    createdAt: '2026-08-20',
    validUntil: '2026-09-20',
    currency: 'USD',
    currencySymbol: '$',
    status: 'negotiation',
    client: {
      companyName: 'Retail & Logística Sudamericana',
      taxId: 'CL-81.992.301-7',
      contactName: 'Esteban Carvajal',
      contactRole: 'Subgerente de Arquitectura de TI y Sistemas Core',
      contactEmail: 'ecarvajal@sudamericanaretail.com',
      contactPhone: '+56 2 2760 3300',
      industry: 'Retail & Comercio Electrónico',
      country: 'Chile'
    },
    project: {
      projectTitle: 'Bolsa de Horas AMS Fábrica ABAP, Basis y Seguridad SAP S/4HANA',
      projectType: 'Soporte AMS / Bolsa de Horas',
      businessObjective: 'Proveer soporte especializado de 2do y 3er nivel, fábrica ágil de desarrollo de requerimientos ABAP/Fiori y administración proactiva de Basis y Seguridad durante 6 meses.',
      methodology: 'Ágil / Scrum Híbrido',
      durationMonths: 6,
      estimatedStartDate: '2026-10-01',
      sapSystemVersion: 'SAP S/4HANA 2022',
      scopeDescription: 'Paquete de 600 horas semestrales flexibles distribuibles entre desarrolladores ABAP Cloud, consultores Basis para mantención de mandantes y administración de seguridad y roles PFCG con acuerdos de nivel de servicio (SLA) comprometidos.',
      assumptions: [
        'Consumo mínimo mensual recomendado de 80 horas.',
        'SLA de respuesta a incidentes críticos de 1 hora y requerimientos menores de 8 horas.',
        'Uso de herramienta Jira / ServiceNow del cliente para la gestión de tickets.'
      ],
      outOfScope: [
        'Proyectos de upgrade de versión o conversión estructural de módulos.'
      ]
    },
    resources: [
      {
        id: 'res-ams-01',
        moduleCode: 'DEV_ABAP',
        moduleName: 'Desarrollador ABAP / Fiori',
        roleTitle: 'Fábrica de Software ABAP & Fiori',
        seniority: 'Senior',
        hours: 300,
        hourlyRate: 80,
        subtotal: 24000,
        modality: 'Remoto',
        responsibilities: 'Atención a requerimientos de mejoras, reportes CDS, SmartForms y consumo de APIs.'
      },
      {
        id: 'res-ams-02',
        moduleCode: 'SAP_BASIS',
        moduleName: 'Consultor SAP Basis / NetWeaver',
        roleTitle: 'Consultor Basis & Administración HANA',
        seniority: 'Senior',
        hours: 160,
        hourlyRate: 90,
        subtotal: 14400,
        modality: 'Remoto',
        responsibilities: 'Mantenimiento preventivo, aplicación de parches y notas, gestión de transportes y tuning de BD.'
      },
      {
        id: 'res-ams-03',
        moduleCode: 'SAP_SECURITY',
        moduleName: 'Consultor de Seguridad y Autorizaciones SAP',
        roleTitle: 'Consultor Seguridad & Auditoría de Roles',
        seniority: 'Senior',
        hours: 140,
        hourlyRate: 85,
        subtotal: 11900,
        modality: 'Remoto',
        responsibilities: 'Creación de roles de usuario, revisión de permisos y atención a auditorías internas.'
      }
    ],
    milestones: [
      {
        id: 'mams-1',
        title: 'Mes 1: Onboarding y Bolsa de Horas',
        description: 'Traspaso de conocimiento de arquitectura y primeras 100 horas de soporte.',
        deliverables: 'Matriz de Accesos y Reporte Mensual de Consumo de Horas.',
        estimatedWeek: 'Mes 1',
        paymentPercentage: 16.66
      },
      {
        id: 'mams-2',
        title: 'Mes 2 a 6: Operación Mensual Recurrente AMS',
        description: 'Entrega mensual de bolsa de horas con reporte de métricas SLA.',
        deliverables: 'Reportes mensuales de tickets cerrados, horas consumidas y backlog.',
        estimatedWeek: 'Mes 2 a 6',
        paymentPercentage: 83.34
      }
    ],
    discountPercentage: 8,
    taxRatePercentage: 19,
    expensesAmount: 0,
    paymentTerms: 'Facturación mensual vencida contra reporte de horas incurridas.',
    guaranteeHypercareDays: 0,
    statusHistory: [
      {
        id: 'log-ams-1',
        date: '2026-08-20 11:00',
        status: 'draft',
        note: 'Borrador estructurado para bolsa de horas semestral.',
        author: 'Gerente Comercial AMS'
      },
      {
        id: 'log-ams-2',
        date: '2026-08-22 17:30',
        status: 'sent',
        note: 'Propuesta remitida al CIO y Subgerente de Sistemas.',
        author: 'Gerente Comercial AMS'
      },
      {
        id: 'log-ams-3',
        date: '2026-09-01 16:15',
        status: 'negotiation',
        note: 'Cliente solicita ajustar la tarifa horaria de ABAP si se extiende a 12 meses. En análisis interno.',
        author: 'Gerente Comercial AMS'
      }
    ],
    updatedAt: '2026-09-01 16:15'
  }
];
