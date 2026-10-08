import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const W = 595, H = 842;

export const generateCertificatePDF = async ({ template, certificateData }) => {
  try {
    if (!template || !certificateData) throw new Error('Missing template or certificateData');

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([W, H]);

    let f, bf;
    try {
      f = await pdfDoc.embedFont(StandardFonts.Helvetica);
      bf = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    } catch (e) { throw new Error(`Font error: ${e.message}`); }

    const navy = rgb(0.05, 0.11, 0.16);
    const green = rgb(0.46, 0.83, 0.17);
    const dark = rgb(0.15, 0.15, 0.15);
    const mid = rgb(0.4, 0.4, 0.4);
    const light = rgb(0.65, 0.65, 0.65);
    const white = rgb(1, 1, 1);
    const cx = W / 2;

    // Background
    if (template.image) {
      const ip = path.join(process.cwd(), template.image);
      if (fs.existsSync(ip)) {
        try {
          const bytes = fs.readFileSync(ip);
          const ext = path.extname(ip).toLowerCase();
          const img = ext === '.png' ? await pdfDoc.embedPng(bytes) : await pdfDoc.embedJpg(bytes);
          page.drawImage(img, { x: 0, y: 0, width: W, height: H });
        } catch (e) {}
      }
    }

    // Professional double border
    page.drawRectangle({ x: 30, y: 30, width: W - 60, height: H - 60, borderColor: navy, borderWidth: 2.5 });
    page.drawRectangle({ x: 36, y: 36, width: W - 72, height: H - 72, borderColor: green, borderWidth: 0.6 });

    // Corner accents
    const corners = [
      [36, 78, 36, 54],
      [W - 36, 78, W - 36, 54],
      [36, H - 78, 36, H - 54],
      [W - 36, H - 78, W - 36, H - 54],
    ];
    for (const [x1, y1, x2, y2] of corners) {
      page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness: 1.5, color: green });
    }

    // Helper
    const cX = (text, size) => cx - (text.length * size * 0.3);

    // ---- TOP SECTION ----
    page.drawText('HAPPY LIFE ASTRO', { x: cX('HAPPY LIFE ASTRO', 18), y: 760, size: 18, color: navy, font: bf });
    page.drawLine({ start: { x: cx - 50, y: 750 }, end: { x: cx + 50, y: 750 }, thickness: 0.5, color: green });

    // ---- CERTIFICATE TITLE ----
    page.drawText('Certificate of Completion', { x: cX('Certificate of Completion', 22), y: 700, size: 22, color: navy, font: bf });

    // ---- AWARDED TO ----
    page.drawText('This certificate is proudly awarded to', { x: cX('This certificate is proudly awarded to', 12), y: 640, size: 12, color: mid, font: f });

    // ---- STUDENT NAME ----
    const nm = certificateData.student_name || '';
    page.drawText(nm, { x: cX(nm, 36), y: 575, size: 36, color: navy, font: bf });
    page.drawLine({ start: { x: cx - 80, y: 565 }, end: { x: cx + 80, y: 565 }, thickness: 1, color: green });

    // ---- EXTRA LINES ----
    if (certificateData.extra_lines) {
      let ey = 540;
      for (const line of certificateData.extra_lines) {
        if (!line) { ey -= 5; continue; }
        page.drawText(line, { x: cX(line, 11), y: ey, size: 11, color: mid, font: f });
        ey -= 19;
      }
    }

    // ---- COURSE NAME ----
    const cn = certificateData.course_name || '';
    if (cn) page.drawText(cn, { x: cX(cn, 13), y: 380, size: 13, color: navy, font: bf });

    // ---- DATE ----
    if (certificateData.completion_date) {
      const d = certificateData.completion_date instanceof Date ? certificateData.completion_date : new Date(certificateData.completion_date);
      const ds = !isNaN(d.getTime()) ? d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : String(certificateData.completion_date);
      page.drawText(ds, { x: cX(ds, 10), y: 350, size: 10, color: light, font: f });
    }

    // ---- SIGNATURES ----
    page.drawLine({ start: { x: 70, y: 270 }, end: { x: 230, y: 270 }, thickness: 0.6, color: navy });
    const sn = certificateData.instructor_name || '';
    page.drawText(sn, { x: cX(sn, 10) + 25, y: 256, size: 10, color: navy, font: bf });
    page.drawText('Instructor', { x: cX('Instructor', 9) + 25, y: 243, size: 9, color: light, font: f });

    page.drawLine({ start: { x: 365, y: 270 }, end: { x: 525, y: 270 }, thickness: 0.6, color: navy });
    const pn = certificateData.platform_name || '';
    page.drawText(pn, { x: cX(pn, 10) + 325, y: 256, size: 10, color: navy, font: bf });
    page.drawText('Platform', { x: cX('Platform', 9) + 325, y: 243, size: 9, color: light, font: f });

    // ---- FOOTER ----
    page.drawLine({ start: { x: cx - 80, y: 160 }, end: { x: cx + 80, y: 160 }, thickness: 0.4, color: green });

    const vTxt = 'Verify at happylifeastro.school';
    page.drawText(vTxt, { x: cX(vTxt, 7), y: 145, size: 7, color: light, font: f });

    const vn = certificateData.serial_number || '';
    if (vn) {
      const sv = `#${vn}`;
      page.drawText(sv, { x: cX(sv, 7), y: 132, size: 7, color: light, font: f });
    }

    const bytes = await pdfDoc.save();
    const fn = `certificate-${Date.now()}.pdf`;
    const fp = `uploads/${fn}`;
    const dir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(process.cwd(), fp), bytes);
    return fp;
  } catch (error) {
    console.error('Certificate Error:', error);
    throw new Error(`Certificate generation failed: ${error.message}`);
  }
};
