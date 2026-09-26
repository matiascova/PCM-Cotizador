import { DocumentLanguage, Quotation } from '../types';
import { 
  getDossierTranslation, 
  localizeGanttPlan, 
  getLocalizedDossierPresets, 
  getLocalizedGatekeeper, 
  getLocalizedRisks, 
  getLocalizedOutOfScope 
} from '../utils/dossierTranslations';

/**
 * Standardized mapping for SAP project types across languages.
 */
export function getLocalizedProjectType(projectType: string | undefined, targetLang: DocumentLanguage): string {
  const pt = projectType || 'Roll-out de Módulos';

  const map: Record<string, { es: string; en: string; pt: string }> = {
    'Roll-out de Módulos': {
      es: 'Roll-out de Módulos',
      en: 'Module Roll-out',
      pt: 'Roll-out de Módulos'
    },
    'Upgrade & Migración S/4HANA': {
      es: 'Upgrade & Migración S/4HANA',
      en: 'S/4HANA Upgrade & Migration',
      pt: 'Upgrade e Migração S/4HANA'
    },
    'Bolsa de Horas de Soporte AMS': {
      es: 'Bolsa de Horas de Soporte AMS',
      en: 'AMS Support Hours Pool',
      pt: 'Banco de Horas de Suporte AMS'
    },
    'Desarrollo a Medida & Integraciones BTP': {
      es: 'Desarrollo a Medida & Integraciones BTP',
      en: 'Custom Development & BTP Integrations',
      pt: 'Desenvolvimento sob Medida e Integrações BTP'
    },
    'Auditoría Técnica & Optimización': {
      es: 'Auditoría Técnica & Optimización',
      en: 'Technical Audit & Optimization',
      pt: 'Auditoria Técnica e Otimização'
    },
    'Capacitación y Gestión del Cambio': {
      es: 'Capacitación y Gestión del Cambio',
      en: 'Training & Change Management',
      pt: 'Treinamento e Gestão de Mudança'
    }
  };

  // Check exact or partial match
  for (const [key, val] of Object.entries(map)) {
    if (pt === key || pt === val.en || pt === val.pt) {
      return val[targetLang] || pt;
    }
  }

  // Fallback to enterprise translation if custom project type
  return translateEnterpriseText(pt, targetLang);
}

/**
 * Translates project titles (e.g., "Consultoría y Servicios SAP para Twin Ducks Capital")
 * keeping client fantasy names intact and adapting terminology accurately.
 */
export function translateProjectTitle(
  title: string | undefined,
  targetLang: DocumentLanguage,
  clientName?: string
): string {
  if (!title) {
    if (targetLang === 'en') return `SAP Consulting & Services for ${clientName || 'Client'}`;
    if (targetLang === 'pt') return `Consultoria e Serviços SAP para ${clientName || 'Cliente'}`;
    return `Consultoría y Servicios SAP para ${clientName || 'Cliente'}`;
  }

  // Standard phrase matching: "Consultoría y Servicios SAP para [Client]"
  const paraMatch = title.match(/^(?:Consultoría y Servicios SAP|Consultoria e Serviços SAP|SAP Consulting & Services)\s+(?:para|for)\s+(.+)$/i);
  if (paraMatch) {
    const clientPart = paraMatch[1].trim();
    if (targetLang === 'en') return `SAP Consulting & Services for ${clientPart}`;
    if (targetLang === 'pt') return `Consultoria e Serviços SAP para ${clientPart}`;
    return `Consultoría y Servicios SAP para ${clientPart}`;
  }

  const consultoriaParaMatch = title.match(/^(?:Consultoría SAP|Consultoria SAP|SAP Consulting)\s+(?:para|for)\s+(.+)$/i);
  if (consultoriaParaMatch) {
    const clientPart = consultoriaParaMatch[1].trim();
    if (targetLang === 'en') return `SAP Consulting for ${clientPart}`;
    if (targetLang === 'pt') return `Consultoria SAP para ${clientPart}`;
    return `Consultoría SAP para ${clientPart}`;
  }

  const implementacionParaMatch = title.match(/^(?:Implementación(?:\s+de)?|Implementação(?:\s+de)?|Implementation(?:\s+of)?)\s+(SAP\s+[^p]+)\s+(?:para|for)\s+(.+)$/i);
  if (implementacionParaMatch) {
    const sapPart = implementacionParaMatch[1].trim();
    const clientPart = implementacionParaMatch[2].trim();
    if (targetLang === 'en') return `${sapPart} Implementation for ${clientPart}`;
    if (targetLang === 'pt') return `Implementação de ${sapPart} para ${clientPart}`;
    return `Implementación de ${sapPart} para ${clientPart}`;
  }

  // General enterprise text translation
  return translateEnterpriseText(title, targetLang);
}

