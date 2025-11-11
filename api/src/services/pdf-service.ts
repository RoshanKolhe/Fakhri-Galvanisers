import {injectable, BindingScope} from '@loopback/core';
import path from 'path';
import fs from 'fs';
import puppeteer from 'puppeteer';

@injectable({scope: BindingScope.SINGLETON})
export class PdfService {
  async generatePdfFromTemplate(
    template: string,
  ): Promise<string> {
    // 1️⃣ Read HTML template
    const htmlTemplate = template;

    // 3️⃣ Launch headless Chrome
    const browser = await puppeteer.launch({
      headless: true, // ✅ Fix: use boolean (not "new")
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(htmlTemplate, {waitUntil: 'networkidle0'});

    // 4️⃣ Generate PDF file in tmp folder
    const outputDir = path.resolve('./tmp');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    const pdfPath = path.join(outputDir, `quotation.pdf`);

    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: {top: '20px', bottom: '20px', left: '20px', right: '20px'},
    });

    await browser.close();

    return pdfPath;
  }
}
