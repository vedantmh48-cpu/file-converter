import { jsPDF } from 'jspdf';
import JSZip from 'jszip';

export function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return 'Unknown size';
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
  const from = String(fromFormat || '').toLowerCase();
  const to = String(toFormat || '').toLowerCase();

  // Image conversions
  if (SUPPORTED_IMAGE_FORMATS.includes(from) && SUPPORTED_IMAGE_FORMATS.includes(to)) return 'image-to-image';
  if (SUPPORTED_IMAGE_FORMATS.includes(from) && to === 'pdf') return 'image-to-pdf';
  if (from === 'pdf' && SUPPORTED_IMAGE_FORMATS.includes(to)) return 'pdf-to-image';

  // Text conversions
  if (from === 'txt' && to === 'pdf') return 'txt-to-pdf';
  if (from === 'pdf' && to === 'txt') return 'pdf-to-txt';
  if (from === 'txt' && ['doc', 'docx'].includes(to)) return 'txt-to-doc';
  if (from === 'txt' && to === 'csv') return 'txt-to-csv';
  if (from === 'txt' && to === 'xlsx') return 'txt-to-xlsx';
  if (from === 'txt' && to === 'pptx') return 'txt-to-pptx';

  // Document conversions
  if (['doc', 'docx', 'rtf'].includes(from) && to === 'pdf') return 'doc-to-pdf';
  if (from === 'pdf' && ['doc', 'docx'].includes(to)) return 'pdf-to-doc';
  if (['doc', 'docx', 'rtf'].includes(from) && to === 'txt') return 'doc-to-txt';
  if (['doc', 'docx', 'rtf'].includes(from) && to === 'csv') return 'doc-to-csv';
  if (['doc', 'docx', 'rtf'].includes(from) && to === 'xlsx') return 'doc-to-xlsx';
  if (['doc', 'docx', 'rtf'].includes(from) && to === 'pptx') return 'doc-to-pptx';

  // Excel conversions
  if (['xls', 'xlsx', 'csv'].includes(from) && to === 'pdf') return 'excel-to-pdf';
  if (['xls', 'xlsx'].includes(from) && to === 'csv') return 'excel-to-csv';
  if (from === 'csv' && ['xls', 'xlsx'].includes(to)) return 'csv-to-excel';
  if (['xls', 'xlsx'].includes(from) && to === 'txt') return 'excel-to-txt';
  if (['xls', 'xlsx'].includes(from) && ['doc', 'docx'].includes(to)) return 'excel-to-doc';
  if (['xls', 'xlsx'].includes(from) && to === 'pptx') return 'excel-to-pptx';
  if (from === 'csv' && to === 'txt') return 'csv-to-txt';
  if (from === 'csv' && ['doc', 'docx'].includes(to)) return 'csv-to-doc';
  if (from === 'csv' && to === 'pptx') return 'csv-to-pptx';

  // PowerPoint conversions
  if (['ppt', 'pptx'].includes(from) && to === 'pdf') return 'ppt-to-pdf';
  if (['ppt', 'pptx'].includes(from) && to === 'txt') return 'ppt-to-txt';
  if (['ppt', 'pptx'].includes(from) && ['doc', 'docx'].includes(to)) return 'ppt-to-doc';
  if (['ppt', 'pptx'].includes(from) && ['xls', 'xlsx'].includes(to)) return 'ppt-to-excel';
  if (['ppt', 'pptx'].includes(from) && to === 'csv') return 'ppt-to-csv';

  // PDF to other formats
  if (from === 'pdf' && to === 'csv') return 'pdf-to-csv';
  if (from === 'pdf' && to === 'xlsx') return 'pdf-to-xlsx';
  if (from === 'pdf' && to === 'pptx') return 'pdf-to-pptx';

  return 'unsupported';
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve({ img }); };
    img.onerror = (error) => { URL.revokeObjectURL(url); reject(error); };
    img.src = url;
  });
}

function canvasToBlob(canvas, mimeType, quality = 0.92) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mimeType, quality);
  });
}

