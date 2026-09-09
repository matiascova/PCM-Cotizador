import React, { useState, useEffect } from 'react';
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
  Sparkles
} from 'lucide-react';
import { 
  SupplierMasterItem, 
  SupplierTaxCategory, 
  SupplierDteType, 
  SupportedCurrency,
  SeniorityLevel 
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

export const SupplierModal: React.FC<SupplierModalProps> = ({
  isOpen,
  onClose,
  onSave,
  supplierToEdit
}) => {
  const [activeTab, setActiveTab] = useState<'sii' | 'currency' | 'services' | 'blocking'>('sii');

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

  // Moneda de Cobro & Tarifas
  const [billingCurrency, setBillingCurrency] = useState<SupportedCurrency>('UF');
  const [acceptedCurrencies, setAcceptedCurrencies] = useState<SupportedCurrency[]>(['UF', 'CLP']);
  const [defaultHourlyRate, setDefaultHourlyRate] = useState<number | ''>(2.20);
  const [paymentTerms, setPaymentTerms] = useState('30 días fecha factura');
  
  // Datos Bancarios
  const [bankName, setBankName] = useState('');
  const [accountType, setAccountType] = useState<'Cuenta Corriente' | 'Cuenta Vista / RUT' | 'Checking' | 'Savings' | 'Wire Internacional'>('Cuenta Corriente');
  const [accountNumber, setAccountNumber] = useState('');
  const [swiftCode, setSwiftCode] = useState('');
  const [iban, setIban] = useState('');
  
  // Capacidades & Contacto
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
      defaultHourlyRate: defaultHourlyRate !== '' ? Number(defaultHourlyRate) : undefined,
      hourlyRateCurrency: billingCurrency,
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
      specialties,
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
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isBlocked ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-blue-600/20 text-blue-400 border border-blue-500/30'}`}>
              {isBlocked ? <Lock className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Transacción SAP XK01 / XK02
                </span>
                <span className="text-xs font-mono text-blue-300 font-semibold">
                  {vendorCode}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {supplierToEdit ? `Modificar Proveedor: ${supplierToEdit.legalName}` : 'Nuevo Proveedor en Maestro SAP MM'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 flex gap-2 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('sii')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'sii'
                ? 'border-blue-600 text-blue-700 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>1. Datos Tributarios & SII Chile</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('currency')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'currency'
                ? 'border-blue-600 text-blue-700 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>2. Monedas de Cobro & Tarifas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('services')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'services'
                ? 'border-blue-600 text-blue-700 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>3. Servicios SAP & Contacto</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('blocking')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'blocking'
                ? 'border-rose-600 text-rose-700 bg-white shadow-2xs'
                : isBlocked 
                  ? 'border-rose-300 text-rose-600' 
                  : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {isBlocked ? <Lock className="w-4 h-4 text-rose-600" /> : <Unlock className="w-4 h-4 text-slate-500" />}
            <span>4. Bloqueo de Compras (SAP XK05)</span>
            {isBlocked && (
              <span className="bg-rose-100 text-rose-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                BLOQUEADO
              </span>
            )}
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 flex-1">
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

          {/* TAB 2: MONEDAS DE COBRO & TARIFAS */}
          {activeTab === 'currency' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-emerald-900">
                <Coins className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Moneda Habitual de Cobro y Facturación</p>
                  <p className="text-emerald-800 text-[11px] mt-0.5">
                    Configure la moneda en que el proveedor cotiza y factura. En Chile suele ser <strong>UF</strong>, <strong>Pesos Chilenos (CLP)</strong> o <strong>Dólares (USD)</strong>. En el extranjero cobra en <strong>Dólares (USD)</strong>, <strong>Euros (EUR)</strong> o su moneda local respectiva (MXN, BRL, ARS, etc.).
                  </p>
                </div>
              </div>

              {/* Moneda Principal de Cobro */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Moneda Principal en la que Cobra el Proveedor *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {CURRENCY_OPTIONS.map(c => {
                    const isSelected = billingCurrency === c.code;
                    return (
                      <button
                        type="button"
                        key={c.code}
                        onClick={() => {
                          setBillingCurrency(c.code);
                          if (!acceptedCurrencies.includes(c.code)) {
                            setAcceptedCurrencies(prev => [...prev, c.code]);
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 text-blue-900 font-bold shadow-xs' 
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <span className="text-lg">{c.flag}</span>
                        <div>
                          <span className="text-xs font-bold block">{c.code}</span>
                          <span className="text-[10px] text-slate-500 leading-tight block truncate">
                            {c.name.split('(')[0]}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tarifa de Referencia y Condiciones de Pago */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Tarifa Horaria Referencial</span>
                    <span className="text-[10px] text-slate-600 font-mono">En {billingCurrency}</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      value={defaultHourlyRate}
                      onChange={e => setDefaultHourlyRate(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder={billingCurrency === 'UF' ? '2.20' : billingCurrency === 'CLP' ? '75000' : '90'}
                      className="w-full text-xs font-mono font-bold px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden pr-14"
                    />
                    <span className="absolute right-3 top-2 text-xs font-mono text-slate-600 font-bold">
                      {billingCurrency}/hr
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-600 mt-1">
                    {billingCurrency === 'UF' && 'Ejemplo: 2.10 UF/hr ≈ $85.000 CLP (según UF Banco Central)'}
                    {billingCurrency === 'CLP' && 'Ejemplo: $75.000 CLP/hr para servicios en moneda nacional'}
                    {billingCurrency === 'USD' && 'Ejemplo: 85 - 120 USD/hr para consultores internacionales'}
                    {billingCurrency === 'EUR' && 'Ejemplo: 80 - 110 EUR/hr para consultores europeos'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Condiciones Comerciales de Pago
                  </label>
                  <select
                    value={paymentTerms}
                    onChange={e => setPaymentTerms(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="30 días fecha factura">30 días fecha factura</option>
                    <option value="30 días contra HES aprobada">30 días contra HES aprobada (ML81N)</option>
                    <option value="15 días fecha boleta de honorarios">15 días fecha boleta de honorarios (Segunda Categoría)</option>
                    <option value="45 días transferencia internacional Wire">45 días transferencia internacional Wire SWIFT</option>
                    <option value="60 días fecha factura">60 días fecha factura</option>
                    <option value="Contado contra entrega de servicio">Contado contra entrega de servicio</option>
                  </select>
                </div>
              </div>

              {/* Monedas Secundarias Aceptadas */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Otras Monedas Aceptadas para Órdenes de Compra (OCs)
                </label>
                <div className="flex flex-wrap gap-2">
                  {['UF', 'CLP', 'USD', 'EUR', 'MXN', 'BRL'].map(c => {
                    const isAccepted = acceptedCurrencies.includes(c);
                    return (
                      <button
                        type="button"
                        key={c}
                        onClick={() => handleToggleAcceptedCurrency(c)}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-mono font-semibold transition-colors cursor-pointer ${
                          isAccepted
                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {isAccepted ? '✓ ' : '+ '} {c}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Datos Bancarios para Transferencia */}
              <div className="border-t border-slate-200 pt-3">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                  <CreditCard className="w-3.5 h-3.5 text-slate-600" />
                  <span>Datos Bancarios de Pago</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Banco</label>
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
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
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
            </div>
          )}

          {/* TAB 3: SERVICIOS SAP & CONTACTO */}
          {activeTab === 'services' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Especialidades y Módulos SAP Ofrecidos
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {SAP_SPECIALTIES.map(spec => {
                    const isSelected = specialties.includes(spec);
                    return (
                      <button
                        type="button"
                        key={spec}
                        onClick={() => handleToggleSpecialty(spec)}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '} {spec.replace('DEV_', '').replace('SAP_', '')}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Datos de Contacto Operativo y Comercial */}
              <div className="border-t border-slate-200 pt-3">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                  <User className="w-3.5 h-3.5 text-slate-600" />
                  <span>Contacto Comercial / Key Account Manager</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={e => setContactName(e.target.value)}
                      placeholder="Ej. Carlos Valdivia"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Cargo / Rol</label>
                    <input
                      type="text"
                      value={contactRole}
                      onChange={e => setContactRole(e.target.value)}
                      placeholder="Ej. Socio Director de Práctica SAP"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Email de Contacto</label>
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

              {/* Sitio web & Notas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Notas Internas de Evaluación</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Observaciones de capacidad, homologación o SLAs..."
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
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

          {/* Footer Buttons */}
          <div className="border-t border-slate-200 pt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <div className="flex items-center gap-2">
              {activeTab !== 'sii' && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === 'blocking') setActiveTab('services');
                    else if (activeTab === 'services') setActiveTab('currency');
                    else if (activeTab === 'currency') setActiveTab('sii');
                  }}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  ← Anterior
                </button>
              )}

              {activeTab !== 'blocking' ? (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === 'sii') setActiveTab('currency');
                    else if (activeTab === 'currency') setActiveTab('services');
                    else if (activeTab === 'services') setActiveTab('blocking');
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Siguiente paso →
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{supplierToEdit ? 'Guardar Modificaciones' : 'Registrar en Maestro SAP'}</span>
                </button>
              )}
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
