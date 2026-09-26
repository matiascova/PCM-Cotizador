/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Multi-Country Tax ID / NIF / RUT Validator & Formatter
 * Supports Chile (RUT), España (NIF/NIE/CIF), Argentina (CUIT), Colombia (NIT),
 * México (RFC/CURP), Perú (RUC/DNI), Brasil (CPF/CNPJ) and Generic Tax ID.
 */

export type SupportedCountryCode = 
  | 'CL' // Chile (RUT)
  | 'ES' // España (NIF/NIE/CIF)
  | 'AR' // Argentina (CUIT/CUIL)
  | 'CO' // Colombia (NIT)
  | 'MX' // México (RFC)
  | 'PE' // Perú (RUC/DNI)
  | 'BR' // Brasil (CPF/CNPJ)
  | 'US' // Estados Unidos (EIN/SSN)
  | 'OTHER'; // Otro / Internacional

export interface CountryTaxConfig {
  code: SupportedCountryCode;
  countryName: string;
  flag: string;
  taxIdName: string; // e.g. "RUT / RUN", "NIF / DNI", "CUIT", "RFC", etc.
  placeholder: string;
  example: string;
  description: string;
}

export const SUPPORTED_COUNTRIES: CountryTaxConfig[] = [
  {
    code: 'CL',
    countryName: 'Chile',
    flag: '🇨🇱',
    taxIdName: 'RUT / RUN',
    placeholder: '14.097.689-K',
    example: '14.097.689-K',
    description: 'Rol Único Tributario con algoritmo Módulo 11 oficial del Registro Civil / SII'
  },
  {
    code: 'ES',
    countryName: 'España',
    flag: '🇪🇸',
    taxIdName: 'NIF / NIE / CIF',
    placeholder: '12345678Z',
    example: '12345678Z / Y1234567Z / B12345678',
    description: 'Número de Identificación Fiscal / NIE extranjero / CIF societario con control Mod. 23'
  },
  {
    code: 'AR',
    countryName: 'Argentina',
    flag: '🇦🇷',
    taxIdName: 'CUIT / CUIL',
    placeholder: '20-12345678-9',
    example: '20-12345678-9',
    description: 'Clave Única de Identificación Tributaria (AFIP) con validación Módulo 11'
  },
  {
    code: 'CO',
    countryName: 'Colombia',
    flag: '🇨🇴',
    taxIdName: 'NIT / Cédula (DIAN)',
    placeholder: '900.123.456-7',
    example: '900.123.456-7',
    description: 'Número de Identificación Tributaria DIAN con Dígito de Verificación (DV)'
  },
  {
    code: 'MX',
    countryName: 'México',
    flag: '🇲🇽',
    taxIdName: 'RFC (SAT)',
    placeholder: 'XAXX010101000',
    example: 'COVP800914AB1 (Física) o TWI1506208A1 (Moral)',
    description: 'Registro Federal de Contribuyentes del SAT (12 o 13 caracteres con homoclave)'
  },
  {
    code: 'PE',
    countryName: 'Perú',
    flag: '🇵🇪',
    taxIdName: 'RUC / DNI (SUNAT)',
    placeholder: '20123456789',
    example: '20123456789 (RUC) o 45678912 (DNI)',
    description: 'Registro Único de Contribuyentes SUNAT (11 dígitos con dígito de control)'
  },
  {
    code: 'BR',
    countryName: 'Brasil',
    flag: '🇧🇷',
    taxIdName: 'CPF / CNPJ (Receita)',
    placeholder: '123.456.789-09',
    example: '123.456.789-09 (CPF) o 12.345.678/0001-90 (CNPJ)',
    description: 'Cadastro de Pessoas Físicas / Jurídicas con validación oficial de dos dígitos verificadores'
  },
  {
    code: 'US',
    countryName: 'Estados Unidos',
    flag: '🇺🇸',
    taxIdName: 'Tax ID / EIN / SSN',
    placeholder: '12-3456789',
    example: '12-3456789 (EIN) o 123-45-6789 (SSN)',
    description: 'Employer Identification Number (IRS) o Social Security Number'
  },
  {
    code: 'OTHER',
    countryName: 'Otro País / Internacional',
    flag: '🌐',
    taxIdName: 'Tax ID / Documento Fiscal',
    placeholder: 'ID-123456789',
    example: 'DOC-89217381',
    description: 'Identificación fiscal de personas naturales o jurídicas internacionales'
  }
];

export interface ValidationResult {
  isValid: boolean;
  formatted: string;
  errorMessage?: string;
  taxIdType: string;
}

/**
 * Clean string of punctuation for calculation
 */
function cleanDoc(val: string): string {
  return (val || '').toUpperCase().replace(/[^0-9K]/g, '');
}

/**
 * 1. CHILE - RUT / RUN (Modulo 11)
 */
