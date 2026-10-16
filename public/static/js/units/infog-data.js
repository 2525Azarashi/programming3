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
