import { RiskMitigationItem, OutOfScopeCategoryItem, ProjectType } from '../types';

export const DEFAULT_RISK_ITEMS: RiskMitigationItem[] = [
  {
    id: 'r1',
    risk: 'Demora en provisión de accesos, VPN o firewall',
    impact: 'Atraso en el inicio efectivo de las pruebas de sincronización y configuración de ambientes.',
    mitigation: 'El cómputo de los días hábiles no parte hasta recibir la confirmación técnica formal de conectividad.',
    owner: 'Cliente'
  },
  {
    id: 'r2',
    risk: 'Definición tardía de reglas de negocio o aprobación de especificaciones',
    impact: 'Tensión en el cronograma de diseño funcional y desfase en entregas de configuración.',
    mitigation: 'Designación obligatoria de un interlocutor con poder de decisión técnica y respuesta en máximo 1 día hábil.',
    owner: 'Ambos'
  },
  {
    id: 'r3',
    risk: 'Concurrencia o bloqueos transaccionales en bases de datos o ERP legado',
    impact: 'Fallos transitorios o bloqueos de interfaz durante ejecuciones simultáneas.',
    mitigation: 'Implementación de reintentos automáticos con backoff exponencial y procesamiento seguro en lotes controlados.',
    owner: 'Consultora'
  },
  {
    id: 'r4',
    risk: 'Solicitud de requerimientos fuera del alcance sin control formal',
    impact: 'Desviación presupuestaria y aumento no planificado de horas de desarrollo.',
    mitigation: 'Límite escrito claro: cualquier solicitud no contemplada en el inventario se gestiona vía Orden de Cambio formal.',
    owner: 'Ambos'
  }
];

export const DEFAULT_OUT_OF_SCOPE_CATEGORIES: OutOfScopeCategoryItem[] = [
  {
    id: 'oosc-1',
    title: 'Infraestructura & Licenciamiento Base',
    description: 'Licencias de software base (SAP, bases de datos o sistemas de terceros); consumos directos de proveedores de nube (AWS, Azure, GCP); registro de dominios corporativos o certificados SSL.'
  },
  {
    id: 'oosc-2',
    title: 'Desarrollos y Transacciones no Especificadas',
    description: 'Programas Z no inventariados en esta oferta, transacciones ABAP fuera del alcance descrito, módulos de analítica avanzada BI o migraciones históricas masivas no cotizadas.'
  },
  {
    id: 'oosc-3',
    title: 'Soporte y Disponibilidad fuera de Ventana Hábil',
    description: 'Guardia presencial 24/7 en fines de semana o festivos (el hipercare estándar cubre horario hábil lunes a viernes de 09:00 a 18:00 hrs de Chile).'
  },
  {
    id: 'oosc-4',
    title: 'Capacitaciones Masivas o Rediseños de Identidad',
    description: 'Talleres presenciales con más de 2 sesiones formales; edición o filmación audiovisual de cursos e-learning; rediseño de marca o manuales no descritos.'
  }
];

export const DEFAULT_GATEKEEPER_CONDITION = 
  'El cómputo del plazo de ejecución no comienza a correr hasta la entrega formal de los requisitos y accesos por parte del cliente (credenciales de prueba, confirmación de interlocutores técnicos y contrato firmado). Cada día hábil de atraso en la provisión de estos insumos corre la fecha de término en idéntica proporción.';

export function getDossierPresetsByProjectType(projectType: ProjectType): {
  hoy: string;
  quedaConstruido: string;
} {
  switch (projectType) {
    case 'Proceso de Remuneraciones (Payroll)':
      return {
        hoy: 'Procesamiento de nómina disperso con riesgo de errores en cálculos de leyes sociales, alta carga manual en la generación de archivos para Previred y bancos, y demoras en la contabilización hacia el sistema ERP.',
        quedaConstruido: 'Servicio externalizado de nómina con cálculo certificado de remuneraciones, control de asistencia integrado, archivos bancarios/previsionales automatizados y generación directa de asientos contables hacia SAP u otro ERP.'
      };
    case 'Reclutamiento, Selección & Headhunting':
      return {
        hoy: 'Posiciones clave vacantes con impacto negativo en la operación, procesos de selección largos sin evaluaciones técnicas validadas y dependencia de postulaciones espontáneas sin prospección ejecutiva directa.',
        quedaConstruido: 'Proceso estructurado de Headhunting con levantamiento de perfil técnico, evaluación psicolaboral por competencias STAR, terna de candidatos de alto nivel con garantía de reposición y fee de éxito transparente.'
      };
    case 'Conversión S/4HANA':
      return {
        hoy: 'Entorno SAP ERP tradicional con código personalizado obsoleto, tablas no optimizadas para HANA y riesgo de incompatibilidad técnica en la transición hacia S/4HANA.',
        quedaConstruido: 'Migración técnica y funcional estructurada a SAP S/4HANA con remediación de código ABAP, adopción del modelo de datos simplificado, migración de Business Partners y validación integral de procesos críticos.'
      };
    case 'Fábrica ABAP / Fiori':
      return {
        hoy: 'Acumulación de requerimientos de desarrollo sin estándares uniformes, interfaces complejas no responsivas y retrasos en la entrega de reportes y aplicaciones de usuario.',
        quedaConstruido: 'Fábrica de software ágil bajo estándares SAP Fiori y ABAP Cloud, con entregas continuas en CDS Views, APIs OData, aplicaciones responsive y documentación técnica exhaustiva.'
      };
    default:
      return {
        hoy: 'Procesos operativos y de negocio gestionados con herramientas heterogéneas o sistemas manuales fuera de un estándar empresarial. Falta de trazabilidad en tiempo real, reprocesos administrativos y demoras en la toma de decisiones.',
        quedaConstruido: 'Solución empresarial integral configurada bajo estándares de mejores prácticas. Procesos automatizados de extremo a extremo, integración nativa con el ecosistema de sistemas, trazabilidad inmutable y adopción fluida por los usuarios.'
      };
  }
}