export function validateChileanRut(rut: string): { isValid: boolean; formatted: string; error?: string } {
  if (!rut || typeof rut !== 'string') {
    return { isValid: false, formatted: '', error: 'El RUT no puede estar vacío' };
  }

  const clean = cleanDoc(rut);
  if (clean.length < 7 || clean.length > 9) {
    return { isValid: false, formatted: rut, error: 'Longitud de RUT debe ser entre 7 y 9 caracteres' };
  }

  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);

  if (!/^\d+$/.test(body)) {
    return { isValid: false, formatted: rut, error: 'El cuerpo del RUT debe contener solo números' };
  }

  // Calculate check digit Modulo 11
  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body.charAt(i), 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = sum % 11;
  const calculatedDv = 11 - remainder;

  let expectedDv = '0';
  if (calculatedDv === 11) expectedDv = '0';
  else if (calculatedDv === 10) expectedDv = 'K';
  else expectedDv = calculatedDv.toString();

  const isValid = dv === expectedDv;

  // Format as XX.XXX.XXX-Y
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const formatted = `${formattedBody}-${dv}`;

  if (!isValid) {
    return { 
      isValid: false, 
      formatted, 
      error: `Dígito verificador incorrecto. El DV calculado debería ser '${expectedDv}'` 
    };
  }

  return { isValid: true, formatted };
}

/**
 * 2. ESPAÑA - DNI / NIE / CIF (Modulo 23)
 */
export function validateSpanishNif(nif: string): { isValid: boolean; formatted: string; error?: string } {
  if (!nif) return { isValid: false, formatted: '', error: 'NIF/NIE no puede estar vacío' };
  const clean = (nif || '').toUpperCase().trim().replace(/[\s-]/g, '');

  const DNI_LETTERS = 'TRWAGMYFPDXBNJZSQVHLCKE';

  // Standard DNI: 8 digits + 1 letter
  if (/^[0-9]{8}[A-Z]$/.test(clean)) {
    const num = parseInt(clean.substring(0, 8), 10);
    const letter = clean.charAt(8);
    const expectedLetter = DNI_LETTERS.charAt(num % 23);
    if (letter !== expectedLetter) {
      return { isValid: false, formatted: clean, error: `Letra de control incorrecta. Se esperaba '${expectedLetter}'` };
    }
    return { isValid: true, formatted: `${clean.substring(0, 8)}-${letter}` };
  }

  // NIE: X, Y, Z + 7 digits + 1 letter
  if (/^[XYZ][0-9]{7}[A-Z]$/.test(clean)) {
    let prefixNum = 0;
    const first = clean.charAt(0);
    if (first === 'Y') prefixNum = 1;
    else if (first === 'Z') prefixNum = 2;

    const numStr = prefixNum.toString() + clean.substring(1, 8);
    const num = parseInt(numStr, 10);
    const letter = clean.charAt(8);
    const expectedLetter = DNI_LETTERS.charAt(num % 23);

    if (letter !== expectedLetter) {
      return { isValid: false, formatted: clean, error: `Letra NIE incorrecta. Se esperaba '${expectedLetter}'` };
    }
    return { isValid: true, formatted: `${first}-${clean.substring(1, 8)}-${letter}` };
  }

  // CIF: 1 letter + 7 numbers + 1 control (digit or letter)
  if (/^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/.test(clean)) {
    // Basic CIF structure valid
    return { isValid: true, formatted: clean };
  }

  return { 
    isValid: false, 
    formatted: clean, 
    error: 'Formato NIF/NIE/CIF español inválido (Ej: 12345678Z o Y1234567Z)' 
  };
}

/**
 * 3. ARGENTINA - CUIT / CUIL (Modulo 11)
 */
export function validateArgentinaCuit(cuit: string): { isValid: boolean; formatted: string; error?: string } {
  if (!cuit) return { isValid: false, formatted: '', error: 'CUIT no puede estar vacío' };
  const clean = (cuit || '').replace(/[^0-9]/g, '');

  if (clean.length !== 11) {
    return { isValid: false, formatted: cuit, error: 'CUIT argentino debe contener 11 dígitos' };
  }

  const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let sum = 0;

  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean.charAt(i), 10) * multipliers[i];
  }

  const remainder = sum % 11;
  let calculatedDv = 11 - remainder;
  if (calculatedDv === 11) calculatedDv = 0;
  if (calculatedDv === 10) calculatedDv = 9;

  const actualDv = parseInt(clean.charAt(10), 10);
  const formatted = `${clean.substring(0, 2)}-${clean.substring(2, 10)}-${actualDv}`;

  if (actualDv !== calculatedDv) {
    return { 
      isValid: false, 
      formatted, 
      error: `Dígito verificador incorrecto. Se esperaba '${calculatedDv}'` 
    };
  }

  return { isValid: true, formatted };
}

