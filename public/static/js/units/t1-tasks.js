/* T1 中間試験対策 — 模擬問題 (本番形式: 4 問 × 5 点 + 腕試し 2 問)
 * 期待値はすべて gcc (Linux / glibc) で模範解答を実行して求めたもの (gen_t1.py)。
 * 採点は本番と同じく「表示した入力 + 表示しない入力 (隠しテスト)」+「題意どおりか」のチェック。 */
(function () {
  'use strict';
  const R = String.raw;
  const D = window.T1_DATA || { files: {}, tests: {} };
  const F = D.files, TS = D.tests;
  const pick = (...n) => { const o = {}; n.forEach((k) => (o[k] = F[k])); return o; };
  /* diff -Bw 相当: 空白を全部無視, 空行を無視 */
  const bw = (s) => String(s || '').replace(/\r/g, '').split('\n').map((l) => l.replace(/\s+/g, '')).filter(Boolean).join('\n');
  const strip = (s) => String(s || '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  /* 隠しテスト (表示していない入力) */
  function hidden(key, units, src, CL, extra) {
    const list = TS[key].slice(1);
    for (let k = 0; k < list.length; k++) {
      const tc = list[k];
      const r = CL.run(src, units, { stdin: tc.stdin, maxSnaps: 2, maxOps: 60000000 });
      const lab = '隠しテスト ' + (k + 1) + ' (入力: ' + (tc.stdin.trim().replace(/\n/g, ' ⏎ ').slice(0, 40) || '空') + ')';
      if (r.error) return { ok: false, msg: lab + ' で実行時エラー: ' + r.error.msg };
      if (bw(r.out) !== bw(tc.expect)) return { ok: false, msg: lab + ' で期待値と一致しません。期待値の先頭: <code class="ic">' + U.esc(tc.expect.split('\n')[0] || '(出力なし)') + '</code> / あなたの出力: <code class="ic">' + U.esc((r.out || '(出力なし)').split('\n')[0]) + '</code>' };
      if ((r.exit || 0) !== tc.exit) return { ok: false, msg: lab + ' で終了ステータスが ' + (r.exit || 0) + ' です (期待: ' + tc.exit + ')。exit(1) で終了する場面を確認しよう。' };
    }
    const v = extra ? extra(src) : null;
    if (v) return { ok: false, msg: '<b>題意チェック</b>: ' + v };
    return { ok: true, msg: '隠しテスト ' + list.length + ' 件と題意チェックも通過 — <b>本番なら 5 点</b>。' };
  }
  const vis = (key, base) => [{ stdin: TS[key][0].stdin, expect: TS[key][0].expect, inName: base + '-in.txt', expName: base + '-exp.txt', label: '問題文の入力' }];

  const tasks = [
    {
      id: 'q1', label: '問1', short: '秒 → 時:分:秒 hms', files: ['hms.c'], given: pick('hms.h', 'hmsmain.c'), link: ['hmsmain.c', 'hms.c'], gcc: 'hmsmain.c hms.c',
      title: '秒数を時・分・秒に分け, ポインタ引数で返す hms.c (5 点)',
      spec: '<p>関数 <code class="ic">void hms(int t, int *h, int *m, int *s)</code> を <code class="ic">hms.c</code> に作成せよ。t 秒を <b>時 (h 番地)・分 (m 番地)・秒 (s 番地)</b> に分けて格納する。分と秒は 0〜59。</p><p>配布の <code class="ic">hms.h</code>, <code class="ic">hmsmain.c</code> は変更しない。<code class="ic">gcc hmsmain.c hms.c</code> でコンパイルし, <code class="ic">./a &lt; hms-in.txt &gt; out.txt</code> → <code class="ic">diff -Bw out.txt hms-exp.txt</code> で確認すること。</p><div class="req"><span class="chip">重点: 例題(3-4) 課題(3-4)(3-5)</span><span class="chip ptr">ポインタ引数</span><span class="chip">分割コンパイル</span></div>',
      starter: { 'hms.c': R`#include "hms.h"

void hms(int t, int *h, int *m, int *s)
{
  /* ここを完成させよ */
}
` },
      solution: pick('hms.c'),
      tests: vis('hms', 'hms'),
      check: (outs, src, CL) => hidden('hms', ['hmsmain.c', 'hms.c'], src, CL, (s) => {
        const c = strip(s['hms.c']);
        if (/printf|scanf/.test(c)) return 'hms.c の中で入出力をしています。結果は<b>ポインタの指す先</b>に格納し, 表示は main に任せる。';
        if (!/\*\s*h\s*=/.test(c) || !/\*\s*m\s*=/.test(c) || !/\*\s*s\s*=/.test(c)) return '*h, *m, *s にそれぞれ代入していますか?';
        return null;
      }),
      hints: ['時は <code class="ic">t / 3600</code>, 秒は <code class="ic">t % 60</code>。', '分は「1 時間に満たない残り」を 60 で割る: <code class="ic">t % 3600 / 60</code>', '値は <code class="ic p">*h = …;</code> のように<b>指す先へ</b>代入 (課題 3-4 の divrem と同じ形)。'],
      summary: 't 秒を時・分・秒に分けて h, m, s 番地に格納する関数 void hms(int t,\nint *h, int *m, int *s) を hms.c に作成した。',
      reportTitle: '問 1',
    },
    {
      id: 'q2', label: '問2', short: '構造体ポインタ 三角形', files: ['tri.c'], given: pick('tri.h', 'trimain.c'), link: ['trimain.c', 'tri.c'], gcc: 'trimain.c tri.c -lm',
      title: 'point_t へのポインタで三角形の面積と重心を求める tri.c (5 点)',
      spec: '<p><code class="ic">tri.h</code> で定義された <code class="ic">point_t</code> を使い, 次の 3 関数を <code class="ic">tri.c</code> に作成せよ。</p><ul><li><code class="ic">int point_scan(point_t *p)</code> — p の指す変数の x, y に実数を読み込む (プロンプト <code class="ic">x y = </code> は stderr)。EOF なら EOF, そうでなければ 1 を返す。</li><li><code class="ic">double tri_area(point_t *a, point_t *b, point_t *c)</code> — 3 点を頂点とする三角形の面積を返す: S = |(x<sub>b</sub>−x<sub>a</sub>)(y<sub>c</sub>−y<sub>a</sub>) − (x<sub>c</sub>−x<sub>a</sub>)(y<sub>b</sub>−y<sub>a</sub>)| / 2</li><li><code class="ic">void centroid(point_t *a, point_t *b, point_t *c, point_t *g)</code> — 重心を g の指す変数に格納する。</li></ul>',
      starter: { 'tri.c': R`#include <stdio.h>
#include <math.h>
#include "tri.h"

int point_scan(point_t *p)
{
  /* TODO */
  return EOF;
}

double tri_area(point_t *a, point_t *b, point_t *c)
{
  /* TODO */
  return 0.0;
}

void centroid(point_t *a, point_t *b, point_t *c, point_t *g)
{
  /* TODO */
}
` },
      solution: pick('tri.c'),
      tests: vis('tri', 'tri'),
      check: (outs, src, CL) => hidden('tri', ['trimain.c', 'tri.c'], src, CL, (s) => {
        const c = strip(s['tri.c']);
        if (!/->/.test(c)) return '構造体へのポインタのメンバーは <code class="ic">p-&gt;x</code> でたどろう。';
        if (!/fabs/.test(c)) return '面積は絶対値 (fabs) をとらないと, 頂点の順番によって負になります。';
        return null;
      }),
      hints: ['メンバーは <code class="ic p">p-&gt;x</code>。scanf には番地: <code class="ic">scanf("%lf%lf", &amp;p-&gt;x, &amp;p-&gt;y)</code>', '<b>隠しテストには頂点が時計回りの三角形</b>もある → <code class="ic">fabs(…) / 2.0</code>', '重心は <code class="ic">g-&gt;x = (a-&gt;x + b-&gt;x + c-&gt;x) / 3.0;</code>'],
      summary: 'point_t 型へのポインタを受け取る関数 point_scan, tri_area, centroid\nを tri.c に作成した。',
      reportTitle: '問 2',
    },
    {
      id: 'q3', label: '問3', short: 'サイコロ 2 個の分布', files: ['dice2sub.c'], given: pick('dice2sub.h', 'dice2.c'), link: ['dice2.c', 'dice2sub.c'], gcc: 'dice2.c dice2sub.c',
      title: '2 個のサイコロの目の和の分布 dice2sub.c (5 点)',
      spec: '<ul><li><code class="ic">void dice_throw(int d[ ], int n)</code> — 1〜6 の整数の一様乱数を <code class="ic">rand() % 6 + 1</code> で n 個発生し, d[0]〜d[n-1] に<b>順に</b>格納する。</li><li><code class="ic">void dice2_distr(int n, int d1[ ], int d2[ ], int c[ ])</code> — d1[i]+d2[i] の和 s の出現回数を c[s] (s = D2_MIN〜D2_MAX) に数える。</li></ul><div class="callout warn" style="margin-top:10px">dice2.c は <b>c[ ] にわざとゴミを入れてから</b> dice2_distr を呼ぶ。srand を呼ばないので, 乱数列は毎回同じ = <b>diff で採点できる</b>。</div>',
      starter: { 'dice2sub.c': R`#include <stdlib.h>
#include "dice2sub.h"

void dice_throw(int d[], int n)
{
  /* TODO */
}

void dice2_distr(int n, int d1[], int d2[], int c[])
{
  /* TODO */
}
` },
      solution: pick('dice2sub.c'),
      tests: vis('dice2', 'dice2'),
      check: (outs, src, CL) => hidden('dice2', ['dice2.c', 'dice2sub.c'], src, CL, (s) => {
        const c = strip(s['dice2sub.c']);
        if (!/rand\s*\(\s*\)/.test(c)) return 'dice_throw の中で rand() を使っていますか?';
        if (/srand/.test(c)) return '問題文に srand を呼べとは書いていません (呼ぶと乱数列が変わり diff が合わない)。';
        return null;
      }),
      hints: ['課題 3-10 (サイコロ 3 個) の 2 個版。', 'dice2_distr の最初で <b>c[D2_MIN]〜c[D2_MAX] を 0 に</b> (ゴミが入っている)。', '<code class="ic">c[d1[i] + d2[i]]++;</code>'],
      summary: '1〜6 の乱数を n 個格納する dice_throw と, 2 個のサイコロの目の和の\n出現回数を数える dice2_distr を dice2sub.c に作成した。',
      reportTitle: '問 3',
    },
    {
      id: 'q4', label: '問4', short: '行列の積とトレース', files: ['matcalc.c'], given: pick('mat.h', 'matmain.c', 'matio.c'), link: ['matmain.c', 'matio.c', 'matcalc.c'], gcc: 'matmain.c matio.c matcalc.c',
      title: 'n×n 行列の積 C = AB とトレース tr(C) — matcalc.c (5 点)',
      spec: '<p><code class="ic">mat.h</code> (N = 4) の宣言に従い, 次の 2 関数を <code class="ic">matcalc.c</code> に作成せよ。入出力関数は配布の <code class="ic">matio.c</code> にある (3 ファイルの分割コンパイル)。</p><ul><li><code class="ic">void matrix_mult(int n, double A[N][N], double B[N][N], double C[N][N])</code> — C<sub>ij</sub> = Σ<sub>k</sub> A<sub>ik</sub> B<sub>kj</sub></li><li><code class="ic">double matrix_trace(int n, double A[N][N])</code> — 対角成分の和を返す。</li></ul><div class="callout warn" style="margin-top:10px">matmain.c は <b>C に 99.0 を入れてから</b> matrix_mult を呼ぶ。</div>',
      starter: { 'matcalc.c': R`#include "mat.h"

void matrix_mult(int n, double A[N][N], double B[N][N], double C[N][N])
{
  /* TODO */
}

double matrix_trace(int n, double A[N][N])
{
  /* TODO */
  return 0.0;
}
` },
      solution: pick('matcalc.c'),
      tests: vis('mat', 'mat'),
      check: (outs, src, CL) => hidden('mat', ['matmain.c', 'matio.c', 'matcalc.c'], src, CL, (s) => {
        const c = strip(s['matcalc.c']);
        if (/printf|scanf/.test(c)) return 'matcalc.c は計算だけ。入出力は matio.c の関数に任せる。';
        if (/\b[0-9]\s*;\s*[ijk]\s*\+\+|<\s*[234]\s*;/.test(c)) return 'ループの上限を数値で固定していませんか? 上限は引数 n。';
        return null;
      }),
      hints: ['3 重ループ: i (行), j (列), k (足し込み)。', '<code class="ic">C[i][j] = 0.0;</code> にしてから <code class="ic">C[i][j] += A[i][k] * B[k][j];</code>', 'ループの上限は N ではなく <b>n</b> (隠しテストに n = 1, 4 がある)。'],
      summary: 'n×n 行列の積を求める matrix_mult と, トレースを返す matrix_trace を\nmatcalc.c に作成し, matmain.c, matio.c とリンクした。',
      reportTitle: '問 4',
    },
    {
      id: 'x1', label: '腕試し1', short: '平均と標準偏差 + exit', files: ['stat.c'], optional: true,
      title: 'サンプルプログラムの技で: 平均と標準偏差 stat.c',
      spec: '<p>サンプルプログラムの <code class="ic">double_scan_sqrt</code> と同じ形で, 最大 <code class="ic">N_ARRAY</code> (= 10) 個の実数を EOF まで読み込み, 個数 n, 平均, 標準偏差 (分散は n で割る) を表示せよ。</p><ul><li>表示は <code class="ic">n = %d</code> / <code class="ic">ave = %.3f</code> / <code class="ic">sd = %.3f</code> の 3 行。</li><li><b>負の値</b>が入力されたら, stderr に <code class="ic">a[i]&lt;0</code> を表示して <code class="ic">exit(1)</code> (何も stdout に出さない)。</li><li>データが 1 個もなければ stderr に <code class="ic">no data</code> を表示して <code class="ic">exit(1)</code>。</li></ul>',
      starter: { 'stat.c': R`#include <stdio.h>
#include <math.h>
#include <stdlib.h>
#define N_ARRAY 10

int main(void)
{
  double a[N_ARRAY];
  int n;

  /* TODO */

  return 0;
}
` },
      solution: pick('stat.c'),
      tests: vis('stat', 'stat'),
      check: (outs, src, CL) => hidden('stat', ['stat.c'], src, CL, (s) => (/exit\s*\(\s*1\s*\)/.test(strip(s['stat.c'])) ? null : '異常時は exit(1) で終了しよう。')),
      hints: ['読み込みはサンプルと同じ: <code class="ic">for (n=0; n&lt;N_ARRAY; n++) { if (scanf("%lf", &amp;a[n])==EOF) { break; } }</code>', '負の判定は読み込んだ直後でも, 後でまとめてでも OK。<b>何も表示する前に</b> exit(1)。', '隠しテストに <b>12 個</b>の入力がある → 10 個で打ち切る。'],
      summary: '最大 10 個の実数を読み込み, 平均と標準偏差を表示する stat.c を作成した。',
      reportTitle: '腕試し 1',
    },
    {
      id: 'x2', label: '腕試し2', short: '文字列 strcmp / strlen', files: ['word.c'], optional: true,
      title: 'サンプルプログラムの技で: 単語の比較 word.c',
      spec: '<p>最初に単語 key を読み込み, 続けて EOF まで単語を読み込む (どちらも <code class="ic">scanf(STR_FMT, …)</code>, STR_FMT = <code class="ic">"%31s"</code>)。次の 3 行を表示せよ。</p><ul><li><code class="ic">words = 単語数</code> (key を除く)</li><li><code class="ic">same as key = key と同じ単語の数</code> (大文字・小文字は区別)</li><li><code class="ic">longest = 最も長い単語 (文字数)</code> — key も含めて比べ, 同じ長さなら先に出た方。</li></ul>',
      starter: { 'word.c': R`#include <stdio.h>
#include <string.h>
#define STR_LEN 31
#define STR_FMT "%31s"

int main(void)
{
  char key[STR_LEN+1], w[STR_LEN+1], longest[STR_LEN+1];

  /* TODO */

  return 0;
}
` },
      solution: pick('word.c'),
      tests: vis('word', 'word'),
      check: (outs, src, CL) => hidden('word', ['word.c'], src, CL, (s) => { const c = strip(s['word.c']); if (!/strcmp/.test(c)) return '文字列の比較は == ではなく strcmp。'; if (!/strcpy/.test(c)) return '配列への文字列の代入は strcpy。'; return null; }),
      hints: ['文字列の一致は <code class="ic">strcmp(w, key) == 0</code>。<code class="ic">w == key</code> は<b>番地</b>の比較になる。', '最長の単語は <code class="ic">strcpy(longest, w)</code> で保存 (配列に = は使えない)。', '長さの表示は <code class="ic">(int)strlen(longest)</code>。'],
      summary: '単語を読み込み, key との一致数と最長の単語を表示する word.c を作成した。',
      reportTitle: '腕試し 2',
    },
  ];
  window.T1_TASKS = tasks;
  window.T1_BW = bw;
})();
