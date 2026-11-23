/* =========================================================================
 *  T2 中間試験対策 — 章コンテンツ
 *  出典: 「2026 年度 プログラミング実習 III 中間試験 T2 について」(T2-yokoku.pdf)
 * ========================================================================= */
(function () {
  'use strict';
  const { h, icon, store, toast, codeBlock } = U;
  const R = String.raw;
  const D = window.T2_DATA || { files: {}, tests: {}, sample: {} };
  const S = D.sample || {};
  const SAMPLE = D.files['sample.c'] || '';

  /* ---------- シェルドリル用ファイル (malloc + 二分探索バグ修正ドリル) ---------- */
  const DRILL = {
    h: R`#define MAX_N 32

typedef struct {
  int n;
  int id[MAX_N];
} db_t;

int db_find(db_t *db, int key);
`,
    main: R`#include <stdio.h>
#include "dbfind.h"

int main(void)
{
  db_t db;
  int i, q;
  if (scanf("%d", &db.n) == EOF) { return 0; }
  for (i = 0; i < db.n; i++) { scanf("%d", &db.id[i]); }
  while (scanf("%d", &q) != EOF) {
    printf("%d -> %d\n", q, db_find(&db, q));
  }
  return 0;
}
`,
    bug: R`#include "dbfind.h"

int db_find(db_t *db, int key)
{
  int low = 0, high = db->n - 1, mid;
  /* バグ: low < high だと最後の 1 個を調べずに抜けてしまう! */
  while (low < high) {
    mid = (low + high) / 2;
    if (db->id[mid] == key) { return mid; }
    else if (db->id[mid] < key) { low = mid + 1; }
    else { high = mid - 1; }
  }
  return -1;
}
`,
    in: '5\n10 20 30 40 50\n30 10 50 25\n',
    exp: '30 -> 2\n10 -> 0\n50 -> 4\n25 -> -1\n',
  };

  /* ---------- 0. 30 秒で掴む T2 4 大テーマの「直感 ⇒ 本質」マップ ---------- */
  function essenceMap() {
    const cards = [
      {
        tag: 'TYPE A · 課題 (5-1)(5-3)',
        color: 'var(--sky)',
        intuition: '必要な個数ぴったりの箱をヒープに借りて、先頭の番地を返す',
        why: 'T2 では malloc の書き方が厳格採点! 「8 * n」のように数値を直書きしたり、文字列の末尾 \'\\0\' (+1) を忘れたり、余分なサイズを確保すると出力が合っていても 0 点になる。',
        essence: 'malloc(sizeof(型) * 個数) + NULL 検査 + 文字列は strlen + 1!',
        code: 'p = malloc(sizeof(double) * n);\nif (p == NULL) {\n  fprintf(stderr, "malloc failed\\n");\n  exit(1);\n}',
        jump: '#strict',
      },
      {
        tag: 'TYPE B · 課題 (6-1)〜(6-5)',
        color: 'var(--peach)',
        intuition: 'ダミー節点 head から「1 歩先 p->next」を覗き見て矢印を掛け替える',
        why: '挿入も削除も「書き換えたい矢印を持っている 1 つ手前の節点 p」で止まる必要がある。削除するときは p->next をつなぎ替えてから外した節点を free する。',
        essence: '読むだけなら head->next から、つなぎ替えるなら head から p->next を先読み!',
        code: 'for (p = head; p->next != NULL; p = p->next) {\n  if (p->next->val == x) {\n    del = p->next; p->next = del->next;\n    free(del); return;\n  }\n  if (p->next->val > x) break;\n}\np->next = new_node(x, p->next);',
        jump: '#review4',
      },
      {
        tag: 'TYPE C · 課題 (7-2)(7-4)',
        color: 'var(--mint)',
        intuition: '選択法は「最小の添字 min を探して交換」、挿入法は「左へ滑らせて <= で break」',
        why: 'どちらも 2 重ループ 10 行強で書ける。構造体の配列なら比較条件だけメンバー比較に変え、交換は構造体変数 tmp に = で丸ごと代入できる。文字列配列なら strcmp と strcpy。',
        essence: '選択法 (k=0..n-2) と挿入法 (k=1..n-1) の両方を何も見ずに書けるようにする!',
        code: '/* 単純挿入法 (7-4) */\nfor (k = 1; k <= n - 1; k++) {\n  for (i = k; 1 <= i; i--) {\n    if (a[i-1] <= a[i]) break;\n    tmp = a[i]; a[i] = a[i-1]; a[i-1] = tmp;\n  }\n}',
        jump: '#review4',
      },
      {
        tag: 'TYPE D · 課題 (8-4) 二分探索',
        color: 'var(--pink)',
        intuition: '整列済みの db_t の真ん中 mid を見て、毎回候補を半分にバッサリ捨てる',
        why: 'T2 予告で「実行結果が正しくても二分探索ができていない (線形探索等) 場合は 0 点」と明記! n=100 万件でも最大 20 回で見つかる O(log n) の骨格を完璧にする。',
        essence: 'low = 0, high = db->n - 1, while (low <= high) で mid = (low + high) / 2!',
        code: 'low = 0; high = db->n - 1;\nwhile (low <= high) {\n  mid = (low + high) / 2;\n  if (db->entry[mid].id == key) return mid;\n  else if (db->entry[mid].id < key) low = mid + 1;\n  else high = mid - 1;\n}\nreturn -1;',
        jump: '#bsearch',
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
            h('span.b6-ess-pill', '1. 直感と T2 採点の急所'),
            h('div.b6-ess-big', c.intuition),
            h('p', c.why)),
          h('div.b6-ess-arr', '⇒'),
          h('div.b6-ess-step.core',
            h('span.b6-ess-pill.ptr', '2. 本番で書く C の骨格'),
            h('div.b6-ess-big', c.essence),
            codeBlock(c.code),
            h('div', { style: { marginTop: '10px', textAlign: 'right' } },
              h('a.btn.sm.ptr', { href: c.jump }, '詳しく確認する', icon('arrow'))))
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
          h('span.chip.ptr', 'T2 ROADMAP'),
          h('b.b6-wtitle', '予告 PDF が名指しした 4 大出題テーマ (B5・B6・B7・B8) の全体像')),
        h('span.c-mute', { style: { fontSize: '12.5px' } }, 'カードを押すと「採点の急所 → C の骨格」が切り替わります')),
      tabs,
      detail);
  }

  /* ---------- 1. T2 特有の「出力が合っても 0 点」厳格採点シミュレータ ---------- */
  function strictTrapLab() {
    const CASES = [
      {
        title: '① malloc(8 * n) と直書き',
        ok: false,
        code: 'double *b = malloc(8 * n);',
        reason: '✗ <b>0 点 (不正解)</b> — T2 予告に「<code class="ic">sizeof</code> を使わずに直接バイト数を指定した場合には不正解とする」と明記されています。必ず <code class="ic">malloc(sizeof(double) * n)</code> と書こう。',
      },
      {
        title: '② 文字列で malloc(STRLEN + 1) 固定',
        ok: false,
        code: 'char *p = malloc(sizeof(char) * (STRLEN + 1));\nstrcpy(p, s);',
        reason: '✗ <b>0 点の危険大</b> — 課題 (5-3) では文字列の長さに合わせた動的割当てが求められます。「割り当てるバイト数が異なっていたり…」に該当するため、<code class="ic">sizeof(char) * (strlen(s) + 1)</code> でちょうどの長さを確保しよう。',
      },
      {
        title: '③ 文字列で + 1 (\'\\0\' の分) 忘れ',
        ok: false,
        code: 'char *p = malloc(sizeof(char) * strlen(s));\nstrcpy(p, s); /* 1バイトはみ出して破壊! */',
        reason: '✗ <b>0 点 (不正解)</b> — <code class="ic">strlen("Japan")</code> は 5 ですが、末尾の <code class="ic">\'\\0\'</code> まで入れるには <b>6 バイト</b>必要です。',
      },
      {
        title: '④ malloc の正解フォーム',
        ok: true,
        code: 'double *b = malloc(sizeof(double) * n);\nif (b == NULL) {\n  fprintf(stderr, "malloc failed\\n");\n  exit(1);\n}',
        reason: '✓ <b>満点フォーム!</b> — <code class="ic">sizeof(要素の型) * 個数</code> で確保し、当日配布のサンプルプログラムどおり <code class="ic">NULL</code> 検査 + <code class="ic">exit(1)</code> を行っています。',
      },
      {
        title: '⑤ db_t を先頭から for で探す',
        ok: false,
        code: 'for (i = 0; i < db->n; i++) {\n  if (db->entry[i].id == key) return i;\n}\nreturn -1;',
        reason: '✗ <b>0 点 (不正解)</b> — <code class="ic">diff -Bw</code> は完全に一致しますが、T2 予告に「<b>実行結果が正しくても二分探索ができていない (線形探索になっている等) の場合には不正解とする</b>」と明記されています!',
      },
      {
        title: '⑥ 二分探索の正解フォーム',
        ok: true,
        code: 'low = 0; high = db->n - 1;\nwhile (low <= high) {\n  mid = (low + high) / 2;\n  if (db->entry[mid].id == key) return mid;\n  else if (db->entry[mid].id < key) low = mid + 1;\n  else high = mid - 1;\n}\nreturn -1;',
        reason: '✓ <b>満点フォーム!</b> — 毎回中央 <code class="ic">mid</code> と比較して探索区間 <code class="ic">[low, high]</code> を半分に絞り込む正真正銘の O(log n) 二分探索です。',
      },
    ];

    let cur = 0;
    const btns = h('div.bw-btns');
    const codeHost = h('div');
    const resHost = h('div');

    function show(k) {
      cur = k;
      [...btns.children].forEach((b, j) => b.classList.toggle('on', j === cur));
      const c = CASES[cur];
      codeHost.innerHTML = '';
      codeHost.appendChild(codeBlock(c.code));
      resHost.innerHTML = '';
      resHost.appendChild(h('div.t2-strict-box.' + (c.ok ? 'ok' : 'ng'),
        h('h6', c.ok ? '✓ 採点結果: 正解 (5 点)' : '✗ 採点結果: diff が通っても 0 点!'),
        h('div', { style: { fontSize: '13.5px', lineHeight: '1.75' }, html: c.reason })));
    }

    CASES.forEach((c, k) => btns.appendChild(h('button.bw-b', { type: 'button', onclick: () => show(k) }, c.title)));
    show(0);
    return h('div.b6-wid',
      h('div.b6-wid-head',
        h('div.b6-wid-t', h('span.chip.ptr', 'STRICT CHECK'), h('b', 'T2 最大の罠 — 「diff が通ったのに 0 点」になる 4 パターンと満点フォーム'))),
      h('div', { style: { marginBottom: '10px' } }, btns),
      codeHost,
      resHost);
  }

  /* ---------- 2. 課題 (8-4) 先取り! db_t 二分探索インタラクティブ・シミュレータ ---------- */
  function bsearchLab() {
    const DB = [
      { id: 102, name: 'Brazil' },
      { id: 108, name: 'China' },
      { id: 115, name: 'Egypt' },
      { id: 123, name: 'France' },
      { id: 130, name: 'India' },
      { id: 142, name: 'Italy' },
      { id: 156, name: 'Japan' },
      { id: 164, name: 'Kenya' },
      { id: 175, name: 'Peru' },
      { id: 188, name: 'Russia' },
      { id: 195, name: 'Spain' },
    ];
    const QUERIES = [
      { label: '156 (Japan) を探す', mode: 'int', key: 156 },
      { label: '102 (先頭端!) を探す', mode: 'int', key: 102 },
      { label: '140 (存在しない値) を探す', mode: 'int', key: 140 },
      { label: '文字列 "China" を strcmp で探す', mode: 'str', key: 'China' },
    ];

    let qi = 0, steps = [], si = 0;
    const cellsEl = h('div.t2-bs-cells');
    const msgEl = h('div.b6-sp-exp');
    const cmpEl = h('div.b6-va-msg');

    function buildSteps(q) {
      const out = [];
      let low = 0, high = DB.length - 1, cmp = 0;
      out.push({
        low, high, mid: -1, cmp, phase: 'init',
        msg: `開始: <code class="ic">db-&gt;n = ${DB.length}</code> 件の整列済み配列。<code class="ic">low = 0</code>, <code class="ic">high = ${high}</code> からスタート!`,
      });
      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        cmp++;
        const rec = DB[mid];
        if (q.mode === 'int') {
          if (rec.id === q.key) {
            out.push({ low, high, mid, cmp, phase: 'hit', msg: `比較 ${cmp} 回目: <code class="ic">mid = (${low}+${high})/2 = ${mid}</code> → <code class="ic">db-&gt;entry[${mid}].id == ${q.key}</code> <b>発見! return ${mid};</b>` });
            return out;
          } else if (rec.id < q.key) {
            out.push({ low, high, mid, cmp, phase: 'right', msg: `比較 ${cmp} 回目: <code class="ic">mid = ${mid}</code> の値 <b>${rec.id} &lt; ${q.key}</b> → 左半分 [${low}..${mid}] には絶対ない! 次は <code class="ic">low = mid + 1 = ${mid + 1}</code>` });
            low = mid + 1;
          } else {
            out.push({ low, high, mid, cmp, phase: 'left', msg: `比較 ${cmp} 回目: <code class="ic">mid = ${mid}</code> の値 <b>${rec.id} &gt; ${q.key}</b> → 右半分 [${mid}..${high}] には絶対ない! 次は <code class="ic">high = mid - 1 = ${mid - 1}</code>` });
            high = mid - 1;
          }
        } else {
          const c = q.key === rec.name ? 0 : (q.key < rec.name ? -1 : 1);
          if (c === 0) {
            out.push({ low, high, mid, cmp, phase: 'hit', msg: `比較 ${cmp} 回目: <code class="ic">mid = ${mid}</code> → <code class="ic">strcmp("${q.key}", "${rec.name}") == 0</code> <b>一致! return ${mid};</b>` });
            return out;
          } else if (c < 0) {
            out.push({ low, high, mid, cmp, phase: 'left', msg: `比較 ${cmp} 回目: <code class="ic">strcmp("${q.key}", "${rec.name}") &lt; 0</code> ("${q.key}" の方が辞書で前!) → <code class="ic">high = mid - 1 = ${mid - 1}</code>` });
            high = mid - 1;
          } else {
            out.push({ low, high, mid, cmp, phase: 'right', msg: `比較 ${cmp} 回目: <code class="ic">strcmp("${q.key}", "${rec.name}") &gt; 0</code> ("${q.key}" の方が辞書で後ろ!) → <code class="ic">low = mid + 1 = ${mid + 1}</code>` });
            low = mid + 1;
          }
        }
      }
      out.push({
        low, high, mid: -1, cmp, phase: 'miss',
        msg: `終了: <code class="ic">low (${low}) &gt; high (${high})</code> と逆転したので候補が 0 件になりました → <b>見つからないので return -1; (または NULL)</b>`,
      });
      return out;
    }

    function paint() {
      const q = QUERIES[qi];
      const st = steps[si];
      cellsEl.innerHTML = '';
      DB.forEach((rec, idx) => {
        const outRange = st.phase === 'miss' || idx < st.low || idx > st.high;
        const isMid = idx === st.mid;
        const isHit = st.phase === 'hit' && isMid;
        const cls = [
          isHit ? 'hit' : isMid ? 'mid' : outRange ? 'out' : '',
        ].filter(Boolean).join('.');
        cellsEl.appendChild(h('div.t2-bs-cell' + (cls ? '.' + cls : ''),
          h('div.t2-bs-ptr',
            idx === st.low && st.phase !== 'miss' ? h('span.b6-tag-p', 'low=' + st.low) : null,
            isMid ? h('span.t2-tag-m', 'mid=' + st.mid) : null,
            idx === st.high && st.phase !== 'miss' ? h('span.b6-tag-nx', 'high=' + st.high) : null),
          h('small', '[' + idx + ']'),
          h('b', q.mode === 'int' ? String(rec.id) : rec.name),
          h('em', q.mode === 'int' ? rec.name : 'id:' + rec.id)));
      });
      msgEl.className = 'b6-sp-exp' + (st.phase === 'hit' ? ' ok' : '');
      msgEl.innerHTML = st.msg;

      const linCnt = (() => {
        for (let i = 0; i < DB.length; i++) {
          if ((q.mode === 'int' ? DB[i].id : DB[i].name) === q.key) return i + 1;
        }
        return DB.length;
      })();
      cmpEl.innerHTML =
        `<span class="b6-va-badge ok">二分探索の比較回数: <b>${st.cmp}</b> 回</span> ` +
        `<span class="b6-va-badge warn">もし線形探索なら: <b>${linCnt}</b> 回 (n=1,000,000 なら最大 100 万回 vs 二分探索は <b>20 回</b>!)</span>`;
    }

    function selectQuery(k) {
      qi = k;
      steps = buildSteps(QUERIES[qi]);
      si = 0;
      [...qTabs.children].forEach((b, j) => b.classList.toggle('on', j === qi));
      paint();
    }

    const qTabs = h('div.tabs', QUERIES.map((q, k) =>
      h('button', { type: 'button', onclick: () => selectQuery(k) }, q.label)
    ));

    const el = h('div.b6-wid',
      h('div.b6-wid-head',
        h('div.b6-wid-t', h('span.chip.ptr', '8-4 VISUALIZER'), h('b', 'db_t の二分探索シミュレータ — low, mid, high が半分ずつ絞られる動きを目で見る')),
        h('div.b6-wid-ctl',
          h('button.btn.sm', { type: 'button', onclick: () => { si = Math.max(0, si - 1); paint(); } }, '← 1 手戻す'),
          h('button.btn.sm.ptr', { type: 'button', onclick: () => { si = (si + 1) % steps.length; paint(); } }, '次の比較へ →'),
          h('button.btn.sm.ghost', { type: 'button', onclick: () => { si = steps.length - 1; paint(); } }, '結果まで進む'))),
      h('div', { style: { marginBottom: '12px' } }, qTabs),
      cellsEl,
      msgEl,
      cmpEl);
    selectQuery(0);
    return el;
  }

  /* ---------- 3. 70 分タイマー + 得点ボード (3 回分) ---------- */
  const SETS = {
    1: { ids: ['q1', 'q2', 'q3', 'q4'], name: '第 1 回', sub: '基本 — 重点 4 題そのまま', theme: 'darray / list_insert_uniq / selection_sort / db_binary_search' },
    2: { ids: ['r2q1', 'r2q2', 'r2q3', 'r2q4'], name: '第 2 回', sub: '標準 — 文字列 malloc・削除・挿入法・strcmp 二分探索', theme: 'str_join / list_insert_delete_dup / insertion_sort / db_search_name' },
    3: { ids: ['r3q1', 'r3q2', 'r3q3', 'r3q4'], name: '第 3 回', sub: '応用 — 条件抽出・文字列リスト・複合キー整列・ソート+二分探索', theme: 'alloc_positives / strlist / sort_students / db_sort + db_bsearch' },
  };
  const curSet = () => store.get('t2:set', 1);
  const TKEY0 = 't2:timer';
  const LIMIT = 70 * 60 * 1000;

  function examTimer() {
    let TKEY = TKEY0 + ':' + curSet();
    let st = store.get(TKEY, { start: 0, used: 0, run: false });
    const R0 = 88, C0 = 2 * Math.PI * R0;
    const ring = h('div.t1-ring', { html: `<svg viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="${R0}" class="t1-bg"/><circle cx="100" cy="100" r="${R0}" class="t1-fg" style="stroke-dasharray:${C0} ${C0}"/></svg>` });
    const tm = h('b.t1-time', '70:00');
    const sub = h('small.t1-sub', '試験時間');
    ring.appendChild(h('div.t1-c', tm, sub));
    const bStart = h('button.btn.ptr', { onclick: () => (st.run ? pause() : start()) }, icon('run'), h('span', '本番スタート'));
    const bReset = h('button.btn.ghost', { onclick: reset }, icon('reset'), 'リセット');
    const board = h('div.t1-board');
    const score = h('div.t1-score');
    const setTabs = h('div.t1-sets', { role: 'tablist', 'aria-label': '模擬試験の回' }, Object.keys(SETS).map((k) => {
      const S0 = SETS[k];
      return h('button.t1-set', { role: 'tab', 'data-k': k, onclick: () => pickSet(+k) }, h('b', S0.name), h('span', S0.sub), h('i.t1-set-pts'));
    }));
    function pickSet(k) {
      store.set('t2:set', k);
      document.dispatchEvent(new CustomEvent('t2:set', { detail: k }));
    }
    let shown = curSet();
    document.addEventListener('t2:set', (e) => {
      const k = e.detail;
      if (k !== shown) {
        if (st.run) { st = { start: 0, used: st.used + (Date.now() - st.start), run: false }; store.set(TKEY, st); toast(SETS[shown].name + ' のタイマーを一時停止しました', { type: 'info' }); }
        shown = k; TKEY = TKEY0 + ':' + k; st = store.get(TKEY, { start: 0, used: 0, run: false }); fired.clear();
      }
      upd(); draw();
    });
    const el = h('div.t1-timer', setTabs, ring, h('div.t1-tside', h('div.t1-tbtn', bStart, bReset), score, board,
      h('p.c-mute.t1-tnote', '問1〜問4 を「テスト実行」で隠しテスト・メモリリーク検査・厳格題意チェック (sizeof / 二分探索) まで通すと 5 点が入ります。20 点中 10 点 (2 問完答) で合格!')));
    const elapsed = () => st.used + (st.run ? Date.now() - st.start : 0);
    const fired = new Set();
    function fmt(ms) { const s = Math.max(0, Math.ceil(ms / 1000)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }
    function draw() {
      const left = LIMIT - elapsed();
      tm.textContent = fmt(left);
      const fg = ring.querySelector('.t1-fg');
      fg.style.strokeDasharray = (Math.max(0, left) / LIMIT * C0).toFixed(1) + ' ' + C0;
      el.classList.toggle('warn', left < 10 * 60000 && left > 0);
      el.classList.toggle('over', left <= 0);
      sub.textContent = left <= 0 ? '時間終了' : st.run ? '残り時間' : st.used ? '一時停止中' : '試験時間';
      bStart.lastChild.textContent = st.run ? '一時停止' : st.used ? '再開' : '本番スタート';
      [[35, '折り返し — 残り 35 分。解けそうな 2 問を確実に仕上げよう!'], [10, '残り 10 分 — malloc の sizeof・二分探索になっているか・保存フォルダとファイル名を確認!'], [5, '残り 5 分! diff -Bw の最終確認を!']].forEach(([m, msg]) => {
        if (st.run && left <= m * 60000 && left > m * 60000 - 2000 && !fired.has(m)) { fired.add(m); toast(msg, { type: m <= 5 ? 'warn' : 'info', dur: 6000 }); }
      });
      if (st.run && left <= 0) { pause(); toast('70 分経過 — 試験終了です。おつかれさま!', { type: 'warn', dur: 8000 }); }
    }
    function start() { st = { start: Date.now(), used: st.used, run: true }; store.set(TKEY, st); draw(); }
    function pause() { st = { start: 0, used: elapsed(), run: false }; store.set(TKEY, st); draw(); }
    function reset() {
      U.ask({ title: 'タイマーを 70:00 に戻す?', html: '経過時間がリセットされます。', ok: 'リセット', danger: true, face: 's', mood: 'think' }).then((y) => { if (!y) return; st = { start: 0, used: 0, run: false }; store.set(TKEY, st); fired.clear(); draw(); toast('タイマーをリセットしました', { type: 'info' }); });
    }
    function upd() {
      const p = store.get('progress:t2', { predict: {}, tasks: {} });
      const ids = SETS[curSet()].ids;
      const pts = ids.filter((i) => p.tasks[i] === 'done').length * 5;
      setTabs.querySelectorAll('.t1-set').forEach((b) => {
        const k = +b.dataset.k;
        const on = k === curSet();
        b.classList.toggle('on', on);
        b.setAttribute('aria-selected', on);
        const sp = SETS[k].ids.filter((i) => p.tasks[i] === 'done').length * 5;
        const pi = b.querySelector('.t1-set-pts');
        pi.textContent = sp + ' 点';
        pi.className = 't1-set-pts' + (sp >= 10 ? ' ok' : '');
      });
      board.innerHTML = '';
      ids.forEach((i, k) => board.appendChild(h('a.t1-q' + (p.tasks[i] === 'done' ? '.done' : p.tasks[i] === 'try' ? '.try' : ''), {
        href: '#task-' + i,
        onclick: (e) => { e.preventDefault(); const T = window.__t1open; if (T) T(i); },
      }, h('b', SETS[curSet()].name.replace(/\s/g, '') + ' 問' + (k + 1)), h('span', p.tasks[i] === 'done' ? '5 点' : p.tasks[i] === 'try' ? '挑戦中' : '—'))));
      score.innerHTML = '';
      score.append(
        h('div.t1-pts', h('b', String(pts)), h('span', '/ 20 点')),
        h('div.t1-bar', h('i', { style: { width: pts * 5 + '%' } }), h('s', { title: '合格ライン 10 点' })),
        h('div.t1-pass' + (pts >= 10 ? '.ok' : ''), pts >= 10 ? '✓ 合格ライン (10 点) 到達!' : 'あと ' + (10 - pts) + ' 点で合格ライン')
      );
    }
    window.__t2upd = upd;
    upd(); draw();
    setInterval(draw, 500);
    setInterval(upd, 1500);
    return el;
  }

  function setOverview() {
    const T = Object.fromEntries((window.T2_TASKS || []).map((t) => [t.id, t]));
    const kinds = ['型 A 動的割当て (B5)', '型 B 単方向リスト (B6)', '型 C ソーティング (B7)', '型 D 二分探索 (B8)'];
    const cols = ['var(--sky)', 'var(--peach)', 'var(--mint)', 'var(--pink)'];
    return h('div.t1-ov',
      h('div.t1-ov-h', h('span'), ...kinds.map((k, i) => h('span', { style: { '--oc': cols[i] } }, k))),
      ...Object.keys(SETS).map((k) => h('div.t1-ov-r',
        h('b', SETS[k].name, h('small', SETS[k].sub)),
        ...SETS[k].ids.map((id, i) => {
          const t = T[id] || {};
          return h('button.t1-ov-c', {
            style: { '--oc': cols[i] },
            onclick: () => {
              store.set('t2:set', +k);
              document.dispatchEvent(new CustomEvent('t2:set', { detail: +k }));
              if (window.__t2upd) window.__t2upd();
              if (window.__t1open) window.__t1open(id);
            },
          }, h('code', (t.files || [''])[0]), h('span', t.short || ''));
        })
      ))
    );
  }

  /* ---------- 4. 当日の手順チェックリスト ---------- */
  function checklist(key, groups) {
    const saved = store.get(key, {});
    const total = groups.reduce((a, g) => a + g.items.length, 0);
    const meter = h('div.ck-meter', h('b', '0'), h('span', ' / ' + total));
    const bar = h('div.ck-bar', h('i'));
    const el = h('div.ck', h('div.ck-head', meter, bar, h('button.btn.sm.ghost', { onclick: () => { Object.keys(saved).forEach((k) => delete saved[k]); store.set(key, saved); el.querySelectorAll('input').forEach((x) => (x.checked = false)); upd(); } }, icon('reset'), 'リセット')));
    groups.forEach((g, gi) => {
      el.appendChild(h('div.ck-g', h('div.ck-gt', h('span.ck-step', g.step), g.title),
        g.items.map((it, k) => {
          const id = gi + '-' + k;
          const cb = h('input', { type: 'checkbox', checked: !!saved[id], onchange: () => { saved[id] = cb.checked; store.set(key, saved); upd(); if (cb.checked) lab.classList.add('pop'); } });
          const lab = h('label.ck-i' + (it.crit ? '.crit' : ''), cb, h('span.ck-box', { 'aria-hidden': 'true' }), h('span.ck-t', { html: it.t }));
          lab.addEventListener('animationend', () => lab.classList.remove('pop'));
          return lab;
        })));
    });
    function upd() {
      const n = Object.values(saved).filter(Boolean).length;
      meter.firstChild.textContent = n;
      bar.firstChild.style.width = (n / total * 100) + '%';
      el.classList.toggle('all', n === total);
      if (n === total && upd.prev !== total) toast('チェックリスト完了 — 準備万端!', { type: 'ok' });
      upd.prev = n;
    }
    upd.prev = -1; setTimeout(upd, 0);
    return el;
  }

  /* ---------- 5. 重点復習マップ (B5/B6/B7 の進捗連動) ---------- */
  function focusMap() {
    const items = [
      { tag: '課題 (5-1)', t: 'new_array_scan — malloc(sizeof(int)*n) で動的配列', href: '/b5#task-5-1', u: 'b5', tid: '5-1', c: 'sky', mock: '問1' },
      { tag: '課題 (5-3)', t: '文字列の動的割当て — sizeof(char)*(strlen(s)+1)', href: '/b5#task-5-3', u: 'b5', tid: '5-3', c: 'sky', mock: '問1' },
      { tag: '課題 (6-1)〜(6-3)', t: '単方向リストの生成・出力・探索 (head->next)', href: '/b6#task-6-1', u: 'b6', tid: '6-3', c: 'peach', mock: '問2' },
      { tag: '課題 (6-4)(6-5)', t: '昇順リストへの重複なし挿入・重複時削除+free', href: '/b6#task-6-5', u: 'b6', tid: '6-5', c: 'peach', mock: '問2' },
      { tag: '課題 (7-2)', t: 'selection_sort — 単純選択法で配列を整列', href: '/b7#task-7-2', u: 'b7', tid: '7-2', c: 'mint', mock: '問3' },
      { tag: '課題 (7-4)', t: 'insertion_sort — 単純挿入法で配列を整列', href: '/b7#task-7-4', u: 'b7', tid: '7-4', c: 'mint', mock: '問3' },
      { tag: '課題 (8-4)', t: 'db_t の二分探索 — O(log n) (線形探索は 0 点!)', href: '/b8#task-8-4', u: 'b8', tid: '8-4', c: 'pink', mock: '問4' },
    ];
    return h('div.fmap', items.map((it, k) => {
      const s = it.u ? (store.get('progress:' + it.u, { tasks: {} }).tasks || {})[it.tid] : null;
      return h('a.fm-card', { href: it.href, style: { '--fc': 'var(--' + it.c + ')', '--k': k } },
        h('div.fm-tag', it.tag),
        h('div.fm-t', it.t),
        h('div.fm-f',
          h('span.chip' + (s === 'done' ? '.ok' : ''), s === 'done' ? '✓ クリア済み' : s === 'try' ? '挑戦中' : it.u ? '元の課題へ' : '下の図解で習得!'),
          h('span.fm-mock', '→ 模擬 ' + it.mock),
          icon('arrow')));
    }));
  }

  /* ---------- 6. 名指しされた重点課題まとめカード (6 枚) ---------- */
  const REVIEW = [
    {
      id: '課題 (5-1)', grp: 'A', title: 'malloc による数値配列の動的割当て', href: '/b5#task-5-1', files: 'malloc + sizeof(型) * n',
      ask: '要素数 <code class="ic">n</code> を受け取り (または入力から読み)、ちょうど <code class="ic">n</code> 個分の配列を <code class="ic">malloc</code> で確保して値を格納し、その先頭ポインタを返す関数を作る。',
      need: ['<code class="ic">#include &lt;stdlib.h&gt;</code> (サンプルプログラムにある)', '<code class="ic">p = malloc(sizeof(int) * n);</code> (double なら <code class="ic">sizeof(double) * n</code>)', '<code class="ic">if (p == NULL) { fprintf(stderr, ...); exit(1); }</code>'],
      steps: ['必要な要素数 <code class="ic">n</code> を確定する', '<code class="ic">sizeof(要素の型) * n</code> で <code class="ic">malloc</code> を呼ぶ', '<code class="ic">NULL</code> 検査を書く (サンプルからコピペ可)', '<code class="ic">p[0]</code> 〜 <code class="ic">p[n-1]</code> に書き込んで <code class="ic">return p;</code> (返す関数内で free しない!)'],
      trap: '<b>T2 最大の減点ポイント</b>: <code class="ic">malloc(4 * n)</code> や <code class="ic">malloc(8 * n)</code> のように <code class="ic">sizeof</code> を使わず数値を直接書くと<b>出力が合っていても 0 点</b>。関数内で <code class="ic">free(p)</code> してから返すとダングリングポインタになる。',
      code: 'int *a = malloc(sizeof(int) * n);\nif (a == NULL) {\n  fprintf(stderr, "malloc failed\\n");\n  exit(1);\n}\nfor (i = 0; i < n; i++) { a[i] = ...; }\nreturn a;',
    },
    {
      id: '課題 (5-3)', grp: 'A', title: 'malloc による文字列の動的割当て', href: '/b5#task-5-3', files: 'strlen + 1 と sizeof(char)',
      ask: '文字列 <code class="ic">s</code> の複製や連結結果を、<b>ちょうどの長さ</b>で動的に割り当てた文字配列に格納して返す関数を作る。',
      need: ['<code class="ic">#include &lt;string.h&gt;</code> (<code class="ic">strlen</code>, <code class="ic">strcpy</code>, <code class="ic">strcat</code>)', '終端のヌル文字 <code class="ic">\'\\0\'</code> の分 <b><code class="ic">+ 1</code></b>', '<code class="ic">malloc(sizeof(char) * (strlen(s) + 1))</code>'],
      steps: ['結果の文字数 <code class="ic">len</code> を <code class="ic">strlen</code> で計算する', '<code class="ic">sizeof(char) * (len + 1)</code> を <code class="ic">malloc</code> + <code class="ic">NULL</code> 検査', '<code class="ic">strcpy</code> (やループ代入) で <code class="ic">\'\\0\'</code> まで書き込み <code class="ic">return p;</code>'],
      trap: '<code class="ic">+ 1</code> を忘れると <code class="ic">\'\\0\'</code> が領域外にはみ出し <b>0 点</b>。また <code class="ic">malloc(64)</code> のように固定サイズで確保しても「割り当てるバイト数が異なる」ため <b>0 点</b>。',
      code: 'int len = strlen(s);\nchar *p = malloc(sizeof(char) * (len + 1));\nif (p == NULL) { fprintf(stderr, "malloc failed\\n"); exit(1); }\nstrcpy(p, s);\nreturn p;',
    },
    {
      id: '課題 (6-1)〜(6-3)', grp: 'B', title: '単方向リストの節点挿入・表示・探索', href: '/b6#task-6-1', files: 'node_t *head (ダミー節点)',
      ask: '先頭にダミー節点 <code class="ic">head</code> を持つリストに対し、節点の生成・全要素の表示・指定キーの探索を行う。',
      need: ['実データの先頭は <code class="ic">head</code> ではなく <b><code class="ic">head-&gt;next</code></b>', 'ループの進行は <code class="ic">p++</code> ではなく <b><code class="ic">p = p-&gt;next</code></b>', '新しい節点は <code class="ic">malloc(sizeof(node_t))</code> で作る'],
      steps: ['読むだけの処理 (表示・探索) は <code class="ic">for (p = head-&gt;next; p != NULL; p = p-&gt;next)</code>', '一致したら <code class="ic">return p;</code> (または 1)、最後までなければ <code class="ic">return NULL;</code> (または 0)'],
      trap: '<code class="ic">p = head</code> から表示・探索を始めると、ダミー節点のゴミデータまで拾ってしまう!',
      code: 'node_t *list_find(node_t *head, int val)\n{\n  node_t *p;\n  for (p = head->next; p != NULL; p = p->next) {\n    if (p->val == val) { return p; }\n  }\n  return NULL;\n}',
    },
    {
      id: '課題 (6-4)(6-5)', grp: 'B', title: '昇順リストへの重複なし挿入・重複削除', href: '/b6#task-6-5', files: 'p = head から p->next 先読み',
      ask: '昇順に並んだリストに対し、同じ値があれば無視 (6-4) または削除して <code class="ic">free</code> (6-5) し、なければ昇順位置に新しい節点を割り込ませる。',
      need: ['矢印を書き換えるので<b>1 つ手前の節点</b>が必要 → <code class="ic">for (p = head; p-&gt;next != NULL; p = p-&gt;next)</code>', '削除は <code class="ic">del = p-&gt;next; p-&gt;next = del-&gt;next; free(del);</code>', '挿入は <code class="ic">p-&gt;next = new_node(val, p-&gt;next);</code>'],
      steps: ['<code class="ic">p = head</code> からスタートし <code class="ic">p-&gt;next != NULL</code> の間ループ', '<code class="ic">p-&gt;next-&gt;val == val</code> なら重複処理して <code class="ic">return</code>', '<code class="ic">p-&gt;next-&gt;val &gt; val</code> ならそこが隙間なので <code class="ic">break;</code>', 'ループ後に <code class="ic">p-&gt;next = new_node(val, p-&gt;next);</code> (末尾追加も空リストもこの 1 行で動く!)'],
      trap: '<code class="ic">free(p-&gt;next)</code> を先にやってから <code class="ic">p-&gt;next-&gt;next</code> を読むのは解放済みメモリの参照でクラッシュ!',
      code: 'for (p = head; p->next != NULL; p = p->next) {\n  if (p->next->val == val) {\n    del = p->next;\n    p->next = del->next;\n    free(del);\n    return;\n  }\n  if (p->next->val > val) { break; }\n}\np->next = new_node(val, p->next);',
    },
    {
      id: '課題 (7-2)(7-4)', grp: 'C', title: 'ソーティング関数 (単純選択法・単純挿入法)', href: '/b7#task-7-2', files: 'selection_sort / insertion_sort',
      ask: '配列 <code class="ic">a[0]</code>〜<code class="ic">a[n-1]</code> を指定の順序 (昇順・降順・辞書順・構造体メンバー順) に並べ替える関数を作る。',
      need: ['<b>単純選択法 (7-2)</b>: 未整列 <code class="ic">k..n-1</code> の最小添字 <code class="ic">min</code> を探し <code class="ic">a[k]</code> と交換', '<b>単純挿入法 (7-4)</b>: <code class="ic">i = k</code> から左へ <code class="ic">a[i-1] &lt;= a[i]</code> で <code class="ic">break</code>、そうでなければ左隣と交換', '文字列なら <code class="ic">strcmp</code> + <code class="ic">strcpy</code>、構造体なら丸ごと <code class="ic">=</code> 代入'],
      steps: ['一時変数 <code class="ic">tmp</code> を<b>配列の要素と同じ型</b>で宣言する (<code class="ic">double</code> 配列なのに <code class="ic">int tmp</code> にしない!)', '外側ループ・内側ループの範囲 (<code class="ic">n-2</code> や <code class="ic">1 &lt;= i</code>) を正確に書く', '<code class="ic">n == 1</code> の入力でも配列外参照しないか頭の中で確認する'],
      trap: '<code class="ic">double</code> 配列の交換で <code class="ic">int tmp</code> を使うと小数部が切り捨てられて 0 点! 文字列比較で <code class="ic">a[i] &lt; a[min]</code> と書くと番地比較になる。',
      code: '/* 単純選択法 (7-2) */\nfor (k = 0; k <= n - 2; k++) {\n  min = k;\n  for (i = k + 1; i < n; i++) {\n    if (a[i] < a[min]) { min = i; }\n  }\n  tmp = a[k]; a[k] = a[min]; a[min] = tmp;\n}',
    },
    {
      id: '課題 (8-4)', grp: 'D', title: 'db_t データ構造に対する二分探索関数', href: '/b8#task-8-4', files: 'low / high / mid 二分探索',
      ask: 'キーの昇順 (または辞書順) に整列された <code class="ic">db_t</code> (件数 <code class="ic">db-&gt;n</code>、配列 <code class="ic">db-&gt;entry[...]</code>) から、指定キーを<b>二分探索</b>で高速に探し、添字・値・または要素へのポインタを返す。',
      need: ['<code class="ic">low = 0; high = db-&gt;n - 1;</code>', '<code class="ic">while (low &lt;= high)</code> (<b><code class="ic">&lt;=</code></b> が必須!)', '<code class="ic">mid = (low + high) / 2;</code>', '比較結果に応じて <code class="ic">low = mid + 1</code> または <code class="ic">high = mid - 1</code>'],
      steps: ['<code class="ic">low = 0</code>, <code class="ic">high = db-&gt;n - 1</code> で初期化', '<code class="ic">while (low &lt;= high)</code> の先頭で <code class="ic">mid = (low + high) / 2;</code>', '一致なら即 <code class="ic">return</code> (添字 <code class="ic">mid</code> やポインタ <code class="ic">&amp;db-&gt;entry[mid]</code> 等、問題の指定どおり)', '探すキーの方が大きければ右半分 (<code class="ic">low = mid + 1</code>)、小さければ左半分 (<code class="ic">high = mid - 1</code>)', 'ループを抜けたら未発見の返り値 (<code class="ic">-1</code> や <code class="ic">NULL</code>) を返す'],
      trap: '<b>線形探索は出力が完全一致しても 0 点!</b> また <code class="ic">low = mid</code> / <code class="ic">high = mid</code> (<code class="ic">+1</code>/<code class="ic">-1</code> 忘れ) にすると無限ループに陥る。文字列キーではサンプルプログラムで <code class="ic">strcmp</code> の正負の向きを必ず確認すること!',
      code: 'int low = 0, high = db->n - 1, mid, c;\nwhile (low <= high) {\n  mid = (low + high) / 2;\n  c = strcmp(key, db->entry[mid].key);\n  if (c == 0) { return mid; }\n  else if (c < 0) { high = mid - 1; }\n  else { low = mid + 1; }\n}\nreturn -1;',
    },
  ];
  const GRP = {
    A: ['var(--sky)', '型 A 動的割当て', '問1'],
    B: ['var(--peach)', '型 B リスト処理', '問2'],
    C: ['var(--mint)', '型 C ソーティング', '問3'],
    D: ['var(--pink)', '型 D 二分探索', '問4'],
  };

  function reviewCards() {
    const doneKey = 't2:rv';
    const done = store.get(doneKey, {});
    const meter = h('b', '0');
    const upd = () => { meter.textContent = Object.values(done).filter(Boolean).length; };
    const list = h('div.rv7', REVIEW.map((r, k) => {
      const g = GRP[r.grp];
      const cb = h('input', { type: 'checkbox', checked: !!done[r.id], onchange: () => { done[r.id] = cb.checked; store.set(doneKey, done); upd(); card.classList.toggle('ok', cb.checked); if (cb.checked) toast(r.id + ' を「説明できる」にしました', { type: 'ok' }); } });
      const body = h('div.rv-body',
        h('div.rv-ask', h('h6', '何を作る?'), h('p', { html: r.ask })),
        h('div.rv-cols',
          h('div.rv-need', h('h6', '試験に必要な要素'), h('ul', r.need.map((x) => h('li', { html: x })))),
          h('div.rv-steps', h('h6', '解くステップ'), h('ol', r.steps.map((x) => h('li', { html: x }))))),
        h('div.rv-trap', h('b', '落とし穴'), h('span', { html: r.trap })),
        h('details.rv-code', h('summary', '要点のコード (自分で書いてから開く)'), codeBlock(r.code)),
        h('div.rv-foot',
          h('label.rv-chk', cb, h('span.ck-box', { 'aria-hidden': 'true' }), h('span', '何も見ずに書ける / 説明できる')),
          h('a.btn.sm', { href: r.href }, r.href.startsWith('#') ? '図解で確認' : '元の課題で練習', icon('arrow'))));
      const card = h('details.rv-card' + (done[r.id] ? '.ok' : ''), { style: { '--rc': g[0], '--k': k }, open: k === 0 || k === 5 },
        h('summary.rv-head', h('span.rv-id', r.id), h('span.rv-t', r.title), h('span.rv-meta', h('span.rv-grp', g[1]), h('span.rv-f', r.files), h('span.rv-mock', '→ 模擬 ' + g[2])), h('span.rv-arrow', { 'aria-hidden': 'true' }, '▾')),
        body);
      return card;
    }));
    upd();
    return h('div',
      h('div.rv-top',
        h('div.rv-meter', meter, h('span', ' / ' + REVIEW.length + ' テーマ 「何も見ずに書ける」')),
        h('div.rv-btns',
          h('button.btn.sm.ghost', { onclick: () => list.querySelectorAll('details.rv-card').forEach((d) => (d.open = true)) }, 'すべて開く'),
          h('button.btn.sm.ghost', { onclick: () => list.querySelectorAll('details.rv-card').forEach((d) => (d.open = false)) }, 'すべて閉じる'))),
      list);
  }

  /* ---------- ヒーロー ---------- */
  function hero(heroMem) {
    return h('section.u-hero.t1-hero',
      h('div.u-hero-grid',
        h('div',
          h('div.code-id', 'MIDTERM T2 — PRACTICAL EXAM (B5–B8)'),
          h('h1', '中間試験 T2', h('br'), h('em', 'malloc · List · Sort · BSearch')),
          h('p.tag', '70 分・4 問 (各 5 点)・10 点以上で合格・持ち込み不可。', h('br'), h('span', '出力の diff -Bw に加え、「sizeof を使った malloc か」「本当に二分探索か」まで採点される実技試験を完全攻略する。')),
          h('div.u-stats',
            h('div', h('b', '4'), '問 × 5 点 = 20 点'),
            h('div', h('b', '10'), '点以上で合格'),
            h('div', h('b', '70'), '分 (ネット切断)')),
          h('div.cta',
            h('a.btn.ptr', { href: '#mock' }, '模擬試験を受ける (全3回)', icon('arrow')),
            h('a.btn', { href: '#bsearch' }, '8-4 二分探索を図で掴む'),
            h('a.btn.ghost', { href: '#strict' }, '0点トラップ確認'))),
        heroMem()));
  }

  const chapters = [
    {
      id: 'format', num: '00', group: 'はじめに', kicker: '試験の形式と全体マップ', navTitle: '形式と全体マップ',
      title: 'B5〜B8 から 4 問、70 分。2 問を完璧に通せば合格。',
      lead: 'T2 は演習室の PC (インターネット切断・持ち込み一切不可) でプログラムを作成する実技試験。当日頼れるのは配布される 1 枚のサンプルプログラムと自分の頭だけ。まずは予告 PDF が名指しした 4 大テーマの「直感 ⇒ 本質」を 30 秒で掴もう。',
      blocks: [
        { type: 'widget', make: essenceMap },
        { type: 'cheat', items: [
          { c: '実技・70 分', d: '演習室の PC (<b>Cygwin</b> + VSCode / サクラエディタ等) で実施。時計と筆記用具のみ可。', code: '$ gcc q1main.c q1.c\n$ ./a < in.txt > out.txt' },
          { c: '4 問 × 5 点', d: '20 点満点中 <b>10 点以上で合格</b>。部分点は原則なし — <b>解ける 2 問を完璧に仕上げる</b>のが最優先戦略。', code: '5 + 5 + 0 + 0 = 10 /* 合格! */' },
          { c: 'ネット・過去作不可', d: 'PC はネットから切断され、<b>自分が過去に作ったプログラムも参照できない</b> (試験用アカウントで実施)。', code: '/* 当日配布のサンプルのみ参照可 */' },
          { c: 'コピペ活用', d: '問題は電子ファイルで配布。動作確認用プログラム・入力・期待値は<b>コピー＆ペースト</b>で正確に保存する。', code: '$ diff -Bw out.txt exp.txt' },
        ] },
      ],
    },

    {
      id: 'strict', num: '01', group: 'はじめに', kicker: '採点基準と T2 特有の厳格ルール', navTitle: '採点基準と0点トラップ',
      title: 'diff -Bw が通っても、書き方違反なら 0 点になる。',
      lead: 'T1 と同じく出力は diff -Bw (空行と空白数の違いのみ無視) + 隠しテストで照合される。さらに T2 の予告資料では「malloc の書き方」と「二分探索かどうか」について明確な不正解条件が警告されている!',
      blocks: [
        { type: 'point', n: 1, title: '厳格ルール ①: <code class="ic">malloc</code> は必ず <b><code class="ic">sizeof(型)</code></b> を使い、<b>ちょうどのバイト数</b>を割り当てる', sub: '「割り当てるバイト数が異なっていたり、sizeof を使わずに直接バイト数を指定した場合には不正解とする」(予告資料より)。' },
        { type: 'point', n: 2, title: '厳格ルール ②: 二分探索の問題で<b>線形探索などを書いたら、出力が正しくても 0 点</b>', sub: '「実行結果が正しくても二分探索ができていない (線形探索になっている等) の場合には不正解とする」(予告資料より)。' },
        { type: 'widget', make: strictTrapLab },
        { type: 'mistakes', items: [
          {
            title: '文字列の malloc で末尾の \'\\0\' (+1) を忘れる',
            code: '#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n\nint main(void)\n{\n  char *s = "Japan";\n  char *p = malloc(sizeof(char) * strlen(s));\n  strcpy(p, s);\n  printf("%s\\n", p);\n  free(p);\n  return 0;\n}\n',
            fix: '<code class="ic">strlen("Japan")</code> は 5 ですが、<code class="ic">strcpy</code> は 6 バイト目に <code class="ic">\'\\0\'</code> を書き込みます。確保した 5 バイトをはみ出してメモリ破壊を起こすため、<code class="ic">malloc(sizeof(char) * (strlen(s) + 1))</code> が必須です。',
          },
          {
            title: 'リストの節点を先に free してから p->next を辿る',
            code: '#include <stdio.h>\n#include <stdlib.h>\n\ntypedef struct node { int v; struct node *next; } node_t;\n\nint main(void)\n{\n  node_t *a = malloc(sizeof(node_t));\n  a->v = 10; a->next = NULL;\n  free(a);\n  printf("%p\\n", (void *)a->next);\n  return 0;\n}\n',
            fix: '<code class="ic">free(a)</code> した瞬間に <code class="ic">a-&gt;next</code> を読む権利は失われます! 一時変数 <code class="ic">nx = a-&gt;next;</code> に退避してから <code class="ic">free(a);</code> しましょう。',
          },
        ] },
      ],
    },

    {
      id: 'procedure', num: '02', group: 'はじめに', kicker: '試験の手順と注意事項', navTitle: '当日の手順 (Dドライブ)',
      title: '試験用アカウント・D ドライブ・指定ファイル名。',
      lead: '普段の実習 (個人アカウント・Z ドライブ) と環境が違う箇所が 3 つある。フォルダやファイル名を間違えると「採点の対象外」になるので前日にチェックしておこう。',
      blocks: [
        { type: 'widget', title: 'T2 当日の手順チェックリスト', make: () => checklist('t2:ck', [
          { step: '0', title: '入室まで', items: [
            { t: '入室許可があるまで<b>室外で待機</b>する' },
            { t: '持ち込みは<b>時計と筆記用具のみ</b> (スマホ・スマートウォッチ・紙資料はすべて不可)' },
          ] },
          { step: '1', title: '入室から試験開始まで', items: [
            { t: '<b>指定座席</b>に着席する' },
            { t: '<b>試験用アカウント</b>でログイン済み — <b>絶対にログアウト / 再起動 / シャットダウンしない</b>', crit: true },
            { t: 'コンパイル・実行は Z ドライブではなく <b>D ドライブ</b>で行う (当日指示の手順に従う)', crit: true },
          ] },
          { step: '2', title: '試験開始から終了まで', items: [
            { t: 'プログラムは<b>指定された名前</b>で<b>指定されたフォルダ</b>に保存した (<code class="ic">ls</code> で確認!)', crit: true },
            { t: '<code class="ic">malloc</code> で <b><code class="ic">sizeof</code></b> を使い、文字列なら <b><code class="ic">+ 1</code></b>、失敗時の <code class="ic">NULL</code> 検査を入れた', crit: true },
            { t: '二分探索の問題が線形探索になっておらず、<code class="ic">low &lt;= high</code> で半分ずつ絞っている', crit: true },
            { t: '<code class="ic">./a &lt; in.txt &gt; out.txt</code> → <code class="ic">diff -Bw out.txt exp.txt</code> が無出力であることを確認した' },
            { t: '要素数 1 個・先頭/末尾・存在しないキーなど<b>問題文にない境界入力</b>でも試した' },
            { t: 'PC フリーズ等のトラブル時は自分で再起動せず<b>速やかに教員に申し出る</b>' },
          ] },
        ]) },
      ],
    },

    {
      id: 'sample', num: '03', group: '1. サンプルプログラム', kicker: '試験当日に配布される唯一のコード', navTitle: '配布サンプル徹底解剖',
      title: 'T2 のサンプルは「malloc + free」と「strcmp の正負」の公式見本!',
      lead: 'T1 のサンプルとは中身がガラッと変わっている! T2 当日に配られるサンプルプログラムには、まさに B5〜B8 で使う「ヘッダ 4 つ」「STRLEN+1」「malloc + NULL 検査 + free」「strcmp が返す 0・負・正」がそのまま載っている。',
      blocks: [
        { type: 'code', title: 'sample.c (T2 予告 PDF 次頁の配布サンプルそのまま)', code: SAMPLE },
        { type: 'cheat', items: [
          { c: '#include 4 兄弟', d: '<b>stdio.h</b> (printf, fprintf, stderr) / <b>stdlib.h</b> (malloc, free, exit, rand) / <b>math.h</b> (sqrt, fabs) / <b>string.h</b> (strcpy, strlen, strcmp)。迷ったらサンプル先頭を見る!', code: '#include <stdlib.h>\n#include <string.h>' },
          { c: 'STRLEN + 1', d: '最大 63 文字の文字列を入れる配列は <b><code class="ic">char s[STRLEN+1];</code></b> (末尾 <code class="ic">\'\\0\'</code> の 1 バイト分を足す)。動的確保でも同じく <code class="ic">strlen(s) + 1</code>!', code: '#define STRLEN 63\nchar s1[STRLEN+1];' },
          { c: 'malloc 定型文', d: '<b><code class="ic">sizeof(型)</code></b> で確保 → <code class="ic">if (b==NULL)</code> で stderr に出して <code class="ic">exit(1)</code> → 使い終わったら <code class="ic">free(b); b = NULL;</code>。本番でそのまま書き写せる!', code: 'b = malloc(sizeof(double));\nif (b==NULL) { ... exit(1); }' },
          { c: 'strcmp の符号', d: '二分探索や文字列ソートで「<code class="ic">&lt; 0</code> と <code class="ic">&gt; 0</code> どっちが辞書順で前だっけ?」と迷ったらここを見る! <code class="ic">"China"</code> vs <code class="ic">"Japan"</code> (\'C\' &lt; \'J\') が<b>負数</b>!', code: 'strcmp("China","Japan") /* 負 */\nstrcmp("Russia","Japan") /* 正 */' },
        ] },
        {
          type: 'predict', id: 'p0', files: { 'sample.c': SAMPLE }, units: ['sample.c'], stdin: '',
          q: 'この配布サンプルを実行したとき、1 行目の出力と 2 行目の出力は?',
          choices: [
            '<code>*b = 10.000</code> と <code>0</code>',
            '<code>*b = 10</code> と <code>1</code>',
            '<code>*b = 10.000</code> と <code>1</code>',
          ],
          answer: 0,
          explain: '<code class="ic">*b = 10;</code> を <code class="ic">%5.3f</code> で出すので小数 3 桁の <b><code class="ic">*b = 10.000</code></b>。同じ文字列同士の <code class="ic">strcmp(s2, s2)</code> は一致を表す <b><code class="ic">0</code></b> を返します (真偽値の 1 ではないことに注意!)。',
        },
        {
          type: 'predict', id: 'p1',
          code: '#include <stdio.h>\n#include <string.h>\n\nint main(void)\n{\n  char *w[] = { "Brazil", "China", "India", "Japan", "Russia" };\n  int low = 0, high = 4, mid;\n  while (low <= high) {\n    mid = (low + high) / 2;\n    printf("%s ", w[mid]);\n    if (strcmp("China", w[mid]) == 0) { break; }\n    else if (strcmp("China", w[mid]) < 0) { high = mid - 1; }\n    else { low = mid + 1; }\n  }\n  printf("\\n");\n  return 0;\n}\n',
          q: '<code class="ic">"China"</code> を二分探索するとき、順番にチェックされる (<code class="ic">w[mid]</code> として表示される) 単語の並びは?',
          choices: [
            '<code>India Brazil China </code>',
            '<code>Brazil China </code>',
            '<code>India Japan Russia </code>',
          ],
          answer: 0,
          explain: '最初は <code class="ic">low=0, high=4</code> → <code class="ic">mid=2</code> (<code class="ic">"India"</code>)。サンプルの通り <code class="ic">strcmp("China", "India")</code> は負なので左半分 <code class="ic">high = 1</code> へ! 次は <code class="ic">mid = (0+1)/2 = 0</code> (<code class="ic">"Brazil"</code>)。<code class="ic">strcmp("China", "Brazil")</code> は正なので <code class="ic">low = 1</code> へ! 最後に <code class="ic">mid = 1</code> (<code class="ic">"China"</code>) で一致して break します。',
        },
        { type: 'tracer', files: { 'sample.c': SAMPLE }, units: ['sample.c'], stdin: '', title: '配布サンプルをステップ実行 — ヒープの double (8B) が確保・解放される瞬間と strcmp の返り値を確認' },
      ],
    },

    {
      id: 'bsearch', num: '04', group: '2. 出題範囲と 8-4 攻略', kicker: '課題 (8-4) db_t の二分探索を直感でマスター', navTitle: '8-4 二分探索の直感と本質',
      title: '辞書を真ん中から開くだけ — db_t 二分探索の完全図解。',
      lead: '課題 (8-4) は「構造体 db_t の中に件数 n と整列済みレコード配列 entry[] が入っている」データ構造への二分探索。まずは下のシミュレータで low, mid, high が動く感覚を目で掴もう。',
      blocks: [
        { type: 'widget', make: bsearchLab },
        { type: 'compare', title: '整数キーの二分探索 vs 文字列キーの二分探索 — 違いは比較の 1 か所だけ!', items: [
          {
            title: '<span class="chip val">整数キー</span> id 昇順の db_t',
            code: 'int db_bsearch(db_t *db, int key)\n{\n  int low = 0, high = db->n - 1, mid;\n  while (low <= high) {\n    mid = (low + high) / 2;\n    if (db->entry[mid].id == key)\n      return mid;\n    else if (db->entry[mid].id < key)\n      low = mid + 1;  /* 右半分へ */\n    else\n      high = mid - 1; /* 左半分へ */\n  }\n  return -1;\n}',
            html: '<code class="ic">entry[mid].id &lt; key</code> なら中央より右にあるので <code class="ic">low = mid + 1</code>。',
          },
          {
            title: '<span class="chip ptr">文字列キー</span> 辞書順の db_t',
            code: 'int db_bsearch(db_t *db, char *key)\n{\n  int low = 0, high = db->n - 1, mid, c;\n  while (low <= high) {\n    mid = (low + high) / 2;\n    c = strcmp(key, db->entry[mid].key);\n    if (c == 0)\n      return mid;\n    else if (c < 0)\n      high = mid - 1; /* keyが前→左へ */\n    else\n      low = mid + 1;  /* keyが後→右へ */\n  }\n  return -1;\n}',
            html: '<code class="ic">strcmp(key, mid)</code> の第 1 引数を <code class="ic">key</code> にすると、<code class="ic">c &lt; 0</code> がそのまま「<code class="ic">key &lt; mid</code> (左半分へ)」と読めて直感的!',
          },
        ] },
        {
          type: 'shell', name: '実践ドリル — 境界値で落ちる二分探索バグを diff -Bw で見抜いて直す',
          editable: ['dbfind.c'],
          files: { 'dbfind.h': DRILL.h, 'dbfindmain.c': DRILL.main, 'dbfind.c': DRILL.bug, 'in.txt': DRILL.in, 'exp.txt': DRILL.exp },
          cmds: ['gcc dbfindmain.c dbfind.c', './a < in.txt > out.txt', 'cat out.txt', 'diff -Bw out.txt exp.txt'],
          intro: '左の <code class="ic">dbfind.c</code> には、試験本番で一番多い<b>1 文字バグ (<code class="ic">while (low &lt; high)</code>)</b> が潜んでいます! 真ん中の <code class="ic">30</code> は見つかるのに、端の <code class="ic">10</code> や <code class="ic">50</code> が <code class="ic">-1</code> になってしまうことを確認し、<code class="ic">low &lt;= high</code> に直して <code class="ic">diff -Bw</code> を無出力にしよう。',
          goals: [
            { text: 'まずそのまま実行して <code class="ic">diff -Bw</code> で端の要素 (10, 50) が失敗するのを見る', test: (hs) => hs.some((x) => x.diff && !x.diff.same) },
            { text: '<code class="ic">dbfind.c</code> の条件を <code class="ic">low &lt;= high</code> に修正し、<code class="ic">diff -Bw</code> が何も出ない状態にする', test: (hs) => hs.some((x) => x.diff && x.diff.same && /-Bw|-wB/.test(x.cmd)) },
          ],
        },
      ],
    },

    {
      id: 'review4', num: '05', group: '2. 出題範囲と 8-4 攻略', kicker: '予告 PDF が「特に復習」と名指しした全範囲', navTitle: '重点復習カード (B5〜B8)',
      title: '名指しされた (5-1)(5-3) / (6-1)〜(6-5) / (7-2)(7-4) / (8-4) 完全整理。',
      lead: 'B5・B6・B7 のクリア状況とも自動連動。各カードの「落とし穴」と「要点のコード」を自分の手で再現できるようになったらチェックを入れよう。',
      blocks: [
        { type: 'widget', make: focusMap },
        { type: 'widget', title: '<span class="chip ptr">MUST KNOW</span> 重点テーマ 6 枚の分解カード — 書けたらチェック!', make: reviewCards },
      ],
    },

    {
      id: 'mock', num: '06', group: '3. 模擬試験', kicker: 'Mock Exam — 70 min × 3 Sets', navTitle: '模擬試験 (70 分 × 3 回)',
      title: '本番と同じ 4 問・70 分・隠しテスト・厳格採点チェック付き。全 3 回。',
      lead: '第 1 回〜第 3 回まで、すべて問1=動的割当て(B5)・問2=単方向リスト(B6)・問3=ソーティング(B7)・問4=db_t 二分探索(B8) の本番直結構成。「テスト実行」を押すと diff -Bw だけでなく「sizeof を使っているか」「確保バイト数が正確か」「メモリリークがないか」「本当に二分探索か」まで本番基準で自動判定します!',
      blocks: [
        { type: 'widget', title: '<span class="chip ptr">TIMER</span> 70 分タイマーと得点ボード', make: examTimer },
        { type: 'widget', title: '<span class="chip vio">3 SETS</span> 全 3 回の出題一覧 — クリックで問題を開く', make: setOverview },
        { type: 'callout', kind: 'tip', html: '<b>合格への時間配分</b>: まず 4 問すべてに目を通し (3 分)、一番得意な 2 問から確実に <code class="ic">diff -Bw</code> を通して <b>10 点 (合格ライン)</b> を確保しよう。そのあと 3 問目・4 問目に進むのが鉄板の戦い方です!' },
        { type: 'lab' },
      ],
    },

    {
      id: 'final', num: '07', group: 'まとめ', kicker: 'Last Night Check', navTitle: '前日の最終確認',
      title: '試験直前、この 8 枚だけ頭に入れて入室する。',
      blocks: [
        { type: 'cheat', items: [
          { c: 'sizeof 必須!', d: '<code class="ic">malloc(sizeof(double) * n)</code>。数値の直書き (<code class="ic">8 * n</code>) は即 0 点!', code: 'malloc(sizeof(int) * n)' },
          { c: '文字列は +1', d: '末尾 <code class="ic">\'\\0\'</code> の分を足して <code class="ic">sizeof(char) * (strlen(s) + 1)</code>。固定長確保は NG!', code: 'strlen(s) + 1' },
          { c: 'NULL 検査', d: 'サンプルプログラムからコピーして OK: <code class="ic">if (p == NULL) { fprintf(stderr, ...); exit(1); }</code>', code: 'if (p == NULL) exit(1);' },
          { c: 'リストの開始位置', d: '<b>読むだけ</b> (表示・探索) は <code class="ic">head-&gt;next</code> から。<b>挿入・削除</b>は <code class="ic">head</code> から <code class="ic">p-&gt;next</code> 先読み!', code: 'for (p=head; p->next!=NULL; p=p->next)' },
          { c: '削除は退避→free', d: '<code class="ic">del = p-&gt;next; p-&gt;next = del-&gt;next; free(del);</code> の順番を守る。', code: 'free(del);' },
          { c: '選択法 vs 挿入法', d: '選択法は <code class="ic">min</code> 添字を探して交換。挿入法は <code class="ic">i=k</code> から左へ <code class="ic">a[i-1] &lt;= a[i]</code> で <code class="ic">break</code>。', code: 'double tmp; /* 型に注意! */' },
          { c: '二分探索の <=', d: '<code class="ic">low = 0; high = db-&gt;n - 1; while (low &lt;= high)</code>。更新は <code class="ic">mid + 1</code> と <code class="ic">mid - 1</code>!', code: 'mid = (low + high) / 2;' },
          { c: 'Dドライブ・diff -Bw', d: '試験用アカウントをログアウトしない。指定フォルダ・指定ファイル名で保存し <code class="ic">diff -Bw</code> 無出力を確認!', code: '$ diff -Bw out.txt exp.txt' },
        ] },
        { type: 'widget', title: 'T2 練習記録', make: () => {
          const p = store.get('progress:t2', { predict: {}, tasks: {} });
          const per = Object.keys(SETS).map((k) => SETS[k].ids.filter((i) => p.tasks[i] === 'done').length);
          const n = Math.max(...per);
          const passed = per.filter((x) => x >= 2).length;
          const ck = Object.values(store.get('t2:ck', {})).filter(Boolean).length;
          return Infog.make({ kind: 'stats', tag: 'READY FOR T2?', title: 'あなたの T2 準備状況', items: [
            { value: n * 5, suffix: '点', label: '模擬試験の最高点 (20 点満点)', color: n >= 2 ? 'ok' : 'ptr' },
            { value: passed, suffix: ' / 3', label: '合格ライン (10 点) を超えた回', color: passed ? 'ok' : 'ptr' },
            { value: ['p0', 'p1'].filter((i) => p.predict[i]).length, suffix: ' / 2', label: '予想問題クリア数', color: 'addr' },
            { value: ck, label: '当日手順チェック完了項目', color: 'vio' },
          ] });
        } },
        { type: 'callout', kind: 'info', html: '試験の正式な仕様・指示は配布資料「2026 年度 プログラミング実習 III 中間試験 T2 について」および試験当日の教員の指示に従ってください。本ページの模擬問題は予告範囲に基づき作成した練習問題です。' },
      ],
    },
  ];

  window.UNITS = window.UNITS || {};
  window.UNITS.t2 = {
    title: '中間試験 T2 対策',
    source: '2026 年度 プログラミング実習 III 中間試験 T2 について',
    hero,
    chapters,
    tasks: window.T2_TASKS || [],
    predictCount: 2,
    noReport: true,
  };
})();
