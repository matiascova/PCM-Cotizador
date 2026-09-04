import React, { useState } from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  TrendingUp,
  Globe2
} from 'lucide-react';
import { Quotation } from '../types';
import { calculateQuotationTotals, formatCurrency } from '../utils/calculations';
import { convertCurrency } from '../utils/currencies';

interface MetricSummaryBarProps {
  quotations: Quotation[];
}

export const MetricSummaryBar: React.FC<MetricSummaryBarProps> = ({ quotations }) => {
  const [selectedCurrencyView, setSelectedCurrencyView] = useState<'breakdown' | 'consolidated_usd'>('breakdown');
  
  const totalQuotes = quotations.length;
  const approvedQuotes = quotations.filter(q => q.status === 'approved');
  const activeFollowups = quotations.filter(q => q.status === 'sent' || q.status === 'negotiation');

  // Multi-currency calculation
  const totalsByCurrency = quotations.reduce((acc, q) => {
    const curr = (q.currency as 'CLP' | 'UF' | 'MXN' | 'USD') || 'USD';
    const totals = calculateQuotationTotals(q);
    if (!acc[curr]) {
      acc[curr] = { approved: 0, pipeline: 0, count: 0, approvedCount: 0, symbol: q.currencySymbol || '$' };
    }
    acc[curr].pipeline += totals.totalAmount;
    acc[curr].count += 1;
    if (q.status === 'approved') {
      acc[curr].approved += totals.totalAmount;
      acc[curr].approvedCount += 1;
    }
    return acc;
  }, {} as Record<string, { approved: number; pipeline: number; count: number; approvedCount: number; symbol: string }>);

  // Consolidated estimate in USD
  const totalApprovedConsolidatedUSD = approvedQuotes.reduce((acc, q) => {
    const totals = calculateQuotationTotals(q);
    return acc + convertCurrency(totals.totalAmount, q.currency || 'USD', 'USD');
  }, 0);

  const winRate = totalQuotes > 0 ? Math.round((approvedQuotes.length / totalQuotes) * 100) : 0;

  const currencyKeys = ['CLP', 'UF', 'MXN', 'USD'].filter(c => totalsByCurrency[c]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: Total Propuestas */}
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

      {/* KPI 2: En Seguimiento Activo */}
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

      {/* KPI 3: Aprobadas (A Ejecución) */}
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

      {/* KPI 4: Monto Aprobado Multi-Moneda */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Monto Aprobado
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSelectedCurrencyView(selectedCurrencyView === 'breakdown' ? 'consolidated_usd' : 'breakdown')}
              className="text-[9px] font-bold text-slate-500 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-1.5 py-0.5 rounded transition-colors"
              title="Alternar entre desglose por moneda y consolidado USD"
            >
              {selectedCurrencyView === 'breakdown' ? 'Consolidar USD' : 'Desglosar'}
            </button>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
        </div>

        {selectedCurrencyView === 'breakdown' ? (
          <div className="mt-2 space-y-1">
            {currencyKeys.length > 0 ? (
              currencyKeys.map(c => {
                const data = totalsByCurrency[c];
                const flag = c === 'CLP' ? '🇨🇱' : c === 'UF' ? '🇨🇱 UF' : c === 'MXN' ? '🇲🇽' : '🇺🇸';
                return (
                  <div key={c} className="flex items-baseline justify-between text-xs">
                    <span className="font-semibold text-slate-600 flex items-center gap-1">
                      <span>{flag}</span>
                      <span className="text-[10px] font-mono text-slate-500">{c}:</span>
                    </span>
                    <span className="font-bold font-mono text-blue-700">
                      {formatCurrency(data.approved, c, data.symbol)}
                    </span>
                  </div>
                );
              })
            ) : (
              <span className="text-xl font-black text-blue-600 font-mono">$0</span>
            )}
          </div>
        ) : (
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-blue-600 tracking-tight font-mono">
              {formatCurrency(totalApprovedConsolidatedUSD, 'USD', '$')}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              USD Est.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
