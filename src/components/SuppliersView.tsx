import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  Filter, 
  Lock, 
  Unlock, 
  Edit3, 
  Trash2, 
  ShieldAlert, 
  ShieldCheck, 
  Download, 
  RotateCcw, 
  Coins, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  CreditCard,
  Briefcase,
  ExternalLink,
  ChevronDown,
  LayoutGrid,
  List,
  UserCheck
} from 'lucide-react';
import { SupplierMasterItem, SupportedCurrency } from '../types';
import { 
  getStoredSuppliers, 
  saveStoredSuppliers, 
  createSupplier, 
  updateSupplier, 
  toggleBlockSupplier, 
  deleteSupplier, 
  resetToInitialSuppliers 
} from '../data/suppliersMaster';
import { SupplierModal } from './SupplierModal';

interface SuppliersViewProps {
  onSelectSupplierForProcurement?: (supplier: SupplierMasterItem) => void;
}

export const SuppliersView: React.FC<SuppliersViewProps> = ({
  onSelectSupplierForProcurement
}) => {
  const [suppliers, setSuppliers] = useState<SupplierMasterItem[]>(getStoredSuppliers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
  const [currencyFilter, setCurrencyFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<'all' | 'chile' | 'international'>('all');
  const [taxCategoryFilter, setTaxCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierMasterItem | null>(null);

  // Quick Block/Unblock Prompt Modal
  const [blockingTarget, setBlockingTarget] = useState<SupplierMasterItem | null>(null);
  const [blockingReasonInput, setBlockingReasonInput] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 4000);
  };

  const handleCreateNew = () => {
    setEditingSupplier(null);
    setIsModalOpen(true);
  };

  const handleEdit = (supp: SupplierMasterItem) => {
    setEditingSupplier(supp);
    setIsModalOpen(true);
  };

  const handleSaveSupplier = (savedItem: SupplierMasterItem) => {
    if (editingSupplier) {
      updateSupplier(savedItem.id, savedItem);
      showNotification(`Proveedor ${savedItem.legalName} actualizado con éxito.`);
    } else {
      createSupplier(savedItem);
      showNotification(`Nuevo proveedor ${savedItem.legalName} registrado en el Maestro SAP.`);
    }
    setSuppliers(getStoredSuppliers());
    setIsModalOpen(false);
    setEditingSupplier(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`¿Está seguro de eliminar al proveedor "${name}" del Maestro? Esta acción no se puede deshacer.`)) {
      deleteSupplier(id);
      setSuppliers(getStoredSuppliers());
      showNotification(`Proveedor "${name}" eliminado del Maestro.`);
    }
  };

  const handleOpenBlockModal = (supp: SupplierMasterItem) => {
    setBlockingTarget(supp);
    setBlockingReasonInput(supp.blockingReason || (supp.isBlocked ? '' : 'Inconcurrencia tributaria en SII o auditoría de compras'));
  };

  const handleConfirmToggleBlock = () => {
    if (!blockingTarget) return;
    const nextBlockedState = !blockingTarget.isBlocked;
    
    toggleBlockSupplier(
      blockingTarget.id, 
      nextBlockedState, 
      nextBlockedState ? (blockingReasonInput.trim() || 'Bloqueo administrativo de compras (SAP XK05)') : undefined,
      'Administrador de Compras SAP'
    );

    setSuppliers(getStoredSuppliers());
    showNotification(
      nextBlockedState 
        ? `Proveedor ${blockingTarget.legalName} ha sido BLOQUEADO para compras (SAP XK05).`
        : `Proveedor ${blockingTarget.legalName} ha sido DESBLOQUEADO y habilitado para compras.`
    );
    setBlockingTarget(null);
    setBlockingReasonInput('');
  };

  const handleResetData = () => {
    if (window.confirm('¿Desea restaurar el maestro de proveedores con los datos demo oficiales de Chile e Internacionales?')) {
      const reset = resetToInitialSuppliers();
      setSuppliers(reset);
      showNotification('Maestro de proveedores restaurado con datos de referencia.');
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Código SAP',
      'RUT / Tax ID',
      'Razón Social',
      'Nombre Fantasía',
      'Categoría Tributaria',
      'Tipo DTE',
      'Giro SII',
      'Comuna',
      'Ciudad',
      'País',
      'Moneda Cobro',
      'Tarifa Referencial',
      'Condiciones Pago',
      'Estado',
      'Motivo Bloqueo',
      'Contacto Nombre',
      'Contacto Email',
      'Contacto Teléfono'
    ];

    const rows = filteredSuppliers.map(s => [
      `"${s.vendorCode}"`,
      `"${s.taxId}"`,
      `"${s.legalName.replace(/"/g, '""')}"`,
      `"${(s.fantasyName || '').replace(/"/g, '""')}"`,
      `"${s.taxCategory}"`,
      `"${s.dteType}"`,
      `"${(s.businessActivity || '').replace(/"/g, '""')}"`,
      `"${s.comuna}"`,
      `"${s.city}"`,
      `"${s.country}"`,
      `"${s.billingCurrency}"`,
      `"${s.defaultHourlyRate || ''}"`,
      `"${s.paymentTerms}"`,
      `"${s.isBlocked ? 'BLOQUEADO' : 'ACTIVO'}"`,
      `"${(s.blockingReason || '').replace(/"/g, '""')}"`,
      `"${s.contactName}"`,
      `"${s.contactEmail}"`,
      `"${s.contactPhone}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Maestro_Proveedores_SAP_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      // Search term
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        s.legalName.toLowerCase().includes(term) ||
        (s.fantasyName && s.fantasyName.toLowerCase().includes(term)) ||
        s.taxId.toLowerCase().includes(term) ||
        s.vendorCode.toLowerCase().includes(term) ||
        (s.businessActivity && s.businessActivity.toLowerCase().includes(term)) ||
        (s.comuna && s.comuna.toLowerCase().includes(term));

      if (!matchesSearch) return false;

      // Status
      if (statusFilter === 'active' && s.isBlocked) return false;
      if (statusFilter === 'blocked' && !s.isBlocked) return false;

      // Currency
      if (currencyFilter !== 'all' && s.billingCurrency !== currencyFilter) return false;

      // Country
      if (countryFilter === 'chile' && s.country !== 'Chile') return false;
      if (countryFilter === 'international' && s.country === 'Chile') return false;

      // Tax Category
      if (taxCategoryFilter !== 'all' && s.taxCategory !== taxCategoryFilter) return false;

      return true;
    });
  }, [suppliers, searchTerm, statusFilter, currencyFilter, countryFilter, taxCategoryFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = suppliers.length;
    const active = suppliers.filter(s => !s.isBlocked).length;
    const blocked = suppliers.filter(s => s.isBlocked).length;
    const chile = suppliers.filter(s => s.country === 'Chile').length;
    const international = total - chile;
    const inUf = suppliers.filter(s => s.billingCurrency === 'UF').length;
    const inClp = suppliers.filter(s => s.billingCurrency === 'CLP').length;
    const inUsd = suppliers.filter(s => s.billingCurrency === 'USD').length;
    const inEur = suppliers.filter(s => s.billingCurrency === 'EUR').length;

    return { total, active, blocked, chile, international, inUf, inClp, inUsd, inEur };
  }, [suppliers]);

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-200">
      
      {/* Notice Banner */}
      {notice && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-xl p-3 flex items-center justify-between text-xs font-medium shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{notice}</span>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 border border-blue-700/50 font-semibold">
                SAP MM Vendor Master
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Transacciones XK01 · XK02 · XK03 · XK05
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-0.5">
              Maestro de Proveedores & Subcontratistas
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Base de datos integral con atributos tributarios SII Chile, facturación electrónica DTE, monedas de cobro (UF, CLP, USD, EUR) y gestión de bloqueo para compras.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Exportar base de datos a archivo CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Exportar (.csv)</span>
          </button>

          <button
            type="button"
            onClick={handleResetData}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Restaurar proveedores demo de referencia"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Restablecer Demo</span>
          </button>

          <button
            type="button"
            onClick={handleCreateNew}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nuevo Proveedor</span>
          </button>
        </div>
      </div>

      {/* KPI Ribbon: Métricas del Maestro de Proveedores */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Proveedores</span>
            <span className="text-lg font-bold text-slate-900 font-mono">{stats.total}</span>
          </div>
          <Building2 className="w-6 h-6 text-slate-400" />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-700 block">Activos en Compras</span>
            <span className="text-lg font-bold text-emerald-600 font-mono">{stats.active}</span>
          </div>
          <ShieldCheck className="w-6 h-6 text-emerald-500" />
        </div>

        <div className="bg-white border border-rose-200 bg-rose-50/40 rounded-xl p-3 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-rose-700 block">Bloqueados (XK05)</span>
            <span className="text-lg font-bold text-rose-600 font-mono">{stats.blocked}</span>
          </div>
          <Lock className="w-6 h-6 text-rose-500" />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Nacionales / Extranjeros</span>
            <div className="text-xs font-bold text-slate-800 font-mono mt-0.5">
              <span>🇨🇱 {stats.chile}</span>
              <span className="text-slate-300 mx-1">/</span>
              <span>🌐 {stats.international}</span>
            </div>
          </div>
          <Globe className="w-6 h-6 text-blue-500" />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex items-center justify-between col-span-2 sm:col-span-1">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Monedas de Cobro</span>
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-slate-700 mt-0.5">
              <span className="text-blue-700 bg-blue-50 px-1 rounded">UF:{stats.inUf}</span>
              <span className="text-emerald-700 bg-emerald-50 px-1 rounded">CLP:{stats.inClp}</span>
              <span className="text-purple-700 bg-purple-50 px-1 rounded">USD:{stats.inUsd}</span>
              {stats.inEur > 0 && <span className="text-amber-700 bg-amber-50 px-1 rounded">EUR:{stats.inEur}</span>}
            </div>
          </div>
          <Coins className="w-6 h-6 text-amber-500" />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col md:flex-row gap-2.5 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por RUT, Razón Social, Giro o Comuna..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700 focus:outline-hidden"
          >
            <option value="all">Todos los Estados</option>
            <option value="active">Solo Activos (Habilitados)</option>
            <option value="blocked">Solo Bloqueados (SAP XK05)</option>
          </select>

          {/* Currency Filter */}
          <select
            value={currencyFilter}
            onChange={e => setCurrencyFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700 focus:outline-hidden"
          >
            <option value="all">Todas las Monedas</option>
            <option value="UF">Cobran en UF 🇨🇱</option>
            <option value="CLP">Cobran en Pesos Chilenos (CLP) 🇨🇱</option>
            <option value="USD">Cobran en Dólares (USD) 🇺🇸</option>
            <option value="EUR">Cobran en Euros (EUR) 🇪🇺</option>
            <option value="MXN">Cobran en Pesos Mexicanos (MXN) 🇲🇽</option>
          </select>

          {/* Country Filter */}
          <select
            value={countryFilter}
            onChange={e => setCountryFilter(e.target.value as any)}
            className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700 focus:outline-hidden"
          >
            <option value="all">Todos los Países</option>
            <option value="chile">Nacionales (Chile)</option>
            <option value="international">Extranjeros (Internacionales)</option>
          </select>

          {/* Tax Category Filter */}
          <select
            value={taxCategoryFilter}
            onChange={e => setTaxCategoryFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700 focus:outline-hidden hidden sm:block"
          >
            <option value="all">Categorías SII</option>
            <option value="Primera Categoría">Primera Categoría (Empresas)</option>
            <option value="Segunda Categoría">Segunda Categoría (Honorarios)</option>
            <option value="No Domiciliado">No Domiciliados (Extranjeros)</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1 rounded ${viewMode === 'cards' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'}`}
              title="Vista de Tarjetas Detalladas"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1 rounded ${viewMode === 'table' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'}`}
              title="Vista de Grilla / Tabla SAP"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Supplier List Render */}
      {filteredSuppliers.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No se encontraron proveedores</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            No existen registros en el maestro de proveedores que coincidan con los filtros y término de búsqueda ingresados.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setCurrencyFilter('all');
              setCountryFilter('all');
              setTaxCategoryFilter('all');
            }}
            className="mt-3 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Limpiar Filtros
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {filteredSuppliers.map(supplier => {
            const isBlocked = supplier.isBlocked;

            return (
              <div 
                key={supplier.id}
                className={`bg-white border rounded-2xl p-4 transition-all hover:shadow-md flex flex-col justify-between ${
                  isBlocked 
                    ? 'border-rose-300 bg-rose-50/20 shadow-xs ring-1 ring-rose-200' 
                    : 'border-slate-200 shadow-xs'
                }`}
              >
                <div>
                  {/* Top Bar: SAP Code, Block status & Quick actions */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold border border-slate-200">
                        {supplier.vendorCode}
                      </span>
                      {isBlocked ? (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          BLOQUEADO XK05
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          ACTIVO
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500 font-medium">
                        {supplier.country === 'Chile' ? '🇨🇱 Chile' : `🌐 ${supplier.country}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenBlockModal(supplier)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          isBlocked 
                            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200' 
                            : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                        }`}
                        title={isBlocked ? 'Desbloquear proveedor para compras' : 'Bloquear proveedor para compras (SAP XK05)'}
                      >
                        {isBlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEdit(supplier)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200 cursor-pointer"
                        title="Modificar datos del proveedor"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(supplier.id, supplier.legalName)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200 cursor-pointer"
                        title="Eliminar proveedor del maestro"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Legal Name & Fantasy Name */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {supplier.legalName}
                    </h3>
                    {supplier.fantasyName && (
                      <p className="text-xs text-blue-700 font-medium">
                        {supplier.fantasyName}
                      </p>
                    )}
                  </div>

                  {/* Tributary Data Box (SII Chile / Invoice) */}
                  <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">
                        {supplier.isForeign ? 'Tax ID Extranjero:' : 'RUT Contribuyente (SII):'}
                      </span>
                      <span className="font-mono font-bold text-slate-900">
                        {supplier.taxId}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">Documento Tributario:</span>
                      <span className="text-[11px] font-semibold text-slate-700 truncate max-w-[200px]">
                        {supplier.dteType}
                      </span>
                    </div>

                    {supplier.businessActivity && (
                      <div className="pt-1 border-t border-slate-200">
                        <span className="text-[10px] text-slate-400 block">Giro Comercial SII:</span>
                        <p className="text-[11px] text-slate-700 line-clamp-1">
                          {supplier.siiActivityCode && <strong className="font-mono text-slate-900 mr-1">{supplier.siiActivityCode}</strong>}
                          {supplier.businessActivity}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 pt-0.5 text-[11px] text-slate-500">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {supplier.address} {supplier.comuna ? `· ${supplier.comuna}` : ''}
                      </span>
                    </div>
                  </div>

                  {/* Currency & Billing Box */}
                  <div className="mt-2.5 p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-blue-800 font-semibold block">Moneda de Cobro</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="px-2 py-0.5 bg-blue-600 text-white font-mono font-bold rounded-md text-xs">
                          {supplier.billingCurrency}
                        </span>
                        <span className="text-[11px] text-blue-900 font-medium">
                          {supplier.billingCurrency === 'UF' && 'Unidad de Fomento'}
                          {supplier.billingCurrency === 'CLP' && 'Pesos Chilenos'}
                          {supplier.billingCurrency === 'USD' && 'Dólares Estadounidenses'}
                          {supplier.billingCurrency === 'EUR' && 'Euros Unión Europea'}
                          {supplier.billingCurrency === 'MXN' && 'Pesos Mexicanos'}
                        </span>
                      </div>
                    </div>

                    {supplier.defaultHourlyRate && (
                      <div className="text-right">
                        <span className="text-[10px] text-blue-800 font-semibold block">Tarifa Referencial</span>
                        <span className="font-mono font-bold text-slate-900 text-xs">
                          {supplier.billingCurrency === 'CLP'
                            ? `$${supplier.defaultHourlyRate.toLocaleString('es-CL')}`
                            : `${supplier.defaultHourlyRate} ${supplier.billingCurrency}`} /hr
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Specialties chips */}
                  {supplier.specialties && supplier.specialties.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1">
                      {supplier.specialties.map(spec => (
                        <span 
                          key={spec}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200"
                        >
                          {spec.replace('DEV_', '').replace('SAP_', '')}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Block Warning Box if blocked */}
                  {isBlocked && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-rose-100/70 border border-rose-300 text-rose-900 text-xs space-y-0.5">
                      <div className="flex items-center gap-1 font-bold text-rose-800">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Bloqueado para Compras (SAP XK05)</span>
                      </div>
                      <p className="text-[11px] text-rose-800 italic">
                        "{supplier.blockingReason || 'Bloqueo administrativo registrado'}"
                      </p>
                      {supplier.blockedAt && (
                        <span className="text-[10px] text-rose-600 block">
                          Fecha: {supplier.blockedAt}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer of card: Contact info */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="truncate pr-2">
                    <span className="font-semibold text-slate-700 block truncate">{supplier.contactName}</span>
                    <span className="text-[11px] text-slate-400 block truncate">{supplier.contactEmail}</span>
                  </div>
                  {supplier.contactPhone && (
                    <span className="font-mono text-[11px] text-slate-600 shrink-0">
                      {supplier.contactPhone}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE / ALV GRID VIEW */
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-mono text-[11px] border-b border-slate-800">
                  <th className="py-2.5 px-3">Cód. SAP</th>
                  <th className="py-2.5 px-3">RUT / Tax ID</th>
                  <th className="py-2.5 px-3">Razón Social</th>
                  <th className="py-2.5 px-3">Categoría SII</th>
                  <th className="py-2.5 px-3">Moneda Cobro</th>
                  <th className="py-2.5 px-3">Tarifa /hr</th>
                  <th className="py-2.5 px-3">País / Comuna</th>
                  <th className="py-2.5 px-3">Contacto</th>
                  <th className="py-2.5 px-3">Estado SAP</th>
                  <th className="py-2.5 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSuppliers.map((supplier, idx) => {
                  const isBlocked = supplier.isBlocked;
                  return (
                    <tr 
                      key={supplier.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isBlocked ? 'bg-rose-50/30' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                      }`}
                    >
                      <td className="py-2 px-3 font-mono font-bold text-slate-700">
                        {supplier.vendorCode}
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {supplier.taxId}
                      </td>
                      <td className="py-2 px-3">
                        <span className="font-bold text-slate-900 block leading-tight">{supplier.legalName}</span>
                        {supplier.fantasyName && (
                          <span className="text-[10px] text-blue-600 block">{supplier.fantasyName}</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-[11px] text-slate-600 whitespace-nowrap">
                        {supplier.taxCategory}
                      </td>
                      <td className="py-2 px-3">
                        <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-blue-100 text-blue-800">
                          {supplier.billingCurrency}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono font-semibold text-slate-800 whitespace-nowrap">
                        {supplier.defaultHourlyRate
                          ? (supplier.billingCurrency === 'CLP' 
                              ? `$${supplier.defaultHourlyRate.toLocaleString('es-CL')}` 
                              : `${supplier.defaultHourlyRate} ${supplier.billingCurrency}`)
                          : '-'}
                      </td>
                      <td className="py-2 px-3 text-slate-600 whitespace-nowrap">
                        <span>{supplier.country === 'Chile' ? '🇨🇱' : '🌐'} {supplier.country}</span>
                        {supplier.comuna && <span className="text-[10px] text-slate-400 block">{supplier.comuna}</span>}
                      </td>
                      <td className="py-2 px-3">
                        <span className="font-semibold text-slate-800 block text-[11px]">{supplier.contactName}</span>
                        <span className="text-[10px] text-slate-500 block truncate max-w-[140px]">{supplier.contactEmail}</span>
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        {isBlocked ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-mono font-bold text-[10px] flex items-center gap-1 w-fit">
                            <Lock className="w-2.5 h-2.5" /> BLOQUEADO
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px] flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-2.5 h-2.5" /> ACTIVO
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenBlockModal(supplier)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              isBlocked 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                            title={isBlocked ? 'Desbloquear proveedor' : 'Bloquear proveedor (SAP XK05)'}
                          >
                            {isBlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEdit(supplier)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Editar proveedor"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(supplier.id, supplier.legalName)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar proveedor"
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
        </div>
      )}

      {/* MODAL 1: Crear / Modificar Proveedor */}
      {isModalOpen && (
        <SupplierModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingSupplier(null);
          }}
          onSave={handleSaveSupplier}
          supplierToEdit={editingSupplier}
        />
      )}

      {/* MODAL 2: Confirmar Bloqueo / Desbloqueo SAP XK05 */}
      {blockingTarget && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-3 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${blockingTarget.isBlocked ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {blockingTarget.isBlocked ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  Transacción SAP XK05
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {blockingTarget.isBlocked ? 'Desbloquear Proveedor' : 'Bloquear Proveedor para Compras'}
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              {blockingTarget.isBlocked ? (
                <>
                  ¿Desea desbloquear a <strong>{blockingTarget.legalName}</strong>? El proveedor volverá a estar habilitado para la emisión de SOLPEDs (ME51N) y Órdenes de Compra (ME21N).
                </>
              ) : (
                <>
                  Al bloquear a <strong>{blockingTarget.legalName}</strong> ({blockingTarget.taxId}), no se podrán generar nuevas solicitudes de pedido ni órdenes de compra asociadas a este proveedor.
                </>
              )}
            </p>

            {!blockingTarget.isBlocked && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Motivo del Bloqueo (Obligatorio)
                </label>
                <textarea
                  rows={3}
                  required
                  value={blockingReasonInput}
                  onChange={e => setBlockingReasonInput(e.target.value)}
                  placeholder="Ej. Inconcurrencia tributaria en el SII, incumplimiento de contrato o auditoría interna..."
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-hidden font-medium"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setBlockingTarget(null)}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmToggleBlock}
                className={`px-4 py-2 text-xs font-bold rounded-xl text-white transition-colors cursor-pointer shadow-sm ${
                  blockingTarget.isBlocked 
                    ? 'bg-emerald-600 hover:bg-emerald-700' 
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {blockingTarget.isBlocked ? 'Confirmar Desbloqueo' : 'Confirmar Bloqueo (XK05)'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
