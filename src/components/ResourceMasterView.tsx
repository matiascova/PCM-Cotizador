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
  Briefcase
} from 'lucide-react';
import { SAP_CATALOG_MODULES } from '../data/sapModules';
import { SapModuleCode, SeniorityLevel, Professional } from '../types';
import { formatCurrency } from '../utils/calculations';
import { getBenchmarkRate, SupportedCurrency, CURRENCIES } from '../utils/currencies';
import { getStoredProfessionals, saveStoredProfessionals, getProfessionalRate } from '../data/professionals';
import { ProfessionalModal } from './ProfessionalModal';

interface ResourceMasterViewProps {
  onNewQuoteWithModule?: (moduleCode: SapModuleCode) => void;
  onNewQuoteWithProfessional?: (professional: Professional) => void;
  professionals?: Professional[];
  onUpdateProfessionals?: (professionals: Professional[]) => void;
}

export const ResourceMasterView: React.FC<ResourceMasterViewProps> = ({
  onNewQuoteWithModule,
  onNewQuoteWithProfessional,
  professionals: propProfessionals,
  onUpdateProfessionals
}) => {
  // Local state if not provided from parent
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

  // Subtabs: 'professionals' (Catálogo de Profesionales) | 'modules' (Matriz de Módulos SAP)
  const [activeSubtab, setActiveSubtab] = useState<'professionals' | 'modules'>('professionals');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<SupportedCurrency>('CLP');
  const [selectedModule, setSelectedModule] = useState<string>('ALL');
  const [selectedSeniority, setSelectedSeniority] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);

  // Handlers for Professionals
  const handleOpenCreateModal = () => {
    setEditingProfessional(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prof: Professional) => {
    setEditingProfessional(prof);
    setIsModalOpen(true);
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
    setIsModalOpen(false);
    setEditingProfessional(null);
  };

  const handleDeleteProfessional = (id: string, name: string) => {
    if (confirm(`¿Desea eliminar a ${name} del catálogo de profesionales?`)) {
      const updated = professionals.filter(p => p.id !== id);
      setProfessionals(updated);
    }
  };

  // Filtered lists
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

  const filteredModules = SAP_CATALOG_MODULES.filter(m => 
    m.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Statistics
  const totalPros = professionals.length;
  const availablePros = professionals.filter(p => p.status === 'Disponible').length;
  const averageRate = totalPros > 0 
    ? Math.round(professionals.reduce((sum, p) => sum + getProfessionalRate(p, selectedCurrency), 0) / totalPros)
    : 0;
  const uniqueModules = new Set(professionals.map(p => p.moduleCode)).size;

  return (
    <div className="space-y-6">
      {/* Top Banner with Subtabs & Currency Switcher */}
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
              Catálogo de Profesionales, Consultores y Tarifas SAP
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Administre la nómina de especialistas certificados y sus tarifas horarias preestablecidas para agilizar el ingreso y evitar cálculos manuales en las cotizaciones.
            </p>
          </div>

          {/* Action: + Nuevo Profesional */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Profesional</span>
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
              <span>Módulos SAP & Benchmark</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeSubtab === 'modules' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-600'
              }`}>
                {SAP_CATALOG_MODULES.length}
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
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Módulos Cubiertos</span>
            <ShieldCheck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 mt-1">{uniqueModules} / 10</div>
          <span className="text-[10px] text-slate-500">Módulos funcionales y técnicos</span>
        </div>
      </div>

      {/* =======================================================
          TAB 1: DIRECTORY OF PROFESSIONALS (PRIMARY REQUEST)
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
                {SAP_CATALOG_MODULES.map(m => (
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
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {prof.code}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            {prof.moduleCode.replace('SAP_', '')}
                          </span>
                        </div>

                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
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
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                          {prof.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-bold text-slate-900 leading-snug truncate">
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
          TAB 2: SAP MODULES BENCHMARK MATRIX (PRESERVED)
          ======================================================= */}
      {activeSubtab === 'modules' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-slate-700">
                Tarifas de Referencia de Mercado para Módulos Estándar SAP S/4HANA
              </span>
            </div>
            <span className="text-slate-400">Mostrando {filteredModules.length} módulos</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredModules.map(mod => {
              const seniorRate = getBenchmarkRate(mod.code, 'Senior', selectedCurrency);
              const leadRate = getBenchmarkRate(mod.code, 'Lead / Arquitecto', selectedCurrency);
              const ssRate = getBenchmarkRate(mod.code, 'Semi-Senior', selectedCurrency);

              return (
                <div
                  key={mod.code}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        {mod.code}
                      </span>
                      <span className="text-xs font-bold text-slate-800 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {formatCurrency(seniorRate, selectedCurrency)}/hr (Sr)
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {mod.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {mod.description}
                    </p>

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

                  {/* Bottom Quick Action */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Seniority Sugerido: <strong className="text-slate-700">Senior</strong>
                    </span>
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
        </div>
      )}

      {/* Operations Info Footer */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Globe2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>Oficina Central Santiago de Chile:</strong> Servicios de consultoría SAP prestados para clientes en Chile (CLP/UF), México (MXN), y Uruguay, Brasil y Colombia (USD).
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

      {/* Modal to Create / Edit Professional */}
      <ProfessionalModal
        isOpen={isModalOpen}
        professional={editingProfessional}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProfessional(null);
        }}
        onSave={handleSaveProfessional}
      />
    </div>
  );
};
