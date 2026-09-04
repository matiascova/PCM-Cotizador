import { SeniorityLevel, SapModuleCode } from '../types';
import { getCachedBancoCentralData } from '../services/bcentralService';

export type SupportedCurrency = 'CLP' | 'UF' | 'MXN' | 'USD';

export interface CurrencyConfig {
  code: SupportedCurrency;
  name: string;
  shortName: string;
  symbol: string;
  flag: string;
  country: string;
  defaultTaxRate: number; // 19% Chile, 16% México, 0% Exportación
  taxName: string;
  decimals: number;
  locale: string;
  approxRateToUSD: number; // 1 USD = 933 CLP, 0.0228 UF, 18.5 MXN
  description: string;
}

export const CURRENCIES: Record<SupportedCurrency, CurrencyConfig> = {
  CLP: {
    code: 'CLP',
    name: 'Pesos chilenos',
    shortName: 'Pesos Chilenos',
    symbol: '$',
    flag: '🇨🇱',
    country: 'Chile (Oficina Central Santiago)',
    defaultTaxRate: 19,
    taxName: 'IVA Chile (19%)',
    decimals: 0,
    locale: 'es-CL',
    approxRateToUSD: 933,
    description: 'Moneda local para clientes en Chile. Tarifa horaria típica de consultoría SAP: $40.000 a $130.000 CLP/hr.'
  },
  UF: {
    code: 'UF',
    name: 'Unidad de Fomento (UF)',
    shortName: 'UF (Banco Central)',
    symbol: 'UF',
    flag: '🇨🇱',
    country: 'Chile (Banco Central de Chile - Reajustable IPC)',
    defaultTaxRate: 19,
    taxName: 'IVA Chile (19%)',
    decimals: 2,
    locale: 'es-CL',
    approxRateToUSD: 0.0228, // 1 USD ≈ 0.0228 UF (1 UF ≈ 43.8 USD / $40.879 CLP)
    description: 'Unidad financiera reajustable según la inflación (IPC) oficial del Banco Central de Chile. Estándar para proyectos de mediano/largo plazo y bolsas de soporte AMS en Chile.'
  },
  MXN: {
    code: 'MXN',
    name: 'Pesos mexicanos',
    shortName: 'Pesos Mexicanos',
    symbol: '$',
    flag: '🇲🇽',
    country: 'México',
    defaultTaxRate: 16,
    taxName: 'IVA México (16%)',
    decimals: 0,
    locale: 'es-MX',
    approxRateToUSD: 18.5,
    description: 'Moneda para clientes en territorio mexicano. Tarifa horaria típica de consultoría SAP: $800 a $2.500 MXN/hr.'
  },
  USD: {
    code: 'USD',
    name: 'Dólares estadounidenses',
    shortName: 'Dólares',
    symbol: '$',
    flag: '🇺🇸',
    country: 'Internacional (Uruguay, Brasil, Colombia)',
    defaultTaxRate: 0,
    taxName: 'Exportación de Servicios (0% IVA exento)',
    decimals: 0,
    locale: 'en-US',
    approxRateToUSD: 1,
    description: 'Moneda de referencia regional para clientes en Uruguay, Brasil, Colombia y exportación de servicios desde Chile.'
  }
};

/**
 * Standard benchmark hourly rates by currency and seniority for SAP consulting
 */
export const BENCHMARK_RATES_BY_CURRENCY: Record<SupportedCurrency, Record<SeniorityLevel, number>> = {
  CLP: {
    'Junior': 42000,
    'Semi-Senior': 62000,
    'Senior': 88000,
    'Lead / Arquitecto': 120000
  },
  UF: {
    'Junior': 1.05,
    'Semi-Senior': 1.55,
    'Senior': 2.20,
    'Lead / Arquitecto': 3.00
  },
  MXN: {
    'Junior': 800,
    'Semi-Senior': 1200,
    'Senior': 1650,
    'Lead / Arquitecto': 2250
  },
  USD: {
    'Junior': 45,
    'Semi-Senior': 65,
    'Senior': 90,
    'Lead / Arquitecto': 125
  }
};

