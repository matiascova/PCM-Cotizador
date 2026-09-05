import React, { useState } from 'react';
import { 
  X, 
  Search, 
  UserCheck, 
  Check, 
  Users, 
  Filter, 
  Globe2, 
  Briefcase, 
  Sparkles,
  MapPin,
  Clock,
  DollarSign
} from 'lucide-react';
import { Professional, SapModuleCode, SeniorityLevel } from '../types';
import { formatCurrency } from '../utils/calculations';
import { getProfessionalRate } from '../data/professionals';
import { SAP_CATALOG_MODULES } from '../data/sapModules';

interface ProfessionalPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  professionals: Professional[];
  activeCurrency: 'UF' | 'CLP' | 'USD' | 'MXN' | string;
  currencySymbol?: string;
  onSelectProfessional: (professional: Professional) => void;
  alreadyAssignedIds?: string[];
}

export const ProfessionalPickerModal: React.FC<ProfessionalPickerModalProps> = ({
  isOpen,
  onClose,
  professionals,
  activeCurrency,
  currencySymbol = '$',
  onSelectProfessional,
  alreadyAssignedIds = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('ALL');
  const [selectedSeniority, setSelectedSeniority] = useState<string>('ALL');

  if (!isOpen) return null;

  const filtered = professionals.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.roleTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.skills?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesModule = selectedModule === 'ALL' || p.moduleCode === selectedModule;
    const matchesSeniority = selectedSeniority === 'ALL' || p.seniority === selectedSeniority;

    return matchesSearch && matchesModule && matchesSeniority && p.active !== false;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-6 max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 px-6 py-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold leading-tight">
                  Catálogo de Profesionales SAP & Consultores
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-400/20 text-blue-200 border border-blue-400/30">
                  Tarifas en {activeCurrency}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Seleccione un consultor del equipo para incorporarlo a la cotización con su tarifa oficial precargada
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

        {/* Filter Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs shrink-0">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, cargo, código o habilidad (ej. Nómina, ABAP, S/4HANA)..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedModule}
              onChange={e => setSelectedModule(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Todos los Módulos ({professionals.length})</option>
              {SAP_CATALOG_MODULES.map(m => (
                <option key={m.code} value={m.code}>
                  {m.code} ({m.shortName})
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedSeniority}
              onChange={e => setSelectedSeniority(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Todos los Seniorities</option>
              <option value="Junior">Junior</option>
              <option value="Semi-Senior">Semi-Senior</option>
              <option value="Senior">Senior</option>
              <option value="Lead / Arquitecto">Lead / Arquitecto</option>
            </select>
          </div>
        </div>

        {/* List of Professionals */}
        <div className="p-4 sm:p-6 overflow-y-auto divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-medium">No se encontraron profesionales con los filtros seleccionados.</p>
              <p className="text-xs text-slate-400 mt-1">Intente cambiar el término de búsqueda o restablecer los filtros.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filtered.map(prof => {
                const rate = getProfessionalRate(prof, activeCurrency);
                const isAlreadyAdded = alreadyAssignedIds.includes(prof.id);

                return (
                  <div
                    key={prof.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                      isAlreadyAdded
                        ? 'bg-blue-50/40 border-blue-200 ring-1 ring-blue-300'
                        : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-md'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2">
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

                      {/* Name & Role */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                          {prof.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-slate-900 truncate">
                            {prof.name}
                          </h4>
                          <p className="text-xs text-slate-600 font-medium line-clamp-1">
                            {prof.roleTitle}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {prof.location}
                            </span>
                            <span>•</span>
                            <span>{prof.seniority}</span>
                            <span>•</span>
                            <span>{prof.modality}</span>
                          </div>
                        </div>
                      </div>

                      {/* Skills Chips */}
                      {prof.skills && prof.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2.5">
                          {prof.skills.slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/60"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom Rate & Action */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                          Tarifa Preestablecida ({activeCurrency})
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-base font-extrabold text-blue-900 font-mono">
                            {formatCurrency(rate, activeCurrency, currencySymbol)}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">/ hora</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onSelectProfessional(prof);
                          onClose();
                        }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                          isAlreadyAdded
                            ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-300'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {isAlreadyAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-blue-700" />
                            <span>Re-asignar Tarifa</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Incorporar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>
            Mostrando <strong>{filtered.length}</strong> profesionales activos en el catálogo.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-medium transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
