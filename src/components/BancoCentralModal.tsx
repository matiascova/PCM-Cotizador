import React, { useState } from 'react';
import { 
  X, 
  RefreshCw, 
  CheckCircle2, 
  TrendingUp, 
  Calculator, 
  Building2, 
  ExternalLink,
  DollarSign,
  Calendar,
  Layers,
  ArrowRightLeft
} from 'lucide-react';
import { 
  BancoCentralData, 
  fetchBancoCentralIndicators, 
  formatUfValue 
} from '../services/bcentralService';

interface BancoCentralModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: BancoCentralData;
  onDataUpdated: (newData: BancoCentralData) => void;
}

export const BancoCentralModal: React.FC<BancoCentralModalProps> = ({
  isOpen,
  onClose,
  data,
  onDataUpdated
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Mini-calculator state
  const [calcMode, setCalcMode] = useState<'uf_to_clp' | 'clp_to_uf'>('uf_to_clp');
  const [calcInput, setCalcInput] = useState<number>(100);

  if (!isOpen) return null;

  const ufVal = data?.indicators?.uf?.value || 40879.04;
  const dolarVal = data?.indicators?.dolar?.value || 933.47;
  const euroVal = data?.indicators?.euro?.value || 1086.06;
  const utmVal = data?.indicators?.utm?.value || 71721.00;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setSuccessMsg(null);
    try {
      const updated = await fetchBancoCentralIndicators(true);
      onDataUpdated(updated);
      setSuccessMsg('¡Indicadores actualizados correctamente desde el Banco Central de Chile!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Calculations
  const calculatedClp = calcMode === 'uf_to_clp' ? Math.round(calcInput * ufVal) : calcInput;
  const calculatedUf = calcMode === 'clp_to_uf' ? (ufVal > 0 ? Math.round((calcInput / ufVal) * 100) / 100 : 0) : calcInput;
  const calculatedUsd = dolarVal > 0 ? Math.round(((calculatedUf * ufVal) / dolarVal) * 100) / 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-start justify-between border-b border-slate-800">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-bold tracking-widest bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-400/30">
                  API Banco Central de Chile
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Conexión Activa
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                Indicadores Económicos Oficiales
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Datos oficiales del Banco Central de Chile (BCCh) y Comisión para el Mercado Financiero (CMF).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-800 flex-1">
          
          {/* Refresh Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
            <div>
              <div className="text-slate-500 flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                Fecha de vigencia oficial: <span className="font-bold text-slate-900">{data.dateFormatted}</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Fuente: <span className="font-mono text-slate-600">{data.source}</span>
                {data.cached && ' (en caché local)'}
              </div>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Consultando API...' : 'Sincronizar Banco Central'}</span>
            </button>
          </div>

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Indicators Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* UF Principal */}
            <div className="bg-linear-to-br from-blue-50/70 to-slate-50 border-2 border-blue-300 rounded-xl p-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 flex items-center gap-1">
                  <span>🇨🇱</span> UF (Unidad de Fomento)
                </span>
                <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                  Reajustable IPC
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                  ${formatUfValue(ufVal)}
                </span>
                <span className="text-xs font-semibold text-slate-500">CLP</span>
              </div>
              <div className="mt-2 pt-2 border-t border-blue-200/60 flex items-center justify-between text-[11px] text-slate-600">
                <span>Equivalente en Dólares:</span>
                <span className="font-mono font-bold text-blue-900">
                  ≈ ${formatUfValue(dolarVal > 0 ? ufVal / dolarVal : 0)} USD
                </span>
              </div>
            </div>

            {/* Dólar Observado */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <span>🇺🇸</span> Dólar Observado (USD/CLP)
                </span>
                <span className="text-[10px] font-medium text-slate-500">
                  BCCh Oficial
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                  ${formatUfValue(dolarVal)}
                </span>
                <span className="text-xs font-semibold text-slate-500">CLP</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
                <span>Tipo de Cambio:</span>
                <span className="font-mono font-medium text-slate-700">1 USD = ${dolarVal.toFixed(2)} CLP</span>
              </div>
            </div>

            {/* Euro */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <span>🇪🇺</span> Euro (EUR/CLP)
                </span>
                <span className="text-[10px] font-medium text-slate-500">
                  BCCh Oficial
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                  ${formatUfValue(euroVal)}
                </span>
                <span className="text-xs font-semibold text-slate-500">CLP</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
                <span>Tipo de Cambio:</span>
                <span className="font-mono font-medium text-slate-700">1 EUR = ${euroVal.toFixed(2)} CLP</span>
              </div>
            </div>

            {/* UTM */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <span>🇨🇱</span> UTM (Unidad Tributaria)
                </span>
                <span className="text-[10px] font-medium text-slate-500">
                  Mensual
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                  ${new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 }).format(utmVal)}
                </span>
                <span className="text-xs font-semibold text-slate-500">CLP</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
                <span>Uso:</span>
                <span className="font-mono font-medium text-slate-700">Tributario / Legal</span>
              </div>
            </div>
          </div>

          {/* Mini-Calculator for SAP Proposals */}
          <div className="bg-slate-900 text-white rounded-xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-blue-400" />
                Simulador de Conversión de Propuestas SAP
              </h4>
              <button
                type="button"
                onClick={() => {
                  setCalcMode(calcMode === 'uf_to_clp' ? 'clp_to_uf' : 'uf_to_clp');
                  setCalcInput(calcMode === 'uf_to_clp' ? 10000000 : 100);
                }}
                className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
              >
                <ArrowRightLeft className="w-3 h-3" />
                <span>Invertir ({calcMode === 'uf_to_clp' ? 'UF ➔ CLP' : 'CLP ➔ UF'})</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  {calcMode === 'uf_to_clp' ? 'Monto en UF a convertir:' : 'Monto en Pesos Chilenos (CLP):'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400 font-mono">
                    {calcMode === 'uf_to_clp' ? 'UF' : '$'}
                  </span>
                  <input
                    type="number"
                    value={calcInput}
                    onChange={e => setCalcInput(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono font-bold text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {calcMode === 'uf_to_clp' ? 'Ej: 150 UF (aprox. 1 bolsa de 70 hrs Senior)' : 'Ej: $45.000.000 CLP'}
                </div>
              </div>

              <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700/80 space-y-1.5">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">
                  Equivalente Calculado:
                </div>
                {calcMode === 'uf_to_clp' ? (
                  <>
                    <div className="text-lg sm:text-xl font-black text-emerald-400 font-mono">
                      $ {new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 }).format(calculatedClp)} CLP
                    </div>
                    <div className="text-xs text-blue-300 font-mono">
                      ≈ $ {new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(calculatedUsd)} USD
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-lg sm:text-xl font-black text-blue-400 font-mono">
                      UF {formatUfValue(calculatedUf)}
                    </div>
                    <div className="text-xs text-slate-300 font-mono">
                      ≈ $ {new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(calculatedUsd)} USD
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Legal / Market Note for SAP in Chile */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-800">
              <span>📌</span> Práctica Estándar de Consultoría SAP en Chile:
            </div>
            <p className="text-[11px] leading-relaxed text-amber-800/90">
              En Chile, los contratos de implementación SAP de varios meses y las bolsas de horas de soporte AMS se cotizan preferentemente en <strong>UF</strong> para resguardar el poder adquisitivo frente al IPC. Las facturas se emiten formalmente en Pesos Chilenos (CLP) aplicando el valor de la UF del día de emisión publicado por el Banco Central de Chile más el 19% de IVA.
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex items-center justify-between text-xs">
          <a
            href="https://www.bcentral.cl"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1"
          >
            <span>Sitio Oficial bcentral.cl</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg cursor-pointer transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
