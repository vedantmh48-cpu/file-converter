import { jsPDF } from 'jspdf';
import JSZip from 'jszip';

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileExtension(filename) {
  return filename.split('.').pop()?.toLowerCase() || '';
}

export function getBaseName(filename) {
  return filename.split('.').slice(0, -1).join('.') || filename;
}

export const SUPPORTED_IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif', 'svg', 'ico', 'tiff'];
export const SUPPORTED_DOC_FORMATS = ['pdf', 'txt', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'csv', 'rtf'];

export const FORMAT_OPTIONS = {
  image: {
    label: 'Image Formats',
    formats: [
      { value: 'jpg', label: 'JPG', mime: 'image/jpeg' },
      { value: 'png', label: 'PNG', mime: 'image/png' },
      { value: 'webp', label: 'WEBP', mime: 'image/webp' },
      { value: 'bmp', label: 'BMP', mime: 'image/bmp' },
      { value: 'tiff', label: 'TIFF', mime: 'image/tiff' },
      { value: 'ico', label: 'ICO', mime: 'image/x-icon' },
    ]
  },
  document: {
    label: 'Document Formats',
    formats: [
      { value: 'pdf', label: 'PDF', mime: 'application/pdf' },
      { value: 'txt', label: 'TXT', mime: 'text/plain' },
      { value: 'docx', label: 'DOCX', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
      { value: 'xlsx', label: 'XLSX', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
      { value: 'pptx', label: 'PPTX', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' },
      { value: 'csv', label: 'CSV', mime: 'text/csv' },
    ]
  }
};

export function detectConversionType(fromFormat, toFormat) {
  const from = fromFormat.toLowerCase();
  const to = toFormat.toLowerCase();

  if (SUPPORTED_IMAGE_FORMATS.includes(from) && SUPPORTED_IMAGE_FORMATS.includes(to)) return 'image-to-image';
  if (SUPPORTED_IMAGE_FORMATS.includes(from) && to === 'pdf') return 'image-to-pdf';
  if (from === 'pdf' && SUPPORTED_IMAGE_FORMATS.includes(to)) return 'pdf-to-image';
  if (from === 'txt' && to === 'pdf') return 'txt-to-pdf';
  if (from === 'pdf' && to === 'txt') return 'pdf-to-txt';
  if (['doc', 'docx', 'rtf'].includes(from) && to === 'pdf') return 'doc-to-pdf';
  if (from === 'pdf' && ['doc', 'docx'].includes(to)) return 'pdf-to-doc';
  if (['xls', 'xlsx', 'csv'].includes(from) && to === 'pdf') return 'excel-to-pdf';
  if (['xls', 'xlsx'].includes(from) && to === 'csv') return 'excel-to-csv';
  if (from === 'csv' && ['xls', 'xlsx'].includes(to)) return 'csv-to-excel';
  if (['ppt', 'pptx'].includes(from) && to === 'pdf') return 'ppt-to-pdf';
  if (from === 'txt' && ['doc', 'docx'].includes(to)) return 'txt-to-doc';
  return 'unsupported';
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve({ img, dataUrl: e.target.result });
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function canvasToBlob(canvas, mimeType, quality = 0.92) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mimeType, quality);
  });
}

export async function convertImageToImage(file, targetFormat) {
  const { img } = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');

  if (targetFormat === 'jpg' || targetFormat === 'jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0);

  const formatInfo = FORMAT_OPTIONS.image.formats.find(f => f.value === targetFormat);
  const mimeType = formatInfo?.mime || 'image/png';
  const quality = (targetFormat === 'jpg' || targetFormat === 'jpeg') ? 0.92 : 1.0;

  const blob = await canvasToBlob(canvas, mimeType, quality);
  return {
    blob,
    fileName: `${getBaseName(file.name)}.${targetFormat}`,
    size: blob.size,
    url: URL.createObjectURL(blob),
  };
}

export async function convertImagesToPdf(files, options = {}) {
  const { pageSize = 'a4', orientation = 'portrait', margins = 10, mergeMode = 'single' } = options;

  if (mergeMode === 'single') {
    const pdf = new jsPDF({
      orientation: orientation === 'landscape' ? 'l' : 'p',
      unit: 'mm',
      format: pageSize,
    });

    for (let i = 0; i < files.length; i++) {
      const { img } = await loadImage(files[i]);
      if (i > 0) pdf.addPage();

      const pageWidth = pdf.internal.pageSize.getWidth() - margins * 2;
      const pageHeight = pdf.internal.pageSize.getHeight() - margins * 2;
      const ratio = Math.min(pageWidth / img.naturalWidth, pageHeight / img.naturalHeight);
      const finalWidth = img.naturalWidth * ratio;
      const finalHeight = img.naturalHeight * ratio;
      const x = (pdf.internal.pageSize.getWidth() - finalWidth) / 2;
      const y = (pdf.internal.pageSize.getHeight() - finalHeight) / 2;

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext('2d').drawImage(img, 0, 0);
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', x, y, finalWidth, finalHeight);
    }

    const blob = pdf.output('blob');
    return [{ blob, fileName: `${getBaseName(files[0].name)}.pdf`, size: blob.size, url: URL.createObjectURL(blob) }];
  }

  const results = [];
  for (const file of files) {
    const { img } = await loadImage(file);
    const pdf = new jsPDF({ orientation: orientation === 'landscape' ? 'l' : 'p', unit: 'mm', format: pageSize });
    const pageWidth = pdf.internal.pageSize.getWidth() - margins * 2;
    const pageHeight = pdf.internal.pageSize.getHeight() - margins * 2;
    const ratio = Math.min(pageWidth / img.naturalWidth, pageHeight / img.naturalHeight);
    const finalWidth = img.naturalWidth * ratio;
    const finalHeight = img.naturalHeight * ratio;
    const x = (pdf.internal.pageSize.getWidth() - finalWidth) / 2;
    const y = (pdf.internal.pageSize.getHeight() - finalHeight) / 2;
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.getContext('2d').drawImage(img, 0, 0);
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', x, y, finalWidth, finalHeight);
    const blob = pdf.output('blob');
    results.push({ blob, fileName: `${getBaseName(file.name)}.pdf`, size: blob.size, url: URL.createObjectURL(blob) });
  }
  return results;
}

export async function convertPdfToImages(file, targetFormat = 'png') {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pageCount = pdfDoc.numPages;
  const formatInfo = FORMAT_OPTIONS.image.formats.find(f => f.value === targetFormat);
  const mimeType = formatInfo?.mime || 'image/png';
  const results = [];

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
    const blob = await canvasToBlob(canvas, mimeType, 0.92);
    results.push({
      blob,
      fileName: `${getBaseName(file.name)}_page_${i}.${targetFormat}`,
      size: blob.size,
      url: URL.createObjectURL(blob),
    });
  }
  return results;
}