// ============ DOCX Creation Helpers ============

function escapeXml(text) {
  const amp = String.fromCharCode(38) + 'amp;';
  const lt = String.fromCharCode(38) + 'lt;';
  const gt = String.fromCharCode(38) + 'gt;';
  return text.replace(/&/g, amp).replace(/</g, lt).replace(/>/g, gt);
}

function createDocxFromText(text, fileName) {
  const zip = new JSZip();
  const escaped = escapeXml(text);
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

  return zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
}

// ============ PPTX Creation Helpers ============

function createPptxFromText(text, fileName) {
  const zip = new JSZip();
  const slides = text.split(/\n\s*\n/).filter(s => s.trim());
  const slideCount = Math.max(slides.length, 1);

  // [Content_Types].xml
  let contentTypes = `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>
  <Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
  <Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>`;

  for (let i = 1; i <= slideCount; i++) {
    contentTypes += `\n  <Override PartName="/ppt/slides/slide${i}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`;
  }
  contentTypes += `\n</Types>`;
  zip.file('[Content_Types].xml', contentTypes);

  // _rels/.rels
  zip.folder('_rels').file('.rels', `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`);

  // docProps
  zip.folder('docProps').file('core.xml', `<?xml version="1.0" encoding="UTF-8"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>${fileName}</dc:title>
  <dc:creator>File Converter</dc:creator>
  <cp:lastModifiedBy>File Converter</cp:lastModifiedBy>
</cp:coreProperties>`);

  zip.folder('docProps').file('app.xml', `<?xml version="1.0" encoding="UTF-8"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
  <Application>File Converter</Application>
  <Slides>${slideCount}</Slides>
</Properties>`);

  // ppt/presentation.xml
  let slideRels = '';
  let slideIds = '';
  for (let i = 1; i <= slideCount; i++) {
    slideRels += `  <Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i}.xml"/>\n`;
    slideIds += `    <p:sldId id="${256 + i}" r:id="rId${i + 1}"/>\n`;
  }

  zip.folder('ppt').file('presentation.xml', `<?xml version="1.0" encoding="UTF-8"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst>
  <p:sldIdLst>
${slideIds}  </p:sldIdLst>
  <p:sldSz cx="9144000" cy="6858000"/>
  <p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>`);

  zip.folder('ppt/_rels').file('presentation.xml.rels', `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>
${slideRels}</Relationships>`);

  // ppt/slideMasters
  zip.folder('ppt/slideMasters').file('slideMaster1.xml', `<?xml version="1.0" encoding="UTF-8"?>
<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld><p:bg><p:bgPr><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill></p:bgPr></p:bg></p:cSld>
  <p:clrMap accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" bg1="lt1" bg2="lt2" folHlink="folHlink" hlink="hlink" tx1="dk1" tx2="dk2"/>
  <p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst>
  <p:txStyles>
    <p:titleStyle><p:lvl1pPr><a:defRPr sz="4400"><a:solidFill><a:srgbClr val="000000"/></a:solidFill></a:defRPr></p:lvl1pPr></p:titleStyle>
    <p:bodyStyle><p:lvl1pPr><a:defRPr sz="1800"><a:solidFill><a:srgbClr val="000000"/></a:solidFill></a:defRPr></p:lvl1pPr></p:bodyStyle>
    <p:otherStyle/>
  </p:txStyles>
</p:sldMaster>`);

  zip.folder('ppt/slideMasters/_rels').file('slideMaster1.xml.rels', `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>
</Relationships>`);

  // ppt/slideLayouts
  zip.folder('ppt/slideLayouts').file('slideLayout1.xml', `<?xml version="1.0" encoding="UTF-8"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank">
  <p:cSld name="Blank"><p:spTree>
    <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
    <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
  </p:spTree></p:cSld>
  <p:clrMapOvr><a:overrideClrMapping accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" bg1="lt1" bg2="lt2" folHlink="folHlink" hlink="hlink" tx1="dk1" tx2="dk2"/></p:clrMapOvr>
</p:sldLayout>`);

  zip.folder('ppt/slideLayouts/_rels').file('slideLayout1.xml.rels', `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>
</Relationships>`);

  // ppt/theme
  zip.folder('ppt/theme').file('theme1.xml', `<?xml version="1.0" encoding="UTF-8"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Office Theme">
  <a:themeElements>
    <a:clrScheme name="Office">
      <a:dk1><a:sysClr val="windowText" lastClr="000000"/></a:dk1>
      <a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1>
      <a:dk2><a:srgbClr val="44546A"/></a:dk2>
      <a:lt2><a:srgbClr val="E7E6E6"/></a:lt2>
      <a:accent1><a:srgbClr val="4472C4"/></a:accent1>
      <a:accent2><a:srgbClr val="ED7D31"/></a:accent2>
      <a:accent3><a:srgbClr val="A5A5A5"/></a:accent3>
      <a:accent4><a:srgbClr val="FFC000"/></a:accent4>
      <a:accent5><a:srgbClr val="5B9BD5"/></a:accent5>
      <a:accent6><a:srgbClr val="70AD47"/></a:accent6>
      <a:hlink><a:srgbClr val="0563C1"/></a:hlink>
      <a:folHlink><a:srgbClr val="954F72"/></a:folHlink>
    </a:clrScheme>
    <a:fontScheme name="Office">
      <a:majorFont><a:latin typeface="Calibri Light"/><a:ea typeface=""/><a:cs typeface=""/></a:majorFont>
      <a:minorFont><a:latin typeface="Calibri"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont>
    </a:fontScheme>
    <a:fmtScheme name="Office">
      <a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst>
      <a:lnStyleLst><a:ln w="6350"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst>
      <a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst>
      <a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst>
    </a:fmtScheme>
  </a:themeElements>
</a:theme>`);

  // ppt/slides
  for (let i = 0; i < slideCount; i++) {
    const slideText = slides[i] || `Slide ${i + 1}`;
    const lines = slideText.split('\n').filter(l => l.trim());
    const title = lines[0] || `Slide ${i + 1}`;
    const bodyLines = lines.slice(1).join('\n');

    let bodyXml = '';
    if (bodyLines) {
      const bodyParagraphs = bodyLines.split('\n').map(line =>
        `<a:p><a:r><a:rPr lang="en-US" sz="1800"/><a:t>${escapeXml(line)}</a:t></a:r></a:p>`
      ).join('');
      bodyXml = `<p:sp><p:nvSpPr><p:cNvPr id="3" name="Body"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="457200" y="1371600"/><a:ext cx="8229600" cy="5029200"/></a:xfrm></p:spPr><p:txBody><a:bodyPr/><a:lstStyle/>${bodyParagraphs}</p:txBody></p:sp>`;
    }

    zip.folder('ppt/slides').file(`slide${i + 1}.xml`, `<?xml version="1.0" encoding="UTF-8"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld><p:spTree>
    <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
    <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
    <p:sp><p:nvSpPr><p:cNvPr id="2" name="Title"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="457200" y="457200"/><a:ext cx="8229600" cy="914400"/></a:xfrm></p:spPr><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:r><a:rPr lang="en-US" sz="4400" b="1"/><a:t>${escapeXml(title)}</a:t></a:r></a:p></p:txBody></p:sp>
    ${bodyXml}
  </p:spTree></p:cSld>
  <p:clrMapOvr><a:overrideClrMapping accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" bg1="lt1" bg2="lt2" folHlink="folHlink" hlink="hlink" tx1="dk1" tx2="dk2"/></p:clrMapOvr>
</p:sld>`);

    zip.folder('ppt/slides/_rels').file(`slide${i + 1}.xml.rels`, `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>`);
  }

  return zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
}

