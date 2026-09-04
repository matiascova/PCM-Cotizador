import { Quotation, SapModuleCode } from '../types';
import { formatCurrencyAmount, SupportedCurrency, CURRENCIES, convertCurrency } from './currencies';
import { convertUfToClp, convertUfToUsd } from '../services/bcentralService';

export interface FinancialSummary {
  totalHours: number;
  subtotalConsulting: number;
  // Breakdown by service type
  subtotalResources: number;
  subtotalPayroll: number;
  subtotalRecruitment: number;
  payrollHeadcount: number;
  attendanceHeadcount: number;
  customServicesTotal: number;
  recruitmentGrossSalaryFee: number;
  recruitmentActivitiesTotal: number;
  
  discountAmount: number;
  netBeforeTax: number;
  taxAmount: number;
  totalAmount: number;
  hoursByModule: Record<string, number>;
  costByModule: Record<string, number>;
  averageHourlyRate: number;
}

export function calculateQuotationTotals(quote: Partial<Quotation>): FinancialSummary {
  const currency = quote.currency || 'USD';
  const resources = quote.resources || [];
  let totalHours = 0;
  let subtotalResources = 0;
  const hoursByModule: Record<string, number> = {};
  const costByModule: Record<string, number> = {};

  resources.forEach(res => {
    const hours = Number(res.hours) || 0;
    const rate = Number(res.hourlyRate) || 0;
    const lineTotal = hours * rate;

    totalHours += hours;
    subtotalResources += lineTotal;

    const moduleKey = res.moduleName || res.moduleCode || 'Otros';
    hoursByModule[moduleKey] = (hoursByModule[moduleKey] || 0) + hours;
    costByModule[moduleKey] = (costByModule[moduleKey] || 0) + lineTotal;
  });

  // 1. Proceso de Remuneraciones
  let subtotalPayrollInQuoteCurrency = 0;
  let payrollHeadcount = 0;
  let attendanceHeadcount = 0;
  let customServicesTotal = 0;

  if (quote.payrollService && quote.payrollService.enabled) {
    payrollHeadcount = Number(quote.payrollService.payrollHeadcount) || 0;
    const payrollRate = Number(quote.payrollService.payrollRatePerPersonUF) || 0;
    const payrollSubtotalUF = payrollHeadcount * payrollRate;

    attendanceHeadcount = Number(quote.payrollService.attendanceHeadcount) || 0;
    const attendanceRate = Number(quote.payrollService.attendanceRatePerPersonUF) || 0;
    const attendanceSubtotalUF = attendanceHeadcount * attendanceRate;

    const customServices = quote.payrollService.customServices || [];
    const customUF = customServices.reduce((sum, cs) => sum + ((Number(cs.quantity) || 0) * (Number(cs.unitPriceUF) || 0)), 0);
    customServicesTotal = customUF;

    const totalPayrollUF = payrollSubtotalUF + attendanceSubtotalUF + customUF;

    if (currency === 'UF') {
      subtotalPayrollInQuoteCurrency = totalPayrollUF;
    } else if (currency === 'CLP') {
      subtotalPayrollInQuoteCurrency = convertUfToClp(totalPayrollUF);
    } else if (currency === 'USD') {
      subtotalPayrollInQuoteCurrency = convertUfToUsd(totalPayrollUF);
    } else {
      const clp = convertUfToClp(totalPayrollUF);
      subtotalPayrollInQuoteCurrency = convertCurrency(clp, 'CLP', currency);
    }

    // Add to module breakdown
    costByModule['Proceso de Remuneraciones'] = (costByModule['Proceso de Remuneraciones'] || 0) + subtotalPayrollInQuoteCurrency;
  }

  // 2. Reclutamiento, Selección / Headhunting
  let subtotalRecruitmentInQuoteCurrency = 0;
  let recruitmentGrossSalaryFee = 0;
  let recruitmentActivitiesTotal = 0;

  if (quote.recruitmentService && quote.recruitmentService.enabled) {
    const grossSalaryAmount = Number(quote.recruitmentService.grossSalaryAmount) || 0;
    const feePct = Number(quote.recruitmentService.grossSalaryFeePercentage) || 100;
    const includeFee = quote.recruitmentService.includeGrossSalaryFee;
    const salaryCurrency = quote.recruitmentService.grossSalaryCurrency || 'CLP';

    let grossFeeInQuoteCurrency = 0;
    if (includeFee && grossSalaryAmount > 0) {
      const rawFee = grossSalaryAmount * (feePct / 100);
      grossFeeInQuoteCurrency = convertCurrency(rawFee, salaryCurrency, currency);
      recruitmentGrossSalaryFee = grossFeeInQuoteCurrency;
    }

    const activities = quote.recruitmentService.activities || [];
    const activitiesUF = activities.reduce((sum, a) => sum + ((Number(a.quantity) || 0) * (Number(a.ratePerActivityUF) || 0)), 0);
    recruitmentActivitiesTotal = activitiesUF;

    let activitiesInQuoteCurrency = 0;
    if (currency === 'UF') {
      activitiesInQuoteCurrency = activitiesUF;
    } else if (currency === 'CLP') {
      activitiesInQuoteCurrency = convertUfToClp(activitiesUF);
    } else if (currency === 'USD') {
      activitiesInQuoteCurrency = convertUfToUsd(activitiesUF);
    } else {
      const clp = convertUfToClp(activitiesUF);
      activitiesInQuoteCurrency = convertCurrency(clp, 'CLP', currency);
    }

    subtotalRecruitmentInQuoteCurrency = grossFeeInQuoteCurrency + activitiesInQuoteCurrency;
    costByModule['Reclutamiento & Headhunting'] = (costByModule['Reclutamiento & Headhunting'] || 0) + subtotalRecruitmentInQuoteCurrency;
  }

  // Subtotal total consulting & services
  const subtotalConsulting = subtotalResources + subtotalPayrollInQuoteCurrency + subtotalRecruitmentInQuoteCurrency;

  const discountPercentage = Number(quote.discountPercentage) || 0;
  const discountAmount = subtotalConsulting * (discountPercentage / 100);
  const expensesAmount = Number(quote.expensesAmount) || 0;
  const netBeforeTax = subtotalConsulting - discountAmount + expensesAmount;

  const taxRate = Number(quote.taxRatePercentage) || 0;
  const taxAmount = netBeforeTax * (taxRate / 100);
  const totalAmount = netBeforeTax + taxAmount;

  const averageHourlyRate = totalHours > 0 ? subtotalResources / totalHours : 0;

  return {
    totalHours,
    subtotalConsulting,
    subtotalResources,
    subtotalPayroll: subtotalPayrollInQuoteCurrency,
    subtotalRecruitment: subtotalRecruitmentInQuoteCurrency,
    payrollHeadcount,
    attendanceHeadcount,
    customServicesTotal,
    recruitmentGrossSalaryFee,
    recruitmentActivitiesTotal,
    discountAmount,
    netBeforeTax,
    taxAmount,
    totalAmount,
    hoursByModule,
    costByModule,
    averageHourlyRate
  };
}

export function formatCurrency(amount: number, currency = 'USD', symbol = '$'): string {
  return formatCurrencyAmount(amount, currency, symbol);
}

export function getStatusBadge(status: Quotation['status']): {
  label: string;
  bg: string;
  text: string;
  border: string;
  dotColor: string;
} {
  switch (status) {
    case 'draft':
      return {
        label: 'Borrador',
        bg: 'bg-stone-100',
        text: 'text-stone-700',
        border: 'border-stone-300',
        dotColor: 'bg-stone-400'
      };
    case 'sent':
      return {
        label: 'Enviada al Cliente',
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        dotColor: 'bg-blue-500'
      };
    case 'negotiation':
      return {
        label: 'En Negociación / Revisión',
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dotColor: 'bg-amber-500'
      };
    case 'approved':
      return {
        label: 'Aprobada (A Ejecución)',
        bg: 'bg-emerald-50',
        text: 'text-emerald-800',
        border: 'border-emerald-200',
        dotColor: 'bg-emerald-500'
      };
    case 'rejected':
      return {
        label: 'Rechazada',
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        dotColor: 'bg-rose-500'
      };
  }
}
