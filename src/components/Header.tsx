import React from 'react';
import { 
  FileText, 
  Plus, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  RotateCcw,
  Menu,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  Building2,
  ExternalLink
} from 'lucide-react';
import { Quotation } from '../types';
import { calculateQuotationTotals, formatCurrency } from '../utils/calculations';
import { BancoCentralData, formatUfValue } from '../services/bcentralService';

interface HeaderProps {
  quotations: Quotation[];
  activeNav: string;
  onNewQuotation: () => void;
  onResetData: () => void;
  onToggleMobileSidebar?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebarCollapse?: () => void;
  bcentralData?: BancoCentralData;
  onOpenBancoCentralModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  quotations,
  activeNav,
  onNewQuotation,
  onResetData,
  onToggleMobileSidebar,
  isSidebarCollapsed,
  onToggleSidebarCollapse,
  bcentralData,
  onOpenBancoCentralModal
}) => {
  const getNavTitle = () => {
    switch (activeNav) {
      case 'history':
        return { subtitle: 'Historical Pipeline', title: 'Historial Completo de Cotizaciones SAP' };
      case 'clients':
        return { subtitle: 'Client Directory', title: 'Empresas & Cuentas Corporativas' };
      case 'resources':
        return { subtitle: 'Resource Catalog', title: 'Matriz de Perfiles y Tarifas SAP' };
      case 'procurement':
        return { subtitle: 'SAP MM Procurement', title: 'Compras, SOLPEDs & Órdenes de Compra' };
      case 'suppliers':
        return { subtitle: 'SAP MM Vendor Master', title: 'Maestro de Proveedores & Subcontratistas' };
      case 'builder':
      default:
        return { subtitle: 'Proposal Builder', title: 'Sistema de Cotizaciones & Staffing SAP' };
    }
  };

  const navInfo = getNavTitle();
  const ufVal = bcentralData?.indicators?.uf?.value || 40879.04;
  const dolarVal = bcentralData?.indicators?.dolar?.value || 933.47;

  return (
    <header className="h-16 sm:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-6 lg:px-8 shrink-0 gap-2">
      <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
        {/* Mobile menu trigger */}
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Desktop Curtain Toggle Button */}
        {onToggleSidebarCollapse && (
          <button
            onClick={onToggleSidebarCollapse}
            className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
              isSidebarCollapsed 
                ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 shadow-xs' 
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title={isSidebarCollapsed ? "Fijar menú completo en pantalla" : "Modo Cortina (Aprovechar pantalla completa)"}
          >
            {isSidebarCollapsed ? (
              <>
                <PanelLeftOpen className="w-4 h-4 text-blue-600" />
                <span className="text-[11px] font-bold">Modo Cortina</span>
              </>
            ) : (
              <>
                <PanelLeftClose className="w-4 h-4 text-slate-500" />
                <span className="text-[11px] font-semibold">Plegar</span>
              </>
            )}
          </button>
        )}

        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
            {navInfo.subtitle}
          </span>
          <h2 className="text-base sm:text-xl font-bold text-slate-900 line-clamp-1">
            {navInfo.title}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Banco Central de Chile Chip */}
        {onOpenBancoCentralModal && (
          <button
            type="button"
            onClick={onOpenBancoCentralModal}
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg transition-all text-xs cursor-pointer group"
            title="Ver indicadores del Banco Central de Chile y calculadora UF"
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-blue-700 hidden sm:inline">
                🇨🇱 Banco Central
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[11px] sm:text-xs">
              <span className="font-bold text-slate-800 group-hover:text-blue-900">
                UF ${formatUfValue(ufVal)}
              </span>
              <span className="text-slate-400 hidden md:inline">|</span>
              <span className="text-slate-500 hidden md:inline">
                USD ${dolarVal.toFixed(0)}
              </span>
            </div>
          </button>
        )}

        <button
          onClick={onResetData}
          title="Restaurar ejemplos de cotizaciones SAP"
          className="hidden sm:flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Cargar Ejemplos</span>
        </button>

        <button
          onClick={onNewQuotation}
          className="flex items-center gap-2 px-3.5 sm:px-5 py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-bold shadow-md shadow-blue-200 hover:bg-blue-700 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nueva Cotización SAP</span>
          <span className="sm:hidden">Nueva</span>
        </button>
      </div>
    </header>
  );
};


