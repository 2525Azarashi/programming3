/* =========================================================================
 *  PIII LAB — 単元横断の可視化ウィジェット
 *   bits   : int / float / double / char の bit パターン (B1)
 *   flow   : stdin / stdout / stderr とリダイレクト (B1)
 *   linkviz: コンパイル → .o (再配置可能) → リンク → a.exe (B2)
 * ========================================================================= */
(function (g) {
  'use strict';
  const { h, esc } = g.U;

  /* ---------------- bit パターン ---------------- */
  function bitsOf(type, raw) {
    const buf = new ArrayBuffer(8), dv = new DataView(buf);
    let ok = true, val = raw, note = '';
    if (type === 'int') {
      let n = Number(raw);
      if (!/^\s*[+-]?\d+\s*$/.test(raw)) { ok = false; n = 0; note = '整数を入力してください'; }
      const wrapped = ((n % 4294967296) + 4294967296) % 4294967296;
      const as = wrapped >= 2147483648 ? wrapped - 4294967296 : wrapped;
      if (ok && as !== n) note = 'int (32 bit) に収まらないため, 下位 32 bit だけが残り <b>' + as + '</b> になります (オーバーフロー)';
      dv.setInt32(0, as | 0); val = as;
      return { ok, bits: bin(dv, 4), val, note, size: 4 };
    }
    if (type === 'char') {
      const s = raw;
      let code;
      if (/^\s*\d+\s*$/.test(s)) code = Number(s) & 255;
      else if (s.length) code = new TextEncoder().encode(s[0])[0];
      else { code = 0; }
      const multi = s.length && /[^\x00-\x7f]/.test(s[0]);
      if (multi) note = '「' + esc(s[0]) + '」は UTF-8 では <b>' + new TextEncoder().encode(s[0]).length + ' バイト</b> (' + Array.from(new TextEncoder().encode(s[0])).map((b) => b.toString(16).toUpperCase()).join(' ') + ')。char 1 つ (1 Byte) には入りきらず, ここでは先頭の 1 バイトだけを表示しています';
      dv.setUint8(0, code);
      return { ok: true, bits: bin(dv, 1), val: code, note, size: 1 };
    }
    const x = Number(raw);
    if (raw.trim() === '' || isNaN(x)) { ok = false; note = '数値を入力してください'; }
    if (type === 'float') { dv.setFloat32(0, ok ? x : 0); const back = dv.getFloat32(0); if (ok && back !== x) note = 'float では <b>' + back.toPrecision(9) + '</b> として記憶されます (2 進数で表せない分の誤差)'; return { ok, bits: bin(dv, 4), val: back, size: 4, note }; }
    dv.setFloat64(0, ok ? x : 0); const back = dv.getFloat64(0);
    if (ok && String(x) !== raw.trim() && /\./.test(raw)) note = '';
    if (ok && /\.\d/.test(raw)) { const ex = back.toPrecision(20).replace(/0+$/, ''); if (!/^-?\d+\.\d{1,3}$/.test(ex)) note = '実際に記憶されている値は <b>' + ex + '…</b> (10 進の ' + esc(raw.trim()) + ' は 2 進数で正確には表せない)'; }
    return { ok, bits: bin(dv, 8), val: back, size: 8, note };
  }
  function bin(dv, n) { let s = ''; for (let i = 0; i < n; i++) s += dv.getUint8(i).toString(2).padStart(8, '0'); return s; }

  function bits(b) {
    const types = b.types || ['int', 'float', 'double', 'char'];
    let type = b.type0 || types[0];
    const defaults = { int: '11', float: '1.0', double: '0.1', char: 'A' };
    const vals = Object.assign({}, defaults, b.values || {});
    const tabs = h('div.tabs', types.map((t) => h('button', { 'data-t': t, onclick: () => { type = t; inp.value = vals[t]; paint(); } }, t)));
    const inp = h('input.bits-in', { type: 'text', value: vals[type], 'aria-label': '値', spellcheck: 'false' });
    const grid = h('div.bits-grid');
    const formula = h('div.bits-formula');
    const noteEl = h('div.bits-note');
    const presets = h('div.bits-presets');
    const PRE = { int: ['11', '0', '1', '-1', '-11', '2147483647', '2147483648'], float: ['1.0', '-2.5', '0.1', '0.5', '3'], double: ['1.0', '0.1', '-2.5', '1e-20'], char: ['A', 'a', '0', ' ', '10', 'あ'] };
    function paint() {
      [...tabs.children].forEach((x) => x.classList.toggle('on', x.dataset.t === type));
      vals[type] = inp.value;
      const r = bitsOf(type, inp.value);
      grid.innerHTML = ''; grid.className = 'bits-grid n' + r.bits.length;
      const N = r.bits.length;
      const kind = (i) => {
        if (type === 'int') return i === 0 ? 'sg' : 'mn';
        if (type === 'char') return i === 0 ? 'z' : 'mn';
        const e = type === 'float' ? 8 : 11;
        return i === 0 ? 'sg' : i <= e ? 'ex' : 'mn';
      };
      for (let i = 0; i < N; i++) {
        if (i && i % 8 === 0) grid.appendChild(h('span.bsep'));
        const k = kind(i);
        grid.appendChild(h('span.bit.' + k + (r.bits[i] === '1' ? '.on' : ''), { title: 'bit ' + (N - 1 - i) }, h('small', String(N - 1 - i)), r.bits[i]));
      }
      let f = '';
      if (type === 'int') {
        const neg = r.bits[0] === '1';
        const ones = []; for (let i = 0; i < 32; i++) if (r.bits[i] === '1') ones.push(31 - i);
        f = neg ? '最上位 bit が 1 → <b class="c-ptr">負の数</b> (2 の補数表現)。値 = ' + (ones.filter((x) => x !== 31).map((x) => '2<sup>' + x + '</sup>').join(' + ') || '0') + ' − 2<sup>31</sup> = <b>' + r.val + '</b>'
          : '値 = Σ 2<sup>i</sup> b<sub>i</sub> = ' + (ones.length ? ones.map((x) => '2<sup>' + x + '</sup>').join(' + ') : '0') + ' = <b>' + r.val + '</b> (10 進数)';
      } else if (type === 'char') {
        const c = r.val;
        const nm = c === 10 ? "'\\n' (LF: 改行)" : c === 13 ? "'\\r' (CR)" : c === 0 ? "'\\0' (ヌル文字: 文字列の終わり)" : c === 32 ? "' ' (空白)" : c >= 33 && c < 127 ? "'" + esc(String.fromCharCode(c)) + "'" : '(制御文字/非 ASCII)';
        f = 'ASCII コード <b>' + c + '</b> = 0x' + c.toString(16).toUpperCase().padStart(2, '0') + ' → ' + nm + '。<span class="c-mute">printf("%c", ' + c + ') でこの文字, printf("%d", \'' + (c >= 32 && c < 127 ? esc(String.fromCharCode(c)) : '?') + '\') で ' + c + ' が出る。</span>';
      } else {
        const e = type === 'float' ? 8 : 11, bias = type === 'float' ? 127 : 1023;
        const ex = parseInt(r.bits.slice(1, 1 + e), 2);
        const mant = r.bits.slice(1 + e);
        let mv = 0; for (let i = 0; i < mant.length; i++) if (mant[i] === '1') mv += Math.pow(2, -(i + 1));
        const sg = r.bits[0] === '1' ? '−' : '';
        f = ex === 0 && mv === 0 ? '指数部・仮数部がすべて 0 → 値は <b>' + sg + '0</b>'
          : '(値) = ' + sg + '2<sup>(指数部 − ' + bias + ')</sup> × (1 + 仮数部) = ' + sg + '2<sup>' + ex + ' − ' + bias + '</sup> × (1 + ' + mv.toPrecision(8).replace(/\.?0+$/, '') + ') = <b>' + sg + '2<sup>' + (ex - bias) + '</sup> × ' + (1 + mv).toPrecision(10).replace(/\.?0+$/, '') + '</b> ≈ <b>' + (type === 'float' ? r.val.toPrecision(9) : r.val.toPrecision(17)).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '') + '</b>';
      }
      formula.innerHTML = f;
      noteEl.innerHTML = r.note ? '⚠ ' + r.note : '';
      noteEl.style.display = r.note ? '' : 'none';
      presets.innerHTML = '';
      (PRE[type] || []).forEach((v) => presets.appendChild(h('button.sh-chip', { onclick: () => { inp.value = v; paint(); } }, v === ' ' ? '(空白)' : v)));
    }
    inp.addEventListener('input', paint);
    const legend = h('div.bits-legend',
      h('span', h('i.sg'), '符号'),
      h('span', h('i.ex'), '指数部'),
      h('span', h('i.mn'), type === 'int' ? '値' : '仮数部 / 値'));
    const el = h('div.bits',
      h('div.bits-top', tabs, h('label.bits-l', 'このビット列を作る値', inp), h('span.c-mute.mono.bits-sz')),
      presets, grid, legend, formula, noteEl);
    const _p = paint;
    // サイズ表示
    const sz = el.querySelector('.bits-sz');
    paint = function () { _p(); sz.textContent = ({ int: 4, float: 4, double: 8, char: 1 })[type] + ' Byte = ' + ({ int: 32, float: 32, double: 64, char: 8 })[type] + ' bit'; };
    paint();
    return el;
  }

  /* ---------------- 標準入出力とリダイレクト ---------------- */
  function flow(b) {
    let inR = !!b.inR, outR = !!b.outR;
    const svgHost = h('div.flow-svg');
    const cap = h('div.flow-cap');
    const cmd = h('div.flow-cmd');
    const t1 = h('button.sh-chip', { onclick: () => { inR = !inR; paint(); } });
    const t2 = h('button.sh-chip', { onclick: () => { outR = !outR; paint(); } });
    function paint() {
      t1.classList.toggle('on', inR); t2.classList.toggle('on', outR);
      t1.innerHTML = '<span>&lt;</span> 入力リダイレクト ' + (inR ? 'ON' : 'OFF');
      t2.innerHTML = '<span>&gt;</span> 出力リダイレクト ' + (outR ? 'ON' : 'OFF');
      cmd.innerHTML = '<span class="c-mute">$</span> ./a' + (inR ? ' <b class="c-val">&lt; in.txt</b>' : '') + (outR ? ' <b class="c-ok">&gt; out.txt</b>' : '');
      const W = 760, H = 300;
      const box = (x, y, w, hh, t, s, cls) => `<g class="fl-box ${cls || ''}"><rect x="${x}" y="${y}" width="${w}" height="${hh}" rx="12"/><text x="${x + w / 2}" y="${y + hh / 2 - (s ? 4 : -5)}" text-anchor="middle" class="t1">${t}</text>${s ? `<text x="${x + w / 2}" y="${y + hh / 2 + 16}" text-anchor="middle" class="t2">${s}</text>` : ''}</g>`;
      const arr = (d, cls, label, lx, ly) => `<path d="${d}" class="fl-arr ${cls}" marker-end="url(#fla-${cls})"/>${label ? `<text x="${lx}" y="${ly}" class="fl-lb ${cls}">${label}</text>` : ''}`;
      let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="標準入出力の流れ"><defs>${['in', 'out', 'err'].map((c) => `<marker id="fla-${c}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" class="mk-${c}"/></marker>`).join('')}</defs>`;
      s += box(20, 40, 150, 64, 'キーボード', '入力', inR ? 'dim' : '');
      s += box(305, 90, 150, 84, 'プログラム', 'a.exe', 'prog');
      s += box(590, 40, 150, 64, '画面', '端末に表示', '');
      s += box(305, 222, 150, 58, inR ? 'in.txt' : 'ファイル', inR ? '入力ファイル' : '', inR ? 'file on' : 'file dim');
      s += box(590, 214, 150, 66, 'out.txt', outR ? 'stdout の行き先' : '', outR ? 'file on' : 'file dim');
      // stdin
      if (inR) s += arr('M330 222 C 320 200, 330 190, 345 176', 'in', 'stdin', 250, 205);
      else s += arr('M170 80 C 230 80, 250 120, 302 124', 'in', 'stdin', 205, 70);
      // stderr → 画面 (常に)
      s += arr('M455 112 C 520 100, 540 76, 588 68', 'err', 'stderr', 480, 84);
      // stdout
      if (outR) s += arr('M455 150 C 530 160, 560 220, 588 240', 'out', 'stdout', 492, 196);
      else s += arr('M455 140 C 530 140, 550 92, 588 88', 'out', 'stdout', 500, 150);
      s += '</svg>';
      svgHost.innerHTML = s;
      const L = [];
      L.push(inR ? '<b class="c-val">stdin</b> は in.txt から読まれる。キーボードは使われず, 打ち込んだ値は画面に<b>表示されない</b>。' : '<b class="c-val">stdin</b> はキーボードから。scanf が入力を待つ。');
      L.push(outR ? '<b class="c-ok">stdout</b> (printf) は out.txt に書き込まれ, 画面には出ない。' : '<b class="c-ok">stdout</b> (printf) は画面に表示される。');
      L.push('<b class="c-addr">stderr</b> (fprintf(stderr, …)) は<b>リダイレクトしても画面に残る</b>。だからプロンプトは stderr に出す。');
      cap.innerHTML = L.map((x) => '<div>' + x + '</div>').join('');
    }
    paint();
    return h('div.flow', h('div.flow-top', cmd, h('span.sp'), t1, t2), svgHost, cap);
  }

  /* ---------------- コンパイルとリンク ---------------- */
  function linkviz(b) {
    let stage = 0;
    const host = h('div.lv-svg');
    const cap = h('div.flow-cap');
    const steps = [
      ['ソースプログラム', '人間が書くテキスト。main.c と func.c に分かれている。'],
      ['コンパイル (gcc -c)', '各 .c が<b>別々に</b>機械語のオブジェクトファイル (.o) になる。番地はまだ仮のもの (<b>再配置可能</b>): どちらも 100 番地から始まっている。main.o の中の func の呼び出しは「どこにあるか未定」のまま。'],
      ['リンク (gcc main.o func.o)', '.o とライブラリ (libc.a: printf など) をつなぎ合わせ, 実行するためにメモリの<b>番地を確定 (固定)</b> する。func は 300 番地に置かれ, main からの呼び出し先が埋まる。関数の本体がどこにも無いと, ここで <code class="ic">undefined reference</code> になる。'],
    ];
    const btns = h('div.tabs', steps.map((s, k) => h('button', { onclick: () => { stage = k; paint(); } }, (k + 1) + '. ' + s[0])));
    function paint() {
      [...btns.children].forEach((x, k) => x.classList.toggle('on', k === stage));
      const W = 760, H = 330;
      let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="コンパイルとリンク"><defs><marker id="lva" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#b8a3b1"/></marker></defs>`;
      const src = (x, y, n, lines) => `<g class="lv-src"><rect x="${x}" y="${y}" width="150" height="96" rx="10"/><text x="${x + 12}" y="${y + 22}" class="lv-n">${n}</text>${lines.map((l, i) => `<text x="${x + 12}" y="${y + 44 + i * 16}" class="lv-c">${l}</text>`).join('')}</g>`;
      const seg = (x, y, w, hh, addr, t, cls) => `<g class="lv-seg ${cls}"><rect x="${x}" y="${y}" width="${w}" height="${hh}" rx="6"/><text x="${x - 8}" y="${y + 15}" text-anchor="end" class="lv-a">${addr}</text><text x="${x + w / 2}" y="${y + hh / 2 + 5}" text-anchor="middle" class="lv-t">${t}</text></g>`;
      s += src(20, 30, 'main.c', ['int main(void) {', '  func();', '}']);
      s += src(20, 190, 'func.c', ['void func(void)', '{ … }']);
      if (stage >= 1) {
        s += `<path d="M172 78 L 262 78" class="lv-ar" marker-end="url(#lva)"/><path d="M172 238 L 262 238" class="lv-ar" marker-end="url(#lva)"/>`;
        s += `<text x="217" y="68" text-anchor="middle" class="lv-op">gcc -c</text><text x="217" y="228" text-anchor="middle" class="lv-op">gcc -c</text>`;
        s += `<text x="300" y="24" class="lv-n">main.o</text>` + seg(300, 32, 150, 40, '100', '機械語 (main)', 'code') + seg(300, 76, 150, 34, '200', 'データ領域', 'data');
        s += `<text x="300" y="184" class="lv-n">func.o</text>` + seg(300, 192, 150, 40, '100', '機械語 (func)', 'code') + seg(300, 236, 150, 34, '200', 'データ領域', 'data');
        if (stage === 1) s += `<text x="375" y="135" text-anchor="middle" class="lv-q">call func → ??? (未解決)</text>`;
        s += `<text x="300" y="300" class="lv-m">番地は仮 (再配置可能)</text>`;
      }
      if (stage >= 2) {
        s += `<path d="M452 70 C 500 70, 510 110, 556 110" class="lv-ar" marker-end="url(#lva)"/><path d="M452 230 C 500 230, 510 200, 556 200" class="lv-ar" marker-end="url(#lva)"/>`;
        s += `<text x="506" y="160" text-anchor="middle" class="lv-op">リンク</text>`;
        s += `<g class="lv-src lib"><rect x="470" y="276" width="120" height="34" rx="8"/><text x="530" y="298" text-anchor="middle" class="lv-c">libc.a (printf…)</text></g><path d="M560 276 C 570 260, 575 250, 590 240" class="lv-ar" marker-end="url(#lva)"/>`;
        s += `<text x="596" y="24" class="lv-n">a.exe</text>` + seg(596, 32, 150, 52, '100', '機械語 (main)', 'code') + seg(596, 88, 150, 44, '200', 'データ領域', 'data') + seg(596, 136, 150, 52, '300', '機械語 (func)', 'code hl') + seg(596, 192, 150, 44, '400', 'データ領域', 'data');
        s += `<path d="M746 60 C 778 70, 778 150, 748 160" class="lv-call" marker-end="url(#lva)"/><text x="700" y="262" text-anchor="middle" class="lv-m">番地を確定 (固定)</text>`;
      }
      s += '</svg>';
      host.innerHTML = s;
      cap.innerHTML = '<div><b>' + steps[stage][0] + '</b> — ' + steps[stage][1] + '</div>';
    }
    paint();
    return h('div.flow.lv', h('div.flow-top', btns), host, cap);
  }

  g.Widgets = { bits, flow, linkviz };
})(window);
