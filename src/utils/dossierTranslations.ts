import { DocumentLanguage, ProjectType, RiskMitigationItem, OutOfScopeCategoryItem, ProjectPlan } from '../types';

export interface DossierTranslation {
  topBar: {
    issuerTag: string;
    strategicAlliance: string;
    technicalProposal: string;
    preparedFor: string;
    corporateClient: string;
  };
  cover: {
    commercialQuotation: string;
    investmentFixedPrice: string;
    includesVat: string;
    netVatExcluded: string;
    hypercareIncluded: string;
    quoteNum: string;
    issuedOn: string;
    validity: string;
    preparedForLabel: string;
    confidentialityNotice: string;
  };
  page2: {
    tag: string;
    title: string;
    subtitle: string;
    currentSituation: string;
    targetSolution: string;
    businessObjective: string;
    clientQuoteContext: string;
  };
  page3: {
    tag: string;
    title: string;
    subtitle: string;
    committedScope: string;
    environmentAndVersion: string;
    versionLabel: string;
    methodologyLabel: string;
    durationLabel: string;
    months: string;
    keyAssumptions: string;
    assumptionsDesc: string;
  };
  page4: {
    tag: string;
    title: string;
    subtitle: string;
    gatekeeperTitle: string;
    gatekeeperBadge: string;
    riskMatrixTitle: string;
    tableRisk: string;
    tableImpact: string;
    tableMitigation: string;
    tableOwner: string;
    impactHigh: string;
    impactMedium: string;
    impactLow: string;
    ownerClient: string;
    ownerConsultant: string;
    ownerBoth: string;
  };
  page5: {
    tag: string;
    title: string;
    subtitle: string;
    tableColModule: string;
    tableColRole: string;
    tableColSeniority: string;
    tableColModality: string;
    tableColHours: string;
    tableColRate: string;
    tableColSubtotal: string;
    totalDedicatedHours: string;
    totalEffort: string;
    subtotalNeto: string;
    modalityRemote: string;
    modalityHybrid: string;
    modalityOnsite: string;
  };
  page6: {
    tag: string;
    title: string;
    subtitle: string;
    milestone1Title: string;
    milestone1Timing: string;
    milestone1Desc: string;
    milestone2Title: string;
    milestone2Timing: string;
    milestone2Desc: string;
    milestone3Title: string;
    milestone3Timing: string;
    milestone3Desc: string;
    milestone4Title: string;
    milestone4Timing: string;
    milestone4Desc: string;
    milestonesTableTitle: string;
    tableColMilestone: string;
    tableColTiming: string;
    tableColPercentage: string;
    tableColAmount: string;
    totalAmount: string;
    commercialTermsTitle: string;
    termPaymentMethod: string;
    termCurrency: string;
    termExpenses: string;
    termExpensesIncluded: string;
    termGuarantee: string;
    termOutOfScope: string;
  };
  page7: {
    tag: string;
    title: string;
    subtitle: string;
    ganttSummaryTitle: string;
    ganttSummaryDuration: string;
    ganttSummaryPhases: string;
    ganttSummaryGoLive: string;
    ganttSummaryCalendar: string;
    ganttSummaryCalendarDesc: string;
    ganttSummaryMethodology: string;
    ganttSummaryMethodologyDesc: string;
    weeks: string;
    stagesCount: string;
  };
  page8: {
    tag: string;
    title: string;
    subtitle: string;
    preparedBy: string;
    clientAcceptance: string;
    acceptDeclaration: string;
    legalRepSignature: string;
    fullName: string;
    idNumber: string;
    roleTitle: string;
    approvalDate: string;
    issuerContactCard: string;
    contactPhone: string;
    contactEmail: string;
    contactLocation: string;
  };
  compact: {
    compactTitle: string;
    clientData: string;
    projectScope: string;
    resourcesTable: string;
    economicSummary: string;
    milestonesSummary: string;
    validityAndSignatures: string;
    statusLabel: string;
  };
}