// ============ XLSX Creation Helpers ============

async function createXlsxFromText(text, fileName) {
  const XLSX = await import('xlsx');
  const workbook = XLSX.utils.book_new();
  const rows = text.split('\n').map(row => row.split(/[,\t]/));
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, sheet, 'Sheet1');
  const xlsxBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([xlsxBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

// ============ Text Extraction Helpers ============

async function extractTextFromDocx(file) {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const { value: html } = await mammoth.convertToHtml({ arrayBuffer });
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.innerText || tempDiv.textContent || '';
}

async function extractTextFromPptx(file) {
  const JSZipLib = await import('jszip');
  const zip = await JSZipLib.default.loadAsync(await file.arrayBuffer());
  const slideFiles = Object.keys(zip.files).filter(name => name.match(/ppt\/slides\/slide\d+\.xml$/)).sort();
  let fullText = '';

  for (let i = 0; i < slideFiles.length; i++) {
    const xmlStr = await zip.files[slideFiles[i]].async('string');
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlStr, 'text/xml');
    const textNodes = xmlDoc.querySelectorAll('t');
    const slideText = Array.from(textNodes).map(n => n.textContent).filter(Boolean).join(' ');
    fullText += `--- Slide ${i + 1} ---\n${slideText}\n\n`;
  }
  return fullText;
}

async function getPdfJsLib() {
  const pdfjsLib = await import('pdfjs-dist');
  // Try unpkg first (direct npm mirror, always has exact version), then cdnjs
  const workerUrls = [
    `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`,
    `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`,
    `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`,
  ];
  for (const url of workerUrls) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = url;
        return pdfjsLib;
      }
    } catch (e) {
      // Try next URL
    }
  }
  // Last resort: use the main thread (no worker) - v6 supports this fallback
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrls[0];
  return pdfjsLib;
}

