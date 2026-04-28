// ── pdf.js: load dynamically so we are guaranteed it is ready ─────────────
// Injecting a <script> tag and waiting for its onload event is the only
// reliable way to use the UMD build from a CDN without a module bundler.
let pdfjsLib = null;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

async function initPdfJs() {
  await loadScript('https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js');
  pdfjsLib = window['pdfjs-dist/build/pdf'];
  // When opened as file:// the browser blocks cross-origin web workers.
  // Setting workerSrc to '' makes pdf.js run its worker inline on the main
  // thread (fake worker). Slightly slower but works from any origin.
  pdfjsLib.GlobalWorkerOptions.workerSrc = '';
}

// Boot everything after pdf.js + pdf-lib are both ready
$(document).ready(function () {
  initPdfJs().then(() => {
    setupApp();
  }).catch(err => {
    alert('Failed to load PDF.js: ' + err.message);
  });
});

function setupApp() {

// ── State ─────────────────────────────────────────────────────────────────
const state = {
  pdf: null,
  pdfBytes: null,
  fileName: 'document.pdf',
  currentPage: 1,
  totalPages: 0,
  zoom: 1.0,
  rotation: 0,                     // per-page rotation (degrees)
  rotations: {},
  tool: 'select',
  color: '#e8c547',
  strokeWidth: 2,
  opacity: 1.0,
  fontSize: 16,
  fontFamily: 'Arial',
  annotations: {},                 // { pageNum: [annotDom elements] }
  drawPaths: {},                   // { pageNum: [ImageData or path array] }
  history: [],                     // undo stack
  selectedAnn: null,               // currently selected annotation DOM el
  isDrawing: false,
  activeColorTarget: 'fill',
  fillColor: 'rgba(255,95,107,0.2)',
  strokeColor: '#ff5f6b',
  drawStart: null,
  currentPath: [],
  shapeEl: null,
};

// ── Toast ─────────────────────────────────────────────────────────────────
function toast(msg, type = 'success') {
  const icon = type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill';
  const el = $(`<div class="toast-item ${type}"><i class="bi ${icon}"></i>${msg}</div>`);
  $('#toast-wrap').append(el);
  setTimeout(() => el.fadeOut(300, () => el.remove()), 2800);
}

function setStatus(msg) { $('#status-msg').text(msg); }

// ── File loading ──────────────────────────────────────────────────────────
function loadPDF(file) {
  const reader = new FileReader();
  reader.onload = async (e) => {
    state.pdfBytes = new Uint8Array(e.target.result);
    state.fileName = file.name;
    try {
      state.pdf = await pdfjsLib.getDocument({ data: state.pdfBytes.slice() }).promise;
      state.totalPages = state.pdf.numPages;
      state.currentPage = 1;
      state.annotations = {};
      state.drawPaths   = {};
      state.rotations   = {};
      state.zoom        = 1.0;

      $('#file-name-badge').text(file.name.length > 22
        ? file.name.slice(0, 20) + '…' : file.name);
      $('#stat-pages').text(state.totalPages);
      $('#stat-size').text(formatBytes(file.size));
      $('#btn-save').prop('disabled', false);
      $('#drop-zone').addClass('hidden');
      $('#canvas-container').removeClass('hidden');

      await buildSidebar();
      await renderPage(state.currentPage);
      initHistory();   // baseline snapshot after PDF loads
      toast('PDF loaded — ' + state.totalPages + ' page(s)');
    } catch (err) {
      toast('Failed to load PDF: ' + err.message, 'error');
    }
  };
  reader.readAsArrayBuffer(file);
}

function formatBytes(b) {
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b/1024).toFixed(1) + ' KB';
  return (b/1048576).toFixed(1) + ' MB';
}

// ── Sidebar ───────────────────────────────────────────────────────────────
async function buildSidebar() {
  $('#page-list').empty();
  $('#page-count-badge').text(state.totalPages);
  for (let i = 1; i <= state.totalPages; i++) {
    const page = await state.pdf.getPage(i);
    const vp   = page.getViewport({ scale: 0.18 });
    const c    = $('<canvas>').attr({ width: vp.width, height: vp.height });
    await page.render({ canvasContext: c[0].getContext('2d'), viewport: vp }).promise;
    const thumb = $(`<div class="page-thumb" data-page="${i}">`)
      .append(c)
      .append(`<div class="page-num">${i}</div>`)
      .append(`<button class="del-page" title="Delete page"><i class="bi bi-x"></i></button>`);
    $('#page-list').append(thumb);
  }
  updateSidebarActive();
}

function updateSidebarActive() {
  $('.page-thumb').removeClass('active');
  $(`.page-thumb[data-page="${state.currentPage}"]`).addClass('active');
}

// ── Page render ───────────────────────────────────────────────────────────
async function renderPage(num) {
  if (!state.pdf) return;
  state.currentPage = num;

  const page     = await state.pdf.getPage(num);
  const rotation = (page.rotate + (state.rotations[num] || 0)) % 360;
  const vp       = page.getViewport({ scale: state.zoom, rotation });

  const canvas = document.getElementById('pdf-canvas');
  const ctx    = canvas.getContext('2d');
  canvas.width  = vp.width;
  canvas.height = vp.height;

  const drawCanvas = document.getElementById('draw-canvas');
  drawCanvas.width  = vp.width;
  drawCanvas.height = vp.height;

  await page.render({ canvasContext: ctx, viewport: vp }).promise;

  // Restore freehand drawings
  restoreDrawings(num);

  // Resize annotation layer
  $('#annotation-layer').css({ width: vp.width, height: vp.height });

  // Show annotations for this page
  $('#annotation-layer').empty();
  const anns = state.annotations[num] || [];
  anns.forEach(a => $('#annotation-layer').append(a));

  // Container size
  $('#canvas-container').css({ width: vp.width, height: vp.height });

  updateNavButtons();
  updateSidebarActive();
  updateCounts();

  $('#page-indicator').text(`${num} / ${state.totalPages}`);
  $('#cur-page-status').text(`Page: ${num}/${state.totalPages}`);
  $('#zoom-val').text(Math.round(state.zoom * 100) + '%');
}

function updateNavButtons() {
  $('#prev-page').prop('disabled', state.currentPage <= 1);
  $('#next-page').prop('disabled', state.currentPage >= state.totalPages);
}

function updateCounts() {
  let total = 0;
  Object.values(state.annotations).forEach(a => total += a.length);
  $('#stat-anns').text(total);
}

// ── Drawing (freehand) ────────────────────────────────────────────────────
let drawCtx = null;

function getDrawCtx() {
  if (!drawCtx) drawCtx = document.getElementById('draw-canvas').getContext('2d');
  return drawCtx;
}

function restoreDrawings(pageNum) {
  drawCtx = document.getElementById('draw-canvas').getContext('2d');
  drawCtx.clearRect(0, 0, drawCtx.canvas.width, drawCtx.canvas.height);
  const paths = state.drawPaths[pageNum] || [];
  paths.forEach(p => replayPath(drawCtx, p));
}

function replayPath(ctx, p) {
  ctx.save();
  ctx.globalAlpha = p.opacity;
  ctx.strokeStyle = p.color;
  ctx.lineWidth   = p.width;
  ctx.lineCap     = 'round';
  ctx.lineJoin    = 'round';
  ctx.beginPath();
  p.pts.forEach((pt, i) => i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y));
  ctx.stroke();
  ctx.restore();
}

// ── Annotation helpers ────────────────────────────────────────────────────
function addAnnotation(el) {
  const page = state.currentPage;
  if (!state.annotations[page]) state.annotations[page] = [];
  saveHistory();   // snapshot before adding so undo removes this annotation
  state.annotations[page].push(el[0]);
  $('#annotation-layer').append(el);
  updateCounts();
}

function makeMovable(el) {
  let ox, oy, mx, my, moving = false;
  el.on('mousedown', function(e) {
    if (state.tool !== 'select') return;
    if ($(e.target).hasClass('ann-del') || $(e.target).closest('.ann-del').length) return;
    e.stopPropagation();
    state.selectedAnn = el[0];
    moving = true;
    ox = e.clientX - el.offset().left;
    oy = e.clientY - el.offset().top;
    $(document).on('mousemove.ann', function(e) {
      if (!moving) return;
      const layer = $('#annotation-layer').offset();
      el.css({
        left: e.clientX - layer.left - ox,
        top:  e.clientY - layer.top  - oy,
      });
    });
    $(document).on('mouseup.ann', function() {
      moving = false;
      $(document).off('.ann');
    });
  });
  // Delete button
  const delBtn = $('<button class="ann-del" title="Delete (Del)">&#x2715;</button>');
  delBtn.on('click', function(e) {
    e.stopPropagation();
    el[0].remove();
    const page = state.currentPage;
    state.annotations[page] = (state.annotations[page] || []).filter(a => a !== el[0]);
    updateCounts();
  });
  el.append(delBtn);
}

// ── Tool handlers ─────────────────────────────────────────────────────────
function getLayerPos(e) {
  const off = $('#annotation-layer').offset();
  return { x: e.clientX - off.left, y: e.clientY - off.top };
}

// ── Text tool ─────────────────────────────────────────────────────────────
//
//  Architecture:
//    .ann-text-wrap   — outer wrapper, positioned on annotation-layer, draggable
//      .ann-text-toolbar  — floating mini-toolbar (bold/italic/size/color/align)
//      .ann-text          — the contenteditable region ONLY — no delete btn inside
//      .ann-del           — outside the editable region, no caret interference
//
//  States:
//    .editing  (on wrap)  — toolbar visible, editable
//    .frozen   (on text)  — border invisible, cursor=move, not editable
//
//  Caret fix: delete button is appended to the WRAP, not to the text div,
//  so the browser never sees it as editable content.
// ──────────────────────────────────────────────────────────────────────────