export const DOSSIER_TRANSLATIONS: Record<DocumentLanguage, DossierTranslation> = {
  es: {
    topBar: {
      issuerTag: 'CONSULTORÍA SAP · EMISOR',
      strategicAlliance: 'ALIANZA ESTRATÉGICA',
      technicalProposal: 'Propuesta Técnica',
      preparedFor: 'PREPARADO EXCLUSIVAMENTE PARA',
      corporateClient: 'Cliente Corporativo',
    },
    cover: {
      commercialQuotation: 'COTIZACIÓN COMERCIAL',
      investmentFixedPrice: 'INVERSIÓN · PRECIO CERRADO',
      includesVat: 'Incluye IVA',
      netVatExcluded: 'Valores Netos + IVA',
      hypercareIncluded: 'Hipercare y garantía incluidos por {days} días corridos desde el aviso de entrega.',
      quoteNum: 'Cotización N.º',
      issuedOn: 'Emitida el',
      validity: 'Vigencia: {days} días corridos · Plazo: {months} meses ({weeks} semanas)',
      preparedForLabel: 'Preparada para:',
      confidentialityNotice: 'Documento confidencial. Reserva: {months} meses desde entrega, rechazo o vencimiento.',
    },
    page2: {
      tag: 'INTRODUCCIÓN & OBJETIVOS',
      title: '1. Resumen Ejecutivo & Enfoque de Proyecto',
      subtitle: 'Comprensión del estado actual, dolores operacionales y valor que queda habilitado tras la entrega.',
      currentSituation: 'SITUACIÓN ACTUAL (HOY)',
      targetSolution: 'SOLUCIÓN QUE QUEDA CONSTRUIDA',
      businessObjective: 'OBJETIVO DE NEGOCIO & RETORNO ESPERADO',
      clientQuoteContext: 'Enfoque personalizado para {client} bajo estándar {methodology}.',
    },
    page3: {
      tag: 'ARQUITECTURA & ENTORNOS',
      title: '2. Especificación Técnica de Arquitectura',
      subtitle: 'Alcance detallado, versiones de software, parametrizaciones base y supuestos de infraestructura.',
      committedScope: 'ALCANCE COMPROMETIDO (IN SCOPE)',
      environmentAndVersion: 'ENTORNO & VERSIÓN SAP',
      versionLabel: 'Versión del Sistema:',
      methodologyLabel: 'Metodología:',
      durationLabel: 'Plazo Estimado:',
      months: 'meses',
      keyAssumptions: 'SUPUESTOS CLAVE DE ARQUITECTURA',
      assumptionsDesc: 'Condiciones técnicas y operacionales acordadas para el correcto desarrollo del proyecto:',
    },
    page4: {
      tag: 'GOBERNANZA & GESTIÓN DE RIESGOS',
      title: '3. Marco de Control, Gatekeeper y Matriz de Riesgos',
      subtitle: 'Mecanismos de control, condición previa al inicio y matriz de riesgos con sus planes de mitigación.',
      gatekeeperTitle: 'CONDIÇÃO SUSPENSIVA / GATEKEEPER',
      gatekeeperBadge: 'Requisito para activar el Día 1',
      riskMatrixTitle: 'MATRIZ DE RIESGOS & MITIGACIONES',
      tableRisk: 'Riesgo Identificado',
      tableImpact: 'Impacto',
      tableMitigation: 'Estrategia de Mitigación Comprometida',
      tableOwner: 'Responsable',
      impactHigh: 'ALTO',
      impactMedium: 'MEDIO',
      impactLow: 'BAJO',
      ownerClient: 'Cliente',
      ownerConsultant: 'Consultora',
      ownerBoth: 'Ambos',
    },
    page5: {
      tag: 'EQUIPO EXPERTO & PERFILES',
      title: '4. Estructura de Equipo Consultor Senior',
      subtitle: 'Asignación de horas, perfiles por módulo SAP, modalidad y tarifas acordadas.',
      tableColModule: 'Módulo / Especialidad',
      tableColRole: 'Rol Consultor',
      tableColSeniority: 'Seniority',
      tableColModality: 'Modalidad',
      tableColHours: 'Horas',
      tableColRate: 'Tarifa/Hora',
      tableColSubtotal: 'Subtotal',
      totalDedicatedHours: 'Total Horas Consultoría Comprometidas:',
      totalEffort: '{totalHours} hrs de consultoría experta',
      subtotalNeto: 'Subtotal Servicios:',
      modalityRemote: 'Remoto',
      modalityHybrid: 'Híbrido',
      modalityOnsite: 'Presencial',
    },
    page6: {
      tag: 'INVERSIÓN & CONDICIONES',
      title: '5. Estructura Económica y Condiciones Comerciales',
      subtitle: 'Hitos contractuales vinculados a entregables, términos de pago y exclusiones expresas.',
      milestone1Title: '01 · Arranque Inicial',
      milestone1Timing: 'Día hábil 1',
      milestone1Desc: 'Firma de contrato, entrega de accesos y habilitación de usuarios de trabajo.',
      milestone2Title: '02 · Construcción',
      milestone2Timing: 'Sem. 1–2',
      milestone2Desc: 'Parametrización de módulos, integraciones y flujos funcionales.',
      milestone3Title: '03 · Demo & Pruebas',
      milestone3Timing: 'Sem. 3',
      milestone3Desc: 'Ambiente QA navegable, validación con usuarios clave y demo de avance.',
      milestone4Title: '04 · Cierre y Puesta en Marcha',
      milestone4Timing: 'Sem. 4',
      milestone4Desc: 'Paso a productivo, inicio de hipercare ({days} días) y acta de entrega.',
      milestonesTableTitle: 'Cronograma Contractual de Hitos de Pago',
      tableColMilestone: 'Hito / Entregable',
      tableColTiming: 'Plazo / Momento',
      tableColPercentage: '% Pago',
      tableColAmount: 'Monto Neto',
      totalAmount: 'TOTAL INVERSIÓN',
      commercialTermsTitle: 'Condiciones Comerciales y Operacionales',
      termPaymentMethod: 'Forma de Pago:',
      termCurrency: 'Moneda:',
      termExpenses: 'Gastos y Viáticos:',
      termExpensesIncluded: 'Incluidos en la tarifa convenida. Sin recargos adicionales.',
      termGuarantee: 'Garantía & Hipercare:',
      termOutOfScope: 'Exclusiones de Alcance:',
    },
    page7: {
      tag: 'CRONOGRAMA & HITOS CLAVE',
      title: '6. Plan de Trabajo y Cronograma Ejecutivo',
      subtitle: 'Secuencia temporal de actividades, dependencias entre fases y fecha estimada de salida en vivo.',
      ganttSummaryTitle: 'Resumen de Planificación',
      ganttSummaryDuration: 'Duración Estimada:',
      ganttSummaryPhases: 'Fases Consecutivas:',
      ganttSummaryGoLive: 'Hito Crítico (Go-Live):',
      ganttSummaryCalendar: 'Calendario & Días Laborables',
      ganttSummaryCalendarDesc: 'El cronograma calcula plazos basados en días hábiles efectivos, excluyendo fines de semana (semana de {days} días) y los feriados legales oficiales de {country}.',
      ganttSummaryMethodology: 'Metodología Oficial {methodology}',
      ganttSummaryMethodologyDesc: 'Las fases siguen el ciclo estándar de implementación con hitos de validación intermedia y aseguramiento de calidad antes de cada pase a producción.',
      weeks: 'semanas',
      stagesCount: 'etapas',
    },
    page8: {
      tag: 'COTIZACIÓN COMERCIAL · CIERRE',
      title: '7. Aceptación Formal de la Propuesta',
      subtitle: 'Validación de condiciones comerciales, firma de partes y formalización de inicio de servicios.',
      preparedBy: 'PROPUESTA ELABORADA POR',
      clientAcceptance: 'ACEPTACIÓN Y CONFORMIDAD DEL CLIENTE',
      acceptDeclaration: 'En representación de {client}, declaro conocer y aceptar en su totalidad los términos, alcance técnico, condiciones económicas y cronograma expuestos en la presente cotización comercial {code}.',
      legalRepSignature: 'Firma Representante Legal',
      fullName: 'Nombre Completo:',
      idNumber: 'RUT / N.° Identificación:',
      roleTitle: 'Cargo / Función:',
      approvalDate: 'Fecha de Aprobación:',
      issuerContactCard: 'Líder Comercial Asignado:',
      contactPhone: 'Teléfono:',
      contactEmail: 'Correo:',
      contactLocation: 'Ubicación:',
    },
    compact: {
      compactTitle: 'FICHA RESUMEN DE COTIZACIÓN',
      clientData: 'DATOS DEL CLIENTE',
      projectScope: 'ALCANCE Y METODOLOGÍA',
      resourcesTable: 'DETALLE DE RECURSOS & TARIFAS',
      economicSummary: 'RESUMEN ECONÓMICO',
      milestonesSummary: 'HITOS DE FACTURACIÓN',
      validityAndSignatures: 'VIGENCIA Y FIRMA DE CONFORMIDAD',
      statusLabel: 'Estado:',
    },
  },

  en: {
    topBar: {
      issuerTag: 'SAP CONSULTING · ISSUER',
      strategicAlliance: 'STRATEGIC ALLIANCE',
      technicalProposal: 'Technical Proposal',
      preparedFor: 'PREPARED EXCLUSIVELY FOR',
      corporateClient: 'Corporate Client',
    },
    cover: {
      commercialQuotation: 'COMMERCIAL PROPOSAL',
      investmentFixedPrice: 'INVESTMENT · FIXED PRICE',
      includesVat: 'VAT Included',
      netVatExcluded: 'Net Values + VAT',
      hypercareIncluded: 'Hypercare and warranty included for {days} calendar days from handover notice.',
      quoteNum: 'Quotation No.',
      issuedOn: 'Issued on',
      validity: 'Validity: {days} calendar days · Timeline: {months} months ({weeks} weeks)',
      preparedForLabel: 'Prepared for:',
      confidentialityNotice: 'Confidential document. Non-disclosure period: {months} months from delivery, rejection or expiration.',
    },
    page2: {
      tag: 'INTRODUCTION & OBJECTIVES',
      title: '1. Executive Summary & Project Approach',
      subtitle: 'Understanding current operational challenges, business drivers, and the tangible value enabled upon completion.',
      currentSituation: 'CURRENT SITUATION (TODAY)',
      targetSolution: 'TARGET SOLUTION BUILT',
      businessObjective: 'BUSINESS OBJECTIVE & EXPECTED ROI',
      clientQuoteContext: 'Customized approach designed for {client} following {methodology} industry standard.',
    },
    page3: {
      tag: 'ARCHITECTURE & ENVIRONMENTS',
      title: '2. Technical Architecture Specification',
      subtitle: 'Committed scope, software releases, core parameterizations, and infrastructure pre-conditions.',
      committedScope: 'COMMITTED SCOPE (IN SCOPE)',
      environmentAndVersion: 'SAP ENVIRONMENT & SYSTEM VERSION',
      versionLabel: 'System Version:',
      methodologyLabel: 'Methodology:',
      durationLabel: 'Estimated Timeline:',
      months: 'months',
      keyAssumptions: 'KEY ARCHITECTURAL ASSUMPTIONS',
      assumptionsDesc: 'Technical and operational parameters agreed upon for the successful execution of the project:',
    },
    page4: {
      tag: 'GOVERNANCE & RISK MANAGEMENT',
      title: '3. Control Framework, Gatekeeper & Risk Matrix',
      subtitle: 'Governance mechanisms, condition precedent to kickoff, and risk matrix with preventive mitigation actions.',
      gatekeeperTitle: 'SUSPENSIVE CONDITION / GATEKEEPER',
      gatekeeperBadge: 'Prerequisite to activate Day 1',
      riskMatrixTitle: 'RISK MATRIX & COMMITTED MITIGATIONS',
      tableRisk: 'Identified Risk',
      tableImpact: 'Impact',
      tableMitigation: 'Committed Mitigation Strategy',
      tableOwner: 'Owner',
      impactHigh: 'HIGH',
      impactMedium: 'MEDIUM',
      impactLow: 'LOW',
      ownerClient: 'Client',
      ownerConsultant: 'Consulting Firm',
      ownerBoth: 'Both Parties',
    },
    page5: {
      tag: 'EXPERT TEAM & CONSULTING PROFILES',
      title: '4. Senior Consulting Team Structure',
      subtitle: 'Allocated hours, specialized profiles by SAP module, delivery modality, and agreed hourly rates.',
      tableColModule: 'Module / Specialty',
      tableColRole: 'Consultant Role',
      tableColSeniority: 'Seniority',
      tableColModality: 'Modality',
      tableColHours: 'Hours',
      tableColRate: 'Rate/Hour',
      tableColSubtotal: 'Subtotal',
      totalDedicatedHours: 'Total Committed Consulting Hours:',
      totalEffort: '{totalHours} hrs of expert consulting',
      subtotalNeto: 'Services Subtotal:',
      modalityRemote: 'Remote',
      modalityHybrid: 'Hybrid',
      modalityOnsite: 'On-site',
    },
    page6: {
      tag: 'INVESTMENT & TERMS',
      title: '5. Economic Structure & Commercial Terms',
      subtitle: 'Contractual milestones tied to tangible deliverables, payment schedule, and explicit exclusions.',
      milestone1Title: '01 · Initial Kickoff',
      milestone1Timing: 'Working Day 1',
      milestone1Desc: 'Contract signing, credentials & access provision, and workspace user enablement.',
      milestone2Title: '02 · Realization & Build',
      milestone2Timing: 'Weeks 1–2',
      milestone2Desc: 'Module parameterization, data interfaces, and functional workflow configuration.',
      milestone3Title: '03 · Demo & Acceptance Testing',
      milestone3Timing: 'Week 3',
      milestone3Desc: 'Navigable QA environment, key-user validation, and formal milestone review demo.',
      milestone4Title: '04 · Closing & Go-Live Cutover',
      milestone4Timing: 'Week 4',
      milestone4Desc: 'Production release, hypercare startup ({days} days), and final acceptance handover certificate.',
      milestonesTableTitle: 'Contractual Payment Milestone Schedule',
      tableColMilestone: 'Milestone / Deliverable',
      tableColTiming: 'Timeline / Timing',
      tableColPercentage: '% Payment',
      tableColAmount: 'Net Amount',
      totalAmount: 'TOTAL INVESTMENT',
      commercialTermsTitle: 'Commercial & Operational Terms',
      termPaymentMethod: 'Payment Terms:',
      termCurrency: 'Currency:',
      termExpenses: 'Expenses & Travel:',
      termExpensesIncluded: 'Included in agreed rate. No additional surcharges.',
      termGuarantee: 'Warranty & Hypercare:',
      termOutOfScope: 'Out of Scope Exclusions:',
    },
    page7: {
      tag: 'SCHEDULE & KEY MILESTONES',
      title: '6. Work Plan & Executive Schedule',
      subtitle: 'Timeline sequence of activities, critical phase dependencies, and estimated go-live date.',
      ganttSummaryTitle: 'Planning Summary',
      ganttSummaryDuration: 'Estimated Timeline:',
      ganttSummaryPhases: 'Consecutive Phases:',
      ganttSummaryGoLive: 'Critical Milestone (Go-Live):',
      ganttSummaryCalendar: 'Calendar & Working Days',
      ganttSummaryCalendarDesc: 'The timeline calculates milestones based on net business working days, excluding weekends ({days}-day week) and official public holidays of {country}.',
      ganttSummaryMethodology: 'Official {methodology} Framework',
      ganttSummaryMethodologyDesc: 'Phases adhere to standard implementation lifecycles with intermediate quality assurance gates prior to production deployment.',
      weeks: 'weeks',
      stagesCount: 'phases',
    },
    page8: {
      tag: 'COMMERCIAL PROPOSAL · CLOSING',
      title: '7. Formal Proposal Acceptance',
      subtitle: 'Validation of commercial conditions, execution by authorized signatories, and service start.',
      preparedBy: 'PROPOSAL PREPARED BY',
      clientAcceptance: 'CLIENT ACCEPTANCE & SIGN-OFF',
      acceptDeclaration: 'On behalf of {client}, I declare full awareness and acceptance of all commercial terms, technical scope, economic conditions, and schedule set forth in this quotation {code}.',
      legalRepSignature: 'Authorized Legal Representative Signature',
      fullName: 'Full Name:',
      idNumber: 'Tax ID / National ID:',
      roleTitle: 'Title / Corporate Role:',
      approvalDate: 'Approval Date:',
      issuerContactCard: 'Assigned Commercial Lead:',
      contactPhone: 'Phone:',
      contactEmail: 'Email:',
      contactLocation: 'Location:',
    },
    compact: {
      compactTitle: 'QUOTATION SUMMARY SHEET',
      clientData: 'CLIENT INFORMATION',
      projectScope: 'PROJECT SCOPE & METHODOLOGY',
      resourcesTable: 'CONSULTING RESOURCES & RATES',
      economicSummary: 'FINANCIAL SUMMARY',
      milestonesSummary: 'BILLING MILESTONES',
      validityAndSignatures: 'VALIDITY & ACCEPTANCE SIGNATURE',
      statusLabel: 'Status:',
    },
  },

  pt: {
    topBar: {
      issuerTag: 'CONSULTORIA SAP · EMISSOR',
      strategicAlliance: 'ALIANÇA ESTRATÉGICA',
      technicalProposal: 'Proposta Técnica',
      preparedFor: 'PREPARADO EXCLUSIVAMENTE PARA',
      corporateClient: 'Cliente Corporativo',
    },
    cover: {
      commercialQuotation: 'PROPOSTA COMERCIAL',
      investmentFixedPrice: 'INVESTIMENTO · PREÇO FECHADO',
      includesVat: 'Inclui Impostos / IVA',
      netVatExcluded: 'Valores Líquidos + Impostos',
      hypercareIncluded: 'Hipercare e garantia incluídos por {days} dias corridos a partir do aviso de entrega.',
      quoteNum: 'Cotação N.º',
      issuedOn: 'Emitida em',
      validity: 'Validade: {days} dias corridos · Prazo: {months} meses ({weeks} semanas)',
      preparedForLabel: 'Preparada para:',
      confidentialityNotice: 'Documento confidencial. Sigilo: {months} meses a partir da entrega, recusa ou expiração.',
    },
    page2: {
      tag: 'INTRODUÇÃO & OBJETIVOS',
      title: '1. Resumo Executivo & Abordagem do Projeto',
      subtitle: 'Compreensão do cenário atual, desafios operacionais e valor tangível gerado após a entrega.',
      currentSituation: 'SITUAÇÃO ATUAL (HOJE)',
      targetSolution: 'SOLUÇÃO QUE FICA CONSTRUÍDA',
      businessObjective: 'OBJETIVO DE NEGÓCIO & RETORNO ESPERADO',
      clientQuoteContext: 'Abordagem sob medida desenhada para {client} sob metodologia {methodology}.',
    },
    page3: {
      tag: 'ARQUITETURA & AMBIENTES',
      title: '2. Especificação Técnica de Arquitetura',
      subtitle: 'Escopo detalhado, versões de software, parametrizações essenciais e premissas de infraestrutura.',
      committedScope: 'ESCOPO COMPROMETIDO (IN SCOPE)',
      environmentAndVersion: 'AMBIENTE & VERSÃO SAP',
      versionLabel: 'Versão do Sistema:',
      methodologyLabel: 'Metodologia:',
      durationLabel: 'Prazo Estimado:',
      months: 'meses',
      keyAssumptions: 'PREMISSAS PRINCIPAIS DE ARQUITETURA',
      assumptionsDesc: 'Condições técnicas e operacionais acordadas para a execução bem-sucedida do projeto:',
    },
    page4: {
      tag: 'GOVERNANÇA & GESTÃO DE RISCOS',
      title: '3. Estrutura de Controle, Gatekeeper e Matriz de Riscos',
      subtitle: 'Mecanismos de governança, condição prévia ao início e matriz de riscos com ações mitigatórias.',
      gatekeeperTitle: 'CONDIÇÃO SUSPENSIVA / GATEKEEPER',
      gatekeeperBadge: 'Requisito para ativar o Dia 1',
      riskMatrixTitle: 'MATRIZ DE RISCOS & MITIGAÇÕES COMPROMETIDAS',
      tableRisk: 'Risco Identificado',
      tableImpact: 'Impacto',
      tableMitigation: 'Estratégia de Mitigação Comprometida',
      tableOwner: 'Responsável',
      impactHigh: 'ALTO',
      impactMedium: 'MÉDIO',
      impactLow: 'BAIXO',
      ownerClient: 'Cliente',
      ownerConsultant: 'Consultoria',
      ownerBoth: 'Ambas as Partes',
    },
    page5: {
      tag: 'EQUIPE ESPECIALISTA & PERFIS',
      title: '4. Estrutura da Equipe de Consultores Seniores',
      subtitle: 'Alocação de horas, perfis por módulo SAP, modalidade de atuação e tarifas acordadas.',
      tableColModule: 'Módulo / Especialidade',
      tableColRole: 'Função do Consultor',
      tableColSeniority: 'Senioridade',
      tableColModality: 'Modalidade',
      tableColHours: 'Horas',
      tableColRate: 'Tarifa/Hora',
      tableColSubtotal: 'Subtotal',
      totalDedicatedHours: 'Total de Horas de Consultoria Comprometidas:',
      totalEffort: '{totalHours} hrs de consultoria especializada',
      subtotalNeto: 'Subtotal de Serviços:',
      modalityRemote: 'Remoto',
      modalityHybrid: 'Híbrido',
      modalityOnsite: 'Presencial',
    },
    page6: {
      tag: 'INVESTIMENTO & CONDIÇÕES',
      title: '5. Estrutura Econômica e Condições Comerciais',
      subtitle: 'Marcos contratuais vinculados a entregáveis, cronograma de desembolso e exclusões expressas.',
      milestone1Title: '01 · Arranque Inicial',
      milestone1Timing: 'Dia útil 1',
      milestone1Desc: 'Assinatura do contrato, liberação de acessos e habilitação dos usuários de trabalho.',
      milestone2Title: '02 · Construção',
      milestone2Timing: 'Sem. 1–2',
      milestone2Desc: 'Parametrização dos módulos, integrações e fluxos funcionais.',
      milestone3Title: '03 · Demonstração & Testes',
      milestone3Timing: 'Sem. 3',
      milestone3Desc: 'Ambiente QA navegável, validação com key users e demonstração de avanço.',
      milestone4Title: '04 · Encerramento e Go-Live',
      milestone4Timing: 'Sem. 4',
      milestone4Desc: 'Entrada em produção, início do hipercare ({days} dias) e termo de entrega formal.',
      milestonesTableTitle: 'Cronograma Contratual de Marcos de Pagamento',
      tableColMilestone: 'Marco / Entregável',
      tableColTiming: 'Prazo / Momento',
      tableColPercentage: '% Pagamento',
      tableColAmount: 'Valor Líquido',
      totalAmount: 'TOTAL INVESTIMENTO',
      commercialTermsTitle: 'Condições Comerciais e Operacionais',
      termPaymentMethod: 'Forma de Pagamento:',
      termCurrency: 'Moeda:',
      termExpenses: 'Despesas e Diárias:',
      termExpensesIncluded: 'Incluídas na tarifa acordada. Sem cobranças adicionais.',
      termGuarantee: 'Garantia & Hipercare:',
      termOutOfScope: 'Exclusões de Escopo:',
    },
    page7: {
      tag: 'CRONOGRAMA & MARCOS PRINCIPAIS',
      title: '6. Plano de Trabalho e Cronograma Executivo',
      subtitle: 'Sequência temporal de atividades, dependências entre fases e data estimada de entrada em produção.',
      ganttSummaryTitle: 'Resumo do Planejamento',
      ganttSummaryDuration: 'Duração Estimada:',
      ganttSummaryPhases: 'Fases Consecutivas:',
      ganttSummaryGoLive: 'Marco Crítico (Go-Live):',
      ganttSummaryCalendar: 'Calendário & Dias Úteis',
      ganttSummaryCalendarDesc: 'O cronograma calcula prazos com base em dias úteis efetivos, excluindo finais de semana (semana de {days} dias) e feriados oficiais de {country}.',
      ganttSummaryMethodology: 'Metodologia Oficial {methodology}',
      ganttSummaryMethodologyDesc: 'As etapas seguem o ciclo estruturado de implementação com marcos de validação e garantia de qualidade antes da entrada em produção.',
      weeks: 'semanas',
      stagesCount: 'etapas',
    },
    page8: {
      tag: 'PROPOSTA COMERCIAL · ENCERRAMENTO',
      title: '7. Aceitação Formal da Proposta',
      subtitle: 'Validação das condições comerciais, assinatura das partes e formalização do início dos serviços.',
      preparedBy: 'PROPOSTA ELABORADA POR',
      clientAcceptance: 'ACEITAÇÃO E CONFORMIDADE DO CLIENTE',
      acceptDeclaration: 'Em representação de {client}, declaro conhecer e aceitar integralmente os termos, escopo técnico, condições financeiras e cronograma apresentados nesta cotação comercial {code}.',
      legalRepSignature: 'Assinatura do Representante Legal',
      fullName: 'Nome Completo:',
      idNumber: 'CNPJ / CPF / Identificação:',
      roleTitle: 'Cargo / Função:',
      approvalDate: 'Data de Aprovação:',
      issuerContactCard: 'Líder Comercial Atribuído:',
      contactPhone: 'Telefone:',
      contactEmail: 'E-mail:',
      contactLocation: 'Localização:',
    },
    compact: {
      compactTitle: 'FICHA RESUMO DA PROPOSTA',
      clientData: 'DADOS DO CLIENTE',
      projectScope: 'ESCOPO E METODOLOGIA',
      resourcesTable: 'DETALHAMENTO DE RECURSOS & TARIFAS',
      economicSummary: 'RESUMO FINANCEIRO',
      milestonesSummary: 'MARCOS DE FATURAMENTO',
      validityAndSignatures: 'VALIDADE E ASSINATURA DE CONFORMIDADE',
      statusLabel: 'Status:',
    },
  },
};

