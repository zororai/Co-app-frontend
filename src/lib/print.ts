export function printElementById(id: string, title = 'Print'): void {
  try {
    const node = document.getElementById(id);
    if (!node) return;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';

    document.body.append(iframe);
    const frameDoc = iframe.contentWindow?.document;
    if (!frameDoc) return;

    frameDoc.open();
    frameDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${title}</title>
          <style>
            @media print {
              body { font-family: Arial, sans-serif; margin: 20px; }
              .print-section { margin-bottom: 20px; padding: 15px; }
              .print-heading { color: #15073d; font-weight: bold; margin-bottom: 10px; }
              .print-item { margin-bottom: 8px; }
              .print-label { font-weight: bold; }
              h1 { color: #FF8F00; font-size: 18px; margin-bottom: 20px; }
              .section { border: 1px solid #000080; padding: 15px; margin-bottom: 15px; border-radius: 8px; }
              .section-title { color: #FF8F00; font-weight: bold; margin-bottom: 10px; }
              .detail-item { margin-bottom: 8px; }
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <div class="print-container">${node.innerHTML}</div>
        </body>
      </html>
    `);
    frameDoc.close();

    iframe.addEventListener('load', () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          iframe.remove();
        }, 500);
      } catch {
        iframe.remove();
      }
    });
  } catch {
    // no-op
  }
}