/**
 * High-accuracy enterprise translation dictionary and rules for SAP, ERP,
 * commercial scopes, objectives, and contracts.
 */
export function translateEnterpriseText(
  text: string | undefined,
  targetLang: DocumentLanguage,
  sourceLang: DocumentLanguage = 'es'
): string {
  if (!text || text.trim() === '') return '';
  if (targetLang === sourceLang && targetLang === 'es') return text;

  let result = text;

  if (targetLang === 'pt') {
    // 1. Phrasal replacements
    const phrasalMapPt: [RegExp, string][] = [
      [/\bConsultoría y Servicios SAP\b/gi, 'Consultoria e Serviços SAP'],
      [/\bConsultoría SAP\b/gi, 'Consultoria SAP'],
      [/\bServicios Profesionales SAP\b/gi, 'Serviços Profissionais SAP'],
      [/\bImplementar integración con\b/gi, 'Implementar integração com'],
      [/\bimplementar integración con\b/gi, 'implementar integração com'],
      [/\bIntegración con\b/gi, 'Integração com'],
      [/\bintegración con\b/gi, 'integração com'],
      [/\bfacturación electrónica\b/gi, 'faturamento eletrônico'],
      [/\bFacturación Electrónica\b/gi, 'Faturamento Eletrônico'],
      [/\bpuesta en marcha\b/gi, 'entrada em produção'],
      [/\bPuesta en marcha\b/gi, 'Entrada em produção'],
      [/\ben producción\b/gi, 'em produção'],
      [/\bgarantía hipercare\b/gi, 'garantia hypercare'],
      [/\bpruebas integrales\b/gi, 'testes integrados'],
      [/\bpruebas unitarias\b/gi, 'testes unitários'],
      [/\busuarios clave\b/gi, 'usuários-chave'],
      [/\bgestión del cambio\b/gi, 'gestão de mudança'],
      [/\bgestión de cambio\b/gi, 'gestão de mudança'],
      [/\bfecha factura\b/gi, 'data da fatura'],
      [/\btras aceptación de hito\b/gi, 'após homologação do marco'],
      [/\bcontra entrega final\b/gi, 'na entrega final'],
      [/\banticipo al inicio\b/gi, 'adiantamento no início'],
      [/\bcondiciones comerciales\b/gi, 'condições comerciais'],
      [/\bplazo de ejecución\b/gi, 'prazo de execução'],
      [/\bforma de pago\b/gi, 'forma de pagamento'],
      [/\bárea de finanzas\b/gi, 'área financeira'],
      [/\bárea de compras\b/gi, 'área de compras'],
      [/\bárea de ventas\b/gi, 'área de vendas']
    ];

    for (const [pattern, replacement] of phrasalMapPt) {
      result = result.replace(pattern, replacement);
    }

    // 2. Lexical word replacements
    const wordMapPt: [RegExp, string][] = [
      [/\bConsultoría\b/g, 'Consultoria'],
      [/\bconsultoría\b/g, 'consultoria'],
      [/\bServicios\b/g, 'Serviços'],
      [/\bservicios\b/g, 'serviços'],
      [/\bIntegración\b/g, 'Integração'],
      [/\bintegración\b/g, 'integração'],
      [/\bImplementación\b/g, 'Implementação'],
      [/\bimplementación\b/g, 'implementação'],
      [/\bConfiguración\b/g, 'Configuração'],
      [/\bconfiguración\b/g, 'configuração'],
      [/\bMigración\b/g, 'Migração'],
      [/\bmigración\b/g, 'migração'],
      [/\bOptimización\b/g, 'Otimização'],
      [/\boptimización\b/g, 'otimização'],
      [/\bCapacitación\b/g, 'Treinamento'],
      [/\bcapacitación\b/g, 'treinamento'],
      [/\bDesarrollo\b/g, 'Desenvolvimento'],
      [/\bdesarrollo\b/g, 'desenvolvimento'],
      [/\bSoporte\b/g, 'Suporte'],
      [/\bsoporte\b/g, 'suporte'],
      [/\bAlcance\b/g, 'Escopo'],
      [/\balcance\b/g, 'escopo'],
      [/\bProyecto\b/g, 'Projeto'],
      [/\bproyecto\b/g, 'projeto'],
      [/\bPropuesta\b/g, 'Proposta'],
      [/\bpropuesta\b/g, 'proposta'],
      [/\bHitos\b/g, 'Marcos'],
      [/\bhitos\b/g, 'marcos'],
      [/\bEntregables\b/g, 'Entregáveis'],
      [/\bentregables\b/g, 'entregáveis'],
      [/\bGarantía\b/g, 'Garantia'],
      [/\bgarantía\b/g, 'garantia'],
      [/\bFacturación\b/g, 'Faturamento'],
      [/\bfacturación\b/g, 'faturamento'],
      [/\bElectrónica\b/g, 'Eletrônica'],
      [/\belectrónica\b/g, 'eletrônica'],
      [/\bElectrónico\b/g, 'Eletrônico'],
      [/\belectrónico\b/g, 'eletrônico'],
      [/\bSolución\b/g, 'Solução'],
      [/\bsolución\b/g, 'solução'],
      [/\bProducción\b/g, 'Produção'],
      [/\bproducción\b/g, 'produção'],
      [/\bGestión\b/g, 'Gestão'],
      [/\bgestión\b/g, 'gestão'],
      [/\bcon\b/g, 'com'],
      [/\bdel\b/g, 'do'],
      [/\bde la\b/g, 'da'],
      [/\ben\b/g, 'em'],
      [/\by\b/g, 'e'],
      [/\bdías\b/g, 'dias'],
      [/\bsemanas\b/g, 'semanas'],
      [/\bmeses\b/g, 'meses']
    ];

    for (const [pattern, replacement] of wordMapPt) {
      result = result.replace(pattern, replacement);
    }
  } else if (targetLang === 'en') {
    // 1. Phrasal replacements
    const phrasalMapEn: [RegExp, string][] = [
      [/\bConsultoría y Servicios SAP para\b/gi, 'SAP Consulting & Services for'],
      [/\bConsultoría y Servicios SAP\b/gi, 'SAP Consulting & Services'],
      [/\bConsultoria e Serviços SAP para\b/gi, 'SAP Consulting & Services for'],
      [/\bConsultoria e Serviços SAP\b/gi, 'SAP Consulting & Services'],
      [/\bConsultoría SAP para\b/gi, 'SAP Consulting for'],
      [/\bConsultoría SAP\b/gi, 'SAP Consulting'],
      [/\bServicios Profesionales SAP\b/gi, 'Professional SAP Services'],
      [/\bImplementar integración con\b/gi, 'Implement integration with'],
      [/\bimplementar integración con\b/gi, 'implement integration with'],
      [/\bIntegración con sistema de facturación electrónica\b/gi, 'Integration with electronic invoicing system'],
      [/\bIntegración con\b/gi, 'Integration with'],
      [/\bintegración con\b/gi, 'integration with'],
      [/\bfacturación electrónica\b/gi, 'electronic invoicing'],
      [/\bFacturación Electrónica\b/gi, 'Electronic Invoicing'],
      [/\bpuesta en marcha\b/gi, 'go-live & deployment'],
      [/\bPuesta en marcha\b/gi, 'Go-Live & Deployment'],
      [/\ben producción\b/gi, 'in production'],
      [/\bgarantía hipercare\b/gi, 'hypercare warranty'],
      [/\bpruebas integrales\b/gi, 'integration testing (UAT)'],
      [/\bpruebas unitarias\b/gi, 'unit testing'],
      [/\busuarios clave\b/gi, 'key users'],
      [/\bgestión del cambio\b/gi, 'change management'],
      [/\bgestión de cambio\b/gi, 'change management'],
      [/\bfecha factura\b/gi, 'invoice date'],
      [/\btras aceptación de hito\b/gi, 'upon milestone sign-off'],
      [/\bcontra entrega final\b/gi, 'upon final delivery'],
      [/\banticipo al inicio\b/gi, 'upfront at kickoff'],
      [/\bcondiciones comerciales\b/gi, 'commercial conditions'],
      [/\bplazo de ejecución\b/gi, 'execution timeline'],
      [/\bforma de pago\b/gi, 'payment terms']
    ];

    for (const [pattern, replacement] of phrasalMapEn) {
      result = result.replace(pattern, replacement);
    }

    // 2. Lexical word replacements
    const wordMapEn: [RegExp, string][] = [
      [/\bImplementar\b/g, 'Implement'],
      [/\bimplementar\b/g, 'implement'],
      [/\bConsultoría\b/g, 'Consulting'],
      [/\bconsultoría\b/g, 'consulting'],
      [/\bConsultoria\b/g, 'Consulting'],
      [/\bconsultoria\b/g, 'consulting'],
      [/\bServicios\b/g, 'Services'],
      [/\bservicios\b/g, 'services'],
      [/\bServiços\b/g, 'Services'],
      [/\bserviços\b/g, 'services'],
      [/\bIntegración\b/g, 'Integration'],
      [/\bintegración\b/g, 'integration'],
      [/\bIntegração\b/g, 'Integration'],
      [/\bintegração\b/g, 'integration'],
      [/\bImplementación\b/g, 'Implementation'],
      [/\bimplementación\b/g, 'implementation'],
      [/\bImplementação\b/g, 'Implementation'],
      [/\bimplementação\b/g, 'implementation'],
      [/\bConfiguración\b/g, 'Configuration'],
      [/\bconfiguración\b/g, 'configuration'],
      [/\bMigración\b/g, 'Migration'],
      [/\bmigración\b/g, 'migration'],
      [/\bOptimización\b/g, 'Optimization'],
      [/\boptimización\b/g, 'optimization'],
      [/\bCapacitación\b/g, 'Training'],
      [/\bcapacitación\b/g, 'training'],
      [/\bDesarrollo\b/g, 'Development'],
      [/\bdesarrollo\b/g, 'development'],
      [/\bSoporte\b/g, 'Support'],
      [/\bsoporte\b/g, 'support'],
      [/\bAlcance\b/g, 'Scope'],
      [/\balcance\b/g, 'scope'],
      [/\bProyecto\b/g, 'Project'],
      [/\bproyecto\b/g, 'project'],
      [/\bPropuesta\b/g, 'Proposal'],
      [/\bpropuesta\b/g, 'proposal'],
      [/\bHitos\b/g, 'Milestones'],
      [/\bhitos\b/g, 'milestones'],
      [/\bEntregables\b/g, 'Deliverables'],
      [/\bentregables\b/g, 'deliverables'],
      [/\bGarantía\b/g, 'Warranty'],
      [/\bgarantía\b/g, 'warranty'],
      [/\bFacturación\b/g, 'Invoicing'],
      [/\bfacturación\b/g, 'invoicing'],
      [/\bElectrónica\b/g, 'Electronic'],
      [/\belectrónica\b/g, 'electronic'],
      [/\bElectrónico\b/g, 'Electronic'],
      [/\belectrónico\b/g, 'electronic'],
      [/\bSolución\b/g, 'Solution'],
      [/\bsolución\b/g, 'solution'],
      [/\bProducción\b/g, 'Production'],
      [/\bproducción\b/g, 'production'],
      [/\bGestión\b/g, 'Management'],
      [/\bgestión\b/g, 'management'],
      [/\bpara\b/g, 'for'],
      [/\bcon\b/g, 'with'],
      [/\bcom\b/g, 'with'],
      [/\bdel\b/g, 'of the'],
      [/\bde la\b/g, 'of the'],
      [/\bde los\b/g, 'of the'],
      [/\by\b/g, 'and'],
      [/\be\b/g, 'and'],
      [/\bdías\b/g, 'days'],
      [/\bsemanas\b/g, 'weeks'],
      [/\bmeses\b/g, 'months']
    ];

    for (const [pattern, replacement] of wordMapEn) {
      result = result.replace(pattern, replacement);
    }
  } else if (targetLang === 'es') {
    // Reverse translations if needed
    result = result
      .replace(/\bSAP Consulting & Services for\b/gi, 'Consultoría y Servicios SAP para')
      .replace(/\bSAP Consulting & Services\b/gi, 'Consultoría y Servicios SAP')
      .replace(/\bConsultoria e Serviços SAP para\b/gi, 'Consultoría y Servicios SAP para')
      .replace(/\bConsultoria e Serviços SAP\b/gi, 'Consultoría y Servicios SAP')
      .replace(/\bImplement integration with\b/gi, 'Implementar integración con')
      .replace(/\bImplementar integração com\b/gi, 'Implementar integración con')
      .replace(/\bintegração com\b/gi, 'integración con')
      .replace(/\bintegration with\b/gi, 'integración con');
  }

  return result;
}

