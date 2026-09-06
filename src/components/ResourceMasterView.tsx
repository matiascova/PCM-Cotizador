import React, { useState } from 'react';
import { 
  Users, 
  Layers, 
  DollarSign, 
  CheckCircle2, 
  Search, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Code2, 
  Server, 
  Cpu, 
  Settings,
  Plus,
  Globe2,
  MapPin,
  Edit2,
  Trash2,
  Filter,
  UserCheck,
  Check,
  Award,
  Briefcase,
  Eye,
  RotateCcw
} from 'lucide-react';
import { 
  SapCatalogModule, 
  getStoredModules, 
  saveStoredModules, 
  resetStoredModules, 
  getModuleBenchmarkRate 
} from '../data/sapModules';
import { SapModuleCode, SeniorityLevel, Professional } from '../types';
import { formatCurrency } from '../utils/calculations';
import { getBenchmarkRate, SupportedCurrency, CURRENCIES } from '../utils/currencies';
import { getStoredProfessionals, saveStoredProfessionals, getProfessionalRate } from '../data/professionals';
import { ProfessionalModal } from './ProfessionalModal';
import { ProfessionalDetailModal } from './ProfessionalDetailModal';
import { ModuleModal } from './ModuleModal';
import { ModuleDetailModal } from './ModuleDetailModal';

interface ResourceMasterViewProps {
  onNewQuoteWithModule?: (moduleCode: SapModuleCode) => void;
  onNewQuoteWithProfessional?: (professional: Professional) => void;
  professionals?: Professional[];
  onUpdateProfessionals?: (professionals: Professional[]) => void;
  modules?: SapCatalogModule[];
  onUpdateModules?: (modules: SapCatalogModule[]) => void;
}

