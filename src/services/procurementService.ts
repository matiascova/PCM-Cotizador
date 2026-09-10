import { 
  Quotation, 
  SapResourceItem, 
  ServicePurchaseRequisition, 
  ServicePurchaseOrder, 
  ServicePoItem,
  ServiceEntrySheet,
  SolpedStatus,
  PurchaseOrderStatus,
  SupportedCurrency,
  SapModuleCode,
  SeniorityLevel
} from '../types';

const SOLPEDS_STORAGE_KEY = 'sap_procurement_solpeds_v1';
const PO_STORAGE_KEY = 'sap_procurement_purchase_orders_v1';

// Initial pre-configured SOLPEDs & POs to demonstrate SAP MM Procurement flow
export const INITIAL_SOLPEDS: ServicePurchaseRequisition[] = [
  {
    id: 'sol-001',
    solpedNumber: '10000042',
    documentType: 'NB',
    itemCategory: 'D',
    accountAssignmentCategory: 'P',
    pepElement: 'PEP-PRJ-2026-002.1',
    costCenter: 'CC-10200',
    quotationId: 'quote-sap-002',
    quotationCode: 'COT-SAP-2026-002',
    clientCompanyName: 'Grupo Financiero Banorte S.A.B.',
    projectTitle: 'Implementación Integral SAP HCM & Nómina México S/4HANA',
    resourceId: 'res-hcm-ext-01',
    positionNumber: 10,
    roleTitle: 'Consultor Líder de Nómina SAP HCM México',
    moduleCode: 'SAP_HCM',
    moduleName: 'SAP HCM (Human Capital Management)',
    seniority: 'Lead / Arquitecto',
    supplierName: 'Talent & SAP Partners México S.A. de C.V.',
    supplierTaxId: 'MX-TPM140520AB3',
    hours: 280,
    unit: 'HUR',
    hourlyRate: 1850,
    currency: 'MXN',
    currencySymbol: '$',
    totalAmount: 518000,
    status: 'approved',
    releaseStrategy: {
      group: 'SR',
      code: 'L2',
      releasedBy: 'Ing. Carlos Mendoza (Gerente de Compras & Proyectos)',
      releasedAt: '2026-08-20'
    },
    requisitioner: 'PMO Lead / Jefe de Proyecto SAP',
    createdAt: '2026-08-18',
    notes: 'Subcontratación de experto local en timbrado CFDI de nómina y Seguro Social IMSS para el proyecto Banorte.'
  },
  {
    id: 'sol-002',
    solpedNumber: '10000043',
    documentType: 'NB',
    itemCategory: 'D',
    accountAssignmentCategory: 'P',
    pepElement: 'PEP-PRJ-2026-001.2',
    costCenter: 'CC-10150',
    quotationId: 'quote-sap-001',
    quotationCode: 'COT-SAP-2026-001',
    clientCompanyName: 'Minera Andina del Cobre S.A.',
    projectTitle: 'Rollout Logístico, Mantenimiento y Calidad SAP MM, LE, PM y QM',
    resourceId: 'res-03',
    positionNumber: 10,
    roleTitle: 'Consultor Especialista Mantenimiento SAP PM Planta',
    moduleCode: 'SAP_PM',
    moduleName: 'SAP PM (Plant Maintenance)',
    seniority: 'Senior',
    supplierName: 'Heavy Machinery & Mining Tech SpA',
    supplierTaxId: 'CL-76.992.341-K',
    hours: 200,
    unit: 'HUR',
    hourlyRate: 75000,
    currency: 'CLP',
    currencySymbol: '$',
    totalAmount: 15000000,
    status: 'converted_to_po',
    convertedPoId: 'po-001',
    convertedPoNumber: '4500000101',
    releaseStrategy: {
      group: 'SR',
      code: 'L1',
      releasedBy: 'Ing. Roberto Valenzuela',
      releasedAt: '2026-08-16'
    },
    requisitioner: 'Jefe de Proyecto Minería',
    createdAt: '2026-08-15',
    notes: 'Consultor de terreno para configuración de planes de calibración y avisos de avería en faena minera.'
  }
];

export const INITIAL_PURCHASE_ORDERS: ServicePurchaseOrder[] = [
  {
    id: 'po-001',
    poNumber: '4500000101',
    solpedId: 'sol-002',
    solpedNumber: '10000043',
    documentType: 'NB',
    quotationId: 'quote-sap-001',
    quotationCode: 'COT-SAP-2026-001',
    clientCompanyName: 'Minera Andina del Cobre S.A.',
    projectTitle: 'Rollout Logístico, Mantenimiento y Calidad SAP MM, LE, PM y QM',
    supplierName: 'Heavy Machinery & Mining Tech SpA',
    supplierTaxId: 'CL-76.992.341-K',
    supplierEmail: 'contacto@miningtech.cl',
    supplierContact: 'Patricio Oyarzún (Key Account Manager)',
    paymentTerms: '30 días fecha factura previa aprobación de HES (Hoja de Entrada de Servicios)',
    roleTitle: 'Consultor Especialista Mantenimiento SAP PM Planta',
    moduleCode: 'SAP_PM',
    hoursContracted: 200,
    hourlyRate: 75000,
    currency: 'CLP',
    currencySymbol: '$',
    netAmount: 15000000,
    taxRatePercentage: 19,
    taxAmount: 2850000,
    totalAmount: 17850000,
    pepElement: 'PEP-PRJ-2026-001.2',
    costCenter: 'CC-10150',
    issueDate: '2026-08-17',
    estimatedDeliveryDate: '2026-11-30',
    status: 'in_execution',
    serviceEntrySheets: [
      {
        id: 'hes-01',
        hesNumber: '10001',
        date: '2026-08-30',
        hoursDelivered: 40,
        unit: 'HUR',
        hourlyRate: 75000,
        totalAmount: 3000000,
        description: 'Levantamiento técnico de jerarquías de ubicación técnica y equipos faena norte.',
        consultantName: 'Juan Pablo Morales (Consultor Externo)',
        acceptedBy: 'Ing. Roberto Valenzuela',
        accepted: true,
        status: 'approved'
      }
    ],
    buyerNotes: 'Orden de compra emitida bajo contrato marco de servicios mineros 2026.',
    companySigner: 'Gerencia de Abastecimiento & Finanzas'
  }
];

