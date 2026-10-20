/* =========================================================================
 *  PIII LAB — UX パターン
 *   Toast (種類・アクション・スタック・スワイプで消す)
 *   Bottom Sheet (ドラッグで閉じる / 確認ダイアログ)
 *   Swipe Action (横スワイプで裏のボタンが現れる)
 *   Pull to Refresh (モバイルで最上部から引っぱって更新)
 *   Skeleton Screen (読み込み中のプレースホルダー)
 *   Auto Complete (検索パレット + あいまい一致)
 * ========================================================================= */
(function (g) {
  'use strict';
  const { h, face } = U;
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TOUCH = 'ontouchstart' in g || navigator.maxTouchPoints > 0;

  U.ICONS.search = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>';
  U.ICONS.x = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  U.ICONS.undo = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 7L4 12l5 5"/><path d="M4 12h10a6 6 0 0 1 0 12h-2"/></svg>';
  U.ICONS.check = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

  /* ---------------- 横ドラッグの共通処理 ---------------- */
  function hDrag(el, o) {
    let x0 = 0, y0 = 0, dx = 0, on = false, decided = false, horiz = false, t0 = 0, mode = null;
    const down = (x, y, target, m) => {
      if (o.ignore && target.closest(o.ignore)) return;
      x0 = x; y0 = y; dx = 0; on = true; decided = false; horiz = false; t0 = Date.now(); mode = m;
    };
    const move = (x, y, ev) => {
      if (!on) return;
      const ddx = x - x0, ddy = y - y0;
      if (!decided) {
        if (Math.abs(ddx) < 8 && Math.abs(ddy) < 8) return;
        decided = true; horiz = Math.abs(ddx) > Math.abs(ddy) * 1.2;
        if (!horiz) { on = false; return; }
        o.start && o.start();
      }
      if (ev && ev.cancelable) ev.preventDefault();
      dx = ddx; o.move(dx);
    };
    const up = () => {
      if (!on) return;
      on = false;
      if (horiz) { el._dragged = Date.now(); o.end(dx, dx / Math.max(1, Date.now() - t0)); }
    };
    /* タッチ (スマホ) */
    el.addEventListener('touchstart', (e) => { if (e.touches.length === 1) down(e.touches[0].clientX, e.touches[0].clientY, e.target, 't'); }, { passive: true });
    el.addEventListener('touchmove', (e) => { if (mode === 't') move(e.touches[0].clientX, e.touches[0].clientY, e); }, { passive: false });
    el.addEventListener('touchend', () => { if (mode === 't') up(); });
    el.addEventListener('touchcancel', () => { if (mode === 't') up(); });
    /* マウス / ペン */
    el.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch' || e.button !== 0) return;
      down(e.clientX, e.clientY, e.target, 'p');
      const mv = (ev) => move(ev.clientX, ev.clientY, ev);
      const fin = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', fin); up(); };
      addEventListener('pointermove', mv); addEventListener('pointerup', fin);
    });
    el.addEventListener('click', (e) => { if (el._dragged && Date.now() - el._dragged < 350) { e.stopPropagation(); e.preventDefault(); } }, true);
  }

  /* ================= Toast ================= */
  const TICON = { ok: 'check', info: 'bulb', warn: 'bulb', err: 'x' };
  let stack = null;
  function toast(msg, opt) {
    opt = opt || {};
    if (!stack) { stack = h('div.tst-stack', { role: 'region', 'aria-label': '通知' }); document.body.appendChild(stack); }
    const type = opt.type || (/クリア|コピー|保存|ダウンロード|読み込み|更新/.test(msg) ? 'ok' : 'info');
    const dur = opt.dur || (opt.action ? 5200 : 2600);
    const bar = h('i.tst-bar', { style: { animationDuration: dur + 'ms' } });
    const el = h('div.tst.' + type, { role: 'status', 'aria-live': 'polite' },
      h('span.tst-ic', { html: U.ICONS[TICON[type]] || '' }),
      h('span.tst-msg', msg),
      opt.action ? h('button.tst-act', { onclick: () => { opt.onAction && opt.onAction(); close(); } }, opt.actionIcon !== false ? U.icon('undo') : null, opt.action) : null,
      h('button.tst-x', { 'aria-label': '閉じる', onclick: () => close() }, U.icon('x')),
      bar);
    stack.appendChild(el);
    while (stack.children.length > 3) stack.firstChild.remove();
    requestAnimationFrame(() => el.classList.add('on'));
    let tm = setTimeout(close, dur), closed = false;
    el.addEventListener('pointerenter', () => { clearTimeout(tm); el.classList.add('hold'); });
    el.addEventListener('pointerleave', () => { if (closed) return; el.classList.remove('hold'); tm = setTimeout(close, 1600); });
    hDrag(el, {
      ignore: 'button',
      start() { clearTimeout(tm); el.style.transition = 'none'; },
      move(dx) { el.style.transform = 'translateX(' + dx + 'px)'; el.style.opacity = String(Math.max(0, 1 - Math.abs(dx) / 220)); },
      end(dx, v) { el.style.transition = ''; if (Math.abs(dx) > 90 || Math.abs(v) > 0.6) { el.style.transform = 'translateX(' + (dx > 0 ? 420 : -420) + 'px)'; el.style.opacity = '0'; setTimeout(() => el.remove(), 260); closed = true; } else { el.style.transform = ''; el.style.opacity = ''; tm = setTimeout(close, 1600); } },
    });
    function close() { if (closed) return; closed = true; clearTimeout(tm); el.classList.remove('on'); el.classList.add('off'); setTimeout(() => el.remove(), 320); }
    return { close };
  }
  U.toast = toast;

  /* ================= Bottom Sheet ================= */
  let openSheets = 0;
  function sheet(o) {
    const back = h('div.bs-back');
    const handle = h('div.bs-handle', { 'aria-hidden': 'true' }, h('i'));
    const body = h('div.bs-body');
    if (o.body) body.appendChild(o.body);
    const acts = o.actions ? h('div.bs-acts', o.actions.map((a) => h('button.btn' + (a.kind ? '.' + a.kind : ''), { onclick: () => { const r = a.onClick && a.onClick(); if (r !== false) close(a.value); } }, a.label))) : null;
    const el = h('div.bs' + (o.cls ? '.' + o.cls : ''), { role: 'dialog', 'aria-modal': 'true', 'aria-label': o.title || 'シート' },
      handle,
      o.title ? h('div.bs-head', o.face ? h('span.bs-face', { html: face(o.face, o.mood || 'happy') }) : null, h('div', h('b', { html: o.title }), o.sub ? h('small', { html: o.sub }) : null), h('button.bs-x', { 'aria-label': '閉じる', onclick: () => close() }, U.icon('x'))) : null,
      body, acts);
    const prevFocus = document.activeElement;
    document.body.append(back, el);
    openSheets++; document.body.classList.add('bs-open');
    requestAnimationFrame(() => { back.classList.add('on'); el.classList.add('on'); });
    setTimeout(() => { const f = el.querySelector(o.focus || 'input, .bs-acts .btn:last-child, button'); if (f) f.focus(); }, 60);
    back.addEventListener('click', () => close());
    const onKey = (e) => { if (e.key === 'Escape') { e.preventDefault(); close(); } };
    document.addEventListener('keydown', onKey);
    // ドラッグで閉じる (ハンドルとヘッダ)
    let y0 = null, dy = 0, t0 = 0;
    [handle, el.querySelector('.bs-head')].filter(Boolean).forEach((z) => {
      z.addEventListener('pointerdown', (e) => { if (e.target.closest('button')) return; y0 = e.clientY; dy = 0; t0 = Date.now(); el.style.transition = 'none'; z.setPointerCapture(e.pointerId); });
      z.addEventListener('pointermove', (e) => { if (y0 === null) return; dy = Math.max(-20, e.clientY - y0); el.style.transform = 'translate(var(--bs-x), ' + (dy > 0 ? dy : dy / 3) + 'px)'; back.style.opacity = String(Math.max(0, 1 - dy / 400)); });
      const up = () => { if (y0 === null) return; y0 = null; el.style.transition = ''; back.style.opacity = ''; const v = dy / Math.max(1, Date.now() - t0); if (dy > 110 || v > 0.7) close(); else el.style.transform = ''; };
      z.addEventListener('pointerup', up); z.addEventListener('pointercancel', up);
    });
    let done = false, resolveP;
    const p = new Promise((r) => (resolveP = r));
    function close(val) {
      if (done) return; done = true;
      el.style.transform = ''; el.classList.remove('on'); back.classList.remove('on');
      document.removeEventListener('keydown', onKey);
      setTimeout(() => { el.remove(); back.remove(); if (--openSheets <= 0) { openSheets = 0; document.body.classList.remove('bs-open'); } }, 380);
      if (prevFocus && prevFocus.focus) prevFocus.focus({ preventScroll: true });
      o.onClose && o.onClose(val);
      resolveP(val);
    }
    return { el, close, done: p };
  }
  function ask(o) {
    return sheet({ title: o.title, sub: o.sub, face: o.face || 's', mood: o.mood, body: o.html ? h('div.prose.bs-msg', { html: o.html }) : null,
      actions: [{ label: o.cancel || 'やめる', kind: 'ghost', value: false }, { label: o.ok || 'OK', kind: o.danger ? 'danger' : 'ptr', value: true }] }).done.then((v) => v === true);
  }
  U.sheet = sheet; U.ask = ask;

  /* ================= Swipe Action ================= */
  /* swipe(el, { left: [{label, icon, cls, run}], right: {label, icon, run} }) → ラッパー要素 */
  let openSw = null;
  function swipe(el, o) {
    const actsL = h('div.sw-acts.l', (o.left || []).map((a) => h('button.sw-btn' + (a.cls ? '.' + a.cls : ''), { tabindex: -1, onclick: (e) => { e.stopPropagation(); snap(0); a.run(); } }, a.icon ? U.icon(a.icon) : null, h('span', a.label))));
    const actR = o.right ? h('div.sw-acts.r', h('span.sw-r', o.right.icon ? U.icon(o.right.icon) : null, h('span', o.right.label))) : null;
    const wrap = h('div.sw', actR, actsL, el);
    el.classList.add('sw-front');
    let base = 0;
    const W = () => actsL.offsetWidth || 150;
    function snap(x) { base = x; el.style.transform = x ? 'translateX(' + x + 'px)' : ''; wrap.classList.toggle('open', x !== 0); if (x) { if (openSw && openSw !== api) openSw.snap(0); openSw = api; } else if (openSw === api) openSw = null; }
    const api = { snap };
    hDrag(el, {
      start() { el.style.transition = 'none'; wrap.classList.add('drag'); },
      move(dx) { let x = base + dx; if (!o.right && x > 0) x = x / 4; if (x < -W()) x = -W() + (x + W()) / 4; el.style.transform = 'translateX(' + x + 'px)'; wrap.classList.toggle('pull-r', x > 70); wrap.classList.toggle('pull-l', x < -20); },
      end(dx, v) {
        el.style.transition = ''; wrap.classList.remove('drag', 'pull-r', 'pull-l');
        const x = base + dx;
        if (o.right && x > 90) { snap(0); o.right.run(); return; }
        if (x < -W() / 2 || v < -0.5) snap(-W()); else snap(0);
      },
    });
    wrap._sw = api;
    return wrap;
  }
  document.addEventListener('pointerdown', (e) => { if (openSw && !e.target.closest('.sw.open')) openSw.snap(0); });
  U.swipe = swipe;
  /* 初回だけ「スワイプできるよ」とチラ見せ */
  U.swipeHint = function (wrap) {
    if (RM || sessionStorage.getItem('p3:swhint')) return;
    sessionStorage.setItem('p3:swhint', '1');
    const el = wrap.querySelector('.sw-front');
    setTimeout(() => { wrap.classList.add('peek'); el.style.transform = 'translateX(-64px)'; setTimeout(() => { el.style.transform = ''; setTimeout(() => wrap.classList.remove('peek'), 400); }, 900); }, 700);
  };

  /* ================= Pull to Refresh ================= */
  U.pullToRefresh = function (onRefresh) {
    if (!TOUCH) return;
    document.documentElement.classList.add('p2r-ready');
    const ind = h('div.p2r', { 'aria-hidden': 'true' }, h('div.p2r-ball', { html: face('r', 'happy') }), h('span.p2r-t', '引っぱって更新'));
    document.body.appendChild(ind);
    const TH = 72;
    let y0 = null, dy = 0, busy = false;
    const blocked = (t) => t.closest('.CodeMirror, .bs, .rail, .sh-screen, .code, textarea, input, .tr-code, .imglab canvas') || document.body.classList.contains('bs-open') || document.body.classList.contains('rail-open');
    addEventListener('touchstart', (e) => { if (busy || scrollY > 0 || e.touches.length !== 1 || blocked(e.target)) { y0 = null; return; } y0 = e.touches[0].clientY; dy = 0; }, { passive: true });
    addEventListener('touchmove', (e) => {
      if (y0 === null) return;
      const d = e.touches[0].clientY - y0;
      if (d <= 0 || scrollY > 0) { if (dy) reset(); y0 = d <= 0 ? null : y0; return; }
      e.preventDefault();
      dy = Math.min(140, d * 0.5);
      ind.style.setProperty('--y', dy + 'px'); ind.style.setProperty('--r', (dy / TH * 300) + 'deg');
      ind.classList.add('on'); ind.classList.toggle('ready', dy >= TH);
      ind.querySelector('.p2r-t').textContent = dy >= TH ? '離して更新!' : '引っぱって更新';
      if (dy >= TH && !ind._buzz) { ind._buzz = 1; if (navigator.vibrate) navigator.vibrate(8); ind.querySelector('.p2r-ball').innerHTML = face('r', 'wow'); }
      if (dy < TH) { ind._buzz = 0; ind.querySelector('.p2r-ball').innerHTML = face('r', 'happy'); }
    }, { passive: false });
    addEventListener('touchend', () => {
      if (y0 === null) return; y0 = null;
      if (dy >= TH) {
        busy = true; ind.classList.add('busy'); ind.style.setProperty('--y', TH + 'px');
        ind.querySelector('.p2r-t').textContent = '更新中…';
        Promise.resolve(onRefresh()).then(() => { ind.querySelector('.p2r-t').textContent = '更新しました'; ind.querySelector('.p2r-ball').innerHTML = face('s', 'happy'); setTimeout(() => { busy = false; reset(); }, 650); });
      } else reset();
    });
    function reset() { dy = 0; ind.classList.remove('on', 'ready', 'busy'); ind.style.setProperty('--y', '0px'); }
  };

  /* ================= Skeleton Screen ================= */
  U.skel = function (kind, n) {
    if (kind === 'code') return h('div.skel.skel-code', Array.from({ length: n || 12 }, (_, i) => h('i', { style: { width: [38, 62, 18, 70, 55, 84, 44, 66, 30, 76, 50, 24][i % 12] + '%', '--d': i * 40 + 'ms' } })));
    if (kind === 'img') return h('div.skel.skel-img', Array.from({ length: n || 3 }, (_, i) => h('div', { style: { '--d': i * 120 + 'ms' } }, h('i.cap'), h('i.pic'))));
    if (kind === 'lines') return h('div.skel.skel-lines', Array.from({ length: n || 4 }, (_, i) => h('i', { style: { width: [92, 76, 84, 58, 70][i % 5] + '%', '--d': i * 60 + 'ms' } })));
    return h('div.skel');
  };

  /* ================= Auto Complete (検索パレット) ================= */
  const norm = (s) => String(s || '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').normalize('NFKC').toLowerCase();
  function score(q, it) {
    if (!q) return it.pri || 0;
    const L = it._l || (it._l = norm(it.label)), K = it._k || (it._k = norm((it.sub || '') + ' ' + (it.kw || '') + ' ' + (it.kind || '')));
    let s = 0;
    const words = q.split(/\s+/).filter(Boolean);
    for (const w of words) {
      const i = L.indexOf(w);
      if (i === 0) s += 120; else if (i > 0) s += 80 - Math.min(i, 30);
      else if (K.indexOf(w) >= 0) s += 30;
      else { // サブシーケンス一致
        let k = 0; for (const ch of L) if (ch === w[k]) k++;
        if (k === w.length) s += 12; else return -1;
      }
    }
    return s + (it.pri || 0) / 10;
  }
  function mark(label, q) {
    const raw = String(label).replace(/<[^>]+>/g, '');
    if (!q) return U.esc(raw);
    const n = raw.normalize('NFKC').toLowerCase();
    const w = q.split(/\s+/).filter(Boolean)[0] || '';
    const i = n.indexOf(w);
    if (i < 0) return U.esc(raw);
    return U.esc(raw.slice(0, i)) + '<mark>' + U.esc(raw.slice(i, i + w.length)) + '</mark>' + U.esc(raw.slice(i + w.length));
  }
  let palItems = [];
  U.setSearchIndex = (items) => { palItems = items; };
  function palette() {
    if (document.querySelector('.bs.pal')) return;
    const inp = h('input.pal-in', { type: 'search', placeholder: '章・課題・関数・用語を検索 (例: 転置, strcpy, 4-2)', 'aria-label': '検索', autocomplete: 'off', role: 'combobox', 'aria-expanded': 'true', 'aria-controls': 'pal-list' });
    const list = h('ul.pal-list#pal-list', { role: 'listbox' });
    const ghost = h('span.pal-ghost');
    const recent = () => { try { return JSON.parse(localStorage.getItem('p3lab:recentq') || '[]'); } catch (e) { return []; } };
    let sel = 0, cur = [];
    function render() {
      const q = norm(inp.value).trim();
      cur = palItems.map((it) => ({ it, s: score(q, it) })).filter((x) => x.s >= 0).sort((a, b) => b.s - a.s).slice(0, 40).map((x) => x.it);
      sel = 0; list.innerHTML = '';
      if (!q && recent().length) list.appendChild(h('li.pal-sec', '最近の検索'), ...recent().map((r) => h('li.pal-rec', { onclick: () => { inp.value = r; render(); inp.focus(); } }, U.icon('search'), r)));
      if (!q) list.appendChild(h('li.pal-sec', 'おすすめ'));
      if (!cur.length) list.appendChild(h('li.pal-empty', { html: '「' + U.esc(inp.value) + '」に一致するものはありません。<br>別の言葉 (例: 配列, ポインタ, diff) で試してみて。' }));
      cur.forEach((it, k) => {
        const li = h('li.pal-it' + (k === 0 ? '.on' : ''), { role: 'option', 'data-k': k, onclick: () => go(it), onpointermove: () => setSel(k) },
          h('span.pal-kind.' + (it.kc || 'k0'), it.kind || ''),
          h('span.pal-main', h('b', { html: mark(it.label, q) }), it.sub ? h('small', { html: mark(it.sub, '') }) : null),
          h('span.pal-go', U.icon('arrow')));
        list.appendChild(li);
      });
      // インライン補完 (ゴースト)
      const top = cur[0], v = inp.value;
      ghost.textContent = '';
      if (top && v && norm(top.label).startsWith(norm(v))) ghost.innerHTML = '<span>' + U.esc(v) + '</span>' + U.esc(String(top.label).replace(/<[^>]+>/g, '').slice(v.length));
    }
    function setSel(k) { sel = k; list.querySelectorAll('.pal-it').forEach((x) => x.classList.toggle('on', +x.dataset.k === k)); const o = list.querySelector('.pal-it.on'); if (o) o.scrollIntoView({ block: 'nearest' }); }
    function go(it) {
      const q = inp.value.trim();
      if (q) { const r = [q].concat(recent().filter((x) => x !== q)).slice(0, 5); localStorage.setItem('p3lab:recentq', JSON.stringify(r)); }
      S.close();
      setTimeout(() => { if (it.run) it.run(); else if (it.href) location.href = it.href; else if (it.go) { const t = document.querySelector(it.go); if (t) { t.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' }); t.classList.add('flash'); setTimeout(() => t.classList.remove('flash'), 1400); } } }, 200);
    }
    inp.addEventListener('input', render);
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSel(Math.min(cur.length - 1, sel + 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setSel(Math.max(0, sel - 1)); }
      else if (e.key === 'Enter') { e.preventDefault(); if (cur[sel]) go(cur[sel]); }
      else if ((e.key === 'Tab' || e.key === 'ArrowRight') && ghost.textContent && inp.selectionStart === inp.value.length) { e.preventDefault(); inp.value = String(cur[0].label).replace(/<[^>]+>/g, ''); render(); }
    });
    const body = h('div.pal', h('div.pal-box', U.icon('search'), h('div.pal-field', ghost, inp), h('kbd', 'Esc')), list,
      h('div.pal-foot', h('span', h('kbd', '↑'), h('kbd', '↓'), ' 選択'), h('span', h('kbd', 'Tab'), ' 補完'), h('span', h('kbd', 'Enter'), ' 移動')));
    const S = sheet({ cls: 'pal', body, focus: '.pal-in' });
    render();
  }
  U.palette = palette;
  document.addEventListener('keydown', (e) => {
    const typing = e.target.closest && e.target.closest('input, textarea, .CodeMirror, [contenteditable]');
    if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) { e.preventDefault(); palette(); }
  });

  /* ================= CodeMirror 用 Auto Complete ================= */
  const C_KW = ['int', 'double', 'float', 'char', 'void', 'long', 'short', 'unsigned', 'signed', 'const', 'static', 'struct', 'typedef', 'sizeof', 'return', 'if', 'else', 'for', 'while', 'do', 'break', 'continue', 'switch', 'case', 'default', 'NULL', 'EOF', 'stdin', 'stdout', 'stderr', 'FILE'];
  const C_FN = {
    printf: 'printf(const char *fmt, ...)', fprintf: 'fprintf(FILE *fp, const char *fmt, ...)', scanf: 'scanf(const char *fmt, ...)', puts: 'puts(const char *s)', putchar: 'putchar(int c)', getchar: 'getchar(void)',
    sqrt: 'sqrt(double x)', fabs: 'fabs(double x)', abs: 'abs(int x)', pow: 'pow(double x, double y)', floor: 'floor(double x)', ceil: 'ceil(double x)', log: 'log(double x)', exp: 'exp(double x)', cos: 'cos(double x)', sin: 'sin(double x)',
    rand: 'rand(void)', srand: 'srand(unsigned seed)', strlen: 'strlen(const char *s)', strcpy: 'strcpy(char *dst, const char *src)', strncpy: 'strncpy(char *dst, const char *src, size_t n)', strcmp: 'strcmp(const char *a, const char *b)',
    assert: 'assert(条件)', exit: 'exit(int status)', fopen: 'fopen(const char *name, const char *mode)', fclose: 'fclose(FILE *fp)', fread: 'fread(void *p, size_t size, size_t n, FILE *fp)', fwrite: 'fwrite(const void *p, size_t size, size_t n, FILE *fp)',
  };
  const SNIP = [
    { text: 'for (i=0; i<n; i++) {\n    \n}', label: 'for (i=0; i<n; i++) { }', k: 'snip', key: 'for' },
    { text: 'fprintf(stderr, "");', label: 'fprintf(stderr, "…");', k: 'snip', key: 'fprintf' },
    { text: 'scanf("%lf", &);', label: 'scanf("%lf", &…);', k: 'snip', key: 'scanf' },
    { text: 'tmp = A[i][j];\nA[i][j] = A[j][i];\nA[j][i] = tmp;', label: 'tmp で A[i][j] と A[j][i] を交換', k: 'snip', key: 'tmp' },
  ];
  function scanSrc(files) {
    const ids = new Map(), fields = new Map(), protos = new Map(), macros = new Set();
    Object.values(files || {}).forEach((src) => {
      if (typeof src !== 'string') return;
      const code = src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/.*$/gm, ' ').replace(/"(?:\\.|[^"\\])*"/g, '""');
      (code.match(/#define\s+([A-Za-z_]\w*)/g) || []).forEach((m) => macros.add(m.split(/\s+/)[1]));
      code.replace(/struct\s*\w*\s*\{([^{}]*)\}\s*(\w*)/g, (_, body, nm) => {
        body.split(';').forEach((d) => { const m = /([A-Za-z_]\w*)\s*(\[[^\]]*\])*\s*$/.exec(d.trim()); if (m && !C_KW.includes(m[1])) fields.set(m[1], (nm || 'struct') + ' のメンバー'); });
      });
      code.replace(/(?:^|\n)\s*((?:unsigned\s+|const\s+|static\s+)*[A-Za-z_]\w*\s*\**)\s*([A-Za-z_]\w*)\s*\(([^()]*)\)\s*[;{]/g, (_, ret, nm, args) => { if (!['if', 'for', 'while', 'switch', 'return', 'sizeof'].includes(nm)) protos.set(nm, ret.trim() + ' ' + nm + '(' + args.replace(/\s+/g, ' ').trim() + ')'); });
      (code.match(/\b[A-Za-z_]\w*\b/g) || []).forEach((w) => { if (w.length > 1 && !C_KW.includes(w)) ids.set(w, (ids.get(w) || 0) + 1); });
    });
    return { ids, fields, protos, macros };
  }
  U.cHint = function (cm, getFiles) {
    const CM = g.CodeMirror;
    const cur = cm.getCursor(), line = cm.getLine(cur.line).slice(0, cur.ch);
    const mem = /(\.|->)\s*([A-Za-z_]\w*)?$/.exec(line);
    const wm = /[A-Za-z_]\w*$/.exec(line);
    const word = mem ? (mem[2] || '') : wm ? wm[0] : '';
    const from = CM.Pos(cur.line, cur.ch - word.length);
    const S = scanSrc(getFiles());
    const out = [];
    const add = (text, kind, info, extra) => out.push(Object.assign({ text, displayText: text, kind, info }, extra || {}));
    if (mem) S.fields.forEach((info, f) => add(f, 'field', info));
    else {
      SNIP.forEach((s) => { if (word && s.key.startsWith(word)) add(s.text, 'snip', 'スニペット', { displayText: s.label }); });
      S.protos.forEach((sig, f) => add(f, 'fn', sig));
      Object.keys(C_FN).forEach((f) => { if (!S.protos.has(f)) add(f, 'lib', C_FN[f]); });
      S.macros.forEach((m) => add(m, 'macro', '#define'));
      C_KW.forEach((k) => add(k, 'kw', 'キーワード'));
      S.ids.forEach((n, id) => { if (!S.protos.has(id) && !S.macros.has(id) && !C_FN[id] && id !== word) add(id, 'var', 'このファイルの名前'); });
    }
    const w = word.toLowerCase();
    const seen = new Set();
    const list = out.filter((c) => { const t = (c.kind === 'snip' ? c.text : c.text).toLowerCase(); if (seen.has(c.displayText)) return false; const ok = !w || t.startsWith(w) || (w.length >= 2 && t.includes(w)); if (ok) seen.add(c.displayText); return ok && !(c.text === word && c.kind !== 'snip'); })
      .sort((a, b) => { const o = { field: 0, snip: 1, fn: 2, macro: 3, var: 4, lib: 5, kw: 6 }; const pa = a.text.toLowerCase().startsWith(w) ? 0 : 1, pb = b.text.toLowerCase().startsWith(w) ? 0 : 1; return pa - pb || o[a.kind] - o[b.kind] || a.text.length - b.text.length; })
      .slice(0, 14);
    list.forEach((c) => { c.render = (el) => { el.appendChild(h('span.ac-k.' + c.kind, { fn: 'f', lib: 'f', kw: 'k', var: 'v', field: '.', macro: '#', snip: '⚡' }[c.kind])); el.appendChild(h('span.ac-t', c.displayText.split('\n')[0])); if (c.info) el.appendChild(h('span.ac-i', c.info)); }; });
    return { list, from, to: cur };
  };
  U.attachCHint = function (cm, getFiles) {
    if (!g.CodeMirror || !cm.showHint) return;
    const show = () => cm.showHint({ hint: (c) => U.cHint(c, getFiles), completeSingle: false, closeCharacters: /[\s()\[\]{};:>,=+*\/]/ });
    cm.on('inputRead', (c, ch) => {
      if (c.state.completionActive) return;
      const t = ch.text.join('');
      const line = c.getLine(c.getCursor().line).slice(0, c.getCursor().ch);
      if (/->$|\.$/.test(line) && !/\d\.$/.test(line)) return show();
      if (/^[A-Za-z_]$/.test(t)) { const m = /[A-Za-z_]\w*$/.exec(line); if (m && m[0].length >= 2 && !/"[^"]*$/.test(line) && !/\/\*|\/\//.test(line)) show(); }
    });
    cm.addKeyMap({ 'Ctrl-Space': show });
  };

  g.UX = { toast, sheet, ask, swipe, palette };
})(window);
