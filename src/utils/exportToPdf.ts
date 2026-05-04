import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Exports the given DOM element as a PDF with a "Campus Care | [title]" header.
 * @param elementId  ID of the DOM element to capture
 * @param reportName Name of the report (used in the header and filename)
 */
export async function exportToPdf(elementId: string, reportName: string): Promise<void> {
  const el = document.getElementById(elementId);
  if (!el) return;

  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: 'a4' });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // ── Title header ────────────────────────────────────────────────
  const headerText = `Campus Care | ${reportName}`;
  const headerHeight = 28;
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, pageWidth, headerHeight, 'F');
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(30, 30, 30);
  pdf.text(headerText, 16, 18);

  // ── Content image (below header) ────────────────────────────────
  const contentTop = headerHeight + 4;
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let y = 0;
  let remaining = imgHeight;
  let pageNum = 0;

  while (remaining > 0) {
    const availableHeight = pageHeight - (pageNum === 0 ? contentTop : 0);
    const top = pageNum === 0 ? contentTop : 0;
    pdf.addImage(imgData, 'PNG', 0, top - y, imgWidth, imgHeight);
    remaining -= availableHeight;
    y += availableHeight;
    if (remaining > 0) {
      pdf.addPage();
      pageNum++;
    }
  }

  const filename = `Campus Care | ${reportName}.pdf`;
  pdf.save(filename);
}