export async function translateTextsViaApi(
  texts: string[],
  targetLanguage: DocumentLanguage,
  sourceLanguage: DocumentLanguage = 'es'
): Promise<string[]> {
  if (targetLanguage === sourceLanguage) return texts;
  if (!texts || texts.length === 0) return [];

  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts, targetLanguage, sourceLanguage }),
    });

    if (!res.ok) {
      return texts.map(t => translateEnterpriseText(t, targetLanguage, sourceLanguage));
    }

    const data = await res.json();
    if (data && Array.isArray(data.translatedTexts) && data.translatedTexts.length === texts.length) {
      // If server returned unmodified strings (e.g. GEMINI_API_KEY missing), enhance with our enterprise dictionary
      return data.translatedTexts.map((txt: string, i: number) => {
        if (txt === texts[i]) {
          return translateEnterpriseText(txt, targetLanguage, sourceLanguage);
        }
        return txt;
      });
    }
  } catch (err) {
    console.warn('Translate API call failed, using high-accuracy enterprise dictionary:', err);
  }

  return texts.map(t => translateEnterpriseText(t, targetLanguage, sourceLanguage));
}

/**
 * Creates a translated copy of a quotation for the target language.
 * Localizes title, objective, scope, structure, presets, risk items, out-of-scope,
 * gatekeeper condition, and Gantt stages.
 */
