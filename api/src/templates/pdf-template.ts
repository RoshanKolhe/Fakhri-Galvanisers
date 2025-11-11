import path from 'path';
import fs from 'fs';

export default function PdfTemplate(quotation: any) {
  // 🔹 Ensure logo path resolves correctly when Puppeteer loads it
  const logoPath = path.resolve(__dirname, '../../public/images/hylite_logo.png');
  const logoBase64 = fs.existsSync(logoPath)
    ? `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`
    : '';

  const template = `
<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        font-family: Roboto, sans-serif;
        font-size: 12px;
        line-height: 1.5;
        padding: 20px;
        color: #000;
      }
      h1, h3 {
        margin-bottom: 5px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
      }
      th, td {
        border: 1px solid #ccc;
        padding: 6px;
        text-align: left;
      }
      th {
        background-color: #f5f5f5;
      }
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 2px solid #000;
        padding-bottom: 10px;
        margin-bottom: 10px;
      }
      .company-info {
        flex: 1;
        padding-left: 15px;
      }
      .company-logo {
        width: 130px;
        height: auto;
      }
      ul {
        list-style-type: disc;
        padding-left: 20px;
      }
      .terms-section {
        margin-top: 20px;
      }
      .small {
        font-size: 11px;
        color: #333;
      }
    </style>
  </head>
  <body>
    <div>
      <!-- Company Header with Logo -->
      <div class="header">
        <img src="${logoBase64}" alt="Company Logo" class="company-logo"/>
        <div class="company-info">
          <h1>HYLITE GALVANIZERS INDIA PRIVATE LIMITED</h1>
          <p class="small">
            M37, MIDC, Taloja Navi Mumbai, Dist- Raigarh, Maharashtra - 410208.<br/>
            Tel: +91 8600259300 / 9820226331<br/>
            Email: taloja@hylite.co.in<br/>
            Website: www.hylite.co.in<br/>
            GST No: 27AABCH8499L1ZS
          </p>
        </div>
      </div>

      <!-- Quotation Details -->
      <p>
        <strong> RFQ- ${quotation?.id || '-'}</strong><br/>
        <strong> ${new Date(quotation?.createdAt || new Date()).toLocaleDateString()}</strong>
      </p>
<strong>
      <p>
        ${quotation?.customer?.firstName || ''} ${quotation?.customer?.lastName || ''}<br/>
        ${quotation?.customer?.fullAddress || ''}<br/>
        ${quotation?.customer?.phoneNumber || ''}
      </p>
<strong/>
      <h3>We thank you for your enquiry and are pleased to quote our lowest rates:</h3>

      <!-- Materials Table -->
      <table>
        <thead>
          <tr>
            <th>Sr</th>
            <th>Type</th>
            <th>Qty</th>
            <th>Cost[nos/kg]</th>
          </tr>
        </thead>
        <tbody>
          ${
            quotation?.materials?.length
              ? quotation.materials
                  .map(
                    (m: any, i: number) => `
            <tr>
              <td>${i + 1}</td>
              <td>${m.materialType}</td>
              <td>${m.quantity} ${m.billingUnit}</td>
              <td>${m.pricePerUnit}</td>
            </tr>
          `
                  )
                  .join('')
              : `<tr><td colspan="4">No materials listed</td></tr>`
          }
        </tbody>
      </table>

      <!-- Terms & Conditions -->
      <div class="terms-section">
        <h3>Terms & Conditions</h3>
        <ul>
          <li>This quotation is for Hot Dip Galvanising only.</li>
          <li>Packaging charges extra as per specifications.</li>
          <li>Taxes: 9% CGST + 9% SGST extra.</li>
          <li>If sandblasting is required, Rs. 6 per kg extra.</li>
          <li>Transportation: Ex-Taloja.</li>
          <li>Validity of Purchase Order (PO): 5 days.</li>
          <li>Raw material costing is based on current market rates.</li>
          <li>Rates valid only for the full order quantity.</li>
              <h3>Thank you for your inquiry, we await your PO for the same.</h3>
          <li>Prices are based on material weight after galvanizing (as per our weighbridge).</li>
          <li>Prices valid for 5 days and subject to zinc price fluctuation.</li>
          <li>All prices are Ex-Works (transportation to/from plant by customer).</li>
          <li>Raw Material Test Certificate (TC) must be provided for galvanizing.</li>
          <li>Invoices will be based on post-galvanizing weight.</li>
          <li>Materials should be free from paint, varnish, or tar. Sandblasting to be done before delivery.</li>
          <li>Customer must ensure proper vent holes/crops per ASTM/A-385.</li>
          <li>Thin materials may distort due to high-temperature galvanizing; Hylite not responsible for such distortion.</li>
          <li>Threaded materials to be re-tapped by the customer post-galvanizing.</li>
          <li>Galvanizing conforms to ASTM/A-123M-97a, ASTM/A-153, ASTM/A-767/767-M, or BS-729.</li>
          <li>QA inspection (if required) must be done at our works before dispatch.</li>
          <li>Drivers must carry authorization letters to collect galvanized material.</li>
          <li>Delivery timelines subject to force majeure events (e.g., breakdown, raw material shortage).</li>
          <li>Galvanized materials must be collected within 48 hours of intimation, else Rs. 500/MT/day ground charge applies.</li>
          <li>Working hours: 09:00 a.m. – 06:30 p.m. (Sunday Weekly Off)</li>
        </ul>
        <p>Thank you for your inquiry. We look forward to your Purchase Order.</p>
      </div>
    </div>
  </body>
</html>
`;

  return {
    subject: `${quotation?.subject || 'Quotation Details'}`,
    html: template,
  };
}
