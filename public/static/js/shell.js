/* =========================================================================
 *  PIII LAB — 仮想ターミナル (cygwin 風)
 *  gcc [-c] [-o name] / ./a [< in] [> out] [2> err] / diff [-w] [-B] / cat / ls / rm
 *  ・分割コンパイル: gcc -c で .o (その時点のソースのスナップショット) を作り, リンク時に未定義参照を検出
 *  ・リダイレクトなしで実行すると, キーボード入力を 1 行ずつ受け付ける (Ctrl+D で EOF)
 * ========================================================================= */
(function (g) {
  'use strict';
  const { h, esc, icon } = g.U;

  /* ---------- diff (通常形式) ---------- */
  function diff(aText, bText, opt) {
    const split = (t) => { const L = t.replace(/\r/g, '').split('\n'); if (L[L.length - 1] === '') L.pop(); return L; };
    const A = split(aText), B = split(bText);
    const norm = (s) => (opt.w ? s.replace(/\s+/g, '') : s);
    const nA = A.map(norm), nB = B.map(norm);
    const n = A.length, m = B.length;
    const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = nA[i] === nB[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    const hunks = [];
    let i = 0, j = 0, cur = null;
    const flush = () => { if (cur) { hunks.push(cur); cur = null; } };
    while (i < n || j < m) {
      if (i < n && j < m && nA[i] === nB[j]) { flush(); i++; j++; continue; }
      if (!cur) cur = { a0: i, a1: i, b0: j, b1: j };
      if (j < m && (i >= n || dp[i][j + 1] >= dp[i + 1][j])) { j++; cur.b1 = j; }
      else { i++; cur.a1 = i; }
    }
    flush();
    const rng = (s, e) => (e - s <= 1 ? String(s + 1) : s + 1 + ',' + e);
    const out = [];
    hunks.forEach((hk) => {
      const del = A.slice(hk.a0, hk.a1), add = B.slice(hk.b0, hk.b1);
      if (opt.B && del.concat(add).every((l) => l.trim() === '')) return;
      if (del.length && add.length) out.push(rng(hk.a0, hk.a1) + 'c' + rng(hk.b0, hk.b1));
      else if (del.length) out.push(rng(hk.a0, hk.a1) + 'd' + hk.b0);
      else out.push(hk.a0 + 'a' + rng(hk.b0, hk.b1));
      del.forEach((l) => out.push('< ' + l));
      if (del.length && add.length) out.push('---');
      add.forEach((l) => out.push('> ' + l));
    });
    return out;
  }

  /* ---------- コマンドラインの分解 ---------- */
  function argv(line) {
    const a = []; const re = /"([^"]*)"|'([^']*)'|(\S+)/g; let m;
    while ((m = re.exec(line))) a.push(m[1] !== undefined ? m[1] : m[2] !== undefined ? m[2] : m[3]);
    return a;
  }

  function Shell(o) {
    const fs = new Map();             // name -> { kind:'text', text } | { kind:'obj', unit, snap, info } | { kind:'exe', parts }
    const setText = (n, t) => fs.set(n, { kind: 'text', text: t });
    Object.entries(o.files || {}).forEach(([n, t]) => setText(n, t));
    const user = o.user || 'xyz01234@DGLP00';
    const cwd = o.cwd || '~/B1';
    const hist = [];                  // { cmd, out, ok }
    let hPos = -1;
    let running = null;               // 実行中 (キーボード入力待ち) のプロセス

    const screen = h('div.sh-screen', { role: 'log', 'aria-live': 'polite' });
    const input = h('input.sh-in', { type: 'text', spellcheck: 'false', autocomplete: 'off', 'aria-label': 'コマンド入力' });
    const promptEl = h('span.sh-ps', '$');
    const eofBtn = h('button.btn.sm.sh-eof', { onclick: () => sendEof(), title: 'Ctrl+D' }, 'Ctrl+D (EOF)');
    const inLine = h('div.sh-line', promptEl, input, eofBtn);
    const chips = h('div.sh-chips');
    const goalsEl = h('ul.sh-goals');
    const filesEl = h('div.sh-files');
    const body = h('div.sh-body', screen, inLine);

    const el = h('div.shell', { onclick: (e) => { if (e.target === body || e.target === screen) input.focus(); } },
      h('div.sh-head', h('span.dots', h('i'), h('i'), h('i')), h('span.sh-title', o.title || 'Terminal — Cygwin64'), h('span.sp'), filesEl),
      o.intro ? h('div.sh-intro', { html: o.intro }) : null,
      body,
      (o.cmds && o.cmds.length) ? chips : null,
      (o.goals && o.goals.length) ? goalsEl : null);

    function paintFiles() {
      filesEl.innerHTML = '';
      [...fs.keys()].sort().forEach((n) => {
        const f = fs.get(n);
        filesEl.appendChild(h('button.sh-f.' + f.kind, { title: f.kind === 'text' ? 'cat ' + n : n, onclick: () => { if (f.kind === 'text') exec('cat ' + n); } }, n));
      });
    }
    function ps1() { return h('div.sh-ps1', h('span.u', user), ' ', h('span.d', cwd)); }
    function print(cls, text) { const d = h('div.' + cls); d.textContent = text; screen.appendChild(d); return d; }
    function scroll() { body.scrollTop = body.scrollHeight; }

    (o.cmds || []).forEach((c) => {
      const label = typeof c === 'string' ? c : c.label || c.cmd;
      const cmd = typeof c === 'string' ? c : c.cmd;
      chips.appendChild(h('button.sh-chip', { onclick: () => { if (running) return; input.value = ''; exec(cmd); input.focus({ preventScroll: true }); } }, h('span', '$'), label));
    });

    /* ---- gcc ---- */
    function gcc(args) {
      const out = [];
      let cOnly = false, oName = null;
      const srcs = [], objs = [];
      for (let k = 0; k < args.length; k++) {
        const a = args[k];
        if (a === '-c') cOnly = true;
        else if (a === '-o') oName = args[++k];
        else if (/^-/.test(a)) { /* -Wall -lm 等は受け付けるだけ */ }
        else if (/\.c$/.test(a)) srcs.push(a);
        else if (/\.o$/.test(a)) objs.push(a);
        else if (/\.h$/.test(a)) { out.push({ c: 'err', t: 'gcc: warning: ' + a + ': ヘッダファイルは gcc に渡さず, .c から #include します' }); }
        else { out.push({ c: 'err', t: 'gcc: error: ' + a + ': No such file or directory' }); }
      }
      if (!srcs.length && !objs.length) { out.push({ c: 'err', t: 'gcc: fatal error: no input files\ncompilation terminated.' }); return { out, ok: false }; }
      const snapAll = () => { const s = {}; fs.forEach((f, n) => { if (f.kind === 'text') s[n] = f.text; }); return s; };
      const parts = [];
      let ok = true;
      for (const s of srcs) {
        if (!fs.has(s)) { out.push({ c: 'err', t: 'gcc: error: ' + s + ': No such file or directory' }); ok = false; continue; }
        const snap = snapAll();
        const r = g.CLab.compile(snap, s);
        if (!r.ok) {
          const L = r.error.loc;
          let msg = r.error.msg;
          if (/が見つかりません/.test(msg)) { const m = /#include "([^"]+)"/.exec(msg); out.push({ c: 'err', t: (L ? L.file + ':' + L.line + ':10: ' : '') + 'fatal error: ' + (m ? m[1] : '?') + ': No such file or directory\ncompilation terminated.' }); }
          else out.push({ c: 'err', t: (L ? L.file + ':' + L.line + ': ' : s + ': ') + 'error: ' + msg });
          ok = false; continue;
        }
        (r.warnings || []).forEach((w) => out.push({ c: 'warn', t: w.loc.file + ':' + w.loc.line + ': warning: ' + w.msg + ' [-Wimplicit-function-declaration]' }));
        if ((r.warnings || []).length) out.push({ c: 'hint', t: '↳ PIII LAB: 呼び出す前に関数の宣言がありません。プロトタイプ宣言 (またはそれを書いたヘッダの #include) を, 呼び出しより前に書こう' });
        parts.push({ unit: s, snap, info: r });
        if (cOnly) fs.set(s.replace(/\.c$/, '.o'), { kind: 'obj', unit: s, snap, info: r });
      }
      for (const ob of objs) {
        const f = fs.get(ob);
        if (!f || f.kind !== 'obj') { out.push({ c: 'err', t: 'gcc: error: ' + ob + ': No such file or directory' }); ok = false; continue; }
        parts.push({ unit: f.unit, snap: f.snap, info: f.info });
      }
      if (!ok) return { out, ok };
      if (cOnly) { return { out, ok: true, note: srcs.map((s) => s.replace(/\.c$/, '.o')).join(', ') + ' を作成 (コンパイルのみ・リンクなし)' }; }
      // リンク
      const defs = new Map();
      for (const p of parts) for (const d of p.info.defined) {
        if (defs.has(d)) { out.push({ c: 'err', t: 'multiple definition of `' + d + "'; " + defs.get(d) + ': first defined here' }); ok = false; }
        else defs.set(d, p.unit.replace(/\.c$/, '.o'));
      }
      const undef = [];
      for (const p of parts) for (const c of p.info.called) if (!defs.has(c) && !g.CLab.BUILTIN_NAMES.includes(c) && !undef.find((u) => u.n === c)) undef.push({ n: c, from: p.unit });
      if (!defs.has('main')) undef.unshift({ n: 'WinMain', from: null });
      if (undef.length || !ok) {
        undef.forEach((u) => out.push({ c: 'err', t: (u.from ? u.from.replace(/\.c$/, '.o') + ':' + u.from + ':(.text+0x2e): ' : '/usr/lib/gcc/x86_64-pc-cygwin/libcygwin.a(libcmain.o): ') + 'undefined reference to `' + u.n + "'" }));
        out.push({ c: 'err', t: 'collect2: error: ld returned 1 exit status' });
        undef.forEach((u) => out.push({ c: 'hint', t: u.n === 'WinMain' ? '↳ PIII LAB: main 関数を含むファイルがリンクされていません (main を含む .c / .o も gcc に渡す)' : '↳ PIII LAB: 関数 ' + u.n + ' の本体 (定義) が, リンクしたどのファイルにもありません。' + (/^prin|^scan/.test(u.n) ? '関数名のつづり間違いでは?' : u.n + ' を定義した .c か .o も一緒に gcc に渡してください') }));
        return { out, ok: false };
      }
      const exe = (oName || 'a').replace(/\.exe$/, '') + '.exe';
      fs.set(exe, { kind: 'exe', parts });
      return { out, ok: true, note: exe + ' を作成 (' + parts.map((p) => p.unit.replace(/\.c$/, srcs.includes(p.unit) ? '.c' : '.o')).join(' + ') + ' をリンク)' };
    }

    /* ---- 実行 ---- */
    function runExe(name, args, line, rec) {
      const exe = fs.get(name.replace(/^\.\//, '').replace(/\.exe$/, '') + '.exe');
      if (!exe || exe.kind !== 'exe') { const n = name.replace(/^\.\//, ''); rec.out.push({ c: 'err', t: '-bash: ' + name + ': No such file or directory' }); if (fs.has(n.replace(/\.exe$/, '') + '.c') || fs.has(n)) rec.out.push({ c: 'hint', t: '↳ PIII LAB: 先に gcc でコンパイルして実行ファイル (a.exe) を作ります' }); return false; }
      let inF = null, outF = null, errF = null;
      for (let k = 0; k < args.length; k++) {
        const a = args[k];
        if (a === '<') inF = args[++k]; else if (a === '>') outF = args[++k]; else if (a === '2>') errF = args[++k];
        else if (/^<./.test(a)) inF = a.slice(1); else if (/^2>./.test(a)) errF = a.slice(2); else if (/^>./.test(a)) outF = a.slice(1);
      }
      if (inF !== null) {
        const f = fs.get(inF);
        if (!f || f.kind !== 'text') { rec.out.push({ c: 'err', t: '-bash: ' + inF + ': No such file or directory' }); return false; }
      }
      const files = {}, units = [];
      exe.parts.forEach((p) => Object.assign(files, p.snap));
      exe.parts.forEach((p) => { files[p.unit] = p.snap[p.unit]; units.push(p.unit); });
      const mainUnit = exe.parts.find((p) => p.info.defined.includes('main')).unit;
      const ord = [mainUnit].concat(units.filter((u) => u !== mainUnit));
      const proc = { files, units: ord, inF, outF, errF, acc: '', el: h('div.sh-run'), rec };
      screen.appendChild(proc.el);
      if (inF !== null) { proc.acc = fs.get(inF).text; finish(proc, true); return true; }
      running = proc;
      step(proc, false);
      return true;
    }
    function execProc(proc) { return g.CLab.run(proc.files, proc.units, { stdin: proc.acc, maxSnaps: 2, maxOps: 3000000 }); }
    function renderTerm(proc, r, final) {
      proc.el.innerHTML = '';
      const hideIn = proc.inF !== null;
      let stopped = false;
      for (const seg of r.term || []) {
        if (seg.s === 'eof' && !final) { stopped = true; break; }
        if ((seg.s === 'in' || seg.s === 'eof') && hideIn) continue;
        if (seg.s === 'out' && proc.outF) continue;
        if (seg.s === 'err' && proc.errF) continue;
        proc.el.appendChild(h('span.t-' + seg.s, seg.t));
      }
      if (final && r.error) proc.el.appendChild(h('div.t-rterr', (r.error.phase === 'compile' ? '' : '[実行時エラー] ') + (r.error.loc ? r.error.loc.file + ':' + r.error.loc.line + ' ' : '') + r.error.msg));
      return stopped;
    }
    function step(proc) {
      const r = execProc(proc);
      const wants = (r.term || []).some((s) => s.s === 'eof');
      if (wants && !r.error) {
        proc.async = true;
        renderTerm(proc, r, false);
        inLine.classList.add('typing'); promptEl.textContent = ''; input.placeholder = 'キーボード入力 → Enter / 入力終わりは Ctrl+D';
        scroll();
        return;
      }
      finish(proc, false, r);
    }
    function finish(proc, viaFile, r0) {
      const r = r0 || execProc(proc);
      renderTerm(proc, r, true);
      if (proc.outF) setText(proc.outF, r.out);
      if (proc.errF) setText(proc.errF, r.err);
      proc.rec.out.push({ c: 'run', t: r.out, err: r.err, error: r.error });
      proc.rec.result = r;
      running = null;
      inLine.classList.remove('typing'); promptEl.textContent = '$'; input.placeholder = '';
      paintFiles();
      if (proc.async) endCmd(proc.rec);
    }
    function sendEof() {
      if (!running) { return; }
      const p = running; finish(p, false);
    }

    /* ---- コマンド ---- */
    function exec(line) {
      line = line.trim();
      screen.appendChild(ps1());
      const cl = h('div.sh-cmd', h('span.ps', '$ '), h('span', line));
      screen.appendChild(cl);
      if (!line) { scroll(); return; }
      hist.unshift({ cmd: line, out: [] }); hPos = -1;
      const rec = hist[0];
      const a = argv(line);
      const cmd = a[0];
      const say = (c, t) => rec.out.push({ c, t });
      if (cmd === 'gcc' || cmd === 'cc') {
        const r = gcc(a.slice(1));
        rec.out.push(...r.out); rec.ok = r.ok;
        if (r.note) say('note', '↳ ' + r.note);
      } else if (/^\.\//.test(cmd) || cmd === 'a' || cmd === 'a.exe') {
        if (!/^\.\//.test(cmd)) { say('err', '-bash: ' + cmd + ': command not found'); say('hint', '↳ PIII LAB: カレントディレクトリのプログラムは ./' + cmd + ' のように ./ を付けて実行します'); }
        else if (runExe(cmd, a.slice(1), line, rec)) { if (running) { scroll(); return; } }
      } else if (cmd === 'diff') {
        const opt = { w: false, B: false }; const fl = [];
        a.slice(1).forEach((x) => { if (/^-/.test(x)) { if (/w/.test(x)) opt.w = true; if (/B/.test(x)) opt.B = true; } else fl.push(x); });
        if (fl.length !== 2) say('err', 'diff: 2 つのファイルを指定します');
        else {
          const [f1, f2] = fl.map((n) => fs.get(n));
          if (!f1 || f1.kind !== 'text') say('err', 'diff: ' + fl[0] + ': No such file or directory');
          else if (!f2 || f2.kind !== 'text') say('err', 'diff: ' + fl[1] + ': No such file or directory');
          else {
            const d = diff(f1.text, f2.text, opt);
            d.forEach((l) => say(/^</.test(l) ? 'd-del' : /^>/.test(l) ? 'd-add' : 'd-hd', l));
            rec.diff = { files: fl, same: d.length === 0 };
            say(d.length ? 'hint' : 'ok', d.length ? '↳ PIII LAB: 差分あり (< は ' + fl[0] + ' だけにある行, > は ' + fl[1] + ' だけにある行)' : '↳ PIII LAB: 何も表示されない = 2 つのファイルは一致');
          }
        }
      } else if (cmd === 'cat') {
        a.slice(1).forEach((n) => { const f = fs.get(n); if (!f) say('err', 'cat: ' + n + ': No such file or directory'); else if (f.kind !== 'text') say('err', 'cat: ' + n + ': バイナリファイルです (機械語なので人間には読めません)'); else say('txt', f.text.replace(/\n$/, '')); });
      } else if (cmd === 'ls') {
        say('txt', [...fs.keys()].sort().join('  '));
      } else if (cmd === 'rm') {
        a.slice(1).forEach((n) => { if (!fs.delete(n)) say('err', "rm: cannot remove '" + n + "': No such file or directory"); });
      } else if (cmd === 'clear') {
        screen.innerHTML = ''; endCmd(rec); return;
      } else if (cmd === 'help') {
        say('txt', '使えるコマンド:\n  gcc [-c] [-o 名前] ファイル...   コンパイル / リンク\n  ./a [< 入力] [> 出力] [2> エラー]  実行とリダイレクト\n  diff [-w] [-B] ファイル1 ファイル2\n  cat ファイル / ls / rm ファイル / clear');
      } else {
        say('err', '-bash: ' + cmd + ': command not found'); say('hint', '↳ help で使えるコマンドを表示');
      }
      paintOut(rec); paintFiles(); scroll();
    }
    function paintOut(rec) {
      rec.out.forEach((x) => { if (x.c !== 'run') print('o-' + x.c, x.t); });
      endCmd(rec, true);
    }
    function endCmd(rec, already) {
      void already;
      if (o.goals) paintGoals();
      if (o.onCmd) o.onCmd(rec, api);
      scroll();
    }
    function paintGoals() {
      goalsEl.innerHTML = '';
      o.goals.forEach((gl) => {
        const done = gl.done || (gl.done = !!gl.test(hist, api));
        goalsEl.appendChild(h('li' + (done ? '.ok' : ''), h('i', done ? '✓' : ''), h('span', { html: gl.text })));
      });
    }

    input.addEventListener('keydown', (e) => {
      if (running) {
        if (e.key === 'Enter') { e.preventDefault(); running.acc += input.value + '\n'; input.value = ''; step(running); }
        else if ((e.key === 'd' || e.key === 'D') && e.ctrlKey) { e.preventDefault(); if (input.value) { running.acc += input.value; input.value = ''; } sendEof(); }
        else if ((e.key === 'c' || e.key === 'C') && e.ctrlKey) { e.preventDefault(); running.el.appendChild(h('span.t-eof', '^C\n')); const p = running; running = null; inLine.classList.remove('typing'); promptEl.textContent = '$'; input.placeholder = ''; p.rec.out.push({ c: 'run', t: '' }); endCmd(p.rec); }
        return;
      }
      if (e.key === 'Enter') { e.preventDefault(); const v = input.value; input.value = ''; exec(v); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (hPos < hist.length - 1) { hPos++; input.value = hist[hPos].cmd; } }
      else if (e.key === 'ArrowDown') { e.preventDefault(); if (hPos > 0) { hPos--; input.value = hist[hPos].cmd; } else { hPos = -1; input.value = ''; } }
      else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); screen.innerHTML = ''; }
    });

    const api = {
      exec, fs, hist,
      text: (n) => { const f = fs.get(n); return f && f.kind === 'text' ? f.text : null; },
      setFiles(files) { Object.entries(files).forEach(([n, t]) => setText(n, t)); paintFiles(); },
      reset(files) { fs.clear(); Object.entries(files || o.files || {}).forEach(([n, t]) => setText(n, t)); screen.innerHTML = ''; hist.length = 0; running = null; inLine.classList.remove('typing'); promptEl.textContent = '$'; paintFiles(); if (o.goals) { o.goals.forEach((x) => (x.done = false)); paintGoals(); } },
    };
    el.api = api;
    paintFiles();
    if (o.goals) paintGoals();
    if (o.banner !== false) print('o-mute', o.banner || 'PIII LAB 仮想ターミナル — 下のボタンを押すか, コマンドを打ち込んで Enter (help で一覧)');
    if (o.auto) o.auto.forEach((c) => exec(c));
    return el;
  }

  g.Shell = Shell;
  g.ShellDiff = diff;
})(window);