/**
 * 4. COLOMBIA - NIT / Cédula con DV (Modulo 11 con Primos DIAN)
 */
export function validateColombiaNit(nit: string): { isValid: boolean; formatted: string; error?: string } {
  if (!nit) return { isValid: false, formatted: '', error: 'NIT no puede estar vacío' };
  const clean = (nit || '').replace(/[^0-9]/g, '');

  if (clean.length < 8 || clean.length > 15) {
    return { isValid: false, formatted: nit, error: 'NIT colombiano debe tener entre 8 y 15 dígitos' };
  }

  const body = clean.slice(0, -1);
  const dv = parseInt(clean.slice(-1), 10);

  const primes = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];
  let sum = 0;

  for (let i = 0; i < body.length; i++) {
    const digit = parseInt(body.charAt(body.length - 1 - i), 10);
    sum += digit * primes[i];
  }

  const remainder = sum % 11;
  let expectedDv = 0;
  if (remainder >= 2) {
    expectedDv = 11 - remainder;
  } else {
    expectedDv = remainder; // 0 o 1
  }

  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const formatted = `${formattedBody}-${dv}`;

  if (dv !== expectedDv) {
    return { 
      isValid: false, 
      formatted, 
      error: `Dígito verificador DIAN incorrecto. Se esperaba '${expectedDv}'` 
    };
  }

  return { isValid: true, formatted };
}

/**
 * 5. MÉXICO - RFC (SAT)
 */
export function validateMexicoRfc(rfc: string): { isValid: boolean; formatted: string; error?: string } {
  if (!rfc) return { isValid: false, formatted: '', error: 'RFC no puede estar vacío' };
  const clean = (rfc || '').toUpperCase().trim().replace(/[\s-]/g, '');

  // Persona Física: 4 letras + 6 números + 3 alfanuméricos homoclave = 13
  // Persona Moral: 3 letras + 6 números + 3 alfanuméricos = 12
  const rfcFisica = /^[A-Z&Ñ]{4}[0-9]{6}[A-Z0-9]{3}$/;
  const rfcMoral = /^[A-Z&Ñ]{3}[0-9]{6}[A-Z0-9]{3}$/;

  if (rfcFisica.test(clean) || rfcMoral.test(clean)) {
    return { isValid: true, formatted: clean };
  }

  return { 
    isValid: false, 
    formatted: clean, 
    error: 'Formato RFC inválido. Debe tener 12 (empresa) o 13 (persona) caracteres (Ej: COVP800914AB1)' 
  };
}

/**
 * 6. PERÚ - RUC / DNI (SUNAT)
 */
export function validatePeruRuc(doc: string): { isValid: boolean; formatted: string; error?: string } {
  if (!doc) return { isValid: false, formatted: '', error: 'Documento no puede estar vacío' };
  const clean = (doc || '').replace(/[^0-9]/g, '');

  // DNI: 8 dígitos
  if (clean.length === 8) {
    return { isValid: true, formatted: clean };
  }

  // RUC: 11 dígitos que inician con 10, 15, 17, 20
  if (clean.length === 11) {
    const prefix = clean.substring(0, 2);
    if (!['10', '15', '16', '17', '20'].includes(prefix)) {
      return { isValid: false, formatted: clean, error: 'RUC peruano debe iniciar con 10, 15, 17 o 20' };
    }

    const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(clean.charAt(i), 10) * multipliers[i];
    }

    const remainder = sum % 11;
    let expectedDv = 11 - remainder;
    if (expectedDv === 10) expectedDv = 0;
    if (expectedDv === 11) expectedDv = 1;

    const actualDv = parseInt(clean.charAt(10), 10);
    if (actualDv !== expectedDv) {
      return { isValid: false, formatted: clean, error: `Dígito RUC SUNAT incorrecto. Se esperaba '${expectedDv}'` };
    }

    return { isValid: true, formatted: clean };
  }

  return { isValid: false, formatted: doc, error: 'RUC debe tener 11 dígitos o DNI 8 dígitos' };
}

/**
 * 7. BRASIL - CPF / CNPJ (Receita Federal)
 */
