/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Quotation, QuotationStatus, SapModuleCode, Professional, ClientMasterItem, CompanyProfile } from './types';
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
import { BancoCentralModal } from './components/BancoCentralModal';
import { SAP_CATALOG_MODULES } from './data/sapModules';
import { 
  getStoredProfessionals, 
  saveStoredProfessionals, 
  getProfessionalRate 
} from './data/professionals';
import { getStoredClients, saveStoredClients } from './data/clientsMaster';
import { getStoredCompanyProfile, saveStoredCompanyProfile } from './data/companyProfile';
import { 
  BancoCentralData, 
  fetchBancoCentralIndicators, 
  getCachedBancoCentralData 
} from './services/bcentralService';

const STORAGE_KEY = 'sap_quotations_v1_data';

export default function App() {
  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // If stored data doesn't have the new UF proposal, merge it in
        const hasUfQuote = parsed.some((q: Quotation) => q.currency === 'UF');
        if (!hasUfQuote) {
          const ufQuote = INITIAL_QUOTATIONS.find(q => q.currency === 'UF');
          if (ufQuote) return [ufQuote, ...parsed];
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error loading quotations from localStorage', e);
    }
    return INITIAL_QUOTATIONS;
  });

  // Banco Central de Chile Indicators
  const [bcentralData, setBcentralData] = useState<BancoCentralData>(getCachedBancoCentralData());
  const [isBancoCentralModalOpen, setIsBancoCentralModalOpen] = useState(false);

  // Fetch live indicators from /api/bcentral/indicators (backed by Banco Central de Chile API)
  useEffect(() => {
    fetchBancoCentralIndicators(false)
      .then(data => setBcentralData(data))
      .catch(err => console.warn('Could not sync Banco Central indicators:', err));
  }, []);

  // Navigation state matching Geometric Balance sidebar
  const [activeNav, setActiveNav] = useState<'builder' | 'history' | 'clients' | 'resources'>('builder');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Collapsible Curtain Sidebar (default true to maximize screen space)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('sap_sidebar_collapsed');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const handleToggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('sap_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Active Modals & Views
  const [selectedQuote, setSelectedQuote] = useState<Quotation | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quotation | null>(null);
  const [handoverQuote, setHandoverQuote] = useState<Quotation | null>(null);
  const [printQuote, setPrintQuote] = useState<Quotation | null>(null);

  // Dedicated Professionals & Tariff Catalog State
  const [professionals, setProfessionals] = useState<Professional[]>(getStoredProfessionals);

  // Dedicated Client Master & Company Profile State
  const [clients, setClients] = useState<ClientMasterItem[]>(getStoredClients);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(getStoredCompanyProfile);

  const handleUpdateProfessionals = (updated: Professional[]) => {
    setProfessionals(updated);
    saveStoredProfessionals(updated);
  };

  const handleUpdateClients = (updated: ClientMasterItem[]) => {
    setClients(updated);
    saveStoredClients(updated);
  };

  const handleUpdateCompanyProfile = (updated: CompanyProfile) => {
    setCompanyProfile(updated);
    saveStoredCompanyProfile(updated);
  };

  const handleNewQuoteWithClient = (client: ClientMasterItem) => {
    const customQuote: Quotation = {
      id: `quote-${Date.now()}`,
      code: `COT-SAP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
      version: '1.0',
      createdAt: new Date().toISOString().slice(0, 10),
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      status: 'draft',
      currency: 'CLP',
      currencySymbol: '$',
      client: {
        companyName: client.companyName,
        fantasyName: client.fantasyName,
        taxId: client.taxId,
        businessActivity: client.businessActivity,
        siiActivityCode: client.siiActivityCode,
        taxAddress: client.taxAddress,
        comuna: client.comuna,
        city: client.city,
        country: client.country,
        contactName: client.contactName,
        contactRole: client.contactRole,
        contactEmail: client.contactEmail,
        contactPhone: client.contactPhone,
        billingEmail: client.billingEmail,
        industry: client.industry,
        logoUrl: client.logoUrl
      },
      project: {
        projectTitle: `Consultoría y Servicios SAP para ${client.fantasyName || client.companyName}`,
        projectType: 'Roll-out de Módulos',
        sapSystemVersion: 'SAP S/4HANA 2023',
        methodology: 'SAP Activate',
        durationMonths: 4,
        estimatedStartDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
        businessObjective: `Implementación y optimización de soluciones empresariales para ${client.companyName}.`,
        scopeDescription: 'Alcance técnico de consultoría, parametrización y soporte de procesos de negocio.',
        assumptions: [
          'Disponibilidad del equipo clave del cliente',
          'Accesos a ambientes SAP otorgados oportunamente',
          'Validaciones de pruebas de aceptación UAT en plazos estipulados'
        ],
        outOfScope: [
          'Licencias de software base SAP',
          'Costos de infraestructura Cloud/Hosting'
        ]
      },
      resources: [],
      milestones: [],
      discountPercentage: 0,
      taxRatePercentage: 19,
      expensesAmount: 0,
      paymentTerms: '30% al inicio, 40% en pruebas de integración, 30% al cierre del proyecto.',
      guaranteeHypercareDays: 30,
      statusHistory: [],
      updatedAt: new Date().toISOString().slice(0, 10)
    };

    setEditingQuote(customQuote);
    setIsFormOpen(true);
  };

  const handleNewQuoteWithProfessional = (prof: Professional) => {
    const currency = 'CLP';
    const rate = getProfessionalRate(prof, currency);
    const hours = 160;
    const customQuote: Quotation = {
      id: `quote-${Date.now()}`,
      code: `COT-SAP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
      version: '1.0',
      createdAt: new Date().toISOString().slice(0, 10),
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      status: 'draft',
      currency: 'CLP',
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
        projectTitle: `Consultoría Especializada SAP ${prof.moduleCode.replace('SAP_', '')} - ${prof.name}`,
        projectType: 'Soporte AMS / Bolsa de Horas',
        sapSystemVersion: 'SAP S/4HANA 2023',
        methodology: 'SAP Activate',
        durationMonths: 3,
        estimatedStartDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
        businessObjective: `Provisión de servicios profesionales de alto nivel para ${prof.moduleName}.`,
        scopeDescription: `Asignación de consultor especialista: ${prof.name} (${prof.roleTitle}). ${prof.bio || ''}`,
        assumptions: [
          'Acceso a los sistemas SAP del cliente',
          'Interlocutor técnico asignado',
          'Ambiente de pruebas disponible'
        ],
        outOfScope: [
          'Licenciamiento de software SAP',
          'Infraestructura de hardware o hosting'
        ]
      },
      resources: [
        {
          id: `res-${Date.now()}-1`,
          moduleCode: prof.moduleCode,
          moduleName: prof.moduleName,
          roleTitle: `${prof.name} (${prof.roleTitle})`,
          seniority: prof.seniority,
          hours: hours,
          hourlyRate: rate,
          subtotal: rate * hours,
          modality: prof.modality,
          responsibilities: prof.skills?.join(', ') || 'Consultoría especializada SAP.',
          professionalId: prof.id,
          professionalName: prof.name
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
        companyProfile={companyProfile}
      />
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#F1F5F9] font-sans overflow-hidden text-slate-800">
      {/* Left Curtain Sidebar */}
      <Sidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        quotations={quotations}
        onNewQuotation={handleNewQuotation}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebarCollapse}
        professionalsCount={professionals.length}
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
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebarCollapse={handleToggleSidebarCollapse}
          bcentralData={bcentralData}
          onOpenBancoCentralModal={() => setIsBancoCentralModalOpen(true)}
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
              onNewQuotationWithClient={handleNewQuoteWithClient}
              clients={clients}
              onUpdateClients={handleUpdateClients}
              companyProfile={companyProfile}
              onUpdateCompanyProfile={handleUpdateCompanyProfile}
            />
          ) : activeNav === 'resources' ? (
            <ResourceMasterView
              professionals={professionals}
              onUpdateProfessionals={handleUpdateProfessionals}
              onNewQuoteWithModule={handleNewQuoteWithModule}
              onNewQuoteWithProfessional={handleNewQuoteWithProfessional}
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
          professionals={professionals}
          onSaveClientToMaster={newOrUpdatedClient => {
            const exists = clients.some(c => c.taxId === newOrUpdatedClient.taxId || c.id === newOrUpdatedClient.id);
            let updated: ClientMasterItem[];
            if (exists) {
              updated = clients.map(c => (c.taxId === newOrUpdatedClient.taxId || c.id === newOrUpdatedClient.id) ? { ...c, ...newOrUpdatedClient } : c);
            } else {
              updated = [newOrUpdatedClient, ...clients];
            }
            handleUpdateClients(updated);
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

      {/* Modal 4: Banco Central de Chile Official Indicators & UF Calculator */}
      <BancoCentralModal
        isOpen={isBancoCentralModalOpen}
        onClose={() => setIsBancoCentralModalOpen(false)}
        data={bcentralData}
        onDataUpdated={setBcentralData}
      />
    </div>
  );
}

