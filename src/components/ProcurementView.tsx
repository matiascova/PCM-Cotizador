import React, { useState } from 'react';
import { 
  ShoppingBag, 
  FileText, 
  CheckCircle2, 
  Check,
  Clock, 
  AlertCircle, 
  ArrowRight, 
  Layers, 
  Building2, 
  User, 
  Briefcase, 
  DollarSign, 
  Plus, 
  Printer, 
  ExternalLink, 
  Filter, 
  Search, 
  ChevronRight, 
  ShieldCheck, 
  ArrowUpRight, 
  FileCheck2, 
  Send,
  X,
  Sparkles,
  ClipboardList,
  Edit2,
  Trash2,
  Ban,
  CheckCheck,
  AlertTriangle,
  Lock,
  Download,
  Sigma,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Table as TableIcon,
  PlusCircle,
  FileSpreadsheet,
  Coins,
  RefreshCw,
  Zap,
  Copy,
  FilePlus
} from 'lucide-react';
import { 
  Quotation, 
  ServicePurchaseRequisition, 
  ServicePurchaseOrder, 
  ServicePoItem,
  ServiceEntrySheet,
  SolpedStatus,
  PurchaseOrderStatus,
  SupportedCurrency,
  SeniorityLevel,
  SapModuleCode
} from '../types';
import { 
  getStoredSolpeds, 
  saveStoredSolpeds, 
  getStoredPurchaseOrders, 
  saveStoredPurchaseOrders, 
  releaseSolped, 
  rejectSolped,
  updateSolped,
  deleteSolped,
  convertSolpedToPurchaseOrder, 
  addServiceEntrySheetToPo,
  updatePurchaseOrder,
  deletePurchaseOrder,
  authorizePurchaseOrder,
  rejectPurchaseOrder,
  getSolpedPositions,
  saveSolpedPositions,
  addPositionToSolped,
  deleteSolpedPosition,
  createNewSolped,
  CreateSolpedPositionItem
} from '../services/procurementService';
import { formatCurrency } from '../utils/calculations';
import { CURRENCIES, convertCurrency, getBenchmarkRate } from '../utils/currencies';
import { getCachedBancoCentralData } from '../services/bcentralService';
import { getStoredModules, SapCatalogModule, getModuleBenchmarkRate } from '../data/sapModules';
import { getStoredSuppliers } from '../data/suppliersMaster';

export interface SapSpecialtyPreset {
  id: string;
  label: string;
  code: string;
  moduleName: string;
  category: string;
  description: string;
}

export const SAP_SPECIALTY_PRESETS: SapSpecialtyPreset[] = [
  // ⭐ Principales y más requeridas
  { id: 'abaper', label: 'ABAPER', code: 'DEV_ABAP', moduleName: 'Desarrollador ABAP', category: 'Técnico', description: 'Desarrollo ABAP Cloud, RAP, RICEFW, CDS Views y Fiori' },
  { id: 'mm', label: 'Consultor MM', code: 'SAP_MM', moduleName: 'SAP MM', category: 'Funcional', description: 'Gestión de Materiales, Compras, Aprovisionamiento y Stock' },
  { id: 'hcm', label: 'Consultor HCM', code: 'SAP_HCM', moduleName: 'SAP HCM', category: 'Funcional', description: 'Gestión de Capital Humano, Nómina / Planilla y Tiempos' },
  { id: 'fico', label: 'Consultor FICO', code: 'SAP_FICO', moduleName: 'SAP FICO', category: 'Funcional', description: 'Finanzas (FI), Contabilidad General y Controlling (CO)' },
  { id: 'basis', label: 'Consultor Basis', code: 'SAP_BASIS', moduleName: 'SAP Basis', category: 'Técnico', description: 'Administración Técnica de Sistemas SAP, HANA y NetWeaver' },
  { id: 'sd', label: 'Consultor SD', code: 'SAP_SD', moduleName: 'SAP SD', category: 'Funcional', description: 'Ventas, Facturación y Distribución Comercial' },
  { id: 'pm', label: 'Consultor PM', code: 'SAP_PM', moduleName: 'SAP PM', category: 'Funcional', description: 'Mantenimiento de Planta y Gestión de Activos' },
  { id: 'qm', label: 'Consultor QM', code: 'SAP_QM', moduleName: 'SAP QM', category: 'Funcional', description: 'Gestión de Calidad, Inspecciones y Certificados' },
  { id: 'le', label: 'Consultor LE', code: 'SAP_LE', moduleName: 'SAP LE', category: 'Funcional', description: 'Logística de Ejecución, Expedición y Almacenes (WM)' },
  { id: 'seguridad', label: 'Consultor Seguridad SAP', code: 'SAP_SECURITY', moduleName: 'Seguridad SAP', category: 'Técnico', description: 'Roles y Autorizaciones (PFCG), Auditoría y Matriz SoD' },
  { id: 'pp', label: 'Consultor PP', code: 'SAP_PP', moduleName: 'SAP PP', category: 'Funcional', description: 'Planificación y Control de la Producción' },
  { id: 'btp', label: 'Consultor SAP BTP', code: 'SAP_BTP', moduleName: 'SAP BTP', category: 'Técnico', description: 'Business Technology Platform e Integración Cloud' },
  { id: 'arquitecto', label: 'Arquitecto SAP', code: 'SAP_ARCH', moduleName: 'Arquitectura SAP', category: 'Gestión', description: 'Arquitectura de Soluciones Integrales SAP S/4HANA' },
  { id: 'pmo', label: 'Project Manager SAP', code: 'SAP_PMO_LEAD', moduleName: 'PMO SAP', category: 'Gestión', description: 'Dirección de Proyectos SAP y Metodología SAP Activate' },
];

interface ProcurementViewProps {
  quotations: Quotation[];
  onSelectQuotation?: (quote: Quotation) => void;
  onOpenNewQuotation?: () => void;
}

// Helper to match a position with a module in company catalog (Módulos SAP y Perfiles)
export const getCatalogModuleForPosition = (
  pos: ServicePurchaseRequisition | undefined,
  modules: SapCatalogModule[]
): SapCatalogModule | undefined => {
  if (!pos) return undefined;
  
  // 1. By module code
  if (pos.moduleCode) {
    const found = modules.find(m => m.code.toUpperCase() === pos.moduleCode.toUpperCase());
    if (found) return found;
  }
  
  // 2. By role title
  const title = (pos.roleTitle || '').trim().toLowerCase();
  if (title) {
    const found = modules.find(m => {
      const name = m.name.toLowerCase();
      const shortName = m.shortName.toLowerCase();
      const code = m.code.toLowerCase();
      return title === name || title === shortName || title === code ||
             title.includes(name) || name.includes(title) ||
             title.includes(shortName) || title.includes(code);
    });
    if (found) return found;

    // Preset lookup
    const preset = SAP_SPECIALTY_PRESETS.find(p => 
      p.label.toLowerCase() === title || title.includes(p.label.toLowerCase())
    );
    if (preset) {
      const presetMod = modules.find(m => m.code.toUpperCase() === preset.code.toUpperCase());
      if (presetMod) return presetMod;
    }
  }

  return modules.find(m => m.code === 'DEV_ABAP') || modules[0];
};

// Helper to determine seniority of position
export const getSeniorityForPosition = (pos: ServicePurchaseRequisition | undefined): SeniorityLevel => {
  if (!pos) return 'Senior';
  if (pos.seniority) return pos.seniority;
  const title = (pos.roleTitle || '').toLowerCase();
  if (title.includes('lead') || title.includes('arquitecto') || title.includes('principal')) return 'Lead / Arquitecto';
  if (title.includes('semi-senior') || title.includes('semi senior') || title.includes('ssr')) return 'Semi-Senior';
  if (title.includes('junior') || title.includes('jr')) return 'Junior';
  return 'Senior';
};

