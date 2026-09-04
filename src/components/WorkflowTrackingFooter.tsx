import React from 'react';
import { Check } from 'lucide-react';
import { Quotation } from '../types';

interface WorkflowTrackingFooterProps {
  quotations: Quotation[];
}

export const WorkflowTrackingFooter: React.FC<WorkflowTrackingFooterProps> = ({ quotations }) => {
  const total = quotations.length;
  const approved = quotations.filter(q => q.status === 'approved').length;
  const sentOrNegotiation = quotations.filter(q => q.status === 'sent' || q.status === 'negotiation').length;
  const draft = quotations.filter(q => q.status === 'draft').length;

  const winRate = total > 0 ? Math.round((approved / total) * 100) : 85;

  return (
    <footer className="bg-white border-t border-slate-200 px-4 sm:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0 shadow-xs">
      <div className="flex flex-col">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
          Workflow Tracking • Ciclo de Vida Comercial SAP
        </span>
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Step 1 */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-800">1. DRAFTING ({draft})</span>
          </div>

          <div className="w-8 sm:w-12 h-px bg-slate-200 hidden sm:block"></div>

          {/* Step 2 */}
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
              sentOrNegotiation > 0 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
            }`}>
              2
            </div>
            <span className={`font-bold ${sentOrNegotiation > 0 ? 'text-blue-700' : 'text-slate-400'} uppercase`}>
              SENT & NEGOTIATION ({sentOrNegotiation})
            </span>
          </div>

          <div className="w-8 sm:w-12 h-px bg-slate-200 hidden sm:block"></div>

          {/* Step 3 */}
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
              approved > 0 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'
            }`}>
              3
            </div>
            <span className={`font-bold ${approved > 0 ? 'text-emerald-700' : 'text-slate-400'} uppercase`}>
              APPROVED ({approved})
            </span>
          </div>

          <div className="w-8 sm:w-12 h-px bg-slate-200 hidden sm:block"></div>

          {/* Step 4 */}
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
              approved > 0 ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-400'
            }`}>
              4
            </div>
            <span className={`font-bold ${approved > 0 ? 'text-slate-800' : 'text-slate-400'} uppercase`}>
              PMO EXECUTION
            </span>
          </div>
        </div>
      </div>

      {/* Probability Gauge Metric */}
      <div className="flex items-center gap-4 md:border-l md:border-slate-100 md:pl-8">
        <div className="text-right">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Pipeline Confidence
          </div>
          <div className="text-sm font-bold text-slate-900 font-mono">
            {winRate}% Aprobadas
          </div>
        </div>
        <div className="relative w-10 h-10 rounded-full border-3 border-slate-100 border-t-blue-600 flex items-center justify-center">
          <span className="text-[10px] font-bold text-slate-700">{winRate}%</span>
        </div>
      </div>
    </footer>
  );
};