export function getDossierTranslation(lang?: DocumentLanguage): DossierTranslation {
  return DOSSIER_TRANSLATIONS[lang || 'es'] || DOSSIER_TRANSLATIONS.es;
}

// Gantt stage names translations mapping
export const GANTT_STAGES_TRANSLATIONS: Record<string, { es: string; en: string; pt: string }> = {
  stage1: {
    es: '1. Preparación y Arranque Inicial',
    en: '1. Prepare & Initial Kickoff',
    pt: '1. Preparação e Arranque Inicial',
  },
  stage2: {
    es: '2. Exploración y Ajuste al Estándar (BBP)',
    en: '2. Explore & Fit-to-Standard (BBP)',
    pt: '2. Exploração e Ajuste ao Padrão (BBP)',
  },
  stage3: {
    es: '3. Realización (Parametrización y Desarrollo ABAP)',
    en: '3. Realize (Parametrization & ABAP Dev)',
    pt: '3. Realização (Parametrização e Desenvolvimento ABAP)',
  },
  stage4: {
    es: '4. Pruebas Integrales y Aceptación (UAT)',
    en: '4. Integration & Acceptance Testing (UAT)',
    pt: '4. Testes Integrados e Aceitação (UAT)',
  },
  stage5: {
    es: '5. Despliegue y Transición Final (Cutover)',
    en: '5. Deploy & Final Cutover',
    pt: '5. Implantação e Transição Final (Cutover)',
  },
  stage6: {
    es: '6. Salida en Vivo (Puesta en Marcha)',
    en: '6. Go-Live & Operational Startup',
    pt: '6. Entrada em Produção (Go-Live)',
  },
};

