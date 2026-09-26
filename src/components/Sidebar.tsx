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
  Globe2, 
  ShoppingBag, 
  Truck,
  UserCheck,
  LogOut,
  Crown
} from 'lucide-react';
import { Quotation, AppUser, AppNavTab } from '../types';
import { calculateQuotationTotals, formatCurrency } from '../utils/calculations';

interface SidebarProps {
  activeNav: AppNavTab;
  setActiveNav: (nav: AppNavTab) => void;
  quotations: Quotation[];
  onNewQuotation: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  professionalsCount?: number;
  procurementCount?: number;
  suppliersCount?: number;
  usersCount?: number;
  currentUser?: AppUser | null;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeNav,
  setActiveNav,
  quotations,
  onNewQuotation,
  isOpenMobile,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
  professionalsCount,
  procurementCount,
  suppliersCount,
  usersCount,
  currentUser,
  onLogout
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

  const handleNavClick = (id: AppNavTab) => {
    setActiveNav(id);
    if (isCollapsed) {
      setIsHovered(false);
    }
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const navItems: { 
    id: AppNavTab; 
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
      label: 'Profesionales & Tarifario', 
      icon: <Users className="w-5 h-5 shrink-0" />,
      count: professionalsCount
    },
    { 
      id: 'procurement', 
      label: 'Compras & SOLPEDs', 
      icon: <ShoppingBag className="w-5 h-5 shrink-0" />,
      count: procurementCount
    },
    { 
      id: 'suppliers', 
      label: 'Maestro Proveedores', 
      icon: <Truck className="w-5 h-5 shrink-0" />,
      count: suppliersCount
    },
    { 
      id: 'users', 
      label: 'Acceso y Usuarios', 
      icon: <ShieldCheck className="w-5 h-5 shrink-0" />,
      count: usersCount
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
          className="lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 transition-opacity"
        />
      )}

      {/* Desktop Container Wrapper:
          When collapsed (and not pinned open), reserve a narrow 4rem rail in the document layout,
          while the actual sidebar expands freely over content on hover.
      */}
      <div 
        className={`hidden lg:block shrink-0 transition-all duration-300 ease-in-out z-30 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <aside 
          className={`
            fixed top-0 bottom-0 left-0 bg-[#0F172A] text-white flex flex-col border-r border-slate-800
            transition-all duration-300 ease-in-out select-none
            ${isFullOpen ? 'w-64 shadow-2xl shadow-slate-950/60' : 'w-16 shadow-md'}
          `}
        >
          {/* Header Brand Area */}
          <div className="h-16 flex items-center justify-between px-3.5 border-b border-slate-800/80 shrink-0">
            {isFullOpen ? (
              <>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 bg-linear-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center font-black text-base italic text-white shadow-md shadow-blue-500/30 shrink-0">
                    S
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-base font-bold tracking-tight text-white leading-none truncate">
                      Twin<span className="font-light text-blue-400 ml-1">Ducks</span>
                    </h1>
                    <span className="text-[10px] text-slate-400 block font-mono mt-0.5 truncate">
                      ERP SAP Suite
                    </span>
                  </div>
                </div>

                {/* Desktop Curtain Toggle / Pin Button */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={onToggleCollapse}
                    title={isCollapsed ? "Fijar barra lateral abierta" : "Plegar a modo cortina"}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    {isCollapsed ? (
                      <Pin className="w-4 h-4 text-blue-400" />
                    ) : (
                      <PinOff className="w-4 h-4 text-slate-400" />
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

              // Collapsed Mini Icon with Floating Tooltip
              return (
                <div key={item.id} className="group relative flex justify-center">
                  <button
                    onClick={() => handleNavClick(item.id)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40' 
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                    title={item.label}
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

          {/* Bottom Area - Current User & Logout */}
          <div className="p-2 border-t border-slate-800 shrink-0">
            {isFullOpen ? (
              <div className="space-y-2">
                {currentUser && (
                  <div className="p-2.5 bg-slate-800/90 rounded-xl border border-slate-700/80 text-[11px] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={currentUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=2563eb&color=fff&bold=true`}
                        alt={currentUser.name}
                        className="w-8 h-8 rounded-lg object-cover border border-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-200 truncate flex items-center gap-1">
                          <span>{currentUser.name}</span>
                        </div>
                        <div className="text-[10px] text-blue-400 font-medium capitalize truncate">
                          {currentUser.role === 'administrador' ? '👑 Administrador' : currentUser.role === 'supervisor' ? '🛡️ Supervisor' : '👤 Usuario'}
                        </div>
                      </div>
                    </div>
                    {onLogout && (
                      <button
                        type="button"
                        onClick={onLogout}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 rounded-lg transition-colors cursor-pointer"
                        title="Cerrar sesión"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}

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
              /* Mini bottom user icon */
              <div className="flex flex-col items-center gap-2">
                {currentUser && (
                  <div className="group relative flex justify-center">
                    <button
                      onClick={() => handleNavClick('users')}
                      className="w-9 h-9 rounded-xl overflow-hidden border border-slate-700 hover:border-blue-500 transition-all cursor-pointer"
                      title={currentUser.name}
                    >
                      <img
                        src={currentUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=2563eb&color=fff&bold=true`}
                        alt={currentUser.name}
                        className="w-full h-full object-cover"
                      />
                    </button>
                    <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none border border-slate-700 font-semibold">
                      {currentUser.name} ({currentUser.role})
                    </div>
                  </div>
                )}
                <div className="group relative flex justify-center">
                  <button
                    onClick={onToggleCollapse}
                    className="w-10 h-10 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                    title="Fijar barra lateral abierta"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
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
                Twin<span className="font-light text-blue-400 ml-1">Ducks</span>
              </h1>
              <span className="text-[10px] text-slate-400 block font-mono mt-0.5">ERP S/4HANA Suite</span>
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

        {/* Mobile User & Logout Area */}
        {currentUser && (
          <div className="p-3 border-t border-slate-800 shrink-0 flex items-center justify-between bg-slate-900">
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={currentUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=2563eb&color=fff&bold=true`}
                alt={currentUser.name}
                className="w-8 h-8 rounded-lg object-cover border border-slate-700"
              />
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-200 truncate">{currentUser.name}</div>
                <div className="text-[10px] text-blue-400 capitalize">{currentUser.role}</div>
              </div>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </aside>
    </>
  );
};