export function getStoredSolpeds(): ServicePurchaseRequisition[] {
  try {
    if (!hasConsolidatedOnce && typeof window !== 'undefined') {
      hasConsolidatedOnce = true;
      consolidateStoredSolpedsAndQuotations();
    }
    const raw = localStorage.getItem(SOLPEDS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SOLPEDS_STORAGE_KEY, JSON.stringify(INITIAL_SOLPEDS));
      return INITIAL_SOLPEDS;
    }
    const solpeds: ServicePurchaseRequisition[] = JSON.parse(raw);

    // Auto-reparar sincronización: Si una posición de SOLPED tiene vínculo a una OC,
    // pero la OC ya no existe o esa posición específica fue eliminada de la OC en ME22N,
    // se desvincula de inmediato y vuelve al estado 'approved'.
    if (typeof window !== 'undefined') {
      const rawPos = localStorage.getItem(PO_STORAGE_KEY);
      if (rawPos) {
        const pos: ServicePurchaseOrder[] = JSON.parse(rawPos);
        let changed = false;
        const repaired = solpeds.map(sp => {
          if (sp.convertedPoId || sp.convertedPoNumber || sp.status === 'converted_to_po') {
            const matchingPo = pos.find(p => 
              (sp.convertedPoId && p.id === sp.convertedPoId) || 
              (sp.convertedPoNumber && p.poNumber === sp.convertedPoNumber) || 
              (p.solpedNumber === sp.solpedNumber)
            );

            if (!matchingPo) {
              // La OC ya no existe
              changed = true;
              return {
                ...sp,
                convertedPoId: undefined,
                convertedPoNumber: undefined,
                status: 'approved' as const
              };
            }

            // Si la OC existe y tiene lista de posiciones (items), validar si esta posición sigue activa en la OC
            if (matchingPo.items && Array.isArray(matchingPo.items) && matchingPo.items.length > 0) {
              const hasItem = matchingPo.items.some(it => 
                it.positionNumber === sp.positionNumber || 
                (it.resourceId && sp.resourceId && it.resourceId === sp.resourceId)
              );
              if (!hasItem) {
                // Esta posición fue eliminada de la OC -> desvincular
                changed = true;
                return {
                  ...sp,
                  convertedPoId: undefined,
                  convertedPoNumber: undefined,
                  status: 'approved' as const
                };
              }
            }
          }
          return sp;
        });

        if (changed) {
          localStorage.setItem(SOLPEDS_STORAGE_KEY, JSON.stringify(repaired));
          return repaired;
        }
      }
    }

    return solpeds;
  } catch (e) {
    console.error('Error loading solpeds from storage:', e);
    return INITIAL_SOLPEDS;
  }
}

export function saveStoredSolpeds(solpeds: ServicePurchaseRequisition[]): void {
  try {
    localStorage.setItem(SOLPEDS_STORAGE_KEY, JSON.stringify(solpeds));
  } catch (e) {
    console.error('Error saving solpeds to storage:', e);
  }
}

export function getStoredPurchaseOrders(): ServicePurchaseOrder[] {
  try {
    const raw = localStorage.getItem(PO_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PO_STORAGE_KEY, JSON.stringify(INITIAL_PURCHASE_ORDERS));
      return INITIAL_PURCHASE_ORDERS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading purchase orders from storage:', e);
    return INITIAL_PURCHASE_ORDERS;
  }
}

export function saveStoredPurchaseOrders(pos: ServicePurchaseOrder[]): void {
  try {
    localStorage.setItem(PO_STORAGE_KEY, JSON.stringify(pos));
  } catch (e) {
    console.error('Error saving purchase orders to storage:', e);
  }
}

/**
 * Helper to ensure resources from the same subcontractor company within a quotation
 * always share the same SOLPED number, with sequential position numbers (10, 20, 30...).
 */
export function alignQuotationResourceSolpeds(resList: SapResourceItem[]): SapResourceItem[] {
  if (!resList || !Array.isArray(resList)) return [];

  // Group external resources by normalized supplier name
  const supplierGroups = new Map<string, SapResourceItem[]>();
  
  resList.forEach(r => {
    if (r.staffingType === 'external') {
      const key = (r.supplierName || 'Partner Subcontratista SAP').trim().toLowerCase();
      if (!supplierGroups.has(key)) {
        supplierGroups.set(key, []);
      }
      supplierGroups.get(key)!.push(r);
    }
  });

  const resolvedInfo = new Map<string, { solpedNumber?: string; solpedPosition: number }>();

  supplierGroups.forEach(group => {
    // Pick existing solpedNumber if any specialist in this company group already has one
    const existingNum = group.find(r => r.solpedNumber)?.solpedNumber;
    group.forEach((r, idx) => {
      resolvedInfo.set(r.id, {
        solpedNumber: existingNum,
        solpedPosition: (idx + 1) * 10
      });
    });
  });

  return resList.map(r => {
    if (r.staffingType === 'external') {
      const info = resolvedInfo.get(r.id);
      return {
        ...r,
        solpedNumber: info?.solpedNumber || r.solpedNumber,
        solpedPosition: info?.solpedPosition || r.solpedPosition || 10
      };
    } else {
      return {
        ...r,
        staffingType: 'internal',
        solpedId: undefined,
        solpedNumber: undefined,
        solpedPosition: undefined
      };
    }
  });
}

/**
 * Synchronize SOLPEDs whenever a Quotation is saved.
 * Business Rule:
 * - Una sola SOLPED por empresa subcontratada con posiciones (10, 20, 30...) por especialista.
 * - Solo crea más de una SOLPED si la cotización especifica más de una empresa subcontratada.
 */