let currentFontSize = 16;   // tracks live font size for toolbar +/-

function placeTextBox(pos) {
  const fs   = state.fontSize || 16;
  const col  = state.strokeColor || '#111111';

  // ── Outer wrapper (this is what gets moved, stored as annotation) ────
  const wrap = $('<div class="ann-text-wrap">').css({
    left: pos.x,
    top:  pos.y,
  });

  // ── Floating mini-toolbar ────────────────────────────────────────────
  const toolbar = $('<div class="ann-text-toolbar">');
  const makeTb  = (icon, title, action) =>
    $(`<button class="ann-tb-btn" title="${title}"><i class="bi bi-${icon}"></i></button>`)
      .on('mousedown', function(e) {
        e.preventDefault();   // don't blur the text box
        action(this);
      });

  const sizeDisplay = $('<span class="ann-tb-size">' + fs + 'px</span>');

  const btnBold   = makeTb('type-bold',    'Bold (Ctrl+B)',   () => document.execCommand('bold'));
  const btnItalic = makeTb('type-italic',  'Italic (Ctrl+I)', () => document.execCommand('italic'));
  const btnUnder  = makeTb('type-underline','Underline (Ctrl+U)', () => document.execCommand('underline'));
  const tbSep1    = $('<div class="ann-tb-sep">');
  const btnSmall  = makeTb('dash-lg', 'Smaller font', () => {
    currentFontSize = Math.max(8, currentFontSize - 2);
    textEl.css('font-size', currentFontSize + 'px');
    sizeDisplay.text(currentFontSize + 'px');
  });
  const btnLarge  = makeTb('plus-lg', 'Larger font', () => {
    currentFontSize = Math.min(120, currentFontSize + 2);
    textEl.css('font-size', currentFontSize + 'px');
    sizeDisplay.text(currentFontSize + 'px');
  });
  const tbSep2    = $('<div class="ann-tb-sep">');
  const btnAlignL = makeTb('text-left',   'Align left',   () => { document.execCommand('justifyLeft');   btnAlignL.addClass('active'); btnAlignC.removeClass('active'); btnAlignR.removeClass('active'); });
  const btnAlignC = makeTb('text-center', 'Align center', () => { document.execCommand('justifyCenter'); btnAlignC.addClass('active'); btnAlignL.removeClass('active'); btnAlignR.removeClass('active'); });
  const btnAlignR = makeTb('text-right',  'Align right',  () => { document.execCommand('justifyRight');  btnAlignR.addClass('active'); btnAlignL.removeClass('active'); btnAlignC.removeClass('active'); });
  btnAlignL.addClass('active');

  // Mini font selector for the floating toolbar
  const tbFontSelect = $('<select class="ann-tb-font-sel" title="Change font">')
    .css({
      height: '22px', fontSize: '11px', border: '1px solid var(--border2)',
      borderRadius: '4px', background: 'var(--surface2)', color: 'var(--text)',
      fontFamily: 'var(--font-body)', padding: '0 4px', cursor: 'pointer',
      outline: 'none', maxWidth: '130px',
    });
  const FONTS = [
    // System
    ['Arial, sans-serif','Arial'],
    ['"Arial Black", Gadget, sans-serif','Arial Black'],
    ['Helvetica, Arial, sans-serif','Helvetica'],
    ['Verdana, Geneva, sans-serif','Verdana'],
    ['Tahoma, Geneva, sans-serif','Tahoma'],
    ['"Trebuchet MS", Helvetica, sans-serif','Trebuchet MS'],
    ['Calibri, Candara, Segoe, sans-serif','Calibri'],
    ['"Segoe UI", Tahoma, Geneva, sans-serif','Segoe UI'],
    ['"Times New Roman", Times, serif','Times New Roman'],
    ['Georgia, serif','Georgia'],
    ['"Palatino Linotype", Palatino, serif','Palatino'],
    ['Garamond, serif','Garamond'],
    ['"Courier New", Courier, monospace','Courier New'],
    ['Consolas, "Courier New", monospace','Consolas'],
    ['Impact, Charcoal, sans-serif','Impact'],
    ['"Comic Sans MS", cursive','Comic Sans MS'],
    // Google Sans-Serif
    ['"Roboto", sans-serif','Roboto'],
    ['"Open Sans", sans-serif','Open Sans'],
    ['"Lato", sans-serif','Lato'],
    ['"Nunito", sans-serif','Nunito'],
    ['"Poppins", sans-serif','Poppins'],
    ['"Raleway", sans-serif','Raleway'],
    ['"Montserrat", sans-serif','Montserrat'],
    ['"Source Sans Pro", sans-serif','Source Sans Pro'],
    ['"Ubuntu", sans-serif','Ubuntu'],
    ['"Inter", sans-serif','Inter'],
    ['"Figtree", sans-serif','Figtree'],
    ['"DM Sans", sans-serif','DM Sans'],
    ['"Outfit", sans-serif','Outfit'],
    ['"Manrope", sans-serif','Manrope'],
    ['"Rubik", sans-serif','Rubik'],
    ['"Jost", sans-serif','Jost'],
    ['"Exo 2", sans-serif','Exo 2'],
    // Google Serif
    ['"Lora", serif','Lora'],
    ['"Merriweather", serif','Merriweather'],
    ['"Playfair Display", serif','Playfair Display'],
    ['"Cormorant", serif','Cormorant'],
    ['"EB Garamond", serif','EB Garamond'],
    ['"Libre Baskerville", serif','Libre Baskerville'],
    ['"Crimson Text", serif','Crimson Text'],
    ['"Noto Serif", serif','Noto Serif'],
    ['"PT Serif", serif','PT Serif'],
    // Google Mono
    ['"Fira Code", monospace','Fira Code'],
    ['"JetBrains Mono", monospace','JetBrains Mono'],
    ['"Source Code Pro", monospace','Source Code Pro'],
    ['"Space Mono", monospace','Space Mono'],
    ['"Inconsolata", monospace','Inconsolata'],
    ['"IBM Plex Mono", monospace','IBM Plex Mono'],
    // Google Display
    ['"Bebas Neue", cursive','Bebas Neue'],
    ['"Oswald", sans-serif','Oswald'],
    ['"Righteous", cursive','Righteous'],
    ['"Orbitron", sans-serif','Orbitron'],
    ['"Audiowide", sans-serif','Audiowide'],
    ['"Cinzel", serif','Cinzel'],
    ['"Josefin Sans", sans-serif','Josefin Sans'],
    // Google Handwriting
    ['"Pacifico", cursive','Pacifico'],
    ['"Dancing Script", cursive','Dancing Script'],
    ['"Caveat", cursive','Caveat'],
    ['"Satisfy", cursive','Satisfy'],
    ['"Kalam", cursive','Kalam'],
    ['"Handlee", cursive','Handlee'],
    ['"Patrick Hand", cursive','Patrick Hand'],
    ['"Indie Flower", cursive','Indie Flower'],
    ['"Permanent Marker", cursive','Permanent Marker'],
    ['"Shadows Into Light", cursive','Shadows Into Light'],
  ];
  FONTS.forEach(([val, label]) => {
    tbFontSelect.append($('<option>').val(val).text(label).css('font-family', val));
  });
  tbFontSelect.val(state.fontFamily || 'Arial');
  tbFontSelect.on('mousedown', e => e.stopPropagation());
  tbFontSelect.on('change', function(e) {
    e.preventDefault();
    textEl.css('font-family', $(this).val());
    textEl[0].focus();
  });
  const tbSep3 = $('<div class="ann-tb-sep">');
  toolbar.append(btnBold, btnItalic, btnUnder, tbSep1, btnSmall, sizeDisplay, btnLarge, tbSep2, btnAlignL, btnAlignC, btnAlignR, tbSep3, tbFontSelect);

  // ── Editable text region ──────────────────────────────────────────────
  const textEl = $('<div class="ann-text" contenteditable="true">')
    .css({
      fontSize:   fs + 'px',
      fontFamily: state.fontFamily || 'Arial',
      color:      col,
      minWidth:   '120px',
      minHeight:  (fs * 1.8) + 'px',
    });
  currentFontSize = fs;

  // ── Blur: freeze ──────────────────────────────────────────────────────
  textEl.on('blur', function() {
    // Small delay so toolbar button mousedown doesn't trigger freeze
    setTimeout(() => {
      if ($(document.activeElement).closest('.ann-text-toolbar').length) return;
      const text = $(this).text().trim();
      if (!text) {
        wrap[0].remove();
        const page = state.currentPage;
        state.annotations[page] = (state.annotations[page] || []).filter(a => a !== wrap[0]);
        updateCounts();
        return;
      }
      wrap.removeClass('editing');
      $(this).addClass('frozen').attr('contenteditable', 'false');
      saveHistory();
    }, 120);
  });

  // ── Focus: enter editing mode ─────────────────────────────────────────
  textEl.on('focus', function() {
    wrap.addClass('editing');
  });

  // ── Double-click on frozen text → re-edit ────────────────────────────
  textEl.on('dblclick', function(e) {
    e.stopPropagation();
    $(this).removeClass('frozen').attr('contenteditable', 'true');
    wrap.addClass('editing');
    // Place caret at the END of content
    const range = document.createRange();
    const sel   = window.getSelection();
    range.selectNodeContents(this);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
    $(this).focus();
  });

  // ── Delete button — appended to WRAP, NOT to textEl ──────────────────
  const delBtn = $('<button class="ann-del" title="Delete (Del)">&#x2715;</button>');
  delBtn.on('click', function(e) {
    e.stopPropagation();
    wrap[0].remove();
    const page = state.currentPage;
    state.annotations[page] = (state.annotations[page] || []).filter(a => a !== wrap[0]);
    updateCounts();
  });

  // ── Drag: move the wrapper ────────────────────────────────────────────
  let dragging = false, odx, ody;
  wrap.on('mousedown', function(e) {
    if (state.tool !== 'select') return;
    if ($(e.target).hasClass('ann-del') || $(e.target).closest('.ann-del').length) return;
    if ($(e.target).hasClass('ann-text') && !$(e.target).hasClass('frozen')) return;
    if ($(e.target).closest('.ann-text-toolbar').length) return;
    e.stopPropagation();
    state.selectedAnn = wrap[0];
    dragging = true;
    odx = e.clientX - wrap.offset().left;
    ody = e.clientY - wrap.offset().top;
    $(document).on('mousemove.textwrap', function(e) {
      if (!dragging) return;
      const lOff = $('#annotation-layer').offset();
      wrap.css({ left: e.clientX - lOff.left - odx, top: e.clientY - lOff.top - ody });
    });
    $(document).on('mouseup.textwrap', function() {
      dragging = false;
      $(document).off('.textwrap');
    });
  });

  // ── Assemble: toolbar + textEl → wrap, del outside textEl ────────────
  wrap.append(toolbar).append(textEl).append(delBtn);

  // Register the WRAP as the annotation (not textEl)
  const page = state.currentPage;
  if (!state.annotations[page]) state.annotations[page] = [];
  saveHistory();
  state.annotations[page].push(wrap[0]);
  $('#annotation-layer').append(wrap);
  updateCounts();

  // Focus with caret at START on fresh box
  setTimeout(() => {
    textEl[0].focus();
    // Place caret at very beginning
    const range = document.createRange();
    const sel   = window.getSelection();
    range.setStart(textEl[0], 0);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }, 0);
}

