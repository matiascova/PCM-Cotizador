/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Quotation, QuotationStatus, SapModuleCode } from './types';
import { INITIAL_QUOTATIONS } from './data/initialQuotations';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MetricSummaryBar } from './components/MetricSummaryBar';
import { QuotationList } from './components/QuotationList';
import { ClientsView } from './components/ClientsView';
import { ResourceMasterView } from './components/ResourceMasterView';
import { WorkflowTrackingFooter } from './components/WorkflowTrackingFooter';
import { QuotationForm } from './components/QuotationForm';
import { QuotationDetailModal } from './components/QuotationDetailModal';
import { ProjectExecutionHandover } from './components/ProjectExecutionHandover';
import { QuotationPrintView } from './components/QuotationPrintView';
import { SAP_CATALOG_MODULES } from './data/sapModules';

const STORAGE_KEY = 'sap_quotations_v1_data';

export default function App() {
  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading quotations from localStorage', e);
    }
    return INITIAL_QUOTATIONS;
  });

  // Navigation state matching Geometric Balance sidebar
  const [activeNav, setActiveNav] = useState<'builder' | 'history' | 'clients' | 'resources'>('builder');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Active Modals & Views
  const [selectedQuote, setSelectedQuote] = useState<Quotation | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quotation | null>(null);
  const [handoverQuote, setHandoverQuote] = useState<Quotation | null>(null);
  const [printQuote, setPrintQuote] = useState<Quotation | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(quotations));
    } catch (e) {
      console.error('Error saving quotations to localStorage', e);
    }
  }, [quotations]);

  // Keep active modal up-to-date if quotation data changed
  useEffect(() => {
    if (selectedQuote) {
      const refreshed = quotations.find(q => q.id === selectedQuote.id);
      if (refreshed) setSelectedQuote(refreshed);
    }
    if (handoverQuote) {
      const refreshed = quotations.find(q => q.id === handoverQuote.id);
      if (refreshed) setHandoverQuote(refreshed);
    }
  }, [quotations]);

  // Actions
  const handleNewQuotation = () => {
    setEditingQuote(null);
    setIsFormOpen(true);
  };

  const handleNewQuoteWithModule = (moduleCode: SapModuleCode) => {
    const mod = SAP_CATALOG_MODULES.find(m => m.code === moduleCode);
    const hourlyRate = mod ? mod.benchmarkRatesUSD['Senior'] : 90;
    const customQuote: Quotation = {
      id: `quote-${Date.now()}`,
      code: `COT-SAP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
      version: '1.0',
      createdAt: new Date().toISOString().slice(0, 10),
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      status: 'draft',
      currency: 'USD',
      currencySymbol: '$',
      client: {
        companyName: '',
        taxId: '',
        contactName: '',
        contactRole: 'Gerente de TI / Transformación Digital',
        contactEmail: '',
        contactPhone: '',
        industry: 'Manufactura & Operaciones',
        country: 'Chile'
      },
      project: {
        projectTitle: `Implementación & Consultoría Especializada ${mod ? mod.name : 'SAP'}`,
        projectType: 'Roll-out de Módulos',
        sapSystemVersion: 'SAP S/4HANA 2023',
        methodology: 'SAP Activate',
        durationMonths: 4,
        estimatedStartDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
        businessObjective: `Configuración y puesta en marcha de ${mod ? mod.name : 'módulo SAP'}.`,
        scopeDescription: `Servicios profesionales de consultoría funcional y técnica para ${mod ? mod.name : 'módulo SAP'}.`,
        assumptions: [],
        outOfScope: []
      },
      resources: [
        {
          id: `res-${Date.now()}-1`,
          moduleCode: moduleCode,
          moduleName: mod ? mod.name : moduleCode,
          roleTitle: `Consultor Senior ${mod ? mod.name : moduleCode}`,
          seniority: 'Senior',
          hours: 160,
          hourlyRate: hourlyRate,
          subtotal: hourlyRate * 160,
          modality: 'Híbrido',
          responsibilities: mod?.typicalDeliverables[0] || 'Consultoría especializada SAP.'
        }
      ],
      milestones: [],
      discountPercentage: 0,
      taxRatePercentage: 19,
      expensesAmount: 0,
      paymentTerms: '50% al inicio de fase Realize, 50% a la salida en vivo (Go-Live).',
      guaranteeHypercareDays: 30,
      statusHistory: [],
      updatedAt: new Date().toISOString().slice(0, 10)
    };

    setEditingQuote(customQuote);
    setIsFormOpen(true);
  };

  const handleEditQuotation = (quote: Quotation) => {
    setEditingQuote(quote);
    setIsFormOpen(true);
    setSelectedQuote(null);
  };

  const handleSaveQuotation = (saved: Quotation) => {
    setQuotations(prev => {
      const exists = prev.some(q => q.id === saved.id);
      if (exists) {
        return prev.map(q => (q.id === saved.id ? saved : q));
      } else {
        return [saved, ...prev];
      }
    });

    setIsFormOpen(false);
    setEditingQuote(null);
    setSelectedQuote(saved);
  };

  const handleUpdateQuotation = (updated: Quotation) => {
    setQuotations(prev => prev.map(q => (q.id === updated.id ? updated : q)));
  };

  const handleDeleteQuotation = (quoteId: string) => {
    setQuotations(prev => prev.filter(q => q.id !== quoteId));
    if (selectedQuote?.id === quoteId) setSelectedQuote(null);
    if (handoverQuote?.id === quoteId) setHandoverQuote(null);
  };

  const handleDuplicateQuotation = (quote: Quotation) => {
    const newCode = `COT-SAP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`;
    const duplicated: Quotation = {
      ...quote,
      id: `quote-${Date.now()}`,
      code: newCode,
      version: '1.0',
      createdAt: new Date().toISOString().slice(0, 10),
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      status: 'draft',
      rejectionReason: undefined,
      statusHistory: [
        {
          id: `log-dup-${Date.now()}`,
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          status: 'draft',
          note: `Duplicada a partir de la cotización ${quote.code}.`,
          author: 'Líder Comercial SAP'
        }
      ],
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    setQuotations(prev => [duplicated, ...prev]);
    setSelectedQuote(duplicated);
  };

  const handleUpdateQuoteStatus = (quoteId: string, newStatus: QuotationStatus) => {
    setQuotations(prev => prev.map(q => {
      if (q.id !== quoteId) return q;
      const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
      return {
        ...q,
        status: newStatus,
        statusHistory: [
          {
            id: `log-st-${Date.now()}`,
            date: now,
            status: newStatus,
            note: `Estado cambiado a ${newStatus}.`,
            author: 'Gestor Comercial SAP'
          },
          ...(q.statusHistory || [])
        ],
        updatedAt: now
      };
    }));
  };

  const handleResetData = () => {
    if (confirm('¿Desea restablecer las cotizaciones de ejemplo preconfiguradas?')) {
      setQuotations(INITIAL_QUOTATIONS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_QUOTATIONS));
    }
  };

  // If in Print View mode, render print view full page
  if (printQuote) {
    return (
      <QuotationPrintView
        quote={printQuote}
        onBack={() => setPrintQuote(null)}
      />
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#F1F5F9] font-sans overflow-hidden text-slate-800">
      {/* Left Sidebar matching Geometric Balance theme */}
      <Sidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        quotations={quotations}
        onNewQuotation={handleNewQuotation}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header
          quotations={quotations}
          activeNav={activeNav}
          onNewQuotation={handleNewQuotation}
          onResetData={handleResetData}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* Scrollable Center Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Top KPI Metrics Bar */}
          <MetricSummaryBar quotations={quotations} />

          {/* Views based on sidebar navigation */}
          {activeNav === 'clients' ? (
            <ClientsView
              quotations={quotations}
              onSelectQuote={quote => setSelectedQuote(quote)}
              onNewQuotation={handleNewQuotation}
            />
          ) : activeNav === 'resources' ? (
            <ResourceMasterView
              onNewQuoteWithModule={handleNewQuoteWithModule}
            />
          ) : (
            /* Builder & History: Quotation List and Pipeline */
            <QuotationList
              quotations={quotations}
              onSelectQuote={quote => setSelectedQuote(quote)}
              onEditQuote={handleEditQuotation}
              onDeleteQuote={handleDeleteQuotation}
              onDuplicateQuote={handleDuplicateQuotation}
              onOpenHandover={quote => setHandoverQuote(quote)}
              onUpdateQuoteStatus={handleUpdateQuoteStatus}
              onNewQuotation={handleNewQuotation}
            />
          )}
        </div>

        {/* Bottom Workflow Tracking Bar */}
        <WorkflowTrackingFooter quotations={quotations} />
      </main>

      {/* Modal 1: Create / Edit Quotation Form */}
      {isFormOpen && (
        <QuotationForm
          initialQuote={editingQuote}
          onSave={handleSaveQuotation}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingQuote(null);
          }}
        />
      )}

      {/* Modal 2: Quotation Detail & Tracking Modal */}
      {selectedQuote && !isFormOpen && (
        <QuotationDetailModal
          quote={selectedQuote}
          onClose={() => setSelectedQuote(null)}
          onEdit={handleEditQuotation}
          onUpdateQuote={handleUpdateQuotation}
          onOpenHandover={quote => {
            setSelectedQuote(null);
            setHandoverQuote(quote);
          }}
          onOpenPrintView={quote => {
            setSelectedQuote(null);
            setPrintQuote(quote);
          }}
        />
      )}

      {/* Modal 3: Project Execution Handover Sheet (For Approved Quotes) */}
      {handoverQuote && (
        <ProjectExecutionHandover
          quote={handoverQuote}
          onUpdateQuote={handleUpdateQuotation}
          onClose={() => setHandoverQuote(null)}
        />
      )}
    </div>
  );
}

