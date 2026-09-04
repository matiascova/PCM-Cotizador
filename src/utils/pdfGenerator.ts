import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Quotation } from '../types';
import { calculateQuotationTotals, formatCurrency } from './calculations';

export function generateQuotationPDF(quote: Quotation): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const totals = calculateQuotationTotals(quote);
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let currentY = 18;

  // Primary Colors (SAP Navy & Slate)
  const primaryNavy: [number, number, number] = [15, 44, 89]; // #0F2C59
  const accentBlue: [number, number, number] = [0, 114, 206]; // SAP Blue #0072CE
  const textDark: [number, number, number] = [30, 41, 59]; // #1E293B
  const textGray: [number, number, number] = [100, 116, 139]; // #64748B
  const bgLight: [number, number, number] = [248, 250, 252]; // #F8FAFC

  // Header Banner
  doc.setFillColor(...primaryNavy);
  doc.rect(margin, currentY, pageWidth - (margin * 2), 24, 'F');

  // Accent Line
  doc.setFillColor(...accentBlue);
  doc.rect(margin, currentY + 24, pageWidth - (margin * 2), 2, 'F');

  // Title in Header
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('PROPUESTA TÉCNICO-COMERCIAL | CONSULTORÍA SAP', margin + 6, currentY + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Soluciones Empresariales SAP & Servicios de Transformación Digital', margin + 6, currentY + 18);

  // Quote Code Badge in Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(quote.code, pageWidth - margin - 6, currentY + 11, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Versión ${quote.version} | Emisión: ${quote.createdAt}`, pageWidth - margin - 6, currentY + 18, { align: 'right' });

  currentY += 34;

  // Metadata Grid: Client and Project Details
  doc.setFillColor(...bgLight);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, (pageWidth - (margin * 2)) / 2 - 3, 38, 2, 2, 'FD');
  doc.roundedRect(margin + (pageWidth - (margin * 2)) / 2 + 3, currentY, (pageWidth - (margin * 2)) / 2 - 3, 38, 2, 2, 'FD');

  // Left Box: Cliente
  doc.setTextColor(...primaryNavy);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('DATOS DEL CLIENTE', margin + 4, currentY + 7);

  doc.setTextColor(...textDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(quote.client.companyName, margin + 4, currentY + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...textGray);
  doc.text(`Identificación / Tax ID: ${quote.client.taxId || 'N/A'}`, margin + 4, currentY + 20);
  doc.text(`Atención a: ${quote.client.contactName} (${quote.client.contactRole || 'Contacto'})`, margin + 4, currentY + 26);
  doc.text(`Email: ${quote.client.contactEmail} | Tel: ${quote.client.contactPhone || 'N/A'}`, margin + 4, currentY + 32);

  // Right Box: Cotización & Fechas
  const rightBoxX = margin + (pageWidth - (margin * 2)) / 2 + 7;
  doc.setTextColor(...primaryNavy);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('CONDICIONES DE LA OFERTA', rightBoxX, currentY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...textGray);
  doc.text(`Fecha de Emisión: ${quote.createdAt}`, rightBoxX, currentY + 14);
  doc.text(`Válida hasta: ${quote.validUntil}`, rightBoxX, currentY + 20);
  doc.text(`Moneda de la Propuesta: ${quote.currency} (${quote.currencySymbol})`, rightBoxX, currentY + 26);
  doc.text(`Garantía Hipercare Post Go-Live: ${quote.guaranteeHypercareDays} días incluidos`, rightBoxX, currentY + 32);

  currentY += 44;

  // Project Scope Section
  doc.setTextColor(...primaryNavy);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('1. ALCANCE Y OBJETIVOS DEL PROYECTO SAP', margin, currentY);

  currentY += 4;
  doc.setTextColor(...textDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(quote.project.projectTitle, margin, currentY + 2);

  currentY += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...textGray);
  const typeText = `Tipo de Servicio: ${quote.project.projectType}  |  Entorno: ${quote.project.sapSystemVersion}  |  Metodología: ${quote.project.methodology}  |  Duración estimada: ${quote.project.durationMonths} meses`;
  doc.text(typeText, margin, currentY);

  currentY += 6;
  doc.setTextColor(...textDark);
  const splitDescription = doc.splitTextToSize(quote.project.scopeDescription || quote.project.businessObjective || '', pageWidth - (margin * 2));
  doc.text(splitDescription, margin, currentY);
  currentY += (splitDescription.length * 4.2) + 6;

  // Section 2: Staffing Plan & Resources (SAP Modules)
  doc.setTextColor(...primaryNavy);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('2. EQUIPO CONSULTOR Y ASIGNACIÓN DE RECURSOS SAP', margin, currentY);
  currentY += 3;

  const resourceTableData = quote.resources.map(res => [
    res.moduleName.replace(/\(.*\)/, '').trim(),
    res.roleTitle,
    res.seniority,
    res.modality,
    `${res.hours} hrs`,
    formatCurrency(res.hourlyRate, quote.currency, quote.currencySymbol),
    formatCurrency(res.hours * res.hourlyRate, quote.currency, quote.currencySymbol)
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Módulo SAP', 'Rol / Especialidad', 'Seniority', 'Modalidad', 'Horas', 'Tarifa/Hr', 'Subtotal']],
    body: resourceTableData,
    theme: 'striped',
    headStyles: {
      fillColor: primaryNavy,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left'
    },
    bodyStyles: {
      textColor: textDark,
      fontSize: 7.5,
      cellPadding: 2.2
    },
    columnStyles: {
      0: { cellWidth: 32 },
      1: { cellWidth: 50 },
      2: { cellWidth: 26 },
      3: { cellWidth: 20 },
      4: { cellWidth: 16, halign: 'right' },
      5: { cellWidth: 20, halign: 'right' },
      6: { cellWidth: 24, halign: 'right', fontStyle: 'bold' }
    }
  });

  // @ts-expect-error autoTable adds lastAutoTable to doc
  currentY = doc.lastAutoTable.finalY + 8;

  // Check if we need page break
  if (currentY > pageHeight - 75) {
    doc.addPage();
    currentY = 20;
  }

  // Section 3: Milestones & Payment Schedule
  doc.setTextColor(...primaryNavy);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('3. HITOS, ENTREGABLES CLAVE Y PLAN DE FACTURACIÓN', margin, currentY);
  currentY += 3;

  const milestoneTableData = quote.milestones.map(m => [
    m.title,
    m.deliverables || m.description,
    m.estimatedWeek,
    `${m.paymentPercentage}%`
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Fase / Hito SAP', 'Entregables Principales Comprometidos', 'Plazo Estimado', '% Pago']],
    body: milestoneTableData,
    theme: 'striped',
    headStyles: {
      fillColor: primaryNavy,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8
    },
    bodyStyles: {
      textColor: textDark,
      fontSize: 7.5,
      cellPadding: 2.2
    },
    columnStyles: {
      0: { cellWidth: 52, fontStyle: 'bold' },
      1: { cellWidth: 88 },
      2: { cellWidth: 28 },
      3: { cellWidth: 20, halign: 'right', fontStyle: 'bold' }
    }
  });

  // @ts-expect-error autoTable adds lastAutoTable
  currentY = doc.lastAutoTable.finalY + 8;

  // Check for page break before Financial Summary & Signatures
  if (currentY > pageHeight - 85) {
    doc.addPage();
    currentY = 20;
  }

  // Section 4: Financial Summary & Commercial Terms
  doc.setTextColor(...primaryNavy);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('4. RESUMEN ECONÓMICO Y CONDICIONES COMERCIALES', margin, currentY);
  currentY += 5;

  const financialBoxWidth = 85;
  const financialBoxX = pageWidth - margin - financialBoxWidth;

  // Terms (Left)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...textDark);
  doc.text('Términos de Facturación y Pago:', margin, currentY + 2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...textGray);
  const paymentSplit = doc.splitTextToSize(quote.paymentTerms || 'Facturación contra hito formalmente aceptado (30 días).', financialBoxX - margin - 8);
  doc.text(paymentSplit, margin, currentY + 7);

  // Financial Table (Right)
  doc.setFillColor(...bgLight);
  doc.setDrawColor(203, 213, 225);
  doc.rect(financialBoxX, currentY - 2, financialBoxWidth, 38, 'FD');

  let rowY = currentY + 4;
  const renderFinRow = (label: string, value: string, isBold = false, isHighlight = false) => {
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(isHighlight ? 9.5 : 8);
    doc.setTextColor(isHighlight ? primaryNavy[0] : textDark[0], isHighlight ? primaryNavy[1] : textDark[1], isHighlight ? primaryNavy[2] : textDark[2]);
    doc.text(label, financialBoxX + 4, rowY);
    doc.text(value, financialBoxX + financialBoxWidth - 4, rowY, { align: 'right' });
    rowY += 6.5;
  };

  renderFinRow(`Total Horas Estimadas (${totals.totalHours} hrs):`, formatCurrency(totals.subtotalConsulting, quote.currency, quote.currencySymbol));
  if (totals.discountAmount > 0) {
    renderFinRow(`Descuento Comercial (${quote.discountPercentage}%):`, `- ${formatCurrency(totals.discountAmount, quote.currency, quote.currencySymbol)}`);
  }
  if (totals.taxAmount > 0) {
    renderFinRow(`Impuestos / IVA (${quote.taxRatePercentage}%):`, formatCurrency(totals.taxAmount, quote.currency, quote.currencySymbol));
  }
  doc.setDrawColor(203, 213, 225);
  doc.line(financialBoxX + 3, rowY - 2, financialBoxX + financialBoxWidth - 3, rowY - 2);
  renderFinRow('TOTAL GENERAL PROPUESTA:', formatCurrency(totals.totalAmount, quote.currency, quote.currencySymbol), true, true);

  currentY += 46;

  // Section 5: Signature Blocks
  if (currentY > pageHeight - 45) {
    doc.addPage();
    currentY = 25;
  }

  doc.setDrawColor(148, 163, 184);
  const signatureWidth = 72;
  const leftSigX = margin + 10;
  const rightSigX = pageWidth - margin - signatureWidth - 10;

  // Left Sig
  doc.line(leftSigX, currentY + 18, leftSigX + signatureWidth, currentY + 18);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...textDark);
  doc.text('POR LA CONSULTORA SAP', leftSigX + (signatureWidth / 2), currentY + 22, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...textGray);
  doc.text('Firma y Timbre Representante Legal', leftSigX + (signatureWidth / 2), currentY + 26, { align: 'center' });

  // Right Sig
  doc.line(rightSigX, currentY + 18, rightSigX + signatureWidth, currentY + 18);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...textDark);
  doc.text('ACEPTACIÓN Y ORDEN DE COMPRA CLIENTE', rightSigX + (signatureWidth / 2), currentY + 22, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...textGray);
  doc.text(`${quote.client.companyName} | RUT / Tax ID`, rightSigX + (signatureWidth / 2), currentY + 26, { align: 'center' });

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Documento emitido por SAP Proposal Hub | Cotización ${quote.code} v${quote.version} | Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  return doc;
}

export function downloadQuotationPDF(quote: Quotation): void {
  const doc = generateQuotationPDF(quote);
  const filename = `Cotizacion_SAP_${quote.code.replace(/[^a-zA-Z0-9-_]/g, '_')}_${quote.client.companyName.replace(/[^a-zA-Z0-9-_]/g, '_')}.pdf`;
  doc.save(filename);
}