// Click on empty canvas area → place text box
$('#annotation-layer').on('click', function(e) {
  if (state.tool !== 'text') return;
  if ($(e.target).closest('.ann-text-wrap').length) return;
  if ($(e.target).closest('.annotation').length) return;
  // In free-type mode, default to near-black text so it's readable on any bg
  if (state._freeTypeMode && (!state.strokeColor || state.strokeColor === '#ff5f6b')) {
    state.strokeColor = '#111111';
    state.color       = '#111111';
  }
  placeTextBox(getLayerPos(e));
});

// Shape drawing (rect, circle, highlight) + freehand
let shapeStart = null;
let tempShape  = null;

// ── helper: position relative to the canvas container ───────────────────
function getCanvasPos(e) {
  const off = $('#canvas-container').offset();
  return {
    x: e.clientX - off.left,
    y: e.clientY - off.top,
  };
}

// ── Freehand draw — events on draw-canvas directly ───────────────────────
$('#draw-canvas').on('mousedown', function(e) {
  if (state.tool !== 'draw') return;
  e.preventDefault();
  const pos = getCanvasPos(e);
  state.isDrawing   = true;
  state.currentPath = [pos];
  drawCtx = this.getContext('2d');
  drawCtx.beginPath();
  drawCtx.moveTo(pos.x, pos.y);
});

// ── Shape drawing — events on annotation-layer ───────────────────────────
$('#annotation-layer').on('mousedown', function(e) {
  if (!['rect','circle','highlight'].includes(state.tool)) return;
  if ($(e.target).closest('.annotation').length) return;
  e.preventDefault();
  const pos = getLayerPos(e);
  shapeStart = pos;
  tempShape = $('<div class="annotation">')
    .css({ left: pos.x, top: pos.y, width: 0, height: 0, pointerEvents: 'none' });
  if (state.tool === 'highlight') {
    tempShape.addClass('ann-highlight').css('background', state.strokeColor);
  } else {
    // Apply fill (transparent or color) and stroke separately
    const bgColor = state.noFill ? 'transparent' : state.fillColor;
    tempShape.addClass('ann-shape')
      .css({
        'background':    bgColor,
        'border-color':  state.strokeColor,
        'border-width':  Math.max(1, state.strokeWidth) + 'px',
        'border-style':  'solid',
      });
    if (state.tool === 'circle') tempShape.addClass('circle');
  }
  $('#annotation-layer').append(tempShape);
});

// ── Global mousemove — handles both draw and shape resize ────────────────
$(document).on('mousemove', function(e) {
  // Freehand stroke
  if (state.tool === 'draw' && state.isDrawing && drawCtx) {
    const pos = getCanvasPos(e);
    state.currentPath.push(pos);
    drawCtx.globalAlpha = state.opacity;
    drawCtx.strokeStyle = state.color;
    drawCtx.lineWidth   = state.strokeWidth;
    drawCtx.lineCap     = 'round';
    drawCtx.lineJoin    = 'round';
    drawCtx.lineTo(pos.x, pos.y);
    drawCtx.stroke();
    return;
  }
  // Shape resize
  if (!shapeStart || !tempShape) return;
  const pos = getLayerPos(e);
  const x = Math.min(pos.x, shapeStart.x);
  const y = Math.min(pos.y, shapeStart.y);
  const w = Math.abs(pos.x - shapeStart.x);
  const h = Math.abs(pos.y - shapeStart.y);
  tempShape.css({ left: x, top: y, width: w, height: h });
});

// ── Global mouseup — commit stroke or shape ──────────────────────────────
$(document).on('mouseup', function(e) {
  // Commit freehand path
  if (state.tool === 'draw' && state.isDrawing) {
    state.isDrawing = false;
    if (state.currentPath.length > 1) {
      const page = state.currentPage;
      if (!state.drawPaths[page]) state.drawPaths[page] = [];
      saveHistory();   // snapshot BEFORE pushing so undo removes this stroke
      state.drawPaths[page].push({
        pts:     state.currentPath,
        color:   state.color,
        width:   state.strokeWidth,
        opacity: state.opacity,
      });
    }
    state.currentPath = [];
    return;
  }
  // Commit shape
  if (!shapeStart || !tempShape) return;
  const pos = getLayerPos(e);
  const w = Math.abs(pos.x - shapeStart.x);
  const h = Math.abs(pos.y - shapeStart.y);
  if (w > 4 && h > 4) {
    tempShape.css('pointer-events', 'all');
    makeMovable(tempShape);
    addAnnotation(tempShape);
  } else {
    tempShape.remove();
  }
  shapeStart = null;
  tempShape  = null;
});

// Erase
$('#annotation-layer').on('click', '.annotation, .ann-text-wrap', function(e) {
  if (state.tool !== 'erase') return;
  $(this).remove();
  const page = state.currentPage;
  state.annotations[page] = (state.annotations[page] || []).filter(a => a !== this);
  updateCounts();
});

// ── History ───────────────────────────────────────────────────────────────
// ── Save a full snapshot BEFORE any action (call BEFORE mutating state) ──
function saveHistory() {
  const snap = {
    annotations: {},
    drawPaths: {},
  };
  // Snapshot annotation HTML for every page
  Object.keys(state.annotations).forEach(p => {
    snap.annotations[p] = state.annotations[p].map(el => el.outerHTML);
  });
  // Deep-clone drawPaths (arrays of plain objects — safe to JSON-round-trip)
  Object.keys(state.drawPaths).forEach(p => {
    snap.drawPaths[p] = state.drawPaths[p].map(path => ({
      color:   path.color,
      width:   path.width,
      opacity: path.opacity,
      pts:     path.pts.map(pt => ({ x: pt.x, y: pt.y })),
    }));
  });
  // Snapshot imgDataStore references (dataURLs are immutable so reference is fine)
  snap.imgDataStore = Object.assign({}, imgDataStore);
  state.history.push(JSON.stringify(snap));
  if (state.history.length > 50) state.history.shift();
}

// ── Record initial empty state on app boot so first undo has a target ─────
function initHistory() {
  state.history = [];
  saveHistory();   // push the "empty canvas" baseline snapshot
}

function undo() {
  if (state.history.length < 2) {
    toast('Nothing to undo', 'error');
    return;
  }
  // Discard current state
  state.history.pop();
  // Restore previous state
  const snap = JSON.parse(state.history[state.history.length - 1]);

  // Restore annotations (re-hydrate HTML strings → DOM nodes)
  state.annotations = {};
  Object.keys(snap.annotations).forEach(p => {
    state.annotations[p] = snap.annotations[p].map(html => $(html)[0]);
  });

  // Restore freehand draw paths
  state.drawPaths = {};
  Object.keys(snap.drawPaths).forEach(p => {
    state.drawPaths[p] = snap.drawPaths[p];
  });
  // Restore image data references
  if (snap.imgDataStore) {
    Object.assign(imgDataStore, snap.imgDataStore);
  }

  renderPage(state.currentPage);
  toast('Undone (' + (state.history.length - 1) + ' left)');
}

// ── Helper: rasterise any image via <canvas> → PNG bytes for pdf-lib ───────
function embedAsCanvas(pdfDoc, dataUrl, w, h) {
  return new Promise((resolve, reject) => {
    const tmpImg = new Image();
    tmpImg.onload = async () => {
      const c   = document.createElement('canvas');
      c.width   = Math.round(w);
      c.height  = Math.round(h);
      c.getContext('2d').drawImage(tmpImg, 0, 0, c.width, c.height);
      const pngUrl   = c.toDataURL('image/png');
      const resp     = await fetch(pngUrl);
      const pngBytes = await resp.arrayBuffer();
      resolve(await pdfDoc.embedPng(pngBytes));
    };
    tmpImg.onerror = reject;
    tmpImg.src = dataUrl;
  });
}