async function extractTextFromPdf(file) {
  const pdfjsLib = await getPdfJsLib();
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const content = await page.getTextContent();
    fullText += `--- Page ${i} ---\n` + content.items.map(item => item.str).join(' ') + '\n\n';
  }
  return fullText;
}

// ============ Image Conversions ============

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
  if (!blob) throw new Error('The browser could not encode this image');
  if (blob.type !== mimeType) {
    throw new Error(`${targetFormat.toUpperCase()} export is not supported by this browser. Choose JPG, PNG, or WEBP.`);
  }
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
  const pdfjsLib = await getPdfJsLib();

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

// ============ Text Conversions ============

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
  const text = await extractTextFromPdf(file);
  const blob = new Blob([text], { type: 'text/plain' });
  return { blob, fileName: `${getBaseName(file.name)}.txt`, size: blob.size, url: URL.createObjectURL(blob) };
}

export async function convertTxtToDoc(file) {
  const text = await file.text();
  const blob = await createDocxFromText(text, file.name);
  return { blob, fileName: `${getBaseName(file.name)}.docx`, size: blob.size, url: URL.createObjectURL(blob) };
}

export async function convertTxtToCsv(file) {
  const text = await file.text();
  const blob = new Blob([text], { type: 'text/csv' });
  return { blob, fileName: `${getBaseName(file.name)}.csv`, size: blob.size, url: URL.createObjectURL(blob) };
}

export async function convertTxtToXlsx(file) {
  const text = await file.text();
  const blob = await createXlsxFromText(text, file.name);
  return { blob, fileName: `${getBaseName(file.name)}.xlsx`, size: blob.size, url: URL.createObjectURL(blob) };
}

export async function convertTxtToPptx(file) {
  const text = await file.text();
  const blob = await createPptxFromText(text, file.name);
  return { blob, fileName: `${getBaseName(file.name)}.pptx`, size: blob.size, url: URL.createObjectURL(blob) };
}

// ============ Document Conversions ============

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
  const text = await extractTextFromPdf(file);
  const blob = await createDocxFromText(text, file.name);
  return { blob, fileName: `${getBaseName(file.name)}.docx`, size: blob.size, url: URL.createObjectURL(blob) };
}

