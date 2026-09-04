import { Quotation, SapModuleCode } from '../types';

export interface FinancialSummary {
  totalHours: number;
  subtotalConsulting: number;
  discountAmount: number;
  netBeforeTax: number;
  taxAmount: number;
  totalAmount: number;
  hoursByModule: Record<string, number>;
  costByModule: Record<string, number>;
  averageHourlyRate: number;
}

export function calculateQuotationTotals(quote: Partial<Quotation>): FinancialSummary {
  const resources = quote.resources || [];
  let totalHours = 0;
  let subtotalConsulting = 0;
  const hoursByModule: Record<string, number> = {};
  const costByModule: Record<string, number> = {};

  resources.forEach(res => {
    const hours = Number(res.hours) || 0;
    const rate = Number(res.hourlyRate) || 0;
    const lineTotal = hours * rate;

    totalHours += hours;
    subtotalConsulting += lineTotal;

    const moduleKey = res.moduleName || res.moduleCode || 'Otros';
    hoursByModule[moduleKey] = (hoursByModule[moduleKey] || 0) + hours;
    costByModule[moduleKey] = (costByModule[moduleKey] || 0) + lineTotal;
  });

  const discountPercentage = Number(quote.discountPercentage) || 0;
  const discountAmount = subtotalConsulting * (discountPercentage / 100);
  const expensesAmount = Number(quote.expensesAmount) || 0;
  const netBeforeTax = subtotalConsulting - discountAmount + expensesAmount;

  const taxRate = Number(quote.taxRatePercentage) || 0;
  const taxAmount = netBeforeTax * (taxRate / 100);
  const totalAmount = netBeforeTax + taxAmount;

  const averageHourlyRate = totalHours > 0 ? subtotalConsulting / totalHours : 0;

  return {
    totalHours,
    subtotalConsulting,
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
  const formatted = new Intl.NumberFormat('es-CL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);

  return `${symbol} ${formatted} ${currency}`;
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
