import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Building2, 
  ShieldAlert, 
  ShieldCheck, 
  DollarSign, 
  Globe, 
  Mail, 
  Phone, 
  User, 
  CreditCard, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Coins,
  MapPin,
  Lock,
  Unlock,
  Sparkles,
  Maximize2,
  Minimize2,
  Eye,
  Check,
  Plus,
  Trash2,
  Users,
  Award,
  Calculator,
  SlidersHorizontal
} from 'lucide-react';
import { 
  SupplierMasterItem, 
  SupplierTaxCategory, 
  SupplierDteType, 
  SupportedCurrency,
  SeniorityLevel,
  SupplierSpecialistRate 
} from '../types';
import { formatRut, validateRut, CHILE_COMUNAS } from '../utils/siiUtils';

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (supplier: SupplierMasterItem) => void;
  supplierToEdit?: SupplierMasterItem | null;
}

const COMMON_SII_CODES = [
  { code: '620100', name: 'Actividades de programación informática' },
  { code: '620200', name: 'Actividades de consultoría de informática y gestión TI' },
  { code: '620900', name: 'Otras actividades de tecnología de la información' },
  { code: '702000', name: 'Actividades de consultoría de gestión empresarial' },
  { code: '722000', name: 'Servicios de consultoría en informática y software' },
  { code: '692000', name: 'Actividades de contabilidad, teneduría de libros y auditoría' },
  { code: '711000', name: 'Actividades de arquitectura e ingeniería' }
];

const CURRENCY_OPTIONS: { 
  code: SupportedCurrency; 
  name: string; 
  flag: string; 
  region: 'chile' | 'international' 
}[] = [
  // Chile
  { code: 'UF', name: 'Unidad de Fomento (UF)', flag: '🇨🇱', region: 'chile' },
  { code: 'CLP', name: 'Pesos Chilenos (CLP)', flag: '🇨🇱', region: 'chile' },
  { code: 'USD', name: 'Dólares Estadounidenses (USD)', flag: '🇺🇸', region: 'chile' },
  // Internacional
  { code: 'EUR', name: 'Euros (EUR)', flag: '🇪🇺', region: 'international' },
  { code: 'MXN', name: 'Pesos Mexicanos (MXN)', flag: '🇲🇽', region: 'international' },
  { code: 'BRL', name: 'Reales Brasileños (BRL)', flag: '🇧🇷', region: 'international' },
  { code: 'COP', name: 'Pesos Colombianos (COP)', flag: '🇨🇴', region: 'international' },
  { code: 'ARS', name: 'Pesos Argentinos (ARS)', flag: '🇦🇷', region: 'international' },
  { code: 'GBP', name: 'Libras Esterlinas (GBP)', flag: '🇬🇧', region: 'international' }
];

const SAP_SPECIALTIES = [
  'DEV_ABAP',
  'SAP_FICO',
  'SAP_MM',
  'SAP_LE',
  'SAP_PM',
  'SAP_QM',
  'SAP_HCM',
  'SAP_BASIS',
  'SAP_SECURITY',
  'SAP_PMO_LEAD',
  'SAP S/4HANA Migration',
  'SAP BTP',
  'SAP Analytics Cloud'
];

const SPECIALTY_META: Record<string, { label: string; defaultRole: string; suggestedSeniority: SeniorityLevel }> = {
  'DEV_ABAP': { label: 'ABAP Development', defaultRole: 'Consultor Senior ABAP / RICEFW', suggestedSeniority: 'Senior' },
  'SAP_FICO': { label: 'FICO Finanzas & Controlling', defaultRole: 'Consultor Especialista FICO', suggestedSeniority: 'Senior' },
  'SAP_MM': { label: 'MM Gestión de Materiales', defaultRole: 'Consultor Gestión de Materiales MM', suggestedSeniority: 'Senior' },
  'SAP_LE': { label: 'LE Logística & SD', defaultRole: 'Consultor Logística y Expedición LE/SD', suggestedSeniority: 'Senior' },
  'SAP_PM': { label: 'PM Mantenimiento', defaultRole: 'Consultor Mantenimiento de Planta PM', suggestedSeniority: 'Senior' },
  'SAP_QM': { label: 'QM Gestión de Calidad', defaultRole: 'Consultor Calidad & Ensayos QM', suggestedSeniority: 'Senior' },
  'SAP_HCM': { label: 'HCM Nómina & Payroll', defaultRole: 'Consultor Nómina & HCM Chile', suggestedSeniority: 'Senior' },
  'SAP_BASIS': { label: 'BASIS Administración', defaultRole: 'Administrador de Sistemas SAP BASIS', suggestedSeniority: 'Senior' },
  'SAP_SECURITY': { label: 'Security & GRC Roles', defaultRole: 'Consultor Seguridad & Roles SAP', suggestedSeniority: 'Senior' },
  'SAP_PMO_LEAD': { label: 'PMO / Lead Arquitecto', defaultRole: 'Líder de Proyecto / Arquitecto SAP', suggestedSeniority: 'Lead / Arquitecto' },
  'SAP S/4HANA Migration': { label: 'S/4HANA Migración', defaultRole: 'Arquitecto Líder Migración S/4HANA', suggestedSeniority: 'Lead / Arquitecto' },
  'SAP BTP': { label: 'BTP Cloud Integration', defaultRole: 'Arquitecto Cloud SAP BTP & Kyma', suggestedSeniority: 'Senior' },
  'SAP Analytics Cloud': { label: 'SAC Analytics Cloud', defaultRole: 'Consultor SAP Analytics Cloud (SAC)', suggestedSeniority: 'Senior' }
};

const getDefaultRateForCurrency = (currency: SupportedCurrency, seniority: SeniorityLevel = 'Senior'): number => {
  const multiplier = seniority === 'Lead / Arquitecto' ? 1.18 : seniority === 'Semi-Senior' ? 0.85 : seniority === 'Junior' ? 0.65 : 1.0;
  switch (currency) {
    case 'UF':
      return Number((2.10 * multiplier).toFixed(2));
    case 'CLP':
      return Math.round(72000 * multiplier);
    case 'USD':
      return Math.round(90 * multiplier);
    case 'EUR':
      return Math.round(85 * multiplier);
    case 'MXN':
      return Math.round(1500 * multiplier);
    case 'BRL':
      return Math.round(450 * multiplier);
    default:
      return Math.round(80 * multiplier);
  }
};