export function syncSolpedsForQuotation(
  quotation: Quotation
): { updatedResources: SapResourceItem[]; generatedSolpeds: ServicePurchaseRequisition[] } {
  const existingSolpeds = getStoredSolpeds();
  const currentQuoteSolpeds = existingSolpeds.filter(s => s.quotationId === quotation.id);
  const otherSolpeds = existingSolpeds.filter(s => s.quotationId !== quotation.id);

  // Highest existing SOLPED number to avoid duplicate numbers across system
  const maxSolpedNum = existingSolpeds.reduce((max, s) => {
    const n = parseInt(s.solpedNumber, 10);
    return !isNaN(n) ? Math.max(max, n) : max;
  }, 10000040);
  let nextSolpedNum = maxSolpedNum + 1;

  const rawResources = [...(quotation.resources || [])];
  const updatedResources: SapResourceItem[] = [];
  const newOrUpdatedSolpedsForQuote: ServicePurchaseRequisition[] = [];

  // Group external resources strictly by subcontractor company (supplierName)
  const normalizeSupplier = (name?: string) => (name || 'Partner Subcontratista SAP').trim().toLowerCase();

  const externalResources: SapResourceItem[] = [];
  const internalResources: SapResourceItem[] = [];

  rawResources.forEach(res => {
    if (res.staffingType === 'external') {
      externalResources.push({ ...res });
    } else {
      internalResources.push({
        ...res,
        staffingType: 'internal',
        solpedId: undefined,
        solpedNumber: undefined,
        solpedPosition: undefined
      });
    }
  });

  const supplierGroups = new Map<string, SapResourceItem[]>();
  externalResources.forEach(res => {
    const key = normalizeSupplier(res.supplierName);
    if (!supplierGroups.has(key)) {
      supplierGroups.set(key, []);
    }
    supplierGroups.get(key)!.push(res);
  });

  // Process each company group: ONE SOLPED per company with specialist positions
  supplierGroups.forEach((groupResources, supplierKey) => {
    // Determine the single SOLPED number for this company group
    const existingGroupSolped = currentQuoteSolpeds.find(s => 
      normalizeSupplier(s.supplierName) === supplierKey ||
      groupResources.some(r => r.solpedNumber === s.solpedNumber || r.solpedId === s.id)
    );

    const solpedNumber = existingGroupSolped?.solpedNumber || 
      groupResources.find(r => r.solpedNumber)?.solpedNumber || 
      String(nextSolpedNum++);

    // Check if previously converted to PO
    const convertedPoId = existingGroupSolped?.convertedPoId || 
      groupResources.find(r => r.purchaseOrderId)?.purchaseOrderId;
    const convertedPoNumber = existingGroupSolped?.convertedPoNumber || 
      groupResources.find(r => r.purchaseOrderNumber)?.purchaseOrderNumber;
    const isAlreadyConverted = !!convertedPoId || existingGroupSolped?.status === 'converted_to_po';

    // Each specialist in this company group gets a position (10, 20, 30...)
    groupResources.forEach((res, posIdx) => {
      const posNum = (posIdx + 1) * 10;
      const hourlyCost = res.externalCostRate && res.externalCostRate > 0 ? res.externalCostRate : res.hourlyRate;
      const totalCost = res.hours * hourlyCost;
      const supplierDisplayName = res.supplierName?.trim() || existingGroupSolped?.supplierName || 'Partner Subcontratista SAP';

      let solpedPos = currentQuoteSolpeds.find(s => 
        (s.solpedNumber === solpedNumber && s.positionNumber === posNum) ||
        (s.resourceId === res.id) ||
        (s.id === res.solpedId)
      );

      if (!solpedPos) {
        solpedPos = {
          id: `sol-${quotation.id}-${solpedNumber}-pos-${posNum}`,
          solpedNumber,
          documentType: 'NB',
          itemCategory: 'D',
          accountAssignmentCategory: 'P',
          pepElement: `PEP-${quotation.code.replace('COT-', '')}.${posIdx + 1}`,
          costCenter: 'CC-10100',
          quotationId: quotation.id,
          quotationCode: quotation.code,
          clientCompanyName: quotation.client.companyName || 'Cliente SAP',
          projectTitle: quotation.project.projectTitle,
          resourceId: res.id,
          positionNumber: posNum,
          roleTitle: res.roleTitle || res.moduleName,
          moduleCode: res.moduleCode,
          moduleName: res.moduleName,
          seniority: res.seniority,
          supplierName: supplierDisplayName,
          supplierTaxId: res.supplierTaxId || existingGroupSolped?.supplierTaxId,
          hours: res.hours,
          unit: 'HUR',
          hourlyRate: hourlyCost,
          currency: quotation.currency,
          currencySymbol: quotation.currencySymbol,
          totalAmount: totalCost,
          status: isAlreadyConverted ? 'converted_to_po' : (existingGroupSolped?.status === 'approved' ? 'approved' : 'pending_approval'),
          convertedPoId: isAlreadyConverted ? convertedPoId : undefined,
          convertedPoNumber: isAlreadyConverted ? convertedPoNumber : undefined,
          requisitioner: 'PMO Lead / Jefe de Proyecto SAP',
          createdAt: existingGroupSolped?.createdAt || new Date().toISOString().slice(0, 10),
          notes: `Posición ${posNum} de SOLPED de Servicio originada automáticamente desde cotización ${quotation.code} para ${supplierDisplayName}.`
        };
      } else {
        solpedPos = {
          ...solpedPos,
          solpedNumber,
          positionNumber: posNum,
          resourceId: res.id,
          quotationCode: quotation.code,
          clientCompanyName: quotation.client.companyName,
          projectTitle: quotation.project.projectTitle,
          roleTitle: res.roleTitle || solpedPos.roleTitle,
          moduleCode: res.moduleCode,
          moduleName: res.moduleName,
          seniority: res.seniority,
          hours: res.hours,
          hourlyRate: hourlyCost,
          currency: quotation.currency,
          currencySymbol: quotation.currencySymbol,
          totalAmount: totalCost,
          supplierName: supplierDisplayName,
          supplierTaxId: res.supplierTaxId || solpedPos.supplierTaxId || existingGroupSolped?.supplierTaxId,
          status: isAlreadyConverted ? 'converted_to_po' : solpedPos.status,
          convertedPoId: isAlreadyConverted ? convertedPoId : solpedPos.convertedPoId,
          convertedPoNumber: isAlreadyConverted ? convertedPoNumber : solpedPos.convertedPoNumber
        };
      }

      newOrUpdatedSolpedsForQuote.push(solpedPos);
      res.solpedId = solpedPos.id;
      res.solpedNumber = solpedNumber;
      res.solpedPosition = posNum;
      res.supplierName = supplierDisplayName;
      if (isAlreadyConverted && convertedPoId) {
        res.purchaseOrderId = convertedPoId;
        res.purchaseOrderNumber = convertedPoNumber;
      }
      updatedResources.push(res);
    });
  });

  // Re-append internal resources in original relative order
  internalResources.forEach(res => updatedResources.push(res));

  // Preserve any previously converted solpeds from this quotation
  currentQuoteSolpeds.forEach(prev => {
    if (prev.status === 'converted_to_po' && !newOrUpdatedSolpedsForQuote.some(s => s.id === prev.id)) {
      newOrUpdatedSolpedsForQuote.push(prev);
    }
  });

  const allSolpeds = [...otherSolpeds, ...newOrUpdatedSolpedsForQuote];
  saveStoredSolpeds(allSolpeds);

  return {
    updatedResources,
    generatedSolpeds: newOrUpdatedSolpedsForQuote
  };
}

/**
 * Release/Approve a SOLPED in SAP MM (ME54N)
 * Approves all positions of this SOLPED.
 */
export function releaseSolped(
  solpedIdentifier: string, 
  approverName: string = 'Gerente de Proyectos / PMO'
): ServicePurchaseRequisition | null {
  const solpeds = getStoredSolpeds();
  const target = solpeds.find(s => s.id === solpedIdentifier || s.solpedNumber === solpedIdentifier);
  if (!target) return null;

  const solpedNumber = target.solpedNumber;
  const updatedSolpeds = solpeds.map(s => {
    if (s.solpedNumber === solpedNumber) {
      return {
        ...s,
        status: 'approved' as const,
        releaseStrategy: {
          group: 'SR',
          code: 'L1',
          releasedBy: approverName,
          releasedAt: new Date().toISOString().slice(0, 10)
        }
      };
    }
    return s;
  });

  saveStoredSolpeds(updatedSolpeds);
  return updatedSolpeds.find(s => s.id === target.id) || null;
}

/**
 * Convert an approved SOLPED into an SAP Purchase Order (ME21N).
 * Business Rule:
 * - Al momento de crear una orden de compra, se debe crear una sola orden de compra para la misma SOLPED.
 * - Consolida todas las posiciones de la SOLPED en una única Orden de Compra oficial.
 */