export function translateGanttStageName(name: string, targetLang: DocumentLanguage): string {
  if (!name) return name;
  const clean = name.trim().toLowerCase();

  for (const item of Object.values(GANTT_STAGES_TRANSLATIONS)) {
    if (
      clean.includes('prepare') || clean.includes('preparaci') || clean.includes('preparaç') || clean.includes('arranque')
    ) {
      if (clean.startsWith('1') || clean.includes('kickoff') || clean.includes('inicial')) {
        return item.es.startsWith('1') ? item[targetLang] : item[targetLang];
      }
    }
    if (
      clean.includes('explore') || clean.includes('exploraci') || clean.includes('exploraç') || clean.includes('bbp') || clean.includes('fit-to-standard')
    ) {
      return GANTT_STAGES_TRANSLATIONS.stage2[targetLang];
    }
    if (
      clean.includes('realize') || clean.includes('realizaci') || clean.includes('realizaç') || clean.includes('abap') || clean.includes('parametri')
    ) {
      return GANTT_STAGES_TRANSLATIONS.stage3[targetLang];
    }
    if (
      clean.includes('pruebas') || clean.includes('testes') || clean.includes('testing') || clean.includes('uat') || clean.includes('aceptaci') || clean.includes('aceitaç')
    ) {
      return GANTT_STAGES_TRANSLATIONS.stage4[targetLang];
    }
    if (
      clean.includes('deploy') || clean.includes('despliegue') || clean.includes('implantaç') || clean.includes('cutover')
    ) {
      return GANTT_STAGES_TRANSLATIONS.stage5[targetLang];
    }
    if (
      clean.includes('go-live') || clean.includes('salida en vivo') || clean.includes('entrada em produ') || clean.includes('puesta en marcha')
    ) {
      return GANTT_STAGES_TRANSLATIONS.stage6[targetLang];
    }
  }

  return name;
}

