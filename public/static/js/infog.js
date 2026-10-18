/* =========================================================================
 *  PIII LAB — Infographic animation
 *  画面に入った瞬間に描かれる・伸びる・数える・流れるインフォグラフィック
 *   bars     : 横棒グラフ (サイズ比較など) + カウントアップ
 *   layout   : ビット / バイト配置の帯 (セグメントが順に伸びる)
 *   pipeline : 工程図 (パケットが流れ, 各工程がポップ)
 *   histo    : モンテカルロの度数分布がリアルタイムに積み上がる
 *   donut    : 割合リング
 *   memstrip : 番地の物差しに変数が落ちてきて, ポインタの矢印が弧を描く
 *   stats    : 大きな数字のカウントアップ
 *   compare2 : 値渡し vs ポインタ渡し の 2 レーン・タイムライン
 * ========================================================================= */
(function (g) {
  'use strict';
  const { h } = U;
  const K = g.Kinetic;
  const PAL = { ptr: '#f2467f', val: '#3ccfe0', addr: '#ffc93c', ok: '#3fcf8e', vio: '#9b7bff', pink: '#ffb3cf', mint: '#9fe6d6', lemon: '#ffe27a', sky: '#a9d8ff', lav: '#cdb8ff', peach: '#ffc8a8' };
  const col = (c) => PAL[c] || c || PAL.pink;

  function shell(spec, body, cls) {
    const el = h('figure.ig' + (cls ? '.' + cls : ''),
      h('figcaption.ig-head',
        h('span.ig-tag', spec.tag || 'INFOGRAPHIC'),
        h('span.ig-title', { html: spec.title || '' })),
      body,
      spec.note ? h('div.ig-note', { html: spec.note }) : null);
    return el;
  }
  function onIn(el, fn) { el.addEventListener('k-in', fn, { once: true }); K.watch(el); }

  /* ---------- bars ---------- */
  function bars(spec) {
    const max = spec.max || Math.max(...spec.items.map((i) => i.value));
    const rows = spec.items.map((it, k) => {
      const num = h('b.ig-num', '0');
      const fill = h('i.ig-fill', { style: { '--w': (it.value / max * 100) + '%', '--c': col(it.color), '--k': k } },
        it.cells ? Array.from({ length: it.value }, (_, j) => h('s', { style: { '--j': j } })) : null);
      return { el: h('div.ig-bar', h('div.ig-lab', { html: it.label }), h('div.ig-track', fill), h('div.ig-val', num, h('small', it.unit || ''))), num, it };
    });
    const el = shell(spec, h('div.ig-bars', rows.map((r) => r.el)), 'bars');
    onIn(el, () => rows.forEach((r, k) => setTimeout(() => K.countUp(r.num, r.it.value, { dur: 1100 }), 200 + k * 140)));
    return el;
  }

  /* ---------- layout (bit 配置) ---------- */
  function layout(spec) {
    const total = spec.total || Math.max(...spec.rows.map((r) => r.segs.reduce((a, s) => a + s.n, 0)));
    const rows = spec.rows.map((r, ri) => h('div.ig-lay',
      h('div.ig-lab', { html: r.label }),
      h('div.ig-segs', r.segs.map((s, si) => h('div.ig-seg', { style: { '--f': s.n / total, '--c': col(s.color), '--k': ri * 3 + si }, title: s.name + ' ' + s.n + ' bit' },
        h('span.ig-seg-n', String(s.n)), h('span.ig-seg-t', s.name)))),
      h('div.ig-val', h('b', String(r.segs.reduce((a, s) => a + s.n, 0))), h('small', 'bit'))));
    return shell(spec, h('div.ig-lays', rows), 'layout');
  }

  /* ---------- pipeline ---------- */
  function pipeline(spec) {
    const n = spec.steps.length;
    const steps = spec.steps.map((s, k) => h('div.ig-step', { style: { '--k': k, '--c': col(s.color) } },
      h('div.ig-node', h('span', { html: s.icon || String(k + 1) })),
      h('div.ig-step-l', { html: s.label }),
      s.sub ? h('div.ig-step-s', { html: s.sub }) : null));
    const track = h('div.ig-pipe-track', h('i.ig-pipe-line'), h('i.ig-packet'), h('i.ig-packet.p2'), h('i.ig-packet.p3'));
    const el = shell(spec, h('div.ig-pipe', { style: { '--n': n } }, track, h('div.ig-steps', steps)), 'pipeline');
    return el;
  }

  /* ---------- histo (モンテカルロ) ---------- */
  function histo(spec) {
    const lo = spec.lo, hi = spec.hi, N = spec.n || 6000;
    const cnt = new Array(hi - lo + 1).fill(0);
    const barsEl = cnt.map((_, k) => h('div.ig-hb', { style: { '--k': k } }, h('i'), h('span', String(lo + k))));
    const counter = h('b.ig-count', '0');
    const peak = h('b.ig-peak', '—');
    const replay = h('button.btn.sm', { type: 'button' }, '↻ もう一度');
    const body = h('div.ig-histo-wrap',
      h('div.ig-histo', barsEl),
      h('div.ig-histo-side',
        h('div', h('small', '試行回数'), counter),
        h('div', h('small', 'いちばん多い'), peak),
        replay));
    const el = shell(spec, body, 'histo');
    let timer = 0;
    function run() {
      cancelAnimationFrame(timer);
      cnt.fill(0);
      let done = 0;
      const per = Math.ceil(N / 90);
      const step = () => {
        for (let i = 0; i < per && done < N; i++, done++) cnt[spec.sim() - lo]++;
        const mx = Math.max(...cnt, 1);
        barsEl.forEach((b, k) => { b.style.setProperty('--hgt', (cnt[k] / mx) * 100 + '%'); b.classList.toggle('top', cnt[k] === mx); });
        counter.textContent = done.toLocaleString();
        const mi = cnt.indexOf(mx);
        peak.textContent = String(lo + mi);
        if (done < N) timer = requestAnimationFrame(step);
      };
      timer = requestAnimationFrame(step);
    }
    replay.addEventListener('click', run);
    onIn(el, run);
    return el;
  }

  /* ---------- donut ---------- */
  function donut(spec) {
    const R = 54, C = 2 * Math.PI * R;
    const tot = spec.segs.reduce((a, s) => a + s.v, 0);
    let acc = 0;
    const arcs = spec.segs.map((s, k) => {
      const len = s.v / tot * C;
      const a = `<circle class="ig-arc" cx="70" cy="70" r="${R}" style="--len:${len.toFixed(2)};--off:${(-acc).toFixed(2)};--c:${col(s.color)};--k:${k}" />`;
      acc += len; return a;
    }).join('');
    const svg = `<svg viewBox="0 0 140 140" class="ig-donut-svg"><circle cx="70" cy="70" r="${R}" class="ig-ring"/>${arcs}</svg>`;
    const center = h('div.ig-donut-c', h('b', { 'data-count': spec.center || tot }), h('small', spec.centerLabel || ''));
    const legend = h('ul.ig-legend', spec.segs.map((s, k) => h('li', { style: { '--c': col(s.color), '--k': k } }, h('i'), h('span', { html: s.label }), h('b', String(s.v) + (spec.unit || '')))));
    const el = shell(spec, h('div.ig-donut', h('div.ig-donut-g', { html: svg }, center), legend), 'donut');
    K.autoCount(el);
    return el;
  }

  /* ---------- memstrip ---------- */
  function memstrip(spec) {
    // spec.vars: [{name, type, size, val, color, ptrTo}]  base: 100
    const base = spec.base || 100, unit = spec.cell || 4;
    let addr = base;
    const vars = spec.vars.map((v) => { const o = Object.assign({ addr }, v); addr += v.size; return o; });
    const total = addr - base;
    const cells = h('div.ig-cells', { style: { '--cols': total / unit } });
    for (let a = base; a < addr; a += unit) cells.appendChild(h('div.ig-cell', h('span', String(a))));
    const blocks = vars.map((v, k) => h('div.ig-var', { style: { '--x': (v.addr - base) / unit, '--w': v.size / unit, '--c': col(v.color), '--k': k }, 'data-name': v.name },
      h('b', v.val), h('small', v.type + ' ' + v.name)));
    const lane = h('div.ig-vars', { style: { '--cols': total / unit } }, blocks);
    const svg = h('div.ig-arrows', { html: '' });
    const body = h('div.ig-mem', h('div.ig-mem-in', lane, cells, svg));
    const el = shell(spec, body, 'memstrip' + (vars.some((v) => v.ptrTo) ? '.has-ptr' : ''));
    const draw = () => {
      const inner = body.querySelector('.ig-mem-in');
      const W = inner.offsetWidth, H = inner.offsetHeight;
      const pos = (b) => ({ x: b.offsetLeft + b.offsetWidth / 2, y: b.offsetTop });
      const mid = 'igah' + Math.random().toString(36).slice(2, 7);
      let s = `<svg width="${W}" height="${H}"><defs><marker id="${mid}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="${PAL.ptr}" stroke="#3b2738" stroke-width="1"/></marker></defs>`;
      let lane = 0;
      vars.forEach((v, k) => {
        if (!v.ptrTo) return;
        const a = pos(blocks[k]), t = pos(blocks[vars.findIndex((x) => x.name === v.ptrTo)]);
        const up = 44 + lane * 26, y = a.y; lane++;
        s += `<path class="ig-arr" d="M${a.x} ${y - 2} C ${a.x} ${y - up}, ${t.x} ${y - up}, ${t.x} ${y - 6}" marker-end="url(#${mid})"/>`;
        s += `<text x="${a.x - 8}" y="${y - up * 0.72}" class="ig-arr-t" style="animation-delay:${0.8 + lane * 0.2}s" text-anchor="end">${v.name} は ${v.ptrTo} を指す</text>`;
      });
      svg.innerHTML = s + '</svg>';
    };
    onIn(el, () => setTimeout(() => { draw(); el.classList.add('drawn'); }, 350 + vars.length * 150));
    addEventListener('resize', () => el.classList.contains('drawn') && draw());
    return el;
  }

  /* ---------- stats ---------- */
  function stats(spec) {
    const el = shell(spec, h('div.ig-stats', spec.items.map((it, k) => h('div.ig-stat', { style: { '--c': col(it.color), '--k': k } },
      h('b', { 'data-count': it.value, 'data-suffix': it.suffix || '' }, '0'),
      h('span', { html: it.label })))), 'stats');
    K.autoCount(el);
    return el;
  }

  /* ---------- compare2 (値渡し vs ポインタ渡し) ---------- */
  function compare2(spec) {
    const lane = (L, k) => h('div.ig-lane', { style: { '--c': col(L.color), '--k': k } },
      h('div.ig-lane-h', { html: L.title }),
      h('div.ig-lane-steps', L.steps.map((s, j) => h('div.ig-ls', { style: { '--j': j } }, h('i', String(j + 1)), h('span', { html: s })))),
      h('div.ig-lane-r', { html: L.result }));
    return shell(spec, h('div.ig-c2', spec.lanes.map(lane)), 'compare2');
  }

  /* ---------- grid2d : 2 次元配列 → 1 列に並んだメモリ (行優先) ---------- */
  function grid2d(spec) {
    const R = spec.rows, C = spec.cols, sz = spec.size || 4, base = spec.base || 100, nm = spec.name || 'd';
    const val = spec.val || ((i, j) => '');
    const grid = h('div.ig-g2', { style: { '--c2': C } });
    const strip = h('div.ig-g2s', { style: { '--n': R * C } });
    const gc = [], sc = [];
    for (let i = 0; i < R; i++) for (let j = 0; j < C; j++) {
      const k = i * C + j, c = col(['mint', 'sky', 'lemon', 'lav', 'peach', 'pink'][i % 6]);
      const a = h('div.ig-g2c', { style: { '--c': c, '--k': k }, 'data-k': k }, h('b', String(val(i, j))), h('small', nm + '[' + i + '][' + j + ']'));
      const b = h('div.ig-g2m', { style: { '--c': c, '--k': k }, 'data-k': k }, h('b', String(val(i, j))), h('small', nm + '[' + i + '][' + j + ']'), h('span', String(base + k * sz)));
      gc.push(a); sc.push(b); grid.appendChild(a); strip.appendChild(b);
    }
    const hi = (k, on) => { [gc[k], sc[k]].forEach((x) => x && x.classList.toggle('hi', on)); };
    [...gc, ...sc].forEach((x) => { x.addEventListener('mouseenter', () => hi(+x.dataset.k, true)); x.addEventListener('mouseleave', () => hi(+x.dataset.k, false)); });
    const body = h('div.ig-g2w', h('div.ig-g2-l', h('div.ig-g2-cap', spec.capA || '頭の中のイメージ (行列)'), grid), h('div.ig-g2-arrow', '⇣'), h('div.ig-g2-r', h('div.ig-g2-cap', spec.capB || '実際のメモリ (1 列)'), strip));
    const el = shell(spec, body, 'grid2d');
    onIn(el, () => { el.classList.add('go'); if (!K.RM) { let k = 0; const tm = setInterval(() => { if (k > 0) hi(k - 1, false); if (k >= R * C) { clearInterval(tm); return; } hi(k, true); k++; }, 260); } });
    return el;
  }

  /* ---------- pixels : pixel_t の 3 バイトが色になる ---------- */
  function pixels(spec) {
    const px = spec.px; // [[r,g,b] ...]  rows×cols
    const C = spec.cols || px.length;
    const grid = h('div.ig-px', { style: { '--c2': C } });
    const bytes = h('div.ig-pxb');
    px.forEach((p, k) => {
      const [r, g, b] = p;
      grid.appendChild(h('div.ig-pxc', { style: { '--k': k, background: 'rgb(' + r + ',' + g + ',' + b + ')' }, title: (spec.label ? spec.label(k) : 'px') + ' = (' + r + ', ' + g + ', ' + b + ')' }, h('small', spec.label ? spec.label(k) : '')));
      bytes.appendChild(h('div.ig-pxg', { style: { '--k': k } },
        h('i.r', { style: { '--v': r / 255 } }, h('b', String(r)), h('small', 'r')),
        h('i.g', { style: { '--v': g / 255 } }, h('b', String(g)), h('small', 'g')),
        h('i.b', { style: { '--v': b / 255 } }, h('b', String(b)), h('small', 'b')),
        h('span', spec.label ? spec.label(k) : '')));
    });
    const el = shell(spec, h('div.ig-pxw', grid, bytes), 'pixels');
    onIn(el, () => el.classList.add('go'));
    return el;
  }

  const KINDS = { bars, layout, pipeline, histo, donut, memstrip, stats, compare2, grid2d, pixels };
  function make(spec) {
    const f = KINDS[spec.kind];
    if (!f) return null;
    const el = f(spec);
    K.watch(el);
    return el;
  }
  g.Infog = { make, KINDS };
})(window);
