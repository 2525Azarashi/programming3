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
      else if (k === 'style' && typeof v === 'object') { for (const sk in v) { if (sk.startsWith('--')) el.style.setProperty(sk, v[sk]); else el.style[sk] = v[sk]; } }
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
    term: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="4" width="19" height="16" rx="2.5"/><path d="M7 9l3 3-3 3M12.5 15H17"/></svg>',
    trace: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="8" height="6" rx="1.5"/><rect x="13" y="14" width="8" height="6" rx="1.5"/><path d="M11 7h3a3 3 0 0 1 3 3v4"/></svg>',
    reset: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.6M4 4v4.6h4.6"/></svg>',
    bulb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    dl: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a1 1 0 0 1 1-1h10"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h10"/></svg>',
  };
  const icon = (n) => { const s = h('span', { html: ICONS[n] }); return s.firstChild; };

  /* キャラクターの顔 (SVG) — who: 's' サカイ (TA) / 'r' リョウガ (受講生)
     mood: normal / happy / wow / think */
  const INK = '#3b2738';
  function face(who, mood) {
    mood = mood || 'normal';
    const S = who === 's';
    const bg = S ? '#c8f1e8' : '#ffe9a6';
    const hair = S ? '#2f6f78' : '#e0773a';
    const skin = '#ffe6d6';
    let s = `<svg viewBox="0 0 64 64" class="face face-${who} mood-${mood}" aria-hidden="true">`;
    s += `<circle cx="32" cy="32" r="31" fill="${bg}"/>`;
    // 後ろ髪
    if (S) s += `<path d="M13 36 C11 22 20 12 32 12 C45 12 54 22 51 38 L51 47 C47 49 46 44 46 40 L18 40 C18 44 17 49 13 47 Z" fill="${hair}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`;
    // 顔
    s += `<circle cx="13.5" cy="38" r="3.6" fill="${skin}" stroke="${INK}" stroke-width="2"/><circle cx="50.5" cy="38" r="3.6" fill="${skin}" stroke="${INK}" stroke-width="2"/>`;
    s += `<ellipse cx="32" cy="38" rx="18" ry="17" fill="${skin}" stroke="${INK}" stroke-width="2.2"/>`;
    // 前髪
    if (S) s += `<path d="M14 33 C14 20 22 13 32 13 C43 13 51 20 50 33 C46 27 40 24 34 23 C30 28 22 31 14 33 Z" fill="${hair}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`;
    else s += `<path d="M13 34 L14.5 21 L19.5 24.5 L21 13 L27.5 19 L31.5 8.5 L37 18 L43.5 12 L45 23 L51 20 L51 34 C46 27.5 40 25 32 25 C24 25 18 27.5 13 34 Z" fill="${hair}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`;
    // 目
    const ey = 39, ex1 = 25, ex2 = 39;
    s += '<g class="eyes">';
    if (mood === 'happy') s += `<path d="M${ex1 - 3.2} ${ey + 1} Q${ex1} ${ey - 3.4} ${ex1 + 3.2} ${ey + 1}M${ex2 - 3.2} ${ey + 1} Q${ex2} ${ey - 3.4} ${ex2 + 3.2} ${ey + 1}" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>`;
    else if (mood === 'wow') s += `<circle cx="${ex1}" cy="${ey}" r="3.4" fill="${INK}"/><circle cx="${ex2}" cy="${ey}" r="3.4" fill="${INK}"/><circle cx="${ex1 + 1.2}" cy="${ey - 1.2}" r="1.2" fill="#fff"/><circle cx="${ex2 + 1.2}" cy="${ey - 1.2}" r="1.2" fill="#fff"/>`;
    else if (mood === 'think') s += `<circle cx="${ex1 + 1}" cy="${ey - 1}" r="2.4" fill="${INK}"/><circle cx="${ex2 + 1}" cy="${ey - 1}" r="2.4" fill="${INK}"/><path d="M${ex2 - 3} ${ey - 6} L${ex2 + 3} ${ey - 7.5}" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/>`;
    else s += `<ellipse cx="${ex1}" cy="${ey}" rx="2.4" ry="2.9" fill="${INK}"/><ellipse cx="${ex2}" cy="${ey}" rx="2.4" ry="2.9" fill="${INK}"/><circle cx="${ex1 + .9}" cy="${ey - 1}" r=".9" fill="#fff"/><circle cx="${ex2 + .9}" cy="${ey - 1}" r=".9" fill="#fff"/>`;
    s += '</g>';
    // メガネ (サカイ)
    if (S) s += `<g fill="rgba(255,255,255,.28)" stroke="${INK}" stroke-width="1.8"><circle cx="${ex1}" cy="${ey}" r="6.2"/><circle cx="${ex2}" cy="${ey}" r="6.2"/></g><path d="M${ex1 + 6.2} ${ey} Q32 ${ey - 2} ${ex2 - 6.2} ${ey}" fill="none" stroke="${INK}" stroke-width="1.8"/>`;
    // ほっぺ
    s += `<ellipse cx="19.5" cy="46" rx="3.6" ry="2.2" fill="#ff9fbf" opacity=".75"/><ellipse cx="44.5" cy="46" rx="3.6" ry="2.2" fill="#ff9fbf" opacity=".75"/>`;
    // 口
    if (mood === 'wow') s += `<ellipse cx="32" cy="48.5" rx="2.8" ry="3.4" fill="#d9465f" stroke="${INK}" stroke-width="1.8"/>`;
    else if (mood === 'think') s += `<path d="M28.5 48.5 Q30.5 47 32.5 48.5 T36 48" fill="none" stroke="${INK}" stroke-width="1.9" stroke-linecap="round"/>`;
    else if (!S || mood === 'happy') s += `<path d="M27.5 46.2 Q32 53.5 36.5 46.2 Z" fill="#d9465f" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>`;
    else s += `<path d="M28.5 46.5 Q32 49.8 35.5 46.5" fill="none" stroke="${INK}" stroke-width="1.9" stroke-linecap="round"/>`;
    // 汗 (think のリョウガ)
    if (!S && mood === 'think') s += `<path d="M50 26 Q53 31 50 33 Q47 31 50 26 Z" fill="#9fdcff" stroke="${INK}" stroke-width="1.4"/>`;
    s += '</svg>';
    return s;
  }
  function moodOf(who, html) {
    const t = String(html).replace(/<[^>]+>/g, '');
    if (/[?？]\s*$|…\s*$|ような…|かな/.test(t)) return 'think';
    if (/[!！]/.test(t)) return who === 'r' ? 'wow' : 'happy';
    if (/^(そう|その通り|正解|いいね|ばっちり|完璧|うん)/.test(t)) return 'happy';
    return 'normal';
  }

  /* 紙吹雪 — 正解・クリア時のごほうび */
  function confetti(x, y, n) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cols = ['#f2467f', '#ffd23f', '#3ccfb4', '#7f5cf0', '#ff9a5a', '#5aaeff'];
    const host = h('div.confetti', { 'aria-hidden': 'true' });
    document.body.appendChild(host);
    n = n || 34;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = 90 + Math.random() * 170;
      const p = h('i', { style: { left: x + 'px', top: y + 'px', background: cols[i % cols.length], borderRadius: i % 3 === 0 ? '50%' : i % 3 === 1 ? '2px' : '0', width: (6 + Math.random() * 6) + 'px', height: (6 + Math.random() * 8) + 'px' } });
      host.appendChild(p);
      p.animate([
        { transform: 'translate(-50%,-50%) rotate(0)', opacity: 1 },
        { transform: `translate(calc(-50% + ${Math.cos(a) * v}px), calc(-50% + ${Math.sin(a) * v - 60}px)) rotate(${Math.random() * 540}deg)`, opacity: 1, offset: .55 },
        { transform: `translate(calc(-50% + ${Math.cos(a) * v * 1.25}px), calc(-50% + ${Math.sin(a) * v + 120}px)) rotate(${Math.random() * 900}deg)`, opacity: 0 },
      ], { duration: 1100 + Math.random() * 600, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' });
    }
    setTimeout(() => host.remove(), 1900);
  }
  function confettiAt(el, n) { if (!el) return; const r = el.getBoundingClientRect(); confetti(r.left + r.width / 2, r.top + Math.min(r.height / 2, 60), n); }

  g.U = { h, esc, hlCode, codeBlock, store, toast, icon, ICONS, face, moodOf, confetti, confettiAt };
})(window);