// ── Saving ────────────────────────────────────────────────────────────────
async function savePDF() {
  if (!state.pdfBytes) return;
  setStatus('Saving…');
  try {
    const { PDFDocument, rgb, StandardFonts } = PDFLib;
    const pdfDoc = await PDFDocument.load(state.pdfBytes);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pages = pdfDoc.getPages();

    for (let i = 1; i <= state.totalPages; i++) {
      const page     = pages[i - 1];
      const { width, height } = page.getSize();

      // Freehand paths — rasterize to image
      const paths = state.drawPaths[i] || [];
      if (paths.length) {
        const tmp = document.createElement('canvas');
        tmp.width  = width;
        tmp.height = height;
        const ctx  = tmp.getContext('2d');
        paths.forEach(p => replayPath(ctx, p));
        const dataUrl  = tmp.toDataURL('image/png');
        const imgBytes = await fetch(dataUrl).then(r => r.arrayBuffer());
        const img = await pdfDoc.embedPng(imgBytes);
        page.drawImage(img, { x: 0, y: 0, width, height, opacity: 1 });
      }

      // DOM annotations (text + shapes)
      const anns = state.annotations[i] || [];
      const scale = 1 / state.zoom;

      for (const el of anns) {
        const $el  = $(el);
        const l    = parseFloat($el.css('left'))  * scale;
        const t    = parseFloat($el.css('top'))   * scale;
        const pdfY = height - t;

        if ($el.hasClass('ann-text') || $el.hasClass('ann-text-wrap')) {
          // Handle both old-style .ann-text and new-style .ann-text-wrap
          const textNode = $el.hasClass('ann-text-wrap') ? $el.find('.ann-text') : $el;
          const txt = textNode.text() || '';
          const fs  = (parseFloat(textNode.css('font-size')) || 16) * scale;
          const ff  = textNode.css('font-family') || 'Arial';
          const col = hexToRgb(textNode.css('color') || '#111111');
          if (txt.trim()) {
            // Split by newlines to handle multi-line
            const lines = txt.split('\n');
            lines.forEach((line, idx) => {
              if (!line.trim()) return;
              page.drawText(line, {
                x: l, y: pdfY - fs - (idx * fs * 1.4),
                size: Math.max(6, fs),
                font: helvetica,
                color: rgb(col.r, col.g, col.b),
                opacity: parseFloat(textNode.css('opacity')) || 1,
              });
            });
          }
        } else if ($el.hasClass('ann-highlight') || $el.hasClass('ann-shape')) {
          const w   = parseFloat($el.css('width'))  * scale;
          const h   = parseFloat($el.css('height')) * scale;

          if ($el.hasClass('ann-highlight')) {
            const col = hexToRgb($el.css('background-color') || '#e8c547');
            page.drawRectangle({
              x: l, y: pdfY - h, width: w, height: h,
              color: rgb(col.r, col.g, col.b), opacity: 0.35,
            });
          } else {
            // Read fill and stroke independently
            const bgRaw  = $el.css('background-color') || 'transparent';
            const hasFill = bgRaw !== 'transparent' && bgRaw !== 'rgba(0, 0, 0, 0)';
            const bc     = hexToRgb($el.css('border-color') || '#ff5f6b');
            const bw     = (parseFloat($el.css('border-width')) || 2) * scale;
            const fillCol = hasFill ? hexToRgb(bgRaw) : null;
            // Compute fill opacity from rgba if present
            const fillOp  = hasFill ? parseCssAlpha(bgRaw) : 0;

            if ($el.hasClass('circle')) {
              page.drawEllipse({
                x: l + w/2, y: pdfY - h/2,
                xScale: w/2, yScale: h/2,
                ...(hasFill ? { color: rgb(fillCol.r, fillCol.g, fillCol.b), opacity: fillOp } : {}),
                borderColor: rgb(bc.r, bc.g, bc.b),
                borderWidth: bw,
              });
            } else {
              page.drawRectangle({
                x: l, y: pdfY - h, width: w, height: h,
                ...(hasFill ? { color: rgb(fillCol.r, fillCol.g, fillCol.b), opacity: fillOp } : {}),
                borderColor: rgb(bc.r, bc.g, bc.b),
                borderWidth: bw,
              });
            }
          }

        } else if ($el.hasClass('ann-image')) {
          // ── Embed inserted image into the PDF ─────────────────────────
          const imgId   = $el.attr('data-img-id');
          const imgData = imgDataStore[imgId];
          if (imgData) {
            const w = parseFloat($el.css('width'))  * scale;
            const h = parseFloat($el.css('height')) * scale;
            try {
              // Fetch the dataURL as an ArrayBuffer so pdf-lib can embed it
              const resp     = await fetch(imgData.dataUrl);
              const imgBytes = await resp.arrayBuffer();
              let   pdfImg;
              // pdf-lib supports PNG and JPEG natively
              const mt = imgData.mimeType;
              if (mt === 'image/jpeg' || mt === 'image/jpg') {
                pdfImg = await pdfDoc.embedJpg(imgBytes);
              } else {
                // PNG, WebP, GIF, SVG — convert via off-screen canvas → PNG
                pdfImg = await embedAsCanvas(pdfDoc, imgData.dataUrl, w, h);
              }
              page.drawImage(pdfImg, {
                x: l, y: pdfY - h, width: w, height: h, opacity: 1,
              });
            } catch(imgErr) {
              console.warn('Could not embed image:', imgErr);
            }
          }
        }
      }
    }

    const bytes = await pdfDoc.save();
    const blob  = new Blob([bytes], { type: 'application/pdf' });
    const url   = URL.createObjectURL(blob);
    const a     = document.createElement('a');
    a.href      = url;
    a.download  = state.fileName.replace('.pdf', '') + '_edited.pdf';
    a.click();
    URL.revokeObjectURL(url);
    setStatus('');
    toast('PDF saved ✔');
  } catch(err) {
    setStatus('');
    toast('Save error: ' + err.message, 'error');
    console.error(err);
  }
}

function parseCssAlpha(cssColor) {
  // Extract alpha from rgba(r,g,b,a) string, default 1
  const m = cssColor.match(/rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*([\d.]+))?\s*\)/);
  return m && m[1] !== undefined ? parseFloat(m[1]) : 1;
}

function hexToRgb(cssColor) {
  // handles hex and rgb() formats
  if (cssColor.startsWith('#')) {
    const r = parseInt(cssColor.slice(1,3),16)/255;
    const g = parseInt(cssColor.slice(3,5),16)/255;
    const b = parseInt(cssColor.slice(5,7),16)/255;
    return { r, g, b };
  }
  const m = cssColor.match(/\d+/g);
  if (m) return { r: +m[0]/255, g: +m[1]/255, b: +m[2]/255 };
  return { r: 0, g: 0, b: 0 };
}

// ── Zoom ──────────────────────────────────────────────────────────────────
function setZoom(z) {
  state.zoom = Math.max(0.3, Math.min(3.0, z));
  renderPage(state.currentPage);
}
$('#zoom-in').on('click', () => setZoom(state.zoom + 0.15));
$('#zoom-out').on('click', () => setZoom(state.zoom - 0.15));
$('#zoom-fit').on('click', () => {
  const wrap = $('#canvas-wrap');
  const pad  = 56;
  state.pdf.getPage(state.currentPage).then(page => {
    const vp = page.getViewport({ scale: 1 });
    const z  = Math.min((wrap.width() - pad) / vp.width, (wrap.height() - pad) / vp.height);
    setZoom(z);
  });
});

// Mouse-wheel zoom
$('#canvas-wrap').on('wheel', function(e) {
  if (!e.ctrlKey && !e.metaKey) return;
  e.preventDefault();
  setZoom(state.zoom + (e.originalEvent.deltaY < 0 ? 0.1 : -0.1));
}, { passive: false });

// ── Rotation ──────────────────────────────────────────────────────────────
$('#btn-rotate-cw').on('click', () => {
  state.rotations[state.currentPage] = ((state.rotations[state.currentPage] || 0) + 90) % 360;
  renderPage(state.currentPage);
  toast('Rotated 90° CW');
});
$('#btn-rotate-ccw').on('click', () => {
  state.rotations[state.currentPage] = ((state.rotations[state.currentPage] || 0) + 270) % 360;
  renderPage(state.currentPage);
  toast('Rotated 90° CCW');
});

// ── Image insertion ──────────────────────────────────────────────────────────

// Store image data-URLs keyed by annotation element id so we can
// embed them into the PDF on save without re-reading the file.
const imgDataStore = {};   // { annId: dataURL }
let   imgIdCounter  = 0;

function insertImageFromDataUrl(dataUrl, mimeType) {
  if (!state.pdf) { toast('Open a PDF first', 'error'); return; }

  const annId = 'img-' + (++imgIdCounter);
  imgDataStore[annId] = { dataUrl, mimeType };

  // Default size: 200×200, user can resize
  const defaultW = 200;
  const defaultH = 200;

  // Place near centre of visible canvas area
  const wrap   = $('#canvas-wrap');
  const cont   = $('#canvas-container');
  const contOff = cont.offset();
  const wrapOff = wrap.offset();
  const cx = (wrap.width()  / 2) - (defaultW / 2);
  const cy = (wrap.height() / 2) - (defaultH / 2);

  const el = $('<div class="annotation ann-image">')
    .attr('data-img-id', annId)
    .css({ left: cx, top: cy, width: defaultW, height: defaultH });

  const img = $('<img>').attr('src', dataUrl).attr('draggable', 'false');
  const handle = $('<div class="img-resize-handle"><i class="bi bi-arrows-angle-expand"></i></div>');
  el.append(img).append(handle);

  // ── Resize handle ───────────────────────────────────────────────────
  handle.on('mousedown', function(e) {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = el.width();
    const startH = el.height();

    $(document).on('mousemove.resize', function(e) {
      const newW = Math.max(40, startW + (e.clientX - startX));
      const newH = Math.max(40, startH + (e.clientY - startY));
      el.css({ width: newW, height: newH });
    });
    $(document).on('mouseup.resize', function() {
      $(document).off('.resize');
    });
  });

  makeMovable(el);
  addAnnotation(el);
  toast('Image inserted — drag to move, corner to resize');
}

