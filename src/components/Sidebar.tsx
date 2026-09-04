import React from 'react';
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
  X
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
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeNav,
  setActiveNav,
  quotations,
  onNewQuotation,
  isOpenMobile,
  onCloseMobile
}) => {
  const approvedQuotes = quotations.filter(q => q.status === 'approved');
  const activeQuotes = quotations.filter(q => q.status === 'sent' || q.status === 'negotiation' || q.status === 'draft');
  
  const totalPipelineAmount = quotations.reduce((sum, q) => {
    return sum + calculateQuotationTotals(q).totalAmount;
  }, 0);

  const navItems: { id: 'builder' | 'history' | 'clients' | 'resources'; label: string; count?: number }[] = [
    { id: 'builder', label: 'Current Builder', count: quotations.length },
    { id: 'history', label: 'Quote History', count: quotations.length },
    { id: 'clients', label: 'Client Profiles', count: new Set(quotations.map(q => q.client.companyName)).size },
    { id: 'resources', label: 'Resource Master' }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 bg-[#0F172A] text-white flex flex-col p-6 border-r border-slate-700/80 shadow-2xl
        transition-transform duration-200 ease-in-out
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-bold text-lg italic text-white shadow-md">
              S
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              SAP<span className="font-light text-slate-400 ml-1">Quoter</span>
            </h1>
          </div>

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

        {/* Quick Action */}
        <button
          onClick={() => {
            onNewQuotation();
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full mb-6 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-900/40 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Cotización</span>
        </button>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {navItems.map(item => {
            const isActive = activeNav === item.id;
            return (
              <div
                key={item.id}
                onClick={() => {
                  setActiveNav(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-all ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-inner font-medium' 
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-slate-600'}`} />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.count}
                  </span>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom Active Status Card */}
        <div className="mt-auto pt-4">
          <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">
              Active Status
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              <span className="text-xs font-semibold text-slate-200 tracking-wide">
                {activeQuotes.length > 0 ? 'QUOTATION DRAFTING' : 'IDLE - READY'}
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-700/80 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">En Cartera:</span>
              <span className="font-bold text-white font-mono">
                {formatCurrency(totalPipelineAmount, 'USD', '$')}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
