import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Clock, 
  Users, 
  Layers, 
  CheckCircle2, 
  Sparkles, 
  Building2, 
  ShieldCheck,
  Plus,
  Compass,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Pin,
  PinOff,
  ChevronRight,
  ChevronLeft,
  Globe2
} from 'lucide-react';
import { Quotation } from '../types';
import { calculateQuotationTotals, formatCurrency } from '../utils/calculations';

interface SidebarProps {
  activeNav: 'builder' | 'history' | 'clients' | 'resources';
  setActiveNav: (nav: 'builder' | 'history' | 'clients' | 'resources') => void;
  quotations: Quotation[];
  onNewQuotation: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeNav,
  setActiveNav,
  quotations,
  onNewQuotation,
  isOpenMobile,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<number | null>(null);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      window.clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (isCollapsed) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (isCollapsed) {
      hoverTimeoutRef.current = window.setTimeout(() => {
        setIsHovered(false);
      }, 150);
    }
  };

  const handleNavClick = (id: 'builder' | 'history' | 'clients' | 'resources') => {
    setActiveNav(id);
    if (isCollapsed) {
      setIsHovered(false);
    }
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const navItems: { 
    id: 'builder' | 'history' | 'clients' | 'resources'; 
    label: string; 
    icon: React.ReactNode; 
    count?: number 
  }[] = [
    { 
      id: 'builder', 
      label: 'Current Builder', 
      icon: <Layers className="w-5 h-5 shrink-0" />,
      count: quotations.length 
    },
    { 
      id: 'history', 
      label: 'Quote History', 
      icon: <Clock className="w-5 h-5 shrink-0" />,
      count: quotations.length 
    },
    { 
      id: 'clients', 
      label: 'Client Profiles', 
      icon: <Building2 className="w-5 h-5 shrink-0" />,
      count: new Set(quotations.map(q => q.client.companyName)).size 
    },
    { 
      id: 'resources', 
      label: 'Resource Master',
      icon: <ShieldCheck className="w-5 h-5 shrink-0" />
    }
  ];

  // The sidebar is shown in full width if:
  // 1. Mobile drawer is open, OR
  // 2. Desktop is NOT collapsed (pinned open), OR
  // 3. Desktop is collapsed BUT currently hovered (curtain preview)
  const isFullOpen = !isCollapsed || isHovered || isOpenMobile;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Backdrop for desktop curtain overlay when expanded by hover */}
      {isCollapsed && isHovered && !isOpenMobile && (
        <div 
          onClick={() => setIsHovered(false)}
          className="hidden lg:block fixed inset-0 bg-slate-900/20 backdrop-blur-[1px] z-30 transition-opacity"
        />
      )}

      {/* Outer wrapper to maintain layout flow on desktop */}
      <div 
        className={`hidden lg:block shrink-0 transition-all duration-300 ease-in-out relative ${
          isCollapsed ? 'w-14' : 'w-72'
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* The actual Sidebar (Curtain style) */}
        <aside 
          className={`
            fixed lg:absolute inset-y-0 left-0 z-40
            bg-[#0F172A] text-white flex flex-col border-r border-slate-700/80 shadow-2xl
            transition-all duration-300 ease-in-out overflow-hidden
            ${isFullOpen ? 'w-72' : 'w-14'}
            ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          {/* Brand Header */}
          <div className="h-16 flex items-center justify-between px-3 border-b border-slate-800 shrink-0">
            {isFullOpen ? (
              <>
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-base italic text-white shadow-md shrink-0">
                    S
                  </div>
                  <div className="truncate">
                    <h1 className="text-base font-bold tracking-tight text-white leading-none">
                      SAP<span className="font-light text-slate-400 ml-1">Quoter</span>
                    </h1>
                    <span className="text-[10px] text-slate-400 block font-mono mt-0.5">S/4HANA Consulting</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {/* Pin / Unpin button */}
                  <button
                    onClick={onToggleCollapse}
                    title={isCollapsed ? "Fijar barra abierta (Desactivar cortina)" : "Activar modo cortina (Maximizar pantalla)"}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    {isCollapsed ? (
                      <Pin className="w-4 h-4 text-slate-400 hover:text-blue-400" />
                    ) : (
                      <PinOff className="w-4 h-4 text-blue-400" />
                    )}
                  </button>

                  {/* Close button on mobile */}
                  {onCloseMobile && (
                    <button 
                      onClick={onCloseMobile}
                      className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </>
            ) : (
              /* Mini Header Icon when collapsed */
              <div className="w-full flex justify-center">
                <button
                  onClick={() => setIsHovered(true)}
                  title="Expandir cortina de navegación"
                  className="w-8 h-8 bg-blue-600 hover:bg-blue-500 rounded-lg flex items-center justify-center font-black text-base italic text-white shadow-md transition-transform hover:scale-105 cursor-pointer"
                >
                  S
                </button>
              </div>
            )}
          </div>

          {/* Quick Action Button */}
          <div className="p-2 border-b border-slate-800/60 shrink-0">
            {isFullOpen ? (
              <button
                onClick={() => {
                  onNewQuotation();
                  if (isCollapsed) setIsHovered(false);
                  if (onCloseMobile) onCloseMobile();
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-900/40 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span className="truncate">Nueva Cotización SAP</span>
              </button>
            ) : (
              <div className="group relative flex justify-center">
                <button
                  onClick={onNewQuotation}
                  className="w-10 h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center justify-center shadow-md shadow-blue-900/40 transition-transform hover:scale-105 cursor-pointer"
                  title="Nueva Cotización SAP"
                >
                  <Plus className="w-5 h-5" />
                </button>
                {/* Floating Tooltip */}
                <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none border border-slate-700 font-semibold">
                  Nueva Cotización SAP
                </div>
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-2 py-3 space-y-1.5 overflow-y-auto">
            {navItems.map(item => {
              const isActive = activeNav === item.id;
              
              if (isFullOpen) {
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-sm font-semibold' 
                        : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {item.icon}
                      <span className="text-xs font-medium truncate">{item.label}</span>
                    </div>
                    {item.count !== undefined && (
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        isActive ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              }

              // Mini Rail collapsed icon item with tooltip
              return (
                <div key={item.id} className="group relative flex justify-center">
                  <button
                    onClick={() => handleNavClick(item.id)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40' 
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {item.icon}
                    {item.count !== undefined && item.count > 0 && (
                      <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold font-mono flex items-center justify-center border-2 border-[#0F172A] ${
                        isActive ? 'bg-white text-blue-700' : 'bg-blue-600 text-white'
                      }`}>
                        {item.count}
                      </span>
                    )}
                  </button>
                  {/* Floating Tooltip */}
                  <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none border border-slate-700 font-semibold flex items-center gap-2">
                    <span>{item.label}</span>
                    {item.count !== undefined && (
                      <span className="text-[10px] font-mono text-blue-400 font-bold bg-blue-950/60 px-1.5 py-0.5 rounded">
                        {item.count}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Bottom Area */}
          <div className="p-2 border-t border-slate-800 shrink-0">
            {isFullOpen ? (
              <div className="space-y-2">
                {/* Regional Operations Badge */}
                <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/80 text-[11px]">
                  <div className="flex items-center justify-between text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-1">
                    <span>Operaciones LatAm</span>
                    <span className="text-emerald-400 font-mono">SCL • HQ</span>
                  </div>
                  <p className="text-slate-300 font-medium truncate">
                    Chile <span className="text-slate-500">→</span> UY, BR, MX, CO
                  </p>
                  <div className="flex items-center gap-1 mt-1.5 text-[9px] font-mono text-slate-400">
                    <span className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-200">🇨🇱 CLP</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-200">🇲🇽 MXN</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-200">🇺🇸 USD</span>
                  </div>
                </div>

                {/* Curtain control hint */}
                <div className="flex items-center justify-between px-1 text-[10px] text-slate-400">
                  <span className="truncate">
                    {isCollapsed ? 'Modo cortina activo' : 'Barra fija'}
                  </span>
                  <button
                    onClick={onToggleCollapse}
                    className="hover:text-blue-400 font-semibold cursor-pointer underline underline-offset-2"
                  >
                    {isCollapsed ? 'Fijar abierta' : 'Plegar a cortina'}
                  </button>
                </div>
              </div>
            ) : (
              /* Mini bottom toggle button */
              <div className="flex flex-col items-center gap-2">
                <div className="text-[11px] select-none text-slate-500" title="HQ Santiago de Chile">
                  🇨🇱
                </div>
                <div className="group relative flex justify-center">
                  <button
                    onClick={onToggleCollapse}
                    className="w-10 h-10 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                    title="Fijar barra lateral abierta"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none border border-slate-700 font-semibold">
                    Expandir barra lateral
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Mobile Drawer */}
      <aside 
        className={`
          lg:hidden fixed inset-y-0 left-0 z-50
          w-72 bg-[#0F172A] text-white flex flex-col border-r border-slate-700/80 shadow-2xl
          transition-transform duration-300 ease-in-out
          ${isOpenMobile ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Mobile Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-base italic text-white shadow-md">
              S
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white leading-none">
                SAP<span className="font-light text-slate-400 ml-1">Quoter</span>
              </h1>
              <span className="text-[10px] text-slate-400 block font-mono mt-0.5">S/4HANA Consulting</span>
            </div>
          </div>
          <button 
            onClick={onCloseMobile}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile New Quote Action */}
        <div className="p-3 border-b border-slate-800 shrink-0">
          <button
            onClick={() => {
              onNewQuotation();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Cotización SAP</span>
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-1.5 overflow-y-auto">
          {navItems.map(item => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-sm font-semibold' 
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Mobile Bottom Ops */}
        <div className="p-3 border-t border-slate-800 shrink-0">
          <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/80 text-[11px]">
            <div className="flex items-center justify-between text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-1">
              <span>Operaciones LatAm</span>
              <span className="text-emerald-400 font-mono">SCL • HQ</span>
            </div>
            <p className="text-slate-300 font-medium">
              Chile <span className="text-slate-500">→</span> UY, BR, MX, CO
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