export function localizeGanttPlan(plan: ProjectPlan, lang: DocumentLanguage): ProjectPlan {
  if (!plan || !plan.stages) return plan;
  return {
    ...plan,
    stages: plan.stages.map((stage) => ({
      ...stage,
      name: translateGanttStageName(stage.name, lang),
    })),
  };
}

// Localized Default Presets (Hoy vs Queda Construido)
export const LOCALIZED_PRESETS: Record<DocumentLanguage, Record<string, { hoy: string; quedaConstruido: string }>> = {
  es: {
    default: {
      hoy: 'Procesos operativos y de negocio gestionados con herramientas heterogéneas o sistemas manuales fuera de un estándar empresarial. Falta de trazabilidad en tiempo real, reprocesos administrativos y demoras en la toma de decisiones.',
      quedaConstruido: 'Solución empresarial integral configurada bajo estándares de mejores prácticas. Procesos automatizados de extremo a extremo, integración nativa con el ecosistema de sistemas, trazabilidad inmutable y adopción fluida por los usuarios.',
    },
    payroll: {
      hoy: 'Procesamiento de nómina disperso con riesgo de errores en cálculos de leyes sociales, alta carga manual en la generación de archivos para Previred y bancos, y demoras en la contabilización hacia el sistema ERP.',
      quedaConstruido: 'Servicio externalizado de nómina con cálculo certificado de remuneraciones, control de asistencia integrado, archivos bancarios/previsionales automatizados y generación directa de asientos contables hacia SAP u otro ERP.',
    },
    headhunting: {
      hoy: 'Posiciones clave vacantes con impacto negativo en la operación, procesos de selección largos sin evaluaciones técnicas validadas y dependencia de postulaciones espontáneas sin prospección ejecutiva directa.',
      quedaConstruido: 'Proceso estructurado de Headhunting con levantamiento de perfil técnico, evaluación psicolaboral por competencias STAR, terna de candidatos de alto nivel con garantía de reposición y fee de éxito transparente.',
    },
    conversion: {
      hoy: 'Entorno SAP ERP tradicional con código personalizado obsoleto, tablas no optimizadas para HANA y riesgo de incompatibilidad técnica en la transición hacia S/4HANA.',
      quedaConstruido: 'Migración técnica y funcional estructurada a SAP S/4HANA con remediación de código ABAP, adopción del modelo de datos simplificado, migración de Business Partners y validación integral de procesos críticos.',
    },
    abapFactory: {
      hoy: 'Acumulación de requerimientos de desarrollo sin estándares uniformes, interfaces complejas no responsivas y retrasos en la entrega de reportes y aplicaciones de usuario.',
      quedaConstruido: 'Fábrica de software ágil bajo estándares SAP Fiori y ABAP Cloud, con entregas continuas en CDS Views, APIs OData, aplicaciones responsive y documentación técnica exhaustiva.',
    },
  },
  en: {
    default: {
      hoy: 'Operational and business processes managed across heterogeneous tools or manual spreadsheets outside enterprise standards. Lack of real-time traceability, administrative rework, and bottlenecks in strategic decision-making.',
      quedaConstruido: 'End-to-end enterprise solution configured according to SAP best practices. Automated business workflows, native integration with surrounding systems, immutable audit trails, and seamless user adoption.',
    },
    payroll: {
      hoy: 'Fragmented payroll processing posing compliance risks in statutory deductions and labor taxes, heavy manual burden generating social security and banking files, and ledger posting lags into the ERP.',
      quedaConstruido: 'Outsourced certified payroll service with automated labor compliance, integrated time & attendance tracking, automated banking and social security files, and direct automated journal entries into SAP.',
    },
    headhunting: {
      hoy: 'Critical vacant roles hindering core business operations, prolonged recruiting cycles lacking verified technical evaluations, and over-reliance on passive candidates without executive direct-sourcing.',
      quedaConstruido: 'Structured executive search with deep technical scoping, STAR-competency behavioral assessments, high-caliber candidate shortlists with replacement warranty, and clear performance-based success fees.',
    },
    conversion: {
      hoy: 'Legacy SAP ERP system with obsolete custom code, unoptimized database tables for HANA, and technical incompatibility hurdles obstructing transition toward modern S/4HANA architectures.',
      quedaConstruido: 'Structured technical and functional transition to SAP S/4HANA featuring automated ABAP remediation, simplified data model adoption, Business Partner consolidation, and end-to-end critical process validation.',
    },
    abapFactory: {
      hoy: 'Backlog of development backlog lacking uniform design standards, rigid non-responsive interfaces, and prolonged turnaround times delivering custom business reports and user apps.',
      quedaConstruido: 'Agile development factory governed by SAP Fiori and ABAP Cloud principles, delivering continuous value via Core Data Services (CDS), OData APIs, responsive UX, and comprehensive documentation.',
    },
  },
  pt: {
    default: {
      hoy: 'Processos operacionais e de negócio geridos por ferramentas heterogêneas ou controles manuais fora dos padrões corporativos. Ausência de rastreabilidade em tempo real, retrabalho administrativo e lentidão nas tomadas de decisão.',
      quedaConstruido: 'Solução empresarial ponta a ponta configurada com as melhores práticas de mercado. Fluxos de trabalho automatizados, integração nativa com sistemas legados, auditoria contínua e rápida adoção pelos usuários.',
    },
    payroll: {
      hoy: 'Processamento de folha de pagamento disperso com riscos de inconformidades em encargos sociais, alto esforço manual na geração de remessas bancárias e atrasos na integração contábil com o ERP.',
      quedaConstruido: 'Serviço terceirizado de folha de pagamento com cálculo certificado, controle integrado de ponto, geração automatizada de arquivos bancários e previdenciários e contabilização direta no SAP.',
    },
    headhunting: {
      hoy: 'Vagas estratégicas abertas prejudicando a operação, processos seletivos demorados sem validação técnica aprofundada e dependência de candidaturas espontâneas sem hunting executivo proativo.',
      quedaConstruido: 'Processo estruturado de Recrutamento Executivo (Headhunting) com alinhamento técnico detalhado, avaliação por competências STAR, shortlist de alta qualificação com garantia de reposição e fee transparente.',
    },
    conversion: {
      hoy: 'Ambiente SAP ECC tradicional com código Z obsoleto, base de dados não otimizada para HANA e riscos técnicos que dificultam a migração para a nova arquitetura S/4HANA.',
      quedaConstruido: 'Migração técnica e funcional estruturada para SAP S/4HANA com remediação de código ABAP, adoção do modelo de dados simplificado, unificação de Business Partners e homologação completa dos processos críticos.',
    },
    abapFactory: {
      hoy: 'Acúmulo de demandas de desenvolvimento sem padronização técnica, telas complexas não responsivas e morosidade na entrega de novos relatórios e programas de apoio.',
      quedaConstruido: 'Fábrica de software ágil sob diretrizes SAP Fiori e ABAP Cloud, com entregas contínuas em CDS Views, serviços OData, aplicativos responsivos modernos e documentação técnica detalhada.',
    },
  },
};

