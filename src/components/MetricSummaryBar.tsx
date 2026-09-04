import React from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  TrendingUp 
} from 'lucide-react';
import { Quotation } from '../types';
import { calculateQuotationTotals, formatCurrency } from '../utils/calculations';

interface MetricSummaryBarProps {
  quotations: Quotation[];
}

export const MetricSummaryBar: React.FC<MetricSummaryBarProps> = ({ quotations }) => {
  const totalQuotes = quotations.length;
  const approvedQuotes = quotations.filter(q => q.status === 'approved');
  const activeFollowups = quotations.filter(q => q.status === 'sent' || q.status === 'negotiation');
  
  const totalApprovedAmountUSD = approvedQuotes.reduce((acc, q) => {
    const totals = calculateQuotationTotals(q);
    return acc + totals.totalAmount;
  }, 0);

  const totalPipelineAmount = quotations.reduce((acc, q) => {
    const totals = calculateQuotationTotals(q);
    return acc + totals.totalAmount;
  }, 0);

  const winRate = totalQuotes > 0 ? Math.round((approvedQuotes.length / totalQuotes) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Total Propuestas
          </span>
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-black text-slate-900 tracking-tight font-mono">
            {totalQuotes}
          </span>
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            Registradas
          </span>
        </div>
      </div>

      {/* KPI 2 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            En Seguimiento Activo
          </span>
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-black text-amber-600 tracking-tight font-mono">
            {activeFollowups.length}
          </span>
          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            Enviadas / Negociación
          </span>
        </div>
      </div>

      {/* KPI 3 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Aprobadas (A Ejecución)
          </span>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-black text-emerald-600 tracking-tight font-mono">
            {approvedQuotes.length}
          </span>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            {winRate}% Conversión
          </span>
        </div>
      </div>

      {/* KPI 4 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Monto Aprobado (Total)
          </span>
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-xl sm:text-2xl font-black text-blue-600 tracking-tight font-mono">
            {formatCurrency(totalApprovedAmountUSD, 'USD', '$')}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase">
            USD
          </span>
        </div>
      </div>
    </div>
  );
};