export async function convertTextToPdf(file) {
  const text = await file.text();
  const pdf = new jsPDF();
  const lines = pdf.splitTextToSize(text, 180);
  const linesPerPage = 40;
  for (let i = 0; i < lines.length; i += linesPerPage) {
    if (i > 0) pdf.addPage();
    pdf.text(lines.slice(i, i + linesPerPage), 15, 20);
  }
  const blob = pdf.output('blob');
  return { blob, fileName: `${getBaseName(file.name)}.pdf`, size: blob.size, url: URL.createObjectURL(blob) };
}

export async function convertPdfToTxt(file) {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const content = await page.getTextContent();
    fullText += content.items.map(item => item.str).join(' ') + '\n\n';
  }

  const blob = new Blob([fullText], { type: 'text/plain' });
  return { blob, fileName: `${getBaseName(file.name)}.txt`, size: blob.size, url: URL.createObjectURL(blob) };
}

export async function convertDocToPdf(file) {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const { value: html } = await mammoth.convertToHtml({ arrayBuffer });

  const pdf = new jsPDF();
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  const text = tempDiv.innerText || tempDiv.textContent || '';
  const lines = pdf.splitTextToSize(text, 180);
  const linesPerPage = 40;
  for (let i = 0; i < lines.length; i += linesPerPage) {
    if (i > 0) pdf.addPage();
    pdf.text(lines.slice(i, i + linesPerPage), 15, 20);
  }
  const blob = pdf.output('blob');
  return { blob, fileName: `${getBaseName(file.name)}.pdf`, size: blob.size, url: URL.createObjectURL(blob) };
}

export async function convertPdfToDoc(file) {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const content = await page.getTextContent();
    fullText += `--- Page ${i} ---\n` + content.items.map(item => item.str).join(' ') + '\n\n';
  }

  // Build a minimal DOCX using JSZip
  const zip = new JSZip();
  const escaped = fullText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const paragraphs = escaped.split('\n').map(line =>
    `<w:p><w:r><w:t xml:space="preserve">${line}</w:t></w:r></w:p>`
  ).join('');

  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`);

  zip.folder('_rels').file('.rels', `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);

  zip.folder('word').file('document.xml', `<?xml version="1.0" encoding="UTF-8"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>${paragraphs}</w:body>
</w:document>`);

  zip.folder('word/_rels').file('document.xml.rels', `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`);

  const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  return { blob, fileName: `${getBaseName(file.name)}.docx`, size: blob.size, url: URL.createObjectURL(blob) };
}

export async function convertExcelToPdf(file) {
  const XLSX = await import('xlsx');
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const pdf = new jsPDF();
  let firstPage = true;

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const csv = XLSX.utils.sheet_to_csv(sheet);
    if (!firstPage) pdf.addPage();
    firstPage = false;

    pdf.setFontSize(12);
    pdf.text(sheetName, 15, 15);
    pdf.setFontSize(8);
    const lines = pdf.splitTextToSize(csv, 180);
    const linesPerPage = 50;
    for (let i = 0; i < lines.length; i += linesPerPage) {
      if (i > 0) pdf.addPage();
      pdf.text(lines.slice(i, i + linesPerPage), 15, i === 0 ? 25 : 15);
    }
  }

  const blob = pdf.output('blob');
  return { blob, fileName: `${getBaseName(file.name)}.pdf`, size: blob.size, url: URL.createObjectURL(blob) };
}

