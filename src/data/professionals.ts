import { Professional, SapModuleCode, SeniorityLevel } from '../types';

export const INITIAL_PROFESSIONALS: Professional[] = [
  {
    id: 'prof-01',
    code: 'CONS-HCM-01',
    name: 'Diego Rodrigues',
    email: 'drodrigues@consultora-tech.cl',
    phone: '+56 9 4924 9816',
    roleTitle: 'Consultor Senior SAP HCM & Nómina',
    moduleCode: 'SAP_HCM',
    moduleName: 'SAP HCM (Human Capital Management)',
    seniority: 'Senior',
    location: 'Santiago, Chile',
    modality: 'Híbrido',
    status: 'Disponible',
    rates: {
      UF: 2.50,
      CLP: 98000,
      USD: 105,
      MXN: 1950
    },
    costRates: {
      UF: 1.60,
      CLP: 62000,
      USD: 68,
      MXN: 1250
    },
    skills: ['Nómina Chile', 'Previred', 'Gestión de Tiempos (PT)', 'S/4HANA H4S4', 'Estructura OM/PA'],
    certifications: ['SAP Certified Application Associate - SAP HCM', 'S/4HANA Cloud HR Specialist'],
    bio: 'Más de 10 años liderando implementaciones de nómina legal chilena, convenios colectivos complejos y migraciones a S/4HANA.',
    active: true
  },
  {
    id: 'prof-02',
    code: 'CONS-MM-01',
    name: 'Camila Valenzuela',
    email: 'cvalenzuela@consultora-tech.cl',
    phone: '+56 9 7831 4452',
    roleTitle: 'Consultora Senior SAP MM & Aprovisionamiento',
    moduleCode: 'SAP_MM',
    moduleName: 'SAP MM (Materials Management)',
    seniority: 'Senior',
    location: 'Santiago, Chile',
    modality: 'Híbrido',
    status: 'Disponible',
    rates: {
      UF: 2.20,
      CLP: 88000,
      USD: 95,
      MXN: 1750
    },
    costRates: {
      UF: 1.45,
      CLP: 58000,
      USD: 62,
      MXN: 1150
    },
    skills: ['Compras Estratégicas', 'MRP', 'Gestión de Stocks', 'Integración FI-MM', 'S/4HANA Sourcing'],
    certifications: ['SAP Certified Associate - S/4HANA Sourcing and Procurement'],
    bio: 'Especialista en abastecimiento industrial para minería, manufactura y retail. Experta en optimización de inventarios y flujo P2P.',
    active: true
  },
  {
    id: 'prof-03',
    code: 'CONS-ABAP-01',
    name: 'Sebastián Soto',
    email: 'ssoto@consultora-tech.cl',
    phone: '+56 9 6512 8934',
    roleTitle: 'Arquitecto & Lead ABAP Cloud / Fiori RAP',
    moduleCode: 'DEV_ABAP',
    moduleName: 'Desarrollador ABAP / Fiori',
    seniority: 'Lead / Arquitecto',
    location: 'Viña del Mar, Chile',
    modality: 'Remoto',
    status: 'Disponible',
    rates: {
      UF: 2.80,
      CLP: 115000,
      USD: 120,
      MXN: 2200
    },
    costRates: {
      UF: 1.85,
      CLP: 74000,
      USD: 78,
      MXN: 1450
    },
    skills: ['ABAP RESTful Application Programming (RAP)', 'CDS Views', 'SAPUI5 / Fiori Elements', 'APIs OData v4', 'BTP'],
    certifications: ['SAP Certified Development Specialist - ABAP for SAP HANA', 'Clean ABAP Certified'],
    bio: 'Líder técnico con más de 12 años desarrollando extensiones limpias y modernas en SAP S/4HANA, minimizando el core modificado.',
    active: true
  },
  {
    id: 'prof-04',
    code: 'CONS-LE-01',
    name: 'Rodrigo Morales',
    email: 'rmorales@consultora-tech.cl',
    phone: '+56 9 8234 1178',
    roleTitle: 'Consultor Senior SAP LE-TRA & Logística',
    moduleCode: 'SAP_LE',
    moduleName: 'SAP LE (Logistics Execution)',
    seniority: 'Senior',
    location: 'Concepción, Chile',
    modality: 'Híbrido',
    status: 'En Asignación',
    rates: {
      UF: 2.30,
      CLP: 90000,
      USD: 95,
      MXN: 1800
    },
    costRates: {
      UF: 1.50,
      CLP: 60000,
      USD: 64,
      MXN: 1200
    },
    skills: ['Gestión de Expedición', 'Transporte LE-TRA', 'Picking & Packing', 'Integración con Básculas y WMS'],
    certifications: ['SAP Certified Application Associate - Logistics Execution'],
    bio: 'Experto en trazabilidad logística, despacho masivo a puertos e interfaces con sistemas de pesaje y operadores logísticos.',
    active: true
  },
  {
    id: 'prof-05',
    code: 'CONS-PM-01',
    name: 'Valentina Rivas',
    email: 'vrivas@consultora-tech.cl',
    phone: '+56 9 9123 4567',
    roleTitle: 'Consultora Senior SAP PM & Mantenimiento',
    moduleCode: 'SAP_PM',
    moduleName: 'SAP PM (Plant Maintenance)',
    seniority: 'Senior',
    location: 'Antofagasta, Chile',
    modality: 'Híbrido',
    status: 'Disponible',
    rates: {
      UF: 2.25,
      CLP: 89000,
      USD: 95,
      MXN: 1750
    },
    costRates: {
      UF: 1.45,
      CLP: 58000,
      USD: 62,
      MXN: 1150
    },
    skills: ['Planes Preventivos', 'Órdenes de Mantenimiento', 'Ubicaciones Técnicas', 'Mantenimiento Predictivo', 'Integración MM'],
    certifications: ['SAP Certified Application Associate - SAP Asset Management (PM)'],
    bio: 'Ingeniera especialista en confiabilidad de activos y mantenimiento para grandes plantas mineras, celulosas y energéticas.',
    active: true
  },
  {
    id: 'prof-06',
    code: 'CONS-QM-01',
    name: 'Matías Alarcón',
    email: 'malarcon@consultora-tech.cl',
    phone: '+56 9 5543 2198',
    roleTitle: 'Consultor Senior SAP QM & Calidad',
    moduleCode: 'SAP_QM',
    moduleName: 'SAP QM (Quality Management)',
    seniority: 'Senior',
    location: 'Santiago, Chile',
    modality: 'Remoto',
    status: 'Disponible',
    rates: {
      UF: 2.15,
      CLP: 85000,
      USD: 90,
      MXN: 1650
    },
    costRates: {
      UF: 1.40,
      CLP: 55000,
      USD: 60,
      MXN: 1100
    },
    skills: ['Lotes de Inspección', 'Planes de Muestreo', 'Avisos de Calidad Q1/Q2/Q3', 'Certificados de Calidad', 'Normas ISO'],
    certifications: ['SAP Quality Management Specialist', 'Auditor Líder ISO 9001'],
    bio: 'Consultor funcional con amplia experiencia en control de calidad alimentaria, farmacéutica e industrial bajo SAP.',
    active: true
  },
  {
    id: 'prof-07',
    code: 'CONS-FICO-01',
    name: 'Daniela Gómez',
    email: 'dgomez@consultora-tech.cl',
    phone: '+56 9 4432 1890',
    roleTitle: 'Consultora Lead SAP FICO & Localización',
    moduleCode: 'SAP_FICO',
    moduleName: 'SAP FICO (Financial & Controlling)',
    seniority: 'Lead / Arquitecto',
    location: 'Santiago, Chile',
    modality: 'Híbrido',
    status: 'Disponible',
    rates: {
      UF: 2.70,
      CLP: 110000,
      USD: 115,
      MXN: 2100
    },
    costRates: {
      UF: 1.80,
      CLP: 72000,
      USD: 76,
      MXN: 1400
    },
    skills: ['Contabilidad General (GL)', 'Cuentas por Pagar (AP)', 'Activos Fijos (AA)', 'Controlling (CO-PC/OM)', 'Localización Chile / LatAm'],
    certifications: ['SAP Certified Application Professional - Financials in SAP S/4HANA'],
    bio: 'Contadora auditora y consultora SAP FICO con más de 14 años liderando cierres contables, IFRS y facturación electrónica.',
    active: true
  },
  {
    id: 'prof-08',
    code: 'CONS-BASIS-01',
    name: 'Felipe Castro',
    email: 'fcastro@consultora-tech.cl',
    phone: '+598 99 123 456',
    roleTitle: 'Consultor Senior SAP Basis & HANA Architecture',
    moduleCode: 'SAP_BASIS',
    moduleName: 'Consultor SAP Basis / NetWeaver',
    seniority: 'Senior',
    location: 'Montevideo, Uruguay',
    modality: 'Remoto',
    status: 'Disponible',
    rates: {
      UF: 2.60,
      CLP: 105000,
      USD: 110,
      MXN: 2000
    },
    costRates: {
      UF: 1.70,
      CLP: 68000,
      USD: 72,
      MXN: 1300
    },
    skills: ['HANA 2.0 Database', 'Landscape Migration (SUM DMO)', 'Sizing & Performance Tuning', 'Cloud AWS/Azure', 'High Availability'],
    certifications: ['SAP Certified Technology Associate - SAP HANA 2.0 SPS06', 'AWS Certified Solutions Architect'],
    bio: 'Administrador de sistemas SAP con más de 11 años de trayectoria regional en migraciones complejas On-Premise a Cloud.',
    active: true
  },
  {
    id: 'prof-09',
    code: 'CONS-SEC-01',
    name: 'Lucía Méndez',
    email: 'lmendez@consultora-tech.mx',
    phone: '+52 55 4123 7890',
    roleTitle: 'Especialista Senior en Seguridad & PFCG SAP',
    moduleCode: 'SAP_SECURITY',
    moduleName: 'Consultor de Seguridad y Autorizaciones SAP',
    seniority: 'Senior',
    location: 'Ciudad de México',
    modality: 'Remoto',
    status: 'Disponible',
    rates: {
      UF: 2.30,
      CLP: 92000,
      USD: 95,
      MXN: 1850
    },
    costRates: {
      UF: 1.50,
      CLP: 60000,
      USD: 64,
      MXN: 1200
    },
    skills: ['Diseño Matriz Roles PFCG', 'Segregación de Funciones (SoD)', 'Fiori Catalog & Spaces', 'Auditoría y Compliance', 'SAP GRC'],
    certifications: ['SAP Certified Application Associate - SAP Access Control', 'CISA'],
    bio: 'Experta en gobernanza de identidades, remediación de perfiles sobredimensionados y cumplimiento en auditorías SOX/internas.',
    active: true
  },
  {
    id: 'prof-10',
    code: 'CONS-PMO-01',
    name: 'Carlos Henríquez',
    email: 'chenriquez@consultora-tech.cl',
    phone: '+56 9 7712 3456',
    roleTitle: 'Project Manager SAP Activate / Scrum Master',
    moduleCode: 'SAP_PMO_LEAD',
    moduleName: 'Project Manager SAP / Scrum Master',
    seniority: 'Lead / Arquitecto',
    location: 'Santiago, Chile',
    modality: 'Híbrido',
    status: 'Parcial',
    rates: {
      UF: 2.90,
      CLP: 120000,
      USD: 125,
      MXN: 2350
    },
    costRates: {
      UF: 1.90,
      CLP: 78000,
      USD: 82,
      MXN: 1550
    },
    skills: ['Metodología SAP Activate', 'Gestión de Gobernanza', 'Control de Riesgos e Hitos', 'Comités de Dirección', 'Scrum / Agile'],
    certifications: ['PMP® - Project Management Professional', 'Certified ScrumMaster (CSM)', 'SAP Activate Project Manager'],
    bio: 'Director de proyectos con más de 15 implementaciones exitosas de S/4HANA en tiempo y presupuesto en Chile y la región.',
    active: true
  },
  {
    id: 'prof-11',
    code: 'CONS-ABAP-02',
    name: 'Andrea Silva',
    email: 'asilva@consultora-tech.cl',
    phone: '+56 9 3321 9876',
    roleTitle: 'Consultora Semi-Senior ABAP / Fiori',
    moduleCode: 'DEV_ABAP',
    moduleName: 'Desarrollador ABAP / Fiori',
    seniority: 'Semi-Senior',
    location: 'Santiago, Chile',
    modality: 'Remoto',
    status: 'Disponible',
    rates: {
      UF: 1.60,
      CLP: 64000,
      USD: 68,
      MXN: 1250
    },
    costRates: {
      UF: 1.05,
      CLP: 42000,
      USD: 44,
      MXN: 820
    },
    skills: ['SmartForms & Adobe Forms', 'Reportes ALV', 'CDS Views Básicas', 'BAdIs / User Exits', 'Servicios OData'],
    certifications: ['SAP Certified Development Associate - ABAP with SAP NetWeaver'],
    bio: 'Desarrolladora ABAP con 4 años de experiencia en requerimientos de interfaces, formularios y reportes operacionales.',
    active: true
  },
  {
    id: 'prof-12',
    code: 'CONS-MM-02',
    name: 'Gonzalo Parra',
    email: 'gparra@consultora-tech.cl',
    phone: '+56 9 6654 3210',
    roleTitle: 'Consultor Semi-Senior SAP MM',
    moduleCode: 'SAP_MM',
    moduleName: 'SAP MM (Materials Management)',
    seniority: 'Semi-Senior',
    location: 'Valparaíso, Chile',
    modality: 'Híbrido',
    status: 'Disponible',
    rates: {
      UF: 1.55,
      CLP: 62000,
      USD: 65,
      MXN: 1200
    },
    costRates: {
      UF: 1.00,
      CLP: 40000,
      USD: 42,
      MXN: 780
    },
    skills: ['Maestro de Materiales', 'Verificación de Facturas (MIRO)', 'Gestión de Inventarios', 'Pruebas Funcionales'],
    certifications: ['SAP Application Associate - MM Trainee'],
    bio: 'Consultor MM enfocado en depuración de datos maestros, soporte a Key Users y ejecución de casos de prueba integrales.',
    active: true
  },
  {
    id: 'prof-13',
    code: 'CONS-PAY-01',
    name: 'Patricia Navarrete',
    email: 'pnavarrete@consultora-tech.cl',
    phone: '+56 9 8876 5432',
    roleTitle: 'Especialista en Remuneraciones, DT & Previred',
    moduleCode: 'SAP_HCM',
    moduleName: 'SAP HCM (Human Capital Management)',
    seniority: 'Senior',
    location: 'Santiago, Chile',
    modality: 'Remoto',
    status: 'Disponible',
    rates: {
      UF: 1.80,
      CLP: 72000,
      USD: 75,
      MXN: 1400
    },
    costRates: {
      UF: 1.15,
      CLP: 46000,
      USD: 48,
      MXN: 900
    },
    skills: ['Nómina Operativa', 'Libro Electrónico DT (LRE)', 'Declaración Jurada 1887', 'Previred Empresas', 'Leyes Laborales'],
    certifications: ['Auditora Laboral Certificada', 'Especialista en Tributación de Sueldos'],
    bio: 'Experta en procesamiento masivo de planillas de sueldos, control de asistencia e interfaces contables hacia ERPs.',
    active: true
  },
  {
    id: 'prof-14',
    code: 'CONS-HUNT-01',
    name: 'Javier Montero',
    email: 'jmontero@consultora-tech.cl',
    phone: '+56 9 9988 7766',
    roleTitle: 'Consultor Senior Headhunting & Reclutamiento IT/SAP',
    moduleCode: 'SAP_PMO_LEAD',
    moduleName: 'Project Manager SAP / Scrum Master',
    seniority: 'Senior',
    location: 'Santiago, Chile',
    modality: 'Remoto',
    status: 'Disponible',
    rates: {
      UF: 2.00,
      CLP: 80000,
      USD: 85,
      MXN: 1600
    },
    costRates: {
      UF: 1.30,
      CLP: 52000,
      USD: 55,
      MXN: 1000
    },
    skills: ['Entrevistas por Competencias (STAR)', 'Levantamiento de Perfiles SAP', 'Assessment Center', 'Headhunting C-Level', 'Informes Psicolaborales'],
    certifications: ['Psicólogo Organizacional', 'Certificación en Pruebas Psicolaborales Luscher y Zulliger'],
    bio: 'Psicólogo laboral especializado en la selección técnica de talentos SAP, gerentes de TI y consultores especializados para LatAm.',
    active: true
  }
];

