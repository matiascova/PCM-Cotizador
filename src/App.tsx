/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Quotation, 
  QuotationStatus, 
  SapModuleCode, 
  Professional, 
  ClientMasterItem, 
  CompanyProfile,
  AppUser,
  AppNavTab
} from './types';
import { INITIAL_QUOTATIONS } from './data/initialQuotations';
import { translateGanttPlanToSpanish } from './data/ganttTemplates';
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
import { ProcurementView } from './components/ProcurementView';
import { SuppliersView } from './components/SuppliersView';
import { UsersView } from './components/UsersView';
import { LoginView } from './components/LoginView';
import { 
  getStoredUsers, 
  saveStoredUsers, 
  getStoredCurrentUser, 
  saveStoredCurrentUser 
} from './data/usersMaster';
import { getStoredSolpeds } from './services/procurementService';
import { getStoredSuppliers } from './data/suppliersMaster';
import { 
  SAP_CATALOG_MODULES, 
  SapCatalogModule, 
  getStoredModules, 
  saveStoredModules, 
  getModuleBenchmarkRate 
} from './data/sapModules';
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
import { getClientLogo } from './data/defaultClientLogos';
import { isResourceRateMismatched, rescueResourceRatesForCurrency } from './utils/currencies';

const STORAGE_KEY = 'sap_quotations_v1_data';

