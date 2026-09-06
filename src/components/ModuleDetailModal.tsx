import React from 'react';
import { 
  X, 
  Layers, 
  CheckCircle2, 
  Edit2, 
  Trash2, 
  Plus, 
  DollarSign, 
  FileText,
  Briefcase,
  Globe2,
  Tag
} from 'lucide-react';
import { SapCatalogModule, getModuleBenchmarkRate } from '../data/sapModules';
import { SeniorityLevel } from '../types';
import { SupportedCurrency } from '../utils/currencies';
import { formatCurrency } from '../utils/calculations';

interface ModuleDetailModalProps {
  isOpen: boolean;
  module: SapCatalogModule | null;
  onClose: () => void;
  onEdit: (module: SapCatalogModule) => void;
  onDelete: (moduleCode: string, moduleName: string) => void;
  onQuote?: (moduleCode: string) => void;
}

const SENIORITY_LEVELS: SeniorityLevel[] = ['Junior', 'Semi-Senior', 'Senior', 'Lead / Arquitecto'];

export const ModuleDetailModal: React.FC<ModuleDetailModalProps> = ({
  isOpen,
  module,
  onClose,
  onEdit,
  onDelete,
  onQuote
}) => {
  if (!isOpen || !module) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8 max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 px-6 py-5 text-white shrink-0 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shrink-0 shadow-md border-2 border-white/20">
              {module.shortName || module.code.slice(0, 3)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-white/15 text-blue-200 border border-white/20">
                  {module.code}
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  {module.category || 'Módulo'}
                </span>
              </div>

              <h2 className="text-xl font-bold text-white tracking-tight">
                {module.name}
              </h2>
              <p className="text-xs text-blue-200 font-medium mt-0.5">
                Perfil y Módulo Especializado para Cotizaciones y Staffing
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-xs">
          {/* Description */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Descripción y Alcance del Perfil
            </span>
            <p className="text-slate-800 leading-relaxed text-xs font-normal">
              {module.description}
            </p>
          </div>

          {/* Default Responsibilities */}
          {module.defaultResponsibilities && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-blue-600" /> Responsabilidades Típicas en Proyecto
              </span>
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl text-slate-700 leading-relaxed">
                {module.defaultResponsibilities}
              </div>
            </div>
          )}

          {/* Deliverables */}
          {module.typicalDeliverables && module.typicalDeliverables.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600" /> Entregables Típicos Comprometidos
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {module.typicalDeliverables.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-800">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Benchmark Tariff Matrix */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Matriz Tarifaria de Referencia por Seniority
            </span>
            
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                    <th className="p-3">Nivel de Seniority</th>
                    <th className="p-3">Tarifa USD</th>
                    <th className="p-3">Tarifa CLP (Chile)</th>
                    <th className="p-3">Tarifa UF (Chile)</th>
                    <th className="p-3">Tarifa MXN (México)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  {SENIORITY_LEVELS.map(level => {
                    const usd = getModuleBenchmarkRate(module, level, 'USD');
                    const clp = getModuleBenchmarkRate(module, level, 'CLP');
                    const uf = getModuleBenchmarkRate(module, level, 'UF');
                    const mxn = getModuleBenchmarkRate(module, level, 'MXN');
                    const isSenior = level === 'Senior';

                    return (
                      <tr key={level} className={isSenior ? 'bg-blue-50/50 font-bold text-blue-950' : 'hover:bg-slate-50/70'}>
                        <td className="p-3 font-sans flex items-center gap-1.5">
                          <span>{level}</span>
                          {isSenior && (
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-blue-200 text-blue-800">
                              Estándar
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-blue-700">${usd}/hr</td>
                        <td className="p-3 text-slate-800">${new Intl.NumberFormat('es-CL').format(clp)}</td>
                        <td className="p-3 text-slate-800">{uf} UF</td>
                        <td className="p-3 text-slate-800">${new Intl.NumberFormat('es-MX').format(mxn)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1.5">
              * Valores calculados según tarifas base de mercado y paridad oficial Banco Central.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(module);
              }}
              className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-700 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Modificar Perfil</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onDelete(module.code, module.name);
              }}
              className="px-3.5 py-2 text-xs font-bold text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Borrar Perfil</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-transparent rounded-xl transition-colors cursor-pointer"
            >
              Cerrar
            </button>

            {onQuote && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onQuote(module.code);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Cotizar con este Perfil</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