export function getLocalizedDossierPresets(projectType: ProjectType, lang: DocumentLanguage = 'es'): { hoy: string; quedaConstruido: string } {
  const table = LOCALIZED_PRESETS[lang] || LOCALIZED_PRESETS.es;
  switch (projectType) {
    case 'Proceso de Remuneraciones (Payroll)':
      return table.payroll;
    case 'Reclutamiento, Selección & Headhunting':
      return table.headhunting;
    case 'Conversión S/4HANA':
      return table.conversion;
    case 'Fábrica ABAP / Fiori':
      return table.abapFactory;
    default:
      return table.default;
  }
}

export const LOCALIZED_GATEKEEPER: Record<DocumentLanguage, string> = {
  es: 'El cómputo del plazo de ejecución no comienza a correr hasta la entrega formal de los requisitos y accesos por parte del cliente (credenciales de prueba, confirmación de interlocutores técnicos y contrato firmado). Cada día hábil de atraso en la provisión de estos insumos corre la fecha de término en idéntica proporción.',
  en: 'The project execution timeline will strictly commence upon formal receipt of all prerequisite deliverables and technical access from the client (test credentials, designated technical counterparts, and signed agreement). Each business day of delay in providing these prerequisites will adjust the completion date proportionally.',
  pt: 'A contagem do prazo de execução não se iniciará antes da entrega formal de todos os requisitos e acessos de responsabilidade do cliente (credenciais de homologação, indicação de interlocutores técnicos e contrato assinado). Cada dia útil de atraso no fornecimento destes insumos prorrogará a data de conclusão na mesma proporção.',
};

