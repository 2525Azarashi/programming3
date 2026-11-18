/* =========================================================================
 *  B7 ソーティング — 章コンテンツ
 *  出典: 配布資料「[B7] ソーティング」と講義スライド「B7.pdf」
 * ========================================================================= */
(function () {
  'use strict';
  const { h, icon } = U;
  const W = window.B7_CODE || {};
  const C = {
    sel: "#include <stdio.h>\n\nvoid swapmin(int n, double *a, int k)\n{\n    int i, min = k;\n    double tmp;\n    for (i = k + 1; i < n; i++) {\n        if (a[i] < a[min]) { min = i; }\n    }\n    tmp = a[k]; a[k] = a[min]; a[min] = tmp;\n}\n\nint main(void)\n{\n    double a[5] = {6, 2, 4, 9, 8};\n    int i;\n\n    swapmin(5, a, 0);\n    swapmin(5, a, 1);\n    for (i = 0; i < 5; i++) printf(\" %.0f\", a[i]);\n    printf(\"\\n\");\n    return 0;\n}\n",
    ins: "#include <stdio.h>\n\nvoid insert(int n, double *a, int k)\n{\n    int i;\n    double tmp;\n    for (i = k; 1 <= i; i--) {\n        if (a[i - 1] <= a[i]) { break; }\n        tmp = a[i]; a[i] = a[i - 1]; a[i - 1] = tmp;\n    }\n}\n\nint main(void)\n{\n    double a[5] = {2, 6, 8, 9, 4};\n    int i;\n\n    insert(5, a, 4);\n    for (i = 0; i < 5; i++) printf(\" %.0f\", a[i]);\n    printf(\"\\n\");\n    return 0;\n}\n",
    p_ins: "#include <stdio.h>\n\nint main(void)\n{\n    int a[5] = {2, 6, 8, 9, 4};\n    int i, swp = 0, tmp;\n\n    for (i = 4; 1 <= i; i--) {\n        if (a[i - 1] <= a[i]) { break; }\n        tmp = a[i]; a[i] = a[i - 1]; a[i - 1] = tmp;\n        swp++;\n    }\n    printf(\"%d %d\\n\", a[1], swp);\n    return 0;\n}\n",
    qsort_tr: "#include <stdio.h>\n\nvoid sort(int n, double *a)\n{\n    int l = 0, r = n - 1;\n    double p = a[0], tmp;\n    while (l <= r) {\n        while (a[l] < p) { l++; }\n        while (a[r] > p) { r--; }\n        if (l <= r) {\n            tmp = a[l]; a[l] = a[r]; a[r] = tmp;\n            l++; r--;\n        }\n    }\n    if (0 < r)     sort(r + 1, a);\n    if (l < n - 1) sort(n - l, &a[l]);\n}\n\nint main(void)\n{\n    double a[5] = {4, 7, 2, 6, 1};\n    int i;\n    sort(5, a);\n    for (i = 0; i < 5; i++) printf(\" %.0f\", a[i]);\n    printf(\"\\n\");\n    return 0;\n}\n",
    p_part: "#include <stdio.h>\n\nint main(void)\n{\n    int a[6] = {5, 8, 2, 9, 1, 7};\n    int l = 0, r = 5, p = a[0], tmp;\n\n    while (l <= r) {\n        while (a[l] < p) { l++; }\n        while (a[r] > p) { r--; }\n        if (l <= r) {\n            tmp = a[l]; a[l] = a[r]; a[r] = tmp;\n            l++; r--;\n        }\n    }\n    printf(\"%d %d\\n\", r, l);\n    return 0;\n}\n",
    p_str: "#include <stdio.h>\n#include <string.h>\n\nint main(void)\n{\n    char a[3][16] = {\"tanaka\", \"nakamura\", \"suzuki\"};\n    printf(\"%d %d\\n\", strcmp(a[0], a[1]) > 0, strcmp(a[1], a[2]) < 0);\n    return 0;\n}\n",
    m_val: "#include <stdio.h>\n\nint main(void)\n{\n    double a[4] = {6.0, 2.0, 4.0, 8.0};\n    int i;\n    double min = a[0];   /* 添字ではなく「値」を覚えてしまった! */\n    for (i = 1; i < 4; i++) {\n        if (a[i] < min) { min = a[i]; }\n    }\n    a[0] = min;          /* a[0] は 2 になるが, 元の 6 を入れる場所が分からない! */\n    printf(\"%.0f %.0f %.0f %.0f\\n\", a[0], a[1], a[2], a[3]);\n    return 0;\n}\n",
    m_zero: "#include <stdio.h>\n\nint main(void)\n{\n    double a[4] = {3, 5, 7, 1};\n    int i;\n    double tmp;\n    /* ?? を 0 にしてしまった! i=0 のとき a[-1] を読む */\n    for (i = 3; 0 <= i; i--) {\n        if (a[i - 1] <= a[i]) break;\n        tmp = a[i]; a[i] = a[i - 1]; a[i - 1] = tmp;\n    }\n    return 0;\n}\n",
    m_streq: "#include <stdio.h>\n#include <string.h>\n\nint main(void)\n{\n    char a[2][16] = {\"tanaka\", \"apple\"};\n    /* 文字列を < で比較すると「配列の先頭番地」の比較になる! */\n    if (a[1] < a[0]) printf(\"apple が前\\n\");\n    else printf(\"tanaka が前 (番地順!)\\n\");\n    return 0;\n}\n",
  };

  function hero(heroMem) {
    return h('section.u-hero',
      h('div.u-hero-grid',
        h('div',
          h('div.code-id', 'UNIT B7 — SORTING ALGORITHMS'),
          h('h1', 'ソーティング', h('br'), h('em', 'O(n²) → O(n log n)')),
          h('p.tag', '選ぶ、差し込む、半分に割る。', h('br'), h('span', '同じ「昇順に並べる」でも、データの性質と分割のしかたで 200 倍の差がつく。')),
          h('div.u-stats',
            h('div', h('b', '8'), '章'),
            h('div', h('b', '8+2'), '課題 (オプション含む)'),
            h('div', h('b', '4'), '予想問題')),
          h('div.cta',
            h('a.btn.ptr', { href: '#intro' }, '学習を始める', icon('arrow')),
            h('a.btn', { href: '#lab' }, '課題ラボへ'),
            h('a.btn.ghost', { href: '#report' }, 'レポート作成'))),
        heroMem()));
  }

  const chapters = [
    {
      id: 'intro', num: '00', group: 'はじめに', kicker: 'Overview & Duel', navTitle: 'ソートの地図と対決',
      title: '同じ整列でも, 手数がまったく違う。',
      lead: 'B7 では「単純選択法」「単純挿入法」「クイックソート」の 3 つのソートを作り、さらに文字列や構造体、O(n) のバケツ法まで広げる。まずは 30 秒で全体像を掴み、選択法と挿入法の動きを見比べよう。',
      blocks: [
        { type: 'widget', make: () => W.essenceMap && W.essenceMap() },
        { type: 'widget', make: () => W.sortDuel && W.sortDuel() },
      ],
    },
    {
      id: 'selection', num: '01', group: '1. 単純法 O(n²)', kicker: '課題 7-1, 7-2 単純選択法', navTitle: '単純選択法',
      title: '最小値の「場所」を見つけて, 左端と交換。',
      lead: 'a[k]〜a[n-1] の中から最小の要素を探し、左端 a[k] と入れ替える (swapmin)。これを k = 0, 1, …, n-2 と繰り返すのが単純選択法 (selection sort)。',
      blocks: [
        { type: 'point', n: 1, title: '覚えるのは最小値の「値」ではなく<b>添字 <code>min</code></b>', sub: '<code class="ic">min = k;</code> から始め、<code class="ic">a[i] &lt; a[min]</code> なら <code class="ic">min = i;</code> で場所を更新。見終わってから <code class="ic">a[k]</code> と <code class="ic">a[min]</code> を 1 回だけ交換する。' },
        { type: 'predict', id: 'p0', code: C.sel, hl: [18, 19], q: '配列 <code class="ic">{6, 2, 4, 9, 8}</code> に <code class="ic">swapmin(5, a, 0)</code> と <code class="ic">swapmin(5, a, 1)</code> を実行した後の出力は?', choices: ['<code> 2 4 6 9 8</code>', '<code> 2 4 6 8 9</code>', '<code> 2 6 4 9 8</code>'], answer: 0, explain: 'k=0 で最小値 2 と 6 を交換 → <code class="ic">{2, 6, 4, 9, 8}</code>。k=1 で残り {6,4,9,8} の最小値 4 と 6 を交換 → <b> 2 4 6 9 8</b>。9 と 8 はまだ入れ替わっていない (k=3 で入れ替わる)。' },
        { type: 'tracer', code: C.sel, name: 'スライド「単純選択法」', title: 'min が最小値の添字を追いかけ、内側ループの最後に a[k] と a[min] を交換する' },
        { type: 'mistakes', items: [
          { title: '添字ではなく「値」を min に入れてしまう', code: C.m_val, fix: '値だけ覚えて <code class="ic">a[0] = min;</code> と上書きすると、元の <code class="ic">a[0]</code> (6) が消えて 2 が 2 つになってしまう! 必ず <code class="ic">int min = k;</code> で<b>何番目か</b>を覚える。' },
        ] },
      ],
    },
    {
      id: 'insertion', num: '02', group: '1. 単純法 O(n²)', kicker: '課題 7-3, 7-4 単純挿入法', navTitle: '単純挿入法',
      title: '右から交換を繰り返し, 適切な位置でピタッと止める。',
      lead: '既にソートされた領域 a[0]〜a[k-1] の右隣にある a[k] を、左隣と比べて小さければ交換しながら滑り込ませる (insert)。これを k = 1 〜 n-1 で繰り返すのが単純挿入法 (insertion sort)。',
      blocks: [
        { type: 'point', n: 2, title: '<code>for (i = k; 1 &lt;= i; i--)</code> — 下限は <b>0 ではなく 1</b>', sub: 'ループの中で <code class="ic">a[i-1]</code> と <code class="ic">a[i]</code> を比較するため、<code class="ic">i</code> の最小値は <b>1</b> (<code class="ic">a[0]</code> と <code class="ic">a[1]</code> の比較が最後)。<code class="ic">a[i-1] &lt;= a[i]</code> になった瞬間に <code class="ic">break</code> する。' },
        { type: 'predict', id: 'p1', code: C.p_ins, hl: [8, 9, 10], q: 'スライドの例 <code class="ic">{2, 6, 8, 9, 4}</code> で右端の 4 を挿入。<code class="ic">a[1]</code> の値と交換回数 <code class="ic">swp</code> は?', placeholder: '例: 4 2', explain: '4 は 9, 8, 6 と <b>3 回</b>交換して a[1] に収まり、次は <code class="ic">a[0]=2 &lt;= a[1]=4</code> で break! 配列は {2, 4, 6, 8, 9} なので答えは <b>4 3</b>。' },
        { type: 'tracer', code: C.ins, name: 'スライド「適切な位置への挿入」', title: '4 が 9 → 8 → 6 と交換しながら左へ進み、2 の右隣で break する瞬間' },
        { type: 'mistakes', items: [
          { title: 'ループ条件を 0 <= i にして a[-1] を読む', code: C.m_zero, fix: '最小値を先頭まで運んだあと i=0 になると <code class="ic">a[i-1]</code> すなわち <b>a[-1] (範囲外!)</b> を読んでしまいます。条件は必ず <code class="ic">1 &lt;= i</code>。' },
        ] },
      ],
    },
    {
      id: 'cpu', num: '03', group: '2. 計算時間と高速化', kicker: '課題 7-5 計算時間と -O2', navTitle: '計算時間と最適化',
      title: 'n が 2 倍で 4 倍 — ただし正順の挿入法だけは別世界。',
      lead: 'sort_cpu.c では乱数・正順・逆順の 3 種類のデータで、n を 2 倍ずつ増やしながら clock() で CPU 時間を測る。さらに gcc の最適化オプション -O2 の効果も確かめる。',
      blocks: [
        { type: 'widget', make: () => W.benchExplorer && W.benchExplorer() },
        { type: 'point', n: 3, title: '元の配列 <code>r</code> を壊さないよう、毎回 <code>array_copy(n, a, r)</code> してから測る', sub: '1 度ソートすると配列は正順になってしまうので、乱数データ <code class="ic">r</code> はそのまま残し、作業用配列 <code class="ic">a</code> に先頭 <code class="ic">n</code> 個をコピーしてから <code class="ic">sort(n, a)</code> を測る。直後に <code class="ic">sort_check(n, a)</code> で本当に昇順か検証する。' },
        { type: 'callout', kind: 'tip', html: '<b>課題 7-5 考察の 3 本柱:</b><br>① <b>最適化 (<code class="ic">-O2</code>):</b> 機械語の効率化により <code class="ic">-O0</code> より約 3〜5 倍速くなる。<br>② <b>初期データの違い:</b> 単純選択法は乱数・正順・逆順すべて同じ時間。単純挿入法は<b>正順だけ毎回 1 回の比較で break するため O(n)</b> と劇的に速く、逆順は乱数の約 2 倍遅い。<br>③ <b>n との関係:</b> O(n²) では n が 2 倍になると時間は <b>2² = 4 倍</b>に増える。' },
      ],
    },
    {
      id: 'quick', num: '04', group: '2. 計算時間と高速化', kicker: '課題 7-6 クイックソート', navTitle: 'クイックソート',
      title: 'p 以下と p 以上に分け, 再帰で丸投げする。',
      lead: '基準値 p = a[0] を決め、左から p 以上の要素、右から p 以下の要素を探して交換する。l と r がすれ違ったら分割完了! 前半と後半に同じ sort を再帰呼び出しすれば O(n log n) で整列する。',
      blocks: [
        { type: 'widget', make: () => W.partitionLab && W.partitionLab() },
        { type: 'point', n: 4, title: '前半は <code>sort(r + 1, a)</code>、後半は <code>sort(n - l, &amp;a[l])</code>', sub: '前半 <code class="ic">a[0]〜a[r]</code> の個数は <code class="ic">r + 1</code> 個。後半 <code class="ic">a[l]〜a[n-1]</code> の個数は <code class="ic">(n-1) - l + 1 = n - l</code> 個で、その先頭要素のアドレスは <code class="ic">&amp;a[l]</code> (または <code class="ic">a + l</code>)。' },
        { type: 'predict', id: 'p2', code: C.p_part, hl: [8, 9, 10, 11], q: '<code class="ic">{5, 8, 2, 9, 1, 7}</code> を <code class="ic">p = 5</code> で分割した直後の <code class="ic">r</code> と <code class="ic">l</code> は?', choices: ['<code>1 2</code>', '<code>2 3</code>', '<code>2 2</code>'], answer: 0, explain: '1 回目: l=0 (5) と r=4 (1) を交換して <code class="ic">{1, 8, 2, 9, 5, 7}</code>, l=1, r=3。2 回目: l=1 (8) と r=2 (2) を交換して <code class="ic">{1, 2, 8, 9, 5, 7}</code>, l=2, r=1 で <code class="ic">l &lt;= r</code> を抜ける! 前半 <code class="ic">a[0]〜a[1]</code> が 5 以下、後半 <code class="ic">a[2]〜a[5]</code> が 5 以上に分かれ、出力は <b>1 2</b>。' },
        { type: 'tracer', code: C.qsort_tr, name: 'クイックソートの分割と再帰', title: 'l と r が中央で交差し、前半と後半へ sort が再帰呼び出しされる様子を追う' },
        { type: 'callout', kind: 'warn', html: '<b>p = a[0] 固定の弱点 (課題 7-6 の考察):</b> すでに<b>正順・逆順</b>のデータに対して <code class="ic">p = a[0]</code> を選ぶと、毎回「1 個と n−1 個」に偏って分割されるため、再帰が n 段深くなり計算時間も <b>O(n²)</b> に悪化する (n=65536 でスタック不足になる原因もこれ)。' },
      ],
    },
    {
      id: 'records', num: '05', group: '3. 文字列・構造体・バケツ法', kicker: '課題 7-7, 7-8, Opt 7-1, 7-2', navTitle: '文字列・構造体・バケツ法',
      title: '骨格は同じまま, 何でもソートできる。',
      lead: '数値のソートが書ければ、「比較」と「交換」の 2 部品を差し替えるだけで文字列も構造体も自在に並べ替えられる。さらにデータの範囲を利用した O(n) のバケツ法・頻度法も覗いてみよう。',
      blocks: [
        { type: 'widget', make: () => W.typeMorph && W.typeMorph() },
        { type: 'predict', id: 'p3', code: C.p_str, hl: [7], q: '<code class="ic">strcmp("tanaka", "nakamura") &gt; 0</code> と <code class="ic">strcmp("nakamura", "suzuki") &lt; 0</code> の出力は?', choices: ['<code>1 1</code>', '<code>0 1</code>', '<code>1 0</code>'], answer: 0, explain: '辞書順で <code class="ic">"nakamura" &lt; "suzuki" &lt; "tanaka"</code>。<code class="ic">strcmp(x, y)</code> は x の方が辞書順で後ろなら正、前なら負を返すので両方とも真 (<b>1 1</b>)。' },
        { type: 'mistakes', items: [
          { title: '文字列を a[i] < a[min] で比較してしまう', code: C.m_streq, fix: '<code class="ic">a[1] &lt; a[0]</code> は文字の中身ではなく<b>メモリ上の番地</b>を比べてしまうため、<code class="ic">&amp;a[0] &lt; &amp;a[1]</code> が常に成り立ちます。文字列比較は必ず <code class="ic">strcmp(a[i], a[min]) &lt; 0</code>!' },
        ] },
        { type: 'callout', kind: 'info', html: '<b>オプション課題 7-1 (バケツ法) / 7-2 (頻度法):</b> 比較ソートの下界 Ω(n log n) を超える <b>O(n) ソート</b>。最小値〜最大値を <code class="ic">m = n / B</code> 個のバケツに等分して振り分けることで、1 バケツあたり平均 B 個 (定数) に減らし、仕上げに「ほぼ整列データに強い単純挿入法」を組み合わせる黄金パターンです。' },
      ],
    },
    {
      id: 'summary', num: '06', group: 'まとめ', kicker: 'Cheat sheet', navTitle: 'チートシート',
      title: 'B7 を 6 枚で。',
      blocks: [
        { type: 'cheat', items: [
          { c: '単純選択法 (7-1, 7-2)', d: 'k=0〜n-2。最小値の<b>添字 min</b> を探して a[k] と交換。常に O(n²)。', code: 'min = k;\nfor (i=k+1; i<n; i++)\n  if (a[i] < a[min]) min = i;' },
          { c: '単純挿入法 (7-3, 7-4)', d: 'k=1〜n-1。i=k から <b>1 まで</b>左へ交換、a[i-1]<=a[i] で break。正順は O(n)!', code: 'for (i=k; 1<=i; i--) {\n  if (a[i-1] <= a[i]) break;\n  /* swap a[i], a[i-1] */\n}' },
          { c: '時間計測と -O2 (7-5)', d: '毎回 array_copy してから clock() で sort のみ計測。sort_check で検算。', code: 'gcc -O2 sort_cpu.c selection_sort.c' },
          { c: 'クイックソート (7-6)', d: 'p=a[0] で l, r を寄せて分割。前半 r+1 個、後半 n-l 個 (&a[l]) に再帰。', code: 'if (0 < r) sort(r+1, a);\nif (l < n-1) sort(n-l, &a[l]);' },
          { c: '文字列ソート (7-7)', d: '比較は <b>strcmp(x,y) &lt; 0</b>、交換は char tmp[STRLEN+1] と <b>strcpy</b>。', code: 'if (strcmp(a[i], a[min]) < 0)\n  min = i;' },
          { c: '構造体ソート (7-8)', d: 'record_t は <b>= で丸ごと代入可</b>。age が等しければ stature で比較。', code: 'a[i].age < a[min].age ||\n(a[i].age==a[min].age &&\n a[i].stature < a[min].stature)' },
        ] },
      ],
    },
    {
      id: 'lab', num: '07', group: '課題', kicker: 'Assignment Lab', navTitle: '課題ラボ',
      title: '書いて, 並べて, 速さを測る。',
      lead: '7-2 (単純選択法) と 7-4 (単純挿入法) は中間試験 T2 の重点指定課題! 全 50 ケースの自動 diff とメモリリーク検査付きです。',
      blocks: [
        { type: 'callout', kind: 'tip', html: '<b>selection_sort.c は 7-2 と 7-5 で共通</b>です。7-2 をクリアしておけば 7-5 では <code class="ic">sort_cpu.c</code> に集中できます。7-5・7-6・Opt-1・Opt-2 はクリアすると「考察」欄に gcc の実測比較表が現れます。' },
        { type: 'lab' },
      ],
    },
    {
      id: 'report', num: '08', group: '課題', kicker: 'Report', navTitle: 'レポート作成',
      title: 'レポートを, 自動で組み立てる。',
      lead: '課題ラボの実行結果と「工夫した点」「感想」「考察」から B7.txt を生成します。7-5, 7-6 の計測考察もそのまま書き出せます。',
      blocks: [{ type: 'report' }],
    },
  ];

  window.UNITS.b7 = {
    title: 'ソーティング', source: '[B7] ソーティング / B7 講義スライド', hero, chapters, tasks: window.B7_TASKS || [],
    predictCount: 4,
  };
})();
