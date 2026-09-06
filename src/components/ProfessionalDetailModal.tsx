import React from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  ShieldCheck, 
  Award, 
  Clock, 
  Edit2, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  TrendingUp,
  FileText
} from 'lucide-react';
import { Professional } from '../types';
import { SupportedCurrency } from '../utils/currencies';
import { formatCurrency } from '../utils/calculations';
import { getProfessionalRate } from '../data/professionals';

interface ProfessionalDetailModalProps {
  isOpen: boolean;
  professional: Professional | null;
  onClose: () => void;
  onEdit: (professional: Professional) => void;
  onDelete: (id: string, name: string) => void;
  onQuote?: (professional: Professional) => void;
}

export const ProfessionalDetailModal: React.FC<ProfessionalDetailModalProps> = ({
  isOpen,
  professional,
  onClose,
  onEdit,
  onDelete,
  onQuote
}) => {
  if (!isOpen || !professional) return null;

  const clpRate = professional.rates?.CLP ?? 88000;
  const ufRate = professional.rates?.UF ?? 2.20;
  const usdRate = professional.rates?.USD ?? 95;
  const mxnRate = professional.rates?.MXN ?? 1750;

  const clpCost = professional.costRates?.CLP ?? Math.round(clpRate * 0.65);
  const ufCost = professional.costRates?.UF ?? Number((ufRate * 0.65).toFixed(2));
  const usdCost = professional.costRates?.USD ?? Math.round(usdRate * 0.65);

  const estimatedMargin = clpRate > 0 ? Math.round(((clpRate - clpCost) / clpRate) * 100) : 35;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8 max-h-[90vh]">
        {/* Header with gradient banner */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 px-6 py-5 text-white shrink-0 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shrink-0 shadow-md border-2 border-white/20">
              {professional.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-white/15 text-blue-200 border border-white/20">
                  {professional.code}
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  {professional.moduleName || professional.moduleCode}
                </span>
                <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                  professional.status === 'Disponible'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                    : professional.status === 'Parcial'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    professional.status === 'Disponible' ? 'bg-emerald-400' : professional.status === 'Parcial' ? 'bg-amber-400' : 'bg-blue-400'
                  }`} />
                  {professional.status}
                </span>
              </div>

              <h2 className="text-xl font-bold text-white tracking-tight">
                {professional.name}
              </h2>
              <p className="text-xs text-blue-200 font-medium mt-0.5">
                {professional.roleTitle}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  {professional.location}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                  Seniority: <strong className="text-white">{professional.seniority}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  Modalidad: <strong className="text-white">{professional.modality}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-xs">
          {/* Bio section if available */}
          {professional.bio && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Resumen Ejecutivo / Trayectoria
              </span>
              <p className="text-slate-700 leading-relaxed text-xs">
                {professional.bio}
              </p>
            </div>
          )}

          {/* Rates Matrix */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Tarifario Oficial de Cotización
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Margen Estimado: ~{estimatedMargin}%
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 text-center">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Chile (UF)</span>
                <div className="text-lg font-mono font-extrabold text-blue-950 mt-1">
                  {ufRate} <span className="text-xs font-normal">UF/hr</span>
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                  Costo: {ufCost} UF
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">Chile (CLP)</span>
                <div className="text-lg font-mono font-extrabold text-slate-900 mt-1">
                  ${new Intl.NumberFormat('es-CL').format(clpRate)}
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                  Costo: ${new Intl.NumberFormat('es-CL').format(clpCost)}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">Internacional (USD)</span>
                <div className="text-lg font-mono font-extrabold text-slate-900 mt-1">
                  ${usdRate} <span className="text-xs font-normal">USD/hr</span>
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                  Costo: ${usdCost} USD
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">México (MXN)</span>
                <div className="text-lg font-mono font-extrabold text-slate-900 mt-1">
                  ${new Intl.NumberFormat('es-MX').format(mxnRate)}
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Pesos Mexicanos
                </span>
              </div>
            </div>
          </div>

          {/* Skills and Certifications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Skills */}
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Competencias Técnicas y Funcionales
              </span>
              {professional.skills && professional.skills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {professional.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium rounded-lg"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Sin competencias registradas</p>
              )}
            </div>

            {/* Certifications */}
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-500" /> Certificaciones Oficiales
              </span>
              {professional.certifications && professional.certifications.length > 0 ? (
                <ul className="space-y-2">
                  {professional.certifications.map((cert, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>{cert}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400 italic">Sin certificaciones registradas</p>
              )}
            </div>
          </div>

          {/* Contact Details */}
          <div className="border-t border-slate-100 pt-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
              Información de Contacto y Asignación
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-500 block">Correo Electrónico</span>
                <span className="font-semibold text-slate-800 break-all">{professional.email || 'No registrado'}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-500 block">Teléfono / WhatsApp</span>
                <span className="font-semibold text-slate-800">{professional.phone || 'No registrado'}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-500 block">Residencia / Base</span>
                <span className="font-semibold text-slate-800">{professional.location || 'Santiago, Chile'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(professional);
              }}
              className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-700 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Modificar Ficha</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onDelete(professional.id, professional.name);
              }}
              className="px-3.5 py-2 text-xs font-bold text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Borrar Profesional</span>
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
                  onQuote(professional);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Cotizar con este Consultor</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
