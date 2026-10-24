/* =========================================================================
 *  T1 中間試験対策 — 章コンテンツ
 *  出典: 「2026 年度 プログラミング実習 III 中間試験 T1 について」(T1-yokoku.pdf)
 * ========================================================================= */
(function () {
  'use strict';
  const { h, icon, store, toast } = U;
  const R = String.raw;
  const D = window.T1_DATA || { files: {}, tests: {}, sample: {} };
  const S = D.sample || {};
  const SAMPLE = D.files['sample.c'] || '';

  /* ---------- ドリル用ファイル (gcc で確認済み) ---------- */
  const MM = {
    h: 'void minmax(int a, int b, int c, int *mn, int *mx);\n',
    main: R`#include <stdio.h>
#include "mm.h"

int main(void)
{
  int a, b, c, mn, mx;
  while (1) {
    fprintf(stderr, "a b c = ");
    if (scanf("%d%d%d", &a, &b, &c) == EOF) { break; }
    minmax(a, b, c, &mn, &mx);
    printf("min = %d, max = %d\n", mn, mx);
  }
  return 0;
}
`,
    bug: R`#include "mm.h"

void minmax(int a, int b, int c, int *mn, int *mx)
{
  *mn = a;
  *mx = a;
  if (b < *mn) { *mn = b; }
  if (b > *mx) { *mx = b; }
  if (c > *mx) { *mx = c; }
}
`,
    good: R`#include "mm.h"

void minmax(int a, int b, int c, int *mn, int *mx)
{
  *mn = a;
  *mx = a;
  if (b < *mn) { *mn = b; }
  if (c < *mn) { *mn = c; }
  if (b > *mx) { *mx = b; }
  if (c > *mx) { *mx = c; }
}
`,
    in: '1 2 3\n9 -4 5\n7 7 2\n',
    exp: 'min = 1, max = 3\nmin = -4, max = 9\nmin = 2, max = 7\n',
    expSp: 'min = 1,  max = 3\n\nmin = -4, max =  9\nmin = 2, max = 7   \n\n',
  };

  /* ---------- 70 分タイマー + 得点ボード ---------- */
  const TKEY = 't1:timer';
  const LIMIT = 70 * 60 * 1000;
  function examTimer() {
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
    const el = h('div.t1-timer', ring, h('div.t1-tside', h('div.t1-tbtn', bStart, bReset), score, board,
      h('p.c-mute.t1-tnote', 'タイマーはページを閉じても進み続けます (本番と同じく止まらない)。問1〜問4 を「テスト実行」で隠しテストまで通すと得点が入ります。')));
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
      [[35, '折り返し — 残り 35 分。解けた問題の保存場所とファイル名を確認しよう'], [10, '残り 10 分 — 新しい問題より, 見直しと diff -Bw の確認を'], [5, '残り 5 分!']].forEach(([m, msg]) => {
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
      const p = store.get('progress:t1', { predict: {}, tasks: {} });
      const ids = ['q1', 'q2', 'q3', 'q4'];
      const pts = ids.filter((i) => p.tasks[i] === 'done').length * 5;
      board.innerHTML = '';
      ids.forEach((i, k) => board.appendChild(h('a.t1-q' + (p.tasks[i] === 'done' ? '.done' : p.tasks[i] === 'try' ? '.try' : ''), { href: '#task-' + i, onclick: (e) => { e.preventDefault(); const T = window.__t1open; if (T) T(i); } }, h('b', '問' + (k + 1)), h('span', p.tasks[i] === 'done' ? '5 点' : p.tasks[i] === 'try' ? '挑戦中' : '—'))));
      score.innerHTML = '';
      score.append(h('div.t1-pts', h('b', String(pts)), h('span', '/ 20 点')), h('div.t1-bar', h('i', { style: { width: pts * 5 + '%' } }), h('s', { title: '合格ライン 10 点' })), h('div.t1-pass' + (pts >= 10 ? '.ok' : ''), pts >= 10 ? '✓ 合格ライン (10 点) 到達!' : 'あと ' + (10 - pts) + ' 点で合格ライン'));
    }
    window.__t1upd = upd;
    upd(); draw();
    setInterval(draw, 500);
    setInterval(upd, 1500);
    return el;
  }

  /* ---------- 当日の手順チェックリスト ---------- */
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

  /* ---------- 重点問題まとめ (資料「特に復習」の 7 題) ---------- */
  const REVIEW = [
    { id: '例題 (3-4)', grp: 'A', title: 'triple — 2 つの変数をそれぞれ 3 倍', href: '/b3#func', files: 'triple.c (1 ファイル)',
      ask: 'int 型変数へのポインタ p, q を受け取り, <b>p の指す変数と q の指す変数をそれぞれ 3 倍</b>する <code class="ic">void triple(int *, int *)</code>。main から呼んで, 実際に 3 倍されることを確認する。',
      need: ['<code class="ic">int *p</code> — ポインタ型の仮引数', '<code class="ic">*p = 3 * *p;</code> — 指す先を読んで書き戻す', '<code class="ic">triple(&x, &y);</code> — 値でなく番地を渡す'],
      steps: ['仮引数を <code class="ic">int *p, int *q</code> にする', '本体で <code class="ic">*p</code>, <code class="ic">*q</code> を 3 倍', 'main で <code class="ic">&x</code>, <code class="ic">&y</code> を渡して呼ぶ', 'printf で <code class="ic">x = 3, y = 6</code> を確認'],
      trap: '<code class="ic">p = 3 * p;</code> (アスタリスク忘れ) は番地を 3 倍してしまう。<code class="ic">triple(x, y)</code> は値のコピーが渡るだけで元は変わらない。',
      code: 'void triple(int *p, int *q)\n{\n  *p = 3 * *p;\n  *q = 3 * *q;\n}\n/* main: triple(&x, &y); */' },
    { id: '課題 (3-4)', grp: 'A', title: 'divrem — 商を *q, 剰余を *r に', href: '/b3#task-3-4', files: 'divrem.c (空欄埋め)',
      ask: 'x を y で割った<b>商を q 番地</b>, <b>剰余を r 番地</b>に格納する <code class="ic">void divrem(int x, int y, int *q, int *r)</code> を完成させ, main の呼び出しの空欄を埋める。期待出力 <code class="ic">x / y = 3 ... 1</code>。',
      need: ['整数の商 <code class="ic">x / y</code> と剰余 <code class="ic">x % y</code>', '入力用 (値) と出力用 (ポインタ) の引数の区別', '呼び出し側の <code class="ic">&q, &r</code>'],
      steps: ['本体に <code class="ic">*q = x / y;</code> と <code class="ic">*r = x % y;</code>', '空欄に <code class="ic">x, y, &q, &r</code>', 'gcc → 実行 → <code class="ic">x / y = 3 ... 1</code>'],
      trap: '空欄を <code class="ic">x, y, q, r</code> とすると「int を int* に渡した」警告 + 実行時におかしな値。返したい値が 2 つ = return では足りない = ポインタ。',
      code: 'void divrem(int x, int y, int *q, int *r)\n{\n  *q = x / y;\n  *r = x % y;\n}\n/* main: divrem(x, y, &q, &r); */' },
    { id: '課題 (3-5)', grp: 'A', title: 'ave — 相加平均と相乗平均 (分割コンパイル)', href: '/b3#task-3-5', files: 'ave6.c + ave6.h + ave6main.c',
      ask: '<code class="ic">void ave(double a, double b, double *p_a, double *p_m)</code> を <b>ave6.c</b> に作り, 相加平均 (a+b)/2 を p_a 番地, 相乗平均 √(ab) を p_m 番地へ。ave6.h をインクルードし, ave6main.c とリンク。',
      need: ['<code class="ic">#include "ave6.h"</code> と <code class="ic">&lt;math.h&gt;</code>', 'sqrt と <code class="ic">-lm</code>', '<b>2 ファイルの分割コンパイル</b>とリダイレクト + diff'],
      steps: ['ave6.c に include 2 行と関数本体を書く', '<code class="ic">gcc ave6main.c ave6.c -lm</code>', '<code class="ic">./a &lt; ave-in.txt &gt; out.txt</code>', '<code class="ic">diff -Bw out.txt ave-exp.txt</code> が何も出さない'],
      trap: 'ave6.c に main を書かない (main は ave6main.c にある → multiple definition)。<code class="ic">(a + b) / 2</code> は double なので OK だが, int 同士の割り算には注意。',
      code: '#include <math.h>\n#include "ave6.h"\n\nvoid ave(double a, double b, double *p_a, double *p_m)\n{\n  *p_a = (a + b) / 2.0;\n  *p_m = sqrt(a * b);\n}' },
    { id: '例題 (3-5)', grp: 'B', title: 'item_t — 構造体へのポインタで読む・書き換える・出す', href: '/b3#struct', files: '1 ファイル (item_t を typedef)',
      ask: '<code class="ic">int item_scan(item_t *a)</code> (name, price, weight を読む。EOF なら EOF, 成功で 1), <code class="ic">void item_double_price(item_t *a)</code> (price を 2 倍), <code class="ic">void item_print(item_t *a)</code> (<code class="ic">name,price,weight</code> を出力)。main は EOF まで「読む → 2 倍 → 出力」。',
      need: ['<code class="ic">x-&gt;price</code> (= <code class="ic">(*x).price</code>)', '文字列メンバーの読込は <code class="ic">scanf(NM_FMT, x-&gt;name)</code> — <b>& を付けない</b>', '数値メンバーは <code class="ic">&x-&gt;price</code>', 'EOF を返り値で伝える関数の形'],
      steps: ['typedef struct で item_t を定義 (name[NM_LEN+1], price, weight)', 'item_scan: 3 つの scanf, どれかが EOF なら <code class="ic">return EOF;</code>', 'item_double_price: <code class="ic">x-&gt;price = x-&gt;price * 2;</code>', 'item_print: <code class="ic">"%s" ",%d" ",%0.2f" "\\n"</code>', 'main: <code class="ic">for (;;) { if (item_scan(&a)==EOF) break; … }</code>'],
      trap: '値渡し <code class="ic">item_double_price(item_t x)</code> だと<b>コピーが 2 倍されるだけ</b>で a は変わらない (B3 の予想問題)。出力のカンマ・小数桁は diff -Bw でも見逃されない。',
      code: 'int item_scan(item_t *x)\n{\n  fprintf(stderr, "name = ");\n  if (scanf(NM_FMT, x->name)==EOF) { return EOF; }\n  fprintf(stderr, "price = ");\n  if (scanf("%d", &x->price)==EOF) { return EOF; }\n  fprintf(stderr, "weight = ");\n  if (scanf("%lf", &x->weight)==EOF) { return EOF; }\n  return 1;\n}' },
    { id: '課題 (3-7)', grp: 'B', title: 'dist5 — point_scan と dist', href: '/b3#task-3-7', files: 'dist5.c + dist5.h + dist5main.c',
      ask: '<code class="ic">int point_scan(point_t *p)</code> (x, y を読む。EOF なら EOF, そうでなければ 1) と <code class="ic">double dist(point_t *p1, point_t *p2)</code> (2 点間の距離) を <b>dist5.c</b> に。dist5.h, stdio.h, math.h をインクルードし dist5main.c とリンク。',
      need: ['<code class="ic">&p-&gt;x</code> を scanf に渡す', '√((x₁−x₂)² + (y₁−y₂)²) — sqrt と <code class="ic">-lm</code>', 'EOF 判定 → 返り値', '分割コンパイル + diff (dist-in.txt / dist-exp.txt)'],
      steps: ['dist5.c に include 3 行', 'point_scan: <code class="ic">if (scanf("%lf", &p-&gt;x)==EOF) return EOF;</code> (y も)', 'dist: dx, dy を作って <code class="ic">return sqrt(dx*dx + dy*dy);</code>', '<code class="ic">gcc dist5main.c dist5.c -lm</code>', 'リダイレクト → <code class="ic">diff -Bw</code>'],
      trap: 'point_scan の中でプロンプトを出すなら <b>stderr</b>。dist5.h の typedef を dist5.c にもう一度書くと型の重複定義エラー。',
      code: 'int point_scan(point_t *p)\n{\n  if (scanf("%lf", &p->x)==EOF) { return EOF; }\n  if (scanf("%lf", &p->y)==EOF) { return EOF; }\n  return 1;\n}\n\ndouble dist(point_t *p1, point_t *p2)\n{\n  double dx = p1->x - p2->x, dy = p1->y - p2->y;\n  return sqrt(dx*dx + dy*dy);\n}' },
    { id: '課題 (3-10)', grp: 'C', title: 'dice3 — サイコロ 3 個の目の和の分布', href: '/b3#task-3-10', files: 'dice3sub.c + dice3sub.h + dice3.c',
      ask: '<code class="ic">void dice_throw(int d[ ], int n)</code> (1〜6 の一様乱数を n 個 d[ ] へ) と <code class="ic">void dice3_distr(int n, int d1[ ], int d2[ ], int d3[ ], int c[ ])</code> (和 s の出現回数を c[s] に数える) を <b>dice3sub.c</b> に。dice3.c とリンク。',
      need: ['<code class="ic">rand() % 6 + 1</code> と <code class="ic">&lt;stdlib.h&gt;</code>', '配列引数 <code class="ic">int d[ ]</code> (先頭の番地が渡る → 書き込みは呼び出し元に残る)', '<b>カウンタの 0 初期化</b> (dice3.c は c[ ] に rand() のゴミを入れてから呼ぶ)', 'D3_MIN〜D3_MAX のマクロ'],
      steps: ['dice_throw: <code class="ic">for (i=0; i&lt;n; i++) d[i] = rand() % 6 + 1;</code>', 'dice3_distr: まず <code class="ic">c[D3_MIN]〜c[D3_MAX] = 0</code>', '<code class="ic">c[d1[i] + d2[i] + d3[i]]++;</code>', '<code class="ic">gcc dice3.c dice3sub.c</code> → 実行して合計が n になるか確認'],
      trap: 'srand は dice3.c が呼んでいるので<b>自分では呼ばない</b> (乱数列が変わり期待値と合わなくなる)。初期化を忘れると巨大な数が出る。',
      code: 'void dice3_distr(int n, int d1[], int d2[], int d3[], int c[])\n{\n  int i, s;\n  for (s=D3_MIN; s<=D3_MAX; s++) { c[s] = 0; }\n  for (i=0; i<n; i++) {\n    c[d1[i] + d2[i] + d3[i]]++;\n  }\n}' },
    { id: '課題 (4-1)', grp: 'D', title: 'matrix.c — 行列・ベクトルの関数群 (1)〜(7)', href: '/b4#task-4-1-1', files: 'matrix.c + matrix.h + matrixKtest.c',
      ask: 'n×n 行列 (N = 8) の関数を matrix.c に作る: (1) matrix_print の書式 <code class="ic">" %9.5f"</code>, (2) matrix_scan (プロンプトは stderr), (3) matrix_sum, (4) matrix_trans2 (転置を Y へ), (5) matrix_trans1 (<b>A 以外の配列を使わず</b>自分を転置), (6) vector_scan / vector_print, (7) matrix_vector_prod (y = Ax)。',
      need: ['2 次元配列の仮引数 <code class="ic">double A[N][N]</code> (列数 N は省略不可)', '2 重ループ (積は 3 重ではなく i, j の 2 重 + 足し込み)', '<b>上限は n</b> (N ではない)', 'tmp を使った交換と「半分だけ」のループ (j = i+1 から)', '書式を期待値に合わせる (幅 9, 小数 5 桁)'],
      steps: ['(1) printf を <code class="ic">" %9.5f"</code> にして matrix1test.c と diff', '(2) 2 重ループで <code class="ic">scanf("%lf", &A[i][j])</code>', '(3)(4) <code class="ic">Y[i][j] = A[i][j] + B[i][j];</code> / <code class="ic">Y[i][j] = A[j][i];</code>', '(5) <code class="ic">for (j=i+1; j&lt;n; j++)</code> で tmp 交換', '(7) <code class="ic">y[i] = 0;</code> → <code class="ic">y[i] += A[i][j] * x[j];</code>', '毎回 <code class="ic">gcc matrixKtest.c matrix.c</code> → in.txt → diff -Bw'],
      trap: 'trans1 で j を 0 から回すと<b>2 回交換して元通り</b>。y[i] の初期化忘れ。matrix.c に main を書かない (テスト側にある)。',
      code: 'void matrix_trans1(int n, double A[N][N])\n{\n  int i, j;\n  double tmp;\n  for (i=0; i<n; i++) {\n    for (j=i+1; j<n; j++) {\n      tmp = A[i][j]; A[i][j] = A[j][i]; A[j][i] = tmp;\n    }\n  }\n}' },
  ];
  const GRP = { A: ['var(--pink)', '型 A 値を複数返す', '問1'], B: ['var(--lav)', '型 B 構造体ポインタ', '問2'], C: ['var(--mint)', '型 C 配列と乱数', '問3'], D: ['var(--lemon)', '型 D 2 次元配列', '問4'] };
  function reviewCards() {
    const doneKey = 't1:rv';
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
        h('details.rv-code', h('summary', '要点のコード (自分で書いてから開く)'), U.codeBlock(r.code)),
        h('div.rv-foot', h('label.rv-chk', cb, h('span.ck-box', { 'aria-hidden': 'true' }), h('span', '何も見ずに書ける / 説明できる')), h('a.btn.sm', { href: r.href }, '元の課題で練習', icon('arrow'))));
      const card = h('details.rv-card' + (done[r.id] ? '.ok' : ''), { style: { '--rc': g[0], '--k': k }, open: k === 0 },
        h('summary.rv-head', h('span.rv-id', r.id), h('span.rv-t', r.title), h('span.rv-meta', h('span.rv-grp', g[1]), h('span.rv-f', r.files), h('span.rv-mock', '→ 模擬 ' + g[2])), h('span.rv-arrow', { 'aria-hidden': 'true' }, '▾')),
        body);
      return card;
    }));
    upd();
    return h('div', h('div.rv-top', h('div.rv-meter', meter, h('span', ' / 7 題 「何も見ずに書ける」')), h('div.rv-btns', h('button.btn.sm.ghost', { onclick: () => list.querySelectorAll('details.rv-card').forEach((d) => (d.open = true)) }, 'すべて開く'), h('button.btn.sm.ghost', { onclick: () => list.querySelectorAll('details.rv-card').forEach((d) => (d.open = false)) }, 'すべて閉じる'))), list);
  }

  /* 本番での 1 問の解き方 (共通ステップ) */
  const EXAM_STEPS = [
    { n: '1', t: '問題を読む (2 分)', d: '<b>作るファイル名・関数名・引数の型</b>に下線。配布ファイル (main 側, .h) と期待値を確認。「何を返すか」「どこに格納するか」を一言で言えるように。' },
    { n: '2', t: 'ファイルを用意する', d: '問題からテストデータ・期待値・配布プログラムを<b>コピー＆ペースト</b>して D ドライブの指定フォルダに保存 (<code class="ic">in.txt</code>, <code class="ic">exp.txt</code> …)。<code class="ic">ls</code> で名前を確認。' },
    { n: '3', t: '関数の「外枠」を書く', d: '#include (.h と標準ヘッダ) とプロトタイプどおりの関数の外枠だけ書き, <b>先に gcc を通す</b>。リンクまで通ればファイル構成は正しい。' },
    { n: '4', t: '中身を書く', d: 'ポインタなら <code class="ic">*p =</code> / <code class="ic">p-&gt;x</code>, 配列なら<b>初期化</b>と<b>上限 n</b>。サンプルプログラムの書き方 (EOF, strcmp, exit) を写してよい。' },
    { n: '5', t: 'gcc → リダイレクト → diff -Bw', d: '<code class="ic">gcc main.c sub.c -lm</code> → <code class="ic">./a &lt; in.txt &gt; out.txt</code> → <code class="ic">diff -Bw out.txt exp.txt</code>。<b>何も表示されなければ一致</b>。' },
    { n: '6', t: '別の入力でも試す', d: '採点は問題にない入力でも行われる。<b>n を変える・負の値・0・境界</b>を自分で作って手計算と比べる。' },
    { n: '7', t: '保存場所の最終確認', d: '指定フォルダ・指定ファイル名か, 余計な main が入っていないか。<b>2 問を完璧に</b> → 合格。迷ったら次の問題へ。' },
  ];
  function examSteps() {
    return h('ol.xs', EXAM_STEPS.map((s, k) => h('li.xs-i', { style: { '--k': k } }, h('span.xs-n', s.n), h('div', h('b', s.t), h('p', { html: s.d })))));
  }

  /* ---------- 重点復習マップ ---------- */
  function focusMap() {
    const items = [
      { tag: '例題 (3-4)', t: 'triple — ポインタ引数で 3 倍', href: '/b3#func', c: 'pink', mock: '問1' },
      { tag: '課題 (3-4)', t: 'divrem — 商と剰余を *q, *r に', href: '/b3#task-3-4', c: 'pink', mock: '問1' },
      { tag: '課題 (3-5)', t: 'ave — 相加・相乗平均を *p_a, *p_m に', href: '/b3#task-3-5', c: 'pink', mock: '問1' },
      { tag: '例題 (3-5)', t: '構造体へのポインタ p->x', href: '/b3#struct', c: 'lav', mock: '問2' },
      { tag: '課題 (3-7)', t: 'dist5 — point_scan と dist', href: '/b3#task-3-7', c: 'lav', mock: '問2' },
      { tag: '課題 (3-10)', t: 'dice3 — サイコロ 3 個の分布', href: '/b3#task-3-10', c: 'mint', mock: '問3' },
      { tag: '課題 (4-1)', t: 'matrix.c — 行列の入出力・和・転置・積', href: '/b4#task-4-1-1', c: 'lemon', mock: '問4' },
    ];
    const p3 = store.get('progress:b3', { tasks: {} }).tasks, p4 = store.get('progress:b4', { tasks: {} }).tasks;
    const st = (it) => { const m = /#task-(.+)$/.exec(it.href); if (!m) return null; return (it.href.startsWith('/b3') ? p3 : p4)[m[1]]; };
    return h('div.fmap', items.map((it, k) => {
      const s = st(it);
      return h('a.fm-card', { href: it.href, style: { '--fc': 'var(--' + it.c + ')', '--k': k } },
        h('div.fm-tag', it.tag),
        h('div.fm-t', it.t),
        h('div.fm-f', h('span.chip' + (s === 'done' ? '.ok' : ''), s === 'done' ? '✓ クリア済み' : s === 'try' ? '挑戦中' : it.href.includes('#task-') ? '未着手' : '解説を読む'), h('span.fm-mock', '→ 模擬 ' + it.mock), icon('arrow')));
    }));
  }

  /* ---------- 採点の流れ (diff -Bw 体験) ---------- */
  function bwLab() {
    const exp = 'min = 1, max = 3\nmin = -4, max = 9\n';
    const cases = [
      ['空白の数が違う', 'min = 1,  max = 3\nmin = -4, max =  9\n', true],
      ['空行が入っている', 'min = 1, max = 3\n\nmin = -4, max = 9\n\n', true],
      ['プロンプトが stdout に混入', 'a b c = min = 1, max = 3\na b c = min = -4, max = 9\n', false],
      ['カンマが抜けている', 'min = 1 max = 3\nmin = -4, max = 9\n', false],
      ['大文字になっている', 'Min = 1, Max = 3\nmin = -4, max = 9\n', false],
      ['改行が足りない (1 行に)', 'min = 1, max = 3 min = -4, max = 9\n', false],
    ];
    const ShellDiff = window.ShellDiff;
    const out = h('div.bw-out');
    const pre = h('pre.bw-pre');
    const btns = h('div.bw-btns');
    function show(k) {
      [...btns.children].forEach((b, j) => b.classList.toggle('on', j === k));
      const [lab, txt, same] = cases[k];
      const d = ShellDiff ? ShellDiff(txt, exp, { w: true, B: true }) : [];
      const ok = d.length === 0;
      pre.textContent = txt.replace(/ /g, '·').replace(/\n/g, '⏎\n');
      out.innerHTML = '';
      out.append(...[h('div.bw-v.' + (ok ? 'ok' : 'ng'), ok ? '✓ diff -Bw は何も表示しない → 正解扱い' : '✗ diff -Bw で差分あり → 0 点'),
        d.length ? h('pre.bw-d', d.join('\n')) : null,
        h('div.c-mute', { style: { fontSize: '12.5px', marginTop: '6px' } }, same === ok ? lab + ': ' + (ok ? '-B は空行の違い, -w は空白の違いを無視する。' : '空白・空行以外の違いは 1 文字でも不一致。') : '')].filter(Boolean));
    }
    cases.forEach((c, k) => btns.appendChild(h('button.bw-b', { onclick: () => show(k) }, c[0])));
    setTimeout(() => show(0), 0);
    return h('div.bwlab', h('div.bw-l', h('div.bw-h', 'あなたの出力 (out.txt) ', h('small', '· = 空白, ⏎ = 改行')), btns, pre), h('div.bw-r', h('div.bw-h', '期待値 (exp.txt)'), h('pre.bw-pre.exp', exp.replace(/ /g, '·').replace(/\n/g, '⏎\n')), out));
  }

  function hero(heroMem) {
    return h('section.u-hero.t1-hero',
      h('div.u-hero-grid',
        h('div',
          h('div.code-id', 'MIDTERM T1 — PRACTICAL EXAM'),
          h('h1', '中間試験 T1', h('br'), h('em', 'diff -Bw')),
          h('p.tag', '70 分・4 問・持ち込み不可の実技試験。', h('br'), h('span', '部分点なし, 隠しテストあり。だから「ちゃんと動く」を自分で確かめる力が全て。')),
          h('div.u-stats',
            h('div', h('b', '4'), '問 (各 5 点)'),
            h('div', h('b', '10'), '点以上で合格'),
            h('div', h('b', '70'), '分')),
          h('div.cta',
            h('a.btn.ptr', { href: '#mock' }, '模擬試験を受ける', icon('arrow')),
            h('a.btn', { href: '#format' }, '試験の形式'),
            h('a.btn.ghost', { href: '#procedure' }, '当日の手順'))),
        heroMem()));
  }

  const chapters = [
    {
      id: 'format', num: '00', group: 'はじめに', kicker: '試験の形式', navTitle: '試験の形式',
      title: '演習室の PC で, 何も見ずに, 70 分で 4 問。',
      lead: 'T1 はプログラムを作成する実技試験。インターネットからは切断され, これまで自分が書いたプログラムも見られない。頼れるのは当日配布のサンプルプログラムと, 自分の手だけ。',
      blocks: [
        { type: 'cheat', items: [
          { c: '実技試験', d: '演習室の PC で実施。<b>Cygwin</b> と <b>VSCode / サクラエディタ</b>など演習室で使えるエディタを使う。', code: '$ gcc q1.c\n$ ./a < in.txt > out.txt' },
          { c: '持ち込み不可', d: '<b>時計と筆記用具のみ</b>可。PC はインターネットから切断。WWW も過去の自作プログラムも参照不可。', code: '/* 頼れるのは\n   サンプルプログラムだけ */' },
          { c: '4 問 × 5 点', d: '20 点満点中 <b>10 点以上で合格</b>。つまり <b>2 問を完璧に</b>解けば合格。', code: '5 + 5 + 0 + 0 = 10  /* 合格 */' },
          { c: '電子ファイルで出題', d: '問題は電子ファイル。動作確認用プログラムやテストデータは<b>コピー＆ペースト</b>できる。', code: '/* 期待値を手で打たない */' },
        ] },
      ],
    },
    {
      id: 'scoring', num: '01', group: 'はじめに', kicker: '採点基準', navTitle: '採点基準 — diff -Bw',
      title: '部分点はない。1 文字の違いで 0 点。',
      lead: '期待値が与えられた問題は, あなたの出力と期待値を diff -Bw で照合する。さらに問題文にない入力でも確かめ, 題意どおりに書かれているかもチェックされる。',
      blocks: [
        { type: 'point', n: 1, title: '<code>diff -Bw</code> — <b>空行 (-B)</b> と <b>空白 (-w)</b> の違いだけは許される', sub: 'それ以外 (カンマ, 大文字小文字, 改行の位置, プロンプトの混入…) は 1 文字でも不一致 = 不正解。' },
        { type: 'widget', title: '<span class="chip ptr">体験</span> どの出力なら diff -Bw を通る?', make: bwLab },
        { type: 'point', n: 2, title: '与えられた diff が通っても<b>正解とは限らない</b>', sub: '採点では<b>問題に書かれていない入力</b>でも動かす (隠しテスト)。入力値をそのまま出力するような「期待値合わせ」や, ループ上限の決め打ちは通らない。' },
        { type: 'mistakes', items: [
          { title: 'プロンプトを printf で出してしまう', code: '#include <stdio.h>\n\nint main(void)\n{\n  int n;\n  printf("n = ");\n  scanf("%d", &n);\n  printf("%d\\n", n * n);\n  return 0;\n}\n', stdin: '7', fix: 'プロンプトは <code class="ic">fprintf(stderr, "n = ");</code>。stdout に出すと <b>out.txt に混ざり diff が合わない</b>。B1 で最初に学んだ, 一番多い 0 点の原因。' },
          { title: 'ループ上限を数値で決め打ち', code: '#include <stdio.h>\n#define N 4\n\nvoid print_diag(int n, double A[N][N])\n{\n  int i;\n  for (i=0; i<2; i++) {\n    printf("%.1f\\n", A[i][i]);\n  }\n}\n\nint main(void)\n{\n  double A[N][N] = {{1,2},{3,4}};\n  print_diag(2, A);\n  return 0;\n}\n', fix: '問題の例が 2×2 でも, 隠しテストは 3×3 や 1×1 かもしれない。上限は引数の <code class="ic">n</code> を使う: <code class="ic">for (i=0; i&lt;n; i++)</code>' },
        ] },
      ],
    },
    {
      id: 'procedure', num: '02', group: 'はじめに', kicker: '試験の手順と注意事項', navTitle: '当日の手順',
      title: 'ファイル名とフォルダを間違えたら, 採点されない。',
      lead: '手順のミスは実力と関係なく 0 点になる。前日にこのチェックリストを一度通しておこう (チェックは自動保存)。',
      blocks: [
        { type: 'widget', title: '当日の手順チェックリスト', make: () => checklist('t1:ck', [
          { step: '0', title: '入室まで', items: [{ t: '入室許可があるまで<b>室外で待機</b>する' }, { t: '時計と筆記用具だけを持っている (他は持ち込み不可)' }] },
          { step: '1', title: '入室から試験開始まで', items: [{ t: '<b>指定座席</b>に着席する' }, { t: '<b>試験用アカウント</b>でログイン済み — <b>ログアウト / 再起動 / シャットダウンしない</b>', crit: true }, { t: 'コンパイル・実行は <b>Z ドライブではなく D ドライブ</b>で (手順は当日指示)', crit: true }] },
          { step: '2', title: '試験開始から終了まで', items: [{ t: 'プログラムは<b>指定された名前</b>で, <b>指定されたフォルダ</b>に保存する (間違えると採点対象外)', crit: true }, { t: 'テストデータ・期待値は問題ファイルから<b>コピー＆ペースト</b>してファイルに保存する' }, { t: '<code class="ic">./a &lt; in.txt &gt; out.txt</code> → <code class="ic">diff -Bw out.txt exp.txt</code> で何も表示されないことを確認' }, { t: '問題文に書かれていない入力 (境界値・負の値など) でも試した' }, { t: 'PC が応答しないなどのトラブルは<b>速やかに教員に申し出る</b>' }] },
        ]) },
        { type: 'callout', kind: 'warn', html: '本番の PC は <b>Windows + Cygwin</b>。実行ファイルは <code class="ic">a.exe</code> で, 実行は <code class="ic">./a</code>。<code class="ic">ls</code> で保存したファイル名を必ず目で確認しよう (<code class="ic">hms.c</code> と <code class="ic">hms.c.txt</code> は別物)。' },
      ],
    },
    {
      id: 'sample', num: '03', group: '1. サンプルプログラム', kicker: '試験当日に配布', navTitle: 'サンプルプログラム',
      title: '当日の唯一の「資料」を, 今のうちに読み解く。',
      lead: '試験当日に配布されるサンプルプログラム。乱数・文字列・配列の読み込み・EOF・異常終了・関数の書き方がこの 1 ファイルに詰まっている。どこに何が書いてあるか覚えておけば, 本番でコピーして使える。',
      blocks: [
        { type: 'code', title: 'sample.c (配布資料のまま)', code: SAMPLE },
        { type: 'cheat', items: [
          { c: '#include 4 つ', d: '<b>stdio.h</b> 入出力 / <b>math.h</b> sqrt, fabs / <b>stdlib.h</b> rand, exit / <b>string.h</b> strcpy, strlen, strcmp。何を使うにはどれが必要か, ここで分かる。', code: '#include <math.h>  /* gcc ... -lm */' },
          { c: 'int_rand', d: '<b>RAND_MAX</b> と rand() の値。srand を呼ばないので<b>毎回同じ乱数列</b> → 乱数の問題も diff で採点できる。', code: 'rand() % 6 + 1   /* 1〜6 */' },
          { c: 'str_scan_cpy', d: '<b>STR_FMT "%31s"</b> で 31 文字までに制限して読む (配列は STR_LEN+1 = 32: 末尾の \\0 の分)。代入は <b>strcpy</b>, 比較は <b>strcmp(…) == 0</b>。', code: 'scanf(STR_FMT, name2);\nif (strcmp(name1, name2) == 0)' },
          { c: 'double_scan_sqrt', d: '最大 N_ARRAY 個を <b>EOF まで</b>読み込む定番の形。読めた個数が n に残る。', code: 'if (scanf("%lf", &a[n]) == EOF) { break; }' },
          { c: 'exit(1)', d: '異常 (負の値) を見つけたら stderr にメッセージを出して<b>その場でプログラムを終了</b>。stdout にはそれ以降何も出ない。', code: 'fprintf(stderr, "a[%d]<0", i);\nexit(1);' },
          { c: 'mult', d: '値を受け取って値を返す関数の最小形。<code class="ic">a[i] = mult(sqrt(a[i]), a[i]);</code> は √a × a = a<sup>1.5</sup>。', code: 'double mult(double x, double y)' },
        ] },
        { type: 'predict', id: 'p0', files: { 'sample.c': SAMPLE }, units: ['sample.c'], stdin: 'Apple\n1 4 9\n', q: '入力 <code class="ic">Apple</code> ⏎ <code class="ic">1 4 9</code> で実行したとき, 最後の 3 行は?', choices: ['<code>1.000 / 2.000 / 3.000</code>', '<code>1.000 / 8.000 / 27.000</code>', '<code>1.000 / 16.000 / 81.000</code>'], answer: 1, explain: 'a[i] = mult(sqrt(a[i]), a[i]) = √a × a。4 なら 2 × 4 = <b>8</b>, 9 なら 3 × 9 = <b>27</b>。' },
        { type: 'predict', id: 'p1', files: { 'sample.c': SAMPLE }, units: ['sample.c'], stdin: S.in2 || 'apple\n1 4 -9 16\n', q: '入力を <code class="ic">apple</code> ⏎ <code class="ic">1 4 -9 16</code> に変えた。stdout の最後の行は?', choices: ['<code>name1 != name2</code>', '<code>name1 == name2</code>', '<code>27.000</code> (−9 は飛ばされる)', '<code>8.000</code>'], answer: 0, explain: '"Apple" と "apple" は大文字小文字が違うので strcmp は 0 にならず <b>name1 != name2</b>。その後, 3 番目の −9 で <b>exit(1)</b> — 1 と 4 の計算結果も含めて, 数値は 1 つも表示されない (表示のループは計算ループの後だから)。' },
        { type: 'shell', name: 'サンプルを試験と同じ手順で', files: { 'sample.c': SAMPLE, 'in.txt': S.in || 'Apple\n1 4 9\n', 'exp.txt': S.exp || '', 'in2.txt': S.in2 || '' }, cmds: ['gcc sample.c -lm', './a < in.txt > out.txt', 'diff -Bw out.txt exp.txt', './a < in2.txt', 'cat out.txt'], intro: '<code class="ic">exp.txt</code> は配布資料の「gcc での実行結果」。<b>① gcc → ② リダイレクト → ③ diff -Bw</b> が本番で毎回やる 3 手。続けて <code class="ic">in2.txt</code> (負の値入り) で exit(1) の動きも見てみよう。', goals: [
          { text: 'out.txt を作って <code class="ic">diff -Bw</code> が何も表示しないことを確認', test: (hs) => hs.some((x) => x.diff && x.diff.same) },
          { text: '負の値で exit(1) — stderr に <code class="ic">a[2]&lt;0</code> が出て終了するのを見る', test: (hs) => hs.some((x) => /in2\.txt/.test(x.cmd) && x.result && /a\[2\]<0/.test(x.result.err || '')) },
        ] },
        { type: 'tracer', files: { 'sample.c': SAMPLE }, units: ['sample.c'], stdin: 'Apple\n1 4 9\n', showStdin: true, title: 'サンプルをステップ実行 — name1, name2 の 32 バイトと a[5] の中身を追う' },
      ],
    },
    {
      id: 'focus', num: '04', group: '2. 出題範囲', kicker: '特に復習すべき例題と課題', navTitle: '重点復習マップ',
      title: '出題範囲は B1〜B4。特に, この 7 つ。',
      lead: '資料に名指しされた例題・課題。それぞれが下の模擬試験の問1〜問4 に対応している。クリア状況は B3 / B4 の課題ラボと連動。',
      blocks: [
        { type: 'widget', make: focusMap },
        { type: 'compare', title: '4 つの「型」— 本番はこのどれかの応用が出ると考えて準備する', items: [
          { title: '<span class="chip ptr">型 1</span> 値を複数返す (3-4, 3-5)', code: 'void f(int x, int *p, int *q)\n{\n  *p = ...;\n  *q = ...;\n}\n/* 呼ぶ側: f(x, &a, &b); */', html: '返したい値の数だけ<b>ポインタ引数</b>。関数の中で表示しない。' },
          { title: '<span class="chip vio">型 2</span> 構造体へのポインタ (3-7)', code: 'int point_scan(point_t *p)\n{\n  if (scanf("%lf%lf", &p->x, &p->y) == EOF)\n    { return EOF; }\n  return 1;\n}', html: 'メンバーは <code class="ic">p-&gt;x</code>。scanf には <code class="ic">&amp;p-&gt;x</code>。' },
          { title: '<span class="chip val">型 3</span> 配列と乱数の度数分布 (3-10)', code: 'for (s=MIN; s<=MAX; s++) { c[s] = 0; }\nfor (i=0; i<n; i++) {\n  c[d1[i] + d2[i]]++;\n}', html: '<b>カウンタの初期化</b>を忘れない (呼び出し元にゴミ)。' },
          { title: '<span class="chip addr">型 4</span> 2 次元配列と行列 (4-1)', code: 'void f(int n, double A[N][N])\n{\n  for (i=0; i<n; i++)\n    for (j=0; j<n; j++)\n      ... A[i][j] ...\n}', html: '列数 [N] は省略不可。上限は <b>n</b>。' },
        ] },
      ],
    },
    {
      id: 'review7', num: '05', group: '2. 出題範囲', kicker: '資料が「特に復習」と名指しした 7 題', navTitle: '重点問題まとめ (7 題)',
      title: '名指しされた 7 題を, 要素とステップに分解する。',
      lead: '資料「中間試験 T1 について」が特に復習するよう挙げた 例題 (3-4) 課題 (3-4)(3-5) / 例題 (3-5) 課題 (3-7) / 課題 (3-10) / 課題 (4-1)。それぞれ「何を作るか」「試験に必要な要素」「解くステップ」「落とし穴」をまとめた。何も見ずに書けるようになったらチェック。',
      blocks: [
        { type: 'widget', title: '<span class="chip ptr">7 題</span> 重点問題カード — 開いて確認, 書けたらチェック', make: reviewCards },
        { type: 'widget', title: '<span class="chip val">共通</span> 本番で 1 問を解く 7 ステップ', make: examSteps },
        { type: 'cheat', items: [
          { c: '型 A 値を複数返す', d: '例題 (3-4) 課題 (3-4)(3-5)。<b>仮引数 int *p, 本体 *p = …, 呼び出し &x</b>。', code: 'f(x, y, &q, &r);' },
          { c: '型 B 構造体ポインタ', d: '例題 (3-5) 課題 (3-7)。<b>p-&gt;x, scanf には &p-&gt;x (文字列は & なし), EOF を返す</b>。', code: 'scanf("%lf", &p->x)' },
          { c: '型 C 配列と乱数', d: '課題 (3-10)。<b>rand() % 6 + 1, カウンタ 0 初期化, srand は呼ばない</b>。', code: 'c[d1[i]+d2[i]+d3[i]]++;' },
          { c: '型 D 2 次元配列', d: '課題 (4-1)。<b>A[N][N], 上限 n, 書式 " %9.5f", 自分の転置は半分だけ</b>。', code: 'for (j=i+1; j<n; j++)' },
        ] },
      ],
    },
    {
      id: 'skills', num: '06', group: '2. 出題範囲', kicker: '必ずできるようにしておくこと', navTitle: 'リダイレクト・diff・分割コンパイル',
      title: 'リダイレクトと diff, 分割コンパイル。手が覚えるまで。',
      lead: '資料に「必ずできるようにしておくこと」と書かれた 2 つ。本番では毎問この手順を踏む。ここで手が勝手に動くまで練習しよう。',
      blocks: [
        { type: 'shell', name: 'ドリル 1 — diff と diff -Bw の違い', files: { 'mmmain.c': MM.main, 'mm.c': MM.good, 'mm.h': MM.h, 'mm-in.txt': MM.in, 'mm-exp.txt': MM.exp, 'mm-exp2.txt': MM.expSp }, cmds: ['gcc mmmain.c mm.c', './a < mm-in.txt > out.txt', 'cat out.txt', 'diff out.txt mm-exp2.txt', 'diff -Bw out.txt mm-exp2.txt', 'diff -Bw out.txt mm-exp.txt'], intro: '<code class="ic">mm-exp2.txt</code> は<b>空白と空行がずれた</b>期待値。普通の <code class="ic">diff</code> では差分が出るが, 採点と同じ <code class="ic">diff -Bw</code> なら一致する。<b>本番の確認は必ず -Bw で</b>。', goals: [
          { text: 'オプションなしの diff で差分が出るのを見る', test: (hs) => hs.some((x) => x.diff && !x.diff.same && !/-/.test(x.cmd.split(/\s+/)[1] || '')) },
          { text: '<code class="ic">diff -Bw</code> なら何も表示されないことを確認', test: (hs) => hs.some((x) => x.diff && x.diff.same && /-Bw|-wB/.test(x.cmd)) },
        ] },
        { type: 'shell', name: 'ドリル 2 — 分割コンパイル + バグ探し', editable: ['mm.c'], files: { 'mmmain.c': MM.main, 'mm.c': MM.bug, 'mm.h': MM.h, 'mm-in.txt': MM.in, 'mm-exp.txt': MM.exp }, cmds: ['gcc -c mm.c', 'gcc -c mmmain.c', 'ls', 'gcc mmmain.o mm.o', './a < mm-in.txt > out.txt', 'diff -Bw out.txt mm-exp.txt', { cmd: 'gcc mmmain.c', label: 'gcc mmmain.c (mm.c を忘れる)' }], intro: '<b>① .o を 2 つ作ってリンク → ② diff</b>。3 行目が合わないはず。左のエディタで mm.c を直し, <code class="ic">gcc -c mm.c</code> → <code class="ic">gcc mmmain.o mm.o</code> と<b>直したファイルだけ</b>コンパイルし直して, diff が何も出なくなるまで。', goals: [
          { text: '<code class="ic">gcc -c</code> で mm.o と mmmain.o を作る', test: (hs, api) => api.fs.has('mm.o') && api.fs.has('mmmain.o') },
          { text: '<code class="ic">undefined reference</code> (リンクエラー) を一度見ておく', test: (hs) => hs.some((x) => x.out.some((o) => /undefined reference/.test(o.t || ''))) },
          { text: 'mm.c を直して <code class="ic">diff -Bw</code> が何も表示しない状態にする', test: (hs) => hs.some((x) => x.diff && x.diff.same) },
        ] },
        { type: 'cheat', items: [
          { c: 'gcc a.c b.c', d: '一度にコンパイルしてリンク。<b>main のあるファイル + 関数のファイル</b>を全部並べる。ヘッダ (.h) は並べない。', code: '$ gcc hmsmain.c hms.c' },
          { c: 'gcc -c x.c', d: 'コンパイルだけして <b>x.o</b> を作る。直したファイルだけ作り直せば速い。', code: '$ gcc -c hms.c\n$ gcc hmsmain.o hms.o' },
          { c: '-lm', d: 'math.h の関数 (sqrt, fabs…) を使うときは<b>リンク時に</b>付ける。', code: '$ gcc trimain.c tri.c -lm' },
          { c: '< in.txt > out.txt', d: 'stdin をファイルから, stdout をファイルへ。stderr (プロンプト) は画面に残る。', code: '$ ./a < in.txt > out.txt' },
          { c: 'diff -Bw', d: '採点と同じ照合。<b>何も表示されなければ一致</b>。', code: '$ diff -Bw out.txt exp.txt' },
          { c: 'undefined reference', d: 'リンクエラー: 関数の本体があるファイルを gcc に渡し忘れている。', code: 'undefined reference to `hms\'' },
        ] },
      ],
    },
    {
      id: 'mock', num: '07', group: '3. 模擬試験', kicker: 'Mock Exam — 70 min', navTitle: '模擬試験 (70 分)',
      title: '本番と同じ 4 問・70 分・隠しテスト付き。',
      lead: '問1〜問4 は重点復習の 4 つの型に対応。テスト実行では「問題文の入力」の diff に加えて, 本番と同じく<b>表示していない入力</b>と<b>題意どおりか</b>も自動でチェックする。全部通れば 5 点, 1 つでも落ちれば 0 点。',
      blocks: [
        { type: 'widget', title: '<span class="chip ptr">TIMER</span> 70 分タイマーと得点', make: examTimer },
        { type: 'callout', kind: 'tip', html: '<b>本番のつもりで</b>: ヒントと模範解答は見ずに, ターミナルボタンで <code class="ic">gcc</code> → <code class="ic">./a &lt; in &gt; out.txt</code> → <code class="ic">diff -Bw</code> の手順も踏んでみよう。期待値は gcc (Linux) で模範解答を実行して作ったもの。「腕試し」はサンプルプログラムの技 (exit, 文字列) を使う追加問題 (得点外)。' },
        { type: 'lab' },
      ],
    },
    {
      id: 'final', num: '08', group: 'まとめ', kicker: 'Last check', navTitle: '前日の最終確認',
      title: '前日の夜に, これだけ見直す。',
      blocks: [
        { type: 'cheat', items: [
          { c: 'プロンプトは stderr', d: '<code class="ic">fprintf(stderr, …)</code>。stdout に出すと diff が合わない。', code: 'fprintf(stderr, "n = ");' },
          { c: 'scanf の %lf と &', d: 'double は <b>%lf</b>, 変数には <b>&amp;</b>。構造体ポインタなら <code class="ic">&amp;p-&gt;x</code>。', code: 'scanf("%lf", &p->x);' },
          { c: 'EOF まで読む', d: '<code class="ic">== EOF</code> で break / return EOF。', code: 'while (scanf("%d", &n) != EOF)' },
          { c: '*p = 値', d: 'ポインタ引数で返すときは指す先に代入。呼ぶ側は <code class="ic">&amp;</code> を付ける。', code: 'divrem(x, y, &q, &r);' },
          { c: '初期化', d: 'カウンタ・総和・行列の積は <b>0 から</b>。呼び出し元にゴミが入っている前提。', code: 'c[s] = 0;  C[i][j] = 0.0;' },
          { c: '上限は n', d: '例の大きさで決め打ちしない。隠しテストは別の大きさ。', code: 'for (i=0; i<n; i++)' },
          { c: '文字列', d: '代入 strcpy, 比較 strcmp, 長さ strlen (string.h)。配列に = は使えない。', code: 'strcpy(s, "Apple");' },
          { c: '異常終了', d: 'stderr にメッセージ → <code class="ic">exit(1)</code> (stdlib.h)。', code: 'exit(1);' },
        ] },
        { type: 'widget', title: '練習記録', make: () => {
          const p = store.get('progress:t1', { predict: {}, tasks: {} });
          const n = ['q1', 'q2', 'q3', 'q4'].filter((i) => p.tasks[i] === 'done').length;
          const ck = Object.values(store.get('t1:ck', {})).filter(Boolean).length;
          return Infog.make({ kind: 'stats', tag: 'READY?', title: 'あなたの準備状況', items: [
            { value: n * 5, suffix: '点', label: '模擬試験の得点 (20 点満点)', color: n >= 2 ? 'ok' : 'ptr' },
            { value: ['p0', 'p1'].filter((i) => p.predict[i]).length, label: 'サンプルの予想問題 (2 問)', color: 'addr' },
            { value: ck, label: '手順チェックリスト (10 項目)', color: 'vio' },
          ] });
        } },
        { type: 'callout', kind: 'info', html: '試験の正式な情報は配布資料「中間試験 T1 について」と当日の指示に従ってください。このページの模擬問題は出題範囲から作成した<b>非公式の練習問題</b>です。' },
      ],
    },
  ];

  window.UNITS.t1 = {
    title: '中間試験対策', source: '2026 年度 プログラミング実習 III 中間試験 T1 について', hero, chapters, tasks: window.T1_TASKS || [],
    predictCount: 2, noReport: true,
  };
})();
