/* =========================================================================
 *  B7 ソーティング — 直感から本質へ導くインタラクティブ・ビジュアルラボ
 *   0. essenceMap    : 30秒で掴む B7 の本質マップ (選択 / 挿入 / クイック / 型とバケツ)
 *   1. sortDuel      : 単純選択法 vs 単純挿入法 ステップ対決 (なぜ正順だけ O(n) になるのか?)
 *   2. partitionLab  : クイックソート分割 & 再帰シミュレータ (l, r, p と &a[l] の本質)
 *   3. typeMorph     : double ソートを 3 か所変えるだけで文字列・構造体ソートに変身!
 *   4. benchExplorer : O(n²) vs O(n log n) vs O(n) 実測タイム・エクスプローラ (-O0 / -O2)
 * ========================================================================= */
(function () {
  'use strict';
  const { h, codeBlock, icon } = U;
  const D = window.B7_DATA || { timing: {} };

  /* -----------------------------------------------------------------------
   * 0. 30 秒で掴む「直感 → 本質」マップ (4 枚)
   * ----------------------------------------------------------------------- */
  function essenceMap() {
    const cards = [
      {
        tag: 'ESSENCE 01 · 単純選択法',
        color: 'var(--pink)',
        intuition: '未整列の中から「一番小さい人」を探して左端と席替え',
        why: '残り全員を必ず最後まで見回してから 1 回だけ交換する。だから最初から整列していても逆順でも「見る回数 n(n-1)/2」は一切変わらない。',
        essence: '最小値の「値」ではなく「添字 min」を覚えて k 番目と交換する。',
        code: 'for (k = 0; k <= n - 2; k++) {\n  min = k;\n  for (i = k + 1; i < n; i++)\n    if (a[i] < a[min]) min = i;\n  /* a[k] と a[min] を交換 */\n}',
        jump: '#selection',
      },
      {
        tag: 'ESSENCE 02 · 単純挿入法',
        color: 'var(--mint)',
        intuition: 'トランプの手札 (左側の整列済み) の正しい隙間へ右から滑り込ませる',
        why: '左隣が自分以下 (a[i-1] <= a[i]) なら「もうこれ以上左は全部自分以下!」と確定するので即 break できる。正順データなら毎回 1 回の比較で止まり O(n) になる。',
        essence: 'i = k から 1 まで左へ比較し、a[i-1] <= a[i] で即 break する。',
        code: 'for (k = 1; k <= n - 1; k++) {\n  for (i = k; 1 <= i; i--) {\n    if (a[i-1] <= a[i]) break;\n    /* a[i] と a[i-1] を交換 */\n  }\n}',
        jump: '#insertion',
      },
      {
        tag: 'ESSENCE 03 · クイックソート',
        color: 'var(--sky)',
        intuition: '基準 p 以下の前半組・以上の後半組に分け、各組に同じ号令をかける',
        why: '半分に分けると 1 人の相手数が半分になる。深さ約 log₂n 段 × 各段の走査 n 回 = O(n log n)。ただし p=a[0] 固定だと正順・逆順で 1 対 n-1 に偏り O(n²) に落ちる。',
        essence: 'l と r を両端から寄せ、sort(r+1, a) と sort(n-l, &a[l]) で再帰。',
        code: 'while (l <= r) {\n  while (a[l] < p) l++;\n  while (a[r] > p) r--;\n  if (l <= r) { swap(a[l], a[r]); l++; r--; }\n}\nif (0 < r) sort(r + 1, a);\nif (l < n - 1) sort(n - l, &a[l]);',
        jump: '#quick',
      },
      {
        tag: 'ESSENCE 04 · 文字列・構造体・バケツ',
        color: 'var(--lemon)',
        intuition: 'ソートの「骨格」はそのまま、「比べ方」と「移し方」の部品だけ差し替える',
        why: '文字列なら strcmp と strcpy、構造体なら a[i].age の比較と構造体丸ごと代入 (=)。さらに値の分布範囲がわかっていればバケツに振り分けて O(n) の壁も突破できる。',
        essence: '文字列は strcmp/strcpy、構造体は丸ごと = 代入と複合条件式。',
        code: '/* 文字列: */ if (strcmp(a[i], a[min]) < 0) ...\n/* 構造体: */ if (a[i].age < a[min].age ||\n  (a[i].age == a[min].age && a[i].stature < a[min].stature))',
        jump: '#records',
      },
    ];

    let active = 0;
    const detail = h('div.b6-ess-detail');
    const tabs = h('div.b6-ess-grid');

    function renderDetail() {
      const c = cards[active];
      [...tabs.children].forEach((el, k) => el.classList.toggle('on', k === active));
      detail.innerHTML = '';
      detail.style.setProperty('--ec', c.color);
      detail.append(
        h('div.b6-ess-flow',
          h('div.b6-ess-step',
            h('span.b6-ess-pill', '1. 直感イメージ'),
            h('div.b6-ess-big', c.intuition),
            h('p', c.why)),
          h('div.b6-ess-arr', '⇒'),
          h('div.b6-ess-step.core',
            h('span.b6-ess-pill.ptr', '2. 本質 (C の骨格コード)'),
            h('div.b6-ess-big', c.essence),
            codeBlock(c.code),
            h('div', { style: { marginTop: '10px', textAlign: 'right' } },
              h('a.btn.sm.ptr', { href: c.jump }, 'この章で動かして確かめる', icon('arrow'))))
        )
      );
    }

    cards.forEach((c, k) => {
      tabs.appendChild(h('button.b6-ess-card' + (k === 0 ? '.on' : ''), {
        type: 'button',
        style: { '--ec': c.color },
        onclick: () => { active = k; renderDetail(); },
      },
      h('span.b6-ess-tag', c.tag),
      h('b', c.intuition),
      h('small', '→ ' + c.essence)));
    });

    renderDetail();
    return h('div.b6-ess',
      h('div.b6-ess-head',
        h('div',
          h('span.chip.ptr', 'FAST TRACK'),
          h('b.b6-wtitle', '読む前に 30 秒 — B7 ソート 4 大テーマの「直感 ⇒ 本質」マップ')),
        h('span.c-mute', { style: { fontSize: '12.5px' } }, 'カードを押すと「直感 → C の骨格」が切り替わります')),
      tabs,
      detail);
  }

  /* -----------------------------------------------------------------------
   * 1. 単純選択法 vs 単純挿入法 同時ステップ対決!
   *    スライドの例 [6, 2, 4, 9, 8] / 正順 [1, 2, 4, 6, 9] / 逆順 [9, 8, 6, 4, 2]
   * ----------------------------------------------------------------------- */
  function sortDuel() {
    const PRESETS = {
      slide: { name: 'スライドの例 [6, 2, 4, 9, 8]', arr: [6, 2, 4, 9, 8] },
      sorted: { name: '正順 [1, 2, 4, 6, 9] (差が歴然!)', arr: [1, 2, 4, 6, 9] },
      reverse: { name: '逆順 [9, 8, 6, 4, 2]', arr: [9, 8, 6, 4, 2] },
    };
    let pkey = 'slide';
    let selSteps = [], insSteps = [], si = 0, timer = null;

    const selHost = h('div.b7-bars');
    const insHost = h('div.b7-bars');
    const selStat = h('div.b7-stat');
    const insStat = h('div.b7-stat');
    const cap = h('div.b6-va-msg');

    function genSelection(src) {
      const a = src.slice(), n = a.length, out = [];
      let cmp = 0, swp = 0;
      out.push({ a: a.slice(), sorted: 0, hi: [], min: -1, cmp, swp, note: '開始前' });
      for (let k = 0; k <= n - 2; k++) {
        let min = k;
        for (let i = k + 1; i < n; i++) {
          cmp++;
          if (a[i] < a[min]) min = i;
          out.push({ a: a.slice(), sorted: k, hi: [k, i], min, cmp, swp, note: `k=${k}: a[${i}]=${a[i]} と暫定最小 a[${min}]=${a[min]} を比較` });
        }
        const t = a[k]; a[k] = a[min]; a[min] = t; swp++;
        out.push({ a: a.slice(), sorted: k + 1, hi: [k, min], min: k, cmp, swp, swapped: true, note: `swapmin: a[${k}] と最小値 a[${min}] を交換 → 左 ${k + 1} 個確定!` });
      }
      out.push({ a: a.slice(), sorted: n, hi: [], min: -1, cmp, swp, done: true, note: `完了! 比較 ${cmp} 回・交換 ${swp} 回` });
      return out;
    }

    function genInsertion(src) {
      const a = src.slice(), n = a.length, out = [];
      let cmp = 0, swp = 0;
      out.push({ a: a.slice(), sorted: 1, hi: [], cmp, swp, note: '開始前 (先頭 a[0] の 1 個は整列済みとみなす)' });
      for (let k = 1; k <= n - 1; k++) {
        for (let i = k; 1 <= i; i--) {
          cmp++;
          if (a[i - 1] <= a[i]) {
            out.push({ a: a.slice(), sorted: k + 1, hi: [i - 1, i], cmp, swp, stopped: true, note: `k=${k}: a[${i - 1}]=${a[i - 1]} <= a[${i}]=${a[i]} → ここでピタッと break!` });
            break;
          }
          const t = a[i]; a[i] = a[i - 1]; a[i - 1] = t; swp++;
          out.push({ a: a.slice(), sorted: k + 1, hi: [i - 1, i], cmp, swp, swapped: true, note: `k=${k}: a[${i - 1}] > a[${i}] なので左と交換して滑り込ませる` });
        }
      }
      out.push({ a: a.slice(), sorted: n, hi: [], cmp, swp, done: true, note: `完了! 比較 ${cmp} 回・交換 ${swp} 回` });
      return out;
    }

    function renderLane(host, statEl, st, kind) {
      host.innerHTML = '';
      const mx = Math.max(...st.a, 9);
      st.a.forEach((v, idx) => {
        const isDone = st.done || idx < st.sorted;
        const isHi = st.hi.includes(idx);
        const isMin = kind === 'sel' && st.min === idx && !st.done;
        const cls = [
          isDone ? 'sorted' : '',
          isHi ? 'hi' : '',
          isMin ? 'min' : '',
          st.swapped && isHi ? 'swp' : '',
        ].filter(Boolean).join('.');
        host.appendChild(h('div.b7-bar' + (cls ? '.' + cls : ''),
          h('div.b7-bar-col', { style: { height: Math.max(22, Math.round((v / mx) * 86)) + 'px' } }, h('b', String(v))),
          h('small', '[' + idx + ']')));
      });
      statEl.innerHTML =
        `<span class="b6-va-badge">比較 <b>${st.cmp}</b> 回</span> ` +
        `<span class="b6-va-badge ${st.done ? 'ok' : ''}">交換 <b>${st.swp}</b> 回</span>` +
        `<div class="b7-note">${st.note}</div>`;
    }

    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
      playBtn.textContent = '▶ 同時再生';
    }

    function paint() {
      const sSt = selSteps[Math.min(si, selSteps.length - 1)];
      const iSt = insSteps[Math.min(si, insSteps.length - 1)];
      renderLane(selHost, selStat, sSt, 'sel');
      renderLane(insHost, insStat, iSt, 'ins');
      const maxLen = Math.max(selSteps.length, insSteps.length) - 1;
      if (si >= maxLen) {
        stop();
        const sEnd = selSteps[selSteps.length - 1], iEnd = insSteps[insSteps.length - 1];
        cap.innerHTML = `<b>対決結果 (${PRESETS[pkey].name}):</b> 単純選択法は比較 <b>${sEnd.cmp} 回</b>, 単純挿入法は比較 <b>${iEnd.cmp} 回</b>! ` +
          (pkey === 'sorted'
            ? '正順では単純挿入法が<b>毎回 1 回の比較で break する (合計 n−1 回 = O(n))</b> のに対し、単純選択法は律儀に全部見回すので n(n−1)/2 回かかります!'
            : pkey === 'reverse'
              ? '逆順では単純挿入法も毎回先頭まで交換し続けるため、比較・交換ともに最大 (O(n²)) になります。'
              : '「正順 [1, 2, 4, 6, 9]」タブに切り替えて再生すると、課題 7-5 の考察の核心が一瞬で見えます!');
      } else {
        cap.innerHTML = `ステップ <b>${si} / ${maxLen}</b> — 緑はソート済み領域、黄色は比較中、ピンク枠は暫定最小値 <code class="ic">min</code> です。`;
      }
    }

    function build() {
      stop();
      si = 0;
      const base = PRESETS[pkey].arr;
      selSteps = genSelection(base);
      insSteps = genInsertion(base);
      [...preTabs.children].forEach((b) => b.classList.toggle('on', b.dataset.k === pkey));
      paint();
    }

    function stepOnce() {
      const maxLen = Math.max(selSteps.length, insSteps.length) - 1;
      if (si >= maxLen) si = 0;
      else si++;
      paint();
    }

    const playBtn = h('button.btn.sm.ptr', {
      type: 'button',
      onclick: () => {
        if (timer) { stop(); return; }
        const maxLen = Math.max(selSteps.length, insSteps.length) - 1;
        if (si >= maxLen) si = 0;
        playBtn.textContent = '❚❚ 一時停止';
        paint();
        timer = setInterval(() => {
          if (si >= maxLen) { stop(); return; }
          si++;
          paint();
        }, 520);
      },
    }, '▶ 同時再生');

    const preTabs = h('div.tabs', Object.entries(PRESETS).map(([k, v]) =>
      h('button', { type: 'button', 'data-k': k, onclick: () => { pkey = k; build(); } }, v.name)
    ));

    const el = h('div.b6-wid',
      h('div.b6-wid-head',
        h('div.b6-wid-t', h('span.chip.ptr', 'DUEL'), h('b', '単純選択法 vs 単純挿入法 — 同じ配列を同時に並べて仕事量を比較!')),
        h('div.b6-wid-ctl', playBtn, h('button.btn.sm', { type: 'button', onclick: () => { stop(); stepOnce(); } }, '1 ステップ'), h('button.btn.sm.ghost', { type: 'button', onclick: build }, 'リセット'))),
      h('div', { style: { marginBottom: '12px' } }, preTabs),
      h('div.b7-duel-grid',
        h('div.b7-duel-card', h('div.b7-duel-h', h('b', '単純選択法 (selection_sort.c)'), h('small', '最小値を選んで左端と交換')), selHost, selStat),
        h('div.b7-duel-card', h('div.b7-duel-h', h('b', '単純挿入法 (insertion_sort.c)'), h('small', '整列済み領域へ右から滑り込ませる')), insHost, insStat)),
      cap);
    build();
    return el;
  }

  /* -----------------------------------------------------------------------
   * 2. クイックソート 1 回の分割 (partition) & 再帰引数シミュレータ
   *    なぜ sort(r+1, a) と sort(n-l, &a[l]) になるのかを一目で!
   * ----------------------------------------------------------------------- */
  function partitionLab() {
    const CASES = [
      { name: '標準 [5, 8, 2, 9, 1, 7, 3]', arr: [5, 8, 2, 9, 1, 7, 3] },
      { name: '重複あり [4, 6, 4, 1, 4, 2]', arr: [4, 6, 4, 1, 4, 2] },
      { name: '正順 [1, 2, 3, 4, 5, 6] (偏る例!)', arr: [1, 2, 3, 4, 5, 6] },
    ];
    let ci = 0, steps = [], si = 0;

    const cellsEl = h('div.b7-pt-cells');
    const recEl = h('div.b7-pt-rec');
    const msgEl = h('div.b6-sp-exp');

    function genPartition(src) {
      const a = src.slice(), n = a.length, p = a[0];
      let l = 0, r = n - 1;
      const out = [];
      out.push({ a: a.slice(), l, r, p, phase: 'init', msg: `開始: 基準値 <b>p = a[0] = ${p}</b>。左端 <code class="ic">l = 0</code>, 右端 <code class="ic">r = ${n - 1}</code> から中央へ寄せます。` });
      while (l <= r) {
        while (a[l] < p) {
          l++;
          out.push({ a: a.slice(), l, r, p, phase: 'scanL', msg: `左を進める: <code class="ic">a[l] &lt; ${p}</code> の間 <code class="ic">l++</code> → l = ${l} (a[${l}] = ${a[l]} でストップ)` });
        }
        while (a[r] > p) {
          r--;
          out.push({ a: a.slice(), l, r, p, phase: 'scanR', msg: `右を戻す: <code class="ic">a[r] &gt; ${p}</code> の間 <code class="ic">r--</code> → r = ${r} (a[${r}] = ${a[r]} でストップ)` });
        }
        if (l <= r) {
          const vl = a[l], vr = a[r];
          const t = a[l]; a[l] = a[r]; a[r] = t;
          const ol = l, or = r;
          l++; r--;
          out.push({ a: a.slice(), l, r, p, swapped: [ol, or], phase: 'swap', msg: `<code class="ic">l <= r</code> (${ol} <= ${or}) なので <b>a[${ol}]=${vl} と a[${or}]=${vr} を交換</b>し, <code class="ic">l++, r--</code> → l=${l}, r=${r}` });
        }
      }
      out.push({
        a: a.slice(), l, r, p, phase: 'done',
        msg: `<b>分割完了!</b> <code class="ic">l (${l}) &gt; r (${r})</code> ですれ違いました。<br>` +
             `前半 <b>a[0]〜a[${r}]</b> (<b>r + 1 = ${r + 1} 個</b>) はすべて ${p} 以下、後半 <b>a[${l}]〜a[${n - 1}]</b> (<b>n - l = ${n - l} 個</b>, 先頭アドレス <b>&amp;a[${l}]</b>) はすべて ${p} 以上です!`,
      });
      return out;
    }

    function paint() {
      const st = steps[si];
      const n = st.a.length;
      cellsEl.innerHTML = '';
      st.a.forEach((v, idx) => {
        const isL = idx === st.l, isR = idx === st.r;
        const isSw = st.swapped && st.swapped.includes(idx);
        const inLeft = st.phase === 'done' && idx <= st.r;
        const inRight = st.phase === 'done' && idx >= st.l;
        const cls = [
          isSw ? 'swp' : '',
          inLeft ? 'left-part' : '',
          inRight ? 'right-part' : '',
        ].filter(Boolean).join('.');
        cellsEl.appendChild(h('div.b7-pt-cell' + (cls ? '.' + cls : ''),
          h('div.b7-pt-ptr',
            isL ? h('span.b6-tag-p', 'l=' + st.l) : null,
            isR ? h('span.b6-tag-nx', 'r=' + st.r) : null),
          h('small', 'a[' + idx + ']'),
          h('b', String(v)),
          h('span.b7-pt-rel', v < st.p ? '< p' : v > st.p ? '> p' : '== p')));
      });

      recEl.innerHTML = '';
      if (st.phase === 'done') {
        const c1 = 0 < st.r ? `sort(${st.r + 1}, a);   /* a[0]〜a[${st.r}] の ${st.r + 1} 個 */` : `/* 0 < r (${st.r}) ではないので前半の再帰なし (1個以下) */`;
        const c2 = st.l < n - 1 ? `sort(${n - st.l}, &a[${st.l}]); /* a[${st.l}]〜a[${n - 1}] の ${n - st.l} 個 */` : `/* l (${st.l}) < n-1 ではないので後半の再帰なし */`;
        recEl.appendChild(codeBlock('/* 次に呼ばれる 2 つの再帰呼び出し (課題 7-6 の核心!) */\n' + c1 + '\n' + c2));
      }

      msgEl.className = 'b6-sp-exp' + (st.phase === 'done' ? ' ok' : '');
      msgEl.innerHTML = st.msg;
    }

    function build(k) {
      ci = k;
      steps = genPartition(CASES[ci].arr);
      si = 0;
      [...cTabs.children].forEach((b, j) => b.classList.toggle('on', j === ci));
      paint();
    }

    const cTabs = h('div.tabs', CASES.map((c, k) =>
      h('button', { type: 'button', onclick: () => build(k) }, c.name)
    ));

    const el = h('div.b6-wid',
      h('div.b6-wid-head',
        h('div.b6-wid-t', h('span.chip.val', 'PARTITION'), h('b', 'クイックソートの分割シミュレータ — なぜ sort(r+1, a) と sort(n-l, &a[l]) なのか?')),
        h('div.b6-wid-ctl',
          h('button.btn.sm', { type: 'button', onclick: () => { si = Math.max(0, si - 1); paint(); } }, '← 戻る'),
          h('button.btn.sm.ptr', { type: 'button', onclick: () => { si = (si + 1) % steps.length; paint(); } }, '次へ進める →'),
          h('button.btn.sm.ghost', { type: 'button', onclick: () => { si = steps.length - 1; paint(); } }, '分割完了へ'))),
      h('div', { style: { marginBottom: '12px' } }, cTabs),
      cellsEl,
      msgEl,
      recEl);
    build(0);
    return el;
  }

  /* -----------------------------------------------------------------------
   * 3. 型の差し替えトランスフォーマー (double → 文字列 → 構造体 record_t)
   *    課題 7-2, 7-7, 7-8 が「実は同じ 1 つのコード」であることを一目で理解
   * ----------------------------------------------------------------------- */
  function typeMorph() {
    const MODES = [
      {
        id: 'dbl',
        label: '① 数値 double (課題 7-2)',
        diff: '基本の骨格。比較は <, 交換は double tmp に = で代入。',
        hl: [1, 3, 7, 10, 11, 12],
        code:
`void sort(int n, double *a)
{
  int k, i, min;
  double tmp;                         /* ① 一時変数の型 */
  for (k = 0; k <= n - 2; k++) {
    min = k;
    for (i = k + 1; i < n; i++) {
      if (a[i] < a[min]) {            /* ② 「a[i] の方が前」の条件 */
        min = i;
      }
    }
    tmp = a[k];                       /* ③ 3 手の交換 */
    a[k] = a[min];
    a[min] = tmp;
  }
}`,
      },
      {
        id: 'str',
        label: '② 文字列 char (*a)[64] (課題 7-7)',
        diff: '文字配列は = も < も使えない! ① char 配列 tmp ② strcmp(…) < 0 ③ strcpy 3 連発に差し替えるだけ。',
        hl: [1, 4, 8, 12, 13, 14],
        code:
`void string_sort(int n, char (*a)[STRLEN+1])
{
  int k, i, min;
  char tmp[STRLEN+1];                 /* ① 文字配列にする */
  for (k = 0; k <= n - 2; k++) {
    min = k;
    for (i = k + 1; i < n; i++) {
      if (strcmp(a[i], a[min]) < 0) { /* ② 辞書順で前なら負! */
        min = i;
      }
    }
    strcpy(tmp, a[k]);                /* ③ 文字列は strcpy で移す */
    strcpy(a[k], a[min]);
    strcpy(a[min], tmp);
  }
}`,
      },
      {
        id: 'rec',
        label: '③ 構造体 record_t (課題 7-8)',
        diff: '構造体は中に文字配列 name を持っていても = で丸ごとコピーできる! 変えるのは ① record_t tmp と ② 年齢→身長の 2 段階比較だけ。',
        hl: [1, 4, 8, 9, 13, 14, 15],
        code:
`void str_sort(int n, record_t *a)
{
  int k, i, min;
  record_t tmp;                       /* ① 構造体変数にする */
  for (k = 0; k <= n - 2; k++) {
    min = k;
    for (i = k + 1; i < n; i++) {
      if (a[i].age < a[min].age ||    /* ② 第1キー: age 昇順 */
         (a[i].age == a[min].age && a[i].stature < a[min].stature)) {
        min = i;                      /*    第2キー: stature 昇順 */
      }
    }
    tmp = a[k];                       /* ③ 構造体は = で丸ごと代入可! */
    a[k] = a[min];
    a[min] = tmp;
  }
}`,
      },
    ];

    let cur = 0;
    const codeHost = h('div');
    const noteHost = h('div.b6-sp-exp.ok');
    const tabs = h('div.tabs', MODES.map((m, k) =>
      h('button', { type: 'button', onclick: () => { cur = k; paint(); } }, m.label)
    ));

    function paint() {
      const m = MODES[cur];
      [...tabs.children].forEach((b, k) => b.classList.toggle('on', k === cur));
      codeHost.innerHTML = '';
      codeHost.appendChild(codeBlock(m.code, { hl: m.hl }));
      noteHost.innerHTML = '<b>どこが変わった?</b> — ' + m.diff;
    }

    paint();
    return h('div.b6-wid',
      h('div.b6-wid-head',
        h('div.b6-wid-t', h('span.chip.ptr', 'MORPH'), h('b', '3 か所差し替えるだけ! 数値 → 文字列 → 構造体ソート変身ビューア')),
        tabs),
      codeHost,
      noteHost);
  }

  /* -----------------------------------------------------------------------
   * 4. 実測ベンチマーク・エクスプローラ (課題 7-5, 7-6, Opt-1, Opt-2 対応)
   * ----------------------------------------------------------------------- */
  function benchExplorer() {
    let dataKind = 0; // 0: 乱数, 1: 正順, 2: 逆順
    const n = 32768;
    const tm = D.timing || {};
    const body = h('div.b6-rc-body');
    const note = h('div.b6-rc-sum');

    const KINDS = ['乱数データ (標準)', '正順データ (0, 1, 2, …)', '逆順データ (n, n-1, …)'];

    function getSec(key) {
      const row = (tm[key] || {})[n];
      return row ? row[dataKind] : 0;
    }

    function paint() {
      [...kTabs.children].forEach((b, k) => b.classList.toggle('on', k === dataKind));
      const rows = [
        { name: '単純選択法 (-O0 最適化なし)', tag: 'O(n²)', v: getSec('sel_O0'), col: 'var(--peach)' },
        { name: '単純選択法 (-O2 最適化あり)', tag: 'O(n²)', v: getSec('sel_O2'), col: 'var(--pink)' },
        { name: '単純挿入法 (-O2 最適化あり)', tag: dataKind === 1 ? 'O(n) !' : 'O(n²)', v: getSec('ins_O2'), col: 'var(--mint)' },
        { name: 'クイックソート (-O2, p=a[0])', tag: dataKind === 0 ? 'O(n log n)' : 'O(n²) 偏り!', v: getSec('quick_O2'), col: 'var(--sky)' },
        { name: 'バケツ法 / 頻度法 (-O2, Opt)', tag: 'O(n)', v: getSec('dc_O2'), col: 'var(--lav)' },
      ];
      const mx = Math.max(...rows.map((r) => r.v), 0.01);
      body.innerHTML = '';
      rows.forEach((r) => {
        const pct = Math.max(0.8, Math.min(100, (r.v / mx) * 100));
        body.appendChild(h('div.b6-rc-row',
          h('div.b6-rc-lbl', h('b', r.name), ' ', h('span.b6-rc-tag', r.tag)),
          h('div.b6-rc-track', h('div.b6-rc-fill', { style: { width: pct + '%', background: r.col } })),
          h('div.b6-rc-num', h('b', (r.v * 1000).toFixed(r.v < 0.005 ? 2 : 0) + ' ms'), h('small', r.v.toFixed(5) + ' sec'))));
      });

      if (dataKind === 0) {
        note.innerHTML = '<b>乱数 (n = 32,768) の本質:</b> <code class="ic">-O2</code> 最適化で機械語が約 3.5 倍高速化。それでも O(n²) の単純法は 0.5〜1.7 秒かかるのに対し、<b>クイックソートは約 8 ミリ秒 (200 倍高速!)</b>、頻度法は約 1 ミリ秒で終わります。';
      } else if (dataKind === 1) {
        note.innerHTML = '<b>正順 (n = 32,768) の逆転劇!</b> <b>単純挿入法が 0.04 ミリ秒 (O(n)) で最速</b>に躍り出ます! 一方、先頭 <code class="ic">p = a[0]</code> を基準にするクイックソートは毎回「1 個と n−1 個」にしか割れず、<b>275 ミリ秒 (O(n²)) に転落</b>します。';
      } else {
        note.innerHTML = '<b>逆順 (n = 32,768) の試練:</b> 単純挿入法は毎回先頭まで全交換するため乱数の約 2 倍 (3,259 ms) かかり、クイックソートも分割が偏って遅くなります。一方、単純選択法はどんな並びでも約 540 ms で一定、バケツ法/頻度法は一様分布なので 1 ms で完了します。';
      }
    }

    const kTabs = h('div.tabs', KINDS.map((lb, k) =>
      h('button', { type: 'button', onclick: () => { dataKind = k; paint(); } }, lb)
    ));

    const el = h('div.b6-wid',
      h('div.b6-wid-head',
        h('div.b6-wid-t', h('span.chip.addr', 'REAL GCC DATA'), h('b', 'n = 32,768 実測! 初期データと -O2 で順位がどう入れ替わるか?')),
        kTabs),
      body,
      note);
    paint();
    return el;
  }

  window.B7_CODE = { essenceMap, sortDuel, partitionLab, typeMorph, benchExplorer };
})();
