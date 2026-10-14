/* B2 分割コンパイル — 課題定義 (出典: 配布資料「[B2] 分割コンパイル」) */
(function () {
  'use strict';
  const R = String.raw;
  const D = window.B2_DATA || { sol: {}, given: {}, exp: {}, inp: {} };
  const E = D.exp, I = D.inp;
  const QEQ_MAIN = D.sol['2-4'] ? D.sol['2-4']['qeq2main.c'] : '';

  const tasks = [
    {
      id: '2-1', label: '2-1', short: '関数 dist', files: ['dist2.c'],
      title: 'dist.c を, 距離を返す関数 dist を main から呼び出す形に書き換えた dist2.c',
      spec: '<p>課題 (1-4) のプログラム dist.c を書き換え, main 関数から次の関数 dist を呼び出すようにせよ。main と dist は同じファイル内 (dist2.c) に記述せよ。</p><p><code class="ic">double dist(double x1, double y1, double x2, double y2)</code> は, 4 つの double 型の値を受け取って, 2 点 (x1,y1) と (x2,y2) の距離を double 型で返す関数である。dist-in.txt に対して dist-exp.txt が出力されることを確認せよ。</p><div class="req"><span class="chip val">プロトタイプ宣言</span><span class="chip">return</span></div>',
      starter: { 'dist2.c': R`#include <stdio.h>
#include <math.h>

#define REPEAT 3

/* TODO: 関数 dist のプロトタイプ宣言 */

int main(void)
{
    int r;
    double x1, y1, x2, y2;

    for (r = 0; r < REPEAT; r++) {
        fprintf(stderr, "x1 y1 x2 y2 を入力して下さい: ");
        scanf("%lf %lf %lf %lf", &x1, &y1, &x2, &y2);
        /* TODO: dist を呼び出して結果を出力 */
    }
    return 0;
}

/* TODO: 関数 dist の定義 (本体) */
` },
      tests: [{ stdin: I['2-1'], expect: E['2-1'], inName: 'dist-in.txt', expName: 'dist-exp.txt' }],
      hints: [
        'main より後ろで定義する関数は, main より前に<b>プロトタイプ宣言</b>が必要: <code class="ic">double dist(double x1, double y1, double x2, double y2);</code> (末尾に <code class="ic">;</code>)',
        '定義はセミコロンなしで本体 <code class="ic">{ … }</code> を書き, 最後に <code class="ic">return sqrt(dx * dx + dy * dy);</code>',
        'main では <code class="ic">printf("%0.4f\\n", dist(x1, y1, x2, y2));</code>',
      ],
      check(outs, src) { return /double\s+dist\s*\(/.test(src['dist2.c']) ? { ok: true, msg: '関数 dist を使って期待値と一致しました。「メモリで追う」で dist のデータ領域が作られる様子を見てみよう。' } : { ok: false, msg: '関数 double dist(…) が定義されていません' }; },
      summary: '課題 1.4 の dist.c を書き換え、2 点 (x1, y1), (x2, y2) の距離を返す関数\ndouble dist(double x1, double y1, double x2, double y2) を main から呼\nび出すプログラム dist2.c を作成した。',
      reportTitle: '課題 2.1',
    },
    {
      id: '2-2', label: '2-2', short: '2 次方程式 qeq', files: ['qeq.c'],
      title: '2 次方程式 ax²+bx+c=0 の解を出力する関数 void qeq(double a, double b, double c) と qeq.c',
      spec: '<p>double 型の値 a, b, c (ただし a≠0) を受け取って, 2 次方程式 ax²+bx+c=0 の解を標準出力に出力する関数 <code class="ic">void qeq(double a, double b, double c)</code> を作成せよ。</p><ul><li>解は<b>小数点以下 5 桁</b>で, 1 行に出力。2 個ある場合はスペース区切りで<b>小さい順</b>に。</li><li>解がない場合は, <b>改行のみ</b>出力。</li><li>改行の出力は qeq 関数の中で行う (main の中で改行を出力しない)。</li></ul><p>この関数を用いて, 実数 a, b, c を入力して全ての解を出力する動作を繰り返すプログラム qeq.c を作成せよ。ただし, <b>a=0</b> の場合には繰り返しを終了する。</p>',
      starter: { 'qeq.c': R`#include <stdio.h>
#include <math.h>
#include <float.h>   /* DBL_EPSILON */

void qeq(double a, double b, double c);

int main(void)
{
    double a, b, c;

    for (;;) {
        fprintf(stderr, "a b c を入力して下さい (a=0 で終了): ");
        scanf("%lf", &a);
        /* TODO: a が 0 なら終了 */
        scanf("%lf", &b);
        scanf("%lf", &c);
        qeq(a, b, c);
    }
    return 0;
}

void qeq(double a, double b, double c)
{
    /* TODO: 判別式 d = b*b - 4*a*c で場合分けして解を出力 */
}
` },
      tests: [{ stdin: I['2-2'], expect: E['2-2'], inName: 'qeq-in.txt', expName: 'qeq-exp.txt' }],
      hints: [
        'a=0 の判定: 実数は誤差があるので <code class="ic">fabs(a) &lt; DBL_EPSILON</code> のように判定すると安全 (a==0 でも資料の入力なら動きます)。',
        'd &gt; 0 → 2 つ, d == 0 → 1 つ (−b/2a), d &lt; 0 → <code class="ic">printf("\\n");</code> だけ。',
        '<b>a が負のとき</b> (−b−√d)/2a の方が大きくなります。2 つ求めてから比べ, 小さい方を先に出力しよう (期待値の 5 行目 <code class="ic">-0.74568 2.14568</code> がその例)。',
      ],
      summary: '2次方程式 ax^2+bx+c=0 の解を標準出力に出力する関数\nvoid qeq(double a, double b, double c) を作成し、a=0 が入力されるまで\na, b, c の入力と解の出力を繰り返すプログラム qeq.c を作成した。',
      reportTitle: '課題 2.2',
    },
    {
      id: '2-3', label: '2-3', short: 'dist を 3 ファイルに分割', files: ['dist3main.c', 'dist3.c', 'dist3.h'], link: ['dist3main.c', 'dist3.c'], submit: ['dist3.c'], gcc: 'dist3main.c dist3.c',
      title: 'dist2.c を dist3main.c / dist3.c / dist3.h に分割し, 分割コンパイルする',
      spec: '<p>課題 (2-1) で作成したプログラム dist2.c を, 次のファイルに分割し, 分割コンパイルを行え。</p><ul><li>関数 main のみを記述した <b>dist3main.c</b></li><li>関数 dist のみを記述した <b>dist3.c</b></li><li>関数 dist のプロトタイプ宣言を記述した <b>dist3.h</b></li></ul><p>dist-in.txt に対して dist-exp.txt が出力されることを確認せよ。<b>プログラムは dist3.c のみ提出</b>せよ。</p><p class="c-mute">「ターミナル」ボタンで <code class="ic">gcc -c</code> → <code class="ic">gcc dist3main.o dist3.o</code> の手順も試せます。</p>',
      starter: {
        'dist3main.c': R`#include <stdio.h>
/* TODO: dist3.h をインクルード */

#define REPEAT 3

int main(void)
{
    int r;
    double x1, y1, x2, y2;

    for (r = 0; r < REPEAT; r++) {
        fprintf(stderr, "x1 y1 x2 y2 を入力して下さい: ");
        scanf("%lf %lf %lf %lf", &x1, &y1, &x2, &y2);
        printf("%0.4f\n", dist(x1, y1, x2, y2));
    }
    return 0;
}
`,
        'dist3.c': R`#include <math.h>
/* TODO: dist3.h をインクルードし, 関数 dist の定義をここに移す */
`,
        'dist3.h': R`/* TODO: 関数 dist のプロトタイプ宣言 */
`,
      },
      tests: [{ stdin: I['2-1'], expect: E['2-1'], inName: 'dist-in.txt', expName: 'dist-exp.txt' }],
      hints: [
        '自分で作ったヘッダは <code class="ic">#include "dist3.h"</code> (ダブルクォート = 同じディレクトリ)。<code class="ic">&lt;…&gt;</code> は /usr/include の標準ヘッダ。',
        'dist3.h にはプロトタイプ宣言 1 行だけ: <code class="ic">double dist(double x1, double y1, double x2, double y2);</code>',
        'dist3.c には dist の定義だけ。sqrt を使うので <code class="ic">#include &lt;math.h&gt;</code> もここに。main 側は math.h 不要。',
      ],
      check(outs, src) {
        if (!/#include\s*"dist3\.h"/.test(src['dist3main.c'])) return { ok: false, msg: 'dist3main.c が dist3.h をインクルードしていません' };
        if (!/#include\s*"dist3\.h"/.test(src['dist3.c'])) return { ok: false, msg: 'dist3.c からも dist3.h をインクルードしよう (宣言と定義の食い違いをコンパイラが検出できる)' };
        if (/\bdist\s*\([^;]*\)\s*\{/.test(src['dist3main.c'])) return { ok: false, msg: 'dist3main.c に dist の定義が残っています (main のみにする)' };
        return { ok: true, msg: '3 ファイルに分割して期待値と一致しました。' };
      },
      summary: '課題 2.1 の dist2.c を、main のみを記述した dist3main.c、dist のみを\n記述した dist3.c、dist のプロトタイプ宣言を記述した dist3.h に分割\nし、分割コンパイルを行った。',
      reportTitle: '課題 2.3',
    },
    {
      id: '2-4', label: '2-4', short: 'qeq を 3 ファイルに分割', files: ['qeq2main.c', 'qeq2.c', 'qeq2.h'], link: ['qeq2main.c', 'qeq2.c'], submit: ['qeq2.c'], gcc: 'qeq2main.c qeq2.c',
      title: 'qeq.c を qeq2main.c / qeq2.c / qeq2.h に分割し, 分割コンパイルする',
      spec: '<p>課題 (2-2) で作成したプログラム qeq.c を, 次のファイルに分割し, 分割コンパイルを行え。</p><ul><li>関数 main のみを記述した <b>qeq2main.c</b></li><li>関数 qeq のみを記述した <b>qeq2.c</b></li><li>関数 qeq のプロトタイプ宣言を記述した <b>qeq2.h</b></li></ul><p>qeq-in.txt の入力に対して期待値 qeq-exp.txt が出力されることを確認せよ。<b>プログラムは qeq2.c のみ提出</b>せよ。</p>',
      starter: {
        'qeq2main.c': QEQ_MAIN.replace('#include "qeq2.h"\n', '/* TODO: qeq2.h をインクルード */\n'),
        'qeq2.c': R`#include <stdio.h>
#include <math.h>
/* TODO: qeq2.h をインクルードし, 課題 2-2 の関数 qeq の定義をここに移す */
`,
        'qeq2.h': R`/* TODO: 関数 qeq のプロトタイプ宣言 */
`,
      },
      tests: [{ stdin: I['2-2'], expect: E['2-2'], inName: 'qeq-in.txt', expName: 'qeq-exp.txt' }],
      hints: [
        '課題 2-3 と同じ手順。qeq2.h は <code class="ic">void qeq(double a, double b, double c);</code> の 1 行。',
        'qeq2.c は printf と sqrt を使うので stdio.h と math.h の両方が必要。',
        'qeq2main.c には <code class="ic">#include "qeq2.h"</code>。関数が見つからないと「undefined reference」(リンクエラー) になります。',
      ],
      check(outs, src) {
        if (!/#include\s*"qeq2\.h"/.test(src['qeq2main.c'])) return { ok: false, msg: 'qeq2main.c が qeq2.h をインクルードしていません' };
        if (!/#include\s*"qeq2\.h"/.test(src['qeq2.c'])) return { ok: false, msg: 'qeq2.c からも qeq2.h をインクルードしよう' };
        return { ok: true, msg: '分割コンパイルで期待値と一致しました。' };
      },
      summary: '課題 2.2 の qeq.c を、main のみを記述した qeq2main.c、qeq のみを記述\nした qeq2.c、qeq のプロトタイプ宣言を記述した qeq2.h に分割し、分割\nコンパイルを行った。',
      reportTitle: '課題 2.4',
    },
    {
      id: '2-5', label: '2-5', short: '二分法 bisection', files: ['bisection.c'], given: D.given['2-5'], link: ['bisection_main.c', 'bisection.c'], gcc: 'bisection_main.c bisection.c',
      title: '区間 [x1, x2] における f(x)=ax²+bx+c=0 の解を二分法で求める関数 bisection',
      spec: '<p>f(x) = ax² + bx + c に対し, 区間 [x1, x2] における f(x)=0 の解を「二分法」により求めて返す関数 <code class="ic">double bisection(double x1, double x2, double a, double b, double c, double eps, int m)</code> を bisection.c に作成せよ。配布の bisection.h をインクルードし, bisection_main.c とリンクして実行できるようにせよ。</p><p>xmid = (x1+x2)/2 とし, f(x1) と f(xmid) の符号が異なれば [x1, xmid], そうでなければ [xmid, x2] を次の区間とする。計算は次の場合に終了する (|y| には fabs を使う)。</p><ol><li>|f(x1)| &lt; eps → x1 を解として終了</li><li>(1) が成立せず |f(x2)| &lt; eps → x2 を解として終了</li><li>(1)(2) が成立せず, 繰り返し回数が m 回に達した → xmid を解として終了</li></ol><p>計算の過程 (i, x1, x2, f1, f2, xmid, fmid) を <b>stderr</b> に表示し, 正しく計算できていることを確認できるようにせよ。</p>',
      starter: { 'bisection.c': R`#include <stdio.h>
#include <math.h>
#include "bisection.h"

/* f(x) = ax^2 + bx + c */
double f(double x, double a, double b, double c)
{
    return (a * x + b) * x + c;
}

double bisection(double x1, double x2, double a, double b, double c,
                 double eps, int m)
{
    int i;
    double f1, f2, xmid, fmid;

    fprintf(stderr, "%3s %14s %14s %14s %14s %14s %14s\n",
            "i", "x1", "x2", "f1", "f2", "xmid", "fmid");
    for (i = 1; ; i++) {
        f1 = f(x1, a, b, c);
        f2 = f(x2, a, b, c);
        fprintf(stderr, "%3d %14.9f %14.9f %14.9f %14.9f", i, x1, x2, f1, f2);
        /* TODO: 終了条件 (1) (2) */

        xmid = (x1 + x2) / 2;
        fmid = f(xmid, a, b, c);
        fprintf(stderr, " %14.9f %14.9f\n", xmid, fmid);
        /* TODO: 終了条件 (3) と, 区間の更新 */
        if (i >= m) { return xmid; }
    }
}
` },
      tests: [{ stdin: I['2-5'], expect: E['2-5'], inName: 'bis-in.txt', expName: 'bis-exp.txt' }],
      hints: [
        '終了条件 (1): <code class="ic">if (fabs(f1) &lt; eps) { fprintf(stderr, "\\n"); return x1; }</code>。(2) も同様に x2。',
        '符号が異なるかは <code class="ic">(f1 &lt; 0) != (fmid &lt; 0)</code> で判定できる (f1 * fmid &lt; 0 でもよい)。',
        '異なれば解は [x1, xmid] → <code class="ic">x2 = xmid;</code>, そうでなければ <code class="ic">x1 = xmid;</code>。「メモリで追う」で x1, x2 が近づく様子と stderr の表を見比べよう。',
      ],
      check(outs) {
        const er = outs[0].err || '';
        if (!/\b1\s+0\.400000000\s+2\.000000000/.test(er)) return { ok: true, msg: '期待値と一致。<span class="c-addr">計算の過程 (表) も stderr に出すと, 資料の (確認1)〜(確認7) と見比べられます。</span>' };
        return { ok: true, msg: '7 つの入力すべてで期待値と一致。stderr には計算過程の表が出ています (「ターミナル」で表示を確認しよう)。' };
      },
      summary: 'f(x) = ax^2+bx+c に対し、区間 [x1, x2] における f(x)=0 の解を二分法で\n求める関数\ndouble bisection(double x1, double x2, double a, double b, double c,\n                 double eps, int m)\nを bisection.c に作成し、配布された bisection_main.c、bisection.h と\nリンクして実行した。',
      reportTitle: '課題 2.5',
    },
    {
      id: '2-6', label: '2-6', short: '構造体で BMI', files: ['body.c'],
      title: '構造体 body_index_t を使い, 名前・身長・体重から BMI を求めて出力する body.c',
      spec: '<p>次の構造体型を用いて, プログラム body.c を作成せよ。</p><pre class="mini-code">#define NM_LEN 31\ntypedef struct {\n  char name[NM_LEN+1];   /* 名前 */\n  double stature;        /* 身長 [cm] */\n  double weight;         /* 重量 [kg] */\n  double bmi;            /* BMI値 */\n} body_index_t;</pre><ul><li><code class="ic">void body_index_print(body_index_t x)</code>: 名前, 身長, 体重, BMI (double は全て<b>小数点以下 1 桁</b>) を <code class="ic">name: Taro</code> / <code class="ic">stature: 175.4cm</code> / <code class="ic">weight: 65.3kg</code> / <code class="ic">BMI: 21.2</code> の形式で出力</li><li><code class="ic">double bmi(body_index_t x)</code>: BMI = 体重 [kg] / (身長 [m])² を返す (<b>身長の単位が m</b> であることに注意)</li><li>名前, 身長, 体重を標準入力から p に読み込み, p.bmi に BMI を代入し, body_index_print で出力する — を名前が <b>"q"</b> になるまで繰り返す</li></ul>',
      starter: { 'body.c': R`#include <stdio.h>
#include <string.h>

#define NM_LEN 31
#define NM_FMT "%31s"

typedef struct {
  char name[NM_LEN+1];   /* 名前 */
  double stature;        /* 身長 [cm] */
  double weight;         /* 重量 [kg] */
  double bmi;            /* BMI値 */
} body_index_t;

void body_index_print(body_index_t x);
double bmi(body_index_t x);

int main(void)
{
    body_index_t p;

    for (;;) {
        fprintf(stderr, "name: ");
        scanf(NM_FMT, p.name);
        /* TODO: 名前が "q" なら終了 */
        fprintf(stderr, "stature [cm]: ");
        scanf("%lf", &p.stature);
        fprintf(stderr, "weight [kg]: ");
        scanf("%lf", &p.weight);

        /* TODO: p.bmi に BMI を代入して出力 */
    }
    return 0;
}

void body_index_print(body_index_t x)
{
    /* TODO */
}

double bmi(body_index_t x)
{
    /* TODO: 身長を m に直してから計算 */
    return 0;
}
` },
      tests: [{ stdin: I['2-6'], expect: E['2-6'], inName: 'body-in.txt', expName: 'body-exp.txt' }],
      hints: [
        '終了判定は文字列の比較: <code class="ic">if (strcmp(p.name, "q") == 0) { break; }</code>',
        'BMI: <code class="ic">double m = x.stature / 100.0; return x.weight / (m * m);</code> — cm のまま計算すると 0.002 のような値になります。',
        '出力は <code class="ic">printf("stature: %0.1fcm\\n", x.stature);</code> のように単位まで含めて期待値どおりに。',
      ],
      summary: 'name, stature, weight, bmi をメンバーにもつ構造体 body_index_t を用い、\nBMI を返す関数 bmi と情報を出力する関数 body_index_print を作成して、\n名前が q と入力されるまで名前、身長、体重の入力と結果の出力を繰り返すプ\nログラム body.c を作成した。',
      reportTitle: '課題 2.6',
    },
    {
      id: '2-7', label: '2-7', short: '構造体 point_t で dist', files: ['dist4.c'], given: D.given['2-7'], link: ['dist4main.c', 'dist4.c'], gcc: 'dist4main.c dist4.c',
      title: '点を構造体 point_t で表し, double dist(point_t p1, point_t p2) とした dist4.c',
      spec: '<p>課題 (2-3) の dist3.c を書き換えて dist4.c を作成せよ。点を 2 つの double 型変数ではなく, dist4.h で宣言された <code class="ic">point_t</code> 型を用いて表し, 関数を <code class="ic">double dist(point_t p1, point_t p2)</code> に書き換えよ。dist4.c から dist4.h をインクルードし, 配布の dist4main.c とリンクして dist-in.txt に対して dist-exp.txt が出力されることを確認せよ。</p>',
      starter: { 'dist4.c': R`#include <math.h>
/* TODO: dist4.h をインクルード */

double dist(point_t p1, point_t p2)
{
    /* TODO: p1.x, p1.y, p2.x, p2.y を使って距離を返す */
    return 0;
}
` },
      tests: [{ stdin: I['2-7'], expect: E['2-7'], inName: 'dist-in.txt', expName: 'dist-exp.txt' }],
      hints: [
        'point_t の定義は dist4.h にあるので, <code class="ic">#include "dist4.h"</code> がないと「point_t が分からない」というエラーになります。',
        'メンバーは <code class="ic">p1.x</code> のように <code class="ic">.</code> で取り出す。',
        '<code class="ic">double dx = p2.x - p1.x; double dy = p2.y - p1.y; return sqrt(dx * dx + dy * dy);</code>',
      ],
      summary: '課題 2.3 の dist3.c を書き換え、点を構造体 point_t で表して、関数を\ndouble dist(point_t p1, point_t p2) とした dist4.c を作成した。',
      reportTitle: '課題 2.7',
    },
    {
      id: '2-8', label: '2-8', short: '区間 [a,b] の乱数 irand', files: ['irand.c'],
      title: '区間 [a, b] の整数の乱数を返す irand(a, b) と, 生成回数を数える irand.c',
      spec: '<p>2 つの整数 a, b を受け取り, 区間 [a,b] の整数値の乱数を発生させて返す関数 <code class="ic">irand(int a, int b)</code> を作成せよ。この関数を用いて次の操作を行うプログラム irand.c を作成せよ。</p><ul><li>3 つの整数 a, b, n を入力し, irand(a,b) を n 回呼び出して生成された乱数を出力する。</li><li>a から b までの数について, その数が何回生成されたかを数えて出力する。</li></ul><p>表示形式は実行例に倣え (<code class="ic">3: 6</code> のように <code class="ic">数: 回数</code>)。動作確認: ① a=11, b=20, n=10000 で 11〜20 がおよそ 1000 ずつ ② a=7, b=8, n=10 で 7 と 8 の生成数の合計が 10。</p><p class="c-mute">※ 乱数系列は環境 (rand の実装) によって異なるため, このサイトでは「範囲」と「回数の合計」で判定します。</p>',
      starter: { 'irand.c': R`#include <stdio.h>
#include <stdlib.h>   /* rand() を使うときには stdlib.h が必要 */

#define V_MAX 1000    /* 区間の幅の上限 */

int irand(int a, int b)
{
    /* TODO: a 以上 b 以下の乱数を返す (例題 2-5 の rand_10_13 を一般化) */
    return a;
}

int main(void)
{
    int a, b, n, i, r;
    int count[V_MAX];

    fprintf(stderr, "a, b, n を入力: ");
    scanf("%d %d %d", &a, &b, &n);

    /* TODO: count を 0 で初期化, n 回 irand を呼んで出力しつつ数える, 最後に回数を出力 */

    return 0;
}
` },
      tests: [{ stdin: '11 20 10000\n', label: 'a=11, b=20, n=10000' }, { stdin: '7 8 10\n', label: 'a=7, b=8, n=10' }],
      hints: [
        '区間 [a,b] には b−a+1 個の整数がある。<code class="ic">rand() % (b - a + 1)</code> で 0〜b−a, それに a を足す。',
        '回数は配列で: 値 r の回数を <code class="ic">count[r - a]</code> に数えると, a が 0 でなくても添字が 0 から始まる。',
        '最後は <code class="ic">for (i = 0; i &lt;= b - a; i++) { printf("%d: %d\\n", a + i, count[i]); }</code>',
      ],
      check(outs) {
        const res = [];
        for (const [k, a, b, n] of [[0, 11, 20, 10000], [1, 7, 8, 10]]) {
          const o = outs[k].out;
          const cnt = [...o.matchAll(/^\s*(-?\d+)\s*:\s*(\d+)\s*$/gm)].map((m) => [+m[1], +m[2]]);
          if (cnt.length !== b - a + 1) return { ok: false, msg: 'テスト' + (k + 1) + ': 「数: 回数」の行が ' + (b - a + 1) + ' 行ありません (' + cnt.length + ' 行)' };
          if (cnt.some(([v], i) => v !== a + i)) return { ok: false, msg: 'テスト' + (k + 1) + ': 「数: 回数」の数が ' + a + '〜' + b + ' の順になっていません' };
          const sum = cnt.reduce((s, [, c]) => s + c, 0);
          if (sum !== n) return { ok: false, msg: 'テスト' + (k + 1) + ': 回数の合計が ' + sum + ' (n = ' + n + ' のはず)' };
          const body = o.split(/^\s*-?\d+\s*:/m)[0];
          const nums = (body.match(/-?\d+/g) || []).map(Number);
          if (nums.length < n) return { ok: false, msg: 'テスト' + (k + 1) + ': 生成した乱数が ' + n + ' 個出力されていません' };
          if (nums.some((v) => v < a || v > b)) return { ok: false, msg: 'テスト' + (k + 1) + ': 区間 [' + a + ', ' + b + '] の外の値が出ています' };
          res.push(cnt);
        }
        const mx = Math.max(...res[0].map((x) => x[1])), mn = Math.min(...res[0].map((x) => x[1]));
        return { ok: true, msg: '11〜20 の回数は ' + mn + '〜' + mx + ' (およそ 1000 ずつ), 7 と 8 の合計は 10。範囲と合計の両方 OK。' };
      },
      obsTitle: '動作確認の結果',
      obsPh: '例: a=11, b=20, n=10000 では 11〜20 がそれぞれ 9xx〜10xx 回 …',
      observe(outs) {
        const c = [...(outs[0].out || '').matchAll(/^\s*(-?\d+)\s*:\s*(\d+)\s*$/gm)].map((m) => m[1] + ':' + m[2]);
        return c.length ? '観察: a=11, b=20, n=10000 の回数 — ' + c.join(', ') + '。<br><b>注意:</b> 乱数の系列は環境によって異なります。レポートには自分の環境での結果を書こう。' : '';
      },
      summary: '2 つの整数 a, b を受け取り、区間 [a, b] の整数の乱数を返す関数\nint irand(int a, int b) を作成し、a, b, n を入力して irand を n 回呼\nび出した結果の出力と、a から b までの各値が生成された回数の出力を行う\nプログラム irand.c を作成した。',
      reportTitle: '課題 2.8',
    },
    {
      id: 'o2-1', label: 'O2-1', short: 'ニュートン法 newton', files: ['newton.c'], given: D.given['o2-1'], link: ['newton_main.c', 'newton.c'], gcc: 'newton_main.c newton.c', optional: true,
      title: 'ニュートン・ラフソン法で f(x)=ax²+bx+c=0 の解を求める関数 newton',
      spec: '<p>f(x) = ax² + bx + c (a≠0) に対して, ニュートン・ラフソン法により f(x)=0 の解を求める関数 <code class="ic">double newton(double a, double b, double c, double x0, double eps, int max_repeat)</code> を newton.c に作成せよ。x0 は近似解の初期値, eps は許容誤差, max_repeat は繰り返し回数の上限である。</p><p>x0 における接線と x 軸の交点 <code class="ic">x1 = x0 − f(x0)/f\'(x0)</code> を求め, x1 を新たな x0 として繰り返す。収束判定は <code class="ic">|x1−x0| &lt; eps</code> (成立したとき x1 を返す)。計算の過程 (i, x0, f(x0), x1) を stderr に表示せよ。</p><p class="c-mute">資料の注記どおり, コンパイラや機種によって末尾の桁が完全に一致しなくてもよい。このサイトの判定は相対誤差 1e-12 まで許容します。</p>',
      starter: { 'newton.c': R`#include <stdio.h>
#include <math.h>
#include "newton.h"

double newton(double a, double b, double c, double x0, double eps, int max_repeat)
{
    int i;
    double fx, dfx, x1 = x0;

    fprintf(stderr, "%4s %14s %14s %14s\n", "i", "x0", "f(x0)", "x1");
    for (i = 0; i < max_repeat; i++) {
        /* TODO: f(x0), f'(x0) を計算し, x1 = x0 - f(x0)/f'(x0) */

        fprintf(stderr, "%4d %14.10f %14.10f %14.10f\n", i, x0, fx, x1);
        /* TODO: |x1 - x0| < eps なら x1 を返す. そうでなければ x0 = x1 */
    }
    return x1;
}
` },
      tests: [{ stdin: I['o2-1'], expect: E['o2-1'], tol: 1e-12, inName: 'newton-in.txt', expName: 'newton-exp.txt' }],
      hints: [
        'f(x0) = a·x0² + b·x0 + c, f\'(x0) = 2a·x0 + b。',
        '<code class="ic">x1 = x0 - fx / dfx;</code> の後に stderr へ 1 行表示し, <code class="ic">if (fabs(x1 - x0) &lt; eps) { return x1; }</code>',
        '収束しなければ <code class="ic">x0 = x1;</code> で次へ。max_repeat 回で打ち切ったら最後の x1 を返す。',
      ],
      summary: 'f(x) = ax^2+bx+c に対し、ニュートン・ラフソン法により f(x)=0 の解を求\nめる関数\ndouble newton(double a, double b, double c, double x0, double eps,\n              int max_repeat)\nを newton.c に作成し、配布された newton_main.c、newton.h とリンクして\n実行した。',
      reportTitle: 'オプション課題 2.1',
    },
    {
      id: 'o2-2', label: 'O2-2', short: 'お見合いシミュレーション', files: ['omiai.c'], optional: true,
      title: 'お見合いの戦略 x_accept を考えるシミュレーション omiai.c',
      spec: '<ul><li>自分のレベル x は 1〜5 の 5 段階。乱数により <b>1:2:4:2:1</b> の割合で決定 (自分には分からない)。</li><li>お見合いのチャンスは <b>15 回</b>。各回の相手のレベル y も 1:2:4:2:1 で決まる。</li><li>各回の相手に yes と言うかは, 何回目か (c) と相手のレベル (y) で決める関数 <code class="ic">int x_accept(int c, int y)</code>。</li><li>相手が yes と言う確率は <code class="ic">p = (0.19*x)*(1.1-0.1*y)</code>。両方 yes で結婚成立 (以降のお見合いはしない)。</li></ul><p>まず <code class="ic">int x_accept(int c, int y) {return 1;}</code> として, シミュレーションを <b>100 回</b>行って, 結婚できる確率と, 結婚できる相手のレベルの期待値 (結婚できなかった場合のレベルは <b>−5</b>) を求めよ。次に, 期待値をできるだけ大きくできるような x_accept を考えよ。</p>',
      starter: { 'omiai.c': R`#include <stdio.h>
#include <stdlib.h>

#define N_CHANCE 15
#define N_SIM    100

/* 1:2:4:2:1 の割合で 1〜5 のレベルを返す */
int level_rand(void)
{
    int r = rand() % 10;
    /* TODO: r = 0 → 1, 1〜2 → 2, 3〜6 → 3, 7〜8 → 4, 9 → 5 */
    return 3;
}

/* 0 以上 1 未満の一様乱数 */
double urand(void)
{
    return rand() / ((double)RAND_MAX + 1.0);
}

int x_accept(int c, int y)
{
    return 1;   /* まずは誰にでも yes */
}

int main(void)
{
    int s, c, x, y, married;
    int n_married = 0;
    double sum_level = 0.0;

    srand(1);
    for (s = 0; s < N_SIM; s++) {
        x = level_rand();
        married = 0;
        /* TODO: 15 回のお見合い. 両方 yes なら married = y で終了 */

        if (married) { n_married++; sum_level += married; }
        else         { sum_level += -5; }
    }
    printf("結婚できる確率: %0.2f\n", (double)n_married / N_SIM);
    printf("相手のレベルの期待値: %0.2f\n", sum_level / N_SIM);
    return 0;
}
` },
      tests: [{ stdin: '' }],
      hints: [
        'level_rand: <code class="ic">if (r &lt; 1) return 1; if (r &lt; 3) return 2; if (r &lt; 7) return 3; if (r &lt; 9) return 4; return 5;</code>',
        '1 回のお見合い: <code class="ic">y = level_rand(); double p = (0.19 * x) * (1.1 - 0.1 * y); if (x_accept(c, y) &amp;&amp; urand() &lt; p) { married = y; break; }</code>',
        '戦略の例: 最初の 5 回はレベル 4 以上, 次の 5 回はレベル 3 以上, 残りは誰でも yes。srand の値を変えたり N_SIM を増やすと結果が安定する。',
      ],
      check(outs, src) {
        const o = outs[0].out;
        const p = /確率[^0-9-]*([-0-9.]+)/.exec(o), e = /期待値[^0-9-]*([-0-9.]+)/.exec(o);
        if (!p || !e) return { ok: false, msg: '「結婚できる確率」と「相手のレベルの期待値」の 2 つを出力しよう' };
        const pv = +p[1], ev = +e[1];
        if (!(pv >= 0 && pv <= 1)) return { ok: false, msg: '確率が 0〜1 の範囲にありません: ' + pv };
        if (!(ev >= -5 && ev <= 5)) return { ok: false, msg: '期待値が −5〜5 の範囲にありません: ' + ev };
        if (!/rand\s*\(\s*\)\s*%\s*10|RAND_MAX/.test(src['omiai.c'])) return { ok: false, msg: '乱数 (rand) でレベルや yes/no を決めよう' };
        if (pv === 0) return { ok: false, msg: '結婚が 1 回も成立していません (15 回のお見合いの TODO を実装しよう)' };
        if (pv === 1 && ev === 3) return { ok: false, msg: 'レベルが常に 3 になっていませんか? (level_rand の TODO)' };
        const always = /x_accept\s*\([^)]*\)\s*\{\s*return\s+1\s*;\s*\}/.test(src['omiai.c']);
        return { ok: true, msg: '確率 ' + pv + ', 期待値 ' + ev + '。' + (always ? '次は x_accept を工夫して期待値を上げてみよう (模範解答の戦略では 0.99 / 3.67)。' : '戦略を変えて期待値がどう変わるか, 考察欄にまとめよう。') };
      },
      obsTitle: '戦略と結果',
      obsPh: '例: 誰にでも yes → 確率 1.00, 期待値 2.9x。最初の 5 回はレベル 4 以上 … → 確率 0.99, 期待値 3.67',
      observe(outs) { return '観察: ' + (outs[0].out || '').trim().replace(/\n/g, ' / ') + '。<br>x_accept を変えて何回か実行し, 戦略ごとの結果を比較しよう。'; },
      summary: '自分と相手のレベルを 1:2:4:2:1 の割合の乱数で決め、15 回のお見合いで\n両方が yes なら結婚とするシミュレーションを 100 回行い、結婚できる確率\nと相手のレベルの期待値を求めるプログラム omiai.c を作成し、期待値を大\nきくする x_accept を考えた。',
      reportTitle: 'オプション課題 2.2',
    },
  ];
  tasks.forEach((t) => { t.solution = D.sol[t.id] || {}; });
  window.B2_TASKS = tasks;
})();
