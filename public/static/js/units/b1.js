/* =========================================================================
 *  B1 Cプログラミングの基礎事項 — 章コンテンツ
 *  出典: 配布資料「[B1] Cプログラミングの基礎事項」と講義スライド「B1.pdf」
 * ========================================================================= */
(function () {
  'use strict';
  const { h, icon } = U;
  const C = window.B1_CODE;

  function hero() {
    const bits = '00000000000000000000000000001011';
    const svg = '<svg viewBox="0 0 520 420" role="img" aria-label="int 11 の bit パターンと, stdin / stdout / stderr の流れ">' +
      '<defs>' + [['in', '#1497ab'], ['out', '#22a461'], ['err', '#d97f00']].map(([k, c]) => `<marker id="b1h-${k}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="${c}"/></marker>`).join('') + '</defs>' +
      '<text x="20" y="30" class="hm-t" font-size="12" style="fill:#d97f00" fill-opacity=".85">int x = 11;   /* 32 bit = 4 Byte */</text>' +
      bits.split('').map((b, i) => `<rect x="${20 + i * 15.4}" y="42" width="13.4" height="30" rx="3" class="hb${b === '1' ? ' on' : ''}${i === 0 ? ' sg' : ''}"/><text x="${26.7 + i * 15.4}" y="62" text-anchor="middle" class="hm-t" font-size="11" style="fill:${b === '1' ? '#ffffff' : '#c4b2bd'}">${b}</text>`).join('') +
      '<text x="20" y="94" class="hm-t" font-size="11" fill-opacity=".55">(値) = 2³ + 2¹ + 2⁰ = 11</text>' +
      '<g class="fl-box prog"><rect x="190" y="188" width="140" height="84" rx="14"/><text x="260" y="226" text-anchor="middle" class="t1">a.exe</text><text x="260" y="250" text-anchor="middle" class="t2">プログラム</text></g>' +
      '<g class="fl-box"><rect x="14" y="150" width="116" height="52" rx="12"/><text x="72" y="181" text-anchor="middle" class="t1">stdin</text></g>' +
      '<g class="fl-box"><rect x="392" y="136" width="116" height="52" rx="12"/><text x="450" y="167" text-anchor="middle" class="t1">stdout</text></g>' +
      '<g class="fl-box"><rect x="392" y="276" width="116" height="52" rx="12"/><text x="450" y="307" text-anchor="middle" class="t1">stderr</text></g>' +
      '<path d="M130 176 C 168 178, 160 220, 188 224" class="fl-arr in" marker-end="url(#b1h-in)"/>' +
      '<path d="M330 214 C 362 210, 360 166, 390 163" class="fl-arr out" marker-end="url(#b1h-out)"/>' +
      '<path d="M330 248 C 362 254, 360 300, 390 302" class="fl-arr err" marker-end="url(#b1h-err)"/>' +
      '<text x="20" y="378" class="hm-t" font-size="13"><tspan style="fill:#a08a99">$</tspan> ./a <tspan style="fill:#1497ab">&lt; in.txt</tspan> <tspan style="fill:#22a461">&gt; out.txt</tspan></text>' +
      '<text x="20" y="402" class="hm-t" font-size="13"><tspan style="fill:#a08a99">$</tspan> diff -Bw out.txt exp.txt<tspan style="fill:#a08a99">   # 何も出なければ OK</tspan></text>' +
      '</svg>';
    return h('section.u-hero',
      h('div.u-hero-grid',
        h('div',
          h('div.code-id', 'UNIT B1 — C BASICS'),
          h('h1', 'Cの基礎', h('br'), h('em.ok', '< in > out')),
          h('p.tag', 'データは bit の並び。型がその意味を決める。', h('br'), h('span', '入力と出力の流れを意識して, 動作確認は diff で。')),
          h('div.u-stats',
            h('div', h('b', '6'), '章'),
            h('div', h('b', '8+2'), '課題 (オプション含む)'),
            h('div', h('b', '6'), '予想問題')),
          h('div.cta',
            h('a.btn.ptr', { href: '#data' }, '学習を始める', icon('arrow')),
            h('a.btn', { href: '#lab' }, '課題ラボへ'),
            h('a.btn.ghost', { href: '#report' }, 'レポート作成'))),
        h('div.hero-mem.b1', { html: svg })));
  }

  const SQEXP = '1 1\n2 4\n3 9\n4 16\n5 25\n6 36\n7 49\n8 64\n9 81\n10 100\n';

  const chapters = [
    {
      id: 'data', num: '00', group: 'デジタルデータ', kicker: 'Bits & Types', navTitle: 'bit と型',
      title: 'メモリの中身は, 0 と 1 の並びだけ。',
      lead: 'デジタルデータの最小単位は bit (電気信号の on/off = 1/0)。8 bit 並べたものが 1 Byte。同じ bit パターンでも「型」によって意味がまったく違う — これが C を書くうえでの出発点。',
      blocks: [
        { type: 'compare', title: '講義スライド「デジタルデータの流れ」', items: [
          { title: '<span class="chip val">入力</span> キーボード', html: '打ち込んだ文字がプログラムへ流れ込む。C では <b>stdin (標準入力)</b> から scanf で受け取る。' },
          { title: '<span class="chip ptr">制御 &amp; 演算</span> CPU + メモリ', html: '変数は短期記憶 (メモリ) 上の bit パターン。長期記憶 (ファイル) とも読み書きする。' },
          { title: '<span class="chip ok">出力</span> 画面表示', html: '結果は <b>stdout (標準出力)</b>, メッセージは <b>stderr (標準エラー出力)</b> へ。' },
        ] },
        { type: 'bits', title: '<span class="chip">TRY</span> 値を変えて bit パターンを観察 — 講義スライド「int / float / char 型の bit パターン」' },
        { type: 'point', n: 1, title: 'データの「型」に応じて bit パターンの意味が異なる', sub: '<b>int</b> 32 bit の 2 の補数 (最上位 bit が符号) / <b>float</b> 符号 1 + 指数部 8 + 仮数部 23 bit / <b>double</b> 64 bit (IEEE 754) / <b>char</b> 1 Byte の文字コード (ASCII)。<b>プログラマの責任で管理しなければならない。</b>' },
        { type: 'predict', id: 'q1', code: C.ovf, q: 'int (32 bit 符号付き) の最大値に 1 を足すと, 表示される値は?', choices: ['<code>2147483648</code>', '<code>-2147483648</code>', 'エラーで止まる'], answer: 1, explain: '0111…1 に 1 を足すと <b>1000…0</b>。最上位 bit (符号) が 1 になるので, 2 の補数表現では <b>−2147483648</b>。上の bit ビューアで int に <code class="ic">2147483648</code> を入れてみよう。これが<b>オーバーフロー</b>。' },
        { type: 'predict', id: 'q2', code: C.chr, q: '文字 \'A\' を %c と %d で表示し, さらに +2 した値を %c で表示すると?', placeholder: '例: A ?\n?', explain: 'char は文字コード (数) を記憶しているだけ。<code class="ic">\'A\'</code> の ASCII コードは <b>65</b>。%c なら文字, %d なら数として表示される。65+2 = 67 は <b>C</b>。' },
        { type: 'callout', kind: 'warn', html: '<b>printf / scanf の書式を間違えると, わけのわからない値が表示される</b> (講義スライド)。bit パターンを別の型として読んでしまうから。このサイトは <code class="ic">printf("%d", 1.5)</code> のような食い違いをエラーで教えてくれますが, gcc では警告だけで実行されてしまいます。' },
        { type: 'mistakes', items: [
          { title: 'double を %d で表示', code: '#include <stdio.h>\n\nint main(void)\n{\n    double x = 1.5;\n    printf("%d\\n", x);\n    return 0;\n}\n', fix: 'double は <code class="ic">%f</code> (小数点以下 3 桁なら <code class="ic">%0.3f</code>) で表示する。' },
          { title: 'double を %f で読み込む', code: '#include <stdio.h>\n\nint main(void)\n{\n    double a;\n    scanf("%f", &a);\n    printf("%f\\n", a);\n    return 0;\n}\n', stdin: '2.5', fix: 'scanf で double を読むときは <code class="ic">%lf</code> (エル・エフ)。printf の %f と<b>違う</b>ので要注意。' },
        ] },
      ],
    },
    {
      id: 'compile', num: '01', group: '1. 標準入出力', kicker: '1.1 コンパイルと実行', navTitle: 'コンパイルと実行',
      title: 'gcc で機械語に。./a で実行。',
      lead: 'C のソースは人間用のテキスト。gcc がコンピュータの機械語 (実行ファイル a.exe) に翻訳する。エラーメッセージは, 行番号を手がかりに読む。',
      blocks: [
        { type: 'shell', name: '例題 (1-1) sq.c — Cygwin64', files: { 'sq.c': C.sq }, cmds: ['gcc sq.c', './a', 'ls', 'cat sq.c'], intro: '<b>ボタンを押すか, コマンドを打ち込んで Enter。</b> <code class="ic">gcc sq.c</code> で a.exe ができ, <code class="ic">./a</code> で実行される (<code class="ic">./</code> は「このフォルダの」)。', goals: [
          { text: '<code class="ic">gcc sq.c</code> でコンパイルする', test: (hs) => hs.some((x) => /^gcc\b.*sq\.c/.test(x.cmd) && x.ok) },
          { text: '<code class="ic">./a</code> で実行して 10 100 まで表示させる', test: (hs) => hs.some((x) => /^\.\/a\b/.test(x.cmd) && x.result && /10 100/.test(x.result.out)) },
        ] },
        { type: 'prose', html: '<p>よくあるエラーには<b>必ず目を通しておくこと</b> (配布資料)。下の 3 つを実際に起こしてみよう。左のエディタで直してから, もう一度 <code class="ic">gcc</code> を実行するとエラーが消えます。</p>' },
        { type: 'shell', name: 'よくあるエラー 3 選', editable: ['err1.c', 'err2.c', 'err3.c'], files: { 'err1.c': C.err1, 'err2.c': C.err2, 'err3.c': C.err3 },
          cmds: [{ cmd: 'gcc err1.c', label: 'gcc err1.c (全角スペース)' }, { cmd: 'gcc err2.c', label: 'gcc err2.c (関数名の誤り)' }, { cmd: 'gcc err3.c', label: 'gcc err3.c (; 忘れ)' }], goals: [
          { text: 'err1.c の<b>全角スペース</b>を見つけて直し, コンパイルを通す', test: (hs, api) => hs.some((x) => /^gcc.*err1\.c/.test(x.cmd) && x.ok) && !/\u3000/.test(api.text('err1.c')) },
          { text: 'err2.c の <code class="ic">undefined reference</code> (リンカーのエラー) を直す', test: (hs) => hs.some((x) => /^gcc.*err2\.c/.test(x.cmd) && x.ok) },
          { text: 'err3.c の <code class="ic">;</code> 忘れを直す', test: (hs) => hs.some((x) => /^gcc.*err3\.c/.test(x.cmd) && x.ok) },
        ] },
        { type: 'cheat', items: [
          { c: "stray '\\343'", d: '文字列 ("…" の中) 以外に<b>全角文字</b>がある。特に<b>全角スペース</b>は見えないので注意。セミコロン・コンマ・クォーテーションも。行番号を手がかりに探す。', code: "xxxx.c:5: error: stray '\\343' in program" },
          { c: 'undefined reference', d: 'コンパイラではなく<b>リンカー</b>のメッセージ。関数名 (この例では prinf) が間違っているときに出る。', code: "undefined reference to `prinf'\ncollect2: ld returned 1 exit status" },
          { c: 'gcc -Wall', d: '様々な警告を表示してくれる。<b>原因のわかりにくいバグで困った場合</b>に, 一度このオプションでコンパイルしてみると手がかりが見つかることがある。', code: '$ gcc -Wall xxx.c' },
        ] },
      ],
    },
    {
      id: 'redirect', num: '02', group: '1. 標準入出力', kicker: '1.2 リダイレクトと diff / 1.3 stdout と stderr', navTitle: 'リダイレクトと stderr',
      title: '出力は 2 本, 入力は 1 本。',
      lead: 'プログラムには出力が 2 つ (標準出力 stdout と標準エラー出力 stderr), 入力が 1 つ (標準入力 stdin) ある。「>」「<」で行き先をファイルに切り替えられる。',
      blocks: [
        { type: 'flow', title: '<span class="chip">TRY</span> リダイレクトを ON/OFF して, データの流れを見よう — 講義スライド「$ ./a.exe ＞ file.txt」「$ ./a.exe ＜ file.txt」' },
        { type: 'point', n: 2, title: 'データは stdout へ, プロンプトやエラーメッセージは stderr へ', sub: '<code class="ic">fprintf(stderr, "…")</code> は printf の出力先を指定するバージョン。<code class="ic">printf("…")</code> は <code class="ic">fprintf(stdout, "…")</code> と等価。' },
        { type: 'predict', id: 'q3', code: C.sq2bad, stdin: '10', q: 'この sq2.c を <code class="ic">./a &gt; out.txt</code> で実行して 10 を入力した。out.txt の <b>1 行目</b>は?', choices: ['<code>1 1</code>', '<code>nを入力して下さい: 1 1</code>', '空行'], answer: 1, explain: 'プロンプトも printf (= stdout) で出しているので, <b>out.txt にプロンプトが混ざる</b>。だから <code class="ic">diff -w out.txt sq-exp.txt</code> で差分が出てしまう。下のステップ実行で, 出力欄を「端末」「stdout」で切り替えて比べよう。' },
        { type: 'compare', title: '例題 (1-3) — printf のプロンプト vs fprintf(stderr) のプロンプト', items: [
          { title: '<span class="chip ng">✗</span> printf で出す', code: 'printf("nを入力して下さい: ");\nscanf("%d", &n);', html: 'プロンプトがデータと同じ stdout に出る。リダイレクトすると out.txt に入ってしまう。' },
          { title: '<span class="chip ok">✓</span> fprintf(stderr, …) で出す', code: 'fprintf(stderr, "nを入力して下さい: ");\nscanf("%d", &n);', html: 'stderr はリダイレクトしても<b>画面に残る</b>。out.txt にはデータだけが入り, diff の差分はなくなる。' },
        ] },
        { type: 'shell', name: '例題 (1-2)(1-3) — リダイレクトと diff', editable: ['sq2.c'], files: { 'sq2.c': C.sq2bad, 'sq-exp.txt': SQEXP, 'n.txt': '10\n' }, cmds: ['gcc sq2.c', './a', './a < n.txt > out.txt', 'cat out.txt', 'diff -w out.txt sq-exp.txt'], intro: '<b>① まずこのまま</b> gcc → <code class="ic">./a &lt; n.txt &gt; out.txt</code> → diff で差分を確認。<b>② 左のエディタで printf を <code class="ic">fprintf(stderr, …)</code> に直し</b>, もう一度 gcc から。<code class="ic">./a</code> だけで実行するとキーボード入力待ちになります (10 と打って Enter)。', goals: [
          { text: '差分が出ることを確認する (プロンプトが out.txt に混ざる)', test: (hs) => hs.some((x) => x.diff && !x.diff.same) },
          { text: 'プロンプトを stderr に直して, <b>diff が何も表示しない</b>状態にする', test: (hs) => hs.some((x) => x.diff && x.diff.same) },
        ] },
        { type: 'cheat', items: [
          { c: './a > out.txt', d: '<b>出力リダイレクト</b>: stdout をファイルに切り替える (stderr は画面のまま)。', code: '$ ./a > out.txt' },
          { c: './a < in.txt', d: '<b>入力リダイレクト</b>: stdin をファイルに切り替える。入力した値は画面に表示されない。', code: '$ ./a < ave-in.txt' },
          { c: 'diff -Bw A B', d: '2 つのファイルの差分。<b>一致していれば何も表示されない。</b> <code class="ic">-w</code> 空白を無視, <code class="ic">-B</code> 空行を無視。', code: '$ diff -Bw out.txt xxx-exp.txt' },
        ] },
      ],
    },
    {
      id: 'verify', num: '03', group: '1. 標準入出力', kicker: '1.4 動作確認 / 1.5 終了判定', navTitle: '動作確認と EOF',
      title: '入力ファイル → 実行 → diff。毎回この手順で。',
      lead: '入力 (xxx-in.txt) と出力期待値 (xxx-exp.txt) が与えられている課題は, リダイレクトを用いて必ず動作確認を行う。そして, 何回入力されるか分からないときは EOF で終了を判定する。',
      blocks: [
        { type: 'callout', kind: 'warn', html: '<b>講義スライド「プログラムの動作確認」</b> — <code class="ic">$ ./a.exe &lt; xxx-in.txt &gt; out.txt</code> → <code class="ic">$ diff -Bw out.txt xxx-exp.txt</code>。<b>diff 不一致の解答は, 動作確認を行わず提出したと判断され, 無条件に再提出の対象となる。</b> 課題ラボの「テスト実行」はこの diff と同じ比較をします。' },
        { type: 'shell', name: '例題 (1-4) ave.c — 入力も出力もファイルで', files: { 'ave.c': C.ave, 'ave-in.txt': '1 2\n3 4\n5 6\n', 'ave-exp.txt': '1.500 1.414\n3.500 3.464\n5.500 5.477\n' }, cmds: ['gcc ave.c', './a < ave-in.txt', './a < ave-in.txt > out.txt', 'cat out.txt', 'diff out.txt ave-exp.txt'], intro: '<code class="ic">./a &lt; ave-in.txt</code> だけだと, 入力した値は画面に出ないので<b>プロンプトと結果が同じ行に並ぶ</b>。<code class="ic">&gt; out.txt</code> も付けると, 画面にはプロンプト (stderr) だけが残る。', goals: [
          { text: '<code class="ic">./a &lt; ave-in.txt &gt; out.txt</code> → diff で一致を確認する', test: (hs) => hs.some((x) => x.diff && x.diff.same) },
        ] },
        { type: 'prose', html: '<h4>終了判定 — 何回入力されるか分からないとき</h4><p>例題 (1-5) は <b>break 文</b> (a&lt;0 ならループを打ち切る), 例題 (1-6) は <b>EOF</b> ("end of file")。<code class="ic">scanf</code> は入力がもう無いとき <code class="ic">EOF</code> を返す。キーボードから入力する場合は <span class="kbd">Ctrl</span>+<span class="kbd">D</span> が入力の終了を表す。</p>' },
        { type: 'tracer', code: C.ave3, name: '例題 (1-6) ave3.c', stdin: '1 2\n3 4\n', showStdin: true, title: '例題 (1-6) ave3.c — 入力が尽きると scanf が EOF (= −1) を返して break。出力欄「端末」に ^D が見える' },
        { type: 'shell', name: 'ave3.c をキーボードで', files: { 'ave3.c': C.ave3 }, cmds: ['gcc ave3.c', './a'], intro: '<code class="ic">./a</code> で実行し, <b>1 2</b> Enter → <b>3 4</b> Enter → 最後に <b>Ctrl+D</b> (右のボタンでも可) で入力を終わらせよう。', goals: [
          { text: 'キーボードから 2 組入力し, Ctrl+D で終了させる', test: (hs) => hs.some((x) => /^\.\/a\s*$/.test(x.cmd) && x.result && (x.result.out.match(/\n/g) || []).length >= 2) },
        ] },
        { type: 'predict', id: 'q4', code: C.ave3, stdin: '1 2\n3\n', q: '入力が <code class="ic">1 2⏎3⏎</code> で終わった (2 組目の b がない)。stdout に出る行数は?', choices: ['1 行', '2 行', '3 行'], answer: 0, explain: '2 周目は a=3 を読めたが, b を読もうとして <b>EOF</b> → break。printf までたどり着かないので, 出力は <b>1.500 1.414 の 1 行</b>だけ。' },
      ],
    },
    {
      id: 'array', num: '04', group: '2. 配列と文字列', kicker: '2. 配列と文字列', navTitle: '配列と文字列',
      title: '配列で数える。文字列は \\0 で終わる char の配列。',
      lead: '配列 c[ ] の第 i 要素に i の出現回数を記録する — 「数える」の定番。文字列は文字 (char) の配列で, 最後にヌル文字 \'\\0\' を置く。だから「文字数 + 1」の要素数が必要。',
      blocks: [
        { type: 'tracer', code: C.count, name: '例題 (1-7) count.c', stdin: '0 1 2 3 0 1 4 1 2 3 0 0 0', showStdin: true, title: '例題 (1-7) count.c — c[i]++ のたびに, 該当する箱だけが増える' },
        { type: 'callout', kind: 'tip', html: '<code class="ic">assert(式)</code> は, 式が成立しなければエラーとしてプログラムを停止させる (assert.h が必要)。上の stdin に <code class="ic">7</code> を混ぜて Enter — 配列の外 c[7] に書き込む前に止まります。' },
        { type: 'point', n: 3, title: '文字列は, ヌル文字 \'\\0\' で終わる char の配列', sub: '<code class="ic">"Hi!"</code> は 3 文字 + \'\\0\' = <b>4 Byte</b>。<code class="ic">for (i=0; w[i]!=\'\\0\'; i++)</code> が文字列走査の決まった書き方。' },
        { type: 'tracer', code: C.str, name: '文字列と \\0', title: '文字列 — s[2] に \'\\0\' を書くと, そこで文字列が終わる' },
        { type: 'predict', id: 'q5', code: C.streq, stdin: 'END', q: '入力は <code class="ic">END</code>。出力は?', choices: ['<code>一致</code>', '<code>不一致</code>'], answer: 1, explain: '<code class="ic">w == "END"</code> は<b>文字の並びではなく, 配列の場所 (番地) を比べている</b>ので一致しない。文字列の比較には <code class="ic">strcmp(w, "END") == 0</code> を使う (講義スライド「文字列」)。' },
        { type: 'tracer', code: C.counte, name: '例題 (1-8) count_e.c', stdin: 'these\nthis\nsister\nEND\n', showStdin: true, title: '例題 (1-8) count_e.c — w[i] を 1 文字ずつ見て \'e\' を数える' },
        { type: 'predict', id: 'q6', code: C.sizeofs, q: '<code class="ic">strlen(s)</code> (文字数) と <code class="ic">sizeof(s)</code> (配列のバイト数) は?', placeholder: '例: 0 0', explain: '文字数は <b>3</b>, 配列は \'\\0\' の分も含めて <b>4</b> Byte。だから文字列を入れる配列は「文字数 + 1」で宣言する (例題の <code class="ic">char w[W_LEN+1]</code>)。' },
        { type: 'mistakes', items: [
          { title: '配列の外に書き込む', code: '#include <stdio.h>\n\nint main(void)\n{\n    int c[5];\n    int i;\n\n    for (i = 0; i <= 5; i++) { c[i] = 0; }\n    printf("%d\\n", c[0]);\n    return 0;\n}\n', fix: '要素数 5 の配列の添字は <b>0〜4</b>。<code class="ic">i &lt; 5</code> にする。gcc ではエラーにならず, 他の変数を壊すことがある (課題 1-6 で n の上限 10 を守る理由)。' },
          { title: '文字列を = で代入', code: '#include <stdio.h>\n\nint main(void)\n{\n    char w[8];\n    w = "abc";\n    printf("%s\\n", w);\n    return 0;\n}\n', fix: '配列に = で文字列は代入できない。<code class="ic">strcpy(w, "abc");</code> (string.h) を使う。' },
        ] },
      ],
    },
    {
      id: 'summary', num: '05', group: 'まとめ', kicker: 'Cheat sheet', navTitle: 'チートシート',
      title: 'B1 を 6 枚で。',
      blocks: [
        { type: 'cheat', items: [
          { c: 'int / double / char', d: '型によって bit パターンの意味もサイズも違う (4 / 8 / 1 Byte)。<b>書式も型に合わせる</b>。', code: 'printf("%d %f %c", i, x, c);\nscanf("%d %lf", &i, &x);' },
          { c: 'fprintf(stderr, …)', d: 'プロンプトとエラーメッセージは <b>stderr</b>, データは stdout。', code: 'fprintf(stderr, "n: ");\nprintf("%d\\n", n);' },
          { c: '< in > out', d: 'リダイレクトで stdin / stdout をファイルに切り替える。', code: '$ ./a < x-in.txt > out.txt' },
          { c: 'diff -Bw', d: '何も表示されなければ一致。<b>不一致は無条件に再提出</b>。', code: '$ diff -Bw out.txt x-exp.txt' },
          { c: '== EOF', d: '入力が尽きるまで繰り返す決まり文句。キーボードでは Ctrl+D。', code: 'for (;;) {\n  if (scanf("%d", &x)==EOF) { break; }\n}' },
          { c: "w[i] != '\\0'", d: '文字列は \\0 で終わる char 配列。比較は strcmp。', code: 'if (strcmp(w, "END")==0) { … }' },
        ] },
      ],
    },
    {
      id: 'lab', num: '06', group: '課題', kicker: 'Assignment Lab', navTitle: '課題ラボ',
      title: '書いて, テストして, diff で確かめる。',
      lead: 'このページ上で課題のコードを書き, 期待値との diff を自動チェック。「ターミナル」で配布資料どおりの gcc → リダイレクト → diff の手順も試せます。コードとメモは自動保存されます。',
      blocks: [
        { type: 'callout', kind: 'tip', html: 'このサイトは学習用の C インタプリタで動いています。<b>提出前には必ず自分の環境 (gcc) でもコンパイル・実行し, diff で確認</b>してください。<b>オプション課題 (O1-1, O1-2) は B1 ではなくレポート O1</b> として提出します。' },
        { type: 'lab' },
      ],
    },
    {
      id: 'report', num: '07', group: '課題', kicker: 'Report', navTitle: 'レポート作成',
      title: 'レポートを, 自動で組み立てる。',
      lead: '課題ラボの実行結果と「工夫した点」「感想」のメモから, B2 と同じ形式のレポートを生成します。基本課題は B1.txt, オプション課題は O1.txt。',
      blocks: [{ type: 'report' }],
    },
  ];

  window.UNITS.b1 = {
    title: 'Cプログラミングの基礎事項', source: '[B1] Cプログラミングの基礎事項 / B1 講義スライド', hero, chapters, tasks: window.B1_TASKS || [],
    predictCount: 6, optReport: 'O1',
  };
})();
