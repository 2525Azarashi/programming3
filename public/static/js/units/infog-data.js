/* =========================================================================
 *  各単元のインフォグラフィック配置
 *  window.INFOG[unit][chapId] = { at: { blockIndex: spec | [spec...] }, top: spec }
 *    at  … 元の blocks のインデックスの「直後」に挿入 (talk の after より前)
 *    top … 章の冒頭 (対話の直後) に挿入
 *  spec は Infog.make() に渡す (kind: bars / layout / pipeline / histo / donut / memstrip / stats / compare2)
 * ========================================================================= */
(function () {
  'use strict';
  // glibc 互換ではない (分布を見るだけ) ので Math.random を使う
  const d6 = () => 1 + Math.floor(Math.random() * 6);

  window.INFOG = {
    b1: {
      data: {
        top: { kind: 'layout', tag: 'BIT MAP', title: '同じ 32 bit でも, 型が違えば<b>区切り方</b>が違う', total: 64,
          rows: [
            { label: '<code class="ic">char</code>', segs: [{ n: 8, name: '値', color: 'mint' }] },
            { label: '<code class="ic">int</code>', segs: [{ n: 1, name: '符号', color: 'pink' }, { n: 31, name: '値 (2の補数)', color: 'mint' }] },
            { label: '<code class="ic">float</code>', segs: [{ n: 1, name: '符号', color: 'pink' }, { n: 8, name: '指数部', color: 'lemon' }, { n: 23, name: '仮数部', color: 'sky' }] },
            { label: '<code class="ic">double</code>', segs: [{ n: 1, name: '符号', color: 'pink' }, { n: 11, name: '指数部', color: 'lemon' }, { n: 52, name: '仮数部', color: 'sky' }] },
          ], note: '左端の 1 bit はどの型でも<b>符号</b>。float / double は「指数部 × 仮数部」で小数を表す。' },
        at: {
          3: { kind: 'bars', tag: 'SIZE', title: 'C の型が使う<b>バイト数</b> (1 マス = 1 Byte)', max: 8,
            items: [
              { label: 'char', value: 1, unit: 'Byte', color: 'mint', cells: true },
              { label: 'int', value: 4, unit: 'Byte', color: 'sky', cells: true },
              { label: 'float', value: 4, unit: 'Byte', color: 'lav', cells: true },
              { label: 'double', value: 8, unit: 'Byte', color: 'pink', cells: true },
            ] },
        },
      },
      compile: {
        top: { kind: 'pipeline', tag: 'FLOW', title: 'ソースから実行まで — 3 ステップ',
          steps: [
            { icon: '.c', label: 'sq.c を書く', sub: 'エディタ', color: 'sky' },
            { icon: 'gcc', label: 'コンパイル', sub: '<code class="ic">gcc sq.c</code>', color: 'lemon' },
            { icon: 'exe', label: 'a.exe ができる', sub: '機械語', color: 'lav' },
            { icon: './a', label: '実行', sub: '<code class="ic">./a</code>', color: 'mint' },
          ] },
      },
      redirect: {
        top: { kind: 'stats', tag: '3 STREAMS', title: 'プログラムにつながっている<b>3 本の管</b>',
          items: [
            { value: 0, label: '<b>stdin</b><br>標準入力 (キーボード / <code class="ic">&lt; file</code>)', color: 'val' },
            { value: 1, label: '<b>stdout</b><br>標準出力 (画面 / <code class="ic">&gt; file</code>)', color: 'ok' },
            { value: 2, label: '<b>stderr</b><br>標準エラー出力 (<code class="ic">2&gt; file</code>)', color: 'addr' },
          ], note: '数字はファイル記述子の番号。<code class="ic">2&gt;</code> の「2」はこれ。' },
      },
      verify: {
        top: { kind: 'pipeline', tag: 'CHECK', title: '動作確認のループ — 自動でくり返せるのが強み',
          steps: [
            { icon: 'in', label: '入力ファイル', sub: 'in.txt', color: 'sky' },
            { icon: '&lt;&gt;', label: 'リダイレクト実行', sub: '<code class="ic">./a &lt; in &gt; out</code>', color: 'lemon' },
            { icon: 'diff', label: '比較', sub: '<code class="ic">diff out exp</code>', color: 'pink' },
            { icon: '✓', label: '何も出なければ OK', sub: '一致', color: 'mint' },
          ] },
      },
      array: {
        top: { kind: 'memstrip', tag: 'MEMORY', title: '<code class="ic">char s[] = "Hi!";</code> は <b>4 バイト</b> — 最後に <code class="ic">\\0</code>', base: 100, cell: 1,
          vars: [
            { name: 's[0]', type: 'char', size: 1, val: "'H'", color: 'mint' },
            { name: 's[1]', type: 'char', size: 1, val: "'i'", color: 'mint' },
            { name: 's[2]', type: 'char', size: 1, val: "'!'", color: 'mint' },
            { name: 's[3]', type: 'char', size: 1, val: "'\\0'", color: 'pink' },
          ], note: '<code class="ic">strlen(s)</code> は 3, <code class="ic">sizeof(s)</code> は 4。' },
      },
    },

    b2: {
      func: {
        top: { kind: 'compare2', tag: 'ANATOMY', title: '関数の 3 つの顔',
          lanes: [
            { title: '① プロトタイプ宣言', color: 'lemon', steps: ['戻り値の型・名前・引数の型を<b>予告</b>', '末尾は <code class="ic">;</code>', 'ヘッダファイルに置く'], result: '<code class="ic">double f(double, double);</code>' },
            { title: '② 定義', color: 'mint', steps: ['関数の<b>本体</b>', '<code class="ic">{ … }</code> の中に処理', 'return で値を返す'], result: '<code class="ic">double f(double x, double y) { … }</code>' },
            { title: '③ 呼び出し', color: 'pink', steps: ['実引数の<b>値がコピー</b>される', '新しいデータ領域ができる', 'return で消える'], result: '<code class="ic">m = f(a, b);</code>' },
          ] },
      },
      build: {
        top: { kind: 'pipeline', tag: 'BUILD', title: 'gcc の中身は <b>2 段階</b>',
          steps: [
            { icon: '.c', label: 'main.c / func.c', sub: 'ソース', color: 'sky' },
            { icon: '-c', label: 'コンパイル', sub: '<code class="ic">gcc -c</code>', color: 'lemon' },
            { icon: '.o', label: 'main.o / func.o', sub: 'オブジェクト (番地は仮)', color: 'lav' },
            { icon: 'ld', label: 'リンク', sub: '番地を確定', color: 'pink' },
            { icon: 'exe', label: 'a.exe', sub: '実行ファイル', color: 'mint' },
          ] },
      },
      split: {
        top: { kind: 'donut', tag: 'SPLIT', title: 'ave5 の 3 ファイル分割 — 行数の内訳', unit: ' 行', center: 3, centerLabel: 'ファイル',
          segs: [
            { label: '<b>ave5main.c</b> — main (入出力)', v: 14, color: 'pink' },
            { label: '<b>ave5.c</b> — 計算の関数', v: 9, color: 'mint' },
            { label: '<b>ave5.h</b> — プロトタイプ', v: 2, color: 'lemon' },
          ], note: '役割ごとに分けると, 1 つのファイルを直しても<b>そこだけ再コンパイル</b>すればよい。' },
      },
      struct: {
        top: { kind: 'memstrip', tag: 'STRUCT', title: '<code class="ic">point_t</code> は double 2 つ = <b>16 バイト</b>のひとかたまり', base: 100, cell: 4,
          vars: [
            { name: 'p.x', type: 'double', size: 8, val: '1.0', color: 'mint' },
            { name: 'p.y', type: 'double', size: 8, val: '2.0', color: 'sky' },
          ], note: 'メンバーは宣言順に並ぶ。代入 <code class="ic">q = p;</code> で 16 バイトまるごとコピーされる。' },
      },
      rand: {
        at: {
          3: { kind: 'histo', tag: 'SIMULATION', title: 'サイコロ 2 個の目の和 — 6000 回ふると…', lo: 2, hi: 12, n: 6000, sim: () => d6() + d6(),
            note: '一様乱数を足すと, 真ん中 (7) がいちばん出やすい<b>山型</b>になる。課題 3-10 は 3 個版。' },
        },
      },
    },

    b3: {
      intro: {
        at: {
          0: { kind: 'compare2', tag: 'WHY', title: '値をコピーするか, <b>番地</b>をコピーするか',
            lanes: [
              { title: '値渡し <code class="ic">triple(x, y)</code>', color: 'sky', steps: ['x の<b>値 1</b> を p にコピー', 'triple が p を 3 倍', 'p は triple の中だけの変数'], result: 'main の x は <b>1 のまま</b>' },
              { title: 'ポインタ渡し <code class="ic">triple(&amp;x, &amp;y)</code>', color: 'pink', steps: ['x の<b>番地 100</b> を p にコピー', '<code class="ic">*p</code> = 100 番地 = x', 'x そのものを 3 倍'], result: 'main の x は <b>3 になる</b>' },
            ] },
        },
      },
      addr: {
        at: {
          3: { kind: 'memstrip', tag: 'ADDRESS', title: 'p1 の答え — <b>型の大きさ</b>だけ番地が進む', base: 100, cell: 4,
            vars: [
              { name: 'a', type: 'int', size: 4, val: '7', color: 'mint' },
              { name: 'b', type: 'double', size: 8, val: '1.5', color: 'sky' },
              { name: 'c', type: 'int', size: 4, val: '9', color: 'mint' },
            ], note: 'a = 100 (0x64), b = 104 (0x68), c = <b>112 (0x70)</b>。' },
        },
      },
      deref: {
        at: {
          5: { kind: 'memstrip', tag: 'POINTER', title: '<code class="ic">p = &amp;a;</code> — p の中身は <b>a の番地</b>', base: 100, cell: 4,
            vars: [
              { name: 'a', type: 'int', size: 4, val: '123', color: 'mint' },
              { name: 'b', type: 'int', size: 4, val: '0', color: 'mint' },
              { name: 'p', type: 'int *', size: 8, val: '100', color: 'pink', ptrTo: 'a' },
            ], note: 'ポインタは 8 バイト (64 bit 環境)。<code class="ic">*p</code> と書くと矢印の先 = a になる。' },
        },
      },
      func: {
        top: { kind: 'stats', tag: 'RETURN', title: '関数から返せる値の数',
          items: [
            { value: 1, label: '<code class="ic">return</code> で返せる値', color: 'sky' },
            { value: 2, label: 'divrem (課題 3-4) — 商と剰余', color: 'pink' },
            { value: 99, suffix: '+', label: 'ポインタ引数なら<b>いくつでも</b>', color: 'ok' },
          ] },
      },
      struct: {
        top: { kind: 'bars', tag: 'COPY COST', title: '引数で<b>コピーされる</b>バイト数', max: 48,
          items: [
            { label: '<code class="ic">item_t x</code> (値渡し)', value: 48, unit: 'Byte', color: 'peach' },
            { label: '<code class="ic">item_t *x</code> (ポインタ)', value: 8, unit: 'Byte', color: 'mint' },
          ], note: 'item_t = name[32] + int + double (+ 詰め物) で 48 バイト。ポインタなら<b>番地の 8 バイト</b>だけ。' },
      },
      array: {
        at: {
          1: { kind: 'memstrip', tag: 'ARRAY', title: '<code class="ic">int x[5]</code> — <code class="ic">x + i</code> は <b>4i バイト</b>先', base: 100, cell: 4,
            vars: [0, 10, 20, 30, 40].map((v, i) => ({ name: 'x[' + i + ']', type: 'int', size: 4, val: String(v), color: i === 2 ? 'lemon' : 'mint' })).concat([{ name: 'p', type: 'int *', size: 8, val: '108', color: 'pink', ptrTo: 'x[2]' }]),
            note: '<code class="ic">p = &amp;x[2];</code> → p は 108。<code class="ic">p[1]</code> = <code class="ic">*(p+1)</code> = x[3] = 30。' },
        },
      },
    },
  };
})();
/* 追加分 */
(function () {
  'use strict';
  const I = window.INFOG;
  I.b2.header = { top: { kind: 'compare2', tag: 'INCLUDE', title: '<code class="ic">&lt; &gt;</code> と <code class="ic">" "</code> — どこを探す?',
    lanes: [
      { title: '<code class="ic">#include &lt;stdio.h&gt;</code>', color: 'sky', steps: ['<b>システム</b>のヘッダ置き場を探す', '/usr/include など', 'printf・scanf などの宣言'], result: 'すでに<b>用意されたもの</b>' },
      { title: '<code class="ic">#include "ave5.h"</code>', color: 'lav', steps: ['<b>同じフォルダ</b>から探す', '見つからなければシステムへ', '自作関数のプロトタイプ'], result: '<b>自分で作ったもの</b>' },
    ] } };
  I.b2.summary = { top: { kind: 'stats', tag: 'RECAP', title: 'B2 をふりかえる', items: [
    { value: 3, label: '関数の顔 (宣言・定義・呼び出し)', color: 'lemon' },
    { value: 2, label: 'gcc の段階 (コンパイル → リンク)', color: 'pink' },
    { value: 16, suffix: 'B', label: 'point_t 1 個 (double × 2)', color: 'mint' },
    { value: 7, label: 'サイコロ 2 個の和で一番多い目', color: 'vio' },
  ] } };
  I.b1.summary = { top: { kind: 'stats', tag: 'RECAP', title: 'B1 をふりかえる', items: [
    { value: 32, suffix: 'bit', label: 'int / float の大きさ', color: 'mint' },
    { value: 3, label: '標準ストリーム (in / out / err)', color: 'val' },
    { value: 0, label: 'diff が何も出さない = 一致', color: 'ok' },
    { value: 1, label: '文字列の末尾に足される \\0 の数', color: 'pink' },
  ] } };
  I.b3.summary = { top: { kind: 'stats', tag: 'RECAP', title: 'B3 をふりかえる', items: [
    { value: 2, label: '新しい演算子 <code class="ic">&amp;</code> と <code class="ic">*</code>', color: 'pink' },
    { value: 8, suffix: 'B', label: 'ポインタ 1 個の大きさ (64 bit)', color: 'sky' },
    { value: 4, suffix: 'B', label: 'int 配列で x+1 が進む量', color: 'mint' },
    { value: 12, label: 'ページ上で解ける課題', color: 'ok' },
  ] } };
  I.b3.func = I.b3.func || {};
  I.b3.func.at = { 2: { kind: 'memstrip', tag: 'CALL', title: '<code class="ic">func(pa)</code> — コピーされるのは<b>番地</b>', base: 100, cell: 4,
    vars: [
      { name: 'a', type: 'int', size: 4, val: '456', color: 'mint' },
      { name: 'pa', type: 'int *', size: 8, val: '100', color: 'pink', ptrTo: 'a' },
      { name: 'pa′', type: 'func の int *', size: 8, val: '100', color: 'peach', ptrTo: 'a' },
    ], note: 'main の pa と func の pa は<b>別の変数</b>だが, 中身は同じ番地 100。だから両方とも a を指す。' } };
})();
/* B4 */
(function () {
  'use strict';
  const I = window.INFOG;
  I.b4 = {
    intro: { top: { kind: 'stats', tag: 'B4 IN NUMBERS', title: 'この単元で扱うデータの大きさ', items: [
      { value: 2, label: '重ねる [ ] の数 (2 次元配列)', color: 'pink' },
      { value: 3, suffix: 'B', label: 'pixel_t 1 画素 (r, g, b)', color: 'mint' },
      { value: 255, label: 'unsigned char の最大値', color: 'lemon' },
      { value: 768, suffix: 'KB', label: '512×512 画像の画素データ', color: 'sky' },
    ] } },
    arr2d: { at: {
      2: { kind: 'grid2d', tag: 'ROW-MAJOR', title: '<code class="ic">int d[3][2]</code> — 表はメモリの中で<b>1 列</b>に並ぶ', rows: 3, cols: 2, size: 4, base: 100, name: 'd', val: (i, j) => 10 * i + j,
        note: '後ろの添字 j が先に増える (行優先)。d[i][j] の番地 = 100 + (i×2 + j)×4。カードにマウスを乗せると対応が光る。' },
    } },
    func2d: { top: { kind: 'pipeline', tag: 'MATRIX.C', title: '課題 4-1 — matrix.c を 1 関数ずつ育てる',
      steps: [
        { icon: '1', label: 'matrix_print', sub: '<code class="ic">" %9.5f"</code>', color: 'sky' },
        { icon: '2', label: 'matrix_scan', sub: 'プロンプトは stderr', color: 'lemon' },
        { icon: '+', label: 'sum / trans', sub: '和・転置 ×2', color: 'lav' },
        { icon: 'x', label: 'vector', sub: 'scan / print', color: 'peach' },
        { icon: 'Ax', label: 'prod', sub: 'y = A x', color: 'mint' },
      ] } },
    structarr: { at: {
      0: { kind: 'pixels', tag: 'PIXEL_T', title: '<code class="ic">pixel_t</code> の 3 バイトが, そのまま色になる', cols: 4,
        px: [[255, 0, 0], [0, 255, 0], [0, 0, 255], [255, 0, 255], [255, 255, 255], [0, 0, 0], [255, 128, 128], [204, 179, 207]],
        label: (k) => ['赤', '緑', '青', '赤紫', '白', '黒', 'ピンク', '涼しげ'][k],
        note: '各色 0〜255 の 256 階調 × 3 色 = 約 1677 万色。数値が大きいほど明るい。' },
    } },
    structmem: { top: { kind: 'bars', tag: 'LAYOUT', title: '<code class="ic">item_t</code> のメンバーが使うバイト数', max: 32,
      items: [
        { label: '<code class="ic">char name[32]</code>', value: 32, unit: 'Byte', color: 'pink' },
        { label: '<code class="ic">int price</code>', value: 4, unit: 'Byte', color: 'mint', cells: true },
        { label: '<code class="ic">double weight</code>', value: 8, unit: 'Byte', color: 'sky', cells: true },
      ], note: '宣言順に並ぶ (実際の gcc では double の位置合わせのため 4 バイトの詰め物が入り, sizeof は 48)。' } },
    bitmap: { top: { kind: 'donut', tag: 'BMP FILE', title: '128×80 の BMP ファイルの中身', unit: ' B', center: 30774, centerLabel: 'バイト',
      segs: [
        { label: '<b>ヘッダ</b> bmp_header_t (幅・高さなど)', v: 54, color: 'lemon' },
        { label: '<b>画素データ</b> 128×80×3 (下の行から B, G, R)', v: 30720, color: 'pink' },
      ], note: 'ヘッダはほんの 54 バイト。ほとんどが画素の 2 次元配列。' } },
    summary: { top: { kind: 'stats', tag: 'RECAP', title: 'B4 をふりかえる', items: [
      { value: 5, label: 'd[2][1] は d[0][0] から何個目? (2×2+1)', color: 'pink' },
      { value: 3, label: 'n=3 の自己転置での交換回数', color: 'lemon' },
      { value: 8, label: 'フレームの幅 (画素)', color: 'mint' },
      { value: 16, label: 'ページ上で解ける課題', color: 'ok' },
    ] } },
  };
})();
/* T1 中間試験 */
(function () {
  'use strict';
  const I = window.INFOG;
  I.t1 = {
    format: { top: { kind: 'stats', tag: 'T1 IN NUMBERS', title: '中間試験 T1 を数字で', items: [
      { value: 4, suffix: '問', label: '問題数 (各 5 点)', color: 'pink' },
      { value: 10, suffix: '点', label: '合格ライン (20 点満点)', color: 'ok' },
      { value: 70, suffix: '分', label: '試験時間', color: 'lemon' },
      { value: 0, suffix: '個', label: '持ち込める資料 (時計と筆記用具のみ)', color: 'sky' },
    ] } },
    scoring: { top: { kind: 'pipeline', tag: 'GRADING', title: '1 問の採点の流れ — どこで落ちても 0 点',
      steps: [
        { icon: '1', label: '指定の名前・フォルダ', sub: '違えば採点対象外', color: 'lemon' },
        { icon: '2', label: 'コンパイル', sub: 'エラーなら 0 点', color: 'lav' },
        { icon: '3', label: '問題の入力で diff -Bw', sub: '1 文字違えば 0 点', color: 'pink' },
        { icon: '4', label: '別の入力で diff -Bw', sub: '隠しテスト', color: 'peach' },
        { icon: '5', label: '題意どおりか', sub: 'コードを読まれる', color: 'mint' },
      ] } },
    focus: { top: { kind: 'donut', tag: 'FOCUS', title: '名指しされた 7 つの例題・課題の内訳', unit: ' 個', center: 7, centerLabel: '重点',
      segs: [
        { label: '<b>ポインタ引数</b> 例題(3-4) 課題(3-4)(3-5)', v: 3, color: 'pink' },
        { label: '<b>構造体ポインタ</b> 例題(3-5) 課題(3-7)', v: 2, color: 'lav' },
        { label: '<b>配列と乱数</b> 課題(3-10)', v: 1, color: 'mint' },
        { label: '<b>2 次元配列と行列</b> 課題(4-1)', v: 1, color: 'lemon' },
      ] } },
    skills: { top: { kind: 'pipeline', tag: 'EVERY PROBLEM', title: '本番で毎問くり返す 4 手',
      steps: [
        { icon: '✎', label: '保存', sub: '指定の名前で', color: 'lemon' },
        { icon: 'gcc', label: 'gcc a.c b.c', sub: '分割コンパイル', color: 'lav' },
        { icon: '&lt;&gt;', label: './a &lt; in &gt; out', sub: 'リダイレクト', color: 'sky' },
        { icon: '=', label: 'diff -Bw', sub: '何も出なければ OK', color: 'mint' },
      ] } },
  };
})();
