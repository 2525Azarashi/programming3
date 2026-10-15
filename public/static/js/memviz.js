/* =========================================================================
 *  MemViz — メモリ図レンダラ & ステップ実行トレーサー
 *  講義スライドの「メモリ (記憶素子)」図を, 実際の実行結果から動的に描く
 * ========================================================================= */
(function (g) {
  'use strict';
  const { h, codeBlock, icon } = g.U;

  /* ---- メモリ状態の再構成 ---- */
  function Replayer(steps) {
    const mem = new Map();
    let at = -1;
    function apply(i, fwd) {
      const lg = steps[i].log;
      if (fwd) for (const c of lg) { if (c.n) mem.set(c.a, c.n); else mem.delete(c.a); }
      else for (let k = lg.length - 1; k >= 0; k--) { const c = lg[k]; if (c.o) mem.set(c.a, c.o); else mem.delete(c.a); }
    }
    return {
      mem,
      seek(i) {
        while (at < i) apply(++at, true);
        while (at > i) apply(at--, false);
        return mem;
      },
    };
  }

  /* ---- 値の表示 ---- */
  function fmtVal(c) {
    if (!c || c.v === undefined) return null;
    if (c.t === 'double') { const v = c.v; if (!isFinite(v)) return String(v); const s = Number.isInteger(v) && Math.abs(v) < 1e15 ? v.toFixed(1) : String(Number(v.toPrecision(7))); return s; }
    if (c.t === 'char') { const v = c.v; return v >= 32 && v < 127 ? "'" + String.fromCharCode(v) + "'" : v === 0 ? "'\\0'" : String(v); }
    if (c.t === 'ptr') return c.v === 0 ? 'NULL' : String(c.v);
    return String(c.v);
  }
  const hex = (a) => '0x' + a.toString(16);
  const tstr = (t) => g.CLab.typeStr(t);

  /* ---- 変数 → セル一覧 ---- */
  function flatten(name, base, t, out, path, keepStr) {
    if (keepStr && t.k === 'arr' && t.of.k === 'char') { out.push({ addr: base, name, t, path }); return; }
    if (t.k === 'arr') { for (let i = 0; i < t.n; i++) flatten(name + '[' + i + ']', base + i * t.of.size, t.of, out, path, keepStr); return; }
    if (t.k === 'struct') { for (const f of t.fields) flatten(name + '.' + f.name, base + f.off, f.type, out, path, keepStr); return; }
    out.push({ addr: base, name, t, path });
  }
  function flattenOld(name, base, t, out, path) {
    if (t.k === 'arr') { for (let i = 0; i < t.n; i++) flatten(name + '[' + i + ']', base + i * t.of.size, t.of, out, path); return; }
    if (t.k === 'struct') { for (const f of t.fields) flatten(name + '.' + f.name, base + f.off, f.type, out, path); return; }
    out.push({ addr: base, name, t, path });
  }
  function nameIndex(step) {
    const idx = new Map();
    const each = (v, fr) => { const o = []; flatten(v.name, v.addr, v.t, o, fr); for (const c of o) idx.set(c.addr, c); };
    step.frames.forEach((f) => f.vars.forEach((v) => each(v, f.fn)));
    step.globals.forEach((v) => each(v, 'global'));
    return idx;
  }

  /* ---- キャプション (直前の 1 文で何が起きたか) ---- */
  function captions(steps, i, idx, prevIdx) {
    const s = steps[i];
    const lines = [];
    if (s.error) return [{ ic: '!', html: '<b>エラー:</b> ' + U.esc(s.error.msg) }];
    if (i === 0) return [{ ic: '▶', html: '<b>main</b> から実行を開始します。黄色の行が<b>次に実行する行</b>です。' }];
    const prev = steps[i - 1];
    // 関数呼び出し / 戻り
    if (s.frames.length > prev.frames.length) {
      const f = s.frames[s.frames.length - 1];
      const ps = f.vars.map((v) => v.name).join(', ');
      lines.push({ ic: '↳', html: '関数 <b>' + f.fn + '</b> を呼び出し。新しいデータ領域 (' + f.base + ' 番地〜) が作られ, 引数 <b>' + U.esc(ps || 'なし') + '</b> に値が<b>コピー</b>されました。' });
    } else if (s.frames.length < prev.frames.length) {
      const f = prev.frames[prev.frames.length - 1];
      lines.push({ ic: '↰', html: '<b>' + f.fn + '</b> から戻りました。' + f.fn + ' のデータ領域 (変数 ' + U.esc(f.vars.map((v) => v.name).join(', ') || 'なし') + ') は<b>消えます</b>。' });
    }
    const allocs = [], sets = [];
    for (const c of s.log) {
      if (c.n && !c.o) allocs.push(c);
      else if (c.n && c.o && c.o.v !== c.n.v) sets.push(c);
      else if (c.n && c.o && c.o.v === c.n.v && c.o.v === undefined) { /* noop */ }
      else if (c.n && c.o) sets.push(c);
    }
    if (allocs.length && s.frames.length >= prev.frames.length) {
      const names = [];
      const seen = new Set();
      for (const c of allocs) {
        const e = idx.get(c.a); if (!e) continue;
        const root = e.name.split(/[[.]/)[0];
        if (seen.has(root)) continue; seen.add(root);
        const v = findVar(s, root);
        if (v) names.push('<b>' + root + '</b> <span class="c-mute">(' + U.esc(tstr(v.t)) + ', ' + v.t.size + ' バイト, </span><span class="c-addr">' + v.addr + ' 番地</span><span class="c-mute">)</span>');
      }
      if (names.length && !(s.frames.length > prev.frames.length)) lines.push({ ic: '+', html: 'メモリ領域を確保: ' + names.join(' / ') });
    }
    // 同じ配列/構造体への連続書き込みはまとめる
    const groups = new Map();
    for (const c of sets) { const e = idx.get(c.a); const root = e ? e.name.split(/[[.]/)[0] + (e.name.includes('.') ? '.' + e.name.split('.')[1].split('[')[0] : '') : c.a; if (!groups.has(root)) groups.set(root, []); groups.get(root).push(c); }
    const merged = [];
    for (const [root, cs] of groups) {
      if (cs.length > 2) lines.push({ ic: '=', html: '<b>' + U.esc(String(root)) + '</b> の ' + cs.length + ' 要素を書き換え' + (cs[0].n.t === 'char' ? ' (文字列のコピー)' : '') });
      else merged.push(...cs);
    }
    const shown = merged.slice(0, 4);
    for (const c of shown) {
      const e = idx.get(c.a) || (prevIdx && prevIdx.get(c.a));
      const nm = e ? e.name : c.a + ' 番地';
      const ov = fmtVal(c.o), nv = fmtVal(c.n);
      if (c.n.t === 'ptr') {
        let tgt = idx.get(c.n.v);
        if (tgt && c.n.to === 'struct') tgt = { name: tgt.name.split(/[[.]/)[0] };
        lines.push({ ic: '=', html: '<b class="c-ptr">' + U.esc(nm) + '</b> に番地 <span class="c-addr">' + nv + '</span> を格納' + (tgt ? ' → <b class="c-ptr">' + U.esc(nm) + '</b> は <b>' + U.esc(tgt.name) + '</b> を<b>指す</b>' : '') });
      } else {
        lines.push({ ic: '=', html: '<span class="c-addr">' + c.a + ' 番地</span> の <b>' + U.esc(nm) + '</b> を書き換え: <span class="c-mute">' + (ov === null ? '?' : U.esc(ov)) + '</span> → <b class="c-val">' + U.esc(nv) + '</b>' });
      }
    }
    if (merged.length > shown.length) lines.push({ ic: '…', html: 'ほか ' + (merged.length - shown.length) + ' 箇所が変化' });
    if (s.out > prev.out) lines.push({ ic: '>', html: '<b>標準出力 (stdout)</b> に出力しました。<span class="c-mute">リダイレクト「&gt; out.txt」するとファイルに入る側です。</span>' });
    if (s.err > prev.err) lines.push({ ic: '!', html: '<b class="c-addr">標準エラー出力 (stderr)</b> に出力しました。<span class="c-mute">リダイレクトしても画面に残る側 (プロンプト向き)。</span>' });
    if (s.loc && s.loc.end) lines.push({ ic: '■', html: 'プログラムが終了しました。' });
    if (!lines.length) lines.push({ ic: '·', html: 'メモリの変化はありません (条件判定・制御のみ)。' });
    return lines;
  }
  function findVar(s, root) {
    for (let k = s.frames.length - 1; k >= 0; k--) for (const v of s.frames[k].vars) if (v.name === root) return v;
    for (const v of s.globals) if (v.name === root) return v;
    return null;
  }

  /* ---- メモリ図 ---- */
  const MAX_ARR = 10;
  function renderMem(host, step, mem, opt) {
    opt = opt || {};
    const changed = new Map();
    for (const c of step.log || []) changed.set(c.a, c);
    const idx = nameIndex(step);
    // 指されている番地
    const targets = new Set();
    for (const [, c] of mem) if (c.t === 'ptr' && c.v) targets.add(c.v);

    const root = h('div.mem');
    const frames = step.frames.slice();
    frames.forEach((f, fi) => {
      const active = fi === frames.length - 1;
      const fr = h('div.mem-frame' + (active ? '.active' : ''),
        h('div.mem-fh', h('span', h('b', f.fn + '()'), ' のデータ領域'), h('span', f.base + ' 番地〜')));
      const rows = h('div.mem-rows');
      if (!f.vars.length) rows.appendChild(h('div.mem-empty', '(まだ変数はありません)'));
      f.vars.forEach((v) => rows.appendChild(varRow(v, mem, changed, targets, opt)));
      fr.appendChild(rows);
      root.appendChild(fr);
    });
    if (step.globals.length) {
      const fr = h('div.mem-frame.global', h('div.mem-fh', h('span', h('b', 'global / static'), ' 領域'), h('span', '')));
      const rows = h('div.mem-rows');
      step.globals.forEach((v) => rows.appendChild(varRow(v, mem, changed, targets, opt)));
      fr.appendChild(rows); root.appendChild(fr);
    }
    host.innerHTML = '';
    host.appendChild(root);
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'mem-svg');
    root.appendChild(svg);
    requestAnimationFrame(() => drawArrows(root, svg, mem, changed));
    void idx;
    return root;
  }

  function cellRow(name, addr, t, mem, changed, targets, label) {
    const c = mem.get(addr);
    const v = fmtVal(c);
    const kind = c ? c.t : 'int';
    const w = t.size >= 8 ? 'w8' : t.size === 1 ? 'w1' : 'w4';
    const bx = h('div.bx.' + w + (kind === 'ptr' ? '.ptr' : '') + (v === null ? '.uninit' : ''), { 'data-addr': addr });
    bx.appendChild(document.createTextNode(v === null ? '?' : v));
    if (kind === 'ptr' && c && c.v !== undefined && c.v !== 0) { bx.setAttribute('data-ptr', c.v); if (c.to === 'struct') bx.setAttribute('data-pgrp', '1'); }
    if (v === null) bx.appendChild(h('span.sub', '不定'));
    const bytes = h('span.bytes'); for (let i = 0; i < Math.min(t.size, 8); i++) bytes.appendChild(h('i')); bx.appendChild(bytes);
    const ch = changed.get(addr);
    const row = h('div.mr' + (ch ? (ch.o ? '.chg' : '.new') : '') + (targets.has(addr) ? '.tgt' : ''), { 'data-row': addr },
      h('div.ad', String(addr), h('small', hex(addr))),
      h('div.nm', label || name, h('small', tstr(t))),
      bx);
    return row;
  }

  function varRow(v, mem, changed, targets, opt) {
    const t = v.t;
    if (t.k === 'arr' && t.of.k === 'char') {
      // 文字列: 1 文字ずつ
      const strip = h('div.mem-str');
      const n = Math.min(t.n, 40);
      for (let i = 0; i < n; i++) {
        const c = mem.get(v.addr + i);
        const sp = h('span', { 'data-addr': v.addr + i, title: v.name + '[' + i + '] @' + (v.addr + i) });
        if (!c || c.v === undefined) sp.classList.add('u');
        else if (c.v === 0) { sp.classList.add('z'); sp.textContent = '\\0'; }
        else sp.textContent = c.v >= 32 && c.v < 127 ? String.fromCharCode(c.v) : '·';
        if (targets.has(v.addr + i)) sp.classList.add('tgt');
        strip.appendChild(sp);
      }
      const anyChg = [...changed.keys()].some((a) => a >= v.addr && a < v.addr + t.size);
      return h('div.mr' + (anyChg ? '.chg' : ''), { 'data-row': v.addr },
        h('div.ad', String(v.addr), h('small', hex(v.addr))),
        h('div.nm', v.name, h('small', tstr(t))),
        h('div', { style: { gridColumn: 'auto' } }, strip, t.n > n ? h('div.c-mute', { style: { fontSize: '10px' } }, '… 全 ' + t.n + ' バイト') : null));
    }
    if (t.k === 'arr' || t.k === 'struct') {
      const grp = h('div.mem-group', { 'data-gaddr': v.addr, 'data-gname': v.name }, h('div.gl', h('b', v.name), ' ', h('span.c-mute', tstr(t) + ' · ' + t.size + ' バイト · 先頭 ' + v.addr + ' 番地')));
      const cells = []; flatten(v.name, v.addr, t, cells, null, true);
      // 配列は長すぎる場合に省略 (変化・被参照セルは残す)
      const keep = new Set();
      if (cells.length > MAX_ARR) {
        cells.forEach((c, i) => { if (i < 6 || i >= cells.length - 2 || changed.has(c.addr) || targets.has(c.addr)) keep.add(i); });
      }
      let skipped = 0;
      cells.forEach((c, i) => {
        if (cells.length > MAX_ARR && !keep.has(i)) { skipped++; return; }
        if (skipped) { grp.appendChild(h('div.mem-more', '… ' + skipped + ' 要素省略')); skipped = 0; }
        if (c.t.k === 'arr' && c.t.of.k === 'char') { grp.appendChild(varRow({ name: c.name.slice(v.name.length) || c.name, addr: c.addr, t: c.t }, mem, changed, targets, opt)); return; }
        grp.appendChild(cellRow(c.name, c.addr, c.t, mem, changed, targets, c.name.slice(v.name.length) || c.name));
      });
      if (skipped) grp.appendChild(h('div.mem-more', '… ' + skipped + ' 要素省略'));
      return grp;
    }
    return cellRow(v.name, v.addr, t, mem, changed, targets);
  }

  function drawArrows(root, svg, mem, changed) {
    if (!root.isConnected) return;
    const R = root.getBoundingClientRect();
    svg.setAttribute('width', R.width); svg.setAttribute('height', R.height);
    svg.innerHTML = '<defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#f2467f" stroke="none"/></marker></defs>';
    const srcs = root.querySelectorAll('[data-ptr]');
    let lane = 0;
    srcs.forEach((b) => {
      const to = +b.getAttribute('data-ptr');
      const grpT = b.hasAttribute('data-pgrp') ? root.querySelector('[data-gaddr="' + to + '"] > .gl') : null;
      const t = grpT || root.querySelector('[data-addr="' + to + '"]');
      const a = b.getBoundingClientRect();
      if (!t) {
        const sub = h('span.sub', '→ 範囲外/不明');
        if (!b.querySelector('.sub')) b.appendChild(sub);
        return;
      }
      const tgtName = t.closest('.mr') && t.closest('.mr').querySelector('.nm');
      if (grpT && !b.querySelector('.sub')) b.appendChild(h('span.sub', '→ ' + grpT.parentElement.getAttribute('data-gname')));
      else if (!b.querySelector('.sub') && tgtName) {
        let nm = tgtName.firstChild ? tgtName.firstChild.textContent : '';
        const grp = t.closest('.mem-group'); if (grp && /^[[.]/.test(nm)) nm = grp.querySelector('.gl b').textContent + nm;
        if (t.parentElement.classList.contains('mem-str')) nm = (tgtName.firstChild.textContent) + '[' + (to - +t.closest('.mr').getAttribute('data-row')) + ']';
        b.appendChild(h('span.sub', '→ ' + nm));
      }
      const B = t.getBoundingClientRect();
      const x1 = a.right - R.left, y1 = a.top + a.height / 2 - R.top;
      const x2 = (grpT ? B.left + Math.min(B.width, 150) : B.right) - R.left + 2, y2 = B.top + B.height / 2 - R.top;
      const xr = Math.max(x1, x2) + 22 + (lane++ % 4) * 12;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const same = Math.abs(y1 - y2) < 4;
      path.setAttribute('d', same
        ? `M${x1} ${y1} C${xr} ${y1 - 30}, ${xr} ${y2 + 30}, ${x2 + 4} ${y2 + 4}`
        : `M${x1} ${y1} C${xr} ${y1}, ${xr} ${y2}, ${x2 + 4} ${y2}`);
      path.setAttribute('marker-end', 'url(#ah)');
      if (changed.has(+b.getAttribute('data-addr'))) path.classList.add('fresh');
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('cx', x1); dot.setAttribute('cy', y1); dot.setAttribute('r', 3.5);
      svg.appendChild(path); svg.appendChild(dot);
    });
  }

  function legend() {
    return h('div.mem-legend',
      h('span', h('i', { style: { background: 'var(--val-soft)', border: '1px solid rgba(20,151,171,.5)' } }), '値'),
      h('span', h('i', { style: { background: 'var(--ptr-soft)', border: '1px solid rgba(242,70,127,.6)' } }), 'ポインタ (番地を格納)'),
      h('span', h('i', { style: { border: '1px dashed rgba(74,44,66,.3)' } }), '未初期化 (不定)'),
      h('span', h('i', { style: { background: 'rgba(217,127,0,.25)' } }), '直前に変化'),
      h('span', h('b', { style: { color: 'var(--addr)', fontSize: '11px' } }, '100'), '番地'));
  }

  /* =====================================================================
   *  Tracer — コード + メモリ図 + 出力 のステップ実行ビュー
   * ===================================================================== */
  function Tracer(o) {
    const files = o.files;
    const units = o.units || [o.main];
    let stdin = o.stdin || '';
    let res = null, rep = null, i = 0, timer = null, speed = 1;
    let curFile = units[0];

    const title = h('span.t', o.title || 'ステップ実行');
    const fileTabs = h('div.tr-files');
    const codeHost = h('div', { style: { flex: '1', display: 'flex', minHeight: '0' } });
    const cap = h('div.tr-caption', { 'aria-live': 'polite' });
    const memHost = h('div');
    const memWrap = h('div.tr-mem', memHost, legend());
    const outPre = h('pre');
    let cmode = o.consoleMode || 'auto';
    const cTabs = h('div.ctabs', [['term', '端末'], ['out', 'stdout'], ['err', 'stderr']].map(([k, l]) => h('button', { 'data-m': k, onclick: () => { cmode = k; paintOut(); } }, l)));
    const btnFirst = h('button.btn.sm.icon', { title: '最初へ (Home)', 'aria-label': '最初へ', onclick: () => go(0) }, icon('first'));
    const btnPrev = h('button.btn.sm.icon', { title: '1 つ戻る (←)', 'aria-label': '1 つ戻る', onclick: () => go(i - 1) }, icon('prev'));
    const btnPlay = h('button.btn.sm.ptr', { onclick: () => toggle() }, icon('play'), h('span', '再生'));
    const btnNext = h('button.btn.sm.icon.pri', { title: '1 つ進む (→)', 'aria-label': '1 つ進む', onclick: () => go(i + 1) }, icon('next'));
    const btnLast = h('button.btn.sm.icon', { title: '最後へ (End)', 'aria-label': '最後へ', onclick: () => go(res.steps.length - 1) }, icon('last'));
    const range = h('input', { type: 'range', min: 0, max: 0, value: 0, 'aria-label': 'ステップ', oninput: (e) => go(+e.target.value) });
    const cnt = h('span.cnt', '0 / 0');
    const spd = h('div.tabs', ['0.5×', '1×', '2×', '4×'].map((l, k) => h('button' + (k === 1 ? '.on' : ''), { onclick: (e) => { speed = [0.5, 1, 2, 4][k]; [...spd.children].forEach((b) => b.classList.remove('on')); e.currentTarget.classList.add('on'); if (timer) { stop(); play(); } } }, l)));
    const stdinIn = h('input', { type: 'text', value: stdin.replace(/\n/g, '⏎'), 'aria-label': '標準入力', onchange: (e) => { stdin = e.target.value.replace(/⏎/g, '\n'); load(); } });
    const stdinBar = o.stdinEditable === false || (!o.stdin && !o.showStdin) ? null : h('div.tr-stdin', h('span', 'stdin'), stdinIn, h('span', { style: { fontSize: '11px' } }, '⏎ = 改行'));

    const el = h('div.tracer', { tabindex: '0' },
      h('div.tr-head', title, h('span.sp'), o.headExtra || null),
      h('div.tr-body',
        h('div.tr-code', fileTabs, codeHost),
        h('div.tr-right', cap, memWrap)),
      h('div.tr-console', h('div.ch', cTabs, h('span', { class: 'exitc' }, '')), outPre),
      stdinBar,
      h('div.tr-ctrl', btnFirst, btnPrev, btnPlay, btnNext, btnLast, range, cnt, spd));

    el.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' && e.target.type === 'text') return;
      if (e.key === 'ArrowRight') { e.preventDefault(); go(i + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1); }
      else if (e.key === ' ') { e.preventDefault(); toggle(); }
      else if (e.key === 'Home') { e.preventDefault(); go(0); }
      else if (e.key === 'End') { e.preventDefault(); go(res.steps.length - 1); }
    });

    const codeEls = {};
    function buildCode() {
      fileTabs.innerHTML = '';
      const names = Object.keys(files).filter((n) => files[n] !== undefined);
      const order = units.concat(names.filter((n) => !units.includes(n)));
      order.forEach((n) => {
        codeEls[n] = codeBlock(files[n], { label: n });
        fileTabs.appendChild(h('button', { 'data-f': n, onclick: () => showFile(n) }, n));
      });
      if (order.length < 2) fileTabs.style.display = 'none';
      showFile(curFile);
    }
    function showFile(n) {
      curFile = n;
      codeHost.innerHTML = ''; codeHost.appendChild(codeEls[n]);
      [...fileTabs.children].forEach((b) => b.classList.toggle('on', b.getAttribute('data-f') === n));
    }

    function load() {
      stop();
      res = g.CLab.run(files, units, { stdin, maxSnaps: o.maxSnaps || 3000 });
      rep = Replayer(res.steps);
      i = 0;
      range.max = Math.max(0, res.steps.length - 1);
      if (res.error && res.error.phase === 'compile') {
        cap.className = 'tr-caption err';
        cap.innerHTML = '<div class="cap-line"><span class="cap-ic">!</span><span><b>コンパイルエラー</b> ' + U.esc((res.error.loc ? res.error.loc.file + ':' + res.error.loc.line + ' ' : '') + res.error.msg) + '</span></div>';
        memHost.innerHTML = '';
        if (res.error.loc) markLine(res.error.loc, 'err');
        return;
      }
      go(o.startAtEnd ? res.steps.length - 1 : 0);
      if (o.onLoad) o.onLoad(res);
    }
    function markLine(loc, cls) {
      Object.values(codeEls).forEach((c) => c.querySelectorAll('.cur,.prev,.err').forEach((x) => x.classList.remove('cur', 'prev', 'err')));
      if (!loc || loc.line < 0) return;
      if (codeEls[loc.file] && curFile !== loc.file) showFile(loc.file);
      const c = codeEls[loc.file];
      if (!c) return;
      const ln = c.querySelector('.ln[data-l="' + loc.line + '"]');
      if (ln) {
        ln.classList.add(cls);
        const top = ln.offsetTop - c.clientHeight / 2 + 20;
        c.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      }
    }
    function go(n) {
      if (!res || !res.steps.length) return;
      n = Math.max(0, Math.min(res.steps.length - 1, n));
      i = n;
      const s = res.steps[i];
      const mem = rep.seek(i);
      const prevIdx = i > 0 ? nameIndex(res.steps[i - 1]) : null;
      renderMem(memHost, s, mem);
      const idx = nameIndex(s);
      const caps = captions(res.steps, i, idx, prevIdx);
      cap.className = 'tr-caption' + (s.error ? ' err' : '');
      cap.innerHTML = caps.map((c) => '<div class="cap-line"><span class="cap-ic">' + c.ic + '</span><span>' + c.html + '</span></div>').join('');
      markLine(s.loc, s.error ? 'err' : 'cur');
      if (i > 0 && !s.error) {
        const pl = res.steps[i - 1].loc;
        if (pl && codeEls[pl.file] && pl.file === (s.loc && s.loc.file)) { const ln = codeEls[pl.file].querySelector('.ln[data-l="' + pl.line + '"]'); if (ln && !ln.classList.contains('cur')) ln.classList.add('prev'); }
      }
      paintOut();
      const last = i === res.steps.length - 1;
      el.querySelector('.exitc').textContent = last ? (res.error ? 'エラーで停止' : res.truncated ? '途中まで表示 (ステップ上限)' : 'return ' + res.exit) : '';
      range.value = i;
      cnt.textContent = (i + 1) + ' / ' + res.steps.length;
      btnPrev.disabled = btnFirst.disabled = i === 0;
      btnNext.disabled = btnLast.disabled = last;
      if (last) stop();
      if (o.onStep) o.onStep(i, res);
    }
    function paintOut() {
      if (!res || !res.steps.length) return;
      const s = res.steps[i];
      let m = cmode;
      if (m === 'auto') m = (res.err || stdin) && res.term ? 'term' : 'out';
      [...cTabs.children].forEach((b) => b.classList.toggle('on', b.dataset.m === m));
      outPre.innerHTML = '';
      outPre.className = 'cm-' + m;
      if (m === 'term' && res.term) {
        let left = s.term || 0;
        for (const seg of res.term) {
          if (left <= 0) break;
          const t = seg.t.slice(0, left); left -= seg.t.length;
          outPre.appendChild(h('span.t-' + seg.s, t));
        }
      } else {
        outPre.appendChild(document.createTextNode(m === 'err' ? res.err.slice(0, s.err) : res.out.slice(0, s.out)));
      }
      if (i < res.steps.length - 1) outPre.appendChild(h('span.cur'));
      outPre.scrollTop = outPre.scrollHeight;
    }
    function play() {
      if (!res) return;
      if (i >= res.steps.length - 1) go(0);
      btnPlay.innerHTML = ''; btnPlay.append(icon('pause'), h('span', '一時停止'));
      timer = setInterval(() => go(i + 1), 900 / speed);
    }
    function stop() { if (timer) clearInterval(timer); timer = null; btnPlay.innerHTML = ''; btnPlay.append(icon('play'), h('span', '再生')); }
    function toggle() { if (timer) stop(); else play(); }

    buildCode();
    // 画面に入ってから実行 (初期表示を軽く)
    if ('IntersectionObserver' in window && !o.eager) {
      const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { io.disconnect(); load(); } }, { rootMargin: '200px' });
      io.observe(el);
    } else setTimeout(load, 0);
    window.addEventListener('resize', () => { if (res && res.steps.length) go(i); });

    el.api = { reload: load, go, setFiles(f, u) { Object.assign(files, f); if (u) units.splice(0, units.length, ...u); curFile = units[0]; buildCode(); load(); }, get result() { return res; } };
    return el;
  }

  g.MemViz = { Tracer, renderMem, Replayer, nameIndex, legend, fmtVal };
})(window);
