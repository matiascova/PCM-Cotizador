import React, { useState } from 'react';
import { 
  Briefcase, 
  Users, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Layers, 
  ArrowRight, 
  ShieldCheck, 
  Printer, 
  Save,
  Building2,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { Quotation, SapResourceItem } from '../types';
import { calculateQuotationTotals, formatCurrency } from '../utils/calculations';

interface ProjectExecutionHandoverProps {
  quote: Quotation;
  onUpdateQuote: (updated: Quotation) => void;
  onClose: () => void;
}

export const ProjectExecutionHandover: React.FC<ProjectExecutionHandoverProps> = ({
  quote,
  onUpdateQuote,
  onClose
}) => {
  const totals = calculateQuotationTotals(quote);

  const [assignedPM, setAssignedPM] = useState(quote.executionAssignedPM || '');
  const [actualProjectCode, setActualProjectCode] = useState(quote.actualProjectCode || `PRJ-SAP-${new Date().getFullYear()}-${quote.code.slice(-3)}`);
  const [handoverNotes, setHandoverNotes] = useState(quote.handoverNotes || '');
  const [kickoffDate, setKickoffDate] = useState(quote.project.estimatedStartDate || '');
  const [isSaved, setIsSaved] = useState(false);

  // Group resources by SAP Module for operational staffing breakdown
  const staffingByModule: Record<string, { moduleName: string; totalHours: number; roles: SapResourceItem[] }> = {};

  quote.resources.forEach(res => {
    const key = res.moduleCode;
    if (!staffingByModule[key]) {
      staffingByModule[key] = {
        moduleName: res.moduleName,
        totalHours: 0,
        roles: []
      };
    }
    staffingByModule[key].totalHours += Number(res.hours) || 0;
    staffingByModule[key].roles.push(res);
  });

  const handleSave = () => {
    const updated: Quotation = {
      ...quote,
      executionAssignedPM: assignedPM,
      actualProjectCode,
      handoverNotes,
      project: {
        ...quote.project,
        estimatedStartDate: kickoffDate
      },
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    onUpdateQuote(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-[92vw] max-w-[94vw] h-[90vh] max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                  Ficha de Traspaso a Ejecución (PMO)
                </span>
                <span className="text-xs text-slate-400">Ref: {quote.code}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
                Input Operativo para Proyecto: {quote.project.projectTitle}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Imprimir Ficha Operativa"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir Ficha</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors text-lg font-bold"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* Status banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-emerald-900">
                Cotización Aprobada por {quote.client.companyName}
              </h3>
              <p className="text-xs text-emerald-700 mt-0.5">
                Esta ficha consolida el alcance contractual, la bolsa de recursos por módulo SAP y los hitos comprometidos para inicializar el proyecto en la PMO y asignar los consultores en el ERP / asignador de recursos.
              </p>
            </div>
          </div>

          {/* Operational Project Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Código Interno de Proyecto SAP
              </label>
              <input
                type="text"
                value={actualProjectCode}
                onChange={e => setActualProjectCode(e.target.value)}
                placeholder="ej. PRJ-SAP-2026-001"
                className="w-full text-sm px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project Manager (PM Asignado)
              </label>
              <input
                type="text"
                value={assignedPM}
                onChange={e => setAssignedPM(e.target.value)}
                placeholder="Nombre del Líder / PM"
                className="w-full text-sm px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fecha Tentativa de Kick-Off
              </label>
              <input
                type="date"
                value={kickoffDate}
                onChange={e => setKickoffDate(e.target.value)}
                className="w-full text-sm px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Notas y Acuerdos de Traspaso (Handover Notes para el PM)
              </label>
              <textarea
                value={handoverNotes}
                onChange={e => setHandoverNotes(e.target.value)}
                rows={2}
                placeholder="Detallar condiciones particulares pactadas con el cliente, riesgos identificados en preventa, disponibilidad de Key Users, etc."
                className="w-full text-sm px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Section: Staffing Requirements (Input for Resource Manager / PM) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Bolsa de Horas a Reservar por Perfil / Módulo SAP ({totals.totalHours} hrs totales)</span>
              </h4>
              <span className="text-xs text-slate-500">
                Horas contratadas en la cotización
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(staffingByModule).map(([modCode, item]) => (
                <div key={modCode} className="border border-slate-200 rounded-xl p-3.5 bg-white shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                      {item.moduleName}
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {item.totalHours} hrs
                    </span>
                  </div>
                  <div className="space-y-1.5 mt-2">
                    {item.roles.map(r => (
                      <div key={r.id} className="text-xs flex items-center justify-between text-slate-600 border-t border-slate-100 pt-1">
                        <span>{r.roleTitle} ({r.seniority})</span>
                        <span className="font-semibold text-slate-800">{r.hours}h ({r.modality})</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Project Milestones Contracted */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Hitos Contractuales Comprometidos con el Cliente</span>
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Hito / Fase</th>
                    <th className="py-2.5 px-3">Entregable Contractual Comprometido</th>
                    <th className="py-2.5 px-3">Plazo</th>
                    <th className="py-2.5 px-3 text-right">% Facturación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {quote.milestones.map((m, idx) => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-semibold text-slate-800">
                        {idx + 1}. {m.title}
                      </td>
                      <td className="py-2 px-3 text-slate-600">
                        {m.deliverables || m.description}
                      </td>
                      <td className="py-2 px-3 text-slate-600 whitespace-nowrap">
                        {m.estimatedWeek ? m.estimatedWeek.replace(/Semanas?\s*/gi, 'Sem. ') : '-'}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-slate-800">
                        {m.paymentPercentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Operational Checklist for Project Setup */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Checklist de Arranque de Proyecto (Pre-Kickoff)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                <span>Orden de Compra / Contrato formal recibido del cliente</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                <span>Consultores Senior MM/PM/LE/ABAP reservados en agenda</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded text-blue-600" />
                <span>Solicitud de accesos VPN y mandante DEV/Sandbox enviada</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded text-blue-600" />
                <span>Convocatoria de sesión de Kick-Off y presentación de equipo</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {isSaved && (
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Datos guardados correctamente en la cotización
              </span>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Cerrar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar Ficha de Traspaso</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
