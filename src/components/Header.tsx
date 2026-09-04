import React from 'react';
import { 
  FileText, 
  Plus, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  RotateCcw,
  Menu,
  Sparkles
} from 'lucide-react';
import { Quotation } from '../types';
import { calculateQuotationTotals, formatCurrency } from '../utils/calculations';

interface HeaderProps {
  quotations: Quotation[];
  activeNav: string;
  onNewQuotation: () => void;
  onResetData: () => void;
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  quotations,
  activeNav,
  onNewQuotation,
  onResetData,
  onToggleMobileSidebar
}) => {
  const getNavTitle = () => {
    switch (activeNav) {
      case 'history':
        return { subtitle: 'Historical Pipeline', title: 'Historial Completo de Cotizaciones SAP' };
      case 'clients':
        return { subtitle: 'Client Directory', title: 'Empresas & Cuentas Corporativas' };
      case 'resources':
        return { subtitle: 'Resource Catalog', title: 'Matriz de Perfiles y Tarifas SAP' };
      case 'builder':
      default:
        return { subtitle: 'Proposal Builder', title: 'Sistema de Cotizaciones & Staffing SAP' };
    }
  };

  const navInfo = getNavTitle();

  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {navInfo.subtitle}
          </span>
          <h2 className="text-base sm:text-xl font-bold text-slate-900 line-clamp-1">
            {navInfo.title}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-4">
        <button
          onClick={onResetData}
          title="Restaurar ejemplos de cotizaciones SAP"
          className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Cargar Ejemplos</span>
        </button>

        <button
          onClick={onNewQuotation}
          className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nueva Cotización SAP</span>
          <span className="sm:hidden">Nueva</span>
        </button>
      </div>
    </header>
  );
};

