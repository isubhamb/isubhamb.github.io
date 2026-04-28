/* ═══════════════════════════════════════════════════════════════════════════
   converters.js — YourFreeDocs Converter Modal
   All file conversion happens 100% client-side in the browser.
   Depends on: jQuery, Bootstrap Icons, pdf-lib, pdfjs-dist (loaded by main app)
   External libs loaded on demand: mammoth.js, xlsx.js, jspdf
   ═══════════════════════════════════════════════════════════════════════════ */

(function ($) {
  'use strict';

  // ── Converter definitions ─────────────────────────────────────────────────
  // Each entry: { id, title, desc, icon, cat, accept, outputExt, optFn, convertFn }
  const CONVERTERS = [

    // ── PDF → Other ──────────────────────────────────────────────────────
    {
      id: 'pdf-to-jpg',
      title: 'PDF → JPG',
      desc: 'Export each page as a high-quality JPEG image.',
      icon: 'bi-file-earmark-image',
      cat: 'pdf-out',
      accept: '.pdf',
      outputExt: 'jpg',
      options: [
        { id: 'dpi', label: 'DPI / Scale', type: 'range', min: 1, max: 4, step: 0.5, value: 2, display: v => v + 'x' },
        { id: 'quality', label: 'Quality', type: 'range', min: 0.4, max: 1, step: 0.05, value: 0.9, display: v => Math.round(v*100)+'%' },
      ],
      async convert(file, opts, onProgress) {
        await ensurePdfjsReady();
        const bytes = await readFileBytes(file);
        const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
        const results = [];
        const scale = parseFloat(opts.dpi || 2);
        const quality = parseFloat(opts.quality || 0.9);
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const vp = page.getViewport({ scale });
          const canvas = document.createElement('canvas');
          canvas.width = vp.width; canvas.height = vp.height;
          await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
          const blob = await canvasToBlob(canvas, 'image/jpeg', quality);
          const name = `${stripExt(file.name)}_page${i}.jpg`;
          results.push({ name, blob });
          onProgress(i / pdf.numPages);
        }
        return results;
      }
    },

    {
      id: 'pdf-to-png',
      title: 'PDF → PNG',
      desc: 'Export each page as a lossless PNG image.',
      icon: 'bi-image',
      cat: 'pdf-out',
      accept: '.pdf',
      outputExt: 'png',
      options: [
        { id: 'dpi', label: 'DPI / Scale', type: 'range', min: 1, max: 4, step: 0.5, value: 2, display: v => v + 'x' },
      ],
      async convert(file, opts, onProgress) {
        await ensurePdfjsReady();
        const bytes = await readFileBytes(file);
        const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
        const results = [];
        const scale = parseFloat(opts.dpi || 2);
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const vp = page.getViewport({ scale });
          const canvas = document.createElement('canvas');
          canvas.width = vp.width; canvas.height = vp.height;
          await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
          const blob = await canvasToBlob(canvas, 'image/png');
          const name = `${stripExt(file.name)}_page${i}.png`;
          results.push({ name, blob });
          onProgress(i / pdf.numPages);
        }
        return results;
      }
    },

    {
      id: 'pdf-to-text',
      title: 'PDF → Text',
      desc: 'Extract all text content from a PDF.',
      icon: 'bi-file-earmark-text',
      cat: 'pdf-out',
      accept: '.pdf',
      outputExt: 'txt',
      options: [],
      async convert(file, opts, onProgress) {
        await ensurePdfjsReady();
        const bytes = await readFileBytes(file);
        const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
        let out = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const tc = await page.getTextContent();
          out += `\n\n--- Page ${i} ---\n`;
          out += tc.items.map(s => s.str).join(' ');
          onProgress(i / pdf.numPages);
        }
        const blob = new Blob([out.trim()], { type: 'text/plain' });
        return [{ name: stripExt(file.name) + '.txt', blob }];
      }
    },

    {
      id: 'pdf-compress',
      title: 'PDF Compressor',
      desc: 'Reduce PDF file size by re-saving and stripping metadata.',
      icon: 'bi-file-zip',
      cat: 'pdf-util',
      accept: '.pdf',
      outputExt: 'pdf',
      options: [],
      async convert(file, opts, onProgress) {
        const bytes = await readFileBytes(file);
        const { PDFDocument } = PDFLib;
        const srcDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const newDoc = await PDFDocument.create();
        const pages = await newDoc.copyPages(srcDoc, srcDoc.getPageIndices());
        pages.forEach(p => newDoc.addPage(p));
        onProgress(0.7);
        const out = await newDoc.save({ useObjectStreams: true });
        onProgress(1);
        const blob = new Blob([out], { type: 'application/pdf' });
        return [{ name: stripExt(file.name) + '_compressed.pdf', blob }];
      }
    },

    {
      id: 'pdf-merge',
      title: 'PDF Merger',
      desc: 'Merge multiple PDF files into one document.',
      icon: 'bi-files',
      cat: 'pdf-util',
      accept: '.pdf',
      outputExt: 'pdf',
      multi: true,
      options: [],
      async convert(files, opts, onProgress) {
        const { PDFDocument } = PDFLib;
        const merged = await PDFDocument.create();
        for (let fi = 0; fi < files.length; fi++) {
          const bytes = await readFileBytes(files[fi]);
          const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
          const pages = await merged.copyPages(src, src.getPageIndices());
          pages.forEach(p => merged.addPage(p));
          onProgress((fi + 1) / files.length);
        }
        const out = await merged.save();
        const blob = new Blob([out], { type: 'application/pdf' });
        return [{ name: 'merged.pdf', blob }];
      }
    },

    {
      id: 'pdf-split',
      title: 'PDF Splitter',
      desc: 'Split a PDF into one file per page.',
      icon: 'bi-scissors',
      cat: 'pdf-util',
      accept: '.pdf',
      outputExt: 'pdf',
      options: [],
      async convert(file, opts, onProgress) {
        const { PDFDocument } = PDFLib;
        const bytes = await readFileBytes(file);
        const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const total = src.getPageCount();
        const results = [];
        for (let i = 0; i < total; i++) {
          const doc = await PDFDocument.create();
          const [page] = await doc.copyPages(src, [i]);
          doc.addPage(page);
          const out = await doc.save();
          const blob = new Blob([out], { type: 'application/pdf' });
          results.push({ name: `${stripExt(file.name)}_page${i+1}.pdf`, blob });
          onProgress((i + 1) / total);
        }
        return results;
      }
    },

    {
      id: 'pdf-rotate',
      title: 'PDF Rotator',
      desc: 'Rotate all pages in a PDF by a chosen angle.',
      icon: 'bi-arrow-clockwise',
      cat: 'pdf-util',
      accept: '.pdf',
      outputExt: 'pdf',
      options: [
        { id: 'angle', label: 'Rotation', type: 'select', choices: ['90° CW','180°','90° CCW'], value: '90° CW' },
      ],
      async convert(file, opts, onProgress) {
        const { PDFDocument, degrees } = PDFLib;
        const bytes = await readFileBytes(file);
        const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const angleMap = { '90° CW': 90, '180°': 180, '90° CCW': 270 };
        const deg = angleMap[opts.angle] || 90;
        doc.getPages().forEach(p => {
          const cur = p.getRotation().angle;
          p.setRotation(degrees((cur + deg) % 360));
        });
        onProgress(0.8);
        const out = await doc.save();
        onProgress(1);
        const blob = new Blob([out], { type: 'application/pdf' });
        return [{ name: stripExt(file.name) + '_rotated.pdf', blob }];
      }
    },

    // ── Images → PDF ─────────────────────────────────────────────────────
    {
      id: 'img-to-pdf',
      title: 'Images → PDF',
      desc: 'Combine JPG, PNG or WebP images into a single PDF.',
      icon: 'bi-images',
      cat: 'to-pdf',
      accept: 'image/png,image/jpeg,image/webp',
      outputExt: 'pdf',
      multi: true,
      options: [
        { id: 'fit', label: 'Fit mode', type: 'select', choices: ['Fit page','Fill page','Original size'], value: 'Fit page' },
      ],
      async convert(files, opts, onProgress) {
        const { PDFDocument } = PDFLib;
        const doc = await PDFDocument.create();
        for (let fi = 0; fi < files.length; fi++) {
          const bytes = await readFileBytes(files[fi]);
          const type = files[fi].type;
          let img;
          if (type === 'image/png') img = await doc.embedPng(bytes);
          else img = await doc.embedJpg(bytes);
          const page = doc.addPage();
          const { width: pw, height: ph } = page.getSize();
          const { width: iw, height: ih } = img;
          let x = 0, y = 0, w = pw, h = ph;
          if (opts.fit === 'Fit page') {
            const scale = Math.min(pw / iw, ph / ih);
            w = iw * scale; h = ih * scale;
            x = (pw - w) / 2; y = (ph - h) / 2;
          } else if (opts.fit === 'Original size') {
            w = iw; h = ih;
            x = (pw - w) / 2; y = (ph - h) / 2;
          }
          page.drawImage(img, { x, y, width: w, height: h });
          onProgress((fi + 1) / files.length);
        }
        const out = await doc.save();
        const blob = new Blob([out], { type: 'application/pdf' });
        return [{ name: 'images.pdf', blob }];
      }
    },

    // ── Image ↔ Image ─────────────────────────────────────────────────────
    {
      id: 'jpg-to-png',
      title: 'JPG → PNG',
      desc: 'Convert JPEG images to lossless PNG format.',
      icon: 'bi-arrow-left-right',
      cat: 'image',
      accept: 'image/jpeg,.jpg,.jpeg',
      outputExt: 'png',
      options: [],
      async convert(file, opts, onProgress) {
        const blob = await convertImageFormat(file, 'image/png');
        onProgress(1);
        return [{ name: stripExt(file.name) + '.png', blob }];
      }
    },

    {
      id: 'png-to-jpg',
      title: 'PNG → JPG',
      desc: 'Convert PNG images to JPEG (smaller file size).',
      icon: 'bi-arrow-left-right',
      cat: 'image',
      accept: 'image/png,.png',
      outputExt: 'jpg',
      options: [
        { id: 'quality', label: 'Quality', type: 'range', min: 0.4, max: 1, step: 0.05, value: 0.92, display: v => Math.round(v*100)+'%' },
      ],
      async convert(file, opts, onProgress) {
        const quality = parseFloat(opts.quality || 0.92);
        const blob = await convertImageFormat(file, 'image/jpeg', quality);
        onProgress(1);
        return [{ name: stripExt(file.name) + '.jpg', blob }];
      }
    },

    {
      id: 'webp-to-jpg',
      title: 'WebP → JPG',
      desc: 'Convert WebP images to universally-compatible JPEG.',
      icon: 'bi-arrow-left-right',
      cat: 'image',
      accept: 'image/webp,.webp',
      outputExt: 'jpg',
      options: [
        { id: 'quality', label: 'Quality', type: 'range', min: 0.4, max: 1, step: 0.05, value: 0.92, display: v => Math.round(v*100)+'%' },
      ],
      async convert(file, opts, onProgress) {
        const quality = parseFloat(opts.quality || 0.92);
        const blob = await convertImageFormat(file, 'image/jpeg', quality);
        onProgress(1);
        return [{ name: stripExt(file.name) + '.jpg', blob }];
      }
    },

    {
      id: 'webp-to-png',
      title: 'WebP → PNG',
      desc: 'Convert WebP images to PNG format.',
      icon: 'bi-arrow-left-right',
      cat: 'image',
      accept: 'image/webp,.webp',
      outputExt: 'png',
      options: [],
      async convert(file, opts, onProgress) {
        const blob = await convertImageFormat(file, 'image/png');
        onProgress(1);
        return [{ name: stripExt(file.name) + '.png', blob }];
      }
    },

    {
      id: 'heic-to-jpg',
      title: 'HEIC → JPG',
      desc: 'Convert iPhone HEIC photos to JPEG (uses heic2any library).',
      icon: 'bi-phone',
      cat: 'image',
      accept: '.heic,.heif',
      outputExt: 'jpg',
      options: [
        { id: 'quality', label: 'Quality', type: 'range', min: 0.4, max: 1, step: 0.05, value: 0.9, display: v => Math.round(v*100)+'%' },
      ],
      async convert(file, opts, onProgress) {
        await loadExternalScript('https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js', 'heic2any');
        const quality = parseFloat(opts.quality || 0.9);
        const blob = await window.heic2any({ blob: file, toType: 'image/jpeg', quality });
        onProgress(1);
        return [{ name: stripExt(file.name) + '.jpg', blob }];
      }
    },

    {
      id: 'svg-to-png',
      title: 'SVG → PNG',
      desc: 'Render SVG vector graphics to a raster PNG image.',
      icon: 'bi-vector-pen',
      cat: 'image',
      accept: 'image/svg+xml,.svg',
      outputExt: 'png',
      options: [
        { id: 'scale', label: 'Scale', type: 'range', min: 1, max: 4, step: 0.5, value: 2, display: v => v+'x' },
      ],
      async convert(file, opts, onProgress) {
        const scale = parseFloat(opts.scale || 2);
        const text = await readFileText(file);
        const blob = await svgToPng(text, scale);
        onProgress(1);
        return [{ name: stripExt(file.name) + '.png', blob }];
      }
    },

    // ── Document converters ───────────────────────────────────────────────
    {
      id: 'docx-to-pdf',
      title: 'Word → PDF',
      desc: 'Convert .docx Word documents to PDF using docx-preview.',
      icon: 'bi-file-earmark-word',
      cat: 'doc',
      accept: '.docx',
      outputExt: 'pdf',
      options: [],
      async convert(file, opts, onProgress) {
        // Render docx to HTML canvas → PDF via pdf-lib
        await loadExternalScript('https://cdn.jsdelivr.net/npm/mammoth@1.6.0/mammoth.browser.min.js', 'mammoth');
        const bytes = await readFileBytes(file);
        const result = await mammoth.convertToHtml({ arrayBuffer: bytes.buffer });
        onProgress(0.4);
        // Render HTML in a hidden iframe → capture as image → embed in PDF
        const { PDFDocument, rgb } = PDFLib;
        const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
          body{font-family:Georgia,serif;padding:48px;font-size:12px;line-height:1.7;color:#000;max-width:680px;}
          h1,h2,h3{color:#111;} table{border-collapse:collapse;width:100%;}
          td,th{border:1px solid #ccc;padding:6px;}
        </style></head><body>${result.value}</body></html>`;
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const pdfBytes = await htmlToPdfViaCanvas(url, onProgress);
        URL.revokeObjectURL(url);
        return [{ name: stripExt(file.name) + '.pdf', blob: new Blob([pdfBytes], { type: 'application/pdf' }) }];
      }
    },

    {
      id: 'csv-to-pdf',
      title: 'CSV → PDF',
      desc: 'Convert CSV data to a formatted PDF table.',
      icon: 'bi-table',
      cat: 'doc',
      accept: '.csv',
      outputExt: 'pdf',
      options: [],
      async convert(file, opts, onProgress) {
        const text = await readFileText(file);
        const rows = parseCSV(text);
        onProgress(0.3);
        const { PDFDocument, StandardFonts, rgb } = PDFLib;
        const doc = await PDFDocument.create();
        const font = await doc.embedFont(StandardFonts.Helvetica);
        const bold = await doc.embedFont(StandardFonts.HelveticaBold);
        const pageW = 595, pageH = 842, margin = 40, colPad = 6, rowH = 18, headerH = 22;
        let page = doc.addPage([pageW, pageH]);
        let y = pageH - margin;
        const cols = rows[0] ? rows[0].length : 1;
        const colW = (pageW - margin * 2) / cols;

        const drawRow = (rowData, isHeader) => {
          if (y < margin + rowH) {
            page = doc.addPage([pageW, pageH]);
            y = pageH - margin;
          }
          const rh = isHeader ? headerH : rowH;
          if (isHeader) {
            page.drawRectangle({ x: margin, y: y - rh, width: pageW - margin*2, height: rh, color: rgb(0.9,0.85,0.27) });
          } else if ((rows.indexOf(rowData) % 2) === 0) {
            page.drawRectangle({ x: margin, y: y - rh, width: pageW - margin*2, height: rh, color: rgb(0.97,0.97,0.97) });
          }
          rowData.forEach((cell, ci) => {
            const cellX = margin + ci * colW + colPad;
            const txt = String(cell).slice(0, 30);
            page.drawText(txt, {
              x: cellX, y: y - rh + 5,
              font: isHeader ? bold : font,
              size: isHeader ? 8 : 7.5,
              color: rgb(0.1, 0.1, 0.1),
              maxWidth: colW - colPad * 2,
            });
          });
          // row border
          page.drawLine({ start: {x: margin, y: y - rh}, end: {x: pageW - margin, y: y - rh}, thickness: 0.3, color: rgb(0.8,0.8,0.8) });
          y -= rh;
        };

        rows.forEach((row, ri) => { drawRow(row, ri === 0); onProgress(0.3 + 0.7 * (ri / rows.length)); });
        const out = await doc.save();
        return [{ name: stripExt(file.name) + '.pdf', blob: new Blob([out], { type: 'application/pdf' }) }];
      }
    },

    {
      id: 'md-to-pdf',
      title: 'Markdown → PDF',
      desc: 'Convert a Markdown (.md) file to a styled PDF.',
      icon: 'bi-markdown',
      cat: 'doc',
      accept: '.md,.txt',
      outputExt: 'pdf',
      options: [],
      async convert(file, opts, onProgress) {
        await loadExternalScript('https://cdn.jsdelivr.net/npm/marked@5.1.2/marked.min.js', 'marked');
        const text = await readFileText(file);
        const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
          body{font-family:Georgia,serif;padding:52px;font-size:13px;line-height:1.8;color:#111;max-width:680px;margin:0 auto;}
          h1{font-size:2em;border-bottom:2px solid #e8c547;padding-bottom:.3em;}
          h2{font-size:1.4em;border-bottom:1px solid #ddd;padding-bottom:.2em;}
          code{background:#f4f4f4;padding:2px 6px;border-radius:3px;font-family:monospace;}
          pre{background:#f4f4f4;padding:12px;border-radius:6px;overflow:auto;}
          blockquote{border-left:4px solid #e8c547;margin:0;padding-left:14px;color:#555;}
          table{border-collapse:collapse;width:100%;} td,th{border:1px solid #ccc;padding:6px 10px;}
          th{background:#f9f4d0;}
        </style></head><body>${window.marked.parse(text)}</body></html>`;
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        onProgress(0.3);
        const pdfBytes = await htmlToPdfViaCanvas(url, onProgress);
        URL.revokeObjectURL(url);
        return [{ name: stripExt(file.name) + '.pdf', blob: new Blob([pdfBytes], { type: 'application/pdf' }) }];
      }
    },

    {
      id: 'html-to-pdf',
      title: 'HTML → PDF',
      desc: 'Convert an HTML file to PDF by rendering it in a hidden frame.',
      icon: 'bi-code-slash',
      cat: 'doc',
      accept: '.html,.htm',
      outputExt: 'pdf',
      options: [],
      async convert(file, opts, onProgress) {
        const text = await readFileText(file);
        const blob = new Blob([text], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        onProgress(0.2);
        const pdfBytes = await htmlToPdfViaCanvas(url, onProgress);
        URL.revokeObjectURL(url);
        return [{ name: stripExt(file.name) + '.pdf', blob: new Blob([pdfBytes], { type: 'application/pdf' }) }];
      }
    },

    // ── Excel ─────────────────────────────────────────────────────────────
    {
      id: 'xlsx-to-csv',
      title: 'Excel → CSV',
      desc: 'Extract the first sheet from an Excel file as a CSV.',
      icon: 'bi-file-earmark-spreadsheet',
      cat: 'doc',
      accept: '.xlsx,.xls',
      outputExt: 'csv',
      options: [],
      async convert(file, opts, onProgress) {
        await loadExternalScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js', 'XLSX');
        const bytes = await readFileBytes(file);
        const wb = window.XLSX.read(bytes, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const csv = window.XLSX.utils.sheet_to_csv(sheet);
        onProgress(1);
        return [{ name: stripExt(file.name) + '.csv', blob: new Blob([csv], { type: 'text/csv' }) }];
      }
    },

    {
      id: 'csv-to-xlsx',
      title: 'CSV → Excel',
      desc: 'Convert a CSV file into a formatted Excel spreadsheet.',
      icon: 'bi-file-earmark-spreadsheet',
      cat: 'doc',
      accept: '.csv',
      outputExt: 'xlsx',
      options: [],
      async convert(file, opts, onProgress) {
        await loadExternalScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js', 'XLSX');
        const text = await readFileText(file);
        const ws = window.XLSX.utils.aoa_to_sheet(parseCSV(text));
        const wb = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        const out = window.XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
        onProgress(1);
        return [{ name: stripExt(file.name) + '.xlsx', blob: new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }) }];
      }
    },
  ];

  // ── Category definitions ──────────────────────────────────────────────────
  const CATEGORIES = [
    { id: 'all',      label: 'All Converters', icon: 'bi-grid-3x3-gap' },
    { id: 'pdf-out',  label: 'PDF → Other',    icon: 'bi-file-earmark-arrow-right' },
    { id: 'pdf-util', label: 'PDF Utilities',  icon: 'bi-tools' },
    { id: 'to-pdf',   label: 'Files → PDF',    icon: 'bi-file-earmark-arrow-down' },
    { id: 'image',    label: 'Image Convert',  icon: 'bi-image' },
    { id: 'doc',      label: 'Documents',      icon: 'bi-file-earmark-text' },
  ];

  // ── State ─────────────────────────────────────────────────────────────────
  let currentCat   = 'all';
  let activeConv   = null;   // currently selected converter definition
  let queuedFiles  = [];     // File objects
  let currentOpts  = {};
  let isConverting = false;

  // ── Boot: inject HTML + wire events ──────────────────────────────────────
  function init() {
    injectHTML();
    bindEvents();
  }

  function injectHTML() {
    // Build category sidebar
    let catHtml = '';
    CATEGORIES.forEach(c => {
      catHtml += `<button class="conv-cat-btn${c.id === 'all' ? ' active' : ''}" data-cat="${c.id}">
        <i class="bi ${c.icon}"></i>${c.label}
      </button>`;
    });

    // Build converter grid (all categories together; JS shows/hides by cat)
    const gridHtml = buildAllGrids();

    const html = `
<!-- ── Converters Button in topbar (inserted by JS) ── -->

<!-- ── Converters Modal ─────────────────────────────────────────────── -->
<div id="converters-backdrop">
  <div id="converters-modal" role="dialog" aria-modal="true" aria-label="File Converters">

    <div class="conv-head">
      <div class="conv-title">
        <i class="bi bi-arrow-left-right"></i> File Converters
      </div>
      <button class="conv-close" id="conv-modal-close" title="Close  Esc">&#x2715;</button>
    </div>

    <div class="conv-body">

      <!-- Sidebar -->
      <div id="conv-cat-sidebar">${catHtml}</div>

      <!-- Main panel -->
      <div id="conv-panel">

        <!-- Converter picker grid (shown by default) -->
        <div id="conv-grid-area">
          ${gridHtml}
        </div>

        <!-- Active converter work area (shown when a card is clicked) -->
        <div id="conv-work-area">
          <button id="conv-back-btn"><i class="bi bi-chevron-left"></i> Back to converters</button>

          <div id="conv-work-header">
            <div id="conv-work-icon"><i class="bi bi-arrow-left-right"></i></div>
            <div>
              <div id="conv-work-title">Converter</div>
              <div id="conv-work-subtitle">Drop files below to convert</div>
            </div>
          </div>

          <!-- Drop zone -->
          <div id="conv-dropzone">
            <i class="bi bi-cloud-upload"></i>
            <div class="cdz-title">Drop files here or click to browse</div>
            <div class="cdz-sub" id="conv-dz-hint">Accepts PDF files</div>
          </div>
          <input type="file" id="conv-file-input">

          <!-- File queue -->
          <div id="conv-file-list"></div>

          <!-- Options -->
          <div id="conv-options" style="display:none">
            <div id="conv-options-title">Options</div>
          </div>

          <!-- Action row -->
          <div id="conv-action-row">
            <button id="conv-convert-btn" disabled>
              <i class="bi bi-play-fill"></i> Convert
            </button>
            <button id="conv-clear-btn"><i class="bi bi-trash2"></i> Clear</button>
            <span id="conv-status-msg"></span>
          </div>

          <!-- Download row -->
          <div id="conv-download-row"></div>

          <!-- Privacy note -->
          <div class="conv-privacy-note">
            <i class="bi bi-shield-lock-fill"></i>
            All conversions happen <strong>100% in your browser</strong> — files never leave your device.
          </div>
        </div>

      </div><!-- #conv-panel -->
    </div><!-- .conv-body -->

  </div><!-- #converters-modal -->
</div><!-- #converters-backdrop -->
`;
    $('body').append(html);

    // Inject topbar button before the existing "Open PDF" button
    const btn = $(`<button id="btn-converters" title="File Converters">
      <i class="bi bi-arrow-left-right"></i> Convert
    </button>`);
    $('#btn-open').before(btn);
  }

  function buildAllGrids() {
    let html = '';
    CATEGORIES.forEach(cat => {
      const convs = cat.id === 'all'
        ? CONVERTERS
        : CONVERTERS.filter(c => c.cat === cat.id);
      if (!convs.length) return;
      html += `<div class="conv-section${cat.id === 'all' ? ' active' : ''}" data-section="${cat.id}">
        <div class="conv-section-title"><i class="bi ${cat.icon}"></i>${cat.label}</div>
        <div class="conv-grid">`;
      convs.forEach(c => {
        html += `<div class="conv-card" data-conv="${c.id}">
          <i class="bi ${c.icon} conv-card-icon"></i>
          <div class="conv-card-title">${c.title}</div>
          <div class="conv-card-desc">${c.desc}</div>
          <i class="bi bi-chevron-right conv-card-arrow"></i>
        </div>`;
      });
      html += `</div></div>`;
    });
    return html;
  }

  // ── Event wiring ──────────────────────────────────────────────────────────
  function bindEvents() {
    // Open / close
    $(document).on('click', '#btn-converters', openModal);
    $(document).on('click', '#conv-modal-close', closeModal);
    $(document).on('click', '#converters-backdrop', function(e) {
      if (e.target === this) closeModal();
    });

    // Category sidebar
    $(document).on('click', '.conv-cat-btn', function() {
      const cat = $(this).data('cat');
      currentCat = cat;
      $('.conv-cat-btn').removeClass('active');
      $(this).addClass('active');
      showGridForCat(cat);
    });

    // Converter card clicked → open work area
    $(document).on('click', '.conv-card', function() {
      const id = $(this).data('conv');
      openConverter(CONVERTERS.find(c => c.id === id));
    });

    // Back button
    $(document).on('click', '#conv-back-btn', closeWorkArea);

    // Drop zone
    $(document).on('click', '#conv-dropzone', function() {
      $('#conv-file-input').click();
    });

    $(document).on('change', '#conv-file-input', function() {
      handleFiles(Array.from(this.files));
      this.value = '';
    });

    // Drag & drop on dropzone
    const dz = document.getElementById('converters-backdrop');
    $(document).on('dragover', '#conv-dropzone', function(e) {
      e.preventDefault(); $(this).addClass('drag-over');
    });
    $(document).on('dragleave', '#conv-dropzone', function() {
      $(this).removeClass('drag-over');
    });
    $(document).on('drop', '#conv-dropzone', function(e) {
      e.preventDefault();
      $(this).removeClass('drag-over');
      handleFiles(Array.from(e.originalEvent.dataTransfer.files));
    });

    // Remove file from queue
    $(document).on('click', '.conv-fi-remove', function() {
      const idx = parseInt($(this).data('idx'));
      queuedFiles.splice(idx, 1);
      renderFileList();
      updateConvertBtn();
    });

    // Convert button
    $(document).on('click', '#conv-convert-btn', runConversion);

    // Clear button
    $(document).on('click', '#conv-clear-btn', function() {
      queuedFiles = [];
      renderFileList();
      $('#conv-download-row').removeClass('visible').empty();
      updateConvertBtn();
      $('#conv-status-msg').text('');
    });

    // Esc key
    $(document).on('keydown', function(e) {
      if (e.key === 'Escape' && $('#converters-backdrop').hasClass('open')) {
        closeModal();
      }
    });
  }

  // ── Modal open / close ────────────────────────────────────────────────────
  function openModal() {
    $('#converters-backdrop').addClass('open');
    $('body').css('overflow', 'hidden');
  }
  function closeModal() {
    $('#converters-backdrop').removeClass('open');
    $('body').css('overflow', '');
  }

  function showGridForCat(cat) {
    closeWorkArea();
    $('.conv-section').removeClass('active');
    $(`.conv-section[data-section="${cat}"]`).addClass('active');
  }

  // ── Work area open / close ────────────────────────────────────────────────
  function openConverter(conv) {
    if (!conv) return;
    activeConv   = conv;
    queuedFiles  = [];
    currentOpts  = {};

    // Update header
    $('#conv-work-icon i').attr('class', 'bi ' + conv.icon);
    $('#conv-work-title').text(conv.title);
    $('#conv-work-subtitle').text(conv.desc);

    // Accept types
    $('#conv-file-input').attr({
      accept: conv.accept,
      multiple: conv.multi ? 'multiple' : null,
    });
    $('#conv-dz-hint').text('Accepts: ' + conv.accept.split(',').join(', '));

    // Render options
    renderOptions(conv.options || []);

    // Clear state
    renderFileList();
    $('#conv-download-row').removeClass('visible').empty();
    $('#conv-status-msg').text('');
    updateConvertBtn();

    // Show work area, hide grid
    $('#conv-grid-area').hide();
    $('#conv-work-area').addClass('visible');
  }

  function closeWorkArea() {
    $('#conv-work-area').removeClass('visible');
    $('#conv-grid-area').show();
    activeConv  = null;
    queuedFiles = [];
    currentOpts = {};
    isConverting = false;
  }

  // ── Options rendering ─────────────────────────────────────────────────────
  function renderOptions(opts) {
    const $opts = $('#conv-options');
    $opts.find('.conv-opt-row').remove();
    if (!opts.length) { $opts.hide(); return; }
    $opts.show();
    opts.forEach(opt => {
      currentOpts[opt.id] = opt.value;
      let control = '';
      if (opt.type === 'range') {
        control = `<div class="conv-opt-range-wrap">
          <input type="range" min="${opt.min}" max="${opt.max}" step="${opt.step}" value="${opt.value}"
            data-opt="${opt.id}" class="conv-opt-range">
          <span class="conv-opt-range-val" data-for="${opt.id}">${opt.display(opt.value)}</span>
        </div>`;
      } else if (opt.type === 'select') {
        const choices = opt.choices.map(ch =>
          `<option value="${ch}"${ch === opt.value ? ' selected' : ''}>${ch}</option>`
        ).join('');
        control = `<select class="conv-opt-select" data-opt="${opt.id}">${choices}</select>`;
      }
      $opts.append(`<div class="conv-opt-row">
        <span class="conv-opt-label">${opt.label}</span>${control}
      </div>`);
    });

    // Bind option changes
    $(document).off('input.convopt change.convopt')
      .on('input.convopt', '.conv-opt-range', function() {
        const id = $(this).data('opt');
        const val = parseFloat($(this).val());
        currentOpts[id] = val;
        const opt = (activeConv.options || []).find(o => o.id === id);
        if (opt) $(`.conv-opt-range-val[data-for="${id}"]`).text(opt.display(val));
      })
      .on('change.convopt', '.conv-opt-select', function() {
        currentOpts[$(this).data('opt')] = $(this).val();
      });
  }

  // ── File handling ─────────────────────────────────────────────────────────
  function handleFiles(files) {
    if (!activeConv) return;
    if (!activeConv.multi) {
      queuedFiles = [files[0]];
    } else {
      files.forEach(f => queuedFiles.push(f));
    }
    renderFileList();
    updateConvertBtn();
  }

  function renderFileList() {
    const $list = $('#conv-file-list').empty();
    queuedFiles.forEach((file, i) => {
      $list.append(`<div class="conv-file-item" id="conv-fi-${i}">
        <i class="bi bi-file-earmark conv-fi-icon"></i>
        <span class="conv-fi-name" title="${file.name}">${file.name}</span>
        <span class="conv-fi-size">${fmtBytes(file.size)}</span>
        <span class="conv-fi-status pending" id="conv-fi-status-${i}">Pending</span>
        <button class="conv-fi-remove" data-idx="${i}" title="Remove"><i class="bi bi-x"></i></button>
      </div>`);
    });
  }

  function updateConvertBtn() {
    $('#conv-convert-btn').prop('disabled', queuedFiles.length === 0 || isConverting);
  }

  // ── Conversion runner ─────────────────────────────────────────────────────
  async function runConversion() {
    if (!activeConv || !queuedFiles.length || isConverting) return;
    isConverting = true;
    updateConvertBtn();
    $('#conv-download-row').removeClass('visible').empty();
    $('#conv-status-msg').text('Converting…');

    const allResults = [];
    try {
      if (activeConv.multi) {
        // Pass all files at once
        setFileStatus(0, 'working');
        const results = await activeConv.convert(queuedFiles, currentOpts, p => {
          queuedFiles.forEach((_, i) => setProgress(i, p));
        });
        queuedFiles.forEach((_, i) => setFileStatus(i, 'done'));
        allResults.push(...results);
      } else {
        // Process each file individually
        for (let i = 0; i < queuedFiles.length; i++) {
          setFileStatus(i, 'working');
          try {
            const results = await activeConv.convert(
              queuedFiles[i], currentOpts,
              p => setProgress(i, p)
            );
            setFileStatus(i, 'done');
            allResults.push(...results);
          } catch (err) {
            setFileStatus(i, 'error', err.message);
          }
        }
      }

      if (allResults.length) {
        renderDownloads(allResults);
        $('#conv-status-msg').text(`✓ ${allResults.length} file(s) ready`);
      }
    } catch (err) {
      $('#conv-status-msg').text('Error: ' + err.message);
      console.error('[Converter]', err);
    }

    isConverting = false;
    updateConvertBtn();
  }

  function setFileStatus(idx, status, msg) {
    const $fi = $(`#conv-fi-${idx}`);
    $fi.removeClass('done error').addClass(status === 'done' ? 'done' : status === 'error' ? 'error' : '');
    const labels = { pending: 'Pending', working: '⟳ Converting…', done: '✓ Done', error: '✗ ' + (msg||'Error') };
    $(`#conv-fi-status-${idx}`).attr('class', 'conv-fi-status ' + status).text(labels[status]);
    if (status !== 'working') setProgress(idx, status === 'done' ? 1 : 0);
  }

  function setProgress(idx, pct) {
    let $bar = $(`#conv-fi-${idx} .conv-progress-bar`);
    if (!$bar.length) {
      $(`#conv-fi-${idx}`).append(`<div class="conv-progress-wrap" style="position:absolute;bottom:0;left:0;right:0;">
        <div class="conv-progress-bar"></div></div>`);
      $(`#conv-fi-${idx}`).css('position','relative');
      $bar = $(`#conv-fi-${idx} .conv-progress-bar`);
    }
    $bar.css('width', (pct * 100) + '%');
  }

  function renderDownloads(results) {
    const $row = $('#conv-download-row').empty();
    results.forEach(r => {
      const url = URL.createObjectURL(r.blob);
      $row.append(`<div class="conv-dl-item">
        <i class="bi bi-file-earmark-check" style="font-size:18px;color:var(--green);flex-shrink:0;"></i>
        <span class="conv-dl-name" title="${r.name}">${r.name}</span>
        <a href="${url}" download="${r.name}" class="conv-dl-btn">
          <i class="bi bi-download"></i> Download
        </a>
      </div>`);
    });
    $row.addClass('visible');
    $row[0].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // ── Utility helpers ───────────────────────────────────────────────────────
  function fmtBytes(b) {
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b/1024).toFixed(1) + ' KB';
    return (b/1048576).toFixed(1) + ' MB';
  }
  function stripExt(name) { return name.replace(/\.[^.]+$/, ''); }

  function readFileBytes(file) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = e => res(new Uint8Array(e.target.result));
      r.onerror = rej;
      r.readAsArrayBuffer(file);
    });
  }

  function readFileText(file) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = e => res(e.target.result);
      r.onerror = rej;
      r.readAsText(file);
    });
  }

  function canvasToBlob(canvas, type, quality) {
    return new Promise(res => canvas.toBlob(res, type, quality));
  }

  function convertImageFormat(file, outType, quality) {
    return new Promise((res, rej) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (outType === 'image/jpeg') {
          ctx.fillStyle = '#fff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        canvasToBlob(canvas, outType, quality).then(res).catch(rej);
      };
      img.onerror = rej;
      img.src = url;
    });
  }

  function svgToPng(svgText, scale) {
    return new Promise((res, rej) => {
      const blob = new Blob([svgText], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const w = (img.naturalWidth || 300) * scale;
        const h = (img.naturalHeight || 300) * scale;
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        canvasToBlob(canvas, 'image/png').then(res).catch(rej);
      };
      img.onerror = rej;
      img.src = url;
    });
  }

  async function htmlToPdfViaCanvas(url, onProgress) {
    // Render HTML in iframe → capture via html2canvas-like approach
    // We use a hidden iframe + canvas capture per "page"
    const { PDFDocument } = PDFLib;
    const doc = await PDFDocument.create();
    return new Promise((res, rej) => {
      const iframe = document.createElement('iframe');
      iframe.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:794px;height:1123px;border:0;visibility:hidden;';
      document.body.appendChild(iframe);
      iframe.onload = async () => {
        try {
          onProgress(0.5);
          // Use html2canvas dynamically
          await loadExternalScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js', 'html2canvas');
          const canvas = await window.html2canvas(iframe.contentDocument.body, {
            width: 794, scale: 1.5, useCORS: true, logging: false,
          });
          document.body.removeChild(iframe);
          onProgress(0.8);
          const imgData = canvas.toDataURL('image/png');
          const imgBytes = dataUrlToBytes(imgData);
          const img = await doc.embedPng(imgBytes);
          const page = doc.addPage([794 * 1.5, canvas.height]);
          page.drawImage(img, { x: 0, y: 0, width: 794 * 1.5, height: canvas.height });
          onProgress(1);
          res(await doc.save());
        } catch(e) { document.body.removeChild(iframe); rej(e); }
      };
      iframe.src = url;
    });
  }

  function dataUrlToBytes(dataUrl) {
    const base64 = dataUrl.split(',')[1];
    const bin = atob(base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }

  function parseCSV(text) {
    return text.trim().split('\n').map(row => {
      const result = [];
      let cur = '', inQ = false;
      for (const ch of row) {
        if (ch === '"') { inQ = !inQ; }
        else if (ch === ',' && !inQ) { result.push(cur.trim()); cur = ''; }
        else cur += ch;
      }
      result.push(cur.trim());
      return result;
    });
  }

  function loadExternalScript(src, globalKey) {
    return new Promise((res, rej) => {
      if (window[globalKey]) { res(); return; }
      const s = document.createElement('script');
      s.src = src;
      s.onload = res;
      s.onerror = () => rej(new Error('Failed to load ' + src));
      document.head.appendChild(s);
    });
  }

  async function ensurePdfjsReady() {
    // pdfjsLib is loaded by the main app; wait briefly if not ready yet
    let tries = 0;
    while (!window.pdfjsLib && tries++ < 30) {
      await new Promise(r => setTimeout(r, 200));
    }
    if (!window.pdfjsLib) throw new Error('pdf.js is not loaded yet');
  }

  // ── Init on DOM ready ─────────────────────────────────────────────────────
  $(document).ready(function() {
    // Delay slightly so main app finishes its own ready handler first
    setTimeout(init, 100);
  });

})(jQuery);