export function localizeQuotation(quote: Quotation, targetLang: DocumentLanguage): Quotation {
  const currentLang = quote.documentLanguage || 'es';
  if (currentLang === targetLang) return quote;

  const presets = getLocalizedDossierPresets(quote.project.projectType || 'Roll-out de Módulos', targetLang);
  const localizedGantt = quote.ganttPlan ? localizeGanttPlan(quote.ganttPlan, targetLang) : undefined;

  const clientDisplayName = quote.client.fantasyName || quote.client.companyName;
  const localizedTitle = translateProjectTitle(quote.project.projectTitle, targetLang, clientDisplayName);
  const localizedObjective = translateEnterpriseText(quote.project.businessObjective, targetLang, currentLang);
  const localizedScope = translateEnterpriseText(quote.project.scopeDescription, targetLang, currentLang);
  const localizedProjectType = getLocalizedProjectType(quote.project.projectType, targetLang);
  const localizedPaymentTerms = translateEnterpriseText(quote.paymentTerms, targetLang, currentLang);

  return {
    ...quote,
    documentLanguage: targetLang,
    project: {
      ...quote.project,
      projectTitle: localizedTitle,
      businessObjective: localizedObjective,
      scopeDescription: localizedScope,
      projectType: localizedProjectType
    },
    paymentTerms: localizedPaymentTerms,
    currentSituationHoy: presets.hoy,
    builtSolutionQuedaConstruido: presets.quedaConstruido,
    gatekeeperCondition: getLocalizedGatekeeper(targetLang),
    riskItems: getLocalizedRisks(targetLang),
    outOfScopeCategories: getLocalizedOutOfScope(targetLang),
    ganttPlan: localizedGantt,
  };
}

