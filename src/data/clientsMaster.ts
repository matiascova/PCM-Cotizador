import { ClientMasterItem } from '../types';
import { 
  TWIN_DUCKS_LOGO_SVG, 
  MINERA_ANDINA_LOGO_SVG, 
  ALIMENTOS_PACIFICO_LOGO_SVG, 
  LOGISTICA_CONO_SUR_LOGO_SVG,
  getClientLogo 
} from './defaultClientLogos';

const STORAGE_KEY = 'sap_quotations_clients_master_v1';

export const INITIAL_CLIENTS_MASTER: ClientMasterItem[] = [
  {
    id: 'client-twin-ducks',
    companyName: 'Twin Ducks Capital SpA',
    fantasyName: 'Twin Ducks Capital',
    taxId: '76.982.415-K',
    businessActivity: 'Sociedad de Inversiones, Asesorías Comerciales y Financieras',
    siiActivityCode: '649900',
    taxAddress: 'Av. Isidora Goyenechea 3000, Piso 21, Of. 2101',
    comuna: 'Las Condes',
    city: 'Santiago',
    country: 'Chile',
    contactName: 'Matías Edwards R.',
    contactRole: 'Chief Investment Officer & Director de Operaciones',
    contactEmail: 'medwards@twinducks.cl',
    contactPhone: '+56 9 8765 4321',
    billingEmail: 'facturacion@twinducks.cl',
    industry: 'Servicios Financieros & Inversiones',
    logoUrl: TWIN_DUCKS_LOGO_SVG,
    notes: 'Holding de inversiones corporativas. Requieren soporte y parametrización avanzada en consolidación financiera SAP S/4HANA.',
    createdAt: '2026-08-01',
    updatedAt: '2026-09-01',
    active: true
  },
  {
    id: 'client-minera-andina',
    companyName: 'Minera Andina del Cobre S.A.',
    fantasyName: 'Minera Andina',
    taxId: '76.452.890-3',
    businessActivity: 'Extracción, Explotación y Beneficio de Minerales Metalíferos',
    siiActivityCode: '072910',
    taxAddress: 'Av. Andrés Bello 2711, Piso 18',
    comuna: 'Las Condes',
    city: 'Santiago',
    country: 'Chile',
    contactName: 'Ing. Roberto Valenzuela',
    contactRole: 'Gerente de Transformación Digital y TI',
    contactEmail: 'rvalenzuela@mineraandina.com',
    contactPhone: '+56 9 8452 1190',
    billingEmail: 'dte@mineraandina.com',
    industry: 'Minería & Recursos Naturales',
    logoUrl: MINERA_ANDINA_LOGO_SVG,
    notes: 'Gran minería del cobre en II Región. Proyectos en curso: Rollout SAP MM, LE, PM y QM.',
    createdAt: '2026-08-10',
    updatedAt: '2026-08-20',
    active: true
  },
  {
    id: 'client-arauco',
    companyName: 'Arauco Celulosa y Bosques S.A.',
    fantasyName: 'Arauco Celulosa',
    taxId: '91.563.000-8',
    businessActivity: 'Fabricación de Productos de Celulosa, Papel y Cartón',
    siiActivityCode: '170110',
    taxAddress: 'Av. El Golf 150, Piso 12',
    comuna: 'Las Condes',
    city: 'Santiago',
    country: 'Chile',
    contactName: 'Ing. Paulina Lagos M.',
    contactRole: 'Gerente Corporativa de Sistemas y Procesos',
    contactEmail: 'plagos@araucocelulosa.cl',
    contactPhone: '+56 9 7321 6540',
    billingEmail: 'facturas@araucocelulosa.cl',
    industry: 'Forestal, Celulosa & Manufactura',
    logoUrl: '',
    notes: 'Cliente con alta demanda de desarrollos Fiori y factoría ABAP para plantas industriales.',
    createdAt: '2026-08-12',
    updatedAt: '2026-08-28',
    active: true
  },
  {
    id: 'client-logistica-sur',
    companyName: 'Logística & Bebidas del Cono Sur S.A.',
    fantasyName: 'Logística Cono Sur',
    taxId: '76.120.340-5',
    businessActivity: 'Elaboración y Comercialización de Bebidas no Alcohólicas y Cervezas',
    siiActivityCode: '110400',
    taxAddress: 'Camino a Melipilla 12500',
    comuna: 'Maipú',
    city: 'Santiago',
    country: 'Chile',
    contactName: 'Sr. Fernando Cárdenas P.',
    contactRole: 'Director de Cadena de Suministro & Logística',
    contactEmail: 'fcardenas@conosurbebidas.cl',
    contactPhone: '+56 9 9123 4567',
    billingEmail: 'finanzas@conosurbebidas.cl',
    industry: 'Consumo Masivo & Bebidas',
    logoUrl: LOGISTICA_CONO_SUR_LOGO_SVG,
    notes: 'Rollout logístico y auditoría de inventarios.',
    createdAt: '2026-08-15',
    updatedAt: '2026-09-02',
    active: true
  },
  {
    id: 'client-alimentos-pacifico',
    companyName: 'Alimentos del Pacífico S.A. de C.V.',
    fantasyName: 'Alimentos del Pacífico',
    taxId: 'RFC: ALP-890315-K92',
    businessActivity: 'Procesamiento y Comercialización de Productos del Mar y Alimentos Congelados',
    siiActivityCode: '102010',
    taxAddress: 'Av. Costanera 450',
    comuna: 'Talcahuano',
    city: 'Concepción',
    country: 'Chile',
    contactName: 'Lic. Claudia Mendoza R.',
    contactRole: 'Directora de Finanzas y Control de Gestión',
    contactEmail: 'cmendoza@alimentospacifico.com',
    contactPhone: '+56 9 6543 2198',
    billingEmail: 'dte@alimentospacifico.com',
    industry: 'Alimentos & Agroindustria',
    logoUrl: ALIMENTOS_PACIFICO_LOGO_SVG,
    notes: 'Migración a S/4HANA Finance y optimización de costos.',
    createdAt: '2026-08-18',
    updatedAt: '2026-08-30',
    active: true
  }
];

export function getStoredClients(): ClientMasterItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_CLIENTS_MASTER;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Auto-backfill logos if missing
      return parsed.map((client: ClientMasterItem) => ({
        ...client,
        logoUrl: client.logoUrl && client.logoUrl.trim().length > 0 
          ? client.logoUrl 
          : getClientLogo(client)
      }));
    }
    return INITIAL_CLIENTS_MASTER;
  } catch (err) {
    console.error('Error reading clients master from localStorage:', err);
    return INITIAL_CLIENTS_MASTER;
  }
}

export function saveStoredClients(clients: ClientMasterItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
  } catch (err) {
    console.error('Error saving clients master to localStorage:', err);
  }
}
