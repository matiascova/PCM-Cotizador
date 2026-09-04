import React from 'react';
import { 
  Download, 
  Printer, 
  ArrowLeft, 
  CheckCircle2, 
  Building2, 
  Calendar, 
  FileText, 
  Layers, 
  Clock, 
  ShieldCheck 
} from 'lucide-react';
import { Quotation } from '../types';
import { calculateQuotationTotals, formatCurrency, getStatusBadge } from '../utils/calculations';
import { downloadQuotationPDF } from '../utils/pdfGenerator';

interface QuotationPrintViewProps {
  quote: Quotation;
  onBack: () => void;
}

export const QuotationPrintView: React.FC<QuotationPrintViewProps> = ({
  quote,
  onBack
}) => {
  const totals = calculateQuotationTotals(quote);
  const statusBadge = getStatusBadge(quote.status);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    downloadQuotationPDF(quote);
  };

  return (
    <div className="bg-slate-100 min-h-screen py-6 px-3 sm:px-6">
      {/* Top Action Bar (hidden in print mode) */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <button
          onClick={onBack}
          className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al Tablero</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Imprimir Documento</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar PDF Estándar SAP</span>
          </button>
        </div>
      </div>

      {/* A4 Sheet Container */}
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl border border-slate-200 p-8 sm:p-12 print:shadow-none print:border-none print:p-0 text-slate-800">
        {/* Document Header */}
        <div className="border-b-2 border-blue-900 pb-5 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded bg-blue-800 text-white font-bold text-sm flex items-center justify-center">
                  SAP
                </span>
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  CONSULTORÍA & SERVICIOS SAP
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Propuesta Técnico-Comercial de Implementación & Staffing
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block text-xs font-bold px-2.5 py-1 rounded-full border mb-1 bg-blue-50 text-blue-800 border-blue-200">
                {quote.code} (v{quote.version})
              </span>
              <div className="text-xs text-slate-600 space-y-0.5">
                <p>Fecha Emisión: <span className="font-semibold text-slate-800">{quote.createdAt}</span></p>
                <p>Válido hasta: <span className="font-semibold text-slate-800">{quote.validUntil}</span></p>
                <p>Moneda: <span className="font-semibold text-slate-800">{quote.currency}</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Client & Offer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-7 text-xs">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
              Información del Cliente
            </h3>
            <p className="font-bold text-slate-900 text-sm">{quote.client.companyName}</p>
            <p className="text-slate-600 mt-0.5">Tax ID / RUT: {quote.client.taxId || 'N/A'}</p>
            <p className="text-slate-600">Contacto: {quote.client.contactName} ({quote.client.contactRole})</p>
            <p className="text-slate-600">Email: {quote.client.contactEmail}</p>
            <p className="text-slate-600">Sector: {quote.client.industry} | {quote.client.country}</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
              Ficha Técnica del Servicio
            </h3>
            <p className="font-semibold text-slate-900">{quote.project.projectType}</p>
            <p className="text-slate-600 mt-0.5">Ambiente SAP: <span className="font-medium text-slate-800">{quote.project.sapSystemVersion}</span></p>
            <p className="text-slate-600">Metodología: <span className="font-medium text-slate-800">{quote.project.methodology}</span></p>
            <p className="text-slate-600">Duración: <span className="font-medium text-slate-800">{quote.project.durationMonths} meses</span></p>
            <p className="text-slate-600">Hipercare post Go-Live: <span className="font-medium text-slate-800">{quote.guaranteeHypercareDays} días</span></p>
          </div>
        </div>

        {/* Section 1: Project Scope */}
        <div className="mb-7">
          <h2 className="text-sm font-bold text-blue-900 uppercase tracking-wide border-b border-slate-200 pb-1.5 mb-2.5">
            1. Alcance y Objetivos de la Solución SAP
          </h2>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            {quote.project.projectTitle}
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed mb-3">
            {quote.project.scopeDescription || quote.project.businessObjective}
          </p>

          {quote.project.assumptions && quote.project.assumptions.length > 0 && (
            <div className="bg-blue-50/60 border border-blue-100 rounded-lg p-3 text-xs mb-2">
              <span className="font-bold text-blue-950 block mb-1">Supuestos de la Propuesta:</span>
              <ul className="list-disc pl-4 space-y-0.5 text-slate-700">
                {quote.project.assumptions.map((ass, i) => (
                  <li key={i}>{ass}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Section 2: Staffing Plan & Resource Assignment */}
        <div className="mb-7">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2.5">
            <h2 className="text-sm font-bold text-blue-900 uppercase tracking-wide">
              2. Plan de Recursos y Especialistas SAP Asignados
            </h2>
            <span className="text-xs font-bold text-slate-700">
              Total Horas: {totals.totalHours} hrs
            </span>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Módulo SAP</th>
                  <th className="py-2.5 px-3">Rol / Especialidad</th>
                  <th className="py-2.5 px-3">Seniority</th>
                  <th className="py-2.5 px-3">Modalidad</th>
                  <th className="py-2.5 px-3 text-right">Horas</th>
                  <th className="py-2.5 px-3 text-right">Tarifa/Hr</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {quote.resources.map(res => (
                  <tr key={res.id} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-semibold text-slate-900">
                      {res.moduleName}
                    </td>
                    <td className="py-2 px-3 text-slate-700">{res.roleTitle}</td>
                    <td className="py-2 px-3">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {res.seniority}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-600">{res.modality}</td>
                    <td className="py-2 px-3 text-right font-medium text-slate-800">{res.hours} hrs</td>
                    <td className="py-2 px-3 text-right text-slate-700">
                      {formatCurrency(res.hourlyRate, quote.currency, quote.currencySymbol)}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">
                      {formatCurrency(res.hours * res.hourlyRate, quote.currency, quote.currencySymbol)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Milestones & Payment Schedule */}
        <div className="mb-7">
          <h2 className="text-sm font-bold text-blue-900 uppercase tracking-wide border-b border-slate-200 pb-1.5 mb-2.5">
            3. Hitos de Proyecto y Plan de Facturación
          </h2>

          <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Fase / Hito</th>
                  <th className="py-2.5 px-3">Entregables Principales</th>
                  <th className="py-2.5 px-3">Plazo</th>
                  <th className="py-2.5 px-3 text-right">% Facturación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {quote.milestones.map((m, idx) => (
                  <tr key={m.id} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-semibold text-slate-900">
                      {idx + 1}. {m.title}
                    </td>
                    <td className="py-2 px-3 text-slate-600">{m.deliverables || m.description}</td>
                    <td className="py-2 px-3 text-slate-600">{m.estimatedWeek}</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">{m.paymentPercentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Financial Summary */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-blue-900 uppercase tracking-wide border-b border-slate-200 pb-1.5 mb-2.5">
            4. Resumen Económico de la Oferta
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            <div className="text-xs text-slate-600 space-y-1.5">
              <p className="font-semibold text-slate-800">Condiciones Comerciales y de Pago:</p>
              <p>{quote.paymentTerms || '30 días fecha factura tras aceptación de hito.'}</p>
              <p className="text-slate-500 mt-2">
                * Las horas no ejecutadas durante el periodo pactado no son acumulables sin previo acuerdo por escrito.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Horas de Consultoría ({totals.totalHours} hrs):</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(totals.subtotalConsulting, quote.currency, quote.currencySymbol)}
                </span>
              </div>
              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Descuento Comercial ({quote.discountPercentage}%):</span>
                  <span>- {formatCurrency(totals.discountAmount, quote.currency, quote.currencySymbol)}</span>
                </div>
              )}
              {totals.taxAmount > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Impuestos / IVA ({quote.taxRatePercentage}%):</span>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(totals.taxAmount, quote.currency, quote.currencySymbol)}
                  </span>
                </div>
              )}
              <div className="border-t border-slate-300 pt-2 flex justify-between text-sm font-bold text-blue-900">
                <span>Total de la Oferta:</span>
                <span>{formatCurrency(totals.totalAmount, quote.currency, quote.currencySymbol)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Signatures */}
        <div className="pt-6 border-t border-slate-200">
          <div className="grid grid-cols-2 gap-12 text-center text-xs">
            <div>
              <div className="border-t border-slate-400 pt-2 mt-12">
                <p className="font-bold text-slate-900">POR LA CONSULTORA SAP</p>
                <p className="text-slate-500">Líder de Práctica / Representante Comercial</p>
              </div>
            </div>

            <div>
              <div className="border-t border-slate-400 pt-2 mt-12">
                <p className="font-bold text-slate-900">ACEPTACIÓN CLIENTE</p>
                <p className="text-slate-500">{quote.client.companyName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
