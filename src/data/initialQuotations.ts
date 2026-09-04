import { Quotation } from '../types';

export const INITIAL_QUOTATIONS: Quotation[] = [
  {
    id: 'quote-sap-001',
    code: 'COT-SAP-2026-001',
    version: '1.0',
    createdAt: '2026-08-15',
    validUntil: '2026-09-15',
    currency: 'CLP',
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
        hourlyRate: 85000,
        subtotal: 27200000,
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
        hourlyRate: 90000,
        subtotal: 21600000,
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
        hourlyRate: 115000,
        subtotal: 36800000,
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
        hourlyRate: 60000,
        subtotal: 10800000,
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
        hourlyRate: 80000,
        subtotal: 22400000,
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
        hourlyRate: 85000,
        subtotal: 10200000,
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
        hourlyRate: 65000,
        subtotal: 5200000,
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
        hourlyRate: 110000,
        subtotal: 17600000,
        modality: 'Híbrido',
        responsibilities: 'Gobernanza del proyecto, control de hitos, comités semanales y gestión de riesgos.'
      }
    ],
    milestones: [
      {
        id: 'm-1',
        title: 'Fase Prepare: Kick-Off & Definición Metodológica',
        description: 'Alineación del equipo de proyecto, entrega de cronograma y validación de accesos.',
        deliverables: 'Acta de Kick-Off firmada y Landscape DEV habilitado.',
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
    expensesAmount: 3200000,
    paymentTerms: 'Facturación en Pesos Chilenos (CLP) contra hitos de aceptación (30 días fecha factura).',
    guaranteeHypercareDays: 30,
    statusHistory: [
      {
        id: 'log-1',
        date: '2026-08-15 10:30',
        status: 'draft',
        note: 'Cotización creada en Pesos Chilenos (CLP) para cliente local en Chile.',
        author: 'Consultor Comercial SAP (Santiago)'
      },
      {
        id: 'log-2',
        date: '2026-08-18 16:00',
        status: 'sent',
        note: 'Propuesta formal y PDF emitidos en CLP enviados a Roberto Valenzuela.',
        author: 'Consultor Comercial SAP (Santiago)'
      },
      {
        id: 'log-3',
        date: '2026-08-25 11:15',
        status: 'negotiation',
        note: 'Reunión de revisión técnica en Santiago. Se acordó 5% de descuento por volumen.',
        author: 'Director de Práctica SAP'
      },
      {
        id: 'log-4',
        date: '2026-09-02 14:20',
        status: 'approved',
        note: 'Propuesta aprobada por el Directorio de Minera Andina. Lista para traspaso a ejecución.',
        author: 'Director de Práctica SAP'
      }
    ],
    handoverNotes: 'Proyecto adjudicado formalmente en CLP. Inicia el 1 de Octubre. Coordinar consultores en faena y accesos VPN.',
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
    currency: 'MXN',
    currencySymbol: '$',
    status: 'sent',
    client: {
      companyName: 'Alimentos del Pacífico S.A. de C.V.',
      taxId: 'MX-ALM880922-K89',
      contactName: 'Lic. Claudia Morales',
      contactRole: 'Directora de Recursos Humanos & Talento',
      contactEmail: 'cmorales@alimentospacifico.mx',
      contactPhone: '+52 55 4912 8840',
      industry: 'Consumo Masivo / Alimentos',
      country: 'México'
    },
    project: {
      projectTitle: 'Implementación y Localización SAP HCM (Nómina, PA y OM México)',
      projectType: 'Implementación Greenfield',
      businessObjective: 'Automatizar el cálculo de nómina para 2,800 colaboradores en 3 plantas industriales en México, integrando legislación fiscal y laboral mexicana (SAT, IMSS, INFONAVIT) y autoservicio.',
      methodology: 'SAP Activate',
      durationMonths: 4,
      estimatedStartDate: '2026-10-15',
      sapSystemVersion: 'SAP S/4HANA Private Cloud',
      scopeDescription: 'Configuración completa de SAP HCM: Administración de Personal (PA), Gestión de la Estructura Organizativa (OM), Motor de Cálculo de Nómina (PY) con esquemas de ley mexicana, finiquitos, provisiones e interfaces de timbrado CFDI.',
      assumptions: [
        'El catálogo de conceptos salariales y fórmulas de cálculo mexicanas será provisto en la semana 2.',
        'Se realizarán dos pruebas de nómina en paralelo con el sistema legado antes del Go-Live.'
      ],
      outOfScope: [
        'Módulo de Gestión de Desempeño SuccessFactors (fase posterior).',
        'Relojes biométricos físicos en plantas.'
      ]
    },
    resources: [
      {
        id: 'res-hcm-01',
        moduleCode: 'SAP_HCM',
        moduleName: 'SAP HCM (Human Capital Management)',
        roleTitle: 'Consultor Líder de Nómina SAP HCM México',
        seniority: 'Lead / Arquitecto',
        hours: 280,
        hourlyRate: 2250,
        subtotal: 630000,
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
        hourlyRate: 1650,
        subtotal: 363000,
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
        hourlyRate: 1550,
        subtotal: 279000,
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
        hourlyRate: 1200,
        subtotal: 96000,
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
        hourlyRate: 1800,
        subtotal: 216000,
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
    expensesAmount: 35000,
    paymentTerms: 'Cotización en Pesos Mexicanos (MXN). Facturación 30 días fecha factura por hito con IVA del 16%.',
    guaranteeHypercareDays: 45,
    statusHistory: [
      {
        id: 'log-hcm-1',
        date: '2026-08-28 15:40',
        status: 'draft',
        note: 'Cotización adaptada en Pesos Mexicanos (MXN) para cliente en México.',
        author: 'Consultor Preventa SAP (Oficina Santiago)'
      },
      {
        id: 'log-hcm-2',
        date: '2026-08-30 09:15',
        status: 'sent',
        note: 'Enviada formalmente por correo a Claudia Morales en CDMX.',
        author: 'Consultor Preventa SAP (Oficina Santiago)'
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
      companyName: 'Logística & Bebidas del Cono Sur S.A.',
      taxId: 'UY-218491020019',
      contactName: 'Mathías Da Silva',
      contactRole: 'Director Corporativo de TI & Operaciones LatAm',
      contactEmail: 'mdasilva@conosurblog.com.uy',
      contactPhone: '+598 2901 4455',
      industry: 'Bebidas & Distribución Logística',
      country: 'Uruguay & Brasil'
    },
    project: {
      projectTitle: 'Bolsa de Horas AMS Fábrica ABAP, Basis y Seguridad SAP S/4HANA (Uruguay & Brasil)',
      projectType: 'Soporte AMS / Bolsa de Horas',
      businessObjective: 'Proveer soporte especializado de 2do y 3er nivel a centros de distribución en Montevideo y São Paulo, con fábrica ágil de desarrollos ABAP/Fiori y administración de mandantes Basis y Seguridad durante 6 meses.',
      methodology: 'Ágil / Scrum Híbrido',
      durationMonths: 6,
      estimatedStartDate: '2026-10-01',
      sapSystemVersion: 'SAP S/4HANA 2022',
      scopeDescription: 'Paquete de 600 horas semestrales flexibles distribuibles entre desarrolladores ABAP Cloud, consultores Basis para mantención de mandantes y administración de seguridad y roles PFCG con acuerdos de nivel de servicio (SLA) comprometidos.',
      assumptions: [
        'Consumo mínimo mensual recomendado de 80 horas.',
        'SLA de respuesta a incidentes críticos de 1 hora y requerimientos menores de 8 horas.',
        'Operación remota desde la oficina de Santiago de Chile con soporte bilingüe (Español/Portugués).'
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
        roleTitle: 'Fábrica de Software ABAP & Fiori LatAm',
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
        roleTitle: 'Consultor Basis & Administración HANA Regional',
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
        title: 'Mes 2 a 6: Operación Mensual Recurrente AMS Regional',
        description: 'Entrega mensual de bolsa de horas con reporte de métricas SLA.',
        deliverables: 'Reportes mensuales de tickets cerrados, horas consumidas y backlog.',
        estimatedWeek: 'Mes 2 a 6',
        paymentPercentage: 83.34
      }
    ],
    discountPercentage: 8,
    taxRatePercentage: 0,
    expensesAmount: 0,
    paymentTerms: 'Cotización en Dólares Estadounidenses (USD). Factura de exportación de servicios desde Chile exenta de IVA. Facturación mensual vencida.',
    guaranteeHypercareDays: 0,
    statusHistory: [
      {
        id: 'log-ams-1',
        date: '2026-08-20 11:00',
        status: 'draft',
        note: 'Borrador estructurado en USD para cliente regional en Uruguay y Brasil.',
        author: 'Gerente Comercial AMS (Santiago)'
      },
      {
        id: 'log-ams-2',
        date: '2026-08-22 17:30',
        status: 'sent',
        note: 'Propuesta remitida al CIO regional en Montevideo.',
        author: 'Gerente Comercial AMS (Santiago)'
      },
      {
        id: 'log-ams-3',
        date: '2026-09-01 16:15',
        status: 'negotiation',
        note: 'Cliente solicita ajustar la tarifa horaria de ABAP si se extiende el contrato a 12 meses.',
        author: 'Gerente Comercial AMS (Santiago)'
      }
    ],
    updatedAt: '2026-09-01 16:15'
  },
  {
    id: 'quote-sap-004',
    code: 'COT-SAP-2026-004',
    version: '1.0',
    createdAt: '2026-08-25',
    validUntil: '2026-09-25',
    currency: 'USD',
    currencySymbol: '$',
    status: 'draft',
    client: {
      companyName: 'Grupo Agroindustrial de Colombia S.A.S.',
      taxId: 'CO-901.332.118-4',
      contactName: 'Ing. Felipe Restrepo',
      contactRole: 'Gerente de Proyectos SAP & TI',
      contactEmail: 'frestrepo@agrocolombia.com.co',
      contactPhone: '+57 601 742 8890',
      industry: 'Agroindustria & Exportación',
      country: 'Colombia'
    },
    project: {
      projectTitle: 'Auditoría, Optimización y S/4HANA Readiness Assessment',
      projectType: 'Auditoría & Optimización',
      businessObjective: 'Evaluar la preparación de la arquitectura ERP actual para la transición a SAP S/4HANA Cloud, análisis de código ABAP personalizado y simplificación de procesos financieros.',
      methodology: 'SAP Activate',
      durationMonths: 2,
      estimatedStartDate: '2026-11-01',
      sapSystemVersion: 'SAP ECC 6.0 EHP8 hacia S/4HANA',
      scopeDescription: 'Diagnóstico integral de Readiness Check 2.0, análisis de incompatibilidades de código Z/Y (Custom Code Migration), evaluación de datos maestros y plan de migración técnica con sizing de infraestructura HANA.',
      assumptions: [
        'Extracción de datos del SAP Readiness Check suministrada por el equipo Basis de Colombia.',
        'Sesiones remotas de workshops con líderes de proceso vía Microsoft Teams.'
      ],
      outOfScope: [
        'Conversión técnica o remediación de código en esta etapa de evaluación.'
      ]
    },
    resources: [
      {
        id: 'res-col-01',
        moduleCode: 'SAP_BASIS',
        moduleName: 'Consultor SAP Basis / NetWeaver',
        roleTitle: 'Arquitecto Técnico SAP S/4HANA',
        seniority: 'Lead / Arquitecto',
        hours: 120,
        hourlyRate: 130,
        subtotal: 15600,
        modality: 'Remoto',
        responsibilities: 'Análisis de sizing, Readiness Check, landscape y estrategia de conversión.'
      },
      {
        id: 'res-col-02',
        moduleCode: 'DEV_ABAP',
        moduleName: 'Desarrollador ABAP / Fiori',
        roleTitle: 'Consultor Senior ABAP Custom Code Analyzer',
        seniority: 'Senior',
        hours: 100,
        hourlyRate: 85,
        subtotal: 8500,
        modality: 'Remoto',
        responsibilities: 'Evaluación de objetos Z/Y, simplificación de tablas y estimación de remediación.'
      },
      {
        id: 'res-col-03',
        moduleCode: 'SAP_FICO',
        moduleName: 'SAP FICO (Financial & Controlling)',
        roleTitle: 'Consultor Senior SAP FICO',
        seniority: 'Senior',
        hours: 100,
        hourlyRate: 95,
        subtotal: 9500,
        modality: 'Remoto',
        responsibilities: 'Revisión de estructura contable, libro mayor universal y activos fijos.'
      }
    ],
    milestones: [
      {
        id: 'mcol-1',
        title: 'Diagnóstico Inicial & Ejecución Readiness Check',
        description: 'Recolección de datos y análisis de compatibilidad de mandantes.',
        deliverables: 'Reporte consolidado de Readiness Check y catálogo de hallazgos.',
        estimatedWeek: 'Semana 1 - 4',
        paymentPercentage: 50
      },
      {
        id: 'mcol-2',
        title: 'Entrega de Roadmap de Conversión & Plan Maestro',
        description: 'Plan detallado de fases, sizing recomendado y presupuesto de migración.',
        deliverables: 'Documento Maestro de Roadmap S/4HANA y presentación ejecutiva.',
        estimatedWeek: 'Semana 5 - 8',
        paymentPercentage: 50
      }
    ],
    discountPercentage: 0,
    taxRatePercentage: 0,
    expensesAmount: 0,
    paymentTerms: 'Cotización en Dólares Estadounidenses (USD). Exportación de servicios desde Chile sin IVA. 50% al inicio, 50% a la entrega del Roadmap.',
    guaranteeHypercareDays: 15,
    statusHistory: [
      {
        id: 'log-col-1',
        date: '2026-08-25 14:00',
        status: 'draft',
        note: 'Propuesta preliminar elaborada en USD para cliente en Colombia.',
        author: 'Consultor Preventa SAP (Santiago)'
      }
    ],
    updatedAt: '2026-08-25 14:00'
  },
  {
    id: 'quote-sap-006-uf',
    code: 'COT-SAP-2026-006',
    version: '1.0',
    createdAt: '2026-09-02',
    validUntil: '2026-10-02',
    currency: 'UF',
    currencySymbol: 'UF',
    status: 'sent',
    client: {
      companyName: 'Arauco Celulosa y Bosques S.A.',
      taxId: 'CL-92.411.000-7',
      contactName: 'Ing. Rodrigo Echeverría',
      contactRole: 'Subgerente Corporativo de TI & Personas',
      contactEmail: 'rodrigo.echeverria@arauco.com',
      contactPhone: '+56 9 7120 4455',
      industry: 'Forestal, Celulosa & Manufactura',
      country: 'Chile'
    },
    project: {
      projectTitle: 'Integración HCM, Gestión de Dotaciones y Automatización Nómina SAP S/4HANA (Contrato en UF)',
      projectType: 'Roll-out de Módulos',
      businessObjective: 'Modernizar la gestión de personal en faenas forestales e industriales, parametrizando SAP HCM y conectores ABAP con la plataforma cloud para más de 12.000 colaboradores.',
      methodology: 'SAP Activate',
      durationMonths: 4,
      estimatedStartDate: '2026-10-15',
      sapSystemVersion: 'SAP S/4HANA 2023 Private Cloud',
      scopeDescription: 'Implementación y parametrización de SAP HCM (Administración de Personal, Estructura Organizativa, Gestión de Tiempos y Enlace con Nómina), desarrollo de servicios OData en ABAP Cloud para integración con reloj control biométrico y configuración de roles de seguridad para RRHH.',
      assumptions: [
        'Disponibilidad de ambientes SAP DEV y QAS desde la primera semana de octubre.',
        'La dotación y maestro de colaboradores será provista homologada por el área de People Analytics de Arauco.',
        'Contrato indexado a la Unidad de Fomento (UF) del Banco Central de Chile con facturación pagadera a 30 días.'
      ],
      outOfScope: [
        'Licenciamiento directo de SuccessFactors o SAP S/4HANA.',
        'Desarrollos de software no especificados en el documento BBP.'
      ]
    },
    resources: [
      {
        id: 'res-uf-01',
        moduleCode: 'SAP_HCM',
        moduleName: 'SAP HCM (Human Capital Management)',
        roleTitle: 'Consultor Lead Funcional SAP HCM',
        seniority: 'Lead / Arquitecto',
        hours: 160,
        hourlyRate: 2.80,
        subtotal: 448,
        modality: 'Híbrido',
        responsibilities: 'Arquitectura de estructura de personal, parametrización de tiempos y diseño BBP.'
      },
      {
        id: 'res-uf-02',
        moduleCode: 'DEV_ABAP',
        moduleName: 'Desarrollador ABAP / Fiori',
        roleTitle: 'Desarrollador Senior ABAP Cloud & Fiori',
        seniority: 'Senior',
        hours: 140,
        hourlyRate: 2.05,
        subtotal: 287,
        modality: 'Remoto',
        responsibilities: 'Construcción de interfaces REST/OData para control de asistencia y apps Fiori de autoservicio.'
      },
      {
        id: 'res-uf-03',
        moduleCode: 'SAP_SECURITY',
        moduleName: 'Seguridad SAP & Autorizaciones',
        roleTitle: 'Especialista Senior Seguridad y Perfiles',
        seniority: 'Senior',
        hours: 60,
        hourlyRate: 1.95,
        subtotal: 117,
        modality: 'Remoto',
        responsibilities: 'Diseño de roles compuestos, segregación de funciones SoD y perfiles estructurales de RRHH.'
      }
    ],
    milestones: [
      {
        id: 'muf-1',
        title: 'Fase Prepare: Kick-Off & Levantamiento Inicial',
        description: 'Reunión de alineación, revisión de accesos y cronograma de hitos.',
        deliverables: 'Acta de Kick-Off aprobada y matriz de riesgos de proyecto.',
        estimatedWeek: 'Semana 1 - 2',
        paymentPercentage: 20
      },
      {
        id: 'muf-2',
        title: 'Fase Explore: Business Blueprint Aprobado',
        description: 'Talleres de diseño funcional de nómina y tiempos por faena.',
        deliverables: 'Documento BBP firmado por Key Users de Arauco.',
        estimatedWeek: 'Semana 3 - 6',
        paymentPercentage: 30
      },
      {
        id: 'muf-3',
        title: 'Fase Realize: Parametrización & Pruebas Unitarias',
        description: 'Configuración en ambiente DEV y transportes a ambiente de calidad.',
        deliverables: 'Ambiente QAS operativo y catálogo de pruebas unitarias concluidas.',
        estimatedWeek: 'Semana 7 - 11',
        paymentPercentage: 30
      },
      {
        id: 'muf-4',
        title: 'Fase Deploy & Run: Aceptación UAT, Go-Live & Hipercare',
        description: 'Pruebas integrales de usuario, salida a producción y 30 días de hipercare.',
        deliverables: 'Acta de Go-Live formal firmada y traspaso a soporte AMS.',
        estimatedWeek: 'Semana 12 - 16',
        paymentPercentage: 20
      }
    ],
    discountPercentage: 5,
    taxRatePercentage: 19,
    expensesAmount: 25,
    paymentTerms: 'Valores en Unidades de Fomento (UF) del Banco Central de Chile. Facturación mensual en Pesos Chilenos (CLP) al valor oficial de la UF a la fecha de emisión de factura (30 días).',
    guaranteeHypercareDays: 30,
    statusHistory: [
      {
        id: 'log-uf-1',
        date: '2026-09-02 10:00',
        status: 'draft',
        note: 'Cotización formulada en UF según estándar corporativo chileno con tarifas benchmark.',
        author: 'Preventa SAP Chile'
      },
      {
        id: 'log-uf-2',
        date: '2026-09-03 16:30',
        status: 'sent',
        note: 'Propuesta enviada al Comité de TI y Compras de Arauco en Santiago.',
        author: 'Account Executive SAP'
      }
    ],
    updatedAt: '2026-09-03 16:30'
  }
];
