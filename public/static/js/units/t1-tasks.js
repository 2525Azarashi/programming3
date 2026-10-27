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
      if (bw(r.out) !== bw(tc.expect)) {
        // 最初に違う行を探す (diff -Bw と同じく空白・空行は無視)
        const L = (t) => String(t || '').replace(/\r/g, '').split('\n').filter((l) => l.trim() !== '');
        const E = L(tc.expect), A = L(r.out);
        let k = 0; while (k < Math.max(E.length, A.length) && (E[k] || '').replace(/\s+/g, '') === (A[k] || '').replace(/\s+/g, '')) k++;
        const show = (x) => (x === undefined ? '(行がない)' : U.esc(x));
        return { ok: false, msg: lab + ' で期待値と一致しません (' + (k + 1) + ' 行目)。期待値: <code class="ic">' + show(E[k]) + '</code> / あなたの出力: <code class="ic">' + show(A[k]) + '</code>' };
      }
      if ((r.exit || 0) !== tc.exit) return { ok: false, msg: lab + ' で終了ステータスが ' + (r.exit || 0) + ' です (期待: ' + tc.exit + ')。exit(1) で終了する場面を確認しよう。' };
    }
    const v = extra ? extra(src) : null;
    if (v) return { ok: false, msg: '<b>題意チェック</b>: ' + v };
    return { ok: true, msg: '隠しテスト ' + list.length + ' 件と題意チェックも通過 — <b>本番なら 5 点</b>。' };
  }
  const vis = (key, base) => [{ stdin: TS[key][0].stdin, expect: TS[key][0].expect, inName: base + '-in.txt', expName: base + '-exp.txt', label: '問題文の入力' }];

  const tasks = [
    {
      id: 'q1', set: 1, label: '1-問1', short: '秒 → 時:分:秒 hms', files: ['hms.c'], given: pick('hms.h', 'hmsmain.c'), link: ['hmsmain.c', 'hms.c'], gcc: 'hmsmain.c hms.c',
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
      reportTitle: '第1回 問 1',
    },
    {
      id: 'q2', set: 1, label: '1-問2', short: '構造体ポインタ 三角形', files: ['tri.c'], given: pick('tri.h', 'trimain.c'), link: ['trimain.c', 'tri.c'], gcc: 'trimain.c tri.c -lm',
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
      reportTitle: '第1回 問 2',
    },
    {
      id: 'q3', set: 1, label: '1-問3', short: 'サイコロ 2 個の分布', files: ['dice2sub.c'], given: pick('dice2sub.h', 'dice2.c'), link: ['dice2.c', 'dice2sub.c'], gcc: 'dice2.c dice2sub.c',
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
      reportTitle: '第1回 問 3',
    },
    {
      id: 'q4', set: 1, label: '1-問4', short: '行列の積とトレース', files: ['matcalc.c'], given: pick('mat.h', 'matmain.c', 'matio.c'), link: ['matmain.c', 'matio.c', 'matcalc.c'], gcc: 'matmain.c matio.c matcalc.c',
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
      reportTitle: '第1回 問 4',
    },
    /* ======================= 第 2 回 ======================= */
    {
      id: 'r2q1', set: 2, label: '2-問1', short: '3 つの値を昇順に sort3', files: ['sort3.c'], given: pick('sort3.h', 'sort3main.c'), link: ['sort3main.c', 'sort3.c'], gcc: 'sort3main.c sort3.c',
      title: '3 つの int をポインタで受け取り小さい順に並べ替える sort3.c (5 点)',
      spec: '<p>関数 <code class="ic">void sort3(int *a, int *b, int *c)</code> を <code class="ic">sort3.c</code> に作成せよ。呼び出し後に <b>*a ≤ *b ≤ *c</b> となるよう, 3 つの変数の値を入れ替える。</p><p>2 つの変数を交換する補助関数 <code class="ic">void swap_int(int *x, int *y)</code> を同じファイルに作って使うこと (sort3.h には書かない)。</p><div class="req"><span class="chip">重点: 例題(3-4) 課題(3-4)</span><span class="chip ptr">ポインタ引数</span><span class="chip">関数から関数へポインタを渡す</span></div>',
      starter: { 'sort3.c': R`#include "sort3.h"

void swap_int(int *x, int *y)
{
  /* TODO */
}

void sort3(int *a, int *b, int *c)
{
  /* TODO */
}
` },
      solution: pick('sort3.c'),
      tests: vis('sort3', 'sort3'),
      check: (outs, src, CL) => hidden('sort3', ['sort3main.c', 'sort3.c'], src, CL, (s) => {
        const c = strip(s['sort3.c']);
        if (!/swap_int\s*\(\s*[a-z]\s*,\s*[a-z]\s*\)/.test(c)) return 'sort3 の中から swap_int を呼んでいますか? (a, b はすでにポインタなので & は付けない)';
        if (/printf|scanf/.test(c)) return 'sort3.c の中で入出力をしています。並べ替えだけを行う。';
        return null;
      }),
      hints: ['swap_int は課題 3-4 と同じ形: <code class="ic">int t = *x; *x = *y; *y = t;</code>', '比較と交換を 3 回: (a,b) → (b,c) → (a,b)。', 'sort3 の中の a は<b>すでに番地</b>。swap_int に渡すときは <code class="ic">swap_int(a, b)</code> で <code class="ic">&amp;</code> 不要。'],
      summary: '3 つの int 型変数の番地を受け取り昇順に並べ替える sort3 と, 2 変数を\n交換する swap_int を sort3.c に作成した。',
      reportTitle: '第2回 問 1',
    },
    {
      id: 'r2q2', set: 2, label: '2-問2', short: '構造体ポインタ 割引と合計', files: ['item.c'], given: pick('item.h', 'itemmain.c'), link: ['itemmain.c', 'item.c'], gcc: 'itemmain.c item.c',
      title: 'item_t へのポインタで品物を読み, 割引して小計を返す item.c (5 点)',
      spec: '<p><code class="ic">item.h</code> の <code class="ic">item_t</code> (品名 name, 単価 price, 個数 qty) を使い, 次の 3 関数を <code class="ic">item.c</code> に作成せよ。</p><ul><li><code class="ic">int item_scan(item_t *p)</code> — 品名・単価・個数を読む (品名は <code class="ic">NM_FMT</code>)。EOF なら EOF, そうでなければ 1。</li><li><code class="ic">void item_discount(item_t *p, int pct)</code> — 単価を pct % 引きにする: <b>price × (100 − pct) / 100</b> (整数演算, 小数点以下切り捨て)。</li><li><code class="ic">int item_total(item_t *p)</code> — 単価 × 個数を返す。</li></ul>',
      starter: { 'item.c': R`#include <stdio.h>
#include "item.h"

int item_scan(item_t *p)
{
  /* TODO */
  return EOF;
}

void item_discount(item_t *p, int pct)
{
  /* TODO */
}

int item_total(item_t *p)
{
  /* TODO */
  return 0;
}
` },
      solution: pick('item.c'),
      tests: vis('item', 'item'),
      check: (outs, src, CL) => hidden('item', ['itemmain.c', 'item.c'], src, CL, (s) => {
        const c = strip(s['item.c']);
        if (!/->/.test(c)) return '構造体へのポインタのメンバーは p-&gt;price でたどろう。';
        if (/&\s*p\s*->\s*name/.test(c)) return '文字列 (char 配列) を scanf で読むとき, name はすでに先頭の番地なので &amp; は付けない。';
        return null;
      }),
      hints: ['例題 3-5 の item_scan とほぼ同じ形。文字列は <code class="ic">scanf(NM_FMT, p-&gt;name)</code> (&amp; なし), 数値は <code class="ic">&amp;p-&gt;price</code>。', '割引は <b>掛けてから割る</b>: <code class="ic">p-&gt;price * (100 - pct) / 100</code>。先に <code class="ic">(100 - pct) / 100</code> を計算すると整数割り算で 0 になる。', '隠しテストに <b>品物が 0 個</b>のケースがある (total = 0 だけが出る)。'],
      summary: 'item_t 型へのポインタを受け取る関数 item_scan, item_discount,\nitem_total を item.c に作成した。',
      reportTitle: '第2回 問 2',
    },
    {
      id: 'r2q3', set: 2, label: '2-問3', short: 'サイコロの出目と最長連続', files: ['dicerun.c'], given: pick('dicerun.h', 'dicerunmain.c'), link: ['dicerunmain.c', 'dicerun.c'], gcc: 'dicerunmain.c dicerun.c',
      title: 'サイコロの出目の回数と, 同じ目の最長連続 dicerun.c (5 点)',
      spec: '<ul><li><code class="ic">void dice_throw(int d[ ], int n)</code> — <code class="ic">rand() % 6 + 1</code> で n 個の目を d[0]〜d[n-1] に順に格納する。</li><li><code class="ic">void dice_count(int d[ ], int n, int c[ ])</code> — 目 k (1〜6) が出た回数を c[k] に数える。</li><li><code class="ic">int longest_run(int d[ ], int n, int *val)</code> — <b>同じ目が連続した最長の長さ</b>を返し, その目を *val に格納する。最長が複数あるときは<b>先に現れた方</b>。</li></ul><div class="callout warn" style="margin-top:10px">dicerunmain.c は <b>c[ ] にゴミを入れてから</b> dice_count を呼ぶ。srand は呼ばない。</div>',
      starter: { 'dicerun.c': R`#include <stdlib.h>
#include "dicerun.h"

void dice_throw(int d[], int n)
{
  /* TODO */
}

void dice_count(int d[], int n, int c[])
{
  /* TODO */
}

int longest_run(int d[], int n, int *val)
{
  /* TODO */
  return 0;
}
` },
      solution: pick('dicerun.c'),
      tests: vis('dicerun', 'dicerun'),
      check: (outs, src, CL) => hidden('dicerun', ['dicerunmain.c', 'dicerun.c'], src, CL, (s) => (/srand/.test(strip(s['dicerun.c'])) ? 'srand を呼ぶと乱数列が変わり期待値と合わなくなる。' : null)),
      hints: ['dice_count: まず <code class="ic">c[1]〜c[6] = 0</code>, それから <code class="ic">c[d[i]]++;</code>', 'longest_run: 「今の連続の長さ len」と「最長 best」を持つ。<code class="ic">d[i] == d[i-1]</code> なら len++, 違えば len = 1。', 'len が best を<b>超えたとき</b>だけ更新すれば「先に現れた方」になる (≥ にしない)。n = 1 のときは長さ 1, 目は d[0]。'],
      summary: 'サイコロの出目を生成する dice_throw, 目ごとの回数を数える dice_count,\n同じ目の最長連続を求める longest_run を dicerun.c に作成した。',
      reportTitle: '第2回 問 3',
    },
    {
      id: 'r2q4', set: 2, label: '2-問4', short: 'A + Aᵀ と対称判定', files: ['sym.c'], given: pick('sym.h', 'symmain.c', 'symio.c'), link: ['symmain.c', 'symio.c', 'sym.c'], gcc: 'symmain.c symio.c sym.c',
      title: 'A + Aᵀ を求め, 対称行列かを判定する sym.c (5 点)',
      spec: '<p><code class="ic">sym.h</code> (N = 4) に従い, 次の 2 関数を <code class="ic">sym.c</code> に作成せよ。入出力関数は配布の <code class="ic">symio.c</code>。</p><ul><li><code class="ic">void matrix_add_trans(int n, double A[N][N], double Y[N][N])</code> — Y = A + Aᵀ (Y<sub>ij</sub> = A<sub>ij</sub> + A<sub>ji</sub>)。A は変更しない。</li><li><code class="ic">int matrix_is_sym(int n, double A[N][N])</code> — すべての i, j で A<sub>ij</sub> = A<sub>ji</sub> なら 1, そうでなければ 0 を返す。</li></ul>',
      starter: { 'sym.c': R`#include "sym.h"

void matrix_add_trans(int n, double A[N][N], double Y[N][N])
{
  /* TODO */
}

int matrix_is_sym(int n, double A[N][N])
{
  /* TODO */
  return 0;
}
` },
      solution: pick('sym.c'),
      tests: vis('sym', 'sym'),
      check: (outs, src, CL) => hidden('sym', ['symmain.c', 'symio.c', 'sym.c'], src, CL, (s) => {
        const c = strip(s['sym.c']);
        if (/printf|scanf/.test(c)) return 'sym.c は計算と判定だけ。入出力は symio.c に任せる。';
        if (/<\s*N\s*;/.test(c)) return 'ループの上限が N になっていませんか? 上限は引数 n。';
        return null;
      }),
      hints: ['Y は課題 4-1 (3)(4) の組み合わせ: <code class="ic">Y[i][j] = A[i][j] + A[j][i];</code>', '判定は「1 つでも違えばすぐ <code class="ic">return 0;</code>」, ループを最後まで回り切ったら <code class="ic">return 1;</code>', '隠しテストに n = 1, n = 4 (右上だけ非対称) がある。上限は <b>n</b>。'],
      summary: 'A + A^T を求める matrix_add_trans と, 対称行列かを判定する\nmatrix_is_sym を sym.c に作成し, symmain.c, symio.c とリンクした。',
      reportTitle: '第2回 問 4',
    },
    /* ======================= 第 3 回 ======================= */
    {
      id: 'r3q1', set: 3, label: '3-問1', short: '配列の最小・最大・平均', files: ['minmax.c'], given: pick('minmax.h', 'minmaxmain.c'), link: ['minmaxmain.c', 'minmax.c'], gcc: 'minmaxmain.c minmax.c',
      title: '配列を読み込み, 最小・最大・平均を 3 つのポインタで返す minmax.c (5 点)',
      spec: '<ul><li><code class="ic">int array_scan(double a[ ])</code> — 最大 <code class="ic">N_MAX</code> 個の実数を EOF まで読み込み, 読めた個数を返す (サンプルの double_scan_sqrt と同じ形)。</li><li><code class="ic">void array_stat(int n, double a[ ], double *min, double *max, double *ave)</code> — a[0]〜a[n-1] の最小値・最大値・平均値をそれぞれ *min, *max, *ave に格納する。</li></ul><p>データが 0 個のときは main が <code class="ic">exit(1)</code> する (array_stat は n ≥ 1 で呼ばれる)。</p><div class="req"><span class="chip">重点: 課題(3-5) 課題(3-9)</span><span class="chip ptr">返す値が 3 つ</span></div>',
      starter: { 'minmax.c': R`#include <stdio.h>
#include "minmax.h"

int array_scan(double a[])
{
  /* TODO */
  return 0;
}

void array_stat(int n, double a[], double *min, double *max, double *ave)
{
  /* TODO */
}
` },
      solution: pick('minmax.c'),
      tests: vis('minmax', 'minmax'),
      check: (outs, src, CL) => hidden('minmax', ['minmaxmain.c', 'minmax.c'], src, CL, (s) => {
        const c = strip(s['minmax.c']);
        if (!/N_MAX/.test(c)) return '読み込みの上限は配列の大きさ N_MAX (マクロ) で決める。数値で書くと配列の外に書き込む恐れがある。';
        if (/\*\s*min\s*=\s*0(\.0*)?\s*;|\*\s*max\s*=\s*0(\.0*)?\s*;/.test(c)) return '最小値・最大値の初期値を 0 にしていませんか? <b>a[0]</b> から始めるのが安全 (全部負の値・全部正の値のとき)。';
        return null;
      }),
      hints: ['最小・最大は <code class="ic">*min = a[0]; *max = a[0];</code> から始める。0 から始めると<b>全部負の値</b>のときに間違える (隠しテストにある)。', '平均は合計を double で足してから <code class="ic">*ave = s / n;</code>', 'N_MAX (= 100) を超えて読まないこと (隠しテストに 101 個の入力がある)。'],
      summary: '実数を配列に読み込む array_scan と, 最小値・最大値・平均値を\nポインタで返す array_stat を minmax.c に作成した。',
      reportTitle: '第3回 問 1',
    },
    {
      id: 'r3q2', set: 3, label: '3-問2', short: '入れ子の構造体 2 円の関係', files: ['circle.c'], given: pick('circle.h', 'circlemain.c'), link: ['circlemain.c', 'circle.c'], gcc: 'circlemain.c circle.c -lm',
      title: '構造体の中の構造体: 2 つの円の面積と位置関係 circle.c (5 点)',
      spec: '<p><code class="ic">circle.h</code> では円 <code class="ic">circle_t</code> が中心 <code class="ic">point_t c</code> と半径 <code class="ic">r</code> を持つ (構造体の入れ子)。次の 3 関数を <code class="ic">circle.c</code> に作成せよ。π = 3.14159265358979, 誤差の許容 EPS = 1e-9。</p><ul><li><code class="ic">int circle_scan(circle_t *p)</code> — 中心の x, y と半径 r を読む。EOF なら EOF, そうでなければ 1。</li><li><code class="ic">double circle_area(circle_t *p)</code> — 面積 πr²。</li><li><code class="ic">int circle_relation(circle_t *p, circle_t *q)</code> — 中心間の距離を d として次を返す: d &gt; r₁+r₂ (+EPS) なら <b>0</b> (離れている) / |d − (r₁+r₂)| ≤ EPS なら <b>1</b> (外接) / d &lt; |r₁−r₂| (+EPS) なら <b>3</b> (一方が他方を含む, 内接を含む) / それ以外 <b>2</b> (交わる)。<b>この順に</b>判定する。</li></ul>',
      starter: { 'circle.c': R`#include <stdio.h>
#include <math.h>
#include "circle.h"

#define PI 3.14159265358979
#define EPS 1e-9

int circle_scan(circle_t *p)
{
  /* TODO */
  return EOF;
}

double circle_area(circle_t *p)
{
  /* TODO */
  return 0.0;
}

int circle_relation(circle_t *p, circle_t *q)
{
  /* TODO */
  return 0;
}
` },
      solution: pick('circle.c'),
      tests: vis('circle', 'circle'),
      check: (outs, src, CL) => hidden('circle', ['circlemain.c', 'circle.c'], src, CL, (s) => {
        const c = strip(s['circle.c']);
        if (!/->\s*c\s*\.\s*x/.test(c)) return '中心の座標は <code class="ic">p-&gt;c.x</code> (ポインタは -&gt;, その中の構造体は .) でたどろう。';
        if (!/fabs/.test(c)) return '|r₁ − r₂| には fabs を使う (半径の大小は入力次第)。';
        return null;
      }),
      hints: ['入れ子のメンバー: <code class="ic">p-&gt;c.x</code>。scanf には <code class="ic">&amp;p-&gt;c.x</code>, <code class="ic">&amp;p-&gt;r</code>。', '距離は <code class="ic">sqrt(dx*dx + dy*dy)</code> (課題 3-7 の dist と同じ)。', '判定は<b>問題文の順</b>に if を並べる。隠しテストに<b>同じ円</b> (d = 0) や <b>小さい円が先</b>のケースがある → |r₁−r₂| は fabs。'],
      summary: '中心 (point_t) と半径を持つ circle_t へのポインタを受け取る関数\ncircle_scan, circle_area, circle_relation を circle.c に作成した。',
      reportTitle: '第3回 問 2',
    },
    {
      id: 'r3q3', set: 3, label: '3-問3', short: '点数の度数分布 (10 点刻み)', files: ['hist.c'], given: pick('hist.h', 'histmain.c'), link: ['histmain.c', 'hist.c'], gcc: 'histmain.c hist.c',
      title: '乱数で点数を作り, 10 点刻みの度数分布を数える hist.c (5 点)',
      spec: '<ul><li><code class="ic">void score_gen(int s[ ], int n)</code> — 各点数を <b><code class="ic">rand() % 51 + rand() % 51</code></b> (0〜100 点, 山形の分布) として s[0]〜s[n-1] に順に格納する。</li><li><code class="ic">void score_hist(int s[ ], int n, int c[ ])</code> — 10 点刻み (0–9, 10–19, …, 80–89) で c[0]〜c[8] に数える。ただし <b>90〜100 点</b>はまとめて c[9] (<code class="ic">N_CLASS − 1</code>) に入れる。</li></ul><div class="callout warn" style="margin-top:10px">histmain.c は c[ ] にゴミを入れてから score_hist を呼ぶ。</div>',
      starter: { 'hist.c': R`#include <stdlib.h>
#include "hist.h"

void score_gen(int s[], int n)
{
  /* TODO */
}

void score_hist(int s[], int n, int c[])
{
  /* TODO */
}
` },
      solution: pick('hist.c'),
      tests: vis('hist', 'hist'),
      check: (outs, src, CL) => hidden('hist', ['histmain.c', 'hist.c'], src, CL, (s) => {
        const c = strip(s['hist.c']);
        if (/srand/.test(c)) return 'srand を呼ぶと乱数列が変わり期待値と合わなくなる。';
        if (!/N_CLASS/.test(c)) return '階級の数は数値ではなくマクロ N_CLASS を使おう。';
        return null;
      }),
      hints: ['階級番号は <code class="ic">k = s[i] / 10;</code> (整数の割り算)。', '100 点は k = 10 になって<b>配列の外</b>。<code class="ic">if (k &gt;= N_CLASS) k = N_CLASS - 1;</code>', 'カウンタは最初に 0 クリア。rand() の呼び出し順を変えない (1 人につき rand() を 2 回)。'],
      summary: '0〜100 点の点数を乱数で生成する score_gen と, 10 点刻みの度数分布を\n数える score_hist を hist.c に作成した。',
      reportTitle: '第3回 問 3',
    },
    {
      id: 'r3q4', set: 3, label: '3-問4', short: '行和・列和と行の入れ替え', files: ['matrow.c'], given: pick('matrow.h', 'matrowmain.c', 'matrowio.c'), link: ['matrowmain.c', 'matrowio.c', 'matrow.c'], gcc: 'matrowmain.c matrowio.c matrow.c',
      title: '2 次元配列の行和・列和と, 行の入れ替え matrow.c (5 点)',
      spec: '<p><code class="ic">matrow.h</code> (N = 5) に従い, 次の 2 関数を <code class="ic">matrow.c</code> に作成せよ。入出力は配布の <code class="ic">matrowio.c</code>。</p><ul><li><code class="ic">void row_col_sum(int n, double A[N][N], double r[N], double c[N])</code> — 各行の和を r[i], 各列の和を c[j] に格納する。</li><li><code class="ic">void row_swap(int n, double A[N][N], int i, int k)</code> — A の i 行目と k 行目を入れ替える (<b>A 以外の配列は使わない</b>)。i = k のときは何も変わらない。</li></ul>',
      starter: { 'matrow.c': R`#include "matrow.h"

void row_col_sum(int n, double A[N][N], double r[N], double c[N])
{
  /* TODO */
}

void row_swap(int n, double A[N][N], int i, int k)
{
  /* TODO */
}
` },
      solution: pick('matrow.c'),
      tests: vis('matrow', 'matrow'),
      check: (outs, src, CL) => hidden('matrow', ['matrowmain.c', 'matrowio.c', 'matrow.c'], src, CL, (s) => {
        const c = strip(s['matrow.c']);
        if (/double\s+\w+\s*\[/.test(c.replace(/\(([^)]*)\)/g, ''))) return 'row_swap の中で作業用の配列を宣言していませんか? 交換には double 型の変数 tmp 1 つで足りる。';
        if (/<\s*N\s*;/.test(c)) return 'ループの上限が N になっていませんか? 上限は引数 n。';
        return null;
      }),
      hints: ['r[i], c[j] は<b>先に 0 クリア</b> (main がゴミを入れている)。', '1 回の 2 重ループで <code class="ic">r[i] += A[i][j]; c[j] += A[i][j];</code> と両方足せる。', '行の入れ替えは列 j ごとに tmp で交換 (課題 4-1 (5) と同じ 3 行)。i = k でも正しく動く。'],
      summary: '行列の各行・各列の和を求める row_col_sum と, 2 つの行を入れ替える\nrow_swap を matrow.c に作成し, matrowmain.c, matrowio.c とリンクした。',
      reportTitle: '第3回 問 4',
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
