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
  Plus
} from 'lucide-react';
import { SAP_CATALOG_MODULES } from '../data/sapModules';
import { SapModuleCode } from '../types';
import { formatCurrency } from '../utils/calculations';

interface ResourceMasterViewProps {
  onNewQuoteWithModule?: (moduleCode: SapModuleCode) => void;
}

export const ResourceMasterView: React.FC<ResourceMasterViewProps> = ({
  onNewQuoteWithModule
}) => {
  const [searchTerm, setSearchTerm] = useState('');

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
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Resource Master & Staffing Matrix
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Catálogo Estándar de Recursos y Perfiles SAP
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Perfiles especializados requeridos para la ejecución de proyectos SAP S/4HANA: HCM, MM, LE, PM, QM, ABAP, Basis y Seguridad.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar módulo o perfil..."
            className="w-full text-xs pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Grid of Resource Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredModules.map(mod => {
          const seniorRate = mod.benchmarkRatesUSD['Senior'] || 90;
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
                  <span className="text-[11px] font-bold text-slate-500 font-mono">
                    Tarifa Ref: {formatCurrency(seniorRate, 'USD', '$')}/hr
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {mod.name}
                </h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                  {mod.description}
                </p>

                {/* Sub-roles / Deliverables */}
                <div className="mt-4 pt-4 border-t border-slate-100">
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
  );
};