// Button click → trigger file picker
$('#btn-insert-image').on('click', function() {
  if (!state.pdf) { toast('Open a PDF first', 'error'); return; }
  $('#img-file-input').val('').click();
});

// File selected → read as dataURL → insert
$('#img-file-input').on('change', function() {
  const file = this.files[0];
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) {
    toast('Image too large (max 10 MB)', 'error'); return;
  }
  const reader = new FileReader();
  reader.onload = e => insertImageFromDataUrl(e.target.result, file.type);
  reader.readAsDataURL(file);
  this.value = '';
});

// ── Tool switching ────────────────────────────────────────────────────────
$('.tool-btn[data-tool]').on('click', function() {
  const tool = $(this).data('tool');
  state.tool = tool;
  $('.tool-btn[data-tool]').removeClass('active');
  $(this).addClass('active');
  $('#cur-tool-status').text('Tool: ' + $(this).text().trim());

  const layer = $('#annotation-layer');
  // Reset all pointer-event states
  layer.removeClass('draw-mode text-mode erase-mode');
  $('#draw-canvas').removeClass('active').css('pointer-events', 'none');
  layer.css('pointer-events', 'none');

  if (tool === 'draw') {
    // Freehand: only draw-canvas gets events
    $('#draw-canvas').addClass('active').css('pointer-events', 'all');
  } else if (tool === 'text') {
    layer.addClass('text-mode').css('pointer-events', 'all');
  } else if (tool === 'erase') {
    layer.addClass('erase-mode').css('pointer-events', 'all');
  } else if (['rect','circle','highlight'].includes(tool)) {
    layer.addClass('draw-mode').css('pointer-events', 'all');
  } else if (tool === 'select') {
    layer.css('pointer-events', 'all');
  }
});

// ══════════════════════════════════════════════════════════════════════════
// PAINT-STYLE COLOR SYSTEM
// state.fillColor  → background of shapes (rgba or 'transparent')
// state.strokeColor → border color of shapes / pen color for draw/text
// state.noFill     → if true, shapes have transparent background
// ══════════════════════════════════════════════════════════════════════════

// Extended palette — 40 colors
const PALETTE = [
  '#000000','#1a1a2e','#16213e','#0f3460','#1e3a5f','#2d4a7a',
  '#ffffff','#f8f9fa','#e9ecef','#dee2e6','#adb5bd','#6c757d',
  '#e8c547','#ffd166','#f4a261','#e76f51','#e63946','#c1121f',
  '#ff914d','#fb5607','#ff006e','#8338ec','#a78bfa','#7c3aed',
  '#4ade9a','#06d6a0','#2ec4b6','#3a86ff','#5b8dee','#4361ee',
  '#48cae4','#00b4d8','#0096c7','#023e8a','#10002b','#240046',
  '#f72585','#b5179e','#7209b7','#560bad',
];

function buildPalette() {
  const grid = $('#color-palette');
  grid.empty();
  PALETTE.forEach(hex => {
    const dot = $('<div>')
      .css({
        width: '20px', height: '20px', borderRadius: '4px',
        background: hex, cursor: 'pointer',
        border: '1.5px solid transparent',
        transition: 'transform .1s, border-color .1s',
      })
      .attr('title', hex)
      .attr('data-color', hex);
    if (hex === '#ffffff' || hex === '#f8f9fa' || hex === '#e9ecef' || hex === '#dee2e6')
      dot.css('border-color', '#555');
    dot.on('click', function() {
      const c = $(this).data('color');
      if (state.activeColorTarget === 'stroke') {
        applyStrokeColor(c);
      } else {
        applyFillColor(c);
      }
    });
    dot.on('mouseenter', function() { $(this).css('transform','scale(1.2)'); });
    dot.on('mouseleave', function() { $(this).css('transform','scale(1)'); });
    grid.append(dot);
  });
}

// Which swatch is "selected" — clicking palette applies to this target
state.activeColorTarget = 'fill';   // 'fill' | 'stroke'
state.fillColor   = 'rgba(255,95,107,0.2)';
state.strokeColor = '#ff5f6b';
state.noFill      = false;
// keep state.color for backward compat (draw/text use strokeColor)
state.color = state.strokeColor;

function applyFillColor(hex) {
  state.noFill    = false;
  state.fillColor = hexToRgba(hex, state.opacity);
  state.color     = hex;
  updateSwatches();
  // Sync custom picker
  $('#custom-color-picker').val(hex);
  $('#custom-hex-display').text(hex);
  $('#fill-transparent-indicator').hide();
}

function applyStrokeColor(hex) {
  state.strokeColor = hex;
  state.color       = hex;
  updateSwatches();
  $('#custom-color-picker').val(hex);
  $('#custom-hex-display').text(hex);
}

function applyNoFill() {
  state.noFill    = true;
  state.fillColor = 'transparent';
  updateSwatches();
}

