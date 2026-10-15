/* =========================================================================
 *  B2 分割コンパイル — 章コンテンツ
 *  出典: 配布資料「[B2] 分割コンパイル」と講義スライド「B2.pdf」
 * ========================================================================= */
(function () {
  'use strict';
  const { h, icon } = U;
  const C = window.B2_CODE;

  function hero() {
    const svg = '<svg viewBox="0 0 520 420" role="img" aria-label="main.c と func.c をコンパイルしてリンクする図">' +
      '<defs><marker id="b2h" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#7f5cf0"/></marker></defs>' +
      [['main.c', 40, 'int main(void)', '{ dist(…); }'], ['dist.c', 190, 'double dist(…)', '{ return …; }']].map(([n, y, l1, l2]) =>
        `<g class="lv-src"><rect x="10" y="${y}" width="150" height="110" rx="12"/><text x="24" y="${y + 26}" class="lv-n">${n}</text><text x="24" y="${y + 56}" class="lv-c">${l1}</text><text x="24" y="${y + 76}" class="lv-c">${l2}</text></g>`).join('') +
      '<g class="lv-src hdr"><rect x="40" y="330" width="120" height="40" rx="10"/><text x="100" y="355" text-anchor="middle" class="lv-n">dist.h</text></g>' +
      '<path d="M100 330 C 100 316, 92 312, 92 302" class="lv-inc" marker-end="url(#b2h)"/><path d="M48 330 C 0 300, 0 180, 10 150" class="lv-inc" marker-end="url(#b2h)"/>' +
      [['main.o', 60], ['dist.o', 210]].map(([n, y]) => `<g class="lv-seg code"><rect x="210" y="${y}" width="110" height="70" rx="10"/><text x="265" y="${y + 32}" text-anchor="middle" class="lv-t">${n}</text><text x="265" y="${y + 52}" text-anchor="middle" class="lv-a">100 番地〜</text></g>`).join('') +
      '<path d="M160 95 L 206 95" class="lv-ar" marker-end="url(#b2h)"/><path d="M160 245 L 206 245" class="lv-ar" marker-end="url(#b2h)"/>' +
      '<text x="183" y="86" text-anchor="middle" class="lv-op">-c</text><text x="183" y="236" text-anchor="middle" class="lv-op">-c</text>' +
      '<g class="lv-seg exe"><rect x="370" y="80" width="140" height="200" rx="14"/><text x="440" y="112" text-anchor="middle" class="lv-n">a.exe</text>' +
      '<rect x="384" y="128" width="112" height="40" rx="6" class="in1"/><text x="440" y="153" text-anchor="middle" class="lv-t">main</text>' +
      '<rect x="384" y="176" width="112" height="40" rx="6" class="in2"/><text x="440" y="201" text-anchor="middle" class="lv-t">dist</text>' +
      '<rect x="384" y="224" width="112" height="40" rx="6" class="in3"/><text x="440" y="249" text-anchor="middle" class="lv-t">printf…</text></g>' +
      '<path d="M320 95 C 345 95, 345 148, 368 148" class="lv-ar" marker-end="url(#b2h)"/><path d="M320 245 C 345 245, 345 196, 368 196" class="lv-ar" marker-end="url(#b2h)"/>' +
      '<text x="345" y="72" text-anchor="middle" class="lv-op">link</text>' +
      '<text x="210" y="352" class="hm-t" font-size="13"><tspan style="fill:#a08a99">$</tspan> gcc -c dist.c</text>' +
      '<text x="210" y="376" class="hm-t" font-size="13"><tspan style="fill:#a08a99">$</tspan> gcc main.o dist.o</text>' +
      '<text x="210" y="400" class="hm-t" font-size="13"><tspan style="fill:#a08a99">$</tspan> ./a < dist-in.txt</text>' +
      '</svg>';
    return h('section.u-hero',
      h('div.u-hero-grid',
        h('div',
          h('div.code-id', 'UNIT B2 — SEPARATE COMPILATION'),
          h('h1', '分割', h('br'), 'コンパイル', h('br'), h('em.vio', '#include "x.h"')),
          h('p.tag', 'プログラムを「部品 (関数)」に分け, ファイルに分ける。', h('br'), h('span', 'コンパイルとリンクの 2 段階で, 1 つの実行ファイルになる。')),
          h('div.u-stats',
            h('div', h('b', '7'), '章'),
            h('div', h('b', '8+2'), '課題 (オプション含む)'),
            h('div', h('b', '5'), '予想問題')),
          h('div.cta',
            h('a.btn.ptr', { href: '#func' }, '学習を始める', icon('arrow')),
            h('a.btn', { href: '#lab' }, '課題ラボへ'),
            h('a.btn.ghost', { href: '#report' }, 'レポート作成'))),
        h('div.hero-mem.b2', { html: svg })));
  }

  const AVE_IN = '1 2\n3 4\n5 6\n';
  const chapters = [
    {
      id: 'func', num: '00', group: '1. 関数', kicker: '1. 関数 — 例題 (2-1)', navTitle: '関数とプロトタイプ',
      title: '大きなプログラムは, 「部品」に分けて作る。',
      lead: '大規模なプログラムの開発では, まとまった機能をもつ適切な長さの「部品」に分割して構造をわかり易くし, 他のプログラムから再利用できるようにすることが極めて重要。C 言語で「部品」となるのが関数 (function) だ。',
      blocks: [
        { type: 'tracer', code: C.ave4, name: '例題 (2-1) ave4.c', stdin: '1 2\n3 4\n', showStdin: true, title: '例題 (2-1) ave4.c — 関数を呼ぶたびに, その関数専用のデータ領域が作られ, return で消える' },
        { type: 'compare', title: '関数の 3 つの顔', items: [
          { title: '<span class="chip val">宣言</span> プロトタイプ宣言', code: 'double arithmetic_mean(double, double);', html: '名前・引数の型・戻り値の型だけを先に知らせる。<b>末尾は ;</b>。引数名は省略してもよい。' },
          { title: '<span class="chip ptr">呼び出し</span> 関数の呼び出し', code: 'ave_a = arithmetic_mean(a, b);', html: '引数の<b>値がコピー</b>されて関数に渡り, return の値が式の値になる。' },
          { title: '<span class="chip ok">定義</span> 関数の定義 (本体)', code: 'double arithmetic_mean(double x, double y)\n{\n    double a = (x+y)/2;\n    return a;\n}', html: '中身を書く。関数の中の変数 (x, y, a) は<b>その関数の中だけ</b>で有効。' },
        ] },
        { type: 'predict', id: 'r1', code: C.scope, q: '関数 twice の中で引数 a を 2 倍している。main の <code class="ic">printf("%d %d\\n", a, b)</code> の出力は?', choices: ['<code>5 10</code>', '<code>10 10</code>'], answer: 0, explain: '呼び出すとき main の a の<b>値 5 がコピー</b>されて twice の a になる。twice の a と main の a は<b>別の変数</b> (別の番地)。だから main の a は 5 のまま, 戻り値 10 が b に入る。' },
        { type: 'predict', id: 'r2', code: C.noproto, q: 'main より後ろで定義した関数を, プロトタイプ宣言なしで呼んだ。gcc でコンパイルすると?', choices: ['エラーも警告も出ない', '警告 (implicit declaration) が出る', 'リンクエラーになる'], answer: 1, explain: 'gcc は呼び出しの時点で arithmetic_mean を知らないので <code class="ic">warning: implicit declaration of function</code> を出す。昔の C の規則で「int を返す関数」と仮定されてしまい, <b>double の戻り値が壊れる</b>ことがある (このサイトは正しく計算してしまいますが, 実際の gcc では危険)。<b>呼び出しより前にプロトタイプ宣言</b>を書こう。' },
        { type: 'callout', kind: 'tip', html: '<b>main を先頭に書きたいから</b>プロトタイプ宣言を使う。読む人はまず main で全体の流れをつかみ, 細部は後ろの関数定義を見ればよい。課題 (2-1) dist2.c, (2-2) qeq.c はこの形で書こう。' },
      ],
    },
    {
      id: 'build', num: '01', group: '2. 分割コンパイル', kicker: '講義スライド「コンパイルとリンク」', navTitle: 'コンパイルとリンク',
      title: 'コンパイルで .o に。リンクで 1 つに。',
      lead: '人間が書いたテキスト (ソースプログラム) は, コンパイルで機械語のオブジェクトプログラム (.o) になり, リンクでライブラリと結合されて実行プログラム (a.exe) になる。',
      blocks: [
        { type: 'linkviz', title: '<span class="chip">TRY</span> 3 つの段階を切り替えて, 番地が「仮 → 確定」する様子を見よう' },
        { type: 'point', n: 1, title: '機械語プログラムとデータ領域は, 最終的に固定したメモリアドレスに配置される', sub: 'コンパイル直後の .o は<b>再配置可能なアドレス</b> (どれも 100 番地から)。リンクで実行するためのアドレスが<b>確定 (固定)</b> し, 他のファイルの関数の呼び出し先が埋まる。' },
        { type: 'cheat', items: [
          { c: 'gcc -c main.c', d: '<b>コンパイルのみ</b> (リンクしない)。main.o ができる。', code: '$ gcc -c main.c\n$ gcc -c func.c' },
          { c: 'gcc main.o func.o', d: 'オブジェクトファイルを<b>リンク</b>して a.exe を作る。', code: '$ gcc main.o func.o\n$ ./a' },
          { c: 'gcc main.c func.c', d: 'コンパイルとリンクを 1 コマンドで。<code class="ic">-o 名前</code> で実行ファイル名を指定。', code: '$ gcc main.c func.c -o prog.exe\n$ ./prog' },
        ] },
      ],
    },
    {
      id: 'split', num: '02', group: '2. 分割コンパイル', kicker: '例題 (2-2) ave5', navTitle: '3 ファイルに分割',
      title: 'main と関数と宣言を, 3 つのファイルに。',
      lead: '関数 main のみの ave5main.c, 関数本体のみの ave5.c, プロトタイプ宣言のみの ave5.h。ave5main.c と ave5.c の両方から ave5.h をインクルードする。',
      blocks: [
        { type: 'tracer', files: { 'ave5main.c': C.ave5main, 'ave5.c': C.ave5, 'ave5.h': C.ave5h }, units: ['ave5main.c', 'ave5.c'], stdin: '1 2', showStdin: true, name: '例題 (2-2) ave5', title: '例題 (2-2) — ファイルをまたいで関数が呼ばれる (コード上のタブが自動で切り替わる)' },
        { type: 'shell', name: '例題 (2-2) — 分割コンパイルの手順', editable: ['ave5main.c', 'ave5.c', 'ave5.h'], files: { 'ave5main.c': C.ave5main, 'ave5.c': C.ave5, 'ave5.h': C.ave5h, 'ave-in.txt': AVE_IN },
          cmds: ['gcc -c ave5.c', 'gcc -c ave5main.c', 'ls', 'gcc ave5main.o ave5.o', './a < ave-in.txt', { cmd: 'gcc ave5main.o', label: 'gcc ave5main.o (ave5.o を忘れる)' }, 'gcc ave5main.c ave5.c'],
          intro: '<b>① gcc -c</b> で 2 つの .o を作る → <b>② リンク</b> → 実行。続けて <b>ave5.o を渡し忘れた</b>ときのエラーも見てみよう。左のエディタで ave5.c を書き換え, <code class="ic">gcc -c ave5.c</code> → リンクし直すと, 修正したファイルだけの再コンパイルで済むことが分かる。', goals: [
          { text: '<code class="ic">gcc -c</code> で ave5.o と ave5main.o を作る', test: (hs, api) => api.fs.has('ave5.o') && api.fs.has('ave5main.o') },
          { text: '2 つの .o をリンクして実行する', test: (hs) => hs.some((x) => /^gcc\s+.*\.o\s+.*\.o/.test(x.cmd) && x.ok) && hs.some((x) => /^\.\/a/.test(x.cmd) && x.result && x.result.out) },
          { text: '<code class="ic">undefined reference</code> (リンクエラー) を起こしてみる', test: (hs) => hs.some((x) => x.out.some((o) => /undefined reference/.test(o.t || ''))) },
        ] },
        { type: 'predict', id: 'r3', files: { 'ave5main.c': C.ave5main, 'ave5.c': C.ave5, 'ave5.h': C.ave5h }, units: ['ave5main.c', 'ave5.c'], stdin: '3 12', q: '<code class="ic">gcc -c ave5.c</code> → <code class="ic">gcc -c ave5main.c</code> → <code class="ic">gcc ave5main.o ave5.o</code> と実行し, 入力 <code class="ic">3 12</code> を与えた。出力は?', placeholder: '例: 0.000 0.000', explain: '分割しても動きは ave4.c と同じ。(3+12)/2 = <b>7.500</b>, √(3×12) = √36 = <b>6.000</b>。' },
        { type: 'callout', kind: 'tip', html: '何度も修正するのが ave5.c だけなら, 先に ave5main.c だけコンパイルしておくと効率が良い: <code class="ic">gcc -c ave5main.c</code> → <code class="ic">gcc ave5main.o ave5.c</code> (ave5.c だけをコンパイルしてリンク)。' },
      ],
    },
    {
      id: 'header', num: '03', group: '2. 分割コンパイル', kicker: '講義スライド「ライブラリとヘッダファイル」', navTitle: 'ヘッダと #include',
      title: '<...> は用意されたもの, "..." は自分で作ったもの。',
      lead: 'ライブラリは既に誰かが作ってくれた関数の集合。ライブラリ関数を使うには, 対応するヘッダファイルをインクルードする。#include はその位置にファイルの中身を挿入する指示だ。',
      blocks: [
        { type: 'compare', title: 'ヘッダファイルの場所', items: [
          { title: '<span class="chip val">#include &lt;ヘッダ名.h&gt;</span>', code: '#include <stdio.h>   /* 入出力 */\n#include <stdlib.h>  /* 標準機能 (rand 等) */\n#include <string.h>  /* 文字列処理 */\n#include <math.h>    /* 数学関数 */', html: 'その位置に, 既に用意された <b>/usr/include/ヘッダ名.h</b> を挿入する。' },
          { title: '<span class="chip vio">#include "ヘッダ名.h"</span>', code: '#include "ave5.h"\n#include "dist4.h"', html: 'その位置に, <b>同じディレクトリ</b>にある「ヘッダ名.h」を挿入する ⇒ 構造体や型を自分で定義する場合, 自作関数の宣言を共有する場合。' },
        ] },
        { type: 'shell', name: 'ヘッダが見つからない / 宣言がない', editable: ['main.c', 'ave5.h'], files: { 'main.c': C.ave5main.replace('#include "ave5.h"', '#include "ave.h"'), 'ave5.c': C.ave5, 'ave5.h': C.ave5h },
          cmds: ['gcc main.c ave5.c', 'ls'], intro: 'main.c の <code class="ic">#include "ave.h"</code> はファイル名が違う。エラーを確認し, 左のエディタで直してから再度 gcc。<code class="ic">#include</code> 行ごと消すと, 今度は implicit declaration の<b>警告</b>が出ることも確かめよう。', goals: [
          { text: '<code class="ic">No such file or directory</code> を確認する', test: (hs) => hs.some((x) => x.out.some((o) => /No such file/.test(o.t || ''))) },
          { text: 'ヘッダ名を直して, コンパイルとリンクを成功させる', test: (hs) => hs.some((x) => /^gcc/.test(x.cmd) && x.ok) },
        ] },
        { type: 'mistakes', items: [
          { title: 'ヘッダに関数の本体を書いた', code: '#include <stdio.h>\n\ndouble twice(double x) { return 2 * x; }\ndouble twice(double x) { return 2 * x; }\n\nint main(void)\n{\n    printf("%f\\n", twice(1.5));\n    return 0;\n}\n', fix: 'ヘッダに本体を書くと, 2 つの .c からインクルードしたとき<b>同じ関数が 2 回定義</b>される (multiple definition)。ヘッダには<b>プロトタイプ宣言と型 (typedef) だけ</b>を書く。' },
        ] },
      ],
    },
    {
      id: 'struct', num: '04', group: '3. 構造体', kicker: '3. 構造体 — 例題 (2-3)', navTitle: '構造体',
      title: '関係するデータを, 1 つの型にまとめる。',
      lead: '品物の名前・価格・重量のように, 一緒に扱うデータは構造体 (struct) にまとめる。typedef で名前を付ければ, int や double と同じように変数を宣言し, 関数に渡せる。',
      blocks: [
        { type: 'tracer', code: C.item, name: '例題 (2-3) item_t', title: '例題 (2-3) — 構造体の変数は, メンバーが並んだひとかたまりの領域。関数に渡すと<b>まるごとコピー</b>される' },
        { type: 'cheat', items: [
          { c: 'typedef struct {…} item_t;', d: '構造体型に <b>item_t</b> という名前を付ける。', code: 'typedef struct {\n  char name[NM_LEN+1];\n  int price;\n  double weight;\n} item_t;' },
          { c: 'a.price', d: 'メンバーは <code class="ic">.</code> で取り出す。読み書きどちらも OK。', code: 'a.price = 120;\nprintf("%d", a.price);' },
          { c: 'strcpy(a.name, "…")', d: '文字列メンバーへの代入は strcpy。【中上級者用】サイズ超過を防ぐなら strncpy + 末尾に \\0。', code: 'a.name[NM_LEN] = \'\\0\';\nstrncpy(a.name, "apple", NM_LEN);' },
        ] },
        { type: 'predict', id: 'r4', code: C.structcopy, q: '関数 move の中で p.x に 10 を足した。main の <code class="ic">q.x</code> は?', choices: ['<code>1.0 2.0</code> — 変わらない', '<code>11.0 2.0</code> — 10 増える'], answer: 0, explain: '構造体も引数に渡すと<b>中身がまるごとコピー</b>される。move が書き換えたのはコピーの p。元の q を書き換えるには, B3 で学ぶ<b>ポインタ</b>が必要。' },
        { type: 'callout', kind: 'tip', html: '<b>構造体の宣言はヘッダに書く</b> (課題 2-7 の dist4.h)。dist4main.c と dist4.c が同じ point_t を使えるようにするためだ。dist4.c で <code class="ic">#include "dist4.h"</code> を忘れると「point_t という型名を知らない」というエラーになる。' },
      ],
    },
    {
      id: 'rand', num: '05', group: '4. 乱数', kicker: '4. 乱数 — 講義スライド「疑似乱数ライブラリ」', navTitle: '乱数',
      title: 'rand() は「種」から決まる, 疑似乱数。',
      lead: 'rand() は呼ばれる度に 0〜RAND_MAX の整数の一様乱数を 1 つ返す。ただし完全な乱数ではなく疑似乱数で, 同じ「種」からは同じ系列になる。種を設定するのが srand(整数)。',
      blocks: [
        { type: 'tracer', code: C.rand1, name: '例題 (2-4)', stdin: '1', showStdin: true, title: '例題 (2-4) — stdin の種を 1 → 2 → 1 と変えて再実行。<b>同じ種なら同じ系列</b>になることを確かめよう' },
        { type: 'point', n: 2, title: '区間 [a, b] の整数の乱数は <code>rand() % (b - a + 1) + a</code>', sub: 'rand() を 4 (=13−10+1) で割った余りは 0〜3。これに 10 を足せば 10〜13 (例題 2-5 rand_10_13)。課題 (2-8) irand はこれを一般化する。' },
        { type: 'predict', id: 'r5', code: C.dice, q: '<code class="ic">rand() % 6 + 1</code> はサイコロ。srand(1) のとき 5 回の目は? (このサイトの rand は gcc (glibc) と同じ系列)', placeholder: '例: 1 2 3 4 5', explain: 'glibc の srand(1) の系列は 1804289383, 846930886, 1681692777, … 。それぞれ 6 で割った余り + 1 で <b>2 5 4 2 6</b>。同じ種なら毎回同じ — だからシミュレーションの結果を再現できる。<b>環境 (Windows の Cygwin 等) によって系列は異なる</b>ことがある。' },
        { type: 'tracer', code: C.rand1013, name: '例題 (2-5)', title: '例題 (2-5) rand_10_13 — 30 回呼び出して 10〜13 だけが出る' },
        { type: 'callout', kind: 'warn', html: '<b>srand(time(NULL))</b> とすると実行の度に違う系列になるが, 結果が再現できずデバッグしにくい。課題では固定の種 (または種を入力) にしておくと, レポートの結果を説明しやすい。' },
      ],
    },
    {
      id: 'summary', num: '06', group: 'まとめ', kicker: 'Cheat sheet', navTitle: 'チートシート',
      title: 'B2 を 6 枚で。',
      blocks: [
        { type: 'cheat', items: [
          { c: '型 名前(引数);', d: '<b>プロトタイプ宣言</b>。呼び出しより前に。ヘッダに書いて共有する。', code: 'double dist(double x1, double y1,\n            double x2, double y2);' },
          { c: 'gcc -c x.c', d: 'コンパイルのみで x.o (再配置可能)。', code: '$ gcc -c dist3.c\n$ gcc -c dist3main.c' },
          { c: 'gcc a.o b.o', d: 'リンクして a.exe。本体が見つからないと undefined reference。', code: '$ gcc dist3main.o dist3.o' },
          { c: '#include "x.h"', d: '同じディレクトリのヘッダ。<code class="ic">&lt;…&gt;</code> は /usr/include。', code: '#include <math.h>\n#include "dist3.h"' },
          { c: 'typedef struct', d: '関係するデータを 1 つの型に。メンバーは <code class="ic">.</code>。引数に渡すとコピー。', code: 'point_t p;\np.x = 1.0;' },
          { c: 'rand() % n', d: '0〜n−1 の乱数。srand(種) で系列を選ぶ。stdlib.h が必要。', code: 'srand(seed);\nr = rand() % (b-a+1) + a;' },
        ] },
      ],
    },
    {
      id: 'lab', num: '07', group: '課題', kicker: 'Assignment Lab', navTitle: '課題ラボ',
      title: '分けて, つないで, diff で確かめる。',
      lead: '複数ファイルの課題は, エディタ上部のタブでファイルを切り替えます (「配布」は配布ファイルで編集不可)。「ターミナル」では gcc で複数のファイルをリンクする手順をそのまま試せます。',
      blocks: [
        { type: 'callout', kind: 'tip', html: 'このサイトは学習用の C インタプリタで動いています。<b>提出前には必ず自分の環境 (gcc) でもコンパイル・実行し, diff で確認</b>してください。課題 2-3 は <b>dist3.c のみ</b>, 2-4 は <b>qeq2.c のみ</b>を提出します。' },
        { type: 'lab' },
      ],
    },
    {
      id: 'report', num: '08', group: '課題', kicker: 'Report', navTitle: 'レポート作成',
      title: 'レポートを, 自動で組み立てる。',
      lead: '課題ラボの実行結果と「工夫した点」「感想」のメモから, B2.txt を生成します。オプション課題は完了したものだけが含まれます。',
      blocks: [{ type: 'report' }],
    },
  ];

  window.UNITS.b2 = {
    title: '分割コンパイル', source: '[B2] 分割コンパイル / B2 講義スライド', hero, chapters, tasks: window.B2_TASKS || [],
    predictCount: 5,
  };
})();
