import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toJpeg } from 'html-to-image';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Quotation, CompanyProfile } from '../types';
import { calculateQuotationTotals, formatCurrency } from './calculations';
import { convertUfToClp } from '../services/bcentralService';
import { DossierEditorialView } from '../components/DossierEditorialView';

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
  const availableWidth = pageWidth - (margin * 2);
  let currentY = 16;

  // Primary Colors (SAP Navy & Slate)
  const primaryNavy: [number, number, number] = [15, 44, 89]; // #0F2C59
  const accentBlue: [number, number, number] = [0, 114, 206]; // SAP Blue #0072CE
  const textDark: [number, number, number] = [30, 41, 59]; // #1E293B
  const textGray: [number, number, number] = [100, 116, 139]; // #64748B
  const bgLight: [number, number, number] = [248, 250, 252]; // #F8FAFC

  // ==========================================
  // Header Banner
  // ==========================================
  doc.setFillColor(...primaryNavy);
  doc.rect(margin, currentY, availableWidth, 24, 'F');

  // Accent Line
  doc.setFillColor(...accentBlue);
  doc.rect(margin, currentY + 24, availableWidth, 2, 'F');

  // Title in Header
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('PROPUESTA TÉCNICO-COMERCIAL | CONSULTORÍA SAP', margin + 6, currentY + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('Soluciones Empresariales SAP & Servicios de Transformación Digital', margin + 6, currentY + 17);

  // Quote Code Badge in Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(quote.code, pageWidth - margin - 6, currentY + 10, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Versión ${quote.version} | Emisión: ${quote.createdAt}`, pageWidth - margin - 6, currentY + 17, { align: 'right' });

  currentY += 32;

  // ==========================================
  // Metadata Grid: Client & Offer Details
  // (Prevents horizontal and vertical overlap)
  // ==========================================
  const colGap = 6;
  const colWidth = (availableWidth - colGap) / 2; // ~87mm
  const innerPadX = 4.5;
  const innerPadY = 4.5;
  const innerTextWidth = colWidth - (innerPadX * 2); // ~78mm

  const leftBoxX = margin;
  const rightBoxX = margin + colWidth + colGap;

  // Prepare Left Box Items (Client Info)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  const clientCompanyLines: string[] = doc.splitTextToSize(quote.client.companyName || 'Empresa Cliente', innerTextWidth);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  const leftDetails: string[] = [];
  if (quote.client.taxId) {
    leftDetails.push(`RUT / Tax ID: ${quote.client.taxId}`);
  }
  if (quote.client.contactName) {
    leftDetails.push(`Atención: ${quote.client.contactName}`);
  }
  if (quote.client.contactRole) {
    leftDetails.push(`Cargo: ${quote.client.contactRole}`);
  }
  if (quote.client.contactEmail) {
    leftDetails.push(`Email: ${quote.client.contactEmail}`);
  }
  if (quote.client.contactPhone) {
    leftDetails.push(`Teléfono: ${quote.client.contactPhone}`);
  }
  if (quote.client.industry || quote.client.country) {
    leftDetails.push(`Sector: ${quote.client.industry} (${quote.client.country})`);
  }

  const leftProcessedDetails: string[][] = leftDetails.map(d => doc.splitTextToSize(d, innerTextWidth));
  let leftTotalLines = clientCompanyLines.length;
  leftProcessedDetails.forEach(lines => { leftTotalLines += lines.length; });
  const leftRequiredHeight = (innerPadY * 2) + 5 + (leftTotalLines * 3.7) + 3;

  // Prepare Right Box Items (Offer Conditions)
  const rightDetails: string[] = [
    `Fecha de Emisión: ${quote.createdAt}`,
    `Válida hasta: ${quote.validUntil}`,
    `Moneda: ${quote.currency} (${quote.currencySymbol})`,
    `Garantía Hipercare: ${quote.guaranteeHypercareDays} días post Go-Live`,
    `Tipo de Servicio: ${quote.project.projectType}`,
    `Metodología: ${quote.project.methodology}`
  ];
  const rightProcessedDetails: string[][] = rightDetails.map(d => doc.splitTextToSize(d, innerTextWidth));
  let rightTotalLines = 0;
  rightProcessedDetails.forEach(lines => { rightTotalLines += lines.length; });
  const rightRequiredHeight = (innerPadY * 2) + 5 + (rightTotalLines * 3.7) + 3;

  // Box height fits both sides dynamically without truncation or overflow
  const metadataBoxHeight = Math.max(leftRequiredHeight, rightRequiredHeight, 42);

  // Draw Box Backgrounds
  doc.setFillColor(...bgLight);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(leftBoxX, currentY, colWidth, metadataBoxHeight, 2, 2, 'FD');
  doc.roundedRect(rightBoxX, currentY, colWidth, metadataBoxHeight, 2, 2, 'FD');

  // Render Left Box Text
  let renderLeftY = currentY + innerPadY + 2;
  doc.setTextColor(...primaryNavy);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('DATOS DEL CLIENTE', leftBoxX + innerPadX, renderLeftY);
  renderLeftY += 4.5;

  doc.setTextColor(...textDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(clientCompanyLines, leftBoxX + innerPadX, renderLeftY);
  renderLeftY += (clientCompanyLines.length * 3.7) + 0.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...textGray);
  leftProcessedDetails.forEach(lines => {
    doc.text(lines, leftBoxX + innerPadX, renderLeftY);
    renderLeftY += (lines.length * 3.7);
  });

  // Render Right Box Text
  let renderRightY = currentY + innerPadY + 2;
  doc.setTextColor(...primaryNavy);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('CONDICIONES DE LA OFERTA', rightBoxX + innerPadX, renderRightY);
  renderRightY += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...textGray);
  rightProcessedDetails.forEach(lines => {
    doc.text(lines, rightBoxX + innerPadX, renderRightY);
    renderRightY += (lines.length * 3.7);
  });

  currentY += metadataBoxHeight + 7;

  // ==========================================
  // Section 1: Scope & Project Objectives
  // ==========================================
  doc.setTextColor(...primaryNavy);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('1. ALCANCE Y OBJETIVOS DEL PROYECTO SAP', margin, currentY);
  currentY += 4.5;

  doc.setTextColor(...textDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  const projTitleLines: string[] = doc.splitTextToSize(quote.project.projectTitle || 'Servicios Profesionales SAP', availableWidth);
  doc.text(projTitleLines, margin, currentY);
  currentY += (projTitleLines.length * 4) + 1.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...textGray);
  const typeText = `Tipo de Servicio: ${quote.project.projectType}  |  Entorno: ${quote.project.sapSystemVersion}  |  Metodología: ${quote.project.methodology}  |  Duración estimada: ${quote.project.durationMonths} meses`;
  const typeLines: string[] = doc.splitTextToSize(typeText, availableWidth);
  doc.text(typeLines, margin, currentY);
  currentY += (typeLines.length * 3.7) + 2;

  doc.setTextColor(...textDark);
  const descText = quote.project.scopeDescription || quote.project.businessObjective || '';
  if (descText) {
    const splitDescription: string[] = doc.splitTextToSize(descText, availableWidth);
    doc.text(splitDescription, margin, currentY);
    currentY += (splitDescription.length * 3.8) + 5;
  }

  // ==========================================
  // Section 2: Staffing Plan & Resources (SAP Modules)
  // ==========================================
  if (currentY > pageHeight - 55) {
    doc.addPage();
    currentY = 20;
  }

  doc.setTextColor(...primaryNavy);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
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
      cellPadding: 2
    },
    columnStyles: {
      0: { cellWidth: 32 },
      1: { cellWidth: 48 },
      2: { cellWidth: 24 },
      3: { cellWidth: 20 },
      4: { cellWidth: 16, halign: 'right' },
      5: { cellWidth: 18, halign: 'right' },
      6: { cellWidth: 22, halign: 'right', fontStyle: 'bold' }
    }
  });

  // @ts-expect-error autoTable adds lastAutoTable to doc
  currentY = doc.lastAutoTable.finalY + 7;

  // ==========================================
  // Section 3: Milestones & Payment Schedule
  // ==========================================
  if (currentY > pageHeight - 55) {
    doc.addPage();
    currentY = 20;
  }

  doc.setTextColor(...primaryNavy);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
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
      cellPadding: 2
    },
    columnStyles: {
      0: { cellWidth: 46, fontStyle: 'bold' },
      1: { cellWidth: 86 },
      2: { cellWidth: 26 },
      3: { cellWidth: 22, halign: 'right', fontStyle: 'bold' }
    }
  });

  // @ts-expect-error autoTable adds lastAutoTable
  currentY = doc.lastAutoTable.finalY + 7;

  // 3.1 Cronograma Ejecutivo de Fases Gantt SAP
  if (quote.ganttPlan && quote.ganttPlan.stages && quote.ganttPlan.stages.length > 0) {
    if (currentY > pageHeight - 50) {
      doc.addPage();
      currentY = 20;
    }
    doc.setTextColor(...primaryNavy);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text('3.1 CRONOGRAMA EJECUTIVO DE FASES SAP (CARTA GANTT)', margin, currentY);
    currentY += 3;

    const ganttTableData = quote.ganttPlan.stages.map((stg, i) => [
      `#${i + 1} ${stg.name}${stg.isMilestone ? ' ★ [Hito Crítico]' : ''}`,
      `${stg.duration} ${stg.durationUnit === 'weeks' ? 'semanas' : 'días hábiles'}`,
      stg.startType === 'sequential' ? 'Consecutivo (Auto)' : stg.startType === 'custom_date' ? 'Fecha fija' : 'Desfase',
      stg.responsible || 'Equipo Consultor SAP'
    ]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Fase / Actividad Gantt', 'Duración Estimada', 'Modalidad Inicio', 'Responsable']],
      body: ganttTableData,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 58, 138],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5
      },
      bodyStyles: {
        textColor: textDark,
        fontSize: 7,
        cellPadding: 2
      },
      columnStyles: {
        0: { cellWidth: 70, fontStyle: 'bold' },
        1: { cellWidth: 35 },
        2: { cellWidth: 35 },
        3: { cellWidth: 40 }
      }
    });

    // @ts-expect-error autoTable adds lastAutoTable
    currentY = doc.lastAutoTable.finalY + 7;
  }

  // ==========================================
  // Section 4: Financial Summary & Commercial Terms
  // ==========================================
  if (currentY > pageHeight - 80) {
    doc.addPage();
    currentY = 20;
  }

  doc.setTextColor(...primaryNavy);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('4. RESUMEN ECONÓMICO Y CONDICIONES COMERCIALES', margin, currentY);
  currentY += 4.5;

  const financialBoxWidth = 85;
  const financialBoxX = pageWidth - margin - financialBoxWidth;
  const termsBoxWidth = financialBoxX - margin - 8;

  // Left side: Payment Terms
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...textDark);
  doc.text('Términos de Facturación y Pago:', margin, currentY + 2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...textGray);
  const paymentSplit: string[] = doc.splitTextToSize(quote.paymentTerms || 'Facturación contra hito formalmente aceptado (30 días).', termsBoxWidth);
  doc.text(paymentSplit, margin, currentY + 6.5);
  let termsHeight = 7 + (paymentSplit.length * 3.7);

  if (quote.expensesAmount && quote.expensesAmount > 0) {
    const expText: string[] = doc.splitTextToSize(`Gastos de Traslado / Viáticos: ${formatCurrency(quote.expensesAmount, quote.currency, quote.currencySymbol)} (adicionales)`, termsBoxWidth);
    doc.text(expText, margin, currentY + termsHeight + 1);
    termsHeight += (expText.length * 3.7) + 2;
  }

  // Right side: Financial Table Card
  const quoteExpenses = Number(quote.expensesAmount) || 0;
  let finRowsCount = 2; // base: subtotal + total
  if (totals.discountAmount > 0) finRowsCount++;
  if (totals.taxAmount > 0) finRowsCount++;
  if (quoteExpenses > 0) finRowsCount++;
  const financialBoxHeight = (finRowsCount * 6.2) + 10;

  doc.setFillColor(...bgLight);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(financialBoxX, currentY - 2, financialBoxWidth, financialBoxHeight, 2, 2, 'FD');

  let rowY = currentY + 3.5;
  const renderFinRow = (label: string, value: string, isBold = false, isHighlight = false) => {
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(isHighlight ? 9.5 : 7.5);
    doc.setTextColor(isHighlight ? primaryNavy[0] : textDark[0], isHighlight ? primaryNavy[1] : textDark[1], isHighlight ? primaryNavy[2] : textDark[2]);
    doc.text(label, financialBoxX + 4, rowY);
    doc.text(value, financialBoxX + financialBoxWidth - 4, rowY, { align: 'right' });
    rowY += 6;
  };

  renderFinRow(`Total Horas (${totals.totalHours} hrs):`, formatCurrency(totals.subtotalConsulting, quote.currency, quote.currencySymbol));
  if (totals.discountAmount > 0) {
    renderFinRow(`Descuento Comercial (${quote.discountPercentage}%):`, `- ${formatCurrency(totals.discountAmount, quote.currency, quote.currencySymbol)}`);
  }
  if (quoteExpenses > 0) {
    renderFinRow(`Gastos / Viáticos:`, formatCurrency(quoteExpenses, quote.currency, quote.currencySymbol));
  }
  if (totals.taxAmount > 0) {
    renderFinRow(`Impuestos / IVA (${quote.taxRatePercentage}%):`, formatCurrency(totals.taxAmount, quote.currency, quote.currencySymbol));
  }
  doc.setDrawColor(203, 213, 225);
  doc.line(financialBoxX + 3, rowY - 1.5, financialBoxX + financialBoxWidth - 3, rowY - 1.5);
  rowY += 1;
  renderFinRow('TOTAL GENERAL:', formatCurrency(totals.totalAmount, quote.currency, quote.currencySymbol), true, true);
  if (quote.currency === 'UF') {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    const estClp = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 }).format(convertUfToClp(totals.totalAmount));
    doc.text(`* Ref. Banco Central: ~ $ ${estClp} CLP`, financialBoxX + financialBoxWidth - 4, rowY + 1, { align: 'right' });
  }

  currentY += Math.max(financialBoxHeight, termsHeight) + 8;

  // ==========================================
  // Section 5: Signature Blocks
  // ==========================================
  if (currentY > pageHeight - 42) {
    doc.addPage();
    currentY = 22;
  }

  doc.setDrawColor(148, 163, 184);
  const signatureWidth = 72;
  const leftSigX = margin + 8;
  const rightSigX = pageWidth - margin - signatureWidth - 8;

  // Left Signature
  doc.line(leftSigX, currentY + 14, leftSigX + signatureWidth, currentY + 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...textDark);
  doc.text('POR LA CONSULTORA SAP', leftSigX + (signatureWidth / 2), currentY + 18, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...textGray);
  doc.text('Firma y Timbre Representante Legal', leftSigX + (signatureWidth / 2), currentY + 22, { align: 'center' });

  // Right Signature
  doc.line(rightSigX, currentY + 14, rightSigX + signatureWidth, currentY + 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...textDark);
  doc.text('ACEPTACIÓN Y ORDEN DE COMPRA CLIENTE', rightSigX + (signatureWidth / 2), currentY + 18, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...textGray);
  const clientSigText: string[] = doc.splitTextToSize(`${quote.client.companyName} | ${quote.client.taxId || 'RUT/Tax ID'}`, signatureWidth);
  doc.text(clientSigText, rightSigX + (signatureWidth / 2), currentY + 22, { align: 'center' });

  // ==========================================
  // Footer on all pages
  // ==========================================
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
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

