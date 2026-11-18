/* B7 ソーティング — 課題定義 (出典: 配布資料「[B7] ソーティング」) */
(function () {
  'use strict';
  const R = String.raw;
  const D = window.B7_DATA || { sol: {}, given: {}, exp: {}, inp: {}, start: {}, timing: {} };
  const G = D.given || {}, E = D.exp || {}, I = D.inp || {}, S = D.start || {};
  const pick = (...ks) => { const o = {}; ks.forEach((k) => (o[k] = G[k])); return o; };
  const TC = (k, label, extra) => Object.assign({ stdin: I[k], expect: E[k], label }, extra || {});
  const noCmt = (s) => (s || '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  const HP = (r) => (r && r.heap) || { sizes: [], leaks: [] };
  function leakMsg(outs) {
    const r = outs.find((x) => HP(x).leaks.length);
    if (!r) return null;
    const L = HP(r).leaks;
    return 'free 忘れ (メモリリーク) があります: 終了時に ' + L.length + ' ブロック (' + L.reduce((a, b) => a + b.n, 0) + ' バイト) が返却されていません';
  }

  /* CPU 時間計測表 (gcc -O0 / -O2 実測) */
  function cpuTable(keys, titles) {
    const tm = D.timing || {};
    const ns = [2048, 4096, 8192, 16384, 32768, 65536];
    let html = '';
    keys.forEach((k, idx) => {
      const t = tm[k] || {};
      const avail = ns.filter((n) => t[n]);
      if (!avail.length) return;
      html += '<div style="margin-top:8px"><b>' + titles[idx] + '</b></div>';
      html += '<div class="b6-tbl-wrap"><table class="b6-tbl"><thead><tr><th>n</th><th>乱数 [sec]</th><th>正順 [sec]</th><th>逆順 [sec]</th><th>乱数 (nが2倍との比)</th></tr></thead><tbody>';
      avail.forEach((n, j) => {
        const row = t[n];
        const prev = j > 0 ? t[avail[j - 1]][0] : 0;
        const ratio = prev > 0.0002 ? '×' + (row[0] / prev).toFixed(2) : '—';
        html += '<tr><td>' + n + '</td><td>' + row[0].toFixed(6) + '</td><td>' + row[1].toFixed(6) + '</td><td>' + row[2].toFixed(6) + '</td><td class="per">' + ratio + '</td></tr>';
      });
      html += '</tbody></table></div>';
    });
    return html;
  }

  const tasks = [
    {
      id: '7-1', label: '7-1', short: 'swapmin (最小値を左端と交換)', files: ['swapmin.c'],
      given: pick('swapmin_test.c'), link: ['swapmin_test.c', 'swapmin.c'], gcc: 'swapmin_test.c swapmin.c',
      starter: { 'swapmin.c': S['swapmin.c'] },
      title: 'a[k]〜a[n-1] の最小値を探し, a[k] と交換する swapmin',
      spec: '<p>double 型配列 <code class="ic">a</code> とサイズ <code class="ic">n</code>, 整数 <code class="ic">k</code> (0 ≤ k &lt; n) に対し, <b>a[k]〜a[n-1] の中の最小値を a[i] とするとき, a[k] と a[i] の値を交換する</b>関数 <code class="ic">void swapmin(int n, double *a, int k)</code> を <b>swapmin.c</b> に作成せよ。</p><ul><li>(1) n=5, a = 5, 4, 3, 2, 1, k=0 → <code class="ic">1, 4, 3, 2, 5</code></li><li>(2) n=5, a = 5, 4, 3, 1, 2, k=1 → <code class="ic">5, 1, 3, 4, 2</code></li><li>(3) n=5, a = 6, 2, 4, 9, 8 に k = 0, 1, 2, 3 を続けて入力すると昇順にソートされる。</li></ul>',
      tests: [
        TC('sw1', '(1) 5,4,3,2,1 で k=0'),
        TC('sw2', '(2) 5,4,3,1,2 で k=1'),
        TC('sw3', '(3) 6,2,4,9,8 に k=0,1,2,3'),
      ],
      hints: [
        '最小値の<b>添字</b>を覚える変数 <code class="ic">int min = k;</code> を用意する (最初は k 番目を仮の最小とする)。',
        '<code class="ic">for (i = k + 1; i &lt; n; i++) { if (a[i] &lt; a[min]) { min = i; } }</code>',
        'ループが終わったら <code class="ic">double tmp = a[k]; a[k] = a[min]; a[min] = tmp;</code> (tmp は <b>double 型</b>に注意!)。',
      ],
      check(outs, src) {
        const c = noCmt(src['swapmin.c']);
        if (/printf|scanf/.test(c)) return { ok: false, msg: 'swapmin の中では入出力を行わず, 配列要素の交換だけを行ってください' };
        return { ok: true, msg: '最小値の「値」ではなく「添字 min」を記録して最後に 1 回だけ交換 — 単純選択法の心臓部です!' };
      },
      summary: 'a[k]〜a[n-1] の最小値の添字 min を求めて a[k] と a[min] を交換する\n関数 swapmin を swapmin.c に作成し, swapmin_test.c とリンクして動作を\n確認した。',
      reportTitle: '課題 7.1',
    },
    {
      id: '7-2', label: '7-2', short: '単純選択法 selection_sort', files: ['selection_sort.c'],
      share: ['selection_sort.c'],
      given: pick('sort_test.c'), link: ['sort_test.c', 'selection_sort.c'], gcc: 'sort_test.c selection_sort.c',
      starter: { 'selection_sort.c': S['selection_sort.c'] },
      title: '単純選択法で a[0]〜a[n-1] を昇順にソートする selection_sort.c',
      spec: '<p>課題 (7-1) の swapmin の動作を <b>k = 0 〜 n-2</b> について繰り返せば, a[0]〜a[n-1] を昇順にソートできる (<b>単純選択法 / selection sort</b>)。<code class="ic">void sort(int n, double *a)</code> を <b>selection_sort.c</b> に作成し, <code class="ic">sort_test.c</code> とリンクして diff で確認せよ。</p><p class="c-addr">★ 中間試験 T2 の重点指定課題です — 何も見ずに書けるようにしよう!</p>',
      tests: [
        TC('so_hand', '手入力の 3 例 (昇順・逆順・小数)'),
        TC('so_full', '資料の in.txt / exp.txt (全 50 行: 重複・負数・n=16)', { inName: 'in.txt', expName: 'exp.txt' }),
      ],
      hints: [
        '外側のループ: <code class="ic">for (k = 0; k &lt;= n - 2; k++)</code> (最後の 1 個 a[n-1] は自動的に最大値になるので n-2 まででよい)。',
        '内側で <code class="ic">min = k;</code> から <code class="ic">i = k + 1 〜 n - 1</code> を走査して最小値の添字を探し, <code class="ic">a[k]</code> と <code class="ic">a[min]</code> を交換する (swapmin 関数を作って呼んでも OK)。',
      ],
      check(outs, src) {
        const c = noCmt(src['selection_sort.c']);
        if (/qsort/.test(c)) return { ok: false, msg: '標準ライブラリの qsort ではなく, 単純選択法を自分で実装してください' };
        return { ok: true, msg: '全 50 ケース完全一致! どんな並びでも比較回数 n(n-1)/2 回で確実に整列できています。' };
      },
      summary: 'k = 0〜n-2 について a[k]〜a[n-1] の最小値を a[k] と交換する単純選択法\nの関数 sort を selection_sort.c に作成し, sort_test.c およびテストデータ\nとの diff により動作を確認した。',
      reportTitle: '課題 7.2',
    },
    {
      id: '7-3', label: '7-3', short: 'insert (適切な位置へ挿入)', files: ['insert.c'],
      given: pick('insert_test.c'), link: ['insert_test.c', 'insert.c'], gcc: 'insert_test.c insert.c',
      starter: { 'insert.c': S['insert.c'] },
      title: 'ソート済みの a[0]〜a[k-1] の適切な位置へ a[k] を挿入する insert',
      spec: '<p>整数 <code class="ic">k</code> (1 ≤ k &lt; n) に対し, 右端 <code class="ic">a[k]</code> から左へ向かって隣同士 (<code class="ic">a[i-1]</code> と <code class="ic">a[i]</code>) を比較し, <b><code class="ic">a[i-1] &lt;= a[i]</code> なら終了, そうでなければ交換して左へ続ける</b>関数 <code class="ic">void insert(int n, double *a, int k)</code> を <b>insert.c</b> に作成せよ。</p><pre class="code-mini">for (i = k; ?? &lt;= i; i--) {\n  a[i-1] &lt;= a[i] なら終了 (break);\n  そうでなければ a[i] と a[i-1] を交換;\n}</pre>',
      tests: [
        TC('in1', '(1) 2,4,6,8,5 で k=4 → 5 が 4 と 6 の間へ'),
        TC('in2', '(2) 3,4,6,2,1 で k=3 → 2 が先頭へ (a[4]=1 は不変)'),
        TC('in3', '(3) 6,2,4,9,8 に k=1,2,3,4 で昇順ソート'),
      ],
      hints: [
        'ループ内で <code class="ic">a[i-1]</code> を参照するので, <code class="ic">i</code> が 0 になると <code class="ic">a[-1]</code> (範囲外!) を読んでしまいます。したがって <code class="ic">??</code> は <b>1</b> (<code class="ic">1 &lt;= i</code>)。',
        '<code class="ic">if (a[i-1] &lt;= a[i]) { break; }</code> で即座にループを抜けるから, 既に整列していれば 1 回の比較だけで止まります。',
      ],
      check(outs, src) {
        const c = noCmt(src['insert.c']);
        if (/printf|scanf/.test(c)) return { ok: false, msg: 'insert の中では入出力を行わないでください' };
        return { ok: true, msg: 'i = k から 1 まで左へ交換し, a[i-1] <= a[i] でピタッと止まる — トランプの手札整理と同じ動きです!' };
      },
      summary: 'i = k から 1 まで減らしながら a[i-1] <= a[i] なら終了し, そうでなければ\na[i] と a[i-1] を交換することで a[k] をソート済み領域の適切な位置に\n挿入する関数 insert を insert.c に作成した。',
      reportTitle: '課題 7.3',
    },
    {
      id: '7-4', label: '7-4', short: '単純挿入法 insertion_sort', files: ['insertion_sort.c'],
      given: pick('sort_test.c'), link: ['sort_test.c', 'insertion_sort.c'], gcc: 'sort_test.c insertion_sort.c',
      starter: { 'insertion_sort.c': S['insertion_sort.c'] },
      title: '単純挿入法で a[0]〜a[n-1] を昇順にソートする insertion_sort.c',
      spec: '<p>課題 (7-3) の insert の動作を <b>k = 1 〜 n-1</b> について繰り返す<b>単純挿入法 (insertion sort)</b> の関数 <code class="ic">void sort(int n, double *a)</code> を <b>insertion_sort.c</b> に作成し, <code class="ic">sort_test.c</code> とリンクして動作確認せよ。</p><p class="c-addr">★ 中間試験 T2 の重点指定課題です — 7-2 (単純選択法) と両方書けるように!</p>',
      tests: [
        TC('so_hand', '手入力の 3 例'),
        TC('so_full', '資料の in.txt / exp.txt (全 50 行)', { inName: 'in.txt', expName: 'exp.txt' }),
      ],
      hints: [
        '先頭の 1 要素 <code class="ic">a[0]</code> だけなら既にソート済みとみなせるので, 外側のループは <b><code class="ic">k = 1</code> から <code class="ic">n - 1</code></b> まで。',
        '内側は 7-3 と同じく <code class="ic">for (i = k; 1 &lt;= i; i--)</code> で <code class="ic">if (a[i-1] &lt;= a[i]) break;</code> → 交換。',
      ],
      check(outs, src) {
        const c = noCmt(src['insertion_sort.c']);
        if (/qsort/.test(c)) return { ok: false, msg: '単純挿入法を自分で実装してください' };
        if (!/break|--/.test(c) && !/while/.test(c)) return { ok: false, msg: '単純選択法ではなく, 右から左へ挿入する単純挿入法で実装してください' };
        return { ok: true, msg: '全 50 ケース完全一致! 正順データなら内側ループが毎回 1 回で break するため O(n) で一瞬で終わります。' };
      },
      summary: 'k = 1〜n-1 について a[k] をソート済み領域 a[0]〜a[k-1] の適切な位置へ\n挿入する単純挿入法の関数 sort を insertion_sort.c に作成し, sort_test.c\nとリンクして diff により動作を確認した。',
      reportTitle: '課題 7.4',
    },
    {
      id: '7-5', label: '7-5', short: '計算時間計測 sort_cpu.c', files: ['sort_cpu.c', 'selection_sort.c'],
      share: ['selection_sort.c'],
      link: ['sort_cpu.c', 'selection_sort.c'], gcc: '-O2 sort_cpu.c selection_sort.c',
      starter: { 'sort_cpu.c': S['sort_cpu.c'], 'selection_sort.c': S['selection_sort.c'] },
      title: '乱数・正順・逆順データのソート時間を計測する sort_cpu.c',
      spec: '<p>ソートの計算時間を計測する <b>sort_cpu.c</b> を次の手順で完成させ, <code class="ic">selection_sort.c</code> (および <code class="ic">insertion_sort.c</code>) とリンクして計測・考察せよ。</p><ol><li><code class="ic">array_set_rand</code>: <code class="ic">a[0]〜a[n-1]</code> に <code class="ic">rand()</code> の値を代入。</li><li><code class="ic">array_set_sorted</code>: <code class="ic">0, 1, 2, …, n-1</code> を代入。</li><li><code class="ic">array_set_reverse</code>: <code class="ic">n, n-1, …, 1</code> を代入。</li><li><code class="ic">array_copy</code>: <code class="ic">r[0]〜r[n-1]</code> を <code class="ic">a[0]〜a[n-1]</code> にコピー。</li><li><code class="ic">sort_cpu</code>: サイズ <code class="ic">MAX_N</code> の double 配列を <code class="ic">malloc</code> で <code class="ic">a</code> に確保し, <code class="ic">n = MIN_N</code> から <code class="ic">MAX_N</code> 以下で毎回 2 倍 (<code class="ic">n *= 2</code>) に増やしながら「n の表示 → <code class="ic">array_copy</code> → <code class="ic">clock()</code> で <code class="ic">sort(n, a)</code> を計測 → <code class="ic">sort_check(n, a)</code> → <code class="ic">cpu = …</code> 表示」を繰り返し, 最後に <code class="ic">free(a)</code> する。</li></ol><p class="c-mute">ブラウザ内では <code class="ic">MIN_N=2, MAX_N=8</code> のまま動作確認します。本番の計測 (<code class="ic">MIN_N=2048, MAX_N=131074</code>, <code class="ic">-O0</code> / <code class="ic">-O2</code>) の実測表はクリア後に下の「考察」欄に表示されます。</p>',
      tests: [{ stdin: '', label: 'MIN_N=2, MAX_N=8 で乱数・正順・逆順を計測' }],
      hints: [
        '逆順は <code class="ic">a[i] = n - i;</code> (i=0 のとき n, i=n-1 のとき 1)。正順は <code class="ic">a[i] = i;</code>。',
        '<code class="ic">a = malloc(sizeof(double) * MAX_N);</code> を忘れずに! ループは <code class="ic">for (n = MIN_N; n &lt;= MAX_N; n *= 2)</code>。',
        '計測対象は <code class="ic">sort(n, a);</code> だけ (<code class="ic">array_copy</code> や <code class="ic">sort_check</code> は <code class="ic">clock()</code> の外に置く)。最後に <code class="ic">free(a);</code>。',
      ],
      check(outs, src) {
        const c = noCmt(src['sort_cpu.c']);
        if (!/clock\s*\(\s*\)/.test(c) || !/CLOCKS_PER_SEC/.test(c)) return { ok: false, msg: 'clock() と CLOCKS_PER_SEC で CPU 時間を計測してください' };
        if (!/malloc\s*\(\s*sizeof\s*\(\s*double\s*\)/.test(c)) return { ok: false, msg: 'sort_cpu 内で sizeof(double) * MAX_N バイトを malloc して a に代入してください' };
        const out = outs[0].out || '';
        for (const w of ['乱数', '正順', '逆順']) if (!out.includes(w)) return { ok: false, msg: '出力に「' + w + '」セクションがありません' };
        if (!/0\.00000[\s\S]*7\.00000/.test(out)) return { ok: false, msg: '正順データが 0.00000 〜 7.00000 になっていません (array_set_sorted を確認)' };
        if (!/8\.00000[\s\S]*1\.00000/.test(out)) return { ok: false, msg: '逆順データが 8.00000 〜 1.00000 になっていません (array_set_reverse は n - i)' };
        const cpuLines = out.split('\n').filter((l) => /cpu\s*=/.test(l));
        if (cpuLines.length < 9) return { ok: false, msg: '「n = … cpu = …」の行が 3 種類 × 3 回 = 9 行以上必要です (現在 ' + cpuLines.length + ' 行)' };
        const lk = leakMsg(outs); if (lk) return { ok: false, msg: lk };
        return { ok: true, msg: '生成データ・ソート検証 (sort_check)・CPU時間出力・free まで完璧です! 下の考察欄に gcc (-O0 / -O2) の実測表があります。' };
      },
      observe: () =>
        '<p><b>gcc 実測表 (サンドボックス計測)</b> — 単純選択法と単純挿入法の <code class="ic">-O0</code> / <code class="ic">-O2</code> 比較</p>' +
        cpuTable(['sel_O0', 'sel_O2', 'ins_O0', 'ins_O2'], [
          '① 単純選択法 (最適化なし gcc -O0)',
          '② 単純選択法 (最適化あり gcc -O2)',
          '③ 単純挿入法 (最適化なし gcc -O0)',
          '④ 単純挿入法 (最適化あり gcc -O2)',
        ]) +
        '<p class="c-mute"><b>考察のポイント:</b> (a) <code class="ic">-O2</code> を付けると約 3〜5 倍高速になる。(b) <b>単純選択法</b>は常に <code class="ic">n(n-1)/2</code> 回比較するため乱数・正順・逆順で時間がほぼ同じで, n が 2 倍になると時間は<b>約 4 倍 = O(n²)</b>。(c) <b>単純挿入法</b>は<b>正順データだけは毎回 1 回の比較で break するため O(n)</b> (一瞬で終わる) だが, 逆順は毎回先頭まで交換するため乱数の約 2 倍かかり O(n²) になる。</p>',
      obsLabel: '考察 (最適化の有無・初期データの違い・n と計算時間の関係)',
      obsTitle: '考察',
      noTrace: true,
      summary: '乱数・正順・逆順の配列生成関数とコピー関数, およびデータ数 n を 2 倍\nずつ増やしながらソート時間を clock() で計測する sort_cpu.c を完成させ,\n単純選択法・単純挿入法について最適化 (-O2) の有無や初期データによる\n計算時間の違いを計測・考察した。',
      reportTitle: '課題 7.5',
    },
    {
      id: '7-6', label: '7-6', short: 'クイックソート quick_sort', files: ['quick_sort.c'],
      given: pick('sort_test.c'), link: ['sort_test.c', 'quick_sort.c'], gcc: '-O2 sort_cpu.c quick_sort.c',
      starter: { 'quick_sort.c': S['quick_sort.c'] },
      title: '分割と再帰呼び出しによる高速ソート quick_sort.c',
      spec: '<p>基準値 <code class="ic">p = a[0]</code> 以下の要素を前半, 以上の要素を後半に分割し, 前半と後半を<b>再帰呼び出し</b>でソートする <code class="ic">void sort(int n, double *a)</code> を <b>quick_sort.c</b> に作成せよ。</p><pre class="code-mini">l = 0; r = n - 1; p = a[0];\nl &lt;= r である間 {\n  a[l] &lt; p の間 l++;\n  a[r] &gt; p の間 r--;\n  if (l &lt;= r) { a[l] と a[r] を交換; l++; r--; }\n}\nif (0 &lt; r)     sort(r + 1, a);       /* (1) a[0]〜a[r] の r+1 個 */\nif (l &lt; n - 1) sort(n - l, &amp;a[l]);  /* (2) a[l]〜a[n-1] の ?? 個, 先頭番地 ?? */</pre>',
      tests: [
        TC('so_hand', '手入力の 3 例'),
        TC('so_full', '資料の in.txt / exp.txt (全 50 行: 重複要素も多数)', { inName: 'in.txt', expName: 'exp.txt' }),
      ],
      hints: [
        '<code class="ic">a[l] &lt; p</code> と <code class="ic">a[r] &gt; p</code> には <b><code class="ic">=</code> を付けない</b> (付けるとすべて同じ値のとき範囲外に突き抜ける)。一方 <code class="ic">while (l &lt;= r)</code> と <code class="ic">if (l &lt;= r)</code> には <b><code class="ic">=</code> を付ける</b>。',
        '(2) <code class="ic">a[l]〜a[n-1]</code> の個数は <code class="ic">(n - 1) - l + 1 = n - l</code> 個, 先頭要素のアドレスは <code class="ic">&amp;a[l]</code> (または <code class="ic">a + l</code>)。',
      ],
      check(outs, src) {
        const c = noCmt(src['quick_sort.c']);
        if (/qsort/.test(c)) return { ok: false, msg: 'qsort ではなく自分でクイックソートを実装してください' };
        if ((c.match(/\bsort\s*\(/g) || []).length < 3) return { ok: false, msg: 'sort の中から sort を 2 か所再帰呼び出ししてください (前半と後半)' };
        return { ok: true, msg: '全 50 ケース通過! 乱数 n=65536 でも 0.014 秒 — O(n log n) の威力です。下の考察欄も確認しよう。' };
      },
      observe: () =>
        '<p><b>gcc -O2 実測表</b> — クイックソート (<code class="ic">p = a[0]</code>)</p>' +
        cpuTable(['quick_O2'], ['クイックソート (gcc -O2)']) +
        '<p class="c-mute"><b>考察のポイント:</b> 乱数データでは n=65536 でも約 0.014 秒 (単純選択法の約 150 倍以上高速!) で, n が 2 倍になると約 2.1 倍 = <b>O(n log n)</b>。一方, この実装は基準値を先頭 <code class="ic">p = a[0]</code> に固定しているため, <b>正順・逆順データでは毎回 1 個と n-1 個に偏って分割され, 再帰の深さが O(n), 計算時間が O(n²) に悪化</b>する (さらに環境によってはスタック領域不足になる)。</p>',
      obsLabel: '考察 (クイックソートの計算時間と初期データによる違い)',
      obsTitle: '考察',
      summary: 'p = a[0] を基準値として配列を前半と後半に分割し, 再帰呼び出しにより\n整列するクイックソートを quick_sort.c に作成し, sort_test.c で動作確認\nした後, sort_cpu.c とリンクして計算時間を計測・考察した。',
      reportTitle: '課題 7.6',
    },
    {
      id: '7-7', label: '7-7', short: '文字列ソート string_sort', files: ['string_sort.c'],
      given: pick('string_sort.h', 'string_sort_test.c'), link: ['string_sort_test.c', 'string_sort.c'], gcc: 'string_sort_test.c string_sort.c',
      starter: { 'string_sort.c': S['string_sort.c'] },
      title: '文字列の配列を辞書順にソートする string_sort.c',
      spec: '<p>単純選択法または単純挿入法の <code class="ic">sort</code> を書き換え, 2 次元文字配列 <code class="ic">char (*a)[STRLEN+1]</code> の先頭 <code class="ic">n</code> 個の文字列を辞書順にソートする <code class="ic">void string_sort(int n, char (*a)[STRLEN+1])</code> を <b>string_sort.c</b> に作成せよ。</p><ul><li>一時変数: <code class="ic">double tmp;</code> → <code class="ic">char tmp[STRLEN+1];</code></li><li>代入 (コピー): <code class="ic">x = y;</code> → <code class="ic">strcpy(x, y);</code></li><li>大小比較: <code class="ic">x &lt; y</code> → <code class="ic">strcmp(x, y) &lt; 0</code></li></ul>',
      tests: [
        TC('str1', '資料の例 (tanaka, yamada, suzuki, yamamoto, nakamura)', { inName: 'in.txt', expName: 'exp.txt' }),
        TC('str2', '重複を含む 6 単語 (apple が 2 つ)'),
      ],
      hints: [
        'C の文字配列は <code class="ic">=</code> で代入できず, <code class="ic">&lt;</code> で辞書順比較もできません (番地の比較になってしまう)。必ず <code class="ic">&lt;string.h&gt;</code> の <code class="ic">strcpy</code> と <code class="ic">strcmp</code> を使います。',
        '単純選択法なら比較は <code class="ic">if (strcmp(a[i], a[min]) &lt; 0) min = i;</code>, 交換は <code class="ic">strcpy(tmp, a[k]); strcpy(a[k], a[min]); strcpy(a[min], tmp);</code>。',
      ],
      check(outs, src) {
        const c = noCmt(src['string_sort.c']);
        if (!/strcmp\s*\(/.test(c)) return { ok: false, msg: '文字列の大小比較には strcmp を使ってください' };
        return { ok: true, msg: 'strcmp と strcpy への置き換えだけで, 数値ソートとまったく同じ骨格で文字列もソートできました!' };
      },
      summary: '単純選択法をもとに, 比較に strcmp, 文字列の交換に strcpy と一時配列\nchar tmp[STRLEN+1] を用いることで, 文字列配列を辞書順に整列する関数\nstring_sort を string_sort.c に作成した。',
      reportTitle: '課題 7.7',
    },
    {
      id: '7-8', label: '7-8', short: '構造体ソート str_sort', files: ['str_sort.c'],
      given: pick('str_sort.h', 'str_sort_test.c'), link: ['str_sort_test.c', 'str_sort.c'], gcc: 'str_sort_test.c str_sort.c',
      starter: { 'str_sort.c': S['str_sort.c'] },
      title: '構造体 record_t の配列を「年齢の昇順 → 身長の昇順」にソートする str_sort.c',
      spec: '<p>単純選択法を書き換え, <code class="ic">record_t</code> (name, age, stature) の配列を <b>age の昇順, ただし age が等しいものは stature の昇順</b>にソートする <code class="ic">void str_sort(int n, record_t *a)</code> を <b>str_sort.c</b> に作成せよ。</p><ul><li>一時変数: <code class="ic">record_t tmp;</code></li><li>構造体どうしは <b>そのまま <code class="ic">=</code> で丸ごと代入できる</b> (<code class="ic">tmp = a[k]; a[k] = a[min]; a[min] = tmp;</code>)。</li><li>「<code class="ic">x</code> が <code class="ic">y</code> より前」の条件式だけを書き換えれば完成!</li></ul>',
      tests: [
        TC('rec1', '資料の例 (6 人: age=21, 22 に同年齢あり)', { inName: 'in.txt', expName: 'exp.txt' }),
        TC('rec2', '同年齢・同身長を含む 5 人'),
      ],
      hints: [
        '「<code class="ic">a[i]</code> の方が <code class="ic">a[min]</code> より小さい (前に来る)」とは: ① <code class="ic">a[i].age &lt; a[min].age</code> <b>または</b> ② <code class="ic">a[i].age == a[min].age &amp;&amp; a[i].stature &lt; a[min].stature</code>。',
        '構造体は配列メンバー <code class="ic">name</code> を含んでいても <code class="ic">tmp = a[k];</code> 一発で中身ごとコピーできます! (B4 で学んだ性質)',
      ],
      check(outs, src) {
        const c = noCmt(src['str_sort.c']);
        if (!/\.age/.test(c) || !/\.stature/.test(c)) return { ok: false, msg: 'age と stature の両方を比較に使ってください' };
        return { ok: true, msg: '複数キー比較 (第1キー age, 第2キー stature) と構造体の丸ごと代入, ばっちりです!' };
      },
      summary: '単純選択法をもとに, 一時変数を record_t 型として構造体の代入で交換し,\nage が小さいか age が等しく stature が小さいときに最小値を更新する\nことで構造体配列を整列する str_sort を str_sort.c に作成した。',
      reportTitle: '課題 7.8',
    },
    {
      id: 'o7-1', label: 'Opt-1', short: 'バケツ法 bucket_sort', optional: true, files: ['bucket_sort.c'],
      given: pick('sort_test.c'), link: ['sort_test.c', 'bucket_sort.c'], gcc: '-O2 sort_cpu.c bucket_sort.c',
      starter: { 'bucket_sort.c': S['bucket_sort.c'] },
      title: '区間を m 等分して O(n) で整列するバケツ法 bucket_sort.c',
      spec: '<p>データの最小値 <code class="ic">min</code> と最大値 <code class="ic">max</code> を求め, 区間 <code class="ic">[min, max]</code> を <code class="ic">m = n / B</code> (B = 8〜32 程度, m ≥ 1) 等分し, 各バケツの要素数を数えて動的に配列 <code class="ic">b[i]</code> を割り当て, 各バケツ内を単純法でソートして順に連結する <code class="ic">void sort(int n, double *a)</code> を <b>bucket_sort.c</b> に作成せよ。</p>',
      tests: [
        TC('so_hand', '手入力の 3 例'),
        TC('so_full', '資料の in.txt / exp.txt (全要素同一の行も含む!)', { inName: 'in.txt', expName: 'exp.txt' }),
      ],
      hints: [
        '<b>全要素が同じ値 (<code class="ic">max == min</code>)</b> のケースが in.txt にあるので, 0 割りを防ぐため <code class="ic">if (max == min) return;</code> を最初に入れよう!',
        '区間番号は <code class="ic">idx = (int)((a[i] - min) / (max - min) * m);</code>。ただし <code class="ic">a[i] == max</code> のとき <code class="ic">idx == m</code> になるので <code class="ic">if (idx &gt;= m) idx = m - 1;</code> で丸める。',
        '借りた <code class="ic">b[i]</code> や <code class="ic">b</code>, カウンタ配列はすべて最後に <code class="ic">free</code> するのを忘れずに! (リーク検査あり)',
      ],
      check(outs, src) {
        const lk = leakMsg(outs); if (lk) return { ok: false, msg: lk };
        const c = noCmt(src['bucket_sort.c']);
        if (!/malloc\s*\(/.test(c)) return { ok: false, msg: '各バケツの配列を malloc で動的に確保してください' };
        return { ok: true, msg: 'バケツ分割 + 各バケツのソート + メモリ解放までリークなし! 下の考察欄で O(n) の実測値を確認しよう。' };
      },
      observe: () =>
        '<p><b>gcc -O2 実測表</b> — バケツ法 (<code class="ic">B = 16</code>)</p>' +
        cpuTable(['bucket_O2'], ['バケツ法 bucket_sort (gcc -O2)']) +
        '<p class="c-mute">n が 2 倍になると時間もほぼ <b>2 倍 = O(n)</b>! クイックソートが苦手とした正順・逆順データでも一様分布なので一瞬 (n=65536 で約 0.01 秒以下) で完了する。</p>',
      obsLabel: '考察 (バケツ法の計算時間)',
      obsTitle: '考察',
      summary: '最小値と最大値から区間を m = n/16 等分し, 各区間のデータ数を数えて\n動的配列 b[i] に振り分け, 各区間を単純挿入法で整列して連結する\nbucket_sort.c を作成し, 動作確認と計算時間の計測を行った。',
      reportTitle: 'オプション課題 7.1',
    },
    {
      id: 'o7-2', label: 'Opt-2', short: '頻度法 dc_sort', optional: true, files: ['dc_sort.c'],
      given: pick('sort_test.c'), link: ['sort_test.c', 'dc_sort.c'], gcc: '-O2 sort_cpu.c dc_sort.c',
      starter: { 'dc_sort.c': S['dc_sort.c'] },
      title: '1 本の作業配列 b と累積度数 d[k] で並べる頻度法 dc_sort.c',
      spec: '<p>バケツごとに malloc する代わりに, <code class="ic">a</code> と同じサイズ <code class="ic">n</code> の配列 <code class="ic">b</code> を 1 本だけ割り当て, 各区間の件数 <code class="ic">c[i]</code> と先頭位置 <code class="ic">d[0]=0, d[i+1]=d[i]+c[i]</code> を使って <code class="ic">b[d[k]] = a[i]; d[k]++;</code> で一気に振り分け, <code class="ic">a</code> に書き戻してから<b>単純挿入法</b>で仕上げる <code class="ic">void sort(int n, double *a)</code> を <b>dc_sort.c</b> に作成せよ。</p>',
      tests: [
        TC('so_hand', '手入力の 3 例'),
        TC('so_full', '資料の in.txt / exp.txt (全 50 行)', { inName: 'in.txt', expName: 'exp.txt' }),
      ],
      hints: [
        'Opt-1 と同じく <code class="ic">if (n &lt;= 1) return;</code> と <code class="ic">if (max == min) return;</code>, および <code class="ic">idx &gt;= m</code> の丸めを入れよう。',
        '<code class="ic">b</code> から <code class="ic">a</code> へコピーした時点で「各要素が本来の位置のすぐ近くにいる (だいたい整列済み)」ので, 最後に単純挿入法を 1 回かけるだけで O(n) で完全に整列します!',
      ],
      check(outs, src) {
        const lk = leakMsg(outs); if (lk) return { ok: false, msg: lk };
        const c = noCmt(src['dc_sort.c']);
        if (!/malloc\s*\(/.test(c)) return { ok: false, msg: '配列 b, c, d を malloc で動的に確保してください' };
        return { ok: true, msg: '累積和 d[k] による 1 配列振り分け + 単純挿入法の「ほぼ整列データ O(n)」特性の見事な組み合わせです!' };
      },
      observe: () =>
        '<p><b>gcc -O2 実測表</b> — 頻度法 (<code class="ic">dc_sort.c</code>)</p>' +
        cpuTable(['dc_O2'], ['頻度法 dc_sort (gcc -O2)']) +
        '<p class="c-mute">細かい malloc が不要なためバケツ法よりもさらにメモリアクセスが連続的になり, n=65536 でも数ミリ秒で完了する。</p>',
      obsLabel: '考察 (頻度法の計算時間)',
      obsTitle: '考察',
      summary: '各区間のデータ数 c から累積和で先頭位置配列 d を求め, 1 本の配列 b に\n振り分けてから単純挿入法で整列を仕上げる頻度法 dc_sort.c を作成し,\n動作確認と計算時間の計測を行った。',
      reportTitle: 'オプション課題 7.2',
    },
  ];

  tasks.forEach((t) => { t.solution = D.sol[t.id] || {}; });
  window.B7_TASKS = tasks;
})();
