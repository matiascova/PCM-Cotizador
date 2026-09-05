/**
 * Utilidades para formato y validación de documentos tributarios chilenos (SII)
 */

/**
 * Limpia y formatea un RUT chileno en el formato estándar XX.XXX.XXX-Y
 */
export function formatRut(rut: string): string {
  if (!rut) return '';
  // Remover todo lo que no sea número o k/K
  const clean = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length === 0) return '';
  if (clean.length === 1) return clean;

  const dv = clean.slice(-1);
  const cuerpo = clean.slice(0, -1);

  // Formatear cuerpo con puntos
  let cuerpoFormateado = '';
  let count = 0;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    cuerpoFormateado = cuerpo[i] + cuerpoFormateado;
    count++;
    if (count === 3 && i !== 0) {
      cuerpoFormateado = '.' + cuerpoFormateado;
      count = 0;
    }
  }

  return `${cuerpoFormateado}-${dv}`;
}

/**
 * Valida un RUT chileno usando el algoritmo de Módulo 11 oficial del SII
 */
export function validateRut(rut: string): boolean {
  if (!rut) return false;
  const clean = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length < 8 || clean.length > 9) return false;

  const cuerpo = clean.slice(0, -1);
  const dv = clean.slice(-1);

  let suma = 0;
  let multiplo = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }

  const residuo = 11 - (suma % 11);
  let dvCalculado = '';
  if (residuo === 11) dvCalculado = '0';
  else if (residuo === 10) dvCalculado = 'K';
  else dvCalculado = residuo.toString();

  return dv === dvCalculado;
}

/**
 * Lista de comunas comunes de Chile para autocompletar o selector rápido
 */
export const CHILE_COMUNAS = [
  'Las Condes',
  'Providencia',
  'Santiago',
  'Vitacura',
  'Lo Barnechea',
  'Ñuñoa',
  'Huechuraba',
  'Quilicura',
  'San Bernardo',
  'Pudahuel',
  'Maipú',
  'La Florida',
  'Peñalolén',
  'Colina',
  'Lampa',
  'Concepción',
  'Talcahuano',
  'San Pedro de la Paz',
  'Viña del Mar',
  'Valparaíso',
  'Quilpué',
  'Antofagasta',
  'Calama',
  'Rancagua',
  'Talca',
  'Temuco',
  'Puerto Montt',
  'Iquique',
  'La Serena',
  'Coquimbo',
  'Punta Arenas'
];

/**
 * Giros comerciales SII habituales para empresas B2B
 */
export const COMMON_GIROS_SII = [
  'Servicios Integrales de Consultoría en Tecnologías de la Información y Arquitectura SAP',
  'Sociedad de Inversiones, Asesorías Comerciales y Financieras',
  'Extracción, Explotación y Beneficio de Minerales Metalíferos',
  'Elaboración y Comercialización de Productos Alimenticios y Bebidas',
  'Fabricación de Productos de Celulosa, Papel y Cartón',
  'Servicios de Logística, Distribución y Transporte Terrestre',
  'Servicios de Ingeniería, Montaje Industrial y Construcción',
  'Venta al por Mayor de Maquinaria, Equipos y Repuestos Industriales',
  'Servicios de Telecomunicaciones y Transmisión de Datos',
  'Generación, Transmisión y Distribución de Energía Eléctrica',
  'Comercio al por Menor en Tiendas por Departamento y Retail'
];