const STORAGE_KEY = 'sap_professionals_catalog_v1';

/**
 * Obtiene la lista persistida de profesionales desde LocalStorage o los valores por defecto
 */
export function getStoredProfessionals(): Professional[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading professionals from localStorage', e);
  }
  return INITIAL_PROFESSIONALS;
}

/**
 * Guarda la lista de profesionales en LocalStorage
 */
export function saveStoredProfessionals(professionals: Professional[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(professionals));
  } catch (e) {
    console.error('Error saving professionals to localStorage', e);
  }
}

/**
 * Devuelve la tarifa horaria exacta de un profesional según la moneda solicitada
 */
export function getProfessionalRate(
  prof: Professional,
  currency: 'UF' | 'CLP' | 'USD' | 'MXN' | string
): number {
  if (prof.rates) {
    if (currency === 'UF' && prof.rates.UF !== undefined) return prof.rates.UF;
    if (currency === 'CLP' && prof.rates.CLP !== undefined) return prof.rates.CLP;
    if (currency === 'USD' && prof.rates.USD !== undefined) return prof.rates.USD;
    if (currency === 'MXN' && prof.rates.MXN !== undefined) return prof.rates.MXN;
  }
  // Default fallbacks
  if (currency === 'UF') return 2.20;
  if (currency === 'CLP') return 88000;
  if (currency === 'MXN') return 1650;
  return 90;
}