export const SupplierModal: React.FC<SupplierModalProps> = ({
  isOpen,
  onClose,
  onSave,
  supplierToEdit
}) => {
  const [activeTab, setActiveTab] = useState<'sii' | 'currency' | 'contact' | 'blocking'>('sii');
  const [isMaximized, setIsMaximized] = useState(false);

  // Form State
  const [vendorCode, setVendorCode] = useState('');
  const [taxId, setTaxId] = useState('');
  const [legalName, setLegalName] = useState('');
  const [fantasyName, setFantasyName] = useState('');
  const [siiActivityCode, setSiiActivityCode] = useState('620200');
  const [businessActivity, setBusinessActivity] = useState('');
  const [taxCategory, setTaxCategory] = useState<SupplierTaxCategory>('Primera Categoría');
  const [dteType, setDteType] = useState<SupplierDteType>('Factura Electrónica Afecta (19%)');
  const [dteBillingEmail, setDteBillingEmail] = useState('');
  
  // Domicilio Fiscal
  const [country, setCountry] = useState('Chile');
  const [address, setAddress] = useState('');
  const [officeOrSuite, setOfficeOrSuite] = useState('');
  const [comuna, setComuna] = useState('Las Condes');
  const [city, setCity] = useState('Santiago');
  const [regionOrState, setRegionOrState] = useState('Región Metropolitana');
  const [isForeign, setIsForeign] = useState(false);

  // Moneda de Cobro & Tarifas por Especialista
  const [billingCurrency, setBillingCurrency] = useState<SupportedCurrency>('UF');
  const [acceptedCurrencies, setAcceptedCurrencies] = useState<SupportedCurrency[]>(['UF', 'CLP']);
  const [specialistRates, setSpecialistRates] = useState<SupplierSpecialistRate[]>([]);
  const [defaultHourlyRate, setDefaultHourlyRate] = useState<number | ''>(2.20);
  const [paymentTerms, setPaymentTerms] = useState('30 días fecha factura');
  
  // Datos Bancarios
  const [bankName, setBankName] = useState('');
  const [accountType, setAccountType] = useState<'Cuenta Corriente' | 'Cuenta Vista / RUT' | 'Checking' | 'Savings' | 'Wire Internacional'>('Cuenta Corriente');
  const [accountNumber, setAccountNumber] = useState('');
  const [swiftCode, setSwiftCode] = useState('');
  const [iban, setIban] = useState('');
  
  // Capacidades & Contacto Comercial
  const [specialties, setSpecialties] = useState<string[]>(['DEV_ABAP', 'SAP_MM']);
  const [seniorityLevels, setSeniorityLevels] = useState<SeniorityLevel[]>(['Senior']);
  const [contactName, setContactName] = useState('');
  const [contactRole, setContactRole] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [notes, setNotes] = useState('');

  // Bloqueo SAP XK05
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockingReason, setBlockingReason] = useState('');

  // Validation
  const [rutError, setRutError] = useState<string | null>(null);

  // Init form on open
  useEffect(() => {
    if (supplierToEdit) {
      setVendorCode(supplierToEdit.vendorCode);
      setTaxId(supplierToEdit.taxId);
      setLegalName(supplierToEdit.legalName);
      setFantasyName(supplierToEdit.fantasyName || '');
      setSiiActivityCode(supplierToEdit.siiActivityCode || '620200');
      setBusinessActivity(supplierToEdit.businessActivity || '');
      setTaxCategory(supplierToEdit.taxCategory);
      setDteType(supplierToEdit.dteType);
      setDteBillingEmail(supplierToEdit.dteBillingEmail || '');
      setCountry(supplierToEdit.country);
      setAddress(supplierToEdit.address);
      setOfficeOrSuite(supplierToEdit.officeOrSuite || '');
      setComuna(supplierToEdit.comuna);
      setCity(supplierToEdit.city);
      setRegionOrState(supplierToEdit.regionOrState || '');
      setIsForeign(supplierToEdit.isForeign);
      setBillingCurrency(supplierToEdit.billingCurrency);
      setAcceptedCurrencies(supplierToEdit.acceptedCurrencies || [supplierToEdit.billingCurrency]);
      setDefaultHourlyRate(supplierToEdit.defaultHourlyRate ?? '');
      setPaymentTerms(supplierToEdit.paymentTerms);
      setBankName(supplierToEdit.bankAccount?.bankName || '');
      setAccountType(supplierToEdit.bankAccount?.accountType || 'Cuenta Corriente');
      setAccountNumber(supplierToEdit.bankAccount?.accountNumber || '');
      setSwiftCode(supplierToEdit.bankAccount?.swiftCode || '');
      setIban(supplierToEdit.bankAccount?.iban || '');
      setSpecialties(supplierToEdit.specialties || []);

      // Cargar o derivar tarifas individuales por especialista
      const loadedRates: SupplierSpecialistRate[] = (supplierToEdit.specialistRates && supplierToEdit.specialistRates.length > 0)
        ? supplierToEdit.specialistRates
        : (supplierToEdit.specialties && supplierToEdit.specialties.length > 0)
          ? supplierToEdit.specialties.map((spec, idx) => {
              const meta = SPECIALTY_META[spec];
              const rate = supplierToEdit.defaultHourlyRate || getDefaultRateForCurrency(supplierToEdit.billingCurrency, 'Senior');
              return {
                id: `spec-${idx}-${Date.now()}`,
                specialty: spec,
                roleTitle: meta?.defaultRole || `Consultor ${spec.replace('DEV_', '').replace('SAP_', '')}`,
                seniority: 'Senior' as SeniorityLevel,
                hourlyRate: Number(rate),
                dailyRate: Number((rate * 8).toFixed(2))
              };
            })
          : [
              {
                id: 'spec-default-1',
                specialty: 'DEV_ABAP',
                roleTitle: SPECIALTY_META['DEV_ABAP']?.defaultRole || 'Consultor Senior ABAP',
                seniority: 'Senior' as SeniorityLevel,
                hourlyRate: getDefaultRateForCurrency(supplierToEdit.billingCurrency, 'Senior'),
                dailyRate: getDefaultRateForCurrency(supplierToEdit.billingCurrency, 'Senior') * 8
              }
            ];
      setSpecialistRates(loadedRates);

      setSeniorityLevels(supplierToEdit.seniorityLevels || ['Senior']);
      setContactName(supplierToEdit.contactName);
      setContactRole(supplierToEdit.contactRole);
      setContactEmail(supplierToEdit.contactEmail);
      setContactPhone(supplierToEdit.contactPhone);
      setWebsite(supplierToEdit.website || '');
      setNotes(supplierToEdit.notes || '');
      setIsBlocked(supplierToEdit.isBlocked);
      setBlockingReason(supplierToEdit.blockingReason || '');
    } else {
      // New Supplier default
      const randomCode = `LIFNR-${Math.floor(10000 + Math.random() * 90000)}`;
      setVendorCode(randomCode);
      setTaxId('');
      setLegalName('');
      setFantasyName('');
      setSiiActivityCode('620200');
      setBusinessActivity('Actividades de Consultoría de Informática y de Gestión TI');
      setTaxCategory('Primera Categoría');
      setDteType('Factura Electrónica Afecta (19%)');
      setDteBillingEmail('');
      setCountry('Chile');
      setAddress('');
      setOfficeOrSuite('');
      setComuna('Las Condes');
      setCity('Santiago');
      setRegionOrState('Región Metropolitana');
      setIsForeign(false);
      setBillingCurrency('UF');
      setAcceptedCurrencies(['UF', 'CLP']);
      setDefaultHourlyRate(2.20);
      setPaymentTerms('30 días fecha factura');
      setBankName('');
      setAccountType('Cuenta Corriente');
      setAccountNumber('');
      setSwiftCode('');
      setIban('');
      setSpecialties(['DEV_ABAP', 'SAP_MM']);

      // Especialistas por defecto con tarifas individuales
      const defaultRates: SupplierSpecialistRate[] = [
        {
          id: `spec-init-1`,
          specialty: 'DEV_ABAP',
          roleTitle: SPECIALTY_META['DEV_ABAP'].defaultRole,
          seniority: 'Senior',
          hourlyRate: getDefaultRateForCurrency('UF', 'Senior'),
          dailyRate: getDefaultRateForCurrency('UF', 'Senior') * 8
        },
        {
          id: `spec-init-2`,
          specialty: 'SAP_MM',
          roleTitle: SPECIALTY_META['SAP_MM'].defaultRole,
          seniority: 'Senior',
          hourlyRate: getDefaultRateForCurrency('UF', 'Senior'),
          dailyRate: getDefaultRateForCurrency('UF', 'Senior') * 8
        }
      ];
      setSpecialistRates(defaultRates);

      setSeniorityLevels(['Senior']);
      setContactName('');
      setContactRole('Gerente de Operaciones / Comercial');
      setContactEmail('');
      setContactPhone('');
      setWebsite('');
      setNotes('');
      setIsBlocked(false);
      setBlockingReason('');
    }
    setActiveTab('sii');
    setRutError(null);
  }, [supplierToEdit, isOpen]);

  // Rate metrics calculation
  const rateMetrics = useMemo(() => {
    if (specialistRates.length === 0) {
      return { count: 0, min: 0, max: 0, avg: 0, formattedRange: 'Sin especialistas' };
    }
    const rates = specialistRates.map(s => Number(s.hourlyRate) || 0).filter(r => r > 0);
    if (rates.length === 0) {
      return { count: specialistRates.length, min: 0, max: 0, avg: 0, formattedRange: '0.00' };
    }
    const min = Math.min(...rates);
    const max = Math.max(...rates);
    const avg = Number((rates.reduce((a, b) => a + b, 0) / rates.length).toFixed(2));
    
    const format = (n: number) => {
      if (billingCurrency === 'CLP') return `$${n.toLocaleString('es-CL')}`;
      return `${n.toFixed(2)} ${billingCurrency}`;
    };

    const formattedRange = min === max ? `${format(min)}/hr` : `${format(min)} – ${format(max)}/hr`;
    return { count: specialistRates.length, min, max, avg, formattedRange };
  }, [specialistRates, billingCurrency]);

  // Handler: Add Specialist
  const handleAddSpecialist = (specKey: string, customTitle?: string) => {
    const meta = SPECIALTY_META[specKey];
    const seniority: SeniorityLevel = meta?.suggestedSeniority || 'Senior';
    const defaultRate = getDefaultRateForCurrency(billingCurrency, seniority);
    const newRate: SupplierSpecialistRate = {
      id: `rate-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      specialty: specKey,
      roleTitle: customTitle || meta?.defaultRole || `Consultor ${specKey.replace('DEV_', '').replace('SAP_', '')}`,
      seniority,
      hourlyRate: defaultRate,
      dailyRate: Number((defaultRate * 8).toFixed(2))
    };
    setSpecialistRates(prev => [...prev, newRate]);
    if (!specialties.includes(specKey)) {
      setSpecialties(prev => [...prev, specKey]);
    }
  };

  // Handler: Update Specialist Rate / Role / Seniority
  const handleUpdateSpecialistRate = (id: string, field: keyof SupplierSpecialistRate, val: any) => {
    setSpecialistRates(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: val };
        if (field === 'hourlyRate') {
          const num = val === '' ? 0 : Number(val);
          updated.hourlyRate = num;
          updated.dailyRate = Number((num * 8).toFixed(2));
        }
        return updated;
      }
      return item;
    }));
  };

  // Handler: Remove Specialist
  const handleRemoveSpecialist = (id: string) => {
    setSpecialistRates(prev => {
      const next = prev.filter(r => r.id !== id);
      setSpecialties(Array.from(new Set(next.map(r => r.specialty))));
      return next;
    });
  };

  // Handler: Preload Default Specialists
  const handlePreloadDefaultSpecialists = () => {
    const standardModules = ['DEV_ABAP', 'SAP_FICO', 'SAP_MM', 'SAP S/4HANA Migration'];
    const newRates: SupplierSpecialistRate[] = standardModules.map((mod, idx) => {
      const meta = SPECIALTY_META[mod];
      const seniority = meta?.suggestedSeniority || 'Senior';
      const rate = getDefaultRateForCurrency(billingCurrency, seniority);
      return {
        id: `spec-preload-${idx}-${Date.now()}`,
        specialty: mod,
        roleTitle: meta?.defaultRole || `Consultor ${mod}`,
        seniority,
        hourlyRate: rate,
        dailyRate: Number((rate * 8).toFixed(2))
      };
    });
    setSpecialistRates(newRates);
    setSpecialties(standardModules);
  };

  // Handle Chilean RUT formatting & validation
  const handleTaxIdChange = (val: string) => {
    if (!isForeign) {
      const formatted = formatRut(val);
      setTaxId(formatted);
      if (formatted.length >= 8) {
        if (!validateRut(formatted)) {
          setRutError('Dígito verificador inválido según algoritmo Módulo 11 del SII');
        } else {
          setRutError(null);
        }
      } else {
        setRutError(null);
      }
    } else {
      setTaxId(val);
      setRutError(null);
    }
  };

  // Handle Country switch
  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry);
    const foreign = newCountry !== 'Chile';
    setIsForeign(foreign);
    if (foreign) {
      setTaxCategory('No Domiciliado');
      setDteType('Invoice Internacional / Factura Extranjera');
      if (billingCurrency === 'UF' || billingCurrency === 'CLP') {
        setBillingCurrency('USD');
        setAcceptedCurrencies(['USD']);
      }
      setAccountType('Wire Internacional');
    } else {
      setTaxCategory('Primera Categoría');
      setDteType('Factura Electrónica Afecta (19%)');
      setBillingCurrency('UF');
      setAcceptedCurrencies(['UF', 'CLP']);
      setAccountType('Cuenta Corriente');
    }
  };

  const handleToggleSpecialty = (spec: string) => {
    setSpecialties(prev => 
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
    );
  };

  const handleToggleAcceptedCurrency = (curr: SupportedCurrency) => {
    setAcceptedCurrencies(prev => {
      if (prev.includes(curr)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter(c => c !== curr);
      } else {
        return [...prev, curr];
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!legalName.trim()) {
      setActiveTab('sii');
      alert('Por favor ingrese la Razón Social o Nombre Legal del proveedor.');
      return;
    }

    if (!taxId.trim()) {
      setActiveTab('sii');
      alert('Por favor ingrese el RUT o Tax ID del proveedor.');
      return;
    }

    if (!isForeign && !validateRut(taxId)) {
      setActiveTab('sii');
      setRutError('El RUT ingresado no es válido para el SII.');
      return;
    }

    if (isBlocked && !blockingReason.trim()) {
      setActiveTab('blocking');
      alert('Debe especificar el motivo del bloqueo administrativo (SAP XK05).');
      return;
    }

    // Calcular tarifa de referencia promedio a partir de los especialistas (o manual)
    const effectiveDefaultRate = rateMetrics.avg > 0 
      ? rateMetrics.avg 
      : (defaultHourlyRate !== '' ? Number(defaultHourlyRate) : undefined);

    const distinctSpecialties = Array.from(new Set(specialistRates.map(s => s.specialty)));

    const item: SupplierMasterItem = {
      id: supplierToEdit ? supplierToEdit.id : `supp-${Date.now()}`,
      vendorCode: vendorCode || `LIFNR-${Math.floor(10000 + Math.random() * 90000)}`,
      taxId: taxId.trim(),
      legalName: legalName.trim(),
      fantasyName: fantasyName.trim() || undefined,
      siiActivityCode: siiActivityCode || undefined,
      businessActivity: businessActivity.trim() || undefined,
      taxCategory,
      dteType,
      dteBillingEmail: dteBillingEmail.trim() || undefined,
      siiStatusValid: !isBlocked,
      address: address.trim() || 'Av. Providencia 1200',
      officeOrSuite: officeOrSuite.trim() || undefined,
      comuna: comuna || 'Santiago',
      city: city || 'Santiago',
      regionOrState: regionOrState || 'Región Metropolitana',
      country,
      isForeign,
      billingCurrency,
      acceptedCurrencies,
      defaultHourlyRate: effectiveDefaultRate,
      hourlyRateCurrency: billingCurrency,
      specialistRates: specialistRates,
      paymentTerms: paymentTerms || '30 días fecha factura',
      bankAccount: bankName.trim() ? {
        bankName: bankName.trim(),
        accountType,
        accountNumber: accountNumber.trim(),
        swiftCode: swiftCode.trim() || undefined,
        iban: iban.trim() || undefined,
        holderName: legalName.trim(),
        holderTaxId: taxId.trim()
      } : undefined,
      specialties: distinctSpecialties.length > 0 ? distinctSpecialties : specialties,
      seniorityLevels,
      website: website.trim() || undefined,
      contactName: contactName.trim() || 'Contacto Comercial',
      contactRole: contactRole.trim() || 'Gestión de Cuentas',
      contactEmail: contactEmail.trim() || '',
      contactPhone: contactPhone.trim() || '',
      status: isBlocked ? 'blocked' : 'active',
      isBlocked,
      blockingReason: isBlocked ? blockingReason.trim() : undefined,
      blockedAt: isBlocked ? (supplierToEdit?.blockedAt || new Date().toISOString().replace('T', ' ').slice(0, 16)) : undefined,
      blockedBy: isBlocked ? (supplierToEdit?.blockedBy || 'Administrador de Compras SAP') : undefined,
      rating: supplierToEdit?.rating || 4.5,
      notes: notes.trim() || undefined,
      createdAt: supplierToEdit?.createdAt || new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10)
    };

    onSave(item);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4 overflow-hidden animate-in fade-in duration-150">
      <div className={`bg-white rounded-2xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${
        isMaximized 
          ? 'w-[98vw] max-w-[99vw] h-[96vh] max-h-[98vh]' 
          : 'w-[94vw] max-w-[96vw] h-[92vh] max-h-[94vh]'
      }`}>
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className={`p-2.5 rounded-xl ${isBlocked ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-blue-600/20 text-blue-400 border border-blue-500/30'}`}>
              {isBlocked ? <Lock className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Transacción SAP XK01 / XK02 / XK03
                </span>
                <span className="text-xs font-mono text-blue-300 font-bold bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-800/60">
                  {vendorCode}
                </span>
                <span className="text-[10px] font-semibold text-slate-300">
                  {country === 'Chile' ? '🇨🇱 Chile (SII Módulo 11)' : `🌐 ${country}`}
                </span>
                {isBlocked ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    ⛔ BLOQUEADO XK05
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ✓ ACTIVO EN COMPRAS
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
                {supplierToEdit ? `Modificar Proveedor: ${supplierToEdit.legalName}` : 'Nuevo Proveedor en Maestro SAP MM'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsMaximized(prev => !prev)}
              title={isMaximized ? "Restaurar tamaño (94%)" : "Maximizar área de trabajo (98%)"}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 flex items-center justify-between overflow-x-auto shrink-0 gap-3">
          <div className="flex items-center gap-1 sm:gap-2 py-1">
            <button
              type="button"
              onClick={() => setActiveTab('sii')}
              className={`py-2.5 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'sii'
                  ? 'border-blue-600 text-blue-700 bg-white shadow-2xs rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>1. Datos Tributarios & SII Chile</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-slate-200/70 text-slate-700">
                {!isForeign ? (validateRut(taxId) ? '✓' : 'RUT') : 'Tax ID'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('currency')}
              className={`py-2.5 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'currency'
                  ? 'border-blue-600 text-blue-700 bg-white shadow-2xs rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Coins className="w-4 h-4" />
              <span>2. Moneda de Cobro & Tarifas por Especialista</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-emerald-100 text-emerald-800 font-bold">
                {specialistRates.length} esp. · {billingCurrency}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('contact')}
              className={`py-2.5 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'contact'
                  ? 'border-blue-600 text-blue-700 bg-white shadow-2xs rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4" />
              <span>3. Contacto, Condiciones de Pago & Bancos</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-blue-100 text-blue-800 font-bold">
                {contactName ? contactName.split(' ')[0] : 'KAM'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('blocking')}
              className={`py-2.5 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'blocking'
                  ? 'border-rose-600 text-rose-700 bg-white shadow-2xs rounded-t-lg'
                  : isBlocked 
                    ? 'border-rose-300 text-rose-600' 
                    : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {isBlocked ? <Lock className="w-4 h-4 text-rose-600" /> : <Unlock className="w-4 h-4 text-slate-500" />}
              <span>4. Bloqueo de Compras (SAP XK05)</span>
              {isBlocked && (
                <span className="bg-rose-100 text-rose-700 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  BLOQUEADO
                </span>
              )}
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-600 shrink-0">
            <span className="px-2.5 py-1 rounded-full bg-slate-200/80 font-semibold text-[11px]">
              {activeTab === 'sii' && 'Paso 1 de 4: Tributario SII'}
              {activeTab === 'currency' && 'Paso 2 de 4: Especialistas & Tarifas'}
              {activeTab === 'contact' && 'Paso 3 de 4: Contacto, Pagos & Bancos'}
              {activeTab === 'blocking' && 'Paso 4 de 4: Bloqueo XK05'}
            </span>
          </div>
        </div>

        {/* Form Body with 2-Column Responsive Workspace */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden min-h-0">
          <div className="flex-1 overflow-hidden flex flex-col lg:grid lg:grid-cols-12 min-h-0">
            
            {/* Left Column: Form Fields */}
            <div className="lg:col-span-8 xl:col-span-9 p-6 overflow-y-auto space-y-5 h-full">
          {/* TAB 1: DATOS TRIBUTARIOS & SII CHILE */}
          {activeTab === 'sii' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-blue-900">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Cumplimiento Normativo del Servicio de Impuestos Internos (SII)</p>
                  <p className="text-blue-800 text-[11px] mt-0.5">
                    Permite ingresar contribuyentes chilenos con RUT validado por Módulo 11, giro oficial, código de actividad económica y casilla de intercambio DTE, o empresas extranjeras con Invoice Internacional.
                  </p>
                </div>
              </div>

              {/* País y Tipo de Contribuyente */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    País de Origen
                  </label>
                  <select
                    value={country}
                    onChange={e => handleCountryChange(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="Chile">🇨🇱 Chile (Nacional - SII)</option>
                    <option value="Estados Unidos">🇺🇸 Estados Unidos</option>
                    <option value="España">🇪🇸 España</option>
                    <option value="México">🇲🇽 México</option>
                    <option value="Colombia">🇨🇴 Colombia</option>
                    <option value="Brasil">🇧🇷 Brasil</option>
                    <option value="Argentina">🇦🇷 Argentina</option>
                    <option value="Alemania">🇩🇪 Alemania</option>
                    <option value="Reino Unido">🇬🇧 Reino Unido</option>
                    <option value="Otro">🌐 Otro País</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Categoría Tributaria
                  </label>
                  <select
                    value={taxCategory}
                    onChange={e => setTaxCategory(e.target.value as SupplierTaxCategory)}
                    className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    {!isForeign ? (
                      <>
                        <option value="Primera Categoría">Primera Categoría (Empresas SpA, S.A., Ltda.)</option>
                        <option value="Segunda Categoría">Segunda Categoría (Honorarios Profesionales)</option>
                      </>
                    ) : (
                      <option value="No Domiciliado">No Domiciliado (Proveedor Extranjero)</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tipo de Documento Tributario (DTE)
                  </label>
                  <select
                    value={dteType}
                    onChange={e => setDteType(e.target.value as SupplierDteType)}
                    className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    {!isForeign ? (
                      <>
                        <option value="Factura Electrónica Afecta (19%)">Factura Electrónica Afecta (19% IVA)</option>
                        <option value="Factura Electrónica Exenta de IVA">Factura Electrónica Exenta de IVA</option>
                        <option value="Boleta de Honorarios Electrónica">Boleta de Honorarios Electrónica (BHE)</option>
                      </>
                    ) : (
                      <option value="Invoice Internacional / Factura Extranjera">Invoice Internacional / Factura Extranjera</option>
                    )}
                  </select>
                </div>
              </div>

              {/* RUT / Tax ID y Razón Social */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>{isForeign ? 'Tax ID / RFC / EIN / CIF' : 'RUT Contribuyente (SII)'}</span>
                    <span className="text-[10px] text-slate-600 font-normal">
                      {isForeign ? 'Identificación fiscal' : 'XX.XXX.XXX-Y'}
                    </span>
                  </label>
                  <input
                    type="text"
                    required
                    value={taxId}
                    onChange={e => handleTaxIdChange(e.target.value)}
                    placeholder={isForeign ? 'US-82-4910283 / ES-B84920194' : '76.123.456-7'}
                    className={`w-full text-xs font-mono font-bold px-3 py-2 bg-white border rounded-lg focus:ring-2 focus:outline-hidden ${
                      rutError ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/50' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                  {rutError && (
                    <p className="text-[10px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      {rutError}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Razón Social Oficial (Nombre Legal Registrado)
                  </label>
                  <input
                    type="text"
                    required
                    value={legalName}
                    onChange={e => setLegalName(e.target.value)}
                    placeholder="Ej. Andes Tech Solutions SpA o Diego Rodrigues Morales"
                    className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Nombre de Fantasía y Casilla DTE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nombre de Fantasía / Comercial (Opcional)
                  </label>
                  <input
                    type="text"
                    value={fantasyName}
                    onChange={e => setFantasyName(e.target.value)}
                    placeholder="Ej. AndesTech Consulting"
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-500" />
                    <span>Casilla Oficial DTE (Recepción Facturas Electrónicas)</span>
                  </label>
                  <input
                    type="email"
                    value={dteBillingEmail}
                    onChange={e => setDteBillingEmail(e.target.value)}
                    placeholder="dte@proveedor.cl o facturacion@proveedor.com"
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Código Actividad Económica SII & Giro */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Código Actividad SII
                  </label>
                  <select
                    value={siiActivityCode}
                    onChange={e => {
                      setSiiActivityCode(e.target.value);
                      const found = COMMON_SII_CODES.find(c => c.code === e.target.value);
                      if (found && !businessActivity) {
                        setBusinessActivity(found.name);
                      }
                    }}
                    className="w-full text-xs font-mono font-semibold px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    {COMMON_SII_CODES.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.code} - {c.name.slice(0, 30)}...
                      </option>
                    ))}
                    <option value="otro">Otro código SII...</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Giro Comercial Registrado ante el SII
                  </label>
                  <input
                    type="text"
                    value={businessActivity}
                    onChange={e => setBusinessActivity(e.target.value)}
                    placeholder="Ej. Actividades de Consultoría de Informática y Gestión TI"
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Dirección Tributaria */}
              <div className="border-t border-slate-200 pt-3">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-600" />
                  <span>Domicilio Tributario / Casa Matriz</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Calle y Número</label>
                    <input
                      type="text"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      placeholder="Ej. Av. Apoquindo 4700"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Oficina / Piso</label>
                    <input
                      type="text"
                      value={officeOrSuite}
                      onChange={e => setOfficeOrSuite(e.target.value)}
                      placeholder="Ej. Piso 11, Of. 1102"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Comuna (Chile)</label>
                    {!isForeign ? (
                      <select
                        value={comuna}
                        onChange={e => setComuna(e.target.value)}
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      >
                        {CHILE_COMUNAS.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={comuna}
                        onChange={e => setComuna(e.target.value)}
                        placeholder="Municipio / Distrito"
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MONEDAS DE COBRO & TARIFAS POR ESPECIALISTA */}
          {activeTab === 'currency' && (
            <div className="space-y-5">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-emerald-900">
                <Coins className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Moneda Habitual y Matriz de Tarifas por Especialista SAP</p>
                  <p className="text-emerald-800 text-[11px] mt-0.5">
                    Configure la moneda de facturación ({billingCurrency}) y defina la tarifa horaria individual para cada especialista y rol SAP. Esto permite cotizaciones exactas según el perfil técnico en lugar de una tarifa plana genérica.
                  </p>
                </div>
              </div>

              {/* Moneda Principal de Cobro - Selector Desplegable Compacto */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <label htmlFor="billing-currency-select" className="block text-xs font-bold text-slate-900">
                      Moneda Principal de Cotización y Facturación *
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Unidad monetaria para cálculo de tarifas horarias ({billingCurrency}).
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:self-center">
                  <select
                    id="billing-currency-select"
                    value={billingCurrency}
                    onChange={e => {
                      const newCur = e.target.value as SupportedCurrency;
                      setBillingCurrency(newCur);
                      if (!acceptedCurrencies.includes(newCur)) {
                        setAcceptedCurrencies(prev => [...prev, newCur]);
                      }
                    }}
                    className="text-xs font-bold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-slate-900 min-w-[220px] shadow-2xs cursor-pointer"
                  >
                    {CURRENCY_OPTIONS.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code} — {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SECCIÓN PRINCIPAL: ESPECIALISTAS Y TARIFAS INDIVIDUALES */}
              <div className="border border-slate-200 bg-slate-50/70 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <span>Especialistas SAP & Tarifas por Especialista</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                          {specialistRates.length} Registrados
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-600">
                        Indique el cargo, seniority y la tarifa por hora específica de cada consultor en <strong className="text-slate-800">{billingCurrency}</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Resumen métrico de tarifas */}
                  {specialistRates.length > 0 && (
                    <div className="flex items-center gap-3 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs">
                      <div>
                        <span className="text-[10px] text-slate-600 block uppercase font-semibold">Rango de Tarifas</span>
                        <span className="text-xs font-bold text-blue-900 font-mono">
                          {rateMetrics.formattedRange}
                        </span>
                      </div>
                      <div className="h-6 w-px bg-slate-200" />
                      <div>
                        <span className="text-[10px] text-slate-600 block uppercase font-semibold">Promedio</span>
                        <span className="text-xs font-bold text-slate-900 font-mono">
                          {rateMetrics.avg} {billingCurrency}/hr
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Lista de Especialistas y sus Tarifas */}
                <div className="space-y-3">
                  {specialistRates.length === 0 ? (
                    <div className="text-center py-8 px-4 bg-white rounded-xl border border-dashed border-slate-300">
                      <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-700">No hay especialistas tarifados registrados</p>
                      <p className="text-[11px] text-slate-600 mt-0.5 mb-3 max-w-md mx-auto">
                        Agregue especialistas para definir tarifas horarias específicas por módulo o pre-cargue la plantilla base.
                      </p>
                      <button
                        type="button"
                        onClick={handlePreloadDefaultSpecialists}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Pre-cargar Especialistas Habituales (ABAP, FICO, MM, S/4HANA)</span>
                      </button>
                    </div>
                  ) : (
                    specialistRates.map((spec, index) => {
                      const meta = SPECIALTY_META[spec.specialty];
                      return (
                        <div 
                          key={spec.id} 
                          className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200 shadow-2xs hover:border-blue-300 transition-all space-y-3"
                        >
                          <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-lg text-xs font-bold font-mono">
                                {spec.specialty.replace('DEV_', '').replace('SAP_', '')}
                              </span>
                              <span className="text-xs text-slate-600 font-medium">
                                {meta?.label || spec.specialty}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveSpecialist(spec.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Eliminar especialista"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                            {/* Cargo o Rol Específico */}
                            <div className="sm:col-span-5">
                              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                                Cargo / Denominación del Rol
                              </label>
                              <input
                                type="text"
                                value={spec.roleTitle}
                                onChange={e => handleUpdateSpecialistRate(spec.id, 'roleTitle', e.target.value)}
                                placeholder="Ej. Consultor Senior ABAP / RICEFW"
                                className="w-full text-xs font-semibold px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                              />
                            </div>

                            {/* Nivel de Seniority */}
                            <div className="sm:col-span-3">
                              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                                Seniority
                              </label>
                              <select
                                value={spec.seniority}
                                onChange={e => handleUpdateSpecialistRate(spec.id, 'seniority', e.target.value as SeniorityLevel)}
                                className="w-full text-xs font-semibold px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                              >
                                <option value="Junior">Junior (1-2 años)</option>
                                <option value="Semi-Senior">Semi-Senior (3-5 años)</option>
                                <option value="Senior">Senior (5-8 años)</option>
                                <option value="Lead / Arquitecto">Lead / Arquitecto (8+ años)</option>
                              </select>
                            </div>

                            {/* Tarifa por Hora */}
                            <div className="sm:col-span-4">
                              <label className="block text-[10px] font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center justify-between">
                                <span>Tarifa por Hora *</span>
                                <span className="text-[10px] text-slate-600 font-mono lowercase">
                                  ≈ {(Number(spec.hourlyRate || 0) * 8).toLocaleString('es-CL')} {billingCurrency}/día
                                </span>
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  step="any"
                                  value={spec.hourlyRate}
                                  onChange={e => handleUpdateSpecialistRate(spec.id, 'hourlyRate', e.target.value)}
                                  placeholder={billingCurrency === 'UF' ? '2.20' : '75000'}
                                  className="w-full text-xs font-mono font-bold px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden pr-16 text-slate-900"
                                />
                                <span className="absolute right-2.5 top-1.5 text-[11px] font-mono font-bold text-blue-700 pointer-events-none">
                                  {billingCurrency}/hr
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Barra de Agregar Especialistas */}
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[11px] font-bold text-slate-700 block mb-2">
                    + Agregar Especialista por Módulo SAP:
                  </span>
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {SAP_SPECIALTIES.map(mod => {
                      const alreadyAdded = specialistRates.some(r => r.specialty === mod);
                      return (
                        <button
                          type="button"
                          key={mod}
                          onClick={() => handleAddSpecialist(mod)}
                          className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                            alreadyAdded
                              ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 shadow-2xs'
                          }`}
                        >
                          <Plus className="w-3 h-3 text-slate-500" />
                          <span>{mod.replace('DEV_', '').replace('SAP_', '')}</span>
                          {alreadyAdded && <span className="text-[10px] text-blue-600 font-mono font-bold">(+)</span>}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => {
                        const customName = prompt('Ingrese el nombre o especialidad del rol SAP:', 'Consultor Especialista');
                        if (customName) {
                          handleAddSpecialist('SAP_CUSTOM', customName);
                        }
                      }}
                      className="text-xs px-3 py-1 rounded-lg border border-dashed border-blue-400 bg-blue-50/50 text-blue-700 hover:bg-blue-100 font-semibold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Otro Rol Personalizado...</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CONTACTO COMERCIAL, CONDICIONES DE PAGO & DATOS BANCARIOS */}
          {activeTab === 'contact' && (
            <div className="space-y-5">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-blue-900">
                <User className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Contacto Comercial, Condiciones de Pago & Datos Bancarios</p>
                  <p className="text-blue-800 text-[11px] mt-0.5">
                    Registre el Key Account Manager (KAM), las condiciones comerciales y plazos de pago para compras, junto con la cuenta bancaria de destino para transferencias nacionales o internacionales.
                  </p>
                </div>
              </div>

              {/* 1. DATOS DE CONTACTO COMERCIAL / KAM */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    1. Contraparte Comercial / Key Account Manager (KAM)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nombre Completo *</label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={e => setContactName(e.target.value)}
                      placeholder="Ej. Carlos Valdivia"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Cargo / Rol en la Empresa</label>
                    <input
                      type="text"
                      value={contactRole}
                      onChange={e => setContactRole(e.target.value)}
                      placeholder="Ej. Socio Director de Práctica SAP / KAM"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Email de Contacto Comercial</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={e => setContactEmail(e.target.value)}
                      placeholder="carlos@proveedor.com"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Teléfono / WhatsApp</label>
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={e => setContactPhone(e.target.value)}
                      placeholder="+56 9 9345 8812"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* 2. CONDICIONES COMERCIALES DE PAGO */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Coins className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    2. Condiciones Comerciales y Plazos de Pago
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Condición Comercial de Pago *
                    </label>
                    <select
                      value={paymentTerms}
                      onChange={e => setPaymentTerms(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden cursor-pointer"
                    >
                      <option value="30 días fecha factura">30 días fecha factura</option>
                      <option value="30 días contra HES aprobada">30 días contra HES aprobada (ML81N)</option>
                      <option value="15 días fecha boleta de honorarios">15 días fecha boleta de honorarios (Segunda Categoría)</option>
                      <option value="45 días transferencia internacional Wire">45 días transferencia internacional Wire SWIFT</option>
                      <option value="60 días fecha factura">60 días fecha factura</option>
                      <option value="Contado contra entrega de servicio">Contado contra entrega de servicio</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Otras Monedas Aceptadas para Órdenes de Compra (OCs)
                    </label>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {['UF', 'CLP', 'USD', 'EUR', 'MXN', 'BRL'].map(c => {
                        const isAccepted = acceptedCurrencies.includes(c as SupportedCurrency);
                        return (
                          <button
                            type="button"
                            key={c}
                            onClick={() => handleToggleAcceptedCurrency(c as SupportedCurrency)}
                            className={`text-xs px-2.5 py-1 rounded-lg border font-mono font-semibold transition-colors cursor-pointer ${
                              isAccepted
                                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {isAccepted ? '✓ ' : '+ '} {c}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. DATOS BANCARIOS DE PAGO */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <CreditCard className="w-4 h-4 text-slate-700" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    3. Datos Bancarios de Pago (Transferencia / Wire)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Entidad Bancaria</label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={e => setBankName(e.target.value)}
                      placeholder="Ej. Banco de Chile / Santander / Chase"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tipo de Cuenta</label>
                    <select
                      value={accountType}
                      onChange={e => setAccountType(e.target.value as any)}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden cursor-pointer"
                    >
                      <option value="Cuenta Corriente">Cuenta Corriente</option>
                      <option value="Cuenta Vista / RUT">Cuenta Vista / RUT</option>
                      <option value="Wire Internacional">Wire Internacional (SWIFT)</option>
                      <option value="Checking">Checking (USA)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">N° de Cuenta</label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={e => setAccountNumber(e.target.value)}
                      placeholder="Ej. 00-142-99812-01"
                      className="w-full text-xs font-mono px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {isForeign && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Código SWIFT / BIC</label>
                      <input
                        type="text"
                        value={swiftCode}
                        onChange={e => setSwiftCode(e.target.value)}
                        placeholder="Ej. BSCHESMMXXX o CHASUS33XXX"
                        className="w-full text-xs font-mono px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">IBAN (Europa)</label>
                      <input
                        type="text"
                        value={iban}
                        onChange={e => setIban(e.target.value)}
                        placeholder="Ej. ES91 0049 1500 0512..."
                        className="w-full text-xs font-mono px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 4. PERFIL CORPORATIVO & EVALUACIÓN */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Award className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    4. Niveles de Seniority & Homologación
                  </span>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                    Niveles de Seniority que ofrece la Consultora
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['Junior', 'Semi-Senior', 'Senior', 'Lead / Arquitecto'] as SeniorityLevel[]).map(lvl => {
                      const isSelected = seniorityLevels.includes(lvl);
                      return (
                        <button
                          type="button"
                          key={lvl}
                          onClick={() => {
                            setSeniorityLevels(prev => 
                              prev.includes(lvl) 
                                ? (prev.length > 1 ? prev.filter(l => l !== lvl) : prev) 
                                : [...prev, lvl]
                            );
                          }}
                          className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '} {lvl}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Sitio Web / Perfil Corporativo</label>
                    <input
                      type="url"
                      value={website}
                      onChange={e => setWebsite(e.target.value)}
                      placeholder="https://proveedor.com"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Notas Internas de Homologación</label>
                    <input
                      type="text"
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Observaciones de capacidad técnica, SLAs, contratos marco..."
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BLOQUEO SAP XK05 */}
          {activeTab === 'blocking' && (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border ${isBlocked ? 'bg-rose-50 border-rose-200 text-rose-950' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${isBlocked ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                      {isBlocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold">
                        {isBlocked ? 'Proveedor Bloqueado para Compras (SAP XK05)' : 'Proveedor Activo & Habilitado'}
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {isBlocked 
                          ? 'El proveedor está inhabilitado para recibir nuevas SOLPEDs (ME51N) y Órdenes de Compra (ME21N).' 
                          : 'El proveedor está operativo y puede ser seleccionado libremente en pedidos y cotizaciones.'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const next = !isBlocked;
                      setIsBlocked(next);
                      if (next && !blockingReason) {
                        setBlockingReason('Inconcurrencia tributaria en SII o auditoría de compras (SAP XK05)');
                      }
                    }}
                    className={`px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 ${
                      isBlocked
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                        : 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm'
                    }`}
                  >
                    {isBlocked ? 'Desbloquear Proveedor' : 'Bloquear Proveedor (XK05)'}
                  </button>
                </div>
              </div>

              {isBlocked && (
                <div className="bg-white border border-rose-200 rounded-xl p-4 space-y-3 animate-in fade-in">
                  <label className="block text-xs font-bold text-rose-900 mb-1 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Motivo Obligatorio del Bloqueo Administrativo *</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={blockingReason}
                    onChange={e => setBlockingReason(e.target.value)}
                    placeholder="Ej. Inconcurrencia tributaria transitoria ante el SII, incumplimiento contractual o revisión de compliance..."
                    className="w-full text-xs p-3 bg-white border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-hidden font-medium"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Transacción SAP aplicable: <strong>XK05 - Bloquear Acreedor Centralmente</strong></span>
                    <span>Registrado por: <strong>Administrador de Compras SAP</strong></span>
                  </div>
                </div>
              )}
            </div>
          )}
            </div>

            {/* Right Column: Live SAP Vendor Inspector / Ficha Resumen */}
            <div className="hidden lg:flex lg:col-span-4 xl:col-span-3 p-5 bg-slate-50/80 border-l border-slate-200 overflow-y-auto flex-col justify-between space-y-4 h-full">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                      <Eye className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Ficha Acreedor SAP</h4>
                      <p className="text-[10px] text-slate-500 font-mono">LIFNR: {vendorCode}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isBlocked 
                      ? 'bg-rose-100 text-rose-700 border border-rose-200' 
                      : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  }`}>
                    {isBlocked ? '⛔ Bloqueado' : '✓ Habilitado'}
                  </span>
                </div>

                {/* Vendor Identification Card */}
                <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 leading-snug">
                        {legalName || 'Razón Social no definida'}
                      </h5>
                      {fantasyName && (
                        <p className="text-[11px] text-blue-700 font-semibold">{fantasyName}</p>
                      )}
                    </div>
                    <span className="text-base" title={country}>
                      {country === 'Chile' ? '🇨🇱' : country === 'Estados Unidos' ? '🇺🇸' : country === 'España' ? '🇪🇸' : country === 'México' ? '🇲🇽' : '🌐'}
                    </span>
                  </div>

                  <div className="text-[11px] space-y-1.5 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium">Identificación Fiscal:</span>
                      <span className="font-mono font-bold text-slate-900">{taxId || 'Sin registrar'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium">RUT SII Módulo 11:</span>
                      {!isForeign ? (
                        validateRut(taxId) ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Válido
                          </span>
                        ) : (
                          <span className="text-rose-600 font-bold">Incompleto / Inválido</span>
                        )
                      ) : (
                        <span className="text-blue-700 font-medium">Internacional</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium">DTE Habitual:</span>
                      <span className="text-slate-800 truncate max-w-[150px]">{dteType.split('(')[0]}</span>
                    </div>
                    {dteBillingEmail && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 font-medium">Casilla DTE:</span>
                        <span className="text-blue-700 font-mono text-[10px] truncate max-w-[140px]">{dteBillingEmail}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium">Ubicación:</span>
                      <span className="text-slate-800 text-[10px] truncate max-w-[150px]">
                        {comuna ? `${comuna}, ` : ''}{country}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Commercial & Currency Card */}
                <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">Condiciones & Tarifas</span>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-600">Moneda Principal:</span>
                      <span className="text-xs font-bold text-blue-900">{billingCurrency}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-600">Rango Tarifas:</span>
                      <span className="text-xs font-mono font-bold text-slate-900">
                        {rateMetrics.formattedRange}
                      </span>
                    </div>
                    {rateMetrics.count > 1 && (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[10px]">
                        <span className="text-slate-500">Tarifa Promedio:</span>
                        <span className="font-mono font-semibold text-slate-700">{rateMetrics.avg} {billingCurrency}/hr</span>
                      </div>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-600 space-y-0.5">
                    <p><strong>Pago:</strong> {paymentTerms}</p>
                    {bankName && (
                      <p><strong>Banco:</strong> {bankName} ({accountType})</p>
                    )}
                  </div>
                </div>

                {/* SAP Specialist Rates Breakdown Card */}
                <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                      Tarifas por Especialista ({specialistRates.length})
                    </span>
                    <span className="text-[10px] text-blue-700 font-mono font-semibold">
                      {billingCurrency}
                    </span>
                  </div>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {specialistRates.length > 0 ? (
                      specialistRates.map(s => (
                        <div key={s.id} className="flex items-center justify-between p-1.5 bg-slate-50 rounded-lg border border-slate-100 text-[11px]">
                          <div className="truncate mr-2">
                            <span className="font-bold text-slate-800 text-[10px] block truncate">
                              {s.roleTitle || s.specialty.replace('DEV_', '').replace('SAP_', '')}
                            </span>
                            <span className="text-[9px] text-slate-500 block">
                              {s.specialty.replace('DEV_', '').replace('SAP_', '')} · {s.seniority}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-mono font-bold text-blue-900 text-xs">
                              {Number(s.hourlyRate || 0).toLocaleString('es-CL')}
                            </span>
                            <span className="text-[9px] text-slate-500 block font-mono">
                              /hr
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-500 italic block py-1">Sin especialistas registrados</span>
                    )}
                  </div>
                </div>

                {/* SAP XK05 Status Notice */}
                {isBlocked ? (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-rose-900 text-xs space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Bloqueado para Compras (XK05)</span>
                    </p>
                    <p className="text-[11px] text-rose-700 leading-snug">
                      {blockingReason || 'Bloqueo administrativo activo. No se permiten SOLPEDs ni pedidos.'}
                    </p>
                  </div>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-900 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-[11px] font-medium leading-snug">
                      Habilitado para SOLPEDs (ME51N) y Órdenes de Compra (ME21N).
                    </span>
                  </div>
                )}
              </div>

              {/* Quick Save CTA in sidebar */}
              <div className="pt-2 border-t border-slate-200">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{supplierToEdit ? 'Guardar Cambios' : 'Registrar Proveedor'}</span>
                </button>
              </div>
            </div>

          </div>

          {/* Footer Buttons */}
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <span className="hidden sm:inline text-xs text-slate-600">
                {activeTab === 'sii' && 'Paso 1: Cumplimiento Tributario SII'}
                {activeTab === 'currency' && 'Paso 2: Moneda de Cobro y Tarifas por Especialista'}
                {activeTab === 'contact' && 'Paso 3: Contacto, Condiciones de Pago y Bancos'}
                {activeTab === 'blocking' && 'Paso 4: Bloqueo Centralizado XK05'}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              {activeTab !== 'sii' && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === 'blocking') setActiveTab('contact');
                    else if (activeTab === 'contact') setActiveTab('currency');
                    else if (activeTab === 'currency') setActiveTab('sii');
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shadow-2xs"
                >
                  ← Anterior
                </button>
              )}

              {activeTab !== 'blocking' && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === 'sii') setActiveTab('currency');
                    else if (activeTab === 'currency') setActiveTab('contact');
                    else if (activeTab === 'contact') setActiveTab('blocking');
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Siguiente paso →
                </button>
              )}

              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{supplierToEdit ? 'Guardar Modificaciones' : 'Registrar en Maestro SAP'}</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