function hexToRgba(hex, alpha) {
  // hex can be shorthand #rgb or full #rrggbb
  let r = parseInt(hex.slice(1,3)||'00', 16);
  let g = parseInt(hex.slice(3,5)||'00', 16);
  let b = parseInt(hex.slice(5,7)||'00', 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function updateSwatches() {
  // Fill swatch
  if (state.noFill) {
    $('#swatch-fill').css('background', 'transparent');
    $('#fill-transparent-indicator').show();
    $('#btn-no-fill').css({ background: 'var(--accent-dim)', color: 'var(--accent)', borderColor: 'var(--accent)' });
  } else {
    $('#swatch-fill').css('background', state.fillColor);
    $('#fill-transparent-indicator').hide();
    $('#btn-no-fill').css({ background: 'var(--surface2)', color: 'var(--text2)', borderColor: 'var(--border2)' });
  }
  // Stroke swatch
  $('#swatch-stroke').css('border-color', state.strokeColor);
  // Highlight active target
  $('#swatch-fill').css('box-shadow',   state.activeColorTarget === 'fill'   ? '0 0 0 2px var(--accent)' : 'none');
  $('#swatch-stroke').css('box-shadow', state.activeColorTarget === 'stroke' ? '0 0 0 2px var(--accent)' : 'none');
}

// Swatch clicks → set active target
$('#swatch-fill').on('click', function() {
  state.activeColorTarget = 'fill';
  updateSwatches();
});
$('#swatch-stroke').on('click', function() {
  state.activeColorTarget = 'stroke';
  updateSwatches();
});
$('#btn-no-fill').on('click', function() {
  applyNoFill();
});

// Native color input (fill)
$('#fill-color-input').on('input change', function() {
  applyFillColor(this.value);
});
$('#swatch-fill').on('dblclick', function() {
  $('#fill-color-input').click();
});

// Native color input (stroke)
$('#stroke-color-input').on('input change', function() {
  applyStrokeColor(this.value);
});
$('#swatch-stroke').on('dblclick', function() {
  $('#stroke-color-input').click();
});

// Custom picker
$('#custom-color-picker').on('input change', function() {
  const hex = this.value;
  $('#custom-hex-display').text(hex);
});
$('#btn-apply-custom-fill').on('click', function() {
  applyFillColor($('#custom-color-picker').val());
});
$('#btn-apply-custom-stroke').on('click', function() {
  applyStrokeColor($('#custom-color-picker').val());
});

// Build palette on init
buildPalette();
updateSwatches();

// ── Stroke width / opacity / font-size ───────────────────────────────────
$('#stroke-width').on('input', function() {
  state.strokeWidth = +$(this).val();
  $('#stroke-width-val').text(state.strokeWidth);
});
$('#opacity-val').on('input', function() {
  state.opacity = +$(this).val() / 100;
  $('#opacity-val-label').text($(this).val() + '%');
  // Update fill with new opacity if not transparent
  if (!state.noFill) {
    state.fillColor = hexToRgba(state.color, state.opacity);
    updateSwatches();
  }
});
$('#font-size').on('change', function() { state.fontSize = +$(this).val(); });
$('#font-family-select').on('change', function() { state.fontFamily = $(this).val(); });

// ── Theme: light-only ──────────────────────────────────────────────────────
document.documentElement.classList.add('light');

// ── Create PDF ────────────────────────────────────────────────────────────────
(function() {
  var selectedSize   = 'A4';
  var selectedOrient = 'portrait';
  var selectedBg     = 'white';

  var BG_COLORS = { white: [1,1,1], cream: [0.992,0.965,0.890], gray: [0.961,0.961,0.961], dark: [0.102,0.106,0.149] };
  var BG_LABELS = { white: 'White', cream: 'Cream', gray: 'Light Gray', dark: 'Dark' };

  // Page dimensions in points (72pt = 1 inch)
  var SIZES = {
    A4:     [595.28, 841.89],
    Letter: [612, 792],
    A3:     [841.89, 1190.55],
    Legal:  [612, 1008],
  };

  function openCreateModal() {
    $('#create-pdf-backdrop').css('display','flex');
    $('body').css('overflow','hidden');
  }
  function closeCreateModal() {
    $('#create-pdf-backdrop').css('display','none');
    $('body').css('overflow','');
  }

  $('#btn-create-pdf').on('click', openCreateModal);
  $('#create-pdf-close, #create-pdf-cancel').on('click', closeCreateModal);
  $('#create-pdf-backdrop').on('click', function(e) { if (e.target === this) closeCreateModal(); });

  // Size buttons
  $(document).on('click', '.pdf-size-btn', function() {
    selectedSize = $(this).data('size');
    $('.pdf-size-btn').removeClass('active');
    $(this).addClass('active');
  });

  // Orientation buttons
  $(document).on('click', '.pdf-orient-btn', function() {
    selectedOrient = $(this).data('orient');
    $('.pdf-orient-btn').removeClass('active');
    $(this).addClass('active');
  });

  // Background buttons
  $(document).on('click', '.create-bg-btn', function() {
    selectedBg = $(this).data('bg');
    $('.create-bg-btn').css('border-color','transparent');
    $(this).css('border-color','var(--accent)');
    $('#create-bg-label').text(BG_LABELS[selectedBg]);
  });

  // ── Free-type mode ───────────────────────────────────────────────────────
  function enterFreeTypeMode() {
    // Auto-activate the Text tool
    $('.tool-btn[data-tool="text"]').click();
    // Show the banner
    $('#free-type-banner').css('display','flex');
    // Mark state so placeTextBox knows not to ask for color (use default black)
    state._freeTypeMode = true;
  }

  function exitFreeTypeMode() {
    $('#free-type-banner').css('display','none');
    state._freeTypeMode = false;
    // Switch back to select tool
    $('.tool-btn[data-tool="select"]').click();
  }

  $('#free-type-exit').on('click', exitFreeTypeMode);

  // Also exit free-type mode when user manually picks another tool
  $(document).on('click', '.tool-btn[data-tool]', function() {
    if ($(this).data('tool') !== 'text' && state._freeTypeMode) {
      exitFreeTypeMode();
    }
  });

  // Confirm — generate blank PDF via pdf-lib, then enter free-type mode
  $('#create-pdf-confirm').on('click', async function() {
    try {
      var numPages  = Math.max(1, Math.min(100, parseInt($('#create-pdf-pages').val()) || 1));
      var dims      = SIZES[selectedSize] || SIZES['A4'];
      var w = selectedOrient === 'landscape' ? dims[1] : dims[0];
      var h = selectedOrient === 'landscape' ? dims[0] : dims[1];
      var bg        = BG_COLORS[selectedBg] || BG_COLORS['white'];

      const { PDFDocument, rgb } = PDFLib;
      const doc = await PDFDocument.create();

      for (var i = 0; i < numPages; i++) {
        var page = doc.addPage([w, h]);
        if (selectedBg !== 'white') {
          page.drawRectangle({ x:0, y:0, width:w, height:h, color: rgb(bg[0],bg[1],bg[2]) });
        }
      }

      var pdfBytes = await doc.save();
      var blob = new Blob([pdfBytes], { type: 'application/pdf' });
      var fileName = 'new-document-' + selectedSize.toLowerCase() + '.pdf';
      var file = new File([blob], fileName, { type: 'application/pdf' });
      closeCreateModal();

      // Load PDF, then enter free-type mode after render
      loadPDF(file);

      // Wait for PDF to load and render, then activate free-type
      var checkReady = setInterval(function() {
        if (state.pdf && !$('#canvas-container').hasClass('hidden')) {
          clearInterval(checkReady);
          // Small delay so the canvas is fully painted
          setTimeout(enterFreeTypeMode, 200);
        }
      }, 80);

      toast('New ' + selectedSize + ' PDF — click anywhere to start typing');
    } catch (err) {
      toast('Failed to create PDF: ' + err.message, 'error');
    }
  });
})();

// ── Font Picker ───────────────────────────────────────────────────────────────
(function() {

  // ── Font catalogue ───────────────────────────────────────────────────────
  // format: { name, css, category, google?, preview }
  // google: true  → load from Google Fonts on demand
  // css: the font-family stack to apply
  var FONTS = [
    // ── System / Web-safe ────────────────────────────────────────────────
    { name:'Arial',            css:'Arial, sans-serif',                          cat:'Sans-Serif' },
    { name:'Arial Black',      css:'"Arial Black", Gadget, sans-serif',          cat:'Sans-Serif' },
    { name:'Helvetica',        css:'Helvetica, Arial, sans-serif',               cat:'Sans-Serif' },
    { name:'Verdana',          css:'Verdana, Geneva, sans-serif',                cat:'Sans-Serif' },
    { name:'Tahoma',           css:'Tahoma, Geneva, sans-serif',                 cat:'Sans-Serif' },
    { name:'Trebuchet MS',     css:'"Trebuchet MS", Helvetica, sans-serif',      cat:'Sans-Serif' },
    { name:'Calibri',          css:'Calibri, Candara, Segoe, sans-serif',        cat:'Sans-Serif' },
    { name:'Segoe UI',         css:'"Segoe UI", Tahoma, Geneva, sans-serif',     cat:'Sans-Serif' },
    { name:'Times New Roman',  css:'"Times New Roman", Times, serif',            cat:'Serif' },
    { name:'Georgia',          css:'Georgia, serif',                             cat:'Serif' },
    { name:'Palatino',         css:'"Palatino Linotype", Palatino, serif',       cat:'Serif' },
    { name:'Garamond',         css:'Garamond, serif',                            cat:'Serif' },
    { name:'Book Antiqua',     css:'"Book Antiqua", Palatino, serif',            cat:'Serif' },
    { name:'Baskerville',      css:'Baskerville, "Baskerville Old Face", serif', cat:'Serif' },
    { name:'Courier New',      css:'"Courier New", Courier, monospace',          cat:'Monospace' },
    { name:'Lucida Console',   css:'"Lucida Console", Monaco, monospace',        cat:'Monospace' },
    { name:'Consolas',         css:'Consolas, "Courier New", monospace',         cat:'Monospace' },
    { name:'Impact',           css:'Impact, Charcoal, sans-serif',               cat:'Display' },
    { name:'Comic Sans MS',    css:'"Comic Sans MS", cursive',                   cat:'Handwriting' },

    // ── Google Fonts — Sans-Serif ─────────────────────────────────────
    { name:'Roboto',           css:'"Roboto", sans-serif',           cat:'Sans-Serif', google:'Roboto' },
    { name:'Open Sans',        css:'"Open Sans", sans-serif',        cat:'Sans-Serif', google:'Open+Sans' },
    { name:'Lato',             css:'"Lato", sans-serif',             cat:'Sans-Serif', google:'Lato' },
    { name:'Nunito',           css:'"Nunito", sans-serif',           cat:'Sans-Serif', google:'Nunito' },
    { name:'Poppins',          css:'"Poppins", sans-serif',          cat:'Sans-Serif', google:'Poppins' },
    { name:'Raleway',          css:'"Raleway", sans-serif',          cat:'Sans-Serif', google:'Raleway' },
    { name:'Montserrat',       css:'"Montserrat", sans-serif',       cat:'Sans-Serif', google:'Montserrat' },
    { name:'Source Sans Pro',  css:'"Source Sans Pro", sans-serif',  cat:'Sans-Serif', google:'Source+Sans+Pro' },
    { name:'Ubuntu',           css:'"Ubuntu", sans-serif',           cat:'Sans-Serif', google:'Ubuntu' },
    { name:'Noto Sans',        css:'"Noto Sans", sans-serif',        cat:'Sans-Serif', google:'Noto+Sans' },
    { name:'Inter',            css:'"Inter", sans-serif',            cat:'Sans-Serif', google:'Inter' },
    { name:'Figtree',          css:'"Figtree", sans-serif',          cat:'Sans-Serif', google:'Figtree' },
    { name:'DM Sans',          css:'"DM Sans", sans-serif',          cat:'Sans-Serif', google:'DM+Sans' },
    { name:'Outfit',           css:'"Outfit", sans-serif',           cat:'Sans-Serif', google:'Outfit' },
    { name:'Manrope',          css:'"Manrope", sans-serif',          cat:'Sans-Serif', google:'Manrope' },
    { name:'Rubik',            css:'"Rubik", sans-serif',            cat:'Sans-Serif', google:'Rubik' },
    { name:'Jost',             css:'"Jost", sans-serif',             cat:'Sans-Serif', google:'Jost' },
    { name:'Exo 2',            css:'"Exo 2", sans-serif',            cat:'Sans-Serif', google:'Exo+2' },
    { name:'Oxanium',          css:'"Oxanium", sans-serif',          cat:'Display',    google:'Oxanium' },

    // ── Google Fonts — Serif ──────────────────────────────────────────
    { name:'Lora',             css:'"Lora", serif',                  cat:'Serif',      google:'Lora' },
    { name:'Merriweather',     css:'"Merriweather", serif',          cat:'Serif',      google:'Merriweather' },
    { name:'Playfair Display', css:'"Playfair Display", serif',      cat:'Serif',      google:'Playfair+Display' },
    { name:'Cormorant',        css:'"Cormorant", serif',             cat:'Serif',      google:'Cormorant' },
    { name:'EB Garamond',      css:'"EB Garamond", serif',           cat:'Serif',      google:'EB+Garamond' },
    { name:'Libre Baskerville',css:'"Libre Baskerville", serif',     cat:'Serif',      google:'Libre+Baskerville' },
    { name:'Crimson Text',     css:'"Crimson Text", serif',          cat:'Serif',      google:'Crimson+Text' },
    { name:'Noto Serif',       css:'"Noto Serif", serif',            cat:'Serif',      google:'Noto+Serif' },
    { name:'PT Serif',         css:'"PT Serif", serif',              cat:'Serif',      google:'PT+Serif' },

    // ── Google Fonts — Monospace ───────────────────────────────────────
    { name:'Fira Code',        css:'"Fira Code", monospace',         cat:'Monospace',  google:'Fira+Code' },
    { name:'JetBrains Mono',   css:'"JetBrains Mono", monospace',    cat:'Monospace',  google:'JetBrains+Mono' },
    { name:'Source Code Pro',  css:'"Source Code Pro", monospace',   cat:'Monospace',  google:'Source+Code+Pro' },
    { name:'Space Mono',       css:'"Space Mono", monospace',        cat:'Monospace',  google:'Space+Mono' },
    { name:'Inconsolata',      css:'"Inconsolata", monospace',       cat:'Monospace',  google:'Inconsolata' },
    { name:'IBM Plex Mono',    css:'"IBM Plex Mono", monospace',     cat:'Monospace',  google:'IBM+Plex+Mono' },

    // ── Google Fonts — Display / Decorative ───────────────────────────
    { name:'Bebas Neue',       css:'"Bebas Neue", cursive',          cat:'Display',    google:'Bebas+Neue' },
    { name:'Oswald',           css:'"Oswald", sans-serif',           cat:'Display',    google:'Oswald' },
    { name:'Righteous',        css:'"Righteous", cursive',           cat:'Display',    google:'Righteous' },
    { name:'Teko',             css:'"Teko", sans-serif',             cat:'Display',    google:'Teko' },
    { name:'Orbitron',         css:'"Orbitron", sans-serif',         cat:'Display',    google:'Orbitron' },
    { name:'Audiowide',        css:'"Audiowide", sans-serif',        cat:'Display',    google:'Audiowide' },
    { name:'Cinzel',           css:'"Cinzel", serif',                cat:'Display',    google:'Cinzel' },
    { name:'Josefin Sans',     css:'"Josefin Sans", sans-serif',     cat:'Display',    google:'Josefin+Sans' },
    { name:'Pacifico',         css:'"Pacifico", cursive',            cat:'Handwriting',google:'Pacifico' },

    // ── Google Fonts — Handwriting ────────────────────────────────────
    { name:'Dancing Script',   css:'"Dancing Script", cursive',      cat:'Handwriting',google:'Dancing+Script' },
    { name:'Caveat',           css:'"Caveat", cursive',              cat:'Handwriting',google:'Caveat' },
    { name:'Satisfy',          css:'"Satisfy", cursive',             cat:'Handwriting',google:'Satisfy' },
    { name:'Kalam',            css:'"Kalam", cursive',               cat:'Handwriting',google:'Kalam' },
    { name:'Handlee',          css:'"Handlee", cursive',             cat:'Handwriting',google:'Handlee' },
    { name:'Patrick Hand',     css:'"Patrick Hand", cursive',        cat:'Handwriting',google:'Patrick+Hand' },
    { name:'Indie Flower',     css:'"Indie Flower", cursive',        cat:'Handwriting',google:'Indie+Flower' },
    { name:'Permanent Marker', css:'"Permanent Marker", cursive',    cat:'Handwriting',google:'Permanent+Marker' },
    { name:'Shadows Into Light',css:'"Shadows Into Light", cursive', cat:'Handwriting',google:'Shadows+Into+Light' },
  ];

  var CATS = ['All', 'Sans-Serif', 'Serif', 'Monospace', 'Display', 'Handwriting'];
  var loadedGoogleFonts = {};
  var currentCat = 'All';
  var currentFont = FONTS[0];
  var panelOpen = false;

  // ── Google Font loader ──────────────────────────────────────────────
  function loadGoogleFont(family) {
    if (loadedGoogleFonts[family]) return;
    loadedGoogleFonts[family] = true;
    var link = document.createElement('link');
    link.rel  = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=' + family + ':wght@400;700&display=swap';
    document.head.appendChild(link);
  }

  // Preload a few popular ones silently
  ['Roboto','Open+Sans','Lato','Poppins','Montserrat','Lora','Playfair+Display'].forEach(loadGoogleFont);

  // ── Build category chips ────────────────────────────────────────────
  var $cats = $('#font-picker-categories');
  CATS.forEach(function(cat) {
    var chip = $('<button class="font-cat-chip">' + cat + '</button>');
    if (cat === 'All') chip.addClass('active');
    chip.on('click', function() {
      currentCat = cat;
      $('.font-cat-chip').removeClass('active');
      chip.addClass('active');
      renderList($('#font-picker-search').val().trim());
    });
    $cats.append(chip);
  });

  // ── Render list ─────────────────────────────────────────────────────
  function renderList(query) {
    var q = (query || '').toLowerCase();
    var $list = $('#font-picker-list').empty();
    var filtered = FONTS.filter(function(f) {
      var catOk = currentCat === 'All' || f.cat === currentCat;
      var qOk   = !q || f.name.toLowerCase().indexOf(q) !== -1 || f.cat.toLowerCase().indexOf(q) !== -1;
      return catOk && qOk;
    });
    if (!filtered.length) {
      $list.append('<div class="font-no-results">No fonts match "<b>' + query + '</b>"</div>');
      return;
    }
    filtered.forEach(function(font) {
      // Load google font so preview renders
      if (font.google) loadGoogleFont(font.google);
      var isActive = currentFont && currentFont.name === font.name;
      var item = $('<div class="font-item' + (isActive ? ' active' : '') + '"></div>');
      item.append('<span class="font-item-name">' + font.name + '</span>');
      item.append('<span class="font-item-preview" style="font-family:' + font.css + '">Aa</span>');
      item.append('<span class="font-item-cat">' + font.cat + '</span>');
      item.on('click', function() {
        selectFont(font);
        closePanel();
      });
      $list.append(item);
    });
    // Scroll active item into view
    var $active = $list.find('.font-item.active');
    if ($active.length) {
      $list[0].scrollTop = Math.max(0, $active[0].offsetTop - 80);
    }
  }

  // ── Select font ─────────────────────────────────────────────────────
  function selectFont(font) {
    currentFont = font;
    if (font.google) loadGoogleFont(font.google);
    // Update trigger label & hidden input (keeps compatibility with existing code)
    $('#font-trigger-label').text(font.name).css('font-family', font.css);
    $('#font-family-select').val(font.css).trigger('change');
  }

  // ── Open / close panel ──────────────────────────────────────────────
  function openPanel() {
    if (panelOpen) { closePanel(); return; }
    panelOpen = true;
    $('#font-dropdown-trigger').addClass('open');

    var panel = $('#font-picker-panel');
    var PANEL_W = 280;
    var PANEL_H = 420; // worst-case height

    var trig   = $('#font-dropdown-trigger');
    var off    = trig.offset();
    var trigH  = trig.outerHeight();
    var ww     = $(window).width();
    var wh     = $(window).height();

    // vertical: prefer below, flip above if no room
    var topBelow = off.top + trigH + 4;
    var top = (topBelow + PANEL_H <= wh - 8) ? topBelow : (off.top - PANEL_H - 4);
    top = Math.max(8, top);

    // horizontal: align left edge of trigger, clamp so panel stays on screen
    var left = Math.min(off.left, ww - PANEL_W - 8);
    left = Math.max(8, left);

    // Apply position first, then show — avoids layout flash
    panel.css({ top: top + 'px', left: left + 'px', width: PANEL_W + 'px' });
    panel.addClass('open');

    $('#font-picker-search').val('').focus();
    $('#font-search-clear').hide();
    renderList('');
  }

  function closePanel() {
    panelOpen = false;
    $('#font-dropdown-trigger').removeClass('open');
    $('#font-picker-panel').removeClass('open');
  }

  $('#font-dropdown-trigger').on('click', function(e) {
    e.stopPropagation();
    openPanel();
  });

  // Close on outside click
  $(document).on('click', function(e) {
    if (!$(e.target).closest('#font-picker-panel, #font-dropdown-trigger').length) {
      closePanel();
    }
  });

  // ── Search input ────────────────────────────────────────────────────
  $('#font-picker-search').on('input', function() {
    var q = $(this).val().trim();
    $('#font-search-clear').toggle(!!q);
    renderList(q);
  });
  $('#font-search-clear').on('click', function() {
    $('#font-picker-search').val('').focus();
    $(this).hide();
    renderList('');
  });

  // Keyboard navigation in panel
  $('#font-picker-search').on('keydown', function(e) {
    if (e.key === 'Escape') { closePanel(); return; }
    var $items = $('#font-picker-list .font-item');
    if (!$items.length) return;
    var $cur = $items.filter('.active');
    var idx = $items.index($cur);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      var next = Math.min(idx + 1, $items.length - 1);
      $items.removeClass('active');
      $items.eq(next).addClass('active');
      $items[0].parentNode.scrollTop = $items.eq(next)[0].offsetTop - 80;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      var prev = Math.max(idx - 1, 0);
      $items.removeClass('active');
      $items.eq(prev).addClass('active');
      $items[0].parentNode.scrollTop = $items.eq(prev)[0].offsetTop - 80;
    } else if (e.key === 'Enter') {
      var $sel = $items.filter('.active');
      if ($sel.length) $sel.click();
    }
  });

  // Also prevent the toolbar keyboard shortcuts from firing while panel is open
  $('#font-picker-panel').on('keydown', function(e) { e.stopPropagation(); });

})();

// ── Help modal ────────────────────────────────────────────────────────────────
function openHelpModal() {
  $('#help-modal-backdrop').css('display','flex');
  $('body').css('overflow','hidden');
}
function closeHelpModal() {
  $('#help-modal-backdrop').css('display','none');
  $('body').css('overflow','');
}
$('#btn-help').on('click', openHelpModal);
$('#help-modal-close, #help-modal-close-btn').on('click', closeHelpModal);
$('#help-modal-backdrop').on('click', function(e) { if (e.target === this) closeHelpModal(); });

// ── Text Color Picker Popup ───────────────────────────────────────────────────
let selectedTextColor = '#e8c547';

const TEXT_PALETTE = [
  '#000000','#1a1a2e','#ffffff','#e8c547',
  '#ff5f6b','#4ade9a','#5b8dee','#a78bfa',
  '#f4a261','#e76f51','#e63946','#c1121f',
  '#06d6a0','#2ec4b6','#3a86ff','#4361ee',
  '#ffd166','#fb5607','#ff006e','#8338ec',
  '#48cae4','#00b4d8','#023e8a','#f72585',
];

function buildTextColorPalette() {
  var grid = $('#text-color-palette');
  grid.empty();
  TEXT_PALETTE.forEach(function(hex) {
    var dot = $('<div>')
      .css({
        width:'24px', height:'24px', borderRadius:'4px',
        background: hex, cursor:'pointer',
        border: '2px solid transparent',
        transition: 'transform .1s, border-color .1s',
      })
      .attr('data-color', hex);
    if (hex === '#ffffff') dot.css('border-color','#555');
    dot.on('click', function() { setTextPickerColor($(this).data('color')); });
    dot.on('mouseenter', function() { $(this).css('transform','scale(1.2)'); });
    dot.on('mouseleave', function() { $(this).css('transform','scale(1)'); });
    grid.append(dot);
  });
}

function setTextPickerColor(hex) {
  selectedTextColor = hex;
  $('#text-color-swatch-preview').css('background', hex).text(hex);
  var r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  var lum = (0.299*r + 0.587*g + 0.114*b);
  $('#text-color-swatch-preview').css('color', lum > 128 ? '#0d0e14' : '#e8e9f0');
  $('#text-color-custom').val(hex);
  $('#text-color-custom-hex').text(hex);
}

function showTextColorPopup() {
  buildTextColorPalette();
  setTextPickerColor(state.strokeColor || '#e8c547');
  var popup = $('#text-color-popup');
  var toolBtn = $('.tool-btn[data-tool="text"]');
  var off = toolBtn.offset();
  popup.css({ top: (off.top + toolBtn.outerHeight() + 8) + 'px', left: off.left + 'px' });
  popup.show();
}

function hideTextColorPopup() {
  $('#text-color-popup').hide();
}

// Hook into text tool button click to show color picker
$(document).on('click', '.tool-btn[data-tool="text"]', function() {
  if (state._freeTypeMode) return;   // free-type mode: skip color picker
  setTimeout(showTextColorPopup, 0);
});

$('#text-color-popup-close').on('click', function() {
  hideTextColorPopup();
  state.tool = 'select';
  $('.tool-btn[data-tool]').removeClass('active');
  $('.tool-btn[data-tool="select"]').addClass('active');
  var layer = $('#annotation-layer');
  layer.removeClass('draw-mode text-mode erase-mode');
  layer.css('pointer-events','all');
  $('#cur-tool-status').text('Tool: Select');
});

$('#text-color-confirm').on('click', function() {
  applyStrokeColor(selectedTextColor);
  state.color = selectedTextColor;
  hideTextColorPopup();
  toast('Text color set to ' + selectedTextColor);
});

$('#text-color-custom').on('input change', function() {
  setTextPickerColor(this.value);
});

$(document).on('click', function(e) {
  if (!$(e.target).closest('#text-color-popup').length &&
      !$(e.target).hasClass('tool-btn') &&
      !$(e.target).closest('.tool-btn').length) {
    hideTextColorPopup();
  }
});

// ── Shortcuts modal ──────────────────────────────────────────────────────────
function openShortcutsModal() {
  $('#shortcuts-modal-backdrop').addClass('open');
  // prevent body scroll while modal open
  $('body').css('overflow', 'hidden');
}
function closeShortcutsModal() {
  $('#shortcuts-modal-backdrop').removeClass('open');
  $('body').css('overflow', '');
}

$('#btn-shortcuts, #btn-shortcuts-panel').on('click', openShortcutsModal);
$('#shortcuts-modal-close, #shortcuts-modal-close-btn').on('click', closeShortcutsModal);

// Close on backdrop click
$('#shortcuts-modal-backdrop').on('click', function(e) {
  if (e.target === this) closeShortcutsModal();
});

// Hover style for panel button
$('#btn-shortcuts-panel').on('mouseenter', function() {
  $(this).css({ color: 'var(--accent)', borderColor: 'var(--accent)', background: 'var(--accent-dim)' });
}).on('mouseleave', function() {
  $(this).css({ color: 'var(--text2)', borderColor: 'var(--border2)', background: 'var(--surface2)' });
});

// ── Page navigation ───────────────────────────────────────────────────────
$('#prev-page').on('click', () => renderPage(state.currentPage - 1));
$('#next-page').on('click', () => renderPage(state.currentPage + 1));

$(document).on('keydown', e => {
  if ($(e.target).is('input,textarea,[contenteditable]')) return;
  const ctrl = e.ctrlKey || e.metaKey;

  // ── Global shortcuts (always active) ────────────────────────────────
  if (ctrl && e.key === 'z') { e.preventDefault(); undo(); return; }
  if (ctrl && e.key === 's') { e.preventDefault(); if (state.pdf) savePDF(); return; }
  if (ctrl && e.key === 'o') { e.preventDefault(); $('#file-input').click(); return; }

  if (!state.pdf) return;

  // ── Page navigation ──────────────────────────────────────────────────
  if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')
    renderPage(Math.max(1, state.currentPage - 1));
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown')
    renderPage(Math.min(state.totalPages, state.currentPage + 1));

  // ── Zoom ─────────────────────────────────────────────────────────────
  if (e.key === '=' || e.key === '+') { e.preventDefault(); setZoom(state.zoom + 0.15); }
  if (e.key === '-')                  { e.preventDefault(); setZoom(state.zoom - 0.15); }
  if (e.key === '0')                  { e.preventDefault(); $('#zoom-fit').click(); }

  // ── Tool shortcuts ───────────────────────────────────────────────────
  const toolMap = {
    'v': 'select', 'V': 'select',
    't': 'text',   'T': 'text',
    'd': 'draw',   'D': 'draw',
    'r': 'rect',   'R': 'rect',
    'c': 'circle', 'C': 'circle',
    'h': 'highlight','H':'highlight',
    'e': 'erase',  'E': 'erase',
    'i': 'image',  'I': 'image',
  };
  if (!ctrl && toolMap[e.key]) {
    e.preventDefault();
    if (e.key.toLowerCase() === 'i') {
      $('#btn-insert-image').click();
    } else {
      $(`.tool-btn[data-tool="${toolMap[e.key]}"]`).click();
    }
    return;
  }

  // ── Delete selected annotation (Del / Backspace) ──────────────────
  // ── Shortcuts modal toggle ──────────────────────────────────────────
  if (e.key === '?' || e.key === '/') { e.preventDefault(); openShortcutsModal(); return; }
  if (e.key === 'Escape') { closeShortcutsModal(); return; }

  // ── First / last page ────────────────────────────────────────────────
  if (ctrl && e.key === 'Home') { e.preventDefault(); renderPage(1); return; }
  if (ctrl && e.key === 'End')  { e.preventDefault(); renderPage(state.totalPages); return; }

  // ── Delete selected annotation ───────────────────────────────────────
  if ((e.key === 'Delete' || e.key === 'Backspace') && state.selectedAnn) {
    $(state.selectedAnn).find('.ann-del').click();
    state.selectedAnn = null;
  }
});

// Sidebar page click
$(document).on('click', '.page-thumb', function(e) {
  if ($(e.target).closest('.del-page').length) return;
  renderPage(+$(this).data('page'));
});

// Delete page
$(document).on('click', '.del-page', async function(e) {
  e.stopPropagation();
  if (state.totalPages <= 1) { toast('Cannot delete only page', 'error'); return; }
  const pageNum = +$(this).closest('.page-thumb').data('page');
  const { PDFDocument } = PDFLib;
  const doc = await PDFDocument.load(state.pdfBytes);
  doc.removePage(pageNum - 1);
  state.pdfBytes    = await doc.save();
  state.pdf         = await pdfjsLib.getDocument({ data: state.pdfBytes.slice() }).promise;
  state.totalPages  = state.pdf.numPages;
  state.currentPage = Math.min(state.currentPage, state.totalPages);
  await buildSidebar();
  await renderPage(state.currentPage);
  toast('Page ' + pageNum + ' deleted');
});

// ── Clear / Undo ──────────────────────────────────────────────────────────
$('#btn-clear-ann').on('click', () => {
  saveHistory();
  state.annotations[state.currentPage] = [];
  state.drawPaths[state.currentPage]   = [];
  renderPage(state.currentPage);
  toast('Page annotations cleared');
});
$('#btn-undo').on('click', undo);

// ── Open / Save ───────────────────────────────────────────────────────────
$('#btn-open, #btn-drop-open').on('click', () => $('#file-input').click());
$('#file-input').on('change', function() {
  if (this.files[0]) loadPDF(this.files[0]);
  this.value = '';
});

$('#btn-save').on('click', savePDF);

$('#btn-close-pdf').on('click', () => {
  state.pdf = null; state.pdfBytes = null;
  state.annotations = {}; state.drawPaths = {};
  state._freeTypeMode = false;
  $('#free-type-banner').css('display','none');
  $('#drop-zone').removeClass('hidden');
  $('#canvas-container').addClass('hidden');
  $('#file-name-badge').text('No file');
  $('#stat-pages').text('0'); $('#stat-anns').text('0'); $('#stat-size').text('—');
  $('#btn-save').prop('disabled', true);
  $('#page-list').empty(); $('#page-count-badge').text('0');
  $('#page-indicator').text('—');
});

// ── Drag & drop ───────────────────────────────────────────────────────────
const dropZone = document.getElementById('drop-zone');
dropZone.addEventListener('dragover', e => { e.preventDefault(); $(dropZone).addClass('drag-over'); });
dropZone.addEventListener('dragleave', ()  => $(dropZone).removeClass('drag-over'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  $(dropZone).removeClass('drag-over');
  const file = e.dataTransfer.files[0];
  if (file && file.type === 'application/pdf') loadPDF(file);
  else toast('Please drop a PDF file', 'error');
});

// ── Cursor position ───────────────────────────────────────────────────────
$('#canvas-container').on('mousemove', function(e) {
  const off = $(this).offset();
  const x   = Math.round((e.clientX - off.left) / state.zoom);
  const y   = Math.round((e.clientY - off.top)  / state.zoom);
  $('#cursor-pos').text(`x: ${x}  y: ${y}`);
});

} // end setupApp