export async function convertDocToTxt(file) {
  const text = await extractTextFromDocx(file);
  const blob = new Blob([text], { type: 'text/plain' });
  return { blob, fileName: `${getBaseName(file.name)}.txt`, size: blob.size, url: URL.createObjectURL(blob) };
}

export async function convertDocToCsv(file) {
  const text = await extractTextFromDocx(file);
  const csvText = text.split('\n').map(line => line.split(/\s+/).join(',')).join('\n');
  const blob = new Blob([csvText], { type: 'text/csv' });
  return { blob, fileName: `${getBaseName(file.name)}.csv`, size: blob.size, url: URL.createObjectURL(blob) };
}

export async function convertDocToXlsx(file) {
  const text = await extractTextFromDocx(file);
  const blob = await createXlsxFromText(text, file.name);
  return { blob, fileName: `${getBaseName(file.name)}.xlsx`, size: blob.size, url: URL.createObjectURL(blob) };
}

export async function convertDocToPptx(file) {
  const text = await extractTextFromDocx(file);
  const blob = await createPptxFromText(text, file.name);
  return { blob, fileName: `${getBaseName(file.name)}.pptx`, size: blob.size, url: URL.createObjectURL(blob) };
}

// ============ Excel Conversions ============

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

export async function convertExcelToTxt(file) {
  const XLSX = await import('xlsx');
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  let fullText = '';

  for (const sheetName of workbook.SheetNames) {
    const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
    fullText += `--- ${sheetName} ---\n${csv}\n\n`;
  }

  const blob = new Blob([fullText], { type: 'text/plain' });
  return { blob, fileName: `${getBaseName(file.name)}.txt`, size: blob.size, url: URL.createObjectURL(blob) };
}

export async function convertExcelToDoc(file) {
  const XLSX = await import('xlsx');
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  let fullText = '';

  for (const sheetName of workbook.SheetNames) {
    const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
    fullText += `--- ${sheetName} ---\n${csv}\n\n`;
  }

  const blob = await createDocxFromText(fullText, file.name);
  return { blob, fileName: `${getBaseName(file.name)}.docx`, size: blob.size, url: URL.createObjectURL(blob) };
}

export async function convertExcelToPptx(file) {
  const XLSX = await import('xlsx');
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  let fullText = '';

  for (const sheetName of workbook.SheetNames) {
    const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
    fullText += `--- ${sheetName} ---\n${csv}\n\n`;
  }

  const blob = await createPptxFromText(fullText, file.name);
  return { blob, fileName: `${getBaseName(file.name)}.pptx`, size: blob.size, url: URL.createObjectURL(blob) };
}

export async function convertCsvToTxt(file) {
  const text = await file.text();
  const blob = new Blob([text], { type: 'text/plain' });
  return { blob, fileName: `${getBaseName(file.name)}.txt`, size: blob.size, url: URL.createObjectURL(blob) };
}

export async function convertCsvToDoc(file) {
  const text = await file.text();
  const blob = await createDocxFromText(text, file.name);
  return { blob, fileName: `${getBaseName(file.name)}.docx`, size: blob.size, url: URL.createObjectURL(blob) };
}

export async function convertCsvToPptx(file) {
  const text = await file.text();
  const blob = await createPptxFromText(text, file.name);
  return { blob, fileName: `${getBaseName(file.name)}.pptx`, size: blob.size, url: URL.createObjectURL(blob) };
}

// ============ PowerPoint Conversions ============

