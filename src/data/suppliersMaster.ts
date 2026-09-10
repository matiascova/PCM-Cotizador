import { SupplierMasterItem, SupportedCurrency } from '../types';

const STORAGE_KEY = 'sap_suppliers_master_v1';

export const INITIAL_SUPPLIERS_MASTER: SupplierMasterItem[] = [
  {
    id: 'supp-andes-tech',
    vendorCode: 'LIFNR-10001',
    taxId: '76.842.190-4',
    legalName: 'Andes Tech Solutions SpA',
    fantasyName: 'AndesTech SAP Consulting',
    siiActivityCode: '620200',
    businessActivity: 'Actividades de Consultoría de Informática y de Gestión de Instalaciones Informáticas',
    taxCategory: 'Primera Categoría',
    dteType: 'Factura Electrónica Afecta (19%)',
    dteBillingEmail: 'dte@andestech.cl',
    siiStatusValid: true,
    address: 'Av. Apoquindo 4700, Piso 11, Of. 1102',
    officeOrSuite: 'Oficina 1102',
    comuna: 'Las Condes',
    city: 'Santiago',
    regionOrState: 'Región Metropolitana',
    country: 'Chile',
    isForeign: false,
    billingCurrency: 'UF',
    acceptedCurrencies: ['UF', 'CLP', 'USD'],
    defaultHourlyRate: 2.10,
    hourlyRateCurrency: 'UF',
    specialistRates: [
      { id: 'spec-1', specialty: 'DEV_ABAP', roleTitle: 'Consultor Senior ABAP / RICEFW', seniority: 'Senior', hourlyRate: 2.05, dailyRate: 16.4 },
      { id: 'spec-2', specialty: 'SAP_MM', roleTitle: 'Consultor Gestión de Materiales MM', seniority: 'Senior', hourlyRate: 2.10, dailyRate: 16.8 },
      { id: 'spec-3', specialty: 'SAP_HCM', roleTitle: 'Consultor Nómina & Payroll Chile', seniority: 'Senior', hourlyRate: 2.15, dailyRate: 17.2 },
      { id: 'spec-4', specialty: 'SAP S/4HANA Migration', roleTitle: 'Arquitecto Líder Migración S/4HANA', seniority: 'Lead / Arquitecto', hourlyRate: 2.45, dailyRate: 19.6 }
    ],
    paymentTerms: '30 días fecha factura',
    bankAccount: {
      bankName: 'Banco de Chile',
      accountType: 'Cuenta Corriente',
      accountNumber: '00-142-99812-01',
      holderName: 'Andes Tech Solutions SpA',
      holderTaxId: '76.842.190-4'
    },
    specialties: ['SAP_HCM', 'SAP_MM', 'SAP S/4HANA Migration', 'DEV_ABAP'],
    seniorityLevels: ['Senior', 'Lead / Arquitecto'],
    website: 'https://andestech.cl',
    contactName: 'Carlos M. Valdivia',
    contactRole: 'Socio Director de Práctica SAP',
    contactEmail: 'cvaldivia@andestech.cl',
    contactPhone: '+56 9 9345 8812',
    status: 'active',
    isBlocked: false,
    rating: 4.8,
    notes: 'Proveedor homologado en Chile para servicios de arquitectura y parametrización SAP S/4HANA.',
    createdAt: '2026-07-15',
    updatedAt: '2026-09-01'
  },
  {
    id: 'supp-austral-cloud',
    vendorCode: 'LIFNR-10002',
    taxId: '77.104.532-8',
    legalName: 'Ingeniería de Software & Soluciones Austral SpA',
    fantasyName: 'Austral Cloud & SAP Development',
    siiActivityCode: '620100',
    businessActivity: 'Actividades de Programación Informática y Desarrollo de Sistemas',
    taxCategory: 'Primera Categoría',
    dteType: 'Factura Electrónica Afecta (19%)',
    dteBillingEmail: 'facturacion@australcloud.cl',
    siiStatusValid: true,
    address: 'Calle Nueva Providencia 1881, Of. 605',
    officeOrSuite: 'Oficina 605',
    comuna: 'Providencia',
    city: 'Santiago',
    regionOrState: 'Región Metropolitana',
    country: 'Chile',
    isForeign: false,
    billingCurrency: 'CLP',
    acceptedCurrencies: ['CLP', 'UF'],
    defaultHourlyRate: 72000,
    hourlyRateCurrency: 'CLP',
    specialistRates: [
      { id: 'spec-ac-1', specialty: 'DEV_ABAP', roleTitle: 'Desarrollador ABAP Semi-Senior', seniority: 'Semi-Senior', hourlyRate: 65000, dailyRate: 520000 },
      { id: 'spec-ac-2', specialty: 'DEV_ABAP', roleTitle: 'Desarrollador ABAP Senior / OData / RAP', seniority: 'Senior', hourlyRate: 74000, dailyRate: 592000 },
      { id: 'spec-ac-3', specialty: 'SAP_BASIS', roleTitle: 'Administrador SAP BASIS 24/7', seniority: 'Senior', hourlyRate: 72000, dailyRate: 576000 },
      { id: 'spec-ac-4', specialty: 'SAP_SECURITY', roleTitle: 'Consultor Seguridad & Roles SAP', seniority: 'Senior', hourlyRate: 70000, dailyRate: 560000 },
      { id: 'spec-ac-5', specialty: 'SAP BTP', roleTitle: 'Especialista Integración SAP BTP', seniority: 'Senior', hourlyRate: 79000, dailyRate: 632000 }
    ],
    paymentTerms: '30 días contra HES aprobada',
    bankAccount: {
      bankName: 'Banco Santander Chile',
      accountType: 'Cuenta Corriente',
      accountNumber: '78-009124-5',
      holderName: 'Ingeniería de Software & Soluciones Austral SpA',
      holderTaxId: '77.104.532-8'
    },
    specialties: ['DEV_ABAP', 'SAP_BASIS', 'SAP_SECURITY', 'SAP BTP'],
    seniorityLevels: ['Semi-Senior', 'Senior'],
    website: 'https://australcloud.cl',
    contactName: 'Francisca Morales T.',
    contactRole: 'Gerente de Operaciones y Staffing',
    contactEmail: 'fmorales@australcloud.cl',
    contactPhone: '+56 9 8412 7701',
    status: 'active',
    isBlocked: false,
    rating: 4.7,
    notes: 'Fábrica de desarrollo ABAP y soporte Basis 24/7 con tarifa en pesos chilenos.',
    createdAt: '2026-07-20',
    updatedAt: '2026-08-25'
  },
  {
    id: 'supp-diego-rodrigues',
    vendorCode: 'LIFNR-10003',
    taxId: '16.892.450-K',
    legalName: 'Diego Rodrigues Morales',
    fantasyName: 'Diego Rodrigues - Consultor Especialista FICO & Nómina',
    siiActivityCode: '702000',
    businessActivity: 'Servicios de Asesoría y Consultoría en Gestión Empresarial y Sistemas Informáticos',
    taxCategory: 'Segunda Categoría',
    dteType: 'Boleta de Honorarios Electrónica',
    dteBillingEmail: 'diego.rodrigues@consultores-sap.cl',
    siiStatusValid: true,
    address: 'Av. Las Condes 12340, Depto 402',
    officeOrSuite: 'Depto 402',
    comuna: 'Lo Barnechea',
    city: 'Santiago',
    regionOrState: 'Región Metropolitana',
    country: 'Chile',
    isForeign: false,
    billingCurrency: 'UF',
    acceptedCurrencies: ['UF', 'CLP'],
    defaultHourlyRate: 2.30,
    hourlyRateCurrency: 'UF',
    specialistRates: [
      { id: 'spec-dr-1', specialty: 'SAP_FICO', roleTitle: 'Consultor Senior Finanzas & Costos FICO', seniority: 'Senior', hourlyRate: 2.30, dailyRate: 18.4 },
      { id: 'spec-dr-2', specialty: 'SAP_HCM', roleTitle: 'Especialista Nómina & Remuneraciones Chile', seniority: 'Senior', hourlyRate: 2.25, dailyRate: 18.0 },
      { id: 'spec-dr-3', specialty: 'SAP_PMO_LEAD', roleTitle: 'Arquitecto Solución & Líder Técnico SAP', seniority: 'Lead / Arquitecto', hourlyRate: 2.60, dailyRate: 20.8 }
    ],
    paymentTerms: '15 días fecha boleta de honorarios',
    bankAccount: {
      bankName: 'BCI (Banco de Crédito e Inversiones)',
      accountType: 'Cuenta Corriente',
      accountNumber: '50-109248-12',
      holderName: 'Diego Rodrigues Morales',
      holderTaxId: '16.892.450-K'
    },
    specialties: ['SAP_HCM', 'SAP_FICO', 'SAP_PMO_LEAD'],
    seniorityLevels: ['Senior', 'Lead / Arquitecto'],
    contactName: 'Diego Rodrigues M.',
    contactRole: 'Consultor Principal / Arquitecto SAP',
    contactEmail: 'diego.rodrigues@consultores-sap.cl',
    contactPhone: '+56 9 7120 4455',
    status: 'active',
    isBlocked: false,
    rating: 4.9,
    notes: 'Consultor independiente senior con emisión de Boleta de Honorarios Electrónica (BHE) SII.',
    createdAt: '2026-08-01',
    updatedAt: '2026-09-02'
  },
  {
    id: 'supp-global-solutions',
    vendorCode: 'LIFNR-10004',
    taxId: '76.312.980-1',
    legalName: 'Servicios Digitales Globales Chile Limitada',
    fantasyName: 'Global Solutions Chile Ltda.',
    siiActivityCode: '620200',
    businessActivity: 'Consultoría Integral de Sistemas ERP e Integraciones Globales',
    taxCategory: 'Primera Categoría',
    dteType: 'Factura Electrónica Afecta (19%)',
    dteBillingEmail: 'dte@globalsolutions.cl',
    siiStatusValid: true,
    address: 'Av. El Bosque Norte 500, Piso 14',
    officeOrSuite: 'Piso 14',
    comuna: 'Las Condes',
    city: 'Santiago',
    regionOrState: 'Región Metropolitana',
    country: 'Chile',
    isForeign: false,
    billingCurrency: 'USD',
    acceptedCurrencies: ['USD', 'UF', 'CLP'],
    defaultHourlyRate: 90,
    hourlyRateCurrency: 'USD',
    specialistRates: [
      { id: 'spec-gs-1', specialty: 'SAP_MM', roleTitle: 'Consultor MM Supply Chain Minería', seniority: 'Senior', hourlyRate: 90, dailyRate: 720 },
      { id: 'spec-gs-2', specialty: 'SAP_LE', roleTitle: 'Especialista Logística de Embarque LE/SD', seniority: 'Senior', hourlyRate: 95, dailyRate: 760 },
      { id: 'spec-gs-3', specialty: 'SAP_PM', roleTitle: 'Consultor Mantenimiento de Activos PM', seniority: 'Senior', hourlyRate: 88, dailyRate: 704 },
      { id: 'spec-gs-4', specialty: 'SAP_QM', roleTitle: 'Especialista Calidad y Ensayos QM', seniority: 'Senior', hourlyRate: 85, dailyRate: 680 }
    ],
    paymentTerms: '30 días fecha factura comercial',
    bankAccount: {
      bankName: 'Banco Scotiabank Chile',
      accountType: 'Cuenta Corriente',
      accountNumber: '99-887123-0',
      holderName: 'Servicios Digitales Globales Chile Limitada',
      holderTaxId: '76.312.980-1'
    },
    specialties: ['SAP_LE', 'SAP_MM', 'SAP_PM', 'SAP_QM'],
    seniorityLevels: ['Senior'],
    website: 'https://globalsolutions.com',
    contactName: 'Mariana Silva E.',
    contactRole: 'Key Account Manager Minería & Supply Chain',
    contactEmail: 'msilva@globalsolutions.cl',
    contactPhone: '+56 9 9123 5500',
    status: 'active',
    isBlocked: false,
    rating: 4.6,
    notes: 'Cobranza corporativa pactada en dólares para proyectos de minería y logística de exportación.',
    createdAt: '2026-08-05',
    updatedAt: '2026-08-30'
  },
  {
    id: 'supp-iberia-sap',
    vendorCode: 'LIFNR-20001',
    taxId: 'ES-B84920194',
    legalName: 'Iberia SAP Consulting Solutions S.L.',
    fantasyName: 'IberiaTech Consulting España',
    taxCategory: 'No Domiciliado',
    dteType: 'Invoice Internacional / Factura Extranjera',
    dteBillingEmail: 'invoicing@iberiatech.es',
    siiStatusValid: true,
    address: 'Paseo de la Castellana 95, Planta 15',
    officeOrSuite: 'Planta 15',
    comuna: 'Chamartín',
    city: 'Madrid',
    regionOrState: 'Comunidad de Madrid',
    country: 'España',
    isForeign: true,
    billingCurrency: 'EUR',
    acceptedCurrencies: ['EUR', 'USD'],
    defaultHourlyRate: 85,
    hourlyRateCurrency: 'EUR',
    specialistRates: [
      { id: 'spec-ib-1', specialty: 'SAP S/4HANA Migration', roleTitle: 'Líder de Migración Financiera S/4HANA', seniority: 'Lead / Arquitecto', hourlyRate: 95, dailyRate: 760 },
      { id: 'spec-ib-2', specialty: 'SAP BTP', roleTitle: 'Arquitecto Cloud SAP BTP & Kyma', seniority: 'Senior', hourlyRate: 85, dailyRate: 680 },
      { id: 'spec-ib-3', specialty: 'SAP Analytics Cloud', roleTitle: 'Consultor Senior SAP Analytics Cloud', seniority: 'Senior', hourlyRate: 80, dailyRate: 640 }
    ],
    paymentTerms: '45 días transferencia internacional Wire SWIFT',
    bankAccount: {
      bankName: 'Banco Santander España',
      accountType: 'Wire Internacional',
      accountNumber: 'ES91 0049 1500 0512 3456 7890',
      swiftCode: 'BSCHESMMXXX',
      iban: 'ES9100491500051234567890',
      holderName: 'Iberia SAP Consulting Solutions S.L.'
    },
    specialties: ['SAP S/4HANA Migration', 'SAP BTP', 'SAP Analytics Cloud'],
    seniorityLevels: ['Senior', 'Lead / Arquitecto'],
    website: 'https://iberiatech.es',
    contactName: 'Javier Domínguez Serrano',
    contactRole: 'Director de Expansión LATAM',
    contactEmail: 'jdominguez@iberiatech.es',
    contactPhone: '+34 91 555 7890',
    status: 'active',
    isBlocked: false,
    rating: 4.9,
    notes: 'Proveedor europeo de arquitectura especializada. Cobro en Euros vía factura comercial exenta con convenio de doble tributación Chile-España.',
    createdAt: '2026-07-10',
    updatedAt: '2026-08-28'
  },
  {
    id: 'supp-apex-cloud-usa',
    vendorCode: 'LIFNR-20002',
    taxId: 'US-82-4910283',
    legalName: 'Apex Enterprise Systems LLC',
    fantasyName: 'Apex Cloud & ERP Partners US',
    taxCategory: 'No Domiciliado',
    dteType: 'Invoice Internacional / Factura Extranjera',
    dteBillingEmail: 'ap@apexerp.com',
    siiStatusValid: true,
    address: '100 Montgomery St, Suite 1800',
    officeOrSuite: 'Suite 1800',
    comuna: 'Financial District',
    city: 'San Francisco',
    regionOrState: 'California',
    country: 'Estados Unidos',
    isForeign: true,
    billingCurrency: 'USD',
    acceptedCurrencies: ['USD'],
    defaultHourlyRate: 125,
    hourlyRateCurrency: 'USD',
    specialistRates: [
      { id: 'spec-us-1', specialty: 'SAP_BASIS', roleTitle: 'Principal Cloud ERP / Hyperscalers Lead', seniority: 'Lead / Arquitecto', hourlyRate: 140, dailyRate: 1120 },
      { id: 'spec-us-2', specialty: 'SAP BTP', roleTitle: 'Senior Integration Architect', seniority: 'Senior', hourlyRate: 125, dailyRate: 1000 },
      { id: 'spec-us-3', specialty: 'SAP_SECURITY', roleTitle: 'Enterprise GRC & Cyber Security SAP', seniority: 'Senior', hourlyRate: 115, dailyRate: 920 }
    ],
    paymentTerms: '30 días Wire Transfer',
    bankAccount: {
      bankName: 'JPMorgan Chase Bank, N.A.',
      accountType: 'Wire Internacional',
      accountNumber: '9876543210',
      swiftCode: 'CHASUS33XXX',
      routingNumber: '121000248',
      holderName: 'Apex Enterprise Systems LLC'
    },
    specialties: ['SAP_BASIS', 'SAP_SECURITY', 'SAP Cloud ALM', 'Cybersecurity'],
    seniorityLevels: ['Lead / Arquitecto'],
    website: 'https://apexerp.com',
    contactName: 'Robert K. Sullivan',
    contactRole: 'VP of Global Enterprise Services',
    contactEmail: 'rsullivan@apexerp.com',
    contactPhone: '+1 (415) 880-9210',
    status: 'active',
    isBlocked: false,
    rating: 4.8,
    notes: 'Acreditado para auditorías de ciberseguridad SAP y migraciones RISE with SAP. Facturación en dólares americanos.',
    createdAt: '2026-06-30',
    updatedAt: '2026-08-15'
  },
  {
    id: 'supp-mexico-nearshore',
    vendorCode: 'LIFNR-20003',
    taxId: 'MX-SEM180422-KL8',
    legalName: 'Soluciones y Servicios ERP de México S.A. de C.V.',
    fantasyName: 'ERP México Nearshore Services',
    taxCategory: 'No Domiciliado',
    dteType: 'Invoice Internacional / Factura Extranjera',
    dteBillingEmail: 'facturacion@erpmexico.mx',
    siiStatusValid: true,
    address: 'Av. Insurgentes Sur 1602, Piso 9, Crédito Constructor',
    officeOrSuite: 'Piso 9',
    comuna: 'Benito Juárez',
    city: 'Ciudad de México',
    regionOrState: 'CDMX',
    country: 'México',
    isForeign: true,
    billingCurrency: 'MXN',
    acceptedCurrencies: ['MXN', 'USD'],
    defaultHourlyRate: 1750,
    hourlyRateCurrency: 'MXN',
    paymentTerms: '30 días fecha factura comercial',
    bankAccount: {
      bankName: 'BBVA México',
      accountType: 'Wire Internacional',
      accountNumber: '012180001234567890',
      swiftCode: 'BBVAMXMMXXX',
      holderName: 'Soluciones y Servicios ERP de México S.A. de C.V.'
    },
    specialties: ['DEV_ABAP', 'SAP_HCM', 'Nómina México & Centroamérica'],
    seniorityLevels: ['Semi-Senior', 'Senior'],
    website: 'https://erpmexico.mx',
    contactName: 'Lic. Rodrigo Garza Peña',
    contactRole: 'Gerente Comercial LATAM',
    contactEmail: 'rgarza@erpmexico.mx',
    contactPhone: '+52 55 4912 3340',
    status: 'active',
    isBlocked: false,
    rating: 4.6,
    notes: 'Hub nearshore para desarrollo ABAP y localización de nómina para filiales mexicanas. Facturación en Pesos Mexicanos (MXN) o USD.',
    createdAt: '2026-07-25',
    updatedAt: '2026-08-20'
  },
  {
    id: 'supp-audit-consulting-blocked',
    vendorCode: 'LIFNR-10005',
    taxId: '76.512.340-9',
    legalName: 'Consultores de Gestión & Auditoría SpA',
    fantasyName: 'AuditConsulting Express SpA',
    siiActivityCode: '692000',
    businessActivity: 'Actividades de Contabilidad, Teneduría de Libros y Auditoría; Consultoría Fiscal',
    taxCategory: 'Primera Categoría',
    dteType: 'Factura Electrónica Afecta (19%)',
    dteBillingEmail: 'contacto@auditexpress.cl',
    siiStatusValid: false,
    address: 'Calle Moneda 970, Piso 5, Of. 504',
    officeOrSuite: 'Oficina 504',
    comuna: 'Santiago',
    city: 'Santiago',
    regionOrState: 'Región Metropolitana',
    country: 'Chile',
    isForeign: false,
    billingCurrency: 'CLP',
    acceptedCurrencies: ['CLP'],
    defaultHourlyRate: 65000,
    hourlyRateCurrency: 'CLP',
    paymentTerms: '30 días fecha factura',
    specialties: ['SAP_FICO', 'Auditoría Fiscal'],
    seniorityLevels: ['Senior'],
    contactName: 'Marcos A. Fuentes',
    contactRole: 'Representante Legal',
    contactEmail: 'mfuentes@auditexpress.cl',
    contactPhone: '+56 9 6555 1290',
    status: 'blocked',
    isBlocked: true,
    blockingReason: 'Inconcurrencia tributaria transitoria ante el SII (Requerimiento de acreditación de domicilio fiscal). Bloqueo preventivo compras SAP XK05.',
    blockedAt: '2026-09-02 10:30',
    blockedBy: 'Contraloría / Administración de Compras',
    rating: 3.2,
    notes: 'Proveedor bloqueado para emisión de pedidos de compra hasta regularizar situación ante el SII.',
    createdAt: '2026-06-15',
    updatedAt: '2026-09-02'
  }
];