export function convertSolpedToPurchaseOrder(
  solpedIdentifier: string,
  extraDetails?: {
    supplierName?: string;
    supplierTaxId?: string;
    supplierEmail?: string;
    paymentTerms?: string;
    buyerNotes?: string;
  }
): { 
  purchaseOrder: ServicePurchaseOrder; 
  updatedSolped: ServicePurchaseRequisition;
  allUpdatedPositions: ServicePurchaseRequisition[];
} | null {
  const solpeds = getStoredSolpeds();
  const targetSolped = solpeds.find(s => s.id === solpedIdentifier || s.solpedNumber === solpedIdentifier);
  if (!targetSolped) return null;

  const solpedNumber = targetSolped.solpedNumber;
  const relatedPositions = solpeds.filter(s => s.solpedNumber === solpedNumber);

  const purchaseOrders = getStoredPurchaseOrders();
  // ENFORCE RULE: A single Purchase Order per SOLPED!
  const existingPo = purchaseOrders.find(p => p.solpedNumber === solpedNumber);

  if (existingPo) {
    // If a PO already exists for this SOLPED, ensure all positions are marked converted and return it
    const allUpdatedPositions = relatedPositions.map(pos => ({
      ...pos,
      status: 'converted_to_po' as const,
      convertedPoId: existingPo.id,
      convertedPoNumber: existingPo.poNumber
    }));
    const updatedSolpeds = solpeds.map(s => {
      const match = allUpdatedPositions.find(p => p.id === s.id);
      return match || s;
    });
    saveStoredSolpeds(updatedSolpeds);
    return {
      purchaseOrder: existingPo,
      updatedSolped: allUpdatedPositions.find(p => p.id === targetSolped.id) || allUpdatedPositions[0],
      allUpdatedPositions
    };
  }

  // Create ONE single Purchase Order consolidating all positions of this SOLPED
  const nextPoNum = 4500000100 + purchaseOrders.length + 1;
  const poNumber = String(nextPoNum);

  const supplier = extraDetails?.supplierName || targetSolped.supplierName || 'Partner Subcontratista SAP';
  const totalHours = relatedPositions.reduce((sum, p) => sum + (Number(p.hours) || 0), 0);
  const netAmount = relatedPositions.reduce((sum, p) => sum + (Number(p.totalAmount) || 0), 0);
  const taxRatePercentage = targetSolped.currency === 'CLP' ? 19 : targetSolped.currency === 'MXN' ? 16 : 0;
  const taxAmount = Math.round((netAmount * taxRatePercentage) / 100);
  const totalAmount = netAmount + taxAmount;
  const averageHourlyRate = totalHours > 0 ? Number((netAmount / totalHours).toFixed(2)) : targetSolped.hourlyRate;

  const roleTitle = relatedPositions.length === 1
    ? targetSolped.roleTitle
    : `Servicios Especializados (${relatedPositions.length} especialistas: ${relatedPositions.map(p => p.roleTitle).join(', ')})`;

  // Consolidate all positions into PO items
  const items: ServicePoItem[] = relatedPositions.map(pos => ({
    positionNumber: pos.positionNumber,
    roleTitle: pos.roleTitle,
    moduleCode: pos.moduleCode,
    seniority: pos.seniority,
    hours: pos.hours,
    hourlyRate: pos.hourlyRate,
    totalAmount: pos.totalAmount,
    pepElement: pos.pepElement,
    costCenter: pos.costCenter,
    resourceId: pos.resourceId
  }));

  const newPo: ServicePurchaseOrder = {
    id: `po-${Date.now()}`,
    poNumber,
    solpedId: targetSolped.id,
    solpedNumber: targetSolped.solpedNumber,
    documentType: 'NB',
    quotationId: targetSolped.quotationId,
    quotationCode: targetSolped.quotationCode,
    clientCompanyName: targetSolped.clientCompanyName,
    projectTitle: targetSolped.projectTitle,
    supplierName: supplier,
    supplierTaxId: extraDetails?.supplierTaxId || targetSolped.supplierTaxId || '76.884.210-9',
    supplierEmail: extraDetails?.supplierEmail || 'compras@proveedor-sap.com',
    paymentTerms: extraDetails?.paymentTerms || '30 días fecha factura contra HES (Hoja de Entrada de Servicios)',
    roleTitle,
    moduleCode: targetSolped.moduleCode,
    hoursContracted: totalHours,
    hourlyRate: averageHourlyRate,
    currency: targetSolped.currency,
    currencySymbol: targetSolped.currencySymbol,
    netAmount,
    taxRatePercentage,
    taxAmount,
    totalAmount,
    pepElement: targetSolped.pepElement,
    costCenter: targetSolped.costCenter,
    issueDate: new Date().toISOString().slice(0, 10),
    estimatedDeliveryDate: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
    status: 'issued',
    serviceEntrySheets: [],
    buyerNotes: extraDetails?.buyerNotes || `Orden de compra única generada para SOLPED ${targetSolped.solpedNumber} (${relatedPositions.length} posiciones de servicio, Cotización ${targetSolped.quotationCode}).`,
    companySigner: 'Gerencia de Abastecimiento & Compras',
    items
  };

  // Mark ALL positions of this SOLPED as converted_to_po with this new PO
  const allUpdatedPositions = relatedPositions.map(pos => ({
    ...pos,
    status: 'converted_to_po' as const,
    convertedPoId: newPo.id,
    convertedPoNumber: newPo.poNumber
  }));

  const updatedSolpeds = solpeds.map(s => {
    const match = allUpdatedPositions.find(p => p.id === s.id);
    return match || s;
  });
  saveStoredSolpeds(updatedSolpeds);

  const updatedPos = [newPo, ...purchaseOrders];
  saveStoredPurchaseOrders(updatedPos);

  // Sync quotation resources in localStorage
  try {
    const rawQuotes = localStorage.getItem('sap_quotations_v1_data');
    if (rawQuotes) {
      const quotes = JSON.parse(rawQuotes);
      let quotesChanged = false;
      const updatedQuotes = quotes.map((q: any) => {
        if (q.id === targetSolped.quotationId && q.resources && Array.isArray(q.resources)) {
          const updatedRes = q.resources.map((r: any) => {
            if (r.solpedNumber === solpedNumber || relatedPositions.some(p => p.resourceId === r.id)) {
              quotesChanged = true;
              return {
                ...r,
                purchaseOrderId: newPo.id,
                purchaseOrderNumber: newPo.poNumber
              };
            }
            return r;
          });
          return { ...q, resources: updatedRes };
        }
        return q;
      });
      if (quotesChanged) {
        localStorage.setItem('sap_quotations_v1_data', JSON.stringify(updatedQuotes));
      }
    }
  } catch (err) {
    console.warn('Error syncing quotation resources with PO:', err);
  }

  return {
    purchaseOrder: newPo,
    updatedSolped: allUpdatedPositions.find(p => p.id === targetSolped.id) || allUpdatedPositions[0],
    allUpdatedPositions
  };
}

/**
 * Add a Service Entry Sheet (HES / ML81N) to a Purchase Order
 */
