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
  Globe2
} from 'lucide-react';
import { SAP_CATALOG_MODULES } from '../data/sapModules';
import { SapModuleCode, SeniorityLevel } from '../types';
import { formatCurrency } from '../utils/calculations';
import { getBenchmarkRate, SupportedCurrency, CURRENCIES } from '../utils/currencies';

interface ResourceMasterViewProps {
  onNewQuoteWithModule?: (moduleCode: SapModuleCode) => void;
}

export const ResourceMasterView: React.FC<ResourceMasterViewProps> = ({
  onNewQuoteWithModule
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<SupportedCurrency>('CLP');

  const filteredModules = SAP_CATALOG_MODULES.filter(m => 
    m.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
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
            Catálogo Estándar de Recursos y Perfiles SAP
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Perfiles especializados requeridos para la consultoría y ejecución de proyectos SAP S/4HANA: HCM, MM, LE, PM, QM, ABAP, Basis y Seguridad.
          </p>
        </div>

        {/* Currency Switcher & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Currency Tabs */}
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
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedCurrency === tab.id
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar módulo o perfil..."
              className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Grid of Resource Modules */}
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
                    Matriz Tarifaria ({selectedCurrency})
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

      {/* Operations Info Footer */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Globe2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>Oficina Central Santiago de Chile:</strong> Servicios de consultoría SAP prestados para clientes en Chile (CLP), México (MXN), y Uruguay, Brasil y Colombia (USD).
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
    </div>
  );
};