export async function convertExcelToCsv(file) {
  const XLSX = await import('xlsx');
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const results = [];

  for (const sheetName of workbook.SheetNames) {
    const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
    const blob = new Blob([csv], { type: 'text/csv' });
    results.push({
      blob,
      fileName: `${getBaseName(file.name)}_${sheetName}.csv`,
      size: blob.size,
      url: URL.createObjectURL(blob),
    });
  }
  return results;
}

export async function convertCsvToExcel(file) {
  const XLSX = await import('xlsx');
  const text = await file.text();
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.aoa_to_sheet(text.split('\n').map(row => row.split(',')));
  XLSX.utils.book_append_sheet(workbook, sheet, 'Sheet1');
  const xlsxBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([xlsxBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  return { blob, fileName: `${getBaseName(file.name)}.xlsx`, size: blob.size, url: URL.createObjectURL(blob) };
}

export async function convertPptToPdf(file) {
  // PPT/PPTX to PDF: extract text content and render as PDF
  const JSZipLib = await import('jszip');
  const zip = await JSZipLib.default.loadAsync(await file.arrayBuffer());
  const pdf = new jsPDF();
  let firstPage = true;
  const slideFiles = Object.keys(zip.files).filter(name => name.match(/ppt\/slides\/slide\d+\.xml$/)).sort();

  if (slideFiles.length === 0) {
    pdf.text('Could not extract slide content.', 15, 20);
  }

  for (let i = 0; i < slideFiles.length; i++) {
    const xmlStr = await zip.files[slideFiles[i]].async('string');
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlStr, 'text/xml');
    const textNodes = xmlDoc.querySelectorAll('t');
    const slideText = Array.from(textNodes).map(n => n.textContent).filter(Boolean).join(' ');

    if (!firstPage) pdf.addPage();
    firstPage = false;
    pdf.setFontSize(14);
    pdf.text(`Slide ${i + 1}`, 15, 15);
    pdf.setFontSize(10);
    const lines = pdf.splitTextToSize(slideText || '(empty slide)', 180);
    pdf.text(lines.slice(0, 50), 15, 25);
  }

  const blob = pdf.output('blob');
  return { blob, fileName: `${getBaseName(file.name)}.pdf`, size: blob.size, url: URL.createObjectURL(blob) };
}

export async function convertTxtToDoc(file) {
  const text = await file.text();
  const zip = new JSZip();
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const paragraphs = escaped.split('\n').map(line =>
    `<w:p><w:r><w:t xml:space="preserve">${line}</w:t></w:r></w:p>`
  ).join('');

  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`);

  zip.folder('_rels').file('.rels', `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);

  zip.folder('word').file('document.xml', `<?xml version="1.0" encoding="UTF-8"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>${paragraphs}</w:body>
</w:document>`);

  zip.folder('word/_rels').file('document.xml.rels', `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`);

  const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  return { blob, fileName: `${getBaseName(file.name)}.docx`, size: blob.size, url: URL.createObjectURL(blob) };
}

export async function convertFile(file, fromFormat, toFormat, options = {}) {
  const conversionType = detectConversionType(fromFormat, toFormat);

  switch (conversionType) {
    case 'image-to-image':
      return [await convertImageToImage(file, toFormat)];
    case 'image-to-pdf':
      return await convertImagesToPdf([file], { ...options, mergeMode: 'single' });
    case 'pdf-to-image':
      return await convertPdfToImages(file, toFormat);
    case 'txt-to-pdf':
      return [await convertTextToPdf(file)];
    case 'pdf-to-txt':
      return [await convertPdfToTxt(file)];
    case 'doc-to-pdf':
      return [await convertDocToPdf(file)];
    case 'pdf-to-doc':
      return [await convertPdfToDoc(file)];
    case 'excel-to-pdf':
      return [await convertExcelToPdf(file)];
    case 'excel-to-csv':
      return await convertExcelToCsv(file);
    case 'csv-to-excel':
      return [await convertCsvToExcel(file)];
    case 'ppt-to-pdf':
      return [await convertPptToPdf(file)];
    case 'txt-to-doc':
      return [await convertTxtToDoc(file)];
    default:
      throw new Error(`Conversion from ${fromFormat} to ${toFormat} is not supported`);
  }
}

export async function convertMultipleFiles(files, fromFormat, toFormat, options = {}) {
  if (toFormat === 'pdf' && SUPPORTED_IMAGE_FORMATS.includes(fromFormat) && options.mergeMode === 'single' && files.length > 1) {
    return await convertImagesToPdf(files, options);
  }
  const results = [];
  for (const file of files) {
    const res = await convertFile(file, fromFormat, toFormat, options);
    results.push(...res);
  }
  return results;
}

export function downloadFile(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function downloadAsZip(results) {
  const zip = new JSZip();
  for (const result of results) {
    zip.file(result.fileName, result.blob);
  }
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  downloadFile(zipBlob, 'converted_files.zip');
}