/**
 * Downloads the quotation in the full executive "Dossier Editorial" format (Bridev style),
 * capturing all 7 editorial pages in high-resolution A4 format.
 */
export async function downloadDossierPDF(
  quote: Quotation,
  companyProfile?: CompanyProfile,
  onProgress?: (status: string, percent: number) => void
): Promise<void> {
  let stagingContainer: HTMLDivElement | null = null;
  let root: ReturnType<typeof createRoot> | null = null;

  try {
    // 1. Check if there are already dossier pages in the document (e.g. in QuotationPrintView)
    let pageElements = Array.from(document.querySelectorAll<HTMLElement>('.dossier-page'));

    // 2. If no dossier pages found in current view, mount DossierEditorialView in a hidden staging container
    if (pageElements.length < 7) {
      if (onProgress) onProgress('Preparando páginas del Dossier...', 5);
      stagingContainer = document.createElement('div');
      stagingContainer.id = 'dossier-pdf-staging-mount';
      stagingContainer.style.position = 'fixed';
      stagingContainer.style.left = '-10000px';
      stagingContainer.style.top = '0';
      stagingContainer.style.width = '1024px';
      stagingContainer.style.zIndex = '-9999';
      stagingContainer.style.backgroundColor = '#020617';
      document.body.appendChild(stagingContainer);

      root = createRoot(stagingContainer);
      root.render(
        React.createElement(DossierEditorialView, {
          quote,
          companyProfile,
          isPrintStaging: true
        })
      );

      // Allow DOM to settle and images to begin decoding
      await new Promise((resolve) => setTimeout(resolve, 400));
      pageElements = Array.from(stagingContainer.querySelectorAll<HTMLElement>('.dossier-page'));
    }

    if (pageElements.length === 0) {
      throw new Error('No se encontraron páginas del dossier para generar el PDF');
    }

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const total = pageElements.length;
    for (let i = 0; i < total; i++) {
      const page = pageElements[i];
      if (onProgress) {
        onProgress(`Capturando página ${i + 1} de ${total}...`, Math.round(((i) / total) * 90));
      }

      const isDark = page.classList.contains('dossier-page-cover') ||
                     page.classList.contains('dossier-page-backcover') ||
                     page.getAttribute('data-theme') === 'dark';

      const imgData = await toJpeg(page, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: isDark ? '#020617' : '#ffffff',
        skipFonts: true,
        cacheBust: false,
        imagePlaceholder: 'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"/>'
      });

      if (i > 0) {
        pdf.addPage('a4', 'portrait');
      }

      // Add to PDF covering 210mm x 297mm exactly
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
    }

    if (onProgress) {
      onProgress('Descargando archivo PDF...', 98);
    }

    const safeCode = (quote.code || 'COT').replace(/[^a-zA-Z0-9-_]/g, '_');
    const safeClient = (quote.client?.fantasyName || quote.client?.companyName || 'Cliente').replace(/[^a-zA-Z0-9-_]/g, '_');
    const filename = `Cotizacion_${safeCode}_Dossier_Editorial_${safeClient}.pdf`;
    
    pdf.save(filename);

    if (onProgress) {
      onProgress('¡Completado!', 100);
    }
  } catch (error) {
    console.error('Error generating Dossier Editorial PDF, falling back to summary PDF:', error);
    // Fallback gracefully so user always gets a valid PDF
    const fallbackDoc = generateQuotationPDF(quote);
    const safeCode = (quote.code || 'COT').replace(/[^a-zA-Z0-9-_]/g, '_');
    fallbackDoc.save(`Cotizacion_${safeCode}_Resumen.pdf`);
  } finally {
    // Cleanup staging mount if it was used
    if (root && stagingContainer) {
      try {
        root.unmount();
      } catch (e) {
        // ignore unmount errors
      }
      if (stagingContainer.parentNode) {
        stagingContainer.parentNode.removeChild(stagingContainer);
      }
    }
  }
}

/**
 * Main PDF download function used throughout the application.
 * Generates the full 7-page Dossier Editorial format.
 */
export function downloadQuotationPDF(quote: Quotation, companyProfile?: CompanyProfile): void {
  downloadDossierPDF(quote, companyProfile);
}

/**
 * Optional 1-page compact summary technical sheet generator.
 */
export function downloadCompactSummaryPDF(quote: Quotation): void {
  const doc = generateQuotationPDF(quote);
  const filename = `Cotizacion_SAP_${quote.code.replace(/[^a-zA-Z0-9-_]/g, '_')}_Resumen.pdf`;
  doc.save(filename);
}
