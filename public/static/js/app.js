/* =========================================================================
 *  PIII LAB — アプリ本体 (ホーム / 単元ページ / 各ウィジェット)
 * ========================================================================= */
(function () {
  'use strict';
  const { h, codeBlock, store, toast, icon } = U;
  const app = document.getElementById('app');
  const page = document.body.dataset.page;
  const unitId = document.body.dataset.unit;

  /* ---------------- 進捗 ---------------- */
  const prog = {
    key: (u) => 'progress:' + u,
    get(u) { return store.get(this.key(u), { predict: {}, tasks: {} }); },
    set(u, v) { store.set(this.key(u), v); },
    mark(u, kind, id, val) { const p = this.get(u); p[kind][id] = val; this.set(u, p); refreshProgress(); },
  };
  function unitScore(u) {
    const def = window.UNITS && window.UNITS[u];
    if (!def) return 0;
    const p = prog.get(u);
    const nP = def.predictCount || 0, nT = (def.tasks || []).filter((t) => !t.optional).length;
    const dP = Object.values(p.predict).filter(Boolean).length;
    const dT = (def.tasks || []).filter((t) => !t.optional && p.tasks[t.id] === 'done').length;
    const tot = nP + nT * 2;
    return tot ? Math.round(((Math.min(dP, nP) + dT * 2) / tot) * 100) : 0;
  }
  function refreshProgress() {
    if (!unitId) return;
    const pct = unitScore(unitId);
    document.querySelectorAll('.ring').forEach((r) => r.style.setProperty('--p', pct));
    document.querySelectorAll('.pct').forEach((r) => (r.textContent = pct + '%'));
    const p = prog.get(unitId);
    document.querySelectorAll('.rail a[data-task]').forEach((a) => {
      const st = p.tasks[a.dataset.task];
      const d = a.querySelector('.st'); d.className = 'st' + (st === 'done' ? ' done' : st === 'try' ? ' half' : '');
    });
    document.querySelectorAll('.task-tile').forEach((t) => {
      const st = p.tasks[t.dataset.id];
      t.classList.toggle('done', st === 'done'); t.classList.toggle('try', st === 'try');
      t.querySelector('.badge').textContent = st === 'done' ? '✓ 完了' : st === 'try' ? '挑戦中' : '未着手';
    });
  }

  /* ---------------- トップバー ---------------- */
  function topbar(extra) {
    return h('header.topbar',
      extra && extra.menu ? h('button.btn.sm.icon.ghost.rail-toggle', { 'aria-label': '目次', onclick: () => document.body.classList.toggle('rail-open') }, icon('menu')) : null,
      h('a.brand', { href: '/' }, h('span.brand-mark', h('b', '*'), 'p'), h('span', 'PIII LAB', h('small', 'プログラミング実習Ⅲ'))),
      extra && extra.crumb ? h('div.crumb', h('span', '/'), h('b', extra.crumb)) : null,
      h('div.sp'),
      extra && extra.progress ? h('div.progress-pill', h('span.pct', '0%'), h('span.ring')) : null,
      h('div.topbar-progress'));
  }
  window.addEventListener('scroll', () => {
    const b = document.querySelector('.topbar-progress');
    if (!b) return;
    const max = document.documentElement.scrollHeight - innerHeight;
    b.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + '%';
  }, { passive: true });

  /* ---------------- ヒーローのメモリ図 (SVG) ---------------- */
  function heroMem() {
    const W = 520, H = 420, cw = 52, ch = 46, x0 = 60, y0 = 40;
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="ポインタ p が変数 a を指すメモリ図">`;
    s += `<defs><marker id="hah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#ff4f7b"/></marker>
      <linearGradient id="fade" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <mask id="m"><rect width="${W}" height="${H}" fill="url(#fade)"/></mask></defs><g mask="url(#m)">`;
    for (let r = 0; r < 8; r++) {
      s += `<text x="${x0 - 12}" y="${y0 + r * ch + 28}" text-anchor="end" class="hm-t" font-size="11" fill-opacity=".45" style="fill:#ffbf47">${100 + r * 8}</text>`;
      for (let c = 0; c < 8; c++) s += `<rect class="hm-cell" x="${x0 + c * cw}" y="${y0 + r * ch}" width="${cw}" height="${ch}"/>`;
    }
    s += '</g>';
    // a : int at 100 (4 bytes = 4 cells)
    s += `<rect class="hm-cell v" x="${x0}" y="${y0}" width="${cw * 4}" height="${ch}" rx="6"/>`;
    s += `<text x="${x0 + 14}" y="${y0 - 10}" class="hm-t" font-size="13" style="fill:#4fd6e6">int a</text>`;
    s += `<text x="${x0 + cw * 2}" y="${y0 + 30}" class="hm-t" font-size="20" font-weight="700" text-anchor="middle" style="fill:#4fd6e6">123</text>`;
    // p : int* at 116 (row 2) 8 bytes
    const py = y0 + ch * 2;
    s += `<rect class="hm-cell p" x="${x0}" y="${py}" width="${cw * 8}" height="${ch}" rx="6"/>`;
    s += `<text x="${x0 + 14}" y="${py - 10}" class="hm-t" font-size="13" style="fill:#ff4f7b">int *p</text>`;
    s += `<text x="${x0 + cw * 4}" y="${py + 30}" class="hm-t" font-size="20" font-weight="700" text-anchor="middle" style="fill:#ff4f7b">100 <tspan font-size="12" fill-opacity=".6">(番地)</tspan></text>`;
    s += `<path class="hm-arrow" d="M${x0 + cw * 8} ${py + ch / 2} C ${x0 + cw * 8 + 70} ${py + ch / 2}, ${x0 + cw * 4 + 260} ${y0 + ch / 2}, ${x0 + cw * 4 + 6} ${y0 + ch / 2}" marker-end="url(#hah)"/>`;
    s += `<text x="${x0 + cw * 5}" y="${y0 + ch * 1.42}" class="hm-t" font-size="13" style="fill:#ff4f7b">*p は a そのもの</text>`;
    s += `<text x="${x0}" y="${py + ch + 44}" class="hm-t" font-size="12" fill-opacity=".55">p = &amp;a;   /* a の番地を p に */</text>`;
    s += `<text x="${x0}" y="${py + ch + 66}" class="hm-t" font-size="12" fill-opacity=".55">*p = 123;  /* p が指す先 (a) に書く */</text>`;
    s += '</svg>';
    return h('div.hero-mem', { html: s });
  }

  /* ================= ホーム ================= */
  function renderHome() {
    document.title = 'PIII LAB — プログラミング実習Ⅲ';
    const list = h('div');
    const units = window.UNIT_INDEX || [];
    units.forEach((u) => {
      const ready = !!u.ready;
      const pct = ready ? unitScore(u.id) : 0;
      list.appendChild(h(ready ? 'a.unit-row' : 'div.unit-row.soon', ready ? { href: '/' + u.id } : {},
        h('div.uid', u.id.toUpperCase()),
        h('div', h('div.ut', u.title), h('div.ud', u.desc)),
        h('div.meta', ready ? h('span.chip' + (pct === 100 ? '.ok' : ''), pct + '% 完了') : h('span.chip', u.note || '準備中')),
        h('div.go', ready ? icon('arrow') : h('span.c-mute', '·'))));
    });
    app.append(
      topbar(),
      h('section.home-hero',
        h('div', { style: { position: 'relative', zIndex: 2 } },
          h('div.eyebrow', 'Programming Practice III — 2026'),
          h('h1', 'Learn by', h('br'), 'Tracing.', h('span.jp', 'プログラミング実習Ⅲ')),
          h('p.home-lead', 'コードが「メモリの上で何をしているか」を, 1 行ずつ目で見て理解する。予想して, 動かして, 自分で書く。課題とレポートまで, このページで完結します。'),
          h('div', { style: { display: 'flex', gap: '10px', flexWrap: 'wrap' } },
            h('a.btn.ptr', { href: '/b3' }, 'B3 ポインタを始める', icon('arrow')),
            h('a.btn', { href: '#units' }, '単元一覧'))),
        h('div.hero-art', heroMem())),
      h('section.units#units',
        h('div.units-head', h('h2', 'Units'), h('span.c-mute.mono', { style: { fontSize: '12px' } }, units.filter((u) => u.ready).length + ' / ' + units.length + ' 公開中')),
        list),
      h('footer.foot', h('span', 'PIII LAB — 学習用の非公式サイトです。課題の正式な仕様は配布資料に従ってください。'), h('span.mono', 'C → Memory → Understanding')));
  }

  /* ================= 単元ページ ================= */
  function renderUnit() {
    const U0 = window.UNITS[unitId];
    if (!U0) { app.textContent = '単元が見つかりません'; return; }
    const rail = h('nav.rail', { 'aria-label': '目次' });
    const main = h('main.main');
    app.append(topbar({ crumb: unitId.toUpperCase() + ' ' + U0.title, progress: true, menu: true }), h('div.unit-wrap', rail, main));

    // ヒーロー
    main.appendChild(U0.hero(heroMem));

    // 章
    const navItems = [];
    U0.chapters.forEach((c) => {
      const sec = h('section.chap#' + c.id, { 'aria-labelledby': c.id + '-h' },
        h('div.chap-head.rv', h('div.chap-num', c.num), h('div', h('div.chap-kicker', c.kicker), h('h2#' + c.id + '-h', c.title), c.lead ? h('p.chap-lead', c.lead) : null)));
      c.blocks.forEach((b) => { const el = block(b, c); if (el) { el.classList.add('rv'); sec.appendChild(el); } });
      main.appendChild(sec);
      navItems.push({ group: c.group, id: c.id, n: c.num, t: c.navTitle || c.title });
    });
    main.appendChild(h('footer.foot', h('span', 'PIII LAB · ' + unitId.toUpperCase() + ' ' + U0.title + ' — 内容は配布資料「' + U0.source + '」に基づきます。'), h('a', { href: '/' }, '← 単元一覧')));

    // 目次
    let lastG = null;
    navItems.forEach((n) => {
      if (n.group !== lastG) { rail.appendChild(h('h4', n.group)); lastG = n.group; }
      rail.appendChild(h('a', { href: '#' + n.id, 'data-nav': n.id, onclick: () => document.body.classList.remove('rail-open') }, h('span.n', n.n), h('span', n.t), h('span')));
    });
    rail.appendChild(h('h4', '課題一覧'));
    U0.tasks.forEach((t) => rail.appendChild(h('a', { href: '#lab', 'data-task': t.id, onclick: (e) => { e.preventDefault(); openTask(t.id, true); document.body.classList.remove('rail-open'); } }, h('span.n', t.label), h('span', t.short), h('span.st'))));

    // スクロール連動
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (e.isIntersecting) {
          rail.querySelectorAll('a[data-nav]').forEach((a) => a.classList.toggle('on', a.dataset.nav === e.target.id));
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    main.querySelectorAll('section.chap').forEach((s) => io.observe(s));
    const rvio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); rvio.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    main.querySelectorAll('.rv').forEach((el) => rvio.observe(el));
    refreshProgress();
    if (location.hash.startsWith('#task-')) setTimeout(() => openTask(location.hash.slice(6), true), 300);
  }

  /* ---------------- ブロック ---------------- */
  function block(b) {
    switch (b.type) {
      case 'prose': return h('div.prose.blk', { html: b.html });
      case 'point': return h('div.blk', h('div.point', h('div.pn', 'POINT ' + b.n), h('div', h('div.pt', { html: b.title }), b.sub ? h('div.ps', { html: b.sub }) : null)));
      case 'callout': return h('div.blk', h('div.callout.' + (b.kind || 'info'), { html: b.html }));
      case 'code': return h('div.blk', b.title ? h('div.blk-title', { html: b.title }) : null, codeBlock(b.code, { hl: b.hl }));
      case 'compare': return h('div.blk', b.title ? h('div.blk-title', { html: b.title }) : null,
        h('div.compare', b.items.map((it) => h('div.cmp-card', h('h5', { html: it.title }), it.code ? codeBlock(it.code, { hl: it.hl }) : null, it.html ? h('div.prose', { style: { marginTop: '10px', fontSize: '14px' }, html: it.html }) : null))));
      case 'tracer': { const tr = MemViz.Tracer({ files: b.files || { 'main.c': b.code }, units: b.units || [b.main || 'main.c'], stdin: b.stdin, showStdin: b.showStdin, title: '' }); const t = tr.querySelector('.tr-head .t'); t.innerHTML = b.title || U.esc(b.name || 'ステップ実行'); return h('div.blk', tr); }
      case 'predict': return h('div.blk', predict(b));
      case 'repl': return h('div.blk', repl(b));
      case 'cheat': return h('div.blk', h('div.cheat', b.items.map((it) => h('div.cheat-card', h('div.cc', it.c), h('div.cd', { html: it.d }), it.code ? h('pre', it.code) : null))));
      case 'lab': return h('div.blk', lab(b));
      case 'report': return h('div.blk', reportBox());
      case 'html': return h('div.blk', { html: b.html });
      case 'mistakes': return h('div.blk', mistakes(b));
    }
    return null;
  }

  /* ---------------- 予想ウィジェット ---------------- */
  function predict(b) {
    const done = prog.get(unitId).predict[b.id];
    const files = b.files || { 'main.c': b.code };
    const units = b.units || ['main.c'];
    const qBox = h('div.predict-q', h('div.chip.val', { style: { alignSelf: 'flex-start' } }, h('span.dot'), '予想してから実行'), h('div.q', { html: b.q }));
    const traceHost = h('div.predict-trace');
    const verdictHost = h('div');
    let answered = false;
    const reveal = (ok, user) => {
      if (answered) return; answered = true;
      const r = CLab.run(files, units, { stdin: b.stdin || '', maxSnaps: 5 });
      const actual = r.error ? 'エラー: ' + r.error.msg : r.out;
      verdictHost.innerHTML = '';
      const vok = ok === null ? normalize(user) === normalize(actual) : ok;
      verdictHost.appendChild(h('div.verdict.' + (vok ? 'ok' : 'ng'),
        h('h6', vok ? '正解!' : '惜しい — 実際の結果はこちら'),
        h('pre', actual.trim() || '(出力なし)'),
        b.explain ? h('div', { html: b.explain }) : null));
      prog.mark(unitId, 'predict', b.id, true);
      traceHost.innerHTML = '';
      traceHost.appendChild(MemViz.Tracer({ files, units, stdin: b.stdin, title: 'なぜそうなる? — メモリで確認 (→ キーで 1 行ずつ)', eager: true }));
      wrap.classList.add('revealed');
    };
    if (b.choices) {
      const list = h('div.choices');
      b.choices.forEach((c, k) => {
        const btn = h('button.choice', { onclick: () => {
          if (answered) return;
          [...list.children].forEach((x, j) => { x.disabled = true; if (j === b.answer) x.classList.add('right'); });
          if (k !== b.answer) btn.classList.add('wrong');
          reveal(k === b.answer);
        } }, h('span.k', String.fromCharCode(97 + k)), h('span', { html: c }));
        list.appendChild(btn);
      });
      qBox.appendChild(list);
    } else {
      const ta = h('textarea', { placeholder: b.placeholder || '出力を予想して書いてみよう', 'aria-label': '予想する出力' });
      qBox.append(ta, h('div', { style: { display: 'flex', gap: '8px' } },
        h('button.btn.sm.pri', { onclick: () => reveal(null, ta.value) }, icon('run'), '答え合わせ'),
        h('button.btn.sm.ghost', { onclick: () => reveal(false, '') }, '分からない')));
    }
    qBox.appendChild(verdictHost);
    if (done) qBox.appendChild(h('div.c-mute', { style: { fontSize: '12px' } }, '✓ 回答済み (もう一度挑戦できます)'));
    const wrap = h('div.predict', h('div.predict-top', codeBlock(files[units[0]], { hl: b.hl }), qBox), traceHost);
    return wrap;
  }
  const normalize = (s) => String(s || '').replace(/\r/g, '').split('\n').map((l) => l.trim()).filter(Boolean).join('\n');

  /* ---------------- ポインタ実験室 (REPL) ---------------- */
  function repl(b) {
    let lines = (b.init || []).slice();
    const histEl = h('div.repl-hist');
    const msg = h('div.repl-msg', { html: b.intro || '下の入力欄に C の文を 1 つずつ入力して <span class="kbd">Enter</span>。メモリ図が即座に変化します。' });
    const memHost = h('div');
    const outEl = h('pre');
    const input = h('input', { type: 'text', placeholder: '例: int a = 10;', 'aria-label': 'C の文を入力', spellcheck: 'false', autocomplete: 'off' });
    const recall = []; let ri = -1;
    function build(ls) { return (b.prelude || '#include <stdio.h>\n') + 'int main(void)\n{\n' + ls.map((l) => '    ' + l).join('\n') + '\n    return 0;\n}\n'; }
    function render(ls, lastErr) {
      histEl.innerHTML = '';
      histEl.appendChild(h('div.hl0', 'int main(void) {'));
      ls.forEach((l, k) => histEl.appendChild(h('div.hl1' + (k === ls.length - 1 ? '.last' : ''), l)));
      histEl.appendChild(h('div.hl0', '}'));
      histEl.scrollTop = histEl.scrollHeight;
      const r = CLab.run({ 'main.c': build(ls) }, ['main.c'], { stdin: '', maxSnaps: 4000 });
      if (r.steps.length) {
        const rp = MemViz.Replayer(r.steps);
        // return の直前の状態を表示 (main のフレームを保持)
        let k = r.steps.length - 1;
        while (k > 0 && r.steps[k].loc && r.steps[k].loc.end) k--;
        const mem = rp.seek(r.steps.length - 1);
        const s = Object.assign({}, r.steps[k], { log: lastStepLog(r, ls) });
        MemViz.renderMem(memHost, s, mem);
      }
      outEl.textContent = r.out || '';
      return r;
    }
    function lastStepLog(r, ls) {
      // 最後に追加した文 (main の ls.length 行目) 以降の変化をハイライト
      const n = (b.prelude || '#include <stdio.h>\n').split('\n').length - 1 + 2 + ls.length;
      const out = [];
      let on = false;
      r.steps.forEach((s) => { if (on) out.push(...s.log); if (s.loc && s.loc.line === n) on = true; });
      return out;
    }
    function submit(text) {
      text = text.trim();
      if (!text) return;
      if (!/[;}]$/.test(text)) text += ';';
      recall.push(text); ri = recall.length;
      const tryLines = lines.concat([text]);
      const r = CLab.run({ 'main.c': build(tryLines) }, ['main.c'], { maxSnaps: 4000 });
      if (r.error) {
        msg.className = 'repl-msg err';
        msg.innerHTML = '<b>受け付けませんでした:</b> ' + U.esc(r.error.msg) + '<br><span style="font-size:12px;opacity:.75">この文は取り消されました。修正してもう一度試そう。</span>';
        input.value = text;
        return;
      }
      lines = tryLines;
      render(lines);
      msg.className = 'repl-msg ok';
      msg.innerHTML = explainStmt(text, r);
      input.value = '';
      if (b.goals) checkGoals(r);
    }
    function explainStmt(t, r) {
      const m1 = /^(int|double|char)\s*\*\s*(\w+)\s*;/.exec(t);
      if (m1) return '<b>' + m1[2] + '</b> は「' + m1[1] + ' 型の変数の番地」を入れるポインタ変数。まだ何も指していない (不定) ので, 使う前に <code class="ic p">' + m1[2] + ' = &amp;変数;</code> で番地を入れよう。';
      const m2 = /^(\w+)\s*=\s*&\s*(\w+)/.exec(t);
      if (m2) return '<b class="c-ptr">' + m2[1] + '</b> に <b>' + m2[2] + '</b> の<b class="c-addr">番地</b>を代入 → 矢印で「指している」ことを表示しています。';
      const m3 = /^\*\s*(\w+)\s*=/.exec(t);
      if (m3) return '<code class="ic p">*' + m3[1] + '</code> は「' + m3[1] + ' が指す先」。だから<b>指されている変数</b>の値が変わりました (変数名を書かずに書き換えた!)。';
      if (/printf/.test(t)) return '出力: <code class="ic">' + U.esc((r.out.trim().split('\n').pop() || '')) + '</code>';
      const m4 = /^(int|double|char)\s+(\w+)/.exec(t);
      if (m4) return '変数 <b>' + m4[2] + '</b> のための領域 (' + (m4[1] === 'double' ? 8 : m4[1] === 'char' ? 1 : 4) + ' バイト) がメモリ上に確保されました。左の黄色い数字がその<b class="c-addr">番地</b>です。';
      return '実行しました。メモリ図の黄色いハイライトが変化した場所です。';
    }
    const goalEl = b.goals ? h('div.repl-quick', { style: { borderTop: '1px solid var(--line)', display: 'block' } }) : null;
    function checkGoals(r) {
      if (!goalEl) return;
      goalEl.innerHTML = '';
      goalEl.appendChild(h('div', { style: { fontSize: '11px', color: 'var(--mute)', fontFamily: 'var(--f-mono)', letterSpacing: '.1em', marginBottom: '6px' } }, 'MISSION'));
      b.goals.forEach((g) => {
        const ok = r && g.test(lines.join('\n'), r);
        goalEl.appendChild(h('div', { style: { fontSize: '13px', display: 'flex', gap: '8px', color: ok ? 'var(--ok)' : 'var(--ink-2)' } }, h('span', ok ? '✓' : '○'), h('span', { html: g.text })));
      });
    }
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); submit(input.value); }
      else if (e.key === 'ArrowUp' && recall.length) { e.preventDefault(); ri = Math.max(0, ri - 1); input.value = recall[ri]; }
      else if (e.key === 'ArrowDown' && recall.length) { e.preventDefault(); ri = Math.min(recall.length, ri + 1); input.value = recall[ri] || ''; }
    });
    const quick = h('div.repl-quick', (b.quick || []).map((q) => h('button', { onclick: () => { submit(q); input.focus(); }, title: 'クリックで実行' }, q)));
    const el = h('div.repl',
      h('div.tr-head', h('span.t', b.title || 'ポインタ実験室'), h('span.sp'),
        h('button.btn.sm', { onclick: () => { lines = (b.init || []).slice(); render(lines); msg.className = 'repl-msg'; msg.innerHTML = 'リセットしました。'; checkGoals(null); } }, icon('reset'), 'リセット'),
        h('button.btn.sm', { onclick: () => { if (lines.length) { lines.pop(); render(lines); msg.className = 'repl-msg'; msg.textContent = '1 文取り消しました。'; } } }, '1 つ戻す')),
      h('div.repl-body',
        h('div.repl-left', histEl, h('div.repl-in', input, h('button.btn.ptr', { onclick: () => submit(input.value) }, '実行')), quick, goalEl),
        h('div.repl-right', msg, h('div.tr-mem', memHost, MemViz.legend()), h('div.tr-console', h('div.ch', h('span', '出力')), outEl))));
    setTimeout(() => { render(lines); checkGoals(null); }, 0);
    return el;
  }

  /* ---------------- よくあるミス ---------------- */
  function mistakes(b) {
    const wrap = h('div.compare');
    b.items.forEach((it) => {
      const out = h('div');
      const card = h('div.cmp-card', h('h5', { html: '<span class="chip ptr">BUG</span> ' + it.title }), codeBlock(it.code, { hl: it.hl }), out,
        h('div', { style: { marginTop: '10px', display: 'flex', gap: '8px' } },
          h('button.btn.sm', { onclick: () => {
            const r = CLab.run({ 'main.c': it.code }, ['main.c'], { stdin: it.stdin || '', maxSnaps: 5 });
            out.innerHTML = '';
            out.appendChild(h('div.verdict.ng', { style: { marginTop: '10px' } }, h('h6', 'このサイトの診断'), h('div', r.error ? r.error.msg : '出力: ' + r.out), h('div', { style: { marginTop: '6px', color: 'var(--ink)' }, html: '<b>直し方:</b> ' + it.fix })));
          } }, icon('run'), '実行して診断')));
      wrap.appendChild(card);
    });
    return wrap;
  }

  /* ================= 課題ラボ ================= */
  let labApi = null;
  function openTask(id, scroll) { if (labApi) labApi.open(id); if (scroll) document.getElementById('lab').scrollIntoView({ behavior: 'smooth' }); }

  function lab() {
    const U0 = window.UNITS[unitId];
    const tiles = h('div.task-grid');
    const host = h('div');
    let cur = null;
    U0.tasks.forEach((t) => tiles.appendChild(h('button.task-tile', { 'data-id': t.id, onclick: () => open(t.id) },
      h('div.tn', h('span', t.label), h('span.badge', '未着手')), h('div.tt', t.short), h('div.tf', t.files.join(' · ')))));
    function open(id, silent) {
      const t = U0.tasks.find((x) => x.id === id);
      if (!t) return;
      cur = id;
      [...tiles.children].forEach((x) => x.classList.toggle('on', x.dataset.id === id));
      host.innerHTML = '';
      host.appendChild(taskView(t));
      if (!silent) history.replaceState(null, '', '#task-' + id);
      refreshProgress();
    }
    labApi = { open };
    setTimeout(() => open(U0.tasks[0].id, true), 0);
    void cur;
    return h('div', tiles, host);
  }

  function loadCM(cb) {
    if (window.CodeMirror) return cb(true);
    if (loadCM.q) { loadCM.q.push(cb); return; }
    loadCM.q = [cb];
    const base = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/';
    const css = h('link', { rel: 'stylesheet', href: base + 'codemirror.min.css' }); document.head.appendChild(css);
    const s1 = h('script', { src: base + 'codemirror.min.js' });
    s1.onload = () => {
      let n = 0; const fin = () => { if (++n === 4) loadCM.q.forEach((f) => f(true)); };
      ['mode/clike/clike.min.js', 'addon/edit/matchbrackets.min.js', 'addon/edit/closebrackets.min.js', 'addon/selection/active-line.min.js'].forEach((p) => { const s = h('script', { src: base + p }); s.onload = fin; s.onerror = fin; document.head.appendChild(s); });
    };
    s1.onerror = () => loadCM.q.forEach((f) => f(false));
    document.head.appendChild(s1);
  }

  function taskView(t) {
    const codeKey = (f) => 'code:' + unitId + ':' + t.id + ':' + f;
    const notesKey = 'notes:' + unitId + ':' + t.id;
    const files = {};
    t.files.forEach((f) => (files[f] = store.get(codeKey(f), t.starter[f])));
    const given = t.given || {};
    let curFile = t.files[0];
    let cm = null, ta = null;
    const notes = store.get(notesKey, { kufu: '', kanso: '', obs: '' });

    const fileTabs = h('div.tr-files');
    const allFiles = t.files.concat(Object.keys(given));
    allFiles.forEach((f) => fileTabs.appendChild(h('button', { 'data-f': f, onclick: () => switchFile(f) }, f, given[f] !== undefined ? h('span.c-mute', { style: { fontSize: '10px', marginLeft: '6px' } }, '配布') : null)));
    const edHost = h('div.ed');

    function getCode() { return cm ? cm.getValue() : ta ? ta.value : files[curFile]; }
    function saveCur() { if (t.files.includes(curFile)) { files[curFile] = getCode(); store.set(codeKey(curFile), files[curFile]); } }
    function switchFile(f) {
      saveCur();
      curFile = f;
      [...fileTabs.children].forEach((b) => b.classList.toggle('on', b.dataset.f === f));
      const ro = given[f] !== undefined;
      const val = ro ? given[f] : files[f];
      if (cm) { cm.setValue(val); cm.setOption('readOnly', ro); edHost.classList.toggle('cm-readonly', ro); cm.clearHistory(); }
      else if (ta) { ta.value = val; ta.readOnly = ro; }
    }
    loadCM((ok) => {
      if (ok && window.CodeMirror) {
        cm = CodeMirror(edHost, { value: files[curFile], mode: 'text/x-csrc', lineNumbers: true, matchBrackets: true, autoCloseBrackets: true, styleActiveLine: true, indentUnit: 4, tabSize: 4, indentWithTabs: false, lineWrapping: false, extraKeys: { 'Ctrl-Enter': () => runTests(), 'Cmd-Enter': () => runTests(), Tab: (c) => c.replaceSelection('    ') } });
        let tm; cm.on('change', () => { clearTimeout(tm); tm = setTimeout(saveCur, 400); });
        setTimeout(() => cm.refresh(), 50);
      } else {
        ta = h('textarea.ed-fallback', { spellcheck: 'false' }); ta.value = files[curFile]; ta.addEventListener('input', saveCur); edHost.appendChild(ta);
      }
      switchFile(curFile);
    });

    // 右側
    const resultHost = h('div.task-out', { 'aria-live': 'polite' }, h('span.c-mute', '「テスト実行」で期待値と比較します (Ctrl+Enter)'));
    const banner = h('div');
    const stdinTa = h('textarea', { rows: 3, 'aria-label': '標準入力' }); stdinTa.value = (t.tests && t.tests[0] && t.tests[0].stdin) || t.stdin || '';
    const hintList = h('div.hint-list');
    let hintN = 0;
    const btnHint = h('button.btn.sm', { onclick: () => {
      if (hintN >= t.hints.length) return;
      hintList.appendChild(h('div.hint', h('b', 'HINT ' + (hintN + 1)), h('span', { html: t.hints[hintN] })));
      hintN++; if (hintN >= t.hints.length) btnHint.disabled = true;
      btnHint.lastChild.textContent = hintN >= t.hints.length ? 'ヒントは以上' : 'ヒント (' + hintN + '/' + t.hints.length + ')';
    } }, icon('bulb'), h('span', 'ヒント (0/' + t.hints.length + ')'));
    const traceHost = h('div.task-trace');

    function allSrc() { saveCur(); return Object.assign({}, given, files); }
    function unitsOf() { return t.link || t.files.filter((f) => f.endsWith('.c')); }
    let lastRun = null;

    function runTests() {
      const src = allSrc();
      resultHost.innerHTML = ''; banner.innerHTML = '';
      if (cm) cm.eachLine((l) => cm.removeLineClass(l, 'background', 'cm-errline'));
      const tests = t.tests && t.tests.length ? t.tests : [{ stdin: stdinTa.value }];
      let allOk = true, outs = [];
      for (let k = 0; k < tests.length; k++) {
        const tc = tests[k];
        const r = CLab.run(src, unitsOf(), { stdin: tc.stdin || '', maxSnaps: 2 });
        outs.push(r);
        if (tests.length > 1) resultHost.appendChild(h('div.c-mute', { style: { marginTop: k ? '10px' : 0 } }, '— テスト ' + (k + 1) + (tc.label ? ' (' + tc.label + ')' : '') + ' —'));
        if (r.error) {
          allOk = false;
          resultHost.appendChild(h('div.er', (r.error.phase === 'compile' ? 'コンパイルエラー' : '実行時エラー') + (r.error.loc ? ' [' + r.error.loc.file + ':' + r.error.loc.line + ']' : '') + '\n' + r.error.msg));
          if (r.out) resultHost.appendChild(h('div', r.out));
          if (cm && r.error.loc && r.error.loc.file === curFile) cm.addLineClass(r.error.loc.line - 1, 'background', 'cm-errline');
          break;
        }
        if (tc.expect !== undefined) {
          const a = r.out.replace(/\r/g, '').split('\n'), e = tc.expect.split('\n');
          if (a[a.length - 1] === '') a.pop(); if (e[e.length - 1] === '') e.pop();
          const n = Math.max(a.length, e.length);
          for (let i = 0; i < n; i++) {
            const ok = a[i] === e[i];
            if (!ok) allOk = false;
            const row = h('div.dl.' + (ok ? 'ok' : 'ng'), h('i', ok ? '✓' : '✗'), h('span', a[i] === undefined ? '(行が足りない)' : a[i] === '' ? '(空行)' : a[i]));
            resultHost.appendChild(row);
            if (!ok) resultHost.appendChild(h('span.exp', '期待値: ' + (e[i] === undefined ? '(この行は不要)' : e[i] === '' ? '(空行)' : e[i])));
          }
        } else {
          resultHost.appendChild(h('div', r.out || '(出力なし)'));
        }
      }
      let verdict = null;
      if (allOk && t.check) verdict = t.check(outs, src, CLab);
      const ok = allOk && (!verdict || verdict.ok);
      lastRun = { ok, outs, verdict };
      banner.appendChild(h('div.result-banner.' + (ok ? 'ok' : allOk && verdict ? 'info' : 'ng'), ok ? '✓ ' + (t.tests ? 'diff なし — 期待値と一致しました' : '要件を満たしています') : allOk && verdict ? '△ ' + verdict.msg : '✗ 期待値と違う箇所があります'));
      if (ok && verdict && verdict.msg) banner.appendChild(h('div.c-mute', { style: { fontSize: '12.5px', marginTop: '6px' }, html: verdict.msg }));
      const p = prog.get(unitId);
      if (ok) { if (p.tasks[t.id] !== 'done') toast(t.label + ' クリア!'); prog.mark(unitId, 'tasks', t.id, 'done'); }
      else if (p.tasks[t.id] !== 'done') prog.mark(unitId, 'tasks', t.id, 'try');
      if (t.observe && ok) obsFacts.innerHTML = t.observe(outs);
      store.set('lastout:' + unitId + ':' + t.id, outs.map((r) => r.out));
      store.set('lastok:' + unitId + ':' + t.id, ok);
    }
    function trace() {
      const src = allSrc();
      traceHost.innerHTML = '';
      const tr = MemViz.Tracer({ files: src, units: unitsOf(), stdin: stdinTa.value, showStdin: true, title: t.label + ' — 自分のコードをステップ実行', eager: true, maxSnaps: 3000 });
      traceHost.appendChild(tr);
      setTimeout(() => traceHost.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
    }
    function showAnswer() {
      if (!confirm('模範解答を表示します。まずは自分で書いてみるのがおすすめです。表示しますか?')) return;
      const box = h('div', { style: { marginTop: '8px' } });
      Object.keys(t.solution).forEach((f) => box.append(h('div.c-mute', { style: { fontSize: '11px', margin: '6px 0 4px', fontFamily: 'var(--f-mono)' } }, f), codeBlock(t.solution[f])));
      box.appendChild(h('button.btn.sm', { style: { marginTop: '8px' }, onclick: () => { if (confirm('エディタの内容を模範解答で置き換えます。よろしいですか?')) { Object.assign(files, t.solution); Object.keys(t.solution).forEach((f) => store.set(codeKey(f), t.solution[f])); switchFile(t.files[0]); } } }, '解答をエディタに読み込む'));
      ansHost.innerHTML = ''; ansHost.appendChild(box);
    }
    const ansHost = h('div');
    function download() {
      saveCur();
      t.files.forEach((f) => {
        const blob = new Blob([files[f].replace(/\r?\n/g, '\n')], { type: 'text/plain' });
        const a = h('a', { href: URL.createObjectURL(blob), download: f }); document.body.appendChild(a); a.click(); a.remove();
      });
      toast(t.files.join(', ') + ' をダウンロード');
    }

    // レポートメモ
    const obsFacts = h('div.c-mute', { style: { fontSize: '12.5px', marginBottom: '6px' } });
    const mkTa = (k, ph) => { const x = h('textarea', { placeholder: ph }); x.value = notes[k] || ''; x.addEventListener('input', () => { notes[k] = x.value; store.set(notesKey, notes); }); return x; };
    const notesEl = h('div.report-notes',
      h('div.rn-head', h('h6', '📝 レポート用メモ — ' + t.label), h('span.c-mute', { style: { fontSize: '12px' } }, '自動保存 · 下の「レポート作成」でまとめて出力')),
      t.observe ? h('div', { style: { gridColumn: '1 / -1' } }, h('label', t.obsLabel || '考察 (レポートに記す内容)'), obsFacts, mkTa('obs', t.obsPh || '実行結果から分かったことを, 自分の言葉で書こう')) : null,
      h('div', h('label', '工夫した点'), mkTa('kufu', '例: 〜を関数にまとめ, 〜が読みやすいようにした')),
      h('div', h('label', '感想'), mkTa('kanso', '例: 〜が分かった / 〜で苦労した')));

    const el = h('article.task#task-' + t.id,
      h('div.task-head', h('div', h('div.tn', '課題 ' + t.label), h('h3', t.title)), h('div', { style: { display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' } }, t.files.map((f) => h('span.chip.val', f)))),
      h('div.task-spec', { html: t.spec }),
      h('div.task-body',
        h('div.task-editor', fileTabs, edHost,
          h('div.task-actions',
            h('button.btn.sm.ptr', { onclick: runTests, title: 'Ctrl+Enter' }, icon('run'), 'テスト実行'),
            h('button.btn.sm', { onclick: trace }, icon('trace'), 'メモリで追う'),
            h('span.sp'),
            h('button.btn.sm.ghost', { onclick: () => { if (confirm('このファイルを初期状態に戻しますか?')) { files[curFile] = t.starter[curFile]; store.del(codeKey(curFile)); switchFile(curFile); } }, title: '初期化' }, icon('reset')),
            h('button.btn.sm.ghost', { onclick: download, title: '.c をダウンロード' }, icon('dl'), '保存'))),
        h('div.task-side',
          h('div.sec', h('h6', h('span', '結果'), null), banner, h('div', { style: { height: '8px' } }), resultHost),
          !t.tests ? h('div.sec', h('h6', '標準入力 (stdin)'), stdinTa) : h('div.sec', h('h6', 'テストデータ'), h('div.c-mute', { style: { fontSize: '12.5px' } }, t.tests.map((x, k) => h('div', { style: { marginBottom: '4px' } }, h('span', 'テスト' + (k + 1) + ': 入力 '), h('code.ic', (x.stdin || '(なし)').trim().replace(/\n/g, ' ⏎ ').slice(0, 60))))), h('div', { style: { marginTop: '8px' } }, h('label.c-mute', { style: { fontSize: '11px' } }, '「メモリで追う」で使う入力'), stdinTa)),
          h('div.sec', h('h6', h('span', 'ヒント'), btnHint), hintList, h('div', { style: { marginTop: '10px' } }, h('button.btn.sm.ghost', { onclick: showAnswer }, icon('eye'), '模範解答')), ansHost))),
      notesEl,
      traceHost);
    if (t.observe) { const lo = store.get('lastout:' + unitId + ':' + t.id, null); if (lo && store.get('lastok:' + unitId + ':' + t.id, false)) obsFacts.innerHTML = t.observe(lo.map((o) => ({ out: o }))); else obsFacts.textContent = '「テスト実行」に成功すると, ここに観察のヒントが表示されます。'; }
    return el;
  }

  /* ================= レポート作成 ================= */
  function reportBox() {
    const U0 = window.UNITS[unitId];
    const prof = store.get('profile', { no: '37025468', name: '庄司 悠人' });
    const inNo = h('input', { value: prof.no, size: 12 });
    const inName = h('input', { value: prof.name, size: 14 });
    const d = new Date();
    const inDate = h('input', { value: d.getFullYear() + '年' + String(d.getMonth() + 1).padStart(2, '0') + '月' + String(d.getDate()).padStart(2, '0') + '日', size: 16 });
    const inclOpt = h('input', { type: 'checkbox', checked: true });
    const pre = h('pre.report-pre');
    const status = h('div.c-mute', { style: { fontSize: '12.5px', padding: '0 22px 14px' } });
    function gen() {
      store.set('profile', { no: inNo.value, name: inName.value });
      const SEP = '----------------------------------------';
      const L = ['プログラミング実習III', '課題: ' + unitId.toUpperCase(), '番号: ' + inNo.value, '氏名: ' + inName.value, '作成: ' + inDate.value, '', SEP];
      let missing = [];
      U0.tasks.forEach((t) => {
        if (t.optional && !inclOpt.checked) return;
        const p = prog.get(unitId).tasks[t.id];
        if (t.optional && p !== 'done') return;
        const notes = store.get('notes:' + unitId + ':' + t.id, {});
        const outs = store.get('lastout:' + unitId + ':' + t.id, null);
        const ok = store.get('lastok:' + unitId + ':' + t.id, false);
        if (!ok) missing.push(t.label);
        L.push('', '[' + t.reportTitle + ']', '', t.summary, '');
        L.push('実行結果:');
        if (outs && outs.length) {
          outs.forEach((o, k) => {
            if (outs.length > 1 && t.tests && t.tests[k] && t.tests[k].label) L.push('(' + (k + 1) + ') ' + t.tests[k].label);
            const lines = (o || '').replace(/\r/g, '').replace(/\n$/, '').split('\n');
            const cut = lines.length > 30 ? lines.slice(0, 24).concat(['  …(以下略)']) : lines;
            cut.forEach((l) => L.push('  ' + l));
          });
        } else L.push('  (未実行 — 課題ラボで「テスト実行」してください)');
        L.push('');
        if (t.tests && t.tests.some((x) => x.expect !== undefined)) L.push(ok ? 'diff は何も表示せず、期待値と一致した。' : '※ 期待値と一致していない (要確認)');
        if (notes.obs) L.push('', (t.obsTitle || '考察') + ':', notes.obs.trim());
        L.push('', '工夫した点:', (notes.kufu || '(未記入)').trim(), '', '感想:', (notes.kanso || '(未記入)').trim(), SEP);
      });
      pre.textContent = L.join('\n');
      status.innerHTML = missing.length ? '⚠ 未完了の課題: <b class="c-addr">' + missing.join(', ') + '</b> — 課題ラボでテストを通すと実行結果が入ります。' : '✓ すべての課題の実行結果が揃っています。';
      return L.join('\r\n');
    }
    const el = h('div.report-box',
      h('div.report-cfg',
        h('label', '番号', inNo), h('label', '氏名', inName), h('label', '作成日', inDate),
        h('label', { style: { display: 'flex', alignItems: 'center', gap: '6px', paddingBottom: '8px' } }, inclOpt, 'オプション課題 (完了分) を含める'),
        h('span', { style: { flex: 1 } }),
        h('button.btn.sm', { onclick: gen }, icon('reset'), '再生成'),
        h('button.btn.sm', { onclick: () => { const t = gen(); navigator.clipboard.writeText(t).then(() => toast('コピーしました')); } }, icon('copy'), 'コピー'),
        h('button.btn.sm.pri', { onclick: () => { const t = gen(); const a = h('a', { href: URL.createObjectURL(new Blob([t], { type: 'text/plain' })), download: unitId.toUpperCase() + '.txt' }); document.body.appendChild(a); a.click(); a.remove(); toast(unitId.toUpperCase() + '.txt をダウンロード'); } }, icon('dl'), unitId.toUpperCase() + '.txt')),
      status, pre);
    [inNo, inName, inDate].forEach((x) => x.addEventListener('input', gen));
    inclOpt.addEventListener('change', gen);
    const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) gen(); });
    io.observe(el);
    return el;
  }

  /* ---------------- 起動 ---------------- */
  if (page === 'home') renderHome(); else renderUnit();
})();
