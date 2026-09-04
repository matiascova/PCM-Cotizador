import React, { useState } from 'react';
import { 
  X, 
  Save, 
  Plus, 
  Trash2, 
  Users, 
  Building2, 
  FileText, 
  Calendar, 
  DollarSign, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { 
  Quotation, 
  SapResourceItem, 
  MilestoneItem, 
  SapModuleCode, 
  SeniorityLevel 
} from '../types';
import { 
  SAP_CATALOG_MODULES, 
  SAP_DEFAULT_MILESTONES, 
  STANDARD_ASSUMPTIONS, 
  STANDARD_OUT_OF_SCOPE 
} from '../data/sapModules';
import { calculateQuotationTotals, formatCurrency } from '../utils/calculations';

interface QuotationFormProps {
  initialQuote?: Quotation | null;
  onSave: (quote: Quotation) => void;
  onCancel: () => void;
}

export const QuotationForm: React.FC<QuotationFormProps> = ({
  initialQuote,
  onSave,
  onCancel
}) => {
  const isEditing = !!initialQuote;

  // Active step in the structured wizard/tabs
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form State
  const [code, setCode] = useState(initialQuote?.code || `COT-SAP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`);
  const [version, setVersion] = useState(initialQuote?.version || '1.0');
  const [createdAt, setCreatedAt] = useState(initialQuote?.createdAt || new Date().toISOString().slice(0, 10));
  const [validUntil, setValidUntil] = useState(initialQuote?.validUntil || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'CLP' | 'MXN' | 'COP'>(initialQuote?.currency || 'USD');
  const [currencySymbol, setCurrencySymbol] = useState(initialQuote?.currencySymbol || '$');

  // Client info
  const [companyName, setCompanyName] = useState(initialQuote?.client.companyName || '');
  const [taxId, setTaxId] = useState(initialQuote?.client.taxId || '');
  const [contactName, setContactName] = useState(initialQuote?.client.contactName || '');
  const [contactRole, setContactRole] = useState(initialQuote?.client.contactRole || 'Gerente de TI / Transformación Digital');
  const [contactEmail, setContactEmail] = useState(initialQuote?.client.contactEmail || '');
  const [contactPhone, setContactPhone] = useState(initialQuote?.client.contactPhone || '');
  const [industry, setIndustry] = useState(initialQuote?.client.industry || 'Manufactura & Operaciones');
  const [country, setCountry] = useState(initialQuote?.client.country || 'Chile');

  // Project scope
  const [projectTitle, setProjectTitle] = useState(initialQuote?.project.projectTitle || '');
  const [projectType, setProjectType] = useState<Quotation['project']['projectType']>(initialQuote?.project.projectType || 'Roll-out de Módulos');
  const [sapSystemVersion, setSapSystemVersion] = useState(initialQuote?.project.sapSystemVersion || 'SAP S/4HANA 2023');
  const [methodology, setMethodology] = useState<Quotation['project']['methodology']>(initialQuote?.project.methodology || 'SAP Activate');
  const [durationMonths, setDurationMonths] = useState(initialQuote?.project.durationMonths || 4);
  const [estimatedStartDate, setEstimatedStartDate] = useState(initialQuote?.project.estimatedStartDate || new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10));
  const [businessObjective, setBusinessObjective] = useState(initialQuote?.project.businessObjective || '');
  const [scopeDescription, setScopeDescription] = useState(initialQuote?.project.scopeDescription || '');
  const [assumptions, setAssumptions] = useState<string[]>(initialQuote?.project.assumptions || STANDARD_ASSUMPTIONS);
  const [outOfScope, setOutOfScope] = useState<string[]>(initialQuote?.project.outOfScope || STANDARD_OUT_OF_SCOPE);

  // Resources (The core SAP modules: HCM, MM, LE, PM, QM, ABAP, Basis, Security)
  const [resources, setResources] = useState<SapResourceItem[]>(
    initialQuote?.resources || [
      {
        id: 'res-init-1',
        moduleCode: 'SAP_MM',
        moduleName: 'SAP MM (Materials Management)',
        roleTitle: 'Consultor Funcional Senior SAP MM',
        seniority: 'Senior',
        hours: 160,
        hourlyRate: 90,
        subtotal: 14400,
        modality: 'Híbrido',
        responsibilities: 'Configuración de compras, gestión de almacenes e inventarios.'
      },
      {
        id: 'res-init-2',
        moduleCode: 'DEV_ABAP',
        moduleName: 'Desarrollador ABAP / Fiori',
        roleTitle: 'Desarrollador Senior ABAP Cloud',
        seniority: 'Senior',
        hours: 120,
        hourlyRate: 85,
        subtotal: 10200,
        modality: 'Remoto',
        responsibilities: 'Desarrollo de CDS views, reportes y formularios.'
      }
    ]
  );

  // Milestones
  const [milestones, setMilestones] = useState<MilestoneItem[]>(
    initialQuote?.milestones || SAP_DEFAULT_MILESTONES.map((m, idx) => ({
      id: `m-init-${idx}`,
      ...m
    }))
  );

  // Financials
  const [discountPercentage, setDiscountPercentage] = useState(initialQuote?.discountPercentage || 0);
  const [taxRatePercentage, setTaxRatePercentage] = useState(initialQuote?.taxRatePercentage || 19);
  const [expensesAmount, setExpensesAmount] = useState(initialQuote?.expensesAmount || 0);
  const [paymentTerms, setPaymentTerms] = useState(initialQuote?.paymentTerms || 'Facturación contra hito formalmente aceptado (30 días fecha factura).');
  const [guaranteeHypercareDays, setGuaranteeHypercareDays] = useState(initialQuote?.guaranteeHypercareDays || 30);

  // Live Calculations
  const previewTotals = calculateQuotationTotals({
    resources,
    discountPercentage,
    taxRatePercentage,
    expensesAmount
  });

  const totalMilestonePercentage = milestones.reduce((sum, m) => sum + (Number(m.paymentPercentage) || 0), 0);

  // Currency handler
  const handleCurrencyChange = (newCurr: 'USD' | 'EUR' | 'CLP' | 'MXN' | 'COP') => {
    setCurrency(newCurr);
    const symbols: Record<string, string> = { USD: '$', EUR: '€', CLP: '$', MXN: '$', COP: '$' };
    setCurrencySymbol(symbols[newCurr] || '$');
  };

  // Add Resource from catalog
  const handleAddModuleFromCatalog = (catalogMod: typeof SAP_CATALOG_MODULES[0]) => {
    const defaultSeniority: SeniorityLevel = 'Senior';
    const rate = catalogMod.benchmarkRatesUSD[defaultSeniority] || 90;
    const hours = 120;

    const newRes: SapResourceItem = {
      id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      moduleCode: catalogMod.code,
      moduleName: catalogMod.name,
      roleTitle: `Consultor ${catalogMod.shortName} (${defaultSeniority})`,
      seniority: defaultSeniority,
      hours,
      hourlyRate: rate,
      subtotal: hours * rate,
      modality: 'Híbrido',
      responsibilities: catalogMod.defaultResponsibilities
    };

    setResources([...resources, newRes]);
  };

  const handleUpdateResource = (id: string, updates: Partial<SapResourceItem>) => {
    setResources(prev => prev.map(r => {
      if (r.id !== id) return r;
      const updated = { ...r, ...updates };
      const hours = Number(updated.hours) || 0;
      const rate = Number(updated.hourlyRate) || 0;
      updated.subtotal = hours * rate;
      return updated;
    }));
  };

  const handleDeleteResource = (id: string) => {
    setResources(prev => prev.filter(r => r.id !== id));
  };

  // Milestones handlers
  const handleAddMilestone = () => {
    const newM: MilestoneItem = {
      id: `m-${Date.now()}`,
      title: `Fase ${milestones.length + 1}: Nueva Entrega`,
      description: 'Definición de alcance de la fase y entregables.',
      deliverables: 'Documento técnico de entrega y pruebas.',
      estimatedWeek: `Semana ${milestones.length * 3 + 1} - ${milestones.length * 3 + 3}`,
      paymentPercentage: 15
    };
    setMilestones([...milestones, newM]);
  };

  const handleUpdateMilestone = (id: string, updates: Partial<MilestoneItem>) => {
    setMilestones(prev => prev.map(m => (m.id === id ? { ...m, ...updates } : m)));
  };

  const handleDeleteMilestone = (id: string) => {
    setMilestones(prev => prev.filter(m => m.id !== id));
  };

  const handleResetToStandardMilestones = () => {
    setMilestones(SAP_DEFAULT_MILESTONES.map((m, idx) => ({
      id: `m-std-${Date.now()}-${idx}`,
      ...m
    })));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName.trim()) {
      alert('Por favor ingrese el nombre de la empresa cliente.');
      setActiveStep(1);
      return;
    }

    if (!projectTitle.trim()) {
      alert('Por favor ingrese el título del proyecto SAP.');
      setActiveStep(2);
      return;
    }

    if (resources.length === 0) {
      alert('Debe agregar al menos un recurso de consultoría SAP.');
      setActiveStep(3);
      return;
    }

    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const initialHistory = initialQuote?.statusHistory || [
      {
        id: `log-created-${Date.now()}`,
        date: now,
        status: 'draft',
        note: isEditing ? 'Cotización modificada y actualizada.' : 'Cotización creada en estado Borrador.',
        author: 'Consultor Preventa SAP'
      }
    ];

    const savedQuotation: Quotation = {
      id: initialQuote?.id || `quote-${Date.now()}`,
      code,
      version,
      createdAt,
      validUntil,
      currency,
      currencySymbol,
      status: initialQuote?.status || 'draft',
      rejectionReason: initialQuote?.rejectionReason,
      client: {
        companyName,
        taxId,
        contactName,
        contactRole,
        contactEmail,
        contactPhone,
        industry,
        country
      },
      project: {
        projectTitle,
        projectType,
        businessObjective,
        methodology,
        durationMonths: Number(durationMonths) || 1,
        estimatedStartDate,
        sapSystemVersion,
        scopeDescription,
        assumptions,
        outOfScope
      },
      resources,
      milestones,
      discountPercentage: Number(discountPercentage) || 0,
      taxRatePercentage: Number(taxRatePercentage) || 0,
      expensesAmount: Number(expensesAmount) || 0,
      paymentTerms,
      guaranteeHypercareDays: Number(guaranteeHypercareDays) || 0,
      statusHistory: initialHistory,
      updatedAt: now,
      handoverNotes: initialQuote?.handoverNotes,
      executionAssignedPM: initialQuote?.executionAssignedPM,
      actualProjectCode: initialQuote?.actualProjectCode
    };

    onSave(savedQuotation);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex justify-center p-2 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-5xl w-full flex flex-col max-h-[94vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-sm">
              SAP
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {isEditing ? `Editar Cotización: ${initialQuote.code}` : 'Nueva Cotización de Consultoría SAP'}
              </h2>
              <p className="text-xs text-slate-400">
                Estructuración de alcance, recursos por módulo SAP, hitos y condiciones comerciales
              </p>
            </div>
          </div>

          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator / Wizard Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-1 sm:gap-4 overflow-x-auto text-xs font-semibold">
          {[
            { step: 1, label: '1. Cliente & Oferta', icon: Building2 },
            { step: 2, label: '2. Alcance & Metodología', icon: Layers },
            { step: 3, label: `3. Recursos SAP (${resources.length})`, icon: Users },
            { step: 4, label: `4. Hitos (${milestones.length})`, icon: Calendar },
            { step: 5, label: '5. Precios & Cierre', icon: DollarSign }
          ].map(s => {
            const Icon = s.icon;
            const isCurr = activeStep === s.step;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => setActiveStep(s.step as any)}
                className={`py-2 px-3 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  isCurr
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-slate-800">
          
          {/* STEP 1: GENERAL DATA & CLIENT */}
          {activeStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Proposal Header Meta */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Identificación de la Cotización
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Código Cotización</label>
                    <input
                      type="text"
                      value={code}
                      onChange={e => setCode(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Versión</label>
                    <input
                      type="text"
                      value={version}
                      onChange={e => setVersion(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Fecha Emisión</label>
                    <input
                      type="date"
                      value={createdAt}
                      onChange={e => setCreatedAt(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Validez Oferta</label>
                    <input
                      type="date"
                      value={validUntil}
                      onChange={e => setValidUntil(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Moneda</label>
                    <select
                      value={currency}
                      onChange={e => handleCurrencyChange(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="USD">USD ($ Dólar)</option>
                      <option value="CLP">CLP ($ Peso Chileno)</option>
                      <option value="MXN">MXN ($ Peso Mexicano)</option>
                      <option value="EUR">EUR (€ Euro)</option>
                      <option value="COP">COP ($ Peso Colombiano)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Client Info */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  Datos de la Empresa Cliente
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nombre / Razón Social del Cliente *
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                      placeholder="ej. Minera Andina del Cobre S.A."
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      RUT / RFC / Tax ID
                    </label>
                    <input
                      type="text"
                      value={taxId}
                      onChange={e => setTaxId(e.target.value)}
                      placeholder="ej. 76.452.890-3"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Contacto Principal
                    </label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={e => setContactName(e.target.value)}
                      placeholder="ej. Ing. Roberto Valenzuela"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Cargo del Contacto
                    </label>
                    <input
                      type="text"
                      value={contactRole}
                      onChange={e => setContactRole(e.target.value)}
                      placeholder="ej. Gerente de TI & Sistemas"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={e => setContactEmail(e.target.value)}
                      placeholder="contacto@empresa.com"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={e => setContactPhone(e.target.value)}
                      placeholder="+56 9 8452 1190"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Industria / Sector
                    </label>
                    <input
                      type="text"
                      value={industry}
                      onChange={e => setIndustry(e.target.value)}
                      placeholder="Minería, Retail, Manufactura, etc."
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      País
                    </label>
                    <input
                      type="text"
                      value={country}
                      onChange={e => setCountry(e.target.value)}
                      placeholder="Chile, México, Colombia, etc."
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PROJECT SCOPE & METHODOLOGY */}
          {activeStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600" />
                  Definición Técnica del Proyecto SAP
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Título Descriptivo del Proyecto SAP *
                    </label>
                    <input
                      type="text"
                      value={projectTitle}
                      onChange={e => setProjectTitle(e.target.value)}
                      placeholder="ej. Rollout Logístico e Industrial SAP MM, LE y PM en S/4HANA"
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Tipo de Servicio SAP
                    </label>
                    <select
                      value={projectType}
                      onChange={e => setProjectType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="Roll-out de Módulos">Roll-out de Módulos (MM, LE, PM, QM, HCM)</option>
                      <option value="Implementación Greenfield">Implementación Nueva (Greenfield)</option>
                      <option value="Conversión S/4HANA">Migración / Conversión S/4HANA (Brownfield)</option>
                      <option value="Soporte AMS / Bolsa de Horas">Soporte AMS / Bolsa de Horas Recurrente</option>
                      <option value="Fábrica ABAP / Fiori">Fábrica de Software ABAP & Fiori</option>
                      <option value="Auditoría & Optimización">Consultoría Especializada / Auditoría Basis & Seguridad</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Versión de Sistema SAP
                    </label>
                    <input
                      type="text"
                      value={sapSystemVersion}
                      onChange={e => setSapSystemVersion(e.target.value)}
                      placeholder="ej. SAP S/4HANA 2023, SAP ECC 6.0 EHP8, Cloud Private"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Metodología de Proyecto
                    </label>
                    <select
                      value={methodology}
                      onChange={e => setMethodology(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="SAP Activate">SAP Activate (Discover, Prepare, Explore, Realize, Deploy, Run)</option>
                      <option value="ASAP Clásica">Metodología ASAP Clásica</option>
                      <option value="Ágil / Scrum Híbrido">Ágil / Scrum Híbrido (Sprints de Desarrollo)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Duración (Meses)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="36"
                        value={durationMonths}
                        onChange={e => setDurationMonths(Number(e.target.value) || 1)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Inicio Tentativo
                      </label>
                      <input
                        type="date"
                        value={estimatedStartDate}
                        onChange={e => setEstimatedStartDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Objetivo de Negocio
                    </label>
                    <textarea
                      rows={2}
                      value={businessObjective}
                      onChange={e => setBusinessObjective(e.target.value)}
                      placeholder="Describa el objetivo principal que busca la organización con este servicio SAP..."
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Descripción Detallada del Alcance
                    </label>
                    <textarea
                      rows={3}
                      value={scopeDescription}
                      onChange={e => setScopeDescription(e.target.value)}
                      placeholder="Detalle de procesos a parametrizar, módulos cubiertos, talleres de diseño BBP, desarrollos y acompañamiento..."
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: RESOURCES & SAP STAFFING PLAN (KEY USER REQUIREMENT) */}
          {activeStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Quick Catalog Adder: The explicit requested roles: HCM, MM, LE, PM, QM, ABAP, Basis, Seguridad */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-blue-600" />
                    Catálogo Rápido: Agregar Especialistas y Módulos SAP
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Haga clic para añadir el perfil con horas y tarifas sugeridas
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {SAP_CATALOG_MODULES.map(mod => (
                    <button
                      key={mod.code}
                      type="button"
                      onClick={() => handleAddModuleFromCatalog(mod)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-blue-50 hover:border-blue-300 text-slate-800 text-xs font-medium flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                      title={mod.description}
                    >
                      <Plus className="w-3 h-3 text-blue-600" />
                      <span>{mod.shortName}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Resources Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <div className="bg-slate-100 p-3 border-b border-slate-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">
                    Staffing Plan de la Cotización ({resources.length} perfiles agregados)
                  </span>
                  <span className="font-bold text-blue-700">
                    Total Horas: {previewTotals.totalHours} hrs | Subtotal: {formatCurrency(previewTotals.subtotalConsulting, currency, currencySymbol)}
                  </span>
                </div>

                <div className="divide-y divide-slate-200">
                  {resources.map((res, index) => (
                    <div key={res.id} className="p-3.5 hover:bg-slate-50/60 transition-colors">
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-xs">
                        
                        {/* Module & Role Name */}
                        <div className="sm:col-span-4">
                          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                            {res.moduleName}
                          </span>
                          <input
                            type="text"
                            value={res.roleTitle}
                            onChange={e => handleUpdateResource(res.id, { roleTitle: e.target.value })}
                            placeholder="Título del Perfil"
                            className="w-full mt-1 px-2 py-1.5 bg-white border border-slate-300 rounded font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        {/* Seniority */}
                        <div className="sm:col-span-2">
                          <label className="text-[10px] text-slate-500 block">Seniority</label>
                          <select
                            value={res.seniority}
                            onChange={e => {
                              const newSeniority = e.target.value as SeniorityLevel;
                              const catalog = SAP_CATALOG_MODULES.find(m => m.code === res.moduleCode);
                              const newRate = catalog ? catalog.benchmarkRatesUSD[newSeniority] : res.hourlyRate;
                              handleUpdateResource(res.id, { 
                                seniority: newSeniority,
                                hourlyRate: newRate
                              });
                            }}
                            className="w-full mt-0.5 px-2 py-1.5 bg-white border border-slate-300 rounded text-slate-800 focus:outline-none"
                          >
                            <option value="Junior">Junior (1-2 a)</option>
                            <option value="Semi-Senior">Semi-Senior (3-5 a)</option>
                            <option value="Senior">Senior (6-9 a)</option>
                            <option value="Lead / Arquitecto">Lead / Arquitecto (+10 a)</option>
                          </select>
                        </div>

                        {/* Modality */}
                        <div className="sm:col-span-2">
                          <label className="text-[10px] text-slate-500 block">Modalidad</label>
                          <select
                            value={res.modality}
                            onChange={e => handleUpdateResource(res.id, { modality: e.target.value as any })}
                            className="w-full mt-0.5 px-2 py-1.5 bg-white border border-slate-300 rounded text-slate-800 focus:outline-none"
                          >
                            <option value="Remoto">Remoto</option>
                            <option value="Híbrido">Híbrido</option>
                            <option value="Presencial">Presencial</option>
                          </select>
                        </div>

                        {/* Hours */}
                        <div className="sm:col-span-1">
                          <label className="text-[10px] text-slate-500 block">Horas</label>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={res.hours}
                            onChange={e => handleUpdateResource(res.id, { hours: Number(e.target.value) || 0 })}
                            className="w-full mt-0.5 px-2 py-1.5 bg-white border border-slate-300 rounded text-right font-medium text-slate-800 focus:outline-none"
                          />
                        </div>

                        {/* Rate */}
                        <div className="sm:col-span-1">
                          <label className="text-[10px] text-slate-500 block">Tarifa/Hr</label>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={res.hourlyRate}
                            onChange={e => handleUpdateResource(res.id, { hourlyRate: Number(e.target.value) || 0 })}
                            className="w-full mt-0.5 px-2 py-1.5 bg-white border border-slate-300 rounded text-right font-medium text-slate-800 focus:outline-none"
                          />
                        </div>

                        {/* Subtotal & Delete */}
                        <div className="sm:col-span-2 flex items-center justify-between pl-2">
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block">Subtotal</span>
                            <span className="font-bold text-slate-900 text-xs">
                              {formatCurrency(res.hours * res.hourlyRate, currency, currencySymbol)}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteResource(res.id)}
                            className="text-rose-500 hover:text-rose-700 p-1.5 rounded hover:bg-rose-50 transition-colors ml-2 cursor-pointer"
                            title="Eliminar recurso"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: MILESTONES & DELIVERABLES */}
          {activeStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Plan de Hitos, Entregables y Esquema de Pagos
                  </h3>
                  <p className="text-xs text-slate-500">
                    Estructura de avance conforme a las fases metodológicas de consultoría SAP
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetToStandardMilestones}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Cargar 5 Fases SAP Activate Estándar
                  </button>
                  <button
                    type="button"
                    onClick={handleAddMilestone}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Hito</span>
                  </button>
                </div>
              </div>

              {/* Total percentage alert */}
              <div className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                totalMilestonePercentage === 100 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                <span>Suma de porcentajes de pago por hito: <strong>{totalMilestonePercentage}%</strong></span>
                {totalMilestonePercentage === 100 ? (
                  <span className="flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Cuadre perfecto (100%)
                  </span>
                ) : (
                  <span className="flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-4 h-4 text-amber-600" /> Debe sumar exactamente 100%
                  </span>
                )}
              </div>

              {/* Milestones list */}
              <div className="space-y-3">
                {milestones.map((m, idx) => (
                  <div key={m.id} className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-500">Hito #{idx + 1}</span>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <label className="text-[11px] font-semibold text-slate-600">% Facturación:</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={m.paymentPercentage}
                            onChange={e => handleUpdateMilestone(m.id, { paymentPercentage: Number(e.target.value) || 0 })}
                            className="w-16 px-2 py-1 bg-white border border-slate-300 rounded text-right font-bold text-slate-900"
                          />
                          <span className="font-bold text-slate-700">%</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteMilestone(m.id)}
                          className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          value={m.title}
                          onChange={e => handleUpdateMilestone(m.id, { title: e.target.value })}
                          placeholder="Nombre del Hito / Fase"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-semibold text-slate-800"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={m.estimatedWeek}
                          onChange={e => handleUpdateMilestone(m.id, { estimatedWeek: e.target.value })}
                          placeholder="ej. Semana 3 - 6"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-700"
                        />
                      </div>
                    </div>

                    <textarea
                      rows={2}
                      value={m.deliverables}
                      onChange={e => handleUpdateMilestone(m.id, { deliverables: e.target.value })}
                      placeholder="Entregables contractuales: ej. Documento BBP firmado, especificaciones funcionales FDD, acta SIT..."
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-700"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: COMMERCIAL TERMS & CLOSING */}
          {activeStep === 5 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Commercial Conditions */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4 text-xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    Condiciones Comerciales y Tributarias
                  </h3>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Descuento Comercial (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={discountPercentage}
                      onChange={e => setDiscountPercentage(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Impuestos / Tasa de IVA (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={taxRatePercentage}
                      onChange={e => setTaxRatePercentage(Number(e.target.value) || 0)}
                      placeholder="19 (Chile), 16 (México), 0 (Exento)"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Viáticos / Gastos de Desplazamiento Estimados ({currency})
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={expensesAmount}
                      onChange={e => setExpensesAmount(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Garantía Hipercare Post Go-Live (Días)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={guaranteeHypercareDays}
                      onChange={e => setGuaranteeHypercareDays(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Términos de Facturación y Pago
                    </label>
                    <textarea
                      rows={2}
                      value={paymentTerms}
                      onChange={e => setPaymentTerms(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                </div>

                {/* Real-time Summary Card */}
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-4">
                      Resumen Financiero Consolidado
                    </h3>

                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Horas Totales Estimadas:</span>
                        <span className="font-bold text-slate-900">{previewTotals.totalHours} hrs</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Tarifa Promedio Ponderada:</span>
                        <span className="font-bold text-slate-900">
                          {formatCurrency(previewTotals.averageHourlyRate, currency, currencySymbol)}/hr
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Subtotal Horas Consultoría:</span>
                        <span className="font-bold text-slate-900">
                          {formatCurrency(previewTotals.subtotalConsulting, currency, currencySymbol)}
                        </span>
                      </div>

                      {previewTotals.discountAmount > 0 && (
                        <div className="flex justify-between text-emerald-700 font-semibold">
                          <span>Descuento Comercial ({discountPercentage}%):</span>
                          <span>- {formatCurrency(previewTotals.discountAmount, currency, currencySymbol)}</span>
                        </div>
                      )}

                      {expensesAmount > 0 && (
                        <div className="flex justify-between text-slate-600">
                          <span>Viáticos y Logística:</span>
                          <span className="font-medium text-slate-900">
                            {formatCurrency(expensesAmount, currency, currencySymbol)}
                          </span>
                        </div>
                      )}

                      {previewTotals.taxAmount > 0 && (
                        <div className="flex justify-between text-slate-600">
                          <span>Impuestos / IVA ({taxRatePercentage}%):</span>
                          <span className="font-medium text-slate-900">
                            {formatCurrency(previewTotals.taxAmount, currency, currencySymbol)}
                          </span>
                        </div>
                      )}

                      <div className="border-t border-slate-300 pt-3 flex justify-between text-base font-bold text-blue-900">
                        <span>Total de la Oferta:</span>
                        <span>{formatCurrency(previewTotals.totalAmount, currency, currencySymbol)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200 text-xs text-slate-500">
                    <p>
                      Al guardar, la cotización quedará lista para seguimiento comercial, descarga en PDF estándar y posterior traspaso a ejecución de proyecto.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls inside Form */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div>
              {activeStep > 1 && (
                <button
                  type="button"
                  onClick={() => setActiveStep((activeStep - 1) as any)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  ← Paso Anterior
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {activeStep < 5 ? (
                <button
                  type="button"
                  onClick={() => setActiveStep((activeStep + 1) as any)}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                >
                  Siguiente Paso →
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isEditing ? 'Guardar Cambios' : 'Crear Cotización SAP'}</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
