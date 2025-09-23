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
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            
            @media print {
              @page {
                size: A4;
                margin: 1cm;
              }
              
              body { 
                font-family: 'Inter', Arial, sans-serif; 
                margin: 0;
                padding: 20px;
                color: #333;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              
              .MuiBox-root {
                box-sizing: border-box;
              }
              
              .MuiTypography-root {
                margin: 0;
              }
              
              .MuiTypography-subtitle2 {
                font-size: 0.875rem;
                font-weight: 600;
                line-height: 1.5;
              }
              
              .MuiChip-root {
                height: 24px;
                border-radius: 16px;
                font-size: 0.75rem;
                font-weight: 500;
                margin: 2px;
              }
              
              #user-details-printable {
                width: 100%;
                max-width: 100%;
              }
              
              .MuiGrid-container {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 16px;
                width: 100%;
              }
              
              [style*="border: 1px solid #000080"] {
                border: 1px solid #000080 !important;
                border-radius: 8px !important;
                padding: 16px !important;
                margin-bottom: 16px !important;
                break-inside: avoid;
              }
              
              [style*="color: #FF8F00"] {
                color: #FF8F00 !important;
                font-weight: 600 !important;
                margin-bottom: 16px !important;
                display: block;
              }
              
              [style*="display: flex"] {
                display: flex !important;
                flex-wrap: wrap;
                gap: 8px;
              }
              
              [style*="display: grid"] {
                display: grid !important;
              }
              
              .print-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 1px solid #e0e0e0;
              }
              
              .print-title {
                color: #15073d;
                font-size: 1.5rem;
                font-weight: 700;
                margin: 0;
              }
              
              .print-date {
                color: #666;
                font-size: 0.875rem;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1 class="print-title">${title}</h1>
            <div class="print-date">${new Date().toLocaleDateString()}</div>
          </div>
          <div id="user-details-printable">${node.innerHTML}</div>
          <script>
            // Force print styles to be applied
            document.addEventListener('DOMContentLoaded', function() {
              // Add any dynamic content or formatting here if needed
            });
          </script>
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
