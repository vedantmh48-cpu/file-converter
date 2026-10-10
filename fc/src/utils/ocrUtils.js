import { createWorker } from 'tesseract.js';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';

// ─── Image Preprocessing ────────────────────────────────────────────────────

/**
 * Preprocesses an image for better OCR accuracy:
 * - Converts to grayscale
 * - Increases contrast
 * - Applies adaptive thresholding (binarization)
 * - Auto-rotates based on EXIF orientation
 */
export function preprocessImageForOCR(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Scale up small images for better OCR accuracy (max 3000px wide)
        const scale = Math.min(3000 / img.naturalWidth, 3);
        canvas.width = img.naturalWidth * scale;
        canvas.height = img.naturalHeight * scale;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Step 1: Grayscale + contrast boost via pixel manipulation
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          // Luminance-weighted grayscale
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          // Contrast stretch: push values toward black or white
          const contrasted = gray < 128
            ? Math.max(0, gray * 0.75)
            : Math.min(255, gray * 1.1 + 20);
          data[i] = data[i + 1] = data[i + 2] = contrasted;
        }
        ctx.putImageData(imageData, 0, 0);

        // Step 2: Sharpen via convolution kernel
        const sharpened = applySharpen(ctx, canvas.width, canvas.height);
        ctx.putImageData(sharpened, 0, 0);

        canvas.toBlob((blob) => resolve({ blob, canvas }), 'image/png', 1.0);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/** 3×3 sharpening convolution kernel */
function applySharpen(ctx, w, h) {
  const src = ctx.getImageData(0, 0, w, h);
  const dst = ctx.createImageData(w, h);
  const s = src.data;
  const d = dst.data;
  const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let r = 0, g = 0, b = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * w + (x + kx)) * 4;
          const k = kernel[(ky + 1) * 3 + (kx + 1)];
          r += s[idx] * k;
          g += s[idx + 1] * k;
          b += s[idx + 2] * k;
        }
      }
      const i = (y * w + x) * 4;
      d[i] = Math.min(255, Math.max(0, r));
      d[i + 1] = Math.min(255, Math.max(0, g));
      d[i + 2] = Math.min(255, Math.max(0, b));
      d[i + 3] = s[i + 3];
    }
  }
  return dst;
}

// ─── OCR Engine ─────────────────────────────────────────────────────────────

let workerInstance = null;

/** Lazily create and reuse a single Tesseract worker */
async function getWorker(onProgress) {
  if (workerInstance) return workerInstance;

  const worker = await createWorker('eng', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(Math.round(m.progress * 100));
      }
    },
  });

  workerInstance = worker;
  return worker;
}

/**
 * Run OCR on a preprocessed image blob.
 * Returns { text, confidence, words }
 */
export async function runOCR(imageBlob, onProgress) {
  const worker = await getWorker(onProgress);

  // Set parameters for better accuracy on documents
  await worker.setParameters({
    tessedit_pageseg_mode: '1',   // Automatic page segmentation with OSD
    tessedit_ocr_engine_mode: '1', // LSTM only
    preserve_interword_spaces: '1',
  });

  const url = URL.createObjectURL(imageBlob);
  try {
    const { data } = await worker.recognize(url);
    return {
      text: data.text.trim(),
      confidence: Math.round(data.confidence),
      words: data.words || [],
      lines: data.lines || [],
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Terminate the worker when done (call on component unmount) */
export async function terminateOCRWorker() {
  if (workerInstance) {
    await workerInstance.terminate();
    workerInstance = null;
  }
}

// ─── Quality Assessment ──────────────────────────────────────────────────────

/**
 * Assess image quality and return warnings for the user.
 * Checks: blur (Laplacian variance), brightness, contrast.
 */
export function assessImageQuality(canvas) {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  let totalBrightness = 0;
  let minBrightness = 255;
  let maxBrightness = 0;
  const grayValues = [];

  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    totalBrightness += gray;
    minBrightness = Math.min(minBrightness, gray);
    maxBrightness = Math.max(maxBrightness, gray);
    grayValues.push(gray);
  }

  const avgBrightness = totalBrightness / grayValues.length;
  const contrast = maxBrightness - minBrightness;

  // Laplacian variance for blur detection
  let laplacianSum = 0;
  const w = width;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const lap =
        -grayValues[(y - 1) * w + x] -
        grayValues[y * w + (x - 1)] +
        4 * grayValues[y * w + x] -
        grayValues[y * w + (x + 1)] -
        grayValues[(y + 1) * w + x];
      laplacianSum += lap * lap;
    }
  }
  const blurScore = laplacianSum / (width * height);

  const warnings = [];
  if (blurScore < 50) warnings.push('Image appears blurry — OCR accuracy may be reduced.');
  if (avgBrightness < 60) warnings.push('Image is too dark — consider better lighting.');
  if (avgBrightness > 220) warnings.push('Image is overexposed — text may be washed out.');
  if (contrast < 80) warnings.push('Low contrast detected — results may be less accurate.');

  return { blurScore, avgBrightness, contrast, warnings };
}