export const LOCALIZED_RISKS: Record<DocumentLanguage, RiskMitigationItem[]> = {
  es: [
    {
      id: 'r1',
      risk: 'Demora en provisión de accesos, VPN o firewall',
      impact: 'Atraso en el inicio efectivo de las pruebas de sincronización y configuración de ambientes.',
      mitigation: 'El cómputo de los días hábiles no parte hasta recibir la confirmación técnica formal de conectividad.',
      owner: 'Cliente',
    },
    {
      id: 'r2',
      risk: 'Definición tardía de reglas de negocio o aprobación de especificaciones',
      impact: 'Tensión en el cronograma de diseño funcional y desfase en entregas de configuración.',
      mitigation: 'Designación obligatoria de un interlocutor con poder de decisión técnica y respuesta en máximo 1 día hábil.',
      owner: 'Ambos',
    },
    {
      id: 'r3',
      risk: 'Concurrencia o bloqueos transaccionales en bases de datos o ERP legado',
      impact: 'Fallos transitorios o bloqueos de interfaz durante ejecuciones simultáneas.',
      mitigation: 'Implementación de reintentos automáticos con backoff exponencial y procesamiento seguro en lotes controlados.',
      owner: 'Consultora',
    },
    {
      id: 'r4',
      risk: 'Solicitud de requerimientos fuera del alcance sin control formal',
      impact: 'Desviación presupuestaria y aumento no planificado de horas de desarrollo.',
      mitigation: 'Límite escrito claro: cualquier solicitud no contemplada en el inventario se gestiona vía Orden de Cambio formal.',
      owner: 'Ambos',
    },
  ],
  en: [
    {
      id: 'r1',
      risk: 'Delays in provisioning network access, VPN or firewall authorizations',
      impact: 'Postpones kickoff of interface synchronization testing and environment configuration.',
      mitigation: 'Business day calculation strictly starts upon formal technical confirmation of end-to-end connectivity.',
      owner: 'Client',
    },
    {
      id: 'r2',
      risk: 'Late definition of core business rules or delayed specification sign-off',
      impact: 'Puts stress on functional design schedule and shifts configuration milestones.',
      mitigation: 'Mandatory appointment of an empowered technical stakeholder with SLA response within 1 business day.',
      owner: 'Both Parties',
    },
    {
      id: 'r3',
      risk: 'Transactional deadlocks or concurrency bottlenecks on legacy database/ERP',
      impact: 'Transient communication failures or blocked interface batches during peak processing.',
      mitigation: 'Implementation of automated exponential backoff retries and resilient throttled batch processing.',
      owner: 'Consulting Firm',
    },
    {
      id: 'r4',
      risk: 'Informal out-of-scope feature requests without change control',
      impact: 'Budget variance and unplanned development hour consumption.',
      mitigation: 'Strict contractual baseline: any requirement not included in the scope is managed via formal Change Request.',
      owner: 'Both Parties',
    },
  ],
  pt: [
    {
      id: 'r1',
      risk: 'Atraso na liberação de acessos, VPN ou regras de firewall',
      impact: 'Retarda o início das parametrizações de ambientes e testes de integração.',
      mitigation: 'A contagem dos prazos úteis só tem início após confirmação formal da conectividade técnica total.',
      owner: 'Cliente',
    },
    {
      id: 'r2',
      risk: 'Definição tardia de regras de negócio ou homologação de especificações',
      impact: 'Pressão no cronograma de desenho funcional e defasagem nas entregas.',
      mitigation: 'Designação obrigatória de ponto focal com poder de decisão e prazo máximo de resposta de 1 dia útil.',
      owner: 'Ambas as Partes',
    },
    {
      id: 'r3',
      risk: 'Concorrência transacional ou travamentos em bases de dados ou ERP legado',
      impact: 'Falhas transitórias ou bloqueios de fila durante processamentos simultâneos.',
      mitigation: 'Implementação de reprocessamento automático com backoff exponencial e execução segura em lotes controlados.',
      owner: 'Consultoria',
    },
    {
      id: 'r4',
      risk: 'Demandas fora do escopo sem controle formal de solicitações',
      impact: 'Desvio orçamentário e consumo imprevisto de horas de consultoria.',
      mitigation: 'Limite contratual estrito: qualquer demanda não prevista é tratada via Ordem de Mudança formal.',
      owner: 'Ambas as Partes',
    },
  ],
};

