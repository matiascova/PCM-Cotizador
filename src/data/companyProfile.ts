import { CompanyProfile } from '../types';

const STORAGE_KEY = 'sap_quotations_company_profile_v1';

export const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
  name: 'SAP & TECH CONSULTING',
  subheading: 'ENTERPRISE SOLUTIONS GROUP',
  legalName: 'SAP & Tech Consulting SpA',
  taxId: '77.654.321-8',
  businessActivity: 'Servicios Integrales de Consultoría en Tecnologías de la Información, Arquitectura SAP y Desarrollo de Sistemas',
  siiActivityCode: '620200',
  taxAddress: 'Av. Apoquindo 4501, Piso 14, Of. 1402',
  comuna: 'Las Condes',
  city: 'Santiago',
  region: 'Región Metropolitana',
  country: 'Chile',
  phone: '+56 2 2987 6543',
  email: 'contacto@techconsulting.cl',
  website: 'www.techconsulting.cl',
  logoUrl: '', // Default uses the lightning brand avatar or uploaded image
  legalRepresentative: {
    name: 'Diego Valenzuela M.',
    taxId: '15.892.341-K',
    role: 'Managing Partner & Principal SAP Advisor',
    email: 'dvalenzuela@techconsulting.cl',
    phone: '+56 9 4924 9816'
  }
};

export function getStoredCompanyProfile(): CompanyProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_COMPANY_PROFILE;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_COMPANY_PROFILE, ...parsed };
  } catch (err) {
    console.error('Error reading company profile from localStorage:', err);
    return DEFAULT_COMPANY_PROFILE;
  }
}

export function saveStoredCompanyProfile(profile: CompanyProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Error saving company profile to localStorage:', err);
  }
}
