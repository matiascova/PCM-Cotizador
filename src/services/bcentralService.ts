/**
 * Servicio de Integración con el Banco Central de Chile (BCCh)
 * Obtiene y gestiona indicadores macroeconómicos clave:
 * - UF (Unidad de Fomento): Índice reajustable según el IPC
 * - Dólar Observado (USD/CLP): Tipo de cambio oficial
 * - Euro (EUR/CLP): Tipo de cambio oficial
 * - UTM (Unidad Tributaria Mensual)
 */

export interface BancoCentralIndicatorItem {
  code: string;
  name: string;
  value: number;
  unit: string;
  date: string;
  usdEquivalent?: number;
}

export interface BancoCentralData {
  status: 'success' | 'error';
  source: string;
  sourceUrl: string;
  updatedAt: string;
  dateFormatted: string;
  isFallback: boolean;
  cached?: boolean;
  cacheAgeSeconds?: number;
  indicators: {
    uf: BancoCentralIndicatorItem;
    dolar: BancoCentralIndicatorItem;
    euro: BancoCentralIndicatorItem;
    utm: BancoCentralIndicatorItem;
  };
}

const STORAGE_KEY = 'sap_bcentral_indicators_v1';

export const BASELINE_BCENTRAL_DATA: BancoCentralData = {
  status: 'success',
  source: 'Banco Central de Chile / CMF',
  sourceUrl: 'https://www.bcentral.cl',
  updatedAt: new Date().toISOString(),
  dateFormatted: '04/09/2026',
  isFallback: true,
  indicators: {
    uf: {
      code: 'UF',
      name: 'Unidad de fomento (UF)',
      value: 40879.04,
      unit: 'Pesos (CLP)',
      date: '2026-09-04',
      usdEquivalent: 43.79
    },
    dolar: {
      code: 'USD',
      name: 'Dólar observado',
      value: 933.47,
      unit: 'Pesos (CLP)',
      date: '2026-09-04'
    },
    euro: {
      code: 'EUR',
      name: 'Euro',
      value: 1086.06,
      unit: 'Pesos (CLP)',
      date: '2026-09-04'
    },
    utm: {
      code: 'UTM',
      name: 'Unidad tributaria mensual (UTM)',
      value: 71721.00,
      unit: 'Pesos (CLP)',
      date: '2026-09-04'
    }
  }
};

// Listeners for live updates across components
type IndicatorListener = (data: BancoCentralData) => void;
const listeners: Set<IndicatorListener> = new Set();

export function subscribeToBancoCentral(listener: IndicatorListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners(data: BancoCentralData) {
  listeners.forEach(fn => {
    try {
      fn(data);
    } catch (e) {
      console.error('Error notifying BCCh listener:', e);
    }
  });
}

/**
 * Obtener indicadores en caché inmediata desde localStorage o baseline
 */
export function getCachedBancoCentralData(): BancoCentralData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.indicators?.uf?.value) {
        return parsed;
      }
    }
  } catch {}
  return BASELINE_BCENTRAL_DATA;
}

/**
 * Consulta la API del Banco Central de Chile a través del backend local o endpoint directo
 */
export async function fetchBancoCentralIndicators(forceRefresh = false): Promise<BancoCentralData> {
  // 1. Intentar llamar al endpoint de nuestro servidor Express (/api/bcentral/indicators)
  try {
    const url = forceRefresh ? '/api/bcentral/indicators?refresh=true' : '/api/bcentral/indicators';
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });

    if (res.ok) {
      const data: BancoCentralData = await res.json();
      if (data?.indicators?.uf?.value) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch {}
        notifyListeners(data);
        return data;
      }
    }
  } catch (err) {
    console.warn('[Banco Central] Error llamando a /api/bcentral/indicators, intentando fallback directo:', err);
  }

  // 2. Fallback de cliente directo a mindicador.cl
  try {
    const directRes = await fetch('https://mindicador.cl/api');
    if (directRes.ok) {
      const raw = await directRes.json();
      const ufVal = Number(raw?.uf?.valor) || 40879.04;
      const dolarVal = Number(raw?.dolar?.valor) || 933.47;
      const euroVal = Number(raw?.euro?.valor) || 1086.06;
      const utmVal = Number(raw?.utm?.valor) || 71721.00;
      const usdEq = dolarVal > 0 ? Math.round((ufVal / dolarVal) * 100) / 100 : 43.79;

      const dateObj = raw?.uf?.fecha ? new Date(raw.uf.fecha) : new Date();
      const dateFormatted = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`;

      const clientData: BancoCentralData = {
        status: 'success',
        source: 'Banco Central de Chile / CMF (mindicador.cl directo)',
        sourceUrl: 'https://www.bcentral.cl',
        updatedAt: new Date().toISOString(),
        dateFormatted,
        isFallback: false,
        indicators: {
          uf: {
            code: 'UF',
            name: raw?.uf?.nombre || 'Unidad de fomento (UF)',
            value: ufVal,
            unit: 'Pesos (CLP)',
            date: raw?.uf?.fecha || new Date().toISOString(),
            usdEquivalent: usdEq
          },
          dolar: {
            code: 'USD',
            name: raw?.dolar?.nombre || 'Dólar observado',
            value: dolarVal,
            unit: 'Pesos (CLP)',
            date: raw?.dolar?.fecha || new Date().toISOString()
          },
          euro: {
            code: 'EUR',
            name: raw?.euro?.nombre || 'Euro',
            value: euroVal,
            unit: 'Pesos (CLP)',
            date: raw?.euro?.fecha || new Date().toISOString()
          },
          utm: {
            code: 'UTM',
            name: raw?.utm?.nombre || 'Unidad tributaria mensual (UTM)',
            value: utmVal,
            unit: 'Pesos (CLP)',
            date: raw?.utm?.fecha || new Date().toISOString()
          }
        }
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(clientData));
      } catch {}
      notifyListeners(clientData);
      return clientData;
    }
  } catch (directErr) {
    console.warn('[Banco Central] Error en fallback directo, utilizando datos en caché:', directErr);
  }

  // 3. Devolver datos en caché o baseline
  const cached = getCachedBancoCentralData();
  notifyListeners(cached);
  return cached;
}

/**
 * Conversión de UF a Pesos Chilenos (CLP)
 */
export function convertUfToClp(ufAmount: number, customUfRate?: number): number {
  const rate = customUfRate || getCachedBancoCentralData().indicators.uf.value || 40879.04;
  return Math.round(ufAmount * rate);
}

/**
 * Conversión de Pesos Chilenos (CLP) a UF
 */
export function convertClpToUf(clpAmount: number, customUfRate?: number): number {
  const rate = customUfRate || getCachedBancoCentralData().indicators.uf.value || 40879.04;
  if (rate <= 0) return 0;
  return Math.round((clpAmount / rate) * 100) / 100;
}

/**
 * Conversión de UF a Dólares (USD)
 */
export function convertUfToUsd(ufAmount: number, customUfRate?: number, customDolarRate?: number): number {
  const data = getCachedBancoCentralData();
  const ufRate = customUfRate || data.indicators.uf.value || 40879.04;
  const dolarRate = customDolarRate || data.indicators.dolar.value || 933.47;
  if (dolarRate <= 0) return 0;
  return Math.round(((ufAmount * ufRate) / dolarRate) * 100) / 100;
}

/**
 * Formato chileno estándar para valor de UF
 */
export function formatUfValue(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}