export const ProcurementView: React.FC<ProcurementViewProps> = ({
  quotations,
  onSelectQuotation
}) => {
  const [solpeds, setSolpeds] = useState<ServicePurchaseRequisition[]>(() => getStoredSolpeds());
  const [purchaseOrders, setPurchaseOrders] = useState<ServicePurchaseOrder[]>(() => getStoredPurchaseOrders());
  
  const [activeTab, setActiveTab] = useState<'solpeds' | 'pos' | 'flow'>('solpeds');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals state
  const [selectedSolpedForDetail, setSelectedSolpedForDetail] = useState<ServicePurchaseRequisition | null>(null);
  const [solpedToConvert, setSolpedToConvert] = useState<ServicePurchaseRequisition | null>(null);
  const [poForHes, setPoForHes] = useState<ServicePurchaseOrder | null>(null);
  const [poForPrint, setPoForPrint] = useState<ServicePurchaseOrder | null>(null);

  // Edit SOLPED state
  const [editingSolped, setEditingSolped] = useState<ServicePurchaseRequisition | null>(null);
  const [editingSolpedPositions, setEditingSolpedPositions] = useState<ServicePurchaseRequisition[]>([]);
  const [selectedPosId, setSelectedPosId] = useState<string>('');
  
  const [editSolpedSupplierName, setEditSolpedSupplierName] = useState('');
  const [editSolpedSupplierTaxId, setEditSolpedSupplierTaxId] = useState('');
  const [editSolpedRoleTitle, setEditSolpedRoleTitle] = useState('');
  const [editSolpedHours, setEditSolpedHours] = useState<number>(0);
  const [editSolpedRate, setEditSolpedRate] = useState<number>(0);
  const [editSolpedPep, setEditSolpedPep] = useState('');
  const [editSolpedCeco, setEditSolpedCeco] = useState('');
  const [editSolpedNotes, setEditSolpedNotes] = useState('');
  const [currencyChangeNotice, setCurrencyChangeNotice] = useState<string | null>(null);
  const [standardRateNotice, setStandardRateNotice] = useState<string | null>(null);
  const [companyCatalogModules, setCompanyCatalogModules] = useState<SapCatalogModule[]>(() => getStoredModules());

  // ALV controls
  const [showAlvTotals, setShowAlvTotals] = useState<boolean>(true);
  const [sortField, setSortField] = useState<'solped' | 'position' | 'amount' | 'hours' | 'supplier'>('solped');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Delete SOLPED state
  const [solpedToDelete, setSolpedToDelete] = useState<ServicePurchaseRequisition | null>(null);

  // Delete Purchase Order state
  const [poToDelete, setPoToDelete] = useState<ServicePurchaseOrder | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Edit PO state
  const [editingPo, setEditingPo] = useState<ServicePurchaseOrder | null>(null);
  const [editingPoPositions, setEditingPoPositions] = useState<ServicePoItem[]>([]);
  const [activePoPosIndex, setActivePoPosIndex] = useState<number>(0);
  const [editPoSupplierName, setEditPoSupplierName] = useState('');
  const [editPoSupplierTaxId, setEditPoSupplierTaxId] = useState('');
  const [editPoSupplierEmail, setEditPoSupplierEmail] = useState('');
  const [editPoSupplierContact, setEditPoSupplierContact] = useState('');
  const [editPoPaymentTerms, setEditPoPaymentTerms] = useState('');
  const [editPoRoleTitle, setEditPoRoleTitle] = useState('');
  const [editPoHours, setEditPoHours] = useState<number>(0);
  const [editPoRate, setEditPoRate] = useState<number>(0);
  const [editPoPep, setEditPoPep] = useState('');
  const [editPoCeco, setEditPoCeco] = useState('');
  const [editPoDeliveryDate, setEditPoDeliveryDate] = useState('');
  const [editPoBuyerNotes, setEditPoBuyerNotes] = useState('');

  // Conversion form state
  const [convertSupplierName, setConvertSupplierName] = useState('');
  const [convertSupplierTaxId, setConvertSupplierTaxId] = useState('');
  const [convertSupplierEmail, setConvertSupplierEmail] = useState('');
  const [convertPaymentTerms, setConvertPaymentTerms] = useState('30 días contra HES aprobada y Factura Electrónica');
  const [convertBuyerNotes, setConvertBuyerNotes] = useState('');

  // HES form state
  const [hesHours, setHesHours] = useState<number>(40);
  const [hesDescription, setHesDescription] = useState('Certificación de horas de consultoría y entregables del periodo.');
  const [hesConsultantName, setHesConsultantName] = useState('');
  const [hesApprover, setHesApprover] = useState('Jefe de Proyecto SAP / PMO');

  // Estados para Crear Nueva SOLPED (Transacción SAP ME51N)
  const [isCreatingSolped, setIsCreatingSolped] = useState(false);
  const [createMode, setCreateMode] = useState<'blank' | 'reference'>('blank');
  const [selectedReferenceSolpedNum, setSelectedReferenceSolpedNum] = useState<string>('');
  
  // Datos de cabecera para la nueva SOLPED
  const [newSolpedSupplier, setNewSolpedSupplier] = useState('Partner Subcontratista SAP');
  const [newSolpedSupplierTaxId, setNewSolpedSupplierTaxId] = useState('');
  const [newSolpedQuotationId, setNewSolpedQuotationId] = useState('');
  const [newSolpedQuotationCode, setNewSolpedQuotationCode] = useState('');
  const [newSolpedClientName, setNewSolpedClientName] = useState('');
  const [newSolpedProjectTitle, setNewSolpedProjectTitle] = useState('');
  const [newSolpedPep, setNewSolpedPep] = useState('');
  const [newSolpedCeco, setNewSolpedCeco] = useState('CC-10100');
  const [newSolpedCurrency, setNewSolpedCurrency] = useState<SupportedCurrency>('UF');
  const [newSolpedDocType, setNewSolpedDocType] = useState<'NB' | 'ZSRV'>('NB');
  const [newSolpedNotes, setNewSolpedNotes] = useState('');

  // Posiciones de la nueva SOLPED
  const [newSolpedPositions, setNewSolpedPositions] = useState<CreateSolpedPositionItem[]>([]);

  // Función para aplicar referencia de una SOLPED existente
  const applyReferenceSolped = (refNum: string) => {
    setSelectedReferenceSolpedNum(refNum);
    const refPositions = solpeds.filter(s => s.solpedNumber === refNum);
    if (refPositions.length > 0) {
      const base = refPositions[0];
      setNewSolpedSupplier(base.supplierName || 'Partner Subcontratista SAP');
      setNewSolpedSupplierTaxId(base.supplierTaxId || '');
      setNewSolpedQuotationId(base.quotationId || '');
      setNewSolpedQuotationCode(base.quotationCode || '');
      setNewSolpedClientName(base.clientCompanyName || '');
      setNewSolpedProjectTitle(base.projectTitle || '');
      setNewSolpedPep(base.pepElement || '');
      setNewSolpedCeco(base.costCenter || 'CC-10100');
      setNewSolpedCurrency(base.currency || 'UF');
      setNewSolpedDocType(base.documentType || 'NB');
      setNewSolpedNotes(`Creada con referencia a SOLPED #${refNum} (ME51N)`);
      
      setNewSolpedPositions(refPositions.map(p => ({
        roleTitle: p.roleTitle,
        moduleCode: p.moduleCode,
        moduleName: p.moduleName,
        seniority: p.seniority,
        hours: p.hours,
        hourlyRate: p.hourlyRate,
        currency: p.currency,
        currencySymbol: p.currencySymbol,
        pepElement: p.pepElement,
        costCenter: p.costCenter || base.costCenter || 'CC-10100'
      })));
    }
  };

  // Abrir modal de creación de SOLPED
  const handleOpenCreateSolped = (initialMode: 'blank' | 'reference' = 'blank', referenceNum?: string) => {
    setCreateMode(initialMode);
    const uniqueSolpedsList: ServicePurchaseRequisition[] = Array.from(new Map<string, ServicePurchaseRequisition>(solpeds.map(s => [s.solpedNumber, s])).values());
    const refNum = referenceNum || (uniqueSolpedsList.length > 0 ? uniqueSolpedsList[0].solpedNumber : '');

    if (initialMode === 'reference' && refNum) {
      applyReferenceSolped(refNum);
    } else {
      setSelectedReferenceSolpedNum('');
      setNewSolpedSupplier('Partner Subcontratista SAP');
      setNewSolpedSupplierTaxId('');
      
      if (quotations && quotations.length > 0) {
        const firstQ = quotations[0];
        setNewSolpedQuotationId(firstQ.id);
        setNewSolpedQuotationCode(firstQ.quotationCode || firstQ.id);
        setNewSolpedClientName(firstQ.clientCompanyName || '');
        setNewSolpedProjectTitle(firstQ.projectTitle || '');
        setNewSolpedPep(`PEP-${firstQ.quotationCode || 'PRJ-2026'}.1`);
        setNewSolpedCurrency(firstQ.currency || 'UF');
      } else {
        setNewSolpedQuotationId('');
        setNewSolpedQuotationCode('COT-SAP-2026-001');
        setNewSolpedClientName('Inversiones Twin Ducks Capital SpA');
        setNewSolpedProjectTitle('Consultoría y Servicios SAP Especializados');
        setNewSolpedPep('PEP-SAP-2026-001.1');
        setNewSolpedCurrency('UF');
      }
      setNewSolpedCeco('CC-10100');
      setNewSolpedDocType('NB');
      setNewSolpedNotes('');
      setNewSolpedPositions([
        {
          roleTitle: 'ABAPER',
          moduleCode: 'DEV_ABAP',
          moduleName: 'Desarrollador ABAP',
          seniority: 'Senior',
          hours: 120,
          hourlyRate: 2.0,
          currency: 'UF',
          currencySymbol: 'UF',
          pepElement: '',
          costCenter: 'CC-10100'
        }
      ]);
    }

    setIsCreatingSolped(true);
  };

  const handleSelectQuotationForSolped = (quoteId: string) => {
    const q = quotations?.find(item => item.id === quoteId);
    if (q) {
      setNewSolpedQuotationId(q.id);
      setNewSolpedQuotationCode(q.quotationCode || q.id);
      setNewSolpedClientName(q.clientCompanyName || '');
      setNewSolpedProjectTitle(q.projectTitle || '');
      setNewSolpedPep(`PEP-${q.quotationCode || 'PRJ-2026'}.1`);
      if (q.currency) {
        setNewSolpedCurrency(q.currency);
        setNewSolpedPositions(prev => prev.map(p => ({
          ...p,
          currency: q.currency,
          currencySymbol: q.currency === 'UF' ? 'UF' : '$'
        })));
      }
    } else {
      setNewSolpedQuotationId('');
    }
  };

  const handleAddNewSolpedPosition = () => {
    const defaultPreset = SAP_SPECIALTY_PRESETS[0];
    const defaultRate = newSolpedCurrency === 'UF' ? 2.0 : newSolpedCurrency === 'USD' ? 45 : 35000;
    setNewSolpedPositions(prev => [
      ...prev,
      {
        roleTitle: defaultPreset.label,
        moduleCode: defaultPreset.code as SapModuleCode,
        moduleName: defaultPreset.moduleName,
        seniority: 'Senior',
        hours: 80,
        hourlyRate: defaultRate,
        currency: newSolpedCurrency,
        currencySymbol: newSolpedCurrency === 'UF' ? 'UF' : '$',
        costCenter: newSolpedCeco || 'CC-10100'
      }
    ]);
  };

  const handleRemoveSolpedPosition = (index: number) => {
    if (newSolpedPositions.length <= 1) return;
    setNewSolpedPositions(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateSolpedPosition = (index: number, field: keyof CreateSolpedPositionItem, value: any) => {
    setNewSolpedPositions(prev => prev.map((pos, idx) => {
      if (idx !== index) return pos;
      return { ...pos, [field]: value };
    }));
  };

  const handleSelectPresetForPosition = (index: number, presetId: string) => {
    const preset = SAP_SPECIALTY_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    setNewSolpedPositions(prev => prev.map((pos, idx) => {
      if (idx !== index) return pos;
      return {
        ...pos,
        roleTitle: preset.label,
        moduleCode: preset.code as SapModuleCode,
        moduleName: preset.moduleName
      };
    }));
  };

  const handleSaveNewSolped = () => {
    if (!newSolpedSupplier.trim()) {
      alert('Por favor ingrese el Proveedor / Subcontratista sugerido.');
      return;
    }
    if (newSolpedPositions.length === 0) {
      alert('Debe incluir al menos una posición de servicio.');
      return;
    }

    const created = createNewSolped({
      referenceSolpedNumber: createMode === 'reference' ? selectedReferenceSolpedNum : undefined,
      quotationId: newSolpedQuotationId,
      quotationCode: newSolpedQuotationCode,
      clientCompanyName: newSolpedClientName,
      projectTitle: newSolpedProjectTitle,
      supplierName: newSolpedSupplier,
      supplierTaxId: newSolpedSupplierTaxId,
      pepElement: newSolpedPep || 'PEP-SAP-2026-001.1',
      costCenter: newSolpedCeco || 'CC-10100',
      documentType: newSolpedDocType,
      currency: newSolpedCurrency,
      currencySymbol: newSolpedCurrency === 'UF' ? 'UF' : '$',
      notes: newSolpedNotes,
      positions: newSolpedPositions
    });

    reloadData();
    setIsCreatingSolped(false);
    const newNum = created[0]?.solpedNumber || '';
    setSuccessNotice(
      `✓ Solicitud de Pedido SOLPED #${newNum} creada exitosamente con ${created.length} posición(es) (Transacción SAP ME51N). Estado: Pendiente de Liberación (ME54N).`
    );
  };

  const reloadData = () => {
    setSolpeds(getStoredSolpeds());
    setPurchaseOrders(getStoredPurchaseOrders());
  };

  // Authorize / Liberar SOLPED (ME54N)
  const handleAuthorizeSolped = (solped: ServicePurchaseRequisition) => {
    const updated = releaseSolped(solped.id, 'Gerencia de Proyectos / Compras SAP');
    if (updated) {
      reloadData();
      if (selectedSolpedForDetail?.id === solped.id) {
        setSelectedSolpedForDetail(updated);
      }
    }
  };

  // Rechazar SOLPED
  const handleRejectSolped = (solped: ServicePurchaseRequisition) => {
    const updated = rejectSolped(solped.id, 'Rechazada por control de abastecimiento y costos');
    if (updated) {
      reloadData();
      if (selectedSolpedForDetail?.id === solped.id) {
        setSelectedSolpedForDetail(updated);
      }
    }
  };

  // Open Edit SOLPED modal (ME52N) with ALV Positions
  const handleOpenEditSolped = (solped: ServicePurchaseRequisition) => {
    if (solped.status === 'converted_to_po' || solped.convertedPoId) return;
    // Always refresh company modules from stored modules so newly created profiles (e.g. Arquitecto AI) appear immediately
    setCompanyCatalogModules(getStoredModules());
    setEditingSolped(solped);

    // Retrieve all positions for this SOLPED
    const relatedPositions = getSolpedPositions(solped.solpedNumber);
    const positionsList = relatedPositions.length > 0 ? relatedPositions : [solped];
    setEditingSolpedPositions(positionsList);

    const active = positionsList.find(p => p.id === solped.id) || positionsList[0];
    setSelectedPosId(active.id);

    setEditSolpedSupplierName(active.supplierName || '');
    setEditSolpedSupplierTaxId(active.supplierTaxId || '');
    setEditSolpedRoleTitle(active.roleTitle || '');
    setEditSolpedHours(active.hours || 0);
    setEditSolpedRate(active.hourlyRate || 0);
    setEditSolpedPep(active.pepElement || '');
    setEditSolpedCeco(active.costCenter || '');
    setEditSolpedNotes(active.notes || '');
  };

  // Select a specific position in the ME52N ALV Grid
  const handleSelectPositionInModal = (target: ServicePurchaseRequisition | string) => {
    const pos = typeof target === 'string'
      ? editingSolpedPositions.find(p => p.id === target)
      : target;
    if (!pos) return;

    setSelectedPosId(pos.id);
    setEditSolpedSupplierName(pos.supplierName || '');
    setEditSolpedSupplierTaxId(pos.supplierTaxId || '');
    setEditSolpedRoleTitle(pos.roleTitle || '');
    setEditSolpedHours(pos.hours || 0);
    setEditSolpedRate(pos.hourlyRate || 0);
    setEditSolpedPep(pos.pepElement || '');
    setEditSolpedCeco(pos.costCenter || '');
    setEditSolpedNotes(pos.notes || '');
  };

  // Update a field for the active position in ME52N modal
  const handleUpdateActivePosition = (field: keyof ServicePurchaseRequisition, value: any) => {
    setEditingSolpedPositions(prev => prev.map(p => {
      if (p.id === selectedPosId) {
        const updated = { ...p, [field]: value };
        if (field === 'hours' || field === 'hourlyRate') {
          const h = field === 'hours' ? Number(value) || 0 : p.hours;
          const r = field === 'hourlyRate' ? Number(value) || 0 : p.hourlyRate;
          updated.hours = h;
          updated.hourlyRate = r;
          updated.totalAmount = h * r;
        }
        return updated;
      }
      return p;
    }));
  };

  // Select an SAP specialty preset for the active position
  const handleSelectSpecialtyForActivePos = (
    specialtyTitle: string,
    optModuleCode?: string,
    optModuleName?: string
  ) => {
    let mCode = optModuleCode;
    let mName = optModuleName;
    const lower = specialtyTitle.toLowerCase();
    if (!mCode) {
      // First check dynamic company catalog modules
      const matchModule = companyCatalogModules.find(
        m => m.name.toLowerCase() === lower || 
             m.shortName.toLowerCase() === lower ||
             m.code.toLowerCase() === lower ||
             lower.includes(m.name.toLowerCase()) ||
             lower.includes(m.code.toLowerCase())
      );
      if (matchModule) {
        mCode = matchModule.code;
        mName = matchModule.name;
      } else {
        const matchPreset = SAP_SPECIALTY_PRESETS.find(
          p => p.label.toLowerCase() === lower || lower.includes(p.label.toLowerCase())
        );
        if (matchPreset) {
          mCode = matchPreset.code;
          mName = matchPreset.moduleName;
        }
      }
    }

    setEditingSolpedPositions(prev => prev.map(p => {
      if (p.id === selectedPosId) {
        return {
          ...p,
          roleTitle: specialtyTitle,
          moduleCode: mCode || p.moduleCode,
          moduleName: mName || p.moduleName
        };
      }
      return p;
    }));
    setEditSolpedRoleTitle(specialtyTitle);
  };

  // Convert currency of SOLPED (only allowed if no PO has been created yet)
  const handleChangeSolpedCurrency = (newCurrency: SupportedCurrency) => {
    if (!editingSolped) return;
    const currentCurrency = (editingSolpedPositions[0]?.currency || editingSolped.currency || 'USD') as SupportedCurrency;
    if (currentCurrency === newCurrency) return;

    const targetConfig = CURRENCIES[newCurrency] || CURRENCIES.USD;
    const targetSymbol = targetConfig.symbol;

    const data = getCachedBancoCentralData();
    const ufRate = data?.indicators?.uf?.value || 40879.04;
    const dolarRate = data?.indicators?.dolar?.value || 933.47;
    const mxnRate = CURRENCIES.MXN?.approxRateToUSD || 18.5;

    // Helper for accurate rate conversion
    const convertRate = (rate: number, from: SupportedCurrency, to: SupportedCurrency): number => {
      if (from === to) return rate;
      let inUSD = rate;
      if (from === 'CLP') inUSD = rate / dolarRate;
      else if (from === 'UF') inUSD = (rate * ufRate) / dolarRate;
      else if (from === 'MXN') inUSD = rate / mxnRate;

      if (to === 'USD') return Math.round(inUSD * 100) / 100;
      if (to === 'UF') return Math.round(((inUSD * dolarRate) / ufRate) * 100) / 100;
      if (to === 'CLP') return Math.round(inUSD * dolarRate);
      if (to === 'MXN') return Math.round(inUSD * mxnRate);
      return Math.round(inUSD * 100) / 100;
    };

    const updatedPositions = editingSolpedPositions.map(pos => {
      const posFromCurr = (pos.currency || currentCurrency) as SupportedCurrency;
      const convertedRate = convertRate(pos.hourlyRate || 0, posFromCurr, newCurrency);
      const hours = Number(pos.hours) || 0;
      const newTotal = hours * convertedRate;

      return {
        ...pos,
        currency: newCurrency,
        currencySymbol: targetSymbol,
        hourlyRate: convertedRate,
        totalAmount: newTotal
      };
    });

    setEditingSolpedPositions(updatedPositions);

    // Update active position edit inputs if needed
    const activeUpdated = updatedPositions.find(p => p.id === selectedPosId) || updatedPositions[0];
    if (activeUpdated) {
      setEditSolpedRate(activeUpdated.hourlyRate);
    }

    // Also update the editingSolped header object
    setEditingSolped(prev => {
      if (!prev) return null;
      const convertedHeaderRate = convertRate(prev.hourlyRate || 0, (prev.currency || currentCurrency) as SupportedCurrency, newCurrency);
      const newNetTotal = updatedPositions.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
      return {
        ...prev,
        currency: newCurrency,
        currencySymbol: targetSymbol,
        hourlyRate: convertedHeaderRate,
        totalAmount: newNetTotal
      };
    });

    setCurrencyChangeNotice(
      `Moneda de la SOLPED cambiada de ${currentCurrency} a ${newCurrency} (${targetSymbol}). Las tarifas e importes de las ${updatedPositions.length} posición(es) fueron recalculadas según el tipo de cambio oficial del Banco Central.`
    );
  };

  // Insert new position in ME52N ALV
  const handleInsertPositionInModal = () => {
    if (!editingSolped) return;
    const highestPos = editingSolpedPositions.length > 0
      ? Math.max(...editingSolpedPositions.map(p => p.positionNumber))
      : 0;
    const nextPosNum = highestPos + 10;
    const base = editingSolpedPositions[0] || editingSolped;

    const newPos: ServicePurchaseRequisition = {
      id: `sol-${Date.now()}-${nextPosNum}`,
      solpedNumber: editingSolped.solpedNumber,
      documentType: base.documentType,
      itemCategory: 'D',
      accountAssignmentCategory: base.accountAssignmentCategory,
      pepElement: `${base.pepElement.split('.')[0]}.${nextPosNum / 10}`,
      costCenter: base.costCenter || 'CC-10100',
      quotationId: base.quotationId,
      quotationCode: base.quotationCode,
      clientCompanyName: base.clientCompanyName,
      projectTitle: base.projectTitle,
      resourceId: `res-${Date.now()}`,
      positionNumber: nextPosNum,
      roleTitle: `Consultor Adicional Posición ${nextPosNum}`,
      moduleCode: base.moduleCode || 'SAP_GEN',
      moduleName: base.moduleName || 'Servicio Externo SAP',
      seniority: 'Senior',
      supplierName: base.supplierName || 'Subcontratista Sugerido',
      supplierTaxId: base.supplierTaxId || '',
      hours: 40,
      unit: 'HUR',
      hourlyRate: base.hourlyRate || 50,
      currency: base.currency,
      currencySymbol: base.currencySymbol,
      totalAmount: 40 * (base.hourlyRate || 50),
      status: base.status === 'converted_to_po' ? 'pending_approval' : base.status,
      requisitioner: base.requisitioner,
      createdAt: new Date().toISOString().slice(0, 10),
      notes: `Posición ${nextPosNum} incorporada en transacción ME52N.`
    };

    const nextList = [...editingSolpedPositions, newPos];
    setEditingSolpedPositions(nextList);
    handleSelectPositionInModal(newPos);
  };

  // Delete position in ME52N ALV
  const handleDeletePositionInModal = (posIdToDelete: string) => {
    const target = editingSolpedPositions.find(p => p.id === posIdToDelete);
    if (target && (target.convertedPoId || target.status === 'converted_to_po')) {
      alert('Esta posición ya cuenta con una Orden de Compra emitida y no puede ser eliminada.');
      return;
    }
    if (editingSolpedPositions.length <= 1) {
      alert('Una SOLPED SAP debe contener al menos una posición activa.');
      return;
    }
    const nextList = editingSolpedPositions.filter(p => p.id !== posIdToDelete);
    setEditingSolpedPositions(nextList);
    if (selectedPosId === posIdToDelete) {
      handleSelectPositionInModal(nextList[0]);
    }
  };

  // Save Edit SOLPED (ME52N)
  const handleSaveEditSolped = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSolped) return;

    saveSolpedPositions(editingSolped.solpedNumber, editingSolpedPositions);
    reloadData();
    setEditingSolped(null);
    if (selectedSolpedForDetail?.solpedNumber === editingSolped.solpedNumber) {
      const updated = editingSolpedPositions.find(p => p.id === selectedPosId) || editingSolpedPositions[0];
      setSelectedSolpedForDetail(updated);
    }
  };

  // Export positions to CSV (ALV Export)
  const handleExportCsv = (items: ServicePurchaseRequisition[], filename: string) => {
    const headers = [
      'Posicion',
      'SOLPED_SAP',
      'Cotizacion',
      'Cliente',
      'Proyecto',
      'TipoPos',
      'Imputacion',
      'Servicio_Consultoria',
      'Proveedor_Subcontratista',
      'RUT_TaxID',
      'Horas_HUR',
      'Tarifa_Hora',
      'Valor_Neto',
      'Moneda',
      'Elemento_PEP',
      'Centro_Coste',
      'Estado_SAP'
    ];
    const rows = items.map(s => [
      s.positionNumber,
      s.solpedNumber,
      `"${s.quotationCode || ''}"`,
      `"${(s.clientCompanyName || '').replace(/"/g, '""')}"`,
      `"${(s.projectTitle || '').replace(/"/g, '""')}"`,
      s.itemCategory,
      s.accountAssignmentCategory,
      `"${(s.roleTitle || '').replace(/"/g, '""')}"`,
      `"${(s.supplierName || '').replace(/"/g, '""')}"`,
      s.supplierTaxId || '',
      s.hours,
      s.hourlyRate,
      s.totalAmount,
      s.currency,
      s.pepElement,
      s.costCenter || '',
      s.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Confirm Delete SOLPED
  const handleConfirmDeleteSolped = () => {
    if (!solpedToDelete) return;
    const success = deleteSolped(solpedToDelete.id);
    if (success) {
      reloadData();
      setSolpedToDelete(null);
      if (selectedSolpedForDetail?.id === solpedToDelete.id) {
        setSelectedSolpedForDetail(null);
      }
    }
  };

  // Confirm Delete / Anular Purchase Order (ME22N Borrado / Anulación)
  const handleConfirmDeletePo = () => {
    if (!poToDelete) return;
    const poNum = poToDelete.poNumber;
    const solNum = poToDelete.solpedNumber;
    const success = deletePurchaseOrder(poToDelete.id);
    if (success) {
      reloadData();
      if (editingPo?.id === poToDelete.id) {
        setEditingPo(null);
      }
      if (poForPrint?.id === poToDelete.id) {
        setPoForPrint(null);
      }
      setPoToDelete(null);
      setSuccessNotice(`Orden de Compra #${poNum} anulada y eliminada. Las posiciones de la SOLPED #${solNum} han quedado liberadas.`);
      setTimeout(() => setSuccessNotice(null), 5000);
    }
  };

  // Authorize / Liberar Purchase Order (ME28 / ME29N)
  const handleAuthorizePo = (po: ServicePurchaseOrder) => {
    const updated = authorizePurchaseOrder(po.id, 'Gerencia de Abastecimiento & Compras');
    if (updated) {
      reloadData();
    }
  };

  // Rechazar Purchase Order
  const handleRejectPo = (po: ServicePurchaseOrder) => {
    const updated = rejectPurchaseOrder(po.id, 'Rechazada por control financiero / compras');
    if (updated) {
      reloadData();
    }
  };

  // Open Edit PO modal (ME22N)
  const handleOpenEditPo = (po: ServicePurchaseOrder) => {
    setEditingPo(po);
    setEditPoSupplierName(po.supplierName || '');
    setEditPoSupplierTaxId(po.supplierTaxId || '');
    setEditPoSupplierEmail(po.supplierEmail || '');
    setEditPoSupplierContact(po.supplierContact || '');
    setEditPoPaymentTerms(po.paymentTerms || '');
    setEditPoRoleTitle(po.roleTitle || '');
    setEditPoHours(po.hoursContracted || 0);
    setEditPoRate(po.hourlyRate || 0);
    setEditPoPep(po.pepElement || '');
    setEditPoCeco(po.costCenter || '');
    setEditPoDeliveryDate(po.estimatedDeliveryDate || '');
    setEditPoBuyerNotes(po.buyerNotes || '');

    // Resolve ALV positions
    let items: ServicePoItem[] = [];
    if (po.items && Array.isArray(po.items) && po.items.length > 0) {
      items = po.items.map(it => ({ ...it }));
    } else {
      const solpedPositions = getSolpedPositions(po.solpedNumber);
      if (solpedPositions && solpedPositions.length > 0) {
        items = solpedPositions.map(sp => ({
          positionNumber: sp.positionNumber,
          roleTitle: sp.roleTitle,
          moduleCode: sp.moduleCode,
          seniority: sp.seniority,
          hours: sp.hours,
          hourlyRate: sp.hourlyRate,
          totalAmount: sp.totalAmount,
          pepElement: sp.pepElement,
          costCenter: sp.costCenter,
          resourceId: sp.resourceId
        }));
      } else {
        items = [{
          positionNumber: 10,
          roleTitle: po.roleTitle,
          moduleCode: po.moduleCode,
          hours: po.hoursContracted,
          hourlyRate: po.hourlyRate,
          totalAmount: po.netAmount,
          pepElement: po.pepElement,
          costCenter: po.costCenter
        }];
      }
    }
    setEditingPoPositions(items);
    setActivePoPosIndex(0);
  };

  // PO ALV Position Handlers
  const handleSelectPoPosition = (index: number) => {
    setActivePoPosIndex(index);
  };

  const handleUpdatePoPosition = (index: number, updates: Partial<ServicePoItem>) => {
    setEditingPoPositions(prev => {
      const next = [...prev];
      const current = next[index];
      if (!current) return prev;
      const hours = updates.hours !== undefined ? Number(updates.hours) : current.hours;
      const hourlyRate = updates.hourlyRate !== undefined ? Number(updates.hourlyRate) : current.hourlyRate;
      const totalAmount = hours * hourlyRate;
      next[index] = {
        ...current,
        ...updates,
        hours,
        hourlyRate,
        totalAmount
      };
      return next;
    });
  };

  const handleInsertPoPosition = () => {
    const maxPos = editingPoPositions.reduce((max, p) => Math.max(max, p.positionNumber || 0), 0);
    const newPosNum = maxPos > 0 ? maxPos + 10 : 10;
    const defaultRate = editingPo?.hourlyRate || editPoRate || 80;
    const newItem: ServicePoItem = {
      positionNumber: newPosNum,
      roleTitle: 'Consultor SAP Especialista',
      moduleCode: editingPo?.moduleCode || 'DEV_ABAP',
      seniority: 'Senior',
      hours: 40,
      hourlyRate: defaultRate,
      totalAmount: 40 * defaultRate,
      pepElement: editPoPep || `${editingPo?.quotationCode?.replace('COT-', 'PEP-') || 'PEP-SAP'}.${Math.floor(newPosNum / 10)}`,
      costCenter: editPoCeco || 'CC-10100'
    };
    setEditingPoPositions(prev => [...prev, newItem]);
    setActivePoPosIndex(editingPoPositions.length);
  };

  const handleDeletePoPosition = (index: number) => {
    if (editingPoPositions.length <= 1) {
      // Si solo queda una posición en la OC, ofrecer anular/eliminar la Orden de Compra completa
      if (editingPo) {
        setPoToDelete(editingPo);
      }
      return;
    }
    setEditingPoPositions(prev => prev.filter((_, idx) => idx !== index));
    setActivePoPosIndex(prev => Math.max(0, Math.min(prev, editingPoPositions.length - 2)));
  };

  const handleExportPoCsv = (items: ServicePoItem[], filename: string) => {
    const headers = ['Posicion', 'TipoPosicion', 'TipoImputacion', 'TextoBreve', 'Modulo', 'Seniority', 'Horas', 'TarifaHora', 'TotalNeto', 'ElementoPEP', 'CeCo'];
    const rows = items.map(p => [
      String(p.positionNumber).padStart(5, '0'),
      'D',
      'P',
      `"${(p.roleTitle || '').replace(/"/g, '""')}"`,
      p.moduleCode || '',
      p.seniority || '',
      p.hours,
      p.hourlyRate,
      p.totalAmount || (p.hours * p.hourlyRate),
      `"${p.pepElement || ''}"`,
      `"${p.costCenter || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Save Edit PO (ME22N)
  const handleSaveEditPo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPo) return;

    if (editingPoPositions.length === 0) {
      // Si no quedan posiciones, anular la OC
      handleConfirmDeletePo();
      return;
    }

    const totalPoHours = editingPoPositions.reduce((sum, p) => sum + (Number(p.hours) || 0), 0);
    const totalPoNet = editingPoPositions.reduce((sum, p) => sum + (Number(p.totalAmount) || ((Number(p.hours) || 0) * (Number(p.hourlyRate) || 0))), 0);
    const avgPoRate = totalPoHours > 0 ? Number((totalPoNet / totalPoHours).toFixed(2)) : editPoRate;

    const consolidatedRoleTitle = editingPoPositions.length === 1
      ? editingPoPositions[0].roleTitle
      : `Servicios Especializados (${editingPoPositions.length} especialistas: ${editingPoPositions.map(p => p.roleTitle).join(', ')})`;

    const updated = updatePurchaseOrder(editingPo.id, {
      supplierName: editPoSupplierName,
      supplierTaxId: editPoSupplierTaxId,
      supplierEmail: editPoSupplierEmail,
      supplierContact: editPoSupplierContact,
      paymentTerms: editPoPaymentTerms,
      roleTitle: editPoRoleTitle || consolidatedRoleTitle,
      hoursContracted: totalPoHours,
      hourlyRate: avgPoRate,
      netAmount: totalPoNet,
      pepElement: editPoPep || (editingPoPositions[0]?.pepElement || editingPo.pepElement),
      costCenter: editPoCeco || (editingPoPositions[0]?.costCenter || editingPo.costCenter),
      estimatedDeliveryDate: editPoDeliveryDate,
      buyerNotes: editPoBuyerNotes,
      items: editingPoPositions
    });

    if (updated) {
      reloadData();
      setEditingPo(null);
      if (poForPrint?.id === editingPo.id) {
        setPoForPrint(updated);
      }
      setSuccessNotice(`Orden de Compra #${updated.poNumber} actualizada exitosamente. Las posiciones en la SOLPED #${updated.solpedNumber} han sido sincronizadas.`);
      setTimeout(() => setSuccessNotice(null), 4500);
    } else {
      reloadData();
      setEditingPo(null);
    }
  };

  // Open Convert to PO modal (ME21N)
  const handleOpenConvert = (solped: ServicePurchaseRequisition) => {
    setSolpedToConvert(solped);
    setConvertSupplierName(solped.supplierName || 'Partner Subcontratista SAP');
    setConvertSupplierTaxId(solped.supplierTaxId || '76.884.210-9');
    setConvertSupplierEmail('compras@proveedor-sap.com');
    setConvertPaymentTerms('30 días contra HES aprobada y Factura Electrónica');
    setConvertBuyerNotes(`Adjudicación de servicio para proyecto ${solped.quotationCode} - ${solped.projectTitle}.`);
  };

  // Submit Convert to PO
  const handleConfirmConvert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!solpedToConvert) return;

    const result = convertSolpedToPurchaseOrder(solpedToConvert.id, {
      supplierName: convertSupplierName,
      supplierTaxId: convertSupplierTaxId,
      supplierEmail: convertSupplierEmail,
      paymentTerms: convertPaymentTerms,
      buyerNotes: convertBuyerNotes
    });

    if (result) {
      reloadData();
      setSolpedToConvert(null);
      setActiveTab('pos');
    }
  };

  // Submit HES (ML81N)
  const handleConfirmHes = (e: React.FormEvent) => {
    e.preventDefault();
    if (!poForHes) return;

    const result = addServiceEntrySheetToPo(poForHes.id, {
      hoursDelivered: Number(hesHours) || 0,
      description: hesDescription,
      consultantName: hesConsultantName || poForHes.supplierName,
      acceptedBy: hesApprover
    });

    if (result) {
      reloadData();
      setPoForHes(null);
    }
  };

  // KPIs Calculations
  const pendingReleaseCount = solpeds.filter(s => s.status === 'pending_approval').length;
  const approvedSolpedsCount = solpeds.filter(s => s.status === 'approved').length;
  const convertedSolpedsCount = solpeds.filter(s => s.status === 'converted_to_po').length;
  const activePosCount = purchaseOrders.length;
  const totalSubcontractedHours = solpeds.reduce((acc, s) => acc + s.hours, 0);

  // Filtered and Sorted SOLPED list (ALV Grid Engine)
  const filteredSolpeds = solpeds
    .filter(s => {
      const matchesSearch = 
        s.solpedNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.quotationCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.clientCompanyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(s.positionNumber).includes(searchQuery);

      if (!matchesSearch) return false;
      if (statusFilter === 'all') return true;
      return s.status === statusFilter;
    })
    .sort((a, b) => {
      let comp = 0;
      if (sortField === 'solped') {
        comp = a.solpedNumber.localeCompare(b.solpedNumber) || a.positionNumber - b.positionNumber;
      } else if (sortField === 'position') {
        comp = a.positionNumber - b.positionNumber;
      } else if (sortField === 'amount') {
        comp = a.totalAmount - b.totalAmount;
      } else if (sortField === 'hours') {
        comp = a.hours - b.hours;
      } else if (sortField === 'supplier') {
        comp = a.supplierName.localeCompare(b.supplierName);
      }
      return sortAsc ? comp : -comp;
    });

  // ALV Summary Totals
  const alvTotals = filteredSolpeds.reduce((acc, curr) => {
    acc.hours += curr.hours || 0;
    acc.count += 1;
    if (!acc.byCurrency[curr.currency]) {
      acc.byCurrency[curr.currency] = {
        amount: 0,
        symbol: curr.currencySymbol
      };
    }
    acc.byCurrency[curr.currency].amount += curr.totalAmount || 0;
    return acc;
  }, { hours: 0, count: 0, byCurrency: {} as Record<string, { amount: number; symbol: string }> });

  const filteredPos = purchaseOrders.filter(p => {
    const matchesSearch = 
      p.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.solpedNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.quotationCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.roleTitle.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    return p.status === statusFilter;
  });

  const getSolpedStatusBadge = (status: SolpedStatus) => {
    switch (status) {
      case 'draft':
        return { label: 'Borrador', bg: 'bg-slate-100 text-slate-700 border-slate-300' };
      case 'pending_approval':
        return { label: 'Pendiente Liberación (ME54N)', bg: 'bg-amber-50 text-amber-800 border-amber-300' };
      case 'approved':
        return { label: 'Liberada / Lista para Pedido', bg: 'bg-emerald-50 text-emerald-800 border-emerald-300' };
      case 'converted_to_po':
        return { label: 'Convertida en Pedido (ME21N)', bg: 'bg-blue-50 text-blue-800 border-blue-300' };
      case 'rejected':
        return { label: 'Rechazada', bg: 'bg-rose-50 text-rose-800 border-rose-300' };
      default:
        return { label: status, bg: 'bg-slate-100 text-slate-700 border-slate-300' };
    }
  };

  const getPoStatusBadge = (status: PurchaseOrderStatus) => {
    switch (status) {
      case 'draft':
        return { label: 'Borrador', bg: 'bg-slate-100 text-slate-700 border-slate-300' };
      case 'pending_approval':
        return { label: 'Pendiente Autorización', bg: 'bg-amber-50 text-amber-800 border-amber-300' };
      case 'authorized':
        return { label: 'Autorizada (ME28/ME29N)', bg: 'bg-emerald-50 text-emerald-800 border-emerald-300' };
      case 'issued':
        return { label: 'Emitida formalmente', bg: 'bg-purple-50 text-purple-800 border-purple-300' };
      case 'sent_to_vendor':
        return { label: 'Enviada a Proveedor', bg: 'bg-indigo-50 text-indigo-800 border-indigo-300' };
      case 'in_execution':
        return { label: 'En Ejecución (con HES)', bg: 'bg-blue-50 text-blue-800 border-blue-300' };
      case 'completed':
        return { label: 'Concluida 100%', bg: 'bg-emerald-50 text-emerald-800 border-emerald-300' };
      case 'rejected':
        return { label: 'Rechazada', bg: 'bg-rose-50 text-rose-800 border-rose-300' };
      case 'cancelled':
        return { label: 'Cancelada', bg: 'bg-rose-50 text-rose-800 border-rose-300' };
      default:
        return { label: status, bg: 'bg-slate-100 text-slate-700 border-slate-300' };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Banner SAP MM - Diseño Compacto y Ergonómico (Ahorro >50% espacio) */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-3 sm:p-3.5 shadow-md border border-blue-900/50 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-400/30 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-4 h-4 text-blue-300" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                SAP MM
              </span>
              <h1 className="text-sm sm:text-base font-black tracking-tight text-white">
                Gestión de Compras, SOLPEDs y Órdenes
              </h1>
              <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
                • Posición Tipo 'D' (Servicios) • Imputación PEP 'P'
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={reloadData}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              title="Actualizar datos desde el repositorio"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-300" />
              <span>Actualizar Datos</span>
            </button>
          </div>
        </div>

        {/* Procurement KPI Ribbon - Indicadores Claros y con Tipografía Agrandada */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-2 border-t border-slate-800/80">
          <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl px-3 py-2 sm:px-3.5 sm:py-2.5 flex items-center justify-between gap-2 shadow-xs hover:border-slate-600 transition-colors">
            <span className="text-xs sm:text-[13px] font-semibold text-slate-200 leading-snug">
              Total solp
            </span>
            <span className="text-base sm:text-lg lg:text-xl font-bold text-white font-mono shrink-0">
              {solpeds.length}
            </span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl px-3 py-2 sm:px-3.5 sm:py-2.5 flex items-center justify-between gap-2 shadow-xs hover:border-slate-600 transition-colors">
            <span className="text-xs sm:text-[13px] font-semibold text-slate-200 leading-snug">
              Pendiente de liberar
            </span>
            <span className="text-base sm:text-lg lg:text-xl font-bold text-amber-400 font-mono shrink-0">
              {pendingReleaseCount}
            </span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl px-3 py-2 sm:px-3.5 sm:py-2.5 flex items-center justify-between gap-2 shadow-xs hover:border-slate-600 transition-colors">
            <span className="text-xs sm:text-[13px] font-semibold text-slate-200 leading-snug">
              Aprobadas por compra
            </span>
            <span className="text-base sm:text-lg lg:text-xl font-bold text-emerald-400 font-mono shrink-0">
              {approvedSolpedsCount}
            </span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl px-3 py-2 sm:px-3.5 sm:py-2.5 flex items-center justify-between gap-2 shadow-xs hover:border-slate-600 transition-colors">
            <span className="text-xs sm:text-[13px] font-semibold text-slate-200 leading-snug">
              Órdenes de compra
            </span>
            <span className="text-base sm:text-lg lg:text-xl font-bold text-purple-400 font-mono shrink-0">
              {activePosCount}
            </span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl px-3 py-2 sm:px-3.5 sm:py-2.5 flex items-center justify-between gap-2 col-span-2 sm:col-span-1 shadow-xs hover:border-slate-600 transition-colors">
            <span className="text-xs sm:text-[13px] font-semibold text-slate-200 leading-snug">
              Horas subcontratadas
            </span>
            <span className="text-base sm:text-lg lg:text-xl font-bold text-blue-400 font-mono shrink-0">
              {totalSubcontractedHours} hrs
            </span>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs font-medium shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessNotice(null)}
            className="text-emerald-600 hover:text-emerald-900 text-xs font-bold px-2 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tabs & Filters Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { setActiveTab('solpeds'); setStatusFilter('all'); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'solpeds'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Solicitudes de Pedido SOLPED ({solpeds.length})</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('pos'); setStatusFilter('all'); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'pos'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Órdenes de Compra OC ({purchaseOrders.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('flow')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'flow'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Flujo Documental SAP</span>
            </button>
          </div>

          {activeTab !== 'flow' && (
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar código, proveedor, rol..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none"
              >
                <option value="all">Todos los Estados</option>
                {activeTab === 'solpeds' ? (
                  <>
                    <option value="pending_approval">Pendiente Liberación</option>
                    <option value="approved">Liberada / Aprobada</option>
                    <option value="converted_to_po">Convertida en OC</option>
                    <option value="rejected">Rechazada</option>
                  </>
                ) : (
                  <>
                    <option value="pending_approval">Pendiente Autorización</option>
                    <option value="authorized">Autorizada (ME28/ME29N)</option>
                    <option value="issued">Emitida</option>
                    <option value="in_execution">En Ejecución</option>
                    <option value="completed">Completada</option>
                    <option value="rejected">Rechazada</option>
                  </>
                )}
              </select>
            </div>
          )}
        </div>

        {/* TAB 1: SOLPEDS TABLE (ME51N / ME53N / ME5A ALV GRID) */}
        {activeTab === 'solpeds' && (
          <div className="pt-2 space-y-3">
            {/* ALV Toolbar Ribbon */}
            <div className="bg-slate-100/90 border border-slate-200 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg border border-slate-300 shadow-2xs">
                  <TableIcon className="w-3.5 h-3.5 text-blue-700" />
                  <span className="font-bold text-slate-800 text-[11px]">Listado ALV de Posiciones de SOLPED (Transacción ME5A)</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {filteredSolpeds.length} posiciones
                </span>
                <span className="text-[11px] text-slate-500 hidden md:inline">
                  • Tipo Posición 'D' (Servicios) • Imputación 'P' (PEP)
                </span>
              </div>

              {/* Botones de Creación y Utilidades ALV */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Grupo de botones para crear nueva SOLPED (ME51N) */}
                <div className="flex items-center bg-blue-50/80 border border-blue-200 rounded-lg p-0.5 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => handleOpenCreateSolped('blank')}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs active:scale-98"
                    title="Crear nueva SOLPED en blanco desde cero (Transacción ME51N)"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Nueva SOLPED</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenCreateSolped('reference')}
                    className="px-2 py-1 bg-white hover:bg-blue-50 text-blue-700 hover:text-blue-900 rounded-md text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 ml-0.5"
                    title="Crear nueva SOLPED tomando como referencia una SOLPED anterior existente (ME51N)"
                  >
                    <Copy className="w-3 h-3 text-blue-600" />
                    <span>Con Referencia</span>
                  </button>
                </div>

                {/* Toggle Totales ALV */}
                <button
                  type="button"
                  onClick={() => setShowAlvTotals(!showAlvTotals)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                    showAlvTotals 
                      ? 'bg-blue-600 text-white border-blue-700 shadow-2xs' 
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                  title="Mostrar / Ocultar Sumatoria ALV (Línea de Totales Σ)"
                >
                  <Sigma className="w-3.5 h-3.5" />
                  <span>Totales Σ ALV</span>
                </button>

                {/* Exportar ALV a CSV */}
                <button
                  type="button"
                  onClick={() => handleExportCsv(filteredSolpeds, 'listado_posiciones_solped_me5a.csv')}
                  className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                  title="Exportar listado ALV a formato CSV / Hoja de Cálculo"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Exportar ALV (.csv)</span>
                </button>
              </div>
            </div>

            {/* ALV Summary Totals Ribbon */}
            {showAlvTotals && filteredSolpeds.length > 0 && (
              <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in">
                <div className="flex items-center gap-2">
                  <Sigma className="w-4 h-4 text-blue-700" />
                  <span className="font-bold text-blue-900 text-xs">Sumatoria ALV Grid:</span>
                  <span className="text-slate-600 text-[11px]">
                    {alvTotals.count} {alvTotals.count === 1 ? 'posición listada' : 'posiciones listadas'}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase block font-medium">Total Horas Requeridas</span>
                    <span className="font-mono font-bold text-slate-900 text-xs">
                      {alvTotals.hours.toLocaleString()} HUR
                    </span>
                  </div>
                  <div className="h-6 w-px bg-blue-200" />
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase block font-medium">Importe Total Estimado</span>
                    <span className="font-mono font-bold text-blue-900 text-xs">
                      {(Object.entries(alvTotals.byCurrency) as [string, { amount: number; symbol: string }][]).map(([curr, d]) => (
                        <span key={curr} className="ml-2">
                          {formatCurrency(d.amount, curr, d.symbol)}
                        </span>
                      ))}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {filteredSolpeds.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto mb-3 text-blue-600">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">No hay Solicitudes de Pedido registradas</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Cuando agregues recursos marcados como <strong>"Externo"</strong> en el Staffing Plan de una cotización, 
                  se generará automáticamente su SOLPED de Servicio asociada.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px] select-none">
                    <tr>
                      <th className="p-2.5 text-center w-8">Sem.</th>
                      <th 
                        className="p-2.5 cursor-pointer hover:bg-slate-200/70 transition-colors"
                        onClick={() => {
                          if (sortField === 'solped') {
                            setSortAsc(!sortAsc);
                          } else {
                            setSortField('solped');
                            setSortAsc(true);
                          }
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <span>SOLPED SAP</span>
                          {sortField === 'solped' ? (
                            sortAsc ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-400" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="p-2.5 cursor-pointer hover:bg-slate-200/70 transition-colors"
                        onClick={() => {
                          if (sortField === 'position') {
                            setSortAsc(!sortAsc);
                          } else {
                            setSortField('position');
                            setSortAsc(true);
                          }
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <span>Pos.</span>
                          {sortField === 'position' ? (
                            sortAsc ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-400" />
                          )}
                        </div>
                      </th>
                      <th className="p-2.5">TP / TI</th>
                      <th className="p-2.5">Cotización & Proyecto</th>
                      <th className="p-2.5">Perfil / Servicio Externo</th>
                      <th 
                        className="p-2.5 cursor-pointer hover:bg-slate-200/70 transition-colors"
                        onClick={() => {
                          if (sortField === 'supplier') {
                            setSortAsc(!sortAsc);
                          } else {
                            setSortField('supplier');
                            setSortAsc(true);
                          }
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <span>Proveedor Sugerido / RUT</span>
                          {sortField === 'supplier' ? (
                            sortAsc ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-400" />
                          )}
                        </div>
                      </th>
                      <th className="p-2.5">Imputación PEP / CeCo</th>
                      <th 
                        className="p-2.5 text-right cursor-pointer hover:bg-slate-200/70 transition-colors"
                        onClick={() => {
                          if (sortField === 'hours') {
                            setSortAsc(!sortAsc);
                          } else {
                            setSortField('hours');
                            setSortAsc(true);
                          }
                        }}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <span>Horas & Tarifa</span>
                          {sortField === 'hours' ? (
                            sortAsc ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-400" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="p-2.5 text-right cursor-pointer hover:bg-slate-200/70 transition-colors"
                        onClick={() => {
                          if (sortField === 'amount') {
                            setSortAsc(!sortAsc);
                          } else {
                            setSortField('amount');
                            setSortAsc(true);
                          }
                        }}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <span>Monto Estimado</span>
                          {sortField === 'amount' ? (
                            sortAsc ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-400" />
                          )}
                        </div>
                      </th>
                      <th className="p-2.5 text-center">Estado SAP</th>
                      <th className="p-2.5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {filteredSolpeds.map(solped => {
                      const badge = getSolpedStatusBadge(solped.status);
                      // Semáforo color
                      const trafficLightColor = 
                        solped.status === 'converted_to_po' || solped.status === 'approved'
                          ? 'bg-emerald-500 shadow-xs'
                          : solped.status === 'pending_approval'
                          ? 'bg-amber-400 shadow-xs'
                          : solped.status === 'rejected'
                          ? 'bg-rose-500'
                          : 'bg-slate-300';

                      return (
                        <tr key={solped.id} className="hover:bg-blue-50/40 transition-colors">
                          <td className="p-2.5 text-center">
                            <span 
                              className={`inline-block w-2.5 h-2.5 rounded-full ${trafficLightColor}`} 
                              title={`Semáforo SAP: ${badge.label}`}
                            />
                          </td>

                          <td className="p-2.5">
                            <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[11px]">
                              {solped.solpedNumber}
                            </span>
                          </td>

                          <td className="p-2.5 font-mono text-[11px] font-bold text-slate-700">
                            {String(solped.positionNumber).padStart(5, '0')}
                          </td>

                          <td className="p-2.5 font-mono text-[10px] text-slate-600">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200" title="Tipo Posición 'D' = Servicio">
                              {solped.itemCategory}
                            </span>
                            <span className="ml-1 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200" title="Tipo Imputación 'P' = Proyecto / PEP">
                              {solped.accountAssignmentCategory}
                            </span>
                          </td>

                          <td className="p-2.5">
                            <div className="font-semibold text-slate-900 line-clamp-1">{solped.clientCompanyName}</div>
                            <div className="text-[11px] text-slate-600 line-clamp-1">{solped.projectTitle}</div>
                            <span className="font-mono text-[10px] text-slate-400 block">{solped.quotationCode}</span>
                          </td>

                          <td className="p-2.5">
                            <div className="font-medium text-slate-800">{solped.roleTitle}</div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">
                                {solped.moduleCode}
                              </span>
                              <span className="text-[10px] text-slate-500">{solped.seniority}</span>
                            </div>
                          </td>

                          <td className="p-2.5">
                            <div className="font-medium text-slate-800 flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="line-clamp-1">{solped.supplierName}</span>
                            </div>
                            {solped.supplierTaxId && (
                              <span className="text-[10px] font-mono text-slate-400 block">{solped.supplierTaxId}</span>
                            )}
                          </td>

                          <td className="p-2.5 font-mono text-[11px]">
                            <span className="text-blue-700 font-bold">{solped.pepElement}</span>
                            {solped.costCenter && (
                              <span className="text-slate-400 block text-[10px]">{solped.costCenter}</span>
                            )}
                          </td>

                          <td className="p-2.5 text-right">
                            <span className="font-bold text-slate-900 block">{solped.hours} {solped.unit}</span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              @ {formatCurrency(solped.hourlyRate, solped.currency, solped.currencySymbol)}
                            </span>
                          </td>

                          <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                            {formatCurrency(solped.totalAmount, solped.currency, solped.currencySymbol)}
                          </td>

                          <td className="p-2.5 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                              {badge.label}
                            </span>
                          </td>

                          <td className="p-2.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* SOLPED con OC generada -> Solo lectura / ver OC */}
                              {(solped.status === 'converted_to_po' || solped.convertedPoId) ? (
                                <>
                                  {solped.convertedPoNumber && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveTab('pos');
                                        setSearchQuery(solped.convertedPoNumber || '');
                                      }}
                                      className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                                    >
                                      <FileCheck2 className="w-3.5 h-3.5" />
                                      <span>Ver OC #{solped.convertedPoNumber}</span>
                                    </button>
                                  )}
                                  <span 
                                    className="px-2 py-1 rounded text-[10px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 flex items-center gap-1"
                                    title="SOLPED vinculada a Orden de Compra. Edición y eliminación bloqueadas según norma SAP."
                                  >
                                    <Lock className="w-3 h-3 text-slate-400" />
                                    <span>OC Emitida</span>
                                  </span>
                                </>
                              ) : (
                                /* SOLPED sin OC -> Se puede Autorizar, Rechazar, Crear OC, Editar y Borrar */
                                <>
                                  {/* Autorizar (ME54N) */}
                                  {solped.status !== 'approved' && (
                                    <button
                                      type="button"
                                      onClick={() => handleAuthorizeSolped(solped)}
                                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                                      title="Autorizar / Liberar SOLPED (ME54N)"
                                    >
                                      <ShieldCheck className="w-3.5 h-3.5" />
                                      <span>Autorizar</span>
                                    </button>
                                  )}

                                  {/* Rechazar SOLPED */}
                                  {solped.status !== 'rejected' && (
                                    <button
                                      type="button"
                                      onClick={() => handleRejectSolped(solped)}
                                      className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                                      title="Rechazar Solicitud de Pedido"
                                    >
                                      <Ban className="w-3.5 h-3.5" />
                                      <span>Rechazar</span>
                                    </button>
                                  )}

                                  {/* Transformar en OC (ME21N) */}
                                  {solped.status === 'approved' && (
                                    <button
                                      type="button"
                                      onClick={() => handleOpenConvert(solped)}
                                      className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                                      title="Transformar en Pedido / Orden de Compra (ME21N)"
                                    >
                                      <ArrowRight className="w-3.5 h-3.5" />
                                      <span>Crear OC</span>
                                    </button>
                                  )}

                                  {/* Editar SOLPED (ME52N) */}
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditSolped(solped)}
                                    className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                    title="Modificar SOLPED & Posiciones (Transacción ME52N)"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Borrar SOLPED */}
                                  <button
                                    type="button"
                                    onClick={() => setSolpedToDelete(solped)}
                                    className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                    title="Eliminar SOLPED (sin Orden de Compra)"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}

                              {/* Ficha técnica ME53N */}
                              <button
                                type="button"
                                onClick={() => setSelectedSolpedForDetail(solped)}
                                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                title="Ver Ficha Técnica SAP ME53N y Listado de Posiciones ALV"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {/* ALV Table Totals Footer */}
                  <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300 text-slate-800">
                    <tr>
                      <td colSpan={8} className="p-2.5 text-right font-mono text-xs">
                        LÍNEA DE TOTALES Σ ALV ({filteredSolpeds.length} Posiciones):
                      </td>
                      <td className="p-2.5 text-right font-mono text-xs text-slate-900">
                        {alvTotals.hours.toLocaleString()} HUR
                      </td>
                      <td className="p-2.5 text-right font-mono text-xs text-blue-900">
                        {(Object.entries(alvTotals.byCurrency) as [string, { amount: number; symbol: string }][]).map(([curr, d]) => (
                          <span key={curr} className="block">
                            {formatCurrency(d.amount, curr, d.symbol)}
                          </span>
                        ))}
                      </td>
                      <td colSpan={2} />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PURCHASE ORDERS TABLE (ME21N / ME23N) */}
        {activeTab === 'pos' && (
          <div className="pt-4">
            {filteredPos.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-12 h-12 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center mx-auto mb-3 text-purple-600">
                  <FileCheck2 className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">No hay Órdenes de Compra emitidas</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Convierte una SOLPED liberada en la pestaña anterior para generar el Pedido / Orden de Compra oficial de servicio (ME21N).
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">N° Pedido SAP (OC)</th>
                      <th className="p-3">SOLPED Base</th>
                      <th className="p-3">Proveedor Adjudicado</th>
                      <th className="p-3">Servicio & Proyecto</th>
                      <th className="p-3 text-right">Horas & Avance (HES)</th>
                      <th className="p-3 text-right">Importe Total</th>
                      <th className="p-3 text-center">Estado</th>
                      <th className="p-3 text-right">Gestión</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {filteredPos.map(po => {
                      const badge = getPoStatusBadge(po.status);
                      const deliveredHours = po.serviceEntrySheets?.reduce((sum, h) => sum + h.hoursDelivered, 0) || 0;
                      const progressPct = Math.min(100, Math.round((deliveredHours / po.hoursContracted) * 100));

                      return (
                        <tr key={po.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3">
                            <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 text-[11px]">
                              {po.poNumber}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              Doc. {po.documentType} • {po.issueDate}
                            </span>
                          </td>

                          <td className="p-3">
                            <span className="font-mono text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-bold">
                              {po.solpedNumber}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                              PEP: {po.pepElement}
                            </span>
                          </td>

                          <td className="p-3">
                            <div className="font-semibold text-slate-900">{po.supplierName}</div>
                            <div className="text-[10px] font-mono text-slate-500">{po.supplierTaxId}</div>
                            <div className="text-[10px] text-slate-400">{po.paymentTerms}</div>
                          </td>

                          <td className="p-3">
                            <div className="font-medium text-slate-800">{po.roleTitle}</div>
                            <div className="text-[11px] text-slate-500 line-clamp-1">{po.clientCompanyName} • {po.quotationCode}</div>
                          </td>

                          <td className="p-3 text-right">
                            <div className="font-bold text-slate-900">{deliveredHours} / {po.hoursContracted} hrs</div>
                            <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden mt-1 ml-auto">
                              <div 
                                className="bg-emerald-500 h-full rounded-full transition-all"
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-0.5">{progressPct}% certificado</span>
                          </td>

                          <td className="p-3 text-right">
                            <span className="font-mono font-bold text-purple-900 text-xs block">
                              {formatCurrency(po.totalAmount, po.currency, po.currencySymbol)}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Neto: {formatCurrency(po.netAmount, po.currency, po.currencySymbol)}
                            </span>
                          </td>

                          <td className="p-3 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                              {badge.label}
                            </span>
                          </td>

                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Autorizar Orden de Compra (ME28 / ME29N) */}
                              {po.status !== 'authorized' && (
                                <button
                                  type="button"
                                  onClick={() => handleAuthorizePo(po)}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                                  title="Autorizar / Liberar Orden de Compra (Transacción SAP ME28 / ME29N)"
                                >
                                  <CheckCheck className="w-3.5 h-3.5" />
                                  <span>Autorizar</span>
                                </button>
                              )}

                              {/* Rechazar Orden de Compra */}
                              {po.status !== 'rejected' && (
                                <button
                                  type="button"
                                  onClick={() => handleRejectPo(po)}
                                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                                  title="Rechazar Orden de Compra"
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                  <span>Rechazar</span>
                                </button>
                              )}

                              {/* Editar Orden de Compra (ME22N) */}
                              <button
                                type="button"
                                onClick={() => handleOpenEditPo(po)}
                                className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                title="Modificar Orden de Compra (Transacción ME22N)"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Registrar Hoja de Entrada de Servicios (ML81N) */}
                              <button
                                type="button"
                                onClick={() => {
                                  setPoForHes(po);
                                  setHesHours(Math.max(10, po.hoursContracted - deliveredHours));
                                  setHesConsultantName(po.supplierName);
                                }}
                                className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                                title="Registrar Hoja de Entrada de Servicios (Transacción ML81N)"
                              >
                                <Plus className="w-3.5 h-3.5 text-blue-600" />
                                <span>HES (ML81N)</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setPoForPrint(po)}
                                className="p-1.5 text-slate-400 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                                title="Ver / Imprimir Orden de Compra"
                              >
                                <Printer className="w-4 h-4" />
                              </button>

                              {/* Anular / Eliminar Orden de Compra */}
                              <button
                                type="button"
                                onClick={() => setPoToDelete(po)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Anular / Eliminar Orden de Compra y liberar posiciones en SOLPED"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DOCUMENT FLOW SAP (Trazabilidad Extremo a Extremo) */}
        {activeTab === 'flow' && (
          <div className="pt-4 space-y-6">
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Arquitectura de Subcontratación de Servicios en SAP
              </h3>
              <p className="text-xs text-slate-600 mb-4 max-w-3xl">
                El flujo de compra de servicios enlaza el mundo Comercial (SD) con la Gestión de Materiales & Servicios (MM).
                Cada recurso externo cotizado da origen a su documento de compra con imputación al proyecto o centro de costes:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
                <div className="bg-white p-3.5 rounded-xl border border-blue-200 shadow-2xs">
                  <div className="flex items-center gap-2 text-blue-700 font-bold mb-1">
                    <FileText className="w-4 h-4" />
                    <span>1. Cotización (SD)</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Definición de propuesta comercial, alcance, horas estimadas y staffing de consultores.
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-indigo-200 shadow-2xs">
                  <div className="flex items-center gap-2 text-indigo-700 font-bold mb-1">
                    <Briefcase className="w-4 h-4" />
                    <span>2. Staffing Externo</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Señalización de recurso externo / subcontratista en lugar de nómina propia de la empresa.
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-blue-200 shadow-2xs">
                  <div className="flex items-center gap-2 text-blue-700 font-bold mb-1">
                    <ClipboardList className="w-4 h-4" />
                    <span>3. SOLPED (ME51N)</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Solicitud de Pedido de Servicio con posición tipo 'D' e imputación a Elemento PEP 'P'.
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-purple-200 shadow-2xs">
                  <div className="flex items-center gap-2 text-purple-700 font-bold mb-1">
                    <FileCheck2 className="w-4 h-4" />
                    <span>4. Pedido / OC (ME21N)</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Orden de Compra oficial adjudicada al proveedor con condiciones de pago y montos pactados.
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-2xs">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>5. HES (ML81N)</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Hojas de Entrada de Servicios certificando las horas trabajadas para habilitar la factura (MIRO).
                  </p>
                </div>
              </div>
            </div>

            {/* Matrix of Current Live Relations */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <div className="bg-slate-100 p-3.5 border-b border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Relaciones Activas entre Cotizaciones, SOLPEDs y Órdenes de Compra</span>
                <span className="text-[11px] text-slate-500 font-normal">{solpeds.length} registros conectados</span>
              </div>

              <div className="divide-y divide-slate-200 text-xs">
                {solpeds.map(solped => {
                  const linkedPo = purchaseOrders.find(p => p.solpedId === solped.id || p.solpedNumber === solped.solpedNumber);
                  return (
                    <div key={solped.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded">
                          {solped.quotationCode}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                        <div>
                          <span className="font-bold text-blue-700">SOLPED {solped.solpedNumber}</span>
                          <span className="text-slate-500 text-[11px] block">{solped.roleTitle} ({solped.hours} hrs)</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                        <div>
                          {linkedPo ? (
                            <div>
                              <span className="font-bold text-purple-700">OC {linkedPo.poNumber}</span>
                              <span className="text-emerald-700 text-[11px] block">
                                {linkedPo.serviceEntrySheets?.length || 0} HES certificadas
                              </span>
                            </div>
                          ) : (
                            <span className="text-amber-700 font-medium italic">Pendiente de Orden de Compra</span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-900 block">
                          {formatCurrency(solped.totalAmount, solped.currency, solped.currencySymbol)}
                        </span>
                        <span className="text-[11px] text-slate-400">{solped.supplierName}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 0: CREAR SOLPED (ME51N) - EN BLANCO O CON REFERENCIA */}
      {isCreatingSolped && (() => {
        const totalHrs = newSolpedPositions.reduce((acc, p) => acc + (Number(p.hours) || 0), 0);
        const totalAmt = newSolpedPositions.reduce((acc, p) => acc + (Number(p.hours) || 0) * (Number(p.hourlyRate) || 0), 0);
        const uniqueSolpedsList: ServicePurchaseRequisition[] = Array.from(new Map<string, ServicePurchaseRequisition>(solpeds.map(s => [s.solpedNumber, s])).values());

        return (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
              {/* Modal Header */}
              <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center shrink-0">
                    <FilePlus className="w-5 h-5 text-blue-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 px-1.5 py-0.5 rounded">
                        SAP ME51N
                      </span>
                      <h2 className="text-sm sm:text-base font-bold text-white">
                        Crear Solicitud de Pedido de Servicios (SOLPED)
                      </h2>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Alta oficial de requerimiento de compras con imputación PEP 'P' y posiciones tipo 'D' (Servicios Externos)
                    </p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsCreatingSolped(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body: Scrollable */}
              <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
                {/* Modalidad de Creación (Selector En Blanco vs Con Referencia) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-bold text-slate-700 text-xs">Modalidad de Creación:</span>
                    <div className="inline-flex p-0.5 bg-slate-200 rounded-lg border border-slate-300">
                      <button
                        type="button"
                        onClick={() => {
                          setCreateMode('blank');
                        }}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                          createMode === 'blank'
                            ? 'bg-white text-blue-700 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>En Blanco (Desde Cero)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCreateMode('reference');
                          if (!selectedReferenceSolpedNum && uniqueSolpedsList.length > 0) {
                            applyReferenceSolped(uniqueSolpedsList[0].solpedNumber);
                          }
                        }}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                          createMode === 'reference'
                            ? 'bg-white text-blue-700 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Copy className="w-3.5 h-3.5 text-blue-600" />
                        <span>Con Referencia a SOLPED Anterior</span>
                      </button>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 font-mono">
                    Tipo Doc: <span className="font-bold text-slate-700">{newSolpedDocType}</span> • Posición: <span className="font-bold text-blue-700">D (Servicios)</span>
                  </div>
                </div>

                {/* Si es con Referencia: Selector de SOLPED Existente */}
                {createMode === 'reference' && (
                  <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-bold text-blue-950">
                        Seleccionar SOLPED Modelo de Referencia (ME53N):
                      </label>
                      <span className="text-[10px] text-blue-700 font-medium">
                        {uniqueSolpedsList.length} SOLPEDs disponibles para clonar
                      </span>
                    </div>
                    <select
                      value={selectedReferenceSolpedNum}
                      onChange={(e) => applyReferenceSolped(e.target.value)}
                      className="w-full bg-white border border-blue-300 rounded-lg p-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    >
                      {uniqueSolpedsList.map(sp => {
                        const count = solpeds.filter(s => s.solpedNumber === sp.solpedNumber).length;
                        return (
                          <option key={sp.solpedNumber} value={sp.solpedNumber}>
                            SOLPED #{sp.solpedNumber} — {sp.supplierName} • {sp.clientCompanyName} ({sp.projectTitle || sp.quotationCode}) [{count} {count === 1 ? 'posición' : 'posiciones'}]
                          </option>
                        );
                      })}
                    </select>
                    <div className="text-[11px] text-blue-800 flex items-center gap-1.5 bg-blue-100/60 p-2 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>
                        Datos clonados desde <strong>SOLPED #{selectedReferenceSolpedNum}</strong>. Se generará un nuevo correlativo oficial SAP (ME51N) conservando o adaptando roles, horas y tarifas.
                      </span>
                    </div>
                  </div>
                )}

                {/* Tarjeta de Datos de Cabecera (Header Data) */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-700" />
                      <span className="font-bold text-slate-800 text-xs">Datos de Cabecera (Header Data)</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Imputación PEP 'P' • Categoría 'D'</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[10px] font-bold text-slate-600">
                          Proveedor / Subcontratista *
                        </label>
                        <select
                          className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded px-1.5 py-0.5 max-w-[140px] truncate cursor-pointer"
                          value=""
                          onChange={e => {
                            const val = e.target.value;
                            if (!val) return;
                            const storedSupps = getStoredSuppliers();
                            const found = storedSupps.find(s => s.id === val);
                            if (found) {
                              if (found.isBlocked) {
                                alert(`Atención SAP XK05: El proveedor "${found.legalName}" se encuentra BLOQUEADO en el Maestro de Proveedores por el motivo:\n\n"${found.blockingReason || 'Bloqueo administrativo'}"\n\nNo se recomienda cursar SOLPEDs ni pedidos a proveedores bloqueados.`);
                              }
                              setNewSolpedSupplier(found.legalName);
                              setNewSolpedSupplierTaxId(found.taxId);
                              if (found.billingCurrency) {
                                setNewSolpedCurrency(found.billingCurrency);
                              }
                            }
                            e.target.value = '';
                          }}
                        >
                          <option value="">▼ Desde Maestro...</option>
                          {getStoredSuppliers().map(s => (
                            <option key={s.id} value={s.id}>
                              {s.isBlocked ? '⛔ [BLOQUEADO] ' : ''}{s.legalName} ({s.taxId}) - {s.billingCurrency}
                            </option>
                          ))}
                        </select>
                      </div>
                      <input
                        type="text"
                        value={newSolpedSupplier}
                        onChange={(e) => setNewSolpedSupplier(e.target.value)}
                        placeholder="Ej. Partner Subcontratista SAP"
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">
                        RUT / Tax ID Proveedor
                      </label>
                      <input
                        type="text"
                        value={newSolpedSupplierTaxId}
                        onChange={(e) => setNewSolpedSupplierTaxId(e.target.value)}
                        placeholder="Ej. 76.543.210-K"
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">
                        Cotización Comercial Asociada
                      </label>
                      {quotations && quotations.length > 0 ? (
                        <select
                          value={newSolpedQuotationId}
                          onChange={(e) => handleSelectQuotationForSolped(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                        >
                          <option value="">-- Sin cotización vinculada --</option>
                          {quotations.map(q => (
                            <option key={q.id} value={q.id}>
                              {q.quotationCode || q.id} - {q.clientCompanyName}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={newSolpedQuotationCode}
                          onChange={(e) => setNewSolpedQuotationCode(e.target.value)}
                          placeholder="COT-SAP-2026-001"
                          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">
                        Moneda de la SOLPED
                      </label>
                      <select
                        value={newSolpedCurrency}
                        onChange={(e) => {
                          const curr = e.target.value as SupportedCurrency;
                          setNewSolpedCurrency(curr);
                          const symbol = curr === 'UF' ? 'UF' : '$';
                          setNewSolpedPositions(prev => prev.map(p => ({
                            ...p,
                            currency: curr,
                            currencySymbol: symbol
                          })));
                        }}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      >
                        <option value="UF">UF (Unidad de Fomento)</option>
                        <option value="CLP">CLP (Peso Chileno)</option>
                        <option value="USD">USD (Dólar Estadounidense)</option>
                        <option value="EUR">EUR (Euro)</option>
                        <option value="MXN">MXN (Peso Mexicano)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">
                        Cliente / Razón Social Mandante
                      </label>
                      <input
                        type="text"
                        value={newSolpedClientName}
                        onChange={(e) => setNewSolpedClientName(e.target.value)}
                        placeholder="Ej. Inversiones Twin Ducks Capital"
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">
                        Proyecto SAP / Título Requerimiento
                      </label>
                      <input
                        type="text"
                        value={newSolpedProjectTitle}
                        onChange={(e) => setNewSolpedProjectTitle(e.target.value)}
                        placeholder="Ej. Consultoría y Servicios Especializados SAP"
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">
                        Elemento PEP (Imputación 'P') *
                      </label>
                      <input
                        type="text"
                        value={newSolpedPep}
                        onChange={(e) => setNewSolpedPep(e.target.value)}
                        placeholder="PEP-SAP-2026-001.1"
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">
                        Centro de Coste (CeCo)
                      </label>
                      <input
                        type="text"
                        value={newSolpedCeco}
                        onChange={(e) => setNewSolpedCeco(e.target.value)}
                        placeholder="CC-10100"
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Listado ALV de Posiciones de Servicio de la SOLPED */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs space-y-0">
                  <div className="bg-slate-100/90 px-3.5 py-2.5 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TableIcon className="w-4 h-4 text-blue-700" />
                      <span className="font-bold text-slate-800 text-xs">
                        Posiciones de Servicio de la SOLPED (Tipo 'D' - Servicios)
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {newSolpedPositions.length} {newSolpedPositions.length === 1 ? 'posición' : 'posiciones'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddNewSolpedPosition}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Agregar Posición</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold text-[11px]">
                        <tr>
                          <th className="p-2.5 text-center w-12">Pos.</th>
                          <th className="p-2.5 min-w-[200px]">Rol / Perfil de Servicio</th>
                          <th className="p-2.5 min-w-[130px]">Seniority</th>
                          <th className="p-2.5 text-right w-24">Horas</th>
                          <th className="p-2.5 text-right w-28">Tarifa / Hr</th>
                          <th className="p-2.5 text-right min-w-[120px]">Subtotal</th>
                          <th className="p-2.5 text-center w-12">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {newSolpedPositions.map((pos, idx) => {
                          const posNum = String((idx + 1) * 10).padStart(5, '0');
                          const subtotal = (Number(pos.hours) || 0) * (Number(pos.hourlyRate) || 0);

                          return (
                            <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                              <td className="p-2.5 text-center font-mono font-bold text-slate-500">
                                {posNum}
                              </td>
                              <td className="p-2.5">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="text"
                                      value={pos.roleTitle}
                                      onChange={(e) => handleUpdateSolpedPosition(idx, 'roleTitle', e.target.value)}
                                      placeholder="Nombre o Perfil de Servicio"
                                      className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-medium text-slate-800 focus:ring-1 focus:ring-blue-500"
                                    />
                                    <select
                                      onChange={(e) => handleSelectPresetForPosition(idx, e.target.value)}
                                      defaultValue=""
                                      className="bg-slate-50 border border-slate-300 rounded px-1.5 py-1 text-[11px] text-slate-600 focus:outline-hidden"
                                      title="Seleccionar preset SAP"
                                    >
                                      <option value="" disabled>Presets SAP...</option>
                                      {SAP_SPECIALTY_PRESETS.map(preset => (
                                        <option key={preset.id} value={preset.id}>
                                          {preset.label} ({preset.category})
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono">
                                    Imputación PEP: {pos.pepElement || `${newSolpedPep || 'PEP-SAP'}.${idx + 1}`}
                                  </div>
                                </div>
                              </td>
                              <td className="p-2.5">
                                <select
                                  value={pos.seniority}
                                  onChange={(e) => handleUpdateSolpedPosition(idx, 'seniority', e.target.value as SeniorityLevel)}
                                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500"
                                >
                                  <option value="Junior">Junior</option>
                                  <option value="Semi-Senior">Semi-Senior</option>
                                  <option value="Senior">Senior</option>
                                  <option value="Lead / Arquitecto">Lead / Arquitecto</option>
                                </select>
                              </td>
                              <td className="p-2.5 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={pos.hours || ''}
                                    onChange={(e) => handleUpdateSolpedPosition(idx, 'hours', Number(e.target.value))}
                                    className="w-16 bg-white border border-slate-300 rounded px-1.5 py-1 text-xs text-right font-bold text-slate-800 focus:ring-1 focus:ring-blue-500"
                                  />
                                  <span className="text-[10px] text-slate-400 font-mono">HUR</span>
                                </div>
                              </td>
                              <td className="p-2.5 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <span className="text-[10px] text-slate-400 font-mono">{newSolpedCurrency}</span>
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={pos.hourlyRate || ''}
                                    onChange={(e) => handleUpdateSolpedPosition(idx, 'hourlyRate', Number(e.target.value))}
                                    className="w-20 bg-white border border-slate-300 rounded px-1.5 py-1 text-xs text-right font-mono font-bold text-slate-800 focus:ring-1 focus:ring-blue-500"
                                  />
                                </div>
                              </td>
                              <td className="p-2.5 text-right font-mono font-bold text-blue-900">
                                {formatCurrency(subtotal, newSolpedCurrency, newSolpedCurrency === 'UF' ? 'UF' : '$')}
                              </td>
                              <td className="p-2.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSolpedPosition(idx)}
                                  disabled={newSolpedPositions.length <= 1}
                                  className={`p-1 rounded transition-colors cursor-pointer ${
                                    newSolpedPositions.length <= 1
                                      ? 'text-slate-300 cursor-not-allowed'
                                      : 'text-rose-500 hover:text-rose-700 hover:bg-rose-50'
                                  }`}
                                  title="Eliminar posición"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-slate-50 border-t border-slate-200 font-bold text-xs">
                        <tr>
                          <td colSpan={3} className="p-2.5 text-right text-slate-700">
                            Totales Estimados SOLPED (ME51N):
                          </td>
                          <td className="p-2.5 text-right font-bold text-slate-900">
                            {totalHrs} HUR
                          </td>
                          <td className="p-2.5"></td>
                          <td className="p-2.5 text-right font-mono text-sm text-blue-700 font-black">
                            {formatCurrency(totalAmt, newSolpedCurrency, newSolpedCurrency === 'UF' ? 'UF' : '$')}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Observaciones y Notas */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">
                    Observaciones y Especificaciones Técnicas del Servicio (ME51N)
                  </label>
                  <textarea
                    rows={2}
                    value={newSolpedNotes}
                    onChange={(e) => setNewSolpedNotes(e.target.value)}
                    placeholder="Indique detalles adicionales sobre el requerimiento de consultoría, condiciones de entrega o alcances técnicos..."
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between shrink-0">
                <div className="text-[11px] text-slate-500">
                  Al grabar, la SOLPED pasará a estado <strong>'Pendiente de Liberación (ME54N)'</strong>.
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingSolped(false)}
                    className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNewSolped}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md active:scale-98"
                  >
                    <Check className="w-4 h-4" />
                    <span>Grabar SOLPED Oficial (ME51N)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL 1: CONVERT SOLPED TO PURCHASE ORDER (ME21N) - ALV MULTI-POSITION WORKSPACE (90% SCREEN) */}
      {solpedToConvert && (() => {
        const convertPositions = getSolpedPositions(solpedToConvert.solpedNumber);
        const positionsList = convertPositions.length > 0 ? convertPositions : [solpedToConvert];
        const totalHrs = positionsList.reduce((sum, p) => sum + (Number(p.hours) || 0), 0);
        const totalNet = positionsList.reduce((sum, p) => sum + (Number(p.totalAmount) || 0), 0);
        const taxPercentage = 19;
        const taxAmount = Math.round((totalNet * taxPercentage) / 100);
        const totalGross = totalNet + taxAmount;

        return (
          <div 
            className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-hidden animate-in fade-in"
            onClick={() => setSolpedToConvert(null)}
          >
            <div 
              className="bg-white rounded-2xl w-[90vw] max-w-[90vw] h-[90vh] max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 p-5 space-y-3 my-auto overflow-hidden animate-in zoom-in-95"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span>Emitir Orden de Compra de Servicio (ME21N)</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-bold">
                        {positionsList.length} {positionsList.length === 1 ? 'Posición ALV' : 'Posiciones ALV'}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Con referencia a Solicitud de Pedido SOLPED #{solpedToConvert.solpedNumber} • Cotización: {solpedToConvert.quotationCode} • Cliente: {solpedToConvert.clientCompanyName}
                    </p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setSolpedToConvert(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Container (No global scroll, flex column taking available height) */}
              <form onSubmit={handleConfirmConvert} className="flex flex-col flex-1 min-h-0 overflow-hidden space-y-3 text-xs">
                
                {/* SECCIÓN SUPERIOR: DATOS DE CABECERA (Fija, sin scroll) */}
                <div className="bg-slate-50/90 border border-slate-200 rounded-xl p-3 space-y-2.5 shrink-0 shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                    <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5 uppercase tracking-wider">
                      <Building2 className="w-3.5 h-3.5 text-purple-700" />
                      Datos de Cabecera del Pedido de Compras (Header Data)
                    </span>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-600">
                      <span className="bg-white border border-slate-200 px-2 py-0.5 rounded font-bold text-purple-800">
                        Clase Doc: NB (Estándar)
                      </span>
                      <span className="bg-white border border-slate-200 px-2 py-0.5 rounded font-bold text-slate-700">
                        Org. Compras: 1000
                      </span>
                      <span className="bg-white border border-slate-200 px-2 py-0.5 rounded font-bold text-slate-700">
                        Grupo Compras: C01
                      </span>
                    </div>
                  </div>

                  {/* Inputs de Cabecera en Grid de 4 columnas */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                        Razón Social Proveedor / Contratista <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={convertSupplierName}
                        onChange={e => setConvertSupplierName(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:border-purple-500 focus:outline-none text-xs shadow-2xs"
                        placeholder="Nombre del proveedor..."
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1 text-[11px]">RUT / Tax ID Proveedor</label>
                      <input
                        type="text"
                        value={convertSupplierTaxId}
                        onChange={e => setConvertSupplierTaxId(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-mono focus:border-purple-500 focus:outline-none text-xs shadow-2xs"
                        placeholder="Ej: 76.884.210-9"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1 text-[11px]">Email Proveedor / Contacto</label>
                      <input
                        type="email"
                        value={convertSupplierEmail}
                        onChange={e => setConvertSupplierEmail(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 focus:border-purple-500 focus:outline-none text-xs shadow-2xs"
                        placeholder="contacto@proveedor.com"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1 text-[11px]">Condiciones de Pago</label>
                      <input
                        type="text"
                        value={convertPaymentTerms}
                        onChange={e => setConvertPaymentTerms(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 focus:border-purple-500 focus:outline-none text-xs shadow-2xs"
                        placeholder="Ej: 30 días contra HES aprobada"
                      />
                    </div>
                  </div>

                  {/* Observaciones y Moneda / Proyecto en Grid compacta */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 pt-0.5">
                    <div className="lg:col-span-8">
                      <label className="font-bold text-slate-700 block mb-1 text-[11px]">Observaciones / Textos de Cabecera del Comprador</label>
                      <input
                        type="text"
                        value={convertBuyerNotes}
                        onChange={e => setConvertBuyerNotes(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 focus:border-purple-500 focus:outline-none text-xs shadow-2xs"
                        placeholder="Observaciones de licitación, condiciones técnicas o comerciales..."
                      />
                    </div>

                    <div className="lg:col-span-4 bg-white border border-slate-200 rounded-lg px-3 py-1.5 flex items-center justify-between gap-2 text-[10px]">
                      <div>
                        <span className="text-slate-400 block uppercase font-semibold text-[9px]">Proyecto</span>
                        <span className="font-bold text-slate-800 truncate max-w-[150px] block" title={solpedToConvert.projectTitle || solpedToConvert.quotationCode}>
                          {solpedToConvert.projectTitle || solpedToConvert.quotationCode}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block uppercase font-semibold text-[9px]">Moneda / Imputación</span>
                        <span className="font-mono font-bold text-purple-700">
                          {solpedToConvert.currency} ({solpedToConvert.currencySymbol}) • 'F'/'P'
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECCIÓN INFERIOR: POSICIONES EN ALV (ÚNICA ÁREA CON SCROLL) */}
                <div className="flex-1 min-h-0 flex flex-col space-y-2 overflow-hidden">
                  {/* ALV Toolbar (Fijo) */}
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-100/90 p-2 rounded-xl border border-slate-200 shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-purple-100 text-purple-700">
                        <TableIcon className="w-3.5 h-3.5" />
                      </div>
                      <h4 className="font-bold text-slate-800 text-xs">
                        Listado ALV de Posiciones de la SOLPED a Contratar
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        {positionsList.length} {positionsList.length === 1 ? 'posición' : 'posiciones'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Total: {totalHrs} hrs • {formatCurrency(totalNet, solpedToConvert.currency, solpedToConvert.currencySymbol)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleExportCsv(positionsList, `posiciones_contratacion_solped_${solpedToConvert.solpedNumber}.csv`)}
                        className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                        title="Exportar posiciones a CSV"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Exportar ALV (.csv)</span>
                      </button>
                    </div>
                  </div>

                  {/* ALV Table (Con scroll vertical y horizontal propio) */}
                  <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-2xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px] sticky top-0 z-10 shadow-xs">
                        <tr>
                          <th className="p-2.5 text-center w-8 bg-slate-100">Sem.</th>
                          <th className="p-2.5 bg-slate-100">Pos.</th>
                          <th className="p-2.5 bg-slate-100">TP / TI</th>
                          <th className="p-2.5 bg-slate-100">Texto Breve / Perfil Servicio</th>
                          <th className="p-2.5 bg-slate-100">Elemento PEP</th>
                          <th className="p-2.5 bg-slate-100">CeCo</th>
                          <th className="p-2.5 text-right bg-slate-100">Cantidad (Horas)</th>
                          <th className="p-2.5 text-right bg-slate-100">Precio / Hora</th>
                          <th className="p-2.5 text-right bg-slate-100">Valor Total Neto</th>
                          <th className="p-2.5 text-center bg-slate-100">Estado SOLPED</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {positionsList.map(pos => {
                          return (
                            <tr key={pos.id} className="hover:bg-purple-50/40 transition-colors">
                              <td className="p-2.5 text-center">
                                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" title="Lista para emisión de Orden de Compra" />
                              </td>
                              <td className="p-2.5 font-mono font-bold text-purple-700">
                                {String(pos.positionNumber).padStart(5, '0')}
                              </td>
                              <td className="p-2.5 font-mono text-[10px] text-slate-600">
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">{pos.itemCategory || 'F'}</span>
                                <span className="ml-1 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">{pos.accountAssignmentCategory || 'P'}</span>
                              </td>
                              <td className="p-2.5 font-medium text-slate-800">
                                <div className="font-bold text-slate-900">{pos.roleTitle}</div>
                                {pos.moduleCode && (
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {pos.moduleCode} • {pos.seniority}
                                  </span>
                                )}
                              </td>
                              <td className="p-2.5 font-mono text-[11px] text-slate-700">
                                {pos.pepElement || '-'}
                              </td>
                              <td className="p-2.5 font-mono text-[11px] text-slate-500">
                                {pos.costCenter || '-'}
                              </td>
                              <td className="p-2.5 text-right font-bold font-mono text-slate-800">
                                {pos.hours} {pos.unit || 'HUR'}
                              </td>
                              <td className="p-2.5 text-right font-mono text-slate-600">
                                {formatCurrency(pos.hourlyRate, pos.currency, pos.currencySymbol)}
                              </td>
                              <td className="p-2.5 text-right font-bold font-mono text-purple-900">
                                {formatCurrency(pos.totalAmount, pos.currency, pos.currencySymbol)}
                              </td>
                              <td className="p-2.5 text-center">
                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
                                  Aprobada
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      {/* ALV Totals Footer (Sticky at bottom of table) */}
                      <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300 text-slate-800 sticky bottom-0 z-10 shadow-2xs">
                        <tr>
                          <td colSpan={6} className="p-2.5 text-right font-mono text-xs bg-slate-100">
                            LÍNEA DE TOTALES Σ ALV ({positionsList.length} {positionsList.length === 1 ? 'Posición' : 'Posiciones'}):
                          </td>
                          <td className="p-2.5 text-right font-mono text-xs text-slate-900 bg-slate-100">
                            {totalHrs.toLocaleString()} HUR
                          </td>
                          <td className="p-2.5 bg-slate-100" />
                          <td className="p-2.5 text-right font-mono text-xs text-purple-900 bg-slate-100">
                            {formatCurrency(totalNet, solpedToConvert.currency, solpedToConvert.currencySymbol)}
                          </td>
                          <td className="p-2.5 bg-slate-100" />
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Consolidated Notice / Financial Totals (Fijo) */}
                  <div className="bg-purple-50/80 border border-purple-200 rounded-xl p-2.5 px-3 text-[11px] text-purple-900 flex flex-wrap items-center justify-between gap-2 shrink-0">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-purple-700 shrink-0" />
                      <span>
                        {positionsList.length > 1 
                          ? `Se emitirá 1 única Orden de Compra oficial consolidada para las ${positionsList.length} posiciones de esta SOLPED #${solpedToConvert.solpedNumber}.`
                          : `Se emitirá 1 Orden de Compra oficial para la posición de la SOLPED #${solpedToConvert.solpedNumber}.`}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 font-mono font-bold text-xs shrink-0">
                      <span className="text-slate-600">Neto: {formatCurrency(totalNet, solpedToConvert.currency, solpedToConvert.currencySymbol)}</span>
                      <span className="text-slate-400">|</span>
                      <span className="text-slate-600">IVA (19%): {formatCurrency(taxAmount, solpedToConvert.currency, solpedToConvert.currencySymbol)}</span>
                      <span className="text-slate-400">|</span>
                      <span className="text-purple-950 bg-purple-100 px-2 py-0.5 rounded-md">
                        Total: {formatCurrency(totalGross, solpedToConvert.currency, solpedToConvert.currencySymbol)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Modal Footer Controls (Fijo al fondo) */}
                <div className="flex items-center justify-between pt-2.5 border-t border-slate-200 shrink-0">
                  <div className="text-[11px] text-slate-500 font-mono hidden sm:block">
                    Transacción SAP: ME21N • Tipo de Documento: Pedido de Servicios
                  </div>
                  <div className="flex items-center gap-2.5 ml-auto">
                    <button
                      type="button"
                      onClick={() => setSolpedToConvert(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Emitir Pedido de Compra Oficial (ME21N)</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* MODAL 2: ADD SERVICE ENTRY SHEET (HES / ML81N) */}
      {poForHes && (
        <div 
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in"
          onClick={() => setPoForHes(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Hoja de Entrada de Servicios (ML81N)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Certificación de Horas y Aceptación sobre OC #{poForHes.poNumber}
                  </p>
                </div>
              </div>
              <button onClick={() => setPoForHes(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmHes} className="space-y-4 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Proveedor:</span>
                  <span className="font-bold text-slate-800">{poForHes.supplierName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Servicio:</span>
                  <span className="font-medium text-slate-700">{poForHes.roleTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tarifa por Hora:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatCurrency(poForHes.hourlyRate, poForHes.currency, poForHes.currencySymbol)}
                  </span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Horas a Certificar en esta Entrega</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={hesHours}
                  onChange={e => setHesHours(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 font-bold text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Monto a certificar: {formatCurrency(hesHours * poForHes.hourlyRate, poForHes.currency, poForHes.currencySymbol)}
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Descripción del Avance / Entregables</label>
                <textarea
                  rows={2}
                  required
                  value={hesDescription}
                  onChange={e => setHesDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Consultor que Ejecutó</label>
                  <input
                    type="text"
                    value={hesConsultantName}
                    onChange={e => setHesConsultantName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Aprobado / Aceptado Por</label>
                  <input
                    type="text"
                    value={hesApprover}
                    onChange={e => setHesApprover(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setPoForHes(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Aprobar y Registrar HES (ML81N)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW SOLPED DETAILS (ME53N) */}
      {selectedSolpedForDetail && (() => {
        const detailPositions = getSolpedPositions(selectedSolpedForDetail.solpedNumber);
        const detailTotalHours = detailPositions.reduce((acc, p) => acc + p.hours, 0);
        const detailTotalNet = detailPositions.reduce((acc, p) => acc + p.totalAmount, 0);

        return (
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in"
            onClick={() => setSelectedSolpedForDetail(null)}
          >
            <div 
              className="bg-white rounded-2xl w-[90vw] max-w-[90vw] max-h-[92vh] flex flex-col p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 space-y-4 overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span>Solicitud de Pedido SAP ME53N #{selectedSolpedForDetail.solpedNumber}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        {detailPositions.length} {detailPositions.length === 1 ? 'Posición' : 'Posiciones'}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Documento de Compras MM • Cotización: {selectedSolpedForDetail.quotationCode} • Cliente: {selectedSolpedForDetail.clientCompanyName}
                    </p>
                  </div>
                </div>
                <button onClick={() => setSelectedSolpedForDetail(null)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs overflow-y-auto pr-1 flex-1">
                {/* Header Information Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Clase Documento</span>
                    <span className="font-bold text-slate-900">{selectedSolpedForDetail.documentType} (Estándar)</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Tipo Posición</span>
                    <span className="font-bold text-slate-900">'{selectedSolpedForDetail.itemCategory}' (Servicios)</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Imputación</span>
                    <span className="font-bold text-slate-900">'{selectedSolpedForDetail.accountAssignmentCategory}' (PEP / CeCo)</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Fecha Documento</span>
                    <span className="font-bold text-slate-900">{selectedSolpedForDetail.createdAt}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Moneda</span>
                    <span className="font-bold text-blue-700">{selectedSolpedForDetail.currency} ({selectedSolpedForDetail.currencySymbol})</span>
                  </div>
                </div>

                {/* Estrategia de Liberación */}
                {selectedSolpedForDetail.releaseStrategy && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-[11px] text-emerald-900 flex items-center justify-between">
                    <div>
                      <span className="font-bold block">Estrategia de Liberación (ME54N): Aprobada</span>
                      <span>Por: {selectedSolpedForDetail.releaseStrategy.releasedBy} ({selectedSolpedForDetail.releaseStrategy.releasedAt})</span>
                    </div>
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  </div>
                )}

                {/* ALV Grid of Positions */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TableIcon className="w-4 h-4 text-blue-700" />
                      <h4 className="font-bold text-slate-800 text-xs">
                        Listado ALV de Posiciones SAP de la SOLPED
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {detailPositions.length} {detailPositions.length === 1 ? 'posición' : 'posiciones'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleExportCsv(detailPositions, `posiciones_solped_${selectedSolpedForDetail.solpedNumber}.csv`)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                      title="Exportar posiciones a CSV"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Exportar ALV (.csv)</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="p-2.5 text-center w-8">Sem.</th>
                          <th className="p-2.5">Pos.</th>
                          <th className="p-2.5">TP / TI</th>
                          <th className="p-2.5">Texto Breve / Perfil Servicio</th>
                          <th className="p-2.5">Proveedor Sugerido</th>
                          <th className="p-2.5">RUT / Tax ID</th>
                          <th className="p-2.5 text-right">Cantidad (Horas)</th>
                          <th className="p-2.5 text-right">Precio / Hora</th>
                          <th className="p-2.5 text-right">Valor Neto</th>
                          <th className="p-2.5">Elemento PEP</th>
                          <th className="p-2.5">CeCo</th>
                          <th className="p-2.5 text-center">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {detailPositions.map(pos => {
                          const badge = getSolpedStatusBadge(pos.status);
                          const trafficLightColor = 
                            pos.status === 'converted_to_po' || pos.status === 'approved'
                              ? 'bg-emerald-500 shadow-xs'
                              : pos.status === 'pending_approval'
                              ? 'bg-amber-400 shadow-xs'
                              : pos.status === 'rejected'
                              ? 'bg-rose-500'
                              : 'bg-slate-300';

                          return (
                            <tr key={pos.id} className="hover:bg-blue-50/40 transition-colors">
                              <td className="p-2.5 text-center">
                                <span className={`inline-block w-2.5 h-2.5 rounded-full ${trafficLightColor}`} />
                              </td>
                              <td className="p-2.5 font-mono font-bold text-blue-700">
                                {String(pos.positionNumber).padStart(5, '0')}
                              </td>
                              <td className="p-2.5 font-mono text-[10px] text-slate-600">
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">{pos.itemCategory}</span>
                                <span className="ml-1 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">{pos.accountAssignmentCategory}</span>
                              </td>
                              <td className="p-2.5 font-medium text-slate-800">
                                <div>{pos.roleTitle}</div>
                                {pos.moduleCode && (
                                  <span className="text-[10px] text-slate-400">{pos.moduleCode} • {pos.seniority}</span>
                                )}
                              </td>
                              <td className="p-2.5 text-slate-700">{pos.supplierName}</td>
                              <td className="p-2.5 font-mono text-[11px] text-slate-500">{pos.supplierTaxId || '-'}</td>
                              <td className="p-2.5 text-right font-bold font-mono text-slate-800">{pos.hours} {pos.unit}</td>
                              <td className="p-2.5 text-right font-mono text-slate-600">
                                {formatCurrency(pos.hourlyRate, pos.currency, pos.currencySymbol)}
                              </td>
                              <td className="p-2.5 text-right font-bold font-mono text-blue-900">
                                {formatCurrency(pos.totalAmount, pos.currency, pos.currencySymbol)}
                              </td>
                              <td className="p-2.5 font-mono text-[11px] text-slate-700">{pos.pepElement}</td>
                              <td className="p-2.5 font-mono text-[11px] text-slate-500">{pos.costCenter || '-'}</td>
                              <td className="p-2.5 text-center">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                                  {badge.label}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      {/* ALV Totals Footer */}
                      <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300 text-slate-800">
                        <tr>
                          <td colSpan={6} className="p-2.5 text-right font-mono text-xs">
                            LÍNEA DE TOTALES Σ ALV ({detailPositions.length} Posiciones):
                          </td>
                          <td className="p-2.5 text-right font-mono text-xs text-slate-900">
                            {detailTotalHours.toLocaleString()} HUR
                          </td>
                          <td className="p-2.5" />
                          <td className="p-2.5 text-right font-mono text-xs text-blue-900">
                            {formatCurrency(detailTotalNet, selectedSolpedForDetail.currency, selectedSolpedForDetail.currencySymbol)}
                          </td>
                          <td colSpan={3} />
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200 shrink-0">
                <div className="flex items-center gap-2">
                  {(!selectedSolpedForDetail.convertedPoId && selectedSolpedForDetail.status !== 'converted_to_po') && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          const s = selectedSolpedForDetail;
                          setSelectedSolpedForDetail(null);
                          handleOpenEditSolped(s);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl cursor-pointer flex items-center gap-1 shadow-2xs"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Modificar Posiciones (ME52N)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const s = selectedSolpedForDetail;
                          setSelectedSolpedForDetail(null);
                          setSolpedToDelete(s);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl cursor-pointer flex items-center gap-1 shadow-2xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Eliminar SOLPED</span>
                      </button>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {(!selectedSolpedForDetail.convertedPoId && selectedSolpedForDetail.status !== 'converted_to_po') && (
                    <>
                      {selectedSolpedForDetail.status !== 'approved' && (
                        <button
                          type="button"
                          onClick={() => handleAuthorizeSolped(selectedSolpedForDetail)}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl cursor-pointer flex items-center gap-1 shadow-2xs"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Autorizar (ME54N)</span>
                        </button>
                      )}
                      {selectedSolpedForDetail.status !== 'rejected' && (
                        <button
                          type="button"
                          onClick={() => handleRejectSolped(selectedSolpedForDetail)}
                          className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl cursor-pointer flex items-center gap-1 shadow-2xs"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>Rechazar</span>
                        </button>
                      )}
                      {selectedSolpedForDetail.status === 'approved' && (
                        <button
                          type="button"
                          onClick={() => {
                            const s = selectedSolpedForDetail;
                            setSelectedSolpedForDetail(null);
                            handleOpenConvert(s);
                          }}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl cursor-pointer flex items-center gap-1 shadow-2xs"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                          <span>Crear OC (ME21N)</span>
                        </button>
                      )}
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedSolpedForDetail(null)}
                    className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL 4: PURCHASE ORDER PRINT VIEW (ME23N) */}
      {poForPrint && (
        <div 
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in"
          onClick={() => setPoForPrint(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl border border-slate-200 space-y-6 animate-in zoom-in-95"
            onClick={e => e.stopPropagation()}
          >
            {/* Header Document */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  DOCUMENTO OFICIAL SAP MM • PEDIDO DE SERVICIO
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">
                  ORDEN DE COMPRA N° {poForPrint.poNumber}
                </h2>
                <span className="text-xs text-slate-500 font-mono">
                  Referencia SOLPED: {poForPrint.solpedNumber} • Cotización: {poForPrint.quotationCode}
                </span>
              </div>
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 mb-2 ml-auto"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir / PDF</span>
                </button>
                <span className="text-[11px] text-slate-500 block">Fecha de Emisión: {poForPrint.issueDate}</span>
              </div>
            </div>

            {/* Provider and Billing Info */}
            <div className="grid grid-cols-2 gap-6 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Acreedor / Proveedor Adjudicado
                </span>
                <h4 className="font-bold text-slate-900 text-sm">{poForPrint.supplierName}</h4>
                <p className="text-slate-600 font-mono mt-0.5">RUT / Tax ID: {poForPrint.supplierTaxId}</p>
                <p className="text-slate-600 mt-0.5">{poForPrint.supplierEmail}</p>
                <p className="text-purple-700 font-medium mt-1">Condiciones: {poForPrint.paymentTerms}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Datos del Proyecto & Destinatario
                </span>
                <h4 className="font-bold text-slate-900 text-sm">{poForPrint.clientCompanyName}</h4>
                <p className="text-slate-600 mt-0.5">{poForPrint.projectTitle}</p>
                <p className="font-mono text-purple-900 font-bold mt-1">Elemento PEP: {poForPrint.pepElement}</p>
                <p className="text-slate-500 text-[11px]">Centro de Coste: {poForPrint.costCenter || 'CC-10100'}</p>
              </div>
            </div>

            {/* Line Items */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Pos.</th>
                    <th className="p-3">Texto Breve del Servicio</th>
                    <th className="p-3 text-right">Cantidad</th>
                    <th className="p-3 text-right">Tarifa/Hora</th>
                    <th className="p-3 text-right">Importe Neto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {poForPrint.items && poForPrint.items.length > 0 ? (
                    poForPrint.items.map(item => (
                      <tr key={item.positionNumber}>
                        <td className="p-3 font-mono font-bold text-slate-700">{item.positionNumber}</td>
                        <td className="p-3">
                          <span className="font-bold text-slate-900 block">{item.roleTitle}</span>
                          <span className="text-[11px] text-slate-500">
                            Servicio de Consultoría Especializada SAP {item.moduleCode || ''} {item.seniority ? `• ${item.seniority}` : ''}
                          </span>
                          {item.pepElement && (
                            <span className="font-mono text-[10px] text-slate-400 block mt-0.5">PEP: {item.pepElement}</span>
                          )}
                        </td>
                        <td className="p-3 text-right font-bold text-slate-900">{item.hours} HUR</td>
                        <td className="p-3 text-right font-mono text-slate-700">
                          {formatCurrency(item.hourlyRate, poForPrint.currency, poForPrint.currencySymbol)}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-slate-900">
                          {formatCurrency(item.totalAmount, poForPrint.currency, poForPrint.currencySymbol)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-3 font-mono font-bold text-slate-700">10</td>
                      <td className="p-3">
                        <span className="font-bold text-slate-900 block">{poForPrint.roleTitle}</span>
                        <span className="text-[11px] text-slate-500">Servicio de Consultoría Especializada SAP {poForPrint.moduleCode}</span>
                      </td>
                      <td className="p-3 text-right font-bold text-slate-900">{poForPrint.hoursContracted} HUR</td>
                      <td className="p-3 text-right font-mono text-slate-700">
                        {formatCurrency(poForPrint.hourlyRate, poForPrint.currency, poForPrint.currencySymbol)}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(poForPrint.netAmount, poForPrint.currency, poForPrint.currencySymbol)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
                <div className="w-64 space-y-1.5 text-xs text-right">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal Neto:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {formatCurrency(poForPrint.netAmount, poForPrint.currency, poForPrint.currencySymbol)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>IVA ({poForPrint.taxRatePercentage}%):</span>
                    <span className="font-mono font-bold text-slate-800">
                      {formatCurrency(poForPrint.taxAmount, poForPrint.currency, poForPrint.currencySymbol)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-bold text-sm pt-1 border-t border-slate-200">
                    <span>Total Orden de Compra:</span>
                    <span className="font-mono text-purple-900">
                      {formatCurrency(poForPrint.totalAmount, poForPrint.currency, poForPrint.currencySymbol)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Entry Sheets Log */}
            {poForPrint.serviceEntrySheets && poForPrint.serviceEntrySheets.length > 0 && (
              <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-4 text-xs space-y-2">
                <span className="font-bold text-emerald-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Hojas de Entrada de Servicios Certificadas (ML81N)
                </span>
                <div className="divide-y divide-emerald-200/60">
                  {poForPrint.serviceEntrySheets.map(hes => (
                    <div key={hes.id} className="py-2 flex justify-between items-center text-[11px]">
                      <div>
                        <span className="font-bold text-emerald-900">HES #{hes.hesNumber}</span> - {hes.description}
                        <span className="text-slate-500 block text-[10px]">Aceptado por: {hes.acceptedBy} ({hes.date})</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-900">{hes.hoursDelivered} hrs certificadas</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Signatures */}
            <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <div>
                <span>Emisor: {poForPrint.companySigner || 'Gerencia de Abastecimiento & Compras'}</span>
                <span className="block text-[10px]">Documento generado automáticamente por el sistema ERP</span>
              </div>
              <button
                type="button"
                onClick={() => setPoForPrint(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: EDIT SOLPED (ME52N) - ALV MULTI-POSITION GRID */}
      {editingSolped && (() => {
        const activePos = editingSolpedPositions.find(p => p.id === selectedPosId) || editingSolpedPositions[0];
        const isActivePosLocked = Boolean(activePos && (activePos.convertedPoId || activePos.status === 'converted_to_po'));
        const modalTotalHours = editingSolpedPositions.reduce((acc, p) => acc + (p.hours || 0), 0);
        const modalTotalNet = editingSolpedPositions.reduce((acc, p) => acc + (p.totalAmount || 0), 0);
        const currentSolpedCurrency = (editingSolpedPositions[0]?.currency || editingSolped.currency || 'USD') as SupportedCurrency;
        const currentSolpedSymbol = editingSolpedPositions[0]?.currencySymbol || editingSolped.currencySymbol || (CURRENCIES[currentSolpedCurrency]?.symbol || '$');
        const hasPoForThisSolped = Boolean(
          editingSolped.convertedPoId ||
          editingSolped.status === 'converted_to_po' ||
          editingSolpedPositions.some(p => Boolean(p.convertedPoId || p.status === 'converted_to_po')) ||
          purchaseOrders.some(po => po.solpedNumber === editingSolped.solpedNumber || po.solpedId === editingSolped.id)
        );

        // Calculate standard benchmark rates from "Módulos SAP y Perfiles" for the active position
        const activeModule = getCatalogModuleForPosition(activePos, companyCatalogModules);
        const activeSeniority = getSeniorityForPosition(activePos);
        const activeStandardRate = activeModule
          ? getModuleBenchmarkRate(activeModule, activeSeniority, currentSolpedCurrency)
          : getBenchmarkRate(activePos?.moduleCode || 'SAP_MM', activeSeniority, currentSolpedCurrency);

        const benchmarkRatesBySeniority: Record<SeniorityLevel, number> = activeModule ? {
          'Senior': getModuleBenchmarkRate(activeModule, 'Senior', currentSolpedCurrency),
          'Lead / Arquitecto': getModuleBenchmarkRate(activeModule, 'Lead / Arquitecto', currentSolpedCurrency),
          'Semi-Senior': getModuleBenchmarkRate(activeModule, 'Semi-Senior', currentSolpedCurrency),
          'Junior': getModuleBenchmarkRate(activeModule, 'Junior', currentSolpedCurrency),
        } : {
          'Senior': getBenchmarkRate(activePos?.moduleCode || 'SAP_MM', 'Senior', currentSolpedCurrency),
          'Lead / Arquitecto': getBenchmarkRate(activePos?.moduleCode || 'SAP_MM', 'Lead / Arquitecto', currentSolpedCurrency),
          'Semi-Senior': getBenchmarkRate(activePos?.moduleCode || 'SAP_MM', 'Semi-Senior', currentSolpedCurrency),
          'Junior': getBenchmarkRate(activePos?.moduleCode || 'SAP_MM', 'Junior', currentSolpedCurrency),
        };

        const handleApplyStandardRate = (rate: number, seniority?: SeniorityLevel) => {
          if (isActivePosLocked || !activePos) return;
          setEditingSolpedPositions(prev => prev.map(p => {
            if (p.id === activePos.id) {
              const updated = {
                ...p,
                hourlyRate: rate,
                totalAmount: (p.hours || 0) * rate
              };
              if (seniority) {
                updated.seniority = seniority;
              }
              if (activeModule) {
                updated.moduleCode = activeModule.code;
                updated.moduleName = activeModule.name;
              }
              return updated;
            }
            return p;
          }));
          setEditSolpedRate(rate);
          setStandardRateNotice(
            `Tarifa estándar aplicada: ${formatCurrency(rate, currentSolpedCurrency, currentSolpedSymbol)}/hr (${activeModule?.shortName || activeModule?.name || 'Módulo'} • ${seniority || activeSeniority})`
          );
          setTimeout(() => setStandardRateNotice(null), 3500);
        };

        return (
          <div 
            className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
            onClick={() => setEditingSolped(null)}
          >
            <div 
              className="bg-white rounded-2xl w-[90vw] max-w-[90vw] max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 p-6 space-y-4 my-auto overflow-hidden animate-in zoom-in-95"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
                    <Edit2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span>Modificar Solicitud de Pedido (ME52N) #{editingSolped.solpedNumber}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        {editingSolpedPositions.length} {editingSolpedPositions.length === 1 ? 'Posición' : 'Posiciones'}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Gestión ALV de Posiciones • Cotización: {editingSolped.quotationCode} • Cliente: {editingSolped.clientCompanyName}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setEditingSolped(null)} 
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content Body */}
              <div className="space-y-4 text-xs overflow-y-auto pr-1 flex-1">
                {/* ALV Toolbar Controls - Compact Single-Line Layout */}
                <div className="bg-slate-100/90 border border-slate-200 rounded-xl px-3 py-1.5 flex items-center justify-between gap-2.5 text-xs flex-nowrap overflow-x-auto">
                  {/* Left: ALV Title & Counter */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <TableIcon className="w-3.5 h-3.5 text-blue-700" />
                    <span className="font-bold text-slate-800 text-xs whitespace-nowrap">Posiciones ALV</span>
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-full font-mono">
                      {editingSolpedPositions.length}
                    </span>
                  </div>

                  {/* Actions: Insert, Delete, Export */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={handleInsertPositionInModal}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs whitespace-nowrap"
                      title="Agregar una nueva línea de posición a la SOLPED (incremento de 10 en 10)"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Insertar</span>
                    </button>

                    <button
                      type="button"
                      disabled={editingSolpedPositions.length <= 1 || isActivePosLocked}
                      onClick={() => activePos && handleDeletePositionInModal(activePos.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors flex items-center gap-1 shadow-2xs whitespace-nowrap ${
                        editingSolpedPositions.length <= 1 || isActivePosLocked
                          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                          : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 cursor-pointer'
                      }`}
                      title={
                        isActivePosLocked 
                          ? "No se puede eliminar una posición que ya posee Orden de Compra emitida" 
                          : editingSolpedPositions.length <= 1 
                          ? "La SOLPED debe mantener al menos una posición" 
                          : "Eliminar posición seleccionada"
                      }
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Borrar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleExportCsv(editingSolpedPositions, `posiciones_solped_${editingSolped.solpedNumber}.csv`)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs whitespace-nowrap"
                      title="Descargar listado ALV a CSV"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-600" />
                      <span>CSV</span>
                    </button>
                  </div>

                  {/* Right: Inline Compact Currency Selector */}
                  <div className="flex items-center gap-1.5 shrink-0 pl-1 border-l border-slate-300">
                    <Coins className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="font-bold text-slate-600 text-xs whitespace-nowrap">Moneda:</span>
                    {hasPoForThisSolped ? (
                      <div 
                        className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded-md text-xs font-bold cursor-not-allowed"
                        title="La moneda no puede modificarse porque esta SOLPED ya cuenta con Orden de Compra emitida."
                      >
                        <Lock className="w-3 h-3 text-amber-600 shrink-0" />
                        <span>{currentSolpedCurrency}</span>
                        <span className="text-[9px] text-amber-800 bg-amber-100 px-1 rounded font-bold">OC</span>
                      </div>
                    ) : (
                      <select
                        id="select-solped-currency"
                        value={currentSolpedCurrency}
                        onChange={(e) => handleChangeSolpedCurrency(e.target.value as SupportedCurrency)}
                        className="bg-white hover:bg-blue-50/50 text-blue-900 border border-slate-300 font-bold rounded-md px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer transition-colors shadow-2xs"
                        title="Cambiar la moneda de esta SOLPED (convierte tarifas e importes automáticamente al tipo de cambio oficial)"
                      >
                        <option value="UF">🇨🇱 UF</option>
                        <option value="USD">🇺🇸 USD ($)</option>
                        <option value="CLP">🇨🇱 CLP ($)</option>
                        <option value="MXN">🇲🇽 MXN ($)</option>
                      </select>
                    )}
                  </div>
                </div>

                {/* Banner de Notificación de Conversión de Moneda */}
                {currencyChangeNotice && (
                  <div className="flex items-center justify-between gap-2 px-3.5 py-2 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs shadow-2xs animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-medium">{currencyChangeNotice}</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setCurrencyChangeNotice(null)}
                      className="text-emerald-700 hover:text-emerald-900 p-0.5 rounded cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* ALV Table Grid */}
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px] select-none">
                      <tr>
                        <th className="p-2.5 text-center w-8">Sel.</th>
                        <th className="p-2.5">Pos.</th>
                        <th className="p-2.5 text-center w-8">Sem.</th>
                        <th className="p-2.5">TP / TI</th>
                        <th className="p-2.5">Texto Breve / Perfil Servicio</th>
                        <th className="p-2.5">Proveedor Sugerido</th>
                        <th className="p-2.5">RUT / Tax ID</th>
                        <th className="p-2.5 text-right">Cantidad (Horas)</th>
                        <th className="p-2.5 text-right">Tarifa / Hora</th>
                        <th className="p-2.5 text-right">Valor Neto</th>
                        <th className="p-2.5">Elemento PEP</th>
                        <th className="p-2.5">CeCo</th>
                        <th className="p-2.5 text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {editingSolpedPositions.map(pos => {
                        const isSelected = activePos?.id === pos.id;
                        const isPosLocked = Boolean(pos.convertedPoId || pos.status === 'converted_to_po');
                        const trafficLightColor = 
                          pos.status === 'converted_to_po' || pos.status === 'approved'
                            ? 'bg-emerald-500 shadow-xs'
                            : pos.status === 'pending_approval'
                            ? 'bg-amber-400 shadow-xs'
                            : pos.status === 'rejected'
                            ? 'bg-rose-500'
                            : 'bg-slate-300';

                        return (
                          <tr 
                            key={pos.id} 
                            onClick={() => handleSelectPositionInModal(pos)}
                            className={`cursor-pointer transition-colors ${
                              isSelected 
                                ? 'bg-blue-50/90 font-medium border-l-4 border-l-blue-600' 
                                : 'hover:bg-slate-50'
                            }`}
                          >
                            <td className="p-2.5 text-center">
                              <input 
                                type="radio" 
                                name="alv_modal_selected_position"
                                checked={isSelected}
                                onChange={() => handleSelectPositionInModal(pos)}
                                className="text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                            </td>
                            <td className="p-2.5 font-mono font-bold text-blue-700">
                              <div className="flex items-center gap-1.5">
                                <span>{String(pos.positionNumber).padStart(5, '0')}</span>
                                {isPosLocked && (
                                  <span 
                                    className="p-0.5 rounded bg-amber-100 text-amber-800"
                                    title={`Posición con OC #${pos.convertedPoNumber || ''} emitida (Bloqueada)`}
                                  >
                                    <Lock className="w-3 h-3" />
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-2.5 text-center">
                              <span className={`inline-block w-2.5 h-2.5 rounded-full ${trafficLightColor}`} />
                            </td>
                            <td className="p-2.5 font-mono text-[10px] text-slate-600">
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">{pos.itemCategory}</span>
                              <span className="ml-1 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">{pos.accountAssignmentCategory}</span>
                            </td>
                            <td className="p-2.5 text-slate-900 font-medium">
                              <div>{pos.roleTitle}</div>
                              {pos.moduleCode && (
                                <span className="text-[10px] text-slate-400">{pos.moduleCode} • {pos.seniority}</span>
                              )}
                            </td>
                            <td className="p-2.5 text-slate-700">{pos.supplierName}</td>
                            <td className="p-2.5 font-mono text-[11px] text-slate-500">{pos.supplierTaxId || '-'}</td>
                            <td className="p-2.5 text-right font-bold font-mono text-slate-800">{pos.hours} {pos.unit}</td>
                            <td className="p-2.5 text-right font-mono text-slate-600">
                              {formatCurrency(pos.hourlyRate, pos.currency, pos.currencySymbol)}
                            </td>
                            <td className="p-2.5 text-right font-bold font-mono text-blue-900">
                              {formatCurrency(pos.totalAmount, pos.currency, pos.currencySymbol)}
                            </td>
                            <td className="p-2.5 font-mono text-[11px] text-slate-700">{pos.pepElement}</td>
                            <td className="p-2.5 font-mono text-[11px] text-slate-500">{pos.costCenter || '-'}</td>
                            <td className="p-2.5 text-center">
                              {isPosLocked ? (
                                <span 
                                  className="inline-flex p-1 rounded text-amber-700 bg-amber-100"
                                  title="Posición con Orden de Compra emitida (Bloqueada)"
                                >
                                  <Lock className="w-3.5 h-3.5" />
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  disabled={editingSolpedPositions.length <= 1}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeletePositionInModal(pos.id);
                                  }}
                                  className={`p-1 rounded transition-colors ${
                                    editingSolpedPositions.length <= 1
                                      ? 'text-slate-300 cursor-not-allowed'
                                      : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer'
                                  }`}
                                  title="Eliminar esta posición"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    {/* ALV Totals Footer */}
                    <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300 text-slate-800">
                      <tr>
                        <td colSpan={7} className="p-2.5 text-right font-mono text-xs">
                          LÍNEA DE TOTALES Σ ALV ({editingSolpedPositions.length} Posiciones):
                        </td>
                        <td className="p-2.5 text-right font-mono text-xs text-slate-900">
                          {modalTotalHours.toLocaleString()} HUR
                        </td>
                        <td className="p-2.5" />
                        <td className="p-2.5 text-right font-mono text-xs text-blue-900">
                          {formatCurrency(modalTotalNet, currentSolpedCurrency, currentSolpedSymbol)}
                        </td>
                        <td colSpan={3} />
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Formulario de Detalle de Posición Activa */}
                {activePos && (
                  <div className={`border rounded-xl p-4 space-y-3 animate-in fade-in ${
                    isActivePosLocked 
                      ? 'border-amber-300 bg-amber-50/50' 
                      : 'border-blue-200 bg-blue-50/40'
                  }`}>
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                          isActivePosLocked ? 'bg-amber-600 text-white' : 'bg-blue-600 text-white'
                        }`}>
                          Posición {String(activePos.positionNumber).padStart(5, '0')}
                        </span>
                        <h4 className="font-bold text-slate-800 text-xs flex items-center gap-2">
                          <span>Detalle de Datos de la Posición Seleccionada</span>
                          {isActivePosLocked ? (
                            <span className="px-2 py-0.5 rounded bg-amber-200/80 text-amber-900 font-bold text-[10px] flex items-center gap-1">
                              <Lock className="w-3 h-3 text-amber-800" />
                              <span>Bloqueada por OC #{activePos.convertedPoNumber || 'Emitida'} (Solo Lectura)</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1">
                              <Edit2 className="w-3 h-3 text-emerald-700" />
                              <span>Posición Abierta para Edición</span>
                            </span>
                          )}
                        </h4>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-blue-900">
                        Subtotal: {activePos.hours} hrs @ {formatCurrency(activePos.totalAmount, activePos.currency, activePos.currencySymbol)}
                      </span>
                    </div>

                    {isActivePosLocked && (
                      <div className="bg-amber-100 border border-amber-300 rounded-xl p-3 text-amber-900 text-xs flex items-center gap-2.5">
                        <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                        <div>
                          <span className="font-bold block">Esta posición está bloqueada porque ya tiene Orden de Compra emitida ({activePos.convertedPoNumber ? `OC #${activePos.convertedPoNumber}` : 'OC Activa'}).</span>
                          <span className="text-[11px] text-amber-800 block">
                            Los campos de esta posición están en modo solo lectura. Para editar otra posición (como la posición 20), haz clic sobre su fila en el listado ALV superior.
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <label className="font-bold text-slate-700 flex items-center gap-1.5 text-xs">
                            <span>Servicio / Perfil de Consultoría</span>
                          </label>
                          
                          {/* Selector de Especialidades y Perfiles de la Empresa (Dinámico) */}
                          <div className="flex items-center gap-1">
                            <select
                              id="select-sap-specialty-me52n"
                              disabled={isActivePosLocked}
                              value=""
                              onChange={e => {
                                const val = e.target.value;
                                if (!val) return;
                                const mod = companyCatalogModules.find(m => m.name === val || m.code === val);
                                const preset = SAP_SPECIALTY_PRESETS.find(p => p.label === val);
                                handleSelectSpecialtyForActivePos(
                                  mod ? mod.name : (preset ? preset.label : val),
                                  mod ? mod.code : preset?.code,
                                  mod ? mod.name : preset?.moduleName
                                );
                                e.target.value = '';
                              }}
                              className="text-[11px] font-bold py-1 px-2.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-300 hover:bg-blue-100 hover:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer transition-all shadow-2xs max-w-[230px] truncate"
                              title="Selecciona un perfil o especialidad desde el catálogo maestro de la empresa"
                            >
                              <option value="">▼ Seleccionar Especialidad / Perfil...</option>
                              
                              {/* Agrupación dinámica por categoría de los perfiles de la empresa */}
                              {Array.from(new Set(companyCatalogModules.map(m => m.category || 'Consultoría'))).map(categoryName => {
                                const modulesInCategory = companyCatalogModules.filter(m => (m.category || 'Consultoría') === categoryName);
                                return (
                                  <optgroup key={categoryName} label={categoryName}>
                                    {modulesInCategory.map(mod => (
                                      <option key={mod.code} value={mod.name}>
                                        {mod.name} ({mod.code})
                                      </option>
                                    ))}
                                  </optgroup>
                                );
                              })}
                            </select>
                          </div>
                        </div>

                        {/* Input de texto libre con soporte de autocompletado y limpieza */}
                        <div className="relative">
                          <input
                            type="text"
                            required
                            list="sap-specialties-datalist"
                            placeholder="Ej: Arquitecto AI, ABAPER, Consultor MM o escribe texto libre..."
                            disabled={isActivePosLocked}
                            value={activePos.roleTitle || ''}
                            onChange={e => handleUpdateActivePosition('roleTitle', e.target.value)}
                            className={`w-full px-3 py-2 pr-8 border rounded-xl font-medium focus:outline-none transition-colors ${
                              isActivePosLocked 
                                ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed' 
                                : 'bg-white text-slate-800 border-slate-300 focus:ring-1 focus:ring-blue-500'
                            }`}
                          />
                          {activePos.roleTitle && !isActivePosLocked && (
                            <button
                              type="button"
                              onClick={() => handleUpdateActivePosition('roleTitle', '')}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 cursor-pointer"
                              title="Limpiar campo para escribir texto libre"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Datalist dinámico alimentado por el catálogo maestro de la empresa */}
                        <datalist id="sap-specialties-datalist">
                          {companyCatalogModules.map(mod => (
                            <option key={mod.code} value={mod.name}>
                              [{mod.code}] {mod.name} - {mod.category}
                            </option>
                          ))}
                          {SAP_SPECIALTY_PRESETS.map(p => (
                            <option key={`preset-${p.id}`} value={p.label}>
                              {p.moduleName} ({p.description})
                            </option>
                          ))}
                        </datalist>

                        {/* Accesos rápidos dinámicos incluyendo Arquitecto AI y los más frecuentes */}
                        {!isActivePosLocked && (
                          <div className="mt-1.5 flex flex-wrap items-center gap-1 text-[11px]">
                            <span className="text-slate-500 text-[10px] font-medium mr-0.5">Sugerencias:</span>
                            {[
                              { label: 'Arquitecto AI', code: 'APP_AI', modName: 'Arquitecto AI' },
                              { label: 'ABAPER', code: 'DEV_ABAP', modName: 'Desarrollador ABAP' },
                              { label: 'Consultor MM', code: 'SAP_MM', modName: 'SAP MM' },
                              { label: 'Consultor HCM', code: 'SAP_HCM', modName: 'SAP HCM' },
                              { label: 'Consultor FICO', code: 'SAP_FICO', modName: 'SAP FICO' },
                              { label: 'Consultor Basis', code: 'SAP_BASIS', modName: 'SAP Basis' }
                            ].map(item => (
                              <button
                                key={item.label}
                                type="button"
                                onClick={() => handleSelectSpecialtyForActivePos(item.label, item.code, item.modName)}
                                className={`px-2 py-0.5 rounded-md border text-[10px] font-bold transition-all cursor-pointer ${
                                  activePos.roleTitle === item.label
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                    : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-blue-50/70 hover:text-blue-700'
                                }`}
                                title={`Seleccionar ${item.label}`}
                              >
                                + {item.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Proveedor / Subcontratista Sugerido</label>
                        <input
                          type="text"
                          disabled={isActivePosLocked}
                          value={activePos.supplierName || ''}
                          onChange={e => handleUpdateActivePosition('supplierName', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-xl font-medium focus:outline-none transition-colors ${
                            isActivePosLocked 
                              ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed' 
                              : 'bg-white text-slate-800 border-slate-300 focus:ring-1 focus:ring-blue-500'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">RUT / Tax ID Proveedor</label>
                        <input
                          type="text"
                          disabled={isActivePosLocked}
                          value={activePos.supplierTaxId || ''}
                          onChange={e => handleUpdateActivePosition('supplierTaxId', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-xl font-mono focus:outline-none transition-colors ${
                            isActivePosLocked 
                              ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed' 
                              : 'bg-white text-slate-800 border-slate-300 focus:ring-1 focus:ring-blue-500'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Horas Requeridas</label>
                        <input
                          type="number"
                          required
                          min="1"
                          disabled={isActivePosLocked}
                          value={activePos.hours || 0}
                          onChange={e => handleUpdateActivePosition('hours', Math.max(1, Number(e.target.value) || 0))}
                          className={`w-full px-3 py-2 border rounded-xl font-bold focus:outline-none transition-colors ${
                            isActivePosLocked 
                              ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed' 
                              : 'bg-white text-slate-800 border-slate-300 focus:ring-1 focus:ring-blue-500'
                          }`}
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1 gap-1.5 flex-wrap">
                          <label className="font-bold text-slate-700 block text-xs whitespace-nowrap">
                            Tarifa Compra / Hora ({currentSolpedCurrency})
                          </label>

                          {/* Botón para tomar la tarifa estándar de la sección Módulos SAP y Perfiles */}
                          {activePos && (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                id="btn-apply-standard-rate"
                                disabled={isActivePosLocked}
                                onClick={() => handleApplyStandardRate(activeStandardRate, activeSeniority)}
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-all border shadow-2xs ${
                                  isActivePosLocked
                                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                    : activePos.hourlyRate === activeStandardRate
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-extrabold hover:bg-emerald-100 cursor-pointer'
                                      : 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100 hover:border-blue-400 hover:text-blue-900 cursor-pointer active:scale-95'
                                }`}
                                title={`Tomar tarifa estándar definida en el catálogo de Módulos SAP y Perfiles para ${activeModule?.name || 'este perfil'} (${activeSeniority}): ${formatCurrency(activeStandardRate, currentSolpedCurrency, currentSolpedSymbol)}/hr`}
                              >
                                <Zap className={`w-3.5 h-3.5 ${activePos.hourlyRate === activeStandardRate ? 'text-emerald-600 fill-emerald-600' : 'text-amber-500 fill-amber-500'} shrink-0`} />
                                <span>
                                  {activePos.hourlyRate === activeStandardRate
                                    ? `✓ Estándar: ${formatCurrency(activeStandardRate, currentSolpedCurrency, currentSolpedSymbol)}`
                                    : `Tomar Tarifa Estándar: ${formatCurrency(activeStandardRate, currentSolpedCurrency, currentSolpedSymbol)}`}
                                </span>
                              </button>

                              {/* Selector rápido de seniority con tarifas de Módulos SAP y Perfiles */}
                              {!isActivePosLocked && (
                                <select
                                  id="select-seniority-rate"
                                  value={activeSeniority}
                                  onChange={(e) => {
                                    const newSen = e.target.value as SeniorityLevel;
                                    const newRate = benchmarkRatesBySeniority[newSen];
                                    handleApplyStandardRate(newRate, newSen);
                                  }}
                                  className="text-[10px] font-bold py-0.5 px-1.5 rounded-lg bg-slate-50 text-slate-700 border border-slate-300 hover:border-blue-400 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  title="Seleccionar nivel de experiencia y aplicar automáticamente su tarifa estándar del catálogo"
                                >
                                  <option value="Senior">Sr ({formatCurrency(benchmarkRatesBySeniority['Senior'], currentSolpedCurrency, currentSolpedSymbol)})</option>
                                  <option value="Lead / Arquitecto">Lead ({formatCurrency(benchmarkRatesBySeniority['Lead / Arquitecto'], currentSolpedCurrency, currentSolpedSymbol)})</option>
                                  <option value="Semi-Senior">S-Sr ({formatCurrency(benchmarkRatesBySeniority['Semi-Senior'], currentSolpedCurrency, currentSolpedSymbol)})</option>
                                  <option value="Junior">Jr ({formatCurrency(benchmarkRatesBySeniority['Junior'], currentSolpedCurrency, currentSolpedSymbol)})</option>
                                </select>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            required
                            min="0"
                            step={currentSolpedCurrency === 'UF' || currentSolpedCurrency === 'USD' ? '0.01' : '1'}
                            disabled={isActivePosLocked}
                            value={activePos.hourlyRate || 0}
                            onChange={e => handleUpdateActivePosition('hourlyRate', Math.max(0, Number(e.target.value) || 0))}
                            className={`w-full px-3 py-2 pr-12 border rounded-xl font-mono font-bold focus:outline-none transition-colors ${
                              isActivePosLocked 
                                ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed' 
                                : 'bg-white text-slate-800 border-slate-300 focus:ring-1 focus:ring-blue-500'
                            }`}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400 pointer-events-none">
                            {currentSolpedCurrency}
                          </span>
                        </div>
                        {standardRateNotice && (
                          <div className="mt-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 flex items-center gap-1 animate-in fade-in">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{standardRateNotice}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Elemento PEP (Imputación)</label>
                        <input
                          type="text"
                          disabled={isActivePosLocked}
                          value={activePos.pepElement || ''}
                          onChange={e => handleUpdateActivePosition('pepElement', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-xl font-mono focus:outline-none transition-colors ${
                            isActivePosLocked 
                              ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed' 
                              : 'bg-white text-slate-800 border-slate-300 focus:ring-1 focus:ring-blue-500'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Centro de Costo (CeCo)</label>
                        <input
                          type="text"
                          disabled={isActivePosLocked}
                          value={activePos.costCenter || ''}
                          onChange={e => handleUpdateActivePosition('costCenter', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-xl font-mono focus:outline-none transition-colors ${
                            isActivePosLocked 
                              ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed' 
                              : 'bg-white text-slate-800 border-slate-300 focus:ring-1 focus:ring-blue-500'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Notas / Justificación de Abastecimiento</label>
                      <textarea
                        rows={2}
                        disabled={isActivePosLocked}
                        value={activePos.notes || ''}
                        onChange={e => handleUpdateActivePosition('notes', e.target.value)}
                        placeholder="Justificación del requerimiento..."
                        className={`w-full px-3 py-2 border rounded-xl focus:outline-none transition-colors ${
                          isActivePosLocked 
                            ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed' 
                            : 'bg-white text-slate-800 border-slate-300 focus:ring-1 focus:ring-blue-500'
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer Controls */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200 shrink-0">
                <div className="text-xs">
                  <span className="text-slate-500">Total SOLPED Recalculado: </span>
                  <span className="font-mono font-bold text-blue-900 text-sm">
                    {modalTotalHours.toLocaleString()} hrs @ {formatCurrency(modalTotalNet, currentSolpedCurrency, currentSolpedSymbol)}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setEditingSolped(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEditSolped}
                    className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Guardar Cambios en SOLPED (ME52N)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL 6: DELETE SOLPED CONFIRMATION */}
      {solpedToDelete && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSolpedToDelete(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Eliminar Solicitud de Pedido (SOLPED)
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  ¿Confirmas la eliminación definitiva de la SOLPED <strong className="text-slate-800">#{solpedToDelete.solpedNumber}</strong>?
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Servicio:</span>
                <span className="font-bold text-slate-800">{solpedToDelete.roleTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Horas:</span>
                <span className="font-bold text-slate-800">{solpedToDelete.hours} hrs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cotización:</span>
                <span className="font-mono text-slate-700">{solpedToDelete.quotationCode}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-500">Monto Estimado:</span>
                <span className="font-mono font-bold text-rose-700">
                  {formatCurrency(solpedToDelete.totalAmount, solpedToDelete.currency, solpedToDelete.currencySymbol)}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 p-2.5 rounded-lg">
              Esta SOLPED no posee Orden de Compra emitida, por lo que su eliminación es segura y dejará el registro de adquisiciones consistente.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSolpedToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteSolped}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Confirmar Eliminación</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6.5: DELETE / ANULAR PURCHASE ORDER (OC) CONFIRMATION */}
      {poToDelete && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPoToDelete(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Anular / Eliminar Orden de Compra (OC)
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  ¿Confirmas la anulación y eliminación definitiva de la Orden de Compra <strong className="text-slate-800">#{poToDelete.poNumber}</strong>?
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Proveedor:</span>
                <span className="font-bold text-slate-800">{poToDelete.supplierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Servicio / Descripción:</span>
                <span className="font-medium text-slate-800 text-right max-w-[240px] truncate">{poToDelete.roleTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">SOLPED Origen:</span>
                <span className="font-mono font-bold text-purple-700">#{poToDelete.solpedNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Horas Contratadas:</span>
                <span className="font-mono font-bold text-slate-800">{poToDelete.hoursContracted} hrs</span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-slate-200">
                <span className="text-slate-500">Monto Total Contratado:</span>
                <span className="font-mono font-bold text-rose-700">
                  {formatCurrency(poToDelete.totalAmount, poToDelete.currency, poToDelete.currencySymbol)}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-emerald-900 bg-emerald-50 border border-emerald-200 p-3 rounded-xl space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Liberación automática de la SOLPED #{poToDelete.solpedNumber}</span>
              </div>
              <p className="text-emerald-700 leading-relaxed">
                Al eliminar esta Orden de Compra, todas sus posiciones vinculadas en la SOLPED asociada quedarán automáticamente <strong>liberadas</strong> en estado <strong>Aprobada</strong>, listas para ser reasignadas o convertidas en una nueva Orden de Compra.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setPoToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeletePo}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Confirmar Anulación y Eliminar OC</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: EDIT PURCHASE ORDER (ME22N) - ALV MULTI-POSITION GRID (90% SCREEN) */}
      {editingPo && (() => {
        const activePoPos = editingPoPositions[activePoPosIndex] || editingPoPositions[0];
        const totalPoHours = editingPoPositions.reduce((acc, p) => acc + (Number(p.hours) || 0), 0);
        const totalPoNet = editingPoPositions.reduce((acc, p) => acc + (Number(p.totalAmount) || ((Number(p.hours) || 0) * (Number(p.hourlyRate) || 0))), 0);
        const avgPoRate = totalPoHours > 0 ? Number((totalPoNet / totalPoHours).toFixed(2)) : (editingPo.hourlyRate || 0);
        const taxRate = editingPo.taxRatePercentage || 19;
        const taxAmount = Math.round((totalPoNet * taxRate) / 100);
        const totalAmount = totalPoNet + taxAmount;

        return (
          <div 
            className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in"
            onClick={() => setEditingPo(null)}
          >
            <div 
              className="bg-white rounded-2xl w-[90vw] max-w-[90vw] max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 p-6 space-y-4 my-auto overflow-hidden animate-in zoom-in-95"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
                    <Edit2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span>Modificar Orden de Compra (ME22N) #{editingPo.poNumber}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-bold">
                        {editingPoPositions.length} {editingPoPositions.length === 1 ? 'Posición ALV' : 'Posiciones ALV'}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      SOLPED Base: {editingPo.solpedNumber} • Proyecto: {editingPo.quotationCode} • Cliente: {editingPo.clientCompanyName || 'Cliente Corporativo'}
                    </p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setEditingPo(null)} 
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form and Scrollable Content Body */}
              <form onSubmit={handleSaveEditPo} className="flex flex-col flex-1 overflow-hidden space-y-4 text-xs">
                <div className="space-y-4 overflow-y-auto pr-1 flex-1">
                  {/* Card 1: Datos de Cabecera (Header Data) */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                        <Building2 className="w-3.5 h-3.5 text-purple-700" />
                        Datos de Cabecera de la Orden de Compra (Header Data)
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Emisor: {editingPo.companySigner || 'Gerencia de Abastecimiento & Compras'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Columna Izquierda: Proveedor */}
                      <div className="space-y-2.5">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Razón Social Proveedor / Contratista</label>
                          <input
                            type="text"
                            required
                            value={editPoSupplierName}
                            onChange={e => setEditPoSupplierName(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-800 font-medium focus:border-purple-500 focus:outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">RUT / Tax ID</label>
                            <input
                              type="text"
                              value={editPoSupplierTaxId}
                              onChange={e => setEditPoSupplierTaxId(e.target.value)}
                              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-800 font-mono focus:border-purple-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Contacto KAM</label>
                            <input
                              type="text"
                              value={editPoSupplierContact}
                              onChange={e => setEditPoSupplierContact(e.target.value)}
                              placeholder="Ej: Juan Pérez"
                              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:border-purple-500 focus:outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Email Proveedor / Facturación</label>
                          <input
                            type="email"
                            value={editPoSupplierEmail}
                            onChange={e => setEditPoSupplierEmail(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:border-purple-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Columna Derecha: Condiciones y Fechas */}
                      <div className="space-y-2.5">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Condiciones de Pago</label>
                          <input
                            type="text"
                            value={editPoPaymentTerms}
                            onChange={e => setEditPoPaymentTerms(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:border-purple-500 focus:outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Elemento PEP Principal</label>
                            <input
                              type="text"
                              value={editPoPep}
                              onChange={e => setEditPoPep(e.target.value)}
                              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-800 font-mono focus:border-purple-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Centro de Costo (CeCo)</label>
                            <input
                              type="text"
                              value={editPoCeco}
                              onChange={e => setEditPoCeco(e.target.value)}
                              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-800 font-mono focus:border-purple-500 focus:outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Fecha de Entrega Estimada</label>
                          <input
                            type="date"
                            value={editPoDeliveryDate}
                            onChange={e => setEditPoDeliveryDate(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:border-purple-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Observaciones del Comprador</label>
                      <textarea
                        rows={1}
                        value={editPoBuyerNotes}
                        onChange={e => setEditPoBuyerNotes(e.target.value)}
                        placeholder="Instrucciones o notas adicionales para la emisión y facturación de la Orden de Compra..."
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:border-purple-500 focus:outline-none resize-none"
                      />
                    </div>
                  </div>

                  {/* Card 2: Resumen de Posiciones en Formato ALV (SAP ALV Multi-Position Grid) */}
                  <div className="space-y-2">
                    {/* ALV Ribbon Toolbar */}
                    <div className="bg-slate-100/90 border border-slate-200 rounded-xl px-3 py-1.5 flex items-center justify-between gap-2.5 text-xs flex-nowrap overflow-x-auto">
                      <div className="flex items-center gap-1.5 shrink-0">
                        <TableIcon className="w-3.5 h-3.5 text-purple-700" />
                        <span className="font-bold text-slate-800 text-xs whitespace-nowrap">Resumen de Posiciones ALV (Item Overview)</span>
                        <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded-full font-mono">
                          {editingPoPositions.length}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={handleInsertPoPosition}
                          className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs whitespace-nowrap"
                          title="Agregar una nueva posición a la Orden de Compra (incremento de 10 en 10)"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Insertar Posición</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeletePoPosition(activePoPosIndex)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors flex items-center gap-1 shadow-2xs whitespace-nowrap bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 cursor-pointer"
                          title={
                            editingPoPositions.length <= 1
                              ? "Eliminar esta última posición anulará la Orden de Compra y liberará la SOLPED"
                              : "Eliminar posición seleccionada del ALV"
                          }
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{editingPoPositions.length <= 1 ? 'Eliminar Posición (Anular OC)' : 'Borrar'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleExportPoCsv(editingPoPositions, `posiciones_oc_${editingPo.poNumber}.csv`)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs whitespace-nowrap"
                          title="Descargar listado ALV a CSV"
                        >
                          <Download className="w-3.5 h-3.5 text-emerald-600" />
                          <span>CSV</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 pl-1 border-l border-slate-300">
                        <Coins className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="font-bold text-slate-600 text-xs whitespace-nowrap">Moneda:</span>
                        <span className="px-2 py-0.5 bg-white border border-slate-200 text-slate-800 rounded-md font-mono font-bold text-xs">
                          {editingPo.currency} ({editingPo.currencySymbol})
                        </span>
                      </div>
                    </div>

                    {/* ALV Table Grid */}
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px] select-none">
                          <tr>
                            <th className="p-2.5 text-center w-8">Sel.</th>
                            <th className="p-2.5">Pos.</th>
                            <th className="p-2.5 text-center w-8">Sem.</th>
                            <th className="p-2.5">TP / TI</th>
                            <th className="p-2.5">Texto Breve / Perfil Servicio</th>
                            <th className="p-2.5">Módulo / Nivel</th>
                            <th className="p-2.5 text-right">Cantidad (Horas)</th>
                            <th className="p-2.5 text-right">Tarifa / Hora</th>
                            <th className="p-2.5 text-right">Valor Neto</th>
                            <th className="p-2.5">Elemento PEP</th>
                            <th className="p-2.5">CeCo</th>
                            <th className="p-2.5 text-center">Acción</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                          {editingPoPositions.map((pos, idx) => {
                            const isSelected = activePoPosIndex === idx;
                            const posHours = Number(pos.hours) || 0;
                            const posRate = Number(pos.hourlyRate) || 0;
                            const posTotal = Number(pos.totalAmount) || (posHours * posRate);

                            return (
                              <tr
                                key={idx}
                                onClick={() => handleSelectPoPosition(idx)}
                                className={`cursor-pointer transition-colors ${
                                  isSelected
                                    ? 'bg-purple-50/90 font-medium border-l-4 border-l-purple-600'
                                    : 'hover:bg-slate-50'
                                }`}
                              >
                                <td className="p-2.5 text-center">
                                  <input
                                    type="radio"
                                    name="alv_po_modal_selected_position"
                                    checked={isSelected}
                                    onChange={() => handleSelectPoPosition(idx)}
                                    className="text-purple-600 focus:ring-purple-500 cursor-pointer"
                                  />
                                </td>
                                <td className="p-2.5 font-mono font-bold text-purple-700">
                                  {String(pos.positionNumber || (idx + 1) * 10).padStart(5, '0')}
                                </td>
                                <td className="p-2.5 text-center">
                                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" title="Posición liberada para compra" />
                                </td>
                                <td className="p-2.5 font-mono text-[10px] text-slate-600">
                                  <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200" title="Tipo Posición D (Servicios)">D</span>
                                  <span className="ml-1 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200" title="Imputación P (Elemento PEP)">P</span>
                                </td>
                                <td className="p-2.5 text-slate-900 font-medium">
                                  <span className="block font-semibold">{pos.roleTitle}</span>
                                  <span className="text-[10px] text-slate-400">Servicio de Consultoría y Subcontratación SAP</span>
                                </td>
                                <td className="p-2.5 font-mono text-[11px] text-slate-600">
                                  <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                                    {pos.moduleCode || 'DEV_ABAP'}
                                  </span>
                                  {pos.seniority && (
                                    <span className="ml-1 text-[10px] text-slate-500">{pos.seniority}</span>
                                  )}
                                </td>
                                <td className="p-2.5 text-right font-bold font-mono text-slate-800">
                                  {posHours} HUR
                                </td>
                                <td className="p-2.5 text-right font-mono text-slate-600">
                                  {formatCurrency(posRate, editingPo.currency, editingPo.currencySymbol)}
                                </td>
                                <td className="p-2.5 text-right font-bold font-mono text-purple-900">
                                  {formatCurrency(posTotal, editingPo.currency, editingPo.currencySymbol)}
                                </td>
                                <td className="p-2.5 font-mono text-[11px] text-slate-700">
                                  {pos.pepElement || editPoPep || '-'}
                                </td>
                                <td className="p-2.5 font-mono text-[11px] text-slate-500">
                                  {pos.costCenter || editPoCeco || '-'}
                                </td>
                                <td className="p-2.5 text-center">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeletePoPosition(idx);
                                    }}
                                    className="p-1 rounded transition-colors text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                                    title={
                                      editingPoPositions.length <= 1
                                        ? "Eliminar esta última posición anulará la Orden de Compra"
                                        : "Eliminar esta posición"
                                    }
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300 text-slate-800">
                          <tr>
                            <td colSpan={6} className="p-2.5 text-right font-mono text-xs">
                              LÍNEA DE TOTALES Σ ALV ({editingPoPositions.length} Posiciones):
                            </td>
                            <td className="p-2.5 text-right font-mono text-xs text-slate-900">
                              {totalPoHours.toLocaleString()} HUR
                            </td>
                            <td className="p-2.5 text-right font-mono text-xs text-slate-500">
                              @ {formatCurrency(avgPoRate, editingPo.currency, editingPo.currencySymbol)}
                            </td>
                            <td className="p-2.5 text-right font-mono text-xs text-purple-900">
                              {formatCurrency(totalPoNet, editingPo.currency, editingPo.currencySymbol)}
                            </td>
                            <td colSpan={3} />
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* Card 3: Formulario de Detalle de Posición Activa Seleccionada */}
                  {activePoPos && (
                    <div className="border border-purple-200 bg-purple-50/40 rounded-xl p-4 space-y-3 animate-in fade-in">
                      <div className="flex items-center justify-between border-b border-purple-200/60 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-purple-600 text-white">
                            Posición {String(activePoPos.positionNumber || (activePoPosIndex + 1) * 10).padStart(5, '0')}
                          </span>
                          <h4 className="font-bold text-slate-800 text-xs flex items-center gap-2">
                            <span>Detalle de Posición Seleccionada en el ALV</span>
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1">
                              <Edit2 className="w-3 h-3 text-emerald-700" />
                              <span>Posición Abierta para Edición</span>
                            </span>
                          </h4>
                        </div>
                        <span className="text-[11px] font-mono font-bold text-purple-900">
                          Subtotal Posición: {activePoPos.hours} hrs @ {formatCurrency((Number(activePoPos.hours) || 0) * (Number(activePoPos.hourlyRate) || 0), editingPo.currency, editingPo.currencySymbol)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="font-bold text-slate-700 block mb-1">Texto Breve / Denominación del Servicio</label>
                          <input
                            type="text"
                            required
                            list="sap-specialties-datalist"
                            value={activePoPos.roleTitle || ''}
                            onChange={e => handleUpdatePoPosition(activePoPosIndex, { roleTitle: e.target.value })}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-800 font-medium focus:border-purple-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Módulo SAP</label>
                          <input
                            type="text"
                            value={activePoPos.moduleCode || ''}
                            onChange={e => handleUpdatePoPosition(activePoPosIndex, { moduleCode: e.target.value })}
                            placeholder="Ej: DEV_ABAP, SAP_MM"
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-800 font-mono focus:border-purple-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Cantidad de Horas (HUR)</label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={activePoPos.hours || 0}
                            onChange={e => handleUpdatePoPosition(activePoPosIndex, { hours: Number(e.target.value) })}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-800 font-bold focus:border-purple-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Tarifa por Hora</label>
                          <input
                            type="number"
                            required
                            min="0"
                            step="any"
                            value={activePoPos.hourlyRate || 0}
                            onChange={e => handleUpdatePoPosition(activePoPosIndex, { hourlyRate: Number(e.target.value) })}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-800 font-mono font-bold focus:border-purple-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Elemento PEP Posición</label>
                          <input
                            type="text"
                            value={activePoPos.pepElement || ''}
                            onChange={e => handleUpdatePoPosition(activePoPosIndex, { pepElement: e.target.value })}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-800 font-mono focus:border-purple-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Centro de Costo (CeCo)</label>
                          <input
                            type="text"
                            value={activePoPos.costCenter || ''}
                            onChange={e => handleUpdatePoPosition(activePoPosIndex, { costCenter: e.target.value })}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-800 font-mono focus:border-purple-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Card 4: Liquidación y Totales Financieros */}
                  <div className="bg-purple-50/80 border border-purple-200 rounded-xl p-3.5 space-y-1.5">
                    <div className="flex justify-between text-purple-900 font-medium">
                      <span>Subtotal Neto ({editingPoPositions.length} Posiciones ALV • {totalPoHours} HUR):</span>
                      <span className="font-mono font-bold">{formatCurrency(totalPoNet, editingPo.currency, editingPo.currencySymbol)}</span>
                    </div>
                    <div className="flex justify-between text-purple-900/80">
                      <span>IVA ({taxRate}%):</span>
                      <span className="font-mono">{formatCurrency(taxAmount, editingPo.currency, editingPo.currencySymbol)}</span>
                    </div>
                    <div className="flex justify-between text-purple-950 font-bold pt-1.5 border-t border-purple-200/80 text-sm">
                      <span>Total Orden de Compra:</span>
                      <span className="font-mono text-base">{formatCurrency(totalAmount, editingPo.currency, editingPo.currencySymbol)}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200 shrink-0">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="font-mono font-bold text-slate-700">SAP ME22N</span>
                    <span>•</span>
                    <span>Modificación de Orden de Compra y Líneas de Posición</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (editingPo) {
                          setPoToDelete(editingPo);
                        }
                      }}
                      className="px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl cursor-pointer flex items-center gap-1.5 transition-colors"
                      title="Anular y eliminar definitivamente esta Orden de Compra (libera la SOLPED)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Anular OC</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingPo(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Guardar Cambios en OC (ME22N)</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
