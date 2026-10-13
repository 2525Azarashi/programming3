/* PIII LAB — 共通ユーティリティ */
(function (g) {
  'use strict';
  // h('div.cls#id', {attrs}, ...children)
  function h(sel, attrs, ...kids) {
    const m = /^([a-z0-9]+)?((?:[.#][\w-]+)*)$/i.exec(sel) || [];
    const el = document.createElement(m[1] || 'div');
    (m[2] || '').replace(/([.#])([\w-]+)/g, (_, t, v) => { if (t === '.') el.classList.add(v); else el.id = v; });
    if (attrs && (typeof attrs !== 'object' || attrs instanceof Node || Array.isArray(attrs))) { kids.unshift(attrs); attrs = null; }
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v === null || v === undefined || v === false) continue;
      if (k === 'html') el.innerHTML = v;
      else if (k === 'text') el.textContent = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k === 'class') el.className += ' ' + v;
      else el.setAttribute(k, v === true ? '' : v);
    }
    add(el, kids);
    return el;
  }
  function add(el, kids) {
    for (const k of kids) {
      if (k === null || k === undefined || k === false) continue;
      if (Array.isArray(k)) add(el, k);
      else el.appendChild(k instanceof Node ? k : document.createTextNode(String(k)));
    }
  }
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* C のシンタックスハイライト (表示専用) */
  const KW = /^(if|else|for|while|do|return|break|continue|switch|case|default|sizeof|typedef|struct|static|const|unsigned|signed|goto)$/;
  const TY = /^(int|double|float|char|void|long|short|size_t|FILE|[a-z_]+_t)$/;
  const FN = /^(printf|scanf|fprintf|puts|putchar|getchar|sqrt|fabs|pow|rand|srand|strlen|strcpy|strncpy|strcmp|malloc|free|calloc|assert|exit|log|cos|sin|floor)$/;
  function hlLine(s) {
    let out = '', i = 0;
    const n = s.length;
    while (i < n) {
      const c = s[i];
      if (s.startsWith('/*', i)) { let j = s.indexOf('*/', i + 2); j = j < 0 ? n : j + 2; out += '<span class="tk-c">' + esc(s.slice(i, j)) + '</span>'; i = j; continue; }
      if (s.startsWith('//', i)) { out += '<span class="tk-c">' + esc(s.slice(i)) + '</span>'; break; }
      if (c === '#' && !s.slice(0, i).trim()) { out += '<span class="tk-p">' + esc(s.slice(i)) + '</span>'; break; }
      if (c === '"' || c === "'") { let j = i + 1; while (j < n && s[j] !== c) { if (s[j] === '\\') j++; j++; } j++; out += '<span class="tk-s">' + esc(s.slice(i, j)) + '</span>'; i = j; continue; }
      if (/[A-Za-z_]/.test(c)) { let j = i; while (j < n && /\w/.test(s[j])) j++; const w = s.slice(i, j); out += KW.test(w) ? '<span class="tk-k">' + w + '</span>' : TY.test(w) ? '<span class="tk-t">' + w + '</span>' : FN.test(w) ? '<span class="tk-f">' + w + '</span>' : esc(w); i = j; continue; }
      if (/[0-9]/.test(c)) { let j = i; while (j < n && /[0-9a-fA-FxX.]/.test(s[j])) j++; out += '<span class="tk-n">' + s.slice(i, j) + '</span>'; i = j; continue; }
      if (c === '&' && s[i + 1] !== '&' && s[i - 1] !== '&') { out += '<span class="tk-o">&amp;</span>'; i++; continue; }
      if (c === '*' && s[i + 1] !== '/' && s[i - 1] !== '/') { out += '<span class="tk-o">*</span>'; i++; continue; }
      if (s.startsWith('->', i)) { out += '<span class="tk-o">-&gt;</span>'; i += 2; continue; }
      out += esc(c); i++;
    }
    return out;
  }
  // 複数行コメントを跨ぐハイライト
  function hlCode(src) {
    const lines = src.replace(/\r\n?/g, '\n').split('\n');
    let inC = false;
    return lines.map((l) => {
      let pre = '';
      if (inC) {
        const e = l.indexOf('*/');
        if (e < 0) return '<span class="tk-c">' + esc(l) + '</span>';
        pre = '<span class="tk-c">' + esc(l.slice(0, e + 2)) + '</span>'; l = l.slice(e + 2); inC = false;
      }
      const ls = l.lastIndexOf('/*'), le = l.lastIndexOf('*/');
      if (ls >= 0 && le < ls && !/"[^"]*\/\*/.test(l)) { inC = true; return pre + hlLine(l.slice(0, ls)) + '<span class="tk-c">' + esc(l.slice(ls)) + '</span>'; }
      return pre + hlLine(l);
    });
  }
  function codeBlock(src, opts) {
    opts = opts || {};
    const el = h('div.code', { role: 'region', 'aria-label': opts.label || 'コード' });
    hlCode(src).forEach((html, i) => {
      const ln = h('div.ln', { 'data-l': i + 1 }, h('i', String(i + 1)), h('span', { html: html || ' ' }));
      if (opts.hl && opts.hl.includes(i + 1)) ln.classList.add('hl');
      el.appendChild(ln);
    });
    return el;
  }

  /* 保存 */
  const store = {
    get(k, d) { try { const v = localStorage.getItem('p3lab:' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('p3lab:' + k, JSON.stringify(v)); } catch (e) { /* ignore */ } },
    del(k) { try { localStorage.removeItem('p3lab:' + k); } catch (e) { /* ignore */ } },
  };

  let toastT;
  function toast(msg) {
    let t = document.querySelector('.toast');
    if (!t) { t = h('div.toast', { role: 'status' }); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2200);
  }

  const ICONS = {
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5v14l12-7z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5v14l9-7zM16 5h3v14h-3z"/></svg>',
    prev: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 5v14l-9-7zM5 5h3v14H5z"/></svg>',
    first: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 5v14M18 6l-8 6 8 6"/></svg>',
    last: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 5v14M6 6l8 6-8 6"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    run: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
    trace: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="8" height="6" rx="1.5"/><rect x="13" y="14" width="8" height="6" rx="1.5"/><path d="M11 7h3a3 3 0 0 1 3 3v4"/></svg>',
    reset: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.6M4 4v4.6h4.6"/></svg>',
    bulb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    dl: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a1 1 0 0 1 1-1h10"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h10"/></svg>',
  };
  const icon = (n) => { const s = h('span', { html: ICONS[n] }); return s.firstChild; };

  g.U = { h, esc, hlCode, codeBlock, store, toast, icon, ICONS };
})(window);