export const ResourceMasterView: React.FC<ResourceMasterViewProps> = ({
  onNewQuoteWithModule,
  onNewQuoteWithProfessional,
  professionals: propProfessionals,
  onUpdateProfessionals,
  modules: propModules,
  onUpdateModules
}) => {
  // Professionals state
  const [localProfessionals, setLocalProfessionals] = useState<Professional[]>(() => {
    return propProfessionals || getStoredProfessionals();
  });
  const professionals = propProfessionals || localProfessionals;

  const setProfessionals = (newList: Professional[]) => {
    if (onUpdateProfessionals) {
      onUpdateProfessionals(newList);
    } else {
      setLocalProfessionals(newList);
      saveStoredProfessionals(newList);
    }
  };

  // Modules state
  const [localModules, setLocalModules] = useState<SapCatalogModule[]>(() => {
    return propModules || getStoredModules();
  });
  const modules = propModules || localModules;

  const setModules = (newList: SapCatalogModule[]) => {
    if (onUpdateModules) {
      onUpdateModules(newList);
    } else {
      setLocalModules(newList);
      saveStoredModules(newList);
    }
  };

  // Subtabs: 'professionals' (Catálogo de Profesionales) | 'modules' (Módulos & Perfiles)
  const [activeSubtab, setActiveSubtab] = useState<'professionals' | 'modules'>('professionals');
  
  // Professional filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<SupportedCurrency>('CLP');
  const [selectedModule, setSelectedModule] = useState<string>('ALL');
  const [selectedSeniority, setSelectedSeniority] = useState<string>('ALL');

  // Module filters
  const [moduleSearchTerm, setModuleSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modals for Professionals
  const [isProfModalOpen, setIsProfModalOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [viewingProfessional, setViewingProfessional] = useState<Professional | null>(null);

  // Modals for Modules
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<SapCatalogModule | null>(null);
  const [viewingModule, setViewingModule] = useState<SapCatalogModule | null>(null);

  // Handlers for Professionals
  const handleOpenCreateModal = () => {
    setEditingProfessional(null);
    setIsProfModalOpen(true);
  };

  const handleOpenEditModal = (prof: Professional) => {
    setEditingProfessional(prof);
    setIsProfModalOpen(true);
  };

  const handleViewProfessional = (prof: Professional) => {
    setViewingProfessional(prof);
  };

  const handleSaveProfessional = (saved: Professional) => {
    const exists = professionals.some(p => p.id === saved.id);
    let updated: Professional[];
    if (exists) {
      updated = professionals.map(p => p.id === saved.id ? saved : p);
    } else {
      updated = [saved, ...professionals];
    }
    setProfessionals(updated);
    setIsProfModalOpen(false);
    setEditingProfessional(null);
  };

  const handleDeleteProfessional = (id: string, name: string) => {
    if (confirm(`¿Desea eliminar a "${name}" del catálogo de profesionales?`)) {
      const updated = professionals.filter(p => p.id !== id);
      setProfessionals(updated);
      if (viewingProfessional?.id === id) {
        setViewingProfessional(null);
      }
    }
  };

  // Handlers for Modules / Profiles
  const handleOpenCreateModule = () => {
    setEditingModule(null);
    setIsModuleModalOpen(true);
  };

  const handleOpenEditModule = (mod: SapCatalogModule) => {
    setEditingModule(mod);
    setIsModuleModalOpen(true);
  };

  const handleViewModule = (mod: SapCatalogModule) => {
    setViewingModule(mod);
  };

  const handleSaveModule = (saved: SapCatalogModule) => {
    const exists = modules.some(m => m.code === saved.code);
    let updated: SapCatalogModule[];
    if (exists) {
      updated = modules.map(m => m.code === saved.code ? saved : m);
    } else {
      updated = [saved, ...modules];
    }
    setModules(updated);
    setIsModuleModalOpen(false);
    setEditingModule(null);
  };

  const handleDeleteModule = (code: string, name: string) => {
    if (confirm(`¿Desea eliminar el perfil/módulo "${name}" (${code}) del catálogo?`)) {
      const updated = modules.filter(m => m.code !== code);
      setModules(updated);
      if (viewingModule?.code === code) {
        setViewingModule(null);
      }
    }
  };

  const handleResetModules = () => {
    if (confirm('¿Desea restablecer el catálogo de módulos a los 10 módulos SAP predeterminados de fábrica?')) {
      const defaults = resetStoredModules();
      setModules(defaults);
    }
  };

  // Filtered Professionals
  const filteredProfessionals = professionals.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.roleTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.skills?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesModule = selectedModule === 'ALL' || p.moduleCode === selectedModule;
    const matchesSeniority = selectedSeniority === 'ALL' || p.seniority === selectedSeniority;

    return matchesSearch && matchesModule && matchesSeniority && p.active !== false;
  });

  // Unique module categories for filter
  const availableCategories = Array.from(new Set(modules.map(m => m.category || 'Otros'))).filter(Boolean);

  // Filtered Modules
  const filteredModules = modules.filter(m => {
    const matchesSearch = 
      m.code.toLowerCase().includes(moduleSearchTerm.toLowerCase()) ||
      m.name.toLowerCase().includes(moduleSearchTerm.toLowerCase()) ||
      m.description.toLowerCase().includes(moduleSearchTerm.toLowerCase()) ||
      m.shortName.toLowerCase().includes(moduleSearchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || m.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Statistics
  const totalPros = professionals.length;
  const availablePros = professionals.filter(p => p.status === 'Disponible').length;
  const averageRate = totalPros > 0 
    ? Math.round(professionals.reduce((sum, p) => sum + getProfessionalRate(p, selectedCurrency), 0) / totalPros)
    : 0;
  const uniqueModulesCount = new Set(professionals.map(p => p.moduleCode)).size;

  return (
    <div className="space-y-6">
      {/* Top Banner with Subtabs & Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Resource Master & Staffing Matrix
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                <Globe2 className="w-3 h-3" />
                Chile, México, Uruguay, Brasil, Colombia
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Catálogo de Profesionales, Módulos SAP y Perfiles Especializados
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Administre la nómina de especialistas y los perfiles de servicio (SAP, Community Manager, Consultoría). Configure tarifas horarias predeterminadas para evitar cálculos manuales.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleOpenCreateModal}
              className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Users className="w-4 h-4 text-blue-600" />
              <span>Nuevo Profesional</span>
            </button>

            <button
              onClick={handleOpenCreateModule}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Perfil / Módulo</span>
            </button>
          </div>
        </div>

        {/* Subtabs Bar + Currency Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          {/* Main Navigation Subtabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => setActiveSubtab('professionals')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSubtab === 'professionals'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Catálogo de Profesionales</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeSubtab === 'professionals' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-600'
              }`}>
                {professionals.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubtab('modules')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSubtab === 'modules'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Módulos SAP & Perfiles</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeSubtab === 'modules' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-600'
              }`}>
                {modules.length}
              </span>
            </button>
          </div>

          {/* Currency Tabs */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500 hidden md:inline">Moneda de Tarifa:</span>
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              {[
                { id: 'CLP', label: '🇨🇱 CLP' },
                { id: 'UF', label: '🇨🇱 UF' },
                { id: 'MXN', label: '🇲🇽 MXN' },
                { id: 'USD', label: '🇺🇸 USD' }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCurrency(tab.id as SupportedCurrency)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedCurrency === tab.id
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Consultores</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 mt-1">{totalPros}</div>
          <span className="text-[10px] text-slate-500">Especialistas registrados</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Disponibles</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-700 mt-1">{availablePros}</div>
          <span className="text-[10px] text-slate-500">Listos para asignación inmediata</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tarifa Media ({selectedCurrency})</span>
            <DollarSign className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono mt-1">
            {formatCurrency(averageRate, selectedCurrency)}/hr
          </div>
          <span className="text-[10px] text-slate-500">Promedio tarifario actual</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Perfiles en Catálogo</span>
            <ShieldCheck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 mt-1">{modules.length} Perfiles</div>
          <span className="text-[10px] text-slate-500">{uniqueModulesCount} módulos cubiertos</span>
        </div>
      </div>

      {/* =======================================================
          TAB 1: DIRECTORY OF PROFESSIONALS
          ======================================================= */}
      {activeSubtab === 'professionals' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
            <div className="sm:col-span-5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, cargo, código, habilidad o ciudad..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div className="sm:col-span-4">
              <select
                value={selectedModule}
                onChange={e => setSelectedModule(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              >
                <option value="ALL">Todos los Módulos ({professionals.length})</option>
                {modules.map(m => (
                  <option key={m.code} value={m.code}>
                    {m.code} - {m.shortName}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <select
                value={selectedSeniority}
                onChange={e => setSelectedSeniority(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              >
                <option value="ALL">Todos los Seniorities</option>
                <option value="Junior">Junior</option>
                <option value="Semi-Senior">Semi-Senior</option>
                <option value="Senior">Senior</option>
                <option value="Lead / Arquitecto">Lead / Arquitecto</option>
              </select>
            </div>
          </div>

          {/* Grid of Professionals Cards */}
          {filteredProfessionals.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <h3 className="text-sm font-bold text-slate-700">No se encontraron profesionales</h3>
              <p className="text-xs text-slate-500 mt-1">Pruebe ajustando los términos de búsqueda o registre un nuevo profesional.</p>
              <button
                onClick={handleOpenCreateModal}
                className="mt-4 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Registrar Profesional</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProfessionals.map(prof => {
                const currentRate = getProfessionalRate(prof, selectedCurrency);
                const ufRate = prof.rates.UF;
                const clpRate = prof.rates.CLP;
                const usdRate = prof.rates.USD;
                const mxnRate = prof.rates.MXN;

                return (
                  <div
                    key={prof.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all p-5 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Header: Code, Module, Status */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {prof.code}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            {prof.moduleCode.replace('SAP_', '')}
                          </span>
                        </div>

                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 ${
                          prof.status === 'Disponible'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : prof.status === 'Parcial'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            prof.status === 'Disponible' ? 'bg-emerald-500' : prof.status === 'Parcial' ? 'bg-amber-500' : 'bg-blue-500'
                          }`} />
                          {prof.status}
                        </span>
                      </div>

                      {/* Consultant Identity */}
                      <div 
                        onClick={() => handleViewProfessional(prof)}
                        className="flex items-start gap-3 cursor-pointer group"
                        title="Ver perfil completo"
                      >
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                          {prof.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-bold text-slate-900 leading-snug truncate group-hover:text-blue-700 transition-colors">
                            {prof.name}
                          </h3>
                          <p className="text-xs text-blue-700 font-semibold line-clamp-1 mt-0.5">
                            {prof.roleTitle}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                            <span className="flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" /> {prof.location}
                            </span>
                            <span>•</span>
                            <span className="shrink-0">{prof.seniority}</span>
                          </div>
                        </div>
                      </div>

                      {/* Primary Rate Box in Selected Currency */}
                      <div className="mt-3.5 p-3 bg-blue-50/50 rounded-xl border border-blue-200/80 flex items-center justify-between">
                        <div>
                          <span className="text-[9px] font-bold text-blue-700 uppercase tracking-wider block">
                            Tarifa Oficial ({selectedCurrency})
                          </span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-extrabold text-blue-950 font-mono">
                              {formatCurrency(currentRate, selectedCurrency)}
                            </span>
                            <span className="text-xs text-blue-600 font-medium">/ hr</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white text-slate-700 border border-blue-200 shadow-xs">
                          {prof.modality}
                        </span>
                      </div>

                      {/* All-Currency Multi-Tariff Matrix */}
                      <div className="mt-2.5 p-2 bg-slate-50 rounded-xl border border-slate-200/80 text-[10px] font-mono grid grid-cols-2 gap-1.5 text-slate-600">
                        <div>UF: <strong className="text-slate-900">{ufRate} UF</strong></div>
                        <div>CLP: <strong className="text-slate-900">${new Intl.NumberFormat('es-CL').format(clpRate)}</strong></div>
                        <div>USD: <strong className="text-slate-900">${usdRate}</strong></div>
                        <div>MXN: <strong className="text-slate-900">${new Intl.NumberFormat('es-MX').format(mxnRate)}</strong></div>
                      </div>

                      {/* Skills Chips */}
                      {prof.skills && prof.skills.length > 0 && (
                        <div className="mt-3">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                            Competencias Clave
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {prof.skills.slice(0, 4).map((skill, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/70"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Actions Bar */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleViewProfessional(prof)}
                          className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Visualizar ficha completa"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(prof)}
                          className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Editar ficha y tarifas"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProfessional(prof.id, prof.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar del catálogo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (onNewQuoteWithProfessional) {
                            onNewQuoteWithProfessional(prof);
                          } else if (onNewQuoteWithModule) {
                            onNewQuoteWithModule(prof.moduleCode);
                          }
                        }}
                        className="bg-white hover:bg-blue-600 text-blue-700 hover:text-white px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 hover:border-blue-600 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Cotizar Consultor</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =======================================================
          TAB 2: SAP MODULES & BENCHMARK PROFILES (CRUD COMPLETE)
          ======================================================= */}
      {activeSubtab === 'modules' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Filter & Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={moduleSearchTerm}
                  onChange={e => setModuleSearchTerm(e.target.value)}
                  placeholder="Buscar módulo o perfil (ej. Community Manager, MM, ABAP)..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="w-44">
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                >
                  <option value="ALL">Todas las Categorías</option>
                  {availableCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto">
              <button
                type="button"
                onClick={handleResetModules}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
                title="Restablecer a módulos predeterminados de fábrica"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleOpenCreateModule}
                className="px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Nuevo Perfil</span>
              </button>
            </div>
          </div>

          {/* Modules Grid */}
          {filteredModules.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              <Layers className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <h3 className="text-sm font-bold text-slate-700">No se encontraron perfiles o módulos</h3>
              <p className="text-xs text-slate-500 mt-1">Pruebe ajustando los filtros o registre un nuevo perfil como Community Manager.</p>
              <button
                onClick={handleOpenCreateModule}
                className="mt-4 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Crear Perfil en Catálogo</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredModules.map(mod => {
                const seniorRate = getModuleBenchmarkRate(mod, 'Senior', selectedCurrency);
                const leadRate = getModuleBenchmarkRate(mod, 'Lead / Arquitecto', selectedCurrency);
                const ssRate = getModuleBenchmarkRate(mod, 'Semi-Senior', selectedCurrency);

                return (
                  <div
                    key={mod.code}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all p-5 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            {mod.code}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {mod.category || 'Módulo'}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-slate-800 font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                          {formatCurrency(seniorRate, selectedCurrency)}/hr (Sr)
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div 
                        onClick={() => handleViewModule(mod)}
                        className="cursor-pointer group"
                        title="Ver detalle del perfil"
                      >
                        <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-blue-700 transition-colors">
                          {mod.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                          {mod.description}
                        </p>
                      </div>

                      {/* Rates matrix by Seniority in selected currency */}
                      <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] font-mono">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1 font-sans">
                          Matriz Tarifaria Benchmark ({selectedCurrency})
                        </span>
                        <div className="grid grid-cols-2 gap-1 text-slate-700">
                          <div>Semi-Sr: <strong className="text-slate-900">{formatCurrency(ssRate, selectedCurrency)}</strong></div>
                          <div>Senior: <strong className="text-blue-700">{formatCurrency(seniorRate, selectedCurrency)}</strong></div>
                          <div className="col-span-2">Lead / Arq: <strong className="text-slate-900">{formatCurrency(leadRate, selectedCurrency)}</strong></div>
                        </div>
                      </div>

                      {/* Typical Deliverables */}
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                          Alcance Típico
                        </span>
                        <ul className="space-y-1.5">
                          {mod.typicalDeliverables.slice(0, 3).map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                              <span className="line-clamp-1">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Bottom Actions Bar */}
                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleViewModule(mod)}
                          className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Visualizar ficha completa del módulo"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModule(mod)}
                          className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Modificar perfil y tarifas"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteModule(mod.code, mod.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar perfil del catálogo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => onNewQuoteWithModule && onNewQuoteWithModule(mod.code)}
                        className="bg-white px-3 py-1.5 text-xs font-bold text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg border border-slate-200 hover:border-blue-600 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Cotizar Módulo</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Operations Info Footer */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Globe2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>Oficina Central Santiago de Chile:</strong> Servicios profesionales prestados para clientes en Chile (CLP/UF), México (MXN), y Uruguay, Brasil y Colombia (USD).
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 shrink-0">
          <span>IVA Chile: 19%</span>
          <span>•</span>
          <span>IVA México: 16%</span>
          <span>•</span>
          <span>Exportación LatAm: 0% Exento</span>
        </div>
      </div>

      {/* Modals for Professionals */}
      <ProfessionalModal
        isOpen={isProfModalOpen}
        professional={editingProfessional}
        modules={modules}
        onClose={() => {
          setIsProfModalOpen(false);
          setEditingProfessional(null);
        }}
        onSave={handleSaveProfessional}
      />

      <ProfessionalDetailModal
        isOpen={!!viewingProfessional}
        professional={viewingProfessional}
        onClose={() => setViewingProfessional(null)}
        onEdit={prof => {
          setViewingProfessional(null);
          handleOpenEditModal(prof);
        }}
        onDelete={handleDeleteProfessional}
        onQuote={prof => {
          setViewingProfessional(null);
          if (onNewQuoteWithProfessional) {
            onNewQuoteWithProfessional(prof);
          } else if (onNewQuoteWithModule) {
            onNewQuoteWithModule(prof.moduleCode);
          }
        }}
      />

      {/* Modals for Modules / Profiles */}
      <ModuleModal
        isOpen={isModuleModalOpen}
        module={editingModule}
        onClose={() => {
          setIsModuleModalOpen(false);
          setEditingModule(null);
        }}
        onSave={handleSaveModule}
      />

      <ModuleDetailModal
        isOpen={!!viewingModule}
        module={viewingModule}
        onClose={() => setViewingModule(null)}
        onEdit={mod => {
          setViewingModule(null);
          handleOpenEditModule(mod);
        }}
        onDelete={handleDeleteModule}
        onQuote={code => {
          setViewingModule(null);
          if (onNewQuoteWithModule) {
            onNewQuoteWithModule(code);
          }
        }}
      />
    </div>
  );
};
