/* B3 ポインタ — 課題定義 (出典: 配布資料「[B3] ポインタ」) */
(function () {
  'use strict';
  const R = String.raw;
  const D = window.B3_DATA || { sol: {}, given: {} };

  const tasks = [
    {
      id: '3-1', label: '3-1', short: '変数の番地を表示', files: ['pointer1.c'],
      title: 'int 型 a, b と double 型 x, y の番地を表示する pointer1.c',
      spec: '<p>int 型の変数 <code class="ic">a</code>, <code class="ic">b</code> と double 型の変数 <code class="ic">x</code>, <code class="ic">y</code> を宣言し, それぞれの<b>番地</b>を表示せよ。</p><p>実行してどのような数値が番地として表示されたか (<b>どのような数の増え方になっているか</b>) をレポートに記せ。</p><div class="req"><span class="chip addr">%p で番地を表示</span><span class="chip">&amp; 演算子</span></div>',
      starter: { 'pointer1.c': R`#include <stdio.h>

int main(void)
{
    int a = 1;
    int b = 2;
    /* TODO: double 型の変数 x, y を宣言する */

    printf("a の番地は %p\n", &a);
    /* TODO: b, x, y の番地も表示する */

    return 0;
}
` },
      hints: [
        '変数 <code class="ic">x</code> の番地は <code class="ic p">&amp;x</code> で得られます (【ポイント１】)。',
        'printf で番地を表示するときの書式は <code class="ic">%p</code> です。',
        '<code class="ic">double x = 1.5;</code> のように宣言し, <code class="ic">printf("x の番地は %p\\n", &amp;x);</code> を追加しよう。',
      ],
      check(outs, src) {
        const o = outs[0].out, s = src['pointer1.c'];
        if (!/double/.test(s)) return { ok: false, msg: 'double 型の変数が宣言されていません' };
        const miss = ['a', 'b', 'x', 'y'].filter((v) => !new RegExp('&\\s*' + v + '\\b').test(s));
        if (miss.length) return { ok: false, msg: '番地を表示していない変数があります: ' + miss.join(', ') };
        if ((o.match(/0x[0-9a-f]+/g) || []).length < 4) return { ok: false, msg: '4 つの番地が表示されていません (%p を使っていますか?)' };
        return { ok: true, msg: '4 つの番地が表示されました。「考察」欄で番地の増え方をまとめよう。' };
      },
      obsTitle: '番地の増え方',
      obsPh: '例: a と b の差は 4 (int 1 つ分), x と y の差は 8 (double 1 つ分) …',
      observe(outs) {
        const ads = (outs[0].out.match(/0x[0-9a-f]+/g) || []).map((x) => parseInt(x, 16));
        if (ads.length < 2) return '';
        const d = ads.slice(1).map((a, i) => a - ads[i]);
        return '観察: このサイトでの番地は ' + ads.join(', ') + ' (差: ' + d.join(', ') + ')。int は 4 バイト, double は 8 バイトずつ領域を使います。<br><b>注意:</b> 実際の gcc では後に宣言した変数ほど<b>小さい</b>番地になることが多いです。レポートには自分の環境での結果を書こう。';
      },
      summary: 'int 型の変数 a, b と double 型の変数 x, y を宣言し、それぞれの番地を\n%p で表示するプログラム pointer1.c を作成した。',
      reportTitle: '課題 3.1',
    },
    {
      id: '3-2', label: '3-2', short: '番地で変数を書き換え', files: ['pointer2.c'],
      title: '番地を直接指定して a, b, x, y を書き換える pointer2.c',
      spec: '<p>課題 3-1 と同様に a, b, x, y を宣言して番地を表示し, <b>その番地を用いて</b>変数 a, b, x, y の値を書き換え, a, b, x, y の値を表示せよ。</p><p>手順: ① まず実行して番地を確認 → ② その番地をプログラムに書き込む → ③ もう一度実行。</p><div class="req"><span class="chip ptr">*((int *)番地) = 値;</span><span class="chip ptr">*((double *)番地) = 値;</span></div>',
      starter: { 'pointer2.c': R`#include <stdio.h>

int main(void)
{
    int a = 1;
    int b = 2;
    double x = 1.5;
    double y = 2.5;

    printf("a の番地は %p\n", &a);
    printf("b の番地は %p\n", &b);
    printf("x の番地は %p\n", &x);
    printf("y の番地は %p\n", &y);

    /* TODO: 表示された番地を使って a, b, x, y を書き換える
       例) *((int *)0x64) = 1111;                         */

    printf("\n");
    printf("a の値 = %d\n", a);
    printf("b の値 = %d\n", b);
    printf("x の値 = %f\n", x);
    printf("y の値 = %f\n", y);

    return 0;
}
` },
      hints: [
        'まずそのまま「テスト実行」して, 表示された番地 (例: <code class="ic a">0x64</code>) をメモしよう。',
        '番地が α の変数は <code class="ic p">*α</code> で読み書きできます (【ポイント２】)。α に型を教えるため <code class="ic">(int *)</code> を付けます。',
        'double 型の x には <code class="ic">*((double *)0x6c) = 3.14;</code> のように <b>double 型のポインタ</b>で書き込みます。',
      ],
      check(outs, src) {
        const s = src['pointer2.c'];
        if (!/\(\s*int\s*\*\s*\)\s*(0x[0-9a-fA-F]+|\d+)/.test(s)) return { ok: false, msg: '(int *) 番地 を使った書き込みがありません' };
        if (!/\(\s*double\s*\*\s*\)/.test(s)) return { ok: false, msg: '(double *) 番地 を使った書き込みがありません' };
        const o = outs[0].out;
        const v = (k) => { const m = new RegExp(k + '\\s*の値\\s*=\\s*([-0-9.]+)').exec(o); return m ? +m[1] : null; };
        const changed = [['a', 1], ['b', 2], ['x', 1.5], ['y', 2.5]].filter(([k, d]) => v(k) !== null && v(k) !== d).length;
        if (changed < 4) return { ok: false, msg: '値が書き換わっていない変数があります (' + changed + '/4)。番地は表示された値と一致していますか?' };
        return { ok: true, msg: '4 つの変数すべてを番地経由で書き換えられました。' };
      },
      summary: 'pointer1.c と同様に a, b, x, y を宣言して番地を表示し、その番地を直\n接指定して a, b, x, y の値を書き換えてから値を表示するプログラム\npointer2.c を作成した。',
      reportTitle: '課題 3.2',
    },
    {
      id: '3-3', label: '3-3', short: 'ポインタ変数で操作', files: ['pointer3.c'],
      title: 'ポインタ変数で b に 4 を足し x を 2 倍, 入力番地の内容を表示する pointer3.c',
      spec: '<ul><li>int 型 a, b と double 型 x, y を宣言する。</li><li><b>int 型ポインタ変数</b>と <b>double 型ポインタ変数</b>を宣言する。</li><li>a, b, x, y の番地を表示する。</li><li>ポインタ変数を用いて, <b>b の値に 4 を足し, x の値を 2 倍</b>する。</li><li>double 型変数 (x と y) の番地を入力し, その番地の値を表示する (<b>番地 0 が入力されるまで</b>繰り返す)。</li></ul>',
      starter: { 'pointer3.c': R`#include <stdio.h>

int main(void)
{
    int a = 1;
    int b = 2;
    double x = 1.5;
    double y = 2.5;
    /* TODO: int 型ポインタ変数と double 型ポインタ変数を宣言 */

    printf("a の番地は %p\n", &a);
    printf("b の番地は %p\n", &b);
    printf("x の番地は %p\n", &x);
    printf("y の番地は %p\n", &y);

    /* TODO: ポインタ変数を使って b に 4 を足し, x を 2 倍する */

    printf("a = %d, b = %d, x = %f, y = %f\n", a, b, x, y);

    /* TODO: 番地を入力して, その番地の double の値を表示 (0 で終了) */

    return 0;
}
` },
      tests: [{ stdin: '0\n', label: '0 を入力 (すぐ終了)' }],
      stdin: '0x6c\n0x74\n0\n',
      hints: [
        'int 型の変数の番地を保持する変数は <code class="ic p">int *pi;</code>, double 型なら <code class="ic p">double *pd;</code> と宣言します (【ポイント３】)。',
        '<code class="ic">pi = &amp;b;</code> としてから <code class="ic">*pi = *pi + 4;</code>。x も同様に <code class="ic">pd = &amp;x; *pd = *pd * 2;</code>。',
        '番地の入力は例題 3-3 と同じく <code class="ic">scanf("%p", &amp;pd);</code>。<code class="ic">if (pd == 0) { break; }</code> で終了し, <code class="ic">printf("%f\\n", *pd);</code> で表示。',
      ],
      check(outs, src, CL) {
        const s = src['pointer3.c'];
        if (!/int\s*\*\s*\w+/.test(s) || !/double\s*\*\s*\w+/.test(s)) return { ok: false, msg: 'int 型ポインタ変数と double 型ポインタ変数の両方を宣言してください' };
        const o = outs[0].out;
        if (!/b\s*=\s*6\b/.test(o) || !/x\s*=\s*3\.0/.test(o)) return { ok: false, msg: 'b = 6, x = 3.000000 になっていません (b に 4 を足し, x を 2 倍)' };
        const mx = /x\s*の番地は\s*(0x[0-9a-f]+)/.exec(o), my = /y\s*の番地は\s*(0x[0-9a-f]+)/.exec(o);
        if (!mx || !my) return { ok: true, msg: '(x, y の番地表示が見つからないため, 番地入力のテストは省略しました)' };
        const r = CL.run(src, ['pointer3.c'], { stdin: mx[1] + '\n' + my[1] + '\n0\n', maxSnaps: 2 });
        if (r.error) return { ok: false, msg: 'x, y の番地 (' + mx[1] + ', ' + my[1] + ') を入力するとエラー: ' + r.error.msg };
        const tail = r.out.split('\n').slice(-3).join(' ');
        if (!/3\.0/.test(tail) || !/2\.5/.test(tail)) return { ok: false, msg: '番地 ' + mx[1] + ', ' + my[1] + ' を入力したとき x, y の値 (3.0, 2.5) が表示されません' };
        return { ok: true, msg: '番地 ' + mx[1] + ' と ' + my[1] + ' を入力して x, y の値が読めることも自動で確認しました。' };
      },
      summary: 'int 型ポインタ変数と double 型ポインタ変数を用いて、b に 4 を足し、\nx を 2 倍した後、入力した番地の double 型の内容を、番地 0 が入力され\nるまで表示するプログラム pointer3.c を作成した。',
      reportTitle: '課題 3.3',
    },
    {
      id: '3-4', label: '3-4', short: '商と剰余 divrem', files: ['divrem.c'],
      title: '商を *q に, 剰余を *r に格納する divrem.c',
      spec: '<p>int 型変数 x と y, および int 型へのポインタ変数 q, r を受け取り, x を y で割った<b>商を q 番地</b>の変数に, <b>剰余を r 番地</b>の変数に格納する関数 <code class="ic">divrem</code> を作成せよ。空欄を埋めて完成させる。</p>',
      starter: { 'divrem.c': R`#include <stdio.h>

void divrem(int x, int y, int *q, int *r)
{
    /* この関数の本体を完成させよ */
}

int main(void)
{
    int x = 10, y = 3;
    int q, r;
    divrem( /* ここを埋めて, x を y で割った商と剰余が q と r に格納されるようにせよ */ );
    printf("x / y = %d ... %d\n", q, r);
    return 0;
}
` },
      tests: [{ stdin: '', expect: 'x / y = 3 ... 1\n' }],
      hints: [
        '例題 3-4 の triple と同じ形です。関数の中では「q が指す先」= <code class="ic p">*q</code> に商を書き込みます。',
        '商は <code class="ic">x / y</code>, 剰余は <code class="ic">x % y</code>。',
        '呼び出しは <code class="ic">divrem(x, y, &amp;q, &amp;r);</code> — q と r は「値」ではなく「番地」を渡します。',
      ],
      summary: 'x を y で割った商を q 番地に、剰余を r 番地に格納する関数\nvoid divrem(int x, int y, int *q, int *r) を作成し、プログラム\ndivrem.c を完成させた。',
      reportTitle: '課題 3.4',
    },
    {
      id: '3-5', label: '3-5', short: '相加・相乗平均 ave', files: ['ave6.c'], given: D.given['3-5'], link: ['ave6main.c', 'ave6.c'],
      title: '相加平均を *p_a に, 相乗平均を *p_m に格納する ave6.c',
      spec: '<p>関数 <code class="ic">void ave(double a, double b, double *p_a, double *p_m)</code> を <code class="ic">ave6.c</code> に作成せよ。a と b の<b>相加平均</b> (a+b)/2 を p_a 番地に, <b>相乗平均</b> √(ab) を p_m 番地に格納する。</p><p>配布の <code class="ic">ave6.h</code> をインクルードし, <code class="ic">ave6main.c</code> とリンクして確認する (タブで閲覧可)。</p>',
      starter: { 'ave6.c': R`#include <math.h>
#include "ave6.h"

void ave(double a, double b, double *p_a, double *p_m)
{
    /* TODO */
}
` },
      tests: [{ stdin: '1 2\n3 4\n5 6\n', expect: '1.500 1.414\n3.500 3.464\n5.500 5.477\n' }],
      hints: ['相加平均は <code class="ic">(a + b) / 2.0</code>, 相乗平均は <code class="ic">sqrt(a * b)</code>。', '結果は <code class="ic p">*p_a = …;</code> <code class="ic p">*p_m = …;</code> のようにポインタの指す先へ。', 'sqrt を使うので <code class="ic">#include &lt;math.h&gt;</code> (実際の gcc では <code class="ic">-lm</code> も)。'],
      summary: 'a と b の相加平均を p_a 番地に、相乗平均を p_m 番地に格納する関数\nvoid ave(double a, double b, double *p_a, double *p_m) を ave6.c に作\n成し、ave6main.c とリンクして実行した。',
      reportTitle: '課題 3.5',
    },
    {
      id: '3-6', label: '3-6', short: '2次方程式 qeq3', files: ['qeq3.c'], given: D.given['3-6'], link: ['qeq3main.c', 'qeq3.c'],
      title: '解の個数を返し, 解を *x1, *x2 にセットする qeq3.c',
      spec: '<p>課題 2-4 の qeq2.c を書き換え, 関数を <code class="ic">int qeq(double a, double b, double c, double *x1, double *x2)</code> とする。関数の中で解を出力せず, <b>解の個数を返り値</b>として返し, 解を <code class="ic">*x1</code>, <code class="ic">*x2</code> にセットする。</p><ul><li>解が 1 つ → <code class="ic">*x1</code> にセット</li><li>解が 2 つ → <b>小さい方を *x1</b>, もう一方を <code class="ic">*x2</code></li></ul>',
      starter: { 'qeq3.c': R`#include <math.h>
#include "qeq3.h"

int qeq(double a, double b, double c, double *x1, double *x2)
{
    double d = b * b - 4 * a * c;   /* 判別式 */

    /* TODO: 解の個数を返し, 解を *x1, *x2 にセットする */

    return 0;
}
` },
      tests: [{ stdin: '1 3 2\n1 2 1\n1 1 1\n2 9 3\n-5 7 8\n-3 6 -3\n-7 24 -8\n2 -9 6\n0 1 1\n', expect: '-2.00000 -1.00000\n-1.00000\n\n-4.13746 -0.36254\n-0.74568 2.14568\n1.00000\n0.37417 3.05440\n0.81386 3.68614\n' }],
      hints: ['d &gt; 0 なら 2 解, d == 0 なら重解, d &lt; 0 なら 0 を返します。', 'a が負のとき (-b-√d)/2a の方が大きくなります。2 つ求めてから比べ, 小さい方を <code class="ic p">*x1</code> に。', '重解は <code class="ic">*x1 = -b / (2 * a); return 1;</code>'],
      summary: '課題 2.4 の qeq2.c を書き換え、解の個数を返り値とし、解を *x1, *x2 に\nセットする関数\nint qeq(double a, double b, double c, double *x1, double *x2)\nを qeq3.c に作成し、qeq3main.c とリンクして実行した。',
      reportTitle: '課題 3.6',
    },
    {
      id: '3-7', label: '3-7', short: '構造体ポインタ dist5', files: ['dist5.c'], given: D.given['3-7'], link: ['dist5main.c', 'dist5.c'],
      title: 'point_t へのポインタを受け取る point_scan と dist (dist5.c)',
      spec: '<ul><li><code class="ic">int point_scan(point_t *p)</code> — p の指す変数のメンバー x, y に標準入力から実数を読み込む。EOF なら EOF を, そうでなければ 1 を返す。</li><li><code class="ic">double dist(point_t *p1, point_t *p2)</code> — 2 点 *p1 と *p2 の間の距離を返す。</li></ul><p>dist5.c からは <code class="ic">dist5.h</code> (および stdio.h, math.h) をインクルードする。</p>',
      starter: { 'dist5.c': R`#include <stdio.h>
#include <math.h>
#include "dist5.h"

int point_scan(point_t *p)
{
    /* TODO */
    return 1;
}

double dist(point_t *p1, point_t *p2)
{
    /* TODO */
    return 0.0;
}
` },
      tests: [{ stdin: '0 0 1 1\n1 2 4 7\n1.11 2.22 3.33 4.44\n', expect: '1.4142\n5.8310\n3.1396\n' }],
      hints: ['構造体へのポインタからメンバーを指すときは <code class="ic p">p-&gt;x</code> (= <code class="ic">(*p).x</code>)。', 'scanf にはメンバーの<b>番地</b>を渡す: <code class="ic">scanf("%lf", &amp;p-&gt;x)</code>', 'EOF チェック: <code class="ic">if (scanf("%lf", &amp;p-&gt;x) == EOF) { return EOF; }</code>'],
      summary: 'point_t 型変数へのポインタを用いる関数\nint point_scan(point_t *p) と double dist(point_t *p1, point_t *p2)\nを dist5.c に作成し、dist5main.c とリンクして実行した。',
      reportTitle: '課題 3.7',
    },
    {
      id: '3-8', label: '3-8', short: '配列とポインタ arrayp', files: ['arrayp.c'],
      title: '配列とアドレスの関係を調べる arrayp.c',
      spec: '<p><code class="ic">int x[ ] = {0,10,20,30,40};</code> について次の 1〜6 を行う。</p><ol><li>sizeof 演算子で要素数を求めて k に代入し, 出力。</li><li>x[0], …, x[k-1] のアドレスを %p で出力。<b>いくつずつ増えているか</b>をレポートに。</li><li>x の値 (アドレス) を出力。2 の<b>いずれと一致するか</b>。</li><li>x+0, …, x+k-1 の値を出力。2 のいずれと一致するか。</li><li>アドレス x+0, … に格納されているデータを出力。x[0], … のいずれと一致するか。</li><li>int 型ポインタ p に x[2] のアドレスを代入し, <b>p+2 の値と p[2] の値</b>を表示。なぜそうなるかを考察。</li></ol>',
      starter: { 'arrayp.c': R`#include <stdio.h>

int main(void)
{
    int x[] = {0, 10, 20, 30, 40};
    int k, i;
    int *p;

    /* 1. 要素数 */
    k = 0; /* TODO: sizeof を使う */
    printf("1. k = %d\n", k);

    /* 2. x[i] のアドレス */

    /* 3. x の値 */

    /* 4. x+i の値 */

    /* 5. *(x+i) の値 */

    /* 6. p = &x[2] のときの p+2 と p[2] */

    return 0;
}
` },
      hints: ['要素数は <code class="ic">sizeof(x) / sizeof(x[0])</code> (配列全体のバイト数 ÷ 1 要素のバイト数)。', 'アドレスは <code class="ic">printf("%p\\n", &amp;x[i]);</code>。配列名だけの <code class="ic">x</code> も %p で表示できます。', '5 は <code class="ic">*(x + i)</code>, 6 は <code class="ic">p = &amp;x[2]; printf("%p %d\\n", p + 2, p[2]);</code>'],
      check(outs, src) {
        const o = outs[0].out, s = src['arrayp.c'];
        const miss = [];
        if (!/k\s*=\s*5/.test(o)) miss.push('1. k = 5');
        if (!/sizeof/.test(s)) miss.push('sizeof の使用');
        if (!/x\s*\+\s*(i|\d)/.test(s)) miss.push('4. x+i');
        if (!/\*\s*\(\s*x\s*\+/.test(s)) miss.push('5. *(x+i)');
        if (!/p\s*\[\s*2\s*\]/.test(s)) miss.push('6. p[2]');
        if (!/p\s*\+\s*2/.test(s)) miss.push('6. p+2');
        if (miss.length) return { ok: false, msg: '足りない項目: ' + miss.join(' / ') };
        if (!/\b40\b/.test(o)) return { ok: false, msg: 'p[2] の値 (40) が表示されていません' };
        return { ok: true, msg: '1〜6 がそろいました。考察欄に「何と一致したか」「なぜ p[2] が 40 か」をまとめよう。' };
      },
      obsTitle: '考察',
      obsPh: '例: x[i] のアドレスは 4 ずつ増えた (int が 4 バイトだから)。x は &x[0] と, x+i は &x[i] と一致。*(x+i) は x[i] と一致。p+2 は x[4] のアドレス, p[2] は *(p+2) = x[4] = 40 …',
      observe(outs) {
        const ads = (outs[0].out.match(/0x[0-9a-f]+/g) || []).map((x) => parseInt(x, 16));
        let s = '観察: ';
        if (ads.length >= 2) s += '最初の 2 つのアドレスの差は ' + (ads[1] - ads[0]) + '。';
        return s + ' x と &x[0], x+i と &x[i], *(x+i) と x[i] を見比べよう。<b>ポインタに整数 n を足すと「n × 指す型のサイズ」だけ番地が進む</b>のがポイント。';
      },
      summary: 'int 型の配列 x[] = {0,10,20,30,40} について、要素数、各要素のアドレス、\nx の値、x+i の値、*(x+i) の値、p = &x[2] としたときの p+2 と p[2] を\n表示するプログラム arrayp.c を作成した。',
      reportTitle: '課題 3.8',
    },
    {
      id: '3-9', label: '3-9', short: '平均と最大 ave_max', files: ['ave_max.c'], given: D.given['3-9'], link: ['ave_max_main.c', 'ave_max.c'],
      title: '配列を読み込み, 平均値と最大値を *ave, *max に格納する ave_max.c',
      spec: '<ul><li><code class="ic">int array_scan(int a[ ])</code> — 標準入力から配列にデータを読み込み (EOF で終了, 最大 MAX 個), <b>要素数を返す</b>。</li><li><code class="ic">void array_ave_max(int n, int a[ ], double *ave, int *max)</code> — a[0]〜a[n-1] の平均値と最大値をそれぞれ <code class="ic">*ave</code>, <code class="ic">*max</code> に格納する。</li></ul>',
      starter: { 'ave_max.c': R`#include <stdio.h>
#include "ave_max.h"

int array_scan(int a[ ])
{
    /* TODO */
    return 0;
}

void array_ave_max(int n, int a[ ], double *ave, int *max)
{
    /* TODO */
}
` },
      tests: [{ stdin: '5 4 3 2 1 9 8 7 6 10', expect: '5.500 10\n', label: '正の値' }, { stdin: '-20 -14 -6 -10', expect: '-12.500 -6\n', label: 'すべて負の値' }],
      hints: ['array_scan は例題 3-6 の array_scan を「要素数を return する」形に変えるだけ。', '最大値の初期値を 0 にすると, すべて負のデータで失敗します。<code class="ic">*max = a[0];</code> から始めよう。', '平均は整数の合計を <code class="ic">(double)sum / n</code> で実数にしてから割ります。'],
      summary: '配列にデータを読み込んで要素数を返す関数 int array_scan(int a[])\nと、平均値と最大値を *ave, *max に格納する関数\nvoid array_ave_max(int n, int a[], double *ave, int *max)\nを ave_max.c に作成し、ave_max_main.c とリンクして実行した。',
      reportTitle: '課題 3.9',
    },
    {
      id: '3-10', label: '3-10', short: 'サイコロ3個の分布', files: ['dice3sub.c'], given: D.given['3-10'], link: ['dice3.c', 'dice3sub.c'],
      title: '3 個のサイコロの目の和の分布を調べる dice3sub.c',
      spec: '<ul><li><code class="ic">void dice_throw(int d[ ], int n)</code> — 1〜6 の整数の一様乱数を n 個発生し, d[0]〜d[n-1] に格納する。</li><li><code class="ic">void dice3_distr(int n, int d1[ ], int d2[ ], int d3[ ], int c[ ])</code> — d1[i]+d2[i]+d3[i] の和 s が出現した回数を c[s] にカウントする。</li></ul><div class="callout warn" style="margin-top:10px">配布の dice3.c は, <b>c[ ] にわざと乱数を入れてから</b> dice3_distr を呼んでいます。</div>',
      starter: { 'dice3sub.c': R`#include <stdlib.h>
#include "dice3sub.h"

void dice_throw(int d[ ], int n)
{
    /* TODO: 1〜6 の乱数を n 個 d[] に */
}

void dice3_distr(int n, int d1[ ], int d2[ ], int d3[ ], int c[ ])
{
    /* TODO: 和 s の出現回数を c[s] に数える */
}
` },
      tests: [{ stdin: '1000', label: 'n = 1000' }],
      stdin: '20',
      hints: ['1〜6 の乱数は <code class="ic">rand() % 6 + 1</code> (課題 2-8 の irand と同じ考え方)。', '<b>c[ ] は呼び出し元でゴミが入っている</b>ので, dice3_distr の最初で c[D3_MIN]〜c[D3_MAX] を 0 にします。', '<code class="ic">s = d1[i] + d2[i] + d3[i]; c[s]++;</code>'],
      check(outs) {
        const lines = outs[0].out.trim().split('\n');
        const cnt = lines.map((l) => +((/:\s*(-?\d+)/.exec(l) || [])[1]));
        if (cnt.length !== 16) return { ok: false, msg: '3〜18 の 16 行が出力されていません' };
        const sum = cnt.reduce((a, b) => a + b, 0);
        if (sum !== 1000) return { ok: false, msg: '出現回数の合計が ' + sum + ' です (1000 になるはず)。c[] を 0 に初期化していますか?' };
        const peak = cnt.indexOf(Math.max(...cnt)) + 3;
        if (peak < 8 || peak > 13) return { ok: false, msg: '分布の山が ' + peak + ' にあります。1〜6 の一様乱数になっていますか?' };
        return { ok: true, msg: '合計 1000 回, 和 ' + peak + ' 付近を山とする分布になりました (理論上は 10, 11 が最も出やすい: 27/216)。' };
      },
      summary: '1〜6 の一様乱数を n 個 d[] に格納する関数 void dice_throw(int d[],\nint n) と、3 個のサイコロの目の和 s の出現回数を c[s] に数える関数\nvoid dice3_distr(int n, int d1[], int d2[], int d3[], int c[])\nを dice3sub.c に作成し、dice3.c とリンクして実行した。',
      reportTitle: '課題 3.10',
    },
    {
      id: 'opt1', label: 'Opt-1', short: '試験の点数シミュレーション', files: ['exam100.c'], optional: true,
      title: 'オプション: 正規乱数で 100 点満点の試験をシミュレートする exam100.c',
      spec: '<ul><li>目標の平均値, 標準偏差 (実数), 受験者数 (整数) を入力。</li><li>正規乱数を発生して各受験生の点数とする。四捨五入で整数化し, 0 未満は 0, 100 超は 100 に補正。</li><li>生成した点数の平均, 標準偏差, <b>5 点刻みの度数分布</b>を表示。</li><li>平均 75, 標準偏差 10, 受験者 10 / 1,000 / 10,000 人で確認。分散 = 二乗和の平均 − 平均の二乗。</li></ul><p>一様乱数は資料指定の <code class="ic">myrand()</code> を使う (スターターに記載済み)。</p>',
      starter: { 'exam100.c': R`#include <stdio.h>
#include <math.h>

double myrand(void)
{
    static unsigned long r = 53402397UL;
    r = (65539UL * r + 125654UL) & 0x7fffffffUL;
    return r / (double) 0x80000000UL;
}

int main(void)
{
    double mu, sigma;
    int n;

    scanf("%lf", &mu);
    scanf("%lf", &sigma);
    scanf("%d", &n);

    /* TODO: 正規乱数で点数を n 個生成し, 平均・標準偏差・度数分布を表示 */

    return 0;
}
` },
      tests: [{ stdin: '75 10 10', label: '受験者 10 人' }, { stdin: '75 10 1000', label: '受験者 1,000 人' }, { stdin: '75 10 10000', label: '受験者 10,000 人' }],
      hints: ['正規乱数はボックス=ミュラー法: <code class="ic">mu + sigma * sqrt(-2*log(u1)) * cos(2*M_PI*u2)</code> (u1, u2 は myrand)。', '四捨五入は <code class="ic">(int)floor(x + 0.5)</code>。度数分布は <code class="ic">count[s / 5]++</code> (100 点は別区間)。', '標準偏差は <code class="ic">sqrt(sum2 / n - ave * ave)</code>。'],
      check(outs) {
        const nums = (outs[2].out.match(/-?\d+\.\d+/g) || []).map(Number);
        const near = (v) => nums.some((x) => Math.abs(x - v) < 1.5);
        if (!near(75) || !near(10)) return { ok: false, msg: '10,000 人のときの平均 ≈ 75, 標準偏差 ≈ 10 が見つかりません' };
        return { ok: true, msg: '10,000 人で平均・標準偏差が目標値に近づきました。人数による違いを感想に書こう。' };
      },
      summary: '目標の平均値、標準偏差、受験者数を入力し、正規乱数で 0〜100 の整数点\n数を生成して、その平均、標準偏差、5 点刻みの度数分布を表示するプロ\nグラム exam100.c を作成した。',
      reportTitle: 'オプション課題 3.1',
    },
    {
      id: 'opt2', label: 'Opt-2', short: '単語プール strpool', files: ['strpool.c'], optional: true,
      title: 'オプション: 単語を 1 つの配列に詰めて記憶する strpool.c',
      spec: '<p>標準入力から単語を EOF まで入力し, char 配列 <code class="ic">pool</code> に詰めて格納する。各単語の先頭番地を <code class="ic">word[ ]</code> に, 次の空き位置を <code class="ic">next</code> に記憶する。最後に pool, next, word の各要素 (番地と文字列) を表示せよ。</p>',
      starter: { 'strpool.c': R`#include <stdio.h>
#include <string.h>

#define POOL_SIZE 512
#define WORD_MAX 32

char pool[POOL_SIZE];
char* word[WORD_MAX];
char* next;

int main(void)
{
    char buf[POOL_SIZE];
    int n = 0, i;

    next = pool;
    /* TODO: 単語を読み込み, pool に詰めて word[n] に先頭番地を記録 */

    printf("pool    = (%p)\n", pool);
    /* TODO: word[i] の番地と文字列を表示 */
    printf("next    = (%p)\n", next);
    return 0;
}
` },
      tests: [{ stdin: 'this is a pen\n' }],
      hints: ['<code class="ic">scanf("%511s", buf)</code> で 1 語読み, <code class="ic">strcpy(next, buf);</code> で pool の空き位置へ。', '<code class="ic">word[n++] = next;</code> の後, <code class="ic">next += strlen(buf) + 1;</code> (\\0 の分 +1)。', '表示は <code class="ic">printf("word[%d] = (%p) \\"%s\\"\\n", i, word[i], word[i]);</code>'],
      check(outs) {
        const ws = [...outs[0].out.matchAll(/word\[(\d)\]\s*=\s*\((0x[0-9a-f]+)\)\s*"(\w+)"/g)];
        if (ws.length !== 4) return { ok: false, msg: 'word[0]〜word[3] の 4 行 (番地と文字列) が見つかりません' };
        const ad = ws.map((m) => parseInt(m[2], 16));
        if (!(ad[1] - ad[0] === 5 && ad[2] - ad[1] === 3 && ad[3] - ad[2] === 2)) return { ok: false, msg: '番地の間隔が「文字数 + 1」になっていません' };
        return { ok: true, msg: '番地の間隔が 5, 3, 2 (= 文字数 + \\0) になっています。' };
      },
      summary: '標準入力から単語を EOF まで入力し、char 型配列 pool に詰めて格納し、\n各単語の先頭番地を word[] に、次の空き位置を next に記憶するプログ\nラム strpool.c を作成した。',
      reportTitle: 'オプション課題 3.2',
    },
  ];
  tasks.forEach((t) => { t.solution = D.sol[t.id] || {}; });
  window.B3_TASKS = tasks;
})();
