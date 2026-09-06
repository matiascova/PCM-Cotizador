/**
 * Logos corporativos SVG predeterminados para clientes y utilidades
 * de renderizado estético de carátulas comerciales.
 */

// 1. Logo corporativo: Twin Ducks Capital SpA
export const TWIN_DUCKS_LOGO_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 120" fill="none">
  <rect width="420" height="120" rx="16" fill="%230b1528"/>
  <!-- Emblema Geométrico Twin Ducks -->
  <g transform="translate(18, 14)">
    <rect width="92" height="92" rx="20" fill="url(%23g-shield)" stroke="%2338bdf8" stroke-width="1.5" stroke-opacity="0.3"/>
    <!-- Cresta Pato 1 (Principal) -->
    <path d="M42 22C42 22 52 24 58 32C64 40 68 52 56 60C44 68 32 64 26 54C20 44 26 34 34 30C42 26 48 30 48 30" stroke="%2338bdf8" stroke-width="3" stroke-linecap="round" fill="none"/>
    <circle cx="50" cy="32" r="3" fill="%2338bdf8"/>
    <!-- Cresta Pato 2 (Twin) -->
    <path d="M54 36C54 36 64 38 70 46C76 54 78 66 66 74C54 82 44 78 38 70" stroke="%23f59e0b" stroke-width="3" stroke-linecap="round" fill="none"/>
    <circle cx="62" cy="46" r="3" fill="%23f59e0b"/>
    <!-- Detalle Capital Onda -->
    <path d="M22 74C32 70 42 70 52 74C62 78 72 78 82 74" stroke="%2394a3b8" stroke-width="2" stroke-linecap="round" stroke-dasharray="2 3"/>
  </g>
  <!-- Tipografía Corporativa -->
  <text x="126" y="52" fill="%23ffffff" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="24" letter-spacing="1.5">TWIN DUCKS</text>
  <text x="126" y="74" fill="%2338bdf8" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="13" letter-spacing="4">CAPITAL</text>
  <text x="126" y="94" fill="%2394a3b8" font-family="system-ui, -apple-system, sans-serif" font-weight="500" font-size="10" letter-spacing="0.5">INVESTMENT & ADVISORY GROUP</text>
  <defs>
    <linearGradient id="g-shield" x1="0" y1="0" x2="92" y2="92" gradientUnits="userSpaceOnUse">
      <stop stop-color="%231e293b"/>
      <stop offset="1" stop-color="%230f172a"/>
    </linearGradient>
  </defs>
</svg>`;

// 2. Logo corporativo: Minera Andina del Cobre S.A.
export const MINERA_ANDINA_LOGO_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 120" fill="none">
  <rect width="420" height="120" rx="16" fill="%23141b18"/>
  <g transform="translate(18, 14)">
    <rect width="92" height="92" rx="20" fill="url(%23g-copper)" stroke="%23fb923c" stroke-width="1.5" stroke-opacity="0.3"/>
    <!-- Montañas Andinas Cobre -->
    <path d="M18 70L38 32L54 56L68 36L86 70Z" fill="url(%23g-mtn)" opacity="0.9"/>
    <path d="M38 32L54 56L42 70L24 70Z" fill="%23fdba74" opacity="0.6"/>
    <circle cx="74" cy="30" r="4" fill="%23fb923c"/>
  </g>
  <text x="126" y="52" fill="%23ffffff" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="22" letter-spacing="1">MINERA ANDINA</text>
  <text x="126" y="74" fill="%23fb923c" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="12" letter-spacing="3">DEL COBRE S.A.</text>
  <text x="126" y="94" fill="%2394a3b8" font-family="system-ui, -apple-system, sans-serif" font-weight="500" font-size="10" letter-spacing="0.5">DIVISIÓN OPERACIONES NORTE</text>
  <defs>
    <linearGradient id="g-copper" x1="0" y1="0" x2="92" y2="92" gradientUnits="userSpaceOnUse">
      <stop stop-color="%23292524"/>
      <stop offset="1" stop-color="%231c1917"/>
    </linearGradient>
    <linearGradient id="g-mtn" x1="18" y1="32" x2="86" y2="70" gradientUnits="userSpaceOnUse">
      <stop stop-color="%23ea580c"/>
      <stop offset="1" stop-color="%239a3412"/>
    </linearGradient>
  </defs>
</svg>`;

// 3. Logo corporativo: Alimentos del Pacífico S.A.
export const ALIMENTOS_PACIFICO_LOGO_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 120" fill="none">
  <rect width="420" height="120" rx="16" fill="%23062326"/>
  <g transform="translate(18, 14)">
    <rect width="92" height="92" rx="20" fill="url(%23g-pac)" stroke="%232dd4bf" stroke-width="1.5" stroke-opacity="0.3"/>
    <!-- Olas y Espiga -->
    <path d="M22 62C32 54 44 54 54 62C64 70 74 70 82 62" stroke="%232dd4bf" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M26 72C34 66 42 66 50 72C58 78 66 78 74 72" stroke="%2338bdf8" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="52" cy="38" r="12" fill="%23facc15" opacity="0.9"/>
  </g>
  <text x="126" y="52" fill="%23ffffff" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="21" letter-spacing="1">ALIMENTOS DEL PACÍFICO</text>
  <text x="126" y="74" fill="%232dd4bf" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="12" letter-spacing="3">AGROINDUSTRIAS & EXPORTACIÓN</text>
  <text x="126" y="94" fill="%2394a3b8" font-family="system-ui, -apple-system, sans-serif" font-weight="500" font-size="10">FOODS & BEVERAGES DIVISION</text>
  <defs>
    <linearGradient id="g-pac" x1="0" y1="0" x2="92" y2="92" gradientUnits="userSpaceOnUse">
      <stop stop-color="%23134e4a"/>
      <stop offset="1" stop-color="%23042f2e"/>
    </linearGradient>
  </defs>
