(() => {
  'use strict';

  const doc = document.documentElement;
  doc.classList.add('js');

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer: fine)').matches;
  const isNarrow = () => innerWidth <= 980;
  const icon = (id, cls = 'ic') => `<svg class="${cls}" aria-hidden="true"><use href="#${id}"/></svg>`;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // keep the last two words of running text together so no line ends with a lone word
  const WIDOW_SEL = 'p, dd, li, h2, h3, .vh-main span, .edu-list span, .c-methods span, .c-facts span, .pb, .ps';
  function unwidow(root) {
    $$(WIDOW_SEL, root).forEach(el => {
      const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let n, last = null;
      while ((n = tw.nextNode())) if (n.data.trim()) last = n;
      if (!last) return;
      const words = el.textContent.trim().split(/\s+/);
      if (words.length < 4) return;
      const m = last.data.match(/(\S+)\s+(\S+)\s*$/);
      if (m && m[1].length + m[2].length <= 18) last.data = last.data.replace(/\s+(\S+\s*)$/, '\u00A0$1');
    });
  }

  /* ---------------- toast ---------------- */
  const toastEl = $('.toast');
  let toastT;
  function toast(msg) {
    toastEl.innerHTML = icon('i-check') + `<span>${esc(msg)}</span>`;
    toastEl.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('show'), 2400);
  }
  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch {
      const ta = Object.assign(document.createElement('textarea'), { value: text });
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.append(ta); ta.select();
      const ok = document.execCommand('copy'); ta.remove(); return ok;
    }
  }

  /* ---------------- nav ---------------- */
  const nav = $('#nav');
  const glider = $('.nav-glider');
  const navLinks = $$('.nav-pill a');
  function moveGlider(a) {
    if (!a) return;
    glider.style.left = a.offsetLeft + 'px';
    glider.style.width = a.offsetWidth + 'px';
    navLinks.forEach(l => l.classList.toggle('is-active', l === a));
  }
  const spyMap = { top: 'top', about: 'about', work: 'work', journey: 'journey', principles: 'journey', contact: 'contact' };
  const spyIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      moveGlider(navLinks.find(l => l.dataset.spy === spyMap[e.target.id]));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  Object.keys(spyMap).forEach(id => { const s = document.getElementById(id); if (s) spyIO.observe(s); });
  addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 8), { passive: true });

  const burger = $('.nav-burger');
  const mmenu = $('#mobile-menu');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mmenu.hidden = !open;
  }
  burger.addEventListener('click', () => setMenu(mmenu.hidden));
  mmenu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });

  /* =========================================================
     HERO CANVAS
     ========================================================= */
  const hero = $('.hero');
  const stage = $('.stage', hero);
  const selBox = $('.selection', hero);
  const selDim = $('.sel-dim', hero);
  const hoverBox = $('.hover-outline', hero);
  const bandX = $('.ruler-x .ruler-band', hero);
  const bandY = $('.ruler-y .ruler-band', hero);
  const nameEl = $('#L-name');
  const nameText = $('.name-text', nameEl);
  const penCursor = $('.pen-cursor', hero);
  const layersList = $('.layers-list', hero);
  const dPanel = $('.panel-design', hero);
  const layers = $$('.layer', stage);
  const kindIcon = { Text: 'i-text', Frame: 'i-frame', Image: 'i-img', Comment: 'i-comment', Cursor: 'i-move' };
  let selected = null;

  // layers panel
  layers.forEach(el => {
    const li = document.createElement('li');
    li.className = 'll-item';
    li.tabIndex = 0;
    li.setAttribute('role', 'button');
    li.dataset.for = el.id;
    li.innerHTML = icon(kindIcon[el.dataset.kind] || 'i-frame') + `<span>${esc(el.dataset.layer)}</span>`;
    layersList.append(li);
    li.addEventListener('click', () => select(el));
    li.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(el); } });
    li.addEventListener('mouseenter', () => showHover(el));
    li.addEventListener('mouseleave', hideHover);
  });

  function relRect(el) {
    const s = stage.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { x: r.left - s.left, y: r.top - s.top, w: r.width, h: r.height };
  }
  function toHex(rgb) {
    const m = rgb.match(/\d+(\.\d+)?/g);
    if (!m) return '—';
    return m.slice(0, 3).map(n => (+n).toString(16).padStart(2, '0')).join('').toUpperCase();
  }
  const weightName = w => ({ 300: 'Light', 400: 'Regular', 500: 'Medium', 600: 'Semibold', 700: 'Bold', 800: 'Extrabold' }[w] || w);

  function setDP(key, val) {
    const n = $(`[data-dp="${key}"]`, dPanel);
    if (!n || n.textContent === String(val)) return;
    n.textContent = val;
    n.classList.remove('dp-flash'); void n.offsetWidth; n.classList.add('dp-flash');
  }

  function placeSelection(snap) {
    if (!selected) return;
    const r = relRect(selected);
    selBox.classList.toggle('snap', !!snap);
    Object.assign(selBox.style, { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px' });
    selDim.textContent = `${Math.round(r.w)} × ${Math.round(r.h)}`;
    bandX.classList.toggle('snap', !!snap);
    Object.assign(bandX.style, { left: r.x + 'px', width: r.w + 'px' });
    Object.assign(bandY.style, { top: r.y + 'px', height: r.h + 'px' });
    bandX.style.transition = bandY.style.transition = snap ? 'opacity .4s' : '';
    setDP('x', Math.round(r.x)); setDP('y', Math.round(r.y));
    setDP('w', Math.round(r.w)); setDP('h', Math.round(r.h));
  }

  function select(el, snap) {
    selected = el;
    hideHover();
    $$('.ll-item', layersList).forEach(li => li.classList.toggle('is-sel', li.dataset.for === el.id));
    const kind = el.dataset.kind;
    $('.dp-kind', dPanel).textContent = kind;
    $('.dp-name', dPanel).textContent = el.dataset.layer;
    const cs = getComputedStyle(kind === 'Text' ? (el.querySelector('.name-text') || el) : el);
    dPanel.classList.toggle('no-text', kind !== 'Text');
    if (kind === 'Text') {
      setDP('font', cs.fontFamily.split(',')[0].replace(/["']/g, ''));
      setDP('weight', weightName(cs.fontWeight));
      setDP('size', Math.round(parseFloat(cs.fontSize)));
      const ls = parseFloat(cs.letterSpacing) / parseFloat(cs.fontSize);
      setDP('ls', isNaN(ls) ? '0%' : Math.round(ls * 1000) / 10 + '%');
    }
    let fill = getComputedStyle(el).color;
    if (kind === 'Frame') fill = getComputedStyle(el.querySelector('.ex-card') || el).backgroundColor;
    if (kind === 'Comment' || kind === 'Cursor') fill = getComputedStyle(document.body).getPropertyValue('--coral').trim() ? 'rgb(211,59,30)' : fill;
    if (kind === 'Image') fill = getComputedStyle(el.querySelector('.photo-frame')).backgroundColor;
    if (el.id === 'L-button') fill = getComputedStyle(el).backgroundColor;
    const hex = toHex(fill);
    setDP('hex', hex);
    $('[data-dp="swatch"]', dPanel).style.background = '#' + hex;
    placeSelection(snap);
    selBox.classList.add('on');
    hero.classList.add('has-sel');
  }

  function showHover(el) {
    if (el === selected || isNarrow()) return;
    const r = relRect(el);
    Object.assign(hoverBox.style, { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px' });
    hoverBox.firstElementChild.textContent = el.dataset.layer;
    hoverBox.classList.add('on');
  }
  function hideHover() { hoverBox.classList.remove('on'); }

  layers.forEach(el => {
    el.addEventListener('pointerenter', () => { if (!dragging) showHover(el); });
    el.addEventListener('pointerleave', hideHover);
    el.addEventListener('pointerdown', () => { if (hero.dataset.tool !== 'comment') select(el); });
    el.addEventListener('focusin', () => select(el));
  });

  // rulers
  function buildRulers() {
    const rx = $('.ruler-x .ruler-labels', hero);
    const ry = $('.ruler-y .ruler-labels', hero);
    const w = stage.clientWidth, h = stage.clientHeight;
    rx.innerHTML = ''; ry.innerHTML = '';
    for (let x = 0; x < w; x += 100) rx.insertAdjacentHTML('beforeend', `<span style="left:${x}px">${x}</span>`);
    for (let y = 0; y < h; y += 100) ry.insertAdjacentHTML('beforeend', `<span style="top:${y}px">${y}</span>`);
    const dev = innerWidth <= 680 ? 'Phone' : innerWidth <= 1024 ? 'Tablet' : 'Desktop';
    $('.fl-device', hero).textContent = dev;
    $('.fl-size', hero).textContent = `${innerWidth} × ${innerHeight}`;
  }

  // dragging (mouse/pen only so touch keeps scrolling)
  let dragging = null;
  let dragMoved = false;
  if (finePointer) hero.classList.add('can-drag');
  $$('[data-drag]', stage).forEach(el => {
    el.addEventListener('pointerdown', e => {
      if (e.pointerType === 'touch' || hero.dataset.tool !== 'move' || e.button !== 0) return;
      const cs = getComputedStyle(el);
      dragging = { el, sx: e.clientX, sy: e.clientY, dx: parseFloat(cs.getPropertyValue('--dx')) || 0, dy: parseFloat(cs.getPropertyValue('--dy')) || 0 };
      dragMoved = false;
      el.setPointerCapture(e.pointerId);
    });
    el.addEventListener('pointermove', e => {
      if (!dragging || dragging.el !== el) return;
      const mx = e.clientX - dragging.sx, my = e.clientY - dragging.sy;
      if (!dragMoved && Math.hypot(mx, my) < 4) return;
      if (!dragMoved) { dragMoved = true; el.classList.add('dragging'); hideHover(); }
      el.style.setProperty('--dx', dragging.dx + mx + 'px');
      el.style.setProperty('--dy', dragging.dy + my + 'px');
      placeSelection(true);
    });
    const end = () => {
      if (!dragging || dragging.el !== el) return;
      el.classList.remove('dragging');
      dragging = null;
      requestAnimationFrame(() => placeSelection(true));
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    el.addEventListener('click', e => { if (dragMoved) { e.preventDefault(); e.stopPropagation(); dragMoved = false; } }, true);
  });

  // canvas notes that open a case file
  $$('[data-open]', stage).forEach(b => b.addEventListener('click', () => { const t = $$('.tile-btn')[+b.dataset.open]; if (t) t.click(); }));

  // statement: words for the blur-in
  const stmt = $('#L-statement');
  stmt.innerHTML = stmt.textContent.trim().split(/(\s+)/).map((w, i) => /\s/.test(w) ? w : `<span class="w" style="--d:${(0.35 + i * 0.018).toFixed(3)}s">${esc(w)}</span>`).join('');

  /* ---------- the pen-drawn name ---------- */
  const FONT_URL = 'https://cdn.jsdelivr.net/npm/@fontsource/geist-sans@5.1.0/files/geist-sans-latin-600-normal.woff';
  let nameSVG = null, glyphs = [];
  const NAME = 'Divyangana';

  async function buildNameSVG() {
    if (!window.opentype) throw new Error('no opentype');
    const font = await opentype.load(FONT_URL);
    const fs = 1000, track = -0.045 * fs;
    const gl = font.stringToGlyphs(NAME);
    let x = 0, x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
    const paths = gl.map((g, i) => {
      const p = g.getPath(x, 0, fs);
      const kern = i < gl.length - 1 ? font.getKerningValue(g, gl[i + 1]) : 0;
      x += (g.advanceWidth + kern) * fs / font.unitsPerEm + track;
      const b = p.getBoundingBox();
      if (b.x1 < x1) x1 = b.x1; if (b.y1 < y1) y1 = b.y1; if (b.x2 > x2) x2 = b.x2; if (b.y2 > y2) y2 = b.y2;
      return p;
    });
    // vertical box from the font's own metrics so it sits like set text
    const asc = font.ascender * fs / font.unitsPerEm * 0.78, desc = font.descender * fs / font.unitsPerEm * 0.95;
    y1 = Math.min(y1, -asc); y2 = Math.max(y2, -desc);
    const pad = 14, vx = x1 - pad, vy = y1 - pad, vw = x2 - x1 + pad * 2, vh = y2 - y1 + pad * 2;
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'name-svg');
    svg.setAttribute('viewBox', `${vx} ${vy} ${vw} ${vh}`);
    svg.setAttribute('aria-hidden', 'true');
    svg.style.width = (vw / fs) + 'em';
    svg.style.height = (vh / fs) + 'em';
    glyphs = paths.map(p => {
      const g = document.createElementNS(NS, 'g');
      const path = document.createElementNS(NS, 'path');
      path.setAttribute('d', p.toPathData(2));
      path.setAttribute('class', 'glyph');
      g.append(path);
      const pts = p.commands.filter(c => c.type !== 'Z').map(c => [c.x, c.y]);
      const step = Math.max(1, Math.ceil(pts.length / 22));
      const nodes = pts.filter((_, i) => i % step === 0).map(([nx, ny]) => {
        const r = document.createElementNS(NS, 'rect');
        r.setAttribute('class', 'node');
        r.dataset.x = nx; r.dataset.y = ny;
        g.append(r);
        return r;
      });
      svg.append(g);
      return { path, nodes, len: 0 };
    });
    nameEl.append(svg);
    nameEl.classList.add('svg-ready');
    nameSVG = svg;
  }

  function sizeStrokes() {
    if (!nameSVG) return;
    const vb = nameSVG.viewBox.baseVal;
    const scale = nameSVG.getBoundingClientRect().width / vb.width || 0.2;
    const sw = 1.6 / scale, ns = 6 / scale;
    glyphs.forEach(g => {
      g.path.style.strokeWidth = sw;
      g.nodes.forEach(n => {
        n.setAttribute('x', n.dataset.x - ns / 2); n.setAttribute('y', n.dataset.y - ns / 2);
        n.setAttribute('width', ns); n.setAttribute('height', ns);
        n.style.strokeWidth = sw * 0.9;
      });
    });
  }

  function drawName() {
    return new Promise(resolve => {
      if (!nameSVG) return resolve();
      sizeStrokes();
      nameSVG.classList.remove('filled');
      glyphs.forEach(g => {
        g.len = g.path.getTotalLength();
        g.path.style.transition = 'none';
        g.path.style.strokeDasharray = g.len;
        g.path.style.strokeDashoffset = g.len;
        g.nodes.forEach(n => n.classList.remove('on'));
      });
      void nameSVG.getBoundingClientRect();
      glyphs.forEach(g => (g.path.style.transition = ''));
      const p0 = glyphs[0].path.getPointAtLength(0), s0 = stage.getBoundingClientRect();
      const q0 = Object.assign(nameSVG.createSVGPoint(), { x: p0.x, y: p0.y }).matrixTransform(nameSVG.getScreenCTM());
      penCursor.style.transform = `translate(${q0.x - s0.left}px, ${q0.y - s0.top}px)`;
      penCursor.classList.add('on');
      const DUR = 640, STAG = 175, t0 = performance.now();
      const total = DUR + STAG * (glyphs.length - 1);
      const pt = nameSVG.createSVGPoint();
      const frame = now => {
        const el = now - t0;
        let active = null, at = 0;
        glyphs.forEach((g, i) => {
          const t = clamp((el - i * STAG) / DUR, 0, 1);
          const e = easeOut(t);
          g.path.style.strokeDashoffset = g.len * (1 - e);
          const k = Math.floor(e * g.nodes.length);
          g.nodes.forEach((n, j) => n.classList.toggle('on', j < k));
          if (t > 0 && t < 1) { active = g; at = e; }
        });
        if (active) {
          const p = active.path.getPointAtLength(active.len * at);
          pt.x = p.x; pt.y = p.y;
          const c = pt.matrixTransform(nameSVG.getScreenCTM());
          const s = stage.getBoundingClientRect();
          penCursor.style.transform = `translate(${c.x - s.left}px, ${c.y - s.top}px)`;
        }
        if (el < total + 60) requestAnimationFrame(frame);
        else {
          nameSVG.classList.add('filled');
          setTimeout(() => penCursor.classList.remove('on'), 350);
          resolve();
        }
      };
      requestAnimationFrame(frame);
    });
  }

  // the name types itself out, with Divya's multiplayer text caret
  const sleep = t => new Promise(r => setTimeout(r, t));
  async function typeName() {
    nameEl.setAttribute('aria-label', NAME);
    nameText.innerHTML = '<span class="tw-on"></span><span class="type-caret" aria-hidden="true"><b>Divya</b></span><span class="tw-off"></span>';
    const on = nameText.firstChild, off = nameText.lastChild, caret = nameText.children[1];
    off.textContent = NAME;
    hero.classList.add('name-shown', 'name-typing');
    await sleep(380);
    for (let i = 1; i <= NAME.length; i++) {
      on.textContent = NAME.slice(0, i); off.textContent = NAME.slice(i);
      await sleep(i === NAME.length ? 0 : 62 + Math.random() * 74);
    }
    caret.classList.add('idle');
    await sleep(900);
    caret.classList.add('out');
    await sleep(380);
    nameText.textContent = NAME;
    hero.classList.remove('name-typing');
  }

  // staged reveal order for the rest of the canvas
  const revealOrder = ['.eb:nth-child(1)', '.eb:nth-child(2)', '.sparkles', '#L-button', '.scribble-arrow', '#L-comment', '#L-sticky', '#L-stat', '#L-now', '.panel-layers', '.panel-design', '.toolbar'];
  revealOrder.forEach((s, i) => { const el = $(s, hero); if (el) el.style.setProperty('--d', (0.08 * i).toFixed(2) + 's'); });

  async function intro() {
    buildRulers();
    const fontsReady = Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1800))]);
    await fontsReady;
    const drawn = !reduce;
    if (drawn) await typeName();
    else hero.classList.add('name-shown');
    hero.classList.add('is-ready');
    setTimeout(() => select(nameEl, true), drawn ? 150 : 0);
    setTimeout(() => { hero.classList.add('settled'); if (selected) placeSelection(true); }, 2200);
  }
  intro();

  /* ---------- tools ---------- */
  const hint = $('.tool-hint', hero);
  let hintT;
  function showHint(msg) {
    hint.textContent = msg;
    hint.classList.add('on');
    clearTimeout(hintT);
    hintT = setTimeout(() => hint.classList.remove('on'), 2600);
  }
  const toolBtns = $$('[data-tool-btn]', hero);
  function setTool(tool) {
    if (tool === 'grid') {
      const on = hero.classList.toggle('grid-on');
      $('[data-tool-btn="grid"]', hero).setAttribute('aria-pressed', on);
      $('[data-tool-btn="grid"]', hero).classList.toggle('is-on', on);
      $$('.layout-grid i', hero).forEach((i, k) => i.style.setProperty('--i', k));
      showHint(on ? 'Layout grid on · 12 columns' : 'Layout grid off');
      return;
    }
    if (tool === 'pen') {
      if (nameText.textContent !== NAME) { showHint('Pen needs the original name. Reset first'); return; }
      showHint('Redrawing with the pen tool…');
      select(nameEl);
      (nameSVG ? Promise.resolve() : buildNameSVG())
        .then(() => { nameSVG.style.display = ''; nameEl.classList.add('svg-ready'); return drawName(); })
        .catch(() => showHint('The pen needs a connection to load its font'));
      return;
    }
    if (tool === 'reset') { resetCanvas(); return; }
    if (tool === 'text') { startEdit(); }
    hero.dataset.tool = tool;
    toolBtns.forEach(b => { if (b.dataset.toolBtn !== 'grid') b.classList.toggle('is-on', b.dataset.toolBtn === tool); });
    if (tool === 'comment') showHint('Click anywhere on the canvas to leave a reaction');
    if (tool === 'move') showHint('Move: drag the photo, card or comment around');
  }
  toolBtns.forEach(b => b.addEventListener('click', () => setTool(b.dataset.toolBtn)));

  addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if (!$('.case').hidden) return;
    const r = hero.getBoundingClientRect();
    if (r.bottom < 100 || isNarrow()) return;
    const map = { v: 'move', g: 'grid', p: 'pen', t: 'text', c: 'comment' };
    const tool = map[e.key.toLowerCase()];
    if (tool) { e.preventDefault(); setTool(tool); }
  });

  // text tool: edit the name in place
  function startEdit() {
    select(nameEl);
    nameEl.classList.add('is-editing');
    nameText.contentEditable = 'true';
    nameText.spellcheck = false;
    nameText.focus();
    const range = document.createRange();
    range.selectNodeContents(nameText);
    const s = getSelection(); s.removeAllRanges(); s.addRange(range);
    showHint('Type to edit · Enter to finish');
    requestAnimationFrame(() => placeSelection());
  }
  function endEdit() {
    if (nameText.contentEditable !== 'true') return;
    nameText.contentEditable = 'false';
    nameEl.classList.remove('is-editing');
    const val = nameText.textContent.trim();
    if (!val) nameText.textContent = NAME;
    if (nameText.textContent !== NAME) {
      nameEl.classList.remove('svg-ready');
      if (nameSVG) nameSVG.style.display = 'none';
    }
    nameEl.dataset.layer = nameText.textContent;
    const li = $(`.ll-item[data-for="L-name"] span`, layersList); if (li) li.textContent = nameText.textContent;
    setTool('move');
    select(nameEl);
  }
  nameText.addEventListener('blur', endEdit);
  document.addEventListener('pointerdown', e => { if (nameText.contentEditable === 'true' && !nameEl.contains(e.target)) endEdit(); });
  nameText.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === 'Escape') { e.preventDefault(); nameText.blur(); } });
  nameText.addEventListener('input', () => placeSelection(true));

  // comment tool: reactions
  const reactions = ['Love this', 'So clean', 'Hire Divya', 'Pixel-perfect', 'Wow', 'Great hierarchy', 'Ship it'];
  let rIdx = 0;
  stage.addEventListener('click', e => {
    if (hero.dataset.tool !== 'comment' || e.target.closest('a,button')) return;
    const s = stage.getBoundingClientRect();
    const r = document.createElement('div');
    r.className = 'reaction';
    r.style.left = e.clientX - s.left - 4 + 'px';
    r.style.top = e.clientY - s.top - 26 + 'px';
    r.innerHTML = `<span class="c-pin small">Y</span><span>${reactions[rIdx++ % reactions.length]}</span>`;
    stage.append(r);
    setTimeout(() => { r.classList.add('out'); setTimeout(() => r.remove(), 500); }, 4200);
  });

  function resetCanvas() {
    $$('[data-drag]', stage).forEach(el => { el.style.removeProperty('--dx'); el.style.removeProperty('--dy'); });
    $$('.reaction', stage).forEach(r => r.remove());
    hero.classList.remove('grid-on');
    $('[data-tool-btn="grid"]', hero).classList.remove('is-on');
    nameText.textContent = NAME;
    nameEl.dataset.layer = NAME;
    const li = $(`.ll-item[data-for="L-name"] span`, layersList); if (li) li.textContent = NAME;
    if (nameSVG) { nameSVG.style.display = ''; nameEl.classList.add('svg-ready'); }
    setTool('move');
    setTimeout(() => select(nameEl), 650);
    showHint('Canvas reset');
  }

  // "You" multiplayer tag
  const you = $('.you-cursor');
  if (finePointer && !reduce) {
    let tx = 0, ty = 0, cx = 0, cy = 0, running = false;
    const loop = () => {
      cx += (tx - cx) * 0.22; cy += (ty - cy) * 0.22;
      you.style.transform = `translate(${cx}px, ${cy}px)`;
      if (Math.abs(tx - cx) + Math.abs(ty - cy) > 0.3) requestAnimationFrame(loop); else running = false;
    };
    hero.addEventListener('pointermove', e => {
      tx = e.clientX; ty = e.clientY;
      if (!you.classList.contains('on')) { cx = tx; cy = ty; you.classList.add('on'); }
      if (!running) { running = true; requestAnimationFrame(loop); }
    });
    hero.addEventListener('pointerleave', () => you.classList.remove('on'));
  }

  /* =========================================================
     MARQUEE
     ========================================================= */
  $$('.marquee').forEach((m, i) => {
    const track = $('.track', m);
    track.innerHTML += track.innerHTML;
    [...track.children].slice(track.children.length / 2).forEach(c => c.setAttribute('aria-hidden', 'true'));
    const speed = i === 0 ? 38 : 32;
    requestAnimationFrame(() => track.style.setProperty('--dur', (track.scrollWidth / 2 / speed).toFixed(1) + 's'));
  });

  /* =========================================================
     WORK: project cards
     ========================================================= */
  const P = window.PROJECTS || [];
  const bento = $('.bento');

  // project cards: title, one line, and the real screens
  const CARDS = {
    aggregator: { sub: 'Bajaj Finserv', art: ['agg-2'] },
    hestia: { sub: 'AI Kitchen Ecosystem to Reduce Food Waste', art: ['hes-1'] },
    navassist: { sub: 'Public navigation app for visually impaired', art: ['nav-cover'] },
    waggle: { sub: 'A dog kennel system app', art: ['wag-2', 'wag-3'] },
    taranaksh: { sub: 'A story-driven marketplace connecting Banarasi artisans with conscious buyers.', art: ['tar-2'] }
  };

  P.forEach((p, i) => {
    const cd = CARDS[p.id] || { sub: p.sub || '', art: [p.cover] };
    const li = document.createElement('li');
    li.className = 'tile' + (i < 2 ? ' t-lg' : ' t-sm');
    li.style.cssText = `--accent:${p.accent};--accent2:${p.accent2};--tint:${p.tint}`;
    li.innerHTML = `
      <button class="tile-btn tc tc-${p.id}" aria-label="Open the ${esc(p.title)} case file">
        <span class="tc-text"><h3>${esc(p.title)}</h3><span class="tc-sub">${esc(cd.sub)}</span></span>
        <span class="tc-art" aria-hidden="true">${cd.art.map((s, k) => `<img class="tc-img tc-img-${k}" src="assets/img/${s}.webp" alt="" loading="lazy" />`).join('')}</span>
        <span class="tc-go">${icon('i-ur')}</span>
      </button>`;
    $('.tile-btn', li).addEventListener('click', () => openCase(i));
    bento.append(li);
  });

  /* =========================================================
     CASE FILE
     ========================================================= */
  const caseEl = $('.case');
  const sheet = $('.case-sheet', caseEl);
  const body = $('.case-body', caseEl);
  let caseIdx = 0, lastFocus = null, caseIO = null;

  const MOD_ICONS = ['i-layout', 'i-frame', 'i-comp', 'i-reset', 'i-pin', 'i-clock'];
  const WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
  const word = (n, lower) => { const w = WORDS[n] || String(n); return lower ? w.toLowerCase() : w; };
  const pct = v => String(v).replace('+', '');

  // numbers count up when they arrive: "82.5" -> 0..82.5, "20+" keeps its suffix
  const countSpan = v => {
    const m = String(v).match(/^([^\d]*)([\d.,]+)(.*)$/);
    if (!m || /^[–-]\d/.test(m[3])) return esc(v);
    const n = parseFloat(m[2].replace(/,/g, ''));
    const dec = (m[2].split('.')[1] || '').length;
    const pad = /^0\d/.test(m[2]) ? m[2].length : 0;
    return `${esc(m[1])}<span class="count" data-to="${n}" data-dec="${dec}" data-pad="${pad}">${reduce ? m[2] : '0'}</span>${esc(m[3])}`;
  };

  // device frames: real screens inside a tablet bezel, or the phone mockups as they are
  const tablet = (src, alt, cls = '') => `<figure class="dev-tab ${cls}"><span class="dev-bar"><i></i><i></i><i></i></span><img src="assets/img/${src}.webp" alt="${esc(alt)}" loading="lazy" /></figure>`;
  const phones = (list, title) => `<div class="dev-phones">${list.map((s, k) => `<img style="--k:${k}" src="assets/img/${s}.webp" alt="${esc(title)} screen ${k + 1}" loading="lazy" />`).join('')}</div>`;
  const flowStrip = (steps, note = '') => `<div class="cs-flow rv"><div>${steps.map((s, k) => `${k ? `<i aria-hidden="true">${icon('i-right')}</i>` : ''}<span>${esc(s)}</span>`).join('')}</div>${note ? `<p>${esc(note)}</p>` : ''}</div>`;

  function renderCase(p, i) {
    const c = p.cs || {};
    const next = P[(i + 1) % P.length];
    const isMob = p.device === 'mobile';
    const block = k => (p.blocks || []).find(b => b.kind === k || (k === 'aims' && /aimed/i.test(b.title)) || (k === 'artisans' && /artisans/i.test(b.title)) || (k === 'features' && /feature/i.test(b.title)));
    const secs = [];
    const hide = new Set(c.hide || []);
    const S = (id, nav, label, inner, tone = '') => { if (!hide.has(id)) secs.push({ id, nav, label, inner, tone }); };
    const head = (t, sub) => !t ? '' : `<div class="cs-head"><h3 class="rv">${esc(t)}</h3>${sub ? `<p class="cs-sub rv" style="--k:1">${esc(sub)}</p>` : ''}</div>`;

    /* 01 — the problem */
    const artisans = block('artisans');
    const pains = artisans ? artisans.items.map(([t, s], k) => [t, s, MOD_ICONS[k % MOD_ICONS.length]]) : [];
    const stack = p.problem.length + p.goal.length > 520;
    S('problem', 'About', 'About', `
      <div class="cs-pg2 ${stack ? 'stack' : ''}">
        <div class="pg-card rv" style="--k:2"><span class="cs-mini">Problem statement</span><p>${esc(p.problem)}</p></div>
        <div class="pg-card goal rv" style="--k:3"><span class="cs-mini">Project goal</span><p>${esc(p.goal)}</p></div>
      </div>
      ${pains.length ? `<span class="cs-mini pains-label rv">${esc(artisans.title)}</span><div class="cs-cells cols-${pains.length > 3 ? 3 : pains.length}">${pains.map(([t, s, ic], k) => `
        <div class="cell rv" style="--k:${k}"><span class="cell-ic">${icon(ic || 'i-comp')}</span><b>${esc(t)}</b><p>${esc(s)}</p></div>`).join('')}</div>` : ''}
      ${p.callout ? `<div class="cs-callout rv"><b>${esc(p.callout.k)}</b><p>${esc(p.callout.v)}</p></div>` : ''}
      ${p.facts ? `<div class="cs-facts">${p.facts.map(([b, s], k) => `<div class="rv" style="--k:${k}"><b>${countSpan(b)}</b><span>${esc(s)}</span></div>`).join('')}</div>` : ''}
      <blockquote class="cs-hmw rv">“${esc(c.hmw || p.goal)}”</blockquote>`);

    /* 02 — research & discovery (dark) */
    const stats = p.research ? p.research.methods.map(([b, s]) => { const n = (s.match(/^(\d+\+?)/) || [])[1] || ''; return [n, b, n ? s.replace(n, '').trim() : s]; })
      : (p.glance || []).map(([v, l]) => [v, l, '']);
    let right = '';
    if (p.research) {
      right = `<div class="themes"><span class="cs-mini">What I found</span>${p.research.insights.map(([v, s], k) => `
        <div class="theme rv" style="--k:${k};--v:${parseFloat(v)}%"><span class="t-n">${countSpan(pct(v))}<small>%${String(v).includes('+') ? '+' : ''}</small></span><p>${esc(s)}</p><i class="t-bar"></i></div>`).join('')}</div>`;
    } else if (c.insights) {
      right = `<div class="themes"><span class="cs-mini">Key insights</span>${c.insights.map((t, k) => `<div class="theme rv" style="--k:${k}"><span class="t-n">${String(k + 1).padStart(2, '0')}</span><p>${esc(t)}</p></div>`).join('')}</div>`;
    } else if (p.persona) {
      const pe = p.persona;
      right = `<div class="themes"><span class="cs-mini">In ${esc(pe.name.split(' ')[0])}’s words</span>${pe.quotes.map((q, k) => `<div class="theme quote rv" style="--k:${k}"><p>“${esc(q)}”</p></div>`).join('')}</div>`;
    } else {
      const aims = block('aims');
      if (aims) right = `<div class="themes"><span class="cs-mini">What I aimed to achieve</span>${aims.items.map(([t, s], k) => `<div class="theme rv" style="--k:${k}"><span class="t-n">${icon(MOD_ICONS[k])}</span><p><b>${esc(t)}</b> ${esc(s)}</p></div>`).join('')}</div>`;
    }
    S('research', 'Research', 'Research & discovery', `
      ${head(c.researchHead || 'What research told me', c.researchSub)}
      <div class="cs-research">
        <div class="stats">${stats.map(([n, b, s], k) => `<div class="stat rv" style="--k:${k}"><b>${n ? countSpan(n) : '—'}</b><span>${esc(b)}</span>${s ? `<em>${esc(s)}</em>` : ''}</div>`).join('')}</div>
        ${right}
      </div>
      ${c.landscape ? `<div class="cs-land rv"><span class="cs-mini">${esc(c.landscapeLabel || 'Landscape review')}</span>${c.landscape.map(n => `<span>${esc(n)}</span>`).join('')}${c.landscapeNote ? `<p>${esc(c.landscapeNote)}</p>` : ''}</div>` : ''}
      ${p.gallery ? `<div class="cs-sort"><span class="cs-mini">${esc(p.gallery.title)} with pet parents</span><div class="fan rv">${p.gallery.imgs.map((s, k) => `<img style="--k:${k}" src="assets/img/${s}.webp" alt="Card-sorting board ${k + 1} with sticky notes" loading="lazy" />`).join('')}</div></div>` : ''}
`, 'dark');

    /* process timeline (aggregator) */
    const tlb = block('timeline');
    if (tlb) {
      secs.push({ id: 'process', nav: 'Process', label: 'Design process', raw: `
        <section class="c-tl cx cs-sec tone-dark" id="cs-process" data-num="__N__" style="--n:${tlb.steps.length}">
          <div class="tl-pin">
            <div class="tl-head"><span class="cs-label">__N__ / Design process</span><span>${esc(tlb.period)}</span></div>
            <div class="tl-track">
              <div class="tl-rail">
                <div class="tl-line"><i class="d0"></i><span class="tl-fill"></span><i class="d1"></i></div>
                ${tlb.steps.map(([t, s], k) => `
                  <div class="tl-item ${k % 2 ? 'low' : 'high'}" style="--k:${k}">
                    <span class="tl-stem"></span><span class="tl-dot"></span>
                    <div class="tl-copy"><em>Phase ${k + 1}</em><h4><span>${esc(t)}</span></h4><p><span>${esc(s)}</span></p></div>
                  </div>`).join('')}
              </div>
            </div>
          </div>
        </section>` });
    }

    /* personas — who I designed for */
    const people = p.personas || [];
    if (people.length) {
      const pane = (pe, k) => `
        <div class="pz-pane ${k === 0 ? 'on' : ''}" role="tabpanel" id="pz-${p.id}-${k}">
          <div class="pz">
            <figure class="pz-card">
              <img src="assets/img/${pe.img}.webp" alt="Persona photo for ${esc(pe.name)}" loading="lazy" />
              <figcaption><b>${esc(pe.name)}</b><span>${esc(pe.age)} years old · ${esc(pe.role)}</span></figcaption>
            </figure>
            <div class="pz-story">
              <p class="pz-bio">${esc(pe.bio)}</p>
              <div class="chat-log">${pe.quotes.map((q, j) => `<div class="msg" style="--k:${j}"><span class="c-pin small">${esc(pe.name[0])}</span><p>${esc(q)}</p></div>`).join('')}</div>
            </div>
          </div>
          <div class="pz-cols">${pe.cols.map(([t, ic, items]) => `
            <div class="pz-col"><span class="pz-ic">${icon(ic)}</span><h4>${esc(t)}</h4><ul>${items.map(x => `<li>${esc(x.replace(/\.$/, ''))}</li>`).join('')}</ul></div>`).join('')}</div>
        </div>`;
      S('persona', people.length > 1 ? 'Personas' : 'Persona', people.length > 1 ? 'Who I designed for' : 'Who I designed for', `
        ${head(people.length > 1 ? 'The Users' : 'The User')}
        ${people.length > 1 ? `<div class="pz-tabs rv" role="tablist" style="--n:${people.length}">${people.map((pe, k) => `<button role="tab" aria-selected="${k === 0}" aria-controls="pz-${p.id}-${k}"><img src="assets/img/${pe.img}.webp" alt="" /><span><b>${esc(pe.name)}</b><em>${esc(pe.age)} · ${esc(pe.role.split(' · ')[0])}</em></span></button>`).join('')}</div>` : ''}
        <div class="pz-panes rv">${people.map(pane).join('')}</div>`);
    }

    /* who uses it (enterprise roles + network) */
    const roles = block('roles');
    if (roles || c.ecosystem) {
      const eco = c.ecosystem;
      S('roles', 'Users', 'Who uses it', `
        ${head(roles ? roles.title : eco.head, roles ? roles.note : eco.sub)}
        ${roles ? `<div class="roles">
          <div class="role-tabs" role="tablist">${roles.items.map(([t], k) => `<button role="tab" aria-selected="${k === 0}" data-k="${k}"><span class="c-pin small">${esc(t[0])}</span>${esc(t)}</button>`).join('')}</div>
          <div class="role-panes">${roles.items.map(([t, s], k) => `<div class="role-pane spot ${k === 0 ? 'on' : ''}" role="tabpanel"><b>${esc(t)}</b><p>${esc(s)}</p></div>`).join('')}</div>
        </div>` : ''}
        ${eco ? `<div class="eco rv"><div class="eco-head"><b>${esc(eco.head)}</b><p>${esc(eco.sub)}</p></div>
          <div class="eco-rows">
            <div class="eco-row on"><span class="eco-tag">Portal</span>${eco.portal.map(([t, s], k) => `${k ? `<i>${icon('i-right')}</i>` : ''}<div class="eco-node"><b>${esc(t)}</b><span>${esc(s)}</span></div>`).join('')}</div>
            <div class="eco-row"><span class="eco-tag">App</span>${eco.app.map(([t, s], k) => `${k ? `<i>${icon('i-right')}</i>` : ''}<div class="eco-node"><b>${esc(t)}</b><span>${esc(s)}</span></div>`).join('')}</div>
          </div></div>` : ''}`);
    }

    /* 03 — design direction */
    const flips = block('flip');
    const aims = block('aims');
    const dir = c.direction || (c.goals ? c.goals.map(([t, s], k) => [t, s, MOD_ICONS[k]]) : aims ? aims.items.map(([t, s], k) => [t, s, MOD_ICONS[k]]) : null);
    S('direction', 'Direction', 'Design direction', `
      ${head(c.directionHead || 'Design direction')}
      ${dir ? `<div class="cs-cards n${dir.length}">${dir.map(([t, s, ic], k) => `<div class="dcard rv" style="--k:${k};--t:var(--k${(k % 3) + 1})"><span class="d-ic">${icon(ic || 'i-comp')}</span><b>${esc(t)}</b><p>${esc(s)}</p></div>`).join('')}</div>` : ''}
      ${flips ? `<p class="cs-note">Each card is a problem I saw in the field, turned into a solution.</p><div class="c-flips">${flips.pairs.map(([a, s], k) => `
          <button class="flip small rv" aria-pressed="false" style="--k:${k}">
            <span class="flip-in">
              <span class="flip-face front"><em>Problem</em><span class="flip-txt">${esc(a)}</span>${icon('i-reset')}</span>
              <span class="flip-face back"><em>Solution</em><span class="flip-txt">${esc(s)}</span></span>
            </span>
          </button>`).join('')}</div>` : ''}
      ${c.flow ? flowStrip(c.flow) : ''}`);

    /* 04 — the experience */
    S('experience', 'Experience', 'The experience', `
      ${head(c.experienceHead || 'The experience', c.experienceSub)}
      <div class="cs-exp solo">
        <div class="cs-dev rv"><div class="tilt">${isMob ? phones(p.stack.slice(0, 3), p.title) : tablet(p.stack[0], `${p.title} main screen`)}</div></div>
      </div>`, 'soft');

    /* 05 — key features */
    const kf = c.keyFeatures || [];
    if (kf.length) {
      const cols = kf.length % 4 === 0 ? 4 : kf.length % 3 === 0 ? 3 : 5;
      S('features', 'Features', 'Key features', `
        ${head(c.featuresHead || 'The Core of the Experience')}
        <div class="kf" style="--cols:${cols}">${kf.map(([t, s], k) => `<div class="kf-card spot rv" style="--k:${k % cols}"><span class="mi">${icon(['i-layout', 'i-frame', 'i-comp', 'i-reset', 'i-pin', 'i-clock', 'i-check', 'i-comment', 'i-img', 'i-pen'][k % 10])}</span><b>${esc(t)}</b>${s ? `<p>${esc(s)}</p>` : ''}</div>`).join('')}</div>`);
    }

    if (c.wireframes) {
      const wf = c.wireframes;
      S('wireframes', 'Wireframes', wf.label || 'Wireframes', `
        ${head(wf.head || 'Wireframes', wf.sub)}
        <div class="wf-grid">${wf.imgs.map(([src, cap], k) => `<figure class="wf rv" style="--k:${k % 3}"><img src="assets/img/${src}.webp" alt="${esc(cap || `${p.title} wireframe ${k + 1}`)}" loading="lazy" />${cap ? `<figcaption>${esc(cap)}</figcaption>` : ''}</figure>`).join('')}</div>`);
    }
    if (p.lofi && p.lofi.length) {
      const lw = p.lofi.some(s => s.wide);
      const one = p.lofi.length === 1;
      const reel = one ? p.lofi : [...p.lofi, ...p.lofi, ...p.lofi, ...p.lofi];
      S('lofi', 'Mid fidelity', 'Mid-fidelity screens', `
        ${head('Mid Fidelity Screens')}
        <div class="reel lofi ${lw ? 'wide' : ''} ${one ? 'single' : ''} rv" aria-label="${esc(p.title)} mid-fidelity screens"><div class="reel-track" style="--dur:${p.lofi.length * (lw ? 10 : 8)}s">${reel.map((s, k) => `<figure class="lofi-slide ${s.tall ? 'tall' : ''}"><img src="assets/img/${s.src}.webp" alt="${k < p.lofi.length ? `${esc(p.title)} mid-fidelity screen: ${esc(s.name)}` : ''}" ${k >= p.lofi.length ? 'aria-hidden="true"' : ''} loading="lazy" /><figcaption>${esc(s.name)}</figcaption></figure>`).join('')}</div></div>`);
    }

    /* style guide: type specimen, colour bubbles, grid */
    if (c.style) {
      const st = c.style;
      const W8 = { bold: 700, semibold: 600, medium: 500, regular: 400 };
      const scale = use => use.split(/\s*·\s*/).map(r => r.match(/^(\S+)\s+(\d+)\s*([A-Za-z ]*)$/)).filter(Boolean)
        .map(([, n, px, w]) => [n, +px, w.trim() || 'Regular']);
      const faces = st.type.map(([fam, use, sample], k) => {
        const rows = scale(use), ff = `font-family:'${esc(fam)}', var(--f-sans)`;
        return `<div class="sg-spec rv" style="--k:${k}">
            <div class="sg-glyphs" style="${ff}"><span class="sg-big" aria-hidden="true">Aa</span>
              <p>abcdefghijklmnopqrstuvwxyz<br>ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>1234567890</p></div>
            <div class="sg-info"><h5>${esc(fam)}</h5>${rows.length ? `<ul class="sg-scale">${rows.map(([n, px, w]) => `
              <li><span>${esc(n)}</span><b style="${ff};font-size:${px}px;font-weight:${W8[w.toLowerCase().replace(/\s/g, '')] || 400}">${esc(sample || fam)}</b><em>${px} px · ${esc(w)}</em></li>`).join('')}</ul>`
              : `<p class="sg-role">${esc(use)}</p>${sample ? `<p class="sg-sample" style="${ff}">${esc(sample)}</p>` : ''}`}</div>
          </div>`;
      }).join('');
      const lum = hex => { const n = parseInt(hex.slice(1), 16), f = v => (v /= 255) <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; return .2126 * f(n >> 16) + .7152 * f(n >> 8 & 255) + .0722 * f(n & 255); };
      const SLOTS = [[46, 33, 21], [72, 20, 13], [74, 46, 12], [23, 18, 10], [21, 43, 7.5], [33, 54, 6]];
      const bubbles = st.colours.slice(0, SLOTS.length).map(([hex, name, role], k) => {
        const [cx, cy, r] = SLOTS[k], L = lum(hex);
        return `<button class="sg-sw sg-bub rv ${L > .82 ? 'pale' : ''}" style="--k:${k};--c:${hex};--ink:${L > .38 ? '#1C1C1E' : '#fff'};left:${cx - r}%;top:${(cy - r) / .6}%;width:${r * 2}%;z-index:${10 - k}" data-hex="${hex}" aria-label="${esc(name)}, ${hex}${role ? `, ${esc(role)}` : ''}. Copy hex" title="${role ? esc(role) : ''}"><b>${esc(name)}</b><span>${hex}</span></button>`;
      }).join('');
      const g = st.grid;
      let grid = '';
      if (g) {
        const m = g.margin / g.w * 100, gt = g.gutter / g.w * 100, cw = (100 - 2 * m - (g.cols - 1) * gt) / g.cols;
        const arrow = `<svg viewBox="0 0 26 10" aria-hidden="true"><path d="M1.5 5h23M5.5 1.5 1.5 5l4 3.5M20.5 1.5l4 3.5-4 3.5"/></svg>`;
        grid = `<div class="sg-block"><h4 class="rv">Grid</h4>
          <div class="sg-gridstage ${g.device === 'Mobile' ? 'phone' : 'wide'} rv" style="--k:1">
            <span class="sg-chip dev">${esc(g.device)} · ${g.w} px</span>
            <div class="sg-frame" style="--m:${m.toFixed(3)};--g:${gt.toFixed(3)};aspect-ratio:${g.device === 'Mobile' ? '9 / 17' : g.device === 'Desktop' ? '16 / 9.5' : '1280 / 698'}" role="img" aria-label="${g.cols}-column grid, ${g.margin} px margins, ${g.gutter} px gutters">
              <div class="sg-cols">${Array.from({ length: g.cols }, (_, k) => `<i style="--k:${k}"></i>`).join('')}</div>
              <span class="sg-note gut" style="left:${(m + cw + gt / 2).toFixed(2)}%">${arrow}<em>Gutters ${g.gutter}px</em></span>
              <span class="sg-note mar" style="left:${(m / 2).toFixed(2)}%">${arrow}<em>Margins ${g.margin}px</em></span>
              <span class="sg-note col" style="left:${(m + cw * (Math.ceil(g.cols / 2) - .5) + gt * (Math.ceil(g.cols / 2) - 1)).toFixed(2)}%">${arrow}<em>${g.cols} Columns</em></span>
            </div>
            <p class="sg-gridspec">${g.cols} columns · ${g.margin}px margins · ${g.gutter}px gutters</p>
          </div></div>`;
      }
      S('style', 'Style guide', 'Style guide', `
        ${head(st.head, st.sub)}
        <div class="sg2">
          <div class="sg-block"><h4 class="rv">Typography</h4>${faces}</div>
          <div class="sg-block"><h4 class="rv">Colour palette</h4>
            <div class="sg-bubbles">${bubbles}</div>
            <p class="sg-hint rv">Select a colour to copy its hex.</p></div>
          ${grid}
        </div>`);
    }
    const screensAt = secs.length;
    /* 06 — the final screens, on a slow continuous loop */
    const wide = !isMob;
    const loop = [...p.screens, ...p.screens, ...p.screens, ...p.screens];
    S('interface', 'Interface', 'Interface design', `
      ${head(c.interfaceHead || 'The final interface')}
      <div class="reel ${wide ? 'wide' : ''} rv" aria-label="${esc(p.title)} screens"><div class="reel-track" style="--dur:${p.screens.length * (wide ? 9 : 7)}s">${loop.map((s, k) => `<img src="assets/img/${s}.webp" alt="${k < p.screens.length ? `${esc(p.title)} screen ${k + 1}` : ''}" ${k >= p.screens.length ? 'aria-hidden="true"' : ''} loading="lazy" />`).join('')}</div></div>`);

    /* 07 — usability testing */
    if (p.testing) {
      const t = p.testing, spots = [[50, 90], [44, 52], [12, 9]];
      S('testing', 'Testing', 'Usability testing', `
        ${head('Eye tracking showed where attention really went.')}
        <div class="c-test">
          <div class="heat rv">
            <img src="assets/img/${t.img}.webp" alt="Eye-tracking heatmap over the NavAssist map screen" loading="lazy" />
            ${t.aois.map((_, k) => `<span class="aoi" data-k="${k}" style="left:${spots[k][0]}%;top:${spots[k][1]}%">${k + 1}</span>`).join('')}
          </div>
          <ol class="aoi-list">${t.aois.map(([b, s], k) => `<li class="rv" style="--k:${k}"><button data-k="${k}"><b><i>${k + 1}</i>${esc(b.replace(/^AOI \d · /, ''))}</b><span>${esc(s)}</span></button></li>`).join('')}</ol>
          <div class="sus rv" style="--v:${t.sus}">
            <svg viewBox="0 0 120 70" aria-hidden="true"><path class="trk" d="M10 62 A50 50 0 0 1 110 62"/><path class="val" d="M10 62 A50 50 0 0 1 110 62"/></svg>
            <b>${countSpan(String(t.sus))}</b>
            <span>SUS score out of 100. Above 80 is rated excellent.</span>
          </div>
        </div>
        ${c.issues ? `<div class="issues rv"><span class="cs-mini">Think-aloud findings</span><p class="issues-lead">${esc(c.issues.head)}</p>
          <table><thead><tr><th>Issue</th><th>Task</th><th>Participants</th><th>Severity</th></tr></thead><tbody>${c.issues.rows.map(([t, a, n, sv]) => `<tr><td>${esc(t)}</td><td>${esc(a)}</td><td><span class="dots" style="--n:${n}">${'<i></i>'.repeat(5)}</span>${n} of 5</td><td><em class="sev ${sv.toLowerCase()}">${esc(sv)}</em></td></tr>`).join('')}</tbody></table>
          <blockquote>${esc(c.issues.learning)}</blockquote></div>` : ''}`, 'test');
    } else if (c.study) {
      const st = c.study;
      S('testing', 'Testing', 'Usability testing', `
        ${head(st.head)}
        <div class="cs-tstats">${st.stats.map(([a, b], k) => `<div class="rv" style="--k:${k}"><b>${/^\d/.test(a) ? countSpan(a) : esc(a)}</b><span>${esc(b)}</span></div>`).join('')}</div>
        <div class="cs-areas rv">${st.areas.map((a, k) => `<span>${String(k + 1).padStart(2, '0')}. ${esc(a)}</span>`).join('')}</div>
        <div class="cs-cells cols-3 findings">${st.findings.map(([t, s], k) => `<div class="cell rv" style="--k:${k}"><span class="cs-mini">Finding</span><b>${esc(t)}</b><p>${esc(s)}</p></div>`).join('')}</div>
        ${st.noFlow ? '' : flowStrip(['Observed issue', 'UX implication', 'Design consideration'], st.flowNote || 'These findings point to what to refine next.')}`, 'test');
    }

    if (c.screensAfterTesting) { const i2 = secs.findIndex(s => s.id === 'interface'); const t2 = secs.findIndex(s => s.id === 'testing'); if (i2 > -1 && t2 > i2) secs.splice(t2, 0, secs.splice(i2, 1)[0]); }
    /* 08 — reflection */
    if (c.reflection) {
      const r = c.reflection;
      S('reflection', 'Reflection', 'Reflection', `
        ${head(r.head, r.sub)}
        <ol class="cs-learn">${r.learnings.map((l, k) => `<li class="rv" style="--k:${k}"><span>${String(k + 1).padStart(2, '0')}</span>${esc(l)}</li>`).join('')}</ol>
        <div class="cs-next rv"><span class="cs-mini">Next steps</span><ul>${r.next.map(n => `<li>${esc(n)}</li>`).join('')}</ul></div>`);
    }

    // number the sections in order
    let n = 0;
    const body = secs.map(s => {
      n++;
      const num = String(n).padStart(2, '0');
      if (s.raw) return s.raw.replace(/__N__/g, num);
      return `<section class="cs-sec cx tone-${s.tone || 'light'}" id="cs-${s.id}" data-num="${num}">
        <div class="cs-wrap"><span class="cs-label">${num} / ${esc(s.label)}</span><div class="cs-main">${s.inner}</div></div></section>`;
    }).join('');
    caseNav = secs.filter(s => ['research', 'persona', 'roles', 'features', 'style', 'lofi', 'wireframes', 'testing', 'interface'].includes(s.id)).slice(0, 5).map(s => [s.id, s.nav]);
    caseTotal = n;

    const meta = [p.client && ['Context', p.client], ['Role', c.role], ['Platform', p.platform], c.duration && ['Duration', c.duration]].filter(x => x && x[1]);
    const hero = `
      <header class="cs-hero cx" data-num="00">
        <div class="cs-wrap hero-grid">
          <div class="hero-copy">
            <h2 id="case-title" class="hp-title rv">${esc(p.title)}</h2>
            ${c.org ? `<p class="hp-org rv" style="--k:1">${esc(c.org)}</p>` : ''}
            <p class="hp-sum rv" style="--k:2">${esc(p.summary)}</p>
            <div class="hp-tags rv" style="--k:3">${p.tags.map(t => `<span>${esc(t)}</span>`).join('')}</div>
            <dl class="hp-meta rv" style="--k:4">${meta.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
          </div>
          <div class="c-stage" aria-hidden="true">
            <div class="iso">
              <div class="pl pl-0 ${isMob ? 'phones' : ''}" style="--i:0">${isMob ? p.stack.map(() => '<i></i>').join('') : ''}</div>
              <div class="pl pl-1 ${isMob ? 'phones' : ''}" style="--i:1">${isMob ? p.stack.map(() => '<i></i>').join('') : ''}</div>
              <div class="pl pl-3 ${isMob ? '' : 'desk'}" style="--i:2">${isMob ? p.stack.map(s => `<img src="assets/img/${s}.webp" alt="" />`).join('') : `<img src="assets/img/${p.stack[0]}.webp" alt="" />`}</div>
            </div>
          </div>
        </div>
      </header>`;

    const close = c.closing || [p.title + '.', p.sub + '.'];
    const foot = `
      <footer class="cs-close cx">
        <div class="cs-wrap">
          <span class="cs-label">${esc(p.title)} · ${esc(c.type || p.kicker)}</span>
          <p class="cs-close-line rv">${esc(close[0])}<br /><em>${esc(close[1])}</em></p>
          <div class="cs-close-row">
            <button class="c-next-btn">Next case file: <b>${esc(next.title)}</b> ${icon('i-right')}</button>
            <button class="cs-top">Back to top ${icon('i-up')}</button>
          </div>
        </div>
      </footer>`;
    return hero + body + foot;
  }

  let caseAbort = null, caseNav = [], caseTotal = 0;
  function countUp(el) {
    const to = +el.dataset.to, dec = +el.dataset.dec, pad = +el.dataset.pad;
    const fmt = v => { const s = v.toLocaleString('en-IN', { minimumFractionDigits: dec, maximumFractionDigits: dec }); return pad ? s.padStart(pad, '0') : s; };
    if (reduce) { el.textContent = fmt(to); return; }
    const t0 = performance.now(), D = 1300;
    const step = now => {
      const k = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - k, 3);
      el.textContent = fmt(to * e);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function wireCase(root, sig) {
    root.addEventListener('pointermove', e => {
      const c = e.target.closest('.spot');
      if (!c) return;
      const r = c.getBoundingClientRect();
      c.style.setProperty('--mx', e.clientX - r.left + 'px');
      c.style.setProperty('--my', e.clientY - r.top + 'px');
    }, { signal: sig });

    $$('.flip', root).forEach(f => f.addEventListener('click', () => f.setAttribute('aria-pressed', f.getAttribute('aria-pressed') !== 'true'), { signal: sig }));

    $$('.roles', root).forEach(r => {
      const tabs = $$('.role-tabs button', r), panes = $$('.role-pane', r);
      tabs.forEach((b, k) => b.addEventListener('click', () => {
        tabs.forEach((x, j) => x.setAttribute('aria-selected', j === k));
        panes.forEach((x, j) => x.classList.toggle('on', j === k));
      }, { signal: sig }));
    });

    $$('.pz-tabs', root).forEach(tl => {
      const tabs = $$('button', tl), panes = $$('.pz-pane', tl.parentElement);
      tabs.forEach((b, k) => b.addEventListener('click', () => {
        tabs.forEach((x, j) => x.setAttribute('aria-selected', j === k));
        panes.forEach((x, j) => x.classList.toggle('on', j === k));
      }, { signal: sig }));
    });
    $$('.c-test', root).forEach(t => {
      const set = k => { $$('.aoi', t).forEach(a => a.classList.toggle('hot', a.dataset.k === k)); $$('.aoi-list button', t).forEach(a => a.classList.toggle('hot', a.dataset.k === k)); };
      $$('.aoi-list button, .aoi', t).forEach(b => ['mouseenter', 'focus', 'click'].forEach(ev => b.addEventListener(ev, () => set(b.dataset.k), { signal: sig })));
      set('0');
    });

    $$('.viewer', root).forEach(v => {
      const imgs = $$('.v-stage img', v), th = $$('.v-thumbs button', v), n = imgs.length;
      let cur = 0;
      const go = k => {
        cur = (k + n) % n;
        imgs.forEach((im, j) => im.classList.toggle('on', j === cur));
        th.forEach((b, j) => b.setAttribute('aria-selected', j === cur));
        $('.v-count', v).textContent = `${cur + 1} / ${n}`;
        th[cur].scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduce ? 'auto' : 'smooth' });
      };
      th.forEach((b, k) => b.addEventListener('click', () => go(k), { signal: sig }));
      $('.v-nav.prev', v).addEventListener('click', () => go(cur - 1), { signal: sig });
      $('.v-nav.next', v).addEventListener('click', () => go(cur + 1), { signal: sig });
      v.addEventListener('keydown', e => { if (e.key === 'ArrowRight') go(cur + 1); if (e.key === 'ArrowLeft') go(cur - 1); }, { signal: sig });
    });

    // pinned horizontal timeline + device tilt, both driven by the sheet's own scroll
    const tls = $$('.c-tl', root), tilts = $$('.tilt', root);
    const update = () => {
      const br = body.getBoundingClientRect(), vh = body.clientHeight;
      tls.forEach(tl => {
        const track = $('.tl-track', tl), items = $$('.tl-item', tl);
        if (innerWidth <= 980) { items.forEach(it => it.classList.add('on')); track.style.transform = ''; return; }
        tl.style.setProperty('--vh', vh + 'px');
        const top = tl.getBoundingClientRect().top - br.top + body.scrollTop;
        const p = clamp((body.scrollTop - top) / (tl.offsetHeight - vh), 0, 1);
        track.style.transform = `translate3d(${-p * Math.max(0, track.scrollWidth - tl.clientWidth)}px,0,0)`;
        tl.style.setProperty('--p', p);
        items.forEach((it, k) => it.classList.toggle('on', reduce || k === 0 || p >= k / (items.length + 0.4)));
      });
      if (!reduce) tilts.forEach(t => {
        const r = t.getBoundingClientRect();
        const k = clamp((r.top + r.height / 2 - br.top) / vh, 0, 1.2);
        t.style.setProperty('--tilt', ((k - 0.5) * 14).toFixed(2) + 'deg');
      });
    };
    body.addEventListener('scroll', update, { passive: true, signal: sig });
    addEventListener('resize', update, { signal: sig });
    requestAnimationFrame(update);

    // top bar: section links and a live section counter
    const navEl = $('.cb-nav', caseEl), countEl = $('.cb-count', caseEl);
    navEl.innerHTML = caseNav.map(([id, label]) => `<a href="#cs-${id}" data-id="${id}">${esc(label)}</a>`).join('');
    $$('a', navEl).forEach(a => a.addEventListener('click', e => {
      e.preventDefault();
      const t = $('#cs-' + a.dataset.id, root);
      body.scrollTo({ top: t.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop, behavior: reduce ? 'auto' : 'smooth' });
    }, { signal: sig }));
    const total = String(caseTotal).padStart(2, '0');
    countEl.textContent = `00—${total}`;
    const secIO = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      countEl.textContent = `${e.target.dataset.num}—${total}`;
      const id = e.target.id.replace('cs-', '');
      $$('a', navEl).forEach(a => a.classList.toggle('on', a.dataset.id === id));
    }), { root: body, rootMargin: '-45% 0px -50% 0px' });
    $$('[data-num]', root).forEach(s => secIO.observe(s));
    sig.addEventListener('abort', () => secIO.disconnect());

    $$('.sg-sw', root).forEach(b => b.addEventListener('click', async () => { await copyText(b.dataset.hex); toast(`Copied ${b.dataset.hex}`); }, { signal: sig }));
    $('.cs-top', root).addEventListener('click', () => body.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }), { signal: sig });
  }

  function fillCase(i) {
    caseIdx = (i + P.length) % P.length;
    const p = P[caseIdx];
    const t = (p.cs && p.cs.theme) || {};
    const k = t.cards || [];
    sheet.style.cssText = `--accent:${p.accent};--accent2:${p.accent2};--tint:${p.tint};--cbg:${t.bg || '#F1EFEA'};--cdark:${t.dark || '#1E2622'};--csoft:${t.soft || '#E6E1D5'};--ctest:${t.test || t.soft || '#E6E1D5'};--acc:${t.acc || p.accent};--k1:${k[0] || '#E8E4DA'};--k2:${k[1] || '#E8E4DA'};--k3:${k[2] || '#E8E4DA'}`;
    $('.cb-name', caseEl).textContent = p.title;
    $('.cb-mono', caseEl).textContent = p.title[0] + '.';
    if (caseAbort) caseAbort.abort();
    caseAbort = new AbortController();
    body.innerHTML = renderCase(p, caseIdx);
    unwidow(body);
    body.scrollTop = 0;
    if (caseIO) caseIO.disconnect();
    caseIO = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      $$('.count', e.target).forEach(countUp);
      caseIO.unobserve(e.target);
    }), { root: body, threshold: 0.06 });
    $$('.cx, .rv', body).forEach(el => caseIO.observe(el));
    // safety net: the observer can skip frames on fast scrolls or jumps, so once
    // scrolling settles, reveal anything already scrolled past or on screen
    let pending = $$('.cx, .rv', body), sweepT = 0;
    const sweep = () => {
      const lim = body.getBoundingClientRect().bottom;
      pending = pending.filter(el => {
        if (el.classList.contains('in')) return false;
        if (el.getBoundingClientRect().top >= lim) return true;
        el.classList.add('in');
        $$('.count', el).forEach(countUp);
        caseIO.unobserve(el);
        return false;
      });
    };
    body.addEventListener('scroll', () => { clearTimeout(sweepT); sweepT = setTimeout(sweep, 140); }, { passive: true, signal: caseAbort.signal });
    caseAbort.signal.addEventListener('abort', () => clearTimeout(sweepT));
    setTimeout(sweep, 450);
    wireCase(body, caseAbort.signal);
    $('.c-next-btn', body).addEventListener('click', () => fillCase(caseIdx + 1));
  }

  let closeT = 0, caseOpen = false;
  function openCase(i) {
    clearTimeout(closeT);
    caseOpen = true;
    lastFocus = document.activeElement;
    fillCase(i);
    caseEl.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => requestAnimationFrame(() => caseEl.classList.add('open')));
    setTimeout(() => { if (caseOpen) caseEl.classList.add('open'); }, 120);
    setTimeout(() => sheet.focus(), 60);
  }
  function closeCase() {
    caseOpen = false;
    caseEl.classList.remove('open');
    document.body.style.overflow = '';
    closeT = setTimeout(() => { caseEl.hidden = true; body.innerHTML = ''; if (caseAbort) caseAbort.abort(); }, reduce ? 0 : 520);
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }
  $('.cb-close', caseEl).addEventListener('click', closeCase);
  $('.case-backdrop', caseEl).addEventListener('click', closeCase);
  $('.cb-next', caseEl).addEventListener('click', () => fillCase(caseIdx + 1));
  $('.cb-prev', caseEl).addEventListener('click', () => fillCase(caseIdx - 1));
  caseEl.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.preventDefault(); closeCase(); }
    if (e.key === 'Tab') {
      const f = $$('button, a[href], [tabindex="0"]', sheet).filter(x => x.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === sheet)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* =========================================================
     REVEALS, FRAME LABELS, PRINCIPLES, CONTACT
     ========================================================= */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal').forEach(el => io.observe(el));
  const frameIO = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('in', e.isIntersecting)), { threshold: 0.2 });
  $$('.frame-sec').forEach(el => frameIO.observe(el));
  $$('.about-h, .contact-h').forEach(el => io.observe(el));

  function frameSizes() {
    $$('.frame-sec').forEach(s => {
      const l = $('.fl-live', s);
      if (l) l.textContent = `${Math.round(s.offsetWidth)} × ${Math.round(s.offsetHeight)}`;
    });
  }

  // principles: one open at a time, gap badge shows where the 24 lives
  const alRow = $('.al-row');
  const cards = $$('.pr-card', alRow);
  function openCard(c) {
    cards.forEach(x => x.classList.toggle('is-open', x === c));
    setTimeout(() => {
      const idx = cards.indexOf(c);
      const ref = cards[idx === cards.length - 1 ? idx - 1 : idx];
      const rr = alRow.getBoundingClientRect(), cr = ref.getBoundingClientRect();
      alRow.style.setProperty('--gx', cr.right - rr.left + 12 + 'px');
    }, 820);
  }
  cards.forEach(c => { c.addEventListener('mouseenter', () => openCard(c)); c.addEventListener('focus', () => openCard(c)); });
  alRow.addEventListener('mouseenter', () => alRow.classList.add('show-gap'));
  alRow.addEventListener('mouseleave', () => alRow.classList.remove('show-gap'));

  // copy email
  $$('.copy-email').forEach(b => b.addEventListener('click', async () => {
    const ok = await copyText(b.dataset.email);
    if (!ok) { location.href = 'mailto:' + b.dataset.email; return; }
    b.classList.add('copied');
    $('span', b).textContent = 'Email copied';
    $('use', b).setAttribute('href', '#i-check');
    toast('divyanganabhave@gmail.com copied');
    setTimeout(() => { b.classList.remove('copied'); $('span', b).textContent = 'Copy my email'; $('use', b).setAttribute('href', '#i-copy'); }, 2600);
  }));

  // Pune clock
  const clock = $('.clock');
  const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const presence = $('.presence');
  const hourFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: 'numeric', hour12: false });
  const tick = () => {
    const now = new Date();
    clock.textContent = fmt.format(now);
    const hr = +hourFmt.format(now);
    const awake = hr >= 8 && hr < 23;
    presence.classList.toggle('away', !awake);
    presence.lastElementChild.textContent = awake ? 'awake in Pune' : 'probably asleep';
  };
  tick(); setInterval(tick, 1000);

  // big name spotlight
  const big = $('.big-name');
  big.addEventListener('pointermove', e => {
    const r = big.getBoundingClientRect();
    big.style.setProperty('--mx', e.clientX - r.left + 'px');
    big.style.setProperty('--my', e.clientY - r.top + 'px');
    big.style.setProperty('--r', Math.min(220, r.height * 0.9) + 'px');
    big.classList.add('live');
  });
  big.addEventListener('pointerleave', () => { big.classList.remove('live'); big.style.setProperty('--r', '0px'); });

  /* ---------- resize ---------- */
  let rzT;
  addEventListener('resize', () => {
    clearTimeout(rzT);
    rzT = setTimeout(() => {
      buildRulers(); sizeStrokes(); placeSelection(true); frameSizes();
      moveGlider(navLinks.find(l => l.classList.contains('is-active')) || navLinks[0]);
    }, 120);
  });
  addEventListener('load', () => { frameSizes(); moveGlider(navLinks.find(l => l.classList.contains('is-active')) || navLinks[0]); });
  unwidow(document);
  frameSizes();
  moveGlider(navLinks[0]);
})();
