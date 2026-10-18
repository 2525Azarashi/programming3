/* B4 配列と構造体 — 画像ラボ (BMP ⇄ canvas) / 色合成 / 行列アニメーションのウィジェット */
(function () {
  'use strict';
  const { h } = U;
  const D = window.B4_DATA || {};

  const b64 = (s) => { const bin = atob(s); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; };
  const inBmp = () => b64(D.inbmp);
  const refBmp = (k) => (D.ref && D.ref[k] ? b64(D.ref[k]) : null);

  /* 24bit BMP (このサイトの image1.c が書く形式: ヘッダ 54B + 下の行から BGR) をパース */
  function parseBmp(u) {
    if (!u || u.length < 54) return null;
    const dv = new DataView(u.buffer, u.byteOffset, u.byteLength);
    const w = dv.getUint32(18, true), hh = dv.getUint32(22, true), off = dv.getUint32(10, true) || 54;
    if (!w || !hh || w > 2048 || hh > 2048) return null;
    const px = new Uint8ClampedArray(w * hh * 4);
    for (let i = 0; i < hh; i++) for (let j = 0; j < w; j++) {
      const s = off + (i * w + j) * 3, d = ((hh - 1 - i) * w + j) * 4;
      if (s + 2 >= u.length) continue;
      px[d] = u[s + 2]; px[d + 1] = u[s + 1]; px[d + 2] = u[s]; px[d + 3] = 255;
    }
    return { w, h: hh, px };
  }
  function toCanvas(img, cv) {
    cv = cv || h('canvas');
    if (!img) { cv.width = 1; cv.height = 1; return cv; }
    cv.width = img.w; cv.height = img.h;
    cv.getContext('2d').putImageData(new ImageData(img.px, img.w, img.h), 0, 0);
    return cv;
  }
  function diffImg(a, b) {
    if (!a || !b) return { same: false, why: '画像がありません' };
    if (a.w !== b.w || a.h !== b.h) return { same: false, why: 'サイズが違います (' + a.w + '×' + a.h + ' / 期待 ' + b.w + '×' + b.h + ')' };
    let n = 0, first = -1;
    for (let k = 0; k < a.px.length; k += 4) if (a.px[k] !== b.px[k] || a.px[k + 1] !== b.px[k + 1] || a.px[k + 2] !== b.px[k + 2]) { n++; if (first < 0) first = k / 4; }
    return { same: n === 0, n, first, why: n ? n + ' 画素が違います' : '' };
  }

  /* 画像ラボ: in.bmp / あなたの out.bmp / 期待 (gcc) を並べる */
  function imgPanel(cfg) {
    const mk = (cap, img, extra) => {
      const cv = toCanvas(img);
      const probe = h('div.il-probe');
      cv.addEventListener('mousemove', (e) => {
        if (!img) return;
        const r = cv.getBoundingClientRect();
        const x = Math.floor((e.clientX - r.left) / r.width * img.w), y = Math.floor((e.clientY - r.top) / r.height * img.h);
        if (x < 0 || y < 0 || x >= img.w || y >= img.h) return;
        const d = (y * img.w + x) * 4, i = img.h - 1 - y;
        probe.innerHTML = '';
        probe.append(h('i', { style: { background: 'rgb(' + img.px[d] + ',' + img.px[d + 1] + ',' + img.px[d + 2] + ')' } }),
          h('span', { html: 'img[<b>' + i + '</b>][<b>' + x + '</b>] = (r ' + img.px[d] + ', g ' + img.px[d + 1] + ', b ' + img.px[d + 2] + ')' }));
      });
      return h('figure', h('figcaption', h('span', cap), extra || null), cv, probe);
    };
    const inI = parseBmp(cfg.inBmp), outI = parseBmp(cfg.outBmp), refI = parseBmp(cfg.refBmp);
    const d = diffImg(outI, refI);
    const badge = cfg.outBmp ? h('span.il-badge' + (d.same ? '' : '.ng'), d.same ? '✓ 期待画像と一致' : '✗ ' + d.why) : null;
    const el = h('div.imglab',
      h('div.imglab-row', mk('in.bmp (入力)', inI), mk('out.bmp (あなたの出力)', outI, badge), cfg.refBmp ? mk('期待 (gcc で模範解答を実行)', refI) : null),
      h('div.il-meta', { html: (inI ? 'in.bmp: ' + inI.w + '×' + inI.h + ' 画素' : '') + (outI ? ' → out.bmp: ' + outI.w + '×' + outI.h + ' 画素' : '') + ' &nbsp;·&nbsp; 画像の上でマウスを動かすと, その画素の <b>img[y][x]</b> と r, g, b が読めます (BMP は<b>下の行から</b>格納されるので, y=0 は一番下)。' }));
    return { el, same: d.same, diff: d, outI, refI };
  }

  /* 課題ラボ用: 画像課題の判定 (custom) */
  function imageTask(key, units, opt) {
    opt = opt || {};
    return function (src) {
      const r = CLab.run(src, units, { stdin: '', maxSnaps: 2, maxOps: 40000000, vfs: { 'in.bmp': inBmp() } });
      const box = h('div');
      if (r.err) box.appendChild(h('div.c-mute', { style: { whiteSpace: 'pre-wrap', fontFamily: 'var(--f-mono)', fontSize: '12px', marginBottom: '6px' } }, '(stderr) ' + r.err.trim()));
      if (r.error) {
        box.appendChild(h('div.er', (r.error.phase === 'compile' ? 'コンパイルエラー' : '実行時エラー') + (r.error.loc ? ' [' + r.error.loc.file + ':' + r.error.loc.line + ']' : '') + '\n' + r.error.msg));
        return { ok: false, out: box, text: '(エラー) ' + r.error.msg, msg: 'エラーで止まりました' };
      }
      const out = r.vfs['out.bmp'];
      if (!out) return { ok: false, out: box, text: '', msg: 'out.bmp が書き出されていません (bmp_write を呼んでいますか?)' };
      const P = imgPanel({ inBmp: inBmp(), outBmp: out, refBmp: refBmp(key) });
      box.appendChild(P.el);
      const extra = opt.check ? opt.check(src, P) : null;
      if (extra && !extra.ok) return { ok: false, out: box, text: '', msg: extra.msg };
      const text = 'input file = "in.bmp"\noutput file = out.bmp\n(out.bmp: ' + (P.outI ? P.outI.w + '×' + P.outI.h : '?') + ' 画素)';
      return { ok: P.same, out: box, text, msg: P.same ? '出力画像が期待どおりです (全画素一致)' + (extra && extra.msg ? ' — ' + extra.msg : '') : '出力画像が期待と違います: ' + P.diff.why + (P.diff.first >= 0 && P.outI ? ' (最初の違い: 左上から ' + (P.diff.first % P.outI.w) + ' 列目, ' + Math.floor(P.diff.first / P.outI.w) + ' 行目)' : '') };
    };
  }
  function imageTerm(key, gccLine, exe) {
    return function () {
      const vfs = { 'in.bmp': inBmp() };
      const host = h('div', { style: { marginTop: '12px' } });
      return {
        files: { 'in.bmp': '(バイナリ ' + vfs['in.bmp'].length + ' バイト — 24bit BMP 128×80)' },
        cmds: [gccLine, './a'], vfs, maxOps: 40000000,
        title: key + ' — gcc → ./a → out.bmp を開く', banner: 'in.bmp を読み込んで out.bmp を書き出すプログラムです (コマンドライン引数なし)。./a を実行すると下に out.bmp が表示されます。',
        onVfs(v) { if (v['out.bmp']) { host.innerHTML = ''; host.appendChild(imgPanel({ inBmp: v['in.bmp'], outBmp: v['out.bmp'], refBmp: refBmp(key) }).el); } },
        after: host,
      };
    };
  }

  /* 色合成ウィジェット: pixel_t の r, g, b */
  function pixPlay() {
    const st = { r: 255, g: 179, b: 207 };
    const sw = h('div.pp-sw', h('span'));
    const code = h('div.pp-code');
    const sl = {};
    const upd = () => {
      sw.style.background = 'rgb(' + st.r + ',' + st.g + ',' + st.b + ')';
      sw.firstChild.textContent = '(' + st.r + ', ' + st.g + ', ' + st.b + ')';
      ['r', 'g', 'b'].forEach((k) => { sl[k].i.value = st[k]; sl[k].o.textContent = st[k]; });
      code.innerHTML = '';
      code.appendChild(codeBlock('pixel_t x;\nx.r = ' + st.r + ';   /* unsigned char: 0〜255 */\nx.g = ' + st.g + ';\nx.b = ' + st.b + ';'));
    };
    const row = (k, lab) => { const i = h('input', { type: 'range', min: 0, max: 255, value: st[k], 'aria-label': lab }); const o = h('b', String(st[k])); i.addEventListener('input', () => { st[k] = +i.value; upd(); }); sl[k] = { i, o }; return h('label', h('span', { style: { color: { r: '#e5484d', g: '#22a461', b: '#2f7fe0' }[k] } }, '.' + k), i, o); };
    const pre = [['赤', 255, 0, 0], ['緑', 0, 255, 0], ['青', 0, 0, 255], ['赤紫', 255, 0, 255], ['黒', 0, 0, 0], ['白', 255, 255, 255], ['ピンク (フレーム)', 255, 128, 128], ['涼しげ (r×0.8)', 204, 179, 207]];
    const el = h('div.pixplay', sw, h('div', row('r', '赤'), row('g', '緑'), row('b', '青'),
      h('div.pp-pre', pre.map(([n, r, g, b]) => h('button', { onclick: () => { if (n.startsWith('涼')) { st.r = Math.trunc(st.r * 0.8); } else { st.r = r; st.g = g; st.b = b; } upd(); } }, h('i', { style: { background: n.startsWith('涼') ? 'linear-gradient(90deg,#ff6b81,#5aa8ff)' : 'rgb(' + r + ',' + g + ',' + b + ')' } }), n))),
      code));
    upd();
    return el;
  }
  function codeBlock(s) { return U.codeBlock(s); }

  /* 行列アニメーション: 和 / 転置 (trans2, trans1) / 行列×ベクトル */
  function matrixAnim() {
    const A = [[1, 1, 1], [1, 2, 3], [5, 4, 3]], B = [[2, 0, 1], [0, 3, 1], [4, 1, 0]], x = [1, 2, 2];
    const ops = {
      sum: { name: 'matrix_sum  Y = A + B', mats: ['A', 'B', 'Y'] },
      trans2: { name: 'matrix_trans2  Y = Aᵀ', mats: ['A', 'Y'] },
      trans1: { name: 'matrix_trans1  A を自分で転置', mats: ['A'] },
      prod: { name: 'matrix_vector_prod  y = A x', mats: ['A', 'x', 'y'] },
    };
    let cur = 'sum', timer = null, steps = [], si = 0;
    const stage = h('div.mtx-stage'), cap = h('div.mtx-cap'), opsEl = h('div.mtx-ops');
    const cell = (v) => h('div.mtx-c', String(v));
    function mat(name, M) { const m = h('div.mtx-m', { style: { gridTemplateColumns: 'repeat(' + M[0].length + ', auto)' } }, h('b.mtx-n', name)); const cs = M.map((r) => r.map((v) => { const c = cell(v); m.appendChild(c); return c; })); return { el: m, cs }; }
    function build() {
      stop(); stage.innerHTML = ''; si = 0;
      const M = {};
      if (cur === 'sum') {
        M.A = mat('A', A); M.B = mat('B', B); M.Y = mat('Y', A.map((r) => r.map(() => '')));
        stage.append(M.A.el, h('span.mtx-sym', '+'), M.B.el, h('span.mtx-sym', '='), M.Y.el);
        steps = []; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) steps.push(() => { clear(M); M.A.cs[i][j].classList.add('hl'); M.B.cs[i][j].classList.add('hl'); M.Y.cs[i][j].textContent = A[i][j] + B[i][j]; M.Y.cs[i][j].classList.add('done'); cap.innerHTML = '<code>Y[' + i + '][' + j + '] = A[' + i + '][' + j + '] + B[' + i + '][' + j + ']</code> = ' + A[i][j] + ' + ' + B[i][j] + ' = <b>' + (A[i][j] + B[i][j]) + '</b>'; });
      } else if (cur === 'trans2') {
        M.A = mat('A', A); M.Y = mat('Y', A.map((r) => r.map(() => '')));
        stage.append(M.A.el, h('span.mtx-sym', '→'), M.Y.el);
        steps = []; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) steps.push(() => { clear(M); M.A.cs[j][i].classList.add('hl'); M.Y.cs[i][j].textContent = A[j][i]; M.Y.cs[i][j].classList.add('done'); cap.innerHTML = '<code>Y[' + i + '][' + j + '] = A[' + j + '][' + i + ']</code> — 添字を<b>入れ替えて</b>コピー'; });
      } else if (cur === 'trans1') {
        const T = A.map((r) => r.slice());
        M.A = mat('A', T);
        stage.append(M.A.el);
        steps = [];
        for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) steps.push(() => { clear(M); const a = M.A.cs[i][j], b = M.A.cs[j][i]; a.classList.add('sw'); b.classList.add('sw'); const t = T[i][j]; T[i][j] = T[j][i]; T[j][i] = t; a.textContent = T[i][j]; b.textContent = T[j][i]; cap.innerHTML = '<code>tmp = A[' + i + '][' + j + ']; A[' + i + '][' + j + '] = A[' + j + '][' + i + ']; A[' + j + '][' + i + '] = tmp;</code><br>j は <b>i+1 から</b> — 対角より上だけを交換 (全部やると 2 回交換して元に戻る!)'; });
        steps.push(() => { clear(M); for (let i = 0; i < 3; i++) M.A.cs[i][i].classList.add('hl2'); cap.innerHTML = '対角成分 A[i][i] は動かない。交換は 3 回 (= n(n-1)/2) で完了'; });
      } else {
        M.A = mat('A', A); M.x = mat('x', x.map((v) => [v])); M.y = mat('y', x.map(() => ['']));
        stage.append(M.A.el, h('span.mtx-sym', '×'), M.x.el, h('span.mtx-sym', '='), M.y.el);
        steps = [];
        for (let i = 0; i < 3; i++) { let acc = 0; for (let j = 0; j < 3; j++) { const jj = j; steps.push(() => { clear(M); for (let k = 0; k < 3; k++) M.A.cs[i][k].classList.add('hl2'); M.A.cs[i][jj].classList.add('hl'); M.x.cs[jj][0].classList.add('hl'); acc += A[i][jj] * x[jj]; M.y.cs[i][0].textContent = acc; M.y.cs[i][0].classList.add(jj === 2 ? 'done' : 'hl2'); cap.innerHTML = '<code>y[' + i + '] += A[' + i + '][' + jj + '] * x[' + jj + ']</code> → ' + A[i][jj] + ' × ' + x[jj] + ' を足して <b>' + acc + '</b>'; }); } }
      }
      cap.innerHTML = '▶ 再生 で 1 要素ずつ計算します';
      build.M = M;
    }
    function clear(M) { Object.values(M).forEach((m) => m.cs.forEach((r) => r.forEach((c) => c.classList.remove('hl', 'hl2', 'sw')))); }
    function stop() { if (timer) clearInterval(timer); timer = null; playBtn.textContent = '▶ 再生'; }
    function stepOnce() { if (si >= steps.length) { build(); } steps[si++](); if (si >= steps.length) stop(); }
    const playBtn = h('button.btn.sm.ptr', { onclick: () => { if (timer) { stop(); return; } if (si >= steps.length) build(); playBtn.textContent = '❚❚ 停止'; stepOnce(); timer = setInterval(() => { if (si >= steps.length) { stop(); return; } stepOnce(); }, 900); } }, '▶ 再生');
    const ctl = h('div.mtx-ctl', playBtn, h('button.btn.sm', { onclick: () => { stop(); stepOnce(); } }, '1 ステップ'), h('button.btn.sm.ghost', { onclick: build }, 'リセット'));
    Object.entries(ops).forEach(([k, o]) => opsEl.appendChild(h('button.btn.sm' + (k === cur ? '.on' : ''), { 'data-k': k, onclick: () => { cur = k; [...opsEl.children].forEach((b) => b.classList.toggle('on', b.dataset.k === k)); build(); } }, o.name)));
    const el = h('div.mtx', opsEl, stage, cap, ctl);
    build();
    return el;
  }

  /* 期待値つきの in.bmp プレビュー (章で使う) */
  function demoGallery(keys) {
    const inI = parseBmp(inBmp());
    const fig = (cap, img) => h('figure', h('figcaption', h('span', { html: cap })), toCanvas(img));
    return h('div.imglab', h('div.imglab-row', fig('in.bmp', inI), keys.map(([k, cap]) => fig(cap, parseBmp(refBmp(k))))),
      h('div.il-meta', { html: 'どれも「<b>2 次元配列 img[y][x] の各画素 (pixel_t) の r, g, b を書き換える</b>」だけで作れます。課題ラボで自分のコードを動かすと, 同じ画像が出るか自動で比べられます。' }));
  }

  window.B4_CODE = { parseBmp, toCanvas, imgPanel, imageTask, imageTerm, pixPlay, matrixAnim, demoGallery, inBmp, refBmp };
})();
