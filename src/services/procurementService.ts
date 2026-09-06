import { 
  Quotation, 
  SapResourceItem, 
  ServicePurchaseRequisition, 
  ServicePurchaseOrder, 
  ServiceEntrySheet,
  SolpedStatus,
  PurchaseOrderStatus
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
    const raw = localStorage.getItem(SOLPEDS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SOLPEDS_STORAGE_KEY, JSON.stringify(INITIAL_SOLPEDS));
      return INITIAL_SOLPEDS;
    }
    return JSON.parse(raw);
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
 * Synchronize SOLPEDs whenever a Quotation is saved with external resources.
 * Returns the updated resources with their assigned solpedNumber.
 */
export function syncSolpedsForQuotation(
  quotation: Quotation
): { updatedResources: SapResourceItem[]; generatedSolpeds: ServicePurchaseRequisition[] } {
  const existingSolpeds = getStoredSolpeds();
  let nextSolpedNum = 10000040 + existingSolpeds.length + 1;

  const currentQuoteSolpeds = existingSolpeds.filter(s => s.quotationId === quotation.id);
  const otherSolpeds = existingSolpeds.filter(s => s.quotationId !== quotation.id);

  const updatedResources = [...(quotation.resources || [])];
  const newOrUpdatedSolpedsForQuote: ServicePurchaseRequisition[] = [];

  updatedResources.forEach((res, index) => {
    const isExternal = res.staffingType === 'external';

    if (isExternal) {
      // Find matching SOLPED by resourceId or matching solpedNumber
      let solped = currentQuoteSolpeds.find(s => s.resourceId === res.id || s.id === res.solpedId);

      const posNum = (index + 1) * 10;
      const hourlyCost = res.externalCostRate && res.externalCostRate > 0 ? res.externalCostRate : res.hourlyRate;
      const totalCost = res.hours * hourlyCost;
      const supplierName = res.supplierName?.trim() || 'Subcontratista / Partner Externo SAP';

      if (!solped) {
        // Generate new SAP SOLPED (ME51N)
        const newNumber = String(nextSolpedNum++);
        solped = {
          id: `sol-${Date.now()}-${index}`,
          solpedNumber: newNumber,
          documentType: 'NB',
          itemCategory: 'D',
          accountAssignmentCategory: 'P',
          pepElement: `PEP-${quotation.code.replace('COT-', '')}.${index + 1}`,
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
          supplierName: supplierName,
          supplierTaxId: res.supplierTaxId,
          hours: res.hours,
          unit: 'HUR',
          hourlyRate: hourlyCost,
          currency: quotation.currency,
          currencySymbol: quotation.currencySymbol,
          totalAmount: totalCost,
          status: 'pending_approval',
          requisitioner: 'PMO Lead / Jefe de Proyecto SAP',
          createdAt: new Date().toISOString().slice(0, 10),
          notes: `Solicitud de Pedido de Servicio originada automáticamente desde cotización ${quotation.code}.`
        };
      } else {
        // Update existing SOLPED details
        solped = {
          ...solped,
          quotationCode: quotation.code,
          clientCompanyName: quotation.client.companyName,
          projectTitle: quotation.project.projectTitle,
          roleTitle: res.roleTitle,
          hours: res.hours,
          hourlyRate: hourlyCost,
          currency: quotation.currency,
          currencySymbol: quotation.currencySymbol,
          totalAmount: totalCost,
          supplierName: supplierName
        };
      }

      newOrUpdatedSolpedsForQuote.push(solped);
      res.solpedId = solped.id;
      res.solpedNumber = solped.solpedNumber;
      res.supplierName = supplierName;
    } else {
      // If resource is internal, ensure it has no active pending SOLPED
      res.staffingType = 'internal';
    }
  });

  // Keep any previously converted/approved solpeds that were already processed
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
 */
export function releaseSolped(
  solpedId: string, 
  approverName: string = 'Gerente de Proyectos / PMO'
): ServicePurchaseRequisition | null {
  const solpeds = getStoredSolpeds();
  const index = solpeds.findIndex(s => s.id === solpedId);
  if (index === -1) return null;

  const solped = solpeds[index];
  const updated: ServicePurchaseRequisition = {
    ...solped,
    status: 'approved',
    releaseStrategy: {
      group: 'SR',
      code: 'L1',
      releasedBy: approverName,
      releasedAt: new Date().toISOString().slice(0, 10)
    }
  };

  solpeds[index] = updated;
  saveStoredSolpeds(solpeds);
  return updated;
}

/**
 * Convert an approved SOLPED into an SAP Purchase Order (ME21N)
 */
export function convertSolpedToPurchaseOrder(
  solpedId: string,
  extraDetails?: {
    supplierName?: string;
    supplierTaxId?: string;
    supplierEmail?: string;
    paymentTerms?: string;
    buyerNotes?: string;
  }
): { purchaseOrder: ServicePurchaseOrder; updatedSolped: ServicePurchaseRequisition } | null {
  const solpeds = getStoredSolpeds();
  const solped = solpeds.find(s => s.id === solpedId);
  if (!solped) return null;

  const purchaseOrders = getStoredPurchaseOrders();
  const nextPoNum = 4500000100 + purchaseOrders.length + 1;
  const poNumber = String(nextPoNum);

  const supplier = extraDetails?.supplierName || solped.supplierName || 'Partner Subcontratista SAP';
  const netAmount = solped.totalAmount;
  const taxRatePercentage = solped.currency === 'CLP' ? 19 : solped.currency === 'MXN' ? 16 : 0;
  const taxAmount = Math.round((netAmount * taxRatePercentage) / 100);
  const totalAmount = netAmount + taxAmount;

  const newPo: ServicePurchaseOrder = {
    id: `po-${Date.now()}`,
    poNumber,
    solpedId: solped.id,
    solpedNumber: solped.solpedNumber,
    documentType: 'NB',
    quotationId: solped.quotationId,
    quotationCode: solped.quotationCode,
    clientCompanyName: solped.clientCompanyName,
    projectTitle: solped.projectTitle,
    supplierName: supplier,
    supplierTaxId: extraDetails?.supplierTaxId || solped.supplierTaxId || '76.000.000-0',
    supplierEmail: extraDetails?.supplierEmail || 'compras@proveedor-sap.com',
    paymentTerms: extraDetails?.paymentTerms || '30 días fecha factura contra HES (Hoja de Entrada de Servicios)',
    roleTitle: solped.roleTitle,
    moduleCode: solped.moduleCode,
    hoursContracted: solped.hours,
    hourlyRate: solped.hourlyRate,
    currency: solped.currency,
    currencySymbol: solped.currencySymbol,
    netAmount,
    taxRatePercentage,
    taxAmount,
    totalAmount,
    pepElement: solped.pepElement,
    costCenter: solped.costCenter,
    issueDate: new Date().toISOString().slice(0, 10),
    estimatedDeliveryDate: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
    status: 'issued',
    serviceEntrySheets: [],
    buyerNotes: extraDetails?.buyerNotes || `Orden de compra generada a partir de SOLPED ${solped.solpedNumber} (Cotización ${solped.quotationCode}).`,
    companySigner: 'Gerencia de Abastecimiento & Compras'
  };

  // Update SOLPED status
  const updatedSolped: ServicePurchaseRequisition = {
    ...solped,
    status: 'converted_to_po',
    convertedPoId: newPo.id,
    convertedPoNumber: newPo.poNumber
  };

  const updatedSolpeds = solpeds.map(s => (s.id === solped.id ? updatedSolped : s));
  saveStoredSolpeds(updatedSolpeds);

  const updatedPos = [newPo, ...purchaseOrders];
  saveStoredPurchaseOrders(updatedPos);

  return {
    purchaseOrder: newPo,
    updatedSolped
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
  const hoursContracted = updates.hoursContracted !== undefined ? Number(updates.hoursContracted) : po.hoursContracted;
  const hourlyRate = updates.hourlyRate !== undefined ? Number(updates.hourlyRate) : po.hourlyRate;
  const taxRatePercentage = updates.taxRatePercentage !== undefined ? Number(updates.taxRatePercentage) : po.taxRatePercentage;
  
  const netAmount = hoursContracted * hourlyRate;
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
