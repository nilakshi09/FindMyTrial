import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function downloadPageAsPDF(
  filename: string = 'findmytrial-summary.pdf'
): Promise<void> {
  // Find the main content element to capture
  const element = document.querySelector('main') as HTMLElement
    || document.body;

  // Temporarily hide no-print elements
  const noPrintElements = document.querySelectorAll('.no-print');
  noPrintElements.forEach(el => {
    (el as HTMLElement).style.display = 'none';
  });

  try {
    const canvas = await html2canvas(element, {
      scale: 2,                    // Higher resolution
      useCORS: true,               // Handle external images
      logging: false,
      backgroundColor: '#ffffff',
    } as any);

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasRatio = canvas.height / canvas.width;
    const imgHeight = pdfWidth * canvasRatio;

    // If content is taller than one page, add multiple pages
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(filename);
  } finally {
    // Restore hidden elements
    noPrintElements.forEach(el => {
      (el as HTMLElement).style.display = '';
    });
  }
}
