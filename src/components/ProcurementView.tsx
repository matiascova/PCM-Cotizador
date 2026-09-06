import React, { useState } from 'react';
import { 
  ShoppingBag, 
  FileText, 
  CheckCircle2, 
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
  FileSpreadsheet
} from 'lucide-react';
import { 
  Quotation, 
  ServicePurchaseRequisition, 
  ServicePurchaseOrder, 
  ServiceEntrySheet,
  SolpedStatus,
  PurchaseOrderStatus
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
  authorizePurchaseOrder,
  rejectPurchaseOrder,
  getSolpedPositions,
  saveSolpedPositions,
  addPositionToSolped,
  deleteSolpedPosition
} from '../services/procurementService';
import { formatCurrency } from '../utils/calculations';

interface ProcurementViewProps {
  quotations: Quotation[];
  onSelectQuotation?: (quote: Quotation) => void;
  onOpenNewQuotation?: () => void;
}

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

  // ALV controls
  const [showAlvTotals, setShowAlvTotals] = useState<boolean>(true);
  const [sortField, setSortField] = useState<'solped' | 'position' | 'amount' | 'hours' | 'supplier'>('solped');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Delete SOLPED state
  const [solpedToDelete, setSolpedToDelete] = useState<ServicePurchaseRequisition | null>(null);

  // Edit PO state
  const [editingPo, setEditingPo] = useState<ServicePurchaseOrder | null>(null);
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
  };

  // Save Edit PO (ME22N)
  const handleSaveEditPo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPo) return;

    const updated = updatePurchaseOrder(editingPo.id, {
      supplierName: editPoSupplierName,
      supplierTaxId: editPoSupplierTaxId,
      supplierEmail: editPoSupplierEmail,
      supplierContact: editPoSupplierContact,
      paymentTerms: editPoPaymentTerms,
      roleTitle: editPoRoleTitle,
      hoursContracted: Number(editPoHours) || 0,
      hourlyRate: Number(editPoRate) || 0,
      pepElement: editPoPep,
      costCenter: editPoCeco,
      estimatedDeliveryDate: editPoDeliveryDate,
      buyerNotes: editPoBuyerNotes
    });

    if (updated) {
      reloadData();
      setEditingPo(null);
      if (poForPrint?.id === editingPo.id) {
        setPoForPrint(updated);
      }
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
      {/* Top Banner SAP MM */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-blue-900/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-6 h-6 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  SAP MM • PROCUREMENT DE SERVICIOS
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Posición tipo 'D' (Servicios) • Imputación PEP 'P'
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
                Gestión de Compras, SOLPEDs & Órdenes de Compra
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
                Trazabilidad oficial de subcontratación de consultores externos: generación de Solicitud de Pedido (ME51N), 
                estrategia de liberación (ME54N), emisión de Pedido/OC (ME21N) y registro de Hojas de Entrada de Servicios (ML81N).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={reloadData}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Actualizar Datos
            </button>
          </div>
        </div>

        {/* Procurement KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
            <span className="text-[11px] text-slate-400 font-medium block">Total SOLPEDs (ME51N)</span>
            <span className="text-xl font-bold text-white mt-0.5 block">{solpeds.length}</span>
            <span className="text-[10px] text-blue-300">Requerimientos de servicio</span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
            <span className="text-[11px] text-slate-400 font-medium block">Pendientes Liberar (ME54N)</span>
            <span className="text-xl font-bold text-amber-400 mt-0.5 block">{pendingReleaseCount}</span>
            <span className="text-[10px] text-slate-400">Requieren aprobación</span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
            <span className="text-[11px] text-slate-400 font-medium block">Aprobadas / Por Comprar</span>
            <span className="text-xl font-bold text-emerald-400 mt-0.5 block">{approvedSolpedsCount}</span>
            <span className="text-[10px] text-emerald-300">Listas para emitir OC</span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
            <span className="text-[11px] text-slate-400 font-medium block">Órdenes de Compra (ME21N)</span>
            <span className="text-xl font-bold text-purple-400 mt-0.5 block">{activePosCount}</span>
            <span className="text-[10px] text-slate-400">Pedidos adjudicados</span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 col-span-2 sm:col-span-1">
            <span className="text-[11px] text-slate-400 font-medium block">Horas Subcontratadas</span>
            <span className="text-xl font-bold text-blue-400 mt-0.5 block">{totalSubcontractedHours} hrs</span>
            <span className="text-[10px] text-slate-400">Esfuerzo externo</span>
          </div>
        </div>
      </div>

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

              <div className="flex items-center gap-2">
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

      {/* MODAL 1: CONVERT SOLPED TO PURCHASE ORDER (ME21N) */}
      {solpedToConvert && (
        <div 
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in"
          onClick={() => setSolpedToConvert(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Emitir Orden de Compra de Servicio (ME21N)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Con referencia a Solicitud de Pedido SOLPED #{solpedToConvert.solpedNumber}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSolpedToConvert(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmConvert} className="space-y-4 text-xs">
              <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-3.5 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Servicio Subcontratado:</span>
                  <span className="font-bold text-slate-900">{solpedToConvert.roleTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cotización & Proyecto:</span>
                  <span className="font-medium text-slate-800">{solpedToConvert.quotationCode} • {solpedToConvert.clientCompanyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Imputación PEP:</span>
                  <span className="font-mono text-purple-900 font-bold">{solpedToConvert.pepElement}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-purple-200/60 font-bold">
                  <span>Total Contratado:</span>
                  <span className="text-purple-900 font-mono text-sm">
                    {solpedToConvert.hours} hrs @ {formatCurrency(solpedToConvert.totalAmount, solpedToConvert.currency, solpedToConvert.currencySymbol)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Razón Social Proveedor / Contratista</label>
                  <input
                    type="text"
                    required
                    value={convertSupplierName}
                    onChange={e => setConvertSupplierName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">RUT / Tax ID Proveedor</label>
                  <input
                    type="text"
                    value={convertSupplierTaxId}
                    onChange={e => setConvertSupplierTaxId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-mono focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Proveedor / Contacto</label>
                  <input
                    type="email"
                    value={convertSupplierEmail}
                    onChange={e => setConvertSupplierEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Condiciones de Pago</label>
                  <input
                    type="text"
                    value={convertPaymentTerms}
                    onChange={e => setConvertPaymentTerms(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Observaciones del Comprador</label>
                <textarea
                  rows={2}
                  value={convertBuyerNotes}
                  onChange={e => setConvertBuyerNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
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
            </form>
          </div>
        </div>
      )}

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
                {/* ALV Toolbar Controls */}
                <div className="bg-slate-100/90 border border-slate-200 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <TableIcon className="w-4 h-4 text-blue-700" />
                    <span className="font-bold text-slate-800 text-xs">Listado ALV de Posiciones (ME52N)</span>
                    <span className="text-[11px] text-slate-500 hidden sm:inline">
                      • Haz clic sobre cualquier fila para editar sus detalles
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Insertar Nueva Posición */}
                    <button
                      type="button"
                      onClick={handleInsertPositionInModal}
                      className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                      title="Agregar una nueva línea de posición a la SOLPED (incremento de 10 en 10)"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Insertar Posición</span>
                    </button>

                    {/* Eliminar Posición Seleccionada */}
                    <button
                      type="button"
                      disabled={editingSolpedPositions.length <= 1 || isActivePosLocked}
                      onClick={() => activePos && handleDeletePositionInModal(activePos.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-colors flex items-center gap-1 shadow-2xs ${
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
                      <span>- Borrar Posición</span>
                    </button>

                    {/* Exportar ALV a CSV */}
                    <button
                      type="button"
                      onClick={() => handleExportCsv(editingSolpedPositions, `posiciones_solped_${editingSolped.solpedNumber}.csv`)}
                      className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                      title="Descargar listado ALV a CSV"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Exportar ALV (.csv)</span>
                    </button>
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
                          {formatCurrency(modalTotalNet, editingSolped.currency, editingSolped.currencySymbol)}
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
                        <label className="font-bold text-slate-700 block mb-1">Servicio / Perfil de Consultoría</label>
                        <input
                          type="text"
                          required
                          disabled={isActivePosLocked}
                          value={activePos.roleTitle || ''}
                          onChange={e => handleUpdateActivePosition('roleTitle', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-xl font-medium focus:outline-none transition-colors ${
                            isActivePosLocked 
                              ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed' 
                              : 'bg-white text-slate-800 border-slate-300 focus:ring-1 focus:ring-blue-500'
                          }`}
                        />
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
                        <label className="font-bold text-slate-700 block mb-1">Tarifa Compra / Hora</label>
                        <input
                          type="number"
                          required
                          min="0"
                          disabled={isActivePosLocked}
                          value={activePos.hourlyRate || 0}
                          onChange={e => handleUpdateActivePosition('hourlyRate', Math.max(0, Number(e.target.value) || 0))}
                          className={`w-full px-3 py-2 border rounded-xl font-mono font-bold focus:outline-none transition-colors ${
                            isActivePosLocked 
                              ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed' 
                              : 'bg-white text-slate-800 border-slate-300 focus:ring-1 focus:ring-blue-500'
                          }`}
                        />
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
                    {modalTotalHours.toLocaleString()} hrs @ {formatCurrency(modalTotalNet, editingSolped.currency, editingSolped.currencySymbol)}
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

      {/* MODAL 7: EDIT PURCHASE ORDER (ME22N) */}
      {editingPo && (() => {
        const net = (Number(editPoHours) || 0) * (Number(editPoRate) || 0);
        const taxRate = editingPo.taxRatePercentage || 19;
        const tax = Math.round(net * (taxRate / 100));
        const total = net + tax;

        return (
          <div 
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setEditingPo(null)}
          >
            <div 
              className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 p-6 space-y-4 my-8"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
                    <Edit2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Modificar Orden de Compra (ME22N) #{editingPo.poNumber}
                    </h3>
                    <p className="text-xs text-slate-500">
                      SOLPED Base: {editingPo.solpedNumber} • Proyecto: {editingPo.quotationCode}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setEditingPo(null)} 
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEditPo} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Razón Social Proveedor / Contratista</label>
                    <input
                      type="text"
                      required
                      value={editPoSupplierName}
                      onChange={e => setEditPoSupplierName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">RUT / Identificador Fiscal</label>
                    <input
                      type="text"
                      value={editPoSupplierTaxId}
                      onChange={e => setEditPoSupplierTaxId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-mono focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Email Proveedor / Contacto</label>
                    <input
                      type="email"
                      value={editPoSupplierEmail}
                      onChange={e => setEditPoSupplierEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Contacto Comercial / KAM</label>
                    <input
                      type="text"
                      value={editPoSupplierContact}
                      onChange={e => setEditPoSupplierContact(e.target.value)}
                      placeholder="Ej: Juan Pérez"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Servicio Contratado</label>
                    <input
                      type="text"
                      required
                      value={editPoRoleTitle}
                      onChange={e => setEditPoRoleTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Horas Contratadas</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={editPoHours}
                      onChange={e => setEditPoHours(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-bold focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Tarifa por Hora</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={editPoRate}
                      onChange={e => setEditPoRate(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-mono font-bold focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Elemento PEP</label>
                    <input
                      type="text"
                      value={editPoPep}
                      onChange={e => setEditPoPep(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-mono focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Centro de Costo (CeCo)</label>
                    <input
                      type="text"
                      value={editPoCeco}
                      onChange={e => setEditPoCeco(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-mono focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Fecha Entrega Estimada</label>
                    <input
                      type="date"
                      value={editPoDeliveryDate}
                      onChange={e => setEditPoDeliveryDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Condiciones de Pago</label>
                  <input
                    type="text"
                    value={editPoPaymentTerms}
                    onChange={e => setEditPoPaymentTerms(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Observaciones del Comprador</label>
                  <textarea
                    rows={2}
                    value={editPoBuyerNotes}
                    onChange={e => setEditPoBuyerNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Calculation Summary */}
                <div className="bg-purple-50/80 border border-purple-200 rounded-xl p-3 space-y-1">
                  <div className="flex justify-between text-purple-900 font-medium">
                    <span>Subtotal Neto:</span>
                    <span className="font-mono">{formatCurrency(net, editingPo.currency, editingPo.currencySymbol)}</span>
                  </div>
                  <div className="flex justify-between text-purple-900/80">
                    <span>IVA ({taxRate}%):</span>
                    <span className="font-mono">{formatCurrency(tax, editingPo.currency, editingPo.currencySymbol)}</span>
                  </div>
                  <div className="flex justify-between text-purple-950 font-bold pt-1 border-t border-purple-200/60 text-sm">
                    <span>Total Orden de Compra:</span>
                    <span className="font-mono">{formatCurrency(total, editingPo.currency, editingPo.currencySymbol)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setEditingPo(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Guardar Cambios en OC (ME22N)</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