export async function convertPptToPdf(file) {
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

export async function convertPptToTxt(file) {
  const text = await extractTextFromPptx(file);
  const blob = new Blob([text], { type: 'text/plain' });
  return { blob, fileName: `${getBaseName(file.name)}.txt`, size: blob.size, url: URL.createObjectURL(blob) };
}

export async function convertPptToDoc(file) {
  const text = await extractTextFromPptx(file);
  const blob = await createDocxFromText(text, file.name);
  return { blob, fileName: `${getBaseName(file.name)}.docx`, size: blob.size, url: URL.createObjectURL(blob) };
}

export async function convertPptToExcel(file) {
  const text = await extractTextFromPptx(file);
  const blob = await createXlsxFromText(text, file.name);
  return { blob, fileName: `${getBaseName(file.name)}.xlsx`, size: blob.size, url: URL.createObjectURL(blob) };
}

export async function convertPptToCsv(file) {
  const text = await extractTextFromPptx(file);
  const csvText = text.split('\n').map(line => line.split(/\s+/).join(',')).join('\n');
  const blob = new Blob([csvText], { type: 'text/csv' });
  return { blob, fileName: `${getBaseName(file.name)}.csv`, size: blob.size, url: URL.createObjectURL(blob) };
}

// ============ PDF to Other Formats ============

export async function convertPdfToCsv(file) {
  const text = await extractTextFromPdf(file);
  const csvText = text.split('\n').map(line => line.split(/\s+/).join(',')).join('\n');
  const blob = new Blob([csvText], { type: 'text/csv' });
  return { blob, fileName: `${getBaseName(file.name)}.csv`, size: blob.size, url: URL.createObjectURL(blob) };
}

export async function convertPdfToXlsx(file) {
  const text = await extractTextFromPdf(file);
  const blob = await createXlsxFromText(text, file.name);
  return { blob, fileName: `${getBaseName(file.name)}.xlsx`, size: blob.size, url: URL.createObjectURL(blob) };
}

export async function convertPdfToPptx(file) {
  const text = await extractTextFromPdf(file);
  const blob = await createPptxFromText(text, file.name);
  return { blob, fileName: `${getBaseName(file.name)}.pptx`, size: blob.size, url: URL.createObjectURL(blob) };
}

// ============ Main Conversion Dispatcher ============

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
    case 'txt-to-doc':
      return [await convertTxtToDoc(file)];
    case 'txt-to-csv':
      return [await convertTxtToCsv(file)];
    case 'txt-to-xlsx':
      return [await convertTxtToXlsx(file)];
    case 'txt-to-pptx':
      return [await convertTxtToPptx(file)];
    case 'doc-to-pdf':
      return [await convertDocToPdf(file)];
    case 'pdf-to-doc':
      return [await convertPdfToDoc(file)];
    case 'doc-to-txt':
      return [await convertDocToTxt(file)];
    case 'doc-to-csv':
      return [await convertDocToCsv(file)];
    case 'doc-to-xlsx':
      return [await convertDocToXlsx(file)];
    case 'doc-to-pptx':
      return [await convertDocToPptx(file)];
    case 'excel-to-pdf':
      return [await convertExcelToPdf(file)];
    case 'excel-to-csv':
      return await convertExcelToCsv(file);
    case 'csv-to-excel':
      return [await convertCsvToExcel(file)];
    case 'excel-to-txt':
      return [await convertExcelToTxt(file)];
    case 'excel-to-doc':
      return [await convertExcelToDoc(file)];
    case 'excel-to-pptx':
      return [await convertExcelToPptx(file)];
    case 'csv-to-txt':
      return [await convertCsvToTxt(file)];
    case 'csv-to-doc':
      return [await convertCsvToDoc(file)];
    case 'csv-to-pptx':
      return [await convertCsvToPptx(file)];
    case 'ppt-to-pdf':
      return [await convertPptToPdf(file)];
    case 'ppt-to-txt':
      return [await convertPptToTxt(file)];
    case 'ppt-to-doc':
      return [await convertPptToDoc(file)];
    case 'ppt-to-excel':
      return [await convertPptToExcel(file)];
    case 'ppt-to-csv':
      return [await convertPptToCsv(file)];
    case 'pdf-to-csv':
      return [await convertPdfToCsv(file)];
    case 'pdf-to-xlsx':
      return [await convertPdfToXlsx(file)];
    case 'pdf-to-pptx':
      return [await convertPdfToPptx(file)];
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

// ============ File Compression ============

/**
 * Wraps a compressed blob into the result shape used by the UI.
 * IMPORTANT GUARD: if the compressed output is NOT smaller than the input
 * (or was not produced), the original file is returned instead – so the
 * compressor never increases a file's size.
 */
function buildCompressionResult(file, blob, fileName, message = null) {
  if (!blob || blob.size >= file.size) {
    const originalBlob = file.slice(0, file.size, file.type || 'application/octet-stream');
    return {
      blob: originalBlob,
      fileName: file.name,
      size: file.size,
      originalSize: file.size,
      url: URL.createObjectURL(originalBlob),
      message: message || 'Original kept — file was already optimally compressed',
    };
  }
  return {
    blob,
    fileName,
    size: blob.size,
    originalSize: file.size,
    url: URL.createObjectURL(blob),
    message: message || null,
  };
}

/**
 * Fast alpha check – draws a downscaled copy of the image on a tiny canvas.
 * Prevents JPEG conversion from silently destroying transparency.
 */
function imageHasTransparency(img, width, height) {
  const scale = Math.min(1, 96 / Math.max(width, height));
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return true;
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 250) return true;
  }
  return false;
}

