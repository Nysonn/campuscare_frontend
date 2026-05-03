import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportToPdf(elementId: string, filename: string): Promise<void> {
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
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let y = 0;
  let remaining = imgHeight;

  while (remaining > 0) {
    pdf.addImage(imgData, 'PNG', 0, -y, imgWidth, imgHeight);
    remaining -= pageHeight;
    y += pageHeight;
    if (remaining > 0) pdf.addPage();
  }

  pdf.save(filename);
}
