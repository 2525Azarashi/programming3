/* =========================================================================
 *  PIII LAB — Kinetic Typography & UI モーション
 *   - 文字分割 (Kinetic.split) → 1 文字ずつバネで登場
 *   - スクロール速度で見出しが傾く (--skew)
 *   - 章ごとの巨大アウトライン文字がスクロールで横に流れる
 *   - 回転ワード, カウントアップ, マグネットボタン, リップル, チルト,
 *     カーソルフォロワー, 開幕カーテン
 * ========================================================================= */
(function (g) {
  'use strict';
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = matchMedia('(pointer: fine)').matches;

  /* ---- 文字分割: 子要素 (em, code, br, span) を保ったまま文字を .kc で包む ---- */
  function split(el, opt) {
    if (!el || el.dataset.kSplit) return el;
    opt = opt || {};
    el.dataset.kSplit = '1';
    let i = opt.start || 0;
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          [...n.textContent].forEach((ch) => {
            if (ch === '\n') return;
            const s = document.createElement('span');
            s.className = 'kc' + (ch === ' ' ? ' sp' : '');
            s.style.setProperty('--i', i++);
            s.textContent = ch === ' ' ? '\u00a0' : ch;
            frag.appendChild(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !/^(BR|SVG|svg)$/.test(n.tagName) && !n.classList.contains('kc')) {
          if (n.classList.contains('k-block')) { n.style.setProperty('--i', i); i += 2; return; }
          walk(n);
        }
      });
    };
    walk(el);
    el.classList.add('k-split');
    el.style.setProperty('--n', i);
    return el;
  }

  /* ---- 画面内に入ったら .k-in ---- */
  const io = 'IntersectionObserver' in g ? new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('k-in'); io.unobserve(e.target); e.target.dispatchEvent(new CustomEvent('k-in')); }
  }), { rootMargin: '0px 0px -10% 0px', threshold: 0.01 }) : null;
  function watch(el) { if (!el) return; if (!io || RM) { el.classList.add('k-in'); el.dispatchEvent(new CustomEvent('k-in')); return; } io.observe(el); }

  /* ---- カウントアップ ---- */
  function countUp(el, to, opt) {
    opt = opt || {};
    const dur = opt.dur || 1200, dec = opt.dec || 0, suf = opt.suffix || '';
    const fmt = (v) => (dec ? v.toFixed(dec) : String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ',')) + suf;
    if (RM) { el.textContent = fmt(to); return; }
    const t0 = performance.now(), from = opt.from || 0;
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  function autoCount(root) {
    (root || document).querySelectorAll('[data-count]').forEach((el) => {
      if (el.dataset.counted) return;
      el.dataset.counted = '1';
      const to = parseFloat(el.dataset.count), suf = el.dataset.suffix || '';
      el.textContent = '0' + suf;
      const go = () => countUp(el, to, { suffix: suf, dur: +el.dataset.dur || 1300 });
      el.addEventListener('k-in', go, { once: true });
      watch(el);
    });
  }

  /* ---- 回転ワード (1 文字ずつ落ちて入れ替わる) ---- */
  function rotator(words, opt) {
    opt = opt || {};
    const el = document.createElement('span');
    el.className = 'k-rot';
    el.setAttribute('aria-label', words.join(' / '));
    let k = 0;
    const paint = (w, enter) => {
      const box = document.createElement('span');
      box.className = 'k-rot-w' + (enter ? ' enter' : '');
      box.setAttribute('aria-hidden', 'true');
      [...w].forEach((ch, i) => { const s = document.createElement('span'); s.className = 'kc'; s.style.setProperty('--i', i); s.textContent = ch === ' ' ? '\u00a0' : ch; box.appendChild(s); });
      return box;
    };
    // 最長の単語で幅を確保
    const sizer = paint(words.reduce((a, b) => (a.length >= b.length ? a : b)));
    sizer.classList.add('sizer');
    el.appendChild(sizer);
    let cur = paint(words[0]); el.appendChild(cur);
    if (!RM) setInterval(() => {
      if (document.hidden) return;
      k = (k + 1) % words.length;
      cur.classList.add('leave');
      const old = cur; setTimeout(() => old.remove(), 700);
      cur = paint(words[k], true); el.appendChild(cur);
      el.style.setProperty('--hue', k);
    }, opt.every || 2400);
    return el;
  }

  /* ---- スクロール連動: 速度で傾き, 章ごとの横流れ文字 ---- */
  let lastY = scrollY, vel = 0, raf = 0;
  const tickers = [];
  function loop() {
    raf = 0;
    const y = scrollY;
    vel = vel * 0.82 + (y - lastY) * 0.18;
    lastY = y;
    const vh = innerHeight;
    // 軽量化: 画面内の見出し帯だけ, 位置は offsetTop から計算 (強制レイアウトを避ける)
    for (const t of tickers) {
      if (!t.vis) continue;
      if (t.top === undefined) { const r = t.host.getBoundingClientRect(); t.top = r.top + y; t.hh = r.height; }
      const top = t.top - y;
      const p = (vh - top) / (vh + t.hh);
      t.el.style.transform = `translate3d(${(-p * t.dist + t.off).toFixed(1)}px,0,0)`;
    }
    if (Math.abs(vel) > 0.5) raf = requestAnimationFrame(loop);
  }
  function kick() { if (!raf && !RM) raf = requestAnimationFrame(loop); }
  addEventListener('scroll', kick, { passive: true });
  addEventListener('resize', kick);
  const tio = 'IntersectionObserver' in g ? new IntersectionObserver((es) => es.forEach((e) => { const t = tickers.find((x) => x.host === e.target); if (t) { t.vis = e.isIntersecting; t.top = undefined; } }), { rootMargin: '200px 0px' }) : null;
  addEventListener('resize', () => tickers.forEach((t) => (t.top = undefined)));
  function ticker(host, text, opt) {
    opt = opt || {};
    const el = document.createElement('div');
    el.className = 'k-ticker' + (opt.cls ? ' ' + opt.cls : '');
    el.setAttribute('aria-hidden', 'true');
    el.textContent = (text + '  ✦  ').repeat(opt.rep || 4);
    host.classList.add('k-ticker-host');
    host.insertBefore(el, host.firstChild);
    const t = { host, el, dist: opt.dist || 600, off: opt.off || 0, vis: false };
    tickers.push(t);
    if (tio) tio.observe(host); else t.vis = true;
    kick();
    return el;
  }

  /* ---- マグネット & リップル & チルト ---- */
  function magnet(el, s) {
    if (!FINE || RM) return;
    s = s || 0.28;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', ((e.clientX - r.left - r.width / 2) * s).toFixed(1) + 'px');
      el.style.setProperty('--my', ((e.clientY - r.top - r.height / 2) * s).toFixed(1) + 'px');
    });
    el.addEventListener('pointerleave', () => { el.style.setProperty('--mx', '0px'); el.style.setProperty('--my', '0px'); });
    el.classList.add('k-mag');
  }
  function tilt(el, deg) {
    if (!FINE || RM) return;
    deg = deg || 6;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty('--rx', (-y * deg).toFixed(2) + 'deg');
      el.style.setProperty('--ry', (x * deg).toFixed(2) + 'deg');
      el.style.setProperty('--gx', ((x + 0.5) * 100).toFixed(1) + '%');
      el.style.setProperty('--gy', ((y + 0.5) * 100).toFixed(1) + '%');
    });
    el.addEventListener('pointerleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
    el.classList.add('k-tilt');
  }
  document.addEventListener('pointerdown', (e) => {
    if (RM) return;
    const b = e.target.closest('.btn, .choice, .task-tile, .sh-chip, .repl-quick button, .tabs button');
    if (!b) return;
    const r = b.getBoundingClientRect();
    const d = Math.max(r.width, r.height) * 2.2;
    const s = document.createElement('span');
    s.className = 'k-ripple';
    s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
    if (getComputedStyle(b).position === 'static') b.style.position = 'relative';
    b.classList.add('k-ripple-host');
    b.appendChild(s);
    setTimeout(() => s.remove(), 650);
  });

  /* カーソルフォロワーは廃止 (軽量化) */
  function cursor() { const c = document.querySelector('.k-cursor'); if (c) c.remove(); }

  /* ---- 開幕カーテン ---- */
  function curtain(label) {
    if (RM || sessionStorage.getItem('p3lab:curtain:' + location.pathname)) return;
    sessionStorage.setItem('p3lab:curtain:' + location.pathname, '1');
    const c = document.createElement('div'); c.className = 'k-curtain'; c.setAttribute('aria-hidden', 'true');
    c.innerHTML = '<div class="kc-panel p1"></div><div class="kc-panel p2"></div><div class="kc-panel p3"></div><div class="kc-word"></div>';
    const w = c.querySelector('.kc-word');
    w.appendChild(split(Object.assign(document.createElement('span'), { textContent: label })));
    document.body.appendChild(c);
    requestAnimationFrame(() => c.classList.add('go'));
    setTimeout(() => c.classList.add('out'), 950);
    setTimeout(() => c.remove(), 2000);
  }

  /* ---- 単語ごとにスクロールで色が灯る段落 (スクロリーテリング) ---- */
  function scrub(el) {
    if (!el || RM) return;
    const words = [];
    const walk = (node) => [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+|(?<=[、。,])|(?=[「]))/).filter(Boolean).forEach((t) => {
          if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(t)); return; }
          // 和文は 2〜4 文字ずつ
          const parts = /[\u3000-\u9fff]/.test(t) ? t.match(/.{1,3}/g) : [t];
          parts.forEach((p) => { const s = document.createElement('span'); s.className = 'kw'; s.textContent = p; frag.appendChild(s); words.push(s); });
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
    walk(el);
    el.classList.add('k-scrub');
    const upd = () => {
      const r = el.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35)));
      const n = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle('lit', i < n));
    };
    addEventListener('scroll', upd, { passive: true }); upd();
  }

  /* ---- 軽量化: 画面外のブロックは CSS アニメーションを一時停止 ---- */
  const pio = 'IntersectionObserver' in g ? new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('k-off', !e.isIntersecting)), { rootMargin: '100px 0px' }) : null;
  function pauseOff(root) { if (!pio) return; (root || document).querySelectorAll('section, .marquee-wrap, .ig, .blk, .hero-mem-card, .home-cast').forEach((el) => { if (!el.dataset.kp) { el.dataset.kp = '1'; pio.observe(el); } }); }
  addEventListener('load', () => pauseOff());
  setTimeout(() => pauseOff(), 1500);
  g.Kinetic = { pauseOff, split, watch, countUp, autoCount, rotator, ticker, magnet, tilt, cursor, curtain, scrub, kick, RM };
})(window);