</svg>`;

// 4. Logo corporativo: Logística & Bebidas del Cono Sur S.A.
export const LOGISTICA_CONO_SUR_LOGO_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 120" fill="none">
  <rect width="420" height="120" rx="16" fill="%231e1338"/>
  <g transform="translate(18, 14)">
    <rect width="92" height="92" rx="20" fill="url(%23g-log)" stroke="%23c084fc" stroke-width="1.5" stroke-opacity="0.3"/>
    <path d="M26 64L48 26L70 64H26Z" stroke="%23a855f7" stroke-width="3" fill="none"/>
    <circle cx="48" cy="50" r="8" fill="%23e879f9"/>
    <path d="M20 74H80" stroke="%23c084fc" stroke-width="2" stroke-linecap="round"/>
  </g>
  <text x="126" y="52" fill="%23ffffff" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="20" letter-spacing="1">LOGÍSTICA CONO SUR</text>
  <text x="126" y="74" fill="%23c084fc" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="12" letter-spacing="3">BEBIDAS & DISTRIBUCIÓN S.A.</text>
  <text x="126" y="94" fill="%2394a3b8" font-family="system-ui, -apple-system, sans-serif" font-weight="500" font-size="10">SUPPLY CHAIN & LOGISTICS NETWORK</text>
  <defs>
    <linearGradient id="g-log" x1="0" y1="0" x2="92" y2="92" gradientUnits="userSpaceOnUse">
      <stop stop-color="%233b0764"/>
      <stop offset="1" stop-color="%231e1b4b"/>
    </linearGradient>
  </defs>
</svg>`;

/**
 * Genera un logo SVG corporativo vectorizado para cualquier cliente
 * a partir de sus iniciales y nombre de fantasía.
 */
export function generateClientMonogramSVG(name: string, fantasyName?: string): string {
  const displayName = (fantasyName || name || 'Cliente Corporativo').trim();
  const words = displayName.replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/).filter(Boolean);
  
  let initials = 'CL';
  if (words.length >= 2) {
    initials = (words[0][0] + words[1][0]).toUpperCase();
  } else if (words.length === 1) {
    initials = words[0].substring(0, 2).toUpperCase();
  }

  // Generar color base estable a partir del nombre
  let hash = 0;
  for (let i = 0; i < displayName.length; i++) {
    hash = displayName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hues = [210, 220, 200, 260, 160, 30]; // tonos azul, índigo, teal, púrpura, esmeralda, ámbar
  const selectedHue = hues[Math.abs(hash) % hues.length];

  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 120" fill="none">
    <rect width="420" height="120" rx="16" fill="%230f172a"/>
    <g transform="translate(18, 14)">
      <rect width="92" height="92" rx="20" fill="hsl(${selectedHue}, 50%, 15%)" stroke="hsl(${selectedHue}, 80%, 65%)" stroke-width="1.5" stroke-opacity="0.4"/>
      <circle cx="46" cy="46" r="32" stroke="hsl(${selectedHue}, 80%, 65%)" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.6"/>
      <text x="46" y="55" fill="hsl(${selectedHue}, 90%, 80%)" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="30" text-anchor="middle" letter-spacing="1">${initials}</text>
    </g>
    <text x="126" y="52" fill="%23ffffff" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="22" letter-spacing="1">${displayName.substring(0, 22).toUpperCase()}</text>
    <text x="126" y="74" fill="hsl(${selectedHue}, 80%, 70%)" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="12" letter-spacing="3">CLIENTE CORPORATIVO</text>
    <text x="126" y="94" fill="%2394a3b8" font-family="system-ui, -apple-system, sans-serif" font-weight="500" font-size="10" letter-spacing="0.5">PROPUESTA TÉCNICA SAP</text>
  </svg>`;
}

/**
 * Obtiene el mejor logo disponible para un cliente.
 */
export function getClientLogo(client?: {
  companyName?: string;
  fantasyName?: string;
  logoUrl?: string;
}): string {
  if (!client) {
    return TWIN_DUCKS_LOGO_SVG;
  }

  // 1. Si tiene logo personalizado explícito
  if (client.logoUrl && client.logoUrl.trim().length > 0) {
    return client.logoUrl.trim();
  }

  const nameCheck = `${client.fantasyName || ''} ${client.companyName || ''}`.toLowerCase();

  // 2. Mapeo a logos maestros
  if (nameCheck.includes('twin duck')) {
    return TWIN_DUCKS_LOGO_SVG;
  }
  if (nameCheck.includes('minera andina') || nameCheck.includes('cobre')) {
    return MINERA_ANDINA_LOGO_SVG;
  }
  if (nameCheck.includes('alimentos') || nameCheck.includes('pacífico') || nameCheck.includes('pacifico')) {
    return ALIMENTOS_PACIFICO_LOGO_SVG;
  }
  if (nameCheck.includes('logística') || nameCheck.includes('logistica') || nameCheck.includes('cono sur')) {
    return LOGISTICA_CONO_SUR_LOGO_SVG;
  }

  // 3. Fallback inteligente con monograma SVG vectorizado
  return generateClientMonogramSVG(client.companyName || 'Cliente Corporativo', client.fantasyName);
}