export function addServiceEntrySheetToPo(
  poId: string,
  hesData: {
    hoursDelivered: number;
    description: string;
    consultantName: string;
    acceptedBy: string;
  }
): ServicePurchaseOrder | null {
  const pos = getStoredPurchaseOrders();
  const index = pos.findIndex(p => p.id === poId);
  if (index === -1) return null;

  const po = pos[index];
  const nextHesNum = String(10000 + (po.serviceEntrySheets?.length || 0) + 1);
  const totalAmount = hesData.hoursDelivered * po.hourlyRate;

  const newHes: ServiceEntrySheet = {
    id: `hes-${Date.now()}`,
    hesNumber: nextHesNum,
    date: new Date().toISOString().slice(0, 10),
    hoursDelivered: hesData.hoursDelivered,
    unit: 'HUR',
    hourlyRate: po.hourlyRate,
    totalAmount,
    description: hesData.description,
    consultantName: hesData.consultantName,
    acceptedBy: hesData.acceptedBy,
    accepted: true,
    status: 'approved'
  };

  const currentSheets = po.serviceEntrySheets || [];
  const updatedSheets = [...currentSheets, newHes];

  const totalDeliveredHours = updatedSheets.reduce((sum, h) => sum + h.hoursDelivered, 0);
  const isFullyDelivered = totalDeliveredHours >= po.hoursContracted;

  const updatedPo: ServicePurchaseOrder = {
    ...po,
    serviceEntrySheets: updatedSheets,
    status: isFullyDelivered ? 'completed' : 'in_execution'
  };

  pos[index] = updatedPo;
  saveStoredPurchaseOrders(pos);
  return updatedPo;
}

/**
 * Rechazar una SOLPED en SAP MM
 */
export function rejectSolped(
  solpedId: string,
  reason: string = 'Rechazada por control de compras / presupuesto'
): ServicePurchaseRequisition | null {
  const solpeds = getStoredSolpeds();
  const index = solpeds.findIndex(s => s.id === solpedId);
  if (index === -1) return null;

  const solped = solpeds[index];
  if (solped.status === 'converted_to_po') {
    throw new Error('No es posible rechazar una SOLPED que ya tiene Orden de Compra asociada.');
  }

  const updated: ServicePurchaseRequisition = {
    ...solped,
    status: 'rejected',
    notes: reason ? `${solped.notes || ''} [Rechazada: ${reason}]`.trim() : solped.notes
  };

  solpeds[index] = updated;
  saveStoredSolpeds(solpeds);
  return updated;
}

/**
 * Editar una SOLPED (Solo permitido si no tiene Orden de Compra asociada)
 */
export function updateSolped(
  solpedId: string,
  updates: Partial<ServicePurchaseRequisition>
): ServicePurchaseRequisition | null {
  const solpeds = getStoredSolpeds();
  const index = solpeds.findIndex(s => s.id === solpedId);
  if (index === -1) return null;

  const solped = solpeds[index];
  if (solped.status === 'converted_to_po' || solped.convertedPoId) {
    throw new Error('No es posible editar una SOLPED que ya tiene Orden de Compra emitida.');
  }

  const hours = updates.hours !== undefined ? Number(updates.hours) : solped.hours;
  const hourlyRate = updates.hourlyRate !== undefined ? Number(updates.hourlyRate) : solped.hourlyRate;
  const totalAmount = hours * hourlyRate;

  const updated: ServicePurchaseRequisition = {
    ...solped,
    ...updates,
    hours,
    hourlyRate,
    totalAmount
  };

  solpeds[index] = updated;
  saveStoredSolpeds(solpeds);
  return updated;
}

/**
 * Borrar una SOLPED (Solo permitido si no tiene Orden de Compra asociada)
 */
export function deleteSolped(solpedId: string): boolean {
  const solpeds = getStoredSolpeds();
  const solped = solpeds.find(s => s.id === solpedId);
  if (!solped) return false;

  if (solped.status === 'converted_to_po' || solped.convertedPoId) {
    throw new Error('No es posible borrar una SOLPED que ya posee una Orden de Compra vinculada.');
  }

  const remainingSolpeds = solpeds.filter(s => s.id !== solpedId);
  saveStoredSolpeds(remainingSolpeds);

  // Limpiar referencia en las cotizaciones guardadas en localStorage si existiera
  try {
    const rawQuotes = localStorage.getItem('sap_quotations_v1_data');
    if (rawQuotes) {
      const quotes = JSON.parse(rawQuotes);
      let quotesChanged = false;
      const updatedQuotes = quotes.map((q: any) => {
        if (q.resources && Array.isArray(q.resources)) {
          let hasMatch = false;
          const updatedRes = q.resources.map((r: any) => {
            if (r.solpedId === solpedId || r.solpedNumber === solped.solpedNumber) {
              hasMatch = true;
              return {
                ...r,
                solpedId: undefined,
                solpedNumber: undefined
              };
            }
            return r;
          });
          if (hasMatch) {
            quotesChanged = true;
            return { ...q, resources: updatedRes };
          }
        }
        return q;
      });

      if (quotesChanged) {
        localStorage.setItem('sap_quotations_v1_data', JSON.stringify(updatedQuotes));
      }
    }
  } catch (err) {
    console.warn('Error syncing quote after solped delete', err);
  }

  return true;
}

/**
 * Eliminar / Anular una Orden de Compra SAP (ME22N Borrado / ME28 Rechazo)
 * Libera automáticamente todas las posiciones asociadas en la SOLPED para que vuelvan a 'approved'
 */
export function deletePurchaseOrder(poId: string): boolean {
  const pos = getStoredPurchaseOrders();
  const targetPo = pos.find(p => p.id === poId);
  if (!targetPo) return false;

  // 1. Eliminar de la lista de OCs
  const remainingPos = pos.filter(p => p.id !== poId);
  saveStoredPurchaseOrders(remainingPos);

  // 2. Liberar todas las posiciones de SOLPED vinculadas
  const solpeds = getStoredSolpeds();
  let solpedsChanged = false;
  const updatedSolpeds = solpeds.map(s => {
    if (
      s.convertedPoId === targetPo.id ||
      s.convertedPoNumber === targetPo.poNumber ||
      (s.solpedNumber === targetPo.solpedNumber && s.status === 'converted_to_po')
    ) {
      solpedsChanged = true;
      return {
        ...s,
        status: 'approved' as const,
        convertedPoId: undefined,
        convertedPoNumber: undefined
      };
    }
    return s;
  });

  if (solpedsChanged) {
    saveStoredSolpeds(updatedSolpeds);
  }

  // 3. Sincronizar cotizaciones en localStorage
  try {
    const rawQuotes = localStorage.getItem('sap_quotations_v1_data');
    if (rawQuotes) {
      const quotes = JSON.parse(rawQuotes);
      let quotesChanged = false;
      const updatedQuotes = quotes.map((q: any) => {
        if (q.resources && Array.isArray(q.resources)) {
          let hasMatch = false;
          const updatedRes = q.resources.map((r: any) => {
            if (r.purchaseOrderId === targetPo.id || r.purchaseOrderNumber === targetPo.poNumber) {
              hasMatch = true;
              return {
                ...r,
                purchaseOrderId: undefined,
                purchaseOrderNumber: undefined
              };
            }
            return r;
          });
          if (hasMatch) {
            quotesChanged = true;
            return { ...q, resources: updatedRes };
          }
        }
        return q;
      });
      if (quotesChanged) {
        localStorage.setItem('sap_quotations_v1_data', JSON.stringify(updatedQuotes));
      }
    }
  } catch (err) {
    console.warn('Error syncing quotes after PO deletion:', err);
  }

  return true;
}