export function getStoredSuppliers(): SupplierMasterItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading suppliers from localStorage:', err);
  }
  return INITIAL_SUPPLIERS_MASTER;
}

export function saveStoredSuppliers(suppliers: SupplierMasterItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(suppliers));
  } catch (err) {
    console.error('Error saving suppliers to localStorage:', err);
  }
}

export function createSupplier(item: Omit<SupplierMasterItem, 'id' | 'createdAt' | 'updatedAt'>): SupplierMasterItem {
  const now = new Date().toISOString().slice(0, 10);
  const newSupplier: SupplierMasterItem = {
    ...item,
    id: `supp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    createdAt: now,
    updatedAt: now
  };
  const current = getStoredSuppliers();
  const updated = [newSupplier, ...current];
  saveStoredSuppliers(updated);
  return newSupplier;
}

export function updateSupplier(id: string, updates: Partial<SupplierMasterItem>): SupplierMasterItem | null {
  const current = getStoredSuppliers();
  const index = current.findIndex(s => s.id === id);
  if (index === -1) return null;

  const now = new Date().toISOString().slice(0, 10);
  const updatedItem: SupplierMasterItem = {
    ...current[index],
    ...updates,
    updatedAt: now
  };

  current[index] = updatedItem;
  saveStoredSuppliers(current);
  return updatedItem;
}

export function toggleBlockSupplier(
  id: string, 
  isBlocked: boolean, 
  reason?: string, 
  blockedBy: string = 'Administrador de Compras SAP'
): SupplierMasterItem | null {
  const current = getStoredSuppliers();
  const index = current.findIndex(s => s.id === id);
  if (index === -1) return null;

  const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
  const updatedItem: SupplierMasterItem = {
    ...current[index],
    isBlocked,
    status: isBlocked ? 'blocked' : 'active',
    blockingReason: isBlocked ? (reason || 'Bloqueo administrativo de compras (SAP XK05)') : undefined,
    blockedAt: isBlocked ? now : undefined,
    blockedBy: isBlocked ? blockedBy : undefined,
    updatedAt: new Date().toISOString().slice(0, 10)
  };

  current[index] = updatedItem;
  saveStoredSuppliers(current);
  return updatedItem;
}

export function deleteSupplier(id: string): boolean {
  const current = getStoredSuppliers();
  const filtered = current.filter(s => s.id !== id);
  if (filtered.length === current.length) return false;
  saveStoredSuppliers(filtered);
  return true;
}

export function resetToInitialSuppliers(): SupplierMasterItem[] {
  saveStoredSuppliers(INITIAL_SUPPLIERS_MASTER);
  return INITIAL_SUPPLIERS_MASTER;
}