export const LOCALIZED_OUT_OF_SCOPE: Record<DocumentLanguage, OutOfScopeCategoryItem[]> = {
  es: [
    {
      id: 'oosc-1',
      title: 'Infraestructura & Licenciamiento Base',
      description: 'Licencias de software base (SAP, bases de datos o sistemas de terceros); consumos directos de proveedores de nube (AWS, Azure, GCP); registro de dominios corporativos o certificados SSL.',
    },
    {
      id: 'oosc-2',
      title: 'Desarrollos y Transacciones no Especificadas',
      description: 'Programas Z no inventariados en esta oferta, transacciones ABAP fuera del alcance descrito, módulos de analítica avanzada BI o migraciones históricas masivas no cotizadas.',
    },
    {
      id: 'oosc-3',
      title: 'Soporte y Disponibilidad fuera de Ventana Hábil',
      description: 'Guardia presencial 24/7 en fines de semana o festivos (el hipercare estándar cubre horario hábil lunes a viernes de 09:00 a 18:00 hrs).',
    },
    {
      id: 'oosc-4',
      title: 'Capacitaciones Masivas o Rediseños de Identidad',
      description: 'Talleres presenciales con más de 2 sesiones formales; edición o filmación audiovisual de cursos e-learning; rediseño de marca o manuales no descritos.',
    },
  ],
  en: [
    {
      id: 'oosc-1',
      title: 'Base Infrastructure & Software Licenses',
      description: 'Base software licenses (SAP, relational databases, third-party platforms); direct public cloud consumption (AWS, Azure, GCP); corporate domain acquisition or SSL certificates.',
    },
    {
      id: 'oosc-2',
      title: 'Unspecified Custom Developments & Transactions',
      description: 'Custom Z-programs not inventoried in this offer, ABAP transactions outside specified scope, advanced BI analytic modules, or legacy historical bulk data migrations not quoted.',
    },
    {
      id: 'oosc-3',
      title: 'Support Outside Standard Business Hours',
      description: '24/7 on-site weekend or holiday standby (standard hypercare covers regular business hours Monday through Friday, 09:00 to 18:00).',
    },
    {
      id: 'oosc-4',
      title: 'Mass Training or Corporate Identity Redesign',
      description: 'In-person workshops exceeding 2 formal sessions; audiovisual recording/editing of e-learning courses; brand overhaul or unspecified user manuals.',
    },
  ],
  pt: [
    {
      id: 'oosc-1',
      title: 'Infraestrutura & Licenciamento Base',
      description: 'Licenciamento de software básico (SAP, bancos de dados, softwares terceiros); faturamento direto de nuvem (AWS, Azure, GCP); aquisição de domínios corporativos ou certificados digitais SSL.',
    },
    {
      id: 'oosc-2',
      title: 'Desenvolvimentos e Transações Não Especificadas',
      description: 'Programas Z não inventariados nesta proposta, transações ABAP fora do escopo, módulos de analytics/BI avançado ou migrações em massa de dados legados não orçadas.',
    },
    {
      id: 'oosc-3',
      title: 'Suporte Fora do Horário Comercial',
      description: 'Plantão presencial 24/7 em finais de semana ou feriados (o hipercare padrão cobre dias úteis, de segunda a sexta-feira, das 09:00 às 18:00).',
    },
    {
      id: 'oosc-4',
      title: 'Treinamentos Massivos ou Identidade Visual',
      description: 'Workshops presenciais com mais de 2 sessões formais; gravação ou edição audiovisual de e-learnings; redesign de identidade visual ou manuais não discriminados.',
    },
  ],
};

export function getLocalizedGatekeeper(lang: DocumentLanguage = 'es'): string {
  return LOCALIZED_GATEKEEPER[lang] || LOCALIZED_GATEKEEPER.es;
}

export function getLocalizedRisks(lang: DocumentLanguage = 'es'): RiskMitigationItem[] {
  return LOCALIZED_RISKS[lang] || LOCALIZED_RISKS.es;
}

export function getLocalizedOutOfScope(lang: DocumentLanguage = 'es'): OutOfScopeCategoryItem[] {
  return LOCALIZED_OUT_OF_SCOPE[lang] || LOCALIZED_OUT_OF_SCOPE.es;
}