/**
 * Editar una Orden de Compra SAP (ME22N)
 */
export function updatePurchaseOrder(
  poId: string,
  updates: Partial<ServicePurchaseOrder>
): ServicePurchaseOrder | null {
  const pos = getStoredPurchaseOrders();
  const index = pos.findIndex(p => p.id === poId);
  if (index === -1) return null;

  const po = pos[index];
  let hoursContracted = updates.hoursContracted !== undefined ? Number(updates.hoursContracted) : po.hoursContracted;
  let hourlyRate = updates.hourlyRate !== undefined ? Number(updates.hourlyRate) : po.hourlyRate;
  let netAmount = updates.netAmount !== undefined ? Number(updates.netAmount) : (hoursContracted * hourlyRate);

  if (updates.items && Array.isArray(updates.items)) {
    if (updates.items.length > 0) {
      hoursContracted = updates.items.reduce((sum, it) => sum + (Number(it.hours) || 0), 0);
      netAmount = updates.items.reduce((sum, it) => sum + (Number(it.totalAmount) || ((Number(it.hours) || 0) * (Number(it.hourlyRate) || 0))), 0);
      hourlyRate = hoursContracted > 0 ? Number((netAmount / hoursContracted).toFixed(2)) : hourlyRate;
    } else {
      // Si la lista de posiciones quedó vacía, se anula la OC y se liberan las SOLPEDs
      deletePurchaseOrder(poId);
      return null;
    }
  }

  const taxRatePercentage = updates.taxRatePercentage !== undefined ? Number(updates.taxRatePercentage) : (po.taxRatePercentage || 19);
  const taxAmount = Math.round((netAmount * taxRatePercentage) / 100);
  const totalAmount = netAmount + taxAmount;

  const updated: ServicePurchaseOrder = {
    ...po,
    ...updates,
    hoursContracted,
    hourlyRate,
    netAmount,
    taxRatePercentage,
    taxAmount,
    totalAmount
  };

  pos[index] = updated;
  saveStoredPurchaseOrders(pos);

  // Sincronizar bidireccionalmente las posiciones de la SOLPED:
  // 1. Las posiciones activas en la OC se actualizan y mantienen el vínculo.
  // 2. Las posiciones que fueron eliminadas de la OC se liberan (status = 'approved', convertedPo = undefined).
  if (updates.items && Array.isArray(updates.items) && po.solpedNumber) {
    const solpeds = getStoredSolpeds();
    let solpedsChanged = false;
    const updatedSolpeds = solpeds.map(sp => {
      if (sp.solpedNumber === po.solpedNumber) {
        const matchItem = updates.items!.find(it => 
          it.positionNumber === sp.positionNumber || 
          (it.resourceId && sp.resourceId && it.resourceId === sp.resourceId)
        );

        if (matchItem) {
          // Posición activa en la OC
          solpedsChanged = true;
          return {
            ...sp,
            status: 'converted_to_po' as const,
            convertedPoId: updated.id,
            convertedPoNumber: updated.poNumber,
            roleTitle: matchItem.roleTitle,
            hours: matchItem.hours,
            hourlyRate: matchItem.hourlyRate,
            totalAmount: matchItem.totalAmount,
            pepElement: matchItem.pepElement || sp.pepElement,
            costCenter: matchItem.costCenter || sp.costCenter
          };
        } else {
          // POSICIÓN ELIMINADA DE LA OC -> LIBERAR EN SOLPED
          solpedsChanged = true;
          return {
            ...sp,
            status: 'approved' as const,
            convertedPoId: undefined,
            convertedPoNumber: undefined
          };
        }
      }
      return sp;
    });

    if (solpedsChanged) {
      saveStoredSolpeds(updatedSolpeds);
    }

    // Sincronizar también las cotizaciones para desvincular recursos eliminados de la OC
    try {
      const rawQuotes = localStorage.getItem('sap_quotations_v1_data');
      if (rawQuotes) {
        const quotes = JSON.parse(rawQuotes);
        let quotesChanged = false;
        const updatedQuotes = quotes.map((q: any) => {
          if (q.resources && Array.isArray(q.resources)) {
            let hasMatch = false;
            const updatedRes = q.resources.map((r: any) => {
              if (r.solpedNumber === po.solpedNumber) {
                const itemStillInPo = updates.items!.some(it => 
                  it.positionNumber === r.solpedPosition || 
                  (it.resourceId && r.id && it.resourceId === r.id)
                );
                if (!itemStillInPo && (r.purchaseOrderId === updated.id || r.purchaseOrderNumber === updated.poNumber)) {
                  hasMatch = true;
                  return {
                    ...r,
                    purchaseOrderId: undefined,
                    purchaseOrderNumber: undefined
                  };
                }
              }
              return r;
            });
            if (hasMatch) {
              quotesChanged = true;
              return { ...q, resources: updatedRes };
            }
          }
          return q;
        });
        if (quotesChanged) {
          localStorage.setItem('sap_quotations_v1_data', JSON.stringify(updatedQuotes));
        }
      }
    } catch (err) {
      console.warn('Error syncing quotation resources after po item deletion:', err);
    }
  }

  return updated;
}

/**
 * Autorizar / Liberar una Orden de Compra SAP (ME28 / ME29N)
 */
export function authorizePurchaseOrder(
  poId: string,
  authorizerName: string = 'Gerencia de Abastecimiento & Compras'
): ServicePurchaseOrder | null {
  const pos = getStoredPurchaseOrders();
  const index = pos.findIndex(p => p.id === poId);
  if (index === -1) return null;

  const po = pos[index];
  const updated: ServicePurchaseOrder = {
    ...po,
    status: 'authorized',
    companySigner: authorizerName,
    buyerNotes: `${po.buyerNotes || ''} [Autorizada por ${authorizerName} el ${new Date().toISOString().slice(0, 10)}]`.trim()
  };

  pos[index] = updated;
  saveStoredPurchaseOrders(pos);
  return updated;
}

/**
 * Rechazar una Orden de Compra SAP
 */
export function rejectPurchaseOrder(
  poId: string,
  reason: string = 'Rechazada por jefatura de compras / finanzas'
): ServicePurchaseOrder | null {
  const pos = getStoredPurchaseOrders();
  const index = pos.findIndex(p => p.id === poId);
  if (index === -1) return null;

  const po = pos[index];
  const updated: ServicePurchaseOrder = {
    ...po,
    status: 'rejected',
    buyerNotes: `${po.buyerNotes || ''} [Rechazada: ${reason}]`.trim()
  };

  pos[index] = updated;
  saveStoredPurchaseOrders(pos);
  return updated;
}

/**
 * Obtener todas las posiciones asociadas a un número de SOLPED
 */