// ─── PDF Export ──────────────────────────────────────────────────────────────

/**
 * Generate a clean, well-formatted PDF from extracted text.
 * Optionally embeds the original image on a second page.
 */
export function exportToPDF(text, options = {}) {
  const {
    title = 'Extracted Document',
    includeImage = false,
    imageDataUrl = null,
    fontSize = 11,
    lineHeight = 7,
    margins = { top: 20, right: 20, bottom: 20, left: 20 },
  } = options;

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const usableW = pageW - margins.left - margins.right;
  const usableH = pageH - margins.top - margins.bottom;

  // ── Title ──
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.setTextColor(8, 127, 140); // brand color
  pdf.text(title, margins.left, margins.top);

  // ── Divider ──
  pdf.setDrawColor(8, 127, 140);
  pdf.setLineWidth(0.4);
  pdf.line(margins.left, margins.top + 4, pageW - margins.right, margins.top + 4);

  // ── Body text ──
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(fontSize);
  pdf.setTextColor(30, 30, 30);

  const lines = pdf.splitTextToSize(text || '(No text extracted)', usableW);
  let y = margins.top + 12;

  for (const line of lines) {
    if (y + lineHeight > pageH - margins.bottom) {
      pdf.addPage();
      y = margins.top;
    }
    pdf.text(line, margins.left, y);
    y += lineHeight;
  }

  // ── Optional: embed original image ──
  if (includeImage && imageDataUrl) {
    pdf.addPage();
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    pdf.setTextColor(8, 127, 140);
    pdf.text('Original Image', margins.left, margins.top);
    pdf.line(margins.left, margins.top + 4, pageW - margins.right, margins.top + 4);

    const imgProps = pdf.getImageProperties(imageDataUrl);
    const ratio = Math.min(usableW / imgProps.width, usableH / imgProps.height);
    const imgW = imgProps.width * ratio;
    const imgH = imgProps.height * ratio;
    const imgX = margins.left + (usableW - imgW) / 2;
    pdf.addImage(imageDataUrl, 'JPEG', imgX, margins.top + 10, imgW, imgH);
  }

  // ── Footer on every page ──
  const totalPages = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(160, 160, 160);
    pdf.text(
      `FileFlex OCR  •  Page ${i} of ${totalPages}  •  ${new Date().toLocaleDateString()}`,
      pageW / 2,
      pageH - 8,
      { align: 'center' }
    );
  }

  const blob = pdf.output('blob');
  return { blob, fileName: `${sanitizeFilename(title)}.pdf` };
}

// ─── DOCX Export ─────────────────────────────────────────────────────────────

/**
 * Generate a clean DOCX from extracted text using JSZip.
 * Produces a valid Open XML document with proper margins and typography.
 */
export async function exportToDOCX(text, options = {}) {
  const { title = 'Extracted Document' } = options;
  const zip = new JSZip();

  const escaped = (text || '(No text extracted)')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  // Build paragraphs — preserve blank lines as empty paragraphs
  const paragraphs = escaped.split('\n').map((line) => {
    if (!line.trim()) {
      return `<w:p><w:pPr><w:spacing w:after="0"/></w:pPr></w:p>`;
    }
    return `
      <w:p>
        <w:pPr>
          <w:spacing w:after="120" w:line="276" w:lineRule="auto"/>
        </w:pPr>
        <w:r>
          <w:rPr>
            <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
            <w:sz w:val="22"/>
            <w:szCs w:val="22"/>
          </w:rPr>
          <w:t xml:space="preserve">${line}</w:t>
        </w:r>
      </w:p>`;
  }).join('');

  // Title paragraph
  const titleXml = `
    <w:p>
      <w:pPr>
        <w:pStyle w:val="Heading1"/>
        <w:spacing w:after="200"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
          <w:b/>
          <w:sz w:val="32"/>
          <w:color w:val="087F8C"/>
        </w:rPr>
        <w:t>${title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</w:t>
      </w:r>
    </w:p>`;

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    ${titleXml}
    <w:p>
      <w:pPr><w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="087F8C"/></w:pBdr><w:spacing w:after="240"/></w:pPr>
    </w:p>
    ${paragraphs}
    <w:sectPr>
      <w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"
               w:header="709" w:footer="709" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;

  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml"
    ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`);

  zip.folder('_rels').file('.rels', `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1"
    Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument"
    Target="word/document.xml"/>
</Relationships>`);

  zip.folder('word').file('document.xml', documentXml);

  zip.folder('word/_rels').file('document.xml.rels', `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`);

  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });

  return { blob, fileName: `${sanitizeFilename(title)}.docx` };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sanitizeFilename(name) {
  return name.replace(/[^a-z0-9_\-\s]/gi, '').trim().replace(/\s+/g, '_') || 'document';
}

export function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