export default function App() {
  // Authentication & Users State
  const [users, setUsers] = useState<AppUser[]>(getStoredUsers);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(getStoredCurrentUser);

  const handleUpdateUsers = (updated: AppUser[]) => {
    setUsers(updated);
    saveStoredUsers(updated);

    // If current user is updated in the list, update session as well
    if (currentUser) {
      const refreshed = updated.find(u => u.id === currentUser.id);
      if (refreshed) {
        setCurrentUser(refreshed);
        saveStoredCurrentUser(refreshed);
      }
    }
  };

  const handleLoginSuccess = (user: AppUser) => {
    setCurrentUser(user);
    saveStoredCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    saveStoredCurrentUser(null);
  };

  const handleSwitchUser = (user: AppUser) => {
    setCurrentUser(user);
    saveStoredCurrentUser(user);
  };

  // Quotations State
  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        let parsed = JSON.parse(stored);
        // If stored data doesn't have the new UF proposal, merge it in
        const hasUfQuote = parsed.some((q: Quotation) => q.currency === 'UF');
        if (!hasUfQuote) {
          const ufQuote = INITIAL_QUOTATIONS.find(q => q.currency === 'UF');
          if (ufQuote) parsed = [ufQuote, ...parsed];
        }
        return parsed.map((q: Quotation) => {
          let updatedQuote = {
            ...q,
            client: {
              ...q.client,
              logoUrl: q.client?.logoUrl && q.client.logoUrl.trim().length > 0 ? q.client.logoUrl : getClientLogo(q.client),
              fantasyName: q.client?.fantasyName || q.client?.companyName
            }
          };

          // Sanitize any mismatched legacy rates (e.g. 85000 in UF)
          if (updatedQuote.resources && updatedQuote.resources.some(r => isResourceRateMismatched(r.hourlyRate, updatedQuote.currency))) {
            const rescuedResources = rescueResourceRatesForCurrency(updatedQuote.resources, updatedQuote.currency);
            updatedQuote = {
              ...updatedQuote,
              resources: rescuedResources
            };
          }

          // Ensure Gantt plan phase names are in Spanish
          if (updatedQuote.ganttPlan) {
            updatedQuote = {
              ...updatedQuote,
              ganttPlan: translateGanttPlanToSpanish(updatedQuote.ganttPlan),
            };
          }

          return updatedQuote;
        });
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

  // Navigation state
  const [activeNav, setActiveNav] = useState<AppNavTab>('builder');
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

  // Dedicated SAP Modules & Custom Profiles Catalog State
  const [modules, setModules] = useState<SapCatalogModule[]>(getStoredModules);

  const handleUpdateProfessionals = (updated: Professional[]) => {
    setProfessionals(updated);
    saveStoredProfessionals(updated);
  };

  const handleUpdateModules = (updated: SapCatalogModule[]) => {
    setModules(updated);
    saveStoredModules(updated);
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
        taxAddress: 'Santiago, Chile',
        country: 'Chile',
        industry: 'Tecnología & Consultoría'
      },
      project: {
        projectTitle: `Asignación Especialista SAP ${prof.roleTitle}`,
        projectType: 'Soporte AMS / Bolsa de Horas',
        sapSystemVersion: 'SAP S/4HANA Cloud',
        methodology: 'Ágil / Scrum Híbrido',
        durationMonths: 1,
        estimatedStartDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
        businessObjective: `Acompañamiento especializado en el módulo ${prof.moduleName} por parte de ${prof.name}.`,
        scopeDescription: `Servicios profesionales de consultoría SAP ${prof.moduleName} (${prof.seniority}).`,
        assumptions: ['Modalidad: ' + prof.modality],
        outOfScope: ['Gastos de traslado fuera de la región si es remoto']
      },
      resources: [
        {
          id: `res-${Date.now()}`,
          moduleCode: prof.moduleCode,
          moduleName: prof.moduleName,
          roleTitle: prof.roleTitle,
          seniority: prof.seniority,
          hours: hours,
          hourlyRate: rate,
          subtotal: hours * rate,
          modality: prof.modality,
          professionalId: prof.id,
          professionalName: prof.name
        }
      ],
      milestones: [
        {
          id: 'm1',
          title: 'Facturación Mensual Staffing',
          description: 'Cierre de ciclo de 160 horas trabajadas.',
          deliverables: 'Timesheet firmado y reporte mensual de actividades SAP',
          estimatedWeek: 'Semana 4',
          paymentPercentage: 100
        }
      ],
      discountPercentage: 0,
      taxRatePercentage: 19,
      expensesAmount: 0,
      paymentTerms: '30 días contra informe de actividades aprobado',
      guaranteeHypercareDays: 15,
      statusHistory: [],
      updatedAt: new Date().toISOString().slice(0, 10)
    };

    setEditingQuote(customQuote);
    setIsFormOpen(true);
  };

  const handleNewQuoteWithModule = (mod: SapCatalogModule) => {
    const currency = 'CLP';
    const rate = getModuleBenchmarkRate(mod, 'Senior', currency);
    const hours = 120;
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
        taxAddress: 'Santiago, Chile',
        country: 'Chile',
        industry: 'Consultoría & Servicios Empresariales'
      },
      project: {
        projectTitle: `Implementación y Soporte Especializado ${mod.name} (${mod.code})`,
        projectType: 'Roll-out de Módulos',
        sapSystemVersion: 'SAP S/4HANA 2023',
        methodology: 'SAP Activate',
        durationMonths: 3,
        estimatedStartDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
        businessObjective: `Despliegue y configuración avanzada del componente funcional ${mod.name}.`,
        scopeDescription: `Configuración, parametrización estándar, pruebas de aceptación y capacitación en ${mod.name}.`,
        assumptions: [
          'Disponibilidad del equipo funcional de contraparte',
          'Accesos SAP entregados previo al inicio del sprint'
        ],
        outOfScope: ['Licenciamiento SAP base']
      },
      resources: [
        {
          id: `res-${Date.now()}`,
          moduleCode: mod.code,
          moduleName: mod.name,
          roleTitle: `Consultor Senior ${mod.code}`,
          seniority: 'Senior',
          hours: hours,
          hourlyRate: rate,
          subtotal: hours * rate,
          modality: 'Híbrido'
        }
      ],
      milestones: [
        {
          id: 'm1',
          title: 'Hito 1: Blueprint & Diseño de Procesos',
          description: `Definición de procesos To-Be para ${mod.name}`,
          deliverables: 'Documento BBD firmado',
          estimatedWeek: 'Semana 4',
          paymentPercentage: 30
        },
        {
          id: 'm2',
          title: 'Hito 2: Configuración & Pruebas Integrales',
          description: 'Parametrización en ambiente QA y pruebas E2E',
          deliverables: 'Matriz de configuración y actas de prueba',
          estimatedWeek: 'Semana 8',
          paymentPercentage: 40
        },
        {
          id: 'm3',
          title: 'Hito 3: Go-Live & Salida a Producción',
          description: 'Puesta en marcha y soporte Hypercare inicial',
          deliverables: 'Acta de Go-Live formal',
          estimatedWeek: 'Semana 12',
          paymentPercentage: 30
        }
      ],
      discountPercentage: 0,
      taxRatePercentage: 19,
      expensesAmount: 0,
      paymentTerms: '30% inicio, 40% pruebas integrales, 30% Go-Live',
      guaranteeHypercareDays: 30,
      statusHistory: [],
      updatedAt: new Date().toISOString().slice(0, 10)
    };

    setEditingQuote(customQuote);
    setIsFormOpen(true);
  };

  // Save changes to localStorage whenever quotations update
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(quotations));
    } catch (e) {
      console.error('Error saving quotations to localStorage', e);
    }
  }, [quotations]);

  // Handlers for Quote Operations
  const handleSaveQuotation = (quote: Quotation) => {
    // If client is present, ensure logoUrl is preserved or filled with default
    const clientWithLogo = {
      ...quote.client,
      logoUrl: quote.client.logoUrl && quote.client.logoUrl.trim().length > 0 ? quote.client.logoUrl : getClientLogo(quote.client),
      fantasyName: quote.client.fantasyName || quote.client.companyName
    };
    const finalQuote = { ...quote, client: clientWithLogo };

    setQuotations(prev => {
      const exists = prev.some(q => q.id === finalQuote.id);
      if (exists) {
        return prev.map(q => q.id === finalQuote.id ? finalQuote : q);
      }
      return [finalQuote, ...prev];
    });

    setIsFormOpen(false);
    setEditingQuote(null);
    setSelectedQuote(finalQuote);
  };

  const handleUpdateQuotation = (updatedQuote: Quotation) => {
    setQuotations(prev => prev.map(q => q.id === updatedQuote.id ? updatedQuote : q));
    if (selectedQuote && selectedQuote.id === updatedQuote.id) {
      setSelectedQuote(updatedQuote);
    }
  };

  const handleDeleteQuotation = (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta cotización?')) {
      setQuotations(prev => prev.filter(q => q.id !== id));
      if (selectedQuote && selectedQuote.id === id) {
        setSelectedQuote(null);
      }
    }
  };

  const handleDuplicateQuotation = (quote: Quotation) => {
    const duplicated: Quotation = {
      ...quote,
      id: `quote-${Date.now()}`,
      code: `${quote.code}-COPY`,
      version: '1.0',
      status: 'draft',
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
      statusHistory: [
        {
          id: `log-${Date.now()}`,
          date: new Date().toISOString().slice(0, 10),
          status: 'draft',
          note: `Duplicada a partir de ${quote.code}`,
          author: currentUser?.name || 'Administrador SAP'
        }
      ]
    };
    setQuotations(prev => [duplicated, ...prev]);
    setSelectedQuote(duplicated);
  };

  const handleUpdateQuoteStatus = (id: string, newStatus: QuotationStatus, note: string) => {
    setQuotations(prev => prev.map(q => {
      if (q.id === id) {
        const newLog = {
          id: `log-${Date.now()}`,
          date: new Date().toISOString().slice(0, 10),
          status: newStatus,
          note: note || `Estado cambiado a ${newStatus}`,
          author: currentUser?.name || 'Administrador SAP'
        };
        return {
          ...q,
          status: newStatus,
          updatedAt: new Date().toISOString().slice(0, 10),
          statusHistory: [...(q.statusHistory || []), newLog]
        };
      }
      return q;
    }));
  };

  const handleEditQuotation = (quote: Quotation) => {
    setEditingQuote(quote);
    setSelectedQuote(null);
    setIsFormOpen(true);
  };

  const handleNewQuotation = () => {
    setEditingQuote(null);
    setIsFormOpen(true);
  };

  const handleResetData = () => {
    if (window.confirm('¿Desea restaurar las cotizaciones a los ejemplos predeterminados?')) {
      setQuotations(INITIAL_QUOTATIONS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_QUOTATIONS));
    }
  };

  // If user is not logged in, present corporate Login View
  if (!currentUser) {
    return <LoginView users={users} onLoginSuccess={handleLoginSuccess} />;
  }

  // Full-screen Dedicated Dossier Print / Export View
  if (printQuote) {
    return (
      <QuotationPrintView
        quote={printQuote}
        onBack={() => {
          setSelectedQuote(printQuote);
          setPrintQuote(null);
        }}
      />
    );
  }

  const procurementCount = getStoredSolpeds().length;
  const suppliersCount = getStoredSuppliers().length;

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-900 overflow-hidden">
      {/* Dynamic Curtain Collapsible Sidebar */}
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
        procurementCount={procurementCount}
        suppliersCount={suppliersCount}
        usersCount={users.length}
        currentUser={currentUser}
        onLogout={handleLogout}
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
          currentUser={currentUser}
          onOpenUsersTab={() => setActiveNav('users')}
          onLogout={handleLogout}
        />

        {/* Scrollable Center Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Top KPI Metrics Bar: Presentar solo en el área de trabajo de cotizaciones */}
          {(activeNav === 'builder' || activeNav === 'history') && (
            <MetricSummaryBar quotations={quotations} />
          )}

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
              modules={modules}
              onUpdateModules={handleUpdateModules}
              onNewQuoteWithModule={handleNewQuoteWithModule}
              onNewQuoteWithProfessional={handleNewQuoteWithProfessional}
            />
          ) : activeNav === 'procurement' ? (
            <div className="w-[90vw] max-w-[90vw] mx-auto">
              <ProcurementView
                quotations={quotations}
                onSelectQuotation={quote => setSelectedQuote(quote)}
                onOpenNewQuotation={handleNewQuotation}
              />
            </div>
          ) : activeNav === 'suppliers' ? (
            <div className="w-[90vw] max-w-[90vw] mx-auto">
              <SuppliersView />
            </div>
          ) : activeNav === 'users' ? (
            <div className="w-[90vw] max-w-[90vw] mx-auto">
              <UsersView
                users={users}
                currentUser={currentUser}
                onUpdateUsers={handleUpdateUsers}
                onSwitchUser={handleSwitchUser}
              />
            </div>
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

        {/* Bottom Workflow Tracking Bar: Presentar solo en el área de trabajo de cotizaciones */}
        {(activeNav === 'builder' || activeNav === 'history') && (
          <WorkflowTrackingFooter quotations={quotations} />
        )}
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
          modules={modules}
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