async function compressImage(file, quality) {
  const { img } = await loadImage(file);
  const width = img.naturalWidth;
  const height = img.naturalHeight;
  if (!width || !height) {
    throw new Error('Could not read image dimensions');
  }

  const baseName = getBaseName(file.name);
  const hasTransparency = imageHasTransparency(img, width, height);
  const candidates = [];
  const scale = Math.min(1, 1920 / width, 1080 / height);
  const outWidth = Math.max(1, Math.round(width * scale));
  const outHeight = Math.max(1, Math.round(height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = outWidth;
  canvas.height = outHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('This browser could not create an image canvas');
  if (!hasTransparency) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, outWidth, outHeight);
  }
  ctx.drawImage(img, 0, 0, outWidth, outHeight);

  // Try several quality passes and keep the smallest supported encoding.
  const passes = [...new Set([quality, Math.max(0.35, quality - 0.15), 0.55])];
  const encodings = hasTransparency
    ? [['image/webp', `${baseName}_compressed.webp`], ['image/png', `${baseName}_compressed.png`]]
    : [['image/webp', `${baseName}_compressed.webp`], ['image/jpeg', `${baseName}_compressed.jpg`]];
  for (const [mime, fileName] of encodings) {
    for (const pass of (mime === 'image/png' ? [undefined] : passes)) {
      const blob = await canvasToBlob(canvas, mime, pass);
      // Some browsers silently return PNG for unsupported MIME types.
      if (blob && blob.type === mime) candidates.push({ blob, fileName });
      if (mime === 'image/png') break;
    }
  }

  if (candidates.length === 0) {
    throw new Error('Could not compress this image');
  }

  // Always pick the smallest candidate.
  const smallest = candidates.reduce((a, b) => (b.blob.size < a.blob.size ? b : a));
  return smallest;
}