export function getSolpedPositions(solpedNumber: string): ServicePurchaseRequisition[] {
  const solpeds = getStoredSolpeds();
  return solpeds.filter(s => s.solpedNumber === solpedNumber).sort((a, b) => a.positionNumber - b.positionNumber);
}

/**
 * Guardar o actualizar la lista completa de posiciones para un número de SOLPED
 */
export function saveSolpedPositions(
  solpedNumber: string,
  updatedPositions: ServicePurchaseRequisition[]
): ServicePurchaseRequisition[] {
  const allSolpeds = getStoredSolpeds();
  const otherSolpeds = allSolpeds.filter(s => s.solpedNumber !== solpedNumber);
  
  // Normalizar números de posición (10, 20, 30...)
  const normalizedPositions = updatedPositions.map((pos, idx) => {
    const hours = Number(pos.hours) || 0;
    const hourlyRate = Number(pos.hourlyRate) || 0;
    const totalAmount = hours * hourlyRate;
    return {
      ...pos,
      solpedNumber,
      positionNumber: pos.positionNumber || (idx + 1) * 10,
      hours,
      hourlyRate,
      totalAmount
    };
  });

  const finalSolpeds = [...otherSolpeds, ...normalizedPositions];
  saveStoredSolpeds(finalSolpeds);
  return normalizedPositions;
}

/**
 * Agregar una nueva posición a una SOLPED existente (ME52N)
 */
export function addPositionToSolped(
  baseSolped: ServicePurchaseRequisition,
  newPosData: Partial<ServicePurchaseRequisition>
): ServicePurchaseRequisition {
  const allSolpeds = getStoredSolpeds();
  const currentPositions = allSolpeds
    .filter(s => s.solpedNumber === baseSolped.solpedNumber)
    .sort((a, b) => a.positionNumber - b.positionNumber);

  const highestPos = currentPositions.length > 0 
    ? Math.max(...currentPositions.map(p => p.positionNumber))
    : 0;
  const nextPosNum = highestPos + 10;

  const hours = Number(newPosData.hours) || 40;
  const hourlyRate = Number(newPosData.hourlyRate) || baseSolped.hourlyRate || 50;
  const totalAmount = hours * hourlyRate;

  const newPosition: ServicePurchaseRequisition = {
    id: `sol-${Date.now()}-${nextPosNum}`,
    solpedNumber: baseSolped.solpedNumber,
    documentType: baseSolped.documentType,
    itemCategory: 'D',
    accountAssignmentCategory: baseSolped.accountAssignmentCategory,
    pepElement: newPosData.pepElement || `${baseSolped.pepElement}.${nextPosNum / 10}`,
    costCenter: newPosData.costCenter || baseSolped.costCenter || 'CC-10100',
    quotationId: baseSolped.quotationId,
    quotationCode: baseSolped.quotationCode,
    clientCompanyName: baseSolped.clientCompanyName,
    projectTitle: baseSolped.projectTitle,
    resourceId: `res-manual-${Date.now()}`,
    positionNumber: nextPosNum,
    roleTitle: newPosData.roleTitle || `Nuevo Servicio / Posición ${nextPosNum}`,
    moduleCode: newPosData.moduleCode || baseSolped.moduleCode || 'SAP_GEN',
    moduleName: newPosData.moduleName || baseSolped.moduleName || 'Servicio de Consultoría SAP',
    seniority: newPosData.seniority || 'Senior',
    supplierName: newPosData.supplierName || baseSolped.supplierName || 'Proveedor Subcontratista Sugerido',
    supplierTaxId: newPosData.supplierTaxId || baseSolped.supplierTaxId,
    hours,
    unit: 'HUR',
    hourlyRate,
    currency: baseSolped.currency,
    currencySymbol: baseSolped.currencySymbol,
    totalAmount,
    status: baseSolped.status === 'converted_to_po' ? 'pending_approval' : baseSolped.status,
    requisitioner: baseSolped.requisitioner,
    createdAt: new Date().toISOString().slice(0, 10),
    notes: newPosData.notes || `Posición adicional ${nextPosNum} incorporada en transacción ME52N.`
  };

  const updatedSolpeds = [...allSolpeds, newPosition];
  saveStoredSolpeds(updatedSolpeds);
  return newPosition;
}

/**
 * Eliminar una posición específica de una SOLPED
 */
export function deleteSolpedPosition(positionId: string): boolean {
  const allSolpeds = getStoredSolpeds();
  const target = allSolpeds.find(s => s.id === positionId);
  if (!target) return false;

  if (target.status === 'converted_to_po' || target.convertedPoId) {
    throw new Error('No es posible eliminar una posición que ya cuenta con Orden de Compra asociada.');
  }

  const remaining = allSolpeds.filter(s => s.id !== positionId);
  saveStoredSolpeds(remaining);
  return true;
}

let hasConsolidatedOnce = false;

/**
 * Ensures existing stored quotations and SOLPEDs conform to:
 * - Single SOLPED per subcontractor company (with positions 10, 20...)
 * - Single PO per SOLPED
 */
export function consolidateStoredSolpedsAndQuotations(): void {
  try {
    const rawQuotes = localStorage.getItem('sap_quotations_v1_data');
    const rawSolpeds = localStorage.getItem(SOLPEDS_STORAGE_KEY);
    const rawPos = localStorage.getItem(PO_STORAGE_KEY);

    if (!rawQuotes && !rawSolpeds) return;

    let quotes: Quotation[] = rawQuotes ? JSON.parse(rawQuotes) : [];
    let solpeds: ServicePurchaseRequisition[] = rawSolpeds ? JSON.parse(rawSolpeds) : INITIAL_SOLPEDS;
    let pos: ServicePurchaseOrder[] = rawPos ? JSON.parse(rawPos) : INITIAL_PURCHASE_ORDERS;

    let quotesChanged = false;
    let solpedsChanged = false;
    let posChanged = false;

    // 1. Group quotation resources by subcontractor company
    quotes = quotes.map(q => {
      if (!q.resources || !Array.isArray(q.resources)) return q;
      const externalRes = q.resources.filter(r => r.staffingType === 'external');
      if (externalRes.length === 0) return q;

      const groups = new Map<string, SapResourceItem[]>();
      externalRes.forEach(r => {
        const key = (r.supplierName || 'Partner Subcontratista SAP').trim().toLowerCase();
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(r);
      });

      let quoteModified = false;
      const resMap = new Map<string, { solpedNumber: string; solpedPosition: number }>();

      groups.forEach(group => {
        // Pick the lowest / first existing solpedNumber among this group
        const existingNum = group.find(r => r.solpedNumber)?.solpedNumber ||
          solpeds.find(s => s.quotationId === q.id && (s.supplierName?.trim().toLowerCase() === group[0].supplierName?.trim().toLowerCase()))?.solpedNumber;

        if (existingNum) {
          group.forEach((r, idx) => {
            const expectedPos = (idx + 1) * 10;
            if (r.solpedNumber !== existingNum || r.solpedPosition !== expectedPos) {
              quoteModified = true;
            }
            resMap.set(r.id, {
              solpedNumber: existingNum,
              solpedPosition: expectedPos
            });
          });
        }
      });

      if (quoteModified) {
        quotesChanged = true;
        const updatedResources = q.resources.map(r => {
          const mapping = resMap.get(r.id);
          if (mapping) {
            return {
              ...r,
              solpedNumber: mapping.solpedNumber,
              solpedPosition: mapping.solpedPosition
            };
          }
          return r;
        });
        return { ...q, resources: updatedResources };
      }
      return q;
    });

    // 2. Align stored solpeds with the consolidated positions
    quotes.forEach(q => {
      if (!q.resources) return;
      const externalRes = q.resources.filter(r => r.staffingType === 'external');
      externalRes.forEach(r => {
        if (!r.solpedNumber) return;
        const match = solpeds.find(s => s.resourceId === r.id || (s.quotationId === q.id && s.roleTitle === r.roleTitle));
        if (match && (match.solpedNumber !== r.solpedNumber || match.positionNumber !== r.solpedPosition)) {
          match.solpedNumber = r.solpedNumber;
          match.positionNumber = r.solpedPosition || 10;
          solpedsChanged = true;
        }
      });
    });

    // 3. Ensure 1:1 PO per SOLPED: deduplicate POs if more than one exists for same solpedNumber
    const seenSolpedPos = new Set<string>();
    const deduplicatedPos: ServicePurchaseOrder[] = [];
    pos.forEach(p => {
      if (!seenSolpedPos.has(p.solpedNumber)) {
        seenSolpedPos.add(p.solpedNumber);
        deduplicatedPos.push(p);
      } else {
        posChanged = true;
      }
    });

    if (quotesChanged) {
      localStorage.setItem('sap_quotations_v1_data', JSON.stringify(quotes));
    }
    if (solpedsChanged) {
      localStorage.setItem(SOLPEDS_STORAGE_KEY, JSON.stringify(solpeds));
    }
    if (posChanged) {
      localStorage.setItem(PO_STORAGE_KEY, JSON.stringify(deduplicatedPos));
    }
  } catch (err) {
    console.warn('Could not consolidate stored solpeds and quotations:', err);
  }
}