/**
 * Multiplier factors for specialized modules (HCM, PM, Basis, Security, etc.)
 */
const MODULE_RATE_MULTIPLIERS: Record<SapModuleCode, number> = {
  SAP_MM: 1.0,
  SAP_LE: 1.05,
  SAP_PM: 1.0,
  SAP_QM: 1.0,
  SAP_HCM: 1.1,
  DEV_ABAP: 0.95,
  SAP_BASIS: 1.05,
  SAP_SECURITY: 1.0,
  SAP_FICO: 1.05,
  SAP_PMO_LEAD: 1.1
};

/**
 * Get the benchmark rate for a specific SAP module, seniority, and currency
 */
export function getBenchmarkRate(
  moduleCode: SapModuleCode,
  seniority: SeniorityLevel,
  currency: SupportedCurrency | string
): number {
  const curr = (currency in CURRENCIES ? currency : 'USD') as SupportedCurrency;
  const base = BENCHMARK_RATES_BY_CURRENCY[curr]?.[seniority] || BENCHMARK_RATES_BY_CURRENCY[curr]?.['Senior'] || 90;
  const multiplier = MODULE_RATE_MULTIPLIERS[moduleCode] || 1.0;
  
  if (curr === 'UF') {
    // Round to 2 decimal places for UF (e.g. 2.42 UF/hr)
    return Math.round((base * multiplier) * 100) / 100;
  }
  if (curr === 'CLP') {
    // Round to nearest 1,000 CLP
    return Math.round((base * multiplier) / 1000) * 1000;
  }
  if (curr === 'MXN') {
    // Round to nearest 50 MXN
    return Math.round((base * multiplier) / 50) * 50;
  }
  // USD
  return Math.round(base * multiplier);
}

/**
 * Format currency amount with regional standard
 */
export function formatCurrencyAmount(
  amount: number,
  currency: SupportedCurrency | string = 'USD',
  symbol = '$'
): string {
  const curr = (currency in CURRENCIES ? currency : 'USD') as SupportedCurrency;
  const config = CURRENCIES[curr] || CURRENCIES.USD;
  
  const formattedNumber = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: config.decimals > 0 ? 2 : 0,
    maximumFractionDigits: config.decimals
  }).format(amount);

  if (curr === 'UF') {
    return `UF ${formattedNumber}`;
  }

  return `${symbol} ${formattedNumber} ${curr}`;
}

/**
 * Conversion between supported currencies taking into account Banco Central de Chile indicators
 */
export function convertCurrency(
  amount: number,
  fromCurrency: SupportedCurrency | string,
  toCurrency: SupportedCurrency | string
): number {
  const from = (fromCurrency in CURRENCIES ? fromCurrency : 'USD') as SupportedCurrency;
  const to = (toCurrency in CURRENCIES ? toCurrency : 'USD') as SupportedCurrency;
  
  if (from === to) return amount;

  // Retrieve live Banco Central indicators if available
  const bcData = getCachedBancoCentralData();
  const liveUf = bcData?.indicators?.uf?.value || 40879.04;
  const liveDolar = bcData?.indicators?.dolar?.value || 933.47;

  // Direct conversion between CLP and UF
  if (from === 'UF' && to === 'CLP') {
    return Math.round(amount * liveUf);
  }
  if (from === 'CLP' && to === 'UF') {
    return Math.round((amount / liveUf) * 100) / 100;
  }

  // Convert to USD intermediate
  let amountInUSD = amount;
  if (from === 'CLP') {
    amountInUSD = amount / liveDolar;
  } else if (from === 'UF') {
    amountInUSD = (amount * liveUf) / liveDolar;
  } else if (from === 'MXN') {
    amountInUSD = amount / CURRENCIES.MXN.approxRateToUSD;
  }

  // Convert from USD to target
  if (to === 'USD') return Math.round(amountInUSD);
  if (to === 'CLP') return Math.round(amountInUSD * liveDolar);
  if (to === 'UF') return Math.round(((amountInUSD * liveDolar) / liveUf) * 100) / 100;
  if (to === 'MXN') return Math.round(amountInUSD * CURRENCIES.MXN.approxRateToUSD);

  return Math.round(amountInUSD);
}