async function compressPdf(file, quality) {
  const baseName = getBaseName(file.name);
  const arrayBuffer = await file.arrayBuffer();
  const candidates = [];

  // Candidate 1: lossless structural re-save with pdf-lib.
  try {
    const pdfLib = await import('pdf-lib');
    const doc = await pdfLib.PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const saved = await doc.save({ useObjectStreams: true });
    candidates.push({
      blob: new Blob([saved], { type: 'application/pdf' }),
      fileName: `${baseName}_compressed.pdf`,
    });
  } catch (e) {
    console.warn('pdf-lib re-save skipped:', e);
  }

  // Candidate 2: image-based rebuild. Only beneficial for scanned /
  // image-heavy PDFs. For text PDFs this is usually LARGER, so it is
  // discarded by pick-smallest below and by buildCompressionResult.
  try {
    const pdfjsLib = await getPdfJsLib();
    const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pages = [];
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale: 1 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const canvasCtx = canvas.getContext('2d');
      canvasCtx.fillStyle = '#ffffff';
      canvasCtx.fillRect(0, 0, viewport.width, viewport.height);
      await page.render({ canvasContext: canvasCtx, viewport }).promise;
      pages.push({
        imgData: canvas.toDataURL('image/jpeg', quality),
        width: viewport.width,
        height: viewport.height,
      });
    }

    let pdf;
    pages.forEach((p, index) => {
      const orientation = p.height >= p.width ? 'portrait' : 'landscape';
      const format = [Math.round(p.width), Math.round(p.height)];
      if (index === 0) {
        pdf = new jsPDF({ orientation, unit: 'pt', format });
      } else {
        pdf.addPage(format, orientation);
      }
      pdf.addImage(p.imgData, 'JPEG', 0, 0, p.width, p.height);
    });
    candidates.push({
      blob: pdf.output('blob'),
      fileName: `${baseName}_compressed.pdf`,
    });
  } catch (e) {
    console.warn('PDF rasterization skipped:', e);
  }

  if (candidates.length === 0) {
    return {
      blob: file.slice(0, file.size, file.type || 'application/pdf'),
      fileName: file.name,
      message: 'Original kept — this PDF could not be compressed',
    };
  }

  return candidates.reduce((a, b) => (b.blob.size < a.blob.size ? b : a));
}

async function compressText(file, extension) {
  const lines = (await file.text())
    .split(/\r\n|\r|\n/)
    .map((line) => line.replace(/[ \t]+/g, ' ').trim());

  // CSV rows are separated by newlines, so every line must be preserved.
  let body;
  if (extension === 'csv') {
    body = lines.join('\n');
  } else {
    // TXT: also collapse consecutive blank lines while keeping single ones.
    const merged = [];
    let prevBlank = false;
    for (const line of lines) {
      if (line === '') {
        if (prevBlank) continue;
        prevBlank = true;
      } else {
        prevBlank = false;
      }
      merged.push(line);
    }
    body = merged.join('\n').trim();
  }

  return {
    blob: new Blob([body], { type: file.type || 'text/plain' }),
    fileName: `${getBaseName(file.name)}_compressed.${extension}`,
  };
}

export async function compressFile(file, quality = 0.7) {
  if (!file || typeof file.size !== 'number' || !file.name) throw new Error('Choose a valid file to compress');
  quality = Math.min(1, Math.max(0.1, Number(quality) || 0.7));
  const extension = getFileExtension(file.name);
  let candidate;

  // Compress images
  if (SUPPORTED_IMAGE_FORMATS.includes(extension)) {
    if (extension === 'gif') {
      candidate = { blob: file, fileName: file.name, message: 'Animated GIFs are kept intact' };
    } else {
      candidate = await compressImage(file, quality);
    }
  } else if (extension === 'pdf') {
    candidate = await compressPdf(file, quality);
  } else if (extension === 'txt' || extension === 'csv') {
    candidate = await compressText(file, extension);
  } else {
    throw new Error('This file type is not supported for compression');
  }

  return buildCompressionResult(file, candidate.blob, candidate.fileName, candidate.message || null);
}

// ============ File to Link ============

export function fileToLink(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const base64 = dataUrl.split(',')[1];
      const link = `data:${file.type || 'application/octet-stream'};base64,${base64}`;
      resolve({
        link,
        fileName: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function copyToClipboard(text) {
  return navigator.clipboard.writeText(text);
}

// ============ Download Helpers ============

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

// ============ Google Docs/Sheets/Slides Creation ============

export const GOOGLE_CREATE_URLS = {
  docs: 'https://docs.google.com/document/create',
  sheets: 'https://sheets.google.com/create',
  slides: 'https://slides.google.com/create',
  forms: 'https://forms.google.com/create',
};

export function openGoogleCreate(type) {
  const url = GOOGLE_CREATE_URLS[type];
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

// ============ Rename Helper ============

export function renameFile(result, newName) {
  const extension = getFileExtension(result.fileName);
  const baseName = getBaseName(newName);
  const finalName = extension ? `${baseName}.${extension}` : newName;
  return {
    ...result,
    fileName: finalName,
  };
}