export interface CreateSolpedPositionItem {
  roleTitle: string;
  moduleCode: SapModuleCode;
  moduleName?: string;
  seniority: SeniorityLevel;
  hours: number;
  hourlyRate: number;
  currency?: SupportedCurrency;
  currencySymbol?: string;
  pepElement?: string;
  costCenter?: string;
  professionalId?: string;
  professionalName?: string;
}

export interface CreateNewSolpedParams {
  referenceSolpedNumber?: string;
  quotationId?: string;
  quotationCode?: string;
  clientCompanyName?: string;
  projectTitle?: string;
  supplierName: string;
  supplierTaxId?: string;
  pepElement: string;
  costCenter?: string;
  documentType?: 'NB' | 'ZSRV';
  currency?: SupportedCurrency;
  currencySymbol?: string;
  notes?: string;
  requisitioner?: string;
  positions: CreateSolpedPositionItem[];
}

/**
 * Crea una nueva Solicitud de Pedido de Servicios (Transacción SAP ME51N)
 * Admite creación en blanco desde cero o con referencia a una SOLPED existente
 */
export function createNewSolped(params: CreateNewSolpedParams): ServicePurchaseRequisition[] {
  const allSolpeds = getStoredSolpeds();
  
  // Calcular siguiente correlativo oficial de 10 dígitos (ej. 10000044)
  const maxSolpedNum = allSolpeds.reduce((max, s) => {
    const n = parseInt(s.solpedNumber, 10);
    return !isNaN(n) ? Math.max(max, n) : max;
  }, 10000040);
  const newSolpedNumber = String(maxSolpedNum + 1);

  const defaultCurrency: SupportedCurrency = params.currency || 'UF';
  const defaultCurrencySymbol = params.currencySymbol || (defaultCurrency === 'UF' ? 'UF' : defaultCurrency === 'USD' ? '$' : '$');
  const docType = params.documentType || 'NB';
  const now = new Date().toISOString();
  const reqUser = params.requisitioner || 'PMO Lead / Jefe de Proyecto SAP';

  const positionsToCreate = params.positions.length > 0 
    ? params.positions 
    : [{
        roleTitle: 'Consultor Especialista SAP',
        moduleCode: 'SAP_ABAP' as SapModuleCode,
        moduleName: 'Desarrollo ABAP',
        seniority: 'Senior' as SeniorityLevel,
        hours: 120,
        hourlyRate: defaultCurrency === 'UF' ? 2.0 : 45,
        currency: defaultCurrency,
        currencySymbol: defaultCurrencySymbol
      }];

  const newPositions: ServicePurchaseRequisition[] = positionsToCreate.map((pos, idx) => {
    const hours = Number(pos.hours) || 0;
    const rate = Number(pos.hourlyRate) || 0;
    const totalAmount = hours * rate;
    const posNum = (idx + 1) * 10;
    const posPep = pos.pepElement || (params.pepElement ? `${params.pepElement.replace(/\.\d+$/, '')}.${idx + 1}` : `PEP-PRJ-${newSolpedNumber}.${idx + 1}`);

    return {
      id: `sol-${Date.now()}-${idx + 1}-${Math.random().toString(36).substring(2, 6)}`,
      solpedNumber: newSolpedNumber,
      documentType: docType,
      itemCategory: 'D',
      accountAssignmentCategory: 'P',
      pepElement: posPep,
      costCenter: pos.costCenter || params.costCenter || 'CC-10100',
      quotationId: params.quotationId || `custom-quote-${newSolpedNumber}`,
      quotationCode: params.quotationCode || `COT-SAP-2026-${newSolpedNumber.slice(-3)}`,
      clientCompanyName: params.clientCompanyName || 'Cliente Corporativo',
      projectTitle: params.projectTitle || 'Servicios Profesionales SAP',
      resourceId: `res-manual-${newSolpedNumber}-${posNum}`,
      positionNumber: posNum,
      roleTitle: pos.roleTitle || 'Consultor Especialista SAP',
      moduleCode: pos.moduleCode || 'SAP_ABAP',
      moduleName: pos.moduleName || pos.roleTitle || 'Especialista SAP',
      seniority: pos.seniority || 'Senior',
      supplierName: params.supplierName || 'Partner Subcontratista SAP',
      supplierTaxId: params.supplierTaxId || '',
      hours,
      unit: 'HUR',
      hourlyRate: rate,
      currency: pos.currency || defaultCurrency,
      currencySymbol: pos.currencySymbol || defaultCurrencySymbol,
      totalAmount,
      status: 'pending_approval',
      requisitioner: reqUser,
      professionalId: pos.professionalId,
      professionalName: pos.professionalName,
      createdAt: now,
      notes: params.notes || (params.referenceSolpedNumber ? `Creada con referencia a SOLPED #${params.referenceSolpedNumber} (ME51N)` : undefined)
    };
  });

  const updatedSolpeds = [...allSolpeds, ...newPositions];
  saveStoredSolpeds(updatedSolpeds);
  return newPositions;
}

