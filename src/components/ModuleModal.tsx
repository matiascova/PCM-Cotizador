import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Layers, 
  DollarSign, 
  Sparkles, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Tag, 
  Info,
  Briefcase
} from 'lucide-react';
import { SapCatalogModule } from '../data/sapModules';
import { SeniorityLevel } from '../types';

interface ModuleModalProps {
  isOpen: boolean;
  module: SapCatalogModule | null; // null if creating
  onClose: () => void;
  onSave: (module: SapCatalogModule) => void;
}

const CATEGORY_OPTIONS = [
  'Funcional',
  'Técnico',
  'Gestión',
  'Marketing / Digital',
  'Consultoría',
  'Infraestructura / Cloud'
];

export const ModuleModal: React.FC<ModuleModalProps> = ({
  isOpen,
  module,
  onClose,
  onSave
}) => {
  const isEditing = !!module;

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [shortName, setShortName] = useState('');
  const [category, setCategory] = useState('Funcional');
  const [description, setDescription] = useState('');
  const [defaultResponsibilities, setDefaultResponsibilities] = useState('');
  
  // Deliverables
  const [deliverables, setDeliverables] = useState<string[]>([]);
  const [newDeliverableInput, setNewDeliverableInput] = useState('');

  // Benchmark Rates in USD
  const [rateJunior, setRateJunior] = useState<number>(45);
  const [rateSemiSenior, setRateSemiSenior] = useState<number>(65);
  const [rateSenior, setRateSenior] = useState<number>(90);
  const [rateLead, setRateLead] = useState<number>(125);

  useEffect(() => {
    if (module) {
      setName(module.name);
      setCode(module.code);
      setShortName(module.shortName);
      setCategory(module.category || 'Funcional');
      setDescription(module.description || '');
      setDefaultResponsibilities(module.defaultResponsibilities || '');
      setDeliverables(module.typicalDeliverables || []);
      setRateJunior(module.benchmarkRatesUSD?.Junior ?? 45);
      setRateSemiSenior(module.benchmarkRatesUSD?.['Semi-Senior'] ?? 65);
      setRateSenior(module.benchmarkRatesUSD?.Senior ?? 90);
      setRateLead(module.benchmarkRatesUSD?.['Lead / Arquitecto'] ?? 125);
    } else {
      // Defaults for a new profile
      setName('');
      setCode('');
      setShortName('');
      setCategory('Gestión');
      setDescription('');
      setDefaultResponsibilities('');
      setDeliverables(['Plan de Trabajo y Cronograma', 'Entregable de Diagnóstico', 'Informe Ejecutivo de Resultados']);
      setRateJunior(35);
      setRateSemiSenior(55);
      setRateSenior(80);
      setRateLead(110);
    }
  }, [module, isOpen]);

  if (!isOpen) return null;

  // Auto-generate code and shortName when name changes in create mode
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing && !code) {
      const generatedCode = val
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '_')
        .replace(/_+/g, '_');
      setCode(generatedCode);
    }
    if (!isEditing && !shortName) {
      const words = val.trim().split(' ').filter(Boolean);
      if (words.length === 1) {
        setShortName(words[0].slice(0, 3).toUpperCase());
      } else if (words.length > 1) {
        setShortName(words.map(w => w[0]).join('').toUpperCase().slice(0, 4));
      }
    }
  };

  const handleAddDeliverable = () => {
    if (newDeliverableInput.trim()) {
      setDeliverables([...deliverables, newDeliverableInput.trim()]);
      setNewDeliverableInput('');
    }
  };

  const handleRemoveDeliverable = (index: number) => {
    setDeliverables(deliverables.filter((_, i) => i !== index));
  };

  // Presets
  const applyPreset = (preset: 'sap' | 'digital' | 'pmo') => {
    if (preset === 'sap') {
      setRateJunior(45);
      setRateSemiSenior(65);
      setRateSenior(90);
      setRateLead(125);
    } else if (preset === 'digital') {
      setRateJunior(30);
      setRateSemiSenior(45);
      setRateSenior(65);
      setRateLead(95);
      if (!description && name.toLowerCase().includes('community')) {
        setDescription('Estrategia integral de contenidos, gestión de redes sociales, construcción de comunidad y monitoreo de métricas de engagement digital.');
        setDefaultResponsibilities('Creación de calendario editorial, moderación activa de canales, análisis de sentimiento, reporte mensual de KPIs y coordinación con equipos creativos.');
        setDeliverables(['Plan de Contenidos Mensual', 'Reporte Mensual de Métricas & ROI', 'Guía de Tono y Respuestas Frecuentes']);
      }
    } else if (preset === 'pmo') {
      setRateJunior(40);
      setRateSemiSenior(60);
      setRateSenior(85);
      setRateLead(120);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Por favor ingrese el nombre del perfil o módulo.');
      return;
    }
    if (!code.trim()) {
      alert('Por favor ingrese un código identificador único.');
      return;
    }

    const savedModule: SapCatalogModule = {
      id: module?.id || `mod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      shortName: shortName.trim() || name.slice(0, 3).toUpperCase(),
      category: category.trim(),
      description: description.trim() || `Perfil especializado en ${name.trim()}`,
      defaultResponsibilities: defaultResponsibilities.trim() || `Consultoría y ejecución de actividades correspondientes al perfil ${name.trim()}`,
      typicalDeliverables: deliverables.length > 0 ? deliverables : ['Entregable de Diagnóstico', 'Informe de Implementación'],
      benchmarkRatesUSD: {
        'Junior': Number(rateJunior) || 35,
        'Semi-Senior': Number(rateSemiSenior) || 55,
        'Senior': Number(rateSenior) || 80,
        'Lead / Arquitecto': Number(rateLead) || 110
      }
    };

    onSave(savedModule);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8 max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 px-6 py-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
              <Layers className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h3 className="text-base font-bold leading-tight">
                {isEditing ? 'Modificar Perfil o Módulo del Catálogo' : 'Agregar Nuevo Perfil o Módulo al Catálogo'}
              </h3>
              <p className="text-xs text-slate-300">
                Configure el perfil técnico, responsabilidades, entregables y tarifario de mercado
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Section 1: Identificación del Perfil */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
              1. Identificación y Clasificación
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Nombre del Perfil o Módulo *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => handleNameChange(e.target.value)}
                  placeholder="ej. Community Manager o SAP SD"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Categoría
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                >
                  {CATEGORY_OPTIONS.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Código Identificador *
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="ej. COMM_MGR"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Sigla o Nombre Corto
                </label>
                <input
                  type="text"
                  value={shortName}
                  onChange={e => setShortName(e.target.value.toUpperCase())}
                  placeholder="ej. CM o SD"
                  maxLength={6}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Plantillas Rápidas
                </label>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => applyPreset('digital')}
                    className="flex-1 py-2 px-1 text-[10px] font-bold rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    Digital / CM
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('sap')}
                    className="flex-1 py-2 px-1 text-[10px] font-bold rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    SAP Std
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Descripción y Responsabilidades */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
              2. Alcance y Responsabilidades
            </span>
            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Descripción General del Perfil
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describa el rol, objetivos clave y valor aportado al cliente..."
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Responsabilidades Típicas en Proyectos
                </label>
                <textarea
                  value={defaultResponsibilities}
                  onChange={e => setDefaultResponsibilities(e.target.value)}
                  placeholder="Detalle de funciones, configuración, gestión operativa o liderazgo..."
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Entregables Típicos */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
              3. Entregables Típicos de Trabajo
            </span>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newDeliverableInput}
                  onChange={e => setNewDeliverableInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddDeliverable();
                    }
                  }}
                  placeholder="Agregar nuevo entregable (ej. Plan Editorial Mensual, Guía de Estilo)..."
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddDeliverable}
                  className="px-3.5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {deliverables.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-800 border border-slate-200 rounded-lg text-xs"
                  >
                    <CheckCircle2 className="w-3 h-3 text-blue-600" />
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDeliverable(idx)}
                      className="p-0.5 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Tarifas Benchmark por Seniority */}
          <div className="bg-blue-50/60 border border-blue-200 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
                  4. Tarifas de Referencia de Mercado (USD / hr)
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Estas tarifas servirán de base automática cuando este perfil sea seleccionado en nuevas cotizaciones.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-3 rounded-xl border border-blue-200 shadow-2xs">
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Junior (1-2 a)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    min="1"
                    value={rateJunior}
                    onChange={e => setRateJunior(Number(e.target.value))}
                    className="w-full pl-6 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <span className="text-[9px] text-slate-400 block mt-1">
                  ~${new Intl.NumberFormat('es-CL').format(rateJunior * 980)} CLP
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-blue-200 shadow-2xs">
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Semi-Senior (3-5 a)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    min="1"
                    value={rateSemiSenior}
                    onChange={e => setRateSemiSenior(Number(e.target.value))}
                    className="w-full pl-6 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <span className="text-[9px] text-slate-400 block mt-1">
                  ~${new Intl.NumberFormat('es-CL').format(rateSemiSenior * 980)} CLP
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-blue-300 shadow-2xs ring-1 ring-blue-400/30">
                <label className="block text-[10px] font-bold text-blue-700 uppercase mb-1">
                  Senior (6-9 a) ★
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-blue-600 font-bold">$</span>
                  <input
                    type="number"
                    min="1"
                    value={rateSenior}
                    onChange={e => setRateSenior(Number(e.target.value))}
                    className="w-full pl-6 pr-2 py-1.5 bg-blue-50/50 border border-blue-200 rounded-lg text-blue-950 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <span className="text-[9px] text-blue-600 font-medium block mt-1">
                  ~${new Intl.NumberFormat('es-CL').format(rateSenior * 980)} CLP
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-blue-200 shadow-2xs">
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Lead / Arq (+10 a)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    min="1"
                    value={rateLead}
                    onChange={e => setRateLead(Number(e.target.value))}
                    className="w-full pl-6 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <span className="text-[9px] text-slate-400 block mt-1">
                  ~${new Intl.NumberFormat('es-CL').format(rateLead * 980)} CLP
                </span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-transparent rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Guardar Cambios' : 'Crear Perfil en Catálogo'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