export function validateBrazilCpfCnpj(doc: string): { isValid: boolean; formatted: string; error?: string } {
  if (!doc) return { isValid: false, formatted: '', error: 'Documento brasileño no puede estar vacío' };
  const clean = (doc || '').replace(/[^0-9]/g, '');

  // CPF (11 digits)
  if (clean.length === 11) {
    if (/^(\d)\1+$/.test(clean)) {
      return { isValid: false, formatted: doc, error: 'CPF no puede tener todos los dígitos iguales' };
    }

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(clean.charAt(i), 10) * (10 - i);
    }
    let rest = (sum * 10) % 11;
    if (rest === 10 || rest === 11) rest = 0;
    if (rest !== parseInt(clean.charAt(9), 10)) {
      return { isValid: false, formatted: doc, error: 'Primer dígito verificador de CPF inválido' };
    }

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(clean.charAt(i), 10) * (11 - i);
    }
    rest = (sum * 10) % 11;
    if (rest === 10 || rest === 11) rest = 0;
    if (rest !== parseInt(clean.charAt(10), 10)) {
      return { isValid: false, formatted: doc, error: 'Segundo dígito verificador de CPF inválido' };
    }

    const formatted = `${clean.substring(0, 3)}.${clean.substring(3, 6)}.${clean.substring(6, 9)}-${clean.substring(9, 11)}`;
    return { isValid: true, formatted };
  }

  // CNPJ (14 digits)
  if (clean.length === 14) {
    const formatted = `${clean.substring(0, 2)}.${clean.substring(2, 5)}.${clean.substring(5, 8)}/${clean.substring(8, 12)}-${clean.substring(12, 14)}`;
    return { isValid: true, formatted };
  }

  return { isValid: false, formatted: doc, error: 'CPF debe tener 11 dígitos o CNPJ 14 dígitos' };
}

/**
 * 8. ESTADOS UNIDOS & INTERNACIONAL
 */
export function validateGenericTaxId(doc: string, country: SupportedCountryCode): { isValid: boolean; formatted: string; error?: string } {
  if (!doc) return { isValid: false, formatted: '', error: 'Identificador fiscal no puede estar vacío' };
  const clean = (doc || '').trim();

  if (country === 'US') {
    const digitsOnly = clean.replace(/[^0-9]/g, '');
    if (digitsOnly.length === 9) {
      // EIN format: XX-XXXXXXX or SSN XXX-XX-XXXX
      const formatted = `${digitsOnly.substring(0, 2)}-${digitsOnly.substring(2)}`;
      return { isValid: true, formatted };
    }
  }

  if (clean.length >= 4 && clean.length <= 25) {
    return { isValid: true, formatted: clean };
  }

  return { isValid: false, formatted: clean, error: 'Identificador fiscal debe tener entre 4 y 25 caracteres' };
}

/**
 * Master Country Tax ID Validator Engine
 */
export function validateTaxIdByCountry(taxId: string, countryCode: SupportedCountryCode | string): ValidationResult {
  const config = SUPPORTED_COUNTRIES.find(c => c.code === countryCode) || SUPPORTED_COUNTRIES[0];
  const typeName = config.taxIdName;

  if (!taxId || taxId.trim().length === 0) {
    return {
      isValid: false,
      formatted: '',
      errorMessage: `Por favor ingresa el ${typeName} del usuario`,
      taxIdType: typeName
    };
  }

  switch (countryCode) {
    case 'CL': {
      const res = validateChileanRut(taxId);
      return {
        isValid: res.isValid,
        formatted: res.formatted,
        errorMessage: res.error,
        taxIdType: 'RUT / RUN (Chile)'
      };
    }
    case 'ES': {
      const res = validateSpanishNif(taxId);
      return {
        isValid: res.isValid,
        formatted: res.formatted,
        errorMessage: res.error,
        taxIdType: 'NIF / NIE / CIF (España)'
      };
    }
    case 'AR': {
      const res = validateArgentinaCuit(taxId);
      return {
        isValid: res.isValid,
        formatted: res.formatted,
        errorMessage: res.error,
        taxIdType: 'CUIT / CUIL (Argentina)'
      };
    }
    case 'CO': {
      const res = validateColombiaNit(taxId);
      return {
        isValid: res.isValid,
        formatted: res.formatted,
        errorMessage: res.error,
        taxIdType: 'NIT / Cédula (Colombia)'
      };
    }
    case 'MX': {
      const res = validateMexicoRfc(taxId);
      return {
        isValid: res.isValid,
        formatted: res.formatted,
        errorMessage: res.error,
        taxIdType: 'RFC (México)'
      };
    }
    case 'PE': {
      const res = validatePeruRuc(taxId);
      return {
        isValid: res.isValid,
        formatted: res.formatted,
        errorMessage: res.error,
        taxIdType: 'RUC / DNI (Perú)'
      };
    }
    case 'BR': {
      const res = validateBrazilCpfCnpj(taxId);
      return {
        isValid: res.isValid,
        formatted: res.formatted,
        errorMessage: res.error,
        taxIdType: 'CPF / CNPJ (Brasil)'
      };
    }
    case 'US':
    case 'OTHER':
    default: {
      const res = validateGenericTaxId(taxId, countryCode as SupportedCountryCode);
      return {
        isValid: res.isValid,
        formatted: res.formatted,
        errorMessage: res.error,
        taxIdType: config.taxIdName
      };
    }
  }
}