/**
 * Translates custom textual fields of a quotation using Gemini API (/api/translate),
 * while falling back smoothly to structure and presets localization.
 */
export async function translateQuotationDeep(
  quote: Quotation, 
  targetLang: DocumentLanguage
): Promise<Quotation> {
  const baseLocalized = localizeQuotation(quote, targetLang);
  if ((quote.documentLanguage || 'es') === targetLang) {
    return baseLocalized;
  }

  const textsToTranslate = [
    quote.project.projectTitle || '',
    quote.project.scopeDescription || '',
    quote.project.businessObjective || '',
    quote.paymentTerms || '',
    quote.currentSituationHoy || '',
    quote.builtSolutionQuedaConstruido || ''
  ];

  try {
    const translated = await translateTextsViaApi(
      textsToTranslate, 
      targetLang, 
      quote.documentLanguage || 'es'
    );

    return {
      ...baseLocalized,
      project: {
        ...baseLocalized.project,
        projectTitle: translated[0] || baseLocalized.project.projectTitle,
        scopeDescription: translated[1] || baseLocalized.project.scopeDescription,
        businessObjective: translated[2] || baseLocalized.project.businessObjective,
      },
      paymentTerms: translated[3] || baseLocalized.paymentTerms,
      currentSituationHoy: translated[4] || baseLocalized.currentSituationHoy,
      builtSolutionQuedaConstruido: translated[5] || baseLocalized.builtSolutionQuedaConstruido,
    };
  } catch {
    return baseLocalized;
  }
}

